'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js')

function testOpenInterest (exchange, openInterest, method) {

    const format = {
        'symbol': 'BTC/USDT',
        'baseVolume': exchange.parseNumber ('81094.084'),
        'quoteVolume': exchange.parseNumber ('3544581864.598'),
        'timestamp': 1649373600000,
        'datetime': '2022-04-07T23:20:00.000Z',
        'info': {},
    };
    testCommonItems.testStructureKeys (exchange, method, openInterest, format);
    testCommonItems.testCommonTimestamp (exchange, method, openInterest);
    testCommonItems.testInfo (exchange, method, openInterest, 'object');

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (openInterest) + ' >>> ';

    if (openInterest['quoteVolume'] !== undefined) {
        assert (typeof openInterest['quoteVolume'] === 'number');
        assert (openInterest['quoteVolume'] > 0);
    }
    if (openInterest['baseVolume'] !== undefined) {
        assert (typeof openInterest['baseVolume'] === 'number');
        assert (openInterest['baseVolume'] > 0);
    }

    assert ((typeof openInterest['symbol'] === 'string') || (openInterest['symbol'] === undefined), 'symbol is incorrect' + logText);

    return openInterest;
}

module.exports = testOpenInterest;