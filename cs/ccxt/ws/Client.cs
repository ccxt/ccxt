using System.Text;

namespace ccxt;

using System;
using System.Net.WebSockets;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.IO.Compression;
using System.Net;


public partial class BaseExchange
{
    public class WebSocketClient
    {
        public string url; // Replace with your WebSocket server URL
        public ClientWebSocket webSocket = new ClientWebSocket();
        
        public IDictionary<string, Future> futures = new ConcurrentDictionary<string, Future>();
        public IDictionary<string, object> subscriptions = new ConcurrentDictionary<string, object>();
        public IDictionary<string, object> rejections = new ConcurrentDictionary<string, object>();
        // spans future/resolve/reject so a resolve cannot land between
        // futures GetOrAdd and the waiter attaching, and so settlements
        // happen outside the lock (TaskCompletionSource is not
        // RunContinuationsAsynchronously)
        private readonly object futuresSync = new object();
        public bool verbose = false;
        public bool isConnected = false;
        public volatile bool startedConnecting = false;
        private readonly object connectSync = new object();
        private readonly CancellationTokenSource connectCancellation = new CancellationTokenSource();
        private readonly CancellationTokenSource pingCancellation = new CancellationTokenSource();
        private readonly CancellationTokenSource receiveCancellation = new CancellationTokenSource();
        private Task connectTask = null;
        private Task pingTask = null;
        private Task receiveTask = null;
        private Task closeTask = null;
        private TaskCompletionSource<bool> peerCloseGate = null;
        private Exception callbackError = null;
        private Exception closeError = null;
        private volatile bool closing = false;
        private ManualResetEvent waitHandle = new ManualResetEvent(false);

        public TaskCompletionSource<bool> connected = null;

        public delegate void handleMessageDelegate(WebSocketClient client, object messageContent);

        public delegate void onCloseDelegate(WebSocketClient client, object error = null);

        public delegate void onErrorDelegate(WebSocketClient client, object error = null);

        public handleMessageDelegate handleMessage = null;

        public onCloseDelegate onClose = null;

        public onErrorDelegate onErrorCallback = null;

        public delegate object pingDelegate(WebSocketClient client);

        public pingDelegate ping = null;

        public object lastPong = null;

        public object keepAlive = 30000;

        public int maxPingPongMisses = 3;

        public Int64? connectionEstablished;

        // mirrors js Client.error: null while live, the terminal error once
        // retired. read and written under futuresSync.
        public object error = null;

        public bool decompressBinary = true;

        public bool isMock = false; // static ws tests: transport is stubbed, sends are recorded

        public List<object> mockSentMessages = new List<object>(); // frames recorded in mock mode

        public WebSocketClient(string url, string proxy, handleMessageDelegate handleMessage, pingDelegate ping = null, onCloseDelegate onClose = null, onErrorDelegate onError = null, bool isVerbose = false, Int64 keepA = 30000, bool decompressBinary = true)
        {
            this.url = url;
            var tcs = new TaskCompletionSource<bool>();
            this.connected = tcs;
            this.ping = ping;
            this.handleMessage = handleMessage;
            this.verbose = isVerbose;
            this.onClose = onClose;
            this.onErrorCallback = onError;
            this.keepAlive = keepA;
            this.decompressBinary = decompressBinary;
            this.webSocket.Options.KeepAliveInterval = TimeSpan.Zero; // Disable unsolicited PONG. https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/websockets?#compression
            if (proxy != null)
            {
                var webProxy = new WebProxy(proxy);
                webSocket.Options.Proxy = webProxy;
            }
        }

        public Future future(object messageHash2)
        {
            var messageHash = messageHash2.ToString();
            Future future;
            object rejection = null;
            lock (futuresSync)
            {
                if (this.error != null || this.closing)
                {
                    future = new Future();
                    rejection = this.error ?? this.closeError;
                }
                else
                {
                    future = (this.futures as ConcurrentDictionary<string, Future>).GetOrAdd(messageHash, (key) => new Future());
                    (this.rejections as ConcurrentDictionary<string, object>).TryRemove(messageHash, out rejection);
                }
            }
            // settle outside the lock, the TaskCompletionSource is not
            // RunContinuationsAsynchronously so awaiter continuations can run
            // synchronously on this thread
            if (rejection != null)
            {
                future.reject(rejection);
            }
            return future;
        }

