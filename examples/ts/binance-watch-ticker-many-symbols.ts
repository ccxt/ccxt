'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member

function handle (exchange, symbol, ticker) {
    console.log (new Date (), exchange.id, symbol, ticker['last']);
}

async function loop (exchange, symbol) {
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const ticker = await exchange.watchTicker (symbol);
            handle (exchange, symbol, ticker);
        } catch (e) {
            console.log (symbol, e);
            // do nothing and retry on next loop iteration
            // throw e // uncomment to break all loops in case of an error in any one of them
            // break // you can also break just this one loop if it fails
        }
    }
}

async function main () {
    const exchange = new ccxt.pro.binance (); // eslint-disable-line import/no-named-as-default-member
    //
    // WARNING: when using all the markets mind subscription limits!
    // don't attempt to subscribe to all of them
    // the exchanges will not allow that in general
    // instead, specify a shorter list of symbols to subscribe to
    //
    if (exchange.has['watchTicker']) {
        await exchange.loadMarkets ();
        // many symbols
        await Promise.all (exchange.symbols.map ((symbol) => loop (exchange, symbol)));
        //
        // or
        //
        // const symbols = [ 'BTC/USDT', 'ETH/USDT' ] // specific symbols
        // await Promise.all (symbols.map (symbol => loop (exchange, symbol)))
        //
        // or
        //
        // await loop (exchange, 'BTC/USDT') // one symbol
    } else {
        console.log (exchange.id, 'does not support watchTicker yet');
    }
}

main ();
