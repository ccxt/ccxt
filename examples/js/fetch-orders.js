"use strict";

const ccxt = require ('../../ccxt')
const asTable = require ('as-table')
const log = require ('ololog')

require ('ansicolor').nice

const exchange = new ccxt.bittrex ({
    apiKey: "YOUR_API_KEY",
    secret: "YOUR_SECRET",
})

async function test () {

    const orders = await exchange.fetchOrders ()

    log (asTable (orders.map (order => ccxt.omit (order, [ 'timestamp', 'info' ]))))

    const order = await exchange.fetchOrder (orders[0]['id'])

    log (order)
}

test ()