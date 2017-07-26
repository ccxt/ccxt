"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice;

//-----------------------------------------------------------------------------

let printSupportedMarkets = function () {
    log ('Supported markets:', ccxt.markets.join (', ').green)
}

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'id'.green, '[symbol]'.yellow)
    printSupportedMarkets ()
}

let printSymbols = function (market) {
    log (id.green, 'has', market.symbols.length, 'symbols:', market.symbols.join (', ').yellow)
}

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

let printTicker = async (market, symbol) => {
    let ticker = await market.fetchTicker (symbol)
    log (market.id.green, symbol.yellow, 'ticker',
        ticker['datetime'],
        'high: '    + ticker['high'],
        'low: '     + ticker['low'],
        'bid: '     + ticker['bid'],
        'ask: '     + ticker['ask'],
        'volume: '  + ticker['quoteVolume'])
    return ticker
}

//-----------------------------------------------------------------------------

let printTickers = async (id) => {

    log ('Instantiating', id.green, 'exchange market')

    // instantiate the exchange by id
    let market = new ccxt[id] ()

    // load all products from the exchange
    let products = await market.loadProducts ()

    if (process.argv.length > 3) { // if a symbol was supplied, get that symbol only

        let symbol = process.argv[3]

        await printTicker (market, symbol)

    } else { // otherwise run through all symbols one by one

        for (let symbol of market.symbols) 
            if ((symbol.indexOf ('.d') < 0)) { // skip darkpool symbols 
                await sleep (market.rateLimit)
                await printTicker (market, symbol)
            }
    }
}

//-----------------------------------------------------------------------------

(async function main () {

    if (process.argv.length > 2) {

        let id = process.argv[2]

        // check if the exchange is supported by ccxt
        let marketFound = ccxt.markets.indexOf (id) > -1

        if (marketFound) {
            
            await printTickers (id)

        } else {

            log ('Market ' + id.red + ' not found')
            printUsage ()
        }

    } else {

        printUsage ()

    }

    process.exit ()

}) ()