'use strict'

// ----------------------------------------------------------------------------

const testMarket = require ('./test.market.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    const method = 'loadMarkets'

    const skippedExchanges = [
        'bitforex',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }

    const markets = await exchange[method] ()
    const values = Object.values (markets)
    for (let i = 0; i < values.length; i++) {
        const market = values[i]
        testMarket (exchange, market, method)
    }
    return markets
}
