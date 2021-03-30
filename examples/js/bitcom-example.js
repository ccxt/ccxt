"use strict";

// ----------------------------------------------------------------------------

const ccxt = require("../../ccxt.js"),
    log = require ('ololog').handleNodeErrors (),
    asTable = require("as-table").configure({ delimiter: " | " });

// ----------------------------------------------------------------------------

(async () => {

    const exchange = new ccxt.bitcom ({
        verbose: process.argv.includes ('--verbose'),
        timeout: 60000,
        apiKey: 'ak-3d4dc159-8313-4726-860e-60355ccf1d24',
        secret: 'A2I2HuUKqx7VnxQVvJhvowvmgQ3GgunDtdsHHyEjZoQXn14zmf8hB8MZzjlgGOFg'
    });

    let params = {}

    // get market summary
    params = {
        'currency': 'BTC',
    }
    const indexInfo = await exchange.fetchIndex (params)
    log (indexInfo)

    // get market summary
    params = {
        'currency': 'BTC',
        'category': 'future',
        'instrument_id': 'BTC-PERPETUAL',
    }
    const marketSummary = await exchange.fetchMarkets (params)
    log (marketSummary)

    // get currencies
    const currencies = await exchange.fetchCurrencies ()
    log (currencies)

    //get balance
    params = {
        'currency': 'BTC',
    }
    const balance = await exchange.fetchBalance (params)
    log.green (balance)


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