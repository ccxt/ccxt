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

        let ohlcv = await exchange.fetchOHLCV (symbol)

        log (symbol.green, 'fetched', Object.keys (ohlcv).length.toString ().green, 'OHLCVs')

        return ohlcv

    } else {

        log ('fetching OHLCV not supported')
    }
}