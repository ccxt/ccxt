'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
const testOHLCV = require ('./test.ohlcv.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const method = 'fetchOHLCV'

    const skippedExchanges = [
        'btcalpha', // issue with 404 on a documented endpoint https://travis-ci.org/ccxt/ccxt/builds/643930431#L2213
        'bitmex', // an issue with null values,to be resolved later
        'cex',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }

    if (exchange.has[method]) {

        const timeframe = Object.keys (exchange.timeframes || { '1d': '1d' })[0]
        const limit = 10
        const duration = exchange.parseTimeframe (timeframe)
        const since = exchange.milliseconds () - duration * limit * 1000 - 1000

        const ohlcvs = await exchange[method] (symbol, timeframe, since, limit);
        ohlcvs[ohlcvs.length-1][0] = ohlcvs[ohlcvs.length-1][0] + duration * 1000;
        // ensure bars amount is less then limit
        assert (ohlcvs.length <= limit, "Returned bars amount is more than requested");
        if (ohlcvs.length > 0) {
            // ensure that timestamps are greaterOrEqual than since
            ohlcvs.forEach(ohlcv=>assert (ohlcv[0] >= since, "Returned bar is earlier than requested since"));
            if (limit !== undefined) {
                const maxTs = since + duration * 1000 * limit;
                // ensure last timestamp is under than requested since + limit * duration
                ohlcvs.forEach(ohlcv=>assert (ohlcv[0] <= maxTs, "Returned bar is greater than requested end boundary"));
            }
        }

        const now = Date.now ()

        for (let i = 0; i < ohlcvs.length; i++) {
            const ohlcv = ohlcvs[i]
            testOHLCV (exchange, ohlcv, symbol, now)
        }

        console.log (symbol, 'fetched', Object.keys (ohlcvs).length, 'OHLCVs')

        return ohlcvs

    } else {

        console.log (method + '() is not supported')
    }
}
