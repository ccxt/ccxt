package io.github.ccxt.types;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Native dedicated prediction-market type. Standalone typed mirror (does NOT extend Order); holds its own copy of the base
// fields (flat typed access) and adds the prediction identity
// fields. Mirrors the standalone `PredictionOrder` interface in
// ts/src/base/types.ts.
public final class PredictionOrder {
    public String id;
    public String clientOrderId;
    public Long timestamp;
    public String datetime;
    public String lastTradeTimestamp;
    public Long lastUpdateTimestamp;
    public String type;
    public String timeInForce;
    public String side;
    public Double price;
    public Double cost;
    public Double average;
    public Double amount;
    public Double filled;
    public Double remaining;
    public String status;
    public Boolean reduceOnly;
    public Boolean postOnly;
    public Fee fee;
    public List<Trade> trades;
    // prediction-specific
    public String outcome;
    public String outcomeId;
    public String label;
    public String market;
    public String eventId;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionOrder(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.clientOrderId = TypeHelper.safeString(data, "clientOrderId");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.lastTradeTimestamp = TypeHelper.safeString(data, "lastTradeTimestamp");
        this.lastUpdateTimestamp = TypeHelper.safeInteger(data, "lastUpdateTimestamp");
        this.type = TypeHelper.safeString(data, "type");
        this.timeInForce = TypeHelper.safeString(data, "timeInForce");
        this.side = TypeHelper.safeString(data, "side");
        this.price = TypeHelper.safeFloat(data, "price");
        this.cost = TypeHelper.safeFloat(data, "cost");
        this.average = TypeHelper.safeFloat(data, "average");
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.filled = TypeHelper.safeFloat(data, "filled");
        this.remaining = TypeHelper.safeFloat(data, "remaining");
        this.status = TypeHelper.safeString(data, "status");
        this.reduceOnly = TypeHelper.safeBool(data, "reduceOnly");
        this.postOnly = TypeHelper.safeBool(data, "postOnly");
        Object feeRaw = TypeHelper.safeValue(data, "fee");
        this.fee = feeRaw != null ? new Fee(feeRaw) : null;
        Object tradesRaw = TypeHelper.safeValue(data, "trades");
        if (tradesRaw instanceof List<?> tradesList) {
            this.trades = ((List<Object>) tradesList).stream().map(Trade::new).collect(Collectors.toList());
        }
        this.outcome = TypeHelper.safeString(data, "outcome");
        this.outcomeId = TypeHelper.safeString(data, "outcomeId");
        this.label = TypeHelper.safeString(data, "label");
        this.market = TypeHelper.safeString(data, "market");
        this.eventId = TypeHelper.safeString(data, "event");
        this.info = TypeHelper.getInfo(data);
    }
}
