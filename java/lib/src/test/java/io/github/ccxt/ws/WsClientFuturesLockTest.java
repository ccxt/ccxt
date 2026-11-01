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
 * WsClient futures/rejections lock: concurrent future() must join one flight,
 * reject-all/close must settle registered futures, and a retained rejection
 * must fail the next consumer. Tests never connect.
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

    /** Concurrent future() calls for one hash share one Future; one resolve settles all. */
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

    /** A no-waiter reject is retained and fails the next future(); a later resolve clears it. */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void testRetainedRejectionFailsNextConsumerAndResolveClearsIt() throws Exception {
        WsClient client = newClient();

        client.reject(new RuntimeException("boom"), HASH);   // retained, no waiter
        Future afterError = client.future(HASH);
        assertTrue(afterError.getFuture().isCompletedExceptionally(),
                "a post-error consumer must observe the retained rejection");
        assertThrows(ExecutionException.class, () -> afterError.getFuture().get(1, TimeUnit.SECONDS));

        // Retained error is gone; the next consumer registers a fresh pending future.
        client.resolve("fresh", HASH);
        Future afterRecovery = client.future(HASH);
        assertFalse(afterRecovery.isDone(),
                "a resolve after a retained rejection must clear it so the next consumer waits");
        assertTrue(futuresOf(client).containsKey(HASH),
                "the recovered consumer's future must be registered in the map");

        client.close();
    }

    /** reject-all and close() must reject registered futures and drain the map. */
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

    /** future() racing reject() must not leave a consumer on a future no map references. */
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
                            // Timeout is legal if the error landed first: future still in the map.
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
