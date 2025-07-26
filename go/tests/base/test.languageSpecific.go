package base

func TestLanguageSpecific() <- chan interface{} {
    ch := make(chan interface{})
    go func() interface{} {
        defer close(ch)
        defer ReturnPanicError(ch)
        
        // Run throttler performance test (the one that creates its own exchanges)
        // This is the test from test.throttlerPerformance.go, not test.throttler.go
        retRes := (<-TestThrottlerPerformance())
        PanicOnError(retRes)
        
        return nil
    }()
    return ch
}
