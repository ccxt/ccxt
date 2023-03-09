'use strict'

const testBalance = require ('./test.balance.js');

async function testFetchBalance (exchange, code, symbol) {
    const method = 'fetchBalance';
    const response = await exchange[method] ();
    console.log (exchange.id, method, 'fetched, asserting now  ...');
    testBalance (exchange, response);
}

module.exports = testFetchBalance;