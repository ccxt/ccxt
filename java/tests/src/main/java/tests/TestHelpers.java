package tests;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.regex.Pattern;

import io.github.ccxt.Helpers;

/**
 * Test-only runtime helpers relocated from {@link Helpers} once library call sites reached zero.
 */
@SuppressWarnings({"unchecked", "rawtypes"})
public class TestHelpers {

    public static HashMap<String, Object> newMap(Object... keysAndValues) {
        HashMap<String, Object> map = new HashMap<>();
        for (int i = 0; i + 1 < keysAndValues.length; i += 2) {
            map.put((String) keysAndValues[i], keysAndValues[i + 1]);
        }
        return map;
    }

    private static Object normalizeIntIfNeeded(Object a) {
        if (a == null) return null;
        if (a instanceof Integer) {
            return Long.valueOf(((Integer) a).longValue());
        }
        return a;
    }

    private static boolean isNumber(Object number) {
        if (number == null) return false;
        try {
            Double.parseDouble(String.valueOf(number));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private static boolean isInteger(Object value) {
        if (value == null) return false;
        if (value instanceof Byte || value instanceof Short ||
            value instanceof Integer || value instanceof Long ||
            value instanceof java.util.concurrent.atomic.AtomicInteger ||
            value instanceof java.util.concurrent.atomic.AtomicLong) {
            return true;
        }
        if (value instanceof Float || value instanceof Double || value instanceof BigDecimal) {
            BigDecimal d = new BigDecimal(String.valueOf(value));
            return d.stripTrailingZeros().scale() <= 0;
        }
        return false;
    }

    private static double toDouble(Object o) {
        if (o instanceof Double) return (Double) o;
        if (o instanceof Float) return ((Float) o).doubleValue();
        if (o instanceof Long) return ((Long) o).doubleValue();
        if (o instanceof Integer) return ((Integer) o).doubleValue();
        if (o instanceof BigDecimal) return ((BigDecimal) o).doubleValue();
        if (o instanceof String) {
            try { return Double.parseDouble((String) o); } catch (NumberFormatException ex) { return 0.0; }
        }
        try { return Double.parseDouble(String.valueOf(o)); } catch (NumberFormatException ex) { return 0.0; }
    }

    public static boolean isTrue(Object value) {
        if (value == null) return false;
        value = normalizeIntIfNeeded(value);
        if (value instanceof Boolean) {
            return (Boolean) value;
        } else if (value instanceof Long) {
            return ((Long) value) != 0L;
        } else if (value instanceof Integer) {
            return ((Integer) value) != 0;
        } else if (value instanceof Double) {
            return ((Double) value) != 0.0;
        } else if (value instanceof String) {
            return !((String) value).isEmpty();
        } else if (value instanceof List) {
            return !((List<?>) value).isEmpty();
        } else if (value instanceof Map) {
            return true;
        } else {
            return false;
        }
    }

    public static boolean isGreaterThan(Object a, Object b) {
        if (a != null && b == null) return true;
        if (a == null || b == null) return false;
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a instanceof Long && b instanceof Long) {
            return ((Long) a) > ((Long) b);
        } else if (a instanceof Integer && b instanceof Integer) {
            return ((Integer) a) > ((Integer) b);
        } else if (isNumber(a) || isNumber(b)) {
            return toDouble(a) > toDouble(b);
        } else if (a instanceof String && b instanceof String) {
            return ((String) a).compareTo((String) b) > 0;
        } else {
            return false;
        }
    }

    public static boolean isLessThan(Object a, Object b) {
        return !isGreaterThan(a, b) && !Helpers.isEqual(a, b);
    }

    public static boolean isGreaterThanOrEqual(Object a, Object b) {
        return isGreaterThan(a, b) || Helpers.isEqual(a, b);
    }

    public static boolean isLessThanOrEqual(Object a, Object b) {
        return isLessThan(a, b) || Helpers.isEqual(a, b);
    }

    public static Object add(Object a, Object b) {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a instanceof Long && b instanceof Long) {
            return ((Long) a) + ((Long) b);
        } else if (a instanceof Double || b instanceof Double) {
            return toDouble(a) + toDouble(b);
        } else if (a instanceof String && b instanceof String) {
            return ((String) a) + ((String) b);
        } else if (a instanceof String || b instanceof String) {
            return String.valueOf(a) + String.valueOf(b);
        }
        return null;
    }

    public static String add(String a, String b) {
        return a + b;
    }

    public static String add(String a, Object b) {
        return a + String.valueOf(b);
    }

