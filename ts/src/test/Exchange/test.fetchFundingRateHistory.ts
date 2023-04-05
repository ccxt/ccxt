
import assert from 'assert';
import testFundingRateHistory from './test.fundingRateHistory.js';
import testSharedMethods from './test.sharedMethods.js';

async function testFetchFundingRateHistory (exchange, symbol) {
    const method = 'fetchFundingRateHistory';
    const fundingRatesHistory = await exchange.fetchFundingRateHistory (symbol);
    assert (Array.isArray (fundingRatesHistory), exchange.id + ' ' + method + ' ' + symbol + ' must return an array, returned ' + exchange.json (fundingRatesHistory));
    console.log (exchange.id, method, 'fetched', fundingRatesHistory.length, 'entries, asserting each ...');
    for (let i = 0; i < fundingRatesHistory.length; i++) {
        testFundingRateHistory (exchange, method, fundingRatesHistory[i], symbol);
    }
    testSharedMethods.reviseSortedTimestamps (exchange, method, symbol, fundingRatesHistory);
}

export default testFetchFundingRateHistory;
