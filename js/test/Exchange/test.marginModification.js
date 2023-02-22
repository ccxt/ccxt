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
    testSharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.reviseCurrencyCode (exchange, method, entry, entry['code']);
    const logText = testSharedMethods.logTemplate (exchange, method, entry);
    //
    testSharedMethods.Ge (exchange, method, entry, 'amount', '0');
    testSharedMethods.Ge (exchange, method, entry, 'total', '0');
    testSharedMethods.reviseAgainstArray (exchange, method, entry, 'type', [ 'add', 'reduce', 'set' ]);
    testSharedMethods.reviseAgainstArray (exchange, method, entry, 'status', [ 'ok', 'pending', 'canceled', 'failed' ]);
    testSharedMethods.reviseSymbol (exchange, method, entry, 'symbol');
}

module.exports = testMarginModification;
