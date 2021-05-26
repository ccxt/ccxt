'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testMarket = require ('./test.market.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange) => {

    const skippedExchanges = [
        'bitforex',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, 'found in ignored exchanges, skipping loadMarkets...')
        return
    }

    if (exchange.has.loadMarkets) {

        // log ('loading markets...')

        const method = 'loadMarkets'
        const markets = await exchange[method] ()
        Object.values (markets).forEach ((market) => testMarket (exchange, market, method))
        return markets

    } else {

        log ('loading markets not supported')
    }
}

