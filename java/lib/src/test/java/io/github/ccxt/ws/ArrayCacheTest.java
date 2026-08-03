package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

class ArrayCacheTest {

    @Test
    void testAppendAndSize() {
        var cache = new ArrayCache(5);
        cache.append("a");
        cache.append("b");
        cache.append("c");
        assertEquals(3, cache.size());
    }

    @Test
    void testMaxSizeEviction() {
        var cache = new ArrayCache(3);
        cache.append("a");
        cache.append("b");
        cache.append("c");
        cache.append("d"); // evicts "a"

        assertEquals(3, cache.size());
        assertEquals("b", cache.get(0));
        assertEquals("d", cache.get(2));
    }

    @Test
    void testNewUpdatesTracking() {
        var cache = new ArrayCache(100);
        Map<String, Object> t1 = new HashMap<>();
        t1.put("symbol", "BTC/USDT");
        Map<String, Object> t2 = new HashMap<>();
        t2.put("symbol", "BTC/USDT");
        Map<String, Object> t3 = new HashMap<>();
        t3.put("symbol", "ETH/USDT");

        cache.append(t1);
        cache.append(t2);
        cache.append(t3);

        assertEquals(2, cache.getLimit("BTC/USDT", null));
        assertEquals(1, cache.getLimit("ETH/USDT", null));
        // After reading, counts reset
        assertEquals(0, cache.getLimit("BTC/USDT", null));
    }

    @Test
    void testArrayCacheByTimestampUpdatesInPlace() {
        var cache = new ArrayCache.ArrayCacheByTimestamp(100);
        Map<String, Object> c1 = new HashMap<>();
        c1.put("timestamp", 1000L);
        c1.put("close", 50000.0);

        Map<String, Object> c2 = new HashMap<>();
        c2.put("timestamp", 1000L);
        c2.put("close", 51000.0); // same timestamp, updated close

        cache.append(c1);
        cache.append(c2);

        assertEquals(1, cache.size()); // should update in place, not add
        @SuppressWarnings("unchecked")
        var entry = (Map<String, Object>) cache.get(0);
        assertEquals(51000.0, entry.get("close"));
    }

    @Test
    void testArrayCacheBySymbolByIdUpdatesInPlace() {
        var cache = new ArrayCache.ArrayCacheBySymbolById(100);
        Map<String, Object> o1 = new HashMap<>();
        o1.put("id", "order1");
        o1.put("symbol", "BTC/USDT");
        o1.put("status", "open");

        Map<String, Object> o2 = new HashMap<>();
        o2.put("id", "order1");
        o2.put("symbol", "BTC/USDT");
        o2.put("status", "closed"); // same id, updated status

        cache.append(o1);
        cache.append(o2);

        assertEquals(1, cache.size());
        @SuppressWarnings("unchecked")
        var entry = (Map<String, Object>) cache.get(0);
        assertEquals("closed", entry.get("status"));
    }
}
