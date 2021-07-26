"use strict";

const ccxt = require ('../../ccxt.js')


async function fetchOHLCVSince (exchange, symbol, timeframe, since) {
    let ohlcvs = []
    while (true) {
        try {
            const response = await exchange.fetchOHLCV (symbol, timeframe, since)
            if (response.length) {
                const firstCandle = exchange.safeValue (response, 0)
                const lastCandle = exchange.safeValue (response, response.length - 1)
                const firstTimestamp = exchange.safeInteger (firstCandle, 0)
                const lastTimestamp = exchange.safeInteger (lastCandle, 0)
                const firstDatetime = exchange.iso8601 (firstTimestamp)
                const lastDatetime = exchange.iso8601 (lastTimestamp)
                const currentDatetime = exchange.iso8601 (exchange.milliseconds ())
                since = lastTimestamp + 1
                ohlcvs = ohlcvs.concat (response)
                console.log (currentDatetime, symbol, timeframe, 'fetched', response.length, 'candles since', firstDatetime, 'till', lastDatetime, 'total', ohlcvs.length)
            } else {
                break
            }
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
    }
    return { symbol, ohlcvs }
}

async function main () {

    const exchange = new ccxt.binance()
    const markets = await exchange.loadMarkets ()
    const timeframe = '5m'

    const firstOneHundredSymbols = exchange.symbols.slice (0, 10)
    const now = exchange.milliseconds ()
    const oneWeek = 60 * 60 * 24 * 7 * 1000 // milliseconds
    const since = now - oneWeek
    const allCandles = await Promise.all (firstOneHundredSymbols.map (symbol => fetchOHLCVSince (exchange, symbol, timeframe, since)))
    const allCandlesBySymbol = exchange.indexBy (allCandles, 'symbol')

    console.log ('Fetched', Object.keys (allCandlesBySymbol))
    console.log ('Done')

}

main ()