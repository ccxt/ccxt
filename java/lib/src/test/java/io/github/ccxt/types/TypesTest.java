package io.github.ccxt.types;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import java.util.*;

class TypesTest {

    // ==========================================
    // TypeHelper
    // ==========================================

    @Test
    void testTypeHelperSafeFloat() {
        Map<String, Object> data = Map.of("price", 42.5, "count", 10);
        assertEquals(42.5, TypeHelper.safeFloat(data, "price"));
        assertEquals(10.0, TypeHelper.safeFloat(data, "count"));
        assertNull(TypeHelper.safeFloat(data, "missing"));
    }

    @Test
    void testTypeHelperSafeString() {
        Map<String, Object> data = Map.of("name", "BTC/USDT");
        assertEquals("BTC/USDT", TypeHelper.safeString(data, "name"));
        assertNull(TypeHelper.safeString(data, "missing"));
    }

    @Test
    void testTypeHelperSafeInteger() {
        Map<String, Object> data = Map.of("timestamp", 1700000000000L);
        assertEquals(1700000000000L, TypeHelper.safeInteger(data, "timestamp"));
        assertNull(TypeHelper.safeInteger(data, "missing"));
    }

    @Test
    void testTypeHelperSafeBool() {
        Map<String, Object> data = new HashMap<>();
        data.put("active", true);
        data.put("missing", null);
        assertEquals(true, TypeHelper.safeBool(data, "active"));
        assertNull(TypeHelper.safeBool(data, "missing"));
    }

    @Test
    void testTypeHelperGetInfo() {
        Map<String, Object> inner = Map.of("raw", "data");
        Map<String, Object> data = new HashMap<>();
        data.put("info", inner);
        data.put("symbol", "BTC/USDT");
        Map<String, Object> info = TypeHelper.getInfo(data);
        assertNotNull(info);
        assertEquals("data", info.get("raw"));
    }

    // ==========================================
    // Building block types
    // ==========================================

    @Test
    void testMinMax() {
        Map<String, Object> data = new HashMap<>();
        data.put("min", 0.001);
        data.put("max", 1000.0);
        MinMax mm = new MinMax(data);
        assertEquals(0.001, mm.min);
        assertEquals(1000.0, mm.max);
    }

    @Test
    void testMinMaxNulls() {
        Map<String, Object> data = new HashMap<>();
        MinMax mm = new MinMax(data);
        assertNull(mm.min);
        assertNull(mm.max);
    }

    @Test
    void testPrecision() {
        Map<String, Object> data = new HashMap<>();
        data.put("amount", 8);
        data.put("price", 2);
        Precision p = new Precision(data);
        assertEquals(8.0, p.amount);
        assertEquals(2.0, p.price);
    }

    @Test
    void testFee() {
        Map<String, Object> data = new HashMap<>();
        data.put("rate", 0.001);
        data.put("cost", 0.5);
        data.put("currency", "USDT");
        Fee f = new Fee(data);
        assertEquals(0.001, f.rate);
        assertEquals(0.5, f.cost);
        assertEquals("USDT", f.currency);
    }

    @Test
    void testLimits() {
        Map<String, Object> data = new HashMap<>();
        data.put("amount", Map.of("min", 0.001, "max", 1000.0));
        data.put("price", Map.of("min", 0.01, "max", 100000.0));
        Limits l = new Limits(data);
        assertNotNull(l.amount);
        assertEquals(0.001, l.amount.min);
        assertEquals(1000.0, l.amount.max);
        assertNotNull(l.price);
        assertNull(l.cost);
        assertNull(l.leverage);
    }

    // ==========================================
    // Core types
    // ==========================================

