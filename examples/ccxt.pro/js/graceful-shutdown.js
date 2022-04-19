'use strict';

const ccxtpro = require ('./ccxt.pro');

async function shutdown (exchange, seconds) {
    try {
        await exchange.sleep (seconds)
        await exchange.close ()
    } catch (e) {
    }
}

async function watchOrderBook (exchangeId, symbol) {

    const exchange = new ccxtpro[exchangeId] ()
    await exchange.loadMarkets ()
    exchange.verbose = true
    shutdown (exchange, 10)
    while (true) {
        try {
            const orderbook = await exchange.watchOrderBook (symbol)
            console.log (new Date (), exchange.id, symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (symbol, e)
        }
    }
}

async function main () {
    const streams = {
        'binance': 'BTC/USDT',
        'ftx': 'BTC/USDT',
    };

    await Promise.all (Object.entries (streams).map (([ exchangeId, symbol ]) => watchOrderBook (exchangeId, symbol)))
}

main()