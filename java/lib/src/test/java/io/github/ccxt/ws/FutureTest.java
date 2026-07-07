package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.concurrent.CompletionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

class FutureTest {

    @Test
    void testResolve() throws Exception {
        Future f = new Future();
        assertFalse(f.isDone());
        f.resolve("hello");
        assertTrue(f.isDone());
        assertEquals("hello", f.getFuture().get(1, TimeUnit.SECONDS));
    }

    @Test
    void testReject() {
        Future f = new Future();
        f.reject(new RuntimeException("boom"));
        assertTrue(f.isDone());
        assertThrows(Exception.class, () -> f.getFuture().get(1, TimeUnit.SECONDS));
    }

    @Test
    void testRejectWithString() {
        Future f = new Future();
        f.reject("error message");
        assertTrue(f.isDone());
        try {
            f.getFuture().join();
            fail("Should have thrown");
        } catch (CompletionException e) {
            assertTrue(e.getCause().getMessage().contains("error message"));
        }
    }

    @Test
    void testDoubleResolveIgnored() throws Exception {
        Future f = new Future();
        f.resolve("first");
        f.resolve("second"); // should be ignored
        assertEquals("first", f.getFuture().get(1, TimeUnit.SECONDS));
    }

    @Test
    @Timeout(5)
    void testRace() throws Exception {
        Future f1 = new Future();
        Future f2 = new Future();
        Future f3 = new Future();

        Future winner = Future.race(f1, f2, f3);
        assertFalse(winner.isDone());

        f2.resolve("second wins");
        assertEquals("second wins", winner.getFuture().get(1, TimeUnit.SECONDS));
    }

    @Test
    @Timeout(5)
    void testRaceWithReject() {
        Future f1 = new Future();
        Future f2 = new Future();

        Future winner = Future.race(f1, f2);
        f1.reject("f1 failed");

        try {
            winner.getFuture().join();
            fail("Should have thrown");
        } catch (CompletionException e) {
            assertTrue(e.getCause().getMessage().contains("f1 failed"));
        }
    }

    @Test
    @Timeout(5)
    void testAsyncResolve() throws Exception {
        Future f = new Future();
        Thread.ofVirtual().start(() -> {
            try { Thread.sleep(50); } catch (InterruptedException e) {}
            f.resolve(42);
        });
        assertEquals(42, f.getFuture().get(2, TimeUnit.SECONDS));
    }
}
