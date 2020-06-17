"use strict";

const ccxt      = require ('../../ccxt.js')
    , asTable   = require ('as-table')
    , log       = require ('ololog').configure ({ locate: false })
    , verbose   = process.argv.includes ('--verbose')

require ('ansicolor').nice

//-----------------------------------------------------------------------------

let printSupportedExchanges = function () {
    log ('Supported exchanges:', ccxt.exchanges.join (', ').green)
}

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'id'.green, '[symbol]'.yellow)
    printSupportedExchanges ()
}

let printSymbols = function (exchange) {
    log (id.green, 'has', exchange.symbols.length, 'symbols:', exchange.symbols.join (', ').yellow)
}

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

let printTicker = async (exchange, symbol) => {
    let ticker = await exchange.fetchTicker (symbol)
    log (exchange.id.green, symbol.yellow, 'ticker',
        ticker['datetime'],
        'high: '    + ticker['high'],
        'low: '     + ticker['low'],
        'bid: '     + ticker['bid'],
        'ask: '     + ticker['ask'],
        'volume: '  + ticker['baseVolume'])
    return ticker
}

//-----------------------------------------------------------------------------

let printTickers = async (id) => {

    log ('Instantiating', id.green, 'exchange exchange')

    // instantiate the exchange by id
    let exchange = new ccxt[id] ({ verbose })

    // load all markets from the exchange
    let markets = await exchange.loadMarkets ()

    if (process.argv.length > 3) { // if a symbol was supplied, get that symbol only

        let symbol = process.argv[3]

        await printTicker (exchange, symbol)

    } else { // otherwise run through all symbols one by one

        for (let symbol of exchange.symbols)
            if ((symbol.indexOf ('.d') < 0)) { // skip darkpool symbols

                const market = exchange.markets[symbol];

                if (!market['active']) {
                    log.red (exchange.id + ' ' + symbol + ' inactive');
                    continue;
                }

                await sleep (exchange.rateLimit)
                await printTicker (exchange, symbol)
            }
    }
}

//-----------------------------------------------------------------------------

;(async function main () {

    if (process.argv.length > 2) {

        let id = process.argv[2]

        // check if the exchange is supported by ccxt
        let exchangeFound = ccxt.exchanges.indexOf (id) > -1

        if (exchangeFound) {

            await printTickers (id)

        } else {

            log ('Exchange ' + id.red + ' not found')
            printUsage ()
        }

    } else {

        printUsage ()

    }

    process.exit ()

}) ()
