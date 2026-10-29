namespace ccxt;

using System.Collections.Concurrent;

using dict = Dictionary<string, object>;
using list = List<object>;

public partial class BaseExchange
{
    public HttpClient httpClient { get; set; }
    public object fetchResponse = null; // tmp for response tests
    // response-test mock keyed by url fragment, for methods that call several endpoints
    public object fetchResponseByUrl = null;
    public string id { get; set; } = "Exchange";

    public string[] countries = null;
    public bool certified = false;
    public bool pro = false;

    public bool alias { get; set; } = false;

    public string version { get; set; } = "";
    public string userAgent { get; set; }
    public bool verbose { get; set; } = true;
    public bool enableRateLimit { get; set; } = true;
    public double rollingWindowSize { get; set; } = 0.0;  // set to 0.0 to use leaky bucket rate limiter
    public string rateLimiterAlgorithm { get; set; } = "leakyBucket";
    public long lastRestRequestTimestamp { get; set; } = 0;
    public string url { get; set; } = "";

    public string hostname { get; set; } = "";

    public IDictionary<string, object> baseCurrencies { get; set; } = null;

    public bool reloadingMarkets { get; set; } = false;

    public Task<IDictionary<string, object>> marketsLoading { get; set; } = null;

    public IDictionary<string, object> quoteCurrencies { get; set; } = null;

    public Dictionary<string, object> api { get; set; } = new dict();

    public Dictionary<string, object> transformedApi { get; set; } = new dict();

    public bool reduceFees { get; set; } = true;

    public IDictionary<string, object> markets_by_id { get; set; } = null;

    public List<object> symbols { get; set; } = null;

    public List<object> codes { get; set; } = null;

    public List<object> ids { get; set; } = null;

    public bool substituteCommonCurrencyCodes { get; set; } = true;

    public Dictionary<string, object> commonCurrencies { get; set; } = new dict();

    public object limits { get; set; } = new dict();

    public object precisionMode { get; set; } = DECIMAL_PLACES;

    public IDictionary<string, object> currencies_by_id { get; set; } = null;

    public List<object> accounts { get; set; } = new List<object>();

    public object accountsById { get; set; } = null;

    public object status { get; set; } = new dict();

    public int paddingMode { get; set; } = NO_PADDING;

    public object number { get; set; } = typeof(float);
    public Dictionary<string, object> has { get; set; } = new dict();
    public Dictionary<string, object> features { get; set; }
    // options: read the published snapshot, mutate through the config owner (OwnedTable)
    public ccxt.pro.OwnedTable<object> options { get; set; } = new ccxt.pro.OwnedTable<object>();
    public bool isSandboxModeEnabled { get; set; } = false;

    public IDictionary<string, object> markets { get; set; } = null;
    public object currencies { get; set; } = new dict();
    public IDictionary<string, object> fees { get; set; } = new dict();
    public IDictionary<string, object> requiredCredentials { get; set; } = new dict();
    public Dictionary<string, object> timeframes { get; set; } = null;
    public double rateLimit { get; set; } = 2000;
    public IDictionary<string, object> exceptions { get; set; } = new dict();
    public IDictionary<string, object> urls { get; set; } = new dict();

    // urls['api'] is a Dict in the TS base declaration (`urls: { api: Dict }`), and every write of
    // it stores a section dictionary, so this view is the dictionary itself.
    public IDictionary<string, object> urlsApi
    {
        get
        {
            var sections = this.urls;
            if (sections == null || !sections.ContainsKey("api"))
            {
                return null;
            }
            return sections["api"] as IDictionary<string, object>;
        }
    }
    // urls['api'] entries that are themselves dictionaries, so urlsApi['ws'] indexes as a map.
    // urls is written at config time only; RefreshUrlsViews re-derives this at every such write.
    public Dictionary<string, IDictionary<string, object>> urlsApiSections { get; private set; } = new Dictionary<string, IDictionary<string, object>>();

