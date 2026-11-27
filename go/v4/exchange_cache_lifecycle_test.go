package ccxt

import (
	"runtime"
	"testing"
	"time"
)

// Native lifecycle tests for the Go caches: goroutine ownership and panic
// propagation have no counterpart in the shared TypeScript cache tests.

// A discarded cache must not leave a goroutine behind. Exchanges drop caches on
// every unwatch, positions-snapshot reload (e.g. after a reconnect) and Close,
// so a per-cache goroutine grows without bound in a long-running process.
func TestArrayCacheDiscardedCachesDoNotLeakGoroutines(t *testing.T) {
	settle := func() int {
		for i := 0; i < 3; i++ {
			runtime.GC()
			time.Sleep(10 * time.Millisecond)
		}
		return runtime.NumGoroutine()
	}
	before := settle()
	for i := 0; i < 1000; i++ {
		NewArrayCache(8).Append(map[string]any{"symbol": "A", "id": "1"})
		NewArrayCacheBySymbolById(8).Append(map[string]any{"symbol": "A", "id": "1"})
		NewArrayCacheByOutcomeById(8).Append(map[string]any{"outcome": "A", "id": "1"})
		NewArrayCacheBySymbolBySide().Append(map[string]any{"symbol": "A", "side": "long"})
		NewArrayCacheByTimestamp(8).Append([]any{int64(i), 1.0})
	}
	if after := settle(); after-before > 10 {
		t.Fatalf("discarded caches leaked goroutines: %d before, %d after", before, after)
	}
}

// A panic inside a cache operation must reach the caller, where the generated
// exchange code recovers it into an error, and must not leave the cache locked.
func TestArrayCacheOperationPanicReachesCallerAndUnlocks(t *testing.T) {
	cache := NewArrayCache(8)
	func() {
		defer func() {
			if recover() == nil {
				t.Fatal("panic inside a cache operation was not propagated to the caller")
			}
		}()
		cache.submit(func() { panic("boom") })
	}()
	done := make(chan struct{})
	go func() {
		cache.Append(map[string]any{"symbol": "A", "id": "1"})
		cache.GetLimit(nil, nil)
		close(done)
	}()
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("cache stayed locked after a panicking operation")
	}
	if got := len(cache.ToArray()); got != 1 {
		t.Fatalf("cache unusable after panic: %d rows", got)
	}
}
