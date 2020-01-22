'use strict';

const fs = require ('fs')
    , log = require ('ololog')
    // eslint-disable-next-line import/no-dynamic-require
    , ccxtpro = require (__dirname + '/../../ccxt.pro.js')

const [processPath, , exchangeId, exchangeSymbol] = process.argv.filter (x => !x.startsWith ('--'))
const verbose = process.argv.includes ('--verbose') || false

// ----------------------------------------------------------------------------

if (!exchangeId) {
    console.log ('Exchange id not specified')
    process.exit ()
}

log.bright ('\nTESTING', { exchange: exchangeId, symbol: exchangeSymbol || 'all' }, '\n')

// ----------------------------------------------------------------------------

const enableRateLimit = true

const { Agent } = require ('https')

const agent = new Agent ({
    ecdhCurve: 'auto',
})

const exchange = new (ccxtpro)[exchangeId] ({
    agent,
    verbose,
    enableRateLimit,
    timeout: 20000,
})

// ----------------------------------------------------------------------------

const tests = {}
const properties = Object.keys (exchange.has)
properties
    .filter (property => fs.existsSync (__dirname + '/Exchange/test.' + property + '.js'))
    .forEach (property => {
        // eslint-disable-next-line import/no-dynamic-require
        tests[property] = require (__dirname + '/Exchange/test.' + property + '.js')
    })

//-----------------------------------------------------------------------------

const keysGlobal = 'keys.json'
const keysLocal = 'keys.local.json'

let keysFile = fs.existsSync (keysLocal) ? keysLocal : keysGlobal
// eslint-disable-next-line import/no-dynamic-require
let settings = require (__dirname + '/../../' + keysFile)[exchangeId]

if (settings) {
    const keys = Object.keys (settings)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (settings[key]) {
            settings[key] = ccxtpro.deepExtend (exchange[key] || {}, settings[key])
        }
    }
}

Object.assign (exchange, settings)

if (settings && settings.skip) {
    log.error.bright ('[Skipped]', { exchange: exchangeId, symbol: exchangeSymbol || 'all' })
    process.exit ()
}

(async () => {

    const hideZeroBalances = function (balance) {
        const keys = Object.keys (balance['free'])
            .filter (k => (balance['free'][k] > 0) || (balance['used'][k] > 0) || (balance['total'][k] > 0))
        const result = {}
        for (const k of keys) {
            result[k] = balance[k]
        }
        return result
    }

    const symbol = 'ETH/BTC'
        , n = 1 // output every nth snapshot
        , delay = 5000
        , forever = true

    while (forever) {
        try {
            //*
            let response = undefined
            for (let i = 0; i < n; i++) {
                // response = await exchange.watchBalance ()
                // console.table (hideZeroBalances (response))
                // process.exit ()
                response = await exchange.watchOrderBook (symbol)
            }
            console.log (new Date (), symbol,
                response['asks'].length, 'asks', response['asks'][0],
                response['bids'].length, 'bids', response['bids'][0],
            )
            //*/
            /*
            const response = await exchange.watchBalance ()
            */
        } catch (e) {
            console.log (new Date (), e)
            await ccxtpro.sleep (delay)
        }
    }

}) ()

// ========================================================================
// a sandbox ws server for testing
/*
const http = require('http')

const server = http.createServer ()
const wss = new WebSocket.Server ({ noServer: true })

wss.on ('connection', function connection(ws, request) {
    ws.on ('message', function incoming (message) {
        console.log ('server received message', message)
    })
    ws.on ('ping', function incoming (message) {
        console.log ('server received ping', message)
    })
    ws.on ('pong', function incoming (message) {
        console.log ('server received pong', message)
    })
    // setTimeout (() => { ws.close (1000) }, 10000) // for debugging
    // ws.send ('something')
    // ws.ping ()
    // ws.terminate ()
})

server.on ('upgrade', function upgrade (request, socket, head) {
    const delay = 60000 // for debugging
    setTimeout (() => {
        wss.handleUpgrade (request, socket, head, function done (ws) {
            wss.emit ('connection', ws, request)
        })
    }, delay)
})

server.listen (8080)
//*/

// ========================================================================
// a sandbox ws server for testing v1

