'use strict';

const assert = require('assert');
const testCommonItems = require ('./test.commonItems.js');

function testMarginModification (exchange, item) {
    const method = 'marginModification';
    const format = {
        'info': {}, // or []
        'type': 'add',
        'amount': exchange.parseNumber ('0.1'),
        'total': exchange.parseNumber ('0.29934828'),
        'code': 'USDT',
        'symbol': 'ADA/USDT:USDT',
        'status': 'ok',
    };
    const forceValues = [ 'type', 'status' ];
    testCommonItems.testStructureKeys (exchange, method, item, format, forceValues);
    const logText = testCommonItems.logTemplate (exchange, method, item);

    if (item['type'] !== undefined) {
        assert ((item['type'] === 'add') || (item['type'] === 'reduce') || (item['type'] === 'set'), '"type" must be `add`, `reduce` or `set`' + logText);
    }
    if (item['status'] !== undefined) {
        assert (exchange.inArray (item['status'], [ 'ok', 'pending', 'canceled', 'failed' ]));
    }
}

module.exports = testMarginModification;
