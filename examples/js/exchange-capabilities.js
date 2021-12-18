"use strict";

const csv       = process.argv.includes ('--csv')
    , delimiter = csv ? ',' : '|'
    , ccxt      = require ('../../ccxt.js')
    , asTable   = require ('as-table').configure ({ delimiter: ' ' + delimiter + ' ', /* print: require ('string.ify').noPretty  */ })
    , log       = require ('ololog').noLocate
    , ansi      = require ('ansicolor').nice

console.log (ccxt.iso8601 (ccxt.milliseconds ()))
console.log ('CCXT v' + ccxt.version)
const isWindows = process.platform == 'win32' // fix for windows, as it doesn't show darkred-VS-red well enough

async function main () {

    let total = 0
    let notImplemented = 0
    let inexistentApi = 0
    let implemented = 0
    let emulated = 0

    const exchanges = ccxt.exchanges.map (id => new ccxt[id] ())
    const metainfo = ccxt.flatten (exchanges.map (exchange => Object.keys (exchange.has)))
    const reduced = metainfo.reduce ((p, c) => {
        p[c] = (p[c] || 0) + 1
        return p
    }, {})
    console.log (reduced);
    process.exit ();
    const methods = ccxt.unique (ccxt.flatten (metainfo));
    console.log (methods);
    process.exit ();

    const table = asTable (exchanges.map (exchange => {

        let result = {};

        let exchangeDefinedMethods = [];
        let exchangeClassName = exchange.id;
        while (exchangeClassName !== 'Exchange') {
            let protoType = ccxt[exchangeClassName];
            if (protoType) {
                let methodNamesArray = Object.getOwnPropertyNames (protoType.prototype);
                exchangeDefinedMethods = exchangeDefinedMethods.concat( methodNamesArray);
                exchangeClassName = Object.getPrototypeOf( (new protoType()).constructor).name;
            } else {
                break;
            }
        }

        const apiBasics = [
            'publicAPI',
            'privateAPI',
            'CORS',
            'margin',
            'swap',
            'future',
            'CORS',
        ];
        const allItems = apiBasics.concat([
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
            'fetchBidsAsks',
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
            'createReduceOnlyOrder',
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
            'fetchMyDustTrades',
            'fetchWithdrawal',
            'fetchWithdrawals',
            'futuresTransfer',
            'loadTimeDifference',
            'addMargin',
            'reduceMargin',
            'setLeverage',
            'setMarginMode',
            'setPositionMode',
            'signIn',
            'transfer',
            'withdraw',
        ]);

        allItems.forEach (methodName => {

            total += 1

            let isApiBasics=apiBasics.includes(methodName)
            let capType = typeof exchange[methodName]
            let capHas  = exchange.has[methodName]
            let coloredString = '';

            if ( capHas === false && capType !== 'function' ) { // if explicitly set to 'false' under 'has' params (to exclude mistake, we check if it's undefined too)
                coloredString = isWindows ? exchange.id.lightMagenta : exchange.id.red
                inexistentApi += 1
            } else if ( capHas === 'emulated') { // if explicitly set to 'emulated' under 'has' params
                coloredString = exchange.id.yellow
                emulated += 1
            } else if ( (isApiBasics && capHas) || ( !isApiBasics && capType === 'function' && exchangeDefinedMethods.includes(methodName) ) ) { // if neither 'false' nor 'emulated', and if  method exists
                coloredString = exchange.id.green
                implemented += 1
            } else {
                coloredString = isWindows ? exchange.id.red : exchange.id.red.dim
                notImplemented += 1
            }

            result[methodName] = coloredString
        })

        return result
    }))

    if (csv) {
        let lines = table.split ("\n")
        lines = lines.slice (0, 1).concat (lines.slice (2))
        log (lines.join ("\n"))
    } else {
        log (table)
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

}

main ()
