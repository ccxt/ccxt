package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;

public final class DepositWithdrawFee {
    public DepositWithdrawFeeNetwork withdraw;
    public DepositWithdrawFeeNetwork deposit;
    public Map<String, DepositWithdrawFeeNetwork> networks;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public DepositWithdrawFee(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        Object withdrawRaw = TypeHelper.safeValue(data, "withdraw");
        this.withdraw = withdrawRaw != null ? new DepositWithdrawFeeNetwork(withdrawRaw) : null;
        Object depositRaw = TypeHelper.safeValue(data, "deposit");
        this.deposit = depositRaw != null ? new DepositWithdrawFeeNetwork(depositRaw) : null;
        Object networksRaw = TypeHelper.safeValue(data, "networks");
        if (networksRaw instanceof Map<?, ?> networksMap) {
            this.networks = new LinkedHashMap<>();
            for (Map.Entry<String, Object> entry : ((Map<String, Object>) networksMap).entrySet()) {
                this.networks.put(entry.getKey(), new DepositWithdrawFeeNetwork(entry.getValue()));
            }
        }
        this.info = TypeHelper.getInfo(data);
    }
}
