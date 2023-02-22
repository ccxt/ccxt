'use strict';

const testSharedMethods = require ('./test.sharedMethods.js');

function testPosition (exchange, method, entry, symbol, now) {
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
    const emptyNotAllowedFor = [ 'symbol', 'entryPrice', 'side', 'markPrice', 'contracts', 'contractSize', 'marginMode' ];
    testSharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.reviseCommonTimestamp (exchange, method, entry, now);
    testSharedMethods.reviseSymbol (exchange, method, entry, 'symbol', symbol);
    testSharedMethods.reviseAgainstArray (exchange, method, entry, 'side', [ 'long', 'short' ]);
    testSharedMethods.reviseAgainstArray (exchange, method, entry, 'marginMode', [ 'cross', 'isolated' ]);
    testSharedMethods.Gt (exchange, method, entry, 'leverage', '0');
    testSharedMethods.Le (exchange, method, entry, 'leverage', '200');
    testSharedMethods.Gt (exchange, method, entry, 'initialMargin', '0');
    testSharedMethods.Gt (exchange, method, entry, 'initialMarginPercentage', '0');
    testSharedMethods.Gt (exchange, method, entry, 'maintenanceMargin', '0');
    testSharedMethods.Gt (exchange, method, entry, 'maintenanceMarginPercentage', '0');
    testSharedMethods.Gt (exchange, method, entry, 'entryPrice', '0');
    testSharedMethods.Gt (exchange, method, entry, 'notional', '0');
    testSharedMethods.Gt (exchange, method, entry, 'contracts', '0');
    testSharedMethods.Gt (exchange, method, entry, 'contractSize', '0');
    testSharedMethods.Gt (exchange, method, entry, 'marginRatio', '0');
    testSharedMethods.Gt (exchange, method, entry, 'liquidationPrice', '0');
    testSharedMethods.Gt (exchange, method, entry, 'markPrice', '0');
    testSharedMethods.Gt (exchange, method, entry, 'collateral', '0');
    testSharedMethods.Ge (exchange, method, entry, 'percentage', '0');
}

module.exports = testPosition;
