'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member

const exchange = new ccxt.okx ({ // eslint-disable-line import/no-named-as-default-member
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'password': 'YOUR_API_PASSWORD',
    'enableRateLimit': true,
    'options': { 'defaultType': 'futures' },
});
const symbol = 'BTC/USDT:USDT-201225';
const amount = 1; // how may contracts
const price = undefined; // or your limit price
const side = 'buy'; // or 'sell'
const type = '1'; // 1 open long, 2 open short, 3 close long, 4 close short for futures
const order_type = '4'; // 0 = limit order, 4 = market order


async function main () {
    try {
        await exchange.loadMarkets ();

        // exchange.verbose = true // uncomment for debugging
        // open long market price order
        const order = await exchange.createOrder (symbol, 'market', side, amount, price, { type });
        // --------------------------------------------------------------------
        // open long market price order
        // const order = await exchange.createOrder(symbol, type, side, amount, price, { order_type });
        // --------------------------------------------------------------------
        // close short market price order
        // const order = await exchange.createOrder(symbol, 'market', side, amount, price, { type, order_type });
        // --------------------------------------------------------------------
        // close short market price order
        // const order = await exchange.createOrder(symbol, '4', side, amount, price, { order_type });
        // ...
        console.log (order);
    } catch (e) {
        console.log (e);
    }
}

main ();
