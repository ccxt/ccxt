
import assert from 'assert';
import testSharedMethods from './test.sharedMethods.js';
import testTransaction from './test.transaction.js';

async function testFetchTransactions (exchange, code) {
    const method = 'fetchTransactions';
    const transactions = await exchange.fetchTransactions (code);
    assert (Array.isArray (transactions), exchange.id + ' ' + method + ' ' + code + ' must return an array. ' + exchange.json (transactions));
    console.log (exchange.id, method, 'fetched', transactions.length, 'entries, asserting each ...');
    const now = exchange.milliseconds ();
    for (let i = 0; i < transactions.length; i++) {
        testTransaction (exchange, method, transactions[i], code, now);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, code, transactions);
}

export default testFetchTransactions;
