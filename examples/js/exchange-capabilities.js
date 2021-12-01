"use strict";

/*  ------------------------------------------------------------------------ */

const ccxt        = require ('../../ccxt.js')
    , asTable     = require ('as-table').configure ({ delimiter: ' | ', /* print: require ('string.ify').noPretty  */ })
    , log         = require ('ololog').noLocate
    , ansi        = require ('ansicolor').nice

console.log (ccxt.iso8601 (ccxt.milliseconds ()))
console.log ('CCXT v' + ccxt.version)

;(async function test () {

    let total = 0
    let missing = 0
    let ignored = 0
    let implemented = 0
    let emulated = 0

    log (asTable (ccxt.exchanges.map (id => new ccxt[id]()).map (exchange => {

        let result = {};

        [
            'publicAPI',
            'privateAPI',
            'CORS',
            'fetchCurrencies',
            'fetchFundingFees',
            'fetchFundingRate',
            'fetchFundingRates',
            'fetchFundingRateHistory',
            'fetchIndexOHLCV',
            'fetchMarkOHLCV',
            'fetchMarkets',
            'fetchOHLCV',
            'fetchOrderBook',
            'fetchOrderBooks',
            'fetchStatus',
            'fetchTicker',
            'fetchTickers',
            'fetchTime',
            'fetchTrades',
            'fetchTradingLimits',
            'cancelAllOrders',
            'cancelOrder',
            'cancelOrders',
            'createDepositAddress',
            'createOrder',
            'deposit',
            'editOrder',
            'fetchAccounts',
            'fetchBalance',
            'fetchBorrowRate',
            'fetchBorrowRates',
            'fetchCanceledOrders',
            'fetchClosedOrder',
            'fetchClosedOrders',
            'fetchDeposit',
            'fetchDepositAddress',
            'fetchDepositAddresses',
            'fetchDeposits',
            'fetchFees',
            'fetchFundingFee',
            'fetchFundingHistory',
            'fetchIsolatedPositions',
            'fetchLedger',
            'fetchLedgerEntry',
            'fetchMyTrades',
            'fetchOpenOrder',
            'fetchOpenOrders',
            'fetchOrder',
            'fetchOrderTrades',
            'fetchOrders',
            'fetchPosition',
            'fetchPositions',
            'fetchPremiumIndexOHLCV',
            'fetchTradingFee',
            'fetchTradingFees',
            'fetchTransactions',
            'fetchTransfers',
            'fetchWithdrawal',
            'fetchWithdrawals',
            'setLeverage',
            'setMarginMode',
            'signIn',
            'transfer',
            'withdraw',
        ].forEach (key => {

            total += 1

            let capability = exchange.has[key]

            if (capability === undefined) {
                capability = exchange.id.red
                missing += 1
            } else if (capability === false) {
                capability = exchange.id.red.dim
                ignored += 1
            } else if (capability.toString () === 'emulated') {
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
        ignored.toString ().red.dim, 'ignored,',
        missing.toString ().red, 'missing,',
        total.toString (), 'total'
    )

    log("\nMessy? Try piping to less (e.g. node script.js | less -S -R)\n".red)

}) ()
