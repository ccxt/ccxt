package io.github.ccxt.types;

import java.util.Map;

public final class NetworkLimits {
    public MinMax withdraw;
    public MinMax deposit;
    // Lossless inverse support (see build/typeEmitters/java.ts#renderInterface):
    // TypedCores.fromNetworkLimits() hands this back, never a field-set rebuild.
    public final Object __raw;

    @SuppressWarnings("unchecked")
    public NetworkLimits(Object raw) {
        this.__raw = raw;
        Map<String, Object> data = TypeHelper.toMap(raw);
        Object withdrawRaw = TypeHelper.safeValue(data, "withdraw");
        this.withdraw = withdrawRaw instanceof Map<?, ?> ? new MinMax(withdrawRaw) : null;
        Object depositRaw = TypeHelper.safeValue(data, "deposit");
        this.deposit = depositRaw instanceof Map<?, ?> ? new MinMax(depositRaw) : null;
    }
}
