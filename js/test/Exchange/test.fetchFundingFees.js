'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange) => {

    const skippedExchanges = [
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, 'found in ignored exchanges, skipping fetchFundingFees...')
        return
    }

    if (exchange.has.fetchFundingFees) {

        // log ('fetching funding fees...')

        const method = 'fetchFundingFees'
        const fees = await exchange[method] ()
        log.green (fees)
        return fees

    } else {

        log ('fetching funding fees not supported')
    }
}

