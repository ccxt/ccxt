using ccxt;
using ccxt.pro;

namespace Tests;

public partial class BaseTest
{
    private interface CacheReadProbe
    {
        Action BeforeFilter { get; set; }
    }

    private class CacheReadBinance : ccxt.pro.binance, CacheReadProbe
    {
        public Action BeforeFilter { get; set; }

        public override IList<object> filterBySinceLimit(object array, object since = null, object limit = null, object key = null, bool? tail = null)
        {
            var action = BeforeFilter;
            BeforeFilter = null;
            action?.Invoke();
            return base.filterBySinceLimit(array, since, limit, key, tail);
        }
    }

    private class CacheReadBybit : ccxt.pro.bybit, CacheReadProbe
    {
        public Action BeforeFilter { get; set; }

        public override Task<object> authenticate(string? url, IDictionary<string, object>? parameters = null)
        {
            // The already-connected transport is a stub; no credentials or
            // authentication request are needed for the private watch test.
            return Task.FromResult<object>(true);
        }

        public override IList<object> filterBySymbolSinceLimit(object array, object symbol = null, object since = null, object limit = null, bool? tail = null)
        {
            var action = BeforeFilter;
            BeforeFilter = null;
            action?.Invoke();
            return base.filterBySymbolSinceLimit(array, symbol, since, limit, tail);
        }

        public override IList<object> filterBySinceLimit(object array, object since = null, object limit = null, object key = null, bool? tail = null)
        {
            var action = BeforeFilter;
            BeforeFilter = null;
            action?.Invoke();
            return base.filterBySinceLimit(array, since, limit, key, tail);
        }
    }

    private static Dictionary<string, object> cacheTrade(string id, int timestamp, string symbol = "BTC/USDT")
    {
        return new Dictionary<string, object>() { { "symbol", symbol }, { "id", id }, { "timestamp", timestamp } };
    }

    private class CacheReadPolymarket : ccxt.prediction.polymarket
    {
        public BaseCache Cache;
        public Action BeforeFilter;

        public override Task loadApiCredentials() => Task.CompletedTask;

        public override Task<IDictionary<string, object>> loadOutcome(object outcomeSymbol, bool? reload = null)
        {
            return Task.FromResult<IDictionary<string, object>>(new Dictionary<string, object>() { { "outcome", outcomeSymbol } });
        }

        public override Task<object> subscribeUserChannel(string? messageHash, object parameters = null)
        {
            // A resolved subscription supplies the cache without opening a socket.
            return Task.FromResult<object>(Cache);
        }

        public override IList<object> filterByOutcomeSinceLimit(object array, object outcome = null, object since = null, object limit = null, bool? tail = null)
        {
            var action = BeforeFilter;
            BeforeFilter = null;
            action?.Invoke();
            return base.filterByOutcomeSinceLimit(array, outcome, since, limit, tail);
        }
    }

    public void testWsCacheReadWindows()
    {
        // The threaded receive/continuation interleaving is C#-specific; the
        // ordinary TS path reads its count and filters synchronously.
        foreach (var venue in new[] { "binance", "bybit" })
        foreach (var capacity in new int?[] { null, 3 })
        foreach (var newUpdates in new[] { true, false })
        {
            testTradeWatchReadWindow(venue, capacity, newUpdates).GetAwaiter().GetResult();
        }
        foreach (var capacity in new int?[] { null, 3 })
        foreach (var newUpdates in new[] { true, false })
        {
            testKeyedWatchReadWindow("orders", capacity, newUpdates, "BTC/USDT").GetAwaiter().GetResult();
            testKeyedWatchReadWindow("orders", capacity, newUpdates, null).GetAwaiter().GetResult();
            testKeyedWatchReadWindow("ohlcv", capacity, newUpdates, "BTC/USDT").GetAwaiter().GetResult();
            foreach (var kind in new[] { "orders", "trades" })
            foreach (var outcome in new string?[] { null, "event:YES" })
            {
                testOutcomeWatchReadWindow(kind, capacity, newUpdates, outcome).GetAwaiter().GetResult();
            }
        }
        testCacheReadPollingScopes();
        testCacheReadKeyedReferences();
    }

