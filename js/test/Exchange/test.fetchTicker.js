'use strict'

const testTicker = require ('./test.ticker.js');

async function testFetchTicker (exchange, symbol) {
    const method = 'fetchTicker';
    const ticker = await exchange[method] (symbol);
    console.log (exchange.id, method, 'fetched succesfully, asserting now ...');
    testTicker (exchange, method, ticker, symbol);
}

module.exports = testFetchTicker;