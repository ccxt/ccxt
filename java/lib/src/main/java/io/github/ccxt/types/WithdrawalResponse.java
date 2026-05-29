package io.github.ccxt.types;

import java.util.Map;

public final class WithdrawalResponse {
    public String id;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public WithdrawalResponse(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.info = TypeHelper.getInfo(data);
    }
}
