package io.github.ccxt.types;

import java.util.Map;

public final class Fee {
    public Double rate;
    public Double cost;
    public String currency;

    @SuppressWarnings("unchecked")
    public Fee(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.rate = TypeHelper.safeFloat(data, "rate");
        this.cost = TypeHelper.safeFloat(data, "cost");
        this.currency = TypeHelper.safeString(data, "currency");
    }
}
