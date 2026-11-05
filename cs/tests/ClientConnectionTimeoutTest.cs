using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using ccxt;

namespace Tests;

public partial class BaseTest
{
    // Accept the HTTP upgrade request but never answer it. No external venue or
    // unreachable address is needed to exercise a stalled handshake.
    private sealed class StalledUpgradeServer : IDisposable
    {
        private readonly TcpListener listener = new(IPAddress.Loopback, 0);
        private readonly CancellationTokenSource stopped = new();
        private readonly TaskCompletionSource<bool> requested = new(TaskCreationOptions.RunContinuationsAsynchronously);
        private readonly TaskCompletionSource<bool> disconnected = new(TaskCreationOptions.RunContinuationsAsynchronously);
        private readonly Task serving;
        private TcpClient? peer;
        public readonly string url;

        public StalledUpgradeServer()
        {
            listener.Start();
            url = "ws://127.0.0.1:" + ((IPEndPoint)listener.LocalEndpoint).Port + "/";
            serving = Serve();
        }

        public Task Requested => requested.Task;
        public Task Disconnected => disconnected.Task;

        private async Task Serve()
        {
            try
            {
                using var accepted = await listener.AcceptTcpClientAsync(stopped.Token);
                peer = accepted;
                var stream = accepted.GetStream();
                var headers = new StringBuilder();
                var buffer = new byte[1];
                while (await stream.ReadAsync(buffer, stopped.Token) != 0)
                {
                    headers.Append((char)buffer[0]);
                    if (headers.ToString().EndsWith("\r\n\r\n"))
                    {
                        requested.TrySetResult(true);
                        break;
                    }
                }
                while (await stream.ReadAsync(buffer, stopped.Token) != 0) { }
                disconnected.TrySetResult(true);
            }
            catch (Exception ex) when (stopped.IsCancellationRequested)
            {
                requested.TrySetCanceled();
                disconnected.TrySetCanceled();
            }
            catch (IOException) when (requested.Task.IsCompletedSuccessfully)
            {
                // Cancellation can reset the socket instead of sending EOF.
                disconnected.TrySetResult(true);
            }
            catch (Exception ex)
            {
                requested.TrySetException(ex);
                disconnected.TrySetException(ex);
            }
        }

        public void Dispose()
        {
            stopped.Cancel();
            listener.Stop();
            peer?.Dispose();
            serving.GetAwaiter().GetResult();
            stopped.Dispose();
        }
    }

    private static async Task<T> ConnectionFailure<T>(Task task) where T : Exception
    {
        try
        {
            await task.WaitAsync(TimeSpan.FromSeconds(5));
        }
        catch (T error)
        {
            return error;
        }
        throw new Exception("Expected " + typeof(T).Name);
    }

    // Expectations come from Client.ts: 10000 ms by default, false disables,
    // RequestTimeout on a stalled handshake, and no timer after onOpen/reset.
    // WsClient.ts starts the timer after the reconnect backoff.
    public async Task testWsConnectionTimeout()
    {
        await testWsConnectionTimeoutReleasesOtherClients();
        await testWsConnectionTimeoutOptionsOverride();
        await testWsConnectionTimeoutExcludesBackoffAndOpenConnection();
        await testWsConnectionTimeoutClose(false);
        await testWsConnectionTimeoutClose(0);
        await testWsConnectionTimeoutClose(30000);
    }

