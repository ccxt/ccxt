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
        self['datetime'] = Exchange.iso8601 (timestamp)


x = OrderBook()

x.update(10, 1000, [[4, 5], [6, 7]], [[8, 9], [10, 11]])
x.limit()

print(x)