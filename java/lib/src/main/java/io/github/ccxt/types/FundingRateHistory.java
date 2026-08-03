package io.github.ccxt.types;

import java.util.Map;

public final class FundingRateHistory {
    public String symbol;
    public Double fundingRate;
    public Long timestamp;
    public String datetime;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public FundingRateHistory(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.fundingRate = TypeHelper.safeFloat(data, "fundingRate");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.info = TypeHelper.getInfo(data);
    }
}
