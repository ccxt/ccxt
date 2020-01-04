# -*- coding: utf-8 -*-

import operator


class OrderBookSide(list):
    side = None  # set to True for bids and False for asks
    # sorted(..., reverse=self.side)

    def __init__(self, deltas=[], depth=float('inf'), limit_type=0):
        # allocate memory for the list here (it will not be resized...)
        super(OrderBookSide, self).__init__()
        self._depth = depth
        self._limit_type = limit_type
        self._index = {}
        for delta in deltas:
            self.storeArray(delta)

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

    def limit(self, n=float('inf')):
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
                self._index[price if self._limit_type & 1 else last] = delta
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
    def __init__(self, deltas=[], depth=float('inf')):
        super(CountedOrderBookSide, self).__init__(deltas, depth, 1)

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
    def __init__(self, deltas=[], depth=float('inf')):
        super(IndexedOrderBookSide, self).__init__(deltas, depth, 2)

    def store(self, price, size, order_id):
        if size:
            self._index[order_id] = [price, size, order_id]
        else:
            if order_id in self._index:
                del self._index[order_id]

    def storeArray(self, delta):
        size = delta[1]
        order_id = delta[2]
        if size:
            self._index[order_id] = delta
        else:
            if order_id in self._index:
                del self._index[order_id]

# -----------------------------------------------------------------------------
# adjusts the volumes by positive or negative relative changes or differences


class IncrementalOrderBookSide(OrderBookSide):
    def __init__(self, deltas=[], depth=float('inf')):
        super(IncrementalOrderBookSide, self).__init__(deltas, depth, 0)

    def store(self, price, size):
        result = self._index.get(price, 0) + size
        if result > 0:
            self._index[price] = result
            return
        if price in self._index:
            del self._index[price]

    def storeArray(self, delta):
        price, size = delta
        result = self._index.get(price, 0) + size
        if result > 0:
            self._index[price] = result
            return
        if price in self._index:
            del self._index[price]

# -----------------------------------------------------------------------------
# incremental and indexed (2 in 1)


class IncrementalIndexedOrderBookSide(IndexedOrderBookSide):
    _fallback = [None, 0, None]

    def store(self, price, size, order_id):
        stored = self._index.get(order_id) or IncrementalIndexedOrderBookSide._fallback
        if size and size + stored[1] >= 0:
            if price == stored[0]:
                self._index[order_id] = [price, size + stored[1], order_id]
            else:
                self._index[order_id] = [price, size, order_id]
        else:
            if order_id in self._index:
                del self._index[order_id]

    def storeArray(self, delta):
        price, size, order_id = delta
        stored = self._index.get(order_id) or IncrementalIndexedOrderBookSide._fallback
        if size and size + stored[1] >= 0:
            if price == stored[0]:
                self._index[order_id] = [price, size + stored[1], order_id]
            else:
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
