package io.github.ccxt.types;

import java.util.Map;

public final class Liquidation {
    public String symbol;
    public Long timestamp;
    public String datetime;
    public Double price;
    public Double baseValue;
    public Double quoteValue;
    public Double contracts;
    public Double contractSize;
    public String side;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Liquidation(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.price = TypeHelper.safeFloat(data, "price");
        this.baseValue = TypeHelper.safeFloat(data, "baseValue");
        this.quoteValue = TypeHelper.safeFloat(data, "quoteValue");
        this.contracts = TypeHelper.safeFloat(data, "contracts");
        this.contractSize = TypeHelper.safeFloat(data, "contractSize");
        this.side = TypeHelper.safeString(data, "side");
        this.info = TypeHelper.getInfo(data);
    }
}
