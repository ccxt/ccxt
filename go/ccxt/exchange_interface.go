package ccxt

// Exchange interface based on the methods from binance.go
type IExchange interface {
	ExtendExchangeOptions(options interface{})
	GetSymbols() []interface{}
	SetWssProxy(wssProxy interface{})
	SetWsProxy(wsProxy interface{})
	GetAlias() interface{}
	SetTimeout(timeout interface{})
	SetHttpsProxy(httpsProxy interface{})
	SetHttpProxy(httpProxy interface{})
	SetCurrencies(currencies interface{})
	SetPrivateKey(privateKey interface{})
	SetPublicKey(publicKey interface{})
	SetWalletAddress(walletAddress interface{})
	SetSecret(secret interface{})
	SetUid(uid interface{})
	SetPassword(password interface{})
	SetApiKey(apiKey interface{})
	GetLast_request_url() interface{}
	GetLast_request_body() interface{}
	GetLast_request_headers() map[string]interface{}
	GetHas() map[string]interface{}
	GetId() string
	GetOptions() map[string]interface{}
	GetCurrencies() map[string]interface{}
	GetMarkets() map[string]interface{}
	CheckRequiredCredentials(optionalArgs ...interface{}) interface{}
	Sleep(milliseconds interface{}) <-chan bool
	Json(object interface{}) interface{}
	FilterBy(aa interface{}, key interface{}, value interface{}) []interface{}
	IndexBy(array interface{}, key interface{}) interface{}
	CreateOrder(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	Sum(a interface{}, b interface{}) interface{}
	NumberToString(num interface{}) interface{}
	ParseToNumeric(value interface{}) interface{}
	LoadMarkets(params ...interface{}) <-chan interface{}
	SafeDict(dictionary interface{}, key interface{}, defaultValue ...interface{}) interface{}
	InArray(needle interface{}, haystack interface{}) interface{}
	DeepExtend(destination interface{}, source interface{}, optionalArgs ...interface{}) interface{}
	ParseToInt(value interface{}) interface{}
	SafeValue(value interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeBool(value interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeString(value interface{}, key interface{}, defaultValue ...interface{}) interface{}
	Describe() interface{}
	IsInverse(typeVar interface{}, optionalArgs ...interface{}) interface{}
	IsLinear(typeVar interface{}, optionalArgs ...interface{}) interface{}
	SetSandboxMode(enable interface{})
	CreateExpiredOptionMarket(symbol interface{}) interface{}
	Market(symbol interface{}) interface{}
	SafeMarket(optionalArgs ...interface{}) interface{}
	CostToPrecision(symbol interface{}, cost interface{}) interface{}
	CurrencyToPrecision(code interface{}, fee interface{}, optionalArgs ...interface{}) interface{}
	Nonce() interface{}
	FetchTime(optionalArgs ...interface{}) <-chan interface{}
	FetchCurrencies(optionalArgs ...interface{}) <-chan interface{}
	FetchMarkets(optionalArgs ...interface{}) <-chan interface{}
	ParseMarket(market interface{}) interface{}
	ParseBalanceHelper(entry interface{}) interface{}
	ParseBalanceCustom(response interface{}, optionalArgs ...interface{}) interface{}
	FetchBalance(optionalArgs ...interface{}) <-chan interface{}
	FetchOrderBook(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	ParseTicker(ticker interface{}, optionalArgs ...interface{}) interface{}
	FetchStatus(optionalArgs ...interface{}) <-chan interface{}
	FetchTicker(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchBidsAsks(optionalArgs ...interface{}) <-chan interface{}
	FetchLastPrices(optionalArgs ...interface{}) <-chan interface{}
	ParseOpenInterest(interest interface{}, optionalArgs ...interface{}) interface{}
	FetchMyLiquidations(optionalArgs ...interface{}) <-chan interface{}
	ParseLiquidation(liquidation interface{}, optionalArgs ...interface{}) interface{}
	FetchGreeks(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	ParseGreeks(greeks interface{}, optionalArgs ...interface{}) interface{}
	FetchTradingLimits(optionalArgs ...interface{}) <-chan interface{}
	FetchPositionMode(optionalArgs ...interface{}) <-chan interface{}
	FetchMarginModes(optionalArgs ...interface{}) <-chan interface{}
	ParseMarginMode(marginMode interface{}, optionalArgs ...interface{}) interface{}
	FetchOption(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	ParseOption(chain interface{}, optionalArgs ...interface{}) interface{}
	FetchMarginAdjustmentHistory(optionalArgs ...interface{}) <-chan interface{}
	FetchConvertCurrencies(optionalArgs ...interface{}) <-chan interface{}
	FetchConvertQuote(fromCode interface{}, toCode interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateConvertTrade(id interface{}, fromCode interface{}, toCode interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchConvertTrade(id interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchConvertTradeHistory(optionalArgs ...interface{}) <-chan interface{}
	ParseConversion(conversion interface{}, optionalArgs ...interface{}) interface{}
	Init(userConfig map[string]interface{})
}
