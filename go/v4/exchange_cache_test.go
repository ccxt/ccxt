package ccxt

import (
	"sync"
	"testing"
)

func TestArrayCacheRawKeyTypes(t *testing.T) {
	for _, field := range []string{"symbol", "outcome"} {
		for _, raw := range []any{1, int64(1), float64(1), true, "1"} {
			cache := NewArrayCacheBySymbolById(3).ArrayCache
			if field == "outcome" {
				cache = NewArrayCacheByOutcomeById(3).ArrayCache
			}
			original := map[string]any{field: raw, "id": raw, "retained": true}
			cache.Append(original)
			cache.Append(map[string]any{field: "other", "id": raw})
			// Merge a normalized string, then a raw value into the same bucket.
			// Both scan operands must use the post-merge values.
			cache.Append(map[string]any{field: ToString(raw), "id": ToString(raw)})
			cache.Append(map[string]any{field: "last", "id": "last"})
			cache.Append(map[string]any{field: raw, "id": raw, "updated": true})
			rows := cache.ToArray()
			if len(rows) != 3 || rows[0].(map[string]any)[field] != "other" || rows[1].(map[string]any)[field] != "last" || rows[2].(map[string]any)[field] != raw {
				t.Fatalf("%s / %T: raw-key update changed order: %v", field, raw, rows)
			}
			rows[2].(map[string]any)["alias"] = true
			if original["alias"] != true || original["retained"] != true || original["updated"] != true {
				t.Fatal("raw-key update must retain the stored map identity and fields")
			}
		}
	}
}

func TestArrayCacheConcurrentAppendAndSnapshot(t *testing.T) {
	// Snapshots copy the slice, not its mutable maps. Inspect row contents
	// only after writers finish; polling GetLimit concurrently is not safe.
	for _, cache := range []*ArrayCache{NewArrayCacheBySymbolById(32).ArrayCache, NewArrayCacheByOutcomeById(32).ArrayCache} {
		var workers sync.WaitGroup
		for worker := 0; worker < 4; worker++ {
			workers.Add(1)
			go func() {
				defer workers.Done()
				for i := 0; i < 1000; i++ {
					cache.Append(map[string]any{cache.keyField: "A", "id": i % 32, "value": i})
					if len(cache.ToArray()) > 32 {
						t.Error("concurrent append exceeded capacity")
					}
				}
			}()
		}
		workers.Wait()
		rows := cache.ToArray()
		seen := make(map[any]bool)
		for _, row := range rows {
			seen[row.(map[string]any)["id"]] = true
		}
		if len(rows) != 32 || len(seen) != 32 || cache.GetLimit(nil, nil) != 32 {
			t.Fatal("concurrent append lost rows, duplicated keys or changed counters")
		}
	}
}

func TestArrayCacheUpdateScanUsesRawKeys(t *testing.T) {
	cache := NewArrayCacheBySymbolById(3)
	first := map[string]any{"symbol": "A", "id": 1, "retained": true}
	cache.Append(first)
	cache.Append(map[string]any{"symbol": "B", "id": 1})
	cache.Append(map[string]any{"symbol": "A", "id": "2"})
	// The bucket normalizes ids to strings, but the row scan compares raw
	// values after merging. Hoisting must not substitute the normalized id.
	cache.Append(map[string]any{"symbol": "A", "id": 1, "updated": 1})
	cache.Append(map[string]any{"symbol": "A", "id": 1, "updated": 2})
	rows := cache.ToArray()
	if len(rows) != 3 || rows[0].(map[string]any)["symbol"] != "B" || rows[1].(map[string]any)["id"] != "2" {
		t.Fatalf("update changed order or evicted a row: %v", rows)
	}
	if first["updated"] != 2 || rows[2].(map[string]any)["retained"] != true {
		t.Fatal("update must merge into the stored map")
	}
	if cache.GetLimit(nil, nil) != 3 || cache.GetLimit("A", nil) != 2 {
		t.Fatal("updates must count distinct keys independently")
	}
}

func BenchmarkArrayCacheRepeatedTail(b *testing.B) {
	cache := NewArrayCacheBySymbolById(1000)
	for i := 0; i < 1000; i++ {
		cache.Append(map[string]any{"symbol": "A", "id": i})
	}
	update := map[string]any{"symbol": "A", "id": 999, "updated": true}
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		cache.Append(update)
	}
}

// Pins the Cache.ts counter split (#29869 / kroitor on #29895):
// newUpdatesBySymbol is an int count; seenUpdatesBySymbol holds distinct ids/sides.
// GetLimit reads the int. Do not call GetLimit in the middle of a window you still
// want to accumulate — it flags a deferred reset, same as TS.

func TestArrayCacheSeenUpdatesBySymbolById(t *testing.T) {
	cache := NewArrayCacheBySymbolById(nil)
	symbol := "BTC/USDT"
	cache.Append(map[string]any{"symbol": symbol, "id": "1", "price": 1})
	cache.Append(map[string]any{"symbol": symbol, "id": "1", "price": 2})
	if cache.newUpdatesBySymbol[symbol] != 1 {
		t.Fatalf("same id twice: newUpdatesBySymbol = %d, want 1", cache.newUpdatesBySymbol[symbol])
	}
	if cache.seenUpdatesBySymbol[symbol] == nil || cache.seenUpdatesBySymbol[symbol].Size() != 1 {
		t.Fatalf("seenUpdatesBySymbol should hold one distinct id")
	}
	cache.Append(map[string]any{"symbol": symbol, "id": "2", "price": 3})
	if cache.newUpdatesBySymbol[symbol] != 2 {
		t.Fatalf("two ids: newUpdatesBySymbol = %d, want 2", cache.newUpdatesBySymbol[symbol])
	}
	if got := cache.GetLimit(symbol, nil); got != 2 {
		t.Fatalf("two ids: GetLimit = %v, want 2", got)
	}
	// deferred reset: next append of an already-seen id starts a new window of 1
	cache.Append(map[string]any{"symbol": symbol, "id": "1", "price": 4})
	if got := cache.GetLimit(symbol, nil); got != 1 {
		t.Fatalf("after getLimit reset + same id: GetLimit = %v, want 1", got)
	}
}

func TestArrayCachePlainIncrementsEveryAppend(t *testing.T) {
	cache := NewArrayCache(nil)
	symbol := "ETH/USDT"
	cache.Append(map[string]any{"symbol": symbol, "price": 1})
	cache.Append(map[string]any{"symbol": symbol, "price": 2})
	if got := cache.GetLimit(symbol, nil); got != 2 {
		t.Fatalf("plain ArrayCache counts every append: GetLimit = %v, want 2", got)
	}
	if cache.seenUpdatesBySymbol[symbol] != nil {
		t.Fatalf("plain ArrayCache must not populate seenUpdatesBySymbol")
	}
}

func TestArrayCacheSeenUpdatesBySymbolBySide(t *testing.T) {
	cache := NewArrayCacheBySymbolBySide()
	symbol := "BTC/USDT"
	cache.Append(map[string]any{"symbol": symbol, "side": "long", "contracts": 1})
	cache.Append(map[string]any{"symbol": symbol, "side": "long", "contracts": 2})
	if cache.newUpdatesBySymbol[symbol] != 1 {
		t.Fatalf("same side twice: newUpdatesBySymbol = %d, want 1", cache.newUpdatesBySymbol[symbol])
	}
	cache.Append(map[string]any{"symbol": symbol, "side": "short", "contracts": 1})
	if got := cache.GetLimit(symbol, nil); got != 2 {
		t.Fatalf("two sides: GetLimit = %v, want 2", got)
	}
}
