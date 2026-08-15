<?php
namespace ccxt\pro;

// native php regression tests, hand-written.
//
// `test_cache.php` is GENERATED from `ts/src/pro/test/base/test.cache.ts` and is
// overwritten by the transpiler, so it cannot host php-specific assertions. The
// bugs locked in below are all php-only divergences from the typescript source
// (reference-vs-merge assignment, array-key coercion, `array_search()` returning
// `false`, `clear()` not reaching the subclass bookkeeping) — none of them are
// expressible in the shared transpiled test. They live here, in the same spirit
// as `test_client_retention.php`.
//
// Wired into `php/pro/test/base/tests_init.php`, which is hand-written.

include_once (__DIR__.'/../../../../ccxt.php');

// ----------------------------------------------------------------------------
// tiny assertion harness
//
// deliberately NOT php's `assert()`: the default `zend.assertions=-1` compiles
// assert() calls out entirely, so a regression suite built on it silently passes
// on a stock php install. `check()` is a plain conditional and always runs.
// ----------------------------------------------------------------------------

$GLOBALS['cache_php_checks'] = 0;

function check($condition, $message) {
    $GLOBALS['cache_php_checks'] = $GLOBALS['cache_php_checks'] + 1;
    if (!$condition) {
        throw new \Exception('php ArrayCache regression FAILED: ' . $message);
    }
}

// Runs $fn with every diagnostic (warning / notice / deprecation) promoted to an
// exception, so "Trying to access array offset on null" or "Implicit conversion
// from float ... loses precision" fails the suite instead of scrolling past.
function without_diagnostics($fn, $message) {
    set_error_handler(function ($severity, $text, $file, $line) use ($message) {
        restore_error_handler();
        throw new \Exception('php ArrayCache regression FAILED: ' . $message . ' — php emitted: ' . $text);
    });
    try {
        $result = $fn();
    } finally {
        restore_error_handler();
    }
    return $result;
}

// ----------------------------------------------------------------------------

function test_php_field_wise_merge() {
    // An update that names a subset of the fields must MERGE into the stored
    // row, mirroring `for (const prop in item)` in Cache.ts. Assigning the
    // incoming array wholesale (`$prev_ref = $item;`) silently dropped every
    // field the delta did not repeat — fee, amount, trades, clientOrderId ...
    $cache = new ArrayCacheBySymbolById();
    $cache->append(array(
        'id' => '1',
        'symbol' => 'BTC/USDT',
        'status' => 'open',
        'amount' => 5.0,
        'fee' => array( 'cost' => 0.1, 'currency' => 'USDT' ),
    ));
    $cache->append(array(
        'id' => '1',
        'symbol' => 'BTC/USDT',
        'status' => 'closed',
    ));
    check(count($cache) === 1, 'ById merge must update in place, not add a row');
    $order = $cache[0];
    check($order['status'] === 'closed', 'ById merge must apply the new status');
    check($order['amount'] === 5.0, 'ById merge must preserve amount the update omitted');
    check(($order['fee']['cost'] ?? null) === 0.1, 'ById merge must preserve fee the update omitted');
    check(($order['fee']['currency'] ?? null) === 'USDT', 'ById merge must preserve nested fee fields');

    // same contract for positions
    $positions = new ArrayCacheBySymbolBySide();
    $positions->append(array(
        'symbol' => 'BTC/USDT',
        'side' => 'long',
        'contracts' => 3,
        'entryPrice' => 100.0,
        'leverage' => 10,
    ));
    $positions->append(array(
        'symbol' => 'BTC/USDT',
        'side' => 'long',
        'contracts' => 4,
    ));
    check(count($positions) === 1, 'BySide merge must update in place, not add a row');
    check($positions[0]['contracts'] === 4, 'BySide merge must apply the new contracts');
    check($positions[0]['entryPrice'] === 100.0, 'BySide merge must preserve entryPrice the delta omitted');
    check($positions[0]['leverage'] === 10, 'BySide merge must preserve leverage the delta omitted');

    // ... and for ohlcv rows keyed by timestamp
    $ohlcv = new ArrayCacheByTimestamp();
    $ohlcv->append(array( 1000, 1.0, 2.0, 0.5, 1.5, 100.0 ));
    $ohlcv->append(array( 1000, 1.0, 3.0 )); // a partial candle update
    check(count($ohlcv) === 1, 'ByTimestamp merge must update in place');
    check($ohlcv[0][2] === 3.0, 'ByTimestamp merge must apply the new high');
    check($ohlcv[0][4] === 1.5, 'ByTimestamp merge must preserve the close the update omitted');
    check($ohlcv[0][5] === 100.0, 'ByTimestamp merge must preserve the volume the update omitted');
}

