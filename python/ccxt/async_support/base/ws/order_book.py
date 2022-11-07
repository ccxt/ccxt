# -*- coding: utf-8 -*-

from ccxt.pro.base import order_book_side
from ccxt import Exchange
import sys


class OrderBook(dict):
    def __init__(self, snapshot={}, depth=None):
        self.cache = []
        depth = depth or sys.maxsize
        defaults = {
            'bids': [],
            'asks': [],
            'timestamp': None,
            'datetime': None,
            'nonce': None,
            'symbol': None,
        }
        # do not mutate snapshot
        defaults.update(snapshot)
        if not isinstance(defaults['asks'], order_book_side.OrderBookSide):
            defaults['asks'] = order_book_side.Asks(defaults['asks'], depth)
        if not isinstance(defaults['bids'], order_book_side.OrderBookSide):
            defaults['bids'] = order_book_side.Bids(defaults['bids'], depth)
        defaults['datetime'] = Exchange.iso8601(defaults.get('timestamp'))
        # merge to self
        super(OrderBook, self).__init__(defaults)

    def limit(self, n=None):
        self['asks'].limit(n)
        self['bids'].limit(n)
        return self

    def reset(self, snapshot={}):
        self['asks']._index.clear()
        self['asks'].clear()
        for ask in snapshot.get('asks', []):
            self['asks'].storeArray(ask)
        self['bids']._index.clear()
        self['bids'].clear()
        for bid in snapshot.get('bids', []):
            self['bids'].storeArray(bid)
        self['nonce'] = snapshot.get('nonce')
        self['timestamp'] = snapshot.get('timestamp')
        self['datetime'] = Exchange.iso8601(self['timestamp'])
        self['symbol'] = snapshot.get('symbol')

    def update(self, snapshot):
        nonce = snapshot.get('nonce')
        if nonce is not None and self['nonce'] is not None and nonce < self['nonce']:
            return self
        self.reset(snapshot)

# -----------------------------------------------------------------------------
# overwrites absolute volumes at price levels
# or deletes price levels based on order counts (3rd value in a bidask delta)


class CountedOrderBook(OrderBook):
    def __init__(self, snapshot={}, depth=None):
        copy = Exchange.extend(snapshot, {
            'asks': order_book_side.CountedAsks(snapshot.get('asks', []), depth),
            'bids': order_book_side.CountedBids(snapshot.get('bids', []), depth),
        })
        super(CountedOrderBook, self).__init__(copy, depth)

# -----------------------------------------------------------------------------
# indexed by order ids (3rd value in a bidask delta)


class IndexedOrderBook(OrderBook):
    def __init__(self, snapshot={}, depth=None):
        copy = Exchange.extend(snapshot, {
            'asks': order_book_side.IndexedAsks(snapshot.get('asks', []), depth),
            'bids': order_book_side.IndexedBids(snapshot.get('bids', []), depth),
        })
        super(IndexedOrderBook, self).__init__(copy, depth)
