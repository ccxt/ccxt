import numbers  # noqa: E402
try:
    basestring  # basestring was removed in Python 3
except NameError:
    basestring = str


def test_trade(exchange, trade, symbol, now):
    assert trade
    sampleTrade = {
        'info': {'a': 1, 'b': 2, 'c': 3},    # the original decoded JSON as is
        'id': '12345-67890:09876/54321',       # string trade id
        'timestamp': 1502962946216,            # Unix timestamp in milliseconds
        'datetime': '2017-08-17 12:42:48.000',  # ISO8601 datetime with milliseconds
        'symbol': 'ETH/BTC',                   # symbol
        'order': '12345-67890:09876/54321',    # string order id or None/None/null
        'type': 'limit',                       # order type, 'market', 'limit' or None/None/null
        'side': 'buy',                         # direction of the trade, 'buy' or 'sell'
        'takerOrMaker': 'taker',               # string, 'taker' or 'maker'
        'price': 0.06917684,                   # float price in quote currency
        'amount': 1.5,                         # amount of base currency
        'cost': 0.10376526,                    # total cost(including fees), `price * amount`
    }
    keys = list(sampleTrade.keys())
    for i in range(0, len(keys)):
        key = keys[i]
        assert key in trade

    fee = trade['fee'] if ('fee' in trade) else None
    fees = trade['fees'] if ('fees' in trade) else None
    # logical XOR
    if fee or fees:
        assert not (fee and fees)

    if fee:
        assert('cost' in fee) and ('currency' in fee)

    if fees:
        assert isinstance(fees, list)
        for i in range(0, len(fees)):
            fee = fees[i]
            assert('cost' in fee) and ('currency' in fee)

    id = trade['id']
    assert(id is None) or (isinstance(id, basestring))
    timestamp = trade['timestamp']
    assert isinstance(timestamp, numbers.Real) or timestamp is None
    if timestamp:
        assert timestamp > 1230940800000  # 03 Jan 2009 - first block
        assert timestamp < 2147483648000  # 19 Jan 2038 - int32 overflows
        adjustedNow = now + 60000
        assert timestamp < adjustedNow, 'trade.timestamp is greater than or equal to current time: trade: ' + exchange.iso8601(timestamp) + ' now: ' + exchange.iso8601(now)

    assert trade['datetime'] == exchange.iso8601(timestamp)
    assert trade['symbol'] == symbol, 'trade symbol is not equal to requested symbol: trade: ' + trade['symbol'] + ' requested: ' + symbol
    assert trade['type'] is None or isinstance(trade['type'], basestring)
    assert trade['side'] is None or trade['side'] == 'buy' or trade['side'] == 'sell', 'unexpected trade side ' + trade['side']
    assert trade['order'] is None or isinstance(trade['order'], basestring)
    assert isinstance(trade['price'], numbers.Real), 'trade.price is not a number'
    assert trade['price'] > 0
    assert isinstance(trade['amount'], numbers.Real), 'trade.amount is not a number'
    assert trade['amount'] >= 0
    assert trade['cost'] is None or isinstance(trade['cost'], numbers.Real), 'trade.cost is not a number'
    assert trade['cost'] is None or trade['cost'] >= 0
    takerOrMaker = trade['takerOrMaker']
    assert takerOrMaker is None or takerOrMaker == 'taker' or takerOrMaker == 'maker'
