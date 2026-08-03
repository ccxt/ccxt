package io.github.ccxt.types;

import java.util.Map;

public final class MinMax {
    public Double min;
    public Double max;

    @SuppressWarnings("unchecked")
    public MinMax(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.min = TypeHelper.safeFloat(data, "min");
        this.max = TypeHelper.safeFloat(data, "max");
    }
}
