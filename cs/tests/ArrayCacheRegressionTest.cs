using ccxt.pro;

namespace Tests;

// Hand-written (NOT transpiled) regression tests for the C#-only ArrayCache
// defects fixed alongside this file. They live here rather than in
// cs/tests/Generated/Base/Ws/test.cache.cs because that file is regenerated
// from ts/src/pro/test/base/test.cache.ts and build/cleanup.sh restores the
// whole cs/tests/Generated tree, so anything added there is thrown away.
//
// Every case below targets behaviour that the transpiled suite cannot reach:
//   * the upstream test only ever constructs `new ArrayCacheByTimestamp ()`
//     with NO maxSize (ts/src/pro/test/base/test.cache.ts:71 and :292), so the
//     bounded-eviction branch of ArrayCacheByTimestamp.append was completely
//     uncovered - which is exactly why it shipped broken (it deleted the
//     hashmap key but never removed the row, so the OHLCV cache grew without
//     bound and `Count == maxSize` never matched again).
//   * the transpiled suite compares values, never object identity, so it could
//     not see that the C# update path rebound a local instead of mutating the
//     cached object that consumers already hold a reference to.
//   * `getLimit` on an unseen symbol used the raw Dictionary indexer and threw
//     KeyNotFoundException where TS returns `limit`.
//
// If any of these are ever expressed upstream in TypeScript, the equivalent
// case belongs in ts/src/pro/test/base/test.cache.ts and can be dropped here.

public partial class BaseTest
{
    private static List<object> ohlcvRow(int timestamp, int open, int high, int low)
    {
        return new List<object>() { timestamp, open, high, low };
    }

    private static Dictionary<string, object> orderRow(string symbol, string id, params object[] extra)
    {
        var row = new Dictionary<string, object>() { { "symbol", symbol }, { "id", id } };
        for (var i = 0; i + 1 < extra.Length; i += 2)
        {
            row[extra[i].ToString()] = extra[i + 1];
        }
        return row;
    }

    public void testWsCacheRegressions()
    {
        testArrayCacheByTimestampEviction();
        testArrayCacheByTimestampInPlaceMerge();
        testArrayCacheUnboundedWhenMaxSizeFalsy();
        testArrayCacheGetLimitMissingSymbol();
        testArrayCacheClearResetsBookkeeping();
        testArrayCacheBySymbolByIdMutatesStoredReference();
        testArrayCacheBySymbolBySideMutatesStoredReference();
        testArrayCacheBySymbolByIdSharedHashmap();
    }

    // 1. THE CRITICAL ONE. ArrayCacheByTimestamp(3) fed 10 distinct timestamps
    // must hold exactly the last 3 rows, and the hashmap must shrink with them.
    // Before the fix the eviction branch read this[0] and dropped the hashmap
    // key but never called RemoveAt(0), so Count climbed past maxSize on the
    // first eviction and the `Count == maxSize` equality never matched again:
    // this asserted 3 but got 10, with a 10-entry hashmap.
    private void testArrayCacheByTimestampEviction()
    {
        var cache = new ArrayCacheByTimestamp(3);
        for (var i = 0; i < 10; i++)
        {
            cache.append(ohlcvRow(i * 100, i, i, i));
        }

        Assert(cache.Count == 3, "ArrayCacheByTimestamp(3) must evict: expected Count 3, got " + cache.Count);
        Assert(cache.hashmap.Count == 3, "ArrayCacheByTimestamp(3) hashmap must shrink with the rows: expected 3, got " + cache.hashmap.Count);

        // the surviving rows are the newest three, in insertion order
        for (var i = 0; i < 3; i++)
        {
            var expectedTimestamp = (7 + i) * 100;
            var row = cache[i] as List<object>;
            Assert(row != null, "evicting ArrayCacheByTimestamp must keep OHLCV rows intact");
            Assert(Convert.ToInt32(row[0]) == expectedTimestamp, "expected timestamp " + expectedTimestamp + " at index " + i + ", got " + row[0]);
            Assert(cache.hashmap.ContainsKey(expectedTimestamp.ToString()), "hashmap must still key the surviving row " + expectedTimestamp);
        }
        // and every evicted key is really gone, not stranded pointing at an orphan
        for (var i = 0; i < 7; i++)
        {
            Assert(!cache.hashmap.ContainsKey((i * 100).ToString()), "evicted timestamp " + (i * 100) + " must be removed from the hashmap");
        }

        // a bounded cache stays bounded across an update to an existing timestamp
        cache.append(ohlcvRow(900, 42, 42, 42));
        Assert(cache.Count == 3, "updating an existing timestamp must not grow a bounded cache, got " + cache.Count);
        Assert(cache.hashmap.Count == 3, "updating an existing timestamp must not grow the hashmap, got " + cache.hashmap.Count);
    }

