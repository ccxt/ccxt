package io.github.ccxt.types;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import io.github.ccxt.Helpers;
import io.github.ccxt.base.Functions;
import io.github.ccxt.base.Generic;
import io.github.ccxt.ws.ArrayCache;

import java.util.*;

/**
 * Unified types are views over the payload map the core produced (TypedMap / TypedList):
 * same identity for the transpiled helpers, projections for the typed fields.
 */
class TypedViewTest {

    private static Map<String, Object> ticker(String symbol, double last) {
        Map<String, Object> raw = new LinkedHashMap<>();
        raw.put("symbol", symbol);
        raw.put("timestamp", 1700000000000L);
        raw.put("last", last);
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("raw", "x");
        raw.put("info", info);
        return raw;
    }

    @Test
    void typedValueIsTheBackingMap() {
        Map<String, Object> raw = ticker("BTC/USDT", 100.0);
        Ticker t = new Ticker(raw);
        assertInstanceOf(Map.class, t);
        assertSame(raw, t.raw());
        assertEquals("BTC/USDT", t.symbol);
        assertEquals("BTC/USDT", t.get("symbol"));
        assertEquals(100.0, Helpers.GetValue(t, "last"));
        assertTrue(t.containsKey("info"));
        assertEquals(raw.size(), t.size());
        assertEquals(raw, t);
        assertEquals(Functions.json(raw), Functions.json(t));
    }

    @Test
    void wrappingAViewSharesTheInnermostMap() {
        Map<String, Object> raw = ticker("BTC/USDT", 100.0);
        Ticker outer = new Ticker(new Ticker(raw));
        assertSame(raw, outer.raw());
    }

    @Test
    void nullAndNonMapPayloadsGiveAnEmptyView() {
        Ticker t = new Ticker(null);
        assertEquals(0, t.size());
        assertNull(t.symbol);
        OHLCV row = new OHLCV(null);
        assertEquals(0, row.size());
    }

    @Test
    void projectionsAreSnapshotsButTheViewIsLive() {
        Map<String, Object> raw = ticker("BTC/USDT", 100.0);
        Ticker t = new Ticker(raw);
        raw.put("last", 101.0);
        assertEquals(100.0, t.last);            // field captured at construction
        assertEquals(101.0, t.get("last"));     // map view follows the payload
        assertEquals(101.0, new Ticker(t).last); // re-projecting reads the current state
    }

    @Test
    void extendOfAViewProducesAPlainCopy() {
        Ticker t = new Ticker(ticker("BTC/USDT", 100.0));
        Map<String, Object> extended = Generic.extend(t, Map.of("extra", 1));
        assertNotSame(t.raw(), extended);
        assertFalse(t.containsKey("extra"));
        assertEquals("BTC/USDT", extended.get("symbol"));
    }

    @Test
    void ohlcvIsAViewOverTheRow() {
        List<Object> row = new ArrayList<>(List.of(1700000000000L, 1.0, 2.0, 0.5, 1.5, 10.0));
        OHLCV candle = new OHLCV(row);
        assertInstanceOf(List.class, candle);
        assertSame(row, candle.raw());
        assertEquals(1700000000000L, candle.timestamp);
        assertEquals(2.0, candle.high);
        assertEquals(row, candle);
        assertEquals(1.0, candle.get(1));
    }

    @Test
    void dictionaryWrappersAreViewsToo() {
        Map<String, Object> raw = new LinkedHashMap<>();
        raw.put("BTC/USDT", ticker("BTC/USDT", 100.0));
        raw.put("ETH/USDT", ticker("ETH/USDT", 10.0));
        Tickers tickers = new Tickers(raw);
        assertSame(raw, tickers.raw());
        assertEquals(100.0, tickers.get("BTC/USDT").last);
        assertSame(raw.get("BTC/USDT"), tickers.get("BTC/USDT").raw());
        assertEquals(2, tickers.size());
    }

    /**
     * ArrayCache merges an update INTO the stored row (Map.putAll). A view handed to a user by an
     * earlier watch* call therefore observes the merge through get(), exactly like the TS/Python
     * object the cache holds; its typed fields keep the values seen when it was constructed.
     */
    @Test
    void cacheMergeIsVisibleThroughTheViewNotTheFields() {
        ArrayCache.ArrayCacheBySymbolById cache = new ArrayCache.ArrayCacheBySymbolById();
        Map<String, Object> first = new LinkedHashMap<>();
        first.put("id", "1");
        first.put("symbol", "BTC/USDT");
        first.put("status", "open");
        cache.append(first);
        Order handed = new Order(cache.get(0));
        assertEquals("open", handed.status);
        Map<String, Object> update = new LinkedHashMap<>();
        update.put("id", "1");
        update.put("symbol", "BTC/USDT");
        update.put("status", "closed");
        cache.append(update);
        assertEquals("open", handed.status);
        assertEquals("closed", handed.get("status"));
        assertSame(first, handed.raw());
    }
}
