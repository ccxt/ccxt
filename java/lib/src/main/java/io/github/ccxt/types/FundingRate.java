package io.github.ccxt.types;

import java.util.Map;

public final class FundingRate {
    public String symbol;
    public Long timestamp;
    public String datetime;
    public Double fundingRate;
    public Double markPrice;
    public Double indexPrice;
    public Double interestRate;
    public Double estimatedSettlePrice;
    public Long fundingTimestamp;
    public String fundingDatetime;
    public Long nextFundingTimestamp;
    public String nextFundingDatetime;
    public Double nextFundingRate;
    public Long previousFundingTimestamp;
    public String previousFundingDatetime;
    public Double previousFundingRate;
    public String interval;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public FundingRate(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.fundingRate = TypeHelper.safeFloat(data, "fundingRate");
        this.markPrice = TypeHelper.safeFloat(data, "markPrice");
        this.indexPrice = TypeHelper.safeFloat(data, "indexPrice");
        this.interestRate = TypeHelper.safeFloat(data, "interestRate");
        this.estimatedSettlePrice = TypeHelper.safeFloat(data, "estimatedSettlePrice");
        this.fundingTimestamp = TypeHelper.safeInteger(data, "fundingTimestamp");
        this.fundingDatetime = TypeHelper.safeString(data, "fundingDatetime");
        this.nextFundingTimestamp = TypeHelper.safeInteger(data, "nextFundingTimestamp");
        this.nextFundingDatetime = TypeHelper.safeString(data, "nextFundingDatetime");
        this.nextFundingRate = TypeHelper.safeFloat(data, "nextFundingRate");
        this.previousFundingTimestamp = TypeHelper.safeInteger(data, "previousFundingTimestamp");
        this.previousFundingDatetime = TypeHelper.safeString(data, "previousFundingDatetime");
        this.previousFundingRate = TypeHelper.safeFloat(data, "previousFundingRate");
        this.interval = TypeHelper.safeString(data, "interval");
        this.info = TypeHelper.getInfo(data);
    }
}
