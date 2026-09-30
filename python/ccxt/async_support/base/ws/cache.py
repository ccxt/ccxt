from __future__ import annotations

import collections


class Delegate:
    def __init__(self, name: str, delegated: str) -> None:
        self.name = name
        self.delegated = delegated

    def __get__(self, instance: BaseCache | None, owner: type):
        deque = getattr(instance, self.delegated)
        return getattr(deque, self.name)


class BaseCache(list):
    # implicitly called magic methods don't invoke __getattribute__
    # https://docs.python.org/3/reference/datamodel.html#special-method-lookup
    # all method lookups obey the descriptor protocol
    # this is how the implicit api is defined in ccxt
    __iter__ = Delegate('__iter__', '_deque')
    __setitem__ = Delegate('__setitem__', '_deque')
    __delitem__ = Delegate('__delitem__', '_deque')
    __len__ = Delegate('__len__', '_deque')
    __contains__ = Delegate('__contains__', '_deque')
    __reversed__ = Delegate('__reversed__', '_deque')
    pop = Delegate('pop', '_deque')

    def __init__(self, max_size: int | None = None) -> None:
        super(BaseCache, self).__init__()
        self.max_size = max_size
        # a falsy max_size means unbounded, mirroring the `this.maxSize && ...`
        # truthiness guard in ts/src/base/ws/Cache.ts - a max_size of 0 arises
        # from .filter() copy-construction, and deque(maxlen=0) would silently
        # discard every appended row while getLimit still reports new updates
        self._deque = collections.deque([], max_size or None)

    def __eq__(self, other: object) -> bool:
        return list(self) == other

    def __repr__(self) -> str:
        return str(list(self))

    def __add__(self, other: list) -> list:
        return list(self) + other

    def __getitem__(self, item):
        # deque doesn't support slicing
        deque = super(list, self).__getattribute__('_deque')
        if isinstance(item, slice):
            start, stop, step = item.indices(len(deque))
            return [deque[i] for i in range(start, stop, step)]
        else:
            return deque[item]

    # subclasses extend this to also reset their own bookkeeping - clearing only
    # the deque would leave the hashmap/index sidecars pointing at rows that no
    # longer exist, so the next re-append of a known id raises IndexError
    def clear(self) -> None:
        self._deque.clear()

    # to be overriden
    def getLimit(self, symbol: str | None, limit: int | None) -> int | None:
        pass

    # support transpiled snake_case calls
    def get_limit(self, symbol: str | None, limit: int | None) -> int | None:
        return self.getLimit(symbol, limit)


class ArrayCache(BaseCache):
    def __init__(self, max_size: int | None = None) -> None:
        super(ArrayCache, self).__init__(max_size)
        self.hashmap = {}
        self._nested_new_updates_by_symbol = False
        self._new_updates_by_symbol = {}
        # subclasses that count distinct ids/sides keep the identifiers seen since
        # the last getLimit here, so _new_updates_by_symbol only ever holds the
        # resulting integer count and getLimit never has to type-check its values
        self._seen_updates_by_symbol = {}
        # the same, but cleared only by the GLOBAL getLimit() scope - the two poll
        # scopes are independent, so each needs its own memory of what it has seen
        self._seen_updates_all = {}
        self._clear_updates_by_symbol = {}
        self._all_new_updates = 0
        self._clear_all_updates = False

    def clear(self) -> None:
        super(ArrayCache, self).clear()
        self.hashmap.clear()
        self._new_updates_by_symbol.clear()
        self._seen_updates_by_symbol.clear()
        self._seen_updates_all.clear()
        self._clear_updates_by_symbol.clear()
        self._all_new_updates = 0
        self._clear_all_updates = False

    def getLimit(self, symbol: str | None, limit: int | None) -> int | None:
        if symbol is None:
            new_updates_value = self._all_new_updates
            self._clear_all_updates = True
        else:
            # always an integer - subclasses write len(seen set) back into this map
            new_updates_value = self._new_updates_by_symbol.get(symbol)
            self._clear_updates_by_symbol[symbol] = True

        if new_updates_value is None:
            return limit
        elif limit is not None:
            return min(new_updates_value, limit)
        else:
            return new_updates_value

    def append(self, item: dict) -> None:
        # the deque evicts from the left on its own when max_size is truthy
        self._deque.append(item)
        if self._clear_all_updates:
            self._clear_all_updates = False
            # the global poll consumes only the global scope: the symbol-scoped
            # seen sets, counts and pending flags belong to the symbol consumers
            self._all_new_updates = 0
            self._seen_updates_all.clear()
        # item.get('symbol') (not item['symbol']): prediction trades carry 'outcome' not 'symbol',
        # so a bare lookup raises KeyError in Python where JS just yields undefined
        symbol = item.get('symbol')
        if self._clear_updates_by_symbol.get(symbol):
            self._clear_updates_by_symbol[symbol] = False
            self._new_updates_by_symbol[symbol] = 0
        self._new_updates_by_symbol[symbol] = self._new_updates_by_symbol.get(symbol, 0) + 1
        self._all_new_updates = (self._all_new_updates or 0) + 1


