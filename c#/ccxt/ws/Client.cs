using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;
using System.Net;

namespace ccxt;

using dict = Dictionary<string, object>;
using System.Net.WebSockets;
using System.Data;
using System.Runtime.InteropServices;
using Newtonsoft.Json;


public partial class Exchange
{
    public Dictionary<string, WebSocketClient> clients = new Dictionary<string, WebSocketClient>();
    public static ClientWebSocket ws = null;

    public ccxt.OrderBook orderBook(object snapshot = null, object depth = null)
    {
        return new ccxt.OrderBook(snapshot, depth);
    }

    public ccxt.IndexedOrderBook indexedOrderBook(object snapshot = null, object depth = null)
    {
        return new ccxt.IndexedOrderBook(snapshot, depth);
    }

    public ccxt.CountedOrderBook countedOrderBook(object snapshot = null, object depth = null)
    {
        return new ccxt.CountedOrderBook(snapshot, depth);
    }

    public virtual void onClose(WebSocketClient client, object error = null)
    {
        // var client = (WebSocketClient)client2;
        if (client.error)
        {
            // what do we do here?
        }
        else
        {
            var urlClient = (this.clients.ContainsKey(client.url)) ? this.clients[client.url] : null;
            if (urlClient != null)
            {
                this.clients.Remove(client.url);
            }
        }
    }

    public virtual void onError(WebSocketClient client, object error = null)
    {
        // var client = (WebSocketClient)client2;
        var urlClient = (this.clients.ContainsKey(client.url)) ? this.clients[client.url] : null;
        if (urlClient != null && urlClient.error)
        {
            this.clients.Remove(client.url);
        }
    }

    public async virtual Task loadOrderBook(WebSocketClient client, object messageHash, object symbol, object limit = null, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        if (!isTrue((inOp(this.orderbooks, symbol))))
        {
            (client).reject(new ExchangeError(add(this.id, " loadOrderBook() orderbook is not initiated")), messageHash);
            return;
        }
        object maxRetries = this.handleOption("watchOrderBook", "snapshotMaxRetries", 3);
        object tries = 0;
        try
        {
            var stored = getValue(this.orderbooks, symbol) as ccxt.OrderBook;
            while (isLessThan(tries, maxRetries))
            {
                var cache = stored.cache;
                object orderBook = await this.fetchRestOrderBookSafe(symbol, limit, parameters);
                object index = this.getCacheIndex(orderBook, cache);
                if (isTrue(isGreaterThanOrEqual(index, 0)))
                {
                    stored.reset(orderBook);
                    this.handleDeltas(stored, slice(cache, index, null));
                    // getArrayLength((stored as ccxt.OrderBook).cache) = 0;
                    stored.cache.Clear();
                    client.resolve(stored, messageHash);
                    return;
                }
                postFixIncrement(ref tries);
            }
            ((WebSocketClient)client).reject(new ExchangeError(add(add(add(this.id, " nonce is behind the cache after "), ((object)maxRetries).ToString()), " tries.")), messageHash);

        }
        catch (Exception e)
        {
            ((WebSocketClient)client).reject(e, messageHash);
            await this.loadOrderBook(client as WebSocketClient, messageHash, symbol, limit, parameters);
        }
    }

    async public Task runWs()
    {
        try
        {

            var binance = new binanceWs();
            await binance.loadMarkets();
            binance.verbose = true;
            while (true)
            {
                var message = await binance.watchOrderBook("BTC/USDT", 1);
                Console.WriteLine(JsonConvert.SerializeObject(message, Formatting.Indented));
            }

        }
        catch (Exception ex)
        {
            Console.WriteLine("ERROR: " + ex.ToString());
        }
    }

    public class Future
    {
        public TaskCompletionSource<object> tcs = null;

        public Task<object> task = null;
        public Future()
        {
            this.tcs = new TaskCompletionSource<object>();
            this.task = this.tcs.Task;
        }

        public void resolve(object data = null)
        {
            this.tcs.SetResult(data);
            this.tcs = new TaskCompletionSource<object>(); // reset
            this.task = this.tcs.Task;
        }

        public void reject(object data)
        {
            this.tcs.SetException(new Exception(data.ToString()));
            this.tcs = new TaskCompletionSource<object>(); // reset
            this.task = this.tcs.Task;
        }
    }

    public virtual void handleMessage(WebSocketClient client, object messageContent)
    {
        Console.WriteLine("handleMessage");
        Console.WriteLine(messageContent);
        // var future = client.futures["test"];
        // future.resolve(messageContent);
        client.resolve(messageContent, "test");
        // future.SetResult(messageContent);

    }

    public WebSocketClient client(object url2)
    {
        var url = url2.ToString();
        if (!this.clients.ContainsKey(url))
        {
            this.clients[url] = new WebSocketClient(url, handleMessage);
        }
        return this.clients[url];
    }

    public async Task<object> watch(object url2, object messageHash2, object message = null, object subscribeHash2 = null, object subscription = null)
    {
        var url = url2.ToString();
        var messageHash = messageHash2.ToString();
        var subscribeHash = subscribeHash2?.ToString();
        var client = this.client(url);

        if ((subscribeHash == null) && (client.futures.ContainsKey(messageHash)))
        {
            return client.futures[messageHash];
        }

        var future = client.future(messageHash);

        var clientSubscription = (subscribeHash != null && client.subscriptions.ContainsKey(subscribeHash)) ? client.subscriptions[subscribeHash] : null;

        if (clientSubscription == null)
        {
            client.subscriptions[subscribeHash] = subscription ?? true;
        }

        var connected = client.connect(0);

        if (clientSubscription == null)
        {
            await connected;
            if (message != null)
            {
                try
                {
                    await client.send(message);
                }
                catch (Exception ex)
                {
                    client.subscriptions.Remove(subscribeHash);
                    // future.SetException(ex); check this out
                }

            }
        }

        return await future;
    }