        public Future reusableFuture(object messageHash)
        {
            return this.future(messageHash);  // only used in go
        }

        public void resolve(object content, object messageHash2)
        {
            if (this.verbose && (messageHash2 == null))
            {
                Console.WriteLine("resolve received undefined messageHash");
            }
            var messageHash = messageHash2.ToString();
            Future future = null;
            lock (futuresSync)
            {
                if (this.error == null && !this.closing)
                {
                    (this.futures as ConcurrentDictionary<string, Future>).TryRemove(messageHash, out future);
                }
            }
            if (future != null)
            {
                future.resolve(content);
            }
        }

        public void reject(object content, object messageHash2 = null)
        {
            if (messageHash2 != null)
            {
                var messageHash = messageHash2.ToString();
                Future future = null;
                lock (futuresSync)
                {
                    if (this.error != null || this.closing)
                    {
                        return;
                    }
                    if (!(this.futures as ConcurrentDictionary<string, Future>).TryRemove(messageHash, out future))
                    {
                        (this.rejections as ConcurrentDictionary<string, object>)[messageHash] = content;
                        future = null;
                    }
                }
                if (future != null)
                {
                    future.reject(content);
                }
            }
            else
            {
                var settled = new List<Future>();
                lock (futuresSync)
                {
                    foreach (var messageHash in this.futures.Keys)
                    {
                        var future = this.futures[messageHash];
                        this.futures.Remove(messageHash); // this order matters
                        settled.Add(future);
                    }
                }
                foreach (var future in settled)
                {
                    future.reject(content);
                }
            }
        }

        // mirrors js Client.reset: reject every pending future and clear the
        // consumer state. settles outside the lock, Future's
        // TaskCompletionSource runs continuations inline.
        public void reset(object error)
        {
            var settled = new List<Future>();
            lock (futuresSync)
            {
                foreach (var messageHash in this.futures.Keys.ToArray())
                {
                    settled.Add(this.futures[messageHash]);
                    this.futures.Remove(messageHash);
                }
                this.subscriptions.Clear();
                this.rejections.Clear();
            }
            foreach (var future in settled)
            {
                future.reject(error);
            }
        }

        // mirrors js Client.onError: set the error marker, reset, notify the
        // exchange. the lock elects one winner when the transport error, a
        // late onClose and a user Close() race on separate threads.
        public void onError(object error)
        {
            lock (futuresSync)
            {
                if (this.error != null)
                {
                    return;
                }
                this.error = error;
            }
            var connectionError = error as Exception ?? new Exception(error?.ToString() ?? "WebSocket connection failed");
            lock (connectSync)
            {
                this.closeError ??= connectionError;
                this.closing = true;
            }
            this.isConnected = false; // stops PingLoop's while() condition
            this.connected.TrySetException(connectionError);
            this.reset(error);
            try
            {
                this.onErrorCallback?.Invoke(this, error);
            }
            catch (Exception ex)
            {
                Interlocked.CompareExchange(ref this.callbackError, ex, null);
            }
            this.RequestClose();
        }

        public void onOpen()
        {
            lock (connectSync)
            {
                if (this.closing)
                {
                    return;
                }
                this.connectionEstablished = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                this.isConnected = true;
                if (this.pingTask == null)
                {
                    this.pingTask = this.PingLoop();
                }
            }
            // Awaiters can resume inline only after the lifecycle tasks are registered.
            this.connected.TrySetResult(true);
        }

        public Task connect(int backoffDelay = 0)
        {
            lock (connectSync)
            {
                if (this.closing)
                {
                    return Task.FromException(this.closeError);
                }
                if (!this.startedConnecting)
                {
                    this.startedConnecting = true;
                    object priorError;
                    lock (futuresSync)
                    {
                        priorError = this.error;
                    }
                    if (priorError != null)
                    {
                        var connectionError = priorError as Exception ?? new Exception(priorError.ToString());
                        this.connected.TrySetException(connectionError);
                    }
                    else
                    {
                        // run the dial on the thread pool: called inline it would capture the
                        // caller's SynchronizationContext (a UI thread) and marshal onOpen and
                        // the whole receive loop onto it
                        var cancellationToken = this.connectCancellation.Token;
                        this.connectTask = Task.Run(() => this.Connect(backoffDelay, cancellationToken));
                    }
                }
            }
            return this.connected.Task;
        }

