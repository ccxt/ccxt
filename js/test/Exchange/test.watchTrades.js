'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , chai = require ('chai')
    , asTable = require ('as-table')
    , assert = chai.assert
    , testTrade = require ('ccxt/js/test/Exchange/test.trade.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    // log (symbol.green, 'watching order book...')

    const method = 'watchTrades'

    const skippedExchanges = [
        'binanceje'
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, method, 'test skipped')
        return
    }

    if (!exchange.has[method]) {
        log (exchange.id, 'does not support', method + '() method')
        return
    }

    let response = undefined

    let now = Date.now ()
    const ends = now + 60000

    while (now < ends) {

        response = await exchange[method] (symbol)

        now = Date.now ()

        log.noLocate (asTable (response))

        assert (response instanceof Array)
        log (symbol.green, method, 'returned', Object.values (response).length.toString ().green, 'trades')
        for (let i = 0; i < response.length; i++) {
            testTrade (exchange, response[i], symbol, now)
            if (i > 0) {
                if (response[i].timestamp && response[i - 1].timestamp) {
                    assert (response[i].timestamp >= response[i - 1].timestamp)
                }
            }
        }
    }

    return response
}
