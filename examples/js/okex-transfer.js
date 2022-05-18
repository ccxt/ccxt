"use strict";

const ccxt = require ('../../ccxt.js')

console.log ('CCXT version:', ccxt.version)
console.log ('This example requires CCXT version 1.54.92 or higher')

async function main () {

    const exchange = new ccxt.okex ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'password': 'YOUR_API_KEY_PASSWORD',
    })

    await exchange.loadMarkets ()

    const code = 'USDT'
    let tradingBalance = await exchange.fetchFreeBalance (/* { 'type': 'trading' } */)
    let fundingBalance = await exchange.fetchFreeBalance ({ 'type': 'funding' })
    console.log ('Trading:', tradingBalance[code], code)
    console.log ('Funding:', fundingBalance[code], code)

    const oldVerboseMode = exchange.verbose
    exchange.verbose = process.argv.includes ('--verbose') || process.argv.includes ('-v')

    // https://www.okex.com/docs-v5/en/#rest-api-funding-funds-transfer
    //
    //     'spot' == '1'
    //     'futures' == '3',
    //     'margin' == '5',
    //     'swap' == '9',
    //     'option' == '12',
    //     'trading' == '18', // unified trading account
    //     'unified' == '18',
    //
    const from = 'trading'
    const to = 'funding'
    const amount = 1
    const transfer = await exchange.transfer (code, amount, from, to)
    console.log (transfer)

    exchange.verbose = oldVerboseMode

    tradingBalance = await exchange.fetchFreeBalance (/* { 'type': 'spot' } */)
    fundingBalance = await exchange.fetchFreeBalance ({ 'type': 'funding' })
    console.log ('Trading:', tradingBalance[code], code)
    console.log ('Funding:', fundingBalance[code], code)
}

main ()