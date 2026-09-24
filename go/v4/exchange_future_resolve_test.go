package ccxt

import (
	"runtime"
	"sync"
	"testing"
	"time"
)

// ---------------------------------------------------------------------------
// Regression tests for the ws future resolve races
// https://github.com/ccxt/ccxt/issues/29586 (lost wakeup, consumer hangs)
// ---------------------------------------------------------------------------

func testResolveClient() *Client {
	return &Client{
		Futures:    map[string]any{},
		Rejections: map[string]any{},
	}
}

// Await checks resolved state and appends its subscriber under one lock, so
// a concurrent Resolve can never notify an empty subscriber list and strand
// the consumer. Before the fix the check and the append used two different
// mutexes and a resolve landing in the gap hung the consumer forever.
func TestFutureAwaitConcurrentResolveNeverHangs(t *testing.T) {
	prev := runtime.GOMAXPROCS(4)
	defer runtime.GOMAXPROCS(prev)
	const iters = 100000
	for i := 0; i < iters; i++ {
		fut := NewFuture()
		got := make(chan struct{})
		go func() {
			<-fut.Await()
			close(got)
		}()
		fut.Resolve(i)
		select {
		case <-got:
		case <-time.After(100 * time.Millisecond):
			t.Fatalf("lost wakeup: consumer hung at iteration %d", i)
		}
	}
}

// FutureRace subscribes under the same lock as its resolved check, a resolve
// landing between the two would otherwise never wake the racer.
func TestFutureRaceConcurrentResolveNeverHangs(t *testing.T) {
	prev := runtime.GOMAXPROCS(4)
	defer runtime.GOMAXPROCS(prev)
	const iters = 20000
	for i := 0; i < iters; i++ {
		futs := []*Future{NewFuture(), NewFuture(), NewFuture()}
		done := make(chan struct{})
		go func() {
			<-FutureRace(futs).Await()
			close(done)
		}()
		futs[i%3].Resolve(i)
		select {
		case <-done:
		case <-time.After(100 * time.Millisecond):
			t.Fatalf("FutureRace lost a wakeup at iteration %d", i)
		}
	}
}

// An error rejected while no consumer future exists is retained, ts parity,
// and fails the next NewFuture fast, drained exactly once.
func TestClientRejectRetainedWithoutWaiter(t *testing.T) {
	client := testResolveClient()
	hash := "ticker:BTC/USDT"
	client.Reject(NewError("NetworkError", "boom"), hash)
	f := client.NewFuture(hash)
	select {
	case v := <-f.Await():
		if _, isErr := v.(error); !isErr {
			t.Fatalf("expected retained error, got %v", v)
		}
	case <-time.After(100 * time.Millisecond):
		t.Fatalf("retained rejection was not delivered")
	}
	// drained once: the next consumer is not poisoned by the old error
	f2 := client.NewFuture(hash)
	select {
	case v := <-f2.Await():
		t.Fatalf("stale rejection served twice: %v", v)
	case <-time.After(30 * time.Millisecond):
	}
	client.Resolve("fresh", hash)
	if v := <-f2.Await(); v != "fresh" {
		t.Fatalf("expected fresh, got %v", v)
	}
}

// Rejections shares FuturesMu, concurrent NewFuture and Reject traffic must
// be race clean, before the fix NewFuture read and deleted Rejections
// without any lock.
func TestClientRejectionsAccessRaceClean(t *testing.T) {
	client := testResolveClient()
	var wg sync.WaitGroup
	for g := 0; g < 4; g++ {
		wg.Add(2)
		go func() {
			defer wg.Done()
			for i := 0; i < 3000; i++ {
				client.NewFuture("h")
				client.Resolve(i, "h")
			}
		}()
		go func() {
			defer wg.Done()
			for i := 0; i < 3000; i++ {
				client.Reject(NewError("NetworkError", "x"), "h")
			}
		}()
	}
	wg.Wait()
}
