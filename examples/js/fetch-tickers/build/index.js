"use strict";
// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js
Object.defineProperty(exports, "__esModule", { value: true });
const ccxt = require("ccxt");
const log = require('ololog');
const symbol = 'BTC/USD';
const exchanges = ['coinbasepro', 'gemini', 'kraken'];
const fetchTickers = async (symbol) => {
    const result = await Promise.all(exchanges.map(async (id) => {
        const CCXT = ccxt; // Hack!
        const exchange = new CCXT[id]({ 'enableRateLimit': true });
        const ticker = await exchange.fetchTicker(symbol);
        const exchangeExtended = exchange.extend({ 'exchange': id }, ticker);
        return exchangeExtended;
    }));
    log(result);
};
fetchTickers(symbol);
