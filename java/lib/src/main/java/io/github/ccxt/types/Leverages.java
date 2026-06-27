package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class Leverages {
    public Map<String, Leverage> leverages;

    @SuppressWarnings("unchecked")
    public Leverages(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.leverages = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            this.leverages.put(entry.getKey(), new Leverage(entry.getValue()));
        }
    }

    public Leverage get(String key) {
        Leverage l = leverages.get(key);
        if (l == null) throw new NoSuchElementException("Key not found: " + key);
        return l;
    }
}
