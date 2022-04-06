'use strict';

const ccxtpro = require ('ccxt.pro');
const asTable  = require ('as-table').configure ({ delimiter: ' | ' })

console.log ('CCXT Pro Version:', ccxtpro.version)


async function loop (exchange, symbol, timeframe) {
    while (true) {
        try {
            const trades = await exchange.watchTrades (symbol)
            if (trades.length >0) {
                const ohlcvc = exchange.buildOHLCVC(trades, timeframe)
                console.log("Symbol:", symbol, "timeframe", timeframe);
                console.log ('-----------------------------------------------------------')
                console.log (asTable (ohlcvc))
                console.log ('-----------------------------------------------------------')
            }
        } catch (e) {
            console.log (symbol, e)
            // do nothing and retry on next loop iteration
            // throw e // uncomment to break all loops in case of an error in any one of them
            // break // you can also break just this one loop if it fails
        }
    }
}

async function main () {

    const exchange = new ccxtpro.ftx ()

    if (exchange.has['watchTrades']) {
        await exchange.loadMarkets ()
        // Change this value accordingly
        const timeframe = '15m'

        const allSymbols = exchange.symbols;

        // arbitrary n symbols
        const limit = 5;
        const selectedSymbols = allSymbols.slice(0, limit);
        // you can also specify the symbols
        // example:
        // const selectedSymbols = ['BTC/USDT', 'LTC/USDT']

        console.log(selectedSymbols);

        await Promise.all (selectedSymbols.map (symbol => loop (exchange, symbol, timeframe)))

    } else {
        console.log (exchange.id, 'does not support watchTrades yet')
    }
}

main ()