const JAVA_PARAM_STRING_TYPES = {
    "addMargin": { 0: 'String' }, // 23 decls
    "approveBuilderCode": { 0: 'String' }, // 1 decls
    "bindAgentWallet": { 0: 'String' }, // 1 decls
    "borrowCrossMargin": { 0: 'String' }, // 8 decls
    "borrowIsolatedMargin": { 0: 'String', 1: 'String' }, // 7 decls
    "borrowMargin": { 0: 'String' }, // 1 decls
    "buildEncoder": { 0: 'String' }, // 1 decls
    "calculateFee": { 0: 'String', 1: 'String', 2: 'String' }, // 3 decls
    "calculateFeeWithRate": { 0: 'String', 1: 'String', 2: 'String' }, // 1 decls
    "cancelOrderWithClientOrderId": { 0: 'String' }, // 1 decls
    "checkContractMarket": { 1: 'String' }, // 1 decls
    "checkNoStockSymbols": { 1: 'String' }, // 1 decls
    "checkRequiredArgument": { 0: 'String' }, // 1 decls
    "checkRequiredMarginArgument": { 0: 'String', 1: 'String', 2: 'String' }, // 1 decls
    "convertCurrencyNetwork": { 0: 'String' }, // 1 decls
    "createAdvancedOrderRequest": { 0: 'String' }, // 1 decls
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
    "createMarketOrderWithCost": { 0: 'String' }, // 9 decls
    "createMarketSellOrder": { 0: 'String' }, // 1 decls
    "createMarketSellOrderWithCost": { 0: 'String' }, // 11 decls
    "createOrderSettlementData": { 1: 'String', 2: 'String' }, // 1 decls
    "createOrderWithTakeProfitAndStopLoss": { 0: 'String' }, // 1 decls
    "createPostOnlyOrder": { 0: 'String' }, // 1 decls
    "createPublicSubscriptionRequest": { 0: 'String' }, // 1 decls
    "createReduceOnlyOrder": { 0: 'String' }, // 1 decls
    "createSignedRequest": { 1: 'String' }, // 1 decls
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
    "editContractOrder": { 0: 'String' }, // 1 decls
    "editLimitBuyOrder": { 0: 'String', 1: 'String' }, // 1 decls
    "editLimitOrder": { 0: 'String', 1: 'String' }, // 1 decls
    "editLimitSellOrder": { 0: 'String', 1: 'String' }, // 1 decls
    "editOrder": { 0: 'String' }, // 48 decls
    "editOrderWithClientOrderId": { 0: 'String', 1: 'String' }, // 1 decls
    "editSpotOrder": { 0: 'String' }, // 1 decls
    "encodeData": { 0: 'String' }, // 1 decls
    "encodeTriggerPriceType": { 0: 'String' }, // 2 decls
    "encodeType": { 0: 'String' }, // 1 decls
    "ethRpc": { 1: 'String' }, // 2 decls
    "feeToPrecision": { 0: 'String' }, // 2 decls
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
    "fetchDerivativesMarketLeverageTiers": { 0: 'String' }, // 1 decls
    "fetchDerivativesOpenInterestHistory": { 0: 'String' }, // 1 decls
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
    "fetchPrivateTradingFee": { 0: 'String' }, // 1 decls
    "fetchPublicTradingFee": { 0: 'String' }, // 1 decls
    "fetchSpotOrderTrades": { 0: 'String' }, // 1 decls
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
    "future": { 0: 'String' }, // 1 decls
    "futuresTransfer": { 0: 'String' }, // 1 decls
    "getBaseDomainFromUrl": { 0: 'String' }, // 1 decls
    "getDexFromSymbols": { 0: 'String' }, // 1 decls
    "getEncoder": { 0: 'String' }, // 1 decls
    "getEvent": { 0: 'String' }, // 1 decls
    "getExceptionsByUrl": { 1: 'String' }, // 1 decls
    "getExtendedStarkAmount": { 0: 'String' }, // 1 decls
    "getExtendedStringToFelt": { 0: 'String' }, // 1 decls
    "getOrderBookLimitByMarketType": { 0: 'String' }, // 1 decls
    "handleAccountIndex": { 1: 'String', 2: 'String', 3: 'String' }, // 1 decls
    "handleApiKeyIndex": { 1: 'String', 2: 'String', 3: 'String' }, // 1 decls
    "handleDeriveSubaccountId": { 0: 'String' }, // 1 decls
    "handleDeriveWalletAddress": { 0: 'String' }, // 1 decls
    "handleNetworkIdAndParams": { 1: 'String' }, // 1 decls
    "handleOption": { 1: 'String' }, // 1 decls
    "handleOptionAndParams2": { 2: 'String', 3: 'String' }, // 3 decls
    "handleOriginAndSingleAddress": { 0: 'String' }, // 1 decls
    "handlePaginationParams": { 0: 'String' }, // 1 decls
    "handleParamBool": { 1: 'String' }, // 1 decls
    "handleParamBool2": { 1: 'String', 2: 'String' }, // 1 decls
    "handleParamInteger": { 1: 'String' }, // 1 decls
    "handleParamInteger2": { 1: 'String', 2: 'String' }, // 1 decls
    "handleParamString": { 1: 'String' }, // 3 decls
    "handleParamString2": { 1: 'String', 2: 'String' }, // 3 decls
    "handlePortfolioAndParams": { 0: 'String' }, // 1 decls
    "handleTickerAndBidAsk": { 0: 'String' }, // 1 decls
    "handleUTAAndParams": { 1: 'String' }, // 1 decls
    "handleUntilOption": { 0: 'String' }, // 1 decls
    "handleUntilOptionString": { 0: 'String' }, // 1 decls
    "hashStruct": { 0: 'String' }, // 1 decls
    "helperForWatchMultipleConstruct": { 0: 'String' }, // 1 decls
    "integerPrecisionToAmount": { 0: 'String' }, // 1 decls
    "mintTokenizedAsset": { 0: 'String', 1: 'String' }, // 1 decls
    "modifyMarginHelper": { 0: 'String' }, // 17 decls
    "off": { 0: 'String' }, // 1 decls
    "on": { 0: 'String' }, // 2 decls
    "once": { 0: 'String' }, // 2 decls
    "orderRequestWs": { 0: 'String' }, // 1 decls
    "parseBorrowRateHistory": { 1: 'String' }, // 1 decls
    "parseLeverageFromSetting": { 0: 'String' }, // 1 decls
    "parseMarginModeFromSetting": { 0: 'String' }, // 1 decls
    "parseMarginModeType": { 0: 'String' }, // 2 decls
    "parseOutcomeInputSideHint": { 0: 'String' }, // 1 decls
    "parseTradeType": { 0: 'String' }, // 1 decls
    "parseWsTimestamp": { 1: 'String' }, // 1 decls
    "pow": { 0: 'String' }, // 2 decls
    "priceToPredictionPrecision": { 0: 'String' }, // 1 decls
    "queryTransactionsByEventType": { 0: 'String', 1: 'String', 2: 'String' }, // 1 decls
    "redeemTokenizedAsset": { 0: 'String', 1: 'String' }, // 1 decls
    "reduceMargin": { 0: 'String' }, // 23 decls
    "removeMarketSuffix": { 0: 'String' }, // 1 decls
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
    "sendEvmTransaction": { 4: 'String' }, // 1 decls
    "setAgentAbstraction": { 0: 'String' }, // 1 decls
    "setMargin": { 0: 'String' }, // 7 decls
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
    "tokenizedConvertStatus": { 0: 'String', 1: 'String' }, // 1 decls
    "tradeRequest": { 0: 'String' }, // 2 decls
    "transfer": { 0: 'String' }, // 48 decls
    "transferBetweenMainAndSubAccount": { 0: 'String' }, // 1 decls
    "transferBetweenSubAccounts": { 0: 'String' }, // 1 decls
    "transferClassic": { 0: 'String' }, // 1 decls
    "transferIn": { 0: 'String' }, // 2 decls
    "transferOut": { 0: 'String' }, // 4 decls
    "transferUta": { 0: 'String' }, // 1 decls
    "unWatchChannel": { 3: 'String' }, // 1 decls
    "unWatchChannels": { 0: 'String' }, // 1 decls
    "unWatchTopics": { 1: 'String' }, // 1 decls
    "updateSpotCurrencyCode": { 0: 'String' }, // 1 decls
    "uuid5": { 0: 'String' }, // 1 decls
    "verifyGiftCode": { 0: 'String' }, // 1 decls
};