function test_php_two_field_match() {
    // The positional index used to be a bare concatenation `$key . $id`, which
    // is not injective: ('BTC/USDT1', '2') and ('BTC/USDT', '12') both encode
    // to "BTC/USDT12". Updating one then spliced the other out of the deque.
    $cache = new ArrayCacheBySymbolById();
    $cache->append(array( 'symbol' => 'BTC/USDT1', 'id' => '2', 'tag' => 'first' ));
    $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '12', 'tag' => 'second' ));
    check(count($cache) === 2, 'colliding (symbol, id) concatenations must stay two rows');
    $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '12', 'tag' => 'second-updated' ));
    check(count($cache) === 2, 'updating the second row must not drop the first');

    $tags = array();
    for ($i = 0; $i < count($cache); $i++) {
        $tags[] = $cache[$i]['symbol'] . '|' . $cache[$i]['id'] . '|' . $cache[$i]['tag'];
    }
    // the updated row moves to the back, the untouched row survives verbatim
    check($tags[0] === 'BTC/USDT1|2|first', 'the ambiguous sibling row must survive untouched, got ' . $tags[0]);
    check($tags[1] === 'BTC/USDT|12|second-updated', 'the updated row must be the one that moved, got ' . $tags[1]);

    // the same ambiguity on (symbol, side) for positions
    $positions = new ArrayCacheBySymbolBySide();
    $positions->append(array( 'symbol' => 'BTC/USDTlo', 'side' => 'ng', 'tag' => 'first' ));
    $positions->append(array( 'symbol' => 'BTC/USDT', 'side' => 'long', 'tag' => 'second' ));
    check(count($positions) === 2, 'colliding (symbol, side) concatenations must stay two rows');
    $positions->append(array( 'symbol' => 'BTC/USDT', 'side' => 'long', 'tag' => 'second-updated' ));
    check(count($positions) === 2, 'updating the second position must not drop the first');
    check($positions[0]['tag'] === 'first', 'the ambiguous sibling position must survive untouched');
    check($positions[1]['tag'] === 'second-updated', 'the updated position must be the one that moved');

    // an order id is only unique per symbol on many venues (binance), so the
    // SAME id under two symbols has to stay two independent rows
    $shared = new ArrayCacheBySymbolById();
    $shared->append(array( 'symbol' => 'BTC/USDT', 'id' => '1', 'status' => 'open' ));
    $shared->append(array( 'symbol' => 'ETH/USDT', 'id' => '1', 'status' => 'open' ));
    check(count($shared) === 2, 'the same id under two symbols must be two rows');
    $shared->append(array( 'symbol' => 'ETH/USDT', 'id' => '1', 'status' => 'closed' ));
    check(count($shared) === 2, 'updating one symbol must not evict the other');
    check($shared[0]['symbol'] === 'BTC/USDT' && $shared[0]['status'] === 'open', 'the other symbol row must be untouched');
    check($shared[1]['symbol'] === 'ETH/USDT' && $shared[1]['status'] === 'closed', 'the updated symbol row must be current');
}

