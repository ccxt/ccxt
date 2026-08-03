package io.github.ccxt.types;

import java.util.Map;

public final class Balance {
    public Double free;
    public Double used;
    public Double total;
    public Double debt;

    @SuppressWarnings("unchecked")
    public Balance(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.free = TypeHelper.safeFloat(data, "free");
        this.used = TypeHelper.safeFloat(data, "used");
        this.total = TypeHelper.safeFloat(data, "total");
        this.debt = TypeHelper.safeFloat(data, "debt");
    }
}
