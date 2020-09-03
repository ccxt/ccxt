'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testCurrency = require ('./test.currency.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange) => {

    const skippedExchanges = [
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, 'found in ignored exchanges, skipping fetchCurrencies...')
        return
    }

    if (exchange.has.fetchCurrencies) {

        // log ('fetching currencies...')

        const method = 'fetchCurrencies'
        const currencies = await exchange[method] ()
        Object.values (currencies).forEach ((currency) => testCurrency (exchange, currency, method))
        return currencies

    } else {

        log ('fetching currencies not supported')
    }
}

