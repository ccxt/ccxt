package io.github.ccxt.types;

import java.util.Map;

public final class Ticker {
    public String symbol;
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
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Ticker(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
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
        this.info = TypeHelper.getInfo(data);
    }
}
