package ccxt

import (
	"fmt"
	"sync"
	"testing"
)

// ---------------------------------------------------------------------------
// Regression tests for the Go ws cache fixes in
// https://github.com/ccxt/ccxt/pull/29874.
//
// go/v4/exchange_cache.go is a hand-written port of ts/src/base/ws/Cache.ts and
// had drifted from it in ways the shared transpiled base test (go/tests, which
// only exercises the nested by-id caches) never reached:
//
//   1. ArrayCache.Append upserted by id, so a plain trades cache silently
//      collapsed distinct trades that shared an id - and dropped every trade of
//      the exchanges that send no id at all.
//   2. GetLimit on a plain cache had no per-symbol counter, so it fell through
//      to returning the caller's raw limit argument instead of the number of
//      new updates.
//   3. clearUpdatesBySymbol was tested for key *presence* rather than for its
//      boolean value, so after the first GetLimit every later batch reported 1.
//   4. GetLimit mutated the trackers without holding Mu while the ws read loop
//      appended concurrently.
//   5. ArrayCacheByTimestamp evicted rows from Data without pruning Hashmap, so
//      the stale index made a later candle for that timestamp take the "update"
//      branch and vanish.
//   6. A shorter candle update indexed past its own end / left a stale tail.
//   7. Clear() left Hashmap and the update trackers populated.
//
// Every assertion below fails on the pre-fix implementation.
// ---------------------------------------------------------------------------

// cacheLimitInt normalises the loosely-typed GetLimit return value. MathMin
// returns float64, the counters return int, hence the any-typed contract.
func cacheLimitInt(t *testing.T, label string, v any) int {
	t.Helper()
	switch n := v.(type) {
	case int:
		return n
	case int64:
		return int(n)
	case float64:
		return int(n)
	case nil:
		t.Fatalf("%s: GetLimit returned nil", label)
	}
	t.Fatalf("%s: GetLimit returned unexpected type %T (%v)", label, v, v)
	return 0
}

func cacheTrade(symbol, id string, amount float64) map[string]any {
	return map[string]any{"symbol": symbol, "id": id, "amount": amount}
}

// cacheRowString renders a cached OHLCV row for comparison.
func cacheRowString(t *testing.T, row any) string {
	t.Helper()
	arr, ok := row.([]any)
	if !ok {
		t.Fatalf("cached row is %T, want []any", row)
	}
	return fmt.Sprint(arr)
}

// ---------------------------------------------------------------------------
// 1. plain ArrayCache.Append is FIFO, the by-id caches upsert
// ---------------------------------------------------------------------------

func TestArrayCacheAppendIsFIFONotUpsert(t *testing.T) {
	// Two fills of the same order arrive as two distinct public trades; some
	// exchanges even reuse the trade id across the pair. A plain ArrayCache
	// must keep both rows - JS `class ArrayCache` has no hashmap at all.
	plain := NewArrayCache(10)
	plain.Append(cacheTrade("BTC/USDT", "t1", 1))
	plain.Append(cacheTrade("BTC/USDT", "t1", 2))

	rows := plain.ToArray()
	if len(rows) != 2 {
		t.Fatalf("plain ArrayCache collapsed same-id trades: len=%d, want 2", len(rows))
	}
	for i, want := range []float64{1, 2} {
		got := rows[i].(map[string]any)["amount"]
		if got != want {
			t.Fatalf("plain row %d amount=%v, want %v (FIFO order lost)", i, got, want)
		}
	}

	// the nested cache is the one that upserts, and it merges into the stored
	// reference rather than appending a second row
	byId := NewArrayCacheBySymbolById(10)
	byId.Append(cacheTrade("BTC/USDT", "t1", 1))
	byId.Append(cacheTrade("BTC/USDT", "t1", 2))

	nested := byId.ToArray()
	if len(nested) != 1 {
		t.Fatalf("ArrayCacheBySymbolById did not upsert: len=%d, want 1", len(nested))
	}
	if got := nested[0].(map[string]any)["amount"]; got != 2.0 {
		t.Fatalf("upserted row amount=%v, want 2", got)
	}
}

