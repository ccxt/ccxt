'use strict';

const ccxt = require ('ccxt');

(async () => {

     const exchange = new ccxt.pro.binance ({ enableRateLimit: true })
    const symbols = [ 'BTC/USDT', 'ETH/BTC', 'ETH/USDT' ]

    await Promise.all (symbols.map (symbol =>

        (async () => {

            while (true) {
                try {
                    const orderbook = await exchange.watchOrderBook (symbol)
                    console.log (new Date (), symbol, orderbook['asks'][0], orderbook['bids'][0])
                } catch (e) {
                    console.log (symbol, e)
                    // do nothing and retry on next loop iteration
                    // throw e // uncomment to break all loops in case of an error in any one of them
                    // break // you can also break just this one loop if it fails
                }
            }

        }) ())
    )
}) ()
