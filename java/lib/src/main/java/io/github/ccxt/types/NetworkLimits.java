package io.github.ccxt.types;

import java.util.Map;

public final class NetworkLimits extends TypedMap {
    public MinMax withdraw;
    public MinMax deposit;

    @SuppressWarnings("unchecked")
    public NetworkLimits(Object raw) {
        super(raw);
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.withdraw = data.containsKey("withdraw") && data.get("withdraw") != null ? new MinMax(data.get("withdraw")) : null;
        this.deposit = data.containsKey("deposit") && data.get("deposit") != null ? new MinMax(data.get("deposit")) : null;
    }
}
