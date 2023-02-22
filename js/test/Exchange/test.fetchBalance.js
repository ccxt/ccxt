'use strict'

const testBalance = require ('./test.balance.js');

async function testFetchBalance (exchange, code, symbol) {
    const method = 'fetchBalance';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const response = await exchange[method] ();
    console.log (exchange.id, method, 'fetched, asserting now  ...');
    testBalance (exchange, response);
}

module.exports = testFetchBalance;