// AUTO-TRANSPILE //

'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member


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
