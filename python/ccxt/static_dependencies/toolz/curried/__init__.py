"""
Alternate namespace for toolz such that all functions are curried

Currying provides implicit partial evaluation of all functions

Example:

    Get usually requires two arguments, an index and a collection
    >>> from curried import get
    >>> get(0, ('a', 'b'))
    'a'

    When we use it in higher order functions we often want to pass a partially
    evaluated form
    >>> data = [(1, 2), (11, 22), (111, 222)]
    >>> list(map(lambda seq: get(0, seq), data))
    [1, 11, 111]

    The curried version allows simple expression of partial evaluation
    >>> list(map(get(0), data))
    [1, 11, 111]

See Also:
    funccurry
"""
from . import operator
from .. import (
    apply,
    comp,
    complement,
    compose,
    compose_left,
    concat,
    concatv,
    count,
    curry,
    diff,
    first,
    flip,
    frequencies,
    identity,
    interleave,
    isdistinct,
    isiterable,
    juxt,
    last,
    memoize,
    merge_sorted,
    peek,
    pipe,
    second,
    thread_first,
    thread_last,
)
from .exceptions import merge, merge_with

# accumulate = curry(accumulate)
# assoc = curry(assoc)
# assoc_in = curry(assoc_in)
# cons = curry(cons)
# countby = curry(countby)
# dissoc = curry(dissoc)
# do = curry(do)
# drop = curry(drop)
# excepts = curry(excepts)
# filter = curry(filter)
# get = curry(get)
# get_in = curry(get_in)
# groupby = curry(groupby)
# interpose = curry(interpose)
# itemfilter = curry(itemfilter)
# itemmap = curry(itemmap)
# iterate = curry(iterate)
# join = curry(join)
# keyfilter = curry(keyfilter)
# keymap = curry(keymap)
# map = curry(map)
# mapcat = curry(mapcat)
# nth = curry(nth)
# partial = curry(partial)
# partition = curry(partition)
# partition_all = curry(partition_all)
# partitionby = curry(partitionby)
# peekn = curry(peekn)
# pluck = curry(pluck)
# random_sample = curry(random_sample)
# reduce = curry(reduce)
# reduceby = curry(reduceby)
# remove = curry(remove)
# sliding_window = curry(sliding_window)
# sorted = curry(sorted)
# tail = curry(tail)
# take = curry(take)
# take_nth = curry(take_nth)
# topk = curry(topk)
# unique = curry(unique)
# update_in = curry(update_in)
# valfilter = curry(valfilter)
# valmap = curry(valmap)

del exceptions
