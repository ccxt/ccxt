"use strict";

const ccxt = require ('../../ccxt')
const asTable = require ('as-table')
const log = require ('ololog')

require ('ansicolor').nice

;(async function test () {

    const exchange = new ccxt.bitfinex ()
    const limit = 5
    const orders = await exchange.fetchOrderBook ('BTC/USD', limit, {
        // this parameter is exchange-specific, all extra params have unique names per exchange
        'group': 1, // 1 = orders are grouped by price, 0 = orders are separate
    })

    log (orders)
}) ()