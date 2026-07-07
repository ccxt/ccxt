package io.github.ccxt.types;

import java.util.Map;

// Native dedicated prediction-market type. Standalone typed mirror (does NOT extend OpenInterest); holds its own copy of the base
// fields (flat typed access) and adds the prediction identity
// fields. Identity is the `outcome` handle ("MARKET:LABEL"), no symbol. Mirrors the standalone
// `PredictionOpenInterest` interface in ts/src/base/types.ts.
public final class PredictionOpenInterest {
    public Double openInterestAmount;
    public Double openInterestValue;
    public Double baseVolume;
    public Double quoteVolume;
    public Long timestamp;
    public String datetime;
    // prediction-specific
    public String outcome;
    public String outcomeId;
    public String market;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionOpenInterest(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.openInterestAmount = TypeHelper.safeFloat(data, "openInterestAmount");
        this.openInterestValue = TypeHelper.safeFloat(data, "openInterestValue");
        this.baseVolume = TypeHelper.safeFloat(data, "baseVolume");
        this.quoteVolume = TypeHelper.safeFloat(data, "quoteVolume");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.outcome = TypeHelper.safeString(data, "outcome");
        this.outcomeId = TypeHelper.safeString(data, "outcomeId");
        this.market = TypeHelper.safeString(data, "market");
        this.info = TypeHelper.getInfo(data);
    }
}
