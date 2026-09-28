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
        testWsBackoffStateResetsOnClose();
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

    private void testWsBackoffStateResetsOnClose()
    {
        var exchange = new BaseExchange();
        var url = "ws://localhost:1234/backoff-state";
        Assert(exchange.calculateWsBackoffDelay(url) == 0, "the first attempt must be immediate");
        Assert(exchange.calculateWsBackoffDelay(url) > 0, "a subsequent attempt must receive backoff");
        exchange.Close().GetAwaiter().GetResult();
        Assert(exchange.calculateWsBackoffDelay(url) == 0, "the first attempt after Close must be immediate");
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