    private async Task testOutcomeWatchReadWindow(string kind, int? capacity, bool newUpdates, string? outcome)
    {
        var exchange = new CacheReadPolymarket();
        exchange.newUpdates = newUpdates;
        var cache = new ArrayCacheByOutcomeById(capacity);
        exchange.Cache = cache;
        object row(int timestamp) => new Dictionary<string, object>() {
            { "outcome", "event:YES" }, { "id", timestamp.ToString() }, { "timestamp", timestamp },
        };
        cache.append(row(1));
        cache.append(row(2));
        using var allowAppend = new ManualResetEventSlim(false);
        using var appended = new ManualResetEventSlim(false);
        var writer = Task.Run(() => {
            Assert(allowAppend.Wait(TimeSpan.FromSeconds(10)), "outcome watch did not reach its filter");
            try { cache.append(row(3)); }
            finally { appended.Set(); }
        });
        exchange.BeforeFilter = () => {
            allowAppend.Set();
            Assert(appended.Wait(TimeSpan.FromSeconds(10)), "outcome receive-thread append did not complete");
        };
        async Task<string?[]> readOnce()
        {
            if (kind == "orders")
            {
                return (await exchange.WatchOrders(outcome).WaitAsync(TimeSpan.FromSeconds(15))).Select(order => order.id).ToArray();
            }
            return (await exchange.WatchMyTrades(outcome).WaitAsync(TimeSpan.FromSeconds(15))).Select(trade => trade.id).ToArray();
        }
        var first = await readOnce();
        await writer;
        cache.append(row(4));
        var second = await readOnce();
        var expectedFirst = newUpdates ? new[] { "1", "2" } : new[] { "1", "2", "3" };
        var expectedSecond = newUpdates ? new[] { "3", "4" } : capacity == null ? new[] { "1", "2", "3", "4" } : new[] { "2", "3", "4" };
        Assert(first.SequenceEqual(expectedFirst), "outcome " + kind + " first watch lost or replayed a row: " + string.Join(",", first));
        Assert(second.SequenceEqual(expectedSecond), "outcome " + kind + " second watch lost or replayed a row: " + string.Join(",", second));
    }

    private async Task testKeyedWatchReadWindow(string kind, int? capacity, bool newUpdates, string symbol)
    {
        var exchange = new CacheReadBybit();
        exchange.newUpdates = newUpdates;
        exchange.setMarkets(new List<object>() { new Dictionary<string, object>() {
            { "id", "BTCUSDT" }, { "lowercaseId", "btcusdt" }, { "symbol", "BTC/USDT" },
            { "base", "BTC" }, { "quote", "USDT" }, { "type", "spot" }, { "spot", true },
            { "contract", false }, { "option", false },
        } });
        var options = (IDictionary<string, object>)exchange.options;
        options["enableUnifiedMargin"] = false;
        options["enableUnifiedAccount"] = true;
        var orders = kind == "orders";
        var url = (string)await exchange.getUrlByMarketType(symbol, orders, orders ? "watchOrders" : "watchOHLCVForSymbols", new Dictionary<string, object>());
        var client = exchange.client(url);
        client.startedConnecting = true;
        client.isConnected = true;
        client.isMock = true;
        client.connected.TrySetResult(true);
        var messageHash = orders ? "orders" + (symbol == null ? "" : ":" + symbol) : "ohlcv::BTC/USDT::1m";
        BaseCache cache = orders ? new ArrayCacheBySymbolById(capacity) : new ArrayCacheByTimestamp(capacity);
        object row(int timestamp) => orders ? cacheTrade(timestamp.ToString(), timestamp) : new List<object>() { timestamp, 1.0, 2.0, 0.5, 1.5, 10.0 };
        cache.append(row(1));
        cache.append(row(2));
        using var allowAppend = new ManualResetEventSlim(false);
        using var appended = new ManualResetEventSlim(false);
        var writer = Task.Run(() => {
            Assert(allowAppend.Wait(TimeSpan.FromSeconds(10)), "keyed watch did not reach its filter");
            try { cache.append(row(3)); }
            finally { appended.Set(); }
        });
        exchange.BeforeFilter = () => {
            allowAppend.Set();
            Assert(appended.Wait(TimeSpan.FromSeconds(10)), "keyed receive-thread append did not complete");
        };
        async Task<string?[]> readOnce()
        {
            if (orders)
            {
                var task = exchange.WatchOrders(symbol);
                client.resolve(cache, messageHash);
                return (await task.WaitAsync(TimeSpan.FromSeconds(15))).Select(order => order.id).ToArray();
            }
            var candles = exchange.WatchOHLCV("BTC/USDT", "1m");
            client.resolve(new List<object>() { "BTC/USDT", "1m", cache }, messageHash);
            return (await candles.WaitAsync(TimeSpan.FromSeconds(15))).Select(candle => candle.timestamp.ToString()).ToArray();
        }
        var first = await readOnce();
        await writer;
        cache.append(row(4));
        var second = await readOnce();
        var expectedFirst = newUpdates ? new[] { "1", "2" } : new[] { "1", "2", "3" };
        var expectedSecond = newUpdates ? new[] { "3", "4" } : capacity == null ? new[] { "1", "2", "3", "4" } : new[] { "2", "3", "4" };
        Assert(first.SequenceEqual(expectedFirst), kind + " first watch lost or replayed a row: " + string.Join(",", first));
        Assert(second.SequenceEqual(expectedSecond), kind + " second watch lost or replayed a row: " + string.Join(",", second));
    }

