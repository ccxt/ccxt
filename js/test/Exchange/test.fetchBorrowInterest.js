'use strict'

const assert = require ('assert');
const testBorrowInterest = require ('./test.borrowInterest.js');

async function testFetchBorrowInterest (exchange, code, symbol) {
    const method = 'fetchBorrowInterest';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const borrowInterest = await exchange[method] (code, symbol);
    assert (exchange.isArray (borrowInterest), exchange.id + ' ' + method + ' ' + code + ' must return an array. ' + exchange.json(borrowInterest));
    console.log (exchange.id, method, 'fetched', borrowInterest.length, 'entries, asserting each ...');
    for (let i = 0; i < borrowInterest.length; i++) {
        testBorrowInterest (exchange, method, borrowInterest[i], code, symbol);
    }
}

module.exports = testFetchBorrowInterest;