    // 2. TS does `for (const prop in item) reference[prop] = item[prop]`, so the
    // candle already in the cache is mutated in place and anyone holding it
    // sees the update. The C# port swapped the slot for a brand new object, so
    // a consumer's reference silently went stale. Value equality could not
    // catch this - only holding the reference across the append can.
    private void testArrayCacheByTimestampInPlaceMerge()
    {
        var cache = new ArrayCacheByTimestamp();
        var first = ohlcvRow(100, 1, 2, 3);
        cache.append(first);
        cache.append(ohlcvRow(200, 5, 6, 7));

        cache.append(ohlcvRow(100, 11, 22, 33));

        Assert(cache.Count == 2, "updating an existing timestamp must not append a row, got " + cache.Count);
        Assert(object.ReferenceEquals(cache[0], first), "the cached candle object must be reused, not replaced");
        // the externally held reference must observe the update
        Assert(Convert.ToInt32(first[1]) == 11, "held reference must see the merged open, got " + first[1]);
        Assert(Convert.ToInt32(first[2]) == 22, "held reference must see the merged high, got " + first[2]);
        Assert(Convert.ToInt32(first[3]) == 33, "held reference must see the merged low, got " + first[3]);
        Assert(Convert.ToInt32(first[0]) == 100, "the timestamp must survive the merge, got " + first[0]);
        // the updated row keeps its position, it does not jump to the end
        var second = cache[1] as List<object>;
        Assert(Convert.ToInt32(second[0]) == 200, "an in-place update must not reorder the cache");
        Assert(object.ReferenceEquals(cache.hashmap["100"], first), "the hashmap must keep pointing at the live object");
    }

    // 6. `if (this.maxSize && ...)` in TS is a truthiness test, so 0/undefined
    // mean UNBOUNDED. maxSize legitimately arrives as 0 from a .filter()
    // copy-construction; treating it as "bound to zero" would empty the cache.
    private void testArrayCacheUnboundedWhenMaxSizeFalsy()
    {
        var zeroBounded = new ArrayCache(0);
        var unbounded = new ArrayCache();
        var zeroByTimestamp = new ArrayCacheByTimestamp(0);
        // ArrayCacheBySymbolById(0) is the sharp one: its eviction guard used to
        // omit the `!= 0` test entirely, so `Count == maxSize` matched on the
        // EMPTY list and RemoveAt(0) threw ArgumentOutOfRangeException on the
        // very first append.
        var zeroById = new ArrayCacheBySymbolById(0);
        for (var i = 0; i < 5; i++)
        {
            zeroBounded.append(orderRow("BTC/USDT", i.ToString(), "i", i));
            unbounded.append(orderRow("BTC/USDT", i.ToString(), "i", i));
            zeroByTimestamp.append(ohlcvRow(i * 100, i, i, i));
            zeroById.append(orderRow("BTC/USDT", i.ToString(), "i", i));
        }
        Assert(zeroBounded.Count == 5, "ArrayCache(0) is unbounded, expected 5 rows, got " + zeroBounded.Count);
        Assert(unbounded.Count == 5, "ArrayCache() is unbounded, expected 5 rows, got " + unbounded.Count);
        Assert(zeroByTimestamp.Count == 5, "ArrayCacheByTimestamp(0) is unbounded, expected 5 rows, got " + zeroByTimestamp.Count);
        Assert(zeroByTimestamp.hashmap.Count == 5, "ArrayCacheByTimestamp(0) must not evict hashmap keys, got " + zeroByTimestamp.hashmap.Count);
        Assert(zeroById.Count == 5, "ArrayCacheBySymbolById(0) is unbounded, expected 5 rows, got " + zeroById.Count);
    }

