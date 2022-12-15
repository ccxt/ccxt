'use strict';

const ccxt = require ('../../ccxt.js')

console.log('CCXT Version:', ccxt.version)

function symbolLoop (exchange, symbol, timeframe) {
    exchange.fetchOHLCV (symbol, timeframe).then (ohlcvs => {
        console.log (exchange.iso8601 (exchange.milliseconds ()), exchange.id, symbol, ohlcvs.length, 'OHLCV candles received')
        setTimeout (() => symbolLoop (exchange, symbol, timeframe), 0)
    }).catch (e => {
        console.log (exchange.iso8601 (exchange.milliseconds ()), exchange.id, symbol, e.constructor.name, e.message)
        setTimeout (() => symbolLoop (exchange, symbol, timeframe), 0)
    })
}

function main () {
    const exchange = new ccxt.binance ()
    // exchange.verbose = true // uncomment for debugging purposes if necessary
    const symbols = [
        'BTC/USDT', // unified symbols used here as opposed to exchange-specific market ids
        'ETH/USDT', // more about unified symbols vs exchange-specific ids here:
        'ADA/USDT', // https://docs.ccxt.com/en/latest/manual.html#markets
    ]
    const timeframe = '1m'
    exchange.loadMarkets ().then (markets => {
        for (const symbol of symbols) {
            setTimeout (() => symbolLoop (exchange, symbol, timeframe), 0)
        }
    })
}

main ()