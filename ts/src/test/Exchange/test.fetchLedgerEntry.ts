import { Exchange } from "../../../ccxt";
import testLedgerEntry from './base/test.ledgerEntry.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchLedgerEntry (exchange: Exchange, skippedProperties: object, code: string) {
    const method = 'fetchLedgerEntry';
    const items = await exchange.fetchLedger (code);
    const length = items.length;
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, items, code);
    if (length > 0) {
        const firstItem = items[0];
        const id = firstItem["id"];
        const item = await exchange.fetchLedgerEntry (id);
        const now = exchange.milliseconds ();
        testLedgerEntry (exchange, skippedProperties, method, item, code, now);
    }
}

export default testFetchLedgerEntry;
