namespace ccxt;

using dict = Dictionary<string, object>;
using System.Net.WebSockets;
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

    public WebSocketClient client(object url2)
    {
        var url = url2.ToString();
        if (!this.clients.ContainsKey(url))
        {
            this.clients[url] = new WebSocketClient(url, handleMessage, this.verbose);
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
        // return future;
    }
}