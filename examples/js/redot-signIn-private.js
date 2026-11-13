"use strict";

const ccxt = require ('../../ccxt')
const log = require ('ololog')

require ('ansicolor').nice

const exchange = new ccxt.redot ({
    apiKey: "YOUR_API_KEY",
    secret: "YOUR_SECRET",
    enableRateLimit: true,
})

async function test () {

    // Create authorization token (mandatory step)
    await exchange.signIn();

    const balances = await exchange.fetchBalance();
    log("Balance BTC: ", balances['BTC'])

    const orders = await exchange.fetchClosedOrders ()
    log("Number of closed orders:", orders.length);
}

test ()