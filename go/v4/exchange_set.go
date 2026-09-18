package ccxt

import "sync"

func (this *BaseExchange) SetEnableRateLimit(rateLimit bool) {
	this.EnableRateLimit = rateLimit
}

func (this *BaseExchange) GetSymbols() []string {
	return this.Symbols
}

func (this *BaseExchange) GetAlias() any {
	return this.Alias
}

func (this *BaseExchange) GetTimeframes() map[string]any {
	return this.Timeframes
}

func (this *BaseExchange) GetFeatures() map[string]any {
	return this.Features
}

func (this *BaseExchange) GetRequiredCredentials() map[string]any {
	return this.RequiredCredentials
}

func (this *BaseExchange) GetLast_request_url() any {
	return this.Last_request_url
}

func (this *BaseExchange) GetLast_request_body() any {
	return this.Last_request_body
}

func (this *BaseExchange) SetProxyUrl(proxyUrl any) {
	proxyUrl = derefScalar(proxyUrl) // generated callers may pass typed pointers; a typed nil is an absent value
	if proxyUrl == nil {
		return
	}
	this.ProxyUrl = proxyUrl.(string)
}

func (this *BaseExchange) SetSocksProxy(proxyUrl any) {
	proxyUrl = derefScalar(proxyUrl) // generated callers may pass typed pointers; a typed nil is an absent value
	if proxyUrl == nil {
		return
	}
	this.SocksProxy = proxyUrl.(string)
}

func (this *BaseExchange) GetLast_request_headers() map[string]any {
	return this.Last_request_headers.(map[string]any)
}

func (this *BaseExchange) GetLast_response_headers() map[string]any {
	return this.Last_response_headers.(map[string]any)
}

func (this *BaseExchange) GetLastResponseHeaders() map[string]any {
	return this.Last_response_headers.(map[string]any)
}

func (this *BaseExchange) SetFetchHistoryCacheSize(size any) {
	size = derefScalar(size) // generated callers may pass typed pointers; a typed nil is an absent value
	if size == nil {
		return
	}
	if intSize, ok := size.(int); ok {
		this.FetchHistoryCacheSize = intSize
	} else if i64, ok := size.(int64); ok {
		this.FetchHistoryCacheSize = int(i64)
	} else if f, ok := size.(float64); ok {
		this.FetchHistoryCacheSize = int(f)
	}
}

func (this *BaseExchange) GetId() string {
	return this.Id
}

func (this *BaseExchange) GetHas() map[string]any {
	return this.Has
}

func (this *BaseExchange) GetOptions() *sync.Map {
	return this.Options
}

func (this *BaseExchange) GetHostname() string {
	return this.Hostname
}

func (this *BaseExchange) GetUrls() any {
	return this.Urls
}

func (this *BaseExchange) GetApi() map[string]any {
	return this.Api
}

func (this *BaseExchange) GetCurrencies() *sync.Map {
	return this.Currencies
}

func (this *BaseExchange) GetMarkets() *sync.Map {
	return this.Markets
}

func (this *BaseExchange) SetPrivateKey(privateKey any) {
	privateKey = derefScalar(privateKey) // generated callers may pass typed pointers; a typed nil is an absent value
	if privateKey == nil {
		return
	}
	this.PrivateKey = privateKey.(string)
}

func (this *BaseExchange) SetAccountId(accountId any) {
	accountId = derefScalar(accountId) // generated callers may pass typed pointers; a typed nil is an absent value
	if accountId == nil {
		return
	}
	this.AccountId = accountId.(string)
}

func (this *BaseExchange) SetWalletAddress(publicKey any) {
	publicKey = derefScalar(publicKey) // generated callers may pass typed pointers; a typed nil is an absent value
	if publicKey == nil {
		return
	}
	this.WalletAddress = publicKey.(string)
}

func (this *BaseExchange) SetCurrencies(currencies any) {
	currencies = derefScalar(currencies) // generated callers may pass typed pointers; a typed nil is an absent value
	if currencies == nil {
		return
	}
	this.Currencies = this.MapToSafeMap(currencies.(map[string]any))
}

