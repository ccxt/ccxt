package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

// Regression battery for IndexedOrderBookSide, the java lane of the
// indexed-orderbook audit behind https://github.com/ccxt/ccxt/pull/29749
// (ts/php/py/cs) and https://github.com/ccxt/ccxt/pull/29751 (go). Before the
// class existed, IndexedOrderBook fell back to price-keyed sides: same-price
// orders collapsed, single-order cancels deleted whole levels, and bitmex's
// price-less updates/deletes were silently dropped.
public class IndexedOrderBookSideTest {

    private static List<Object> row(Object price, Object size, Object id) {
        return new ArrayList<>(Arrays.asList(price, size, id));
    }

    private static IndexedOrderBookSide seedAsks(int n, Object depth) {
        IndexedOrderBookSide asks = new IndexedOrderBookSide(null, depth, false);
        for (int i = 1; i <= n; i++) {
            asks.storeArray(row(i * 10.0, 1.0, "id" + i));
        }
        return asks;
    }

    private static BigDecimal num(Object v) {
        if (v instanceof BigDecimal bd) return bd;
        return BigDecimal.valueOf(((Number) v).doubleValue());
    }

    private static String idAt(OrderBookSide side, int i) {
        return String.valueOf(((List<?>) side.get(i)).get(2));
    }

    @Test
    public void limitCleansHashmapAndIsIdempotent() {
        IndexedOrderBookSide asks = seedAsks(6, 3);
        asks.limit();
        assertEquals(3, asks.size());
        assertEquals(3, asks.hashmap.size());
        asks.limit();
        assertEquals(3, asks.size());
        assertEquals(3, asks.hashmap.size());
    }

    @Test
    public void trimmedIdDeleteIsNoOp() {
        IndexedOrderBookSide asks = seedAsks(6, 3);
        asks.limit();
        assertDoesNotThrow(() -> asks.storeArray(row(60.0, 0.0, "id6")));
        assertEquals(3, asks.size());
        assertEquals(3, asks.hashmap.size());
    }

    @Test
    public void trimmedIdReinsertsCleanly() {
        IndexedOrderBookSide asks = seedAsks(6, 3);
        asks.limit();
        assertDoesNotThrow(() -> asks.storeArray(row(60.0, 2.0, "id6")));
        assertEquals(4, asks.size());
        assertEquals(4, asks.hashmap.size());
    }

    @Test
    public void staleHashmapEntryDegradesGracefully() {
        // same-price update of a mapped-but-rowless id reinserts
        IndexedOrderBookSide a = seedAsks(2, null);
        a.hashmap.put("ghost", BigDecimal.valueOf(15.0));
        assertDoesNotThrow(() -> a.storeArray(row(15.0, 2.0, "ghost")));
        assertEquals(3, a.size());
        // moved-price update reinserts
        IndexedOrderBookSide b = seedAsks(2, null);
        b.hashmap.put("ghost", BigDecimal.valueOf(15.0));
        assertDoesNotThrow(() -> b.storeArray(row(17.0, 2.0, "ghost")));
        assertEquals(3, b.size());
        // delete just heals the map
        IndexedOrderBookSide c = seedAsks(2, null);
        c.hashmap.put("ghost", BigDecimal.valueOf(15.0));
        assertDoesNotThrow(() -> c.storeArray(row(15.0, 0.0, "ghost")));
        assertEquals(2, c.size());
        assertEquals(2, c.hashmap.size());
    }

    @Test
    public void crossTypeIdsUnify() {
        IndexedOrderBookSide asks = new IndexedOrderBookSide(null, null, false);
        asks.storeArray(row(10.0, 1.0, 7));      // id as boxed number
        asks.storeArray(row(10.0, 0.0, "7"));    // delete as string
        assertEquals(0, asks.size());
        assertEquals(0, asks.hashmap.size());
    }

