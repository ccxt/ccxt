import collections
import operator


class OrderBookSide(collections.UserList):
    side = None  # set to True for bids and False for asks
    # sorted(..., reverse=self.side)

    def __init__(self, deltas=[]):
        self._index = {}
        self.data = None
        super(OrderBookSide, self).__init__()
        if len(deltas):
            self.update(deltas)

    def update(self, deltas):
        for delta in deltas:
            self.storeArray(delta)
        # do not call limit here on purpose
        # limit needs to be called after await future in derived class

    def storeArray(self, delta):
        self.store(*delta)

    def store(self, price, size):
        if size:
            self._index[price] = size
        else:
            del self._index[price]

    def limit(self, n=None):
        first_element = operator.itemgetter(0)
        array = sorted(self._index, key=first_element, reverse=self.side)
        if n and n < len(array):
            truncated = array[:n]
        else:
            truncated = array
        self.data = truncated
        return self


# -----------------------------------------------------------------------------
# some exchanges limit the number of bids/asks in the aggregated orderbook
# orders beyond the limit threshold are not updated with new ws deltas
# those orders should not be returned to the user, they are outdated quickly

class LimitedOrderBookSide(OrderBookSide):
    def __init__(self, deltas=[], depth=None):
        self._depth = depth
        super(LimitedOrderBookSide, self).__init__(deltas)

    def limit(self, n=None):
        first_element = operator.itemgetter(0)
        array = sorted(self._index, key=first_element, reverse=self.side)
        if (n and n < len(array)) or self._depth:
            truncated = []
            self._index = {}
            length = min(n, self._depth)
            for i in range(length):
                truncated[i] = data = array[i]
                price = data[0]
                size = data[1]
                self._index[price] = size
        else:
            truncated = array
        self.data = truncated
        return self


# -----------------------------------------------------------------------------
# overwrites absolute volumes at price levels
# or deletes price levels based on order counts (3rd value in a bidask delta)


class CountedOrderBookSide(OrderBookSide):
    def store(self, price, size, count):
        if count:
            super(CountedOrderBookSide, self).store(price, size)
        else:
            del self._index[price]


# -----------------------------------------------------------------------------
# indexed by order ids (3rd value in a bidask delta)

class IndexedOrderBookSide(OrderBookSide):
    def store(self, price, size, order_id):
        if size:
            self._index[order_id] = [price, size, order_id]
        else:
            del self._index[order_id]

    def storeArray(self, delta):
        size = delta[1]
        order_id = delta[2]
        if size:
            self._index[order_id] = delta
        else:
            del self._index[order_id]

# -----------------------------------------------------------------------------
# adjusts the volumes by positive or negative relative changes or differences


class IncrementalOrderBookSide(OrderBookSide):
    def store(self, price, size):
        if size:
            result = self._index.get(price, 0) + size
            if result < 0:
                del self._index[price]
            else:
                self._index[price] = result
        else:
            del self._index[price]

# -----------------------------------------------------------------------------
# incremental and indexed (2 in 1)


class IncrementalIndexedOrderBookSide(OrderBookSide):
    def store(self, price, size, order_id):
        if size:
            result = self._index.get(price, 0) + size
            if result < 0:
                del self._index[order_id]
            else:
                self._index[order_id] = result
        else:
            del self._index[order_id]

# -----------------------------------------------------------------------------
# a more elegant syntax is possible here, but native inheritance is portable


class Asks(OrderBookSide): side = False                                     # noqa
class Bids(OrderBookSide): side = True                                      # noqa
class LimitedAsks(LimitedOrderBookSide): side = False                       # noqa
class LimitedBids(LimitedOrderBookSide): side = True                        # noqa
class CountedAsks(CountedOrderBookSide): side = False                       # noqa
class CountedBids(CountedOrderBookSide): side = True                        # noqa
class IndexedAsks(IndexedOrderBookSide): side = False                       # noqa
class IndexedBids(IndexedOrderBookSide): side = True                        # noqa
class IncrementalAsks(IncrementalOrderBookSide): side = False               # noqa
class IncrementalBids(IncrementalOrderBookSide): side = True                # noqa
class IncrementalIndexedAsks(IncrementalIndexedOrderBookSide): side = False # noqa
class IncrementalIndexedBids(IncrementalIndexedOrderBookSide): side = True  # noqa
