package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Regressions for the torn compound check-then-act in the WsClient futures
 * settle path.
 *
 * WsClient is genuinely multi-threaded: the message pump runs on a virtual
 * single-thread executor, the ping loop on its own virtual thread, and watch()
 * callers arrive on whatever thread invoked them. future(), resolve() and
 * reject() each perform a compound check-then-act across the futures /
 * rejections maps, so per-map ConcurrentHashMap atomicity is not sufficient —
 * the pair must be mutated under one monitor.
 *
 * These tests never connect, so they need no network access.
 */
class WsClientFuturesLockTest {

    private static final String HASH = "authenticate:spot";

    private static WsClient newClient() {
        return new WsClient(
                "wss://10.255.255.1/ws",   // blackhole, never dialed by these tests
                null,
                /* handleMessage */ (c, m) -> {},
                /* ping */ c -> null,
                /* onClose */ (c, r) -> {},
                /* onError */ (c, e) -> {},
                /* verbose */ false,
                /* keepAlive */ 30_000L,
                /* decompressBinary */ false,
                /* validateServerSsl */ true);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> futuresOf(WsClient client) {
        return (Map<String, Object>) client.futures;
    }

    /**
     * Single-flight parity: concurrent callers for one hash must join ONE
     * flight (the same Future instance), and one resolve must settle all of
     * them. This is what makes the `client.futures`-registered authenticate()
     * of #29992-#30000 collapse N concurrent logins into one.
     */
    @Test
    @Timeout(value = 60, unit = TimeUnit.SECONDS)
    void testConcurrentFutureCallsJoinOneFlight() throws Exception {
        WsClient client = newClient();
        int threads = 64;

        Set<Future> distinct = Collections.newSetFromMap(new IdentityHashMap<>());
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch registered = new CountDownLatch(threads);

        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < threads; i++) {
                pool.execute(() -> {
                    try {
                        start.await();
                        Future f = client.future(HASH);
                        synchronized (distinct) {
                            distinct.add(f);
                        }
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    } finally {
                        registered.countDown();
                    }
                });
            }
            start.countDown();
            assertTrue(registered.await(30, TimeUnit.SECONDS), "registration did not finish");
        }

        assertEquals(1, distinct.size(),
                "concurrent future() calls for one hash must share a single flight, got "
                        + distinct.size() + " distinct futures");

        client.resolve("token", HASH);
        for (Future f : distinct) {
            assertEquals("token", f.getFuture().get(5, TimeUnit.SECONDS));
        }
        client.close();
    }

    /**
     * A rejection queued with no waiter is retained in rejections and must
     * fail the next future() fast; a later resolve clears the retained error
     * so a recovered stream does not poison the next consumer
     * (ts Client.ts:177,199; cs Client.cs:149,172).
     */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void testRetainedRejectionFailsNextConsumerAndResolveClearsIt() throws Exception {
        WsClient client = newClient();

        client.reject(new RuntimeException("boom"), HASH);   // retained, no waiter
        Future afterError = client.future(HASH);
        assertTrue(afterError.getFuture().isCompletedExceptionally(),
                "a post-error consumer must observe the retained rejection");
        assertThrows(ExecutionException.class, () -> afterError.getFuture().get(1, TimeUnit.SECONDS));

        // the stream recovered: the retained error is gone, so the next
        // consumer registers a fresh pending future instead of failing
        client.resolve("fresh", HASH);
        Future afterRecovery = client.future(HASH);
        assertFalse(afterRecovery.isDone(),
                "a resolve after a retained rejection must clear it so the next consumer waits");
        assertTrue(futuresOf(client).containsKey(HASH),
                "the recovered consumer's future must be registered in the map");

        client.close();
    }

    /**
     * reject-all and close() must settle registered futures: a registered
     * future must end up rejected, never left pending in a map nobody will
     * walk again.
     */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void testRejectAllAndCloseSettleRegisteredFutures() throws Exception {
        WsClient a = newClient();
        Future pendingA = a.future(HASH);
        a.reject(new RuntimeException("socket died"));
        assertTrue(pendingA.getFuture().isCompletedExceptionally(),
                "reject-all must reject registered futures");
        assertFalse(futuresOf(a).containsKey(HASH), "reject-all must drain the futures map");
        a.close();

        WsClient b = newClient();
        Future pendingB = b.future(HASH);
        b.close();
        assertTrue(pendingB.getFuture().isCompletedExceptionally(),
                "close() must reject registered futures with ExchangeClosedByUser");
        assertFalse(futuresOf(b).containsKey(HASH), "close() must drain the futures map");
    }

    /**
     * reject() racing future() must not strand a consumer either: every
     * consumer must end up either rejected (error delivered) or holding a
     * registered future the later close() will settle — never blocked on a
     * future that no map still references.
     */
    @Test
    @Timeout(value = 120, unit = TimeUnit.SECONDS)
    void testFutureRacingRejectNeverStrandsAConsumer() throws Exception {
        WsClient client = newClient();
        int rounds = 2000;

        AtomicInteger stranded = new AtomicInteger(0);
        AtomicInteger rejected = new AtomicInteger(0);
        AtomicInteger pendingButRegistered = new AtomicInteger(0);

        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(rounds * 2);

        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < rounds; i++) {
                final String hash = "r-" + i;
                pool.execute(() -> {
                    try {
                        start.await();
                        Future f = client.future(hash);
                        try {
                            f.getFuture().get(2, TimeUnit.SECONDS);
                        } catch (ExecutionException ee) {
                            rejected.incrementAndGet();
                            return;
                        } catch (TimeoutException te) {
                            // legal only if the error landed before this consumer
                            // registered: the future must still be in the map so a
                            // later reject/close can settle it
                            if (futuresOf(client).containsKey(hash)) {
                                pendingButRegistered.incrementAndGet();
                            } else {
                                stranded.incrementAndGet();
                            }
                            return;
                        }
                        stranded.incrementAndGet();   // resolved out of nowhere
                    } catch (Exception e) {
                        stranded.incrementAndGet();
                    } finally {
                        done.countDown();
                    }
                });
                pool.execute(() -> {
                    try {
                        start.await();
                        client.reject(new RuntimeException("nope-" + hash), hash);
                    } catch (Exception ignored) {
                        // counted by the consumer side
                    } finally {
                        done.countDown();
                    }
                });
            }
            start.countDown();
            assertTrue(done.await(90, TimeUnit.SECONDS), "race harness did not finish in time");
        }

        assertEquals(0, stranded.get(),
                "consumers left holding a future no map references: " + stranded.get() + "/" + rounds);
        assertEquals(rounds, rejected.get() + pendingButRegistered.get());
        client.close();
    }
}
