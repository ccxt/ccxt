'use strict'

const assert = require ('assert');
const testSharedMethods = require ('./test.sharedMethods.js');

function testBorrowInterest (exchange, method, entry, requestedCode, requestedSymbol) {
    const format = {
        'info': {},
        'account': 'BTC/USDT',
        'currency': 'USDT',
        'interest': exchange.parseNumber ('0.1444'),
        'interestRate': exchange.parseNumber ('0.0006'),
        'amountBorrowed': exchange.parseNumber ('30.0'),
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
    };
    const emptyNotAllowedFor = [ 'currency', 'interest', 'interestRate', 'amountBorrowed', 'timestamp' ];
    testSharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.reviseCommonTimestamp (exchange, method, entry);
    testSharedMethods.reviseCurrencyCode (exchange, method, entry, entry['currency'], requestedCode);
    testSharedMethods.reviseSymbol (exchange, method, entry, entry['account'], requestedSymbol);
    testSharedMethods.Gt (exchange, method, entry, 'interest', '0');
    testSharedMethods.Gt (exchange, method, entry, 'interestRate', '0');
    testSharedMethods.Gt (exchange, method, entry, 'amountBorrowed', '0');
}

module.exports = testBorrowInterest;