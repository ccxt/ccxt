package io.github.ccxt.types;

import java.util.Map;

public final class Leverage {
    public String symbol;
    public String marginMode;
    public Double longLeverage;
    public Double shortLeverage;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Leverage(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.marginMode = TypeHelper.safeString(data, "marginMode");
        this.longLeverage = TypeHelper.safeFloat(data, "longLeverage");
        this.shortLeverage = TypeHelper.safeFloat(data, "shortLeverage");
        this.info = TypeHelper.getInfo(data);
    }
}