func (this *BaseExchange) SetPassword(password any) {
	password = derefScalar(password) // generated callers may pass typed pointers; a typed nil is an absent value
	if password == nil {
		return
	}
	this.Password = password.(string)
}

func (this *BaseExchange) SetHttpProxy(httpProxy any) {
	httpProxy = derefScalar(httpProxy) // generated callers may pass typed pointers; a typed nil is an absent value
	this.HttpProxy = httpProxy
}

func (this *BaseExchange) SetHttpsProxy(httpProxy any) {
	httpProxy = derefScalar(httpProxy) // generated callers may pass typed pointers; a typed nil is an absent value
	this.HttpsProxy = httpProxy
}

func (this *BaseExchange) SetUid(uid any) {
	uid = derefScalar(uid) // generated callers may pass typed pointers; a typed nil is an absent value
	if uid == nil {
		return
	}
	this.Uid = uid.(string)
}

func (this *BaseExchange) SetTimeout(timeout any) {
	timeout = derefScalar(timeout) // generated callers may pass typed pointers; a typed nil is an absent value
	if timeout == nil {
		return
	}
	this.Timeout = timeout.(int64)
}

func (this *BaseExchange) SetSecret(secret any) {
	secret = derefScalar(secret) // generated callers may pass typed pointers; a typed nil is an absent value
	if secret == nil {
		return
	}
	this.Secret = secret.(string)
}

func (this *BaseExchange) SetApiKey(apiKey any) {
	apiKey = derefScalar(apiKey) // generated callers may pass typed pointers; a typed nil is an absent value
	if apiKey == nil {
		return
	}
	this.ApiKey = apiKey.(string)
}

func (this *BaseExchange) SetAccounts(accounts any) {
	accounts = derefScalar(accounts) // generated callers may pass typed pointers; a typed nil is an absent value
	this.Accounts = accounts
}

func (this *BaseExchange) SetOptions(options any) {
	options = derefScalar(options) // generated callers may pass typed pointers; a typed nil is an absent value
	this.Options = this.MapToSafeMap(options.(map[string]any))
}

func (this *BaseExchange) SetWssProxy(wssProxy any) {
	wssProxy = derefScalar(wssProxy) // generated callers may pass typed pointers; a typed nil is an absent value
	if wssProxy == nil {
		return
	}
	this.WssProxy = wssProxy.(string)
}

func (this *BaseExchange) SetWsProxy(wsProxy any) {
	wsProxy = derefScalar(wsProxy) // generated callers may pass typed pointers; a typed nil is an absent value
	if wsProxy == nil {
		return
	}
	this.WsProxy = wsProxy.(string)
}

func (this *BaseExchange) SetFetchResponse(fetchResponse any) {
	fetchResponse = derefScalar(fetchResponse) // generated callers may pass typed pointers; a typed nil is an absent value
	this.FetchResponse = fetchResponse
	this.FetchResponseByUrl = nil // a plain body (or the nil reset) drops any url-keyed mock
}

// SetFetchResponseByUrl serves a body per url fragment for methods that call several
// endpoints; one shared body cannot cover two endpoints of different declared shapes.
func (this *BaseExchange) SetFetchResponseByUrl(responsesByUrl any) {
	this.FetchResponseByUrl = responsesByUrl
}

func (this *BaseExchange) SetVerbose(verbose any) {
	verbose = derefScalar(verbose) // generated callers may pass typed pointers; a typed nil is an absent value
	if verbose == nil {
		return
	}
	this.Verbose = verbose.(bool)
}

func (this *BaseExchange) GetCache() *sync.Map {
	return &this.methodCache
}

func (this *BaseExchange) GetItf() any {
	return this.Itf
}

func (this *BaseExchange) GetReturnResponseHeaders() bool {
	return this.ReturnResponseHeaders
}

func (this *BaseExchange) SetReturnResponseHeaders(val any) {
	val = derefScalar(val) // generated callers may pass typed pointers; a typed nil is an absent value
	if val == nil {
		return
	}
	this.ReturnResponseHeaders = val.(bool)
}
