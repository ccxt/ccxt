- [Fetch From Many Exchanges Simultaneously](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';
import log from 'ololog';

const symbol = 'ETH/BTC'
const exchanges = [ 'coinbasepro', 'hitbtc2', 'poloniex' ]

;(async () => {

    const result = await Promise.all (exchanges.map (async id => {

        const exchange = new ccxt[id] ()
        const ticker = await exchange.fetchTicker (symbol)
        return exchange.extend ({ 'exchange': id }, ticker)

    }))

    log (result);

}) () 
```