
import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';
import testLedgerItem from './base/test.ledgerItem.js';

async function testFetchLedger (exchange, code) {
    const method = 'fetchLedger';
    const items = await exchange.fetchLedger (code);
    assert (Array.isArray (items), exchange.id + ' ' + method + ' ' + code + ' must return an array. ' + exchange.json (items));
    const now = exchange.milliseconds ();
    for (let i = 0; i < items.length; i++) {
        testLedgerItem (exchange, method, items[i], code, now);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, code, items);
    //
    const itemMethod = 'fetchLedgerItem'; // todo: create separate testfile
    if (exchange.has[itemMethod]) {
        if (items.length >= 1) {
            const item = await exchange.fetchLedgerItem (items[0].id);
            testLedgerItem (exchange, itemMethod, item, code, now);
        }
    }
}

export default testFetchLedger;
