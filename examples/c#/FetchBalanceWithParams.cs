using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public static void FetchTrades()
    {
        var exchange = new Bybit();
        exchange.apiKey = "API KEY";
        exchange.secret = "SECRET";
        var parameters = new Dictionary<string, object>() { "type", "spot" };
        var balance = exchange.FetchBalance(parameters);
        balance.Wait();
        Console.WriteLine(JsonConvert.SerializeObject(balance.Result, Formatting.Indented));
    }
}