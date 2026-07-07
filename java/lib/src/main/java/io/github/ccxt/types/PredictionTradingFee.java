package io.github.ccxt.types;

import java.util.Map;

// Native dedicated prediction-market type. Standalone typed mirror (does NOT extend TradingFeeInterface); holds its own copy
// of the base fields (flat typed access) and adds the prediction
// identity fields. Identity is the `outcome` handle ("MARKET:LABEL"), no symbol. Mirrors the standalone
// `PredictionTradingFee` interface in ts/src/base/types.ts.
public final class PredictionTradingFee {
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
