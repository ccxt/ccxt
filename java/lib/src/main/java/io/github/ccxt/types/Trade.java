package io.github.ccxt.types;

import java.util.Map;

public final class Trade {
    public Double amount;
    public Double price;
    public Double cost;
    public String id;
    public String order;
    public Long timestamp;
    public String datetime;
    public String symbol;
    public String type;
    public String side;
    public String takerOrMaker;
    public Fee fee;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Trade(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.price = TypeHelper.safeFloat(data, "price");
        this.cost = TypeHelper.safeFloat(data, "cost");
        this.id = TypeHelper.safeString(data, "id");
        this.order = TypeHelper.safeString(data, "order");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.type = TypeHelper.safeString(data, "type");
        this.side = TypeHelper.safeString(data, "side");
        this.takerOrMaker = TypeHelper.safeString(data, "takerOrMaker");
        Object feeRaw = TypeHelper.safeValue(data, "fee");
        this.fee = feeRaw != null ? new Fee(feeRaw) : null;
        this.info = TypeHelper.getInfo(data);
    }
}
