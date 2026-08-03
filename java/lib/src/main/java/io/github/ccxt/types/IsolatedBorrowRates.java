package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class IsolatedBorrowRates {
    public Map<String, IsolatedBorrowRate> rates;

    @SuppressWarnings("unchecked")
    public IsolatedBorrowRates(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.rates = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            this.rates.put(entry.getKey(), new IsolatedBorrowRate(entry.getValue()));
        }
    }

    public IsolatedBorrowRate get(String key) {
        IsolatedBorrowRate r = rates.get(key);
        if (r == null) throw new NoSuchElementException("Key not found: " + key);
        return r;
    }
}
