package ccxt

import "sync"

type ICCXTExchange interface {
	SetRateLimit(rateLimit bool)
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
	SetSandboxMode(enable interface{})
	// methods from base
	CancelAllOrders(options ...CancelAllOrdersOptions) (map[string]interface{}, error)
	CancelOrder(id string, options ...CancelOrderOptions) (map[string]interface{}, error)
	CreateDepositAddress(code string, options ...CreateDepositAddressOptions) (DepositAddress, error)
	CreateOrder(symbol string, typeVar string, side string, amount float64, options ...CreateOrderOptions) (Order, error)
	CreateOrders(orders []OrderRequest, options ...CreateOrdersOptions) ([]Order, error)
	EditOrder(id string, symbol string, typeVar string, side string, options ...EditOrderOptions) (Order, error)
	EditOrders(orders []OrderRequest, options ...EditOrdersOptions) ([]Order, error)
	FetchAccounts(params ...interface{}) ([]Account, error)
	FetchBalance(params ...interface{}) (Balances, error)
	FetchBidsAsks(options ...FetchBidsAsksOptions) (Tickers, error)
	FetchBorrowInterest(options ...FetchBorrowInterestOptions) ([]BorrowInterest, error)
	FetchBorrowRate(code string, amount float64, options ...FetchBorrowRateOptions) (map[string]interface{}, error)
	FetchClosedOrders(options ...FetchClosedOrdersOptions) ([]Order, error)
	FetchCrossBorrowRate(code string, options ...FetchCrossBorrowRateOptions) (CrossBorrowRate, error)
	FetchCrossBorrowRates(params ...interface{}) (CrossBorrowRates, error)
	FetchCurrencies(params ...interface{}) (Currencies, error)
	FetchDepositAddress(code string, options ...FetchDepositAddressOptions) (DepositAddress, error)
	FetchDepositAddresses(options ...FetchDepositAddressesOptions) ([]DepositAddress, error)
	FetchDepositAddressesByNetwork(code string, options ...FetchDepositAddressesByNetworkOptions) ([]DepositAddress, error)
	FetchDeposits(options ...FetchDepositsOptions) ([]Transaction, error)
	FetchDepositsWithdrawals(options ...FetchDepositsWithdrawalsOptions) ([]Transaction, error)
	FetchFundingHistory(options ...FetchFundingHistoryOptions) ([]FundingHistory, error)
	FetchFundingInterval(symbol string, options ...FetchFundingIntervalOptions) (FundingRate, error)
	FetchFundingIntervals(options ...FetchFundingIntervalsOptions) (FundingRates, error)
	FetchFundingRate(symbol string, options ...FetchFundingRateOptions) (FundingRate, error)
	FetchFundingRateHistory(options ...FetchFundingRateHistoryOptions) ([]FundingRateHistory, error)
	FetchFundingRates(options ...FetchFundingRatesOptions) (FundingRates, error)
	FetchIsolatedBorrowRate(symbol string, options ...FetchIsolatedBorrowRateOptions) (IsolatedBorrowRate, error)
	FetchIsolatedBorrowRates(params ...interface{}) (IsolatedBorrowRates, error)
	FetchLastPrices(options ...FetchLastPricesOptions) (LastPrices, error)
	FetchLedger(options ...FetchLedgerOptions) ([]LedgerEntry, error)
	FetchLeverage(symbol string, options ...FetchLeverageOptions) (Leverage, error)
	FetchLeverages(options ...FetchLeveragesOptions) (Leverages, error)
	FetchLeverageTiers(options ...FetchLeverageTiersOptions) (LeverageTiers, error)
	FetchLiquidations(symbol string, options ...FetchLiquidationsOptions) ([]Liquidation, error)
	FetchLongShortRatio(symbol string, options ...FetchLongShortRatioOptions) (LongShortRatio, error)
	FetchLongShortRatioHistory(options ...FetchLongShortRatioHistoryOptions) ([]LongShortRatio, error)
	FetchMarginAdjustmentHistory(options ...FetchMarginAdjustmentHistoryOptions) ([]MarginModification, error)
	FetchMarginMode(symbol string, options ...FetchMarginModeOptions) (MarginMode, error)
	FetchMarginModes(options ...FetchMarginModesOptions) (MarginModes, error)
	FetchMarketLeverageTiers(symbol string, options ...FetchMarketLeverageTiersOptions) ([]LeverageTier, error)
	FetchMarkets(params ...interface{}) ([]MarketInterface, error)
	FetchMyLiquidations(options ...FetchMyLiquidationsOptions) ([]Liquidation, error)
	FetchMyTrades(options ...FetchMyTradesOptions) ([]Trade, error)
	FetchOHLCV(symbol string, options ...FetchOHLCVOptions) ([]OHLCV, error)
	FetchOpenInterest(symbol string, options ...FetchOpenInterestOptions) (OpenInterest, error)
	FetchOpenInterestHistory(symbol string, options ...FetchOpenInterestHistoryOptions) ([]OpenInterest, error)
	FetchOpenInterests(options ...FetchOpenInterestsOptions) (OpenInterests, error)
	FetchOpenOrders(options ...FetchOpenOrdersOptions) ([]Order, error)
	FetchOrder(id string, options ...FetchOrderOptions) (Order, error)
	FetchOrderBook(symbol string, options ...FetchOrderBookOptions) (OrderBook, error)
	FetchOrderBooks(options ...FetchOrderBooksOptions) (OrderBooks, error)
	FetchOrders(options ...FetchOrdersOptions) ([]Order, error)
	FetchOrderTrades(id string, options ...FetchOrderTradesOptions) ([]Trade, error)
	FetchPosition(symbol string, options ...FetchPositionOptions) (Position, error)
	FetchPositionHistory(symbol string, options ...FetchPositionHistoryOptions) ([]Position, error)
	FetchPositionMode(options ...FetchPositionModeOptions) (map[string]interface{}, error)
	FetchPositions(options ...FetchPositionsOptions) ([]Position, error)
	FetchPositionsForSymbol(symbol string, options ...FetchPositionsForSymbolOptions) ([]Position, error)
	FetchPositionsHistory(options ...FetchPositionsHistoryOptions) ([]Position, error)
	FetchPositionsRisk(options ...FetchPositionsRiskOptions) ([]Position, error)
	FetchPremiumIndexOHLCV(symbol string, options ...FetchPremiumIndexOHLCVOptions) ([]OHLCV, error)
	FetchStatus(params ...interface{}) (map[string]interface{}, error)
	FetchTicker(symbol string, options ...FetchTickerOptions) (Ticker, error)
	FetchTickers(options ...FetchTickersOptions) (Tickers, error)
	FetchTime(params ...interface{}) (int64, error)
	FetchTrades(symbol string, options ...FetchTradesOptions) ([]Trade, error)
	FetchTradingFee(symbol string, options ...FetchTradingFeeOptions) (TradingFeeInterface, error)
	FetchTradingFees(params ...interface{}) (TradingFees, error)
	FetchTradingLimits(options ...FetchTradingLimitsOptions) (map[string]interface{}, error)
	FetchTransactionFee(code string, options ...FetchTransactionFeeOptions) (map[string]interface{}, error)
	FetchTransactionFees(options ...FetchTransactionFeesOptions) (map[string]interface{}, error)
	FetchTransactions(options ...FetchTransactionsOptions) ([]Transaction, error)
	FetchTransfer(id string, options ...FetchTransferOptions) (TransferEntry, error)
	FetchTransfers(options ...FetchTransfersOptions) ([]TransferEntry, error)
	FetchWithdrawals(options ...FetchWithdrawalsOptions) ([]Transaction, error)
	SetLeverage(leverage int64, options ...SetLeverageOptions) (map[string]interface{}, error)
	SetMargin(symbol string, amount float64, options ...SetMarginOptions) (map[string]interface{}, error)
	SetMarginMode(marginMode string, options ...SetMarginModeOptions) (map[string]interface{}, error)
	SetPositionMode(hedged bool, options ...SetPositionModeOptions) (map[string]interface{}, error)
	Transfer(code string, amount float64, fromAccount string, toAccount string, options ...TransferOptions) (TransferEntry, error)
	Withdraw(code string, amount float64, address string, options ...WithdrawOptions) (Transaction, error)
}

