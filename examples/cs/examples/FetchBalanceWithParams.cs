using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public async static Task FetchBalance()
    {
        var exchange = new Bybit();
        exchange.apiKey = Environment.GetEnvironmentVariable("BYBIT_APIKEY");
        exchange.secret = Environment.GetEnvironmentVariable("BYBIT_SECRET");
        exchange.setSandboxMode(true);
        var parameters = new Dictionary<string, object>() { { "type", "swap" } };
        var balance = await exchange.FetchBalance(parameters);
        Console.WriteLine(JsonConvert.SerializeObject(balance, Formatting.Indented));
    }
}