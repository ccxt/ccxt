package io.github.ccxt.types;

import java.util.Map;

public final class TradingFeeInterface {
    public String symbol;
    public Double maker;
    public Double taker;
    public Boolean percentage;
    public Boolean tierBased;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public TradingFeeInterface(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.maker = TypeHelper.safeFloat(data, "maker");
        this.taker = TypeHelper.safeFloat(data, "taker");
        this.percentage = TypeHelper.safeBool(data, "percentage");
        this.tierBased = TypeHelper.safeBool(data, "tierBased");
        this.info = TypeHelper.getInfo(data);
    }
}
