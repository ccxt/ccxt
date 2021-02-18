import numbers  # noqa: E402
try:
    basestring  # basestring was removed in Python 3
except NameError:
    basestring = str


def test_order(exchange, order, symbol, now):
    assert order
    assert 'id' in order
    assert isinstance(order['id'], basestring)
    assert 'clientOrderId' in order
    assert(order['clientOrderId'] is None) or (isinstance(order['clientOrderId'], basestring))
    assert 'timestamp' in order
    assert isinstance(order['timestamp'], numbers.Real)
    assert order['timestamp'] > 1230940800000  # 03 Jan 2009 - first block
    assert order['timestamp'] < now
    assert 'lastTradeTimestamp' in order
    assert 'datetime' in order
    assert order['datetime'] == exchange.iso8601(order['timestamp'])
    assert 'status' in order
    assert(order['status'] == 'open') or (order['status'] == 'closed') or (order['status'] == 'canceled')
    assert 'symbol' in order
    assert order['symbol'] == symbol
    assert 'type' in order
    assert(order['type'] is None) or (isinstance(order['type'], basestring))
    assert 'timeInForce' in order
    assert(order['timeInForce'] is None) or (isinstance(order['timeInForce'], basestring))
    assert 'side' in order
    assert(order['side'] == 'buy') or (order['side'] == 'sell')
    assert 'price' in order
    assert(order['price'] is None) or (isinstance(order['price'], numbers.Real))
    if order['price'] is not None:
        assert order['price'] > 0

    assert 'amount' in order
    assert isinstance(order['amount'], numbers.Real)
    assert order['amount'] >= 0
    assert 'filled' in order
    if order['filled'] is not None:
        assert isinstance(order['filled'], numbers.Real)
        assert(order['filled'] >= 0) and (order['filled'] <= order['amount'])

    assert 'remaining' in order
    if order['remaining'] is not None:
        assert isinstance(order['remaining'], numbers.Real)
        assert(order['remaining'] >= 0) and (order['remaining'] <= order['amount'])

    assert 'trades' in order
    if order['trades']:
        assert isinstance(order['trades'], list)

    assert 'fee' in order
    fee = order['fee']
    if fee:
        assert isinstance(fee['cost'], numbers.Real)
        if fee['cost'] != 0:
            assert isinstance(fee['currency'], basestring)

    assert 'info' in order
    assert order['info']
