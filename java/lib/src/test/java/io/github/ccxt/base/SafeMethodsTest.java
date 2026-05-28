package io.github.ccxt.base;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import io.github.ccxt.ws.WsOrderBook;

import java.util.*;

/**
 * Tests for SafeMethods: safeValue, safeInteger, safeFloat, safeString
 * across all supported source types (Map, List, Java objects).
 */
class SafeMethodsTest {

    // ==========================================
    // SafeValue — Map
    // ==========================================

    @Test
    void safeValueFromMap() {
        Map<String, Object> map = Map.of("key", "hello", "num", 42);
        assertEquals("hello", SafeMethods.SafeValue(map, "key"));
        assertEquals(42, SafeMethods.SafeValue(map, "num"));
    }

    @Test
    void safeValueFromMapMissing() {
        Map<String, Object> map = Map.of("key", "hello");
        assertNull(SafeMethods.SafeValue(map, "missing"));
    }

    @Test
    void safeValueFromMapWithDefault() {
        Map<String, Object> map = Map.of("key", "hello");
        assertEquals("fallback", SafeMethods.SafeValue(map, "missing", "fallback"));
    }

    @Test
    void safeValueFromMapNullValue() {
        Map<String, Object> map = new HashMap<>();
        map.put("key", null);
        assertNull(SafeMethods.SafeValue(map, "key"));
    }

    @Test
    void safeValueFromMapEmptyString() {
        Map<String, Object> map = new HashMap<>();
        map.put("key", "");
        // Empty strings are skipped, so should return default (null)
        assertNull(SafeMethods.SafeValue(map, "key"));
    }

    @Test
    void safeValueFromMapListValue() {
        List<Object> list = List.of(1, 2, 3);
        Map<String, Object> map = Map.of("items", list);
        assertEquals(list, SafeMethods.SafeValue(map, "items"));
    }

    @Test
    void safeValueFromMapMapValue() {
        Map<String, Object> inner = Map.of("a", 1);
        Map<String, Object> map = Map.of("nested", inner);
        assertEquals(inner, SafeMethods.SafeValue(map, "nested"));
    }

    // ==========================================
    // SafeValue — List
    // ==========================================

    @Test
    void safeValueFromList() {
        List<Object> list = new ArrayList<>(List.of("zero", "one", "two"));
        assertEquals("zero", SafeMethods.SafeValue(list, 0));
        assertEquals("two", SafeMethods.SafeValue(list, 2));
    }

    @Test
    void safeValueFromListOutOfBounds() {
        List<Object> list = new ArrayList<>(List.of("zero"));
        assertNull(SafeMethods.SafeValue(list, 5));
    }

    // ==========================================
    // SafeValue — Java object (reflection)
    // ==========================================

    @Test
    void safeValueFromObject() {
        WsOrderBook ob = new WsOrderBook();
        ob.symbol = "BTC/USDT";
        ob.nonce = 12345L;
        ob.timestamp = 9999L;
        assertEquals("BTC/USDT", SafeMethods.SafeValue(ob, "symbol"));
        assertEquals(12345L, SafeMethods.SafeValue(ob, "nonce"));
        assertEquals(9999L, SafeMethods.SafeValue(ob, "timestamp"));
    }

    @Test
    void safeValueFromObjectMissing() {
        WsOrderBook ob = new WsOrderBook();
        ob.symbol = "BTC/USDT";
        assertNull(SafeMethods.SafeValue(ob, "nonExistentField"));
    }

    @Test
    void safeValueFromObjectNullField() {
        WsOrderBook ob = new WsOrderBook();
        // symbol is null by default
        assertNull(SafeMethods.SafeValue(ob, "symbol"));
    }

    @Test
    void safeValueFromObjectWithDefault() {
        WsOrderBook ob = new WsOrderBook();
        assertEquals("fallback", SafeMethods.SafeValue(ob, "nonExistentField", "fallback"));
    }

    // ==========================================
    // SafeValue — null input
    // ==========================================

    @Test
    void safeValueFromNull() {
        assertNull(SafeMethods.SafeValue(null, "key"));
    }

    @Test
    void safeValueFromNullWithDefault() {
        assertEquals("default", SafeMethods.SafeValue(null, "key", "default"));
    }

    // ==========================================
    // SafeValueN — multi-key fallback
    // ==========================================

