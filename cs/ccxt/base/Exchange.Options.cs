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

    public dict baseCurrencies { get; set; } = new dict();

    public bool reloadingMarkets { get; set; } = false;

    public Task<object> marketsLoading { get; set; } = null;

    public dict quoteCurrencies { get; set; } = new dict();

    public dict api { get; set; } = new dict();

    public dict transformedApi { get; set; } = new dict();

    public bool reduceFees { get; set; } = true;

    public dict markets_by_id { get; set; } = null;

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
    public ConcurrentDictionary<string, object> options { get; set; } = new ConcurrentDictionary<string, object>();
    public object markets { get; set; } = null;
    public object currencies { get; set; } = null;
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

    public object name { get; set; }

    public object headers { get; set; } = new dict();

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
    public object bidsasks = new ccxt.pro.CustomConcurrentDictionary<string, object>();

    public object transactions = new dict();
    public object myTrades;
    public object orders;
    public object triggerOrders;
    public object balance = new ccxt.pro.CustomConcurrentDictionary<string, object>();

    public bool newUpdates;

    public object positions;
    public object trades = new ccxt.pro.CustomConcurrentDictionary<string, object>();
    public object orderbooks = new ccxt.pro.CustomConcurrentDictionary<string, object>();

    public object ohlcvs = new ccxt.pro.CustomConcurrentDictionary<string, object>();
    public object wssProxy { get; set; } = null;
    public object wss_proxy { get; set; } = null;

    public object wsProxy { get; set; } = null;
    public object ws_proxy { get; set; } = null;

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

    public virtual object describe()
    {
        return new Dictionary<string, object>() {
            { "id", null },
            { "name", null },
            { "countries", null },
            { "enableRateLimit", true },
            { "rateLimit", 2000 },
            { "certified", false },
            { "pro", false },
            { "alias", false },
            { "has", new Dictionary<string, object>() {
                { "publicAPI", true },
                { "privateAPI", true },
                { "CORS", null },
                { "spot", null },
                { "margin", null },
                { "swap", null },
                { "future", null },
                { "option", null },
                { "addMargin", null },
                { "cancelAllOrders", null },
                { "cancelOrder", true },
                { "cancelOrders", null },
                { "createDepositAddress", null },
                { "createLimitOrder", true },
                { "createMarketOrder", true },
                { "createOrder", true },
                { "createPostOnlyOrder", null },
                { "createReduceOnlyOrder", null },
                { "createStopOrder", null },
                { "createStopLimitOrder", null },
                { "createStopMarketOrder", null },
                { "editOrder", "emulated" },
                { "fetchAccounts", null },
                { "fetchBalance", true },
                { "fetchBidsAsks", null },
                { "fetchBorrowInterest", null },
                { "fetchBorrowRate", null },
                { "fetchBorrowRateHistory", null },
                { "fetchBorrowRatesPerSymbol", null },
                { "fetchBorrowRates", null },
                { "fetchCanceledOrders", null },
                { "fetchClosedOrder", null },
                { "fetchClosedOrders", null },
                { "fetchClosedOrdersWs", null },
                { "fetchConvertCurrencies", null },
                { "fetchConvertQuote", null },
                { "fetchConvertTrade", null },
                { "fetchConvertTradeHistory", null },
                { "fetchCrossBorrowRate", null },
                { "fetchCrossBorrowRates", null },
                { "fetchCurrencies", "emulated" },
                { "fetchCurrenciesWs", "emulated" },
                { "fetchDeposit", null },
                { "fetchDepositAddress", null },
                { "fetchDepositAddresses", null },
                { "fetchDepositAddressesByNetwork", null },
                { "fetchDeposits", null },
                { "fetchTransactionFee", null },
                { "fetchTransactionFees", null },
                { "fetchFundingHistory", null },
                { "fetchFundingRate", null },
                { "fetchFundingRateHistory", null },
                { "fetchFundingRates", null },
                { "fetchIndexOHLCV", null },
                { "fetchL2OrderBook", true },
                { "fetchLedger", null },
                { "fetchLedgerEntry", null },
                { "fetchLeverageTiers", null },
                { "fetchMarketLeverageTiers", null },
                { "fetchMarkets", true },
                { "fetchMarkOHLCV", null },
                { "fetchMyTrades", null },
                { "fetchOHLCV", null },
                { "fetchOpenOrder", null },
                { "fetchOpenOrders", null },
                { "fetchOrder", null },
                { "fetchOrderBook", true },
                { "fetchOrderBooks", null },
                { "fetchOrders", null },
                { "fetchOrderTrades", null },
                { "fetchPermissions", null },
                { "fetchPosition", null },
                { "fetchPositions", null },
                { "fetchPositionsRisk", null },
                { "fetchPremiumIndexOHLCV", null },
                { "fetchStatus", null },
                { "fetchTicker", true },
                { "fetchTickers", null },
                { "fetchTime", null },
                { "fetchTrades", true },
                { "fetchTradingFee", null },
                { "fetchTradingFees", null },
                { "fetchTradingLimits", null },
                { "fetchTransactions", null },
                { "fetchTransfers", null },
                { "fetchWithdrawal", null },
                { "fetchWithdrawals", null },
                { "reduceMargin", null },
                { "setLeverage", null },
                { "setMargin", null },
                { "setMarginMode", null },
                { "setPositionMode", null },
                { "signIn", null },
                { "transfer", null },
                { "withdraw", null },
            } },
            { "urls", new Dictionary<string, object>() {
                { "logo", null },
                { "api", null },
                { "www", null },
                { "doc", null },
                { "fees", null },
            } },
            { "api", null },
            { "requiredCredentials", new Dictionary<string, object>() {
                { "apiKey", true },
                { "secret", true },
                { "uid", false },
                { "accountId", false },
                { "login", false },
                { "password", false },
                { "twofa", false },
                { "privateKey", false },
                { "walletAddress", false },
                { "token", false },
            } },
            { "markets", null },
            { "currencies", new Dictionary<string, object>() {} },
            { "timeframes", null },
            { "fees", new Dictionary<string, object>() {
                { "trading", new Dictionary<string, object>() {
                    { "tierBased", null },
                    { "percentage", null },
                    { "taker", null },
                    { "maker", null },
                } },
                { "funding", new Dictionary<string, object>() {
                    { "tierBased", null },
                    { "percentage", null },
                    { "withdraw", new Dictionary<string, object>() {} },
                    { "deposit", new Dictionary<string, object>() {} },
                } },
            } },
            { "status", new Dictionary<string, object>() {
                { "status", "ok" },
                { "updated", null },
                { "eta", null },
                { "url", null },
            } },
            { "exceptions", null },
            { "httpExceptions", new Dictionary<string, object>() {
                { "422", typeof(ExchangeError) },
                { "418", typeof(DDoSProtection) },
                { "429", typeof(RateLimitExceeded) },
                { "404", typeof(ExchangeNotAvailable) },
                { "409", typeof(ExchangeNotAvailable) },
                { "410", typeof(ExchangeNotAvailable) },
                { "500", typeof(ExchangeNotAvailable) },
                { "501", typeof(ExchangeNotAvailable) },
                { "502", typeof(ExchangeNotAvailable) },
                { "520", typeof(ExchangeNotAvailable) },
                { "521", typeof(ExchangeNotAvailable) },
                { "522", typeof(ExchangeNotAvailable) },
                { "525", typeof(ExchangeNotAvailable) },
                { "526", typeof(ExchangeNotAvailable) },
                { "400", typeof(ExchangeNotAvailable) },
                { "403", typeof(ExchangeNotAvailable) },
                { "405", typeof(ExchangeNotAvailable) },
                { "503", typeof(ExchangeNotAvailable) },
                { "530", typeof(ExchangeNotAvailable) },
                { "408", typeof(RequestTimeout) },
                { "504", typeof(RequestTimeout) },
                { "401", typeof(AuthenticationError) },
                { "511", typeof(AuthenticationError) },
            } },
            { "commonCurrencies", new Dictionary<string, object>() {
                { "XBT", "BTC" },
                { "BCC", "BCH" },
                { "BCHABC", "BCH" },
                { "BCHSV", "BSV" },
            } },
            { "precisionMode", DECIMAL_PLACES },
            { "paddingMode", NO_PADDING },
            { "limits", new Dictionary<string, object>() {
                { "leverage", new Dictionary<string, object>() {
                    { "min", null },
                    { "max", null },
                } },
                { "amount", new Dictionary<string, object>() {
                    { "min", null },
                    { "max", null },
                } },
                { "price", new Dictionary<string, object>() {
                    { "min", null },
                    { "max", null },
                } },
                { "cost", new Dictionary<string, object>() {
                    { "min", null },
                    { "max", null },
                } },
            } },
        };  // return
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

        // handle options
        var extendedOptions = safeDict(extendedProperties, "options");
        if (extendedOptions != null)
        {
            var extendedDict = extendedOptions as dict;
            var concurrentExtendedDict = new ConcurrentDictionary<string, object>(extendedDict);
            this.options = concurrentExtendedDict;
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
        this.paddingMode = ((int)SafeInteger(extendedProperties, "paddingMode", this.paddingMode));
        this.commonCurrencies = SafeValue(extendedProperties, "commonCurrencies") as dict;
        var subVal = SafeValue(extendedProperties, "substituteCommonCurrencyCodes", true);
        this.substituteCommonCurrencyCodes = subVal != null ? (bool)subVal : true;
        this.name = SafeString(extendedProperties, "name");
        this.httpsProxy = SafeString(extendedProperties, "httpsProxy");
        this.httpProxy = SafeString(extendedProperties, "httpProxy");
        this.newUpdates = SafeValue(extendedProperties, "newUpdates") as bool? ?? true;
        this.accounts = SafeValue(extendedProperties, "accounts") as List<object>;
    }
}