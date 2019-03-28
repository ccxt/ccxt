"use strict";

const ccxt      = require ('../../ccxt.js')
    , verbose   = process.argv.includes ('--verbose')

//-----------------------------------------------------------------------------

const printSupportedExchanges = () => console.log ('Supported exchanges:', ccxt.exchanges.join (', '))

const printUsage = () => {
    console.log ('Usage: node', process.argv[1], 'id'.green)
    printSupportedExchanges ()
}

const run = async (id) => {

    // check if the exchange is supported by ccxt
    const exchangeFound = ccxt.exchanges.indexOf (id) > -1

    if (exchangeFound) {

        console.log ('Instantiating', id, 'exchange')

        // instantiate the exchange by id
        const exchange = new ccxt[id] ({ verbose })

        // try to load markets and catch the errors if any
        try {

            await exchange.loadMarkets ()

        } catch (e) {

            if (e instanceof ccxt.NetworkError) {
                console.log (exchange.id, 'loadMarkets failed due to a network error:', e.message)
            } else if (e instanceof ccxt.ExchangeError) {
                console.log (exchange.id, 'loadMarkets failed due to exchange error:', e.message)
            } else {
                console.log (exchange.id, 'loadMarkets failed with:', e.message)
            }

            // rethrow the error "higher up" the call chain
            throw e
        }

        // try to fetch a ticker and catch the errors if any
        try {

            const symbol = 'ETH/BTC'
            const response = await exchange.fetchTicker (symbol)
            console.log (response)

        } catch (e) {

            if (e instanceof ccxt.NetworkError) {
                console.log (exchange.id, 'fetchTicker failed due to a network error:', e.message)
            } else if (e instanceof ccxt.ExchangeError) {
                console.log (exchange.id, 'fetchTicker failed due to exchange error:', e.message)
            } else {
                console.log (exchange.id, 'fetchTicker failed with:', e.message)
            }

            // rethrow the error "higher up" the call chain
            throw e
        }

    } else {

        console.log ('Exchange', id, 'not found')
        printSupportedExchanges ()
    }
}

;(async function main () {

    if (process.argv.length > 2) {

        let id = process.argv[2]
        await run (id)

    } else {

        printUsage ()
    }

    process.exit ()

}) ()