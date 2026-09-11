package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;

public final class Balances {
    public Map<String, Balance> balances;
    public Map<String, Double> free;
    public Map<String, Double> used;
    public Map<String, Double> total;
    public Long timestamp;
    public String datetime;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Balances(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.info = TypeHelper.getInfo(data);
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.balances = new LinkedHashMap<>();
        this.free = new LinkedHashMap<>();
        this.used = new LinkedHashMap<>();
        this.total = new LinkedHashMap<>();
        if (data == null) {
            return;
        }
        Object freeRaw = TypeHelper.safeValue(data, "free");
        if (freeRaw instanceof Map<?, ?> freeMap) {
            for (Map.Entry<String, Object> entry : ((Map<String, Object>) freeMap).entrySet()) {
                this.free.put(entry.getKey(), TypeHelper.toDouble(entry.getValue()));
            }
        }
        Object usedRaw = TypeHelper.safeValue(data, "used");
        if (usedRaw instanceof Map<?, ?> usedMap) {
            for (Map.Entry<String, Object> entry : ((Map<String, Object>) usedMap).entrySet()) {
                this.used.put(entry.getKey(), TypeHelper.toDouble(entry.getValue()));
            }
        }
        Object totalRaw = TypeHelper.safeValue(data, "total");
        if (totalRaw instanceof Map<?, ?> totalMap) {
            for (Map.Entry<String, Object> entry : ((Map<String, Object>) totalMap).entrySet()) {
                this.total.put(entry.getKey(), TypeHelper.toDouble(entry.getValue()));
            }
        }
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String key = entry.getKey();
            if (!"info".equals(key) && !"free".equals(key) && !"used".equals(key) && !"total".equals(key)
                    && !"timestamp".equals(key) && !"datetime".equals(key) && entry.getValue() instanceof Map) {
                this.balances.put(key, new Balance(entry.getValue()));
            }
        }
    }

    public Balance get(String currency) {
        return balances.get(currency);
    }
}
