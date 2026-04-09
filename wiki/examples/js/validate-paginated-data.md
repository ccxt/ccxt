- [Validate Paginated Data](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';
import ololog from 'ololog'
import ansicolor from 'ansicolor';

const log = ololog.configure ({ locate: false })

ansicolor.nice

//-----------------------------------------------------------------------------

/*
* Warning: Sometimes the exchanges have gaps in their OHLCV data, so it does not mean
* that CCXT is broken if you see gaps in the chart.
*/

async function fetchData(exchange, symbol, timeframe) {
    await exchange.loadMarkets()
    // exchange.verbose = true;
    const duration = exchange.parseTimeframe (timeframe) *1000; // in milliseconds
    const ohlcv = await exchange.fetchOHLCV (symbol, timeframe, undefined, undefined, {'paginate': true, 'paginationCalls': 5})
    validateTimeframes(ohlcv, duration, exchange, symbol)
}

function validateTimeframes(ohlcv, duration, exchange, symbol) {
    for (let j = 0; j < ohlcv.length; j++) {
        const [timestamp, open, high, low, close, volume] = ohlcv[j]
        if (j > 0) {
            const [prevTimestamp, prevOpen, prevHigh, prevLow, prevClose, prevVolume] = ohlcv[j - 1]
            if (timestamp - prevTimestamp !== duration) {
                log.red ('[' + j + ']',exchange.id, symbol, 'OHLCV data is not continuous, at', exchange.iso8601 (timestamp), 'diff:', ((timestamp - prevTimestamp) / 1000), 's expected:', duration/ 1000, 's')
            }
        }
    }
    log.green(exchange.id, symbol, `All the ${ohlcv.length} candles returned are continuous`)
}

async function main () {

    const exchanges = {
        'binance': 'BTC/USDT',
        'bitget': 'BTC/USDT',
        'kucoin': 'BTC/USDT',
        'kucoinfutures': 'BTC/USDT:USDT',
        'okex': 'BTC/USDT',
        'bybit': 'BTC/USDT'
    }
    const timeframe = '1m';
    const keys = Object.keys (exchanges)
    const promises = [];
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i]
        const symbol = exchanges[name]
        const exchange = new ccxt[name] ({ enableRateLimit: true })
        promises.push(fetchData(exchange, symbol, timeframe))
    }
    await Promise.all(promises)
}

main() 
```