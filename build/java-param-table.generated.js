const JAVA_PARAM_STRING_TYPES = {
    "assertStaticError": { 1: 'String' }, // 1 decls
    "assertStaticRequestOutput": { 1: 'String', 3: 'String', 4: 'String' }, // 1 decls
    "assertWsSentMessages": { 1: 'String' }, // 1 decls
    "bindAgentWallet": { 0: 'String' }, // 1 decls
    "borrowCrossMargin": { 0: 'String' }, // 8 decls
    "borrowIsolatedMargin": { 0: 'String', 1: 'String' }, // 7 decls
    "borrowMargin": { 0: 'String' }, // 1 decls
    "buildEncoder": { 0: 'String' }, // 1 decls
    "calculateFee": { 0: 'String', 1: 'String', 2: 'String' }, // 3 decls
    "cancelOrderWithClientOrderId": { 0: 'String' }, // 1 decls
    "checkContractMarket": { 1: 'String' }, // 1 decls
    "checkIfExchangeIsDisabled": { 0: 'String' }, // 1 decls
    "checkNoStockSymbols": { 1: 'String' }, // 1 decls
    "checkRequiredMarginArgument": { 0: 'String', 1: 'String', 2: 'String' }, // 1 decls
    "convertCurrencyNetwork": { 0: 'String' }, // 1 decls
    "createConvertTrade": { 0: 'String', 1: 'String', 2: 'String' }, // 9 decls
    "createDepositAddress": { 0: 'String' }, // 19 decls
    "createEditOrderRequest": { 2: 'String' }, // 1 decls
    "createGiftCode": { 0: 'String' }, // 1 decls
    "createLimitBuyOrder": { 0: 'String' }, // 1 decls
    "createLimitOrder": { 0: 'String' }, // 1 decls
    "createLimitSellOrder": { 0: 'String' }, // 1 decls
    "createMarketBuyOrder": { 0: 'String' }, // 1 decls
    "createMarketBuyOrderWithCost": { 0: 'String' }, // 28 decls
    "createMarketOrder": { 0: 'String' }, // 1 decls
    "createMarketSellOrder": { 0: 'String' }, // 1 decls
    "createMarketSellOrderWithCost": { 0: 'String' }, // 11 decls
    "createOrderSettlementData": { 1: 'String', 2: 'String' }, // 1 decls
    "createOrderWithTakeProfitAndStopLoss": { 0: 'String' }, // 1 decls
    "createPostOnlyOrder": { 0: 'String' }, // 1 decls
    "createPublicSubscriptionRequest": { 0: 'String' }, // 1 decls
    "createReduceOnlyOrder": { 0: 'String' }, // 1 decls
    "createStopLimitOrder": { 0: 'String' }, // 1 decls
    "createStopLossOrder": { 0: 'String' }, // 1 decls
    "createStopMarketOrder": { 0: 'String' }, // 1 decls
    "createStopOrder": { 0: 'String' }, // 1 decls
    "createSubAccount": { 0: 'String' }, // 4 decls
    "createTakeProfitOrder": { 0: 'String' }, // 1 decls
    "createTrailingAmountOrder": { 0: 'String' }, // 2 decls
    "createTrailingPercentOrder": { 0: 'String' }, // 3 decls
    "createTransferSettlementData": { 0: 'String' }, // 1 decls
    "createTriggerOrder": { 0: 'String' }, // 1 decls
    "createTwapOrder": { 0: 'String' }, // 3 decls
    "createVault": { 0: 'String', 1: 'String' }, // 1 decls
    "createWithdrawalSettlementData": { 1: 'String' }, // 1 decls
    "deposit": { 0: 'String', 2: 'String' }, // 1 decls
    "editLimitBuyOrder": { 0: 'String', 1: 'String' }, // 1 decls
    "editLimitSellOrder": { 0: 'String', 1: 'String' }, // 1 decls
    "editOrderWithClientOrderId": { 0: 'String', 1: 'String' }, // 1 decls
    "encodeData": { 0: 'String' }, // 1 decls
    "encodeType": { 0: 'String' }, // 1 decls
    "ethRpc": { 1: 'String' }, // 2 decls
    "featureValue": { 0: 'String' }, // 1 decls
    "fetchADLRank": { 0: 'String' }, // 2 decls
    "fetchBorrowRate": { 0: 'String' }, // 1 decls
    "fetchBorrowRateHistory": { 0: 'String' }, // 5 decls
    "fetchBuilderApprovals": { 0: 'String' }, // 1 decls
    "fetchClosedOrder": { 0: 'String' }, // 4 decls
    "fetchConvertQuote": { 0: 'String', 1: 'String' }, // 9 decls
    "fetchConvertTrade": { 0: 'String' }, // 6 decls
    "fetchCrossBorrowRate": { 0: 'String' }, // 7 decls
    "fetchCurrency": { 0: 'String' }, // 1 decls
    "fetchDeposit": { 0: 'String' }, // 7 decls
    "fetchDepositMethodId": { 0: 'String' }, // 1 decls
    "fetchDepositWithdrawFee": { 0: 'String' }, // 5 decls
    "fetchEvent": { 0: 'String' }, // 7 decls
    "fetchGreeks": { 0: 'String' }, // 8 decls
    "fetchIndexOHLCV": { 0: 'String' }, // 1 decls
    "fetchIsolatedBorrowRate": { 0: 'String' }, // 4 decls
    "fetchL2OrderBook": { 0: 'String' }, // 2 decls
    "fetchLedgerEntry": { 0: 'String' }, // 3 decls
    "fetchLeverage": { 0: 'String' }, // 27 decls
    "fetchLiquidations": { 0: 'String' }, // 6 decls
    "fetchLongShortRatio": { 0: 'String' }, // 1 decls
    "fetchMarginMode": { 0: 'String' }, // 14 decls
    "fetchMarkOHLCV": { 0: 'String' }, // 2 decls
    "fetchMarket": { 0: 'String' }, // 1 decls
    "fetchMarketLeverageTiers": { 0: 'String' }, // 10 decls
    "fetchOpenInterestHistory": { 0: 'String' }, // 9 decls
    "fetchOpenOrder": { 0: 'String' }, // 11 decls
    "fetchOption": { 0: 'String' }, // 7 decls
    "fetchOptionChain": { 0: 'String' }, // 5 decls
    "fetchOrderStatus": { 0: 'String' }, // 3 decls
    "fetchOrderTrades": { 0: 'String' }, // 33 decls
    "fetchOrderWithClientOrderId": { 0: 'String' }, // 1 decls
    "fetchPaginatedCallCursor": { 0: 'String' }, // 1 decls
    "fetchPaginatedCallDeterministic": { 0: 'String' }, // 1 decls
    "fetchPaginatedCallIncremental": { 0: 'String' }, // 1 decls
    "fetchPortfolioDetails": { 0: 'String' }, // 1 decls
    "fetchPremiumIndexOHLCV": { 0: 'String' }, // 1 decls
    "fetchTicker2": { 0: 'String' }, // 1 decls
    "fetchTrades": { 0: 'String' }, // 96 decls
    "fetchTradingFee": { 0: 'String' }, // 38 decls
    "fetchTransactionFee": { 0: 'String' }, // 3 decls
    "fetchTransfer": { 0: 'String' }, // 4 decls
    "fetchVolatilityHistory": { 0: 'String' }, // 2 decls
    "fetchWallet": { 0: 'String' }, // 1 decls
    "fetchWithdrawAddresses": { 0: 'String' }, // 1 decls
    "fetchWithdrawal": { 0: 'String' }, // 6 decls
    "filterTransfersByType": { 1: 'String' }, // 1 decls
    "findSubscription": { 1: 'String' }, // 1 decls
    "findSwapMarketByWsBaseQuote": { 0: 'String' }, // 1 decls
    "fromString": { 0: 'String' }, // 1 decls
    "getDexFromSymbols": { 0: 'String' }, // 1 decls
    "getEncoder": { 0: 'String' }, // 1 decls
    "getEvent": { 0: 'String' }, // 1 decls
    "getExceptionsByUrl": { 1: 'String' }, // 1 decls
    "getOrderBookLimitByMarketType": { 0: 'String' }, // 1 decls
    "getSkips": { 1: 'String' }, // 1 decls
    "handleAccountIndex": { 2: 'String', 3: 'String' }, // 1 decls
    "handleApiKeyIndex": { 2: 'String', 3: 'String' }, // 1 decls
    "handleDeriveSubaccountId": { 0: 'String' }, // 1 decls
    "handleDeriveWalletAddress": { 0: 'String' }, // 1 decls
    "handleNetworkIdAndParams": { 1: 'String' }, // 1 decls
    "handleOption": { 1: 'String' }, // 1 decls
    "handleOriginAndSingleAddress": { 0: 'String' }, // 1 decls
    "handlePaginationParams": { 0: 'String' }, // 1 decls
    "handleParamBool": { 1: 'String' }, // 1 decls
    "handleParamBool2": { 1: 'String', 2: 'String' }, // 1 decls
    "handleParamInteger": { 1: 'String' }, // 1 decls
    "handleParamInteger2": { 1: 'String', 2: 'String' }, // 1 decls
    "handleParamString": { 1: 'String' }, // 3 decls
    "handleParamString2": { 1: 'String', 2: 'String' }, // 3 decls
    "handlePortfolioAndParams": { 0: 'String' }, // 1 decls
    "handleRequestNetwork": { 2: 'String' }, // 1 decls
    "handleTickerAndBidAsk": { 0: 'String' }, // 1 decls
    "handleUTAAndParams": { 1: 'String' }, // 1 decls
    "handleUntilOptionString": { 0: 'String' }, // 1 decls
    "hashStruct": { 0: 'String' }, // 1 decls
    "helperForWatchMultipleConstruct": { 0: 'String' }, // 1 decls
    "initOfflineExchange": { 0: 'String' }, // 1 decls
    "injectWsMessages": { 1: 'String' }, // 1 decls
    "loadCurrenciesFromFile": { 0: 'String' }, // 1 decls
    "loadEventsFromFile": { 0: 'String' }, // 1 decls
    "loadMarketsFromFile": { 0: 'String' }, // 1 decls
    "mintTokenizedAsset": { 0: 'String', 1: 'String' }, // 1 decls
    "off": { 0: 'String' }, // 1 decls
    "on": { 0: 'String' }, // 2 decls
    "once": { 0: 'String' }, // 2 decls
    "orderRequestWs": { 0: 'String' }, // 1 decls
    "parseWsTimestamp": { 1: 'String' }, // 1 decls
    "pow": { 0: 'String' }, // 2 decls
    "priceToPredictionPrecision": { 0: 'String' }, // 1 decls
    "queryTransactionsByEventType": { 0: 'String', 1: 'String', 2: 'String' }, // 1 decls
    "redeemTokenizedAsset": { 0: 'String', 1: 'String' }, // 1 decls
    "reduceMargin": { 0: 'String' }, // 23 decls
    "removeHostnamefromUrl": { 0: 'String' }, // 1 decls
    "repayCrossMargin": { 0: 'String' }, // 8 decls
    "repayIsolatedMargin": { 0: 'String', 1: 'String' }, // 7 decls
    "repayMargin": { 0: 'String' }, // 2 decls
    "requestWalletHistoryRows": { 0: 'String' }, // 1 decls
    "resolve": { 1: 'String' }, // 1 decls
    "resolveAuthType": { 0: 'String' }, // 1 decls
    "resolveOutcomeInput": { 0: 'String' }, // 1 decls
    "reusableFuture": { 0: 'String' }, // 1 decls
    "revokeApiKey": { 0: 'String' }, // 1 decls
    "revokeBuilderCode": { 0: 'String' }, // 1 decls
    "runStaticTests": { 0: 'String' }, // 1 decls
    "safeDict2": { 2: 'String' }, // 3 decls
    "safeList2": { 2: 'String' }, // 3 decls
    "sendEvmTransaction": { 4: 'String' }, // 1 decls
    "setAgentAbstraction": { 0: 'String' }, // 1 decls
    "setOrderBookSnapshot": { 2: 'String' }, // 1 decls
    "setUserAbstraction": { 0: 'String' }, // 1 decls
    "signAndCancelAllOrders": { 0: 'String' }, // 1 decls
    "signAndCancelOrder": { 0: 'String' }, // 1 decls
    "signAndCreateOrder": { 0: 'String' }, // 1 decls
    "stringAbs": { 0: 'String' }, // 1 decls
    "stringAdd": { 0: 'String', 1: 'String' }, // 1 decls
    "stringDiv": { 0: 'String', 1: 'String' }, // 1 decls
    "stringEq": { 0: 'String', 1: 'String' }, // 1 decls
    "stringEquals": { 0: 'String', 1: 'String' }, // 1 decls
    "stringGe": { 0: 'String', 1: 'String' }, // 1 decls
    "stringGt": { 0: 'String', 1: 'String' }, // 1 decls
    "stringLe": { 0: 'String', 1: 'String' }, // 1 decls
    "stringLt": { 0: 'String', 1: 'String' }, // 1 decls
    "stringMax": { 0: 'String', 1: 'String' }, // 1 decls
    "stringMin": { 0: 'String', 1: 'String' }, // 1 decls
    "stringMod": { 0: 'String', 1: 'String' }, // 1 decls
    "stringMul": { 0: 'String', 1: 'String' }, // 1 decls
    "stringNeg": { 0: 'String' }, // 1 decls
    "stringOr": { 0: 'String', 1: 'String' }, // 1 decls
    "stringSub": { 0: 'String', 1: 'String' }, // 1 decls
    "subscribeOpinionChannel": { 1: 'String' }, // 1 decls
    "tagToSlug": { 0: 'String' }, // 1 decls
    "testExchangeRequestStatically": { 0: 'String' }, // 1 decls
    "testExchangeResponseStatically": { 0: 'String' }, // 1 decls
    "testExchangeWsStatically": { 0: 'String' }, // 1 decls
    "testMethod": { 0: 'String' }, // 1 decls
    "testRequestStatically": { 1: 'String', 3: 'String' }, // 1 decls
    "testResponseStatically": { 1: 'String' }, // 1 decls
    "testWsStatically": { 1: 'String' }, // 1 decls
    "tokenizedConvertStatus": { 0: 'String', 1: 'String' }, // 1 decls
    "tradeRequest": { 0: 'String' }, // 2 decls
    "transferIn": { 0: 'String' }, // 2 decls
    "transferOut": { 0: 'String' }, // 4 decls
    "unWatchChannel": { 3: 'String' }, // 1 decls
    "unWatchChannels": { 0: 'String' }, // 1 decls
    "unWatchTopics": { 1: 'String' }, // 1 decls
    "urlencodedToDict": { 0: 'String' }, // 1 decls
    "verifyGiftCode": { 0: 'String' }, // 1 decls
    "watchAndAssertSequence": { 1: 'String', 2: 'String' }, // 1 decls
};
