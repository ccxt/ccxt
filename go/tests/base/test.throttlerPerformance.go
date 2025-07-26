package base

import (
	"fmt"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

func TestThrottlerPerformanceHelper(exchange *ccxt.Exchange, numRequests interface{}) <- chan interface{} {
            ch := make(chan interface{})
            go func() interface{} {
                defer close(ch)
                defer ReturnPanicError(ch)
                    var startTime interface{} = time.Now()
            for i := 0; IsLessThan(i, numRequests); i++ {
                // Use the throttler directly without making any API calls
        
                retRes108 := (<-exchange.Throttle(1))
                PanicOnError(retRes108) // cost of 1
                var mockResult map[string]interface{} = map[string]interface{} {
                    "id": "mock",
                    "timestamp": time.Now().UnixMilli(),
                    "data": "mock data",
                }
                Assert(IsEqual(GetValue(mockResult, "id"), "mock"))
            }
            var totalTime interface{} = time.Since(startTime.(time.Time)).Milliseconds()
        
            ch <- totalTime
            return nil
        
            }()
            return ch
        }
func TestThrottlerPerformance() <- chan interface{} {
            ch := make(chan interface{})
            go func() interface{} {
                defer close(ch)
                defer ReturnPanicError(ch)
                exchange1 := ccxt.NewBinance(map[string]interface{} {
            "enableRateLimit": true,
        })
        
        rollingWindowTime:= (<-TestThrottlerPerformanceHelper(&exchange1.Exchange, 100))
        PanicOnError(rollingWindowTime)
        exchange2 := ccxt.NewBinance(map[string]interface{} {
            "enableRateLimit": true,
            "rollingWindowSize": 0,
        })
        
        leakyBucketTime:= (<-TestThrottlerPerformanceHelper(&exchange2.Exchange, 20))
        PanicOnError(leakyBucketTime)
        var rollingWindowTimeString interface{} = ToString(rollingWindowTime)
        var leakyBucketTimeString interface{} = ToString(leakyBucketTime)
        Assert(IsLessThanOrEqual(rollingWindowTime, 1000), Add("Rolling window throttler happen immediately, time was: ", rollingWindowTimeString))
        Assert(IsGreaterThanOrEqual(leakyBucketTime, 500), Add("Leaky bucket throttler should take at least half a second for 20 requests, time was: ", leakyBucketTimeString))
        fmt.Println("┌─────────────────┬──────────────┬─────────────────┐")
        fmt.Println("│ Algorithm       │ Time (ms)    │ Expected (ms)   │")
        fmt.Println("├─────────────────┼──────────────┼─────────────────┤")
        fmt.Println(Add(Add("│ Rolling Window  │            ", rollingWindowTimeString), " │ 0-1             │"))
        fmt.Println(Add(Add("│ Leaky Bucket    │          ", leakyBucketTimeString), " │ ~950            │"))
        fmt.Println("└─────────────────┴──────────────┴─────────────────┘")
                return nil
            }()
            return ch
        }