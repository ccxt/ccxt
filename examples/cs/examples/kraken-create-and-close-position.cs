using ccxt;
using ccxt.pro;

namespace examples;

partial class Examples
{
// ------------------------------------------------------------------------------
    async public Task krakenCreateAndClosePosition()
    {
        Console.WriteLine("CCXT Version:" + ccxt.Exchange.ccxtVersion);
        var exchange = new ccxt.kraken(new Dictionary<string, object>()
        {
            { "apiKey", "YOUR_API_KEY" },
            { "secret", "YOUR_API_SECRET" },
        });
        var symbol = "UNI/USD";
        var side = "buy"; // set it to 'buy' for a long position, 'sell' for a short position
        var orderType = "market"; // set it to 'market' or 'limit'
        var amount = 1;
        var leverage = 2;
        await exchange.LoadMarkets();
        var market = exchange.Market(symbol);
        // if order_type is 'market', then price is not needed
        double? price = null;
        // if order_type is 'limit', then set a price at your desired level
        // you can fetch the ticker and update price
        // const ticker = await exchange.fetchTicker (symbol);
        // const last_price = ticker['last'];
        // const ask_price = ticker['ask'];
        // const bid_price = ticker['bid'];
        // if (order_type === 'limit') {
        //     price = (side === 'buy') ? bid_price * 0.95 : ask_price * 1.05; // i.e. 5% from current price
        // }
        var parameters = new Dictionary<string, object>()
        {
            { "leverage", leverage },
        };
        // log
        Console.WriteLine(parameters);
        Console.WriteLine("-----------------------------------------------------------------------");
        try
        {
            var createdOrder = await exchange.CreateOrder(symbol, orderType, side, amount, price, parameters);
            Console.WriteLine("Created an order", createdOrder);
            // Fetch all your closed orders for this symbol (because we used market order)
            // - use 'fetchClosedOrders' or 'fetchOrders' and filter with 'closed' status
            var closedOrders = await exchange.FetchClosedOrders(symbol);
            Console.WriteLine("Fetched all your closed orders for this symbol", closedOrders);
            var allOpenPositions = await exchange.FetchPositions(new List<string>() { symbol });
            Console.WriteLine("Fetched all your positions for this symbol", allOpenPositions);
        }
        catch (Exception e)
        {
            Console.WriteLine(((object)e).ToString());
        }
    }
}