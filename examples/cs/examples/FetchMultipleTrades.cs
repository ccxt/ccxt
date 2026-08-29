using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public static async Task FetchMultipleTrades()
    {
        var exchange = new Binance();
        var symbols = new string[] { "BTC/USDT", "ETH/USDT", "LTC/USDT", "XRP/USDT" };

        var tasks = new List<Task<List<ccxt.Trade>>>();
        foreach (var value in symbols)
        {
            tasks.Add(exchange.FetchTrades(value, null, 1));
        }

        var result = await Task.WhenAll(tasks.ToArray());
        Console.WriteLine(JsonConvert.SerializeObject(result, Formatting.Indented));
    }
}