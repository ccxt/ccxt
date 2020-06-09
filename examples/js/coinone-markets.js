"use strict"

const log = require ('ololog')
    , ccxt = require ('../../ccxt.js')

const exchange = new ccxt.coinone ({
    'enableRateLimit': true,
    'verbose': process.argv.includes ('--verbose'),
})

;(async function main () {

    const markets = await exchange.loadMarkets ()
    log (markets)
    log ('\n' + exchange['name'] + ' supports ' + Object.keys (markets).length + ' pairs')

}) ()
