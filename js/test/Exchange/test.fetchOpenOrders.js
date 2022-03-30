

// ----------------------------------------------------------------------------

import assert from 'assert'
import testOrder from './test.order.js'

// ----------------------------------------------------------------------------

export default async (exchange, symbol) => {

    if (exchange.has.fetchOpenOrders) {

        // log ('fetching open orders...')

        const orders = await exchange.fetchOpenOrders (symbol)

        assert (orders instanceof Array)

        console.log ('fetched', orders.length, 'open orders')

        const now = Date.now ()

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i]
            testOrder (exchange, order, symbol, now)
            assert (order.status === 'open')
        }

        // log (asTable (orders))

    } else {

        console.log ('fetching open orders not supported')
    }
}
