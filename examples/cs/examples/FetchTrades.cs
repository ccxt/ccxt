using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public static void FetchTrades()
    {
        var exchange = new Binance();
        var trades = exchange.FetchTrades("BTC/USDT");
        trades.Wait();
        Console.WriteLine(JsonConvert.SerializeObject(trades.Result, Formatting.Indented));
    }
}