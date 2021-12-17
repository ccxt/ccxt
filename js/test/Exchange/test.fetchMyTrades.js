'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testTrade = require ('./test.trade.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const skippedExchanges = [
        'bitso',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchMyTrades...')
        return
    }

    if (exchange.has.fetchMyTrades) {

        const trades = await exchange.fetchMyTrades (symbol)

        assert (trades instanceof Array)

        console.log ('fetched', trades.length, 'trades')

        const now = Date.now ()

        for (let i = 0; i < trades.length; i++) {
            testTrade (exchange, trades[i], symbol, now)
            if (i > 0) {
                assert (trades[i].timestamp >= trades[i - 1].timestamp)
            }
        }

    } else {

        console.log ('fetching my trades not supported')
    }
}
