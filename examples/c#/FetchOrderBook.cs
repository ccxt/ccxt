using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public static void FetchOrderBook()
    {
        var exchange = new Binance();
        var ob = exchange.FetchOrderBook("BTC/USDT");
        ob.Wait();
        Console.WriteLine(JsonConvert.SerializeObject(ob.Result, Formatting.Indented));
    }
}