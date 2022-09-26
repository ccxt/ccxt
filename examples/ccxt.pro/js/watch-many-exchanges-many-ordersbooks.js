'use strict';

const ccxt = require ('../../../ccxt');

async function watchOrderBook (exchange, symbol) {
    while (true) {
        try {
            const orderbook = await exchange.watchOrderBook (symbol)
            console.log (new Date (), exchange.id, symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (symbol, e)
        }
    }
}

async function watchExchange (exchangeId, symbols) {
     const exchange = new ccxt.pro[exchangeId] ()
    await exchange.loadMarkets ()
    await Promise.all (symbols.map (symbol => watchOrderBook (exchange, symbol)))
}

async function main () {
    const streams = {
        'binance': [
            'BTC/USDT',
            'ETH/BTC',
        ],
        'ftx': [
            'BTC/USDT',
            'ETH/BTC',
        ],
    };

    const entries = Object.entries (streams)
    await Promise.all (entries.map (([ exchangeId, symbols ]) => watchExchange (exchangeId, symbols)))
}

main()