// Exchange interface based on the methods from binance.go
type IExchange interface {
	SetRateLimit(rateLimit bool)
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
}

type IDerivedExchange interface {
	ParseLeverage(leverage interface{}, optionalArgs ...interface{}) interface{}
	ParseOHLCV(ohlcv interface{}, optionalArgs ...interface{}) interface{}
	ParseTrade(trade interface{}, optionalArgs ...interface{}) interface{}
	ParseGreeks(greeks interface{}, optionalArgs ...interface{}) interface{}
	ParseMarket(market interface{}) interface{}
	ParseCurrency(rawCurrency interface{}) interface{}
	ParseTransaction(transaction interface{}, optionalArgs ...interface{}) interface{}
	ParseTransfer(transfer interface{}, optionalArgs ...interface{}) interface{}
	ParseAccount(account interface{}) interface{}
	ParseLedgerEntry(item interface{}, optionalArgs ...interface{}) interface{}
	ParseOrder(order interface{}, optionalArgs ...interface{}) interface{}
	ParseTicker(ticker interface{}, optionalArgs ...interface{}) interface{}
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
	FetchDepositWithdrawFees(optionalArgs ...interface{}) <-chan interface{}
	EditOrder(id interface{}, symbol interface{}, typeVar interface{}, side interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOrder(id interface{}, optionalArgs ...interface{}) <-chan interface{}
	FetchOrders(optionalArgs ...interface{}) <-chan interface{}
	CreateExpiredOptionMarket(symbol interface{}) interface{}
	FetchTime(optionalArgs ...interface{}) <-chan interface{}
	FetchLeverageTiers(optionalArgs ...interface{}) <-chan interface{}
	ParseDepositAddresses(addresses interface{}, optionalArgs ...interface{}) interface{}
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
}
