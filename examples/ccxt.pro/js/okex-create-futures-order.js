'use strict';

const ccxtpro = require ('ccxt.pro')
    , exchange = new ccxtpro.okex ({
        apiKey: 'YOUR_API_KEY',
        secret: 'YOUR_API_SECRET',
        password: 'YOUR_API_PASSWORD',
        enableRateLimit: true,
        options: { defaultType: 'futures' },
    })
    , symbol = 'BTC-USD-201225'
    , amount = 1 // how may contracts
    , price = undefined // or your limit price
    , side = 'buy' // or 'sell'
    , type = '1' // 1 open long, 2 open short, 3 close long, 4 close short for futures
    , order_type = '4' // 0 = limit order, 4 = market order

console.log ('CCXT Pro Version: ', ccxtpro.version)

async function main () {

    try {

        await exchange.loadMarkets ()

        // exchange.verbose = true // uncomment for debugging
        // open long market price order
        const order = await exchange.createOrder(symbol, 'market', side, amount, price, { type });
        // --------------------------------------------------------------------
        // open long market price order
        // const order = await exchange.createOrder(symbol, type, side, amount, price, { order_type });
        // --------------------------------------------------------------------
        // close short market price order
        // const order = await exchange.createOrder(symbol, 'market', side, amount, price, { type, order_type });
        // --------------------------------------------------------------------
        // close short market price order
        // const order = await exchange.createOrder(symbol, '4', side, amount, price, { order_type });
        // ...

        console.log (order)

    } catch (e) {

        console.log (e.constructor.name, e.message)
    }
}

main ()
