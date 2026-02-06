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
    // Small helpers / shims
    // ----------------------------

    public static Object toStringOrNull(Object v) {
        return (v == null) ? null : String.valueOf(v);
    }

    private static boolean listHasIndex(List<?> l, int i) {
        return i >= 0 && i < l.size();
    }

    // ----------------------------
    // ConvertToDictionaryOfStringObject
    // ----------------------------

    /**
     * Attempts to coerce any Map-like object into Map<String,Object> by stringifying keys.
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
    // SafeNumberN (alias of SafeFloatN)
    // ----------------------------

    public static Object SafeNumberN(Object obj, Object keys, Object... defaultValue) {
        return SafeFloatN(obj, keys, defaultValue);
    }
    public static Object safeNumberN(Object obj, Object keys, Object... defaultValue) {
        return SafeNumberN(obj, keys, defaultValue);
    }

    // // vararg overloads (optional default)
    // public static Object SafeNumberN(Object obj, List<Object> keys, Object... defaultValue) {
    //     return SafeNumberN(obj, keys, opt(defaultValue));
    // }
    // public static Object safeNumberN(Object obj, List<Object> keys, Object... defaultValue) {
    //     return SafeNumberN(obj, keys, opt(defaultValue));
    // }

    // ----------------------------
    // safeTimestamp*
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

    // vararg overloads (optional default)
    // public static Object safeTimestampN(Object obj, List<Object> keys, Object... defaultValue) {
    //     return safeTimestampN(obj, keys, opt(defaultValue));
    // }
    // public static Object safeTimestamp(Object obj, Object key, Object... defaultValue) {
    //     return safeTimestampN(obj, Arrays.asList(key), opt(defaultValue));
    // }
    // public static Object safeTimestamp2(Object obj, Object key1, Object key2, Object... defaultValue) {
    //     return safeTimestampN(obj, Arrays.asList(key1, key2), opt(defaultValue));
    // }

    // ----------------------------
    // SafeInteger / SafeIntegerN
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

        if (result == null || String.valueOf(result).length() == 0) return convertedDefault;

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

    // vararg overloads (optional default)
    // public static Object SafeInteger(Object obj, Object key, Object... defaultValue) {
    //     return SafeInteger(obj, key, opt(defaultValue));
    // }
    // public static Object safeInteger2(Object obj, Object key1, Object key2, Object... defaultValue) {
    //     return safeInteger2(obj, key1, key2, opt(defaultValue));
    // }
    // public static Object safeIntegerN(Object obj, List<Object> keys, Object... defaultValue) {
    //     return SafeIntegerN(obj, keys, opt(defaultValue));
    // }
    // public static Long SafeIntegerN(Object obj, List<Object> keys, Object... defaultValue) {
    //     return SafeIntegerN(obj, keys, opt(defaultValue));
    // }

    // ----------------------------
    // SafeFloat / SafeFloatN
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

    // vararg overloads (optional default)
    // public static Double SafeFloat(Object obj, Object key, Object... defaultValue) {
    //     return SafeFloat(obj, key, opt(defaultValue));
    // }
    // public static Double safeFloat(Object obj, Object key, Object... defaultValue) {
    //     return SafeFloat(obj, key, opt(defaultValue));
    // }
    // public static Double safeFloat2(Object obj, Object key1, Object key2, Object... defaultValue) {
    //     return SafeFloatN(obj, Arrays.asList(key1, key2), opt(defaultValue));
    // }
    // public static Double safeFloatN(Object obj, Object keys, Object... defaultValue) {
    //     return SafeFloatN(obj, (List<Object>) keys, opt(defaultValue));
    // }
    // public static Double SafeFloatN(Object obj, List<Object> keys, Object... defaultValue) {
    //     return SafeFloatN(obj, keys, opt(defaultValue));
    // }

    // ----------------------------
    // SafeString / SafeStringN
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

    // // vararg overloads (optional default)
    // public static Object SafeString(Object obj, Object key, Object... defaultValue) {
    //     return SafeString(obj, key, opt(defaultValue));
    // }
    // public static Object safeString(Object obj, Object key, Object... defaultValue) {
    //     return SafeStringN(obj, Arrays.asList(key), opt(defaultValue));
    // }
    // public static Object safeString2(Object obj, Object key1, Object key2, Object... defaultValue) {
    //     return SafeStringN(obj, Arrays.asList(key1, key2), opt(defaultValue));
    // }
    // public static Object safeStringN(Object obj, Object keys, Object... defaultValue) {
    //     return SafeStringN(obj, (List<Object>) keys, opt(defaultValue));
    // }
    // public static Object SafeStringN(Object obj, Object keys, Object... defaultValue) {
    //     return SafeStringN(obj, (List<Object>) keys, opt(defaultValue));
    // }
    // public static Object SafeStringN(Object obj, List<Object> keys, Object... defaultValue) {
    //     return SafeStringN(obj, keys, opt(defaultValue));
    // }

    // ----------------------------
    // SafeValue / SafeValueN
    // ----------------------------

    public static Object SafeValue(Object obj, Object key1, Object... defaultValue) {
        return SafeValueN(obj, Arrays.asList(key1), defaultValue);
    }

    // public static Object SafeValue(Object obj, Object key1, Object... defaultValue) {
    //     return SafeValueN(obj, Arrays.asList(key1), defaultValue);
    // }

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
            Map<String, Object> dict = (Map<String, Object>) m;

            // If it's not String-keyed, coerce keys to String
            boolean allStringKeys = dict.keySet().stream().allMatch(k -> k instanceof String);
            if (!allStringKeys) {
                dict = ConvertToDictionaryOfStringObject(obj);
            }

            for (Object k2 : keys) {
                if (k2 == null) continue;
                String k = String.valueOf(k2);
                if (dict.containsKey(k)) {
                    Object returnValue = dict.get(k);
                    if (returnValue == null || String.valueOf(returnValue).length() == 0) continue;
                    return returnValue;
                }
            }
            return defaultValue;
        }

        // List<Object>
        if (obj instanceof List<?> l) {
            List<Object> list = (List<Object>) l;
            for (Object k : keys) {
                int idx;
                try {
                    idx = Integer.parseInt(String.valueOf(k));
                } catch (NumberFormatException nfe) {
                    continue;
                }
                if (listHasIndex(list, idx)) {
                    return list.get(idx);
                }
            }
            return defaultValue;
        }

        // List<String>
        if (obj instanceof List<?> lstr && !lstr.isEmpty() && lstr.get(0) instanceof String) {
            List<String> list = (List<String>) lstr;
            for (Object k : keys) {
                int idx;
                try {
                    idx = Integer.parseInt(String.valueOf(k));
                } catch (NumberFormatException nfe) {
                    continue;
                }
                if (idx >= 0 && idx < list.size()) {
                    String val = list.get(idx);
                    if (val != null) return val;
                }
            }
            return defaultValue;
        }

        // List<Integer>
        if (obj instanceof List<?> lint && !lint.isEmpty() && lint.get(0) instanceof Integer) {
            List<Integer> list = (List<Integer>) lint;
            for (Object k : keys) {
                if (!(k instanceof Integer)) continue;
                int idx = (Integer) k;
                if (idx >= 0 && idx < list.size()) {
                    Integer val = list.get(idx);
                    if (val != null) return val;
                }
            }
            return defaultValue;
        }

        return defaultValue;
    }

    // vararg overloads (optional default)
    // public static Object SafeValue(Object obj, Object key1, Object... defaultValue) {
    //     return SafeValueN(obj, Arrays.asList(key1), opt(defaultValue));
    // }
    // public static Object safeValue(Object obj, Object key1, Object... defaultValue) {
    //     return SafeValueN(obj, Arrays.asList(key1), opt(defaultValue));
    // }
    // public static Object safeValue2(Object obj, Object key1, Object key2, Object... defaultValue) {
    //     return SafeValueN(obj, Arrays.asList(key1, key2), opt(defaultValue));
    // }
    // public static Object safeValueN(Object obj, Object keys2, Object... defaultValue) {
    //     return SafeValueN(obj, keys2, opt(defaultValue));
    // }
    // public static Object SafeValueN(Object obj, Object keys2, Object... defaultValue) {
    //     return SafeValueN(obj, keys2, opt(defaultValue));
    // }

    // ----------------------------
    // safeString upper/lower methods
    // ----------------------------

    public static Object safeStringUpper(Object obj, Object key, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = toStringOrNull(safeString(obj, key, defaultValue));
        return (result == null)? defaultValue : ((String)result).toUpperCase();
    }

    public static Object safeStringUpper2(Object obj, Object key1, Object key2, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeString2(obj, key1, key2, defaultValue);
        return (result == null)? defaultValue : ((String)result).toUpperCase();
    }

    public static Object safeStringUpperN(Object obj, Object keys, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeStringN(obj, keys, defaultValue);
        return (result == null)? defaultValue : ((String)result).toUpperCase();
    }

    public static Object safeStringLower(Object obj, Object key, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeString(obj, key, defaultValue);
        return (result == null)? defaultValue : ((String)result).toLowerCase();
    }

    public static Object safeStringLower2(Object obj, Object key1, Object key2, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeString2(obj, key1, key2, defaultValue);
        return (result == null)? defaultValue : ((String)result).toLowerCase();
    }

    public static Object safeStringLowerN(Object obj, Object keys, Object... defaultValues) {
        Object defaultValue = opt(defaultValues);
        Object result = safeStringN(obj, keys, defaultValue);
        return (result == null) ? defaultValue : ((String)result).toLowerCase();
    }

    // // vararg overloads (optional default)
    // public static Object safeStringUpper(Object obj, Object key, Object... defaultValue) {
    //     Object def = opt(defaultValue);
    //     String result = toStringOrNull(safeString(obj, key, def));
    //     return (result == null)? def : result.toUpperCase();
    // }
    // public static Object safeStringUpper2(Object obj, Object key1, Object key2, Object... defaultValue) {
    //     Object def = opt(defaultValue);
    //     String result = safeString2(obj, key1, key2, def);
    //     return (result == null)? def : result.toUpperCase();
    // }
    // public static Object safeStringUpperN(Object obj, List<Object> keys, Object... defaultValue) {
    //     Object def = opt(defaultValue);
    //     String result = safeStringN(obj, keys, def);
    //     return (result == null)? def : result.toUpperCase();
    // }
    // public static Object safeStringLower(Object obj, Object key, Object... defaultValue) {
    //     Object def = opt(defaultValue);
    //     String result = safeString(obj, key, def);
    //     return (result == null)? def : result.toLowerCase();
    // }
    // public static Object safeStringLower2(Object obj, Object key1, Object key2, Object... defaultValue) {
    //     Object def = opt(defaultValue);
    //     String result = safeString2(obj, key1, key2, def);
    //     return (result == null)? def : result.toLowerCase();
    // }
    // public static Object safeStringLowerN(Object obj, List<Object> keys, Object... defaultValue) {
    //     Object def = opt(defaultValue);
    //     String result = safeStringN(obj, keys, def);
    //     return (result == null)? def : result.toLowerCase();
    // }

    // ----------------------------
    // safeIntegerProduct*
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

    // vararg overloads (optional default)
    // public static Object safeIntegerProduct(Object obj, Object key, Object multiplier, Object... defaultValue) {
    //     return safeIntegerProduct(obj, key, multiplier, defaultValue);
    // }
    // public static Object safeIntegerProduct2(Object obj, Object key1, Object key2, Object multiplier, Object... defaultValue) {
    //     return safeIntegerProduct2(obj, key1, key2, multiplier, defaultValue);
    // }
    // public static Object safeIntegerProductN(Object obj, List<Object> keys, Object multiplier, Object... defaultValue) {
    //     return safeIntegerProductN(obj, keys, multiplier, defaultValue);
    // }

    // ----------------------------
    // SafeBool
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
