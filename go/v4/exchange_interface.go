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
	EditOrder(id any, symbol any, typeVar any, side any, optionalArgs ...any) <-chan any
}
type IEditOrderWithClientOrderId interface {
	EditOrderWithClientOrderId(clientOrderId any, symbol any, typeVar any, side any, optionalArgs ...any) <-chan any
}
type ICancelOrderWithClientOrderId interface {
	CancelOrderWithClientOrderId(clientOrderId any, optionalArgs ...any) <-chan any
}
type ICancelOrdersWithClientOrderIds interface {
	CancelOrdersWithClientOrderIds(clientOrderIds any, optionalArgs ...any) <-chan any
}
type IFetchL2OrderBook interface {
	FetchL2OrderBook(symbol any, optionalArgs ...any) <-chan any
}
type IFetchOpenOrders interface {
	FetchOpenOrders(optionalArgs ...any) <-chan any
}
type IFetchOrder interface {
	FetchOrder(id any, optionalArgs ...any) <-chan any
}
type IFetchOrderWithClientOrderId interface {
	FetchOrderWithClientOrderId(clientOrderId any, optionalArgs ...any) <-chan any
}
type IFetchPositions interface {
	FetchPositions(optionalArgs ...any) <-chan any
}
type IFetchTickers interface {
	FetchTickers(optionalArgs ...any) <-chan any
}
type ICancelOrderWs interface {
	CancelOrderWs(id any, optionalArgs ...any) <-chan any
}
type ICreateOrderWs interface {
	CreateOrderWs(symbol any, typeVar any, side any, amount any, optionalArgs ...any) <-chan any
}
type IFetchOrdersWs interface {
	FetchOrdersWs(optionalArgs ...any) <-chan any
}
type IFetchTickersWs interface {
	FetchTickersWs(optionalArgs ...any) <-chan any
}
type IFetchPositionsHistory interface {
	FetchPositionsHistory(optionalArgs ...any) <-chan any
}
type IFetchBidsAsks interface {
	FetchBidsAsks(optionalArgs ...any) <-chan any
}
type IWatchBidsAsks interface {
	WatchBidsAsks(optionalArgs ...any) <-chan any
}
type IWatchOrderBookForSymbols interface {
	WatchOrderBookForSymbols(symbols any, optionalArgs ...any) <-chan any
}
type IWatchPosition interface {
	WatchPosition(optionalArgs ...any) <-chan any
}
type IWatchTradesForSymbols interface {
	WatchTradesForSymbols(symbols any, optionalArgs ...any) <-chan any
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
	SignIn(optionalArgs ...any) <-chan any
	Market(symbol any) any
	Currency(code any) any
	GetMarket(symbol string) MarketInterface
	GetMarketsList() []MarketInterface
	GetCurrency(currencyId string) Currency
	GetCurrenciesList() []Currency
	Throttle(cost any) <-chan any
	Close(cleanInstanceCache ...any) []error
	ParseTimeframe(timeframe any) any
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
	CheckRequiredCredentials(optionalArgs ...any) any
	Sleep(milliseconds any) <-chan bool
	Json(object any) any
	FilterBy(aa any, key any, value any) []any
	IndexBy(array any, key any) map[string]any
	CreateOrder(symbol any, typeVar any, side any, amount any, optionalArgs ...any) <-chan any
	Sum(args ...any) any
	NumberToString(num any) any
	ParseToNumeric(value any) any
	LoadMarkets(params ...any) <-chan any
	SetMarkets(markets any, optionalArgs ...any) any
	SafeDict(dictionary any, key any, defaultValue ...any) any
	IsDictionary(dictionary any) any
	InArray(needle any, haystack any) bool
	DeepExtend(objs ...any) map[string]any
	ParseToInt(value any) any
	SafeValue(value any, key any, defaultValue ...any) any
	SafeBool(value any, key any, defaultValue ...any) any
	SafeString(obj any, key any, defaultValue ...any) any
	Describe() any
	SetSandboxMode(enable any)
	FeatureValue(symbol any, optionalArgs ...any) any
	Market(symbol any) any
	Nonce() any
	FetchTime(optionalArgs ...any) <-chan any
	FetchCurrencies(optionalArgs ...any) <-chan any
	FetchMarkets(optionalArgs ...any) <-chan any
	FetchBalance(optionalArgs ...any) <-chan any
	FetchOrderBook(symbol any, optionalArgs ...any) <-chan any
	FetchStatus(optionalArgs ...any) <-chan any
	FetchTicker(symbol any, optionalArgs ...any) <-chan any
	FetchLastPrices(optionalArgs ...any) <-chan any
	ParseOpenInterest(interest any, optionalArgs ...any) any
	FetchMyLiquidations(optionalArgs ...any) <-chan any
	ParseLiquidation(liquidation any, optionalArgs ...any) any
	FetchGreeks(symbol any, optionalArgs ...any) <-chan any
	ParseGreeks(greeks any, optionalArgs ...any) any
	FetchTradingLimits(optionalArgs ...any) <-chan any
	FetchPositionMode(optionalArgs ...any) <-chan any
	FetchMarginModes(optionalArgs ...any) <-chan any
	FetchOption(symbol any, optionalArgs ...any) <-chan any
	FetchMarginAdjustmentHistory(optionalArgs ...any) <-chan any
	FetchConvertCurrencies(optionalArgs ...any) <-chan any
	FetchConvertQuote(fromCode any, toCode any, optionalArgs ...any) <-chan any
	CreateConvertTrade(id any, fromCode any, toCode any, optionalArgs ...any) <-chan any
	FetchConvertTrade(id any, optionalArgs ...any) <-chan any
	FetchConvertTradeHistory(optionalArgs ...any) <-chan any
	SetFetchResponse(fetchResponse any)
	Init(params map[string]any)
	FetchDeposits(optionalArgs ...any) <-chan any
	Milliseconds() int64
	ParseNumber(v any, a ...any) any
	OmitZero(v any) any
	FetchOHLCV(symbol any, optionalArgs ...any) <-chan any
	FetchLeverageTiers(optionalArgs ...any) <-chan any
	FetchMarginMode(symbol any, optionalArgs ...any) <-chan any
	FetchMarketLeverageTiers(symbol any, optionalArgs ...any) <-chan any
	FetchOrders(optionalArgs ...any) <-chan any
	SafeCurrency(currencyId any, optionalArgs ...any) any
	Parse8601(datetime2 any) any
	Iso8601(ts2 any) any
	FetchPosition(symbol any, optionalArgs ...any) <-chan any
	FetchClosedOrders(optionalArgs ...any) <-chan any
	FetchTransactions(optionalArgs ...any) <-chan any
	FetchTransfers(optionalArgs ...any) <-chan any
	FetchFundingHistory(optionalArgs ...any) <-chan any
	FetchTradingFee(symbol any, optionalArgs ...any) <-chan any
	FetchTradingFees(optionalArgs ...any) <-chan any
	FetchLedger(optionalArgs ...any) <-chan any
	ArrayConcat(aa, bb any) any
	FetchAccounts(optionalArgs ...any) <-chan any
	FetchBorrowInterest(optionalArgs ...any) <-chan any
	FetchLiquidations(symbol any, optionalArgs ...any) <-chan any
	FetchLedgerEntry(id any, optionalArgs ...any) <-chan any
	FetchFundingRateHistory(optionalArgs ...any) <-chan any
	FetchMyTrades(optionalArgs ...any) <-chan any
	FetchDepositAddressesByNetwork(code any, optionalArgs ...any) <-chan any
	FetchOpenInterestHistory(symbol any, optionalArgs ...any) <-chan any
	FetchOpenInterest(symbol any, optionalArgs ...any) <-chan any
	FetchOpenInterests(optionalArgs ...any) <-chan any
	FetchOrderBooks(optionalArgs ...any) <-chan any
	FetchTrades(symbol any, optionalArgs ...any) <-chan any
	FetchWithdrawals(optionalArgs ...any) <-chan any
	Currency(code any) any
	ParseDate(datetime2 any) any
	RoundTimeframe(timeframe any, timestamp any, direction ...any) any
	Extend(aa any, bb ...any) map[string]any
	SafeValue2(obj any, key any, key2 any, defaultValue ...any) any
	GroupBy(trades any, key2 any) map[string]any
	DecimalToPrecision(value any, roundingMode any, numPrecisionDigits any, args ...any) any
	NetworkCodeToId(networkCode any, optionalArgs ...any) any
	NetworkIdToCode(optionalArgs ...any) any
	SafeValueN(obj any, keys any, defaultValue ...any) any
	SafeDict2(dictionary any, key1 any, key2 any, optionalArgs ...any) any
	SafeString2(obj any, key any, key2 any, defaultValue ...any) any
	SafeStringUpper2(obj any, key any, key2 any, defaultValue ...any) any
	SafeInteger2(obj any, key any, key2 any, defaultValue ...any) any
	SafeIntegerN(obj any, keys []any, defaultValue ...any) any
	SafeIntegerProductN(obj any, keys []any, multiplier any, defaultValue ...any) any
	SafeFloat2(obj any, key any, key2 any, defaultValue ...any) any
	SafeFloat(obj any, key any, defaultValue ...any) any
	SafeStringLowerN(obj any, keys2 any, defaultValue ...any) any
	SafeStringUpperN(obj any, keys []any, defaultValue ...any) any
	SafeInteger(obj any, key any, defaultValue ...any) any
	SafeStringUpper(obj any, key any, defaultValue ...any) any
	SafeStringLower(obj any, key any, defaultValue ...any) any
	SafeStringLower2(obj any, key any, key2 any, defaultValue ...any) any
	SafeFloatN(obj any, keys []any, defaultValue ...any) any
	SafeStringN(obj any, keys2 any, defaultValue ...any) any
	SafeIntegerOmitZero(obj any, key any, optionalArgs ...any) any
	SafeIntegerProduct(obj any, key any, multiplier any, defaultValue ...any) any
	SafeIntegerProduct2(obj any, key1, key2 any, multiplier any, defaultValue ...any) any
	SafeBoolN(dictionaryOrList any, keys any, optionalArgs ...any) any
	SafeBool2(dictionary any, key1 any, key2 any, optionalArgs ...any) any
	SafeNumber(obj any, key any, optionalArgs ...any) any
	SafeNumber2(dictionary any, key1 any, key2 any, optionalArgs ...any) any
	SafeNumberOmitZero(obj any, key any, optionalArgs ...any) any
	IsEmptyString(obj any) any
	SafeDictN(dictionaryOrList any, keys any, optionalArgs ...any) any
	SafeListN(dictionaryOrList any, keys any, optionalArgs ...any) any
	SafeList(dictionaryOrList any, key any, optionalArgs ...any) any
	SafeTimestamp(obj any, key any, defaultValue ...any) any
	SafeNumberN(obj any, arr any, optionalArgs ...any) any
	SafeTimestamp2(obj any, key1, key2 any, defaultValue ...any) any
	SafeTimestampN(obj any, keys []any, defaultValue ...any) any
	SafeList2(dictionaryOrList any, key1 any, key2 any, optionalArgs ...any) any
	Omit(a any, parameters ...any) any
	CheckProxyUrlSettings(optionalArgs ...any) any
	CheckProxySettings(optionalArgs ...any) any
	IsTickPrecision() any
	SetProperty(obj any, property any, defaultValue any)
	Capitalize(value any) string
	GetProperty(obj any, property any, defaultValue ...any) any
	ExceptionMessage(exc any, includeStack ...any) any
	SetProxyUrl(proxyUrl any)
	SetSocksProxy(proxyUrl any)
	SignIn(optionalArgs ...any) <-chan any
	SortBy(array any, value1 any, desc2 ...any) []any
	CallInternal(name2 string, args ...any) <-chan any
	WarmUpCache()
	GetItf() any
	ConvertToSafeDictionary(data any) any
	CreateSafeDictionary(isWs ...bool) *sync.Map
	SetOptions(options any)
	CreateOrders(orders any, optionalArgs ...any) <-chan any
	Withdraw(code any, amount any, address any, optionalArgs ...any) <-chan any
	// WS methods
	FetchBalanceWs(optionalArgs ...any) <-chan any
	// FetchCurrenciesWs(optionalArgs ...any) <-chan any
	FetchDepositsWs(optionalArgs ...any) <-chan any
	// FetchMarketsWs(optionalArgs ...any) <-chan any
	FetchOHLCVWs(symbol any, optionalArgs ...any) <-chan any
	FetchOrdersByStatusWs(status any, optionalArgs ...any) <-chan any
	FetchTradingFeesWs(optionalArgs ...any) <-chan any
	FetchWithdrawalsWs(optionalArgs ...any) <-chan any
	UnWatchBidsAsks(optionalArgs ...any) <-chan any
	UnWatchMyTrades(optionalArgs ...any) <-chan any
	UnWatchOHLCV(symbol any, optionalArgs ...any) <-chan any
	UnWatchOHLCVForSymbols(symbolsAndTimeframes any, optionalArgs ...any) <-chan any
	UnWatchOrderBook(symbol any, optionalArgs ...any) <-chan any
	UnWatchOrderBookForSymbols(symbols any, optionalArgs ...any) <-chan any
	UnWatchOrders(optionalArgs ...any) <-chan any
	UnWatchPositions(optionalArgs ...any) <-chan any
	UnWatchTickers(optionalArgs ...any) <-chan any
	UnWatchMarkPrice(symbol any, optionalArgs ...any) <-chan any
	UnWatchMarkPrices(optionalArgs ...any) <-chan any
	UnWatchTrades(symbol any, optionalArgs ...any) <-chan any
	UnWatchTradesForSymbols(symbols any, optionalArgs ...any) <-chan any
	WatchBalance(optionalArgs ...any) <-chan any
	WatchLiquidations(symbol any, optionalArgs ...any) <-chan any
	WatchLiquidationsForSymbols(symbol any, optionalArgs ...any) <-chan any
	WatchMyLiquidations(symbol any, optionalArgs ...any) <-chan any
	WatchMyLiquidationsForSymbols(symbols any, optionalArgs ...any) <-chan any
	WatchMyTrades(optionalArgs ...any) <-chan any
	WatchOHLCV(symbol any, optionalArgs ...any) <-chan any
	WatchOHLCVForSymbols(symbolsAndTimeframes any, optionalArgs ...any) <-chan any
	WatchOrderBook(symbol any, optionalArgs ...any) <-chan any
	WatchOrders(optionalArgs ...any) <-chan any
	WatchPositions(optionalArgs ...any) <-chan any
	WatchTicker(symbol any, optionalArgs ...any) <-chan any
	WatchTickers(optionalArgs ...any) <-chan any
	WatchTrades(symbol any, optionalArgs ...any) <-chan any
	WithdrawWs(code any, amount any, address any, optionalArgs ...any) <-chan any
	Close(cleanInstanceCache ...any) []error
	CleanWsData()
	CleanRestData()
	ParseTimeframe(timeframe any) any
}

