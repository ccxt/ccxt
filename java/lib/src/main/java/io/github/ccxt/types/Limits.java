package io.github.ccxt.types;

import java.util.Map;

public final class Limits {
    public MinMax amount;
    public MinMax cost;
    public MinMax leverage;
    public MinMax price;
    public MinMax market;

    @SuppressWarnings("unchecked")
    public Limits(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.amount = data.containsKey("amount") && data.get("amount") != null ? new MinMax(data.get("amount")) : null;
        this.cost = data.containsKey("cost") && data.get("cost") != null ? new MinMax(data.get("cost")) : null;
        this.leverage = data.containsKey("leverage") && data.get("leverage") != null ? new MinMax(data.get("leverage")) : null;
        this.price = data.containsKey("price") && data.get("price") != null ? new MinMax(data.get("price")) : null;
        this.market = data.containsKey("market") && data.get("market") != null ? new MinMax(data.get("market")) : null;
    }
}
