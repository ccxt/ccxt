package io.github.ccxt.types;

import java.util.Map;

public final class Precision {
    public Double amount;
    public Double price;
    public Double cost;

    @SuppressWarnings("unchecked")
    public Precision(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.price = TypeHelper.safeFloat(data, "price");
        this.cost = TypeHelper.safeFloat(data, "cost");
    }
}
