namespace ccxt;
using System.Net.WebSockets;

public partial class Exchange
{
    public Dictionary<string, WebSocketClient> clients = new Dictionary<string, WebSocketClient>();
    public static ClientWebSocket ws = null;

    public ccxt.pro.OrderBook orderBook(object snapshot = null, object depth = null)
    {
        return new ccxt.pro.OrderBook(snapshot, depth);
    }

    public ccxt.pro.IndexedOrderBook indexedOrderBook(object snapshot = null, object depth = null)
    {
        return new ccxt.pro.IndexedOrderBook(snapshot, depth);
    }

    public ccxt.pro.CountedOrderBook countedOrderBook(object snapshot = null, object depth = null)
    {
        return new ccxt.pro.CountedOrderBook(snapshot, depth);
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
            var stored = getValue(this.orderbooks, symbol) as ccxt.pro.IOrderBook;
            while (isLessThan(tries, maxRetries))
            {
                var cache = stored.cache;
                object orderBook = await this.fetchRestOrderBookSafe(symbol, limit, parameters);
                object index = this.getCacheIndex(orderBook, cache);
                if (isTrue(isGreaterThanOrEqual(index, 0)))
                {
                    stored.reset(orderBook);
                    this.handleDeltas(stored, arraySlice(cache, index));
                    // getArrayLength((stored as ccxt.pro.OrderBook).cache) = 0;
                    stored.cache.Clear();
                    client.resolve(stored, messageHash);
                    return;
                }
                postFixIncrement(ref tries);
            }
            (client).reject(new ExchangeError(add(add(add(this.id, " nonce is behind the cache after "), ((object)maxRetries).ToString()), " tries.")), messageHash);

        }
        catch (Exception e)
        {
            (client).reject(e, messageHash);
            await this.loadOrderBook(client, messageHash, symbol, limit, parameters);
        }
    }


    public virtual void handleMessage(WebSocketClient client, object messageContent)
    {
        // Console.WriteLine("handleMessage");
        // Console.WriteLine(messageContent);
    }

    public virtual object ping(WebSocketClient client)
    {
        // Console.WriteLine("ping");
        return null;
    }

    public string getWsProxy(List<object> proxies)
    {

        if (proxies == null)
        {
            return null;
        }
        if (proxies[0] != null)
        {
            return proxies[0].ToString();
        }
        if (proxies[1] != null)
        {
            return proxies[1].ToString();
        }
        if (proxies[2] != null)
        {
            return proxies[2].ToString();
        }
        return null;
    }

    public WebSocketClient client(object url2)
    {
        var url = url2.ToString();
        var result = this.checkWsProxySettings() as List<object>;
        var proxy = this.getWsProxy(result);
        if (!this.clients.ContainsKey(url))
        {
            this.clients[url] = new WebSocketClient(url, proxy, handleMessage, ping, onClose, onError, this.verbose);
            object ws = this.safeValue(this.options, "ws", new Dictionary<string, object>() {});
            object wsOptions = this.safeValue(ws, "options", new Dictionary<string, object>() {});
            var wsHeaders = this.safeValue(wsOptions, "headers", new Dictionary<string, object>() {});
            // iterate through headers
            if (wsHeaders != null) {
                var headers = wsHeaders as Dictionary<string, object>;
                foreach (var key in headers.Keys)
                {
                    this.clients[url].webSocket.Options.SetRequestHeader(key, headers[key].ToString());
                }
            }
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
                    future.reject(ex);
                    // future.SetException(ex); check this out
                }

            }
        }

        return await future;
    }

    public async Task<object> watchMultiple(object url2, object messageHashes2, object message = null, object subscribeHashes2 = null, object subscription = null)
    {
        var url = url2.ToString();
        var messageHashes = (messageHashes2 as List<object>).Select(obj => obj.ToString()).ToList();
        var subscribeHashes = (subscribeHashes2 as List<object>).Select(obj => obj.ToString()).ToList();

        var client = this.client(url);


        var future = Future.race(messageHashes.Select(subHash => client.future(subHash)).ToArray());

        var missingSubscriptions = new List<string>();

        if (subscribeHashes != null)
        {
            foreach (var subscribeHash in subscribeHashes)
            {
                var clientSubscription = (subscribeHash != null && client.subscriptions.ContainsKey(subscribeHash)) ? client.subscriptions[subscribeHash] : null;

                if (clientSubscription == null)
                {
                    client.subscriptions[subscribeHash] = subscription ?? true;
                    missingSubscriptions.Add(subscribeHash);
                }
            }
        }

        var connected = client.connect(0);

        if (subscribeHashes == null || missingSubscriptions.Count > 0)
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
                    foreach (var subscribeHash in missingSubscriptions)
                    {
                        client.subscriptions.Remove(subscribeHash);
                    }
                    future.reject(ex); // check this out
                }
            }
        }

        return await future;
    }
}
