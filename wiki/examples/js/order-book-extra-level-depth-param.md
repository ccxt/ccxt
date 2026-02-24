- [Order Book Extra Level Depth Param](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';
import asTable from 'as-table';
import log from 'ololog';
import ansicolor from 'ansicolor';

ansicolor.nice

;(async function test () {

    const exchange = new ccxt.bitfinex ()
    const limit = 5
    const orders = await exchange.fetchOrderBook ('BTC/USD', limit, {
        // this parameter is exchange-specific, all extra params have unique names per exchange
        'group': 1, // 1 = orders are grouped by price, 0 = orders are separate
    })

    log (orders)
}) () 
```