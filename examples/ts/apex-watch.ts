// AUTO-TRANSPILE //

'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member


async function loop (exchange, symbol) {
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const ticker = await exchange.watchTicker (symbol);
            console.log (new Date (), exchange.id, symbol);
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
    const exchange = new ccxt.pro.apex ({
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
    while (true) {
        const tickers = await exchange.watchTickers ([ 'BTC-USDT', 'ETH-USDT' ]);
        console.log (tickers);
    }
}

main ();