    public async Task testWsConnectionTimeoutReleasesOtherClients()
    {
        using var stalled = new StalledUpgradeServer();
        using var healthy = new BackoffProbeServer();
        var exchange = new ccxt.pro.binance();
        exchange.streaming["connectionTimeout"] = 500;
        var client = exchange.client(stalled.url);
        client.keepAlive = null;
        var healthyExchange = new ccxt.pro.binance();
        healthyExchange.streaming["connectionTimeout"] = 100;
        var healthyClient = healthyExchange.client(healthy.url);
        healthyClient.keepAlive = null;
        var callbacks = 0;
        var onError = client.onErrorCallback;
        client.onErrorCallback = (c, e) => { Interlocked.Increment(ref callbacks); onError(c, e); };
        var watching = exchange.watch(stalled.url, "probe");
        var pendingFuture = client.future("probe").task;
        try
        {
            await stalled.Requested.WaitAsync(TimeSpan.FromSeconds(5));
            // The second client's shorter timeout must start at its own dial,
            // after the stalled client releases the shared connect semaphore.
            var healthyConnected = healthyClient.connect();
            var error = await ConnectionFailure<RequestTimeout>(watching);
            await healthyConnected.WaitAsync(TimeSpan.FromSeconds(5));
            await healthy.Accepted.WaitAsync(TimeSpan.FromSeconds(5));
            Assert(ReferenceEquals(error, await ConnectionFailure<RequestTimeout>(pendingFuture)), "timeout must reject pending watch futures with the connection error");
            Assert(ReferenceEquals(error, client.error), "client must retain its terminal timeout");
            Assert(!exchange.clients.ContainsKey(stalled.url), "timed out client must be evicted so watch can reconnect");
            Assert(client.futures.Count == 0 && client.subscriptions.Count == 0, "timeout must clear pending subscription state");
            Assert(callbacks == 1, "timeout must notify the exchange once");
            Assert(!client.isConnected, "failed handshake must not mark the client connected");
            await stalled.Disconnected.WaitAsync(TimeSpan.FromSeconds(5));
            await client.Close();
            Assert(ReferenceEquals(error, client.error) && callbacks == 1, "later Close must preserve the timeout and not notify twice");
        }
        finally
        {
            await client.Close();
            await healthyClient.Close();
            client.webSocket.Dispose();
            healthyClient.webSocket.Dispose();
        }
    }

    public async Task testWsConnectionTimeoutOptionsOverride()
    {
        using var server = new StalledUpgradeServer();
        var exchange = new ccxt.pro.binance();
        exchange.streaming["connectionTimeout"] = 30000;
        exchange.options["ws"] = new Dictionary<string, object>
        {
            ["connectionTimeout"] = 200,
        };
        var client = exchange.client(server.url);
        try
        {
            var connecting = client.connect();
            await server.Requested.WaitAsync(TimeSpan.FromSeconds(5));
            await ConnectionFailure<RequestTimeout>(connecting);
            await server.Disconnected.WaitAsync(TimeSpan.FromSeconds(5));
        }
        finally
        {
            await client.Close();
            client.webSocket.Dispose();
        }
    }

    public async Task testWsConnectionTimeoutExcludesBackoffAndOpenConnection()
    {
        using var server = new BackoffProbeServer();
        var exchange = new ccxt.pro.binance();
        exchange.streaming["connectionTimeout"] = 200;
        var client = exchange.client(server.url);
        client.keepAlive = null;
        try
        {
            await client.connect(500).WaitAsync(TimeSpan.FromSeconds(5));
            await server.Accepted.WaitAsync(TimeSpan.FromSeconds(5));
            await Task.Delay(500);
            Assert(client.error == null && client.isConnected, "handshake timeout must exclude backoff and stop after connection opens");
            Assert(client.webSocket.State == WebSocketState.Open, "expired handshake timer must not abort an open socket");
        }
        finally
        {
            await client.Close();
            client.webSocket.Dispose();
        }
    }

    public async Task testWsConnectionTimeoutClose(object timeout)
    {
        using var server = new StalledUpgradeServer();
        var exchange = new ccxt.pro.binance();
        exchange.streaming["connectionTimeout"] = timeout;
        var client = exchange.client(server.url);
        var connecting = client.connect();
        try
        {
            await server.Requested.WaitAsync(TimeSpan.FromSeconds(5));
            await Task.Delay(350);
            Assert(!connecting.IsCompleted, "disabled or unexpired timeout must leave the handshake pending");
            await client.Close().WaitAsync(TimeSpan.FromSeconds(5));
            await ConnectionFailure<ExchangeClosedByUser>(connecting);
            await server.Disconnected.WaitAsync(TimeSpan.FromSeconds(5));
            Assert(client.error is ExchangeClosedByUser, "user cancellation must not become a connection timeout");
        }
        finally
        {
            await client.Close();
            client.webSocket.Dispose();
        }
    }
}
