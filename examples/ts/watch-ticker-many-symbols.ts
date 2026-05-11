'use strict';

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version);


async function main () {
    const exchange = new ccxt.pro.binance ();
    await exchange.loadMarkets ();
    const targetSymbols = [ 'BTC/USDT', 'ETH/USDT', 'BNB/USDT' ]; //
    if (exchange.has['watchTickers']) {
        // all symbols
        while (true) {
            try {
                const tickers = await exchange.watchTickers (targetSymbols);
                for (const symbol in tickers) { // eslint-disable-line
                    console.log (symbol, tickers[symbol]['datetime'], tickers[symbol]['last']);
                }
            } catch (e) {
                console.log ('watchTickers error', e);
            }
        }
    } else if (exchange.has['watchTicker']) {
        for (const symbol of targetSymbols) { // eslint-disable-line no-restricted-syntax
            loopSingleTicker (exchange, symbol);
        }
    } else {
        console.log (exchange.id, 'does not support watchTicker/s yet');
    }
}

async function loopSingleTicker (exchange, symbol) {
    while (true) {
        try {
            const ticker = await exchange.watchTicker (symbol);
            console.log (symbol, ticker['datetime'], ticker['last']);
        } catch (e) {
            console.log ('watchTicker error', e);
        }
    }
}

main ();
