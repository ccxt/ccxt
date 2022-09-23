'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testPosition (exchange, position, symbol, now) {
    const method = 'position';
    const format = {
        'info': {}, // or []
        'symbol': 'XYZ/USDT',
        'timestamp': 1504224000000,
        'datetime': '2017-09-01T00:00:00',
        'initialMargin': exchange.parseNumber ('1.234'),
        'initialMarginPercentage': exchange.parseNumber ('0.123'),
        'maintenanceMargin': exchange.parseNumber ('1.234'),
        'maintenanceMarginPercentage': exchange.parseNumber ('0.123'),
        'entryPrice': exchange.parseNumber ('1.234'),
        'notional': exchange.parseNumber ('1.234'),
        'leverage': exchange.parseNumber ('1.234'),
        'unrealizedPnl': exchange.parseNumber ('1.234'),
        'contracts': exchange.parseNumber ('1'),
        'contractSize': exchange.parseNumber ('1.234'),
        'marginRatio': exchange.parseNumber ('1.234'),
        'liquidationPrice': exchange.parseNumber ('1.234'),
        'markPrice': exchange.parseNumber ('1.234'),
        'collateral': exchange.parseNumber ('1.234'),
        'marginMode': 'cross',
        'side': 'long',
        'percentage': exchange.parseNumber ('1.234'),
    };
    testCommonItems.testStructureKeys (exchange, method, position, format);
    testCommonItems.testId (exchange, method, position);
    testCommonItems.testCommonTimestamp (exchange, method, position);

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (position) + ' >>> ';

    assert (('symbol' in position), 'symbol is missing' + logText);
    assert ((symbol === undefined) || (position['symbol'] === symbol), 'symbol does not match; expected ' + symbol + ', got ' + position['symbol'] + logText);
}

module.exports = testPosition;
