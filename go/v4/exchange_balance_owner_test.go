package ccxt

import (
	"strconv"
	"sync"
	"testing"
)

// The balance map is owned by the ws dispatch loop (see exchange_ws_cache.go): user-path code hands
// the loop an operation, handler code reads and writes the same map on the loop. These tests pin the
// hand-off and the shared identity, not just that the tree compiles.

func TestWsBalanceOwnerRoundTrip(t *testing.T) {
	exchange := newOwnedBaseExchange()
	defer exchange.wsCacheStop()
	exchange.Balance = map[string]any{}

	exchange.WsCacheSetScalar("Balance", "spot", map[string]any{"free": "1"})
	if !exchange.WsCacheHas("Balance", "spot") {
		t.Fatalf("a written key must be reported present")
	}
	read, ok := exchange.WsCacheGetScalar("Balance", "spot").(map[string]any)
	if !ok || read["free"] != "1" {
		t.Fatalf("read = %v, want the map that was written", read)
	}

	// a boxed pointer reads back unboxed, the way GetValue answered it
	boxed := "1.5"
	exchange.WsCacheSetScalar("Balance", "boxed", &boxed)
	if got := exchange.WsCacheGetScalar("Balance", "boxed"); got != "1.5" {
		t.Fatalf("boxed value read = %v, want 1.5", got)
	}

	// an absent key answers nil and no membership, never a zero value
	if got := exchange.WsCacheGetScalar("Balance", "absent"); got != nil {
		t.Fatalf("absent key read = %v, want nil", got)
	}
	if exchange.WsCacheHas("Balance", "absent") {
		t.Fatalf("absent key must not be reported present")
	}
}

func TestWsBalanceOwnerKeepsTheHandlerMap(t *testing.T) {
	exchange := newOwnedBaseExchange()
	defer exchange.wsCacheStop()
	exchange.Balance = map[string]any{}
	exchange.WsCacheSetScalar("Balance", "spot", map[string]any{})

	// handler code runs on the loop and writes the same map the owner serves
	handlerView := exchange.Balance
	handlerView["info"] = "raw"
	if got := exchange.WsCacheGetScalar("Balance", "info"); got != "raw" {
		t.Fatalf("owner read = %v, want the handler's write", got)
	}

	// a handler's whole-map assignment moves entries into the same map, it never swaps the field
	exchange.WsBalanceReplace(map[string]any{"free": "2"})
	if handlerView["free"] != "2" {
		t.Fatalf("replace must land in the handler's map, got %v", handlerView["free"])
	}
	if len(handlerView) != 1 {
		t.Fatalf("replace must drop the earlier entries, %d left", len(handlerView))
	}

	// replacing the map with itself (an in-place safeBalance merge) keeps every entry
	exchange.WsBalanceReplace(exchange.Balance)
	if handlerView["free"] != "2" || len(handlerView) != 1 {
		t.Fatalf("self-replace must keep the entries, got %v", handlerView)
	}

	// a whole-map replace moves entries instead of swapping the map handlers already point at
	exchange.WsCacheReplace("Balance", map[string]any{"total": "3"})
	if _, exists := handlerView["info"]; exists {
		t.Fatalf("replace must clear the map the handler reads")
	}
	if handlerView["total"] != "3" {
		t.Fatalf("replace must land in the handler's map, got %v", handlerView["total"])
	}

	exchange.WsCacheReset("Balance")
	if len(handlerView) != 0 {
		t.Fatalf("reset must empty the handler's map, %d entries left", len(handlerView))
	}
}

func TestWsBalanceOwnerConcurrentOps(t *testing.T) {
	exchange := newOwnedBaseExchange()
	defer exchange.wsCacheStop()
	exchange.Balance = map[string]any{}

	var wg sync.WaitGroup
	for worker := 0; worker < 8; worker++ {
		w := worker
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := 0; i < 50; i++ {
				key := "k" + strconv.Itoa(w) + "-" + strconv.Itoa(i)
				exchange.WsCacheSetScalar("Balance", key, i)
				if got := exchange.WsCacheGetScalar("Balance", key); got != i {
					t.Errorf("worker %d key %s read = %v, want %d", w, key, got, i)
					return
				}
				exchange.WsCacheHas("Balance", key)
				exchange.WsCacheSnapshot("Balance")
			}
		}()
	}
	wg.Wait()

	if size := len(exchange.WsCacheSnapshot("Balance")); size != 400 {
		t.Fatalf("snapshot has %d entries, want 400", size)
	}
}
