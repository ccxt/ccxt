'use strict';

const ccxt = require ('../../../ccxt');

let stop = false

async function shutdown (milliseconds) {
    await ccxt.sleep (10000)
    stop = true
}

async function watchOrderBook (exchangeId, symbol) {

     const exchange = new ccxt.pro[exchangeId] ()
    await exchange.loadMarkets ()
    // exchange.verbose = true
    while (!stop) {
        try {
            const orderbook = await exchange.watchOrderBook (symbol)
            console.log (new Date (), exchange.id, symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (symbol, e)
            stop = true
            break
        }
    }
    await exchange.close ()
}

async function main () {
    const streams = {
        'binance': 'BTC/USDT',
        'ftx': 'BTC/USDT',
    };

    await Promise.all ([
        shutdown (10000),
        ... Object.entries (streams).map (([ exchangeId, symbol ]) => watchOrderBook (exchangeId, symbol))
    ])

}

main()