package ccxt

import "sync"

type IBaseExchange interface {
	SetEnableRateLimit(rateLimit bool)
	ExtendExchangeOptions(options interface{})
	GetSymbols() []string
	SetWssProxy(wssProxy interface{})
	SetWsProxy(wsProxy interface{})
	GetAlias() interface{}
	GetTimeframes() map[string]interface{}
	GetFeatures() map[string]interface{}
	GetCache() *sync.Map
	GetRequiredCredentials() map[string]interface{}
	SetTimeout(timeout interface{})
	SetHttpsProxy(httpsProxy interface{})
	SetHttpProxy(httpProxy interface{})
	SetCurrencies(currencies interface{})
	SetPrivateKey(privateKey interface{})
	SetAccountId(privateKey interface{})
	SetWalletAddress(walletAddress interface{})
	SetSecret(secret interface{})
	SetUid(uid interface{})
	SetPassword(password interface{})
	SetApiKey(apiKey interface{})
	SetAccounts(account interface{})
	SetVerbose(verbose interface{})
	GetLast_request_url() interface{}
	GetLast_request_body() interface{}
	GetLast_request_headers() map[string]interface{}
	GetReturnResponseHeaders() bool
	SetReturnResponseHeaders(val interface{})
	GetHas() map[string]interface{}
	GetId() string
	GetHostname() string
	GetUrls() interface{}
	GetApi() map[string]interface{}
	GetOptions() *sync.Map
	GetCurrencies() *sync.Map
	GetMarkets() *sync.Map
	SetSandboxMode(enable interface{})
	EnableDemoTrading(enable interface{})
	LoadMarkets(params ...interface{}) (map[string]MarketInterface, error)
	SetProxyUrl(proxyUrl interface{})
	SetSocksProxy(proxyUrl interface{})
	SignIn(optionalArgs ...interface{}) <-chan interface{}
	Market(symbol interface{}) interface{}
	Currency(code interface{}) interface{}
	GetMarket(symbol string) MarketInterface
	GetMarketsList() []MarketInterface
	GetCurrency(currencyId string) Currency
	GetCurrenciesList() []Currency
	Throttle(cost interface{}) <-chan interface{}
	Close() []error
	// methods from base
}

