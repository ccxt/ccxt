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
	this.ProxyUrl = proxyUrl.(string)
}

func (this *BaseExchange) SetSocksProxy(proxyUrl any) {
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
	this.PrivateKey = privateKey.(string)
}

func (this *BaseExchange) SetAccountId(accountId any) {
	this.AccountId = accountId.(string)
}

func (this *BaseExchange) SetWalletAddress(publicKey any) {
	this.WalletAddress = publicKey.(string)
}

func (this *BaseExchange) SetCurrencies(currencies any) {
	if currencies == nil {
		return
	}
	this.Currencies = this.MapToSafeMap(currencies.(map[string]any))
}

func (this *BaseExchange) SetPassword(password any) {
	if password == nil {
		return
	}
	this.Password = password.(string)
}

func (this *BaseExchange) SetHttpProxy(httpProxy any) {
	this.HttpProxy = httpProxy
}

func (this *BaseExchange) SetHttpsProxy(httpProxy any) {
	this.HttpsProxy = httpProxy
}

func (this *BaseExchange) SetUid(uid any) {
	if uid == nil {
		return
	}
	this.Uid = uid.(string)
}

func (this *BaseExchange) SetTimeout(timeout any) {
	this.Timeout = timeout.(int64)
}

func (this *BaseExchange) SetSecret(secret any) {
	this.Secret = secret.(string)
}

func (this *BaseExchange) SetApiKey(apiKey any) {
	this.ApiKey = apiKey.(string)
}

func (this *BaseExchange) SetAccounts(accounts any) {
	this.Accounts = accounts
}

func (this *BaseExchange) SetOptions(options any) {
	this.Options = this.MapToSafeMap(options.(map[string]any))
}

func (this *BaseExchange) SetWssProxy(wssProxy any) {
	if wssProxy == nil {
		return
	}
	this.WssProxy = wssProxy.(string)
}

func (this *BaseExchange) SetWsProxy(wsProxy any) {
	if wsProxy == nil {
		return
	}
	this.WsProxy = wsProxy.(string)
}

func (this *BaseExchange) SetFetchResponse(fetchResponse any) {
	this.FetchResponse = fetchResponse
}

func (this *BaseExchange) SetVerbose(verbose any) {
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
	if val == nil {
		return
	}
	this.ReturnResponseHeaders = val.(bool)
}
