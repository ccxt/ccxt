'use strict';


const ccxt = require ('../../ccxt.js')

const exchange = new ccxt.ftx ()

;(async () => {

    const symbol = 'BTC/USDT'
    await exchange.loadMarkets ()
    const MS_divisor = 1000 // as FTX works with Seconds, instead of Milliseconsd
    // because of current FTX peculiarities, we have to use workaround to fetch all trades
    const since = exchange.milliseconds() - 8 * 60 * 60 * 1000// from 8 hours ago
    let end_time = exchange.milliseconds() // current time
    let allTrades = []
    while (end_time > since) {
        const trades = await exchange.fetchTrades (symbol, since/MS_divisor, undefined, {'end_time': end_time/MS_divisor})
        if (trades.length) {
            const firstTrade = trades[0]
            const lastTrade = trades[trades.length - 1]
            console.log ('Fetched', trades.length, symbol, 'trades from', firstTrade['timestamp'], '(' + firstTrade['datetime'] + ')', 'to', lastTrade['timestamp'], '(' + lastTrade['datetime'] + ')' )
            end_time = firstTrade['timestamp']
            allTrades.push (...trades)
        } else {
            console.log ('No trades returned.')
            break;
        }
    }
    allTrades = exchange.filterBySinceLimit (allTrades, since)
    console.log ('Done.', 'There were', allTrades.length, 'trades from', since, 'till', end_time)

}) ()
