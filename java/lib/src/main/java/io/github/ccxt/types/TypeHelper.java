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

    // --- Idempotent nominal-type lifts ---------------------------------------
    //
    // Used by the typed exchange accessors (getMarket / getCurrency / getTickers /
    // getMarkets / getCurrencies in build/generateJavaWrappers.ts) to name the
    // shape a raw unified value already has.
    //
    // Idempotent on purpose: a value that is already the nominal type is returned
    // as-is instead of being re-wrapped. That keeps the accessors correct if the
    // underlying cache is ever narrowed to the nominal type, and matches the C#
    // port's To*/From* helpers (cs/ccxt/base/Exchange.TypedCores.cs).
    //
    // null in, null out: an absent value stays absent rather than becoming an
    // empty object (never fabricate data). A non-null value that is not a Map is
    // passed to the constructor, which casts and therefore fails loudly — the
    // cache invariants say these are maps, so anything else is a real bug.

    @SuppressWarnings("unchecked")
    public static MarketInterface toMarket(Object raw) {
        if (raw == null || raw instanceof MarketInterface) {
            return (MarketInterface) raw;
        }
        return new MarketInterface(raw);
    }

    @SuppressWarnings("unchecked")
    public static CurrencyInterface toCurrency(Object raw) {
        if (raw == null || raw instanceof CurrencyInterface) {
            return (CurrencyInterface) raw;
        }
        return new CurrencyInterface(raw);
    }

    @SuppressWarnings("unchecked")
    public static Ticker toTicker(Object raw) {
        if (raw == null || raw instanceof Ticker) {
            return (Ticker) raw;
        }
        return new Ticker(raw);
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
