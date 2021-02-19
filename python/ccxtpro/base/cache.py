import collections


class Delegate:
    def __init__(self, name, delegated):
        self.name = name
        self.delegated = delegated

    def __get__(self, instance, owner):
        deque = getattr(instance, self.delegated)
        return getattr(deque, self.name)


class ArrayCache(list):
    # implicitly called magic methods don't invoke __getattribute__
    # https://docs.python.org/3/reference/datamodel.html#special-method-lookup
    # all method lookups obey the descriptor protocol
    # this is how the implicit api is defined in ccxt under the hood
    __iter__ = Delegate('__iter__', '_deque')
    __setitem__ = Delegate('__setitem__', '_deque')
    __delitem__ = Delegate('__delitem__', '_deque')
    __len__ = Delegate('__len__', '_deque')
    __contains__ = Delegate('__contains__', '_deque')
    __reversed__ = Delegate('__reversed__', '_deque')
    clear = Delegate('clear', '_deque')

    def __init__(self, max_size=None):
        super(list, self).__init__()
        self.max_size = max_size
        self._deque = collections.deque([], max_size)
        self._new_updates = 0
        self._clear_updates = False

    def __eq__(self, other):
        return list(self) == other

    def getLimit(self, limit):
        self._clear_updates = True
        if limit is None:
            return self._new_updates
        return min(self._new_updates, limit)

    def append(self, item):
        self._deque.append(item)
        if self._clear_updates:
            self._clear_updates = True
            self._new_updates = 0
        self._new_updates += 1

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


class ArrayCacheByTimestamp(ArrayCache):
    def __init__(self, max_size=None):
        super(ArrayCacheByTimestamp, self).__init__(max_size)
        self.hashmap = {}
        self._size_tracker = set()

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


class ArrayCacheBySymbolById(ArrayCacheByTimestamp):
    def __init__(self, max_size=None):
        super(ArrayCacheBySymbolById, self).__init__(max_size)
        self._index_counter = 0
        self._index_tracker = {}

    def append(self, item):
        by_id = self.hashmap.setdefault(item['symbol'], {})
        if item['id'] in by_id:
            reference = by_id[item['id']]
            if reference != item:
                reference.update(item)
            index = self._index_counter - self._index_tracker[item['id']]
            self._deque.rotate(-index)
            self._deque.popleft()
            self._deque.rotate(index)
        else:
            by_id[item['id']] = item
            self._index_tracker[item['id']] = self._index_counter
        if len(self._deque) == self._deque.maxlen:
            delete_reference = self._deque.popleft()
            del by_id[delete_reference['id']]
            del self._index_tracker[delete_reference['id']]
        self._deque.append(item)
        if self._clear_updates:
            self._clear_updates = False
            self._new_updates = 0
        self._new_updates += 1
        self._index_counter += 1
