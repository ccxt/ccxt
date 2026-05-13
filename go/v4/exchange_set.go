package ccxt

import "sync"

func (this *Exchange) SetEnableRateLimit(rateLimit bool) {
	this.EnableRateLimit = rateLimit
}

func (this *Exchange) GetSymbols() []string {
	return this.Symbols
}

func (this *Exchange) GetAlias() any {
	return this.Alias
}

func (this *Exchange) GetTimeframes() map[string]any {
	return this.Timeframes
}

func (this *Exchange) GetFeatures() map[string]any {
	return this.Features
}

func (this *Exchange) GetRequiredCredentials() map[string]any {
	return this.RequiredCredentials
}

func (this *Exchange) GetLast_request_url() any {
	return this.Last_request_url
}

func (this *Exchange) GetLast_request_body() any {
	return this.Last_request_body
}

func (this *Exchange) SetProxyUrl(proxyUrl any) {
	this.ProxyUrl = proxyUrl.(string)
}

func (this *Exchange) SetSocksProxy(proxyUrl any) {
	this.SocksProxy = proxyUrl.(string)
}

func (this *Exchange) GetLast_request_headers() map[string]any {
	return this.Last_request_headers.(map[string]any)
}

func (this *Exchange) GetLast_response_headers() map[string]any {
	return this.Last_response_headers.(map[string]any)
}

func (this *Exchange) GetLastResponseHeaders() map[string]any {
	return this.Last_response_headers.(map[string]any)
}

func (this *Exchange) GetId() string {
	return this.Id
}

func (this *Exchange) GetHas() map[string]any {
	return this.Has
}

func (this *Exchange) GetOptions() *sync.Map {
	return this.Options
}

func (this *Exchange) GetHostname() string {
	return this.Hostname
}

func (this *Exchange) GetUrls() any {
	return this.Urls
}

func (this *Exchange) GetApi() map[string]any {
	return this.Api
}

func (this *Exchange) GetCurrencies() *sync.Map {
	return this.Currencies
}

func (this *Exchange) GetMarkets() *sync.Map {
	return this.Markets
}

func (this *Exchange) SetPrivateKey(privateKey any) {
	this.PrivateKey = privateKey.(string)
}

func (this *Exchange) SetAccountId(accountId any) {
	this.AccountId = accountId.(string)
}

func (this *Exchange) SetWalletAddress(publicKey any) {
	this.WalletAddress = publicKey.(string)
}

func (this *Exchange) SetCurrencies(currencies any) {
	this.Currencies = this.MapToSafeMap(currencies.(map[string]any))
}

func (this *Exchange) SetPassword(password any) {
	if password == nil {
		return
	}
	this.Password = password.(string)
}

func (this *Exchange) SetHttpProxy(httpProxy any) {
	this.HttpProxy = httpProxy
}

func (this *Exchange) SetHttpsProxy(httpProxy any) {
	this.HttpsProxy = httpProxy
}

func (this *Exchange) SetUid(uid any) {
	if uid == nil {
		return
	}
	this.Uid = uid.(string)
}

func (this *Exchange) SetTimeout(timeout any) {
	this.Timeout = timeout.(int64)
}

func (this *Exchange) SetSecret(secret any) {
	this.Secret = secret.(string)
}

func (this *Exchange) SetApiKey(apiKey any) {
	this.ApiKey = apiKey.(string)
}

func (this *Exchange) SetAccounts(accounts any) {
	this.Accounts = accounts
}

func (this *Exchange) SetOptions(options any) {
	this.Options = this.MapToSafeMap(options.(map[string]any))
}

func (this *Exchange) SetWssProxy(wssProxy any) {
	if wssProxy == nil {
		return
	}
	this.WssProxy = wssProxy.(string)
}

func (this *Exchange) SetWsProxy(wsProxy any) {
	if wsProxy == nil {
		return
	}
	this.WsProxy = wsProxy.(string)
}

func (this *Exchange) SetFetchResponse(fetchResponse any) {
	this.FetchResponse = fetchResponse
}

func (this *Exchange) SetVerbose(verbose any) {
	this.Verbose = verbose.(bool)
}

func (this *Exchange) GetCache() *sync.Map {
	return &this.methodCache
}

func (this *Exchange) GetItf() any {
	return this.Itf
}

func (this *Exchange) GetReturnResponseHeaders() bool {
	return this.ReturnResponseHeaders
}

func (this *Exchange) SetReturnResponseHeaders(val any) {
	if val == nil {
		return
	}
	this.ReturnResponseHeaders = val.(bool)
}
