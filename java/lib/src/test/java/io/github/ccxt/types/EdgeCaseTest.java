package io.github.ccxt.types;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import io.github.ccxt.Exchange;

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

    // ==========================================
    // Balance family — absent means null, never 0
    //
    // CCXT leaves free/used/total undefined when the exchange omits them.
    // A defaulted 0.0 would be a LIE about the user's funds, so every one of
    // these conversions must keep absence as a null Double.
    // ==========================================

    @Test
    void testBalanceMissingFieldsStayNull() {
        Map<String, Object> data = new HashMap<>();
        data.put("free", 1.5);
        data.put("total", 2.0);
        // `used` and `debt` omitted by the exchange
        Balance b = new Balance(data);
        assertEquals(1.5, b.free);
        assertEquals(2.0, b.total);
        assertNull(b.used);
        assertNull(b.debt);
    }

    @Test
    void testBalanceExplicitNullIsAbsence() {
        Map<String, Object> data = new HashMap<>();
        data.put("free", null);
        data.put("used", 0.25);
        Balance b = new Balance(data);
        assertNull(b.free);
        assertEquals(0.25, b.used);
    }

    @Test
    void testBalanceEmptyMapStaysNull() {
        Balance b = new Balance(new HashMap<>());
        assertNull(b.free);
        assertNull(b.used);
        assertNull(b.total);
        assertNull(b.debt);
    }

    @Test
    void testBalancesNestedRowNullSurvival() {
        // the full CCXT shape: currency-keyed rows plus parallel free/used/total maps.
        // BTC omits `used` — it must stay null in the row AND in the projections, and
        // the used projection must not grow a fabricated 0 entry for BTC.
        Map<String, Object> btc = new HashMap<>();
        btc.put("free", 1.5);
        btc.put("total", 2.0);
        Map<String, Object> raw = new HashMap<>();
        raw.put("BTC", btc);
        raw.put("free", Map.of("BTC", 1.5));
        raw.put("used", new HashMap<String, Object>());
        raw.put("total", Map.of("BTC", 2.0));
        raw.put("info", Map.of("raw", "response"));
        Balances b = new Balances(raw);
        assertNotNull(b.get("BTC"));
        assertEquals(1.5, b.get("BTC").free);
        assertEquals(2.0, b.get("BTC").total);
        assertNull(b.get("BTC").used);
        assertEquals(1.5, b.free.get("BTC"));
        assertEquals(2.0, b.total.get("BTC"));
        assertFalse(b.used.containsKey("BTC"));
        assertNull(b.used.get("BTC"));
        // the currency rows must not leak into the projection maps
        assertEquals(1, b.free.size());
        assertNull(b.get("MISSING"));
    }

    @Test
    void testBalanceNullSurvivesSafeBalanceConversion() {
        // end-to-end: raw exchange dict -> safeBalance (base helper) -> Balances wrapper.
        // A row with only `free` cannot be completed from the other two, so used and
        // total must stay null — not 0.0.
        Map<String, Object> config = new HashMap<>();
        config.put("id", "sampleexchange");
        Exchange exchange = new Exchange(config);
        Map<String, Object> btc = new HashMap<>();
        btc.put("free", 1.5);
        Map<String, Object> raw = new HashMap<>();
        raw.put("BTC", btc);
        Object balanced = exchange.safeBalance(raw);
        Balances b = new Balances(balanced);
        assertEquals(1.5, b.get("BTC").free);
        assertNull(b.get("BTC").used);
        assertNull(b.get("BTC").total);
        assertNull(b.get("BTC").debt);
        assertEquals(1.5, b.free.get("BTC"));
        assertFalse(b.used.containsKey("BTC"));
        assertFalse(b.total.containsKey("BTC"));
    }

    @Test
    void testBalanceAccountMissingFieldsStayNull() {
        BalanceAccount empty = new BalanceAccount(new HashMap<>());
        assertNull(empty.free);
        assertNull(empty.used);
        assertNull(empty.total);
        assertNull(empty.debt);
        assertNull(empty.frozen);
        Map<String, Object> data = new HashMap<>();
        data.put("free", "1.5");
        data.put("total", "2");
        BalanceAccount ba = new BalanceAccount(data);
        assertEquals("1.5", ba.free);
        assertEquals("2", ba.total);
        assertNull(ba.used); // absent stays absent — never "" or "0"
        assertNull(ba.frozen);
    }

    @Test
    void testAccountMissingFieldsStayNull() {
        Account empty = new Account(new HashMap<>());
        assertNull(empty.id);
        assertNull(empty.type);
        assertNull(empty.code);
        Map<String, Object> data = new HashMap<>();
        data.put("id", "acc-1");
        Account a = new Account(data);
        assertEquals("acc-1", a.id);
        assertNull(a.type);
        assertNull(a.code);
    }

    @Test
    void testAccountsStorageSurfaceIsTyped() {
        // pins the declared types of the BaseExchange account/balance caches:
        // List<Object> accounts, Map<String, Object> accountsById / balance.
        Map<String, Object> config = new HashMap<>();
        config.put("id", "sampleexchange");
        Exchange exchange = new Exchange(config);
        assertNull(exchange.accounts); // unset until loadAccounts()
        exchange.accounts = new ArrayList<>();
        exchange.accounts.add(Map.of("id", "acc-1", "type", "spot", "code", "USD", "info", Map.of()));
        exchange.accountsById = new HashMap<>();
        exchange.accountsById.put("acc-1", exchange.accounts.get(0));
        assertEquals(1, exchange.accounts.size());
        assertEquals("USD", ((Map<?, ?>) exchange.accountsById.get("acc-1")).get("code"));
        exchange.balance = new HashMap<>();
        exchange.balance.put("spot", new HashMap<String, Object>());
        assertTrue(exchange.balance.containsKey("spot"));
    }
}
