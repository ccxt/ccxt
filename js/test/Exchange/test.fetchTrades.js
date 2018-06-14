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

    if (exchange.has.fetchTrades) {

        // log (symbol.green, 'fetching trades...')

        let trades = await exchange.fetchTrades (symbol)
        assert (trades instanceof Array)
        log (symbol.green, 'fetched', Object.values (trades).length.toString ().green, 'trades')
        let now = Date.now ()
        for (let i = 0; i < trades.length; i++) {
            testTrade (exchange, trades[i], symbol, now)
            if (i > 0)
                assert (trades[i].timestamp >= trades[i - 1].timestamp)
        }
        // log (asTable (trades))

    } else {

        log (symbol.green, 'fetchTrades () not supported'.yellow)
    }
}