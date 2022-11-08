'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testOrder = require ('./test.order.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const method = 'fetchClosedOrders'

    if (exchange.has[method]) {

        const orders = await exchange[method] (symbol)

        console.log ('fetched', orders.length, 'closed orders, testing each')

        assert (orders instanceof Array)

        const now = Date.now ()

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i]
            testOrder (exchange, order, symbol, now)
            assert (order.status === 'closed' || order.status === 'canceled')
        }

    } else {

        console.log (method + '() is not supported')
    }
}