func TestArrayCacheAppendEvictsOldestAtMaxSize(t *testing.T) {
	c := NewArrayCache(3)
	for i := 1; i <= 5; i++ {
		c.Append(cacheTrade("BTC/USDT", fmt.Sprintf("t%d", i), float64(i)))
	}
	rows := c.ToArray()
	if len(rows) != 3 {
		t.Fatalf("len=%d, want 3 (maxSize)", len(rows))
	}
	for i, want := range []float64{3, 4, 5} {
		if got := rows[i].(map[string]any)["amount"]; got != want {
			t.Fatalf("row %d amount=%v, want %v", i, got, want)
		}
	}
}

// ---------------------------------------------------------------------------
// 2. GetLimit on a plain cache returns the update counter, not the raw limit
// ---------------------------------------------------------------------------

func TestArrayCacheGetLimitReturnsUpdateCounter(t *testing.T) {
	c := NewArrayCache(100)
	for i := 0; i < 5; i++ {
		c.Append(cacheTrade("BTC/USDT", fmt.Sprintf("t%d", i), float64(i)))
	}
	// pre-fix this returned the raw `limit` argument because the plain cache
	// kept no counter and newUpdatesValue stayed nil
	if got := cacheLimitInt(t, "counter", c.GetLimit("BTC/USDT", nil)); got != 5 {
		t.Fatalf("GetLimit(symbol, nil)=%d, want 5", got)
	}

	fresh := NewArrayCache(100)
	for i := 0; i < 5; i++ {
		fresh.Append(cacheTrade("BTC/USDT", fmt.Sprintf("t%d", i), float64(i)))
	}
	if got := cacheLimitInt(t, "min", fresh.GetLimit("BTC/USDT", 3)); got != 3 {
		t.Fatalf("GetLimit(symbol, 3)=%d, want 3 (min of 5 and 3)", got)
	}

	// an unseen symbol has no counter at all: the raw limit is the fallback
	if got := cacheLimitInt(t, "unseen", fresh.GetLimit("ETH/USDT", 7)); got != 7 {
		t.Fatalf("GetLimit(unseen, 7)=%d, want 7", got)
	}
	if fresh.GetLimit("ETH/USDT", nil) != nil {
		t.Fatalf("GetLimit(unseen, nil)=%v, want nil", fresh.GetLimit("ETH/USDT", nil))
	}
}

func TestArrayCacheGetLimitAllSymbols(t *testing.T) {
	c := NewArrayCache(100)
	for i := 0; i < 4; i++ {
		c.Append(cacheTrade("BTC/USDT", fmt.Sprintf("b%d", i), float64(i)))
	}
	for i := 0; i < 3; i++ {
		c.Append(cacheTrade("ETH/USDT", fmt.Sprintf("e%d", i), float64(i)))
	}
	if got := cacheLimitInt(t, "all", c.GetLimit(nil, nil)); got != 7 {
		t.Fatalf("GetLimit(nil, nil)=%d, want 7", got)
	}
}

// ---------------------------------------------------------------------------
// 3. clearUpdatesBySymbol is a boolean *value*, not a key presence check
// ---------------------------------------------------------------------------

func TestArrayCacheClearUpdatesUsesBooleanValue(t *testing.T) {
	c := NewArrayCache(100)
	appendBatch := func(n int, tag string) {
		for i := 0; i < n; i++ {
			c.Append(cacheTrade("BTC/USDT", fmt.Sprintf("%s%d", tag, i), float64(i)))
		}
	}

	appendBatch(5, "a")
	if got := cacheLimitInt(t, "batch1", c.GetLimit("BTC/USDT", nil)); got != 5 {
		t.Fatalf("first batch=%d, want 5", got)
	}

	// after the consuming GetLimit the key exists with value false; a presence
	// check reset the counter on *every* append and reported 1 forever
	appendBatch(5, "b")
	if got := cacheLimitInt(t, "batch2", c.GetLimit("BTC/USDT", nil)); got != 5 {
		t.Fatalf("second batch=%d, want 5 (counter reset on every append)", got)
	}

	appendBatch(2, "c")
	if got := cacheLimitInt(t, "batch3", c.GetLimit("BTC/USDT", nil)); got != 2 {
		t.Fatalf("third batch=%d, want 2", got)
	}
}

