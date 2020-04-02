'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , testTicker = require ('ccxt/js/test/Exchange/test.ticker.js')
    , errors = require ('ccxt/js/base/errors.js')

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
    const ends = now + 20000

    while (now < ends) {

        try {

            response = await exchange[method] (symbol)

            testTicker (exchange, response, method, symbol)

        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e
            }
        }

        now = Date.now ()

    }

    return response
}
