package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class OpenInterests {
    public Map<String, OpenInterest> interests;

    @SuppressWarnings("unchecked")
    public OpenInterests(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.interests = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            this.interests.put(entry.getKey(), new OpenInterest(entry.getValue()));
        }
    }

    public OpenInterest get(String key) {
        OpenInterest o = interests.get(key);
        if (o == null) throw new NoSuchElementException("Key not found: " + key);
        return o;
    }
}
