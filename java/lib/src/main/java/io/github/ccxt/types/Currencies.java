package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class Currencies {
    public Map<String, CurrencyInterface> currencies;

    @SuppressWarnings("unchecked")
    public Currencies(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.currencies = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if (!"info".equals(entry.getKey())) {
                this.currencies.put(entry.getKey(), new CurrencyInterface(entry.getValue()));
            }
        }
    }

    public CurrencyInterface get(String key) {
        CurrencyInterface c = currencies.get(key);
        if (c == null) throw new NoSuchElementException("Key not found: " + key);
        return c;
    }
}
