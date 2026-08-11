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
// https://github.com/ccxt/ccxt/issues/28089 https://github.com/ccxt/ccxt/issues/23251
// (resolved value dropped when no consumer future exists)
// ---------------------------------------------------------------------------

func testResolveClient() *Client {
	return &Client{
		Futures:        map[string]any{},
		PendingResults: map[string]any{},
		Rejections:     map[string]any{},
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

// A value resolved while no consumer future exists is retained, latest wins,
// and satisfies the next NewFuture immediately instead of being dropped.
func TestClientResolveRetainsValueWithoutWaiter(t *testing.T) {
	client := testResolveClient()
	hash := "ticker:BTC/USDT"

	// consumer round 1, the normal path
	f1 := client.NewFuture(hash)
	client.Resolve("update-1", hash)
	if v := <-f1.Await(); v != "update-1" {
		t.Fatalf("round 1 broken: %v", v)
	}
	// updates arrive while the consumer is between calls: no future in map
	client.Resolve("update-2", hash)
	client.Resolve("update-3", hash) // latest wins
	// consumer round 2 is satisfied immediately with the latest value
	f2 := client.NewFuture(hash)
	select {
	case v := <-f2.Await():
		if v != "update-3" {
			t.Fatalf("expected latest retained value update-3, got %v", v)
		}
	case <-time.After(100 * time.Millisecond):
		t.Fatalf("retained value was not delivered, consumer waits on an empty future")
	}
	// the retained value is drained exactly once, the next consumer waits
	// for fresh data
	f3 := client.NewFuture(hash)
	select {
	case v := <-f3.Await():
		t.Fatalf("stale value served twice: %v", v)
	case <-time.After(30 * time.Millisecond):
	}
	client.Resolve("update-4", hash)
	if v := <-f3.Await(); v != "update-4" {
		t.Fatalf("expected update-4, got %v", v)
	}
}

// Reject clears retained values so stale pre-error data cannot satisfy a
// post-error consumer: the consumer gets the retained error fast, never the
// pre-error data.
func TestClientRejectClearsPendingResults(t *testing.T) {
	client := testResolveClient()
	hash := "ticker:BTC/USDT"
	client.Resolve("stale", hash)
	client.Reject(NewError("NetworkError", "boom"), hash)
	f := client.NewFuture(hash)
	select {
	case v := <-f.Await():
		if _, isErr := v.(error); !isErr {
			t.Fatalf("stale pre-error value served after reject: %v", v)
		}
	case <-time.After(100 * time.Millisecond):
		t.Fatalf("retained rejection was not delivered")
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

// A resolve retained after a retained rejection supersedes it: the stream
// recovered, so the waiter gets the fresh value and the next waiter waits
// for fresh data instead of failing on the stale error.
func TestClientResolveRetentionSupersedesStaleRejection(t *testing.T) {
	client := testResolveClient()
	hash := "ticker:BTC/USDT"
	client.Reject(NewError("NetworkError", "boom"), hash)
	client.Resolve("recovered", hash)
	f1 := client.NewFuture(hash)
	if v := <-f1.Await(); v != "recovered" {
		t.Fatalf("expected recovered value, got %v", v)
	}
	f2 := client.NewFuture(hash)
	select {
	case v := <-f2.Await():
		t.Fatalf("stale retained rejection served after recovery: %v", v)
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
