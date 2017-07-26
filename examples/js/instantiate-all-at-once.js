"use strict";

const ccxt = require ('../../ccxt');

async function test () {

    let markets = { 
        "bittrex": {
            "apiKey": "60f38a5818934fc08308778f94d3d8c4", 
            "secret": "9d294ddb5b944403b58e5298653720c1",
        },
        "bitfinex": { 
            "apiKey": "02YsRDRAFwqt9JXfFKPIEw82mgmNbZtfpwvt8q5WK5a", 
            "secret": "IummLrCfcZ9d9NPEtMg6chCpO8hugCvsDIscNm1F3pE"
        },
    }

    let ids = ccxt.markets.filter (id => id in markets)

    await Promise.all (ids.map (async id => {

        console.log (markets[id])

        // // instantiate the market
        let market = new ccxt[id] (markets[id])
        console.log (market.id, market.apiKey)
        markets[id] = market

        // load products
        await market.loadProducts ()
        console.log (market.id, 'loaded')

        // check the balance
        if (market.apiKey) {
            let balance = await market.fetchBalance ()
            console.log (market.id, balance)
        }

        return market
    }))

    // when all of them are ready, do your other things
    console.log ('Loaded markets:', ids.join (', '))
}

test ()
