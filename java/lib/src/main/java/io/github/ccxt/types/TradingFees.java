package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class TradingFees {
    public Map<String, TradingFeeInterface> fees;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public TradingFees(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.info = TypeHelper.getInfo(data);
        this.fees = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if (!"info".equals(entry.getKey())) {
                this.fees.put(entry.getKey(), new TradingFeeInterface(entry.getValue()));
            }
        }
    }

    public TradingFeeInterface get(String key) {
        TradingFeeInterface f = fees.get(key);
        if (f == null) throw new NoSuchElementException("Key not found: " + key);
        return f;
    }
}
