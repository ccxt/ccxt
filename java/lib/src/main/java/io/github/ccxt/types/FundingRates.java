package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class FundingRates {
    public Map<String, FundingRate> rates;

    @SuppressWarnings("unchecked")
    public FundingRates(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.rates = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            this.rates.put(entry.getKey(), new FundingRate(entry.getValue()));
        }
    }

    public FundingRate get(String key) {
        FundingRate f = rates.get(key);
        if (f == null) throw new NoSuchElementException("Key not found: " + key);
        return f;
    }
}
