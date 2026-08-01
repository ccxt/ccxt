package io.github.ccxt.types;

import java.util.Map;

// Native dedicated prediction-market type. Standalone typed mirror (does NOT extend Trade); holds its own copy of the base
// fields (flat typed access) and adds the prediction identity
// fields. Mirrors the standalone `PredictionTrade` interface in
// ts/src/base/types.ts.
public final class PredictionTrade {
    public Double amount;
    public Double price;
    public Double cost;
    public String id;
    public String order;
    public Long timestamp;
    public String datetime;
    public String type;
    public String side;
    public String takerOrMaker;
    public Fee fee;
    // prediction-specific
    public String outcome;
    public String outcomeId;
    public String label;
    public String market;
    public Double realizedPnl;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionTrade(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.price = TypeHelper.safeFloat(data, "price");
        this.cost = TypeHelper.safeFloat(data, "cost");
        this.id = TypeHelper.safeString(data, "id");
        this.order = TypeHelper.safeString(data, "order");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.type = TypeHelper.safeString(data, "type");
        this.side = TypeHelper.safeString(data, "side");
        this.takerOrMaker = TypeHelper.safeString(data, "takerOrMaker");
        Object feeRaw = TypeHelper.safeValue(data, "fee");
        this.fee = feeRaw != null ? new Fee(feeRaw) : null;
        this.outcome = TypeHelper.safeString(data, "outcome");
        this.outcomeId = TypeHelper.safeString(data, "outcomeId");
        this.label = TypeHelper.safeString(data, "label");
        this.market = TypeHelper.safeString(data, "market");
        this.realizedPnl = TypeHelper.safeFloat(data, "realizedPnl");
        this.info = TypeHelper.getInfo(data);
    }
}
