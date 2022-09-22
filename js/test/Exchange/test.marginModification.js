'use strict';

const assert = require('assert');
const testCommonItems = require ('./test.commonItems.js');

function testMarginModification (exchange, marginModification) {

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
    testCommonItems.testStructureKeys (exchange, method, marginModification, format);
    testCommonItems.testInfo (exchange, method, marginModification, 'object');

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (marginModification) + ' >>> ';

    if (marginModification['type'] !== undefined) {
        assert ((marginModification['type'] === 'add') || (marginModification['type'] === 'reduce') || (marginModification['type'] === 'set'), 'type must be `add`, `reduce` or `set`' + logText);
    }
    if (marginModification['amount'] !== undefined) {
        assert (typeof marginModification['amount'] === 'number');
    }
    if (marginModification['total'] !== undefined) {
        assert (typeof marginModification['total'] === 'number');
    }
    if (marginModification['code'] !== undefined) {
        assert (typeof marginModification['code'] === 'string');
    }
    if (marginModification['symbol'] !== undefined) {
        assert (typeof marginModification['symbol'] === 'string');
    }
    if (marginModification['status'] !== undefined) {
        assert (exchange.inArray (marginModification['status'], [ 'ok', 'pending', 'canceled', 'failed' ]));
    }
}

module.exports = testMarginModification;
