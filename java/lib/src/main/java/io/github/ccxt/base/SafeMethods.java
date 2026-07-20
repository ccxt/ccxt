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

    private static boolean listHasIndex(List<?> l, int i) {
        return i >= 0 && i < l.size();
    }

    // ----------------------------

    /**
     * Attempts to coerce any Map-like object into by stringifying keys.
     * Throws IllegalStateException if the input is not a Map.
     */
    public static Map<String, Object> ConvertToDictionaryOfStringObject(Object potentialDictionary) {
        if (potentialDictionary instanceof Map<?, ?> m) {
            Map<String, Object> result = new LinkedHashMap<>();
            for (Map.Entry<?, ?> e : m.entrySet()) {
                result.put(String.valueOf(e.getKey()), e.getValue());
            }
            return result;
        }
        throw new IllegalStateException("The provided object is not a dictionary.");
    }

    // ----------------------------

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

    public static Object SafeInteger(Object obj, Object key, Object... defaultValue) {
        Long res = SafeIntegerN(obj, Arrays.asList(key), defaultValue);
        return (res == null) ? null : res;
    }

    public static Object SafeInteger2(Object obj, Object key1, Object key2, Object... defaultValue) {
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

    public static String SafeStringTyped(Object obj, Object key, Object... defaultValue) {
        Object res = SafeStringN(obj, Arrays.asList(key), defaultValue);
        return (res == null) ? "" : (String) res;
    }

    public static Object SafeString(Object obj, Object key, Object... defaultValue) {
        Object res = SafeStringN(obj, Arrays.asList(key), defaultValue);
        return (res == null) ? null : res;
    }

    public static Object safeString(Object obj, Object key, Object... defaultValue) {
        return SafeStringN(obj, Arrays.asList(key), defaultValue);
    }

    public static Object safeString2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeStringN(obj, Arrays.asList(key1, key2), defaultValue);
    }

    public static Object safeStringN(Object obj, Object keys, Object... defaultValue) {
        return SafeStringN(obj, (List<Object>) keys, defaultValue);
    }

    public static Object SafeStringN(Object obj, Object keys, Object... defaultValue) {
        return SafeStringN(obj, (List<Object>) keys, defaultValue);
    }

    public static Object SafeStringN(Object obj, List<Object> keys, Object... defaultValue2) {
        Object defaultValue = opt(defaultValue2);
        Object result = SafeValueN(obj, keys, defaultValue);
        if (result == null) return (defaultValue instanceof String s) ? s : null;

        if (result instanceof List<?> || result instanceof Map<?, ?>) {
            return (defaultValue instanceof String s) ? s : null;
        }

        String ret;
        if (result instanceof Float f) {
            ret = String.valueOf(f);
        } else if (result instanceof Double d) {
            ret = String.valueOf(d);
        } else if (result instanceof java.math.BigDecimal bd) {
            ret = bd.toPlainString();
        } else {
            ret = String.valueOf(result);
        }
        if (ret != null && !ret.isEmpty()) return ret;
        return (defaultValue instanceof String s) ? s : null;
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
                    if (val != null) return val;
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
        Object result = toStringOrNull(safeString(obj, key));
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
