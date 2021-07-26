"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

;(async () => {

    // instantiate the exchange
    let exchange = new ccxt.b2c2  ({
        "apiKey": "your_api_key_here",
    })

    // fetch account balance from the exchange
    let balance = await exchange.fetchBalance ()

    // output the result
    log (exchange.name.green, 'balance', balance)


}) ()