'use strict';

const assert = require ('assert');

function testPosition (exchange, position, symbol, now) {
    assert (position);
    assert ('id' in position);
    assert (typeof position['id'] === 'string');
    assert ('timestamp' in position);
    assert (typeof position['timestamp'] === 'number');
    assert (position['timestamp'] > 1230940800000); // 03 Jan 2009 - first block
    assert (position['timestamp'] < now);
    assert ('datetime' in position);
    assert (position['datetime'] === exchange.iso8601 (position['timestamp']));
    assert ('symbol' in position);
    assert (position['symbol'] === symbol);
    assert ('info' in position);
    assert (position['info']);
}

module.exports = testPosition;
