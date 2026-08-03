package io.github.ccxt.types;

import java.util.Map;

public final class LeverageTier {
    public Double tier;
    public String symbol;
    public String currency;
    public Double minNotional;
    public Double maxNotional;
    public Double maintenanceMarginRate;
    public Double maxLeverage;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public LeverageTier(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.tier = TypeHelper.safeFloat(data, "tier");
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.currency = TypeHelper.safeString(data, "currency");
        this.minNotional = TypeHelper.safeFloat(data, "minNotional");
        this.maxNotional = TypeHelper.safeFloat(data, "maxNotional");
        this.maintenanceMarginRate = TypeHelper.safeFloat(data, "maintenanceMarginRate");
        this.maxLeverage = TypeHelper.safeFloat(data, "maxLeverage");
        this.info = TypeHelper.getInfo(data);
    }
}