function test_php_strict_index_search() {
    // `array_search()` without the strict flag compares with `==`. Two numeric
    // strings compare NUMERICALLY in php 8 — "1e1" == "10" is true — so a loose
    // lookup could match a different row's index entry and splice it out.
    check(('1e1' == '10'), 'sanity: php compares two numeric strings numerically');
    check(('1e1' !== '10'), 'sanity: strict comparison keeps them distinct');

    $cache = new ArrayCacheByOutcomeById(); // key_field = outcome, values can be numeric
    $cache->append(array( 'outcome' => '1e', 'id' => '1', 'tag' => 'first' ));
    $cache->append(array( 'outcome' => '1', 'id' => '0', 'tag' => 'second' ));
    check(count($cache) === 2, 'numeric-string keys must stay two rows');
    $cache->append(array( 'outcome' => '1', 'id' => '0', 'tag' => 'second-updated' ));
    check(count($cache) === 2, 'a loose index match must not splice the wrong row');
    check($cache[0]['tag'] === 'first', 'the numerically-equal sibling row must survive');
    check($cache[1]['tag'] === 'second-updated', 'the updated row must be the one that moved');
}

function test_php_index_miss_does_not_splice() {
    // Defensive guard. `array_search()` returns `false` on a miss and
    // `array_splice($a, false, 1)` coerces that to 0, silently deleting the
    // FIRST row. Reachable only if the hashmap and the positional index ever
    // desync, so the desync is forced here with reflection.
    $cache = new ArrayCacheBySymbolById();
    $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '1', 'tag' => 'first' ));
    $cache->append(array( 'symbol' => 'ETH/USDT', 'id' => '2', 'tag' => 'second' ));

    $index_property = new \ReflectionProperty(ArrayCacheBySymbolById::class, 'index');
    $index_property->setValue($cache, array()); // hashmap still knows both ids

    $cache->append(array( 'symbol' => 'ETH/USDT', 'id' => '2', 'tag' => 'second-updated' ));
    check($cache[0]['tag'] === 'first', 'an index miss must not splice row 0 out of the deque');
    check($cache[0]['symbol'] === 'BTC/USDT', 'the surviving first row must still be the first symbol');
}

function test_php_clear_wipes_keyed_state() {
    // `BaseCache::clear()` only emptied the deque. The hashmap and the
    // positional index survived, so a re-appended row took the "already known"
    // branch and spliced against an index whose deque rows no longer existed.
    $cache = new ArrayCacheBySymbolById();
    $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '1', 'tag' => 'a' ));
    $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '2', 'tag' => 'b' ));
    check(count($cache) === 2, 'ById precondition: two rows before clear');
    $cache->clear();
    check(count($cache) === 0, 'ById clear() must empty the deque');
    $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '1', 'tag' => 'a2' ));
    check(count($cache) === 1, 'the first re-appended row must reappear after clear()');
    $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '2', 'tag' => 'b2' ));
    check(count($cache) === 2, 'both re-appended rows must reappear after clear()');
    check($cache[0]['id'] === '1' && $cache[0]['tag'] === 'a2', 'row 1 must be intact after clear + re-append');
    check($cache[1]['id'] === '2' && $cache[1]['tag'] === 'b2', 'row 2 must be intact after clear + re-append');

    // the by-timestamp cache swallowed the re-append entirely: the stale
    // hashmap entry made it look like a duplicate, so nothing hit the deque
    $ohlcv = new ArrayCacheByTimestamp();
    $ohlcv->append(array( 1000, 1.0 ));
    $ohlcv->append(array( 2000, 2.0 ));
    $ohlcv->clear();
    check(count($ohlcv) === 0, 'ByTimestamp clear() must empty the deque');
    $ohlcv->append(array( 1000, 9.0 ));
    check(count($ohlcv) === 1, 'a re-appended timestamp must not be swallowed as a duplicate');
    check($ohlcv[0][1] === 9.0, 'the re-appended candle must carry the new value');
    check($ohlcv->new_updates === 1, 'ByTimestamp clear() must reset the new-updates counter');

    // positions likewise
    $positions = new ArrayCacheBySymbolBySide();
    $positions->append(array( 'symbol' => 'BTC/USDT', 'side' => 'long', 'contracts' => 1 ));
    $positions->append(array( 'symbol' => 'ETH/USDT', 'side' => 'short', 'contracts' => 2 ));
    $positions->clear();
    check(count($positions) === 0, 'BySide clear() must empty the deque');
    $positions->append(array( 'symbol' => 'BTC/USDT', 'side' => 'long', 'contracts' => 3 ));
    $positions->append(array( 'symbol' => 'ETH/USDT', 'side' => 'short', 'contracts' => 4 ));
    check(count($positions) === 2, 'both positions must reappear after clear()');
    check($positions[0]['contracts'] === 3 && $positions[0]['symbol'] === 'BTC/USDT', 'position 1 intact after clear');
    check($positions[1]['contracts'] === 4 && $positions[1]['symbol'] === 'ETH/USDT', 'position 2 intact after clear');

    // the plain cache resets its new-updates bookkeeping too
    $plain = new ArrayCache();
    $plain->append(array( 'symbol' => 'BTC/USDT', 'data' => 1 ));
    $plain->append(array( 'symbol' => 'BTC/USDT', 'data' => 2 ));
    $plain->clear();
    check(count($plain) === 0, 'ArrayCache clear() must empty the deque');
    check($plain->get_limit('BTC/USDT', null) === null, 'ArrayCache clear() must forget per-symbol new updates');
    $plain->append(array( 'symbol' => 'BTC/USDT', 'data' => 3 ));
    check($plain->get_limit('BTC/USDT', null) === 1, 'after clear() the counter must restart at one');
}

