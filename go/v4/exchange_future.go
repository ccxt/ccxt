package ccxt

import (
	"sync"
)

// Future is a one-shot promise
//	- once resolved or rejected its channel is closed and subsequent Resolve/Reject calls are ignored.
//	- matches the minimal API the generated WS code expects: Resolve(...).
//	- use the channel returned by Await() (or the struct itself) to receive the value

type GetsLimit interface {
	GetLimit(symbol interface{}, limit interface{}) interface{}
}

// used when a value does not implement GetsLimit
// returns the caller-supplied limit unchanged
type NoopLimit struct{ Val interface{} }

func (n NoopLimit) GetLimit(symbol interface{}, limit interface{}) interface{} { return limit }

// converts arbitrary values to the GetsLimit interface expected by Future.Resolve
func ToGetsLimit(v interface{}) GetsLimit {
	if gl, ok := v.(GetsLimit); ok {
		//If the value already implements GetsLimit it is returned verbatim
		return gl
	}
	return NoopLimit{Val: v} // otherwise it is wrapped in NoopLimit
}

type Future struct {
	result        chan interface{}
	err           chan interface{}
	subscribers   []chan interface{}
	resolved      bool
	resolvedValue interface{}
	resolvedError interface{}
	mu            sync.Mutex
	once          sync.Once
	subscribersMu sync.Mutex
}

// Create new Future
func NewFuture() *Future {
	return &Future{
		result: make(chan interface{}, 1),
		err:    make(chan interface{}, 1),
	}
}

// Resolve asynchronously with a value
func (f *Future) Resolve(args ...interface{}) {
	var value interface{}
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

		f.subscribersMu.Lock()
		// Notify all subscribers
		for _, sub := range f.subscribers {
			func(sub chan interface{}) {
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
		f.subscribers = nil // Clear subscribers after notifying them
		f.subscribersMu.Unlock()
	})
}

// Reject asynchronously with an error
func (f *Future) Reject(reason interface{}) {
	f.once.Do(func() {
		f.mu.Lock()
		f.resolved = true
		f.resolvedValue = nil
		f.resolvedError = reason
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

		// Notify all subscribers
		for _, sub := range f.subscribers {
			func(sub chan interface{}) {
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
		f.subscribers = nil // Clear subscribers after notifying them
	})
}

// // Await blocks until either result or error is received
// // Returns the resolved value (which could be an error)
// func (f *Future) Await() <-chan interface{} {
// 	ch := make(chan interface{})

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

// 		var out interface{}
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

func (f *Future) Await() <-chan interface{} {
	ch := make(chan interface{}, 1)
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
	f.mu.Unlock()
	f.subscribersMu.Lock()
	if f.subscribers == nil {
		f.subscribers = make([]chan interface{}, 0)
	}
	f.subscribers = append(f.subscribers, ch)
	f.subscribersMu.Unlock()
	// go func() {
	// 	defer close(ch)
	// 	// f.mu.Lock()
	// 	if f.resolved {
	// 		// Already resolved, return cached value immediately
	// 		if f.resolvedError != nil {
	// 			ch <- f.resolvedError
	// 		} else {
	// 			ch <- f.resolvedValue
	// 		}
	// 		// f.mu.Unlock()
	// 		return
	// 	}

	// 	// f.mu.Unlock()

	// 	// Not resolved yet, wait for it
	// 	select {
	// 	case res := <-f.result:
	// 		ch <- res
	// 	case err := <-f.err:
	// 		ch <- err
	// 	}
	// }()

	return ch
}

// Wrap an existing channel that returns (interface{}, error) into Future
func WrapFuture(ch <-chan struct {
	val interface{}
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

// Race multiple Futures: returns the first resolved or rejected value/error
func FutureRace(futures []*Future) *Future {
	result := NewFuture()
	for _, f := range futures {
		go func(fut *Future) {
			futureC := fut.Await()
			futureResponse := <-futureC
			if err, isError := futureResponse.(error); isError {
				result.Reject(err)
			} else {
				result.Resolve(futureResponse)
			}
		}(f)
	}
	return result
}
