"use strict";

const ccxt = require ('../../ccxt.js')

console.log ('CCXT Version:', ccxt.version)

async function fetchAllBalances (exchange) {
    const params = {}
    let balance = {}
    while (true) {
        const response = await exchange.fetchBalance (params)
        balance = exchange.extend (balance, response)
        const info = exchange.safeValue (response, 'info', {})
        const pagination = exchange.safeValue (info, 'pagination', {})
        const startingAfter = exchange.safeString (pagination, 'next_starting_after')
        if (startingAfter !== undefined) {
            params['starting_after'] = startingAfter
        } else {
            break
        }
    }
    return balance
}

async function main () {
    const exchange = new ccxt.coinbase ({
        apiKey: 'YOUR_API_KEY',
        secret: 'YOUR_API_SECRET',
    })
    const markets = await exchange.loadMarkets ()
    // coinbase.verbose = true // uncomment for debugging purposes if necessary
    const balance = await fetchAllBalances (exchange)
    console.log (balance)
}

main ()