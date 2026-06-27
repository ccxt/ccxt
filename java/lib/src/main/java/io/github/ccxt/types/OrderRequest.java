package io.github.ccxt.types;

import java.util.Map;

public final class OrderRequest {
    public String symbol;
    public String type;
    public String side;
    public Double amount;
    public Double price;
    public Map<String, Object> params;

    @SuppressWarnings("unchecked")
    public OrderRequest(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.type = TypeHelper.safeString(data, "type");
        this.side = TypeHelper.safeString(data, "side");
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.price = TypeHelper.safeFloat(data, "price");
        Object paramsRaw = TypeHelper.safeValue(data, "params");
        this.params = paramsRaw instanceof Map ? (Map<String, Object>) paramsRaw : null;
    }
}
