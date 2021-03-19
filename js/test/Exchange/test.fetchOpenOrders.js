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

    if (exchange.has.fetchOpenOrders) {

        // log ('fetching open orders...')

        const orders = await exchange.fetchOpenOrders (symbol)

        assert (orders instanceof Array)

        log ('fetched', orders.length.toString ().green, 'open orders')

        const now = Date.now ()

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i]
            testOrder (exchange, order, symbol, now)
            assert (order.status === 'open')
        }

        // log (asTable (orders))

    } else {

        log ('fetching open orders not supported')
    }
}