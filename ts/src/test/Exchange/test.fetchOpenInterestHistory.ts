
import assert from 'assert';
import testOpenInterest from './base/test.openInterest.js';

async function testFetchOpenInterestHistory (exchange, skippedProperties, symbol) {
    const method = 'fetchOpenInterestHistory';
    const openInterestHistory = await exchange.fetchOpenInterestHistory (symbol);
    assert (Array.isArray (openInterestHistory), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (openInterestHistory));
    for (let i = 0; i < openInterestHistory.length; i++) {
        testOpenInterest (exchange, skippedProperties, method, openInterestHistory[i]);
    }
}

export default testFetchOpenInterestHistory;
