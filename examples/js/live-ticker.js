"use strict";

const asTable   = require ('as-table')
    , log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice
    , ccxt      = require ('../../ccxt.js')

let printSupportedExchanges = function () {
    log ('Supported exchanges:', ccxt.exchanges.join (', ').green)
}

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'exchange'.green, 'symbol'.yellow, '[rateLimit]'.magenta)
    printSupportedExchanges ()
}

let printTicker = async (id, symbol, rateLimit = undefined) => {

    // check if the exchange is supported by ccxt
    let exchangeFound = ccxt.exchanges.indexOf (id) > -1
    if (exchangeFound) {

        log ('Instantiating', id.green, 'exchange')

        // instantiate the exchange by id
        let exchange = new ccxt[id] ()

        exchange.rateLimit = rateLimit ? rateLimit : exchange.rateLimit

        log.green ('Rate limit:', exchange.rateLimit.toString ().bright)

        // load all markets from the exchange
        let markets = await exchange.loadMarkets ()

        if (symbol in exchange.markets) {

            while (true) {

                const ticker = await exchange.fetchTicker (symbol)

                log ('--------------------------------------------------------')
                log (exchange.id.green, symbol.yellow, exchange.iso8601 (exchange.milliseconds ()))
                log (ccxt.omit (ticker, 'info'))
            }

        } else {

            log.error ('Symbol', symbol.bright, 'not found')
        }


    } else {

        log ('Exchange ' + id.red + ' not found')
        printSupportedExchanges ()
    }
}

;(async function main () {

    if (process.argv.length > 3) {

        const id = process.argv[2]
        const symbol = process.argv[3].toUpperCase ()
        const rateLimit = process.argv[4] ? parseInt (process.argv[4]) : undefined
        await printTicker (id, symbol, rateLimit)

    } else {

        printUsage ()
    }

    process.exit ()

}) ()