func TestArrayCacheBySymbolByIdClearUpdatesUsesBooleanValue(t *testing.T) {
	c := NewArrayCacheBySymbolById(100)
	appendBatch := func(n int, tag string) {
		for i := 0; i < n; i++ {
			c.Append(cacheTrade("BTC/USDT", fmt.Sprintf("%s%d", tag, i), float64(i)))
		}
	}

	appendBatch(4, "a")
	if got := cacheLimitInt(t, "nested batch1", c.GetLimit("BTC/USDT", nil)); got != 4 {
		t.Fatalf("nested first batch=%d, want 4", got)
	}
	appendBatch(4, "b")
	if got := cacheLimitInt(t, "nested batch2", c.GetLimit("BTC/USDT", nil)); got != 4 {
		t.Fatalf("nested second batch=%d, want 4", got)
	}

	// the nested cache counts *entities*, so re-updating one id counts once
	c.Append(cacheTrade("BTC/USDT", "same", 1))
	c.Append(cacheTrade("BTC/USDT", "same", 2))
	c.Append(cacheTrade("BTC/USDT", "same", 3))
	if got := cacheLimitInt(t, "nested dedup", c.GetLimit("BTC/USDT", nil)); got != 1 {
		t.Fatalf("repeated updates of one id=%d, want 1", got)
	}
}

// ---------------------------------------------------------------------------
// 4. GetLimit takes the mutex (ws read loop appends while the caller drains)
// ---------------------------------------------------------------------------

func TestArrayCacheGetLimitIsLocked(t *testing.T) {
	c := NewArrayCache(50)
	const workers, iterations = 4, 300

	var wg sync.WaitGroup
	for w := 0; w < workers; w++ {
		wg.Add(2)
		go func(w int) {
			defer wg.Done()
			for i := 0; i < iterations; i++ {
				c.Append(cacheTrade("BTC/USDT", fmt.Sprintf("w%d-%d", w, i), float64(i)))
			}
		}(w)
		go func() {
			defer wg.Done()
			for i := 0; i < iterations; i++ {
				// pre-fix this read and wrote the tracker maps unsynchronised,
				// which the race detector flags and the runtime can turn into a
				// fatal "concurrent map read and map write"
				c.GetLimit("BTC/USDT", nil)
				c.GetLimit(nil, 10)
			}
		}()
	}
	wg.Wait()

	if got := len(c.ToArray()); got != 50 {
		t.Fatalf("len after concurrent appends=%d, want 50 (maxSize)", got)
	}
}

// ---------------------------------------------------------------------------
// 5. ArrayCacheByTimestamp prunes Hashmap on eviction
// ---------------------------------------------------------------------------

func TestArrayCacheByTimestampPrunesHashmapOnEvict(t *testing.T) {
	c := NewArrayCacheByTimestamp(3)
	for i := 1; i <= 10; i++ {
		c.Append([]any{int64(i), 1.0, 2.0, 0.5, 1.5, 100.0})
	}

	if len(c.Data) != 3 {
		t.Fatalf("Data len=%d, want 3", len(c.Data))
	}
	// the index grew unbounded before the fix - one entry per candle ever seen
	if len(c.Hashmap) != 3 {
		t.Fatalf("Hashmap len=%d, want 3 (stale entries outlived Data)", len(c.Hashmap))
	}
	for i, wantTs := range []int64{8, 9, 10} {
		ts, ok := rowTimestamp(c.Data[i])
		if !ok || ts != wantTs {
			t.Fatalf("Data[%d] timestamp=%v (ok=%v), want %d", i, ts, ok, wantTs)
		}
		if _, indexed := c.Hashmap[wantTs]; !indexed {
			t.Fatalf("Hashmap missing surviving timestamp %d", wantTs)
		}
	}

	// a candle whose timestamp was evicted must be re-inserted, not swallowed:
	// with a stale index this took the update branch, replaceRowLocked found
	// nothing to swap and the candle disappeared entirely
	c.Append([]any{int64(1), 9.0, 9.0, 9.0, 9.0, 9.0})
	if len(c.Data) != 3 {
		t.Fatalf("Data len after re-appending evicted ts=%d, want 3", len(c.Data))
	}
	if got := cacheRowString(t, c.Data[2]); got != "[1 9 9 9 9 9]" {
		t.Fatalf("re-appended candle=%s, want [1 9 9 9 9 9]", got)
	}
	if len(c.Hashmap) != 3 {
		t.Fatalf("Hashmap len after re-append=%d, want 3", len(c.Hashmap))
	}
}

