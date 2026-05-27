package io.github.ccxt.types;

import java.util.Map;

public final class Option {
    public String currency;
    public String symbol;
    public Long timestamp;
    public String datetime;
    public Double impliedVolatility;
    public Double openInterest;
    public Double bidPrice;
    public Double askPrice;
    public Double midPrice;
    public Double markPrice;
    public Double lastPrice;
    public Double underlyingPrice;
    public Double change;
    public Double percentage;
    public Double baseVolume;
    public Double quoteVolume;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Option(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.currency = TypeHelper.safeString(data, "currency");
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.impliedVolatility = TypeHelper.safeFloat(data, "impliedVolatility");
        this.openInterest = TypeHelper.safeFloat(data, "openInterest");
        this.bidPrice = TypeHelper.safeFloat(data, "bidPrice");
        this.askPrice = TypeHelper.safeFloat(data, "askPrice");
        this.midPrice = TypeHelper.safeFloat(data, "midPrice");
        this.markPrice = TypeHelper.safeFloat(data, "markPrice");
        this.lastPrice = TypeHelper.safeFloat(data, "lastPrice");
        this.underlyingPrice = TypeHelper.safeFloat(data, "underlyingPrice");
        this.change = TypeHelper.safeFloat(data, "change");
        this.percentage = TypeHelper.safeFloat(data, "percentage");
        this.baseVolume = TypeHelper.safeFloat(data, "baseVolume");
        this.quoteVolume = TypeHelper.safeFloat(data, "quoteVolume");
        this.info = TypeHelper.getInfo(data);
    }
}
