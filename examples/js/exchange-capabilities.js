"use strict";

/*  ------------------------------------------------------------------------ */

const ccxt        = require ('../../ccxt.js')
    , asTable     = require ('as-table') // .configure ({ print: require ('string.ify').noPretty })
    , log         = require ('ololog').noLocate
    , ansi        = require ('ansicolor').nice

console.log (ccxt.iso8601 (ccxt.milliseconds ()))
console.log ('CCXT v' + ccxt.version)

;(async function test () {

    let total = 0
    let missing = 0
    let implemented = 0
    let emulated = 0

    log (asTable (ccxt.exchanges.map (id => new ccxt[id]()).map (exchange => {

        let result = {};

        [
            'privateAPI',
            'publicAPI',
            'futures',
            'CORS',
            'cancelAllOrders',
            'cancelOrder',
            'cancelOrders',
            'createDepositAddress',
            'createLimitBuyOrder',
            'createLimitOrder',
            'createLimitSellOrder',
            'createMarketBuyOrder',
            'createMarketOrder',
            'createMarketSellOrder',
            'createOrder',
            'deposit',
            'editOrder',
            'fetchAccounts',
            'fetchAllTradingFees',
            'fetchBalance',
            'fetchBidsAsks',
            'fetchCanceledOrders',
            'fetchClosedOrder',
            'fetchClosedOrders',
            'fetchCurrencies',
            'fetchDeposit',
            'fetchDepositAddress',
            'fetchDepositAddresses',
            'fetchDeposits',
            'fetchFees',
            'fetchFundingFee',
            'fetchFundingFees',
            'fetchFundingHistory',
            'fetchFundingRate',
            'fetchFundingRates',
            'fetchIndexOHLCV',
            'fetchIsolatedPositions',
            'fetchL2OrderBook',
            'fetchLedger',
            'fetchLedgerEntry',
            'fetchMarkOHLCV',
            'fetchMarkets',
            'fetchMyBuys',
            'fetchMySells',
            'fetchMyTrades',
            'fetchOHLCV',
            'fetchOpenOrder',
            'fetchOpenOrders',
            'fetchOrder',
            'fetchOrderBook',
            'fetchOrderBooks',
            'fetchOrderTrades',
            'fetchOrders',
            'fetchOrdersByStatus',
            'fetchPosition',
            'fetchPositions',
            'fetchStatus',
            'fetchTicker',
            'fetchTickers',
            'fetchTime',
            'fetchTrades',
            'fetchTradingFee',
            'fetchTradingFees',
            'fetchTradingLimits',
            'fetchTransactions',
            'fetchTransfers',
            'fetchWithdrawal',
            'fetchWithdrawals',
            'loadMarkets',
            'setLeverage',
            'setMarginMode',
            'signIn',
            'transfer',
            'withdraw',
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

    log ('Summary:',
        ccxt.exchanges.length.toString (), 'exchanges,',
        implemented.toString ().green, 'methods implemented,',
        emulated.toString ().yellow, 'emulated,',
        missing.toString ().red, 'missing,',
        total.toString (), 'total')

}) ()
