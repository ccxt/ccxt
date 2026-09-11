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

    /**
     * Converts the raw `{ symbol: { timeframe: OHLCV[] } }` box returned by
     * watchOHLCVForSymbols() into the nested typed map the typed WS wrappers return.
     * Mirrors the C# port's Helper.ConvertToDictionaryOHLCVList. A null at any level
     * stays null (never defaulted), like every other conversion in this class.
     */
    public static Map<String, Map<String, List<OHLCV>>> toTypedOhlcvBySymbol(Object raw) {
        if (raw == null) return null;
        Map<String, Object> data = (Map<String, Object>) raw;
        Map<String, Map<String, List<OHLCV>>> result = new LinkedHashMap<>();
        for (Map.Entry<String, Object> symbolEntry : data.entrySet()) {
            Object byTimeframe = symbolEntry.getValue();
            if (byTimeframe == null) {
                result.put(symbolEntry.getKey(), null);
                continue;
            }
            Map<String, List<OHLCV>> converted = new LinkedHashMap<>();
            for (Map.Entry<String, Object> timeframeEntry : ((Map<String, Object>) byTimeframe).entrySet()) {
                Object rows = timeframeEntry.getValue();
                if (rows == null) {
                    converted.put(timeframeEntry.getKey(), null);
                    continue;
                }
                converted.put(timeframeEntry.getKey(), ((List<Object>) rows).stream().map(OHLCV::new).collect(java.util.stream.Collectors.toList()));
            }
            result.put(symbolEntry.getKey(), converted);
        }
        return result;
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

    /**
     * Value-level numeric coercion with the same semantics as this port's `safeFloat`:
     * numbers pass through, numeric strings are parsed, everything else (including
     * booleans, maps, lists and non-numeric strings) is null. Used where a whole map of
     * numbers has to be normalised and `safeFloat(obj, key)` cannot be applied per entry.
     */
    public static Double toDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) {
            double d = n.doubleValue();
            return Double.isFinite(d) ? d : null;
        }
        try {
            double d = Double.parseDouble(String.valueOf(value).trim());
            return Double.isFinite(d) ? d : null;
        } catch (Exception e) {
            return null;
        }
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

    /**
     * TS `parseFloat()` semantics: skip leading whitespace, take the longest numeric prefix
     * (`12.5abc` -> 12.5, `1e3` -> 1000, `0x10` -> 0) and yield NaN when there is no numeric
     * prefix at all (`abc`, `Infinity`). `Double.parseDouble` alone is stricter — it throws on
     * the prefix cases TS happily converts — and this port's job is to match TS, not to be
     * stricter than it.
     */
    static double parseFloatTs (String s) {
        int n = s.length ();
        int i = 0;
        while (i < n && Character.isWhitespace (s.charAt (i))) i++;
        int start = i;
        if (i < n && (s.charAt (i) == '+' || s.charAt (i) == '-')) i++;
        int digitsFrom = i;
        while (i < n && Character.isDigit (s.charAt (i))) i++;
        boolean hasDigits = i > digitsFrom;
        if (i < n && s.charAt (i) == '.') {
            i++;
            int fractionFrom = i;
            while (i < n && Character.isDigit (s.charAt (i))) i++;
            hasDigits = hasDigits || i > fractionFrom;
        }
        if (!hasDigits) return Double.NaN;
        // an exponent only counts when it is well-formed; parseFloat() stops before a stray 'e'
        if (i < n && (s.charAt (i) == 'e' || s.charAt (i) == 'E')) {
            int j = i + 1;
            if (j < n && (s.charAt (j) == '+' || s.charAt (j) == '-')) j++;
            int exponentFrom = j;
            while (j < n && Character.isDigit (s.charAt (j))) j++;
            if (j > exponentFrom) i = j;
        }
        try {
            return Double.parseDouble (s.substring (start, i));
        } catch (NumberFormatException e) {
            return Double.NaN;
        }
    }

    private static Object at (Object obj, int index) {
        if (obj instanceof List<?> list && index >= 0 && index < list.size ()) {
            return list.get (index);
        }
        return null;
    }

    public static Double safeFloatAt (Object obj, int index) {
        Object val = at (obj, index);
        if (val == null) return null;
        double parsed;
        if (val instanceof Number n) {
            parsed = n.doubleValue ();
        } else {
            parsed = parseFloatTs (String.valueOf (val));
        }
        // TS guards the parsed value with Number.isFinite, so Infinity/NaN become the default
        return Double.isFinite (parsed) ? parsed : null;
    }

    /** Long-range guard: values a double cannot hold exactly must not silently saturate. */
    private static boolean fitsInLong (double d) {
        return Double.isFinite (d) && d >= -9.223372036854776E18 && d < 9.223372036854776E18;
    }

    public static Long safeIntegerAt (Object obj, int index) {
        Object val = at (obj, index);
        if (val == null) return null;
        if (val instanceof Long l) return l;
        if (val instanceof Number n) {
            double d = n.doubleValue ();
            return fitsInLong (d) ? Long.valueOf ((long) d) : null;   // truncates toward zero, like TS Math.trunc
        }
        double parsed = parseFloatTs (String.valueOf (val));
        return fitsInLong (parsed) ? Long.valueOf ((long) parsed) : null;
    }
}
