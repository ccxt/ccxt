package ccxt

func (this *Exchange) describe() map[string]interface{} {
	return map[string]interface{}{
		"id":              nil,
		"name":            nil,
		"countries":       nil,
		"enableRateLimit": true,
		"rateLimit":       2000,
		"certified":       false,
		"pro":             false,
		"alias":           false,
		"dex":             false,
		"has": map[string]interface{}{
			"publicAPI":                              true,
			"privateAPI":                             true,
			"CORS":                                   nil,
			"sandbox":                                nil,
			"spot":                                   nil,
			"margin":                                 nil,
			"swap":                                   nil,
			"future":                                 nil,
			"option":                                 nil,
			"addMargin":                              nil,
			"borrowCrossMargin":                      nil,
			"borrowIsolatedMargin":                   nil,
			"borrowMargin":                           nil,
			"cancelAllOrders":                        nil,
			"cancelAllOrdersWs":                      nil,
			"cancelOrder":                            true,
			"cancelOrderWs":                          nil,
			"cancelOrders":                           nil,
			"cancelOrdersWs":                         nil,
			"closeAllPositions":                      nil,
			"closePosition":                          nil,
			"createDepositAddress":                   nil,
			"createLimitBuyOrder":                    nil,
			"createLimitBuyOrderWs":                  nil,
			"createLimitOrder":                       true,
			"createLimitOrderWs":                     nil,
			"createLimitSellOrder":                   nil,
			"createLimitSellOrderWs":                 nil,
			"createMarketBuyOrder":                   nil,
			"createMarketBuyOrderWs":                 nil,
			"createMarketBuyOrderWithCost":           nil,
			"createMarketBuyOrderWithCostWs":         nil,
			"createMarketOrder":                      true,
			"createMarketOrderWs":                    true,
			"createMarketOrderWithCost":              nil,
			"createMarketOrderWithCostWs":            nil,
			"createMarketSellOrder":                  nil,
			"createMarketSellOrderWs":                nil,
			"createMarketSellOrderWithCost":          nil,
			"createMarketSellOrderWithCostWs":        nil,
			"createOrder":                            true,
			"createOrderWs":                          nil,
			"createOrders":                           nil,
			"createOrderWithTakeProfitAndStopLoss":   nil,
			"createOrderWithTakeProfitAndStopLossWs": nil,
			"createPostOnlyOrder":                    nil,
			"createPostOnlyOrderWs":                  nil,
			"createReduceOnlyOrder":                  nil,
			"createReduceOnlyOrderWs":                nil,
			"createStopLimitOrder":                   nil,
			"createStopLimitOrderWs":                 nil,
			"createStopLossOrder":                    nil,
			"createStopLossOrderWs":                  nil,
			"createStopMarketOrder":                  nil,
			"createStopMarketOrderWs":                nil,
			"createStopOrder":                        nil,
			"createStopOrderWs":                      nil,
			"createTakeProfitOrder":                  nil,
			"createTakeProfitOrderWs":                nil,
			"createTrailingAmountOrder":              nil,
			"createTrailingAmountOrderWs":            nil,
			"createTrailingPercentOrder":             nil,
			"createTrailingPercentOrderWs":           nil,
			"createTriggerOrder":                     nil,
			"createTriggerOrderWs":                   nil,
			"deposit":                                nil,
			"editOrder":                              "emulated",
			"editOrderWs":                            nil,
			"fetchAccounts":                          nil,
			"fetchBalance":                           true,
			"fetchBalanceWs":                         nil,
			"fetchBidsAsks":                          nil,
			"fetchBorrowInterest":                    nil,
			"fetchBorrowRate":                        nil,
			"fetchBorrowRateHistories":               nil,
			"fetchBorrowRateHistory":                 nil,
			"fetchBorrowRates":                       nil,
			"fetchBorrowRatesPerSymbol":              nil,
			"fetchCanceledAndClosedOrders":           nil,
			"fetchCanceledOrders":                    nil,
			"fetchClosedOrder":                       nil,
			"fetchClosedOrders":                      nil,
			"fetchClosedOrdersWs":                    nil,
			"fetchConvertCurrencies":                 nil,
			"fetchConvertQuote":                      nil,
			"fetchConvertTrade":                      nil,
			"fetchConvertTradeHistory":               nil,
			"fetchCrossBorrowRate":                   nil,
			"fetchCrossBorrowRates":                  nil,
			"fetchCurrencies":                        "emulated",
			"fetchCurrenciesWs":                      "emulated",
			"fetchDeposit":                           nil,
			"fetchDepositAddress":                    nil,
			"fetchDepositAddresses":                  nil,
			"fetchDepositAddressesByNetwork":         nil,
			"fetchDeposits":                          nil,
			"fetchDepositsWithdrawals":               nil,
			"fetchDepositsWs":                        nil,
			"fetchDepositWithdrawFee":                nil,
			"fetchDepositWithdrawFees":               nil,
			"fetchFundingHistory":                    nil,
			"fetchFundingRate":                       nil,
			"fetchFundingRateHistory":                nil,
			"fetchFundingRates":                      nil,
			"fetchGreeks":                            nil,
			"fetchIndexOHLCV":                        nil,
			"fetchIsolatedBorrowRate":                nil,
			"fetchIsolatedBorrowRates":               nil,
			"fetchMarginAdjustmentHistory":           nil,
			"fetchIsolatedPositions":                 nil,
			"fetchL2OrderBook":                       true,
			"fetchL3OrderBook":                       nil,
			"fetchLastPrices":                        nil,
			"fetchLedger":                            nil,
			"fetchLedgerEntry":                       nil,
			"fetchLeverage":                          nil,
			"fetchLeverages":                         nil,
			"fetchLeverageTiers":                     nil,
			"fetchLiquidations":                      nil,
			"fetchMarginMode":                        nil,
			"fetchMarginModes":                       nil,
			"fetchMarketLeverageTiers":               nil,
			"fetchMarkets":                           true,
			"fetchMarketsWs":                         nil,
			"fetchMarkOHLCV":                         nil,
			"fetchMyLiquidations":                    nil,
			"fetchMySettlementHistory":               nil,
			"fetchMyTrades":                          nil,
			"fetchMyTradesWs":                        nil,
			"fetchOHLCV":                             nil,
			"fetchOHLCVWs":                           nil,
			"fetchOpenInterest":                      nil,
			"fetchOpenInterestHistory":               nil,
			"fetchOpenOrder":                         nil,
			"fetchOpenOrders":                        nil,
			"fetchOpenOrdersWs":                      nil,
			"fetchOption":                            nil,
			"fetchOptionChain":                       nil,
			"fetchOrder":                             nil,
			"fetchOrderBook":                         true,
			"fetchOrderBooks":                        nil,
			"fetchOrderBookWs":                       nil,
			"fetchOrders":                            nil,
			"fetchOrdersByStatus":                    nil,
			"fetchOrdersWs":                          nil,
			"fetchOrderTrades":                       nil,
			"fetchOrderWs":                           nil,
			"fetchPermissions":                       nil,
			"fetchPosition":                          nil,
			"fetchPositionHistory":                   nil,
			"fetchPositionsHistory":                  nil,
			"fetchPositionWs":                        nil,
			"fetchPositionMode":                      nil,
			"fetchPositions":                         nil,
			"fetchPositionsWs":                       nil,
			"fetchPositionsForSymbol":                nil,
			"fetchPositionsForSymbolWs":              nil,
			"fetchPositionsRisk":                     nil,
			"fetchPremiumIndexOHLCV":                 nil,
			"fetchSettlementHistory":                 nil,
			"fetchStatus":                            nil,
			"fetchTicker":                            true,
			"fetchTickerWs":                          nil,
			"fetchTickers":                           nil,
			"fetchTickersWs":                         nil,
			"fetchTime":                              nil,
			"fetchTrades":                            true,
			"fetchTradesWs":                          nil,
			"fetchTradingFee":                        nil,
			"fetchTradingFees":                       nil,
			"fetchTradingFeesWs":                     nil,
			"fetchTradingLimits":                     nil,
			"fetchTransactionFee":                    nil,
			"fetchTransactionFees":                   nil,
			"fetchTransactions":                      nil,
			"fetchTransfer":                          nil,
			"fetchTransfers":                         nil,
			"fetchUnderlyingAssets":                  nil,
			"fetchVolatilityHistory":                 nil,
			"fetchWithdrawAddresses":                 nil,
			"fetchWithdrawal":                        nil,
			"fetchWithdrawals":                       nil,
			"fetchWithdrawalsWs":                     nil,
			"fetchWithdrawalWhitelist":               nil,
			"reduceMargin":                           nil,
			"repayCrossMargin":                       nil,
			"repayIsolatedMargin":                    nil,
			"setLeverage":                            nil,
			"setMargin":                              nil,
			"setMarginMode":                          nil,
			"setPositionMode":                        nil,
			"signIn":                                 nil,
			"transfer":                               nil,
			"watchBalance":                           nil,
			"watchMyTrades":                          nil,
			"watchOHLCV":                             nil,
			"watchOHLCVForSymbols":                   nil,
			"watchOrderBook":                         nil,
			"watchOrderBookForSymbols":               nil,
			"watchOrders":                            nil,
			"watchOrdersForSymbols":                  nil,
			"watchPosition":                          nil,
			"watchPositions":                         nil,
			"watchStatus":                            nil,
			"watchTicker":                            nil,
			"watchTickers":                           nil,
			"watchTrades":                            nil,
			"watchTradesForSymbols":                  nil,
			"watchLiquidations":                      nil,
			"watchLiquidationsForSymbols":            nil,
			"watchMyLiquidations":                    nil,
			"watchMyLiquidationsForSymbols":          nil,
			"withdraw":                               nil,
			"ws":                                     nil,
		},
		"urls": map[string]interface{}{
			"logo": nil,
			"api":  nil,
			"www":  nil,
			"doc":  nil,
			"fees": nil,
		},
		"api": nil,
		"requiredCredentials": map[string]interface{}{
			"apiKey":        true,
			"secret":        true,
			"uid":           false,
			"accountId":     false,
			"login":         false,
			"password":      false,
			"twofa":         false,
			"privateKey":    false,
			"walletAddress": false,
			"token":         false,
		},
		"markets":    nil,
		"currencies": map[string]interface{}{},
		"timeframes": nil,
		"fees": map[string]interface{}{
			"trading": map[string]interface{}{
				"tierBased":  nil,
				"percentage": nil,
				"taker":      nil,
				"maker":      nil,
			},
			"funding": map[string]interface{}{
				"tierBased":  nil,
				"percentage": nil,
				"withdraw":   map[string]interface{}{},
				"deposit":    map[string]interface{}{},
			},
		},
		"status": map[string]interface{}{
			"status":  "ok",
			"updated": nil,
			"eta":     nil,
			"url":     nil,
		},
		"exceptions": nil,
		"httpExceptions": map[string]interface{}{
			"422": ExchangeError,
			"418": DDoSProtection,
			"429": RateLimitExceeded,
			"404": ExchangeNotAvailable,
			"409": ExchangeNotAvailable,
			"410": ExchangeNotAvailable,
			"451": ExchangeNotAvailable,
			"500": ExchangeNotAvailable,
			"501": ExchangeNotAvailable,
			"502": ExchangeNotAvailable,
			"520": ExchangeNotAvailable,
			"521": ExchangeNotAvailable,
			"522": ExchangeNotAvailable,
			"525": ExchangeNotAvailable,
			"526": ExchangeNotAvailable,
			"400": ExchangeNotAvailable,
			"403": ExchangeNotAvailable,
			"405": ExchangeNotAvailable,
			"503": ExchangeNotAvailable,
			"530": ExchangeNotAvailable,
			"408": RequestTimeout,
			"504": RequestTimeout,
			"401": AuthenticationError,
			"407": AuthenticationError,
			"511": AuthenticationError,
		},
		"commonCurrencies": map[string]interface{}{
			"XBT":   "BTC",
			"BCC":   "BCH",
			"BCHSV": "BSV",
		},
		"precisionMode": DECIMAL_PLACES,
		"paddingMode":   NO_PADDING,
		"limits": map[string]interface{}{
			"leverage": map[string]interface{}{
				"min": nil,
				"max": nil,
			},
			"amount": map[string]interface{}{
				"min": nil,
				"max": nil,
			},
			"price": map[string]interface{}{
				"min": nil,
				"max": nil,
			},
			"cost": map[string]interface{}{
				"min": nil,
				"max": nil,
			},
		},
	} // return
}

