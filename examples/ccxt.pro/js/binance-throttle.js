"use strict";

const ccxt = require ('../../../ccxt');


const ohlcvsBySymbol = {}

function handleAllOHLCVs (exchange, ohlcvs, symbol, timeframe) {
    const now = exchange.iso8601 (exchange.milliseconds ())
    const lastCandle = exchange.safeValue (ohlcvs, ohlcvs.length - 1)
    const datetime = exchange.iso8601 (lastCandle[0])
    console.log (now, datetime, symbol, timeframe, lastCandle.slice (1))
}

async function pollOHLCV (exchange, symbol, timeframe) {
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
    const exchange = new ccxt.pro.binance({
        'enableRateLimit': true,
        'options': {
            'ws': {
                'rateLimits':{
                    'default': {
                        'cost': 5,
                        'maxCapacity': 10000,
                    }
                }
            }
        }
    })
    await exchange.loadMarkets ()
    // exchange.verbose = true uncomment to debug
    const timeframe = '1m'

    const symbols = exchange.symbols

    console.log ('connecting to ', symbols.length, ' symbol')

    await Promise.all (symbols.map (symbol => pollOHLCV (exchange, symbol, timeframe)))
}

main ()
