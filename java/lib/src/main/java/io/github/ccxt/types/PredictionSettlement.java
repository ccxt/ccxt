package io.github.ccxt.types;

import java.util.Map;

// Native dedicated prediction-market type. PredictionSettlement is a standalone
// record (it does not embed a base unified struct): one settled outcome the user
// held, with the collateral paid in and paid out. Mirrors the PredictionSettlement
// interface in ts/src/base/types.ts and the Go/C# structs.
public final class PredictionSettlement {
    public String id;
    public Long timestamp;
    public String datetime;
    public String outcome;
    public String outcomeId;
    public String market;
    public String eventId;
    public String result;
    public Boolean won;
    public Double amount;
    public Double price;
    public Double cost;
    public Double payout;
    public Double pnl;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionSettlement(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.outcome = TypeHelper.safeString(data, "outcome");
        this.outcomeId = TypeHelper.safeString(data, "outcomeId");
        this.market = TypeHelper.safeString(data, "market");
        this.eventId = TypeHelper.safeString(data, "event");
        this.result = TypeHelper.safeString(data, "result");
        this.won = TypeHelper.safeBool(data, "won");
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.price = TypeHelper.safeFloat(data, "price");
        this.cost = TypeHelper.safeFloat(data, "cost");
        this.payout = TypeHelper.safeFloat(data, "payout");
        this.pnl = TypeHelper.safeFloat(data, "pnl");
        this.info = TypeHelper.getInfo(data);
    }
}
