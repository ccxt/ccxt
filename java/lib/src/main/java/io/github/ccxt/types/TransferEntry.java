package io.github.ccxt.types;

import java.util.Map;

public final class TransferEntry {
    public String id;
    public Long timestamp;
    public String datetime;
    public String currency;
    public Double amount;
    public String fromAccount;
    public String toAccount;
    public String status;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public TransferEntry(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.currency = TypeHelper.safeString(data, "currency");
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.fromAccount = TypeHelper.safeString(data, "fromAccount");
        this.toAccount = TypeHelper.safeString(data, "toAccount");
        this.status = TypeHelper.safeString(data, "status");
        this.info = TypeHelper.getInfo(data);
    }
}
