'use strict';

const ccxt = require ('../../ccxt.js')

async function main () {

    const exchange = new ccxt.ftx ()
    await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    const symbol = 'BTC/USDT'
    const since = undefined
    const limit = 200
    let endTime = exchange.milliseconds ()
    const startTime = endTime - 1 * 60 * 60 * 1000 // past hour
    let allTrades = {}

    // ftx counts trades starting from end_time into the past
    const params = {
        'end_time': parseInt (endTime / 1000), // FTX expects end_time in seconds
    }

    while (endTime > startTime) {
        const trades = await exchange.fetchTrades (symbol, since, limit, params)
        if (trades.length) {
            const first = trades[0]
            const last = trades[trades.length - 1]
            console.log ('Fetched', trades.length, symbol, 'trades from', first['datetime'], 'to', last['datetime'])
            endTime = first['timestamp']
            params['end_time'] = parseInt (endTime / 1000);
            Object.assign (allTrades, exchange.indexBy (trades, 'id'))
        } else {
            // stop if no trades were returned
            break;
        }
    }

    allTrades = Object.values (allTrades)
    allTrades = exchange.sortBy (allTrades, 'timestamp')
    allTrades = exchange.filterBySinceLimit (allTrades, startTime)
    const first = allTrades[0]
    const last = allTrades[allTrades.length - 1]
    console.log ('Done.', 'There were', allTrades.length, 'trades from', first['datetime'], 'till', last['datetime'])

}

main ()
