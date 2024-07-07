using ccxt;
using ccxt.pro;

namespace examples;

partial class Examples
{
    async public Task watchOrderBookForSymbols()
    {
        var binance = new ccxt.pro.binance(new Dictionary<string, object>() { });
        var symbols = new List<string>() { "BTC/USDT", "ETH/USDT", "DOGE/USDT" };
        while (true)
        {
            var orderbook = await binance.WatchOrderBookForSymbols(symbols);
            var symbol = orderbook["symbol"];
            var asks = orderbook.asks;
        }
    }
}