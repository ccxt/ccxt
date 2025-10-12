- [Create Order Position With Takeprofit Stoploss](./examples/js/)


 ```javascript
 // @ts-nocheck
import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
console.log('CCXT Version:', ccxt.version);
// ------------------------------------------------------------------------------
async function example() {
    // at this moment, only OKX support embedded stop-loss & take-profit orders in unified manner. other exchanges are being added actively and will be available soon.
    const exchange = new ccxt.okx({
        "apiKey": "YOUR_API_KEY",
        "secret": "YOUR_API_SECRET",
        "password": "YOUR_API_PASSWORD", // if exchange does not require password, comment out this line
    });
    const symbol = 'DOGE/USDT:USDT';
    const side = 'buy'; // 'buy' | 'sell'
    const order_type = 'limit'; // 'market' | 'limit'
    const amount = 1; // how many contracts (see `market(symbol).contractSize` to find out coin portion per one contract)
    await exchange.loadMarkets();
    const market = exchange.market(symbol);
    const ticker = await exchange.fetchTicker(symbol);
    const last_price = ticker['last'];
    const ask_price = ticker['ask'];
    const bid_price = ticker['bid'];
    // if order_type is 'market', then price is not needed
    let price = undefined;
    // if order_type is 'limit', then set a price at your desired level
    if (order_type === 'limit') {
        price = (side === 'buy') ? bid_price * 0.95 : ask_price * 1.05; // i.e. 5% from current price
    }
    // set trigger price for stop-loss/take-profit to 2% from current price
    // (note, across different exchanges "trigger" price can be also mentioned with different synonyms, like "activation price", "stop price", "conditional price", etc. )
    const stop_loss_trigger_price = (order_type === 'market' ? last_price : price) * (side === 'buy' ? 0.98 : 1.02);
    const take_profit_trigger_price = (order_type === 'market' ? last_price : price) * (side === 'buy' ? 1.02 : 0.98);
    // when symbol's price reaches your predefined "trigger price", stop-loss order would be activated as a "market order". but if you want it to be activated as a "limit order", then set a 'price' parameter for it
    const params = {
        'stopLoss': {
            'triggerPrice': stop_loss_trigger_price,
            // set a 'price' to act as limit order, otherwise remove it for a market order
            'price': stop_loss_trigger_price * 0.98,
        },
        'takeProfit': {
            'triggerPrice': take_profit_trigger_price,
            // set a 'price' to act as limit order, otherwise remove it for a market order
            'price': take_profit_trigger_price * 0.98,
        },
        // note that some exchanges might require some exchange specific parameter when opening a position, i.e.:
        // 'posSide': 'long',  // for phemex hedge-mode api
    };
    const position_amount = market['contractSize'] * amount;
    const position_value = position_amount * last_price;
    // log
    console.log('Going to open a position', 'for', amount, 'contracts worth', position_amount, market['base'], '~', position_value, market['settle'], 'using', side, order_type, 'order (', (order_type === 'limit' ? exchange.priceToPrecision(symbol, price) : ''), '), using the following params:');
    console.log(params);
    console.log('-----------------------------------------------------------------------');
    // exchange.verbose = True  // uncomment for debugging purposes if necessary
    try {
        const created_order = await exchange.createOrder(symbol, order_type, side, amount, price, params);
        console.log("Created an order", created_order);
        // Fetch all your open orders for this symbol
        // - use 'fetchOpenOrders' or 'fetchOrders' and filter with 'open' status
        // - note, that some exchanges might return one order object with embedded stoploss/takeprofit fields, while other exchanges might have separate stoploss/takeprofit order objects
        const all_open_orders = await exchange.fetchOpenOrders(symbol);
        console.log("Fetched all your orders for this symbol", all_open_orders);
        // To cancel a limit order, use "exchange.cancel_order(created_order['id'], symbol)""
    }
    catch (e) {
        console.log(e.toString());
    }
}
await example();
// NOTES:
// - Sometimes you might experience, when their stop-loss/take-profit order might not become activated, even though on chart the price had crossed that "trigger-price"       order was not executed . That happens because some exchange might be using mark-price (instead of last-price) as a reference-price, so that mark-price might reach your trigger-price and it would activate your SL/TP order (even though on your symbol's chart you are viewing the "last-price" by default, which could have different movements than the mark-price).
 
```