        public void onPong()
        {
            this.lastPong = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            if (this.verbose)
            {
                Console.WriteLine("Pong received: " + this.lastPong.ToString());
            }
        }

        public async Task PingLoop()
        {
            var cancellationToken = this.pingCancellation.Token;
            try
            {

                if (this.keepAlive != null)
                {
                    await Task.Delay(Convert.ToInt32(this.keepAlive), cancellationToken);
                }
                var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                if (this.verbose)
                {
                    Console.WriteLine($"PingLoop: {Exchange.Iso8601(now)}");
                }

                while (this.keepAlive != null && this.isConnected && !cancellationToken.IsCancellationRequested)
                {
                    // refresh on every iteration - a timestamp captured once before the loop
                    // freezes the staleness comparison below and the pong-timeout branch can
                    // never fire, leaving dead connections undetected,
                    // see https://github.com/ccxt/ccxt/issues/23490
                    now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

                    if (this.lastPong == null)
                    {
                        this.lastPong = now;
                    }

                    var lastPongConverted = Convert.ToInt64(this.lastPong);
                    var convertedKeepAlive = Convert.ToInt64(this.keepAlive);
                    if (lastPongConverted + convertedKeepAlive * this.maxPingPongMisses < now)
                    {
                        // sibling wording (ts/py/php/go) plus the actual numbers — the raw value
                        // is what surfaced this bug in the first place, so keep it, but print the
                        // real kill window with the real unit instead of the millisecond keepAlive
                        // labeled as "seconds", and raise RequestTimeout instead of a bare
                        // Exception the error-class handling cannot categorize
                        this.onError(new RequestTimeout("Connection to " + this.url + " timed out due to a ping-pong keepalive missing on time (no liveness within " + (convertedKeepAlive * this.maxPingPongMisses) + " ms = keepAlive " + convertedKeepAlive + " ms x " + this.maxPingPongMisses + " misses)"));
                        break;
                    }
                    else
                    {
                        if (this.ping != null)
                        {
                            var pingResult = this.ping(this);
                            if (pingResult != null)
                            {
                                // if (this.verbose)
                                // {
                                //     Console.WriteLine("Sending ping: " + pingResult);
                                // }
                                if (pingResult is string)
                                {
                                await this.send((string)pingResult, cancellationToken);
                                }
                                else
                                {
                                    await this.send(pingResult, cancellationToken);

                                }
                            }
                        }
                        else
                        {
                            // this.webSocket.SendPing(); should we send ping here?

                        }
                    }
                    await Task.Delay(Convert.ToInt32(convertedKeepAlive), cancellationToken);
                }
            }
            catch (OperationCanceledException ex) when (cancellationToken.IsCancellationRequested && ex.CancellationToken == cancellationToken)
            {
                return;
            }
            catch (Exception ex)
            {
                if (this.verbose)
                {
                    Console.WriteLine($"PingLoop error: {ex.Message}");
                }
                this.onError(ex);
                throw;
            }
        }


        private static readonly SemaphoreSlim _connectSemaphore = new SemaphoreSlim(1, 1);

        private async Task Connect(int backoffDelay, CancellationToken cancellationToken)
        {
            var acquired = false;
            TaskCompletionSource<bool> receiveStart = null;
            try
            {
                if (backoffDelay > 0)
                {
                    await Task.Delay(backoffDelay, cancellationToken);
                }

                await _connectSemaphore.WaitAsync(cancellationToken);
                acquired = true;
                if (this.webSocket.State == WebSocketState.Open)
                {
                    return;
                }

                await webSocket.ConnectAsync(new Uri(url), cancellationToken);
                if (this.verbose)
                {
                    Console.WriteLine("WebSocket connected to " + url);
                }
                lock (connectSync)
                {
                    if (this.closing)
                    {
                        return;
                    }
                    var receiveToken = this.receiveCancellation.Token;
                    receiveStart = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
                    this.receiveTask = Task.Run(async () =>
                    {
                        await receiveStart.Task;
                        if (!receiveToken.IsCancellationRequested && !this.closing)
                        {
                            await this.Receiving(webSocket, receiveToken);
                        }
                    });
                    this.onOpen();
                }
            }
            catch (OperationCanceledException ex) when (cancellationToken.IsCancellationRequested && ex.CancellationToken == cancellationToken)
            {
                this.onError(this.error ?? new ExchangeClosedByUser("Connection closed by the user"));
            }
            catch (Exception ex)
            {
                this.onError(ex);
                throw;
            }
            finally
            {
                if (acquired)
                {
                    _connectSemaphore.Release();
                }
                receiveStart?.TrySetResult(true);
            }
        }


