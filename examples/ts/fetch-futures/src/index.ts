// Example code in typescript
// Based on /examples/js/fetch-okex-futures.js

import * as ccxt from 'ccxt';
const log = require('ololog');

const fetchFutures = async () => {
    const exchange = new ccxt.bitmex();
    exchange.markets = await exchange.loadMarkets(true);

    for (let symbol in exchange.markets) {
        log('----------------------------------------------------');
        log(`symbol = ${symbol}`);
        try {
            const market = exchange.markets[symbol];
            if (market['future']) {
                const ticker = await exchange.fetchTicker(symbol);
                log('----------------------------------------------------');
                log(symbol, ticker);
                await (ccxt as any).sleep(exchange.rateLimit); // Missing type information.
            }
        } catch (error) {
            log('error =', error);
        }
    }
};

fetchFutures();
