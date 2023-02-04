# -*- coding: utf-8 -*-

__all__ = ['test_order_book']


def test_order_book(exchange, orderbook, method, symbol):
    # todo add real order book tests here
    print(
        exchange.id,
        symbol,
        method,
        orderbook['nonce'] if orderbook['nonce'] else orderbook['datetime'],
        len(orderbook['bids']), 'bids', str(orderbook['bids'][0] if len(orderbook['bids']) else 'N/A'),
        len(orderbook['asks']), 'asks', str(orderbook['asks'][0] if len(orderbook['asks']) else 'N/A'))

    keys = [
        'bids',
        'asks',
        'timestamp',
        'datetime',
        'nonce',
    ]

    for key in keys:
        assert key in orderbook

    if orderbook['timestamp'] is not None:
        assert orderbook['timestamp'] > 1230940800000  # 03 Jan 2009 - first block
        assert orderbook['timestamp'] < 2147483648000  # 19 Jan 2038 - int32 overflows

    asks = orderbook['asks']
    bids = orderbook['bids']

    for i in range(0, len(asks)):
        ask = asks[i]
        assert isinstance(ask[0], (int, float)), 'ask[0] is expected to be a float or int, ' + type(ask[0]) + ' given'
        assert isinstance(ask[1], (int, float)), 'ask[1] is expected to be a float or int, ' + type(ask[1]) + ' given'
        if len(asks) > (i + 1):
            assert asks[i][0] <= asks[i + 1][0]

    for i in range(0, len(bids)):
        bid = bids[i]
        assert isinstance(bid[0], (int, float)), 'bid[0] is expected to be a float or int, ' + type(bid[0]) + ' given'
        assert isinstance(bid[1], (int, float)), 'bid[0] is expected to be a float or int, ' + type(bid[1]) + ' given'
        if len(bids) > (i + 1):
            assert bids[i][0] >= bids[i + 1][0]

    if len(bids) and len(asks):
        assert bids[0][0] < asks[0][0], 'bids[0] {} >= asks[0] {}'.format(bids[0], asks[0])
