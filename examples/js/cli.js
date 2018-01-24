"use strict";

//-----------------------------------------------------------------------------

const [processPath, , exchangeId, methodName, ... params] = process.argv.filter (x => !x.startsWith ('--'))
const verbose = process.argv.includes ('--verbose')

//-----------------------------------------------------------------------------

const ccxt      = require ('../../ccxt.js')
    , fs        = require ('fs')
    , path      = require ('path')
    , asTable   = require ('as-table')
    , util      = require ('util')
    , log       = require ('ololog').configure ({ locate: false })
    , { ExchangeError, NetworkError } = ccxt

//-----------------------------------------------------------------------------

require ('ansicolor').nice

//-----------------------------------------------------------------------------

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

//-----------------------------------------------------------------------------

const timeout = 30000
const exchange = new (ccxt)[exchangeId] ({ verbose, timeout })

//-----------------------------------------------------------------------------

// set up keys and settings, if any
const keysGlobal = path.resolve ('keys.json')
const keysLocal = path.resolve ('keys.local.json')

let globalKeysFile = fs.existsSync (keysGlobal) ? keysGlobal : false
let localKeysFile = fs.existsSync (keysLocal) ? keysLocal : globalKeysFile
let settings = localKeysFile ? (require (localKeysFile)[exchangeId] || {}) : {}

Object.assign (exchange, settings)

//-----------------------------------------------------------------------------

let printSupportedExchanges = function () {
    log ('Supported exchanges:', ccxt.exchanges.join (', ').green)
}

//-----------------------------------------------------------------------------

 function printUsage () {
    log ('This is an example of a basic command-line interface to all exchanges')
    log ('Usage: node', process.argv[1], 'id'.green, 'method'.yellow, '"param1" param2 "param3" param4 ...'.blue)
    log ('Examples:')
    log ('node', process.argv[1], 'okcoinusd fetchOHLCV BTC/USD 15m')
    log ('node', process.argv[1], 'bitfinex fetchBalance')
    log ('node', process.argv[1], 'kraken fetchOrderBook ETH/BTC')
    printSupportedExchanges ()
}

//-----------------------------------------------------------------------------

async function main () {

    const requirements = exchangeId && methodName
    if (!requirements) {

        printUsage ()

    } else {

        let args = params.map (param => {
            if (param[0] === '{')
                return JSON.parse (param)
            return param.match (/[a-zA-Z]/g) ? param : parseFloat (param)
        })

        if (typeof exchange[methodName] == 'function') {
            try {

                log (exchange.id + '.' + methodName, '(' + args.join (', ') + ')')

                const result = await exchange[methodName] (... args)

                if (Array.isArray (result)) {

                    result.forEach (object => {
                        log ('-------------------------------------------')
                        log (object)
                    })

                    log (asTable (result))

                } else {

                    log (result)
                }


            } catch (e) {

                if (e instanceof ExchangeError) {

                    log.red (e.constructor.name, e.message)

                } else if (e instanceof NetworkError) {

                    log.yellow (e.constructor.name, e.message)

                }

                log.dim ('---------------------------------------------------')

                // rethrow for call-stack // other errors
                throw e

            }
        } else {
            log (exchange[methodName])
        }

    }
}

//-----------------------------------------------------------------------------

main ()
