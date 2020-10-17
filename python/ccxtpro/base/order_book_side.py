# -*- coding: utf-8 -*-

import sys
import bisect
import itertools


class OrderBookSide(list):
    side = None  # set to True for bids and False for asks

    def __init__(self, deltas=[], depth=None):
        super(OrderBookSide, self).__init__()
        self._depth = depth or sys.maxsize
        self._n = sys.maxsize
        # parallel to self
        self._index = []
        for delta in deltas:
            self.storeArray(list(delta))

    def storeArray(self, delta):
        price = delta[0]
        size = delta[1]
        index_price = -price if self.side else price
        index = bisect.bisect_left(self._index, index_price)
        if size:
            self._index.insert(index, index_price)
            self.insert(index, delta)
            if len(self._index) > self._depth:
                self._index.pop()
                self.pop()
        elif index < len(self._index) and self._index[index] == index_price:
            del self._index[index]
            del self[index]

    def store(self, price, size):
        self.storeArray([price, size])

    def limit(self, n=None):
        self._n = n

    def __iter__(self):
        # a call to limit only temporarily limits the order book
        # so we hide the rest of the cached data after self._n
        iterator = super(OrderBookSide, self).__iter__()
        return itertools.islice(iterator, self._n)

    def __len__(self):
        length = super(OrderBookSide, self).__len__()
        if self._n is not None:
            return min(length, self._n)
        else:
            return length

    def __getitem__(self, item):
        if item >= self._n:
            raise IndexError('list index out of range')
        return super(OrderBookSide, self).__getitem__(item)

    def __eq__(self, other):
        if isinstance(other, list):
            return list(self) == other
        return super(OrderBookSide, self).__eq__(other)

    def __repr__(self):
        return str(list(self))

# -----------------------------------------------------------------------------
# overwrites absolute volumes at price levels
# or deletes price levels based on order counts (3rd value in a bidask delta)
# this class stores vector arrays of values indexed by price


class CountedOrderBookSide(OrderBookSide):
    def __init__(self, deltas=[], depth=None):
        super(CountedOrderBookSide, self).__init__(deltas, depth)

    def storeArray(self, delta):
        price = delta[0]
        size = delta[1]
        count = delta[2]
        index_price = -price if self.side else price
        index = bisect.bisect_left(self._index, index_price)
        if count and size:
            self._index.insert(index, index_price)
            self.insert(index, delta)
            if len(self._index) > self._depth:
                self._index.pop()
                self.pop()
        elif index < len(self._index) and self._index[index] == index_price:
            del self._index[index]
            del self[index]

    def store(self, price, size):
        self.storeArray([price, size])

# -----------------------------------------------------------------------------
# indexed by order ids (3rd value in a bidask delta)


class IndexedOrderBookSide(OrderBookSide):
    def __init__(self, deltas=[], depth=None):
        super(IndexedOrderBookSide, self).__init__(deltas, depth)
        self.ids = []

    def storeArray(self, delta):
        price = delta[0]
        size = delta[1]
        order_id = delta[2]
        if order_id in self._hashmap:
            reference = self._hashmap[order_id]
            reference[0] = price
            reference[1] = size

        index_price = -price if self.side else price
        index = bisect.bisect_left(self._index, index_price)
        if size:
            self._index.insert(index, index_price)
            self.insert(index, delta)
            if len(self._index) > self._depth:
                self._index.pop()
                self.pop()
        elif index < len(self._index) and self._index[index] == index_price:
            del self._index[index]
            del self[index]

    def store(self, price, size, order_id):
        self.storeArray([price, size, order_id])

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
