using ccxt;
using ccxt.pro;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    async static public Task watchTradesForSymbols()
    {
        var binance = new ccxt.pro.binance(new Dictionary<string, object>() { });
        var symbols = new List<string>() { "BTC/USDT", "ETH/USDT", "DOGE/USDT" };
        while (true)
        {
            var trades = await binance.WatchTradesForSymbols(symbols);
            Console.WriteLine(JsonConvert.SerializeObject(trades));
        }
    }
}