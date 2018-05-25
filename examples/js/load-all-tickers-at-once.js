"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice

//-----------------------------------------------------------------------------

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

//-----------------------------------------------------------------------------

let human_value = function (price) {
    return typeof price === 'undefined' ? 'N/A' : price
}

//-----------------------------------------------------------------------------

let test = async function (exchange, symbol) {

    try {

        await exchange.loadMarkets ()

        if (symbol in exchange.markets) {

            let ticker = await exchange.fetchTicker (symbol)

            log (exchange.id.green, symbol.green, 'ticker',
                ticker['datetime'],
                'high: '    + human_value (ticker['high']),
                'low: '     + human_value (ticker['low']),
                'bid: '     + human_value (ticker['bid']),
                'ask: '     + human_value (ticker['ask']),
                'volume: '  + human_value (ticker['quoteVolume']))
        } else {

            // do nothing or throw an error
            log.bright.yellow (exchange.id + ' does not have ' + symbol)
        }

    } catch (e) {

        if (e instanceof ccxt.DDoSProtection) {
            log.bright.yellow (exchange.id, '[DDoS Protection]')
        } else if (e instanceof ccxt.RequestTimeout) {
            log.bright.yellow (exchange.id, '[Request Timeout]')
        } else if (e instanceof ccxt.AuthenticationError) {
            log.bright.yellow (exchange.id, '[Authentication Error]')
        } else if (e instanceof ccxt.ExchangeNotAvailable) {
            log.bright.yellow (exchange.id, '[Exchange Not Available]')
        } else if (e instanceof ccxt.ExchangeError) {
            log.bright.yellow (exchange.id, '[Exchange Error]')
        } else if (e instanceof ccxt.NetworkError) {
            log.bright.yellow (exchange.id, '[Network Error]')
        } else {
            throw e
        }
    }
}

//-----------------------------------------------------------------------------

const symbol = 'BTC/USD'

//-----------------------------------------------------------------------------

async function main () {

    let exchanges = []

    // instantiate all exchanges
    await Promise.all (ccxt.exchanges.map (async id => {
        let exchange = new (ccxt)[id] ()
        exchanges.push (exchange)
        await test (exchange, symbol)
    }))

    let succeeded = exchanges.filter (exchange => exchange.markets ? true : false).length.toString ().bright.green
    let failed = exchanges.filter (exchange => exchange.markets ? false : true).length
    let total = ccxt.exchanges.length.toString ().bright.white
    console.log (succeeded, 'of', total, 'exchanges loaded', ('(' + failed + ' errors)').red)
}

main ()
