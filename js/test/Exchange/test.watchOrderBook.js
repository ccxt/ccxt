'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testOrderBook = require ('ccxt/js/test/Exchange/test.orderbook.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    // log (symbol.green, 'watching order book...')

    const method = 'watchOrderBook'

    if (exchange.has[method]) {

        let orderbook = undefined

        for (let i = 0; i < 10; i++) {

            orderbook = await exchange[method] (symbol)

            // console.log (new Date (), symbol,
            //     orderbook['asks'].length, 'asks', orderbook['asks'][0],
            //     orderbook['bids'].length, 'bids', orderbook['bids'][0],
            // )

            testOrderBook (exchange, orderbook, method, symbol)
        }

        return orderbook

    } else {

        log (method + '() not supported')
    }
}