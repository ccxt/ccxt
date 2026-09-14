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
