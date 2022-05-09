"use strict";

const ccxt = require ('../../ccxt.js')

async function main () {

    console.log ('CCXT Version:', ccxt.version)

    const exchange = new ccxt.bitrue ({
        "apiKey": "YOUR_API_KEY",
        "secret": "YOUR_SECRET",
    })

    await exchange.loadMarkets ()

    exchange.verbose = true

    try {

        const balance = await exchange.fetchBalance ()
        console.log (balance)

    } catch (e) {
        console.log (e.constructor.name, e.message);
    }
}

main ()
