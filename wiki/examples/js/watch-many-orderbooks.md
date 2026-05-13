- [Watch Many Orderbooks](./examples/js/)


 ```javascript
 'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
async function watchOrderBook(exchangeId, symbol) {
    const exchange = new ccxt.pro[exchangeId](); // eslint-disable-line import/no-named-as-default-member
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const orderbook = await exchange.watchOrderBook(symbol);
            console.log(new Date(), exchange.id, symbol, orderbook['asks'][0], orderbook['bids'][0]);
        }
        catch (e) {
            console.log(symbol, e);
        }
    }
}
async function main() {
    const streams = {
        'binance': 'BTC/USDT',
        'ftx': 'BTC/USDT',
    };
    await Promise.all(Object.entries(streams).map(([exchangeId, symbol]) => watchOrderBook(exchangeId, symbol)));
}
main();
 
```