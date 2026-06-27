package io.github.ccxt.types;

import java.util.Map;

public final class DepositWithdrawFeeNetwork {
    public Double fee;
    public Boolean percentage;

    @SuppressWarnings("unchecked")
    public DepositWithdrawFeeNetwork(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.fee = TypeHelper.safeFloat(data, "fee");
        this.percentage = TypeHelper.safeBool(data, "percentage");
    }
}
