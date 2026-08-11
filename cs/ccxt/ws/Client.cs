using System.Text;

namespace ccxt;

using System;
using System.Net.WebSockets;
using System.Collections.Concurrent;
using System.Collections.Generic;
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
        // latest value resolved without a waiter, per message hash
        public IDictionary<string, object> pendingResults = new ConcurrentDictionary<string, object>();
        // spans future/resolve/reject so that a resolve landing between the
        // pending-results check and the futures GetOrAdd cannot park a value
        // while a consumer waits on an unresolvable future (the cs cousin of
        // the go lost-wakeup fixed in #29719, the other lanes ride
        // single-threaded event loops and do not need it)
        private readonly object futuresSync = new object();
        public bool verbose = false;
        public bool isConnected = false;
        public bool startedConnecting = false;
        private ManualResetEvent waitHandle = new ManualResetEvent(false);

        public TaskCompletionSource<bool> connected = null;

        public delegate void handleMessageDelegate(WebSocketClient client, object messageContent);

        public delegate void onCloseDelegate(WebSocketClient client, object error = null);

        public delegate void onErrorDelegate(WebSocketClient client, object error = null);

        public handleMessageDelegate handleMessage = null;

        public onCloseDelegate onClose = null;

        public onErrorDelegate onError = null;

        public delegate object pingDelegate(WebSocketClient client);

        public pingDelegate ping = null;

        public object lastPong = null;

        public object keepAlive = 30000;

        public int maxPingPongMisses = 3;

        public Int64? connectionEstablished;

        public bool error = false;

        public bool decompressBinary = true;

        public WebSocketClient(string url, string proxy, handleMessageDelegate handleMessage, pingDelegate ping = null, onCloseDelegate onClose = null, onErrorDelegate onError = null, bool isVerbose = false, Int64 keepA = 30000, bool decompressBinary = true)
        {
            this.url = url;
            var tcs = new TaskCompletionSource<bool>();
            this.connected = tcs;
            this.ping = ping;
            this.handleMessage = handleMessage;
            this.verbose = isVerbose;
            this.onClose = onClose;
            this.onError = onError;
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
            object pending = null;
            var hasPending = false;
            lock (futuresSync)
            {
                // a value that arrived while no future existed satisfies this
                // consumer immediately, the spent future intentionally stays
                // out of the map so the next consumer waits for fresh data
                if ((this.pendingResults as ConcurrentDictionary<string, object>).TryRemove(messageHash, out pending))
                {
                    hasPending = true;
                    future = new Future();
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
            if (hasPending)
            {
                future.resolve(pending);
            }
            else if (rejection != null)
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
                if (!(this.futures as ConcurrentDictionary<string, Future>).TryRemove(messageHash, out future))
                {
                    // no consumer future right now, keep the latest value so
                    // the next future() call is resolved with it instead of
                    // waiting for data that already arrived. A successful
                    // resolve after a retained error means the stream
                    // recovered, the stale error must not fail a later waiter
                    this.pendingResults[messageHash] = content;
                    (this.rejections as ConcurrentDictionary<string, object>).TryRemove(messageHash, out _);
                    future = null;
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
                    if (!(this.futures as ConcurrentDictionary<string, Future>).TryRemove(messageHash, out future))
                    {
                        (this.rejections as ConcurrentDictionary<string, object>)[messageHash] = content;
                        future = null;
                    }
                    // stale pre-error values must not satisfy post-error consumers
                    (this.pendingResults as ConcurrentDictionary<string, object>).TryRemove(messageHash, out _);
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
                    this.pendingResults.Clear();
                }
                foreach (var future in settled)
                {
                    future.reject(content);
                }
            }
        }

        public void reset(object message2)
        {
            // stub implement this later
            this.reject(error);
        }

        public void onOpen()
        {

            this.connected.SetResult(true);
            this.connectionEstablished = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            this.isConnected = true;
            // this.clearConnectionTimeout();
            Task.Run(async () =>
            {
                PingLoop();
            });
        }

        public Task connect(int backoffDelay = 0)
        {
            if (!this.startedConnecting)
            {
                this.startedConnecting = true;
                Task.Run(async () => Connect());
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

        public async void PingLoop()
        {
            try
            {

                if (this.keepAlive != null)
                {
                    await Task.Delay(Convert.ToInt32(this.keepAlive));
                }
                var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                if (this.verbose)
                {
                    Console.WriteLine($"PingLoop: {Exchange.Iso8601(now)}");
                }

                while (this.keepAlive != null && this.isConnected)
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
                        this.onError(this, new RequestTimeout("Connection to " + this.url + " timed out due to a ping-pong keepalive missing on time (no liveness within " + (convertedKeepAlive * this.maxPingPongMisses) + " ms = keepAlive " + convertedKeepAlive + " ms x " + this.maxPingPongMisses + " misses)"));
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
                                    await this.send((string)pingResult);
                                }
                                else
                                {
                                    await this.send(pingResult);

                                }
                            }
                        }
                        else
                        {
                            // this.webSocket.SendPing(); should we send ping here?

                        }
                    }
                    await Task.Delay(Convert.ToInt32(convertedKeepAlive));
                }
            }
            catch (Exception ex)
            {
                if (this.verbose)
                {
                    Console.WriteLine($"PingLoop error: {ex.Message}");
                }
                this.onError(this, ex);
            }
        }


        private static readonly SemaphoreSlim _connectSemaphore = new SemaphoreSlim(1, 1);

        public void Connect()
        {
            var tcs = this.connected;
            // Run the connection logic in a background task

            if (this.webSocket.State == WebSocketState.Open)
            {
                return; // already connected, return. Might happen when we call connect multiple times in a row

            }
            Task.Run(async () =>
            {
                try
                {
                    await _connectSemaphore.WaitAsync();
                    if (this.webSocket.State == WebSocketState.Open)
                    {
                        return; // already connected, return. Might happen when we call connect multiple times in a row

                    }
                    await webSocket.ConnectAsync(new Uri(url), CancellationToken.None);
                    if (this.verbose)
                    {
                        Console.WriteLine("WebSocket connected to " + url);
                    }
                    this.onOpen();
                    Task.Run(async () =>
                    {
                        Receiving(webSocket);
                    });
                }
                catch (Exception ex)
                {
                    tcs.SetException(ex); // Set the exception if something goes wrong
                }
                finally
                {
                    _connectSemaphore.Release();
                }
            });

            // return tcs.Task;
        }


        private static readonly SemaphoreSlim _sendSemaphore = new SemaphoreSlim(1, 1);

        protected static async Task sendAsyncWrapper(ClientWebSocket webSocket, ArraySegment<byte> ArraySegment, WebSocketMessageType WebSocketMessageType, bool endOnMessage, CancellationToken CancellationToken)
        {
            await _sendSemaphore.WaitAsync();
            try
            {
                if (webSocket.State == WebSocketState.Open)
                {
                    await webSocket.SendAsync(ArraySegment, WebSocketMessageType, endOnMessage, CancellationToken);
                }
            }
            finally
            {
                _sendSemaphore.Release();
            }
        }

        public async Task send(object message)
        {
            var jsonMessage = (message is string) ? ((string)message) : Exchange.Json(message);
            if (this.verbose)
            {
                Console.WriteLine($"Sending message: {jsonMessage}");
            }
            var bytes = Encoding.UTF8.GetBytes(jsonMessage);
            var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
            await sendAsyncWrapper(this.webSocket, arraySegment,
                                WebSocketMessageType.Text,
                                true,
                                CancellationToken.None);
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

        private async Task Receiving(ClientWebSocket webSocket)
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
                        result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                        memory.Write(buffer, 0, result.Count);
                    } while (!result.EndOfMessage);


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
                        this.onClose(this, null);
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                        this.isConnected = false;
                    }
                    // else if (result.MessageType == WebSocketMessageType.Pong)
                    // {
                    //     Console.WriteLine("On Pong message:");
                    //     // Handle the Pong message as needed
                    // }
                }
            }
            catch (Exception ex)
            {
                if (this.verbose)
                {
                    Console.WriteLine($"Receiving error: {ex.Message}");
                }
                this.isConnected = false;
                this.onError(this, ex);
            }
        }


        private bool LooksLikeRawDeflate(ReadOnlySpan<byte> b)
        {
            if (b.Length < 1) return false;
            byte first = b[0];
            int btype = (first >> 1) & 0b11;
            return btype == 0b01 || btype == 0b10;
        }

        public async Task Close()
        {
            if (this.webSocket.State == WebSocketState.Open)
            {
                try
                {
                    await this.webSocket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, "Close", CancellationToken.None);
                }
                catch (Exception e)
                {
                    // Console.WriteLine(e);
                }

            }
            foreach (var future in this.futures.Values)
            {
                if (!future.task.IsCompleted)
                {
                    future.reject(new ExchangeClosedByUser("Connection closed by the user"));

                }
            }
        }
    }

}
