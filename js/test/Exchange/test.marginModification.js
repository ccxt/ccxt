'use strict';

const testSharedMethods = require ('./test.sharedMethods.js');

function testMarginModification (exchange, method, entry) {
    const format = {
        'info': {}, // or []
        'type': 'add',
        'amount': exchange.parseNumber ('0.1'),
        'total': exchange.parseNumber ('0.29934828'),
        'code': 'USDT',
        'symbol': 'ADA/USDT:USDT',
        'status': 'ok',
    };
    const emptyNotAllowedFor = [ 'type', 'status' ];
    testSharedMethods.assertStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertCurrencyCode (exchange, method, entry, entry['code']);
    //
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'amount', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'total', '0');
    testSharedMethods.reviseAgainstArray (exchange, method, entry, 'type', [ 'add', 'reduce', 'set' ]);
    testSharedMethods.reviseAgainstArray (exchange, method, entry, 'status', [ 'ok', 'pending', 'canceled', 'failed' ]);
    testSharedMethods.assertSymbol (exchange, method, entry, 'symbol');
}

module.exports = testMarginModification;
