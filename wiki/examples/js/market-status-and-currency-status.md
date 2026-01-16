- [Market Status And Currency Status](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';
import log from 'ololog';
import asTable from 'as-table';

(async function main () {

    let kraken = new ccxt.kraken ()
    await kraken.loadMarkets ()

    const markets = Object.values (kraken.markets).map (market => ({
        symbol: market.symbol,
        active: market.active,
    }))

    log.bright.green.noLocate ('Markets:')
    log.green.noLocate (asTable (markets), '\n')

    const currencies = Object.values (kraken.currencies).map (currency => ({
        code: currency.code,
        active: currency.active,
        status: currency.status,
    }))

    log.bright.yellow.noLocate ('Currencies:')
    log.yellow.noLocate (asTable (currencies))

}) ()
 
```