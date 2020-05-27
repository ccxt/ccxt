"use strict";

/*  ------------------------------------------------------------------------ */

const ccxt        = require ('../../ccxt.js')
    , asTable     = require ('as-table') // .configure ({ print: require ('string.ify').noPretty })
    , log         = require ('ololog').noLocate
    , ansi        = require ('ansicolor').nice

;(async function test () {

    let total = 0
    let missing = 0
    let implemented = 0
    let emulated = 0

    log (asTable (ccxt.exchanges.map (id => new ccxt[id]()).map (exchange => {

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
                capability = exchange.id.red.dim
                missing += 1
            } else if (exchange.has[key] === 'emulated') {
                capability = exchange.id.yellow
                emulated += 1
            } else {
                capability = exchange.id.green
                implemented += 1
            }

            result[key] = capability
        })

        return result
    })))

    log ('Methods:',
        implemented.toString ().green, 'implemented,',
        emulated.toString ().yellow, 'emulated,',
        missing.toString ().red, 'missing,',
        total.toString (), 'total')

}) ()
