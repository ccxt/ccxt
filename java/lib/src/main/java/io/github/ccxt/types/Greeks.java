package io.github.ccxt.types;

import java.util.Map;

public final class Greeks {
    public String symbol;
    public Long timestamp;
    public String datetime;
    public Double delta;
    public Double gamma;
    public Double theta;
    public Double vega;
    public Double rho;
    public Double bidSize;
    public Double askSize;
    public Double bidImpliedVolatility;
    public Double askImpliedVolatility;
    public Double markImpliedVolatility;
    public Double bidPrice;
    public Double askPrice;
    public Double markPrice;
    public Double lastPrice;
    public Double underlyingPrice;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Greeks(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.delta = TypeHelper.safeFloat(data, "delta");
        this.gamma = TypeHelper.safeFloat(data, "gamma");
        this.theta = TypeHelper.safeFloat(data, "theta");
        this.vega = TypeHelper.safeFloat(data, "vega");
        this.rho = TypeHelper.safeFloat(data, "rho");
        this.bidSize = TypeHelper.safeFloat(data, "bidSize");
        this.askSize = TypeHelper.safeFloat(data, "askSize");
        this.bidImpliedVolatility = TypeHelper.safeFloat(data, "bidImpliedVolatility");
        this.askImpliedVolatility = TypeHelper.safeFloat(data, "askImpliedVolatility");
        this.markImpliedVolatility = TypeHelper.safeFloat(data, "markImpliedVolatility");
        this.bidPrice = TypeHelper.safeFloat(data, "bidPrice");
        this.askPrice = TypeHelper.safeFloat(data, "askPrice");
        this.markPrice = TypeHelper.safeFloat(data, "markPrice");
        this.lastPrice = TypeHelper.safeFloat(data, "lastPrice");
        this.underlyingPrice = TypeHelper.safeFloat(data, "underlyingPrice");
        this.info = TypeHelper.getInfo(data);
    }
}
