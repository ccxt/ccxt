'use strict';

const ccxt = require ('ccxt');

// your version must be 0.7+
console.log ('CCXT Version:', ccxt.version)

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

     const exchange = new ccxt.pro.binanceusdm () // usd(s)-margined contracts
    //
    // or
    //
    //  const exchange = new ccxt.pro.binance () // spot markets
    //
    // WARNING: when using the spot markets mind subscription limits!
    // don't attempt to subscribe to all of them
    // the exchanges will not allow that in general
    // instead, specify a shorter list of symbols to subscribe to
    //
    // or
    //
    //  const exchange = new ccxt.pro.binancecoinm () // coin-margined contracts

    if (exchange.has['watchTicker']) {
        await exchange.loadMarkets ()
        // many symbols
        await Promise.all (exchange.symbols.map (symbol => loop (exchange, symbol)))
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
        console.log (exchange.id, 'does not support watchTicker yet')
    }
}

main ()
