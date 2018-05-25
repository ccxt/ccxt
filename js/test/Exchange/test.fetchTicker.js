'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testTicker = require ('./test.ticker.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    const method = 'fetchTicker'

    if (exchange.has[method]) {

        // log (symbol.green, 'fetching ticker...')

        let ticker = await exchange.fetchTicker (symbol)

        testTicker (exchange, ticker, method, symbol)

        return ticker

    } else {

        log (symbol.green, 'fetchTicker () not supported')
    }
}

