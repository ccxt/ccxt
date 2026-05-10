package io.github.ccxt.base;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@SuppressWarnings("unchecked")
public final class Functions {

    private static final SecureRandom RANDOM = new SecureRandom();

    private Functions() {}

    // --- JSON mapper (Jackson) ---
    private static final ObjectMapper MAPPER = new ObjectMapper();

    // -------------------------------------------------
    // HTTP method helper
    // -------------------------------------------------
    public static boolean isHttpMethod(String method) {
        if (method == null) return false;
        switch (method) {
            case "get":
            case "post":
            case "delete":
            case "put":
            case "patch":
                return true;
            default:
                return false;
        }
    }

    // -------------------------------------------------
    // keysort
    // -------------------------------------------------
    public static Map<String, Object> keysort(Object parameters2) {
        Map<String, Object> parameters = (Map<String, Object>) parameters2;
        List<String> keys = new ArrayList<>(parameters.keySet());
        Collections.sort(keys);
        Map<String, Object> out = new LinkedHashMap<>();
        for (String k : keys) {
            out.put(k, parameters.get(k));
        }
        return out;
    }

    // -------------------------------------------------
    // sort
    // -------------------------------------------------
    public static List<String> sort(Object inputListObj) {
        List<String> sorted = new ArrayList<>();

        if (inputListObj instanceof List<?>) {
            List<?> list = (List<?>) inputListObj;
            for (Object item : list) {
                if (item instanceof String s) sorted.add(s);
            }
        } else {
            // unsupported type -> empty list
            return sorted;
        }

        Collections.sort(sorted);
        return sorted;
    }

    // -------------------------------------------------
    // omit overloads
    // -------------------------------------------------
    public static Object omit(Object a, Object... parameters) {
        if (a == null) return null;
        List<Object> keys = new ArrayList<>();
        Collections.addAll(keys, parameters);
        return omit(a, (Object) keys);
    }

    public static Object omit(Object aa, Object k) {
        if (aa == null || k == null) return null;
        if (aa instanceof List<?>) {
            // return as-is (same as C#)
            return aa;
        }

        List<String> keys;
        if (k instanceof String) {
            keys = new ArrayList<>();
            keys.add((String) k);
        } else {
            List<Object> myList = (List<Object>) k;
            keys = new ArrayList<>(myList.size());
            for (Object it : myList) keys.add(String.valueOf(it));
        }

        Map<String, Object> a = (Map<String, Object>) aa;
        Map<String, Object> out = new LinkedHashMap<>();
        for (String key : a.keySet()) {
            if (!keys.contains(key)) {
                out.put(key, a.get(key));
            }
        }
        return out;
    }

    public static Map<String, Object> omitN(Object aa, List<Object> keys) {
        Map<String, Object> a = (Map<String, Object>) aa;
        Set<String> skip = new HashSet<>();
        for (Object o : keys) skip.add(String.valueOf(o));
        Map<String, Object> out = new LinkedHashMap<>();
        for (String key : a.keySet()) {
            if (!skip.contains(key)) out.put(key, a.get(key));
        }
        return out;
    }

    public static Object omit(Map<String, Object> a, String key) {
        List<Object> keys = new ArrayList<>();
        keys.add(key);
        return omit(a, (Object) keys);
    }

    // -------------------------------------------------
    // toArray
    // -------------------------------------------------
    public static List<Object> toArray(Object a) {
        if (a == null) return null;

        if (a instanceof List<?>) {
            return (List<Object>) a;
        }

        // treat as map -> return values as list (preserve insertion order if possible)
        Map<String, Object> b = (Map<String, Object>) a;
        List<Object> out = new ArrayList<>(b.size());
        for (String key : b.keySet()) {
            out.add(b.get(key));
        }
        return out;
    }

