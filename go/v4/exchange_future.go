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
	// mu guards resolved state AND subscribers together: Await must check
	// resolved and append its subscriber under the same lock that Resolve
	// and Reject use to set the state and take the subscriber snapshot,
	// otherwise a resolve landing between an unlocked check and the append
	// notifies an empty list, clears it, and the subscriber blocks forever,
	// see https://github.com/ccxt/ccxt/issues/29586
	mu   sync.Mutex
	once sync.Once
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
		subscribers := f.subscribers
		f.subscribers = nil
		f.mu.Unlock()

		func() {
			defer func() {
				if r := recover(); r != nil {
					// Channel is closed, but that's okay since we're using sync.Once
					// and the future is already marked as resolved
				}
			}()
			select {
			case f.result <- value:
			default:
			}
		}()

		// notify the snapshot outside the lock, every subscriber channel has
		// capacity 1 and receives at most this one send, so the non blocking
		// send cannot drop a wakeup
		for _, sub := range subscribers {
			func(sub chan any) {
				defer func() {
					if r := recover(); r != nil {
						// Channel is closed, but that's okay since we're using sync.Once
						// and the future is already marked as resolved
					}
				}()
				select {
				case sub <- value:
				default:
				}
			}(sub)
		}
	})
}

// Reject asynchronously with an error
func (f *Future) Reject(reason any) {
	f.once.Do(func() {
		f.mu.Lock()
		f.resolved = true
		f.resolvedValue = nil
		f.resolvedError = reason
		subscribers := f.subscribers
		f.subscribers = nil
		f.mu.Unlock()

		func() {
			defer func() {
				if r := recover(); r != nil {
					// Channel is closed, but that's okay since we're using sync.Once
					// and the future is already marked as resolved
				}
			}()
			select {
			case f.err <- reason:
			default:
			}
		}()

		// notify the snapshot outside the lock, see Resolve
		for _, sub := range subscribers {
			func(sub chan any) {
				defer func() {
					if r := recover(); r != nil {
						// Channel is closed, but that's okay since we're using sync.Once
						// and the future is already marked as resolved
					}
				}()
				select {
				case sub <- reason:
				default:
				}
			}(sub)
		}
	})
}

func (f *Future) Await() <-chan any {
	ch := make(chan any, 1)
	f.mu.Lock()
	if f.resolved {
		// Already resolved, return cached value immediately
		if f.resolvedError != nil {
			ch <- f.resolvedError
		} else {
			ch <- f.resolvedValue
		}
		f.mu.Unlock()
		return ch
	}
	// still unresolved under the same lock, so a concurrent Resolve cannot
	// have taken its subscriber snapshot yet, the append below is safe
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
		// same lock spans the resolved check and the subscribe, a resolve
		// landing in between would otherwise notify an empty list and this
		// racer would never wake, see https://github.com/ccxt/ccxt/issues/29586
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
