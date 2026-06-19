package io.github.ccxt.ws;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Fixed-size FIFO cache with deduplication and new-update tracking.
 * Matches C# ArrayCache.cs and JS Cache.ts.
 *
 * Used for streaming data: trades, tickers, OHLCV, etc.
 * When newUpdates=true, watch methods return only items added since last read.
 */
public class ArrayCache extends ArrayList<Object> {

    protected final int maxSize;
    public final ConcurrentHashMap<String, Object> hashmap = new ConcurrentHashMap<>();
    protected final ConcurrentHashMap<String, Integer> newUpdatesBySymbol = new ConcurrentHashMap<>();
    protected final AtomicInteger newUpdates = new AtomicInteger(0);

    public ArrayCache(int maxSize) {
        super();
        this.maxSize = maxSize > 0 ? maxSize : 1000;
    }

    public ArrayCache() {
        this(1000);
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
     * Append an item to the cache. Evicts oldest if full.
     * Tracks new updates per symbol for the newUpdates mechanism.
     */
    @SuppressWarnings("unchecked")
    public synchronized void append(Object item) {
        if (this.size() >= this.maxSize) {
            this.remove(0);
        }
        this.add(item);
        this.newUpdates.incrementAndGet();

        // Track per-symbol if item has a symbol field
        if (item instanceof Map) {
            Object symbol = ((Map<String, Object>) item).get("symbol");
            if (symbol instanceof String s) {
                this.newUpdatesBySymbol.merge(s, 1, Integer::sum);
            }
        }
    }

    /**
     * Get the number of new updates (since last call) for a symbol.
     * Resets the counter after reading.
     */
    public synchronized int getLimit(String symbol, Integer limit) {
        this.newUpdates.set(0);
        if (symbol != null) {
            Integer count = this.newUpdatesBySymbol.remove(symbol);
            return count != null ? count : 0;
        }
        int total = 0;
        for (int v : this.newUpdatesBySymbol.values()) {
            total += v;
        }
        this.newUpdatesBySymbol.clear();
        return total;
    }

    // ─── Variants ───

    /**
     * Cache indexed by timestamp (for OHLCV data).
     * Updates existing entries by timestamp rather than appending duplicates.
     */
    public static class ArrayCacheByTimestamp extends ArrayCache {

        // Maps timestamp key -> list index for O(1) lookup instead of O(n) indexOf
        private final HashMap<String, Integer> sizeIndex = new HashMap<>();

        public ArrayCacheByTimestamp(int maxSize) { super(maxSize); }
        public ArrayCacheByTimestamp() { super(); }

        @Override
        @SuppressWarnings("unchecked")
        public synchronized void append(Object item) {
            if (item instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) item;
                Object ts = map.get("timestamp");
                if (ts != null) {
                    String key = ts.toString();
                    Integer existingIdx = this.sizeIndex.get(key);
                    if (existingIdx != null && existingIdx < this.size()) {
                        // Update in place — O(1) lookup
                        this.set(existingIdx, item);
                        this.hashmap.put(key, item);
                        this.newUpdates.incrementAndGet();
                        return;
                    }
                    this.hashmap.put(key, item);
                }
            }
            // On eviction, all indices shift down by 1
            boolean willEvict = this.size() >= this.maxSize;
            if (willEvict) {
                // Remove the evicted item's key from sizeIndex
                Object evicted = this.get(0);
                if (evicted instanceof Map) {
                    Object evictedTs = ((Map<String, Object>) evicted).get("timestamp");
                    if (evictedTs != null) {
                        this.sizeIndex.remove(evictedTs.toString());
                        this.hashmap.remove(evictedTs.toString());
                    }
                }
                // Shift all indices down by 1
                for (var entry : this.sizeIndex.entrySet()) {
                    entry.setValue(entry.getValue() - 1);
                }
            }
            // Record index for the new item before calling super.append
            if (item instanceof Map) {
                Object ts = ((Map<String, Object>) item).get("timestamp");
                if (ts != null) {
                    this.sizeIndex.put(ts.toString(), willEvict ? this.maxSize - 1 : this.size());
                }
            }
            super.append(item);
        }
    }