    @Test
    void safeValueNFirstKeyHit() {
        Map<String, Object> map = Map.of("a", 1, "b", 2);
        assertEquals(1, SafeMethods.SafeValueN(map, List.of("a", "b")));
    }

    @Test
    void safeValueNFallsToSecondKey() {
        Map<String, Object> map = Map.of("b", 2);
        assertEquals(2, SafeMethods.SafeValueN(map, List.of("a", "b")));
    }

    @Test
    void safeValueNNoKeyMatches() {
        Map<String, Object> map = Map.of("c", 3);
        assertNull(SafeMethods.SafeValueN(map, List.of("a", "b")));
    }

    @Test
    void safeValueNOnObjectFallsToSecondKey() {
        WsOrderBook ob = new WsOrderBook();
        ob.symbol = "ETH/USDT";
        // "missing" doesn't exist, falls through to "symbol"
        assertEquals("ETH/USDT", SafeMethods.SafeValueN(ob, List.of("missing", "symbol")));
    }

    // ==========================================
    // SafeInteger
    // ==========================================

    @Test
    void safeIntegerFromMap() {
        Map<String, Object> map = Map.of("ts", 1700000000000L, "count", 42);
        assertEquals(1700000000000L, SafeMethods.SafeInteger(map, "ts"));
        assertEquals(42L, SafeMethods.SafeInteger(map, "count"));
    }

    @Test
    void safeIntegerFromMapMissing() {
        Map<String, Object> map = Map.of("ts", 100L);
        assertNull(SafeMethods.SafeInteger(map, "missing"));
    }

    @Test
    void safeIntegerFromMapStringValue() {
        Map<String, Object> map = Map.of("num", "12345");
        assertEquals(12345L, SafeMethods.SafeInteger(map, "num"));
    }

    @Test
    void safeIntegerFromMapDoubleValue() {
        Map<String, Object> map = Map.of("num", 99.7);
        assertEquals(99L, SafeMethods.SafeInteger(map, "num"));
    }

    @Test
    void safeIntegerFromObject() {
        WsOrderBook ob = new WsOrderBook();
        ob.nonce = 54321L;
        ob.timestamp = 1700000000000L;
        assertEquals(54321L, SafeMethods.SafeInteger(ob, "nonce"));
        assertEquals(1700000000000L, SafeMethods.SafeInteger(ob, "timestamp"));
    }

    @Test
    void safeIntegerFromObjectMissing() {
        WsOrderBook ob = new WsOrderBook();
        assertNull(SafeMethods.SafeInteger(ob, "nonExistentField"));
    }

    @Test
    void safeIntegerFromObjectNullField() {
        WsOrderBook ob = new WsOrderBook();
        // nonce is null by default
        assertNull(SafeMethods.SafeInteger(ob, "nonce"));
    }

    @Test
    void safeIntegerFromNull() {
        assertNull(SafeMethods.SafeInteger(null, "key"));
    }

    // ==========================================
    // SafeFloat
    // ==========================================

    @Test
    void safeFloatFromMap() {
        Map<String, Object> map = Map.of("price", 37000.5, "qty", 1);
        assertEquals(37000.5, SafeMethods.SafeFloat(map, "price"));
        assertEquals(1.0, SafeMethods.SafeFloat(map, "qty"));
    }

    @Test
    void safeFloatFromMapMissing() {
        Map<String, Object> map = Map.of("price", 100.0);
        assertNull(SafeMethods.SafeFloat(map, "missing"));
    }

    @Test
    void safeFloatFromMapStringValue() {
        Map<String, Object> map = Map.of("price", "42.5");
        assertEquals(42.5, SafeMethods.SafeFloat(map, "price"));
    }

    @Test
    void safeFloatFromObject() {
        WsOrderBook ob = new WsOrderBook();
        ob.nonce = 100L;
        // nonce is Long, SafeFloat should convert to Double
        assertEquals(100.0, SafeMethods.SafeFloat(ob, "nonce"));
    }

    @Test
    void safeFloatFromObjectMissing() {
        WsOrderBook ob = new WsOrderBook();
        assertNull(SafeMethods.SafeFloat(ob, "nonExistentField"));
    }

    @Test
    void safeFloatFromNull() {
        assertNull(SafeMethods.SafeFloat(null, "key"));
    }

