using System.Net;
using System.Net.WebSockets;
using ccxt;

namespace Tests;

// native cs test, hand-written - pins the teardown half of the base keepalive:
// when WebSocketClient.PingLoop decides the peer is dead (lastPong older than
// keepAlive * maxPingPongMisses) it must not only raise RequestTimeout and
// leave the loop, it must close the socket. before this test the timeout left
// the ClientWebSocket OPEN: onError rejected the futures and the exchange
// dropped the client from its registry, the next watch call dialed a
// replacement, and the abandoned socket's Receiving task kept pulling frames
// and dispatching them into the shared caches next to the new one.
// ts/src/base/ws/Client.ts got the same fix in ccxt/ccxt#30293 and flagged
// this client (hand-written, not transpiled) as carrying the same gap.
//
// a local HttpListener websocket server stands in for the venue so the test is
// offline and deterministic; keepAlive is small so the loop ticks within the
// test, and lastPong is pinned in the past so the first tick trips the timeout.

public partial class BaseTest
{
    // one-connection websocket server: accepts the upgrade, then sits in a
    // receive loop so it observes the client's close handshake (if any)
    private sealed class KeepAliveProbeServer : IDisposable
    {
        public readonly string url;
        public volatile WebSocket? serverSide;
        public volatile bool sawClose = false;
        public volatile int framesSentAfterTimeout = 0;
        private readonly HttpListener listener = new HttpListener();
        private readonly CancellationTokenSource cts = new CancellationTokenSource();
        public volatile bool streamAfterTimeout = false;

        public KeepAliveProbeServer()
        {
            var port = FreePort();
            this.url = "ws://127.0.0.1:" + port + "/";
            this.listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
            this.listener.Start();
            _ = Task.Run(this.Serve);
        }

        private static int FreePort()
        {
            var probe = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
            probe.Start();
            var port = ((IPEndPoint)probe.LocalEndpoint).Port;
            probe.Stop();
            return port;
        }

        private async Task Serve()
        {
            try
            {
                var context = await this.listener.GetContextAsync();
                if (!context.Request.IsWebSocketRequest)
                {
                    context.Response.StatusCode = 400;
                    context.Response.Close();
                    return;
                }
                var wsContext = await context.AcceptWebSocketAsync(null);
                this.serverSide = wsContext.WebSocket;
                var buffer = new byte[4096];
                // a venue keeps streaming whether or not the client thinks the
                // connection is dead: after the timeout is armed, push frames
                // and count how many the client's Receiving task still takes
                _ = Task.Run(async () =>
                {
                    while (!this.cts.IsCancellationRequested)
                    {
                        await Task.Delay(10);
                        if (this.streamAfterTimeout && this.serverSide.State == WebSocketState.Open)
                        {
                            try
                            {
                                await this.serverSide.SendAsync(System.Text.Encoding.UTF8.GetBytes("{\"tick\":1}"), WebSocketMessageType.Text, true, this.cts.Token);
                                this.framesSentAfterTimeout++;
                            }
                            catch (Exception) { }
                        }
                    }
                });
                while (this.serverSide.State == WebSocketState.Open || this.serverSide.State == WebSocketState.CloseReceived)
                {
                    var result = await this.serverSide.ReceiveAsync(new ArraySegment<byte>(buffer), this.cts.Token);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        this.sawClose = true;
                        await this.serverSide.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                        break;
                    }
                }
            }
            catch (Exception) { }
        }

