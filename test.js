'use strict';

const ccxtpro = require ('./ccxt.pro.js')

;(async () => {

    const exchange = new ccxtpro.poloniex ()
    // while (true) {
    //     const response = await exchange.fetchWsHeartbeat ()
    //     console.log (new Date (), response);
    // }

    const symbol = 'ETH/BTC'

    Promise.all ([
        (async () => {
            while (true) {
                let response = undefined
                for (let i = 0; i < 10; i++) {
                    response = await exchange.fetchWsOrderBook (symbol)
                }
                console.log (new Date (), response.asks.length, 'asks', response.asks[0], response.bids.length, 'bids', response.bids[0])
            }
        }) (),
        (async () => {
            const symbol = 'ETH/BTC'
            while (true) {
                let response = await exchange.fetchWsTrades (symbol)
                console.log (new Date (), response)
            }
        }) (),
        (async () => {
            while (true) {
                const response = await exchange.fetchWsHeartbeat ()
                // console.log (new Date (), response);
            }
        }) (),
    ])

    // process.exit ();
    // for (let i = 0; i < 2; i++) {
    //     const response = await exchange.fetchWsTrades ('ETH/BTC');
    //     console.log (new Date (), response);
    //     process.exit ();
    //     // const orderbook = await exchange.fetchWsOrderBook ('ETH/BTC')
    //     // console.log (new Date (), orderbook.limit (5))
    //     // await exchange.sleep (5000)
    //     // process.exit ()
    // }

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