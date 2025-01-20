import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testBorrowInterest from './base/test.borrowInterest.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchBorrowInterest (exchange: Exchange, skippedProperties: object, code: string, symbol: string) {
    const method = 'fetchBorrowInterest';
    const borrowInterest = await exchange.fetchBorrowInterest (code, symbol);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, borrowInterest, code);
    for (let i = 0; i < borrowInterest.length; i++) {
        testBorrowInterest (exchange, skippedProperties, method, borrowInterest[i], code, symbol);
    }
    return true;
}

export default testFetchBorrowInterest;
