package ccxt

import (
	"sync"
	"testing"
)

// ---------------------------------------------------------------------------
// Regression tests for https://github.com/ccxt/ccxt/issues/28441
//
// A WS-handler goroutine updating an existing cache entry must not mutate maps
// that were already handed out to user goroutines (via ToArray -> WatchOrders
// and friends). The old in-place merge inside Append triggered a fatal
// "concurrent map read and map write" -- that is a runtime *fatal*, not a
// recoverable panic, so these tests fail even without -race; -race additionally
// pins the blame to the exact Append line.
//
// These live in go/v4 (package ccxt) on purpose: that is the only Go tree CI
// actually runs `go test` over ("Run Go Unit Tests" in .github/workflows/
// go-app.yml -> `go test -C go -count=1 ./v4`). go/tests is a separate module
// whose CI step only does `go build ./tests/main.go`, which ignores _test.go
// files, so a regression guard placed there would never execute.
// ---------------------------------------------------------------------------

func TestArrayCacheBySymbolByIdConcurrentReadWrite(t *testing.T) {
	cache := NewArrayCacheBySymbolById()

	makeOrder := func(status string, filled float64) map[string]any {
		return map[string]any{
			"symbol": "ETH/USDT",
			"id":     "46049155060",
			"status": status,
			"filled": filled,
		}
	}

	cache.Append(makeOrder("open", 0))

	var wg sync.WaitGroup
	stop := make(chan struct{})

	// reader: simulates a user goroutine iterating orders returned by WatchOrders
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case <-stop:
				return
			default:
			}
			for _, item := range cache.ToArray() {
				if m, ok := item.(map[string]any); ok {
					_ = m["status"]
					_ = m["filled"]
				}
			}
		}
	}()

	// writer: simulates the WS message handler updating the same order id
	iterations := 10000
	for i := 1; i <= iterations; i++ {
		cache.Append(makeOrder("closed", float64(i)))
	}
	close(stop)
	wg.Wait()

	data := cache.ToArray()
	if len(data) != 1 {
		t.Fatalf("expected 1 cached order, got %d", len(data))
	}
	last := data[0].(map[string]any)
	if last["status"] != "closed" || last["filled"] != float64(iterations) {
		t.Fatalf("expected the latest update to win, got %v", last)
	}
}

func TestArrayCacheBySymbolBySideConcurrentReadWrite(t *testing.T) {
	cache := NewArrayCacheBySymbolBySide()

	makePosition := func(contracts float64) map[string]any {
		return map[string]any{
			"symbol":    "ETH/USDT:USDT",
			"side":      "long",
			"contracts": contracts,
		}
	}

	cache.Append(makePosition(0))

	var wg sync.WaitGroup
	stop := make(chan struct{})

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case <-stop:
				return
			default:
			}
			for _, item := range cache.ToArray() {
				if m, ok := item.(map[string]any); ok {
					_ = m["contracts"]
				}
			}
		}
	}()

	iterations := 10000
	for i := 1; i <= iterations; i++ {
		cache.Append(makePosition(float64(i)))
	}
	close(stop)
	wg.Wait()

	data := cache.ToArray()
	if len(data) != 1 {
		t.Fatalf("expected 1 cached position, got %d", len(data))
	}
	last := data[0].(map[string]any)
	if last["contracts"] != float64(iterations) {
		t.Fatalf("expected the latest update to win, got %v", last)
	}
}
