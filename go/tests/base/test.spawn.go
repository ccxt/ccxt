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
//
// The recover below is what makes that true rather than fatal. A spawned goroutine is the
// root of its own stack, so a panic escaping this closure has no caller to catch it and
// kills the whole test binary -- which is exactly what `panic(NotSupported(grvt signIn()…))`
// did to `go run ./tests/main.go --requestTests`. Recovering here and resolving the Future
// with the same "panic:…" string a flattened core would have produced keeps the failure
// visible to the awaiting goroutine (IsError / CreateReturnError / PanicOnError all match on
// that prefix) without taking the process down, and without leaving waiters hanging.
func Spawn(method any, args ...any) *ccxt.Future {
	future := ccxt.NewFuture()
	go func() {
		defer func() {
			if r := recover(); r != nil {
				if r == "break" {
					// transpiler loop-control marker, not a failure, mirrors ReturnPanicError
					future.Resolve(nil)
					return
				}
				future.Resolve(ccxt.PanicMessage(r))
			}
		}()
		// A blind `.(<-chan any)` type assert panics whenever the callee is not an async
		// core -- notably a void helper, where CallDynamically returns nil. Switch instead
		// so those resolve cleanly rather than relying on the recover above. The nil checks
		// matter as well: a typed-nil channel satisfies the case but blocks forever on
		// receive, so treat "no channel" as "nothing to await" instead of hanging a waiter.
		var response any
		switch awaited := ccxt.CallDynamically(method, args...).(type) {
		case <-chan any:
			if awaited != nil {
				response = <-awaited
			}
		case chan any:
			if awaited != nil {
				response = <-awaited
			}
		case *ccxt.Future:
			if awaited != nil {
				response = <-awaited.Await()
			}
		default:
			// void or synchronous callee: nothing to await, pass the value through (nil included)
			response = awaited
		}
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
