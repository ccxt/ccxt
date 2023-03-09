'use strict'

const assert = require ('assert');
const testSharedMethods = require ('./test.sharedMethods.js');
const testLedgerItem = require ('./test.ledgerItem.js');

async function testFetchLedger (exchange, code) {
    const method = 'fetchLedger';
    const items = await exchange[method] (code);
    assert (Array.isArray (items), exchange.id + ' ' + method + ' ' + symbol + ' must return an array. ' + exchange.json(items));
    const now = exchange.milliseconds ();
    console.log (exchange.id, method, 'fetched', items.length, 'entries, asserting each ...');
    for (let i = 0; i < items.length; i++) {
        testLedgerItem (exchange, method, items[i], code, now);
    }
    testSharedMethods.reviseSortedTimestamps (exchange, method, code, items);
    //
    method = 'fetchLedgerItem'; // todo: create separate testfile
    if (exchange.has[method]) {
        if (items.length >= 1) {
            const item = await exchange[method] (items[0].id);
            testLedgerItem (exchange, method, item, code, now);
        }
    }
}

module.exports = testFetchLedger;