import collections


class Delegate:
    def __init__(self, name):
        self.name = name

    def __get__(self, instance, owner):
        return getattr(instance, self.name)


class ArrayCache(list):
    # implicitly called magic methods don't invoke __getattribute__
    # https://docs.python.org/3/reference/datamodel.html#special-method-lookup
    # all method lookups obey the descriptor protocol
    # this is how the implicit api is defined in ccxt under the hood
    __iter__ = Delegate('__iter__')
    __setitem__ = Delegate('__setitem__')
    __delitem__ = Delegate('__delitem__')
    __len__ = Delegate('__len__')
    __contains__ = Delegate('__contains__')
    __reversed__ = Delegate('__reversed__')

    def __init__(self, max_size=None):
        super(list, self).__init__()
        self._deque = collections.deque([], max_size)

    def __eq__(self, other):
        return list(self) == other

    def __getattribute__(self, item):
        deque = super(list, self).__getattribute__('_deque')
        return getattr(deque, item)

    def __repr__(self):
        return str(list(self))

    def __add__(self, other):
        return list(self) + other

    def __getitem__(self, item):
        deque = super(list, self).__getattribute__('_deque')
        if isinstance(item, slice):
            start, stop, step = item.indices(len(deque))
            return [deque[i] for i in range(start, stop, step)]
        else:
            return deque[item]


class ArrayCacheById(ArrayCache):
    def __init__(self, max_size=None):
        super(ArrayCacheById, self).__init__(max_size)
        self._index = {}

    def __getattribute__(self, item):
        methods = ArrayCacheById.__dict__
        if item in methods and hasattr(methods[item], '__get__'):
            # method calls
            return methods[item].__get__(self, ArrayCacheById)
        variables = object.__getattribute__(self, '__dict__')
        if item in variables:
            return variables[item]
        return super(ArrayCacheById, self).__getattribute__(item)

    def append(self, item):
        if item['id'] in self._index:
            reference = self._index[item['id']]
            reference.clear()
            reference.update(item)
        else:
            self._index[item['id']] = item
            if len(self._deque) == self._deque.maxlen:
                delete_reference = self._deque.popleft()
                del self._index[delete_reference['id']]
            self._deque.append(item)


class ArrayCacheBySymbolById(ArrayCacheById):

    def append(self, item):
        by_id = self._index.setdefault(item['symbol'], {})
        if item['id'] in by_id:
            reference = by_id[item['id']]
            reference.clear()
            reference.update(item)
        else:
            by_id[item['id']] = item
            if len(self._deque) == self._deque.maxlen:
                delete_reference = self._deque.popleft()
                del by_id[delete_reference['id']]
            self._deque.append(item)
