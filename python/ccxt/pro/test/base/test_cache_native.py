import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from ccxt.async_support.base.ws.cache import ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheByOutcomeById, ArrayCacheBySymbolBySide  # noqa: F402

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled, this file is NOT generated -
# the neighbouring test_cache.py IS generated from ts/src/pro/test/base/test.cache.ts
# and any edit there is overwritten by the build).
#
# These cases cover behaviour that only the python port could ever get wrong,
# because it stems from python-specific machinery that has no counterpart in the
# TypeScript source:
#
#   - collections.deque(maxlen=0) silently discards every appended item, where
#     the `this.maxSize && ...` truthiness guard in ts/src/base/ws/Cache.ts treats
#     a zero max size as unbounded
#   - the python caches carry hashmap/_index sidecars that the TS implementation
#     does not have, so list.clear() has to reset them too
#   - `key + item['id']` string concatenation as an index token is a python-only
#     construct that both collides across the field boundary and raises TypeError
#     on non-string ids
#
# Every assertion below fails against the pre-fix cache.py, except the few
# explicitly marked as invariant guards, which are here to prove the fix did not
# regress the merge/eviction semantics the generated suite already relies on.
# ----------------------------------------------------------------------------


def test_max_size_zero_is_unbounded():
    # a max_size of 0 arises from .filter()-style copy construction. deque(maxlen=0)
    # drops every row on append while getLimit keeps reporting new updates, so the
    # consumer sees a permanently empty cache that claims to be receiving data.
    array_cache = ArrayCache(0)
    for i in range(0, 5):
        array_cache.append({
            'symbol': 'BTC/USDT',
            'data': i,
        })
    assert len(array_cache) == 5
    assert array_cache[0]['data'] == 0
    assert array_cache[4]['data'] == 4

    by_symbol_id = ArrayCacheBySymbolById(0)
    for i in range(0, 5):
        by_symbol_id.append({
            'symbol': 'BTC/USDT',
            'id': str(i),
            'amount': i,
        })
    assert len(by_symbol_id) == 5
    assert len(by_symbol_id.hashmap['BTC/USDT']) == 5

    by_timestamp = ArrayCacheByTimestamp(0)
    for i in range(0, 5):
        by_timestamp.append([i * 10, i, i, i, i, i])
    assert len(by_timestamp) == 5

    # a truthy max_size must still bound the cache
    bounded = ArrayCache(2)
    for i in range(0, 5):
        bounded.append({
            'symbol': 'BTC/USDT',
            'data': i,
        })
    assert len(bounded) == 2  # invariant guard
    assert bounded[0]['data'] == 3
    assert bounded[1]['data'] == 4


def test_index_token_does_not_collide_across_the_field_boundary():
    # ('BTC/USDT1', '2') and ('BTC/USDT', '12') both concatenate to 'BTC/USDT12',
    # so an index built by concatenation resolves an update of one row to the
    # position of the other and deletes the wrong entry from the deque
    cache = ArrayCacheBySymbolById()
    cache.append({
        'symbol': 'BTC/USDT1',
        'id': '2',
        'amount': 1,
    })
    cache.append({
        'symbol': 'BTC/USDT',
        'id': '12',
        'amount': 2,
    })
    assert len(cache) == 2
    # updating the second row must not disturb the first
    cache.append({
        'symbol': 'BTC/USDT',
        'id': '12',
        'amount': 3,
    })
    assert len(cache) == 2
    assert cache[0]['symbol'] == 'BTC/USDT1'
    assert cache[0]['id'] == '2'
    assert cache[0]['amount'] == 1
    assert cache[1]['symbol'] == 'BTC/USDT'
    assert cache[1]['id'] == '12'
    assert cache[1]['amount'] == 3

    # the same collision through the (symbol, side) index of the positions cache
    positions = ArrayCacheBySymbolBySide()
    positions.append({
        'symbol': 'BTC/USDT1',
        'side': 'long',
        'contracts': 1,
    })
    positions.append({
        'symbol': 'BTC/USDT',
        'side': '1long',
        'contracts': 2,
    })
    positions.append({
        'symbol': 'BTC/USDT',
        'side': '1long',
        'contracts': 3,
    })
    assert len(positions) == 2
    assert positions[0]['symbol'] == 'BTC/USDT1'
    assert positions[0]['contracts'] == 1
    assert positions[1]['symbol'] == 'BTC/USDT'
    assert positions[1]['contracts'] == 3

    # and through the (outcome, id) index of the prediction-market cache
    by_outcome = ArrayCacheByOutcomeById()
    by_outcome.append({
        'outcome': 'YES1',
        'id': '2',
        'amount': 1,
    })
    by_outcome.append({
        'outcome': 'YES',
        'id': '12',
        'amount': 2,
    })
    by_outcome.append({
        'outcome': 'YES',
        'id': '12',
        'amount': 3,
    })
    assert len(by_outcome) == 2
    assert by_outcome[0]['outcome'] == 'YES1'
    assert by_outcome[0]['amount'] == 1
    assert by_outcome[1]['amount'] == 3


