'use strict'

// ----------------------------------------------------------------------------

const testTicker = require ('./test.ticker.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const method = 'fetchTicker'

    const skippedExchanges = [
        'digifinex',
        'currencycom'
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }

    if (exchange.has[method]) {

        const ticker = await exchange.fetchTicker (symbol)

        testTicker (exchange, ticker, method, symbol)

        console.log (symbol, method, ticker['datetime'], 'bid:', ticker['bid'], 'ask:', ticker['ask'])

        return ticker

    } else {

        console.log (symbol, 'fetchTicker () not supported')
    }
}

