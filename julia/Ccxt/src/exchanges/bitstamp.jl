@kwdef mutable struct Bitstamp <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchMarkets::Function = fetchMarkets
    constructCurrencyObject::Function = constructCurrencyObject
    fetchMarketsFromCache::Function = fetchMarketsFromCache
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    getCurrencyIdFromTransaction::Function = getCurrencyIdFromTransaction
    getMarketFromTrade::Function = getMarketFromTrade
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    fetchTradingFee::Function = fetchTradingFee
    parseTradingFee::Function = parseTradingFee
    parseTradingFees::Function = parseTradingFees
    fetchTradingFees::Function = fetchTradingFees
    fetchTransactionFees::Function = fetchTransactionFees
    parseTransactionFees::Function = parseTransactionFees
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    parseOrderStatus::Function = parseOrderStatus
    fetchOrderStatus::Function = fetchOrderStatus
    fetchOrder::Function = fetchOrder
    fetchMyTrades::Function = fetchMyTrades
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    fetchDepositsWithdrawals::Function = fetchDepositsWithdrawals
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    parseOrder::Function = parseOrder
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    fetchLedger::Function = fetchLedger
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    fetchOpenOrders::Function = fetchOpenOrders
    getCurrencyName::Function = getCurrencyName
    isFiat::Function = isFiat
    fetchDepositAddress::Function = fetchDepositAddress
    withdraw::Function = withdraw
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetOhlcPair::Function = publicGetOhlcPair
    publicGetOrderBookPair::Function = publicGetOrderBookPair
    publicGetTicker::Function = publicGetTicker
    publicGetTickerHourPair::Function = publicGetTickerHourPair
    publicGetTickerPair::Function = publicGetTickerPair
    publicGetTransactionsPair::Function = publicGetTransactionsPair
    publicGetTradingPairsInfo::Function = publicGetTradingPairsInfo
    publicGetMarkets::Function = publicGetMarkets
    publicGetCurrencies::Function = publicGetCurrencies
    publicGetEurUsd::Function = publicGetEurUsd
    publicGetTravelRuleVasps::Function = publicGetTravelRuleVasps
    publicGetFundingRateMarketSymbol::Function = publicGetFundingRateMarketSymbol
    publicGetFundingRateHistoryPair::Function = publicGetFundingRateHistoryPair
    privateGetTravelRuleContacts::Function = privateGetTravelRuleContacts
    privateGetContactsContactUuid::Function = privateGetContactsContactUuid
    privateGetEarnSubscriptions::Function = privateGetEarnSubscriptions
    privateGetEarnTransactions::Function = privateGetEarnTransactions
    privateGetTradeHistory::Function = privateGetTradeHistory
    privateGetTradeHistoryPair::Function = privateGetTradeHistoryPair
    privatePostAccountBalances::Function = privatePostAccountBalances
    privatePostAccountBalancesCurrency::Function = privatePostAccountBalancesCurrency
    privatePostBalance::Function = privatePostBalance
    privatePostBalancePair::Function = privatePostBalancePair
    privatePostBchWithdrawal::Function = privatePostBchWithdrawal
    privatePostBchAddress::Function = privatePostBchAddress
    privatePostUserTransactions::Function = privatePostUserTransactions
    privatePostUserTransactionsPair::Function = privatePostUserTransactionsPair
    privatePostCryptoTransactions::Function = privatePostCryptoTransactions
    privatePostOpenOrder::Function = privatePostOpenOrder
    privatePostOpenOrdersAll::Function = privatePostOpenOrdersAll
    privatePostOpenOrdersPair::Function = privatePostOpenOrdersPair
    privatePostReplaceOrder::Function = privatePostReplaceOrder
    privatePostOrderStatus::Function = privatePostOrderStatus
    privatePostCancelOrder::Function = privatePostCancelOrder
    privatePostCancelAllOrders::Function = privatePostCancelAllOrders
    privatePostCancelAllOrdersPair::Function = privatePostCancelAllOrdersPair
    privatePostBuyPair::Function = privatePostBuyPair
    privatePostBuyMarketPair::Function = privatePostBuyMarketPair
    privatePostBuyInstantPair::Function = privatePostBuyInstantPair
    privatePostSellPair::Function = privatePostSellPair
    privatePostSellMarketPair::Function = privatePostSellMarketPair
    privatePostSellInstantPair::Function = privatePostSellInstantPair
    privatePostTransferToMain::Function = privatePostTransferToMain
    privatePostTransferFromMain::Function = privatePostTransferFromMain
    privatePostMyTradingPairs::Function = privatePostMyTradingPairs
    privatePostFeesTrading::Function = privatePostFeesTrading
    privatePostFeesTradingMarketSymbol::Function = privatePostFeesTradingMarketSymbol
    privatePostFeesWithdrawal::Function = privatePostFeesWithdrawal
    privatePostFeesWithdrawalCurrency::Function = privatePostFeesWithdrawalCurrency
    privatePostWithdrawalRequests::Function = privatePostWithdrawalRequests
    privatePostWithdrawalOpen::Function = privatePostWithdrawalOpen
    privatePostWithdrawalStatus::Function = privatePostWithdrawalStatus
    privatePostWithdrawalCancel::Function = privatePostWithdrawalCancel
    privatePostLiquidationAddressNew::Function = privatePostLiquidationAddressNew
    privatePostLiquidationAddressInfo::Function = privatePostLiquidationAddressInfo
    privatePostBtcUnconfirmed::Function = privatePostBtcUnconfirmed
    privatePostWebsocketsToken::Function = privatePostWebsocketsToken
    privatePostRevokeAllApiKeys::Function = privatePostRevokeAllApiKeys
    privatePostGetMaxOrderAmount::Function = privatePostGetMaxOrderAmount
    privatePostBtcWithdrawal::Function = privatePostBtcWithdrawal
    privatePostBtcAddress::Function = privatePostBtcAddress
    privatePostRippleWithdrawal::Function = privatePostRippleWithdrawal
    privatePostRippleAddress::Function = privatePostRippleAddress
    privatePostLtcWithdrawal::Function = privatePostLtcWithdrawal
    privatePostLtcAddress::Function = privatePostLtcAddress
    privatePostEthWithdrawal::Function = privatePostEthWithdrawal
    privatePostEthAddress::Function = privatePostEthAddress
    privatePostXrpWithdrawal::Function = privatePostXrpWithdrawal
    privatePostXrpAddress::Function = privatePostXrpAddress
    privatePostXlmWithdrawal::Function = privatePostXlmWithdrawal
    privatePostXlmAddress::Function = privatePostXlmAddress
    privatePostPaxWithdrawal::Function = privatePostPaxWithdrawal
    privatePostPaxAddress::Function = privatePostPaxAddress
    privatePostLinkWithdrawal::Function = privatePostLinkWithdrawal
    privatePostLinkAddress::Function = privatePostLinkAddress
    privatePostUsdcWithdrawal::Function = privatePostUsdcWithdrawal
    privatePostUsdcAddress::Function = privatePostUsdcAddress
    privatePostOmgWithdrawal::Function = privatePostOmgWithdrawal
    privatePostOmgAddress::Function = privatePostOmgAddress
    privatePostDaiWithdrawal::Function = privatePostDaiWithdrawal
    privatePostDaiAddress::Function = privatePostDaiAddress
    privatePostKncWithdrawal::Function = privatePostKncWithdrawal
    privatePostKncAddress::Function = privatePostKncAddress
    privatePostMkrWithdrawal::Function = privatePostMkrWithdrawal
    privatePostMkrAddress::Function = privatePostMkrAddress
    privatePostZrxWithdrawal::Function = privatePostZrxWithdrawal
    privatePostZrxAddress::Function = privatePostZrxAddress
    privatePostGusdWithdrawal::Function = privatePostGusdWithdrawal
    privatePostGusdAddress::Function = privatePostGusdAddress
    privatePostAaveWithdrawal::Function = privatePostAaveWithdrawal
    privatePostAaveAddress::Function = privatePostAaveAddress
    privatePostBatWithdrawal::Function = privatePostBatWithdrawal
    privatePostBatAddress::Function = privatePostBatAddress
    privatePostUmaWithdrawal::Function = privatePostUmaWithdrawal
    privatePostUmaAddress::Function = privatePostUmaAddress
    privatePostSnxWithdrawal::Function = privatePostSnxWithdrawal
    privatePostSnxAddress::Function = privatePostSnxAddress
    privatePostUniWithdrawal::Function = privatePostUniWithdrawal
    privatePostUniAddress::Function = privatePostUniAddress
    privatePostYfiWithdrawal::Function = privatePostYfiWithdrawal
    privatePostYfiAddress::Function = privatePostYfiAddress
    privatePostAudioWithdrawal::Function = privatePostAudioWithdrawal
    privatePostAudioAddress::Function = privatePostAudioAddress
    privatePostCrvWithdrawal::Function = privatePostCrvWithdrawal
    privatePostCrvAddress::Function = privatePostCrvAddress
    privatePostAlgoWithdrawal::Function = privatePostAlgoWithdrawal
    privatePostAlgoAddress::Function = privatePostAlgoAddress
    privatePostCompWithdrawal::Function = privatePostCompWithdrawal
    privatePostCompAddress::Function = privatePostCompAddress
    privatePostGrtWithdrawal::Function = privatePostGrtWithdrawal
    privatePostGrtAddress::Function = privatePostGrtAddress
    privatePostUsdtWithdrawal::Function = privatePostUsdtWithdrawal
    privatePostUsdtAddress::Function = privatePostUsdtAddress
    privatePostEurtWithdrawal::Function = privatePostEurtWithdrawal
    privatePostEurtAddress::Function = privatePostEurtAddress
    privatePostMaticWithdrawal::Function = privatePostMaticWithdrawal
    privatePostMaticAddress::Function = privatePostMaticAddress
    privatePostSushiWithdrawal::Function = privatePostSushiWithdrawal
    privatePostSushiAddress::Function = privatePostSushiAddress
    privatePostChzWithdrawal::Function = privatePostChzWithdrawal
    privatePostChzAddress::Function = privatePostChzAddress
    privatePostEnjWithdrawal::Function = privatePostEnjWithdrawal
    privatePostEnjAddress::Function = privatePostEnjAddress
    privatePostAlphaWithdrawal::Function = privatePostAlphaWithdrawal
    privatePostAlphaAddress::Function = privatePostAlphaAddress
    privatePostFttWithdrawal::Function = privatePostFttWithdrawal
    privatePostFttAddress::Function = privatePostFttAddress
    privatePostStorjWithdrawal::Function = privatePostStorjWithdrawal
    privatePostStorjAddress::Function = privatePostStorjAddress
    privatePostAxsWithdrawal::Function = privatePostAxsWithdrawal
    privatePostAxsAddress::Function = privatePostAxsAddress
    privatePostSandWithdrawal::Function = privatePostSandWithdrawal
    privatePostSandAddress::Function = privatePostSandAddress
    privatePostHbarWithdrawal::Function = privatePostHbarWithdrawal
    privatePostHbarAddress::Function = privatePostHbarAddress
    privatePostRgtWithdrawal::Function = privatePostRgtWithdrawal
    privatePostRgtAddress::Function = privatePostRgtAddress
    privatePostFetWithdrawal::Function = privatePostFetWithdrawal
    privatePostFetAddress::Function = privatePostFetAddress
    privatePostSklWithdrawal::Function = privatePostSklWithdrawal
    privatePostSklAddress::Function = privatePostSklAddress
    privatePostCelWithdrawal::Function = privatePostCelWithdrawal
    privatePostCelAddress::Function = privatePostCelAddress
    privatePostSxpWithdrawal::Function = privatePostSxpWithdrawal
    privatePostSxpAddress::Function = privatePostSxpAddress
    privatePostAdaWithdrawal::Function = privatePostAdaWithdrawal
    privatePostAdaAddress::Function = privatePostAdaAddress
    privatePostSlpWithdrawal::Function = privatePostSlpWithdrawal
    privatePostSlpAddress::Function = privatePostSlpAddress
    privatePostFtmWithdrawal::Function = privatePostFtmWithdrawal
    privatePostFtmAddress::Function = privatePostFtmAddress
    privatePostPerpWithdrawal::Function = privatePostPerpWithdrawal
    privatePostPerpAddress::Function = privatePostPerpAddress
    privatePostDydxWithdrawal::Function = privatePostDydxWithdrawal
    privatePostDydxAddress::Function = privatePostDydxAddress
    privatePostGalaWithdrawal::Function = privatePostGalaWithdrawal
    privatePostGalaAddress::Function = privatePostGalaAddress
    privatePostShibWithdrawal::Function = privatePostShibWithdrawal
    privatePostShibAddress::Function = privatePostShibAddress
    privatePostAmpWithdrawal::Function = privatePostAmpWithdrawal
    privatePostAmpAddress::Function = privatePostAmpAddress
    privatePostSgbWithdrawal::Function = privatePostSgbWithdrawal
    privatePostSgbAddress::Function = privatePostSgbAddress
    privatePostAvaxWithdrawal::Function = privatePostAvaxWithdrawal
    privatePostAvaxAddress::Function = privatePostAvaxAddress
    privatePostWbtcWithdrawal::Function = privatePostWbtcWithdrawal
    privatePostWbtcAddress::Function = privatePostWbtcAddress
    privatePostCtsiWithdrawal::Function = privatePostCtsiWithdrawal
    privatePostCtsiAddress::Function = privatePostCtsiAddress
    privatePostCvxWithdrawal::Function = privatePostCvxWithdrawal
    privatePostCvxAddress::Function = privatePostCvxAddress
    privatePostImxWithdrawal::Function = privatePostImxWithdrawal
    privatePostImxAddress::Function = privatePostImxAddress
    privatePostNexoWithdrawal::Function = privatePostNexoWithdrawal
    privatePostNexoAddress::Function = privatePostNexoAddress
    privatePostUstWithdrawal::Function = privatePostUstWithdrawal
    privatePostUstAddress::Function = privatePostUstAddress
    privatePostAntWithdrawal::Function = privatePostAntWithdrawal
    privatePostAntAddress::Function = privatePostAntAddress
    privatePostGodsWithdrawal::Function = privatePostGodsWithdrawal
    privatePostGodsAddress::Function = privatePostGodsAddress
    privatePostRadWithdrawal::Function = privatePostRadWithdrawal
    privatePostRadAddress::Function = privatePostRadAddress
    privatePostBandWithdrawal::Function = privatePostBandWithdrawal
    privatePostBandAddress::Function = privatePostBandAddress
    privatePostInjWithdrawal::Function = privatePostInjWithdrawal
    privatePostInjAddress::Function = privatePostInjAddress
    privatePostRlyWithdrawal::Function = privatePostRlyWithdrawal
    privatePostRlyAddress::Function = privatePostRlyAddress
    privatePostRndrWithdrawal::Function = privatePostRndrWithdrawal
    privatePostRndrAddress::Function = privatePostRndrAddress
    privatePostVegaWithdrawal::Function = privatePostVegaWithdrawal
    privatePostVegaAddress::Function = privatePostVegaAddress
    privatePost1inchWithdrawal::Function = privatePost1inchWithdrawal
    privatePost1inchAddress::Function = privatePost1inchAddress
    privatePostEnsWithdrawal::Function = privatePostEnsWithdrawal
    privatePostEnsAddress::Function = privatePostEnsAddress
    privatePostManaWithdrawal::Function = privatePostManaWithdrawal
    privatePostManaAddress::Function = privatePostManaAddress
    privatePostLrcWithdrawal::Function = privatePostLrcWithdrawal
    privatePostLrcAddress::Function = privatePostLrcAddress
    privatePostApeWithdrawal::Function = privatePostApeWithdrawal
    privatePostApeAddress::Function = privatePostApeAddress
    privatePostMplWithdrawal::Function = privatePostMplWithdrawal
    privatePostMplAddress::Function = privatePostMplAddress
    privatePostEurocWithdrawal::Function = privatePostEurocWithdrawal
    privatePostEurocAddress::Function = privatePostEurocAddress
    privatePostSolWithdrawal::Function = privatePostSolWithdrawal
    privatePostSolAddress::Function = privatePostSolAddress
    privatePostDotWithdrawal::Function = privatePostDotWithdrawal
    privatePostDotAddress::Function = privatePostDotAddress
    privatePostNearWithdrawal::Function = privatePostNearWithdrawal
    privatePostNearAddress::Function = privatePostNearAddress
    privatePostDogeWithdrawal::Function = privatePostDogeWithdrawal
    privatePostDogeAddress::Function = privatePostDogeAddress
    privatePostFlrWithdrawal::Function = privatePostFlrWithdrawal
    privatePostFlrAddress::Function = privatePostFlrAddress
    privatePostDgldWithdrawal::Function = privatePostDgldWithdrawal
    privatePostDgldAddress::Function = privatePostDgldAddress
    privatePostLdoWithdrawal::Function = privatePostLdoWithdrawal
    privatePostLdoAddress::Function = privatePostLdoAddress
    privatePostTravelRuleContacts::Function = privatePostTravelRuleContacts
    privatePostEarnSubscribe::Function = privatePostEarnSubscribe
    privatePostEarnSubscriptionsSetting::Function = privatePostEarnSubscriptionsSetting
    privatePostEarnUnsubscribe::Function = privatePostEarnUnsubscribe
    privatePostWecanWithdrawal::Function = privatePostWecanWithdrawal
    privatePostWecanAddress::Function = privatePostWecanAddress
    privatePostTracWithdrawal::Function = privatePostTracWithdrawal
    privatePostTracAddress::Function = privatePostTracAddress
    privatePostEurcvWithdrawal::Function = privatePostEurcvWithdrawal
    privatePostEurcvAddress::Function = privatePostEurcvAddress
    privatePostPyusdWithdrawal::Function = privatePostPyusdWithdrawal
    privatePostPyusdAddress::Function = privatePostPyusdAddress
    privatePostLmwrWithdrawal::Function = privatePostLmwrWithdrawal
    privatePostLmwrAddress::Function = privatePostLmwrAddress
    privatePostPepeWithdrawal::Function = privatePostPepeWithdrawal
    privatePostPepeAddress::Function = privatePostPepeAddress
    privatePostBlurWithdrawal::Function = privatePostBlurWithdrawal
    privatePostBlurAddress::Function = privatePostBlurAddress
    privatePostVextWithdrawal::Function = privatePostVextWithdrawal
    privatePostVextAddress::Function = privatePostVextAddress
    privatePostCsprWithdrawal::Function = privatePostCsprWithdrawal
    privatePostCsprAddress::Function = privatePostCsprAddress
    privatePostVchfWithdrawal::Function = privatePostVchfWithdrawal
    privatePostVchfAddress::Function = privatePostVchfAddress
    privatePostVeurWithdrawal::Function = privatePostVeurWithdrawal
    privatePostVeurAddress::Function = privatePostVeurAddress
    privatePostTrufWithdrawal::Function = privatePostTrufWithdrawal
    privatePostTrufAddress::Function = privatePostTrufAddress
    privatePostWifWithdrawal::Function = privatePostWifWithdrawal
    privatePostWifAddress::Function = privatePostWifAddress
    privatePostSmtWithdrawal::Function = privatePostSmtWithdrawal
    privatePostSmtAddress::Function = privatePostSmtAddress
    privatePostSuiWithdrawal::Function = privatePostSuiWithdrawal
    privatePostSuiAddress::Function = privatePostSuiAddress
    privatePostJupWithdrawal::Function = privatePostJupWithdrawal
    privatePostJupAddress::Function = privatePostJupAddress
    privatePostOndoWithdrawal::Function = privatePostOndoWithdrawal
    privatePostOndoAddress::Function = privatePostOndoAddress
    privatePostBobaWithdrawal::Function = privatePostBobaWithdrawal
    privatePostBobaAddress::Function = privatePostBobaAddress
    privatePostPythWithdrawal::Function = privatePostPythWithdrawal
    privatePostPythAddress::Function = privatePostPythAddress

