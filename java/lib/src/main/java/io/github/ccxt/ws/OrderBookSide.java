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
        int amount = classifyAmount(delta.get(1));
        if (price == null) {
            return;
        }
        // Bids store the negated price so a single ascending index list serves both sides.
        BigDecimal indexPrice = this.side ? price.negate() : price;
        int idx = bisectLeft(this.index, indexPrice);
        if (amount == AMOUNT_NONZERO) {
            if (idx < this.index.size() && this.index.get(idx).compareTo(indexPrice) == 0) {
                // Replace the inner list whole-cloth: snapshot() shallow-copies, so an
                // in-place set(1, amount) would still race with concurrent readers.
                this.set(idx, new ArrayList<>(delta));
            } else {
                this.index.add(idx, indexPrice);
                this.add(idx, new ArrayList<>(delta));
            }
        } else if (amount == AMOUNT_ZERO && idx < this.index.size() && this.index.get(idx).compareTo(indexPrice) == 0) {
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

    /** The inherited ArrayList.clear() dropped the rows but left the price
     *  index populated; WsOrderBook.reset() compensated with a separate
     *  index.clear(), so the live path was fine, but a standalone clear()
     *  would leave bisect operating against ghost prices — keep the two in
     *  lockstep here, see the review note on
     *  https://github.com/ccxt/ccxt/pull/29753 */
    @Override
    public synchronized void clear() {
        super.clear();
        this.index.clear();
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

    // The amount is only ever tested for missing / zero / non-zero — it is never
    // compared against another amount and never stored as a BigDecimal (the row
    // keeps the caller's original object). Running it through toBigDecimal() cost
    // a BigDecimal.valueOf(double), i.e. a Double.toString() plus a decimal parse,
    // on every single delta. classifyAmount() answers the same three-way question
    // straight off the primitive, so the allocation and the string round-trip are
    // gone from the hot path. Kept deliberately equivalent to the old
    // `toBigDecimal(x)` + `!= null` + `compareTo(ZERO)` chain, case for case:
    //   BigDecimal -> signum() == 0 is exactly compareTo(ZERO) == 0
    //   Number     -> the same doubleValue() the old code fed to valueOf, so any
    //                 precision loss (and NaN/Inf -> no-op) behaves identically;
    //                 `d == 0.0` is also true for -0.0, matching BigDecimal("-0.0")
    //   String     -> still parsed, so "0.00" is a delete and garbage is a no-op
    //                 (strings are not the hot path: safeFloat hands us a Double)
    private static final int AMOUNT_NONE = 0;    // null/NaN/unparseable -> ignore the delta
    private static final int AMOUNT_ZERO = 1;    // remove the level
    private static final int AMOUNT_NONZERO = 2; // insert or update the level

    private static int classifyAmount(Object val) {
        if (val == null) return AMOUNT_NONE;
        if (val instanceof Double d) {
            double v = d.doubleValue();
            if (Double.isNaN(v) || Double.isInfinite(v)) return AMOUNT_NONE;
            return (v == 0.0) ? AMOUNT_ZERO : AMOUNT_NONZERO;
        }
        if (val instanceof BigDecimal bd) return (bd.signum() == 0) ? AMOUNT_ZERO : AMOUNT_NONZERO;
        if (val instanceof Number n) {
            double v = n.doubleValue();
            if (Double.isNaN(v) || Double.isInfinite(v)) return AMOUNT_NONE;
            return (v == 0.0) ? AMOUNT_ZERO : AMOUNT_NONZERO;
        }
        if (val instanceof String s) {
            try { return (new BigDecimal(s).signum() == 0) ? AMOUNT_ZERO : AMOUNT_NONZERO; }
            catch (NumberFormatException e) { return AMOUNT_NONE; }
        }
        return AMOUNT_NONE;
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
