package io.github.ccxt.types;

import java.util.AbstractList;
import java.util.ArrayList;
import java.util.List;

/** Base of list-shaped unified types (OHLCV): a view over the raw row, see {@link TypedMap}. */
public abstract class TypedList extends AbstractList<Object> {
    protected final List<Object> raw;

    @SuppressWarnings("unchecked")
    protected TypedList(Object raw) {
        if (raw instanceof TypedList view) {
            this.raw = view.raw;
        } else if (raw instanceof List<?> l) {
            this.raw = (List<Object>) l;
        } else {
            this.raw = new ArrayList<>();
        }
    }

    /** The backing row (same identity the core returned). */
    public List<Object> raw() { return raw; }

    @Override public Object get(int index) { return raw.get(index); }
    @Override public int size() { return raw.size(); }
    @Override public Object set(int index, Object value) { return raw.set(index, value); }
}
