package ccxt

// Future is a one-shot promise
//	- once resolved or rejected its channel is closed and subsequent Resolve/Reject calls are ignored.
//	- matches the minimal API the generated WS code expects: Resolve(...).
//	- use the channel returned by Await() (or the struct itself) to receive the value

type GetsLimit interface {
	GetLimit(symbol any, limit any) *int64
}

// used when a value does not implement GetsLimit
// returns the caller-supplied limit unchanged
type NoopLimit struct{ Val any }

func (n NoopLimit) GetLimit(symbol any, limit any) *int64 { return Int64PtrTyped(limit) }

// converts arbitrary values to the GetsLimit interface expected by Future.Resolve
func ToGetsLimit(v any) GetsLimit {
	if gl, ok := v.(GetsLimit); ok {
		//If the value already implements GetsLimit it is returned verbatim
		return gl
	}
	return NoopLimit{Val: v} // otherwise it is wrapped in NoopLimit
}

// futureState is the resolution state plus the pending subscribers; whoever
// holds it out of the state channel is its only owner, so the resolved flag and
// the subscriber list are never half-updated (ccxt issue 29586).
type futureState struct {
	resolved bool
	value    any
	err      any
	subs     []chan AsyncResult[any]
}

type Future struct {
	result chan any
	err    chan any
	state  chan futureState
}

// Create new Future
func NewFuture() *Future {
	future := &Future{
		result: make(chan any, 1),
		err:    make(chan any, 1),
		state:  make(chan futureState, 1),
	}
	future.state <- futureState{}
	return future
}

func (f *Future) takeState() futureState {
	return <-f.state
}

func (f *Future) putState(st futureState) {
	f.state <- st
}

// deliverOutcome performs the non-blocking wake-up send a promise owes its waiters;
// both channels involved are buffered with the single value they carry.
func deliverOutcome(ch chan AsyncResult[any], outcome AsyncResult[any]) {
	defer func() {
		if r := recover(); r != nil {
			// the waiter dropped its channel; the outcome stays readable in the state
		}
	}()
	select {
	case ch <- outcome:
	default:
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
	st := f.takeState()
	if st.resolved {
		f.putState(st)
		return
	}
	st.resolved = true
	st.value = value
	st.err = nil
	subscribers := st.subs
	st.subs = nil
	f.putState(st)

	func() {
		defer func() {
			if r := recover(); r != nil {
				// the result channel is already drained, nothing else to publish
			}
		}()
		select {
		case f.result <- value:
		default:
		}
	}()

	// notify the snapshot taken under the token, every subscriber channel has
	// capacity 1 and receives at most this one send, so the non blocking
	// send cannot drop a wakeup
	for _, sub := range subscribers {
		deliverOutcome(sub, AsyncResult[any]{Value: value})
	}
}

// Reject asynchronously with an error
func (f *Future) Reject(reason any) {
	st := f.takeState()
	if st.resolved {
		f.putState(st)
		return
	}
	st.resolved = true
	st.value = nil
	st.err = reason
	subscribers := st.subs
	st.subs = nil
	f.putState(st)

	func() {
		defer func() {
			if r := recover(); r != nil {
				// the error channel is already drained, nothing else to publish
			}
		}()
		select {
		case f.err <- reason:
		default:
		}
	}()

	failure := rejectionError(reason)
	for _, sub := range subscribers {
		deliverOutcome(sub, AsyncResult[any]{Err: failure})
	}
}

// rejectionError is the Err a rejection reason is delivered as; a nil reason reads as nil, as before.
func rejectionError(reason any) error {
	if reason == nil {
		return nil
	}
	return RecoveredError(reason)
}

// Await delivers the outcome: {Value} on resolve, {Err} on reject.
func (f *Future) Await() <-chan AsyncResult[any] {
	ch := make(chan AsyncResult[any], 1)
	st := f.takeState()
	if st.resolved {
		// Already resolved, hand the cached outcome over immediately
		if st.err != nil {
			ch <- AsyncResult[any]{Err: rejectionError(st.err)}
		} else {
			ch <- AsyncResult[any]{Value: st.value}
		}
		f.putState(st)
		return ch
	}
	// the resolved check and the append are one ownership step, so a resolve
	// cannot have snapshotted the subscriber list in between
	st.subs = append(st.subs, ch)
	f.putState(st)

	return ch
}

// Race multiple Futures: returns the first resolved or rejected value/error.
// Uses a shared subscriber channel instead of one goroutine per future to
// avoid O(N) goroutine creation on every call (fixes #28182).
func FutureRace(futures []*Future) *Future {
	result := NewFuture()
	// Buffered so that a non-blocking send from Future.Resolve succeeds
	// even before the reader goroutine is scheduled.
	sharedCh := make(chan AsyncResult[any], 1)

	for _, f := range futures {
		st := f.takeState()
		if st.resolved {
			val, err := st.value, st.err
			f.putState(st)
			if err != nil {
				result.Reject(err)
			} else {
				result.Resolve(val)
			}
			return result
		}
		// the resolved check and the subscribe are one ownership step, a resolve
		// landing in between would otherwise notify an empty list and this
		// racer would never wake, see https://github.com/ccxt/ccxt/issues/29586
		st.subs = append(st.subs, sharedCh)
		f.putState(st)
	}

	// Single goroutine forwards the first resolved/rejected value.
	go func() {
		val := <-sharedCh
		if val.Err != nil {
			result.Reject(val.Err)
		} else {
			result.Resolve(val.Value)
		}
	}()

	return result
}
