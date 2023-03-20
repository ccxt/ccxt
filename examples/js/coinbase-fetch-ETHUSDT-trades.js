"use strict";

const ccxt = require('../../ccxt.js')

console.log('CCXT Version:', ccxt.version)

async function main() {
    const exchange = new ccxt.coinbase({
        apiKey: 'YOU API KEY',
        secret: 'YOUR SECRET KEY',
    })
    const markets = await exchange.loadMarkets()
    // coinbase.verbose = true // uncomment for debugging purposes if necessary
    const trades = await exchange.fetchMyTrades('ETH/USDT')
    console.log(trades)
}

main()