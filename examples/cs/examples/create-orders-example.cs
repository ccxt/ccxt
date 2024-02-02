using ccxt;
using ccxt.pro;

namespace examples;

partial class Examples
{
// AUTO-TRANSPILE //    
    async public Task createOrdersExample()
    {
        var exchange = new ccxt.binance(new Dictionary<string, object>()
        {
            { "apiKey", "MY_API_KEY" },
            { "secret", "MY_SECRET" },
        });
        exchange.setSandboxMode(true);
        await exchange.LoadMarkets();
        exchange.verbose = true; // uncomment for debugging purposes if necessary
        var orders = await exchange.createOrders(new List<Dictionary<string, object>>()
        {
            new Dictionary<string, object>()
            {
                { "symbol", "LTC/USDT:USDT" },
                { "type", "limit" },
                { "side", "buy" },
                { "amount", 10 },
                { "price", 55 },
            },
            new Dictionary<string, object>()
            {
                { "symbol", "ETH/USDT:USDT" },
                { "type", "market" },
                { "side", "buy" },
                { "amount", 0.5 },
            }
        });
        Console.WriteLine(orders);
    }
}