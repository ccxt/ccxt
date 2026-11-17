using ccxt;

namespace Tests;

// native cs test, hand-written - a caller's retry must reach a fresh client.
// Future's TaskCompletionSource runs awaiter continuations inline, so the
// caller's `catch` and its next watch call run on the thread that rejects the
// futures: the ping loop, the receive loop or a close path. if the dead client
// is still registered at that moment, exchange.client(url) hands it back and
// the retry never reconnects:
// - after an error, the retired client rejects the retry synchronously, so a
//   loop with no delay spins on that thread and the cleanup that would
//   unregister the client never runs
// - after a remote close, the client is not retired yet, so the retry attaches
//   a future to it that nothing will ever settle and hangs
// the exchange must unregister the client before any future is rejected.
// (js is not affected: its rejections settle after onErrorCallback returns.)

public partial class BaseTest
{
    async public Task testWsClientInlineRetry()
    {
        await testInlineRetryAfterErrorGetsAFreshClient();
        await testInlineRetryAfterRemoteCloseGetsAFreshClient();
    }

    // a client that looks connected, without a socket, so a disconnect can be
    // driven offline. a real dial to the url fails fast (nothing listens on port 1)
    private static BaseExchange.WebSocketClient FakeConnectedClient(BaseExchange exchange, string url)
    {
        var client = exchange.client(url);
        client.keepAlive = null;
        client.startedConnecting = true;
        client.connected.TrySetResult(true);
        client.isConnected = true;
        return client;
    }

    // a caller's reconnect loop with no delay between attempts; records, per
    // attempt, the client its watch call was handed
    private static async Task<List<BaseExchange.WebSocketClient>> RetryWithoutDelay(BaseExchange exchange, string url, int attempts)
    {
        var used = new List<BaseExchange.WebSocketClient>();
        for (var i = 0; i < attempts; i++)
        {
            used.Add(exchange.client(url)); // the instance watch() gets from the same GetOrAdd
            try
            {
                await exchange.watch(url, "trade::BTC/USDT", null, "trade::BTC/USDT");
            }
            catch (Exception)
            {
            }
        }
        return used;
    }

    private static void AssertRetriesLeftTheDeadClient(List<BaseExchange.WebSocketClient> used, BaseExchange.WebSocketClient dead, string path)
    {
        var onDead = used.Count(c => object.ReferenceEquals(c, dead));
        Assert(onDead == 1, "after " + path + " only the original watch may use the dead client, but " + onDead + " of " + used.Count + " attempts got it back from exchange.client(url)");
    }

    async Task testInlineRetryAfterErrorGetsAFreshClient()
    {
        var exchange = new ccxt.pro.binance();
        var url = "ws://127.0.0.1:1/inline-retry-error";
        var dead = FakeConnectedClient(exchange, url);
        var loop = RetryWithoutDelay(exchange, url, 3);
        await Task.Delay(50); // the first watch is now pending on the dead client
        await Task.Run(() => dead.onError(new RequestTimeout("ping-pong keepalive missed")));
        var used = await loop.WaitAsync(TimeSpan.FromSeconds(30));
        AssertRetriesLeftTheDeadClient(used, dead, "an error");
    }

    async Task testInlineRetryAfterRemoteCloseGetsAFreshClient()
    {
        var exchange = new ccxt.pro.binance();
        var url = "ws://127.0.0.1:1/inline-retry-close";
        var dead = FakeConnectedClient(exchange, url);
        var loop = RetryWithoutDelay(exchange, url, 3);
        await Task.Delay(50);
        await Task.Run(() => exchange.onClose(dead, null)); // what Receiving() does on a close frame
        List<BaseExchange.WebSocketClient> used = null;
        try
        {
            used = await loop.WaitAsync(TimeSpan.FromSeconds(30));
        }
        catch (TimeoutException)
        {
            Assert(false, "after a remote close a retry hung on the dead client instead of reconnecting");
        }
        AssertRetriesLeftTheDeadClient(used, dead, "a remote close");
    }
}
