
import testLedgerEntry from './base/test.ledgerEntry.js';

async function testFetchLedgerEntry (exchange, skippedProperties, code) {
    const method = 'fetchLedgerEntry';
    const items = await exchange.fetchLedger (code);
    const length = items.length;
    if (length > 0) {
        const firstItem = items[0];
        const id = firstItem["id"];
        const item = await exchange.fetchLedgerEntry (id);
        const now = exchange.milliseconds ();
        testLedgerEntry (exchange, skippedProperties, method, item, code, now);
    }
}

export default testFetchLedgerEntry;
