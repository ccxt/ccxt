using ccxt;

namespace Tests;

// native cs test for the ws keepalive liveness policy: .NET ClientWebSocket
// neither surfaces incoming pong frames nor can send unsolicited pings, so
// the cs client counts any inbound frame as liveness (TryHandleMessage
// refreshes lastPong). Without that, lastPong freezes at the ping loop's
// first iteration and every protocol-ping exchange is deterministically
// disconnected at exactly keepAlive * maxPingPongMisses while healthy.

public partial class BaseTest
{
    async public Task testWsClientKeepAliveLiveness()
    {
        // 1. inbound frames refresh liveness through the receive choke point
        var client = new BaseExchange.WebSocketClient("ws://localhost:1234", null, (c, m) => { });
        Assert(client.lastPong == null, "lastPong must start unset");
        client.TryHandleMessage("{\"any\":\"frame\"}");
        Assert(client.lastPong != null, "an inbound frame must refresh lastPong");
        var first = Convert.ToInt64(client.lastPong);
        await Task.Delay(20);
        client.TryHandleMessage("not-json is fine too");
        Assert(Convert.ToInt64(client.lastPong) > first, "every inbound frame must refresh lastPong");
        // the raw-binary receive arm (!decompressBinary) bypasses TryHandleMessage
        // and calls markAlive directly, prove the shared touch point works
        var beforeRaw = Convert.ToInt64(client.lastPong);
        await Task.Delay(20);
        client.markAlive();
        Assert(Convert.ToInt64(client.lastPong) > beforeRaw, "markAlive must refresh lastPong for the raw-binary route");

        // 2. a silent connection is killed at the window with a RequestTimeout,
        // not a bare Exception
        object captured = null;
        var silent = new BaseExchange.WebSocketClient("ws://localhost:1234", null, (c, m) => { }, null, null, (c, e) => { captured = e; }, false, 50);
        silent.isConnected = true;
        silent.PingLoop();
        for (var i = 0; i < 100 && captured == null; i++)
        {
            await Task.Delay(50);
        }
        silent.isConnected = false;
        Assert(captured != null, "a silent connection must be disconnected by the keepalive window");
        Assert(captured is RequestTimeout, "the keepalive death must be a RequestTimeout, got " + (captured?.GetType()?.Name ?? "null"));

        // 3. a connection with flowing frames survives well past the window
        object err = null;
        var busy = new BaseExchange.WebSocketClient("ws://localhost:1234", null, (c, m) => { }, null, null, (c, e) => { err = e; }, false, 200);
        busy.isConnected = true;
        busy.PingLoop();
        for (var i = 0; i < 12; i++)
        {
            busy.TryHandleMessage("{\"tick\":" + i + "}");
            await Task.Delay(50); // staleness stays ~50ms, far below the 600ms kill window (keepAlive 200 x 3 misses)
        }
        busy.isConnected = false;
        Assert(err == null, "a connection with inbound frames must never be killed by the keepalive");
    }
}