end
function describe(self::Bitstamp, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitstamp",
    Symbol("name") => "Bitstamp",
    Symbol("countries") => ["GB"],
    Symbol("rateLimit") => 75,
    Symbol("version") => "v2",
    Symbol("userAgent") => get(self.userAgents, Symbol("chrome"), nothing),
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createOrder") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => false,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("editOrder") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDepositsWithdrawals") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchIsolatedPositions") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverages") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarginModes") => false,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => false,
        Symbol("fetchPositionsForSymbol") => false,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactionFees") => true,
        Symbol("fetchTransactions") => "emulated",
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => false,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/d5480572-1fee-43cb-b900-d38c522d0024",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://www.bitstamp.net/api",
            Symbol("private") => "https://www.bitstamp.net/api"
        ),
        Symbol("www") => "https://www.bitstamp.net",
        Symbol("doc") => "https://www.bitstamp.net/api"
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "60",
        Symbol("3m") => "180",
        Symbol("5m") => "300",
        Symbol("15m") => "900",
        Symbol("30m") => "1800",
        Symbol("1h") => "3600",
        Symbol("2h") => "7200",
        Symbol("4h") => "14400",
        Symbol("6h") => "21600",
        Symbol("12h") => "43200",
        Symbol("1d") => "86400",
        Symbol("1w") => "259200"
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ohlc/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order_book/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker_hour/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transactions/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trading-pairs-info/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("markets/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("currencies/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("eur_usd/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("travel_rule/vasps/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding_rate/{market_symbol}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("funding_rate_history/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("travel_rule/contacts/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contacts/{contact_uuid}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("earn/subscriptions/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("earn/transactions/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade_history/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade_history/{pair}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account_balances/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account_balances/{currency}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("balance/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("balance/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bch_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bch_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user_transactions/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user_transactions/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("crypto-transactions/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open_order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open_orders/all/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("open_orders/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("replace_order/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order_status/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancel_order/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancel_all_orders/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cancel_all_orders/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("buy/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("buy/market/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("buy/instant/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sell/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sell/market/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sell/instant/{pair}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfer-to-main/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("transfer-from-main/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("my_trading_pairs/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fees/trading/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fees/trading/{market_symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fees/withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fees/withdrawal/{currency}/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawal-requests/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawal/open/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawal/status/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("withdrawal/cancel/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("liquidation_address/new/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("liquidation_address/info/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("btc_unconfirmed/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("websockets_token/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("revoke_all_api_keys/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("get_max_order_amount/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("btc_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("btc_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ripple_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ripple_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ltc_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ltc_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("eth_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("eth_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("xrp_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("xrp_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("xlm_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("xlm_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pax_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pax_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("link_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("link_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("usdc_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("usdc_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("omg_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("omg_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dai_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dai_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("knc_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("knc_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("mkr_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("mkr_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("zrx_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("zrx_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("gusd_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("gusd_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("aave_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("aave_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bat_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("bat_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("uma_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("uma_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("snx_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("snx_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("uni_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("uni_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("yfi_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("yfi_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("audio_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("audio_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("crv_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("crv_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("comp_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("comp_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("grt_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("grt_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("usdt_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("usdt_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("eurt_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("eurt_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("matic_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("matic_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sushi_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sushi_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("chz_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("chz_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("enj_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("enj_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("alpha_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("alpha_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ftt_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ftt_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("storj_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("storj_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("axs_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("axs_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sand_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sand_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hbar_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hbar_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rgt_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rgt_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fet_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fet_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("skl_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("skl_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cel_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cel_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sxp_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sxp_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ada_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ada_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("slp_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("slp_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ftm_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ftm_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("perp_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("perp_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dydx_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dydx_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("gala_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("gala_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("shib_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("shib_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("amp_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("amp_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sgb_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sgb_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("avax_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("avax_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wbtc_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wbtc_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ctsi_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ctsi_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cvx_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cvx_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("imx_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("imx_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("nexo_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("nexo_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ust_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ust_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ant_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ant_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("gods_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("gods_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rad_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rad_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("band_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("band_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("inj_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("inj_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rly_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rly_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rndr_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rndr_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vega_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vega_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("1inch_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("1inch_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ens_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ens_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("mana_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("mana_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lrc_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lrc_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ape_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ape_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("mpl_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("mpl_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("euroc_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("euroc_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sol_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sol_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dot_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dot_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("near_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("near_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("doge_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("doge_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("flr_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("flr_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dgld_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("dgld_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ldo_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ldo_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("travel_rule/contacts/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("earn/subscribe/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("earn/subscriptions/setting/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("earn/unsubscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wecan_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wecan_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trac_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trac_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("eurcv_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("eurcv_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pyusd_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pyusd_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lmwr_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("lmwr_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pepe_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pepe_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("blur_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("blur_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vext_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vext_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cspr_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cspr_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vchf_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("vchf_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("veur_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("veur_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("truf_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("truf_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wif_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("wif_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("smt_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("smt_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sui_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sui_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("jup_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("jup_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ondo_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ondo_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("boba_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("boba_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pyth_withdrawal/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("pyth_address/") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.004"),
            Symbol("maker") => self.parseNumber("0.004"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.004")], [self.parseNumber("10000"), self.parseNumber("0.003")], [self.parseNumber("100000"), self.parseNumber("0.002")], [self.parseNumber("500000"), self.parseNumber("0.0018")], [self.parseNumber("1500000"), self.parseNumber("0.0016")], [self.parseNumber("5000000"), self.parseNumber("0.0012")], [self.parseNumber("20000000"), self.parseNumber("0.001")], [self.parseNumber("50000000"), self.parseNumber("0.0008")], [self.parseNumber("100000000"), self.parseNumber("0.0006")], [self.parseNumber("250000000"), self.parseNumber("0.0005")], [self.parseNumber("1000000000"), self.parseNumber("0.0003")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.003")], [self.parseNumber("10000"), self.parseNumber("0.002")], [self.parseNumber("100000"), self.parseNumber("0.001")], [self.parseNumber("500000"), self.parseNumber("0.0008")], [self.parseNumber("1500000"), self.parseNumber("0.0006")], [self.parseNumber("5000000"), self.parseNumber("0.0003")], [self.parseNumber("20000000"), self.parseNumber("0.002")], [self.parseNumber("50000000"), self.parseNumber("0.0001")], [self.parseNumber("100000000"), self.parseNumber("0")], [self.parseNumber("250000000"), self.parseNumber("0")], [self.parseNumber("1000000000"), self.parseNumber("0")]]
            )
        ),
        Symbol("funding") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => false,
            Symbol("withdraw") => Dict{Symbol, Any}(),
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("BTC") => 0,
                Symbol("BCH") => 0,
                Symbol("LTC") => 0,
                Symbol("ETH") => 0,
                Symbol("XRP") => 0,
                Symbol("XLM") => 0,
                Symbol("PAX") => 0,
                Symbol("USD") => 7.5,
                Symbol("EUR") => 0
            )
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("UST") => "USTC"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("mica") => true,
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("bitcoin-cash") => "BCH",
            Symbol("bitcoin") => "BTC",
            Symbol("ethereum") => "ERC20",
            Symbol("litecoin") => "LTC",
            Symbol("stellar") => "XLM",
            Symbol("xrpl") => "XRP",
            Symbol("tron") => "TRC20",
            Symbol("algorand") => "ALGO",
            Symbol("flare") => "FLR",
            Symbol("hedera") => "HBAR",
            Symbol("cardana") => "ADA",
            Symbol("songbird") => "FLR",
            Symbol("avalanche-c-chain") => "AVAX",
            Symbol("solana") => "SOL",
            Symbol("polkadot") => "DOT",
            Symbol("near") => "NEAR",
            Symbol("doge") => "DOGE",
            Symbol("sui") => "SUI",
            Symbol("casper") => "CSRP"
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("No permission found") => PermissionDenied,
            Symbol("API key not found") => AuthenticationError,
            Symbol("IP address not allowed") => PermissionDenied,
            Symbol("Invalid nonce") => InvalidNonce,
            Symbol("Invalid signature") => AuthenticationError,
            Symbol("Authentication failed") => AuthenticationError,
            Symbol("Missing key, signature and nonce parameters") => AuthenticationError,
            Symbol("Wrong API key format") => AuthenticationError,
            Symbol("Your account is frozen") => PermissionDenied,
            Symbol("Please update your profile with your FATCA information, before using API.") => PermissionDenied,
            Symbol("Order not found.") => OrderNotFound,
            Symbol("Bitstamp.net is under scheduled maintenance. We'll be back soon.") => OnMaintenance,
            Symbol("Order could not be placed.") => ExchangeNotAvailable,
            Symbol("Invalid offset.") => BadRequest,
            Symbol("Trading is currently unavailable for your account.") => AccountSuspended
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Minimum order size is") => InvalidOrder,
            Symbol("Price is more than") => InvalidOrder,
            Symbol("Check your account balance for details.") => InsufficientFunds,
            Symbol("Ensure this value has at least") => InvalidAddress,
            Symbol("Ensure that there are no more than") => InvalidOrder
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => true
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 30,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    )
))

end
"""
retrieves data on all markets for bitstamp
see: https://www.bitstamp.net/api/#tag/Market-info/operation/GetTradingPairsInfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bitstamp; params=Dict())
    response = Base.fetch(self.fetchMarketsFromCache(params = params));
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        market = get(response, i + 1, nothing);
        (baseId, quoteId) = (safeString(market, "base_currency"), safeString(market, "counter_currency"));
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settleId = nothing;
        marketTypeRaw = safeString(market, "market_type");
        symbol = string(base, "/", quote_var);
        type_var = nothing;
        subType = nothing;
        if functions.ccxtruthy(marketTypeRaw == "SPOT")
            type_var = "spot";
        elseif functions.ccxtruthy(marketTypeRaw == "PERPETUAL")
            type_var = "swap";
            settleId = quoteId;
            symbol = string(base, "/", quote_var, ":", settleId);
            payoffType = safeString(market, "payoff_type");
            if functions.ccxtruthy(payoffType == "Linear")
                subType = "linear";
            elseif functions.ccxtruthy(payoffType == "Inverse")
                subType = "inverse";
            end
        end
        isSpot = (type_var == "spot");
        settle = functions.ccxtruthy(settleId) ? self.safeCurrencyCode(settleId) : nothing;
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => safeString(market, "market_symbol"),
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("subType") => subType,
    Symbol("spot") => isSpot,
    Symbol("margin") => false,
    Symbol("future") => false,
    Symbol("swap") => !functions.ccxtruthy(isSpot),
    Symbol("option") => false,
    Symbol("active") => (safeString(market, "trading") == "Enabled"),
    Symbol("contract") => !functions.ccxtruthy(isSpot),
    Symbol("linear") => functions.ccxtruthy(isSpot) ? nothing : true,
    Symbol("inverse") => functions.ccxtruthy(isSpot) ? nothing : false,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "base_decimals"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "counter_decimals")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minimum_order_amount"),
            Symbol("max") => self.safeNumber(market, "maximum_order_amount")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minimum_order_value"),
            Symbol("max") => self.safeNumber(market, "maximum_order_value")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function constructCurrencyObject(self::Bitstamp, id, code, name, precision, minCost, originalPayload)
    currencyType = "crypto";
    description = self.describe();
    if functions.ccxtruthy(self.isFiat(code))
        currencyType = "fiat";
    end
    tickSize = self.parseNumber(self.parsePrecision(precision = numberToString(precision)));
    return Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("info") => originalPayload,
    Symbol("type") => currencyType,
    Symbol("name") => name,
    Symbol("active") => true,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => self.safeNumber(get(get(get(description, Symbol("fees"), nothing), Symbol("funding"), nothing), Symbol("withdraw"), nothing), code),
    Symbol("precision") => tickSize,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => tickSize,
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => tickSize,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => minCost,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => Dict{Symbol, Any}()
)

end
function fetchMarketsFromCache(self::Bitstamp; params=Dict())
    options = safeValue(self.options, "fetchMarkets", Dict{Symbol, Any}());
    timestamp = safeInteger(options, "timestamp");
    expires = safeInteger(options, "expires", 1000);
    now = milliseconds();
    if functions.ccxtruthy(@functions.ccxt_or((timestamp == nothing), (functions.ccxt_gt((now - timestamp), expires))))
        response = Base.fetch(self.publicGetMarkets(params));
        self.options[Symbol("fetchMarkets")] = extend(options, Dict{Symbol, Any}(
    Symbol("response") => response,
    Symbol("timestamp") => now
));
    end
    return safeValue(get(self.options, Symbol("fetchMarkets"), nothing), "response")

end
"""
fetches all available currencies on an exchange
see: https://www.bitstamp.net/api/#tag/Market-info/operation/GetTradingPairsInfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bitstamp; params=Dict())
    response = Base.fetch(self.fetchMarketsFromCache(params = params));
    self.options[Symbol("_temp_currencies_result")] = Dict{Symbol, Any}();
    result = self.parseCurrencies(response);
    finalResult = deepExtend(result, get(self.options, Symbol("_temp_currencies_result"), nothing));
    delete!(self.options, :_temp_currencies_result);
    return finalResult

end
function parseCurrency(self::Bitstamp, rawCurrency)
    market = rawCurrency;
    existing = self.safeDict(self.options, "_temp_currencies_result", defaultValue = Dict{Symbol, Any}());
    (baseId, quoteId) = (safeString(market, "base_currency"), safeString(market, "counter_currency"));
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    description = safeString(market, "description");
    if functions.ccxtruthy(description == nothing)
        throw(ExchangeError(string(self.id, " parseCurrency() missing description")));
    end
    (baseDescription, quoteDescription) = split(description, " / ");
    minimumOrder = safeString(market, "minimum_order_value");
    if functions.ccxtruthy(minimumOrder == nothing)
        throw(ExchangeError(string(self.id, " parseCurrency() missing minimumOrder")));
    end
    parts = split(minimumOrder, " ");
    cost = get(parts, 1, nothing);
    if functions.ccxtruthy(@functions.ccxt_or((base == nothing), !functions.ccxtruthy((ccxt_in(base, existing)))))
        baseDecimals = safeInteger(market, "base_decimals");
        if functions.ccxtruthy(base != nothing)
            self.options[Symbol("_temp_currencies_result")][Symbol(base)] = self.constructCurrencyObject(baseId, base, baseDescription, baseDecimals, nothing, market);
        end
    end
    if functions.ccxtruthy(@functions.ccxt_or((quote_var == nothing), !functions.ccxtruthy((ccxt_in(quote_var, existing)))))
        counterDecimals = safeInteger(market, "counter_decimals");
        if functions.ccxtruthy(quote_var != nothing)
            self.options[Symbol("_temp_currencies_result")][Symbol(quote_var)] = self.constructCurrencyObject(quoteId, quote_var, quoteDescription, counterDecimals, self.parseNumber(cost), market);
        end
    end
    return safeValue(get(self.options, Symbol("_temp_currencies_result"), nothing), quote_var)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.bitstamp.net/api/#tag/Order-book/operation/GetOrderBook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bitstamp, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetOrderBookPair(extend(request, params)));
    microtimestamp = safeInteger(response, "microtimestamp");
    if functions.ccxtruthy(microtimestamp == nothing)
        throw(ExchangeError(string(self.id, " fetchOrderBook() missing microtimestamp")));
    end
    timestamp = self.parseToInt(microtimestamp / 1000);
    orderbook = self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp = timestamp);
    orderbook[Symbol("nonce")] = microtimestamp;
    return orderbook

end
function parseTicker(self::Bitstamp, ticker; market=nothing)
    marketId = safeString(ticker, "pair");
    symbol = self.safeSymbol(marketId, market = market);
    timestamp = safeTimestamp(ticker, "timestamp");
    vwap = safeString(ticker, "vwap");
    baseVolume = safeString(ticker, "volume");
    quoteVolume = stringMul(baseVolume, vwap);
    last_var = safeString(ticker, "last");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeString(ticker, "bid"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "ask"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => vwap,
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.bitstamp.net/api/#tag/Tickers/operation/GetMarketTicker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bitstamp, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing)
    );
    ticker = Base.fetch(self.publicGetTickerPair(extend(request, params)));
    return self.parseTicker(ticker, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.bitstamp.net/api/#tag/Tickers/operation/GetCurrencyPairTickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Bitstamp; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetTicker(params));
    return self.parseTickers(response, symbols = symbols)

end
function getCurrencyIdFromTransaction(self::Bitstamp, transaction)
    currencyId = safeStringLower(transaction, "currency");
    if functions.ccxtruthy(currencyId != nothing)
            return currencyId
    end
    transaction = omit(transaction, ["fee", "price", "datetime", "type", "status", "id"]);
    ids = objectKeys(transaction);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = get(ids, i + 1, nothing);
        if functions.ccxtruthy(findfirst("_", id) === nothing)
            value = safeInteger(transaction, id);
            if functions.ccxtruthy(@functions.ccxt_and((value != nothing), (value != 0)))
                    return id
            end
        end
        i += 1
    end
    return nothing

end
function getMarketFromTrade(self::Bitstamp, trade)
    trade = omit(trade, ["fee", "price", "datetime", "tid", "type", "order_id", "side"]);
    currencyIds = objectKeys(trade);
    numCurrencyIds = length(currencyIds);
    if functions.ccxtruthy(functions.ccxt_gt(numCurrencyIds, 2))
        throw(ExchangeError(string(self.id, " getMarketFromTrade() too many keys: ", json(currencyIds), " in the trade: ", json(trade))));
    end
    if functions.ccxtruthy(numCurrencyIds == 2)
        marketId = string(get(currencyIds, 1, nothing), get(currencyIds, 2, nothing));
        if functions.ccxtruthy(@functions.ccxt_and((self.markets_by_id != nothing), (ccxt_in(marketId, self.markets_by_id))))
                return self.safeMarket(marketId = marketId)
        end
        marketId = string(get(currencyIds, 2, nothing), get(currencyIds, 1, nothing));
        if functions.ccxtruthy(@functions.ccxt_and((self.markets_by_id != nothing), (ccxt_in(marketId, self.markets_by_id))))
                return self.safeMarket(marketId = marketId)
        end
    end
    return nothing

end
function parseTrade(self::Bitstamp, trade; market=nothing)
    id = safeString2(trade, "id", "tid");
    symbol = nothing;
    side = nothing;
    priceString = safeString(trade, "price");
    amountString = safeString(trade, "amount");
    orderId = safeString(trade, "order_id");
    type_var = nothing;
    costString = safeString(trade, "cost");
    rawMarketId = nothing;
    if functions.ccxtruthy(market == nothing)
        keys_var = objectKeys(trade);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            currentKey = get(keys_var, i + 1, nothing);
            if functions.ccxtruthy(@functions.ccxt_and(currentKey != "order_id", findfirst("_", currentKey) !== nothing))
                rawMarketId = currentKey;
                market = self.safeMarket(marketId = rawMarketId, market = market, delimiter = "_");
            end
            i += 1
        end

    end
    if functions.ccxtruthy(market == nothing)
        market = self.getMarketFromTrade(trade);
    end
    feeCostString = safeString(trade, "fee");
    feeCurrency = safeString(market, "quote");
    priceId = functions.ccxtruthy((rawMarketId != nothing)) ? rawMarketId : safeString(market, "id");
    priceString = safeString(trade, priceId, priceString);
    amountString = safeString(trade, safeString(market, "baseId"), amountString);
    costString = safeString(trade, safeString(market, "quoteId"), costString);
    baseIdLower = safeStringLower(market, "baseId");
    quoteIdLower = safeStringLower(market, "quoteId");
    dashedIdLower = string(baseIdLower, "_", quoteIdLower);
    if functions.ccxtruthy(priceString == nothing)
        priceString = safeString(trade, dashedIdLower);
    end
    if functions.ccxtruthy(amountString == nothing)
        amountString = safeString(trade, baseIdLower);
    end
    if functions.ccxtruthy(costString == nothing)
        costString = safeString(trade, quoteIdLower);
    end
    symbol = safeString(market, "symbol");
    datetimeString = safeString2(trade, "date", "datetime");
    timestamp = nothing;
    if functions.ccxtruthy(datetimeString != nothing)
        if functions.ccxtruthy(findfirst(" ", datetimeString) !== nothing)
            timestamp = self.parse8601(datetimeString);
        else
            timestamp = ccxt_parseInt(datetimeString);
            timestamp = timestamp * 1000;
        end
    end
    if functions.ccxtruthy(ccxt_in("id", trade))
        if functions.ccxtruthy(amountString != nothing)
            isAmountNeg = stringLt(amountString, "0");
            if functions.ccxtruthy(isAmountNeg)
                side = "sell";
                amountString = stringNeg(amountString);
            else
                side = "buy";
            end
        end
    else
        side = safeString(trade, "type");
        if functions.ccxtruthy(side == "1")
            side = "sell";
        elseif functions.ccxtruthy(side == "0")
            side = "buy";
        else
            side = nothing;
        end
    end
    if functions.ccxtruthy(costString != nothing)
        costString = stringAbs(costString);
    end
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrency
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => orderId,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => nothing,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://www.bitstamp.net/api/#tag/Transactions-public/operation/GetTransactions

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bitstamp, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("time") => "hour"
    );
    response = Base.fetch(self.publicGetTransactionsPair(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
function parseOHLCV(self::Bitstamp, ohlcv; market=nothing)
    return [safeTimestamp(ohlcv, "timestamp"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.bitstamp.net/api/#tag/Market-info/operation/GetOHLCData

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bitstamp, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("step") => safeString(self.timeframes, timeframe, timeframe)
    );
    duration = self.parseTimeframe(timeframe);
    if functions.ccxtruthy(limit == nothing)
        if functions.ccxtruthy(since == nothing)
            request[Symbol("limit")] = 1000;
        else
            limit = 1000;
            start = self.parseToInt(since / 1000);
            request[Symbol("start")] = start;
            request[Symbol("end")] = self.sum(start, duration * (limit - 1));
            request[Symbol("limit")] = limit;
        end
    else
        if functions.ccxtruthy(since != nothing)
            start = self.parseToInt(since / 1000);
            request[Symbol("start")] = start;
            request[Symbol("end")] = self.sum(start, duration * (limit - 1));
        end
        request[Symbol("limit")] = min(limit, 1000);
    end
    response = Base.fetch(self.publicGetOhlcPair(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    ohlc = self.safeList(data, "ohlc", defaultValue = []);
    return self.parseOHLCVs(ohlc, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseBalance(self::Bitstamp, response)
    finalResponse = response;
    result = Dict{Symbol, Any}(
        Symbol("info") => finalResponse,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    if functions.ccxtruthy(response == nothing)
        response = [];
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        currencyBalance = get(response, i + 1, nothing);
        currencyId = safeString(currencyBalance, "currency");
        currencyCode = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(currencyBalance, "available");
        account[Symbol("used")] = safeString(currencyBalance, "reserved");
        account[Symbol("total")] = safeString(currencyBalance, "total");
        if functions.ccxtruthy(currencyCode != nothing)
            result[Symbol(currencyCode)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.bitstamp.net/api/#tag/Account-balances/operation/GetAccountBalances

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bitstamp; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostAccountBalances(params));
    return self.parseBalance(response)

end
"""
fetch the trading fees for a market
see: https://www.bitstamp.net/api/#tag/Fees/operation/GetTradingFeesForCurrency

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Bitstamp, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market_symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostFeesTrading(extend(request, params)));
    tradingFeesByMarketId = indexBy(response, "currency_pair");
    tradingFee = self.safeDict(tradingFeesByMarketId, get(market, Symbol("id"), nothing));
    if functions.ccxtruthy(tradingFee == nothing)
        tradingFee = Dict{Symbol, Any}();
    end
    return self.parseTradingFee(tradingFee, market = market)

end
function parseTradingFee(self::Bitstamp, fee; market=nothing)
    marketId = safeString(fee, "market");
    fees = self.safeDict(fee, "fees", defaultValue = Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("maker") => self.safeNumber(fees, "maker"),
    Symbol("taker") => self.safeNumber(fees, "taker"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function parseTradingFees(self::Bitstamp, fees)
    result = Dict{Symbol, Any}(
        Symbol("info") => fees
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fees)))
        fee = self.parseTradingFee(get(fees, i + 1, nothing));
        symbol = get(fee, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = fee;
        end
        i += 1
    end
    return result

end
"""
fetch the trading fees for multiple markets
see: https://www.bitstamp.net/api/#tag/Fees/operation/GetAllTradingFees

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Bitstamp; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostFeesTrading(params));
    return self.parseTradingFees(response)

end
"""
please use fetchDepositWithdrawFees instead
see: https://www.bitstamp.net/api/#tag/Fees

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTransactionFees(self::Bitstamp; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostFeesWithdrawal(params));
    return self.parseTransactionFees(response)

end
function parseTransactionFees(self::Bitstamp, response; codes=nothing)
    result = Dict{Symbol, Any}();
    currencies = indexBy(response, "currency");
    ids = objectKeys(currencies);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        id = get(ids, i + 1, nothing);
        fees = safeValue(response, i, Dict{Symbol, Any}());
        code = self.safeCurrencyCode(id);
        if functions.ccxtruthy(@functions.ccxt_and((codes != nothing), !functions.ccxtruthy(inArray(code, codes))))
            i += 1; continue
        end
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = Dict{Symbol, Any}(
                Symbol("withdraw_fee") => self.safeNumber(fees, "fee"),
                Symbol("deposit") => Dict{Symbol, Any}(),
                Symbol("info") => self.safeDict(currencies, id)
            );
        end
        i += 1
    end
    return result

end
"""
fetch deposit and withdraw fees
see: https://www.bitstamp.net/api/#tag/Fees/operation/GetAllWithdrawalFees

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Bitstamp; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privatePostFeesWithdrawal(params));
    responseByCurrencyId = groupBy(response, "currency");
    return self.parseDepositWithdrawFees(responseByCurrencyId, codes = codes)

end
function parseDepositWithdrawFee(self::Bitstamp, fee; currency=nothing)
    result = self.depositWithdrawFee(fee);
    code = safeString(currency, "code");
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(fee)))
        networkEntry = get(fee, j + 1, nothing);
        networkId = safeString(networkEntry, "network");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        withdrawFee = self.safeNumber(networkEntry, "fee");
        result[Symbol("withdraw")] = Dict{Symbol, Any}(
            Symbol("fee") => withdrawFee,
            Symbol("percentage") => nothing
        );
        if functions.ccxtruthy(networkCode != nothing)
            result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("fee") => withdrawFee,
                    Symbol("percentage") => nothing
                ),
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("fee") => nothing,
                    Symbol("percentage") => nothing
                )
            );
        end
        j += 1
    end
    return result

end
"""
create a trade order
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenInstantBuyOrder
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenMarketBuyOrder
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenLimitBuyOrder
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenInstantSellOrder
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenMarketSellOrder
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenLimitSellOrder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Bitstamp, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("pair") => get(market, Symbol("id"), nothing),
        Symbol("amount") => self.amountToPrecision(symbol, amount)
    );
    clientOrderId = safeString2(params, "client_order_id", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_order_id")] = clientOrderId;
        params = omit(params, ["clientOrderId"]);
    end
    response = nothing;
    capitalizedSide = capitalize(side);
    if functions.ccxtruthy(type_var == "market")
        if functions.ccxtruthy(capitalizedSide == "Buy")
            response = Base.fetch(self.privatePostBuyMarketPair(extend(request, params)));
        else
            response = Base.fetch(self.privatePostSellMarketPair(extend(request, params)));
        end
    elseif functions.ccxtruthy(type_var == "instant")
        if functions.ccxtruthy(capitalizedSide == "Buy")
            response = Base.fetch(self.privatePostBuyInstantPair(extend(request, params)));
        else
            response = Base.fetch(self.privatePostSellInstantPair(extend(request, params)));
        end
    else
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        if functions.ccxtruthy(capitalizedSide == "Buy")
            response = Base.fetch(self.privatePostBuyPair(extend(request, params)));
        else
            response = Base.fetch(self.privatePostSellPair(extend(request, params)));
        end
    end
    orderResponse = functions.ccxtruthy((response == nothing)) ? Dict{Symbol, Any}() : response;
    order = self.parseOrder(orderResponse, market = market);
    order[Symbol("type")] = type_var;
    return order

end
"""
edit a trade order
see: https://www.bitstamp.net/api/#tag/Orders/operation/ReplaceOrder

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market to create an order in
- `type`::string, optional: 'market', 'limit' or 'stop_limit'
- `side`::string, optional: 'buy' or 'sell'
- `amount`::float, optional: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price for the order, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::string, optional: the price to trigger a stop order
- `params.timeInForce`::string, optional: for crypto trading either 'gtc' or 'ioc' can be used
- `params.clientOrderId`::string, optional: a unique identifier for the order, automatically generated if not sent

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Bitstamp, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("amount") => self.amountToPrecision(symbol, amount),
        Symbol("price") => self.priceToPrecision(symbol, price)
    );
    clientOrderId = safeString2(params, "client_order_id", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_order_id")] = clientOrderId;
        params = omit(params, ["clientOrderId"]);
    else
        request[Symbol("id")] = id;
    end
    response = Base.fetch(self.privatePostReplaceOrder(extend(request, params)));
    order = self.parseOrder(response, market = market);
    order[Symbol("type")] = type_var;
    return order

end
"""
cancels an open order
see: https://www.bitstamp.net/api/#tag/Orders/operation/CancelOrder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bitstamp, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("id") => id
    );
    response = Base.fetch(self.privatePostCancelOrder(extend(request, params)));
    return self.parseOrder(response)

end
"""
cancel all open orders
see: https://www.bitstamp.net/api/#tag/Orders/operation/CancelAllOrders
see: https://www.bitstamp.net/api/#tag/Orders/operation/CancelOrdersForMarket

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Bitstamp; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privatePostCancelAllOrdersPair(extend(request, params)));
    else
        response = Base.fetch(self.privatePostCancelAllOrders(extend(request, params)));
    end
    canceled = self.safeList(response, "canceled");
    return self.parseOrders(canceled)

end
function parseOrderStatus(self::Bitstamp, status)
    statuses = Dict{Symbol, Any}(
        Symbol("In Queue") => "open",
        Symbol("Open") => "open",
        Symbol("Finished") => "closed",
        Symbol("Canceled") => "canceled",
        Symbol("Cancel pending") => "canceling"
    );
    return safeString(statuses, status, status)

end
function fetchOrderStatus(self::Bitstamp, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderId = safeValue2(params, "client_order_id", "clientOrderId");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_order_id")] = clientOrderId;
        params = omit(params, ["client_order_id", "clientOrderId"]);
    else
        request[Symbol("id")] = id;
    end
    response = Base.fetch(self.privatePostOrderStatus(extend(request, params)));
    return self.parseOrderStatus(safeString(response, "status"))

end
"""
fetches information on an order made by the user
see: https://www.bitstamp.net/api/#tag/Orders/operation/GetOrderStatus

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bitstamp, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    clientOrderId = safeValue2(params, "client_order_id", "clientOrderId");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_order_id")] = clientOrderId;
        params = omit(params, ["client_order_id", "clientOrderId"]);
    else
        request[Symbol("id")] = id;
    end
    response = Base.fetch(self.privatePostOrderStatus(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
fetch all trades made by the user
see: https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactions
see: https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactionsForMarket

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bitstamp; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    method = "privatePostUserTransactions";
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
        method += "Pair";
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    result = filterBy(response, "type", "2");
    return self.parseTrades(result, market = market, since = since, limit = limit)

end
"""
fetches historical funding rate prices
see: https://www.bitstamp.net/api/#tag/Market-info/operation/GetFundingRateHistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Bitstamp; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, timeframe = "8h", params = params))
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("pair")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("since_timestamp")] = round(since / 1000);
    end
    (request, params) = self.handleUntilOption("until_timestamp", request, params, multiplier = 0.001);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetFundingRateHistoryPair(extend(request, params)));
    values_var = safeValue(response, "funding_rate_history", []);
    return self.parseFundingRateHistories(values_var, market = market, since = since, limit = limit)

end
function parseFundingRateHistory(self::Bitstamp, contract; market=nothing)
    timestamp = safeIntegerProduct(contract, "timestamp", 0.001);
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "funding_rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
fetch history of deposits and withdrawals
see: https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactions

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDepositsWithdrawals(self::Bitstamp; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privatePostUserTransactions(extend(request, params)));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    transactions = self.filterByArray(response, "type", values = ["0", "1"], indexed = false);
    return self.parseTransactions(transactions, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://www.bitstamp.net/api/#tag/Withdrawals/operation/GetWithdrawalRequests

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Bitstamp; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("timedelta")] = milliseconds() - since;
    else
        request[Symbol("timedelta")] = 50000000;
    end
    response = Base.fetch(self.privatePostWithdrawalRequests(extend(request, params)));
    return self.parseTransactions(response, currency = nothing, since = since, limit = limit)

end
function parseTransaction(self::Bitstamp, transaction; currency=nothing)
    timestamp = self.parse8601(safeString(transaction, "datetime"));
    currencyId = self.getCurrencyIdFromTransaction(transaction);
    code = self.safeCurrencyCode(currencyId, currency = currency);
    feeCost = safeString(transaction, "fee");
    feeCurrency = nothing;
    amount = nothing;
    if functions.ccxtruthy(ccxt_in("amount", transaction))
        amount = safeString(transaction, "amount");
    elseif functions.ccxtruthy(currency != nothing)
        amount = safeString(transaction, get(currency, Symbol("id"), nothing), amount);
        feeCurrency = get(currency, Symbol("code"), nothing);
    else
        if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (currencyId != nothing)))
            amount = safeString(transaction, currencyId, amount);
            feeCurrency = code;
        end

    end
    if functions.ccxtruthy(amount != nothing)
        amount = stringAbs(amount);
    end
    status = "ok";
    if functions.ccxtruthy(ccxt_in("status", transaction))
        status = self.parseTransactionStatus(safeString(transaction, "status"));
    end
    type_var = nothing;
    if functions.ccxtruthy(ccxt_in("type", transaction))
        rawType = safeString(transaction, "type");
        if functions.ccxtruthy(rawType == "0")
            type_var = "deposit";
        elseif functions.ccxtruthy(rawType == "1")
            type_var = "withdrawal";
        end
    else
        type_var = "withdrawal";
    end
    tag = nothing;
    address = safeString(transaction, "address");
    if functions.ccxtruthy(address != nothing)
        addressParts = split(address, "?dt=");
        numParts = length(addressParts);
        if functions.ccxtruthy(functions.ccxt_gt(numParts, 1))
            address = get(addressParts, 1, nothing);
            tag = get(addressParts, 2, nothing);
        end
    end
    fee = Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing,
        Symbol("rate") => nothing
    );
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => feeCurrency,
            Symbol("cost") => feeCost,
            Symbol("rate") => nothing
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(transaction, "transaction_id"),
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("status") => status,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => address,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => address,
    Symbol("tag") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => tag,
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee
)

end
function parseTransactionStatus(self::Bitstamp, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "pending",
        Symbol("1") => "pending",
        Symbol("2") => "ok",
        Symbol("3") => "canceled",
        Symbol("4") => "failed"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Bitstamp, order; market=nothing)
    id = safeString(order, "id");
    clientOrderId = safeString(order, "client_order_id");
    side = safeString(order, "type");
    if functions.ccxtruthy(side != nothing)
        side = functions.ccxtruthy((side == "1")) ? "sell" : "buy";
    end
    timestamp = self.parse8601(safeString(order, "datetime"));
    marketId = safeStringLower(order, "currency_pair");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "/");
    status = self.parseOrderStatus(safeString(order, "status"));
    amount = safeString(order, "amount");
    transactions = safeValue(order, "transactions", []);
    price = safeString(order, "price");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => status,
    Symbol("symbol") => symbol,
    Symbol("type") => nothing,
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => nothing,
    Symbol("cost") => nothing,
    Symbol("amount") => amount,
    Symbol("filled") => nothing,
    Symbol("remaining") => nothing,
    Symbol("trades") => transactions,
    Symbol("fee") => nothing,
    Symbol("info") => order,
    Symbol("average") => nothing
), market = market)

end
function parseLedgerEntryType(self::Bitstamp, type_var)
    types = Dict{Symbol, Any}(
        Symbol("0") => "transaction",
        Symbol("1") => "transaction",
        Symbol("2") => "trade",
        Symbol("14") => "transfer"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Bitstamp, item; currency=nothing)
    type_var = self.parseLedgerEntryType(safeString(item, "type"));
    if functions.ccxtruthy(type_var == "trade")
        parsedTrade = self.parseTrade(item);
        market = nothing;
        keys_var = objectKeys(item);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            if functions.ccxtruthy(findfirst("_", get(keys_var, i + 1, nothing)) !== nothing)
                marketId = replace(get(keys_var, i + 1, nothing), "_" => "");
                market = self.safeMarket(marketId = marketId, market = market);
            end
            i += 1
        end

        if functions.ccxtruthy(market == nothing)
            market = self.getMarketFromTrade(item);
        end
        direction = functions.ccxtruthy((get(parsedTrade, Symbol("side"), nothing) == "buy")) ? "in" : "out";
            return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => get(parsedTrade, Symbol("id"), nothing),
    Symbol("timestamp") => get(parsedTrade, Symbol("timestamp"), nothing),
    Symbol("datetime") => get(parsedTrade, Symbol("datetime"), nothing),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceId") => get(parsedTrade, Symbol("order"), nothing),
    Symbol("referenceAccount") => nothing,
    Symbol("type") => type_var,
    Symbol("currency") => safeString(market, "base"),
    Symbol("amount") => get(parsedTrade, Symbol("amount"), nothing),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => "ok",
    Symbol("fee") => get(parsedTrade, Symbol("fee"), nothing)
), currency = currency)
    else
        parsedTransaction = self.parseTransaction(item, currency = currency);
        direction = nothing;
        if functions.ccxtruthy(ccxt_in("amount", item))
            amount = safeString(item, "amount");
            direction = functions.ccxtruthy(stringGt(amount, "0")) ? "in" : "out";
        elseif functions.ccxtruthy(@functions.ccxt_and((ccxt_in("currency", parsedTransaction)), get(parsedTransaction, Symbol("currency"), nothing) != nothing))
            currencyCode = safeString(parsedTransaction, "currency");
            currency = self.currency(currencyCode);
            amount = safeString(item, get(currency, Symbol("id"), nothing));
            direction = functions.ccxtruthy(stringGt(amount, "0")) ? "in" : "out";
        end
        return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => get(parsedTransaction, Symbol("id"), nothing),
    Symbol("timestamp") => get(parsedTransaction, Symbol("timestamp"), nothing),
    Symbol("datetime") => get(parsedTransaction, Symbol("datetime"), nothing),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceId") => get(parsedTransaction, Symbol("txid"), nothing),
    Symbol("referenceAccount") => nothing,
    Symbol("type") => type_var,
    Symbol("currency") => get(parsedTransaction, Symbol("currency"), nothing),
    Symbol("amount") => get(parsedTransaction, Symbol("amount"), nothing),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => get(parsedTransaction, Symbol("status"), nothing),
    Symbol("fee") => get(parsedTransaction, Symbol("fee"), nothing)
), currency = currency)
    end

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactions

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Bitstamp; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privatePostUserTransactions(extend(request, params)));
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    return self.parseLedger(response, currency = currency, since = since, limit = limit)

end
"""
fetch the current funding rate
see: https://www.bitstamp.net/api/#tag/Market-info/operation/GetFundingRate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Bitstamp, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market_symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetFundingRateMarketSymbol(extend(request, params)));
    return self.parseFundingRate(response, market = market)

end
function parseFundingRate(self::Bitstamp, fundingRate; market=nothing)
    currentTime = safeIntegerProduct(fundingRate, "timestamp", 1000);
    nextFundingRateTimestamp = safeIntegerProduct(fundingRate, "next_funding_time", 1000);
    marketId = safeString(fundingRate, "market");
    return Dict{Symbol, Any}(
    Symbol("info") => fundingRate,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => currentTime,
    Symbol("datetime") => self.iso8601(currentTime),
    Symbol("previousFundingRate") => nothing,
    Symbol("nextFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(fundingRate, "funding_rate"),
    Symbol("fundingTimestamp") => nextFundingRateTimestamp,
    Symbol("fundingDatetime") => self.iso8601(nextFundingRateTimestamp),
    Symbol("interval") => nothing
)

end
"""
fetch all unfilled currently open orders
see: https://www.bitstamp.net/api/#tag/Orders/operation/GetAllOpenOrders
see: https://www.bitstamp.net/api/#tag/Orders/operation/GetOpenOrdersForMarket

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bitstamp; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    market = nothing;
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = Base.fetch(self.privatePostOpenOrdersAll(params));
    return self.parseOrders(response, market = market, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("status") => "open",
    Symbol("type") => "limit"
))

end
function getCurrencyName(self::Bitstamp, code)
    return lowercase(code)

end
function isFiat(self::Bitstamp, code)
    return @functions.ccxt_or(@functions.ccxt_or(code == "USD", code == "EUR"), code == "GBP")

end
"""
fetch the deposit address for a currency associated with this account
see: https://www.bitstamp.net/api/#tag/Deposits/operation/GetCryptoDepositAddress

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Bitstamp, code; params=Dict())
    if functions.ccxtruthy(self.isFiat(code))
        throw(NotSupported(string(self.id, " fiat fetchDepositAddress() for ", code, " is not supported!")));
    end
    name = self.getCurrencyName(code);
    method = string("privatePost", capitalize(name), "Address");
    response = Base.fetch(getproperty(self, Symbol(method))(params));
    address = safeString(response, "address");
    tag = safeString2(response, "memo_id", "destination_tag");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
make a withdrawal
see: https://www.bitstamp.net/api/#tag/Withdrawals/operation/RequestFiatWithdrawal
see: https://www.bitstamp.net/api/#tag/Withdrawals/operation/RequestCryptoWithdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Bitstamp, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address = address);
    request = Dict{Symbol, Any}(
        Symbol("amount") => amount
    );
    currency = nothing;
    method = nothing;
    if functions.ccxtruthy(!functions.ccxtruthy(self.isFiat(code)))
        name = self.getCurrencyName(code);
        method = string("privatePost", capitalize(name), "Withdrawal");
        if functions.ccxtruthy(code == "XRP")
            if functions.ccxtruthy(tag != nothing)
                request[Symbol("destination_tag")] = tag;
            end
        elseif functions.ccxtruthy(@functions.ccxt_or(code == "XLM", code == "HBAR"))
            if functions.ccxtruthy(tag != nothing)
                request[Symbol("memo_id")] = tag;
            end
        end
        request[Symbol("address")] = address;
    else
        method = "privatePostWithdrawalOpen";
        currency = self.currency(code);
        request[Symbol("iban")] = address;
        request[Symbol("account_currency")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(getproperty(self, Symbol(method))(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
"""
transfer currency internally between wallets on the same account
see: https://www.bitstamp.net/api/#tag/Sub-account/operation/TransferFromMainToSub
see: https://www.bitstamp.net/api/#tag/Sub-account/operation/TransferFromSubToMain

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Bitstamp, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("amount") => self.parseToNumeric(self.currencyToPrecision(code, amount)),
        Symbol("currency") => uppercase(get(currency, Symbol("id"), nothing))
    );
    response = nothing;
    if functions.ccxtruthy(fromAccount == "main")
        request[Symbol("subAccount")] = toAccount;
        response = Base.fetch(self.privatePostTransferFromMain(extend(request, params)));
    elseif functions.ccxtruthy(toAccount == "main")
        request[Symbol("subAccount")] = fromAccount;
        response = Base.fetch(self.privatePostTransferToMain(extend(request, params)));
    else
        throw(BadRequest(string(self.id, " Ccxt.transfer() only supports from or to main")));
    end
    transfer = self.parseTransfer(response, currency = currency);
    transfer[Symbol("amount")] = amount;
    transfer[Symbol("fromAccount")] = fromAccount;
    transfer[Symbol("toAccount")] = toAccount;
    return transfer

end
function parseTransfer(self::Bitstamp, transfer; currency=nothing)
    status = safeString(transfer, "status");
    if functions.ccxtruthy(currency == nothing)
        throw(ExchangeError(string(self.id, " parseTransfer() could not resolve currency")));
    end
    result = Dict{Symbol, Any}(
        Symbol("info") => transfer,
        Symbol("id") => nothing,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing,
        Symbol("currency") => get(currency, Symbol("code"), nothing),
        Symbol("amount") => nothing,
        Symbol("fromAccount") => nothing,
        Symbol("toAccount") => nothing,
        Symbol("status") => self.parseTransferStatus(status)
    );
    return result

end
function parseTransferStatus(self::Bitstamp, status)
    statuses = Dict{Symbol, Any}(
        Symbol("ok") => "ok",
        Symbol("error") => "failed"
    );
    return safeString(statuses, status, status)

end
function nonce(self::Bitstamp, )
    return milliseconds()

end
function sign(self::Bitstamp, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/");
    url += string(self.version, "/");
    url += self.implodeParams(path, params);
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        self.checkRequiredCredentials();
        xAuth = string("BITSTAMP ", self.apiKey);
        xAuthNonce = uuid();
        xAuthTimestamp = string(milliseconds());
        xAuthVersion = "v2";
        contentType = "";
        headers = Dict{Symbol, Any}(
            Symbol("X-Auth") => xAuth,
            Symbol("X-Auth-Nonce") => xAuthNonce,
            Symbol("X-Auth-Timestamp") => xAuthTimestamp,
            Symbol("X-Auth-Version") => xAuthVersion
        );
        if functions.ccxtruthy(method == "POST")
            if functions.ccxtruthy(length(objectKeys(query)))
                body = self.urlencode(query);
                contentType = "application/x-www-form-urlencoded";
                headers[Symbol("Content-Type")] = contentType;
            else
                body = self.urlencode(Dict{Symbol, Any}(
    Symbol("foo") => "bar"
));
                contentType = "application/x-www-form-urlencoded";
                headers[Symbol("Content-Type")] = contentType;
            end
        end
        authBody = functions.ccxtruthy(body) ? body : "";
        auth = string(xAuth, method, replace(url, "https://" => ""), contentType, xAuthNonce, xAuthTimestamp, xAuthVersion, authBody);
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
        headers[Symbol("X-Auth-Signature")] = signature;
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bitstamp, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    status = safeString(response, "status");
    error = safeValue(response, "error");
    if functions.ccxtruthy(@functions.ccxt_or((status == "error"), (error != nothing)))
        errors = [];
        if functions.ccxtruthy(isa(error, AbstractString))
                        push!(errors, error);
        elseif functions.ccxtruthy(error != nothing)
            keys_var = objectKeys(error);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
                key = get(keys_var, i + 1, nothing);
                value = safeValue(error, key);
                if functions.ccxtruthy(functions.ccxt_isArray(value))
                    errors = arrayConcat(errors, value);
                else
                    push!(errors, value);
                end
                i += 1
            end
        end
        reasonInner = safeValue(response, "reason", Dict{Symbol, Any}());
        if functions.ccxtruthy(isa(reasonInner, AbstractString))
                        push!(errors, reasonInner);
        else
            all_var = safeValue(reasonInner, "__all__", []);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(all_var)))
                push!(errors, get(all_var, i + 1, nothing));
                i += 1
            end
        end
        code = safeString(response, "code");
        if functions.ccxtruthy(code == "API0005")
            throw(AuthenticationError(string(self.id, " invalid signature, use the uid for the main account if you have subaccounts")));
        end
        feedback = string(self.id, " ", body);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(errors)))
            value = get(errors, i + 1, nothing);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), value, feedback);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), value, feedback);
            i += 1
        end

        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitstamp, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetOhlcPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ohlc/{pair}/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetOrderBookPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "order_book/{pair}/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ticker/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickerHourPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ticker_hour/{pair}/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickerPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ticker/{pair}/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTransactionsPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "transactions/{pair}/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTradingPairsInfo(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "trading-pairs-info/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarkets(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "markets/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrencies(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "currencies/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetEurUsd(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "eur_usd/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTravelRuleVasps(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "travel_rule/vasps/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetFundingRateMarketSymbol(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "funding_rate/{market_symbol}/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetFundingRateHistoryPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "funding_rate_history/{pair}/"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTravelRuleContacts(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "travel_rule/contacts/"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContactsContactUuid(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "contacts/{contact_uuid}/"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetEarnSubscriptions(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "earn/subscriptions/"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetEarnTransactions(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "earn/transactions/"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeHistory(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "trade_history/"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeHistoryPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "trade_history/{pair}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountBalances(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "account_balances/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountBalancesCurrency(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "account_balances/{currency}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBalance(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "balance/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBalancePair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "balance/{pair}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBchWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "bch_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBchAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "bch_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserTransactions(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "user_transactions/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserTransactionsPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "user_transactions/{pair}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCryptoTransactions(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "crypto-transactions/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOpenOrder(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "open_order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOpenOrdersAll(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "open_orders/all/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOpenOrdersPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "open_orders/{pair}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostReplaceOrder(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "replace_order/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderStatus(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "order_status/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelOrder(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "cancel_order/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelAllOrders(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "cancel_all_orders/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCancelAllOrdersPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "cancel_all_orders/{pair}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBuyPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "buy/{pair}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBuyMarketPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "buy/market/{pair}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBuyInstantPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "buy/instant/{pair}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSellPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sell/{pair}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSellMarketPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sell/market/{pair}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSellInstantPair(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sell/instant/{pair}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTransferToMain(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "transfer-to-main/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTransferFromMain(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "transfer-from-main/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMyTradingPairs(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "my_trading_pairs/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFeesTrading(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "fees/trading/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFeesTradingMarketSymbol(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "fees/trading/{market_symbol}"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFeesWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "fees/withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFeesWithdrawalCurrency(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "fees/withdrawal/{currency}/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawalRequests(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "withdrawal-requests/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawalOpen(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "withdrawal/open/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawalStatus(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "withdrawal/status/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawalCancel(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "withdrawal/cancel/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLiquidationAddressNew(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "liquidation_address/new/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLiquidationAddressInfo(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "liquidation_address/info/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBtcUnconfirmed(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "btc_unconfirmed/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWebsocketsToken(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "websockets_token/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRevokeAllApiKeys(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "revoke_all_api_keys/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGetMaxOrderAmount(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "get_max_order_amount/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBtcWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "btc_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBtcAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "btc_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRippleWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ripple_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRippleAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ripple_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLtcWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ltc_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLtcAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ltc_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEthWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "eth_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEthAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "eth_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostXrpWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "xrp_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostXrpAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "xrp_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostXlmWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "xlm_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostXlmAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "xlm_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPaxWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "pax_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPaxAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "pax_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLinkWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "link_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLinkAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "link_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUsdcWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "usdc_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUsdcAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "usdc_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOmgWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "omg_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOmgAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "omg_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDaiWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "dai_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDaiAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "dai_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostKncWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "knc_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostKncAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "knc_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMkrWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "mkr_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMkrAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "mkr_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostZrxWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "zrx_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostZrxAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "zrx_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGusdWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "gusd_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGusdAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "gusd_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAaveWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "aave_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAaveAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "aave_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBatWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "bat_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBatAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "bat_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUmaWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "uma_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUmaAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "uma_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSnxWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "snx_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSnxAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "snx_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUniWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "uni_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUniAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "uni_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostYfiWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "yfi_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostYfiAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "yfi_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAudioWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "audio_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAudioAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "audio_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCrvWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "crv_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCrvAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "crv_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAlgoWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "algo_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAlgoAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "algo_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCompWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "comp_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCompAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "comp_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGrtWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "grt_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGrtAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "grt_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUsdtWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "usdt_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUsdtAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "usdt_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEurtWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "eurt_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEurtAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "eurt_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMaticWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "matic_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMaticAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "matic_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSushiWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sushi_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSushiAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sushi_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostChzWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "chz_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostChzAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "chz_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEnjWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "enj_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEnjAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "enj_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAlphaWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "alpha_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAlphaAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "alpha_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFttWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ftt_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFttAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ftt_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostStorjWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "storj_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostStorjAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "storj_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAxsWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "axs_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAxsAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "axs_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSandWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sand_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSandAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sand_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHbarWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "hbar_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHbarAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "hbar_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRgtWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "rgt_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRgtAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "rgt_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFetWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "fet_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFetAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "fet_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSklWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "skl_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSklAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "skl_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCelWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "cel_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCelAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "cel_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSxpWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sxp_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSxpAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sxp_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAdaWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ada_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAdaAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ada_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSlpWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "slp_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSlpAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "slp_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFtmWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ftm_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFtmAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ftm_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPerpWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "perp_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPerpAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "perp_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDydxWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "dydx_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDydxAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "dydx_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGalaWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "gala_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGalaAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "gala_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostShibWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "shib_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostShibAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "shib_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAmpWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "amp_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAmpAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "amp_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSgbWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sgb_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSgbAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sgb_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAvaxWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "avax_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAvaxAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "avax_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWbtcWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "wbtc_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWbtcAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "wbtc_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCtsiWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ctsi_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCtsiAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ctsi_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCvxWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "cvx_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCvxAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "cvx_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostImxWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "imx_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostImxAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "imx_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostNexoWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "nexo_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostNexoAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "nexo_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUstWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ust_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUstAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ust_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAntWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ant_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAntAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ant_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGodsWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "gods_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostGodsAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "gods_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRadWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "rad_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRadAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "rad_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBandWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "band_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBandAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "band_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostInjWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "inj_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostInjAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "inj_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRlyWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "rly_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRlyAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "rly_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRndrWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "rndr_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRndrAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "rndr_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostVegaWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "vega_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostVegaAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "vega_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePost1inchWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "1inch_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePost1inchAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "1inch_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEnsWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ens_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEnsAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ens_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostManaWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "mana_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostManaAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "mana_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLrcWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "lrc_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLrcAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "lrc_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApeWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ape_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApeAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ape_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMplWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "mpl_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMplAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "mpl_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEurocWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "euroc_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEurocAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "euroc_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSolWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sol_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSolAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sol_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDotWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "dot_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDotAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "dot_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostNearWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "near_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostNearAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "near_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDogeWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "doge_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDogeAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "doge_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFlrWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "flr_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFlrAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "flr_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDgldWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "dgld_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDgldAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "dgld_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLdoWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ldo_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLdoAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ldo_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTravelRuleContacts(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "travel_rule/contacts/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEarnSubscribe(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "earn/subscribe/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEarnSubscriptionsSetting(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "earn/subscriptions/setting/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEarnUnsubscribe(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "earn/unsubscribe"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWecanWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "wecan_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWecanAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "wecan_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTracWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "trac_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTracAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "trac_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEurcvWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "eurcv_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostEurcvAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "eurcv_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPyusdWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "pyusd_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPyusdAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "pyusd_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLmwrWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "lmwr_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLmwrAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "lmwr_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPepeWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "pepe_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPepeAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "pepe_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBlurWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "blur_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBlurAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "blur_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostVextWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "vext_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostVextAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "vext_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCsprWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "cspr_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostCsprAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "cspr_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostVchfWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "vchf_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostVchfAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "vchf_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostVeurWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "veur_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostVeurAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "veur_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTrufWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "truf_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTrufAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "truf_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWifWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "wif_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWifAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "wif_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSmtWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "smt_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSmtAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "smt_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSuiWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sui_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSuiAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "sui_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostJupWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "jup_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostJupAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "jup_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOndoWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ondo_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOndoAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "ondo_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBobaWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "boba_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBobaAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "boba_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPythWithdrawal(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "pyth_withdrawal/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPythAddress(self::Bitstamp, params=Dict(), context=Dict())
    return request(self, "pyth_address/"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bitstamp(; kwargs...)
    inst = Bitstamp(Exchange(), describe, fetchMarkets, constructCurrencyObject, fetchMarketsFromCache, fetchCurrencies, parseCurrency, fetchOrderBook, parseTicker, fetchTicker, fetchTickers, getCurrencyIdFromTransaction, getMarketFromTrade, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, parseBalance, fetchBalance, fetchTradingFee, parseTradingFee, parseTradingFees, fetchTradingFees, fetchTransactionFees, parseTransactionFees, fetchDepositWithdrawFees, parseDepositWithdrawFee, createOrder, editOrder, cancelOrder, cancelAllOrders, parseOrderStatus, fetchOrderStatus, fetchOrder, fetchMyTrades, fetchFundingRateHistory, parseFundingRateHistory, fetchDepositsWithdrawals, fetchWithdrawals, parseTransaction, parseTransactionStatus, parseOrder, parseLedgerEntryType, parseLedgerEntry, fetchLedger, fetchFundingRate, parseFundingRate, fetchOpenOrders, getCurrencyName, isFiat, fetchDepositAddress, withdraw, transfer, parseTransfer, parseTransferStatus, nonce, sign, handleErrors, publicGetOhlcPair, publicGetOrderBookPair, publicGetTicker, publicGetTickerHourPair, publicGetTickerPair, publicGetTransactionsPair, publicGetTradingPairsInfo, publicGetMarkets, publicGetCurrencies, publicGetEurUsd, publicGetTravelRuleVasps, publicGetFundingRateMarketSymbol, publicGetFundingRateHistoryPair, privateGetTravelRuleContacts, privateGetContactsContactUuid, privateGetEarnSubscriptions, privateGetEarnTransactions, privateGetTradeHistory, privateGetTradeHistoryPair, privatePostAccountBalances, privatePostAccountBalancesCurrency, privatePostBalance, privatePostBalancePair, privatePostBchWithdrawal, privatePostBchAddress, privatePostUserTransactions, privatePostUserTransactionsPair, privatePostCryptoTransactions, privatePostOpenOrder, privatePostOpenOrdersAll, privatePostOpenOrdersPair, privatePostReplaceOrder, privatePostOrderStatus, privatePostCancelOrder, privatePostCancelAllOrders, privatePostCancelAllOrdersPair, privatePostBuyPair, privatePostBuyMarketPair, privatePostBuyInstantPair, privatePostSellPair, privatePostSellMarketPair, privatePostSellInstantPair, privatePostTransferToMain, privatePostTransferFromMain, privatePostMyTradingPairs, privatePostFeesTrading, privatePostFeesTradingMarketSymbol, privatePostFeesWithdrawal, privatePostFeesWithdrawalCurrency, privatePostWithdrawalRequests, privatePostWithdrawalOpen, privatePostWithdrawalStatus, privatePostWithdrawalCancel, privatePostLiquidationAddressNew, privatePostLiquidationAddressInfo, privatePostBtcUnconfirmed, privatePostWebsocketsToken, privatePostRevokeAllApiKeys, privatePostGetMaxOrderAmount, privatePostBtcWithdrawal, privatePostBtcAddress, privatePostRippleWithdrawal, privatePostRippleAddress, privatePostLtcWithdrawal, privatePostLtcAddress, privatePostEthWithdrawal, privatePostEthAddress, privatePostXrpWithdrawal, privatePostXrpAddress, privatePostXlmWithdrawal, privatePostXlmAddress, privatePostPaxWithdrawal, privatePostPaxAddress, privatePostLinkWithdrawal, privatePostLinkAddress, privatePostUsdcWithdrawal, privatePostUsdcAddress, privatePostOmgWithdrawal, privatePostOmgAddress, privatePostDaiWithdrawal, privatePostDaiAddress, privatePostKncWithdrawal, privatePostKncAddress, privatePostMkrWithdrawal, privatePostMkrAddress, privatePostZrxWithdrawal, privatePostZrxAddress, privatePostGusdWithdrawal, privatePostGusdAddress, privatePostAaveWithdrawal, privatePostAaveAddress, privatePostBatWithdrawal, privatePostBatAddress, privatePostUmaWithdrawal, privatePostUmaAddress, privatePostSnxWithdrawal, privatePostSnxAddress, privatePostUniWithdrawal, privatePostUniAddress, privatePostYfiWithdrawal, privatePostYfiAddress, privatePostAudioWithdrawal, privatePostAudioAddress, privatePostCrvWithdrawal, privatePostCrvAddress, privatePostAlgoWithdrawal, privatePostAlgoAddress, privatePostCompWithdrawal, privatePostCompAddress, privatePostGrtWithdrawal, privatePostGrtAddress, privatePostUsdtWithdrawal, privatePostUsdtAddress, privatePostEurtWithdrawal, privatePostEurtAddress, privatePostMaticWithdrawal, privatePostMaticAddress, privatePostSushiWithdrawal, privatePostSushiAddress, privatePostChzWithdrawal, privatePostChzAddress, privatePostEnjWithdrawal, privatePostEnjAddress, privatePostAlphaWithdrawal, privatePostAlphaAddress, privatePostFttWithdrawal, privatePostFttAddress, privatePostStorjWithdrawal, privatePostStorjAddress, privatePostAxsWithdrawal, privatePostAxsAddress, privatePostSandWithdrawal, privatePostSandAddress, privatePostHbarWithdrawal, privatePostHbarAddress, privatePostRgtWithdrawal, privatePostRgtAddress, privatePostFetWithdrawal, privatePostFetAddress, privatePostSklWithdrawal, privatePostSklAddress, privatePostCelWithdrawal, privatePostCelAddress, privatePostSxpWithdrawal, privatePostSxpAddress, privatePostAdaWithdrawal, privatePostAdaAddress, privatePostSlpWithdrawal, privatePostSlpAddress, privatePostFtmWithdrawal, privatePostFtmAddress, privatePostPerpWithdrawal, privatePostPerpAddress, privatePostDydxWithdrawal, privatePostDydxAddress, privatePostGalaWithdrawal, privatePostGalaAddress, privatePostShibWithdrawal, privatePostShibAddress, privatePostAmpWithdrawal, privatePostAmpAddress, privatePostSgbWithdrawal, privatePostSgbAddress, privatePostAvaxWithdrawal, privatePostAvaxAddress, privatePostWbtcWithdrawal, privatePostWbtcAddress, privatePostCtsiWithdrawal, privatePostCtsiAddress, privatePostCvxWithdrawal, privatePostCvxAddress, privatePostImxWithdrawal, privatePostImxAddress, privatePostNexoWithdrawal, privatePostNexoAddress, privatePostUstWithdrawal, privatePostUstAddress, privatePostAntWithdrawal, privatePostAntAddress, privatePostGodsWithdrawal, privatePostGodsAddress, privatePostRadWithdrawal, privatePostRadAddress, privatePostBandWithdrawal, privatePostBandAddress, privatePostInjWithdrawal, privatePostInjAddress, privatePostRlyWithdrawal, privatePostRlyAddress, privatePostRndrWithdrawal, privatePostRndrAddress, privatePostVegaWithdrawal, privatePostVegaAddress, privatePost1inchWithdrawal, privatePost1inchAddress, privatePostEnsWithdrawal, privatePostEnsAddress, privatePostManaWithdrawal, privatePostManaAddress, privatePostLrcWithdrawal, privatePostLrcAddress, privatePostApeWithdrawal, privatePostApeAddress, privatePostMplWithdrawal, privatePostMplAddress, privatePostEurocWithdrawal, privatePostEurocAddress, privatePostSolWithdrawal, privatePostSolAddress, privatePostDotWithdrawal, privatePostDotAddress, privatePostNearWithdrawal, privatePostNearAddress, privatePostDogeWithdrawal, privatePostDogeAddress, privatePostFlrWithdrawal, privatePostFlrAddress, privatePostDgldWithdrawal, privatePostDgldAddress, privatePostLdoWithdrawal, privatePostLdoAddress, privatePostTravelRuleContacts, privatePostEarnSubscribe, privatePostEarnSubscriptionsSetting, privatePostEarnUnsubscribe, privatePostWecanWithdrawal, privatePostWecanAddress, privatePostTracWithdrawal, privatePostTracAddress, privatePostEurcvWithdrawal, privatePostEurcvAddress, privatePostPyusdWithdrawal, privatePostPyusdAddress, privatePostLmwrWithdrawal, privatePostLmwrAddress, privatePostPepeWithdrawal, privatePostPepeAddress, privatePostBlurWithdrawal, privatePostBlurAddress, privatePostVextWithdrawal, privatePostVextAddress, privatePostCsprWithdrawal, privatePostCsprAddress, privatePostVchfWithdrawal, privatePostVchfAddress, privatePostVeurWithdrawal, privatePostVeurAddress, privatePostTrufWithdrawal, privatePostTrufAddress, privatePostWifWithdrawal, privatePostWifAddress, privatePostSmtWithdrawal, privatePostSmtAddress, privatePostSuiWithdrawal, privatePostSuiAddress, privatePostJupWithdrawal, privatePostJupAddress, privatePostOndoWithdrawal, privatePostOndoAddress, privatePostBobaWithdrawal, privatePostBobaAddress, privatePostPythWithdrawal, privatePostPythAddress)
    # describe() first, then the user config — the same order, and the same
    # merge rule, as the TS base constructor (Exchange.ts, "merge constructor
    # overrides to this instance"): a plain object is deep-merged onto the
    # current value, anything else is assigned. Assigning dictionaries
    # wholesale would drop the base defaults an exchange does not restate —
    # e.g. `options.defaultNetworkCodeReplacements`, which every
    # networkIdToCode lookup needs.
    #
    # `features` is the exception, and is assigned rather than merged.
    # Julia models inheritance by composition, so a child's `parent` is a
    # fully-built instance that has already run `afterConstruct` — and
    # `featuresGenerator` rewrites `features` in place, expanding the raw
    # `{'default': ...}` / `{'swap': {'extends': ...}}` shorthand into a
    # per-market-type table and recording absent types as `nothing`. Merging
    # that derived table with the raw `describe()` value it was derived from
    # feeds the generator its own output on the child's pass: a market type
    # the parent recorded as absent comes back as a present-but-`nothing`
    # entry, which the generator then tries to index into. In TS the
    # generator only ever sees the raw value, so assign it here too.
    desc = inst.describe()
    for (k, v) in desc
        key = Symbol(k)
        if v isa AbstractDict && key !== :features
            inst[key] = deepExtend(get(inst, key, nothing), v)
        else
            inst[key] = v
        end
    end
    for (k, v) in kwargs
        if v isa AbstractDict && k !== :features
            inst[k] = deepExtend(get(inst, k, nothing), v)
        else
            inst[k] = v
        end
    end
    # Re-run the tail of the TS base constructor now that this exchange's
    # own describe() has been merged in. The composed parent Exchange only
    # ever saw the base describe(), so these derived values are still the
    # base ones until they are recomputed here.
    #
    # defineRestApi is deliberately not repeated: the generator emits every
    # api endpoint as a real Julia function (and a struct field), so the
    # dynamic closures the TS constructor installs have no work to do.
    for k in objectKeys(inst.has)
        inst[Symbol(string("has", capitalize(k)))] = ccxtruthy(get(inst.has, Symbol(k), nothing))
    end
    newUpdates = get(inst.options, Symbol("newUpdates"), nothing)
    inst.newUpdates = newUpdates === nothing ? true : newUpdates
    # afterConstruct already honours `options.sandbox`/`options.testnet`; the
    # TS constructor's extra `setSandboxMode` call reads the *user config*,
    # which arrives here as kwargs. Repeating the options-based check would
    # swap the api/test URLs a second time and clobber the apiBackup snapshot.
    inst.afterConstruct()
    if ccxtruthy(get(kwargs, :sandbox, false)) || ccxtruthy(get(kwargs, :testnet, false))
        inst.setSandboxMode(true)
    end
    inst.loadExchangeSpecificFiles()
    return inst
end


# Per-exchange docstring holders (see build/juliaTranspileCLI.ts buildDocRegistrySource).
function __ccxt_doc_Bitstamp_fetchMarkets() end
"""
retrieves data on all markets for bitstamp
see: https://www.bitstamp.net/api/#tag/Market-info/operation/GetTradingPairsInfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bitstamp_fetchMarkets

function __ccxt_doc_Bitstamp_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://www.bitstamp.net/api/#tag/Market-info/operation/GetTradingPairsInfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bitstamp_fetchCurrencies

function __ccxt_doc_Bitstamp_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.bitstamp.net/api/#tag/Order-book/operation/GetOrderBook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bitstamp_fetchOrderBook

function __ccxt_doc_Bitstamp_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.bitstamp.net/api/#tag/Tickers/operation/GetMarketTicker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bitstamp_fetchTicker

function __ccxt_doc_Bitstamp_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.bitstamp.net/api/#tag/Tickers/operation/GetCurrencyPairTickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bitstamp_fetchTickers

function __ccxt_doc_Bitstamp_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://www.bitstamp.net/api/#tag/Transactions-public/operation/GetTransactions

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bitstamp_fetchTrades

function __ccxt_doc_Bitstamp_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.bitstamp.net/api/#tag/Market-info/operation/GetOHLCData

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bitstamp_fetchOHLCV

function __ccxt_doc_Bitstamp_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.bitstamp.net/api/#tag/Account-balances/operation/GetAccountBalances

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bitstamp_fetchBalance

function __ccxt_doc_Bitstamp_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://www.bitstamp.net/api/#tag/Fees/operation/GetTradingFeesForCurrency

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bitstamp_fetchTradingFee

function __ccxt_doc_Bitstamp_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://www.bitstamp.net/api/#tag/Fees/operation/GetAllTradingFees

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Bitstamp_fetchTradingFees

function __ccxt_doc_Bitstamp_fetchTransactionFees() end
"""
please use fetchDepositWithdrawFees instead
see: https://www.bitstamp.net/api/#tag/Fees

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bitstamp_fetchTransactionFees

function __ccxt_doc_Bitstamp_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://www.bitstamp.net/api/#tag/Fees/operation/GetAllWithdrawalFees

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bitstamp_fetchDepositWithdrawFees

function __ccxt_doc_Bitstamp_createOrder() end
"""
create a trade order
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenInstantBuyOrder
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenMarketBuyOrder
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenLimitBuyOrder
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenInstantSellOrder
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenMarketSellOrder
see: https://www.bitstamp.net/api/#tag/Orders/operation/OpenLimitSellOrder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitstamp_createOrder

function __ccxt_doc_Bitstamp_editOrder() end
"""
edit a trade order
see: https://www.bitstamp.net/api/#tag/Orders/operation/ReplaceOrder

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market to create an order in
- `type`::string, optional: 'market', 'limit' or 'stop_limit'
- `side`::string, optional: 'buy' or 'sell'
- `amount`::float, optional: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price for the order, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::string, optional: the price to trigger a stop order
- `params.timeInForce`::string, optional: for crypto trading either 'gtc' or 'ioc' can be used
- `params.clientOrderId`::string, optional: a unique identifier for the order, automatically generated if not sent

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitstamp_editOrder

function __ccxt_doc_Bitstamp_cancelOrder() end
"""
cancels an open order
see: https://www.bitstamp.net/api/#tag/Orders/operation/CancelOrder

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitstamp_cancelOrder

function __ccxt_doc_Bitstamp_cancelAllOrders() end
"""
cancel all open orders
see: https://www.bitstamp.net/api/#tag/Orders/operation/CancelAllOrders
see: https://www.bitstamp.net/api/#tag/Orders/operation/CancelOrdersForMarket

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitstamp_cancelAllOrders

function __ccxt_doc_Bitstamp_fetchOrder() end
"""
fetches information on an order made by the user
see: https://www.bitstamp.net/api/#tag/Orders/operation/GetOrderStatus

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitstamp_fetchOrder

function __ccxt_doc_Bitstamp_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactions
see: https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactionsForMarket

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bitstamp_fetchMyTrades

function __ccxt_doc_Bitstamp_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://www.bitstamp.net/api/#tag/Market-info/operation/GetFundingRateHistory

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Bitstamp_fetchFundingRateHistory

function __ccxt_doc_Bitstamp_fetchDepositsWithdrawals() end
"""
fetch history of deposits and withdrawals
see: https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactions

# Arguments
- `code`::string, optional: unified currency code for the currency of the deposit/withdrawals, default is undefined
- `since`::int, optional: timestamp in ms of the earliest deposit/withdrawal, default is undefined
- `limit`::int, optional: max number of deposit/withdrawals to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitstamp_fetchDepositsWithdrawals

function __ccxt_doc_Bitstamp_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://www.bitstamp.net/api/#tag/Withdrawals/operation/GetWithdrawalRequests

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitstamp_fetchWithdrawals

function __ccxt_doc_Bitstamp_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactions

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Bitstamp_fetchLedger

function __ccxt_doc_Bitstamp_fetchFundingRate() end
"""
fetch the current funding rate
see: https://www.bitstamp.net/api/#tag/Market-info/operation/GetFundingRate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Bitstamp_fetchFundingRate

function __ccxt_doc_Bitstamp_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://www.bitstamp.net/api/#tag/Orders/operation/GetAllOpenOrders
see: https://www.bitstamp.net/api/#tag/Orders/operation/GetOpenOrdersForMarket

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitstamp_fetchOpenOrders

function __ccxt_doc_Bitstamp_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://www.bitstamp.net/api/#tag/Deposits/operation/GetCryptoDepositAddress

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Bitstamp_fetchDepositAddress

function __ccxt_doc_Bitstamp_withdraw() end
"""
make a withdrawal
see: https://www.bitstamp.net/api/#tag/Withdrawals/operation/RequestFiatWithdrawal
see: https://www.bitstamp.net/api/#tag/Withdrawals/operation/RequestCryptoWithdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitstamp_withdraw

function __ccxt_doc_Bitstamp_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://www.bitstamp.net/api/#tag/Sub-account/operation/TransferFromMainToSub
see: https://www.bitstamp.net/api/#tag/Sub-account/operation/TransferFromSubToMain

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Bitstamp_transfer
