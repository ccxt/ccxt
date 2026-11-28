package ccxt

import (
	"testing"
	"time"
)

// One frame settles two hashes. The waiter woken by the first one re-watches the
// second; it must get a fresh future, never the sibling the same frame settles
// (js resolves on a microtask, after the handler has settled both).
func TestDispatchMessageSettlesAfterHandlerReturns(t *testing.T) {
	client := NewClient("", nil, nil, nil, nil)
	first := client.NewFuture("first")
	second := client.NewFuture("second")

	type observation struct {
		secondPending bool
		rewatched     *Future
	}
	observed := make(chan observation, 1)
	go func() {
		<-first.Await()
		observed <- observation{secondPending: client.FutureHas("second"), rewatched: client.NewFuture("second")}
	}()

	client.OnMessageCallback = func(c any, message any) {
		client.Resolve("a", "first")
		// with an eager settle the waiter runs here; give it the chance to look
		select {
		case got := <-observed:
			observed <- got
		case <-time.After(200 * time.Millisecond):
		}
		client.Resolve("b", "second")
	}
	client.DispatchMessage(client, "frame")

	var got observation
	select {
	case got = <-observed:
	case <-time.After(5 * time.Second):
		t.Fatal("the waiter on the first hash was never woken")
	}
	if got.secondPending {
		t.Fatal("the waiter woken by the first hash saw the second still pending")
	}
	if got.rewatched == second {
		t.Fatal("a re-watch of the second hash took the future the same frame settles")
	}
	select {
	case result := <-second.Await():
		if result.Err != nil || result.Value != "b" {
			t.Fatalf("second future settled with %v / %v, want b", result.Value, result.Err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("the second future was never settled")
	}
}
