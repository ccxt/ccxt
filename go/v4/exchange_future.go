package ccxt

import (
	"sync"
	"time"
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


type Future struct {
    result chan interface{}
    err    chan error
    resolved bool
    resolvedValue interface{}
    resolvedError error
    mu sync.Mutex
}

// Create new Future
func NewFuture() *Future {
    return &Future{
        result: make(chan interface{}, 1),
        err:    make(chan error, 1),
    }
}

// Resolve asynchronously with a value
func (f *Future) Resolve(value interface{}) {
    
    f.mu.Lock()
    if f.resolved {
        // Already resolved, ignore
        f.mu.Unlock()
        return
    }
    f.mu.Unlock()
    
    go func() {
        time.Sleep(0) // defer to next goroutine scheduling, like setTimeout 0
        f.result <- value
    }()
}

// Reject asynchronously with an error
func (f *Future) Reject(reason error) {
    f.mu.Lock()
    if f.resolved {
        // Already resolved, ignore
        f.mu.Unlock()
        return
    }
    f.mu.Unlock()
    
    go func() {
        time.Sleep(0)
        f.err <- reason
    }()
}

// Await blocks until either result or error is received
// Returns the resolved value (which could be an error)
func (f *Future) Await() interface{} {
    f.mu.Lock()
    if f.resolved {
        // Already resolved, return cached value immediately
        defer f.mu.Unlock()
        if f.resolvedError != nil {
            return f.resolvedError
        }
        return f.resolvedValue
    }
    f.mu.Unlock()
    
    // Not resolved yet, wait for it
    select {
    case res := <-f.result:
        f.mu.Lock()
        f.resolved = true
        f.resolvedValue = res
        f.resolvedError = nil
        f.mu.Unlock()
        return res
    case err := <-f.err:
        f.mu.Lock()
        f.resolved = true
        f.resolvedValue = nil
        f.resolvedError = err
        f.mu.Unlock()
        return err
    }
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
            futureResponse := fut.Await()
            if err, isError := futureResponse.(error); isError {
                result.Reject(err)
            } else {
                result.Resolve(futureResponse)
            }
        }(f)
    }
    return result
}
