"use strict";

//-----------------------------------------------------------------------------

let [processPath, , exchangeId, methodName, ... params] = process.argv.filter (x => !x.startsWith ('--'))
    , verbose = process.argv.includes ('--verbose')
    , debug = process.argv.includes ('--debug')
    , no_poll = process.argv.includes ('--no-poll')
    , no_send = process.argv.includes ('--no-send')
    , no_load_markets = process.argv.includes ('--no-load-markets')
    , details = process.argv.includes ('--details')
    , no_table = process.argv.includes ('--no-table')
    , table = process.argv.includes ('--table')
    , iso8601 = process.argv.includes ('--iso8601')
    , cors = process.argv.includes ('--cors')
    , signIn = process.argv.includes ('--sign-in') || process.argv.includes ('--signIn')

//-----------------------------------------------------------------------------

const ccxtpro      = require ('../../ccxt.pro.js')
    , fs           = require ('fs')
    , path         = require ('path')
    , ansi         = require ('ansicolor').nice
    , log          = require ('ololog').configure ({ locate: false }).unlimited.handleNodeErrors ()
    , asTable      = require ('as-table').configure ({
        delimiter: ' | '.lightGray.dim,
        right: true,
        title: x => String (x).lightGray,
        dash: '-'.lightGray.dim,
        print: x => {
            if (typeof x === 'object') {
                const j = JSON.stringify (x).trim ()
                if (j.length < 100) return j
            }
            return String (x)
        }
    })
    , { ExchangeError, NetworkError } = ccxtpro

//-----------------------------------------------------------------------------

// set up keys and settings, if any
const keysGlobal = path.resolve ('keys.json')
const keysLocal = path.resolve ('keys.local.json')

let globalKeysFile = fs.existsSync (keysGlobal) ? keysGlobal : false
let localKeysFile = fs.existsSync (keysLocal) ? keysLocal : globalKeysFile
let settings = localKeysFile ? (require (localKeysFile)[exchangeId] || {}) : {}

//-----------------------------------------------------------------------------

const timeout = 30000
let exchange = undefined
const enableRateLimit = true

try {

    const { Agent } = require ('https')

    const agent = new Agent ({
        ecdhCurve: 'auto',
    })

    exchange = new (ccxtpro)[exchangeId] ({
        timeout,
        enableRateLimit,
        agent,
        ... settings,
    })

} catch (e) {

    log.red (e)
    printUsage ()
    process.exit ()
}

//-----------------------------------------------------------------------------

function printSupportedExchanges () {
    log ('Supported exchanges:', ccxtpro.exchanges.join (', ').green)
}

//-----------------------------------------------------------------------------

 function printUsage () {
    log ('This is an example of a basic command-line interface to all exchanges')
    log ('Usage: node', process.argv[1], 'id'.green, 'method'.yellow, '"param1" param2 "param3" param4 ...'.blue)
    log ('Examples:')
    log ('node', process.argv[1], 'okcoin fetchOHLCV BTC/USD 15m')
    log ('node', process.argv[1], 'bitfinex fetchBalance')
    log ('node', process.argv[1], 'kraken fetchOrderBook ETH/BTC')
    printSupportedExchanges ()
    log ('Supported options:')
    log ('--verbose         Print verbose output')
    log ('--debug           Print debugging output')
    log ('--no-poll         Run once')
    log ("--no-send         Print the request but don't actually send it to the exchange (sets verbose and load-markets)")
    log ('--no-load-markets Do not pre-load markets (for debugging)')
    log ('--details         Print detailed fetch responses')
    log ('--no-table        Do not print the fetch response as a table')
    log ('--table           Print the fetch response as a table')
    log ('--iso8601         Print timestamps as ISO8601 datetimes')
    log ('--cors            Use CORS proxy for debugging')
    log ('--sign-in         Call signIn() if any')
}

//-----------------------------------------------------------------------------

const printHumanReadable = (exchange, result) => {

    if (Array.isArray (result) || table) {

        result = Object.values (result)
        let arrayOfObjects = (typeof result[0] === 'object')

        if (details)
            result.forEach (object => {
                if (arrayOfObjects)
                    log ('-------------------------------------------')
                log (object)
            })

        if (!no_table)
            if (arrayOfObjects || table) {
                log (result.length > 0 ? asTable (result.map (element => {
                    element = Object.assign ({}, element);
                    let keys = Object.keys (element)
                    delete element['info']
                    keys.forEach (key => {
                        if (typeof element[key] === 'number') {
                            if (!iso8601)
                                return element[key]
                            try {
                                const iso8601 = exchange.iso8601 (element[key])
                                if (iso8601.match (/^20[0-9]{2}[-]?/))
                                    element[key] = iso8601
                                else
                                    throw new Error ('wrong date')
                            } catch (e) {
                                return element[key]
                            }
                        }
                    })
                    return element
                })) : result)
                log (result.length, 'objects');
            } else {
                log (result)
                log (result.length, 'objects');
            }

    } else {

        log (result)
    }
}

const hideZeroBalances = function (balance) {
    const keys = Object.keys (balance['free'])
        .filter (k => (balance['free'][k] > 0) || (balance['used'][k] > 0) || (balance['total'][k] > 0))
    const result = {}
    for (const k of keys) {
        result[k] = balance[k]
    }
    return result
}

//-----------------------------------------------------------------------------

async function main () {

    const requirements = exchangeId && methodName
    if (!requirements) {

        printUsage ()

    } else {

        let args = params
            .map (s => s.match (/^[0-9]{4}[-]?[0-9]{2}[-]?[0-9]{2}[T\s]?[0-9]{2}[:]?[0-9]{2}[:]?[0-9]{2}/g) ? exchange.parse8601 (s) : s)
            .map (s => (() => { try { return eval ('(() => (' + s + ')) ()') } catch (e) { return s } }) ())

        const www = Array.isArray (exchange.urls.www) ? exchange.urls.www[0] : exchange.urls.www

        if (cors) {
            exchange.proxy =  'https://cors-anywhere.herokuapp.com/';
            exchange.origin = exchange.uuid ()
        }

        no_load_markets = no_send ? true : no_load_markets

        if (debug) {
            exchange.verbose = verbose
        }

        if (!no_load_markets) {
            await exchange.loadMarkets ()
        }

        if (signIn && exchange.has.signIn) {
            await exchange.signIn ()
        }

        exchange.verbose = verbose

        if (no_send) {

            exchange.verbose = no_send
            exchange.fetch = function fetch (url, method = 'GET', headers = undefined, body = undefined) {
                log.dim.noLocate ('-------------------------------------------')
                log.dim.noLocate (exchange.iso8601 (exchange.milliseconds ()))
                log.green.unlimited ({
                    url,
                    method,
                    headers,
                    body,
                })
                process.exit ()
            }
        }

        if (typeof exchange[methodName] === 'function') {

            log (exchange.id + '.' + methodName, '(' + args.join (', ') + ')')

            while (true) {

                try {

                    const result = await exchange[methodName] (... args)
                    printHumanReadable (exchange, result)

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

                if (no_poll)
                    break;
            }

            await exchange.close ()

        } else if (exchange[methodName] === undefined) {

            log.red (exchange.id + '.' + methodName + ': no such property')

        } else {

            printHumanReadable (exchange, exchange[methodName])
        }
    }
}

//-----------------------------------------------------------------------------

main ()
