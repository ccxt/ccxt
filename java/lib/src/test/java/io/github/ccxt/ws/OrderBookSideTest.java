package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

class OrderBookSideTest {

    @org.junit.jupiter.api.Test
    void testConcurrentReadNeverObservesNulls() throws Exception {
        // regression for the binance watchOrderBookForSymbols null<null failure:
        // a writer thread hammers store/remove under the monitor while reader
        // threads walk the side the same way the transpiled tests do - with the
        // read-side synchronization in place no read may ever observe a null row
        final OrderBookSide.Asks asks = new OrderBookSide.Asks();
        final java.util.concurrent.atomic.AtomicBoolean stop = new java.util.concurrent.atomic.AtomicBoolean(false);
        final java.util.concurrent.atomic.AtomicReference<String> failure = new java.util.concurrent.atomic.AtomicReference<>(null);
        Thread writer = new Thread(() -> {
            java.util.Random rnd = new java.util.Random(42);
            while (!stop.get()) {
                double price = 100.0 + rnd.nextInt(500) / 10.0;
                double amount = rnd.nextInt(10) == 0 ? 0.0 : 1.0; // 10% removals
                asks.store(price, amount);
            }
        });
        Runnable reading = () -> {
            while (!stop.get() && failure.get() == null) {
                int n = asks.size();
                for (int i = 0; i < n; i++) {
                    Object row;
                    try {
                        row = asks.get(i);
                    } catch (IndexOutOfBoundsException e) {
                        // the side shrank between size() and get(i) - a distinct,
                        // documented residual; this test targets null observations
                        break;
                    }
                    if (row == null) {
                        failure.compareAndSet(null, "observed a null row at index " + i);
                        break;
                    }
                }
                for (Object row : asks) { // snapshot iterator path
                    if (row == null) {
                        failure.compareAndSet(null, "iterator observed a null row");
                        break;
                    }
                }
            }
        };
        Thread r1 = new Thread(reading);
        Thread r2 = new Thread(reading);
        writer.start();
        r1.start();
        r2.start();
        Thread.sleep(2000);
        stop.set(true);
        writer.join(5000);
        r1.join(5000);
        r2.join(5000);
        // join(timeout) returning does not mean the thread stopped - a deadlocked
        // reader must fail the test rather than time out green
        org.junit.jupiter.api.Assertions.assertFalse(writer.isAlive(), "writer thread did not stop");
        org.junit.jupiter.api.Assertions.assertFalse(r1.isAlive(), "reader 1 did not stop");
        org.junit.jupiter.api.Assertions.assertFalse(r2.isAlive(), "reader 2 did not stop");
        org.junit.jupiter.api.Assertions.assertNull(failure.get(), failure.get());
    }


    @Test
    void testAsksAscendingOrder() {
        var asks = new OrderBookSide.Asks();
        asks.storeArray(Arrays.asList(100.0, 1.0));
        asks.storeArray(Arrays.asList(50.0, 2.0));
        asks.storeArray(Arrays.asList(150.0, 3.0));

        assertEquals(3, asks.size());
        // Asks should be ascending by price
        assertEquals(50.0, ((List<?>) asks.get(0)).get(0));
        assertEquals(100.0, ((List<?>) asks.get(1)).get(0));
        assertEquals(150.0, ((List<?>) asks.get(2)).get(0));
    }

    @Test
    void testBidsDescendingOrder() {
        var bids = new OrderBookSide.Bids();
        bids.storeArray(Arrays.asList(100.0, 1.0));
        bids.storeArray(Arrays.asList(150.0, 2.0));
        bids.storeArray(Arrays.asList(50.0, 3.0));

        assertEquals(3, bids.size());
        // Bids should be descending by price
        assertEquals(150.0, ((List<?>) bids.get(0)).get(0));
        assertEquals(100.0, ((List<?>) bids.get(1)).get(0));
        assertEquals(50.0, ((List<?>) bids.get(2)).get(0));
    }

    @Test
    void testUpdateExistingPriceLevel() {
        var asks = new OrderBookSide.Asks();
        asks.storeArray(Arrays.asList(100.0, 1.0));
        asks.storeArray(Arrays.asList(100.0, 5.0)); // update

        assertEquals(1, asks.size());
        assertEquals(5.0, ((List<?>) asks.get(0)).get(1));
    }

    @Test
    void testDeletePriceLevel() {
        var asks = new OrderBookSide.Asks();
        asks.storeArray(Arrays.asList(100.0, 1.0));
        asks.storeArray(Arrays.asList(200.0, 2.0));
        asks.storeArray(Arrays.asList(100.0, 0.0)); // delete

        assertEquals(1, asks.size());
        assertEquals(200.0, ((List<?>) asks.get(0)).get(0));
    }

    @Test
    void testDeleteNonExistent() {
        var asks = new OrderBookSide.Asks();
        asks.storeArray(Arrays.asList(100.0, 1.0));
        asks.storeArray(Arrays.asList(999.0, 0.0)); // delete non-existent — no-op

        assertEquals(1, asks.size());
    }

    @Test
    void testLimit() {
        var asks = new OrderBookSide.Asks(null, 2);
        asks.storeArray(Arrays.asList(100.0, 1.0));
        asks.storeArray(Arrays.asList(200.0, 2.0));
        asks.storeArray(Arrays.asList(300.0, 3.0));

        asks.limit();
        assertEquals(2, asks.size());
        // Should keep the first 2 (lowest prices for asks)
        assertEquals(100.0, ((List<?>) asks.get(0)).get(0));
        assertEquals(200.0, ((List<?>) asks.get(1)).get(0));
    }
}
