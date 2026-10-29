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
public class WsOrderBook extends java.util.AbstractMap<String, Object> {

    // typed as the base side so IndexedOrderBook can carry id-keyed sides,
    // see https://github.com/ccxt/ccxt/pull/29749 and the class docs on
    // IndexedOrderBookSide; all external access goes through get()/put() and
    // reflective calls, the concrete runtime type decides the behavior
    public OrderBookSide asks;
    public OrderBookSide bids;
    public String symbol;
    public Object timestamp;
    public Object datetime;
    public Object nonce;
    // prediction-market identity (null for crypto exchanges)
    public Object outcome;
    public Object outcomeId;
    public Object market;
    public final List<Object> cache = new ArrayList<>();

    /** Owner-to-reader hand-off: scalars and side references as of the last completed write. */
    private final OwnerSlot<Meta> publishedMeta = new OwnerSlot<>();

    /** The ws owner thread, claimed by the first write; null means "nobody has written yet". */
    private Thread owner;

    /**
     * True only on the thread that owns the book. An unclaimed book answers from the published
     * record, which is empty until the first write, so a reader never touches live sides.
     */
    protected final boolean isOwner() {
        Thread o = this.owner;
        return o != null && o == Thread.currentThread();
    }

    /** Immutable reader view of the book's scalars and live side references. */
    static final class Meta {
        final OrderBookSide asks;
        final OrderBookSide bids;
        final String symbol;
        final Object timestamp;
        final Object datetime;
        final Object nonce;
        final Object outcome;
        final Object outcomeId;
        final Object market;

        Meta(OrderBookSide asks, OrderBookSide bids, String symbol, Object timestamp, Object datetime,
             Object nonce, Object outcome, Object outcomeId, Object market) {
            this.asks = asks;
            this.bids = bids;
            this.symbol = symbol;
            this.timestamp = timestamp;
            this.datetime = datetime;
            this.nonce = nonce;
            this.outcome = outcome;
            this.outcomeId = outcomeId;
            this.market = market;
        }
    }

    /** Publish the scalars and side references a reader may use; owner thread only. */
    void publishMeta() {
        this.owner = Thread.currentThread();
        this.publishedMeta.publish(new Meta(this.asks, this.bids, this.symbol, this.timestamp,
                this.datetime, this.nonce, this.outcome, this.outcomeId, this.market));
    }

    private Meta meta() {
        // the owner reads its own writes; a reader gets the record the owner published last
        if (this.isOwner()) {
            return new Meta(this.asks, this.bids, this.symbol, this.timestamp, this.datetime,
                    this.nonce, this.outcome, this.outcomeId, this.market);
        }
        Meta published = this.publishedMeta.latest(null);
        if (published != null) {
            return published;
        }
        return new Meta(this.asks, this.bids, this.symbol, this.timestamp, this.datetime,
                this.nonce, this.outcome, this.outcomeId, this.market);
    }

    // ─── Map view (C# parity) ───
    // the generated isDictionary() is `instanceof java.util.Map` (see the Helpers.isObject
    // rationale for why transpiled checks are strict); C#'s OrderBook satisfies IDictionary,
    // Java must too or shared structure tests fail with "entry is not a dict",
    // see https://github.com/ccxt/ccxt/issues/29595 and https://github.com/ccxt/ccxt/pull/29594
    private static final List<String> BASE_KEYS = List.of(
        "asks", "bids", "timestamp", "datetime", "nonce");

    @Override
    public Object get(Object key) {
        if (!(key instanceof String)) {
            return null; // Map contract: unknown key types are absent, not a CCE
        }
        switch ((String) key) {
            case "asks": return this.asks; // live side, delta handlers depend on it
            case "bids": return this.bids;
            case "symbol": return this.symbol;
            case "timestamp": return this.timestamp;
            case "datetime": return this.datetime;
            case "nonce": return this.nonce;
            case "cache": return this.cache; // snapshot-buffering exchanges (gate, binance) access it as a map key,
            // absent here it NPEs the shared ws frame handler, see https://github.com/ccxt/ccxt/pull/29612
            case "outcome": return this.outcome;
            case "outcomeId": return this.outcomeId;
            case "market": return this.market;
            default: return null;
        }
    }

    @Override
    public boolean containsKey(Object key) {
        if ("cache".equals(key)) {
            return true; // keyed access for snapshot-buffering handlers; stays out of entrySet()/toMap(),
            // see https://github.com/ccxt/ccxt/pull/29620
        }
        if (BASE_KEYS.contains(key)) {
            return true;
        }
        // mirror toMap()/C#: prediction identity keys only when set, symbol otherwise
        if (this.outcome != null) {
            return "outcome".equals(key) || "outcomeId".equals(key) || "market".equals(key);
        }
        return "symbol".equals(key);
    }

    @Override
    public Object put(String key, Object value) {
        Object prev = this.get(key);
        switch (key) {
            case "asks": this.asks = (OrderBookSide) value; break;
            case "bids": this.bids = (OrderBookSide) value; break;
            case "symbol": this.symbol = (String) value; break;
            case "timestamp": this.timestamp = value; break;
            case "datetime": this.datetime = value; break;
            case "nonce": this.nonce = value; break;
            case "cache": {
                // the field is final: replace contents, not the reference
                this.cache.clear();
                if (value instanceof java.util.List) {
                    this.cache.addAll((java.util.List<?>) value);
                }
                break;
            }
            case "outcome": this.outcome = value; break;
            case "outcomeId": this.outcomeId = value; break;
            case "market": this.market = value; break;
            default: throw new IllegalArgumentException("WsOrderBook has no field " + key);
        }
        this.publishMeta();
        return prev;
    }

