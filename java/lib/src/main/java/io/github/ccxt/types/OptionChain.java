package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class OptionChain {
    public Map<String, Option> options;

    @SuppressWarnings("unchecked")
    public OptionChain(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.options = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            this.options.put(entry.getKey(), new Option(entry.getValue()));
        }
    }

    public Option get(String key) {
        Option o = options.get(key);
        if (o == null) throw new NoSuchElementException("Key not found: " + key);
        return o;
    }
}
