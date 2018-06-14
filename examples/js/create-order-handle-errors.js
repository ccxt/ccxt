"use strict";

// ----------------------------------------------------------------------------

const ccxt = require ('../../ccxt.js')

// ----------------------------------------------------------------------------

;(async () => {

    const exchange = new ccxt.bittrex ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET_KEY',
        'verbose': false, // set to true to see more debugging output
        'timeout': 60000,
        'enableRateLimit': true, // add this
    })

    // try to load markets first, retry on request timeouts until it succeeds:

    while (true) {

        try {

            await exchange.loadMarkets ();
            break;

        } catch (e) {

            if (e instanceof ccxt.RequestTimeout)
                console.log (exchange.iso8601 (Date.now ()), e.constructor.name, e.message)
        }
    }

    const symbol = 'ETH/BTC'
    const orderType = 'limit'
    const side = 'sell'
    const amount = 0.321;
    const price = 0.123;

    // try just one attempt to create an order

    try {

        const response = await exchange.createOrder (symbol, orderType, side, amount, price);
        console.log (response);
        console.log ('Succeeded');

    } catch (e) {

        console.log (exchange.iso8601 (Date.now ()), e.constructor.name, e.message)
        console.log ('Failed');

    }

}) ()
