@kwdef mutable struct Bingx <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchSwapMarkets::Function = fetchSwapMarkets
    fetchInverseSwapMarkets::Function = fetchInverseSwapMarkets
    parseMarket::Function = parseMarket
    fetchMarkets::Function = fetchMarkets
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchOrderBook::Function = fetchOrderBook
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchMarkPrice::Function = fetchMarkPrice
    fetchMarkPrices::Function = fetchMarkPrices
    parseTicker::Function = parseTicker
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchPositionHistory::Function = fetchPositionHistory
    fetchPositions::Function = fetchPositions
    fetchPosition::Function = fetchPosition
    parsePosition::Function = parsePosition
    createMarketOrderWithCost::Function = createMarketOrderWithCost
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createMarketSellOrderWithCost::Function = createMarketSellOrderWithCost
    createOrderRequest::Function = createOrderRequest
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    parseOrderSide::Function = parseOrderSide
    parseOrderType::Function = parseOrderType
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelOrders::Function = cancelOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    transfer::Function = transfer
    fetchTransfers::Function = fetchTransfers
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    fetchDepositAddressesByNetwork::Function = fetchDepositAddressesByNetwork
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    setMarginMode::Function = setMarginMode
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    setMargin::Function = setMargin
    parseMarginModification::Function = parseMarginModification
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    setLeverage::Function = setLeverage
    fetchMyTrades::Function = fetchMyTrades
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    withdraw::Function = withdraw
    parseParams::Function = parseParams
    fetchMyLiquidations::Function = fetchMyLiquidations
    parseLiquidation::Function = parseLiquidation
    closePosition::Function = closePosition
    closeAllPositions::Function = closeAllPositions
    fetchPositionMode::Function = fetchPositionMode
    setPositionMode::Function = setPositionMode
    editOrder::Function = editOrder
    fetchMarginMode::Function = fetchMarginMode
    parseMarginMode::Function = parseMarginMode
    fetchTradingFee::Function = fetchTradingFee
    parseTradingFee::Function = parseTradingFee
    customEncode::Function = customEncode
    fetchMarketLeverageTiers::Function = fetchMarketLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    sign::Function = sign
    nonce::Function = nonce
    setSandboxMode::Function = setSandboxMode
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    fundV1PrivateGetAccountBalance::Function = fundV1PrivateGetAccountBalance
    spotV1PublicGetServerTime::Function = spotV1PublicGetServerTime
    spotV1PublicGetCommonSymbols::Function = spotV1PublicGetCommonSymbols
    spotV1PublicGetMarketTrades::Function = spotV1PublicGetMarketTrades
    spotV1PublicGetMarketDepth::Function = spotV1PublicGetMarketDepth
    spotV1PublicGetMarketKline::Function = spotV1PublicGetMarketKline
    spotV1PublicGetTicker24hr::Function = spotV1PublicGetTicker24hr
    spotV1PublicGetTickerPrice::Function = spotV1PublicGetTickerPrice
    spotV1PublicGetTickerBookTicker::Function = spotV1PublicGetTickerBookTicker
    spotV1PrivateGetTradeQuery::Function = spotV1PrivateGetTradeQuery
    spotV1PrivateGetTradeOpenOrders::Function = spotV1PrivateGetTradeOpenOrders
    spotV1PrivateGetTradeHistoryOrders::Function = spotV1PrivateGetTradeHistoryOrders
    spotV1PrivateGetTradeMyTrades::Function = spotV1PrivateGetTradeMyTrades
    spotV1PrivateGetUserCommissionRate::Function = spotV1PrivateGetUserCommissionRate
    spotV1PrivateGetAccountBalance::Function = spotV1PrivateGetAccountBalance
    spotV1PrivateGetOcoOrderList::Function = spotV1PrivateGetOcoOrderList
    spotV1PrivateGetOcoOpenOrderList::Function = spotV1PrivateGetOcoOpenOrderList
    spotV1PrivateGetOcoHistoryOrderList::Function = spotV1PrivateGetOcoHistoryOrderList
    spotV1PrivatePostTradeOrder::Function = spotV1PrivatePostTradeOrder
    spotV1PrivatePostTradeCancel::Function = spotV1PrivatePostTradeCancel
    spotV1PrivatePostTradeBatchOrders::Function = spotV1PrivatePostTradeBatchOrders
    spotV1PrivatePostTradeOrderCancelReplace::Function = spotV1PrivatePostTradeOrderCancelReplace
    spotV1PrivatePostTradeCancelOrders::Function = spotV1PrivatePostTradeCancelOrders
    spotV1PrivatePostTradeCancelOpenOrders::Function = spotV1PrivatePostTradeCancelOpenOrders
    spotV1PrivatePostTradeCancelAllAfter::Function = spotV1PrivatePostTradeCancelAllAfter
    spotV1PrivatePostOcoOrder::Function = spotV1PrivatePostOcoOrder
    spotV1PrivatePostOcoCancel::Function = spotV1PrivatePostOcoCancel
    spotV2PublicGetMarketDepth::Function = spotV2PublicGetMarketDepth
    spotV2PublicGetMarketKline::Function = spotV2PublicGetMarketKline
    spotV2PublicGetTickerPrice::Function = spotV2PublicGetTickerPrice
    spotV3PrivateGetGetAssetTransfer::Function = spotV3PrivateGetGetAssetTransfer
    spotV3PrivateGetAssetTransfer::Function = spotV3PrivateGetAssetTransfer
    spotV3PrivateGetCapitalDepositHisrec::Function = spotV3PrivateGetCapitalDepositHisrec
    spotV3PrivateGetCapitalWithdrawHistory::Function = spotV3PrivateGetCapitalWithdrawHistory
    spotV3PrivatePostPostAssetTransfer::Function = spotV3PrivatePostPostAssetTransfer
    swapV1PublicGetTickerPrice::Function = swapV1PublicGetTickerPrice
    swapV1PublicGetMarketHistoricalTrades::Function = swapV1PublicGetMarketHistoricalTrades
    swapV1PublicGetMarketMarkPriceKlines::Function = swapV1PublicGetMarketMarkPriceKlines
    swapV1PublicGetTradeMultiAssetsRules::Function = swapV1PublicGetTradeMultiAssetsRules
    swapV1PublicGetTradingRules::Function = swapV1PublicGetTradingRules
    swapV1PrivateGetPositionSideDual::Function = swapV1PrivateGetPositionSideDual
    swapV1PrivateGetTradeBatchCancelReplace::Function = swapV1PrivateGetTradeBatchCancelReplace
    swapV1PrivateGetTradeFullOrder::Function = swapV1PrivateGetTradeFullOrder
    swapV1PrivateGetMaintMarginRatio::Function = swapV1PrivateGetMaintMarginRatio
    swapV1PrivateGetTradePositionHistory::Function = swapV1PrivateGetTradePositionHistory
    swapV1PrivateGetPositionMarginHistory::Function = swapV1PrivateGetPositionMarginHistory
    swapV1PrivateGetTwapOpenOrders::Function = swapV1PrivateGetTwapOpenOrders
    swapV1PrivateGetTwapHistoryOrders::Function = swapV1PrivateGetTwapHistoryOrders
    swapV1PrivateGetTwapOrderDetail::Function = swapV1PrivateGetTwapOrderDetail
    swapV1PrivateGetTradeAssetMode::Function = swapV1PrivateGetTradeAssetMode
    swapV1PrivateGetUserMarginAssets::Function = swapV1PrivateGetUserMarginAssets
    swapV1PrivatePostTradeAmend::Function = swapV1PrivatePostTradeAmend
    swapV1PrivatePostTradeCancelReplace::Function = swapV1PrivatePostTradeCancelReplace
    swapV1PrivatePostPositionSideDual::Function = swapV1PrivatePostPositionSideDual
    swapV1PrivatePostTradeBatchCancelReplace::Function = swapV1PrivatePostTradeBatchCancelReplace
    swapV1PrivatePostTradeClosePosition::Function = swapV1PrivatePostTradeClosePosition
    swapV1PrivatePostTradeGetVst::Function = swapV1PrivatePostTradeGetVst
    swapV1PrivatePostTwapOrder::Function = swapV1PrivatePostTwapOrder
    swapV1PrivatePostTwapCancelOrder::Function = swapV1PrivatePostTwapCancelOrder
    swapV1PrivatePostTradeAssetMode::Function = swapV1PrivatePostTradeAssetMode
    swapV1PrivatePostTradeReverse::Function = swapV1PrivatePostTradeReverse
    swapV1PrivatePostTradeAutoAddMargin::Function = swapV1PrivatePostTradeAutoAddMargin
    swapV2PublicGetServerTime::Function = swapV2PublicGetServerTime
    swapV2PublicGetQuoteContracts::Function = swapV2PublicGetQuoteContracts
    swapV2PublicGetQuotePrice::Function = swapV2PublicGetQuotePrice
    swapV2PublicGetQuoteDepth::Function = swapV2PublicGetQuoteDepth
    swapV2PublicGetQuoteTrades::Function = swapV2PublicGetQuoteTrades
    swapV2PublicGetQuotePremiumIndex::Function = swapV2PublicGetQuotePremiumIndex
    swapV2PublicGetQuoteFundingRate::Function = swapV2PublicGetQuoteFundingRate
    swapV2PublicGetQuoteKlines::Function = swapV2PublicGetQuoteKlines
    swapV2PublicGetQuoteOpenInterest::Function = swapV2PublicGetQuoteOpenInterest
    swapV2PublicGetQuoteTicker::Function = swapV2PublicGetQuoteTicker
    swapV2PublicGetQuoteBookTicker::Function = swapV2PublicGetQuoteBookTicker
    swapV2PrivateGetUserBalance::Function = swapV2PrivateGetUserBalance
    swapV2PrivateGetUserPositions::Function = swapV2PrivateGetUserPositions
    swapV2PrivateGetUserIncome::Function = swapV2PrivateGetUserIncome
    swapV2PrivateGetTradeOpenOrders::Function = swapV2PrivateGetTradeOpenOrders
    swapV2PrivateGetTradeOpenOrder::Function = swapV2PrivateGetTradeOpenOrder
    swapV2PrivateGetTradeOrder::Function = swapV2PrivateGetTradeOrder
    swapV2PrivateGetTradeMarginType::Function = swapV2PrivateGetTradeMarginType
    swapV2PrivateGetTradeLeverage::Function = swapV2PrivateGetTradeLeverage
    swapV2PrivateGetTradeForceOrders::Function = swapV2PrivateGetTradeForceOrders
    swapV2PrivateGetTradeAllOrders::Function = swapV2PrivateGetTradeAllOrders
    swapV2PrivateGetTradeAllFillOrders::Function = swapV2PrivateGetTradeAllFillOrders
    swapV2PrivateGetTradeFillHistory::Function = swapV2PrivateGetTradeFillHistory
    swapV2PrivateGetUserIncomeExport::Function = swapV2PrivateGetUserIncomeExport
    swapV2PrivateGetUserCommissionRate::Function = swapV2PrivateGetUserCommissionRate
    swapV2PrivateGetQuoteBookTicker::Function = swapV2PrivateGetQuoteBookTicker
    swapV2PrivatePostTradeGetVst::Function = swapV2PrivatePostTradeGetVst
    swapV2PrivatePostTradeOrder::Function = swapV2PrivatePostTradeOrder
    swapV2PrivatePostTradeBatchOrders::Function = swapV2PrivatePostTradeBatchOrders
    swapV2PrivatePostTradeCloseAllPositions::Function = swapV2PrivatePostTradeCloseAllPositions
    swapV2PrivatePostTradeCancelAllAfter::Function = swapV2PrivatePostTradeCancelAllAfter
    swapV2PrivatePostTradeMarginType::Function = swapV2PrivatePostTradeMarginType
    swapV2PrivatePostTradeLeverage::Function = swapV2PrivatePostTradeLeverage
    swapV2PrivatePostTradePositionMargin::Function = swapV2PrivatePostTradePositionMargin
    swapV2PrivatePostTradeOrderTest::Function = swapV2PrivatePostTradeOrderTest
    swapV2PrivateDeleteTradeOrder::Function = swapV2PrivateDeleteTradeOrder
    swapV2PrivateDeleteTradeBatchOrders::Function = swapV2PrivateDeleteTradeBatchOrders
    swapV2PrivateDeleteTradeAllOpenOrders::Function = swapV2PrivateDeleteTradeAllOpenOrders
    swapV3PublicGetQuoteKlines::Function = swapV3PublicGetQuoteKlines
    swapV3PrivateGetUserBalance::Function = swapV3PrivateGetUserBalance
    cswapV1PublicGetMarketContracts::Function = cswapV1PublicGetMarketContracts
    cswapV1PublicGetMarketPremiumIndex::Function = cswapV1PublicGetMarketPremiumIndex
    cswapV1PublicGetMarketOpenInterest::Function = cswapV1PublicGetMarketOpenInterest
    cswapV1PublicGetMarketKlines::Function = cswapV1PublicGetMarketKlines
    cswapV1PublicGetMarketDepth::Function = cswapV1PublicGetMarketDepth
    cswapV1PublicGetMarketTicker::Function = cswapV1PublicGetMarketTicker
    cswapV1PrivateGetTradeLeverage::Function = cswapV1PrivateGetTradeLeverage
    cswapV1PrivateGetTradeForceOrders::Function = cswapV1PrivateGetTradeForceOrders
    cswapV1PrivateGetTradeAllFillOrders::Function = cswapV1PrivateGetTradeAllFillOrders
    cswapV1PrivateGetTradeOpenOrders::Function = cswapV1PrivateGetTradeOpenOrders
    cswapV1PrivateGetTradeOrderDetail::Function = cswapV1PrivateGetTradeOrderDetail
    cswapV1PrivateGetTradeOrderHistory::Function = cswapV1PrivateGetTradeOrderHistory
    cswapV1PrivateGetTradeMarginType::Function = cswapV1PrivateGetTradeMarginType
    cswapV1PrivateGetUserCommissionRate::Function = cswapV1PrivateGetUserCommissionRate
    cswapV1PrivateGetUserPositions::Function = cswapV1PrivateGetUserPositions
    cswapV1PrivateGetUserBalance::Function = cswapV1PrivateGetUserBalance
    cswapV1PrivatePostTradeOrder::Function = cswapV1PrivatePostTradeOrder
    cswapV1PrivatePostTradeLeverage::Function = cswapV1PrivatePostTradeLeverage
    cswapV1PrivatePostTradeAllOpenOrders::Function = cswapV1PrivatePostTradeAllOpenOrders
    cswapV1PrivatePostTradeCloseAllPositions::Function = cswapV1PrivatePostTradeCloseAllPositions
    cswapV1PrivatePostTradeMarginType::Function = cswapV1PrivatePostTradeMarginType
    cswapV1PrivatePostTradePositionMargin::Function = cswapV1PrivatePostTradePositionMargin
    cswapV1PrivateDeleteTradeAllOpenOrders::Function = cswapV1PrivateDeleteTradeAllOpenOrders
    cswapV1PrivateDeleteTradeCancelOrder::Function = cswapV1PrivateDeleteTradeCancelOrder
    contractV1PrivateGetAllPosition::Function = contractV1PrivateGetAllPosition
    contractV1PrivateGetAllOrders::Function = contractV1PrivateGetAllOrders
    contractV1PrivateGetBalance::Function = contractV1PrivateGetBalance
    walletsV1PrivateGetCapitalConfigGetall::Function = walletsV1PrivateGetCapitalConfigGetall
    walletsV1PrivateGetCapitalDepositAddress::Function = walletsV1PrivateGetCapitalDepositAddress
    walletsV1PrivateGetCapitalInnerTransferRecords::Function = walletsV1PrivateGetCapitalInnerTransferRecords
    walletsV1PrivateGetCapitalSubAccountDepositAddress::Function = walletsV1PrivateGetCapitalSubAccountDepositAddress
    walletsV1PrivateGetCapitalDepositSubHisrec::Function = walletsV1PrivateGetCapitalDepositSubHisrec
    walletsV1PrivateGetCapitalSubAccountInnerTransferRecords::Function = walletsV1PrivateGetCapitalSubAccountInnerTransferRecords
    walletsV1PrivateGetCapitalDepositRiskRecords::Function = walletsV1PrivateGetCapitalDepositRiskRecords
    walletsV1PrivatePostCapitalWithdrawApply::Function = walletsV1PrivatePostCapitalWithdrawApply
    walletsV1PrivatePostCapitalInnerTransferApply::Function = walletsV1PrivatePostCapitalInnerTransferApply
    walletsV1PrivatePostCapitalSubAccountInnerTransferApply::Function = walletsV1PrivatePostCapitalSubAccountInnerTransferApply
    walletsV1PrivatePostCapitalDepositCreateSubAddress::Function = walletsV1PrivatePostCapitalDepositCreateSubAddress
    subAccountV1PrivateGetList::Function = subAccountV1PrivateGetList
    subAccountV1PrivateGetAssets::Function = subAccountV1PrivateGetAssets
    subAccountV1PrivateGetAllAccountBalance::Function = subAccountV1PrivateGetAllAccountBalance
    subAccountV1PrivatePostCreate::Function = subAccountV1PrivatePostCreate
    subAccountV1PrivatePostApiKeyCreate::Function = subAccountV1PrivatePostApiKeyCreate
    subAccountV1PrivatePostApiKeyEdit::Function = subAccountV1PrivatePostApiKeyEdit
    subAccountV1PrivatePostApiKeyDel::Function = subAccountV1PrivatePostApiKeyDel
    subAccountV1PrivatePostUpdateStatus::Function = subAccountV1PrivatePostUpdateStatus
    accountV1PrivateGetUid::Function = accountV1PrivateGetUid
    accountV1PrivateGetApiKeyQuery::Function = accountV1PrivateGetApiKeyQuery
    accountV1PrivateGetAccountApiPermissions::Function = accountV1PrivateGetAccountApiPermissions
    accountV1PrivateGetAllAccountBalance::Function = accountV1PrivateGetAllAccountBalance
    accountV1PrivatePostInnerTransferAuthorizeSubAccount::Function = accountV1PrivatePostInnerTransferAuthorizeSubAccount
    accountTransferV1PrivateGetSubAccountAssetTransferHistory::Function = accountTransferV1PrivateGetSubAccountAssetTransferHistory
    accountTransferV1PrivatePostSubAccountTransferAssetSupportCoins::Function = accountTransferV1PrivatePostSubAccountTransferAssetSupportCoins
    accountTransferV1PrivatePostSubAccountTransferAsset::Function = accountTransferV1PrivatePostSubAccountTransferAsset
    userAuthPrivatePostUserDataStream::Function = userAuthPrivatePostUserDataStream
    userAuthPrivatePutUserDataStream::Function = userAuthPrivatePutUserDataStream
    userAuthPrivateDeleteUserDataStream::Function = userAuthPrivateDeleteUserDataStream
    copyTradingV1PrivateGetSwapTraceCurrentTrack::Function = copyTradingV1PrivateGetSwapTraceCurrentTrack
    copyTradingV1PrivateGetPFuturesTraderDetail::Function = copyTradingV1PrivateGetPFuturesTraderDetail
    copyTradingV1PrivateGetPFuturesProfitHistorySummarys::Function = copyTradingV1PrivateGetPFuturesProfitHistorySummarys
    copyTradingV1PrivateGetPFuturesProfitDetail::Function = copyTradingV1PrivateGetPFuturesProfitDetail
    copyTradingV1PrivateGetPFuturesTradingPairs::Function = copyTradingV1PrivateGetPFuturesTradingPairs
    copyTradingV1PrivateGetSpotTraderDetail::Function = copyTradingV1PrivateGetSpotTraderDetail
    copyTradingV1PrivateGetSpotProfitHistorySummarys::Function = copyTradingV1PrivateGetSpotProfitHistorySummarys
    copyTradingV1PrivateGetSpotProfitDetail::Function = copyTradingV1PrivateGetSpotProfitDetail
    copyTradingV1PrivateGetSpotHistoryOrder::Function = copyTradingV1PrivateGetSpotHistoryOrder
    copyTradingV1PrivatePostSwapTraceCloseTrackOrder::Function = copyTradingV1PrivatePostSwapTraceCloseTrackOrder
    copyTradingV1PrivatePostSwapTraceSetTPSL::Function = copyTradingV1PrivatePostSwapTraceSetTPSL
    copyTradingV1PrivatePostPFuturesSetCommission::Function = copyTradingV1PrivatePostPFuturesSetCommission
    copyTradingV1PrivatePostSpotTraderSellOrder::Function = copyTradingV1PrivatePostSpotTraderSellOrder
    apiV3PrivateGetAssetTransfer::Function = apiV3PrivateGetAssetTransfer
    apiV3PrivateGetAssetTransferRecord::Function = apiV3PrivateGetAssetTransferRecord
    apiV3PrivateGetCapitalDepositHisrec::Function = apiV3PrivateGetCapitalDepositHisrec
    apiV3PrivateGetCapitalWithdrawHistory::Function = apiV3PrivateGetCapitalWithdrawHistory
    apiV3PrivatePostPostAssetTransfer::Function = apiV3PrivatePostPostAssetTransfer
    apiAssetV1PrivatePostTransfer::Function = apiAssetV1PrivatePostTransfer
    apiAssetV1PublicGetTransferSupportCoins::Function = apiAssetV1PublicGetTransferSupportCoins
    agentV1PrivateGetAccountInviteAccountList::Function = agentV1PrivateGetAccountInviteAccountList
    agentV1PrivateGetRewardCommissionDataList::Function = agentV1PrivateGetRewardCommissionDataList
    agentV1PrivateGetAccountInviteRelationCheck::Function = agentV1PrivateGetAccountInviteRelationCheck
    agentV1PrivateGetAssetDepositDetailList::Function = agentV1PrivateGetAssetDepositDetailList
    agentV1PrivateGetRewardThirdCommissionDataList::Function = agentV1PrivateGetRewardThirdCommissionDataList
    agentV1PrivateGetAssetPartnerData::Function = agentV1PrivateGetAssetPartnerData
    agentV1PrivateGetCommissionDataListReferralCode::Function = agentV1PrivateGetCommissionDataListReferralCode
    agentV1PrivateGetAccountSuperiorCheck::Function = agentV1PrivateGetAccountSuperiorCheck

