package io.github.ccxt.types;

import java.util.Map;

public final class LongShortRatio {
    public String symbol;
    public Long timestamp;
    public String datetime;
    public String timeframe;
    public Double longShortRatio;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public LongShortRatio(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.timeframe = TypeHelper.safeString(data, "timeframe");
        this.longShortRatio = TypeHelper.safeFloat(data, "longShortRatio");
        this.info = TypeHelper.getInfo(data);
    }
}
