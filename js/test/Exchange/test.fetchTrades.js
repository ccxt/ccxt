'use strict'

const assert = require ('assert');
const testTrade = require ('./test.trade.js');

async function testFetchTrades (exchange, symbol) {
    const method = 'fetchTrades';
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
        if (i > 0) {
            if (trades[i].timestamp && trades[i - 1].timestamp) {
                assert (trades[i].timestamp >= trades[i - 1].timestamp, exchange.id + ' ' + symbol + ' trade[' + i + '] timestamp is less than the previous trade timestamp ' + exchange.iso8601(trades[i].timestamp) + ' ' + exchange.iso8601(trades[i - 1].timestamp));
            }
        }
    }
}

module.exports = testFetchTrades;