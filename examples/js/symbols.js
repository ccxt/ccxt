

import ccxt from '../../js/ccxt.js';
import fs from 'fs';
import ololog from 'ololog';
import ansicolor from 'ansicolor';
import asTable from 'as-table';

const { noLocate } = ololog;
const log = noLocate;

ansicolor.nice
const table = asTable.configure ({ delimiter: ' | ' }), verbose   = process.argv.includes ('--verbose'), debug     = process.argv.includes ('--debug');

//-----------------------------------------------------------------------------

let printSupportedExchanges = function () {
    log ('Supported exchanges:', ccxt.exchanges.join (', ').green)
}

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'id'.green)
    printSupportedExchanges ()
}

let printSymbols = async (id) => {

    // check if the exchange is supported by ccxt
    let exchangeFound = ccxt.exchanges.indexOf (id) > -1
    if (exchangeFound) {

        log ('Instantiating', id.green, 'exchange')

        // set up keys and settings, if any
        const keysGlobal = 'keys.json'
        const keysLocal = 'keys.local.json'

        let keysFile = fs.existsSync (keysLocal) ? keysLocal : (fs.existsSync (keysGlobal) ? keysGlobal : false)
        let settings = keysFile ? (require ('../../' + keysFile)[id] || {}) : {}

        // instantiate the exchange by id
        let exchange = new ccxt[id] (ccxt.extend ({
            verbose,
            // 'proxy': 'https://cors-anywhere.herokuapp.com/',
            // 'proxy': 'https://crossorigin.me/',
        }, settings))

        // Object.assign (exchange, settings)

        // load all markets from the exchange
        let markets = await exchange.loadMarkets ()

        // debug log
        if (debug)
            Object.values (markets).forEach (market => log (market))

        log ("\nSymbols:\n")

        // make a table of all markets

        const marketsList =
            ccxt.sortBy (Object.values (markets), 'symbol')
                .map (market =>
                    ccxt.omit (market, [ 'info', 'limits', 'precision', 'fees' ]))

        let table = table (marketsList)
        log (table)

        log ("\n---------------------------------------------------------------")

        log ("\nCurrencies:\n")

        // make a table of all currencies

        const currenciesList =
            ccxt.sortBy (Object.values (exchange.currencies), 'code')
                .map (currency =>
                    ccxt.omit (currency, [ 'info', 'limits' ]))

        const currenciesTable = table (currenciesList)
        log (currenciesTable)

        log ("\n---------------------------------------------------------------")

        // output a summary
        log (id.green, 'has', exchange.symbols.length.toString ().yellow, 'symbols and',
            Object.keys (exchange.currencies).length.toString ().yellow, "currencies\n")

    } else {

        log ('Exchange ' + id.red + ' not found')
        printSupportedExchanges ()
    }
}

;(async function main () {

    if (process.argv.length > 2) {

        let id = process.argv[2]
        await printSymbols (id)

    } else {

        printUsage ()
    }

    process.exit ()

}) ()