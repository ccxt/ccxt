'use strict'

// ----------------------------------------------------------------------------

const testOHLCV = require ('./test.ohlcv.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const skippedExchanges = [
        'btcalpha', // issue with 404 on a documented endpoint https://travis-ci.org/ccxt/ccxt/builds/643930431#L2213
        'bitmex', // an issue with null values,to be resolved later
        'cex',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchOHLCV...')
        return
    }

    if (exchange.has.fetchOHLCV) {

        const timeframe = Object.keys (exchange.timeframes || { '1d': '1d' })[0]
        const limit = 10
        const duration = exchange.parseTimeframe (timeframe)
        const since = exchange.milliseconds () - duration * limit * 1000 - 1000

        const ohlcvs = await exchange.fetchOHLCV (symbol, timeframe, since, limit)

        const now = Date.now ()

        for (let i = 0; i < ohlcvs.length; i++) {
            const ohlcv = ohlcvs[i]
            testOHLCV (exchange, ohlcv, symbol, now)
        }

        console.log (symbol, 'fetched', Object.keys (ohlcvs).length, 'OHLCVs')

        return ohlcvs

    } else {

        console.log ('fetching OHLCV not supported')
    }
}
