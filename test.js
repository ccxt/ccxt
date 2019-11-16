'use strict';

const ccxtpro = require ('./ccxt.pro.js')

;(async () => {

    const exchange = new ccxtpro.poloniex ()
    for (let i = 0; i < 2; i++) {
        const orderbook = await exchange.fetchWsOrderBook ('ETH/BTC', 4)
        console.log (new Date (), orderbook)
        await exchange.sleep (5000)
        process.exit ()
    }

    // try {
    //     const exchange = new ccxtpro.poloniex ()
    //     const x = await exchange.ws.connected.value

    //     const ws = new WebSocketClient ('wss://api2.poloniex.com/')
    //     // const ws = await exchange.fetchWsOrderBook ('ETH/BTC')
    //     // const ws = new ReconnectingWebSocket ('wss://api3.poloniex.com/')
    //     // const ws = new ReconnectingWebSocket ('wss://kroitor.com/')
    //     // const x = await ws.connectPromise.value
    //     console.log (new Date (), 'connectPromise resolved')
    //     process.exit ()
    // } catch (e) {
    //     console.log (new Date (), 'connectPromise rejected', e)
    //     console.log ('----------------------------------')
    //     await sleep (5000)
    //     process.exit ()
    // }
}) ()