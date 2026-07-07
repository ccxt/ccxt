package io.github.ccxt.types;

import java.util.Map;

// Native dedicated prediction-market type. Standalone typed mirror (does NOT extend Ticker); holds its own copy of the base
// fields (flat typed access) and adds the prediction identity
// fields. Identity is the `outcome` handle ("MARKET:LABEL"), no symbol. Mirrors the standalone
// `PredictionTicker` interface in ts/src/base/types.ts.
public final class PredictionTicker {
    public Long timestamp;
    public String datetime;
    public Double high;
    public Double low;
    public Double bid;
    public Double bidVolume;
    public Double ask;
    public Double askVolume;
    public Double vwap;
    public Double open;
    public Double close;
    public Double last;
    public Double previousClose;
    public Double change;
    public Double percentage;
    public Double average;
    public Double quoteVolume;
    public Double baseVolume;
    public Double indexPrice;
    public Double markPrice;
    // prediction-specific
    public String outcome;
    public String outcomeId;
    public String label;
    public String market;
    public String eventId;
    public Double openInterest;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionTicker(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.high = TypeHelper.safeFloat(data, "high");
        this.low = TypeHelper.safeFloat(data, "low");
        this.bid = TypeHelper.safeFloat(data, "bid");
        this.bidVolume = TypeHelper.safeFloat(data, "bidVolume");
        this.ask = TypeHelper.safeFloat(data, "ask");
        this.askVolume = TypeHelper.safeFloat(data, "askVolume");
        this.vwap = TypeHelper.safeFloat(data, "vwap");
        this.open = TypeHelper.safeFloat(data, "open");
        this.close = TypeHelper.safeFloat(data, "close");
        this.last = TypeHelper.safeFloat(data, "last");
        this.previousClose = TypeHelper.safeFloat(data, "previousClose");
        this.change = TypeHelper.safeFloat(data, "change");
        this.percentage = TypeHelper.safeFloat(data, "percentage");
        this.average = TypeHelper.safeFloat(data, "average");
        this.quoteVolume = TypeHelper.safeFloat(data, "quoteVolume");
        this.baseVolume = TypeHelper.safeFloat(data, "baseVolume");
        this.indexPrice = TypeHelper.safeFloat(data, "indexPrice");
        this.markPrice = TypeHelper.safeFloat(data, "markPrice");
        this.outcome = TypeHelper.safeString(data, "outcome");
        this.outcomeId = TypeHelper.safeString(data, "outcomeId");
        this.label = TypeHelper.safeString(data, "label");
        this.market = TypeHelper.safeString(data, "market");
        this.eventId = TypeHelper.safeString(data, "event");
        this.openInterest = TypeHelper.safeFloat(data, "openInterest");
        this.info = TypeHelper.getInfo(data);
    }
}
