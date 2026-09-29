package base

import ccxt "github.com/ccxt/ccxt/go/v4"

func TestLanguageSpecificAsync() <-chan ccxt.AsyncResult[any] {
	TestFutures()
	TestStructs()
	TestOptionTypes()

	// ---------------------- TestThrottlerPerformance ----------------------
	ch := make(chan ccxt.AsyncResult[any])
	go func() interface{} {
		defer close(ch)
		defer ReturnPanicError(ch)

		// Run throttler performance test (the one that creates its own exchanges)
		// This is the test from test.throttlerPerformance.go, not test.throttler.go
		TestThrottlerPerformance()

		return nil
	}()
	return ch
	// ---------------------- TestThrottlerPerformance ----------------------
}
