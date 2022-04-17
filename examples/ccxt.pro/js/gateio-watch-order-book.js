'use strict';

const ccxtpro = require ('./ccxt.pro')

console.log ("CCXT Pro Version:", ccxtpro.version)

async function watchOrderBook (exchange, symbol) {
    while (true) {
        try {
            const orderbook = await exchange.watchOrderBook (symbol)
            console.log (exchange.iso8601 (exchange.milliseconds ()), symbol, orderbook['nonce'], orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
    }
}

async function main () {
    const exchange = new ccxtpro.gateio ({
        'options': {
            'defaultType': 'swap',
            'maxOrderBookSyncAttempts': 100,
        },
    })
    await exchange.loadMarkets ()
    // exchange.verbose = true
    const symbols = [
        'GMT/USDT:USDT',
        'ASTR/USDT:USDT',
        'RAMP/USDT:USDT',
        'RSR/USDT:USDT',
        'RACA/USDT:USDT',
        'ROOK/USDT:USDT',
        'ROSE/USDT:USDT',
    ]
    await Promise.all (symbols.map (symbol => watchOrderBook (exchange, symbol)))
}

main ()