package io.github.ccxt.base;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;


public class Generic {

    // ---------- helpers ----------
    public static boolean isWhole(double d) {
        return !Double.isNaN(d) && !Double.isInfinite(d) && Math.floor(d) == d;
    }

    public static double toDouble(Object o) {
        if (o == null) return 0.0;
        if (o instanceof Number n) return n.doubleValue();
        // JS coerces booleans to 0/1 in arithmetic (e.g. `true + 1 == 2`).
        // bitget.createOrderRequest does `this.sum(isTriggerOrder, isStopLoss…) > 1`
        // with boolean inputs; Java's strict typing means we have to handle the
        // bool→double coercion ourselves here, otherwise String.valueOf(false)
        // → "false" → Double.parseDouble throws NumberFormatException.
        if (o instanceof Boolean b) return b ? 1.0 : 0.0;
        // TS's `sum` and similar arithmetics filter non-numbers via isNumber
        // and silently return undefined/NaN — they don't throw on a Map or
        // List or arbitrary object. Java's strict parseDouble does. Mirror
        // the TS semantics by returning 0.0 (matches TS's `Number(NaN) || 0`
        // pattern) when the input isn't parseable as a number. Without this,
        // a single misuse of `sum` in transpiled code (e.g. bitmex passing
        // the whole counter map instead of a single counter) tears down the
        // entire WS connection on the first bad frame.
        try {
            return Double.parseDouble(String.valueOf(o));
        } catch (NumberFormatException ex) {
            return 0.0;
        }
    }

    // ---------- sortBy ----------

    public static List<Object> sortBy(Object array, Object value1, Object desc2, Object defaultValue2) {
        boolean desc = (desc2 instanceof Boolean b) ? b : false;
        Object defaultValue = (defaultValue2 != null) ? defaultValue2 : "";
        List<Object> lst = (List<Object>) array;

        List<Object> sorted;
        if (value1 instanceof String key) {
            sorted = new ArrayList<>(lst);
            sorted.sort((a, b1) -> compareJsLike(
                ((Map<String, Object>) a).get(key),
                ((Map<String, Object>) b1).get(key),
                defaultValue));
        } else {
            int index = ((Number) value1).intValue();
            sorted = new ArrayList<>(lst);
            sorted.sort((a, b1) -> {
                Object va = (a instanceof List<?> la && index >= 0 && index < la.size()) ? la.get(index) : null;
                Object vb = (b1 instanceof List<?> lb && index >= 0 && index < lb.size()) ? lb.get(index) : null;
                return compareJsLike(va, vb, defaultValue);
            });
        }
        if (desc) Collections.reverse(sorted);
        return sorted;
    }

    /**
     * JS-like comparison for sortBy. Mirrors TS `<`/`>` semantics:
     *  - both numeric (Number, or Strings that parse as numbers): numeric compare
     *  - both non-numeric strings: lexicographic
     *  - mixed: fall back to lex compare on toString() (matches JS coercion rules
     *    closely enough for ccxt's sort use-cases)
     *  - null/empty: handled via nullsFirst-equivalent (null < any value)
     *
     * Plain String#compareTo (as previously used here via naturalOrder()) was
     * sorting numeric strings lexicographically, breaking parseOrderBook (bids
     * ["53.0", "78301.0"] came out misordered because '3' > '2' at index 1).
     * Returning a single-typed Comparable from a Comparator.comparing() helper
     * was crashing with `ClassCastException String→Double` once setMarkets's
     * currency-merge path started feeding mixed-type values into the same sort.
     */
    private static int compareJsLike(Object a, Object b, Object defaultValue) {
        if (a == null) a = defaultValue;
        if (b == null) b = defaultValue;
        boolean aEmpty = (a == null) || "".equals(a);
        boolean bEmpty = (b == null) || "".equals(b);
        if (aEmpty && bEmpty) return 0;
        if (aEmpty) return -1;
        if (bEmpty) return 1;
        Double da = toDoubleOrNull(a);
        Double db = toDoubleOrNull(b);
        if (da != null && db != null) return Double.compare(da, db);
        return String.valueOf(a).compareTo(String.valueOf(b));
    }

