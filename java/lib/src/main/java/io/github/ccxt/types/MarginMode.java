package io.github.ccxt.types;

import java.util.Map;

public final class MarginMode {
    public String symbol;
    public String marginMode;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public MarginMode(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.marginMode = TypeHelper.safeString(data, "marginMode");
        this.info = TypeHelper.getInfo(data);
    }
}
