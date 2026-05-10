package io.github.ccxt.ws;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Sorted order book side (bids or asks) with O(log n) price lookup.
 * Matches C# OrderBookSide.cs and JS OrderBookSide.ts.
 *
 * Asks: ascending price order (index stores positive prices)
 * Bids: descending price order (index stores negated prices)
 */
public class OrderBookSide extends ArrayList<Object> implements io.github.ccxt.IOrderBookSide {

    protected final boolean side; // true = bids (descending), false = asks (ascending)
    protected int depth;
    protected final ArrayList<BigDecimal> index = new ArrayList<>();

    public OrderBookSide(List<Object> deltas, Object depthObj, boolean side) {
        super();
        this.side = side;
        this.depth = (depthObj == null) ? Integer.MAX_VALUE : ((Number) depthObj).intValue();
        if (deltas != null) {
            synchronized (this) {
                for (Object delta : deltas) {
                    this.storeArrayUnsafe(delta);
                }
            }
        }
    }

    public OrderBookSide(boolean side) {
        this(null, null, side);
    }

    /**
     * Binary search for insertion point (left-biased).
     */
    public static int bisectLeft(ArrayList<BigDecimal> arr, BigDecimal x) {
        int low = 0;
        int high = arr.size() - 1;
        while (low <= high) {
            int mid = (low + high) >>> 1;
            if (arr.get(mid).compareTo(x) < 0) low = mid + 1;
            else high = mid - 1;
        }
        return low;
    }

    /**
     * Store a [price, amount] delta. If amount is 0, remove the price level.
     * Synchronized on `this` so that toMap() snapshots and reset() clear+repopulate
     * sequences are race-free against the per-WsClient messageExecutor thread.
     */
    public synchronized void storeArray(Object delta2) {
        this.storeArrayUnsafe(delta2);
    }

    @SuppressWarnings("unchecked")
    void storeArrayUnsafe(Object delta2) {
        List<Object> delta = (List<Object>) delta2;
        BigDecimal price = toBigDecimal(delta.get(0));
        BigDecimal amount = toBigDecimal(delta.get(1));

        // JS truthy / C# decimal? semantics: a null price or null/NaN amount is a no-op,
        // not a "delete level zero". toBigDecimal previously coerced null → ZERO which
        // routed null-amount deltas down the delete branch and silently dropped levels.
        if (price == null) {
            return;
        }

        // For bids, negate price so ascending sort gives descending order
        BigDecimal indexPrice = this.side ? price.negate() : price;
        int idx = bisectLeft(this.index, indexPrice);

        if (amount != null && amount.compareTo(BigDecimal.ZERO) != 0) {
            // Insert or update
            if (idx < this.index.size() && this.index.get(idx).compareTo(indexPrice) == 0) {
                // Replace the inner [price, amount] list whole-cloth rather than
                // mutating-in-place. Mutation-in-place leaves a residual data
                // race: snapshot() shallow-copies the outer list, so a consumer
                // iterating the snapshot still holds the same inner-list ref
                // and would observe `set(1, amount)` mid-read. Replacing the
                // slot here means the snapshot's inner-list ref is frozen at
                // snapshot time and cannot drift.
                this.set(idx, new ArrayList<>(delta));
            } else {
                // Insert new price level
                this.index.add(idx, indexPrice);
                this.add(idx, new ArrayList<>(delta));
            }
        } else if (amount != null && idx < this.index.size() && this.index.get(idx).compareTo(indexPrice) == 0) {
            // Remove price level (amount == 0)
            this.index.remove(idx);
            this.remove(idx);
        }
    }

    public synchronized void store(Object price, Object amount) {
        List<Object> delta = new ArrayList<>();
        delta.add(price);
        delta.add(amount);
        this.storeArrayUnsafe(delta);
    }

    public synchronized void store(Object price, Object amount, Object orderId) {
        List<Object> delta = new ArrayList<>();
        delta.add(price);
        delta.add(amount);
        delta.add(orderId);
        this.storeArrayUnsafe(delta);
    }

    /**
     * Truncate to max depth.
     * Called explicitly by exchange code after processing deltas, matching JS/C# behavior.
     * Not called automatically from storeArray() by design.
     */
    public synchronized void limit() {
        int excess = this.size() - this.depth;
        for (int i = 0; i < excess; i++) {
            int last = this.size() - 1;
            this.remove(last);
            this.index.remove(last);
        }
    }

    /**
     * Atomic snapshot for handing the side out to user/test code without exposing
     * the live mutating list (would race with messageExecutor's storeArray/limit).
     */
    public synchronized List<Object> snapshot() {
        return new ArrayList<>(this);
    }

    /**
     * Atomic clear of both the data list and the price index (paired writes; reset()
     * relies on this being one critical section so toMap snapshots never observe a
     * cleared values list against a non-cleared index).
     */
    public synchronized void clearAll() {
        this.clear();
        this.index.clear();
    }

    private static BigDecimal toBigDecimal(Object val) {
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

    // ─── Subclasses ───

    public static class Asks extends OrderBookSide {
        public Asks(List<Object> deltas, Object depth) { super(deltas, depth, false); }
        public Asks() { super(false); }
    }

    public static class Bids extends OrderBookSide {
        public Bids(List<Object> deltas, Object depth) { super(deltas, depth, true); }
        public Bids() { super(true); }
    }
}
