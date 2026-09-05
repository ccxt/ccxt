import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled) - pins the None/default
# contracts of the hand-written BaseExchange.sort_by that the transpiled
# cross-language test_sort_by.py cannot assert: the TS reference sortBy
# substitutes defaultValue only for *missing* keys (`key in a`) and JS
# coerces null inside comparisons, so None-value cases cannot live in the
# shared fixture. sort_by runs a C-level operator.itemgetter fast path and
# only falls back to the default substitution when a None key makes the
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
