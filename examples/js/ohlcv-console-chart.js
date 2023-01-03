"use strict";

const ccxt       = require ('../../ccxt.js')
const asciichart = require ('asciichart')
const asTable    = require ('as-table')
const log        = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice

//-----------------------------------------------------------------------------

;(async function main () {

    // experimental, not yet implemented for all exchanges
    // your contributions are welcome ;)

    const indexOfClose = 4 // [ timestamp, open, high, low, close, volume ]
    const ohlcv = await new ccxt.cex ().fetchOHLCV ('BTC/USD', '1m')
    const lastPrice = ohlcv[ohlcv.length - 1][indexOfClose] // closing price
    const plotSeriesData = ohlcv.slice (-80).map (x => x[indexOfClose]) // closing price
    const bitcoinRate = ('₿ = $' + lastPrice).green
    const chart = asciichart.plot (plotSeriesData, { height: 15, padding: '            ' })
    log.yellow ("\n" + chart, bitcoinRate, "\n")
    process.exit ()

}) ()