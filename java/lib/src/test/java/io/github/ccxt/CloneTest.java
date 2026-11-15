package io.github.ccxt;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.exchanges.Binance;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Mirrors TS clone (ts/src/base/functions/generic.ts): a shallow copy - arrays
 * into a new array, objects into a new object - so writing to the copy never
 * changes the original. Exchanges rely on this, e.g. okx / coinbaseinternational
 * watchPositions split a flat position into separate long and short rows.
 */
class CloneTest {

    @Test
    @SuppressWarnings("unchecked")
    void mapCloneIsAShallowCopy() {
        Binance exchange = new Binance();
        Map<String, Object> nested = new LinkedHashMap<>();
        Map<String, Object> original = new LinkedHashMap<>();
        original.put("side", "long");
        original.put("info", nested);
        Map<String, Object> copy = (Map<String, Object>) exchange.clone(original);
        assertNotSame(original, copy);
        assertEquals(original, copy);
        copy.put("side", "short");
        copy.put("extra", true);
        assertEquals("long", original.get("side"));
        assertFalse(original.containsKey("extra"));
        // shallow, like TS: nested values are shared, not copied
        assertSame(nested, copy.get("info"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void listCloneIsAShallowCopy() {
        Binance exchange = new Binance();
        List<Object> original = new ArrayList<>(Arrays.asList(1L, "a"));
        List<Object> copy = (List<Object>) exchange.clone(original);
        assertNotSame(original, copy);
        assertEquals(original, copy);
        copy.add("b");
        assertEquals(2, original.size());
    }

    @Test
    void immutableSourcesCloneIntoMutableCopies() {
        Binance exchange = new Binance();
        assertDoesNotThrow(() -> ((Map<String, Object>) exchange.clone(Map.of("k", 1))).put("k", 2));
        assertDoesNotThrow(() -> ((List<Object>) exchange.clone(List.of(1))).add(2));
    }

    @Test
    void scalarsAndNullPassThrough() {
        Binance exchange = new Binance();
        assertNull(exchange.clone(null));
        assertEquals("x", exchange.clone("x"));
        assertEquals(5L, exchange.clone(5L));
    }
}