// Exchange interface based on the methods from binance.go
type ICoreExchange interface {
	Spawn(method interface{}, args ...interface{}) *Future
	SetEnableRateLimit(rateLimit bool)
	ExtendExchangeOptions(options interface{})
	GetSymbols() []string
	SetWssProxy(wssProxy interface{})
	SetWsProxy(wsProxy interface{})
	GetAlias() interface{}
	GetTimeframes() map[string]interface{}
	GetFeatures() map[string]interface{}
	GetCache() *sync.Map
	GetRequiredCredentials() map[string]interface{}
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
	SetAccounts(account interface{})
	SetVerbose(verbose interface{})
	GetLast_request_url() interface{}
	GetLast_request_body() interface{}
	GetLast_request_headers() map[string]interface{}
	GetReturnResponseHeaders() bool
	SetReturnResponseHeaders(val interface{})
	GetHas() map[string]interface{}
	GetId() string
	GetHostname() string
	GetUrls() interface{}
	GetApi() map[string]interface{}
	GetOptions() *sync.Map
	GetCurrencies() *sync.Map
	GetMarkets() *sync.Map
	CheckRequiredCredentials(optionalArgs ...interface{}) interface{}
	Sleep(milliseconds interface{}) <-chan bool
	Json(object interface{}) interface{}
	FilterBy(aa interface{}, key interface{}, value interface{}) []interface{}
	IndexBy(array interface{}, key interface{}) map[string]interface{}
	CreateOrder(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	Sum(args ...interface{}) interface{}
	NumberToString(num interface{}) interface{}
	ParseToNumeric(value interface{}) interface{}
	LoadMarkets(params ...interface{}) <-chan interface{}
	SafeDict(dictionary interface{}, key interface{}, defaultValue ...interface{}) interface{}
	InArray(needle interface{}, haystack interface{}) bool
	DeepExtend(objs ...interface{}) map[string]interface{}
	ParseToInt(value interface{}) interface{}
	SafeValue(value interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeBool(value interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeString(obj interface{}, key interface{}, defaultValue ...interface{}) interface{}
	Describe() interface{}
	SetSandboxMode(enable interface{})
	FeatureValue(symbol interface{}, optionalArgs ...interface{}) interface{}
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
	SetFetchResponse(fetchResponse interface{})
	Init(params map[string]interface{})
	FetchDeposits(optionalArgs ...interface{}) <-chan interface{}
	Milliseconds() int64
	ParseNumber(v interface{}, a ...interface{}) interface{}
	OmitZero(v interface{}) interface{}
	FetchOHLCV(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	ParseTimeframe(timeframe interface{}) interface{}
	FetchLeverageTiers(optionalArgs ...interface{}) <-chan interface{}
	FetchMarginMode(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchMarketLeverageTiers(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOrders(optionalArgs ...interface{}) <-chan interface{}
	SafeCurrency(currencyId interface{}, optionalArgs ...interface{}) interface{}
	Parse8601(datetime2 interface{}) interface{}
	Iso8601(ts2 interface{}) interface{}
	FetchPositions(optionalArgs ...interface{}) <-chan interface{}
	FetchPosition(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchClosedOrders(optionalArgs ...interface{}) <-chan interface{}
	FetchOpenOrders(optionalArgs ...interface{}) <-chan interface{}
	FetchTransactions(optionalArgs ...interface{}) <-chan interface{}
	FetchFundingHistory(optionalArgs ...interface{}) <-chan interface{}
	FetchTradingFee(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchTradingFees(optionalArgs ...interface{}) <-chan interface{}
	FetchLedger(optionalArgs ...interface{}) <-chan interface{}
	ArrayConcat(aa, bb interface{}) interface{}
	FetchAccounts(optionalArgs ...interface{}) <-chan interface{}
	FetchBorrowInterest(optionalArgs ...interface{}) <-chan interface{}
	FetchL2OrderBook(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchLiquidations(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchLedgerEntry(id interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchFundingRateHistory(optionalArgs ...interface{}) <-chan interface{}
	FetchMyTrades(optionalArgs ...interface{}) <-chan interface{}
	FetchOpenInterestHistory(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOrderBooks(optionalArgs ...interface{}) <-chan interface{}
	FetchTickers(optionalArgs ...interface{}) <-chan interface{}
	FetchTrades(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchWithdrawals(optionalArgs ...interface{}) <-chan interface{}
	Currency(code interface{}) interface{}
	ParseDate(datetime2 interface{}) interface{}
	RoundTimeframe(timeframe interface{}, timestamp interface{}, direction ...interface{}) interface{}
	Extend(aa interface{}, bb ...interface{}) map[string]interface{}
	SafeValue2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{}
	GroupBy(trades interface{}, key2 interface{}) map[string]interface{}
	DecimalToPrecision(value interface{}, roundingMode interface{}, numPrecisionDigits interface{}, args ...interface{}) interface{}
	SafeValueN(obj interface{}, keys interface{}, defaultValue ...interface{}) interface{}
	SafeDict2(dictionary interface{}, key1 interface{}, key2 interface{}, optionalArgs ...interface{}) interface{}
	SafeString2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{}
	SafeStringUpper2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{}
	SafeInteger2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{}
	SafeIntegerN(obj interface{}, keys []interface{}, defaultValue ...interface{}) interface{}
	SafeIntegerProductN(obj interface{}, keys []interface{}, multiplier interface{}, defaultValue ...interface{}) interface{}
	SafeFloat2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{}
	SafeFloat(obj interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeStringLowerN(obj interface{}, keys2 interface{}, defaultValue ...interface{}) interface{}
	SafeStringUpperN(obj interface{}, keys []interface{}, defaultValue ...interface{}) interface{}
	SafeInteger(obj interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeStringUpper(obj interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeStringLower(obj interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeStringLower2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{}
	SafeFloatN(obj interface{}, keys []interface{}, defaultValue ...interface{}) interface{}
	SafeStringN(obj interface{}, keys2 interface{}, defaultValue ...interface{}) interface{}
	SafeIntegerOmitZero(obj interface{}, key interface{}, optionalArgs ...interface{}) interface{}
	SafeIntegerProduct(obj interface{}, key interface{}, multiplier interface{}, defaultValue ...interface{}) interface{}
	SafeIntegerProduct2(obj interface{}, key1, key2 interface{}, multiplier interface{}, defaultValue ...interface{}) interface{}
	SafeBoolN(dictionaryOrList interface{}, keys interface{}, optionalArgs ...interface{}) interface{}
	SafeBool2(dictionary interface{}, key1 interface{}, key2 interface{}, optionalArgs ...interface{}) interface{}
	SafeNumber(obj interface{}, key interface{}, optionalArgs ...interface{}) interface{}
	SafeNumber2(dictionary interface{}, key1 interface{}, key2 interface{}, optionalArgs ...interface{}) interface{}
	SafeNumberOmitZero(obj interface{}, key interface{}, optionalArgs ...interface{}) interface{}
	SafeDictN(dictionaryOrList interface{}, keys interface{}, optionalArgs ...interface{}) interface{}
	SafeListN(dictionaryOrList interface{}, keys interface{}, optionalArgs ...interface{}) interface{}
	SafeList(dictionaryOrList interface{}, key interface{}, optionalArgs ...interface{}) interface{}
	SafeTimestamp(obj interface{}, key interface{}, defaultValue ...interface{}) interface{}
	SafeNumberN(obj interface{}, arr interface{}, optionalArgs ...interface{}) interface{}
	SafeTimestamp2(obj interface{}, key1, key2 interface{}, defaultValue ...interface{}) interface{}
	SafeTimestampN(obj interface{}, keys []interface{}, defaultValue ...interface{}) interface{}
	SafeList2(dictionaryOrList interface{}, key1 interface{}, key2 interface{}, optionalArgs ...interface{}) interface{}
	Omit(a interface{}, parameters ...interface{}) interface{}
	CheckProxyUrlSettings(optionalArgs ...interface{}) interface{}
	CheckProxySettings(optionalArgs ...interface{}) interface{}
	IsTickPrecision() interface{}
	SetProperty(obj interface{}, property interface{}, defaultValue interface{})
	GetProperty(obj interface{}, property interface{}) interface{}
	ExceptionMessage(exc interface{}, includeStack ...interface{}) interface{}
	SetProxyUrl(proxyUrl interface{})
	SetSocksProxy(proxyUrl interface{})
	SignIn(optionalArgs ...interface{}) <-chan interface{}
	SortBy(array interface{}, value1 interface{}, desc2 ...interface{}) []interface{}
	CallInternal(name2 string, args ...interface{}) <-chan interface{}
	WarmUpCache()
	GetItf() interface{}
	ConvertToSafeDictionary(data interface{}) interface{}
	CreateSafeDictionary() *sync.Map
	SetOptions(options interface{})
	CreateOrders(orders interface{}, optionalArgs ...interface{}) <-chan interface{}
	Withdraw(code interface{}, amount interface{}, address interface{}, optionalArgs ...interface{}) <-chan interface{}
	// WS methods
	CancelAllOrdersWs(optionalArgs ...interface{}) <-chan interface{}
	CancelOrdersWs(ids interface{}, optionalArgs ...interface{}) <-chan interface{}
	CancelOrderWs(id interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateLimitBuyOrderWs(symbol interface{}, amount interface{}, price interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateLimitOrderWs(symbol interface{}, side interface{}, amount interface{}, price interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateLimitSellOrderWs(symbol interface{}, amount interface{}, price interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateMarketBuyOrderWs(symbol interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateMarketOrderWithCostWs(symbol interface{}, side interface{}, cost interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateMarketOrderWs(symbol interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateMarketSellOrderWs(symbol interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateOrdersWs(orders interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateOrderWithTakeProfitAndStopLossWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateOrderWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreatePostOnlyOrderWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateReduceOnlyOrderWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateStopLimitOrderWs(symbol interface{}, side interface{}, amount interface{}, price interface{}, triggerPrice interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateStopLossOrderWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateStopMarketOrderWs(symbol interface{}, side interface{}, amount interface{}, triggerPrice interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateStopOrderWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateTakeProfitOrderWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateTrailingAmountOrderWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateTrailingPercentOrderWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateTriggerOrderWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	EditOrderWs(id interface{}, symbol interface{}, typeVar interface{}, side interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchBalanceWs(optionalArgs ...interface{}) <-chan interface{}
	FetchClosedOrdersWs(optionalArgs ...interface{}) <-chan interface{}
	// FetchCurrenciesWs(optionalArgs ...interface{}) <-chan interface{}
	FetchDepositsWs(optionalArgs ...interface{}) <-chan interface{}
	// FetchMarketsWs(optionalArgs ...interface{}) <-chan interface{}
	FetchMyTradesWs(optionalArgs ...interface{}) <-chan interface{}
	FetchOHLCVWs(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOpenOrdersWs(optionalArgs ...interface{}) <-chan interface{}
	FetchOrderBookWs(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOrdersByStatusWs(status interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOrdersWs(optionalArgs ...interface{}) <-chan interface{}
	FetchOrderWs(id interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchPositionsForSymbolWs(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchPositionsWs(optionalArgs ...interface{}) <-chan interface{}
	FetchPositionWs(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchTickersWs(optionalArgs ...interface{}) <-chan interface{}
	FetchTickerWs(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchTradesWs(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchTradingFeesWs(optionalArgs ...interface{}) <-chan interface{}
	FetchWithdrawalsWs(optionalArgs ...interface{}) <-chan interface{}
	UnWatchBidsAsks(optionalArgs ...interface{}) <-chan interface{}
	UnWatchMyTrades(optionalArgs ...interface{}) <-chan interface{}
	UnWatchOHLCV(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	UnWatchOHLCVForSymbols(symbolsAndTimeframes interface{}, optionalArgs ...interface{}) <-chan interface{}
	UnWatchOrderBook(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	UnWatchOrderBookForSymbols(symbols interface{}, optionalArgs ...interface{}) <-chan interface{}
	UnWatchOrders(optionalArgs ...interface{}) <-chan interface{}
	UnWatchPositions(optionalArgs ...interface{}) <-chan interface{}
	UnWatchTickers(optionalArgs ...interface{}) <-chan interface{}
	UnWatchMarkPrice(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	UnWatchMarkPrices(optionalArgs ...interface{}) <-chan interface{}
	UnWatchTrades(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	UnWatchTradesForSymbols(symbols interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchBalance(optionalArgs ...interface{}) <-chan interface{}
	WatchBidsAsks(optionalArgs ...interface{}) <-chan interface{}
	WatchLiquidations(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchLiquidationsForSymbols(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchMarkPrice(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchMarkPrices(optionalArgs ...interface{}) <-chan interface{}
	WatchMyLiquidations(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchMyLiquidationsForSymbols(symbols interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchMyTrades(optionalArgs ...interface{}) <-chan interface{}
	WatchMyTradesForSymbols(symbols interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchOHLCV(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchOHLCVForSymbols(symbolsAndTimeframes interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchOrderBook(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchOrderBookForSymbols(symbols interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchOrders(optionalArgs ...interface{}) <-chan interface{}
	WatchOrdersForSymbols(symbols interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchPosition(optionalArgs ...interface{}) <-chan interface{}
	WatchPositions(optionalArgs ...interface{}) <-chan interface{}
	WatchTicker(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchTickers(optionalArgs ...interface{}) <-chan interface{}
	WatchTrades(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchTradesForSymbols(symbols interface{}, optionalArgs ...interface{}) <-chan interface{}
	WithdrawWs(code interface{}, amount interface{}, address interface{}, optionalArgs ...interface{}) <-chan interface{}
	Close() []error
}

type IDerivedExchange interface {
	HandleDelta(bookside interface{}, delta interface{})
	GetCacheIndex(orderbook interface{}, deltas interface{}) interface{}
	Ping(client interface{}) interface{}
	HandleDeltas(orderbook interface{}, deltas interface{})
	ParseLeverage(leverage interface{}, optionalArgs ...interface{}) interface{}
	ParseOHLCV(ohlcv interface{}, optionalArgs ...interface{}) interface{}
	ParseTrade(trade interface{}, optionalArgs ...interface{}) interface{}
	ParseTrades(trades interface{}, optionalArgs ...interface{}) interface{}
	ParseGreeks(greeks interface{}, optionalArgs ...interface{}) interface{}
	ParseMarket(market interface{}) interface{}
	ParseCurrency(rawCurrency interface{}) interface{}
	ParseTransaction(transaction interface{}, optionalArgs ...interface{}) interface{}
	ParseTransfer(transfer interface{}, optionalArgs ...interface{}) interface{}
	ParseAccount(account interface{}) interface{}
	ParseLedgerEntry(item interface{}, optionalArgs ...interface{}) interface{}
	ParseLastPrice(item interface{}, optionalArgs ...interface{}) interface{}
	ParseOrder(order interface{}, optionalArgs ...interface{}) interface{}
	ParseTicker(ticker interface{}, optionalArgs ...interface{}) interface{}
	ParseTickers(tickers interface{}, optionalArgs ...interface{}) interface{}
	ParseOrderBook(orderbook interface{}, symbol interface{}, optionalArgs ...interface{}) interface{}
	ParsePosition(position interface{}, optionalArgs ...interface{}) interface{}
	SafeMarketStructure(optionalArgs ...interface{}) interface{}
	ParseOpenInterest(interest interface{}, optionalArgs ...interface{}) interface{}
	ParseLiquidation(liquidation interface{}, optionalArgs ...interface{}) interface{}
	ParseIncome(info interface{}, optionalArgs ...interface{}) interface{}
	ParseMarginMode(marginMode interface{}, optionalArgs ...interface{}) interface{}
	ParseBorrowInterest(info interface{}, optionalArgs ...interface{}) interface{}
	ParseOption(chain interface{}, optionalArgs ...interface{}) interface{}
	ParseDepositWithdrawFee(fee interface{}, optionalArgs ...interface{}) interface{}
	CreateOrder(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	ParseMarketLeverageTiers(info interface{}, optionalArgs ...interface{}) interface{}
	FetchMarginModes(optionalArgs ...interface{}) <-chan interface{}
	FetchOrderBook(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	ParseBidsAsks(bidasks interface{}, optionalArgs ...interface{}) interface{}
	FetchLeverages(optionalArgs ...interface{}) <-chan interface{}
	SafeMarket(optionalArgs ...interface{}) interface{}
	FetchTickers(optionalArgs ...interface{}) <-chan interface{}
	Sign(path interface{}, optionalArgs ...interface{}) interface{}
	FetchBalance(optionalArgs ...interface{}) <-chan interface{}
	CancelOrder(id interface{}, optionalArgs ...interface{}) <-chan interface{}
	CancelOrders(ids interface{}, optionalArgs ...interface{}) <-chan interface{}
	CancelOrdersWithClientOrderIds(clientOrderIds interface{}, optionalArgs ...interface{}) <-chan interface{}
	CancelOrderWithClientOrderId(clientOrderId interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchDepositWithdrawFees(optionalArgs ...interface{}) <-chan interface{}
	EditOrder(id interface{}, symbol interface{}, typeVar interface{}, side interface{}, optionalArgs ...interface{}) <-chan interface{}
	EditOrderWithClientOrderId(clientOrderId interface{}, symbol interface{}, typeVar interface{}, side interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOrder(id interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOrderWithClientOrderId(clientOrderId interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOrders(optionalArgs ...interface{}) <-chan interface{}
	CreateExpiredOptionMarket(symbol interface{}) interface{}
	FetchTime(optionalArgs ...interface{}) <-chan interface{}
	FetchLeverageTiers(optionalArgs ...interface{}) <-chan interface{}
	ParseDepositAddresses(addresses interface{}, optionalArgs ...interface{}) interface{}
	FetchTradingFees(optionalArgs ...interface{}) <-chan interface{}
	ParseDepositAddress(depositAddress interface{}, optionalArgs ...interface{}) interface{}
	ParseBorrowRate(info interface{}, optionalArgs ...interface{}) interface{}
	ParseFundingRateHistory(info interface{}, optionalArgs ...interface{}) interface{}
	ParseFundingRate(contract interface{}, optionalArgs ...interface{}) interface{}
	FetchOHLCV(symbol interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchFundingRates(optionalArgs ...interface{}) <-chan interface{}
	FetchFundingIntervals(optionalArgs ...interface{}) <-chan interface{}
	FetchPositionsHistory(optionalArgs ...interface{}) <-chan interface{}
	FetchDepositsWithdrawals(optionalArgs ...interface{}) <-chan interface{}
	ParseMarginModification(data interface{}, optionalArgs ...interface{}) interface{}
	FetchMarkets(optionalArgs ...interface{}) <-chan interface{}
	FetchCurrencies(optionalArgs ...interface{}) <-chan interface{}
	FetchAccounts(optionalArgs ...interface{}) <-chan interface{}
	SetSandboxMode(enabled interface{})
	Market(symbol interface{}) interface{}
	ParseConversion(conversion interface{}, optionalArgs ...interface{}) interface{}
	SafeCurrencyCode(currencyId interface{}, optionalArgs ...interface{}) interface{}
	HandleErrors(statusCode interface{}, statusText interface{}, url interface{}, method interface{}, responseHeaders interface{}, responseBody interface{}, response interface{}, requestHeaders interface{}, requestBody interface{}) interface{}
	HandleMessage(client interface{}, message interface{})
	OnError(client interface{}, err interface{})
	OnClose(client interface{}, err interface{})
	OnConnected(client interface{}, err interface{})
	CancelOrderWs(id interface{}, optionalArgs ...interface{}) <-chan interface{}
	CreateOrderWs(symbol interface{}, typeVar interface{}, side interface{}, amount interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchPositions(optionalArgs ...interface{}) <-chan interface{}
	FetchTickersWs(optionalArgs ...interface{}) <-chan interface{}
	WatchLiquidationsForSymbols(symbols interface{}, optionalArgs ...interface{}) <-chan interface{}
	WatchMyLiquidationsForSymbols(symbols interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOrdersWs(optionalArgs ...interface{}) <-chan interface{}
	ParseWsTrade(trade interface{}, optionalArgs ...interface{}) interface{}
}

type Describer interface {
	Describe() interface{}
}
