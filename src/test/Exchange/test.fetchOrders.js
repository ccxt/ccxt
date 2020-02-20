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

    const skippedExchanges = [
        'mandala',
        'rightbtc',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, 'found in ignored exchanges, skipping fetchMyTrades...')
        return
    }

    if (exchange.has.fetchOrders) {

        // log ('fetching orders...')

        const orders = await exchange.fetchOrders (symbol)

        log ('fetched', orders.length.toString ().green, 'orders, asserting each...')

        assert (orders instanceof Array)

        const now = Date.now ()

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i]
            testOrder (exchange, order, symbol, now)
        }

        // log (asTable (orders))

    } else {

        log ('fetching orders not supported')
    }
}