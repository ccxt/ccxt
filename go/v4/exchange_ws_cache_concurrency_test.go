package ccxt

import (
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
)

// TestWSClientGetOrCreateConcurrent exercises the ws client registry from many
// goroutines. Concurrent Watch* calls on one exchange reach Client() together;
// the unguarded map crashed the process with "concurrent map writes". Run with
// -race: the registry mutex must create exactly one client per URL and return
// the same instance to every caller.
func TestWSClientGetOrCreateConcurrent(t *testing.T) {
	exchange := &BaseExchange{}

	const goroutines = 32
	results := make([]any, goroutines)
	var creates atomic.Int64
	var wg sync.WaitGroup
	wg.Add(goroutines)
	for i := 0; i < goroutines; i++ {
		go func(i int) {
			defer wg.Done()
			results[i] = exchange.wsClientGetOrCreate("wss://example", func() any {
				creates.Add(1)
				return &struct{}{}
			})
		}(i)
	}
	wg.Wait()

	if got := creates.Load(); got != 1 {
		t.Fatalf("created %d clients for one URL, want 1", got)
	}
	first := results[0]
	for i, result := range results {
		if result != first {
			t.Fatalf("result %d = %p, want the same client %p", i, result, first)
		}
	}
}

// TestWSClientRegistryReadsDuringWrites exercises every exported registry
// accessor while other goroutines create and delete clients. The snapshot and
// lookup helpers must take the read lock, the get-or-create and delete helpers
// the write lock; run with -race to catch a direct map read that skipped it.
func TestWSClientRegistryReadsDuringWrites(t *testing.T) {
	exchange := &BaseExchange{}

	const (
		writers = 4
		readers = 8
		rounds  = 200
	)
	var wg sync.WaitGroup
	for w := 0; w < writers; w++ {
		wg.Add(1)
		go func(w int) {
			defer wg.Done()
			url := fmt.Sprintf("wss://writer-%d", w)
			for i := 0; i < rounds; i++ {
				if client := exchange.wsClientGetOrCreate(url, func() any { return &struct{}{} }); client == nil {
					t.Errorf("get-or-create answered nil for %s", url)
					return
				}
				if i%2 == 0 {
					exchange.WsClientDelete(url)
				}
			}
		}(w)
	}
	for r := 0; r < readers; r++ {
		wg.Add(1)
		go func(r int) {
			defer wg.Done()
			url := fmt.Sprintf("wss://writer-%d", r%writers)
			for i := 0; i < rounds; i++ {
				_ = exchange.WsClientSnapshot()
				_ = exchange.WsClientLookup(url)
				_, _ = exchange.WsClientGet(url)
				_ = exchange.WsClientHas(url)
				_ = exchange.WsClientIs(url, nil)
			}
		}(r)
	}
	wg.Wait()
}
