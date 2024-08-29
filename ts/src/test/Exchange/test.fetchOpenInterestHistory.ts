import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testOpenInterest from './base/test.openInterest.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchOpenInterestHistory (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchOpenInterestHistory';
    const openInterestHistory = await exchange.fetchOpenInterestHistory (symbol);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, openInterestHistory, symbol);
    for (let i = 0; i < openInterestHistory.length; i++) {
        testOpenInterest (exchange, skippedProperties, method, openInterestHistory[i]);
    }
}

export default testFetchOpenInterestHistory;
