'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testTrade = require ('./test.trade.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const method = 'fetchMyTrades'

    const skippedExchanges = [
        'bitso',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }

    if (exchange.has[method]) {

        const trades = await exchange[method] (symbol)

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

        console.log (method + '() is not supported')
    }
}
