"use strict";

// ----------------------------------------------------------------------------

const ccxt = require("../../ccxt.js"),
    log = require ('ololog').handleNodeErrors (),
    asTable = require("as-table").configure({ delimiter: " | " });

// ----------------------------------------------------------------------------

function prettyJSONLog(str) {
    log (JSON.stringify(str, null, 2))
}

(async () => {

    const exchange = new ccxt.bitcom ({
        verbose: process.argv.includes ('--verbose'),
        timeout: 60000,
        apiKey: 'ak-3d4dc159-8313-4726-860e-60355ccf1d24',
        secret: 'A2I2HuUKqx7VnxQVvJhvowvmgQ3GgunDtdsHHyEjZoQXn14zmf8hB8MZzjlgGOFg'
    });

    let params = {}

    // fetch balance
    const balance = await exchange.fetchBalance ()
    prettyJSONLog (balance)

    // fetch markets
    const markets = await exchange.fetchMarkets ()
    prettyJSONLog (markets)


    // //get ticker
    // const ticker = await exchange.fetchTicker ("BTC/USDT")
    // log (ticker)
    //

    //
    // //get orderbook
    // const orderbook = await exchange.fetchOrderBook ('BTC/USDT')
    // log (orderbook)
    // //get public trades
    // const publicTrades = await exchange.fetchTrades ('BTC/USDT', 1518983548636 - 2 * 24 * 60 * 60 * 1000)
    // log (asTable (publicTrades))
    //
    // //get tickers
    // const tickers = await exchange.fetchTickers ()
    // log (tickers)

    //
    // //get private trades
    // let myTrades = await exchange.fetchMyTrades('BTC/USDT', undefined, 5)
    // log('myTrades'.green, asTable(myTrades))
    //
    // //create and delete order
    // {
    //     const orderId = await exchange.createOrder('BTC/USDT', 'market', 'sell', 0.0001)
    //     const order = await exchange.fetchOrder(orderId['id'])
    //     log(order)
    //     const cancelResponse = await exchange.cancelOrder(orderId['id'])
    //     log(cancelResponse)
    // }
    //

    //
    // //get open orders
    // const openOrders = await exchange.fetchOpenOrders ()
    // log (asTable (openOrders.map (order => ccxt.omit (order, [ 'timestamp', 'info' ]))))
    //
    // //get closed orders
    // const orders = await exchange.fetchClosedOrders ()
    // log (asTable (orders.map (order => ccxt.omit (order, [ 'timestamp', 'info' ]))))
    // const order = await exchange.fetchOrder (orders[0]['id'])
    // log (order)

})()