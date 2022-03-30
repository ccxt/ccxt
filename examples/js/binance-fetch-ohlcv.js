

import ccxt from '../../ccxt.js';
import asciichart from 'asciichart';
import asTable from 'as-table';
import ololog from 'ololog'
import ansicolor from 'ansicolor';


const log  = ololog.configure ({ locate: false })

ansicolor.nice

//-----------------------------------------------------------------------------

;(async function main () {

    const index = 4 // [ timestamp, open, high, low, close, volume ]


    const ohlcv = await new ccxt.binance ().fetchOHLCV ('BTC/USDT', '1h')


    const lastPrice = ohlcv[ohlcv.length - 1][index] // closing price
    const series = ohlcv.slice (-80).map (x => x[index])         // closing price
    const bitcoinRate = ('₿ = $' + lastPrice).green
    const chart = asciichart.plot (series, { height: 15, padding: '            ' })
    log.yellow ("\n" + chart, bitcoinRate, "\n")
    process.exit ()

}) ()