package ccxt

import "testing"

// A cache is an Array in TS: safeDict (cache, 0) reads row 0, and the named keys still answer.
func TestSafeValueReadsCacheRowsByIndex(t *testing.T) {
	row := map[string]any{"symbol": "BTC/USDT", "id": "1", "timestamp": int64(1)}
	caches := []any{NewArrayCache(nil), NewArrayCacheBySymbolById(nil), NewArrayCacheBySymbolBySide(), NewArrayCacheByTimestamp(nil)}
	for i, c := range caches {
		if SafeMapTyped(c, 0) != nil {
			t.Fatalf("cache %d: empty cache row 0 must be nil", i)
		}
		c.(interface{ Append(any) }).Append(row)
		got := SafeMapTyped(c, 0)
		if got == nil || got["symbol"] != "BTC/USDT" {
			t.Fatalf("cache %d: row 0 = %v", i, got)
		}
		if SafeMapTyped(c, 1) != nil || SafeMapTyped(c, -1) != nil {
			t.Fatalf("cache %d: out-of-range row must be nil", i)
		}
		if SafeValue(c, "data", nil) == nil {
			t.Fatalf("cache %d: data key must still answer", i)
		}
	}
}