// type Dict map[string]interface{}

func (this *Exchange) initializeProperties(extendedProperties Dict) {

	this.version = SafeString(extendedProperties, "version", "").(string)
	this.Version = this.version

	reqCred := SafeValue(extendedProperties, "requiredCredentials", map[string]interface{}{})
	this.requiredCredentials = reqCred.(map[string]interface{})
	this.apiKey = SafeString(extendedProperties, "apiKey", "").(string)
	this.secret = SafeString(extendedProperties, "secret", "").(string)
	this.password = SafeString(extendedProperties, "password", "").(string)
	this.login = SafeString(extendedProperties, "login", "").(string)
	this.twofa = SafeString(extendedProperties, "twofa", "").(string)
	this.privateKey = SafeString(extendedProperties, "privateKey", "").(string)
	this.walletAddress = SafeString(extendedProperties, "walletAddress", "").(string)
	this.token = SafeString(extendedProperties, "token", "").(string)
	this.uid = SafeString(extendedProperties, "uid", "").(string)
	this.accountId = SafeString(extendedProperties, "accountId", "").(string)

	this.userAgents = SafeValue(extendedProperties, "userAgents", map[string]interface{}{}).(map[string]interface{})
	this.userAgent = SafeString(extendedProperties, "userAgent", "").(string)
	this.timeout = SafeInteger(extendedProperties, "timeout", 10000)
	this.id = SafeString(extendedProperties, "id", "").(string)
	this.Id = this.id
	this.alias = SafeValue(extendedProperties, "alias", false).(bool)

	this.Api = SafeValue(extendedProperties, "api", map[string]interface{}{}).(map[string]interface{})
	this.hostname = SafeString(extendedProperties, "hostname", "").(string)
	this.urls = SafeValue(extendedProperties, "urls", map[string]interface{}{}).(map[string]interface{})

	// extendedOptions := SafeValue(extendedProperties, "options",map[string]interface{}{}).(map[string]interface{})
	// for k, v := range extendedOptions {
	// 	this.options.Store(k, v)
	// }

	this.verbose = SafeValue(extendedProperties, "verbose", false).(bool)
	this.timeframes = SafeValue(extendedProperties, "timeframes", map[string]interface{}{}).(map[string]interface{})
	this.fees = SafeValue(extendedProperties, "fees", map[string]interface{}{}).(map[string]interface{})
	this.has = SafeValue(extendedProperties, "has", map[string]interface{}{}).(map[string]interface{})
	// this.httpExceptions = SafeValue(extendedProperties, "httpExceptions",map[string]interface{}{}).(map[string]interface{})
	this.exceptions = SafeValue(extendedProperties, "exceptions", map[string]interface{}{}).(map[string]interface{})
	this.markets = SafeValue(extendedProperties, "markets", map[string]interface{}{}).(map[string]interface{})
	propCurrencies := SafeValue(extendedProperties, "currencies", map[string]interface{}{}).(map[string]interface{})
	if len(propCurrencies) > 0 {
		this.currencies = propCurrencies
	}

	this.rateLimit = SafeFloat(extendedProperties, "rateLimit", -1)
	// this.status = SafeValue(extendedProperties, "status",map[string]interface{}{}).(map[string]interface{})
	this.precisionMode = int(SafeInteger(extendedProperties, "precisionMode", this.precisionMode))
	this.paddingMode = int(SafeInteger(extendedProperties, "paddingMode", this.paddingMode))
	this.commonCurrencies = SafeValue(extendedProperties, "commonCurrencies", map[string]interface{}{}).(map[string]interface{})
	subVal := SafeValue(extendedProperties, "substituteCommonCurrencyCodes", true)
	this.substituteCommonCurrencyCodes = subVal != nil && subVal.(bool)
	this.name = SafeString(extendedProperties, "name", "").(string)
	this.httpsProxy = SafeString(extendedProperties, "httpsProxy", "").(string)
	this.httpProxy = SafeString(extendedProperties, "httpProxy", "").(string)
	this.newUpdates = SafeValue(extendedProperties, "newUpdates", true).(bool)
	this.accounts = SafeValue(extendedProperties, "accounts", []interface{}{}).([]interface{})
}