    /**
     * Cache indexed by symbol then by ID (for orders, positions).
     */
    public static class ArrayCacheBySymbolById extends ArrayCache {

        private final HashMap<String, HashMap<String, Object>> symbolMap = new HashMap<>();
        // Maps composite key (symbol:id) -> list index for O(1) lookup
        private final HashMap<String, Integer> sizeIndex = new HashMap<>();
        protected String keyField = "symbol"; // first nesting level (overridden by ArrayCacheByOutcomeById)

        public ArrayCacheBySymbolById(int maxSize) { super(maxSize); }
        public ArrayCacheBySymbolById() { super(); }

        private static String compositeKey(String symbol, String id) {
            return symbol + ":" + id;
        }

        @Override
        @SuppressWarnings("unchecked")
        public synchronized void append(Object item) {
            if (item instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) item;
                String symbol = map.get(this.keyField) != null ? map.get(this.keyField).toString() : "";
                String id = map.get("id") != null ? map.get("id").toString() : null;

                if (id != null) {
                    String ckey = compositeKey(symbol, id);
                    HashMap<String, Object> byId = symbolMap.computeIfAbsent(symbol, k -> new HashMap<>());
                    Integer existingIdx = this.sizeIndex.get(ckey);
                    if (existingIdx != null && existingIdx < this.size()) {
                        // Update in place — O(1) lookup
                        this.set(existingIdx, item);
                        byId.put(id, item);
                        this.newUpdates.incrementAndGet();
                        if (!symbol.isEmpty()) {
                            this.newUpdatesBySymbol.merge(symbol, 1, Integer::sum);
                        }
                        return;
                    }
                    byId.put(id, item);
                }
            }
            // On eviction, all indices shift down by 1
            boolean willEvict = this.size() >= this.maxSize;
            if (willEvict) {
                Object evicted = this.get(0);
                if (evicted instanceof Map) {
                    Map<String, Object> evictedMap = (Map<String, Object>) evicted;
                    String eSymbol = evictedMap.get(this.keyField) != null ? evictedMap.get(this.keyField).toString() : "";
                    String eId = evictedMap.get("id") != null ? evictedMap.get("id").toString() : null;
                    if (eId != null) {
                        this.sizeIndex.remove(compositeKey(eSymbol, eId));
                        HashMap<String, Object> byId = symbolMap.get(eSymbol);
                        if (byId != null) byId.remove(eId);
                    }
                }
                for (var entry : this.sizeIndex.entrySet()) {
                    entry.setValue(entry.getValue() - 1);
                }
            }
            // Record index for the new item
            if (item instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) item;
                String symbol = map.get(this.keyField) != null ? map.get(this.keyField).toString() : "";
                String id = map.get("id") != null ? map.get("id").toString() : null;
                if (id != null) {
                    this.sizeIndex.put(compositeKey(symbol, id), willEvict ? this.maxSize - 1 : this.size());
                }
            }
            super.append(item);
        }
    }

    /**
     * Cache indexed by outcome then by id (prediction markets).
     */
    public static class ArrayCacheByOutcomeById extends ArrayCacheBySymbolById {
        public ArrayCacheByOutcomeById(int maxSize) { super(maxSize); this.keyField = "outcome"; }
        public ArrayCacheByOutcomeById() { super(); this.keyField = "outcome"; }
    }

    /**
     * Cache indexed by symbol then by side (for bids/asks).
     */
    public static class ArrayCacheBySymbolBySide extends ArrayCache {

        public ArrayCacheBySymbolBySide(int maxSize) { super(maxSize); }
        public ArrayCacheBySymbolBySide() { super(); }
    }
}
