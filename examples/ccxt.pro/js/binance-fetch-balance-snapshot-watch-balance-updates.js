'use strict';

const ccxtpro = require ('./ccxt.pro')

console.log ('CCXT Pro Version:', ccxtpro.version)

// This example will run silent and will return your balance only when the balance is updated.
//
// 1. launch the example with your keys and keep it running
// 2. go to the trading section on the website
// 3. place a order on a spot market
// 4. see your balance updated in the example
//
// Warning! This example might produce a lot of output to your screen


async function watchBalance (exchange) {
    let balance = await exchange.fetchBalance ()
    console.log ('---------------------------------------------------------')
    console.log (exchange.iso8601 (exchange.milliseconds ()))
    console.log (balance, '\n')
    while (true) {
        try {
            const update = await exchange.watchBalance ()
            balance = exchange.deep_extend (balance, update)
            // it will print the balance update when the balance changes
            // if the balance remains unchanged the exchange will not send it
            console.log ('---------------------------------------------------------')
            console.log (exchange.iso8601 (exchange.milliseconds ()))
            console.log (balance, '\n')
        } catch (e) {
            console.log (e.constructor.name, e.message)
            break
        }
    }
}


async function main() {

    const exchange = new ccxtpro.binance ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })

    await exchange.loadMarkets () // await here

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    watchBalance (exchange) // no await

    await exchange.close ()
}

main ()