func TestArrayCacheByTimestampUpsertsSameTimestamp(t *testing.T) {
	c := NewArrayCacheByTimestamp(5)
	c.Append([]any{int64(100), 1.0, 2.0, 0.5, 1.5, 10.0})
	c.Append([]any{int64(100), 1.0, 3.0, 0.5, 2.5, 20.0})

	if len(c.Data) != 1 {
		t.Fatalf("same timestamp appended twice: len=%d, want 1", len(c.Data))
	}
	if got := cacheRowString(t, c.Data[0]); got != "[100 1 3 0.5 2.5 20]" {
		t.Fatalf("updated candle=%s, want [100 1 3 0.5 2.5 20]", got)
	}
	// one candle, updated twice, is one new update
	if got := cacheLimitInt(t, "ohlcv updates", c.GetLimit(nil, nil)); got != 1 {
		t.Fatalf("GetLimit=%d, want 1", got)
	}
}

// ---------------------------------------------------------------------------
// 6. short / long candle updates
// ---------------------------------------------------------------------------

func TestArrayCacheByTimestampShorterCandleUpdate(t *testing.T) {
	c := NewArrayCacheByTimestamp(5)
	c.Append([]any{100, 1, 2, 3, 4, 5})
	// a partial update must define the row: indexing the incoming (shorter)
	// row against the stored length panicked, and copying element-wise left a
	// stale [.. 3 4 5] tail behind
	c.Append([]any{100, 9, 9})

	if len(c.Data) != 1 {
		t.Fatalf("len=%d, want 1", len(c.Data))
	}
	if got := cacheRowString(t, c.Data[0]); got != "[100 9 9]" {
		t.Fatalf("short update produced %s, want [100 9 9]", got)
	}
	// Data and Hashmap must point at the same row
	if got := cacheRowString(t, c.Hashmap[100]); got != "[100 9 9]" {
		t.Fatalf("hashmap row=%s, want [100 9 9]", got)
	}
	if len(c.Hashmap) != 1 {
		t.Fatalf("Hashmap len=%d, want 1", len(c.Hashmap))
	}
}

func TestArrayCacheByTimestampLongerCandleUpdate(t *testing.T) {
	c := NewArrayCacheByTimestamp(5)
	c.Append([]any{100, 1, 2})
	c.Append([]any{100, 7, 7, 7, 7, 7})

	if len(c.Data) != 1 {
		t.Fatalf("len=%d, want 1", len(c.Data))
	}
	if got := cacheRowString(t, c.Data[0]); got != "[100 7 7 7 7 7]" {
		t.Fatalf("long update produced %s, want [100 7 7 7 7 7]", got)
	}
	if got := cacheRowString(t, c.Hashmap[100]); got != "[100 7 7 7 7 7]" {
		t.Fatalf("hashmap row=%s, want [100 7 7 7 7 7]", got)
	}
}

func TestArrayCacheByTimestampNumericStringKeyMatchesInt(t *testing.T) {
	// JS indexes the hashmap by the stringified timestamp, so "100" and 100
	// must land on the same bucket instead of duplicating the candle
	c := NewArrayCacheByTimestamp(5)
	c.Append([]any{int64(100), 1, 2})
	c.Append([]any{"100", 3, 4})

	if len(c.Data) != 1 {
		t.Fatalf("numeric-string timestamp duplicated the row: len=%d, want 1", len(c.Data))
	}
	if got := cacheRowString(t, c.Data[0]); got != "[100 3 4]" {
		t.Fatalf("row=%s, want [100 3 4]", got)
	}
}

// ---------------------------------------------------------------------------
// 7. Clear() resets the indexes and the trackers
// ---------------------------------------------------------------------------

