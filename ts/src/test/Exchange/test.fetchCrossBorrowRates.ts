import { Exchange } from "../../../ccxt";
import testSharedMethods from './base/test.sharedMethods.js';
import testCrossBorrowRate from './base/test.crossBorrowRate.js';

async function testFetchCrossBorrowRates (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchCrossBorrowRates';
    const borrowRates = await exchange.fetchCrossBorrowRates (symbol);
    const codes = Object.keys (borrowRates);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, codes);
    for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        testCrossBorrowRate (exchange, skippedProperties, method, borrowRates[code], symbol);
    }
}

export default testFetchCrossBorrowRates;
