'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testOrder = require ('./test.order.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    if (exchange.has.fetchOrders) {

        // log ('fetching orders...')

        let orders = await exchange.fetchOrders (symbol)

        log ('fetched', orders.length.toString ().green, 'orders, asserting each...')

        assert (orders instanceof Array)

        let now = Date.now ()

        for (let i = 0; i < orders.length; i++) {
            let order = orders[i]
            testOrder (exchange, order, symbol, now)
        }

        // log (asTable (orders))

    } else {

        log ('fetching orders not supported')
    }
}