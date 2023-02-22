'use strict'

const assert = require ('assert');
const testTrade = require ('./test.trade.js');
const sharedMethods = require ('./test.sharedMethods.js');

async function testFetchMyTrades (exchange, symbol) {
    const method = 'fetchMyTrades';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const trades = await exchange[method] (symbol);
    assert (Array.isArray(trades), exchange.id + ' ' + method + ' ' + symbol + ' must return an array. ' + exchange.json(trades));
    console.log (exchange.id, symbol, 'fetched', trades.length, 'trades');
    const now = exchange.milliseconds ();
    for (let i = 0; i < trades.length; i++) {
        testTrade (exchange, method, trades[i], symbol, now);
    }
    sharedMethods.reviseSortedTimestamps (exchange, method, trades);
}

module.exports = testFetchMyTrades;