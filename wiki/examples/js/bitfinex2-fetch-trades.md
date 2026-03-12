- [Bitfinex2 Fetch Trades](./examples/js/)


 ```javascript
 

// ----------------------------------------------------------------------------

import ccxt from '../../js/ccxt.js';
import asTable from 'as-table';
import log from 'ololog';

// ----------------------------------------------------------------------------

const // ----------------------------------------------------------------------------
table = asTable.configure ({ delimiter: ' | ' });(async () => {

    const exchange = new ccxt.bitfinex2 ({
        'verbose': process.argv.includes ('--verbose'),
        'timeout': 60000,
    })

    try {

        const response = await exchange.fetchTrades ('ETH/BTC', 1518983548636 - 2 * 24 * 60 * 60 * 1000)
        log (table (response))
        log (response.length.toString (), 'trades')
        log.green ('Succeeded.')

    } catch (e) {

        log.dim ('--------------------------------------------------------')
        log (e.constructor.name, e.message)
        log.dim ('--------------------------------------------------------')
        log.dim (exchange.last_http_response)
        log.error ('Failed.')
    }

}) () 
```