namespace ccxt;

using System.Net.WebSockets;
using System.Collections.Concurrent;

public partial class BaseExchange
{

    private Dictionary<string, long[]> wsBackoffState = new Dictionary<string, long[]>();

    // exponential reconnect backoff with rng-free jitter, mirrors ts/src/base/Exchange.ts
    // calculateWsBackoffDelay, see https://github.com/ccxt/ccxt/issues/23525
    public int calculateWsBackoffDelay(string url)
    {
        var wsOptions = this.safeDict(this.options, "ws", new Dictionary<string, object>());
        var backoff = this.safeDict(wsOptions, "backoff", new Dictionary<string, object>());
        var baseDelay = (long)(this.safeInteger(backoff, "base", 1000));
        var factor = (long)(this.safeInteger(backoff, "factor", 2));
        var maxDelay = (long)(this.safeInteger(backoff, "max", 60000));
        var stableAfter = (long)(this.safeInteger(backoff, "stableAfter", 30000));
        var now = this.milliseconds();
        long attempts = 0;
        long lastAttempt = 0;
        if (this.wsBackoffState.ContainsKey(url))
        {
            attempts = this.wsBackoffState[url][0];
            lastAttempt = this.wsBackoffState[url][1];
        }
        if ((lastAttempt > 0) && ((now - lastAttempt) > stableAfter))
        {
            attempts = 0; // the previous connection was healthy long enough, start fresh
        }
        this.wsBackoffState[url] = new long[] { attempts + 1, now };
        if (attempts == 0)
        {
            return 0; // first dial or recovered, connect immediately
        }
        var delay = baseDelay;
        var capped = Math.Min(attempts, 20); // overflow guard
        for (long i = 1; i < capped; i++)
        {
            delay = delay * factor;
        }
        var jitterMillis = now % 1000; // rng-free jitter
        var jittered = (long)(delay * (0.8 + (jitterMillis / 2500.0))); // 0.8x .. 1.2x
        return (int)Math.Min(jittered, maxDelay); // the ceiling holds regardless of jitter
    }
    public ConcurrentDictionary<string, WebSocketClient> clients = new ConcurrentDictionary<string, WebSocketClient>();
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
        if (client.error)
        {
            // what do we do here?
        }
        else
        {
            this.CleanupClients(client, error);
        }
    }

    public virtual void onError(WebSocketClient client, object error = null)
    {
        this.CleanupClients(client, error);
    }

    public void CleanupClients(WebSocketClient client, object error = null)
    {
        // var client = (WebSocketClient)client2;
        var urlClient = (this.clients.ContainsKey(client.url)) ? this.clients[client.url] : null;
        if (urlClient != null) //  && urlClient.error
        {
            rejectFutures(urlClient, error);
            // this.clients.Remove(client.url);
            this.clients.TryRemove(client.url, out _);
        }
    }

    void rejectFutures(WebSocketClient urlClient, object error)
    {
        foreach (var KeyValue in urlClient.subscriptions)
        {
            urlClient.subscriptions.Remove(KeyValue.Key);
            Future existingFuture = null;
            if (urlClient.futures.TryGetValue(KeyValue.Key, out existingFuture))
            {
                existingFuture.reject(error);
            }
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
        Exception error = null;
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
            error = new ExchangeError(add(add(add(this.id, " nonce is behind the cache after "), ((object)maxRetries).ToString()), " tries."));
        }
        catch (Exception e)
        {
            error = e;
        }
        // a failed synchronization must not recurse into another attempt with the
        // same broken state - previously the catch invoked loadOrderBook again,
        // recursing endlessly when the snapshot request kept failing, see
        // https://github.com/ccxt/ccxt/pull/24224 and https://github.com/ccxt/ccxt/issues/14567
        // instead, reject the watcher and drop the connection and the cached
        // orderbook, so the next watchOrderBook() call resubscribes cleanly
        (client).reject(error, messageHash);
        this.clients.TryRemove(client.url, out _);
        ((System.Collections.Generic.IDictionary<string, object>)this.orderbooks)[(string)symbol] = this.orderBook();
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
        return this.clients.GetOrAdd(url, (url) =>
        {
            object ws = this.safeValue(this.options, "ws", new Dictionary<string, object>() { });
            var wsOptions = this.safeValue(ws, "options", new Dictionary<string, object>() { });
            wsOptions = this.deepExtend(this.streaming, wsOptions);
            var keepAliveValue = this.safeInteger(wsOptions, "keepAlive", 30000) ?? 30000;
            var keepAlive = keepAliveValue;
            var decompressBinary = this.safeBool(this.options, "decompressBinary", true) as bool? ?? true;
            var client = new WebSocketClient(url, proxy, handleMessage, ping, onClose, onError, this.verbose, keepAlive, decompressBinary);

            var wsHeaders = this.safeValue(wsOptions, "headers", new Dictionary<string, object>() { });
            // iterate through headers
            if (wsHeaders != null)
            {
                var headers = wsHeaders as Dictionary<string, object>;
                foreach (var key in headers.Keys)
                {
                    client.webSocket.Options.SetRequestHeader(key, headers[key].ToString());
                }
            }

            var wsCookies = this.safeDict(ws, "cookies", new Dictionary<string, object>() { }) as Dictionary<string, object>;
            if (wsCookies != null && wsCookies.Count > 0)
            {
                var cookieString = string.Join("; ", wsCookies.Select(kvp => $"{kvp.Key}={kvp.Value}"));
                client.webSocket.Options.SetRequestHeader("Cookie", cookieString);
            }

            return client;
        });
    }

    public async Task<object> watch(object url2, object messageHash2, object message = null, object subscribeHash2 = null, object subscription = null)
    {
        var url = url2.ToString();
        var messageHash = messageHash2.ToString();
        var subscribeHash = subscribeHash2?.ToString();
        var client = this.client(url);
        var backoffDelay = 0;

        Future existingFuture = null;
        if (subscribeHash == null && (client.futures as ConcurrentDictionary<string, Future>).TryGetValue(messageHash, out existingFuture))
        {
            return await existingFuture;
        }
        var future = client.future(messageHash);
        object clientSubscription = null;
        bool clientSubscriptionExists = (client.subscriptions as ConcurrentDictionary<string, object>).TryGetValue(subscribeHash, out clientSubscription);
        if (!clientSubscriptionExists)
        {
            (client.subscriptions as ConcurrentDictionary<string, object>).TryAdd(subscribeHash, subscription ?? true);
        }
        if (!client.startedConnecting)
        {
            // count real dials only, see https://github.com/ccxt/ccxt/pull/29627
            backoffDelay = this.calculateWsBackoffDelay(url);
        }
        var connected = client.connect(backoffDelay);
        if (!clientSubscriptionExists)
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
                if (subscribeHash == null) continue;

                if ((client.subscriptions as ConcurrentDictionary<string, object>).TryAdd(subscribeHash, subscription ?? true))
                {
                    missingSubscriptions.Add(subscribeHash);
                }
            }
        }

        var backoffDelay2 = 0;
        if (!client.startedConnecting)
        {
            // count real dials only, see https://github.com/ccxt/ccxt/pull/29627
            backoffDelay2 = this.calculateWsBackoffDelay(url);
        }
        var connected = client.connect(backoffDelay2);

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