    // 4. TS reads a missing key as undefined and falls through to `return limit`.
    // The C# port indexed the Dictionary directly and threw KeyNotFoundException,
    // which surfaced as a hard crash the first time watchOrders was called for a
    // symbol that had not produced an update yet.
    private void testArrayCacheGetLimitMissingSymbol()
    {
        var cache = new ArrayCache();
        var limited = cache.getLimit("BTC/USDT", 5);
        Assert(limited != null && Convert.ToInt32(limited) == 5, "getLimit on an unseen symbol must return the limit, got " + limited);
        Assert(cache.getLimit("ETH/USDT", null) == null, "getLimit on an unseen symbol with no limit must return null");

        // same path through the nested (Set-valued) subclasses
        var byId = new ArrayCacheBySymbolById();
        var byIdLimited = byId.getLimit("BTC/USDT", 7);
        Assert(byIdLimited != null && Convert.ToInt32(byIdLimited) == 7, "ArrayCacheBySymbolById.getLimit on an unseen symbol must return the limit, got " + byIdLimited);

        var bySide = new ArrayCacheBySymbolBySide();
        var bySideLimited = bySide.getLimit("BTC/USDT", 9);
        Assert(bySideLimited != null && Convert.ToInt32(bySideLimited) == 9, "ArrayCacheBySymbolBySide.getLimit on an unseen symbol must return the limit, got " + bySideLimited);

        // a symbol that HAS produced updates still reports its own count, and the
        // stored `false` clear-flag written back by append must not be mistaken
        // for a truthy "please re-zero the counters" marker
        var counting = new ArrayCache();
        counting.append(orderRow("BTC/USDT", "1"));
        counting.append(orderRow("BTC/USDT", "2"));
        Assert(Convert.ToInt32(counting.getLimit("BTC/USDT", 10)) == 2, "getLimit must report the per-symbol update count");
        counting.append(orderRow("BTC/USDT", "3"));
        Assert(Convert.ToInt32(counting.getLimit("BTC/USDT", 10)) == 1, "getLimit must reset the per-symbol counter after it is read");
    }

    // 5. clear() dropped the rows but kept the hashmap, so the next append of a
    // previously seen key took the "update" branch, mutated an object that was
    // no longer in the list and never re-added the row - the item vanished (or,
    // for ById, RemoveAt(-1) threw ArgumentOutOfRangeException).
    private void testArrayCacheClearResetsBookkeeping()
    {
        var byTimestamp = new ArrayCacheByTimestamp();
        byTimestamp.append(ohlcvRow(100, 1, 2, 3));
        byTimestamp.append(ohlcvRow(200, 4, 5, 6));
        byTimestamp.clear();
        Assert(byTimestamp.Count == 0, "clear() must drop the rows");
        Assert(byTimestamp.hashmap.Count == 0, "clear() must drop the hashmap, got " + byTimestamp.hashmap.Count);

        byTimestamp.append(ohlcvRow(100, 7, 8, 9));
        Assert(byTimestamp.Count == 1, "re-appending a pre-clear timestamp must re-add the row, got " + byTimestamp.Count);
        var reAdded = byTimestamp[0] as List<object>;
        Assert(Convert.ToInt32(reAdded[0]) == 100 && Convert.ToInt32(reAdded[1]) == 7, "the re-appended row must carry the new values");

        var byId = new ArrayCacheBySymbolById();
        byId.append(orderRow("BTC/USDT", "abcdef", "i", 1));
        byId.clear();
        Assert(byId.Count == 0, "clear() must drop the rows");
        Assert(byId.hashmap.Count == 0, "clear() must drop the nested hashmap, got " + byId.hashmap.Count);

        byId.append(orderRow("BTC/USDT", "abcdef", "i", 2));
        Assert(byId.Count == 1, "re-appending a pre-clear order must re-add the row, got " + byId.Count);
        Assert(Convert.ToInt32((cache_get(byId[0], "i"))) == 2, "the re-appended order must carry the new values");

        // the update counters reset too, so getLimit does not report stale updates
        var counting = new ArrayCache();
        counting.append(orderRow("BTC/USDT", "1"));
        counting.append(orderRow("BTC/USDT", "2"));
        counting.clear();
        counting.append(orderRow("BTC/USDT", "3"));
        Assert(Convert.ToInt32(counting.getLimit("BTC/USDT", 10)) == 1, "clear() must reset the per-symbol update counters");
        Assert(counting.Count == 1, "clear() then append must leave exactly one row");
    }

