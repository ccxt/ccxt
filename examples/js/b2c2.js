"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table');
const { uuid } = require('../../js/base/functions/string.js');
const { now } = require('../../js/base/functions/time.js');
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
    // await exchange.loadMarkets (true);
    // console.log (JSON.stringify (exchange.currencies) );
    // console.log (JSON.stringify (exchange.markets) );

    // THESE FUNCTIONS WORK WELL AND ARE FULLY IMPLEMENTED

    // // fetch account balance from the exchange
    // let balance = await exchange.fetchBalance ()
    // log (exchange.name.green, 'balance', balance)

    // // // fetch orders from the exchange
    const userId = 'test1'; // or whoever is logged in!

    const symbol = 'ETH/USD';
    const type = 'market';
    const side = 'buy';
    const amount = 1;
    const price = undefined;
    const orderParams = {
        'valid_until': exchange.iso8601 (now () + 86400000),
        'client_order_id': uuid(),
        'executing_unit': userId,
    }
    // let order1 = await exchange.createOrder (symbol, type, side, amount, price, orderParams)
    // log (exchange.name.green, 'order', order1)


    // let quote = await exchange.createQuote (symbol, side, amount)
    // log (exchange.name.green, 'quote', quote)


    let params = {}
    let orders = await exchange.fetchOrders (undefined, undefined, 1, params)
    log (exchange.name.green, 'orders', orders)

    // // fetch ledger items from the exchange
    // let ledger = await exchange.fetchLedger (undefined, undefined, 1000, params)
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

    // // create a new order on the exchange
    // const userId = '2'; // or whoever is logged in!
    // const params = {
    //     'executing_unit': userId,
    // // }
    // let order1 = await exchange.createOrder ('BTC/USD', 'market', 'buy', 0.25, undefined, params)
    // let order2 = await exchange.createOrder ('ETH/USD', 'market', 'buy', 15.5, undefined, params)
    // let order3 = await exchange.createOrder ('XRP/USD', 'market', 'buy', 3500, undefined, params)
    // let order4 = await exchange.createOrder ('ADA/USD', 'market', 'buy', 5000, undefined, params)
    // let order5 = await exchange.createOrder ('DOT/USD', 'market', 'buy', 50, undefined, params)
    // log (exchange.name.green, 'new_order', new_order)

    // // fetch single order from the exchange
    // let order = await exchange.fetchOrder ('dbeb3cc2-68a9-4364-9d80-91de5f1f2133')
    // log (exchange.name.green, 'order', order)

}) ()