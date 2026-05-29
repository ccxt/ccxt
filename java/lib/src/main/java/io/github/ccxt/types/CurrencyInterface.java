package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;

public final class CurrencyInterface {
    public String id;
    public String code;
    public String name;
    public String type;
    public Boolean active;
    public Boolean deposit;
    public Boolean withdraw;
    public Double fee;
    public Double precision;
    public Boolean margin;
    public CurrencyLimits limits;
    public Map<String, Network> networks;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public CurrencyInterface(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.code = TypeHelper.safeString(data, "code");
        this.name = TypeHelper.safeString(data, "name");
        this.type = TypeHelper.safeString(data, "type");
        this.active = TypeHelper.safeBool(data, "active");
        this.deposit = TypeHelper.safeBool(data, "deposit");
        this.withdraw = TypeHelper.safeBool(data, "withdraw");
        this.fee = TypeHelper.safeFloat(data, "fee");
        this.precision = TypeHelper.safeFloat(data, "precision");
        this.margin = TypeHelper.safeBool(data, "margin");
        Object limitsRaw = TypeHelper.safeValue(data, "limits");
        this.limits = limitsRaw != null ? new CurrencyLimits(limitsRaw) : null;
        Object networksRaw = TypeHelper.safeValue(data, "networks");
        if (networksRaw instanceof Map<?, ?> networksMap) {
            this.networks = new LinkedHashMap<>();
            for (Map.Entry<String, Object> entry : ((Map<String, Object>) networksMap).entrySet()) {
                this.networks.put(entry.getKey(), new Network(entry.getValue()));
            }
        }
        this.info = TypeHelper.getInfo(data);
    }
}
