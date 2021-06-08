'use strict';

const ccxtpro = require ('ccxt.pro');

// your version must be 0.7+
console.log ('CCXT Pro Version:', ccxtpro.version)

function handle (exchange, symbol, ticker) {
    console.log (new Date (), exchange.id, symbol, ticker['last'])
}

async function loop (exchange, symbol) {
    while (true) {
        try {
            const ticker = await exchange.watchTicker (symbol)
            handle (exchange, symbol, ticker)
        } catch (e) {
            console.log (symbol, e)
            // do nothing and retry on next loop iteration
            // throw e // uncomment to break all loops in case of an error in any one of them
            // break // you can also break just this one loop if it fails
        }
    }
}

async function main () {

    const exchange = new ccxtpro.binanceusdm ()
    // or
    // const exchange = new ccxtpro.binancecoinm ()

    if (exchange.has['watchTicker']) {
        await exchange.loadMarkets ()
        await Promise.all (exchange.symbols.map (symbol => loop (exchange, symbol)))
    } else {
        console.log (exchange.id, 'does not support watchTicker yet')
    }
}

main ()
