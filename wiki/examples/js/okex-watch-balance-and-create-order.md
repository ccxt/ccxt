- [Okex Watch Balance And Create Order](./examples/js/)


 ```javascript
 'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
const exchange = new ccxt.pro.okx({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'password': 'YOUR_API_PASWORD',
});
async function watchBalance(code) {
    while (true) { // eslint-disable-line no-constant-condition
        const balance = await exchange.watchBalance({
            'code': code,
        });
        console.log('New', code, 'balance is: ', balance[code]);
    }
}
async function createOrder(symbol, type, side, amount, price = undefined, params = {}) {
    console.log('Creating', symbol, type, 'order');
    const order = await exchange.createOrder(symbol, type, side, amount, price, params);
    console.log(symbol, type, side, 'order created');
    console.log(order);
}
(async () => {
    await exchange.loadMarkets();
    console.log(exchange.id, 'markets loaded');
    const symbol = 'ETH/USDT';
    const market = exchange.market(symbol);
    const quote = market['quote'];
    // run in parallel without await
    console.log('Watching', quote, 'balance');
    watchBalance(quote);
    // wait a bit to allow it to subscribe
    await exchange.sleep(3000);
    const ticker = await exchange.watchTicker(symbol);
    const type = 'market';
    const side = 'buy';
    const amount = 0.1;
    const price = ticker['bid'];
    await createOrder(symbol, type, side, amount, price);
})();
 
```