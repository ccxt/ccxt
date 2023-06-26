
// ----------------------------------------------------------------------------

import ccxt from '../../js/ccxt.js';

// ----------------------------------------------------------------------------

;(async () => {

    const exchange = new ccxt.protondex ({
        'verbose': process.argv.includes ('--verbose'),
        'timeout': 60000,
    })

    try {
        // API doc: https://api-docs.protondex.com/reference/what-is-proton-dex
        // const response = await exchange.loadMarkets ()
        // const response = await exchange.fetchStatusSync ()
        // 1. Fetch markets
        // const response = await exchange.fetchMarkets ()
        // 2. Fetch ticker
        // const response = await exchange.fetchTickers ()
        // const response = await exchange.fetchTicker ('XPR_XMD')
        // 3. Fetch order book
        // const response = await exchange.fetchOrderBook ('XPR_XMD', 100, {'step': 10000})
        // 4. Fetch recent trades
        // const response = await exchange.fetchTrades ('XPR_XMD', 1, 100, {'offset': 0})
        // 5. Fetch OHLCV
        // const response = await exchange.fetchOHLCV ("XPR_XMD", 60, 1, 100, {'from_time': '2023-04-12T17:20:13Z', 'to_time': '2023-05-12T17:20:13Z'})
        // 6. Fetch account balances
        // const response = await exchange.fetchBalance ({'account': 'testme1'})
        // 7. Fetch order
        // const response = await exchange.fetchOrder ('1603774', {'ordinal_order_id': ''})
        // 8. Fetch open orders
        // const response = await exchange.fetchOpenOrders ('XPR_XMD', 1, 100, {'account': 'testme1', 'offset': 0, 'ordinal_order_ids': ''})
        // 9. Fetch orders history
        // const response = await exchange.fetchOrders ('XPR_XMD', 1, 100, {'account': 'testme1', 'offset': 0, 'ordinal_order_ids': '', 'trx_id': '', 'status': ''})
        // const response = await exchange.fetchOrders ('XPR_XMD', 1, 100, {'account': 'testme1', 'offset': '0', 'ordinal_order_ids': '293d13c47603e5c81c270a2d8e197823584cec071d139631f6e1990e62ae8ed8', 'trx_id': '', 'status': ''})
        // 10. Fetch trades history
        // const response = await exchange.fetchMyTrades ('XPR_XMD', 1, 10, {'account': 'otctest', 'offset': 0})
        // 11. Create order
        // const response = await exchange.createOrder ('XPR_XMD', 1, 2, 700, 0.0018, {'account': 'testme1', 'filltype': 0, 'triggerprice': 0})
        // 12. Cancel order
        // const response = await exchange.cancelOrder (4065203, 'XPR_XMD', {'account': 'testme1'});
        // 13. Cancel all orders for specific symbol
        // const response = await exchange.cancelAllOrders ('XPR_XMD', {'account': 'testme1'});

        console.log (response);
        console.log ('Succeeded.')

    } catch (e) {

        console.log ('--------------------------------------------------------')
        console.log (e.constructor.name, e.message)
        console.log ('--------------------------------------------------------')
        console.log (exchange.last_http_response)
        console.log ('Failed.')
    }

}) ()


