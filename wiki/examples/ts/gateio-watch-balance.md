- [Gateio Watch Balance](./examples/ts/)


 ```javascript
 // AUTO-TRANSPILE //

'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member

async function main () {
    const exchange = new ccxt.pro.gateio ({ // eslint-disable-line import/no-named-as-default-member
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    });
    await exchange.loadMarkets ();
    exchange.verbose = true;
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const response = await exchange.watchBalance ();
            console.log (new Date (), response);
        } catch (e) {
            console.log (e);
            await exchange.sleep (1000);
        }
    }
}

main ();
 
```