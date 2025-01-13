import collections


class Delegate:
    def __init__(self, name, delegated):
        self.name = name
        self.delegated = delegated

    def __get__(self, instance, owner):
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
    clear = Delegate('clear', '_deque')
    pop = Delegate('pop', '_deque')

    def __init__(self, max_size=None):
        super(BaseCache, self).__init__()
        self.max_size = max_size
        self._deque = collections.deque([], max_size)

    def __eq__(self, other):
        return list(self) == other

    def __repr__(self):
        return str(list(self))

    def __add__(self, other):
        return list(self) + other

    def __getitem__(self, item):
        # deque doesn't support slicing
        deque = super(list, self).__getattribute__('_deque')
        if isinstance(item, slice):
            start, stop, step = item.indices(len(deque))
            return [deque[i] for i in range(start, stop, step)]
        else:
            return deque[item]

    # to be overriden
    def getLimit(self, symbol, limit):
        pass

    # support transpiled snake_case calls
    def get_limit(self, symbol, limit):
        return self.getLimit(symbol, limit)


class ArrayCache(BaseCache):
    def __init__(self, max_size=None):
        super(ArrayCache, self).__init__(max_size)
        self._nested_new_updates_by_symbol = False
        self._new_updates_by_symbol = {}
        self._clear_updates_by_symbol = {}
        self._all_new_updates = 0
        self._clear_all_updates = False

    def getLimit(self, symbol, limit):
        if symbol is None:
            new_updates_value = self._all_new_updates
            self._clear_all_updates = True
        else:
            new_updates_value = self._new_updates_by_symbol.get(symbol)
            if new_updates_value is not None and self._nested_new_updates_by_symbol:
                new_updates_value = len(new_updates_value)
            self._clear_updates_by_symbol[symbol] = True

        if new_updates_value is None:
            return limit
        elif limit is not None:
            return min(new_updates_value, limit)
        else:
            return new_updates_value

    def append(self, item):
        self._deque.append(item)
        if self._clear_all_updates:
            self._clear_all_updates = False
            self._clear_updates_by_symbol.clear()
            self._all_new_updates = 0
            self._new_updates_by_symbol.clear()
        if self._clear_updates_by_symbol.get(item['symbol']):
            self._clear_updates_by_symbol[item['symbol']] = False
            self._new_updates_by_symbol[item['symbol']] = 0
        self._new_updates_by_symbol[item['symbol']] = self._new_updates_by_symbol.get(item['symbol'], 0) + 1
        self._all_new_updates = (self._all_new_updates or 0) + 1


class ArrayCacheByTimestamp(BaseCache):
    def __init__(self, max_size=None):
        super(ArrayCacheByTimestamp, self).__init__(max_size)
        self.hashmap = {}
        self._size_tracker = set()
        self._new_updates = 0
        self._clear_updates = False

    def getLimit(self, symbol, limit):
        self._clear_updates = True
        if limit is None:
            return self._new_updates
        return min(self._new_updates, limit)

    def append(self, item):
        if item[0] in self.hashmap:
            reference = self.hashmap[item[0]]
            if reference != item:
                reference[0:len(item)] = item
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
    def __init__(self, max_size=None):
        super(ArrayCacheBySymbolById, self).__init__(max_size)
        self._nested_new_updates_by_symbol = True
        self.hashmap = {}
        self._index = collections.deque([], max_size)

    def append(self, item):
        by_id = self.hashmap.setdefault(item['symbol'], {})
        if item['id'] in by_id:
            reference = by_id[item['id']]
            if reference != item:
                reference.update(item)
            item = reference
            index = self._index.index(item['id'])
            del self._deque[index]
            del self._index[index]
        else:
            by_id[item['id']] = item
        if len(self._deque) == self._deque.maxlen:
            delete_item = self._deque.popleft()
            self._index.popleft()
            del self.hashmap[delete_item['symbol']][delete_item['id']]
        self._deque.append(item)
        self._index.append(item['id'])
        if self._clear_all_updates:
            self._clear_all_updates = False
            self._clear_updates_by_symbol.clear()
            self._all_new_updates = 0
            self._new_updates_by_symbol.clear()
        if item['symbol'] not in self._new_updates_by_symbol:
            self._new_updates_by_symbol[item['symbol']] = set()
        if self._clear_updates_by_symbol.get(item['symbol']):
            self._clear_updates_by_symbol[item['symbol']] = False
            self._new_updates_by_symbol[item['symbol']].clear()
        id_set = self._new_updates_by_symbol[item['symbol']]
        before_length = len(id_set)
        id_set.add(item['id'])
        after_length = len(id_set)
        self._all_new_updates = (self._all_new_updates or 0) + (after_length - before_length)


class ArrayCacheBySymbolBySide(ArrayCache):
    def __init__(self, max_size=None):
        super(ArrayCacheBySymbolBySide, self).__init__(max_size)
        self._nested_new_updates_by_symbol = True
        self.hashmap = {}
        self._index = collections.deque([], max_size)

    def append(self, item):
        by_side = self.hashmap.setdefault(item['symbol'], {})
        if item['side'] in by_side:
            reference = by_side[item['side']]
            if reference != item:
                reference.update(item)
            item = reference
            index = self._index.index(item['symbol'] + item['side'])
            del self._deque[index]
            del self._index[index]
        else:
            by_side[item['side']] = item
        if len(self._deque) == self._deque.maxlen:
            delete_item = self._deque.popleft()
            self._index.popleft()
            del self.hashmap[delete_item['symbol']][delete_item['side']]
        self._deque.append(item)
        self._index.append(item['symbol'] + item['side'])
        if self._clear_all_updates:
            self._clear_all_updates = False
            self._clear_updates_by_symbol.clear()
            self._all_new_updates = 0
            self._new_updates_by_symbol.clear()
        if item['symbol'] not in self._new_updates_by_symbol:
            self._new_updates_by_symbol[item['symbol']] = set()
        if self._clear_updates_by_symbol.get(item['symbol']):
            self._clear_updates_by_symbol[item['symbol']] = False
            self._new_updates_by_symbol[item['symbol']].clear()
        side_set = self._new_updates_by_symbol[item['symbol']]
        before_length = len(side_set)
        side_set.add(item['side'])
        after_length = len(side_set)
        self._all_new_updates = (self._all_new_updates or 0) + (after_length - before_length)
