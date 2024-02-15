using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public async static Task FetchPositions()
    {
        var exchange = new Bybit();
        exchange.apiKey = "";
        exchange.secret = "";
        exchange.setSandboxMode(true);
        var symbols = new List<string>() { "LTC/USDT:USDT" };
        var positions = await exchange.FetchPositions(symbols);
        var first = positions[0];
        Console.WriteLine(JsonConvert.SerializeObject(positions, Formatting.Indented));
    }
}