    // 3 + 7. The stored order must be mutated in place (so a consumer's
    // reference stays live), moved to the end of the array, and fields the
    // update does not mention must survive the merge.
    private void testArrayCacheBySymbolByIdMutatesStoredReference()
    {
        var cache = new ArrayCacheBySymbolById();
        var stored = orderRow("BTC/USDT", "abcdef", "a", 1, "b", 2);
        cache.append(stored);
        cache.append(orderRow("ETH/USDT", "qwerty", "a", 9, "b", 9));

        // partial update: only "b" is mentioned
        cache.append(orderRow("BTC/USDT", "abcdef", "b", 99));

        Assert(cache.Count == 2, "updating an existing order must not append a row, got " + cache.Count);
        Assert(object.ReferenceEquals(cache[1], stored), "the updated order must be the SAME object, moved to the end");
        Assert(Convert.ToInt32(stored["b"]) == 99, "held reference must see the updated field, got " + stored["b"]);
        Assert(stored.ContainsKey("a") && Convert.ToInt32(stored["a"]) == 1, "a partial update must not drop unmentioned keys");
        Assert(Convert.ToInt32(cache_get(cache[0], "a")) == 9, "the untouched order must stay at the front");

        var bucket = cache.hashmap["BTC/USDT"] as Dictionary<string, object>;
        Assert(bucket != null, "the symbol bucket must exist");
        Assert(object.ReferenceEquals(bucket["abcdef"], stored), "the hashmap must keep pointing at the live order object");

        // bounded eviction keeps the array and the nested hashmap consistent
        var bounded = new ArrayCacheBySymbolById(3);
        for (var i = 0; i < 6; i++)
        {
            bounded.append(orderRow("BTC/USDT", i.ToString(), "i", i));
        }
        Assert(bounded.Count == 3, "ArrayCacheBySymbolById(3) must evict, got " + bounded.Count);
        var boundedBucket = bounded.hashmap["BTC/USDT"] as Dictionary<string, object>;
        Assert(boundedBucket.Count == 3, "the nested hashmap must shrink with the rows, got " + boundedBucket.Count);
        for (var i = 0; i < 3; i++)
        {
            Assert(!boundedBucket.ContainsKey(i.ToString()), "evicted order id " + i + " must be removed from the nested hashmap");
        }
        for (var i = 3; i < 6; i++)
        {
            Assert(boundedBucket.ContainsKey(i.ToString()), "surviving order id " + i + " must remain in the nested hashmap");
        }
    }

    // Same contract for the by-side variant used by watchPositions.
    private void testArrayCacheBySymbolBySideMutatesStoredReference()
    {
        var cache = new ArrayCacheBySymbolBySide();
        var stored = new Dictionary<string, object>() { { "symbol", "BTC/USDT" }, { "side", "long" }, { "contracts", 1 }, { "leverage", 10 } };
        cache.append(stored);
        cache.append(new Dictionary<string, object>() { { "symbol", "ETH/USDT" }, { "side", "long" }, { "contracts", 2 } });

        // partial update: "leverage" is not mentioned and must survive
        cache.append(new Dictionary<string, object>() { { "symbol", "BTC/USDT" }, { "side", "long" }, { "contracts", 5 } });

        Assert(cache.Count == 2, "updating an existing position must not append a row, got " + cache.Count);
        Assert(object.ReferenceEquals(cache[1], stored), "the updated position must be the SAME object, moved to the end");
        Assert(Convert.ToInt32(stored["contracts"]) == 5, "held reference must see the updated contracts, got " + stored["contracts"]);
        Assert(stored.ContainsKey("leverage") && Convert.ToInt32(stored["leverage"]) == 10, "a partial update must not drop unmentioned keys");

        var bucket = cache.hashmap["BTC/USDT"] as Dictionary<string, object>;
        Assert(bucket != null && object.ReferenceEquals(bucket["long"], stored), "the hashmap must keep pointing at the live position object");
    }

    // ArrayCacheBySymbolById used to redeclare `hashmap`, shadowing the base
    // ArrayCache field. Generated exchange code (pro/kraken, pro/bitmex,
    // pro/woofipro, pro/coinbaseexchange, pro/upbit) reads the cache back as
    // `(stored as ArrayCache).hashmap`, which therefore always saw an empty
    // dictionary. Reading through the base type must see the real data.
    private void testArrayCacheBySymbolByIdSharedHashmap()
    {
        var cache = new ArrayCacheBySymbolById();
        cache.append(orderRow("BTC/USDT", "abcdef", "i", 1));

        var asBase = cache as ArrayCache;
        Assert(asBase.hashmap.Count == 1, "the base ArrayCache.hashmap must be the one that gets populated, got " + asBase.hashmap.Count);
        Assert(asBase.hashmap.ContainsKey("BTC/USDT"), "the base ArrayCache.hashmap must carry the symbol bucket");

        var bySide = new ArrayCacheBySymbolBySide();
        bySide.append(new Dictionary<string, object>() { { "symbol", "BTC/USDT" }, { "side", "long" }, { "contracts", 1 } });
        Assert((bySide as ArrayCache).hashmap.ContainsKey("BTC/USDT"), "ArrayCacheBySymbolBySide must populate the base ArrayCache.hashmap too");
    }

    private static object cache_get(object row, string key)
    {
        return (row as Dictionary<string, object>)[key];
    }
}
