using ccxt;
using ccxt.pro;
namespace examples;
partial class Examples
{

    async public Task createOrderWsExample()
    {
        var exchange = new ccxt.pro.binance(new Dictionary<string, object>() {
            { "apiKey", "MY_API_KEY" },
            { "secret", "MY_SECRET" },
        });
        exchange.setSandboxMode(true);
        exchange.verbose = true; // uncomment for debugging purposes if necessary
                                 // load markets
        await exchange.LoadMarkets();
        var symbol = "ETH/USDT";
        var type = "limit";
        var side = "buy";
        var amount = 0.01;
        var price = 1000;
        var orders = new List<ccxt.Order>() { };
        for (var i = 1; i < 5; i++)
        {
            var response = await exchange.CreateOrderWs(symbol, type, side, amount, price);
            price = price + 1;
            orders.Add(response);
        }
    }
}