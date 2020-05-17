import collections


class ArrayCache(collections.deque):
    def __init__(self, max_size):
        super(ArrayCache, self).__init__([], max_size)

    def __eq__(self, other):
        return list(self) == other
