
'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member


async function watchOrders (exchange) {
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const orders = await exchange.watchOrders (); // await here
            console.log (orders);
        } catch (e) {
            console.log (e);
        }
    }
}

async function watchBalance (exchange) {
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const balance = await exchange.watchBalance (); // await here
            console.log (balance);
        } catch (e) {
            console.log (e);
        }
    }
}

async function main () {
    const exchange = new ccxt.pro.binance ({ // eslint-disable-line import/no-named-as-default-member
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        // 'password': 'IF NECESSARY',
        // etc...
    });
    await exchange.loadMarkets (); // await here

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    watchOrders (exchange); // no await
    watchBalance (exchange); // no await

    await exchange.close ();
}

main ();
