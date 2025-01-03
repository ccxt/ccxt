'use strict';

const ccxt = require ('ccxt')

console.log ("CCXT Pro Version:", ccxt.version)

const orderbooks = {}

async function watchAllSymbols (exchange, symbols) {
    while (true) {
        const keys = Object.keys (orderbooks);
        if (symbols.length === keys.length) {
            console.log ('\n\n\n\n\n')
            console.log ('----------------------------------------------------')
            console.log ('All orderbooks received at least one update:');
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i]
                const orderbook = orderbooks[symbol]
                console.log (exchange.iso8601 (exchange.milliseconds ()), orderbook['datetime'], orderbook['nonce'], symbol, orderbook['asks'][0], orderbook['bids'][0])
            }
            console.log ('----------------------------------------------------')
            console.log ('\n\n\n\n\n')
            // process.exit () // stop here if you want
            break
        } else {
            await exchange.sleep (1000);
        }
    }
}

async function watchOrderBook (exchange, symbol) {
    while (true) {
        try {
            const orderbook = await exchange.watchOrderBook (symbol)
            orderbooks[symbol] = orderbook
            console.log (exchange.iso8601 (exchange.milliseconds ()), orderbook['datetime'], orderbook['nonce'], symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
    }
}

async function main () {
     const exchange = new ccxt.pro.gateio ({
        'options': {
            'defaultType': 'swap',
        },
    })
    await exchange.loadMarkets ()
    // exchange.verbose = true // uncomment for debugging purposes if necessary
    const symbols = [
        // 'SOS/USDT:USDT',
        // 'JASMY/USDT:USDT',
        // 'SLP/USDT:USDT',
        'ACH/USDT:USDT',
        'MKISHU/USDT:USDT',
        // 'GMT/USDT:USDT',
        // 'ASTR/USDT:USDT',
        'RAMP/USDT:USDT',
        'RSR/USDT:USDT',
        // 'RACA/USDT:USDT',
        // 'ROOK/USDT:USDT',
        // 'ROSE/USDT:USDT',
    ]
    await Promise.all ([
        watchAllSymbols (exchange, symbols),
        ... symbols.map (symbol => watchOrderBook (exchange, symbol))
    ])
}

main ()