- [Kraken Create And Close Position](./examples/js/)


 ```javascript
 // @ts-nocheck
import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
console.log('CCXT Version:', ccxt.version);
// ------------------------------------------------------------------------------
async function example() {
    const exchange = new ccxt.kraken({
        "apiKey": "YOUR_API_KEY",
        "secret": "YOUR_API_SECRET",
    });
    const symbol = 'UNI/USD';
    let side = 'buy'; // set it to 'buy' for a long position, 'sell' for a short position
    const order_type = 'market'; // set it to 'market' or 'limit'
    const amount = 1;
    const leverage = 2;
    await exchange.loadMarkets();
    const market = exchange.market(symbol);
    // if order_type is 'market', then price is not needed
    let price = undefined;
    // if order_type is 'limit', then set a price at your desired level
    // you can fetch the ticker and update price
    // const ticker = await exchange.fetchTicker (symbol);
    // const last_price = ticker['last'];
    // const ask_price = ticker['ask'];
    // const bid_price = ticker['bid'];
    // if (order_type === 'limit') {
    //     price = (side === 'buy') ? bid_price * 0.95 : ask_price * 1.05; // i.e. 5% from current price
    // }
    const params = {
        'leverage': leverage,
    };
    // log
    console.log('Going to open a position', 'for', amount, 'worth', amount, market['base'], '~', market['settle'], 'using', side, order_type, 'order (', (order_type === 'limit' ? exchange.priceToPrecision(symbol, price) : ''), '), using the following params:');
    console.log(params);
    console.log('-----------------------------------------------------------------------');
    // exchange.verbose = True  // uncomment for debugging purposes if necessary
    try {
        const created_order = await exchange.createOrder(symbol, order_type, side, amount, price, params);
        console.log("Created an order", created_order);
        // Fetch all your closed orders for this symbol (because we used market order)
        // - use 'fetchClosedOrders' or 'fetchOrders' and filter with 'closed' status
        const all_closed_orders = await exchange.fetchClosedOrders(symbol);
        console.log("Fetched all your closed orders for this symbol", all_closed_orders);
        const all_open_positions = await exchange.fetchPositions(symbol);
        console.log("Fetched all your positions for this symbol", all_open_positions);
        // To close a position:
        // - long position (buy), you can create a sell order: exchange.createOrder (symbol, order_type, 'sell', amount, price, params);
        // - short position (sell), you can create a buy order: exchange.createOrder (symbol, order_type, 'buy', amount, price, params);
    }
    catch (e) {
        console.log(e.toString());
    }
}
await example();
 
```