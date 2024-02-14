- [Builtin Rate Limiting Rest Poller](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';
import log from 'ololog';
import { nice as ansi } from 'ansicolor';
import asTable from 'as-table';

const exchange = new ccxt.coinbasepro ()
const repeat   = 100

async function test (symbol) {

    for (let i = 0; i < repeat; i++) {
        let ticker = await exchange.fetchTicker (symbol)
        log (exchange.id.green, exchange.iso8601 (exchange.milliseconds ()), ticker['datetime'], symbol.green, ticker['last'])
    }
}

const concurrent = [
    test ('BTC/USD'),
    test ('ETH/BTC'),
    test ('ETH/USD')
]

Promise.all (concurrent) 
```