    public static Object subtract(Object a, Object b) {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a instanceof Long && b instanceof Long) {
            return ((Long) a) - ((Long) b);
        } else if (a instanceof Integer && b instanceof Integer) {
            return ((Integer) a) - ((Integer) b);
        } else if (a instanceof Double || b instanceof Double) {
            return toDouble(a) - toDouble(b);
        } else {
            return null;
        }
    }

    public static Object divide(Object a, Object b) {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a == null || b == null) return null;
        if (a instanceof Long && b instanceof Long) {
            return ((Long) a).doubleValue() / ((Long) b);
        } else if (a instanceof Double && b instanceof Double) {
            return ((Double) a) / ((Double) b);
        } else {
            return toDouble(a) / toDouble(b);
        }
    }

    public static Object multiply(Object a, Object b) {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a == null || b == null) return null;
        if (a instanceof Long && b instanceof Long) {
            return ((Long) a) * ((Long) b);
        }
        double res = toDouble(a) * toDouble(b);
        if (isInteger(res)) {
            return (long) res;
        } else {
            return res;
        }
    }

    public static int getArrayLength(Object value) {
        if (value == null) return 0;
        if (value instanceof List<?>) {
            return ((List<?>) value).size();
        } else if (value instanceof String) {
            return ((String) value).length();
        } else if (value.getClass().isArray()) {
            return java.lang.reflect.Array.getLength(value);
        } else {
            return 0;
        }
    }

    public static Object mathMax(Object a, Object b) {
        if (a == null || b == null) return null;
        double first = toDouble(a);
        double second = toDouble(b);
        return (first > second) ? a : b;
    }

    public static Object mathAbs(Object val) {
        if (val == null) return null;
        if (val instanceof Integer) return Math.abs((Integer) val);
        if (val instanceof Long) return Math.abs((Long) val);
        if (val instanceof Float) return Math.abs((Float) val);
        if (val instanceof Double) return Math.abs((Double) val);
        if (val instanceof BigDecimal) return ((BigDecimal) val).abs();
        if (val instanceof Number) return Math.abs(((Number) val).doubleValue());
        return null;
    }

    public static CompletableFuture<List<Object>> promiseAll(Object promisesObj) {
        List<?> promises = (List<?>) promisesObj;
        List<CompletableFuture<Object>> futures = new ArrayList<>();
        for (Object p : promises) {
            if (p instanceof CompletableFuture) {
                futures.add((CompletableFuture<Object>) p);
            }
        }
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> {
                    List<Object> out = new ArrayList<>(futures.size());
                    for (CompletableFuture<Object> f : futures) {
                        try {
                            out.add(f.get());
                        } catch (InterruptedException | ExecutionException e) {
                            throw new RuntimeException(e);
                        }
                    }
                    return out;
                });
    }

    public static Object toStringOrNull(Object value) {
        if (value == null) return null;
        return value;
    }

    public static String toString(Object value) {
        if (value == null) return null;
        return value.toString();
    }

    public static boolean inOp(Object obj, Object key) {
        if (obj == null || key == null) return false;
        if (obj instanceof List<?>) {
            return ((List<?>) obj).contains(key);
        } else if (obj instanceof Map<?, ?>) {
            return (key instanceof String) && ((Map<?, ?>) obj).containsKey(key);
        } else {
            return false;
        }
    }

    public static String replace(Object baseString, Object search, Object replacement) {
        if (baseString == null) return null;
        String s = String.valueOf(baseString);
        String find = (search == null) ? "" : String.valueOf(search);
        String repl = (replacement == null) ? "" : String.valueOf(replacement);
        return s.replaceFirst(Pattern.quote(find), java.util.regex.Matcher.quoteReplacement(repl));
    }

    public static Object getArg(Object[] v, int index, Object def) {
        if (v == null || v.length <= index) return def;
        return v[index];
    }

    public static Long toLongOrNull(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Number) return ((Number) value).longValue();
        throw new ClassCastException("ccxt: expected a number, got " + value.getClass().getName());
    }

    public static String toStringArg(Object value) {
        return value == null ? null : (value instanceof String ? (String) value : String.valueOf(value));
    }

    public static Map<String, Object> toMapArg(Object value) {
        if (value == null || value instanceof Map) return (Map<String, Object>) value;
        throw new ClassCastException("ccxt: expected a dictionary, got " + value.getClass().getName());
    }

    public static List<String> toStringListArg(Object value) {
        if (value == null || value instanceof List) return (List<String>) value;
        throw new ClassCastException("ccxt: expected a list of strings, got " + value.getClass().getName());
    }

    public static List<Object> objectKeys(Object target) {
        if (target instanceof Map<?, ?> m) return new ArrayList<>(m.keySet());
        return new ArrayList<>();
    }

    public static List<Object> objectValues(Object target) {
        if (target instanceof Map<?, ?> m) return new ArrayList<>(m.values());
        return new ArrayList<>();
    }

    public static Object opNeg(Object value) {
        if (value == null) return null;
        if (value instanceof Byte v) return (byte) -v;
        if (value instanceof Short v) return (short) -v;
        if (value instanceof Integer v) return -v;
        if (value instanceof Long v) return -v;
        if (value instanceof Float v) return -v;
        if (value instanceof Double v) return -v;
        return null;
    }

    public static Object split(Object str, Object splitter) {
        if (str == null || splitter == null) return Collections.emptyList();
        String s = String.valueOf(str);
        String delim = String.valueOf(splitter);
        return Arrays.asList(s.split(Pattern.quote(delim)));
    }

    public static boolean isInstance(Object value, Object type) {
        if (!(type instanceof Class<?> clazz)) {
            return false;
        }
        Object target = value;
        if (value instanceof Throwable t) {
            // unwrap async wrappers
            while ((t instanceof java.util.concurrent.CompletionException || t instanceof ExecutionException) && t.getCause() != null) {
                t = t.getCause();
            }
            target = t;
        }
        return clazz.isInstance(target);
    }
}