    public void RefreshUrlsViews()
    {
        var api = this.urlsApi;
        var sections = new Dictionary<string, IDictionary<string, object>>();
        if (api != null)
        {
            foreach (var entry in api)
            {
                var section = entry.Value as IDictionary<string, object>;
                if (section != null)
                {
                    sections[entry.Key] = section;
                }
            }
        }
        this.urlsApiSections = sections;
    }
    // currencies stays `object` (cs/tests/Generated/TestMethods.cs assigns a boxed local into it),
    // but every writer stores a string-keyed dictionary: this view is that dictionary.
    public IDictionary<string, object> currenciesDict
    {
        get
        {
            return this.currencies as IDictionary<string, object>;
        }
    }
    public Dictionary<string, object> precision { get; set; } = null;

    public string apiKey { get; set; }
    public string secret { get; set; }
    public string password { get; set; }
    public string uid { get; set; }
    public string accountId { get; set; }
    public string login { get; set; }
    public string privateKey { get; set; }
    public string walletAddress { get; set; }
    public object token { get; set; }
    public string twofa { get; set; }

    public int minFundingAddressLength { get; set; } = 1;
    public Dictionary<string, object> networkAliases { get; set; } = new Dictionary<string, object>() { { "ETH", "ERC20" }, { "TRX", "TRC20" }, { "BSC", "BEP20" }, { "BSC20", "BEP20" }, { "CRONOS", "CRC20" }, { "ARB", "ARBITRUM" }, { "ARBONE", "ARBITRUM" }, { "ARBNOVA", "ARBITRUM_NOVA" } };

