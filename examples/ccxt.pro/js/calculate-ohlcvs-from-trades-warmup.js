'use strict';

const ccxt = require ('../../../ccxt');

console.log ('CCXT Version:', ccxt.version)

let ohlcvs = {}

async function log (exchange, symbol, timeframe) {
    const market = exchange.market (symbol)
    const duration = exchange.parseTimeframe (timeframe) * 1000
    console.log (exchange.iso8601 (exchange.milliseconds ()), 'Warming up, waiting for at least one trade...')
    while (!Object.keys (ohlcvs).length) {
        await exchange.throttle (1)
    }
    let now = exchange.milliseconds ()
    const start = (parseInt (now / duration) + 1) * duration
    console.log (exchange.iso8601 (exchange.milliseconds ()), 'Trades started arriving, waiting till', exchange.iso8601 (start))
    await exchange.sleep (start - now)
    console.log (exchange.iso8601 (exchange.milliseconds ()), 'Done warming up')
    for (let i = 0;; i++) {
        now = exchange.milliseconds ()
        let candle = Object.values (ohlcvs)[0]
        console.log ('')
        console.log (exchange.iso8601 (now), '------------------------------------------------------')
        console.log ('Datetime                ', 'Timestamp    ', ... [ 'Open', 'High', 'Low', 'Close', market['base'], market['quote'] ].map (x => x.toString ().padEnd (10, ' ')))
        for (let j = start; j < now; j += duration) {
            if (!(j in ohlcvs)) {
                ohlcvs[j] = [ j, candle[4], candle[4], candle[4], candle[4], 0, 0 ]
            }
            candle = exchange.safeValue (ohlcvs, j);
            console.log (exchange.iso8601 (j), ... candle.map (x => x.toString ().padEnd (10, ' ')))
        }
        ohlcvs = exchange.indexBy (Object.values (ohlcvs).slice (-1000), 0)
        await exchange.sleep(1000)
    }
}

async function watch (exchange, symbol, timeframe) {
    console.log ('Starting', exchange.id, symbol)
    const duration = exchange.parseTimeframe (timeframe) * 1000
    while (true) {
        try {
            const trades = await exchange.watchTrades(symbol)
            for (const trade of trades) {
                const timestamp = parseInt(trade['timestamp'] / duration) * duration
                let candle = exchange.safe_value(ohlcvs, timestamp)
                if (candle) {
                    candle[2] = Math.max(trade['price'], candle[2])
                    candle[3] = Math.min(trade['price'], candle[3])
                    candle[4] = trade['price']
                    candle[5] = exchange.parseNumber(exchange.amountToPrecision(symbol, trade['amount'] + candle[5]))
                    candle[6] = exchange.parseNumber(exchange.costToPrecision(symbol, trade['cost'] + candle[6]))
                } else {
                    candle = [
                        timestamp,
                        trade['price'],
                        trade['price'],
                        trade['price'],
                        trade['price'],
                        exchange.parseNumber(exchange.amountToPrecision(symbol, trade['amount'])),
                        exchange.parseNumber(exchange.costToPrecision(symbol, trade['cost'])),
                    ]
                }
                ohlcvs[timestamp] = candle
            }
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
    }
}

async function main() {
    const symbol = 'BTC/USDT'
     const exchange = new ccxt.pro.binance ({ 'newUpdates': true })
    await exchange.loadMarkets ()
    const timeframe = '1m'
    await Promise.all ([ watch (exchange, symbol, timeframe), log (exchange, symbol, timeframe) ])
    await exchange.close ()
}

main()
