package io.github.ccxt.types;

import java.util.Map;

public final class OpenInterest {
    public String symbol;
    public Double openInterestAmount;
    public Double openInterestValue;
    public Double baseVolume;
    public Double quoteVolume;
    public Long timestamp;
    public String datetime;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public OpenInterest(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.openInterestAmount = TypeHelper.safeFloat(data, "openInterestAmount");
        this.openInterestValue = TypeHelper.safeFloat(data, "openInterestValue");
        this.baseVolume = TypeHelper.safeFloat(data, "baseVolume");
        this.quoteVolume = TypeHelper.safeFloat(data, "quoteVolume");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.info = TypeHelper.getInfo(data);
    }
}
