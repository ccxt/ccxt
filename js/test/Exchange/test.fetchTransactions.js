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
    console.log (exchange.id, method, 'fetched', transactions.length, 'transactions, asserting each...');
    assert (Array.isArray (transactions), exchange.id + ' ' + method + ' must return an array of transactions');
    const now = exchange.milliseconds ();
    for (let i = 0; i < transactions.length; i++) {
        testTransaction (exchange, method, transactions[i], code, now);
    }
}

module.exports = testFetchTransactions;