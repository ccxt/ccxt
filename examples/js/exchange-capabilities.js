"use strict";

// example:   
//      node ./examples/js/exchange-capabilities.js --csv --combined

const isCsvStyle  = process.argv.includes ('--csv')
const separationFlag = process.argv.includes ('--combined')
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
    let __DIVISOR__ = "__DIVISOR__:"

    let commonEndpoints = { 'common': [
        'publicAPI',
        'privateAPI',
        'CORS',
        __DIVISOR__+'EXCHANGE-RELATED',
        'fetchCurrencies',
        'fetchMarkets',
        'fetchOHLCV',
        'fetchOrderBook',
        'fetchStatus',
        'fetchTicker',
        'fetchTickers',
        'fetchTime',
        'fetchTrades',
        __DIVISOR__+'TRADING-RELATED',
        'fetchTradingFees',
        'fetchTransactions',
        'setLeverage',
        'setMarginMode',
        __DIVISOR__+'WALET-RELATED',
        'createDepositAddress',
        'fetchDeposits',
        'fetchDepositAddress',
        'fetchWithdrawals',
        'fetchBalance',
        'transfer',
        'withdraw',
        __DIVISOR__+'ORDER-RELATED',
        'createOrder',
        'editOrder',
        'cancelOrder',
        'fetchOrder',
        'fetchOrders',
        'fetchOpenOrders',
        'fetchClosedOrders',
        'fetchOrderTrades',
        'fetchMyTrades',
        'cancelAllOrders',
        'fetchPositions',
    ]};
    let uncommonEndpoints = { 'uncommon': [
        __DIVISOR__+'EXCHANGE-RELATED',
        'fetchIndexOHLCV',
        'fetchPremiumIndexOHLCV',
        'fetchMarkOHLCV',
        'fetchOrderBooks',
        __DIVISOR__+'TRADING-RELATED',
        'fetchTradingFee',
        'fetchTradingLimits',
        'fetchFundingRate',
        'fetchFundingRates',
        'fetchFundingFee',
        'fetchFundingFees',
        'fetchFundingHistory',
        'fetchFundingRateHistory',
        'fetchBorrowRate',
        'fetchBorrowRates',
        __DIVISOR__+'ORDER-RELATED',
        'fetchOpenOrder',
        'fetchClosedOrder',
        'cancelOrders',
        'fetchCanceledOrders',
        'fetchPosition',
        'fetchIsolatedPositions',
        __DIVISOR__+'WALLET-RELATED',
        'fetchAccounts',
        'fetchDeposit',
        'fetchDepositAddresses',
        'fetchWithdrawal',
        'fetchTransfers',
        'fetchLedger',
        'fetchLedgerEntry',
        'signIn',
        'deposit',
    ]};
    
    let finalEndpoints = separationFlag ? [ {"all": commonEndpoints['common'].concat(uncommonEndpoints['uncommon']) } ] : [ commonEndpoints , uncommonEndpoints ]; 

    for (const endpointGroup of finalEndpoints)
    {
        let title = Object.keys(endpointGroup)[0];
        let values = endpointGroup[ title];
        log ("\n"+'* Printing Table: '+title+ "\n")

        const table = asTable (ccxt.exchanges.map (id => new ccxt[id]()).map (exchange => {

            let result = {};
            values.forEach (key => {
                
                //skip headers
                if (key.includes (__DIVISOR__)){
                    key =  (key.replace(__DIVISOR__,'')+'>>>').darkGray;
                    result[key] = ''
                    return;
                }

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
