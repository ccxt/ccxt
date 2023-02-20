'use strict'

const testCommonItems = require ('./test.commonItems.js')

function testOpenInterest (exchange, method, entry) {
    const format = {
        'symbol': 'BTC/USDT',
        'baseVolume': exchange.parseNumber ('81094.084'),
        'quoteVolume': exchange.parseNumber ('3544581864.598'),
        'timestamp': 1649373600000,
        'datetime': '2022-04-07T23:20:00.000Z',
        'info': {},
    };
    const emptyNotAllowedFor = [ 'baseVolume', 'info' ];
    testCommonItems.testStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testCommonItems.testSymbol (exchange, method, entry, 'symbol');
    testCommonItems.testCommonTimestamp (exchange, method, entry);
    //
    testCommonItems.Gt (exchange, method, entry, 'quoteVolume', '0');
    testCommonItems.Gt (exchange, method, entry, 'baseVolume', '0');
}

module.exports = testOpenInterest;