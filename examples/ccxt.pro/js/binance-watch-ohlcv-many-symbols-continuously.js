"use strict";

const ccxtpro = require ('ccxt.pro')

const ohlcvsBySymbol = {}

function handleAllOHLCVs (exchange, ohlcvs, symbol, timeframe) {
    const now = exchange.iso8601 (exchange.milliseconds ())
    const lastCandle = exchange.safeValue (ohlcvs, ohlcvs.length - 1)
    const datetime = exchange.iso8601 (lastCandle[0])
    console.log (now, datetime, symbol, timeframe, lastCandle.slice (1))
}

async function pollOHLCV (exchange, symbol, timeframe) {
    await exchange.throttle (1000) // 1000ms delay between subscriptions
    while (true) {
        try {
            const response = await exchange.watchOHLCV (symbol, timeframe)
            ohlcvsBySymbol[symbol] = response
            handleAllOHLCVs(exchange, response, symbol, timeframe)
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
    }
}

async function main () {

    const exchange = new ccxtpro.binance()
    const markets = await exchange.loadMarkets ()
    const timeframe = '5m'

    const firstOneHundredSymbols = exchange.symbols.slice (0, 100)

    await Promise.all (firstOneHundredSymbols.map (symbol => pollOHLCV (exchange, symbol, timeframe)))
}

main ()