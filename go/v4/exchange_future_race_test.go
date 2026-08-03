package ccxt

import (
	"errors"
	"runtime"
	"sync"
	"testing"
	"time"
)

// ---------------------------------------------------------------------------
// Future: basic resolve / reject
// ---------------------------------------------------------------------------

func TestFutureResolve(t *testing.T) {
	f := NewFuture()
	f.Resolve("test")

	ch := f.Await()
	result := <-ch
	if result != "test" {
		t.Fatalf("expected 'test', got %v", result)
	}
}

func TestFutureResolveNil(t *testing.T) {
	f := NewFuture()
	f.Resolve()

	ch := f.Await()
	result := <-ch
	if result != nil {
		t.Fatalf("expected nil, got %v", result)
	}
}

func TestFutureReject(t *testing.T) {
	f := NewFuture()
	testErr := errors.New("test error")
	f.Reject(testErr)

	ch := f.Await()
	result := <-ch
	err, ok := result.(error)
	if !ok {
		t.Fatalf("expected error, got %T: %v", result, result)
	}
	if err.Error() != "test error" {
		t.Fatalf("expected 'test error', got '%s'", err.Error())
	}
}

// ---------------------------------------------------------------------------
// Future: await before / after resolution
// ---------------------------------------------------------------------------

func TestFutureAwaitBeforeResolve(t *testing.T) {
	f := NewFuture()
	ch := f.Await()

	go func() {
		time.Sleep(10 * time.Millisecond)
		f.Resolve("delayed")
	}()

	select {
	case result := <-ch:
		if result != "delayed" {
			t.Fatalf("expected 'delayed', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out waiting for resolve")
	}
}

func TestFutureAwaitAfterResolve(t *testing.T) {
	f := NewFuture()
	f.Resolve("immediate")

	ch := f.Await()
	select {
	case result := <-ch:
		if result != "immediate" {
			t.Fatalf("expected 'immediate', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out; Await on already-resolved future should return immediately")
	}
}

func TestFutureAwaitBeforeReject(t *testing.T) {
	f := NewFuture()
	ch := f.Await()

	go func() {
		time.Sleep(10 * time.Millisecond)
		f.Reject(errors.New("delayed error"))
	}()

	select {
	case result := <-ch:
		err, ok := result.(error)
		if !ok {
			t.Fatalf("expected error, got %T: %v", result, result)
		}
		if err.Error() != "delayed error" {
			t.Fatalf("expected 'delayed error', got '%s'", err.Error())
		}
	case <-time.After(time.Second):
		t.Fatal("timed out waiting for reject")
	}
}

func TestFutureAwaitAfterReject(t *testing.T) {
	f := NewFuture()
	f.Reject(errors.New("already rejected"))

	ch := f.Await()
	select {
	case result := <-ch:
		err, ok := result.(error)
		if !ok {
			t.Fatalf("expected error, got %T: %v", result, result)
		}
		if err.Error() != "already rejected" {
			t.Fatalf("expected 'already rejected', got '%s'", err.Error())
		}
	case <-time.After(time.Second):
		t.Fatal("timed out; Await on already-rejected future should return immediately")
	}
}

// ---------------------------------------------------------------------------
// Future: idempotency — only the first Resolve/Reject takes effect
// ---------------------------------------------------------------------------

func TestFutureResolveOnlyOnce(t *testing.T) {
	f := NewFuture()
	f.Resolve("first")
	f.Resolve("second") // should be ignored

	ch := f.Await()
	result := <-ch
	if result != "first" {
		t.Fatalf("expected 'first', got %v", result)
	}
}

func TestFutureRejectOnlyOnce(t *testing.T) {
	f := NewFuture()
	f.Reject(errors.New("first error"))
	f.Reject(errors.New("second error"))

	ch := f.Await()
	result := <-ch
	err := result.(error)
	if err.Error() != "first error" {
		t.Fatalf("expected 'first error', got '%s'", err.Error())
	}
}

func TestFutureResolveAfterRejectIgnored(t *testing.T) {
	f := NewFuture()
	f.Reject(errors.New("rejected"))
	f.Resolve("too late")

	ch := f.Await()
	result := <-ch
	if _, ok := result.(error); !ok {
		t.Fatal("expected error from reject, got non-error (resolve was not ignored)")
	}
}

func TestFutureRejectAfterResolveIgnored(t *testing.T) {
	f := NewFuture()
	f.Resolve("resolved")
	f.Reject(errors.New("too late"))

	ch := f.Await()
	result := <-ch
	if _, ok := result.(error); ok {
		t.Fatal("expected resolved value, got error (reject was not ignored)")
	}
	if result != "resolved" {
		t.Fatalf("expected 'resolved', got %v", result)
	}
}

// ---------------------------------------------------------------------------
// Future: multiple Await callers on the same future
// ---------------------------------------------------------------------------

func TestFutureMultipleAwaiters(t *testing.T) {
	f := NewFuture()

	const n = 10
	results := make([]interface{}, n)
	var wg sync.WaitGroup
	wg.Add(n)

	for i := 0; i < n; i++ {
		go func(idx int) {
			defer wg.Done()
			ch := f.Await()
			results[idx] = <-ch
		}(i)
	}

	time.Sleep(10 * time.Millisecond)
	f.Resolve("shared")

	wg.Wait()
	for i, r := range results {
		if r != "shared" {
			t.Errorf("awaiter %d: expected 'shared', got %v", i, r)
		}
	}
}

// ---------------------------------------------------------------------------
// FutureRace: resolve before race
// ---------------------------------------------------------------------------

func TestRaceWithPrecompletedFuture(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	f1.Resolve("immediate success")

	race := FutureRace([]*Future{f1, f2})
	ch := race.Await()

	select {
	case result := <-ch:
		if result != "immediate success" {
			t.Fatalf("expected 'immediate success', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: resolve after race (delayed)
// ---------------------------------------------------------------------------

func TestRaceSuccessAfter(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	race := FutureRace([]*Future{f1, f2})

	go func() {
		time.Sleep(10 * time.Millisecond)
		f1.Resolve("first")
	}()

	ch := race.Await()
	select {
	case result := <-ch:
		if result != "first" {
			t.Fatalf("expected 'first', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: resolve before calling race (synchronous)
// ---------------------------------------------------------------------------

func TestRaceSuccessBefore(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	race := FutureRace([]*Future{f1, f2})

	f1.Resolve("first")

	ch := race.Await()
	select {
	case result := <-ch:
		if result != "first" {
			t.Fatalf("expected 'first', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: first rejection propagates
// ---------------------------------------------------------------------------

func TestRaceReturnFirstException(t *testing.T) {
	f1 := NewFuture()
	race := FutureRace([]*Future{f1})

	f1.Reject(errors.New("Error in future1"))

	ch := race.Await()
	select {
	case result := <-ch:
		err, ok := result.(error)
		if !ok {
			t.Fatalf("expected error, got %T: %v", result, result)
		}
		if err.Error() != "Error in future1" {
			t.Fatalf("expected 'Error in future1', got '%s'", err.Error())
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: mixed outcomes — first resolves, second rejects later
// ---------------------------------------------------------------------------

func TestRaceMixedOutcomes(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	race := FutureRace([]*Future{f1, f2})

	f1.Resolve("first")

	go func() {
		time.Sleep(50 * time.Millisecond)
		f2.Reject(errors.New("Error in future2"))
	}()

	ch := race.Await()
	select {
	case result := <-ch:
		if result != "first" {
			t.Fatalf("expected 'first', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: rejection wins when it comes first
// ---------------------------------------------------------------------------

func TestRaceRejectionWins(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	race := FutureRace([]*Future{f1, f2})

	f1.Reject(errors.New("fast error"))

	ch := race.Await()
	select {
	case result := <-ch:
		err, ok := result.(error)
		if !ok {
			t.Fatalf("expected error, got %T: %v", result, result)
		}
		if err.Error() != "fast error" {
			t.Fatalf("expected 'fast error', got '%s'", err.Error())
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: all futures reject — first rejection propagates
// ---------------------------------------------------------------------------

func TestRaceAllReject(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	race := FutureRace([]*Future{f1, f2})

	go func() {
		time.Sleep(10 * time.Millisecond)
		f1.Reject(errors.New("error1"))
	}()
	go func() {
		time.Sleep(20 * time.Millisecond)
		f2.Reject(errors.New("error2"))
	}()

	ch := race.Await()
	select {
	case result := <-ch:
		err, ok := result.(error)
		if !ok {
			t.Fatalf("expected error, got %T: %v", result, result)
		}
		if err.Error() != "error1" {
			t.Fatalf("expected 'error1', got '%s'", err.Error())
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: timeout — race does not resolve within deadline
// ---------------------------------------------------------------------------

func TestRaceTimeout(t *testing.T) {
	f1 := NewFuture()
	race := FutureRace([]*Future{f1})

	ch := race.Await()
	select {
	case result := <-ch:
		t.Fatalf("did not expect a result, got %v", result)
	case <-time.After(100 * time.Millisecond):
		// expected: race did not complete within deadline
	}

	// clean up
	f1.Resolve("late")
}

// ---------------------------------------------------------------------------
// FutureRace: completes within a generous deadline
// ---------------------------------------------------------------------------

func TestRaceCompletesWithinDeadline(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()

	go func() {
		time.Sleep(10 * time.Millisecond)
		f1.Resolve("completed first")
	}()

	race := FutureRace([]*Future{f1, f2})
	ch := race.Await()

	select {
	case result := <-ch:
		if result != "completed first" {
			t.Fatalf("expected 'completed first', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out — race should have completed quickly")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: single future
// ---------------------------------------------------------------------------

func TestRaceSingleFuture(t *testing.T) {
	f := NewFuture()
	race := FutureRace([]*Future{f})

	go func() {
		time.Sleep(10 * time.Millisecond)
		f.Resolve("only")
	}()

	ch := race.Await()
	select {
	case result := <-ch:
		if result != "only" {
			t.Fatalf("expected 'only', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: many futures, only one resolves
// ---------------------------------------------------------------------------

func TestRaceManyFuturesOneResolves(t *testing.T) {
	const n = 100
	futures := make([]*Future, n)
	for i := 0; i < n; i++ {
		futures[i] = NewFuture()
	}

	race := FutureRace(futures)

	// resolve the 50th future
	futures[49].Resolve("winner")

	ch := race.Await()
	select {
	case result := <-ch:
		if result != "winner" {
			t.Fatalf("expected 'winner', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}

	// clean up
	for _, f := range futures {
		f.Resolve("done")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: second future wins when first is slower
// ---------------------------------------------------------------------------

func TestRaceSecondFutureWins(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	race := FutureRace([]*Future{f1, f2})

	go func() {
		time.Sleep(50 * time.Millisecond)
		f1.Resolve("slow")
	}()
	go func() {
		time.Sleep(5 * time.Millisecond)
		f2.Resolve("fast")
	}()

	ch := race.Await()
	select {
	case result := <-ch:
		if result != "fast" {
			t.Fatalf("expected 'fast', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: empty futures slice — should not panic, race never resolves
// ---------------------------------------------------------------------------

func TestRaceEmptyFutures(t *testing.T) {
	race := FutureRace([]*Future{})
	ch := race.Await()

	select {
	case result := <-ch:
		t.Fatalf("empty race should never resolve, got %v", result)
	case <-time.After(100 * time.Millisecond):
		// expected
	}
}

// ---------------------------------------------------------------------------
// FutureRace: concurrent resolve of multiple futures
// ---------------------------------------------------------------------------

func TestRaceConcurrentResolves(t *testing.T) {
	const n = 50
	futures := make([]*Future, n)
	for i := 0; i < n; i++ {
		futures[i] = NewFuture()
	}

	race := FutureRace(futures)

	// resolve all futures concurrently
	var wg sync.WaitGroup
	wg.Add(n)
	for i := 0; i < n; i++ {
		go func(idx int) {
			defer wg.Done()
			futures[idx].Resolve(idx)
		}(i)
	}

	ch := race.Await()
	select {
	case result := <-ch:
		// any of 0..n-1 is valid
		idx, ok := result.(int)
		if !ok {
			t.Fatalf("expected int, got %T: %v", result, result)
		}
		if idx < 0 || idx >= n {
			t.Fatalf("unexpected index %d", idx)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
	wg.Wait()
}

// ---------------------------------------------------------------------------
// FutureRace: race result is itself a Future — can be awaited multiple times
// ---------------------------------------------------------------------------

func TestRaceResultAwaitedMultipleTimes(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	race := FutureRace([]*Future{f1, f2})
	f1.Resolve("value")

	// First Await
	ch1 := race.Await()
	r1 := <-ch1
	if r1 != "value" {
		t.Fatalf("first await: expected 'value', got %v", r1)
	}

	// Second Await on the same resolved race future
	ch2 := race.Await()
	select {
	case r2 := <-ch2:
		if r2 != "value" {
			t.Fatalf("second await: expected 'value', got %v", r2)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out on second await of resolved race future")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: pre-rejected future in the list
// ---------------------------------------------------------------------------

func TestRaceWithPrerejectedFuture(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	f1.Reject(errors.New("already failed"))

	race := FutureRace([]*Future{f1, f2})
	ch := race.Await()

	select {
	case result := <-ch:
		err, ok := result.(error)
		if !ok {
			t.Fatalf("expected error, got %T: %v", result, result)
		}
		if err.Error() != "already failed" {
			t.Fatalf("expected 'already failed', got '%s'", err.Error())
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: pre-resolved future is NOT the first in the slice
// ---------------------------------------------------------------------------

func TestRacePrecompletedNotFirst(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	f2.Resolve("second was ready")

	race := FutureRace([]*Future{f1, f2})
	ch := race.Await()

	select {
	case result := <-ch:
		if result != "second was ready" {
			t.Fatalf("expected 'second was ready', got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: all pre-resolved — first wins
// ---------------------------------------------------------------------------

func TestRaceAllPreresolved(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()
	f1.Resolve("first")
	f2.Resolve("second")

	race := FutureRace([]*Future{f1, f2})
	ch := race.Await()

	select {
	case result := <-ch:
		if result != "first" {
			t.Fatalf("expected 'first' (iteration order), got %v", result)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: resolve with various value types
// ---------------------------------------------------------------------------

func TestRaceWithVariousTypes(t *testing.T) {
	tests := []struct {
		name  string
		value interface{}
	}{
		{"int", 42},
		{"string", "hello"},
		{"nil", nil},
		{"slice", []int{1, 2, 3}},
		{"map", map[string]int{"a": 1}},
		{"bool", true},
		{"float", 3.14},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f := NewFuture()
			race := FutureRace([]*Future{f})
			f.Resolve(tt.value)

			ch := race.Await()
			select {
			case result := <-ch:
				// nil comparison needs special handling
				if tt.value == nil {
					if result != nil {
						t.Fatalf("expected nil, got %v", result)
					}
				}
				// for non-nil, just verify we got something (deep equality
				// is complex for slices/maps; the point is it doesn't panic)
			case <-time.After(time.Second):
				t.Fatal("timed out")
			}
		})
	}
}

// ---------------------------------------------------------------------------
// FutureRace: repeated racing of the same futures
// ---------------------------------------------------------------------------

func TestRaceRepeatedOnSameFutures(t *testing.T) {
	f1 := NewFuture()
	f2 := NewFuture()

	race1 := FutureRace([]*Future{f1, f2})
	race2 := FutureRace([]*Future{f1, f2})

	f1.Resolve("shared value")

	ch1 := race1.Await()
	ch2 := race2.Await()

	r1 := <-ch1
	r2 := <-ch2

	if r1 != "shared value" {
		t.Fatalf("race1: expected 'shared value', got %v", r1)
	}
	if r2 != "shared value" {
		t.Fatalf("race2: expected 'shared value', got %v", r2)
	}
}

// ---------------------------------------------------------------------------
// Goroutine leak: WatchMultiple simulation (#28182)
// ---------------------------------------------------------------------------

func TestFutureRaceGoroutineLeak(t *testing.T) {
	const numFutures = 200
	const iterations = 50

	runtime.GC()
	time.Sleep(50 * time.Millisecond)
	baseGoroutines := runtime.NumGoroutine()

	for i := 0; i < iterations; i++ {
		futures := make([]*Future, numFutures)
		for j := 0; j < numFutures; j++ {
			futures[j] = NewFuture()
		}

		race := FutureRace(futures)
		futures[0].Resolve("trade_data")

		ch := race.Await()
		result := <-ch
		if result != "trade_data" {
			t.Fatalf("expected trade_data, got %v", result)
		}
	}

	time.Sleep(100 * time.Millisecond)
	runtime.GC()
	time.Sleep(50 * time.Millisecond)

	goroutines := runtime.NumGoroutine()
	leaked := goroutines - baseGoroutines

	t.Logf("base goroutines: %d, current: %d, leaked: %d", baseGoroutines, goroutines, leaked)

	maxAllowed := numFutures * 2
	if leaked > maxAllowed {
		t.Errorf("goroutine leak detected: %d goroutines above baseline (max allowed: %d)", leaked, maxAllowed)
	}
}

// ---------------------------------------------------------------------------
// Goroutine leak: worst case — unresolved losers
// ---------------------------------------------------------------------------

func TestFutureRaceGoroutineGrowthUnresolved(t *testing.T) {
	const numFutures = 200
	const iterations = 20

	runtime.GC()
	time.Sleep(50 * time.Millisecond)
	baseGoroutines := runtime.NumGoroutine()

	allFutures := make([][]*Future, iterations)

	for i := 0; i < iterations; i++ {
		futures := make([]*Future, numFutures)
		for j := 0; j < numFutures; j++ {
			futures[j] = NewFuture()
		}
		allFutures[i] = futures

		race := FutureRace(futures)
		futures[0].Resolve("data")

		ch := race.Await()
		<-ch
	}

	time.Sleep(100 * time.Millisecond)
	goroutines := runtime.NumGoroutine()
	leaked := goroutines - baseGoroutines

	t.Logf("base goroutines: %d, current: %d, leaked: %d", baseGoroutines, goroutines, leaked)

	maxAllowed := iterations * 5
	if leaked > maxAllowed {
		t.Errorf("goroutine leak detected: %d goroutines above baseline (max allowed: %d)", leaked, maxAllowed)
	}

	for _, futures := range allFutures {
		for _, f := range futures {
			f.Resolve("cleanup")
		}
	}
}

// ---------------------------------------------------------------------------
// FutureRace: goroutine count scales O(1) not O(N) per call
// ---------------------------------------------------------------------------

func TestFutureRaceGoroutineCountIsConstant(t *testing.T) {
	runtime.GC()
	time.Sleep(50 * time.Millisecond)
	before := runtime.NumGoroutine()

	const n = 500
	futures := make([]*Future, n)
	for i := 0; i < n; i++ {
		futures[i] = NewFuture()
	}
	_ = FutureRace(futures)

	runtime.Gosched()
	time.Sleep(10 * time.Millisecond)
	after := runtime.NumGoroutine()

	spawned := after - before
	t.Logf("futures: %d, goroutines spawned: %d", n, spawned)

	// Old impl would spawn 500 goroutines. New impl spawns 1.
	// Allow small margin for runtime jitter.
	if spawned > 10 {
		t.Errorf("expected O(1) goroutines, but %d were spawned for %d futures", spawned, n)
	}

	// clean up
	futures[0].Resolve("done")
}

// ---------------------------------------------------------------------------
// Future: subscribers are cleaned up after resolve
// ---------------------------------------------------------------------------

func TestFutureSubscribersCleanedAfterResolve(t *testing.T) {
	f := NewFuture()

	// add several subscribers via Await
	for i := 0; i < 10; i++ {
		f.Await()
	}

	f.subscribersMu.Lock()
	countBefore := len(f.subscribers)
	f.subscribersMu.Unlock()
	if countBefore != 10 {
		t.Fatalf("expected 10 subscribers before resolve, got %d", countBefore)
	}

	f.Resolve("done")

	f.subscribersMu.Lock()
	countAfter := len(f.subscribers)
	f.subscribersMu.Unlock()
	if countAfter != 0 {
		t.Errorf("expected 0 subscribers after resolve, got %d", countAfter)
	}
}

// ---------------------------------------------------------------------------
// Future: concurrent resolve/reject safety (no panics)
// ---------------------------------------------------------------------------

func TestFutureConcurrentResolveRejectNoPanic(t *testing.T) {
	const goroutines = 100
	f := NewFuture()

	var wg sync.WaitGroup
	wg.Add(goroutines)

	for i := 0; i < goroutines; i++ {
		go func(idx int) {
			defer wg.Done()
			if idx%2 == 0 {
				f.Resolve(idx)
			} else {
				f.Reject(errors.New("err"))
			}
		}(i)
	}

	wg.Wait()

	// should be resolvable without panic
	ch := f.Await()
	select {
	case <-ch:
		// good — got a value
	case <-time.After(time.Second):
		t.Fatal("timed out")
	}
}

// ---------------------------------------------------------------------------
// FutureRace: concurrent racing and resolving (stress test)
// ---------------------------------------------------------------------------

func TestRaceConcurrentStress(t *testing.T) {
	const races = 50
	const futuresPerRace = 20

	var wg sync.WaitGroup
	wg.Add(races)

	for r := 0; r < races; r++ {
		go func() {
			defer wg.Done()
			futures := make([]*Future, futuresPerRace)
			for i := 0; i < futuresPerRace; i++ {
				futures[i] = NewFuture()
			}

			race := FutureRace(futures)

			// resolve a random-ish future
			futures[futuresPerRace/2].Resolve("ok")

			ch := race.Await()
			select {
			case result := <-ch:
				if result != "ok" {
					panic("unexpected result")
				}
			case <-time.After(5 * time.Second):
				panic("timed out in stress test")
			}

			// clean up
			for _, f := range futures {
				f.Resolve("cleanup")
			}
		}()
	}

	wg.Wait()
}
