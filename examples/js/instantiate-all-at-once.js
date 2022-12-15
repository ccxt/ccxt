"use strict";

const ccxt = require ('../../ccxt')

async function test () {

    let exchanges = { 
        "bittrex": {
            "apiKey": "YOUR_API_KEY", 
            "secret": "YOUR_SECRET",
        },
        "bitfinex": { 
            "apiKey": "YOUR_API_KEY", 
            "secret": "YOUR_SECRET"
        },
    }

    let ids = ccxt.exchanges.filter (id => id in exchanges)

    await Promise.all (ids.map (async id => {

        console.log (exchanges[id])

        // instantiate the exchange
        let exchange = new ccxt[id] (exchanges[id])
        console.log (exchange.id, exchange.apiKey)
        exchanges[id] = exchange

        // load markets
        await exchange.loadMarkets ()
        console.log (exchange.id, 'loaded')

        // check the balance
        if (exchange.apiKey) {
            let balance = await exchange.fetchBalance ()
            console.log (exchange.id, balance)
        }

        return exchange
    }))

    // when all of them are ready, do your other things
    console.log ('Loaded exchanges:', ids.join (', '))
}

test ()
