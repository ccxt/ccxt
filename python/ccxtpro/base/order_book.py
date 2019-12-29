# -*- coding: utf-8 -*-

from ccxtpro.base import order_book_side
from ccxt import Exchange


class OrderBook(dict):
    def __init__(self, snapshot={}):
        super(OrderBook, self).__init__()
        defaults = {
            'bids': [],
            'asks': [],
            'timestamp': None,
            'datetime': None,
            'nonce': None,
        }
        snapshot['datetime'] = Exchange.iso8601(snapshot.get('timestamp'))
        super(OrderBook, self).update(defaults)
        super(OrderBook, self).update(snapshot)
        if not isinstance(self['asks'], order_book_side.OrderBookSide):
            self['asks'] = order_book_side.Asks(self['asks'])
        if not isinstance(self['bids'], order_book_side.OrderBookSide):
            self['bids'] = order_book_side.Bids(self['bids'])

    def limit(self, n=None):
        self['asks'].limit(n)
        self['bids'].limit(n)
        return self

    def reset(self, snapshot):
        self['asks'].update(snapshot.get('asks', []))
        self['bids'].update(snapshot.get('asks', []))
        self['nonce'] = snapshot.get('nonce')
        self['timestamp'] = snapshot.get('timestamp')
        self['datetime'] = Exchange.iso8601(self['timestamp'])

    def update(self, snapshot):
        nonce = snapshot.get('nonce')
        if nonce is not None and self['nonce'] is not None and nonce < self['nonce']:
            return self
        self.reset(snapshot)


# -----------------------------------------------------------------------------
# some exchanges limit the number of bids/asks in the aggregated orderbook
# orders beyond the limit threshold are not updated with new ws deltas
# those orders should not be returned to the user, they are outdated quickly

class LimitedOrderBook(OrderBook):
    def __init__(self, snapshot={}, depth=None):
        snapshot['asks'] = order_book_side.LimitedAsks(snapshot.get('asks', []), depth)
        snapshot['bids'] = order_book_side.LimitedBids(snapshot.get('bids', []), depth)
        super(LimitedOrderBook, self).__init__(snapshot)

# -----------------------------------------------------------------------------
# overwrites absolute volumes at price levels
# or deletes price levels based on order counts (3rd value in a bidask delta)


class CountedOrderBook(OrderBook):
    def __init__(self, snapshot={}):
        snapshot['asks'] = order_book_side.CountedAsks(snapshot.get('asks', []))
        snapshot['bids'] = order_book_side.CountedBids(snapshot.get('bids', []))
        super(CountedOrderBook, self).__init__(snapshot)

# -----------------------------------------------------------------------------
# indexed by order ids (3rd value in a bidask delta)


class IndexedOrderBook(OrderBook):
    def __init__(self, snapshot={}):
        snapshot['asks'] = order_book_side.IndexedAsks(snapshot.get('asks', []))
        snapshot['bids'] = order_book_side.IndexedBids(snapshot.get('bids', []))
        super(IndexedOrderBook, self).__init__(snapshot)

# -----------------------------------------------------------------------------
# adjusts the volumes by positive or negative relative changes or differences


class IncrementalOrderBook(OrderBook):
    def __init__(self, snapshot={}):
        snapshot['asks'] = order_book_side.IncrementalAsks(snapshot.get('asks', []))
        snapshot['bids'] = order_book_side.IncrementalBids(snapshot.get('bids', []))
        super(IncrementalOrderBook, self).__init__(snapshot)

# -----------------------------------------------------------------------------
# limited and indexed (2 in 1)


class LimitedIndexedOrderBook(OrderBook):
    def __init__(self, snapshot={}, depth=None):
        snapshot['asks'] = order_book_side.LimitedIndexedAsks(snapshot.get('asks', []), depth)
        snapshot['bids'] = order_book_side.LimitedIndexedBids(snapshot.get('bids', []), depth)
        super(LimitedIndexedOrderBook, self).__init__(snapshot)

# -----------------------------------------------------------------------------
# incremental and indexed (2 in 1)


class IncrementalIndexedOrderBook(OrderBook):
    def __init__(self, snapshot={}):
        snapshot['asks'] = order_book_side.IncrementalIndexedAsks(snapshot.get('asks', []))
        snapshot['bids'] = order_book_side.IncrementalIndexedBids(snapshot.get('bids', []))
        super(IncrementalIndexedOrderBook, self).__init__(snapshot)
