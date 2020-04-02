'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , chai = require ('chai')
    , asTable = require ('as-table')
    , assert = chai.assert
    , testOHLCV = require ('ccxt/js/test/Exchange/test.ohlcv.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    // log (symbol.green, 'watching ohlcv...')

    const method = 'watchOHLCV'

    if (!exchange.has[method]) {
        log (exchange.id, 'does not support', method + '() method')
        return
    }

    const timeframe = Object.keys (exchange.timeframes)[0]

    let response = undefined

    let now = Date.now ()
    const ends = now + 30000

    while (now < ends) {

        response = await exchange[method] (symbol, timeframe)

        now = Date.now ()

        assert (response instanceof Array)
        // log (symbol.green, method, 'returned', Object.values (response).length.toString ().green, 'ohlcvs')
        for (let j = 0; j < response.length; j++) {
            testOHLCV (exchange, response[j], symbol, now)
            if (j > 0) {
                if (response[j][0] && response[j - 1][0]) {
                    assert (response[j][0] >= response[j - 1][0])
                }
            }
        }

        response = response.map ((ohlcv) => [
            exchange.iso8601 (ohlcv[0]),
            symbol,
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[5],
        ])

        console.log ('--------------------------------------------------------')
        log.noLocate (asTable (response))
    }

    return response
}
