"use strict";

//-----------------------------------------------------------------------------

const [processPath, , exchangeId, methodName, ... params] = process.argv.filter (x => !x.startsWith ('--'))
const verbose = process.argv.includes ('--verbose')

//-----------------------------------------------------------------------------

const ccxt      = require ('../../ccxt.js')
const fs        = require ('fs')
const asTable   = require ('as-table')
const util      = require ('util')
const log       = require ('ololog').configure ({ locate: false })

//-----------------------------------------------------------------------------

require ('ansicolor').nice;

//-----------------------------------------------------------------------------

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

//-----------------------------------------------------------------------------

const exchange = new (ccxt)[exchangeId] ({ verbose })

//-----------------------------------------------------------------------------

let apiKeys = JSON.parse (fs.readFileSync ('./keys.json', 'utf8'))[exchangeId]

Object.assign (exchange, apiKeys)

//-----------------------------------------------------------------------------

let printSupportedExchanges = function () {
    log ('Supported exchanges:', ccxt.exchanges.join (', ').green)
}

//-----------------------------------------------------------------------------

 function printUsage () {
    log ('This is an example of a basic command-line interface to all exchanges')
    log ('Usage: node', process.argv[1], 'id'.green, 'method'.yellow, '"param1" param2 "param3" param4 ...'.blue)
    log ('Examples:')
    log ('node', process.argv[1], 'okcoinusd fetchOHLCV BTC/USD 15m')
    log ('node', process.argv[1], 'bitfinex fetchBalance')
    log ('node', process.argv[1], 'kraken fetchOrderBook ETH/BTC')
    printSupportedExchanges ()
}

//-----------------------------------------------------------------------------

async function main () {

    const requirements = exchangeId && methodName
    if (!requirements) {

        printUsage ()

    } else {

        let args = params.map (param =>
            param.match (/[a-zA-Z]/g) ? param : parseFloat (param))

        console.log (await exchange[methodName] (... args))

    }
}

//-----------------------------------------------------------------------------

main ()
