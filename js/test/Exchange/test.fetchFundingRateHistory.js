'use strict'

const assert = require ('assert');
const testFundingRateHistory = require ('./test.testFundingRateHistory.js');
const sharedMethods = require ('./test.sharedMethods.js');

async function testFetchFundingRateHistory (exchange, symbol) {
    const method = 'fetchFundingRateHistory';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const fundingRatesHistory = await exchange[method] (symbol);
    assert (Array.isArray (fundingRatesHistory), exchange.id + ' ' + method + ' ' + symbol + ' must return an array, returned ' + exchange.json (fundingRatesHistory));
    console.log (exchange.id, method, 'fetched', fundingRatesHistory.length, 'entries, asserting each ...');
    for (let i = 0; i < fundingRatesHistory.length; i++) {
        testFundingRateHistory (exchange, method, fundingRatesHistory[i], symbol);
    }
    sharedMethods.reviseSortedTimestamps (exchange, method, fundingRatesHistory);
}

module.exports = testFetchFundingRateHistory;