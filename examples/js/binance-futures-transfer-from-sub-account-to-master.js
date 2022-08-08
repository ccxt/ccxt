"use strict";

const ccxt = require ('../../ccxt')

console.log ('CCXT Version:', ccxt.version)

// https://github.com/ccxt/ccxt/issues/10181

async function main () {

    const exchange = new ccxt.binance ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })

    const markets = await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging purposes

    const fromEmail = 'sender@example.com' // edit for your values
        , toEmail = 'receiver@example.com' // edit for your values
        , code = 'USDT' // edit for your values
        , amount = 100 // edit for your values
        , futuresType = 1 // 1 for USDT-margined futures，2 for coin-margined futures

    const currency = exchange.currency (code);

    const response = await exchange.sapiPostSubAccountFuturesInternalTransfer ({
        'fromEmail': fromEmail, // sender email
        'toEmail': toEmail, // recipient email
        'futuresType': futuresType, // 1 for USDT-margined futures，2 for coin-margined futures
        'asset': currency['id'],
        'amount': exchange.currencyToPrecision (code, amount),
    })

    console.log (response)

}

main ()

