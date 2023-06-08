

import ccxt from '../../js/ccxt.js';
import asciichart from 'asciichart';
import asTable from 'as-table';
import ololog from 'ololog'
import ansicolor from 'ansicolor';

const log        = ololog.configure ({ locate: false })

ansicolor.nice

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