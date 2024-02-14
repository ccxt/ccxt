using ccxt;
using ccxt.pro;

namespace examples;

partial class Examples
{
    async public Task createTrailingAmountOrder()
    {
        var exchange = new ccxt.bingx(new Dictionary<string, object>()
        {
            { "apiKey", "MY_API_KEY" },
            { "secret", "MY_SECRET" },
        });
        // exchange.setSandboxMode (true);
        // exchange.verbose = true; // uncomment for debugging purposes if necessary
        await exchange.LoadMarkets();
        var symbol = "BTC/USDT:USDT";
        var orderType = "market";
        var side = "sell";
        var amount = 0.0001;
        double? price = null;
        var reduceOnly = true;
        var trailingAmount = 100;
        // const trailingTriggerPrice = undefined; // not supported on all exchanges
        var parameters = new Dictionary<string, object>()
        {
            { "reduceOnly", reduceOnly },
            { "trailingAmount", trailingAmount },
        };
        try
        {
            var createOrder = await exchange.CreateOrder(symbol, orderType, side, amount, price, parameters);
            // Alternatively use the createTrailingAmountOrder method:
            // const create_order = await exchange.createTrailingAmountOrder (symbol, order_type, side, amount, price, trailingAmount, trailingTriggerPrice, {
            //     'reduceOnly': reduceOnly,
            // });
            Console.WriteLine(createOrder);
        }
        catch (Exception e)
        {
            Console.WriteLine(((object)e).ToString());
        }
    }
}