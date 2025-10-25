package io.github.ccxt;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

import io.github.ccxt.base.Crypto;
import io.github.ccxt.base.Encode;
import io.github.ccxt.base.NumberHelpers;
import io.github.ccxt.base.SafeMethods;
import io.github.ccxt.base.Time;

public class Exchange {

    public int timeout = 10000; // default timeout 10s
    // If you have these constants elsewhere, remove these placeholders.
    public static final int DECIMAL_PLACES = 0;
    public static final int NO_PADDING = 0;

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
    public Map<String, Object> userAgents = new HashMap<>() {{
        put("chrome",   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36");
        put("chrome39", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36");
        put("chrome100","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36");
    }};

    // More creds / networking
    public String twofa;
    public String privateKey;
    public String walletAddress;
    public String token;
    public String login;
    public String proxy;
    public String agent;
    public Object timeOut = 10000;                         // Integer by autoboxing

    // Last responses
    public Object last_response_headers;
    public Object last_request_headers;
    public Object last_json_response;
    public Object last_http_response;
    public Object last_request_body;


    public Object https_proxy = null;
    public Object socksProxy = null;
    public Object socks_proxy = null;
    public Object wsSocksProxy = null;
    public Object ws_socks_proxy = null;

    public Object socksProxyCallback = null;
    public Object socks_proxy_callback = null;


    // concurrent maps
    public Object tickers       = new ConcurrentHashMap<String, Object>();
    public Object fundingRates  = new ConcurrentHashMap<String, Object>();
    public Object bidsasks      = new ConcurrentHashMap<String, Object>();
    public Object balance       = new ConcurrentHashMap<String, Object>();
    public Object liquidations  = new ConcurrentHashMap<String, Object>();
    public Object myLiquidations= new ConcurrentHashMap<String, Object>();
    public Object trades        = new ConcurrentHashMap<String, Object>();
    public Object orderbooks    = new ConcurrentHashMap<String, Object>();
    public Object ohlcvs        = new ConcurrentHashMap<String, Object>();

    // regular maps / misc
    public Object transactions  = new LinkedHashMap<String, Object>();
    public Object myTrades;          // left as Object to mirror the C# field
    public Object orders;
    public Object triggerOrders;
    public boolean newUpdates;
    public Object positions;

    // properties that had { get; set; } in C#
    private Object wssProxy   = null;
    private Object wss_proxy  = null;
    private Object wsProxy    = null;
    private Object ws_proxy   = null;

    // Dictionary<string, object> streaming { get; set; } = new dict();
    private Map<String, Object> streaming = new LinkedHashMap<>();

    // --- getters / setters to emulate C# auto-properties ---
    public Object getWssProxy() { return wssProxy; }
    public void setWssProxy(Object v) { this.wssProxy = v; }

    public Object getWss_proxy() { return wss_proxy; }
    public void setWss_proxy(Object v) { this.wss_proxy = v; }




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
        return Crypto.Hmac(payload, secret, algo, (String)encoding);
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
    public Object safeValueN(Object obj, java.util.List<Object> keys, Object... defaultValue) {
        return SafeMethods.SafeValueN(obj, keys, defaultValue);
    }

    // SafeString / SafeStringN
    public String safeString(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.SafeString(obj, key, defaultValue);
    }
    public String safeStringN(Object obj, java.util.List<Object> keys, Object... defaultValue) {
        return SafeMethods.SafeStringN(obj, keys, defaultValue);
    }

    // SafeInteger / SafeIntegerN  (SafeMethods returns Long)
    public Long safeInteger(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.SafeInteger(obj, key, defaultValue);
    }
    public Long safeIntegerN(Object obj, java.util.List<Object> keys, Object... defaultValue) {
        return SafeMethods.SafeIntegerN(obj, keys, defaultValue);
    }

    // SafeNumber / SafeNumberN
    // (If your SafeMethods.SafeNumber(...) doesn't exist, point this to SafeFloat(...) instead.)
    // public Double safeNumber(Object obj, Object key, Object... defaultValue) {
    //     return (Double) SafeMethods.SafeNumber(obj, key, defaultValue);
    // }
    public Object safeNumberN(Object obj, java.util.List<Object> keys, Object... defaultValue) {
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
    public Long nonce() {
        return Time.nonce();
    }

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

    public boolean valueIsDefined(Object value) {
        return value != null;
    }

        public Object convertToBigInt(Object value) {
        if (value == null) return null;
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
                    if (start < 0) start = 0;
                }
                // return a List<Byte> like the C# ToList() branches
                List<Byte> out = new ArrayList<>(byteArray.length - Math.max(0, start));
                for (int i = Math.max(0, start); i < byteArray.length; i++) out.add(byteArray[i]);
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
        if (str == null) return null;
        char[] chars = String.valueOf(str).toCharArray();
        List<String> res = new ArrayList<>(chars.length);
        for (char c : chars) res.add(String.valueOf(c));
        return res;
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
   // // // // // // // // // // // // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

}