    public Dictionary<string, object> userAgents { get; set; } = new dict(){
        {"chrome", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"},
        {"chrome39","Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"},
        {"chrome100","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"}
    };
    public string proxy { get; set; }
    public string agent { get; set; }
    public object timeout { get; set; } = 10000;

    public object last_response_headers { get; set; }
    public object last_request_headers { get; set; }
    public object last_json_response { get; set; }
    public object last_http_response { get; set; }

    private object lastReqBody = null;
    public object last_request_body
    {
        get
        {
            return lastReqBody;
        }
        set
        {
            if (value is Dictionary<string, object> && ((dict)value).Keys.Count == 0)
            {
                lastReqBody = null;
            }
            else
            {
                lastReqBody = value;
            }
        }
    }
    public object last_request_url { get; set; }

    public readonly ccxt.pro.OwnedHistory<Dictionary<string, object>> fetchHistoryCache = new ();

    public int fetchHistoryCacheSize = 0;

    public float MAX_VALUE = float.MaxValue;

    public object name { get; set; }

    public IDictionary<string, object> headers { get; set; } = new dict();
    public bool returnResponseHeaders { get; set; } = false;

    public Dictionary<string, object> httpExceptions { get; set; } = new dict();

    public Dictionary<string, object> tokenBucket { get; set; } = new dict();
    public Throttler throttler { get; set; }

    public object proxyUrl { get; set; } = null;
    public object proxy_url { get; set; } = null;

    public Func<object, object, object, object> proxyUrlCallback { get; set; } = null;
    public Func<object, object, object, object> proxy_url_callback { get; set; } = null;

    // public object httpProxy { get; set; } = null;
    public object http_proxy { get; set; } = null;
    public Func<object, object, object, object, object> httpProxyCallback { get; set; } = null;
    public Func<object, object, object, object, object> httpsProxyCallback { get; set; } = null;
    public Func<object, object, object, object, object> http_proxy_callback { get; set; } = null;
    public Func<object, object, object, object, object> https_proxy_callback { get; set; } = null;
    // public object httpsProxy { get; set; } = null;
    public object https_proxy { get; set; } = null;

    public object socksProxy { get; set; } = null;
    public object socks_proxy { get; set; } = null;

    public object wsSocksProxy { get; set; } = null;
    public object ws_socks_proxy { get; set; } = null;

    public Func<object, object, object, object> socksProxyCallback { get; set; } = null;
    public Func<object, object, object, object> socks_proxy_callback { get; set; } = null;

    // WS options

    // WS caches. Each is a plain dictionary owned by this exchange's ws owner thread
    // (see ccxt.WsOwner): the owner-routed view hands every member call over to it, and
    // a store of a fresh dictionary re-wraps rather than dropping the facade.
    private IDictionary<string, object> tickersState = new ccxt.pro.OwnedMap();
    private IDictionary<string, object> fundingRatesState = new ccxt.pro.OwnedMap();
    private IDictionary<string, object> bidsasksState = new ccxt.pro.OwnedMap();

    public IDictionary<string, object> tickers
    {
        get { return this.tickersState; }
        set { this.tickersState = this.wrapWsCache(value); }
    }

    public IDictionary<string, object> fundingRates
    {
        get { return this.fundingRatesState; }
        set { this.fundingRatesState = this.wrapWsCache(value); }
    }

    public IDictionary<string, object> bidsasks
    {
        get { return this.bidsasksState; }
        set { this.bidsasksState = this.wrapWsCache(value); }
    }

    public object transactions = new dict();
    // ws caches: always an ArrayCache subclass or null (every writer in cs/**, bitstamp's
    // pruneCachedBySymbols included). positions stays `object` — five venues store the
    // account-type-keyed Dictionary there.
    public ccxt.pro.ArrayCache myTrades;
    public ccxt.pro.ArrayCache orders;
    public object triggerOrders;
    // a plain dict: safeBalance hands the merged balance back by reference and every
    // ws balance handler stores that return value, so a concurrent map type is not kept
    public IDictionary<string, object> balance = new Dictionary<string, object>() {};

    public bool newUpdates;

    public object positions;
    public ccxt.pro.ArrayCache liquidations;
    public object myLiquidations;
    private IDictionary<string, object> tradesState = new ccxt.pro.OwnedMap();
    private IDictionary<string, object> orderbooksState = new ccxt.pro.OwnedMap();

    public IDictionary<string, object> trades
    {
        get { return this.tradesState; }
        set { this.tradesState = this.wrapWsCache(value); }
    }

    public IDictionary<string, object> orderbooks
    {
        get { return this.orderbooksState; }
        set { this.orderbooksState = this.wrapWsCache(value); }
    }

    private IDictionary<string, object> ohlcvsState = new ccxt.pro.OwnedMap();

    public IDictionary<string, object> ohlcvs
    {
        get { return this.ohlcvsState; }
        set { this.ohlcvsState = this.wrapWsCache(value); }
    }
    public object wssProxy { get; set; } = null;
    public object wss_proxy { get; set; } = null;

    public object wsProxy { get; set; } = null;
    public object ws_proxy { get; set; } = null;

    public Dictionary<string, object> streaming { get; set; } = new dict();

    private string httpProxyValue = "";
    public object httpProxy
    {
        get
        {
            return this.httpProxyValue;
        }
        set
        {
            httpProxyValue = value as string;
            this.initHttpClient(); // recreate httpClient with new proxy, maybe find a better way to do this
        }
    }

    private string httpsProxyValue = "";
    public object httpsProxy
    {
        get
        {
            return this.httpsProxyValue;
        }
        set
        {
            httpsProxyValue = value as string;
            this.initHttpClient(); // recreate httpClient with new proxy, maybe find a better way to do this
        }
    }

    void initializeProperties(Dictionary<string, object> userConfig = null)
    {
        var properties = this.describe();

        var extendedProperties = this.deepExtend(properties, userConfig);

        this.version = SafeString(extendedProperties, "version", null);

        // credentials initis
        this.requiredCredentials = SafeValue(extendedProperties, "requiredCredentials") as dict;

        this.apiKey = SafeString(extendedProperties, "apiKey", null);
        this.secret = SafeString(extendedProperties, "secret", null);
        this.password = SafeString(extendedProperties, "password", null);
        this.login = SafeString(extendedProperties, "login", null);
        this.twofa = SafeString(extendedProperties, "twofa", null);
        this.privateKey = SafeString(extendedProperties, "privateKey", null);
        this.walletAddress = SafeString(extendedProperties, "walletAddress", null);
        this.token = SafeString(extendedProperties, "token", null);
        this.uid = SafeString(extendedProperties, "uid", null);
        this.accountId = SafeString(extendedProperties, "accountId", null);

        this.userAgents = SafeValue(extendedProperties, "userAgents", userAgents) as dict;
        this.userAgent = SafeString(extendedProperties, "userAgent");
        this.timeout = SafeInteger(extendedProperties, "timeout", 10000) ?? 10000;
        this.id = SafeString(extendedProperties, "id");

        this.alias = (bool)SafeValue(extendedProperties, "alias", false);

        this.api = SafeValue(extendedProperties, "api") as dict;
        this.hostname = SafeString(extendedProperties, "hostname");
        this.urls = SafeValue(extendedProperties, "urls") as dict;
        this.RefreshUrlsViews();
        this.limits = SafeValue(extendedProperties, "limits") as dict;

        this.streaming = SafeValue(extendedProperties, "streaming") as dict;

        // handle options
        var extendedOptions = safeDict(extendedProperties, "options");
        if (extendedOptions != null)
        {
            extendedOptions = this.deepExtend(this.getDefaultOptions(), extendedOptions);
            var extendedDict = extendedOptions as dict;
            this.options = new ccxt.pro.OwnedTable<object>(extendedDict);
        }
        else
        {
            var dict2 = this.getDefaultOptions() as dict;
            this.options = new ccxt.pro.OwnedTable<object>(dict2);
        }
        this.verbose = (bool)this.safeValue(extendedProperties, "verbose", false);
        this.timeframes = SafeValue(extendedProperties, "timeframes", null) as dict;
        this.fees = SafeValue(extendedProperties, "fees") as dict;
        this.has = SafeValue(extendedProperties, "has") as dict;
        this.httpExceptions = SafeValue(extendedProperties, "httpExceptions") as dict;
        this.exceptions = SafeValue(extendedProperties, "exceptions") as dict;
        this.markets = SafeValue(extendedProperties, "markets") as dict;
        var propCurrencies = SafeValue(extendedProperties, "currencies") as dict;
        if (propCurrencies != null && propCurrencies.Keys.Count > 0)
        {
            this.currencies = propCurrencies;
        }
        // this.currencies = SafeValue(extendedProperties, "currencies", null) as dict;
        this.rateLimit = SafeFloat(extendedProperties, "rateLimit", -1) ?? -1;
        this.status = SafeValue(extendedProperties, "status") as dict;
        this.precisionMode = SafeInteger(extendedProperties, "precisionMode", this.precisionMode);
        var paddingModeOp = SafeInteger(extendedProperties, "paddingMode", this.paddingMode);
        if (paddingModeOp != null)
        {
            this.paddingMode = ((int)paddingModeOp);

        }
        this.commonCurrencies = SafeValue(extendedProperties, "commonCurrencies") as dict;
        var subVal = SafeValue(extendedProperties, "substituteCommonCurrencyCodes", true);
        this.substituteCommonCurrencyCodes = subVal != null ? (bool)subVal : true;
        this.name = SafeString(extendedProperties, "name");
        this.httpsProxy = SafeString(extendedProperties, "httpsProxy");
        this.httpProxy = SafeString(extendedProperties, "httpProxy");
        this.newUpdates = SafeValue(extendedProperties, "newUpdates") as bool? ?? true;
        this.accounts = SafeValue(extendedProperties, "accounts") as List<object>;
        this.features = SafeValue(extendedProperties, "features", features) as dict;
        this.rollingWindowSize = (int)(SafeInteger(extendedProperties, "rollingWindowSize") ?? 0.0);
        this.rateLimiterAlgorithm = SafeString(extendedProperties, "rateLimiterAlgorithm", "leakyBucket");
        this.returnResponseHeaders = (bool)SafeValue(extendedProperties, "returnResponseHeaders", false);
        this.fetchHistoryCacheSize = (int)(SafeInteger(extendedProperties, "fetchHistoryCacheSize") ?? 0.0);
    }
}
