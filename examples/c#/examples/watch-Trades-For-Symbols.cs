using ccxt;
using ccxt.pro;

namespace examples;

partial class Examples
{
    async public Task watchTradesForSymbols()
    {
        var binance = new ccxt.pro.binance(new Dictionary<string, object>() { });
        var symbols = new List<string>() { "BTC/USDT", "ETH/USDT", "DOGE/USDT" };
        while (true)
        {
            var trades = await binance.WatchTradesForSymbols(symbols);
            Console.WriteLine(trades);
        }
    }
}