- [Create Orders Example](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
async function example() {
    const exchange = new ccxt.binance({
        'apiKey': 'MY_API_KEY',
        'secret': 'MY_SECRET',
    });
    exchange.setSandboxMode(true);
    await exchange.loadMarkets();
    exchange.verbose = true; // uncomment for debugging purposes if necessary
    const orders = await exchange.createOrders([
        { 'symbol': 'LTC/USDT:USDT', 'type': 'limit', 'side': 'buy', 'amount': 10, 'price': 55 },
        { 'symbol': 'ETH/USDT:USDT', 'type': 'market', 'side': 'buy', 'amount': 0.5 },
    ]);
    console.log(orders);
}
await example();
 
```