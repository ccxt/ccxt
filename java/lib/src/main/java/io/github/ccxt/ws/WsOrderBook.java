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
    // prediction-market identity (null for crypto exchanges)
    public Object outcome;
    public Object outcomeId;
    public Object market;
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

    /** Reset from a REST snapshot Map: replaces metadata and clears+repopulates both sides.
     *  Synchronized on `this` so concurrent toMap() readers can't observe a torn write
     *  of the scalar fields. Exchanges that pass `reset({})` and then individually set
     *  timestamp/datetime (upbit, bitmart, cryptocom) still have a window between reset()
     *  returning and the addElementToObject calls — that's a per-handler issue, not fixed
     *  here. */
    @SuppressWarnings("unchecked")
    public synchronized void reset(Object snapshot) {
        Map<String, Object> snap = (snapshot instanceof Map) ? (Map<String, Object>) snapshot : null;
        if (snap != null) {
            this.symbol = (String) snap.get("symbol");
            this.nonce = snap.get("nonce");
            this.timestamp = snap.get("timestamp");
            this.datetime = snap.get("datetime");
            this.outcome = snap.get("outcome");
            this.outcomeId = snap.get("outcomeId");
            this.market = snap.get("market");
        }
        // clear + repopulate must be one critical section per side, otherwise
        // a concurrent toMap() snapshot can observe an empty list while the
        // index still holds the old prices, leaving the two length-misaligned.
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

    /** Truncate both sides to the configured depth. Returns this for chaining. */
    public WsOrderBook limit() {
        this.asks.limit();
        this.bids.limit();
        return this;
    }

    public List<Object> getCache() {
        return this.cache;
    }

    public void setCache(List<Object> newCache) {
        this.cache.clear();
        this.cache.addAll(newCache);
    }

    /** Map view of the orderbook; asks/bids are snapshot copies so callers can iterate
     *  without racing the WsClient thread that keeps applying deltas to the live sides.
     *  Synchronized so the scalar fields (timestamp/datetime/nonce/symbol) are read
     *  atomically as a group — pairs with Helpers.addElementToObject's reflective
     *  branch, which takes the same monitor when an exchange handler does e.g.
     *  `addElementToObject(orderbook, "timestamp", ts)` and then `... "datetime", iso`. */
    public synchronized Map<String, Object> toMap() {
        Map<String, Object> result = new HashMap<>();
        result.put("asks", this.asks.snapshot());
        result.put("bids", this.bids.snapshot());
        result.put("timestamp", this.timestamp);
        result.put("datetime", this.datetime);
        result.put("nonce", this.nonce);
        // prediction books are keyed by `outcome` (no `symbol`); crypto books by `symbol`
        if (this.outcome != null) {
            result.put("outcome", this.outcome);
            result.put("outcomeId", this.outcomeId);
            result.put("market", this.market);
        } else {
            result.put("symbol", this.symbol);
        }
        return result;
    }

    public synchronized WsOrderBook copy() {
        Map<String, Object> snapshot = new HashMap<>();
        if (this.outcome != null) {
            snapshot.put("outcome", this.outcome);
            snapshot.put("outcomeId", this.outcomeId);
            snapshot.put("market", this.market);
        } else {
            snapshot.put("symbol", this.symbol);
        }
        WsOrderBook copy;
        if (this instanceof IndexedOrderBook) {
            copy = new IndexedOrderBook(snapshot, this.asks.depth);
        } else if (this instanceof CountedOrderBook) {
            copy = new CountedOrderBook(snapshot, this.asks.depth);
        } else {
            copy = new WsOrderBook(snapshot, this.asks.depth);
        }
        copy.asks = (OrderBookSide.Asks) this.asks.copy();
        copy.bids = (OrderBookSide.Bids) this.bids.copy();
        copy.nonce = this.nonce;
        copy.timestamp = this.timestamp;
        copy.datetime = this.datetime;
        return copy;
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
