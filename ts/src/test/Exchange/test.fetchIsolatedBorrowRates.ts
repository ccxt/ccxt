import { Exchange } from "../../../ccxt";
import testSharedMethods from './base/test.sharedMethods.js';
import testIsolatedBorrowRate from './base/test.isolatedBorrowRate.js';

async function testFetchIsolatedBorrowRates (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchIsolatedBorrowRates';
    const borrowRates = await exchange.fetchIsolatedBorrowRates (symbol);
    const codes = Object.keys (borrowRates);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, codes);
    for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        testIsolatedBorrowRate (exchange, skippedProperties, method, borrowRates[code], symbol);
    }
}

export default testFetchIsolatedBorrowRates;
