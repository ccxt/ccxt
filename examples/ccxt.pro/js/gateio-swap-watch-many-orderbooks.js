'use strict';

const ccxt = require ('ccxt')

console.log ("CCXT Pro Version:", ccxt.version)

async function loop (exchange, method, symbol) {
    while (true) {
        try {
            const orderbook = await exchange[method] (symbol)
            console.log (exchange.iso8601 (exchange.milliseconds ()), orderbook['datetime'], orderbook['nonce'], symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
    }
}

async function main () {
     const exchange = new ccxt.pro.gateio ({
        'options': {'defaultType':'swap'}
    })
    await exchange.loadMarkets ()
    // exchange.verbose = true // uncomment for debugging purposes if necessary
    const symbols = [
        'ANC/USDT:USDT',
    ]
    await Promise.all (symbols.map (symbol => loop (exchange, 'fetchOrderBook', symbol)))
}

main ()