        public void Dispose()
        {
            this.cts.Cancel();
            try { this.serverSide?.Abort(); } catch (Exception) { }
            try { this.listener.Stop(); } catch (Exception) { }
        }
    }

    private static async Task WaitUntil(Func<bool> condition, int timeoutMs, string what)
    {
        var deadline = DateTime.UtcNow.AddMilliseconds(timeoutMs);
        while (!condition())
        {
            if (DateTime.UtcNow > deadline)
            {
                throw new Exception("timed out waiting for: " + what);
            }
            await Task.Delay(20);
        }
    }

    async public Task testWsClientKeepAliveTimeoutClosesTheSocket()
    {
        using var server = new KeepAliveProbeServer();
        var errors = new List<object>();
        var closes = 0;
        var handled = 0;
        // the error delegate mirrors what the exchange bridge does on onError
        // (Exchange.WsBridge.CleanupClients -> rejectFutures): reject every
        // pending future with the error
        var client = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { Interlocked.Increment(ref handled); }, null, (c, e) => { Interlocked.Increment(ref closes); }, (c, e) => { lock (errors) { errors.Add(e); } c.reject(e); }, false, 50);
        await client.connect();
        await WaitUntil(() => server.serverSide != null && server.serverSide.State == WebSocketState.Open, 3000, "the server to accept the socket");
        Assert(client.webSocket.State == WebSocketState.Open, "precondition: the client socket must be open");
        Assert(client.isConnected, "precondition: the client must report connected");
        // pin liveness in the past so the next keepalive tick trips the timeout
        client.lastPong = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - 50 * client.maxPingPongMisses - 1000;
        var pending = client.future("probe");
        await WaitUntil(() => errors.Count > 0, 3000, "the keepalive timeout to fire");
        object first;
        lock (errors) { first = errors[0]; }
        Assert(first is RequestTimeout, "the keepalive death must be a RequestTimeout, got " + (first?.GetType()?.Name ?? "null"));
        await WaitUntil(() => pending.task.IsCompleted, 1000, "the pending future to settle");
        Assert(pending.task.IsFaulted, "the pending future must be rejected by the timeout");
        // the socket must not stay open after the timeout
        await WaitUntil(() => client.webSocket.State != WebSocketState.Open, 3000, "the client socket to leave the OPEN state (still " + client.webSocket.State + ")");
        await WaitUntil(() => server.sawClose, 3000, "the server to receive the client's close frame");
        Assert(server.sawClose, "the server side must see the close");
        // and a venue that keeps streaming must not reach the exchange through
        // the torn-down client: no frame dispatched after the timeout
        var handledAtTimeout = handled;
        server.streamAfterTimeout = true;
        await Task.Delay(300);
        Assert(handled == handledAtTimeout, "a torn-down client must not dispatch frames into handleMessage, saw " + (handled - handledAtTimeout) + " after the timeout");
        Assert(server.framesSentAfterTimeout == 0, "the venue must not be able to push frames into a closed socket, sent " + server.framesSentAfterTimeout);
    }

    async public Task testWsClientKeepAliveHealthyPeerKeepsTheSocket()
    {
        // the guard: a socket whose frames keep flowing must not be closed by
        // the same tick
        using var server = new KeepAliveProbeServer();
        object? captured = null;
        var client = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { }, null, (c, e) => { }, (c, e) => { captured = e; }, false, 50);
        await client.connect();
        await WaitUntil(() => server.serverSide != null && server.serverSide.State == WebSocketState.Open, 3000, "the server to accept the socket");
        server.streamAfterTimeout = true; // frames every 10 ms, well inside the 100 ms kill window (keepAlive 50 x 2 misses)
        client.maxPingPongMisses = 2;
        await Task.Delay(500);
        Assert(captured == null, "a socket with inbound frames must never be killed by the keepalive, got " + (captured?.GetType()?.Name ?? "null"));
        Assert(client.webSocket.State == WebSocketState.Open, "a healthy socket must stay OPEN across several keepalive ticks, got " + client.webSocket.State);
        Assert(!server.sawClose, "no close frame may be sent to a healthy peer");
        await client.Close();
    }

    async public Task testWsClientKeepAliveTimeout()
    {
        await testWsClientKeepAliveTimeoutClosesTheSocket();
        await testWsClientKeepAliveHealthyPeerKeepsTheSocket();
    }
}