func TestArrayCacheClearResetsHashmapAndTrackers(t *testing.T) {
	c := NewArrayCacheBySymbolById(10)
	c.Append(map[string]any{"symbol": "BTC/USDT", "id": "o1", "amount": 1.0, "stale": true})
	c.Append(map[string]any{"symbol": "BTC/USDT", "id": "o2", "amount": 2.0})

	c.Clear()

	if len(c.ToArray()) != 0 {
		t.Fatalf("Data not cleared: len=%d", len(c.ToArray()))
	}
	if len(c.Hashmap) != 0 {
		t.Fatalf("Hashmap not cleared: len=%d", len(c.Hashmap))
	}
	if got := c.GetLimit("BTC/USDT", nil); got != nil {
		t.Fatalf("update counters survived Clear: GetLimit=%v, want nil", got)
	}

	// re-appending a previously cached id must build a fresh row, not merge
	// into the reference the stale hashmap was still holding
	c2 := NewArrayCacheBySymbolById(10)
	c2.Append(map[string]any{"symbol": "BTC/USDT", "id": "o1", "amount": 1.0, "stale": true})
	c2.Clear()
	c2.Append(map[string]any{"symbol": "BTC/USDT", "id": "o1", "amount": 5.0})

	rows := c2.ToArray()
	if len(rows) != 1 {
		t.Fatalf("re-append after Clear: len=%d, want 1", len(rows))
	}
	row := rows[0].(map[string]any)
	if _, leaked := row["stale"]; leaked {
		t.Fatalf("row merged into the pre-Clear reference: %v", row)
	}
	if row["amount"] != 5.0 {
		t.Fatalf("amount=%v, want 5", row["amount"])
	}
	if got := cacheLimitInt(t, "post-clear updates", c2.GetLimit("BTC/USDT", nil)); got != 1 {
		t.Fatalf("post-Clear GetLimit=%d, want 1", got)
	}
}

func TestArrayCacheByTimestampClearResetsHashmap(t *testing.T) {
	c := NewArrayCacheByTimestamp(5)
	c.Append([]any{int64(1), 1, 1})
	c.Append([]any{int64(2), 2, 2})

	c.Clear()

	if len(c.Data) != 0 {
		t.Fatalf("Data not cleared: len=%d", len(c.Data))
	}
	if len(c.Hashmap) != 0 {
		t.Fatalf("Hashmap not cleared: len=%d", len(c.Hashmap))
	}
	if got := cacheLimitInt(t, "cleared updates", c.GetLimit(nil, nil)); got != 0 {
		t.Fatalf("newUpdates survived Clear: %d, want 0", got)
	}

	// with a surviving index this hit the update branch, replaceRowLocked found
	// no row to swap and the candle was lost
	c.Append([]any{int64(1), 9, 9})
	if len(c.Data) != 1 {
		t.Fatalf("candle lost after Clear: len=%d, want 1", len(c.Data))
	}
	if got := cacheRowString(t, c.Data[0]); got != "[1 9 9]" {
		t.Fatalf("row=%s, want [1 9 9]", got)
	}
}

// ---------------------------------------------------------------------------
// 8. trades without an id are all distinct updates
// ---------------------------------------------------------------------------

func TestArrayCacheIdlessTradesCountIndividually(t *testing.T) {
	// many exchanges publish public trades with no id at all; keying on the
	// missing id collapsed the whole batch onto one row and reported 1 update
	c := NewArrayCache(100)
	for i := 0; i < 10; i++ {
		c.Append(map[string]any{"symbol": "BTC/USDT", "amount": float64(i)})
	}

	if got := len(c.ToArray()); got != 10 {
		t.Fatalf("id-less trades collapsed: len=%d, want 10", got)
	}
	if got := cacheLimitInt(t, "idless all", c.GetLimit(nil, nil)); got != 10 {
		t.Fatalf("GetLimit(nil, nil)=%d, want 10", got)
	}

	bySymbol := NewArrayCache(100)
	for i := 0; i < 10; i++ {
		bySymbol.Append(map[string]any{"symbol": "BTC/USDT", "amount": float64(i)})
	}
	if got := cacheLimitInt(t, "idless symbol", bySymbol.GetLimit("BTC/USDT", nil)); got != 10 {
		t.Fatalf("GetLimit(symbol, nil)=%d, want 10", got)
	}
}

func TestArrayCacheSymbollessTradesTrackedUnderEmptyKey(t *testing.T) {
	// ohlcv-style plain caches receive rows with no symbol field; they must
	// still accumulate rather than fall through to the raw limit
	c := NewArrayCache(100)
	for i := 0; i < 3; i++ {
		c.Append(map[string]any{"amount": float64(i)})
	}
	if got := cacheLimitInt(t, "symbolless", c.GetLimit(nil, nil)); got != 3 {
		t.Fatalf("GetLimit(nil, nil)=%d, want 3", got)
	}
}
