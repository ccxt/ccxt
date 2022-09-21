'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testPosition (exchange, position, symbol, now) {

    const msgPrefix = exchange.id + ' ' + method + ' : ';

    assert (position);
    assert ('id' in position);
    assert (position['id'] === undefined || typeof position['id'] === 'string');;
    assert ('symbol' in position);
    assert (symbol === undefined || position['symbol'] === symbol);
    assert ('info' in position);
    assert (position['info']);

    testCommonItems (exchange, 'position', position, 'timestamp');
}

module.exports = testPosition;
