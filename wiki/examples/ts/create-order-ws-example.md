- [Create Order Ws Example](./examples/ts/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt.pro.binance ({
        'apiKey': 'MY_API_KEY',
        'secret': 'MY_SECRET',
    });
    exchange.setSandboxMode (true);
    exchange.verbose = true; // uncomment for debugging purposes if necessary
    // load markets
    await exchange.loadMarkets ();
    const symbol = 'ETH/USDT';
    const type = 'limit';
    const side = 'buy';
    const amount = 0.01;
    let price = 1000;
    let orders = [];
    for (let i=1; i<5; i++) {
        const response = await exchange.createOrderWs (
            symbol,
            type,
            side,
            amount,
            price
        );
        price += i;
        orders.push (response);
    }
    console.log (orders);
}
await example ();
 
```