package io.github.ccxt;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Locale;


import io.github.ccxt.base.Crypto;
import io.github.ccxt.base.Encode;
import io.github.ccxt.base.NumberHelpers;
import io.github.ccxt.base.SafeMethods;
import io.github.ccxt.base.Time;


public class Exchange {

    public int timeout = 10000; // default timeout 10s
    // If you have these constants elsewhere, remove these placeholders.
    // HTTP
    public Object httpClient;                         // no default (like C#)
    public Object fetchResponse = null;                   // tmp for response tests

    // Basic info
    public String id = "Exchange";
    public boolean alias = false;
    public String version = "";
    public String userAgent;                              // null by default
    public boolean verbose = true;
    public boolean enableRateLimit = true;
    public long lastRestRequestTimestamp = 0L;
    public String url = "";
    public String hostname = "";

    // Currencies/markets API structures
    public Map<String, Object> baseCurrencies = new HashMap<>();
    public boolean reloadingMarkets = false;
    public CompletableFuture<Object> marketsLoading = null;

    public Map<String, Object> quoteCurrencies = new HashMap<>();
    public Map<String, Object> api = new HashMap<>();
    public Map<String, Object> transformedApi = new HashMap<>();

    public boolean reduceFees = true;

    public Map<String, Object> markets_by_id = null;

    public List<Object> symbols = new ArrayList<>();
    public List<Object> codes = new ArrayList<>();
    public List<Object> ids = new ArrayList<>();

    public boolean substituteCommonCurrencyCodes = true;

    public Map<String, Object> commonCurrencies = new HashMap<>();

    public Object limits = new HashMap<String, Object>();
    public Object precisionMode = DECIMAL_PLACES;
    public Object currencies_by_id = new HashMap<String, Object>();

    public Object accounts = new HashMap<String, Object>();
    public Object accountsById = new HashMap<String, Object>();
    public Object status = new HashMap<String, Object>();

    public int paddingMode = NO_PADDING;

    public Object number = Float.class;                   // C# typeof(float) → Java Class<?> for Float
    public Map<String, Object> has = new HashMap<>();
    public Map<String, Object> features = new HashMap<>();
    public ConcurrentHashMap<String, Object> options = new ConcurrentHashMap<>();
    public boolean isSandboxModeEnabled = false;

    public Object markets = null;
    public Object currencies = new HashMap<String, Object>();
    public Object fees = new HashMap<String, Object>();
    public Object requiredCredentials = new HashMap<String, Object>();
    public Object timeframes = new HashMap<String, Object>();
    public double rateLimit;                               // 0.0 by default
    public Object exceptions = new HashMap<String, Object>();
    public Object urls = new HashMap<String, Object>();
    public Object precision = new HashMap<String, Object>();

    // Credentials
    public String secret;
    public String apiKey;
    public String password;
    public String uid;
    public String accountId;
    public int minFundingAddressLength = 1;

    // User agents map
    public Map<String, Object> userAgents = new HashMap<>() {
        {
            put("chrome", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36");
            put("chrome39", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36");
            put("chrome100", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36");
        }
    };

    // More creds / networking
    public String twofa;
    public String privateKey;
    public String walletAddress;
    public String token;
    public String login;
    public String proxy;
    public String agent;
    // public Object timeout = 10000;                         // Integer by autoboxing

    // Last responses
    public Object last_response_headers;
    public Object last_request_headers;
    public Object last_json_response;
    public Object last_http_response;
    public Object last_request_body;

    public Object httpProxy = null;
    public Object httpsProxy = null;
    public Object http_proxy = null;
    public Object https_proxy = null;
    public Object socksProxy = null;
    public Object socks_proxy = null;
    public Object wsSocksProxy = null;
    public Object ws_socks_proxy = null;

    public Object httpsProxyCallback = null;
    public Object https_proxy_callback = null;
    public Object proxyUrlCallback = null;
    public Object socksProxyCallback = null;
    public Object socks_proxy_callback = null;
    public Object httpProxyCallback = null;
    public Object proxy_url_callback = null;
    public Object proxyUrl = null;
    public Object proxy_url = null;
    public Object proxyUrlCallBack = null;

    // concurrent maps
    public Object tickers = new ConcurrentHashMap<String, Object>();
    public Object fundingRates = new ConcurrentHashMap<String, Object>();
    public Object bidsasks = new ConcurrentHashMap<String, Object>();
    public Object balance = new ConcurrentHashMap<String, Object>();
    public Object liquidations = new ConcurrentHashMap<String, Object>();
    public Object myLiquidations = new ConcurrentHashMap<String, Object>();
    public Object trades = new ConcurrentHashMap<String, Object>();
    public Object orderbooks = new ConcurrentHashMap<String, Object>();
    public Object ohlcvs = new ConcurrentHashMap<String, Object>();

    // regular maps / misc
    public Object transactions = new LinkedHashMap<String, Object>();
    public Object myTrades;          // left as Object to mirror the C# field
    public Object orders;
    public Object triggerOrders;
    public boolean newUpdates;
    public Object positions;

    // properties that had { get; set; } in C#
    private Object wssProxy = null;
    private Object wss_proxy = null;
    private Object wsProxy = null;
    private Object ws_proxy = null;

    // to do avoid this dup
    // precisionConstants
    public static final int ROUND = 1;                // rounding mode
    public static final int TRUNCATE = 0;
    public static final int ROUND_UP = 2;
    public static final int ROUND_DOWN = 3;
    public static final int DECIMAL_PLACES = 2;       // digits counting mode
    public static final int SIGNIFICANT_DIGITS = 3;
    public static final int TICK_SIZE = 4;
    public static final int NO_PADDING = 5;           // zero-padding mode
    public static final int PAD_WITH_ZERO = 6;


    // Dictionary<string, object> streaming { get; set; } = new dict();
    private Map<String, Object> streaming = new LinkedHashMap<>();

    // --- getters / setters to emulate C# auto-properties ---
    public Object getWssProxy() {
        return wssProxy;
    }

    public void setWssProxy(Object v) {
        this.wssProxy = v;
    }

    public Object getWss_proxy() {
        return wss_proxy;
    }

    public void setWss_proxy(Object v) {
        this.wss_proxy = v;
    }

    // === HELPERS === //
// =======================
// Crypto
// =======================
    public Object hmac(Object payload, Object secret) {
        return Crypto.Hmac(payload, secret, null, null);
    }

    public Object hmac(Object payload, Object secret, Object algo) {
        return Crypto.Hmac(payload, secret, algo, null);
    }

    public Object hmac(Object payload, Object secret, Object algo, Object encoding) {
        return Crypto.Hmac(payload, secret, algo, (String) encoding);
    }

    public Object hash(Object payload, Object algo) {
        return Crypto.Hash(payload, algo, null);
    }

    public Object md5() {
        return Crypto.md5();
    }

    public Object sha256() {
        return Crypto.sha256();
    }

    public Object sha512() {
        return Crypto.sha512();
    }

    // =======================
    // Encode
    // =======================
    public String urlencode(Object obj, boolean... sortParams) {
        return Encode.urlencode(obj, sortParams);
    }

    public String urlencodeWithArrayRepeat(Object obj) {
        return Encode.urlencodeWithArrayRepeat(obj);
    }

    // public String base64ToString(Object b64) {
    //     return Encode.base64ToString(b64);
    // }
    public String stringToBase64(Object s) {
        return Encode.StringToBase64(s);
    }
    // public String bytesToHex(Object bytes) {
    //     return Encode.bytesToHex(bytes);
    // }
    // public Object hexToBytes(Object hex) {
    //     return Encode.hexToBytes(hex);
    // }

    // =======================
    // Functions
    // =======================
    public boolean isHttpMethod(Object method) {
        return io.github.ccxt.base.Functions.isHttpMethod(
                method == null ? null : String.valueOf(method)
        );
    }

    public java.util.Map<String, Object> keysort(Object parameters) {
        return io.github.ccxt.base.Functions.keysort(parameters);
    }

    public java.util.List<String> sort(Object inputList) {
        return io.github.ccxt.base.Functions.sort(inputList);
    }

    // omit overloads
    public Object omit(Object a, Object... keys) {
        return io.github.ccxt.base.Functions.omit(a, keys);
    }

    public Object omit(Object a, Object key) {
        return io.github.ccxt.base.Functions.omit(a, key);
    }

    public java.util.Map<String, Object> omit(java.util.Map<String, Object> a, String key) {
        return (java.util.Map<String, Object>) io.github.ccxt.base.Functions.omit(a, key);
    }

    public java.util.Map<String, Object> omitN(Object a, java.util.List<Object> keys) {
        return io.github.ccxt.base.Functions.omitN(a, keys);
    }

    public java.util.List<Object> toArray(Object a) {
        return io.github.ccxt.base.Functions.toArray(a);
    }

    public Object arrayConcat(Object a, Object b) {
        return io.github.ccxt.base.Functions.arrayConcat(a, b);
    }

    public java.util.List<Object> aggregate(Object bidasks) {
        return io.github.ccxt.base.Functions.aggregate(bidasks);
    }

    public String uuidv1() {
        return io.github.ccxt.base.Functions.uuidv1();
    }

    public java.util.List<Object> extractParams(Object str) {
        return io.github.ccxt.base.Functions.extractParams(str);
    }

    public boolean isJsonEncodedObject(Object str) {
        return io.github.ccxt.base.Functions.isJsonEncodedObject(str);
    }

    public String json(Object obj) {
        return io.github.ccxt.base.Functions.json(obj);
    }

    // keep both casings since both exist
    public String Json(Object obj) {
        return io.github.ccxt.base.Functions.Json(obj);
    }

    public Object ordered(Object ob) {
        return io.github.ccxt.base.Functions.ordered(ob);
    }

    // =======================
    // Generic
    // =======================
    // sortBy / sortBy2
    public java.util.List<Object> sortBy(Object array, Object value1, Object desc, Object defaultValue) {
        return io.github.ccxt.base.Generic.sortBy(array, value1, desc, defaultValue);
    }

    public java.util.List<Object> sortBy2(Object array, Object key1, Object key2, Object desc) {
        return io.github.ccxt.base.Generic.sortBy2(array, key1, key2, desc);
    }

    // filterBy
    public java.util.List<Object> filterBy(Object aa, Object key, Object value) {
        return io.github.ccxt.base.Generic.filterBy(aa, key, value);
    }

    // extend / Extend (shallow merge)
    public java.util.Map<String, Object> extend(Object aa, Object bb) {
        return io.github.ccxt.base.Generic.extend(aa, bb);
    }

    public java.util.Map<String, Object> Extend(Object aa, Object bb) { // keep alias
        return io.github.ccxt.base.Generic.Extend(aa, bb);
    }

    // deepExtend2 / deepExtend
    public Object deepExtend2(Object... objs) {
        return io.github.ccxt.base.Generic.deepExtend2(objs);
    }

    public java.util.Map<String, Object> deepExtend(Object... objs) {
        return io.github.ccxt.base.Generic.deepExtend(objs);
    }

    // inArray / isArray
    public boolean inArray(Object elem, Object list2) {
        return io.github.ccxt.base.Generic.inArray(elem, list2);
    }

    public boolean isArray(Object a) {
        return io.github.ccxt.base.Generic.isArray(a);
    }

    // indexBy / indexBySafe
    public java.util.Map<String, Object> indexBySafe(Object a, Object key) {
        return io.github.ccxt.base.Generic.indexBySafe(a, key);
    }

    public java.util.Map<String, Object> indexBy(Object a, Object key) {
        return io.github.ccxt.base.Generic.indexBy(a, key);
    }

    // groupBy
    public java.util.Map<String, Object> groupBy(Object trades, Object key) {
        return io.github.ccxt.base.Generic.groupBy(trades, key);
    }

    // omitZero
    public Object omitZero(Object value) {
        return io.github.ccxt.base.Generic.omitZero(value);
    }

    // sum (both overloads)
    public Object sum(Object... args) {
        return io.github.ccxt.base.Generic.sum(args);
    }

    public Object sum(Object a, Object b) {
        return io.github.ccxt.base.Generic.sum(a, b);
    }

    // =======================
    // Number
    // =======================
    public String decimalToPrecision(Object x, Object roundingMode, Object numPrecisionDigits) {
        return NumberHelpers.decimalToPrecision(x, roundingMode, numPrecisionDigits, NumberHelpers.DECIMAL_PLACES, NumberHelpers.NO_PADDING);
    }

    public String decimalToPrecision(Object x, Object roundingMode, Object numPrecisionDigits, Object countMode, Object paddingMode) {
        return NumberHelpers.DecimalToPrecision(x, roundingMode, numPrecisionDigits, countMode, paddingMode);
    }

    public int precisionFromString(Object value) {
        return NumberHelpers.PrecisionFromString(value);
    }

    public String truncateToString(Object num, int precision) {
        return NumberHelpers.TruncateToString(num, precision);
    }

    public String numberToString(Object number) {
        return NumberHelpers.NumberToString(number);
    }

    public String numberToString2(Object number) {
        return NumberHelpers.NumberToString2(number);
    }

    // =======================
    // SafeMethods
    // =======================
    // SafeValue / SafeValueN
    public Object safeValue(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.SafeValue(obj, key, defaultValue);
    }

    public Object safeValueN(Object obj, Object keys, Object... defaultValue) {
        return SafeMethods.SafeValueN(obj, keys, defaultValue);
    }

    // SafeString / SafeStringN
    public String safeString(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.SafeString(obj, key, defaultValue);
    }

    public String safeStringN(Object obj, Object keys, Object... defaultValue) {
        return SafeMethods.SafeStringN(obj, keys, defaultValue);
    }

    // SafeInteger / SafeIntegerN  (SafeMethods returns Long)
    public Long safeInteger(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.SafeInteger(obj, key, defaultValue);
    }

    public Long safeIntegerN(Object obj, Object keys, Object... defaultValue) {
        return SafeMethods.SafeIntegerN(obj, keys, defaultValue);
    }

    // SafeNumber / SafeNumberN
    // (If your SafeMethods.SafeNumber(...) doesn't exist, point this to SafeFloat(...) instead.)
    // public Double safeNumber(Object obj, Object key, Object... defaultValue) {
    //     return (Double) SafeMethods.SafeNumber(obj, key, defaultValue);
    // }
    public Object safeNumberN(Object obj, Object keys, Object... defaultValue) {
        return SafeMethods.SafeNumberN(obj, keys, defaultValue);
    }

    // SafeDict / SafeList
    // (These assume you have corresponding methods in SafeMethods that also accept varargs.)
    // public java.util.Map<String, Object> safeDict(Object obj, Object key, Object... defaultValue) {
    //     return SafeMethods.SafeDict(obj, key, defaultValue);
    // }
    // public java.util.List<Object> safeList(Object obj, Object key, Object... defaultValue) {
    //     return SafeMethods.SafeList(obj, key, defaultValue);
    // }
    // =======================
    // Strings
    // =======================
    // public String replaceAll(Object baseString, Object search, Object replacement) {
    //     return Strings.replaceAll(baseString, search, replacement);
    // }
    // public boolean startsWith(Object s, Object prefix) {
    //     return Strings.startsWith(s, prefix);
    // }
    // public boolean endsWith(Object s, Object suffix) {
    //     return Strings.EndsWith(s, suffix);
    // }
    // public String toUpperCase(Object s) {
    //     return Strings.ToUpperCase(s);
    // }
    // public String toLowerCase(Object s) {
    //     return Strings.ToLowerCase(s);
    // }
    // public String trim(Object s) {
    //     return Strings.Trim(s);
    // }
    // public java.util.List<Object> split(Object s, Object delimiter) {
    //     return Strings.Split(s, delimiter);
    // }
    // public String join(java.util.List<?> items, Object delimiter) {
    //     return Strings.Join(items, delimiter);
    // }
    // public String sliceStr(Object s, Object start, Object end) {
    //     return Strings.Slice(s, start, end);
    // }
    // =======================
    // Time
    // =======================
    public Long milliseconds() {
        return Time.milliseconds();
    }

    public Long seconds() {
        return Time.seconds();
    }

    public String iso8601(Object timestamp) {
        return Time.Iso8601(timestamp);
    }

    public Long parse8601(Object isoString) {
        return Time.parse8601(isoString);
    }
    // public Long nonce() {
    //     return Time.nonce();
    // }

    // ----- END OF WRAPPERS ----- //
    public CompletableFuture<Object> sleep(Object milliseconds) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep((long) milliseconds);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            return null;
        });
    }

