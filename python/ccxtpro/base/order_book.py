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
        defaults.update(snapshot)
        super(OrderBook, self).update(defaults)
        if not isinstance(self['asks'], order_book_side.OrderBookSide):
            self['asks'] = order_book_side.Asks(self['asks'])
        if not isinstance(self['bids'], order_book_side.OrderBookSide):
            self['bids'] = order_book_side.Bids(self['bids'])

    def limit(self, n=None):
        self['asks'].limit(n)
        self['bids'].limit(n)
        return self

    def update(self, nonce, timestamp, asks, bids):
        if nonce is not None and self['nonce'] is not None \
                and nonce < self['nonce']:
            return self
        self['asks'].update(asks)
        self['bids'].update(bids)
        self['nonce'] = nonce
        self['timestamp'] = timestamp
        self['datetime'] = Exchange.iso8601(timestamp)


# -----------------------------------------------------------------------------
# some exchanges limit the number of bids/asks in the aggregated orderbook
# orders beyond the limit threshold are not updated with new ws deltas
# those orders should not be returned to the user, they are outdated quickly

class LimitedOrderBook(OrderBook):
    def __init__(self, snapshot={}, depth=None):
        snapshot['asks'] = order_book_side.LimitedAsks(snapshot['asks'] or [])
        snapshot['bids'] = order_book_side.LimitedBids(snapshot['bids'] or [])
        super(LimitedOrderBook, self).__init__(snapshot)

# -----------------------------------------------------------------------------
# overwrites absolute volumes at price levels
# or deletes price levels based on order counts (3rd value in a bidask delta)


class CountedOrderBook(OrderBook):
    def __init__(self, snapshot={}, depth=None):
        snapshot['asks'] = order_book_side.CountedAsks(snapshot['asks'] or [])
        snapshot['bids'] = order_book_side.CountedBids(snapshot['bids'] or [])
        super(CountedOrderBook, self).__init__(snapshot)

# -----------------------------------------------------------------------------
# indexed by order ids (3rd value in a bidask delta)


class IndexedOrderBook(OrderBook):
    def __init__(self, snapshot={}, depth=None):
        snapshot['asks'] = order_book_side.IndexedAsks(snapshot['asks'] or [])
        snapshot['bids'] = order_book_side.IndexedBids(snapshot['bids'] or [])
        super(IndexedOrderBook, self).__init__(snapshot)

# -----------------------------------------------------------------------------
# adjusts the volumes by positive or negative relative changes or differences


class IncrementalOrderBook(OrderBook):
    def __init__(self, snapshot={}, depth=None):
        snapshot['asks'] = order_book_side.IncrementalAsks(snapshot['asks'] or [])
        snapshot['bids'] = order_book_side.IncrementalBids(snapshot['bids'] or [])
        super(IncrementalOrderBook, self).__init__(snapshot)

# -----------------------------------------------------------------------------
# limited and indexed (2 in 1)


class LimitedIndexedOrderBook(OrderBook):
    def __init__(self, snapshot={}, depth=None):
        snapshot['asks'] = order_book_side.LimitedIndexedAsks(snapshot['asks'] or [])
        snapshot['bids'] = order_book_side.LimitedIndexedBids(snapshot['bids'] or [])
        super(LimitedIndexedOrderBook, self).__init__(snapshot)

# -----------------------------------------------------------------------------
# incremental and indexed (2 in 1)


class IncrementalIndexedOrderBook(OrderBook):
    def __init__(self, snapshot={}, depth=None):
        snapshot['asks'] = order_book_side.IncrementalIndexedAsks(snapshot['asks'] or [])
        snapshot['bids'] = order_book_side.IncrementalIndexedBids(snapshot['bids'] or [])
        super(IncrementalIndexedOrderBook, self).__init__(snapshot)


x = OrderBook()

x.update(10, 1000, [[4, 5], [6, 7], [8, 9], [10, 11]], [[8, 9], [10, 11]])
x.limit(3)
print(x['asks'])
