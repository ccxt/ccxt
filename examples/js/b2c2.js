"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

;(async () => {

    // instantiate the exchange
    let exchange = new ccxt.b2c2  ({
        "apiKey": "add api key here",
    })

    // // fetch currencies from the exchange
    // let currencies = await exchange.fetchCurrencies ()
    // log (exchange.name.green, 'currencies', currencies)

    // // fetch markets from the exchange
    // let markets = await exchange.fetchMarkets ()
    // log (exchange.name.green, 'markets', markets)

    // // fetch single order from the exchange
    // let order = await exchange.fetchOrder ('cee4ca76f-a0ef-45d4-abd0-1dceeadfef1e')
    // log (exchange.name.green, 'order', order)

    // fetch orders from the exchange
    let orders = await exchange.fetchOrders ()
    log (exchange.name.green, 'orders', orders)

    // // fetch ledger items from the exchange
    // let ledger = await exchange.fetchLedger ()
    // log (exchange.name.green, 'ledger', ledger)

    // // fetch trades from the exchange
    // let trades = await exchange.fetchMyTrades ()
    // log (exchange.name.green, 'trades', trades)

    // // create a new order on the exchange
    // let order = await exchange.createOrder ('ETHUSD', 'MARKET', 'BUY', 1,)
    // log (exchange.name.green, 'order', order)

    // // fetch account balance from the exchange
    // let balance = await exchange.fetchBalance ()
    // log (exchange.name.green, 'balance', balance)


}) ()