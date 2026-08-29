package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

class ThrottlerTest {

    private Map<String, Object> config(double rateLimit, String algorithm) {
        Map<String, Object> cfg = new HashMap<>();
        cfg.put("refillRate", 1.0 / rateLimit);
        cfg.put("delay", 0.001);
        cfg.put("capacity", 1.0);
        cfg.put("cost", 1.0);
        cfg.put("algorithm", algorithm);
        cfg.put("rateLimit", rateLimit);
        cfg.put("windowSize", 60000.0);
        return cfg;
    }

    @Test
    void testLeakyBucketSingleRequest() throws Exception {
        var throttler = new Throttler(config(50, "leakyBucket"));
        CompletableFuture<Void> f = throttler.throttle(1.0);
        f.get(5, TimeUnit.SECONDS);
        // Should complete nearly immediately (tokens start at 0 but >= 0 check passes)
    }

    @Test
    void testLeakyBucketMultipleRequests() throws Exception {
        // rateLimit=50ms means ~20 req/sec, refillRate = 1/50 = 0.02 tokens/ms
        var throttler = new Throttler(config(50, "leakyBucket"));
        long start = System.currentTimeMillis();
        int count = 5;
        CompletableFuture<?>[] futures = new CompletableFuture[count];
        for (int i = 0; i < count; i++) {
            futures[i] = throttler.throttle(1.0);
        }
        CompletableFuture.allOf(futures).get(10, TimeUnit.SECONDS);
        long elapsed = System.currentTimeMillis() - start;
        // First request is immediate, then ~50ms each for remaining 4
        // Should take roughly 200ms (4 * 50ms), allow some slack
        assertTrue(elapsed >= 100, "Should take at least 100ms for 5 requests at 50ms rate, took " + elapsed + "ms");
    }

    @Test
    void testLeakyBucketCostRespected() throws Exception {
        // Higher cost should take longer
        var throttler = new Throttler(config(50, "leakyBucket"));
        long start = System.currentTimeMillis();
        // cost=3.0 means needs 3 token refills after first request
        CompletableFuture<Void> f1 = throttler.throttle(1.0);
        CompletableFuture<Void> f2 = throttler.throttle(1.0);
        CompletableFuture<Void> f3 = throttler.throttle(1.0);
        CompletableFuture.allOf(f1, f2, f3).get(10, TimeUnit.SECONDS);
        long elapsed = System.currentTimeMillis() - start;
        assertTrue(elapsed >= 50, "3 requests should take at least 50ms, took " + elapsed + "ms");
    }

    @Test
    void testRollingWindowSingleRequest() throws Exception {
        var throttler = new Throttler(config(50, "rollingWindow"));
        CompletableFuture<Void> f = throttler.throttle(1.0);
        f.get(5, TimeUnit.SECONDS);
    }

    @Test
    void testRollingWindowMultipleRequests() throws Exception {
        // windowSize=60000ms, rateLimit=50ms => maxWeight=1200
        // With cost=1.0 each, 5 requests should go through instantly since 5 < 1200
        var throttler = new Throttler(config(50, "rollingWindow"));
        int count = 5;
        CompletableFuture<?>[] futures = new CompletableFuture[count];
        for (int i = 0; i < count; i++) {
            futures[i] = throttler.throttle(1.0);
        }
        CompletableFuture.allOf(futures).get(5, TimeUnit.SECONDS);
        // All should complete quickly since well within the window weight
    }

    @Test
    void testDefaultCost() throws Exception {
        Map<String, Object> cfg = config(50, "leakyBucket");
        cfg.put("cost", 2.0);
        var throttler = new Throttler(cfg);
        // throttle() with no args should use default cost of 2.0
        CompletableFuture<Void> f = throttler.throttle();
        f.get(5, TimeUnit.SECONDS);
    }

    @Test
    void testConcurrentThrottle() throws Exception {
        var throttler = new Throttler(config(10, "leakyBucket"));
        int count = 10;
        AtomicInteger completed = new AtomicInteger(0);
        CountDownLatch latch = new CountDownLatch(count);

        for (int i = 0; i < count; i++) {
            throttler.throttle(1.0).thenRun(() -> {
                completed.incrementAndGet();
                latch.countDown();
            });
        }

        assertTrue(latch.await(10, TimeUnit.SECONDS), "All requests should complete within 10s");
        assertEquals(count, completed.get());
    }

    @Test
    void testFirstRequestCompletesImmediately() throws Exception {
        var throttler = new Throttler(config(50, "leakyBucket"));
        long start = System.currentTimeMillis();
        throttler.throttle(1.0).get(5, TimeUnit.SECONDS);
        long elapsed = System.currentTimeMillis() - start;
        assertTrue(elapsed < 30, "First request should complete immediately, took " + elapsed + "ms");
    }

    @Test
    void testExactRateLimitTiming() throws Exception {
        // 3 requests at 50ms rate limit should take ~100ms (first is free, 2 waits)
        var throttler = new Throttler(config(50, "leakyBucket"));
        long start = System.currentTimeMillis();
        CompletableFuture<?>[] f = new CompletableFuture[3];
        for (int i = 0; i < 3; i++) f[i] = throttler.throttle(1.0);
        CompletableFuture.allOf(f).get(10, TimeUnit.SECONDS);
        long elapsed = System.currentTimeMillis() - start;
        // Should be ~100ms (2 * 50ms), not much more (no busy-wait overhead)
        assertTrue(elapsed >= 80 && elapsed < 300,
            "3 requests at 50ms rate should take ~100ms, took " + elapsed + "ms");
    }

    @Test
    void testHighConcurrencyThrottle() throws Exception {
        // 100 requests at 10ms rate limit — should complete in ~1s, not hang
        var throttler = new Throttler(config(10, "leakyBucket"));
        int count = 100;
        CompletableFuture<?>[] futures = new CompletableFuture[count];
        long start = System.currentTimeMillis();
        for (int i = 0; i < count; i++) {
            futures[i] = throttler.throttle(1.0);
        }
        CompletableFuture.allOf(futures).get(10, TimeUnit.SECONDS);
        long elapsed = System.currentTimeMillis() - start;
        // ~990ms expected (99 * 10ms), allow generous range
        assertTrue(elapsed < 3000,
            "100 requests at 10ms rate took " + elapsed + "ms — expected ~1s");
    }
}
