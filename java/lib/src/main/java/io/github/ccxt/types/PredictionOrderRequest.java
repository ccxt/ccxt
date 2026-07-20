package io.github.ccxt.types;

import java.util.Map;

// Prediction-market order request — carries an `outcome` handle instead of a
// `symbol`. Mirrors the `PredictionOrderRequest` interface in ts/src/base/types.ts
// and the Go/C# structs.
public final class PredictionOrderRequest {
    public String outcome; // unified handle "TRUMP_WIN_2024:YES"
    public String type;
    public String side;
    public Double amount;
    public Double price;
    public Map<String, Object> params;

    @SuppressWarnings("unchecked")
    public PredictionOrderRequest(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.outcome = TypeHelper.safeString(data, "outcome");
        this.type = TypeHelper.safeString(data, "type");
        this.side = TypeHelper.safeString(data, "side");
        this.amount = TypeHelper.safeFloat(data, "amount");
        this.price = TypeHelper.safeFloat(data, "price");
        Object paramsRaw = TypeHelper.safeValue(data, "params");
        this.params = paramsRaw instanceof Map ? (Map<String, Object>) paramsRaw : null;
    }
}
