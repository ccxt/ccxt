'use strict'

const testTicker = require ('./test.ticker.js');

async function testFetchTicker (exchange, symbol) {
    const method = 'fetchTicker';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const ticker = await exchange[method] (symbol);
    console.log (exchange.id, method, 'fetched succesfully, asserting now.');
    testTicker (exchange, method, ticker, symbol);
}

module.exports = testFetchTicker;