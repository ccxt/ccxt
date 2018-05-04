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

    if (exchange.has.fetchClosedOrders) {

        // log ('fetching closed orders...')

        let orders = await exchange.fetchClosedOrders (symbol)

        log ('fetched', orders.length.toString ().green, 'closed orders, testing each')

        assert (orders instanceof Array)

        let now = Date.now ()

        for (let i = 0; i < orders.length; i++) {
            let order = orders[i]
            testOrder (exchange, order, symbol, now)
            assert (order.status === 'closed')
        }

        // log (asTable (orders))

    } else {

        log ('fetching closed orders not supported')
    }
}