'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testOrderBook = require ('./test.orderbook.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange) => {

    const method = 'fetchOrderBooks'

    if (exchange.has[method]) {

        // log ('fetching order books...')

        let orderbooks = await exchange[method] ()

        // log.green (orderbooks)

        // Object.values (orderbooks).forEach (orderbook => {
        //     testOrderBook (exchange, orderbook, method) //, symbol)
        // })

        return orderbooks

    } else {

        log (method + '() not supported')
    }
}