    public HashMap<String, Object> createSafeDictionary() {
        return new HashMap<String, Object>();
    }

    public boolean valueIsDefined(Object value) {
        return value != null;
    }

    public Object convertToBigInt(Object value) {
        if (value == null) {
            return null;
        }
        // mirror the intent: if it's a floating type, coerce to long (BigInt-ish)
        if (value instanceof Float) {
            return ((Float) value).longValue();
        }
        // (optional) if you also want to catch doubles, uncomment:
        // if (value instanceof Double) {
        //     return ((Double) value).longValue();
        // }
        return value;
    }

    public Object arraySlice(Object array, Object first, Object second) {
        int firstInt = Integer.parseInt(String.valueOf(first));

        // -------- byte[] ----------
        if (array instanceof byte[]) {
            byte[] byteArray = (byte[]) array;
            if (second == null) {
                int start = firstInt;
                if (start < 0) {
                    start = byteArray.length + start;
                    if (start < 0) {
                        start = 0;
                    }
                }
                // return a List<Byte> like the C# ToList() branches
                List<Byte> out = new ArrayList<>(byteArray.length - Math.max(0, start));
                for (int i = Math.max(0, start); i < byteArray.length; i++) {
                    out.add(byteArray[i]);
                }
                return out;
            }
            int secondInt = Integer.parseInt(String.valueOf(second));
            // return a raw array slice in the 2-index case (close to your C# mix)
            return Arrays.copyOfRange(byteArray, firstInt, secondInt);
        }

        // -------- List / ArrayCache ----------
        // special-case: ccxt.pro.ArrayCache — prefer its thread-safe toArray()
        // boolean isArrayCache = array instanceof ccxt.pro.ArrayCache;
        // if (second == null) {
        //     if (firstInt < 0) {
        //         if (isArrayCache) {
        //             Object[] safe = ((ccxt.pro.ArrayCache) array).toArray();
        //             int index = safe.length + firstInt;
        //             if (index < 0) index = 0;
        //             return new ArrayList<>(Arrays.asList(Arrays.copyOfRange(safe, index, safe.length)));
        //         } else {
        //             List<Object> parsed = (List<Object>) array;
        //             Object[] raw = parsed.toArray();
        //             int index = raw.length + firstInt;
        //             if (index < 0) index = 0;
        //             return new ArrayList<>(Arrays.asList(Arrays.copyOfRange(raw, index, raw.length)));
        //         }
        //     }
        //     if (isArrayCache) {
        //         Object[] safe = ((ccxt.pro.ArrayCache) array).toArray();
        //         int start = Math.max(0, firstInt);
        //         return new ArrayList<>(Arrays.asList(Arrays.copyOfRange(safe, start, safe.length)));
        //     } else {
        //         List<Object> parsed = (List<Object>) array;
        //         Object[] raw = parsed.toArray();
        //         int start = Math.max(0, firstInt);
        //         return new ArrayList<>(Arrays.asList(Arrays.copyOfRange(raw, start, raw.length)));
        //     }
        // } else {
        //     int secondInt = Integer.parseInt(String.valueOf(second));
        //     if (isArrayCache) {
        //         Object[] safe = ((ccxt.pro.ArrayCache) array).toArray();
        //         int start = Math.max(0, firstInt);
        //         int end = Math.min(secondInt, safe.length);
        //         if (end < start) end = start;
        //         return new ArrayList<>(Arrays.asList(Arrays.copyOfRange(safe, start, end)));
        //     } else {
        //         List<Object> parsed = (List<Object>) array;
        //         Object[] raw = parsed.toArray();
        //         int start = Math.max(0, firstInt);
        //         int end = Math.min(secondInt, raw.length);
        //         if (end < start) end = start;
        //         return new ArrayList<>(Arrays.asList(Arrays.copyOfRange(raw, start, end)));
        //     }
        // }
        return null;
    }

    // overload matching the C# default parameter (second = null)
    public Object arraySlice(Object array, Object first) {
        return arraySlice(array, first, null);
    }

    public Object stringToCharsArray(Object str) {
        if (str == null) {
            return null;
        }
        char[] chars = String.valueOf(str).toCharArray();
        List<String> res = new ArrayList<>(chars.length);
        for (char c : chars) {
            res.add(String.valueOf(c));
        }
        return res;
    }

    public static List<Object> unique(Object obj) {
        if (!(obj instanceof List<?> list)) {
            return null; // not a []string equivalent
        }

        // ensure it's actually a List<String>
        for (Object e : list) {
            if (!(e instanceof String)) {
                return null;
            }
        }

        // preserve order while deduplicating
        var seen = new LinkedHashSet<Object>();
        for (Object e : list) {
            seen.add((String) e);
        }
        return new ArrayList<Object>(seen);
    }

    public int parseTimeframe(Object timeframe2) {
        if (timeframe2 == null) {
            throw new IllegalArgumentException("timeframe cannot be null");
        }
        String timeframe = String.valueOf(timeframe2);
        if (timeframe.length() < 2) {
            throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        String amountStr = timeframe.substring(0, timeframe.length() - 1);
        String unit = timeframe.substring(timeframe.length() - 1); // last char as 1-length string

        int amount;
        try {
            amount = Integer.parseInt(amountStr);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid timeframe amount: " + timeframe, e);
        }

        int scale;
        switch (unit) {
            case "y":
                scale = 60 * 60 * 24 * 365;
                break;
            case "M":
                scale = 60 * 60 * 24 * 30;
                break; // months
            case "w":
                scale = 60 * 60 * 24 * 7;
                break;
            case "d":
                scale = 60 * 60 * 24;
                break;
            case "h":
                scale = 60 * 60;
                break;
            case "m":
                scale = 60;
                break;
            case "s":
                scale = 1;
                break;
            default:
                throw new IllegalArgumentException("Invalid timeframe unit: " + timeframe);
        }

        return amount * scale;
    }

    public static Double parseNumber(Object value) {
        return parseNumber(value, null);
    }

    public static Double parseNumber(Object value, Double defaultValue) {
        if (value == null) {
            return defaultValue;
        }

        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }

        if (value instanceof Boolean) {
            return (Boolean) value ? 1.0 : 0.0;
        }

        if (value instanceof String) {
            String s = ((String) value).trim();
            if (s.isEmpty()) {
                return defaultValue;
            }
            try {
                return Double.parseDouble(s);
            } catch (NumberFormatException ex) {
                try {
                    NumberFormat nf = NumberFormat.getInstance(Locale.US);
                    nf.setGroupingUsed(true); // allow "1,234.56"
                    Number n = nf.parse(s);
                    return n.doubleValue();
                } catch (ParseException ignored) {
                    return defaultValue;
                }
            }
        }

        return defaultValue;
    }

