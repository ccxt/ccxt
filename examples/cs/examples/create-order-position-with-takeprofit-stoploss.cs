using ccxt;
using ccxt.pro;
namespace examples;
partial class Examples
{
    async public Task createOrderPositionWithTakeprofitStoploss()
    {
        Console.WriteLine("CCXT Version:" + ccxt.Exchange.ccxtVersion);

        var exchange = new ccxt.okx(new Dictionary<string, object>() {
            { "apiKey", "YOUR_API_KEY" },
            { "secret", "YOUR_API_SECRET" },
            { "password", "YOUR_API_PASSWORD" },
        });

        var symbol = "DOGE/USDT:USDT";
        var side = "buy"; // 'buy' | 'sell'
        var orderType = "limit"; // 'market' | 'limit'
        var amount = 1; // how many contracts (see `market(symbol).contractSize` to find out coin portion per one contract)

        await exchange.LoadMarkets();

        var market = exchange.Market(symbol);
        var ticker = await exchange.FetchTicker(symbol);
        var lastPrice = ticker.last;
        var askPrice = ticker.ask;
        var bidPrice = ticker.bid;

        // if order_type is 'market', then price is not needed
        double? price = null;

        // if order_type is 'limit', then set a price at your desired level
        if (orderType == "limit")
        {
            price = (side == "buy") ? bidPrice * 0.95 : askPrice * 1.05; // i.e. 5% from current price
        }

        // set trigger price for stop-loss/take-profit to 2% from current price
        // (note, across different exchanges "trigger" price can be also mentioned with different synonyms, like "activation price", "stop price", "conditional price", etc. )
        var slTriggerPrice = (orderType == "market" ? lastPrice : price) * (side == "buy" ? 0.98 : 1.02);
        var tkTriggerPrice = (orderType == "market" ? lastPrice : price) * (side == "buy" ? 1.02 : 0.98);

        // when symbol's price reaches your predefined "trigger price", stop-loss order would be activated as a "market order". but if you want it to be activated as a "limit order", then set a 'price' parameter for it
        var parameters = new Dictionary<string, object>() {
            { "stopLoss", new Dictionary<string, object>() {
                { "triggerPrice", slTriggerPrice },
                { "price", slTriggerPrice * 0.98 },
            }},
            { "takeProfit", new Dictionary<string, object>() {
                { "triggerPrice", tkTriggerPrice },
                { "price", tkTriggerPrice * 0.98 },
            }},
        };

        var positionAmount = market.contractSize * amount;
        var positionValue = positionAmount * lastPrice;

        try
        {
            var createOrder = await exchange.CreateOrder(symbol, orderType, side, amount, price, parameters);

            Console.WriteLine("Created an order" + createOrder.id);
            // Fetch all your open orders for this symbol
            // - use 'fetchOpenOrders' or 'fetchOrders' and filter with 'open' status
            // - note, that some exchanges might return one order object with embedded stoploss/takeprofit fields, while other exchanges might have separate stoploss/takeprofit order objects
            var openOrders = await exchange.FetchOpenOrders(symbol);
            Console.WriteLine("Fetched all your orders for this symbol");
        }
        catch (Exception e)
        {
            Console.WriteLine(e.ToString());
        }
    }

}