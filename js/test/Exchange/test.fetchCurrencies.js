'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert


/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    if (exchange.has.fetchCurrencies) {

        // log ('fetching currencies...')

        let currencies = await exchange.fetchCurrencies ()

        log ('fetched', currencies.length.toString ().green, 'currencies')

        // log (asTable (currencies))

        return currencies

    } else {

        log ('fetching currencies not supported')
    }
}