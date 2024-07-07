using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public static async Task FetchOrderBook()
    {
        var exchange = new Binance();
        var ob = await exchange.FetchOrderBook("BTC/USDT");
        Console.WriteLine(JsonConvert.SerializeObject(ob, Formatting.Indented));
    }
}