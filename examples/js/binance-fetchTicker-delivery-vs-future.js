"use strict";

const ccxt = require ('../../ccxt.js')

async function fetchTickers (exchange) {
    try {
        await exchange.loadMarkets ()
        return await exchange.fetchTickers ()
    } catch (e) {
        console.error (e.constructor.name, e.message)
        return undefined
    }
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