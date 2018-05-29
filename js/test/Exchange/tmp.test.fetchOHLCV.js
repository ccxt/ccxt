'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    if (exchange.has.fetchOHLCV) {

        // log (symbol.green, 'fetching OHLCV...')

        let ohlcvs = await exchange.fetchOHLCV (symbol)

        log (symbol.green, 'fetched', Object.keys (ohlcvs).length.toString ().green, 'OHLCVs')

        // let now = Date.now ()
        for (let i = 1; i < ohlcvs.length; i++) {
            // testOHLCV (exchange, ohlcvs[i], symbol, now)
            assert (ohlcvs[i][0] >= ohlcvs[i - 1][0], 'OHLCV timestamps out of order: ' + ohlcvs[i][0] + ' < ' + ohlcvs[i - 1][0])
        }

        return ohlcvs

    } else {

        log ('fetching OHLCV not supported')
    }
}