end
function describe(self::Bingx, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bingx",
    Symbol("name") => "BingX",
    Symbol("countries") => ["US"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v1",
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => true,
        Symbol("closePosition") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => true,
        Symbol("createMarketSellOrderWithCost") => true,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTrailingAmountOrder") => true,
        Symbol("createTrailingPercentOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => true,
        Symbol("fetchMarketLeverageTiers") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMarkPrice") => true,
        Symbol("fetchMarkPrices") => true,
        Symbol("fetchMyLiquidations") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => true,
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTransfers") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => true,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("hostname") => "bingx.com",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github-production-user-asset-6210df.s3.amazonaws.com/1294454/253675376-6983b72e-4999-4549-b177-33b374c195e3.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("fund") => "https://open-api.{hostname}/openApi",
            Symbol("spot") => "https://open-api.{hostname}/openApi",
            Symbol("swap") => "https://open-api.{hostname}/openApi",
            Symbol("contract") => "https://open-api.{hostname}/openApi",
            Symbol("wallets") => "https://open-api.{hostname}/openApi",
            Symbol("user") => "https://open-api.{hostname}/openApi",
            Symbol("subAccount") => "https://open-api.{hostname}/openApi",
            Symbol("account") => "https://open-api.{hostname}/openApi",
            Symbol("copyTrading") => "https://open-api.{hostname}/openApi",
            Symbol("cswap") => "https://open-api.{hostname}/openApi",
            Symbol("api") => "https://open-api.{hostname}/openApi"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("fund") => "https://open-api-vst.{hostname}/openApi",
            Symbol("spot") => "https://open-api-vst.{hostname}/openApi",
            Symbol("swap") => "https://open-api-vst.{hostname}/openApi",
            Symbol("contract") => "https://open-api-vst.{hostname}/openApi",
            Symbol("wallets") => "https://open-api-vst.{hostname}/openApi",
            Symbol("user") => "https://open-api-vst.{hostname}/openApi",
            Symbol("subAccount") => "https://open-api-vst.{hostname}/openApi",
            Symbol("account") => "https://open-api-vst.{hostname}/openApi",
            Symbol("copyTrading") => "https://open-api-vst.{hostname}/openApi",
            Symbol("cswap") => "https://open-api-vst.{hostname}/openApi",
            Symbol("api") => "https://open-api-vst.{hostname}/openApi"
        ),
        Symbol("www") => "https://bingx.com/",
        Symbol("doc") => "https://bingx-api.github.io/docs/",
        Symbol("referral") => "https://bingx.com/invite/OHETOM"
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("tierBased") => true,
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("maker") => self.parseNumber("0.001"),
            Symbol("taker") => self.parseNumber("0.001")
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("feeSide") => "quote",
            Symbol("maker") => self.parseNumber("0.0002"),
            Symbol("taker") => self.parseNumber("0.0005")
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("fund") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    )
                )
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("public") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("server/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("common/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    )
                ),
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("trade/query") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("trade/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("trade/historyOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("trade/myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("user/commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("oco/orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("oco/openOrderList") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("oco/historyOrderList") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/order/cancelReplace") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/cancelOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/cancelOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/cancelAllAfter") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("oco/order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("oco/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    )
                )
            ),
            Symbol("v2") => Dict{Symbol, Any}(
                Symbol("public") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    )
                )
            ),
            Symbol("v3") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("get/asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("capital/deposit/hisrec") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("capital/withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("post/asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    )
                )
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("public") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/historicalTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/markPriceKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("trade/multiAssetsRules") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("tradingRules") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    )
                ),
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("positionSide/dual") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/batchCancelReplace") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/fullOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("maintMarginRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/positionHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("positionMargin/history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("twap/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("twap/historyOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("twap/orderDetail") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/assetMode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("user/marginAssets") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("trade/amend") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/cancelReplace") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("positionSide/dual") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/batchCancelReplace") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/closePosition") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/getVst") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("twap/order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("twap/cancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/assetMode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/reverse") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/autoAddMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    )
                )
            ),
            Symbol("v2") => Dict{Symbol, Any}(
                Symbol("public") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("server/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("quote/contracts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("quote/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("quote/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("quote/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("quote/premiumIndex") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("quote/fundingRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("quote/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("quote/openInterest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("quote/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("quote/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    )
                ),
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("user/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("user/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("user/income") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/openOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/marginType") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/forceOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("trade/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/allFillOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/fillHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("user/income/export") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("user/commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("quote/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("trade/getVst") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/closeAllPositions") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/cancelAllAfter") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/marginType") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/positionMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("trade/order/test") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    ),
                    Symbol("delete") => Dict{Symbol, Any}(
                        Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    )
                )
            ),
            Symbol("v3") => Dict{Symbol, Any}(
                Symbol("public") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("quote/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    )
                ),
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("user/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    )
                )
            )
        ),
        Symbol("cswap") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("public") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("market/contracts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/premiumIndex") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/openInterest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("market/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    )
                ),
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("trade/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/forceOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/allFillOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/orderDetail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/orderHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/marginType") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("user/commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("user/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("user/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/closeAllPositions") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/marginType") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/positionMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    ),
                    Symbol("delete") => Dict{Symbol, Any}(
                        Symbol("trade/allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("trade/cancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    )
                )
            )
        ),
        Symbol("contract") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("allPosition") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    )
                )
            )
        ),
        Symbol("wallets") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("capital/config/getall") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("capital/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("capital/innerTransfer/records") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("capital/subAccount/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("capital/deposit/subHisrec") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("capital/subAccount/innerTransfer/records") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("capital/deposit/riskRecords") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("capital/withdraw/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("capital/innerTransfer/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("capital/subAccountInnerTransfer/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("capital/deposit/createSubAddress") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    )
                )
            )
        ),
        Symbol("subAccount") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("list") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                        Symbol("assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("allAccountBalance") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("create") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                        Symbol("apiKey/create") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("apiKey/edit") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("apiKey/del") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("updateStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                    )
                )
            )
        ),
        Symbol("account") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("uid") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("apiKey/query") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("account/apiPermissions") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("allAccountBalance") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("innerTransfer/authorizeSubAccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    )
                )
            ),
            Symbol("transfer") => Dict{Symbol, Any}(
                Symbol("v1") => Dict{Symbol, Any}(
                    Symbol("private") => Dict{Symbol, Any}(
                        Symbol("get") => Dict{Symbol, Any}(
                            Symbol("subAccount/asset/transferHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                        ),
                        Symbol("post") => Dict{Symbol, Any}(
                            Symbol("subAccount/transferAsset/supportCoins") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                            Symbol("subAccount/transferAsset") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                        )
                    )
                )
            )
        ),
        Symbol("user") => Dict{Symbol, Any}(
            Symbol("auth") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    ),
                    Symbol("put") => Dict{Symbol, Any}(
                        Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    ),
                    Symbol("delete") => Dict{Symbol, Any}(
                        Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    )
                )
            )
        ),
        Symbol("copyTrading") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("swap/trace/currentTrack") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("PFutures/traderDetail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("PFutures/profitHistorySummarys") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("PFutures/profitDetail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("PFutures/tradingPairs") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("spot/traderDetail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("spot/profitHistorySummarys") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("spot/profitDetail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("spot/historyOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("swap/trace/closeTrackOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("swap/trace/setTPSL") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("PFutures/setCommission") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                        Symbol("spot/trader/sellOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
                    )
                )
            )
        ),
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("v3") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("asset/transferRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("capital/deposit/hisrec") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                        Symbol("capital/withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    ),
                    Symbol("post") => Dict{Symbol, Any}(
                        Symbol("post/asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                    )
                )
            ),
            Symbol("asset") => Dict{Symbol, Any}(
                Symbol("v1") => Dict{Symbol, Any}(
                    Symbol("private") => Dict{Symbol, Any}(
                        Symbol("post") => Dict{Symbol, Any}(
                            Symbol("transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                        )
                    ),
                    Symbol("public") => Dict{Symbol, Any}(
                        Symbol("get") => Dict{Symbol, Any}(
                            Symbol("transfer/supportCoins") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                        )
                    )
                )
            )
        ),
        Symbol("agent") => Dict{Symbol, Any}(
            Symbol("v1") => Dict{Symbol, Any}(
                Symbol("private") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("account/inviteAccountList") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("reward/commissionDataList") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("account/inviteRelationCheck") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("asset/depositDetailList") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("reward/third/commissionDataList") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("asset/partnerData") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("commissionDataList/referralCode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                        Symbol("account/superiorCheck") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
                    )
                )
            )
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("3m") => "3m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("3d") => "3d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("400") => BadRequest,
            Symbol("401") => AuthenticationError,
            Symbol("403") => PermissionDenied,
            Symbol("404") => BadRequest,
            Symbol("429") => DDoSProtection,
            Symbol("418") => PermissionDenied,
            Symbol("500") => ExchangeError,
            Symbol("504") => ExchangeError,
            Symbol("100001") => AuthenticationError,
            Symbol("100412") => AuthenticationError,
            Symbol("100202") => InsufficientFunds,
            Symbol("100204") => BadRequest,
            Symbol("100400") => BadRequest,
            Symbol("100410") => OperationFailed,
            Symbol("100421") => BadSymbol,
            Symbol("100440") => ExchangeError,
            Symbol("100500") => OperationFailed,
            Symbol("100503") => ExchangeError,
            Symbol("80001") => BadRequest,
            Symbol("80012") => InsufficientFunds,
            Symbol("80014") => BadRequest,
            Symbol("80016") => OrderNotFound,
            Symbol("80017") => OrderNotFound,
            Symbol("100414") => AccountSuspended,
            Symbol("100419") => PermissionDenied,
            Symbol("100437") => BadRequest,
            Symbol("101204") => InsufficientFunds,
            Symbol("110425") => InvalidOrder,
            Symbol("Insufficient assets") => InsufficientFunds,
            Symbol("illegal transferType") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("SNOW") => "Snowman",
        Symbol("OMNI") => "OmniCat",
        Symbol("NAP") => "\$NAP",
        Symbol("TRUMP") => "TRUMPMAGA",
        Symbol("TRUMPSOL") => "TRUMP"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "spot",
        Symbol("fetchOHLCV") => Dict{Symbol, Any}(
            Symbol("timeZone") => 0
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("funding") => "fund",
            Symbol("spot") => "spot",
            Symbol("future") => "stdFutures",
            Symbol("swap") => "USDTMPerp",
            Symbol("linear") => "USDTMPerp",
            Symbol("inverse") => "coinMPerp"
        ),
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("fund") => "funding",
            Symbol("spot") => "spot",
            Symbol("stdFutures") => "future",
            Symbol("USDTMPerp") => "linear",
            Symbol("coinMPerp") => "inverse"
        ),
        Symbol("recvWindow") => 5 * 1000,
        Symbol("broker") => "CCXT",
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("ETH") => "ETH",
            Symbol("USDT") => "ERC20",
            Symbol("USDC") => "ERC20",
            Symbol("BTC") => "BTC",
            Symbol("LTC") => "LTC"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ARBITRUM") => "ARB",
            Symbol("MATIC") => "POLYGON",
            Symbol("ZKSYNC") => "ZKSYNCERA",
            Symbol("AVAXC") => "AVAX-C",
            Symbol("HBAR") => "HEDERA"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("defaultForLinear") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => true
                ),
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => Dict{Symbol, Any}(
                        Symbol("last") => true,
                        Symbol("mark") => true,
                        Symbol("index") => true
                    ),
                    Symbol("price") => true
                ),
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => true,
                Symbol("trailing") => true,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 5
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 512,
                Symbol("daysBack") => 30,
                Symbol("untilDays") => 30,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 20000,
                Symbol("untilDays") => 7,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 7,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1440
            )
        ),
        Symbol("defaultForInverse") => Dict{Symbol, Any}(
            Symbol("extends") => "defaultForLinear",
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing
            ),
            Symbol("fetchOrders") => nothing
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "defaultForLinear",
            Symbol("fetchCurrencies") => Dict{Symbol, Any}(
                Symbol("private") => true
            ),
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("triggerPriceType") => nothing,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("trailing") => false
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("limit") => 1000,
                Symbol("daysBack") => 1,
                Symbol("untilDays") => 1
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("limit") => 100,
                Symbol("untilDays") => nothing
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "defaultForLinear"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "defaultForInverse"
            )
        ),
        Symbol("defaultForFuture") => Dict{Symbol, Any}(
            Symbol("extends") => "defaultForLinear",
            Symbol("fetchOrders") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "defaultForFuture"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "defaultForFuture"
            )
        )
    ),
    Symbol("rollingWindowSize") => 2000
))

end
"""
fetches the current integer timestamp in milliseconds from the bingx server
see: https://bingx-api.github.io/docs/#/swapV2/base-info.html#Get%20Server%20Time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the bingx server
"""
function fetchTime(self::Bingx; params=Dict())
    response = Base.fetch(self.swapV2PublicGetServerTime(params));
    data = self.safeDict(response, "data");
    return safeInteger(data, "serverTime")

end
"""
fetches all available currencies on an exchange
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Wallet%20Deposits%20and%20Withdrawals/Query%20currency%20deposit%20and%20withdrawal%20data

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bingx; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(self.checkRequiredCredentials(error = false)))
            return Dict{Symbol, Any}()
    end
    isSandbox = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    if functions.ccxtruthy(isSandbox)
            return Dict{Symbol, Any}()
    end
    response = Base.fetch(self.walletsV1PrivateGetCapitalConfigGetall(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseCurrencies(data)

end
function parseCurrency(self::Bingx, rawCurrency)
    currencyId = safeString(rawCurrency, "coin");
    code = self.safeCurrencyCode(currencyId);
    name = safeString(rawCurrency, "name");
    networkList = self.safeList(rawCurrency, "networkList");
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkList)))
        rawNetwork = get(networkList, j + 1, nothing);
        network = safeString(rawNetwork, "network");
        networkCode = self.networkIdToCode(networkId = network, currencyCode = code);
        limits = Dict{Symbol, Any}(
            Symbol("withdraw") => Dict{Symbol, Any}(
                Symbol("min") => self.safeNumber(rawNetwork, "withdrawMin"),
                Symbol("max") => self.safeNumber(rawNetwork, "withdrawMax")
            ),
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("min") => self.safeNumber(rawNetwork, "depositMin"),
                Symbol("max") => nothing
            )
        );
        precision = self.parseNumber(self.parsePrecision(precision = safeString(rawNetwork, "withdrawPrecision")));
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("info") => rawNetwork,
                Symbol("id") => network,
                Symbol("network") => networkCode,
                Symbol("fee") => self.safeNumber(rawNetwork, "withdrawFee"),
                Symbol("active") => nothing,
                Symbol("deposit") => self.safeBool(rawNetwork, "depositEnable"),
                Symbol("withdraw") => self.safeBool(rawNetwork, "withdrawEnable"),
                Symbol("precision") => precision,
                Symbol("limits") => limits
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("precision") => nothing,
    Symbol("name") => name,
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("networks") => networks,
    Symbol("fee") => nothing,
    Symbol("limits") => nothing,
    Symbol("type") => "crypto"
))

end
function fetchSpotMarkets(self::Bingx, params)
    response = Base.fetch(self.spotV1PublicGetCommonSymbols(params));
    data = self.safeDict(response, "data");
    markets = self.safeList(data, "symbols", defaultValue = []);
    return self.parseMarkets(markets)

end
function fetchSwapMarkets(self::Bingx, params)
    response = Base.fetch(self.swapV2PublicGetQuoteContracts(params));
    markets = self.safeList(response, "data", defaultValue = []);
    return self.parseMarkets(markets)

end
function fetchInverseSwapMarkets(self::Bingx, params)
    response = Base.fetch(self.cswapV1PublicGetMarketContracts(params));
    markets = self.safeList(response, "data", defaultValue = []);
    return self.parseMarkets(markets)

end
function parseMarket(self::Bingx, market)
    id = safeString(market, "symbol");
    symbolParts = split(id, "-");
    baseId = get(symbolParts, 1, nothing);
    quoteId = get(symbolParts, 2, nothing);
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    currency = safeString(market, "currency");
    checkIsInverse = false;
    checkIsLinear = true;
    minTickSize = self.safeNumber(market, "minTickSize");
    if functions.ccxtruthy(minTickSize != nothing)
        currency = baseId;
        checkIsInverse = true;
        checkIsLinear = false;
    end
    settle = self.safeCurrencyCode(currency);
    pricePrecision = self.safeNumber(market, "tickSize");
    if functions.ccxtruthy(pricePrecision == nothing)
        pricePrecision = self.parseNumber(self.parsePrecision(precision = safeString(market, "pricePrecision")));
    end
    quantityPrecision = self.safeNumber(market, "stepSize");
    if functions.ccxtruthy(quantityPrecision == nothing)
        quantityPrecision = self.parseNumber(self.parsePrecision(precision = safeString(market, "quantityPrecision")));
    end
    type_var = functions.ccxtruthy((settle != nothing)) ? "swap" : "spot";
    spot = type_var == "spot";
    swap = type_var == "swap";
    symbol = string(base, "/", quote_var);
    if functions.ccxtruthy(settle != nothing)
        symbol += string(":", settle);
    end
    fees = self.safeDict(self.fees, type_var, defaultValue = Dict{Symbol, Any}());
    contractSize = functions.ccxtruthy((swap)) ? self.parseNumber("1") : nothing;
    isActive = false;
    if functions.ccxtruthy(@functions.ccxt_and((safeString(market, "apiStateOpen") == "true"), (safeString(market, "apiStateClose") == "true")))
        isActive = true;
    elseif functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(self.safeBool(market, "apiStateSell"), self.safeBool(market, "apiStateBuy")), (safeString(market, "status") == "1")))
        isActive = true;
    end
    isInverse = functions.ccxtruthy((spot)) ? nothing : checkIsInverse;
    isLinear = functions.ccxtruthy((spot)) ? nothing : checkIsLinear;
    minAmount = nothing;
    if functions.ccxtruthy(!functions.ccxtruthy(spot))
        minAmount = self.safeNumber2(market, "minQty", "tradeMinQuantity");
    end
    timeOnline = safeInteger(market, "timeOnline");
    if functions.ccxtruthy(timeOnline == 0)
        timeOnline = nothing;
    end
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => currency,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => false,
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => isActive,
    Symbol("contract") => swap,
    Symbol("linear") => isLinear,
    Symbol("inverse") => isInverse,
    Symbol("taker") => self.safeNumber(fees, "taker"),
    Symbol("maker") => self.safeNumber(fees, "maker"),
    Symbol("feeSide") => safeString(fees, "feeSide"),
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => quantityPrecision,
        Symbol("price") => pricePrecision
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minAmount,
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => minTickSize,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumberN(market, ["minNotional", "tradeMinUSDT", "minTradeValue"]),
            Symbol("max") => self.safeNumber(market, "maxNotional")
        )
    ),
    Symbol("created") => timeOnline,
    Symbol("info") => market
))

end
"""
retrieves data on all markets for bingx
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/Spot%20trading%20symbols
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/USDT-M%20Perp%20Futures%20symbols
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Contract%20Information

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bingx; params=Dict())
    requests = [self.fetchSwapMarkets(params)];
    isSandbox = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    if functions.ccxtruthy(!functions.ccxtruthy(isSandbox))
                push!(requests, self.fetchInverseSwapMarkets(params));
                push!(requests, self.fetchSpotMarkets(params));
    end
    promises = Base.fetch(asyncmap(Base.fetch, requests));
    linearSwapMarkets = self.safeList(promises, 0, defaultValue = []);
    inverseSwapMarkets = self.safeList(promises, 1, defaultValue = []);
    spotMarkets = self.safeList(promises, 2, defaultValue = []);
    swapMarkets = arrayConcat(linearSwapMarkets, inverseSwapMarkets);
    return arrayConcat(spotMarkets, swapMarkets)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/Kline%2FCandlestick%20Data
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Kline%2FCandlestick%20Data
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Mark%20Price%20Kline%2FCandlestick%20Data
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Get%20K-line%20Data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bingx, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 1440))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    request[Symbol("interval")] = safeString(self.timeframes, timeframe, timeframe);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = max(since - 1, 0);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger2(params, "until", "endTime");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("endTime")] = until;
    end
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        timeZone = nothing;
        (timeZone, params) = self.handleOptionAndParams(params, "fetchOHLCV", "timeZone", defaultValue = 0);
        if functions.ccxtruthy(timeZone != nothing)
            request[Symbol("timeZone")] = timeZone;
        end
        response = Base.fetch(self.spotV1PublicGetMarketKline(extend(request, params)));
    else
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.cswapV1PublicGetMarketKlines(extend(request, params)));
        else
            price = safeString(params, "price");
            params = omit(params, "price");
            if functions.ccxtruthy(price == "mark")
                response = Base.fetch(self.swapV1PublicGetMarketMarkPriceKlines(extend(request, params)));
            else
                response = Base.fetch(self.swapV3PublicGetQuoteKlines(extend(request, params)));
            end
        end
    end
    ohlcvs = safeValue(response, "data", []);
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(ohlcvs)))
        ohlcvs = [ohlcvs];
    end
    return self.parseOHLCVs(ohlcvs, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Bingx, ohlcv; market=nothing)
    if functions.ccxtruthy(functions.ccxt_isArray(ohlcv))
            return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]
    end
    return [safeInteger2(ohlcv, "time", "closeTime"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "volume")]

