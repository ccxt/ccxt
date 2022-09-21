'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testOrder (exchange, order, symbol, now) {

    const msgPrefix = exchange.id + ' ' + method + ' : ';

    assert (order);
    assert ('id' in order);
    assert (typeof order['id'] === 'string');
    assert ('clientOrderId' in order);
    assert ((order['clientOrderId'] === undefined) || (typeof order['clientOrderId'] === 'string'));
    assert ('status' in order);
    assert ((order['status'] === 'open') || (order['status'] === 'closed') || (order['status'] === 'canceled'));
    assert ('symbol' in order);
    assert (order['symbol'] === symbol);
    assert ('type' in order);
    assert ((order['type'] === undefined) || (typeof order['type'] === 'string'));
    assert ('timeInForce' in order);
    assert ((order['timeInForce'] === undefined) || (typeof order['timeInForce'] === 'string'));
    assert ('side' in order);
    assert ((order['side'] === 'buy') || (order['side'] === 'sell'));
    assert ('price' in order);
    assert ((order['price'] === undefined) || (typeof order['price'] === 'number'));
    if (order['price'] !== undefined) {
        assert (order['price'] > 0);
    }
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

    testCommonItems (exchange, 'order', order, 'timestamp');
    assert (order['timestamp'] < now);
    assert ('lastTradeTimestamp' in order);
}

module.exports = testOrder;
