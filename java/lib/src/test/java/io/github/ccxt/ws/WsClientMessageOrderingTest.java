package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Verifies that {@link WsClient#onMessage(Object)} dispatches handler
 * invocations through a per-client single-thread executor, matching the
 * C# port's {@code Receiving} loop and the JS event-loop semantics.
 *
 * Without serialization, a burst of frames (50+/sec on Binance) spawns one
 * virtual thread per frame and N concurrent {@code handleMessage} calls
 * race on shared exchange state — the underlying cause of subtle
 * order-book / balance corruption and the {@code options}
 * ConcurrentModificationException.
 */
class WsClientMessageOrderingTest {

    private static WsClient newClient(java.util.function.BiConsumer<WsClient, Object> handler) {
        return new WsClient(
                "wss://example.invalid/ws",
                null,
                handler,
                /* ping */ c -> null,
                /* onClose */ (c, r) -> {},
                /* onError */ (c, e) -> {},
                /* verbose */ false,
                /* keepAlive */ 30_000L,
                /* decompressBinary */ false,
                /* validateServerSsl */ true);
    }

    /**
     * Fire 200 frames back-to-back. Assert the handler observed them in
     * arrival order — i.e. each invocation sees a strictly increasing frame
     * id, regardless of how slow individual handler runs are.
     *
     * Without single-thread executor: handlers run on the common ForkJoinPool
     * and finish in non-deterministic order; the recorded sequence is
     * shuffled and the test fails.
     */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void messagesProcessedInArrivalOrder() throws Exception {
        int n = 200;
        List<Integer> processed = new ArrayList<>();
        CountDownLatch done = new CountDownLatch(n);

        WsClient client = newClient((c, msg) -> {
            int id = (Integer) msg;
            // Simulate a slow handler so a parallel executor would
            // demonstrably reorder; serialized executor keeps order.
            try { Thread.sleep(1); } catch (InterruptedException ignored) {}
            synchronized (processed) {
                processed.add(id);
            }
            done.countDown();
        });

        try {
            for (int i = 0; i < n; i++) {
                client.onMessage(i);
            }
            assertTrue(done.await(8, TimeUnit.SECONDS), "all frames must complete");

            assertEquals(n, processed.size());
            for (int i = 0; i < n; i++) {
                assertEquals(i, processed.get(i),
                        "frame " + i + " arrived out of order — message executor is not serialized");
            }
        } finally {
            client.close();
        }
    }

    /**
     * Stronger guarantee: at any moment, at most ONE handler is running.
     * This catches the race directly — even if the recorded order happens
     * to be sorted, two handlers running in parallel would corrupt
     * non-thread-safe shared state (sub-maps inside this.balance,
     * this.orderbooks, etc.).
     */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void atMostOneHandlerRunsAtATime() throws Exception {
        int n = 100;
        AtomicInteger inFlight = new AtomicInteger(0);
        AtomicInteger maxConcurrent = new AtomicInteger(0);
        CountDownLatch done = new CountDownLatch(n);

        WsClient client = newClient((c, msg) -> {
            int now = inFlight.incrementAndGet();
            maxConcurrent.accumulateAndGet(now, Math::max);
            try { Thread.sleep(2); } catch (InterruptedException ignored) {}
            inFlight.decrementAndGet();
            done.countDown();
        });

        try {
            for (int i = 0; i < n; i++) {
                client.onMessage(i);
            }
            assertTrue(done.await(8, TimeUnit.SECONDS), "all frames must complete");

            assertEquals(1, maxConcurrent.get(),
                    "WsClient.onMessage should run handlers serially per client; "
                            + "observed up to " + maxConcurrent.get() + " concurrent invocations.");
        } finally {
            client.close();
        }
    }
}
