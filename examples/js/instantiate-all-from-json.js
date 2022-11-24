"use strict";

const ccxt     = require ('../../ccxt')
    , settings = require ('./credentials.json')

async function test () {

    const ids = ccxt.exchanges.filter (id => id in settings)

    const exchanges = ccxt.indexBy (await Promise.all (ids.map (async id => {

        // instantiate the exchange
        let exchange = new ccxt[id] (settings[id])

        // load markets
        await exchange.loadMarkets ()

        // check the balance
        if (exchange.apiKey) {
            let balance = await exchange.fetchBalance ()
            console.log (exchange.id, balance['free'])
        }

        return exchange
    })), 'id')

    // when all of them are ready, do your other things
    console.log ('Loaded exchanges:', Object.keys (exchanges).join (', '))
}

test ()
