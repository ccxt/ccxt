"use strict";

const ccxt      = require ('../../ccxt.es5.js')
const asTable   = require ('as-table')
const util      = require ('util')
const log       = require ('ololog')

require ('ansicolor').nice;

let listSymbols = async (id) => {

    // check if the exchange is supported by ccxt
    let marketFound = ccxt.markets.indexOf (id) > -1
    if (marketFound) {
        
        log ('Instantiating', id.green, 'exchange market')

        // instantiate the exchange by id
        let market = new ccxt[id] ()

        // load all products from the exchange
        let products = await market.loadProducts ()

        // output a list of all product symbols
        let symbols = Object.keys (products)
        log (id.green, 'has', symbols.length, 'symbols:', symbols.join (', ').yellow)

        // make a table of all products
        let table = asTable.configure ({ delimiter: ' | ' }) (Object.values (products))
        log (table) 

    } else {

        log ('Market ' + id.red + ' not found')
    }
}

(async () => {

    if (process.argv.length > 2) {

        let id = process.argv[2]
        await listSymbols (id);

    } else {

        log ('Usage: node', process.argv[1], 'id'.green)
    }

    process.exit ()

}) ()