    // -------------------------------------------------
    // arrayConcat
    // -------------------------------------------------
    public static Object arrayConcat(Object aa, Object bb) {
        if (aa instanceof List<?> && bb instanceof List<?>) {
            List<?> a = (List<?>) aa;
            List<?> b = (List<?>) bb;

            // branch 1: List<Object>
            if (!a.isEmpty() && (a.get(0) instanceof Object) && !(a.get(0) instanceof CompletableFuture)) {
                List<Object> out = new ArrayList<>();
                for (Object e : a) out.add(e);
                for (Object e : b) out.add(e);
                return out;
            }

            // branch 2: List<CompletableFuture<Object>> equivalent to C# List<Task<object>>
            if (!a.isEmpty() && a.get(0) instanceof CompletableFuture) {
                List<CompletableFuture<Object>> out = new ArrayList<>();
                for (Object e : a) out.add((CompletableFuture<Object>) e);
                for (Object e : b) out.add((CompletableFuture<Object>) e);
                return out;
            }

            // empty lists: default to List<Object>
            if (a.isEmpty() && b.isEmpty()) {
                return new ArrayList<Object>();
            }
            if (a.isEmpty()) {
                return new ArrayList<Object>((Collection<?>) b);
            }
            if (b.isEmpty()) {
                return new ArrayList<Object>((Collection<?>) a);
            }
        }
        return null;
    }

    // -------------------------------------------------
    // aggregate
    // -------------------------------------------------
    public static List<Object> aggregate(Object bidasks) {
        Map<Double, Double> result = new LinkedHashMap<>();

        if (bidasks instanceof List<?> list) {
            for (Object entry : list) {
                if (entry instanceof List<?> pair && pair.size() >= 2) {
                    double price = toDouble(pair.get(0));
                    double volume = toDouble(pair.get(1));
                    if (volume > 0) {
                        result.putIfAbsent(price, 0d);
                        result.put(price, result.get(price) + volume);
                    }
                }
            }
        }

        List<Object> out = new ArrayList<>();
        for (Map.Entry<Double, Double> kv : result.entrySet()) {
            List<Object> item = new ArrayList<>(2);
            item.add(kv.getKey());
            item.add(kv.getValue());
            out.add(item);
        }
        return out;
    }

    private static double toDouble(Object o) {
        if (o == null) return 0.0;
        if (o instanceof Number n) return n.doubleValue();
        return Double.parseDouble(String.valueOf(o));
    }

    // -------------------------------------------------
    // uuidv1 (stub, like C#)
    // -------------------------------------------------
    public static String uuidv1() {
        return java.util.UUID.randomUUID().toString(); // stub
    }

    public static String uuid16() {
        long value = RANDOM.nextLong();           // 64-bit random
        return String.format("%016x", value);      // 16 hex chars
    }

    // -------------------------------------------------
    // extractParams
    // -------------------------------------------------
    private static final Pattern EXTRACT_PARAMS = Pattern.compile("\\{([^}]+)\\}");

    public static List<Object> extractParams(Object str) {
        String s = (String) str;
        Matcher m = EXTRACT_PARAMS.matcher(s);
        List<Object> out = new ArrayList<>();
        while (m.find()) {
            out.add(m.group(1));
        }
        return out;
    }

    // -------------------------------------------------
    // isJsonEncodedObject
    // -------------------------------------------------
    public static boolean isJsonEncodedObject(Object str) {
        if (!(str instanceof String s)) return false;
        return s.startsWith("{") || s.startsWith("[");
    }

    // -------------------------------------------------
    // json / Json
    // -------------------------------------------------
    public static String json(Object obj) {
        // In C# there was a special case for ccxt.pro.IOrderBook; we don't have that type here.
        // Keep the exception-shaping behavior from Json().
        return Json(obj);
    }

    public static String Json(Object obj) {
        if (obj == null) return null;

        // If it's an exception, return {"name":"ExceptionType"} like the C# version
        if (obj instanceof Throwable t) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("name", t.getClass().getSimpleName());
            try {
                return MAPPER.writeValueAsString(error);
            } catch (JsonProcessingException e) {
                // fallback
                return "{\"name\":\"" + error.get("name") + "\"}";
            }
        }

        try {
            return MAPPER.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    // -------------------------------------------------
    // ordered (stub)
    // -------------------------------------------------
    public static Object ordered(Object ob) {
        return ob; // stub
    }
}