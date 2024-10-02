package ccxt

// Exchange interface based on the methods from binance.go
type IExchange interface {
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
