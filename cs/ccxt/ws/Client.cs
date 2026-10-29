using System.Text;

namespace ccxt;

using System;
using System.Net.WebSockets;
using System.Collections;
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
        
        // ---- single owner ----
        // futures / subscriptions / rejections / error / the connect latch are plain fields
        // touched by one owner loop only; settlements run on the caller, so the hand-off is it.
        private readonly Dictionary<string, Future> futuresState = new Dictionary<string, Future>();
        private readonly Dictionary<string, object> subscriptionsState = new Dictionary<string, object>();
        private readonly Dictionary<string, object> rejectionsState = new Dictionary<string, object>();
        private bool isConnectedState = false;
        private bool startedConnectingState = false;
        private object errorState = null;
        private Task connectTaskState = null;

        public OwnedTable<Future> futures;
        public OwnedTable<object> subscriptions;
        public OwnedTable<object> rejections;

        public bool verbose = false;

        public bool isConnected
        {
            get { return (bool)ask(() => this.isConnectedState); }
            set { ask(() => { this.isConnectedState = value; return null; }); }
        }

        public bool startedConnecting
        {
            get { return (bool)ask(() => this.startedConnectingState); }
            set { ask(() => { this.startedConnectingState = value; return null; }); }
        }

        // mirrors js Client.error: null while live, the terminal error once retired.
        public object error
        {
            get { return ask(() => this.errorState); }
            set { ask(() => { this.errorState = value; return null; }); }
        }

        private readonly CancellationTokenSource connectCancellation = new CancellationTokenSource();

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
            this.futures = new OwnedTable<Future>(this.futuresState);
            this.subscriptions = new OwnedTable<object>(this.subscriptionsState);
            this.rejections = new OwnedTable<object>(this.rejectionsState);
            this.webSocket.Options.KeepAliveInterval = TimeSpan.Zero; // Disable unsolicited PONG. https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/websockets?#compression
            if (proxy != null)
            {
                var webProxy = new WebProxy(proxy);
                webSocket.Options.Proxy = webProxy;
            }
        }

        // ---- owner loop ----
        // one dedicated thread owns the settle state of every client in the process,
        // so an op never waits on another op and no work runs nested.
        private static readonly Handoff<OwnerOp> ownerQueue = new Handoff<OwnerOp>();

        static WebSocketClient()
        {
            Task.Factory.StartNew(ownerLoop, CancellationToken.None, TaskCreationOptions.LongRunning, TaskScheduler.Default);
            Task.Factory.StartNew(sendLoop, CancellationToken.None, TaskCreationOptions.LongRunning, TaskScheduler.Default);
        }

        private static void ownerLoop()
        {
            foreach (var op in ownerQueue.consume())
            {
                try
                {
                    op.reply.TrySetResult(op.work());
                }
                catch (Exception e)
                {
                    op.reply.TrySetException(e);
                }
            }
        }

        // hands the closure to the owner and blocks for its reply: the caller never
        // reads or writes the state itself, and the owner never waits on a caller
        private static object ask(Func<object> work)
        {
            var reply = new TaskCompletionSource<object>(TaskCreationOptions.RunContinuationsAsynchronously);
            ownerQueue.post(new OwnerOp(work, reply));
            return reply.Task.GetAwaiter().GetResult();
        }

        //  additive: the same owner answers for hand-written state that lives outside a
        //  single client (the exchange's dial backoff), so its table stays single-owner
        public static object onOwner(Func<object> work)
        {
            return ask(work);
        }

