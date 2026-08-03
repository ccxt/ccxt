package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class MarginModes {
    public Map<String, MarginMode> modes;

    @SuppressWarnings("unchecked")
    public MarginModes(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.modes = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            this.modes.put(entry.getKey(), new MarginMode(entry.getValue()));
        }
    }

    public MarginMode get(String key) {
        MarginMode m = modes.get(key);
        if (m == null) throw new NoSuchElementException("Key not found: " + key);
        return m;
    }
}
