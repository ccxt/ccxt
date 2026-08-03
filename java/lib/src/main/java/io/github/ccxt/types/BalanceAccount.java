package io.github.ccxt.types;

import java.util.Map;

public final class BalanceAccount {
    public String free;
    public String used;
    public String total;
    public String debt;
    public String frozen;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public BalanceAccount(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.free = TypeHelper.safeString(data, "free");
        this.used = TypeHelper.safeString(data, "used");
        this.total = TypeHelper.safeString(data, "total");
        this.debt = TypeHelper.safeString(data, "debt");
        this.frozen = TypeHelper.safeString(data, "frozen");
        this.info = TypeHelper.getInfo(data);
    }
}
