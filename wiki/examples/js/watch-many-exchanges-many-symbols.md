- [Watch Many Exchanges Many Symbols](./examples/js/)


 ```javascript
 'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
async function watchTickerLoop(exchange, symbol) {
    // exchange.verbose = true // uncomment for debugging purposes if necessary
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const ticker = await exchange.watchTicker(symbol);
            console.log(new Date(), exchange.id, symbol, ticker['last']);
        }
        catch (e) {
            console.log(symbol, e);
            // do nothing and retry on next loop iteration
            // throw e // uncomment to break all loops in case of an error in any one of them
            // break // you can also break just this one loop if it fails
        }
    }
}
async function exchangeLoop(exchangeId, symbols) {
    const exchange = new ccxt.pro[exchangeId](); // eslint-disable-line import/no-named-as-default-member
    await exchange.loadMarkets();
    const loops = symbols.map((symbol) => watchTickerLoop(exchange, symbol));
    await Promise.all(loops);
    await exchange.close();
}
async function main() {
    const exchanges = {
        'binance': ['BTC/USDT', 'ETH/USDT'],
        'okx': ['BTC/USD', 'ETH/USD'],
    };
    const loops = Object.entries(exchanges).map(([exchangeId, symbols]) => exchangeLoop(exchangeId, symbols));
    await Promise.all(loops);
}
main();
 
```