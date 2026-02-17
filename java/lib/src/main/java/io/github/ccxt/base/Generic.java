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
        return Double.parseDouble(String.valueOf(o));
    }

    // ---------- sortBy ----------

    public static List<Object> sortBy(Object array, Object value1, Object desc2, Object defaultValue2) {
        boolean desc = (desc2 instanceof Boolean b) ? b : false;
        Object defaultValue = (defaultValue2 != null) ? defaultValue2 : "";
        List<Object> lst = (List<Object>) array;

        List<Object> sorted;
        if (value1 instanceof String key) {
            sorted = new ArrayList<>(lst);
            sorted.sort(Comparator.comparing(
                x -> {
                    Object v = ((Map<String, Object>) x).get(key);
                    return v == null ? null : v.toString();
                },
                Comparator.nullsFirst(Comparator.naturalOrder())
            ));
        } else {
            int index = ((Number) value1).intValue();
            sorted = new ArrayList<>(lst);
            sorted.sort(Comparator.comparing(
                x -> {
                    if (x instanceof List<?> li) {
                        Object v = (index >= 0 && index < li.size()) ? li.get(index) : null;
                        return (v == null) ? defaultValue.toString() : v.toString();
                    }
                    return defaultValue.toString();
                },
                Comparator.nullsFirst(Comparator.naturalOrder())
            ));
        }
        if (desc) Collections.reverse(sorted);
        return sorted;
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
        for (String k : a.keySet()) out.put(k, a.get(k));
        if (bb != null) {
            Map<String, Object> b = (Map<String, Object>) bb;
            for (String k : b.keySet()) out.put(k, b.get(k));
        }
        return out;
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

            if (x instanceof Map<?, ?> mx) {
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