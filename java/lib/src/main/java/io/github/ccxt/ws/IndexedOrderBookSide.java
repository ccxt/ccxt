package io.github.ccxt.ws;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Id-keyed order book side for exchanges whose deltas carry [price, size, id]
 * (bitfinex, bitmex, luno). Java lane of the indexed-orderbook audit behind
 * https://github.com/ccxt/ccxt/pull/29749 (ts/php/py/cs) and
 * https://github.com/ccxt/ccxt/pull/29751 (go): before this class existed,
 * IndexedOrderBook fell back to the price-keyed OrderBookSide, which collapsed
 * distinct orders sharing a price into one row, deleted whole price levels on
 * single-order cancels, and silently dropped bitmex's price-less updates and
 * deletes on the null-price guard.
 *
 * Semantics mirror ts/src/base/ws/OrderBookSide.ts IndexedOrderBookSide with
 * the hardening the other lanes converged on: hashmap keys and row-id
 * comparisons are string-normalized (ids arrive as fresh objects of varying
 * runtime types from json parsing), row lookups are bounded so a stale hashmap
 * entry degrades gracefully instead of overrunning, a missing price on a known
 * id is recovered from the hashmap, and limit() unmaps the ids it trims.
 */
public class IndexedOrderBookSide extends OrderBookSide {

    protected final HashMap<String, BigDecimal> hashmap = new HashMap<>();

    public IndexedOrderBookSide(List<Object> deltas, Object depth, boolean side) {
        // the base constructor seeds through storeArrayUnsafe, which this
        // class overrides, but the override touches this.hashmap, whose field
        // initializer only runs after super() returns — so the base is given
        // no deltas and seeding happens below, against a live hashmap
        super(null, depth, side);
        if (deltas != null) {
            synchronized (this) {
                for (Object delta : deltas) {
                    this.storeArrayUnsafe(delta);
                }
            }
        }
    }

    public IndexedOrderBookSide(boolean side) {
        this(null, null, side);
    }

    private static BigDecimal toBigDecimalOrNull(Object val) {
        if (val == null) return null;
        if (val instanceof BigDecimal bd) return bd;
        if (val instanceof Number n) {
            double d = n.doubleValue();
            if (Double.isNaN(d) || Double.isInfinite(d)) return null;
            return BigDecimal.valueOf(d);
        }
        if (val instanceof String s) {
            try { return new BigDecimal(s); } catch (NumberFormatException e) { return null; }
        }
        return null;
    }

    // bounded row lookup by normalized id from a bisect position, -1 when the
    // row is gone, so a stale hashmap entry degrades gracefully, matching
    // https://github.com/ccxt/ccxt/pull/29749 (cs) and
    // https://github.com/ccxt/ccxt/pull/29751 (go)
    private int findRowById(int start, String id) {
        int index = Math.max(start, 0);
        while (index < this.size()) {
            Object rowObj = this.get(index);
            if (rowObj instanceof List<?> row && row.size() > 2 && String.valueOf(row.get(2)).equals(id)) {
                return index;
            }
            index++;
        }
        return -1;
    }

    @Override
    @SuppressWarnings("unchecked")
    void storeArrayUnsafe(Object delta2) {
        List<Object> delta = (List<Object>) delta2;
        BigDecimal price = toBigDecimalOrNull(delta.size() > 0 ? delta.get(0) : null);
        BigDecimal amount = toBigDecimalOrNull(delta.size() > 1 ? delta.get(1) : null);
        Object rawId = delta.size() > 2 ? delta.get(2) : null;
        if (rawId == null) {
            // an indexed delta without an id cannot be keyed, ignore it
            return;
        }
        String id = String.valueOf(rawId);
        BigDecimal indexPrice = null;
        if (price != null && price.compareTo(BigDecimal.ZERO) != 0) {
            indexPrice = this.side ? price.negate() : price;
        }
        BigDecimal oldIdPrice = this.hashmap.get(id);
        boolean removal = (amount == null) || (amount.compareTo(BigDecimal.ZERO) == 0);
        if (!removal) {
            if (oldIdPrice != null) {
                if (indexPrice == null) {
                    // price omitted on the delta (bitmex sends orderBookL2
                    // updates without one): recover it from the hashmap like
                    // the ts implementation does
                    indexPrice = oldIdPrice;
                    delta = new ArrayList<>(delta);
                    delta.set(0, indexPrice.abs());
                }
                if (indexPrice.compareTo(oldIdPrice) == 0) {
                    int index = this.findRowById(bisectLeft(this.index, indexPrice), id);
                    if (index >= 0) {
                        this.set(index, new ArrayList<>(delta));
                        return;
                    }
                    // stale hashmap entry, the row is gone (e.g. trimmed):
                    // fall through and insert as new
                } else {
                    int oldIndex = this.findRowById(bisectLeft(this.index, oldIdPrice), id);
                    if (oldIndex >= 0) {
                        this.index.remove(oldIndex);
                        this.remove(oldIndex);
                    }
                    // stale entry: nothing to move, fall through and insert
                }
            }
            if (indexPrice == null) {
                // unknown id with no price on the delta: nowhere to place the
                // level, drop it
                return;
            }
            this.hashmap.put(id, indexPrice);
            int index = bisectLeft(this.index, indexPrice);
            // orders sharing a price coexist as separate rows: skip past the
            // equal-priced run so insertion is stable
            while (index < this.index.size() && this.index.get(index).compareTo(indexPrice) == 0) {
                index++;
            }
            this.index.add(index, indexPrice);
            this.add(index, new ArrayList<>(delta));
        } else if (oldIdPrice != null) {
            int index = this.findRowById(bisectLeft(this.index, oldIdPrice), id);
            if (index >= 0) {
                this.index.remove(index);
                this.remove(index);
            }
            // a stale entry has no row to remove, just heal the hashmap
            this.hashmap.remove(id);
        }
    }

    /** Truncate to max depth, unmapping the ids of trimmed rows first. */
    @Override
    public synchronized void limit() {
        int excess = this.size() - this.depth;
        for (int i = 0; i < excess; i++) {
            int last = this.size() - 1;
            Object rowObj = this.get(last);
            if (rowObj instanceof List<?> row && row.size() > 2) {
                this.hashmap.remove(String.valueOf(row.get(2)));
            }
            this.remove(last);
            this.index.remove(last);
        }
    }

    /** reset() clears sides through this; the id map must go with the rows. */
    @Override
    public synchronized void clear() {
        super.clear();
        this.hashmap.clear();
    }

    @Override
    public synchronized OrderBookSide copy() {
        IndexedOrderBookSide out;
        if (this instanceof IndexedAsks) {
            out = new IndexedAsks(null, this.depth);
        } else if (this instanceof IndexedBids) {
            out = new IndexedBids(null, this.depth);
        } else {
            out = new IndexedOrderBookSide(null, this.depth, this.side);
        }
        synchronized (out) {
            for (Object row : this) {
                out.add(new ArrayList<>((List<Object>) row));
            }
            out.index.addAll(this.index);
            out.hashmap.putAll(this.hashmap);
        }
        return out;
    }

    // ─── Side conveniences ───

    public static class IndexedAsks extends IndexedOrderBookSide {
        public IndexedAsks(List<Object> deltas, Object depth) { super(deltas, depth, false); }
        public IndexedAsks() { super(false); }
    }

    public static class IndexedBids extends IndexedOrderBookSide {
        public IndexedBids(List<Object> deltas, Object depth) { super(deltas, depth, true); }
        public IndexedBids() { super(true); }
    }
}
