package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Targeted regressions for the concurrency fixes in WsClient:
 *  - connect() must not race the startedConnecting flag.
 *  - close() / reject(error, null) must not throw ConcurrentModificationException
 *    when invoked while another thread is registering or completing futures.
 *  - onError() must surface the error to current awaiters and install a fresh
 *    future for the next connect() attempt (no silent swallowing).
 *
 * These tests construct a WsClient with a placeholder URL and never connect,
 * so they don't require network access.
 */
class WsClientConcurrencyTest {

    private static WsClient newClient() {
        return new WsClient(
                "wss://example.invalid/ws",
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

    /**
     * Concurrent connect() callers must collapse onto a single attempt.
     * Without the AtomicBoolean.compareAndSet fix, two threads could both observe
     * startedConnecting=false and each spawn a createConnection task.
     */
    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void testConnectIsAtomic() throws Exception {
        WsClient client = newClient();

        // We can't observe createConnection runs directly, but we can check the
        // post-condition: after concurrent calls return, startedConnecting is true
        // exactly once and all callers see the same `connected` future.
        int n = 64;
        CompletableFuture<Boolean>[] returned = new CompletableFuture[n];
        Thread[] threads = new Thread[n];
        CountDownLatch start = new CountDownLatch(1);

        for (int i = 0; i < n; i++) {
            final int idx = i;
            threads[i] = new Thread(() -> {
                try {
                    start.await();
                    returned[idx] = client.connect(0);
                } catch (InterruptedException ignored) { }
            });
            threads[i].start();
        }
        start.countDown();
        for (Thread t : threads) t.join();

        assertTrue(client.startedConnecting.get(), "startedConnecting should be set after connect");
        // All callers must observe the same future reference (single connection attempt).
        for (int i = 1; i < n; i++) {
            assertSame(returned[0], returned[i], "Caller " + i + " got a different future");
        }
        client.close();
    }

    /**
     * close() must not throw ConcurrentModificationException when other threads
     * are concurrently registering or completing futures via future()/resolve().
     */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void testCloseDoesNotThrowConcurrentModification() throws Exception {
        WsClient client = newClient();

        // Pre-populate a bunch of pending futures.
        for (int i = 0; i < 500; i++) {
            client.future("hash-" + i);
        }

        AtomicInteger errors = new AtomicInteger(0);
        Thread mutator = new Thread(() -> {
            try {
                for (int i = 500; i < 2000; i++) {
                    client.future("hash-" + i);
                    if ((i & 1) == 0) {
                        client.resolve("ok", "hash-" + i);
                    }
                }
            } catch (Throwable t) {
                errors.incrementAndGet();
            }
        });
        mutator.start();
        // Race close() against the mutator.
        try {
            client.close();
        } catch (java.util.ConcurrentModificationException cme) {
            fail("close() threw ConcurrentModificationException");
        } catch (Throwable t) {
            errors.incrementAndGet();
        }
        mutator.join();
        assertEquals(0, errors.get(), "Concurrent mutate + close should not throw");
    }

    /**
     * reject(error, null) must also tolerate concurrent map mutation.
     */
    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void testRejectAllDoesNotThrowConcurrentModification() throws Exception {
        WsClient client = newClient();
        for (int i = 0; i < 300; i++) {
            client.future("hash-" + i);
        }
        Thread mutator = new Thread(() -> {
            for (int i = 300; i < 1500; i++) {
                client.future("hash-" + i);
            }
        });
        mutator.start();
        try {
            client.reject(new RuntimeException("boom"));
        } catch (java.util.ConcurrentModificationException cme) {
            fail("reject(error) threw ConcurrentModificationException");
        }
        mutator.join();
    }

    /**
     * Pending awaiters of `connected` must observe the error when onError fires,
     * AND the next connect() attempt must receive a fresh, unfinished future.
     * Before the fix, an already-completed `connected` was silently replaced
     * (errors lost) and a pending one was completed but never rotated.
     */
    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void testOnErrorSurfacesAndRotatesFuture() throws Exception {
        WsClient client = newClient();

        // Case A: future is pending — error must propagate to current awaiters.
        CompletableFuture<Boolean> pending = client.connected;
        client.onError(new RuntimeException("net down"));
        assertTrue(pending.isCompletedExceptionally(),
                "Pending `connected` future must complete exceptionally on error");

        // After onError, a fresh future must be in place for the next connect attempt.
        CompletableFuture<Boolean> fresh = client.connected;
        assertNotSame(pending, fresh, "onError must install a fresh `connected` future");
        assertFalse(fresh.isDone(), "Fresh `connected` future must be pending");

        // Case B: connected was already completed successfully — error must not
        // be swallowed by a silent replacement.
        client.connected.complete(true);
        CompletableFuture<Boolean> done = client.connected;
        client.onError(new RuntimeException("dropped"));
        // Old future stays completed (already done), new future must be pending.
        assertTrue(done.isDone(), "Previously completed future stays done");
        assertNotSame(done, client.connected, "A new pending future must be installed");
        assertFalse(client.connected.isDone(), "New future must be pending for next connect");
    }
}
