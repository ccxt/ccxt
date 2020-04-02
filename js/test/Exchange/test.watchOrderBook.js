'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , testOrderBook = require ('ccxt/js/test/Exchange/test.orderbook.js')

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

        response = await exchange[method] (symbol)

        now = Date.now ()

        testOrderBook (exchange, response, method, symbol)
    }

    return response
}
