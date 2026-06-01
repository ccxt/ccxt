package io.github.ccxt.types;

import java.util.Map;

public final class BorrowInterest {
    public String symbol;
    public String currency;
    public Double interest;
    public Double interestRate;
    public Double amountBorrowed;
    public String marginMode;
    public Long timestamp;
    public String datetime;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public BorrowInterest(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.currency = TypeHelper.safeString(data, "currency");
        this.interest = TypeHelper.safeFloat(data, "interest");
        this.interestRate = TypeHelper.safeFloat(data, "interestRate");
        this.amountBorrowed = TypeHelper.safeFloat(data, "amountBorrowed");
        this.marginMode = TypeHelper.safeString(data, "marginMode");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.info = TypeHelper.getInfo(data);
    }
}
