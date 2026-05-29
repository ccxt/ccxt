package io.github.ccxt.types;

import java.util.Map;

public final class CrossBorrowRate {
    public String currency;
    public Double rate;
    public Double period;
    public Long timestamp;
    public String datetime;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public CrossBorrowRate(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.currency = TypeHelper.safeString(data, "currency");
        this.rate = TypeHelper.safeFloat(data, "rate");
        this.period = TypeHelper.safeFloat(data, "period");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.info = TypeHelper.getInfo(data);
    }
}
