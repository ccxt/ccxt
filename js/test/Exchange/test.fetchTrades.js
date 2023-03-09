'use strict'

const assert = require ('assert');
const testTrade = require ('./test.trade.js');
const testSharedMethods = require ('./test.sharedMethods.js');

async function testFetchTrades (exchange, symbol) {
    const method = 'fetchTrades';
    const trades = await exchange[method] (symbol);
    assert (Array.isArray(trades), exchange.id + ' ' + method + ' ' + symbol + ' must return an array. ' + exchange.json(trades));
    console.log (exchange.id, symbol, 'fetched', trades.length, 'trades');
    const now = exchange.milliseconds ();
    for (let i = 0; i < trades.length; i++) {
        testTrade (exchange, method, trades[i], symbol, now);
    }
    testSharedMethods.reviseSortedTimestamps (exchange, method, symbol, trades);
}

module.exports = testFetchTrades;