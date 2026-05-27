- [Many Exchanges Many Streams](./examples/ts/)


 ```javascript
 'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member

async function eachRun (exchangeId, symbol) {
    const exchange = new ccxt.pro[exchangeId] ({ 'enableRateLimit': true }); // eslint-disable-line import/no-named-as-default-member
    while (true) { // eslint-disable-line no-constant-condition
        try {
            const orderbook = await exchange.watchOrderBook (symbol);
            console.log (new Date (), exchange.id, symbol, orderbook['asks'][0], orderbook['bids'][0]);
        } catch (e) {
            console.log (symbol, e);
        }
    }
}

async function main () {
    const streams = {
        'binance': 'BTC/USDT',
        'bittrex': 'BTC/USDT',
        'poloniex': 'BTC/USDT',
        'bitfinex': 'BTC/USDT',
        'hitbtc': 'BTC/USDT',
        'upbit': 'BTC/USDT',
        'coinbasepro': 'BTC/USD',
        'okx': 'BTC/USDT',
        'okex': 'BTC/USDT',
        'gateio': 'BTC/USDT',
    };

    await Promise.all (Object.keys (streams).map ((exchangeId) => eachRun (exchangeId, streams[exchangeId])));
}

main ();
 
```