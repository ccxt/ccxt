'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , testTicker = require ('ccxt/js/test/Exchange/test.ticker.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    // log (symbol.green, 'watching ticker...')

    const method = 'watchTicker'

    if (!exchange.has[method]) {
        log (exchange.id, method, 'is not supported or not implemented yet')
        return
    }

    let response = undefined

    let now = Date.now ()
    const ends = now + 60000

    while (now < ends) {

        response = await exchange[method] (symbol)

        now = Date.now ()

        testTicker (exchange, response, method, symbol)
    }

    return response
}
