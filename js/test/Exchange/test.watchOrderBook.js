'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , testOrderBook = require ('ccxt/js/test/Exchange/test.orderbook.js')
    , errors = require ('ccxt/js/base/errors.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    // log (symbol.green, 'watching order book...')

    const method = 'watchOrderBook'

    if (!exchange.has[method]) {
        log (exchange.id, 'does not support', method + '() method')
        return
    }

    let response = undefined

    let now = Date.now ()
    const ends = now + 20000

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
