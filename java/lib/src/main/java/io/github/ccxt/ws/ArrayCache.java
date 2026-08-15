package io.github.ccxt.ws;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-size FIFO cache with deduplication and new-update tracking.
 * Hand-written port of {@code ts/src/base/ws/Cache.ts} (the source of truth);
 * see also {@code cs/ccxt/ws/ArrayCache.cs}.
 *
 * <p>Used for streaming data: trades, tickers, OHLCV, orders, positions.
 * When {@code newUpdates=true}, watch methods call {@link #getLimit} and return
 * only the items added since the previous read.
 *
 * <h2>Contract notes (kept deliberately faithful to Cache.ts)</h2>
 * <ul>
 *   <li><b>Deferred reset.</b> {@code getLimit} never zeroes a counter; it only raises a
 *       reset flag that the <i>next</i> {@code append} acts on (Cache.ts:69,75,93-102).
 *       Two consecutive {@code getLimit} calls with no intervening append therefore
 *       return the same value.</li>
 *   <li><b>Nullable return.</b> {@code getLimit} returns {@code limit} verbatim for a
 *       symbol that has never been seen, which means {@code null} when {@code limit} is
 *       {@code null} (Cache.ts:78-79 returns {@code undefined}). Callers funnel this into
 *       {@code filterBySinceLimit}, which null-checks the limit.</li>
 *   <li><b>Unbounded when {@code maxSize <= 0}.</b> TS guards eviction with a truthiness
 *       test (Cache.ts:89,153,202) so {@code 0}/{@code undefined} means "never evict" —
 *       exactly the {@code .filter()} copy-construction case called out at Cache.ts:88.</li>
 *   <li><b>Public {@code hashmap} is the single index.</b> Keyed variants write through to
 *       it ({@code hashmap[symbol][id]}, {@code hashmap[symbol][side]}) because generated
 *       exchange code reads it directly — javaTranspiler.ts:2146-2153 emits those reads.</li>
 *   <li><b>Field-wise merge, not replacement.</b> Re-appending an existing key merges the
 *       new fields into the <i>stored</i> object and keeps that object's identity
 *       (Cache.ts:188-192), so fields absent from the update survive.</li>
 * </ul>
 *
 * <h2>Concurrency</h2>
 * {@code append}, {@code getLimit}, {@code clear}, {@code snapshot} and both {@code toArray}
 * overloads are {@code synchronized} — this is load-bearing and documented at the call site
 * in {@code BaseExchange.filterBySinceLimit}. Do not strip the locks.
 */
public class ArrayCache extends ArrayList<Object> {

    /** JS coerces an {@code undefined} object key to the literal string "undefined". */
    protected static final String UNDEFINED_KEY = "undefined";

    /** {@code <= 0} means unbounded, matching the falsy-maxSize guard in Cache.ts. */
    protected final int maxSize;

    /**
     * Public index read directly by generated exchange code. Shape depends on the variant:
     * {@code ArrayCacheByTimestamp} stores {@code timestamp -> row}; the keyed variants store
     * a nested {@code symbol -> (id|side) -> item}. Plain {@code ArrayCache} never writes here.
     */
    public final ConcurrentHashMap<String, Object> hashmap = new ConcurrentHashMap<>();

    /** symbol -> Integer count, or symbol -> Set of ids/sides when {@link #nestedNewUpdatesBySymbol}. */
    protected final ConcurrentHashMap<String, Object> newUpdatesBySymbol = new ConcurrentHashMap<>();
    /** symbol -> "reset me on the next append". */
    protected final ConcurrentHashMap<String, Boolean> clearUpdatesBySymbol = new ConcurrentHashMap<>();
    protected volatile int allNewUpdates = 0;
    protected volatile boolean clearAllUpdates = false;
    /** true when {@link #newUpdatesBySymbol} holds Sets rather than counts. */
    protected boolean nestedNewUpdatesBySymbol = false;

    public ArrayCache(int maxSize) {
        super();
        this.maxSize = maxSize;
    }

    /** No-arg construction is unbounded, mirroring {@code new ArrayCache ()} in TS. */
    public ArrayCache() {
        this(0);
    }

    // ─── helpers ───

    /** Mirrors JS object-key coercion: a missing value becomes the string "undefined". */
    protected static String keyOf(Object value) {
        return value == null ? UNDEFINED_KEY : value.toString();
    }

    /** Reads a field from a Map-shaped item; anything else has no fields (TS: {@code undefined}). */
    protected static Object fieldOf(Object item, String field) {
        if (item instanceof Map) {
            return ((Map<?, ?>) item).get(field);
        }
        return null;
    }

    /**
     * Locates a stored row by identity. The stored reference is always the very object held in
     * the list, so identity is equivalent to — and safer than — TS's {@code findIndex} on
     * {@code id}+{@code keyField}: it cannot be fooled by two rows that merely compare equal.
     */
    protected int indexOfIdentity(Object reference) {
        for (int i = 0, n = this.size(); i < n; i++) {
            if (this.get(i) == reference) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Field-wise merge of {@code source} onto {@code target}, mirroring
     * {@code for (const prop in item) reference[prop] = item[prop]} (Cache.ts:147-149,188-190).
     * Fields present on the target but absent from the source survive.
     *
     * @return true when the merge landed, false when the target is immutable and the caller
     *         must fall back to replacing the row positionally.
     */
    @SuppressWarnings("unchecked")
    protected static boolean mergeInto(Object target, Object source) {
        try {
            if (target instanceof Map && source instanceof Map) {
                ((Map<String, Object>) target).putAll((Map<String, Object>) source);
                return true;
            }
            if (target instanceof List && source instanceof List) {
                // OHLCV rows are lists; JS copies index-keyed props the same way
                List<Object> to = (List<Object>) target;
                List<Object> from = (List<Object>) source;
                for (int i = 0, n = from.size(); i < n; i++) {
                    if (i < to.size()) {
                        to.set(i, from.get(i));
                    } else {
                        to.add(from.get(i));
                    }
                }
                return true;
            }
        } catch (UnsupportedOperationException immutableRow) {
            return false;
        }
        // primitives/strings have no enumerable props in JS either — nothing to merge
        return true;
    }

    /**
     * Stable snapshot for readers — taken under the same monitor as append(),
     * so consumers can iterate without racing the WS thread.
     */
    public synchronized List<Object> snapshot() {
        return new ArrayList<>(this);
    }

    @Override
    public synchronized Object[] toArray() {
        return super.toArray();
    }

    @Override
    public synchronized <T> T[] toArray(T[] a) {
        return super.toArray(a);
    }

    /**
     * Empties the cache and every index that points into it.
     *
     * <p>TS {@code BaseCache.clear()} (Cache.ts:20-22) only truncates the array, because in JS
     * the hashmap holds live object references and positions are recomputed on demand. A Java
     * port that left {@code hashmap} populated would keep handing out references to rows that
     * are no longer in the list, so the indices are wiped alongside the contents.
     */
    @Override
    public synchronized void clear() {
        super.clear();
        this.hashmap.clear();
        this.newUpdatesBySymbol.clear();
        this.clearUpdatesBySymbol.clear();
        this.allNewUpdates = 0;
        this.clearAllUpdates = false;
    }

    /**
     * Number of updates seen since the previous read, capped by {@code limit}.
     * Mirrors Cache.ts:64-85.
     *
     * @param symbol the symbol to count for, or {@code null} for the all-symbols counter
     * @param limit  caller-supplied cap, or {@code null} for "no cap"
     * @return {@code min(newUpdates, limit)}; {@code limit} verbatim (possibly {@code null})
     *         when the symbol has never been seen
     */
    public synchronized Integer getLimit(String symbol, Integer limit) {
        Integer newUpdatesValue;
        if (symbol == null) {
            newUpdatesValue = this.allNewUpdates;
            this.clearAllUpdates = true;
        } else {
            Object tracked = this.newUpdatesBySymbol.get(symbol);
            if (tracked == null) {
                newUpdatesValue = null;
            } else if (this.nestedNewUpdatesBySymbol) {
                newUpdatesValue = ((Set<?>) tracked).size();
            } else {
                newUpdatesValue = ((Number) tracked).intValue();
            }
            this.clearUpdatesBySymbol.put(symbol, Boolean.TRUE);
        }
        if (newUpdatesValue == null) {
            return limit;
        } else if (limit != null) {
            return Math.min(newUpdatesValue, limit);
        }
        return newUpdatesValue;
    }

    /** Performs the reset that a previous {@link #getLimit} only flagged (Cache.ts:93-102). */
    protected void applyDeferredResets() {
        if (this.clearAllUpdates) {
            this.clearAllUpdates = false;
            this.clearUpdatesBySymbol.clear();
            this.allNewUpdates = 0;
            this.newUpdatesBySymbol.clear();
        }
    }

    /** True when {@code maxSize} is honoured and the cache is already full (Cache.ts:89). */
    protected boolean shouldEvict() {
        return this.maxSize > 0 && this.size() == this.maxSize;
    }

    /**
     * Append an item to the cache, evicting the oldest entry when full,
     * and record it against the per-symbol and all-symbols update counters.
     */
    public synchronized void append(Object item) {
        if (this.shouldEvict()) {
            this.remove(0);
        }
        this.add(item);

        String key = keyOf(fieldOf(item, "symbol"));
        this.applyDeferredResets();
        if (Boolean.TRUE.equals(this.clearUpdatesBySymbol.get(key))) {
            this.clearUpdatesBySymbol.put(key, Boolean.FALSE);
            this.newUpdatesBySymbol.put(key, 0);
        }
        Object previous = this.newUpdatesBySymbol.get(key);
        int count = (previous instanceof Number) ? ((Number) previous).intValue() : 0;
        this.newUpdatesBySymbol.put(key, count + 1);
        this.allNewUpdates = this.allNewUpdates + 1;
    }

    // ─── Variants ───

    /**
     * Cache indexed by timestamp, for OHLCV. Rows are Lists whose first element is the timestamp
     * (Maps with a "timestamp" entry are also accepted).
     *
     * <p>In TS this extends {@code BaseCache}, i.e. it is a <i>sibling</i> of {@code ArrayCache}
     * with its own {@code getLimit}/{@code newUpdates} (Cache.ts:108-166). Java keeps the
     * {@code extends ArrayCache} edge because {@code BaseExchange} and generated code test
     * {@code instanceof ArrayCache}, but both {@code append} and {@code getLimit} are fully
     * overridden so none of the symbol-keyed bookkeeping leaks in — a row is a List and has no
     * "symbol" field, which would otherwise make {@code getLimit} return 0 and hand
     * {@code watchOHLCV} the entire cache on every tick.
     */
    public static class ArrayCacheByTimestamp extends ArrayCache {

        /** Distinct timestamps seen since the last read — TS's {@code sizeTracker} Set. */
        private final LinkedHashSet<String> sizeTracker = new LinkedHashSet<>();
        private int timestampNewUpdates = 0;
        private boolean clearUpdates = false;

        public ArrayCacheByTimestamp(int maxSize) { super(maxSize); }
        public ArrayCacheByTimestamp() { super(); }

        /**
         * OHLCV rows are lists keyed by their first element (the timestamp);
         * everything else is a map keyed by its "timestamp" entry.
         */
        private static Object timestampKeyOf(Object item) {
            if (item instanceof Map) {
                return ((Map<?, ?>) item).get("timestamp");
            }
            if (item instanceof List && !((List<?>) item).isEmpty()) {
                return ((List<?>) item).get(0);
            }
            return null;
        }

        /** Counts distinct timestamps, ignores {@code symbol} entirely (Cache.ts:134-140). */
        @Override
        public synchronized Integer getLimit(String symbol, Integer limit) {
            this.clearUpdates = true;
            if (limit == null) {
                return this.timestampNewUpdates;
            }
            return Math.min(this.timestampNewUpdates, limit);
        }

        @Override
        public synchronized void clear() {
            super.clear();
            this.sizeTracker.clear();
            this.timestampNewUpdates = 0;
            this.clearUpdates = false;
        }

        @Override
        public synchronized void append(Object item) {
            String key = keyOf(timestampKeyOf(item));
            Object reference = this.hashmap.get(key);
            if (reference != null) {
                // a repeat timestamp is merged into the stored row and keeps its position —
                // ArrayCacheByTimestamp does NOT move updated rows to the end (Cache.ts:143-150)
                if (reference != item && !mergeInto(reference, item)) {
                    int index = this.indexOfIdentity(reference);
                    if (index >= 0) {
                        this.set(index, item);
                    }
                    this.hashmap.put(key, item);
                }
            } else {
                this.hashmap.put(key, item);
                if (this.shouldEvict()) {
                    Object evicted = this.remove(0);
                    this.hashmap.remove(keyOf(timestampKeyOf(evicted)));
                }
                this.add(item);
            }
            if (this.clearUpdates) {
                this.clearUpdates = false;
                this.sizeTracker.clear();
            }
            this.sizeTracker.add(key);
            this.timestampNewUpdates = this.sizeTracker.size();
        }
    }

    /**
     * Cache indexed by symbol then by id, for orders and positions.
     * Writes through to {@code hashmap[symbol][id]} (Cache.ts:168-227).
     */
    public static class ArrayCacheBySymbolById extends ArrayCache {

        /** First nesting level; overridden by {@link ArrayCacheByOutcomeById}. */
        protected String keyField = "symbol";

        public ArrayCacheBySymbolById(int maxSize) {
            super(maxSize);
            this.nestedNewUpdatesBySymbol = true;
        }

        public ArrayCacheBySymbolById() {
            super();
            this.nestedNewUpdatesBySymbol = true;
        }

        /** The second nesting level: id here, side in {@link ArrayCacheBySymbolBySide}. */
        protected String subKeyOf(Object item) {
            return keyOf(fieldOf(item, "id"));
        }

        @SuppressWarnings("unchecked")
        protected Map<String, Object> bucket(String key) {
            Object existing = this.hashmap.get(key);
            if (existing instanceof Map) {
                return (Map<String, Object>) existing;
            }
            Map<String, Object> created = new LinkedHashMap<>();
            this.hashmap.put(key, created);
            return created;
        }

        /** {@link ArrayCacheBySymbolBySide} has no eviction block at all in TS. */
        protected boolean evictionEnabled() {
            return true;
        }

        @Override
        @SuppressWarnings("unchecked")
        public synchronized void append(Object item) {
            String key = keyOf(fieldOf(item, this.keyField));
            String subKey = this.subKeyOf(item);
            Map<String, Object> byId = this.bucket(key);

            Object stored = byId.get(subKey);
            Object toStore = item;
            if (stored != null) {
                if (stored != item && !mergeInto(stored, item)) {
                    byId.put(subKey, item);
                    toStore = item;
                } else {
                    toStore = stored;
                }
                // move the row to the end of the array; the splice happens before the maxSize
                // check, so updating an existing row never evicts (Cache.ts:196-206)
                int index = this.indexOfIdentity(stored);
                if (index >= 0) {
                    this.remove(index);
                }
            } else {
                byId.put(subKey, item);
            }

            if (this.evictionEnabled() && this.shouldEvict()) {
                Object evicted = this.remove(0);
                Object evictedBucket = this.hashmap.get(keyOf(fieldOf(evicted, this.keyField)));
                if (evictedBucket instanceof Map) {
                    ((Map<String, Object>) evictedBucket).remove(this.subKeyOf(evicted));
                }
            }
            this.add(toStore);

            this.applyDeferredResets();
            Object tracked = this.newUpdatesBySymbol.get(key);
            Set<Object> idSet;
            if (tracked instanceof Set) {
                idSet = (Set<Object>) tracked;
            } else {
                idSet = new LinkedHashSet<>();
                this.newUpdatesBySymbol.put(key, idSet);
            }
            if (Boolean.TRUE.equals(this.clearUpdatesBySymbol.get(key))) {
                this.clearUpdatesBySymbol.put(key, Boolean.FALSE);
                idSet.clear();
            }
            // an exchange may update the same id twice — count it once per window
            int before = idSet.size();
            idSet.add(subKey);
            this.allNewUpdates = this.allNewUpdates + (idSet.size() - before);
        }
    }

    /**
     * Cache indexed by outcome then by id, for prediction markets (Cache.ts:229-235).
     */
    public static class ArrayCacheByOutcomeById extends ArrayCacheBySymbolById {
        public ArrayCacheByOutcomeById(int maxSize) { super(maxSize); this.keyField = "outcome"; }
        public ArrayCacheByOutcomeById() { super(); this.keyField = "outcome"; }
    }

    /**
     * Cache indexed by symbol then by side, for positions (Cache.ts:237-286).
     *
     * <p>Dedupes on the {@code (symbol, side)} pair — matching on {@code side} alone would splice
     * out the wrong row, since every position in a multi-symbol cache can share
     * {@code side: 'long'}. The TS constructor takes no {@code maxSize} and the class contains no
     * eviction code, so this variant never evicts.
     */
    public static class ArrayCacheBySymbolBySide extends ArrayCacheBySymbolById {

        public ArrayCacheBySymbolBySide(int maxSize) { super(maxSize); }
        public ArrayCacheBySymbolBySide() { super(); }

        @Override
        protected String subKeyOf(Object item) {
            return keyOf(fieldOf(item, "side"));
        }

        @Override
        protected boolean evictionEnabled() {
            return false;
        }
    }
}
