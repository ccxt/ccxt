'use strict'

// ----------------------------------------------------------------------------

const testMarket = require ('./test.market.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    const method = 'fetchMarkets'

    const skippedExchanges = [
        'bitforex',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }

    if (exchange.has[method]) {

        // log ('fetching markets...')
        const markets = await exchange[method] ()
        Object.values (markets).forEach ((market) => testMarket (exchange, market, method))
        return markets

    } else {

        console.log (method + '() is not supported')
    }
}
