'use strict';

const ccxtpro = require ('./ccxt.pro.js')
    , WebSocket = require ('ws')
    , {
        ExternallyResolvablePromise,
        externallyResolvablePromise
    } = require ('./js/base/MultiPromise')

// ----------------------------------------------------------------------------

;(async () => {

    // const wss = new WebSocket.Server ({ port: 8080 })

    // wss.on ('connection', function connection (ws) {

    //     ws.on ('message', function incoming (message) {
    //         console.log ('server received message', message)
    //     })

    //     ws.on ('ping', function incoming (message) {
    //         console.log ('server received ping', message)
    //     })

    //     ws.on ('pong', function incoming (message) {
    //         console.log ('server received pong', message)
    //     })

    //     ws.send ('something')
    //     ws.ping ()

    //     // ws.terminate ()
    // })

    // wss.on ('error', function onError (error) {
    //     console.log ('server error', error)
    //     process.exit ()
    // })

    const symbol = 'ETH/BTC'

    const exchange = new ccxtpro.poloniex ({
        'enableRateLimit': true,
    })

    const ob = exchange.fetchWsOrderBook (symbol)
    const td = exchange.fetchWsTrades (symbol)
    const hb = exchange.fetchWsHeartbeat (symbol)

    await Promise.all ([
        (async () => {
            try {
                await hb
            } catch (e) {
                console.log ('hb failure', e)
            }
        }) (),
        (async () => {
            try {
                await ob
            } catch (e) {
                console.log ('ob failure', e)
            }
        }) (),
        (async () => {
            try {
                await td
            } catch (e) {
                console.log ('td failure', e)
            }
        }) (),
    ]).catch ((e) => {
        console.log ('----------------', e)
    })

    // console.log ('are we connecting?')

    try {
        const o = await ob
        console.log (o)
    } catch (e) {
        console.log ('ob failure', e)
    }
    try {
        const t = await td
        console.log (t)
    } catch (e) {
        console.log ('td failure', e)
    }
    try {
        const h = await hb
        console.log (h)
    } catch (e) {
        console.log ('hb failure', e)
    }

    console.log ('ok??')

    // delete exchange

    /*

    // console.log (exchange.sum (undefined, 2));
    // process.exit ();

    // for (let i = 0; i < 2; i++) {
    while (true) {

        let response = undefined;
        for (let i = 0; i < 10; i++) {
            try {
                console.log (i)
                response = await exchange.fetchWsOrderBook (symbol)
                // ; console.log ('---------------------------------------')
                // process.exit ();
            } catch (e) {
                console.log (new Date (), e)
            }
        }

        if (!response) {
            process.exit ()
        }

        console.log (new Date (), response.asks.length, 'asks', response.asks[0], response.bids.length, 'bids', response.bids[0])
    }
    */

    // process.exit ();

    /*

    const symbol = 'ETH/BTC'

    const kraken = new ccxtpro.kraken ({
        'enableRateLimit': true,
    })

    while (true) {
        try {
            const response = await kraken.fetchWsOHLCV (symbol)
            console.log (new Date (), response)
        } catch (e) {
            console.log ('ERROR', e)
        }
    }

    process.exit ();

    try {
        let response = await kraken.fetchWsOrderBook (symbol)
        console.log (new Date (), response.asks.length, 'asks', response.asks[0], response.bids.length, 'bids', response.bids[0])
    } catch (e) {
        console.log ('ERROR', e)
    }

    process.exit ();

    // for (let i = 0; i < 2; i++) {
    while (true) {

        try {
            let response = await kraken.fetchWsOrderBook (symbol)
            console.log (new Date (), response.asks.length, 'asks', response.asks[0], response.bids.length, 'bids', response.bids[0])
        } catch (e) {
            console.log ('ERROR', e)
        }
    }

    // for (let i = 0; i < 2; i++) {
        while (true) {

            try {
                let response = await kraken.fetchWsTicker (symbol)
                console.log (new Date (), response)
            } catch (e) {
                console.log ('ERROR', e)
            }
        }

    process.exit ();

    while (true) {
        let response = await kraken.fetchWsOrderBook (symbol)
        console.log (new Date (), response.asks.length, 'asks', response.asks[0], response.bids.length, 'bids', response.bids[0])
    }

    process.exit ()

    const exchange = new ccxtpro.poloniex ({
        'enableRateLimit': true,
        // 'verbose': true,
        "apiKey": "DQBV78EH-V5P2POGG-WQVAGGDJ-QWCQ5ZV9",
        "secret": "81be57971d2dad74676cef6b223b042d3e2fa6d436cf6b246756be731216e93e7d0a16540201b89f96bb73f8defcdf8e6b35af8dfa17cfa0de8480e525af85c1"
    })

    // while (true) {
    //     const response = await exchange.fetchWsHeartbeat ()
    //     console.log (new Date (), response);
    // }

    console.log (await exchange.fetchWsBalance ());

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

    //*/
}) ()