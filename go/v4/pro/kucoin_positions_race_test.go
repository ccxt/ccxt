package ccxtpro

import (
	"strconv"
	"sync"
	"testing"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

// kucoin's getCurrentPosition reads `this.positions.hashmap` and iterates one
// symbol's bucket. It runs on the user goroutine (watchPosition) while
// handlePosition / handleUtaPosition append to the same cache on the ws reader
// goroutine, and ArrayCache.Append writes that bucket map in place. The read has
// to go through the cache owner or it is a "concurrent map read and map write".
//
// It also used to type-assert the cache to *ccxt.ArrayCache, which panics for the
// *ccxt.ArrayCacheBySymbolById the positions cache actually is, so every position
// update crashed the ws reader goroutine.

func utaPositionMessage(positionId int) map[string]any {
	return map[string]any{
		"T": "positionAll.UNIFIED",
		"d": map[string]any{
			"pi": strconv.Itoa(positionId),
			"s":  "DOGEUSDTM",
			"mM": "CROSS",
			"q":  "3",
			"eP": "0.0903",
			"mP": "0.0900",
			"U":  "1774805155988000000",
			"O":  1774793727585000000,
		},
	}
}

func TestKucoinGetCurrentPositionConcurrentWithHandlePosition(t *testing.T) {
	exchange := NewKucoin(nil)
	client := exchange.Client("wss://kucoin.test/positions")
	exchange.Positions = ccxt.NewArrayCacheBySymbolById(50)
	exchange.HandleUtaPosition(client, utaPositionMessage(0))
	if exchange.GetCurrentPosition("DOGEUSDTM") == nil {
		t.Fatalf("expected the seeded position to be found")
	}
	var wg sync.WaitGroup
	stop := make(chan struct{})
	// reader: watchPosition on the user goroutine
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case <-stop:
				return
			default:
			}
			if exchange.GetCurrentPosition("DOGEUSDTM") == nil {
				t.Errorf("current position vanished")
				return
			}
		}
	}()
	// writer: the ws reader goroutine handling position updates, new ids grow the
	// bucket and the cache limit evicts old ones, both are writes to the bucket map
	for i := 1; i <= 2000; i++ {
		exchange.HandleUtaPosition(client, utaPositionMessage(i))
	}
	close(stop)
	wg.Wait()
}

func TestKucoinHandlePositionMergesCurrentPosition(t *testing.T) {
	exchange := NewKucoin(nil)
	client := exchange.Client("wss://kucoin.test/positions")
	exchange.Positions = ccxt.NewArrayCacheBySymbolById()
	exchange.HandleUtaPosition(client, utaPositionMessage(7))
	update := utaPositionMessage(7)
	update["d"].(map[string]any)["mP"] = "0.1"
	delete(update["d"].(map[string]any), "eP")
	exchange.HandleUtaPosition(client, update)
	current := exchange.GetCurrentPosition("DOGEUSDTM")
	if current == nil {
		t.Fatalf("expected a current position")
	}
	position := current.(map[string]any)
	if got := ccxt.DerefScalar(position["markPrice"]); got != 0.1 {
		t.Fatalf("markPrice = %v, want 0.1", got)
	}
	if got := ccxt.DerefScalar(position["entryPrice"]); got != 0.0903 {
		t.Fatalf("entryPrice = %v, want the previous 0.0903 carried over", got)
	}
	if n := len(exchange.Positions.(ccxt.WsArrayCache).ToArray()); n != 1 {
		t.Fatalf("cache holds %d rows, want 1 merged row", n)
	}
}
