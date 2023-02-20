'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testBorrowRate (exchange, entry, method, requestedCode) {
    const format = {
        'info': {}, // Or []
        'currency': 'USDT',
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'rate': exchange.parseNumber ('0.0006'), // Interest rate
        // 'period': 86400000, // Amount of time the interest rate is based on in milliseconds
    };
    const emptyNotAllowedFor = [ 'currency', 'rate' ];
    testCommonItems.testStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testCommonItems.testCommonTimestamp (exchange, method, entry);
    testCommonItems.testCyrrencyCode (exchange, method, entry, entry['currency'], requestedCode);
    //
    // assert (borrowRate['period'] === 86400000 || borrowRate['period'] === 3600000) // Milliseconds in an hour or a day
    testCommonItems.Gt (exchange, method, entry, 'rate', '0');
}

module.exports = testBorrowRate;