'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testOHLCV = require ('./test.ohlcv.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    const skippedExchanges = [
        'bitmex', // an issue with null values,to be resolved later
        'cex',
        'okex',
        'okcoinusd',
        'mandala',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, 'found in ignored exchanges, skipping fetchOHLCV...')
        return
    }

    if (exchange.has.fetchOHLCV) {

        const timeframe = Object.keys (exchange.timeframes || { '1d': '1d' })[0]
        const limit = 10
        const duration = exchange.parseTimeframe (timeframe)
        const since = exchange.milliseconds () - duration * limit * 1000 - 1000

        // log (symbol.green, 'fetching OHLCV...')

        const ohlcvs = await exchange.fetchOHLCV (symbol, timeframe, since, limit)

        const now = Date.now ()

        for (let i = 0; i < ohlcvs.length; i++) {
            const ohlcv = ohlcvs[i]
            testOHLCV (exchange, ohlcv, symbol, now)
        }

        log (symbol.green, 'fetched', Object.keys (ohlcvs).length.toString ().green, 'OHLCVs')

        return ohlcvs

    } else {

        log ('fetching OHLCV not supported')
    }
}