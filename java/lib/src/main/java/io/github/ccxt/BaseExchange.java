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
import java.util.concurrent.ConcurrentLinkedQueue;
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
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

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


public class BaseExchange {

    // Virtual thread executor for non-blocking async operations.
    // Virtual threads park at zero cost on .join(), enabling hundreds of concurrent
    // requests without exhausting platform threads.
    public static final java.util.concurrent.ExecutorService VIRTUAL_EXECUTOR =
            java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor();

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
    public boolean verbose = false;
    public boolean validateServerSsl = true;
    public boolean enableRateLimit = true;
    public volatile long lastRestRequestTimestamp = 0L;
    public String url = "";
    public String hostname = "";
    public List<Object> countries = new ArrayList<>();
    public String name = "";
    public boolean pro = false;
    public boolean certified = false;

    // Currencies/markets API structures
    public Map<String, Object> baseCurrencies = new HashMap<>();
    public volatile boolean reloadingMarkets = false;
    public volatile CompletableFuture<Object> marketsLoading = null;
    public volatile boolean marketsLoaded = false;

    public Map<String, Object> quoteCurrencies = new HashMap<>();
    public Map<String, Object> api = new HashMap<>();
    public Map<String, Object> transformedApi = new HashMap<>();

    public boolean reduceFees = true;

    public volatile Map<String, Object> markets_by_id = null;

    public volatile List<Object> symbols = new ArrayList<>();
    public volatile List<Object> codes = new ArrayList<>();
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public volatile List ids = new ArrayList<>();

    public boolean substituteCommonCurrencyCodes = true;

    public Map<String, Object> commonCurrencies = new HashMap<>();

    public Object limits = new HashMap<String, Object>();
    public Object precisionMode = DECIMAL_PLACES;
    public volatile Object currencies_by_id = new HashMap<String, Object>();

    public Object accounts = new HashMap<String, Object>();
    public Object accountsById = new HashMap<String, Object>();
    public Object status = new HashMap<String, Object>();

    public long paddingMode = NO_PADDING;

    public Object number = Float.class;                   // C# typeof(float) → Java Class<?> for Float
    public Map<String, Object> has = new HashMap<>();
    public Map<String, Object> features = new HashMap<>();
    // ConcurrentHashMap so concurrent watchTrades / loadMarkets calls don't
    // race on put/get/remove/iterate. Null values are not allowed by CHM,
    // but the few exchange-side `options.put("listenKey", null)` sites are
    // semantically equivalent to "delete the key" — Helpers.addElementToObject
    // routes null puts to remove() to preserve that semantics (see
    // SharedStateRaceTest for the concurrent regression that motivated this).
    public Map<String, Object> options = new java.util.concurrent.ConcurrentHashMap<>();
    public boolean isSandboxModeEnabled = false;

    public volatile Object markets = null;
    public volatile Object currencies = new HashMap<String, Object>();
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

