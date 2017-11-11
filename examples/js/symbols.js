"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog')

require ('ansicolor').nice;

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

        // instantiate the exchange by id
        let exchange = new ccxt[id] ({
            // 'verbose': true,
            // 'proxy': 'https://cors-anywhere.herokuapp.com/',
            // 'proxy': 'https://crossorigin.me/',
        })

        // load all markets from the exchange
        let markets = await exchange.loadMarkets ()

        // output a list of all market symbols
        log (id.green, 'has', exchange.symbols.length, 'symbols:', exchange.symbols.join (', ').yellow)

        // debug log
        Object.values (markets).forEach (market => log (market))

        // make a table of all markets
        let table = asTable.configure ({ delimiter: ' | ' }) (ccxt.sortBy (Object.values (markets), 'symbol'))
        log (table)

    } else {

        log ('Exchange ' + id.red + ' not found')
        printSupportedExchanges ()
    }
}

(async function main () {

    if (process.argv.length > 2) {

        let id = process.argv[2]
        await printSymbols (id)

    } else {

        printUsage ()
    }

    process.exit ()

}) ()