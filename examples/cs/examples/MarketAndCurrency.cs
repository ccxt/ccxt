using ccxt;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    public async static Task MarketAndCurrency()
    {
        var exchange = new ccxt.okx();
        exchange.apiKey = Environment.GetEnvironmentVariable("OKX_APIKEY");
        exchange.secret = Environment.GetEnvironmentVariable("OKX_SECRET");
        await exchange.LoadMarkets();
        
        // market info
        var symbol = "BTC/USDT:USDT";
        var market = exchange.Market(symbol);
        Console.WriteLine($"Contract size {market.contractSize}");
        
        // currency info
        var currency = exchange.Currency("USDT");
        var networks = currency.networks.Keys;
        Console.WriteLine($"USDT has support for {String.Join(",", networks)}");
    }
}