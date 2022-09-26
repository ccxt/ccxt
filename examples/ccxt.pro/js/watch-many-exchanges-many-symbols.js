'use strict';

const ccxt = require ('../../../ccxt');

console.log ('CCXT Version:', ccxt.version)


async function watchTickerLoop (exchange, symbol) {
    // exchange.verbose = true // uncomment for debugging purposes if necessary
    while (true) {
        try {
            const ticker = await exchange.watchTicker (symbol)
            console.log (new Date (), exchange.id, symbol, ticker['last'])
        } catch (e) {
            console.log (symbol, e)
            // do nothing and retry on next loop iteration
            // throw e // uncomment to break all loops in case of an error in any one of them
            // break // you can also break just this one loop if it fails
        }
    }
}

async function exchangeLoop (exchangeId, symbols) {
     const exchange = new ccxt.pro[exchangeId]()
    await exchange.loadMarkets ()
    const loops = symbols.map (symbol => watchTickerLoop (exchange, symbol))
    await Promise.all (loops)
    await exchange.close ()
}

async function main () {
    const exchanges = {
        'binance': [ 'BTC/USDT', 'ETH/USDT' ],
        'ftx': [ 'BTC/USD', 'ETH/USD' ],
    }
    const loops = Object.entries (exchanges).map (([ exchangeId, symbols ]) => exchangeLoop (exchangeId, symbols))
    await Promise.all (loops)
}

main ()
