'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');
const Precise = require ('../../base/Precise');

function testCurrency (exchange, currency, method) {
    const format = {
        'info': {},
        'id': 'btc', // string literal for referencing within an exchange
        'code': 'BTC', // uppercase string literal of a pair of currencies
        //----------------------------------------------------------------------
        'name': 'Bitcoin', // uppercase string, base currency, 2 or more letters
        'withdraw': true, // can withdraw
        'deposit': true, // can deposit
        // 'active': true, // can both withdraw & deposit
        'precision': exchange.parseNumber ('0.0001'), // in case of SIGNIFICANT_DIGITS it will be 8 - number of digits "after the dot"
        'fee': exchange.parseNumber ('0.001'), //
        'limits': { // value limits when placing orders on this market
            'withdraw':  {
                'min': exchange.parseNumber ('0.01'),
                'max': exchange.parseNumber ('1000'),
            },
            'deposit':  {
                'min': exchange.parseNumber ('0.01'),
                'max': exchange.parseNumber ('1000'),
            },
        },
        //----------------------------------------------------------------------
    };
    const forceValues = [ 'id', 'code', 'info' ];
    testCommonItems.testStructureKeys (exchange, method, currency, format, forceValues);
    const logText = testCommonItems.logTemplate (exchange, method, currency);
    //
    const limits = exchange.safeValue (currency, 'limits', {});
    const withdrawLimits = exchange.safeValue (limits, 'withdraw', {});
    const depositLimits = exchange.safeValue (limits, 'deposit', {});
    const wMin = exchange.safeString (withdrawLimits, 'min');
    const wMax = exchange.safeString (withdrawLimits, 'max');
    const dMin = exchange.safeString (depositLimits, 'min');
    const dMax = exchange.safeString (depositLimits, 'max');
    assert ((wMin === undefined) || Precise.stringGe (wMin, '0'), 'defined withdraw min is excepted to be above zero' + logText);
    assert ((wMax === undefined) || Precise.stringGe (wMax, '0'), 'defined withdraw max is excepted to be above zero' + logText);
    assert ((dMin === undefined) || Precise.stringGe (dMin, '0'), 'defined deposit min is excepted to be above zero' + logText);
    assert ((dMax === undefined) || Precise.stringGe (dMax, '0'), 'defined deposit max is excepted to be above zero' + logText);
    // max should above min
    assert ((wMin === undefined) || (wMax === undefined) || Precise.stringLe (wMin, wMax), 'defined withdraw min is excepted to be below max' + logText);
    assert ((dMin === undefined) || (dMax === undefined) || Precise.stringLe (dMin, dMax), 'defined deposit min is excepted to be below max' + logText);
}

module.exports = testCurrency;
