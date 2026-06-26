import assert from 'assert';
import { Exchange } from "../../../ccxt.js";
import testTransfer from './base/test.transfer.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchTransfers (exchange: Exchange, skippedProperties: object, code: string) {
    const method = 'fetchTransfers';
    const transfers = await exchange.fetchTransfers (code);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, transfers, code);
    for (let i = 0; i < transfers.length; i++) {
        testTransfer (exchange, skippedProperties, method, transfers[i], code);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, code, transfers);
    return true;
}

export default testFetchTransfers;
