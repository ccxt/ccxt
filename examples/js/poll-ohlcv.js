"use strict";

const ccxt = require ('../../ccxt.js')

const ohlcvsBySymbol = {}

function handleAllOHLCVs (exchange, ohlcvs, symbol, timeframe) {
    console.log ('----------------------------------------------------------')
    console.log ('Last updated:', exchange.iso8601 (exchange.milliseconds ()))
    const symbols = Object.keys (ohlcvsBySymbol)
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i]
        const ohlcvs = ohlcvsBySymbol[symbol]
        const lastCandle = exchange.safeValue (ohlcvs, ohlcvs.length - 1)
        const lastTimestamp = lastCandle[0]
        console.log (exchange.iso8601 (lastTimestamp), symbol, timeframe, lastCandle.slice (1))
    }
}

async function pollOHLCV (exchange, symbol, timeframe) {
    while (true) {
        try {
            const response = await exchange.fetchOHLCV (symbol, timeframe)
            ohlcvsBySymbol[symbol] = response
            handleAllOHLCVs(exchange, response, symbol, timeframe)
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
    }
}

async function main () {

    const exchange = new ccxt.binance()
    const markets = await exchange.loadMarkets ()
    const timeframe = '5m'

    const firstOneHundredSymbols = exchange.symbols.slice (0, 100)

    await Promise.all (firstOneHundredSymbols.map (symbol => pollOHLCV (exchange, symbol, timeframe)))
}

main ()