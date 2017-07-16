"use strict";

const ccxt      = require ('../../ccxt.es5.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice;

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'id'.green, '[symbol]'.yellow)
}

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));

let printMarketSymbolTicker = async (market, symbol) => {
    let ticker = await market.fetchTicker (symbol)
    log (market.id.green, symbol.yellow, 'ticker',
        ticker['datetime'],
        'high: '    + ticker['high'],
        'low: '     + ticker['low'],
        'bid: '     + ticker['bid'],
        'ask: '     + ticker['ask'],
        'volume: '  + ticker['quoteVolume'])
    return ticker;
}

(async () => {

    if (process.argv.length > 2) {

        let id = process.argv[2]

        // check if the exchange is supported by ccxt
        let marketFound = ccxt.markets.indexOf (id) > -1

        if (marketFound) {
            
            log ('Instantiating', id.green, 'exchange market')

            // instantiate the exchange by id
            let market = new ccxt[id] ()

            // load all products from the exchange
            let products = await market.loadProducts ()

            if (process.argv.length > 3) { // if a symbol was supplied, get that symbol only

                let symbol = process.argv[3]
                await printMarketSymbolTicker (market, symbol)

            } else { // otherwise run through all symbols one by one

                let symbols = Object.keys (products)

                for (let symbol of symbols) 
                    if ((symbol.indexOf ('.d') < 0)) { // skip darkpool symbols 

                        await sleep (market.rateLimit)
                        await printMarketSymbolTicker (market, symbol)
                    }
            }

            // output a list of all product symbols
            let symbols = Object.keys (products)
            log (id.green, 'has', symbols.length, 'symbols:', symbols.join (', ').yellow)

            // make a table of all products
            let table = asTable.configure ({ delimiter: ' | ' }) (Object.values (products))
            log (table) 

        } else {

            log ('Market ' + id.red + ' not found')
            printUsage ()
        }

    } else {

        printUsage ()

    }

    process.exit ()

}) ()