end
"""
get the list of most recent trades for a particular symbol
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/Recent%20Trades%20List
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Recent%20Trades%20List

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bingx, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 100);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTrades", market = market, params = params);
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.spotV1PublicGetMarketTrades(extend(request, params)));
    else
        response = Base.fetch(self.swapV2PublicGetQuoteTrades(extend(request, params)));
    end
    trades = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseTrade(self::Bingx, trade; market=nothing)
    time = safeIntegerN(trade, ["time", "filledTm", "T", "tradeTime"]);
    datetimeId = safeString(trade, "filledTm");
    if functions.ccxtruthy(datetimeId != nothing)
        time = self.parse8601(datetimeId);
    end
    if functions.ccxtruthy(time == 0)
        time = nothing;
    end
    cost = safeString(trade, "quoteQty");
    currencyId = safeStringN(trade, ["currency", "N", "commissionAsset"]);
    currencyCode = self.safeCurrencyCode(currencyId);
    m = self.safeBool(trade, "m");
    marketId = safeString2(trade, "s", "symbol");
    isBuyerMaker = self.safeBoolN(trade, ["buyerMaker", "isBuyerMaker", "maker"]);
    takeOrMaker = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((isBuyerMaker != nothing), (m != nothing)))
        takeOrMaker = functions.ccxtruthy((@functions.ccxt_or(isBuyerMaker, m))) ? "maker" : "taker";
    end
    side = safeStringLower2(trade, "side", "S");
    if functions.ccxtruthy(side == nothing)
        if functions.ccxtruthy(@functions.ccxt_or((isBuyerMaker != nothing), (m != nothing)))
            side = functions.ccxtruthy((@functions.ccxt_or(isBuyerMaker, m))) ? "sell" : "buy";
            takeOrMaker = "taker";
        end
    end
    isBuyer = self.safeBool(trade, "isBuyer");
    if functions.ccxtruthy(isBuyer != nothing)
        side = functions.ccxtruthy(isBuyer) ? "buy" : "sell";
    end
    isMaker = self.safeBool(trade, "isMaker");
    if functions.ccxtruthy(isMaker != nothing)
        takeOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    end
    amount = safeStringN(trade, ["qty", "amount", "q"]);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((market != nothing), get(market, Symbol("swap"), nothing)), (ccxt_in("volume", trade))))
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            amount = safeString(trade, "volume");
        else
            contractSize = safeString(get(market, Symbol("info"), nothing), "tradeMinQuantity");
            volume = safeString(trade, "volume");
            amount = stringMul(volume, contractSize);
        end
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => safeString2(trade, "id", "t"),
    Symbol("info") => trade,
    Symbol("timestamp") => time,
    Symbol("datetime") => self.iso8601(time),
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = "-"),
    Symbol("order") => safeString2(trade, "orderId", "i"),
    Symbol("type") => safeStringLower(trade, "o"),
    Symbol("side") => self.parseOrderSide(side),
    Symbol("takerOrMaker") => takeOrMaker,
    Symbol("price") => safeStringN(trade, ["price", "p", "tradePrice"]),
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => self.parseNumber(stringAbs(safeString2(trade, "commission", "n"))),
        Symbol("currency") => currencyCode
    )
), market = market)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/Order%20Book
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Order%20Book
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Query%20Depth%20Data

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bingx, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrderBook", market = market, params = params);
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.spotV1PublicGetMarketDepth(extend(request, params)));
    else
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.cswapV1PublicGetMarketDepth(extend(request, params)));
        else
            response = Base.fetch(self.swapV2PublicGetQuoteDepth(extend(request, params)));
        end
    end
    orderbook = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    nonce = safeInteger(orderbook, "lastUpdateId");
    timestamp = safeInteger2(orderbook, "T", "ts");
    result = self.parseOrderBook(orderbook, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = 0, amountKey = 1);
    result[Symbol("nonce")] = nonce;
    return result

end
"""
fetch the current funding rate
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Mark%20Price%20and%20Funding%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Price%20%26%20Current%20Funding%20Rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Bingx, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.cswapV1PublicGetMarketPremiumIndex(extend(request, params)));
    else
        response = Base.fetch(self.swapV2PublicGetQuotePremiumIndex(extend(request, params)));
    end
    data = self.safeDict(response, "data");
    return self.parseFundingRate(data, market = market)

