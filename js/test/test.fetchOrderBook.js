'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testOrderBook = require ('./test.orderbook.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    // log (symbol.green, 'fetching order book...')

    const method = 'fetchOrderBook'

    if (exchange.has[method]) {

        let orderbook = await exchange[method] (symbol)

        testOrderBook (orderbook, method, symbol)

        return orderbook

    } else {

        log (method + '() not supported')
    }
}