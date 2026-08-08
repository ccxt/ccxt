package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * loadMarkets() must collapse concurrent callers onto a single in-flight
 * helper invocation regardless of the reload flag. Without this, 20 threads
 * calling loadMarkets(true) at the same time fire 20 sequential HTTP fetches.
 *
 * The previous guard `if (!this.reloadingMarkets || reload)` short-circuits
 * the in-flight check when reload=true, so every concurrent caller spawns a
 * fresh fetch and overwrites this.marketsLoading.
 */
class LoadMarketsConcurrencyTest {

    /** Counts how many times loadMarketsHelper is invoked, lets us hold its result open. */
    private static class CountingExchange extends Exchange {
        final AtomicInteger fetchCount = new AtomicInteger(0);
        final CompletableFuture<Object> gate = new CompletableFuture<>();

        @Override
        public CompletableFuture<Object> loadMarketsHelper(boolean reload) {
            fetchCount.incrementAndGet();
            // Return a future that doesn't complete until we let it. This way
            // every concurrent loadMarkets() call observes reloadingMarkets=true
            // while the in-flight fetch is still running.
            return gate.thenApply(v -> {
                this.markets = new java.util.HashMap<String, Object>();
                return this.markets;
            });
        }
    }

    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void concurrentReloadCallsCollapseToSingleFetch() throws Exception {
        CountingExchange ex = new CountingExchange();
        int threads = 20;
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch finished = new CountDownLatch(threads);
        java.util.List<CompletableFuture<Object>> futures = new java.util.ArrayList<>();

        for (int i = 0; i < threads; i++) {
            Thread.ofVirtual().start(() -> {
                try {
                    start.await();
                    futures.add(ex.loadMarkets(true));
                } catch (InterruptedException ignored) {
                } finally {
                    finished.countDown();
                }
            });
        }

        // Release all threads at once so they race into the synchronized block.
        start.countDown();
        assertTrue(finished.await(5, TimeUnit.SECONDS), "threads didn't all start");

        assertEquals(1, ex.fetchCount.get(),
                "concurrent loadMarkets(true) must collapse to a single helper invocation; "
                        + "observed " + ex.fetchCount.get() + " fetches");

        // Sanity: let the gate complete and confirm every caller got the result.
        ex.gate.complete(null);
        for (CompletableFuture<Object> f : futures) {
            assertNotNull(f.get(2, TimeUnit.SECONDS),
                    "every collapsed caller must resolve with the shared markets");
        }
    }
}
