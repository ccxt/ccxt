package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

// Dedicated prediction-market ticker collection — a dict keyed by outcome handle ->
// PredictionTicker. Mirrors the base Tickers class but holds native PredictionTickers.
public final class PredictionTickers {
    public Map<String, PredictionTicker> tickers;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionTickers(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.info = TypeHelper.getInfo(data);
        this.tickers = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if (!"info".equals(entry.getKey())) {
                this.tickers.put(entry.getKey(), new PredictionTicker(entry.getValue()));
            }
        }
    }

    public PredictionTicker get(String key) {
        PredictionTicker t = tickers.get(key);
        if (t == null) throw new NoSuchElementException("Key not found: " + key);
        return t;
    }
}
