using ccxt;
using ccxt.pro;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    async public Task watchPositions()
    {
        var exchange = new ccxt.pro.binanceusdm(new Dictionary<string, object>()
        {
            { "apiKey", "YOUR_API_KEY" },
            { "secret", "YOUR_API_SECRET" },
        });
        while (true)
        {
            var trades = await exchange.WatchPositions();
            Console.WriteLine(JsonConvert.SerializeObject(trades, Formatting.Indented));
        }
    }
}