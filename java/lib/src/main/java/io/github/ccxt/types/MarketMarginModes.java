package io.github.ccxt.types;

import java.util.Map;

public final class MarketMarginModes {
    public Boolean cross;
    public Boolean isolated;

    @SuppressWarnings("unchecked")
    public MarketMarginModes(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.cross = TypeHelper.safeBool(data, "cross");
        this.isolated = TypeHelper.safeBool(data, "isolated");
    }
}
