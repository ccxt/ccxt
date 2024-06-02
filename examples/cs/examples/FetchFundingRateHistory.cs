using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public static async Task FetchFundingRateHistory()
    {
        var exchange = new Bybit();
        var fr = await exchange.FetchFundingRateHistory("BTC/USDT:USDT");
        Console.WriteLine(JsonConvert.SerializeObject(fr, Formatting.Indented));
    }
}