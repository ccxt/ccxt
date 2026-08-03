package io.github.ccxt.types;

import java.util.Map;

public final class Account {
    public String id;
    public String type;
    public String code;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public Account(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.type = TypeHelper.safeString(data, "type");
        this.code = TypeHelper.safeString(data, "code");
        this.info = TypeHelper.getInfo(data);
    }
}
