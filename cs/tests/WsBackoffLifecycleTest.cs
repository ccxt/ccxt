using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using ccxt;

namespace Tests;

public partial class BaseTest
{
    private sealed class BackoffProbeServer : IDisposable
    {
        private readonly HttpListener listener = new HttpListener();
        private readonly TaskCompletionSource<WebSocket> accepted = new(TaskCreationOptions.RunContinuationsAsynchronously);
        private volatile bool disposed;
        public readonly string url;

        public BackoffProbeServer()
        {
            var probe = new TcpListener(IPAddress.Loopback, 0);
            probe.Start();
            var port = ((IPEndPoint)probe.LocalEndpoint).Port;
            probe.Stop();
            this.url = "ws://127.0.0.1:" + port + "/";
            this.listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
            this.listener.Start();
            _ = this.Accept();
        }

        private async Task Accept()
        {
            try
            {
                var context = await this.listener.GetContextAsync();
                var socket = (await context.AcceptWebSocketAsync(null)).WebSocket;
                this.accepted.TrySetResult(socket);
            }
            catch (HttpListenerException) when (this.disposed)
            {
                this.accepted.TrySetCanceled();
            }
        }

        public Task<WebSocket> Accepted => this.accepted.Task;

        public void Dispose()
        {
            this.disposed = true;
            this.listener.Stop();
            if (this.accepted.Task.IsCompletedSuccessfully)
            {
                this.accepted.Task.Result.Abort();
            }
        }
    }

    public async Task testWsBackoffLifecycle()
    {
        await testWsBackoffDelayIsHonored();
        await testWsCloseCancelsDelayedConnection();
        await testWsConnectLeavesCallerContext();
        testWsBackoffStatePersistsAcrossClose();
        await testWsBackoffConcurrentUpdates();
    }

    private async Task testWsBackoffDelayIsHonored()
    {
        using var server = new BackoffProbeServer();
        var client = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { });
        client.keepAlive = null;
        var watch = Stopwatch.StartNew();
        try
        {
            await client.connect(250).WaitAsync(TimeSpan.FromSeconds(5));
            await server.Accepted.WaitAsync(TimeSpan.FromSeconds(1));
            Assert(watch.ElapsedMilliseconds >= 200, "connect(delay) must wait before dialing");
        }
        finally
        {
            await client.Close();
            client.webSocket.Dispose();
        }
    }

    private async Task testWsCloseCancelsDelayedConnection()
    {
        using var server = new BackoffProbeServer();
        var client = new BaseExchange.WebSocketClient(server.url, null, (c, m) => { });
        client.keepAlive = null;
        client.connect(300);
        await Task.Delay(50);
        await client.Close();
        await Task.Delay(400);
        Assert(!server.Accepted.IsCompletedSuccessfully, "Close must cancel a pending delayed dial");
        Assert(client.connected.Task.IsFaulted, "Close must release callers waiting for a delayed connection");
        client.webSocket.Dispose();
    }

    // runs posted work on the thread pool, but counts it, like a UI context would receive it
    private sealed class CountingSynchronizationContext : SynchronizationContext
    {
        public int posts = 0;

        public override void Post(SendOrPostCallback callback, object? state)
        {
            Interlocked.Increment(ref this.posts);
            ThreadPool.QueueUserWorkItem(_ =>
            {
                var prior = SynchronizationContext.Current;
                SynchronizationContext.SetSynchronizationContext(this);
                try
                {
                    callback(state);
                }
                finally
                {
                    SynchronizationContext.SetSynchronizationContext(prior);
                }
            });
        }
    }

    private async Task testWsConnectLeavesCallerContext()
    {
        using var server = new BackoffProbeServer();
        var handled = new TaskCompletionSource<SynchronizationContext?>(TaskCreationOptions.RunContinuationsAsynchronously);
        var client = new BaseExchange.WebSocketClient(server.url, null, (c, m) => handled.TrySetResult(SynchronizationContext.Current));
        client.keepAlive = null;
        var callerContext = new CountingSynchronizationContext();
        var previous = SynchronizationContext.Current;
        Task connected;
        SynchronizationContext.SetSynchronizationContext(callerContext);
        try
        {
            connected = client.connect();
        }
        finally
        {
            SynchronizationContext.SetSynchronizationContext(previous);
        }
        try
        {
            await connected.WaitAsync(TimeSpan.FromSeconds(5));
            var serverSide = await server.Accepted.WaitAsync(TimeSpan.FromSeconds(5));
            await serverSide.SendAsync(System.Text.Encoding.UTF8.GetBytes("{\"probe\":1}"), WebSocketMessageType.Text, true, CancellationToken.None);
            var handlerContext = await handled.Task.WaitAsync(TimeSpan.FromSeconds(5));
            Assert(!ReferenceEquals(handlerContext, callerContext), "frames must be handled off the caller's SynchronizationContext");
            Assert(callerContext.posts == 0, "connect must not resume the dial on the caller's SynchronizationContext");
        }
        finally
        {
            await client.Close();
            client.webSocket.Dispose();
        }
    }

    private void testWsBackoffStatePersistsAcrossClose()
    {
        var exchange = new BaseExchange();
        var url = "ws://localhost:1234/backoff-state";
        Assert(exchange.calculateWsBackoffDelay(url) == 0, "the first attempt must be immediate");
        Assert(exchange.calculateWsBackoffDelay(url) > 0, "a subsequent attempt must receive backoff");
        exchange.Close().GetAwaiter().GetResult();
        Assert(exchange.calculateWsBackoffDelay(url) > 0, "backoff state survives Close() like the other languages");
    }

    private async Task testWsBackoffConcurrentUpdates()
    {
        for (var round = 0; round < 20; round++)
        {
            var exchange = new BaseExchange();
            var start = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
            var calls = Enumerable.Range(0, 32).Select(_ => Task.Run(async () =>
            {
                await start.Task;
                return exchange.calculateWsBackoffDelay("ws://localhost:1234/concurrent");
            })).ToArray();
            start.SetResult(true);
            var delays = await Task.WhenAll(calls);
            Assert(delays.Count(delay => delay == 0) == 1, "exactly one concurrent attempt must be immediate");
            await exchange.Close();
        }
    }
}
