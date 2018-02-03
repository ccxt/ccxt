"use strict";

const ccxt = require ('../../ccxt')

async function test () {

    let exchanges = { 
        "bittrex": {
            "apiKey": "60f38a5818934fc08308778f94d3d8c4", 
            "secret": "9d294ddb5b944403b58e5298653720c1",
        },
        "bitfinex": { 
            "apiKey": "02YsRDRAFwqt9JXfFKPIEw82mgmNbZtfpwvt8q5WK5a", 
            "secret": "IummLrCfcZ9d9NPEtMg6chCpO8hugCvsDIscNm1F3pE"
        },
    }

    let ids = ccxt.exchanges.filter (id => id in exchanges)

    await Promise.all (ids.map (async id => {

        console.log (exchanges[id])

        // // instantiate the exchange
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