end
"""
fetch the current funding rate for multiple symbols
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Mark%20Price%20and%20Funding%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Price%20%26%20Current%20Funding%20Rate

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse" (default is linear)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRates(self::Bingx; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = "swap", allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    firstMarket = self.getMarketFromSymbols(symbols = symbols);
    subType = "linear";
    (subType, params) = self.handleSubTypeAndParams("fetchFundingRates", market = firstMarket, params = params, defaultValue = subType);
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.cswapV1PublicGetMarketPremiumIndex(params));
    else
        response = Base.fetch(self.swapV2PublicGetQuotePremiumIndex(params));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseFundingRates(data, symbols = symbols)

end
function parseFundingRate(self::Bingx, contract; market=nothing)
    marketId = safeString(contract, "symbol");
    nextFundingTimestamp = safeInteger(contract, "nextFundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = "-", marketType = "swap"),
    Symbol("markPrice") => self.safeNumber(contract, "markPrice"),
    Symbol("indexPrice") => self.safeNumber(contract, "indexPrice"),
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "lastFundingRate"),
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
"""
fetches historical funding rate prices
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Get%20Funding%20Rate%20History

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Bingx; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, timeframe = "8h", params = params))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger2(params, "until", "startTime");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("startTime")] = until;
    end
    response = Base.fetch(self.swapV2PublicGetQuoteFundingRate(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseFundingRateHistories(data, market = market, since = since, limit = limit)

end
function parseFundingRateHistory(self::Bingx, contract; market=nothing)
    timestamp = safeInteger(contract, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(safeString(contract, "symbol"), market = market, delimiter = "-", marketType = "swap"),
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
fetches historical funding received
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Get%20Account%20Profit%20and%20Loss%20Fund%20Flow

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding history for
- `since`::int, optional: timestamp in ms of the earliest funding to fetch
- `limit`::int, optional: the maximum amount of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding to fetch

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Bingx; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingHistory", symbol = symbol, since = since, limit = limit, timeframe = "24h", params = params))
    end
    request = Dict{Symbol, Any}(
        Symbol("incomeType") => "FUNDING_FEE"
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger2(params, "until", "endTime");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, ["until"]);
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.swapV2PrivateGetUserIncome(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseIncomes(data, market = market, since = since, limit = limit)

end
function parseIncome(self::Bingx, income; market=nothing)
    marketId = safeString(income, "symbol");
    currencyId = safeString(income, "asset");
    timestamp = safeInteger(income, "time");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(income, "tranId"),
    Symbol("amount") => self.safeNumber(income, "income"),
    Symbol("type") => "funding"
)

end
"""
retrieves the open interest of a trading pair
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Open%20Interest%20Statistics
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Get%20Swap%20Open%20Positions

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Bingx, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.cswapV1PublicGetMarketOpenInterest(extend(request, params)));
    else
        response = Base.fetch(self.swapV2PublicGetQuoteOpenInterest(extend(request, params)));
    end
    result = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        data = self.safeList(response, "data", defaultValue = []);
        result = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    else
        result = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    end
    return self.parseOpenInterest(result, market = market)

end
function parseOpenInterest(self::Bingx, interest; market=nothing)
    timestamp = safeInteger2(interest, "time", "timestamp");
    id = safeString(interest, "symbol");
    symbol = self.safeSymbol(id, market = market, delimiter = "-", marketType = "swap");
    openInterest = self.safeNumber(interest, "openInterest");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("baseVolume") => nothing,
    Symbol("quoteVolume") => nothing,
    Symbol("openInterestAmount") => nothing,
    Symbol("openInterestValue") => openInterest,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/24hr%20Ticker%20Price%20Change%20Statistics
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/24hr%20Ticker%20Price%20Change%20Statistics
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Query%2024-Hour%20Price%20Change

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bingx, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.spotV1PublicGetTicker24hr(extend(request, params)));
    else
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.cswapV1PublicGetMarketTicker(extend(request, params)));
        else
            response = Base.fetch(self.swapV2PublicGetQuoteTicker(extend(request, params)));
        end
    end
    data = self.safeList(response, "data");
    if functions.ccxtruthy(data != nothing)
        first_var = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
            return self.parseTicker(first_var, market = market)
    end
    dataDict = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(dataDict, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/24hr%20Ticker%20Price%20Change%20Statistics
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/24hr%20Ticker%20Price%20Change%20Statistics
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Query%2024-Hour%20Price%20Change

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Bingx; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols = symbols);
        firstSymbol = safeString(symbols, 0);
        if functions.ccxtruthy(firstSymbol != nothing)
            market = self.market(firstSymbol);
        end
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market = market, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchTickers", market = market, params = params);
    if functions.ccxtruthy(type_var == "spot")
        response = Base.fetch(self.spotV1PublicGetTicker24hr(params));
    else
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.cswapV1PublicGetMarketTicker(params));
        else
            response = Base.fetch(self.swapV2PublicGetQuoteTicker(params));
        end
    end
    tickers = self.safeList(response, "data");
    return self.parseTickers(tickers, symbols = symbols)

end
"""
fetches mark prices for the market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Mark%20Price%20and%20Funding%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Price%20%26%20Current%20Funding%20Rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchMarkPrice(self::Bingx, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMarkPrice", market = market, params = params, defaultValue = "linear");
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.cswapV1PublicGetMarketPremiumIndex(extend(request, params)));
    else
        response = Base.fetch(self.swapV2PublicGetQuotePremiumIndex(extend(request, params)));
    end
    if functions.ccxtruthy(functions.ccxt_isArray(get(response, Symbol("data"), nothing)))
            return self.parseTicker(self.safeDict(get(response, Symbol("data"), nothing), 0, defaultValue = Dict{Symbol, Any}()), market = market)
    end
    return self.parseTicker(get(response, Symbol("data"), nothing), market = market)

end
"""
fetches mark prices for multiple markets
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Mark%20Price%20and%20Funding%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Price%20%26%20Current%20Funding%20Rate

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchMarkPrices(self::Bingx; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols = symbols);
        firstSymbol = safeString(symbols, 0);
        if functions.ccxtruthy(firstSymbol != nothing)
            market = self.market(firstSymbol);
        end
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMarkPrices", market = market, params = params, defaultValue = "linear");
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.cswapV1PublicGetMarketPremiumIndex(params));
    else
        response = Base.fetch(self.swapV2PublicGetQuotePremiumIndex(params));
    end
    tickers = self.safeList(response, "data");
    return self.parseTickers(tickers, symbols = symbols)

end
function parseTicker(self::Bingx, ticker; market=nothing)
    marketId = safeString(ticker, "symbol");
    lastQty = safeString(ticker, "lastQty");
    type_var = functions.ccxtruthy((lastQty == nothing)) ? "spot" : "swap";
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = type_var);
    symbol = get(market, Symbol("symbol"), nothing);
    open = safeString(ticker, "openPrice");
    high = safeString(ticker, "highPrice");
    low = safeString(ticker, "lowPrice");
    close = safeString(ticker, "lastPrice");
    quoteVolume = safeString(ticker, "quoteVolume");
    baseVolume = safeString(ticker, "volume");
    percentage = safeString(ticker, "priceChangePercent");
    if functions.ccxtruthy(percentage != nothing)
        percentage = replace(percentage, "%" => "");
    end
    change = safeString(ticker, "priceChange");
    ts = safeInteger(ticker, "closeTime");
    if functions.ccxtruthy(ts == 0)
        ts = nothing;
    end
    datetime = self.iso8601(ts);
    bid = safeString(ticker, "bidPrice");
    bidVolume = safeString(ticker, "bidQty");
    ask = safeString(ticker, "askPrice");
    askVolume = safeString(ticker, "askQty");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => ts,
    Symbol("datetime") => datetime,
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bid") => bid,
    Symbol("bidVolume") => bidVolume,
    Symbol("ask") => ask,
    Symbol("askVolume") => askVolume,
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => close,
    Symbol("last") => nothing,
    Symbol("previousClose") => nothing,
    Symbol("change") => change,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => safeString(ticker, "markPrice"),
    Symbol("indexPrice") => safeString(ticker, "indexPrice"),
    Symbol("info") => ticker
), market = market)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Account%20Endpoints/Query%20Assets
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Query%20account%20data
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Account%20Assets
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Fund%20Account/Query%20Assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.standard`::bool, optional: whether to fetch standard contract balances
- `params.type`::string, optional: the type of balance to fetch (spot, swap, method = funding) default is `spot`

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bingx; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    standard = nothing;
    (standard, params) = self.handleOptionAndParams(params, "fetchBalance", "standard", defaultValue = false);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchBalance", market = nothing, params = params);
    (marketType, marketTypeQuery) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    if functions.ccxtruthy(standard)
        response = Base.fetch(self.contractV1PrivateGetBalance(marketTypeQuery));
    elseif functions.ccxtruthy(@functions.ccxt_or((marketType == "funding"), (marketType == "fund")))
        response = Base.fetch(self.fundV1PrivateGetAccountBalance(marketTypeQuery));
    else
        if functions.ccxtruthy(marketType == "spot")
            response = Base.fetch(self.spotV1PrivateGetAccountBalance(marketTypeQuery));
        else
            if functions.ccxtruthy(subType == "inverse")
                response = Base.fetch(self.cswapV1PrivateGetUserBalance(marketTypeQuery));
            else
                response = Base.fetch(self.swapV3PrivateGetUserBalance(marketTypeQuery));
            end
        end

    end
    return self.parseBalance(response)

end
function parseBalance(self::Bingx, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    contractBalances = self.safeList(response, "data");
    firstContractBalances = self.safeDict(contractBalances, 0);
    isContract = firstContractBalances != nothing;
    spotData = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    spotBalances = self.safeList2(spotData, "balances", "assets", defaultValue = []);
    if functions.ccxtruthy(isContract)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(contractBalances)))
            balance = get(contractBalances, i + 1, nothing);
            currencyId = safeString(balance, "asset");
            if functions.ccxtruthy(currencyId == nothing)
                break
            end
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("free")] = safeString2(balance, "availableMargin", "availableBalance");
            account[Symbol("used")] = safeString(balance, "usedMargin");
            account[Symbol("total")] = safeString(balance, "maxWithdrawAmount");
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
            i += 1
        end

    else
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(spotBalances)))
            balance = get(spotBalances, i + 1, nothing);
            currencyId = safeString(balance, "asset");
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("free")] = safeString(balance, "free");
            account[Symbol("used")] = safeString(balance, "locked");
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
            i += 1
        end
    end
    return self.safeBalance(result)

end
"""
fetches historical positions
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Position%20History

# Arguments
- `symbol`::string: unified contract symbol
- `since`::int, optional: the earliest time in ms to fetch positions for
- `limit`::int, optional: the maximum amount of records to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch positions for

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionHistory(self::Bingx, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTs")] = since;
    end
    (request, params) = self.handleUntilOption("endTs", request, params);
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.swapV1PrivateGetTradePositionHistory(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchPositionHistory() is not supported for inverse swap positions")));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    records = self.safeList(data, "positionHistory", defaultValue = []);
    positions = self.parsePositions(records);
    return self.filterBySymbolSinceLimit(positions, symbol = symbol, since = since, limit = limit)

end
"""
fetch all open positions
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Query%20position%20data
see: https://bingx-api.github.io/docs/#/en-us/standard/contract-interface.html#position
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20warehouse

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.standard`::bool, optional: whether to fetch standard contract positions

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Bingx; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    standard = nothing;
    (standard, params) = self.handleOptionAndParams(params, "fetchPositions", "standard", defaultValue = false);
    if functions.ccxtruthy(standard)
        response = Base.fetch(self.contractV1PrivateGetAllPosition(params));
    else
        market = nothing;
        if functions.ccxtruthy(symbols != nothing)
            symbols = self.marketSymbols(symbols = symbols);
            firstSymbol = safeString(symbols, 0);
            if functions.ccxtruthy(firstSymbol != nothing)
                market = self.market(firstSymbol);
            end
        end
        subType = nothing;
        (subType, params) = self.handleSubTypeAndParams("fetchPositions", market = market, params = params);
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.cswapV1PrivateGetUserPositions(params));
        else
            response = Base.fetch(self.swapV2PrivateGetUserPositions(params));
        end
    end
    positions = self.safeList(response, "data", defaultValue = []);
    return self.parsePositions(positions, symbols = symbols)

end
"""
fetch data on a single open contract trade position
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Query%20position%20data
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20warehouse

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Bingx, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadRequest(string(self.id, " fetchPosition() supports swap markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.cswapV1PrivateGetUserPositions(extend(request, params)));
    else
        response = Base.fetch(self.swapV2PrivateGetUserPositions(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    first_var = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parsePosition(first_var, market = market)

end
function parsePosition(self::Bingx, position; market=nothing)
    marketId = safeString(position, "symbol", "");
    marketId = replace(marketId, "/" => "-");
    isolated = self.safeBool(position, "isolated");
    marginMode = nothing;
    if functions.ccxtruthy(isolated != nothing)
        marginMode = functions.ccxtruthy(isolated) ? "isolated" : "cross";
    end
    timestamp = safeInteger(position, "openTime");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "positionId"),
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = "-", marketType = "swap"),
    Symbol("notional") => self.safeNumber(position, "positionValue"),
    Symbol("marginMode") => marginMode,
    Symbol("liquidationPrice") => nothing,
    Symbol("entryPrice") => self.safeNumber2(position, "avgPrice", "entryPrice"),
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealizedProfit"),
    Symbol("realizedPnl") => self.safeNumber(position, "realisedProfit"),
    Symbol("percentage") => nothing,
    Symbol("contracts") => self.safeNumber(position, "positionAmt"),
    Symbol("contractSize") => nothing,
    Symbol("markPrice") => self.safeNumber(position, "markPrice"),
    Symbol("lastPrice") => nothing,
    Symbol("side") => safeStringLower(position, "positionSide"),
    Symbol("hedged") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeInteger(position, "updateTime"),
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("collateral") => nothing,
    Symbol("initialMargin") => self.safeNumber(position, "initialMargin"),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("marginRatio") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
"""
create a market order by providing the symbol, side and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketOrderWithCost(self::Bingx, symbol, side, cost; params=Dict())
    params[Symbol("quoteOrderQty")] = cost;
    return Base.fetch(self.createOrder(symbol, "market", side, cost, price = nothing, params = params))

end
"""
create a market buy order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Bingx, symbol, cost; params=Dict())
    params[Symbol("quoteOrderQty")] = cost;
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, price = nothing, params = params))

end
"""
create a market sell order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketSellOrderWithCost(self::Bingx, symbol, cost; params=Dict())
    params[Symbol("quoteOrderQty")] = cost;
    return Base.fetch(self.createOrder(symbol, "market", "sell", cost, price = nothing, params = params))

end
function createOrderRequest(self::Bingx, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    postOnly = nothing;
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("createOrder", market = market, params = params);
    type_var = uppercase(type_var);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("type") => type_var,
        Symbol("side") => uppercase(side)
    );
    isMarketOrder = type_var == "MARKET";
    isSpot = marketType == "spot";
    isTwapOrder = type_var == "TWAP";
    if functions.ccxtruthy(@functions.ccxt_and(isTwapOrder, isSpot))
        throw(BadSymbol(string(self.id, " createOrder() twap order supports swap contracts only")));
    end
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    triggerPrice = safeString2(params, "stopPrice", "triggerPrice");
    isTriggerOrder = triggerPrice != nothing;
    isStopLossPriceOrder = stopLossPrice != nothing;
    isTakeProfitPriceOrder = takeProfitPrice != nothing;
    exchangeClientOrderId = functions.ccxtruthy(isSpot) ? "newClientOrderId" : "clientOrderID";
    clientOrderId = safeString2(params, exchangeClientOrderId, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol(exchangeClientOrderId)] = clientOrderId;
    end
    timeInForce = safeStringUpper(params, "timeInForce");
    (postOnly, params) = self.handlePostOnly(isMarketOrder, timeInForce == "PostOnly", params = params);
    if functions.ccxtruthy(@functions.ccxt_or(postOnly, (timeInForce == "PostOnly")))
        request[Symbol("timeInForce")] = "PostOnly";
    elseif functions.ccxtruthy(timeInForce == "IOC")
        request[Symbol("timeInForce")] = "IOC";
    else
        if functions.ccxtruthy(timeInForce == "GTC")
            request[Symbol("timeInForce")] = "GTC";
        end

    end
    if functions.ccxtruthy(isSpot)
        cost = safeString2(params, "cost", "quoteOrderQty");
        params = omit(params, "cost");
        if functions.ccxtruthy(cost != nothing)
            request[Symbol("quoteOrderQty")] = self.parseToNumeric(self.costToPrecision(symbol, cost));
        else
            if functions.ccxtruthy(@functions.ccxt_and(isMarketOrder, (price != nothing)))
                calculatedCost = stringMul(numberToString(amount), numberToString(price));
                request[Symbol("quoteOrderQty")] = self.parseToNumeric(calculatedCost);
            else
                request[Symbol("quantity")] = self.parseToNumeric(self.amountToPrecision(symbol, amount));
            end
        end
        if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
            request[Symbol("price")] = self.parseToNumeric(self.priceToPrecision(symbol, price));
        end
        if functions.ccxtruthy(triggerPrice != nothing)
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(isMarketOrder, (side == "buy")), safeString(request, "quoteOrderQty") == nothing))
                throw(ArgumentsRequired(string(self.id, " createOrder() requires the cost parameter (or the amount + price) for placing spot market-buy trigger orders")));
            end
            request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
            if functions.ccxtruthy(type_var == "LIMIT")
                request[Symbol("type")] = "TRIGGER_LIMIT";
            elseif functions.ccxtruthy(type_var == "MARKET")
                request[Symbol("type")] = "TRIGGER_MARKET";
            end
        elseif functions.ccxtruthy(@functions.ccxt_or((stopLossPrice != nothing), (takeProfitPrice != nothing)))
            stopTakePrice = functions.ccxtruthy((stopLossPrice != nothing)) ? stopLossPrice : takeProfitPrice;
            if functions.ccxtruthy(type_var == "LIMIT")
                request[Symbol("type")] = "TAKE_STOP_LIMIT";
            elseif functions.ccxtruthy(type_var == "MARKET")
                request[Symbol("type")] = "TAKE_STOP_MARKET";
            end
            request[Symbol("stopPrice")] = self.parseToNumeric(self.priceToPrecision(symbol, stopTakePrice));
        end
    else
        if functions.ccxtruthy(isTwapOrder)
            twapRequest = Dict{Symbol, Any}(
                Symbol("symbol") => get(request, Symbol("symbol"), nothing),
                Symbol("side") => get(request, Symbol("side"), nothing),
                Symbol("positionSide") => functions.ccxtruthy((side == "buy")) ? "LONG" : "SHORT",
                Symbol("triggerPrice") => self.parseToNumeric(self.priceToPrecision(symbol, triggerPrice)),
                Symbol("totalAmount") => self.parseToNumeric(self.amountToPrecision(symbol, amount))
            );
                return extend(twapRequest, params)
        end
        if functions.ccxtruthy(timeInForce == "FOK")
            request[Symbol("timeInForce")] = "FOK";
        end
        trailingAmount = safeString(params, "trailingAmount");
        trailingPercent = safeString2(params, "trailingPercent", "priceRate");
        trailingType = safeString(params, "trailingType", "TRAILING_STOP_MARKET");
        isTrailingAmountOrder = trailingAmount != nothing;
        isTrailingPercentOrder = trailingPercent != nothing;
        isTrailing = @functions.ccxt_or(isTrailingAmountOrder, isTrailingPercentOrder);
        stopLossDict = self.safeDict(params, "stopLoss");
        takeProfitDict = self.safeDict(params, "takeProfit");
        hasStopLoss = stopLossDict != nothing;
        hasTakeProfit = takeProfitDict != nothing;
        if functions.ccxtruthy(hasStopLoss)
            params = omit(params, "stopLoss");
        end
        if functions.ccxtruthy(hasTakeProfit)
            params = omit(params, "takeProfit");
        end
        if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((type_var == "LIMIT"), (type_var == "TRIGGER_LIMIT")), (type_var == "STOP")), (type_var == "TAKE_PROFIT"))), !functions.ccxtruthy(isTrailing)))
            request[Symbol("price")] = self.parseToNumeric(self.priceToPrecision(symbol, price));
        end
        reduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
        if functions.ccxtruthy(isTriggerOrder)
            request[Symbol("stopPrice")] = self.parseToNumeric(self.priceToPrecision(symbol, triggerPrice));
            if functions.ccxtruthy(@functions.ccxt_or(isMarketOrder, (type_var == "TRIGGER_MARKET")))
                request[Symbol("type")] = "TRIGGER_MARKET";
            elseif functions.ccxtruthy(@functions.ccxt_or((type_var == "LIMIT"), (type_var == "TRIGGER_LIMIT")))
                request[Symbol("type")] = "TRIGGER_LIMIT";
            end
        elseif functions.ccxtruthy(@functions.ccxt_or(isStopLossPriceOrder, isTakeProfitPriceOrder))
            reduceOnly = true;
            if functions.ccxtruthy(isStopLossPriceOrder)
                request[Symbol("stopPrice")] = self.parseToNumeric(self.priceToPrecision(symbol, stopLossPrice));
                if functions.ccxtruthy(@functions.ccxt_or(isMarketOrder, (type_var == "STOP_MARKET")))
                    request[Symbol("type")] = "STOP_MARKET";
                elseif functions.ccxtruthy(@functions.ccxt_or((type_var == "LIMIT"), (type_var == "STOP")))
                    request[Symbol("type")] = "STOP";
                end
            elseif functions.ccxtruthy(isTakeProfitPriceOrder)
                request[Symbol("stopPrice")] = self.parseToNumeric(self.priceToPrecision(symbol, takeProfitPrice));
                if functions.ccxtruthy(@functions.ccxt_or(isMarketOrder, (type_var == "TAKE_PROFIT_MARKET")))
                    request[Symbol("type")] = "TAKE_PROFIT_MARKET";
                elseif functions.ccxtruthy(@functions.ccxt_or((type_var == "LIMIT"), (type_var == "TAKE_PROFIT")))
                    request[Symbol("type")] = "TAKE_PROFIT";
                end
            end
        else
            if functions.ccxtruthy(isTrailing)
                request[Symbol("type")] = trailingType;
                if functions.ccxtruthy(isTrailingAmountOrder)
                    request[Symbol("price")] = self.parseToNumeric(trailingAmount);
                elseif functions.ccxtruthy(isTrailingPercentOrder)
                    requestTrailingPercent = stringDiv(trailingPercent, "100");
                    request[Symbol("priceRate")] = self.parseToNumeric(requestTrailingPercent);
                end
            end

        end
        if functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
            stringifiedAmount = numberToString(amount);
            if functions.ccxtruthy(hasStopLoss)
                slTriggerPrice = safeString2(stopLossDict, "triggerPrice", "stopPrice");
                slWorkingType = safeString(stopLossDict, "workingType", "MARK_PRICE");
                slType = safeString(stopLossDict, "type", "STOP_MARKET");
                slRequest = Dict{Symbol, Any}(
                    Symbol("stopPrice") => self.parseToNumeric(self.priceToPrecision(symbol, slTriggerPrice)),
                    Symbol("workingType") => slWorkingType,
                    Symbol("type") => slType
                );
                slPrice = safeString(stopLossDict, "price");
                if functions.ccxtruthy(slPrice != nothing)
                    slRequest[Symbol("price")] = self.parseToNumeric(self.priceToPrecision(symbol, slPrice));
                end
                slQuantity = safeString(stopLossDict, "quantity", stringifiedAmount);
                slRequest[Symbol("quantity")] = self.parseToNumeric(self.amountToPrecision(symbol, slQuantity));
                request[Symbol("stopLoss")] = json(slRequest);
            end
            if functions.ccxtruthy(hasTakeProfit)
                tkTriggerPrice = safeString2(takeProfitDict, "triggerPrice", "stopPrice");
                tkWorkingType = safeString(takeProfitDict, "workingType", "MARK_PRICE");
                tpType = safeString(takeProfitDict, "type", "TAKE_PROFIT_MARKET");
                tpRequest = Dict{Symbol, Any}(
                    Symbol("stopPrice") => self.parseToNumeric(self.priceToPrecision(symbol, tkTriggerPrice)),
                    Symbol("workingType") => tkWorkingType,
                    Symbol("type") => tpType
                );
                slPrice = safeString(takeProfitDict, "price");
                if functions.ccxtruthy(slPrice != nothing)
                    tpRequest[Symbol("price")] = self.parseToNumeric(self.priceToPrecision(symbol, slPrice));
                end
                tkQuantity = safeString(takeProfitDict, "quantity", stringifiedAmount);
                tpRequest[Symbol("quantity")] = self.parseToNumeric(self.amountToPrecision(symbol, tkQuantity));
                request[Symbol("takeProfit")] = json(tpRequest);
            end
        end
        positionSide = nothing;
        hedged = self.safeBool(params, "hedged", defaultValue = false);
        if functions.ccxtruthy(hedged)
            params = omit(params, "reduceOnly");
            if functions.ccxtruthy(reduceOnly)
                positionSide = functions.ccxtruthy((side == "buy")) ? "SHORT" : "LONG";
            else
                positionSide = functions.ccxtruthy((side == "buy")) ? "LONG" : "SHORT";
            end
        else
            positionSide = "BOTH";
        end
        request[Symbol("positionSide")] = positionSide;
        closePosition = self.safeBool(params, "closePosition", defaultValue = false);
        if functions.ccxtruthy(!functions.ccxtruthy(closePosition))
            amountReq = amount;
            if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("inverse"), nothing)))
                amountReq = self.parseToNumeric(self.amountToPrecision(symbol, amount));
            end
            request[Symbol("quantity")] = amountReq;
        end
    end
    params = omit(params, ["hedged", "triggerPrice", "stopLossPrice", "takeProfitPrice", "trailingAmount", "trailingPercent", "trailingType", "clientOrderId"]);
    return extend(request, params)

end
"""
create a trade order
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Place%20order
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Place%20order
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Place%20TWAP%20Order
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Trade%20order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order
- `params.postOnly`::bool, optional: true to place a post only order
- `params.timeInForce`::string, optional: spot supports 'PO', 'GTC' and 'IOC', swap supports 'PO', 'GTC', 'IOC' and 'FOK'
- `params.reduceOnly`::bool, optional: *swap only* true or false whether the order is reduce only
- `params.triggerPrice`::float, optional: triggerPrice at which the attached take profit / stop loss order will be triggered
- `params.stopLossPrice`::float, optional: stop loss trigger price
- `params.takeProfitPrice`::float, optional: take profit trigger price
- `params.cost`::float, optional: the quote quantity that can be used as an alternative for the amount
- `params.trailingAmount`::float, optional: *swap only* the quote amount to trail away from the current market price
- `params.trailingPercent`::float, optional: *swap only* the percent to trail away from the current market price
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price
- `params.test`::bool, optional: *swap only* whether to use the test endpoint or not, default is false
- `params.positionSide`::string, optional: *contracts only* "BOTH" for one way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode
- `params.hedged`::bool, optional: *swap only* whether the order is in hedged mode or one way mode
- `params.closePosition`::bool, optional: *swap only* true to close the entire position with a TP/SL order, in which case the quantity is not sent

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Bingx, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    test = self.safeBool(params, "test", defaultValue = false);
    params = omit(params, "test");
    request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(test)
            response = Base.fetch(self.swapV2PrivatePostTradeOrderTest(request));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.cswapV1PrivatePostTradeOrder(request));
        else
            if functions.ccxtruthy(type_var == "twap")
                response = Base.fetch(self.swapV1PrivatePostTwapOrder(request));
            else
                response = Base.fetch(self.swapV2PrivatePostTradeOrder(request));
            end

        end
    else
        response = Base.fetch(self.spotV1PrivatePostTradeOrder(request));
    end
    if functions.ccxtruthy(isa(response, AbstractString))
        response = self.fixStringifiedJsonMembers(response);
        parsedResponse = self.parseJson(response);
        response = parsedResponse;
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    result = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            result = response;
        else
            result = self.safeDict(data, "order", defaultValue = data);
        end
    else
        result = data;
    end
    stopLossDict = self.safeDict(result, "stopLoss");
    stopLoss = safeString(result, "stopLoss");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((stopLossDict == nothing), (stopLoss != nothing)), (findfirst("{", stopLoss) !== nothing)))
        result[Symbol("stopLoss")] = self.parseJson(stopLoss);
    end
    takeProfit = safeString(result, "takeProfit");
    if functions.ccxtruthy(@functions.ccxt_and((takeProfit != nothing), (findfirst("{", takeProfit) !== nothing)))
        result[Symbol("takeProfit")] = self.parseJson(takeProfit);
    end
    return self.parseOrder(result, market = market)

end
"""
create a list of trade orders
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Place%20multiple%20orders
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Place%20multiple%20orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.sync`::bool, optional: *spot only* if true, multiple orders are ordered serially and all orders do not require the same symbol/side/type

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Bingx, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    marketIds = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol", "");
        type_var = safeString(rawOrder, "type");
        push!(marketIds, marketId);
        side = safeString(rawOrder, "side");
        amount = self.safeNumber(rawOrder, "amount");
        price = self.safeNumber(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price = price, params = orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    symbols = self.marketSymbols(symbols = marketIds, type_var = nothing, allowEmpty = false, sameTypeOnly = true, sameSubTypeOnly = true);
    symbolsLength = length(symbols);
    market = self.market(get(symbols, 1, nothing));
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 5))
            throw(InvalidOrder(string(self.id, " createOrders() can not create more than 5 orders at once for swap markets")));
        end
        request[Symbol("batchOrders")] = json(ordersRequests);
        response = Base.fetch(self.swapV2PrivatePostTradeBatchOrders(request));
    else
        sync = self.safeBool(params, "sync", defaultValue = false);
        if functions.ccxtruthy(sync)
            request[Symbol("sync")] = true;
        end
        request[Symbol("data")] = json(ordersRequests);
        response = Base.fetch(self.spotV1PrivatePostTradeBatchOrders(request));
    end
    if functions.ccxtruthy(isa(response, AbstractString))
        response = self.fixStringifiedJsonMembers(response);
        parsedResponse = self.parseJson(response);
        response = parsedResponse;
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    result = self.safeList(data, "orders", defaultValue = []);
    return self.parseOrders(result, market = market)

end
function parseOrderSide(self::Bingx, side)
    sides = Dict{Symbol, Any}(
        Symbol("BUY") => "buy",
        Symbol("SELL") => "sell",
        Symbol("SHORT") => "sell",
        Symbol("LONG") => "buy",
        Symbol("ask") => "sell",
        Symbol("bid") => "buy"
    );
    return safeString(sides, side, side)

end
function parseOrderType(self::Bingx, type_var)
    types = Dict{Symbol, Any}(
        Symbol("trigger_market") => "market",
        Symbol("trigger_limit") => "limit",
        Symbol("stop_limit") => "limit",
        Symbol("stop_market") => "market",
        Symbol("take_profit_market") => "market",
        Symbol("stop") => "limit"
    );
    return safeString(types, type_var, type_var)

end
function parseOrder(self::Bingx, order; market=nothing)
    info = order;
    newOrder = self.safeDict2(order, "newOrderResponse", "orderOpenResponse");
    if functions.ccxtruthy(newOrder != nothing)
        order = newOrder;
    end
    positionSide = safeString2(order, "positionSide", "ps");
    marketType = functions.ccxtruthy((positionSide == nothing)) ? "spot" : "swap";
    marketId = safeString2(order, "symbol", "s");
    if functions.ccxtruthy(market == nothing)
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = marketType);
    end
    side = safeStringLower2(order, "side", "S");
    timestamp = safeIntegerN(order, ["time", "transactTime", "E", "createdTime"]);
    lastTradeTimestamp = safeInteger2(order, "updateTime", "T");
    statusId = safeStringUpperN(order, ["status", "X", "orderStatus"]);
    feeCurrencyCode = safeString2(order, "feeAsset", "N");
    feeCost = safeStringN(order, ["fee", "commission", "n"]);
    if functions.ccxtruthy((feeCurrencyCode == nothing))
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            if functions.ccxtruthy(side == "buy")
                feeCurrencyCode = get(market, Symbol("base"), nothing);
            else
                feeCurrencyCode = get(market, Symbol("quote"), nothing);
            end
        else
            feeCurrencyCode = get(market, Symbol("quote"), nothing);
        end
    end
    stopLoss = safeValue(order, "stopLoss");
    stopLossPrice = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((stopLoss != nothing), (stopLoss != "")))
        stopLossPrice = omitZero(safeString(stopLoss, "stopLoss"));
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((stopLoss != nothing), (!isa(stopLoss, Number))), (stopLoss != "")))
        if functions.ccxtruthy(isa(stopLoss, AbstractString))
            stopLoss = self.parseJson(stopLoss);
        end
        stopLossPrice = omitZero(safeString(stopLoss, "stopPrice"));
    end
    takeProfit = safeValue(order, "takeProfit");
    takeProfitPrice = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(takeProfit != nothing, (takeProfit != "")))
        takeProfitPrice = omitZero(safeString(takeProfit, "takeProfit"));
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((takeProfit != nothing), (!isa(takeProfit, Number))), (takeProfit != "")))
        if functions.ccxtruthy(isa(takeProfit, AbstractString))
            takeProfit = self.parseJson(takeProfit);
        end
        takeProfitPrice = omitZero(safeString(takeProfit, "stopPrice"));
    end
    rawType = safeStringLower2(order, "type", "o");
    stopPrice = omitZero(safeString2(order, "StopPrice", "stopPrice"));
    triggerPrice = stopPrice;
    if functions.ccxtruthy(stopPrice != nothing)
        if functions.ccxtruthy(@functions.ccxt_and((findfirst("stop", rawType) !== nothing), (stopLossPrice == nothing)))
            stopLossPrice = stopPrice;
            triggerPrice = nothing;
        end
        if functions.ccxtruthy(@functions.ccxt_and((findfirst("take", rawType) !== nothing), (takeProfitPrice == nothing)))
            takeProfitPrice = stopPrice;
            triggerPrice = nothing;
        end
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("id") => safeStringN(order, ["orderId", "i", "mainOrderId"]),
    Symbol("clientOrderId") => safeStringN(order, ["clientOrderID", "clientOrderId", "origClientOrderId", "c"]),
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = "-", marketType = marketType),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("lastUpdateTimestamp") => safeInteger(order, "updateTime"),
    Symbol("type") => self.parseOrderType(rawType),
    Symbol("timeInForce") => safeString(order, "timeInForce"),
    Symbol("postOnly") => nothing,
    Symbol("side") => self.parseOrderSide(side),
    Symbol("price") => safeString2(order, "price", "p"),
    Symbol("triggerPrice") => triggerPrice,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("average") => safeString2(order, "avgPrice", "ap"),
    Symbol("cost") => safeString(order, "cummulativeQuoteQty"),
    Symbol("amount") => safeStringN(order, ["origQty", "q", "quantity", "totalAmount"]),
    Symbol("filled") => safeString2(order, "executedQty", "z"),
    Symbol("remaining") => nothing,
    Symbol("status") => self.parseOrderStatus(statusId),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => feeCurrencyCode,
        Symbol("cost") => stringAbs(feeCost)
    ),
    Symbol("trades") => nothing,
    Symbol("reduceOnly") => self.safeBool2(order, "reduceOnly", "ro")
), market = market)

end
function parseOrderStatus(self::Bingx, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("PENDING") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("RUNNING") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("CANCELLED") => "canceled",
        Symbol("FAILED") => "canceled"
    );
    return safeString(statuses, status, status)

end
"""
cancels an open order
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Cancel%20Order
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20Order
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20TWAP%20Order
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Cancel%20an%20Order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bingx, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isTwapOrder = self.safeBool(params, "twap", defaultValue = false);
    params = omit(params, "twap");
    market = nothing;
    if functions.ccxtruthy(isTwapOrder)
        twapRequest = Dict{Symbol, Any}(
            Symbol("mainOrderId") => id
        );
        response = Base.fetch(self.swapV1PrivatePostTwapCancelOrder(extend(twapRequest, params)));
    else
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
        end
        market = self.market(symbol);
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing)
        );
        clientOrderId = safeString2(params, "clientOrderId", "clientOrderID");
        params = omit(params, ["clientOrderId"]);
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("clientOrderID")] = clientOrderId;
        else
            request[Symbol("orderId")] = id;
        end
        type_var = nothing;
        subType = nothing;
        (type_var, params) = self.handleMarketTypeAndParams("cancelOrder", market = market, params = params);
        (subType, params) = self.handleSubTypeAndParams("cancelOrder", market = market, params = params);
        if functions.ccxtruthy(type_var == "spot")
            response = Base.fetch(self.spotV1PrivatePostTradeCancel(extend(request, params)));
        else
            if functions.ccxtruthy(subType == "inverse")
                response = Base.fetch(self.cswapV1PrivateDeleteTradeCancelOrder(extend(request, params)));
            else
                response = Base.fetch(self.swapV2PrivateDeleteTradeOrder(extend(request, params)));
            end
        end
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    order = self.safeDict(data, "order", defaultValue = data);
    return self.parseOrder(order, market = market)

