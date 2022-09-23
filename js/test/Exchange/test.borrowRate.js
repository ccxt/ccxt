'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testBorrowRate (exchange, borrowRate, method, code) {
    const format = {
        'currency': 'USDT',
        'info': {}, // Or []
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'rate': exchange.parseNumber ('0.0006'), // Interest rate
        // 'period': 86400000, // Amount of time the interest rate is based on in milliseconds
    };
    testCommonItems.testStructureKeys (exchange, method, borrowRate, format);
    testCommonItems.testCommonTimestamp (exchange, method, borrowRate);

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (borrowRate) + ' >>> ';

    // assert (borrowRate['period'] === 86400000 || borrowRate['period'] === 3600000) // Milliseconds in an hour or a day
    assert (borrowRate['rate'] > 0, 'rate is excepted to be above zero' + logText);

    return borrowRate;
}

module.exports = testBorrowRate;