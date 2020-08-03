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
        if item == 'append':
            return object.__getattribute__(self, item)
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

    def append(self, item):
        deque = super(list, self).__getattribute__('_deque')
        deque.append(item)


class ArrayCacheBySymbolById(ArrayCache):

    def append(self, item):
        deque = super(list, self).__getattribute__('_deque')
        found_indices = [i for i, v in enumerate(deque) if (v['symbol'] == item['symbol']) and (v['id'] == item['id'])]
        if len(found_indices):
            first_match = found_indices[0]
            deque[first_match] = item
        else:
            deque.append(item)