// const wss = new WebSocket.Server ({ port: 8080 })
// wss.on('upgrade', function upgrade(request, socket, head) {
//     console.log ('sever received an upgrade message')
//     process.exit ()
// });
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
//     setTimeout (() => {
//         ws.close (1000)
//     }, 10000)
//     // ws.send ('something')
//     // ws.ping ()
//     // ws.terminate ()
// })
// wss.on ('error', function onError (error) {
//     console.log ('server error', error)
//     process.exit ()
// })

// ========================================================================
// all sorts of testing and debugging snippets and junk

// const ob = exchange.watchOrderBook (symbol)
// const td = exchange.watchTrades (symbol)
// const hb = exchange.watchHeartbeat (symbol)

// await Promise.all ([
//     (async () => {
//         try {
//             await hb
//             console.log (hb)
//         } catch (e) {
//             console.log ('1: hb failure', e.constructor.name, e.message)
//         }
//     }) (),
//     (async () => {
//         try {
//             await ob
//             console.log (ob)
//         } catch (e) {
//             console.log ('1: ob failure', e.constructor.name, e.message)
//         }
//     }) (),
//     (async () => {
//         try {
//             await td
//             console.log (td)
//         } catch (e) {
//             console.log ('1: td failure', e.constructor.name, e.message)
//         }
//     }) (),
// ]).catch ((e) => {
//     console.log ('-------------------------------------------', e)
// })

// console.log ("\n\n\n\n\n\n")

// await ccxtpro.sleep (20000);

// try {
//     const o = await ob
//     console.log (o)
// } catch (e) {
//     console.log ('2: ob failure', e.constructor.name, e)
// }
// try {
//     const t = await td
//     console.log (t)
// } catch (e) {
//     console.log ('2: td failure', e.constructor.name, e)
// }
// try {
//     const h = await hb
//     console.log (h)
// } catch (e) {
//     console.log ('2: hb failure', e.constructor.name, e)
// }

// console.log ('no mistakes??')

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
            response = await exchange.watchOrderBook (symbol)
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
        const response = await kraken.watchOHLCV (symbol)
        console.log (new Date (), response)
    } catch (e) {
        console.log ('ERROR', e)
    }
}

process.exit ();

try {
    let response = await kraken.watchOrderBook (symbol)
    console.log (new Date (), response.asks.length, 'asks', response.asks[0], response.bids.length, 'bids', response.bids[0])
} catch (e) {
    console.log ('ERROR', e)
}

process.exit ();

// for (let i = 0; i < 2; i++) {
while (true) {

    try {
        let response = await kraken.watchOrderBook (symbol)
        console.log (new Date (), response.asks.length, 'asks', response.asks[0], response.bids.length, 'bids', response.bids[0])
    } catch (e) {
        console.log ('ERROR', e)
    }
}

// for (let i = 0; i < 2; i++) {
    while (true) {

        try {
            let response = await kraken.watchTicker (symbol)
            console.log (new Date (), response)
        } catch (e) {
            console.log ('ERROR', e)
        }
    }

process.exit ();

while (true) {
    let response = await kraken.watchOrderBook (symbol)
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
//     const response = await exchange.watchHeartbeat ()
//     console.log (new Date (), response);
// }

console.log (await exchange.watchBalance ());

Promise.all ([
    (async () => {
        while (true) {
            let response = undefined
            for (let i = 0; i < 10; i++) {
                response = await exchange.watchOrderBook (symbol)
            }
            console.log (new Date (), response.asks.length, 'asks', response.asks[0], response.bids.length, 'bids', response.bids[0])
        }
    }) (),
    (async () => {
        while (true) {
            let response = await exchange.watchTrades (symbol)
            console.log (new Date (), response)
        }
    }) (),
    (async () => {
        while (true) {
            const response = await exchange.watchHeartbeat ()
            console.log (new Date (), response);
        }
    }) (),
])

// process.exit ();
// for (let i = 0; i < 2; i++) {
//     const response = await exchange.watchTrades ('ETH/BTC');
//     console.log (new Date (), response);
//     process.exit ();
//     // const orderbook = await exchange.watchOrderBook ('ETH/BTC')
//     // console.log (new Date (), orderbook.limit (5))
//     // await exchange.sleep (5000)
//     // process.exit ()
// }

// try {
//     const exchange = new ccxtpro.poloniex ()
//     const x = await exchange.ws.connected.value

//     const ws = new WebSocketClient ('wss://api2.poloniex.com/')
//     // const ws = await exchange.watchOrderBook ('ETH/BTC')
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