    @Test
    public void nullPriceDeltasAreBitmexSafe() {
        // deletes arrive with no price: must remove by id
        IndexedOrderBookSide a = new IndexedOrderBookSide(null, null, false);
        a.storeArray(row(10.0, 1.0, "8791115"));
        assertDoesNotThrow(() -> a.storeArray(row(null, 0.0, "8791115")));
        assertEquals(0, a.size());
        assertEquals(0, a.hashmap.size());
        // updates arrive with no price: recover it from the hashmap
        IndexedOrderBookSide b = new IndexedOrderBookSide(null, null, false);
        b.storeArray(row(10.0, 1.0, "8791115"));
        assertDoesNotThrow(() -> b.storeArray(row(null, 5.0, "8791115")));
        assertEquals(1, b.size());
        List<?> r = (List<?>) b.get(0);
        // rows keep the delta's raw values (ts parity), only the recovered
        // price is materialized as a BigDecimal — compare numerically
        assertEquals(0, BigDecimal.valueOf(10.0).compareTo(num(r.get(0))));
        assertEquals(0, BigDecimal.valueOf(5.0).compareTo(num(r.get(1))));
        // unknown id with no price is dropped, not misplaced
        IndexedOrderBookSide c = new IndexedOrderBookSide(null, null, false);
        c.storeArray(row(10.0, 1.0, "a"));
        assertDoesNotThrow(() -> {
            c.storeArray(row(null, 0.0, "ghost"));
            c.storeArray(row(null, 5.0, "ghost2"));
        });
        assertEquals(1, c.size());
    }

    @Test
    public void samePriceOrdersCoexistAndDeleteIndividually() {
        IndexedOrderBookSide asks = new IndexedOrderBookSide(null, null, false);
        asks.storeArray(row(10.0, 1.0, "a"));
        asks.storeArray(row(10.0, 2.0, "b"));
        assertEquals(2, asks.size());
        asks.storeArray(row(10.0, 0.0, "a"));
        assertEquals(1, asks.size());
        assertEquals("b", idAt(asks, 0));
    }

    @Test
    public void bidsLifecycle() {
        IndexedOrderBookSide bids = new IndexedOrderBookSide(null, 3, true);
        for (int i = 1; i <= 5; i++) {
            bids.storeArray(row(i * 10.0, 1.0, "b" + i));
        }
        bids.limit();                          // keeps 50,40,30; trims b2,b1
        bids.storeArray(row(10.0, 2.0, "b1")); // re-add trimmed
        bids.storeArray(row(45.0, 3.0, "b3")); // move live
        bids.storeArray(row(50.0, 0.0, "b5")); // delete live top
        bids.limit();
        assertEquals(3, bids.size());
        assertEquals(3, bids.hashmap.size());
        assertEquals("b3", idAt(bids, 0));
        assertEquals("b4", idAt(bids, 1));
        assertEquals("b1", idAt(bids, 2));
    }

    @Test
    public void indexedOrderBookSeedsResetsAndCopies() {
        Map<String, Object> snapshot = new HashMap<>();
        snapshot.put("asks", new ArrayList<>(Arrays.asList(
                row(11.0, 1.0, "a"), row(12.0, 1.0, "b"), row(13.0, 1.0, "c"),
                row(14.0, 1.0, "d"), row(15.0, 1.0, "e"))));
        snapshot.put("bids", new ArrayList<>(Arrays.asList(
                row(10.0, 1.0, "x"), row(9.0, 1.0, "y"),
                row(8.0, 1.0, "z"), row(7.0, 1.0, "w"))));
        snapshot.put("timestamp", 1574827239000L);
        snapshot.put("nonce", 70);
        WsOrderBook.IndexedOrderBook book = new WsOrderBook.IndexedOrderBook(snapshot, 3);
        book.limit();
        assertEquals(3, book.asks.size());
        assertEquals(3, book.bids.size());
        IndexedOrderBookSide asks = (IndexedOrderBookSide) book.asks;
        IndexedOrderBookSide bids = (IndexedOrderBookSide) book.bids;
        assertEquals(3, asks.hashmap.size());
        assertEquals(3, bids.hashmap.size());
        // trimmed-id delete is a no-op, reinsert works, re-limit re-trims
        asks.storeArray(row(14.0, 0.0, "d"));
        bids.storeArray(row(7.0, 2.0, "w"));
        book.limit();
        assertEquals(3, asks.size());
        assertEquals(3, bids.size());
        assertEquals(3, bids.hashmap.size());
        // reset clears rows and the id map together
        book.reset(snapshot);
        assertEquals(5, book.asks.size());
        assertEquals(5, ((IndexedOrderBookSide) book.asks).hashmap.size());
        // copy preserves the indexed runtime type and the map
        WsOrderBook copy = book.copy();
        assertEquals(IndexedOrderBookSide.IndexedAsks.class, copy.asks.getClass());
        assertEquals(5, ((IndexedOrderBookSide) copy.asks).hashmap.size());
    }
}
