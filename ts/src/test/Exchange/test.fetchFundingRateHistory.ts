import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testFundingRateHistory from './base/test.fundingRateHistory.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchFundingRateHistory (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchFundingRateHistory';
    const fundingRatesHistory = await exchange.fetchFundingRateHistory (symbol);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, fundingRatesHistory, symbol);
    for (let i = 0; i < fundingRatesHistory.length; i++) {
        testFundingRateHistory (exchange, skippedProperties, method, fundingRatesHistory[i], symbol);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, symbol, fundingRatesHistory);
    return true;
}

export default testFetchFundingRateHistory;
