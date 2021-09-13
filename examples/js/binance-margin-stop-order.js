"use strict";

const ccxt = require ('../../ccxt.js')

console.log ('CCXT Version:', ccxt.version)

async function main () {

    const exchange = new ccxt.binance({
            'apiKey': 'YOUR_API_KEY',
            'secret': 'YOUR_SECRET',
            'options': {
                'defaultType': 'margin',
            },
        })

        , markets = await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging purposes if necessary

        , symbol = 'BTC/USDT'
        , type = 'limit'
        , side = 'buy'
        , amount = YOUR_AMOUNT_HERE
        , price = YOUR_LIMIT_PRICE_HERE
        , params = {
            'stopPrice': YOUR_STOP_PRICE_HERE,
        }

        try {
            const order = await exchange.createOrder (symbol, type, side, amount, price, params)
            console.log (order)
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
}

main ()
