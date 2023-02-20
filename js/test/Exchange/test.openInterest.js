'use strict'

const sharedMethods = require ('./test.commonItems.js')

function testOpenInterest (exchange, method, entry) {
    const format = {
        'symbol': 'BTC/USDT',
        'baseVolume': exchange.parseNumber ('81094.084'),
        'quoteVolume': exchange.parseNumber ('3544581864.598'),
        'timestamp': 1649373600000,
        'datetime': '2022-04-07T23:20:00.000Z',
        'info': {},
    };
    const emptyNotAllowedFor = [ 'baseVolume' ];
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    sharedMethods.reviseSymbol (exchange, method, entry, 'symbol');
    sharedMethods.reviseCommonTimestamp (exchange, method, entry);
    //
    sharedMethods.Gt (exchange, method, entry, 'quoteVolume', '0');
    sharedMethods.Gt (exchange, method, entry, 'baseVolume', '0');
}

module.exports = testOpenInterest;