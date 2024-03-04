using ccxt.pro;
using ccxt;
using Newtonsoft.Json;

namespace Tests;

// Quick test if our strutuctes are thread safe.

public partial class BaseTest
{

    async public Task ReadList(IList<object> list)
    {
        for (int i = 0; i < 150; i++)
        {
            // Console.WriteLine("ReadList");
            JsonConvert.SerializeObject(list);
            await Task.Delay(115);

        }
    }

    async public Task UpdateList(IList<object> list)
    {
        for (int i = 0; i < 150; i++)
        {
            // Console.WriteLine("UpdateList");
            list.Add("test");
            await Task.Delay(120);

        }
    }
    async public Task ReadOrderBook(ccxt.pro.OrderBook ob)
    {
        await Task.Run(async () =>
        {
            await Task.Delay(500);
            Thread thread = Thread.CurrentThread;
            Console.WriteLine("Thread Read: " + thread.ManagedThreadId);
            for (int i = 0; i < 150; i++)
            {
                // Console.WriteLine("ReadOrderBook");
                Exchange.Json(ob["nonce"]);
                Exchange.Json(ob["datetime"]);
                Exchange.Json(ob["timestamp"]);
                Exchange.Json(ob["symbol"]);
                Exchange.Json(ob["asks"]);
                Exchange.Json(ob["bids"]);
                Exchange.Json(ob.asks);
                Exchange.Json(ob.bids);
                Exchange.Json(ob.cache);
                Exchange.Json(ob);
                await Task.Delay(49);
            }
        });

    }

    async public Task UpdateOrderBook(ccxt.pro.OrderBook ob)
    {
        await Task.Run(async () =>
        {
            await Task.Delay(500);
            Thread thread = Thread.CurrentThread;
            Console.WriteLine("Thread Update: " + thread.ManagedThreadId);
            Random rnd = new Random();
            for (int i = 0; i < 150; i++)
            {
                // Console.WriteLine("UpdateOrderBook");
                ob["nonce"] = Convert.ToInt64(ob["nonce"]) + 1;
                ob["datetime"] = Exchange.Iso8601(ob["nonce"]);
                ob["timestamp"] = Convert.ToInt64(ob["timestamp"]) + 1;
                var randomAmount = rnd.Next();
                var randomPrice = rnd.Next();
                ob.bids.store(Convert.ToDecimal(randomPrice), Convert.ToDecimal(randomAmount));
                ob.asks.store(Convert.ToDecimal(randomPrice), Convert.ToDecimal(randomAmount));
                object storedBids = getValue(ob, "bids");
                (storedBids as OrderBookSide).storeArray(new List<object> { randomPrice, randomAmount });
                ob.limit();
                await Task.Delay(50);
            }
        });
    }

    async public Task UpdateAsks(Asks asks)
    {
        Random rnd = new Random();
        for (int i = 0; i < 150; i++)
        {
            // Console.WriteLine("UpdateAsks");
            var randomAmount = rnd.Next();
            var randomPrice = rnd.Next();
            asks.store(Convert.ToDecimal(randomPrice), Convert.ToDecimal(randomAmount));
            await Task.Delay(123);
        }
    }

    async public Task ReadAsks(Asks asks)
    {
        for (int i = 0; i < 150; i++)
        {
            // Console.WriteLine("ReadAsks");
            Exchange.Json(asks);
            await Task.Delay(130);
        }
    }

    async public Task ReadArrayCache(ArrayCache arrayCache)
    {
        for (int i = 0; i < 150; i++)
        {
            Exchange.Json(arrayCache);
            await Task.Delay(101);
        }
    }

    async Task UpdateArrayCache(ArrayCache arrayCache)
    {
        for (int i = 0; i < 150; i++)
        {
            arrayCache.append(new Dictionary<string, object>() {
            { "symbol", "BTC/USDT" },
            { "data", 1 },
            });
            await Task.Delay(102);
        }
    }

    public async Task RaceTest()
    {
        var orderBookInput = new Dictionary<string, object>() {
            { "bids", new List<object>() {new List<object>() {10, 10}, new List<object>() {9.1, 11}, new List<object>() {8.2, 12}, new List<object>() {7.3, 13}, new List<object>() {6.4, 14}, new List<object>() {4.5, 13}, new List<object>() {4.5, 0}} },
            { "asks", new List<object>() {new List<object>() {16.6, 10}, new List<object>() {15.5, 11}, new List<object>() {14.4, 12}, new List<object>() {13.3, 13}, new List<object>() {12.2, 14}, new List<object>() {11.1, 13}} },
            { "timestamp", 1574827239000 },
            { "nonce", 69 },
            { "symbol", null },
        };

        // --------------------------------------------------------------------------------------------------------------------

        var asks = new Asks(new List<object>() { new List<object>() { 10, 10 }, new List<object>() { 9.1, 11 }, new List<object>() { 8.2, 12 }, new List<object>() { 7.3, 13 }, new List<object>() { 6.4, 14 }, new List<object>() { 4.5, 13 }, new List<object>() { 4.5, 0 } });
        var orderBook = new ccxt.pro.OrderBook(orderBookInput);
        var arrayCache = new ArrayCache(3);

        // var task1 = Task.Run(() => Task.WhenAll(ReadAsks(asks), UpdateAsks(asks)));

        var task2 = Task.Run(() => Task.WhenAll(ReadOrderBook(orderBook), UpdateOrderBook(orderBook)));

        // var task3 = Task.Run(() => Task.WhenAll(ReadArrayCache(arrayCache), UpdateArrayCache(arrayCache)));

        // await Task.WhenAll(task1, task2, task3);
        await task2;

    }
}