    private async Task testTradeWatchReadWindow(string venue, int? capacity, bool newUpdates)
    {
        Exchange exchange = venue == "binance" ? new CacheReadBinance() : new CacheReadBybit();
        exchange.newUpdates = newUpdates;
        exchange.setMarkets(new List<object>() { new Dictionary<string, object>() {
            { "id", "BTCUSDT" }, { "lowercaseId", "btcusdt" }, { "symbol", "BTC/USDT" },
            { "base", "BTC" }, { "quote", "USDT" }, { "type", "spot" }, { "spot", true },
            { "contract", false }, { "option", false },
        } });
        string url;
        string messageHash;
        if (exchange is CacheReadBinance binance)
        {
            url = binance.getWsUrl("spot", binance.getFutureWsCategory("trade")) + "/" + binance.stream("spot", "multipleTrades::BTC/USDT", 1);
            messageHash = "trade::BTC/USDT";
        }
        else
        {
            url = (string)await ((CacheReadBybit)exchange).getUrlByMarketType("BTC/USDT", false, "watchTrades", new Dictionary<string, object>());
            messageHash = "trade:BTC/USDT";
        }
        var client = exchange.client(url);
        // Same already-connected transport stub as setupWsMockTransport.
        client.startedConnecting = true;
        client.isConnected = true;
        client.isMock = true;
        client.connected.TrySetResult(true);
        var cache = new ArrayCache(capacity);
        cache.append(cacheTrade("a1", 1));
        cache.append(cacheTrade("a2", 2));
        using var allowAppend = new ManualResetEventSlim(false);
        using var appended = new ManualResetEventSlim(false);
        var writer = Task.Run(() => {
            Assert(allowAppend.Wait(TimeSpan.FromSeconds(10)), "watch did not reach its filter");
            try
            {
                cache.append(cacheTrade("a3", 3));
            }
            finally
            {
                appended.Set();
            }
        });
        ((CacheReadProbe)exchange).BeforeFilter = () => {
            allowAppend.Set();
            Assert(appended.Wait(TimeSpan.FromSeconds(10)), "receive-thread append did not complete");
        };
        var firstTask = exchange.WatchTradesForSymbols(new List<object>() { "BTC/USDT" });
        client.resolve(cache, messageHash);
        var first = (await firstTask.WaitAsync(TimeSpan.FromSeconds(15))).Select(trade => trade.id).ToArray();
        await writer;
        cache.append(cacheTrade("a4", 4));
        var secondTask = exchange.WatchTradesForSymbols(new List<object>() { "BTC/USDT" });
        client.resolve(cache, messageHash);
        var second = (await secondTask.WaitAsync(TimeSpan.FromSeconds(15))).Select(trade => trade.id).ToArray();
        var expectedFirst = newUpdates ? new[] { "a1", "a2" } : new[] { "a1", "a2", "a3" };
        var expectedSecond = newUpdates ? new[] { "a3", "a4" } : capacity == null ? new[] { "a1", "a2", "a3", "a4" } : new[] { "a2", "a3", "a4" };
        Assert(first.SequenceEqual(expectedFirst), venue + " first watch lost or replayed a trade: " + string.Join(",", first));
        Assert(second.SequenceEqual(expectedSecond), venue + " second watch lost or replayed a trade: " + string.Join(",", second));
    }

