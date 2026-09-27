package ccxt

import "sync"

// IPredictionDispatch lets PredictionExchange's base parse loops (parsePredictionTrades →
// parsePredictionTrade, etc.) reach the venue override via this.DerivedExchange instead of calling
// the base NotSupported stub. These parsers are prediction-only (regular cores lack them), so they
// cannot live on the shared IDerivedExchange; the base loops run only on prediction instances, so
// the transpiler type-asserts DerivedExchange to this interface there.
type IPredictionDispatch interface {
	ParsePredictionOrder(order any, optionalArgs ...any) any
	ParsePredictionTrade(trade any, optionalArgs ...any) any
	ParsePredictionPosition(position any, optionalArgs ...any) any
}

// Per-method interfaces for the 62 symbol-based methods that were trimmed from ICoreExchange/
// IDerivedExchange so prediction cores (which lack them) can satisfy those interfaces. The base +
// test transpilers type-assert individual call sites to the single-method interface for exactly the
// method being called — NOT to a bundle. A prediction venue that overrides only some of these (e.g.
// kalshi has FetchTickers but not FetchL2OrderBook) runs the has-gated test for the ones it has, and
// each per-method assertion succeeds because it requires only that one method. Regular venues have
// all of them, so their (regular-only) base dispatch sites satisfy the assertions too.
type IEditOrder interface {
	EditOrderAsync(id string, symbol any, typeVar any, side any, optionalArgs ...any) <-chan AsyncResult[any]
}
type IEditOrderWithClientOrderId interface {
	EditOrderWithClientOrderIdAsync(clientOrderId string, symbol string, typeVar string, side string, optionalArgs ...any) <-chan AsyncResult[any]
}
type ICancelOrderWithClientOrderId interface {
	CancelOrderWithClientOrderIdAsync(clientOrderId string, optionalArgs ...any) <-chan AsyncResult[any]
}
type ICancelOrdersWithClientOrderIds interface {
	CancelOrdersWithClientOrderIdsAsync(clientOrderIds any, optionalArgs ...any) <-chan EndpointResult[[]any]
}
type IFetchL2OrderBook interface {
	FetchL2OrderBookAsync(symbol string, optionalArgs ...any) <-chan EndpointResult[map[string]any]
}
type IFetchOpenOrders interface {
	FetchOpenOrdersAsync(optionalArgs ...any) <-chan AsyncResult[any]
}
type IFetchOrder interface {
	FetchOrderAsync(id any, optionalArgs ...any) <-chan AsyncResult[any]
}
type IFetchOrderWithClientOrderId interface {
	FetchOrderWithClientOrderIdAsync(clientOrderId string, optionalArgs ...any) <-chan AsyncResult[any]
}
type IFetchPositions interface {
	FetchPositionsAsync(optionalArgs ...any) <-chan AsyncResult[any]
}
type IFetchTickers interface {
	FetchTickersAsync(optionalArgs ...any) <-chan AsyncResult[any]
}
type ICancelOrderWs interface {
	CancelOrderWsAsync(id string, optionalArgs ...any) <-chan AsyncResult[any]
}
type ICreateOrderWs interface {
	CreateOrderWsAsync(symbol string, typeVar string, side string, amount any, optionalArgs ...any) <-chan AsyncResult[any]
}
type IFetchOrdersWs interface {
	FetchOrdersWsAsync(optionalArgs ...any) <-chan AsyncResult[any]
}
type IFetchTickersWs interface {
	FetchTickersWsAsync(optionalArgs ...any) <-chan AsyncResult[any]
}
type IFetchPositionsHistory interface {
	FetchPositionsHistoryAsync(optionalArgs ...any) <-chan AsyncResult[any]
}
type IFetchBidsAsks interface {
	FetchBidsAsksAsync(optionalArgs ...any) <-chan AsyncResult[any]
}
type IWatchBidsAsks interface {
	WatchBidsAsksAsync(optionalArgs ...any) <-chan AsyncResult[any]
}
type IWatchOrderBookForSymbols interface {
	WatchOrderBookForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[any]
}
type IWatchPosition interface {
	WatchPositionAsync(optionalArgs ...any) <-chan AsyncResult[any]
}
type IWatchTradesForSymbols interface {
	WatchTradesForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[any]
}

