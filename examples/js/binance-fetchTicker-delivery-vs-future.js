"use strict";

const ccxt = require ('../../ccxt.js')

async function fetchTickers (exchange) {
    let tickers = undefined
    try {
        // await exchange.loadMarkets () // optional
        tickers = await exchange.fetchTickers ()
    } catch (e) {
        console.error (e.constructor.name, e.message)
    }
    return tickers
}

;(async () => {

    const enableRateLimit = true
    const future   = new ccxt.binance ({ enableRateLimit, options: { defaultType: 'future' }})
    const delivery = new ccxt.binance ({ enableRateLimit, options: { defaultType: 'delivery' }})

    // ...

    const futureTickers = await fetchTickers (future);
    console.log (futureTickers)

    console.log ('-------------------------------------------')

    const deliveryTickers = await fetchTickers (delivery);
    console.log (deliveryTickers)

}) ()