def test_numeric_id_does_not_raise():
    # exchanges that hand back an unparsed JSON number as the order id used to
    # raise TypeError: can only concatenate str (not "int") to str on append
    cache = ArrayCacheBySymbolById()
    cache.append({
        'symbol': 'BTC/USDT',
        'id': 1,
        'amount': 1,
    })
    cache.append({
        'symbol': 'BTC/USDT',
        'id': 2,
        'amount': 2,
    })
    cache.append({
        'symbol': 'BTC/USDT',
        'id': 1,
        'amount': 3,
    })
    assert len(cache) == 2
    # the updated order moves to the end of the deque
    assert cache[0]['id'] == 2
    assert cache[1]['id'] == 1
    assert cache[1]['amount'] == 3
    assert cache.get_limit('BTC/USDT', 5) == 2

    # a None id must not blow up either
    none_id = ArrayCacheBySymbolById()
    none_id.append({
        'symbol': 'BTC/USDT',
        'id': None,
        'amount': 1,
    })
    none_id.append({
        'symbol': 'BTC/USDT',
        'id': None,
        'amount': 2,
    })
    assert len(none_id) == 1
    assert none_id[0]['amount'] == 2


def test_clear_resets_the_sidecar_bookkeeping():
    # clear() used to be delegated straight to the deque, leaving hashmap and
    # _index pointing at rows that no longer exist. Re-appending a known id then
    # took the update branch, looked the id up in the stale _index and deleted
    # that position from the now empty deque, raising IndexError.
    cache = ArrayCacheBySymbolById()
    cache.append({
        'symbol': 'BTC/USDT',
        'id': 'a',
        'amount': 1,
    })
    cache.append({
        'symbol': 'ETH/USDT',
        'id': 'b',
        'amount': 1,
    })
    assert len(cache) == 2
    cache.clear()
    assert len(cache) == 0
    assert cache.hashmap == {}
    assert len(cache._index) == 0
    assert cache.get_limit(None, 5) == 0
    # re-appending the same ids must rebuild both rows
    cache.append({
        'symbol': 'BTC/USDT',
        'id': 'a',
        'amount': 2,
    })
    cache.append({
        'symbol': 'ETH/USDT',
        'id': 'b',
        'amount': 2,
    })
    assert len(cache) == 2
    assert cache[0]['symbol'] == 'BTC/USDT'
    assert cache[0]['amount'] == 2
    assert cache[1]['symbol'] == 'ETH/USDT'
    assert cache[1]['amount'] == 2
    assert cache.get_limit(None, 5) == 2

    # plain ArrayCache: the update counters have to be reset as well
    plain = ArrayCache()
    plain.append({
        'symbol': 'BTC/USDT',
        'data': 1,
    })
    plain.append({
        'symbol': 'BTC/USDT',
        'data': 2,
    })
    plain.clear()
    assert len(plain) == 0
    assert plain.get_limit(None, 5) == 0
    assert plain.get_limit('BTC/USDT', 5) == 5  # no updates recorded for the symbol
    plain.append({
        'symbol': 'BTC/USDT',
        'data': 3,
    })
    assert plain.get_limit(None, 5) == 1

    # ArrayCacheByTimestamp: a stale hashmap swallows the re-appended candles,
    # they take the merge branch and never make it back into the deque
    by_timestamp = ArrayCacheByTimestamp()
    for i in range(0, 3):
        by_timestamp.append([i * 10, i, i, i, i, i])
    by_timestamp.clear()
    assert len(by_timestamp) == 0
    assert by_timestamp.hashmap == {}
    assert by_timestamp.get_limit(None, None) == 0
    for i in range(0, 3):
        by_timestamp.append([i * 10, i, i, i, i, i])
    assert len(by_timestamp) == 3
    assert by_timestamp.get_limit(None, None) == 3

    # ArrayCacheBySymbolBySide
    positions = ArrayCacheBySymbolBySide()
    positions.append({
        'symbol': 'BTC/USDT',
        'side': 'long',
        'contracts': 1,
    })
    positions.clear()
    assert len(positions) == 0
    assert positions.hashmap == {}
    assert len(positions._index) == 0
    positions.append({
        'symbol': 'BTC/USDT',
        'side': 'long',
        'contracts': 2,
    })
    assert len(positions) == 1
    assert positions[0]['contracts'] == 2


