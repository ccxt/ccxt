"use strict";

/*  ------------------------------------------------------------------------ */
// node ./examples/js/exchange-capabilities.js --csv

const isCsvStyle  = process.argv.includes ('--csv')
const delimiter   = isCsvStyle ? ',' : '|'
const ccxt        = require ('../../ccxt.js')
    , asTable     = require ('as-table').configure ({ delimiter: ' '+delimiter+' ', /* print: require ('string.ify').noPretty  */ })
    , log         = require ('ololog').noLocate
    , ansi        = require ('ansicolor').nice

console.log (ccxt.iso8601 (ccxt.milliseconds ()))
console.log ('CCXT v' + ccxt.version)
const isWindows = process.platform == 'win32' // fix for windows, as it doesn't show darkred-VS-red well enough

;(async function test () {
    let total = 0
    let notImplemented = 0
    let inexistentApi = 0
    let implemented = 0
    let emulated = 0

    const table = asTable (ccxt.exchanges.map (id => new ccxt[id]()).map (exchange => {

        let result = {};

        [
            'publicAPI',
            'privateAPI',
            'margin',
            'swap',
            'future',
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
                capability = isWindows ? exchange.id.red : exchange.id.red.dim
                notImplemented += 1
            } else if (capability === false) {
                capability = isWindows ? exchange.id.lightMagenta : exchange.id.red 
                inexistentApi += 1
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
    }))

    if (isCsvStyle) {
        let lines = table.split ("\n")	
        lines = lines.slice (0, 1).concat (lines.slice (2))	
        log (lines.join ("\n"))
    } else {
        log(table)
    }

    log ('Summary: ',
        ccxt.exchanges.length.toString (), 'exchanges; ',
        'Methods [' + total.toString () + ' total]: ',
        implemented.toString ().green, 'implemented,',
        emulated.toString ().yellow, 'emulated,',
        (isWindows ? inexistentApi.toString ().lightMagenta : inexistentApi.toString ().red), 'inexistentApi,',
        (isWindows ? notImplemented.toString ().red : notImplemented.toString ().red.dim), 'notImplemented',
    )

    log("\nMessy? Try piping to less (e.g. node script.js | less -S -R)\n".red)

}) ()
