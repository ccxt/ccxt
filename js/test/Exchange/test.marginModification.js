'use strict';

const testCommonItems = require ('./test.commonItems.js');

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
    testCommonItems.testStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testCommonItems.testCyrrencyCode (exchange, method, entry, entry['code']);
    const logText = testCommonItems.logTemplate (exchange, method, market);
    //
    testCommonItems.Ge (exchange, method, entry, 'amount', '0');
    testCommonItems.Ge (exchange, method, entry, 'total', '0');
    testCommonItems.checkAgainstArray (exchange, method, entry, 'type', [ 'add', 'reduce', 'set' ]);
    testCommonItems.checkAgainstArray (exchange, method, entry, 'status', [ 'ok', 'pending', 'canceled', 'failed' ]);
    testCommonItems.testSymbol (exchange, method, entry, 'symbol');
}

module.exports = testMarginModification;
