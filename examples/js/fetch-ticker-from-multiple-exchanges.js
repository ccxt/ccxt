"use strict";

const ccxt = require ('../../ccxt.js')

;(async () => {

    const exchanges = [
        'bittrex',
        'poloniex',
    ]

    const symbol = 'BTC/USDT'
    const tickers = {}

    await Promise.all (exchanges.map (exchangeId =>

        new Promise (async (resolve, reject) => {

            const exchange = new ccxt[exchangeId] ({ enableRateLimit: true })

            while (true) {

                const ticker = await exchange.fetchTicker (symbol)
                tickers[exchangeId] = ticker

                Object.keys (tickers).map (exchangeId => {
                    const ticker = tickers[exchangeId]
                    console.log (ticker['datetime'], exchangeId, ticker['bid'], ticker['ask'])
                })
            }

        })

    ))

}) ()