package ccxt

import "sync"

func (this *BaseExchange) initializeProperties(extendedProperties map[string]any) {

	this.TransformedApi = map[string]any{}
	this.Version = SafeString(extendedProperties, "version", "").(string)
	this.cacheLoaded = false
	reqCred := SafeValue(extendedProperties, "requiredCredentials", map[string]interface{}{})
	this.RequiredCredentials = reqCred.(map[string]interface{})
	this.ApiKey = SafeString(extendedProperties, "apiKey", nil)
	this.Secret = SafeString(extendedProperties, "secret", nil)
	this.Password = SafeString(extendedProperties, "password", nil)
	this.Login = SafeString(extendedProperties, "login", nil)
	this.Twofa = SafeString(extendedProperties, "twofa", nil)
	this.PrivateKey = SafeString(extendedProperties, "privateKey", nil)
	this.WalletAddress = SafeString(extendedProperties, "walletAddress", nil)
	this.Token = SafeString(extendedProperties, "token", nil)
	this.Uid = SafeString(extendedProperties, "uid", nil)
	this.AccountId = SafeString(extendedProperties, "accountId", nil)

	this.UserAgents = SafeValue(extendedProperties, "userAgents", map[string]interface{}{
		"chrome":    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
		"chrome39":  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36",
		"chrome100": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
	}).(map[string]interface{})
	this.UserAgent = SafeString(extendedProperties, "userAgent", "").(string)
	this.Timeout = SafeInteger(extendedProperties, "timeout", 10000).(int64)
	this.MAX_VALUE = SafeFloat(extendedProperties, "MAX_VALUE", 1.7976931348623157e+308).(float64) // math.MaxFloat64
	this.Id = SafeString(extendedProperties, "id", "Exchange").(string)
	this.Alias = SafeValue(extendedProperties, "alias", false).(bool)

	this.Api = SafeValue(extendedProperties, "api", map[string]any{}).(map[string]any)
	this.Hostname = SafeString(extendedProperties, "hostname", "").(string)
	this.Urls = SafeValue(extendedProperties, "urls", map[string]any{}).(map[string]any)

	this.Options = this.MapToSafeMap(this.GetDefaultOptions().(map[string]any))
	extendedOptions := SafeValue(extendedProperties, "options", map[string]any{}).(map[string]any)
	for k, v := range extendedOptions {
		// this.Options[k] = v
		this.Options.Store(k, v)
	}

	this.Verbose = SafeValue(extendedProperties, "verbose", false).(bool)
	this.Timeframes = SafeValue(extendedProperties, "timeframes", map[string]any{}).(map[string]any)
	this.Features = SafeValue(extendedProperties, "features", map[string]any{}).(map[string]any)
	this.Fees = SafeValue(extendedProperties, "fees", map[string]any{}).(map[string]any)
	this.Has = SafeValue(extendedProperties, "has", map[string]any{}).(map[string]any)
	// this.httpExceptions = SafeValue(extendedProperties, "httpExceptions",map[string]any{}).(map[string]any)
	this.Exceptions = SafeValue(extendedProperties, "exceptions", map[string]any{}).(map[string]any)
	propertiesMarkets := SafeValue(extendedProperties, "markets", nil)
	if propertiesMarkets != nil {
		this.Markets = this.MapToSafeMap(propertiesMarkets.(map[string]any))
	}
	propCurrencies := SafeValue(extendedProperties, "currencies", map[string]any{}).(map[string]any)
	if len(propCurrencies) > 0 {
		this.Currencies = this.MapToSafeMap(propCurrencies)
	}
	this.EnableRateLimit = SafeValue(extendedProperties, "enableRateLimit", true).(bool)
	this.RateLimit = SafeFloat(extendedProperties, "rateLimit", -1).(float64)
	this.RollingWindowSize = SafeFloat(extendedProperties, "rollingWindowSize", 0.0).(float64)
	this.RateLimiterAlgorithm = SafeString(extendedProperties, "rateLimiterAlgorithm", "leakyBucket").(string)
	// this.status = SafeValue(extendedProperties, "status",map[string]any{}).(map[string]any)
	this.PrecisionMode = int(SafeInteger(extendedProperties, "precisionMode", this.PrecisionMode).(int64))
	this.PaddingMode = int(SafeInteger(extendedProperties, "paddingMode", this.PaddingMode).(int64))
	this.CommonCurrencies = SafeValue(extendedProperties, "commonCurrencies", map[string]any{}).(map[string]any)
	subVal := SafeValue(extendedProperties, "substituteCommonCurrencyCodes", true)
	this.SubstituteCommonCurrencyCodes = subVal != nil && subVal.(bool)
	this.Name = SafeString(extendedProperties, "name", "").(string)
	this.HttpsProxy = SafeString(extendedProperties, "httpsProxy", nil)
	this.HttpProxy = SafeString(extendedProperties, "httpProxy", nil)
	this.NewUpdates = SafeValue(extendedProperties, "newUpdates", true).(bool)
	this.Accounts = SafeValue(extendedProperties, "accounts", []any{}).([]any)

	this.HttpExceptions = SafeValue(extendedProperties, "httpExceptions", map[string]any{}).(map[string]any)
	this.Headers = SafeValue(extendedProperties, "headers", map[string]any{}).(map[string]any)
	this.ReduceFees = SafeValue(extendedProperties, "reduceFees", true).(bool)

	this.ReturnResponseHeaders = SafeValue(extendedProperties, "returnResponseHeaders", false).(bool)
	this.FetchHistoryCacheSize = SafeValue(extendedProperties, "fetchHistoryCacheSize", 0).(int)
}

func (this *BaseExchange) MapToSafeMap(input map[string]any) *sync.Map {
	if input == nil {
		return nil
	}
	var sm sync.Map
	for k, v := range input {
		sm.Store(k, v)
	}
	return &sm
}

func (this *BaseExchange) SafeMapToMap(sm *sync.Map) map[string]any {
	if sm == nil {
		return nil
	}
	result := make(map[string]any)
	sm.Range(func(key, value any) bool {
		if strKey, ok := key.(string); ok {
			result[strKey] = value
		}
		return true
	})
	return result
}
