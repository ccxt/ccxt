using ccxt;
using ccxt.pro;

namespace examples;

partial class Examples
{
    async public Task watchPositionsForSymbols()
    {
        var exchange = new ccxt.pro.binanceusdm(new Dictionary<string, object>()
        {
            { "apiKey", "YOUR_API_KEY" },
            { "secret", "Your_API_SECRET" },
        });
        var symbols = new List<string>() { "BTC/USDT:USDT", "ETH/USDT:USDT", "DOGE/USDT:USDT" };
        while (true)
        {
            var positions = await exchange.WatchPositions(symbols);
            Console.WriteLine(positions);
        }
    }
}