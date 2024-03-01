using ccxt;
using ccxt.pro;

namespace examples;

partial class Examples
{
    // AUTO-TRANSPILE //    
    async static public Task getActiveMarkets()
    {
        var exchange = new ccxt.bitget(new Dictionary<string, object>()
        {
            // { "apiKey", "MY_API_KEY" },
            // { "secret", "MY_SECRET" },
        });
        var markets = await exchange.LoadMarkets();
        var marketValues = markets.Values.ToList();
        var activeMarkets = marketValues.FindAll(m => m.active != null && m.active.Value);
        var activeSymbols = activeMarkets.Select(m => m.symbol);
        Console.WriteLine(string.Join(",", activeSymbols));
    }
}