def test_by_symbol_by_side_does_not_evict():
    # the number of (symbol, side) pairs is naturally capped by the account, so
    # the positions cache is unbounded. It used to forward max_size to the deque,
    # which silently dropped positions once the account held more open symbols
    # than the limit the caller happened to pass.
    cache = ArrayCacheBySymbolBySide(2)
    cache.append({
        'symbol': 'BTC/USDT',
        'side': 'long',
        'contracts': 1,
    })
    cache.append({
        'symbol': 'ETH/USDT',
        'side': 'long',
        'contracts': 2,
    })
    cache.append({
        'symbol': 'XRP/USDT',
        'side': 'long',
        'contracts': 3,
    })
    assert len(cache) == 3
    assert len(cache.hashmap) == 3
    assert cache[0]['symbol'] == 'BTC/USDT'
    assert cache[1]['symbol'] == 'ETH/USDT'
    assert cache[2]['symbol'] == 'XRP/USDT'
    # the oldest position must still be addressable by an update
    cache.append({
        'symbol': 'BTC/USDT',
        'side': 'long',
        'contracts': 4,
    })
    assert len(cache) == 3
    assert cache[2]['symbol'] == 'BTC/USDT'
    assert cache[2]['contracts'] == 4


def test_partial_update_merges_into_the_cached_row():
    # invariant guard - an update carrying a subset of the fields must not wipe
    # the fields the cached row already holds
    cache = ArrayCacheBySymbolById()
    cache.append({
        'symbol': 'BTC/USDT',
        'id': '1',
        'status': 'open',
        'amount': 5,
        'fee': {
            'cost': 0.1,
            'currency': 'USDT',
        },
    })
    cache.append({
        'symbol': 'BTC/USDT',
        'id': '1',
        'status': 'closed',
    })
    assert len(cache) == 1
    assert cache[0]['status'] == 'closed'
    assert cache[0]['amount'] == 5
    assert cache[0]['fee']['cost'] == 0.1
    assert cache[0]['fee']['currency'] == 'USDT'

    positions = ArrayCacheBySymbolBySide()
    positions.append({
        'symbol': 'BTC/USDT',
        'side': 'long',
        'contracts': 5,
        'entryPrice': 100,
    })
    positions.append({
        'symbol': 'BTC/USDT',
        'side': 'long',
        'contracts': 3,
    })
    assert len(positions) == 1
    assert positions[0]['contracts'] == 3
    assert positions[0]['entryPrice'] == 100

    # ArrayCacheByTimestamp replaces the whole row, a shorter update must not
    # leave the previous candle's trailing values behind as a stale tail
    by_timestamp = ArrayCacheByTimestamp()
    by_timestamp.append([1000, 1, 2, 0.5, 1.5, 100])
    by_timestamp.append([1000, 9, 8])
    assert len(by_timestamp) == 1
    assert by_timestamp[0] == [1000, 9, 8]


def test_eviction_drops_the_empty_outer_bucket():
    # deleting the id without deleting a bucket that just lost its last id leaks
    # one empty dict per symbol for the lifetime of the process
    cache = ArrayCacheBySymbolById(2)
    cache.append({
        'symbol': 'BTC/USDT',
        'id': '1',
        'amount': 1,
    })
    cache.append({
        'symbol': 'ETH/USDT',
        'id': '2',
        'amount': 2,
    })
    cache.append({
        'symbol': 'XRP/USDT',
        'id': '3',
        'amount': 3,
    })
    assert len(cache) == 2  # invariant guard - the bounded cache still evicts
    assert 'BTC/USDT' not in cache.hashmap
    assert sorted(list(cache.hashmap.keys())) == ['ETH/USDT', 'XRP/USDT']
    assert len(cache._index) == 2

    # a bucket that still holds other ids survives the eviction of one of them
    multi = ArrayCacheBySymbolById(2)
    multi.append({
        'symbol': 'BTC/USDT',
        'id': '1',
        'amount': 1,
    })
    multi.append({
        'symbol': 'BTC/USDT',
        'id': '2',
        'amount': 2,
    })
    multi.append({
        'symbol': 'BTC/USDT',
        'id': '3',
        'amount': 3,
    })
    assert len(multi) == 2
    assert sorted(list(multi.hashmap['BTC/USDT'].keys())) == ['2', '3']
    # the evicted id comes back as a brand new row rather than resolving to a
    # stale index position
    multi.append({
        'symbol': 'BTC/USDT',
        'id': '1',
        'amount': 4,
    })
    assert len(multi) == 2
    assert multi[1]['id'] == '1'
    assert multi[1]['amount'] == 4
    assert sorted(list(multi.hashmap['BTC/USDT'].keys())) == ['1', '3']


def test_ws_cache_python_regressions():
    test_max_size_zero_is_unbounded()
    test_index_token_does_not_collide_across_the_field_boundary()
    test_numeric_id_does_not_raise()
    test_clear_resets_the_sidecar_bookkeeping()
    test_by_symbol_by_side_does_not_evict()
    test_partial_update_merges_into_the_cached_row()
    test_eviction_drops_the_empty_outer_bucket()


if __name__ == '__main__':
    test_ws_cache_python_regressions()
    print('test_cache_native passed')
