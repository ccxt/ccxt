package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

class OrderBookSideTest {

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
