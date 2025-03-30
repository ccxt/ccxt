package ccxt

// func (this *Exchange) Describe() map[string]interface{} {
// 	return map[string]interface{}{
// 		"id":              nil,
// 		"name":            nil,
// 		"countries":       nil,
// 		"enableRateLimit": true,
// 		"rateLimit":       2000,
// 		"certified":       false,
// 		"pro":             false,
// 		"alias":           false,
// 		"dex":             false,
// 		"has": map[string]interface{}{
// 			"publicAPI":                              true,
// 			"privateAPI":                             true,
// 			"CORS":                                   nil,
// 			"sandbox":                                nil,
// 			"spot":                                   nil,
// 			"margin":                                 nil,
// 			"swap":                                   nil,
// 			"future":                                 nil,
// 			"option":                                 nil,
// 			"addMargin":                              nil,
// 			"borrowCrossMargin":                      nil,
// 			"borrowIsolatedMargin":                   nil,
// 			"borrowMargin":                           nil,
// 			"cancelAllOrders":                        nil,
// 			"cancelAllOrdersWs":                      nil,
// 			"cancelOrder":                            true,
// 			"cancelOrderWs":                          nil,
// 			"cancelOrders":                           nil,
// 			"cancelOrdersWs":                         nil,
// 			"closeAllPositions":                      nil,
// 			"closePosition":                          nil,
// 			"createDepositAddress":                   nil,
// 			"createLimitBuyOrder":                    nil,
// 			"createLimitBuyOrderWs":                  nil,
// 			"createLimitOrder":                       true,
// 			"createLimitOrderWs":                     nil,
// 			"createLimitSellOrder":                   nil,
// 			"createLimitSellOrderWs":                 nil,
// 			"createMarketBuyOrder":                   nil,
// 			"createMarketBuyOrderWs":                 nil,
// 			"createMarketBuyOrderWithCost":           nil,
// 			"createMarketBuyOrderWithCostWs":         nil,
// 			"createMarketOrder":                      true,
// 			"createMarketOrderWs":                    true,
// 			"createMarketOrderWithCost":              nil,
// 			"createMarketOrderWithCostWs":            nil,
// 			"createMarketSellOrder":                  nil,
// 			"createMarketSellOrderWs":                nil,
// 			"createMarketSellOrderWithCost":          nil,
// 			"createMarketSellOrderWithCostWs":        nil,
// 			"createOrder":                            true,
// 			"createOrderWs":                          nil,
// 			"createOrders":                           nil,
// 			"createOrderWithTakeProfitAndStopLoss":   nil,
// 			"createOrderWithTakeProfitAndStopLossWs": nil,
// 			"createPostOnlyOrder":                    nil,
// 			"createPostOnlyOrderWs":                  nil,
// 			"createReduceOnlyOrder":                  nil,
// 			"createReduceOnlyOrderWs":                nil,
// 			"createStopLimitOrder":                   nil,
// 			"createStopLimitOrderWs":                 nil,
// 			"createStopLossOrder":                    nil,
// 			"createStopLossOrderWs":                  nil,
// 			"createStopMarketOrder":                  nil,
// 			"createStopMarketOrderWs":                nil,
// 			"createStopOrder":                        nil,
// 			"createStopOrderWs":                      nil,
// 			"createTakeProfitOrder":                  nil,
// 			"createTakeProfitOrderWs":                nil,
// 			"createTrailingAmountOrder":              nil,
// 			"createTrailingAmountOrderWs":            nil,
// 			"createTrailingPercentOrder":             nil,
// 			"createTrailingPercentOrderWs":           nil,
// 			"createTriggerOrder":                     nil,
// 			"createTriggerOrderWs":                   nil,
// 			"deposit":                                nil,
// 			"editOrder":                              "emulated",
// 			"editOrderWs":                            nil,
// 			"fetchAccounts":                          nil,
// 			"fetchBalance":                           true,
// 			"fetchBalanceWs":                         nil,
// 			"fetchBidsAsks":                          nil,
// 			"fetchBorrowInterest":                    nil,
// 			"fetchBorrowRate":                        nil,
// 			"fetchBorrowRateHistories":               nil,
// 			"fetchBorrowRateHistory":                 nil,
// 			"fetchBorrowRates":                       nil,
// 			"fetchBorrowRatesPerSymbol":              nil,
// 			"fetchCanceledAndClosedOrders":           nil,
// 			"fetchCanceledOrders":                    nil,
// 			"fetchClosedOrder":                       nil,
// 			"fetchClosedOrders":                      nil,
// 			"fetchClosedOrdersWs":                    nil,
// 			"fetchConvertCurrencies":                 nil,
// 			"fetchConvertQuote":                      nil,
// 			"fetchConvertTrade":                      nil,
// 			"fetchConvertTradeHistory":               nil,
// 			"fetchCrossBorrowRate":                   nil,
// 			"fetchCrossBorrowRates":                  nil,
// 			"fetchCurrencies":                        "emulated",
// 			"fetchCurrenciesWs":                      "emulated",
// 			"fetchDeposit":                           nil,
// 			"fetchDepositAddress":                    nil,
// 			"fetchDepositAddresses":                  nil,
// 			"fetchDepositAddressesByNetwork":         nil,
// 			"fetchDeposits":                          nil,
// 			"fetchDepositsWithdrawals":               nil,
// 			"fetchDepositsWs":                        nil,
// 			"fetchDepositWithdrawFee":                nil,
// 			"fetchDepositWithdrawFees":               nil,
// 			"fetchFundingHistory":                    nil,
// 			"fetchFundingRate":                       nil,
// 			"fetchFundingRateHistory":                nil,
// 			"fetchFundingRates":                      nil,
// 			"fetchGreeks":                            nil,
// 			"fetchIndexOHLCV":                        nil,
// 			"fetchIsolatedBorrowRate":                nil,
// 			"fetchIsolatedBorrowRates":               nil,
// 			"fetchMarginAdjustmentHistory":           nil,
// 			"fetchIsolatedPositions":                 nil,
// 			"fetchL2OrderBook":                       true,
// 			"fetchL3OrderBook":                       nil,
// 			"fetchLastPrices":                        nil,
// 			"fetchLedger":                            nil,
// 			"fetchLedgerEntry":                       nil,
// 			"fetchLeverage":                          nil,
// 			"fetchLeverages":                         nil,
// 			"fetchLeverageTiers":                     nil,
// 			"fetchLiquidations":                      nil,
// 			"fetchMarginMode":                        nil,
// 			"fetchMarginModes":                       nil,
// 			"fetchMarketLeverageTiers":               nil,
// 			"fetchMarkets":                           true,
// 			"fetchMarketsWs":                         nil,
// 			"fetchMarkOHLCV":                         nil,
// 			"fetchMyLiquidations":                    nil,
// 			"fetchMySettlementHistory":               nil,
// 			"fetchMyTrades":                          nil,
// 			"fetchMyTradesWs":                        nil,
// 			"fetchOHLCV":                             nil,
// 			"fetchOHLCVWs":                           nil,
// 			"fetchOpenInterest":                      nil,
// 			"fetchOpenInterestHistory":               nil,
// 			"fetchOpenOrder":                         nil,
// 			"fetchOpenOrders":                        nil,
// 			"fetchOpenOrdersWs":                      nil,
// 			"fetchOption":                            nil,
// 			"fetchOptionChain":                       nil,
// 			"fetchOrder":                             nil,
// 			"fetchOrderBook":                         true,
// 			"fetchOrderBooks":                        nil,
// 			"fetchOrderBookWs":                       nil,
// 			"fetchOrders":                            nil,
// 			"fetchOrdersByStatus":                    nil,
// 			"fetchOrdersWs":                          nil,
// 			"fetchOrderTrades":                       nil,
// 			"fetchOrderWs":                           nil,
// 			"fetchPermissions":                       nil,
// 			"fetchPosition":                          nil,
// 			"fetchPositionHistory":                   nil,
// 			"fetchPositionsHistory":                  nil,
// 			"fetchPositionWs":                        nil,
// 			"fetchPositionMode":                      nil,
// 			"fetchPositions":                         nil,
// 			"fetchPositionsWs":                       nil,
// 			"fetchPositionsForSymbol":                nil,
// 			"fetchPositionsForSymbolWs":              nil,
// 			"fetchPositionsRisk":                     nil,
// 			"fetchPremiumIndexOHLCV":                 nil,
// 			"fetchSettlementHistory":                 nil,
// 			"fetchStatus":                            nil,
// 			"fetchTicker":                            true,
// 			"fetchTickerWs":                          nil,
// 			"fetchTickers":                           nil,
// 			"fetchTickersWs":                         nil,
// 			"fetchTime":                              nil,
// 			"fetchTrades":                            true,
// 			"fetchTradesWs":                          nil,
// 			"fetchTradingFee":                        nil,
// 			"fetchTradingFees":                       nil,
// 			"fetchTradingFeesWs":                     nil,
// 			"fetchTradingLimits":                     nil,
// 			"fetchTransactionFee":                    nil,
// 			"fetchTransactionFees":                   nil,
// 			"fetchTransactions":                      nil,
// 			"fetchTransfer":                          nil,
// 			"fetchTransfers":                         nil,
// 			"fetchUnderlyingAssets":                  nil,
// 			"fetchVolatilityHistory":                 nil,
// 			"fetchWithdrawAddresses":                 nil,
// 			"fetchWithdrawal":                        nil,
// 			"fetchWithdrawals":                       nil,
// 			"fetchWithdrawalsWs":                     nil,
// 			"fetchWithdrawalWhitelist":               nil,
// 			"reduceMargin":                           nil,
// 			"repayCrossMargin":                       nil,
// 			"repayIsolatedMargin":                    nil,
// 			"setLeverage":                            nil,
// 			"setMargin":                              nil,
// 			"setMarginMode":                          nil,
// 			"setPositionMode":                        nil,
// 			"signIn":                                 nil,
// 			"transfer":                               nil,
// 			"watchBalance":                           nil,
// 			"watchMyTrades":                          nil,
// 			"watchOHLCV":                             nil,
// 			"watchOHLCVForSymbols":                   nil,
// 			"watchOrderBook":                         nil,
// 			"watchOrderBookForSymbols":               nil,
// 			"watchOrders":                            nil,
// 			"watchOrdersForSymbols":                  nil,
// 			"watchPosition":                          nil,
// 			"watchPositions":                         nil,
// 			"watchStatus":                            nil,
// 			"watchTicker":                            nil,
// 			"watchTickers":                           nil,
// 			"watchTrades":                            nil,
// 			"watchTradesForSymbols":                  nil,
// 			"watchLiquidations":                      nil,
// 			"watchLiquidationsForSymbols":            nil,
// 			"watchMyLiquidations":                    nil,
// 			"watchMyLiquidationsForSymbols":          nil,
// 			"withdraw":                               nil,
// 			"ws":                                     nil,
// 		},
// 		"urls": map[string]interface{}{
// 			"logo": nil,
// 			"api":  nil,
// 			"www":  nil,
// 			"doc":  nil,
// 			"fees": nil,
// 		},
// 		"api": nil,
// 		"requiredCredentials": map[string]interface{}{
// 			"apiKey":        true,
// 			"secret":        true,
// 			"uid":           false,
// 			"accountId":     false,
// 			"login":         false,
// 			"password":      false,
// 			"twofa":         false,
// 			"privateKey":    false,
// 			"walletAddress": false,
// 			"token":         false,
// 		},
// 		"markets":    nil,
// 		"currencies": map[string]interface{}{},
// 		"timeframes": nil,
// 		"fees": map[string]interface{}{
// 			"trading": map[string]interface{}{
// 				"tierBased":  nil,
// 				"percentage": nil,
// 				"taker":      nil,
// 				"maker":      nil,
// 			},
// 			"funding": map[string]interface{}{
// 				"tierBased":  nil,
// 				"percentage": nil,
// 				"withdraw":   map[string]interface{}{},
// 				"deposit":    map[string]interface{}{},
// 			},
// 		},
// 		"status": map[string]interface{}{
// 			"status":  "ok",
// 			"updated": nil,
// 			"eta":     nil,
// 			"url":     nil,
// 		},
// 		"exceptions": nil,
// 		"httpExceptions": map[string]interface{}{
// 			"422": ExchangeError,
// 			"418": DDoSProtection,
// 			"429": RateLimitExceeded,
// 			"404": ExchangeNotAvailable,
// 			"409": ExchangeNotAvailable,
// 			"410": ExchangeNotAvailable,
// 			"451": ExchangeNotAvailable,
// 			"500": ExchangeNotAvailable,
// 			"501": ExchangeNotAvailable,
// 			"502": ExchangeNotAvailable,
// 			"520": ExchangeNotAvailable,
// 			"521": ExchangeNotAvailable,
// 			"522": ExchangeNotAvailable,
// 			"525": ExchangeNotAvailable,
// 			"526": ExchangeNotAvailable,
// 			"400": ExchangeNotAvailable,
// 			"403": ExchangeNotAvailable,
// 			"405": ExchangeNotAvailable,
// 			"503": ExchangeNotAvailable,
// 			"530": ExchangeNotAvailable,
// 			"408": RequestTimeout,
// 			"504": RequestTimeout,
// 			"401": AuthenticationError,
// 			"407": AuthenticationError,
// 			"511": AuthenticationError,
// 		},
// 		"commonCurrencies": map[string]interface{}{
// 			"XBT":   "BTC",
// 			"BCC":   "BCH",
// 			"BCHSV": "BSV",
// 		},
// 		"precisionMode": DECIMAL_PLACES,
// 		"paddingMode":   NO_PADDING,
// 		"limits": map[string]interface{}{
// 			"leverage": map[string]interface{}{
// 				"min": nil,
// 				"max": nil,
// 			},
// 			"amount": map[string]interface{}{
// 				"min": nil,
// 				"max": nil,
// 			},
// 			"price": map[string]interface{}{
// 				"min": nil,
// 				"max": nil,
// 			},
// 			"cost": map[string]interface{}{
// 				"min": nil,
// 				"max": nil,
// 			},
// 		},
// 	} // return
// }

