'use strict';

const assert = require ('assert');

function testPosition (exchange, position, symbol, now) {
    assert (position);
    assert ('id' in position);
    assert (position['id'] === undefined || typeof position['id'] === 'string');
    assert ('timestamp' in position);
    assert (position['timestamp'] === undefined || typeof position['timestamp'] === 'number');
    assert (position['timestamp'] === undefined || position['timestamp'] > 1230940800000); // 03 Jan 2009 - first cryptocurrency block creation time
    assert (position['timestamp'] === undefined || position['timestamp'] < now);
    assert ('datetime' in position);
    assert (position['datetime'] === exchange.iso8601 (position['timestamp']));
    assert ('symbol' in position);
    assert (symbol === undefined || position['symbol'] === symbol);
    assert ('info' in position);
    assert (position['info']);
}

module.exports = testPosition;
