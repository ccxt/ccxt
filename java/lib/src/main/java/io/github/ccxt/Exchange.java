package io.github.ccxt;

import java.lang.reflect.Field;
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
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.util.concurrent.ExecutionException;
import java.security.SecureRandom;

import io.github.ccxt.base.Crypto;
import io.github.ccxt.base.Encode;
import io.github.ccxt.base.JsonHelper;
import io.github.ccxt.base.NumberHelpers;
import io.github.ccxt.base.SafeMethods;
import io.github.ccxt.base.Time;
import io.github.ccxt.base.Precise;
import io.github.ccxt.base.Misc;
import io.github.ccxt.base.Strings;
import io.github.ccxt.errors.*;
import java.util.Random;
import java.lang.reflect.Constructor;



public class Exchange {

    public Object timeout = 10000; // default timeout 10s
    // If you have these constants elsewhere, remove these placeholders.
    // HTTP
    public HttpClient httpClient;                         // no default (like C#)
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
    public boolean marketsLoaded = false;

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

    public long paddingMode = NO_PADDING;

    public Object number = Float.class;                   // C# typeof(float) → Java Class<?> for Float
    public Map<String, Object> has = new HashMap<>();
    public Map<String, Object> features = new HashMap<>();
    public Map<String, Object> options = new HashMap<>();
    public boolean isSandboxModeEnabled = false;

    public Object markets = null;
    public Object currencies = new HashMap<String, Object>();
    public Object fees = new HashMap<String, Object>();
    public Object requiredCredentials = new HashMap<String, Object>();
    public Object timeframes = new HashMap<String, Object>();
    public double rateLimit;
    public double rollingWindowSize = 60000;
    public String rateLimiterAlgorithm = "leakyBucket";                        // 0.0 by default
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

    private static final SecureRandom secureRandom = new SecureRandom();

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
    public Object token;
    public String login;
    public Object proxy;
    public String agent;
    // public Object timeout = 10000;                         // Integer by autoboxing

    // Last responses
    public Object last_response_headers;
    public Object last_request_headers;
    public Object last_json_response;
    public Object last_http_response;
    public Object last_request_body;
    public Object last_request_url;
    public boolean returnResponseHeaders = false;
    public Map<String, Object> headers = new HashMap<>();
    public Object httpExceptions;

    public Object httpProxy = null;
    public Object httpsProxy = null;
    public Object http_proxy = null;
    public Object https_proxy = null;
    public Object socksProxy = null;
    public Object socks_proxy = null;
    public Object wsSocksProxy = null;
    public Object ws_socks_proxy = null;
    public Object wsProxy = null;
    public Object wssProxy = null;

    public Object httpsProxyCallback = null;
    public Object https_proxy_callback = null;
    public Object proxyUrlCallback = null;
    public Object socksProxyCallback = null;
    public Object socks_proxy_callback = null;
    public Object httpProxyCallback = null;
    public Object http_proxy_callback = null;
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
    public Object clients = new ConcurrentHashMap<String, Object>();

    // regular maps / misc
    public Object transactions = new LinkedHashMap<String, Object>();
    public Object myTrades;          // left as Object to mirror the C# field
    public Object orders;
    public Object triggerOrders;
    public boolean newUpdates;
    public Object positions;

    // properties that had { get; set; } in C#
    // public Object wssProxy = null;
    public Object wss_proxy = null;
    // public Object wsProxy = null;
    public Object ws_proxy = null;

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

    // public Object isSandboxModeEnabled = false;

    // RL related
    public Object tokenBucket = null;
    public Long MAX_VALUE = Long.MAX_VALUE;

    // Dictionary<string, object> streaming { get; set; } = new dict();
    private Map<String, Object> streaming = new LinkedHashMap<>();


    // --- Construtor -- //

    private void initExchange(Object userConfig) {
        Map<String, Object>  defaultConfig;

        if (userConfig != null) {
            defaultConfig = (Map<String, Object>) userConfig;
        } else {
            defaultConfig = new HashMap<String, Object>();
        }
        System.setProperty("java.net.preferIPv4Stack", "true");
        this.initHttpClient();
        this.initializeProperties(defaultConfig);
        this.afterConstruct();
        this.transformApiNew(this.api, new ArrayList<>());
    }

    // add to derived files constructor that calls base constructor with userConfig
    public Exchange (Object userConfig) {
        this.initExchange(userConfig);
    }

    public Exchange() {
        this.initExchange(null);
    }

    public void initializeProperties(Map<String, Object> userConfig) {

        var properties = this.describe();
        Map<String, Object> extendedProperties = this.deepExtend(properties, userConfig);

        this.version = SafeMethods.SafeStringTyped(extendedProperties, "version", "");

        // credentials init
        this.requiredCredentials = (Map<String, Object>) SafeMethods.SafeValue(extendedProperties, "requiredCredentials");
        this.apiKey        = SafeMethods.SafeStringTyped(extendedProperties, "apiKey", "");
        this.secret        = SafeMethods.SafeStringTyped(extendedProperties, "secret", "");
        this.password      = SafeMethods.SafeStringTyped(extendedProperties, "password", "");
        this.login         = SafeMethods.SafeStringTyped(extendedProperties, "login", "");
        this.twofa         = SafeMethods.SafeStringTyped(extendedProperties, "twofa", "");
        this.privateKey    = SafeMethods.SafeStringTyped(extendedProperties, "privateKey", "");
        this.walletAddress = SafeMethods.SafeStringTyped(extendedProperties, "walletAddress", "");
        this.token         = SafeMethods.SafeStringTyped(extendedProperties, "token", "");
        this.uid           = SafeMethods.SafeStringTyped(extendedProperties, "uid", "");
        this.accountId     = SafeMethods.SafeStringTyped(extendedProperties, "accountId", "");

        var userAgentRes = this.safeValue(extendedProperties, "userAgents", this.userAgents);
        this.userAgents = (Map<String, Object>) userAgentRes;
        this.userAgent  = SafeMethods.SafeStringTyped(extendedProperties, "userAgent", "");
        long timeoutTmp = SafeMethods.SafeIntegerTyped(extendedProperties, "timeout", 10000);
        this.timeout = (timeoutTmp != 0) ? timeoutTmp : 10000;

        this.id = SafeMethods.SafeStringTyped(extendedProperties, "id", "");

        Boolean aliasTmp = (Boolean) this.safeValue(extendedProperties, "alias", Boolean.FALSE);
        this.alias = (aliasTmp != null) ? aliasTmp : false;

        this.api       = (Map<String, Object>) this.safeValue(extendedProperties, "api");
        this.hostname  = SafeMethods.SafeStringTyped(extendedProperties, "hostname");
        this.urls      = (Map<String, Object>) this.safeValue(extendedProperties, "urls");
        this.limits    = (Map<String, Object>) this.safeValue(extendedProperties, "limits");
        this.streaming = (Map<String, Object>) this.safeValue(extendedProperties, "streaming");

        // handle options
        var extendedOptions = this.safeDict(extendedProperties, "options");
        if (extendedOptions != null) {
            extendedOptions = this.deepExtend(this.getDefaultOptions(), extendedOptions);
            this.options = new HashMap<String, Object>((Map<String, Object>)extendedOptions);
        } else {
            var defaults = this.getDefaultOptions();
            this.options = new HashMap<String, Object>((Map<String, Object>)defaults);
        }

        Boolean verboseTmp = (Boolean) this.safeValue(extendedProperties, "verbose", Boolean.FALSE);
        this.verbose = (verboseTmp != null) ? verboseTmp : false;

        this.timeframes = (Map<String, Object>) this.safeValue(extendedProperties, "timeframes", new HashMap<String, Object>());
        this.fees       = (Map<String, Object>) this.safeValue(extendedProperties, "fees");
        this.has        = (Map<String, Object>) this.safeValue(extendedProperties, "has");
        this.httpExceptions = (Map<String, Object>) this.safeValue(extendedProperties, "httpExceptions");
        this.exceptions     = (Map<String, Object>) this.safeValue(extendedProperties, "exceptions");
        this.markets        = (Map<String, Object>) this.safeValue(extendedProperties, "markets");

        var propCurrencies = (Map<String, Object>) this.safeValue(extendedProperties, "currencies");
        if (propCurrencies != null && !propCurrencies.isEmpty()) {
            this.currencies = propCurrencies;
        }

        var rateLimitTmp = SafeMethods.SafeFloat(extendedProperties, "rateLimit", -1.0);
        this.rateLimit = (rateLimitTmp != null) ? rateLimitTmp : -1.0;

        this.rateLimiterAlgorithm = SafeMethods.SafeStringTyped(extendedProperties, "rateLimiterAlgorithm", this.rateLimiterAlgorithm);
        this.rollingWindowSize = SafeMethods.SafeIntegerTyped(extendedProperties, "rollingWindowSize", this.rollingWindowSize);


        this.status = (Map<String, Object>) this.safeValue(extendedProperties, "status");

        var precisionModeTmp = SafeMethods.SafeIntegerTyped(extendedProperties, "precisionMode", this.precisionMode);
        if (precisionModeTmp != 0) {
            this.precisionMode = precisionModeTmp;
        }

        var paddingModeOp = SafeMethods.SafeIntegerTyped(extendedProperties, "paddingMode", this.paddingMode);
        if (paddingModeOp != 0) {
            this.paddingMode = paddingModeOp;
        }

        this.commonCurrencies = (Map<String, Object>) this.safeValue(extendedProperties, "commonCurrencies");

        Object subVal = this.safeValue(extendedProperties, "substituteCommonCurrencyCodes", Boolean.TRUE);
        this.substituteCommonCurrencyCodes = (subVal != null) ? (Boolean) subVal : true;

        // this.name       = SafeMethods.SafeStringTyped(extendedProperties, "name", "");
        this.httpsProxy = SafeMethods.SafeString(extendedProperties, "httpsProxy");
        this.httpProxy  = SafeMethods.SafeString(extendedProperties, "httpProxy");
        this.proxyUrl   = SafeMethods.SafeString(extendedProperties, "proxyUrl");

        Boolean newUpdatesTmp = (Boolean) SafeMethods.SafeValue(extendedProperties, "newUpdates", false);
        this.newUpdates = (newUpdatesTmp != null) ? newUpdatesTmp : true;

        this.accounts = (List<Object>) this.safeValue(extendedProperties, "accounts");
        this.features = (Map<String, Object>) this.safeValue(extendedProperties, "features", this.features);
        Boolean returnHeadersTmp = (Boolean) this.safeValue(extendedProperties, "returnResponseHeaders", Boolean.FALSE);
        this.returnResponseHeaders = (returnHeadersTmp != null) ? returnHeadersTmp : false;
    }

    private void transformApiNew(Map<String, Object> api, List<String> paths) {
        if (api == null) {
            return;
        }

        if (paths == null) {
            paths = new ArrayList<>();
        }

        List<String> keyList = new ArrayList<>(api.keySet());

        for (String key : keyList) {
            Object value = api.get(key);

            if (isHttpMethod(key)) {
                Map<String, Object> dictValue = null;
                List<String> endpoints = null;

                if (value instanceof Map) {
                    dictValue = (Map<String, Object>) value;
                    endpoints = new ArrayList<>(dictValue.keySet());
                } else if (value instanceof List) {
                    // when endpoints are a list of strings
                    endpoints = new ArrayList<>();
                    List<?> listValue = (List<?>) value;
                    for (Object item : listValue) {
                        endpoints.add(String.valueOf(item));
                    }
                }

                if (endpoints == null) {
                    continue;
                }

                for (String endpoint : endpoints) {
                    double cost = 1.0;

                    if (dictValue != null) {
                        Object config = dictValue.get(endpoint);

                        if (config instanceof Map) {
                            Map<String, Object> dictConfig = (Map<String, Object>) config;
                            Object rl = dictConfig.get("cost");
                            if (rl != null) {
                                cost = toDoubleSafe(rl, 1.0);
                            }
                        } else {
                            try {
                                if (config != null) {
                                    cost = toDoubleSafe(config, 1.0);
                                }
                            } catch (Exception ignored) {
                            }
                        }
                    }

                    // split endpoint by non-alphanumeric chars
                    String[] result = endpoint.split("[^a-zA-Z0-9]+");

                    // create unified endpoint name
                    List<String> pathParts = new ArrayList<>();
                    pathParts.addAll(paths);
                    pathParts.add(key);
                    for (String part : result) {
                        if (part != null && !part.isEmpty()) {
                            pathParts.add(part);
                        }
                    }

                    if (pathParts.isEmpty()) {
                        continue; // defensive, should not happen
                    }

                    List<String> completePaths = new ArrayList<>();
                    for (String part : pathParts) {
                        if (part.isEmpty()) continue;
                        String normalized = part.substring(0, 1).toUpperCase() +
                                            (part.length() > 1 ? part.substring(1) : "");
                        completePaths.add(normalized);
                    }

                    StringBuilder sb = new StringBuilder();
                    for (String cp : completePaths) {
                        sb.append(cp);
                    }
                    String path = sb.toString();
                    // lowercase first letter
                    path = path.substring(0, 1).toLowerCase() + path.substring(1);

                    Object apiObj;
                    if (paths.size() > 1) {
                        apiObj = new ArrayList<>(paths); // keep a copy
                    } else if (paths.size() == 1) {
                        apiObj = paths.get(0);
                    } else {
                        apiObj = null; // defensive; original C# would blow up here
                    }

                    Map<String, Object> entry = new HashMap<>();
                    entry.put("method", key.toUpperCase());
                    entry.put("path", endpoint);
                    entry.put("api", apiObj);
                    entry.put("cost", cost);

                    this.transformedApi.put(path, entry);
                }

            } else {
                if (value instanceof Map) {
                    List<String> newPaths = new ArrayList<>(paths);
                    newPaths.add(key);
                    transformApiNew((Map<String, Object>) value, newPaths);
                }
            }
        }
    }


    public static Exchange dynamicallyCreateInstance(String className, Object args) {
        return dynamicallyCreateInstance(className, args, false);
    }

    private double toDoubleSafe(Object val, double defaultValue) {
        if (val == null) {
            return defaultValue;
        }
        if (val instanceof Number) {
            return ((Number) val).doubleValue();
        }
        try {
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return defaultValue;
        }
    }
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

    public String sha1() {  return "sha1"; }
    public String sha256() {  return "sha256"; }
    public String sha384() {return "sha384"; }
    public String sha512() {return "sha512"; }
    public String md5() {return "md5"; }
    public String ed25519() {return "ed25519"; }
    public String keccak() {return "keccak"; }
    public String secp256k1() {return "secp256k1"; }
    public String p256() {return "p256"; }

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

    public Object hash(Object payload, Object algo, Object output) {
        return Crypto.Hash(payload, algo, output);
    }

    public String rsa(Object payload, Object publicKey, Object algo) {
        return Crypto.Rsa(payload, publicKey, algo);
    }

    public Object eddsa(Object payload, Object secret, Object algo) {
        return Crypto.Eddsa(payload, secret, algo);
    }

    public String jwt(Object data, Object secret, Object hash, boolean isRsa, Object options2) {
        return Crypto.Jwt(data, secret, hash, isRsa, (Map<String, Object>)options2);
    }

    public String jwt(Object data, Object secret, Object hash) {
        return Crypto.Jwt(data, secret, hash, false, new HashMap<String, Object> ());
    }

    public String jwt(Object data, Object secret, Object hash, boolean isRsa) {
        return Crypto.Jwt(data, secret, hash, isRsa, new HashMap<String, Object> ());
    }

    public static Map<String, Object> ecdsa(Object request, Object secret, Object curve, Object hash) {
        return Crypto.Ecdsa(request, secret, curve, hash);
    }

    public  Object axolotl(Object a, Object b, Object c) {
        return Crypto.axolotl(a, b, c);
    }

    // public Object md5() {
    //     return Crypto.md5();
    // }

    // public Object sha256() {
    //     return Crypto.sha256();
    // }

    // public Object sha512() {
    //     return Crypto.sha512();
    // }

    // =======================
    // Encode
    // =======================

    public Object binaryConcat(Object... parts) {
        return Encode.binaryConcat(parts);
    }

    public static byte[] base64ToBinary(Object s) {
        return Encode.base64ToBinary(s);
    }

    public String urlencodeBase64(Object s) {
        return Encode.urlencodeBase64(s);
    }

    public static String binaryToBase16(Object buff2) {
        return Encode.binaryToBase16(buff2);
    }

    public static byte[] base58ToBinary(Object pt) {
        return Encode.Base58ToBinary(pt);
    }

    public void Print(Object s) {
        System.out.println(s);
    }

    public Object encode (Object s) {
        return s; // stub
    }

    public String urlencode(Object obj, boolean... sortParams) {
        return Encode.urlencode(obj, sortParams);
    }

    public String urlencodeWithArrayRepeat(Object obj) {
        return Encode.urlencodeWithArrayRepeat(obj);
    }

    public String encodeURIComponent(Object s) {
        return Encode.encodeURIComponent(s);
    }

    public String urlencodeNested(Object parameters) {
        return Encode.urlencodeNested(parameters);
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

    public String rawencode(Object parameters) {
        return Encode.rawencode(parameters, false);
    }

    public String rawencode(Object parameters, Object sort) {
        return Encode.rawencode(parameters, sort);
    }

    public String intToBase16(Object number) {
        return Encode.intToBase16(number);
    }

    public Object base16ToBinary(Object str2) {
        return Encode.base16ToBinary(str2);
    }

    public Object numberToBE(Object n2, Object size2) {
        return Encode.numberToBE(n2, size2);
    }

    public Object remove0xPrefix(Object str2) {
        return Encode.remove0xPrefix(str2);
    }

    public Object binaryConcatArray(Object arrays2) {
        return Encode.binaryConcatArray(arrays2);
    }

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

    public String uuid16() {
        return io.github.ccxt.base.Functions.uuid16();
    }

    public String uuid5() {
        throw new RuntimeException("Not implemented");
    }

    public String uuid5(Object a) {
        throw new RuntimeException("Not implemented");
    }

    public String uuid5(Object a, Object b) {
        throw new RuntimeException("Not implemented");
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
    public java.util.List<Object> sortBy(Object array, Object value1) {
        return io.github.ccxt.base.Generic.sortBy(array, value1, null, null);
    }

    public java.util.List<Object> sortBy(Object array, Object value1, Object desc) {
        return io.github.ccxt.base.Generic.sortBy(array, value1, desc, null);
    }

    public java.util.List<Object> sortBy(Object array, Object value1, Object desc, Object defaultValue) {
        return io.github.ccxt.base.Generic.sortBy(array, value1, desc, defaultValue);
    }

    public java.util.List<Object> sortBy2(Object array, Object key1, Object key2, Object desc) {
        return io.github.ccxt.base.Generic.sortBy2(array, key1, key2, desc);
    }

    public java.util.List<Object> sortBy2(Object array, Object key1, Object key2) {
        return io.github.ccxt.base.Generic.sortBy2(array, key1, key2, null);
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

        public String decimalToPrecision(Object x, Object roundingMode, Object numPrecisionDigits, Object countMode) {
        return NumberHelpers.DecimalToPrecision(x, roundingMode, numPrecisionDigits, countMode, NumberHelpers.NO_PADDING);
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

    public Object safeValue2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeMethods.safeValue2(obj, key1, key2, defaultValue);
    }

    public Object safeValueN(Object obj, Object keys, Object... defaultValue) {
        return SafeMethods.SafeValueN(obj, keys, defaultValue);
    }

    // SafeString / SafeStringN
    public Object safeString(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.SafeString(obj, key, defaultValue);
    }

    public Object safeString2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeMethods.safeString2(obj, key1, key2, defaultValue);
    }

    public Object safeStringN(Object obj, Object keys, Object... defaultValue) {
        return SafeMethods.SafeStringN(obj, keys, defaultValue);
    }

    // SafeInteger / SafeIntegerN  (SafeMethods returns Long)
    public Object safeInteger(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.SafeInteger(obj, key, defaultValue);
    }

    public Object safeInteger2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeMethods.SafeInteger2(obj, key1, key2, defaultValue);
    }

    public Object safeIntegerN(Object obj, Object keys, Object... defaultValue) {
        return SafeMethods.SafeIntegerN(obj, keys, defaultValue);
    }

    public Object safeIntegerProduct(Object obj, Object key, Object multiplier, Object... defaultValue) {
        return SafeMethods.safeIntegerProduct(obj, key, multiplier, defaultValue);
    }

    public Object safeIntegerProduct2(Object obj, Object key1, Object key2, Object multipler, Object... defaultValue) {
        return SafeMethods.safeIntegerProduct2(obj, key1, key2, multipler, defaultValue);
    }

    public Object safeIntegerProductN(Object obj, Object keys, Object multiplier, Object... defaultValue) {
        return SafeMethods.safeIntegerProductN(obj, (List<Object>)keys, multiplier, defaultValue);
    }

    public Object safeStringUpper(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.safeStringUpper(obj, key, defaultValue);
    }

    public Object safeStringUpper2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeMethods.safeStringUpper2(obj, key1, key2, defaultValue);
    }

    public Object safeStringUpperN(Object obj, Object keys, Object... defaultValue) {
        return SafeMethods.safeStringUpperN(obj, keys, defaultValue);
    }

    public Object safeStringLower(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.safeStringLower(obj, key, defaultValue);
    }

