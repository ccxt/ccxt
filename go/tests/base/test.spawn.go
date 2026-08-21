package base

import ccxt "github.com/ccxt/ccxt/go/v4"

// Spawn starts an async call on its own goroutine and hands back a *Future, so a
// deferred (stored, not immediately awaited) call keeps JS promise semantics.
//
// Go async cores are emitted FLAT: the body runs inline on the caller's goroutine and
// the capacity-1 result channel is already filled by the time the call expression
// yields. That is right for an `await`ed call, but it serializes the fan-out idiom
//
//	const withoutSymbol = testWatchTickersHelper (exchange, props, undefined);
//	const withSymbol    = testWatchTickersHelper (exchange, props, [ symbol ]);
//	await Promise.all ([ withSymbol, withoutSymbol ]);
//
// so ast-transpiler wraps such calls as `Spawn(Fn, args...).Await()`. `.Await()` returns
// a channel without blocking, so the next Spawn starts before the first one finishes.
//
// Two receivers are needed because the transpiled test harness has both shapes:
//   - methods on testMainClass (tests.ts)   -> `this.Spawn(this.Method, ...)`
//   - module-scope `async function` helpers -> `Spawn(Helper, ...)`, this package-level
//     twin; a free function has no receiver to hang Spawn off
//
// Panics survive either way: the callee's own `defer ReturnPanicError(ch)` recovers its
// body panic into its channel, Spawn resolves the Future with that panic string, and the
// awaiting site's PanicOnError re-panics it on the awaiting goroutine.
func Spawn(method any, args ...any) *ccxt.Future {
	future := ccxt.NewFuture()
	go func() {
		response := <-(ccxt.CallDynamically(method, args...).(<-chan any))
		if err, ok := response.(error); ok {
			future.Reject(err)
		} else {
			future.Resolve(response)
		}
	}()
	return future
}

// Spawn mirrors the package-level Spawn for calls written as `this.Spawn(this.Method,
// args...)`. tests.ts is not an Exchange, so testMainClass needs its own copy for
// `go build ./tests/main.go` to succeed.
func (this *testMainClass) Spawn(method any, args ...any) *ccxt.Future {
	return Spawn(method, args...)
}
