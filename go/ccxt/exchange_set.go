package ccxt

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
