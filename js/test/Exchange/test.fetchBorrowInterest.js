'use strict'

const assert = require ('assert');
const testBorrowInterest = require ('./test.borrowInterest.js');

async function testFetchBorrowInterest (exchange, code, symbol) {
    const method = 'fetchBorrowInterest';
    const borrowInterest = await exchange[method] (code, symbol);
    assert (Array.isArray (borrowInterest), exchange.id + ' ' + method + ' ' + code + ' must return an array. ' + exchange.json(borrowInterest));
    console.log (exchange.id, method, 'fetched', borrowInterest.length, 'entries, asserting each ...');
    for (let i = 0; i < borrowInterest.length; i++) {
        testBorrowInterest (exchange, method, borrowInterest[i], code, symbol);
    }
}

module.exports = testFetchBorrowInterest;