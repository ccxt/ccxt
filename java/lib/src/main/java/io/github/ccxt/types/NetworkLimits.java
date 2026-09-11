package io.github.ccxt.types;

import java.util.Map;

public final class NetworkLimits {
    public MinMax withdraw;
    public MinMax deposit;

    @SuppressWarnings("unchecked")
    public NetworkLimits(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        Object withdrawRaw = TypeHelper.safeValue(data, "withdraw");
        this.withdraw = withdrawRaw instanceof Map<?, ?> ? new MinMax(withdrawRaw) : null;
        Object depositRaw = TypeHelper.safeValue(data, "deposit");
        this.deposit = depositRaw instanceof Map<?, ?> ? new MinMax(depositRaw) : null;
    }
}
