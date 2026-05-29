package io.github.ccxt.types;

import java.util.Map;

public final class IsolatedBorrowRate {
    public String symbol;
    public String base;
    public Double baseRate;
    public String quote;
    public Double quoteRate;
    public Long period;
    public Long timestamp;
    public String datetime;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public IsolatedBorrowRate(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.base = TypeHelper.safeString(data, "base");
        this.baseRate = TypeHelper.safeFloat(data, "baseRate");
        this.quote = TypeHelper.safeString(data, "quote");
        this.quoteRate = TypeHelper.safeFloat(data, "quoteRate");
        this.period = TypeHelper.safeInteger(data, "period");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.info = TypeHelper.getInfo(data);
    }
}
