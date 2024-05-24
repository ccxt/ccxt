import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testLedgerEntry from './base/test.ledgerEntry.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchLedger (exchange: Exchange, skippedProperties: object, code: string) {
    const method = 'fetchLedger';
    const items = await exchange.fetchLedger (code);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, items, code);
    const now = exchange.milliseconds ();
    for (let i = 0; i < items.length; i++) {
        testLedgerEntry (exchange, skippedProperties, method, items[i], code, now);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, code, items);
}

export default testFetchLedger;
