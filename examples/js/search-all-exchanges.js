"use strict";

/*  ------------------------------------------------------------------------ */

const [processPath, , argument = null] = process.argv.filter (x => !x.startsWith ('--'))
const verbose = process.argv.includes ('--verbose') || false
const strict  = process.argv.includes ('--strict')  || false


/*  ------------------------------------------------------------------------ */

const asTable   = require ('as-table')
    , log       = require ('ololog')
    , path      = require ('path')
    , fs        = require ('fs')
    , ansi      = require ('ansicolor').nice
    , ccxt      = require ('../../ccxt.js')

/*  ------------------------------------------------------------------------ */

const warn = log.bright.yellow.error // .error → stderr

/*  ------------------------------------------------------------------------ */

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

/*  ------------------------------------------------------------------------ */

let printUsage = function () {
    log ('Non-strict search: node', process.argv[1], 'symbol'.green)
    log ('Non-strict search: node', process.argv[1], 'currency'.green)
    log ('    Strict search: node', process.argv[1], '--strict', 'argument'.green)
}

if (process.argv.length < 3) {
    printUsage ()
    process.exit ()
}

/*  ------------------------------------------------------------------------ */

const keysGlobal = path.resolve ('keys.json')
const keysLocal = path.resolve ('keys.local.json')
let globalKeysFile = fs.existsSync (keysGlobal) ? keysGlobal : false
let localKeysFile = fs.existsSync (keysLocal) ? keysLocal : globalKeysFile

const keys = require (localKeysFile)

/*  ------------------------------------------------------------------------ */

log ('\nLooking up for:', argument.bright, strict ? '(strict search)' : '(non-strict search)', '\n')

const checkAgainst = strict ?
    (a, b) => ((a == b.toLowerCase ()) || (a == b.toUpperCase ())) :
    (a, b) => a.toLowerCase ().includes (b.toLowerCase ())

;(async function test () {

    let exchanges = await Promise.all (ccxt.exchanges.map (async id => {

        // instantiate the exchange
        let exchange = new ccxt[id] (localKeysFile ? (keys[id] || {}) : {}) // set up keys and settings, if any

        if (exchange.has.publicAPI) {

            try {

                // load markets
                await exchange.loadMarkets ()
                return exchange

            } catch (e) {

                log.red (exchange.id, e.constructor.name)
                return undefined
            }
        }
    }))

    // filter out exchanges that failed to load
    exchanges = exchanges.filter (exchange => exchange)

    log ("\n---------------------------------------------------------------\n")

    log ("Markets And Symbols:\n")

    let markets = ccxt.flatten (exchanges
        .map (exchange =>
            Object.values (exchange.markets).map (market =>
                exchange.extend (market, {
                    exchange: exchange.id[(market.active !== false) ? 'green' : 'yellow'],
                }))))
        .filter (market =>
            checkAgainst (market['base'],  argument) ||
            checkAgainst (market['quote'], argument) ||
            (market['baseId']  ? checkAgainst (market['baseId'],  argument) : false) ||
            (market['quoteId'] ? checkAgainst (market['quoteId'], argument) : false) ||
            checkAgainst (market['symbol'], argument) ||
            checkAgainst (market['id'].toString (), argument))


    log (asTable (markets.map (market => ccxt.omit (market, [ 'info', 'limits', 'precision', 'tiers' ]))))

    log ("\n---------------------------------------------------------------\n")

    log ("Currencies:\n")

    let currencies = ccxt.flatten (exchanges
        .map (exchange =>
            Object.values (exchange.currencies).map (currency =>
                exchange.extend (currency, {
                    exchange: exchange.id[(currency.active !== false) ? 'green' : 'yellow'],
                }))))
        .filter (currency =>
            checkAgainst (currency['code'], argument) ||
            checkAgainst (currency['id'], argument))

    log (asTable (currencies.map (currency => ccxt.omit (currency, [ 'info', 'limits', 'precision' ]))))

    log ("\n---------------------------------------------------------------\n")

    // output a summary
    log (markets.length.toString ().yellow, 'markets and',
      currencies.length.toString ().yellow, "currencies\n")


}) ()
