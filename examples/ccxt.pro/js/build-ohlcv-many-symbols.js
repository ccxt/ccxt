'use strict';

const ccxt = require ('ccxt');
const asTable  = require ('as-table').configure ({ delimiter: ' | ' })

console.log ('CCXT Version:', ccxt.version)


async function loop (exchange, symbol, timeframe, completeCandlesOnly = false) {
    const durationInSeconds = exchange.parseTimeframe (timeframe)
    const durationInMs = durationInSeconds * 1000
    while (true) {
        try {
            const trades = await exchange.watchTrades (symbol)
            if (trades.length > 0) {
                const currentMinute = parseInt (exchange.milliseconds () / durationInMs)
                let ohlcvc = exchange.buildOHLCVC (trades, timeframe)
                if (completeCandlesOnly) {
                    ohlcvc = ohlcvc.filter (candle => parseInt (candle[0] / durationInMs) < currentMinute)
                }
                if (ohlcvc.length > 0) {
                    console.log("Symbol:", symbol, "timeframe:", timeframe);
                    console.log ('-----------------------------------------------------------')
                    console.log (asTable (ohlcvc))
                    console.log ('-----------------------------------------------------------')
                }
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
    // select the exchange
     const exchange = new ccxt.pro.ftx ()

    if (exchange.has['watchTrades']) {
        await exchange.loadMarkets ()
        // Change this value accordingly
        const timeframe = '1m'

        const allSymbols = exchange.symbols;

        // arbitrary n symbols
        const limit = 5;
        // const selectedSymbols = allSymbols.slice(0, limit);
        // you can also specify the symbols manually
        // example:
        // const selectedSymbols = ['BTC/USDT', 'LTC/USDT']

        console.log(selectedSymbols);

        // Use this variable to choose if only complete candles 
        // should be considered
        const completeCandlesOnly = true

        await Promise.all (selectedSymbols.map (symbol => loop (exchange, symbol, timeframe, completeCandlesOnly)))

    } else {
        console.log (exchange.id, 'does not support watchTrades yet')
    }
}

main ()