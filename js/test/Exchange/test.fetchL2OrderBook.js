'use strict'

// ----------------------------------------------------------------------------

const testOrderBook = require ('./test.orderbook.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const method = 'fetchL2OrderBook'

    if (exchange.has[method]) {

        const orderbook = await exchange[method] (symbol)
        testOrderBook (exchange, orderbook, method, symbol)
        return orderbook

    } else {

        console.log (method + '() not supported')
    }
}
