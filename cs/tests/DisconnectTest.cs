using ccxt;

namespace Tests;

// regression tests for the disconnect cleanup path: when a connection drops every
// pending watcher must be rejected, otherwise `await watch*()` hangs forever

public partial class BaseTest
{
    // how long a rejected future is given to surface before we call it a hang
    const int disconnectTimeout = 5000;

    public async Task testWsDisconnect()
    {
        await this.testDisconnectRejectsFutureWithDistinctMessageHash();
        await this.testDisconnectRejectsFutureWithSharedHash();
        await this.testDisconnectRejectsFutureWithoutSubscription();
        await this.testDisconnectConcurrentCleanupRejectsEveryFuture();
        await this.testDisconnectKeepsTheCloseError();
    }

    async Task testDisconnectKeepsTheCloseError()
    {
        // the error the cleanup pass carries must reach every watcher, so callers can
        // tell a dropped connection from anything else and retry
        var exchange = new ccxt.pro.binance();
        var client = exchange.client("wss://test.ccxt.com/disconnect-error");
        var future = client.future("orders::BTC/USDT");
        exchange.onClose(client, new ccxt.NetworkError("connection closed by remote server"));
        Assert(await Settled(future), "a future was left pending after a close");
        try
        {
            await future.task;
            Assert(false, "future should have been rejected");
        }
        catch (ccxt.NetworkError e)
        {
            Assert(e.Message.IndexOf("closed by remote server") >= 0, "the close error must reach the caller, got: " + e.Message);
        }
    }

    static async Task<bool> Settled(BaseExchange.Future future)
    {
        var completed = await Task.WhenAny(future.task, Task.Delay(disconnectTimeout));
        return completed == (Task)future.task;
    }

    async Task testDisconnectRejectsFutureWithDistinctMessageHash()
    {
        // the common shape: one subscription feeds many message hashes
        // (subscribeHash 'orders', messageHash 'orders::BTC/USDT')
        var exchange = new ccxt.pro.binance();
        var client = exchange.client("wss://test.ccxt.com/disconnect-distinct");
        client.subscriptions["orders"] = true;
        var future = client.future("orders::BTC/USDT");
        exchange.onError(client, new ccxt.NetworkError("connection lost"));
        Assert(await Settled(future), "a future whose message hash is not a subscription hash was left pending after a disconnect");
        try
        {
            await future.task;
            Assert(false, "future should have been rejected");
        }
        catch (ccxt.NetworkError)
        {
        }
    }

    async Task testDisconnectRejectsFutureWithSharedHash()
    {
        // exchanges that pass the same hash as both subscribe and message hash
        // must keep working exactly as before
        var exchange = new ccxt.pro.binance();
        var client = exchange.client("wss://test.ccxt.com/disconnect-shared");
        client.subscriptions["trade::BTC/USDT"] = true;
        var future = client.future("trade::BTC/USDT");
        exchange.onError(client, new ccxt.NetworkError("connection lost"));
        Assert(await Settled(future), "a subscription-keyed future was left pending after a disconnect");
        try
        {
            await future.task;
            Assert(false, "future should have been rejected");
        }
        catch (ccxt.NetworkError)
        {
        }
        Assert(client.subscriptions.Count == 0, "subscriptions must be cleared so the next watch call resubscribes");
    }

    async Task testDisconnectRejectsFutureWithoutSubscription()
    {
        // request/response style watchers (watchOrderBookSnapshot, createOrderWs, ...)
        // register a future keyed by request id with no subscription at all
        var exchange = new ccxt.pro.binance();
        var client = exchange.client("wss://test.ccxt.com/disconnect-nosub");
        var future = client.future("1712345678");
        exchange.onError(client, new ccxt.NetworkError("connection lost"));
        Assert(await Settled(future), "a future with no matching subscription was left pending after a disconnect");
        try
        {
            await future.task;
            Assert(false, "future should have been rejected");
        }
        catch (ccxt.NetworkError)
        {
        }
    }

    async Task testDisconnectConcurrentCleanupRejectsEveryFuture()
    {
        // the ping loop and the receive loop failing at the same time must still
        // reject everything exactly once, without throwing
        var exchange = new ccxt.pro.binance();
        var client = exchange.client("wss://test.ccxt.com/disconnect-concurrent");
        var futures = new List<BaseExchange.Future>();
        for (var i = 0; i < 50; i++)
        {
            client.subscriptions["orders"] = true;
            futures.Add(client.future("orders::SYM" + i));
        }
        var errors = new System.Collections.Concurrent.ConcurrentBag<Exception>();
        var passes = new Task[4];
        for (var i = 0; i < passes.Length; i++)
        {
            passes[i] = Task.Run(() =>
            {
                try
                {
                    exchange.onError(client, new ccxt.NetworkError("connection lost"));
                }
                catch (Exception e)
                {
                    errors.Add(e);
                }
            });
        }
        await Task.WhenAll(passes);
        Assert(errors.IsEmpty, "concurrent cleanup threw: " + (errors.IsEmpty ? "" : errors.First().ToString()));
        foreach (var future in futures)
        {
            Assert(await Settled(future), "a future was left pending after a concurrent disconnect cleanup");
            try { await future.task; } catch (Exception) { }
        }
    }
}
