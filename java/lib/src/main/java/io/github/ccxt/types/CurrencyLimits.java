package io.github.ccxt.types;

import java.util.Map;

public final class CurrencyLimits {
    public MinMax amount;
    public MinMax withdraw;

    @SuppressWarnings("unchecked")
    public CurrencyLimits(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.amount = data.containsKey("amount") && data.get("amount") != null ? new MinMax(data.get("amount")) : null;
        this.withdraw = data.containsKey("withdraw") && data.get("withdraw") != null ? new MinMax(data.get("withdraw")) : null;
    }
}
