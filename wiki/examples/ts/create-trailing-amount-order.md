- [Create Trailing Amount Order](./examples/ts/)


 ```javascript
 import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt.bingx ({
        'apiKey': 'MY_API_KEY',
        'secret': 'MY_SECRET',
    });
    // exchange.setSandboxMode (true);
    // exchange.verbose = true; // uncomment for debugging purposes if necessary
    await exchange.loadMarkets ();
    const symbol = 'BTC/USDT:USDT';
    const order_type = 'market';
    const side = 'sell';
    const amount = 0.0001;
    const price = undefined;
    const reduceOnly = true;
    const trailingAmount = 100;
    // const trailingTriggerPrice = undefined; // not supported on all exchanges
    const params = {
        'reduceOnly': reduceOnly,
        'trailingAmount': trailingAmount,
        // 'trailingTriggerPrice': trailingTriggerPrice,
    };
    try {
        const create_order = await exchange.createOrder (symbol, order_type, side, amount, price, params);
        // Alternatively use the createTrailingAmountOrder method:
        // const create_order = await exchange.createTrailingAmountOrder (symbol, order_type, side, amount, price, trailingAmount, trailingTriggerPrice, {
        //     'reduceOnly': reduceOnly,
        // });
        console.log (create_order);
    } catch (e) {
        console.log (e.toString ());
    }
}
await example ();
 
```