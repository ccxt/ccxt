// ----------------------------------------------------------------------------

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code
// EDIT THE CORRESPONDENT .ts FILE INSTEAD

import testFundingRateHistory from './base/test.fundingRateHistory.js';
import testSharedMethods from './base/test.sharedMethods.js';
async function testFetchFundingRateHistory(exchange, skippedProperties, symbol) {
    const method = 'fetchFundingRateHistory';
    const fundingRatesHistory = await exchange.fetchFundingRateHistory(symbol);
    testSharedMethods.assertNonEmtpyArray(exchange, skippedProperties, method, fundingRatesHistory, symbol);
    for (let i = 0; i < fundingRatesHistory.length; i++) {
        testFundingRateHistory(exchange, skippedProperties, method, fundingRatesHistory[i], symbol);
    }
    testSharedMethods.assertTimestampOrder(exchange, method, symbol, fundingRatesHistory);
    return true;
}
export default testFetchFundingRateHistory;
