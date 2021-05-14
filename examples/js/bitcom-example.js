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
    let symbol

    // fetch time
    const timestamp = await exchange.fetchTime ()
    prettyJSONLog (timestamp)

    // fetch status
    const status = await exchange.fetchStatus ()
    prettyJSONLog (status)

    // fetch klines
    symbol = 'BTC-PERPETUAL'
    const klines = await exchange.fetchOHLCV (symbol, '5m', undefined, 10)
    prettyJSONLog (klines)

    // fetch ticker
    symbol = 'BTC-PERPETUAL'
    const ticker = await exchange.fetchTicker (symbol)
    prettyJSONLog (ticker)

    // fetch order book
    symbol = 'BTC-PERPETUAL'
    const orderBook = await exchange.fetchOrderBook (symbol)
    prettyJSONLog (orderBook)

    // fetch order
    params = {
        'currency': 'BTC',
    }
    const order = await exchange.fetchOrder ('17508028', undefined, params )
    prettyJSONLog (order)

    // fetch orders
    params = {
        'currency': 'BTC',
    }
    const orders = await exchange.fetchOrders (undefined, undefined,10, params )
    prettyJSONLog (orders)

    // fetch open orders
    params = {
        'currency': 'BTC',
    }
    const openOrders = await exchange.fetchOpenOrders (undefined, undefined, 10, params )
    prettyJSONLog (openOrders)

    // fetch closed orders
    params = {
        'currency': 'BTC',
    }
    const closedOrders = await exchange.fetchClosedOrders (undefined, undefined, 10, params )
    prettyJSONLog (closedOrders)

    // fetch open trades
    params = {
        'currency': 'BTC',
    }
    const openTrades = await exchange.fetchOrderTrades ('17508028', undefined, undefined, 100, params )
    prettyJSONLog (openTrades)

    // fetch user trades
    params = {
        'currency': 'BTC',
    }
    const userTrades = await exchange.fetchMyTrades ( undefined, undefined, 100, params )
    prettyJSONLog (userTrades)

    // fetch market trades
    params = {
        'currency': 'BTC',
    }
    const marketTrades = await exchange.fetchTrades ( undefined, undefined, 100, params )
    prettyJSONLog (marketTrades)

    // create orders
    params = {
        'currency': 'ETH',
    }
    const createOrder = await exchange.createOrder ('ETH-2APR21-1800-C', 'market', 'buy',
        '1.0', undefined, params )
    prettyJSONLog (createOrder)

    // amend orders
    params = {
        'currency': 'ETH',
    }
    const amendOrder = await exchange.editOrder ('1888694', 'ETH-2APR21-1820-C', undefined, undefined,
        '2.0', undefined, params )
    prettyJSONLog (amendOrder)

    // cancel orders
    params = {
        'currency': 'ETH',
    }
    const cancelOrder = await exchange.cancelOrder ('1888694', undefined, params)
    prettyJSONLog (cancelOrder)

    // cancel all orders
    await exchange.cancelAllOrders ()

    // fetch deposits
    const deposits = await exchange.fetchDeposits ('ETH', undefined, 10, {})
    prettyJSONLog (deposits)

    // fetch withdrawals
    const withdrawals = await exchange.fetchWithdrawals ('ETH', undefined, 10, {})
    prettyJSONLog (withdrawals)
})()
