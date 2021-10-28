"use strict";

/*  ------------------------------------------------------------------------ */

const ccxt        = require ('../../ccxt.js')
    , asTable     = require ('as-table').configure ({ delimiter: ', ', /* print: require ('string.ify').noPretty  */ })
    , log         = require ('ololog').noLocate
    , ansi        = require ('ansicolor').nice

console.log (ccxt.iso8601 (ccxt.milliseconds ()))
console.log ('CCXT v' + ccxt.version)

;(async function test () {

    let total = 0
    let missing = 0
    let implemented = 0
    let emulated = 0

    const table = asTable (ccxt.exchanges.map (id => new ccxt[id]()).map (exchange => {

        let result = {};

        [
            'publicAPI',
            'privateAPI',
            'CORS',
            'fetchTicker',
            'fetchTickers',
            'fetchOrderBook',
            'fetchTrades',
            'fetchOHLCV',
            'fetchBalance',
            'createOrder',
            'createMarketOrder',
            'createLimitOrder',
            'editOrder',
            'cancelOrder',
            'cancelOrders',
            'cancelAllOrders',
            'fetchOrder',
            'fetchOrders',
            'fetchOpenOrders',
            'fetchClosedOrders',
            'fetchMyTrades',
            'fetchOrderTrades',
            'fetchCurrencies',
            'fetchDepositAddress',
            'createDepositAddress',
            'fetchTransactions',
            'fetchDeposits',
            'fetchWithdrawals',
            'withdraw',
            'fetchLedger',
            'fetchFundingFees',
            'fetchTradingFees',
            'fetchTradingLimits',

        ].forEach (key => {

            total += 1

            let capability = exchange.has[key].toString ()

            if (!exchange.has[key]) {
                capability = exchange.id.replace (/[a-z0-9]/g, ' ')
                missing += 1
            } else if (exchange.has[key] === 'emulated') {
                capability = exchange.id.replace (/[a-z0-9]/g, ' ')
                emulated += 1
            } else {
                capability = exchange.id.green
                implemented += 1
            }

            result[key] = capability
        })

        return result
    }))

    let lines = table.split ("\n")

    lines = lines.slice (0, 1).concat (lines.slice (2))

    log (lines.join ("\n"))

    log ('Summary:',
        ccxt.exchanges.length.toString (), 'exchanges,',
        implemented.toString ().green, 'methods implemented,',
        emulated.toString ().yellow, 'emulated,',
        missing.toString ().red, 'missing,',
        total.toString (), 'total')

}) ()
