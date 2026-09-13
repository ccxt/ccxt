import os
import sys
import collections

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled) - the transpiled test_extend.py
# (ts/src/test/base/test.extend.ts) only exercises extend() with exactly 2 plain
# dict arguments, which is the new fast path added in exchange.py (dict-literal
# unpacking). This file pins the slow path (the `result = {}; for arg in args:
# result.update(arg)` loop) that fast path falls back to for every other shape
# of call: a single argument, 3+ arguments, and an OrderedDict first argument -
# none of which are covered by the transpiled fast-path tests.
# ----------------------------------------------------------------------------

import ccxt.async_support as ccxt  # noqa: F402


def test_extend_slow_path():
    exchange = ccxt.Exchange({
        'id': 'regirock',
    })
    # --- single argument: falls through to the slow path (len(args) != 2) ---
    only = {'a': 1, 'b': 2}
    single = exchange.extend(only)
    assert single == {'a': 1, 'b': 2}, 'extend(dict) should return an equal copy'
    assert single is not only, 'extend(dict) should not return the same object'
    only['a'] = 999
    assert single['a'] == 1, 'extend(dict) result must not alias the input'
    # --- three-plus arguments: len(args) != 2, always the slow path ---
    merged3 = exchange.extend({'a': 1}, {'b': 2}, {'a': 3, 'c': 4})
    assert merged3 == {'a': 3, 'b': 2, 'c': 4}, 'extend() with 3 args should merge left-to-right'
    merged4 = exchange.extend({'a': 1}, {'b': 2}, {'c': 3}, {'d': 4})
    assert merged4 == {'a': 1, 'b': 2, 'c': 3, 'd': 4}, 'extend() with 4 args should merge all of them'
    # --- OrderedDict as the first argument: arg_type is not `dict`, so even with
    # exactly 2 args this must skip the fast path and preserve the OrderedDict type
    # and insertion order via the slow path's `result = collections.OrderedDict()` branch
    ordered = collections.OrderedDict([('z', 1), ('a', 2)])
    result = exchange.extend(ordered, {'m': 3})
    assert isinstance(result, collections.OrderedDict), 'extend(OrderedDict, dict) should preserve OrderedDict'
    assert list(result.keys()) == ['z', 'a', 'm'], 'extend(OrderedDict, dict) should preserve insertion order'
    assert result['z'] == 1 and result['a'] == 2 and result['m'] == 3
    # original OrderedDict must not be mutated
    assert list(ordered.keys()) == ['z', 'a'], 'extend() must not mutate the original OrderedDict'