class ArrayCacheByTimestamp(BaseCache):
    def __init__(self, max_size: int | None = None) -> None:
        super(ArrayCacheByTimestamp, self).__init__(max_size)
        self.hashmap = {}
        self._size_tracker = set()
        self._new_updates = 0
        self._clear_updates = False

    def clear(self) -> None:
        super(ArrayCacheByTimestamp, self).clear()
        self.hashmap.clear()
        self._size_tracker.clear()
        self._new_updates = 0
        self._clear_updates = False

    def getLimit(self, symbol: str | None, limit: int | None) -> int | None:
        self._clear_updates = True
        if limit is None:
            return self._new_updates
        return min(self._new_updates, limit)

    def append(self, item: list) -> None:
        if item[0] in self.hashmap:
            reference = self.hashmap[item[0]]
            # identity check, matching the `!==` in ts/src/base/ws/Cache.ts - a deep
            # value comparison would be O(k) on every update for no observable gain
            if reference is not item:
                # OHLCV rows are lists, so a merge that only walks the incoming
                # indices leaves the previous row's trailing values in place, e.g.
                # [100,1,2,3,4,5] followed by [100,9,9] used to yield [100,9,9,3,4,5].
                # Replace the whole contents in place - the row keeps its identity
                # and its position, and whatever the update does not cover is dropped
                reference[:] = item
        else:
            self.hashmap[item[0]] = item
            if len(self._deque) == self._deque.maxlen:
                delete_reference = self._deque.popleft()
                del self.hashmap[delete_reference[0]]
            self._deque.append(item)
        if self._clear_updates:
            self._clear_updates = False
            self._size_tracker.clear()
        self._size_tracker.add(item[0])
        self._new_updates = len(self._size_tracker)


class ArrayCacheBySymbolById(ArrayCache):
    def __init__(self, max_size: int | None = None) -> None:
        super(ArrayCacheBySymbolById, self).__init__(max_size)
        self._nested_new_updates_by_symbol = True
        self._key_field = 'symbol'  # first nesting level (overridden by ArrayCacheByOutcomeById)
        self.hashmap = {}
        self._index = collections.deque([], max_size or None)

    def clear(self) -> None:
        super(ArrayCacheBySymbolById, self).clear()
        self._index.clear()

    def append(self, item: dict) -> None:
        key = item[self._key_field]
        item_id = item['id']
        by_id = self.hashmap.setdefault(key, {})
        # index on the (key_field, id) pair kept as a tuple - different symbols can
        # share an order id (binance uses per-symbol id sequences) and matching on id
        # alone would remove the wrong row, see https://github.com/ccxt/ccxt/issues/26092.
        # A tuple rather than a key + id string concatenation, because concatenation
        # collides across the field boundary (('BTC/USDT1', '2') and ('BTC/USDT', '12')
        # both yield 'BTC/USDT12') and raises TypeError on non-string ids
        token = (key, item_id)
        if item_id in by_id:
            reference = by_id[item_id]
            if reference is not item:
                reference.update(item)
            item = reference
            index = self._index.index(token)
            # move the order to the end of the deque
            del self._deque[index]
            del self._index[index]
        else:
            by_id[item_id] = item
        if len(self._deque) == self._deque.maxlen:
            delete_item = self._deque.popleft()
            self._index.popleft()
            delete_key = delete_item[self._key_field]
            delete_by_id = self.hashmap[delete_key]
            del delete_by_id[delete_item['id']]
            if not delete_by_id:
                # drop the outer bucket once its last id is evicted, otherwise the
                # hashmap grows one empty dict per symbol for the process lifetime
                del self.hashmap[delete_key]
            # the evicted id also leaves both seen scopes so single-scope pollers
            # stay bounded - the counts mean distinct ids within the retained window
            symbol_seen = self._seen_updates_by_symbol.get(delete_key)
            if symbol_seen is not None and delete_item['id'] in symbol_seen:
                symbol_seen.discard(delete_item['id'])
                self._new_updates_by_symbol[delete_key] = self._new_updates_by_symbol[delete_key] - 1
                if not symbol_seen:
                    del self._seen_updates_by_symbol[delete_key]
            all_seen = self._seen_updates_all.get(delete_key)
            if all_seen is not None and delete_item['id'] in all_seen:
                all_seen.discard(delete_item['id'])
                self._all_new_updates = self._all_new_updates - 1
                if not all_seen:
                    del self._seen_updates_all[delete_key]
        self._deque.append(item)
        self._index.append(token)
        if self._clear_all_updates:
            self._clear_all_updates = False
            # the global poll consumes only the global scope: the symbol-scoped
            # seen sets, counts and pending flags belong to the symbol consumers
            self._all_new_updates = 0
            self._seen_updates_all.clear()
        if key not in self._seen_updates_by_symbol:
            self._seen_updates_by_symbol[key] = set()
        if self._clear_updates_by_symbol.get(key):
            self._clear_updates_by_symbol[key] = False
            self._seen_updates_by_symbol[key].clear()
        # in case an exchange updates the same order id twice
        id_set = self._seen_updates_by_symbol[key]
        id_set.add(item_id)
        self._new_updates_by_symbol[key] = len(id_set)
        # the global scope keeps its own seen sets: the symbol-scoped poll clears
        # the symbol set, and deriving the global count from that set double-counts
        # an id that updates again after a symbol poll
        if key not in self._seen_updates_all:
            self._seen_updates_all[key] = set()
        all_id_set = self._seen_updates_all[key]
        before_all_length = len(all_id_set)
        all_id_set.add(item_id)
        self._all_new_updates = (self._all_new_updates or 0) + (len(all_id_set) - before_all_length)


