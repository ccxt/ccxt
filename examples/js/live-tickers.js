"use strict";

const asTable   = require ('as-table')
    , log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice
    , ccxt      = require ('../../ccxt.js')

let printSupportedExchanges = function () {
    log ('Supported exchanges:', ccxt.exchanges.join (', ').green)
}

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'exchange'.green)
    printSupportedExchanges ()
}

let printTickers = async (id) => {

    // check if the exchange is supported by ccxt
    let exchangeFound = ccxt.exchanges.indexOf (id) > -1
    if (exchangeFound) {

        log ('Instantiating', id.green, 'exchange')

        // instantiate the exchange by id
        let exchange = new ccxt[id] ()

        // load all markets from the exchange
        let markets = await exchange.loadMarkets ()

        while (true) {

            const tickers = await exchange.fetchTickers ()

            log ('--------------------------------------------------------')
            log (exchange.id.green, exchange.iso8601 (exchange.milliseconds ()))
            log ('Fetched', Object.values (tickers).length.toString ().green, 'tickers:')
            log (asTable.configure ({ delimiter: ' | '.dim, right: true }) (
                ccxt.sortBy (Object.values (tickers), 'quoteVolume', true)
                                   .slice (0,20)
                                   .map (ticker => ({
                                        symbol: ticker['symbol'],
                                        price: ticker['last'].toFixed (8),
                                        datetime: ticker['datetime'],
                                   }))))
        }

    } else {

        log ('Exchange ' + id.red + ' not found')
        printSupportedExchanges ()
    }
}

;(async function main () {

    if (process.argv.length > 2) {

        const id = process.argv[2]
        await printTickers (id)

    } else {

        printUsage ()
    }

    process.exit ()

}) ()