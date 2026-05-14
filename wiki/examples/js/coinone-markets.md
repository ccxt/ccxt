- [Coinone Markets](./examples/js/)


 ```javascript
 

import log from 'ololog';
import ccxt from '../../js/ccxt.js';

const exchange = new ccxt.coinone ({
    'verbose': process.argv.includes ('--verbose'),
})

;(async function main () {

    const markets = await exchange.loadMarkets ()
    log (markets)
    log ('\n' + exchange['name'] + ' supports ' + Object.keys (markets).length + ' pairs')

}) ()
 
```