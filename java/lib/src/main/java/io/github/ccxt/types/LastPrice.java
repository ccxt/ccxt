package io.github.ccxt.types;

import java.util.Map;

public final class LastPrice {
    public String symbol;
    public Long timestamp;
    public String datetime;
    public Double price;
    public String side;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public LastPrice(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.price = TypeHelper.safeFloat(data, "price");
        this.side = TypeHelper.safeString(data, "side");
        this.info = TypeHelper.getInfo(data);
    }
}
