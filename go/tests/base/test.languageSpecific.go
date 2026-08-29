package base

func TestLanguageSpecific() <-chan interface{} {
	TestFutures()
	TestStructs()

	// ---------------------- TestThrottlerPerformance ----------------------
	ch := make(chan interface{})
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
