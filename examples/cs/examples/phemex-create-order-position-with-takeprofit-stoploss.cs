using ccxt;
using ccxt.pro;
namespace examples;
partial class Examples
{
// AUTO-TRANSPILE //
// ------------------------------------------------------------------------------
async public Task phemexCreateOrderPositionWithTakeprofitStoploss()
{
    var exchange = new ccxt.phemex(new Dictionary<string, object>() {
        { "apiKey", "YOUR_API_KEY" },
        { "secret", "YOUR_API_SECRET" },
    });
    var symbol = "XRP/USDT:USDT";
    var side = "buy"; // set it to 'buy' for a long position, 'sell' for a short position
    var order_type = "limit"; // set it to 'market' or 'limit'
    var amount = 1; // how many contracts
    var price = 0.5; // set a price at your desired level
    // take profit and stop loss prices and types
    var take_profit_trigger_price = 0.6;
    var stop_loss_trigger_price = 0.4;
    var take_profit_limit_price = 0.7;
    var stop_loss_limit_price = 0.3;
    await exchange.loadMarkets();
    // when symbol's price reaches your predefined "trigger price", stop-loss order would be activated as a "market order". but if you want it to be activated as a "limit order", then set a 'price' parameter for it
    var parameters = new Dictionary<string, object>() {
        { "posSide", "Long" },
        { "stopLoss", new Dictionary<string, object>() {
            { "triggerPrice", stop_loss_trigger_price },
            { "type", "limit" },
            { "price", stop_loss_limit_price },
        } },
        { "takeProfit", new Dictionary<string, object>() {
            { "triggerPrice", take_profit_trigger_price },
            { "type", "limit" },
            { "price", take_profit_limit_price },
        } },
    };
    Console.WriteLine("-----------------------------------------------------------------------");
    try
    {
        var created_order = await exchange.createOrder(symbol, order_type, side, amount, price, parameters);
        Console.WriteLine("Created an order", created_order);
        // Fetch all your open orders for this symbol
        var all_open_orders = await exchange.fetchOpenOrders(symbol);
        Console.WriteLine("Fetched all your orders for this symbol", all_open_orders);
    } catch(Exception e)
    {
        Console.WriteLine(((object)e).ToString());
    }
}


}