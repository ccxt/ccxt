'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testOrder (exchange, order, symbol, now) {
    const method = 'order';
    const format = {
        'info': {},
        'id': '123',
        'clientOrderId': '1234',
        'timestamp': 1649373600000,
        'datetime': '2022-04-07T23:20:00.000Z',
        'lastTradeTimestamp': 1649373610000,
        'symbol': 'XYZ/USDT',
        'type': 'xyz',
        'timeInForce': 'GTC',
        'postOnly': true,
        'side': 'sell',
        'price': exchange.parseNumber ('1.23456'),
        'stopPrice': exchange.parseNumber ('1.1111'),
        'amount': exchange.parseNumber ('1.23'),
        'cost':  exchange.parseNumber ('2.34'),
        'average':  exchange.parseNumber ('1.234'),
        'filled':  exchange.parseNumber ('1.23'),
        'remaining':  exchange.parseNumber ('0.123'),
        'status': 'ok',
        'fee': {},
        'trades': [],
    };
    testCommonItems.testStructureKeys (exchange, method, order, format);
    testCommonItems.testId (exchange, method, order);
    testCommonItems.testCommonTimestamp (exchange, method, order);
    testCommonItems.testInfo (exchange, method, order, 'object');

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (order) + ' >>> ';

    assert (order['timestamp'] < now, 'timestamp must be less than current time' + logText);

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
    assert ('lastTradeTimestamp' in order);
}

module.exports = testOrder;