type IDerivedExchange interface {
	HandleDelta(bookside any, delta any)
	GetCacheIndex(orderbook any, deltas any) any
	Ping(client any) any
	HandleDeltas(orderbook any, deltas any)
	ParseLeverage(leverage any, optionalArgs ...any) any
	ParseOHLCV(ohlcv any, optionalArgs ...any) any
	ParseTrade(trade any, optionalArgs ...any) any
	ParseTrades(trades any, optionalArgs ...any) any
	ParseGreeks(greeks any, optionalArgs ...any) any
	ParseMarket(market any) any
	ParseCurrency(rawCurrency any) any
	ParseTransaction(transaction any, optionalArgs ...any) any
	ParseTransfer(transfer any, optionalArgs ...any) any
	ParseAccount(account any) any
	ParseLedgerEntry(item any, optionalArgs ...any) any
	ParseLastPrice(item any, optionalArgs ...any) any
	ParseOrder(order any, optionalArgs ...any) any
	ParseTicker(ticker any, optionalArgs ...any) any
	ParseTickers(tickers any, optionalArgs ...any) any
	ParseOrderBook(orderbook any, symbol any, optionalArgs ...any) any
	ParsePosition(position any, optionalArgs ...any) any
	SafeMarketStructure(optionalArgs ...any) any
	ParseOpenInterest(interest any, optionalArgs ...any) any
	ParseLiquidation(liquidation any, optionalArgs ...any) any
	ParseIncome(info any, optionalArgs ...any) any
	ParseMarginMode(marginMode any, optionalArgs ...any) any
	ParseBorrowInterest(info any, optionalArgs ...any) any
	ParseOption(chain any, optionalArgs ...any) any
	ParseDepositWithdrawFee(fee any, optionalArgs ...any) any
	CreateOrder(symbol any, typeVar any, side any, amount any, optionalArgs ...any) <-chan any
	ParseMarketLeverageTiers(info any, optionalArgs ...any) any
	FetchMarginModes(optionalArgs ...any) <-chan any
	FetchOrderBook(symbol any, optionalArgs ...any) <-chan any
	ParseOrderBookBidsAsks(bidasks any, optionalArgs ...any) any
	FetchLeverages(optionalArgs ...any) <-chan any
	SafeMarket(optionalArgs ...any) any
	Sign(path any, optionalArgs ...any) any
	FetchBalance(optionalArgs ...any) <-chan any
	CancelOrder(id any, optionalArgs ...any) <-chan any
	CancelOrders(ids any, optionalArgs ...any) <-chan any
	FetchDepositWithdrawFees(optionalArgs ...any) <-chan any
	FetchOrders(optionalArgs ...any) <-chan any
	CreateExpiredOptionMarket(symbol any) any
	FetchTime(optionalArgs ...any) <-chan any
	FetchEvents(optionalArgs ...any) <-chan any
	FetchOutcome(outcomeSymbol any) <-chan any
	SignEvmTransaction(tx any, privateKey any) any
	FetchLeverageTiers(optionalArgs ...any) <-chan any
	ParseDepositAddresses(addresses any, optionalArgs ...any) any
	FetchTradingFees(optionalArgs ...any) <-chan any
	ParseDepositAddress(depositAddress any, optionalArgs ...any) any
	ParseBorrowRate(info any, optionalArgs ...any) any
	ParseFundingRateHistory(info any, optionalArgs ...any) any
	ParseFundingRate(contract any, optionalArgs ...any) any
	FetchOHLCV(symbol any, optionalArgs ...any) <-chan any
	FetchFundingRates(optionalArgs ...any) <-chan any
	FetchFundingIntervals(optionalArgs ...any) <-chan any
	FetchDepositsWithdrawals(optionalArgs ...any) <-chan any
	ParseMarginModification(data any, optionalArgs ...any) any
	FetchMarkets(optionalArgs ...any) <-chan any
	FetchCurrencies(optionalArgs ...any) <-chan any
	FetchAccounts(optionalArgs ...any) <-chan any
	SetSandboxMode(enabled any)
	Market(symbol any) any
	ParseConversion(conversion any, optionalArgs ...any) any
	SafeCurrencyCode(currencyId any, optionalArgs ...any) any
	HandleErrors(statusCode any, statusText any, url any, method any, responseHeaders any, responseBody any, response any, requestHeaders any, requestBody any) any
	HandleMessage(client any, message any)
	OnError(client any, err any)
	OnClose(client any, err any)
	OnConnected(client any, err any)
	WatchPositions(optionalArgs ...any) <-chan any
	WatchLiquidationsForSymbols(symbols any, optionalArgs ...any) <-chan any
	WatchMyLiquidationsForSymbols(symbols any, optionalArgs ...any) <-chan any
	ParseWsTrade(trade any, optionalArgs ...any) any
	FetchPositionsADLRank(optionalArgs ...any) <-chan any
	ParseADLRank(info any, optionalArgs ...any) any
	FetchDepositAddressesByNetwork(code any, optionalArgs ...any) <-chan any
	FetchOpenInterest(symbol any, optionalArgs ...any) <-chan any
	FetchOpenInterests(optionalArgs ...any) <-chan any
}

type Describer interface {
	Describe() any
}
