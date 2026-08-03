package io.github.ccxt.types;

import java.util.Map;

public final class Conversion {
    public String id;
    public Long timestamp;
    public String datetime;
    public String fromCurrency;
    public Double fromAmount;
    public String toCurrency;
    public Double toAmount;
    public Double price;
    public Double fee;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Conversion(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.fromCurrency = TypeHelper.safeString(data, "fromCurrency");
        this.fromAmount = TypeHelper.safeFloat(data, "fromAmount");
        this.toCurrency = TypeHelper.safeString(data, "toCurrency");
        this.toAmount = TypeHelper.safeFloat(data, "toAmount");
        this.price = TypeHelper.safeFloat(data, "price");
        this.fee = TypeHelper.safeFloat(data, "fee");
        this.info = TypeHelper.getInfo(data);
    }
}
