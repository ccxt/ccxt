package io.github.ccxt.types;

import java.util.Map;

public final class MarginModification {
    public String symbol;
    public String type;
    public String marginMode;
    public Double amount;
    public Double total;
    public String code;
    public String status;
    public Long timestamp;
    public String datetime;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public MarginModification(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.type = TypeHelper.safeString(data, "type");
        this.marginMode = TypeHelper.safeString(data, "marginMode");
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.total = TypeHelper.safeFloat(data, "total");
        this.code = TypeHelper.safeString(data, "code");
        this.status = TypeHelper.safeString(data, "status");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.info = TypeHelper.getInfo(data);
    }
}