// type Dict map[string]interface{}

func (this *Exchange) initializeProperties(extendedProperties map[string]interface{}) {

	this.TransformedApi = map[string]interface{}{}
	this.Version = SafeString(extendedProperties, "version", "").(string)
	this.cacheLoaded = false
	reqCred := SafeValue(extendedProperties, "requiredCredentials", map[string]interface{}{})
	this.RequiredCredentials = reqCred.(map[string]interface{})
	this.ApiKey = SafeString(extendedProperties, "apiKey", "").(string)
	this.Secret = SafeString(extendedProperties, "secret", "").(string)
	this.Password = SafeString(extendedProperties, "password", "").(string)
	this.Login = SafeString(extendedProperties, "login", "").(string)
	this.Twofa = SafeString(extendedProperties, "twofa", "").(string)
	this.PrivateKey = SafeString(extendedProperties, "privateKey", "").(string)
	this.WalletAddress = SafeString(extendedProperties, "walletAddress", "").(string)
	this.Token = SafeString(extendedProperties, "token", "").(string)
	this.Uid = SafeString(extendedProperties, "uid", "").(string)
	this.AccountId = SafeString(extendedProperties, "accountId", "").(string)

	this.UserAgents = SafeValue(extendedProperties, "userAgents", map[string]interface{}{}).(map[string]interface{})
	this.UserAgent = SafeString(extendedProperties, "userAgent", "").(string)
	this.Timeout = SafeInteger(extendedProperties, "timeout", 10000).(int64)
	this.MAX_VALUE = SafeFloat(extendedProperties, "MAX_VALUE", 1.7976931348623157e+308).(float64) // math.MaxFloat64
	this.Id = SafeString(extendedProperties, "id", "").(string)
	this.Alias = SafeValue(extendedProperties, "alias", false).(bool)

	this.Api = SafeValue(extendedProperties, "api", map[string]interface{}{}).(map[string]interface{})
	this.Hostname = SafeString(extendedProperties, "hostname", "").(string)
	this.Urls = SafeValue(extendedProperties, "urls", map[string]interface{}{}).(map[string]interface{})

	this.Options = this.GetDefaultOptions().(map[string]interface{})
	extendedOptions := SafeValue(extendedProperties, "options", map[string]interface{}{}).(map[string]interface{})
	for k, v := range extendedOptions {
		this.Options[k] = v
	}

	this.Verbose = SafeValue(extendedProperties, "verbose", false).(bool)
	this.Timeframes = SafeValue(extendedProperties, "timeframes", map[string]interface{}{}).(map[string]interface{})
	this.Features = SafeValue(extendedProperties, "features", map[string]interface{}{}).(map[string]interface{})
	this.Fees = SafeValue(extendedProperties, "fees", map[string]interface{}{}).(map[string]interface{})
	this.Has = SafeValue(extendedProperties, "has", map[string]interface{}{}).(map[string]interface{})
	// this.httpExceptions = SafeValue(extendedProperties, "httpExceptions",map[string]interface{}{}).(map[string]interface{})
	this.Exceptions = SafeValue(extendedProperties, "exceptions", map[string]interface{}{}).(map[string]interface{})
	this.Markets = SafeValue(extendedProperties, "markets", map[string]interface{}{}).(map[string]interface{})
	propCurrencies := SafeValue(extendedProperties, "currencies", map[string]interface{}{}).(map[string]interface{})
	if len(propCurrencies) > 0 {
		this.Currencies = propCurrencies
	}
	this.EnableRateLimit = SafeValue(extendedProperties, "enableRateLimit", true).(bool)
	this.RateLimit = SafeFloat(extendedProperties, "rateLimit", -1).(float64)
	// this.status = SafeValue(extendedProperties, "status",map[string]interface{}{}).(map[string]interface{})
	this.PrecisionMode = int(SafeInteger(extendedProperties, "precisionMode", this.PrecisionMode).(int64))
	this.PaddingMode = int(SafeInteger(extendedProperties, "paddingMode", this.PaddingMode).(int64))
	this.CommonCurrencies = SafeValue(extendedProperties, "commonCurrencies", map[string]interface{}{}).(map[string]interface{})
	subVal := SafeValue(extendedProperties, "substituteCommonCurrencyCodes", true)
	this.SubstituteCommonCurrencyCodes = subVal != nil && subVal.(bool)
	this.Name = SafeString(extendedProperties, "name", "").(string)
	this.HttpsProxy = SafeString(extendedProperties, "httpsProxy", nil)
	this.HttpProxy = SafeString(extendedProperties, "httpProxy", nil)
	this.NewUpdates = SafeValue(extendedProperties, "newUpdates", true).(bool)
	this.Accounts = SafeValue(extendedProperties, "accounts", []interface{}{}).([]interface{})

	this.HttpExceptions = SafeValue(extendedProperties, "httpExceptions", map[string]interface{}{}).(map[string]interface{})
	this.Headers = SafeValue(extendedProperties, "headers", map[string]interface{}{}).(map[string]interface{})
	this.ReduceFees = SafeValue(extendedProperties, "reduceFees", true).(bool)
}