    // ------------------------------------------------------------------------
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ------------------------------------------------------------------------
    // // // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT
public Object describe()
    {
        return new java.util.HashMap<String, Object>() {{
            put( "id", null );
            put( "name", null );
            put( "countries", null );
            put( "enableRateLimit", true );
            put( "rateLimit", 2000 );
            put( "timeout", Exchange.this.timeout );
            put( "certified", false );
            put( "pro", false );
            put( "alias", false );
            put( "dex", false );
            put( "has", new java.util.HashMap<String, Object>() {{
                put( "publicAPI", true );
                put( "privateAPI", true );
                put( "CORS", null );
                put( "sandbox", null );
                put( "spot", null );
                put( "margin", null );
                put( "swap", null );
                put( "future", null );
                put( "option", null );
                put( "addMargin", null );
                put( "borrowCrossMargin", null );
                put( "borrowIsolatedMargin", null );
                put( "borrowMargin", null );
                put( "cancelAllOrders", null );
                put( "cancelAllOrdersWs", null );
                put( "cancelOrder", true );
                put( "cancelOrderWs", null );
                put( "cancelOrders", null );
                put( "cancelOrdersWs", null );
                put( "closeAllPositions", null );
                put( "closePosition", null );
                put( "createDepositAddress", null );
                put( "createLimitBuyOrder", null );
                put( "createLimitBuyOrderWs", null );
                put( "createLimitOrder", true );
                put( "createLimitOrderWs", null );
                put( "createLimitSellOrder", null );
                put( "createLimitSellOrderWs", null );
                put( "createMarketBuyOrder", null );
                put( "createMarketBuyOrderWs", null );
                put( "createMarketBuyOrderWithCost", null );
                put( "createMarketBuyOrderWithCostWs", null );
                put( "createMarketOrder", true );
                put( "createMarketOrderWs", true );
                put( "createMarketOrderWithCost", null );
                put( "createMarketOrderWithCostWs", null );
                put( "createMarketSellOrder", null );
                put( "createMarketSellOrderWs", null );
                put( "createMarketSellOrderWithCost", null );
                put( "createMarketSellOrderWithCostWs", null );
                put( "createOrder", true );
                put( "createOrderWs", null );
                put( "createOrders", null );
                put( "createOrderWithTakeProfitAndStopLoss", null );
                put( "createOrderWithTakeProfitAndStopLossWs", null );
                put( "createPostOnlyOrder", null );
                put( "createPostOnlyOrderWs", null );
                put( "createReduceOnlyOrder", null );
                put( "createReduceOnlyOrderWs", null );
                put( "createStopLimitOrder", null );
                put( "createStopLimitOrderWs", null );
                put( "createStopLossOrder", null );
                put( "createStopLossOrderWs", null );
                put( "createStopMarketOrder", null );
                put( "createStopMarketOrderWs", null );
                put( "createStopOrder", null );
                put( "createStopOrderWs", null );
                put( "createTakeProfitOrder", null );
                put( "createTakeProfitOrderWs", null );
                put( "createTrailingAmountOrder", null );
                put( "createTrailingAmountOrderWs", null );
                put( "createTrailingPercentOrder", null );
                put( "createTrailingPercentOrderWs", null );
                put( "createTriggerOrder", null );
                put( "createTriggerOrderWs", null );
                put( "deposit", null );
                put( "editOrder", "emulated" );
                put( "editOrders", null );
                put( "editOrderWs", null );
                put( "fetchAccounts", null );
                put( "fetchBalance", true );
                put( "fetchBalanceWs", null );
                put( "fetchBidsAsks", null );
                put( "fetchBorrowInterest", null );
                put( "fetchBorrowRate", null );
                put( "fetchBorrowRateHistories", null );
                put( "fetchBorrowRateHistory", null );
                put( "fetchBorrowRates", null );
                put( "fetchBorrowRatesPerSymbol", null );
                put( "fetchCanceledAndClosedOrders", null );
                put( "fetchCanceledOrders", null );
                put( "fetchClosedOrder", null );
                put( "fetchClosedOrders", null );
                put( "fetchClosedOrdersWs", null );
                put( "fetchConvertCurrencies", null );
                put( "fetchConvertQuote", null );
                put( "fetchConvertTrade", null );
                put( "fetchConvertTradeHistory", null );
                put( "fetchCrossBorrowRate", null );
                put( "fetchCrossBorrowRates", null );
                put( "fetchCurrencies", "emulated" );
                put( "fetchCurrenciesWs", "emulated" );
                put( "fetchDeposit", null );
                put( "fetchDepositAddress", null );
                put( "fetchDepositAddresses", null );
                put( "fetchDepositAddressesByNetwork", null );
                put( "fetchDeposits", null );
                put( "fetchDepositsWithdrawals", null );
                put( "fetchDepositsWs", null );
                put( "fetchDepositWithdrawFee", null );
                put( "fetchDepositWithdrawFees", null );
                put( "fetchFundingHistory", null );
                put( "fetchFundingRate", null );
                put( "fetchFundingRateHistory", null );
                put( "fetchFundingInterval", null );
                put( "fetchFundingIntervals", null );
                put( "fetchFundingRates", null );
                put( "fetchGreeks", null );
                put( "fetchIndexOHLCV", null );
                put( "fetchIsolatedBorrowRate", null );
                put( "fetchIsolatedBorrowRates", null );
                put( "fetchMarginAdjustmentHistory", null );
                put( "fetchIsolatedPositions", null );
                put( "fetchL2OrderBook", true );
                put( "fetchL3OrderBook", null );
                put( "fetchLastPrices", null );
                put( "fetchLedger", null );
                put( "fetchLedgerEntry", null );
                put( "fetchLeverage", null );
                put( "fetchLeverages", null );
                put( "fetchLeverageTiers", null );
                put( "fetchLiquidations", null );
                put( "fetchLongShortRatio", null );
                put( "fetchLongShortRatioHistory", null );
                put( "fetchMarginMode", null );
                put( "fetchMarginModes", null );
                put( "fetchMarketLeverageTiers", null );
                put( "fetchMarkets", true );
                put( "fetchMarketsWs", null );
                put( "fetchMarkOHLCV", null );
                put( "fetchMyLiquidations", null );
                put( "fetchMySettlementHistory", null );
                put( "fetchMyTrades", null );
                put( "fetchMyTradesWs", null );
                put( "fetchOHLCV", null );
                put( "fetchOHLCVWs", null );
                put( "fetchOpenInterest", null );
                put( "fetchOpenInterests", null );
                put( "fetchOpenInterestHistory", null );
                put( "fetchOpenOrder", null );
                put( "fetchOpenOrders", null );
                put( "fetchOpenOrdersWs", null );
                put( "fetchOption", null );
                put( "fetchOptionChain", null );
                put( "fetchOrder", null );
                put( "fetchOrderBook", true );
                put( "fetchOrderBooks", null );
                put( "fetchOrderBookWs", null );
                put( "fetchOrders", null );
                put( "fetchOrdersByStatus", null );
                put( "fetchOrdersWs", null );
                put( "fetchOrderTrades", null );
                put( "fetchOrderWs", null );
                put( "fetchPosition", null );
                put( "fetchPositionHistory", null );
                put( "fetchPositionsHistory", null );
                put( "fetchPositionWs", null );
                put( "fetchPositionMode", null );
                put( "fetchPositions", null );
                put( "fetchPositionsWs", null );
                put( "fetchPositionsForSymbol", null );
                put( "fetchPositionsForSymbolWs", null );
                put( "fetchPositionsRisk", null );
                put( "fetchPremiumIndexOHLCV", null );
                put( "fetchSettlementHistory", null );
                put( "fetchStatus", null );
                put( "fetchTicker", true );
                put( "fetchTickerWs", null );
                put( "fetchTickers", null );
                put( "fetchMarkPrices", null );
                put( "fetchTickersWs", null );
                put( "fetchTime", null );
                put( "fetchTrades", true );
                put( "fetchTradesWs", null );
                put( "fetchTradingFee", null );
                put( "fetchTradingFees", null );
                put( "fetchTradingFeesWs", null );
                put( "fetchTradingLimits", null );
                put( "fetchTransactionFee", null );
                put( "fetchTransactionFees", null );
                put( "fetchTransactions", null );
                put( "fetchTransfer", null );
                put( "fetchTransfers", null );
                put( "fetchUnderlyingAssets", null );
                put( "fetchVolatilityHistory", null );
                put( "fetchWithdrawAddresses", null );
                put( "fetchWithdrawal", null );
                put( "fetchWithdrawals", null );
                put( "fetchWithdrawalsWs", null );
                put( "fetchWithdrawalWhitelist", null );
                put( "reduceMargin", null );
                put( "repayCrossMargin", null );
                put( "repayIsolatedMargin", null );
                put( "setLeverage", null );
                put( "setMargin", null );
                put( "setMarginMode", null );
                put( "setPositionMode", null );
                put( "signIn", null );
                put( "transfer", null );
                put( "watchBalance", null );
                put( "watchMyTrades", null );
                put( "watchOHLCV", null );
                put( "watchOHLCVForSymbols", null );
                put( "watchOrderBook", null );
                put( "watchBidsAsks", null );
                put( "watchOrderBookForSymbols", null );
                put( "watchOrders", null );
                put( "watchOrdersForSymbols", null );
                put( "watchPosition", null );
                put( "watchPositions", null );
                put( "watchStatus", null );
                put( "watchTicker", null );
                put( "watchTickers", null );
                put( "watchTrades", null );
                put( "watchTradesForSymbols", null );
                put( "watchLiquidations", null );
                put( "watchLiquidationsForSymbols", null );
                put( "watchMyLiquidations", null );
                put( "unWatchOrders", null );
                put( "unWatchTrades", null );
                put( "unWatchTradesForSymbols", null );
                put( "unWatchOHLCVForSymbols", null );
                put( "unWatchOrderBookForSymbols", null );
                put( "unWatchPositions", null );
                put( "unWatchOrderBook", null );
                put( "unWatchTickers", null );
                put( "unWatchMyTrades", null );
                put( "unWatchTicker", null );
                put( "unWatchOHLCV", null );
                put( "watchMyLiquidationsForSymbols", null );
                put( "withdraw", null );
                put( "ws", null );
            }} );
            put( "urls", new java.util.HashMap<String, Object>() {{
                put( "logo", null );
                put( "api", null );
                put( "www", null );
                put( "doc", null );
                put( "fees", null );
            }} );
            put( "api", null );
            put( "requiredCredentials", new java.util.HashMap<String, Object>() {{
                put( "apiKey", true );
                put( "secret", true );
                put( "uid", false );
                put( "accountId", false );
                put( "login", false );
                put( "password", false );
                put( "twofa", false );
                put( "privateKey", false );
                put( "walletAddress", false );
                put( "token", false );
            }} );
            put( "markets", null );
            put( "currencies", new java.util.HashMap<String, Object>() {{}} );
            put( "timeframes", null );
            put( "fees", new java.util.HashMap<String, Object>() {{
                put( "trading", new java.util.HashMap<String, Object>() {{
                    put( "tierBased", null );
                    put( "percentage", null );
                    put( "taker", null );
                    put( "maker", null );
                }} );
                put( "funding", new java.util.HashMap<String, Object>() {{
                    put( "tierBased", null );
                    put( "percentage", null );
                    put( "withdraw", new java.util.HashMap<String, Object>() {{}} );
                    put( "deposit", new java.util.HashMap<String, Object>() {{}} );
                }} );
            }} );
            put( "status", new java.util.HashMap<String, Object>() {{
                put( "status", "ok" );
                put( "updated", null );
                put( "eta", null );
                put( "url", null );
            }} );
            put( "exceptions", null );
            put( "httpExceptions", new java.util.HashMap<String, Object>() {{
                put( "422", ExchangeError.class );
                put( "418", DDoSProtection.class );
                put( "429", RateLimitExceeded.class );
                put( "404", ExchangeNotAvailable.class );
                put( "409", ExchangeNotAvailable.class );
                put( "410", ExchangeNotAvailable.class );
                put( "451", ExchangeNotAvailable.class );
                put( "500", ExchangeNotAvailable.class );
                put( "501", ExchangeNotAvailable.class );
                put( "502", ExchangeNotAvailable.class );
                put( "520", ExchangeNotAvailable.class );
                put( "521", ExchangeNotAvailable.class );
                put( "522", ExchangeNotAvailable.class );
                put( "525", ExchangeNotAvailable.class );
                put( "526", ExchangeNotAvailable.class );
                put( "400", ExchangeNotAvailable.class );
                put( "403", ExchangeNotAvailable.class );
                put( "405", ExchangeNotAvailable.class );
                put( "503", ExchangeNotAvailable.class );
                put( "530", ExchangeNotAvailable.class );
                put( "408", RequestTimeout.class );
                put( "504", RequestTimeout.class );
                put( "401", AuthenticationError.class );
                put( "407", AuthenticationError.class );
                put( "511", AuthenticationError.class );
            }} );
            put( "commonCurrencies", new java.util.HashMap<String, Object>() {{
                put( "XBT", "BTC" );
                put( "BCHSV", "BSV" );
            }} );
            put( "precisionMode", TICK_SIZE );
            put( "paddingMode", NO_PADDING );
            put( "limits", new java.util.HashMap<String, Object>() {{
                put( "leverage", new java.util.HashMap<String, Object>() {{
                    put( "min", null );
                    put( "max", null );
                }} );
                put( "amount", new java.util.HashMap<String, Object>() {{
                    put( "min", null );
                    put( "max", null );
                }} );
                put( "price", new java.util.HashMap<String, Object>() {{
                    put( "min", null );
                    put( "max", null );
                }} );
                put( "cost", new java.util.HashMap<String, Object>() {{
                    put( "min", null );
                    put( "max", null );
                }} );
            }} );
        }};
    }

