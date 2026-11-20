using System.Net.WebSockets;
using ccxt;

namespace Tests;

// native cs test, hand-written - pins https://github.com/ccxt/ccxt/issues/29412:
// PingLoop runs detached from every caller, and its catch block hands the error
// to WebSocketClient.onError, which runs the onError callback - the exchange's
// virtual onError (Exchange.WsBridge) and any override of it. while PingLoop was
// `async void`, a throw from that callback escaped onto the thread pool and
// terminated the whole host process; on the keepalive-timeout path it also
// skipped the Close() that follows, leaving the dead socket open.
//
// on the old code these cases fail by crashing the test process with
// "Unhandled exception ... at WebSocketClient.PingLoop()".

public partial class BaseTest
{
    // stands in for a venue (or a user subclass) whose onError throws
    private sealed class ThrowingOnErrorExchange : ccxt.pro.binance
    {
        public int calls = 0;

        public override void onError(WebSocketClient client, object error = null)
        {
            Interlocked.Increment(ref this.calls);
            base.onError(client, error);
            throw new Exception("onError override threw");
        }
    }

    // throws before it reaches base.onError, so the base cleanup never runs from
    // inside the override
    private sealed class ThrowsBeforeBaseOnErrorExchange : ccxt.pro.binance
    {
        public override void onError(WebSocketClient client, object error = null)
        {
            throw new Exception("onError override threw before base.onError");
        }
    }

    async public Task testWsClientPingLoopErrors()
    {
        testClientOnErrorSurvivesThrowingCallback();
        await testPingLoopTimeoutClosesTheSocketWhenTheCallbackThrows();
        await testPingLoopSurvivesThrowingCallbackOnPingFailure();
        await testPingLoopSurvivesThrowingExchangeOnError();
        testThrowingOnErrorOverrideStillUnregistersTheClient();
        await testPingLoopThrowingOnErrorOverrideStillUnregistersTheClient();
    }

    // reconnecting is caller-driven: the next watch call asks exchange.client(url),
    // which reuses whatever is registered under the url. a retired client left in
    // the registry answers every later watch with its old error, so the caller
    // never gets a fresh connection
    void AssertReplacedOnNextWatch(BaseExchange exchange, BaseExchange.WebSocketClient dead)
    {
        Assert(!exchange.clients.Values.Contains(dead), "the errored client must be unregistered even when an onError override throws before base.onError");
        var next = exchange.client(dead.url);
        Assert(!object.ReferenceEquals(next, dead), "the next watch call must get a fresh client, not the retired one");
        Assert(next.error == null, "the replacement client must not be retired");
    }

    void testThrowingOnErrorOverrideStillUnregistersTheClient()
    {
        // the Receiving() / Connect() shape: the transport error goes straight to client.onError
        var exchange = new ThrowsBeforeBaseOnErrorExchange();
        var client = exchange.client("wss://test.ccxt.com/29412-before-base");
        var pending = client.future("trade::BTC/USDT");
        client.onError(new NetworkError("receive failed"));
        Assert(pending.task.IsFaulted && pending.task.Exception?.InnerException is NetworkError, "the pending future must be rejected with the transport error");
        AssertReplacedOnNextWatch(exchange, client);
    }

    async Task testPingLoopThrowingOnErrorOverrideStillUnregistersTheClient()
    {
        // the same through the ping loop, where a throw used to abort the process
        var exchange = new ThrowsBeforeBaseOnErrorExchange();
        var client = exchange.client("wss://test.ccxt.com/29412-before-base-ping");
        var pending = client.future("trade::BTC/USDT");
        client.keepAlive = 50;
        client.ping = (c) => throw new NetworkError("ping send failed");
        client.isConnected = true;
        await RunPingLoop(client);
        await WaitUntil(() => pending.task.IsCompleted, 3000, "the pending future to settle");
        Assert(pending.task.IsFaulted && pending.task.Exception?.InnerException is NetworkError, "the pending future must be rejected with the ping error");
        AssertReplacedOnNextWatch(exchange, client);
    }

    // compiles against both `void PingLoop()` and `Task PingLoop()`: Task.Run
    // binds the lambda to Func<Task> once PingLoop returns a Task, and then
    // awaits the loop itself
    private static async Task RunPingLoop(BaseExchange.WebSocketClient client)
    {
        await Task.Run(() => client.PingLoop()).WaitAsync(TimeSpan.FromSeconds(5));
    }

