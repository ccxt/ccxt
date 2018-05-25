"use strict";

const ccxt = require ('../../ccxt')
const asTable = require ('as-table')
const log = require ('ololog')

require ('ansicolor').nice

const exchange = new ccxt.bittrex ({
    apiKey: "471b47a06c384e81b24072e9a8739064",
    secret: "694025686e9445589787e8ca212b4cff",
    enableRateLimit: true,
})

async function test () {

    const orders = await exchange.fetchOrders ()

    log (asTable (orders.map (order => ccxt.omit (order, [ 'timestamp', 'info' ]))))

    const order = await exchange.fetchOrder (orders[0]['id'])

    log (order)
}

test ()