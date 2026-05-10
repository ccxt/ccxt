package io.github.ccxt.ws;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * WebSocket order book with snapshot + delta support.
 * Matches C# OrderBook.cs and JS OrderBook.ts.
 *
 * Usage:
 * 1. Create empty: orderBook({}, limit)
 * 2. Buffer incoming deltas in cache while fetching REST snapshot
 * 3. reset(snapshot) to initialize from REST data
 * 4. Apply buffered deltas, then live deltas via handleDeltas()
 */
public class WsOrderBook {

    public OrderBookSide.Asks asks;
    public OrderBookSide.Bids bids;
    public String symbol;
    public Object timestamp;
    public Object datetime;
    public Object nonce;
    public final List<Object> cache = new ArrayList<>();

    public WsOrderBook(Object snapshot, Object depth) {
        this.asks = new OrderBookSide.Asks(null, depth);
        this.bids = new OrderBookSide.Bids(null, depth);

        if (snapshot instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> snap = (Map<String, Object>) snapshot;
            this.symbol = (String) snap.get("symbol");
            this.timestamp = snap.get("timestamp");
            this.datetime = snap.get("datetime");
            this.nonce = snap.get("nonce");

            Object asksData = snap.get("asks");
            if (asksData instanceof List) {
                synchronized (this.asks) {
                    for (Object delta : (List<?>) asksData) {
                        this.asks.storeArrayUnsafe(delta);
                    }
                }
            }
            Object bidsData = snap.get("bids");
            if (bidsData instanceof List) {
                synchronized (this.bids) {
                    for (Object delta : (List<?>) bidsData) {
                        this.bids.storeArrayUnsafe(delta);
                    }
                }
            }
        }
    }

    public WsOrderBook() {
        this(null, null);
    }

    /**
     * Reset from a REST snapshot. Clears all existing data and repopulates.
     */
    @SuppressWarnings("unchecked")
    public void reset(Object snapshot) {
        Map<String, Object> snap = (snapshot instanceof Map) ? (Map<String, Object>) snapshot : null;

        // Mirror TS OrderBook.reset() at ts/src/base/ws/OrderBook.ts:120 — the
        // snapshot Map (built by parseOrderBook) carries `symbol`, but Java's
        // hand-written reset() previously dropped it on the floor, leaving every
        // subsequent watchOrderBook* response with `symbol=null` and tripping the
        // test harness's "symbol must have a value" assertion across ~30 exchanges.
        if (snap != null) {
            this.symbol = (String) snap.get("symbol");
            this.nonce = snap.get("nonce");
            this.timestamp = snap.get("timestamp");
            this.datetime = snap.get("datetime");
        }

        // Atomic clear+repopulate against the side's own monitor so a concurrent
        // toMap() snapshot can never observe a cleared list with a stale index.
        synchronized (this.asks) {
            this.asks.clear();
            this.asks.index.clear();
            if (snap != null) {
                Object asksData = snap.get("asks");
                if (asksData instanceof List) {
                    for (Object delta : (List<?>) asksData) {
                        this.asks.storeArrayUnsafe(delta);
                    }
                }
            }
        }
        synchronized (this.bids) {
            this.bids.clear();
            this.bids.index.clear();
            if (snap != null) {
                Object bidsData = snap.get("bids");
                if (bidsData instanceof List) {
                    for (Object delta : (List<?>) bidsData) {
                        this.bids.storeArrayUnsafe(delta);
                    }
                }
            }
        }
    }

    /**
     * Truncate both sides to the configured depth.
     * Returns this for chaining (matches TS behavior where orderbook.limit() returns the orderbook).
     */
    public WsOrderBook limit() {
        this.asks.limit();
        this.bids.limit();
        return this;
    }

    /**
     * Get the cache list (used by transpiled code via reflection).
     */
    public List<Object> getCache() {
        return this.cache;
    }

    /**
     * Set the cache (used by transpiled code via reflection).
     */
    public void setCache(List<Object> newCache) {
        this.cache.clear();
        this.cache.addAll(newCache);
    }

    /**
     * Convert to Map representation (for resolve/return).
     */
    public Map<String, Object> toMap() {
        Map<String, Object> result = new HashMap<>();
        result.put("symbol", this.symbol);
        // Defensive snapshot: handing out the live OrderBookSide races with the
        // per-WsClient messageExecutor thread (which keeps mutating via storeArray /
        // limit / reset). Mirrors C# OrderBookSide.cs which uses lock + a snapshot
        // enumerator. JS gets away with the live reference because of single-thread
        // semantics; Java does not.
        result.put("asks", this.asks.snapshot());
        result.put("bids", this.bids.snapshot());
        result.put("timestamp", this.timestamp);
        result.put("datetime", this.datetime);
        result.put("nonce", this.nonce);
        return result;
    }

    // ─── Variants ───

    public static class IndexedOrderBook extends WsOrderBook {
        public IndexedOrderBook(Object snapshot, Object depth) {
            super(snapshot, depth);
        }
        public IndexedOrderBook() { super(); }
    }

    public static class CountedOrderBook extends WsOrderBook {
        public CountedOrderBook(Object snapshot, Object depth) {
            super(snapshot, depth);
        }
        public CountedOrderBook() { super(); }
    }
}
