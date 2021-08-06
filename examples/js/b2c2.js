"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

;(async () => {

    // instantiate the exchange
    let exchange = new ccxt.b2c2  ({
        "apiKey": "",
        "verbose": true,
    })
    exchange.setSandboxMode (true);
    await exchange.loadMarkets (true);
    // console.info ( exchange.markets)

    // // THESE FUNCTIONS WORK WELL AND ARE FULLY IMPLEMENTED

    // // fetch account balance from the exchange
    // let balance = await exchange.fetchBalance ()
    // log (exchange.name.green, 'balance', balance)

    // // fetch orders from the exchange
    // let orders = await exchange.fetchOrders ()
    // log (exchange.name.green, 'orders', orders)

    // // fetch ledger items from the exchange
    // let ledger = await exchange.fetchLedger ()
    // log (exchange.name.green, 'ledger', ledger)

    // // fetch trades from the exchange
    // let trades = await exchange.fetchMyTrades ()
    // log (exchange.name.green, 'trades', trades)


    // THESE FUNCTIONS WORK WELL AND ARE FULLY MAPPED but you don't need to ever call these directly

    // // fetch currencies from the exchange
    // let currencies = await exchange.fetchCurrencies ()
    // log (exchange.name.green, 'currencies', currencies)

    // // fetch markets from the exchange
    // let markets = await exchange.fetchMarkets ()
    // log (exchange.name.green, 'markets', markets)


    // // THESE FUNCTIONS DON'T WORK PROPERLY YET!

    // create a new order on the exchange
    let new_order = await exchange.createOrder ('ETH/USD', 'MARKET', 'BUY', 1,)
    log (exchange.name.green, 'new_order', new_order)

    // // fetch single order from the exchange
    // let order = await exchange.fetchOrder ('dbeb3cc2-68a9-4364-9d80-91de5f1f2133')
    // log (exchange.name.green, 'order', order)

}) ()