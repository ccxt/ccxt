"use strict";

// ----------------------------------------------------------------------------

const ccxt = require ('../../ccxt.js')

// ----------------------------------------------------------------------------

;(async () => {

    const exchange = new ccxt.protondex ({
        'verbose': process.argv.includes ('--verbose'),
        'timeout': 60000,
    })

    try {

        // const response = await exchange.loadMarkets ()
        // const response = await exchange.fetchTrades ()
        const response = await exchange.fetchRecentTrades ('XPR_XUSDC', 0, 100)
        // const response = await exchange.fetchOrdersHistory ('XPR_XUSDC', 'pbtest1', 0, 100)
        // const response = await exchange.fetchMarkets ()
        // const response = await exchange.fetchOrderBook ('XPR_XUSDC', 10, 100)
        // const response = await exchange.fetchOpenOrders ('XPR_XUSDC',  'pbtest1', 0, 100)
        // const response = await exchange.fetchStatusSync ()
        // const response = await exchange.fetchOHLCV (60, "XPR_XUSDC", '2022-10-12T17:20:13Z', '2022-11-12T17:20:13Z', 100)
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


