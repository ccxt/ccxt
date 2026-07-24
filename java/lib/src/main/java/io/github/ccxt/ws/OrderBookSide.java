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
     * Apply a [price, amount] delta. amount==0 removes the level; null price or
     * null/NaN amount is a no-op (matches JS truthy / C# decimal? behavior).
     */
    public synchronized void storeArray(Object delta2) {
        this.storeArrayUnsafe(delta2);
    }

    // Caller must hold synchronized(this); used by reset()/constructor while
    // already inside the side's monitor to avoid lock re-entry boilerplate.
    @SuppressWarnings("unchecked")
    void storeArrayUnsafe(Object delta2) {
        List<Object> delta = (List<Object>) delta2;
        BigDecimal price = toBigDecimal(delta.get(0));
        BigDecimal amount = toBigDecimal(delta.get(1));
        if (price == null) {
            return;
        }
        // Bids store the negated price so a single ascending index list serves both sides.
        BigDecimal indexPrice = this.side ? price.negate() : price;
        int idx = bisectLeft(this.index, indexPrice);
        if (amount != null && amount.compareTo(BigDecimal.ZERO) != 0) {
            if (idx < this.index.size() && this.index.get(idx).compareTo(indexPrice) == 0) {
                // Replace the inner list whole-cloth: snapshot() shallow-copies, so an
                // in-place set(1, amount) would still race with concurrent readers.
                this.set(idx, new ArrayList<>(delta));
            } else {
                this.index.add(idx, indexPrice);
                this.add(idx, new ArrayList<>(delta));
            }
        } else if (amount != null && idx < this.index.size() && this.index.get(idx).compareTo(indexPrice) == 0) {
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

    /** Truncate to max depth. Called explicitly by exchange code after applying deltas. */
    public synchronized void limit() {
        int excess = this.size() - this.depth;
        for (int i = 0; i < excess; i++) {
            int last = this.size() - 1;
            this.remove(last);
            this.index.remove(last);
        }
    }

    /** Snapshot copy for safe iteration outside the side's monitor. */
    public synchronized List<Object> snapshot() {
        return new ArrayList<>(this);
    }

    public synchronized OrderBookSide copy() {
        if (this instanceof Asks) {
            return new Asks(this.snapshot(), this.depth);
        } else if (this instanceof Bids) {
            return new Bids(this.snapshot(), this.depth);
        } else {
            return new OrderBookSide(this.snapshot(), this.depth, this.side);
        }
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
