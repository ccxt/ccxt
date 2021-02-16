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
        self.new_updates = []

    def __eq__(self, other):
        return list(self) == other

    def append(self, item):
        self._deque.append(item)
        self.new_updates.append(item)
        if len(self.new_updates) > self.max_size:
            self.new_updates.pop(0)

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

    def clear_new_updates(self):
        self.new_updates = []


class ArrayCacheByTimestamp(ArrayCache):
    def __init__(self, max_size=None):
        super(ArrayCacheByTimestamp, self).__init__(max_size)
        self.hashmap = {}
        self._new_updates_hashmap = set()

    def append(self, item):
        if item[0] in self.hashmap:
            reference = self.hashmap[item[0]]
            if reference != item:
                reference.clear()
                reference.extend(item)
        else:
            self.hashmap[item[0]] = item
            if len(self._deque) == self._deque.maxlen:
                delete_reference = self._deque.popleft()
                del self.hashmap[delete_reference[0]]
            self._deque.append(item)
        if item[0] not in self._new_updates_hashmap:
            self._new_updates_hashmap.add(item[0])
            self.new_updates.append(item)

    def clear_new_updates(self):
        self.new_updates = []
        self._new_updates_hashmap.clear()


class ArrayCacheBySymbolById(ArrayCacheByTimestamp):

    def append(self, item):
        by_id = self.hashmap.setdefault(item['symbol'], {})
        if item['id'] in by_id:
            reference = by_id[item['id']]
            if reference != item:
                reference.clear()
                reference.update(item)
        else:
            by_id[item['id']] = item
            if len(self._deque) == self._deque.maxlen:
                delete_reference = self._deque.popleft()
                del by_id[delete_reference['id']]
            self._deque.append(item)
        if item['id'] not in self._new_updates_hashmap:
            self._new_updates_hashmap.add(item['id'])
            self.new_updates.append(item)