    async Task testPingLoopSurvivesThrowingCallbackOnPingFailure()
    {
        // ping() / send() failing on a half-dead socket lands in PingLoop's catch
        var callbacks = 0;
        var client = new BaseExchange.WebSocketClient("ws://localhost:1234", null, (c, m) => { }, (c) => throw new NetworkError("ping send failed"), null, (c, e) =>
        {
            Interlocked.Increment(ref callbacks);
            throw new Exception("onError callback threw");
        }, false, 50);
        var pending = client.future("trade::BTC/USDT");
        client.isConnected = true;
        await RunPingLoop(client);
        await WaitUntil(() => pending.task.IsCompleted, 3000, "the pending future to settle");
        await Task.Delay(100); // the old async void rethrow lands on the thread pool right after
        Assert(pending.task.IsFaulted && pending.task.Exception?.InnerException is NetworkError, "the pending future must be rejected with the ping error");
        Assert(client.error is NetworkError, "the client must keep the ping error as its terminal error");
        Assert(callbacks == 1, "the onError callback must run exactly once, ran " + callbacks);
        Assert(!client.isConnected, "the client must be marked disconnected");
    }

    async Task testPingLoopSurvivesThrowingExchangeOnError()
    {
        // the real wiring: exchange.client() installs the exchange's virtual onError
        var exchange = new ThrowingOnErrorExchange();
        var client = exchange.client("wss://test.ccxt.com/29412");
        var pending = client.future("trade::BTC/USDT");
        client.keepAlive = 50;
        client.ping = (c) => throw new NetworkError("ping send failed");
        client.isConnected = true;
        await RunPingLoop(client);
        await WaitUntil(() => pending.task.IsCompleted, 3000, "the pending future to settle");
        await Task.Delay(100);
        Assert(pending.task.IsFaulted && pending.task.Exception?.InnerException is NetworkError, "the pending future must be rejected with the ping error");
        Assert(exchange.calls == 1, "the exchange onError must run exactly once, ran " + exchange.calls);
        Assert(!exchange.clients.ContainsKey(client.url), "the errored client must be unregistered");
    }

    async Task testPingLoopTimeoutClosesTheSocketWhenTheCallbackThrows()
    {
        // the keepalive timeout calls onError and then Close(): a throwing
        // callback must not skip the Close() and leave the dead socket open
        using var server = new KeepAliveProbeServer();
        var callbacks = 0;
        var client = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { }, null, (c, e) => { }, (c, e) =>
        {
            Interlocked.Increment(ref callbacks);
            throw new Exception("onError callback threw");
        }, false, 50);
        var timeoutMisses = client.maxPingPongMisses;
        client.maxPingPongMisses = int.MaxValue; // hold the deadline until setup is done
        var pending = client.future("probe");
        await client.connect().WaitAsync(TimeSpan.FromSeconds(3));
        await WaitUntil(() => server.serverSide != null && server.serverSide.State == WebSocketState.Open, 3000, "the server to accept the socket");
        Assert(client.webSocket.State == WebSocketState.Open, "precondition: the client socket must be open");
        // pin liveness in the past so the next keepalive tick trips the timeout
        client.lastPong = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - 50 * timeoutMisses - 1000;
        client.maxPingPongMisses = timeoutMisses;
        await WaitUntil(() => pending.task.IsCompleted, 3000, "the keepalive timeout to reject the pending future");
        Assert(pending.task.Exception?.InnerException is RequestTimeout, "the pending future must be rejected with the RequestTimeout");
        await WaitUntil(() => server.sawClose, 3000, "the server to receive the client's close frame (client socket " + client.webSocket.State + ")");
        await Task.Delay(100);
        Assert(callbacks == 1, "the onError callback must run exactly once, ran " + callbacks);
    }

    void testClientOnErrorSurvivesThrowingCallback()
    {
        // Receiving() and Connect() report through the same onError: it must
        // finish the cleanup and return even when the callback throws
        var client = new BaseExchange.WebSocketClient("ws://localhost:1234", null, (c, m) => { }, null, null, (c, e) => throw new Exception("onError callback threw"), false, 50);
        client.subscriptions["orders"] = true;
        var pending = client.future("orders::BTC/USDT");
        try
        {
            client.onError(new NetworkError("receive failed"));
        }
        catch (Exception e)
        {
            Assert(false, "WebSocketClient.onError must not rethrow the callback's exception, got: " + e.Message);
        }
        Assert(pending.task.IsFaulted && pending.task.Exception?.InnerException is NetworkError, "the pending future must be rejected with the transport error");
        Assert(client.subscriptions.Count == 0, "subscriptions must be cleared so the next watch call resubscribes");
        Assert(client.error is NetworkError, "the client must keep the transport error as its terminal error");
    }
}
