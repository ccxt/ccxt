'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testBorrowRate (exchange, borrowRate, method, code) {

    const msgPrefix = exchange.id + ' ' + method + ' : ';

    const format = {
        'currency': 'USDT',
        'info': {}, // Or []
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'rate': 0.0006, // Interest rate
        // 'period': 86400000,  // Amount of time the interest rate is based on in milliseconds
    };

    const keys = Object.keys (format);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        assert (key in borrowRate, msgPrefix + key + ' is missing from structure');
    }

    // assert (borrowRate['period'] === 86400000 || borrowRate['period'] === 3600000) // Milliseconds in an hour or a day
    assert (borrowRate['rate'] > 0, msgPrefix + ' rate is excepted to be above zero');

    testCommonItems (exchange, method, borrowRate, 'timestamp');
    return borrowRate;
}

module.exports = testBorrowRate;