package io.github.ccxt.types;

import java.util.Map;

// Native dedicated prediction-market type. The base TradingFeeInterface is final,
// so this duplicates its fields (flat typed access) and adds the prediction
// identity fields. The inherited `symbol` is left unpopulated — `outcome` (the
// "MARKET:LABEL" handle) is the canonical identity. Mirrors the
// `PredictionTradingFee extends TradingFeeInterface` interface in ts/src/base/types.ts.
public final class PredictionTradingFee {
    public String symbol;
    public Double maker;
    public Double taker;
    public Boolean percentage;
    public Boolean tierBased;
    // prediction-specific
    public String outcome;
    public String outcomeId;
    public String market;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionTradingFee(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.maker = TypeHelper.safeFloat(data, "maker");
        this.taker = TypeHelper.safeFloat(data, "taker");
        this.percentage = TypeHelper.safeBool(data, "percentage");
        this.tierBased = TypeHelper.safeBool(data, "tierBased");
        this.outcome = TypeHelper.safeString(data, "outcome");
        this.outcomeId = TypeHelper.safeString(data, "outcomeId");
        this.market = TypeHelper.safeString(data, "market");
        this.info = TypeHelper.getInfo(data);
    }
}
