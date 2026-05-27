package io.github.ccxt.types;

import java.util.Map;

public final class LedgerEntry {
    public String id;
    public Long timestamp;
    public String datetime;
    public String direction;
    public String account;
    public String referenceId;
    public String referenceAccount;
    public String type;
    public String currency;
    public Double amount;
    public Double before;
    public Double after;
    public String status;
    public Fee fee;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public LedgerEntry(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.direction = TypeHelper.safeString(data, "direction");
        this.account = TypeHelper.safeString(data, "account");
        this.referenceId = TypeHelper.safeString(data, "referenceId");
        this.referenceAccount = TypeHelper.safeString(data, "referenceAccount");
        this.type = TypeHelper.safeString(data, "type");
        this.currency = TypeHelper.safeString(data, "currency");
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.before = TypeHelper.safeFloat(data, "before");
        this.after = TypeHelper.safeFloat(data, "after");
        this.status = TypeHelper.safeString(data, "status");
        Object feeRaw = TypeHelper.safeValue(data, "fee");
        this.fee = feeRaw != null ? new Fee(feeRaw) : null;
        this.info = TypeHelper.getInfo(data);
    }
}
