'use strict'

// ----------------------------------------------------------------------------

const testMarket = require ('./test.market.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    const skippedExchanges = [
        'bitforex',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchMarkets...')
        return
    }

    if (exchange.has.fetchMarkets) {

        // log ('fetching markets...')

        const method = 'fetchMarkets'
        const markets = await exchange[method] ()
        Object.values (markets).forEach ((market) => testMarket (exchange, market, method))
        return markets

    } else {

        console.log ('fetching markets not supported')
    }
}
