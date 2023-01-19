'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , assert = require('assert')
    , testTrade = require ('../../../test/Exchange/test.trade.js')
    , errors = require ('../../../base/errors.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    // log (symbol.green, 'watching my trades...')

    const method = 'watchMyTrades'

    if (!exchange.has[method]) {
        log (exchange.id, 'does not support', method + '() method')
        return
    }

    let response = undefined

    let now = Date.now ()
    const ends = now + 10000

    while (now < ends) {

        try {

            response = await exchange[method] (symbol)

            now = Date.now ()

            assert (response instanceof Array)

            log (exchange.iso8601 (now), exchange.id, symbol.green, method, Object.values (response).length.toString ().green, 'trades')

            // log.noLocate (asTable (response))

            for (let i = 0; i < response.length; i++) {
                const trade = response[i]
                testTrade (exchange, trade, symbol, now)
                if (i > 0) {
                    const previousTrade = response[i - 1]
                    if (trade.timestamp && previousTrade.timestamp) {
                        assert (trade.timestamp >= previousTrade.timestamp)
                    }
                }
            }
        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e
            }

            now = Date.now ()
        }
    }

    return response
}
