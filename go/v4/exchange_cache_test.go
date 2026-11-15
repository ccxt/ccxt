package ccxt

import "testing"

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
	if got := cache.GetLimit(symbol, nil); got == nil || *got != 2 {
		t.Fatalf("two ids: GetLimit = %v, want 2", got)
	}
	// deferred reset: next append of an already-seen id starts a new window of 1
	cache.Append(map[string]any{"symbol": symbol, "id": "1", "price": 4})
	if got := cache.GetLimit(symbol, nil); got == nil || *got != 1 {
		t.Fatalf("after getLimit reset + same id: GetLimit = %v, want 1", got)
	}
}

func TestArrayCachePlainIncrementsEveryAppend(t *testing.T) {
	cache := NewArrayCache(nil)
	symbol := "ETH/USDT"
	cache.Append(map[string]any{"symbol": symbol, "price": 1})
	cache.Append(map[string]any{"symbol": symbol, "price": 2})
	if got := cache.GetLimit(symbol, nil); got == nil || *got != 2 {
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
	if got := cache.GetLimit(symbol, nil); got == nil || *got != 2 {
		t.Fatalf("two sides: GetLimit = %v, want 2", got)
	}
}

// GetLimit is typed *int64 (Cache.ts `Int`): an absent answer is nil, a count or a cap is an int64.
func TestArrayCacheGetLimitTyped(t *testing.T) {
	var limit int64 = 5
	cache := NewArrayCache(nil)
	if got := cache.GetLimit("BTC/USDT", nil); got != nil {
		t.Fatalf("unseen symbol, no limit: GetLimit = %v, want nil", *got)
	}
	if got := cache.GetLimit("BTC/USDT", &limit); got == nil || *got != 5 {
		t.Fatalf("unseen symbol: GetLimit should answer the caller's limit")
	}
	cache.Append(map[string]any{"symbol": "BTC/USDT", "price": 1})
	cache.Append(map[string]any{"symbol": "BTC/USDT", "price": 2})
	if got := cache.GetLimit("BTC/USDT", &limit); got == nil || *got != 2 {
		t.Fatalf("min(2, 5): GetLimit should be 2")
	}
	var one int64 = 1
	if got := cache.GetLimit(nil, &one); got == nil || *got != 1 {
		t.Fatalf("global min(2, 1): GetLimit should be 1")
	}
	ohlcv := NewArrayCacheByTimestamp(nil)
	if got := ohlcv.GetLimit(nil, nil); got == nil || *got != 0 {
		t.Fatalf("empty timestamp cache: GetLimit should be 0")
	}
	ohlcv.Append([]any{int64(100), 1.0})
	ohlcv.Append([]any{int64(200), 2.0})
	if got := ohlcv.GetLimit("BTC/USDT", &one); got == nil || *got != 1 {
		t.Fatalf("timestamp min(2, 1): GetLimit should be 1")
	}
	if got := ToGetsLimit([]any{}).GetLimit("BTC/USDT", nil); got != nil {
		t.Fatalf("a plain list answers the absent limit")
	}
	if got := AsArrayCache([]any{}).GetLimit(nil, 7); got == nil || *got != 7 {
		t.Fatalf("a plain list answers the caller's limit")
	}
}

// The update scan compares the raw, post-merge id and key values, not the
// string-normalized Hashmap keys. Each is read once, before the scan; reading
// the normalized key instead would miss non-string ids and leave the row where
// it was.
func TestArrayCacheUpdateScanUsesRawKeys(t *testing.T) {
	for _, field := range []string{"symbol", "outcome"} {
		for _, raw := range []any{1, int64(1), 1.5, "1"} {
			var cache interface {
				Append(any)
				ToArray() []any
				GetLimit(any, any) *int64
			}
			if field == "outcome" {
				cache = NewArrayCacheByOutcomeById(3)
			} else {
				cache = NewArrayCacheBySymbolById(3)
			}
			first := map[string]any{field: "A", "id": raw, "retained": true}
			cache.Append(first)
			cache.Append(map[string]any{field: "B", "id": raw})
			cache.Append(map[string]any{field: "A", "id": "other"})
			cache.Append(map[string]any{field: "A", "id": raw, "updated": 1})
			cache.Append(map[string]any{field: "A", "id": raw, "updated": 2})
			rows := cache.ToArray()
			if len(rows) != 3 {
				t.Fatalf("%s/%T: update must not evict or duplicate: %v", field, raw, rows)
			}
			if rows[0].(map[string]any)[field] != "B" || rows[1].(map[string]any)["id"] != "other" {
				t.Fatalf("%s/%T: update must move the matching row to the end: %v", field, raw, rows)
			}
			last := rows[2].(map[string]any)
			if last[field] != "A" || last["id"] != raw || last["retained"] != true || last["updated"] != 2 {
				t.Fatalf("%s/%T: update must merge into the stored fields: %v", field, raw, last)
			}
			if _, mutated := first["updated"]; mutated {
				t.Fatalf("%s/%T: merges are copy-on-write; the original map must not change", field, raw)
			}
			if got := cache.GetLimit(nil, nil); got == nil || *got != 3 {
				t.Fatalf("%s/%T: global count = %v, want 3", field, raw, got)
			}
			if got := cache.GetLimit("A", nil); got == nil || *got != 2 {
				t.Fatalf("%s/%T: symbol count = %v, want 2", field, raw, got)
			}
		}
	}
}