        private static readonly SemaphoreSlim _sendSemaphore = new SemaphoreSlim(1, 1);

        protected static async Task sendAsyncWrapper(ClientWebSocket webSocket, ArraySegment<byte> ArraySegment, WebSocketMessageType WebSocketMessageType, bool endOnMessage, CancellationToken CancellationToken)
        {
            await _sendSemaphore.WaitAsync(CancellationToken);
            try
            {
                if (webSocket.State == WebSocketState.Open)
                {
                    await webSocket.SendAsync(ArraySegment, WebSocketMessageType, endOnMessage, CancellationToken);
                }
                else
                {
                    throw new WebSocketException("Cannot send on a WebSocket that is not open");
                }
            }
            finally
            {
                _sendSemaphore.Release();
            }
        }

        public Task send(object message)
        {
            return this.send(message, CancellationToken.None);
        }

        private async Task send(object message, CancellationToken cancellationToken)
        {
            var jsonMessage = (message is string) ? ((string)message) : Exchange.Json(message);
            if (this.isMock)
            {
                // static ws tests: record the outgoing frame so the test can assert it
                this.mockSentMessages.Add(JsonHelper.Deserialize(jsonMessage));
                return;
            }
            if (this.verbose)
            {
                Console.WriteLine($"Sending message: {jsonMessage}");
            }
            var bytes = Encoding.UTF8.GetBytes(jsonMessage);
            var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
            await sendAsyncWrapper(this.webSocket, arraySegment,
                                WebSocketMessageType.Text,
                                true,
                                cancellationToken);
        }

        // private static async Task Sending(ClientWebSocket webSocket)
        // {
        //    try
        //    {
        //        while (webSocket.State == WebSocketState.Open)
        //        {
        //            string message = Console.ReadLine();

        //            if (!string.IsNullOrEmpty(message))
        //            {
        //                var bytes = Encoding.UTF8.GetBytes(message);
        //                await sendAsyncWrapper(webSocket, new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Sending error: {ex.Message}");
        //    }
        // }

