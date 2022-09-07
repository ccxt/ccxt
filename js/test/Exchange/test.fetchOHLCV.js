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
        const exchangeHasOneMinuteTimeframe = exchange.timeframes && ('1m' in exchange.timeframes)
        const timeframe = exchangeHasOneMinuteTimeframe ? '1m' : Object.keys (exchange.timeframes || { '1d': '1d' })[0]
        const limit = 10
        const duration = exchange.parseTimeframe (timeframe)
        const since = exchange.milliseconds () - duration * limit * 1000 - 1000

        const ohlcvs = await exchange[method] (symbol, timeframe, since, limit)

        // check boundaries
        const skippedExchangesForBoundaryChecks = [
            "flowbtc", // returns bars over limit timestamp
            "independentreserve", // returns bars earlier than since
            "liquid", // returns bars earlier than since
            "ndax", // returns bars over limit timestamp
            "paymium", // returns bars earlier than since
            "zipmex", // returns bars over limit timestamp
            "btcex", // returns bars over limit timestamp, only through fetchTrades
        ]
        if (!exchange.inArray(exchange.id, skippedExchangesForBoundaryChecks)) {
            const returnedAmount = ohlcvs.length
            // ensure bars amount is less then limit
            assert (returnedAmount <= limit, "Returned bars amount (" + returnedAmount.toString() + ") is more than requested (" + limit.toString() + ")");
            if (returnedAmount > 0) {
                // ensure that timestamps are greaterOrEqual than since
                ohlcvs.forEach(ohlcv=>assert (ohlcv[0] >= since, "Returned bar is earlier than requested since"));
                if (limit !== undefined) {
                    const maxTs = since + duration * 1000 * limit;
                    // ensure last timestamp is under than requested since + limit * duration
                    ohlcvs.forEach(ohlcv=>assert (ohlcv[0] <= maxTs, "Returned bar is greater than requested end boundary"))
                }
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