#nullable disable
        private readonly struct OwnerOp
        {
            public readonly Func<object> work;
            public readonly TaskCompletionSource<object> reply;

            public OwnerOp(Func<object> work, TaskCompletionSource<object> reply)
            {
                this.work = work;
                this.reply = reply;
            }
        }

        // producer/consumer hand-off: posts never block, the owner drains in arrival
        // order. BlockingCollection is the in-box channel for netstandard2.0.
        private sealed class Handoff<T>
        {
            private readonly BlockingCollection<T> queue = new BlockingCollection<T>();

            public void post(T item)
            {
                this.queue.Add(item);
            }

            public IEnumerable<T> consume()
            {
                return this.queue.GetConsumingEnumerable();
            }
        }

        // public face of the owner's dictionaries: every member ships its work to the
        // owner, so nothing outside the loop ever touches the dictionary. the js object
        // shape is kept whole (generic and non-generic) so the generated tiers read it.
        public sealed class OwnedTable<TValue> : IDictionary<string, TValue>, System.Collections.IDictionary where TValue : class
        {
            private readonly Dictionary<string, TValue> state;

            public OwnedTable(Dictionary<string, TValue> state)
            {
                this.state = state;
            }

            public TValue this[string key]
            {
                get { return (TValue)ask(() => this.state[key]); }
                set { ask(() => { this.state[key] = value; return null; }); }
            }

            public ICollection<string> Keys
            {
                get { return (ICollection<string>)ask(() => new List<string>(this.state.Keys)); }
            }

            public ICollection<TValue> Values
            {
                get { return (ICollection<TValue>)ask(() => new List<TValue>(this.state.Values)); }
            }

            public int Count
            {
                get { return (int)ask(() => this.state.Count); }
            }

            public bool IsReadOnly
            {
                get { return false; }
            }

            // concurrent-dictionary TryAdd semantics: false when the key is taken
            public bool TryAdd(string key, TValue value)
            {
                return (bool)ask(() =>
                {
                    if (this.state.ContainsKey(key))
                    {
                        return false;
                    }
                    this.state[key] = value;
                    return true;
                });
            }

            // remove-and-return in one step, so an absent key stays distinguishable
            // from a present key whose value is null
            public TValue take(string key)
            {
                return (TValue)ask(() =>
                {
                    TValue value;
                    if (!this.state.TryGetValue(key, out value))
                    {
                        return null;
                    }
                    this.state.Remove(key);
                    return value;
                });
            }

            public void Add(string key, TValue value)
            {
                ask(() => { this.state.Add(key, value); return null; });
            }

            public bool ContainsKey(string key)
            {
                return (bool)ask(() => this.state.ContainsKey(key));
            }

            public bool Remove(string key)
            {
                return (bool)ask(() => this.state.Remove(key));
            }

            public bool TryGetValue(string key, out TValue value)
            {
                var outcome = (object[])ask(() =>
                {
                    TValue found;
                    if (this.state.TryGetValue(key, out found))
                    {
                        return new object[] { true, found };
                    }
                    return new object[] { false, null };
                });
                value = (TValue)outcome[1];
                return (bool)outcome[0];
            }

            public void Add(KeyValuePair<string, TValue> item)
            {
                this.Add(item.Key, item.Value);
            }

            public bool Contains(KeyValuePair<string, TValue> item)
            {
                return this.ContainsKey(item.Key);
            }

            public void CopyTo(KeyValuePair<string, TValue>[] array, int arrayIndex)
            {
                var snapshot = (List<KeyValuePair<string, TValue>>)ask(() => new List<KeyValuePair<string, TValue>>(this.state));
                snapshot.CopyTo(array, arrayIndex);
            }

            public bool Remove(KeyValuePair<string, TValue> item)
            {
                return this.Remove(item.Key);
            }

            public void Clear()
            {
                ask(() => { this.state.Clear(); return null; });
            }

            public IEnumerator<KeyValuePair<string, TValue>> GetEnumerator()
            {
                var snapshot = (List<KeyValuePair<string, TValue>>)ask(() => new List<KeyValuePair<string, TValue>>(this.state));
                return snapshot.GetEnumerator();
            }

            IEnumerator IEnumerable.GetEnumerator()
            {
                return this.GetEnumerator();
            }

            // one owner-built snapshot serves the non-generic reads: the owner answers
            // with a copy, so an enumerator over it never touches the live table
            private Hashtable snapshotTable()
            {
                var snapshot = (List<KeyValuePair<string, TValue>>)ask(() => new List<KeyValuePair<string, TValue>>(this.state));
                var table = new Hashtable();
                foreach (var pair in snapshot)
                {
                    table[pair.Key] = pair.Value;
                }
                return table;
            }

            object System.Collections.IDictionary.this[object key]
            {
                get
                {
                    return ask(() =>
                    {
                        TValue found;
                        if (this.state.TryGetValue((string)key, out found))
                        {
                            return found;
                        }
                        return null;
                    });
                }
                set { ask(() => { this.state[(string)key] = (TValue)value; return null; }); }
            }

            System.Collections.ICollection System.Collections.IDictionary.Keys
            {
                get { return this.snapshotTable().Keys; }
            }

            System.Collections.ICollection System.Collections.IDictionary.Values
            {
                get { return this.snapshotTable().Values; }
            }

            bool System.Collections.IDictionary.IsFixedSize
            {
                get { return false; }
            }

            bool System.Collections.ICollection.IsSynchronized
            {
                get { return false; }
            }

            object System.Collections.ICollection.SyncRoot
            {
                get { return this; }
            }

            void System.Collections.ICollection.CopyTo(Array array, int index)
            {
                this.snapshotTable().CopyTo(array, index);
            }

            bool System.Collections.IDictionary.Contains(object key)
            {
                return (bool)ask(() => this.state.ContainsKey((string)key));
            }

            void System.Collections.IDictionary.Add(object key, object value)
            {
                ask(() => { this.state.Add((string)key, (TValue)value); return null; });
            }

            void System.Collections.IDictionary.Remove(object key)
            {
                ask(() => { this.state.Remove((string)key); return null; });
            }

            System.Collections.IDictionaryEnumerator System.Collections.IDictionary.GetEnumerator()
            {
                return this.snapshotTable().GetEnumerator();
            }
        }
