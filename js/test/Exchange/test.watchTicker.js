'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , testTicker = require ('ccxt/js/test/Exchange/test.ticker.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    // log (symbol.green, 'watching ticker...')

    const method = 'watchTicker'

    if (!exchange.has[method]) {
        log (exchange.id, 'does not support', method + '() method')
        return
    }

    let response = undefined

    for (let i = 0; i < 10; i++) {

        response = await exchange[method] (symbol)
        testTicker (exchange, response, method, symbol)
    }

    return response
}