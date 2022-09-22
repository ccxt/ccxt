'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js')

function testOpenInterest (exchange, openInterest, method) {

    const msgPrefix = exchange.id + ' ' + method + ' : ';

    const format = {
        'symbol': 'BTC/USDT',
        'baseVolume': 81094.084,
        'quoteVolume': 3544581864.598,
        'timestamp': 1649373600000,
        'datetime': '2022-04-07T23:20:00.000Z',
        'info': {},
    };
    const keys = Object.keys (format);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        assert ((key in openInterest), msgPrefix + key + ' is missing from structure.');
    }

    if (openInterest['quoteVolume'] !== undefined) {
        assert (typeof openInterest['quoteVolume'] === 'number');
        assert (openInterest['quoteVolume'] > 0);
    }
    if (openInterest['baseVolume'] !== undefined) {
        assert (typeof openInterest['baseVolume'] === 'number');
        assert (openInterest['baseVolume'] > 0);
    }

    assert (typeof openInterest['symbol'] === 'string' || openInterest['symbol'] === undefined);

    testCommonItems.testCommonTimestamp (exchange, method, openInterest);
    return openInterest;
}

module.exports = testOpenInterest;