package io.github.ccxt.types;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.Test;

/**
 * JN-14 conversion-fidelity harness: every nominal type in this package is built by converting an
 * untyped {@code Object raw} into a typed object, so the conversion itself is part of the public
 * contract. These tests pin the edge cases that decide whether the strong types can be trusted:
 *
 *   - a missing field, an explicit null, an empty string and a wrong-typed value must yield
 *     {@code null} — never 0 / false / "" and never an exception
 *   - a numeric string where a number is expected must be coerced exactly the way the TS
 *     accessors coerce it (CCXT exchange payloads carry prices as strings all the time)
 *   - an absent nested map / list element must stay absent instead of fabricating an object
 *
 * The TS source of truth is ts/src/base/types.ts plus the accessors in
 * ts/src/base/functions/type.ts (safeFloat / safeInteger / safeString / safeValue and the
 * index-based tuple path).
 */
class TypeConversionFidelityTest {

    private static Map<String, Object> map(Object... kv) {
        LinkedHashMap<String, Object> out = new LinkedHashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) {
            out.put((String) kv[i], kv[i + 1]);
        }
        return out;
    }

    private static Map<String, Object> empty() {
        return new LinkedHashMap<>();
    }

    // ------------------------------------------------------------------ scalars

    @Test
    void missingFieldsAreNullNotDefaults() {
        Ticker ticker = new Ticker(empty());
        assertNull(ticker.symbol);
        assertNull(ticker.high);
        assertNull(ticker.timestamp);
        assertNull(ticker.percentage);
        assertNull(ticker.info);

        Order order = new Order(empty());
        assertNull(order.id);
        assertNull(order.price);
        assertNull(order.timestamp);
        assertNull(order.reduceOnly);   // Boolean field: null, not false
        assertNull(order.fee);          // nested object: null, not an empty Fee
        assertNull(order.trades);       // array: null, not an empty list
    }

    @Test
    void explicitNullsAndEmptyStringsAreTreatedAsMissing() {
        Ticker ticker = new Ticker(map(
                "symbol", null, "high", null, "timestamp", null, "percentage", null, "info", null));
        assertNull(ticker.symbol);
        assertNull(ticker.high);
        assertNull(ticker.timestamp);

        // TS prop() treats '' exactly like a missing key (see ts/src/base/functions/type.ts)
        assertNull(new Ticker(map("symbol", "")).symbol);
        assertNull(new Ticker(map("high", "")).high);
    }

    @Test
    void numericStringsAreCoerced() {
        Ticker ticker = new Ticker(map(
                "timestamp", "1700000000000", "high", "65000.5", "low", 64000, "askVolume", "1.5"));
        assertEquals(1700000000000L, ticker.timestamp);
        assertEquals(65000.5, ticker.high);
        assertEquals(64000.0, ticker.low);
        assertEquals(1.5, ticker.askVolume);
    }

    @Test
    void wrongTypedValuesBecomeNullNotGarbage() {
        assertNull(new Ticker(map("high", "abc")).high);
        assertNull(new Ticker(map("high", true)).high);
        assertNull(new Ticker(map("high", map("nested", 1))).high);
        assertNull(new Order(map("reduceOnly", "true")).reduceOnly);   // TS safeBool keeps only real booleans
        assertNull(new Ticker(map("info", "not-a-map")).info);
        assertTrue(new Order(map("reduceOnly", true)).reduceOnly);
    }

    // ------------------------------------------------------------------ tuples

    @Test
    void ohlcvTupleKeepsPositionsAndNulls() {
        OHLCV candle = new OHLCV(Arrays.asList(1700000000000L, "1.5", 2, 3.0, null, "abc"));
        assertEquals(1700000000000L, candle.timestamp);
        assertEquals(1.5, candle.open);
        assertEquals(2.0, candle.high);
        assertEquals(3.0, candle.low);
        assertNull(candle.close);
        assertNull(candle.volume);

        OHLCV shortCandle = new OHLCV(Arrays.asList(1, 2));
        assertEquals(1L, shortCandle.timestamp);
        assertEquals(2.0, shortCandle.open);
        assertNull(shortCandle.high);
        assertNull(shortCandle.close);

        assertNull(new OHLCV(null).timestamp);
        assertNull(new OHLCV(new ArrayList<>()).timestamp);
    }

    @Test
    void ohlcvTimestampMatchesTsMathTrunc() {
        // TS: Math.trunc (Number ("...")) — a fractional numeric string still yields the timestamp,
        // truncated toward zero, and never a saturated Long.
        assertEquals(1700000000000L, new OHLCV(Arrays.asList("1700000000000.5")).timestamp);
        assertEquals(1L, new OHLCV(Arrays.asList("1.9")).timestamp);
        assertEquals(-1L, new OHLCV(Arrays.asList(-1.9)).timestamp);
        assertEquals(1700000000000L, new OHLCV(Arrays.asList(1700000000000.5)).timestamp);
        assertNull(new OHLCV(Arrays.asList("not-a-number")).timestamp);
        assertNull(new OHLCV(Arrays.asList(Double.POSITIVE_INFINITY)).timestamp);
        assertNull(new OHLCV(Arrays.asList(1e20)).timestamp);   // out of Long range: absent, not Long.MAX_VALUE
    }

    // ------------------------------------------------------------------ nested objects

    @Test
    void nestedObjectsAreNullSafe() {
        MarketInterface market = new MarketInterface(empty());
        assertNull(market.precision);
        assertNull(market.limits);
        assertNull(market.marginModes);
        assertNull(market.outcomes);

        MarketInterface withNulls = new MarketInterface(map("precision", null, "limits", null));
        assertNull(withNulls.precision);
        assertNull(withNulls.limits);

        // a wrong-shaped nested value is absent, not a ClassCastException
        assertNull(new MarketInterface(map("precision", "0.1")).precision);
        assertNull(new Order(map("fee", "0.1")).fee);
        assertNull(new LedgerEntry(map("fee", 1)).fee);

        // empty nested maps still produce an object whose members are null
        MarketInterface emptyNested = new MarketInterface(map("precision", empty()));
        assertNotNull(emptyNested.precision);
        assertNull(emptyNested.precision.price);
    }

    @Test
    void containsKeyStyleLimitTypesSurviveNullRaw() {
        assertNull(new Limits(null).amount);
        assertNull(new CurrencyLimits(null).amount);
        assertNull(new NetworkLimits(null).deposit);

        Limits limits = new Limits(map("amount", map("min", 0.001, "max", "1000")));
        assertNotNull(limits.amount);
        assertEquals(0.001, limits.amount.min);
        assertEquals(1000.0, limits.amount.max);
        assertNull(limits.price);

        // empty-string / non-map values are absent, not a ClassCastException
        assertNull(new Limits(map("amount", "")).amount);
        assertNull(new Limits(map("amount", "x")).amount);
    }

    @Test
    void arrayElementsKeepTheirPositions() {
        Order order = new Order(map("trades", Arrays.asList(
                map("id", "t1", "price", "64000"),
                map("id", "t2"))));
        assertEquals(2, order.trades.size());
        assertEquals("t1", order.trades.get(0).id);
        assertEquals(64000.0, order.trades.get(0).price);
        assertEquals("t2", order.trades.get(1).id);
        assertNull(order.trades.get(1).amount);

        assertEquals(0, new Order(map("trades", new ArrayList<>())).trades.size());

        // a null or wrong-shaped element stays null instead of becoming an all-null object
        List<Trade> withNull = new Order(map("trades", Arrays.asList((Object) null))).trades;
        assertEquals(1, withNull.size());
        assertNull(withNull.get(0));
        List<Trade> withJunk = new Order(map("trades", Arrays.asList("junk"))).trades;
        assertNull(withJunk.get(0));

        MarketInterface market = new MarketInterface(map("outcomes", Arrays.asList(map("outcome", "o1"), null)));
        assertEquals(2, market.outcomes.size());
        assertEquals("o1", market.outcomes.get(0).outcome);
        assertNull(market.outcomes.get(1));
    }

    // ------------------------------------------------------------------ dictionary wrappers

    @Test
    void dictionaryWrappersSkipInfoAndSurviveNull() {
        Tickers tickers = new Tickers(map(
                "BTC/USDT", map("symbol", "BTC/USDT", "last", "64000"),
                "info", map("raw", 1)));
        assertEquals(1, tickers.tickers.size());
        assertEquals("BTC/USDT", tickers.get("BTC/USDT").symbol);
        assertEquals(64000.0, tickers.get("BTC/USDT").last);
        assertEquals(map("raw", 1), tickers.info);
        assertFalse(tickers.tickers.containsKey("info"));

        Currencies currencies = new Currencies(map("BTC", map("code", "BTC"), "info", map("raw", 1)));
        assertEquals(1, currencies.currencies.size());
        assertEquals("BTC", currencies.get("BTC").code);

        // a null raw map yields an empty wrapper, not an NPE
        assertEquals(0, new Tickers(null).tickers.size());
        assertEquals(0, new Currencies(null).currencies.size());
        assertEquals(0, new FundingRates(null).rates.size());
        assertEquals(0, new OrderBooks(null).orderBooks.size());
        assertEquals(0, new LeverageTiers(null).tiers.size());

        // a wrong-shaped entry keeps the key with a null (or null) value instead of throwing
        Tickers junk = new Tickers(map("BTC/USDT", "junk", "ETH/USDT", null));
        assertNull(junk.tickers.get("BTC/USDT"));
        assertNull(junk.tickers.get("ETH/USDT"));
        assertThrows(NoSuchElementException.class, () -> junk.get("BTC/USDT"));
    }

    @Test
    void balancesSurviveNullAndNumericStrings() {
        assertEquals(0, new Balances(null).free.size());

        Balances legacy = new Balances(map(
                "free", map("BTC", "1.5"), "used", map("BTC", 0.0), "total", map("BTC", "1.5"),
                "timestamp", "1700000000000"));
        assertEquals(1.5, legacy.free.get("BTC"));
        assertEquals(0.0, legacy.used.get("BTC"));
        assertEquals(1.5, legacy.total.get("BTC"));
        assertEquals(1700000000000L, legacy.timestamp);

        // the modern row shape still lands in balances
        Balances modern = new Balances(map("BTC", map("free", 1.5, "used", 0.0, "total", 1.5)));
        assertEquals(1, modern.balances.size());
        assertEquals(1.5, modern.balances.get("BTC").free);
    }

    // ------------------------------------------------------------------ order book

    @Test
    void orderBookParsesLevelsAndSurvivesJunk() {
        OrderBook book = new OrderBook(map(
                "bids", Arrays.asList(Arrays.asList("64000.5", "1.5"), Arrays.asList(64000, 2)),
                "asks", Arrays.asList(Arrays.asList("64001", 1)),
                "symbol", "BTC/USDT", "timestamp", "1700000000000"));
        assertEquals(64000.5, book.bids.get(0).get(0));
        assertEquals(1.5, book.bids.get(0).get(1));
        assertEquals(64000.0, book.bids.get(1).get(0));
        assertEquals("BTC/USDT", book.symbol);
        assertEquals(1700000000000L, book.timestamp);

        // missing / null / wrong-shaped sides degrade to "no levels", never to an exception
        assertEquals(0, new OrderBook(map("symbol", "BTC/USDT")).bids.size());
        assertEquals(0, new OrderBook(null).bids.size());
        assertEquals(0, new OrderBook(map("bids", "junk")).bids.size());

        List<List<Double>> withNullRow = new OrderBook(map("bids", Arrays.asList((Object) null))).bids;
        assertEquals(1, withNullRow.size());
        assertNull(withNullRow.get(0));
    }
}
