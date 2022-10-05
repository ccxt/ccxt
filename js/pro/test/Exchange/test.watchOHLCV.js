'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , assert = require ('assert')
    , testOHLCV = require ('../../../test/Exchange/test.ohlcv.js')
    , errors = require ('../../../base/errors.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    // log (symbol.green, 'watching ohlcv...')

    const method = 'watchOHLCV'

    const skippedExchanges = [
        'dsx',
        'idex2', // rinkeby testnet, trades too rare
        'bitvavo',
        'zb', // supports watchOHLCV for contracts only
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, method + '() test skipped')
        return
    }

    if (!exchange.has[method]) {
        log (exchange.id, 'does not support', method + '() method')
        return
    }

    const timeframe = (exchange.timeframes && ('1m' in exchange.timeframes)) ? '1m' : Object.keys (exchange.timeframes)[0]

    let response = undefined

    let now = Date.now ()
    const ends = now + 10000

    while (now < ends) {

        try {

            response = await exchange[method] (symbol, timeframe)

            now = Date.now ()

            assert (response instanceof Array)

            // log (symbol.green, method, 'returned', Object.values (response).length.toString ().green, 'ohlcvs')
            for (let i = 0; i < response.length; i++) {
                const current = response[i]
                testOHLCV (exchange, current, symbol, now)
                if (i > 0) {
                    const previous = response[i - 1]
                    if (current[0] && previous[0]) {
                        assert (current[0] >= previous[0],
                            'OHLCV timestamp ordering is wrong at candle ' + i.toString () + ' ' + current[0].toString () + ' < ' + previous[0].toString ())
                    }
                }
            }

            response = response.map ((ohlcv) => [
                exchange.iso8601 (ohlcv[0]),
                ohlcv[1],
                ohlcv[2],
                ohlcv[3],
                ohlcv[4],
                ohlcv[5],
            ])

            if (response.length > 0) {
                log (exchange.iso8601 (now), exchange.id, timeframe, symbol, response.length, 'candles', JSON.stringify (response[response.length - 1]))
            }

        } catch (e) {

            log (e)

            if (!(e instanceof errors.NetworkError)) {
                throw e
            }

            now = Date.now ()
        }

        // console.log ('--------------------------------------------------------')
        // log.noLocate (asTable (response))
    }

    return response
}