function test_php_zero_max_size_is_unbounded() {
    // `count($deque) === $this->max_size` fires on the very first append when
    // max_size is 0, shifting an empty deque and dereferencing the resulting
    // null. A falsy max_size means "unbounded", as it does in the ts source.
    without_diagnostics(function () {
        $cache = new ArrayCacheBySymbolById(0);
        $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '1' ));
        $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '2' ));
        check(count($cache) === 2, 'ById(0) must be unbounded, not evict-everything');
    }, 'ById(0) must not dereference a null shifted off an empty deque');

    without_diagnostics(function () {
        $ohlcv = new ArrayCacheByTimestamp(0);
        $ohlcv->append(array( 1000, 1.0 ));
        $ohlcv->append(array( 2000, 2.0 ));
        check(count($ohlcv) === 2, 'ByTimestamp(0) must be unbounded');
    }, 'ByTimestamp(0) must not dereference a null shifted off an empty deque');

    without_diagnostics(function () {
        $plain = new ArrayCache(0);
        $plain->append(array( 'symbol' => 'BTC/USDT', 'data' => 1 ));
        $plain->append(array( 'symbol' => 'BTC/USDT', 'data' => 2 ));
        check(count($plain) === 2, 'ArrayCache(0) must be unbounded');
    }, 'ArrayCache(0) must not shift an empty deque');

    // and a real max_size still evicts
    $bounded = new ArrayCacheBySymbolById(2);
    $bounded->append(array( 'symbol' => 'BTC/USDT', 'id' => '1' ));
    $bounded->append(array( 'symbol' => 'BTC/USDT', 'id' => '2' ));
    $bounded->append(array( 'symbol' => 'BTC/USDT', 'id' => '3' ));
    check(count($bounded) === 2, 'a truthy max_size must still bound the cache');
    check($bounded[0]['id'] === '2' && $bounded[1]['id'] === '3', 'eviction must drop the oldest row');
}

function test_php_by_side_never_evicts() {
    // Cache.ts constructs ArrayCacheBySymbolBySide without a maxSize, so
    // positions are never evicted — the key space is bounded by symbol x side.
    // The php port inherited an eviction branch that dropped positions once the
    // constructor was handed a size.
    $positions = new ArrayCacheBySymbolBySide(2);
    $positions->append(array( 'symbol' => 'BTC/USDT', 'side' => 'long', 'contracts' => 1 ));
    $positions->append(array( 'symbol' => 'ETH/USDT', 'side' => 'long', 'contracts' => 2 ));
    $positions->append(array( 'symbol' => 'XRP/USDT', 'side' => 'long', 'contracts' => 3 ));
    check(count($positions) === 3, 'BySide must not evict positions, got ' . count($positions));
    check($positions[0]['symbol'] === 'BTC/USDT', 'the oldest position must survive');
    check($positions[2]['symbol'] === 'XRP/USDT', 'the newest position must be last');
}

