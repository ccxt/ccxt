using ccxt;
using System.Diagnostics;
namespace Tests;

public partial class BaseTest
{
        async public Task<object> testThrottlerPerformanceHelper(Exchange exchange, object numRequests)
        {
            var stopwatch = Stopwatch.StartNew();
            for (object i = 0; isLessThan(i, numRequests); postFixIncrement(ref i))
            {
                // Use the throttler directly without making any API calls
                await exchange.throttle(1); // cost of 1
                object mockResult = new Dictionary<string, object>() {
                    { "id", "mock" },
                    { "timestamp", stopwatch.ElapsedMilliseconds },
                    { "data", "mock data" },
                };
                Assert(isEqual(getValue(mockResult, "id"), "mock"));
            }
            stopwatch.Stop();
            object totalTime = stopwatch.ElapsedMilliseconds;
            return totalTime;
        }
        async public Task testThrottlerPerformance()
        {
            var exchange1 = new ccxt.binance(new Dictionary<string, object>() {
                { "enableRateLimit", true },
                { "rateLimiterAlgorithm", "rollingWindow" }
            });
            object rollingWindowTime = await testThrottlerPerformanceHelper(exchange1, 100);
            var exchange2 = new ccxt.binance(new Dictionary<string, object>() {
                { "enableRateLimit", true },
                { "rateLimiterAlgorithm", "leakyBucket" }
            });
            object leakyBucketTime = await testThrottlerPerformanceHelper(exchange2, 20);
            var exchange3 = new ccxt.binance(new Dictionary<string, object>() {
                { "enableRateLimit", true },
                { "rollingWindowSize", 0 },
            });
            object rollingWindow0Time = await testThrottlerPerformanceHelper(exchange3, 20);
            object rollingWindowTimeString = ((object)rollingWindowTime).ToString();
            object leakyBucketTimeString = ((object)leakyBucketTime).ToString();
            object rollingWindow0TimeString = ((object)rollingWindow0Time).ToString();
            Assert(isLessThanOrEqual(rollingWindowTime, 1000), add("Rolling window throttler happen immediately, time was: ", rollingWindowTimeString));
            Assert(isGreaterThanOrEqual(leakyBucketTime, 500), add("Leaky bucket throttler should take at least half a second for 20 requests, time was: ", leakyBucketTimeString));
            Assert(isGreaterThanOrEqual(rollingWindow0Time, 500), add("With rollingWindowSize === 0, the Leaky bucket throttler should be used and take at least half a second for 20 requests, time was: ", rollingWindow0TimeString));
            Console.WriteLine("┌───────────────────────────────────────────────────┬──────────────┬─────────────────┐");
            Console.WriteLine("│ Algorithm                                         │ Time (ms)    │ Expected (ms)   │");
            Console.WriteLine("├───────────────────────────────────────────────────┼──────────────┼─────────────────┤");
            Console.WriteLine(add(add("│ Rolling Window                                    │ ", ((string)rollingWindowTimeString).PadLeft(11)), "  │ 0-1             │"));
            Console.WriteLine(add(add("│ Leaky Bucket                                      │ ", ((string)leakyBucketTimeString).PadLeft(11)), "  │ ~950            │"));
            Console.WriteLine(add(add("│ Leaky Bucket (rollingWindowSize === 0)            │ ", ((string)rollingWindow0TimeString).PadLeft(11)), "  │ ~950            │"));
            Console.WriteLine("└───────────────────────────────────────────────────┴──────────────┴─────────────────┘");
        }
}