    @Test
    void testTicker() {
        Map<String, Object> data = new HashMap<>();
        data.put("symbol", "BTC/USDT");
        data.put("timestamp", 1700000000000L);
        data.put("datetime", "2023-11-14T22:13:20.000Z");
        data.put("high", 37500.0);
        data.put("low", 36000.0);
        data.put("bid", 37000.0);
        data.put("ask", 37050.0);
        data.put("last", 37025.0);
        data.put("baseVolume", 1234.5);
        data.put("quoteVolume", 45678900.0);
        data.put("info", Map.of("raw", "response"));
        Ticker t = new Ticker(data);
        assertEquals("BTC/USDT", t.symbol);
        assertEquals(1700000000000L, t.timestamp);
        assertEquals(37500.0, t.high);
        assertEquals(36000.0, t.low);
        assertEquals(37000.0, t.bid);
        assertEquals(37050.0, t.ask);
        assertEquals(37025.0, t.last);
        assertEquals(1234.5, t.baseVolume);
        assertNotNull(t.info);
        assertEquals("response", t.info.get("raw"));
    }

    @Test
    void testTickerNulls() {
        Map<String, Object> data = new HashMap<>();
        data.put("symbol", "ETH/USDT");
        Ticker t = new Ticker(data);
        assertEquals("ETH/USDT", t.symbol);
        assertNull(t.timestamp);
        assertNull(t.high);
        assertNull(t.low);
        assertNull(t.bid);
        assertNull(t.ask);
        assertNull(t.info);
    }