        // any inbound frame proves the connection alive: .NET ClientWebSocket
        // neither surfaces incoming pong frames to user code nor exposes an API
        // to send unsolicited pings, so protocol-level pong tracking is
        // impossible here — without this, lastPong freezes at the ping loop's
        // first iteration and every protocol-ping exchange (hitbtc, derive,
        // lyra, ...) is deterministically disconnected at exactly
        // keepAlive * maxPingPongMisses while perfectly healthy
        public void markAlive()
        {
            this.lastPong = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        public void TryHandleMessage(string message)
        {
            this.markAlive();
            object deserializedMessages = message;
            if (isValidJson(message))
            {
                try
                {
                    deserializedMessages = JsonHelper.Deserialize(message);
                }
                catch (Exception e)
                {
                }
            }
            this.handleMessage(this, deserializedMessages);
        }

        // private void TryHandleBinaryMessage(string message)
        // {

        //     this.handleMessage(this, deserializedMessages);
        // }

        private async Task Receiving(ClientWebSocket webSocket, CancellationToken cancellationToken)
        {
            var buffer = new byte[10485760]; // 10MB, check best size later
            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    // var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    var memory = new MemoryStream();

                    WebSocketReceiveResult result;
                    do
                    {
                        result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);
                        memory.Write(buffer, 0, result.Count);
                    } while (!result.EndOfMessage);

                    if (cancellationToken.IsCancellationRequested || this.closing)
                    {
                        return;
                    }


                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        // var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        var message = Encoding.UTF8.GetString(memory.ToArray(), 0, (int)memory.Length);
                        if (this.verbose)
                        {
                            Console.WriteLine($"On message: {message}");
                        }
                        this.TryHandleMessage(message);
                    }
                    else if (result.MessageType == WebSocketMessageType.Binary)
                    {

                        var msgBinary = buffer.Take(result.Count).ToArray();
                        // Use memory.ToArray() to get the FULL message (all frames), not just the last chunk
                        var msgBinaryMemory = memory.ToArray();
                        // Handle binary message

                        if (this.verbose)
                        {
                            Console.WriteLine($"On binary message: {result}");
                        }

                        if (!this.decompressBinary)
                        {
                            this.markAlive(); // this arm bypasses TryHandleMessage, raw-binary frames are liveness too
                            this.handleMessage(this, msgBinary);
                            continue;
                        }

                        if (this.LooksLikeRawDeflate(msgBinary))
                        {
                            string decompressedString = System.Text.Encoding.UTF8.GetString(msgBinary);
                            if (this.verbose)
                            {
                                Console.WriteLine($"On raw binary message decompressed {decompressedString}");
                            }
                            this.TryHandleMessage(decompressedString);
                            continue;

                        }

                        // detect zlib magic bytes: 0x78 0x01, 0x78 0x5E, 0x78 0x9C, 0x78 0xDA
                        bool isZLib = msgBinaryMemory.Length > 2 && msgBinaryMemory[0] == 0x78 && (msgBinaryMemory[1] == 0x01 || msgBinaryMemory[1] == 0x5E || msgBinaryMemory[1] == 0x9C || msgBinaryMemory[1] == 0xDA);

                        if (isZLib)
                        {
                            using (var compressedStream = new MemoryStream(msgBinaryMemory, 2, msgBinaryMemory.Length - 2))
                            using (var decompressionStream = new DeflateStream(compressedStream, CompressionMode.Decompress))
                            using (var decompressedStream = new MemoryStream())
                            {
                                decompressionStream.CopyTo(decompressedStream);
                                string decompressedString = Encoding.UTF8.GetString(decompressedStream.ToArray());
                                if (this.verbose)
                                    Console.WriteLine($"On zlib binary message decompressed {decompressedString}");
                                this.TryHandleMessage(decompressedString);
                            }
                            continue;
                        }

                        // assume GZip (magic bytes: 0x1F 0x8B)
                        // use msgBinaryMemory (full reassembled message) not msgBinary (last chunk only)
                        bool isGZip = msgBinaryMemory.Length > 1 && msgBinaryMemory[0] == 0x1F && msgBinaryMemory[1] == 0x8B;

                        if (isGZip)
                        using (var compressedStream = new MemoryStream(msgBinaryMemory))
                        using (var decompressionStream = new GZipStream(compressedStream, CompressionMode.Decompress))
                        using (var decompressedStream = new MemoryStream())
                        {
                            decompressionStream.CopyTo(decompressedStream);
                            string decompressedString = Encoding.UTF8.GetString(decompressedStream.ToArray());
                            if (this.verbose)
                                Console.WriteLine($"On gzip binary message decompressed {decompressedString}");
                            this.TryHandleMessage(decompressedString);
                        }
                        // string json = System.Text.Encoding.UTF8.GetString(buffer, 0, result.Count);
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        var reason = new NetworkError("connection closed by remote server");
                        var gate = this.BeginPeerClose(reason);
                        try
                        {
                            await webSocket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                        }
                        catch
                        {
                            gate.TrySetResult(true);
                            throw;
                        }
                        this.RetireFromPeerClose(reason, gate);
                        return;
                    }
                    // else if (result.MessageType == WebSocketMessageType.Pong)
                    // {
                    //     Console.WriteLine("On Pong message:");
                    //     // Handle the Pong message as needed
                    // }
                }
            }
            catch (OperationCanceledException ex) when (cancellationToken.IsCancellationRequested && ex.CancellationToken == cancellationToken)
            {
                return;
            }
            catch (Exception ex)
            {
                if (this.verbose)
                {
                    Console.WriteLine($"Receiving error: {ex.Message}");
                }
                this.isConnected = false;
                this.onError(ex);
                throw;
            }
        }


        private bool LooksLikeRawDeflate(ReadOnlySpan<byte> b)
        {
            if (b.Length < 1) return false;
            byte first = b[0];
            int btype = (first >> 1) & 0b11;
            return btype == 0b01 || btype == 0b10;
        }

        private void RequestClose()
        {
            lock (connectSync)
            {
                if (this.closeTask != null)
                {
                    return;
                }
            }
            _ = Task.Run(async () =>
            {
                try
                {
                    await this.Close();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine("WebSocket shutdown failed: " + ex);
                }
            });
        }

        private TaskCompletionSource<bool> BeginPeerClose(object reason)
        {
            var terminalError = reason as Exception ?? new Exception(reason?.ToString() ?? "WebSocket connection closed");
            var gate = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
            lock (connectSync)
            {
                this.closeError ??= terminalError;
                this.peerCloseGate = gate;
                this.closing = true;
            }
            return gate;
        }

        private void RetireFromPeerClose(object reason, TaskCompletionSource<bool> gate)
        {
            var terminalError = reason as Exception ?? new Exception(reason?.ToString() ?? "WebSocket connection closed");
            this.isConnected = false;
            try
            {
                this.onClose?.Invoke(this, reason);
            }
            catch (Exception ex)
            {
                Interlocked.CompareExchange(ref this.callbackError, ex, null);
            }
            lock (futuresSync)
            {
                this.error ??= reason;
            }
            this.connected.TrySetException(terminalError);
            this.reset(reason);
            gate.TrySetResult(true);
            this.RequestClose();
        }

        public Task Close()
        {
            TaskCompletionSource<bool> completion;
            Task pendingConnect;
            Task pendingPing;
            Task pendingReceive;
            Task pendingPeerClose;
            lock (connectSync)
            {
                if (this.closeTask != null)
                {
                    return this.closeTask;
                }
                this.closeError ??= new ExchangeClosedByUser("Connection closed by the user");
                this.closing = true;
                completion = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
                this.closeTask = completion.Task;
                pendingConnect = this.connectTask;
                pendingPing = this.pingTask;
                pendingReceive = this.receiveTask;
                pendingPeerClose = this.peerCloseGate?.Task;
            }
            _ = Task.Run(async () =>
            {
                try
                {
                    await this.CompleteClose(completion, pendingConnect, pendingPing, pendingReceive, pendingPeerClose);
                }
                catch (Exception ex)
                {
                    completion.TrySetException(ex);
                }
            });
            return this.closeTask;
        }

        private async Task CompleteClose(TaskCompletionSource<bool> completion, Task pendingConnect, Task pendingPing, Task pendingReceive, Task pendingPeerClose)
        {
            var errors = new List<Exception>();
            await this.RecordTaskFailure(pendingPeerClose, errors);
            try
            {
                this.connectCancellation.Cancel();
                this.onError(this.closeError);
            }
            catch (Exception ex)
            {
                errors.Add(ex);
            }
            try
            {
                this.pingCancellation.Cancel();
            }
            catch (Exception ex)
            {
                errors.Add(ex);
            }
            await this.RecordTaskFailure(pendingConnect, errors);
            await this.RecordTaskFailure(pendingPing, errors);
            try
            {
                if (this.webSocket.State == WebSocketState.Open)
                {
                    await this.webSocket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, "Close", CancellationToken.None);
                }
            }
            catch (Exception ex)
            {
                errors.Add(ex);
            }
            finally
            {
                this.isConnected = false;
                try
                {
                    this.receiveCancellation.Cancel();
                }
                catch (Exception ex)
                {
                    errors.Add(ex);
                }
                await this.RecordTaskFailure(pendingReceive, errors);
                try
                {
                    this.webSocket.Dispose();
                }
                catch (Exception ex)
                {
                    errors.Add(ex);
                }
                this.connectCancellation.Dispose();
                this.pingCancellation.Dispose();
                this.receiveCancellation.Dispose();
            }
            var callbackError = Interlocked.Exchange(ref this.callbackError, null);
            if (callbackError != null)
            {
                errors.Add(callbackError);
            }
            if (errors.Count == 0)
            {
                completion.TrySetResult(true);
            }
            else
            {
                completion.TrySetException(new AggregateException(errors));
            }
        }

        private async Task RecordTaskFailure(Task task, List<Exception> errors)
        {
            if (task == null)
            {
                return;
            }
            try
            {
                await task;
            }
            catch (Exception ex)
            {
                errors.Add(ex);
            }
        }
    }

}
