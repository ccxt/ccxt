using System.Net;
using System.Net.WebSockets;
using System.Reflection;
using System.Text;
using ccxt;

namespace Tests;

public partial class BaseTest
{
    private sealed class CloseProbeServer : IDisposable
    {
        private readonly HttpListener listener = new();
        private readonly TaskCompletionSource<bool> accepted = new(TaskCreationOptions.RunContinuationsAsynchronously);
        private readonly TaskCompletionSource<bool> closeReceived = new(TaskCreationOptions.RunContinuationsAsynchronously);
        private readonly CancellationTokenSource cancellation = new();
        private readonly WebSocket?[] serverSocket = new WebSocket?[1];
        private readonly Task serverTask;
        public readonly string url;

        public CloseProbeServer()
        {
            var probe = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
            probe.Start();
            var port = ((IPEndPoint)probe.LocalEndpoint).Port;
            probe.Stop();
            this.url = "ws://127.0.0.1:" + port + "/";
            this.listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
            this.listener.Start();
            this.serverTask = this.Serve();
        }

        private async Task Serve()
        {
            try
            {
                var context = await this.listener.GetContextAsync();
                var upgraded = await context.AcceptWebSocketAsync(null);
                this.serverSocket[0] = upgraded.WebSocket;
                this.accepted.TrySetResult(true);
                var buffer = new byte[1024];
                while (!this.cancellation.IsCancellationRequested)
                {
                    var result = await upgraded.WebSocket.ReceiveAsync(new ArraySegment<byte>(buffer), this.cancellation.Token);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        this.closeReceived.TrySetResult(true);
                        if (upgraded.WebSocket.State == WebSocketState.CloseReceived)
                        {
                            await upgraded.WebSocket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, string.Empty, this.cancellation.Token);
                        }
                        return;
                    }
                }
            }
            catch (HttpListenerException) when (this.cancellation.IsCancellationRequested) { }
            catch (OperationCanceledException) when (this.cancellation.IsCancellationRequested) { }
        }

        public async Task WaitAccepted() => await this.accepted.Task.WaitAsync(TimeSpan.FromSeconds(3));

        public async Task WaitCloseReceived() => await this.closeReceived.Task.WaitAsync(TimeSpan.FromSeconds(3));

        public async Task Send(string message)
        {
            var socket = this.serverSocket[0] ?? throw new Exception("the websocket server has not accepted a client");
            await socket.SendAsync(Encoding.UTF8.GetBytes(message), WebSocketMessageType.Text, true, this.cancellation.Token);
        }

        public async Task CloseFromPeer()
        {
            var socket = this.serverSocket[0] ?? throw new Exception("the websocket server has not accepted a client");
            await socket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, string.Empty, this.cancellation.Token);
        }

        public void Dispose()
        {
            this.cancellation.Cancel();
            this.serverSocket[0]?.Abort();
            this.listener.Close();
            this.serverTask.GetAwaiter().GetResult();
            this.cancellation.Dispose();
        }
    }

    private static Task ReadOwnedTask(BaseExchange.WebSocketClient client, string name)
    {
        var field = typeof(BaseExchange.WebSocketClient).GetField(name, BindingFlags.Instance | BindingFlags.NonPublic);
        return (Task)field?.GetValue(client) ?? throw new Exception("missing owned task: " + name);
    }

    private static Task? ReadOptionalOwnedTask(BaseExchange.WebSocketClient client, string name)
    {
        var field = typeof(BaseExchange.WebSocketClient).GetField(name, BindingFlags.Instance | BindingFlags.NonPublic);
        return (Task?)field?.GetValue(client);
    }

    private static async Task WaitForSignal(ManualResetEventSlim signal, string name)
    {
        if (!await Task.Run(() => signal.Wait(TimeSpan.FromSeconds(3))))
        {
            throw new Exception("timed out waiting for " + name);
        }
    }

    public async Task testWsClientCloseLifecycle()
    {
        var client = new BaseExchange.WebSocketClient("ws://localhost:1234", null, (c, m) => { });
        client.rejections["orphan"] = new NetworkError("orphan");
        await client.Close();
        Assert(client.rejections.Count == 0, "Close must clear orphaned rejections");
        Assert(client.connected.Task.IsFaulted, "Close must settle the pending connection task");
        Assert(client.future("after-close").task.IsFaulted, "futures created after Close must be rejected");

        var afterClose = client.connect();
        Assert(afterClose.IsFaulted, "connect after Close must fail instead of reusing the old connection task");
        Exception? sendError = null;
        try
        {
            await client.send("after-close");
        }
        catch (Exception ex)
        {
            sendError = ex;
        }
        Assert(sendError is WebSocketException, "send after Close must report that the transport is unavailable");

        using var server = new CloseProbeServer();
        using var receiveEntered = new ManualResetEventSlim(false);
        using var releaseReceive = new ManualResetEventSlim(false);
        var connected = new BaseExchange.WebSocketClient(server.url, null, (c, m) =>
        {
            receiveEntered.Set();
            if (!releaseReceive.Wait(TimeSpan.FromSeconds(5)))
            {
                throw new TimeoutException("the receive callback was not released");
            }
        });
        connected.keepAlive = 30000;
        await connected.connect().WaitAsync(TimeSpan.FromSeconds(3));
        await server.WaitAccepted();
        var pingTask = ReadOwnedTask(connected, "pingTask");
        var receiveTask = ReadOwnedTask(connected, "receiveTask");
        await server.Send("{\"hold\":true}");
        await WaitForSignal(receiveEntered, "the receive callback");
        var closeTask = connected.Close();
        Assert(ReferenceEquals(closeTask, connected.Close()), "concurrent Close calls must share completion");
        await server.WaitCloseReceived();
        var closeWaitedForReceive = !closeTask.IsCompleted;
        releaseReceive.Set();
        await closeTask;
        Assert(closeWaitedForReceive, "Close must wait for an active receive callback");
        Assert(pingTask.IsCompleted, "Close must await the ping loop");
        Assert(receiveTask.IsCompleted, "Close must await the receive loop");
        Assert(connected.connect().IsFaulted, "connect after an established client is closed must fail");
    }

    public async Task testWsClientCloseWaitsForPing()
    {
        using var server = new CloseProbeServer();
        using var pingEntered = new ManualResetEventSlim(false);
        using var releasePing = new ManualResetEventSlim(false);
        using var closeStarted = new ManualResetEventSlim(false);
        var client = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { }, (c) =>
        {
            pingEntered.Set();
            if (!releasePing.Wait(TimeSpan.FromSeconds(5)))
            {
                throw new TimeoutException("the ping callback was not released");
            }
            return null;
        }, null, (c, e) => closeStarted.Set(), keepA: 10);
        await client.connect().WaitAsync(TimeSpan.FromSeconds(3));
        await server.WaitAccepted();
        await WaitForSignal(pingEntered, "the ping callback");
        var close = client.Close();
        await WaitForSignal(closeStarted, "the close callback");
        var closeWaitedForPing = !close.IsCompleted;
        releasePing.Set();
        await close;
        await server.WaitCloseReceived();
        Assert(closeWaitedForPing, "Close must wait for an active ping callback");
        Assert(ReadOwnedTask(client, "pingTask").IsCompleted, "the ping task must settle before Close completes");
    }

    public async Task testWsClientRemoteCloseRetiresClient()
    {
        using var server = new CloseProbeServer();
        var client = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { });
        await client.connect().WaitAsync(TimeSpan.FromSeconds(3));
        await server.WaitAccepted();
        await server.CloseFromPeer();
        await server.WaitCloseReceived();
        var deadline = DateTime.UtcNow.AddSeconds(3);
        while (client.error == null || ReadOptionalOwnedTask(client, "closeTask") == null)
        {
            if (DateTime.UtcNow >= deadline)
            {
                throw new TimeoutException("peer close did not start client retirement");
            }
            await Task.Delay(10);
        }
        await ReadOwnedTask(client, "closeTask");
        Assert(client.error != null, "a peer close frame must retire the client");
        Assert(client.connect().IsFaulted, "connect after a peer close frame must fail");
        Assert(ReadOwnedTask(client, "pingTask").IsCompleted, "peer close must stop the ping task");
        Assert(ReadOwnedTask(client, "receiveTask").IsCompleted, "peer close must settle the receive task");
    }

    public async Task testWsClientPeerCloseCoordinatesConcurrentClose()
    {
        using var server = new CloseProbeServer();
        using var closeCallbackEntered = new ManualResetEventSlim(false);
        using var releaseCloseCallback = new ManualResetEventSlim(false);
        var errorCallbacks = 0;
        var client = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { }, null,
            (c, reason) =>
            {
                closeCallbackEntered.Set();
                if (!releaseCloseCallback.Wait(TimeSpan.FromSeconds(5)))
                {
                    throw new TimeoutException("the peer-close callback was not released");
                }
            },
            (c, error) => Interlocked.Increment(ref errorCallbacks));
        await client.connect().WaitAsync(TimeSpan.FromSeconds(3));
        await server.WaitAccepted();
        await server.CloseFromPeer();
        await server.WaitCloseReceived();
        await WaitForSignal(closeCallbackEntered, "the peer-close callback");

        Assert(client.future("during-peer-close").task.IsFaulted, "futures created during peer-close retirement must be rejected immediately");
        var close = client.Close();
        var closeWaitedForPeerCallback = !close.IsCompleted;
        releaseCloseCallback.Set();
        await close;
        Assert(closeWaitedForPeerCallback, "concurrent Close must wait for peer-close retirement");
        Assert(errorCallbacks == 0, "peer close must not race into the local error callback");
    }

    public async Task testWsClientConnectFailureReachesCloseResult()
    {
        var probe = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
        probe.Start();
        var port = ((IPEndPoint)probe.LocalEndpoint).Port;
        probe.Stop();
        var client = new BaseExchange.WebSocketClient("ws://127.0.0.1:" + port + "/", null, (c, m) => { });
        Exception? connectError = null;
        try
        {
            await client.connect().WaitAsync(TimeSpan.FromSeconds(3));
        }
        catch (Exception ex)
        {
            connectError = ex;
        }
        Assert(connectError != null, "an unavailable endpoint must fail connection");
        var deadline = DateTime.UtcNow.AddSeconds(3);
        Task? closeTask = null;
        while ((closeTask = ReadOptionalOwnedTask(client, "closeTask")) == null)
        {
            if (DateTime.UtcNow >= deadline)
            {
                throw new TimeoutException("connection failure did not start client shutdown");
            }
            await Task.Delay(10);
        }

        Exception? closeError = null;
        try
        {
            await closeTask.WaitAsync(TimeSpan.FromSeconds(3));
        }
        catch (Exception ex)
        {
            closeError = ex;
        }
        Assert(closeError is AggregateException, "Close must preserve the failed connect task result: " + (closeError?.GetType().FullName ?? "null") + " " + closeError?.Message);
    }

    public async Task testWsClientErrorClosesOnlyTheFailedClient()
    {
        using var server = new CloseProbeServer();
        var exchange = new BaseExchange();
        var failed = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { }, null, null, exchange.onError);
        var replacement = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { });
        exchange.clients[server.url] = failed;
        await failed.connect().WaitAsync(TimeSpan.FromSeconds(3));
        await server.WaitAccepted();
        exchange.clients[server.url] = replacement;

        failed.onError(new NetworkError("transport failed"));
        var deadline = DateTime.UtcNow.AddSeconds(3);
        while (ReadOptionalOwnedTask(failed, "closeTask") == null)
        {
            if (DateTime.UtcNow >= deadline)
            {
                throw new TimeoutException("transport failure did not start client shutdown");
            }
            await Task.Delay(10);
        }
        await ReadOwnedTask(failed, "closeTask");
        await server.WaitCloseReceived();
        Assert(ReferenceEquals(exchange.clients[server.url], replacement), "retiring a failed client must preserve a healthy replacement");
        Assert(failed.webSocket.State != WebSocketState.Open, "the failed client's transport must close");
    }

    public async Task testWsClientCloseWithThrowingCallback()
    {
        using var server = new CloseProbeServer();
        var client = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { }, null, null, (c, e) => throw new InvalidOperationException("callback failure"));
        await client.connect().WaitAsync(TimeSpan.FromSeconds(3));
        await server.WaitAccepted();

        Exception? closeError = null;
        try
        {
            await client.Close();
        }
        catch (Exception ex)
        {
            closeError = ex;
        }
        await server.WaitCloseReceived();
        Assert(closeError is AggregateException aggregate && aggregate.Flatten().InnerExceptions.Any(ex => ex.Message == "callback failure"), "Close must report the error callback failure after cleanup");
        Assert(ReadOwnedTask(client, "pingTask").IsCompleted, "callback failure must not skip ping shutdown");
        Assert(ReadOwnedTask(client, "receiveTask").IsCompleted, "callback failure must not skip receive shutdown");
    }

    public async Task testWsClientCloseLifecycleSuite()
    {
        await testWsClientCloseLifecycle();
        await testWsClientCloseWaitsForPing();
        await testWsClientRemoteCloseRetiresClient();
        await testWsClientPeerCloseCoordinatesConcurrentClose();
        await testWsClientConnectFailureReachesCloseResult();
        await testWsClientErrorClosesOnlyTheFailedClient();
        await testWsClientCloseWithThrowingCallback();
    }
}