#nullable enable

        // ---- settle api: every caller hands off, the owner answers ----
        public Future getFuture(string messageHash)
        {
            if (messageHash == null)
            {
                return null;
            }
            return (Future)ask(() =>
            {
                Future existing;
                if (this.futuresState.TryGetValue(messageHash, out existing))
                {
                    return existing;
                }
                return null;
            });
        }

        // the subscription value under a key; null when absent, null or an empty string
        public object getSubscription(string messageHash)
        {
            if (messageHash == null)
            {
                return null;
            }
            return ask(() =>
            {
                object existing;
                if (this.subscriptionsState.TryGetValue(messageHash, out existing) && existing != null && existing.ToString().Length > 0)
                {
                    return existing;
                }
                return null;
            });
        }

        // claims the keys this call won; a key already claimed under the same
        // subscription value stays claimed and is not reported back
        public List<string> claimSubscriptions(List<string> keys, object subscription)
        {
            if (keys == null)
            {
                return new List<string>();
            }
            var value = subscription ?? true;
            return (List<string>)ask(() =>
            {
                var won = new List<string>();
                foreach (var key in keys)
                {
                    if (key == null)
                    {
                        continue;
                    }
                    if (!this.subscriptionsState.ContainsKey(key))
                    {
                        this.subscriptionsState[key] = value;
                        won.Add(key);
                    }
                }
                return won;
            });
        }

        public void releaseSubscriptions(List<string> keys)
        {
            if (keys == null)
            {
                return;
            }
            ask(() =>
            {
                foreach (var key in keys)
                {
                    if (key != null)
                    {
                        this.subscriptionsState.Remove(key);
                    }
                }
                return null;
            });
        }

        public Future future(object messageHash2)
        {
            var messageHash = messageHash2.ToString();
            // one hand-off answers three questions atomically: attach the waiter, take
            // the rejection recorded before it arrived, refuse a retired client
            var outcome = (object[])ask(() =>
            {
                Future pending;
                if (!this.futuresState.TryGetValue(messageHash, out pending))
                {
                    pending = new Future();
                    this.futuresState[messageHash] = pending;
                }
                object rejection;
                if (!this.rejectionsState.TryGetValue(messageHash, out rejection))
                {
                    rejection = null;
                }
                else
                {
                    this.rejectionsState.Remove(messageHash);
                }
                return new object[] { pending, rejection ?? this.errorState };
            });
            var future = (Future)outcome[0];
            var rejection = outcome[1];
            // settle on the caller: the TaskCompletionSource is not
            // RunContinuationsAsynchronously so awaiter continuations run here
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
            var future = (Future)ask(() =>
            {
                Future pending;
                if (!this.futuresState.TryGetValue(messageHash, out pending))
                {
                    return null;
                }
                this.futuresState.Remove(messageHash);
                return pending;
            });
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
                // a hash that already answered is remembered, so the future a late
                // caller attaches below is rejected instead of waited on forever
                var future = (Future)ask(() =>
                {
                    Future pending;
                    if (!this.futuresState.TryGetValue(messageHash, out pending))
                    {
                        this.rejectionsState[messageHash] = content;
                        return null;
                    }
                    this.futuresState.Remove(messageHash);
                    return pending;
                });
                if (future != null)
                {
                    future.reject(content);
                }
            }
            else
            {
                var settled = (List<Future>)ask(() =>
                {
                    var drained = new List<Future>(this.futuresState.Values);
                    this.futuresState.Clear();
                    return drained;
                });
                foreach (var future in settled)
                {
                    future.reject(content);
                }
            }
        }

        // mirrors js Client.reset: reject every pending future and clear the
        // consumer state. settles on the caller, Future's
        // TaskCompletionSource runs continuations inline.
        public void reset(object error)
        {
            var settled = (List<Future>)ask(() =>
            {
                var drained = new List<Future>(this.futuresState.Values);
                this.futuresState.Clear();
                this.subscriptionsState.Clear();
                return drained;
            });
            foreach (var future in settled)
            {
                future.reject(error);
            }
        }

        // mirrors js Client.onError: set the error marker, reset, notify the
        // exchange. the owner elects one winner when the transport error, a
        // late onClose and a user Close() race on separate threads.
        public void onError(object error)
        {
            var elected = (bool)ask(() =>
            {
                if (this.errorState != null)
                {
                    return false;
                }
                this.errorState = error;
                return true;
            });
            if (!elected)
            {
                return;
            }
            this.isConnected = false; // stops PingLoop's while() condition
            if (this.startedConnecting)
            {
                var connectionError = error as Exception ?? new Exception(error?.ToString() ?? "WebSocket connection failed");
                this.connected.TrySetException(connectionError);
            }
            this.reset(error);
            this.onErrorCallback?.Invoke(this, error);
        }

        public void onOpen()
        {

            this.connectionEstablished = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            this.isConnected = true;
            // Awaiters can resume inline in SetResult: publish the ready state first.
            this.connected.SetResult(true);
            // this.clearConnectionTimeout();
            Task.Run(async () =>
            {
                PingLoop();
            });
        }

        public Task connect(int backoffDelay = 0)
        {
            // the owner elects the dialer: the latch, the retire check and the dial
            // start are one step, so a Close() cannot land between them
            var priorError = ask(() =>
            {
                if (this.startedConnectingState)
                {
                    return null;
                }
                this.startedConnectingState = true;
                if (this.errorState != null)
                {
                    return this.errorState;
                }
                // run the dial on the thread pool: called inline it would capture the
                // caller's SynchronizationContext (a UI thread) and marshal onOpen and
                // the whole receive loop onto it
                var cancellationToken = this.connectCancellation.Token;
                this.connectTaskState = Task.Run(() => this.Connect(backoffDelay, cancellationToken));
                return null;
            });
            if (priorError != null)
            {
                var connectionError = priorError as Exception ?? new Exception(priorError.ToString());
                this.connected.TrySetException(connectionError);
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
                        this.onError(new RequestTimeout("Connection to " + this.url + " timed out due to a ping-pong keepalive missing on time (no liveness within " + (convertedKeepAlive * this.maxPingPongMisses) + " ms = keepAlive " + convertedKeepAlive + " ms x " + this.maxPingPongMisses + " misses)"));
                        // onError rejects the pending futures and the exchange drops
                        // this client from its registry, but the socket itself is
                        // still open: leaving the loop does not tear it down, and the
                        // server never asked for a close. left alone the Receiving
                        // task keeps pulling frames and dispatching them into the
                        // exchange caches next to the replacement connection the
                        // next watch call opens. close the transport here so the
                        // timeout ends the connection and not only the futures
                        // waiting on it, mirroring ts/src/base/ws/Client.ts
                        // onPingInterval (ccxt/ccxt#30293)
                        await this.Close();
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
                this.onError(ex);
            }
        }


        private async Task Connect(int backoffDelay, CancellationToken cancellationToken)
        {
            try
            {
                if (backoffDelay > 0)
                {
                    await Task.Delay(backoffDelay, cancellationToken);
                }

                // the owner elected this call as the only dialer for this client, so the
                // socket is dialled by one path and no other dial can be in flight
                if (this.webSocket.State == WebSocketState.Open)
                {
                    return;
                }

                await webSocket.ConnectAsync(new Uri(url), cancellationToken);
                if (this.verbose)
                {
                    Console.WriteLine("WebSocket connected to " + url);
                }
                this.onOpen();
                // start the receive loop off this path: inline, it would handle frames that
                // are already buffered while the dial is still settling
                _ = Task.Run(() => this.Receiving(webSocket));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                this.onError(this.error ?? new ExchangeClosedByUser("Connection closed by the user"));
            }
            catch (Exception ex)
            {
                this.onError(ex);
            }
        }


        //  one sender thread drains every client's frames in post order, so a socket never
        //  has two SendAsync calls in flight and callers only await their own reply
        private static readonly Handoff<SendOp> sendQueue = new Handoff<SendOp>();

        private static void sendLoop()
        {
            foreach (var op in sendQueue.consume())
            {
                try
                {
                    if (op.webSocket.State == WebSocketState.Open)
                    {
                        op.webSocket.SendAsync(op.segment, op.type, op.end, op.cancellation).GetAwaiter().GetResult();
                    }
                    op.reply.TrySetResult(true);
                }
                catch (Exception e)
                {
                    op.reply.TrySetException(e);
                }
            }
        }

        private sealed class SendOp
        {
            public readonly ClientWebSocket webSocket;
            public readonly ArraySegment<byte> segment;
            public readonly WebSocketMessageType type;
            public readonly bool end;
            public readonly CancellationToken cancellation;
            public readonly TaskCompletionSource<bool> reply = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);

            public SendOp(ClientWebSocket webSocket, ArraySegment<byte> segment, WebSocketMessageType type, bool end, CancellationToken cancellation)
            {
                this.webSocket = webSocket;
                this.segment = segment;
                this.type = type;
                this.end = end;
                this.cancellation = cancellation;
            }
        }

        protected static Task sendAsyncWrapper(ClientWebSocket webSocket, ArraySegment<byte> ArraySegment, WebSocketMessageType WebSocketMessageType, bool endOnMessage, CancellationToken CancellationToken)
        {
            var op = new SendOp(webSocket, ArraySegment, WebSocketMessageType, endOnMessage, CancellationToken);
            sendQueue.post(op);
            return op.reply.Task;
        }

        public async Task send(object message)
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
                this.onError(ex);
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
            // read the dial out of the owner, then retire: the cancelled token reaches
            // a dial that is still in flight, and the latch keeps a new one from starting
            var pendingConnect = (Task)ask(() => this.connectTaskState);
            this.connectCancellation.Cancel();
            this.onError(new ExchangeClosedByUser("Connection closed by the user"));
            if (pendingConnect != null)
            {
                await pendingConnect;
            }
            if (this.webSocket.State == WebSocketState.Open)
            {
                try
                {
                    await this.webSocket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, "Close", CancellationToken.None);
                }
                catch (Exception)
                {
                    // the transport is going away regardless
                }
            }
        }
    }

}
