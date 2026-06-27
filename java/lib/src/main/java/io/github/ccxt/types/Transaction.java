package io.github.ccxt.types;

import java.util.Map;

public final class Transaction {
    public String id;
    public String txid;
    public Long timestamp;
    public String datetime;
    public String address;
    public String addressFrom;
    public String addressTo;
    public String tag;
    public String tagFrom;
    public String tagTo;
    public String type;
    public Double amount;
    public String currency;
    public String status;
    public Long updated;
    public Fee fee;
    public String network;
    public String comment;
    public Boolean internal;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Transaction(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.txid = TypeHelper.safeString(data, "txid");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.address = TypeHelper.safeString(data, "address");
        this.addressFrom = TypeHelper.safeString(data, "addressFrom");
        this.addressTo = TypeHelper.safeString(data, "addressTo");
        this.tag = TypeHelper.safeString(data, "tag");
        this.tagFrom = TypeHelper.safeString(data, "tagFrom");
        this.tagTo = TypeHelper.safeString(data, "tagTo");
        this.type = TypeHelper.safeString(data, "type");
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.currency = TypeHelper.safeString(data, "currency");
        this.status = TypeHelper.safeString(data, "status");
        this.updated = TypeHelper.safeInteger(data, "updated");
        Object feeRaw = TypeHelper.safeValue(data, "fee");
        this.fee = feeRaw != null ? new Fee(feeRaw) : null;
        this.network = TypeHelper.safeString(data, "network");
        this.comment = TypeHelper.safeString(data, "comment");
        this.internal = TypeHelper.safeBool(data, "internal");
        this.info = TypeHelper.getInfo(data);
    }
}