end
"""
cancel all open orders
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Cancel%20all%20Open%20Orders%20on%20a%20Symbol
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20All%20Open%20Orders
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Cancel%20all%20orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' (default is 'spot' if symbol is not provided)
- `params.subType`::string, optional: 'linear' or 'inverse' for swap markets (default is 'linear' if symbol is not provided)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Bingx; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = "spot";
    subType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelAllOrders", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("cancelAllOrders", market = market, params = params);
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.spotV1PrivatePostTradeCancelOpenOrders(extend(request, params)));
    elseif functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.cswapV1PrivateDeleteTradeAllOpenOrders(extend(request, params)));
        else
            response = Base.fetch(self.swapV2PrivateDeleteTradeAllOpenOrders(extend(request, params)));
        end
    else
        throw(BadRequest(string(self.id, " cancelAllOrders is only supported for spot and swap markets.")));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList2(data, "success", "orders", defaultValue = []);
    return self.parseOrders(orders)

end
"""
cancel multiple orders
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Cancel%20multiple%20orders
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20multiple%20orders

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Bingx, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderIds = safeValue(params, "clientOrderIds");
    params = omit(params, "clientOrderIds");
    idsToParse = ids;
    areClientOrderIds = (clientOrderIds != nothing);
    if functions.ccxtruthy(areClientOrderIds)
        idsToParse = clientOrderIds;
    end
    parsedIds = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(idsToParse)))
        id = get(idsToParse, i + 1, nothing);
        stringId = string(id);
        push!(parsedIds, stringId);
        i += 1
    end
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        spotReqKey = functions.ccxtruthy(areClientOrderIds) ? "clientOrderIDs" : "orderIds";
        request[Symbol(spotReqKey)] =         join(parsedIds, ",");
        response = Base.fetch(self.spotV1PrivatePostTradeCancelOrders(extend(request, params)));
    else
        if functions.ccxtruthy(areClientOrderIds)
            request[Symbol("clientOrderIDList")] = json(parsedIds);
        else
            request[Symbol("orderIdList")] = parsedIds;
        end
        response = Base.fetch(self.swapV2PrivateDeleteTradeBatchOrders(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    success = self.safeList2(data, "success", "orders", defaultValue = []);
    return self.parseOrders(success)

end
"""
dead man's switch, cancel all orders after the given timeout
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Cancel%20All%20After
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20All%20After

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: spot or swap market

# Returns
- the api result
"""
function cancelAllOrdersAfter(self::Bingx, timeout; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isActive = (functions.ccxt_gt(timeout, 0));
    request = Dict{Symbol, Any}(
        Symbol("type") => functions.ccxtruthy((isActive)) ? "ACTIVATE" : "CLOSE",
        Symbol("timeOut") => functions.ccxtruthy((isActive)) ? (self.parseToInt(timeout / 1000)) : 0
    );
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("cancelAllOrdersAfter", market = nothing, params = params);
    if functions.ccxtruthy(type_var == "spot")
        response = Base.fetch(self.spotV1PrivatePostTradeCancelAllAfter(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.swapV2PrivatePostTradeCancelAllAfter(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " cancelAllOrdersAfter() is not supported for ", type_var, " markets")));
    end
    return response

end
"""
fetches information on an order made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20Order%20details
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Order%20details
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/TWAP%20Order%20Details
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Order

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.twap`::bool, optional: if fetching twap order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bingx, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isTwapOrder = self.safeBool(params, "twap", defaultValue = false);
    params = omit(params, "twap");
    response = nothing;
    market = nothing;
    if functions.ccxtruthy(isTwapOrder)
        twapRequest = Dict{Symbol, Any}(
            Symbol("mainOrderId") => id
        );
        response = Base.fetch(self.swapV1PrivateGetTwapOrderDetail(extend(twapRequest, params)));
    else
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
        end
        market = self.market(symbol);
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing),
            Symbol("orderId") => id
        );
        type_var = nothing;
        subType = nothing;
        (type_var, params) = self.handleMarketTypeAndParams("fetchOrder", market = market, params = params);
        (subType, params) = self.handleSubTypeAndParams("fetchOrder", market = market, params = params);
        if functions.ccxtruthy(type_var == "spot")
            response = Base.fetch(self.spotV1PrivateGetTradeQuery(extend(request, params)));
        else
            if functions.ccxtruthy(subType == "inverse")
                response = Base.fetch(self.cswapV1PrivateGetTradeOrderDetail(extend(request, params)));
            else
                response = Base.fetch(self.swapV2PrivateGetTradeOrder(extend(request, params)));
            end
        end
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    order = self.safeDict(data, "order", defaultValue = data);
    return self.parseOrder(order, market = market)

end
"""
fetches information on multiple orders made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/All%20Orders
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Order%20history (returns less fields than above)

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.orderId`::int, optional: Only return subsequent orders, and return the latest order by default

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Bingx; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrders", market = market, params = params);
    if functions.ccxtruthy(type_var != "swap")
        throw(NotSupported(string(self.id, " fetchOrders() is only supported for swap markets")));
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.swapV1PrivateGetTradeFullOrder(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(data, "orders", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently open orders
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Current%20Open%20Orders
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Current%20All%20Open%20Orders
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20all%20current%20pending%20orders
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20TWAP%20Entrusted%20Order

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.twap`::bool, optional: if fetching twap open orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bingx; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    subType = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOpenOrders", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchOpenOrders", market = market, params = params);
    if functions.ccxtruthy(type_var == "spot")
        response = Base.fetch(self.spotV1PrivateGetTradeOpenOrders(extend(request, params)));
    else
        isTwapOrder = self.safeBool(params, "twap", defaultValue = false);
        params = omit(params, "twap");
        if functions.ccxtruthy(isTwapOrder)
            response = Base.fetch(self.swapV1PrivateGetTwapOpenOrders(extend(request, params)));
        elseif functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.cswapV1PrivateGetTradeOpenOrders(extend(request, params)));
        else
            response = Base.fetch(self.swapV2PrivateGetTradeOpenOrders(extend(request, params)));
        end
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList2(data, "orders", "list", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/User's%20History%20Orders
see: https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order

# Arguments
- `symbol`::string: unified market symbol of the closed orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of closed orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.standard`::bool, optional: whether to fetch standard contract orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Bingx; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.fetchCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = params));
    return filterBy(orders, "status", "closed")

end
"""
fetches information on multiple canceled orders made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/User's%20History%20Orders
see: https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order

# Arguments
- `symbol`::string: unified market symbol of the canceled orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of canceled orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.standard`::bool, optional: whether to fetch standard contract orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Bingx; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.fetchCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = params));
    return filterBy(orders, "status", "canceled")

end
"""
fetches information on multiple closed orders made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/User's%20History%20Orders
see: https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20TWAP%20Historical%20Orders

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.standard`::bool, optional: whether to fetch standard contract orders
- `params.twap`::bool, optional: if fetching twap orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledAndClosedOrders(self::Bingx; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    subType = nothing;
    standard = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchCanceledAndClosedOrders", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchCanceledAndClosedOrders", market = market, params = params);
    (standard, params) = self.handleOptionAndParams(params, "fetchCanceledAndClosedOrders", "standard", defaultValue = false);
    if functions.ccxtruthy(standard)
        response = Base.fetch(self.contractV1PrivateGetAllOrders(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "spot")
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("pageSize")] = limit;
        end
        response = Base.fetch(self.spotV1PrivateGetTradeHistoryOrders(extend(request, params)));
    else
        isTwapOrder = self.safeBool(params, "twap", defaultValue = false);
        params = omit(params, "twap");
        if functions.ccxtruthy(isTwapOrder)
            request[Symbol("pageIndex")] = 1;
            request[Symbol("pageSize")] = functions.ccxtruthy((limit == nothing)) ? 100 : limit;
            request[Symbol("startTime")] = functions.ccxtruthy((since == nothing)) ? 1 : since;
            until = safeInteger(params, "until", milliseconds());
            params = omit(params, "until");
            request[Symbol("endTime")] = until;
            response = Base.fetch(self.swapV1PrivateGetTwapHistoryOrders(extend(request, params)));
        elseif functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.cswapV1PrivateGetTradeOrderHistory(extend(request, params)));
        else
            response = Base.fetch(self.swapV2PrivateGetTradeAllOrders(extend(request, params)));
        end
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList2(data, "orders", "list", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
transfer currency internally between wallets on the same account
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Fund%20Account/Asset%20Transfer%20New

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from (spot, swap, futures, or funding)
- `toAccount`::string: account to transfer to (spot, swap (linear or inverse), future, or funding)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Bingx, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("transfer", market = nothing, params = params);
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    if functions.ccxtruthy(fromId == "swap")
        if functions.ccxtruthy(subType == "inverse")
            fromId = "coinMPerp";
        else
            fromId = "USDTMPerp";
        end
    end
    if functions.ccxtruthy(toId == "swap")
        if functions.ccxtruthy(subType == "inverse")
            toId = "coinMPerp";
        else
            toId = "USDTMPerp";
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("fromAccount") => fromId,
        Symbol("toAccount") => toId,
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.apiAssetV1PrivatePostTransfer(extend(request, params)));
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => safeString(response, "transferId"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => nothing
)

end
"""
fetch a history of internal transfers made on an account
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Fund%20Account/Asset%20transfer%20records%20new

# Arguments
- `code`::string, optional: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfers structures to retrieve (default 10, max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fromAccount`::string: (mandatory) transfer from (spot, swap (linear or inverse), future, or funding)
- `params.toAccount`::string: (mandatory) transfer to (spot, swap(linear or inverse), future, or funding)
- `params.paginate`::bool, optional: whether to paginate the results (default false)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Bingx; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    fromAccount = safeString(params, "fromAccount");
    toAccount = safeString(params, "toAccount");
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    if functions.ccxtruthy(@functions.ccxt_or(fromId == nothing, toId == nothing))
        throw(ExchangeError(string(self.id, " fromAccount & toAccount parameters are required")));
    end
    if functions.ccxtruthy(fromAccount != nothing)
        request[Symbol("fromAccount")] = fromId;
    end
    if functions.ccxtruthy(toAccount != nothing)
        request[Symbol("toAccount")] = toId;
    end
    params = omit(params, ["fromAccount", "toAccount"]);
    maxLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTransfers", symbol = nothing, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.apiV3PrivateGetAssetTransferRecord(extend(request, params)));
    rows = self.safeList(response, "rows", defaultValue = []);
    return self.parseTransfers(rows, currency = currency, since = since, limit = limit)

end
function parseTransfer(self::Bingx, transfer; currency=nothing)
    tranId = safeString(transfer, "transferId");
    timestamp = safeInteger(transfer, "timestamp");
    currencyId = safeString(transfer, "asset");
    currencyCode = self.safeCurrencyCode(currencyId, currency = currency);
    status = safeString(transfer, "status");
    accountsById = self.safeDict(self.options, "accountsById", defaultValue = Dict{Symbol, Any}());
    fromId = safeString(transfer, "fromAccount");
    toId = safeString(transfer, "toAccount");
    fromAccount = safeString(accountsById, fromId, fromId);
    toAccount = safeString(accountsById, toId, toId);
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => tranId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => currencyCode,
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => self.parseTransferStatus(status)
)

end
function parseTransferStatus(self::Bingx, status)
    statuses = Dict{Symbol, Any}(
        Symbol("CONFIRMED") => "ok"
    );
    return safeString(statuses, status, status)

end
"""
fetch the deposit addresses for a currency associated with this account
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Wallet%20Deposits%20and%20Withdrawals/Main%20Account%20Deposit%20Address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary [address structures]{@link https://docs.ccxt.com/?id=address-structure}, indexed by the network
"""
function fetchDepositAddressesByNetwork(self::Bingx, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    defaultRecvWindow = safeInteger(self.options, "recvWindow");
    recvWindow = safeInteger(params, "recvWindow", defaultRecvWindow);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("offset") => 0,
        Symbol("limit") => 1000,
        Symbol("recvWindow") => recvWindow
    );
    response = Base.fetch(self.walletsV1PrivateGetCapitalDepositAddress(extend(request, params)));
    data = self.safeList(self.safeDict(response, "data"), "data");
    parsed = self.parseDepositAddresses(data, codes = [get(currency, Symbol("code"), nothing)], indexed = false);
    return indexBy(parsed, "network")

end
"""
fetch the deposit address for a currency associated with this account
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Wallet%20Deposits%20and%20Withdrawals/Main%20Account%20Deposit%20Address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: The chain of currency. This only apply for multi-chain currency, and there is no need for single chain currency

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Bingx, code; params=Dict())
    network = safeString(params, "network");
    params = omit(params, ["network"]);
    addressStructures = Base.fetch(self.fetchDepositAddressesByNetwork(code, params = params));
    if functions.ccxtruthy(network != nothing)
            return self.safeDict(addressStructures, network)
    else
        options = self.safeDict(self.options, "defaultNetworks");
        defaultNetworkForCurrency = safeString(options, code);
        if functions.ccxtruthy(defaultNetworkForCurrency != nothing)
                return self.safeDict(addressStructures, defaultNetworkForCurrency)
        else
            keys_var = objectKeys(addressStructures);
            key = safeString(keys_var, 0);
            return self.safeDict(addressStructures, key)
        end
    end

end
function parseDepositAddress(self::Bingx, depositAddress; currency=nothing)
    tag = safeString(depositAddress, "tag");
    currencyId = safeString(depositAddress, "coin");
    currency = self.safeCurrency(currencyId, currency = currency);
    code = get(currency, Symbol("code"), nothing);
    address = safeString(depositAddress, "addressWithPrefix");
    networkId = safeString(depositAddress, "network");
    networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
    if functions.ccxtruthy(address != nothing)
        isPrefixed = @functions.ccxt_or(startswith(address, "0x"), startswith(address, "0X"));
        evmNetworks = ["BEP20", "BSC", "ERC20", "ETH", "HECO", "MATIC", "POLYGON", "ARBITRUM", "ARB", "OPTIMISM", "AVAXC", "BASE", "FTM", "LINEA", "ZKSYNC", "OPBNB"];
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isPrefixed), inArray(networkCode, evmNetworks)))
            address = string("0x", address);
        end
    end
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => networkCode,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
fetch all deposits made to an account
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Wallet%20deposits%20and%20withdrawals/Deposit%20records

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Bingx; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.spotV3PrivateGetCapitalDepositHisrec(extend(request, params)));
    return self.parseTransactions(response, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Wallet%20deposits%20and%20withdrawals/Withdraw%20records

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Bingx; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.spotV3PrivateGetCapitalWithdrawHistory(extend(request, params)));
    return self.parseTransactions(response, currency = currency, since = since, limit = limit)

end
function parseTransaction(self::Bingx, transaction; currency=nothing)
    data = safeValue(transaction, "data");
    dataId = functions.ccxtruthy((data == nothing)) ? nothing : safeString(data, "id");
    id = safeString(transaction, "id", dataId);
    address = safeString(transaction, "address");
    tag = safeString(transaction, "addressTag");
    timestamp = safeInteger2(transaction, "insertTime", "timestamp");
    datetime = self.iso8601(timestamp);
    if functions.ccxtruthy(timestamp == nothing)
        datetime = safeString(transaction, "applyTime");
        timestamp = self.parse8601(datetime);
    end
    network = safeString(transaction, "network");
    currencyId = safeString(transaction, "coin");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((code != nothing), (network != nothing)), (code != network)), findfirst(network, code) !== nothing))
        if functions.ccxtruthy(network != nothing)
            code = replace(code, network => "");
        end
    end
    rawType = safeString(transaction, "transferType");
    type_var = functions.ccxtruthy((rawType == "0")) ? "deposit" : "withdrawal";
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => safeString(transaction, "txId"),
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId = network, currencyCode = code),
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("address") => address,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => address,
    Symbol("tag") => tag,
    Symbol("tagFrom") => tag,
    Symbol("tagTo") => nothing,
    Symbol("updated") => nothing,
    Symbol("comment") => safeString(transaction, "info"),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.safeNumber(transaction, "transactionFee"),
        Symbol("rate") => nothing
    ),
    Symbol("internal") => nothing
)

end
function parseTransactionStatus(self::Bingx, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "pending",
        Symbol("1") => "ok",
        Symbol("10") => "pending",
        Symbol("20") => "rejected",
        Symbol("30") => "ok",
        Symbol("40") => "rejected",
        Symbol("50") => "ok",
        Symbol("60") => "pending",
        Symbol("70") => "rejected",
        Symbol("2") => "pending",
        Symbol("3") => "rejected",
        Symbol("4") => "pending",
        Symbol("5") => "rejected",
        Symbol("6") => "ok"
    );
    return safeString(statuses, status, status)

end
"""
set margin mode to 'cross' or 'isolated'
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Change%20Margin%20Type
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Set%20Margin%20Type

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setMarginMode(self::Bingx, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("type"), nothing) != "swap")
        throw(BadSymbol(string(self.id, " setMarginMode() supports swap contracts only")));
    end
    marginMode = uppercase(marginMode);
    if functions.ccxtruthy(marginMode == "CROSS")
        marginMode = "CROSSED";
    end
    if functions.ccxtruthy(@functions.ccxt_and(marginMode != "ISOLATED", marginMode != "CROSSED"))
        throw(BadRequest(string(self.id, " setMarginMode() marginMode argument should be isolated or cross")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginType") => marginMode
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("setMarginMode", market = market, params = params);
    if functions.ccxtruthy(subType == "inverse")
            return Base.fetch(self.cswapV1PrivatePostTradeMarginType(extend(request, params)))
    else
        return Base.fetch(self.swapV2PrivatePostTradeMarginType(extend(request, params)))
    end

end
function addMargin(self::Bingx, symbol, amount; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => 1
    );
    return Base.fetch(self.setMargin(symbol, amount, params = extend(request, params)))

end
function reduceMargin(self::Bingx, symbol, amount; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("type") => 2
    );
    return Base.fetch(self.setMargin(symbol, amount, params = extend(request, params)))

end
"""
Either adds or reduces margin in an isolated position in order to set the margin to a specific value
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Modify%20Isolated%20Position%20Margin

# Arguments
- `symbol`::string: unified market symbol of the market to set margin in
- `amount`::float: the amount to set the margin to
- `params`::object, optional: parameters specific to the exchange API endpoint

# Returns
- A [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function setMargin(self::Bingx, symbol, amount; params=Dict())
    type_var = safeInteger(params, "type");
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " setMargin() requires a type parameter either 1 (increase margin) or 2 (decrease margin)")));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(inArray(type_var, [1, 2])))
        throw(ArgumentsRequired(string(self.id, " setMargin() requires a type parameter either 1 (increase margin) or 2 (decrease margin)")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("amount") => self.amountToPrecision(get(market, Symbol("symbol"), nothing), amount),
        Symbol("type") => type_var
    );
    response = Base.fetch(self.swapV2PrivatePostTradePositionMargin(extend(request, params)));
    return self.parseMarginModification(response, market = market)

end
function parseMarginModification(self::Bingx, data; market=nothing)
    type_var = safeString(data, "type");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("type") => functions.ccxtruthy((type_var == "1")) ? "add" : "reduce",
    Symbol("marginMode") => "isolated",
    Symbol("amount") => self.safeNumber(data, "amount"),
    Symbol("total") => self.safeNumber(data, "margin"),
    Symbol("code") => safeString(market, "settle"),
    Symbol("status") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
fetch the set leverage for a market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Leverage%20and%20Available%20Positions
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Leverage

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Bingx, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.cswapV1PrivateGetTradeLeverage(extend(request, params)));
    else
        response = Base.fetch(self.swapV2PrivateGetTradeLeverage(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseLeverage(data, market = market)

end
function parseLeverage(self::Bingx, leverage; market=nothing)
    marketId = safeString(leverage, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("marginMode") => nothing,
    Symbol("longLeverage") => safeInteger(leverage, "longLeverage"),
    Symbol("shortLeverage") => safeInteger(leverage, "shortLeverage")
)

end
"""
set the level of leverage for a market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Set%20Leverage
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Modify%20Leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string, optional: hedged: ['long' or 'short']. one way: ['both']

# Returns
- response from the exchange
"""
function setLeverage(self::Bingx, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    side = safeStringUpper(params, "side");
    self.checkRequiredArgument("setLeverage", side, "side", options = ["LONG", "SHORT", "BOTH"]);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("leverage") => leverage
    );
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            return Base.fetch(self.cswapV1PrivatePostTradeLeverage(extend(request, params)))
    else
        return Base.fetch(self.swapV2PrivatePostTradeLeverage(extend(request, params)))
    end

end
"""
fetch all trades made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20transaction%20details
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20historical%20transaction%20orders
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Order%20Trade%20Detail

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is undefined
- `params.trandingUnit`::string: COIN (directly represent assets such as BTC and ETH) or CONT (represents the number of contract sheets)
- `params.orderId`::string: the order id required for inverse swap

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bingx; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMyTrades", market = market, params = params);
    if functions.ccxtruthy(subType == "inverse")
        orderId = safeString(params, "orderId");
        if functions.ccxtruthy(orderId == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires an orderId argument for inverse swap trades")));
        end
        response = Base.fetch(self.cswapV1PrivateGetTradeAllFillOrders(extend(request, params)));
        fills = self.safeList(response, "data", defaultValue = []);
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        now = milliseconds();
        if functions.ccxtruthy(since != nothing)
            startTimeReq = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "startTime" : "startTs";
            request[Symbol(startTimeReq)] = since;
        elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            request[Symbol("startTs")] = now - 30 * 24 * 60 * 60 * 1000;
        end
        until = safeInteger(params, "until");
        params = omit(params, "until");
        if functions.ccxtruthy(until != nothing)
            endTimeReq = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "endTime" : "endTs";
            request[Symbol(endTimeReq)] = until;
        elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            request[Symbol("endTs")] = now;
        end
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            if functions.ccxtruthy(limit != nothing)
                request[Symbol("limit")] = limit;
            end
            response = Base.fetch(self.spotV1PrivateGetTradeMyTrades(extend(request, params)));
            data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
            fills = self.safeList(data, "fills", defaultValue = []);
        else
            tradingUnit = safeStringUpper(params, "tradingUnit", "CONT");
            params = omit(params, "tradingUnit");
            request[Symbol("tradingUnit")] = tradingUnit;
            response = Base.fetch(self.swapV2PrivateGetTradeAllFillOrders(extend(request, params)));
            data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
            fills = self.safeList(data, "fill_orders", defaultValue = []);
        end
    end
    return self.parseTrades(fills, market = market, since = since, limit = limit, params = params)

end
function parseDepositWithdrawFee(self::Bingx, fee; currency=nothing)
    networks = self.safeDict(fee, "networks", defaultValue = Dict{Symbol, Any}());
    networkCodes = objectKeys(networks);
    networksLength = length(networkCodes);
    result = Dict{Symbol, Any}(
        Symbol("info") => networks,
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("fee") => nothing,
            Symbol("percentage") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("fee") => nothing,
            Symbol("percentage") => nothing
        ),
        Symbol("networks") => Dict{Symbol, Any}()
    );
    if functions.ccxtruthy(networksLength != 0)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, networksLength))
            networkCode = get(networkCodes, i + 1, nothing);
            network = get(networks, Symbol(networkCode), nothing);
            result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("fee") => nothing,
                    Symbol("percentage") => nothing
                ),
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("fee") => self.safeNumber(network, "fee"),
                    Symbol("percentage") => false
                )
            );
            if functions.ccxtruthy(networksLength == 1)
                result[Symbol("withdraw")][Symbol("fee")] = self.safeNumber(network, "withdrawFee");
                result[Symbol("withdraw")][Symbol("percentage")] = false;
            end
            i += 1
        end

    end
    return result

end
"""
fetch deposit and withdraw fees
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Wallet%20Deposits%20and%20Withdrawals/Query%20currency%20deposit%20and%20withdrawal%20data

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Bingx; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.fetchCurrencies(params = params));
    depositWithdrawFees = Dict{Symbol, Any}();
    responseCodes = objectKeys(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(responseCodes)))
        code = get(responseCodes, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_or((codes == nothing), (inArray(code, codes))))
            entry = get(response, Symbol(code), nothing);
            depositWithdrawFees[Symbol(code)] = self.parseDepositWithdrawFee(entry);
        end
        i += 1
    end
    return depositWithdrawFees

end
"""
make a withdrawal
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Wallet%20Deposits%20and%20Withdrawals/Withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.walletType`::int, optional: 1 fund (funding) account, 2 standard account, 3 perpetual account, 15 spot account

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Bingx, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    defaultWalletType = 15;
    walletType = nothing;
    (walletType, params) = self.handleOptionAndParams2(params, "withdraw", "type", "walletType", defaultValue = defaultWalletType);
    walletTypes = Dict{Symbol, Any}(
        Symbol("funding") => 1,
        Symbol("fund") => 1,
        Symbol("standard") => 2,
        Symbol("perpetual") => 3,
        Symbol("spot") => 15
    );
    walletType = safeInteger(walletTypes, walletType, defaultWalletType);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("walletType") => walletType
    );
    network = safeStringUpper(params, "network");
    if functions.ccxtruthy(network != nothing)
        request[Symbol("network")] = self.networkCodeToId(network, currencyCode = get(currency, Symbol("code"), nothing));
    end
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("addressTag")] = tag;
    end
    params = omit(params, ["walletType", "network"]);
    response = Base.fetch(self.walletsV1PrivatePostCapitalWithdrawApply(extend(request, params)));
    data = safeValue(response, "data");
    return self.parseTransaction(data)

