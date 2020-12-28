'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testTrade = require ('./test.trade.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    const skippedExchanges = [
        'bitso',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, 'found in ignored exchanges, skipping fetchMyTrades...')
        return
    }

    if (exchange.has.fetchMyTrades) {

        // log ('fetching my trades...')

        const trades = await exchange.fetchMyTrades (symbol)

        assert (trades instanceof Array)

        log ('fetched', trades.length.toString ().green, 'trades')

        const now = Date.now ()

        for (let i = 0; i < trades.length; i++) {
            testTrade (exchange, trades[i], symbol, now)
            if (i > 0) {
                assert (trades[i].timestamp >= trades[i - 1].timestamp)
            }
        }

        // trades.forEach (trade => log.dim ('-'.repeat (80), "\n", trade))
        // log (asTable (trades))

    } else {

        log ('fetching my trades not supported')
    }
}
