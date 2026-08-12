package io.github.ccxt.types;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import java.util.*;

/**
 * Edge cases for type wrappers: nulls, missing fields, wrong types, empty maps.
 */
class EdgeCaseTest {

    @Test
    void testTickerFromEmptyMap() {
        Ticker t = new Ticker(new HashMap<>());
        assertNull(t.symbol);
        assertNull(t.last);
        assertNull(t.bid);
        assertNull(t.timestamp);
        assertNull(t.info);
    }

    @Test
    void testTickerWithNullValues() {
        Map<String, Object> data = new HashMap<>();
        data.put("symbol", null);
        data.put("last", null);
        data.put("timestamp", null);
        Ticker t = new Ticker(data);
        assertNull(t.symbol);
        assertNull(t.last);
        assertNull(t.timestamp);
    }

    @Test
    void testTickerWithStringNumbers() {
        // API sometimes returns numbers as strings
        Map<String, Object> data = new HashMap<>();
        data.put("symbol", "BTC/USDT");
        data.put("last", "37000.5");
        data.put("timestamp", "1700000000000");
        data.put("high", "38000");
        Ticker t = new Ticker(data);
        assertEquals("BTC/USDT", t.symbol);
        assertEquals(37000.5, t.last);
        assertEquals(1700000000000L, t.timestamp);
        assertEquals(38000.0, t.high);
    }

    @Test
    void testTickerWithIntegerValues() {
        Map<String, Object> data = new HashMap<>();
        data.put("last", 37000);      // int, not double
        data.put("timestamp", 1700000000000L);
        Ticker t = new Ticker(data);
        assertEquals(37000.0, t.last);
        assertEquals(1700000000000L, t.timestamp);
    }

    @Test
    void testOrderWithNullFee() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", "123");
        data.put("fee", null);
        data.put("trades", null);
        Order o = new Order(data);
        assertEquals("123", o.id);
        assertNull(o.fee);
        assertNull(o.trades);
    }

    @Test
    void testOrderWithEmptyTrades() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", "123");
        data.put("trades", new ArrayList<>());
        Order o = new Order(data);
        assertNotNull(o.trades);
        assertTrue(o.trades.isEmpty());
    }

    @Test
    void testOrderBookWithEmptyArrays() {
        Map<String, Object> data = new HashMap<>();
        data.put("bids", new ArrayList<>());
        data.put("asks", new ArrayList<>());
        OrderBook ob = new OrderBook(data);
        assertNotNull(ob.bids);
        assertNotNull(ob.asks);
        assertTrue(ob.bids.isEmpty());
        assertTrue(ob.asks.isEmpty());
    }

    @Test
    void testOrderBookWithNullEntries() {
        Map<String, Object> data = new HashMap<>();
        data.put("bids", null);
        data.put("asks", null);
        OrderBook ob = new OrderBook(data);
        assertNotNull(ob.bids); // should default to empty list
        assertNotNull(ob.asks);
    }

    @Test
    void testOHLCVWithShortArray() {
        // Array shorter than expected
        List<Object> data = List.of(1700000000000L, 37000.0);
        OHLCV c = new OHLCV(data);
        assertEquals(1700000000000L, c.timestamp);
        assertEquals(37000.0, c.open);
        assertNull(c.high);
        assertNull(c.low);
        assertNull(c.close);
        assertNull(c.volume);
    }

    @Test
    void testOHLCVWithEmptyArray() {
        OHLCV c = new OHLCV(new ArrayList<>());
        assertNull(c.timestamp);
        assertNull(c.open);
    }

    @Test
    void testMarketWithMissingNestedObjects() {
        Map<String, Object> data = new HashMap<>();
        data.put("symbol", "BTC/USDT");
        // precision, limits, marginModes all missing
        MarketInterface m = new MarketInterface(data);
        assertEquals("BTC/USDT", m.symbol);
        assertNull(m.precision);
        assertNull(m.limits);
        assertNull(m.marginModes);
    }

    @Test
    void testCurrencyWithEmptyNetworks() {
        Map<String, Object> data = new HashMap<>();
        data.put("code", "BTC");
        data.put("networks", new HashMap<>());
        CurrencyInterface c = new CurrencyInterface(data);
        assertNotNull(c.networks);
        assertTrue(c.networks.isEmpty());
    }

    @Test
    void testBalancesWithMissingFreeUsedTotal() {
        Map<String, Object> data = new HashMap<>();
        data.put("info", Map.of("raw", "data"));
        // No free/used/total maps
        Balances b = new Balances(data);
        assertNotNull(b.free);
        assertNotNull(b.used);
        assertNotNull(b.total);
        assertTrue(b.free.isEmpty());
    }

    @Test
    void testTickersWithInfoKey() {
        Map<String, Object> data = new HashMap<>();
        data.put("info", Map.of("raw", "data"));
        data.put("BTC/USDT", Map.of("symbol", "BTC/USDT", "last", 37000.0));
        Tickers t = new Tickers(data);
        assertEquals(1, t.tickers.size()); // info should not be in tickers map
        assertNotNull(t.get("BTC/USDT"));
    }

    @Test
    void testLimitsWithPartialNested() {
        Map<String, Object> data = new HashMap<>();
        data.put("amount", Map.of("min", 0.001));
        // cost, leverage, price, market all missing
        Limits l = new Limits(data);
        assertNotNull(l.amount);
        assertEquals(0.001, l.amount.min);
        assertNull(l.amount.max); // max missing from amount sub-map
        assertNull(l.cost);
        assertNull(l.leverage);
    }

    @Test
    void testTradeWithExtraUnknownFields() {
        // API may return extra fields not in our type
        Map<String, Object> data = new HashMap<>();
        data.put("id", "t1");
        data.put("price", 100.0);
        data.put("unknownField", "should not crash");
        data.put("anotherExtra", 42);
        Trade t = new Trade(data);
        assertEquals("t1", t.id);
        assertEquals(100.0, t.price);
        // Should not throw
    }
}
