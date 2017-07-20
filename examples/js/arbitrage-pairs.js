"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice;

let printSupportedMarkets = function () {
    log ('Supported markets:', ccxt.markets.join (', ').green)
}

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'id1'.green, 'id2'.yellow, 'id3'.blue, '...')
    printSupportedMarkets ()
}

let printMarketSymbolsAndProducts = function (market) {
    log (getMarketSymbols (market))
    log (getMarketProductsTable (market))
}

let getMarketProductsTable = (market) => {
    return asTable.configure ({ delimiter: ' | ' }) (Object.values (products))
}

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));

let proxies = [
    '', // no proxy by default
    'https://crossorigin.me/',
    'https://cors-anywhere.herokuapp.com/',
];

(async function main () {

    if (process.argv.length > 3) {

        let ids = process.argv.slice (2)
        let markets = {}

        log (ids.join (', ').yellow)

        // load all products from all exchange markets 
        for (let id of ids) {

            // instantiate the exchange by id
            let market = new ccxt[id] ()

            // save it in a dictionary under its id for future use
            markets[id] = market

            // load all products from the exchange
            let products = await market.loadProducts ()

            // basic round-robin proxy scheduler
            let currentProxy = 0
            let maxRetries   = proxies.length
            
            for (let numRetries = 0; numRetries < maxRetries; numRetries++) {

                try { // try to load exchange products using current proxy

                    market.proxy = proxies[currentProxy]
                    await market.loadProducts ()

                } catch (e) { // rotate proxies in case of connectivity errors, catch all other exceptions

                    // swallow connectivity exceptions only
                    if (e instanceof ccxt.DDoSProtectionError || e.message.includes ('ECONNRESET')) {
                        log.bright.yellow ('[DDoS Protection Error] ' + e.message)
                    } else if (e instanceof ccxt.TimeoutError) {
                        log.bright.yellow ('[Timeout Error] ' + e.message)
                    } else if (e instanceof ccxt.AuthenticationError) {
                        log.bright.yellow ('[Authentication Error] ' + e.message)
                    } else if (e instanceof ccxt.MarketNotAvailableError) {
                        log.bright.yellow ('[Market Not Available Error] ' + e.message)
                    } else if (e instanceof ccxt.EndpointNotAvailableError) {
                        log.bright.yellow ('[Endpoint Not Available Error] ' + e.message)
                    } else {
                        throw e; // rethrow all other exceptions
                    }

                    // retry next proxy in round-robin fashion in case of error
                    currentProxy = ++currentProxy % proxies.length 
                }
            }

            log (id.green, 'products loaded')
        }

        log ('Loaded all products'.green)

        // get all unique symbols
        let uniqueSymbols = ccxt.unique (ccxt.flatten (ids.map (id => markets[id].symbols)))

        // filter out symbols that are not present on at least two exchanges
        let arbitrableSymbols = uniqueSymbols.filter (symbol => 
            ids.filter (id => (markets[id].symbols.indexOf (symbol) >= 0)).length > 1)

        // print a table of arbitrable symbols
        let table = arbitrableSymbols.map (symbol => {
            let row = { symbol }
            for (let id of ids)
                if (markets[id].symbols.indexOf (symbol) >= 0)
                    row[id] = id
            return row
        })

        log (asTable.configure ({ delimiter: ' | ' }) (table))

    } else {

        printUsage ()

    }

    process.exit ()

}) ()