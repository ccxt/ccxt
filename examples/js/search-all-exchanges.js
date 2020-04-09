"use strict";

/*  ------------------------------------------------------------------------ */

const [processPath, , argument = null] = process.argv.filter (x => !x.startsWith ('--'))
    , verbose = process.argv.includes ('--verbose')
    , strict  = process.argv.includes ('--strict')
    , compact = process.argv.includes ('--compact')
    , debug = process.argv.includes ('--debug')
    , marketsOnly = process.argv.includes ('--markets')
    , currenciesOnly = process.argv.includes ('--currencies')


/*  ------------------------------------------------------------------------ */

const asTable   = require ('as-table')
    , log       = require ('ololog').noLocate
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
    log ('     Non-strict search: node', process.argv[1], 'symbol'.green)
    log ('     Non-strict search: node', process.argv[1], 'currency'.green)
    log ('         Strict search: node', process.argv[1], '--strict', 'argument'.green)
    log ('   Search markets only: node', process.argv[1], '--markets', 'argument'.green)
    log ('Search currencies only: node', process.argv[1], '--currencies', 'argument'.green)

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

log ('Looking up for:', argument.bright, strict ? '(strict search)' : '(non-strict search)')

const checkAgainst = strict ?
    (a, b) => ((a == b.toLowerCase ()) || (a == b.toUpperCase ())) :
    (a, b) => (a || '').toLowerCase ().includes ((b || '').toLowerCase ())

;(async function test () {

    const { Agent } = require ('https')

    let exchanges = await Promise.all (ccxt.exchanges.map (async id => {

        const agent = new Agent ({
            ecdhCurve: 'auto',
        })

        // instantiate the exchange
        let exchange = new ccxt[id] (ccxt.extend (localKeysFile ? (keys[id] || {}) : {}, {
            agent, // set up keys and settings, if any
        }))

        if (exchange.has.publicAPI) {

            try {

                // load markets
                await exchange.loadMarkets ()
                return exchange

            } catch (e) {

                if (debug) {
                    log.red (exchange.id, e.constructor.name)
                }
                return undefined
            }
        }
    }))

    // filter out exchanges that failed to load
    exchanges = exchanges.filter (exchange => exchange)

    if (!currenciesOnly) {

        log ("---------------------------------------------------------------")

        log ("Markets And Symbols:")

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

        log (asTable (markets.map (market => {
            market = ccxt.omit (market, [ 'info', 'limits', 'precision', 'tiers' ])
            return (!compact) ? market : {
                'symbol': market['symbol'],
                'exchange': market['exchange'],
            };
        })))

        log (markets.length.toString ().yellow, 'markets')
    }

    if (!marketsOnly) {

        log ("---------------------------------------------------------------")

        log ("Currencies:")

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

        log (currencies.length.toString ().yellow, 'currencies')
    }

}) ()
