package io.github.ccxt.types;

import io.github.ccxt.base.SafeMethods;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("unchecked")
public final class TypeHelper {

    private TypeHelper() {}

    public static Double safeFloat(Object obj, Object key) {
        return SafeMethods.SafeFloat(obj, key);
    }

    public static String safeString(Object obj, Object key) {
        Object res = SafeMethods.SafeString(obj, key);
        return (res instanceof String s) ? s : null;
    }

    public static Long safeInteger(Object obj, Object key) {
        Object res = SafeMethods.SafeInteger(obj, key);
        return (res instanceof Long l) ? l : null;
    }

    public static Boolean safeBool(Object obj, Object key) {
        return SafeMethods.SafeBool(obj, key, (Boolean) null);
    }

    public static Map<String, Object> toMap(Object obj) {
        if (obj == null) return null;
        return (Map<String, Object>) obj;
    }

    public static List<Object> toList(Object obj) {
        if (obj == null) return null;
        return (List<Object>) obj;
    }

    public static Map<String, Object> getInfo(Object data) {
        if (data == null) return null;
        Map<String, Object> map = (Map<String, Object>) data;
        Object info = map.get("info");
        if (info instanceof Map) {
            return new LinkedHashMap<>((Map<String, Object>) info);
        }
        return null;
    }

    public static Object safeValue(Object obj, Object key) {
        return SafeMethods.SafeValue(obj, key);
    }

    // Index-based extraction for array types like OHLCV
    public static Double safeFloatAt(Object obj, int index) {
        if (obj instanceof List<?> list && index >= 0 && index < list.size()) {
            Object val = list.get(index);
            if (val == null) return null;
            if (val instanceof Number n) return n.doubleValue();
            try { return Double.parseDouble(String.valueOf(val)); } catch (Exception e) { return null; }
        }
        return null;
    }

    public static Long safeIntegerAt(Object obj, int index) {
        if (obj instanceof List<?> list && index >= 0 && index < list.size()) {
            Object val = list.get(index);
            if (val == null) return null;
            if (val instanceof Number n) return n.longValue();
            try { return Long.parseLong(String.valueOf(val)); } catch (Exception e) { return null; }
        }
        return null;
    }
}
