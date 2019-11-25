import operator
import itertools


class OrderBookSide(list):
    side = None  # set to True for bids and False for asks
    # sorted(..., reverse=self.side)

    def __init__(self, deltas=[]):
        # allocate memory for the list here (it will not be resized...)
        super(OrderBookSide, self).__init__()
        self._index = {}
        self._len = None
        if len(deltas):
            self.update(deltas)

    def update(self, deltas):
        for delta in deltas:
            self.storeArray(delta)
        # do not call limit here on purpose
        # limit needs to be called after await future in derived class

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
        first_element = operator.itemgetter(0)
        array = sorted(self._index.items(), key=first_element, reverse=self.side)
        array_len = len(array)
        self._len = min(n or array_len, array_len)
        self.clear()
        self.extend(array)

    """These methods allow fast truncation of a list"""
    def __iter__(self):
        super_iterator = super(OrderBookSide, self).__iter__()
        if self._len:
            return itertools.islice(super_iterator, self._len)
        else:
            return super_iterator

    def __len__(self):
        if self._len:
            return self._len
        else:
            return super(OrderBookSide, self).__len__()

    def __repr__(self):
        return str(list(self))

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
        array = sorted(self._index.items(), key=first_element, reverse=self.side)
        array_len = len(array)
        self._len = min(n or array_len, self._depth or array_len, array_len)
        self._index = dict(array)
        self.clear()
        self.extend(array)
        return self


# -----------------------------------------------------------------------------
# overwrites absolute volumes at price levels
# or deletes price levels based on order counts (3rd value in a bidask delta)


class CountedOrderBookSide(OrderBookSide):
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
# limited and order-id-based


class LimitedIndexedOrderBookSide(IndexedOrderBookSide, LimitedOrderBookSide):
    pass

# -----------------------------------------------------------------------------
# adjusts the volumes by positive or negative relative changes or differences


class IncrementalOrderBookSide(OrderBookSide):
    def store(self, price, size):
        if size:
            result = self._index.get(price, 0) + size
            if result > 0:
                self._index[price] = result
                return
        if price in self._index:
            del self._index[price]

    def storeArray(self, delta):
        price, size = delta
        if size:
            result = self._index.get(price, 0) + size
            if result > 0:
                self._index[price] = result
                return
        if price in self._index:
            del self._index[price]

# -----------------------------------------------------------------------------
# incremental and indexed (2 in 1)


class IncrementalIndexedOrderBookSide(OrderBookSide):
    def store(self, price, size, order_id):
        if size:
            result = self._index.get(price, 0) + size
            if result > 0:
                self._index[order_id] = result
                return
        if order_id in self._index:
            del self._index[order_id]

    def storeArray(self, delta):
        price, size, order_id = delta
        if size:
            result = self._index.get(price, 0) + size
            if result > 0:
                self._index[order_id] = result
                return
        if order_id in self._index:
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
class LimitedIndexedAsks(LimitedIndexedOrderBookSide): side = False         # noqa
class LimitedIndexedBids(LimitedIndexedOrderBookSide): side = True          # noqa
class IncrementalAsks(IncrementalOrderBookSide): side = False               # noqa
class IncrementalBids(IncrementalOrderBookSide): side = True                # noqa
class IncrementalIndexedAsks(IncrementalIndexedOrderBookSide): side = False # noqa
class IncrementalIndexedBids(IncrementalIndexedOrderBookSide): side = True  # noqa
