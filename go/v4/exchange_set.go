package ccxt

import "sync"

func (this *Exchange) SetRateLimit(rateLimit bool) {
	this.EnableRateLimit = rateLimit
}

func (this *Exchange) GetSymbols() []string {
	return this.Symbols
}

func (this *Exchange) GetAlias() interface{} {
	return this.Alias
}

func (this *Exchange) GetTimeframes() map[string]interface{} {
	return this.Timeframes
}

func (this *Exchange) GetFeatures() map[string]interface{} {
	return this.Features
}

func (this *Exchange) GetRequiredCredentials() map[string]interface{} {
	return this.RequiredCredentials
}

func (this *Exchange) GetLast_request_url() interface{} {
	return this.Last_request_url
}

func (this *Exchange) GetLast_request_body() interface{} {
	return this.Last_request_body
}

func (this *Exchange) SetProxyUrl(proxyUrl interface{}) {
	this.ProxyUrl = proxyUrl.(string)
}

func (this *Exchange) SetSocksProxy(proxyUrl interface{}) {
	this.SocksProxy = proxyUrl.(string)
}

func (this *Exchange) GetLast_request_headers() map[string]interface{} {
	return this.Last_request_headers.(map[string]interface{})
}

func (this *Exchange) GetId() string {
	return this.Id
}

func (this *Exchange) GetHas() map[string]interface{} {
	return this.Has
}

func (this *Exchange) GetOptions() map[string]interface{} {
	return this.Options
}

func (this *Exchange) GetHostname() string {
	return this.Hostname
}

func (this *Exchange) GetUrls() interface{} {
	return this.Urls
}

func (this *Exchange) GetApi() map[string]interface{} {
	return this.Api
}

func (this *Exchange) GetCurrencies() map[string]interface{} {
	return this.Currencies
}

func (this *Exchange) GetMarkets() map[string]interface{} {
	return this.Markets
}

func (this *Exchange) SetPrivateKey(privateKey interface{}) {
	this.PrivateKey = privateKey.(string)
}

func (this *Exchange) SetWalletAddress(publicKey interface{}) {
	this.WalletAddress = publicKey.(string)
}

func (this *Exchange) SetCurrencies(currencies interface{}) {
	this.Currencies = currencies.(map[string]interface{})
}

func (this *Exchange) SetPassword(password interface{}) {
	if password == nil {
		return
	}
	this.Password = password.(string)
}

func (this *Exchange) SetHttpProxy(httpProxy interface{}) {
	this.HttpProxy = httpProxy
}

func (this *Exchange) SetHttpsProxy(httpProxy interface{}) {
	this.HttpsProxy = httpProxy
}

func (this *Exchange) SetUid(uid interface{}) {
	if uid == nil {
		return
	}
	this.Uid = uid.(string)
}

func (this *Exchange) SetTimeout(timeout interface{}) {
	this.Timeout = timeout.(int64)
}

func (this *Exchange) SetSecret(secret interface{}) {
	this.Secret = secret.(string)
}

func (this *Exchange) SetApiKey(apiKey interface{}) {
	this.ApiKey = apiKey.(string)
}

func (this *Exchange) SetAccounts(accounts interface{}) {
	this.Accounts = accounts
}

func (this *Exchange) SetOptions(options interface{}) {
	this.Options = options.(map[string]interface{})
}

func (this *Exchange) SetWssProxy(wssProxy interface{}) {
	if wssProxy == nil {
		return
	}
	this.WssProxy = wssProxy.(string)
}

func (this *Exchange) SetWsProxy(wsProxy interface{}) {
	if wsProxy == nil {
		return
	}
	this.WsProxy = wsProxy.(string)
}

func (this *Exchange) SetFetchResponse(fetchResponse interface{}) {
	this.FetchResponse = fetchResponse
}

func (this *Exchange) SetVerbose(verbose interface{}) {
	this.Verbose = verbose.(bool)
}

func (this *Exchange) GetCache() *sync.Map {
	return &this.methodCache
}

func (this *Exchange) GetItf() interface{} {
	return this.Itf
}
