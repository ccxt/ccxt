// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';
const log = require('ololog');

const symbol = 'BTC/USD';
const exchanges = ['coinbasepro', 'gemini', 'kraken'];

const fetchTickers = async (symbol: string) => {
    const result = await Promise.all(exchanges.map(async (id: string): Promise<ccxt.Exchange> => {
        const CCXT = ccxt as any; // Hack!
        const exchange = new CCXT[id]({ 'enableRateLimit': true }) as ccxt.Exchange;
        const ticker = await exchange.fetchTicker(symbol);
        const exchangeExtended = exchange.extend({ 'exchange': id }, ticker) as ccxt.Exchange;
        return exchangeExtended;
    }));
    log(result);
};

fetchTickers(symbol);
