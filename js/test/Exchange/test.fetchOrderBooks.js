'use strict'

// ----------------------------------------------------------------------------

const testOrderBook = require ('./test.orderbook.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    const randomSymbols = exchange.symbols.slice ().sort (() => 0.5 - Math.random ()).slice (0, 2)
    const customExchangeParams = ([
        'yobit',
        'tidex',
        'ccex',
        'liqui',
        'dsx',
    ]).reduce ((params, id) => ({ ... params, [id]: [randomSymbols], }), {})

    const args = (exchange.id in customExchangeParams) ? customExchangeParams[exchange.id] : []
    const method = 'fetchOrderBooks'

    if (exchange.has[method]) {

        const orderbooks = await exchange[method] (... args)

        Object.entries (orderbooks).forEach (([symbol, orderbook]) => {
            testOrderBook (exchange, orderbook, method, symbol)
        })

    } else {

        console.log (method + '() not supported')
    }
}
