package ccxt

import "testing"

func TestArrayCacheUpdateScanUsesRawKeys(t *testing.T) {
	cache := NewArrayCacheBySymbolById(3)
	first := map[string]any{"symbol": "A", "id": 1, "retained": true}
	cache.Append(first)
	cache.Append(map[string]any{"symbol": "B", "id": 1})
	cache.Append(map[string]any{"symbol": "A", "id": "2"})
	// The bucket normalizes ids to strings, but the row scan compares raw
	// values after merging. Hoisting must not substitute the normalized id.
	cache.Append(map[string]any{"symbol": "A", "id": "1", "updated": 1})
	cache.Append(map[string]any{"symbol": "A", "id": "1", "updated": 2})
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
