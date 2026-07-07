package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class CrossBorrowRates {
    public Map<String, CrossBorrowRate> rates;

    @SuppressWarnings("unchecked")
    public CrossBorrowRates(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.rates = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            this.rates.put(entry.getKey(), new CrossBorrowRate(entry.getValue()));
        }
    }

    public CrossBorrowRate get(String key) {
        CrossBorrowRate r = rates.get(key);
        if (r == null) throw new NoSuchElementException("Key not found: " + key);
        return r;
    }
}
