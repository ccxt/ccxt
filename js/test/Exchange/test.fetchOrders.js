'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testOrder = require ('./test.order.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const method = 'fetchOrders'

    const skippedExchanges = [
        'bitmart',
        'rightbtc',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }

    if (exchange.has[method]) {

        const orders = await exchange[method] (symbol)

        console.log ('fetched', orders.length, 'orders, asserting each...')

        assert (orders instanceof Array)

        const now = Date.now ()

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i]
            testOrder (exchange, order, symbol, now)
        }

    } else {

        console.log (method + '() is not supported')
    }
}
