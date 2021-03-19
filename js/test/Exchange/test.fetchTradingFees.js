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
        log (exchange.id, 'found in ignored exchanges, skipping fetchTradingFees...')
        return
    }

    if (exchange.has.fetchTradingFees) {

        // log ('fetching trading fees...')

        const method = 'fetchTradingFees'
        const fees = await exchange[method] ()
        log.green ({ 'maker': fees['maker'], 'taker': fees['taker'] })
        return fees

    } else {

        log ('fetching trading fees not supported')
    }
}

