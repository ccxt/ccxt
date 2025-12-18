package io.github.ccxt;

import java.lang.reflect.Array;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicReference;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@SuppressWarnings({"unchecked", "rawtypes"})
public class Helpers {


    private static final ObjectMapper mapper = new ObjectMapper();
    // tmp most of these methods are going to be re-implemented in the future to be more generic and efficient
    public static Object normalizeIntIfNeeded(Object a) {
        if (a == null) return null;
        if (a instanceof Integer) {
            return Long.valueOf(((Integer) a).longValue());
        }
        return a;
    }

    // C# had "ref object a" + returns new value; in Java we mimic with AtomicReference<Object>
    public static Object postFixIncrement(AtomicReference<Object> a) {
        Object val = a.get();
        if (val instanceof Long) {
            a.set(((Long) val) + 1L);
        } else if (val instanceof Integer) {
            a.set(((Integer) val) + 1);
        } else if (val instanceof Double) {
            a.set(((Double) val) + 1.0);
        } else if (val instanceof String) {
            a.set(((String) val) + 1);
        } else {
            return null;
        }
        return a.get();
    }

    public static Object postFixDecrement(AtomicReference<Object> a) {
        Object val = a.get();
        if (val instanceof Long) {
            a.set(((Long) val) - 1L);
        } else if (val instanceof Integer) {
            a.set(((Integer) val) - 1);
        } else if (val instanceof Double) {
            a.set(((Double) val) - 1.0);
        } else {
            return null;
        }
        return a.get();
    }

    public static Object prefixUnaryNeg(AtomicReference<Object> a) {
        Object val = a.get();
        if (val instanceof Long) {
            a.set(-((Long) val));
        } else if (val instanceof Integer) {
            a.set(-((Integer) val));
        } else if (val instanceof Double) {
            a.set(-((Double) val));
        } else if (val instanceof String) {
            return null;
        } else {
            return null;
        }
        return a.get();
    }

    public static Object prefixUnaryPlus(AtomicReference<Object> a) {
        Object val = a.get();
        if (val instanceof Long) {
            a.set(+((Long) val));
        } else if (val instanceof Integer) {
            a.set(+((Integer) val));
        } else if (val instanceof Double) {
            a.set(+((Double) val));
        } else if (val instanceof String) {
            return null;
        } else {
            return null;
        }
        return a.get();
    }

    public static Object plusEqual(Object a, Object value) {
        a = normalizeIntIfNeeded(a);
        value = normalizeIntIfNeeded(value);

        if (value == null) return null;
        if (a instanceof Long && value instanceof Long) {
            return (Long) a + (Long) value;
        } else if (a instanceof Integer && value instanceof Integer) {
            return (Integer) a + (Integer) value;
        } else if (a instanceof Double && value instanceof Double) {
            return (Double) a + (Double) value;
        } else if (a instanceof String && value instanceof String) {
            return ((String) a) + ((String) value);
        } else {
            return null;
        }
    }

