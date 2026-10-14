package ccxt

import "testing"

// Parsed positions carry *string symbol and side. Append used to type-assert them
// as string, so every position was keyed under ("", "") and merged into one row:
// a second market or a flip to the other side overwrote the first position.
func TestArrayCacheBySymbolBySideKeysPointerFields(t *testing.T) {
	str := func(s string) *string { return &s }
	cache := NewArrayCacheBySymbolBySide()
	cache.Append(map[string]any{"symbol": str("BTC/USD:USDC"), "side": str("long"), "contracts": 0.002})
	cache.Append(map[string]any{"symbol": str("SOL/USD:USDC"), "side": str("short"), "contracts": 3.5})
	cache.Append(map[string]any{"symbol": str("BTC/USD:USDC"), "side": str("short"), "contracts": 0.003})
	cache.Append(map[string]any{"symbol": str("BTC/USD:USDC"), "side": str("long"), "contracts": 0.0})
	if len(cache.Data) != 3 {
		t.Fatalf("expected 3 rows (BTC long, SOL short, BTC short), got %d: %v", len(cache.Data), cache.Data)
	}
	// the BTC long update replaces its row and moves it to the end
	last := cache.Data[2].(map[string]any)
	if cacheKeyOf(last, "symbol") != "BTC/USD:USDC" || cacheKeyOf(last, "side") != "long" || last["contracts"] != 0.0 {
		t.Fatalf("expected the updated BTC long last, got %v", last)
	}
	if len(cache.Hashmap["BTC/USD:USDC"]) != 2 || len(cache.Hashmap["SOL/USD:USDC"]) != 1 {
		t.Fatalf("unexpected hashmap %v", cache.Hashmap)
	}
}
