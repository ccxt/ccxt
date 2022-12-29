'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , testOrderBook = require ('../../../test/Exchange/test.orderbook.js')
    , errors = require ('../../../base/errors.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    // log (symbol.green, 'watching order book...')

    const method = 'watchOrderBook'

    // we have to skip some exchanges here due to the frequency of trading or to other factors
    const skippedExchanges = [
        'cex', // requires authentication
        'kucoin', // requires authentication for public orderbooks
        'luno', // requires authentication for public orderbooks
        'ripio',
        'gopax', // requires authentication for public orderbooks
        'woo',
        'alpaca', // requires auth
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, method + '() test skipped')
        return
    }

    if (!exchange.has[method]) {
        log (exchange.id, 'does not support', method + '() method')
        return
    }

    let response = undefined

    let now = Date.now ()
    const ends = now + 10000

    while (now < ends) {

        try {

            response = await exchange[method] (symbol)

            testOrderBook (exchange, response, method, symbol)

        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e
            }
        }

        now = Date.now ()
    }

    return response
}
