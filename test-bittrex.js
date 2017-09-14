"use strict";

const ccxt = require ('./ccxt.js')
const fs = require ('fs')
const asTable = require ('as-table')

const keys = JSON.parse (fs.readFileSync ('./keys.json', 'utf8'))

const binance   = new ccxt['binance']   (keys['binance'])
const bittrex   = new ccxt['bittrex']   (keys['bittrex'])
const cryptopia = new ccxt['cryptopia'] (keys['cryptopia'])
const kraken    = new ccxt['kraken']    (keys['kraken'])
const liqui     = new ccxt['liqui']     (keys['liqui'])
const poloniex  = new ccxt['poloniex']  (keys['poloniex'])

let exchange = binance;

function printExchangeOrders (exchange, orders) {
    console.log (exchange.id, '\n' + asTable.configure ({ delimiter: ' | ' }) (orders))
}

async function test () {
    let binanceOrders = await binance.fetchOrders ({'symbol':'BTC/USDT'})
    printExchangeOrders (binance, binanceOrders)
    let bittrexOrders = await bittrex.fetchOrders ()
    printExchangeOrders (bittrex, bittrexOrders)
    let cryptopiaOrders = await cryptopia.fetchOpenOrders ({'symbol':'BTC/USDT'})
    printExchangeOrders (cryptopia, cryptopiaOrders)
    process.exit ()
}

test ()