    private void testCacheReadPollingScopes()
    {
        var exchange = new BaseExchange(new Dictionary<string, object>());
        exchange.newUpdates = true;
        var cache = new ArrayCache(4);
        cache.append(cacheTrade("a1", 1));
        cache.append(cacheTrade("b1", 2, "ETH/USDT"));
        var btc = exchange.getCacheRead(cache, "BTC/USDT");
        var all = exchange.getCacheRead(cache);
        Assert(Convert.ToInt64(btc["limit"]) == 1, "symbol read must count its own updates");
        Assert(Convert.ToInt64(all["limit"]) == 2, "symbol read must not consume the global scope");
        cache.append(cacheTrade("a2", 3));
        cache.append(cacheTrade("b2", 4, "ETH/USDT"));
        Assert(((IList<object>)all["data"]).Count == 2, "returned rows must not grow with the live cache");
        var nextBtc = exchange.getCacheRead(cache, "BTC/USDT");
        var nextAll = exchange.getCacheRead(cache);
        var eth = exchange.getCacheRead(cache, "ETH/USDT", 1);
        Assert(Convert.ToInt64(nextBtc["limit"]) == 1, "next symbol read must exclude already counted updates");
        Assert(Convert.ToInt64(nextAll["limit"]) == 2, "next global read must retain both new updates");
        Assert(Convert.ToInt64(eth["limit"]) == 1, "explicit limit must be preserved");
        var filtered = exchange.filterBySymbolSinceLimit(eth["data"], "ETH/USDT", 3, eth["limit"], true);
        Assert(filtered.Count == 1 && (string)((IDictionary<string, object>)filtered[0])["id"] == "b2", "since/symbol filtering must apply to the captured rows");
        cache.clear();
        Assert(((IList<object>)nextAll["data"]).Count == 4, "clear must not change a captured row list");
        cache.append(cacheTrade("a2", 3));
        var redelivery = exchange.getCacheRead(cache, "BTC/USDT");
        Assert(Convert.ToInt64(redelivery["limit"]) == 1, "a second append of a trade ID is a new venue delivery");
    }

    private void testCacheReadKeyedReferences()
    {
        var exchange = new BaseExchange(new Dictionary<string, object>());
        exchange.newUpdates = true;
        var orders = new ArrayCacheBySymbolById(3);
        var order = cacheTrade("a1", 1);
        orders.append(order);
        orders.append(cacheTrade("a2", 2));
        var first = exchange.getCacheRead(orders, "BTC/USDT");
        var sameWindow = exchange.getCacheRead(orders, "BTC/USDT");
        Assert(Convert.ToInt64(sameWindow["limit"]) == 2, "repeated reads before append must retain the existing window semantics");
        var update = cacheTrade("a1", 3);
        orders.append(update);
        var rows = (IList<object>)first["data"];
        Assert(ReferenceEquals(rows[0], order), "snapshot must preserve keyed order identity");
        Assert((string)((IDictionary<string, object>)rows[1])["id"] == "a2", "an order update must not reorder an earlier snapshot");
        Assert(Convert.ToInt64(order["timestamp"]) == 3, "returned keyed rows must remain live references");
        var next = exchange.getCacheRead(orders, "BTC/USDT");
        Assert(Convert.ToInt64(next["limit"]) == 1, "updating an existing ID must start the next window");
        var filtered = exchange.filterBySymbolSinceLimit(next["data"], "BTC/USDT", null, next["limit"], true);
        Assert(filtered.Count == 1 && ReferenceEquals(filtered[0], order), "updated order must be returned once in the next read");

        var candles = new ArrayCacheByTimestamp(3);
        var candle = new List<object>() { 1, 1.0, 2.0, 0.5, 1.5, 10.0 };
        candles.append(candle);
        var initial = exchange.getCacheRead(candles);
        candles.append(new List<object>() { 1, 1.0, 3.0, 0.5, 2.5, 20.0 });
        var changed = exchange.getCacheRead(candles);
        Assert(ReferenceEquals(((IList<object>)initial["data"])[0], candle), "snapshot must preserve candle identity");
        Assert(Convert.ToDouble(candle[4]) == 2.5, "existing candle references must observe in-place updates");
        Assert(Convert.ToInt64(changed["limit"]) == 1, "updating the same timestamp must count in the next window");
    }
}
