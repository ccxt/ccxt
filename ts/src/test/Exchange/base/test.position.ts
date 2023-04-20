
import testSharedMethods from './test.sharedMethods.js';

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
    testSharedMethods.assertStructure (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertTimestamp (exchange, method, entry, now);
    testSharedMethods.assertSymbol (exchange, method, entry, 'symbol', symbol);
    testSharedMethods.assertInArray (exchange, method, entry, 'side', [ 'long', 'short' ]);
    testSharedMethods.assertInArray (exchange, method, entry, 'marginMode', [ 'cross', 'isolated' ]);
    testSharedMethods.assertGreater (exchange, method, entry, 'leverage', '0');
    testSharedMethods.assertLessOrEqual (exchange, method, entry, 'leverage', '200');
    testSharedMethods.assertGreater (exchange, method, entry, 'initialMargin', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'initialMarginPercentage', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'maintenanceMargin', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'maintenanceMarginPercentage', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'entryPrice', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'notional', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'contracts', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'contractSize', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'marginRatio', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'liquidationPrice', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'markPrice', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'collateral', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'percentage', '0');
}

export default testPosition;