    public Object safeStringLower2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeMethods.safeStringLower2(obj, key1, key2, defaultValue);
    }

    public Object safeStringLowerN(Object obj, Object keys, Object... defaultValue) {
        return SafeMethods.safeStringLowerN(obj, keys, defaultValue);
    }

    public Object safeTimestamp(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.safeTimestamp(obj, key, defaultValue);
    }

    public Object safeTimestamp2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeMethods.safeTimestamp2(obj, key1, key2, defaultValue);
    }

    public Object safeTimestampN(Object obj, List<Object> keys, Object... defaultValue) {
        return SafeMethods.safeTimestampN(obj, keys, defaultValue);
    }

    public static Double safeFloat(Object obj, Object key, Object... defaultValue) {
        return SafeMethods.SafeFloat(obj, key, defaultValue);
    }

    public static Double safeFloat2(Object obj, Object key1, Object key2, Object... defaultValue) {
        return SafeMethods.safeFloat2(obj, key1, key2, defaultValue);
    }

    public static Double safeFloatN(Object obj, Object keys, Object... defaultValue) {
        return SafeMethods.safeFloatN(obj, keys, defaultValue);
    }

    // SafeNumber / SafeNumberN
    // (If your SafeMethods.SafeNumber(...) doesn't exist, point this to SafeFloat(...) instead.)
    // public Double safeNumber(Object obj, Object key, Object... defaultValue) {
    //     return (Double) SafeMethods.SafeNumber(obj, key, defaultValue);
    // }
    // public Object safeNumberN(Object obj, Object keys, Object... defaultValue) {
    //     return SafeMethods.SafeNumberN(obj, keys, defaultValue);
    // }
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
    public String capitalize(Object str) {
        return Strings.capitalize(str);
    }

    public String uuid22() {
        return Strings.uuid22();
    }

    public String uuid() {
        return Strings.uuid();
    }

    // =======================
    // Time
    // =======================
    public Long milliseconds() {
        return Time.milliseconds();
    }

    public Long seconds() {
        return Time.seconds();
    }

    public long microseconds() {
        return Time.microseconds();
    }

    public String iso8601(Object timestamp) {
        return Time.Iso8601(timestamp);
    }

    public Long parse8601(Object isoString) {
        return Time.parse8601(isoString);
    }

    public String yymmdd(Object timestamp) {
        return Time.yymmdd(timestamp);
    }

    public String yymmdd(Object timestamp, Object infix) {
        return Time.yymmdd(timestamp, infix);
    }

    public String yyyymmdd(Object timestamp) {
        return Time.yyyymmdd(timestamp);
    }

    public String yyyymmdd(Object timestamp, Object infix) {
        return Time.yyyymmdd(timestamp, infix);
    }

    public String ymdhms(Object ts) {
        return Time.ymdhms(ts);
    }

    public String ymdhms(Object ts, Object infix) {
        return Time.ymdhms(ts, infix);
    }

    public Object ymd(Object ts) {
        return Time.ymd(ts);
    }

    public Object ymd(Object ts, Object infix) {
        return Time.ymd(ts, infix);
    }

    public Object parseDate(Object datetime2) {
        return Time.parseDate(datetime2);
    }
    // public Long nonce() {
    //     return Time.nonce();
    // }

    //=== MISC HELPERS ===//
    public Object roundTimeframe(Object timeframe, Object timestamp) {
        return Misc.roundTimeframe(timeframe, timestamp);
    }

    public Object roundTimeframe(Object timeframe, Object timestamp, Object direction) {
        return Misc.roundTimeframe(timeframe, timestamp, direction);
    }

    public Object implodeParams(Object path2, Object parameter2) {
        return Misc.implodeParams(path2, parameter2);
    }

    // public long parseTimeframe(Object timeframe) {
    //     return Misc.parseTimeframe(timeframe);
    // }
    // ----- END OF WRAPPERS ----- //
    public CompletableFuture<Object> sleep(Object milliseconds) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (milliseconds instanceof Integer) {
                    // milliseconds = Long.valueOf((int) milliseconds);
                    Thread.sleep((Integer) milliseconds);
                } else if (milliseconds instanceof Long) {
                    Thread.sleep((Long) milliseconds);
                } else if (milliseconds instanceof String) {
                    Thread.sleep(Long.valueOf((String) milliseconds));
                } else {
                    throw new IllegalArgumentException("milliseconds must be Integer, Long, or String");
                }
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            return null;
        });
    }

    public HashMap<String, Object> createSafeDictionary() {
        return new HashMap<String, Object>();
    }

    public Map<String, Object> convertToSafeDictionary(Object obj) {
        return (Map<String, Object>) obj; // to do safety checks
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
        int firstInt = toInt(first);

        // ----- byte[] case -----
        if (array instanceof byte[]) {
            byte[] byteArray = (byte[]) array;

            if (second == null) {
                // handle negative first
                int index = firstInt;
                if (firstInt < 0) {
                    index = byteArray.length + firstInt;
                    if (index < 0) {
                        index = 0;
                    }
                }
                // slice [index..end) and return as List<Byte>
                List<Byte> result = new ArrayList<>(byteArray.length - index);
                for (int i = index; i < byteArray.length; i++) {
                    result.add(byteArray[i]);
                }
                return result;
            } else {
                int secondInt = toInt(second);
                // slice [firstInt..secondInt) and return as List<Byte>
                int from = firstInt;
                int to = secondInt;
                if (from < 0 || to < from || to > byteArray.length) {
                    throw new IndexOutOfBoundsException(
                            "Invalid slice range: " + from + ".." + to + " for length " + byteArray.length
                    );
                }
                List<Byte> result = new ArrayList<>(to - from);
                for (int i = from; i < to; i++) {
                    result.add(byteArray[i]);
                }
                return result;
            }
        }

        // ----- List<?> case -----
        if (!(array instanceof List<?>)) {
            throw new IllegalArgumentException("array must be byte[] or List, got: " + array.getClass());
        }

        List<?> parsedArray = (List<?>) array;

        if (second == null) {
            if (firstInt < 0) {
                int index = parsedArray.size() + firstInt;
                if (index < 0) {
                    index = 0;
                }
                // [index..end)
                return new ArrayList<>(parsedArray.subList(index, parsedArray.size()));
            } else {
                // [firstInt..end)
                return new ArrayList<>(parsedArray.subList(firstInt, parsedArray.size()));
            }
        } else {
            int secondInt = toInt(second);
            // [firstInt..secondInt)
            return new ArrayList<>(parsedArray.subList(firstInt, secondInt));
        }
    }

    private static int toInt(Object value) {
        if (value == null) {
            throw new IllegalArgumentException("Index argument cannot be null");
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.parseInt(value.toString());
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

    public static Double parseNumber(Object value, Object defaultValue) {
        if (value == null) {
//            return (Double) defaultValue;
            if (defaultValue == null) {
                return null;
            }
            return Double.parseDouble(defaultValue.toString());
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
                return (Double) defaultValue;
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
                    return (Double) defaultValue;
                }
            }
        }

        return (Double) defaultValue;
    }

    public Map<String, Object> mapToSafeMap(Object obj) {
        if (obj instanceof Map<?, ?>) {
            // Optionally, you could validate keys are Strings here.
            @SuppressWarnings("unchecked")
            Map<String, Object> casted = (Map<String, Object>) obj;
            return casted;
        }
        return null;
    }

    public void log(Object s) {
        System.out.println(String.valueOf(s));
    }

    public String totp(Object a) {
        return "";
    }

    public Object parseJson(Object input) {
        return Helpers.parseJson(input);
    }

    public java.util.concurrent.CompletableFuture<Object> loadMarketsHelper(boolean reload) throws ExecutionException, InterruptedException {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            if (!reload && this.markets != null) {
                if (this.markets_by_id == null) {
                    return this.setMarkets(this.markets);
                }
                return this.markets;
            }

            Object currencies = null;
            if (this.has != null && this.has.containsKey("fetchCurrencies") && (Boolean) this.has.get("fetchCurrencies")) {
                try {
                    currencies = this.fetchCurrencies().get();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                } catch (ExecutionException e) {
                    throw new RuntimeException(e);
                }

                this.options.put("cachedCurrencies", currencies);
            }

            Object markets = null;
            try {
                markets = this.fetchMarkets().get();
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            } catch (ExecutionException e) {
                throw new RuntimeException(e);
            }
            this.options.remove("cachedCurrencies");
            return this.setMarkets(markets);
        });

    }

    public java.util.concurrent.CompletableFuture<Object> loadMarkets(Object... args) {

        var reload = (Boolean) Helpers.getArg(args, 0, false);
        if (this.marketsLoaded && !reload) {
            return this.marketsLoading;
        }
        if (!this.reloadingMarkets || reload) {
            // var marketsLoadingFuture = java.util.concurrent
            // this.marketsLoading;
            this.marketsLoading = CompletableFuture.supplyAsync(() -> {
                this.reloadingMarkets = true;
                try {
                    var res = this.loadMarketsHelper(reload);
                    return res.get();
                } catch (ExecutionException e) {
                    throw new RuntimeException(e);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            });
        }
        return this.marketsLoading;
    }

    public CompletableFuture<Object> fetchCurrencies(Object... params) {
        return CompletableFuture.completedFuture(this.currencies);
    }

    public CompletableFuture<Object> fetchMarkets(Object... params) {
        return CompletableFuture.completedFuture(new ArrayList<>(((Map<String, Object>)this.markets).values()));
    }

    public void initThrottler() {
        // to do
    }

    public java.util.concurrent.CompletableFuture<Void> throttle(Object... args) {
        // to do
        return CompletableFuture.completedFuture(null);
    }

    public Object clone(Object s) {
        return s; // check later
    }

    private void initHttpClient() {
        HttpClient builder = HttpClient.newHttpClient();

//        if (this.httpProxy != null && this.httpProxy.toString().length() > 0) {
//            String proxyString = this.httpProxy.toString();
//            java.net.URI proxyUri = java.net.URI.create(proxyString);
//            String host = proxyUri.getHost();
//            int port = (proxyUri.getPort() != -1) ? proxyUri.getPort() : 80;
//            builder.proxy(java.net.ProxySelector.of(new java.net.InetSocketAddress(host, port)));
//        } else if (this.httpsProxy != null && this.httpsProxy.toString().length() > 0) {
//            String proxyString = this.httpsProxy.toString();
//            java.net.URI proxyUri = java.net.URI.create(proxyString);
//            String host = proxyUri.getHost();
//            int port = (proxyUri.getPort() != -1) ? proxyUri.getPort() : 443;
//            builder.proxy(java.net.ProxySelector.of(new java.net.InetSocketAddress(host, port)));
//        } else {
//            builder.proxy(java.net.ProxySelector.of(new java.net.InetSocketAddress("", 0)));
//        }

        this.httpClient = builder;
    }

    public CompletableFuture<Object> fetch(Object url2, Object method2, Object headers2, Object body2) {
        if (this.fetchResponse != null) {
            return CompletableFuture.completedFuture(this.fetchResponse);
        }

        String url = (String) url2;
        String method = (String) method2;
        @SuppressWarnings("unchecked")
        Map<String, Object> headersArg = (headers2 instanceof Map) ? (Map<String, Object>) headers2 : null;
        @SuppressWarnings("unchecked")
        Map<String, Object> headers = (Map<String, Object>) this.extend(this.headers, headersArg);
        String body = (String) body2;

        Object proxyUrlObj = this.checkProxyUrlSettings(url, method, headers, body);
        if (proxyUrlObj != null) {
            String proxyUrl = proxyUrlObj.toString();
            url = proxyUrl + this.urlEncoderForProxyUrl(url).toString();
        }

        if (this.verbose) {
            this.log(
                    "fetch Request:\n"
                    + this.id + " " + method + " " + url
                    + "\nRequestHeaders:\n" + this.json(headers)
                    + "\nRequestBody:\n" + this.json(body) + "\n"
            );
        }

         this.checkProxySettings(url, method, headers, body);

        List<String> headerKeys = new java.util.ArrayList<>(headers.keySet());
        String contentType = "";

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder();
        requestBuilder.uri(URI.create(url));

        if (this.userAgent != null && this.userAgent.length() > 0) {
            requestBuilder.header("User-Agent", this.userAgent);
        }

        for (String key : headerKeys) {
            if (!key.toLowerCase().equals("content-type")) {
                Object v = headers.get(key);
                if (v != null) {
                    requestBuilder.header(key, v.toString());
                }
            } else {
                Object v = headers.get(key);
                if (v != null) {
                    contentType = v.toString();
                }
            }
        }

        final String finalContentType = contentType;
        final String finalMethod = method;
        final String finalUrl = url;
        final Map<String, Object> finalHeaders = headers;

        return CompletableFuture.supplyAsync(() -> {
            HttpResponse<byte[]> response;
            String result;
            try {
                if ("GET".equalsIgnoreCase(finalMethod)) {
                    requestBuilder.GET();
                } else {
                    String ct = finalContentType.isEmpty() ? "application/json" : finalContentType;
                    String requestBody = (body != null) ? body : "";
                    HttpRequest.BodyPublisher publisher = HttpRequest.BodyPublishers.ofString(requestBody, java.nio.charset.StandardCharsets.UTF_8);
                    requestBuilder.header("Content-Type", ct);
                    if ("POST".equalsIgnoreCase(finalMethod)) {
                        requestBuilder.POST(publisher);
                    } else if ("PUT".equalsIgnoreCase(finalMethod)) {
                        requestBuilder.PUT(publisher);
                    } else if ("DELETE".equalsIgnoreCase(finalMethod)) {
                        requestBuilder.method("DELETE", publisher);
                    } else if ("PATCH".equalsIgnoreCase(finalMethod)) {
                        requestBuilder.method("PATCH", publisher);
                    } else {
                        requestBuilder.method(finalMethod, publisher);
                    }
                }

                HttpRequest request = requestBuilder.build();

                response = this.httpClient.send(request, java.net.http.HttpResponse.BodyHandlers.ofByteArray());

                byte[] bodyBytes = response.body();
                List<String> encHeader = response.headers().allValues("Content-Encoding");
                boolean gzip = false;
                for (String encVal : encHeader) {
                    if (encVal.toLowerCase().contains("gzip")) {
                        gzip = true;
                        break;
                    }
                }

                if (gzip) {
                    try (java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(bodyBytes); java.util.zip.GZIPInputStream gis = new java.util.zip.GZIPInputStream(bais); java.io.InputStreamReader isr = new java.io.InputStreamReader(gis, java.nio.charset.StandardCharsets.UTF_8); java.io.BufferedReader br = new java.io.BufferedReader(isr)) {
                        StringBuilder sb = new StringBuilder();
                        String line;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                        }
                        result = sb.toString();
                    } catch (Exception inner) {
                        throw new RuntimeException(inner);
                    }
                } else {
                    result = new String(bodyBytes, java.nio.charset.StandardCharsets.UTF_8);
                }
            } catch (Exception e) {
                if (e instanceof java.net.http.HttpTimeoutException
                        || e instanceof java.net.ConnectException
                        || e instanceof java.net.UnknownHostException
                        || e instanceof java.net.SocketException
                        || e instanceof java.io.IOException) {
                    String errorMessage = this.id + " " + finalMethod + " " + finalUrl + " " + e.getMessage();
                    throw new NetworkError(errorMessage);
                }
                throw new RuntimeException(e);
            }

            Map<String, String> responseHeaders = null;
            int httpStatusCode = -1;
            String httpStatusText = null;

            try {
                Map<String, List<String>> map = response.headers().map();
                responseHeaders = new java.util.HashMap<>();
                for (Map.Entry<String, List<String>> entry : map.entrySet()) {
                    if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                        responseHeaders.put(entry.getKey(), entry.getValue().get(0));
                    }
                }
                this.last_response_headers = responseHeaders;
                this.last_request_headers = finalHeaders;
                httpStatusCode = response.statusCode();
                httpStatusText = null;
            } catch (Exception ignored) {
            }

            if (this.verbose) {
                this.log(
                        "handleRestResponse:\n"
                        + this.id + " " + finalMethod + " " + finalUrl + " " + httpStatusCode + " " + httpStatusText
                        + "\nResponseHeaders:\n" + this.json(responseHeaders)
                        + "\nResponseBody:\n" + result + "\n"
                );
            }

            Object responseBody;
            try {
                responseBody = JsonHelper.deserialize(result);
                if (this.returnResponseHeaders && responseBody instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> dict = (Map<String, Object>) responseBody;
                    dict.put("headers", responseHeaders);
                    responseBody = dict;
                }
            } catch (Exception parseErr) {
                responseBody = result;
            }

            Object res = handleErrors(httpStatusCode, httpStatusText, finalUrl, finalMethod, responseHeaders, result, responseBody, finalHeaders, body);
            if (res == null) {
                handleHttpStatusCode(httpStatusCode, httpStatusText, finalUrl, finalMethod, result);
            }

            return responseBody;
        });
    }

    public CompletableFuture<Object> fetch(Object url2, Object method2, Object headers2) {
        return fetch(url2, method2, headers2, null);
    }

    public CompletableFuture<Object> fetch(Object url2, Object method2) {
        return fetch(url2, method2, null, null);
    }

    public CompletableFuture<Object> fetch(Object url2) {
        return fetch(url2, null, null, null);
    }

    public void handleHttpStatusCode(Object code, Object reason, Object url, Object method, Object body) {
        String codeString = String.valueOf(code);

        Object codeInHttpExceptions = this.safeValue(this.httpExceptions, codeString);
        if (codeInHttpExceptions != null) {
            String errorMessage
                    = this.id + " "
                    + String.valueOf(method) + " "
                    + String.valueOf(url) + " "
                    + codeString + " "
                    + String.valueOf(reason) + " "
                    + String.valueOf(body);

            Throwable ex;
            if (codeInHttpExceptions instanceof Class) {
                Class<?> exClass = (Class<?>) codeInHttpExceptions;
                ex = newException(exClass, errorMessage);
            } else {
                ex = new RuntimeException(errorMessage);
            }

            if (ex instanceof RuntimeException) {
                throw (RuntimeException) ex;
            }
            throw new RuntimeException(ex);
        }
    }

    private Throwable newException(Class<?> exClass, String message) {
        try {
            try {
                var ctor = exClass.getDeclaredConstructor(String.class);
                ctor.setAccessible(true);
                Object obj = ctor.newInstance(message);
                if (obj instanceof Throwable) {
                    return (Throwable) obj;
                }
            } catch (NoSuchMethodException ignored) {
            }

            var defaultCtor = exClass.getDeclaredConstructor();
            defaultCtor.setAccessible(true);
            Object obj = defaultCtor.newInstance();
            if (obj instanceof Throwable) {
                return (Throwable) obj;
            }

            return new RuntimeException(message);
        } catch (Exception e) {
            return new RuntimeException(message, e);
        }
    }

    public CompletableFuture<Object> callAsync(Object implicitEndpoint2, Object... args) {
        // First optional arg is "parameters"
        Object parameters = (args != null && args.length > 0) ? args[0] : null;

        if (parameters == null) {
            parameters = new HashMap<String, Object>();
        }

        String implicitEndpoint = (String) implicitEndpoint2;

        Object info = this.transformedApi.get(implicitEndpoint);
        if (info instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> endpointInfo = (Map<String, Object>) info;

            String method = (String) endpointInfo.get("method");
            String path   = (String) endpointInfo.get("path");
            Object api    = endpointInfo.get("api");

            Object costObj = endpointInfo.get("cost");
            Object cost = (costObj != null) ? costObj : 1;

            Map<String, Object> emptyMap = new HashMap<>();
            Map<String, Object> costMap  = new HashMap<>();
            costMap.put("cost", cost);

            // body = null here, same as in your C# comment
            // try {
            return this.fetch2(path, api, method, parameters, emptyMap, null, costMap);
                // return CompletableFuture.completedFuture(res);
            // } catch (Exception e) {
            //     // throw e;
            // }

        }

        CompletableFuture<Object> failed = new CompletableFuture<>();
        failed.completeExceptionally(new RuntimeException("Endpoint not found!"));
        return failed;
    }

    public boolean isEmpty(Object a) {
        if (a == null) {
            return true;
        }
        if (a instanceof String) {
            return ((String) a).isEmpty();
        }
        if (a instanceof java.util.List) {
            return ((java.util.List<?>) a).isEmpty();
        }
        if (a instanceof java.util.Map) {
            return ((java.util.Map<?, ?>) a).isEmpty();
        }
        return false;
    }

    public static void setProperty(Object obj, Object property, Object defaultValue) {
        if (obj == null || property == null) {
            return;
        }

        try {
            Class<?> clazz = obj.getClass();
            String propName = property.toString();

            try {
                java.lang.reflect.Field field = clazz.getDeclaredField(propName);
                field.setAccessible(true);
                field.set(obj, defaultValue);
                return;
            } catch (NoSuchFieldException ignored) {}

        }
        catch (Exception e) {
        }
    }

    public String fixStringifiedJsonMembers(Object content) {
        String str = (String)content;
        str = str.replace("\\", "");
        str = str.replace("\"{", "{");
        str = str.replace("}\"", "}");
        return str;
    }

    public String randomBytes(int length) {

        if (length <= 0) {
            throw new IllegalArgumentException("length must be greater than 0");
        }

        byte[] x = new byte[length];
        secureRandom.nextBytes(x);

        return bytesToHex(x);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public Object ethEncodeStructuredData(Object domain2, Object messageTypes2, Object messageData2) {
        // throw new RuntimeException("Not implemented");
        return ""; // to do later
    }

    public Object packb(Object data) {
        // throw new RuntimeException("Not implemented");
//        return ""; // to do later
        byte[] res = {};
        return res;
    }

    public int binaryLength(Object binary) {
        if (binary instanceof byte[]) {
            return ((byte[]) binary).length;

        } else if (binary instanceof String) {
            return ((String) binary).length();

        } else {
            throw new IllegalArgumentException(
                "unsupported binary: " + binary.getClass()
            );
        }
    }

    public Object ethAbiEncode(Object types2, Object args2)
    {
        // throw new RuntimeException("not implemented");
        return ""; // to do later
    }

    public Object starknetEncodeStructuredData(Object domain2, Object messageTypes2, Object messageData2, Object address)
    {
        // throw new RuntimeException("Not implemented");
        return ""; // to do later
    }

    public Object starknetSign(Object msgHash, Object privateKey)
    {
        // throw new RuntimeException("Not implemented");
        return ""; // to do later
    }

    // public Object starknetEncodeStructuredData(Object domain2, Object messageTypes2, Object messageData2, Object address)
    // {
    //     throw new RuntimeException("Not implemented");
    // }

    public Object retrieveStarkAccount(Object signature, Object accountClassHash, Object accountProxyClassHash)
    {
        // throw new RuntimeException("Not implemented");
        return "";
    }

    public void checkRequiredDependencies()
    {
        // stub to implement later
    }

    public Object retrieveDydxCredentials(Object entropy)
    {
        // throw new RuntimeException("Dydx currently does not support create order / transfer asset in java language");
        return "";
    }

    public int randNumber(int size) {
        Random random = new Random();
        StringBuilder number = new StringBuilder();

        for (int i = 0; i < size; i++) {
            number.append(random.nextInt(10)); // 0–9
        }

        return Integer.parseInt(number.toString());
    }

    public CompletableFuture<Void> loadDydxProtos()
    {
        throw new RuntimeException("Dydx currently does not support create order / transfer asset in java language");
    }

    public Object encodeDydxTxForSimulation(
        Object message,
        Object memo,
        Object sequence,
        Object publicKey)
    {
        throw new RuntimeException("Dydx currently does not support create order / transfer asset in java language");
    }

    public Long toDydxLong(Object numStr)
    {
        throw new RuntimeException("Dydx currently does not support create order / transfer asset in java language");
    }

    public Object encodeDydxTxForSigning(
        Object message,
        Object memo,
        Object chainId,
        Object account,
        Object authenticators,
        Object fee)
    {
        throw new RuntimeException("Dydx currently does not support create order / transfer asset in java language");
    }

    public Object encodeDydxTxRaw(Object signDoc, Object signature)
    {
        throw new RuntimeException("Dydx currently does not support create order / transfer asset in java language");
    }

    public CompletableFuture<Void> getZKTransferSignatureObj(Object seed, Object parameters)
    {
        throw new RuntimeException("Apex currently does not support create order in java language");
    }

    public CompletableFuture<Void> getZKContractSignatureObj(Object seed, Object parameters)
    {
        throw new RuntimeException("Apex currently does not support create order in java language");
    }

    public String strip(Object str) {
        var str2 = (String)str;
        return str2.trim();
    }

    public String decode(Object str) {
        return (String)str;
    }

    public Object binaryToBase58(Object buff2) {
        byte[] buff = (byte[])buff2;
        return Crypto.binaryToHex(buff);
    }

    public Object toFixed(Object number, Object decimals) {
        double num = ((Number) number).doubleValue();
        int dec = ((Number) decimals).intValue();
        double factor = Math.pow(10, dec);
        return Math.round(num * factor) / factor;
    }

    public static Object getProperty(Object obj, Object property, Object defaultValue) {
        if (obj == null || property == null) {
            return defaultValue;
        }

        try {
            Field field = obj.getClass().getDeclaredField(property.toString());
            field.setAccessible(true);
            return field.get(obj);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            return defaultValue;
        }
    }

    public static Object getProperty(Object obj, Object property) {
        return Exchange.getProperty(obj, property, null);
    }

    public void setFetchResponse(Object response) {
        this.fetchResponse = response;
    }

    public static Exchange dynamicallyCreateInstance(String className, Object args, boolean isWs) {
        if (className == null || className.trim().isEmpty()) return null;

        String EXCHANGES_PKG = "io.github.ccxt.exchanges.";

        String name = className.trim();

        name = name.substring(0, 1).toUpperCase() + name.substring(1);

        String fqcn = EXCHANGES_PKG + name;

        if (args == null) args = new HashMap<String, Object>();

        try {
            Class<?> clazz = Class.forName(fqcn);

            if (!Exchange.class.isAssignableFrom(clazz)) return null;

            // Prefer ctor(Object)
            try {
                Constructor<?> ctor = clazz.getConstructor(Object.class);
                return (Exchange) ctor.newInstance(args);
            } catch (NoSuchMethodException ignored) {}

            // Try ctor(Map)
            if (args instanceof Map) {
                try {
                    @SuppressWarnings("rawtypes")
                    Constructor<?> ctor = clazz.getConstructor(Map.class);
                    return (Exchange) ctor.newInstance(args);
                } catch (NoSuchMethodException ignored) {}
            }

            // Fallback no-arg ctor
            try {
                Constructor<?> ctor = clazz.getConstructor();
                return (Exchange) ctor.newInstance();
            } catch (NoSuchMethodException ignored) {}

            return null;

        } catch (Exception e) {
            return null;
        }
    }

    public void extendExchangeOptions(Object options) {
        if (options instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> optionsMap = (Map<String, Object>) options;
            this.options = (Map<String, Object>) this.extend(this.options, optionsMap);
        }
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
    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

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
                put( "cancelOrderWithClientOrderId", null );
                put( "cancelOrderWs", null );
                put( "cancelOrders", null );
                put( "cancelOrdersWithClientOrderId", null );
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
                put( "editOrderWithClientOrderId", null );
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
                put( "fetchOrderWithClientOrderId", null );
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
            put( "rollingWindowSize", 60000 );
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
        if (Helpers.isTrue(Helpers.isTrue(((value instanceof java.util.Map))) && !Helpers.isTrue(((value instanceof java.util.List) || (value.getClass().isArray())))))
        {
            return value;
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
        throw new NotSupported((String)Helpers.add(this.id, " handleDelta not supported yet")) ;
    }

    public void handleDeltasWithKeys(Object bookSide, Object deltas, Object... optionalArgs)
    {
        Object priceKey = Helpers.getArg(optionalArgs, 0, 0);
        Object amountKey = Helpers.getArg(optionalArgs, 1, 1);
        Object countOrIdKey = Helpers.getArg(optionalArgs, 2, 2);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(deltas)); i++)
        {
            Object bidAsk = this.parseBidAsk(Helpers.GetValue(deltas, i), priceKey, amountKey, countOrIdKey);
            ((IOrderBookSide)bookSide).storeArray(bidAsk);
        }
    }

    public Object getCacheIndex(Object orderbook, Object deltas)
    {
        // return the first index of the cache that can be applied to the orderbook or -1 if not possible.
        return Helpers.opNeg(1);
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
            throw new InvalidProxySettings((String)Helpers.add(Helpers.add(Helpers.add(this.id, " you have multiple conflicting proxy settings ("), joinedProxyNames), "), please use only one from : proxyUrl, proxy_url, proxyUrlCallback, proxy_url_callback")) ;
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
            throw new InvalidProxySettings((String)Helpers.add(Helpers.add(Helpers.add(this.id, " you have multiple conflicting proxy settings ("), joinedProxyNames), "), please use only one from: httpProxy, httpsProxy, httpProxyCallback, httpsProxyCallback, socksProxy, socksProxyCallback")) ;
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
            throw new InvalidProxySettings((String)Helpers.add(Helpers.add(Helpers.add(this.id, " you have multiple conflicting proxy settings ("), joinedProxyNames), "), please use only one from: wsProxy, wssProxy, wsSocksProxy")) ;
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(wsProxy, wssProxy, wsSocksProxy));
    }

    public void checkConflictingProxies(Object proxyAgentSet, Object proxyUrlSet)
    {
        if (Helpers.isTrue(Helpers.isTrue(proxyAgentSet) && Helpers.isTrue(proxyUrlSet)))
        {
            throw new InvalidProxySettings((String)Helpers.add(this.id, " you have multiple conflicting proxy settings, please use only one from : proxyUrl, httpProxy, httpsProxy, socksProxy")) ;
        }
    }

    public Object checkAddress(Object... optionalArgs)
    {
        Object address = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(address, null)))
        {
            throw new InvalidAddress((String)Helpers.add(this.id, " address is undefined")) ;
        }
        // check the address is not the same letter like 'aaaaa' nor too short nor has a space
        Object uniqChars = (this.unique(this.stringToCharsArray(address)));
        Object length = Helpers.getArrayLength(uniqChars); // py transpiler trick
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(length, 1)) || Helpers.isTrue(Helpers.isLessThan(((String)address).length(), this.minFundingAddressLength))) || Helpers.isTrue(Helpers.isGreaterThan(Helpers.getIndexOf(address, " "), Helpers.opNeg(1)))))
        {
            throw new InvalidAddress((String)Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(this.id, " address is invalid or has less than "), String.valueOf(this.minFundingAddressLength)), " characters: \""), String.valueOf(address)), "\"")) ;
        }
        return address;
    }

    public Object findMessageHashes(Client client, Object element)
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
                        array = this.arraySlice(array, Helpers.opNeg(limit));
                    }
                } else
                {
                    if (Helpers.isTrue(ascending))
                    {
                        array = this.arraySlice(array, Helpers.opNeg(limit));
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
            return this.arraySlice(result, Helpers.opNeg(limit));
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
            return this.arraySlice(result, Helpers.opNeg(limit));
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
                throw new NotSupported((String)Helpers.add(this.id, " does not have a sandbox URL")) ;
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
            throw new NotSupported((String)Helpers.add(this.id, " demo trading does not support in sandbox environment. Please check https://www.binance.com/en/support/faq/detail/9be58f73e5e14338809e3b705b9687dd to see the differences")) ;
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
            throw new NotSupported((String)Helpers.add(this.id, " fetchAccounts() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTrades(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTradesWs(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTradesWs() is not supported yet")) ;
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
            throw new NotSupported((String)Helpers.add(this.id, " watchLiquidations() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchLiquidationsForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchLiquidationsForSymbols() is not supported yet")) ;
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
            throw new NotSupported((String)Helpers.add(this.id, " watchMyLiquidations() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMyLiquidationsForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchMyLiquidationsForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTrades(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchTrades(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTradesForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchTradesForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchTradesForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchTradesForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMyTradesForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchMyTradesForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrdersForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchOrdersForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOHLCVForSymbols(Object symbolsAndTimeframes, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchOHLCVForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchOHLCVForSymbols(Object symbolsAndTimeframes, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchOHLCVForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrderBookForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchOrderBookForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchOrderBookForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchOrderBookForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchPositions(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchPositions() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchTicker(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchTicker() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchMarkPrice(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchMarkPrice() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchMarkPrices(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchMarkPrices() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchDepositAddresses(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object codes = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchDepositAddresses() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderBook(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrderBook() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderBookWs(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrderBookWs() is not supported yet")) ;
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
                throw new NotSupported((String)Helpers.add(this.id, " fetchMarginMode() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMarginModes(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchMarginModes () is not supported yet")) ;
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
            throw new NotSupported((String)Helpers.add(this.id, " watchOrderBook() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchOrderBook(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchOrderBook() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTime(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTime() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTradingLimits(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTradingLimits() is not supported yet")) ;
        });

    }

    public Object parseCurrency(Object rawCurrency)
    {
        throw new NotSupported((String)Helpers.add(this.id, " parseCurrency() is not supported yet")) ;
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
        throw new NotSupported((String)Helpers.add(this.id, " parseMarket() is not supported yet")) ;
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
        throw new NotSupported((String)Helpers.add(this.id, " parseTicker() is not supported yet")) ;
    }

    public Object parseDepositAddress(Object depositAddress, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseDepositAddress() is not supported yet")) ;
    }

    public Object parseTrade(Object trade, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseTrade() is not supported yet")) ;
    }

    public Object parseTransaction(Object transaction, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseTransaction() is not supported yet")) ;
    }

    public Object parseTransfer(Object transfer, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseTransfer() is not supported yet")) ;
    }

    public Object parseAccount(Object account)
    {
        throw new NotSupported((String)Helpers.add(this.id, " parseAccount() is not supported yet")) ;
    }

    public Object parseLedgerEntry(Object item, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseLedgerEntry() is not supported yet")) ;
    }

    public Object parseOrder(Object order, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseOrder() is not supported yet")) ;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchCrossBorrowRates(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchCrossBorrowRates() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchIsolatedBorrowRates(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchIsolatedBorrowRates() is not supported yet")) ;
        });

    }

    public Object parseMarketLeverageTiers(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseMarketLeverageTiers() is not supported yet")) ;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchLeverageTiers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchLeverageTiers() is not supported yet")) ;
        });

    }

    public Object parsePosition(Object position, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parsePosition() is not supported yet")) ;
    }

    public Object parseFundingRateHistory(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseFundingRateHistory() is not supported yet")) ;
    }

    public Object parseBorrowInterest(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseBorrowInterest() is not supported yet")) ;
    }

    public Object parseIsolatedBorrowRate(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseIsolatedBorrowRate() is not supported yet")) ;
    }

    public Object parseWsTrade(Object trade, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseWsTrade() is not supported yet")) ;
    }

    public Object parseWsOrder(Object order, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseWsOrder() is not supported yet")) ;
    }

    public Object parseWsOrderTrade(Object trade, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseWsOrderTrade() is not supported yet")) ;
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
            throw new NotSupported((String)Helpers.add(this.id, " fetchFundingRates() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchFundingIntervals(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchFundingIntervals() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchFundingRate(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchFundingRate() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchFundingRates(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchFundingRates() is not supported yet")) ;
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
            throw new NotSupported((String)Helpers.add(this.id, " transfer() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> withdraw(Object code, Object amount, Object address, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object tag = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " withdraw() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createDepositAddress(Object code, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createDepositAddress() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> setLeverage(Object leverage, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " setLeverage() is not supported yet")) ;
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
                throw new NotSupported((String)Helpers.add(this.id, " fetchLeverage() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchLeverages(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchLeverages() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> setPositionMode(Object hedged, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " setPositionMode() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> addMargin(Object symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " addMargin() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> reduceMargin(Object symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " reduceMargin() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> setMargin(Object symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " setMargin() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchLongShortRatio(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object timeframe = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchLongShortRatio() is not supported yet")) ;
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
            throw new NotSupported((String)Helpers.add(this.id, " fetchLongShortRatioHistory() is not supported yet")) ;
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
            throw new NotSupported((String)Helpers.add(this.id, " fetchMarginAdjustmentHistory() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> setMarginMode(Object marginMode, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " setMarginMode() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchDepositAddressesByNetwork(Object code, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchDepositAddressesByNetwork() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenInterestHistory(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object timeframe = Helpers.getArg(optionalArgs, 0, "1h");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOpenInterestHistory() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenInterest(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOpenInterest() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenInterests(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOpenInterests() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> signIn(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " signIn() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPaymentMethods(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPaymentMethods() is not supported yet")) ;
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
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(this.rateLimit, null)) || Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(this.id, null)) && Helpers.isTrue(Helpers.isEqual(this.rateLimit, Helpers.opNeg(1)))))))
        {
            throw new ExchangeError((String)Helpers.add(this.id, ".rateLimit property is not configured")) ;
        }
        Object refillRate = this.MAX_VALUE;
        if (Helpers.isTrue(Helpers.isGreaterThan(this.rateLimit, 0)))
        {
            refillRate = Helpers.divide(1, this.rateLimit);
        }
        Object useLeaky = Helpers.isTrue((Helpers.isEqual(this.rollingWindowSize, 0))) || Helpers.isTrue((Helpers.isEqual(this.rateLimiterAlgorithm, "leakyBucket")));
        Object algorithm = ((Helpers.isTrue(useLeaky))) ? "leakyBucket" : "rollingWindow";
        final Object finalRefillRate = refillRate;
        Object defaultBucket = new java.util.HashMap<String, Object>() {{
            put( "delay", 0.001 );
            put( "capacity", 1 );
            put( "cost", 1 );
            put( "refillRate", finalRefillRate );
            put( "algorithm", algorithm );
            put( "windowSize", Exchange.this.rollingWindowSize );
            put( "rateLimit", Exchange.this.rateLimit );
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
                    Helpers.addElementToObject(this.features, marketType, this.featuresMapper(initialFeatures, marketType));
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
        * @param {string} [paramName] unified param value, like: `triggerPrice`, `stopLoss.triggerPrice` (check docs for supported param names)
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
        if (Helpers.isTrue(Helpers.isEqual(marketType, null)))
        {
            return defaultValue;  // marketType is required
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
            return ((Helpers.isTrue((!Helpers.isEqual(defaultValue, null))))) ? defaultValue : methodsContainer;
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
            return ((Helpers.isTrue((!Helpers.isEqual(defaultValue, null))))) ? defaultValue : methodDict;
        }
        Object splited = Helpers.split(paramName, "."); // can be only parent key (`stopLoss`) or with child (`stopLoss.triggerPrice`)
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
        final Object finalDirection = direction;
        final Object finalCurrency = currency;
        final Object finalAmount = amount;
        final Object finalBefore = before;
        final Object finalAfter = after;
        final Object finalFee = fee;
        return new java.util.HashMap<String, Object>() {{
            put( "id", Exchange.this.safeString(entry, "id") );
            put( "timestamp", timestamp );
            put( "datetime", Exchange.this.iso8601(timestamp) );
            put( "direction", finalDirection );
            put( "account", Exchange.this.safeString(entry, "account") );
            put( "referenceId", Exchange.this.safeString(entry, "referenceId") );
            put( "referenceAccount", Exchange.this.safeString(entry, "referenceAccount") );
            put( "type", Exchange.this.safeString(entry, "type") );
            put( "currency", Helpers.GetValue(finalCurrency, "code") );
            put( "amount", Exchange.this.parseNumber(finalAmount) );
            put( "before", Exchange.this.parseNumber(finalBefore) );
            put( "after", Exchange.this.parseNumber(finalAfter) );
            put( "status", Exchange.this.safeString(entry, "status") );
            put( "fee", finalFee );
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

    public Object setMarketsFromExchange(Exchange sourceExchange)
    {
        // Validate that both exchanges are of the same type
        if (Helpers.isTrue(!Helpers.isEqual(this.id, sourceExchange.id)))
        {
            throw new ArgumentsRequired((String)Helpers.add(Helpers.add(Helpers.add(this.id, " shareMarkets() can only share markets with exchanges of the same type (got "), Helpers.GetValue(sourceExchange, "id")), ")")) ;
        }
        // Validate that source exchange has loaded markets
        if (!Helpers.isTrue(sourceExchange.markets))
        {
            throw new ExchangeError((String)"setMarketsFromExchange() source exchange must have loaded markets first. Can call by using loadMarkets function") ;
        }
        // Set all market-related data
        this.markets = sourceExchange.markets;
        this.markets_by_id = sourceExchange.markets_by_id;
        this.symbols = sourceExchange.symbols;
        this.ids = sourceExchange.ids;
        this.currencies = sourceExchange.currencies;
        this.currencies_by_id = sourceExchange.currencies_by_id;
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
        Object extendedRestDescribe = this.deepExtend(((Exchange)parentRestInstance).describe(), ((Exchange)currentRestInstance).describe());
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
        return balance;
    }

    public Object safeOrder(Object order, Object... optionalArgs)
    {
        // parses numbers as strings
        // * it is important pass the trades as unparsed rawTrades
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object amount = this.omitZero(this.safeString(order, "amount"));
        Object remaining = this.safeString(order, "remaining");
        Object filled = this.safeString(order, "filled");
        Object cost = this.safeString(order, "cost");
        Object average = this.omitZero(this.safeString(order, "average"));
        Object price = this.omitZero(this.safeString(order, "price"));
        Object lastTradeTimeTimestamp = this.safeInteger(order, "lastTradeTimestamp");
        Object symbol = this.safeString(order, "symbol");
        Object side = this.safeString(order, "side");
        Object status = this.safeString(order, "status");
        Object parseFilled = (Helpers.isEqual(filled, null));
        Object parseCost = (Helpers.isEqual(cost, null));
        Object parseLastTradeTimeTimestamp = (Helpers.isEqual(lastTradeTimeTimestamp, null));
        Object fee = this.safeValue(order, "fee");
        Object parseFee = (Helpers.isEqual(fee, null));
        Object parseFees = Helpers.isEqual(this.safeValue(order, "fees"), null);
        Object parseSymbol = Helpers.isEqual(symbol, null);
        Object parseSide = Helpers.isEqual(side, null);
        Object shouldParseFees = Helpers.isTrue(parseFee) || Helpers.isTrue(parseFees);
        Object fees = this.safeList(order, "fees", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object trades = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object isTriggerOrSLTpOrder = (Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(this.safeString(order, "triggerPrice"), null)) || Helpers.isTrue((!Helpers.isEqual(this.safeString(order, "stopLossPrice"), null))))) || Helpers.isTrue((!Helpers.isEqual(this.safeString(order, "takeProfitPrice"), null))));
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue(parseFilled) || Helpers.isTrue(parseCost)) || Helpers.isTrue(shouldParseFees)))
        {
            Object rawTrades = this.safeValue(order, "trades", trades);
            // const oldNumber = this.number;
            // we parse trades as strings here!
            // i don't think this is needed anymore
            // (this as any).number = String;
            Object firstTrade = this.safeValue(rawTrades, 0);
            // parse trades if they haven't already been parsed
            Object tradesAreParsed = (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(firstTrade, null))) && Helpers.isTrue((Helpers.inOp(firstTrade, "info")))) && Helpers.isTrue((Helpers.inOp(firstTrade, "id"))));
            if (!Helpers.isTrue(tradesAreParsed))
            {
                trades = this.parseTrades(rawTrades, market);
            } else
            {
                trades = rawTrades;
            }
            // this.number = oldNumber; why parse trades as strings if you read the value using `safeString` ?
            Object tradesLength = 0;
            Object isArray = ((trades instanceof java.util.List) || (trades.getClass().isArray()));
            if (Helpers.isTrue(isArray))
            {
                tradesLength = Helpers.getArrayLength(trades);
            }
            if (Helpers.isTrue(Helpers.isTrue(isArray) && Helpers.isTrue((Helpers.isGreaterThan(tradesLength, 0)))))
            {
                // move properties that are defined in trades up into the order
                if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(order, "symbol"), null)))
                {
                    Helpers.addElementToObject(order, "symbol", Helpers.GetValue(Helpers.GetValue(trades, 0), "symbol"));
                }
                if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(order, "side"), null)))
                {
                    Helpers.addElementToObject(order, "side", Helpers.GetValue(Helpers.GetValue(trades, 0), "side"));
                }
                if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(order, "type"), null)))
                {
                    Helpers.addElementToObject(order, "type", Helpers.GetValue(Helpers.GetValue(trades, 0), "type"));
                }
                if (Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(order, "id"), null)))
                {
                    Helpers.addElementToObject(order, "id", Helpers.GetValue(Helpers.GetValue(trades, 0), "order"));
                }
                if (Helpers.isTrue(parseFilled))
                {
                    filled = "0";
                }
                if (Helpers.isTrue(parseCost))
                {
                    cost = "0";
                }
                for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(trades)); i++)
                {
                    Object trade = Helpers.GetValue(trades, i);
                    Object tradeAmount = this.safeString(trade, "amount");
                    if (Helpers.isTrue(Helpers.isTrue(parseFilled) && Helpers.isTrue((!Helpers.isEqual(tradeAmount, null)))))
                    {
                        filled = Precise.stringAdd(filled, tradeAmount);
                    }
                    Object tradeCost = this.safeString(trade, "cost");
                    if (Helpers.isTrue(Helpers.isTrue(parseCost) && Helpers.isTrue((!Helpers.isEqual(tradeCost, null)))))
                    {
                        cost = Precise.stringAdd(cost, tradeCost);
                    }
                    if (Helpers.isTrue(parseSymbol))
                    {
                        symbol = this.safeString(trade, "symbol");
                    }
                    if (Helpers.isTrue(parseSide))
                    {
                        side = this.safeString(trade, "side");
                    }
                    Object tradeTimestamp = this.safeValue(trade, "timestamp");
                    if (Helpers.isTrue(Helpers.isTrue(parseLastTradeTimeTimestamp) && Helpers.isTrue((!Helpers.isEqual(tradeTimestamp, null)))))
                    {
                        if (Helpers.isTrue(Helpers.isEqual(lastTradeTimeTimestamp, null)))
                        {
                            lastTradeTimeTimestamp = tradeTimestamp;
                        } else
                        {
                            lastTradeTimeTimestamp = Helpers.mathMax(lastTradeTimeTimestamp, tradeTimestamp);
                        }
                    }
                    if (Helpers.isTrue(shouldParseFees))
                    {
                        Object tradeFees = this.safeValue(trade, "fees");
                        if (Helpers.isTrue(!Helpers.isEqual(tradeFees, null)))
                        {
                            for (var j = 0; Helpers.isLessThan(j, Helpers.getArrayLength(tradeFees)); j++)
                            {
                                Object tradeFee = Helpers.GetValue(tradeFees, j);
                                ((java.util.List<Object>)fees).add(this.extend(new java.util.HashMap<String, Object>() {{}}, tradeFee));
                            }
                        } else
                        {
                            Object tradeFee = this.safeValue(trade, "fee");
                            if (Helpers.isTrue(!Helpers.isEqual(tradeFee, null)))
                            {
                                ((java.util.List<Object>)fees).add(this.extend(new java.util.HashMap<String, Object>() {{}}, tradeFee));
                            }
                        }
                    }
                }
            }
        }
        if (Helpers.isTrue(shouldParseFees))
        {
            Object reducedFees = ((Helpers.isTrue(this.reduceFees))) ? this.reduceFeesByCurrency(fees) : fees;
            Object reducedLength = Helpers.getArrayLength(reducedFees);
            for (var i = 0; Helpers.isLessThan(i, reducedLength); i++)
            {
                Helpers.addElementToObject(Helpers.GetValue(reducedFees, i), "cost", this.safeNumber(Helpers.GetValue(reducedFees, i), "cost"));
                if (Helpers.isTrue(Helpers.inOp(Helpers.GetValue(reducedFees, i), "rate")))
                {
                    Helpers.addElementToObject(Helpers.GetValue(reducedFees, i), "rate", this.safeNumber(Helpers.GetValue(reducedFees, i), "rate"));
                }
            }
            if (Helpers.isTrue(!Helpers.isTrue(parseFee) && Helpers.isTrue((Helpers.isEqual(reducedLength, 0)))))
            {
                // copy fee to avoid modification by reference
                Object feeCopy = this.deepExtend(fee);
                Helpers.addElementToObject(feeCopy, "cost", this.safeNumber(feeCopy, "cost"));
                if (Helpers.isTrue(Helpers.inOp(feeCopy, "rate")))
                {
                    Helpers.addElementToObject(feeCopy, "rate", this.safeNumber(feeCopy, "rate"));
                }
                ((java.util.List<Object>)reducedFees).add(feeCopy);
            }
            Helpers.addElementToObject(order, "fees", reducedFees);
            if (Helpers.isTrue(Helpers.isTrue(parseFee) && Helpers.isTrue((Helpers.isEqual(reducedLength, 1)))))
            {
                Helpers.addElementToObject(order, "fee", Helpers.GetValue(reducedFees, 0));
            }
        }
        if (Helpers.isTrue(Helpers.isEqual(amount, null)))
        {
            // ensure amount = filled + remaining
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(filled, null)) && Helpers.isTrue(!Helpers.isEqual(remaining, null))))
            {
                amount = Precise.stringAdd(filled, remaining);
            } else if (Helpers.isTrue(Helpers.isEqual(status, "closed")))
            {
                amount = filled;
            }
        }
        if (Helpers.isTrue(Helpers.isEqual(filled, null)))
        {
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(amount, null)) && Helpers.isTrue(!Helpers.isEqual(remaining, null))))
            {
                filled = Precise.stringSub(amount, remaining);
            } else if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(status, "closed")) && Helpers.isTrue(!Helpers.isEqual(amount, null))))
            {
                filled = amount;
            }
        }
        if (Helpers.isTrue(Helpers.isEqual(remaining, null)))
        {
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(amount, null)) && Helpers.isTrue(!Helpers.isEqual(filled, null))))
            {
                remaining = Precise.stringSub(amount, filled);
            } else if (Helpers.isTrue(Helpers.isEqual(status, "closed")))
            {
                remaining = "0";
            }
        }
        // ensure that the average field is calculated correctly
        Object inverse = this.safeBool(market, "inverse", false);
        Object contractSize = this.numberToString(this.safeValue(market, "contractSize", 1));
        // inverse
        // price = filled * contract size / cost
        //
        // linear
        // price = cost / (filled * contract size)
        if (Helpers.isTrue(Helpers.isEqual(average, null)))
        {
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(filled, null))) && Helpers.isTrue((!Helpers.isEqual(cost, null)))) && Helpers.isTrue(Precise.stringGt(filled, "0"))))
            {
                Object filledTimesContractSize = Precise.stringMul(filled, contractSize);
                if (Helpers.isTrue(inverse))
                {
                    average = Precise.stringDiv(filledTimesContractSize, cost);
                } else
                {
                    average = Precise.stringDiv(cost, filledTimesContractSize);
                }
            }
        }
        // similarly
        // inverse
        // cost = filled * contract size / price
        //
        // linear
        // cost = filled * contract size * price
        Object costPriceExists = Helpers.isTrue((!Helpers.isEqual(average, null))) || Helpers.isTrue((!Helpers.isEqual(price, null)));
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue(parseCost) && Helpers.isTrue((!Helpers.isEqual(filled, null)))) && Helpers.isTrue(costPriceExists)))
        {
            Object multiplyPrice = null;
            if (Helpers.isTrue(Helpers.isEqual(average, null)))
            {
                multiplyPrice = price;
            } else
            {
                multiplyPrice = average;
            }
            // contract trading
            Object filledTimesContractSize = Precise.stringMul(filled, contractSize);
            if (Helpers.isTrue(inverse))
            {
                cost = Precise.stringDiv(filledTimesContractSize, multiplyPrice);
            } else
            {
                cost = Precise.stringMul(filledTimesContractSize, multiplyPrice);
            }
        }
        // support for market orders
        Object orderType = this.safeValue(order, "type");
        Object emptyPrice = Helpers.isTrue((Helpers.isEqual(price, null))) || Helpers.isTrue(Precise.stringEquals(price, "0"));
        if (Helpers.isTrue(Helpers.isTrue(emptyPrice) && Helpers.isTrue((Helpers.isEqual(orderType, "market")))))
        {
            price = average;
        }
        // we have trades with string values at this point so we will mutate them
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(trades)); i++)
        {
            Object entry = Helpers.GetValue(trades, i);
            Helpers.addElementToObject(entry, "amount", this.safeNumber(entry, "amount"));
            Helpers.addElementToObject(entry, "price", this.safeNumber(entry, "price"));
            Helpers.addElementToObject(entry, "cost", this.safeNumber(entry, "cost"));
            Object tradeFee = this.safeDict(entry, "fee", new java.util.HashMap<String, Object>() {{}});
            Helpers.addElementToObject(tradeFee, "cost", this.safeNumber(tradeFee, "cost"));
            if (Helpers.isTrue(Helpers.inOp(tradeFee, "rate")))
            {
                Helpers.addElementToObject(tradeFee, "rate", this.safeNumber(tradeFee, "rate"));
            }
            Object entryFees = this.safeList(entry, "fees", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
            for (var j = 0; Helpers.isLessThan(j, Helpers.getArrayLength(entryFees)); j++)
            {
                Helpers.addElementToObject(Helpers.GetValue(entryFees, j), "cost", this.safeNumber(Helpers.GetValue(entryFees, j), "cost"));
            }
            Helpers.addElementToObject(entry, "fees", entryFees);
            Helpers.addElementToObject(entry, "fee", tradeFee);
        }
        Object timeInForce = this.safeString(order, "timeInForce");
        Object postOnly = this.safeValue(order, "postOnly");
        // timeInForceHandling
        if (Helpers.isTrue(Helpers.isEqual(timeInForce, null)))
        {
            if (Helpers.isTrue(!Helpers.isTrue(isTriggerOrSLTpOrder) && Helpers.isTrue((Helpers.isEqual(this.safeString(order, "type"), "market")))))
            {
                timeInForce = "IOC";
            }
            // allow postOnly override
            if (Helpers.isTrue(postOnly))
            {
                timeInForce = "PO";
            }
        } else if (Helpers.isTrue(Helpers.isEqual(postOnly, null)))
        {
            // timeInForce is not undefined here
            postOnly = Helpers.isEqual(timeInForce, "PO");
        }
        Object timestamp = this.safeInteger(order, "timestamp");
        Object lastUpdateTimestamp = this.safeInteger(order, "lastUpdateTimestamp");
        Object datetime = this.safeString(order, "datetime");
        if (Helpers.isTrue(Helpers.isEqual(datetime, null)))
        {
            datetime = this.iso8601(timestamp);
        }
        Object triggerPrice = this.parseNumber(this.safeString2(order, "triggerPrice", "stopPrice"));
        Object takeProfitPrice = this.parseNumber(this.safeString(order, "takeProfitPrice"));
        Object stopLossPrice = this.parseNumber(this.safeString(order, "stopLossPrice"));
        final Object finalDatetime = datetime;
        final Object finalSymbol = symbol;
        final Object finalSide = side;
        final Object finalLastTradeTimeTimestamp = lastTradeTimeTimestamp;
        final Object finalPrice = price;
        final Object finalAmount = amount;
        final Object finalCost = cost;
        final Object finalAverage = average;
        final Object finalFilled = filled;
        final Object finalRemaining = remaining;
        final Object finalTimeInForce = timeInForce;
        final Object finalPostOnly = postOnly;
        final Object finalTrades = trades;
        final Object finalStatus = status;
        return this.extend(order, new java.util.HashMap<String, Object>() {{
            put( "id", Exchange.this.safeString(order, "id") );
            put( "clientOrderId", Exchange.this.safeString(order, "clientOrderId") );
            put( "timestamp", timestamp );
            put( "datetime", finalDatetime );
            put( "symbol", finalSymbol );
            put( "type", Exchange.this.safeString(order, "type") );
            put( "side", finalSide );
            put( "lastTradeTimestamp", finalLastTradeTimeTimestamp );
            put( "lastUpdateTimestamp", lastUpdateTimestamp );
            put( "price", Exchange.this.parseNumber(finalPrice) );
            put( "amount", Exchange.this.parseNumber(finalAmount) );
            put( "cost", Exchange.this.parseNumber(finalCost) );
            put( "average", Exchange.this.parseNumber(finalAverage) );
            put( "filled", Exchange.this.parseNumber(finalFilled) );
            put( "remaining", Exchange.this.parseNumber(finalRemaining) );
            put( "timeInForce", finalTimeInForce );
            put( "postOnly", finalPostOnly );
            put( "trades", finalTrades );
            put( "reduceOnly", Exchange.this.safeValue(order, "reduceOnly") );
            put( "stopPrice", triggerPrice );
            put( "triggerPrice", triggerPrice );
            put( "takeProfitPrice", takeProfitPrice );
            put( "stopLossPrice", stopLossPrice );
            put( "status", finalStatus );
            put( "fee", Exchange.this.safeValue(order, "fee") );
        }});
    }

    public Object parseOrders(Object orders, Object... optionalArgs)
    {
        //
        // the value of orders is either a dict or a list
        //
        // dict
        //
        //     {
        //         'id1': { ... },
        //         'id2': { ... },
        //         'id3': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'id': 'id1', ... },
        //         { 'id': 'id2', ... },
        //         { 'id': 'id3', ... },
        //         ...
        //     ]
        //
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        if (Helpers.isTrue(((orders instanceof java.util.List) || (orders.getClass().isArray()))))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(orders)); i++)
            {
                Object parsed = this.parseOrder(Helpers.GetValue(orders, i), market); // don't inline this call
                Object order = this.extend(parsed, parameters);
                ((java.util.List<Object>)results).add(order);
            }
        } else
        {
            Object ids = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)orders).keySet());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(ids)); i++)
            {
                Object id = Helpers.GetValue(ids, i);
                Object idExtended = this.extend(new java.util.HashMap<String, Object>() {{
                    put( "id", id );
                }}, Helpers.GetValue(orders, id));
                Object parsedOrder = this.parseOrder(idExtended, market); // don't  inline these calls
                Object order = this.extend(parsedOrder, parameters);
                ((java.util.List<Object>)results).add(order);
            }
        }
        results = this.sortBy(results, "timestamp");
        Object symbol = ((Helpers.isTrue((!Helpers.isEqual(market, null))))) ? Helpers.GetValue(market, "symbol") : null;
        return this.filterBySymbolSinceLimit(results, symbol, since, limit);
    }

    public Object calculateFeeWithRate(Object symbol, Object type, Object side, Object amount, Object price, Object... optionalArgs)
    {
        Object takerOrMaker = Helpers.getArg(optionalArgs, 0, "taker");
        Object feeRate = Helpers.getArg(optionalArgs, 1, null);
        Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(type, "market")) && Helpers.isTrue(Helpers.isEqual(takerOrMaker, "maker"))))
        {
            throw new ArgumentsRequired((String)Helpers.add(this.id, " calculateFee() - you have provided incompatible arguments - \"market\" type order can not be \"maker\". Change either the \"type\" or the \"takerOrMaker\" argument to calculate the fee.")) ;
        }
        Object market = Helpers.GetValue(this.markets, symbol);
        Object feeSide = this.safeString(market, "feeSide", "quote");
        Object useQuote = null;
        if (Helpers.isTrue(Helpers.isEqual(feeSide, "get")))
        {
            // the fee is always in the currency you get
            useQuote = Helpers.isEqual(side, "sell");
        } else if (Helpers.isTrue(Helpers.isEqual(feeSide, "give")))
        {
            // the fee is always in the currency you give
            useQuote = Helpers.isEqual(side, "buy");
        } else
        {
            // the fee is always in feeSide currency
            useQuote = Helpers.isEqual(feeSide, "quote");
        }
        Object cost = this.numberToString(amount);
        Object key = null;
        if (Helpers.isTrue(useQuote))
        {
            Object priceString = this.numberToString(price);
            cost = Precise.stringMul(cost, priceString);
            key = "quote";
        } else
        {
            key = "base";
        }
        // for derivatives, the fee is in 'settle' currency
        if (!Helpers.isTrue(Helpers.GetValue(market, "spot")))
        {
            key = "settle";
        }
        // even if `takerOrMaker` argument was set to 'maker', for 'market' orders we should forcefully override it to 'taker'
        if (Helpers.isTrue(Helpers.isEqual(type, "market")))
        {
            takerOrMaker = "taker";
        }
        Object rate = ((Helpers.isTrue((!Helpers.isEqual(feeRate, null))))) ? this.numberToString(feeRate) : this.safeString(market, takerOrMaker);
        cost = Precise.stringMul(cost, rate);
        final Object finalTakerOrMaker = takerOrMaker;
        final Object finalKey = key;
        final Object finalCost = cost;
        return new java.util.HashMap<String, Object>() {{
            put( "type", finalTakerOrMaker );
            put( "currency", Helpers.GetValue(market, finalKey) );
            put( "rate", Exchange.this.parseNumber(rate) );
            put( "cost", Exchange.this.parseNumber(finalCost) );
        }};
    }

    public Object calculateFee(Object symbol, Object type, Object side, Object amount, Object price, Object... optionalArgs)
    {
        /**
        * @method
        * @description calculates the presumptive fee that would be charged for an order
        * @param {string} symbol unified market symbol
        * @param {string} type 'market' or 'limit'
        * @param {string} side 'buy' or 'sell'
        * @param {float} amount how much you want to trade, in units of the base currency on most exchanges, or number of contracts
        * @param {float} price the price for the order to be filled at, in units of the quote currency
        * @param {string} takerOrMaker 'taker' or 'maker'
        * @param {object} params
        * @returns {object} contains the rate, the percentage multiplied to the order amount to obtain the fee amount, and cost, the total value of the fee in units of the quote currency, for the order
        */
        Object takerOrMaker = Helpers.getArg(optionalArgs, 0, "taker");
        Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
        return this.calculateFeeWithRate(symbol, type, side, amount, price, takerOrMaker, null, parameters);
    }

    public Object safeLiquidation(Object liquidation, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object contracts = this.safeString(liquidation, "contracts");
        Object contractSize = this.safeString(market, "contractSize");
        Object price = this.safeString(liquidation, "price");
        Object baseValue = this.safeString(liquidation, "baseValue");
        Object quoteValue = this.safeString(liquidation, "quoteValue");
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(baseValue, null))) && Helpers.isTrue((!Helpers.isEqual(contracts, null)))) && Helpers.isTrue((!Helpers.isEqual(contractSize, null)))) && Helpers.isTrue((!Helpers.isEqual(price, null)))))
        {
            baseValue = Precise.stringMul(contracts, contractSize);
        }
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(quoteValue, null))) && Helpers.isTrue((!Helpers.isEqual(baseValue, null)))) && Helpers.isTrue((!Helpers.isEqual(price, null)))))
        {
            quoteValue = Precise.stringMul(baseValue, price);
        }
        Helpers.addElementToObject(liquidation, "contracts", this.parseNumber(contracts));
        Helpers.addElementToObject(liquidation, "contractSize", this.parseNumber(contractSize));
        Helpers.addElementToObject(liquidation, "price", this.parseNumber(price));
        Helpers.addElementToObject(liquidation, "baseValue", this.parseNumber(baseValue));
        Helpers.addElementToObject(liquidation, "quoteValue", this.parseNumber(quoteValue));
        return liquidation;
    }

    public Object safeTrade(Object trade, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object amount = this.safeString(trade, "amount");
        Object price = this.safeString(trade, "price");
        Object cost = this.safeString(trade, "cost");
        if (Helpers.isTrue(Helpers.isEqual(cost, null)))
        {
            // contract trading
            Object contractSize = this.safeString(market, "contractSize");
            Object multiplyPrice = price;
            if (Helpers.isTrue(!Helpers.isEqual(contractSize, null)))
            {
                Object inverse = this.safeBool(market, "inverse", false);
                if (Helpers.isTrue(inverse))
                {
                    multiplyPrice = Precise.stringDiv("1", price);
                }
                multiplyPrice = Precise.stringMul(multiplyPrice, contractSize);
            }
            cost = Precise.stringMul(multiplyPrice, amount);
        }
        var resultFeeresultFeesVariable = this.parsedFeeAndFees(trade);
        var resultFee = ((java.util.List<Object>) resultFeeresultFeesVariable).get(0);
        var resultFees = ((java.util.List<Object>) resultFeeresultFeesVariable).get(1);
        Helpers.addElementToObject(trade, "fee", resultFee);
        Helpers.addElementToObject(trade, "fees", resultFees);
        Helpers.addElementToObject(trade, "amount", this.parseNumber(amount));
        Helpers.addElementToObject(trade, "price", this.parseNumber(price));
        Helpers.addElementToObject(trade, "cost", this.parseNumber(cost));
        return trade;
    }

    public Object createCcxtTradeId(Object... optionalArgs)
    {
        // this approach is being used by multiple exchanges (mexc, woo, coinsbit, dydx, ...)
        Object timestamp = Helpers.getArg(optionalArgs, 0, null);
        Object side = Helpers.getArg(optionalArgs, 1, null);
        Object amount = Helpers.getArg(optionalArgs, 2, null);
        Object price = Helpers.getArg(optionalArgs, 3, null);
        Object takerOrMaker = Helpers.getArg(optionalArgs, 4, null);
        Object id = null;
        if (Helpers.isTrue(!Helpers.isEqual(timestamp, null)))
        {
            id = this.numberToString(timestamp);
            if (Helpers.isTrue(!Helpers.isEqual(side, null)))
            {
                id = Helpers.add(id, Helpers.add("-", side));
            }
            if (Helpers.isTrue(!Helpers.isEqual(amount, null)))
            {
                id = Helpers.add(id, Helpers.add("-", this.numberToString(amount)));
            }
            if (Helpers.isTrue(!Helpers.isEqual(price, null)))
            {
                id = Helpers.add(id, Helpers.add("-", this.numberToString(price)));
            }
            if (Helpers.isTrue(!Helpers.isEqual(takerOrMaker, null)))
            {
                id = Helpers.add(id, Helpers.add("-", takerOrMaker));
            }
        }
        return id;
    }

    public Object parsedFeeAndFees(Object container)
    {
        Object fee = this.safeDict(container, "fee");
        Object fees = this.safeList(container, "fees");
        Object feeDefined = !Helpers.isEqual(fee, null);
        Object feesDefined = !Helpers.isEqual(fees, null);
        // parsing only if at least one of them is defined
        Object shouldParseFees = (Helpers.isTrue(feeDefined) || Helpers.isTrue(feesDefined));
        if (Helpers.isTrue(shouldParseFees))
        {
            if (Helpers.isTrue(feeDefined))
            {
                fee = this.parseFeeNumeric(fee);
            }
            if (!Helpers.isTrue(feesDefined))
            {
                // just set it directly, no further processing needed.
                fees = new java.util.ArrayList<Object>(java.util.Arrays.asList(fee));
            }
            // 'fees' were set, so reparse them
            Object reducedFees = ((Helpers.isTrue(this.reduceFees))) ? this.reduceFeesByCurrency(fees) : fees;
            Object reducedLength = Helpers.getArrayLength(reducedFees);
            for (var i = 0; Helpers.isLessThan(i, reducedLength); i++)
            {
                Helpers.addElementToObject(reducedFees, i, this.parseFeeNumeric(Helpers.GetValue(reducedFees, i)));
            }
            fees = reducedFees;
            if (Helpers.isTrue(Helpers.isEqual(reducedLength, 1)))
            {
                fee = Helpers.GetValue(reducedFees, 0);
            } else if (Helpers.isTrue(Helpers.isEqual(reducedLength, 0)))
            {
                fee = null;
            }
        }
        // in case `fee & fees` are undefined, set `fees` as empty array
        if (Helpers.isTrue(Helpers.isEqual(fee, null)))
        {
            fee = new java.util.HashMap<String, Object>() {{
                put( "cost", null );
                put( "currency", null );
            }};
        }
        if (Helpers.isTrue(Helpers.isEqual(fees, null)))
        {
            fees = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(fee, fees));
    }

    public Object parseFeeNumeric(Object fee)
    {
        Helpers.addElementToObject(fee, "cost", this.safeNumber(fee, "cost")); // ensure numeric
        if (Helpers.isTrue(Helpers.inOp(fee, "rate")))
        {
            Helpers.addElementToObject(fee, "rate", this.safeNumber(fee, "rate"));
        }
        return fee;
    }

    public Object findNearestCeiling(Object arr, Object providedValue)
    {
        //  i.e. findNearestCeiling ([ 10, 30, 50],  23) returns 30
        Object length = Helpers.getArrayLength(arr);
        for (var i = 0; Helpers.isLessThan(i, length); i++)
        {
            Object current = Helpers.GetValue(arr, i);
            if (Helpers.isTrue(Helpers.isLessThanOrEqual(providedValue, current)))
            {
                return current;
            }
        }
        return Helpers.GetValue(arr, Helpers.subtract(length, 1));
    }

    public Object invertFlatStringDictionary(Object dict)
    {
        Object reversed = new java.util.HashMap<String, Object>() {{}};
        Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)dict).keySet());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
        {
            Object key = Helpers.GetValue(keys, i);
            Object value = Helpers.GetValue(dict, key);
            if (Helpers.isTrue((value instanceof String)))
            {
                Helpers.addElementToObject(reversed, value, key);
            }
        }
        return reversed;
    }

    public Object reduceFeesByCurrency(Object fees)
    {
        //
        // this function takes a list of fee structures having the following format
        //
        //     string = true
        //
        //     [
        //         { 'currency': 'BTC', 'cost': '0.1' },
        //         { 'currency': 'BTC', 'cost': '0.2'  },
        //         { 'currency': 'BTC', 'cost': '0.2', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.4', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456' },
        //         { 'currency': 'USDT', 'cost': '12.3456' },
        //     ]
        //
        //     string = false
        //
        //     [
        //         { 'currency': 'BTC', 'cost': 0.1 },
        //         { 'currency': 'BTC', 'cost': 0.2 },
        //         { 'currency': 'BTC', 'cost': 0.2, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.4, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456 },
        //         { 'currency': 'USDT', 'cost': 12.3456 },
        //     ]
        //
        // and returns a reduced fee list, where fees are summed per currency and rate (if any)
        //
        //     string = true
        //
        //     [
        //         { 'currency': 'BTC', 'cost': '0.4'  },
        //         { 'currency': 'BTC', 'cost': '0.6', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456' },
        //         { 'currency': 'USDT', 'cost': '12.3456' },
        //     ]
        //
        //     string  = false
        //
        //     [
        //         { 'currency': 'BTC', 'cost': 0.3  },
        //         { 'currency': 'BTC', 'cost': 0.6, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456 },
        //         { 'currency': 'USDT', 'cost': 12.3456 },
        //     ]
        //
        Object reduced = new java.util.HashMap<String, Object>() {{}};
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(fees)); i++)
        {
            Object fee = Helpers.GetValue(fees, i);
            Object code = this.safeString(fee, "currency");
            Object feeCurrencyCode = ((Helpers.isTrue((!Helpers.isEqual(code, null))))) ? code : String.valueOf(i);
            if (Helpers.isTrue(!Helpers.isEqual(feeCurrencyCode, null)))
            {
                Object rate = this.safeString(fee, "rate");
                Object cost = this.safeString(fee, "cost");
                if (Helpers.isTrue(Helpers.isEqual(cost, null)))
                {
                    continue;
                }
                if (!Helpers.isTrue((Helpers.inOp(reduced, feeCurrencyCode))))
                {
                    Helpers.addElementToObject(reduced, feeCurrencyCode, new java.util.HashMap<String, Object>() {{}});
                }
                Object rateKey = ((Helpers.isTrue((Helpers.isEqual(rate, null))))) ? "" : rate;
                if (Helpers.isTrue(Helpers.inOp(Helpers.GetValue(reduced, feeCurrencyCode), rateKey)))
                {
                    Helpers.addElementToObject(Helpers.GetValue(Helpers.GetValue(reduced, feeCurrencyCode), rateKey), "cost", Precise.stringAdd(Helpers.GetValue(Helpers.GetValue(Helpers.GetValue(reduced, feeCurrencyCode), rateKey), "cost"), cost));
                } else
                {
                    final Object finalCode = code;
                    final Object finalCost = cost;
                    Helpers.addElementToObject(Helpers.GetValue(reduced, feeCurrencyCode), rateKey, new java.util.HashMap<String, Object>() {{
    put( "currency", finalCode );
    put( "cost", finalCost );
}});
                    if (Helpers.isTrue(!Helpers.isEqual(rate, null)))
                    {
                        Helpers.addElementToObject(Helpers.GetValue(Helpers.GetValue(reduced, feeCurrencyCode), rateKey), "rate", rate);
                    }
                }
            }
        }
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object feeValues = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)reduced).values());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(feeValues)); i++)
        {
            Object reducedFeeValues = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)Helpers.GetValue(feeValues, i)).values());
            result = this.arrayConcat(result, reducedFeeValues);
        }
        return result;
    }

    public Object safeTicker(Object ticker, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object open = this.omitZero(this.safeString(ticker, "open"));
        Object close = this.omitZero(this.safeString2(ticker, "close", "last"));
        Object change = this.omitZero(this.safeString(ticker, "change"));
        Object percentage = this.omitZero(this.safeString(ticker, "percentage"));
        Object average = this.omitZero(this.safeString(ticker, "average"));
        Object vwap = this.safeString(ticker, "vwap");
        Object baseVolume = this.safeString(ticker, "baseVolume");
        Object quoteVolume = this.safeString(ticker, "quoteVolume");
        if (Helpers.isTrue(Helpers.isEqual(vwap, null)))
        {
            vwap = Precise.stringDiv(this.omitZero(quoteVolume), baseVolume);
        }
        // calculate open
        if (Helpers.isTrue(!Helpers.isEqual(change, null)))
        {
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(close, null)) && Helpers.isTrue(!Helpers.isEqual(average, null))))
            {
                close = Precise.stringAdd(average, Precise.stringDiv(change, "2"));
            }
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(open, null)) && Helpers.isTrue(!Helpers.isEqual(close, null))))
            {
                open = Precise.stringSub(close, change);
            }
        } else if (Helpers.isTrue(!Helpers.isEqual(percentage, null)))
        {
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(close, null)) && Helpers.isTrue(!Helpers.isEqual(average, null))))
            {
                Object openAddClose = Precise.stringMul(average, "2");
                // openAddClose = open * (1 + (100 + percentage)/100)
                Object denominator = Precise.stringAdd("2", Precise.stringDiv(percentage, "100"));
                Object calcOpen = ((Helpers.isTrue((!Helpers.isEqual(open, null))))) ? open : Precise.stringDiv(openAddClose, denominator);
                close = Precise.stringMul(calcOpen, Precise.stringAdd("1", Precise.stringDiv(percentage, "100")));
            }
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(open, null)) && Helpers.isTrue(!Helpers.isEqual(close, null))))
            {
                open = Precise.stringDiv(close, Precise.stringAdd("1", Precise.stringDiv(percentage, "100")));
            }
        }
        // change
        if (Helpers.isTrue(Helpers.isEqual(change, null)))
        {
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(close, null)) && Helpers.isTrue(!Helpers.isEqual(open, null))))
            {
                change = Precise.stringSub(close, open);
            } else if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(close, null)) && Helpers.isTrue(!Helpers.isEqual(percentage, null))))
            {
                change = Precise.stringMul(Precise.stringDiv(percentage, "100"), Precise.stringDiv(close, "100"));
            } else if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(open, null)) && Helpers.isTrue(!Helpers.isEqual(percentage, null))))
            {
                change = Precise.stringMul(open, Precise.stringDiv(percentage, "100"));
            }
        }
        // calculate things according to "open" (similar can be done with "close")
        if (Helpers.isTrue(!Helpers.isEqual(open, null)))
        {
            // percentage (using change)
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(percentage, null)) && Helpers.isTrue(!Helpers.isEqual(change, null))))
            {
                percentage = Precise.stringMul(Precise.stringDiv(change, open), "100");
            }
            // close (using change)
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(close, null)) && Helpers.isTrue(!Helpers.isEqual(change, null))))
            {
                close = Precise.stringAdd(open, change);
            }
            // close (using average)
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(close, null)) && Helpers.isTrue(!Helpers.isEqual(average, null))))
            {
                close = Precise.stringMul(average, "2");
            }
            // average
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(average, null)) && Helpers.isTrue(!Helpers.isEqual(close, null))))
            {
                Object precision = 18;
                if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(market, null)) && Helpers.isTrue(this.isTickPrecision())))
                {
                    Object marketPrecision = this.safeDict(market, "precision");
                    Object precisionPrice = this.safeString(marketPrecision, "price");
                    if (Helpers.isTrue(!Helpers.isEqual(precisionPrice, null)))
                    {
                        precision = this.precisionFromString(precisionPrice);
                    }
                }
                average = Precise.stringDiv(Precise.stringAdd(open, close), "2", precision);
            }
        }
        // timestamp and symbol operations don't belong in safeTicker
        // they should be done in the derived classes
        Object closeParsed = this.parseNumber(this.omitZero(close));
        final Object finalOpen = open;
        final Object finalChange = change;
        final Object finalPercentage = percentage;
        final Object finalAverage = average;
        final Object finalVwap = vwap;
        return this.extend(ticker, new java.util.HashMap<String, Object>() {{
            put( "bid", Exchange.this.parseNumber(Exchange.this.omitZero(Exchange.this.safeString(ticker, "bid"))) );
            put( "bidVolume", Exchange.this.safeNumber(ticker, "bidVolume") );
            put( "ask", Exchange.this.parseNumber(Exchange.this.omitZero(Exchange.this.safeString(ticker, "ask"))) );
            put( "askVolume", Exchange.this.safeNumber(ticker, "askVolume") );
            put( "high", Exchange.this.parseNumber(Exchange.this.omitZero(Exchange.this.safeString(ticker, "high"))) );
            put( "low", Exchange.this.parseNumber(Exchange.this.omitZero(Exchange.this.safeString(ticker, "low"))) );
            put( "open", Exchange.this.parseNumber(Exchange.this.omitZero(finalOpen)) );
            put( "close", closeParsed );
            put( "last", closeParsed );
            put( "change", Exchange.this.parseNumber(finalChange) );
            put( "percentage", Exchange.this.parseNumber(finalPercentage) );
            put( "average", Exchange.this.parseNumber(finalAverage) );
            put( "vwap", Exchange.this.parseNumber(finalVwap) );
            put( "baseVolume", Exchange.this.parseNumber(baseVolume) );
            put( "quoteVolume", Exchange.this.parseNumber(quoteVolume) );
            put( "previousClose", Exchange.this.safeNumber(ticker, "previousClose") );
            put( "indexPrice", Exchange.this.safeNumber(ticker, "indexPrice") );
            put( "markPrice", Exchange.this.safeNumber(ticker, "markPrice") );
        }});
    }

    public java.util.concurrent.CompletableFuture<Object> fetchBorrowRate(Object code, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchBorrowRate is deprecated, please use fetchCrossBorrowRate or fetchIsolatedBorrowRate instead")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> repayCrossMargin(Object code, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " repayCrossMargin is not support yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> repayIsolatedMargin(Object symbol, Object code, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " repayIsolatedMargin is not support yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> borrowCrossMargin(Object code, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " borrowCrossMargin is not support yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> borrowIsolatedMargin(Object symbol, Object code, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " borrowIsolatedMargin is not support yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> borrowMargin(Object code, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " borrowMargin is deprecated, please use borrowCrossMargin or borrowIsolatedMargin instead")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> repayMargin(Object code, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " repayMargin is deprecated, please use repayCrossMargin or repayIsolatedMargin instead")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOHLCV(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            Object message = "";
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchTrades")))
            {
                message = ". If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see \"build-ohlcv-bars\" file";
            }
            throw new NotSupported((String)Helpers.add(Helpers.add(this.id, " fetchOHLCV() is not supported yet"), message)) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOHLCVWs(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            Object message = "";
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchTradesWs")))
            {
                message = ". If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see \"build-ohlcv-bars\" file";
            }
            throw new NotSupported((String)Helpers.add(Helpers.add(this.id, " fetchOHLCVWs() is not supported yet. Try using fetchOHLCV instead."), message)) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOHLCV(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchOHLCV() is not supported yet")) ;
        });

    }

    public Object convertTradingViewToOHLCV(Object ohlcvs, Object... optionalArgs)
    {
        Object timestamp = Helpers.getArg(optionalArgs, 0, "t");
        Object open = Helpers.getArg(optionalArgs, 1, "o");
        Object high = Helpers.getArg(optionalArgs, 2, "h");
        Object low = Helpers.getArg(optionalArgs, 3, "l");
        Object close = Helpers.getArg(optionalArgs, 4, "c");
        Object volume = Helpers.getArg(optionalArgs, 5, "v");
        Object ms = Helpers.getArg(optionalArgs, 6, false);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object timestamps = this.safeList(ohlcvs, timestamp, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object opens = this.safeList(ohlcvs, open, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object highs = this.safeList(ohlcvs, high, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object lows = this.safeList(ohlcvs, low, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object closes = this.safeList(ohlcvs, close, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object volumes = this.safeList(ohlcvs, volume, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(timestamps)); i++)
        {
            ((java.util.List<Object>)result).add(new java.util.ArrayList<Object>(java.util.Arrays.asList(((Helpers.isTrue(ms))) ? this.safeInteger(timestamps, i) : this.safeTimestamp(timestamps, i), this.safeValue(opens, i), this.safeValue(highs, i), this.safeValue(lows, i), this.safeValue(closes, i), this.safeValue(volumes, i))));
        }
        return result;
    }

    public Object convertOHLCVToTradingView(Object ohlcvs, Object... optionalArgs)
    {
        Object timestamp = Helpers.getArg(optionalArgs, 0, "t");
        Object open = Helpers.getArg(optionalArgs, 1, "o");
        Object high = Helpers.getArg(optionalArgs, 2, "h");
        Object low = Helpers.getArg(optionalArgs, 3, "l");
        Object close = Helpers.getArg(optionalArgs, 4, "c");
        Object volume = Helpers.getArg(optionalArgs, 5, "v");
        Object ms = Helpers.getArg(optionalArgs, 6, false);
        Object result = new java.util.HashMap<String, Object>() {{}};
        Helpers.addElementToObject(result, timestamp, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Helpers.addElementToObject(result, open, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Helpers.addElementToObject(result, high, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Helpers.addElementToObject(result, low, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Helpers.addElementToObject(result, close, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Helpers.addElementToObject(result, volume, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(ohlcvs)); i++)
        {
            Object ts = ((Helpers.isTrue(ms))) ? Helpers.GetValue(Helpers.GetValue(ohlcvs, i), 0) : this.parseToInt(Helpers.divide(Helpers.GetValue(Helpers.GetValue(ohlcvs, i), 0), 1000));
            Object resultTimestamp = Helpers.GetValue(result, timestamp);
            ((java.util.List<Object>)resultTimestamp).add(ts);
            Object resultOpen = Helpers.GetValue(result, open);
            ((java.util.List<Object>)resultOpen).add(Helpers.GetValue(Helpers.GetValue(ohlcvs, i), 1));
            Object resultHigh = Helpers.GetValue(result, high);
            ((java.util.List<Object>)resultHigh).add(Helpers.GetValue(Helpers.GetValue(ohlcvs, i), 2));
            Object resultLow = Helpers.GetValue(result, low);
            ((java.util.List<Object>)resultLow).add(Helpers.GetValue(Helpers.GetValue(ohlcvs, i), 3));
            Object resultClose = Helpers.GetValue(result, close);
            ((java.util.List<Object>)resultClose).add(Helpers.GetValue(Helpers.GetValue(ohlcvs, i), 4));
            Object resultVolume = Helpers.GetValue(result, volume);
            ((java.util.List<Object>)resultVolume).add(Helpers.GetValue(Helpers.GetValue(ohlcvs, i), 5));
        }
        return result;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchWebEndpoint(Object method, Object endpointMethod, Object returnAsJson2, Object... optionalArgs)
    {
        final Object returnAsJson3 = returnAsJson2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object returnAsJson = returnAsJson3;
            Object startRegex = Helpers.getArg(optionalArgs, 0, null);
            Object endRegex = Helpers.getArg(optionalArgs, 1, null);
            Object errorMessage = "";
            Object options = this.safeValue(this.options, method, new java.util.HashMap<String, Object>() {{}});
            Object muteOnFailure = this.safeBool(options, "webApiMuteFailure", true);
            try
            {
                // if it was not explicitly disabled, then don't fetch
                if (Helpers.isTrue(!Helpers.isEqual(this.safeBool(options, "webApiEnable", true), true)))
                {
                    return null;
                }
                Object maxRetries = this.safeValue(options, "webApiRetries", 10);
                Object response = null;
                Object retry = 0;
                Object shouldBreak = false;
                while (Helpers.isLessThan(retry, maxRetries))
                {
                    try
                    {
                        
                        response = (Helpers.callDynamically(this, endpointMethod, new Object[] { new java.util.HashMap<String, Object>() {{}} })).join();
                        shouldBreak = true;
                        break;
                    } catch(Exception e)
                    {
                        retry = Helpers.add(retry, 1);
                        if (Helpers.isTrue(Helpers.isEqual(retry, maxRetries)))
                        {
                            throw e;
                        }
                    }
                    if (Helpers.isTrue(shouldBreak))
                    {
                        break; // this is needed because of GO
                    }
                }
                Object content = response;
                if (Helpers.isTrue(!Helpers.isEqual(startRegex, null)))
                {
                    Object splitted_by_start = Helpers.split(content, startRegex);
                    content = Helpers.GetValue(splitted_by_start, 1); // we need second part after start
                }
                if (Helpers.isTrue(!Helpers.isEqual(endRegex, null)))
                {
                    Object splitted_by_end = Helpers.split(content, endRegex);
                    content = Helpers.GetValue(splitted_by_end, 0); // we need first part after start
                }
                if (Helpers.isTrue(Helpers.isTrue(returnAsJson) && Helpers.isTrue(((content instanceof String)))))
                {
                    Object jsoned = this.parseJson(((String)content).trim()); // content should be trimmed before json parsing
                    if (Helpers.isTrue(jsoned))
                    {
                        return jsoned;  // if parsing was not successfull, exception should be thrown
                    } else
                    {
                        throw new BadResponse((String)"could not parse the response into json") ;
                    }
                } else
                {
                    return content;
                }
            } catch(Exception e)
            {
                errorMessage = Helpers.add(Helpers.add(Helpers.add(this.id, " "), method), "() failed to fetch correct data from website. Probably webpage markup has been changed, breaking the page custom parser.");
            }
            if (Helpers.isTrue(muteOnFailure))
            {
                return null;
            } else
            {
                throw new BadResponse((String)errorMessage) ;
            }
        });

    }

    public Object marketIds(Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(symbols, null)))
        {
            return symbols;
        }
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(symbols)); i++)
        {
            ((java.util.List<Object>)result).add(this.marketId(Helpers.GetValue(symbols, i)));
        }
        return result;
    }

    public Object currencyIds(Object... optionalArgs)
    {
        Object codes = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(codes, null)))
        {
            return codes;
        }
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(codes)); i++)
        {
            ((java.util.List<Object>)result).add(this.currencyId(Helpers.GetValue(codes, i)));
        }
        return result;
    }

    public Object marketsForSymbols(Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(symbols, null)))
        {
            return symbols;
        }
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(symbols)); i++)
        {
            ((java.util.List<Object>)result).add(this.market(Helpers.GetValue(symbols, i)));
        }
        return result;
    }

    public Object marketSymbols(Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object type = Helpers.getArg(optionalArgs, 1, null);
        Object allowEmpty = Helpers.getArg(optionalArgs, 2, true);
        Object sameTypeOnly = Helpers.getArg(optionalArgs, 3, false);
        Object sameSubTypeOnly = Helpers.getArg(optionalArgs, 4, false);
        if (Helpers.isTrue(Helpers.isEqual(symbols, null)))
        {
            if (!Helpers.isTrue(allowEmpty))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " empty list of symbols is not supported")) ;
            }
            return symbols;
        }
        Object symbolsLength = Helpers.getArrayLength(symbols);
        if (Helpers.isTrue(Helpers.isEqual(symbolsLength, 0)))
        {
            if (!Helpers.isTrue(allowEmpty))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " empty list of symbols is not supported")) ;
            }
            return symbols;
        }
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object marketType = null;
        Object isLinearSubType = null;
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(symbols)); i++)
        {
            Object market = this.market(Helpers.GetValue(symbols, i));
            if (Helpers.isTrue(Helpers.isTrue(sameTypeOnly) && Helpers.isTrue((!Helpers.isEqual(marketType, null)))))
            {
                if (Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(market, "type"), marketType)))
                {
                    throw new BadRequest((String)Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(this.id, " symbols must be of the same type, either "), marketType), " or "), Helpers.GetValue(market, "type")), ".")) ;
                }
            }
            if (Helpers.isTrue(Helpers.isTrue(sameSubTypeOnly) && Helpers.isTrue((!Helpers.isEqual(isLinearSubType, null)))))
            {
                if (Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(market, "linear"), isLinearSubType)))
                {
                    throw new BadRequest((String)Helpers.add(this.id, " symbols must be of the same subType, either linear or inverse.")) ;
                }
            }
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(type, null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(market, "type"), type))))
            {
                throw new BadRequest((String)Helpers.add(Helpers.add(Helpers.add(this.id, " symbols must be of the same type "), type), ". If the type is incorrect you can change it in options or the params of the request")) ;
            }
            marketType = Helpers.GetValue(market, "type");
            if (!Helpers.isTrue(Helpers.GetValue(market, "spot")))
            {
                isLinearSubType = Helpers.GetValue(market, "linear");
            }
            Object symbol = this.safeString(market, "symbol", Helpers.GetValue(symbols, i));
            ((java.util.List<Object>)result).add(symbol);
        }
        return result;
    }

    public Object marketCodes(Object... optionalArgs)
    {
        Object codes = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(codes, null)))
        {
            return codes;
        }
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(codes)); i++)
        {
            ((java.util.List<Object>)result).add(this.commonCurrencyCode(Helpers.GetValue(codes, i)));
        }
        return result;
    }

    public Object parseBidsAsks(Object bidasks, Object... optionalArgs)
    {
        Object priceKey = Helpers.getArg(optionalArgs, 0, 0);
        Object amountKey = Helpers.getArg(optionalArgs, 1, 1);
        Object countOrIdKey = Helpers.getArg(optionalArgs, 2, 2);
        bidasks = this.toArray(bidasks);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(bidasks)); i++)
        {
            ((java.util.List<Object>)result).add(this.parseBidAsk(Helpers.GetValue(bidasks, i), priceKey, amountKey, countOrIdKey));
        }
        return result;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchL2OrderBook(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            Object orderbook = (this.fetchOrderBook(symbol, limit, parameters)).join();
            return this.extend(orderbook, new java.util.HashMap<String, Object>() {{
                put( "asks", Exchange.this.sortBy(Exchange.this.aggregate(Helpers.GetValue(orderbook, "asks")), 0) );
                put( "bids", Exchange.this.sortBy(Exchange.this.aggregate(Helpers.GetValue(orderbook, "bids")), 0, true) );
            }});
        });

    }

    public Object filterBySymbol(Object objects, Object... optionalArgs)
    {
        Object symbol = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(symbol, null)))
        {
            return objects;
        }
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(objects)); i++)
        {
            Object objectSymbol = this.safeString(Helpers.GetValue(objects, i), "symbol");
            if (Helpers.isTrue(Helpers.isEqual(objectSymbol, symbol)))
            {
                ((java.util.List<Object>)result).add(Helpers.GetValue(objects, i));
            }
        }
        return result;
    }

    public Object parseOHLCV(Object ohlcv, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(((ohlcv instanceof java.util.List) || (ohlcv.getClass().isArray()))))
        {
            return new java.util.ArrayList<Object>(java.util.Arrays.asList(this.safeInteger(ohlcv, 0), this.safeNumber(ohlcv, 1), this.safeNumber(ohlcv, 2), this.safeNumber(ohlcv, 3), this.safeNumber(ohlcv, 4), this.safeNumber(ohlcv, 5)));
        }
        return ohlcv;
    }

    public Object networkCodeToId(Object networkCode, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @name exchange#networkCodeToId
        * @description tries to convert the provided networkCode (which is expected to be an unified network code) to a network id. In order to achieve this, derived class needs to have 'options->networks' defined.
        * @param {string} networkCode unified network code
        * @param {string} currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
        * @returns {string|undefined} exchange-specific network id
        */
        Object currencyCode = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(networkCode, null)))
        {
            return null;
        }
        Object networkIdsByCodes = this.safeValue(this.options, "networks", new java.util.HashMap<String, Object>() {{}});
        Object networkId = this.safeString(networkIdsByCodes, networkCode);
        // for example, if 'ETH' is passed for networkCode, but 'ETH' key not defined in `options->networks` object
        if (Helpers.isTrue(Helpers.isEqual(networkId, null)))
        {
            if (Helpers.isTrue(Helpers.isEqual(currencyCode, null)))
            {
                Object currencies = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)this.currencies).values());
                for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(currencies)); i++)
                {
                    Object currency = Helpers.GetValue(currencies, i);
                    Object networks = this.safeDict(currency, "networks");
                    Object network = this.safeDict(networks, networkCode);
                    networkId = this.safeString(network, "id");
                    if (Helpers.isTrue(!Helpers.isEqual(networkId, null)))
                    {
                        break;
                    }
                }
            } else
            {
                // if currencyCode was provided, then we try to find if that currencyCode has a replacement (i.e. ERC20 for ETH) or is in the currency
                Object defaultNetworkCodeReplacements = this.safeValue(this.options, "defaultNetworkCodeReplacements", new java.util.HashMap<String, Object>() {{}});
                if (Helpers.isTrue(Helpers.inOp(defaultNetworkCodeReplacements, currencyCode)))
                {
                    // if there is a replacement for the passed networkCode, then we use it to find network-id in `options->networks` object
                    Object replacementObject = Helpers.GetValue(defaultNetworkCodeReplacements, currencyCode); // i.e. { 'ERC20': 'ETH' }
                    Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)replacementObject).keySet());
                    for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
                    {
                        Object key = Helpers.GetValue(keys, i);
                        Object value = Helpers.GetValue(replacementObject, key);
                        // if value matches to provided unified networkCode, then we use it's key to find network-id in `options->networks` object
                        if (Helpers.isTrue(Helpers.isEqual(value, networkCode)))
                        {
                            networkId = this.safeString(networkIdsByCodes, key);
                            break;
                        }
                    }
                } else
                {
                    // serach for network inside currency
                    Object currency = this.safeDict(this.currencies, currencyCode);
                    Object networks = this.safeDict(currency, "networks");
                    Object network = this.safeDict(networks, networkCode);
                    networkId = this.safeString(network, "id");
                }
            }
            // if it wasn't found, we just set the provided value to network-id
            if (Helpers.isTrue(Helpers.isEqual(networkId, null)))
            {
                networkId = networkCode;
            }
        }
        return networkId;
    }

    public Object networkIdToCode(Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @name exchange#networkIdToCode
        * @description tries to convert the provided exchange-specific networkId to an unified network Code. In order to achieve this, derived class needs to have "options['networksById']" defined.
        * @param {string} networkId exchange specific network id/title, like: TRON, Trc-20, usdt-erc20, etc
        * @param {string|undefined} currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
        * @returns {string|undefined} unified network code
        */
        Object networkId = Helpers.getArg(optionalArgs, 0, null);
        Object currencyCode = Helpers.getArg(optionalArgs, 1, null);
        if (Helpers.isTrue(Helpers.isEqual(networkId, null)))
        {
            return null;
        }
        Object networkCodesByIds = this.safeDict(this.options, "networksById", new java.util.HashMap<String, Object>() {{}});
        Object networkCode = this.safeString(networkCodesByIds, networkId, networkId);
        // replace mainnet network-codes (i.e. ERC20->ETH)
        if (Helpers.isTrue(!Helpers.isEqual(currencyCode, null)))
        {
            Object defaultNetworkCodeReplacements = this.safeDict(this.options, "defaultNetworkCodeReplacements", new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.inOp(defaultNetworkCodeReplacements, currencyCode)))
            {
                Object replacementObject = this.safeDict(defaultNetworkCodeReplacements, currencyCode, new java.util.HashMap<String, Object>() {{}});
                networkCode = this.safeString(replacementObject, networkCode, networkCode);
            }
        }
        return networkCode;
    }

    public Object handleNetworkCodeAndParams(Object parameters)
    {
        Object networkCodeInParams = this.safeString2(parameters, "networkCode", "network");
        if (Helpers.isTrue(!Helpers.isEqual(networkCodeInParams, null)))
        {
            parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList("networkCode", "network")));
        }
        // if it was not defined by user, we should not set it from 'defaultNetworks', because handleNetworkCodeAndParams is for only request-side and thus we do not fill it with anything. We can only use 'defaultNetworks' after parsing response-side
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(networkCodeInParams, parameters));
    }

    public Object defaultNetworkCode(Object currencyCode)
    {
        Object defaultNetworkCode = null;
        Object defaultNetworks = this.safeDict(this.options, "defaultNetworks", new java.util.HashMap<String, Object>() {{}});
        if (Helpers.isTrue(Helpers.inOp(defaultNetworks, currencyCode)))
        {
            // if currency had set its network in "defaultNetworks", use it
            defaultNetworkCode = Helpers.GetValue(defaultNetworks, currencyCode);
        } else
        {
            // otherwise, try to use the global-scope 'defaultNetwork' value (even if that network is not supported by currency, it doesn't make any problem, this will be just used "at first" if currency supports this network at all)
            Object defaultNetwork = this.safeString(this.options, "defaultNetwork");
            if (Helpers.isTrue(!Helpers.isEqual(defaultNetwork, null)))
            {
                defaultNetworkCode = defaultNetwork;
            }
        }
        return defaultNetworkCode;
    }

    public Object selectNetworkCodeFromUnifiedNetworks(Object currencyCode, Object networkCode, Object indexedNetworkEntries)
    {
        return this.selectNetworkKeyFromNetworks(currencyCode, networkCode, indexedNetworkEntries, true);
    }

    public Object selectNetworkIdFromRawNetworks(Object currencyCode, Object networkCode, Object indexedNetworkEntries)
    {
        return this.selectNetworkKeyFromNetworks(currencyCode, networkCode, indexedNetworkEntries, false);
    }

    public Object selectNetworkKeyFromNetworks(Object currencyCode, Object networkCode, Object indexedNetworkEntries, Object... optionalArgs)
    {
        // this method is used against raw & unparse network entries, which are just indexed by network id
        Object isIndexedByUnifiedNetworkCode = Helpers.getArg(optionalArgs, 0, false);
        Object chosenNetworkId = null;
        Object availableNetworkIds = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)indexedNetworkEntries).keySet());
        Object responseNetworksLength = Helpers.getArrayLength(availableNetworkIds);
        if (Helpers.isTrue(!Helpers.isEqual(networkCode, null)))
        {
            if (Helpers.isTrue(Helpers.isEqual(responseNetworksLength, 0)))
            {
                throw new NotSupported((String)Helpers.add(Helpers.add(Helpers.add(Helpers.add(this.id, " - "), networkCode), " network did not return any result for "), currencyCode)) ;
            } else
            {
                // if networkCode was provided by user, we should check it after response, as the referenced exchange doesn't support network-code during request
                Object networkIdOrCode = ((Helpers.isTrue(isIndexedByUnifiedNetworkCode))) ? networkCode : this.networkCodeToId(networkCode, currencyCode);
                if (Helpers.isTrue(Helpers.inOp(indexedNetworkEntries, networkIdOrCode)))
                {
                    chosenNetworkId = networkIdOrCode;
                } else
                {
                    throw new NotSupported((String)Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(this.id, " - "), networkIdOrCode), " network was not found for "), currencyCode), ", use one of "), String.join((String)", ", (java.util.List<String>)availableNetworkIds))) ;
                }
            }
        } else
        {
            if (Helpers.isTrue(Helpers.isEqual(responseNetworksLength, 0)))
            {
                throw new NotSupported((String)Helpers.add(Helpers.add(this.id, " - no networks were returned for "), currencyCode)) ;
            } else
            {
                // if networkCode was not provided by user, then we try to use the default network (if it was defined in "defaultNetworks"), otherwise, we just return the first network entry
                Object defaultNetworkCode = this.defaultNetworkCode(currencyCode);
                Object defaultNetworkId = ((Helpers.isTrue(isIndexedByUnifiedNetworkCode))) ? defaultNetworkCode : this.networkCodeToId(defaultNetworkCode, currencyCode);
                if (Helpers.isTrue(Helpers.inOp(indexedNetworkEntries, defaultNetworkId)))
                {
                    return defaultNetworkId;
                }
                throw new NotSupported((String)Helpers.add(Helpers.add(this.id, " - can not determine the default network, please pass param[\"network\"] one from : "), String.join((String)", ", (java.util.List<String>)availableNetworkIds))) ;
            }
        }
        return chosenNetworkId;
    }

    public Object safeNumber2(Object dictionary, Object key1, Object key2, Object... optionalArgs)
    {
        Object d = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeString2(dictionary, key1, key2);
        return this.parseNumber(value, d);
    }

    public Object parseOrderBook(Object orderbook, Object symbol, Object... optionalArgs)
    {
        Object timestamp = Helpers.getArg(optionalArgs, 0, null);
        Object bidsKey = Helpers.getArg(optionalArgs, 1, "bids");
        Object asksKey = Helpers.getArg(optionalArgs, 2, "asks");
        Object priceKey = Helpers.getArg(optionalArgs, 3, 0);
        Object amountKey = Helpers.getArg(optionalArgs, 4, 1);
        Object countOrIdKey = Helpers.getArg(optionalArgs, 5, 2);
        Object bids = this.parseBidsAsks(this.safeValue(orderbook, bidsKey, new java.util.ArrayList<Object>(java.util.Arrays.asList())), priceKey, amountKey, countOrIdKey);
        Object asks = this.parseBidsAsks(this.safeValue(orderbook, asksKey, new java.util.ArrayList<Object>(java.util.Arrays.asList())), priceKey, amountKey, countOrIdKey);
        return new java.util.HashMap<String, Object>() {{
            put( "symbol", symbol );
            put( "bids", Exchange.this.sortBy(bids, 0, true) );
            put( "asks", Exchange.this.sortBy(asks, 0) );
            put( "timestamp", timestamp );
            put( "datetime", Exchange.this.iso8601(timestamp) );
            put( "nonce", null );
        }};
    }

    public Object parseOHLCVs(Object ohlcvs, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object timeframe = Helpers.getArg(optionalArgs, 1, "1m");
        Object since = Helpers.getArg(optionalArgs, 2, null);
        Object limit = Helpers.getArg(optionalArgs, 3, null);
        Object tail = Helpers.getArg(optionalArgs, 4, false);
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(ohlcvs)); i++)
        {
            ((java.util.List<Object>)results).add(this.parseOHLCV(Helpers.GetValue(ohlcvs, i), market));
        }
        Object sorted = this.sortBy(results, 0);
        return this.filterBySinceLimit(sorted, since, limit, 0, tail);
    }

    public Object parseLeverageTiers(Object response, Object... optionalArgs)
    {
        // marketIdKey should only be undefined when response is a dictionary.
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object marketIdKey = Helpers.getArg(optionalArgs, 1, null);
        symbols = this.marketSymbols(symbols);
        Object tiers = new java.util.HashMap<String, Object>() {{}};
        Object symbolsLength = 0;
        if (Helpers.isTrue(!Helpers.isEqual(symbols, null)))
        {
            symbolsLength = Helpers.getArrayLength(symbols);
        }
        Object noSymbols = Helpers.isTrue((Helpers.isEqual(symbols, null))) || Helpers.isTrue((Helpers.isEqual(symbolsLength, 0)));
        if (Helpers.isTrue(((response instanceof java.util.List) || (response.getClass().isArray()))))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
            {
                Object item = Helpers.GetValue(response, i);
                Object id = this.safeString(item, marketIdKey);
                Object market = this.safeMarket(id, null, null, "swap");
                Object symbol = Helpers.GetValue(market, "symbol");
                Object contract = this.safeBool(market, "contract", false);
                if (Helpers.isTrue(Helpers.isTrue(contract) && Helpers.isTrue((Helpers.isTrue(noSymbols) || Helpers.isTrue(this.inArray(symbol, symbols))))))
                {
                    Helpers.addElementToObject(tiers, symbol, this.parseMarketLeverageTiers(item, market));
                }
            }
        } else
        {
            Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)response).keySet());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
            {
                Object marketId = Helpers.GetValue(keys, i);
                Object item = Helpers.GetValue(response, marketId);
                Object market = this.safeMarket(marketId, null, null, "swap");
                Object symbol = Helpers.GetValue(market, "symbol");
                Object contract = this.safeBool(market, "contract", false);
                if (Helpers.isTrue(Helpers.isTrue(contract) && Helpers.isTrue((Helpers.isTrue(noSymbols) || Helpers.isTrue(this.inArray(symbol, symbols))))))
                {
                    Helpers.addElementToObject(tiers, symbol, this.parseMarketLeverageTiers(item, market));
                }
            }
        }
        return tiers;
    }

    public java.util.concurrent.CompletableFuture<Object> loadTradingLimits(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object reload = Helpers.getArg(optionalArgs, 1, false);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchTradingLimits")))
            {
                if (Helpers.isTrue(Helpers.isTrue(reload) || !Helpers.isTrue((Helpers.inOp(this.options, "limitsLoaded")))))
                {
                    Object response = (this.fetchTradingLimits(symbols)).join();
                    for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(symbols)); i++)
                    {
                        Object symbol = Helpers.GetValue(symbols, i);
                        Helpers.addElementToObject(this.markets, symbol, this.deepExtend(Helpers.GetValue(this.markets, symbol), Helpers.GetValue(response, symbol)));
                    }
                    Helpers.addElementToObject(this.options, "limitsLoaded", this.milliseconds());
                }
            }
            return this.markets;
        });

    }

    public Object safePosition(Object position)
    {
        // simplified version of: /pull/12765/
        Object unrealizedPnlString = this.safeString(position, "unrealisedPnl");
        Object initialMarginString = this.safeString(position, "initialMargin");
        //
        // PERCENTAGE
        //
        Object percentage = this.safeValue(position, "percentage");
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(percentage, null))) && Helpers.isTrue((!Helpers.isEqual(unrealizedPnlString, null)))) && Helpers.isTrue((!Helpers.isEqual(initialMarginString, null)))))
        {
            // as it was done in all implementations ( aax, btcex, bybit, deribit, ftx, gate, kucoinfutures, phemex )
            Object percentageString = Precise.stringMul(Precise.stringDiv(unrealizedPnlString, initialMarginString, 4), "100");
            Helpers.addElementToObject(position, "percentage", this.parseNumber(percentageString));
        }
        // if contractSize is undefined get from market
        Object contractSize = this.safeNumber(position, "contractSize");
        Object symbol = this.safeString(position, "symbol");
        Object market = null;
        if (Helpers.isTrue(!Helpers.isEqual(symbol, null)))
        {
            market = this.safeValue(this.markets, symbol);
        }
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(contractSize, null)) && Helpers.isTrue(!Helpers.isEqual(market, null))))
        {
            contractSize = this.safeNumber(market, "contractSize");
            Helpers.addElementToObject(position, "contractSize", contractSize);
        }
        return position;
    }

    public Object parsePositions(Object positions, Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
        symbols = this.marketSymbols(symbols);
        positions = this.toArray(positions);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(positions)); i++)
        {
            Object position = this.extend(this.parsePosition(Helpers.GetValue(positions, i)), parameters);
            ((java.util.List<Object>)result).add(position);
        }
        return this.filterByArrayPositions(result, "symbol", symbols, false);
    }

    public Object parseAccounts(Object accounts, Object... optionalArgs)
    {
        Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        accounts = this.toArray(accounts);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(accounts)); i++)
        {
            Object account = this.extend(this.parseAccount(Helpers.GetValue(accounts, i)), parameters);
            ((java.util.List<Object>)result).add(account);
        }
        return result;
    }

    public Object parseTradesHelper(Object isWs, Object trades, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
        trades = this.toArray(trades);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(trades)); i++)
        {
            Object parsed = null;
            if (Helpers.isTrue(isWs))
            {
                parsed = this.parseWsTrade(Helpers.GetValue(trades, i), market);
            } else
            {
                parsed = this.parseTrade(Helpers.GetValue(trades, i), market);
            }
            Object trade = this.extend(parsed, parameters);
            ((java.util.List<Object>)result).add(trade);
        }
        result = this.sortBy2(result, "timestamp", "id");
        Object symbol = ((Helpers.isTrue((!Helpers.isEqual(market, null))))) ? Helpers.GetValue(market, "symbol") : null;
        return this.filterBySymbolSinceLimit(result, symbol, since, limit);
    }

    public Object parseTrades(Object trades, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
        return this.parseTradesHelper(false, trades, market, since, limit, parameters);
    }

    public Object parseWsTrades(Object trades, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
        return this.parseTradesHelper(true, trades, market, since, limit, parameters);
    }

    public Object parseTransactions(Object transactions, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
        transactions = this.toArray(transactions);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(transactions)); i++)
        {
            Object transaction = this.extend(this.parseTransaction(Helpers.GetValue(transactions, i), currency), parameters);
            ((java.util.List<Object>)result).add(transaction);
        }
        result = this.sortBy(result, "timestamp");
        Object code = ((Helpers.isTrue((!Helpers.isEqual(currency, null))))) ? Helpers.GetValue(currency, "code") : null;
        return this.filterByCurrencySinceLimit(result, code, since, limit);
    }

    public Object parseTransfers(Object transfers, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
        transfers = this.toArray(transfers);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(transfers)); i++)
        {
            Object transfer = this.extend(this.parseTransfer(Helpers.GetValue(transfers, i), currency), parameters);
            ((java.util.List<Object>)result).add(transfer);
        }
        result = this.sortBy(result, "timestamp");
        Object code = ((Helpers.isTrue((!Helpers.isEqual(currency, null))))) ? Helpers.GetValue(currency, "code") : null;
        return this.filterByCurrencySinceLimit(result, code, since, limit);
    }

    public Object parseLedger(Object data, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object arrayData = this.toArray(data);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(arrayData)); i++)
        {
            Object itemOrItems = this.parseLedgerEntry(Helpers.GetValue(arrayData, i), currency);
            if (Helpers.isTrue(((itemOrItems instanceof java.util.List) || (itemOrItems.getClass().isArray()))))
            {
                for (var j = 0; Helpers.isLessThan(j, Helpers.getArrayLength(itemOrItems)); j++)
                {
                    ((java.util.List<Object>)result).add(this.extend(Helpers.GetValue(itemOrItems, j), parameters));
                }
            } else
            {
                ((java.util.List<Object>)result).add(this.extend(itemOrItems, parameters));
            }
        }
        result = this.sortBy(result, "timestamp");
        Object code = ((Helpers.isTrue((!Helpers.isEqual(currency, null))))) ? Helpers.GetValue(currency, "code") : null;
        return this.filterByCurrencySinceLimit(result, code, since, limit);
    }

    public Object nonce()
    {
        return this.seconds();
    }

    public Object setHeaders(Object headers)
    {
        return headers;
    }

    public Object currencyId(Object code)
    {
        Object currency = this.safeDict(this.currencies, code);
        if (Helpers.isTrue(Helpers.isEqual(currency, null)))
        {
            currency = this.safeCurrency(code);
        }
        if (Helpers.isTrue(!Helpers.isEqual(currency, null)))
        {
            return Helpers.GetValue(currency, "id");
        }
        return code;
    }

    public Object marketId(Object symbol)
    {
        Object market = this.market(symbol);
        if (Helpers.isTrue(!Helpers.isEqual(market, null)))
        {
            return Helpers.GetValue(market, "id");
        }
        return symbol;
    }

    public Object symbol(Object symbol)
    {
        Object market = this.market(symbol);
        return this.safeString(market, "symbol", symbol);
    }

    public Object handleParamString(Object parameters, Object paramName, Object... optionalArgs)
    {
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeString(parameters, paramName, defaultValue);
        if (Helpers.isTrue(!Helpers.isEqual(value, null)))
        {
            parameters = this.omit(parameters, paramName);
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(value, parameters));
    }

    public Object handleParamString2(Object parameters, Object paramName1, Object paramName2, Object... optionalArgs)
    {
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeString2(parameters, paramName1, paramName2, defaultValue);
        if (Helpers.isTrue(!Helpers.isEqual(value, null)))
        {
            parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList(paramName1, paramName2)));
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(value, parameters));
    }

    public Object handleParamInteger(Object parameters, Object paramName, Object... optionalArgs)
    {
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeInteger(parameters, paramName, defaultValue);
        if (Helpers.isTrue(!Helpers.isEqual(value, null)))
        {
            parameters = this.omit(parameters, paramName);
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(value, parameters));
    }

    public Object handleParamInteger2(Object parameters, Object paramName1, Object paramName2, Object... optionalArgs)
    {
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeInteger2(parameters, paramName1, paramName2, defaultValue);
        if (Helpers.isTrue(!Helpers.isEqual(value, null)))
        {
            parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList(paramName1, paramName2)));
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(value, parameters));
    }

    public Object handleParamBool(Object parameters, Object paramName, Object... optionalArgs)
    {
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeBool(parameters, paramName, defaultValue);
        if (Helpers.isTrue(!Helpers.isEqual(value, null)))
        {
            parameters = this.omit(parameters, paramName);
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(value, parameters));
    }

    public Object handleParamBool2(Object parameters, Object paramName1, Object paramName2, Object... optionalArgs)
    {
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeBool2(parameters, paramName1, paramName2, defaultValue);
        if (Helpers.isTrue(!Helpers.isEqual(value, null)))
        {
            parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList(paramName1, paramName2)));
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(value, parameters));
    }

    /**
     * @param {object} params - extra parameters
     * @param {object} request - existing dictionary of request
     * @param {string} exchangeSpecificKey - the key for chain id to be set in request
     * @param {object} currencyCode - (optional) existing dictionary of request
     * @param {boolean} isRequired - (optional) whether that param is required to be present
     * @returns {object[]} - returns [request, params] where request is the modified request object and params is the modified params object
     */
    public Object handleRequestNetwork(Object parameters, Object request, Object exchangeSpecificKey, Object... optionalArgs)
    {
        Object currencyCode = Helpers.getArg(optionalArgs, 0, null);
        Object isRequired = Helpers.getArg(optionalArgs, 1, false);
        Object networkCode = null;
        var networkCodeparametersVariable = this.handleNetworkCodeAndParams(parameters);
        networkCode = ((java.util.List<Object>) networkCodeparametersVariable).get(0);
        parameters = ((java.util.List<Object>) networkCodeparametersVariable).get(1);
        if (Helpers.isTrue(!Helpers.isEqual(networkCode, null)))
        {
            Helpers.addElementToObject(request, exchangeSpecificKey, this.networkCodeToId(networkCode, currencyCode));
        } else if (Helpers.isTrue(isRequired))
        {
            throw new ArgumentsRequired((String)Helpers.add(this.id, " - \"network\" param is required for this request")) ;
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(request, parameters));
    }

    public Object resolvePath(Object path, Object parameters)
    {
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(this.implodeParams(path, parameters), this.omit(parameters, this.extractParams(path))));
    }

    public Object getListFromObjectValues(Object objects, Object key)
    {
        Object newArray = objects;
        if (!Helpers.isTrue(((objects instanceof java.util.List) || (objects.getClass().isArray()))))
        {
            newArray = this.toArray(objects);
        }
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(newArray)); i++)
        {
            ((java.util.List<Object>)results).add(Helpers.GetValue(Helpers.GetValue(newArray, i), key));
        }
        return results;
    }

    public Object getSymbolsForMarketType(Object... optionalArgs)
    {
        Object marketType = Helpers.getArg(optionalArgs, 0, null);
        Object subType = Helpers.getArg(optionalArgs, 1, null);
        Object symbolWithActiveStatus = Helpers.getArg(optionalArgs, 2, true);
        Object symbolWithUnknownStatus = Helpers.getArg(optionalArgs, 3, true);
        Object filteredMarkets = this.markets;
        if (Helpers.isTrue(!Helpers.isEqual(marketType, null)))
        {
            filteredMarkets = this.filterBy(filteredMarkets, "type", marketType);
        }
        if (Helpers.isTrue(!Helpers.isEqual(subType, null)))
        {
            this.checkRequiredArgument("getSymbolsForMarketType", subType, "subType", new java.util.ArrayList<Object>(java.util.Arrays.asList("linear", "inverse", "quanto")));
            filteredMarkets = this.filterBy(filteredMarkets, "subType", subType);
        }
        Object activeStatuses = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        if (Helpers.isTrue(symbolWithActiveStatus))
        {
            ((java.util.List<Object>)activeStatuses).add(true);
        }
        if (Helpers.isTrue(symbolWithUnknownStatus))
        {
            ((java.util.List<Object>)activeStatuses).add(null);
        }
        filteredMarkets = this.filterByArray(filteredMarkets, "active", activeStatuses, false);
        return this.getListFromObjectValues(filteredMarkets, "symbol");
    }

    public Object filterByArray(Object objects, Object key, Object... optionalArgs)
    {
        Object values = Helpers.getArg(optionalArgs, 0, null);
        Object indexed = Helpers.getArg(optionalArgs, 1, true);
        objects = this.toArray(objects);
        // return all of them if no values were passed
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(values, null)) || !Helpers.isTrue(values)))
        {
            // return indexed ? this.indexBy (objects, key) : objects;
            if (Helpers.isTrue(indexed))
            {
                return this.indexBy(objects, key);
            } else
            {
                return objects;
            }
        }
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(objects)); i++)
        {
            if (Helpers.isTrue(this.inArray(Helpers.GetValue(Helpers.GetValue(objects, i), key), values)))
            {
                ((java.util.List<Object>)results).add(Helpers.GetValue(objects, i));
            }
        }
        // return indexed ? this.indexBy (results, key) : results;
        if (Helpers.isTrue(indexed))
        {
            return this.indexBy(results, key);
        }
        return results;
    }

    public java.util.concurrent.CompletableFuture<Object> fetch2(Object path, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object api = Helpers.getArg(optionalArgs, 0, "public");
            Object method = Helpers.getArg(optionalArgs, 1, "GET");
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            Object headers = Helpers.getArg(optionalArgs, 3, null);
            Object body = Helpers.getArg(optionalArgs, 4, null);
            Object config = Helpers.getArg(optionalArgs, 5, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(this.enableRateLimit))
            {
                Object cost = this.calculateRateLimiterCost(api, method, path, parameters, config);
                (this.throttle(cost)).join();
            }
            Object retries = null;
            var retriesparametersVariable = this.handleOptionAndParams(parameters, path, "maxRetriesOnFailure", 0);
            retries = ((java.util.List<Object>) retriesparametersVariable).get(0);
            parameters = ((java.util.List<Object>) retriesparametersVariable).get(1);
            Object retryDelay = null;
            var retryDelayparametersVariable = this.handleOptionAndParams(parameters, path, "maxRetriesOnFailureDelay", 0);
            retryDelay = ((java.util.List<Object>) retryDelayparametersVariable).get(0);
            parameters = ((java.util.List<Object>) retryDelayparametersVariable).get(1);
            this.lastRestRequestTimestamp = this.milliseconds();
            Object request = this.sign(path, api, method, parameters, headers, body);
            this.last_request_headers = Helpers.GetValue(request, "headers");
            this.last_request_body = Helpers.GetValue(request, "body");
            this.last_request_url = Helpers.GetValue(request, "url");
            for (var i = 0; Helpers.isLessThan(i, Helpers.add(retries, 1)); i++)
            {
                try
                {
                    return (this.fetch(Helpers.GetValue(request, "url"), Helpers.GetValue(request, "method"), Helpers.GetValue(request, "headers"), Helpers.GetValue(request, "body"))).join();
                } catch(Exception e)
                {
                    if (Helpers.isTrue(Helpers.isInstance(e, OperationFailed.class)))
                    {
                        if (Helpers.isTrue(Helpers.isLessThan(i, retries)))
                        {
                            if (Helpers.isTrue(this.verbose))
                            {
                                Object index = Helpers.add(i, 1);
                                this.log(Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add("Request failed with the error: ", String.valueOf(e)), ", retrying "), String.valueOf(index)), " of "), String.valueOf(retries)), "..."));
                            }
                            if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(retryDelay, null))) && Helpers.isTrue((!Helpers.isEqual(retryDelay, 0)))))
                            {
                                (this.sleep(retryDelay)).join();
                            }
                        } else
                        {
                            throw e;
                        }
                    } else
                    {
                        throw e;
                    }
                }
            }
            return null;  // this line is never reached, but exists for c# value return requirement
        });

    }

    public java.util.concurrent.CompletableFuture<Object> request(Object path, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object api = Helpers.getArg(optionalArgs, 0, "public");
            Object method = Helpers.getArg(optionalArgs, 1, "GET");
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            Object headers = Helpers.getArg(optionalArgs, 3, null);
            Object body = Helpers.getArg(optionalArgs, 4, null);
            Object config = Helpers.getArg(optionalArgs, 5, new java.util.HashMap<String, Object>() {{}});
            return (this.fetch2(path, api, method, parameters, headers, body, config)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> loadAccounts(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object reload = Helpers.getArg(optionalArgs, 0, false);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(reload))
            {
                this.accounts = (this.fetchAccounts(parameters)).join();
            } else
            {
                if (Helpers.isTrue(this.accounts))
                {
                    return this.accounts;
                } else
                {
                    this.accounts = (this.fetchAccounts(parameters)).join();
                }
            }
            this.accountsById = ((Object)this.indexBy(this.accounts, "id"));
            return this.accounts;
        });

    }

    public Object buildOHLCVC(Object trades, Object... optionalArgs)
    {
        // given a sorted arrays of trades (recent last) and a timeframe builds an array of OHLCV candles
        // note, default limit value (2147483647) is max int32 value
        Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
        Object since = Helpers.getArg(optionalArgs, 1, 0);
        Object limit = Helpers.getArg(optionalArgs, 2, 2147483647);
        Object ms = Helpers.multiply(this.parseTimeframe(timeframe), 1000);
        Object ohlcvs = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object i_timestamp = 0;
        // const open = 1;
        Object i_high = 2;
        Object i_low = 3;
        Object i_close = 4;
        Object i_volume = 5;
        Object i_count = 6;
        Object tradesLength = Helpers.getArrayLength(trades);
        Object oldest = Helpers.mathMin(tradesLength, limit);
        Object options = this.safeDict(this.options, "buildOHLCVC", new java.util.HashMap<String, Object>() {{}});
        Object skipZeroPrices = this.safeBool(options, "skipZeroPrices", true);
        for (var i = 0; Helpers.isLessThan(i, oldest); i++)
        {
            Object trade = Helpers.GetValue(trades, i);
            Object ts = Helpers.GetValue(trade, "timestamp");
            Object price = Helpers.GetValue(trade, "price");
            if (Helpers.isTrue(Helpers.isLessThan(ts, since)))
            {
                continue;
            }
            Object openingTime = Helpers.multiply((Math.floor(Double.parseDouble(Helpers.toString(Helpers.divide(ts, ms))))), ms); // shift to the edge of m/h/d (but not M)
            if (Helpers.isTrue(Helpers.isLessThan(openingTime, since)))
            {
                continue;
            }
            Object ohlcv_length = Helpers.getArrayLength(ohlcvs);
            Object candle = Helpers.subtract(ohlcv_length, 1);
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue(skipZeroPrices) && !Helpers.isTrue((Helpers.isGreaterThan(price, 0)))) && !Helpers.isTrue((Helpers.isLessThan(price, 0)))))
            {
                continue;
            }
            Object isFirstCandle = Helpers.isEqual(candle, Helpers.opNeg(1));
            if (Helpers.isTrue(Helpers.isTrue(isFirstCandle) || Helpers.isTrue(Helpers.isGreaterThanOrEqual(openingTime, this.sum(Helpers.GetValue(Helpers.GetValue(ohlcvs, candle), i_timestamp), ms)))))
            {
                // moved to a new timeframe -> create a new candle from opening trade
                ((java.util.List<Object>)ohlcvs).add(new java.util.ArrayList<Object>(java.util.Arrays.asList(openingTime, price, price, price, price, Helpers.GetValue(trade, "amount"), 1)));
            } else
            {
                // still processing the same timeframe -> update opening trade
                Helpers.addElementToObject(Helpers.GetValue(ohlcvs, candle), i_high, Helpers.mathMax(Helpers.GetValue(Helpers.GetValue(ohlcvs, candle), i_high), price));
                Helpers.addElementToObject(Helpers.GetValue(ohlcvs, candle), i_low, Helpers.mathMin(Helpers.GetValue(Helpers.GetValue(ohlcvs, candle), i_low), price));
                Helpers.addElementToObject(Helpers.GetValue(ohlcvs, candle), i_close, price);
                Helpers.addElementToObject(Helpers.GetValue(ohlcvs, candle), i_volume, this.sum(Helpers.GetValue(Helpers.GetValue(ohlcvs, candle), i_volume), Helpers.GetValue(trade, "amount")));
                Helpers.addElementToObject(Helpers.GetValue(ohlcvs, candle), i_count, this.sum(Helpers.GetValue(Helpers.GetValue(ohlcvs, candle), i_count), 1));
            }
        }
        return ohlcvs;
    }

    public Object parseTradingViewOHLCV(Object ohlcvs, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object timeframe = Helpers.getArg(optionalArgs, 1, "1m");
        Object since = Helpers.getArg(optionalArgs, 2, null);
        Object limit = Helpers.getArg(optionalArgs, 3, null);
        Object result = this.convertTradingViewToOHLCV(ohlcvs);
        return this.parseOHLCVs(result, market, timeframe, since, limit);
    }

    public java.util.concurrent.CompletableFuture<Object> editLimitBuyOrder(Object id, Object symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.editLimitOrder(id, symbol, "buy", amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editLimitSellOrder(Object id, Object symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.editLimitOrder(id, symbol, "sell", amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editLimitOrder(Object id, Object symbol, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.editOrder(id, symbol, "limit", side, amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editOrder(Object id, Object symbol, Object type, Object side, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object amount = Helpers.getArg(optionalArgs, 0, null);
            Object price = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            (this.cancelOrder(id, symbol)).join();
            return (this.createOrder(symbol, type, side, amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editOrderWithClientOrderId(Object clientOrderId, Object symbol, Object type, Object side, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object amount = Helpers.getArg(optionalArgs, 0, null);
            Object price = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            return (this.editOrder("", symbol, type, side, amount, price, this.extend(new java.util.HashMap<String, Object>() {{
                put( "clientOrderId", clientOrderId );
            }}, parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editOrderWs(Object id, Object symbol, Object type, Object side, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object amount = Helpers.getArg(optionalArgs, 0, null);
            Object price = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            (this.cancelOrderWs(id, symbol)).join();
            return (this.createOrderWs(symbol, type, side, amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPosition(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPosition() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionWs(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPositionWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchPosition(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchPosition() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchPositions(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchPositions() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchPositionForSymbols(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            return (this.watchPositions(symbols, since, limit, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsForSymbol(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPositionsForSymbol() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsForSymbolWs(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPositionsForSymbol() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositions(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPositions() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPositions() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsRisk(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPositionsRisk() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchBidsAsks(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchBidsAsks() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchBorrowInterest(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object symbol = Helpers.getArg(optionalArgs, 1, null);
            Object since = Helpers.getArg(optionalArgs, 2, null);
            Object limit = Helpers.getArg(optionalArgs, 3, null);
            Object parameters = Helpers.getArg(optionalArgs, 4, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchBorrowInterest() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchLedger(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchLedger() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchLedgerEntry(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchLedgerEntry() is not supported yet")) ;
        });

    }

    public Object parseBidAsk(Object bidask, Object... optionalArgs)
    {
        Object priceKey = Helpers.getArg(optionalArgs, 0, 0);
        Object amountKey = Helpers.getArg(optionalArgs, 1, 1);
        Object countOrIdKey = Helpers.getArg(optionalArgs, 2, 2);
        Object price = this.safeFloat(bidask, priceKey);
        Object amount = this.safeFloat(bidask, amountKey);
        Object countOrId = this.safeInteger(bidask, countOrIdKey);
        Object bidAsk = new java.util.ArrayList<Object>(java.util.Arrays.asList(price, amount));
        if (Helpers.isTrue(!Helpers.isEqual(countOrId, null)))
        {
            ((java.util.List<Object>)bidAsk).add(countOrId);
        }
        return bidAsk;
    }

    public Object safeCurrency(Object currencyId, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(currencyId, null))) && Helpers.isTrue((!Helpers.isEqual(currency, null)))))
        {
            return currency;
        }
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.currencies_by_id, null))) && Helpers.isTrue((Helpers.inOp(this.currencies_by_id, currencyId)))) && Helpers.isTrue((!Helpers.isEqual(Helpers.GetValue(this.currencies_by_id, currencyId), null)))))
        {
            return Helpers.GetValue(this.currencies_by_id, currencyId);
        }
        Object code = currencyId;
        if (Helpers.isTrue(!Helpers.isEqual(currencyId, null)))
        {
            code = this.commonCurrencyCode(((String)currencyId).toUpperCase());
        }
        final Object finalCurrencyId = currencyId;
        final Object finalCode = code;
        return this.safeCurrencyStructure(new java.util.HashMap<String, Object>() {{
            put( "id", finalCurrencyId );
            put( "code", finalCode );
            put( "precision", null );
        }});
    }

    public Object safeMarket(Object... optionalArgs)
    {
        Object marketId = Helpers.getArg(optionalArgs, 0, null);
        Object market = Helpers.getArg(optionalArgs, 1, null);
        Object delimiter = Helpers.getArg(optionalArgs, 2, null);
        Object marketType = Helpers.getArg(optionalArgs, 3, null);
        if (Helpers.isTrue(!Helpers.isEqual(marketId, null)))
        {
            if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.markets_by_id, null))) && Helpers.isTrue((Helpers.inOp(this.markets_by_id, marketId)))))
            {
                Object markets = Helpers.GetValue(this.markets_by_id, marketId);
                Object numMarkets = Helpers.getArrayLength(markets);
                if (Helpers.isTrue(Helpers.isEqual(numMarkets, 1)))
                {
                    return Helpers.GetValue(markets, 0);
                } else
                {
                    if (Helpers.isTrue(Helpers.isEqual(marketType, null)))
                    {
                        if (Helpers.isTrue(Helpers.isEqual(market, null)))
                        {
                            throw new ArgumentsRequired((String)Helpers.add(Helpers.add(Helpers.add(this.id, " safeMarket() requires a fourth argument for "), marketId), " to disambiguate between different markets with the same market id")) ;
                        } else
                        {
                            marketType = Helpers.GetValue(market, "type");
                        }
                    }
                    for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(markets)); i++)
                    {
                        Object currentMarket = Helpers.GetValue(markets, i);
                        if (Helpers.isTrue(Helpers.GetValue(currentMarket, marketType)))
                        {
                            return currentMarket;
                        }
                    }
                }
            } else if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(delimiter, null)) && Helpers.isTrue(!Helpers.isEqual(delimiter, ""))))
            {
                Object parts = Helpers.split(marketId, delimiter);
                Object partsLength = Helpers.getArrayLength(parts);
                final Object finalMarketId = marketId;
                Object result = this.safeMarketStructure(new java.util.HashMap<String, Object>() {{
                    put( "symbol", finalMarketId );
                    put( "marketId", finalMarketId );
                }});
                if (Helpers.isTrue(Helpers.isEqual(partsLength, 2)))
                {
                    Helpers.addElementToObject(result, "baseId", this.safeString(parts, 0));
                    Helpers.addElementToObject(result, "quoteId", this.safeString(parts, 1));
                    Helpers.addElementToObject(result, "base", this.safeCurrencyCode(Helpers.GetValue(result, "baseId")));
                    Helpers.addElementToObject(result, "quote", this.safeCurrencyCode(Helpers.GetValue(result, "quoteId")));
                    Helpers.addElementToObject(result, "symbol", Helpers.add(Helpers.add(Helpers.GetValue(result, "base"), "/"), Helpers.GetValue(result, "quote")));
                }
                return result;
            }
        }
        if (Helpers.isTrue(!Helpers.isEqual(market, null)))
        {
            return market;
        }
        final Object finalMarketId = marketId;
        return this.safeMarketStructure(new java.util.HashMap<String, Object>() {{
            put( "symbol", finalMarketId );
            put( "marketId", finalMarketId );
        }});
    }

    public Object marketOrNull(Object... optionalArgs)
    {
        Object symbol = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(symbol, null)))
        {
            return null;
        }
        return this.market(symbol);
    }

    public Object checkRequiredCredentials(Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @param {boolean} error throw an error that a credential is required if true
        * @returns {boolean} true if all required credentials have been set, otherwise false or an error is thrown is param error=true
        */
        Object error = Helpers.getArg(optionalArgs, 0, true);
        Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)this.requiredCredentials).keySet());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
        {
            Object key = Helpers.GetValue(keys, i);
            if (Helpers.isTrue(Helpers.isTrue(Helpers.GetValue(this.requiredCredentials, key)) && !Helpers.isTrue(Helpers.GetValue(this, key))))
            {
                if (Helpers.isTrue(error))
                {
                    throw new AuthenticationError((String)Helpers.add(Helpers.add(Helpers.add(this.id, " requires \""), key), "\" credential")) ;
                } else
                {
                    return false;
                }
            }
        }
        return true;
    }

    public Object oath()
    {
        if (Helpers.isTrue(!Helpers.isEqual(this.twofa, null)))
        {
            return totp(this.twofa);
        } else
        {
            throw new ExchangeError((String)Helpers.add(this.id, " exchange.twofa has not been set for 2FA Two-Factor Authentication")) ;
        }
    }

    public java.util.concurrent.CompletableFuture<Object> fetchBalance(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchBalance() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchBalanceWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchBalanceWs() is not supported yet")) ;
        });

    }

    public Object parseBalance(Object response)
    {
        throw new NotSupported((String)Helpers.add(this.id, " parseBalance() is not supported yet")) ;
    }

    public java.util.concurrent.CompletableFuture<Object> watchBalance(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchBalance() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPartialBalance(Object part, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            Object balance = (this.fetchBalance(parameters)).join();
            return Helpers.GetValue(balance, part);
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchFreeBalance(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.fetchPartialBalance("free", parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchUsedBalance(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.fetchPartialBalance("used", parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTotalBalance(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.fetchPartialBalance("total", parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchStatus(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchStatus() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTransactionFee(Object code, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "fetchTransactionFees")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchTransactionFee() is not supported yet")) ;
            }
            return (this.fetchTransactionFees(new java.util.ArrayList<Object>(java.util.Arrays.asList(code)), parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTransactionFees(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object codes = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTransactionFees() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchDepositWithdrawFees(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object codes = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchDepositWithdrawFees() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchDepositWithdrawFee(Object code, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "fetchDepositWithdrawFees")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchDepositWithdrawFee() is not supported yet")) ;
            }
            Object fees = (this.fetchDepositWithdrawFees(new java.util.ArrayList<Object>(java.util.Arrays.asList(code)), parameters)).join();
            return this.safeValue(fees, code);
        });

    }

    public Object getSupportedMapping(Object key, Object... optionalArgs)
    {
        Object mapping = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        if (Helpers.isTrue(Helpers.inOp(mapping, key)))
        {
            return Helpers.GetValue(mapping, key);
        } else
        {
            throw new NotSupported((String)Helpers.add(Helpers.add(Helpers.add(this.id, " "), key), " does not have a value in mapping")) ;
        }
    }

    public java.util.concurrent.CompletableFuture<Object> fetchCrossBorrowRate(Object code, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            (this.loadMarkets()).join();
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "fetchBorrowRates")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchCrossBorrowRate() is not supported yet")) ;
            }
            Object borrowRates = (this.fetchCrossBorrowRates(parameters)).join();
            Object rate = this.safeValue(borrowRates, code);
            if (Helpers.isTrue(Helpers.isEqual(rate, null)))
            {
                throw new ExchangeError((String)Helpers.add(Helpers.add(this.id, " fetchCrossBorrowRate() could not find the borrow rate for currency code "), code)) ;
            }
            return rate;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchIsolatedBorrowRate(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            (this.loadMarkets()).join();
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "fetchBorrowRates")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchIsolatedBorrowRate() is not supported yet")) ;
            }
            Object borrowRates = (this.fetchIsolatedBorrowRates(parameters)).join();
            Object rate = this.safeDict(borrowRates, symbol);
            if (Helpers.isTrue(Helpers.isEqual(rate, null)))
            {
                throw new ExchangeError((String)Helpers.add(Helpers.add(this.id, " fetchIsolatedBorrowRate() could not find the borrow rate for market symbol "), symbol)) ;
            }
            return rate;
        });

    }

    public Object handleOptionAndParams(Object parameters, Object methodName, Object optionName, Object... optionalArgs)
    {
        // This method can be used to obtain method specific properties, i.e: this.handleOptionAndParams (params, 'fetchPosition', 'marginMode', 'isolated')
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object defaultOptionName = Helpers.add("default", this.capitalize(optionName)); // we also need to check the 'defaultXyzWhatever'
        // check if params contain the key
        Object value = this.safeValue2(parameters, optionName, defaultOptionName);
        if (Helpers.isTrue(!Helpers.isEqual(value, null)))
        {
            parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList(optionName, defaultOptionName)));
        } else
        {
            // handle routed methods like "watchTrades > watchTradesForSymbols" (or "watchTicker > watchTickers")
            var methodNameparametersVariable = this.handleParamString(parameters, "callerMethodName", methodName);
            methodName = ((java.util.List<Object>) methodNameparametersVariable).get(0);
            parameters = ((java.util.List<Object>) methodNameparametersVariable).get(1);
            // check if exchange has properties for this method
            Object exchangeWideMethodOptions = this.safeValue(this.options, methodName);
            if (Helpers.isTrue(!Helpers.isEqual(exchangeWideMethodOptions, null)))
            {
                // check if the option is defined inside this method's props
                value = this.safeValue2(exchangeWideMethodOptions, optionName, defaultOptionName);
            }
            if (Helpers.isTrue(Helpers.isEqual(value, null)))
            {
                // if it's still undefined, check if global exchange-wide option exists
                value = this.safeValue2(this.options, optionName, defaultOptionName);
            }
            // if it's still undefined, use the default value
            value = ((Helpers.isTrue((!Helpers.isEqual(value, null))))) ? value : defaultValue;
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(value, parameters));
    }

    public Object handleOptionAndParams2(Object parameters, Object methodName1, Object optionName1, Object optionName2, Object... optionalArgs)
    {
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = null;
        var valueparametersVariable = this.handleOptionAndParams(parameters, methodName1, optionName1);
        value = ((java.util.List<Object>) valueparametersVariable).get(0);
        parameters = ((java.util.List<Object>) valueparametersVariable).get(1);
        if (Helpers.isTrue(!Helpers.isEqual(value, null)))
        {
            // omit optionName2 too from params
            parameters = this.omit(parameters, optionName2);
            return new java.util.ArrayList<Object>(java.util.Arrays.asList(value, parameters));
        }
        // if still undefined, try optionName2
        Object value2 = null;
        var value2parametersVariable = this.handleOptionAndParams(parameters, methodName1, optionName2, defaultValue);
        value2 = ((java.util.List<Object>) value2parametersVariable).get(0);
        parameters = ((java.util.List<Object>) value2parametersVariable).get(1);
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(value2, parameters));
    }

    public Object handleOption(Object methodName, Object optionName, Object... optionalArgs)
    {
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object res = this.handleOptionAndParams(new java.util.HashMap<String, Object>() {{}}, methodName, optionName, defaultValue);
        return this.safeValue(res, 0);
    }

    public Object handleMarketTypeAndParams(Object methodName, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @name exchange#handleMarketTypeAndParams
        * @param methodName the method calling handleMarketTypeAndParams
        * @param {Market} market
        * @param {object} params
        * @param {string} [params.type] type assigned by user
        * @param {string} [params.defaultType] same as params.type
        * @param {string} [defaultValue] assigned programatically in the method calling handleMarketTypeAndParams
        * @returns {[string, object]} the market type and params with type and defaultType omitted
        */
        // type from param
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
        Object defaultValue = Helpers.getArg(optionalArgs, 2, null);
        Object type = this.safeString2(parameters, "defaultType", "type");
        if (Helpers.isTrue(!Helpers.isEqual(type, null)))
        {
            parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList("defaultType", "type")));
            return new java.util.ArrayList<Object>(java.util.Arrays.asList(type, parameters));
        }
        // type from market
        if (Helpers.isTrue(!Helpers.isEqual(market, null)))
        {
            return new java.util.ArrayList<Object>(java.util.Arrays.asList(Helpers.GetValue(market, "type"), parameters));
        }
        // type from default-argument
        if (Helpers.isTrue(!Helpers.isEqual(defaultValue, null)))
        {
            return new java.util.ArrayList<Object>(java.util.Arrays.asList(defaultValue, parameters));
        }
        Object methodOptions = this.safeDict(this.options, methodName);
        if (Helpers.isTrue(!Helpers.isEqual(methodOptions, null)))
        {
            if (Helpers.isTrue((methodOptions instanceof String)))
            {
                return new java.util.ArrayList<Object>(java.util.Arrays.asList(methodOptions, parameters));
            } else
            {
                Object typeFromMethod = this.safeString2(methodOptions, "defaultType", "type");
                if (Helpers.isTrue(!Helpers.isEqual(typeFromMethod, null)))
                {
                    return new java.util.ArrayList<Object>(java.util.Arrays.asList(typeFromMethod, parameters));
                }
            }
        }
        Object defaultType = this.safeString2(this.options, "defaultType", "type", "spot");
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(defaultType, parameters));
    }

    public Object handleSubTypeAndParams(Object methodName, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
        Object defaultValue = Helpers.getArg(optionalArgs, 2, null);
        Object subType = null;
        // if set in params, it takes precedence
        Object subTypeInParams = this.safeString2(parameters, "subType", "defaultSubType");
        // avoid omitting if it's not present
        if (Helpers.isTrue(!Helpers.isEqual(subTypeInParams, null)))
        {
            subType = subTypeInParams;
            parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList("subType", "defaultSubType")));
        } else
        {
            // at first, check from market object
            if (Helpers.isTrue(!Helpers.isEqual(market, null)))
            {
                if (Helpers.isTrue(Helpers.GetValue(market, "linear")))
                {
                    subType = "linear";
                } else if (Helpers.isTrue(Helpers.GetValue(market, "inverse")))
                {
                    subType = "inverse";
                }
            }
            // if it was not defined in market object
            if (Helpers.isTrue(Helpers.isEqual(subType, null)))
            {
                Object values = this.handleOptionAndParams(new java.util.HashMap<String, Object>() {{}}, methodName, "subType", defaultValue); // no need to re-test params here
                subType = Helpers.GetValue(values, 0);
            }
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(subType, parameters));
    }

    public Object handleMarginModeAndParams(Object methodName, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @param {object} [params] extra parameters specific to the exchange API endpoint
        * @returns {Array} the marginMode in lowercase as specified by params["marginMode"], params["defaultMarginMode"] this.options["marginMode"] or this.options["defaultMarginMode"]
        */
        Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        Object defaultValue = Helpers.getArg(optionalArgs, 1, null);
        return this.handleOptionAndParams(parameters, methodName, "marginMode", defaultValue);
    }

    public void throwExactlyMatchedException(Object exact, Object str, Object message)
    {
        if (Helpers.isTrue(Helpers.isEqual(str, null)))
        {
            return;
        }
        if (Helpers.isTrue(Helpers.inOp(exact, str)))
        {
            Helpers.throwDynamicException(Helpers.GetValue(exact, str), message);
        }
    }

    public void throwBroadlyMatchedException(Object broad, Object str, Object message)
    {
        Object broadKey = this.findBroadlyMatchedKey(broad, str);
        if (Helpers.isTrue(!Helpers.isEqual(broadKey, null)))
        {
            Helpers.throwDynamicException(Helpers.GetValue(broad, broadKey), message);
        }
    }

    public Object findBroadlyMatchedKey(Object broad, Object str)
    {
        // a helper for matching error strings exactly vs broadly
        Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)broad).keySet());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
        {
            Object key = Helpers.GetValue(keys, i);
            if (Helpers.isTrue(!Helpers.isEqual(str, null)))
            {
                if (Helpers.isTrue(Helpers.isGreaterThanOrEqual(Helpers.getIndexOf(str, key), 0)))
                {
                    return key;
                }
            }
        }
        return null;
    }

    public Object handleErrors(Object statusCode, Object statusText, Object url, Object method, Object responseHeaders, Object responseBody, Object response, Object requestHeaders, Object requestBody)
    {
        // it is a stub method that must be overrided in the derived exchange classes
        // throw new NotSupported (this.id + ' handleErrors() not implemented yet');
        return null;
    }

    public Object calculateRateLimiterCost(Object api, Object method, Object path, Object parameters, Object... optionalArgs)
    {
        Object config = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        return this.safeValue(config, "cost", 1);
    }

    public java.util.concurrent.CompletableFuture<Object> fetchTicker(Object symbol2, Object... optionalArgs)
    {
        final Object symbol3 = symbol2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = symbol3;
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchTickers")))
            {
                (this.loadMarkets()).join();
                Object market = this.market(symbol);
                symbol = Helpers.GetValue(market, "symbol");
                Object tickers = (this.fetchTickers(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), parameters)).join();
                Object ticker = this.safeDict(tickers, symbol);
                if (Helpers.isTrue(Helpers.isEqual(ticker, null)))
                {
                    throw new NullResponse((String)Helpers.add(Helpers.add(this.id, " fetchTickers() could not find a ticker for "), symbol)) ;
                } else
                {
                    return ticker;
                }
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchTicker() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMarkPrice(Object symbol2, Object... optionalArgs)
    {
        final Object symbol3 = symbol2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = symbol3;
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchMarkPrices")))
            {
                (this.loadMarkets()).join();
                Object market = this.market(symbol);
                symbol = Helpers.GetValue(market, "symbol");
                Object tickers = (this.fetchMarkPrices(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), parameters)).join();
                Object ticker = this.safeDict(tickers, symbol);
                if (Helpers.isTrue(Helpers.isEqual(ticker, null)))
                {
                    throw new NullResponse((String)Helpers.add(Helpers.add(this.id, " fetchMarkPrices() could not find a ticker for "), symbol)) ;
                } else
                {
                    return ticker;
                }
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchMarkPrices() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTickerWs(Object symbol2, Object... optionalArgs)
    {
        final Object symbol3 = symbol2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = symbol3;
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchTickersWs")))
            {
                (this.loadMarkets()).join();
                Object market = this.market(symbol);
                symbol = Helpers.GetValue(market, "symbol");
                Object tickers = (this.fetchTickersWs(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), parameters)).join();
                Object ticker = this.safeDict(tickers, symbol);
                if (Helpers.isTrue(Helpers.isEqual(ticker, null)))
                {
                    throw new NullResponse((String)Helpers.add(Helpers.add(this.id, " fetchTickerWs() could not find a ticker for "), symbol)) ;
                } else
                {
                    return ticker;
                }
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchTickerWs() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTicker(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchTicker() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTickers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTickers() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMarkPrices(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchMarkPrices() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTickersWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTickers() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderBooks(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrderBooks() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchBidsAsks(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchBidsAsks() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTickers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchTickers() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchTickers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchTickers() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrder(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrder() is not supported yet")) ;
        });

    }

    /**
     * @method
     * @name fetchOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    public java.util.concurrent.CompletableFuture<Object> fetchOrderWithClientOrderId(Object clientOrderId, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            Object extendedParams = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "clientOrderId", clientOrderId );
            }});
            return (this.fetchOrder("", symbol, extendedParams)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderWs(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderStatus(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            // TODO: TypeScript: change method signature by replacing
            // Promise<string> with Promise<Order['status']>.
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            Object order = (this.fetchOrder(id, symbol, parameters)).join();
            return Helpers.GetValue(order, "status");
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchUnifiedOrder(Object order, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.fetchOrder(this.safeString(order, "id"), this.safeString(order, "symbol"), parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createConvertTrade(Object id, Object fromCode, Object toCode, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object amount = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createConvertTrade() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchConvertTrade(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchConvertTrade() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchConvertTradeHistory(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchConvertTradeHistory() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionMode(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPositionMode() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTrailingAmountOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createTrailingAmountOrder
            * @description create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
            * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
            * @param {float} trailingAmount the quote amount to trail away from the current market price
            * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object trailingAmount = Helpers.getArg(optionalArgs, 1, null);
            Object trailingTriggerPrice = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(trailingAmount, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createTrailingAmountOrder() requires a trailingAmount argument")) ;
            }
            Helpers.addElementToObject(parameters, "trailingAmount", trailingAmount);
            if (Helpers.isTrue(!Helpers.isEqual(trailingTriggerPrice, null)))
            {
                Helpers.addElementToObject(parameters, "trailingTriggerPrice", trailingTriggerPrice);
            }
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createTrailingAmountOrder")))
            {
                return (this.createOrder(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createTrailingAmountOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTrailingAmountOrderWs(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createTrailingAmountOrderWs
            * @description create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
            * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
            * @param {float} trailingAmount the quote amount to trail away from the current market price
            * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object trailingAmount = Helpers.getArg(optionalArgs, 1, null);
            Object trailingTriggerPrice = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(trailingAmount, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createTrailingAmountOrderWs() requires a trailingAmount argument")) ;
            }
            Helpers.addElementToObject(parameters, "trailingAmount", trailingAmount);
            if (Helpers.isTrue(!Helpers.isEqual(trailingTriggerPrice, null)))
            {
                Helpers.addElementToObject(parameters, "trailingTriggerPrice", trailingTriggerPrice);
            }
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createTrailingAmountOrderWs")))
            {
                return (this.createOrderWs(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createTrailingAmountOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTrailingPercentOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createTrailingPercentOrder
            * @description create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
            * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
            * @param {float} trailingPercent the percent to trail away from the current market price
            * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object trailingPercent = Helpers.getArg(optionalArgs, 1, null);
            Object trailingTriggerPrice = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(trailingPercent, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createTrailingPercentOrder() requires a trailingPercent argument")) ;
            }
            Helpers.addElementToObject(parameters, "trailingPercent", trailingPercent);
            if (Helpers.isTrue(!Helpers.isEqual(trailingTriggerPrice, null)))
            {
                Helpers.addElementToObject(parameters, "trailingTriggerPrice", trailingTriggerPrice);
            }
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createTrailingPercentOrder")))
            {
                return (this.createOrder(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createTrailingPercentOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTrailingPercentOrderWs(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createTrailingPercentOrderWs
            * @description create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
            * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
            * @param {float} trailingPercent the percent to trail away from the current market price
            * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object trailingPercent = Helpers.getArg(optionalArgs, 1, null);
            Object trailingTriggerPrice = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(trailingPercent, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createTrailingPercentOrderWs() requires a trailingPercent argument")) ;
            }
            Helpers.addElementToObject(parameters, "trailingPercent", trailingPercent);
            if (Helpers.isTrue(!Helpers.isEqual(trailingTriggerPrice, null)))
            {
                Helpers.addElementToObject(parameters, "trailingTriggerPrice", trailingTriggerPrice);
            }
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createTrailingPercentOrderWs")))
            {
                return (this.createOrderWs(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createTrailingPercentOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketOrderWithCost(Object symbol, Object side, Object cost, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createMarketOrderWithCost
            * @description create a market order by providing the symbol, side and cost
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} side 'buy' or 'sell'
            * @param {float} cost how much you want to trade in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.GetValue(this.has, "createMarketOrderWithCost")) || Helpers.isTrue((Helpers.isTrue(Helpers.GetValue(this.has, "createMarketBuyOrderWithCost")) && Helpers.isTrue(Helpers.GetValue(this.has, "createMarketSellOrderWithCost"))))))
            {
                return (this.createOrder(symbol, "market", side, cost, 1, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createMarketOrderWithCost() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketBuyOrderWithCost(Object symbol, Object cost, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createMarketBuyOrderWithCost
            * @description create a market buy order by providing the symbol and cost
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {float} cost how much you want to trade in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.GetValue(this.options, "createMarketBuyOrderRequiresPrice")) || Helpers.isTrue(Helpers.GetValue(this.has, "createMarketBuyOrderWithCost"))))
            {
                return (this.createOrder(symbol, "market", "buy", cost, 1, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createMarketBuyOrderWithCost() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketSellOrderWithCost(Object symbol, Object cost, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createMarketSellOrderWithCost
            * @description create a market sell order by providing the symbol and cost
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {float} cost how much you want to trade in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.GetValue(this.options, "createMarketSellOrderRequiresPrice")) || Helpers.isTrue(Helpers.GetValue(this.has, "createMarketSellOrderWithCost"))))
            {
                return (this.createOrder(symbol, "market", "sell", cost, 1, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createMarketSellOrderWithCost() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketOrderWithCostWs(Object symbol, Object side, Object cost, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createMarketOrderWithCostWs
            * @description create a market order by providing the symbol, side and cost
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} side 'buy' or 'sell'
            * @param {float} cost how much you want to trade in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.GetValue(this.has, "createMarketOrderWithCostWs")) || Helpers.isTrue((Helpers.isTrue(Helpers.GetValue(this.has, "createMarketBuyOrderWithCostWs")) && Helpers.isTrue(Helpers.GetValue(this.has, "createMarketSellOrderWithCostWs"))))))
            {
                return (this.createOrderWs(symbol, "market", side, cost, 1, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createMarketOrderWithCostWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTriggerOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createTriggerOrder
            * @description create a trigger stop order (type 1)
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
            * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
            * @param {float} triggerPrice the price to trigger the stop order, in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object triggerPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(triggerPrice, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createTriggerOrder() requires a triggerPrice argument")) ;
            }
            Helpers.addElementToObject(parameters, "triggerPrice", triggerPrice);
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createTriggerOrder")))
            {
                return (this.createOrder(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createTriggerOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTriggerOrderWs(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createTriggerOrderWs
            * @description create a trigger stop order (type 1)
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
            * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
            * @param {float} triggerPrice the price to trigger the stop order, in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object triggerPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(triggerPrice, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createTriggerOrderWs() requires a triggerPrice argument")) ;
            }
            Helpers.addElementToObject(parameters, "triggerPrice", triggerPrice);
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createTriggerOrderWs")))
            {
                return (this.createOrderWs(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createTriggerOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopLossOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createStopLossOrder
            * @description create a trigger stop loss order (type 2)
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
            * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
            * @param {float} stopLossPrice the price to trigger the stop loss order, in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object stopLossPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(stopLossPrice, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createStopLossOrder() requires a stopLossPrice argument")) ;
            }
            Helpers.addElementToObject(parameters, "stopLossPrice", stopLossPrice);
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createStopLossOrder")))
            {
                return (this.createOrder(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createStopLossOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopLossOrderWs(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createStopLossOrderWs
            * @description create a trigger stop loss order (type 2)
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
            * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
            * @param {float} stopLossPrice the price to trigger the stop loss order, in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object stopLossPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(stopLossPrice, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createStopLossOrderWs() requires a stopLossPrice argument")) ;
            }
            Helpers.addElementToObject(parameters, "stopLossPrice", stopLossPrice);
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createStopLossOrderWs")))
            {
                return (this.createOrderWs(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createStopLossOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTakeProfitOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createTakeProfitOrder
            * @description create a trigger take profit order (type 2)
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
            * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
            * @param {float} takeProfitPrice the price to trigger the take profit order, in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object takeProfitPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(takeProfitPrice, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createTakeProfitOrder() requires a takeProfitPrice argument")) ;
            }
            Helpers.addElementToObject(parameters, "takeProfitPrice", takeProfitPrice);
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createTakeProfitOrder")))
            {
                return (this.createOrder(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createTakeProfitOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTakeProfitOrderWs(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createTakeProfitOrderWs
            * @description create a trigger take profit order (type 2)
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
            * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
            * @param {float} takeProfitPrice the price to trigger the take profit order, in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object takeProfitPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(takeProfitPrice, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createTakeProfitOrderWs() requires a takeProfitPrice argument")) ;
            }
            Helpers.addElementToObject(parameters, "takeProfitPrice", takeProfitPrice);
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createTakeProfitOrderWs")))
            {
                return (this.createOrderWs(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createTakeProfitOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrderWithTakeProfitAndStopLoss(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createOrderWithTakeProfitAndStopLoss
            * @description create an order with a stop loss or take profit attached (type 3)
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
            * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
            * @param {float} [takeProfit] the take profit price, in units of the quote currency
            * @param {float} [stopLoss] the stop loss price, in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @param {string} [params.takeProfitType] *not available on all exchanges* 'limit' or 'market'
            * @param {string} [params.stopLossType] *not available on all exchanges* 'limit' or 'market'
            * @param {string} [params.takeProfitPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
            * @param {string} [params.stopLossPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
            * @param {float} [params.takeProfitLimitPrice] *not available on all exchanges* limit price for a limit take profit order
            * @param {float} [params.stopLossLimitPrice] *not available on all exchanges* stop loss for a limit stop loss order
            * @param {float} [params.takeProfitAmount] *not available on all exchanges* the amount for a take profit
            * @param {float} [params.stopLossAmount] *not available on all exchanges* the amount for a stop loss
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object takeProfit = Helpers.getArg(optionalArgs, 1, null);
            Object stopLoss = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            parameters = this.setTakeProfitAndStopLossParams(symbol, type, side, amount, price, takeProfit, stopLoss, parameters);
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createOrderWithTakeProfitAndStopLoss")))
            {
                return (this.createOrder(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createOrderWithTakeProfitAndStopLoss() is not supported yet")) ;
        });

    }

    public Object setTakeProfitAndStopLossParams(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        Object price = Helpers.getArg(optionalArgs, 0, null);
        Object takeProfit = Helpers.getArg(optionalArgs, 1, null);
        Object stopLoss = Helpers.getArg(optionalArgs, 2, null);
        Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
        if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(takeProfit, null))) && Helpers.isTrue((Helpers.isEqual(stopLoss, null)))))
        {
            throw new ArgumentsRequired((String)Helpers.add(this.id, " createOrderWithTakeProfitAndStopLoss() requires either a takeProfit or stopLoss argument")) ;
        }
        if (Helpers.isTrue(!Helpers.isEqual(takeProfit, null)))
        {
            final Object finalTakeProfit = takeProfit;
            Helpers.addElementToObject(parameters, "takeProfit", new java.util.HashMap<String, Object>() {{
    put( "triggerPrice", finalTakeProfit );
}});
        }
        if (Helpers.isTrue(!Helpers.isEqual(stopLoss, null)))
        {
            final Object finalStopLoss = stopLoss;
            Helpers.addElementToObject(parameters, "stopLoss", new java.util.HashMap<String, Object>() {{
    put( "triggerPrice", finalStopLoss );
}});
        }
        Object takeProfitType = this.safeString(parameters, "takeProfitType");
        Object takeProfitPriceType = this.safeString(parameters, "takeProfitPriceType");
        Object takeProfitLimitPrice = this.safeString(parameters, "takeProfitLimitPrice");
        Object takeProfitAmount = this.safeString(parameters, "takeProfitAmount");
        Object stopLossType = this.safeString(parameters, "stopLossType");
        Object stopLossPriceType = this.safeString(parameters, "stopLossPriceType");
        Object stopLossLimitPrice = this.safeString(parameters, "stopLossLimitPrice");
        Object stopLossAmount = this.safeString(parameters, "stopLossAmount");
        if (Helpers.isTrue(!Helpers.isEqual(takeProfitType, null)))
        {
            Helpers.addElementToObject(Helpers.GetValue(parameters, "takeProfit"), "type", takeProfitType);
        }
        if (Helpers.isTrue(!Helpers.isEqual(takeProfitPriceType, null)))
        {
            Helpers.addElementToObject(Helpers.GetValue(parameters, "takeProfit"), "priceType", takeProfitPriceType);
        }
        if (Helpers.isTrue(!Helpers.isEqual(takeProfitLimitPrice, null)))
        {
            Helpers.addElementToObject(Helpers.GetValue(parameters, "takeProfit"), "price", this.parseToNumeric(takeProfitLimitPrice));
        }
        if (Helpers.isTrue(!Helpers.isEqual(takeProfitAmount, null)))
        {
            Helpers.addElementToObject(Helpers.GetValue(parameters, "takeProfit"), "amount", this.parseToNumeric(takeProfitAmount));
        }
        if (Helpers.isTrue(!Helpers.isEqual(stopLossType, null)))
        {
            Helpers.addElementToObject(Helpers.GetValue(parameters, "stopLoss"), "type", stopLossType);
        }
        if (Helpers.isTrue(!Helpers.isEqual(stopLossPriceType, null)))
        {
            Helpers.addElementToObject(Helpers.GetValue(parameters, "stopLoss"), "priceType", stopLossPriceType);
        }
        if (Helpers.isTrue(!Helpers.isEqual(stopLossLimitPrice, null)))
        {
            Helpers.addElementToObject(Helpers.GetValue(parameters, "stopLoss"), "price", this.parseToNumeric(stopLossLimitPrice));
        }
        if (Helpers.isTrue(!Helpers.isEqual(stopLossAmount, null)))
        {
            Helpers.addElementToObject(Helpers.GetValue(parameters, "stopLoss"), "amount", this.parseToNumeric(stopLossAmount));
        }
        parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList("takeProfitType", "takeProfitPriceType", "takeProfitLimitPrice", "takeProfitAmount", "stopLossType", "stopLossPriceType", "stopLossLimitPrice", "stopLossAmount")));
        return parameters;
    }

    public java.util.concurrent.CompletableFuture<Object> createOrderWithTakeProfitAndStopLossWs(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createOrderWithTakeProfitAndStopLossWs
            * @description create an order with a stop loss or take profit attached (type 3)
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {string} type 'market' or 'limit'
            * @param {string} side 'buy' or 'sell'
            * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
            * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
            * @param {float} [takeProfit] the take profit price, in units of the quote currency
            * @param {float} [stopLoss] the stop loss price, in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @param {string} [params.takeProfitType] *not available on all exchanges* 'limit' or 'market'
            * @param {string} [params.stopLossType] *not available on all exchanges* 'limit' or 'market'
            * @param {string} [params.takeProfitPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
            * @param {string} [params.stopLossPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
            * @param {float} [params.takeProfitLimitPrice] *not available on all exchanges* limit price for a limit take profit order
            * @param {float} [params.stopLossLimitPrice] *not available on all exchanges* stop loss for a limit stop loss order
            * @param {float} [params.takeProfitAmount] *not available on all exchanges* the amount for a take profit
            * @param {float} [params.stopLossAmount] *not available on all exchanges* the amount for a stop loss
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object takeProfit = Helpers.getArg(optionalArgs, 1, null);
            Object stopLoss = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            parameters = this.setTakeProfitAndStopLossParams(symbol, type, side, amount, price, takeProfit, stopLoss, parameters);
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createOrderWithTakeProfitAndStopLossWs")))
            {
                return (this.createOrderWs(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createOrderWithTakeProfitAndStopLossWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrders(Object orders, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editOrders(Object orders, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " editOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrderWs(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelOrder(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelOrder() is not supported yet")) ;
        });

    }

    /**
     * @method
     * @name cancelOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    public java.util.concurrent.CompletableFuture<Object> cancelOrderWithClientOrderId(Object clientOrderId, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            Object extendedParams = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "clientOrderId", clientOrderId );
            }});
            return (this.cancelOrder("", symbol, extendedParams)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelOrderWs(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelOrders(Object ids, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelOrders() is not supported yet")) ;
        });

    }

    /**
     * @method
     * @name cancelOrdersWithClientOrderIds
     * @description create a market order by providing the symbol, side and cost
     * @param {string[]} clientOrderIds client order Ids
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    public java.util.concurrent.CompletableFuture<Object> cancelOrdersWithClientOrderIds(Object clientOrderIds, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            Object extendedParams = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "clientOrderIds", clientOrderIds );
            }});
            return (this.cancelOrders(new java.util.ArrayList<Object>(java.util.Arrays.asList()), symbol, extendedParams)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelOrdersWs(Object ids, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelAllOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelAllOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelAllOrdersAfter(Object timeout, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelAllOrdersAfter() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelOrdersForSymbols(Object orders, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelOrdersForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelAllOrdersWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelAllOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelUnifiedOrder(Object order, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return this.cancelOrder(this.safeString(order, "id"), this.safeString(order, "symbol"), parameters);
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.GetValue(this.has, "fetchOpenOrders")) && Helpers.isTrue(Helpers.GetValue(this.has, "fetchClosedOrders"))))
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchOrders() is not supported yet, consider using fetchOpenOrders() and fetchClosedOrders() instead")) ;
            }
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrdersWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderTrades(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrderTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchOrders")))
            {
                Object orders = (this.fetchOrders(symbol, since, limit, parameters)).join();
                return this.filterBy(orders, "status", "open");
            }
            throw new NotSupported((String)Helpers.add(this.id, " fetchOpenOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenOrdersWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchOrdersWs")))
            {
                Object orders = (this.fetchOrdersWs(symbol, since, limit, parameters)).join();
                return this.filterBy(orders, "status", "open");
            }
            throw new NotSupported((String)Helpers.add(this.id, " fetchOpenOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchClosedOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchOrders")))
            {
                Object orders = (this.fetchOrders(symbol, since, limit, parameters)).join();
                return this.filterBy(orders, "status", "closed");
            }
            throw new NotSupported((String)Helpers.add(this.id, " fetchClosedOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchCanceledAndClosedOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchCanceledAndClosedOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchClosedOrdersWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchOrdersWs")))
            {
                Object orders = (this.fetchOrdersWs(symbol, since, limit, parameters)).join();
                return this.filterBy(orders, "status", "closed");
            }
            throw new NotSupported((String)Helpers.add(this.id, " fetchClosedOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMyTrades(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchMyTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMyLiquidations(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchMyLiquidations() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchLiquidations(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchLiquidations() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMyTradesWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchMyTradesWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMyTrades(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchMyTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchGreeks(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchGreeks() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchAllGreeks(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchAllGreeks() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOptionChain(Object code, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOptionChain() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOption(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOption() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchConvertQuote(Object fromCode, Object toCode, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object amount = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchConvertQuote() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchDepositsWithdrawals(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchDepositsWithdrawals() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchDeposits(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchDeposits() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchWithdrawals(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchWithdrawals() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchDepositsWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchDepositsWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchWithdrawalsWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchWithdrawalsWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchFundingRateHistory(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchFundingRateHistory() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchFundingHistory(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchFundingHistory() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> closePosition(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object side = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " closePosition() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> closeAllPositions(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " closeAllPositions() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchL3OrderBook(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new BadRequest((String)Helpers.add(this.id, " fetchL3OrderBook() is not supported yet")) ;
        });

    }

    public Object parseLastPrice(Object price, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseLastPrice() is not supported yet")) ;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchDepositAddress(Object code, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchDepositAddresses")))
            {
                Object depositAddresses = (this.fetchDepositAddresses(new java.util.ArrayList<Object>(java.util.Arrays.asList(code)), parameters)).join();
                Object depositAddress = this.safeValue(depositAddresses, code);
                if (Helpers.isTrue(Helpers.isEqual(depositAddress, null)))
                {
                    throw new InvalidAddress((String)Helpers.add(Helpers.add(Helpers.add(this.id, " fetchDepositAddress() could not find a deposit address for "), code), ", make sure you have created a corresponding deposit address in your wallet on the exchange website")) ;
                } else
                {
                    return depositAddress;
                }
            } else if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchDepositAddressesByNetwork")))
            {
                Object network = this.safeString(parameters, "network");
                parameters = this.omit(parameters, "network");
                Object addressStructures = (this.fetchDepositAddressesByNetwork(code, parameters)).join();
                if (Helpers.isTrue(!Helpers.isEqual(network, null)))
                {
                    return this.safeDict(addressStructures, network);
                } else
                {
                    Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)addressStructures).keySet());
                    Object key = this.safeString(keys, 0);
                    return this.safeDict(addressStructures, key);
                }
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchDepositAddress() is not supported yet")) ;
            }
        });

    }

    public Object account()
    {
        return new java.util.HashMap<String, Object>() {{
            put( "free", null );
            put( "used", null );
            put( "total", null );
        }};
    }

    public Object commonCurrencyCode(Object code)
    {
        if (!Helpers.isTrue(this.substituteCommonCurrencyCodes))
        {
            return code;
        }
        return this.safeString(this.commonCurrencies, code, code);
    }

    public Object currency(Object code)
    {
        Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)this.currencies).keySet());
        Object numCurrencies = Helpers.getArrayLength(keys);
        if (Helpers.isTrue(Helpers.isEqual(numCurrencies, 0)))
        {
            throw new ExchangeError((String)Helpers.add(this.id, " currencies not loaded")) ;
        }
        if (Helpers.isTrue((code instanceof String)))
        {
            if (Helpers.isTrue(Helpers.inOp(this.currencies, code)))
            {
                return Helpers.GetValue(this.currencies, code);
            } else if (Helpers.isTrue(Helpers.inOp(this.currencies_by_id, code)))
            {
                return Helpers.GetValue(this.currencies_by_id, code);
            }
        }
        throw new ExchangeError((String)Helpers.add(Helpers.add(this.id, " does not have currency code "), code)) ;
    }

    public Object market(Object symbol)
    {
        if (Helpers.isTrue(Helpers.isEqual(this.markets, null)))
        {
            throw new ExchangeError((String)Helpers.add(this.id, " markets not loaded")) ;
        }
        if (Helpers.isTrue(Helpers.inOp(this.markets, symbol)))
        {
            return Helpers.GetValue(this.markets, symbol);
        } else if (Helpers.isTrue(Helpers.inOp(this.markets_by_id, symbol)))
        {
            Object markets = Helpers.GetValue(this.markets_by_id, symbol);
            Object defaultType = this.safeString2(this.options, "defaultType", "defaultSubType", "spot");
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(markets)); i++)
            {
                Object market = Helpers.GetValue(markets, i);
                if (Helpers.isTrue(Helpers.GetValue(market, defaultType)))
                {
                    return market;
                }
            }
            return Helpers.GetValue(markets, 0);
        } else if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((((String)symbol).endsWith(((String)"-C")))) || Helpers.isTrue((((String)symbol).endsWith(((String)"-P"))))) || Helpers.isTrue((((String)symbol).startsWith(((String)"C-"))))) || Helpers.isTrue((((String)symbol).startsWith(((String)"P-"))))))
        {
            return this.createExpiredOptionMarket(symbol);
        }
        throw new BadSymbol((String)Helpers.add(Helpers.add(this.id, " does not have market symbol "), symbol)) ;
    }

    public Object createExpiredOptionMarket(Object symbol)
    {
        throw new NotSupported((String)Helpers.add(this.id, " createExpiredOptionMarket () is not supported yet")) ;
    }

    public Object isLeveragedCurrency(Object currencyCode, Object... optionalArgs)
    {
        Object checkBaseCoin = Helpers.getArg(optionalArgs, 0, false);
        Object existingCurrencies = Helpers.getArg(optionalArgs, 1, null);
        Object leverageSuffixes = new java.util.ArrayList<Object>(java.util.Arrays.asList("2L", "2S", "3L", "3S", "4L", "4S", "5L", "5S", "UP", "DOWN", "BULL", "BEAR"));
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(leverageSuffixes)); i++)
        {
            Object leverageSuffix = Helpers.GetValue(leverageSuffixes, i);
            if (Helpers.isTrue(((String)currencyCode).endsWith(((String)leverageSuffix))))
            {
                if (!Helpers.isTrue(checkBaseCoin))
                {
                    return true;
                } else
                {
                    // check if base currency is inside dict
                    Object baseCurrencyCode = Helpers.replace((String)currencyCode, (String)leverageSuffix, (String)"");
                    if (Helpers.isTrue(Helpers.inOp(existingCurrencies, baseCurrencyCode)))
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public Object handleWithdrawTagAndParams(Object tag, Object parameters)
    {
        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(tag, null))) && Helpers.isTrue(((tag instanceof java.util.Map)))))
        {
            parameters = this.extend(tag, parameters);
            tag = null;
        }
        if (Helpers.isTrue(Helpers.isEqual(tag, null)))
        {
            tag = this.safeString(parameters, "tag");
            if (Helpers.isTrue(!Helpers.isEqual(tag, null)))
            {
                parameters = this.omit(parameters, "tag");
            }
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(tag, parameters));
    }

    public java.util.concurrent.CompletableFuture<Object> createLimitOrder(Object symbol, Object side, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder(symbol, "limit", side, amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitOrderWs(Object symbol, Object side, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, "limit", side, amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketOrder(Object symbol, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder(symbol, "market", side, amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketOrderWs(Object symbol, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, "market", side, amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitBuyOrder(Object symbol, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder(symbol, "limit", "buy", amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitBuyOrderWs(Object symbol, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, "limit", "buy", amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitSellOrder(Object symbol, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder(symbol, "limit", "sell", amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitSellOrderWs(Object symbol, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, "limit", "sell", amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketBuyOrder(Object symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder(symbol, "market", "buy", amount, null, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketBuyOrderWs(Object symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, "market", "buy", amount, null, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketSellOrder(Object symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder(symbol, "market", "sell", amount, null, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketSellOrderWs(Object symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, "market", "sell", amount, null, parameters)).join();
        });

    }

    public Object costToPrecision(Object symbol, Object cost)
    {
        if (Helpers.isTrue(Helpers.isEqual(cost, null)))
        {
            return null;
        }
        Object market = this.market(symbol);
        return this.decimalToPrecision(cost, TRUNCATE, Helpers.GetValue(Helpers.GetValue(market, "precision"), "price"), this.precisionMode, this.paddingMode);
    }

    public Object priceToPrecision(Object symbol, Object price)
    {
        if (Helpers.isTrue(Helpers.isEqual(price, null)))
        {
            return null;
        }
        Object market = this.market(symbol);
        Object result = this.decimalToPrecision(price, ROUND, Helpers.GetValue(Helpers.GetValue(market, "precision"), "price"), this.precisionMode, this.paddingMode);
        if (Helpers.isTrue(Helpers.isEqual(result, "0")))
        {
            throw new InvalidOrder((String)Helpers.add(Helpers.add(Helpers.add(Helpers.add(this.id, " price of "), Helpers.GetValue(market, "symbol")), " must be greater than minimum price precision of "), this.numberToString(Helpers.GetValue(Helpers.GetValue(market, "precision"), "price")))) ;
        }
        return result;
    }

    public Object amountToPrecision(Object symbol, Object amount)
    {
        if (Helpers.isTrue(Helpers.isEqual(amount, null)))
        {
            return null;
        }
        Object market = this.market(symbol);
        Object result = this.decimalToPrecision(amount, TRUNCATE, Helpers.GetValue(Helpers.GetValue(market, "precision"), "amount"), this.precisionMode, this.paddingMode);
        if (Helpers.isTrue(Helpers.isEqual(result, "0")))
        {
            throw new InvalidOrder((String)Helpers.add(Helpers.add(Helpers.add(Helpers.add(this.id, " amount of "), Helpers.GetValue(market, "symbol")), " must be greater than minimum amount precision of "), this.numberToString(Helpers.GetValue(Helpers.GetValue(market, "precision"), "amount")))) ;
        }
        return result;
    }

    public Object feeToPrecision(Object symbol, Object fee)
    {
        if (Helpers.isTrue(Helpers.isEqual(fee, null)))
        {
            return null;
        }
        Object market = this.market(symbol);
        return this.decimalToPrecision(fee, ROUND, Helpers.GetValue(Helpers.GetValue(market, "precision"), "price"), this.precisionMode, this.paddingMode);
    }

    public Object currencyToPrecision(Object code, Object fee, Object... optionalArgs)
    {
        Object networkCode = Helpers.getArg(optionalArgs, 0, null);
        Object currency = Helpers.GetValue(this.currencies, code);
        Object precision = this.safeValue(currency, "precision");
        if (Helpers.isTrue(!Helpers.isEqual(networkCode, null)))
        {
            Object networks = this.safeDict(currency, "networks", new java.util.HashMap<String, Object>() {{}});
            Object networkItem = this.safeDict(networks, networkCode, new java.util.HashMap<String, Object>() {{}});
            precision = this.safeValue(networkItem, "precision", precision);
        }
        if (Helpers.isTrue(Helpers.isEqual(precision, null)))
        {
            return this.forceString(fee);
        } else
        {
            Object roundingMode = this.safeInteger(this.options, "currencyToPrecisionRoundingMode", ROUND);
            return this.decimalToPrecision(fee, roundingMode, precision, this.precisionMode, this.paddingMode);
        }
    }

    public Object forceString(Object value)
    {
        if (Helpers.isTrue(!(value instanceof String)))
        {
            return this.numberToString(value);
        }
        return value;
    }

    public Object isTickPrecision()
    {
        return Helpers.isEqual(this.precisionMode, TICK_SIZE);
    }

    public Object isDecimalPrecision()
    {
        return Helpers.isEqual(this.precisionMode, DECIMAL_PLACES);
    }

    public Object isSignificantPrecision()
    {
        return Helpers.isEqual(this.precisionMode, SIGNIFICANT_DIGITS);
    }

    public Object safeNumber(Object obj, Object key, Object... optionalArgs)
    {
        Object defaultNumber = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeString(obj, key);
        return this.parseNumber(value, defaultNumber);
    }

    public Object safeNumberN(Object obj, Object arr, Object... optionalArgs)
    {
        Object defaultNumber = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeStringN(obj, arr);
        return this.parseNumber(value, defaultNumber);
    }

    public Object parsePrecision(Object precision, Object... optionalArgs)
    {
        /**
         * @ignore
         * @method
         * @param {string} precision The number of digits to the right of the decimal
         * @returns {string} a string number equal to 1e-precision
         */
        if (Helpers.isTrue(Helpers.isEqual(precision, null)))
        {
            return null;
        }
        Object precisionNumber = Helpers.parseInt(precision);
        if (Helpers.isTrue(Helpers.isEqual(precisionNumber, 0)))
        {
            return "1";
        }
        if (Helpers.isTrue(Helpers.isGreaterThan(precisionNumber, 0)))
        {
            Object parsedPrecision = "0.";
            for (var i = 0; Helpers.isLessThan(i, Helpers.subtract(precisionNumber, 1)); i++)
            {
                parsedPrecision = Helpers.add(parsedPrecision, "0");
            }
            return Helpers.add(parsedPrecision, "1");
        } else
        {
            Object parsedPrecision = "1";
            for (var i = 0; Helpers.isLessThan(i, Helpers.subtract(Helpers.multiply(precisionNumber, Helpers.opNeg(1)), 1)); i++)
            {
                parsedPrecision = Helpers.add(parsedPrecision, "0");
            }
            return Helpers.add(parsedPrecision, "0");
        }
    }

    public Object integerPrecisionToAmount(Object precision)
    {
        /**
         * @ignore
         * @method
         * @description handles positive & negative numbers too. parsePrecision() does not handle negative numbers, but this method handles
         * @param {string} precision The number of digits to the right of the decimal
         * @returns {string} a string number equal to 1e-precision
         */
        if (Helpers.isTrue(Helpers.isEqual(precision, null)))
        {
            return null;
        }
        if (Helpers.isTrue(Precise.stringGe(precision, "0")))
        {
            return this.parsePrecision(precision);
        } else
        {
            Object positivePrecisionString = Precise.stringAbs(precision);
            Object positivePrecision = Helpers.parseInt(positivePrecisionString);
            Object parsedPrecision = "1";
            for (var i = 0; Helpers.isLessThan(i, Helpers.subtract(positivePrecision, 1)); i++)
            {
                parsedPrecision = Helpers.add(parsedPrecision, "0");
            }
            return Helpers.add(parsedPrecision, "0");
        }
    }

    public java.util.concurrent.CompletableFuture<Object> loadTimeDifference(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            Object serverTime = (this.fetchTime(parameters)).join();
            Object after = this.milliseconds();
            Helpers.addElementToObject(this.options, "timeDifference", Helpers.subtract(after, serverTime));
            return Helpers.GetValue(this.options, "timeDifference");
        });

    }

    public Object implodeHostname(Object url)
    {
        return this.implodeParams(url, new java.util.HashMap<String, Object>() {{
            put( "hostname", Exchange.this.hostname );
        }});
    }

    public java.util.concurrent.CompletableFuture<Object> fetchMarketLeverageTiers(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchLeverageTiers")))
            {
                Object market = this.market(symbol);
                if (!Helpers.isTrue(Helpers.GetValue(market, "contract")))
                {
                    throw new BadSymbol((String)Helpers.add(this.id, " fetchMarketLeverageTiers() supports contract markets only")) ;
                }
                Object tiers = (this.fetchLeverageTiers(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)))).join();
                return this.safeValue(tiers, symbol);
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchMarketLeverageTiers() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createPostOnlyOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "createPostOnlyOrder")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " createPostOnlyOrder() is not supported yet")) ;
            }
            Object query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "postOnly", true );
            }});
            return (this.createOrder(symbol, type, side, amount, price, query)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createPostOnlyOrderWs(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "createPostOnlyOrderWs")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " createPostOnlyOrderWs() is not supported yet")) ;
            }
            Object query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "postOnly", true );
            }});
            return (this.createOrderWs(symbol, type, side, amount, price, query)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createReduceOnlyOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "createReduceOnlyOrder")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " createReduceOnlyOrder() is not supported yet")) ;
            }
            Object query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "reduceOnly", true );
            }});
            return (this.createOrder(symbol, type, side, amount, price, query)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createReduceOnlyOrderWs(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "createReduceOnlyOrderWs")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " createReduceOnlyOrderWs() is not supported yet")) ;
            }
            Object query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "reduceOnly", true );
            }});
            return (this.createOrderWs(symbol, type, side, amount, price, query)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object triggerPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "createStopOrder")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " createStopOrder() is not supported yet")) ;
            }
            if (Helpers.isTrue(Helpers.isEqual(triggerPrice, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " create_stop_order() requires a stopPrice argument")) ;
            }
            final Object finalTriggerPrice = triggerPrice;
            Object query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", finalTriggerPrice );
            }});
            return (this.createOrder(symbol, type, side, amount, price, query)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopOrderWs(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object triggerPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "createStopOrderWs")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " createStopOrderWs() is not supported yet")) ;
            }
            if (Helpers.isTrue(Helpers.isEqual(triggerPrice, null)))
            {
                throw new ArgumentsRequired((String)Helpers.add(this.id, " createStopOrderWs() requires a stopPrice argument")) ;
            }
            final Object finalTriggerPrice = triggerPrice;
            Object query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", finalTriggerPrice );
            }});
            return (this.createOrderWs(symbol, type, side, amount, price, query)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopLimitOrder(Object symbol, Object side, Object amount, Object price, Object triggerPrice, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "createStopLimitOrder")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " createStopLimitOrder() is not supported yet")) ;
            }
            Object query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrder(symbol, "limit", side, amount, price, query)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopLimitOrderWs(Object symbol, Object side, Object amount, Object price, Object triggerPrice, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "createStopLimitOrderWs")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " createStopLimitOrderWs() is not supported yet")) ;
            }
            Object query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrderWs(symbol, "limit", side, amount, price, query)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopMarketOrder(Object symbol, Object side, Object amount, Object triggerPrice, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "createStopMarketOrder")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " createStopMarketOrder() is not supported yet")) ;
            }
            Object query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrder(symbol, "market", side, amount, null, query)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopMarketOrderWs(Object symbol, Object side, Object amount, Object triggerPrice, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "createStopMarketOrderWs")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " createStopMarketOrderWs() is not supported yet")) ;
            }
            Object query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrderWs(symbol, "market", side, amount, null, query)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createSubAccount(Object name, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createSubAccount() is not supported yet")) ;
        });

    }

    public Object safeCurrencyCode(Object currencyId, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        currency = this.safeCurrency(currencyId, currency);
        return Helpers.GetValue(currency, "code");
    }

    public Object filterBySymbolSinceLimit(Object array, Object... optionalArgs)
    {
        Object symbol = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object tail = Helpers.getArg(optionalArgs, 3, false);
        return this.filterByValueSinceLimit(array, "symbol", symbol, since, limit, "timestamp", tail);
    }

    public Object filterByCurrencySinceLimit(Object array, Object... optionalArgs)
    {
        Object code = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object tail = Helpers.getArg(optionalArgs, 3, false);
        return this.filterByValueSinceLimit(array, "currency", code, since, limit, "timestamp", tail);
    }

    public Object filterBySymbolsSinceLimit(Object array, Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object tail = Helpers.getArg(optionalArgs, 3, false);
        Object result = this.filterByArray(array, "symbol", symbols, false);
        return this.filterBySinceLimit(result, since, limit, "timestamp", tail);
    }

    public Object parseLastPrices(Object pricesData, Object... optionalArgs)
    {
        //
        // the value of tickers is either a dict or a list
        //
        // dict
        //
        //     {
        //         'marketId1': { ... },
        //         'marketId2': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'market': 'marketId1', ... },
        //         { 'market': 'marketId2', ... },
        //         ...
        //     ]
        //
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        if (Helpers.isTrue(((pricesData instanceof java.util.List) || (pricesData.getClass().isArray()))))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(pricesData)); i++)
            {
                Object priceData = this.extend(this.parseLastPrice(Helpers.GetValue(pricesData, i)), parameters);
                ((java.util.List<Object>)results).add(priceData);
            }
        } else
        {
            Object marketIds = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)pricesData).keySet());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(marketIds)); i++)
            {
                Object marketId = Helpers.GetValue(marketIds, i);
                Object market = this.safeMarket(marketId);
                Object priceData = this.extend(this.parseLastPrice(Helpers.GetValue(pricesData, marketId), market), parameters);
                ((java.util.List<Object>)results).add(priceData);
            }
        }
        symbols = this.marketSymbols(symbols);
        return this.filterByArray(results, "symbol", symbols);
    }

    public Object parseTickers(Object tickers, Object... optionalArgs)
    {
        //
        // the value of tickers is either a dict or a list
        //
        //
        // dict
        //
        //     {
        //         'marketId1': { ... },
        //         'marketId2': { ... },
        //         'marketId3': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'market': 'marketId1', ... },
        //         { 'market': 'marketId2', ... },
        //         { 'market': 'marketId3', ... },
        //         ...
        //     ]
        //
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        if (Helpers.isTrue(((tickers instanceof java.util.List) || (tickers.getClass().isArray()))))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(tickers)); i++)
            {
                Object parsedTicker = this.parseTicker(Helpers.GetValue(tickers, i));
                Object ticker = this.extend(parsedTicker, parameters);
                ((java.util.List<Object>)results).add(ticker);
            }
        } else
        {
            Object marketIds = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)tickers).keySet());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(marketIds)); i++)
            {
                Object marketId = Helpers.GetValue(marketIds, i);
                Object market = this.safeMarket(marketId);
                Object parsed = this.parseTicker(Helpers.GetValue(tickers, marketId), market);
                Object ticker = this.extend(parsed, parameters);
                ((java.util.List<Object>)results).add(ticker);
            }
        }
        symbols = this.marketSymbols(symbols);
        return this.filterByArray(results, "symbol", symbols);
    }

    public Object parseDepositAddresses(Object addresses, Object... optionalArgs)
    {
        Object codes = Helpers.getArg(optionalArgs, 0, null);
        Object indexed = Helpers.getArg(optionalArgs, 1, true);
        Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(addresses)); i++)
        {
            Object address = this.extend(this.parseDepositAddress(Helpers.GetValue(addresses, i)), parameters);
            ((java.util.List<Object>)result).add(address);
        }
        if (Helpers.isTrue(!Helpers.isEqual(codes, null)))
        {
            result = this.filterByArray(result, "currency", codes, false);
        }
        if (Helpers.isTrue(indexed))
        {
            result = this.filterByArray(result, "currency", null, indexed);
        }
        return result;
    }

    public Object parseBorrowInterests(Object response, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object interests = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object row = Helpers.GetValue(response, i);
            ((java.util.List<Object>)interests).add(this.parseBorrowInterest(row, market));
        }
        return interests;
    }

    public Object parseBorrowRate(Object info, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseBorrowRate() is not supported yet")) ;
    }

    public Object parseBorrowRateHistory(Object response, Object code, Object since, Object limit)
    {
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object item = Helpers.GetValue(response, i);
            Object borrowRate = this.parseBorrowRate(item);
            ((java.util.List<Object>)result).add(borrowRate);
        }
        Object sorted = this.sortBy(result, "timestamp");
        return this.filterByCurrencySinceLimit(sorted, code, since, limit);
    }

    public Object parseIsolatedBorrowRates(Object info)
    {
        Object result = new java.util.HashMap<String, Object>() {{}};
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(info)); i++)
        {
            Object item = Helpers.GetValue(info, i);
            Object borrowRate = this.parseIsolatedBorrowRate(item);
            Object symbol = this.safeString(borrowRate, "symbol");
            Helpers.addElementToObject(result, symbol, borrowRate);
        }
        return result;
    }

    public Object parseFundingRateHistories(Object response, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object rates = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object entry = Helpers.GetValue(response, i);
            ((java.util.List<Object>)rates).add(this.parseFundingRateHistory(entry, market));
        }
        Object sorted = this.sortBy(rates, "timestamp");
        Object symbol = ((Helpers.isTrue((Helpers.isEqual(market, null))))) ? null : Helpers.GetValue(market, "symbol");
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }

    public Object safeSymbol(Object marketId, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object delimiter = Helpers.getArg(optionalArgs, 1, null);
        Object marketType = Helpers.getArg(optionalArgs, 2, null);
        market = this.safeMarket(marketId, market, delimiter, marketType);
        return Helpers.GetValue(market, "symbol");
    }

    public Object parseFundingRate(Object contract, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseFundingRate() is not supported yet")) ;
    }

    public Object parseFundingRates(Object response, Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object fundingRates = new java.util.HashMap<String, Object>() {{}};
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object entry = Helpers.GetValue(response, i);
            Object parsed = this.parseFundingRate(entry);
            Helpers.addElementToObject(fundingRates, Helpers.GetValue(parsed, "symbol"), parsed);
        }
        return this.filterByArray(fundingRates, "symbol", symbols);
    }

    public Object parseLongShortRatio(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseLongShortRatio() is not supported yet")) ;
    }

    public Object parseLongShortRatioHistory(Object response, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object rates = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object entry = Helpers.GetValue(response, i);
            ((java.util.List<Object>)rates).add(this.parseLongShortRatio(entry, market));
        }
        Object sorted = this.sortBy(rates, "timestamp");
        Object symbol = ((Helpers.isTrue((Helpers.isEqual(market, null))))) ? null : Helpers.GetValue(market, "symbol");
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }

    public Object handleTriggerPricesAndParams(Object symbol, Object parameters, Object... optionalArgs)
    {
        //
        Object omitParams = Helpers.getArg(optionalArgs, 0, true);
        Object triggerPrice = this.safeString2(parameters, "triggerPrice", "stopPrice");
        Object triggerPriceStr = null;
        Object stopLossPrice = this.safeString(parameters, "stopLossPrice");
        Object stopLossPriceStr = null;
        Object takeProfitPrice = this.safeString(parameters, "takeProfitPrice");
        Object takeProfitPriceStr = null;
        //
        if (Helpers.isTrue(!Helpers.isEqual(triggerPrice, null)))
        {
            if (Helpers.isTrue(omitParams))
            {
                parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList("triggerPrice", "stopPrice")));
            }
            triggerPriceStr = this.priceToPrecision(symbol, Helpers.parseFloat(triggerPrice));
        }
        if (Helpers.isTrue(!Helpers.isEqual(stopLossPrice, null)))
        {
            if (Helpers.isTrue(omitParams))
            {
                parameters = this.omit(parameters, "stopLossPrice");
            }
            stopLossPriceStr = this.priceToPrecision(symbol, Helpers.parseFloat(stopLossPrice));
        }
        if (Helpers.isTrue(!Helpers.isEqual(takeProfitPrice, null)))
        {
            if (Helpers.isTrue(omitParams))
            {
                parameters = this.omit(parameters, "takeProfitPrice");
            }
            takeProfitPriceStr = this.priceToPrecision(symbol, Helpers.parseFloat(takeProfitPrice));
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(triggerPriceStr, stopLossPriceStr, takeProfitPriceStr, parameters));
    }

    public Object handleTriggerDirectionAndParams(Object parameters, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @returns {[string, object]} the trigger-direction value and omited params
        */
        Object exchangeSpecificKey = Helpers.getArg(optionalArgs, 0, null);
        Object allowEmpty = Helpers.getArg(optionalArgs, 1, false);
        Object triggerDirection = this.safeString(parameters, "triggerDirection");
        Object exchangeSpecificDefined = Helpers.isTrue((!Helpers.isEqual(exchangeSpecificKey, null))) && Helpers.isTrue((Helpers.inOp(parameters, exchangeSpecificKey)));
        if (Helpers.isTrue(!Helpers.isEqual(triggerDirection, null)))
        {
            parameters = this.omit(parameters, "triggerDirection");
        }
        // throw exception if:
        // A) if provided value is not unified (support old "up/down" strings too)
        // B) if exchange specific "trigger direction key" (eg. "stopPriceSide") was not provided
        if (Helpers.isTrue(Helpers.isTrue(!Helpers.isTrue(this.inArray(triggerDirection, new java.util.ArrayList<Object>(java.util.Arrays.asList("ascending", "descending", "up", "down", "above", "below")))) && !Helpers.isTrue(exchangeSpecificDefined)) && !Helpers.isTrue(allowEmpty)))
        {
            throw new ArgumentsRequired((String)Helpers.add(this.id, " createOrder() : trigger orders require params[\"triggerDirection\"] to be either \"ascending\" or \"descending\"")) ;
        }
        // if old format was provided, overwrite to new
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(triggerDirection, "up")) || Helpers.isTrue(Helpers.isEqual(triggerDirection, "above"))))
        {
            triggerDirection = "ascending";
        } else if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(triggerDirection, "down")) || Helpers.isTrue(Helpers.isEqual(triggerDirection, "below"))))
        {
            triggerDirection = "descending";
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(triggerDirection, parameters));
    }

    public Object handleTriggerAndParams(Object parameters)
    {
        Object isTrigger = this.safeBool2(parameters, "trigger", "stop");
        if (Helpers.isTrue(isTrigger))
        {
            parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList("trigger", "stop")));
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(isTrigger, parameters));
    }

    public Object isTriggerOrder(Object parameters)
    {
        // for backwards compatibility
        return this.handleTriggerAndParams(parameters);
    }

    public Object isPostOnly(Object isMarketOrder, Object exchangeSpecificParam, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @param {string} type Order type
        * @param {boolean} exchangeSpecificParam exchange specific postOnly
        * @param {object} [params] exchange specific params
        * @returns {boolean} true if a post only order, false otherwise
        */
        Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        Object timeInForce = this.safeStringUpper(parameters, "timeInForce");
        Object postOnly = this.safeBool2(parameters, "postOnly", "post_only", false);
        // we assume timeInForce is uppercase from safeStringUpper (params, 'timeInForce')
        Object ioc = Helpers.isEqual(timeInForce, "IOC");
        Object fok = Helpers.isEqual(timeInForce, "FOK");
        Object timeInForcePostOnly = Helpers.isEqual(timeInForce, "PO");
        postOnly = Helpers.isTrue(Helpers.isTrue(postOnly) || Helpers.isTrue(timeInForcePostOnly)) || Helpers.isTrue(exchangeSpecificParam);
        if (Helpers.isTrue(postOnly))
        {
            if (Helpers.isTrue(Helpers.isTrue(ioc) || Helpers.isTrue(fok)))
            {
                throw new InvalidOrder((String)Helpers.add(Helpers.add(this.id, " postOnly orders cannot have timeInForce equal to "), timeInForce)) ;
            } else if (Helpers.isTrue(isMarketOrder))
            {
                throw new InvalidOrder((String)Helpers.add(this.id, " market orders cannot be postOnly")) ;
            } else
            {
                return true;
            }
        } else
        {
            return false;
        }
    }

    public Object handlePostOnly(Object isMarketOrder, Object exchangeSpecificPostOnlyOption, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @param {string} type Order type
        * @param {boolean} exchangeSpecificBoolean exchange specific postOnly
        * @param {object} [params] exchange specific params
        * @returns {Array}
        */
        Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        Object timeInForce = this.safeStringUpper(parameters, "timeInForce");
        Object postOnly = this.safeBool(parameters, "postOnly", false);
        Object ioc = Helpers.isEqual(timeInForce, "IOC");
        Object fok = Helpers.isEqual(timeInForce, "FOK");
        Object po = Helpers.isEqual(timeInForce, "PO");
        postOnly = Helpers.isTrue(Helpers.isTrue(postOnly) || Helpers.isTrue(po)) || Helpers.isTrue(exchangeSpecificPostOnlyOption);
        if (Helpers.isTrue(postOnly))
        {
            if (Helpers.isTrue(Helpers.isTrue(ioc) || Helpers.isTrue(fok)))
            {
                throw new InvalidOrder((String)Helpers.add(Helpers.add(this.id, " postOnly orders cannot have timeInForce equal to "), timeInForce)) ;
            } else if (Helpers.isTrue(isMarketOrder))
            {
                throw new InvalidOrder((String)Helpers.add(this.id, " market orders cannot be postOnly")) ;
            } else
            {
                if (Helpers.isTrue(po))
                {
                    parameters = this.omit(parameters, "timeInForce");
                }
                parameters = this.omit(parameters, "postOnly");
                return new java.util.ArrayList<Object>(java.util.Arrays.asList(true, parameters));
            }
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(false, parameters));
    }

    public java.util.concurrent.CompletableFuture<Object> fetchLastPrices(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchLastPrices() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTradingFees(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTradingFees() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTradingFeesWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTradingFeesWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTradingFee(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (!Helpers.isTrue(Helpers.GetValue(this.has, "fetchTradingFees")))
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchTradingFee() is not supported yet")) ;
            }
            Object fees = (this.fetchTradingFees(parameters)).join();
            return this.safeDict(fees, symbol);
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchConvertCurrencies(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchConvertCurrencies() is not supported yet")) ;
        });

    }

    public Object parseOpenInterest(Object interest, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseOpenInterest () is not supported yet")) ;
    }

    public Object parseOpenInterests(Object response, Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object result = new java.util.HashMap<String, Object>() {{}};
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object entry = Helpers.GetValue(response, i);
            Object parsed = this.parseOpenInterest(entry);
            Helpers.addElementToObject(result, Helpers.GetValue(parsed, "symbol"), parsed);
        }
        return this.filterByArray(result, "symbol", symbols);
    }

    public Object parseOpenInterestsHistory(Object response, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object interests = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object entry = Helpers.GetValue(response, i);
            Object interest = this.parseOpenInterest(entry, market);
            ((java.util.List<Object>)interests).add(interest);
        }
        Object sorted = this.sortBy(interests, "timestamp");
        Object symbol = this.safeString(market, "symbol");
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }

    public java.util.concurrent.CompletableFuture<Object> fetchFundingRate(Object symbol2, Object... optionalArgs)
    {
        final Object symbol3 = symbol2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = symbol3;
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchFundingRates")))
            {
                (this.loadMarkets()).join();
                Object market = this.market(symbol);
                symbol = Helpers.GetValue(market, "symbol");
                if (!Helpers.isTrue(Helpers.GetValue(market, "contract")))
                {
                    throw new BadSymbol((String)Helpers.add(this.id, " fetchFundingRate() supports contract markets only")) ;
                }
                Object rates = (this.fetchFundingRates(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), parameters)).join();
                Object rate = this.safeValue(rates, symbol);
                if (Helpers.isTrue(Helpers.isEqual(rate, null)))
                {
                    throw new NullResponse((String)Helpers.add(Helpers.add(this.id, " fetchFundingRate () returned no data for "), symbol)) ;
                } else
                {
                    return rate;
                }
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchFundingRate () is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchFundingInterval(Object symbol2, Object... optionalArgs)
    {
        final Object symbol3 = symbol2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = symbol3;
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchFundingIntervals")))
            {
                (this.loadMarkets()).join();
                Object market = this.market(symbol);
                symbol = Helpers.GetValue(market, "symbol");
                if (!Helpers.isTrue(Helpers.GetValue(market, "contract")))
                {
                    throw new BadSymbol((String)Helpers.add(this.id, " fetchFundingInterval() supports contract markets only")) ;
                }
                Object rates = (this.fetchFundingIntervals(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), parameters)).join();
                Object rate = this.safeValue(rates, symbol);
                if (Helpers.isTrue(Helpers.isEqual(rate, null)))
                {
                    throw new NullResponse((String)Helpers.add(Helpers.add(this.id, " fetchFundingInterval() returned no data for "), symbol)) ;
                } else
                {
                    return rate;
                }
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchFundingInterval() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMarkOHLCV(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name exchange#fetchMarkOHLCV
            * @description fetches historical mark price candlestick data containing the open, high, low, and close price of a market
            * @param {string} symbol unified symbol of the market to fetch OHLCV data for
            * @param {string} timeframe the length of time each candle represents
            * @param {int} [since] timestamp in ms of the earliest candle to fetch
            * @param {int} [limit] the maximum amount of candles to fetch
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {float[][]} A list of candles ordered as timestamp, open, high, low, close, undefined
            */
            Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchMarkOHLCV")))
            {
                Object request = new java.util.HashMap<String, Object>() {{
                    put( "price", "mark" );
                }};
                return (this.fetchOHLCV(symbol, timeframe, since, limit, this.extend(request, parameters))).join();
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchMarkOHLCV () is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchIndexOHLCV(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name exchange#fetchIndexOHLCV
            * @description fetches historical index price candlestick data containing the open, high, low, and close price of a market
            * @param {string} symbol unified symbol of the market to fetch OHLCV data for
            * @param {string} timeframe the length of time each candle represents
            * @param {int} [since] timestamp in ms of the earliest candle to fetch
            * @param {int} [limit] the maximum amount of candles to fetch
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {} A list of candles ordered as timestamp, open, high, low, close, undefined
            */
            Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchIndexOHLCV")))
            {
                Object request = new java.util.HashMap<String, Object>() {{
                    put( "price", "index" );
                }};
                return (this.fetchOHLCV(symbol, timeframe, since, limit, this.extend(request, parameters))).join();
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchIndexOHLCV () is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPremiumIndexOHLCV(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name exchange#fetchPremiumIndexOHLCV
            * @description fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
            * @param {string} symbol unified symbol of the market to fetch OHLCV data for
            * @param {string} timeframe the length of time each candle represents
            * @param {int} [since] timestamp in ms of the earliest candle to fetch
            * @param {int} [limit] the maximum amount of candles to fetch
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {float[][]} A list of candles ordered as timestamp, open, high, low, close, undefined
            */
            Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchPremiumIndexOHLCV")))
            {
                Object request = new java.util.HashMap<String, Object>() {{
                    put( "price", "premiumIndex" );
                }};
                return (this.fetchOHLCV(symbol, timeframe, since, limit, this.extend(request, parameters))).join();
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchPremiumIndexOHLCV () is not supported yet")) ;
            }
        });

    }

    public Object handleTimeInForce(Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * Must add timeInForce to this.options to use this method
        * @returns {string} returns the exchange specific value for timeInForce
        */
        Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        Object timeInForce = this.safeStringUpper(parameters, "timeInForce"); // supported values GTC, IOC, PO
        if (Helpers.isTrue(!Helpers.isEqual(timeInForce, null)))
        {
            Object exchangeValue = this.safeString(Helpers.GetValue(this.options, "timeInForce"), timeInForce);
            if (Helpers.isTrue(Helpers.isEqual(exchangeValue, null)))
            {
                throw new ExchangeError((String)Helpers.add(Helpers.add(Helpers.add(this.id, " does not support timeInForce \""), timeInForce), "\"")) ;
            }
            return exchangeValue;
        }
        return null;
    }

    public Object convertTypeToAccount(Object account)
    {
        /**
         * @ignore
         * @method
         * Must add accountsByType to this.options to use this method
         * @param {string} account key for account name in this.options['accountsByType']
         * @returns the exchange specific account name or the isolated margin id for transfers
         */
        Object accountsByType = this.safeDict(this.options, "accountsByType", new java.util.HashMap<String, Object>() {{}});
        Object lowercaseAccount = ((String)account).toLowerCase();
        if (Helpers.isTrue(Helpers.inOp(accountsByType, lowercaseAccount)))
        {
            return Helpers.GetValue(accountsByType, lowercaseAccount);
        } else if (Helpers.isTrue(Helpers.isTrue((Helpers.inOp(this.markets, account))) || Helpers.isTrue((Helpers.inOp(this.markets_by_id, account)))))
        {
            Object market = this.market(account);
            return Helpers.GetValue(market, "id");
        } else
        {
            return account;
        }
    }

    public void checkRequiredArgument(Object methodName, Object argument, Object argumentName, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @param {string} methodName the name of the method that the argument is being checked for
        * @param {string} argument the argument's actual value provided
        * @param {string} argumentName the name of the argument being checked (for logging purposes)
        * @param {string[]} options a list of options that the argument can be
        * @returns {undefined}
        */
        Object options = Helpers.getArg(optionalArgs, 0, new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object optionsLength = Helpers.getArrayLength(options);
        if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(argument, null))) || Helpers.isTrue((Helpers.isTrue((Helpers.isGreaterThan(optionsLength, 0))) && Helpers.isTrue((!Helpers.isTrue((this.inArray(argument, options)))))))))
        {
            Object messageOptions = String.join((String)", ", (java.util.List<String>)options);
            Object message = Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(this.id, " "), methodName), "() requires a "), argumentName), " argument");
            if (Helpers.isTrue(!Helpers.isEqual(messageOptions, "")))
            {
                message = Helpers.add(message, Helpers.add(Helpers.add(Helpers.add(", one of ", "("), messageOptions), ")"));
            }
            throw new ArgumentsRequired((String)message) ;
        }
    }

    public void checkRequiredMarginArgument(Object methodName, Object symbol, Object marginMode)
    {
        /**
         * @ignore
         * @method
         * @param {string} symbol unified symbol of the market
         * @param {string} methodName name of the method that requires a symbol
         * @param {string} marginMode is either 'isolated' or 'cross'
         */
        if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(marginMode, "isolated"))) && Helpers.isTrue((Helpers.isEqual(symbol, null)))))
        {
            throw new ArgumentsRequired((String)Helpers.add(Helpers.add(Helpers.add(this.id, " "), methodName), "() requires a symbol argument for isolated margin")) ;
        } else if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(marginMode, "cross"))) && Helpers.isTrue((!Helpers.isEqual(symbol, null)))))
        {
            throw new ArgumentsRequired((String)Helpers.add(Helpers.add(Helpers.add(this.id, " "), methodName), "() cannot have a symbol argument for cross margin")) ;
        }
    }

    public Object parseDepositWithdrawFees(Object response, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @param {object[]|object} response unparsed response from the exchange
        * @param {string[]|undefined} codes the unified currency codes to fetch transactions fees for, returns all currencies when undefined
        * @param {str} currencyIdKey *should only be undefined when response is a dictionary* the object key that corresponds to the currency id
        * @returns {object} objects with withdraw and deposit fees, indexed by currency codes
        */
        Object codes = Helpers.getArg(optionalArgs, 0, null);
        Object currencyIdKey = Helpers.getArg(optionalArgs, 1, null);
        Object depositWithdrawFees = new java.util.HashMap<String, Object>() {{}};
        Object isArray = ((response instanceof java.util.List) || (response.getClass().isArray()));
        Object responseKeys = response;
        if (!Helpers.isTrue(isArray))
        {
            responseKeys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)response).keySet());
        }
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(responseKeys)); i++)
        {
            Object entry = Helpers.GetValue(responseKeys, i);
            Object dictionary = ((Helpers.isTrue(isArray))) ? entry : Helpers.GetValue(response, entry);
            Object currencyId = ((Helpers.isTrue(isArray))) ? this.safeString(dictionary, currencyIdKey) : entry;
            Object currency = this.safeCurrency(currencyId);
            Object code = this.safeString(currency, "code");
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(codes, null))) || Helpers.isTrue((this.inArray(code, codes)))))
            {
                Helpers.addElementToObject(depositWithdrawFees, code, this.parseDepositWithdrawFee(dictionary, currency));
            }
        }
        return depositWithdrawFees;
    }

    public Object parseDepositWithdrawFee(Object fee, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseDepositWithdrawFee() is not supported yet")) ;
    }

    public Object depositWithdrawFee(Object info)
    {
        return new java.util.HashMap<String, Object>() {{
            put( "info", info );
            put( "withdraw", new java.util.HashMap<String, Object>() {{
                put( "fee", null );
                put( "percentage", null );
            }} );
            put( "deposit", new java.util.HashMap<String, Object>() {{
                put( "fee", null );
                put( "percentage", null );
            }} );
            put( "networks", new java.util.HashMap<String, Object>() {{}} );
        }};
    }

    public Object assignDefaultDepositWithdrawFees(Object fee, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description Takes a depositWithdrawFee structure and assigns the default values for withdraw and deposit
        * @param {object} fee A deposit withdraw fee structure
        * @param {object} currency A currency structure, the response from this.currency ()
        * @returns {object} A deposit withdraw fee structure
        */
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        Object networkKeys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)Helpers.GetValue(fee, "networks")).keySet());
        Object numNetworks = Helpers.getArrayLength(networkKeys);
        if (Helpers.isTrue(Helpers.isEqual(numNetworks, 1)))
        {
            Helpers.addElementToObject(fee, "withdraw", Helpers.GetValue(Helpers.GetValue(Helpers.GetValue(fee, "networks"), Helpers.GetValue(networkKeys, 0)), "withdraw"));
            Helpers.addElementToObject(fee, "deposit", Helpers.GetValue(Helpers.GetValue(Helpers.GetValue(fee, "networks"), Helpers.GetValue(networkKeys, 0)), "deposit"));
            return fee;
        }
        Object currencyCode = this.safeString(currency, "code");
        for (var i = 0; Helpers.isLessThan(i, numNetworks); i++)
        {
            Object network = Helpers.GetValue(networkKeys, i);
            if (Helpers.isTrue(Helpers.isEqual(network, currencyCode)))
            {
                Helpers.addElementToObject(fee, "withdraw", Helpers.GetValue(Helpers.GetValue(Helpers.GetValue(fee, "networks"), Helpers.GetValue(networkKeys, i)), "withdraw"));
                Helpers.addElementToObject(fee, "deposit", Helpers.GetValue(Helpers.GetValue(Helpers.GetValue(fee, "networks"), Helpers.GetValue(networkKeys, i)), "deposit"));
            }
        }
        return fee;
    }

    public Object parseIncome(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseIncome () is not supported yet")) ;
    }

    public Object parseIncomes(Object incomes, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description parses funding fee info from exchange response
        * @param {object[]} incomes each item describes once instance of currency being received or paid
        * @param {object} market ccxt market
        * @param {int} [since] when defined, the response items are filtered to only include items after this timestamp
        * @param {int} [limit] limits the number of items in the response
        * @returns {object[]} an array of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
        */
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(incomes)); i++)
        {
            Object entry = Helpers.GetValue(incomes, i);
            Object parsed = this.parseIncome(entry, market);
            ((java.util.List<Object>)result).add(parsed);
        }
        Object sorted = this.sortBy(result, "timestamp");
        Object symbol = this.safeString(market, "symbol");
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }

    public Object getMarketFromSymbols(Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(symbols, null)))
        {
            return null;
        }
        Object firstMarket = this.safeString(symbols, 0);
        Object market = this.market(firstMarket);
        return market;
    }

    public Object parseWsOHLCVs(Object ohlcvs, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object timeframe = Helpers.getArg(optionalArgs, 1, "1m");
        Object since = Helpers.getArg(optionalArgs, 2, null);
        Object limit = Helpers.getArg(optionalArgs, 3, null);
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(ohlcvs)); i++)
        {
            ((java.util.List<Object>)results).add(this.parseWsOHLCV(Helpers.GetValue(ohlcvs, i), market));
        }
        return results;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchTransactions(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name exchange#fetchTransactions
            * @deprecated
            * @description *DEPRECATED* use fetchDepositsWithdrawals instead
            * @param {string} code unified currency code for the currency of the deposit/withdrawals, default is undefined
            * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
            * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
            */
            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchDepositsWithdrawals")))
            {
                return (this.fetchDepositsWithdrawals(code, since, limit, parameters)).join();
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchTransactions () is not supported yet")) ;
            }
        });

    }

    public Object filterByArrayPositions(Object objects, Object key, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description Typed wrapper for filterByArray that returns a list of positions
        */
        Object values = Helpers.getArg(optionalArgs, 0, null);
        Object indexed = Helpers.getArg(optionalArgs, 1, true);
        return this.filterByArray(objects, key, values, indexed);
    }

    public Object filterByArrayTickers(Object objects, Object key, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description Typed wrapper for filterByArray that returns a dictionary of tickers
        */
        Object values = Helpers.getArg(optionalArgs, 0, null);
        Object indexed = Helpers.getArg(optionalArgs, 1, true);
        return this.filterByArray(objects, key, values, indexed);
    }

    public Object createOHLCVObject(Object symbol, Object timeframe, Object data)
    {
        Object res = new java.util.HashMap<String, Object>() {{}};
        Helpers.addElementToObject(res, symbol, new java.util.HashMap<String, Object>() {{}});
        Helpers.addElementToObject(Helpers.GetValue(res, symbol), timeframe, data);
        return res;
    }

    public Object handleMaxEntriesPerRequestAndParams(Object method, Object... optionalArgs)
    {
        Object maxEntriesPerRequest = Helpers.getArg(optionalArgs, 0, null);
        Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
        Object newMaxEntriesPerRequest = null;
        var newMaxEntriesPerRequestparametersVariable = this.handleOptionAndParams(parameters, method, "maxEntriesPerRequest");
        newMaxEntriesPerRequest = ((java.util.List<Object>) newMaxEntriesPerRequestparametersVariable).get(0);
        parameters = ((java.util.List<Object>) newMaxEntriesPerRequestparametersVariable).get(1);
        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(newMaxEntriesPerRequest, null))) && Helpers.isTrue((!Helpers.isEqual(newMaxEntriesPerRequest, maxEntriesPerRequest)))))
        {
            maxEntriesPerRequest = newMaxEntriesPerRequest;
        }
        if (Helpers.isTrue(Helpers.isEqual(maxEntriesPerRequest, null)))
        {
            maxEntriesPerRequest = 1000; // default to 1000
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(maxEntriesPerRequest, parameters));
    }

    public java.util.concurrent.CompletableFuture<Object> fetchPaginatedCallDynamic(Object method2, Object... optionalArgs)
    {
        final Object method3 = method2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object method = method3;
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            Object maxEntriesPerRequest = Helpers.getArg(optionalArgs, 4, null);
            Object removeRepeated = Helpers.getArg(optionalArgs, 5, true);
            Object maxCalls = null;
            var maxCallsparametersVariable = this.handleOptionAndParams(parameters, method, "paginationCalls", 10);
            maxCalls = ((java.util.List<Object>) maxCallsparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxCallsparametersVariable).get(1);
            Object maxRetries = null;
            var maxRetriesparametersVariable = this.handleOptionAndParams(parameters, method, "maxRetries", 3);
            maxRetries = ((java.util.List<Object>) maxRetriesparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxRetriesparametersVariable).get(1);
            Object paginationDirection = null;
            var paginationDirectionparametersVariable = this.handleOptionAndParams(parameters, method, "paginationDirection", "backward");
            paginationDirection = ((java.util.List<Object>) paginationDirectionparametersVariable).get(0);
            parameters = ((java.util.List<Object>) paginationDirectionparametersVariable).get(1);
            Object paginationTimestamp = null;
            Object removeRepeatedOption = removeRepeated;
            var removeRepeatedOptionparametersVariable = this.handleOptionAndParams(parameters, method, "removeRepeated", removeRepeated);
            removeRepeatedOption = ((java.util.List<Object>) removeRepeatedOptionparametersVariable).get(0);
            parameters = ((java.util.List<Object>) removeRepeatedOptionparametersVariable).get(1);
            Object calls = 0;
            Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            Object errors = 0;
            Object until = this.safeIntegerN(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList("until", "untill", "till"))); // do not omit it from params here
            var maxEntriesPerRequestparametersVariable = this.handleMaxEntriesPerRequestAndParams(method, maxEntriesPerRequest, parameters);
            maxEntriesPerRequest = ((java.util.List<Object>) maxEntriesPerRequestparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxEntriesPerRequestparametersVariable).get(1);
            if (Helpers.isTrue((Helpers.isEqual(paginationDirection, "forward"))))
            {
                if (Helpers.isTrue(Helpers.isEqual(since, null)))
                {
                    throw new ArgumentsRequired((String)Helpers.add(this.id, " pagination requires a since argument when paginationDirection set to forward")) ;
                }
                paginationTimestamp = since;
            }
            while ((Helpers.isLessThan(calls, maxCalls)))
            {
                calls = Helpers.add(calls, 1);
                try
                {
                    if (Helpers.isTrue(Helpers.isEqual(paginationDirection, "backward")))
                    {
                        // do it backwards, starting from the last
                        // UNTIL filtering is required in order to work
                        if (Helpers.isTrue(!Helpers.isEqual(paginationTimestamp, null)))
                        {
                            Helpers.addElementToObject(parameters, "until", Helpers.subtract(paginationTimestamp, 1));
                        }
                        Object response = (Helpers.callDynamically(this, method, new Object[] { symbol, null, maxEntriesPerRequest, parameters })).join();
                        Object responseLength = Helpers.getArrayLength(response);
                        if (Helpers.isTrue(this.verbose))
                        {
                            Object backwardMessage = Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add("Dynamic pagination call ", this.numberToString(calls)), " method "), method), " response length "), this.numberToString(responseLength));
                            if (Helpers.isTrue(!Helpers.isEqual(paginationTimestamp, null)))
                            {
                                backwardMessage = Helpers.add(backwardMessage, Helpers.add(" timestamp ", this.numberToString(paginationTimestamp)));
                            }
                            this.log(backwardMessage);
                        }
                        if (Helpers.isTrue(Helpers.isEqual(responseLength, 0)))
                        {
                            break;
                        }
                        errors = 0;
                        result = this.arrayConcat(result, response);
                        Object firstElement = this.safeValue(response, 0);
                        paginationTimestamp = this.safeInteger2(firstElement, "timestamp", 0);
                        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(since, null))) && Helpers.isTrue((Helpers.isLessThanOrEqual(paginationTimestamp, since)))))
                        {
                            break;
                        }
                    } else
                    {
                        // do it forwards, starting from the since
                        Object response = (Helpers.callDynamically(this, method, new Object[] { symbol, paginationTimestamp, maxEntriesPerRequest, parameters })).join();
                        Object responseLength = Helpers.getArrayLength(response);
                        if (Helpers.isTrue(this.verbose))
                        {
                            Object forwardMessage = Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add("Dynamic pagination call ", this.numberToString(calls)), " method "), method), " response length "), this.numberToString(responseLength));
                            if (Helpers.isTrue(!Helpers.isEqual(paginationTimestamp, null)))
                            {
                                forwardMessage = Helpers.add(forwardMessage, Helpers.add(" timestamp ", this.numberToString(paginationTimestamp)));
                            }
                            this.log(forwardMessage);
                        }
                        if (Helpers.isTrue(Helpers.isEqual(responseLength, 0)))
                        {
                            break;
                        }
                        errors = 0;
                        result = this.arrayConcat(result, response);
                        Object last = this.safeValue(response, Helpers.subtract(responseLength, 1));
                        paginationTimestamp = Helpers.add(this.safeInteger(last, "timestamp"), 1);
                        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(until, null))) && Helpers.isTrue((Helpers.isGreaterThanOrEqual(paginationTimestamp, until)))))
                        {
                            break;
                        }
                    }
                } catch(Exception e)
                {
                    errors = Helpers.add(errors, 1);
                    if (Helpers.isTrue(Helpers.isGreaterThan(errors, maxRetries)))
                    {
                        throw e;
                    }
                }
            }
            Object uniqueResults = result;
            if (Helpers.isTrue(removeRepeatedOption))
            {
                uniqueResults = this.removeRepeatedElementsFromArray(result);
            }
            Object key = ((Helpers.isTrue((Helpers.isEqual(method, "fetchOHLCV"))))) ? 0 : "timestamp";
            return this.filterBySinceLimit(uniqueResults, since, limit, key);
        });

    }

    public java.util.concurrent.CompletableFuture<Object> safeDeterministicCall(Object method2, Object... optionalArgs)
    {
        final Object method3 = method2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object method = method3;
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object timeframe = Helpers.getArg(optionalArgs, 3, null);
            Object parameters = Helpers.getArg(optionalArgs, 4, new java.util.HashMap<String, Object>() {{}});
            Object maxRetries = null;
            var maxRetriesparametersVariable = this.handleOptionAndParams(parameters, method, "maxRetries", 3);
            maxRetries = ((java.util.List<Object>) maxRetriesparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxRetriesparametersVariable).get(1);
            Object errors = 0;
            while (Helpers.isLessThanOrEqual(errors, maxRetries))
            {
                try
                {
                    if (Helpers.isTrue(Helpers.isTrue(timeframe) && Helpers.isTrue(!Helpers.isEqual(method, "fetchFundingRateHistory"))))
                    {
                        return (Helpers.callDynamically(this, method, new Object[] { symbol, timeframe, since, limit, parameters })).join();
                    } else
                    {
                        return (Helpers.callDynamically(this, method, new Object[] { symbol, since, limit, parameters })).join();
                    }
                } catch(Exception e)
                {
                    if (Helpers.isTrue(Helpers.isInstance(e, RateLimitExceeded.class)))
                    {
                        throw e;
                    }
                    errors = Helpers.add(errors, 1);
                    if (Helpers.isTrue(Helpers.isGreaterThan(errors, maxRetries)))
                    {
                        throw e;
                    }
                }
            }
            return new java.util.ArrayList<Object>(java.util.Arrays.asList());
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPaginatedCallDeterministic(Object method2, Object... optionalArgs)
    {
        final Object method3 = method2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object method = method3;
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object timeframe = Helpers.getArg(optionalArgs, 3, null);
            Object parameters = Helpers.getArg(optionalArgs, 4, new java.util.HashMap<String, Object>() {{}});
            Object maxEntriesPerRequest = Helpers.getArg(optionalArgs, 5, null);
            Object maxCalls = null;
            var maxCallsparametersVariable = this.handleOptionAndParams(parameters, method, "paginationCalls", 10);
            maxCalls = ((java.util.List<Object>) maxCallsparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxCallsparametersVariable).get(1);
            var maxEntriesPerRequestparametersVariable = this.handleMaxEntriesPerRequestAndParams(method, maxEntriesPerRequest, parameters);
            maxEntriesPerRequest = ((java.util.List<Object>) maxEntriesPerRequestparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxEntriesPerRequestparametersVariable).get(1);
            Object current = this.milliseconds();
            Object tasks = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            Object time = Helpers.multiply(this.parseTimeframe(timeframe), 1000);
            Object step = Helpers.multiply(time, maxEntriesPerRequest);
            Object currentSince = Helpers.subtract(Helpers.subtract(current, (Helpers.multiply(maxCalls, step))), 1);
            if (Helpers.isTrue(!Helpers.isEqual(since, null)))
            {
                currentSince = Helpers.mathMax(currentSince, since);
            } else
            {
                currentSince = Helpers.mathMax(currentSince, 1241440531000L); // avoid timestamps older than 2009
            }
            Object until = this.safeInteger2(parameters, "until", "till"); // do not omit it here
            if (Helpers.isTrue(!Helpers.isEqual(until, null)))
            {
                Object requiredCalls = Math.ceil(Double.parseDouble(Helpers.toString(Helpers.divide((Helpers.subtract(until, since)), step))));
                if (Helpers.isTrue(Helpers.isGreaterThan(requiredCalls, maxCalls)))
                {
                    throw new BadRequest((String)Helpers.add(Helpers.add(Helpers.add(Helpers.add(this.id, " the number of required calls is greater than the max number of calls allowed, either increase the paginationCalls or decrease the since-until gap. Current paginationCalls limit is "), String.valueOf(maxCalls)), " required calls is "), String.valueOf(requiredCalls))) ;
                }
            }
            for (var i = 0; Helpers.isLessThan(i, maxCalls); i++)
            {
                if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(until, null))) && Helpers.isTrue((Helpers.isGreaterThanOrEqual(currentSince, until)))))
                {
                    break;
                }
                if (Helpers.isTrue(Helpers.isGreaterThanOrEqual(currentSince, current)))
                {
                    break;
                }
                ((java.util.List<Object>)tasks).add(this.safeDeterministicCall(method, symbol, currentSince, maxEntriesPerRequest, timeframe, parameters));
                currentSince = Helpers.subtract(this.sum(currentSince, step), 1);
            }
            Object results = (Helpers.promiseAll(tasks)).join();
            Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(results)); i++)
            {
                result = this.arrayConcat(result, Helpers.GetValue(results, i));
            }
            Object uniqueResults = ((Object)this.removeRepeatedElementsFromArray(result));
            Object key = ((Helpers.isTrue((Helpers.isEqual(method, "fetchOHLCV"))))) ? 0 : "timestamp";
            return this.filterBySinceLimit(uniqueResults, since, limit, key);
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPaginatedCallCursor(Object method2, Object... optionalArgs)
    {
        final Object method3 = method2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object method = method3;
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            Object cursorReceived = Helpers.getArg(optionalArgs, 4, null);
            Object cursorSent = Helpers.getArg(optionalArgs, 5, null);
            Object cursorIncrement = Helpers.getArg(optionalArgs, 6, null);
            Object maxEntriesPerRequest = Helpers.getArg(optionalArgs, 7, null);
            Object maxCalls = null;
            var maxCallsparametersVariable = this.handleOptionAndParams(parameters, method, "paginationCalls", 10);
            maxCalls = ((java.util.List<Object>) maxCallsparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxCallsparametersVariable).get(1);
            Object maxRetries = null;
            var maxRetriesparametersVariable = this.handleOptionAndParams(parameters, method, "maxRetries", 3);
            maxRetries = ((java.util.List<Object>) maxRetriesparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxRetriesparametersVariable).get(1);
            var maxEntriesPerRequestparametersVariable = this.handleMaxEntriesPerRequestAndParams(method, maxEntriesPerRequest, parameters);
            maxEntriesPerRequest = ((java.util.List<Object>) maxEntriesPerRequestparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxEntriesPerRequestparametersVariable).get(1);
            Object cursorValue = null;
            Object i = 0;
            Object errors = 0;
            Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            Object timeframe = this.safeString(parameters, "timeframe");
            parameters = this.omit(parameters, "timeframe"); // reading the timeframe from the method arguments to avoid changing the signature
            while (Helpers.isLessThan(i, maxCalls))
            {
                try
                {
                    if (Helpers.isTrue(!Helpers.isEqual(cursorValue, null)))
                    {
                        if (Helpers.isTrue(!Helpers.isEqual(cursorIncrement, null)))
                        {
                            cursorValue = Helpers.add(this.parseToInt(cursorValue), cursorIncrement);
                        }
                        Helpers.addElementToObject(parameters, cursorSent, cursorValue);
                    }
                    Object response = null;
                    if (Helpers.isTrue(Helpers.isEqual(method, "fetchAccounts")))
                    {
                        response = (Helpers.callDynamically(this, method, new Object[] { parameters })).join();
                    } else if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(method, "getLeverageTiersPaginated")) || Helpers.isTrue(Helpers.isEqual(method, "fetchPositions"))))
                    {
                        response = (Helpers.callDynamically(this, method, new Object[] { symbol, parameters })).join();
                    } else if (Helpers.isTrue(Helpers.isEqual(method, "fetchOpenInterestHistory")))
                    {
                        response = (Helpers.callDynamically(this, method, new Object[] { symbol, timeframe, since, maxEntriesPerRequest, parameters })).join();
                    } else
                    {
                        response = (Helpers.callDynamically(this, method, new Object[] { symbol, since, maxEntriesPerRequest, parameters })).join();
                    }
                    errors = 0;
                    Object responseLength = Helpers.getArrayLength(response);
                    if (Helpers.isTrue(this.verbose))
                    {
                        Object cursorString = ((Helpers.isTrue((Helpers.isEqual(cursorValue, null))))) ? "" : cursorValue;
                        Object iteration = (Helpers.add(i, 1));
                        Object cursorMessage = Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add("Cursor pagination call ", String.valueOf(iteration)), " method "), method), " response length "), String.valueOf(responseLength)), " cursor "), cursorString);
                        this.log(cursorMessage);
                    }
                    if (Helpers.isTrue(Helpers.isEqual(responseLength, 0)))
                    {
                        break;
                    }
                    result = this.arrayConcat(result, response);
                    Object last = this.safeDict(response, Helpers.subtract(responseLength, 1));
                    // cursorValue = this.safeValue (last['info'], cursorReceived);
                    cursorValue = null; // search for the cursor
                    for (var j = 0; Helpers.isLessThan(j, responseLength); j++)
                    {
                        Object index = Helpers.subtract(Helpers.subtract(responseLength, j), 1);
                        Object entry = this.safeDict(response, index);
                        Object info = this.safeDict(entry, "info");
                        Object cursor = this.safeValue(info, cursorReceived);
                        if (Helpers.isTrue(!Helpers.isEqual(cursor, null)))
                        {
                            cursorValue = cursor;
                            break;
                        }
                    }
                    if (Helpers.isTrue(Helpers.isEqual(cursorValue, null)))
                    {
                        break;
                    }
                    Object lastTimestamp = this.safeInteger(last, "timestamp");
                    if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(lastTimestamp, null)) && Helpers.isTrue(Helpers.isLessThan(lastTimestamp, since))))
                    {
                        break;
                    }
                } catch(Exception e)
                {
                    errors = Helpers.add(errors, 1);
                    if (Helpers.isTrue(Helpers.isGreaterThan(errors, maxRetries)))
                    {
                        throw e;
                    }
                }
                i = Helpers.add(i, 1);
            }
            Object sorted = this.sortCursorPaginatedResult(result);
            Object key = ((Helpers.isTrue((Helpers.isEqual(method, "fetchOHLCV"))))) ? 0 : "timestamp";
            return this.filterBySinceLimit(sorted, since, limit, key);
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPaginatedCallIncremental(Object method2, Object... optionalArgs)
    {
        final Object method3 = method2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object method = method3;
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            Object pageKey = Helpers.getArg(optionalArgs, 4, null);
            Object maxEntriesPerRequest = Helpers.getArg(optionalArgs, 5, null);
            Object maxCalls = null;
            var maxCallsparametersVariable = this.handleOptionAndParams(parameters, method, "paginationCalls", 10);
            maxCalls = ((java.util.List<Object>) maxCallsparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxCallsparametersVariable).get(1);
            Object maxRetries = null;
            var maxRetriesparametersVariable = this.handleOptionAndParams(parameters, method, "maxRetries", 3);
            maxRetries = ((java.util.List<Object>) maxRetriesparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxRetriesparametersVariable).get(1);
            var maxEntriesPerRequestparametersVariable = this.handleMaxEntriesPerRequestAndParams(method, maxEntriesPerRequest, parameters);
            maxEntriesPerRequest = ((java.util.List<Object>) maxEntriesPerRequestparametersVariable).get(0);
            parameters = ((java.util.List<Object>) maxEntriesPerRequestparametersVariable).get(1);
            Object i = 0;
            Object errors = 0;
            Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            while (Helpers.isLessThan(i, maxCalls))
            {
                try
                {
                    Helpers.addElementToObject(parameters, pageKey, Helpers.add(i, 1));
                    Object response = (Helpers.callDynamically(this, method, new Object[] { symbol, since, maxEntriesPerRequest, parameters })).join();
                    errors = 0;
                    Object responseLength = Helpers.getArrayLength(response);
                    if (Helpers.isTrue(this.verbose))
                    {
                        Object iteration = String.valueOf((Helpers.add(i, 1)));
                        Object incrementalMessage = Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add("Incremental pagination call ", iteration), " method "), method), " response length "), String.valueOf(responseLength));
                        this.log(incrementalMessage);
                    }
                    if (Helpers.isTrue(Helpers.isEqual(responseLength, 0)))
                    {
                        break;
                    }
                    result = this.arrayConcat(result, response);
                } catch(Exception e)
                {
                    errors = Helpers.add(errors, 1);
                    if (Helpers.isTrue(Helpers.isGreaterThan(errors, maxRetries)))
                    {
                        throw e;
                    }
                }
                i = Helpers.add(i, 1);
            }
            Object sorted = this.sortCursorPaginatedResult(result);
            Object key = ((Helpers.isTrue((Helpers.isEqual(method, "fetchOHLCV"))))) ? 0 : "timestamp";
            return this.filterBySinceLimit(sorted, since, limit, key);
        });

    }

    public Object sortCursorPaginatedResult(Object result)
    {
        Object first = this.safeValue(result, 0);
        if (Helpers.isTrue(!Helpers.isEqual(first, null)))
        {
            if (Helpers.isTrue(Helpers.inOp(first, "timestamp")))
            {
                return this.sortBy(result, "timestamp", true);
            }
            if (Helpers.isTrue(Helpers.inOp(first, "id")))
            {
                return this.sortBy(result, "id", true);
            }
        }
        return result;
    }

    public Object removeRepeatedElementsFromArray(Object input, Object... optionalArgs)
    {
        Object fallbackToTimestamp = Helpers.getArg(optionalArgs, 0, true);
        Object uniqueDic = new java.util.HashMap<String, Object>() {{}};
        Object uniqueResult = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(input)); i++)
        {
            Object entry = Helpers.GetValue(input, i);
            Object uniqValue = ((Helpers.isTrue(fallbackToTimestamp))) ? this.safeStringN(entry, new java.util.ArrayList<Object>(java.util.Arrays.asList("id", "timestamp", 0))) : this.safeString(entry, "id");
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(uniqValue, null)) && !Helpers.isTrue((Helpers.inOp(uniqueDic, uniqValue)))))
            {
                Helpers.addElementToObject(uniqueDic, uniqValue, 1);
                ((java.util.List<Object>)uniqueResult).add(entry);
            }
        }
        Object valuesLength = Helpers.getArrayLength(uniqueResult);
        if (Helpers.isTrue(Helpers.isGreaterThan(valuesLength, 0)))
        {
            return uniqueResult;
        }
        return input;
    }

    public Object removeRepeatedTradesFromArray(Object input)
    {
        Object uniqueResult = new java.util.HashMap<String, Object>() {{}};
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(input)); i++)
        {
            Object entry = Helpers.GetValue(input, i);
            Object id = this.safeString(entry, "id");
            if (Helpers.isTrue(Helpers.isEqual(id, null)))
            {
                Object price = this.safeString(entry, "price");
                Object amount = this.safeString(entry, "amount");
                Object timestamp = this.safeString(entry, "timestamp");
                Object side = this.safeString(entry, "side");
                // unique trade identifier
                id = Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add("t_", String.valueOf(timestamp)), "_"), side), "_"), price), "_"), amount);
            }
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(id, null)) && !Helpers.isTrue((Helpers.inOp(uniqueResult, id)))))
            {
                Helpers.addElementToObject(uniqueResult, id, entry);
            }
        }
        Object values = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)uniqueResult).values());
        return values;
    }

    public Object removeKeysFromDict(Object dict, Object removeKeys)
    {
        Object keys = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)dict).keySet());
        Object newDict = new java.util.HashMap<String, Object>() {{}};
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
        {
            Object key = Helpers.GetValue(keys, i);
            if (!Helpers.isTrue(this.inArray(key, removeKeys)))
            {
                Helpers.addElementToObject(newDict, key, Helpers.GetValue(dict, key));
            }
        }
        return newDict;
    }

    public Object handleUntilOption(Object key, Object request, Object parameters, Object... optionalArgs)
    {
        Object multiplier = Helpers.getArg(optionalArgs, 0, 1);
        Object until = this.safeInteger2(parameters, "until", "till");
        if (Helpers.isTrue(!Helpers.isEqual(until, null)))
        {
            Helpers.addElementToObject(request, key, this.parseToInt(Helpers.multiply(until, multiplier)));
            parameters = this.omit(parameters, new java.util.ArrayList<Object>(java.util.Arrays.asList("until", "till")));
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(request, parameters));
    }

    public Object safeOpenInterest(Object interest, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object symbol = this.safeString(interest, "symbol");
        if (Helpers.isTrue(Helpers.isEqual(symbol, null)))
        {
            symbol = this.safeString(market, "symbol");
        }
        final Object finalSymbol = symbol;
        return this.extend(interest, new java.util.HashMap<String, Object>() {{
            put( "symbol", finalSymbol );
            put( "baseVolume", Exchange.this.safeNumber(interest, "baseVolume") );
            put( "quoteVolume", Exchange.this.safeNumber(interest, "quoteVolume") );
            put( "openInterestAmount", Exchange.this.safeNumber(interest, "openInterestAmount") );
            put( "openInterestValue", Exchange.this.safeNumber(interest, "openInterestValue") );
            put( "timestamp", Exchange.this.safeInteger(interest, "timestamp") );
            put( "datetime", Exchange.this.safeString(interest, "datetime") );
            put( "info", Exchange.this.safeValue(interest, "info") );
        }});
    }

    public Object parseLiquidation(Object liquidation, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseLiquidation () is not supported yet")) ;
    }

    public Object parseLiquidations(Object liquidations, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description parses liquidation info from the exchange response
        * @param {object[]} liquidations each item describes an instance of a liquidation event
        * @param {object} market ccxt market
        * @param {int} [since] when defined, the response items are filtered to only include items after this timestamp
        * @param {int} [limit] limits the number of items in the response
        * @returns {object[]} an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
        */
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(liquidations)); i++)
        {
            Object entry = Helpers.GetValue(liquidations, i);
            Object parsed = this.parseLiquidation(entry, market);
            ((java.util.List<Object>)result).add(parsed);
        }
        Object sorted = this.sortBy(result, "timestamp");
        Object symbol = this.safeString(market, "symbol");
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }

    public Object parseGreeks(Object greeks, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseGreeks () is not supported yet")) ;
    }

    public Object parseAllGreeks(Object greeks, Object... optionalArgs)
    {
        //
        // the value of greeks is either a dict or a list
        //
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        if (Helpers.isTrue(((greeks instanceof java.util.List) || (greeks.getClass().isArray()))))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(greeks)); i++)
            {
                Object parsedTicker = this.parseGreeks(Helpers.GetValue(greeks, i));
                Object greek = this.extend(parsedTicker, parameters);
                ((java.util.List<Object>)results).add(greek);
            }
        } else
        {
            Object marketIds = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)greeks).keySet());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(marketIds)); i++)
            {
                Object marketId = Helpers.GetValue(marketIds, i);
                Object market = this.safeMarket(marketId);
                Object parsed = this.parseGreeks(Helpers.GetValue(greeks, marketId), market);
                Object greek = this.extend(parsed, parameters);
                ((java.util.List<Object>)results).add(greek);
            }
        }
        symbols = this.marketSymbols(symbols);
        return this.filterByArray(results, "symbol", symbols);
    }

    public Object parseOption(Object chain, Object... optionalArgs)
    {
        Object currency = Helpers.getArg(optionalArgs, 0, null);
        Object market = Helpers.getArg(optionalArgs, 1, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseOption () is not supported yet")) ;
    }

    public Object parseOptionChain(Object response, Object... optionalArgs)
    {
        Object currencyKey = Helpers.getArg(optionalArgs, 0, null);
        Object symbolKey = Helpers.getArg(optionalArgs, 1, null);
        Object optionStructures = new java.util.HashMap<String, Object>() {{}};
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object info = Helpers.GetValue(response, i);
            Object currencyId = this.safeString(info, currencyKey);
            Object currency = this.safeCurrency(currencyId);
            Object marketId = this.safeString(info, symbolKey);
            Object market = this.safeMarket(marketId, null, null, "option");
            Helpers.addElementToObject(optionStructures, Helpers.GetValue(market, "symbol"), this.parseOption(info, currency, market));
        }
        return optionStructures;
    }

    public Object parseMarginModes(Object response, Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object symbolKey = Helpers.getArg(optionalArgs, 1, null);
        Object marketType = Helpers.getArg(optionalArgs, 2, null);
        Object marginModeStructures = new java.util.HashMap<String, Object>() {{}};
        if (Helpers.isTrue(Helpers.isEqual(marketType, null)))
        {
            marketType = "swap"; // default to swap
        }
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object info = Helpers.GetValue(response, i);
            Object marketId = this.safeString(info, symbolKey);
            Object market = this.safeMarket(marketId, null, null, marketType);
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(symbols, null))) || Helpers.isTrue(this.inArray(Helpers.GetValue(market, "symbol"), symbols))))
            {
                Helpers.addElementToObject(marginModeStructures, Helpers.GetValue(market, "symbol"), this.parseMarginMode(info, market));
            }
        }
        return marginModeStructures;
    }

    public Object parseMarginMode(Object marginMode, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseMarginMode () is not supported yet")) ;
    }

    public Object parseLeverages(Object response, Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object symbolKey = Helpers.getArg(optionalArgs, 1, null);
        Object marketType = Helpers.getArg(optionalArgs, 2, null);
        Object leverageStructures = new java.util.HashMap<String, Object>() {{}};
        if (Helpers.isTrue(Helpers.isEqual(marketType, null)))
        {
            marketType = "swap"; // default to swap
        }
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object info = Helpers.GetValue(response, i);
            Object marketId = this.safeString(info, symbolKey);
            Object market = this.safeMarket(marketId, null, null, marketType);
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(symbols, null))) || Helpers.isTrue(this.inArray(Helpers.GetValue(market, "symbol"), symbols))))
            {
                Helpers.addElementToObject(leverageStructures, Helpers.GetValue(market, "symbol"), this.parseLeverage(info, market));
            }
        }
        return leverageStructures;
    }

    public Object parseLeverage(Object leverage, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseLeverage () is not supported yet")) ;
    }

    public Object parseConversions(Object conversions, Object... optionalArgs)
    {
        Object code = Helpers.getArg(optionalArgs, 0, null);
        Object fromCurrencyKey = Helpers.getArg(optionalArgs, 1, null);
        Object toCurrencyKey = Helpers.getArg(optionalArgs, 2, null);
        Object since = Helpers.getArg(optionalArgs, 3, null);
        Object limit = Helpers.getArg(optionalArgs, 4, null);
        Object parameters = Helpers.getArg(optionalArgs, 5, new java.util.HashMap<String, Object>() {{}});
        conversions = this.toArray(conversions);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object fromCurrency = null;
        Object toCurrency = null;
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(conversions)); i++)
        {
            Object entry = Helpers.GetValue(conversions, i);
            Object fromId = this.safeString(entry, fromCurrencyKey);
            Object toId = this.safeString(entry, toCurrencyKey);
            if (Helpers.isTrue(!Helpers.isEqual(fromId, null)))
            {
                fromCurrency = this.safeCurrency(fromId);
            }
            if (Helpers.isTrue(!Helpers.isEqual(toId, null)))
            {
                toCurrency = this.safeCurrency(toId);
            }
            Object conversion = this.extend(this.parseConversion(entry, fromCurrency, toCurrency), parameters);
            ((java.util.List<Object>)result).add(conversion);
        }
        Object sorted = this.sortBy(result, "timestamp");
        Object currency = null;
        if (Helpers.isTrue(!Helpers.isEqual(code, null)))
        {
            currency = this.safeCurrency(code);
            code = Helpers.GetValue(currency, "code");
        }
        if (Helpers.isTrue(Helpers.isEqual(code, null)))
        {
            return this.filterBySinceLimit(sorted, since, limit);
        }
        Object fromConversion = this.filterBy(sorted, "fromCurrency", code);
        Object toConversion = this.filterBy(sorted, "toCurrency", code);
        Object both = this.arrayConcat(fromConversion, toConversion);
        return this.filterBySinceLimit(both, since, limit);
    }

    public Object parseConversion(Object conversion, Object... optionalArgs)
    {
        Object fromCurrency = Helpers.getArg(optionalArgs, 0, null);
        Object toCurrency = Helpers.getArg(optionalArgs, 1, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseConversion () is not supported yet")) ;
    }

    public Object convertExpireDate(Object date)
    {
        // parse YYMMDD to datetime string
        Object year = Helpers.slice(date, 0, 2);
        Object month = Helpers.slice(date, 2, 4);
        Object day = Helpers.slice(date, 4, 6);
        Object reconstructedDate = Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add(Helpers.add("20", year), "-"), month), "-"), day), "T00:00:00Z");
        return reconstructedDate;
    }

    public Object convertExpireDateToMarketIdDate(Object date)
    {
        // parse 240119 to 19JAN24
        Object year = Helpers.slice(date, 0, 2);
        Object monthRaw = Helpers.slice(date, 2, 4);
        Object month = null;
        Object day = Helpers.slice(date, 4, 6);
        if (Helpers.isTrue(Helpers.isEqual(monthRaw, "01")))
        {
            month = "JAN";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "02")))
        {
            month = "FEB";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "03")))
        {
            month = "MAR";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "04")))
        {
            month = "APR";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "05")))
        {
            month = "MAY";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "06")))
        {
            month = "JUN";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "07")))
        {
            month = "JUL";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "08")))
        {
            month = "AUG";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "09")))
        {
            month = "SEP";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "10")))
        {
            month = "OCT";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "11")))
        {
            month = "NOV";
        } else if (Helpers.isTrue(Helpers.isEqual(monthRaw, "12")))
        {
            month = "DEC";
        }
        Object reconstructedDate = Helpers.add(Helpers.add(day, month), year);
        return reconstructedDate;
    }

    public Object convertMarketIdExpireDate(Object date)
    {
        // parse 03JAN24 to 240103.
        Object monthMappping = new java.util.HashMap<String, Object>() {{
            put( "JAN", "01" );
            put( "FEB", "02" );
            put( "MAR", "03" );
            put( "APR", "04" );
            put( "MAY", "05" );
            put( "JUN", "06" );
            put( "JUL", "07" );
            put( "AUG", "08" );
            put( "SEP", "09" );
            put( "OCT", "10" );
            put( "NOV", "11" );
            put( "DEC", "12" );
        }};
        // if exchange omits first zero and provides i.e. '3JAN24' instead of '03JAN24'
        if (Helpers.isTrue(Helpers.isEqual(((String)date).length(), 6)))
        {
            date = Helpers.add("0", date);
        }
        Object year = Helpers.slice(date, 0, 2);
        Object monthName = Helpers.slice(date, 2, 5);
        Object month = this.safeString(monthMappping, monthName);
        Object day = Helpers.slice(date, 5, 7);
        Object reconstructedDate = Helpers.add(Helpers.add(day, month), year);
        return reconstructedDate;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionHistory(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name exchange#fetchPositionHistory
            * @description fetches the history of margin added or reduced from contract isolated positions
            * @param {string} [symbol] unified market symbol
            * @param {int} [since] timestamp in ms of the position
            * @param {int} [limit] the maximum amount of candles to fetch, default=1000
            * @param {object} params extra parameters specific to the exchange api endpoint
            * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
            */
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchPositionsHistory")))
            {
                Object positions = (this.fetchPositionsHistory(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), since, limit, parameters)).join();
                return positions;
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchPositionHistory () is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsHistory(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPositionsHistory () is not supported yet")) ;
        });

    }

    public Object parseMarginModification(Object data, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseMarginModification() is not supported yet")) ;
    }

    public Object parseMarginModifications(Object response, Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object symbolKey = Helpers.getArg(optionalArgs, 1, null);
        Object marketType = Helpers.getArg(optionalArgs, 2, null);
        Object marginModifications = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
        {
            Object info = Helpers.GetValue(response, i);
            Object marketId = this.safeString(info, symbolKey);
            Object market = this.safeMarket(marketId, null, null, marketType);
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(symbols, null))) || Helpers.isTrue(this.inArray(Helpers.GetValue(market, "symbol"), symbols))))
            {
                ((java.util.List<Object>)marginModifications).add(this.parseMarginModification(info, market));
            }
        }
        return marginModifications;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchTransfer(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTransfer () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTransfers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object code = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTransfers () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchOHLCV(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchOHLCV () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMarkPrice(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchMarkPrice () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMarkPrices(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchMarkPrices () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> withdrawWs(Object code, Object amount, Object address, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object tag = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " withdrawWs () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchMyTrades(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchMyTrades () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrdersWs(Object orders, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createOrdersWs () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrdersByStatusWs(Object status, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrdersByStatusWs () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchBidsAsks(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchBidsAsks () is not supported yet")) ;
        });

    }

    public void cleanUnsubscription(Client client, Object subHash, Object unsubHash, Object... optionalArgs)
    {
        Object subHashIsPrefix = Helpers.getArg(optionalArgs, 0, false);
        if (Helpers.isTrue(Helpers.inOp(client.subscriptions, unsubHash)))
        {
            ((java.util.Map<String,Object>)client.subscriptions).remove((String)unsubHash);
        }
        if (!Helpers.isTrue(subHashIsPrefix))
        {
            if (Helpers.isTrue(Helpers.inOp(client.subscriptions, subHash)))
            {
                ((java.util.Map<String,Object>)client.subscriptions).remove((String)subHash);
            }
            if (Helpers.isTrue(Helpers.inOp(client.futures, subHash)))
            {
                var error = new UnsubscribeError(Helpers.add(Helpers.add(this.id, " "), subHash));
                client.reject(error, subHash);
            }
        } else
        {
            Object clientSubscriptions = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)client.subscriptions).keySet());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(clientSubscriptions)); i++)
            {
                Object sub = Helpers.GetValue(clientSubscriptions, i);
                if (Helpers.isTrue(((String)sub).startsWith(((String)subHash))))
                {
                    ((java.util.Map<String,Object>)client.subscriptions).remove((String)sub);
                }
            }
            Object clientFutures = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)client.futures).keySet());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(clientFutures)); i++)
            {
                Object future = Helpers.GetValue(clientFutures, i);
                if (Helpers.isTrue(((String)future).startsWith(((String)subHash))))
                {
                    var error = new UnsubscribeError(Helpers.add(Helpers.add(this.id, " "), future));
                    client.reject(error, future);
                }
            }
        }
        client.resolve(true, unsubHash);
    }

    public void cleanCache(Object subscription)
    {
        Object topic = this.safeString(subscription, "topic");
        Object symbols = this.safeList(subscription, "symbols", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object symbolsLength = Helpers.getArrayLength(symbols);
        if (Helpers.isTrue(Helpers.isEqual(topic, "ohlcv")))
        {
            Object symbolsAndTimeframes = this.safeList(subscription, "symbolsAndTimeframes", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(symbolsAndTimeframes)); i++)
            {
                Object symbolAndTimeFrame = Helpers.GetValue(symbolsAndTimeframes, i);
                Object symbol = this.safeString(symbolAndTimeFrame, 0);
                Object timeframe = this.safeString(symbolAndTimeFrame, 1);
                if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.ohlcvs, null))) && Helpers.isTrue((Helpers.inOp(this.ohlcvs, symbol)))))
                {
                    if (Helpers.isTrue(Helpers.inOp(Helpers.GetValue(this.ohlcvs, symbol), timeframe)))
                    {
                        ((java.util.Map<String,Object>)Helpers.GetValue(this.ohlcvs, symbol)).remove((String)timeframe);
                    }
                }
            }
        } else if (Helpers.isTrue(Helpers.isGreaterThan(symbolsLength, 0)))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(symbols)); i++)
            {
                Object symbol = Helpers.GetValue(symbols, i);
                if (Helpers.isTrue(Helpers.isEqual(topic, "trades")))
                {
                    if (Helpers.isTrue(Helpers.inOp(this.trades, symbol)))
                    {
                        ((java.util.Map<String,Object>)this.trades).remove((String)symbol);
                    }
                } else if (Helpers.isTrue(Helpers.isEqual(topic, "orderbook")))
                {
                    if (Helpers.isTrue(Helpers.inOp(this.orderbooks, symbol)))
                    {
                        ((java.util.Map<String,Object>)this.orderbooks).remove((String)symbol);
                    }
                } else if (Helpers.isTrue(Helpers.isEqual(topic, "ticker")))
                {
                    if (Helpers.isTrue(Helpers.inOp(this.tickers, symbol)))
                    {
                        ((java.util.Map<String,Object>)this.tickers).remove((String)symbol);
                    }
                } else if (Helpers.isTrue(Helpers.isEqual(topic, "bidsasks")))
                {
                    if (Helpers.isTrue(Helpers.inOp(this.bidsasks, symbol)))
                    {
                        ((java.util.Map<String,Object>)this.bidsasks).remove((String)symbol);
                    }
                }
            }
        } else
        {
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(topic, "myTrades")) && Helpers.isTrue((!Helpers.isEqual(this.myTrades, null)))))
            {
                this.myTrades = null;
            } else if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(topic, "orders")) && Helpers.isTrue((!Helpers.isEqual(this.orders, null)))))
            {
                this.orders = null;
            } else if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(topic, "positions")) && Helpers.isTrue((!Helpers.isEqual(this.positions, null)))))
            {
                this.positions = null;
                Object clients = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)this.clients).values());
                for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(clients)); i++)
                {
                    Client client = (Client)Helpers.GetValue(clients, i);
                    Object futures = client.futures;
                    if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(futures, null))) && Helpers.isTrue((Helpers.inOp(futures, "fetchPositionsSnapshot")))))
                    {
                        ((java.util.Map<String,Object>)futures).remove((String)"fetchPositionsSnapshot");
                    }
                }
            } else if (Helpers.isTrue(Helpers.isTrue((Helpers.isTrue(Helpers.isEqual(topic, "ticker")) || Helpers.isTrue(Helpers.isEqual(topic, "markPrice")))) && Helpers.isTrue((!Helpers.isEqual(this.tickers, null)))))
            {
                Object tickerSymbols = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)this.tickers).keySet());
                for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(tickerSymbols)); i++)
                {
                    Object tickerSymbol = Helpers.GetValue(tickerSymbols, i);
                    if (Helpers.isTrue(Helpers.inOp(this.tickers, tickerSymbol)))
                    {
                        ((java.util.Map<String,Object>)this.tickers).remove((String)tickerSymbol);
                    }
                }
            } else if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(topic, "bidsasks")) && Helpers.isTrue((!Helpers.isEqual(this.bidsasks, null)))))
            {
                Object bidsaskSymbols = new java.util.ArrayList<Object>(((java.util.Map<String, Object>)this.bidsasks).keySet());
                for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(bidsaskSymbols)); i++)
                {
                    Object bidsaskSymbol = Helpers.GetValue(bidsaskSymbols, i);
                    if (Helpers.isTrue(Helpers.inOp(this.bidsasks, bidsaskSymbol)))
                    {
                        ((java.util.Map<String,Object>)this.bidsasks).remove((String)bidsaskSymbol);
                    }
                }
            }
        }
    }
}
