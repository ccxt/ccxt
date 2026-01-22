"use strict";

// ----------------------------------------------------------------------------

const ccxt = require("../../ccxt.js"),
    log = require ('ololog').handleNodeErrors (),
    asTable = require("as-table").configure({ delimiter: " | " });

// ----------------------------------------------------------------------------

(async () => {

    const exchange = new ccxt.kickex ({
        verbose: process.argv.includes ('--verbose'),
        timeout: 60000,
        apiKey: 'IKzKLLwBa93KEaFS4wPWN4dsb2DaOriTth4_XPbIPG8=',
        password: 'XSASsdcjk!@*&^#328476',
        secret: 'FQGcpZvFrfBO7cn1x-VapXDyjgwqqJPbR6P8iDr2UGJWHfn-E6sjZOoE__Tc43h-m2SLeF649IYlGQvJoXkpoA=='
    });

    if (process.argv.includes ('--localhost')) {
        exchange['urls']['api']['private'] = 'http://localhost:9001/api'
    }

    //get ticker
    const ticker = await exchange.fetchTicker ("BTC/USDT")
    log (ticker)

    //get currencies
    const currencies = await exchange.fetchCurrencies ()
    log (currencies)


    //get orderbook
    const orderbook = await exchange.fetchOrderBook ('BTC/USDT')
    log (orderbook)
    //get public trades
    const publicTrades = await exchange.fetchTrades ('BTC/USDT', 1518983548636 - 2 * 24 * 60 * 60 * 1000)
    log (asTable (publicTrades))

    //get tickers
    const tickers = await exchange.fetchTickers ()
    log (tickers)
    //get markets
    const markets = await exchange.fetchMarkets ()
    log (markets)

    //get private trades
    let myTrades = await exchange.fetchMyTrades('BTC/USDT', undefined, 5)
    log('myTrades'.green, asTable(myTrades))

    //create and delete order
    {
        const orderId = await exchange.createOrder('BTC/USDT', 'market', 'sell', 0.0001)
        const order = await exchange.fetchOrder(orderId['id'])
        log(order)
        const cancelResponse = await exchange.cancelOrder(orderId['id'])
        log(cancelResponse)
    }

    //get balance
    const balance = await exchange.fetchBalance ()
    log.green (balance)

    //get open orders
    const openOrders = await exchange.fetchOpenOrders ()
    log (asTable (openOrders.map (order => ccxt.omit (order, [ 'timestamp', 'info' ]))))

    //get closed orders
    const orders = await exchange.fetchClosedOrders ()
    log (asTable (orders.map (order => ccxt.omit (order, [ 'timestamp', 'info' ]))))
    const order = await exchange.fetchOrder (orders[0]['id'])
    log (order)

})()
