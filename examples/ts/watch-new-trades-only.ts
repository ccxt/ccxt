
'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member

async function watchExchange (exchangeId, symbol) {
    const exchange = new ccxt.pro[exchangeId] ({ // eslint-disable-line import/no-named-as-default-member
        'newUpdates': true,
    });

    await exchange.loadMarkets ();

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    while (true) { // eslint-disable-line no-constant-condition
        try {
            const trades = await exchange.watchTrades (symbol);
            for (let i = 0; i < trades.length; i++) {
                const trade = trades[i];
                console.log (exchange.iso8601 (exchange.milliseconds ()), exchange.id, trade['symbol'], trade['id'], trade['datetime'], trade['price'], trade['amount']);
            }
        } catch (e) {
            console.log (symbol, e);
        }
    }
}

async function main () {
    const streams = {
        'binance': 'BTC/USDT',
        'okex': 'BTC/USDT',
        'kraken': 'BTC/USD',
    };

    const values = Object.entries (streams);
    const promises = values.map (([ exchangeId, symbol ]) => watchExchange (exchangeId, symbol));
    await Promise.all (promises);
}

main ();
