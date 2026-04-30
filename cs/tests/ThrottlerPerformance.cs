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

            // --- syncUsedWeight tests ---
            Console.WriteLine("--- syncUsedWeight tests ---");
            var exchange4 = new ccxt.binance(new Dictionary<string, object>() {
                { "enableRateLimit", true },
                { "rateLimiterAlgorithm", "rollingWindow" }
            });
            var throttler = exchange4.throttler;
            var nowMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            // Test 1: Under-tracked
            throttler.timestamps = new List<(long, double)> { (nowMs - 10000, 50), (nowMs - 5000, 30), (nowMs - 1000, 20) };
            throttler.syncUsedWeight(150);
            var total = throttler.timestamps.Sum(t => t.cost);
            Assert(Math.Abs(total - 150) < 1, "under-tracked correction failed, got " + total);
            Console.WriteLine("  1. under-tracked correction: passed");

            // Test 2: Over-tracked
            throttler.timestamps = new List<(long, double)> { (nowMs - 10000, 50), (nowMs - 5000, 30), (nowMs - 1000, 20) };
            throttler.syncUsedWeight(60);
            total = throttler.timestamps.Sum(t => t.cost);
            Assert(Math.Abs(total - 60) < 1, "over-tracked correction failed, got " + total);
            Console.WriteLine("  2. over-tracked correction: passed");

            // Test 3: Zero reset
            throttler.timestamps = new List<(long, double)> { (nowMs - 1000, 50) };
            throttler.syncUsedWeight(0);
            total = throttler.timestamps.Sum(t => t.cost);
            Assert(total == 0, "zero reset failed, got " + total);
            Console.WriteLine("  3. zero reset: passed");

            // Test 4: Within tolerance
            throttler.timestamps = new List<(long, double)> { (nowMs - 1000, 50) };
            var lengthBefore = throttler.timestamps.Count;
            throttler.syncUsedWeight(50);
            Assert(throttler.timestamps.Count == lengthBefore, "tolerance no-op failed");
            Console.WriteLine("  4. within tolerance (no-op): passed");

            // Test 5: Leaky bucket no-op
            var exchange5 = new ccxt.binance(new Dictionary<string, object>() {
                { "enableRateLimit", true },
                { "rateLimiterAlgorithm", "leakyBucket" }
            });
            exchange5.throttler.timestamps = new List<(long, double)> { (nowMs, 100) };
            exchange5.throttler.syncUsedWeight(200);
            Assert(exchange5.throttler.timestamps[0].cost == 100, "leaky bucket should not modify");
            Console.WriteLine("  5. leaky bucket no-op: passed");

            // Test 6: Expired entries pruned
            throttler.timestamps = new List<(long, double)> { (nowMs - 120000, 999), (nowMs - 1000, 20) };
            throttler.syncUsedWeight(20);
            total = throttler.timestamps.Sum(t => t.cost);
            Assert(Math.Abs(total - 20) < 1, "expired entry pruning failed");
            Console.WriteLine("  6. expired entry pruning: passed");

            // Test 7: Rate limit hit
            throttler.timestamps = new List<(long, double)> { (nowMs - 1000, 100) };
            throttler.syncUsedWeight(1200);
            total = throttler.timestamps.Sum(t => t.cost);
            Assert(Math.Abs(total - 1200) < 1, "rate limit hit failed, got " + total);
            Console.WriteLine("  7. rate limit hit (maxWeight): passed");

            // Test 8: Custom windowSize
            throttler.timestamps = new List<(long, double)> { (nowMs - 5000, 50) };
            throttler.syncUsedWeight(10, 1000);
            total = throttler.timestamps.Sum(t => t.cost);
            Assert(Math.Abs(total - 10) < 1, "custom windowSize failed");
            Console.WriteLine("  8. custom windowSize: passed");

            Console.WriteLine("--- all syncUsedWeight tests passed ---");
        }
}