    public class WebSocketClient
    {
        public string url; // Replace with your WebSocket server URL
        public ClientWebSocket webSocket = new ClientWebSocket();

        public Dictionary<string, Future> futures = new Dictionary<string, Future>();
        public Dictionary<string, object> subscriptions = new Dictionary<string, object>();
        public Dictionary<string, object> rejections = new Dictionary<string, object>();

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

        public object lastPong = null;

        public object keepAlive = null;

        public bool error = false;

        public WebSocketClient(string url, handleMessageDelegate handleMessage)
        {
            this.url = url;
            var tcs = new TaskCompletionSource<bool>();
            this.connected = tcs;
            this.handleMessage = handleMessage;
        }

        public Task<object> future(object messageHash2)
        {
            var messageHash = messageHash2.ToString();
            // var tcs = new TaskCompletionSource<object>();
            // this.futures[messageHash] = tcs;
            // return tcs.Task;
            if (!this.futures.ContainsKey(messageHash))
            {
                // var tcs = new TaskCompletionSource<object>();
                var future = new Future();
                this.futures[messageHash] = future;
                return future.task;
            }
            else
            {
                return (Task<object>)this.futures[messageHash].task;
            }
        }

        public void resolve(object content, object messageHash2)
        {
            var messageHash = messageHash2.ToString();
            if (this.futures.ContainsKey(messageHash))
            {
                var future = this.futures[messageHash];
                this.futures.Remove(messageHash); // this order matters
                future.resolve(content);
            }
        }

        public void reject(object content, object messageHash2 = null)
        {
            if (messageHash2 != null)
            {
                var messageHash = messageHash2.ToString();
                if (this.futures.ContainsKey(messageHash))
                {
                    var future = this.futures[messageHash];
                    this.futures.Remove(messageHash); // this order matters
                    future.reject(content);
                }
            }

        }

        public void reset(object message2)
        {
            // stub implement this later
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

        public static async Task Main()
        {
            // var task = Connect();
            // await task;
            // Console.WriteLine("Connected inside main");
            // var message = "{\"method\": \"SUBSCRIBE\", \"params\": [ \"btcusdt @ticker\" ], \"id\": 1 }";
            // var bytes = Encoding.UTF8.GetBytes(message);
            // var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
            // await WebSocketClient.webSocket.SendAsync(arraySegment,
            //                     WebSocketMessageType.Text,
            //                     true,
            //                     CancellationToken.None);
            // Console.WriteLine("Sent message");

            // waitHandle.WaitOne();
            // await task.ContinueWith(t =>
            // {
            //     if (t.IsFaulted)
            //     {
            //         Console.WriteLine("Error: " + t.Exception.GetBaseException());
            //     }
            //     else
            //     {
            //         Console.WriteLine("Connected inside main");
            //         var message = "{\"method\": \"SUBSCRIBE\", \"params\": [ \"btcusdt @ticker\" ], \"id\": 1 }";
            //         var bytes = Encoding.UTF8.GetBytes(message);
            //         var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
            //         WebSocketClient.websocket.SendAsync(arraySegment,
            //                             WebSocketMessageType.Text,
            //                             true,
            //                             CancellationToken.None);
            //         // Task.WaitAll(Receiving(webSocket), Sending(webSocket));
            //     }
            // });
        }

        public void Connect()
        {
            var tcs = this.connected;
            // Run the connection logic in a background task
            Task.Run(async () =>
            {
                try
                {
                    await webSocket.ConnectAsync(new Uri(url), CancellationToken.None);
                    Console.WriteLine("WebSocket connected!");
                    Task.Run(async () =>
                    {
                        Receiving(webSocket);
                    });
                    // tcs.SetResult(true); // Mark the task as complete upon successful connection
                    tcs.SetResult(true);
                }
                catch (Exception ex)
                {
                    tcs.SetException(ex); // Set the exception if something goes wrong
                }
            });

            // return tcs.Task;
        }

        public async Task send(object message)
        {
            var bytes = Encoding.UTF8.GetBytes(Exchange.Json(message).ToString());
            var arraySegment = new ArraySegment<byte>(bytes, 0, bytes.Length);
            await this.webSocket.SendAsync(arraySegment,
                                WebSocketMessageType.Text,
                                true,
                                CancellationToken.None);
        }

        private static async Task Sending(ClientWebSocket webSocket)
        {
            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    Console.Write("Enter message to send: ");
                    string message = Console.ReadLine();

                    if (!string.IsNullOrEmpty(message))
                    {
                        var bytes = Encoding.UTF8.GetBytes(message);
                        await webSocket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Sending error: {ex.Message}");
            }
        }

        private async Task Receiving(ClientWebSocket webSocket)
        {
            var buffer = new byte[1024 * 4 * 10];
            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        var deserializedMessages = JsonHelper.Deserialize(message);

                        if (this.verbose) // remove || true
                        {
                            Console.WriteLine($"On message: {message}");
                        }

                        this.handleMessage(this, deserializedMessages);

                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        this.onClose(this, null);
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                    }
                }
            }
            catch (Exception ex)
            {
                if (this.verbose)
                {
                    Console.WriteLine($"Receiving error: {ex.Message}");
                }
                this.onError(this, ex);
            }
        }
    }

}