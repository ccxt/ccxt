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

    if (exchange.has.fetchMyTrades) {

        // log ('fetching my trades...')

        let trades = await exchange.fetchMyTrades (symbol, 0)

        assert (trades instanceof Array)

        log ('fetched', trades.length.toString ().green, 'trades')

        let now = Date.now ()

        for (let i = 0; i < trades.length; i++) {
            testTrade (exchange, trades[i], symbol, now)
            if (i > 0)
                assert (trades[i].timestamp >= trades[i - 1].timestamp)
        }

        // trades.forEach (trade => log.dim ('-'.repeat (80), "\n", trade))
        // log (asTable (trades))

    } else {

        log ('fetching my trades not supported')
    }
}