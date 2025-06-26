package ccxt

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

type Future chan GetsLimit

// constructor
func NewFuture() Future { return make(Future, 1000) }

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
    var v interface{}
    if len(vals) > 0 {
        v = vals[0]
    }
    select {
    case f <- ToGetsLimit(v):
    default:               // already resolved
    }
    close(f)
}

// ResolveOngoing sends data without closing the channel (for ongoing updates)
func (f Future) ResolveOngoing(vals ...interface{}) {
    var v interface{}
    if len(vals) > 0 {
        v = vals[0]
    }
    select {
    case f <- ToGetsLimit(v):
    default:               // channel full, drop message
    }
}
func (f Future) Reject(err interface{}) { f.Resolve(err) }

// NOTE: the Client.Future helper is implemented in exchange_client.go