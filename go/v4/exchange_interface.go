package ccxt

// IPredictionDispatch lets PredictionExchange's base parse loops (parsePredictionTrades →
// parsePredictionTrade, etc.) reach the venue override via this.DerivedExchange instead of calling
// the base NotSupported stub. These parsers are prediction-only (regular cores lack them), so they
// cannot live on the shared IDerivedExchange; the base loops run only on prediction instances, so
// the transpiler type-asserts DerivedExchange to this interface there.
type IPredictionDispatch interface {
	ParsePredictionOrder(order any, optionalArgs ...any) map[string]any
	ParsePredictionTrade(trade any, optionalArgs ...any) any
	ParsePredictionPosition(position any, optionalArgs ...any) any
}

// createOrder/cancelOrder as prediction venues carry them (a prediction order map); regular venues
// carry them as AsyncResult[Order] through ICreateOrder/ICancelOrder.
type IPredictionCreateOrder interface {
	CreateOrderAsync(outcome string, typeVar string, side string, amount any, optionalArgs ...any) <-chan AsyncResult[PredictionOrder]
}
type IPredictionCancelOrder interface {
	CancelOrderAsync(id any, optionalArgs ...any) <-chan AsyncResult[PredictionOrder]
}

// Per-method interfaces for the 62 symbol-based methods that were trimmed from ICoreExchange/
// IDerivedExchange so prediction cores (which lack them) can satisfy those interfaces. The base +
// test transpilers type-assert individual call sites to the single-method interface for exactly the
// method being called — NOT to a bundle. A prediction venue that overrides only some of these (e.g.
// kalshi has FetchTickers but not FetchL2OrderBook) runs the has-gated test for the ones it has, and
// each per-method assertion succeeds because it requires only that one method. Regular venues have
// all of them, so their (regular-only) base dispatch sites satisfy the assertions too.
type ICreateOrder interface {
	CreateOrderAsync(symbol string, typeVar string, side string, amount any, optionalArgs ...any) <-chan AsyncResult[Order]
}
type ICancelOrder interface {
	CancelOrderAsync(id any, optionalArgs ...any) <-chan AsyncResult[Order]
}
type IEditOrder interface {
	EditOrderAsync(id string, symbol any, typeVar any, side any, optionalArgs ...any) <-chan AsyncResult[Order]
}
type IEditOrderWithClientOrderId interface {
	EditOrderWithClientOrderIdAsync(clientOrderId string, symbol string, typeVar string, side string, optionalArgs ...any) <-chan AsyncResult[Order]
}
type ICancelOrderWithClientOrderId interface {
	CancelOrderWithClientOrderIdAsync(clientOrderId string, optionalArgs ...any) <-chan AsyncResult[Order]
}
type ICancelOrdersWithClientOrderIds interface {
	CancelOrdersWithClientOrderIdsAsync(clientOrderIds any, optionalArgs ...any) <-chan AsyncResult[[]Order]
}
type IFetchL2OrderBook interface {
	FetchL2OrderBookAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[OrderBook]
}
type IFetchOrderBook interface {
	FetchOrderBookAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[OrderBook]
}
type IFetchOpenOrders interface {
	FetchOpenOrdersAsync(optionalArgs ...any) <-chan AsyncResult[[]Order]
}
type IFetchOrder interface {
	FetchOrderAsync(id string, optionalArgs ...any) <-chan AsyncResult[Order]
}
type IFetchOrderWithClientOrderId interface {
	FetchOrderWithClientOrderIdAsync(clientOrderId string, optionalArgs ...any) <-chan AsyncResult[Order]
}
type IFetchPositions interface {
	FetchPositionsAsync(optionalArgs ...any) <-chan AsyncResult[[]Position]
}
type IFetchTicker interface {
	FetchTickerAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[Ticker]
}
type IWatchTicker interface {
	WatchTickerAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[Ticker]
}
type IWatchTickers interface {
	WatchTickersAsync(optionalArgs ...any) <-chan AsyncResult[map[string]Ticker]
}
type IFetchTickers interface {
	FetchTickersAsync(optionalArgs ...any) <-chan AsyncResult[map[string]Ticker]
}
type ICancelOrderWs interface {
	CancelOrderWsAsync(id string, optionalArgs ...any) <-chan AsyncResult[Order]
}
type ICreateOrderWs interface {
	CreateOrderWsAsync(symbol string, typeVar string, side string, amount any, optionalArgs ...any) <-chan AsyncResult[Order]
}
type IFetchOrdersWs interface {
	FetchOrdersWsAsync(optionalArgs ...any) <-chan AsyncResult[[]Order]
}
type IFetchTickersWs interface {
	FetchTickersWsAsync(optionalArgs ...any) <-chan AsyncResult[map[string]Ticker]
}
type IFetchPositionsHistory interface {
	FetchPositionsHistoryAsync(optionalArgs ...any) <-chan AsyncResult[[]Position]
}
type IFetchBidsAsks interface {
	FetchBidsAsksAsync(optionalArgs ...any) <-chan AsyncResult[map[string]Ticker]
}
type IWatchBidsAsks interface {
	WatchBidsAsksAsync(optionalArgs ...any) <-chan AsyncResult[map[string]Ticker]
}
type IWatchOrderBookForSymbols interface {
	WatchOrderBookForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[OrderBookInterface]
}
type IWatchPosition interface {
	WatchPositionAsync(optionalArgs ...any) <-chan AsyncResult[Position]
}
type IWatchTradesForSymbols interface {
	WatchTradesForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[[]Trade]
}

