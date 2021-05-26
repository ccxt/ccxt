'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testTicker = require ('./test.ticker.js')

// ----------------------------------------------------------------------------

const printTickerOneLiner = (ticker, method, symbol) => {

    log (symbol.toString ().green,
        method,
        ticker['datetime'],
        'bid: '       + (ticker['bid']),
        'ask: '       + (ticker['ask']))
}

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const method = 'fetchTicker'

    const skippedExchanges = [
        'digifinex',
        'currencycom'
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }

    if (exchange.has[method]) {

        // log (symbol.green, 'fetching ticker...')

        const ticker = await exchange.fetchTicker (symbol)

        testTicker (exchange, ticker, method, symbol)

        printTickerOneLiner (ticker, method, symbol)

        return ticker

    } else {

        log (symbol.green, 'fetchTicker () not supported')
    }
}