    // NOTE: In C# this used JsonHelper.Deserialize((string)json).
    // In Java, wire up your preferred JSON lib and return Map/List accordingly.
    public static Object parseJson(Object json) {
        // placeholder: return the string itself (or plug in Jackson/Gson here)
        return (json instanceof String) ? (String) json : null;
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
            // C# returned true for any IDictionary; we can mirror that or check emptiness.
            return true;
        } else {
            return false;
        }
    }

    public static boolean isNumber(Object number) {
        if (number == null) return false;
        try {
            Double.parseDouble(String.valueOf(number));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean isEqual(Object a, Object b) {
        try {
            if (a == null && b == null) return true;
            if (a == null || b == null) return false;

            // If types differ and neither is numeric, they're not equal
            if (!a.getClass().equals(b.getClass()) && !(isNumber(a) && isNumber(b))) {
                return false;
            }

            if (IsInteger(a) && IsInteger(b)) {
                return toLong(a).equals(toLong(b));
            }
            if ((a instanceof Long) && (b instanceof Long)) {
                return ((Long) a).longValue() == ((Long) b).longValue();
            }
            if (a instanceof Double || b instanceof Double) {
                return toDouble(a) == toDouble(b);
            }
            if (a instanceof Float || b instanceof Float) {
                return toFloat(a) == toFloat(b);
            }
            if (a instanceof String && b instanceof String) {
                return ((String) a).equals((String) b);
            }
            if (a instanceof Boolean && b instanceof Boolean) {
                return ((Boolean) a).booleanValue() == ((Boolean) b).booleanValue();
            }
            // decimal cases mapped via BigDecimal compare
            if (isNumber(a) && isNumber(b)) {
                return new BigDecimal(String.valueOf(a)).compareTo(new BigDecimal(String.valueOf(b))) == 0;
            }
            return false;
        } catch (Exception ignored) {
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
        return !isGreaterThan(a, b) && !isEqual(a, b);
    }

    public static boolean isGreaterThanOrEqual(Object a, Object b) {
        return isGreaterThan(a, b) || isEqual(a, b);
    }

    public static boolean isLessThanOrEqual(Object a, Object b) {
        return isLessThan(a, b) || isEqual(a, b);
    }

    public static Object mod(Object a, Object b) {
        if (a == null || b == null) return null;
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a instanceof String || a instanceof Long || a instanceof Integer || a instanceof Double) {
            return toDouble(a) % toDouble(b);
        }
        return null;
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

//     public static String add(Object... items) {
//     StringBuilder sb = new StringBuilder();

//     for (Object item : items) {
//         if (item instanceof String) {
//             sb.append((String) item);
//         }
//     }

//     return sb.toString();
// }

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

    // public static int subtract(int a, int b) { return a - b; }

    // public float subtract(float a, float b) { return a - b; }

    public static Object divide(Object a, Object b) {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a == null || b == null) return null;

        if (a instanceof Long && b instanceof Long) {
            // C# integer division; keep behavior
            return ((Long) a) / ((Long) b);
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
        if (IsInteger(res)) {
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
            return ((String) value).length(); // fallback
        } else if (value.getClass().isArray()) {
            return java.lang.reflect.Array.getLength(value);
        } else {
            return 0;
        }
    }

    public static boolean IsInteger(Object value) {
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

    public static Object mathMin(Object a, Object b) {
        if (a == null || b == null) return null;
        double first = toDouble(a);
        double second = toDouble(b);
        return (first < second) ? a : b;
    }

    public static double mathPow(Object base, Object exp) {
        if (base instanceof Number && exp instanceof Number) {
            double baseFloat = ((Number) base).doubleValue();
            double expFloat = ((Number) exp).doubleValue();
            return Math.pow(baseFloat, expFloat);
        }
        return 0;
    }

    public static Object mathMax(Object a, Object b) {
        if (a == null || b == null) return null;
        double first = toDouble(a);
        double second = toDouble(b);
        return (first > second) ? a : b;
    }

    public static int getIndexOf(Object str, Object target) {
        if (str instanceof List<?>) {
            return ((List<?>) str).indexOf(target);
        } else if (str instanceof String && target instanceof String) {
            return ((String) str).indexOf((String) target);
        } else {
            return -1;
        }
    }

    public static Object parseInt(Object a) {
        try {
            return toLong(a);
        } catch (Exception ignored) {
            return null;
        }
    }

    public static Object parseFloat(Object a) {
        try {
            return toDouble(a);
        } catch (Exception ignored) {
            return null;
        }
    }

    // generic getValue to replace elementAccesses
    public Object getValue(Object a, Object b) { return GetValue(a, b); }

    public static Object GetValue(Object value2, Object key) {
        if (value2 == null || key == null) return null;

        // Strings: index access
        if (value2 instanceof String) {
            String str = (String) value2;
            int idx = toInt(key);
            if (idx < 0 || idx >= str.length()) return null;
            return String.valueOf(str.charAt(idx));
        }

        Object value = value2;
        if (value2.getClass().isArray()) {
            // Convert to List<Object>
            int len = Array.getLength(value2);
            List<Object> list = new ArrayList<>(len);
            for (int i = 0; i < len; i++) list.add(Array.get(value2, i));
            value = list;
        }

        if (value instanceof Map) {
            Map<String, Object> m = (Map<String, Object>) value;
            if (key instanceof String && m.containsKey(key)) {
                return m.get(key);
            }
            return null;
        } else if (value instanceof List) {
            int idx = toInt(key);
            List<?> list = (List<?>) value;
            if (idx < 0 || idx >= list.size()) return null;
            return list.get(idx);
        } else if (key instanceof String) {
            // Try Java field or getter
            String name = (String) key;
            try {
                // Field
                Field f = value.getClass().getField(name);
                f.setAccessible(true);
                return f.get(value2);
            } catch (Exception ignored) {}
            try {
                // Getter
                String mName = "get" + Character.toUpperCase(name.charAt(0)) + name.substring(1);
                Method m = value.getClass().getMethod(mName);
                return m.invoke(value2);
            } catch (Exception ignored) {}
            return null;
        } else {
            return null;
        }
    }

    public static CompletableFuture<List<Object>> promiseAll(Object promisesObj) { return PromiseAll(promisesObj); }

    public static CompletableFuture<List<Object>> PromiseAll(Object promisesObj) {
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

    public static String toStringOrNull(Object value) {
        if (value == null) return null;
        return (String) value;
    }

    public static String toString(Object value) {
        if (value == null) return null;
        return (String) value;
    }


    // This function is the salient bit here
    public Object newException(Object exception, Object message) {
        return NewException((Class<?>) exception, (String) message);
    }

    public static Exception NewException(Class<?> exception, String message) {
        try {
            Constructor<?> ctor = exception.getConstructor(String.class);
            return (Exception) ctor.newInstance(message);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Object toFixed(Object number, Object decimals) {
        double n = toDouble(number);
        int d = toInt(decimals);
        BigDecimal bd = new BigDecimal(Double.toString(n)).setScale(d, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }

    // public static Object callDynamically(Object obj, Object methodName, Object[] args) {
    //     if (args == null) args = new Object[]{};
    //     if (args.length == 0) {
    //         // C# code injected a null arg to help binder; Java doesn't need it.
    //         // But to mirror behavior, we won't add a null here.
    //     }
    //     String name = (String) methodName;
    //     Method m = findMethod(obj.getClass(), name, args.length);
    //     try {
    //         m.setAccessible(true);
    //         return m.invoke(obj, args);
    //     } catch (Exception e) {
    //         throw new RuntimeException(e);
    //     }
    // }


    public static CompletableFuture<Object> callDynamically(Object obj, Object methodName, Object[] args) {
        if (args == null) {
            args = new Object[]{};
        }

        String name = (String) methodName;
        Method m = findMethod(obj.getClass(), name, args.length);

        try {
            m.setAccessible(true);
            Object result = m.invoke(obj, args);
            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            CompletableFuture<Object> failed = new CompletableFuture<>();
            failed.completeExceptionally(e);
            return failed;
        }
    }

    public static Object callDynamicallyAsync(Object obj, Object methodName, Object[] args) {
        if (args == null) args = new Object[]{};
        String name = (String) methodName;
        Method m = findMethod(obj.getClass(), name, args.length);
        try {
            m.setAccessible(true);
            Object res = m.invoke(obj, args);
            if (res instanceof CompletableFuture) {
                return ((CompletableFuture<?>) res).get();
            }
            return res;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static boolean inOp(Object obj, Object key) { return InOp(obj, key); }

    public static boolean InOp(Object obj, Object key) {
        if (obj == null || key == null) return false;

        if (obj instanceof List<?>) {
            return ((List<?>) obj).contains(key);
        } else if (obj instanceof Map<?, ?>) {
            if (key instanceof String) {
                return ((Map<?, ?>) obj).containsKey(key);
            } else return false;
        } else {
            return false;
        }
    }

    public static String slice(Object str2, Object idx1, Object idx2) { return Slice(str2, idx1, idx2); }

    // public String slice(Object str2, Object idx1, Object idx2) { return Slice(str2, idx1, idx2); }

    public static String Slice(Object str2, Object idx1, Object idx2) {
        if (str2 == null) return null;
        String str = (String) str2;
        int start = (idx1 != null) ? toInt(idx1) : -1;

        if (idx2 == null) {
            if (start < 0) {
                int innerStart = str.length() + start;
                innerStart = Math.max(innerStart, 0);
                return str.substring(innerStart);
            } else {
                if (start > str.length()) return "";
                return str.substring(start);
            }
        } else {
            int end = toInt(idx2);
            if (start < 0) start = str.length() + start;
            if (end < 0) end = str.length() + end;
            if (start < 0) start = 0;
            if (end > str.length()) end = str.length();
            if (start > end) start = end;
            return str.substring(start, end);
        }
    }

    public static Object concat(Object a, Object b) {
        if (a == null && b == null) return null;
        if (a == null) return b;
        if (b == null) return a;

        if (a instanceof List && b instanceof List) {
            List result = new ArrayList((List) a);
            result.addAll((List) b);
            return result;
        } else if (a instanceof List && !(b instanceof List)) {
            List result = new ArrayList((List) a);
            result.add(b);
            return result;
        } else if (!(a instanceof List) && b instanceof List) {
            List result = new ArrayList();
            result.add(a);
            result.addAll((List) b);
            return result;
        } else {
            throw new IllegalStateException("Unsupported types for concatenation.");
        }
    }

    // --------- helpers ---------

    private static Method findMethod(Class<?> cls, String name, int argCount) {
        // try exact arg count first
        for (Method m : cls.getDeclaredMethods()) {
            if (m.getName().equals(name) && m.getParameterCount() == argCount) {
                return m;
            }
        }
        // search up the hierarchy
        Class<?> cur = cls.getSuperclass();
        while (cur != null) {
            for (Method m : cur.getDeclaredMethods()) {
                if (m.getName().equals(name) && m.getParameterCount() == argCount) {
                    return m;
                }
            }
            cur = cur.getSuperclass();
        }
        // fallback: first by name
        for (Method m : cls.getDeclaredMethods()) {
            if (m.getName().equals(name)) return m;
        }
        throw new RuntimeException("Method not found: " + name + " with " + argCount + " args on " + cls.getName());
    }

    private static Long toLong(Object o) {
        if (o instanceof Long) return (Long) o;
        if (o instanceof Integer) return ((Integer) o).longValue();
        if (o instanceof Double) return ((Double) o).longValue();
        if (o instanceof Float) return ((Float) o).longValue();
        if (o instanceof BigDecimal) return ((BigDecimal) o).longValue();
        if (o instanceof String) return Long.parseLong((String) o);
        return Long.parseLong(String.valueOf(o));
    }

    private static int toInt(Object o) {
        if (o instanceof Integer) return (Integer) o;
        if (o instanceof Long) return ((Long) o).intValue();
        if (o instanceof Double) return ((Double) o).intValue();
        if (o instanceof Float) return ((Float) o).intValue();
        if (o instanceof BigDecimal) return ((BigDecimal) o).intValue();
        if (o instanceof String) return Integer.parseInt((String) o);
        return Integer.parseInt(String.valueOf(o));
    }

    private static double toDouble(Object o) {
        if (o instanceof Double) return (Double) o;
        if (o instanceof Float) return ((Float) o).doubleValue();
        if (o instanceof Long) return ((Long) o).doubleValue();
        if (o instanceof Integer) return ((Integer) o).doubleValue();
        if (o instanceof BigDecimal) return ((BigDecimal) o).doubleValue();
        if (o instanceof String) return Double.parseDouble((String) o);
        return Double.parseDouble(String.valueOf(o));
    }

    private static float toFloat(Object o) {
        if (o instanceof Float) return (Float) o;
        if (o instanceof Double) return ((Double) o).floatValue();
        if (o instanceof Long) return ((Long) o).floatValue();
        if (o instanceof Integer) return ((Integer) o).floatValue();
        if (o instanceof BigDecimal) return ((BigDecimal) o).floatValue();
        if (o instanceof String) return Float.parseFloat((String) o);
        return Float.parseFloat(String.valueOf(o));
    }

    public static String replace(Object baseString, Object search, Object replacement) {
        if (baseString == null) {
            return null;
        }
        String s     = String.valueOf(baseString);
        String find  = (search == null) ? "" : String.valueOf(search);
        String repl  = (replacement == null) ? "" : String.valueOf(replacement);
        return s.replaceFirst(find, repl); // literal (non-regex) replacement
    }

    public static String replaceAll(Object baseString, Object search, Object replacement) {
        if (baseString == null) {
            return null;
        }
        String s     = String.valueOf(baseString);
        String find  = (search == null) ? "" : String.valueOf(search);
        if (find.isEmpty()) {
            // Avoid weird behavior of replacing "" (would insert between every char)
            return s;
        }
        String repl  = (replacement == null) ? "" : String.valueOf(replacement);
        return s.replace(find, repl); // literal (non-regex) replacement
    }

    public static Object getArg(Object[] v, int index, Object def) {
        if (v.length <= index) {
            return def;
        }
        return v[index];
    }


    @SuppressWarnings("unchecked")
    public static void addElementToObject(Object target, Object... args) {
        if (target instanceof Map<?, ?> map) {
            if (args.length != 2)
                throw new IllegalArgumentException("Map requires (key, value)");
            ((Map<Object, Object>) map).put(args[0], args[1]);
            return;
        }

        if (target instanceof List<?> list) {
            List<Object> l = (List<Object>) list;
            if (args.length == 1) {
                l.add(args[0]); // append
                return;
            }
            if (args.length == 2 && args[0] instanceof Integer idx) {
                int i = idx;
                if (i < 0 || i > l.size()) {
                    throw new IndexOutOfBoundsException("Index " + i + " out of bounds [0," + l.size() + "]");
                }
                l.add(i, args[1]);
                return;
            }
            throw new IllegalArgumentException(
                "List requires (value) to append or (index(Integer), value) to insert");
        }

        throw new IllegalArgumentException("Target is neither Map nor List: " + typeName(target));
    }

    private static String typeName(Object o) {
        return (o == null) ? "null" : o.getClass().getName();
    }

    public static Object opNeg(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Byte) {
            byte v = (Byte) value;
            return (byte) -v;
        }
        if (value instanceof Short v) {
            return (short) -v;
        }
        if (value instanceof Integer v) {
            return -v;
        }
        if (value instanceof Long v) {
            return -v;
        }
        if (value instanceof Float v) {
            return -v;
        }
        if (value instanceof Double v) {
            return -v;
        }

        return null;
    }

    public static void throwDynamicException(Object exception, Object message) {
    if (exception == null) {
        throw new RuntimeException(String.valueOf(message));
    }
    if (!(exception instanceof Class<?>)) {
        throw new IllegalArgumentException("exception must be a Class");
    }
    Class<?> exClass = (Class<?>) exception;
    String msg = String.valueOf(message);
    try {
        Throwable toThrow;
        try {
            var ctorWithMsg = exClass.getDeclaredConstructor(String.class);
            ctorWithMsg.setAccessible(true);
            Object exObj = ctorWithMsg.newInstance(msg);
            if (exObj instanceof Throwable) {
                toThrow = (Throwable) exObj;
            } else {
                toThrow = new RuntimeException("Not a Throwable: " + exClass.getName() + " :: " + msg);
            }
        } catch (NoSuchMethodException innerNoStringCtor) {
            var defaultCtor = exClass.getDeclaredConstructor();
            defaultCtor.setAccessible(true);
            Object exObj = defaultCtor.newInstance();
            if (exObj instanceof Throwable) {
                toThrow = (Throwable) exObj;
            } else {
                toThrow = new RuntimeException("Not a Throwable: " + exClass.getName() + " :: " + msg);
            }
        }
        throw toThrow;
    } catch (Throwable reflectError) {
        throw new RuntimeException("Failed to throw dynamic exception: " + exClass.getName() + " :: " + msg, reflectError);
    }
}

    public static String padEnd(Object input, Object length2, Object padStr) {
        int length = toInt(length2);
        String str = toString(input);
        String pad = toString(padStr);

        if (pad.isEmpty()) {
            throw new IllegalArgumentException("padStr must not be empty");
        }

        while (str.length() < length) {
            str += pad;
        }

        return str.substring(0, length);
    }

    public static String padStart(Object input, Object length2, Object padStr) {
        int length = toInt(length2);
        String str = toString(input);
        String pad = toString(padStr);

        if (pad.isEmpty()) {
            throw new IllegalArgumentException("padStr must not be empty");
        }

        while (str.length() < length) {
            str = pad + str;
        }

        return str.substring(str.length() - length);
    }

    public static String json(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize JSON", e);
        }
    }

    public static Object mathAbs(Object val) {
        if (val == null) {
            return null;
        }

        if (val instanceof Integer) {
            return Math.abs((Integer) val);
        }

        if (val instanceof Long) {
            return Math.abs((Long) val);
        }

        if (val instanceof Float) {
            return Math.abs((Float) val);
        }

        if (val instanceof Double) {
            return Math.abs((Double) val);
        }

        if (val instanceof BigDecimal) {
            return ((BigDecimal) val).abs();
        }

        // if (val instanceof BigInteger) {
        //     return ((BigInteger) val).abs();
        // }

        if (val instanceof Number) {
            return Math.abs(((Number) val).doubleValue());
        }

        return null;
    }
}
