using ccxt;

namespace examples;

class Examples
{
    public static void Main(string[] args)
    {
        var exchange = new Binance();
        var markets = exchange.FetchMarkets();
        markets.Wait();
        Console.WriteLine(JsonConvert.SerializeObject(result.Result, Formatting.Indented));
    }
}