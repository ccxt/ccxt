'use strict';

const ccxtpro = require ('./ccxt.pro');

(async () => {

    const streams = {
        'binance': 'BTC/USDT',
        'okex': 'BTC/USDT'
    };

    await Promise.all (Object.keys (streams).map (exchangeId =>

        (async () => {

            const exchange = new ccxtpro[exchangeId] ({
                enableRateLimit: true,
                options: {
                    tradesLimit: 100, // lower = better, 1000 by default
                },
            })
            const symbol = streams[exchangeId]
            let lastId = ''
            while (true) {
                console.log ('---')
                try {
                    const trades = await exchange.watchTrades (symbol)
                    for (let i = 0; i < trades.length; i++) {
                        const trade = trades[i]
                        if (trade['id'] > lastId) {
                            console.log (exchange.iso8601 (exchange.milliseconds ()), exchange.id, trade['symbol'], trade['id'], trade['datetime'], trade['price'], trade['amount'])
                            lastId = trade['id']
                        }
                    }
                } catch (e) {
                    console.log (symbol, e)
                }
            }

        }) ())
    )
}) ()