class ArrayCacheByOutcomeById(ArrayCacheBySymbolById):
    def __init__(self, max_size: int | None = None) -> None:
        super(ArrayCacheByOutcomeById, self).__init__(max_size)
        self._key_field = 'outcome'


class ArrayCacheBySymbolBySide(ArrayCache):
    def __init__(self, max_size: int | None = None) -> None:
        # positions are unbounded - the number of (symbol, side) pairs is naturally
        # capped by the account, so max_size is accepted and ignored the way the
        # zero-arity constructor in ts/src/base/ws/Cache.ts drops any argument
        super(ArrayCacheBySymbolBySide, self).__init__()
        self._nested_new_updates_by_symbol = True
        self.hashmap = {}
        self._index = collections.deque()

    def clear(self) -> None:
        super(ArrayCacheBySymbolBySide, self).clear()
        self._index.clear()

    def append(self, item: dict) -> None:
        symbol = item['symbol']
        side = item['side']
        by_side = self.hashmap.setdefault(symbol, {})
        token = (symbol, side)
        if side in by_side:
            reference = by_side[side]
            if reference is not item:
                reference.update(item)
            item = reference
            index = self._index.index(token)
            # move the position to the end of the deque
            del self._deque[index]
            del self._index[index]
        else:
            by_side[side] = item
        self._deque.append(item)
        self._index.append(token)
        if self._clear_all_updates:
            self._clear_all_updates = False
            # the global poll consumes only the global scope: the symbol-scoped
            # seen sets, counts and pending flags belong to the symbol consumers
            self._all_new_updates = 0
            self._seen_updates_all.clear()
        if symbol not in self._seen_updates_by_symbol:
            self._seen_updates_by_symbol[symbol] = set()
        if self._clear_updates_by_symbol.get(symbol):
            self._clear_updates_by_symbol[symbol] = False
            self._seen_updates_by_symbol[symbol].clear()
        # in case an exchange updates the same position twice
        side_set = self._seen_updates_by_symbol[symbol]
        side_set.add(side)
        self._new_updates_by_symbol[symbol] = len(side_set)
        # independent global-scope memory, see ArrayCacheBySymbolById.append
        if symbol not in self._seen_updates_all:
            self._seen_updates_all[symbol] = set()
        all_side_set = self._seen_updates_all[symbol]
        before_all_length = len(all_side_set)
        all_side_set.add(side)
        self._all_new_updates = (self._all_new_updates or 0) + (len(all_side_set) - before_all_length)
