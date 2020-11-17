'use strict';

const assert = require ('assert');

function testOrder (exchange, order, symbol, now) {
    assert (order);
    assert ('id' in order);
    assert (typeof order['id'] === 'string');
    assert ('timestamp' in order);
    assert (typeof order['timestamp'] === 'number');
    assert (order['timestamp'] > 1230940800000); // 03 Jan 2009 - first block
    assert (order['timestamp'] < now);
    assert ('lastTradeTimestamp' in order);
    assert ('datetime' in order);
    assert (order['datetime'] === exchange.iso8601 (order['timestamp']));
    assert ('status' in order);
    assert ((order['status'] === 'open') || (order['status'] === 'closed') || (order['status'] === 'canceled'));
    assert ('symbol' in order);
    assert (order['symbol'] === symbol);
    assert ('type' in order);
    assert (typeof order['type'] === 'string');
    assert ('side' in order);
    assert ((order['side'] === 'buy') || (order['side'] === 'sell'));
    assert ('price' in order);
    assert (typeof order['price'] === 'number');
    assert (order['price'] > 0);
    assert ('amount' in order);
    assert (typeof order['amount'] === 'number');
    assert (order['amount'] >= 0);
    assert ('filled' in order);
    if (order['filled'] !== undefined) {
        assert (typeof order['filled'] === 'number');
        assert ((order['filled'] >= 0) && (order['filled'] <= order['amount']));
    }
    assert ('remaining' in order);
    if (order['remaining'] !== undefined) {
        assert (typeof order['remaining'] === 'number');
        assert ((order['remaining'] >= 0) && (order['remaining'] <= order['amount']));
    }
    assert ('trades' in order);
    if (order['trades']) {
        assert (Array.isArray (order['trades']));
    }
    assert ('fee' in order);
    const fee = order['fee'];
    if (fee) {
        assert (typeof fee['cost'] === 'number');
        if (fee['cost'] !== 0) {
            assert (typeof fee['currency'] === 'string');
        }
    }
    assert ('info' in order);
    assert (order['info']);
}

module.exports = testOrder;
