"use strict";

const ccxt = require ('../../ccxt')

console.log ('CCXT Version:', ccxt.version)

// https://github.com/ccxt/ccxt/issues/10179

async function main () {

    const exchange = new ccxt.okex ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'password': 'YOUR_PASSWORD',
        'options': {
            'fetchClosedOrders': {
                'method': 'privateGetTradeOrdersHistoryArchive'
            }
        }
    })

    const markets = await exchange.loadMarkets ()

    exchange.verbose = true

    const orders = await exchange.fetchClosedOrders ()
    console.log (orders)

}

main ()