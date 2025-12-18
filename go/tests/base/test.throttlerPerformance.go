package base

import (
	"fmt"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

func TestThrottlerPerformanceHelper(exchange *ccxt.Exchange, numRequests interface{}) <-chan interface{} {
	ch := make(chan interface{})
	go func() interface{} {
		defer close(ch)
		defer ReturnPanicError(ch)
		var startTime interface{} = time.Now()
		for i := 0; IsLessThan(i, numRequests); i++ {
			// Use the throttler directly without making any API calls

			retRes108 := (<-exchange.Throttle(1))
			PanicOnError(retRes108) // cost of 1
			var mockResult map[string]interface{} = map[string]interface{}{
				"id":        "mock",
				"timestamp": time.Now().UnixMilli(),
				"data":      "mock data",
			}
			Assert(IsEqual(GetValue(mockResult, "id"), "mock"))
		}
		var totalTime interface{} = time.Since(startTime.(time.Time)).Milliseconds()

		ch <- totalTime
		return nil

	}()
	return ch
}

// Synchronous version of TestThrottlerPerformance for when we need immediate output
func TestThrottlerPerformance() {
	exchange1 := ccxt.NewBinance(map[string]interface{}{
		"enableRateLimit":      true,
		"rateLimiterAlgorithm": "rollingWindow",
	})

	rollingWindowTime := (<-TestThrottlerPerformanceHelper(&exchange1.Exchange, 100))
	PanicOnError(rollingWindowTime)
	exchange2 := ccxt.NewBinance(map[string]interface{}{
		"enableRateLimit":      true,
		"rateLimiterAlgorithm": "leakyBucket",
	})

	leakyBucketTime := (<-TestThrottlerPerformanceHelper(&exchange2.Exchange, 20))
	PanicOnError(leakyBucketTime)
	exchange3 := ccxt.NewBinance(map[string]interface{}{
		"enableRateLimit":   true,
		"rollingWindowSize": 0,
	})

	rollingWindow0Time := (<-TestThrottlerPerformanceHelper(&exchange3.Exchange, 20))
	PanicOnError(rollingWindow0Time)
	var rollingWindowTimeString interface{} = ToString(rollingWindowTime)
	var leakyBucketTimeString interface{} = ToString(leakyBucketTime)
	var rollingWindow0TimeString interface{} = ToString(rollingWindow0Time)
	Assert(IsLessThanOrEqual(rollingWindowTime, 1000), Add("Rolling window throttler happen immediately, time was: ", rollingWindowTimeString))
	Assert(IsGreaterThanOrEqual(leakyBucketTime, 500), Add("Leaky bucket throttler should take at least half a second for 20 requests, time was: ", leakyBucketTimeString))
	Assert(IsGreaterThanOrEqual(rollingWindow0Time, 500), Add("With rollingWindowSize === 0, the Leaky bucket throttler should be used and take at least half a second for 20 requests, time was: ", rollingWindow0TimeString))
	fmt.Println("┌─────────────────┬──────────────┬─────────────────┐")
	fmt.Println("│ Algorithm       │ Time (ms)    │ Expected (ms)   │")
	fmt.Println("├─────────────────┼──────────────┼─────────────────┤")
	fmt.Println(Add(Add("│ Rolling Window  │            ", rollingWindowTimeString), " │ 0-1             │"))
	fmt.Println(Add(Add("│ Leaky Bucket    │          ", leakyBucketTimeString), " │ ~950            │"))
	fmt.Println(Add(Add("│ Leaky Bucket (rollingWindowSize === 0)    │          ", rollingWindow0TimeString), " │ ~950            │"))
	fmt.Println("└─────────────────┴──────────────┴─────────────────┘")
}
