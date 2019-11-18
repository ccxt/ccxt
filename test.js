'use strict';

const ccxtpro = require ('./ccxt.pro.js')

;(async () => {

    const kraken = new ccxtpro.kraken ({
    })

    console.log (await kraken.fetchWsOrderBook ('ETH/BTC'))
    process.exit ()

    const exchange = new ccxtpro.poloniex ({
        // 'verbose': true,
        "apiKey": "DQBV78EH-V5P2POGG-WQVAGGDJ-QWCQ5ZV9",
        "secret": "81be57971d2dad74676cef6b223b042d3e2fa6d436cf6b246756be731216e93e7d0a16540201b89f96bb73f8defcdf8e6b35af8dfa17cfa0de8480e525af85c1"
    })

    // while (true) {
    //     const response = await exchange.fetchWsHeartbeat ()
    //     console.log (new Date (), response);
    // }

    console.log (await exchange.fetchWsBalance ());

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
                console.log (new Date (), response);
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