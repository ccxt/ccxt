package io.github.ccxt.types;

import java.util.Map;

public final class DepositAddress {
    public String currency;
    public String network;
    public String address;
    public String tag;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public DepositAddress(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.currency = TypeHelper.safeString(data, "currency");
        this.network = TypeHelper.safeString(data, "network");
        this.address = TypeHelper.safeString(data, "address");
        this.tag = TypeHelper.safeString(data, "tag");
        this.info = TypeHelper.getInfo(data);
    }
}
