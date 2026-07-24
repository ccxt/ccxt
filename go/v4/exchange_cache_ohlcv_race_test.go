package ccxt

import (
	"sync"
	"testing"
)

// ---------------------------------------------------------------------------
// Follow-up to https://github.com/ccxt/ccxt/issues/28441 (same defect class):
// updating the current OHLCV candle must not mutate the slice already handed
// out to user goroutines (via ToArray -> WatchOHLCV). Run with -race: the old
// in-place element writes inside Append raced with readers.
// ---------------------------------------------------------------------------

func TestArrayCacheByTimestampConcurrentReadWrite(t *testing.T) {
	cache := NewArrayCacheByTimestamp(nil)

	makeCandle := func(ts int64, close float64) []any {
		return []any{ts, 100.0, 200.0, 50.0, close, 1000.0}
	}

	cache.Append(makeCandle(1700000000000, 0))

	var wg sync.WaitGroup
	stop := make(chan struct{})

	// reader: simulates a user goroutine iterating candles returned by WatchOHLCV
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
				if candle, ok := item.([]any); ok {
					for _, v := range candle {
						_ = v
					}
				}
			}
		}
	}()

	// writer: simulates the WS message handler updating the current candle
	iterations := 10000
	for i := 1; i <= iterations; i++ {
		cache.Append(makeCandle(1700000000000, float64(i)))
	}
	close(stop)
	wg.Wait()

	data := cache.ToArray()
	if len(data) != 1 {
		t.Fatalf("expected 1 cached candle, got %d", len(data))
	}
	last := data[0].([]any)
	if last[4] != float64(iterations) {
		t.Fatalf("expected the latest update to win, got %v", last)
	}
}

// GetLimit runs on user goroutines (called from every generated watch method)
// while Append mutates the same update-tracking maps and Sets under c.Mu on the
// WS-handler goroutine. Without locking, GetLimit's unguarded map write/reads
// are a fatal concurrent map access.
func TestArrayCacheGetLimitConcurrentWithAppend(t *testing.T) {
	cache := NewArrayCacheBySymbolById()

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
			_ = cache.GetLimit("ETH/USDT", nil)
			_ = cache.GetLimit(nil, 10)
		}
	}()

	for i := 1; i <= 10000; i++ {
		cache.Append(map[string]any{
			"symbol": "ETH/USDT",
			"id":     ToString(i),
			"status": "open",
		})
	}
	close(stop)
	wg.Wait()
}

func TestArrayCacheByTimestampGetLimitConcurrentWithAppend(t *testing.T) {
	cache := NewArrayCacheByTimestamp(nil)

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
			_ = cache.GetLimit(nil, 10)
		}
	}()

	for i := 1; i <= 10000; i++ {
		cache.Append([]any{int64(1700000000000 + i*60000), 100.0, 200.0, 50.0, 150.0, 1000.0})
	}
	close(stop)
	wg.Wait()
}

// The old in-place merge also panicked with an index-out-of-range when the
// incoming candle had fewer elements than the stored one.
func TestArrayCacheByTimestampShorterUpdateDoesNotPanic(t *testing.T) {
	cache := NewArrayCacheByTimestamp(nil)

	cache.Append([]any{int64(1700000000000), 100.0, 200.0, 50.0, 150.0, 1000.0})
	cache.Append([]any{int64(1700000000000), 101.0})

	data := cache.ToArray()
	if len(data) != 1 {
		t.Fatalf("expected 1 cached candle, got %d", len(data))
	}
	candle := data[0].([]any)
	if len(candle) != 6 || candle[1] != 101.0 || candle[4] != 150.0 {
		t.Fatalf("expected merged candle to keep the old tail and take new values, got %v", candle)
	}
}
