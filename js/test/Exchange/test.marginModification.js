'use strict';

const sharedMethods = require ('./test.commonItems.js');

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
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    sharedMethods.reviseCurrencyCode (exchange, method, entry, entry['code']);
    const logText = sharedMethods.logTemplate (exchange, method, market);
    //
    sharedMethods.Ge (exchange, method, entry, 'amount', '0');
    sharedMethods.Ge (exchange, method, entry, 'total', '0');
    sharedMethods.reviseAgainstArray (exchange, method, entry, 'type', [ 'add', 'reduce', 'set' ]);
    sharedMethods.reviseAgainstArray (exchange, method, entry, 'status', [ 'ok', 'pending', 'canceled', 'failed' ]);
    sharedMethods.reviseSymbol (exchange, method, entry, 'symbol');
}

module.exports = testMarginModification;