    // ==========================================
    // SafeString
    // ==========================================

    @Test
    void safeStringFromMap() {
        Map<String, Object> map = Map.of("symbol", "BTC/USDT", "side", "buy");
        assertEquals("BTC/USDT", SafeMethods.SafeString(map, "symbol"));
        assertEquals("buy", SafeMethods.SafeString(map, "side"));
    }

    @Test
    void safeStringFromMapMissing() {
        Map<String, Object> map = Map.of("symbol", "BTC/USDT");
        assertNull(SafeMethods.SafeString(map, "missing"));
    }

    @Test
    void safeStringFromMapNumberValue() {
        Map<String, Object> map = Map.of("id", 12345L);
        assertEquals("12345", SafeMethods.SafeString(map, "id"));
    }

    @Test
    void safeStringFromObject() {
        WsOrderBook ob = new WsOrderBook();
        ob.symbol = "ETH/USDT";
        assertEquals("ETH/USDT", SafeMethods.SafeString(ob, "symbol"));
    }

    @Test
    void safeStringFromObjectMissing() {
        WsOrderBook ob = new WsOrderBook();
        assertNull(SafeMethods.SafeString(ob, "nonExistentField"));
    }

    @Test
    void safeStringFromObjectNullField() {
        WsOrderBook ob = new WsOrderBook();
        // symbol is null by default
        assertNull(SafeMethods.SafeString(ob, "symbol"));
    }

    @Test
    void safeStringFromNull() {
        assertNull(SafeMethods.SafeString(null, "key"));
    }

    // ==========================================
    // SafeInteger2 / safeString2 (multi-key)
    // ==========================================

    @Test
    void safeInteger2FirstKeyHit() {
        Map<String, Object> map = Map.of("U", 100L, "u", 200L);
        assertEquals(100L, SafeMethods.SafeInteger2(map, "U", "u"));
    }

    @Test
    void safeInteger2FallsToSecondKey() {
        Map<String, Object> map = Map.of("u", 200L);
        assertEquals(200L, SafeMethods.SafeInteger2(map, "U", "u"));
    }

    @Test
    void safeString2FallsToSecondKey() {
        Map<String, Object> map = Map.of("name", "Binance");
        assertEquals("Binance", SafeMethods.safeString2(map, "title", "name"));
    }

    // ==========================================
    // Consistency: Map vs Object return same results
    // ==========================================

    @Test
    void consistencyMapVsObject() {
        // Same data in a Map and a WsOrderBook
        Map<String, Object> map = new HashMap<>();
        map.put("nonce", 12345L);
        map.put("timestamp", 9999L);
        map.put("symbol", "BTC/USDT");
        map.put("datetime", "2026-04-06T12:00:00Z");

        WsOrderBook ob = new WsOrderBook();
        ob.nonce = 12345L;
        ob.timestamp = 9999L;
        ob.symbol = "BTC/USDT";
        ob.datetime = "2026-04-06T12:00:00Z";

        // All safe* methods should return the same result
        assertEquals(SafeMethods.SafeValue(map, "nonce"), SafeMethods.SafeValue(ob, "nonce"));
        assertEquals(SafeMethods.SafeInteger(map, "nonce"), SafeMethods.SafeInteger(ob, "nonce"));
        assertEquals(SafeMethods.SafeInteger(map, "timestamp"), SafeMethods.SafeInteger(ob, "timestamp"));
        assertEquals(SafeMethods.SafeString(map, "symbol"), SafeMethods.SafeString(ob, "symbol"));
        assertEquals(SafeMethods.SafeString(map, "datetime"), SafeMethods.SafeString(ob, "datetime"));
        assertEquals(SafeMethods.SafeFloat(map, "nonce"), SafeMethods.SafeFloat(ob, "nonce"));

        // Missing keys
        assertEquals(SafeMethods.SafeValue(map, "missing"), SafeMethods.SafeValue(ob, "missing"));
        assertEquals(SafeMethods.SafeInteger(map, "missing"), SafeMethods.SafeInteger(ob, "missing"));
        assertEquals(SafeMethods.SafeString(map, "missing"), SafeMethods.SafeString(ob, "missing"));
        assertEquals(SafeMethods.SafeFloat(map, "missing"), SafeMethods.SafeFloat(ob, "missing"));
    }
}