    public Object safeBoolN(Object dictionaryOrList, Object keys, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract boolean value from dictionary or list
        * @returns {bool | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeValueN(dictionaryOrList, keys, defaultValue);
        if (Helpers.isTrue((value instanceof Boolean)))
        {
            return value;
        }
        return defaultValue;
    }

    public Object safeBool2(Object dictionary, Object key1, Object key2, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract boolean value from dictionary or list
        * @returns {bool | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        return this.safeBoolN(dictionary, new java.util.ArrayList<Object>(java.util.Arrays.asList(key1, key2)), defaultValue);
    }

    public Object safeBool(Object dictionary, Object key, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract boolean value from dictionary or list
        * @returns {bool | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        return this.safeBoolN(dictionary, new java.util.ArrayList<Object>(java.util.Arrays.asList(key)), defaultValue);
    }

    public Object safeDictN(Object dictionaryOrList, Object keys, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract a dictionary from dictionary or list
        * @returns {object | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeValueN(dictionaryOrList, keys, defaultValue);
        if (Helpers.isTrue(Helpers.isEqual(value, null)))
        {
            return defaultValue;
        }
        if (Helpers.isTrue(((value instanceof java.util.Map))))
        {
            if (!Helpers.isTrue(((value instanceof java.util.List) || (value.getClass().isArray()))))
            {
                return value;
            }
        }
        return defaultValue;
    }

    public Object safeDict(Object dictionary, Object key, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract a dictionary from dictionary or list
        * @returns {object | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        return this.safeDictN(dictionary, new java.util.ArrayList<Object>(java.util.Arrays.asList(key)), defaultValue);
    }

    public Object safeDict2(Object dictionary, Object key1, Object key2, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract a dictionary from dictionary or list
        * @returns {object | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        return this.safeDictN(dictionary, new java.util.ArrayList<Object>(java.util.Arrays.asList(key1, key2)), defaultValue);
    }

    public Object safeListN(Object dictionaryOrList, Object keys, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract an Array from dictionary or list
        * @returns {Array | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeValueN(dictionaryOrList, keys, defaultValue);
        if (Helpers.isTrue(Helpers.isEqual(value, null)))
        {
            return defaultValue;
        }
        if (Helpers.isTrue(((value instanceof java.util.List) || (value.getClass().isArray()))))
        {
            return value;
        }
        return defaultValue;
    }

    public Object safeList2(Object dictionaryOrList, Object key1, Object key2, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract an Array from dictionary or list
        * @returns {Array | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        return this.safeListN(dictionaryOrList, new java.util.ArrayList<Object>(java.util.Arrays.asList(key1, key2)), defaultValue);
    }

    public Object safeList(Object dictionaryOrList, Object key, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract an Array from dictionary or list
        * @returns {Array | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        return this.safeListN(dictionaryOrList, new java.util.ArrayList<Object>(java.util.Arrays.asList(key)), defaultValue);
    }

    public void handleDeltas(Object orderbook, Object deltas)
    {
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(deltas)); i++)
        {
            this.handleDelta(orderbook, Helpers.GetValue(deltas, i));
        }
    }

    public void handleDelta(Object bookside, Object delta)
    {
        throw new NotSupported(Helpers.add(this.id, " handleDelta not supported yet")) ;
    }

    public void handleDeltasWithKeys(Object bookSide, Object deltas, Object... optionalArgs)
    {
        Object priceKey = Helpers.getArg(optionalArgs, 0, 0);
        Object amountKey = Helpers.getArg(optionalArgs, 1, 1);
        Object countOrIdKey = Helpers.getArg(optionalArgs, 2, 2);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(deltas)); i++)
        {
            Object bidAsk = this.parseBidAsk(Helpers.GetValue(deltas, i), priceKey, amountKey, countOrIdKey);
            bookSide.storeArray(bidAsk);
        }
    }

    public Object getCacheIndex(Object orderbook, Object deltas)
    {
        // return the first index of the cache that can be applied to the orderbook or -1 if not possible
        return -(1);
    }

    public Object arraysConcat(Object arraysOfArrays)
    {
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(arraysOfArrays)); i++)
        {
            result = this.arrayConcat(result, Helpers.GetValue(arraysOfArrays, i));
        }
        return result;
    }

    public Object findTimeframe(Object timeframe, Object... optionalArgs)
    {
        Object timeframes = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(timeframes, null)))
        {
            timeframes = this.timeframes;
        }
        Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)timeframes).keySet());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
        {
            Object key = Helpers.GetValue(keys, i);
            if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(timeframes, key), timeframe)))
            {
                return key;
            }
        }
        return null;
    }

    public Object checkProxyUrlSettings(Object... optionalArgs)
    {
        Object url = Helpers.getArg(optionalArgs, 0, null);
        Object method = Helpers.getArg(optionalArgs, 1, null);
        Object headers = Helpers.getArg(optionalArgs, 2, null);
        Object body = Helpers.getArg(optionalArgs, 3, null);
        Object usedProxies = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object proxyUrl = null;
        if (Helpers.isTrue(!Helpers.isEqual(this.proxyUrl, null)))
        {
            ((java.util.List<Object>)usedProxies).add("proxyUrl");
            proxyUrl = this.proxyUrl;
        }
        if (Helpers.isTrue(!Helpers.isEqual(this.proxy_url, null)))
        {
            ((java.util.List<Object>)usedProxies).add("proxy_url");
            proxyUrl = this.proxy_url;
        }
        if (Helpers.isTrue(!Helpers.isEqual(this.proxyUrlCallback, null)))
        {
            ((java.util.List<Object>)usedProxies).add("proxyUrlCallback");
            proxyUrl = Helpers.callDynamically(this, "proxyUrlCallback", new Object[] { url, method, headers, body });
        }
        if (Helpers.isTrue(!Helpers.isEqual(this.proxy_url_callback, null)))
        {
            ((java.util.List<Object>)usedProxies).add("proxy_url_callback");
            proxyUrl = Helpers.callDynamically(this, "proxy_url_callback", new Object[] { url, method, headers, body });
        }
        // backwards-compatibility
        if (Helpers.isTrue(!Helpers.isEqual(this.proxy, null)))
        {
            ((java.util.List<Object>)usedProxies).add("proxy");
            if (Helpers.isTrue((this.proxy instanceof java.util.concurrent.Callable)))
            {
                proxyUrl = Helpers.callDynamically(this, "proxy", new Object[] { url, method, headers, body });
            } else
            {
                proxyUrl = this.proxy;
            }
        }
        Object length = Helpers.getArrayLength(usedProxies);
        if (Helpers.isTrue(Helpers.isGreaterThan(length, 1)))
        {
            Object joinedProxyNames = String.join((String)",", (java.util.List<String>)usedProxies);
            throw new InvalidProxySettings(Helpers.add(Helpers.add(Helpers.add(this.id, " you have multiple conflicting proxy settings ("), joinedProxyNames), "), please use only one from : proxyUrl, proxy_url, proxyUrlCallback, proxy_url_callback")) ;
        }
        return proxyUrl;
    }

    public Object urlEncoderForProxyUrl(Object targetUrl)
    {
        // to be overriden
        Object includesQuery = Helpers.isGreaterThanOrEqual(Helpers.getIndexOf(targetUrl, "?"), 0);
        Object finalUrl = ((Helpers.isTrue(includesQuery))) ? this.encodeURIComponent(targetUrl) : targetUrl;
        return finalUrl;
    }

    public Object checkProxySettings(Object... optionalArgs)
    {
        Object url = Helpers.getArg(optionalArgs, 0, null);
        Object method = Helpers.getArg(optionalArgs, 1, null);
        Object headers = Helpers.getArg(optionalArgs, 2, null);
        Object body = Helpers.getArg(optionalArgs, 3, null);
        Object usedProxies = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object httpProxy = null;
        Object httpsProxy = null;
        Object socksProxy = null;
        // httpProxy
        Object isHttpProxyDefined = this.valueIsDefined(this.httpProxy);
        Object isHttp_proxy_defined = this.valueIsDefined(this.http_proxy);
        if (Helpers.isTrue(Helpers.isTrue(isHttpProxyDefined) || Helpers.isTrue(isHttp_proxy_defined)))
        {
            ((java.util.List<Object>)usedProxies).add("httpProxy");
            httpProxy = ((Helpers.isTrue(isHttpProxyDefined))) ? this.httpProxy : this.http_proxy;
        }
        Object ishttpProxyCallbackDefined = this.valueIsDefined(this.httpProxyCallback);
        Object ishttp_proxy_callback_defined = this.valueIsDefined(this.http_proxy_callback);
        if (Helpers.isTrue(Helpers.isTrue(ishttpProxyCallbackDefined) || Helpers.isTrue(ishttp_proxy_callback_defined)))
        {
            ((java.util.List<Object>)usedProxies).add("httpProxyCallback");
            httpProxy = ((Helpers.isTrue(ishttpProxyCallbackDefined))) ? Helpers.callDynamically(this, "httpProxyCallback", new Object[] { url, method, headers, body }) : Helpers.callDynamically(this, "http_proxy_callback", new Object[] { url, method, headers, body });
        }
        // httpsProxy
        Object isHttpsProxyDefined = this.valueIsDefined(this.httpsProxy);
        Object isHttps_proxy_defined = this.valueIsDefined(this.https_proxy);
        if (Helpers.isTrue(Helpers.isTrue(isHttpsProxyDefined) || Helpers.isTrue(isHttps_proxy_defined)))
        {
            ((java.util.List<Object>)usedProxies).add("httpsProxy");
            httpsProxy = ((Helpers.isTrue(isHttpsProxyDefined))) ? this.httpsProxy : this.https_proxy;
        }
        Object ishttpsProxyCallbackDefined = this.valueIsDefined(this.httpsProxyCallback);
        Object ishttps_proxy_callback_defined = this.valueIsDefined(this.https_proxy_callback);
        if (Helpers.isTrue(Helpers.isTrue(ishttpsProxyCallbackDefined) || Helpers.isTrue(ishttps_proxy_callback_defined)))
        {
            ((java.util.List<Object>)usedProxies).add("httpsProxyCallback");
            httpsProxy = ((Helpers.isTrue(ishttpsProxyCallbackDefined))) ? Helpers.callDynamically(this, "httpsProxyCallback", new Object[] { url, method, headers, body }) : Helpers.callDynamically(this, "https_proxy_callback", new Object[] { url, method, headers, body });
        }
        // socksProxy
        Object isSocksProxyDefined = this.valueIsDefined(this.socksProxy);
        Object isSocks_proxy_defined = this.valueIsDefined(this.socks_proxy);
        if (Helpers.isTrue(Helpers.isTrue(isSocksProxyDefined) || Helpers.isTrue(isSocks_proxy_defined)))
        {
            ((java.util.List<Object>)usedProxies).add("socksProxy");
            socksProxy = ((Helpers.isTrue(isSocksProxyDefined))) ? this.socksProxy : this.socks_proxy;
        }
        Object issocksProxyCallbackDefined = this.valueIsDefined(this.socksProxyCallback);
        Object issocks_proxy_callback_defined = this.valueIsDefined(this.socks_proxy_callback);
        if (Helpers.isTrue(Helpers.isTrue(issocksProxyCallbackDefined) || Helpers.isTrue(issocks_proxy_callback_defined)))
        {
            ((java.util.List<Object>)usedProxies).add("socksProxyCallback");
            socksProxy = ((Helpers.isTrue(issocksProxyCallbackDefined))) ? Helpers.callDynamically(this, "socksProxyCallback", new Object[] { url, method, headers, body }) : Helpers.callDynamically(this, "socks_proxy_callback", new Object[] { url, method, headers, body });
        }
        // check
        Object length = Helpers.getArrayLength(usedProxies);
        if (Helpers.isTrue(Helpers.isGreaterThan(length, 1)))
        {
            Object joinedProxyNames = String.join((String)",", (java.util.List<String>)usedProxies);
            throw new InvalidProxySettings(Helpers.add(Helpers.add(Helpers.add(this.id, " you have multiple conflicting proxy settings ("), joinedProxyNames), "), please use only one from: httpProxy, httpsProxy, httpProxyCallback, httpsProxyCallback, socksProxy, socksProxyCallback")) ;
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(httpProxy, httpsProxy, socksProxy));
    }

    public Object checkWsProxySettings()
    {
        Object usedProxies = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object wsProxy = null;
        Object wssProxy = null;
        Object wsSocksProxy = null;
        // ws proxy
        Object isWsProxyDefined = this.valueIsDefined(this.wsProxy);
        Object is_ws_proxy_defined = this.valueIsDefined(this.ws_proxy);
        if (Helpers.isTrue(Helpers.isTrue(isWsProxyDefined) || Helpers.isTrue(is_ws_proxy_defined)))
        {
            ((java.util.List<Object>)usedProxies).add("wsProxy");
            wsProxy = ((Helpers.isTrue((isWsProxyDefined)))) ? this.wsProxy : this.ws_proxy;
        }
        // wss proxy
        Object isWssProxyDefined = this.valueIsDefined(this.wssProxy);
        Object is_wss_proxy_defined = this.valueIsDefined(this.wss_proxy);
        if (Helpers.isTrue(Helpers.isTrue(isWssProxyDefined) || Helpers.isTrue(is_wss_proxy_defined)))
        {
            ((java.util.List<Object>)usedProxies).add("wssProxy");
            wssProxy = ((Helpers.isTrue((isWssProxyDefined)))) ? this.wssProxy : this.wss_proxy;
        }
        // ws socks proxy
        Object isWsSocksProxyDefined = this.valueIsDefined(this.wsSocksProxy);
        Object is_ws_socks_proxy_defined = this.valueIsDefined(this.ws_socks_proxy);
        if (Helpers.isTrue(Helpers.isTrue(isWsSocksProxyDefined) || Helpers.isTrue(is_ws_socks_proxy_defined)))
        {
            ((java.util.List<Object>)usedProxies).add("wsSocksProxy");
            wsSocksProxy = ((Helpers.isTrue((isWsSocksProxyDefined)))) ? this.wsSocksProxy : this.ws_socks_proxy;
        }
        // check
        Object length = Helpers.getArrayLength(usedProxies);
        if (Helpers.isTrue(Helpers.isGreaterThan(length, 1)))
        {
            Object joinedProxyNames = String.join((String)",", (java.util.List<String>)usedProxies);
            throw new InvalidProxySettings(Helpers.add(Helpers.add(Helpers.add(this.id, " you have multiple conflicting proxy settings ("), joinedProxyNames), "), please use only one from: wsProxy, wssProxy, wsSocksProxy")) ;
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(wsProxy, wssProxy, wsSocksProxy));
    }

    public void checkConflictingProxies(Object proxyAgentSet, Object proxyUrlSet)
    {
        if (Helpers.isTrue(Helpers.isTrue(proxyAgentSet) && Helpers.isTrue(proxyUrlSet)))
        {
            throw new InvalidProxySettings(Helpers.add(this.id, " you have multiple conflicting proxy settings, please use only one from : proxyUrl, httpProxy, httpsProxy, socksProxy")) ;
        }
    }

    public Object checkAddress(Object... optionalArgs)
    {
        Object address = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(address, null)))
        {
            throw new InvalidAddress(Helpers.add(this.id, " address is undefined")) ;
        }
        // check the address is not the same letter like 'aaaaa' nor too short nor has a space
        Object uniqChars = (this.unique(this.stringToCharsArray(address)));
        Object length = Helpers.getArrayLength(uniqChars); // py transpiler trick
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(length, 1)) || Helpers.isTrue(Helpers.isLessThan(((String)address).length(), this.minFundingAddressLength))) || Helpers.isTrue(Helpers.isGreaterThan(Helpers.getIndexOf(address, " "), -(1)))))
        {
            throw new InvalidAddress(Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(this.id, " address is invalid or has less than "), String.valueOf(this.minFundingAddressLength)), " characters: \""), String.valueOf(address)), "\"")) ;
        }
        return address;
    }

    public Object findMessageHashes(Object client, Object element)
    {
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object messageHashes = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)client.futures).keySet());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(messageHashes)); i++)
        {
            Object messageHash = Helpers.GetValue(messageHashes, i);
            if (Helpers.isTrue(Helpers.isGreaterThanOrEqual(Helpers.getIndexOf(messageHash, element), 0)))
            {
                ((java.util.List<Object>)result).add(messageHash);
            }
        }
        return result;
    }

    public Object filterByLimit(Object array, Object... optionalArgs)
    {
        // array = ascending ? this.arraySlice (array, 0, limit) : this.arraySlice (array, -limit);
        // array = ascending ? this.arraySlice (array, -limit) : this.arraySlice (array, 0, limit);
        Object limit = Helpers.getArg(optionalArgs, 0, null);
        Object key = Helpers.getArg(optionalArgs, 1, "timestamp");
        Object fromStart = Helpers.getArg(optionalArgs, 2, false);
        if (Helpers.isTrue(this.valueIsDefined(limit)))
        {
            Object arrayLength = Helpers.getArrayLength(array);
            if (Helpers.isTrue(Helpers.isGreaterThan(arrayLength, 0)))
            {
                Object ascending = true;
                if (Helpers.isTrue((Helpers.inOp(Helpers.GetValue(array, 0), key))))
                {
                    Object first = Helpers.GetValue(Helpers.GetValue(array, 0), key);
                    Object last = Helpers.GetValue(Helpers.GetValue(array, Helpers.subtract(arrayLength, 1)), key);
                    if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(first, null)) && Helpers.isTrue(!Helpers.isEqual(last, null))))
                    {
                        ascending = Helpers.isLessThanOrEqual(first, last); // true if array is sorted in ascending order based on 'timestamp'
                    }
                }
                if (Helpers.isTrue(fromStart))
                {
                    if (Helpers.isTrue(Helpers.isGreaterThan(limit, arrayLength)))
                    {
                        limit = arrayLength;
                    }
                    if (Helpers.isTrue(ascending))
                    {
                        array = this.arraySlice(array, 0, limit);
                    } else
                    {
                        array = this.arraySlice(array, -(limit));
                    }
                } else
                {
                    if (Helpers.isTrue(ascending))
                    {
                        array = this.arraySlice(array, -(limit));
                    } else
                    {
                        array = this.arraySlice(array, 0, limit);
                    }
                }
            }
        }
        return array;
    }

    public Object filterBySinceLimit(Object array, Object... optionalArgs)
    {
        Object since = Helpers.getArg(optionalArgs, 0, null);
        Object limit = Helpers.getArg(optionalArgs, 1, null);
        Object key = Helpers.getArg(optionalArgs, 2, "timestamp");
        Object tail = Helpers.getArg(optionalArgs, 3, false);
        Object sinceIsDefined = this.valueIsDefined(since);
        Object parsedArray = ((Object)this.toArray(array));
        Object result = parsedArray;
        if (Helpers.isTrue(sinceIsDefined))
        {
            result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(parsedArray)); i++)
            {
                Object entry = Helpers.GetValue(parsedArray, i);
                Object value = this.safeValue(entry, key);
                if (Helpers.isTrue(Helpers.isTrue(value) && Helpers.isTrue((Helpers.isGreaterThanOrEqual(value, since)))))
                {
                    ((java.util.List<Object>)result).add(entry);
                }
            }
        }
        if (Helpers.isTrue(Helpers.isTrue(tail) && Helpers.isTrue(!Helpers.isEqual(limit, null))))
        {
            return this.arraySlice(result, -(limit));
        }
        // if the user provided a 'since' argument
        // we want to limit the result starting from the 'since'
        Object shouldFilterFromStart = !Helpers.isTrue(tail) && Helpers.isTrue(sinceIsDefined);
        return this.filterByLimit(result, limit, key, shouldFilterFromStart);
    }

    public Object filterByValueSinceLimit(Object array, Object field, Object... optionalArgs)
    {
        Object value = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object key = Helpers.getArg(optionalArgs, 3, "timestamp");
        Object tail = Helpers.getArg(optionalArgs, 4, false);
        Object valueIsDefined = this.valueIsDefined(value);
        Object sinceIsDefined = this.valueIsDefined(since);
        Object parsedArray = ((Object)this.toArray(array));
        Object result = parsedArray;
        // single-pass filter for both symbol and since
        if (Helpers.isTrue(Helpers.isTrue(valueIsDefined) || Helpers.isTrue(sinceIsDefined)))
        {
            result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(parsedArray)); i++)
            {
                Object entry = Helpers.GetValue(parsedArray, i);
                Object entryFiledEqualValue = Helpers.isEqual(Helpers.GetValue(entry, field), value);
                Object firstCondition = ((Helpers.isTrue(valueIsDefined))) ? entryFiledEqualValue : true;
                Object entryKeyValue = this.safeValue(entry, key);
                Object entryKeyGESince = Helpers.isTrue(Helpers.isTrue((entryKeyValue)) && Helpers.isTrue((!Helpers.isEqual(since, null)))) && Helpers.isTrue((Helpers.isGreaterThanOrEqual(entryKeyValue, since)));
                Object secondCondition = ((Helpers.isTrue(sinceIsDefined))) ? entryKeyGESince : true;
                if (Helpers.isTrue(Helpers.isTrue(firstCondition) && Helpers.isTrue(secondCondition)))
                {
                    ((java.util.List<Object>)result).add(entry);
                }
            }
        }
        if (Helpers.isTrue(Helpers.isTrue(tail) && Helpers.isTrue(!Helpers.isEqual(limit, null))))
        {
            return this.arraySlice(result, -(limit));
        }
        return this.filterByLimit(result, limit, key, sinceIsDefined);
    }

    /**
     * @method
     * @name Exchange#setSandboxMode
     * @description set the sandbox mode for the exchange
     * @param {boolean} enabled true to enable sandbox mode, false to disable it
     */
    public void setSandboxMode(Object enabled)
    {
        if (Helpers.isTrue(enabled))
        {
            if (Helpers.isTrue(Helpers.inOp(this.urls, "test")))
            {
                if (Helpers.isTrue((Helpers.GetValue(this.urls, "api") instanceof String)))
                {
                    Helpers.addElementToObject(this.urls, "apiBackup", Helpers.GetValue(this.urls, "api"));
                    Helpers.addElementToObject(this.urls, "api", Helpers.GetValue(this.urls, "test"));
                } else
                {
                    Helpers.addElementToObject(this.urls, "apiBackup", this.clone(Helpers.GetValue(this.urls, "api")));
                    Helpers.addElementToObject(this.urls, "api", this.clone(Helpers.GetValue(this.urls, "test")));
                }
            } else
            {
                throw new NotSupported(Helpers.add(this.id, " does not have a sandbox URL")) ;
            }
            // set flag
            this.isSandboxModeEnabled = true;
        } else if (Helpers.isTrue(Helpers.inOp(this.urls, "apiBackup")))
        {
            if (Helpers.isTrue((Helpers.GetValue(this.urls, "api") instanceof String)))
            {
                Helpers.addElementToObject(this.urls, "api", ((Object)Helpers.GetValue(this.urls, "apiBackup")));
            } else
            {
                Helpers.addElementToObject(this.urls, "api", this.clone(Helpers.GetValue(this.urls, "apiBackup")));
            }
            Object newUrls = this.omit(this.urls, "apiBackup");
            this.urls = newUrls;
            // set flag
            this.isSandboxModeEnabled = false;
        }
    }

    /**
     * @method
     * @name Exchange#enableDemoTrading
     * @description enables or disables demo trading mode
     * @param {boolean} [enable] true if demo trading should be enabled, false otherwise
     */
    public void enableDemoTrading(Object enable)
    {
        if (Helpers.isTrue(this.isSandboxModeEnabled))
        {
            throw new NotSupported(Helpers.add(this.id, " demo trading does not support in sandbox environment. Please check https://www.binance.com/en/support/faq/detail/9be58f73e5e14338809e3b705b9687dd to see the differences")) ;
        }
        if (Helpers.isTrue(enable))
        {
            Helpers.addElementToObject(this.urls, "apiBackupDemoTrading", Helpers.GetValue(this.urls, "api"));
            Helpers.addElementToObject(this.urls, "api", Helpers.GetValue(this.urls, "demo"));
        } else if (Helpers.isTrue(Helpers.inOp(this.urls, "apiBackupDemoTrading")))
        {
            Helpers.addElementToObject(this.urls, "api", ((Object)Helpers.GetValue(this.urls, "apiBackupDemoTrading")));
            Object newUrls = this.omit(this.urls, "apiBackupDemoTrading");
            this.urls = newUrls;
        }
        Helpers.addElementToObject(this.options, "enableDemoTrading", enable);
    }

    public Object sign(Object path, Object... optionalArgs)
    {
        Object api = Helpers.getArg(optionalArgs, 0, "public");
        Object method = Helpers.getArg(optionalArgs, 1, "GET");
        Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
        Object headers = Helpers.getArg(optionalArgs, 3, null);
        Object body = Helpers.getArg(optionalArgs, 4, null);
        return new java.util.HashMap<String, Object>() {{}};
    }

    public java.util.concurrent.CompletableFuture<Object> fetchAccounts(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchAccounts() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTrades(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTradesWs(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchTradesWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchLiquidations(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "watchLiquidationsForSymbols")))
            {
                return (this.watchLiquidationsForSymbols(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), since, limit, parameters)).join();
            }
            throw new NotSupported(Helpers.add(this.id, " watchLiquidations() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchLiquidationsForSymbols(Object symbols, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchLiquidationsForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMyLiquidations(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "watchMyLiquidationsForSymbols")))
            {
                return this.watchMyLiquidationsForSymbols(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), since, limit, parameters);
            }
            throw new NotSupported(Helpers.add(this.id, " watchMyLiquidations() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMyLiquidationsForSymbols(Object symbols, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchMyLiquidationsForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTrades(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchOrders(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " unWatchOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchTrades(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " unWatchTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTradesForSymbols(Object symbols, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchTradesForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchTradesForSymbols(Object symbols, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " unWatchTradesForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMyTradesForSymbols(Object symbols, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchMyTradesForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrdersForSymbols(Object symbols, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchOrdersForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOHLCVForSymbols(Object symbolsAndTimeframes, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchOHLCVForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchOHLCVForSymbols(Object symbolsAndTimeframes, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " unWatchOHLCVForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrderBookForSymbols(Object symbols, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchOrderBookForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchOrderBookForSymbols(Object symbols, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " unWatchOrderBookForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchPositions(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " unWatchPositions() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchTicker(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " unWatchTicker() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchDepositAddresses(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object codes = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchDepositAddresses() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderBook(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOrderBook() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderBookWs(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOrderBookWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMarginMode(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchMarginModes")))
            {
                Object marginModes = (this.fetchMarginModes(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), parameters)).join();
                return this.safeDict(marginModes, symbol);
            } else
            {
                throw new NotSupported(Helpers.add(this.id, " fetchMarginMode() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMarginModes(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchMarginModes () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchRestOrderBookSafe(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            Object fetchSnapshotMaxRetries = this.handleOption("watchOrderBook", "maxRetries", 3);
            for (var i = 0; Helpers.isLessThan(i, fetchSnapshotMaxRetries); i++)
            {
                try
                {
                    Object orderBook = (this.fetchOrderBook(symbol, limit, parameters)).join();
                    return orderBook;
                } catch(Exception e)
                {
                    if (Helpers.isTrue(Helpers.isEqual((Helpers.add(i, 1)), fetchSnapshotMaxRetries)))
                    {
                        throw e;
                    }
                }
            }
            return null;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrderBook(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchOrderBook() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchOrderBook(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " unWatchOrderBook() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTime(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchTime() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTradingLimits(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchTradingLimits() is not supported yet")) ;
        });

    }

    public Object parseCurrency(Object rawCurrency)
    {
        throw new NotSupported(Helpers.add(this.id, " parseCurrency() is not supported yet")) ;
    }

    public Object parseCurrencies(Object rawCurrencies)
    {
        Object result = new java.util.HashMap<String, Object>() {{}};
        Object arr = this.toArray(rawCurrencies);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(arr)); i++)
        {
            Object parsed = this.parseCurrency(Helpers.GetValue(arr, i));
            Object code = Helpers.GetValue(parsed, "code");
            Helpers.addElementToObject(result, code, parsed);
        }
        return result;
    }

    public Object parseMarket(Object market)
    {
        throw new NotSupported(Helpers.add(this.id, " parseMarket() is not supported yet")) ;
    }

    public Object parseMarkets(Object markets)
    {
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(markets)); i++)
        {
            ((java.util.List<Object>)result).add(this.parseMarket(Helpers.GetValue(markets, i)));
        }
        return result;
    }

    public Object parseTicker(Object ticker, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseTicker() is not supported yet")) ;
    }

    public Object parseDepositAddress(Object depositAddress, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseDepositAddress() is not supported yet")) ;
    }

    public Object parseTrade(Object trade, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseTrade() is not supported yet")) ;
    }

    public Object parseTransaction(Object transaction, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseTransaction() is not supported yet")) ;
    }

    public Object parseTransfer(Object transfer, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseTransfer() is not supported yet")) ;
    }

    public Object parseAccount(Object account)
    {
        throw new NotSupported(Helpers.add(this.id, " parseAccount() is not supported yet")) ;
    }

    public Object parseLedgerEntry(Object item, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseLedgerEntry() is not supported yet")) ;
    }

    public Object parseOrder(Object order, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseOrder() is not supported yet")) ;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchCrossBorrowRates(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchCrossBorrowRates() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchIsolatedBorrowRates(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchIsolatedBorrowRates() is not supported yet")) ;
        });

    }

    public Object parseMarketLeverageTiers(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseMarketLeverageTiers() is not supported yet")) ;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchLeverageTiers(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchLeverageTiers() is not supported yet")) ;
        });

    }

    public Object parsePosition(Object position, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parsePosition() is not supported yet")) ;
    }

    public Object parseFundingRateHistory(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseFundingRateHistory() is not supported yet")) ;
    }

    public Object parseBorrowInterest(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseBorrowInterest() is not supported yet")) ;
    }

    public Object parseIsolatedBorrowRate(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseIsolatedBorrowRate() is not supported yet")) ;
    }

    public Object parseWsTrade(Object trade, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseWsTrade() is not supported yet")) ;
    }

    public Object parseWsOrder(Object order, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseWsOrder() is not supported yet")) ;
    }

    public Object parseWsOrderTrade(Object trade, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported(Helpers.add(this.id, " parseWsOrderTrade() is not supported yet")) ;
    }

    public Object parseWsOHLCV(Object ohlcv, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        return this.parseOHLCV(ohlcv, market);
    }

    public java.util.concurrent.CompletableFuture<Object> fetchFundingRates(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchFundingRates() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchFundingIntervals(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchFundingIntervals() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchFundingRate(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchFundingRate() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchFundingRates(Object symbols, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchFundingRates() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchFundingRatesForSymbols(Object symbols, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.watchFundingRates(symbols, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> transfer(Object code, Object amount, Object fromAccount, Object toAccount, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " transfer() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> withdraw(Object code, Object amount, Object address, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object tag = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " withdraw() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createDepositAddress(Object code, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " createDepositAddress() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> setLeverage(Object leverage, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " setLeverage() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchLeverage(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchLeverages")))
            {
                Object leverages = (this.fetchLeverages(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), parameters)).join();
                return this.safeDict(leverages, symbol);
            } else
            {
                throw new NotSupported(Helpers.add(this.id, " fetchLeverage() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchLeverages(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchLeverages() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> setPositionMode(Object hedged, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " setPositionMode() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> addMargin(Object symbol, Object amount, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " addMargin() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> reduceMargin(Object symbol, Object amount, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " reduceMargin() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> setMargin(Object symbol, Object amount, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " setMargin() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchLongShortRatio(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object timeframe = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchLongShortRatio() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchLongShortRatioHistory(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object timeframe = Helpers.getArg(optionalArgs, 1, null);
            Object since = Helpers.getArg(optionalArgs, 2, null);
            Object limit = Helpers.getArg(optionalArgs, 3, null);
            Object parameters = Helpers.getArg(optionalArgs, 4, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchLongShortRatioHistory() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMarginAdjustmentHistory(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object type = Helpers.getArg(optionalArgs, 1, null);
            Object since = Helpers.getArg(optionalArgs, 2, null);
            Object limit = Helpers.getArg(optionalArgs, 3, null);
            Object parameters = Helpers.getArg(optionalArgs, 4, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchMarginAdjustmentHistory() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> setMarginMode(Object marginMode, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " setMarginMode() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchDepositAddressesByNetwork(Object code, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchDepositAddressesByNetwork() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenInterestHistory(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object timeframe = Helpers.getArg(optionalArgs, 0, "1h");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOpenInterestHistory() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenInterest(Object symbol, Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOpenInterest() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenInterests(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOpenInterests() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> signIn(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " signIn() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPaymentMethods(Object... optionalArgs)
    {
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchPaymentMethods() is not supported yet")) ;
        });

    }

    public Object parseToInt(Object number)
    {
        // Solve Common parseInt misuse ex: parseInt ((since / 1000).toString ())
        // using a number as parameter which is not valid in ts
        Object stringifiedNumber = this.numberToString(number);
        Object convertedNumber = ((Object)Helpers.parseFloat(stringifiedNumber));
        return Helpers.parseInt(convertedNumber);
    }

    public Object parseToNumeric(Object number)
    {
        Object stringVersion = this.numberToString(number); // this will convert 1.0 and 1 to "1" and 1.1 to "1.1"
        // keep this in mind:
        // in JS:     1 === 1.0 is true
        // in Python: 1 == 1.0 is true
        // in PHP:    1 == 1.0 is true, but 1 === 1.0 is false.
        if (Helpers.isTrue(Helpers.isGreaterThanOrEqual(Helpers.getIndexOf(stringVersion, "."), 0)))
        {
            return Helpers.parseFloat(stringVersion);
        }
        return Helpers.parseInt(stringVersion);
    }

    public Object isRoundNumber(Object value)
    {
        // this method is similar to isInteger, but this is more loyal and does not check for types.
        // i.e. isRoundNumber(1.000) returns true, while isInteger(1.000) returns false
        Object res = this.parseToNumeric((Helpers.mod(value, 1)));
        return Helpers.isEqual(res, 0);
    }

    public Object safeNumberOmitZero(Object obj, Object key, Object... optionalArgs)
    {
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeString(obj, key);
        Object finalVar = this.parseNumber(this.omitZero(value));
        return ((Helpers.isTrue((Helpers.isEqual(finalVar, null))))) ? defaultValue : finalVar;
    }

    public Object safeIntegerOmitZero(Object obj, Object key, Object... optionalArgs)
    {
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object timestamp = this.safeInteger(obj, key, defaultValue);
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(timestamp, null)) || Helpers.isTrue(Helpers.isEqual(timestamp, 0))))
        {
            return null;
        }
        return timestamp;
    }

    public void afterConstruct()
    {
        // networks
        this.createNetworksByIdObject();
        this.featuresGenerator();
        // init predefined markets if any
        if (Helpers.isTrue(this.markets))
        {
            this.setMarkets(this.markets);
        }
        // init the request rate limiter
        this.initRestRateLimiter();
        // sanbox mode
        Object isSandbox = this.safeBool2(this.options, "sandbox", "testnet", false);
        if (Helpers.isTrue(isSandbox))
        {
            this.setSandboxMode(isSandbox);
        }
    }

    public void initRestRateLimiter()
    {
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(this.rateLimit, null)) || Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(this.id, null)) && Helpers.isTrue(Helpers.isEqual(this.rateLimit, -(1)))))))
        {
            throw new ExchangeError(Helpers.add(this.id, ".rateLimit property is not configured")) ;
        }
        Object refillRate = this.MAX_VALUE;
        if (Helpers.isTrue(Helpers.isGreaterThan(this.rateLimit, 0)))
        {
            refillRate = Helpers.divide(1, this.rateLimit);
        }
        Object defaultBucket = new java.util.HashMap<String, Object>() {{
            put( "delay", 0.001 );
            put( "capacity", 1 );
            put( "cost", 1 );
            put( "maxCapacity", 1000 );
            put( "refillRate", refillRate );
        }};
        Object existingBucket = ((Helpers.isTrue((Helpers.isEqual(this.tokenBucket, null))))) ? new java.util.HashMap<String, Object>() {{}} : this.tokenBucket;
        this.tokenBucket = this.extend(defaultBucket, existingBucket);
        this.initThrottler();
    }

    public void featuresGenerator()
    {
        //
        // in the exchange-specific features can be something like this, where we support 'string' aliases too:
        //
        //     {
        //         'my' : {
        //             'createOrder' : {...},
        //         },
        //         'swap': {
        //             'linear': {
        //                 'extends': my',
        //             },
        //         },
        //     }
        //
        if (Helpers.isTrue(Helpers.isEqual(this.features, null)))
        {
            return;
        }
        // reconstruct
        Object initialFeatures = this.features;
        this.features = new java.util.HashMap<String, Object>() {{}};
        Object unifiedMarketTypes = new java.util.ArrayList<Object>(java.util.Arrays.asList("spot", "swap", "future", "option"));
        Object subTypes = new java.util.ArrayList<Object>(java.util.Arrays.asList("linear", "inverse"));
        // atm only support basic methods, eg: 'createOrder', 'fetchOrder', 'fetchOrders', 'fetchMyTrades'
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(unifiedMarketTypes)); i++)
        {
            Object marketType = Helpers.GetValue(unifiedMarketTypes, i);
            // if marketType is not filled for this exchange, don't add that in `features`
            if (!Helpers.isTrue((Helpers.inOp(initialFeatures, marketType))))
            {
                Helpers.addElementToObject(this.features, marketType, null);
            } else
            {
                if (Helpers.isTrue(Helpers.isEqual(marketType, "spot")))
                {
                    Helpers.addElementToObject(this.features, marketType, this.featuresMapper(initialFeatures, marketType, null));
                } else
                {
                    Helpers.addElementToObject(this.features, marketType, new java.util.HashMap<String, Object>() {{}});
                    for (var j = 0; Helpers.isLessThan(j, Helpers.getArrayLength(subTypes)); j++)
                    {
                        Object subType = Helpers.GetValue(subTypes, j);
                        Helpers.addElementToObject(Helpers.GetValue(this.features, marketType), subType, this.featuresMapper(initialFeatures, marketType, subType));
                    }
                }
            }
        }
    }

    public Object featuresMapper(Object initialFeatures, Object marketType, Object... optionalArgs)
    {
        Object subType = Helpers.getArg(optionalArgs, 0, null);
        Object featuresObj = ((Helpers.isTrue((!Helpers.isEqual(subType, null))))) ? Helpers.GetValue(Helpers.GetValue(initialFeatures, marketType), subType) : Helpers.GetValue(initialFeatures, marketType);
        // if exchange does not have that market-type (eg. future>inverse)
        if (Helpers.isTrue(Helpers.isEqual(featuresObj, null)))
        {
            return null;
        }
        Object extendsStr = this.safeString(featuresObj, "extends");
        if (Helpers.isTrue(!Helpers.isEqual(extendsStr, null)))
        {
            featuresObj = this.omit(featuresObj, "extends");
            Object extendObj = this.featuresMapper(initialFeatures, extendsStr);
            featuresObj = this.deepExtend(extendObj, featuresObj);
        }
        //
        // ### corrections ###
        //
        // createOrder
        if (Helpers.isTrue(Helpers.inOp(featuresObj, "createOrder")))
        {
            Object value = this.safeDict(Helpers.GetValue(featuresObj, "createOrder"), "attachedStopLossTakeProfit");
            Helpers.addElementToObject(Helpers.GetValue(featuresObj, "createOrder"), "stopLoss", value);
            Helpers.addElementToObject(Helpers.GetValue(featuresObj, "createOrder"), "takeProfit", value);
            if (Helpers.isTrue(Helpers.isEqual(marketType, "spot")))
            {
                // default 'hedged': false
                Helpers.addElementToObject(Helpers.GetValue(featuresObj, "createOrder"), "hedged", false);
                // default 'leverage': false
                if (!Helpers.isTrue((Helpers.inOp(Helpers.GetValue(featuresObj, "createOrder"), "leverage"))))
                {
                    Helpers.addElementToObject(Helpers.GetValue(featuresObj, "createOrder"), "leverage", false);
                }
            }
            // default 'GTC' to true
            if (Helpers.isTrue(Helpers.isEqual(this.safeBool(Helpers.GetValue(Helpers.GetValue(featuresObj, "createOrder"), "timeInForce"), "GTC"), null)))
            {
                Helpers.addElementToObject(Helpers.GetValue(Helpers.GetValue(featuresObj, "createOrder"), "timeInForce"), "GTC", true);
            }
        }
        // other methods
        Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)featuresObj).keySet());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
        {
            Object key = Helpers.GetValue(keys, i);
            Object featureBlock = Helpers.GetValue(featuresObj, key);
            if (Helpers.isTrue(!Helpers.isTrue(this.inArray(key, new java.util.ArrayList<Object>(java.util.Arrays.asList("sandbox")))) && Helpers.isTrue(!Helpers.isEqual(featureBlock, null))))
            {
                // default "symbolRequired" to false to all methods (except `createOrder`)
                if (!Helpers.isTrue((Helpers.inOp(featureBlock, "symbolRequired"))))
                {
                    Helpers.addElementToObject(featureBlock, "symbolRequired", this.inArray(key, new java.util.ArrayList<Object>(java.util.Arrays.asList("createOrder", "createOrders", "fetchOHLCV"))));
                }
            }
        }
        return featuresObj;
    }

    public Object featureValue(Object symbol, Object... optionalArgs)
    {
        /**
        * @method
        * @name exchange#featureValue
        * @description this method is a very deterministic to help users to know what feature is supported by the exchange
        * @param {string} [symbol] unified symbol
        * @param {string} [methodName] view currently supported methods: https://docs.ccxt.com/#/README?id=features
        * @param {string} [paramName] unified param value, like: `triggerPrice`, `stopLoss.triggerPrice` (check docs for supported param names),
        * @param {object} [defaultValue] return default value if no result found
        * @returns {object} returns feature value
        */
        Object methodName = Helpers.getArg(optionalArgs, 0, null);
        Object paramName = Helpers.getArg(optionalArgs, 1, null);
        Object defaultValue = Helpers.getArg(optionalArgs, 2, null);
        Object market = this.market(symbol);
        return this.featureValueByType(Helpers.GetValue(market, "type"), Helpers.GetValue(market, "subType"), methodName, paramName, defaultValue);
    }

    public Object featureValueByType(Object marketType, Object subType, Object... optionalArgs)
    {
        /**
        * @method
        * @name exchange#featureValueByType
        * @description this method is a very deterministic to help users to know what feature is supported by the exchange
        * @param {string} [marketType] supported only: "spot", "swap", "future"
        * @param {string} [subType] supported only: "linear", "inverse"
        * @param {string} [methodName] view currently supported methods: https://docs.ccxt.com/#/README?id=features
        * @param {string} [paramName] unified param value (check docs for supported param names)
        * @param {object} [defaultValue] return default value if no result found
        * @returns {object} returns feature value
        */
        // if exchange does not yet have features manually implemented
        Object methodName = Helpers.getArg(optionalArgs, 0, null);
        Object paramName = Helpers.getArg(optionalArgs, 1, null);
        Object defaultValue = Helpers.getArg(optionalArgs, 2, null);
        if (Helpers.isTrue(Helpers.isEqual(this.features, null)))
        {
            return defaultValue;
        }
        // if marketType (e.g. 'option') does not exist in features
        if (!Helpers.isTrue((Helpers.inOp(this.features, marketType))))
        {
            return defaultValue;  // unsupported marketType, check "exchange.features" for details
        }
        // if marketType dict undefined
        if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.features, marketType), null)))
        {
            return defaultValue;
        }
        Object methodsContainer = Helpers.GetValue(this.features, marketType);
        if (Helpers.isTrue(Helpers.isEqual(subType, null)))
        {
            if (Helpers.isTrue(!Helpers.isEqual(marketType, "spot")))
            {
                return defaultValue;  // subType is required for non-spot markets
            }
        } else
        {
            if (!Helpers.isTrue((Helpers.inOp(Helpers.GetValue(this.features, marketType), subType))))
            {
                return defaultValue;  // unsupported subType, check "exchange.features" for details
            }
            // if subType dict undefined
            if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(Helpers.GetValue(this.features, marketType), subType), null)))
            {
                return defaultValue;
            }
            methodsContainer = Helpers.GetValue(Helpers.GetValue(this.features, marketType), subType);
        }
        // if user wanted only marketType and didn't provide methodName, eg: featureIsSupported('spot')
        if (Helpers.isTrue(Helpers.isEqual(methodName, null)))
        {
            return methodsContainer;
        }
        if (!Helpers.isTrue((Helpers.inOp(methodsContainer, methodName))))
        {
            return defaultValue;  // unsupported method, check "exchange.features" for details');
        }
        Object methodDict = Helpers.GetValue(methodsContainer, methodName);
        if (Helpers.isTrue(Helpers.isEqual(methodDict, null)))
        {
            return defaultValue;
        }
        // if user wanted only method and didn't provide `paramName`, eg: featureIsSupported('swap', 'linear', 'createOrder')
        if (Helpers.isTrue(Helpers.isEqual(paramName, null)))
        {
            return methodDict;
        }
        Object splited = new java.util.ArrayList<Object>(java.util.Arrays.asList(((String)paramName).split((String)"."))); // can be only parent key (`stopLoss`) or with child (`stopLoss.triggerPrice`)
        Object parentKey = Helpers.GetValue(splited, 0);
        Object subKey = this.safeString(splited, 1);
        if (!Helpers.isTrue((Helpers.inOp(methodDict, parentKey))))
        {
            return defaultValue;  // unsupported paramName, check "exchange.features" for details');
        }
        Object dictionary = this.safeDict(methodDict, parentKey);
        if (Helpers.isTrue(Helpers.isEqual(dictionary, null)))
        {
            // if the value is not dictionary but a scalar value (or undefined), return as is
            return Helpers.GetValue(methodDict, parentKey);
        } else
        {
            // return as is, when calling without subKey eg: featureValueByType('spot', undefined, 'createOrder', 'stopLoss')
            if (Helpers.isTrue(Helpers.isEqual(subKey, null)))
            {
                return Helpers.GetValue(methodDict, parentKey);
            }
            // throw an exception for unsupported subKey
            if (!Helpers.isTrue((Helpers.inOp(Helpers.GetValue(methodDict, parentKey), subKey))))
            {
                return defaultValue;  // unsupported subKey, check "exchange.features" for details
            }
            return Helpers.GetValue(Helpers.GetValue(methodDict, parentKey), subKey);
        }
    }

    public Object orderbookChecksumMessage(Object symbol)
    {
        return Helpers.add(Helpers.add(symbol, " : "), "orderbook data checksum validation failed. You can reconnect by calling watchOrderBook again or you can mute the error by setting exchange.options[\"watchOrderBook\"][\"checksum\"] = false");
    }

    public void createNetworksByIdObject()
    {
        // automatically generate network-id-to-code mappings
        Object networkIdsToCodesGenerated = this.invertFlatStringDictionary(this.safeValue(this.options, "networks", new java.util.HashMap<String, Object>() {{}})); // invert defined networks dictionary
        Helpers.addElementToObject(this.options, "networksById", this.extend(networkIdsToCodesGenerated, this.safeValue(this.options, "networksById", new java.util.HashMap<String, Object>() {{}}))); // support manually overriden "networksById" dictionary too
    }

    public Object getDefaultOptions()
    {
        return new java.util.HashMap<String, Object>() {{
            put( "defaultNetworkCodeReplacements", new java.util.HashMap<String, Object>() {{
                put( "ETH", new java.util.HashMap<String, Object>() {{
                    put( "ERC20", "ETH" );
                }} );
                put( "TRX", new java.util.HashMap<String, Object>() {{
                    put( "TRC20", "TRX" );
                }} );
                put( "CRO", new java.util.HashMap<String, Object>() {{
                    put( "CRC20", "CRONOS" );
                }} );
                put( "BRC20", new java.util.HashMap<String, Object>() {{
                    put( "BRC20", "BTC" );
                }} );
            }} );
        }};
    }

    public Object safeLedgerEntry(Object entry, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        currency = this.safeCurrency(null, currency);
        Object direction = this.safeString(entry, "direction");
        Object before = this.safeString(entry, "before");
        Object after = this.safeString(entry, "after");
        Object amount = this.safeString(entry, "amount");
        if (Helpers.isTrue(!Helpers.isEqual(amount, null)))
        {
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(before, null)) && Helpers.isTrue(!Helpers.isEqual(after, null))))
            {
                before = Precise.stringSub(after, amount);
            } else if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(before, null)) && Helpers.isTrue(Helpers.isEqual(after, null))))
            {
                after = Precise.stringAdd(before, amount);
            }
        }
        if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(before, null)) && Helpers.isTrue(!Helpers.isEqual(after, null))))
        {
            if (Helpers.isTrue(Helpers.isEqual(direction, null)))
            {
                if (Helpers.isTrue(Precise.stringGt(before, after)))
                {
                    direction = "out";
                }
                if (Helpers.isTrue(Precise.stringGt(after, before)))
                {
                    direction = "in";
                }
            }
        }
        Object fee = this.safeValue(entry, "fee");
        if (Helpers.isTrue(!Helpers.isEqual(fee, null)))
        {
            Helpers.addElementToObject(fee, "cost", this.safeNumber(fee, "cost"));
        }
        Object timestamp = this.safeInteger(entry, "timestamp");
        Object info = this.safeDict(entry, "info", new java.util.HashMap<String, Object>() {{}});
        return new java.util.HashMap<String, Object>() {{
            put( "id", Exchange.this.safeString(entry, "id") );
            put( "timestamp", timestamp );
            put( "datetime", Exchange.this.iso8601(timestamp) );
            put( "direction", direction );
            put( "account", Exchange.this.safeString(entry, "account") );
            put( "referenceId", Exchange.this.safeString(entry, "referenceId") );
            put( "referenceAccount", Exchange.this.safeString(entry, "referenceAccount") );
            put( "type", Exchange.this.safeString(entry, "type") );
            put( "currency", Helpers.GetValue(currency, "code") );
            put( "amount", Exchange.this.parseNumber(amount) );
            put( "before", Exchange.this.parseNumber(before) );
            put( "after", Exchange.this.parseNumber(after) );
            put( "status", Exchange.this.safeString(entry, "status") );
            put( "fee", fee );
            put( "info", info );
        }};
    }

    public Object safeCurrencyStructure(Object currency)
    {
        // derive data from networks: deposit, withdraw, active, fee, limits, precision
        Object networks = this.safeDict(currency, "networks", new java.util.HashMap<String, Object>() {{}});
        Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)networks).keySet());
        Object length = Helpers.getArrayLength(keys);
        if (Helpers.isTrue(!Helpers.isEqual(length, 0)))
        {
            for (var i = 0; Helpers.isLessThan(i, length); i++)
            {
                Object key = Helpers.GetValue(keys, i);
                Object network = Helpers.GetValue(networks, key);
                Object deposit = this.safeBool(network, "deposit");
                Object currencyDeposit = this.safeBool(currency, "deposit");
                if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(currencyDeposit, null)) || Helpers.isTrue(deposit)))
                {
                    Helpers.addElementToObject(currency, "deposit", deposit);
                }
                Object withdraw = this.safeBool(network, "withdraw");
                Object currencyWithdraw = this.safeBool(currency, "withdraw");
                if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(currencyWithdraw, null)) || Helpers.isTrue(withdraw)))
                {
                    Helpers.addElementToObject(currency, "withdraw", withdraw);
                }
                // set network 'active' to false if D or W is disabled
                Object active = this.safeBool(network, "active");
                if (Helpers.isTrue(Helpers.isEqual(active, null)))
                {
                    if (Helpers.isTrue(Helpers.isTrue(deposit) && Helpers.isTrue(withdraw)))
                    {
                        Helpers.addElementToObject(Helpers.GetValue(Helpers.GetValue(currency, "networks"), key), "active", true);
                    } else if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(deposit, null)) && Helpers.isTrue(!Helpers.isEqual(withdraw, null))))
                    {
                        Helpers.addElementToObject(Helpers.GetValue(Helpers.GetValue(currency, "networks"), key), "active", false);
                    }
                }
                active = this.safeBool(Helpers.GetValue(Helpers.GetValue(currency, "networks"), key), "active"); // dict might have been updated on above lines, so access directly instead of `network` variable
                Object currencyActive = this.safeBool(currency, "active");
                if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(currencyActive, null)) || Helpers.isTrue(active)))
                {
                    Helpers.addElementToObject(currency, "active", active);
                }
                // find lowest fee (which is more desired)
                Object fee = this.safeString(network, "fee");
                Object feeMain = this.safeString(currency, "fee");
                if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(feeMain, null)) || Helpers.isTrue(Precise.stringLt(fee, feeMain))))
                {
                    Helpers.addElementToObject(currency, "fee", this.parseNumber(fee));
                }
                // find lowest precision (which is more desired)
                Object precision = this.safeString(network, "precision");
                Object precisionMain = this.safeString(currency, "precision");
                if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(precisionMain, null)) || Helpers.isTrue(Precise.stringGt(precision, precisionMain))))
                {
                    Helpers.addElementToObject(currency, "precision", this.parseNumber(precision));
                }
                // limits
                Object limits = this.safeDict(network, "limits");
                Object limitsMain = this.safeDict(currency, "limits");
                if (Helpers.isTrue(Helpers.isEqual(limitsMain, null)))
                {
                    Helpers.addElementToObject(currency, "limits", new java.util.HashMap<String, Object>() {{}});
                }
                // deposits
                Object limitsDeposit = this.safeDict(limits, "deposit");
                Object limitsDepositMain = this.safeDict(limitsMain, "deposit");
                if (Helpers.isTrue(Helpers.isEqual(limitsDepositMain, null)))
                {
                    Helpers.addElementToObject(Helpers.GetValue(currency, "limits"), "deposit", new java.util.HashMap<String, Object>() {{}});
                }
                Object limitsDepositMin = this.safeString(limitsDeposit, "min");
                Object limitsDepositMax = this.safeString(limitsDeposit, "max");
                Object limitsDepositMinMain = this.safeString(limitsDepositMain, "min");
                Object limitsDepositMaxMain = this.safeString(limitsDepositMain, "max");
                // find min
                if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(limitsDepositMinMain, null)) || Helpers.isTrue(Precise.stringLt(limitsDepositMin, limitsDepositMinMain))))
                {
                    Helpers.addElementToObject(Helpers.GetValue(Helpers.GetValue(currency, "limits"), "deposit"), "min", this.parseNumber(limitsDepositMin));
                }
                // find max
                if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(limitsDepositMaxMain, null)) || Helpers.isTrue(Precise.stringGt(limitsDepositMax, limitsDepositMaxMain))))
                {
                    Helpers.addElementToObject(Helpers.GetValue(Helpers.GetValue(currency, "limits"), "deposit"), "max", this.parseNumber(limitsDepositMax));
                }
                // withdrawals
                Object limitsWithdraw = this.safeDict(limits, "withdraw");
                Object limitsWithdrawMain = this.safeDict(limitsMain, "withdraw");
                if (Helpers.isTrue(Helpers.isEqual(limitsWithdrawMain, null)))
                {
                    Helpers.addElementToObject(Helpers.GetValue(currency, "limits"), "withdraw", new java.util.HashMap<String, Object>() {{}});
                }
                Object limitsWithdrawMin = this.safeString(limitsWithdraw, "min");
                Object limitsWithdrawMax = this.safeString(limitsWithdraw, "max");
                Object limitsWithdrawMinMain = this.safeString(limitsWithdrawMain, "min");
                Object limitsWithdrawMaxMain = this.safeString(limitsWithdrawMain, "max");
                // find min
                if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(limitsWithdrawMinMain, null)) || Helpers.isTrue(Precise.stringLt(limitsWithdrawMin, limitsWithdrawMinMain))))
                {
                    Helpers.addElementToObject(Helpers.GetValue(Helpers.GetValue(currency, "limits"), "withdraw"), "min", this.parseNumber(limitsWithdrawMin));
                }
                // find max
                if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(limitsWithdrawMaxMain, null)) || Helpers.isTrue(Precise.stringGt(limitsWithdrawMax, limitsWithdrawMaxMain))))
                {
                    Helpers.addElementToObject(Helpers.GetValue(Helpers.GetValue(currency, "limits"), "withdraw"), "max", this.parseNumber(limitsWithdrawMax));
                }
            }
        }
        return this.extend(new java.util.HashMap<String, Object>() {{
            put( "info", null );
            put( "id", null );
            put( "numericId", null );
            put( "code", null );
            put( "precision", null );
            put( "type", null );
            put( "name", null );
            put( "active", null );
            put( "deposit", null );
            put( "withdraw", null );
            put( "fee", null );
            put( "fees", new java.util.HashMap<String, Object>() {{}} );
            put( "networks", new java.util.HashMap<String, Object>() {{}} );
            put( "limits", new java.util.HashMap<String, Object>() {{
                put( "deposit", new java.util.HashMap<String, Object>() {{
                    put( "min", null );
                    put( "max", null );
                }} );
                put( "withdraw", new java.util.HashMap<String, Object>() {{
                    put( "min", null );
                    put( "max", null );
                }} );
            }} );
        }}, currency);
    }

    public Object safeMarketStructure(Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object cleanStructure = new java.util.HashMap<String, Object>() {{
            put( "id", null );
            put( "lowercaseId", null );
            put( "symbol", null );
            put( "base", null );
            put( "quote", null );
            put( "settle", null );
            put( "baseId", null );
            put( "quoteId", null );
            put( "settleId", null );
            put( "type", null );
            put( "spot", null );
            put( "margin", null );
            put( "swap", null );
            put( "future", null );
            put( "option", null );
            put( "index", null );
            put( "active", null );
            put( "contract", null );
            put( "linear", null );
            put( "inverse", null );
            put( "subType", null );
            put( "taker", null );
            put( "maker", null );
            put( "contractSize", null );
            put( "expiry", null );
            put( "expiryDatetime", null );
            put( "strike", null );
            put( "optionType", null );
            put( "precision", new java.util.HashMap<String, Object>() {{
                put( "amount", null );
                put( "price", null );
                put( "cost", null );
                put( "base", null );
                put( "quote", null );
            }} );
            put( "limits", new java.util.HashMap<String, Object>() {{
                put( "leverage", new java.util.HashMap<String, Object>() {{
                    put( "min", null );
                    put( "max", null );
                }} );
                put( "amount", new java.util.HashMap<String, Object>() {{
                    put( "min", null );
                    put( "max", null );
                }} );
                put( "price", new java.util.HashMap<String, Object>() {{
                    put( "min", null );
                    put( "max", null );
                }} );
                put( "cost", new java.util.HashMap<String, Object>() {{
                    put( "min", null );
                    put( "max", null );
                }} );
            }} );
            put( "marginModes", new java.util.HashMap<String, Object>() {{
                put( "cross", null );
                put( "isolated", null );
            }} );
            put( "created", null );
            put( "info", null );
        }};
        if (Helpers.isTrue(!Helpers.isEqual(market, null)))
        {
            Object result = this.extend(cleanStructure, market);
            // set undefined swap/future/etc
            if (Helpers.isTrue(Helpers.GetValue(result, "spot")))
            {
                if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(result, "contract"), null)))
                {
                    Helpers.addElementToObject(result, "contract", false);
                }
                if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(result, "swap"), null)))
                {
                    Helpers.addElementToObject(result, "swap", false);
                }
                if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(result, "future"), null)))
                {
                    Helpers.addElementToObject(result, "future", false);
                }
                if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(result, "option"), null)))
                {
                    Helpers.addElementToObject(result, "option", false);
                }
                if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(result, "index"), null)))
                {
                    Helpers.addElementToObject(result, "index", false);
                }
            }
            return result;
        }
        return cleanStructure;
    }

    public Object setMarkets(Object markets, Object... optionalArgs)
    {
        Object currencies = Helpers.getArg(optionalArgs, 0, null);
        Object values = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        this.markets_by_id = this.createSafeDictionary();
        // handle marketId conflicts
        // we insert spot markets first
        Object marketValues = this.sortBy(this.toArray(markets), "spot", true, true);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(marketValues)); i++)
        {
            Object value = Helpers.GetValue(marketValues, i);
            if (Helpers.isTrue(Helpers.inOp(this.markets_by_id, Helpers.GetValue(value, "id"))))
            {
                Object marketsByIdArray = ((Object)Helpers.GetValue(this.markets_by_id, Helpers.GetValue(value, "id")));
                ((java.util.List<Object>)marketsByIdArray).add(value);
                Helpers.addElementToObject(this.markets_by_id, Helpers.GetValue(value, "id"), marketsByIdArray);
            } else
            {
                Helpers.addElementToObject(this.markets_by_id, Helpers.GetValue(value, "id"), ((Object)new java.util.ArrayList<Object>(java.util.Arrays.asList(value))));
            }
            Object market = this.deepExtend(this.safeMarketStructure(), new java.util.HashMap<String, Object>() {{
                put( "precision", Exchange.this.precision );
                put( "limits", Exchange.this.limits );
            }}, Helpers.GetValue(this.fees, "trading"), value);
            if (Helpers.isTrue(Helpers.GetValue(market, "linear")))
            {
                Helpers.addElementToObject(market, "subType", "linear");
            } else if (Helpers.isTrue(Helpers.GetValue(market, "inverse")))
            {
                Helpers.addElementToObject(market, "subType", "inverse");
            } else
            {
                Helpers.addElementToObject(market, "subType", null);
            }
            ((java.util.List<Object>)values).add(market);
        }
        this.markets = this.mapToSafeMap(((Object)this.indexBy(values, "symbol")));
        Object marketsSortedBySymbol = this.keysort(this.markets);
        Object marketsSortedById = this.keysort(this.markets_by_id);
        this.symbols = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)marketsSortedBySymbol).keySet());
        this.ids = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)marketsSortedById).keySet());
        Object numCurrencies = 0;
        if (Helpers.isTrue(!Helpers.isEqual(currencies, null)))
        {
            Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)currencies).keySet());
            numCurrencies = Helpers.getArrayLength(keys);
        }
        if (Helpers.isTrue(Helpers.isGreaterThan(numCurrencies, 0)))
        {
            // currencies is always undefined when called in constructor but not when called from loadMarkets
            this.currencies = this.mapToSafeMap(this.deepExtend(this.currencies, currencies));
        } else
        {
            Object baseCurrencies = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            Object quoteCurrencies = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(values)); i++)
            {
                Object market = Helpers.GetValue(values, i);
                Object defaultCurrencyPrecision = ((Helpers.isTrue((Helpers.isEqual(this.precisionMode, DECIMAL_PLACES))))) ? 8 : this.parseNumber("1e-8");
                Object marketPrecision = this.safeDict(market, "precision", new java.util.HashMap<String, Object>() {{}});
                if (Helpers.isTrue(Helpers.inOp(market, "base")))
                {
                    Object currency = this.safeCurrencyStructure(new java.util.HashMap<String, Object>() {{
                        put( "id", Exchange.this.safeString2(market, "baseId", "base") );
                        put( "numericId", Exchange.this.safeInteger(market, "baseNumericId") );
                        put( "code", Exchange.this.safeString(market, "base") );
                        put( "precision", Exchange.this.safeValue2(marketPrecision, "base", "amount", defaultCurrencyPrecision) );
                    }});
                    ((java.util.List<Object>)baseCurrencies).add(currency);
                }
                if (Helpers.isTrue(Helpers.inOp(market, "quote")))
                {
                    Object currency = this.safeCurrencyStructure(new java.util.HashMap<String, Object>() {{
                        put( "id", Exchange.this.safeString2(market, "quoteId", "quote") );
                        put( "numericId", Exchange.this.safeInteger(market, "quoteNumericId") );
                        put( "code", Exchange.this.safeString(market, "quote") );
                        put( "precision", Exchange.this.safeValue2(marketPrecision, "quote", "price", defaultCurrencyPrecision) );
                    }});
                    ((java.util.List<Object>)quoteCurrencies).add(currency);
                }
            }
            baseCurrencies = this.sortBy(baseCurrencies, "code", false, "");
            quoteCurrencies = this.sortBy(quoteCurrencies, "code", false, "");
            this.baseCurrencies = this.mapToSafeMap(this.indexBy(baseCurrencies, "code"));
            this.quoteCurrencies = this.mapToSafeMap(this.indexBy(quoteCurrencies, "code"));
            Object allCurrencies = this.arrayConcat(baseCurrencies, quoteCurrencies);
            Object groupedCurrencies = this.groupBy(allCurrencies, "code");
            Object codes = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)groupedCurrencies).keySet());
            Object resultingCurrencies = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(codes)); i++)
            {
                Object code = Helpers.GetValue(codes, i);
                Object groupedCurrenciesCode = this.safeList(groupedCurrencies, code, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
                Object highestPrecisionCurrency = this.safeValue(groupedCurrenciesCode, 0);
                for (var j = 1; Helpers.isLessThan(j, Helpers.getArrayLength(groupedCurrenciesCode)); j++)
                {
                    Object currentCurrency = Helpers.GetValue(groupedCurrenciesCode, j);
                    if (Helpers.isTrue(Helpers.isEqual(this.precisionMode, TICK_SIZE)))
                    {
                        highestPrecisionCurrency = ((Helpers.isTrue((Helpers.isLessThan(Helpers.GetValue(currentCurrency, "precision"), Helpers.GetValue(highestPrecisionCurrency, "precision")))))) ? currentCurrency : highestPrecisionCurrency;
                    } else
                    {
                        highestPrecisionCurrency = ((Helpers.isTrue((Helpers.isGreaterThan(Helpers.GetValue(currentCurrency, "precision"), Helpers.GetValue(highestPrecisionCurrency, "precision")))))) ? currentCurrency : highestPrecisionCurrency;
                    }
                }
                ((java.util.List<Object>)resultingCurrencies).add(highestPrecisionCurrency);
            }
            Object sortedCurrencies = this.sortBy(resultingCurrencies, "code");
            this.currencies = this.mapToSafeMap(this.deepExtend(this.currencies, this.indexBy(sortedCurrencies, "code")));
        }
        this.currencies_by_id = this.indexBySafe(this.currencies, "id");
        Object currenciesSortedByCode = this.keysort(this.currencies);
        this.codes = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)currenciesSortedByCode).keySet());
        return this.markets;
    }

    public Object setMarketsFromExchange(Object sourceExchange)
    {
        // Validate that both exchanges are of the same type
        if (Helpers.isTrue(!Helpers.isEqual(this.id, sourceExchange.id)))
        {
            throw new ArgumentsRequired(Helpers.add(Helpers.add(Helpers.add(this.id, " shareMarkets() can only share markets with exchanges of the same type (got "), Helpers.GetValue(sourceExchange, "id")), ")")) ;
        }
        // Validate that source exchange has loaded markets
        if (!Helpers.isTrue(sourceExchange.markets))
        {
            throw new ExchangeError("setMarketsFromExchange() source exchange must have loaded markets first. Can call by using loadMarkets function") ;
        }
        // Set all market-related data
        this.markets = sourceExchange.markets;
        this.markets_by_id = sourceExchange.markets_by_id;
        this.symbols = sourceExchange.symbols;
        this.ids = sourceExchange.ids;
        this.currencies = sourceExchange.currencies;
        this.baseCurrencies = sourceExchange.baseCurrencies;
        this.quoteCurrencies = sourceExchange.quoteCurrencies;
        this.codes = sourceExchange.codes;
        // check marketHelperProps
        Object sourceExchangeHelpers = this.safeList(sourceExchange.options, "marketHelperProps", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(sourceExchangeHelpers)); i++)
        {
            Object helper = Helpers.GetValue(sourceExchangeHelpers, i);
            if (Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(sourceExchange.options, helper), null)))
            {
                Helpers.addElementToObject(this.options, helper, Helpers.GetValue(sourceExchange.options, helper));
            }
        }
        return this;
    }

    public Object getDescribeForExtendedWsExchange(Object currentRestInstance, Object parentRestInstance, Object wsBaseDescribe)
    {
        Object extendedRestDescribe = this.deepExtend(parentRestInstance.describe(), currentRestInstance.describe());
        Object superWithRestDescribe = this.deepExtend(extendedRestDescribe, wsBaseDescribe);
        return superWithRestDescribe;
    }

    public Object safeBalance(Object balance)
    {
        Object balances = this.omit(balance, new java.util.ArrayList<Object>(java.util.Arrays.asList("info", "timestamp", "datetime", "free", "used", "total")));
        Object codes = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)balances).keySet());
        Helpers.addElementToObject(balance, "free", new java.util.HashMap<String, Object>() {{}});
        Helpers.addElementToObject(balance, "used", new java.util.HashMap<String, Object>() {{}});
        Helpers.addElementToObject(balance, "total", new java.util.HashMap<String, Object>() {{}});
        Object debtBalance = new java.util.HashMap<String, Object>() {{}};
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(codes)); i++)
        {
            Object code = Helpers.GetValue(codes, i);
            Object total = this.safeString(Helpers.GetValue(balance, code), "total");
            Object free = this.safeString(Helpers.GetValue(balance, code), "free");
            Object used = this.safeString(Helpers.GetValue(balance, code), "used");
            Object debt = this.safeString(Helpers.GetValue(balance, code), "debt");
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(total, null))) && Helpers.isTrue((!Helpers.isEqual(free, null)))) && Helpers.isTrue((!Helpers.isEqual(used, null)))))
            {
                total = Precise.stringAdd(free, used);
            }
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(free, null))) && Helpers.isTrue((!Helpers.isEqual(total, null)))) && Helpers.isTrue((!Helpers.isEqual(used, null)))))
            {
                free = Precise.stringSub(total, used);
            }
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(used, null))) && Helpers.isTrue((!Helpers.isEqual(total, null)))) && Helpers.isTrue((!Helpers.isEqual(free, null)))))
            {
                used = Precise.stringSub(total, free);
            }
            Helpers.addElementToObject(Helpers.GetValue(balance, code), "free", this.parseNumber(free));
            Helpers.addElementToObject(Helpers.GetValue(balance, code), "used", this.parseNumber(used));
            Helpers.addElementToObject(Helpers.GetValue(balance, code), "total", this.parseNumber(total));
            Helpers.addElementToObject(Helpers.GetValue(balance, "free"), code, Helpers.GetValue(Helpers.GetValue(balance, code), "free"));
            Helpers.addElementToObject(Helpers.GetValue(balance, "used"), code, Helpers.GetValue(Helpers.GetValue(balance, code), "used"));
            Helpers.addElementToObject(Helpers.GetValue(balance, "total"), code, Helpers.GetValue(Helpers.GetValue(balance, code), "total"));
            if (Helpers.isTrue(!Helpers.isEqual(debt, null)))
            {
                Helpers.addElementToObject(Helpers.GetValue(balance, code), "debt", this.parseNumber(debt));
                Helpers.addElementToObject(debtBalance, code, Helpers.GetValue(Helpers.GetValue(balance, code), "debt"));
            }
        }
        Object debtBalanceArray = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)debtBalance).keySet());
        Object length = Helpers.getArrayLength(debtBalanceArray);
        if (Helpers.isTrue(length))
        {
            Helpers.addElementToObject(balance, "debt", debtBalance);
        }
        return ((Object)balance);
    }
}
