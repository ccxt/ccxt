package io.github.ccxt.types;

import java.util.Map;

public final class FundingHistory {
    public String id;
    public String symbol;
    public String code;
    public Long timestamp;
    public String datetime;
    public Double amount;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public FundingHistory(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.code = TypeHelper.safeString(data, "code");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.info = TypeHelper.getInfo(data);
    }
}