end
function parseParams(self::Bingx, params)
    copied = clone(params);
    rawKeys = objectKeys(params);
    keys_var = sort(rawKeys);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        value = get(params, Symbol(key), nothing);
        if functions.ccxtruthy(functions.ccxt_isArray(value))
            arrStr = "[";
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(value)))
                arrayElement = get(value, j + 1, nothing);
                if functions.ccxtruthy(functions.ccxt_gt(j, 0))
                    arrStr += ",";
                end
                arrStr += string(arrayElement);
                j += 1
            end

            arrStr += "]";
            copied[Symbol(key)] = arrStr;
        end
        i += 1
    end
    return copied

end
"""
retrieves the users liquidated positions
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/User's%20Force%20Orders
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20force%20orders

# Arguments
- `symbol`::string, optional: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the bingx api endpoint
- `params.until`::int, optional: timestamp in ms of the latest liquidation

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
function fetchMyLiquidations(self::Bingx; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("autoCloseType") => "LIQUIDATION"
    );
    (request, params) = self.handleUntilOption("endTime", request, params);
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMyLiquidations", market = market, params = params);
    liquidations = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.cswapV1PrivateGetTradeForceOrders(extend(request, params)));
        liquidations = self.safeList(response, "data", defaultValue = []);
    else
        response = Base.fetch(self.swapV2PrivateGetTradeForceOrders(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        liquidations = self.safeList(data, "orders", defaultValue = []);
    end
    return self.parseLiquidations(liquidations, market = market, since = since, limit = limit)

end
function parseLiquidation(self::Bingx, liquidation; market=nothing)
    marketId = safeString(liquidation, "symbol");
    timestamp = safeInteger(liquidation, "time");
    contractsString = safeString(liquidation, "executedQty");
    contractSizeString = safeString(market, "contractSize");
    priceString = safeString(liquidation, "avgPrice");
    baseValueString = stringMul(contractsString, contractSizeString);
    quoteValueString = stringMul(baseValueString, priceString);
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("contracts") => self.parseNumber(contractsString),
    Symbol("contractSize") => self.parseNumber(contractSizeString),
    Symbol("price") => self.parseNumber(priceString),
    Symbol("baseValue") => self.parseNumber(baseValueString),
    Symbol("quoteValue") => self.parseNumber(quoteValueString),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
"""
closes open positions for a market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Close%20All%20Positions
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Close%20position%20by%20position%20ID
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Close%20all%20positions%20in%20bulk

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: not used by bingx
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::any, optional: the id of the position you would like to close

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function closePosition(self::Bingx, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    positionId = safeString(params, "positionId");
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(positionId != nothing)
        response = Base.fetch(self.swapV1PrivatePostTradeClosePosition(extend(request, params)));
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.cswapV1PrivatePostTradeCloseAllPositions(extend(request, params)));
        else
            response = Base.fetch(self.swapV2PrivatePostTradeCloseAllPositions(extend(request, params)));
        end
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
closes open positions for a market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Close%20All%20Positions
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Close%20all%20positions%20in%20bulk

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.recvWindow`::string, optional: request valid time window value

# Returns
- [a list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function closeAllPositions(self::Bingx; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    defaultRecvWindow = safeInteger(self.options, "recvWindow");
    recvWindow = safeInteger(params, "recvWindow", defaultRecvWindow);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("closeAllPositions", market = nothing, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("closeAllPositions", market = nothing, params = params);
    if functions.ccxtruthy(marketType == "margin")
        throw(BadRequest(string(self.id, " closePositions () cannot be used for ", marketType, " markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("recvWindow") => recvWindow
    );
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.cswapV1PrivatePostTradeCloseAllPositions(extend(request, params)));
    else
        response = Base.fetch(self.swapV2PrivatePostTradeCloseAllPositions(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    success = self.safeList(data, "success", defaultValue = []);
    positions = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(success)))
        position = self.parsePosition(Dict{Symbol, Any}(
            Symbol("positionId") => get(success, i + 1, nothing)
        ));
        push!(positions, position);
        i += 1
    end
    return positions

end
"""
fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20position%20mode

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
function fetchPositionMode(self::Bingx; symbol=nothing, params=Dict())
    response = Base.fetch(self.swapV1PrivateGetPositionSideDual(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    dualSidePosition = safeString(data, "dualSidePosition");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("hedged") => (dualSidePosition == "true")
)

end
"""
set hedged to true or false for a market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Set%20Position%20Mode

# Arguments
- `hedged`::bool: set to true to use dualSidePosition
- `symbol`::string: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setPositionMode(self::Bingx, hedged; symbol=nothing, params=Dict())
    dualSidePosition = nothing;
    if functions.ccxtruthy(hedged)
        dualSidePosition = "true";
    else
        dualSidePosition = "false";
    end
    request = Dict{Symbol, Any}(
        Symbol("dualSidePosition") => dualSidePosition
    );
    return Base.fetch(self.swapV1PrivatePostPositionSideDual(extend(request, params)))

end
"""
cancels an order and places a new order
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Cancel%20an%20Existing%20Order%20and%20Send%20a%20New%20Order  // spot
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20an%20Existing%20Order%20and%20Send%20a%20New%20Orde  // swap

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::string, optional: Trigger price used for TAKE_STOP_LIMIT, TAKE_STOP_MARKET, TRIGGER_LIMIT, TRIGGER_MARKET order types.
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price EXCHANGE SPECIFIC PARAMETERS
- `params.cancelClientOrderID`::string, optional: the user-defined id of the order to be canceled, 1-40 characters, different orders cannot use the same clientOrderID, only supports a query range of 2 hours
- `params.cancelRestrictions`::string, optional: cancel orders with specified status, NEW: New order, PENDING: Pending order, PARTIALLY_FILLED: Partially filled
- `params.cancelReplaceMode`::string, optional: STOP_ON_FAILURE - if the cancel order fails, it will not continue to place a new order, ALLOW_FAILURE - regardless of whether the cancel order succeeds or fails, it will continue to place a new order
- `params.quoteOrderQty`::float, optional: order amount
- `params.newClientOrderId`::string, optional: custom order id consisting of letters, numbers, and _, 1-40 characters, different orders cannot use the same newClientOrderId.
- `params.positionSide`::string, optional: *contract only* position direction, required for single position as BOTH, for both long and short positions only LONG or SHORT can be chosen, defaults to LONG if empty
- `params.reduceOnly`::string, optional: *contract only* true or false, default=false for single position mode. this parameter is not accepted for both long and short positions mode
- `params.priceRate`::float, optional: *contract only* for type TRAILING_STOP_Market or TRAILING_TP_SL, Max = 1
- `params.workingType`::string, optional: *contract only* StopPrice trigger price types, MARK_PRICE (default), CONTRACT_PRICE, or INDEX_PRICE

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Bingx, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    request[Symbol("cancelOrderId")] = id;
    request[Symbol("cancelReplaceMode")] = "STOP_ON_FAILURE";
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.swapV1PrivatePostTradeCancelReplace(request));
    else
        response = Base.fetch(self.spotV1PrivatePostTradeOrderCancelReplace(request));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
fetches the margin mode of the trading pair
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Margin%20Type
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Margin%20Type

# Arguments
- `symbol`::string: unified symbol of the market to fetch the margin mode for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginMode(self::Bingx, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMarginMode", market = market, params = params);
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.cswapV1PrivateGetTradeMarginType(extend(request, params)));
    else
        response = Base.fetch(self.swapV2PrivateGetTradeMarginType(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginMode(data, market = market)

end
function parseMarginMode(self::Bingx, marginMode; market=nothing)
    marketId = safeString(marginMode, "symbol");
    marginType = safeStringLower(marginMode, "marginType");
    marginType = functions.ccxtruthy((marginType == "crossed")) ? "cross" : marginType;
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = "-", marketType = "swap"),
    Symbol("marginMode") => marginType
)

end
"""
fetch the trading fees for a market
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20Trading%20Commission%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Query%20Trading%20Commission%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Trade%20Commission%20Rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Bingx, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    commission = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.spotV1PrivateGetUserCommissionRate(extend(request, params)));
        commission = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    else
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.cswapV1PrivateGetUserCommissionRate(params));
            commission = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        else
            response = Base.fetch(self.swapV2PrivateGetUserCommissionRate(params));
            data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
            commission = self.safeDict(data, "commission", defaultValue = Dict{Symbol, Any}());
        end
    end
    return self.parseTradingFee(commission, market = market)

end
function parseTradingFee(self::Bingx, fee; market=nothing)
    symbol = functions.ccxtruthy((market != nothing)) ? get(market, Symbol("symbol"), nothing) : nothing;
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "makerCommissionRate"),
    Symbol("taker") => self.safeNumber(fee, "takerCommissionRate"),
    Symbol("percentage") => false,
    Symbol("tierBased") => false
)

end
function customEncode(self::Bingx, params)
    rawKeys = objectKeys(params);
    keys_var = sort(rawKeys);
    adjustedValue = nothing;
    result = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        value = get(params, Symbol(key), nothing);
        if functions.ccxtruthy(functions.ccxt_isArray(value))
            arrStr = nothing;
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(value)))
                arrayElement = get(value, j + 1, nothing);
                isString = (isa(arrayElement, AbstractString));
                if functions.ccxtruthy(isString)
                    if functions.ccxtruthy(functions.ccxt_gt(j, 0))
                        arrStr += string(", ", "\"", arrayElement, "\"");
                    else
                        arrStr = string("\"", arrayElement, "\"");
                    end
                else
                    if functions.ccxtruthy(functions.ccxt_gt(j, 0))
                        arrStr += string(",", arrayElement);
                    else
                        arrStr = string(arrayElement);
                    end
                end
                j += 1
            end

            adjustedValue = string("[", arrStr, "]");
            value = adjustedValue;
        end
        if functions.ccxtruthy(i == 0)
            result = string(key, "=", value);
        else
            result += string("&", key, "=", value);
        end
        i += 1
    end
    return result

end
"""
retrieve information on the maximum leverage, for different trade sizes for a single market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Position%20and%20Maintenance%20Margin%20Ratio

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
function fetchMarketLeverageTiers(self::Bingx, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadRequest(string(self.id, " fetchMarketLeverageTiers() supports swap markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.swapV1PrivateGetMaintMarginRatio(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseMarketLeverageTiers(data, market = market)

end
function parseMarketLeverageTiers(self::Bingx, info; market=nothing)
    tiers = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(info)))
        tier = self.safeDict(info, i);
        tierString = safeString(tier, "tier");
        tierParts = split(tierString, " ");
        marketId = safeString(tier, "symbol");
        market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "swap");
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.safeNumber(tierParts, 1),
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("currency") => safeString(market, "settle"),
    Symbol("minNotional") => self.safeNumber(tier, "minPositionVal"),
    Symbol("maxNotional") => self.safeNumber(tier, "maxPositionVal"),
    Symbol("maintenanceMarginRate") => self.safeNumber(tier, "maintMarginRatio"),
    Symbol("maxLeverage") => nothing,
    Symbol("info") => tier
));
        i += 1
    end
    return tiers

end
function sign(self::Bingx, path; section="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    type_var = get(section, 1, nothing);
    version = get(section, 2, nothing);
    access = get(section, 3, nothing);
    isSandbox = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    url = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(type_var), nothing));
    if functions.ccxtruthy(@functions.ccxt_and(isSandbox, url == nothing))
        throw(NotSupported(string(self.id, " does not have a testnet/sandbox URL for ", type_var, " endpoints")));
    end
    path = self.implodeParams(path, params);
    versionIsTransfer = (version == "transfer");
    versionIsAsset = (version == "asset");
    if functions.ccxtruthy(@functions.ccxt_or(versionIsTransfer, versionIsAsset))
        if functions.ccxtruthy(versionIsTransfer)
            type_var = "account/transfer";
        else
            type_var = "api/asset";
        end
        version = get(section, 3, nothing);
        access = get(section, 4, nothing);
    end
    if functions.ccxtruthy(path != "account/apiPermissions")
        if functions.ccxtruthy(@functions.ccxt_and(type_var == "spot", version == "v3"))
            url += "/api";
        else
            url += string("/", type_var);
        end
    end
    url += string("/", version, "/", path);
    params = omit(params, self.extractParams(path));
    params[Symbol("timestamp")] = self.nonce();
    params = keysort(params);
    if functions.ccxtruthy(access == "public")
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    elseif functions.ccxtruthy(access == "private")
        self.checkRequiredCredentials();
        isJsonContentType = (@functions.ccxt_and((@functions.ccxt_or((type_var == "subAccount"), (type_var == "account/transfer"))), (method == "POST")));
        parsedParams = nothing;
        encodeRequest = nothing;
        if functions.ccxtruthy(isJsonContentType)
            encodeRequest = self.customEncode(params);
        else
            parsedParams = self.parseParams(params);
            encodeRequest = self.rawencode(parsedParams, true);
        end
        encodeRequestSafe = functions.ccxtruthy((encodeRequest == nothing)) ? "" : encodeRequest;
        signature = self.hmac(self.encode(encodeRequestSafe), self.encode(self.secret), sha256);
        headers = Dict{Symbol, Any}(
            Symbol("X-BX-APIKEY") => self.apiKey,
            Symbol("X-SOURCE-KEY") => safeString(self.options, "broker", "CCXT")
        );
        if functions.ccxtruthy(isJsonContentType)
            headers[Symbol("Content-Type")] = "application/json";
            params[Symbol("signature")] = signature;
            body = json(params);
        else
            query = self.urlencode(parsedParams, true);
            url += string("?", query, "&", "signature=", signature);
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function nonce(self::Bingx, )
    return milliseconds()

end
function setSandboxMode(self::Bingx, enable)
    setSandboxMode(self.parent, enable);
    self.options[Symbol("sandboxMode")] = enable;

end
function handleErrors(self::Bingx, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    code = safeString(response, "code");
    message = safeString(response, "msg");
    transferErrorMsg = safeString(response, "transferErrorMsg");
    if functions.ccxtruthy(@functions.ccxt_or((transferErrorMsg != nothing), (@functions.ccxt_and(code != nothing, code != "0"))))
        if functions.ccxtruthy(transferErrorMsg != nothing)
            message = transferErrorMsg;
        end
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bingx, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function fundV1PrivateGetAccountBalance(self::Bingx, params=Dict(), context=Dict())
    return request(self, "account/balance"; api=["fund", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PublicGetServerTime(self::Bingx, params=Dict(), context=Dict())
    return request(self, "server/time"; api=["spot", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PublicGetCommonSymbols(self::Bingx, params=Dict(), context=Dict())
    return request(self, "common/symbols"; api=["spot", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PublicGetMarketTrades(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/trades"; api=["spot", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PublicGetMarketDepth(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/depth"; api=["spot", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PublicGetMarketKline(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/kline"; api=["spot", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PublicGetTicker24hr(self::Bingx, params=Dict(), context=Dict())
    return request(self, "ticker/24hr"; api=["spot", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PublicGetTickerPrice(self::Bingx, params=Dict(), context=Dict())
    return request(self, "ticker/price"; api=["spot", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PublicGetTickerBookTicker(self::Bingx, params=Dict(), context=Dict())
    return request(self, "ticker/bookTicker"; api=["spot", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivateGetTradeQuery(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/query"; api=["spot", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivateGetTradeOpenOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/openOrders"; api=["spot", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivateGetTradeHistoryOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/historyOrders"; api=["spot", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivateGetTradeMyTrades(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/myTrades"; api=["spot", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivateGetUserCommissionRate(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/commissionRate"; api=["spot", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivateGetAccountBalance(self::Bingx, params=Dict(), context=Dict())
    return request(self, "account/balance"; api=["spot", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivateGetOcoOrderList(self::Bingx, params=Dict(), context=Dict())
    return request(self, "oco/orderList"; api=["spot", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivateGetOcoOpenOrderList(self::Bingx, params=Dict(), context=Dict())
    return request(self, "oco/openOrderList"; api=["spot", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivateGetOcoHistoryOrderList(self::Bingx, params=Dict(), context=Dict())
    return request(self, "oco/historyOrderList"; api=["spot", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivatePostTradeOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/order"; api=["spot", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivatePostTradeCancel(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/cancel"; api=["spot", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivatePostTradeBatchOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/batchOrders"; api=["spot", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivatePostTradeOrderCancelReplace(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/order/cancelReplace"; api=["spot", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivatePostTradeCancelOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/cancelOrders"; api=["spot", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivatePostTradeCancelOpenOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/cancelOpenOrders"; api=["spot", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivatePostTradeCancelAllAfter(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/cancelAllAfter"; api=["spot", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivatePostOcoOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "oco/order"; api=["spot", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV1PrivatePostOcoCancel(self::Bingx, params=Dict(), context=Dict())
    return request(self, "oco/cancel"; api=["spot", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV2PublicGetMarketDepth(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/depth"; api=["spot", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV2PublicGetMarketKline(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/kline"; api=["spot", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV2PublicGetTickerPrice(self::Bingx, params=Dict(), context=Dict())
    return request(self, "ticker/price"; api=["spot", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV3PrivateGetGetAssetTransfer(self::Bingx, params=Dict(), context=Dict())
    return request(self, "get/asset/transfer"; api=["spot", "v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV3PrivateGetAssetTransfer(self::Bingx, params=Dict(), context=Dict())
    return request(self, "asset/transfer"; api=["spot", "v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV3PrivateGetCapitalDepositHisrec(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/deposit/hisrec"; api=["spot", "v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV3PrivateGetCapitalWithdrawHistory(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/withdraw/history"; api=["spot", "v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function spotV3PrivatePostPostAssetTransfer(self::Bingx, params=Dict(), context=Dict())
    return request(self, "post/asset/transfer"; api=["spot", "v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PublicGetTickerPrice(self::Bingx, params=Dict(), context=Dict())
    return request(self, "ticker/price"; api=["swap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PublicGetMarketHistoricalTrades(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/historicalTrades"; api=["swap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PublicGetMarketMarkPriceKlines(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/markPriceKlines"; api=["swap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PublicGetTradeMultiAssetsRules(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/multiAssetsRules"; api=["swap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PublicGetTradingRules(self::Bingx, params=Dict(), context=Dict())
    return request(self, "tradingRules"; api=["swap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetPositionSideDual(self::Bingx, params=Dict(), context=Dict())
    return request(self, "positionSide/dual"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetTradeBatchCancelReplace(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/batchCancelReplace"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetTradeFullOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/fullOrder"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetMaintMarginRatio(self::Bingx, params=Dict(), context=Dict())
    return request(self, "maintMarginRatio"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetTradePositionHistory(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/positionHistory"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetPositionMarginHistory(self::Bingx, params=Dict(), context=Dict())
    return request(self, "positionMargin/history"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetTwapOpenOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "twap/openOrders"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetTwapHistoryOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "twap/historyOrders"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetTwapOrderDetail(self::Bingx, params=Dict(), context=Dict())
    return request(self, "twap/orderDetail"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetTradeAssetMode(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/assetMode"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivateGetUserMarginAssets(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/marginAssets"; api=["swap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostTradeAmend(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/amend"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostTradeCancelReplace(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/cancelReplace"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostPositionSideDual(self::Bingx, params=Dict(), context=Dict())
    return request(self, "positionSide/dual"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostTradeBatchCancelReplace(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/batchCancelReplace"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostTradeClosePosition(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/closePosition"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostTradeGetVst(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/getVst"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostTwapOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "twap/order"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostTwapCancelOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "twap/cancelOrder"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostTradeAssetMode(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/assetMode"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostTradeReverse(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/reverse"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV1PrivatePostTradeAutoAddMargin(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/autoAddMargin"; api=["swap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetServerTime(self::Bingx, params=Dict(), context=Dict())
    return request(self, "server/time"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetQuoteContracts(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/contracts"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetQuotePrice(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/price"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetQuoteDepth(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/depth"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetQuoteTrades(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/trades"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetQuotePremiumIndex(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/premiumIndex"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetQuoteFundingRate(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/fundingRate"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetQuoteKlines(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/klines"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetQuoteOpenInterest(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/openInterest"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetQuoteTicker(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/ticker"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PublicGetQuoteBookTicker(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/bookTicker"; api=["swap", "v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetUserBalance(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/balance"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetUserPositions(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/positions"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetUserIncome(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/income"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetTradeOpenOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/openOrders"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetTradeOpenOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/openOrder"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetTradeOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/order"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetTradeMarginType(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/marginType"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetTradeLeverage(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/leverage"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetTradeForceOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/forceOrders"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetTradeAllOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/allOrders"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetTradeAllFillOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/allFillOrders"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetTradeFillHistory(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/fillHistory"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetUserIncomeExport(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/income/export"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetUserCommissionRate(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/commissionRate"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateGetQuoteBookTicker(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/bookTicker"; api=["swap", "v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivatePostTradeGetVst(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/getVst"; api=["swap", "v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivatePostTradeOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/order"; api=["swap", "v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivatePostTradeBatchOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/batchOrders"; api=["swap", "v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivatePostTradeCloseAllPositions(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/closeAllPositions"; api=["swap", "v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivatePostTradeCancelAllAfter(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/cancelAllAfter"; api=["swap", "v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivatePostTradeMarginType(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/marginType"; api=["swap", "v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivatePostTradeLeverage(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/leverage"; api=["swap", "v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivatePostTradePositionMargin(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/positionMargin"; api=["swap", "v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivatePostTradeOrderTest(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/order/test"; api=["swap", "v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateDeleteTradeOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/order"; api=["swap", "v2", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateDeleteTradeBatchOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/batchOrders"; api=["swap", "v2", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV2PrivateDeleteTradeAllOpenOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/allOpenOrders"; api=["swap", "v2", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV3PublicGetQuoteKlines(self::Bingx, params=Dict(), context=Dict())
    return request(self, "quote/klines"; api=["swap", "v3", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function swapV3PrivateGetUserBalance(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/balance"; api=["swap", "v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PublicGetMarketContracts(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/contracts"; api=["cswap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PublicGetMarketPremiumIndex(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/premiumIndex"; api=["cswap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PublicGetMarketOpenInterest(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/openInterest"; api=["cswap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PublicGetMarketKlines(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/klines"; api=["cswap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PublicGetMarketDepth(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/depth"; api=["cswap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PublicGetMarketTicker(self::Bingx, params=Dict(), context=Dict())
    return request(self, "market/ticker"; api=["cswap", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateGetTradeLeverage(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/leverage"; api=["cswap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateGetTradeForceOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/forceOrders"; api=["cswap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateGetTradeAllFillOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/allFillOrders"; api=["cswap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateGetTradeOpenOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/openOrders"; api=["cswap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateGetTradeOrderDetail(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/orderDetail"; api=["cswap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateGetTradeOrderHistory(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/orderHistory"; api=["cswap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateGetTradeMarginType(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/marginType"; api=["cswap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateGetUserCommissionRate(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/commissionRate"; api=["cswap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateGetUserPositions(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/positions"; api=["cswap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateGetUserBalance(self::Bingx, params=Dict(), context=Dict())
    return request(self, "user/balance"; api=["cswap", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivatePostTradeOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/order"; api=["cswap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivatePostTradeLeverage(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/leverage"; api=["cswap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivatePostTradeAllOpenOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/allOpenOrders"; api=["cswap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivatePostTradeCloseAllPositions(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/closeAllPositions"; api=["cswap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivatePostTradeMarginType(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/marginType"; api=["cswap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivatePostTradePositionMargin(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/positionMargin"; api=["cswap", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateDeleteTradeAllOpenOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/allOpenOrders"; api=["cswap", "v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function cswapV1PrivateDeleteTradeCancelOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "trade/cancelOrder"; api=["cswap", "v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractV1PrivateGetAllPosition(self::Bingx, params=Dict(), context=Dict())
    return request(self, "allPosition"; api=["contract", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractV1PrivateGetAllOrders(self::Bingx, params=Dict(), context=Dict())
    return request(self, "allOrders"; api=["contract", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function contractV1PrivateGetBalance(self::Bingx, params=Dict(), context=Dict())
    return request(self, "balance"; api=["contract", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivateGetCapitalConfigGetall(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/config/getall"; api=["wallets", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivateGetCapitalDepositAddress(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/deposit/address"; api=["wallets", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivateGetCapitalInnerTransferRecords(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/innerTransfer/records"; api=["wallets", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivateGetCapitalSubAccountDepositAddress(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/subAccount/deposit/address"; api=["wallets", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivateGetCapitalDepositSubHisrec(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/deposit/subHisrec"; api=["wallets", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivateGetCapitalSubAccountInnerTransferRecords(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/subAccount/innerTransfer/records"; api=["wallets", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivateGetCapitalDepositRiskRecords(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/deposit/riskRecords"; api=["wallets", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivatePostCapitalWithdrawApply(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/withdraw/apply"; api=["wallets", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivatePostCapitalInnerTransferApply(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/innerTransfer/apply"; api=["wallets", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivatePostCapitalSubAccountInnerTransferApply(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/subAccountInnerTransfer/apply"; api=["wallets", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function walletsV1PrivatePostCapitalDepositCreateSubAddress(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/deposit/createSubAddress"; api=["wallets", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function subAccountV1PrivateGetList(self::Bingx, params=Dict(), context=Dict())
    return request(self, "list"; api=["subAccount", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function subAccountV1PrivateGetAssets(self::Bingx, params=Dict(), context=Dict())
    return request(self, "assets"; api=["subAccount", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function subAccountV1PrivateGetAllAccountBalance(self::Bingx, params=Dict(), context=Dict())
    return request(self, "allAccountBalance"; api=["subAccount", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function subAccountV1PrivatePostCreate(self::Bingx, params=Dict(), context=Dict())
    return request(self, "create"; api=["subAccount", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function subAccountV1PrivatePostApiKeyCreate(self::Bingx, params=Dict(), context=Dict())
    return request(self, "apiKey/create"; api=["subAccount", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function subAccountV1PrivatePostApiKeyEdit(self::Bingx, params=Dict(), context=Dict())
    return request(self, "apiKey/edit"; api=["subAccount", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function subAccountV1PrivatePostApiKeyDel(self::Bingx, params=Dict(), context=Dict())
    return request(self, "apiKey/del"; api=["subAccount", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function subAccountV1PrivatePostUpdateStatus(self::Bingx, params=Dict(), context=Dict())
    return request(self, "updateStatus"; api=["subAccount", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function accountV1PrivateGetUid(self::Bingx, params=Dict(), context=Dict())
    return request(self, "uid"; api=["account", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function accountV1PrivateGetApiKeyQuery(self::Bingx, params=Dict(), context=Dict())
    return request(self, "apiKey/query"; api=["account", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function accountV1PrivateGetAccountApiPermissions(self::Bingx, params=Dict(), context=Dict())
    return request(self, "account/apiPermissions"; api=["account", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function accountV1PrivateGetAllAccountBalance(self::Bingx, params=Dict(), context=Dict())
    return request(self, "allAccountBalance"; api=["account", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function accountV1PrivatePostInnerTransferAuthorizeSubAccount(self::Bingx, params=Dict(), context=Dict())
    return request(self, "innerTransfer/authorizeSubAccount"; api=["account", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function accountTransferV1PrivateGetSubAccountAssetTransferHistory(self::Bingx, params=Dict(), context=Dict())
    return request(self, "subAccount/asset/transferHistory"; api=["account", "transfer", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function accountTransferV1PrivatePostSubAccountTransferAssetSupportCoins(self::Bingx, params=Dict(), context=Dict())
    return request(self, "subAccount/transferAsset/supportCoins"; api=["account", "transfer", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function accountTransferV1PrivatePostSubAccountTransferAsset(self::Bingx, params=Dict(), context=Dict())
    return request(self, "subAccount/transferAsset"; api=["account", "transfer", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function userAuthPrivatePostUserDataStream(self::Bingx, params=Dict(), context=Dict())
    return request(self, "userDataStream"; api=["user", "auth", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function userAuthPrivatePutUserDataStream(self::Bingx, params=Dict(), context=Dict())
    return request(self, "userDataStream"; api=["user", "auth", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function userAuthPrivateDeleteUserDataStream(self::Bingx, params=Dict(), context=Dict())
    return request(self, "userDataStream"; api=["user", "auth", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivateGetSwapTraceCurrentTrack(self::Bingx, params=Dict(), context=Dict())
    return request(self, "swap/trace/currentTrack"; api=["copyTrading", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivateGetPFuturesTraderDetail(self::Bingx, params=Dict(), context=Dict())
    return request(self, "PFutures/traderDetail"; api=["copyTrading", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivateGetPFuturesProfitHistorySummarys(self::Bingx, params=Dict(), context=Dict())
    return request(self, "PFutures/profitHistorySummarys"; api=["copyTrading", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivateGetPFuturesProfitDetail(self::Bingx, params=Dict(), context=Dict())
    return request(self, "PFutures/profitDetail"; api=["copyTrading", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivateGetPFuturesTradingPairs(self::Bingx, params=Dict(), context=Dict())
    return request(self, "PFutures/tradingPairs"; api=["copyTrading", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivateGetSpotTraderDetail(self::Bingx, params=Dict(), context=Dict())
    return request(self, "spot/traderDetail"; api=["copyTrading", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivateGetSpotProfitHistorySummarys(self::Bingx, params=Dict(), context=Dict())
    return request(self, "spot/profitHistorySummarys"; api=["copyTrading", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivateGetSpotProfitDetail(self::Bingx, params=Dict(), context=Dict())
    return request(self, "spot/profitDetail"; api=["copyTrading", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivateGetSpotHistoryOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "spot/historyOrder"; api=["copyTrading", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivatePostSwapTraceCloseTrackOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "swap/trace/closeTrackOrder"; api=["copyTrading", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivatePostSwapTraceSetTPSL(self::Bingx, params=Dict(), context=Dict())
    return request(self, "swap/trace/setTPSL"; api=["copyTrading", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivatePostPFuturesSetCommission(self::Bingx, params=Dict(), context=Dict())
    return request(self, "PFutures/setCommission"; api=["copyTrading", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function copyTradingV1PrivatePostSpotTraderSellOrder(self::Bingx, params=Dict(), context=Dict())
    return request(self, "spot/trader/sellOrder"; api=["copyTrading", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function apiV3PrivateGetAssetTransfer(self::Bingx, params=Dict(), context=Dict())
    return request(self, "asset/transfer"; api=["api", "v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function apiV3PrivateGetAssetTransferRecord(self::Bingx, params=Dict(), context=Dict())
    return request(self, "asset/transferRecord"; api=["api", "v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function apiV3PrivateGetCapitalDepositHisrec(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/deposit/hisrec"; api=["api", "v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function apiV3PrivateGetCapitalWithdrawHistory(self::Bingx, params=Dict(), context=Dict())
    return request(self, "capital/withdraw/history"; api=["api", "v3", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function apiV3PrivatePostPostAssetTransfer(self::Bingx, params=Dict(), context=Dict())
    return request(self, "post/asset/transfer"; api=["api", "v3", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function apiAssetV1PrivatePostTransfer(self::Bingx, params=Dict(), context=Dict())
    return request(self, "transfer"; api=["api", "asset", "v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function apiAssetV1PublicGetTransferSupportCoins(self::Bingx, params=Dict(), context=Dict())
    return request(self, "transfer/supportCoins"; api=["api", "asset", "v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function agentV1PrivateGetAccountInviteAccountList(self::Bingx, params=Dict(), context=Dict())
    return request(self, "account/inviteAccountList"; api=["agent", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function agentV1PrivateGetRewardCommissionDataList(self::Bingx, params=Dict(), context=Dict())
    return request(self, "reward/commissionDataList"; api=["agent", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function agentV1PrivateGetAccountInviteRelationCheck(self::Bingx, params=Dict(), context=Dict())
    return request(self, "account/inviteRelationCheck"; api=["agent", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function agentV1PrivateGetAssetDepositDetailList(self::Bingx, params=Dict(), context=Dict())
    return request(self, "asset/depositDetailList"; api=["agent", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function agentV1PrivateGetRewardThirdCommissionDataList(self::Bingx, params=Dict(), context=Dict())
    return request(self, "reward/third/commissionDataList"; api=["agent", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function agentV1PrivateGetAssetPartnerData(self::Bingx, params=Dict(), context=Dict())
    return request(self, "asset/partnerData"; api=["agent", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function agentV1PrivateGetCommissionDataListReferralCode(self::Bingx, params=Dict(), context=Dict())
    return request(self, "commissionDataList/referralCode"; api=["agent", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function agentV1PrivateGetAccountSuperiorCheck(self::Bingx, params=Dict(), context=Dict())
    return request(self, "account/superiorCheck"; api=["agent", "v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bingx(; kwargs...)
    inst = Bingx(Exchange(), describe, fetchTime, fetchCurrencies, parseCurrency, fetchSpotMarkets, fetchSwapMarkets, fetchInverseSwapMarkets, parseMarket, fetchMarkets, fetchOHLCV, parseOHLCV, fetchTrades, parseTrade, fetchOrderBook, fetchFundingRate, fetchFundingRates, parseFundingRate, fetchFundingRateHistory, parseFundingRateHistory, fetchFundingHistory, parseIncome, fetchOpenInterest, parseOpenInterest, fetchTicker, fetchTickers, fetchMarkPrice, fetchMarkPrices, parseTicker, fetchBalance, parseBalance, fetchPositionHistory, fetchPositions, fetchPosition, parsePosition, createMarketOrderWithCost, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, createOrderRequest, createOrder, createOrders, parseOrderSide, parseOrderType, parseOrder, parseOrderStatus, cancelOrder, cancelAllOrders, cancelOrders, cancelAllOrdersAfter, fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchCanceledAndClosedOrders, transfer, fetchTransfers, parseTransfer, parseTransferStatus, fetchDepositAddressesByNetwork, fetchDepositAddress, parseDepositAddress, fetchDeposits, fetchWithdrawals, parseTransaction, parseTransactionStatus, setMarginMode, addMargin, reduceMargin, setMargin, parseMarginModification, fetchLeverage, parseLeverage, setLeverage, fetchMyTrades, parseDepositWithdrawFee, fetchDepositWithdrawFees, withdraw, parseParams, fetchMyLiquidations, parseLiquidation, closePosition, closeAllPositions, fetchPositionMode, setPositionMode, editOrder, fetchMarginMode, parseMarginMode, fetchTradingFee, parseTradingFee, customEncode, fetchMarketLeverageTiers, parseMarketLeverageTiers, sign, nonce, setSandboxMode, handleErrors, fundV1PrivateGetAccountBalance, spotV1PublicGetServerTime, spotV1PublicGetCommonSymbols, spotV1PublicGetMarketTrades, spotV1PublicGetMarketDepth, spotV1PublicGetMarketKline, spotV1PublicGetTicker24hr, spotV1PublicGetTickerPrice, spotV1PublicGetTickerBookTicker, spotV1PrivateGetTradeQuery, spotV1PrivateGetTradeOpenOrders, spotV1PrivateGetTradeHistoryOrders, spotV1PrivateGetTradeMyTrades, spotV1PrivateGetUserCommissionRate, spotV1PrivateGetAccountBalance, spotV1PrivateGetOcoOrderList, spotV1PrivateGetOcoOpenOrderList, spotV1PrivateGetOcoHistoryOrderList, spotV1PrivatePostTradeOrder, spotV1PrivatePostTradeCancel, spotV1PrivatePostTradeBatchOrders, spotV1PrivatePostTradeOrderCancelReplace, spotV1PrivatePostTradeCancelOrders, spotV1PrivatePostTradeCancelOpenOrders, spotV1PrivatePostTradeCancelAllAfter, spotV1PrivatePostOcoOrder, spotV1PrivatePostOcoCancel, spotV2PublicGetMarketDepth, spotV2PublicGetMarketKline, spotV2PublicGetTickerPrice, spotV3PrivateGetGetAssetTransfer, spotV3PrivateGetAssetTransfer, spotV3PrivateGetCapitalDepositHisrec, spotV3PrivateGetCapitalWithdrawHistory, spotV3PrivatePostPostAssetTransfer, swapV1PublicGetTickerPrice, swapV1PublicGetMarketHistoricalTrades, swapV1PublicGetMarketMarkPriceKlines, swapV1PublicGetTradeMultiAssetsRules, swapV1PublicGetTradingRules, swapV1PrivateGetPositionSideDual, swapV1PrivateGetTradeBatchCancelReplace, swapV1PrivateGetTradeFullOrder, swapV1PrivateGetMaintMarginRatio, swapV1PrivateGetTradePositionHistory, swapV1PrivateGetPositionMarginHistory, swapV1PrivateGetTwapOpenOrders, swapV1PrivateGetTwapHistoryOrders, swapV1PrivateGetTwapOrderDetail, swapV1PrivateGetTradeAssetMode, swapV1PrivateGetUserMarginAssets, swapV1PrivatePostTradeAmend, swapV1PrivatePostTradeCancelReplace, swapV1PrivatePostPositionSideDual, swapV1PrivatePostTradeBatchCancelReplace, swapV1PrivatePostTradeClosePosition, swapV1PrivatePostTradeGetVst, swapV1PrivatePostTwapOrder, swapV1PrivatePostTwapCancelOrder, swapV1PrivatePostTradeAssetMode, swapV1PrivatePostTradeReverse, swapV1PrivatePostTradeAutoAddMargin, swapV2PublicGetServerTime, swapV2PublicGetQuoteContracts, swapV2PublicGetQuotePrice, swapV2PublicGetQuoteDepth, swapV2PublicGetQuoteTrades, swapV2PublicGetQuotePremiumIndex, swapV2PublicGetQuoteFundingRate, swapV2PublicGetQuoteKlines, swapV2PublicGetQuoteOpenInterest, swapV2PublicGetQuoteTicker, swapV2PublicGetQuoteBookTicker, swapV2PrivateGetUserBalance, swapV2PrivateGetUserPositions, swapV2PrivateGetUserIncome, swapV2PrivateGetTradeOpenOrders, swapV2PrivateGetTradeOpenOrder, swapV2PrivateGetTradeOrder, swapV2PrivateGetTradeMarginType, swapV2PrivateGetTradeLeverage, swapV2PrivateGetTradeForceOrders, swapV2PrivateGetTradeAllOrders, swapV2PrivateGetTradeAllFillOrders, swapV2PrivateGetTradeFillHistory, swapV2PrivateGetUserIncomeExport, swapV2PrivateGetUserCommissionRate, swapV2PrivateGetQuoteBookTicker, swapV2PrivatePostTradeGetVst, swapV2PrivatePostTradeOrder, swapV2PrivatePostTradeBatchOrders, swapV2PrivatePostTradeCloseAllPositions, swapV2PrivatePostTradeCancelAllAfter, swapV2PrivatePostTradeMarginType, swapV2PrivatePostTradeLeverage, swapV2PrivatePostTradePositionMargin, swapV2PrivatePostTradeOrderTest, swapV2PrivateDeleteTradeOrder, swapV2PrivateDeleteTradeBatchOrders, swapV2PrivateDeleteTradeAllOpenOrders, swapV3PublicGetQuoteKlines, swapV3PrivateGetUserBalance, cswapV1PublicGetMarketContracts, cswapV1PublicGetMarketPremiumIndex, cswapV1PublicGetMarketOpenInterest, cswapV1PublicGetMarketKlines, cswapV1PublicGetMarketDepth, cswapV1PublicGetMarketTicker, cswapV1PrivateGetTradeLeverage, cswapV1PrivateGetTradeForceOrders, cswapV1PrivateGetTradeAllFillOrders, cswapV1PrivateGetTradeOpenOrders, cswapV1PrivateGetTradeOrderDetail, cswapV1PrivateGetTradeOrderHistory, cswapV1PrivateGetTradeMarginType, cswapV1PrivateGetUserCommissionRate, cswapV1PrivateGetUserPositions, cswapV1PrivateGetUserBalance, cswapV1PrivatePostTradeOrder, cswapV1PrivatePostTradeLeverage, cswapV1PrivatePostTradeAllOpenOrders, cswapV1PrivatePostTradeCloseAllPositions, cswapV1PrivatePostTradeMarginType, cswapV1PrivatePostTradePositionMargin, cswapV1PrivateDeleteTradeAllOpenOrders, cswapV1PrivateDeleteTradeCancelOrder, contractV1PrivateGetAllPosition, contractV1PrivateGetAllOrders, contractV1PrivateGetBalance, walletsV1PrivateGetCapitalConfigGetall, walletsV1PrivateGetCapitalDepositAddress, walletsV1PrivateGetCapitalInnerTransferRecords, walletsV1PrivateGetCapitalSubAccountDepositAddress, walletsV1PrivateGetCapitalDepositSubHisrec, walletsV1PrivateGetCapitalSubAccountInnerTransferRecords, walletsV1PrivateGetCapitalDepositRiskRecords, walletsV1PrivatePostCapitalWithdrawApply, walletsV1PrivatePostCapitalInnerTransferApply, walletsV1PrivatePostCapitalSubAccountInnerTransferApply, walletsV1PrivatePostCapitalDepositCreateSubAddress, subAccountV1PrivateGetList, subAccountV1PrivateGetAssets, subAccountV1PrivateGetAllAccountBalance, subAccountV1PrivatePostCreate, subAccountV1PrivatePostApiKeyCreate, subAccountV1PrivatePostApiKeyEdit, subAccountV1PrivatePostApiKeyDel, subAccountV1PrivatePostUpdateStatus, accountV1PrivateGetUid, accountV1PrivateGetApiKeyQuery, accountV1PrivateGetAccountApiPermissions, accountV1PrivateGetAllAccountBalance, accountV1PrivatePostInnerTransferAuthorizeSubAccount, accountTransferV1PrivateGetSubAccountAssetTransferHistory, accountTransferV1PrivatePostSubAccountTransferAssetSupportCoins, accountTransferV1PrivatePostSubAccountTransferAsset, userAuthPrivatePostUserDataStream, userAuthPrivatePutUserDataStream, userAuthPrivateDeleteUserDataStream, copyTradingV1PrivateGetSwapTraceCurrentTrack, copyTradingV1PrivateGetPFuturesTraderDetail, copyTradingV1PrivateGetPFuturesProfitHistorySummarys, copyTradingV1PrivateGetPFuturesProfitDetail, copyTradingV1PrivateGetPFuturesTradingPairs, copyTradingV1PrivateGetSpotTraderDetail, copyTradingV1PrivateGetSpotProfitHistorySummarys, copyTradingV1PrivateGetSpotProfitDetail, copyTradingV1PrivateGetSpotHistoryOrder, copyTradingV1PrivatePostSwapTraceCloseTrackOrder, copyTradingV1PrivatePostSwapTraceSetTPSL, copyTradingV1PrivatePostPFuturesSetCommission, copyTradingV1PrivatePostSpotTraderSellOrder, apiV3PrivateGetAssetTransfer, apiV3PrivateGetAssetTransferRecord, apiV3PrivateGetCapitalDepositHisrec, apiV3PrivateGetCapitalWithdrawHistory, apiV3PrivatePostPostAssetTransfer, apiAssetV1PrivatePostTransfer, apiAssetV1PublicGetTransferSupportCoins, agentV1PrivateGetAccountInviteAccountList, agentV1PrivateGetRewardCommissionDataList, agentV1PrivateGetAccountInviteRelationCheck, agentV1PrivateGetAssetDepositDetailList, agentV1PrivateGetRewardThirdCommissionDataList, agentV1PrivateGetAssetPartnerData, agentV1PrivateGetCommissionDataListReferralCode, agentV1PrivateGetAccountSuperiorCheck)
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
function __ccxt_doc_Bingx_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the bingx server
see: https://bingx-api.github.io/docs/#/swapV2/base-info.html#Get%20Server%20Time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the bingx server
"""
__ccxt_doc_Bingx_fetchTime

function __ccxt_doc_Bingx_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Wallet%20Deposits%20and%20Withdrawals/Query%20currency%20deposit%20and%20withdrawal%20data

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bingx_fetchCurrencies

function __ccxt_doc_Bingx_fetchMarkets() end
"""
retrieves data on all markets for bingx
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/Spot%20trading%20symbols
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/USDT-M%20Perp%20Futures%20symbols
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Contract%20Information

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bingx_fetchMarkets

function __ccxt_doc_Bingx_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/Kline%2FCandlestick%20Data
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Kline%2FCandlestick%20Data
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Mark%20Price%20Kline%2FCandlestick%20Data
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Get%20K-line%20Data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bingx_fetchOHLCV

function __ccxt_doc_Bingx_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/Recent%20Trades%20List
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Recent%20Trades%20List

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bingx_fetchTrades

function __ccxt_doc_Bingx_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/Order%20Book
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Order%20Book
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Query%20Depth%20Data

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bingx_fetchOrderBook

function __ccxt_doc_Bingx_fetchFundingRate() end
"""
fetch the current funding rate
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Mark%20Price%20and%20Funding%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Price%20%26%20Current%20Funding%20Rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Bingx_fetchFundingRate

function __ccxt_doc_Bingx_fetchFundingRates() end
"""
fetch the current funding rate for multiple symbols
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Mark%20Price%20and%20Funding%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Price%20%26%20Current%20Funding%20Rate

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse" (default is linear)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Bingx_fetchFundingRates

function __ccxt_doc_Bingx_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Get%20Funding%20Rate%20History

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Bingx_fetchFundingRateHistory

function __ccxt_doc_Bingx_fetchFundingHistory() end
"""
fetches historical funding received
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Get%20Account%20Profit%20and%20Loss%20Fund%20Flow

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding history for
- `since`::int, optional: timestamp in ms of the earliest funding to fetch
- `limit`::int, optional: the maximum amount of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding to fetch

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Bingx_fetchFundingHistory

function __ccxt_doc_Bingx_fetchOpenInterest() end
"""
retrieves the open interest of a trading pair
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Open%20Interest%20Statistics
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Get%20Swap%20Open%20Positions

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Bingx_fetchOpenInterest

function __ccxt_doc_Bingx_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/24hr%20Ticker%20Price%20Change%20Statistics
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/24hr%20Ticker%20Price%20Change%20Statistics
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Query%2024-Hour%20Price%20Change

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bingx_fetchTicker

function __ccxt_doc_Bingx_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Market%20Data/24hr%20Ticker%20Price%20Change%20Statistics
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/24hr%20Ticker%20Price%20Change%20Statistics
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Query%2024-Hour%20Price%20Change

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bingx_fetchTickers

function __ccxt_doc_Bingx_fetchMarkPrice() end
"""
fetches mark prices for the market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Mark%20Price%20and%20Funding%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Price%20%26%20Current%20Funding%20Rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bingx_fetchMarkPrice

function __ccxt_doc_Bingx_fetchMarkPrices() end
"""
fetches mark prices for multiple markets
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Market%20Data/Mark%20Price%20and%20Funding%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Market%20Data/Price%20%26%20Current%20Funding%20Rate

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bingx_fetchMarkPrices

function __ccxt_doc_Bingx_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Account%20Endpoints/Query%20Assets
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Query%20account%20data
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Account%20Assets
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Fund%20Account/Query%20Assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.standard`::bool, optional: whether to fetch standard contract balances
- `params.type`::string, optional: the type of balance to fetch (spot, swap, funding) default is `spot`

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bingx_fetchBalance