    @Test
    void testTrade() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", "123456");
        data.put("symbol", "BTC/USDT");
        data.put("side", "buy");
        data.put("price", 37000.0);
        data.put("amount", 0.5);
        data.put("cost", 18500.0);
        data.put("timestamp", 1700000000000L);
        data.put("fee", Map.of("cost", 18.5, "currency", "USDT"));
        data.put("info", Map.of("raw", true));
        Trade trade = new Trade(data);
        assertEquals("123456", trade.id);
        assertEquals("BTC/USDT", trade.symbol);
        assertEquals("buy", trade.side);
        assertEquals(37000.0, trade.price);
        assertEquals(0.5, trade.amount);
        assertEquals(18500.0, trade.cost);
        assertNotNull(trade.fee);
        assertEquals(18.5, trade.fee.cost);
        assertEquals("USDT", trade.fee.currency);
    }

    @Test
    void testOrder() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", "order-1");
        data.put("clientOrderId", "client-1");
        data.put("symbol", "BTC/USDT");
        data.put("type", "limit");
        data.put("side", "buy");
        data.put("price", 37000.0);
        data.put("amount", 1.0);
        data.put("filled", 0.5);
        data.put("remaining", 0.5);
        data.put("status", "open");
        data.put("reduceOnly", false);
        data.put("postOnly", true);
        data.put("info", Map.of());
        Order o = new Order(data);
        assertEquals("order-1", o.id);
        assertEquals("client-1", o.clientOrderId);
        assertEquals("limit", o.type);
        assertEquals("buy", o.side);
        assertEquals(37000.0, o.price);
        assertEquals(1.0, o.amount);
        assertEquals(0.5, o.filled);
        assertEquals(0.5, o.remaining);
        assertEquals("open", o.status);
        assertEquals(false, o.reduceOnly);
        assertEquals(true, o.postOnly);
    }

    @Test
    void testOrderWithTrades() {
        List<Map<String, Object>> trades = List.of(
            new HashMap<>(Map.of("id", "t1", "price", 37000.0, "amount", 0.3)),
            new HashMap<>(Map.of("id", "t2", "price", 37001.0, "amount", 0.2))
        );
        Map<String, Object> data = new HashMap<>();
        data.put("id", "order-1");
        data.put("trades", trades);
        Order o = new Order(data);
        assertNotNull(o.trades);
        assertEquals(2, o.trades.size());
        assertEquals("t1", o.trades.get(0).id);
        assertEquals("t2", o.trades.get(1).id);
    }

    @Test
    void testOrderBook() {
        List<List<Object>> bids = List.of(
            List.of(37000.0, 1.5),
            List.of(36999.0, 2.0)
        );
        List<List<Object>> asks = List.of(
            List.of(37001.0, 0.8),
            List.of(37002.0, 1.2)
        );
        Map<String, Object> data = new HashMap<>();
        data.put("bids", bids);
        data.put("asks", asks);
        data.put("symbol", "BTC/USDT");
        data.put("timestamp", 1700000000000L);
        OrderBook ob = new OrderBook(data);
        assertEquals("BTC/USDT", ob.symbol);
        assertEquals(2, ob.bids.size());
        assertEquals(2, ob.asks.size());
        assertEquals(37000.0, ob.bids.get(0).get(0));
        assertEquals(1.5, ob.bids.get(0).get(1));
        assertEquals(37001.0, ob.asks.get(0).get(0));
    }

    @Test
    void testOHLCV() {
        List<Object> data = List.of(1700000000000L, 37000.0, 37500.0, 36500.0, 37200.0, 1234.5);
        OHLCV ohlcv = new OHLCV(data);
        assertEquals(1700000000000L, ohlcv.timestamp);
        assertEquals(37000.0, ohlcv.open);
        assertEquals(37500.0, ohlcv.high);
        assertEquals(36500.0, ohlcv.low);
        assertEquals(37200.0, ohlcv.close);
        assertEquals(1234.5, ohlcv.volume);
    }

    @Test
    void testMarketInterface() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", "BTCUSDT");
        data.put("symbol", "BTC/USDT");
        data.put("base", "BTC");
        data.put("quote", "USDT");
        data.put("active", true);
        data.put("type", "spot");
        data.put("spot", true);
        data.put("swap", false);
        data.put("precision", Map.of("amount", 8, "price", 2));
        data.put("limits", Map.of("amount", Map.of("min", 0.001)));
        data.put("info", Map.of("raw", "data"));
        MarketInterface m = new MarketInterface(data);
        assertEquals("BTCUSDT", m.id);
        assertEquals("BTC/USDT", m.symbol);
        assertEquals("BTC", m.base);
        assertEquals("USDT", m.quote);
        assertEquals(true, m.active);
        assertEquals("spot", m.type);
        assertEquals(true, m.spot);
        assertEquals(false, m.swap);
        assertNotNull(m.precision);
        assertEquals(8.0, m.precision.amount);
        assertNotNull(m.limits);
        assertNotNull(m.limits.amount);
        assertEquals(0.001, m.limits.amount.min);
    }

    @Test
    void testCurrencyInterface() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", "btc");
        data.put("code", "BTC");
        data.put("name", "Bitcoin");
        data.put("active", true);
        data.put("precision", 8);
        data.put("fee", 0.0005);
        data.put("networks", Map.of("BTC", Map.of("id", "btc", "network", "BTC", "name", "Bitcoin", "active", true)));
        data.put("limits", Map.of("amount", Map.of("min", 0.00001)));
        data.put("info", Map.of());
        CurrencyInterface c = new CurrencyInterface(data);
        assertEquals("btc", c.id);
        assertEquals("BTC", c.code);
        assertEquals("Bitcoin", c.name);
        assertEquals(true, c.active);
        assertEquals(8.0, c.precision);
        assertNotNull(c.networks);
        assertEquals(1, c.networks.size());
        assertNotNull(c.networks.get("BTC"));
        assertEquals("Bitcoin", c.networks.get("BTC").name);
    }

    // ==========================================
    // Extended types
    // ==========================================

    @Test
    void testPosition() {
        Map<String, Object> data = new HashMap<>();
        data.put("symbol", "BTC/USDT:USDT");
        data.put("side", "long");
        data.put("contracts", 10.0);
        data.put("leverage", 5.0);
        data.put("entryPrice", 37000.0);
        data.put("unrealizedPnl", 500.0);
        data.put("info", Map.of());
        Position p = new Position(data);
        assertEquals("BTC/USDT:USDT", p.symbol);
        assertEquals("long", p.side);
        assertEquals(10.0, p.contracts);
        assertEquals(5.0, p.leverage);
        assertEquals(37000.0, p.entryPrice);
        assertEquals(500.0, p.unrealizedPnl);
    }

    @Test
    void testFundingRate() {
        Map<String, Object> data = new HashMap<>();
        data.put("symbol", "BTC/USDT:USDT");
        data.put("fundingRate", 0.0001);
        data.put("timestamp", 1700000000000L);
        data.put("nextFundingTimestamp", 1700028800000L);
        data.put("info", Map.of());
        FundingRate fr = new FundingRate(data);
        assertEquals("BTC/USDT:USDT", fr.symbol);
        assertEquals(0.0001, fr.fundingRate);
        assertEquals(1700000000000L, fr.timestamp);
        assertEquals(1700028800000L, fr.nextFundingTimestamp);
    }

    @Test
    void testTransaction() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", "tx-123");
        data.put("txid", "0xabc");
        data.put("type", "deposit");
        data.put("currency", "BTC");
        data.put("amount", 0.5);
        data.put("status", "ok");
        data.put("info", Map.of());
        Transaction tx = new Transaction(data);
        assertEquals("tx-123", tx.id);
        assertEquals("0xabc", tx.txid);
        assertEquals("deposit", tx.type);
        assertEquals("BTC", tx.currency);
        assertEquals(0.5, tx.amount);
        assertEquals("ok", tx.status);
    }

    // ==========================================
    // Collection wrappers
    // ==========================================

    @Test
    void testTickers() {
        Map<String, Object> data = new HashMap<>();
        data.put("BTC/USDT", Map.of("symbol", "BTC/USDT", "last", 37000.0));
        data.put("ETH/USDT", Map.of("symbol", "ETH/USDT", "last", 2000.0));
        Tickers tickers = new Tickers(data);
        assertEquals(2, tickers.tickers.size());
        assertEquals("BTC/USDT", tickers.get("BTC/USDT").symbol);
        assertEquals(37000.0, tickers.get("BTC/USDT").last);
        assertEquals(2000.0, tickers.get("ETH/USDT").last);
    }

    @Test
    void testTickersNotFound() {
        Map<String, Object> data = new HashMap<>();
        Tickers tickers = new Tickers(data);
        assertThrows(java.util.NoSuchElementException.class, () -> tickers.get("MISSING"));
    }

    @Test
    void testBalances() {
        Map<String, Object> data = new HashMap<>();
        data.put("free", Map.of("BTC", 1.5, "USDT", 5000.0));
        data.put("used", Map.of("BTC", 0.5, "USDT", 1000.0));
        data.put("total", Map.of("BTC", 2.0, "USDT", 6000.0));
        data.put("BTC", Map.of("free", 1.5, "used", 0.5, "total", 2.0));
        data.put("USDT", Map.of("free", 5000.0, "used", 1000.0, "total", 6000.0));
        data.put("info", Map.of());
        Balances b = new Balances(data);
        assertEquals(1.5, b.free.get("BTC"));
        assertEquals(6000.0, b.total.get("USDT"));
        assertNotNull(b.get("BTC"));
        assertEquals(1.5, b.get("BTC").free);
        assertEquals(0.5, b.get("BTC").used);
        assertEquals(2.0, b.get("BTC").total);
    }

    @Test
    void testCurrencies() {
        Map<String, Object> data = new HashMap<>();
        data.put("BTC", Map.of("id", "btc", "code", "BTC", "name", "Bitcoin"));
        data.put("ETH", Map.of("id", "eth", "code", "ETH", "name", "Ethereum"));
        Currencies currencies = new Currencies(data);
        assertEquals(2, currencies.currencies.size());
        assertEquals("Bitcoin", currencies.get("BTC").name);
        assertEquals("Ethereum", currencies.get("ETH").name);
    }
}
