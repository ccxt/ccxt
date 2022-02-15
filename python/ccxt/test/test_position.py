import numbers  # noqa: E402
try:
    basestring  # basestring was removed in Python 3
except NameError:
    basestring = str


def test_position(exchange, position, symbol, now):
    assert position
    assert 'id' in position
    assert position['id'] is None or isinstance(position['id'], basestring)
    assert 'timestamp' in position
    assert isinstance(position['timestamp'], numbers.Real)
    assert position['timestamp'] > 1230940800000  # 03 Jan 2009 - first cryptocurrency block creation time
    assert position['timestamp'] < now
    assert 'datetime' in position
    assert position['datetime'] == exchange.iso8601(position['timestamp'])
    assert 'symbol' in position
    assert symbol is None or position['symbol'] == symbol
    assert 'info' in position
    assert position['info']
