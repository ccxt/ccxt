package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class Tickers {
    public Map<String, Ticker> tickers;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Tickers(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.info = TypeHelper.getInfo(data);
        this.tickers = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if (!"info".equals(entry.getKey())) {
                this.tickers.put(entry.getKey(), new Ticker(entry.getValue()));
            }
        }
    }

    public Ticker get(String key) {
        Ticker t = tickers.get(key);
        if (t == null) throw new NoSuchElementException("Key not found: " + key);
        return t;
    }
}
