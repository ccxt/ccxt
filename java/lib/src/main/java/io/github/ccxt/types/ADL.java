package io.github.ccxt.types;

import java.util.Map;

public final class ADL {
    public String symbol;
    public Long rank;
    public String rating;
    public Double percentage;
    public Long timestamp;
    public String datetime;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public ADL(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.rank = TypeHelper.safeInteger(data, "rank");
        this.rating = TypeHelper.safeString(data, "rating");
        this.percentage = TypeHelper.safeFloat(data, "percentage");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.info = TypeHelper.getInfo(data);
    }
}
