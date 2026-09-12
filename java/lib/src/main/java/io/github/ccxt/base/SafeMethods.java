package io.github.ccxt.base;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@SuppressWarnings("unchecked")
public final class SafeMethods {

    private SafeMethods() {}

    // --- vararg default helper ---
    private static Object opt(Object... dv) {
        return (dv == null || dv.length == 0) ? null : dv[0];
    }

    // ----------------------------

    public static Object toStringOrNull(Object v) {
        return (v == null) ? null : String.valueOf(v);
    }

    public static Object SafeNumberN(Object obj, Object keys, Object... defaultValue) {
        return SafeFloatN(obj, keys, defaultValue);
    }
    public static Object safeNumberN(Object obj, Object keys, Object... defaultValue) {
        return SafeNumberN(obj, keys, defaultValue);
    }

    // ----------------------------

    public static Object safeTimestampN(Object obj, List<Object> keys, Object... defaultValue2) {
        Object defaultValue = opt(defaultValue2);
        Object result = SafeValueN(obj, keys);
        if (result == null) return defaultValue;

        // string with '.' → treat as seconds, multiply by 1000 after parsing double
        if (result instanceof String s && s.contains(".")) {
            return (long) Math.floor(Double.parseDouble(s) * 1000d);
        } else if (result instanceof Double d && String.valueOf(d).contains(".")) {
            return (long) Math.floor(d * 1000d);
        }
        // otherwise parse as integer then *1000
        long base = Long.parseLong(String.valueOf(result));
        return base * 1000;
    }

    public static Object safeTimestamp(Object obj, Object key, Object... defaultValue) {
        return safeTimestampN(obj, Arrays.asList(key), defaultValue);
    }

