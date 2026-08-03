package io.github.ccxt.types;

import java.util.Map;

public final class MarketInterface {
    public String id;
    public String symbol;
    public String base;
    public String quote;
    public String baseId;
    public String quoteId;
    public Boolean active;
    public String type;
    public String subType;
    public Boolean spot;
    public Boolean margin;
    public Boolean swap;
    public Boolean future;
    public Boolean option;
    public Boolean contract;
    public String settle;
    public String settleId;
    public Double contractSize;
    public Boolean linear;
    public Boolean inverse;
    public Long expiry;
    public String expiryDatetime;
    public Double strike;
    public String optionType;
    public Double taker;
    public Double maker;
    public Boolean percentage;
    public Boolean tierBased;
    public String feeSide;
    public Precision precision;
    public MarketMarginModes marginModes;
    public Limits limits;
    public Long created;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public MarketInterface(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.base = TypeHelper.safeString(data, "base");
        this.quote = TypeHelper.safeString(data, "quote");
        this.baseId = TypeHelper.safeString(data, "baseId");
        this.quoteId = TypeHelper.safeString(data, "quoteId");
        this.active = TypeHelper.safeBool(data, "active");
        this.type = TypeHelper.safeString(data, "type");
        this.subType = TypeHelper.safeString(data, "subType");
        this.spot = TypeHelper.safeBool(data, "spot");
        this.margin = TypeHelper.safeBool(data, "margin");
        this.swap = TypeHelper.safeBool(data, "swap");
        this.future = TypeHelper.safeBool(data, "future");
        this.option = TypeHelper.safeBool(data, "option");
        this.contract = TypeHelper.safeBool(data, "contract");
        this.settle = TypeHelper.safeString(data, "settle");
        this.settleId = TypeHelper.safeString(data, "settleId");
        this.contractSize = TypeHelper.safeFloat(data, "contractSize");
        this.linear = TypeHelper.safeBool(data, "linear");
        this.inverse = TypeHelper.safeBool(data, "inverse");
        this.expiry = TypeHelper.safeInteger(data, "expiry");
        this.expiryDatetime = TypeHelper.safeString(data, "expiryDatetime");
        this.strike = TypeHelper.safeFloat(data, "strike");
        this.optionType = TypeHelper.safeString(data, "optionType");
        this.taker = TypeHelper.safeFloat(data, "taker");
        this.maker = TypeHelper.safeFloat(data, "maker");
        this.percentage = TypeHelper.safeBool(data, "percentage");
        this.tierBased = TypeHelper.safeBool(data, "tierBased");
        this.feeSide = TypeHelper.safeString(data, "feeSide");
        Object precisionRaw = TypeHelper.safeValue(data, "precision");
        this.precision = precisionRaw != null ? new Precision(precisionRaw) : null;
        Object marginModesRaw = TypeHelper.safeValue(data, "marginModes");
        this.marginModes = marginModesRaw != null ? new MarketMarginModes(marginModesRaw) : null;
        Object limitsRaw = TypeHelper.safeValue(data, "limits");
        this.limits = limitsRaw != null ? new Limits(limitsRaw) : null;
        this.created = TypeHelper.safeInteger(data, "created");
        this.info = TypeHelper.getInfo(data);
    }
}
