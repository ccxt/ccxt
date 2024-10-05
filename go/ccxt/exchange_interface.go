package ccxt

// Exchange interface based on the methods from binance.go
type IExchange interface {
	ExtendExchangeOptions(options interface{})
	GetSymbols() []string
	SetWssProxy(wssProxy interface{})
	SetWsProxy(wsProxy interface{})
	GetAlias() interface{}
	SetTimeout(timeout interface{})
	SetHttpsProxy(httpsProxy interface{})
	SetHttpProxy(httpProxy interface{})
	SetCurrencies(currencies interface{})
	SetPrivateKey(privateKey interface{})
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
	IndexBy(array interface{}, key interface{}) map[string]interface{}
	CreateOrder(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	Sum(args ...interface{}) interface{}
	NumberToString(num interface{}) string
	ParseToNumeric(value interface{}) interface{}
	LoadMarkets(params ...interface{}) <-chan interface{}
	SafeDict(dictionary interface{}, key interface{}, defaultValue ...interface{}) interface{}
	InArray(needle interface{}, haystack interface{}) bool
	DeepExtend(objs ...interface{}) map[string]interface{}
	ParseToInt(value interface{}) interface{}
	SafeValue(value interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeBool(value interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeString(value interface{}, key interface{}, defaultValue ...interface{}) interface{}
	Describe() interface{}
	SetSandboxMode(enable interface{})
	Market(symbol interface{}) interface{}
	Nonce() interface{}
	FetchTime(optionalArgs ...interface{}) <-chan interface{}
	FetchCurrencies(optionalArgs ...interface{}) <-chan interface{}
	FetchMarkets(optionalArgs ...interface{}) <-chan interface{}
	FetchBalance(optionalArgs ...interface{}) <-chan interface{}
	FetchOrderBook(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
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
	FetchOption(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchMarginAdjustmentHistory(optionalArgs ...interface{}) <-chan interface{}
	FetchConvertCurrencies(optionalArgs ...interface{}) <-chan interface{}
	FetchConvertQuote(fromCode interface{}, toCode interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateConvertTrade(id interface{}, fromCode interface{}, toCode interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchConvertTrade(id interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchConvertTradeHistory(optionalArgs ...interface{}) <-chan interface{}
}
