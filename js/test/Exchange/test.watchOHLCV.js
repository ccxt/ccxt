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

    for (let i = 0; i < 3; i++) {

        response = await exchange[method] (symbol, timeframe)

        assert (response instanceof Array)
        // log (symbol.green, method, 'returned', Object.values (response).length.toString ().green, 'ohlcvs')
        let now = Date.now ()
        for (let i = 0; i < response.length; i++) {
            testOHLCV (exchange, response[i], symbol, now)
            if (i > 0) {
                if (response[i][0] && response[i - 1][0]) {
                    assert (response[i][0] >= response[i - 1][0])
                }
            }
        }

        response = response.map (ohlcv => [
            exchange.iso8601 (ohlcv[0]),
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