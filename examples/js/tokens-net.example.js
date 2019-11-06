"use strict";

const ccxt      = require ('../../ccxt.js')
    , asTable   = require ('as-table')
    , log       = require ('ololog').configure ({ locate: false })
    , verbose   = process.argv.includes ('--verbose')

let tokens = new ccxt.tokens ({
    'apiKey': process.env.TOKENS_NET_API_KEY,
    'secret': process.env.TOKENS_NET_SECRET,
})


let printMarkets = async () => {
    log.green ('printMarkets:', '--- start ----')
    let response = await tokens.loadMarkets ()
    log(response)
}

let printTickers = async () => {
    log.green ('printTicker:', '--- start ----')
    let response = await tokens.fetchTickers ()
    log(response)
}

let printTicker = async () => {
    log.green ('printTicker:', '--- start ----')
    let response = await tokens.fetchTicker ('BTC/USDT')
    log(response)
}

let printCurrencies = async () => {
    log.green ('printCurrencies:', '--- start ----')
    let response = await tokens.fetchCurrencies ()
    log(response)
}

let printOrderBook = async () => {
    log.green ('printOrderBook:', '--- start ----')
    let response = await tokens.fetchOrderBook ('BTC/USDT')
    log(response)
    log ('Bids:')
    log (asTable (response['bids']))
}

let printTrades = async () => {
    log.green ('printTrades:', '--- start ----')
    let response = await tokens.fetchTrades ('BTC/USDT')
    log(response)
}

(async function main () {
    // await printMarkets ()
    // await printTickers ()
    // await printTicker ()
    // await printCurrencies ()
    // await printOrderBook ()
    await printTrades ()


    process.exit ()

}) ()
