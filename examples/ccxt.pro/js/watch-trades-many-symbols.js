'use strict';

const ccxt = require ('ccxt');

console.log ('CCXT Version:', ccxt.version)

async function watchTrades (exchange, symbol) {

    while (true) {
        try {
            const trades = await exchange.watchTrades (symbol)
            console.log (new Date (), exchange.id, symbol, trades.length, 'trades')
        } catch (e) {
            console.log (symbol, e)
        }
    }
}

async function main () {
    const symbols = [ 'USDT/THB', 'BTC/THB', 'ETH/THB' ]
     const exchange = new ccxt.pro.zipmex({
        'newUpdates': true
    })
    const markets = await exchange.loadMarkets ()
    exchange.verbose = true
    await Promise.all (symbols.map ((symbol) => watchTrades (exchange, symbol)))
}

main()