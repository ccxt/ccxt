import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled) - pins the None/default
# contracts of the hand-written BaseExchange.sort_by / sort_by_2 that the
# transpiled cross-language test_sort_by.py cannot assert: the TS reference
# sortBy substitutes defaultValue only for *missing* keys (`key in a`) and
# JS coerces null inside comparisons, so None-value cases cannot live in the
# shared fixture. both methods run a C-level operator.itemgetter fast path
# and only fall back to the substitution keyfunc when a None key makes the
# sort raise TypeError - the cases below hold both paths to one semantics.

from ccxt.base.exchange import BaseExchange  # noqa: E402


def test_sort_by_fallback():
    sort_by = BaseExchange.sort_by
    # fast path: no None values, sorted asc/desc on dict and int keys
    assert sort_by([{'x': 5}, {'x': 2}, {'x': 4}], 'x') == [{'x': 2}, {'x': 4}, {'x': 5}]
    assert sort_by([[3.0, 1.0], [1.0, 2.0], [2.0, 3.0]], 0, True) == [[3.0, 1.0], [2.0, 3.0], [1.0, 2.0]]
    # None at the key falls back to default=0, stable on equal keys
    assert sort_by([{'x': None}, {'x': 5}, {'x': 0}], 'x') == [{'x': None}, {'x': 0}, {'x': 5}]
    # custom default participates in ordering (ascending: 5 sorts before the None entry defaulted to 10)
    assert sort_by([{'x': None}, {'x': 5}], 'x', False, 10) == [{'x': 5}, {'x': None}]
    # descending with None entries
    assert sort_by([{'x': None}, {'x': 5}, {'x': 0}], 'x', True) == [{'x': 5}, {'x': None}, {'x': 0}]
    # string sort with '' default - the currencies-by-'code' call shape
    assert sort_by([{'code': 'b'}, {'code': None}, {'code': 'a'}], 'code', False, '') == [{'code': None}, {'code': 'a'}, {'code': 'b'}]
    # all-None keys with a comparable default keep the input (stable) order
    assert sort_by([{'x': None}, {'x': None}, {'x': None}], 'x', False, '') == [{'x': None}, {'x': None}, {'x': None}]
    # a missing key raises KeyError on both paths (TS substitutes the default here - python does not)
    try:
        sort_by([{'y': 1}], 'x')
        raise AssertionError('expected KeyError')
    except KeyError:
        pass
    # all-None keys with default=None stay incomparable in python, master parity is TypeError
    try:
        sort_by([{'x': None}, {'x': None}], 'x', False, None)
        raise AssertionError('expected TypeError')
    except TypeError:
        pass


def test_sort_by_2_fallback():
    sort_by_2 = BaseExchange.sort_by_2
    # fast path: primary key then key2 tiebreak, asc/desc
    assert sort_by_2([{'x': 2, 'y': 3}, {'x': 1, 'y': 5}, {'x': 2, 'y': 1}], 'x', 'y') == [{'x': 1, 'y': 5}, {'x': 2, 'y': 1}, {'x': 2, 'y': 3}]
    assert sort_by_2([{'x': 1, 'y': 2}, {'x': 2, 'y': 1}], 'x', 'y', True) == [{'x': 2, 'y': 1}, {'x': 1, 'y': 2}]
    # None in key1 falls back to '' substitution - '' sorts before any non-empty string
    assert sort_by_2([{'sym': 'b', 'id': '1'}, {'sym': None, 'id': '2'}, {'sym': 'a', 'id': '3'}], 'sym', 'id') == [{'sym': None, 'id': '2'}, {'sym': 'a', 'id': '3'}, {'sym': 'b', 'id': '1'}]
    # None in the key2 tiebreak slot
    assert sort_by_2([{'x': 1, 'y': 'b'}, {'x': 1, 'y': None}, {'x': 1, 'y': 'a'}], 'x', 'y') == [{'x': 1, 'y': None}, {'x': 1, 'y': 'a'}, {'x': 1, 'y': 'b'}]
    # uniform None in key1 never needs the fallback: None == None holds, ordering falls through to key2
    assert sort_by_2([{'x': None, 'y': 2}, {'x': None, 'y': 1}], 'x', 'y') == [{'x': None, 'y': 1}, {'x': None, 'y': 2}]
    # a missing key raises KeyError on both paths
    try:
        sort_by_2([{'y': 1}], 'x', 'y')
        raise AssertionError('expected KeyError')
    except KeyError:
        pass
    # None timestamp against int timestamps stays incomparable even after the '' substitution (pre-existing semantics)
    try:
        sort_by_2([{'timestamp': None, 'id': '1'}, {'timestamp': 5, 'id': '2'}], 'timestamp', 'id')
        raise AssertionError('expected TypeError')
    except TypeError:
        pass
