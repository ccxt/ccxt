- [Fetch Okex Futures](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';

async function test () {

    const exchange = new ccxt.okex ()
    await exchange.loadMarkets ()

    for (let symbol in exchange.markets) {

        const market = exchange.markets[symbol]

        if (market['future']) {
            console.log ('----------------------------------------------------')
            console.log (symbol, await exchange.fetchTicker (symbol))
            await ccxt.sleep (exchange.rateLimit)
        }
    }
}

test ()
 
```