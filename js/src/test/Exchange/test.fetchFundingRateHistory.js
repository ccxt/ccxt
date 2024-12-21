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
}
export default testFetchFundingRateHistory;
