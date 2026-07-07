package io.github.ccxt.types;

import java.util.Map;

public final class CancellationRequest {
    public String id;
    public String clientOrderId;
    public String symbol;

    @SuppressWarnings("unchecked")
    public CancellationRequest(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.clientOrderId = TypeHelper.safeString(data, "clientOrderId");
        this.symbol = TypeHelper.safeString(data, "symbol");
    }
}