function __ccxt_doc_Bingx_fetchPositionHistory() end
"""
fetches historical positions
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Position%20History

# Arguments
- `symbol`::string: unified contract symbol
- `since`::int, optional: the earliest time in ms to fetch positions for
- `limit`::int, optional: the maximum amount of records to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch positions for

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bingx_fetchPositionHistory

function __ccxt_doc_Bingx_fetchPositions() end
"""
fetch all open positions
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Query%20position%20data
see: https://bingx-api.github.io/docs/#/en-us/standard/contract-interface.html#position
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20warehouse

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.standard`::bool, optional: whether to fetch standard contract positions

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bingx_fetchPositions

function __ccxt_doc_Bingx_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Query%20position%20data
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20warehouse

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bingx_fetchPosition

function __ccxt_doc_Bingx_createMarketOrderWithCost() end
"""
create a market order by providing the symbol, side and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_createMarketOrderWithCost

function __ccxt_doc_Bingx_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_createMarketBuyOrderWithCost

function __ccxt_doc_Bingx_createMarketSellOrderWithCost() end
"""
create a market sell order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_createMarketSellOrderWithCost

function __ccxt_doc_Bingx_createOrder() end
"""
create a trade order
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Place%20order
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Place%20order
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Place%20TWAP%20Order
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Trade%20order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order
- `params.postOnly`::bool, optional: true to place a post only order
- `params.timeInForce`::string, optional: spot supports 'PO', 'GTC' and 'IOC', swap supports 'PO', 'GTC', 'IOC' and 'FOK'
- `params.reduceOnly`::bool, optional: *swap only* true or false whether the order is reduce only
- `params.triggerPrice`::float, optional: triggerPrice at which the attached take profit / stop loss order will be triggered
- `params.stopLossPrice`::float, optional: stop loss trigger price
- `params.takeProfitPrice`::float, optional: take profit trigger price
- `params.cost`::float, optional: the quote quantity that can be used as an alternative for the amount
- `params.trailingAmount`::float, optional: *swap only* the quote amount to trail away from the current market price
- `params.trailingPercent`::float, optional: *swap only* the percent to trail away from the current market price
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price
- `params.test`::bool, optional: *swap only* whether to use the test endpoint or not, default is false
- `params.positionSide`::string, optional: *contracts only* "BOTH" for one way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode
- `params.hedged`::bool, optional: *swap only* whether the order is in hedged mode or one way mode
- `params.closePosition`::bool, optional: *swap only* true to close the entire position with a TP/SL order, in which case the quantity is not sent

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_createOrder

function __ccxt_doc_Bingx_createOrders() end
"""
create a list of trade orders
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Place%20multiple%20orders
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Place%20multiple%20orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.sync`::bool, optional: *spot only* if true, multiple orders are ordered serially and all orders do not require the same symbol/side/type

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_createOrders

