'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testTrade = require ('./test.trade.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const method = 'fetchTrades'

    const skippedExchanges = []

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }

    if (exchange.has[method]) {

        const trades = await exchange[method] (symbol)
        assert (trades instanceof Array)
        console.log (symbol, 'fetched', Object.values (trades).length, 'trades')
        const now = Date.now ()
        for (let i = 0; i < trades.length; i++) {
            testTrade (exchange, trades[i], symbol, now)
            if (i > 0) {
                if (trades[i].timestamp && trades[i - 1].timestamp) {
                    assert (trades[i].timestamp >= trades[i - 1].timestamp)
                }
            }

        }

    } else {

        console.log (symbol, method + '() is not supported')
    }
}
