'use strict'

const assert = require ('assert');
const testTransaction = require ('./test.transaction.js');

async function testFetchDeposits (exchange, code) {
    const method = 'fetchDeposits';
    const transactions = await exchange[method] (code);
    assert (Array.isArray(transactions), exchange.id + ' ' + method + ' ' + code + ' must return an array. ' + exchange.json(transactions));
    console.log (exchange.id, method, 'fetched', transactions.length, 'entries, asserting each ...');
    const now = exchange.milliseconds ();
    for (let i = 0; i < transactions.length; i++) {
        testTransaction (exchange, method, transactions[i], code, now);
    }
    testSharedMethods.reviseSortedTimestamps (exchange, method, code, transactions);
}

module.exports = testFetchDeposits;