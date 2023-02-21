'use strict'

const assert = require ('assert');
const testTransaction = require ('./test.transaction.js');

async function testFetchTransactions (exchange, code) {
    const method = 'fetchTransactions';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const transactions = await exchange[method] (code);
    console.log ('fetched', transactions.length, 'transactions, asserting each...');
    assert (Array.isArray (transactions));
    const now = Date.now ();
    for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        testTransaction (exchange, method, transaction, code, now);
    }
}

module.exports = testFetchTransactions;