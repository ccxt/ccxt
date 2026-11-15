package ccxt

import (
	"strconv"
	"sync"
	"testing"
)

// A ws `cache.hashmap` read (kucoin getCurrentPosition, the handleOrder merges of
// binance / kraken / woo ...) runs on whatever goroutine called the method, often a
// user goroutine (watchPosition), while Append writes the symbol buckets on the
// cache owner. CacheHashmap has to take its copy on the owner, or the read is a
// "concurrent map read and map write", and it has to accept every cache kind the
// exchanges store: the old `.(*ArrayCache)` assertion panicked on the
// *ArrayCacheBySymbolById that this.orders / this.positions actually hold.

func TestCacheHashmapConcurrentWithAppend(t *testing.T) {
	cache := NewArrayCacheBySymbolById(50)
	row := func(id int) map[string]any {
		return map[string]any{"symbol": "ETH/USDT", "id": strconv.Itoa(id), "contracts": float64(id)}
	}
	cache.Append(row(0))
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
			bucket := SafeMapTyped(CacheHashmap(cache), "ETH/USDT")
			if len(bucket) == 0 {
				t.Errorf("symbol bucket vanished")
				return
			}
			for _, v := range bucket {
				_ = v.(map[string]any)["contracts"]
			}
		}
	}()
	// new ids grow the bucket, the 50 row limit evicts the oldest: both write the bucket map
	for i := 1; i <= 2000; i++ {
		cache.Append(row(i))
	}
	close(stop)
	wg.Wait()
}

func TestCacheHashmapKinds(t *testing.T) {
	if got := CacheHashmap(nil); got != nil {
		t.Fatalf("nil cache: got %v, want nil", got)
	}
	var typedNil *ArrayCacheBySymbolById
	if got := CacheHashmap(typedNil); got != nil {
		t.Fatalf("typed nil cache: got %v, want nil", got)
	}
	order := map[string]any{"symbol": "BTC/USDT", "id": "1", "side": "buy"}
	caches := []any{NewArrayCache(10), NewArrayCacheBySymbolById(), NewArrayCacheByOutcomeById(), NewArrayCacheBySymbolBySide()}
	for _, c := range caches {
		c.(Appender).Append(map[string]any{"symbol": "BTC/USDT", "outcome": "BTC/USDT", "id": "1", "side": "buy"})
		hashmap := CacheHashmap(c)
		bucket := SafeMapTyped(hashmap, "BTC/USDT")
		if len(bucket) != 1 {
			t.Fatalf("%T: bucket %v, want one row", c, bucket)
		}
		if keys := ObjectKeys(hashmap); len(keys) != 1 || keys[0] != "BTC/USDT" {
			t.Fatalf("%T: keys %v", c, keys)
		}
		// the copy is the caller's: changing it must not reach the cache
		bucket["2"] = order
		delete(hashmap, "BTC/USDT")
		if again := SafeMapTyped(CacheHashmap(c), "BTC/USDT"); len(again) != 1 {
			t.Fatalf("%T: caller edit leaked into the cache: %v", c, again)
		}
	}
}