    private static Double toDoubleOrNull(Object o) {
        if (o instanceof Number n) return n.doubleValue();
        try {
            return Double.parseDouble(String.valueOf(o));
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    public static List<Object> sortBy2(Object array, Object key1, Object key2, Object desc2) {
        boolean desc = (desc2 instanceof Boolean b) ? b : false;
        List<Object> lst = (List<Object>) array;

        if (key1 instanceof String k1 && key2 instanceof String k2) {
            List<Object> sorted = new ArrayList<>(lst);
            sorted.sort(Comparator
                .comparing((Object s) -> {
                    Object v = ((Map<String, Object>) s).get(k1);
                    return v == null ? null : v.toString();
                }, Comparator.nullsFirst(Comparator.naturalOrder()))
                .thenComparing((Object s) -> {
                    Object v = ((Map<String, Object>) s).get(k2);
                    return v == null ? null : v.toString();
                }, Comparator.nullsFirst(Comparator.naturalOrder()))
            );
            if (desc) Collections.reverse(sorted);
            return sorted;
        }
        return null;
    }

    // ---------- filterBy ----------

    public static List<Object> filterBy(Object aa, Object key, Object value) {
        List<Object> targetA;
        if (aa instanceof List) {
            targetA = (List<Object>) aa;
        } else {
            targetA = new ArrayList<>(((Map<String, Object>) aa).values());
        }
        List<Object> out = new ArrayList<>();
        for (Object elem : targetA) {
            Map<String, Object> m = (Map<String, Object>) elem;
            Object v = m.get((String) key);
            if (Objects.equals(v == null ? null : v.toString(),
                               value == null ? null : value.toString())) {
                out.add(elem);
            }
        }
        return out;
    }

    // ---------- extend / Extend (shallow merge) ----------

    public static Map<String, Object> extend(Object aa, Object bb) {
        return Extend(aa, bb);
    }

    public static Map<String, Object> Extend(Object aa, Object bb) {
        Map<String, Object> a = (Map<String, Object>) aa;
        Map<String, Object> out = new LinkedHashMap<>();
        // Snapshot the source maps before iterating: callers commonly pass
        // shared state like Exchange.options (Collections.synchronizedMap-wrapped)
        // that another thread may be writing concurrently. Iterating directly
        // would throw ConcurrentModificationException; the snapshot is cheap
        // and decouples us from the caller's locking discipline.
        // a may be null/undefined in transpiled code (extend(this.safeDict(...), x)) —
        // JS Object.assign tolerates that, so must we
        if (a != null) {
            for (Map.Entry<String, Object> e : snapshotEntries(a)) {
                out.put(e.getKey(), e.getValue());
            }
        }
        if (bb != null) {
            Map<String, Object> b = (Map<String, Object>) bb;
            for (Map.Entry<String, Object> e : snapshotEntries(b)) {
                out.put(e.getKey(), e.getValue());
            }
        }
        return out;
    }

    private static List<Map.Entry<String, Object>> snapshotEntries(Map<String, Object> map) {
        // synchronized() is a no-op for an unwrapped HashMap and the correct
        // lock for a Collections.synchronizedMap. Either way the returned
        // ArrayList is detached from the source.
        synchronized (map) {
            return new ArrayList<>(map.entrySet());
        }
    }

    // ---------- deepExtend2 (older impl kept as-is) ----------

    public static Object deepExtend2(Object... objs) {
        Object out = new LinkedHashMap<String, Object>();
        for (Object obj : objs) {
            Object obj2 = (obj == null) ? new LinkedHashMap<String, Object>() : obj;
            if (obj2 instanceof Map<?, ?> map) {
                Map<String, Object> outMap = (Map<String, Object>) out;
                for (String key : ((Set<String>) map.keySet())) {
                    Object value = ((Map<String, Object>) map).get(key);
                    if (value instanceof Map<?, ?>) {
                        if (outMap.containsKey(key)) {
                            outMap.put(key, deepExtend2(outMap.get(key), value));
                        } else {
                            outMap.put(key, deepExtend2(value));
                        }
                    } else {
                        outMap.put(key, value);
                    }
                }
            } else {
                out = obj;
            }
        }
        return out;
    }

    // ---------- deepExtend (newer impl) ----------

    public static Map<String, Object> deepExtend(Object... objs) {
        Object outObj = null;
        for (Object x : objs) {
            if (x == null) continue;

            // TS treats every object as a plain dict; Java has typed wrappers
            // (WsOrderBook, Trade, Ticker, …) that aren't Maps. If the input
            // exposes a Map<String, Object> toMap() method, use it — otherwise
            // the final `(Map) outObj` cast crashes with ClassCastException
            // (e.g. bitmex watchOrderBook returns IndexedOrderBook).
            Map<?, ?> mx = null;
            if (x instanceof Map<?, ?> m) {
                mx = m;
            } else {
                Map<String, Object> coerced = tryToMap(x);
                if (coerced != null) {
                    mx = coerced;
                }
            }

            if (mx != null) {
                if (!(outObj instanceof Map)) outObj = new LinkedHashMap<String, Object>();
                Map<String, Object> out = (Map<String, Object>) outObj;
                Map<String, Object> dictX = (Map<String, Object>) mx;

                for (String k : dictX.keySet()) {
                    Object arg1 = out.containsKey(k) ? out.get(k) : null;
                    Object arg2 = dictX.get(k);
                    if (arg1 instanceof Map && arg2 instanceof Map) {
                        out.put(k, deepExtend(arg1, arg2));
                    } else {
//                        out.put(k, arg2 != null ? arg2 : arg1);
                        out.put(k, arg2);
                    }
                }
            } else {
                outObj = x;
            }
        }
        return (Map<String, Object>) outObj;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> tryToMap(Object x) {
        try {
            java.lang.reflect.Method m = x.getClass().getMethod("toMap");
            if (Map.class.isAssignableFrom(m.getReturnType())) {
                return (Map<String, Object>) m.invoke(x);
            }
        } catch (NoSuchMethodException ignored) {
            // Most types don't have toMap(); that's fine.
        } catch (Exception ignored) {
            // toMap() exists but threw — fall through to default handling.
        }
        return null;
    }

    // ---------- inArray ----------

    public static boolean inArray(Object elem, Object list2) {
        if (list2 == null) return false;

        if (list2 instanceof List<?> li) {
            if (!li.isEmpty() && li.get(0) instanceof String) {
                return ((List<String>) li).contains((String) elem);
            }
            if (!li.isEmpty() && li.get(0) instanceof Long) {
                Long v = (elem instanceof Number n) ? n.longValue()
                        : Long.parseLong(String.valueOf(elem));
                return ((List<Long>) li).contains(v);
            }
            List<Object> list = (List<Object>) li;
            if (elem instanceof Integer || elem instanceof Long) {
                long vL = (elem instanceof Number n) ? n.longValue()
                        : Long.parseLong(String.valueOf(elem));
                return list.contains(vL) || list.contains((int) vL);
            }
            return list.contains(elem);
        }
        return false;
    }

    // ---------- isArray ----------

    public static boolean isArray(Object a) {
        return (a instanceof List<?>);
    }

    // ---------- indexBy / indexBySafe ----------

    public static Map<String, Object> indexBySafe(Object a, Object key2) {
        return indexBy(a, key2);
    }

    public static Map<String, Object> indexBy(Object a, Object key2) {
        Map<String, Object> out = new LinkedHashMap<>();
        List<Object> targetX;

        if (a instanceof List<?>) {
            targetX = (List<Object>) a;
        } else {
            targetX = new ArrayList<>(((Map<String, Object>) a).values());
        }

        for (Object elem : targetX) {
            if (elem instanceof Map<?, ?>) {
                Map<String, Object> m = (Map<String, Object>) elem;
                Object val = m.get((String) key2);
                if (val == null) continue;
                out.put(val.toString(), m);
            } else if (elem instanceof List<?>) {
                int index = Integer.parseInt(String.valueOf(key2));
                List<?> l = (List<?>) elem;
                if (l.isEmpty()) continue;
                if (index < 0 || index >= l.size()) continue;
                Object val = l.get(index);
                if (val == null) continue;
                out.put(val.toString(), elem);
            }
        }
        return out;
    }

    // ---------- groupBy ----------

    public static Map<String, Object> groupBy(Object trades, Object key2) {
        String key = (String) key2;
        Map<String, Object> out = new LinkedHashMap<>();
        List<Object> list = (List<Object>) trades;

        for (Object elem : list) {
            Map<String, Object> m = (Map<String, Object>) elem;
            if (m.containsKey(key)) {
                String val = (String) m.get(key);
                if (val == null) continue;
                List<Object> bucket = (List<Object>) out.get(val);
                if (bucket == null) {
                    bucket = new ArrayList<>();
                    out.put(val, bucket);
                }
                bucket.add(elem);
            }
        }
        return out;
    }

    // ---------- omitZero ----------

    public static Object omitZero(Object value) {
        try {
            if (value instanceof Double d) {
                if (d == 0.0d) return null;
            }
            if (value instanceof Long l) {
                if (l == 0L) return null;
            }
            if (value instanceof String s) {
                double parsed = Double.parseDouble(s);
                if (parsed == 0.0d) return null;
            }
            if (value instanceof Integer i) {
                if (i == 0) return null;
            }
            return value;
        } catch (Exception e) {
            return value;
        }
    }

    // ---------- sum ----------

    public static Object sum(Object... args) {
        Object res = 0;
        for (Object arg : args) res = sum(res, arg);
        return res;
    }

    public static Object sum(Object a, Object b) {
        if (a == null) a = 0;
        if (b == null) b = 0;
        double s = toDouble(a) + toDouble(b);
        if (isWhole(s)) return (long) s;
        return s;
    }

}