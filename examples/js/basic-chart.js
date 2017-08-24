"use strict";

const ccxt       = require ('../../ccxt.js')
const asciichart = require ('asciichart')
const asTable    = require ('as-table')
const log        = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice;

//-----------------------------------------------------------------------------

(async function main () {

    const ohlcv = await new ccxt.okcoinusd ().fetchOHLCV ('BTC/USD', 900)
    log.yellow (
        "\n" + asciichart.plot (ohlcv.map (x => x[4]), { height: 15 }), 
        ('₿ = $' + ohlcv[ohlcv.length - 1][4]).toString ().green, "\n")
    process.exit ()

}) ()