'use strict'

const testOpenInterest = require('./test.openInterest.js');

async function testFetchOpenInterestHistory (exchange, symbol) {
    const method = 'fetchOpenInterestHistory';
    const openInterestHistory = await exchange[method] (symbol);
    assert (Array.isArray (openInterestHistory), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (openInterestHistory));
    console.log (exchange.id, method, 'fetched', openInterestHistory.length, 'entries, asserting each ...');
    for (let i = 0; i < openInterestHistory.length; i++) {
        testOpenInterest (exchange, method, openInterestHistory[i]);
    }
}

module.exports = testFetchOpenInterestHistory;