function test_php_keys_are_string_cast() {
    // php truncates float array keys (and warns since 8.1), so the ids 1.5 and
    // 1.9 both landed on key 1 and collapsed into a single row.
    without_diagnostics(function () {
        $cache = new ArrayCacheBySymbolById();
        $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => 1.5, 'tag' => 'a' ));
        $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => 1.9, 'tag' => 'b' ));
        check(count($cache) === 2, 'float ids 1.5 and 1.9 must not collapse into one row');
        check($cache[0]['tag'] === 'a' && $cache[1]['tag'] === 'b', 'both float-id rows must be kept in order');
    }, 'float ids must not trigger an implicit float-to-int array key conversion');

    without_diagnostics(function () {
        $ohlcv = new ArrayCacheByTimestamp();
        $ohlcv->append(array( 1.5, 'a' ));
        $ohlcv->append(array( 1.9, 'b' ));
        check(count($ohlcv) === 2, 'float timestamps 1.5 and 1.9 must not collapse into one row');
    }, 'float timestamps must not trigger an implicit float-to-int array key conversion');
}

function test_php_get_limit_unknown_symbol() {
    // `$this->new_updates_by_symbol[$symbol]` on a symbol that never arrived
    // raised an "Undefined array key" warning before the null coalesce.
    without_diagnostics(function () {
        $cache = new ArrayCache(10);
        $cache->append(array( 'symbol' => 'BTC/USDT', 'data' => 1 ));
        check($cache->get_limit('ETH/USDT', 5) === 5, 'an unseen symbol must fall back to the requested limit');
        check($cache->get_limit('ETH/USDT', null) === null, 'an unseen symbol with no limit must return null');
    }, 'get_limit() on an unseen symbol must not warn about an undefined array key');
}

function test_php_new_updates_by_symbol_is_always_an_int() {
    // `$new_updates_by_symbol` used to hold a plain int on ArrayCache but a
    // membership ARRAY on the keyed subclasses, and `getLimit()` told the two
    // apart with a `nested_new_updates_by_symbol` flag. That type punning is
    // gone: the distinct ids / sides live in `$seen_updates_by_symbol` and only
    // their count is written back, so `min()` in `getLimit()` can never be
    // handed an array.
    $caches = array(
        'ById' => array( new ArrayCacheBySymbolById(), array( 'symbol' => 'BTC/USDT', 'id' => '1' ) ),
        'BySide' => array( new ArrayCacheBySymbolBySide(), array( 'symbol' => 'BTC/USDT', 'side' => 'long' ) ),
        'ByOutcome' => array( new ArrayCacheByOutcomeById(), array( 'outcome' => 'YES', 'id' => '1' ) ),
        'plain' => array( new ArrayCache(), array( 'symbol' => 'BTC/USDT', 'data' => 1 ) ),
    );
    foreach ($caches as $name => $pair) {
        list($cache, $item) = $pair;
        $cache->append($item);
        $key = $item['symbol'] ?? $item['outcome'];
        check(is_int($cache->new_updates_by_symbol[$key]), $name . ': new_updates_by_symbol must hold an int, got ' . gettype($cache->new_updates_by_symbol[$key]));
        // min() on an array returns the array in php, so a punned value would
        // silently leak out of get_limit() as a non-int here
        check($cache->get_limit($key, 10) === 1, $name . ': get_limit() must return the int count');
    }

    // distinct ids are still counted as distinct, repeats are not
    $orders = new ArrayCacheBySymbolById();
    $orders->append(array( 'symbol' => 'BTC/USDT', 'id' => '1', 'status' => 'open' ));
    $orders->append(array( 'symbol' => 'BTC/USDT', 'id' => '2', 'status' => 'open' ));
    $orders->append(array( 'symbol' => 'BTC/USDT', 'id' => '1', 'status' => 'closed' ));
    $orders->append(array( 'symbol' => 'ETH/USDT', 'id' => '1', 'status' => 'open' ));
    check($orders->new_updates_by_symbol['BTC/USDT'] === 2, 'two distinct ids updated three times must count as two');
    check(count($orders->seen_updates_by_symbol['BTC/USDT']) === 2, 'the seen set must hold the two distinct ids');
    check($orders->all_new_updates === 3, 'all_new_updates must count distinct (symbol, id) pairs, got ' . $orders->all_new_updates);
    check($orders->get_limit(null, null) === 3, 'the symbol-less limit must be the running total');
    check($orders->get_limit('BTC/USDT', 1) === 1, 'a smaller explicit limit must win');

    // sides likewise
    $positions = new ArrayCacheBySymbolBySide();
    $positions->append(array( 'symbol' => 'BTC/USDT', 'side' => 'long', 'contracts' => 1 ));
    $positions->append(array( 'symbol' => 'BTC/USDT', 'side' => 'short', 'contracts' => 2 ));
    $positions->append(array( 'symbol' => 'BTC/USDT', 'side' => 'long', 'contracts' => 3 ));
    check($positions->new_updates_by_symbol['BTC/USDT'] === 2, 'two distinct sides updated three times must count as two');
    check($positions->get_limit('BTC/USDT', null) === 2, 'BySide get_limit() must report the distinct side count');
}

