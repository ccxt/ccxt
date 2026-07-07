package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.exchanges.Binance;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Repros the {@link java.util.ConcurrentModificationException} surfaced by
 * the user when calling {@code watchTrades} concurrently with other threads
 * mutating shared exchange state.
 *
 * The WS path (e.g. {@code Binance.watchTrades}) triggers
 * {@code loadMarkets}/{@code handleOptionAndParams}, which
 * read/iterate {@code this.options} and mutate
 * {@code this.options.put("cachedCurrencies", …) / remove(…)} from the
 * same flow. With a plain {@link HashMap}, two threads doing concurrent
 * watchTrades + ticker work race on those mutations and one of the
 * iterators throws CME.
 *
 * Tests below exercise that race on the exact fields the WS code paths
 * touch. They should fail fast on plain HashMap and pass once the field is
 * a {@link ConcurrentHashMap} (or otherwise made thread-safe).
 */
class SharedStateRaceTest {

    /**
     * Producer/consumer iterating + mutating {@code exchange.options}
     * concurrently — the same access pattern loadMarkets has when called
     * from competing watchTrades CompletableFutures.
     */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void optionsMustToleratePutAndIterateRace() throws Exception {
        Binance exchange = new Binance();
        // Seed with realistic-looking options entries.
        for (int i = 0; i < 64; i++) {
            exchange.options.put("seed-" + i, i);
        }

        AtomicReference<Throwable> failure = new AtomicReference<>();
        CountDownLatch start = new CountDownLatch(1);
        int writers = 4;
        int readers = 4;
        int iterations = 5_000;

        Thread[] threads = new Thread[writers + readers];
        for (int t = 0; t < writers; t++) {
            final int id = t;
            threads[t] = new Thread(() -> {
                try {
                    start.await();
                    for (int i = 0; i < iterations && failure.get() == null; i++) {
                        // Mirrors loadMarketsHelper: put then remove.
                        exchange.options.put("cachedCurrencies-" + id, i);
                        exchange.options.remove("cachedCurrencies-" + id);
                    }
                } catch (Throwable e) {
                    failure.compareAndSet(null, e);
                }
            }, "writer-" + t);
        }
        for (int t = 0; t < readers; t++) {
            threads[writers + t] = new Thread(() -> {
                try {
                    start.await();
                    for (int i = 0; i < iterations && failure.get() == null; i++) {
                        // Mirrors handleOptionAndParams iterating to read by key.
                        for (Map.Entry<String, Object> e : exchange.options.entrySet()) {
                            // Touch the entry so the JIT doesn't elide it.
                            if (e.getKey() == null) {
                                fail("null key");
                            }
                        }
                    }
                } catch (Throwable e) {
                    failure.compareAndSet(null, e);
                }
            }, "reader-" + t);
        }

        for (Thread th : threads) th.start();
        start.countDown();
        for (Thread th : threads) th.join();

        Throwable t = failure.get();
        if (t != null) {
            throw new AssertionError(
                    "Concurrent put/iterate on exchange.options threw "
                            + t.getClass().getName() + ": " + t.getMessage()
                            + "\n→ exchange.options field must be thread-safe (ConcurrentHashMap or synchronized wrapper).",
                    t);
        }
    }

    /**
     * Sanity check: ensure the field is actually a thread-safe map type.
     * If someone replaces it with a fresh {@code new HashMap<>()} in
     * {@code initializeProperties}, this test catches it before the
     * stress test below has to provoke the race.
     */
    @Test
    void optionsFieldMustBeThreadSafeMap() {
        Binance exchange = new Binance();
        Map<String, Object> options = exchange.options;
        assertNotNull(options, "options must not be null after construction");
        assertTrue(
                options instanceof ConcurrentHashMap
                        || options.getClass().getName().contains("Synchronized"),
                "exchange.options should be a ConcurrentHashMap (or synchronized wrapper); was "
                        + options.getClass().getName()
                        + ". WS code paths (watchTrades → loadMarkets/handleOptionAndParams) "
                        + "iterate and mutate this map from multiple threads."
        );
    }
}
