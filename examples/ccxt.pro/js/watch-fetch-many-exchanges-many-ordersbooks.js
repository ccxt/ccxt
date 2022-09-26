'use strict';

const ccxt = require ('../../../ccxt');

async function watchOrderBook (exchange, symbol) {
    while (true) {
        try {
            const method = exchange.has.watchOrderBook ? 'watchOrderBook' : 'fetchOrderBook'
            const orderbook = await exchange[method](symbol)
            console.log (new Date (), exchange.id, symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (symbol, e)
            process.exit ()
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
        'ftx': [
            'BTC/USDT',
            'ETH/BTC',
        ],
        'coinex': [
            'BTC/USDT',
            'ETH/BTC',
        ],
    };

    const entries = Object.entries (streams)
    await Promise.all (entries.map (([ exchangeId, symbols ]) => watchExchange (exchangeId, symbols)))
}

main()