function test_php_consume_resets_the_seen_set() {
    // Reading the limit ARMS a deferred reset; the next append is what actually
    // performs it. The seen set has to be emptied together with the counter,
    // otherwise the second batch keeps counting against the first batch's ids
    // and the consumer is handed a limit that reaches back into rows it has
    // already seen.
    $cache = new ArrayCacheBySymbolById();
    $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '1' ));
    $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '2' ));
    check($cache->get_limit('BTC/USDT', null) === 2, 'precondition: the first batch is two ids');
    $cache->append(array( 'symbol' => 'BTC/USDT', 'id' => '3' ));
    check($cache->new_updates_by_symbol['BTC/USDT'] === 1, 'the per-symbol reset must restart the count at one');
    check(count($cache->seen_updates_by_symbol['BTC/USDT']) === 1, 'the per-symbol reset must empty the seen set too');
    check($cache->get_limit('BTC/USDT', null) === 1, 'only the row appended after the read is new');

    // and the symbol-less read wipes BOTH maps on the next append
    $all = new ArrayCacheBySymbolById();
    $all->append(array( 'symbol' => 'BTC/USDT', 'id' => '1' ));
    $all->append(array( 'symbol' => 'ETH/USDT', 'id' => '1' ));
    check($all->get_limit(null, null) === 2, 'precondition: two symbols, two new updates');
    $all->append(array( 'symbol' => 'BTC/USDT', 'id' => '2' ));
    check($all->all_new_updates === 1, 'the deferred all-clear must restart the running total');
    check(array_keys($all->new_updates_by_symbol) === array( 'BTC/USDT' ), 'the deferred all-clear must drop the stale per-symbol counts');
    check(array_keys($all->seen_updates_by_symbol) === array( 'BTC/USDT' ), 'the deferred all-clear must drop the stale seen sets');
    check($all->new_updates_by_symbol['BTC/USDT'] === 1, 'the surviving symbol restarts at one, not at its pre-clear count');

    // clear() wipes the seen sets with everything else
    $wiped = new ArrayCacheBySymbolById();
    $wiped->append(array( 'symbol' => 'BTC/USDT', 'id' => '1' ));
    $wiped->clear();
    check($wiped->seen_updates_by_symbol === array(), 'clear() must wipe the seen sets');
    check($wiped->new_updates_by_symbol === array(), 'clear() must wipe the per-symbol counts');
    check($wiped->get_limit('BTC/USDT', 5) === 5, 'after clear() an unseen symbol falls back to the requested limit');
}

// ----------------------------------------------------------------------------

function test_ws_cache_php() {
    test_php_field_wise_merge();
    test_php_two_field_match();
    test_php_strict_index_search();
    test_php_index_miss_does_not_splice();
    test_php_clear_wipes_keyed_state();
    test_php_zero_max_size_is_unbounded();
    test_php_by_side_never_evicts();
    test_php_keys_are_string_cast();
    test_php_get_limit_unknown_symbol();
    test_php_new_updates_by_symbol_is_always_an_int();
    test_php_consume_resets_the_seen_set();
    print('php ArrayCache regression probes passed: ' . $GLOBALS['cache_php_checks'] . " assertions\n");
}