    public static Object safeTimestamp2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return safeTimestampN(obj, Arrays.asList(key1, key2), defaultValue);
    }

    // ----------------------------

    public static long SafeIntegerTyped(Object obj, Object key, Object... defaultValue) {
        Long res = SafeIntegerN(obj, Arrays.asList(key), defaultValue);
        return (res == null) ? 0L : res;
    }

    public static Long SafeInteger(Object obj, Object key, Object... defaultValue) {
        Long res = SafeIntegerN(obj, Arrays.asList(key), defaultValue);
        return (res == null) ? null : res;
    }

    public static Long SafeInteger2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeIntegerN(obj, Arrays.asList(key1, key2), defaultValue);
    }

    public static Object safeIntegerN(Object obj, List<Object> keys, Object... defaultValue) {
        return SafeIntegerN(obj, keys, defaultValue);
    }

    public static Long SafeIntegerN(Object obj, Object keys, Object... defaultValue2) {
        Object defaultValue = opt(defaultValue2);
        Object result = SafeValueN(obj, keys, defaultValue);
        Long convertedDefault = (defaultValue == null) ? null : toLongQuiet(defaultValue);

        if (result == null || (result instanceof String s && s.isEmpty())) return convertedDefault;

        try {
            if (result instanceof String s) {
                if (s.contains(".")) {
                    return (long) Math.floor(Double.parseDouble(s));
                }
                return Long.parseLong(s);
            } else {
                return toLongQuiet(result);
            }
        } catch (Exception ignored) {
        }
        return convertedDefault;
    }

    private static Long toLongQuiet(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.longValue();
        return Long.parseLong(String.valueOf(v));
    }

    // ----------------------------

    public static Double SafeFloat(Object obj, Object key, Object... defaultValue) {
        Double res = SafeFloatN(obj, Arrays.asList(key), defaultValue);
        return (res == null) ? null : res;
    }

    public static Double safeFloat(Object obj, Object key, Object... defaultValue) {
        return SafeFloat(obj, key, defaultValue);
    }

    public static Double safeFloat2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeFloatN(obj, Arrays.asList(key1, key2), defaultValue);
    }

    public static Double safeFloatN(Object obj, Object keys, Object... defaultValue) {
        return SafeFloatN(obj, (List<Object>) keys, defaultValue);
    }

    public static Double SafeFloatN(Object obj, Object keys, Object... defaultValue2) {
        Object defaultValue = opt(defaultValue2);
        Double convertedDefault = (defaultValue == null) ? null : toDoubleQuiet(defaultValue);
        Object result = SafeValueN(obj, keys, defaultValue);
        if (result == null) return convertedDefault;

        try {
            return toDoubleQuiet(result);
        } catch (Exception ignored) {
        }
        return convertedDefault;
    }

    private static Double toDoubleQuiet(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.doubleValue();
        return Double.parseDouble(String.valueOf(v));
    }

    // ----------------------------
    // safeString family — value selection and default handling, TS-exact.
    //
    // Reference: ts/src/base/functions/type.ts
    //   prop (o, k)   skips undefined / null / ''      (absent is null in Java)
    //   safeString    String passthrough; finite Number -> String (x); everything else
    //                 (booleans, lists, dicts, non-finite numbers) -> $default
    //   prop2 / getValueFromKeysInArray  same skip rule for every extra key
    //
    // JS cannot tell `1` and `1.0` apart, so `String (1.0)` is "1". The Java JSON
    // parser yields a Double for "1.0"; NumberHelpers.NumberToString collapses
    // integral doubles the same way (PHP/C#/Go do too; python str (1.0) is "1.0" —
    // we follow TS). Non-finite numbers are not coercible, per Number.isFinite.

    /** TS `String (x)` when the value is string-coercible, otherwise null (caller applies the default). */
    private static String stringValueOrNull(Object value) {
        if (value == null) return null;
        if (value instanceof String s) {
            if (s.isEmpty()) return null;
            return s;
        }
        if (value instanceof Number n) {
            return numberValueOrNull(n);
        }
        // booleans, lists, dicts and arbitrary objects are not string-coercible in TS
        return null;
    }

    /** TS `String (x)` for numbers: integral doubles lose the fraction ("1.0" -> "1"). */
    private static String numberValueOrNull(Number number) {
        if (number instanceof Double d) {
            if (d.isNaN() || d.isInfinite()) return null;
            return NumberHelpers.NumberToString(d);
        }
        if (number instanceof Float f) {
            if (f.isNaN() || f.isInfinite()) return null;
            long asLong = (long) f.doubleValue();
            if ((float) asLong == f) return Long.toString(asLong);
            return String.valueOf(f);
        }
        if (number instanceof java.math.BigDecimal bd) {
            return bd.toPlainString();
        }
        if (number instanceof java.math.BigInteger) {
            return number.toString();
        }
        return NumberHelpers.NumberToString(number);
    }

    /** TS `$default`: a String default is returned verbatim, other types are not representable. */
    private static String defaultOrNull(Object... defaultValue) {
        Object dv = opt(defaultValue);
        if (dv instanceof String s) return s;
        return null;
    }

    /** TS safeString core: coerce a present value, else fall back to the default. */
    private static String coerceOrDefault(Object value, Object... defaultValue) {
        String s = stringValueOrNull(value);
        if (s != null) return s;
        return defaultOrNull(defaultValue);
    }

    /** TS `v !== undefined && v !== null && v !== ''` (undefined is null in Java). */
    private static boolean isMissingValue(Object value) {
        if (value == null) return true;
        if (value instanceof String s) return s.isEmpty();
        return false;
    }

    public static String SafeStringTyped(Object obj, Object key, Object... defaultValue) {
        Object result = SafeValue(obj, key);
        return coerceOrDefault(result, defaultValue);
    }

    public static String SafeString(Object obj, Object key, Object... defaultValue) {
        return SafeStringTyped(obj, key, defaultValue);
    }

    public static String safeString(Object obj, Object key, Object... defaultValue) {
        return SafeStringTyped(obj, key, defaultValue);
    }

    public static String safeString2(Object obj, Object key1, Object key2, Object... defaultValue) {
        // TS prop2: the first key holding a non-missing value wins; if that value is not
        // string-coercible the default is returned and key2 is NOT tried.
        Object first = SafeValue(obj, key1);
        if (first != null) return coerceOrDefault(first, defaultValue);
        Object second = SafeValue(obj, key2);
        return coerceOrDefault(second, defaultValue);
    }

    public static String safeStringN(Object obj, Object keys, Object... defaultValue) {
        return SafeStringN(obj, (List<Object>) keys, defaultValue);
    }

    public static String SafeStringN(Object obj, Object keys, Object... defaultValue) {
        return SafeStringN(obj, (List<Object>) keys, defaultValue);
    }

    public static String SafeStringN(Object obj, List<Object> keys, Object... defaultValue2) {
        Object result = SafeValueN(obj, keys);
        return coerceOrDefault(result, defaultValue2);
    }

    // ----------------------------

    public static Object SafeValue(Object obj, Object key1, Object... defaultValue) {
        return SafeValueN(obj, Arrays.asList(key1), defaultValue);
    }

    public static Object safeValue(Object obj, Object key1, Object... defaultValue) {
        return SafeValueN(obj, Arrays.asList(key1), defaultValue);
    }

    public static Object safeValue2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeValueN(obj, Arrays.asList(key1, key2), defaultValue);
    }

    public static Object safeValueN(Object obj, Object keys2, Object... defaultValue) {
        return SafeValueN(obj, keys2, defaultValue);
    }

    public static Object SafeValueN(Object obj, Object keys2, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        List<Object> keys = (List<Object>) keys2;
        if (obj == null) return defaultValue;

        // array → List<Object>
        if (obj.getClass().isArray()) {
            obj = Arrays.asList((Object[]) obj);
        }

        // Map<String,Object> directly
        if (obj instanceof Map<?, ?> m) {
            Map<?, ?> dict = m;

            // Fast path: direct String-keyed lookups. containsKey/get on
            // HashMap don't iterate the keySet so they're safe even when a
            // concurrent WS handler thread is mutating the dict — unlike
            // any keySet stream which throws CME (HashMap$KeySpliterator
            // .tryAdvance) under concurrent mutation. This is the hot path:
            // every safeXxx call lands here for JSON-parsed dicts.
            for (Object k2 : keys) {
                if (k2 == null) continue;
                String k = String.valueOf(k2);
                if (dict.containsKey(k)) {
                    Object returnValue = dict.get(k);
                    if (returnValue == null || (returnValue instanceof String s && s.isEmpty())) continue;
                    return returnValue;
                }
            }
            // Slow path: dict may be non-String-keyed (e.g. an Integer-keyed
            // map produced by a transpiled `dict[0]` literal). First, probe
            // a single entry to decide whether full coercion is needed —
            // ccxt dicts come from JSON parsing 99%+ of the time, so the
            // probe lets us skip the entrySet walk + HashMap allocation on
            // the all-miss case (the dominant cost for params/optional-key
            // lookups). Tolerate CME from concurrent mutation by treating
            // it as a miss; caller will look up again on the next message.
            //
            // Note: do NOT use `keySet().stream().allMatch(k -> k instanceof
            // String)` here — combined with the unchecked Map<String,Object>
            // cast above, the lambda's auto-cast throws ClassCastException
            // for non-String keys, defeating the purpose of the slow path.
            try {
                java.util.Iterator<? extends Map.Entry<?, ?>> it = dict.entrySet().iterator();
                if (!it.hasNext()) return defaultValue;
                Map.Entry<?, ?> first = it.next();
                if (first.getKey() instanceof String) {
                    // Almost certainly all-String-keyed (the rare mixed-key
                    // case is handled by JSON parsers producing String keys
                    // exclusively). Fast path already covered every String
                    // lookup, so no point retrying.
                    return defaultValue;
                }
                // First key is non-String — full coercion warranted.
                Map<String, Object> coerced = new java.util.HashMap<>();
                coerced.put(String.valueOf(first.getKey()), first.getValue());
                while (it.hasNext()) {
                    Map.Entry<?, ?> entry = it.next();
                    coerced.put(String.valueOf(entry.getKey()), entry.getValue());
                }
                for (Object k2 : keys) {
                    if (k2 == null) continue;
                    String wanted = String.valueOf(k2);
                    if (coerced.containsKey(wanted)) {
                        Object returnValue = coerced.get(wanted);
                        if (returnValue == null || (returnValue instanceof String s && s.isEmpty())) continue;
                        return returnValue;
                    }
                }
            } catch (java.util.ConcurrentModificationException ignored) {
                // concurrent writer beat us — fall through to default
            }
            return defaultValue;
        }
        if (obj instanceof List<?> l) {
            for (Object k : keys) {
                int idx;
                try {
                    idx = Integer.parseInt(String.valueOf(k));
                } catch (NumberFormatException nfe) {
                    continue;
                }
                if (idx >= 0 && idx < l.size()) {
                    Object val = l.get(idx);
                    // TS getValueFromKeysInArray skips '' as well as null
                    if (!isMissingValue(val)) return val;
                }
            }
            return defaultValue;
        }

        // Arbitrary Java objects: use reflection to read fields (e.g. WsOrderBook)
        for (Object k2 : keys) {
            if (k2 == null) continue;
            String k = String.valueOf(k2);
            try {
                java.lang.reflect.Field f = obj.getClass().getField(k);
                f.setAccessible(true);
                Object val = f.get(obj);
                if (val != null) return val;
            } catch (Exception ignored) {}
        }

        return defaultValue;
    }

    // ----------------------------

    public static Object safeStringUpper(Object obj, Object key, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeString(obj, key);
        return (result == null)? defaultValue : ((String)result).toUpperCase();
    }

    public static Object safeStringUpper2(Object obj, Object key1, Object key2, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeString2(obj, key1, key2);
        return (result == null)? defaultValue : ((String)result).toUpperCase();
    }

    public static Object safeStringUpperN(Object obj, Object keys, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeStringN(obj, keys);
        return (result == null)? defaultValue : ((String)result).toUpperCase();
    }

    public static Object safeStringLower(Object obj, Object key, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeString(obj, key);
        return (result == null)? defaultValue : ((String)result).toLowerCase();
    }

    public static Object safeStringLower2(Object obj, Object key1, Object key2, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeString2(obj, key1, key2);
        return (result == null)? defaultValue : ((String)result).toLowerCase();
    }

    public static Object safeStringLowerN(Object obj, Object keys, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeStringN(obj, keys);
        return (result == null) ? defaultValue : ((String)result).toLowerCase();
    }

    // ----------------------------

    public static Long safeIntegerProduct(Object obj, Object key, Object multiplier, Object... defaultValue2) {
        Object defaultValue = opt(defaultValue2);
        if (multiplier == null) multiplier = 1;
        Object result = SafeValueN(obj, Arrays.asList(key), defaultValue);
        Long convertedDefault = (defaultValue == null) ? null : toLongQuiet(defaultValue);
        if (result == null) return convertedDefault;

        try {
            double r = Double.parseDouble(String.valueOf(result));
            double m = Double.parseDouble(String.valueOf(multiplier));
            return (long) (r * m);
        } catch (Exception ignored) {
        }
        return convertedDefault;
    }

    public static Object safeIntegerProduct2(Object obj, Object key1, Object key2, Object multiplier, Object... defaultValue2) {
        Object defaultValue = opt(defaultValue2);
        Object result = SafeValueN(obj, Arrays.asList(key1, key2), defaultValue);
        Object parsedValue = null;
        try {
            double r = Double.parseDouble(String.valueOf(result));
            double m = Double.parseDouble(String.valueOf(multiplier));
            parsedValue = (long) (r * m);
        } catch (Exception ignored) {
        }
        return (parsedValue == null) ? defaultValue : parsedValue;
    }

    public static Object safeIntegerProductN(Object obj, List<Object> keys, Object multiplier, Object... defaultValue2) {
        Object defaultValue = opt(defaultValue2);
        Object result = SafeValueN(obj, keys, defaultValue);
        if (result == null) return defaultValue;
        Object parsedValue = null;
        try {
            double r = Double.parseDouble(String.valueOf(result));
            double m = Double.parseDouble(String.valueOf(multiplier));
            parsedValue = (long) (r * m);
        } catch (Exception ignored) {
        }
        return (parsedValue == null) ? defaultValue : parsedValue;
    }

    // ----------------------------

    public static Boolean SafeBool(Object obj, Object key1, Boolean defaultValue) {
        Object value = SafeValue(obj, key1);
        if (value instanceof Boolean b) return b;
        return defaultValue;
    }

    // vararg overload (optional default)
    public static Boolean SafeBool(Object obj, Object key1, Object... defaultValue) {
        Boolean def = (Boolean) opt(defaultValue);
        Object value = SafeValue(obj, key1);
        if (value instanceof Boolean b) return b;
        return def;
    }
}
