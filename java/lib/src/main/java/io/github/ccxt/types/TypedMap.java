package io.github.ccxt.types;

import java.util.AbstractMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * Base of every dict-shaped unified type: a VIEW over the raw payload the transpiled core
 * produced. The public fields are projections; the object itself is still that same
 * {@code Map<String, Object>}, so Helpers.GetValue / safe* / extend / json and any transpiled
 * consumer of another core's result keep working on a typed value without an inverse conversion.
 * Wrapping is idempotent: constructing a view over a view shares the innermost map.
 */
public abstract class TypedMap extends AbstractMap<String, Object> {
    protected final Map<String, Object> raw;

    @SuppressWarnings("unchecked")
    protected TypedMap(Object raw) {
        if (raw instanceof TypedMap view) {
            this.raw = view.raw;
        } else if (raw instanceof Map<?, ?> m) {
            this.raw = (Map<String, Object>) m;
        } else {
            this.raw = new LinkedHashMap<>();
        }
    }

    /** The backing payload map (same identity the core returned). */
    public Map<String, Object> raw() { return raw; }

    @Override public Set<Map.Entry<String, Object>> entrySet() { return raw.entrySet(); }
    @Override public Object get(Object key) { return raw.get(key); }
    @Override public boolean containsKey(Object key) { return raw.containsKey(key); }
    @Override public Object put(String key, Object value) { return raw.put(key, value); }
    @Override public Object remove(Object key) { return raw.remove(key); }
    @Override public int size() { return raw.size(); }
    @Override public void clear() { raw.clear(); }
}
