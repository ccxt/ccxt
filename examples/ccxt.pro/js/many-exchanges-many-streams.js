'use strict';

const ccxt = require ('../../../ccxt');

(async () => {

    const streams = {
        'binance': 'BTC/USDT',
        'bittrex': 'BTC/USDT',
        'poloniex': 'BTC/USDT',
        'bitfinex': 'BTC/USDT',
        'hitbtc': 'BTC/USDT',
        'upbit': 'BTC/USDT',
        'coinbasepro': 'BTC/USD',
        'ftx': 'BTC/USDT',
        'okex': 'BTC/USDT',
        'gateio': 'BTC/USDT',
    };

    await Promise.all (Object.keys (streams).map (exchangeId =>

        (async () => {

             const exchange = new ccxt.pro[exchangeId] ({ enableRateLimit: true })
            const symbol = streams[exchangeId]
            while (true) {
                try {
                    const orderbook = await exchange.watchOrderBook (symbol)
                    console.log (new Date (), exchange.id, symbol, orderbook['asks'][0], orderbook['bids'][0])
                } catch (e) {
                    console.log (symbol, e)
                }
            }

        }) ())
    )
}) ()