type IBaseExchange interface {
	SetEnableRateLimit(rateLimit bool)
	ExtendExchangeOptions(options any)
	GetSymbols() []string
	SetWssProxy(wssProxy any)
	SetWsProxy(wsProxy any)
	GetAlias() any
	GetTimeframes() map[string]any
	GetFeatures() map[string]any
	GetCache() *sync.Map
	GetRequiredCredentials() map[string]any
	SetTimeout(timeout any)
	SetHttpsProxy(httpsProxy any)
	SetHttpProxy(httpProxy any)
	SetCurrencies(currencies any)
	SetPrivateKey(privateKey any)
	SetAccountId(privateKey any)
	SetWalletAddress(walletAddress any)
	SetSecret(secret any)
	SetUid(uid any)
	SetPassword(password any)
	SetApiKey(apiKey any)
	SetAccounts(account any)
	SetVerbose(verbose any)
	GetLast_request_url() any
	GetLast_request_body() any
	GetLast_request_headers() map[string]any
	GetLast_response_headers() map[string]any
	GetLastResponseHeaders() map[string]any
	GetReturnResponseHeaders() bool
	SetReturnResponseHeaders(val any)
	GetHas() map[string]any
	GetId() string
	GetHostname() string
	GetUrls() any
	GetApi() map[string]any
	GetOptions() *sync.Map
	GetCurrencies() *sync.Map
	GetMarkets() *sync.Map
	SetSandboxMode(enable any)
	EnableDemoTrading(enable any)
	LoadMarkets(params ...any) (map[string]MarketInterface, error)
	SetProxyUrl(proxyUrl any)
	SetSocksProxy(proxyUrl any)
	SignInAsync(optionalArgs ...any) <-chan AsyncResult[any]
	Market(symbol any) map[string]any
	Currency(code any) map[string]any
	GetMarket(symbol string) MarketInterface
	GetMarketsList() []MarketInterface
	GetCurrency(currencyId string) Currency
	GetCurrenciesList() []Currency
	Throttle(cost any) <-chan bool
	Close(cleanInstanceCache ...any) []error
	ParseTimeframe(timeframe any) int64
	// methods from base
}

