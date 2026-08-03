package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class LastPrices {
    public Map<String, LastPrice> prices;

    @SuppressWarnings("unchecked")
    public LastPrices(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.prices = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            this.prices.put(entry.getKey(), new LastPrice(entry.getValue()));
        }
    }

    public LastPrice get(String key) {
        LastPrice p = prices.get(key);
        if (p == null) throw new NoSuchElementException("Key not found: " + key);
        return p;
    }
}