    // Last responses — volatile for visibility across async callbacks (last-writer-wins)
    public volatile Object last_response_headers;
    public volatile Object last_request_headers;
    public volatile Object last_json_response;
    public volatile Object last_http_response;
    public volatile Object last_request_body;
    public volatile Object last_request_url;
    public final ConcurrentLinkedQueue<Map<String, Object>> fetchHistoryCache = new ConcurrentLinkedQueue<>();
    public int fetchHistoryCacheSize = 0;

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
        this.initializeProperties(defaultConfig);
        this.initHttpClient();
        this.httpClientProxyFingerprint = currentProxyFingerprint();
        this.afterConstruct();
        this.transformApiNew(this.api, new ArrayList<>());
    }

    // add to derived files constructor that calls base constructor with userConfig
    public BaseExchange (Object userConfig) {
        this.initExchange(userConfig);
    }

    public BaseExchange() {
        this.initExchange(null);
    }

    public void initializeProperties(Map<String, Object> userConfig) {

        var properties = this.describe();
        Map<String, Object> extendedProperties = this.deepExtend(properties, userConfig);

        this.version = SafeMethods.SafeStringTyped(extendedProperties, "version", "");

        // credentials init
        this.requiredCredentials = (Map<String, Object>) SafeMethods.SafeValue(extendedProperties, "requiredCredentials");
        this.apiKey        = SafeMethods.SafeStringTyped(extendedProperties, "apiKey", null);
        this.secret        = SafeMethods.SafeStringTyped(extendedProperties, "secret", null   );
        this.password      = SafeMethods.SafeStringTyped(extendedProperties, "password", null);
        this.login         = SafeMethods.SafeStringTyped(extendedProperties, "login", null );
        this.twofa         = SafeMethods.SafeStringTyped(extendedProperties, "twofa", null );
        this.privateKey    = SafeMethods.SafeStringTyped(extendedProperties, "privateKey", null );
        this.walletAddress = SafeMethods.SafeStringTyped(extendedProperties, "walletAddress", null );
        this.token         = SafeMethods.SafeStringTyped(extendedProperties, "token", null );
        this.uid           = SafeMethods.SafeStringTyped(extendedProperties, "uid", null);
        this.accountId     = SafeMethods.SafeStringTyped(extendedProperties, "accountId", null );

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

        // handle options — keep this.options as a ConcurrentHashMap so concurrent
        // watchTrades / loadMarkets calls don't race (see Exchange.options field
        // comment + SharedStateRaceTest).
        var extendedOptions = this.safeDict(extendedProperties, "options");
        Map<String, Object> initialOptions;
        if (extendedOptions != null) {
            extendedOptions = this.deepExtend(this.getDefaultOptions(), extendedOptions);
            initialOptions = (Map<String, Object>) extendedOptions;
        } else {
            initialOptions = (Map<String, Object>) this.getDefaultOptions();
        }
        java.util.concurrent.ConcurrentHashMap<String, Object> opts = new java.util.concurrent.ConcurrentHashMap<>();
        for (Map.Entry<String, Object> e : initialOptions.entrySet()) {
            // CHM doesn't accept null values; skip entries that were explicitly
            // initialized to null (semantically equivalent to "not set").
            if (e.getKey() != null && e.getValue() != null) {
                opts.put(e.getKey(), e.getValue());
            }
        }
        this.options = opts;

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

        // TS default for newUpdates is `true` (Exchange.ts:414, and the
        // constructor's `... !== undefined ? ... : true` ternary). Passing
        // `false` as the safeValue fallback made Java effectively default
        // to false — `if (this.newUpdates) return filterByArrayTickers(...)`
        // never fired, so watchTickers returned the unfiltered live map
        // and tests received "any" ticker instead of the requested symbol.
        Boolean newUpdatesTmp = (Boolean) SafeMethods.SafeValue(extendedProperties, "newUpdates", true);
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


    public static BaseExchange dynamicallyCreateInstance(String className, Object args) {
        return dynamicallyCreateInstance(className, args, false);
    }

    public static BaseExchange dynamicallyCreateInstance(String className, Object args, Boolean isWs) {
        return dynamicallyCreateInstance(className, args, isWs != null && isWs.booleanValue());
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

    public void addFetchCache(Object data) {
        if (fetchHistoryCacheSize <= 0) {
            return;
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> mapData = (Map<String, Object>) data;
        
        fetchHistoryCache.offer(mapData);
        
        while (fetchHistoryCache.size() > fetchHistoryCacheSize) {
            fetchHistoryCache.poll(); // drops oldest
        }
    }

    public List<Map<String, Object>> getFetchCache() {
        return new ArrayList<>(fetchHistoryCache);
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

    public String rsa(Object payload, Object publicKey, Object algo, Object padding) {
        return Crypto.Rsa(payload, publicKey, algo, padding);
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

    private static int[] crc32Table = null;

    public Object crc32(Object str, Object signed) {
        if (crc32Table == null) {
            String tableStr = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
            String[] parts = tableStr.split(" ");
            crc32Table = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                crc32Table[i] = (int) Long.parseLong(parts[i], 16);
            }
        }
        String s = (String) str;
        int crc = -1;
        for (int i = 0; i < s.length(); i++) {
            crc = (crc >>> 8) ^ crc32Table[(crc ^ s.charAt(i)) & 0xFF];
        }
        long unsigned = ((long)(crc ^ (-1))) & 0xFFFFFFFFL;
        boolean isSigned = Helpers.isTrue(signed);
        if (isSigned && unsigned >= 0x80000000L) {
            return unsigned - 0x100000000L;
        }
        return unsigned;
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

    public static String binaryToBase64(Object buff) {
        return Encode.binaryToBase64((byte[]) buff);
    }

    public static byte[] base58ToBinary(Object pt) {
        return Encode.Base58ToBinary(pt);
    }

    public void Print(Object s) {
        System.out.println(s);
    }

    public Object encode (Object s) {
        // encode() turns a string into its UTF-8 byte representation (matches the JS Uint8Array
        // contract). hash()/hmac() accept either bytes or a string, but binaryToBase16() and the
        // EIP-712 encoders require real bytes, so returning the string unchanged was wrong.
        if (s instanceof byte[]) {
            return s;
        }
        return s.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
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

    public Object exceptionMessage(Object exc, Object... optionalArgs) {
        boolean includeStack = optionalArgs.length > 0 && optionalArgs[0] != null ? (boolean) optionalArgs[0] : true;
        if (exc instanceof Throwable t) {
            // Walk the cause chain and include each level's class+message. Without
            // this, reflection-driven failures show as bare "InvocationTargetException"
            // and the real exchange/parser error is hidden one or two `getCause()` levels
            // deep — which made bitmex, deribit, etc. unfixable from logs alone.
            StringBuilder sb = new StringBuilder();
            Throwable cur = t;
            int depth = 0;
            while (cur != null && depth < 5) {
                if (depth > 0) sb.append(" → caused by: ");
                sb.append("[").append(cur.getClass().getSimpleName()).append("] ");
                sb.append(includeStack ? cur.toString() : cur.getMessage());
                cur = cur.getCause();
                depth++;
            }
            String message = sb.toString();
            int length = Math.min(100000, message.length());
            return message.substring(0, length);
        }
        return String.valueOf(exc);
    }

    public Object ethGetAddressFromPrivateKey(Object privateKey) {
        try {
            String cleanKey = (String) this.remove0xPrefix(privateKey);
            java.math.BigInteger privKeyBigInt = new java.math.BigInteger(cleanKey, 16);
            java.math.BigInteger publicKey = org.web3j.crypto.Sign.publicKeyFromPrivate(privKeyBigInt);
            return "0x" + org.web3j.crypto.Keys.getAddress(publicKey);
        } catch (Exception e) {
            throw new RuntimeException("ethGetAddressFromPrivateKey failed: " + e.getMessage(), e);
        }
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

    public Object extend(Object... objs) {
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
        long ms;
        if (milliseconds instanceof Integer) {
            ms = ((Integer) milliseconds).longValue();
        } else if (milliseconds instanceof Long) {
            ms = (Long) milliseconds;
        } else if (milliseconds instanceof String) {
            ms = Long.valueOf((String) milliseconds);
        } else if (milliseconds instanceof Double) {
            ms = ((Double) milliseconds).longValue();
        } else {
            throw new IllegalArgumentException("milliseconds must be Integer, Long, Double, or String");
        }
        return CompletableFuture.supplyAsync(() -> null,
                CompletableFuture.delayedExecutor(ms, java.util.concurrent.TimeUnit.MILLISECONDS));
    }

    public HashMap<String, Object> createSafeDictionary() {
        return new HashMap<>();
    }

    public ConcurrentHashMap<String, Object> createSafeDictionary(boolean isWs) {
        return new ConcurrentHashMap<>();
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

        // ArrayCache mutates from the WS thread. subList captures modCount
        // non-atomically — under JMM that read can be stale, so the wrapping
        // `new ArrayList<>(view)` silently null-pads or skips CME. Materialize
        // a stable copy under the cache monitor first.
        if (array instanceof io.github.ccxt.ws.ArrayCache cache) {
            array = cache.snapshot();
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

        if (!reload && this.markets != null) {
            if (this.markets_by_id == null) {
                return java.util.concurrent.CompletableFuture.completedFuture(this.setMarkets(this.markets));
            }
            return java.util.concurrent.CompletableFuture.completedFuture(this.markets);
        }

        // Chain: fetchCurrencies (if supported) → fetchMarkets → setMarkets
        // No thread blocked at any point
        // The base describe() sets has['fetchCurrencies'] to "emulated" (a String) for
        // exchanges that don't override it (e.g., bit2c, bitbns, coincheck). A direct
        // (Boolean) cast on that String throws ClassCastException. Mirror the TS form
        // `this.has['fetchCurrencies'] === true`: only treat as true when the value is
        // an actual Boolean true.
        Object fetchCurrenciesFlag = (this.has != null) ? this.has.get("fetchCurrencies") : null;
        boolean hasFetchCurrencies = (fetchCurrenciesFlag instanceof Boolean) && (Boolean) fetchCurrenciesFlag;

        java.util.concurrent.CompletableFuture<Object> currenciesFuture;
        if (hasFetchCurrencies) {
            currenciesFuture = this.fetchCurrencies();
        } else {
            currenciesFuture = java.util.concurrent.CompletableFuture.completedFuture(null);
        }

        return currenciesFuture.thenCompose(currencies -> {
            if (currencies != null) {
                this.options.put("cachedCurrencies", currencies);
            }
            return this.fetchMarkets().thenApply(markets -> {
                this.options.remove("cachedCurrencies");
                // Pass currencies through so setMarkets() can merge fetched currencies
                // (including ones not appearing as a base/quote/settle in any market —
                // e.g. AGLD/WBTC for bigone/apex, USDC for aftermath). The previous
                // form dropped this argument, forcing setMarkets to reconstruct the
                // currencies dict from market base/quote only and silently lose entries.
                return this.setMarkets(markets, currencies);
            });
        });

    }

    private final Object marketsLock = new Object();

    public java.util.concurrent.CompletableFuture<Object> loadMarkets(Object... args) {

        var reload = (Boolean) Helpers.getArg(args, 0, false);
        if (this.marketsLoaded && !reload) {
            return this.marketsLoading;
        }
        synchronized (marketsLock) {
            // Re-check under the lock to collapse concurrent first-callers onto the same future.
            if (this.marketsLoaded && !reload) {
                return this.marketsLoading;
            }
            // Collapse concurrent callers onto the same in-flight reload regardless
            // of the reload flag. The previous `|| reload` short-circuit caused 20
            // concurrent loadMarkets(true) callers to spawn 20 sequential fetches.
            // The cache-vs-fetch decision still respects `reload` via the early
            // `marketsLoaded && !reload` guard above; this branch only decides
            // whether to start a *new* fetch when none is in-flight.
            if (!this.reloadingMarkets) {
                this.reloadingMarkets = true;
                try {
                    this.marketsLoading = this.loadMarketsHelper(reload)
                            .thenApply(res -> {
                                synchronized (marketsLock) {
                                    this.reloadingMarkets = false;
                                    this.marketsLoaded = true;
                                }
                                return res;
                            })
                            .exceptionallyCompose(ex -> {
                                synchronized (marketsLock) {
                                    this.reloadingMarkets = false;
                                    this.marketsLoading = null;
                                }
                                return CompletableFuture.failedFuture(ex);
                            });
                } catch (ExecutionException | InterruptedException e) {
                    this.reloadingMarkets = false;
                    throw new RuntimeException(e);
                }
            }
            return this.marketsLoading;
        }
    }

    public CompletableFuture<Object> fetchCurrencies(Object... params) {
        return CompletableFuture.completedFuture(this.currencies);
    }

    public CompletableFuture<Object> fetchMarkets(Object... params) {
        return CompletableFuture.completedFuture(new ArrayList<>(((Map<String, Object>)this.markets).values()));
    }

    public Throttler throttler = null;

    public void initThrottler() {
        this.throttler = new Throttler(this.tokenBucket);
    }

    public java.util.concurrent.CompletableFuture<Void> throttle(Object... args) {
        if (this.throttler == null) {
            return CompletableFuture.completedFuture(null);
        }
        double cost = 1.0;
        if (args.length > 0 && args[0] != null) {
            if (args[0] instanceof Number n) {
                cost = n.doubleValue();
            }
        }
        return this.throttler.throttle(cost);
    }

    public Object clone(Object s) {
        return s; // check later
    }

    /**
     * Dynamically create an exception by class reference.
     * Used by WS exchanges: new getValue(exceptions, key)(message) → newException(class, message)
     */
    public RuntimeException newException(Object exceptionClass, Object message) {
        if (exceptionClass instanceof Class<?> clazz) {
            try {
                return (RuntimeException) clazz.getConstructor(String.class).newInstance(String.valueOf(message));
            } catch (Exception e) {
                // fallback
            }
        }
        if (exceptionClass instanceof String className) {
            try {
                Class<?> clazz = Class.forName("io.github.ccxt.errors." + className);
                return (RuntimeException) clazz.getConstructor(String.class).newInstance(String.valueOf(message));
            } catch (Exception e) {
                // fallback
            }
        }
        return new RuntimeException(String.valueOf(message));
    }

    // ─── WebSocket Bridge (matches C# Exchange.WsBridge.cs) ───

    @SuppressWarnings("unchecked")
    public Client client(Object url2) {
        String url = url2.toString();
        return ((java.util.concurrent.ConcurrentHashMap<String, Client>) this.clients)
                .computeIfAbsent(url, u -> {
                    Object ws = this.safeValue(this.options, "ws", new java.util.HashMap<String, Object>());
                    Object wsOptions = this.safeValue(ws, "options", new java.util.HashMap<String, Object>());
                    long keepAlive = 30000;
                    Object keepAliveObj = this.safeValue(wsOptions, "keepAlive", null);
                    if (keepAliveObj instanceof Number n) keepAlive = n.longValue();
                    boolean decompressBin = true;
                    Object decompressObj = this.safeValue(this.options, "decompressBinary", null);
                    if (decompressObj instanceof Boolean b) decompressBin = b;

                    var result = this.checkWsProxySettings();
                    String proxy = null;
                    if (result instanceof java.util.List<?> proxies) {
                        for (Object p : proxies) {
                            if (p != null) { proxy = p.toString(); break; }
                        }
                    }

                    Client created = new Client(u, proxy,
                            (client, msg) -> this.handleMessage((Client) client, msg),
                            (client) -> this.ping((Client) client),
                            (client, err) -> this.onClose((Client) client, err),
                            (client, err) -> this.onError((Client) client, err),
                            this.verbose, keepAlive, decompressBin,
                            this.validateServerSsl);

                    // Forward options.ws.options.headers to the upgrade request — required
                    // by exchanges that gate on User-Agent (weex) or send custom headers.
                    Object headers = this.safeValue(wsOptions, "headers", null);
                    if (headers instanceof java.util.Map<?, ?> m) {
                        java.util.Map<String, String> hh = new java.util.HashMap<>();
                        for (java.util.Map.Entry<?, ?> e : m.entrySet()) {
                            if (e.getKey() == null || e.getValue() == null) continue;
                            hh.put(e.getKey().toString(), e.getValue().toString());
                        }
                        if (!hh.isEmpty()) {
                            created.handshakeHeaders = hh;
                        }
                    }

                    return created;
                });
    }

    public CompletableFuture<Object> watch(Object url, Object messageHash2, Object message, Object subscribeHash2, Object subscription) {
        String messageHash = messageHash2.toString();
        String subscribeHash = subscribeHash2 != null ? subscribeHash2.toString() : messageHash;
        var client = this.client(url);

        io.github.ccxt.ws.Future future = client.future(messageHash);

        if (client.subscriptionsMap().putIfAbsent(subscribeHash, subscription != null ? subscription : true) == null) {
            client.connect(0).thenAccept(connected -> {
                if (message != null) {
                    try {
                        client.send(message);
                    } catch (Exception ex) {
                        client.subscriptionsMap().remove(subscribeHash);
                        future.reject(ex);
                    }
                }
            }).exceptionally(ex -> {
                client.subscriptionsMap().remove(subscribeHash);
                future.reject(ex);
                return null;
            });
        }
        return future.getFuture();
    }

    // Note: a single subscribe message is sent for all symbols, matching JS/C# design.
    // Exchange-specific code is responsible for building the message with all symbols.
    @SuppressWarnings("unchecked")
    public CompletableFuture<Object> watchMultiple(Object url, Object messageHashes2, Object message, Object subscribeHashes2, Object subscription) {
        var client = this.client(url);

        List<Object> messageHashes = (List<Object>) messageHashes2;
        io.github.ccxt.ws.Future[] futures = new io.github.ccxt.ws.Future[messageHashes.size()];
        for (int i = 0; i < messageHashes.size(); i++) {
            futures[i] = client.future(messageHashes.get(i).toString());
        }
        var raceFuture = io.github.ccxt.ws.Future.race(futures);

        List<String> missingSubscriptions = new java.util.ArrayList<>();
        if (subscribeHashes2 instanceof List<?> subscribeHashes) {
            for (Object sh : subscribeHashes) {
                if (sh == null) continue;
                String subHash = sh.toString();
                if (client.subscriptionsMap().putIfAbsent(subHash, subscription != null ? subscription : true) == null) {
                    missingSubscriptions.add(subHash);
                }
            }
        }

        if (subscribeHashes2 == null || !missingSubscriptions.isEmpty()) {
            client.connect(0).thenAccept(connected -> {
                if (message != null) {
                    try {
                        client.send(message);
                    } catch (Exception ex) {
                        for (String subHash : missingSubscriptions) {
                            client.subscriptionsMap().remove(subHash);
                        }
                        raceFuture.reject(ex);
                    }
                }
            }).exceptionally(ex -> {
                for (String subHash : missingSubscriptions) {
                    client.subscriptionsMap().remove(subHash);
                }
                raceFuture.reject(ex);
                return null;
            });
        }

        return raceFuture.getFuture();
    }

    public void handleMessage(Client client, Object message) {
        // Base implementation — overridden by pro exchange classes
    }

    public Object ping(Client client) {
        // Base implementation — overridden by exchanges with custom ping
        return null;
    }

    public void onClose(Client client, Object error) {
        if (!client.error) {
            this.cleanupWsClient(client, error);
        }
    }

    public void onError(Client client, Object error) {
        this.cleanupWsClient(client, error);
    }

    @SuppressWarnings("unchecked")
    private void cleanupWsClient(Client client, Object error) {
        var clientsMap = (java.util.concurrent.ConcurrentHashMap<String, Client>) this.clients;
        var urlClient = clientsMap.get(client.url);
        if (urlClient != null) {
            urlClient.subscriptionsMap().clear();
            urlClient.reject(wrapAsNetworkError(error));
            clientsMap.remove(client.url);
            // NOTE: do NOT call urlClient.close() here. Empirical test (full
            // Java WS sweep) showed close()'s messageExecutor.shutdown() races
            // with in-flight handleMessage tasks the per-exchange tests still
            // need, causing 15 new exchanges to time out vs the baseline.
            // The leak the close() was meant to fix is slow-drip (virtual
            // threads ~1KB each); we'll address it via a different mechanism
            // (e.g. shutdown-on-Exchange.close() only, or a delayed shutdown).
        }
    }

    /**
     * Wrap raw Netty / I/O exceptions in a CCXT NetworkError so the test harness's
     * isTemporaryFailure() check (instanceof OperationFailed) treats them as
     * transient — matches Python's WS client behaviour, which raises
     * `NetworkError(str(exception))` from connection failures (handshake 4xx,
     * SSL errors, timeouts, socket resets). Without this, a transient endpoint
     * blip (e.g. aftermath returning 404 on /stream/orderbook) propagates as a
     * `WebSocketClientHandshakeException` — which isn't an OperationFailed — and
     * the test treats it as a fatal assertion failure instead of looping.
     * Already-CCXT errors (BaseError descendants) and plain strings pass through.
     */
    private Object wrapAsNetworkError(Object error) {
        if (error instanceof io.github.ccxt.errors.BaseError) {
            return error;
        }
        if (error instanceof Throwable t) {
            String pkg = t.getClass().getName();
            boolean isNetwork =
                pkg.startsWith("io.netty.")
                || t instanceof java.net.SocketException
                || t instanceof java.net.UnknownHostException
                || t instanceof java.io.IOException
                || t instanceof java.util.concurrent.TimeoutException
                || t instanceof javax.net.ssl.SSLException;
            if (isNetwork) {
                String msg = t.getMessage() != null ? t.getMessage() : t.getClass().getSimpleName();
                io.github.ccxt.errors.NetworkError wrapped =
                        new io.github.ccxt.errors.NetworkError(msg);
                wrapped.initCause(t);
                return wrapped;
            }
        }
        return error;
    }

    /**
     * Fire-and-forget async task (matches JS spawn() / C# Task.Run()).
     * Used for fetching order book snapshots while WS loop continues.
     */
    public void spawn(Runnable task) {
        VIRTUAL_EXECUTOR.execute(task);
    }

    /**
     * Schedule a method-name callback on the virtual executor after a delay.
     * Used by WS transpile output to replace TS `this.delay(ms, "name", ...args)`.
     * Method params are effectively final so this avoids lambda-capture errors
     * an inline spawn rewrite would hit with reassignable locals.
     */
    public void scheduleCallback(Object delayMs, String methodName, Object... args) {
        this.spawn(() -> {
            try {
                Thread.sleep(((Number) delayMs).longValue());
                Helpers.callDynamically(this, methodName, args);
            } catch (Exception ignored) {
            }
        });
    }

    /**
     * Start an async method-name call on the virtual executor and return a
     * Future that resolves with the result (or is rejected on failure). Used
     * by WS transpile output to replace TS `this.spawn(this.method, ...args)`
     * when the return value is captured (e.g., stored in a cache). Mirrors
     * how the TS Promise returned by `this.spawn(...)` is consumed.
     */
    public io.github.ccxt.ws.Future spawnWithResult(String methodName, Object... args) {
        io.github.ccxt.ws.Future fut = new io.github.ccxt.ws.Future();
        this.spawn(() -> {
            try {
                Object result = Helpers.callDynamically(this, methodName, args);
                // callDynamically may return a CompletableFuture — unwrap
                if (result instanceof java.util.concurrent.CompletableFuture<?> cf) {
                    result = cf.join();
                }
                fut.resolve(result);
            } catch (Exception e) {
                fut.reject(e);
            }
        });
        return fut;
    }

    // NOTE: loadOrderBook (hand-written, void, WS-snapshot friendly) lives in Exchange.java
    // together with fetchRestOrderBookSafe, since both belong to the Exchange trading tier
    // (BaseExchange no longer declares fetchRestOrderBookSafe/fetchOrderBook that it depends on).

    /** Hand-written (not transpiled): lastRestRequestTimestamp is a volatile long,
     *  so a plain assignment is already safe against concurrent requests. */
    public void setLastRestRequestTimestamp() {
        this.lastRestRequestTimestamp = this.milliseconds();
    }

    /** Hand-written (not transpiled): the last_request_* fields are volatile,
     *  so plain assignments are already safe against concurrent requests. */
    public void setLastRequest(Object request) {
        this.last_request_headers = Helpers.GetValue(request, "headers");
        this.last_request_body = Helpers.GetValue(request, "body");
        this.last_request_url = Helpers.GetValue(request, "url");
    }

    /** Check if a message is binary (byte array). */
    public boolean isBinaryMessage(Object message) {
        return message instanceof byte[];
    }

    /** Decode a protobuf message. Override in exchange-specific classes if needed. */
    public Object decodeProtoMsg(Object data) {
        throw new RuntimeException(this.id + " decodeProtoMsg is not supported in Java yet");
    }

    // OrderBook factory methods — varargs for flexible calling from transpiled code
    public io.github.ccxt.ws.WsOrderBook orderBook(Object... args) {
        Object snapshot = args.length > 0 ? args[0] : null;
        Object depth = args.length > 1 ? args[1] : null;
        return new io.github.ccxt.ws.WsOrderBook(snapshot, depth);
    }

    public io.github.ccxt.ws.WsOrderBook.IndexedOrderBook indexedOrderBook(Object... args) {
        Object snapshot = args.length > 0 ? args[0] : null;
        Object depth = args.length > 1 ? args[1] : null;
        return new io.github.ccxt.ws.WsOrderBook.IndexedOrderBook(snapshot, depth);
    }

    public io.github.ccxt.ws.WsOrderBook.CountedOrderBook countedOrderBook(Object... args) {
        Object snapshot = args.length > 0 ? args[0] : null;
        Object depth = args.length > 1 ? args[1] : null;
        return new io.github.ccxt.ws.WsOrderBook.CountedOrderBook(snapshot, depth);
    }

    private String httpClientProxyFingerprint = "__init__";

    private String currentProxyFingerprint() {
        String h = (this.httpProxy == null) ? "" : this.httpProxy.toString();
        String hs = (this.httpsProxy == null) ? "" : this.httpsProxy.toString();
        String s = (this.socksProxy == null) ? "" : this.socksProxy.toString();
        return h + "|" + hs + "|" + s;
    }

    private void ensureHttpClientUpToDate() {
        // Tests (and library users) set httpProxy/httpsProxy/socksProxy AFTER
        // exchange construction. The builder we configured in initHttpClient
        // captured proxy state at construct time, so a later change had no
        // effect — bullish, paradex, and other proxy-required exchanges then
        // hit upstream APIs directly and got 403/geo-blocked. Rebuild the
        // HttpClient if the proxy fingerprint has changed since last build.
        String fp = currentProxyFingerprint();
        if (!fp.equals(this.httpClientProxyFingerprint)) {
            initHttpClient();
            this.httpClientProxyFingerprint = fp;
        }
    }

    private void initHttpClient() {
        var builder = HttpClient.newBuilder();
        // Java's HttpClient defaults to Redirect.NEVER, but TS/Node fetch and
        // browsers transparently follow 3xx. Without this, requests against
        // endpoints that redirect (e.g. gemini's exchange.gemini.com → 303 to
        // a signed-in URL) come back with an empty body, leaving downstream
        // parsers (fetchCurrenciesFromWeb populating options['tradingPairs'])
        // empty-handed and silently degrading market metadata.
        builder.followRedirects(HttpClient.Redirect.NORMAL);

        boolean httpsProxySet = this.httpsProxy != null && !this.httpsProxy.toString().isEmpty();
        boolean httpProxySet = this.httpProxy != null && !this.httpProxy.toString().isEmpty();
        boolean socksProxySet = this.socksProxy != null && !this.socksProxy.toString().isEmpty();

        if (!httpsProxySet && !httpProxySet && !socksProxySet) {
            this.httpClient = builder.build();
            return;
        }

        if (socksProxySet) {
            // SOCKS proxy requires a custom ProxySelector with Proxy.Type.SOCKS
            String proxyString = this.socksProxy.toString();
            java.net.URI proxyUri = java.net.URI.create(proxyString);
            String host = proxyUri.getHost();
            int port = (proxyUri.getPort() != -1) ? proxyUri.getPort() : 1080;
            java.net.InetSocketAddress socksAddr = new java.net.InetSocketAddress(host, port);
            builder.proxy(new java.net.ProxySelector() {
                @Override
                public java.util.List<java.net.Proxy> select(java.net.URI uri) {
                    return java.util.List.of(new java.net.Proxy(java.net.Proxy.Type.SOCKS, socksAddr));
                }
                @Override
                public void connectFailed(java.net.URI uri, java.net.SocketAddress sa, java.io.IOException ioe) {}
            });
        } else {
            // HTTP/HTTPS proxy
            Object proxyUrl = httpsProxySet ? this.httpsProxy : this.httpProxy;
            String proxyString = proxyUrl.toString();
            java.net.URI proxyUri = java.net.URI.create(proxyString);
            String host = proxyUri.getHost();
            int port = (proxyUri.getPort() != -1) ? proxyUri.getPort() : 80;
            builder.proxy(java.net.ProxySelector.of(new java.net.InetSocketAddress(host, port)));
        }

        this.httpClient = builder.build();
    }

    public CompletableFuture<Object> fetch(Object url2, Object method2, Object headers2, Object body2) {
        if (this.fetchResponse != null) {
            return CompletableFuture.completedFuture(this.fetchResponse);
        }
        ensureHttpClientUpToDate();

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
        // Java's URI.create is strict (RFC 3986) and rejects characters like
        // ", |, {, }, ^, `, <, > in the query, even though Node fetch / axios
        // accept them. Some exchanges (e.g. coinsph parseArrayParam) emit
        // partially-encoded queries — `?symbols=%5B"BTCUSDT"%5D` — that round-
        // trip through TS but throw URISyntaxException here. Percent-encode
        // any remaining illegal chars before parsing.
        requestBuilder.uri(URI.create(escapeIllegalUriChars(url)));

        // Apply HTTP timeout
        if (this.timeout != null) {
            long timeoutMs;
            if (this.timeout instanceof Number) {
                timeoutMs = ((Number) this.timeout).longValue();
            } else {
                timeoutMs = Long.parseLong(this.timeout.toString());
            }
            if (timeoutMs > 0) {
                requestBuilder.timeout(java.time.Duration.ofMillis(timeoutMs));
            }
        }

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

        // Build the HTTP request synchronously (no need to defer to a thread)
        if ("GET".equalsIgnoreCase(method)) {
            requestBuilder.GET();
        } else {
            String requestBody = (body != null) ? body : "";
            HttpRequest.BodyPublisher publisher = HttpRequest.BodyPublishers.ofString(requestBody, java.nio.charset.StandardCharsets.UTF_8);
            // only send Content-Type when the exchange set one, or there is an actual body.
            // forcing application/json on a body-less request (e.g. limitless DELETE
            // /orders/{id}) makes some APIs reject with "Body cannot be empty when
            // content-type is set to 'application/json'" — matches the other langs' HTTP clients
            if (!contentType.isEmpty()) {
                requestBuilder.header("Content-Type", contentType);
            } else if (!requestBody.isEmpty()) {
                requestBuilder.header("Content-Type", "application/json");
            }
            if ("POST".equalsIgnoreCase(method)) {
                requestBuilder.POST(publisher);
            } else if ("PUT".equalsIgnoreCase(method)) {
                requestBuilder.PUT(publisher);
            } else if ("DELETE".equalsIgnoreCase(method)) {
                requestBuilder.method("DELETE", publisher);
            } else if ("PATCH".equalsIgnoreCase(method)) {
                requestBuilder.method("PATCH", publisher);
            } else {
                requestBuilder.method(method, publisher);
            }
        }

        HttpRequest request = requestBuilder.build();

        final String finalMethod = method;
        final String finalUrl = url;
        final Map<String, Object> finalHeaders = headers;

        // Use sendAsync for non-blocking I/O — no thread is blocked during network I/O
        return this.httpClient.sendAsync(request, java.net.http.HttpResponse.BodyHandlers.ofByteArray())
                .thenApply(response -> processResponse(response, finalUrl, finalMethod, finalHeaders, body))
                .exceptionally(e -> {
                    throw mapNetworkException(e, finalMethod, finalUrl);
                });
    }

    private Object processResponse(HttpResponse<byte[]> response, String url, String method, Map<String, Object> requestHeaders, String body) {
        String result;
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
            try (java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(bodyBytes);
                 java.util.zip.GZIPInputStream gis = new java.util.zip.GZIPInputStream(bais)) {
                result = new String(gis.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            } catch (Exception inner) {
                throw new RuntimeException(inner);
            }
        } else {
            result = new String(bodyBytes, java.nio.charset.StandardCharsets.UTF_8);
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
            this.last_request_headers = requestHeaders;
            httpStatusCode = response.statusCode();
            httpStatusText = null;
        } catch (Exception ignored) {
        }

        if (this.verbose) {
            this.log(
                    "handleRestResponse:\n"
                    + this.id + " " + method + " " + url + " " + httpStatusCode + " " + httpStatusText
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

        Object res = handleErrors(httpStatusCode, httpStatusText, url, method, responseHeaders, result, responseBody, requestHeaders, body);
        if (res == null) {
            handleHttpStatusCode(httpStatusCode, httpStatusText, url, method, result);
        }

        return responseBody;
    }

    /**
     * Percent-encode the small set of characters that are legal in browser/Node
     * URLs but rejected by java.net.URI's strict RFC 3986 parser. Already-
     * encoded sequences (%XX) are left alone — we only touch raw illegal
     * chars. Scheme/authority/path/query are not parsed; this is a byte-level
     * pass over the URL string.
     */
    private static String escapeIllegalUriChars(String url) {
        if (url == null) return null;
        StringBuilder out = null;
        for (int i = 0; i < url.length(); i++) {
            char c = url.charAt(i);
            boolean illegal = (c == '"' || c == '<' || c == '>' || c == '\\'
                    || c == '^' || c == '`' || c == '{' || c == '|' || c == '}'
                    || c == ' ');
            if (!illegal) {
                if (out != null) out.append(c);
                continue;
            }
            if (out == null) {
                out = new StringBuilder(url.length() + 16);
                out.append(url, 0, i);
            }
            out.append('%');
            out.append(String.format("%02X", (int) c));
        }
        return (out == null) ? url : out.toString();
    }

    private RuntimeException mapNetworkException(Throwable e, String method, String url) {
        // Unwrap CompletionException if needed
        Throwable cause = e;
        while (cause instanceof java.util.concurrent.CompletionException && cause.getCause() != null) {
            cause = cause.getCause();
        }
        if (cause instanceof java.net.http.HttpTimeoutException) {
            String errorMessage = this.id + " " + method + " " + url + " " + cause.getMessage();
            return new RequestTimeout(errorMessage);
        }
        if (cause instanceof java.net.ConnectException
                || cause instanceof java.net.UnknownHostException
                || cause instanceof java.net.SocketException
                || cause instanceof java.io.IOException) {
            String errorMessage = this.id + " " + method + " " + url + " " + cause.getMessage();
            return new NetworkError(errorMessage);
        }
        if (cause instanceof RuntimeException) {
            return (RuntimeException) cause;
        }
        return new RuntimeException(cause);
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
            String propName = property.toString();
            // walk the superclass chain: base fields now live on BaseExchange (the parent of the
            // thin Exchange class), so getDeclaredField on the runtime class alone would miss them
            for (Class<?> clazz = obj.getClass(); clazz != null; clazz = clazz.getSuperclass()) {
                try {
                    java.lang.reflect.Field field = clazz.getDeclaredField(propName);
                    field.setAccessible(true);
                    field.set(obj, defaultValue);
                    return;
                } catch (NoSuchFieldException ignored) {}
            }
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

    // EIP-712 typed-data encoder. Returns the pre-digest bytes
    // (0x1901 || domainSeparator || hashStruct(message)) that the caller
    // keccak256-hashes to get the signing digest. Implemented manually
    // rather than via web3j's StructuredDataEncoder because some exchanges
    // (e.g. Aster) use field names containing spaces, which web3j rejects
    // as invalid Solidity identifiers — the EIP-712 spec itself doesn't
    // require that restriction.
    @SuppressWarnings("unchecked")
    public Object ethEncodeStructuredData(Object domain2, Object messageTypes2, Object messageData2) {
        try {
            Map<String, Object> domain = (Map<String, Object>) domain2;
            Map<String, Object> messageTypes = (Map<String, Object>) messageTypes2;
            Map<String, Object> messageData = (Map<String, Object>) messageData2;

            // Infer EIP712Domain field set from the domain fields actually present.
            // Order is the canonical one (name, version, chainId, verifyingContract, salt).
            LinkedHashMap<String, String> canonicalDomainFields = new LinkedHashMap<>();
            canonicalDomainFields.put("name", "string");
            canonicalDomainFields.put("version", "string");
            canonicalDomainFields.put("chainId", "uint256");
            canonicalDomainFields.put("verifyingContract", "address");
            canonicalDomainFields.put("salt", "bytes32");
            List<Map<String, String>> eip712DomainType = new ArrayList<>();
            for (Map.Entry<String, String> e : canonicalDomainFields.entrySet()) {
                if (domain.containsKey(e.getKey())) {
                    LinkedHashMap<String, String> field = new LinkedHashMap<>();
                    field.put("name", e.getKey());
                    field.put("type", e.getValue());
                    eip712DomainType.add(field);
                }
            }

            LinkedHashMap<String, List<Map<String, String>>> types = new LinkedHashMap<>();
            types.put("EIP712Domain", eip712DomainType);
            for (Map.Entry<String, Object> e : messageTypes.entrySet()) {
                types.put(e.getKey(), (List<Map<String, String>>) e.getValue());
            }

            // The primary type is the EIP-712 root: the struct not referenced as a field type by
            // any other struct. Java maps don't preserve insertion order, so taking the first key
            // is unreliable and broke nested typed data (ERC-7739 TypedDataSign(Order contents,...))
            // by hashing the wrong struct. Resolve the root by reference analysis instead.
            java.util.Set<String> referencedTypes = new java.util.HashSet<>();
            for (Map.Entry<String, Object> e : messageTypes.entrySet()) {
                for (Map<String, String> field : (List<Map<String, String>>) e.getValue()) {
                    String referencedType = field.get("type");
                    int bracket = referencedType.indexOf("[");
                    if (bracket >= 0) {
                        referencedType = referencedType.substring(0, bracket);
                    }
                    if (messageTypes.containsKey(referencedType)) {
                        referencedTypes.add(referencedType);
                    }
                }
            }
            String primaryType = null;
            for (String typeName : messageTypes.keySet()) {
                if (!referencedTypes.contains(typeName)) {
                    primaryType = typeName;
                    break;
                }
            }
            if (primaryType == null) {
                primaryType = messageTypes.keySet().iterator().next();
            }

            byte[] domainSeparator = hashStruct("EIP712Domain", domain, types);
            byte[] messageHash = hashStruct(primaryType, messageData, types);

            byte[] result = new byte[2 + 32 + 32];
            result[0] = (byte) 0x19;
            result[1] = (byte) 0x01;
            System.arraycopy(domainSeparator, 0, result, 2, 32);
            System.arraycopy(messageHash, 0, result, 34, 32);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("ethEncodeStructuredData failed: " + e.getMessage(), e);
        }
    }

    private static byte[] hashStruct(String primaryType, Map<String, Object> data, Map<String, List<Map<String, String>>> types) {
        String typeString = encodeType(primaryType, types);
        byte[] typeHash = keccak256(typeString.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        byte[] encodedData = encodeData(primaryType, data, types);
        byte[] buf = new byte[typeHash.length + encodedData.length];
        System.arraycopy(typeHash, 0, buf, 0, typeHash.length);
        System.arraycopy(encodedData, 0, buf, typeHash.length, encodedData.length);
        return keccak256(buf);
    }

    // encodeType per EIP-712: primaryType followed by sorted dependent struct types.
    private static String encodeType(String primaryType, Map<String, List<Map<String, String>>> types) {
        LinkedHashSet<String> deps = new LinkedHashSet<>();
        collectDependencies(primaryType, types, deps);
        deps.remove(primaryType);
        List<String> sortedDeps = new ArrayList<>(deps);
        java.util.Collections.sort(sortedDeps);
        sortedDeps.add(0, primaryType);
        StringBuilder sb = new StringBuilder();
        for (String typeName : sortedDeps) {
            sb.append(typeName).append("(");
            List<Map<String, String>> fields = types.get(typeName);
            for (int i = 0; i < fields.size(); i++) {
                if (i > 0) sb.append(",");
                Map<String, String> field = fields.get(i);
                sb.append(field.get("type")).append(" ").append(field.get("name"));
            }
            sb.append(")");
        }
        return sb.toString();
    }

    private static void collectDependencies(String typeName, Map<String, List<Map<String, String>>> types, LinkedHashSet<String> deps) {
        if (!types.containsKey(typeName) || deps.contains(typeName)) return;
        deps.add(typeName);
        for (Map<String, String> field : types.get(typeName)) {
            String fieldType = field.get("type");
            // Strip array suffix
            int idx = fieldType.indexOf('[');
            if (idx >= 0) fieldType = fieldType.substring(0, idx);
            if (types.containsKey(fieldType)) {
                collectDependencies(fieldType, types, deps);
            }
        }
    }

    private static byte[] encodeData(String primaryType, Map<String, Object> data, Map<String, List<Map<String, String>>> types) {
        List<byte[]> chunks = new ArrayList<>();
        for (Map<String, String> field : types.get(primaryType)) {
            String fieldName = field.get("name");
            String fieldType = field.get("type");
            chunks.add(encodeValue(fieldType, data.get(fieldName), types));
        }
        int total = 0;
        for (byte[] c : chunks) total += c.length;
        byte[] out = new byte[total];
        int pos = 0;
        for (byte[] c : chunks) {
            System.arraycopy(c, 0, out, pos, c.length);
            pos += c.length;
        }
        return out;
    }

    @SuppressWarnings("unchecked")
    private static byte[] encodeValue(String type, Object value, Map<String, List<Map<String, String>>> types) {
        // Custom struct
        if (types.containsKey(type)) {
            return hashStruct(type, (Map<String, Object>) value, types);
        }
        // Array type
        if (type.endsWith("[]")) {
            String baseType = type.substring(0, type.length() - 2);
            List<Object> list = (List<Object>) value;
            List<byte[]> encoded = new ArrayList<>();
            int total = 0;
            for (Object item : list) {
                byte[] e = encodeValue(baseType, item, types);
                encoded.add(e);
                total += e.length;
            }
            byte[] buf = new byte[total];
            int pos = 0;
            for (byte[] e : encoded) {
                System.arraycopy(e, 0, buf, pos, e.length);
                pos += e.length;
            }
            return keccak256(buf);
        }
        // string: keccak256 of UTF-8 bytes
        if (type.equals("string")) {
            String s = value == null ? "" : value.toString();
            return keccak256(s.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
        // dynamic bytes: keccak256 of the bytes
        if (type.equals("bytes")) {
            byte[] bytes = bytesFromValue(value);
            return keccak256(bytes);
        }
        // bytes1..bytes32: right-padded to 32
        if (type.startsWith("bytes")) {
            byte[] bytes = bytesFromValue(value);
            byte[] padded = new byte[32];
            System.arraycopy(bytes, 0, padded, 0, Math.min(bytes.length, 32));
            return padded;
        }
        // address: 20 bytes left-padded to 32
        if (type.equals("address")) {
            byte[] addr = bytesFromValue(value);
            byte[] padded = new byte[32];
            int copyLen = Math.min(addr.length, 20);
            System.arraycopy(addr, addr.length - copyLen, padded, 32 - copyLen, copyLen);
            return padded;
        }
        // bool
        if (type.equals("bool")) {
            byte[] padded = new byte[32];
            if (Boolean.TRUE.equals(value)) padded[31] = 1;
            return padded;
        }
        // uintNN / intNN
        if (type.startsWith("uint") || type.startsWith("int")) {
            java.math.BigInteger n;
            if (value instanceof java.math.BigInteger) n = (java.math.BigInteger) value;
            else if (value instanceof Number) n = java.math.BigInteger.valueOf(((Number) value).longValue());
            else if (value instanceof Boolean) n = ((Boolean) value) ? java.math.BigInteger.ONE : java.math.BigInteger.ZERO;
            else if (value instanceof String) {
                String s = (String) value;
                n = s.startsWith("0x") ? new java.math.BigInteger(s.substring(2), 16) : new java.math.BigInteger(s);
            } else {
                throw new RuntimeException("Unsupported numeric value for " + type + ": " + (value == null ? "null" : value.getClass()));
            }
            byte[] raw = n.toByteArray();
            byte[] padded = new byte[32];
            // Two's complement sign extension via signByte
            byte signByte = (n.signum() < 0) ? (byte) 0xff : (byte) 0x00;
            java.util.Arrays.fill(padded, signByte);
            int copyLen = Math.min(raw.length, 32);
            System.arraycopy(raw, raw.length - copyLen, padded, 32 - copyLen, copyLen);
            return padded;
        }
        throw new RuntimeException("Unsupported EIP-712 type: " + type);
    }

    private static byte[] bytesFromValue(Object value) {
        if (value instanceof byte[]) return (byte[]) value;
        if (value instanceof String) {
            String s = (String) value;
            if (s.startsWith("0x") || s.startsWith("0X")) s = s.substring(2);
            if (s.length() % 2 != 0) s = "0" + s;
            byte[] out = new byte[s.length() / 2];
            for (int i = 0; i < out.length; i++) {
                out[i] = (byte) Integer.parseInt(s.substring(i * 2, i * 2 + 2), 16);
            }
            return out;
        }
        throw new RuntimeException("Cannot interpret value as bytes: " + (value == null ? "null" : value.getClass()));
    }

    private static byte[] keccak256(byte[] input) {
        org.bouncycastle.jcajce.provider.digest.Keccak.Digest256 k = new org.bouncycastle.jcajce.provider.digest.Keccak.Digest256();
        k.update(input, 0, input.length);
        return k.digest();
    }

    public Object packb(Object data) {
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
             org.msgpack.core.MessagePacker packer = org.msgpack.core.MessagePack.newDefaultPacker(out)) {
            // Java Maps don't preserve insertion order, but msgpack signatures
            // (e.g. Hyperliquid) require a canonical field order. Match the Go
            // port's strategy (go/v4/exchange_eth.go): per-exchange schemas
            // reorder action dicts before packing. Schemas are looked up by
            // the value of the "type" key and applied recursively (nested
            // orders, builder, trigger spec, etc.).
            Object normalized = applyMsgpackSchema(data, null);
            packValue(packer, normalized);
            packer.flush();
            return out.toByteArray();
        } catch (java.io.IOException e) {
            throw new RuntimeException("packb failed", e);
        }
    }

    // A msgpack schema declares the canonical field order for a Map value
    // and, for fields whose value is itself a Map or a List of Maps, an
    // optional nested schema. Mirrors the typed structs in
    // go/v4/exchange_eth.go (OrderMessage, OrderHyperliquid, etc.).
    private static final class MsgpackSchema {
        final String[] fields;
        final Map<String, MsgpackSchema> children = new HashMap<>();
        MsgpackSchema(String... fields) { this.fields = fields; }
        MsgpackSchema with(String field, MsgpackSchema child) { children.put(field, child); return this; }
    }

    private static final Map<String, MsgpackSchema> HYPERLIQUID_SCHEMAS = buildHyperliquidSchemas();

    private static Map<String, MsgpackSchema> buildHyperliquidSchemas() {
        // Nested types (no "type" discriminator — referenced from parents).
        MsgpackSchema timeInForce = new MsgpackSchema("tif");
        MsgpackSchema triggerSpec = new MsgpackSchema("isMarket", "triggerPx", "tpsl");
        MsgpackSchema orderKind = new MsgpackSchema("limit", "trigger")
            .with("limit", timeInForce)
            .with("trigger", triggerSpec);
        MsgpackSchema orderHyperliquid = new MsgpackSchema("a", "b", "p", "s", "r", "t", "c")
            .with("t", orderKind);
        MsgpackSchema builder = new MsgpackSchema("b", "f");
        MsgpackSchema cancel = new MsgpackSchema("a", "o");
        MsgpackSchema modify = new MsgpackSchema("oid", "order")
            .with("order", orderHyperliquid);
        MsgpackSchema cancelByCloidItem = new MsgpackSchema("asset", "cloid");
        MsgpackSchema twapSpec = new MsgpackSchema("a", "b", "s", "r", "m", "t");

        // Top-level action schemas (keyed by the value of the "type" field).
        Map<String, MsgpackSchema> schemas = new HashMap<>();
        schemas.put("order", new MsgpackSchema("type", "orders", "grouping", "builder")
            .with("orders", orderHyperliquid)
            .with("builder", builder));
        schemas.put("cancel", new MsgpackSchema("type", "cancels")
            .with("cancels", cancel));
        schemas.put("cancelByCloid", new MsgpackSchema("type", "cancels")
            .with("cancels", cancelByCloidItem));
        schemas.put("batchModify", new MsgpackSchema("type", "modifies")
            .with("modifies", modify));
        schemas.put("withdraw3", new MsgpackSchema("hyperliquidChain", "signatureChainId", "destination", "amount", "time", "type"));
        schemas.put("usdSend", new MsgpackSchema("hyperliquidChain", "signatureChainId", "destination", "amount", "time", "type"));
        schemas.put("usdClassTransfer", new MsgpackSchema("hyperliquidChain", "signatureChainId", "type", "amount", "toPerp", "nonce"));
        schemas.put("spotSend", new MsgpackSchema("hyperliquidChain", "signatureChainId", "destination", "token", "amount", "time", "type"));
        schemas.put("subAccountTransfer", new MsgpackSchema("type", "subAccountUser", "isDeposit", "usd"));
        schemas.put("subAccountSpotTransfer", new MsgpackSchema("type", "subAccountUser", "isDeposit", "token", "amount"));
        schemas.put("vaultTransfer", new MsgpackSchema("type", "vaultAddress", "isDeposit", "usd"));
        schemas.put("createSubAccount", new MsgpackSchema("type", "name"));
        schemas.put("createVault", new MsgpackSchema("type", "name", "description", "initialUsd", "nonce"));
        schemas.put("updateLeverage", new MsgpackSchema("type", "asset", "isCross", "leverage"));
        schemas.put("updateIsolatedMargin", new MsgpackSchema("type", "asset", "isBuy", "Ntli"));
        schemas.put("twapOrder", new MsgpackSchema("type", "twap").with("twap", twapSpec));
        schemas.put("twapCancel", new MsgpackSchema("type", "a", "t"));
        schemas.put("scheduleCancel", new MsgpackSchema("type", "time"));
        schemas.put("setReferrer", new MsgpackSchema("type", "code"));
        schemas.put("agentSetAbstraction", new MsgpackSchema("type", "abstraction"));
        schemas.put("reserveRequestWeight", new MsgpackSchema("type", "weight"));
        return schemas;
    }

    // Recursively reorders Maps according to the per-exchange schema so that
    // msgpack output matches the byte order the exchange's signature verifier
    // expects. Top-level entry uses schema=null and resolves via the value's
    // "type" field; deeper levels pass an explicit schema for nested values.
    @SuppressWarnings("unchecked")
    private Object applyMsgpackSchema(Object value, MsgpackSchema schema) {
        if (value instanceof Map) {
            Map<String, Object> map = (Map<String, Object>) value;
            // Top-level: look up the schema by the "type" field if applicable.
            if (schema == null) {
                schema = lookupTopLevelSchema(map);
            }
            if (schema != null) {
                java.util.LinkedHashMap<String, Object> ordered = new java.util.LinkedHashMap<>();
                for (String field : schema.fields) {
                    if (map.containsKey(field)) {
                        ordered.put(field, applyMsgpackSchema(map.get(field), schema.children.get(field)));
                    }
                }
                return ordered;
            }
            // No schema: keep existing iteration order but recurse into values.
            java.util.LinkedHashMap<String, Object> copy = new java.util.LinkedHashMap<>();
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                copy.put(entry.getKey(), applyMsgpackSchema(entry.getValue(), null));
            }
            return copy;
        }
        if (value instanceof List) {
            List<Object> list = (List<Object>) value;
            List<Object> copy = new ArrayList<>();
            for (Object item : list) {
                // List items inherit the parent field's schema.
                copy.add(applyMsgpackSchema(item, schema));
            }
            return copy;
        }
        return value;
    }

    private MsgpackSchema lookupTopLevelSchema(Map<String, Object> map) {
        if (!"hyperliquid".equals(this.id)) return null;
        Object typeValue = map.get("type");
        if (typeValue instanceof String) {
            return HYPERLIQUID_SCHEMAS.get(typeValue);
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private static void packValue(org.msgpack.core.MessagePacker packer, Object value) throws java.io.IOException {
        if (value == null) {
            packer.packNil();
        } else if (value instanceof Boolean) {
            packer.packBoolean((Boolean) value);
        } else if (value instanceof Byte) {
            packer.packByte((Byte) value);
        } else if (value instanceof Short) {
            packer.packShort((Short) value);
        } else if (value instanceof Integer) {
            packer.packInt((Integer) value);
        } else if (value instanceof Long) {
            packer.packLong((Long) value);
        } else if (value instanceof java.math.BigInteger) {
            packer.packBigInteger((java.math.BigInteger) value);
        } else if (value instanceof Float) {
            packer.packFloat((Float) value);
        } else if (value instanceof Double) {
            packer.packDouble((Double) value);
        } else if (value instanceof String) {
            packer.packString((String) value);
        } else if (value instanceof byte[]) {
            byte[] bytes = (byte[]) value;
            packer.packBinaryHeader(bytes.length);
            packer.writePayload(bytes);
        } else if (value instanceof Map) {
            Map<Object, Object> map = (Map<Object, Object>) value;
            packer.packMapHeader(map.size());
            for (Map.Entry<Object, Object> entry : map.entrySet()) {
                packValue(packer, entry.getKey());
                packValue(packer, entry.getValue());
            }
        } else if (value instanceof List) {
            List<Object> list = (List<Object>) value;
            packer.packArrayHeader(list.size());
            for (Object item : list) {
                packValue(packer, item);
            }
        } else {
            // Best-effort fallback for unknown types
            packer.packString(value.toString());
        }
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

    @SuppressWarnings("unchecked")
    public Object ethAbiEncode(Object types2, Object args2)
    {
        // static abi.encode: each argument becomes a 32-byte word, concatenated. Reuses the
        // EIP-712 word encoder (encodeValue) which already left-pads uint/address and right-pads
        // bytesN exactly as abi.encode does for static types (the only types used here: bytes32,
        // uint256, address, uint8). The caller keccak-hashes the result.
        List<Object> types = (List<Object>) types2;
        List<Object> args = (List<Object>) args2;
        Map<String, List<Map<String, String>>> noStructs = new java.util.HashMap<>();
        List<byte[]> words = new ArrayList<>();
        int total = 0;
        for (int i = 0; i < types.size(); i++) {
            byte[] word = encodeValue((String) types.get(i), args.get(i), noStructs);
            words.add(word);
            total += word.length;
        }
        byte[] out = new byte[total];
        int pos = 0;
        for (byte[] w : words) {
            System.arraycopy(w, 0, out, pos, w.length);
            pos += w.length;
        }
        return out;
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

    public Object extendedStarknetSign(Object msgHash, Object privateKey)
    {
        BigInteger hash = extendedParseStarknetBigInteger(msgHash);
        BigInteger key = extendedParseStarknetBigInteger(privateKey);
        BigInteger[] signature = extendedStarknetSignBigInteger(hash, key);
        return this.json(new ArrayList<Object>(Arrays.asList(signature[0].toString(), signature[1].toString())));
    }

    public Object extendedStarknetGetSelectorFromName(Object name)
    {
        String functionName = name.toString();
        if (functionName.equals("__default__") || functionName.equals("__l1_default__")) {
            return "0";
        }
        byte[] digest = keccak256(functionName.getBytes(StandardCharsets.US_ASCII));
        return extendedField(extendedBigIntegerFromUnsignedBytes(digest), EXTENDED_STARKNET_SELECTOR_MASK).toString();
    }

    public Object extendedStarknetComputePoseidonHashOnElements(Object data)
    {
        if (!(data instanceof Iterable<?>)) {
            throw new RuntimeException("extendedStarknetComputePoseidonHashOnElements() requires an array");
        }
        ArrayList<BigInteger> padded = new ArrayList<>();
        for (Object value : (Iterable<?>) data) {
            padded.add(extendedParseStarknetBigInteger(value));
        }
        padded.add(BigInteger.ONE);
        while ((padded.size() % EXTENDED_STARKNET_POSEIDON_RATE) != 0) {
            padded.add(BigInteger.ZERO);
        }
        BigInteger[] state = new BigInteger[] { BigInteger.ZERO, BigInteger.ZERO, BigInteger.ZERO };
        for (int i = 0; i < padded.size(); i += EXTENDED_STARKNET_POSEIDON_RATE) {
            for (int j = 0; j < EXTENDED_STARKNET_POSEIDON_RATE; j++) {
                state[j] = state[j].add(padded.get(i + j));
            }
            state = extendedPoseidonHash(state);
        }
        return state[0].toString();
    }

    private static final BigInteger EXTENDED_STARKNET_FIELD_PRIME = new BigInteger("3618502788666131213697322783095070105623107215331596699973092056135872020481");
    private static final BigInteger EXTENDED_STARKNET_ALPHA = BigInteger.ONE;
    private static final BigInteger EXTENDED_STARKNET_BETA = new BigInteger("3141592653589793238462643383279502884197169399375105820974944592307816406665");
    private static final BigInteger EXTENDED_STARKNET_EC_ORDER = new BigInteger("3618502788666131213697322783095070105526743751716087489154079457884512865583");
    private static final BigInteger EXTENDED_STARKNET_EC_GEN_X = new BigInteger("874739451078007766457464989774322083649278607533249481151382481072868806602");
    private static final BigInteger EXTENDED_STARKNET_EC_GEN_Y = new BigInteger("152666792071518830868575557812948353041420400780739481342941381225525861407");
    private static final BigInteger EXTENDED_STARKNET_SELECTOR_MASK = BigInteger.ONE.shiftLeft(250);
    private static final int EXTENDED_STARKNET_ELEMENT_BITS_ECDSA = 251;
    private static final int EXTENDED_STARKNET_POSEIDON_RATE = 2;
    private static final int EXTENDED_STARKNET_POSEIDON_CAPACITY = 1;
    private static final int EXTENDED_STARKNET_POSEIDON_ROUNDS_FULL = 8;
    private static final int EXTENDED_STARKNET_POSEIDON_ROUNDS_PARTIAL = 83;
    private static final BigInteger[][] EXTENDED_STARKNET_POSEIDON_ROUND_CONSTANTS = extendedBuildPoseidonRoundConstants();
    private static final BigInteger[][] EXTENDED_STARKNET_POSEIDON_MDS = new BigInteger[][] {
        new BigInteger[] { BigInteger.valueOf(3), BigInteger.ONE, BigInteger.ONE },
        new BigInteger[] { BigInteger.ONE, BigInteger.valueOf(-1), BigInteger.ONE },
        new BigInteger[] { BigInteger.ONE, BigInteger.ONE, BigInteger.valueOf(-2) },
    };

    private static BigInteger extendedParseStarknetBigInteger(Object value)
    {
        if (value == null) {
            throw new RuntimeException("invalid starknet integer");
        }
        if (value instanceof BigInteger) {
            return (BigInteger) value;
        }
        if (value instanceof Number) {
            return BigInteger.valueOf(((Number) value).longValue());
        }
        String text = value.toString().trim();
        if (text.startsWith("0x") || text.startsWith("0X")) {
            return new BigInteger(text.substring(2), 16);
        }
        return new BigInteger(text, 10);
    }

    private static BigInteger extendedField(BigInteger value)
    {
        return extendedField(value, EXTENDED_STARKNET_FIELD_PRIME);
    }

    private static BigInteger extendedField(BigInteger value, BigInteger modulus)
    {
        BigInteger result = value.mod(modulus);
        return (result.signum() < 0) ? result.add(modulus) : result;
    }

    private static BigInteger extendedBigIntegerFromUnsignedBytes(byte[] bytes)
    {
        return new BigInteger(1, bytes);
    }

    private static byte[] extendedUnsignedBytes(BigInteger value)
    {
        byte[] bytes = value.toByteArray();
        if ((bytes.length > 1) && (bytes[0] == 0)) {
            return Arrays.copyOfRange(bytes, 1, bytes.length);
        }
        return bytes;
    }

    private static byte[] extendedPrepareMessageHash(BigInteger msgHash)
    {
        if ((msgHash.bitLength() % 8 >= 1) && (msgHash.bitLength() % 8 <= 4) && (msgHash.bitLength() >= 248)) {
            msgHash = msgHash.shiftLeft(4);
        }
        return extendedUnsignedBytes(msgHash);
    }

    private static BigInteger[] extendedStarknetSignBigInteger(BigInteger msgHash, BigInteger privateKey)
    {
        if ((msgHash.signum() < 0) || (msgHash.compareTo(BigInteger.ONE.shiftLeft(EXTENDED_STARKNET_ELEMENT_BITS_ECDSA)) >= 0)) {
            throw new RuntimeException("Message not signable.");
        }
        BigInteger seed = BigInteger.valueOf(32);
        while (true) {
            BigInteger k = extendedGenerateKRFC6979(msgHash, privateKey, seed);
            seed = seed.add(BigInteger.ONE);
            BigInteger r = extendedEcMult(k, new ExtendedStarknetPoint(EXTENDED_STARKNET_EC_GEN_X, EXTENDED_STARKNET_EC_GEN_Y)).x;
            if (extendedIsInvalidSignatureValue(r)) {
                continue;
            }
            BigInteger temp = msgHash.add(r.multiply(privateKey)).mod(EXTENDED_STARKNET_EC_ORDER);
            if (temp.equals(BigInteger.ZERO)) {
                continue;
            }
            BigInteger w = extendedDivMod(k, temp, EXTENDED_STARKNET_EC_ORDER);
            BigInteger s = extendedDivMod(BigInteger.ONE, w, EXTENDED_STARKNET_EC_ORDER);
            if (extendedIsInvalidSignatureValue(s)) {
                continue;
            }
            return new BigInteger[] { r, s };
        }
    }

    private static BigInteger extendedGenerateKRFC6979(BigInteger msgHash, BigInteger privateKey, BigInteger seed)
    {
        return extendedGenerateKRFC6979(EXTENDED_STARKNET_EC_ORDER, privateKey, extendedPrepareMessageHash(msgHash), extendedUnsignedBytes(seed));
    }

    private static BigInteger extendedGenerateKRFC6979(BigInteger order, BigInteger secretExponent, byte[] data, byte[] extraEntropy)
    {
        int qlen = order.bitLength();
        int holen = 32;
        int rolen = (qlen + 7) / 8;
        byte[] bx = extendedBytesConcat(extendedNumberToString(secretExponent, order), extendedBits2Octets(data, order), extraEntropy);
        byte[] v = new byte[holen];
        Arrays.fill(v, (byte) 1);
        byte[] k = new byte[holen];
        k = extendedHmacSha256(k, extendedBytesConcat(v, new byte[] { 0 }, bx));
        v = extendedHmacSha256(k, v);
        k = extendedHmacSha256(k, extendedBytesConcat(v, new byte[] { 1 }, bx));
        v = extendedHmacSha256(k, v);
        while (true) {
            java.io.ByteArrayOutputStream t = new java.io.ByteArrayOutputStream();
            while (t.size() < rolen) {
                v = extendedHmacSha256(k, v);
                try {
                    t.write(v);
                } catch (java.io.IOException e) {
                    throw new RuntimeException(e);
                }
            }
            BigInteger secret = extendedBits2Int(t.toByteArray(), qlen);
            if ((secret.compareTo(BigInteger.ONE) >= 0) && (secret.compareTo(order) < 0)) {
                return secret;
            }
            k = extendedHmacSha256(k, extendedBytesConcat(v, new byte[] { 0 }));
            v = extendedHmacSha256(k, v);
        }
    }

    private static byte[] extendedHmacSha256(byte[] key, byte[] data)
    {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(data);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static byte[] extendedBytesConcat(byte[]... arrays)
    {
        int length = 0;
        for (byte[] array : arrays) {
            length += array.length;
        }
        byte[] result = new byte[length];
        int offset = 0;
        for (byte[] array : arrays) {
            System.arraycopy(array, 0, result, offset, array.length);
            offset += array.length;
        }
        return result;
    }

    private static int extendedOrderLength(BigInteger order)
    {
        return (1 + order.toString(16).length()) / 2;
    }

    private static byte[] extendedNumberToString(BigInteger value, BigInteger order)
    {
        int length = extendedOrderLength(order);
        byte[] bytes = extendedUnsignedBytes(value);
        if (bytes.length == length) {
            return bytes;
        }
        byte[] result = new byte[length];
        if (bytes.length > length) {
            System.arraycopy(bytes, bytes.length - length, result, 0, length);
        } else {
            System.arraycopy(bytes, 0, result, length - bytes.length, bytes.length);
        }
        return result;
    }

    private static byte[] extendedNumberToStringCrop(BigInteger value, BigInteger order)
    {
        byte[] bytes = extendedNumberToString(value, order);
        int length = extendedOrderLength(order);
        return (bytes.length == length) ? bytes : Arrays.copyOf(bytes, length);
    }

    private static BigInteger extendedBits2Int(byte[] data, int qlen)
    {
        BigInteger x = extendedBigIntegerFromUnsignedBytes(data);
        int bitLength = data.length * 8;
        if (bitLength > qlen) {
            return x.shiftRight(bitLength - qlen);
        }
        return x;
    }

    private static byte[] extendedBits2Octets(byte[] data, BigInteger order)
    {
        BigInteger z1 = extendedBits2Int(data, order.bitLength());
        BigInteger z2 = z1.subtract(order);
        if (z2.signum() < 0) {
            z2 = z1;
        }
        return extendedNumberToStringCrop(z2, order);
    }

    private static boolean extendedIsInvalidSignatureValue(BigInteger value)
    {
        return (value.signum() <= 0) || (value.compareTo(BigInteger.ONE.shiftLeft(EXTENDED_STARKNET_ELEMENT_BITS_ECDSA)) >= 0);
    }

    private static BigInteger extendedDivMod(BigInteger n, BigInteger m, BigInteger p)
    {
        return extendedField(n.multiply(m.modInverse(p)), p);
    }

    private static ExtendedStarknetPoint extendedEcAdd(ExtendedStarknetPoint point1, ExtendedStarknetPoint point2)
    {
        if (point1.x.subtract(point2.x).mod(EXTENDED_STARKNET_FIELD_PRIME).equals(BigInteger.ZERO)) {
            throw new RuntimeException("Points must have different x coordinates.");
        }
        BigInteger slope = extendedDivMod(point1.y.subtract(point2.y), point1.x.subtract(point2.x), EXTENDED_STARKNET_FIELD_PRIME);
        BigInteger x = extendedField(slope.multiply(slope).subtract(point1.x).subtract(point2.x));
        BigInteger y = extendedField(slope.multiply(point1.x.subtract(x)).subtract(point1.y));
        return new ExtendedStarknetPoint(x, y);
    }

    private static ExtendedStarknetPoint extendedEcDouble(ExtendedStarknetPoint point)
    {
        if (point.y.mod(EXTENDED_STARKNET_FIELD_PRIME).equals(BigInteger.ZERO)) {
            throw new RuntimeException("Point y coordinate cannot be zero.");
        }
        BigInteger slope = extendedDivMod(BigInteger.valueOf(3).multiply(point.x).multiply(point.x).add(EXTENDED_STARKNET_ALPHA), BigInteger.valueOf(2).multiply(point.y), EXTENDED_STARKNET_FIELD_PRIME);
        BigInteger x = extendedField(slope.multiply(slope).subtract(BigInteger.valueOf(2).multiply(point.x)));
        BigInteger y = extendedField(slope.multiply(point.x.subtract(x)).subtract(point.y));
        return new ExtendedStarknetPoint(x, y);
    }

    private static ExtendedStarknetPoint extendedEcMult(BigInteger scalar, ExtendedStarknetPoint point)
    {
        if (scalar.equals(BigInteger.ONE)) {
            return point;
        }
        if (scalar.mod(BigInteger.valueOf(2)).equals(BigInteger.ZERO)) {
            return extendedEcMult(scalar.divide(BigInteger.valueOf(2)), extendedEcDouble(point));
        }
        return extendedEcAdd(extendedEcMult(scalar.subtract(BigInteger.ONE), point), point);
    }

    private static class ExtendedStarknetPoint {
        BigInteger x;
        BigInteger y;
        ExtendedStarknetPoint(BigInteger x, BigInteger y) {
            this.x = x;
            this.y = y;
        }
    }

    private static BigInteger[][] extendedBuildPoseidonRoundConstants()
    {
        int rounds = EXTENDED_STARKNET_POSEIDON_ROUNDS_FULL + EXTENDED_STARKNET_POSEIDON_ROUNDS_PARTIAL;
        int width = EXTENDED_STARKNET_POSEIDON_RATE + EXTENDED_STARKNET_POSEIDON_CAPACITY;
        BigInteger[][] constants = new BigInteger[rounds][width];
        for (int i = 0; i < rounds; i++) {
            for (int j = 0; j < width; j++) {
                constants[i][j] = extendedPoseidonRoundConstant("Hades", width * i + j);
            }
        }
        return constants;
    }

    private static BigInteger extendedPoseidonRoundConstant(String name, int index)
    {
        try {
            java.security.MessageDigest sha256 = java.security.MessageDigest.getInstance("SHA-256");
            byte[] digest = sha256.digest((name + Integer.toString(index)).getBytes(StandardCharsets.UTF_8));
            return extendedField(extendedBigIntegerFromUnsignedBytes(digest));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    private static BigInteger extendedPoseidonSbox(BigInteger value)
    {
        return value.modPow(BigInteger.valueOf(3), EXTENDED_STARKNET_FIELD_PRIME);
    }

    private static BigInteger[] extendedPoseidonRound(BigInteger[] values, boolean isFull, int index)
    {
        BigInteger[] current = new BigInteger[values.length];
        for (int i = 0; i < values.length; i++) {
            current[i] = extendedField(values[i].add(EXTENDED_STARKNET_POSEIDON_ROUND_CONSTANTS[index][i]));
        }
        if (isFull) {
            for (int i = 0; i < current.length; i++) {
                current[i] = extendedPoseidonSbox(current[i]);
            }
        } else {
            current[current.length - 1] = extendedPoseidonSbox(current[current.length - 1]);
        }
        BigInteger[] result = new BigInteger[EXTENDED_STARKNET_POSEIDON_MDS.length];
        for (int row = 0; row < EXTENDED_STARKNET_POSEIDON_MDS.length; row++) {
            BigInteger acc = BigInteger.ZERO;
            for (int i = 0; i < current.length; i++) {
                acc = acc.add(EXTENDED_STARKNET_POSEIDON_MDS[row][i].multiply(current[i]));
            }
            result[row] = extendedField(acc);
        }
        return result;
    }

    private static BigInteger[] extendedPoseidonHash(BigInteger[] values)
    {
        if (values.length != (EXTENDED_STARKNET_POSEIDON_RATE + EXTENDED_STARKNET_POSEIDON_CAPACITY)) {
            throw new RuntimeException("Poseidon: wrong values length");
        }
        BigInteger[] current = new BigInteger[values.length];
        for (int i = 0; i < values.length; i++) {
            current[i] = extendedField(values[i]);
        }
        int roundIndex = 0;
        int halfRoundsFull = EXTENDED_STARKNET_POSEIDON_ROUNDS_FULL / 2;
        for (int i = 0; i < halfRoundsFull; i++) {
            current = extendedPoseidonRound(current, true, roundIndex++);
        }
        for (int i = 0; i < EXTENDED_STARKNET_POSEIDON_ROUNDS_PARTIAL; i++) {
            current = extendedPoseidonRound(current, false, roundIndex++);
        }
        for (int i = 0; i < halfRoundsFull; i++) {
            current = extendedPoseidonRound(current, true, roundIndex++);
        }
        return current;
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
        if (size <= 0) {
            return 0;
        }
        StringBuilder number = new StringBuilder(size);
        // Leading digit 1-9 so Integer.parseInt round-trips the requested width.
        number.append(1 + secureRandom.nextInt(9));
        for (int i = 1; i < size; i++) {
            number.append(secureRandom.nextInt(10));
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

    public CompletableFuture<Object> loadLighterLibrary(Object libraryPath,  Object chainId,  Object privateKey,  Object apiKeyIndex,  Object accountIndex,  Object createClient)
    {
        throw new NotSupported(this.id + " lighter is not supported in java yet");
    }

    public Object lighterCreateClient(Object signer, Object chainId, Object privateKey, Object apiKeyIndex, Object accountIndex)
    {
        throw new NotSupported(this.id + " lighter is not supported in java yet");
    }

    public Object lighterSignApproveIntegrator(Object signer, Object request)
    {
        throw new NotSupported(this.id + " lighter is not supported in java yet");
    }

    public Object lighterGenerateApiKey(Object signer)
    {
        throw new NotSupported(this.id + " lighter is not supported in java yet");
    }

    public Object lighterSignChangePubkey(Object signer, Object request)
    {
        throw new NotSupported(this.id + " lighter is not supported in java yet");
    }

    public Object lighterSignCreateGroupedOrders(Object signer, Object request)
    {
        return null;
    }

    public Object lighterSignCreateOrder(Object signer, Object request)
    {
        return null;
    }

    public Object lighterSignCancelOrder(Object signer, Object request)
    {
        return null;
    }

    public Object lighterSignWithdraw(Object signer, Object request)
    {
        return null;
    }

    public Object lighterSignCreateSubAccount(Object signer, Object request)
    {
        return null;
    }

    public Object lighterSignCancelAllOrders(Object signer, Object request)
    {
        return null;
    }


    public Object lighterSignModifyOrder(Object signer, Object request)
    {
        return null;
    }


    public Object lighterSignTransfer(Object signer, Object request)
    {
        return null;
    }


    public Object lighterSignUpdateLeverage(Object signer, Object request)
    {
        return null;
    }


    public Object lighterCreateAuthToken(Object signer, Object request)
    {
        return null;
    }


    public Object lighterSignUpdateMargin(Object signer, Object request)
    {
        return null;
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

        String propName = property.toString();
        // walk the superclass chain: base fields now live on BaseExchange (the parent of the
        // thin Exchange class), so getDeclaredField on the runtime class alone would miss them
        for (Class<?> clazz = obj.getClass(); clazz != null; clazz = clazz.getSuperclass()) {
            try {
                Field field = clazz.getDeclaredField(propName);
                field.setAccessible(true);
                return field.get(obj);
            } catch (NoSuchFieldException e) {
                // try the parent class
            } catch (IllegalAccessException e) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    public static Object getProperty(Object obj, Object property) {
        return BaseExchange.getProperty(obj, property, null);
    }

    public void setFetchResponse(Object response) {
        this.fetchResponse = response;
    }

    public static BaseExchange dynamicallyCreateInstance(String className, Object args, boolean isWs) {
        return dynamicallyCreateInstance(className, args, isWs, false);
    }

    public static BaseExchange dynamicallyCreateInstance(String className, Object args, boolean isWs, boolean forcePrediction) {
        if (className == null || className.trim().isEmpty()) return null;

        String EXCHANGES_PKG = "io.github.ccxt.exchanges.";

        String EXCHANGES_PKG_PRO = "io.github.ccxt.exchanges.pro.";

        // prediction-market exchanges (Polymarket, Kalshi, Limitless, Myriad, ...)
        // live in their own package; resolved as a fallback when no regular class
        // of the same id exists. `hyperliquid` exists in both packages — the
        // regular class wins for the bare id since this fallback only runs when
        // Class.forName on the regular fqcn throws ClassNotFoundException.
        String EXCHANGES_PKG_PREDICTION = "io.github.ccxt.exchanges.prediction.";
        String EXCHANGES_PKG_PREDICTION_PRO = "io.github.ccxt.exchanges.prediction.pro.";

        String name = className.trim();

        name = name.substring(0, 1).toUpperCase() + name.substring(1);

        String fqcn = (isWs ? EXCHANGES_PKG_PRO : EXCHANGES_PKG) + name;

        if (args == null) args = new HashMap<String, Object>();

        String predictionFqcn = (isWs ? EXCHANGES_PKG_PREDICTION_PRO : EXCHANGES_PKG_PREDICTION) + name;

        try {
            Class<?> clazz;
            if (forcePrediction) {
                // the --prediction flag prefers the prediction-markets package; prediction exchanges
                // carry their watch* methods on the main prediction class (no .pro variant), so use the
                // non-pro package even for ws
                String predictionNonPro = EXCHANGES_PKG_PREDICTION + name;
                try {
                    clazz = Class.forName(predictionNonPro);
                    fqcn = predictionNonPro;
                } catch (ClassNotFoundException predictionMiss) {
                    clazz = Class.forName(fqcn);
                }
            } else {
                try {
                    clazz = Class.forName(fqcn);
                } catch (ClassNotFoundException primaryMiss) {
                    clazz = Class.forName(predictionFqcn);
                    fqcn = predictionFqcn;
                }
            }

            if (!BaseExchange.class.isAssignableFrom(clazz)) return null;

            // Prefer ctor(Object)
            try {
                Constructor<?> ctor = clazz.getConstructor(Object.class);
                return (BaseExchange) ctor.newInstance(args);
            } catch (NoSuchMethodException ignored) {
            } catch (java.lang.reflect.InvocationTargetException ite) {
                Throwable root = ite.getCause() != null ? ite.getCause() : ite;
                System.err.println("[ccxt] " + fqcn + "(Object) constructor threw: " + root);
                root.printStackTrace(System.err);
            }

            // Try ctor(Map)
            if (args instanceof Map) {
                try {
                    @SuppressWarnings("rawtypes")
                    Constructor<?> ctor = clazz.getConstructor(Map.class);
                    return (BaseExchange) ctor.newInstance(args);
                } catch (NoSuchMethodException ignored) {
                } catch (java.lang.reflect.InvocationTargetException ite) {
                    Throwable root = ite.getCause() != null ? ite.getCause() : ite;
                    System.err.println("[ccxt] " + fqcn + "(Map) constructor threw: " + root);
                    root.printStackTrace(System.err);
                }
            }

            // Fallback no-arg ctor
            try {
                Constructor<?> ctor = clazz.getConstructor();
                return (BaseExchange) ctor.newInstance();
            } catch (NoSuchMethodException ignored) {
            } catch (java.lang.reflect.InvocationTargetException ite) {
                Throwable root = ite.getCause() != null ? ite.getCause() : ite;
                System.err.println("[ccxt] " + fqcn + "() constructor threw: " + root);
                root.printStackTrace(System.err);
            }

            System.err.println("[ccxt] dynamicallyCreateInstance returning null — no constructor of " + fqcn + " was invocable");
            return null;

        } catch (ClassNotFoundException cnfe) {
            System.err.println("[ccxt] dynamicallyCreateInstance: class not found: " + fqcn);
            return null;
        } catch (Exception e) {
            System.err.println("[ccxt] dynamicallyCreateInstance: unexpected error for " + fqcn + ": " + e);
            e.printStackTrace(System.err);
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

    /**
     * Helper for typed exchange wrappers: converts a raw List<Object> to a typed List<T>.
     * Used by generated subclasses (e.g., Binance extends BinanceCore) to convert
     * untyped method results into typed return values.
     */
    @SuppressWarnings("unchecked")
    protected static <T> List<T> toTypedList(Object raw, java.util.function.Function<Object, T> ctor) {
        return ((List<Object>) raw).stream().map(ctor).collect(java.util.stream.Collectors.toList());
    }

    /**
     * Mirrors TS Exchange.close() (ts/src/base/Exchange.ts:1537). Tags every
     * tracked WsClient with a typed ExchangeClosedByUser so its in-flight
     * futures reject with that exception (rather than a bare RuntimeException),
     * then closes each client and clears the tracking map. Returns a
     * CompletableFuture so transpiled tests can `.join()` on it the way the
     * TS source `await`s — keeps cross-language test code consistent.
     * Always hand-written: TS source has close() above the transpile delimiter.
     */
    @SuppressWarnings("unchecked")
    public java.util.concurrent.CompletableFuture<Object> close(boolean cleanInstanceData) {
        closeWsClients().join();
        // [WS]
        if (cleanInstanceData) {
            this.cleanWsData();
        }
        // [REST]
        if (cleanInstanceData) {
            this.cleanRestData();
        }
        return java.util.concurrent.CompletableFuture.completedFuture(null);
    }

    public java.util.concurrent.CompletableFuture<Object> close() {
        return close(false);
    }

    @SuppressWarnings("unchecked")
    public java.util.concurrent.CompletableFuture<Object> closeWsClients() {
        Map<String, Object> clientsMap = (Map<String, Object>) this.clients;
        if (clientsMap == null || clientsMap.isEmpty()) {
            return java.util.concurrent.CompletableFuture.completedFuture(null);
        }
        // Snapshot first — close() removes entries from the map and we mustn't
        // iterate while mutating.
        List<Object> snapshot = new ArrayList<>(clientsMap.values());
        Throwable closeReason = new io.github.ccxt.errors.ExchangeClosedByUser(
                this.id + " closedByUser");
        for (Object c : snapshot) {
            if (c instanceof io.github.ccxt.ws.WsClient wsc) {
                wsc.closeReason = closeReason;
                wsc.close();
            }
        }
        clientsMap.clear();
        return java.util.concurrent.CompletableFuture.completedFuture(null);
    }

    // ------------------------------------------------------------------------
    // Untyped async aliases for whitelisted user-facing methods.
    //
    // These exist solely so that transpiled internal code (per-exchange
    // `*Core.java` files) can call `this.fetchBalanceAsync()` etc. and get
    // back a `CompletableFuture<Object>` to chain `.join()` on. The Java
    // transpiler's regex pass in build/javaTranspiler.ts rewrites internal
    // zero-arg calls `this.fetchBalance()` → `this.fetchBalanceAsync()` so
    // they route through the Async path and don't accidentally pick the
    // typed sync overload added by the typed wrapper (which would break
    // the `.join()` chain).
    //
    // REST `*Core.java` doesn't extend the typed wrapper, so the typed
    // Async overloads aren't visible there — these untyped Async aliases
    // on the base class are. For WS `*Core.java` (which extends the typed
    // REST wrapper), Java's overload resolution picks the typed Async
    // (more specific than `Object... varargs`) which also returns a Future
    // and chains `.join()` cleanly with typed return.
    //
    // Canonical list lives in ZERO_REQUIRED_TYPED_WHITELIST
    // (build/generateJavaWrappers.ts) — build/javaTranspiler.ts imports it
    // and `transpileJava` fails loudly if any whitelisted method is missing
    // an alias below.

    // NOTE: async aliases for the 62 trading methods that moved to the Exchange tier
    // (fetchOrders/fetchMyTrades/fetchOpenOrders/fetchClosedOrders/fetchCanceledOrders/
    // fetchTickers/fetchPositions) now live in Exchange.java, since BaseExchange no
    // longer declares those methods. The *Ws variants below stay because their target
    // methods (fetchOrdersWs, ...) remain on BaseExchange.
    public java.util.concurrent.CompletableFuture<Object> fetchBalanceAsync(Object... args) { return fetchBalance(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchTimeAsync(Object... args) { return fetchTime(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchStatusAsync(Object... args) { return fetchStatus(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchAccountsAsync(Object... args) { return fetchAccounts(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchCurrenciesAsync(Object... args) { return fetchCurrencies(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchMarketsAsync(Object... args) { return fetchMarkets(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchBalanceWsAsync(Object... args) { return fetchBalanceWs(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchOrdersWsAsync(Object... args) { return fetchOrdersWs(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchMyTradesWsAsync(Object... args) { return fetchMyTradesWs(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchOpenOrdersWsAsync(Object... args) { return fetchOpenOrdersWs(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchClosedOrdersWsAsync(Object... args) { return fetchClosedOrdersWs(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchTickersWsAsync(Object... args) { return fetchTickersWs(args); }
    public java.util.concurrent.CompletableFuture<Object> fetchPositionsWsAsync(Object... args) { return fetchPositionsWs(args); }

    // ------------------------------------------------------------------------
    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

public Object describe()
    {
        return new java.util.HashMap<String, Object>() {{
            put( "id", BaseExchange.this.id );
            put( "name", BaseExchange.this.name );
            put( "countries", BaseExchange.this.countries );
            put( "enableRateLimit", BaseExchange.this.enableRateLimit );
            put( "rateLimit", BaseExchange.this.rateLimit );
            put( "rateLimiterAlgorithm", BaseExchange.this.rateLimiterAlgorithm );
            put( "timeout", BaseExchange.this.timeout );
            put( "certified", BaseExchange.this.certified );
            put( "pro", BaseExchange.this.pro );
            put( "alias", BaseExchange.this.alias );
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
                put( "fetchADLRank", null );
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
                put( "fetchPositionADLRank", null );
                put( "fetchPositionsADLRank", null );
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
                put( "test", null );
                put( "www", null );
                put( "doc", null );
                put( "api_management", null );
                put( "fees", null );
                put( "referral", null );
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
                put( "info", null );
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

    public void cleanRestData()
    {
        this.ids = null;
        this.markets = null;
        this.markets_by_id = null;
        this.symbols = null;
        this.codes = null;
        this.currencies = this.createSafeDictionary();
        this.currencies_by_id = null;
        this.baseCurrencies = null;
        this.quoteCurrencies = null;
        this.last_http_response = null;
        // this.last_json_response = undefined; // not unified prop
        this.last_response_headers = null;
        this.last_request_headers = null;
    }

    public void cleanWsData()
    {
        this.balance = this.createSafeDictionary(true);
        this.orderbooks = this.createSafeDictionary(true);
        this.tickers = this.createSafeDictionary(true);
        this.liquidations = null;
        this.myLiquidations = null;
        this.orders = null;
        this.trades = this.createSafeDictionary(true);
        this.transactions = this.createSafeDictionary();
        this.ohlcvs = this.createSafeDictionary(true);
        this.myTrades = null;
        this.positions = null;
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

    public Object safeBool2(Object dictionaryOrList, Object key1, Object key2, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract boolean value from dictionary or list
        * @returns {bool | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeValue(dictionaryOrList, key1);
        if (Helpers.isTrue((value instanceof Boolean)))
        {
            return value;
        }
        Object value2 = this.safeValue(dictionaryOrList, key2);
        if (Helpers.isTrue((value2 instanceof Boolean)))
        {
            return value2;
        }
        return defaultValue;
    }

    public Object safeBool(Object dictionaryOrList, Object key, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract boolean value from dictionary or list
        * @returns {bool | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeValue(dictionaryOrList, key, defaultValue);
        if (Helpers.isTrue((value instanceof Boolean)))
        {
            return value;
        }
        return defaultValue;
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
        if (Helpers.isTrue(this.isDictionary(value)))
        {
            return value;
        }
        return defaultValue;
    }

    public Object safeDict(Object dictionaryOrList, Object key, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract a dictionary from dictionary or list
        * @returns {object | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeValue(dictionaryOrList, key, defaultValue);
        if (Helpers.isTrue(Helpers.isEqual(value, null)))
        {
            return defaultValue;
        }
        if (Helpers.isTrue(this.isDictionary(value)))
        {
            return value;
        }
        return defaultValue;
    }

    public Object safeDict2(Object dictionaryOrList, Object key1, Object key2, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description safely extract a dictionary from dictionary or list
        * @returns {object | undefined}
        */
        Object defaultValue = Helpers.getArg(optionalArgs, 0, null);
        Object value = this.safeValue(dictionaryOrList, key1);
        if (Helpers.isTrue(this.isDictionary(value)))
        {
            return value;
        }
        Object value2 = this.safeValue(dictionaryOrList, key2);
        if (Helpers.isTrue(this.isDictionary(value2)))
        {
            return value2;
        }
        return defaultValue;
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
        if (Helpers.isTrue(Helpers.isArray(value)))
        {
            return value;
        }
        return defaultValue;
    }

    public Object isDictionary(Object value)
    {
        return Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(value, null))) && Helpers.isTrue(((value instanceof java.util.Map)))) && !Helpers.isTrue(Helpers.isArray(value));
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
        Object value = this.safeValue(dictionaryOrList, key1);
        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(value, null))) && Helpers.isTrue(Helpers.isArray(value))))
        {
            return value;
        }
        Object value2 = this.safeValue(dictionaryOrList, key2);
        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(value2, null))) && Helpers.isTrue(Helpers.isArray(value2))))
        {
            return value2;
        }
        return defaultValue;
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
        Object value = this.safeValue(dictionaryOrList, key, defaultValue);
        if (Helpers.isTrue(Helpers.isEqual(value, null)))
        {
            return defaultValue;
        }
        if (Helpers.isTrue(Helpers.isArray(value)))
        {
            return value;
        }
        return defaultValue;
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
            Object bidAsk = this.parseOrderBookBidAsk(Helpers.GetValue(deltas, i), priceKey, amountKey, countOrIdKey);
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
        Object keys = Helpers.objectKeys(timeframes);
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
        Object messageHashes = Helpers.objectKeys(client.futures);
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
                // safeValue (not entry[field]) so a missing field is a non-match, not a
                // KeyError in python/php — prediction structures key on outcome, not symbol
                Object entryFiledEqualValue = Helpers.isEqual(this.safeValue(entry, field), value);
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
        return new java.util.HashMap<String, Object>() {{
            put( "url", null );
            put( "method", null );
            put( "headers", null );
            put( "body", null );
        }};
    }

    public java.util.concurrent.CompletableFuture<Object> fetchAccounts(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchAccounts() is not supported yet")) ;
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
            if (Helpers.isTrue(Helpers.isEqual(parsed, null)))
            {
                continue;
            }
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

    public java.util.concurrent.CompletableFuture<Object> watchFundingRates(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchFundingRates() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchFundingRates(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchFundingRates() is not supported yet")) ;
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

    public Object isEmptyString(Object value)
    {
        return !Helpers.isTrue(this.valueIsDefined(value)) || Helpers.isTrue(Helpers.isEqual(value, ""));
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
            put( "windowSize", BaseExchange.this.rollingWindowSize );
            put( "rateLimit", BaseExchange.this.rateLimit );
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
        Object featuresObj = ((Helpers.isTrue((!Helpers.isEqual(subType, null))))) ? Helpers.GetValue(Helpers.GetValue(initialFeatures, ((String)marketType)), subType) : Helpers.GetValue(initialFeatures, ((String)marketType));
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
        Object keys = Helpers.objectKeys(featuresObj);
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
        * @param {string} [methodName] view currently supported methods: https://docs.ccxt.com/README?id=features
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
        * @param {string} [methodName] view currently supported methods: https://docs.ccxt.com/README?id=features
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
                    put( "primary", "ETH" );
                    put( "secondary", "ERC20" );
                    put( "default", "secondary" );
                }} );
                put( "CRO", new java.util.HashMap<String, Object>() {{
                    put( "primary", "CRONOS" );
                    put( "secondary", "CRC20" );
                    put( "default", "secondary" );
                }} );
                put( "TRX", new java.util.HashMap<String, Object>() {{
                    put( "primary", "TRX" );
                    put( "secondary", "TRC20" );
                    put( "default", "secondary" );
                }} );
                put( "BTC", new java.util.HashMap<String, Object>() {{
                    put( "primary", "BTC" );
                    put( "secondary", "BRC20" );
                    put( "default", "primary" );
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
            put( "id", BaseExchange.this.safeString(entry, "id") );
            put( "timestamp", timestamp );
            put( "datetime", BaseExchange.this.iso8601(timestamp) );
            put( "direction", finalDirection );
            put( "account", BaseExchange.this.safeString(entry, "account") );
            put( "referenceId", BaseExchange.this.safeString(entry, "referenceId") );
            put( "referenceAccount", BaseExchange.this.safeString(entry, "referenceAccount") );
            put( "type", BaseExchange.this.safeString(entry, "type") );
            put( "currency", Helpers.GetValue(finalCurrency, "code") );
            put( "amount", BaseExchange.this.parseNumber(finalAmount) );
            put( "before", BaseExchange.this.parseNumber(finalBefore) );
            put( "after", BaseExchange.this.parseNumber(finalAfter) );
            put( "status", BaseExchange.this.safeString(entry, "status") );
            put( "fee", finalFee );
            put( "info", info );
        }};
    }

    public Object safeCurrencyStructure(Object currency)
    {
        // derive data from networks: deposit, withdraw, active, fee, limits, precision
        Object networks = this.safeDict(currency, "networks", new java.util.HashMap<String, Object>() {{}});
        Object keys = Helpers.objectKeys(networks);
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
                put( "precision", BaseExchange.this.precision );
                put( "limits", BaseExchange.this.limits );
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
        this.symbols = Helpers.objectKeys(marketsSortedBySymbol);
        this.ids = Helpers.objectKeys(marketsSortedById);
        Object numCurrencies = 0;
        if (Helpers.isTrue(!Helpers.isEqual(currencies, null)))
        {
            Object keys = Helpers.objectKeys(currencies);
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
                        put( "id", BaseExchange.this.safeString2(market, "baseId", "base") );
                        put( "numericId", BaseExchange.this.safeInteger(market, "baseNumericId") );
                        put( "code", BaseExchange.this.safeString(market, "base") );
                        put( "precision", BaseExchange.this.safeValue2(marketPrecision, "base", "amount", defaultCurrencyPrecision) );
                    }});
                    ((java.util.List<Object>)baseCurrencies).add(currency);
                }
                if (Helpers.isTrue(Helpers.inOp(market, "quote")))
                {
                    Object currency = this.safeCurrencyStructure(new java.util.HashMap<String, Object>() {{
                        put( "id", BaseExchange.this.safeString2(market, "quoteId", "quote") );
                        put( "numericId", BaseExchange.this.safeInteger(market, "quoteNumericId") );
                        put( "code", BaseExchange.this.safeString(market, "quote") );
                        put( "precision", BaseExchange.this.safeValue2(marketPrecision, "quote", "price", defaultCurrencyPrecision) );
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
            Object codes = Helpers.objectKeys(groupedCurrencies);
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
        this.codes = Helpers.objectKeys(currenciesSortedByCode);
        return this.markets;
    }

    public Object setMarketsFromExchange(BaseExchange sourceExchange)
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
        Object extendedRestDescribe = this.deepExtend(((BaseExchange)parentRestInstance).describe(), ((BaseExchange)currentRestInstance).describe());
        Object superWithRestDescribe = this.deepExtend(extendedRestDescribe, wsBaseDescribe);
        return superWithRestDescribe;
    }

    public Object safeBalance(Object balance)
    {
        Object balances = this.omit(balance, new java.util.ArrayList<Object>(java.util.Arrays.asList("info", "timestamp", "datetime", "free", "used", "total")));
        Object codes = Helpers.objectKeys(balances);
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
        Object debtBalanceArray = Helpers.objectKeys(debtBalance);
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
            Object isArray = Helpers.isArray(trades);
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
            put( "id", BaseExchange.this.safeString(order, "id") );
            put( "clientOrderId", BaseExchange.this.safeString(order, "clientOrderId") );
            put( "timestamp", timestamp );
            put( "datetime", finalDatetime );
            put( "symbol", finalSymbol );
            put( "type", BaseExchange.this.safeString(order, "type") );
            put( "side", finalSide );
            put( "lastTradeTimestamp", finalLastTradeTimeTimestamp );
            put( "lastUpdateTimestamp", lastUpdateTimestamp );
            put( "price", BaseExchange.this.parseNumber(finalPrice) );
            put( "amount", BaseExchange.this.parseNumber(finalAmount) );
            put( "cost", BaseExchange.this.parseNumber(finalCost) );
            put( "average", BaseExchange.this.parseNumber(finalAverage) );
            put( "filled", BaseExchange.this.parseNumber(finalFilled) );
            put( "remaining", BaseExchange.this.parseNumber(finalRemaining) );
            put( "timeInForce", finalTimeInForce );
            put( "postOnly", finalPostOnly );
            put( "trades", finalTrades );
            put( "reduceOnly", BaseExchange.this.safeValue(order, "reduceOnly") );
            put( "stopPrice", triggerPrice );
            put( "triggerPrice", triggerPrice );
            put( "takeProfitPrice", takeProfitPrice );
            put( "stopLossPrice", stopLossPrice );
            put( "status", finalStatus );
            put( "fee", BaseExchange.this.safeValue(order, "fee") );
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
        if (Helpers.isTrue(Helpers.isArray(orders)))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(orders)); i++)
            {
                Object parsed = this.parseOrder(Helpers.GetValue(orders, i), market); // don't inline this call
                Object order = this.extend(parsed, parameters);
                ((java.util.List<Object>)results).add(order);
            }
        } else
        {
            Object ids = Helpers.objectKeys(orders);
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
        Object symbol = this.safeString(market, "symbol");
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
            put( "currency", Helpers.GetValue(market, ((String)finalKey)) );
            put( "rate", BaseExchange.this.parseNumber(rate) );
            put( "cost", BaseExchange.this.parseNumber(finalCost) );
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

    public Object addKeyInArrayItems(Object obj, Object keyName)
    {
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object keys = Helpers.objectKeys(obj);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
        {
            Object key = Helpers.GetValue(keys, i);
            Object item = Helpers.GetValue(obj, key);
            if (Helpers.isTrue(Helpers.isEqual(item, null)))
            {
                continue;
            }
            Object itemWithKey = this.extend(new java.util.HashMap<String, Object>() {{}}, item);
            Helpers.addElementToObject(itemWithKey, keyName, key);
            ((java.util.List<Object>)result).add(itemWithKey);
        }
        return result;
    }

    public Object invertFlatStringDictionary(Object dict)
    {
        Object reversed = new java.util.HashMap<String, Object>() {{}};
        Object keys = Helpers.objectKeys(dict);
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

    public Object stringToBase16(Object str)
    {
        return Helpers.add("0x", this.binaryToBase16(this.base64ToBinary(this.stringToBase64(str))));
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
        Object feeValues = Helpers.objectValues(reduced);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(feeValues)); i++)
        {
            Object reducedFeeValues = Helpers.objectValues(Helpers.GetValue(feeValues, i));
            result = this.arrayConcat(result, reducedFeeValues);
        }
        return result;
    }

    public Object safeTicker(Object ticker, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object open = this.omitZero(this.safeString(ticker, "open"));
        Object close = this.omitZero(this.safeString2(ticker, "close", "last"));
        Object change = this.safeString(ticker, "change"); // change can be a legitimate zero on a flat day, do not omitZero it, see https://github.com/ccxt/ccxt/issues/25971
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
            put( "bid", BaseExchange.this.parseNumber(BaseExchange.this.omitZero(BaseExchange.this.safeString(ticker, "bid"))) );
            put( "bidVolume", BaseExchange.this.safeNumber(ticker, "bidVolume") );
            put( "ask", BaseExchange.this.parseNumber(BaseExchange.this.omitZero(BaseExchange.this.safeString(ticker, "ask"))) );
            put( "askVolume", BaseExchange.this.safeNumber(ticker, "askVolume") );
            put( "high", BaseExchange.this.parseNumber(BaseExchange.this.omitZero(BaseExchange.this.safeString(ticker, "high"))) );
            put( "low", BaseExchange.this.parseNumber(BaseExchange.this.omitZero(BaseExchange.this.safeString(ticker, "low"))) );
            put( "open", BaseExchange.this.parseNumber(BaseExchange.this.omitZero(finalOpen)) );
            put( "close", closeParsed );
            put( "last", closeParsed );
            put( "change", BaseExchange.this.parseNumber(finalChange) );
            put( "percentage", BaseExchange.this.parseNumber(finalPercentage) );
            put( "average", BaseExchange.this.parseNumber(finalAverage) );
            put( "vwap", BaseExchange.this.parseNumber(finalVwap) );
            put( "baseVolume", BaseExchange.this.parseNumber(baseVolume) );
            put( "quoteVolume", BaseExchange.this.parseNumber(quoteVolume) );
            put( "previousClose", BaseExchange.this.safeNumber(ticker, "previousClose") );
            put( "indexPrice", BaseExchange.this.safeNumber(ticker, "indexPrice") );
            put( "markPrice", BaseExchange.this.safeNumber(ticker, "markPrice") );
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

    public java.util.concurrent.CompletableFuture<Object> fetchSpotOHLCV(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchSpotOHLCV() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchContractOHLCV(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchContractOHLCV() is not supported yet")) ;
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
                        response = ((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(this, endpointMethod, new Object[] { new java.util.HashMap<String, Object>() {{}} })).join();
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

    public Object parseOrderBookBidsAsks(Object bidasks, Object... optionalArgs)
    {
        Object priceKey = Helpers.getArg(optionalArgs, 0, 0);
        Object amountKey = Helpers.getArg(optionalArgs, 1, 1);
        Object countOrIdKey = Helpers.getArg(optionalArgs, 2, 2);
        bidasks = this.toArray(bidasks);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(bidasks)); i++)
        {
            ((java.util.List<Object>)result).add(this.parseOrderBookBidAsk(Helpers.GetValue(bidasks, i), priceKey, amountKey, countOrIdKey));
        }
        return result;
    }

    public Object filterByKey(Object objects, Object key, Object... optionalArgs)
    {
        Object value = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isEqual(value, null)))
        {
            return objects;
        }
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(objects)); i++)
        {
            Object objectValue = this.safeString(Helpers.GetValue(objects, i), key);
            if (Helpers.isTrue(Helpers.isEqual(objectValue, value)))
            {
                ((java.util.List<Object>)result).add(Helpers.GetValue(objects, i));
            }
        }
        return result;
    }

    public Object filterBySymbol(Object objects, Object... optionalArgs)
    {
        Object symbol = Helpers.getArg(optionalArgs, 0, null);
        return this.filterByKey(objects, "symbol", symbol);
    }

    public Object parseOHLCV(Object ohlcv, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isArray(ohlcv)))
        {
            return new java.util.ArrayList<Object>(java.util.Arrays.asList(this.safeInteger(ohlcv, 0), this.safeNumber(ohlcv, 1), this.safeNumber(ohlcv, 2), this.safeNumber(ohlcv, 3), this.safeNumber(ohlcv, 4), this.safeNumber(ohlcv, 5)));
        }
        return ohlcv;
    }

    public Object safeNetwork(Object network)
    {
        Object withdrawEnabled = this.safeBool(network, "withdraw");
        Object depositEnabled = this.safeBool(network, "deposit");
        Object limits = this.safeDict(network, "limits");
        Object withdraw = this.safeDict(limits, "withdraw");
        Object deposit = this.safeDict(limits, "deposit");
        Object isEnabled = (Helpers.isTrue(withdrawEnabled) && Helpers.isTrue(depositEnabled));
        final Object finalWithdrawEnabled = withdrawEnabled;
        return new java.util.HashMap<String, Object>() {{
            put( "info", Helpers.GetValue(network, "info") );
            put( "id", BaseExchange.this.safeString(network, "id") );
            put( "name", BaseExchange.this.safeString(network, "name") );
            put( "network", BaseExchange.this.safeString(network, "network") );
            put( "active", BaseExchange.this.safeBool(network, "active", isEnabled) );
            put( "deposit", depositEnabled );
            put( "withdraw", finalWithdrawEnabled );
            put( "fee", BaseExchange.this.safeNumber(network, "fee") );
            put( "precision", BaseExchange.this.safeNumber(network, "precision") );
            put( "limits", new java.util.HashMap<String, Object>() {{
                put( "withdraw", new java.util.HashMap<String, Object>() {{
                    put( "min", BaseExchange.this.safeNumber(withdraw, "min") );
                    put( "max", BaseExchange.this.safeNumber(withdraw, "max") );
                }} );
                put( "deposit", new java.util.HashMap<String, Object>() {{
                    put( "min", BaseExchange.this.safeNumber(deposit, "min") );
                    put( "max", BaseExchange.this.safeNumber(deposit, "max") );
                }} );
            }} );
        }};
    }

    public Object prioritizedNetworkAliases(Object... optionalArgs)
    {
        /**
        * @method
        * @name Exchange#prioritizedNetworkAliases
        * @description returns the chain pair [preferred, alternative] for the given networkCode & currency, e.g:
        *   ---------------------------------
        *   | input          | output       |
        *   --------------------------------|
        *   | ETH & USDC     | ERC20, ETH   |
        *   | ERC20 & USDC   | ERC20, ETH   |
        *   | ETH & ETH      | ETH, ERC20   |
        *   | ERC20 & ETH    | ETH, ERC20   |
        *   | ERC20          | ERC20, ETH   |
        *   | ETH            | ERC20, ETH   |
        *   ---------------------------------
        * @param {string} networkCode unified network-code
        * @param {string} currencyCode unified currency-code
        * @param {boolean} allowDefault when currencyCode is undefined, order by replacement's "default" instead of by user input
        * @returns {string[]} [preferredChain, alternativeChain]
        */
        Object networkCode = Helpers.getArg(optionalArgs, 0, null);
        Object currencyCode = Helpers.getArg(optionalArgs, 1, null);
        Object allowDefault = Helpers.getArg(optionalArgs, 2, false);
        if (Helpers.isTrue(Helpers.isEqual(networkCode, null)))
        {
            return null;
        }
        Object replacements = this.safeDict(this.options, "defaultNetworkCodeReplacements", new java.util.HashMap<String, Object>() {{}});
        Object keys = Helpers.objectKeys(replacements);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
        {
            Object baseCoin = Helpers.GetValue(keys, i);
            Object entry = Helpers.GetValue(replacements, baseCoin);
            Object primary = Helpers.GetValue(entry, "primary");
            Object secondary = Helpers.GetValue(entry, "secondary");
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(networkCode, primary)) && Helpers.isTrue(!Helpers.isEqual(networkCode, secondary))))
            {
                continue;
            }
            // pick which form goes first in the returned pair
            Object preferPrimary = false;
            if (Helpers.isTrue(Helpers.isEqual(currencyCode, baseCoin)))
            {
                preferPrimary = true; // mainnet currency uses primary chain
            } else if (Helpers.isTrue(!Helpers.isEqual(currencyCode, null)))
            {
                preferPrimary = false; // any other (token) currency uses secondary chain
            } else if (Helpers.isTrue(allowDefault))
            {
                preferPrimary = (Helpers.isEqual(Helpers.GetValue(entry, "default"), "primary"));
            } else
            {
                preferPrimary = (Helpers.isEqual(networkCode, primary)); // keep user input first
            }
            return ((Helpers.isTrue((preferPrimary)))) ? new java.util.ArrayList<Object>(java.util.Arrays.asList(primary, secondary)) : new java.util.ArrayList<Object>(java.util.Arrays.asList(secondary, primary));
        }
        return new java.util.ArrayList<Object>(java.util.Arrays.asList(networkCode, networkCode));
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
        Object networkIdsByCodes = this.safeDict(this.options, "networks", new java.util.HashMap<String, Object>() {{}});
        // try the preferred form first, fall back to its alternative (e.g. when only 'ETH' or only 'ERC20' is defined)
        var preferredChainalternativeChainVariable = this.prioritizedNetworkAliases(networkCode, currencyCode, false);
        var preferredChain = ((java.util.List<Object>) preferredChainalternativeChainVariable).get(0);
        var alternativeChain = ((java.util.List<Object>) preferredChainalternativeChainVariable).get(1);
        Object networkId = this.safeString2(networkIdsByCodes, preferredChain, alternativeChain);
        if (Helpers.isTrue(!Helpers.isEqual(networkId, null)))
        {
            return networkId;
        }
        // fall back to scanning loaded currencies
        Object currenciesToCheck = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        if (Helpers.isTrue(Helpers.isEqual(currencyCode, null)))
        {
            currenciesToCheck = Helpers.objectKeys(this.currencies);
        } else
        {
            currenciesToCheck = new java.util.ArrayList<Object>(java.util.Arrays.asList(this.safeDict(this.currencies, currencyCode)));
        }
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(currenciesToCheck)); i++)
        {
            Object networks = this.safeDict(Helpers.GetValue(currenciesToCheck, i), "networks", new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.inOp(networks, networkCode)))
            {
                return this.safeString(Helpers.GetValue(networks, networkCode), "id");
            }
        }
        return networkCode;
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
        var preferredChainalternativeChainVariable = this.prioritizedNetworkAliases(networkCode, currencyCode, true);
        var preferredChain = ((java.util.List<Object>) preferredChainalternativeChainVariable).get(0);
        var alternativeChain = ((java.util.List<Object>) preferredChainalternativeChainVariable).get(1);
        // when the exchange explicitly defines both forms in options.networks (e.g. BTC + BRC20),
        // it disambiguates them — trust the direct id→code inversion instead of guessing
        if (Helpers.isTrue(Helpers.isEqual(currencyCode, null)))
        {
            Object networkIdsByCodes = this.safeDict(this.options, "networks", new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue((Helpers.inOp(networkIdsByCodes, preferredChain))) && Helpers.isTrue((Helpers.inOp(networkIdsByCodes, alternativeChain)))))
            {
                return networkCode;
            }
        }
        return preferredChain;
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
        Object availableNetworkIds = Helpers.objectKeys(indexedNetworkEntries);
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
        Object bids = this.parseOrderBookBidsAsks(this.safeValue(orderbook, bidsKey, new java.util.ArrayList<Object>(java.util.Arrays.asList())), priceKey, amountKey, countOrIdKey);
        Object asks = this.parseOrderBookBidsAsks(this.safeValue(orderbook, asksKey, new java.util.ArrayList<Object>(java.util.Arrays.asList())), priceKey, amountKey, countOrIdKey);
        return new java.util.HashMap<String, Object>() {{
            put( "symbol", symbol );
            put( "bids", BaseExchange.this.sortBy(bids, 0, true) );
            put( "asks", BaseExchange.this.sortBy(asks, 0) );
            put( "timestamp", timestamp );
            put( "datetime", BaseExchange.this.iso8601(timestamp) );
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
        if (Helpers.isTrue(Helpers.isArray(response)))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(response)); i++)
            {
                Object item = Helpers.GetValue(response, i);
                Object id = ((Helpers.isTrue((Helpers.isEqual(marketIdKey, null))))) ? null : this.safeString(item, marketIdKey);
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
            Object keys = Helpers.objectKeys(response);
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
        Object unrealizedPnlString = this.safeString(position, "unrealizedPnl");
        Object initialMarginString = this.safeString(position, "initialMargin");
        //
        // PERCENTAGE
        //
        Object percentage = this.safeValue(position, "percentage");
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(percentage, null))) && Helpers.isTrue((!Helpers.isEqual(unrealizedPnlString, null)))) && Helpers.isTrue((!Helpers.isEqual(initialMarginString, null)))))
        {
            // as it was done in all implementations ( aax, btcex, bybit, deribit, gate, kucoinfutures, phemex )
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

    public Object parseADLRank(Object info, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parseADLRank() is not supported yet")) ;
    }

    public Object parseADLRanks(Object ranks, Object... optionalArgs)
    {
        Object symbols = Helpers.getArg(optionalArgs, 0, null);
        Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
        symbols = this.marketSymbols(symbols);
        ranks = this.toArray(ranks);
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(ranks)); i++)
        {
            Object rank = this.extend(this.parseADLRank(Helpers.GetValue(ranks, i)), parameters);
            ((java.util.List<Object>)result).add(rank);
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
        Object symbol = this.safeString(market, "symbol");
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
            if (Helpers.isTrue(Helpers.isArray(itemOrItems)))
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
        if (!Helpers.isTrue(Helpers.isArray(objects)))
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

    public Object filterOutByArray(Object objects, Object key, Object... optionalArgs)
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
            if (!Helpers.isTrue(this.inArray(Helpers.GetValue(Helpers.GetValue(objects, i), key), values)))
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
            Object fetchData = null;
            Object fetchDataCacheEnabled = Helpers.isGreaterThan(this.fetchHistoryCacheSize, 0);
            for (var i = 0; Helpers.isLessThan(i, Helpers.add(retries, 1)); i++)
            {
                if (Helpers.isTrue(fetchDataCacheEnabled))
                {
                    fetchData = new java.util.HashMap<String, Object>() {{
                        put( "request", null );
                        put( "response", new java.util.HashMap<String, Object>() {{
                            put( "body", null );
                        }} );
                        put( "error", null );
                    }};
                }
                try
                {
                    this.setLastRestRequestTimestamp();
                    Object request = this.sign(path, api, method, parameters, headers, body);
                    if (Helpers.isTrue(fetchDataCacheEnabled))
                    {
                        Helpers.addElementToObject(fetchData, "request", request);
                    }
                    this.setLastRequest(request);
                    Object response = (this.fetch(Helpers.GetValue(request, "url"), Helpers.GetValue(request, "method"), Helpers.GetValue(request, "headers"), Helpers.GetValue(request, "body"))).join();
                    if (Helpers.isTrue(fetchDataCacheEnabled))
                    {
                        Helpers.addElementToObject(Helpers.GetValue(fetchData, "response"), "body", response);
                        this.addFetchCache(fetchData);
                    }
                    return response;
                } catch(Exception e)
                {
                    if (Helpers.isTrue(fetchDataCacheEnabled))
                    {
                        Helpers.addElementToObject(fetchData, "error", e);
                        this.addFetchCache(fetchData);
                    }
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

    public Object parseOrderBookBidAsk(Object bidask, Object... optionalArgs)
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
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(currencyId, null))) && Helpers.isTrue((!Helpers.isEqual(this.currencies_by_id, null)))) && Helpers.isTrue((Helpers.inOp(this.currencies_by_id, currencyId)))) && Helpers.isTrue((!Helpers.isEqual(Helpers.GetValue(this.currencies_by_id, currencyId), null)))))
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
        final Object finalMarketId_2 = marketId;
        return this.safeMarketStructure(new java.util.HashMap<String, Object>() {{
            put( "symbol", finalMarketId_2 );
            put( "marketId", finalMarketId_2 );
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
        Object keys = Helpers.objectKeys(this.requiredCredentials);
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
        Object keys = Helpers.objectKeys(broad);
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

    public java.util.concurrent.CompletableFuture<Object> fetchSpotTickers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchSpotTickers() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchContractTickers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchContractTickers() is not supported yet")) ;
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
            throw new NotSupported((String)Helpers.add(this.id, " fetchTickersWs() is not supported yet")) ;
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

    public java.util.concurrent.CompletableFuture<Object> unWatchTickers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchTickers() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> unWatchFundingRate(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " unWatchFundingRate() is not supported yet")) ;
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

    public java.util.concurrent.CompletableFuture<Object> createTwapOrder(Object symbol, Object side, Object amount, Object duration, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createTwapOrder() is not supported yet")) ;
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

    public java.util.concurrent.CompletableFuture<Object> fetchADLRank(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchADLRank() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsADLRank(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPositionsADLRank() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionADLRank(Object symbol2, Object... optionalArgs)
    {
        final Object symbol3 = symbol2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = symbol3;
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchPositionsADLRank")))
            {
                (this.loadMarkets()).join();
                Object market = this.market(symbol);
                symbol = Helpers.GetValue(market, "symbol");
                Object ranks = (this.fetchPositionsADLRank(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol)), parameters)).join();
                Object rank = this.safeDict(ranks, 0);
                if (Helpers.isTrue(Helpers.isEqual(rank, null)))
                {
                    throw new NullResponse((String)Helpers.add(Helpers.add(this.id, " fetchPositionsADLRank() could not find a rank for "), symbol)) ;
                } else
                {
                    return rank;
                }
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchPositionsADLRank() is not supported yet")) ;
            }
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
            final Object finalTriggerPrice = triggerPrice;
            parameters = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "triggerPrice", finalTriggerPrice );
            }});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createTriggerOrderWs")))
            {
                return (this.createOrderWs(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createTriggerOrderWs() is not supported yet")) ;
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
            final Object finalStopLossPrice = stopLossPrice;
            parameters = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopLossPrice", finalStopLossPrice );
            }});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createStopLossOrderWs")))
            {
                return (this.createOrderWs(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createStopLossOrderWs() is not supported yet")) ;
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
            final Object finalTakeProfitPrice = takeProfitPrice;
            parameters = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "takeProfitPrice", finalTakeProfitPrice );
            }});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "createTakeProfitOrderWs")))
            {
                return (this.createOrderWs(symbol, type, side, amount, price, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createTakeProfitOrderWs() is not supported yet")) ;
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

    public java.util.concurrent.CompletableFuture<Object> createSpotOrders(Object orders, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createSpotOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createContractOrders(Object orders, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createContractOrders() is not supported yet")) ;
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

    public java.util.concurrent.CompletableFuture<Object> cancelSpotOrder(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelSpotOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelContractOrder(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelContractOrder() is not supported yet")) ;
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

    public java.util.concurrent.CompletableFuture<Object> cancelOrdersWs(Object ids, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelAllSpotOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelAllSpotOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelAllContractOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelAllContractOrders() is not supported yet")) ;
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
                    Object keys = Helpers.objectKeys(addressStructures);
                    Object key = Helpers.GetValue(keys, 0);
                    return this.safeDict(addressStructures, key);
                }
            } else
            {
                throw new NotSupported((String)Helpers.add(this.id, " fetchDepositAddress() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchContractDepositAddress(Object code, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchContractDepositAddress() is not supported yet")) ;
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
        Object keys = Helpers.objectKeys(this.currencies);
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
                if (Helpers.isTrue(Helpers.GetValue(market, ((String)defaultType))))
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
        if (Helpers.isTrue(this.isDictionary(tag)))
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

    public java.util.concurrent.CompletableFuture<Object> createLimitOrderWs(Object symbol, Object side, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, "limit", side, amount, price, parameters)).join();
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

    public java.util.concurrent.CompletableFuture<Object> createLimitBuyOrderWs(Object symbol, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, "limit", "buy", amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitSellOrderWs(Object symbol, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, "limit", "sell", amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketBuyOrderWs(Object symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, "market", "buy", amount, null, parameters)).join();
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
        return this.decimalToPrecision(cost, TRUNCATE, this.safeString2(Helpers.GetValue(market, "precision"), "cost", "price"), this.precisionMode, this.paddingMode);
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
            put( "hostname", BaseExchange.this.hostname );
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
        if (Helpers.isTrue(Helpers.isArray(pricesData)))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(pricesData)); i++)
            {
                Object priceData = this.extend(this.parseLastPrice(Helpers.GetValue(pricesData, i)), parameters);
                ((java.util.List<Object>)results).add(priceData);
            }
        } else
        {
            Object marketIds = Helpers.objectKeys(pricesData);
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
        if (Helpers.isTrue(Helpers.isArray(tickers)))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(tickers)); i++)
            {
                Object parsedTicker = this.parseTicker(Helpers.GetValue(tickers, i));
                Object ticker = this.extend(parsedTicker, parameters);
                ((java.util.List<Object>)results).add(ticker);
            }
        } else
        {
            Object marketIds = Helpers.objectKeys(tickers);
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
            Helpers.addElementToObject(result, ((String)symbol), borrowRate);
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
        Object isArray = Helpers.isArray(response);
        Object responseKeys = response;
        if (!Helpers.isTrue(isArray))
        {
            responseKeys = Helpers.objectKeys(response);
        }
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(responseKeys)); i++)
        {
            Object entry = Helpers.GetValue(responseKeys, i);
            Object dictionary = ((Helpers.isTrue(isArray))) ? entry : Helpers.GetValue(response, entry);
            Object currencyId = entry;
            if (Helpers.isTrue(isArray))
            {
                currencyId = ((Helpers.isTrue((Helpers.isEqual(currencyIdKey, null))))) ? null : this.safeString(dictionary, currencyIdKey);
            }
            Object currency = this.safeCurrency(currencyId);
            Object code = this.safeString(currency, "code");
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(codes, null))) || Helpers.isTrue((this.inArray(code, codes)))))
            {
                Helpers.addElementToObject(depositWithdrawFees, ((String)code), this.parseDepositWithdrawFee(dictionary, currency));
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
        Object networkKeys = Helpers.objectKeys(Helpers.GetValue(fee, "networks"));
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

    public Object filterByArrayADLRanks(Object objects, Object key, Object... optionalArgs)
    {
        /**
        * @ignore
        * @method
        * @description Typed wrapper for filterByArray that returns a list of ADL Ranks
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
                        Object response = ((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(this, method, new Object[] { symbol, null, maxEntriesPerRequest, parameters })).join();
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
                        Object response = ((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(this, method, new Object[] { symbol, paginationTimestamp, maxEntriesPerRequest, parameters })).join();
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
                        paginationTimestamp = Helpers.add(this.safeInteger(last, "timestamp", 0), 1);
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
            Object sortedRes = this.sortBy(uniqueResults, key);
            return this.filterBySinceLimit(sortedRes, since, limit, key);
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
                        return ((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(this, method, new Object[] { symbol, timeframe, since, limit, parameters })).join();
                    } else
                    {
                        return ((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(this, method, new Object[] { symbol, since, limit, parameters })).join();
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
                        Helpers.addElementToObject(parameters, ((String)cursorSent), cursorValue);
                    }
                    Object response = null;
                    if (Helpers.isTrue(Helpers.isEqual(method, "fetchAccounts")))
                    {
                        response = ((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(this, method, new Object[] { parameters })).join();
                    } else if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(method, "getLeverageTiersPaginated")) || Helpers.isTrue(Helpers.isEqual(method, "fetchPositions"))))
                    {
                        response = ((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(this, method, new Object[] { symbol, parameters })).join();
                    } else if (Helpers.isTrue(Helpers.isEqual(method, "fetchOpenInterestHistory")))
                    {
                        response = ((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(this, method, new Object[] { symbol, timeframe, since, maxEntriesPerRequest, parameters })).join();
                    } else
                    {
                        response = ((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(this, method, new Object[] { symbol, since, maxEntriesPerRequest, parameters })).join();
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
                        Object cursor = ((Helpers.isTrue((Helpers.isEqual(cursorReceived, null))))) ? null : this.safeValue(info, cursorReceived);
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
                    Helpers.addElementToObject(parameters, ((String)pageKey), Helpers.add(i, 1));
                    Object response = ((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(this, method, new Object[] { symbol, since, maxEntriesPerRequest, parameters })).join();
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
        Object values = Helpers.objectValues(uniqueResult);
        return values;
    }

    public Object removeKeysFromDict(Object dict, Object removeKeys)
    {
        Object keys = Helpers.objectKeys(dict);
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
            put( "baseVolume", BaseExchange.this.safeNumber(interest, "baseVolume") );
            put( "quoteVolume", BaseExchange.this.safeNumber(interest, "quoteVolume") );
            put( "openInterestAmount", BaseExchange.this.safeNumber(interest, "openInterestAmount") );
            put( "openInterestValue", BaseExchange.this.safeNumber(interest, "openInterestValue") );
            put( "timestamp", BaseExchange.this.safeInteger(interest, "timestamp") );
            put( "datetime", BaseExchange.this.safeString(interest, "datetime") );
            put( "info", BaseExchange.this.safeValue(interest, "info") );
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
        if (Helpers.isTrue(Helpers.isArray(greeks)))
        {
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(greeks)); i++)
            {
                Object parsedTicker = this.parseGreeks(Helpers.GetValue(greeks, i));
                Object greek = this.extend(parsedTicker, parameters);
                ((java.util.List<Object>)results).add(greek);
            }
        } else
        {
            Object marketIds = Helpers.objectKeys(greeks);
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
            Object currencyId = ((Helpers.isTrue((Helpers.isEqual(currencyKey, null))))) ? null : this.safeString(info, currencyKey);
            Object currency = this.safeCurrency(currencyId);
            Object marketId = ((Helpers.isTrue((Helpers.isEqual(symbolKey, null))))) ? null : this.safeString(info, symbolKey);
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
            Object marketId = ((Helpers.isTrue((Helpers.isEqual(symbolKey, null))))) ? null : this.safeString(info, symbolKey);
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
            Object marketId = ((Helpers.isTrue((Helpers.isEqual(symbolKey, null))))) ? null : this.safeString(info, symbolKey);
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
            Object fromId = ((Helpers.isTrue((Helpers.isEqual(fromCurrencyKey, null))))) ? null : this.safeString(entry, fromCurrencyKey);
            Object toId = ((Helpers.isTrue((Helpers.isEqual(toCurrencyKey, null))))) ? null : this.safeString(entry, toCurrencyKey);
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

    public java.util.concurrent.CompletableFuture<Object> loadMarketsAndSignIn()
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            (Helpers.promiseAll(new java.util.ArrayList<Object>(java.util.Arrays.asList(this.loadMarkets(), this.signIn())))).join();
            return null;
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
            Object marketId = ((Helpers.isTrue((Helpers.isEqual(symbolKey, null))))) ? null : this.safeString(info, symbolKey);
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
            Object clientSubscriptions = Helpers.objectKeys(client.subscriptions);
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(clientSubscriptions)); i++)
            {
                Object sub = Helpers.GetValue(clientSubscriptions, i);
                if (Helpers.isTrue(((String)sub).startsWith(((String)subHash))))
                {
                    ((java.util.Map<String,Object>)client.subscriptions).remove((String)sub);
                }
            }
            Object clientFutures = Helpers.objectKeys(client.futures);
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
                    if (Helpers.isTrue(Helpers.inOp(Helpers.GetValue(this.ohlcvs, ((String)symbol)), timeframe)))
                    {
                        ((java.util.Map<String,Object>)Helpers.GetValue(this.ohlcvs, ((String)symbol))).remove((String)((String)timeframe));
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
                Object clients = Helpers.objectValues(this.clients);
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
                Object tickerSymbols = Helpers.objectKeys(this.tickers);
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
                Object bidsaskSymbols = Helpers.objectKeys(this.bidsasks);
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

    public Object timeframeFromMilliseconds(Object ms)
    {
        if (Helpers.isTrue(Helpers.isLessThanOrEqual(ms, 0)))
        {
            return "";
        }
        Object second = 1000;
        Object minute = Helpers.multiply(60, second);
        Object hour = Helpers.multiply(60, minute);
        Object day = Helpers.multiply(24, hour);
        Object week = Helpers.multiply(7, day);
        if (Helpers.isTrue(Helpers.isEqual(Helpers.mod(ms, week), 0)))
        {
            return Helpers.add((Helpers.divide(ms, week)), "w");
        }
        if (Helpers.isTrue(Helpers.isEqual(Helpers.mod(ms, day), 0)))
        {
            return Helpers.add((Helpers.divide(ms, day)), "d");
        }
        if (Helpers.isTrue(Helpers.isEqual(Helpers.mod(ms, hour), 0)))
        {
            return Helpers.add((Helpers.divide(ms, hour)), "h");
        }
        if (Helpers.isTrue(Helpers.isEqual(Helpers.mod(ms, minute), 0)))
        {
            return Helpers.add((Helpers.divide(ms, minute)), "m");
        }
        if (Helpers.isTrue(Helpers.isEqual(Helpers.mod(ms, second), 0)))
        {
            return Helpers.add((Helpers.divide(ms, second)), "s");
        }
        return "";
    }

    public java.util.concurrent.CompletableFuture<Object> isUTAEnabled(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return false;  // stub
        });

    }
}
