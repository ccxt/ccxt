# -*- coding: utf-8 -*-

import operator

LIMIT_BY_KEY = 0
LIMIT_BY_VALUE_PRICE_KEY = 1
LIMIT_BY_VALUE_INDEX_KEY = 2


class OrderBookSide(list):
    side = None  # set to True for bids and False for asks
    # sorted(..., reverse=self.side)

    def __init__(self, deltas=[], depth=None, limit_type=LIMIT_BY_KEY):
        # allocate memory for the list here (it will not be resized...)
        super(OrderBookSide, self).__init__()
        self._depth = depth or float('inf')
        self._limit_type = limit_type
        self._index = {}
        for delta in deltas:
            self.storeArray(list(delta))

    def storeArray(self, delta):
        price = delta[0]
        size = delta[1]
        if size:
            self._index[price] = size
        else:
            if price in self._index:
                del self._index[price]

    def store(self, price, size):
        if size:
            self._index[price] = size
        else:
            if price in self._index:
                del self._index[price]

    def limit(self, n=None):
        n = n or float('inf')
        first_element = operator.itemgetter(0)
        iterator = self._index.values() if self._limit_type else self._index.items()
        generator = (list(t) for t in iterator)  # lazy evaluation
        array = sorted(generator, key=first_element, reverse=self.side)
        threshold = int(min(self._depth, len(array)))
        self.clear()
        self._index.clear()
        for i in range(threshold):
            delta = array[i]
            price = delta[0]
            size = delta[1]
            if self._limit_type:
                last = delta[2]
                if self._limit_type == LIMIT_BY_VALUE_PRICE_KEY:
                    self._index[price] = delta
                else:
                    self._index[last] = delta
            else:
                self._index[price] = size
            if i < n:
                self.append(delta)
        return self

# -----------------------------------------------------------------------------
# overwrites absolute volumes at price levels
# or deletes price levels based on order counts (3rd value in a bidask delta)
# this class stores vector arrays of values indexed by price


class CountedOrderBookSide(OrderBookSide):
    def __init__(self, deltas=[], depth=None):
        super(CountedOrderBookSide, self).__init__(deltas, depth, LIMIT_BY_VALUE_PRICE_KEY)

    def store(self, price, size, count):
        if count and size:
            self._index[price] = [price, size, count]
        else:
            if price in self._index:
                del self._index[price]

    def storeArray(self, delta):
        price, size, count = delta
        if count and size:
            self._index[price] = delta
        else:
            if price in self._index:
                del self._index[price]


# -----------------------------------------------------------------------------
# indexed by order ids (3rd value in a bidask delta)


class IndexedOrderBookSide(OrderBookSide):
    def __init__(self, deltas=[], depth=None):
        super(IndexedOrderBookSide, self).__init__(deltas, depth, LIMIT_BY_VALUE_INDEX_KEY)

    def store(self, price, size, order_id):
        if size:
            stored = self._index.get(order_id)
            if stored:
                stored[0] = price or stored[0]
                stored[1] = size
                return
            self._index[order_id] = [price, size, order_id]
        else:
            if order_id in self._index:
                del self._index[order_id]

    def storeArray(self, delta):
        price, size, order_id = delta
        if size:
            stored = self._index.get(order_id)
            if stored:
                stored[0] = price or stored[0]
                stored[1] = size
                return
            self._index[order_id] = delta
        else:
            if order_id in self._index:
                del self._index[order_id]

# -----------------------------------------------------------------------------
# adjusts the volumes by positive or negative relative changes or differences


class IncrementalOrderBookSide(OrderBookSide):
    def __init__(self, deltas=[], depth=None):
        super(IncrementalOrderBookSide, self).__init__(deltas, depth, LIMIT_BY_KEY)

    def store(self, price, size):
        size = self._index.get(price, 0) + size
        if size <= 0:
            if price in self._index:
                del self._index[price]
        else:
            self._index[price] = size

    def storeArray(self, delta):
        price, size = delta
        size = self._index.get(price, 0) + size
        if size <= 0:
            if price in self._index:
                del self._index[price]
        else:
            self._index[price] = size

# -----------------------------------------------------------------------------
# incremental and indexed (2 in 1)


class IncrementalIndexedOrderBookSide(IndexedOrderBookSide):
    def store(self, price, size, order_id):
        if size:
            stored = self._index.get(order_id)
            if stored:
                if size + stored[1] >= 0:
                    stored[0] = price or stored[0]
                    stored[1] = size + stored[1]
                    return
            self._index[order_id] = [price, size, order_id]
        else:
            if order_id in self._index:
                del self._index[order_id]

    def storeArray(self, delta):
        price, size, order_id = delta
        if size:
            stored = self._index.get(order_id)
            if stored:
                if size + stored[1] >= 0:
                    stored[0] = price or stored[0]
                    stored[1] = size + stored[1]
                    return
            self._index[order_id] = delta
        else:
            if order_id in self._index:
                del self._index[order_id]


# -----------------------------------------------------------------------------
# a more elegant syntax is possible here, but native inheritance is portable

class Asks(OrderBookSide): side = False                                     # noqa
class Bids(OrderBookSide): side = True                                      # noqa
class CountedAsks(CountedOrderBookSide): side = False                       # noqa
class CountedBids(CountedOrderBookSide): side = True                        # noqa
class IndexedAsks(IndexedOrderBookSide): side = False                       # noqa
class IndexedBids(IndexedOrderBookSide): side = True                        # noqa
class IncrementalAsks(IncrementalOrderBookSide): side = False               # noqa
class IncrementalBids(IncrementalOrderBookSide): side = True                # noqa
class IncrementalIndexedAsks(IncrementalIndexedOrderBookSide): side = False # noqa
class IncrementalIndexedBids(IncrementalIndexedOrderBookSide): side = True  # noqa
