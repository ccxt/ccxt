package ccxt

import (
	"sync"
)

// Future is a one-shot promise
//	- once resolved or rejected its channel is closed and subsequent Resolve/Reject calls are ignored.
//	- matches the minimal API the generated WS code expects: Resolve(...).
//	- use the channel returned by Await() (or the struct itself) to receive the value

type GetsLimit interface {
	GetLimit(symbol any, limit any) any
}

// used when a value does not implement GetsLimit
// returns the caller-supplied limit unchanged
type NoopLimit struct{ Val any }

func (n NoopLimit) GetLimit(symbol any, limit any) any { return limit }

// converts arbitrary values to the GetsLimit interface expected by Future.Resolve
func ToGetsLimit(v any) GetsLimit {
	if gl, ok := v.(GetsLimit); ok {
		//If the value already implements GetsLimit it is returned verbatim
		return gl
	}
	return NoopLimit{Val: v} // otherwise it is wrapped in NoopLimit
}

type Future struct {
	result        chan any
	err           chan any
	subscribers   []chan any
	resolved      bool
	resolvedValue any
	resolvedError any
	mu            sync.Mutex // guards resolved, resolvedValue, resolvedError, and subscribers
	once          sync.Once
}

// Create new Future
func NewFuture() *Future {
	return &Future{
		result: make(chan any, 1),
		err:    make(chan any, 1),
	}
}

// Resolve asynchronously with a value
func (f *Future) Resolve(args ...any) {
	var value any
	if len(args) == 0 {
		value = nil
	} else {
		value = args[0]
	}
	f.once.Do(func() {
		f.mu.Lock()
		f.resolved = true
		f.resolvedValue = value
		f.resolvedError = nil
		// Notify result channel (non-blocking; mu is still held so this
		// must not block — the channel is buffered size 1).
		func() {
			defer func() { recover() }() //nolint:errcheck
			select {
			case f.result <- value:
			default:
			}
		}()
		// Notify and clear all subscribers atomically while holding mu.
		// Sends are non-blocking (buffered channels, select+default), so
		// holding the lock here cannot cause a deadlock.
		for _, sub := range f.subscribers {
			select {
			case sub <- value:
			default:
			}
		}
		f.subscribers = nil
		f.mu.Unlock()
	})
}

// Reject asynchronously with an error
func (f *Future) Reject(reason any) {
	f.once.Do(func() {
		f.mu.Lock()
		f.resolved = true
		f.resolvedValue = nil
		f.resolvedError = reason
		// Notify error channel (non-blocking; mu is still held so this
		// must not block — the channel is buffered size 1).
		func() {
			defer func() { recover() }() //nolint:errcheck
			select {
			case f.err <- reason:
			default:
			}
		}()
		// Notify and clear all subscribers atomically while holding mu.
		for _, sub := range f.subscribers {
			select {
			case sub <- reason:
			default:
			}
		}
		f.subscribers = nil
		f.mu.Unlock()
	})
}

// // Await blocks until either result or error is received
// // Returns the resolved value (which could be an error)
// func (f *Future) Await() <-chan any {
// 	ch := make(chan any)

// 	go func() {
// 		defer close(ch)

// 		// f.mu.Lock()
// 		if f.resolved {
// 			// f.mu.Unlock()
// 			// for {
// 			// Already resolved, return cached value immediately
// 			// f.mu.Lock()
// 			if f.resolvedError != nil {
// 				ch <- f.resolvedError
// 			} else {
// 				ch <- f.resolvedValue
// 			}
// 			// f.mu.Unlock()
// 			// f.mu.Unlock()
// 			// return
// 		}
// 		// }
// 		// f.mu.Unlock()

// 		// // Not resolved yet, wait for it
// 		// select {
// 		// case res := <-f.result:
// 		// 	for {
// 		// 		ch <- res
// 		// 	}
// 		// case err := <-f.err:
// 		// 	for {
// 		// 		ch <- err
// 		// 	}
// 		// }

// 		resCh, errCh := f.result, f.err
// 		// f.mu.Unlock()

// 		var out any
// 		select {
// 		case out = <-resCh:
// 		case out = <-errCh:
// 		}

// 		// Cache the resolution
// 		f.mu.Lock()
// 		f.resolved = true
// 		if e, ok := out.(error); ok {
// 			f.resolvedError = e
// 		} else {
// 			f.resolvedValue = out
// 		}
// 		val, err := f.resolvedValue, f.resolvedError
// 		f.mu.Unlock()

// 		// for {
// 		if err != nil {
// 			ch <- err
// 		} else {
// 			ch <- val
// 		}
// 		// }
// 	}()

// 	return ch
// }

func (f *Future) Await() <-chan any {
	ch := make(chan any, 1)
	f.mu.Lock()
	if f.resolved {
		// Already resolved — return cached value without subscribing.
		if f.resolvedError != nil {
			ch <- f.resolvedError
		} else {
			ch <- f.resolvedValue
		}
		f.mu.Unlock()
		return ch
	}
	// Not yet resolved: subscribe while still holding mu so that a
	// concurrent Resolve/Reject cannot drain the subscriber list in the
	// window between the resolved-check above and the append below.
	if f.subscribers == nil {
		f.subscribers = make([]chan any, 0)
	}
	f.subscribers = append(f.subscribers, ch)
	f.mu.Unlock()
	return ch
}

// Wrap an existing channel that returns (any, error) into Future
func WrapFuture(ch <-chan struct {
	val any
	err error
}) *Future {
	f := NewFuture()
	go func() {
		v := <-ch
		if v.err != nil {
			f.Reject(v.err)
		} else {
			f.Resolve(v.val)
		}
	}()
	return f
}

// Race multiple Futures: returns the first resolved or rejected value/error.
// Uses a shared subscriber channel instead of one goroutine per future to
// avoid O(N) goroutine creation on every call (fixes #28182).
func FutureRace(futures []*Future) *Future {
	result := NewFuture()
	// Buffered so that a non-blocking send from Future.Resolve succeeds
	// even before the reader goroutine is scheduled.
	sharedCh := make(chan interface{}, 1)

	for _, f := range futures {
		f.mu.Lock()
		if f.resolved {
			val, err := f.resolvedValue, f.resolvedError
			f.mu.Unlock()
			if err != nil {
				result.Reject(err.(error))
			} else {
				result.Resolve(val)
			}
			return result
		}
		// Subscribe while still holding mu so that a concurrent Resolve
		// cannot drain the subscriber list between the resolved-check
		// above and the append below (fixes the check-then-subscribe race).
		if f.subscribers == nil {
			f.subscribers = make([]chan interface{}, 0)
		}
		f.subscribers = append(f.subscribers, sharedCh)
		f.mu.Unlock()
	}

	// Single goroutine forwards the first resolved/rejected value.
	go func() {
		val := <-sharedCh
		if err, isError := val.(error); isError {
			result.Reject(err)
		} else {
			result.Resolve(val)
		}
	}()

	return result
}
