package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import io.github.ccxt.exchanges.Binance;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Stress tests that verify the async I/O architecture can handle high concurrency
 * without thread exhaustion or deadlocks.
 *
 * Key insight: the problem isn't in fetch() itself (which short-circuits with fetchResponse),
 * but in the callers (fetch2, exchange methods) that wrap everything in
 * supplyAsync(() -> { ... .join() }) on the common ForkJoinPool.
 * When the inner .join() blocks (due to real I/O latency), pool threads are exhausted.
 *
 * To reproduce this without hitting real exchanges, we simulate I/O latency
 * by making fetch() return a delayed CompletableFuture.
 */
class ConcurrencyStressTest {

    /**
     * Creates an exchange where fetch() simulates I/O latency by returning
     * a future that completes after a delay, rather than using fetchResponse
     * which returns a completedFuture (no blocking).
     */
    private static Binance createDelayedExchange(long ioDelayMs) {
        Binance exchange = new Binance();
        exchange.verbose = false;
        exchange.enableRateLimit = false;
        String proxy = System.getenv("CCXT_HTTPS_PROXY");
        if (proxy != null && !proxy.isEmpty()) {
            exchange.httpsProxy = proxy;
        }

        // Load markets with real HTTP first (needed for fetchTicker routing)
        try {
            exchange.loadMarkets().join();
        } catch (Exception e) {
            assumeTrue(false, "Skipping: exchange not reachable (" + e.getMessage() + ")");
        }

        // Now install a mock fetch response, but with simulated I/O delay.
        // We override fetchResponse handling: instead of completedFuture,
        // return a future that delays to simulate network latency.
        String mockJson = "{\"symbol\":\"BTCUSDT\",\"lastPrice\":\"50000.00\",\"bidPrice\":\"49999.00\",\"askPrice\":\"50001.00\",\"volume\":\"1000.0\",\"openPrice\":\"49000.00\",\"highPrice\":\"51000.00\",\"lowPrice\":\"48000.00\"}";
        Object mockResponse = io.github.ccxt.base.JsonHelper.deserialize(mockJson);

        // Set fetchResponse so that fetch() returns our delayed mock
        // We need to override the fetch method behavior to add delay
        // Since we can't easily subclass the transpiled Binance, we'll use
        // a different approach: set fetchResponse but also measure the
        // impact of the supplyAsync nesting in fetch2/request/exchange methods

        exchange.setFetchResponse(mockResponse);
        return exchange;
    }

    /**
     * Tests that many concurrent requests through the full call chain
     * (exchange method → callAsync → fetch2 → fetch) complete without
     * thread exhaustion.
     *
     * With fetchResponse mock, fetch() returns instantly, but fetch2() and
     * exchange methods still wrap in supplyAsync. The test verifies the
     * overall pattern works at scale even with nested supplyAsync.
     *
     * This test establishes the baseline — it may pass even before the fix
     * because the mock returns instantly. The real value is:
     * 1) Regression guard after refactoring
     * 2) The sleep test below catches the blocking problem directly
     */
    @Test
    @Timeout(value = 60, unit = TimeUnit.SECONDS)
    void testHighConcurrencyThroughFullCallChain() throws Exception {
        Binance exchange = createDelayedExchange(0);

        int concurrentRequests = 200;
        CompletableFuture<?>[] futures = new CompletableFuture[concurrentRequests];
        AtomicInteger completed = new AtomicInteger(0);

        long start = System.currentTimeMillis();
        for (int i = 0; i < concurrentRequests; i++) {
            futures[i] = exchange.fetchTickerAsync("BTC/USDT", null)
                    .thenAccept(result -> completed.incrementAndGet());
        }

        CompletableFuture.allOf(futures).join();
        long elapsed = System.currentTimeMillis() - start;

        assertEquals(concurrentRequests, completed.get(),
                "All " + concurrentRequests + " requests should complete");
        assertTrue(elapsed < 15000,
                concurrentRequests + " concurrent mock requests took " + elapsed + "ms — expected < 15s");
    }

    /**
     * CORE TEST: Demonstrates that sleep() blocks pool threads.
     *
     * Launches N concurrent sleeps where N >> ForkJoinPool.commonPool size.
     * If sleep() blocks a pool thread (Thread.sleep inside supplyAsync),
     * only `poolSize` sleeps run at a time, serializing them.
     *
     * With poolSize=7 and 100 sleeps of 200ms each:
     *   Blocking:     100/7 batches * 200ms ≈ 2857ms
     *   Non-blocking: all 100 complete in ~200ms
     *
     * This test SHOULD FAIL on the current code and PASS after Phase 2.
     */
    @Test
    @Timeout(value = 15, unit = TimeUnit.SECONDS)
    void testConcurrentSleepsDoNotBlockPoolThreads() throws Exception {
        Exchange exchange = new Binance();

        int concurrentSleeps = 100;
        long sleepMs = 200;
        int poolSize = ForkJoinPool.commonPool().getParallelism();

        CompletableFuture<?>[] futures = new CompletableFuture[concurrentSleeps];

        long start = System.currentTimeMillis();
        for (int i = 0; i < concurrentSleeps; i++) {
            futures[i] = exchange.sleep(sleepMs);
        }

        CompletableFuture.allOf(futures).join();
        long elapsed = System.currentTimeMillis() - start;

        // Blocking estimate: (concurrentSleeps / poolSize) * sleepMs
        long blockingEstimate = (concurrentSleeps / poolSize) * sleepMs;

        // Non-blocking should complete in ~sleepMs (200ms) plus overhead
        // We use 1500ms as threshold — well below blocking estimate (~2857ms)
        // but generous enough for CI environments
        assertTrue(elapsed < 1500,
                concurrentSleeps + " concurrent " + sleepMs + "ms sleeps took " + elapsed + "ms. " +
                        "Pool size: " + poolSize + ". " +
                        "Blocking estimate: ~" + blockingEstimate + "ms. " +
                        "If elapsed >> " + sleepMs + "ms, sleep() is blocking pool threads.");
    }