// Exchange interface based on the methods from binance.go
type ICoreExchange interface {
	Spawn(method any, args ...any) *Future
	SetEnableRateLimit(rateLimit bool)
	ExtendExchangeOptions(options any)
	GetSymbols() []string
	SetWssProxy(wssProxy any)
	SetWsProxy(wsProxy any)
	GetAlias() any
	GetTimeframes() map[string]any
	GetFeatures() map[string]any
	GetCache() *sync.Map
	GetRequiredCredentials() map[string]any
	SetTimeout(timeout any)
	SetHttpsProxy(httpsProxy any)
	SetHttpProxy(httpProxy any)
	SetCurrencies(currencies any)
	SetPrivateKey(privateKey any)
	SetWalletAddress(walletAddress any)
	SetSecret(secret any)
	SetUid(uid any)
	SetPassword(password any)
	SetApiKey(apiKey any)
	SetAccounts(account any)
	SetVerbose(verbose any)
	GetLast_request_url() any
	GetLast_request_body() any
	GetLast_request_headers() map[string]any
	SetFetchHistoryCacheSize(size any)
	GetFetchCache() []any
	GetReturnResponseHeaders() bool
	SetReturnResponseHeaders(val any)
	GetHas() map[string]any
	GetId() string
	GetHostname() string
	GetUrls() any
	GetApi() map[string]any
	GetOptions() *sync.Map
	GetCurrencies() *sync.Map
	GetMarkets() *sync.Map
	CheckRequiredCredentials(optionalArgs ...any) bool
	Sleep(milliseconds any) <-chan bool
	Json(object any) string
	FilterBy(aa any, key any, value any) []any
	IndexBy(array any, key any) map[string]any
	CreateOrderAsync(symbol string, typeVar string, side string, amount any, optionalArgs ...any) <-chan AsyncResult[any]
	Sum(args ...any) any
	NumberToString(num any) *string
	ParseToNumeric(value any) any
	LoadMarketsAsync(params ...any) <-chan AsyncResult[any]
	SetMarkets(markets any, optionalArgs ...any) any
	SafeDict(dictionary any, key any, defaultValue ...any) any
	SafeDictMap(dictionaryOrList any, key any, optionalArgs ...any) map[string]any
	SafeDict2Map(dictionaryOrList any, key1 any, key2 any, optionalArgs ...any) map[string]any
	SafeDictNMap(dictionaryOrList any, keys any, optionalArgs ...any) map[string]any
	IsDictionary(dictionary any) bool
	InArray(needle any, haystack any) bool
	DeepExtend(objs ...any) map[string]any
	ParseToInt(value any) int64
	SafeValue(value any, key any, defaultValue ...any) any
	SafeBool(value any, key any, defaultValue ...any) *bool
	SafeString(obj any, key any, defaultValue ...any) *string
	Describe() any
	SetSandboxMode(enable any)
	FeatureValue(symbol any, optionalArgs ...any) any
	Market(symbol any) map[string]any
	Nonce() any
	IncrementingNonce() any
	Unique(obj any) []any
	FetchTimeAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchCurrenciesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchMarketsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchBalanceAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchOrderBookAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchStatusAsync(optionalArgs ...any) <-chan EndpointResult[map[string]any]
	FetchTickerAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchLastPricesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	ParseOpenInterest(interest any, optionalArgs ...any) map[string]any
	FetchMyLiquidationsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	ParseLiquidation(liquidation any, optionalArgs ...any) any
	FetchGreeksAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	ParseGreeks(greeks any, optionalArgs ...any) any
	FetchTradingLimitsAsync(optionalArgs ...any) <-chan EndpointResult[map[string]any]
	FetchPositionModeAsync(optionalArgs ...any) <-chan EndpointResult[map[string]any]
	FetchMarginModesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchOptionAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchMarginAdjustmentHistoryAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchConvertCurrenciesAsync(optionalArgs ...any) <-chan EndpointResult[map[string]any]
	FetchConvertQuoteAsync(fromCode string, toCode string, optionalArgs ...any) <-chan AsyncResult[any]
	CreateConvertTradeAsync(id string, fromCode string, toCode string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchConvertTradeAsync(id string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchConvertTradeHistoryAsync(optionalArgs ...any) <-chan AsyncResult[any]
	SetFetchResponse(fetchResponse any)
	SetFetchResponseByUrl(responsesByUrl any)
	Init(params map[string]any)
	FetchDepositsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	Milliseconds() int64
	GetCcxtVersion() string
	ParseNumber(v any, a ...any) any
	ParsePrecision(precision any) any
	PrecisionFromString(str2 any) int
	OmitZero(v any) any
	FetchOHLCVAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchLeverageTiersAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchMarginModeAsync(symbol any, optionalArgs ...any) <-chan AsyncResult[any]
	FetchMarketLeverageTiersAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchOrdersAsync(optionalArgs ...any) <-chan AsyncResult[any]
	SafeCurrency(currencyId any, optionalArgs ...any) map[string]any
	Parse8601(datetime2 any) *int64
	Iso8601(ts2 any) *string
	FetchPositionAsync(symbol any, optionalArgs ...any) <-chan AsyncResult[any]
	FetchClosedOrdersAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchTransactionsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchTransfersAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchFundingHistoryAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchTradingFeeAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchTradingFeesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchLedgerAsync(optionalArgs ...any) <-chan AsyncResult[any]
	ArrayConcat(aa, bb any) []any
	FetchAccountsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchBorrowInterestAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchLiquidationsAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchLedgerEntryAsync(id string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchFundingRateHistoryAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchMyTradesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchDepositAddressesByNetworkAsync(code string, optionalArgs ...any) <-chan EndpointResult[map[string]any]
	FetchOpenInterestHistoryAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchOpenInterestAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchOpenInterestsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchOrderBooksAsync(optionalArgs ...any) <-chan EndpointResult[map[string]any]
	FetchTradesAsync(symbol any, optionalArgs ...any) <-chan AsyncResult[any]
	FetchWithdrawalsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	Currency(code any) map[string]any
	ParseDate(datetime2 any) any
	RoundTimeframe(timeframe any, timestamp any, direction ...any) any
	Extend(aa any, bb ...any) map[string]any
	SafeValue2(obj any, key any, key2 any, defaultValue ...any) any
	GroupBy(trades any, key2 any) map[string]any
	DecimalToPrecision(value any, roundingMode any, numPrecisionDigits any, args ...any) string
	NetworkCodeToId(networkCode any, optionalArgs ...any) any
	NetworkIdToCode(optionalArgs ...any) *string
	SafeValueN(obj any, keys any, defaultValue ...any) any
	SafeDict2(dictionary any, key1 any, key2 any, optionalArgs ...any) any
	SafeString2(obj any, key any, key2 any, defaultValue ...any) *string
	SafeStringUpper2(obj any, key any, key2 any, defaultValue ...any) *string
	SafeInteger2(obj any, key any, key2 any, defaultValue ...any) *int64
	SafeIntegerN(obj any, keys []any, defaultValue ...any) *int64
	SafeIntegerProductN(obj any, keys []any, multiplier any, defaultValue ...any) *int64
	SafeFloat2(obj any, key any, key2 any, defaultValue ...any) *float64
	SafeFloat(obj any, key any, defaultValue ...any) *float64
	SafeStringLowerN(obj any, keys []any, defaultValue ...any) *string
	SafeStringUpperN(obj any, keys []any, defaultValue ...any) *string
	SafeInteger(obj any, key any, defaultValue ...any) *int64
	SafeStringUpper(obj any, key any, defaultValue ...any) *string
	SafeStringLower(obj any, key any, defaultValue ...any) *string
	SafeStringLower2(obj any, key any, key2 any, defaultValue ...any) *string
	SafeFloatN(obj any, keys []any, defaultValue ...any) *float64
	SafeStringN(obj any, keys2 any, defaultValue ...any) *string
	SafeIntegerOmitZero(obj any, key any, optionalArgs ...any) any
	SafeIntegerProduct(obj any, key any, multiplier any, defaultValue ...any) *int64
	SafeIntegerProduct2(obj any, key1, key2 any, multiplier any, defaultValue ...any) *int64
	SafeBoolN(dictionaryOrList any, keys any, optionalArgs ...any) *bool
	SafeBool2(dictionary any, key1 any, key2 any, optionalArgs ...any) *bool
	SafeNumber(obj any, key any, optionalArgs ...any) *float64
	SafeNumber2(dictionary any, key1 any, key2 any, optionalArgs ...any) *float64
	SafeNumberOmitZero(obj any, key any, optionalArgs ...any) *float64
	IsEmptyString(obj any) any
	SafeDictN(dictionaryOrList any, keys any, optionalArgs ...any) any
	SafeListN(dictionaryOrList any, keys any, optionalArgs ...any) any
	SafeList(dictionaryOrList any, key any, optionalArgs ...any) any
	SafeTimestamp(obj any, key any, defaultValue ...any) *int64
	SafeNumberN(obj any, arr any, optionalArgs ...any) *float64
	SafeTimestamp2(obj any, key1, key2 any, defaultValue ...any) *int64
	SafeTimestampN(obj any, keys []any, defaultValue ...any) *int64
	SafeList2(dictionaryOrList any, key1 any, key2 any, optionalArgs ...any) any
	Omit(a any, parameters ...any) any
	OmitDict(a map[string]any, parameters ...any) map[string]any
	CheckProxyUrlSettings(optionalArgs ...any) any
	CheckProxySettings(optionalArgs ...any) any
	IsTickPrecision() any
	SetProperty(obj any, property any, defaultValue any)
	Capitalize(value any) string
	GetProperty(obj any, property any, defaultValue ...any) any
	ExceptionMessage(exc any, includeStack ...any) string
	SetProxyUrl(proxyUrl any)
	SetSocksProxy(proxyUrl any)
	SignInAsync(optionalArgs ...any) <-chan AsyncResult[any]
	SortBy(array any, value1 any, desc2 ...any) []any
	CallInternal(name2 string, args ...any) <-chan AsyncResult[any]
	WarmUpCache()
	GetItf() any
	ConvertToSafeDictionary(data any) any
	CreateSafeDictionary(isWs ...bool) *sync.Map
	SetOptions(options any)
	CreateOrdersAsync(orders any, optionalArgs ...any) <-chan AsyncResult[any]
	WithdrawAsync(code string, amount any, address any, optionalArgs ...any) <-chan EndpointResult[map[string]any]
	// WS methods
	FetchBalanceWsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	// FetchCurrenciesWs(optionalArgs ...any) <-chan AsyncResult[any]
	FetchDepositsWsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	// FetchMarketsWs(optionalArgs ...any) <-chan AsyncResult[any]
	FetchOHLCVWsAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchOrdersByStatusWsAsync(status string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchTradingFeesWsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchWithdrawalsWsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchBidsAsksAsync(optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchMyTradesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchOHLCVAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchOHLCVForSymbolsAsync(symbolsAndTimeframes any, optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchOrderBookAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchOrderBookForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchOrdersAsync(optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchPositionsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchTickersAsync(optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchMarkPriceAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchMarkPricesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchTradesAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	UnWatchTradesForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[any]
	WatchBalanceAsync(optionalArgs ...any) <-chan AsyncResult[any]
	WatchLiquidationsAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	WatchLiquidationsForSymbolsAsync(symbol any, optionalArgs ...any) <-chan AsyncResult[any]
	WatchMyLiquidationsAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	WatchMyLiquidationsForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[any]
	WatchMyTradesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	WatchOHLCVAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	WatchOHLCVForSymbolsAsync(symbolsAndTimeframes any, optionalArgs ...any) <-chan AsyncResult[any]
	WatchOrderBookAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	WatchOrdersAsync(optionalArgs ...any) <-chan AsyncResult[any]
	WatchPositionsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	WatchTickerAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	WatchTickersAsync(optionalArgs ...any) <-chan AsyncResult[any]
	WatchTradesAsync(symbol any, optionalArgs ...any) <-chan AsyncResult[any]
	WithdrawWsAsync(code string, amount any, address string, optionalArgs ...any) <-chan AsyncResult[any]
	Close(cleanInstanceCache ...any) []error
	CleanWsData()
	CleanRestData()
	ParseTimeframe(timeframe any) int64
}

type IDerivedExchange interface {
	Nonce() any
	SignInAsync(optionalArgs ...any) <-chan AsyncResult[any]
	HandleDelta(bookside any, delta any)
	GetCacheIndex(orderbook any, deltas any) any
	Ping(client any) any
	HandleDeltas(bookside any, deltas any)
	HandleBookDelta(orderbook any, delta any)
	HandleBookDeltas(orderbook any, deltas any)
	ParseLeverage(leverage any, optionalArgs ...any) any
	ParseOHLCV(ohlcv any, optionalArgs ...any) any
	ParseTrade(trade any, optionalArgs ...any) any
	ParseTrades(trades any, optionalArgs ...any) any
	ParseGreeks(greeks any, optionalArgs ...any) any
	ParseMarket(market any) any
	ParseCurrency(rawCurrency any) map[string]any
	ParseTransaction(transaction any, optionalArgs ...any) map[string]any
	ParseTransfer(transfer any, optionalArgs ...any) map[string]any
	ParseAccount(account any) any
	ParseLedgerEntry(item any, optionalArgs ...any) map[string]any
	ParseLastPrice(item any, optionalArgs ...any) any
	ParseOrder(order any, optionalArgs ...any) map[string]any
	ParseTicker(ticker any, optionalArgs ...any) map[string]any
	ParseTickers(tickers any, optionalArgs ...any) any
	ParseOrderBook(orderbook any, symbol any, optionalArgs ...any) map[string]any
	ParsePosition(position any, optionalArgs ...any) any
	SafeMarketStructure(optionalArgs ...any) map[string]any
	ParseOpenInterest(interest any, optionalArgs ...any) map[string]any
	ParseLiquidation(liquidation any, optionalArgs ...any) any
	ParseIncome(info any, optionalArgs ...any) any
	ParseMarginMode(marginMode any, optionalArgs ...any) any
	ParseBorrowInterest(info any, optionalArgs ...any) any
	ParseOption(chain any, optionalArgs ...any) any
	ParseDepositWithdrawFee(fee any, optionalArgs ...any) any
	CreateOrderAsync(symbol string, typeVar string, side string, amount any, optionalArgs ...any) <-chan AsyncResult[any]
	ParseMarketLeverageTiers(info any, optionalArgs ...any) any
	FetchMarginModesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchOrderBookAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	ParseOrderBookBidsAsks(bidasks any, optionalArgs ...any) any
	FetchLeveragesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	SafeMarket(optionalArgs ...any) map[string]any
	Sign(path string, optionalArgs ...any) any
	FetchBalanceAsync(optionalArgs ...any) <-chan AsyncResult[any]
	CancelOrderAsync(id any, optionalArgs ...any) <-chan AsyncResult[any]
	CancelOrdersAsync(ids any, optionalArgs ...any) <-chan AsyncResult[any]
	FetchDepositWithdrawFeesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchOrdersAsync(optionalArgs ...any) <-chan AsyncResult[any]
	CreateExpiredOptionMarket(symbol any) any
	FetchTimeAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchEventsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchOutcomeAsync(outcomeSymbol any) <-chan AsyncResult[any]
	FetchOutcomesAsync(outcomeSymbols any) <-chan AsyncResult[any]
	SignEvmTransaction(tx any, privateKey any) any
	FetchLeverageTiersAsync(optionalArgs ...any) <-chan AsyncResult[any]
	ParseDepositAddresses(addresses any, optionalArgs ...any) any
	FetchTradingFeesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	ParseDepositAddress(depositAddress any, optionalArgs ...any) any
	ParseBorrowRate(info any, optionalArgs ...any) any
	ParseFundingRateHistory(info any, optionalArgs ...any) any
	ParseFundingRate(contract any, optionalArgs ...any) any
	FetchOHLCVAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchFundingRatesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchFundingIntervalsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchDepositsWithdrawalsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	ParseMarginModification(data any, optionalArgs ...any) any
	FetchMarketsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchCurrenciesAsync(optionalArgs ...any) <-chan AsyncResult[any]
	FetchAccountsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	SetSandboxMode(enabled any)
	Market(symbol any) map[string]any
	ParseConversion(conversion any, optionalArgs ...any) any
	SafeCurrencyCode(currencyId any, optionalArgs ...any) *string
	HandleErrors(statusCode any, statusText any, url any, method any, responseHeaders any, responseBody string, response any, requestHeaders any, requestBody any) any
	HandleMessage(client any, message any)
	OnError(client any, err any)
	OnClose(client any, err any)
	OnConnected(client any, err any)
	WatchPositionsAsync(optionalArgs ...any) <-chan AsyncResult[any]
	WatchLiquidationsForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[any]
	WatchMyLiquidationsForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[any]
	ParseWsTrade(trade any, optionalArgs ...any) any
	FetchPositionsADLRankAsync(optionalArgs ...any) <-chan AsyncResult[any]
	ParseADLRank(info any, optionalArgs ...any) any
	FetchDepositAddressesByNetworkAsync(code string, optionalArgs ...any) <-chan EndpointResult[map[string]any]
	FetchOpenInterestAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[any]
	FetchOpenInterestsAsync(optionalArgs ...any) <-chan AsyncResult[any]
}

type Describer interface {
	Describe() any
}
