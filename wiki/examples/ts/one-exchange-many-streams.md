- [One Exchange Many Streams](./examples/ts/)


 ```javascript
 
'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member


(async () => {
    const exchange = new ccxt.pro.binance ({}); // eslint-disable-line import/no-named-as-default-member
    const symbols = [ 'BTC/USDT', 'ETH/BTC', 'ETH/USDT' ];
    await exchange.loadMarkets ();

    await Promise.all (symbols.map ((symbol) => (async () => {
        while (true) { // eslint-disable-line no-constant-condition
            try {
                const orderbook = await exchange.watchOrderBook (symbol);
                console.log (new Date (), symbol, orderbook['asks'][0], orderbook['bids'][0]);
            } catch (e) {
                console.log (symbol, e);
                // do nothing and retry on next loop iteration
                // throw e // uncomment to break all loops in case of an error in any one of them
                // break // you can also break just this one loop if it fails
            }
        }
    }) ()));
}) ();
 
```