package io.github.ccxt;

import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.ccxt.base.JsonHelper;

@SuppressWarnings({"unchecked", "rawtypes"})
public class Helpers {

    private static final ObjectMapper mapper = JsonHelper.mapper();

    // spawn tasks: the arguments are passed by value, so the call site captures no local
    public interface Task1<A> { void run(A a) throws Exception; }
    public interface Task2<A, B> { void run(A a, B b) throws Exception; }
    public interface Task3<A, B, C> { void run(A a, B b, C c) throws Exception; }
    public interface Task4<A, B, C, D> { void run(A a, B b, C c, D d) throws Exception; }
    public interface Task5<A, B, C, D, E> { void run(A a, B b, C c, D d, E e) throws Exception; }
    public interface Task6<A, B, C, D, E, F> { void run(A a, B b, C c, D d, E e, F f) throws Exception; }

    private interface Body { void run() throws Exception; }

    private static Runnable unchecked(Body body) {
        return () -> {
            try {
                body.run();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        };
    }

    public static <A> Runnable task(Task1<A> f, A a) { return unchecked(() -> f.run(a)); }
    public static <A, B> Runnable task(Task2<A, B> f, A a, B b) { return unchecked(() -> f.run(a, b)); }
    public static <A, B, C> Runnable task(Task3<A, B, C> f, A a, B b, C c) { return unchecked(() -> f.run(a, b, c)); }
    public static <A, B, C, D> Runnable task(Task4<A, B, C, D> f, A a, B b, C c, D d) { return unchecked(() -> f.run(a, b, c, d)); }
    public static <A, B, C, D, E> Runnable task(Task5<A, B, C, D, E> f, A a, B b, C c, D d, E e) { return unchecked(() -> f.run(a, b, c, d, e)); }
    public static <A, B, C, D, E, F> Runnable task(Task6<A, B, C, D, E, F> f, A a, B b, C c, D d, E e, F g) { return unchecked(() -> f.run(a, b, c, d, e, g)); }

    /**
     * Block on a CompletableFuture and rethrow any wrapped ccxt error directly.
     *
     * <p>{@code CompletableFuture.join()} always wraps thrown exceptions in
     * {@link CompletionException}, which forces callers to catch the wrapper
     * and unwrap via {@code .getCause()} to discover what actually went wrong.
     * For ccxt's typed sync API we want idiomatic Java exception handling:
     *
     * <pre>{@code
     * try {
     *     Order order = binance.createOrder("BTC/USDT", "limit", "buy", 0.001, 50000.0);
     * } catch (InsufficientFunds e)     { ... }
     * catch (AuthenticationError e)     { ... }
     * catch (RateLimitExceeded e)       { ... }
     * catch (NetworkError e)            { ... }
     * catch (ExchangeError e)           { ... }
     * }</pre>
     *
     * <p>This helper unwraps the {@link CompletionException} once and rethrows
     * the underlying cause. If a transpile-generated {@code spawn()} lambda
     * wrapped the original ccxt error in a plain {@link RuntimeException} as
     * a checked-exception bridge, this peels that bridge too so the user sees
     * the original typed exception (preserving class, message, stack trace,
     * and any subclass-specific fields).
     */
    public static <T> T joinUnwrapped(CompletableFuture<T> future) {
        try {
            return future.join();
        } catch (CompletionException ce) {
            Throwable t = ce.getCause();
            // peel a transpile-bridge `new RuntimeException(_e)` wrapper that
            // some spawn() lambdas use to bridge checked exceptions — only
            // when it's the *raw* RuntimeException class (not a subclass).
            while (t != null
                    && t.getClass() == RuntimeException.class
                    && t.getCause() instanceof io.github.ccxt.errors.BaseError) {
                t = t.getCause();
            }
            if (t instanceof RuntimeException re) throw re;
            if (t instanceof Error err) throw err;
            throw ce;
        }
    }

    /**
     * Unwrap a {@link CompletionException} (and any transpile-bridge
     * {@link RuntimeException} wrappers) to expose the underlying ccxt error.
     *
     * <p>Intended for async pipelines where the user receives a {@link Throwable}
     * inside {@code .exceptionally(...)} or {@code .handle(...)} callbacks:
     *
     * <pre>{@code
     * binance.createOrderAsync("BTC/USDT", "limit", "buy", 0.001, 50000.0)
     *     .thenAccept(order -> log.info("Placed: {}", order.id()))
     *     .exceptionally(throwable -> {
     *         Throwable cause = Helpers.unwrap(throwable);
     *         return switch (cause) {
     *             case InsufficientFunds    e -> { notifyUser(e); yield null; }
     *             case AuthenticationError  e -> { refreshCredentials(); yield null; }
     *             case RateLimitExceeded    e -> { scheduleRetry(); yield null; }
     *             case NetworkError         e -> { scheduleRetry(); yield null; }
     *             case BaseError            e -> { log.error("ccxt error", e); yield null; }
     *             default -> throw new java.util.concurrent.CompletionException(cause);
     *         };
     *     });
     * }</pre>
     */
    public static Throwable unwrap(Throwable t) {
        while (t instanceof CompletionException && t.getCause() != null) {
            t = t.getCause();
        }
        // peel transpile-bridge RuntimeException wrappers
        while (t != null
                && t.getClass() == RuntimeException.class
                && t.getCause() instanceof io.github.ccxt.errors.BaseError) {
            t = t.getCause();
        }
        return t;
    }

    // In Java, wire up your preferred JSON lib and return Map/List accordingly.
    public static Object parseJson(Object json) {
        // placeholder: return the string itself (or plug in Jackson/Gson here)
        return  JsonHelper.deserialize((String) json);
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

    public static boolean isEqual(Object a, Object b) {
        try {
            if (a == null && b == null) return true;
            if (a == null || b == null) return false;

            // If types differ and neither is numeric, they're not equal
            if (!a.getClass().equals(b.getClass()) && !(isNumber(a) && isNumber(b))) {
                return false;
            }

            if (isInteger(a) && isInteger(b)) {
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

    public static Object GetValue(Object value2, Object key) {
        if (value2 == null || key == null) return null;

        // Strings: index access
        if (value2 instanceof String) {
            String str = (String) value2;
            // check if key is int
            if (!(key instanceof Long) && !(key instanceof Integer) && !(key instanceof Double)) {
                return null;
            }
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

    public static Object callDynamically(Object obj, Object methodName, Object[] args) {
    if (args == null) args = new Object[]{};

    String name = (String) methodName;
    Method m = findMethod(obj.getClass(), name, args.length);

    try {
        m.setAccessible(true);

        Object[] invokeArgs = m.isVarArgs() ? adaptForVarArgs(m, args) : padArgs(m, args);
        coerceArgs(m, invokeArgs);

        return m.invoke(obj, invokeArgs);

    } catch (Exception e) {
        throw new RuntimeException(e);
    }
}

// omitted trailing arguments of a fixed-arity method: null (TS `undefined`), except a
// params bag, which takes the TS default `{}`
private static Object[] padArgs(Method m, Object[] args) {
    int n = m.getParameterCount();
    if (args.length == n) return args;
    Object[] out = java.util.Arrays.copyOf(args, n);
    Class<?>[] ptypes = m.getParameterTypes();
    for (int i = args.length; i < n; i++) {
        if (ptypes[i] == Map.class) out[i] = new HashMap<String, Object>();
    }
    return out;
}

/**
 * Coerce arguments to match the method's parameter types.
 * Handles common numeric type mismatches from JSON parsing
 * (e.g., Integer→Long, Integer→Double, Long→Double).
 */
private static void coerceArgs(Method m, Object[] args) {
    Class<?>[] ptypes = m.getParameterTypes();
    int count = Math.min(args.length, ptypes.length);
    for (int i = 0; i < count; i++) {
        if (args[i] == null) continue;
        Class<?> expected = ptypes[i];
        if (expected == Object.class || expected == Object[].class) continue;
        if (expected.isInstance(args[i])) continue;

        // Numeric coercion
        if (args[i] instanceof Number n) {
            if (expected == Long.class || expected == long.class) {
                args[i] = n.longValue();
            } else if (expected == Double.class || expected == double.class) {
                args[i] = n.doubleValue();
            } else if (expected == Integer.class || expected == int.class) {
                args[i] = n.intValue();
            } else if (expected == Float.class || expected == float.class) {
                args[i] = n.floatValue();
            }
        }
        // String coercion for numeric strings
        else if (args[i] instanceof String s && (expected == Long.class || expected == Double.class)) {
            try {
                if (expected == Long.class) args[i] = Long.parseLong(s);
                else args[i] = Double.parseDouble(s);
            } catch (NumberFormatException ignored) {}
        }
        // a String slot takes the value's string form (same as toStringArg)
        if (expected == String.class && !(args[i] instanceof String)) {
            args[i] = args[i] == null ? null : String.valueOf(args[i]);
        }
        // a symbol list given as an array
        else if (expected == List.class && args[i] instanceof Object[] arr) {
            args[i] = new ArrayList<>(java.util.Arrays.asList(arr));
        }
    }
}

private static Object[] adaptForVarArgs(Method m, Object[] args) {
    if (!m.isVarArgs()) return args;

    Class<?>[] ptypes = m.getParameterTypes();
    int fixedCount = ptypes.length - 1;              // last is the vararg array param
    Class<?> varArrayType = ptypes[ptypes.length - 1]; // e.g. Object[]
    Class<?> componentType = varArrayType.getComponentType();

    // Build the final invocation array with exactly ptypes.length slots
    Object[] invokeArgs = new Object[ptypes.length];

    // Copy fixed arguments (or null if missing)
    for (int i = 0; i < fixedCount; i++) {
        invokeArgs[i] = (i < args.length) ? args[i] : null;
    }

    // If caller already provided an array for the varargs slot AND argument count matches,
    // keep it as-is (common case: args already has Object[]{..., new Object[]{price}})
    if (args.length == ptypes.length && args[fixedCount] != null && args[fixedCount].getClass().isArray()) {
        // (Optionally) you could also check assignability to varArrayType here.
        invokeArgs[fixedCount] = args[fixedCount];
        return invokeArgs;
    }

    // Otherwise, pack remaining args into the varargs array
    int varCount = Math.max(0, args.length - fixedCount);
    Object varArray = Array.newInstance(componentType, varCount);
    for (int j = 0; j < varCount; j++) {
        Array.set(varArray, j, args[fixedCount + j]);
    }

    invokeArgs[fixedCount] = varArray;
    return invokeArgs;
}

    // --------- helpers ---------

    // Every generated method has ONE signature: resolve by name, child class first. Among
    // same-named methods (hand-written helpers, typed override bridges, surface defaults)
    // prefer the fewest parameters that still take every argument, trailing ones padded.
    private static Method findMethod(Class<?> cls, String name, int argCount) {
        Method best = null;
        for (Class<?> cur = cls; cur != null && best == null; cur = cur.getSuperclass()) {
            for (Method m : cur.getDeclaredMethods()) {
                if (!m.getName().equals(name) || m.isBridge() || m.isSynthetic()) continue;
                int n = m.getParameterCount();
                boolean fits = m.isVarArgs() ? argCount >= n - 1 : n >= argCount;
                if (!fits) continue;
                if (best == null || n < best.getParameterCount()
                        || (n == best.getParameterCount() && isLooser(m, best))) {
                    best = m;
                }
            }
        }
        if (best != null) return best;
        // interface default methods and public inherited members
        for (Method m : cls.getMethods()) {
            if (m.getName().equals(name) && (m.isVarArgs() || m.getParameterCount() >= argCount)) return m;
        }
        throw new RuntimeException("Method not found: " + name + " with " + argCount + " args on " + cls.getName());
    }

    // of two same-arity overloads (a typed core and its override bridge), the one declaring
    // more Object slots accepts every argument the other does
    private static boolean isLooser(Method a, Method b) {
        int objectsA = 0, objectsB = 0;
        for (Class<?> t : a.getParameterTypes()) if (t == Object.class) objectsA++;
        for (Class<?> t : b.getParameterTypes()) if (t == Object.class) objectsB++;
        return objectsA > objectsB;
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
        if (o instanceof String) {
            try { return Double.parseDouble((String) o); } catch (NumberFormatException ex) { return 0.0; }
        }
        // Mirror TS's silent-NaN-or-default semantics: returning 0.0 instead of
        // throwing keeps a single misuse (e.g. passing a Map to `sum`) from
        // killing the whole WS connection. See Generic.toDouble for the same
        // rationale and test coverage.
        try { return Double.parseDouble(String.valueOf(o)); } catch (NumberFormatException ex) { return 0.0; }
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

    @SuppressWarnings("unchecked")
    public static void addElementToObject(Object target, Object... args) {
        if (target instanceof Map<?, ?> map) {
            if (args.length != 2)
                throw new IllegalArgumentException("Map requires (key, value)");
            Map<Object, Object> m = (Map<Object, Object>) map;
            // JS keeps an explicit null entry; a null-free store spells the same write as a removal
            if (args[1] != null || args[0] == null) {
                m.put(args[0], args[1]);
            } else {
                try {
                    m.put(args[0], null);
                } catch (NullPointerException nullFree) {
                    m.remove(args[0]);
                }
            }
            return;
        }

        if (target instanceof List<?> list) {
            List<Object> l = (List<Object>) list;
            if (args.length == 1) {
                l.add(args[0]); // append
                return;
            }
            if (args.length == 2 && isInteger(args[0])) {
                int i = toInt(args[0]);
                if (i < 0 || i > l.size()) {
                    throw new IndexOutOfBoundsException("Index " + i + " out of bounds [0," + l.size() + "]");
                }
//                l.add(i, args[1]);
                if (i == l.size()) {
                    l.add(args[1]);          // append
                } else {
                    l.set(i, args[1]);       // overwrite existing
                }
                return;
            }
            throw new IllegalArgumentException(
                "List requires (value) to append or (index(Integer), value) to insert");
        }

        // Fallback: set a field via reflection on a plain object. The target is owned by the
        // calling thread (every Map, including WsOrderBook, takes the branch above), so the
        // write needs no monitor to be visible to that thread's later reads.
        if (args.length == 2 && args[0] instanceof String fieldName) {
            try {
                java.lang.reflect.Field field = target.getClass().getField(fieldName);
                field.setAccessible(true);
                field.set(target, args[1]);
                return;
            } catch (NoSuchFieldException e) {
                try {
                    String setter = "set" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
                    java.lang.reflect.Method method = target.getClass().getMethod(setter, Object.class);
                    method.invoke(target, args[1]);
                    return;
                } catch (Exception e2) { /* fall through */ }
            } catch (Exception e) { /* fall through */ }
        }
        throw new IllegalArgumentException("Target is neither Map nor List: " + typeName(target));
    }

    private static String typeName(Object o) {
        return (o == null) ? "null" : o.getClass().getName();
    }

    public static boolean isInstance(Object value, Object type) {
        if (!(type instanceof Class<?> clazz)) {
            return false;
        }

        Object target = unwrapIfThrowable(value);
        return clazz.isInstance(target);
    }

    private static Object unwrapIfThrowable(Object value) {
        if (!(value instanceof Throwable t)) {
            return value; // normal object, no unwrap
        }

        // unwrap async wrappers
        while (t instanceof CompletionException || t instanceof ExecutionException) {
            if (t.getCause() == null) {
                break;
            }
            t = t.getCause();
        }
        return t;
    }
}
