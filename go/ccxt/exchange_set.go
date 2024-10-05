package ccxt

func (this *Exchange) GetSymbols() []string {
	return this.Symbols
}

func (this *Exchange) GetAlias() interface{} {
	return this.Alias
}

func (this *Exchange) GetLast_request_url() interface{} {
	return this.Last_request_url
}

func (this *Exchange) GetLast_request_body() interface{} {
	return this.Last_request_body
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
	this.Password = password.(string)
}

func (this *Exchange) SetHttpProxy(httpProxy interface{}) {
	this.HttpProxy = httpProxy.(string)
}

func (this *Exchange) SetHttpsProxy(httpProxy interface{}) {
	this.HttpsProxy = httpProxy.(string)
}

func (this *Exchange) SetUid(uid interface{}) {
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

func (this *Exchange) SetOptions(options interface{}) {
	this.Options = options.(map[string]interface{})
}

func (this *Exchange) SetWssProxy(wssProxy interface{}) {
	this.WssProxy = wssProxy.(string)
}

func (this *Exchange) SetWsProxy(wsProxy interface{}) {
	this.WsProxy = wsProxy.(string)
}
