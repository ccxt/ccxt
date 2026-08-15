package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Conformance tests for {@link ArrayCache} against {@code ts/src/base/ws/Cache.ts},
 * the source of truth. Scenarios and expected values are ported from the shared
 * harness {@code ts/src/pro/test/base/test.cache.ts}, which every other language port
 * runs but Java is not yet wired into (javaTranspiler.ts:3077 is commented out).
 *
 * <p>Each test names the Cache.ts lines it pins so a future divergence is traceable.
 */
class ArrayCacheTest {

    // ─── helpers ───

    private static Map<String, Object> item(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < kv.length; i += 2) {
            m.put((String) kv[i], kv[i + 1]);
        }
        return m;
    }

    /** A mutable OHLCV row, the production shape: a List whose first element is the timestamp. */
    private static List<Object> row(Object... values) {
        return new ArrayList<>(Arrays.asList(values));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object o) {
        return (Map<String, Object>) o;
    }

    /** Reads field {@code f} of the element at {@code index}. */
    private static Object at(ArrayCache cache, int index, String f) {
        return asMap(cache.get(index)).get(f);
    }

    /** The ordered list of {@code field} values, for asserting array order. */
    private static List<Object> order(ArrayCache cache, String field) {
        List<Object> out = new ArrayList<>();
        for (Object o : cache.snapshot()) {
            out.add(asMap(o).get(field));
        }
        return out;
    }

    // ─── ArrayCache: sizing and eviction ───

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
    @DisplayName("maxSize=1 keeps only the newest element")
    void testMaxSizeOne() {
        var cache = new ArrayCache(1);
        cache.append("a");
        cache.append("b");
        assertEquals(1, cache.size());
        assertEquals("b", cache.get(0));
    }

    @Test
    @DisplayName("D8: maxSize<=0 is unbounded, not coerced to 1000 (Cache.ts:88-89)")
    void testMaxSizeZeroIsUnbounded() {
        // TS guards eviction with `if (this.maxSize && ...)`, so 0 — the value produced by
        // .filter() copy-construction — means "never evict".
        var zero = new ArrayCache(0);
        for (int i = 0; i < 1200; i++) {
            zero.append(item("symbol", "BTC/USDT", "i", i));
        }
        assertEquals(1200, zero.size(), "maxSize=0 must not cap the cache at 1000");

        var noArg = new ArrayCache();
        for (int i = 0; i < 1200; i++) {
            noArg.append(item("symbol", "BTC/USDT", "i", i));
        }
        assertEquals(1200, noArg.size(), "no-arg construction must be unbounded");

        var byTs = new ArrayCache.ArrayCacheByTimestamp(0);
        for (int i = 0; i < 1200; i++) {
            byTs.append(row((long) i, 1.0));
        }
        assertEquals(1200, byTs.size());

        var byId = new ArrayCache.ArrayCacheBySymbolById(0);
        for (int i = 0; i < 1200; i++) {
            byId.append(item("symbol", "BTC/USDT", "id", String.valueOf(i)));
        }
        assertEquals(1200, byId.size());
    }

    // ─── getLimit: deferred reset, min semantics, nullability ───

    @Test
    @DisplayName("D3: getLimit defers the reset to the next append (Cache.ts:69,75,93-102)")
    void testNewUpdatesTracking() {
        var cache = new ArrayCache(100);
        cache.append(item("symbol", "BTC/USDT"));
        cache.append(item("symbol", "BTC/USDT"));
        cache.append(item("symbol", "ETH/USDT"));

        assertEquals(2, cache.getLimit("BTC/USDT", null).intValue());
        assertEquals(1, cache.getLimit("ETH/USDT", null).intValue());

        // getLimit only RAISES a reset flag; it does not zero the counter. With no intervening
        // append the second read must repeat the first. (Previously asserted 0 — a divergence.)
        assertEquals(2, cache.getLimit("BTC/USDT", null).intValue());

        // the deferred reset lands on the next append for that symbol
        cache.append(item("symbol", "BTC/USDT"));
        assertEquals(1, cache.getLimit("BTC/USDT", null).intValue());
    }

    @Test
    @DisplayName("D6: getLimit honours limit via min (Cache.ts:80-81)")
    void testGetLimitAppliesMin() {
        var cache = new ArrayCache.ArrayCacheBySymbolById();
        for (int i = 0; i < 3; i++) {
            cache.append(item("symbol", "BTC/USDT", "id", String.valueOf(i), "i", i));
        }
        assertEquals(3, cache.getLimit("BTC/USDT", 5).intValue(), "min(3,5)");
        assertEquals(2, cache.getLimit("BTC/USDT", 2).intValue(), "min(3,2)");
        assertEquals(3, cache.getLimit("BTC/USDT", 5).intValue(), "still deferred, so still 3");
    }

    @Test
    @DisplayName("D7: an unseen symbol returns the limit verbatim (Cache.ts:78-79)")
    void testGetLimitUnknownSymbolReturnsLimit() {
        var cache = new ArrayCache(100);
        assertEquals(50, cache.getLimit("BTC/USDT", 50).intValue());
        // undefined limit + unseen symbol is `undefined` in TS, i.e. null here — callers
        // funnel this into filterBySinceLimit, which null-checks before using it
        assertNull(cache.getLimit("BTC/USDT", null));

        cache.append(item("symbol", "BTC/USDT"));
        assertEquals(7, cache.getLimit("ETH/USDT", 7).intValue(), "other symbols stay unseen");

        // the all-symbols counter starts at 0, not undefined, so it never returns `limit`
        assertEquals(0, new ArrayCache(100).getLimit(null, 7).intValue());
    }

    @Test
    @DisplayName("getLimit(null, ...) reads the all-symbols counter (Cache.ts:67-69)")
    void testGetLimitAllSymbols() {
        var cache = new ArrayCache.ArrayCacheBySymbolById();
        for (int i = 0; i < 5; i++) {
            cache.append(item("symbol", "BTC/USDT", "id", String.valueOf(i), "i", i));
        }
        assertEquals(5, cache.getLimit(null, null).intValue());
    }

    @Test
    @DisplayName("per-symbol and all-symbols resets are independent (Cache.ts:93-102,207-219)")
    void testWatchAllAndWatchBySymbolAreIndependent() {
        var cache = new ArrayCache.ArrayCacheBySymbolById();
        cache.append(item("symbol", "BTC/USDT", "id", "one", "i", 1));
        cache.append(item("symbol", "ETH/USDT", "id", "two", "i", 1));

        assertEquals(2, cache.getLimit(null, 5).intValue());
        assertEquals(1, cache.getLimit("BTC/USDT", 5).intValue());

        cache.append(item("symbol", "BTC/USDT", "id", "one", "i", 2));
        cache.append(item("symbol", "ETH/USDT", "id", "two", "i", 2));

        assertEquals(1, cache.getLimit("BTC/USDT", 5).intValue());
        assertEquals(2, cache.getLimit(null, 5).intValue());

        cache.append(item("symbol", "ETH/USDT", "id", "two", "i", 3));
        cache.append(item("symbol", "ETH/USDT", "id", "three", "i", 3));

        assertEquals(2, cache.getLimit(null, 5).intValue());
        assertEquals(3, cache.size());
        assertEquals(List.of("one", "two", "three"), order(cache, "id"));
    }

    @Test
    @DisplayName("a repeated id counts once per window (Cache.ts:221-225)")
    void testDuplicateIdDoesNotInflateCount() {
        var cache = new ArrayCache.ArrayCacheBySymbolById();
        cache.append(item("symbol", "BTC/USDT", "id", "singleId", "i", 3));
        cache.append(item("symbol", "BTC/USDT", "id", "singleId", "i", 3));
        cache.append(item("symbol", "ETH/USDT", "id", "singleId", "i", 3));

        assertEquals(2, cache.size());
        assertEquals(1, cache.getLimit("BTC/USDT", 5).intValue(), "same id twice counts once");
        assertEquals(2, cache.getLimit(null, 5).intValue(), "same id under 2 symbols counts twice globally");
    }

    // ─── ArrayCacheByTimestamp ───

    @Test
    void testArrayCacheByTimestampUpdatesInPlace() {
        var cache = new ArrayCache.ArrayCacheByTimestamp(100);
        cache.append(item("timestamp", 1000L, "close", 50000.0));
        cache.append(item("timestamp", 1000L, "close", 51000.0));

        assertEquals(1, cache.size()); // should update in place, not add
        assertEquals(51000.0, asMap(cache.get(0)).get("close"));
    }

    @Test
    @DisplayName("D2: getLimit counts distinct timestamps on List rows (Cache.ts:134-140,163-164)")
    void testArrayCacheByTimestampGetLimitOnListRows() {
        // OHLCV rows are Lists, not Maps. The inherited symbol-keyed getLimit returned 0 here,
        // which made watchOHLCV re-emit the whole cache on every tick.
        var cache = new ArrayCache.ArrayCacheByTimestamp();
        cache.append(row(100L, 1.0, 2.0, 3.0));
        cache.append(row(200L, 5.0, 6.0, 7.0));

        assertEquals(2, cache.size());
        assertEquals(2, cache.getLimit(null, null).intValue());
        // the symbol argument is ignored by this variant — it must not fall back to 0
        assertEquals(2, cache.getLimit("BTC/USDT", null).intValue());
        assertTrue(cache.getLimit("BTC/USDT", null) > 0);
    }

    @Test
    @DisplayName("ByTimestamp: repeat timestamps count once and keep their position")
    void testArrayCacheByTimestampDistinctCounting() {
        var cache = new ArrayCache.ArrayCacheByTimestamp();
        cache.append(row(5L, 1.0));
        cache.append(row(5L, 2.0));
        cache.append(row(5L, 3.0));

        assertEquals(1, cache.size());
        assertEquals(1, cache.getLimit(null, null).intValue(), "3 appends of one timestamp = 1 update");
        assertEquals(List.of(5L, 3.0), cache.get(0), "merged field-wise into the stored row");

        // an updated row keeps its index — ByTimestamp does NOT move to the end
        var ordered = new ArrayCache.ArrayCacheByTimestamp();
        ordered.append(row(100L, 1.0));
        ordered.append(row(200L, 2.0));
        ordered.append(row(100L, 9.0));
        assertEquals(2, ordered.size());
        assertEquals(List.of(100L, 9.0), ordered.get(0), "row 100 stays at index 0");
        assertEquals(List.of(200L, 2.0), ordered.get(1));
    }

    @Test
    @DisplayName("ByTimestamp: deferred reset, min semantics, and tail-ordered new rows")
    void testArrayCacheByTimestampLimitSemantics() {
        var cache = new ArrayCache.ArrayCacheByTimestamp();
        for (int i = 0; i < 5; i++) {
            cache.append(row((long) i * 10, (double) i));
        }
        assertEquals(5, cache.getLimit(null, null).intValue());

        // 0 already exists (merged in place); 4 and 8 are new and land at the TAIL
        for (int i = 0; i < 3; i++) {
            cache.append(row((long) i * 4, (double) i));
        }
        assertEquals(7, cache.size());
        assertEquals(4L, ((List<?>) cache.get(5)).get(0));
        assertEquals(8L, ((List<?>) cache.get(6)).get(0));

        assertEquals(3, cache.getLimit(null, 5).intValue(), "min(3,5) after the deferred clear");
        assertEquals(2, cache.getLimit(null, 2).intValue(), "min(3,2)");
        assertEquals(3, cache.getLimit(null, null).intValue(), "still deferred");
    }

    @Test
    @DisplayName("ByTimestamp: hashmap is keyed by timestamp and evicted entries are removed")
    void testArrayCacheByTimestampHashmapAndEviction() {
        var cache = new ArrayCache.ArrayCacheByTimestamp(3);
        cache.append(row(1000L, 1.0));
        cache.append(row(2000L, 2.0));
        cache.append(row(3000L, 3.0));
        assertEquals(3, cache.hashmap.size());
        assertEquals(List.of(1000L, 1.0), cache.hashmap.get("1000"));

        cache.append(row(4000L, 4.0)); // evicts 1000
        assertEquals(3, cache.size());
        assertNull(cache.hashmap.get("1000"), "evicted rows must leave the hashmap");
        assertEquals(3, cache.hashmap.size());
        assertEquals(2000L, ((List<?>) cache.get(0)).get(0));

        // an update to a surviving row must still hit the right index post-eviction
        cache.append(row(3000L, 33.0));
        assertEquals(3, cache.size());
        assertEquals(List.of(3000L, 33.0), cache.get(1));
    }

    @Test
    @DisplayName("ByTimestamp: immutable rows fall back to positional replacement")
    void testArrayCacheByTimestampImmutableRow() {
        var cache = new ArrayCache.ArrayCacheByTimestamp();
        cache.append(List.of(1000L, 1.0)); // List.of is immutable — merge must not blow up
        cache.append(List.of(1000L, 2.0));
        assertEquals(1, cache.size());
        assertEquals(List.of(1000L, 2.0), cache.get(0));
        assertEquals(List.of(1000L, 2.0), cache.hashmap.get("1000"));
    }

    // ─── ArrayCacheBySymbolById ───

    @Test
    void testArrayCacheBySymbolByIdUpdatesInPlace() {
        var cache = new ArrayCache.ArrayCacheBySymbolById(100);
        cache.append(item("id", "order1", "symbol", "BTC/USDT", "status", "open"));
        cache.append(item("id", "order1", "symbol", "BTC/USDT", "status", "closed"));

        assertEquals(1, cache.size());
        assertEquals("closed", at(cache, 0, "status"));
    }

    @Test
    @DisplayName("D1: ById writes through to the public hashmap (Cache.ts:184,200)")
    void testArrayCacheBySymbolByIdPopulatesHashmap() {
        // 17 generated call sites across 14 exchanges read `.hashmap` directly; it used to be
        // written to a private symbolMap instead, so every one of them silently got {}.
        var cache = new ArrayCache.ArrayCacheBySymbolById();
        cache.append(item("symbol", "BTC/USDT", "id", "abcdef", "i", 1));
        cache.append(item("symbol", "ETH/USDT", "id", "qwerty", "i", 2));

        assertFalse(cache.hashmap.isEmpty(), "hashmap must be populated, not empty");
        assertEquals(2, cache.hashmap.size());

        var btc = asMap(cache.hashmap.get("BTC/USDT"));
        assertNotNull(btc, "hashmap must nest symbol -> id -> item");
        assertEquals(1, asMap(btc.get("abcdef")).get("i"));
        var eth = asMap(cache.hashmap.get("ETH/USDT"));
        assertEquals(2, asMap(eth.get("qwerty")).get("i"));
    }

    @Test
    @DisplayName("D4: re-appending an existing (symbol,id) moves it to the end (Cache.ts:196-206)")
    void testArrayCacheBySymbolByIdMovesToEnd() {
        var cache = new ArrayCache.ArrayCacheBySymbolById();
        cache.append(item("symbol", "BTC/USDT", "id", "abcdef", "i", 1));
        cache.append(item("symbol", "ETH/USDT", "id", "qwerty", "i", 2));
        cache.append(item("symbol", "BTC/USDT", "id", "abcdef", "i", 3));

        assertEquals(2, cache.size());
        assertEquals(List.of("qwerty", "abcdef"), order(cache, "id"), "updated row moves to the tail");
        assertEquals(3, at(cache, 1, "i"));
        assertEquals(3, asMap(asMap(cache.hashmap.get("BTC/USDT")).get("abcdef")).get("i"));
    }

    @Test
    @DisplayName("ById: move-to-end from the middle and the head, with eviction (Cache.ts:196-206)")
    void testArrayCacheBySymbolByIdMoveToEndWithEviction() {
        var cache = new ArrayCache.ArrayCacheBySymbolById(5);
        for (int i = 1; i <= 10; i++) {
            cache.append(item("symbol", "BTC/USDT", "id", String.valueOf(i), "i", i));
        }
        assertEquals(5, cache.size());
        assertEquals(List.of("6", "7", "8", "9", "10"), order(cache, "id"));
        assertEquals(5, asMap(cache.hashmap.get("BTC/USDT")).size(), "evicted ids leave the hashmap");
        assertEquals(10, cache.getLimit("BTC/USDT", null).intValue(), "the id set is not capped by maxSize");

        // re-appending the same ten ids adds no new updates and no new rows
        for (int i = 1; i <= 10; i++) {
            cache.append(item("symbol", "BTC/USDT", "id", String.valueOf(i), "i", i + 10));
        }
        assertEquals(5, cache.size());
        assertEquals(List.of("6", "7", "8", "9", "10"), order(cache, "id"));
        assertEquals(List.of(16, 17, 18, 19, 20), order(cache, "i"));

        // update from the middle: id 8 (index 2) moves to the tail, nothing is evicted
        cache.append(item("symbol", "BTC/USDT", "id", "8", "i", 28));
        assertEquals(5, cache.size());
        assertEquals(List.of("6", "7", "9", "10", "8"), order(cache, "id"));

        cache.append(item("symbol", "BTC/USDT", "id", "7", "i", 27));
        assertEquals(List.of("6", "9", "10", "8", "7"), order(cache, "id"));

        // three brand-new ids evict the three oldest
        for (int i = 30; i <= 32; i++) {
            cache.append(item("symbol", "BTC/USDT", "id", String.valueOf(i), "i", i + 10));
        }
        assertEquals(List.of("8", "7", "30", "31", "32"), order(cache, "id"));

        // update from the head
        cache.append(item("symbol", "BTC/USDT", "id", "8", "i", 38));
        assertEquals(List.of("7", "30", "31", "32", "8"), order(cache, "id"));
        assertEquals(List.of(27, 40, 41, 42, 38), order(cache, "i"));
    }

    @Test
    @DisplayName("ById: fields absent from the update survive the merge (Cache.ts:188-190)")
    void testArrayCacheBySymbolByIdFieldWiseMerge() {
        var cache = new ArrayCache.ArrayCacheBySymbolById();
        cache.append(item("symbol", "BTC/USDT", "id", "1", "status", "open", "price", 100.0));
        cache.append(item("symbol", "BTC/USDT", "id", "1", "status", "closed"));

        assertEquals(1, cache.size());
        assertEquals("closed", at(cache, 0, "status"), "updated field is overwritten");
        assertEquals(100.0, at(cache, 0, "price"), "untouched field must survive the merge");
    }

    @Test
    @DisplayName("ById: the same id under two symbols does not collide (Cache.ts:196)")
    void testArrayCacheBySymbolByIdCompositeKey() {
        var cache = new ArrayCache.ArrayCacheBySymbolById();
        cache.append(item("symbol", "BTC/USDT", "id", "sharedId", "i", 1));
        cache.append(item("symbol", "ETH/USDT", "id", "sharedId", "i", 2));

        assertEquals(2, cache.size(), "per-symbol id sequences must not splice the wrong row");
        assertEquals(1, at(cache, 0, "i"));
        assertEquals(2, at(cache, 1, "i"));
    }

    @Test
    @DisplayName("ByOutcomeById nests under 'outcome' (Cache.ts:229-235)")
    void testArrayCacheByOutcomeById() {
        var cache = new ArrayCache.ArrayCacheByOutcomeById();
        cache.append(item("outcome", "YES", "id", "1", "i", 1));
        cache.append(item("outcome", "NO", "id", "1", "i", 2));
        cache.append(item("outcome", "YES", "id", "1", "i", 3));

        assertEquals(2, cache.size());
        assertEquals(List.of("NO", "YES"), order(cache, "outcome"), "YES moved to the tail");
        assertEquals(3, asMap(asMap(cache.hashmap.get("YES")).get("1")).get("i"));
        assertEquals(2, asMap(asMap(cache.hashmap.get("NO")).get("1")).get("i"));
    }

    // ─── ArrayCacheBySymbolBySide ───

    @Test
    @DisplayName("D5: BySide dedupes on (symbol, side) and populates hashmap (Cache.ts:249-264)")
    void testArrayCacheBySymbolBySideDedupes() {
        var cache = new ArrayCache.ArrayCacheBySymbolBySide();
        cache.append(item("symbol", "BTC/USDT", "side", "short", "contracts", 1));
        cache.append(item("symbol", "BTC/USDT", "side", "short", "contracts", 0));

        assertEquals(1, cache.size(), "same (symbol,side) must not duplicate");
        assertEquals(0, at(cache, 0, "contracts"));
        assertEquals(1, cache.getLimit("BTC/USDT", 5).intValue(), "the counted unit is the side");

        assertFalse(cache.hashmap.isEmpty(), "BySide must write through to hashmap");
        var bySide = asMap(cache.hashmap.get("BTC/USDT"));
        assertEquals(0, asMap(bySide.get("short")).get("contracts"));

        cache.append(item("symbol", "BTC/USDT", "side", "long", "contracts", 3));
        assertEquals(2, cache.size(), "a different side is a different row");
        assertEquals(2, asMap(cache.hashmap.get("BTC/USDT")).size());
    }

    @Test
    @DisplayName("BySide: an update must splice the matching symbol, not the first row")
    void testArrayCacheBySymbolBySideUpdatesCorrectRow() {
        // all three rows share side='long', so matching on side alone removes the wrong row
        var cache = new ArrayCache.ArrayCacheBySymbolBySide();
        cache.append(item("symbol", "BTC/USDT", "side", "long", "contracts", 1));
        cache.append(item("symbol", "ETH/USDT", "side", "long", "contracts", 2));
        cache.append(item("symbol", "XRP/USDT", "side", "long", "contracts", 3));
        assertEquals("BTC/USDT", at(cache, 0, "symbol"));
        assertEquals("ETH/USDT", at(cache, 1, "symbol"));

        cache.append(item("symbol", "ETH/USDT", "side", "long", "contracts", 4));

        assertEquals(3, cache.size());
        assertEquals("BTC/USDT", at(cache, 0, "symbol"));
        assertEquals(1, at(cache, 0, "contracts"));
        assertEquals("XRP/USDT", at(cache, 1, "symbol"));
        assertEquals(3, at(cache, 1, "contracts"));
        assertEquals("ETH/USDT", at(cache, 2, "symbol"));
        assertEquals(4, at(cache, 2, "contracts"));
    }

    @Test
    @DisplayName("BySide: watch-all counts distinct sides per window (Cache.ts:280-284)")
    void testArrayCacheBySymbolBySideWatchAll() {
        var cache = new ArrayCache.ArrayCacheBySymbolBySide();
        cache.append(item("symbol", "BTC/USDT", "side", "short", "contracts", 1));
        assertEquals(1, cache.getLimit(null, 5).intValue());
        cache.append(item("symbol", "BTC/USDT", "side", "short", "contracts", 0));
        assertEquals(1, cache.getLimit(null, 5).intValue());
        cache.append(item("symbol", "BTC/USDT", "side", "long", "contracts", 3));
        assertEquals(1, cache.getLimit(null, 5).intValue());
        cache.append(item("symbol", "BTC/USDT", "side", "long", "contracts", 2));
        cache.append(item("symbol", "BTC/USDT", "side", "long", "contracts", 1));
        assertEquals(1, cache.getLimit(null, 5).intValue(), "two appends to one side still report 1");

        assertEquals(2, cache.size());
        assertEquals(List.of("short", "long"), order(cache, "side"));
    }

    @Test
    @DisplayName("BySide never evicts — the TS class has no maxSize (Cache.ts:239)")
    void testArrayCacheBySymbolBySideNeverEvicts() {
        var cache = new ArrayCache.ArrayCacheBySymbolBySide();
        for (int i = 0; i < 1500; i++) {
            cache.append(item("symbol", "SYM" + i + "/USDT", "side", "long", "contracts", i));
        }
        assertEquals(1500, cache.size());
        assertEquals(1500, cache.hashmap.size());
    }

    // ─── clear() ───

    @Test
    @DisplayName("clear() wipes the list and every index that points into it")
    void testClearResetsAllState() {
        var cache = new ArrayCache.ArrayCacheBySymbolById(100);
        cache.append(item("symbol", "BTC/USDT", "id", "1", "i", 1));
        cache.append(item("symbol", "BTC/USDT", "id", "2", "i", 2));
        assertFalse(cache.hashmap.isEmpty());

        cache.clear();

        assertEquals(0, cache.size());
        assertTrue(cache.hashmap.isEmpty(), "a stale hashmap hands out rows that are gone");
        assertNull(cache.getLimit("BTC/USDT", null), "counters are reset with the contents");

        // re-appending after clear must behave like a fresh cache, not resurrect old indices
        cache.append(item("symbol", "BTC/USDT", "id", "1", "i", 99));
        assertEquals(1, cache.size());
        assertEquals(99, at(cache, 0, "i"));
        assertEquals(1, cache.getLimit("BTC/USDT", null).intValue());
        assertEquals(99, asMap(asMap(cache.hashmap.get("BTC/USDT")).get("1")).get("i"));

        // the same id that was evicted-by-clear must not be treated as a duplicate
        cache.append(item("symbol", "BTC/USDT", "id", "2", "i", 100));
        assertEquals(2, cache.size());
        assertEquals(List.of("1", "2"), order(cache, "id"));
    }

    @Test
    @DisplayName("ByTimestamp.clear() also resets the distinct-timestamp tracker")
    void testClearByTimestamp() {
        var cache = new ArrayCache.ArrayCacheByTimestamp();
        cache.append(row(1000L, 1.0));
        cache.append(row(2000L, 2.0));
        assertEquals(2, cache.getLimit(null, null).intValue());

        cache.clear();
        assertEquals(0, cache.size());
        assertTrue(cache.hashmap.isEmpty());
        assertEquals(0, cache.getLimit(null, null).intValue());

        cache.append(row(1000L, 5.0));
        assertEquals(1, cache.size());
        assertEquals(1, cache.getLimit(null, null).intValue());
    }

    // ─── reflective dispatch (the generated-code call path) ───

    @Test
    @DisplayName("getLimit resolves through Helpers.callDynamically, as generated code calls it")
    void testGetLimitViaReflection() {
        // Generated exchange code never calls getLimit directly — it goes through
        // Helpers.callDynamically(cache, "getLimit", {symbol, limit}) at 220+ sites, none of
        // which are compile-checked. This pins that the ByTimestamp override actually wins
        // dispatch (the base method would return the symbol-keyed count and hand watchOHLCV
        // the whole cache) and that a null limit survives the round trip.
        var ohlcv = new ArrayCache.ArrayCacheByTimestamp();
        ohlcv.append(row(100L, 1.0));
        ohlcv.append(row(200L, 2.0));

        Object viaReflection = io.github.ccxt.Helpers.callDynamically(
                ohlcv, "getLimit", new Object[]{ "BTC/USDT", 5 });
        assertEquals(2, viaReflection, "must hit ArrayCacheByTimestamp.getLimit, not the base");

        // a Long limit (the shape JSON parsing produces) must coerce to Integer, not throw
        Object coerced = io.github.ccxt.Helpers.callDynamically(
                ohlcv, "getLimit", new Object[]{ "BTC/USDT", 1L });
        assertEquals(1, coerced, "min(2,1) after numeric coercion");

        var orders = new ArrayCache.ArrayCacheBySymbolById();
        assertNull(io.github.ccxt.Helpers.callDynamically(
                orders, "getLimit", new Object[]{ "BTC/USDT", null }),
                "unseen symbol + null limit stays null through reflection");

        orders.append(item("symbol", "BTC/USDT", "id", "1", "i", 1));
        assertEquals(1, io.github.ccxt.Helpers.callDynamically(
                orders, "getLimit", new Object[]{ "BTC/USDT", 5 }));
        assertEquals(1, io.github.ccxt.Helpers.callDynamically(
                orders, "getLimit", new Object[]{ null, 5 }), "null symbol reads the global counter");
    }

    // ─── concurrency ───

    @Test
    @DisplayName("append/getLimit/snapshot stay consistent under concurrent writers")
    void testConcurrentAppendIsSafe() throws Exception {
        var cache = new ArrayCache.ArrayCacheBySymbolById(500);
        int threads = 8;
        int perThread = 250;
        var pool = Executors.newFixedThreadPool(threads);
        var start = new CountDownLatch(1);
        try {
            for (int t = 0; t < threads; t++) {
                final int id = t;
                pool.submit(() -> {
                    start.await();
                    for (int i = 0; i < perThread; i++) {
                        cache.append(item("symbol", "S" + id, "id", id + "-" + i, "i", i));
                        cache.getLimit("S" + id, 10);
                        cache.snapshot();
                    }
                    return null;
                });
            }
            start.countDown();
            pool.shutdown();
            assertTrue(pool.awaitTermination(60, TimeUnit.SECONDS), "workers must finish");
        } finally {
            pool.shutdownNow();
        }
        assertEquals(500, cache.size(), "maxSize must hold under concurrency");
        assertEquals(500, cache.snapshot().size());
    }
}
