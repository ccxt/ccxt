"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog')

require ('ansicolor').nice;

let printSupportedMarkets = function () {
    log ('Supported markets:', ccxt.markets.join (', ').green)
}

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'id'.green)
    printSupportedMarkets ()
}

let printSymbols = async (id) => {

    // check if the exchange is supported by ccxt
    let marketFound = ccxt.markets.indexOf (id) > -1
    if (marketFound) {
        
        log ('Instantiating', id.green, 'exchange market')

        // instantiate the exchange by id
        let market = new ccxt[id] ()

        // load all products from the exchange
        let products = await market.loadProducts ()

        // output a list of all product symbols
        log (id.green, 'has', market.symbols.length, 'symbols:', market.symbols.join (', ').yellow)

        // make a table of all products
        let table = asTable.configure ({ delimiter: ' | ' }) (Object.values (products))
        log (table) 

    } else {

        log ('Market ' + id.red + ' not found')
        printSupportedMarkets ()
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