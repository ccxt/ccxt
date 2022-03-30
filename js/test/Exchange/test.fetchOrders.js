

// ----------------------------------------------------------------------------

import assert from 'assert'
import testOrder from './test.order.js'

// ----------------------------------------------------------------------------

export default async (exchange, symbol) => {

    const skippedExchanges = [
        'bitmart',
        'rightbtc',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchMyTrades...')
        return
    }

    if (exchange.has.fetchOrders) {

        const orders = await exchange.fetchOrders (symbol)

        console.log ('fetched', orders.length, 'orders, asserting each...')

        assert (orders instanceof Array)

        const now = Date.now ()

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i]
            testOrder (exchange, order, symbol, now)
        }

    } else {

        console.log ('fetching orders not supported')
    }
}
