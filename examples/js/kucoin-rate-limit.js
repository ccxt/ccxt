

import ccxt from '../../js/ccxt.js';

async function main () {

    const exchange = new ccxt.kucoin()
    const markets = await exchange.loadMarkets ()
    const timeframe = '5m'
    const symbol = 'BTC/USDT'
    const since = undefined
    const limit = 1000

    let i = 0
    while (true) {
        try {
            const ohlcvs = await exchange.fetchOHLCV(symbol, timeframe, since, limit)
            const now = exchange.milliseconds()
            const datetime = exchange.iso8601(now)
            console.log(datetime, i, 'fetched', ohlcvs.length, symbol, timeframe, 'candles',
                'from', exchange.iso8601(ohlcvs[0][0]),
                'to', exchange.iso8601(ohlcvs[ohlcvs.length-1][0]))
        } catch (e) {
            if (e instanceof ccxt.RateLimitExceeded) {
                const now = exchange.milliseconds()
                const datetime = exchange.iso8601(now)
                console.log(datetime, i, e.constructor.name, e.message)
                await exchange.sleep(10000)
            } else {
                console.log(e.constructor.name, e.message)
                throw e
            }
        }
        i += 1
    }
}

main ()
