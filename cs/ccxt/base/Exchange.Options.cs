namespace ccxt;

using System.Collections.Concurrent;

using dict = Dictionary<string, object>;
using list = List<object>;

public partial class Exchange
{
    public HttpClient httpClient { get; set; }
    public object fetchResponse = null; // tmp for response tests
    public string id { get; set; } = "Exchange";

    public bool alias { get; set; } = false;

    public string version { get; set; } = "";
    public string userAgent { get; set; }
    public bool verbose { get; set; } = true;
    public bool enableRateLimit { get; set; } = true;
    public long lastRestRequestTimestamp { get; set; } = 0;
    public string url { get; set; } = "";

    public string hostname { get; set; } = "";

    public IDictionary<string, object> baseCurrencies { get; set; } = new dict();

    public bool reloadingMarkets { get; set; } = false;

    public Task<object> marketsLoading { get; set; } = null;

    public IDictionary<string, object> quoteCurrencies { get; set; } = new dict();

    public dict api { get; set; } = new dict();

    public dict transformedApi { get; set; } = new dict();

    public bool reduceFees { get; set; } = true;

    public IDictionary<string, object> markets_by_id { get; set; } = null;

    public List<object> symbols { get; set; } = new list();

    public List<object> codes { get; set; } = new list();

    public List<object> ids { get; set; } = new list();

    public bool substituteCommonCurrencyCodes { get; set; } = true;

    public dict commonCurrencies { get; set; } = new dict();

    public object limits { get; set; } = new dict();

    public object precisionMode { get; set; } = DECIMAL_PLACES;

    public object currencies_by_id { get; set; } = new dict();

    public object accounts { get; set; } = new dict();

    public object accountsById { get; set; } = new dict();

    public object status { get; set; } = new dict();

    public int paddingMode { get; set; } = NO_PADDING;

    public object number { get; set; } = typeof(float);
    public Dictionary<string, object> has { get; set; } = new dict();
    public Dictionary<string, object> features { get; set; } = new dict();
    public ConcurrentDictionary<string, object> options { get; set; } = new ConcurrentDictionary<string, object>();
    public bool isSandboxModeEnabled { get; set; } = false;

    public object markets { get; set; } = null;
    public object currencies { get; set; } = new dict();
    public object fees { get; set; } = new dict();
    public object requiredCredentials { get; set; } = new dict();
    public object timeframes { get; set; } = new dict();
    public double rateLimit { get; set; }
    public object exceptions { get; set; } = new dict();
    public object urls { get; set; } = new dict();
    public object precision { get; set; } = new dict();

    public string secret { get; set; }
    public string apiKey { get; set; }
    public string password { get; set; }
    public string uid { get; set; }
    public string accountId { get; set; }
    public int minFundingAddressLength { get; set; } = 1;

    public dict userAgents { get; set; } = new dict(){
        {"chrome", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"},
        {"chrome39","Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"},
        {"chrome100","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"}
    };

    public string twofa { get; set; }
    public string privateKey { get; set; }
    public string walletAddress { get; set; }
    public string token { get; set; }
    public string login { get; set; }
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
    public float MAX_VALUE = float.MaxValue;

    public object name { get; set; }

    public object headers { get; set; } = new dict();
    public bool returnResponseHeaders { get; set; } = false;

    public dict httpExceptions { get; set; } = new dict();

    public dict tokenBucket { get; set; } = new dict();
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

    public object tickers = new ccxt.pro.CustomConcurrentDictionary<string, object>();
    public object fundingRates = new ccxt.pro.CustomConcurrentDictionary<string, object>();
    public object bidsasks = new ccxt.pro.CustomConcurrentDictionary<string, object>();

    public object transactions = new dict();
    public object myTrades;
    public object orders;
    public object triggerOrders;
    public object balance = new ccxt.pro.CustomConcurrentDictionary<string, object>();

    public bool newUpdates;

    public object positions;
    public object liquidations = new ccxt.pro.CustomConcurrentDictionary<string, object>();
    public object myLiquidations = new ccxt.pro.CustomConcurrentDictionary<string, object>();
    public object trades = new ccxt.pro.CustomConcurrentDictionary<string, object>();
    public object orderbooks = new ccxt.pro.CustomConcurrentDictionary<string, object>();

    public object ohlcvs = new ccxt.pro.CustomConcurrentDictionary<string, object>();
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

    void initializeProperties(dict userConfig = null)
    {
        var properties = this.describe();

        var extendedProperties = this.deepExtend(properties, userConfig);

        this.version = SafeString(extendedProperties, "version", "");

        // credentials initis
        this.requiredCredentials = SafeValue(extendedProperties, "requiredCredentials") as dict;
        this.apiKey = SafeString(extendedProperties, "apiKey", "");
        this.secret = SafeString(extendedProperties, "secret", "");
        this.password = SafeString(extendedProperties, "password", "");
        this.login = SafeString(extendedProperties, "login", "");
        this.twofa = SafeString(extendedProperties, "twofa", "");
        this.privateKey = SafeString(extendedProperties, "privateKey", "");
        this.walletAddress = SafeString(extendedProperties, "walletAddress", "");
        this.token = SafeString(extendedProperties, "token", "");
        this.uid = SafeString(extendedProperties, "uid", "");
        this.accountId = SafeString(extendedProperties, "accountId", "");

        this.userAgents = SafeValue(extendedProperties, "userAgents", userAgents) as dict;
        this.userAgent = SafeString(extendedProperties, "userAgent");
        this.timeout = SafeInteger(extendedProperties, "timeout", 10000) ?? 10000;
        this.id = SafeString(extendedProperties, "id");

        this.alias = (bool)SafeValue(extendedProperties, "alias", false);

        this.api = SafeValue(extendedProperties, "api") as dict;
        this.hostname = SafeString(extendedProperties, "hostname");
        this.urls = SafeValue(extendedProperties, "urls") as dict;
        this.limits = SafeValue(extendedProperties, "limits") as dict;

        this.streaming = SafeValue(extendedProperties, "streaming") as dict;

        // handle options
        var extendedOptions = safeDict(extendedProperties, "options");
        if (extendedOptions != null)
        {
            extendedOptions = this.deepExtend(this.getDefaultOptions(), extendedOptions);
            var extendedDict = extendedOptions as dict;
            var concurrentExtendedDict = new ConcurrentDictionary<string, object>(extendedDict);
            this.options = concurrentExtendedDict;
        }
        else
        {
            var dict2 = this.getDefaultOptions() as dict;
            this.options = new ConcurrentDictionary<string, object>(dict2);
        }
        this.verbose = (bool)this.safeValue(extendedProperties, "verbose", false);
        this.timeframes = SafeValue(extendedProperties, "timeframes", new dict()) as dict;
        this.fees = SafeValue(extendedProperties, "fees") as dict;
        this.has = SafeValue(extendedProperties, "has") as dict;
        this.httpExceptions = SafeValue(extendedProperties, "httpExceptions") as dict;
        this.exceptions = SafeValue(extendedProperties, "exceptions") as dict;
        this.markets = SafeValue(extendedProperties, "markets") as dict;
        var propCurrencies = SafeValue(extendedProperties, "currencies") as dict;
        if (propCurrencies.Keys.Count > 0)
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

        this.returnResponseHeaders = (bool)SafeValue(extendedProperties, "returnResponseHeaders", false);
    }
}
