package ccxt

import (
	"reflect"
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
	return NoopLimit{Val: v}  // otherwise it is wrapped in NoopLimit
}

type Future chan interface{}

// futureState tracks the state of a Future to prevent double-close
type futureState struct {
	once   sync.Once
	closed bool
	mu     sync.Mutex
}

var futureStates = sync.Map{} // map[Future]*futureState

// constructor
func NewFuture() Future {
	f := make(Future, 1000)
	futureStates.Store(f, &futureState{})
	return f
}

// Await is still available (now just returns itself)
func (f Future) Await() <-chan interface{} {
	ch := make(chan interface{}, 1000)
	go func() {
		defer close(ch)
		// Read all messages from the Future channel and forward them
		for val := range f {
			// Unwrap the GetsLimit interface to get the actual data
			if noopLimit, ok := val.(NoopLimit); ok {
				ch <- noopLimit.Val
			} else {
				// For debugging: print the type to understand what we're getting
				ch <- val
			}
		}
	}()
	return ch
}

// Resolve / Reject send once then close
func (f Future) Resolve(vals ...interface{}) {
	if state, ok := futureStates.Load(f); ok {
		fs := state.(*futureState)
		fs.once.Do(func() {
			defer func() {
				// Recover from panic if channel is already closed
				if r := recover(); r != nil {
					// Channel was already closed, ignore
				}
			}()
			
			var v interface{}
			if len(vals) > 0 {
				v = vals[0]
			}
			
			select {
			case f <- v:
			default: // channel full, ignore
			}
			close(f)
			
			fs.mu.Lock()
			fs.closed = true
			fs.mu.Unlock()
			
			// Clean up the state map
			futureStates.Delete(f)
		})
	}
}

// ResolveOngoing sends data without closing the channel (for ongoing updates)
func (f Future) ResolveOngoing(vals ...interface{}) {
	if state, ok := futureStates.Load(f); ok {
		fs := state.(*futureState)
		fs.mu.Lock()
		if fs.closed {
			fs.mu.Unlock()
			return // already closed
		}
		fs.mu.Unlock()
		
		var v interface{}
		if len(vals) > 0 {
			v = vals[0]
		}
		
		select {
		case f <- v:
		default: // channel full, drop message
		}
	}
}

func (f Future) Reject(err interface{}) { f.Resolve(err) }

// IsClosed safely checks if the Future has been resolved/closed
func (f Future) IsClosed() bool {
	if state, ok := futureStates.Load(f); ok {
		fs := state.(*futureState)
		fs.mu.Lock()
		defer fs.mu.Unlock()
		return fs.closed
	}
	return false
}

func WrapFuture(aggregatePromise chan interface{}) Future {
	p := NewFuture()
	// wrap the promises as a future
	go func() {
		result := <-aggregatePromise
		p.Resolve(result)
	}()
	return p
}

func FutureRace(futures []Future) Future {
	p := NewFuture()
	go func() {
		cases := make([]reflect.SelectCase, len(futures))
		for i, fut := range futures {
			cases[i] = reflect.SelectCase{Dir: reflect.SelectRecv, Chan: reflect.ValueOf(fut)}
		}
		_, value, _ := reflect.Select(cases)
		p.Resolve(value.Interface())
	}()
	return p
}

// NOTE: the Client.Future helper is implemented in exchange_client.go