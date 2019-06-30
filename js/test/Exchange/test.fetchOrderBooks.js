'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testOrderBook = require ('./test.orderbook.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange) => {

    const randomSymbols = exchange.symbols.sort (() => 0.5 - Math.random ()).slice (0, 2)
    const customExchangeParams = ([
        'yobit',
        'tidex',
        'cryptopia',
        'ccex',
        'liqui',
    ]).reduce ((params, id) => ({ ...params, [id]: [randomSymbols], }), {})

    const args = (exchange.id in customExchangeParams) ? customExchangeParams[exchange.id] : []
    const method = 'fetchOrderBooks'

    if (exchange.has[method]) {

        // log ('fetching order books...')

        let orderbooks = await exchange[method] (...args)

        // log.green (orderbooks)

        Object.entries (orderbooks).forEach (([symbol, orderbook]) => {
            testOrderBook (exchange, orderbook, method, symbol)
        })

        // return orderbooks

    } else {

        log (method + '() not supported')
    }
}