package io.github.ccxt.ws;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.LinkedBlockingQueue;

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
 *       new fields onto the stored row and keeps that row's identity (Cache.ts:188-192), so
 *       fields absent from the update survive and a view handed out earlier sees the new
 *       values.</li>
 * </ul>
 *
 * <h2>Ownership</h2>
 * The exchange ws owner thread is the only writer ({@code BaseExchange.wsOwner}); every
 * append/clear call site is a ws frame handler. A reader on any other thread never mutates
 * the cache: it reads the immutable view published after each mutation and hands its poll
 * scope back through {@link #pendingPolls}, which the owner applies before its next append.
 */
public class ArrayCache extends ArrayList<Object> {

    /** JS coerces an {@code undefined} object key to the literal string "undefined". */
    protected static final String UNDEFINED_KEY = "undefined";

    /** Poll scope sentinels for the reader-to-owner request queue. */
    protected static final String POLL_ALL = "\0ccxt:all";
    protected static final String POLL_TIMESTAMP = "\0ccxt:timestamp";

    /** {@code <= 0} means unbounded, matching the falsy-maxSize guard in Cache.ts. */
    protected final int maxSize;

    /** Owner-to-reader hand-off: the last published immutable view. */
    protected final OwnerSlot<CacheView> published = new OwnerSlot<>();

    /** Reader-to-owner hand-off: poll scopes whose counters the next append must reset. */
    protected final LinkedBlockingQueue<String> pendingPolls = new LinkedBlockingQueue<>();

    /** The ws owner thread, claimed by the first mutation; null means "nobody has written yet". */
    protected Thread owner;

    /**
     * True only on the thread that owns the cache. An unclaimed cache answers every caller from
     * the published view, which is empty and equals the live state until the first append.
     */
    protected final boolean isOwner() {
        Thread o = this.owner;
        return o != null && o == Thread.currentThread();
    }

    /**
     * Public index read directly by generated exchange code. Shape depends on the variant:
     * {@code ArrayCacheByTimestamp} stores {@code timestamp -> row}; the keyed variants store
     * a nested {@code symbol -> (id|side) -> item}. Plain {@code ArrayCache} never writes here.
     * This is the reader view; the owner writes {@link #liveHashmap}.
     */
    public final Map<String, Object> hashmap;

    protected final Map<String, Object> liveHashmap = new LinkedHashMap<>();

    /** symbol -> update count since the last read. */
    protected final Map<String, Integer> newUpdatesBySymbol = new LinkedHashMap<>();
    /** Distinct ids/sides seen this window when {@link #nestedNewUpdatesBySymbol}. */
    protected final Map<String, Set<String>> seenUpdatesBySymbol = new LinkedHashMap<>();
    /** The same, cleared only by the GLOBAL {@link #getLimit} scope - the two poll scopes are independent. */
    protected final Map<String, Set<String>> seenUpdatesAll = new LinkedHashMap<>();
    /** symbol -> "reset me on the next append". */
    protected final Map<String, Boolean> clearUpdatesBySymbol = new LinkedHashMap<>();
    protected int allNewUpdates = 0;
    protected boolean clearAllUpdates = false;
    /** true when {@link #seenUpdatesBySymbol} tracks distinct ids/sides per symbol. */
    protected boolean nestedNewUpdatesBySymbol = false;

    public ArrayCache(int maxSize) {
        super();
        this.maxSize = maxSize;
        this.hashmap = new PublishedMap(this.published, this);
        this.published.publish(CacheView.EMPTY);
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
     * Field-wise merge of {@code source} onto {@code target}, keeping the stored row's
     * identity — the handed-out view reads the merged fields through it (Cache.ts:188-192).
     * Maps keep keys present only on the target (order deltas). List rows (OHLCV)
     * take the incoming length — a shorter candle must drop the previous tail.
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
                List<Object> to = (List<Object>) target;
                List<Object> from = (List<Object>) source;
                for (int i = 0, n = from.size(); i < n; i++) {
                    if (i < to.size()) {
                        to.set(i, from.get(i));
                    } else {
                        to.add(from.get(i));
                    }
                }
                while (to.size() > from.size()) {
                    to.remove(to.size() - 1);
                }
                return true;
            }
        } catch (UnsupportedOperationException immutableRow) {
            return false;
        }
        // primitives/strings have no enumerable props in JS either — nothing to merge
        return true;
    }

    // ─── publication ───

    /** What a reader may look at: rows and counters as of the last completed mutation. */
    protected static final class CacheView {
        static final CacheView EMPTY = new CacheView(
                Collections.emptyList(), Collections.emptyMap(), Collections.emptyMap(), 0, 0);

        final List<Object> rows;
        final Map<String, Object> hashmap;
        final Map<String, Integer> newUpdates;
        final int allNewUpdates;
        final int timestampNewUpdates;

        CacheView(List<Object> rows, Map<String, Object> hashmap, Map<String, Integer> newUpdates,
                  int allNewUpdates, int timestampNewUpdates) {
            this.rows = rows;
            this.hashmap = hashmap;
            this.newUpdates = newUpdates;
            this.allNewUpdates = allNewUpdates;
            this.timestampNewUpdates = timestampNewUpdates;
        }
    }

    /** Reader view of the index: answers from the published snapshot, never mutates. */
    protected static final class PublishedMap extends java.util.AbstractMap<String, Object> {
        private final OwnerSlot<CacheView> slot;
        private final ArrayCache cache;

        PublishedMap(OwnerSlot<CacheView> slot, ArrayCache cache) {
            this.slot = slot;
            this.cache = cache;
        }

        private Map<String, Object> view() {
            if (this.cache.isOwner()) {
                return this.cache.liveHashmap;
            }
            return slot.latest(CacheView.EMPTY).hashmap;
        }

        @Override
        public Object get(Object key) {
            return this.view().get(key);
        }

        @Override
        public boolean containsKey(Object key) {
            return this.view().containsKey(key);
        }

        @Override
        public int size() {
            return this.view().size();
        }

        @Override
        public Set<Map.Entry<String, Object>> entrySet() {
            return this.view().entrySet();
        }
    }

    /** Variant counters that travel with the published view; base caches publish none. */
    protected int extraCounter() {
        return 0;
    }

    /** Build and publish the immutable reader view. Owner thread only. */
    protected void publishView() {
        List<Object> rows = Collections.unmodifiableList(new ArrayList<>(this));
        Map<String, Object> index = new LinkedHashMap<>(this.liveHashmap.size() * 2 + 2);
        for (Map.Entry<String, Object> entry : this.liveHashmap.entrySet()) {
            Object value = entry.getValue();
            if (value instanceof Map<?, ?> nested) {
                @SuppressWarnings("unchecked")
                Map<String, Object> copy = new LinkedHashMap<>((Map<String, Object>) nested);
                index.put(entry.getKey(), Collections.unmodifiableMap(copy));
            } else {
                index.put(entry.getKey(), value);
            }
        }
        Map<String, Integer> counts = new LinkedHashMap<>(this.newUpdatesBySymbol);
        this.published.publish(new CacheView(rows, Collections.unmodifiableMap(index),
                Collections.unmodifiableMap(counts), this.allNewUpdates, this.extraCounter()));
    }

    /** Record a poll scope for the next append to reset; any reader thread. */
    protected void requestPoll(String symbol) {
        this.pendingPolls.offer(symbol == null ? POLL_ALL : symbol);
    }

    /** Apply the poll scopes readers asked for since the previous mutation. Owner thread only. */
    protected void drainPolls() {
        String scope;
        while ((scope = this.pendingPolls.poll()) != null) {
            if (POLL_ALL.equals(scope)) {
                this.clearAllUpdates = true;
            } else {
                this.clearUpdatesBySymbol.put(scope, Boolean.TRUE);
            }
        }
    }

    /**
     * Stable snapshot for readers: a copy of the live rows on the owner thread, the immutable
     * view the owner published after its last mutation on any other thread.
     */
    public List<Object> snapshot() {
        if (this.isOwner()) {
            // super.toArray(), not new ArrayList<>(this): the inherited Collection copy would
            // route back through the overridden toArray() below and recurse
            return new ArrayList<>(java.util.Arrays.asList(super.toArray()));
        }
        return new ArrayList<>(this.published.latest(CacheView.EMPTY).rows);
    }

    @Override
    public Object[] toArray() {
        return this.snapshot().toArray();
    }

    @Override
    public <T> T[] toArray(T[] a) {
        return this.snapshot().toArray(a);
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
    public void clear() {
        this.owner = Thread.currentThread();
        super.clear();
        this.liveHashmap.clear();
        this.newUpdatesBySymbol.clear();
        this.seenUpdatesBySymbol.clear();
        this.seenUpdatesAll.clear();
        this.clearUpdatesBySymbol.clear();
        this.allNewUpdates = 0;
        this.clearAllUpdates = false;
        this.publishView();
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
    public Long getLimit(String symbol, Long limit) {
        Integer newUpdatesValue;
        if (this.isOwner()) {
            if (symbol == null) {
                newUpdatesValue = this.allNewUpdates;
                this.clearAllUpdates = true;
            } else {
                newUpdatesValue = this.newUpdatesBySymbol.get(symbol);
                this.clearUpdatesBySymbol.put(symbol, Boolean.TRUE);
            }
        } else {
            // a reader never writes the counters: it hands its poll scope to the owner, which
            // resets them before its next append — the reset is deferred in Cache.ts anyway
            CacheView view = this.published.latest(CacheView.EMPTY);
            this.requestPoll(symbol);
            // if/else, not a ternary: `int ?: Integer` unboxes the map result and NPEs on an
            // unseen symbol, where Cache.ts returns undefined and the caller gets `limit` back
            if (symbol == null) {
                newUpdatesValue = view.allNewUpdates;
            } else {
                newUpdatesValue = view.newUpdates.get(symbol);
            }
        }
        if (newUpdatesValue == null) {
            return limit;
        } else if (limit != null) {
            return Math.min(newUpdatesValue.longValue(), limit);
        }
        return newUpdatesValue.longValue();
    }

    /**
     * {@code cache.getLimit(symbol, limit)} for a resolved ws list stream: a cache answers its
     * count, a plain resolved list the caller's limit (the Go {@code ToGetsLimit} counterpart).
     */
    public static Long getLimitOf(Object cache, Object symbol, Object limit) {
        Long cap = switch (limit) { case null -> (Long) null; case Long hx4J42l -> hx4J42l; case Number hx4J42n -> Long.valueOf(hx4J42n.longValue()); default -> throw new ClassCastException("ccxt: expected a number, got " + limit.getClass().getName()); };
        if (cache instanceof ArrayCache arrayCache) {
            return arrayCache.getLimit(java.util.Objects.toString(symbol, null), cap);
        }
        return cap;
    }

    /** {@link #getLimitOf(Object, Object, Object)} for a typed list-stream local and typed arguments. */
    public static Long getLimitOf(java.util.List<Object> cache, String symbol, Long limit) {
        if (cache instanceof ArrayCache arrayCache) {
            return arrayCache.getLimit(symbol, limit);
        }
        return limit;
    }

    /** Performs the reset that a previous {@link #getLimit} only flagged (Cache.ts:93-102). */
    protected void applyDeferredResets() {
        if (this.clearAllUpdates) {
            this.clearAllUpdates = false;
            // the global poll consumes only the global scope: the symbol-scoped
            // seen sets, counts and pending flags belong to the symbol consumers
            this.allNewUpdates = 0;
            this.seenUpdatesAll.clear();
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
    public void append(Object item) {
        this.owner = Thread.currentThread();
        if (this.shouldEvict()) {
            this.remove(0);
        }
        this.add(item);

        String key = keyOf(fieldOf(item, "symbol"));
        this.drainPolls();
        this.applyDeferredResets();
        if (Boolean.TRUE.equals(this.clearUpdatesBySymbol.get(key))) {
            this.clearUpdatesBySymbol.put(key, Boolean.FALSE);
            this.newUpdatesBySymbol.put(key, 0);
        }
        Integer previous = this.newUpdatesBySymbol.get(key);
        int count = (previous == null) ? 0 : previous.intValue();
        this.newUpdatesBySymbol.put(key, count + 1);
        this.allNewUpdates = this.allNewUpdates + 1;
        this.publishView();
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

        @Override
        protected int extraCounter() {
            return this.timestampNewUpdates;
        }

        @Override
        protected void drainPolls() {
            if (this.pendingPolls.isEmpty()) {
                return;
            }
            while (this.pendingPolls.poll() != null) {
                this.clearUpdates = true;
            }
        }

        /** Counts distinct timestamps, ignores {@code symbol} entirely (Cache.ts:134-140). */
        @Override
        public Long getLimit(String symbol, Long limit) {
            int newUpdates;
            if (this.isOwner()) {
                newUpdates = this.timestampNewUpdates;
                this.clearUpdates = true;
            } else {
                this.requestPoll(POLL_TIMESTAMP);
                newUpdates = this.published.latest(CacheView.EMPTY).timestampNewUpdates;
            }
            if (limit == null) {
                return (long) newUpdates;
            }
            return Math.min((long) newUpdates, limit);
        }

        @Override
        public void clear() {
            super.clear();
            this.sizeTracker.clear();
            this.timestampNewUpdates = 0;
            this.clearUpdates = false;
            this.publishView();
        }

        @Override
        public void append(Object item) {
            this.owner = Thread.currentThread();
            String key = keyOf(timestampKeyOf(item));
            Object reference = this.liveHashmap.get(key);
            if (reference != null) {
                // a repeat timestamp is merged into the stored row and keeps its position —
                // ArrayCacheByTimestamp does NOT move updated rows to the end (Cache.ts:143-150)
                if (reference != item && !mergeInto(reference, item)) {
                    int index = this.indexOfIdentity(reference);
                    if (index >= 0) {
                        this.set(index, item);
                    }
                    this.liveHashmap.put(key, item);
                }
            } else {
                this.liveHashmap.put(key, item);
                if (this.shouldEvict()) {
                    Object evicted = this.remove(0);
                    this.liveHashmap.remove(keyOf(timestampKeyOf(evicted)));
                }
                this.add(item);
            }
            this.drainPolls();
            if (this.clearUpdates) {
                this.clearUpdates = false;
                this.sizeTracker.clear();
            }
            this.sizeTracker.add(key);
            this.timestampNewUpdates = this.sizeTracker.size();
            this.publishView();
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
            Object existing = this.liveHashmap.get(key);
            if (existing instanceof Map) {
                return (Map<String, Object>) existing;
            }
            Map<String, Object> created = new LinkedHashMap<>();
            this.liveHashmap.put(key, created);
            return created;
        }

        /** {@link ArrayCacheBySymbolBySide} has no eviction block at all in TS. */
        protected boolean evictionEnabled() {
            return true;
        }

        @Override
        @SuppressWarnings("unchecked")
        public void append(Object item) {
            this.owner = Thread.currentThread();
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
                String evictedKey = keyOf(fieldOf(evicted, this.keyField));
                Object evictedBucket = this.liveHashmap.get(evictedKey);
                if (evictedBucket instanceof Map) {
                    ((Map<String, Object>) evictedBucket).remove(this.subKeyOf(evicted));
                }
                // the evicted id also leaves both seen scopes so single-scope
                // pollers stay bounded - the counts mean distinct ids within
                // the retained window
                Set<String> evictedSymbolSeen = this.seenUpdatesBySymbol.get(evictedKey);
                if (evictedSymbolSeen != null && evictedSymbolSeen.remove(this.subKeyOf(evicted))) {
                    this.newUpdatesBySymbol.put(evictedKey, this.newUpdatesBySymbol.get(evictedKey) - 1);
                    if (evictedSymbolSeen.isEmpty()) {
                        this.seenUpdatesBySymbol.remove(evictedKey);
                    }
                }
                Set<String> evictedAllSeen = this.seenUpdatesAll.get(evictedKey);
                if (evictedAllSeen != null && evictedAllSeen.remove(this.subKeyOf(evicted))) {
                    this.allNewUpdates = this.allNewUpdates - 1;
                    if (evictedAllSeen.isEmpty()) {
                        this.seenUpdatesAll.remove(evictedKey);
                    }
                }
            }
            this.add(toStore);

            this.drainPolls();
            this.applyDeferredResets();
            Set<String> idSet = this.seenUpdatesBySymbol.get(key);
            if (idSet == null) {
                idSet = new LinkedHashSet<String>();
                this.seenUpdatesBySymbol.put(key, idSet);
            }
            if (Boolean.TRUE.equals(this.clearUpdatesBySymbol.get(key))) {
                this.clearUpdatesBySymbol.put(key, Boolean.FALSE);
                idSet.clear();
            }
            // an exchange may update the same id twice — count it once per window
            idSet.add(subKey);
            this.newUpdatesBySymbol.put(key, idSet.size());
            // the global scope keeps its own seen sets: the symbol-scoped poll clears
            // the symbol set, and deriving the global count from that set double-counts
            // an id that updates again after a symbol poll
            Set<String> allIdSet = this.seenUpdatesAll.get(key);
            if (allIdSet == null) {
                allIdSet = new LinkedHashSet<String>();
                this.seenUpdatesAll.put(key, allIdSet);
            }
            int beforeAll = allIdSet.size();
            allIdSet.add(subKey);
            this.allNewUpdates = this.allNewUpdates + (allIdSet.size() - beforeAll);
            this.publishView();
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