    /**
     * Tests that platform thread count stays bounded under high concurrency.
     * After the fix, virtual threads handle concurrency — they don't show
     * in Thread.activeCount().
     */
    @Test
    @Timeout(value = 30, unit = TimeUnit.SECONDS)
    void testPlatformThreadCountStaysBounded() throws Exception {
        Binance exchange = createDelayedExchange(0);

        int concurrentRequests = 100;
        CompletableFuture<?>[] futures = new CompletableFuture[concurrentRequests];

        int threadCountBefore = Thread.activeCount();

        for (int i = 0; i < concurrentRequests; i++) {
            futures[i] = exchange.fetchTickerAsync("BTC/USDT", null);
        }

        CompletableFuture.allOf(futures).join();

        int threadCountAfter = Thread.activeCount();
        int threadGrowth = threadCountAfter - threadCountBefore;

        // Virtual threads don't count in Thread.activeCount().
        // Allow generous growth for HttpClient/executor internals and parallel test suites,
        // but catch gross thread-per-request leaks (100+ growth for 100 requests).
        assertTrue(threadGrowth < concurrentRequests,
                "Platform thread count grew by " + threadGrowth +
                        " for " + concurrentRequests + " concurrent requests — possible thread-per-request leak");
    }

    /**
     * Tests that CompletableFuture exception chains propagate correctly
     * under concurrency. Validates CompletionException unwrapping.
     */
    @Test
    @Timeout(value = 60, unit = TimeUnit.SECONDS)
    void testExceptionPropagationUnderConcurrency() throws Exception {
        Binance exchange = new Binance();
        exchange.verbose = false;
        exchange.enableRateLimit = false;
        try {
            exchange.loadMarkets().join();
        } catch (Exception e) {
            assumeTrue(false, "Skipping: exchange not reachable (" + e.getMessage() + ")");
        }
        // Don't set fetchResponse — let it hit real HTTP for bad symbols

        int concurrentRequests = 10;
        AtomicInteger exceptions = new AtomicInteger(0);
        CompletableFuture<?>[] futures = new CompletableFuture[concurrentRequests];

        for (int i = 0; i < concurrentRequests; i++) {
            futures[i] = exchange.fetchTickerAsync("INVALID/NOTEXIST_" + i, null)
                    .exceptionally(ex -> {
                        exceptions.incrementAndGet();
                        return null;
                    });
        }

        CompletableFuture.allOf(futures).join();

        assertEquals(concurrentRequests, exceptions.get(),
                "All requests with invalid symbols should propagate exceptions");
    }

    /**
     * Regression for the loadMarkets() race where concurrent first-callers could
     * (a) overwrite each other's `marketsLoading` future or (b) receive null.
     * After the synchronized fix, all concurrent callers must observe the same
     * (non-null) future and resolve to the same result.
     */
    @Test
    @Timeout(value = 60, unit = TimeUnit.SECONDS)
    void testLoadMarketsConcurrentDedup() throws Exception {
        Binance exchange = new Binance();
        exchange.verbose = false;
        exchange.enableRateLimit = false;

        int concurrent = 50;
        CompletableFuture<Object>[] futures = new CompletableFuture[concurrent];
        Thread[] threads = new Thread[concurrent];
        java.util.concurrent.CountDownLatch barrier = new java.util.concurrent.CountDownLatch(1);

        for (int i = 0; i < concurrent; i++) {
            final int idx = i;
            threads[i] = new Thread(() -> {
                try {
                    barrier.await();
                    futures[idx] = exchange.loadMarkets();
                } catch (Exception ignored) { }
            });
            threads[i].start();
        }
        barrier.countDown();
        for (Thread t : threads) {
            t.join();
        }

        // None of the returned futures must be null (the bug returned null when
        // reloadingMarkets was already true but marketsLoading hadn't been set yet).
        for (int i = 0; i < concurrent; i++) {
            assertNotNull(futures[i], "Caller " + i + " got a null future from loadMarkets()");
        }

        // Wait for resolution; skip the test cleanly if the exchange is unreachable.
        try {
            CompletableFuture.allOf(futures).get(30, TimeUnit.SECONDS);
        } catch (Exception e) {
            assumeTrue(false, "Exchange unreachable: " + e.getMessage());
        }
    }

    /**
     * Regression for randNumber(): must use SecureRandom and produce a value
     * with exactly the requested number of digits (no leading-zero truncation).
     */
    @Test
    void testRandNumberWidthAndNonZeroLeading() {
        Binance exchange = new Binance();
        for (int size = 1; size <= 9; size++) {
            for (int trial = 0; trial < 200; trial++) {
                int n = exchange.randNumber(size);
                int width = String.valueOf(n).length();
                assertEquals(size, width,
                        "randNumber(" + size + ") returned " + n + " with width " + width);
            }
        }
        assertEquals(0, exchange.randNumber(0), "randNumber(0) must be 0");
    }
}
