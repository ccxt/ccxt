package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

public final class LeverageTiers {
    public Map<String, List<LeverageTier>> tiers;

    @SuppressWarnings("unchecked")
    public LeverageTiers(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.tiers = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if (entry.getValue() instanceof List<?> list) {
                this.tiers.put(entry.getKey(),
                    ((List<Object>) list).stream().map(LeverageTier::new).collect(Collectors.toList()));
            }
        }
    }

    public List<LeverageTier> get(String key) {
        List<LeverageTier> t = tiers.get(key);
        if (t == null) throw new NoSuchElementException("Key not found: " + key);
        return t;
    }
}
