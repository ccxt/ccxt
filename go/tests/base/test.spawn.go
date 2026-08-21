package base

import ccxt "github.com/ccxt/ccxt/go/v4"

// Spawn mirrors BaseExchange.Spawn so deferred async calls that ast-transpiler
// emits as `this.Spawn(this.Method, args...).Await()` compile on testMainClass.
// tests.ts is not an Exchange; without this method, `go build ./tests/main.go`
// fails after pinning ast-transpiler#64.
func (this *testMainClass) Spawn(method any, args ...any) *ccxt.Future {
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
