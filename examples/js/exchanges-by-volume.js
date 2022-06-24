"use strict";

const ccxt = require ('../../ccxt.js')

;(async () => {

    //     const exchanges = [
    //         'bittrex',
    //         'poloniex',
    //         'bitfinex'
    //     ]

    const exchanges = ccxt.exchanges

    const symbol = 'BTC/USDT'
    const tickers = {}
    const volumeField = 'baseVolume'

    console.log ('-----------------------------------------------------------')

    await Promise.all (exchanges.map (exchangeId =>

        new Promise (async (resolve, reject) => {

            try {

                const exchange = new ccxt[exchangeId] ()

                const ticker = await exchange.fetchTicker (symbol)

                if (ticker[volumeField] !== undefined) {
                    tickers[exchangeId] = ticker
                }

            } catch (e) {

                console.log (exchangeId, e.message.slice (0, 100))
            }

            resolve ()

        })

    ))

    console.log ('-----------------------------------------------------------')

    console.log (Object
        .keys (tickers)
        .sort ((a, b) =>
            ((tickers[a][volumeField] > tickers[b][volumeField]) ? 1 : ((tickers[a][volumeField] < tickers[b][volumeField]) ? -1 : 0)))
        .reverse ()
        .map (id => ({
            id,
            symbol,
            'volume': tickers[id][volumeField],
        }))
    )

}) ()