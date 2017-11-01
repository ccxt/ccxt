"use strict";

const ccxt    = require ('../../ccxt.js')
const log     = require ('ololog')
const ansi    = require ('ansicolor').nice
const asTable = require ('as-table')

async function test () {

    const exchange = new ccxt.gdax ({ enableRateLimit: true })
    const symbol   = 'BTC/USD'
    const repeat   = 100;

    for (let i = 0; i < repeat; i++) {
        let ticker = await exchange.fetchTicker (symbol)
        log (exchange.id.green, exchange.iso8601 (exchange.milliseconds ()), ticker['datetime'], symbol.green, ticker['last'])
    }
}

test ()