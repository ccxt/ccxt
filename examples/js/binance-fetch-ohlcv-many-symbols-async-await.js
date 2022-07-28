'use strict';

const ccxt = require ('../../ccxt.js')

console.log('CCXT Version:', ccxt.version)

async function symbolLoop (exchange, symbol, timeframe) {
    while (true) {
        try {
            const ohlcvs = await exchange.fetchOHLCV (symbol, timeframe)
            console.log (exchange.iso8601 (exchange.milliseconds ()), exchange.id, symbol, ohlcvs.length, 'OHLCV candles received')
            // await exchange.sleep (60 * 1000) // sleep if necessary, though not required
        } catch (e) {
            console.log (exchange.iso8601 (exchange.milliseconds ()), exchange.id, symbol, e.constructor.name, e.message)
        }
    }
}

async function main () {
    const exchange = new ccxt.binance ()
    await exchange.loadMarkets ()
    // exchange.verbose = true // uncomment for debugging purposes if necessary
    const symbols = [
        'BTC/USDT', // unified symbols used here as opposed to exchange-specific market ids
        'ETH/USDT', // more about unified symbols vs exchange-specific ids here:
        'ADA/USDT', // https://docs.ccxt.com/en/latest/manual.html#markets
    ]
    const timeframe = '1m'
    const loops = symbols.map (symbol => symbolLoop (exchange, symbol, timeframe))
    await Promise.all (loops)
}


main ()