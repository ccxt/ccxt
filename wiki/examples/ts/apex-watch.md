- [Apex Watch](./examples/ts/)


 ```javascript
 // AUTO-TRANSPILE //

'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member

async function loop (exchange, symbol) {
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const ticker = await exchange.watchTicker (symbol);
            console.log (new Date () + ' ' + exchange.id + ' ' + symbol);
            console.log (ticker);
            await exchange.sleep (1000);
        } catch (e) {
            console.log (e);
            // do nothing and retry on next loop iteration
            // throw e // uncomment to break all loops in case of an error in any one of them
            // break // you can also break just this one loop if it fails
        }
    }
}

async function main () {
    const exchange = new ccxt.pro.apex ({ // eslint-disable-line import/no-named-as-default-member
        'apiKey': 'your api Key',
        'secret': 'your api secret',
        'walletAddress': 'your eth address',
        'options': {
            'accountId': 'your account id',
            'passphrase': 'your api passphrase',
            'seeds': 'your zklink omni seed',
            'brokerId': '',
        },
    });
    exchange.setSandboxMode (true);
    if (exchange.has['watchTicker']) {
        await exchange.loadMarkets ();
        const targetSymbols = [ 'BTC-USDT', 'ETH-USDT' ];
        for (let i = 0; i < targetSymbols.length; i++) {
            const symbol = targetSymbols[i];
            await loop (exchange, symbol);
        }
    } else {
        console.log (exchange.id + ' does not support watchTicker yet');
    }
}

main ();
 
```