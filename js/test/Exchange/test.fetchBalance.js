'use strict'

const testBalance = require ('./test.balance.js');

async function testFetchBalance(exchange) {
    const method = 'fetchBalance';
    const response = await exchange[method] ();
    testBalance (exchange, response);
    return response;
}

module.exports = testFetchBalance;