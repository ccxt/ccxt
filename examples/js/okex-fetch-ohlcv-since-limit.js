const ccxt = require ('../../ccxt.js')
    , log  = require ('ololog')
    , ansi = require ('ansicolor').nice

;(async () => {

    const exchange = new ccxt['okex']()
    exchange.enableRateLimit = true

    let limit = undefined
    let symbol = 'BTC/USDT'
    let interval = '15m'

    // enable either of the following two lines
    exchange.options['warnOnFetchOHLCVLimitArgument'] = false
    // limit = 3

    const dates = [
        '2014-01-01T00:00:00', // okex did not exist then
        '2016-02-01T00:00:00',
        '2018-02-15T00:00:00',
        '2018-02-25T00:00:00',
        '2018-02-27T00:00:00',
    ]

    const results = await Promise.all (dates.map (async date => {
        since = exchange.parse8601 (date)
        const ohlcv = await exchange.fetchOHLCV (symbol, interval, since, limit)
        const fetchingFrom = date.green
        const firstCandleDate = ohlcv.length ? exchange.iso8601 (ohlcv[0][0]).yellow : undefined
        const lastCandleDate = ohlcv.length ? exchange.iso8601 (ohlcv[ohlcv.length - 1][0]).yellow : undefined
        const count = ohlcv.length.toString ().red
        return { fetchingFrom, firstCandleDate, lastCandleDate, count, ohlcv }
    }))

    log (results)

}) ()
