package io.github.ccxt.types;

import java.util.Map;

public final class Network {
    public String id;
    public String network;
    public String name;
    public Boolean active;
    public Double fee;
    public Double precision;
    public Boolean deposit;
    public Boolean withdraw;
    public NetworkLimits limits;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Network(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.network = TypeHelper.safeString(data, "network");
        this.name = TypeHelper.safeString(data, "name");
        this.active = TypeHelper.safeBool(data, "active");
        this.fee = TypeHelper.safeFloat(data, "fee");
        this.precision = TypeHelper.safeFloat(data, "precision");
        this.deposit = TypeHelper.safeBool(data, "deposit");
        this.withdraw = TypeHelper.safeBool(data, "withdraw");
        Object limitsRaw = TypeHelper.safeValue(data, "limits");
        this.limits = limitsRaw != null ? new NetworkLimits(limitsRaw) : null;
        this.info = TypeHelper.getInfo(data);
    }
}