    @Override
    public java.util.Set<Map.Entry<String, Object>> entrySet() {
        // snapshot view: hash-based consumers (LinkedHashSet/HashMap/AbstractMap.hashCode)
        // call hashCode() on entry values, and hashing the *live* OrderBookSide races the
        // ws owner thread (ConcurrentModificationException). toMap() already returns
        // published snapshot copies with the exact same key semantics,
        // see https://github.com/ccxt/ccxt/pull/29596
        return this.toMap().entrySet();
    }

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

            this.asks.beginBatch();
            this.bids.beginBatch();
            Object asksData = snap.get("asks");
            if (asksData instanceof List) {
                for (Object delta : (List<?>) asksData) {
                    this.asks.storeArrayUnsafe(delta);
                }
            }
            Object bidsData = snap.get("bids");
            if (bidsData instanceof List) {
                for (Object delta : (List<?>) bidsData) {
                    this.bids.storeArrayUnsafe(delta);
                }
            }
            this.asks.endBatch();
            this.bids.endBatch();
        }
        this.publishMeta();
    }

    public WsOrderBook() {
        this(null, null);
    }

    /** Reset from a REST snapshot Map: replaces metadata and clears+repopulates both sides.
     *  Owner thread only; readers see the previous published record until it is republished.
     *  Exchanges that pass `reset({})` and then individually set
     *  timestamp/datetime (upbit, bitmart, cryptocom) still have a window between reset()
     *  returning and the addElementToObject calls — that's a per-handler issue, not fixed
     *  here. */
    @SuppressWarnings("unchecked")
    public void reset(Object snapshot) {
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
        // clear + repopulate is one batched write per side, so a reader never sees
        // an empty list published against an index still holding the old prices.
        this.asks.beginBatch();
        this.bids.beginBatch();
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
        this.asks.endBatch();
        this.bids.endBatch();
        this.publishMeta();
    }

    /** Truncate both sides to the configured depth. Returns this for chaining. */
    public WsOrderBook limit() {
        Meta meta = this.meta();
        meta.asks.limit();
        meta.bids.limit();
        return this;
    }

    /** Map view of the orderbook; asks/bids are the published row copies so callers can
     *  iterate without racing the ws owner thread that applies deltas, and the scalars come
     *  from the same published record, so a reader sees one consistent write. */
    public Map<String, Object> toMap() {
        Meta meta = this.meta();
        Map<String, Object> result = new HashMap<>();
        result.put("asks", meta.asks.snapshot());
        result.put("bids", meta.bids.snapshot());
        result.put("timestamp", meta.timestamp);
        result.put("datetime", meta.datetime);
        result.put("nonce", meta.nonce);
        // prediction books are keyed by `outcome` (no `symbol`); crypto books by `symbol`
        if (meta.outcome != null) {
            result.put("outcome", meta.outcome);
            result.put("outcomeId", meta.outcomeId);
            result.put("market", meta.market);
        } else {
            result.put("symbol", meta.symbol);
        }
        return result;
    }

    public WsOrderBook copy() {
        Meta meta = this.meta();
        Map<String, Object> snapshot = this.toMap();
        WsOrderBook copy;
        if (this instanceof IndexedOrderBook) {
            copy = new IndexedOrderBook(null, meta.asks.depth);
        } else if (this instanceof CountedOrderBook) {
            copy = new CountedOrderBook(null, meta.asks.depth);
        } else {
            copy = new WsOrderBook(null, meta.asks.depth);
        }
        copy.reset(snapshot);
        return copy;
    }

    // ─── Variants ───

    public static class IndexedOrderBook extends WsOrderBook {
        @SuppressWarnings("unchecked")
        public IndexedOrderBook(Object snapshot, Object depth) {
            // the parent constructor would seed plain price-keyed sides; pass
            // it no snapshot, install the id-keyed sides, then seed those
            super(null, depth);
            this.asks = new IndexedOrderBookSide.IndexedAsks(null, depth);
            this.bids = new IndexedOrderBookSide.IndexedBids(null, depth);
            this.asks.beginBatch();
            this.bids.beginBatch();
            if (snapshot instanceof Map) {
                Map<String, Object> snap = (Map<String, Object>) snapshot;
                this.symbol = (String) snap.get("symbol");
                this.timestamp = snap.get("timestamp");
                this.datetime = snap.get("datetime");
                this.nonce = snap.get("nonce");
                Object asksData = snap.get("asks");
                if (asksData instanceof List) {
                    for (Object delta : (List<?>) asksData) {
                        this.asks.storeArrayUnsafe(delta);
                    }
                }
                Object bidsData = snap.get("bids");
                if (bidsData instanceof List) {
                    for (Object delta : (List<?>) bidsData) {
                        this.bids.storeArrayUnsafe(delta);
                    }
                }
            }
            this.asks.endBatch();
            this.bids.endBatch();
            this.publishMeta();
        }
        public IndexedOrderBook() { this(null, null); }
    }

    public static class CountedOrderBook extends WsOrderBook {
        public CountedOrderBook(Object snapshot, Object depth) {
            super(snapshot, depth);
        }
        public CountedOrderBook() { super(); }
    }
}