function __ccxt_doc_Bingx_cancelOrder() end
"""
cancels an open order
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Cancel%20Order
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20Order
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20TWAP%20Order
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Cancel%20an%20Order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_cancelOrder

function __ccxt_doc_Bingx_cancelAllOrders() end
"""
cancel all open orders
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Cancel%20all%20Open%20Orders%20on%20a%20Symbol
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20All%20Open%20Orders
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Cancel%20all%20orders

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' (default is 'spot' if symbol is not provided)
- `params.subType`::string, optional: 'linear' or 'inverse' for swap markets (default is 'linear' if symbol is not provided)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_cancelAllOrders

function __ccxt_doc_Bingx_cancelOrders() end
"""
cancel multiple orders
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Cancel%20multiple%20orders
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20multiple%20orders

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_cancelOrders

function __ccxt_doc_Bingx_cancelAllOrdersAfter() end
"""
dead man's switch, cancel all orders after the given timeout
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Cancel%20All%20After
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20All%20After

# Arguments
- `timeout`::float: time in milliseconds, 0 represents cancel the timer
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: spot or swap market

# Returns
- the api result
"""
__ccxt_doc_Bingx_cancelAllOrdersAfter

function __ccxt_doc_Bingx_fetchOrder() end
"""
fetches information on an order made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20Order%20details
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Order%20details
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/TWAP%20Order%20Details
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Order

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.twap`::bool, optional: if fetching twap order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_fetchOrder

function __ccxt_doc_Bingx_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/All%20Orders
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Order%20history (returns less fields than above)

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.orderId`::int, optional: Only return subsequent orders, and return the latest order by default

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_fetchOrders

function __ccxt_doc_Bingx_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Current%20Open%20Orders
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Current%20All%20Open%20Orders
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20all%20current%20pending%20orders
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20TWAP%20Entrusted%20Order

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.twap`::bool, optional: if fetching twap open orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_fetchOpenOrders

function __ccxt_doc_Bingx_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/User's%20History%20Orders
see: https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order

# Arguments
- `symbol`::string: unified market symbol of the closed orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of closed orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.standard`::bool, optional: whether to fetch standard contract orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_fetchClosedOrders

function __ccxt_doc_Bingx_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/User's%20History%20Orders
see: https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order

# Arguments
- `symbol`::string: unified market symbol of the canceled orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of canceled orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.standard`::bool, optional: whether to fetch standard contract orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_fetchCanceledOrders

function __ccxt_doc_Bingx_fetchCanceledAndClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Order%20history
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/User's%20History%20Orders
see: https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20TWAP%20Historical%20Orders

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.standard`::bool, optional: whether to fetch standard contract orders
- `params.twap`::bool, optional: if fetching twap orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_fetchCanceledAndClosedOrders

function __ccxt_doc_Bingx_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Fund%20Account/Asset%20Transfer%20New

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from (spot, swap, futures, or funding)
- `toAccount`::string: account to transfer to (spot, swap (linear or inverse), future, or funding)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Bingx_transfer

function __ccxt_doc_Bingx_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Fund%20Account/Asset%20transfer%20records%20new

# Arguments
- `code`::string, optional: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfers structures to retrieve (default 10, max 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fromAccount`::string: (mandatory) transfer from (spot, swap (linear or inverse), future, or funding)
- `params.toAccount`::string: (mandatory) transfer to (spot, swap(linear or inverse), future, or funding)
- `params.paginate`::bool, optional: whether to paginate the results (default false)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Bingx_fetchTransfers

function __ccxt_doc_Bingx_fetchDepositAddressesByNetwork() end
"""
fetch the deposit addresses for a currency associated with this account
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Wallet%20Deposits%20and%20Withdrawals/Main%20Account%20Deposit%20Address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary [address structures]{@link https://docs.ccxt.com/?id=address-structure}, indexed by the network
"""
__ccxt_doc_Bingx_fetchDepositAddressesByNetwork

function __ccxt_doc_Bingx_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Wallet%20Deposits%20and%20Withdrawals/Main%20Account%20Deposit%20Address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: The chain of currency. This only apply for multi-chain currency, and there is no need for single chain currency

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Bingx_fetchDepositAddress

function __ccxt_doc_Bingx_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Wallet%20deposits%20and%20withdrawals/Deposit%20records

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bingx_fetchDeposits

function __ccxt_doc_Bingx_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Wallet%20deposits%20and%20withdrawals/Withdraw%20records

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bingx_fetchWithdrawals

function __ccxt_doc_Bingx_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Change%20Margin%20Type
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Set%20Margin%20Type

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Bingx_setMarginMode

function __ccxt_doc_Bingx_setMargin() end
"""
Either adds or reduces margin in an isolated position in order to set the margin to a specific value
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Modify%20Isolated%20Position%20Margin

# Arguments
- `symbol`::string: unified market symbol of the market to set margin in
- `amount`::float: the amount to set the margin to
- `params`::object, optional: parameters specific to the exchange API endpoint

# Returns
- A [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Bingx_setMargin

function __ccxt_doc_Bingx_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Leverage%20and%20Available%20Positions
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Leverage

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Bingx_fetchLeverage

function __ccxt_doc_Bingx_setLeverage() end
"""
set the level of leverage for a market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Set%20Leverage
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Modify%20Leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string, optional: hedged: ['long' or 'short']. one way: ['both']

# Returns
- response from the exchange
"""
__ccxt_doc_Bingx_setLeverage

function __ccxt_doc_Bingx_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20transaction%20details
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20historical%20transaction%20orders
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Order%20Trade%20Detail

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms for the ending date filter, default is undefined
- `params.trandingUnit`::string: COIN (directly represent assets such as BTC and ETH) or CONT (represents the number of contract sheets)
- `params.orderId`::string: the order id required for inverse swap

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bingx_fetchMyTrades

function __ccxt_doc_Bingx_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Wallet%20Deposits%20and%20Withdrawals/Query%20currency%20deposit%20and%20withdrawal%20data

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bingx_fetchDepositWithdrawFees

function __ccxt_doc_Bingx_withdraw() end
"""
make a withdrawal
see: https://bingx-api.github.io/docs-v3/#/en/Account%20and%20Wallet/Wallet%20Deposits%20and%20Withdrawals/Withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.walletType`::int, optional: 1 fund (funding) account, 2 standard account, 3 perpetual account, 15 spot account

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bingx_withdraw

function __ccxt_doc_Bingx_fetchMyLiquidations() end
"""
retrieves the users liquidated positions
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/User's%20Force%20Orders
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20force%20orders

# Arguments
- `symbol`::string, optional: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the bingx api endpoint
- `params.until`::int, optional: timestamp in ms of the latest liquidation

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
__ccxt_doc_Bingx_fetchMyLiquidations

function __ccxt_doc_Bingx_closePosition() end
"""
closes open positions for a market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Close%20All%20Positions
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Close%20position%20by%20position%20ID
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Close%20all%20positions%20in%20bulk

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string, optional: not used by bingx
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionId`::any, optional: the id of the position you would like to close

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_closePosition

function __ccxt_doc_Bingx_closeAllPositions() end
"""
closes open positions for a market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Close%20All%20Positions
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Close%20all%20positions%20in%20bulk

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.recvWindow`::string, optional: request valid time window value

# Returns
- [a list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bingx_closeAllPositions

function __ccxt_doc_Bingx_fetchPositionMode() end
"""
fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20position%20mode

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
__ccxt_doc_Bingx_fetchPositionMode

function __ccxt_doc_Bingx_setPositionMode() end
"""
set hedged to true or false for a market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Set%20Position%20Mode

# Arguments
- `hedged`::bool: set to true to use dualSidePosition
- `symbol`::string: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Bingx_setPositionMode

function __ccxt_doc_Bingx_editOrder() end
"""
cancels an order and places a new order
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Cancel%20an%20Existing%20Order%20and%20Send%20a%20New%20Order  // spot
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Cancel%20an%20Existing%20Order%20and%20Send%20a%20New%20Orde  // swap

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::string, optional: Trigger price used for TAKE_STOP_LIMIT, TAKE_STOP_MARKET, TRIGGER_LIMIT, TRIGGER_MARKET order types.
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price EXCHANGE SPECIFIC PARAMETERS
- `params.cancelClientOrderID`::string, optional: the user-defined id of the order to be canceled, 1-40 characters, different orders cannot use the same clientOrderID, only supports a query range of 2 hours
- `params.cancelRestrictions`::string, optional: cancel orders with specified status, NEW: New order, PENDING: Pending order, PARTIALLY_FILLED: Partially filled
- `params.cancelReplaceMode`::string, optional: STOP_ON_FAILURE - if the cancel order fails, it will not continue to place a new order, ALLOW_FAILURE - regardless of whether the cancel order succeeds or fails, it will continue to place a new order
- `params.quoteOrderQty`::float, optional: order amount
- `params.newClientOrderId`::string, optional: custom order id consisting of letters, numbers, and _, 1-40 characters, different orders cannot use the same newClientOrderId.
- `params.positionSide`::string, optional: *contract only* position direction, required for single position as BOTH, for both long and short positions only LONG or SHORT can be chosen, defaults to LONG if empty
- `params.reduceOnly`::string, optional: *contract only* true or false, default=false for single position mode. this parameter is not accepted for both long and short positions mode
- `params.priceRate`::float, optional: *contract only* for type TRAILING_STOP_Market or TRAILING_TP_SL, Max = 1
- `params.workingType`::string, optional: *contract only* StopPrice trigger price types, MARK_PRICE (default), CONTRACT_PRICE, or INDEX_PRICE

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bingx_editOrder

function __ccxt_doc_Bingx_fetchMarginMode() end
"""
fetches the margin mode of the trading pair
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Query%20Margin%20Type
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Margin%20Type

# Arguments
- `symbol`::string: unified symbol of the market to fetch the margin mode for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Bingx_fetchMarginMode

function __ccxt_doc_Bingx_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://bingx-api.github.io/docs-v3/#/en/Spot/Trades%20Endpoints/Query%20Trading%20Commission%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Query%20Trading%20Commission%20Rate
see: https://bingx-api.github.io/docs-v3/#/en/Coin-M%20Futures/Trades%20Endpoints/Query%20Trade%20Commission%20Rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bingx_fetchTradingFee

function __ccxt_doc_Bingx_fetchMarketLeverageTiers() end
"""
retrieve information on the maximum leverage, for different trade sizes for a single market
see: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Position%20and%20Maintenance%20Margin%20Ratio

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
__ccxt_doc_Bingx_fetchMarketLeverageTiers
