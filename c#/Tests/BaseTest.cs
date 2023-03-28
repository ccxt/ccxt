using Newtonsoft.Json.Linq;
using Main;

using dict = System.Collections.Generic.Dictionary<string, object>;
using list = System.Collections.Generic.List<object>;
using System.Xml;
using Newtonsoft.Json;

namespace Tests;

public partial class BaseTest
{
    public string exchangesPath = "../../../../../exchanges.json";
    public Exchange exchange = new Exchange();

    public List<string> exchangesId;
    public List<Exchange> exchanges = new List<Exchange>();

    public List<string> ignore = new List<string> { "bequant", "binancecoinm", "binanceusdm", "bit2c" };


    public BaseTest()
    {
        var file = File.ReadAllText(exchangesPath);
        var converted = (dict)Exchange.JsonHelper.Deserialize(file);
        var ids = (list)converted["ids"];
        List<string> strings = ids.Select(s => (string)s).ToList();
        // exchangesId = strings;
        var exchangesTmp = new List<string> { "binance", "huobi", "gate", "bybit", "kucoin" };
        // var exchangesTmp = new List<string> { "huobi" };
        exchangesId = exchangesTmp;
        var promises = new List<Task<object>>();
        foreach (string exchange in exchangesTmp)
        {
            var instance = Exchange.MagicallyCreateInstance(exchange);
            exchanges.Add(instance);
            promises.Add(instance.loadMarkets());
        }
        Task.Run(() => Task.WhenAll(promises)).Wait();


    }

    [Fact]
    public async void TestFetchTicker()
    {
        var symbol = "BTC/USDT";
        var promises = new List<Task<object>>();
        foreach (var exchange in exchanges)
        {
            var has = exchange.has as dict;
            if (has == null || !(bool)has["fetchTicker"] || ignore.Contains(exchange.id))
            {
                Helper.Warn($"Skipping {exchange.id}: fetchTicker {symbol}");
                continue;
            }
            Helper.Green($"Testing {exchange.id}: fetchTicker {symbol}");
            var markets = await exchange.loadMarkets();
            var market = exchange.market(symbol);
            if (market == null)
            {
                Helper.Warn($"Skipping: market does not exist {exchange.id}: fetchTicker {symbol}");
                continue;
            }
            promises.Add(exchange.fetchTicker(symbol));
            var resolved = await Task.WhenAll(promises);
            for (int j = 0; j < resolved.Length; j++)
            {
                Helper.Green($"Asserting ticker: {exchangesId[j]}");
                var ticker = resolved[j];
                var ticker2 = (dict)ticker;
                Assert.NotNull(ticker);
                Assert.NotNull(ticker2);
                Assert.Equal(symbol, (string)ticker2["symbol"]);
            }
        }
    }

    [Fact]
    public async void TestFetchOHLCV()
    {
        var symbol = "BTC/USDT";
        var promises = new List<Task<object>>();
        foreach (var exchange in exchanges)
        {
            var has = exchange.has as dict;
            if (has == null || !(bool)has["fetchOHLCV"] || ignore.Contains(exchange.id))
            {
                Helper.Warn($"Skipping {exchange.id}: fetchOHLCV {symbol}");
                continue;
            }
            Helper.Green($"Testing {exchange.id}: fetchOHLCV {symbol}");
            var markets = await exchange.loadMarkets();
            var market = exchange.market(symbol);
            if (market == null)
            {
                Helper.Warn($"Skipping: market does not exist {exchange}: fetchOHLCV {symbol}");
                continue;
            }
            promises.Add(exchange.fetchOHLCV(symbol));
        }
        var resolved = await Task.WhenAll(promises);
        for (int j = 0; j < resolved.Length; j++)
        {
            var result = resolved[j];
            var exchangeId = exchangesId[j];
            Helper.Green($"Asserting ohlcv: {exchangeId}");
            var ticker2 = (list)result;
            Assert.NotNull(result);
            Assert.NotNull(ticker2);
            var first = (list)ticker2[0];
            Assert.True(first.Count == 6);
            Assert.NotNull(first[0]);
            Assert.NotNull(first[1]);
            Assert.NotNull(first[2]);
            Assert.NotNull(first[3]);
            Assert.NotNull(first[4]);
            Assert.NotNull(first[5]);
        }
    }

    [Fact]
    public async void TestFetchOrderBook()
    {
        var symbol = "BTC/USDT";
        var promises = new List<Task<object>>();
        foreach (var exchange in exchanges)
        {
            var has = exchange.has as dict;
            if (has == null || !(bool)has["fetchOrderBook"] || ignore.Contains(exchange.id))
            {
                Helper.Warn($"Skipping {exchange.id}: fetchOrderBook {symbol}");
                continue;
            }
            Helper.Green($"Testing {exchange.id}: fetchOrderBook {symbol}");
            var markets = await exchange.loadMarkets();
            var market = exchange.market(symbol);
            if (market == null)
            {
                Helper.Warn($"Skipping: market does not exist {exchange}: fetchOrderBook {symbol}");
                continue;
            }
            promises.Add(exchange.fetchOrderBook(symbol));
        }
        var resolved = await Task.WhenAll(promises);
        for (int j = 0; j < resolved.Length; j++)
        {
            var result = resolved[j];
            var exchangeId = exchangesId[j];
            Helper.Green($"Asserting orderbook: {exchangeId}");
            var orderbook = (dict)result;
            Assert.NotNull(result);
            Assert.NotNull(orderbook);
            Assert.Equal(symbol, (string)orderbook["symbol"]);
        }
    }

    [Fact]
    public async void TestFetchTrades()
    {
        var symbol = "BTC/USDT";
        var promises = new List<Task<object>>();
        foreach (var exchange in exchanges)
        {
            var has = exchange.has as dict;
            if (has == null || !(bool)has["fetchTrades"] || ignore.Contains(exchange.id))
            {
                Helper.Warn($"Skipping {exchange.id}: fetchTrades {symbol}");
                continue;
            }
            Helper.Green($"Testing {exchange.id}: fetchTrades {symbol}");
            var markets = await exchange.loadMarkets();
            var market = exchange.market(symbol);
            if (market == null)
            {
                Helper.Warn($"Skipping: market does not exist {exchange}: fetchTrades {symbol}");
                continue;
            }
            promises.Add(exchange.fetchTrades(symbol));
        }
        var resolved = await Task.WhenAll(promises);
        for (int j = 0; j < resolved.Length; j++)
        {
            var result = resolved[j];
            var exchangeId = exchangesId[j];
            Helper.Green($"Asserting trades: {exchangeId}");
            var orderbook = (dict)result;
            Assert.NotNull(result);
            Assert.NotNull(orderbook);
            Assert.Equal(symbol, (string)orderbook["symbol"]);
        }
    }
}