type IFetchTrades interface { // W28
	FetchTradesAsync(symbol any, optionalArgs ...any) <-chan AsyncResult[[]Trade]
}
type IFetchOrders interface { // W28
	FetchOrdersAsync(optionalArgs ...any) <-chan AsyncResult[[]Order]
}
type IFetchClosedOrders interface { // W28
	FetchClosedOrdersAsync(optionalArgs ...any) <-chan AsyncResult[[]Order]
}
type IFetchOHLCV interface { // W28
	FetchOHLCVAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[[]OHLCV]
}
type IFetchPosition interface { // W30
	FetchPositionAsync(symbol any, optionalArgs ...any) <-chan AsyncResult[Position]
}
type IFetchOpenInterest interface { // W30
	FetchOpenInterestAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[OpenInterest]
}
type IFetchStatus interface { // W4
	FetchStatusAsync(optionalArgs ...any) <-chan AsyncResult[Status]
}
type IFetchTradingFee interface { // W3
	FetchTradingFeeAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[TradingFeeInterface]
}
type IFetchMyTrades interface { // W3
	FetchMyTradesAsync(optionalArgs ...any) <-chan AsyncResult[[]Trade]
}
type ICreateOrders interface { // W3
	CreateOrdersAsync(orders []any, optionalArgs ...any) <-chan AsyncResult[[]Order]
}
type ICancelOrders interface { // W3
	CancelOrdersAsync(ids any, optionalArgs ...any) <-chan AsyncResult[[]Order]
}
type IWatchMyTrades interface { // W3
	WatchMyTradesAsync(optionalArgs ...any) <-chan AsyncResult[[]Trade]
}
type IWatchOHLCV interface { // W3
	WatchOHLCVAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[[]OHLCV]
}
type IWatchOrders interface { // W3
	WatchOrdersAsync(optionalArgs ...any) <-chan AsyncResult[[]Order]
}
type IWatchPositions interface { // W3
	WatchPositionsAsync(optionalArgs ...any) <-chan AsyncResult[[]Position]
}
type IWatchTrades interface { // W3
	WatchTradesAsync(symbol any, optionalArgs ...any) <-chan AsyncResult[[]Trade]
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
	GetCache() map[string]any
	GetRequiredCredentials() map[string]any
	SetTimeout(timeout any)
	SetHttpsProxy(httpsProxy any)
	SetHttpProxy(httpProxy any)
	SetCurrencies(currencies any)
	SetPrivateKey(privateKey any)
	SetAccountId(privateKey any)
	SetWalletAddress(walletAddress any)
	SetSecret(secret any)
	SetToken(token any)
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
	GetOptions() map[string]any
	GetCurrencies() map[string]any
	GetMarkets() map[string]any
	GetNetworkAliases() map[string]any
	SetSandboxMode(enable bool)
	EnableDemoTrading(enable bool)
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
	GetCache() map[string]any
	GetRequiredCredentials() map[string]any
	SetTimeout(timeout any)
	SetHttpsProxy(httpsProxy any)
	SetHttpProxy(httpProxy any)
	SetCurrencies(currencies any)
	SetPrivateKey(privateKey any)
	SetWalletAddress(walletAddress any)
	SetSecret(secret any)
	SetToken(token any)
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
	GetOptions() map[string]any
	GetCurrencies() map[string]any
	GetMarkets() map[string]any
	GetNetworkAliases() map[string]any
	CheckRequiredCredentials(optionalArgs ...any) bool
	Sleep(milliseconds any) <-chan bool
	Json(object any) string
	FilterBy(aa any, key any, value any) []any
	IndexBy(array any, key any) map[string]any
	Sum(args ...any) any
	NumberToString(num any) *string
	Base16ToBinary(str any) []byte
	ParseToNumeric(value any) any
	LoadMarketsAsync(params ...any) <-chan AsyncResult[map[string]any]
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
	Describe() map[string]any
	SetSandboxMode(enable bool)
	FeatureValue(symbol any, optionalArgs ...any) any
	Market(symbol any) map[string]any
	Nonce() int64
	IncrementingNonce() int64
	Unique(obj any) []any
	FetchTimeAsync(optionalArgs ...any) <-chan AsyncResult[*int64]
	FetchCurrenciesAsync(optionalArgs ...any) <-chan AsyncResult[map[string]any]
	FetchMarketsAsync(optionalArgs ...any) <-chan AsyncResult[[]MarketInterface]
	FetchBalanceAsync(optionalArgs ...any) <-chan AsyncResult[Balances]
	FetchLastPricesAsync(optionalArgs ...any) <-chan AsyncResult[map[string]LastPrice]
	ParseOpenInterest(interest any, optionalArgs ...any) OpenInterest
	FetchMyLiquidationsAsync(optionalArgs ...any) <-chan AsyncResult[[]Liquidation]
	ParseLiquidation(liquidation any, optionalArgs ...any) any
	FetchGreeksAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[Greeks]
	ParseGreeks(greeks any, optionalArgs ...any) Greeks
	FetchTradingLimitsAsync(optionalArgs ...any) <-chan AsyncResult[map[string]any]
	FetchPositionModeAsync(optionalArgs ...any) <-chan AsyncResult[PositionModeInfo]
	FetchMarginModesAsync(optionalArgs ...any) <-chan AsyncResult[map[string]MarginMode]
	FetchOptionAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[Option]
	FetchMarginAdjustmentHistoryAsync(optionalArgs ...any) <-chan AsyncResult[[]MarginModification]
	FetchConvertCurrenciesAsync(optionalArgs ...any) <-chan AsyncResult[Currencies]
	FetchConvertQuoteAsync(fromCode string, toCode string, optionalArgs ...any) <-chan AsyncResult[Conversion]
	CreateConvertTradeAsync(id string, fromCode string, toCode string, optionalArgs ...any) <-chan AsyncResult[Conversion]
	FetchConvertTradeAsync(id string, optionalArgs ...any) <-chan AsyncResult[Conversion]
	FetchConvertTradeHistoryAsync(optionalArgs ...any) <-chan AsyncResult[[]Conversion]
	SetFetchResponse(fetchResponse any)
	SetFetchResponseByUrl(responsesByUrl any)
	Init(params map[string]any)
	FetchDepositsAsync(optionalArgs ...any) <-chan AsyncResult[[]Transaction]
	Milliseconds() int64
	GetCcxtVersion() string
	ParseNumber(v any, a ...any) *float64
	ParsePrecision(precision any) any
	PrecisionFromString(str2 any) int
	OmitZero(v any) any
	FetchLeverageTiersAsync(optionalArgs ...any) <-chan AsyncResult[LeverageTiers]
	FetchMarginModeAsync(symbol any, optionalArgs ...any) <-chan AsyncResult[MarginMode]
	FetchMarketLeverageTiersAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[[]LeverageTier]
	SafeCurrency(currencyId any, optionalArgs ...any) map[string]any
	Parse8601(datetime2 any) *int64
	Iso8601(ts2 any) *string
	FetchTransactionsAsync(optionalArgs ...any) <-chan AsyncResult[[]Transaction]
	FetchTransfersAsync(optionalArgs ...any) <-chan AsyncResult[[]TransferEntry]
	FetchFundingHistoryAsync(optionalArgs ...any) <-chan AsyncResult[[]FundingHistory]
	FetchTradingFeesAsync(optionalArgs ...any) <-chan AsyncResult[map[string]TradingFeeInterface]
	FetchLedgerAsync(optionalArgs ...any) <-chan AsyncResult[[]LedgerEntry]
	ArrayConcat(aa, bb any) []any
	FetchAccountsAsync(optionalArgs ...any) <-chan AsyncResult[[]Account]
	FetchBorrowInterestAsync(optionalArgs ...any) <-chan AsyncResult[[]BorrowInterest]
	FetchLiquidationsAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[[]Liquidation]
	FetchLedgerEntryAsync(id string, optionalArgs ...any) <-chan AsyncResult[LedgerEntry]
	FetchFundingRateHistoryAsync(optionalArgs ...any) <-chan AsyncResult[[]FundingRateHistory]
	FetchDepositAddressesByNetworkAsync(code string, optionalArgs ...any) <-chan AsyncResult[map[string]DepositAddress]
	FetchOpenInterestHistoryAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[[]OpenInterest]
	FetchOpenInterestsAsync(optionalArgs ...any) <-chan AsyncResult[map[string]OpenInterest]
	FetchOrderBooksAsync(optionalArgs ...any) <-chan AsyncResult[map[string]OrderBook]
	FetchWithdrawalsAsync(optionalArgs ...any) <-chan AsyncResult[[]Transaction]
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
	IsEmptyString(obj any) bool
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
	IsTickPrecision() bool
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
	CreateSafeDictionary(isWs ...bool) map[string]any
	SetOptions(options any)
	WithdrawAsync(code string, amount any, address any, optionalArgs ...any) <-chan AsyncResult[Transaction]
	// WS methods
	FetchBalanceWsAsync(optionalArgs ...any) <-chan AsyncResult[Balances]
	// FetchCurrenciesWs(optionalArgs ...any) <-chan AsyncResult[any]
	FetchDepositsWsAsync(optionalArgs ...any) <-chan AsyncResult[[]Transaction]
	// FetchMarketsWs(optionalArgs ...any) <-chan AsyncResult[any]
	FetchOHLCVWsAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[[]OHLCV]
	FetchOrdersByStatusWsAsync(status string, optionalArgs ...any) <-chan AsyncResult[[]Order]
	FetchTradingFeesWsAsync(optionalArgs ...any) <-chan AsyncResult[map[string]TradingFeeInterface]
	FetchWithdrawalsWsAsync(optionalArgs ...any) <-chan AsyncResult[[]Transaction]
	UnWatchBidsAsksAsync(optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchMyTradesAsync(optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchOHLCVAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchOHLCVForSymbolsAsync(symbolsAndTimeframes any, optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchOrderBookAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchOrderBookForSymbolsAsync(symbols []string, optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchOrdersAsync(optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchPositionsAsync(optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchTickersAsync(optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchMarkPriceAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchMarkPricesAsync(optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchTradesAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[bool]
	UnWatchTradesForSymbolsAsync(symbols []string, optionalArgs ...any) <-chan AsyncResult[bool]
	WatchBalanceAsync(optionalArgs ...any) <-chan AsyncResult[Balances]
	WatchLiquidationsAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[[]Liquidation]
	WatchLiquidationsForSymbolsAsync(symbol any, optionalArgs ...any) <-chan AsyncResult[[]Liquidation]
	WatchMyLiquidationsAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[[]Liquidation]
	WatchMyLiquidationsForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[[]Liquidation]
	WatchOHLCVForSymbolsAsync(symbolsAndTimeframes any, optionalArgs ...any) <-chan AsyncResult[map[string]map[string][]OHLCV]
	WatchOrderBookAsync(symbol string, optionalArgs ...any) <-chan AsyncResult[OrderBookInterface]
	WithdrawWsAsync(code string, amount any, address string, optionalArgs ...any) <-chan AsyncResult[Transaction]
	Close(cleanInstanceCache ...any) []error
	CleanWsData()
	CleanRestData()
	ParseTimeframe(timeframe any) int64
}

type IDerivedExchange interface {
	Nonce() int64
	SignInAsync(optionalArgs ...any) <-chan AsyncResult[any]
	HandleDelta(bookside any, delta any)
	GetCacheIndex(orderbook any, deltas any) any
	Ping(client any) any
	HandleDeltas(bookside any, deltas any)
	HandleBookDelta(orderbook OrderBookInterface, delta any)
	HandleBookDeltas(orderbook OrderBookInterface, deltas any)
	ParseLeverage(leverage any, optionalArgs ...any) Leverage
	ParseOHLCV(ohlcv any, optionalArgs ...any) OHLCV
	ParseTrade(trade any, optionalArgs ...any) Trade
	ParseTrades(trades any, optionalArgs ...any) []any
	ParseGreeks(greeks any, optionalArgs ...any) Greeks
	ParseMarket(market any) map[string]any
	ParseCurrency(rawCurrency any) map[string]any
	ParseTransaction(transaction any, optionalArgs ...any) Transaction
	ParseTransfer(transfer any, optionalArgs ...any) TransferEntry
	ParseAccount(account any) map[string]any
	ParseLedgerEntry(item any, optionalArgs ...any) LedgerEntry
	ParseLastPrice(item any, optionalArgs ...any) any
	ParseOrder(order any, optionalArgs ...any) Order
	ParseTicker(ticker any, optionalArgs ...any) Ticker
	ParseTickers(tickers any, optionalArgs ...any) map[string]any
	ParseOrderBook(orderbook any, symbol any, optionalArgs ...any) map[string]any
	ParsePosition(position any, optionalArgs ...any) Position
	SafeMarketStructure(optionalArgs ...any) map[string]any
	ParseOpenInterest(interest any, optionalArgs ...any) OpenInterest
	ParseLiquidation(liquidation any, optionalArgs ...any) any
	ParseIncome(info any, optionalArgs ...any) any
	ParseMarginMode(marginMode any, optionalArgs ...any) MarginMode
	ParseBorrowInterest(info any, optionalArgs ...any) any
	ParseOption(chain any, optionalArgs ...any) Option
	ParseDepositWithdrawFee(fee any, optionalArgs ...any) map[string]any
	ParseMarketLeverageTiers(info any, optionalArgs ...any) []any
	FetchMarginModesAsync(optionalArgs ...any) <-chan AsyncResult[map[string]MarginMode]
	ParseOrderBookBidsAsks(bidasks any, optionalArgs ...any) any
	FetchLeveragesAsync(optionalArgs ...any) <-chan AsyncResult[map[string]Leverage]
	SafeMarket(optionalArgs ...any) map[string]any
	Sign(path string, optionalArgs ...any) map[string]any
	FetchBalanceAsync(optionalArgs ...any) <-chan AsyncResult[Balances]
	FetchDepositWithdrawFeesAsync(optionalArgs ...any) <-chan AsyncResult[map[string]DepositWithdrawFee]
	CreateExpiredOptionMarket(symbol any) any
	FetchTimeAsync(optionalArgs ...any) <-chan AsyncResult[*int64]
	FetchEventsAsync(optionalArgs ...any) <-chan AsyncResult[[]PredictionEvent]
	FetchOutcomeAsync(outcomeSymbol any) <-chan AsyncResult[PredictionOutcome]
	FetchOutcomesAsync(outcomeSymbols any) <-chan AsyncResult[map[string]PredictionOutcome]
	SignEvmTransaction(tx any, privateKey any) any
	FetchLeverageTiersAsync(optionalArgs ...any) <-chan AsyncResult[LeverageTiers]
	ParseDepositAddresses(addresses any, optionalArgs ...any) []any
	FetchTradingFeesAsync(optionalArgs ...any) <-chan AsyncResult[map[string]TradingFeeInterface]
	ParseDepositAddress(depositAddress any, optionalArgs ...any) DepositAddress
	ParseBorrowRate(info any, optionalArgs ...any) map[string]any
	ParseFundingRateHistory(info any, optionalArgs ...any) any
	ParseFundingRate(contract any, optionalArgs ...any) FundingRate
	FetchFundingRatesAsync(optionalArgs ...any) <-chan AsyncResult[map[string]FundingRate]
	FetchFundingIntervalsAsync(optionalArgs ...any) <-chan AsyncResult[map[string]FundingRate]
	FetchDepositsWithdrawalsAsync(optionalArgs ...any) <-chan AsyncResult[[]Transaction]
	ParseMarginModification(data any, optionalArgs ...any) map[string]any
	FetchMarketsAsync(optionalArgs ...any) <-chan AsyncResult[[]MarketInterface]
	FetchCurrenciesAsync(optionalArgs ...any) <-chan AsyncResult[map[string]any]
	FetchAccountsAsync(optionalArgs ...any) <-chan AsyncResult[[]Account]
	SetSandboxMode(enabled bool)
	Market(symbol any) map[string]any
	ParseConversion(conversion any, optionalArgs ...any) Conversion
	SafeCurrencyCode(currencyId any, optionalArgs ...any) *string
	HandleErrors(statusCode int64, statusText string, url string, method string, responseHeaders any, responseBody string, response any, requestHeaders any, requestBody any) any
	// HandleMessage is not here: a venue declares its ws frame shape (map[string]any for an
	// object frame, any for an array/text frame), so the dispatch loop binds it by assertion.
	OnError(client any, err any)
	OnClose(client any, err any)
	OnConnected(client any, err any)
	WatchLiquidationsForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[[]Liquidation]
	WatchMyLiquidationsForSymbolsAsync(symbols any, optionalArgs ...any) <-chan AsyncResult[[]Liquidation]
	ParseWsTrade(trade any, optionalArgs ...any) map[string]any
	FetchPositionsADLRankAsync(optionalArgs ...any) <-chan AsyncResult[[]ADL]
	ParseADLRank(info any, optionalArgs ...any) map[string]any
	FetchDepositAddressesByNetworkAsync(code string, optionalArgs ...any) <-chan AsyncResult[map[string]DepositAddress]
	FetchOpenInterestsAsync(optionalArgs ...any) <-chan AsyncResult[map[string]OpenInterest]
}

type Describer interface {
	Describe() map[string]any
}
