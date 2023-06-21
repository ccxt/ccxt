'use strict';

const ccxt = require ('../../../ccxt')

console.log ("CCXT Pro Version:", ccxt.version)

const orderbooks = {}

let run = true

async function watchOrderBook (exchange, symbol) {
    while (run) {
        try {
            const orderbook = await exchange.watchOrderBook (symbol)
            orderbooks[symbol] = orderbook
            console.log (exchange.iso8601 (exchange.milliseconds ()), orderbook['datetime'], orderbook['nonce'], symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
    }
}


async function stop (exchange) {
    await exchange.sleep (10000)
    run = false
    await exchange.close ()
}


async function main () {
     const exchange = new ccxt.pro.binance ()
    await exchange.loadMarkets ()
    exchange.verbose = true
    const symbols = [
        'BTC/USDT',
        'ETH/USDT',
    ]
    stop (exchange).then (() => {})
    await Promise.all (symbols.map (symbol => watchOrderBook (exchange, symbol)))
    console.log ('Sleeping for a moment...')
    await exchange.sleep (10000)
    console.log ('Done')
}

main ()