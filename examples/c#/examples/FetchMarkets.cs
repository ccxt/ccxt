using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public static void FetchMarkets()
    {
        var exchange = new Binance();
        var markets = exchange.FetchMarkets();
        markets.Wait();
        Console.WriteLine(JsonConvert.SerializeObject(markets.Result, Formatting.Indented));
    }
}