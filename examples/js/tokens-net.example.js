"use strict";

const ccxt      = require ('../../ccxt.js')
    , asTable   = require ('as-table')
    , log       = require ('ololog').configure ({ locate: false })
    , verbose   = process.argv.includes ('--verbose')

let tokens = new ccxt.tokens ({
    'apiKey': process.env.TOKENS_NET_API_KEY,
    'secret': process.env.TOKENS_NET_SECRET,
})


let printTicker = async () => {
    log.green ('printTicker:', '--- start ----')
    let markets = await tokens.loadMarkets ()
    log(markets)
}

;(async function main () {
    await printTicker ()

    process.exit ()

}) ()

