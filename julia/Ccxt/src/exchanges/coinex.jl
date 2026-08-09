@kwdef mutable struct Coinex <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchContractMarkets::Function = fetchContractMarkets
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchTime::Function = fetchTime
    fetchOrderBook::Function = fetchOrderBook
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    parseTradingFee::Function = parseTradingFee
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchMarginBalance::Function = fetchMarginBalance
    fetchSpotBalance::Function = fetchSpotBalance
    fetchSwapBalance::Function = fetchSwapBalance
    fetchFinancialBalance::Function = fetchFinancialBalance
    fetchBalance::Function = fetchBalance
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrderRequest::Function = createOrderRequest
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    cancelOrders::Function = cancelOrders
    editOrder::Function = editOrder
    editOrders::Function = editOrders
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOrdersByStatus::Function = fetchOrdersByStatus
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    createDepositAddress::Function = createDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchMyTrades::Function = fetchMyTrades
    fetchPositions::Function = fetchPositions
    fetchPosition::Function = fetchPosition
    parsePosition::Function = parsePosition
    setMarginMode::Function = setMarginMode
    setLeverage::Function = setLeverage
    fetchLeverageTiers::Function = fetchLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    fetchFundingHistory::Function = fetchFundingHistory
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingInterval::Function = fetchFundingInterval
    parseFundingRate::Function = parseFundingRate
    parseFundingInterval::Function = parseFundingInterval
    fetchFundingRates::Function = fetchFundingRates
    withdraw::Function = withdraw
    parseTransactionStatus::Function = parseTransactionStatus
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseTransaction::Function = parseTransaction
    transfer::Function = transfer
    parseTransferStatus::Function = parseTransferStatus
    parseTransfer::Function = parseTransfer
    fetchTransfers::Function = fetchTransfers
    fetchWithdrawals::Function = fetchWithdrawals
    fetchDeposits::Function = fetchDeposits
    parseIsolatedBorrowRate::Function = parseIsolatedBorrowRate
    fetchIsolatedBorrowRate::Function = fetchIsolatedBorrowRate
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    borrowIsolatedMargin::Function = borrowIsolatedMargin
    repayIsolatedMargin::Function = repayIsolatedMargin
    parseMarginLoan::Function = parseMarginLoan
    fetchDepositWithdrawFee::Function = fetchDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    fetchPositionHistory::Function = fetchPositionHistory
    closePosition::Function = closePosition
    handleMarginModeAndParams::Function = handleMarginModeAndParams
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors
    fetchMarginAdjustmentHistory::Function = fetchMarginAdjustmentHistory

# Generated REST endpoint fields
    v1PublicGetAmmMarket::Function = v1PublicGetAmmMarket
    v1PublicGetCommonCurrencyRate::Function = v1PublicGetCommonCurrencyRate
    v1PublicGetCommonAssetConfig::Function = v1PublicGetCommonAssetConfig
    v1PublicGetCommonMaintainInfo::Function = v1PublicGetCommonMaintainInfo
    v1PublicGetCommonTempMaintainInfo::Function = v1PublicGetCommonTempMaintainInfo
    v1PublicGetMarginMarket::Function = v1PublicGetMarginMarket
    v1PublicGetMarketInfo::Function = v1PublicGetMarketInfo
    v1PublicGetMarketList::Function = v1PublicGetMarketList
    v1PublicGetMarketTicker::Function = v1PublicGetMarketTicker
    v1PublicGetMarketTickerAll::Function = v1PublicGetMarketTickerAll
    v1PublicGetMarketDepth::Function = v1PublicGetMarketDepth
    v1PublicGetMarketDeals::Function = v1PublicGetMarketDeals
    v1PublicGetMarketKline::Function = v1PublicGetMarketKline
    v1PublicGetMarketDetail::Function = v1PublicGetMarketDetail
    v1PrivateGetAccountAmmBalance::Function = v1PrivateGetAccountAmmBalance
    v1PrivateGetAccountInvestmentBalance::Function = v1PrivateGetAccountInvestmentBalance
    v1PrivateGetAccountBalanceHistory::Function = v1PrivateGetAccountBalanceHistory
    v1PrivateGetAccountMarketFee::Function = v1PrivateGetAccountMarketFee
    v1PrivateGetBalanceCoinDeposit::Function = v1PrivateGetBalanceCoinDeposit
    v1PrivateGetBalanceCoinWithdraw::Function = v1PrivateGetBalanceCoinWithdraw
    v1PrivateGetBalanceInfo::Function = v1PrivateGetBalanceInfo
    v1PrivateGetBalanceDepositAddressCoinType::Function = v1PrivateGetBalanceDepositAddressCoinType
    v1PrivateGetContractTransferHistory::Function = v1PrivateGetContractTransferHistory
    v1PrivateGetCreditInfo::Function = v1PrivateGetCreditInfo
    v1PrivateGetCreditBalance::Function = v1PrivateGetCreditBalance
    v1PrivateGetInvestmentTransferHistory::Function = v1PrivateGetInvestmentTransferHistory
    v1PrivateGetMarginAccount::Function = v1PrivateGetMarginAccount
    v1PrivateGetMarginConfig::Function = v1PrivateGetMarginConfig
    v1PrivateGetMarginLoanHistory::Function = v1PrivateGetMarginLoanHistory
    v1PrivateGetMarginTransferHistory::Function = v1PrivateGetMarginTransferHistory
    v1PrivateGetOrderDeals::Function = v1PrivateGetOrderDeals
    v1PrivateGetOrderFinished::Function = v1PrivateGetOrderFinished
    v1PrivateGetOrderPending::Function = v1PrivateGetOrderPending
    v1PrivateGetOrderStatus::Function = v1PrivateGetOrderStatus
    v1PrivateGetOrderStatusBatch::Function = v1PrivateGetOrderStatusBatch
    v1PrivateGetOrderUserDeals::Function = v1PrivateGetOrderUserDeals
    v1PrivateGetOrderStopFinished::Function = v1PrivateGetOrderStopFinished
    v1PrivateGetOrderStopPending::Function = v1PrivateGetOrderStopPending
    v1PrivateGetOrderUserTradeFee::Function = v1PrivateGetOrderUserTradeFee
    v1PrivateGetOrderMarketTradeInfo::Function = v1PrivateGetOrderMarketTradeInfo
    v1PrivateGetSubAccountBalance::Function = v1PrivateGetSubAccountBalance
    v1PrivateGetSubAccountTransferHistory::Function = v1PrivateGetSubAccountTransferHistory
    v1PrivateGetSubAccountAuthApi::Function = v1PrivateGetSubAccountAuthApi
    v1PrivateGetSubAccountAuthApiUserAuthId::Function = v1PrivateGetSubAccountAuthApiUserAuthId
    v1PrivatePostBalanceCoinWithdraw::Function = v1PrivatePostBalanceCoinWithdraw
    v1PrivatePostContractBalanceTransfer::Function = v1PrivatePostContractBalanceTransfer
    v1PrivatePostMarginFlat::Function = v1PrivatePostMarginFlat
    v1PrivatePostMarginLoan::Function = v1PrivatePostMarginLoan
    v1PrivatePostMarginTransfer::Function = v1PrivatePostMarginTransfer
    v1PrivatePostOrderLimitBatch::Function = v1PrivatePostOrderLimitBatch
    v1PrivatePostOrderIoc::Function = v1PrivatePostOrderIoc
    v1PrivatePostOrderLimit::Function = v1PrivatePostOrderLimit
    v1PrivatePostOrderMarket::Function = v1PrivatePostOrderMarket
    v1PrivatePostOrderModify::Function = v1PrivatePostOrderModify
    v1PrivatePostOrderStopLimit::Function = v1PrivatePostOrderStopLimit
    v1PrivatePostOrderStopMarket::Function = v1PrivatePostOrderStopMarket
    v1PrivatePostOrderStopModify::Function = v1PrivatePostOrderStopModify
    v1PrivatePostSubAccountTransfer::Function = v1PrivatePostSubAccountTransfer
    v1PrivatePostSubAccountRegister::Function = v1PrivatePostSubAccountRegister
    v1PrivatePostSubAccountUnfrozen::Function = v1PrivatePostSubAccountUnfrozen
    v1PrivatePostSubAccountFrozen::Function = v1PrivatePostSubAccountFrozen
    v1PrivatePostSubAccountAuthApi::Function = v1PrivatePostSubAccountAuthApi
    v1PrivatePutBalanceDepositAddressCoinType::Function = v1PrivatePutBalanceDepositAddressCoinType
    v1PrivatePutSubAccountUnfrozen::Function = v1PrivatePutSubAccountUnfrozen
    v1PrivatePutSubAccountFrozen::Function = v1PrivatePutSubAccountFrozen
    v1PrivatePutSubAccountAuthApiUserAuthId::Function = v1PrivatePutSubAccountAuthApiUserAuthId
    v1PrivatePutV1AccountSettings::Function = v1PrivatePutV1AccountSettings
    v1PrivateDeleteBalanceCoinWithdraw::Function = v1PrivateDeleteBalanceCoinWithdraw
    v1PrivateDeleteOrderPendingBatch::Function = v1PrivateDeleteOrderPendingBatch
    v1PrivateDeleteOrderPending::Function = v1PrivateDeleteOrderPending
    v1PrivateDeleteOrderStopPending::Function = v1PrivateDeleteOrderStopPending
    v1PrivateDeleteOrderStopPendingId::Function = v1PrivateDeleteOrderStopPendingId
    v1PrivateDeleteOrderPendingByClientId::Function = v1PrivateDeleteOrderPendingByClientId
    v1PrivateDeleteOrderStopPendingByClientId::Function = v1PrivateDeleteOrderStopPendingByClientId
    v1PrivateDeleteSubAccountAuthApiUserAuthId::Function = v1PrivateDeleteSubAccountAuthApiUserAuthId
    v1PrivateDeleteSubAccountAuthorizeId::Function = v1PrivateDeleteSubAccountAuthorizeId
    v1PerpetualPublicGetPing::Function = v1PerpetualPublicGetPing
    v1PerpetualPublicGetTime::Function = v1PerpetualPublicGetTime
    v1PerpetualPublicGetMarketList::Function = v1PerpetualPublicGetMarketList
    v1PerpetualPublicGetMarketLimitConfig::Function = v1PerpetualPublicGetMarketLimitConfig
    v1PerpetualPublicGetMarketTicker::Function = v1PerpetualPublicGetMarketTicker
    v1PerpetualPublicGetMarketTickerAll::Function = v1PerpetualPublicGetMarketTickerAll
    v1PerpetualPublicGetMarketDepth::Function = v1PerpetualPublicGetMarketDepth
    v1PerpetualPublicGetMarketDeals::Function = v1PerpetualPublicGetMarketDeals
    v1PerpetualPublicGetMarketFundingHistory::Function = v1PerpetualPublicGetMarketFundingHistory
    v1PerpetualPublicGetMarketKline::Function = v1PerpetualPublicGetMarketKline
    v1PerpetualPrivateGetMarketUserDeals::Function = v1PerpetualPrivateGetMarketUserDeals
    v1PerpetualPrivateGetAssetQuery::Function = v1PerpetualPrivateGetAssetQuery
    v1PerpetualPrivateGetOrderPending::Function = v1PerpetualPrivateGetOrderPending
    v1PerpetualPrivateGetOrderFinished::Function = v1PerpetualPrivateGetOrderFinished
    v1PerpetualPrivateGetOrderStopFinished::Function = v1PerpetualPrivateGetOrderStopFinished
    v1PerpetualPrivateGetOrderStopPending::Function = v1PerpetualPrivateGetOrderStopPending
    v1PerpetualPrivateGetOrderStatus::Function = v1PerpetualPrivateGetOrderStatus
    v1PerpetualPrivateGetOrderStopStatus::Function = v1PerpetualPrivateGetOrderStopStatus
    v1PerpetualPrivateGetPositionFinished::Function = v1PerpetualPrivateGetPositionFinished
    v1PerpetualPrivateGetPositionPending::Function = v1PerpetualPrivateGetPositionPending
    v1PerpetualPrivateGetPositionFunding::Function = v1PerpetualPrivateGetPositionFunding
    v1PerpetualPrivateGetPositionAdlHistory::Function = v1PerpetualPrivateGetPositionAdlHistory
    v1PerpetualPrivateGetMarketPreference::Function = v1PerpetualPrivateGetMarketPreference
    v1PerpetualPrivateGetPositionMarginHistory::Function = v1PerpetualPrivateGetPositionMarginHistory
    v1PerpetualPrivateGetPositionSettleHistory::Function = v1PerpetualPrivateGetPositionSettleHistory
    v1PerpetualPrivatePostMarketAdjustLeverage::Function = v1PerpetualPrivatePostMarketAdjustLeverage
    v1PerpetualPrivatePostMarketPositionExpect::Function = v1PerpetualPrivatePostMarketPositionExpect
    v1PerpetualPrivatePostOrderPutLimit::Function = v1PerpetualPrivatePostOrderPutLimit
    v1PerpetualPrivatePostOrderPutMarket::Function = v1PerpetualPrivatePostOrderPutMarket
    v1PerpetualPrivatePostOrderPutStopLimit::Function = v1PerpetualPrivatePostOrderPutStopLimit
    v1PerpetualPrivatePostOrderPutStopMarket::Function = v1PerpetualPrivatePostOrderPutStopMarket
    v1PerpetualPrivatePostOrderModify::Function = v1PerpetualPrivatePostOrderModify
    v1PerpetualPrivatePostOrderModifyStop::Function = v1PerpetualPrivatePostOrderModifyStop
    v1PerpetualPrivatePostOrderCancel::Function = v1PerpetualPrivatePostOrderCancel
    v1PerpetualPrivatePostOrderCancelAll::Function = v1PerpetualPrivatePostOrderCancelAll
    v1PerpetualPrivatePostOrderCancelBatch::Function = v1PerpetualPrivatePostOrderCancelBatch
    v1PerpetualPrivatePostOrderCancelStop::Function = v1PerpetualPrivatePostOrderCancelStop
    v1PerpetualPrivatePostOrderCancelStopAll::Function = v1PerpetualPrivatePostOrderCancelStopAll
    v1PerpetualPrivatePostOrderCloseLimit::Function = v1PerpetualPrivatePostOrderCloseLimit
    v1PerpetualPrivatePostOrderCloseMarket::Function = v1PerpetualPrivatePostOrderCloseMarket
    v1PerpetualPrivatePostPositionAdjustMargin::Function = v1PerpetualPrivatePostPositionAdjustMargin
    v1PerpetualPrivatePostPositionStopLoss::Function = v1PerpetualPrivatePostPositionStopLoss
    v1PerpetualPrivatePostPositionTakeProfit::Function = v1PerpetualPrivatePostPositionTakeProfit
    v1PerpetualPrivatePostPositionMarketClose::Function = v1PerpetualPrivatePostPositionMarketClose
    v1PerpetualPrivatePostOrderCancelByClientId::Function = v1PerpetualPrivatePostOrderCancelByClientId
    v1PerpetualPrivatePostOrderCancelStopByClientId::Function = v1PerpetualPrivatePostOrderCancelStopByClientId
    v1PerpetualPrivatePostMarketPreference::Function = v1PerpetualPrivatePostMarketPreference
    v2PublicGetMaintainInfo::Function = v2PublicGetMaintainInfo
    v2PublicGetPing::Function = v2PublicGetPing
    v2PublicGetTime::Function = v2PublicGetTime
    v2PublicGetSpotMarket::Function = v2PublicGetSpotMarket
    v2PublicGetSpotTicker::Function = v2PublicGetSpotTicker
    v2PublicGetSpotDepth::Function = v2PublicGetSpotDepth
    v2PublicGetSpotDeals::Function = v2PublicGetSpotDeals
    v2PublicGetSpotKline::Function = v2PublicGetSpotKline
    v2PublicGetSpotIndex::Function = v2PublicGetSpotIndex
    v2PublicGetFuturesMarket::Function = v2PublicGetFuturesMarket
    v2PublicGetFuturesTicker::Function = v2PublicGetFuturesTicker
    v2PublicGetFuturesDepth::Function = v2PublicGetFuturesDepth
    v2PublicGetFuturesDeals::Function = v2PublicGetFuturesDeals
    v2PublicGetFuturesKline::Function = v2PublicGetFuturesKline
    v2PublicGetFuturesIndex::Function = v2PublicGetFuturesIndex
    v2PublicGetFuturesFundingRate::Function = v2PublicGetFuturesFundingRate
    v2PublicGetFuturesFundingRateHistory::Function = v2PublicGetFuturesFundingRateHistory
    v2PublicGetFuturesPremiumIndexHistory::Function = v2PublicGetFuturesPremiumIndexHistory
    v2PublicGetFuturesPositionLevel::Function = v2PublicGetFuturesPositionLevel
    v2PublicGetFuturesLiquidationHistory::Function = v2PublicGetFuturesLiquidationHistory
    v2PublicGetFuturesBasisHistory::Function = v2PublicGetFuturesBasisHistory
    v2PublicGetAssetsDepositWithdrawConfig::Function = v2PublicGetAssetsDepositWithdrawConfig
    v2PublicGetAssetsAllDepositWithdrawConfig::Function = v2PublicGetAssetsAllDepositWithdrawConfig
    v2PrivateGetAccountSubs::Function = v2PrivateGetAccountSubs
    v2PrivateGetAccountSubsApiDetail::Function = v2PrivateGetAccountSubsApiDetail
    v2PrivateGetAccountSubsInfo::Function = v2PrivateGetAccountSubsInfo
    v2PrivateGetAccountSubsApi::Function = v2PrivateGetAccountSubsApi
    v2PrivateGetAccountSubsTransferHistory::Function = v2PrivateGetAccountSubsTransferHistory
    v2PrivateGetAccountSubsBalance::Function = v2PrivateGetAccountSubsBalance
    v2PrivateGetAccountSubsSpotBalance::Function = v2PrivateGetAccountSubsSpotBalance
    v2PrivateGetAccountTradeFeeRate::Function = v2PrivateGetAccountTradeFeeRate
    v2PrivateGetAccountFuturesMarketSettings::Function = v2PrivateGetAccountFuturesMarketSettings
    v2PrivateGetAccountInfo::Function = v2PrivateGetAccountInfo
    v2PrivateGetAssetsSpotBalance::Function = v2PrivateGetAssetsSpotBalance
    v2PrivateGetAssetsFuturesBalance::Function = v2PrivateGetAssetsFuturesBalance
    v2PrivateGetAssetsMarginBalance::Function = v2PrivateGetAssetsMarginBalance
    v2PrivateGetAssetsFinancialBalance::Function = v2PrivateGetAssetsFinancialBalance
    v2PrivateGetAssetsAmmLiquidity::Function = v2PrivateGetAssetsAmmLiquidity
    v2PrivateGetAssetsCreditInfo::Function = v2PrivateGetAssetsCreditInfo
    v2PrivateGetAssetsSpotTranscationHistory::Function = v2PrivateGetAssetsSpotTranscationHistory
    v2PrivateGetAssetsMarginBorrowHistory::Function = v2PrivateGetAssetsMarginBorrowHistory
    v2PrivateGetAssetsMarginInterestLimit::Function = v2PrivateGetAssetsMarginInterestLimit
    v2PrivateGetAssetsDepositAddress::Function = v2PrivateGetAssetsDepositAddress
    v2PrivateGetAssetsDepositHistory::Function = v2PrivateGetAssetsDepositHistory
    v2PrivateGetAssetsWithdraw::Function = v2PrivateGetAssetsWithdraw
    v2PrivateGetAssetsTransferHistory::Function = v2PrivateGetAssetsTransferHistory
    v2PrivateGetAssetsAmmLiquidityPool::Function = v2PrivateGetAssetsAmmLiquidityPool
    v2PrivateGetAssetsAmmIncomeHistory::Function = v2PrivateGetAssetsAmmIncomeHistory
    v2PrivateGetSpotOrderStatus::Function = v2PrivateGetSpotOrderStatus
    v2PrivateGetSpotBatchOrderStatus::Function = v2PrivateGetSpotBatchOrderStatus
    v2PrivateGetSpotPendingOrder::Function = v2PrivateGetSpotPendingOrder
    v2PrivateGetSpotFinishedOrder::Function = v2PrivateGetSpotFinishedOrder
    v2PrivateGetSpotPendingStopOrder::Function = v2PrivateGetSpotPendingStopOrder
    v2PrivateGetSpotFinishedStopOrder::Function = v2PrivateGetSpotFinishedStopOrder
    v2PrivateGetSpotUserDeals::Function = v2PrivateGetSpotUserDeals
    v2PrivateGetSpotOrderDeals::Function = v2PrivateGetSpotOrderDeals
    v2PrivateGetFuturesOrderStatus::Function = v2PrivateGetFuturesOrderStatus
    v2PrivateGetFuturesBatchOrderStatus::Function = v2PrivateGetFuturesBatchOrderStatus
    v2PrivateGetFuturesPendingOrder::Function = v2PrivateGetFuturesPendingOrder
    v2PrivateGetFuturesFinishedOrder::Function = v2PrivateGetFuturesFinishedOrder
    v2PrivateGetFuturesPendingStopOrder::Function = v2PrivateGetFuturesPendingStopOrder
    v2PrivateGetFuturesFinishedStopOrder::Function = v2PrivateGetFuturesFinishedStopOrder
    v2PrivateGetFuturesUserDeals::Function = v2PrivateGetFuturesUserDeals
    v2PrivateGetFuturesOrderDeals::Function = v2PrivateGetFuturesOrderDeals
    v2PrivateGetFuturesPendingPosition::Function = v2PrivateGetFuturesPendingPosition
    v2PrivateGetFuturesFinishedPosition::Function = v2PrivateGetFuturesFinishedPosition
    v2PrivateGetFuturesPositionMarginHistory::Function = v2PrivateGetFuturesPositionMarginHistory
    v2PrivateGetFuturesPositionFundingHistory::Function = v2PrivateGetFuturesPositionFundingHistory
    v2PrivateGetFuturesPositionAdlHistory::Function = v2PrivateGetFuturesPositionAdlHistory
    v2PrivateGetFuturesPositionSettleHistory::Function = v2PrivateGetFuturesPositionSettleHistory
    v2PrivateGetReferReferee::Function = v2PrivateGetReferReferee
    v2PrivateGetReferRefereeRebateRecord::Function = v2PrivateGetReferRefereeRebateRecord
    v2PrivateGetReferRefereeRebateDetail::Function = v2PrivateGetReferRefereeRebateDetail
    v2PrivateGetReferAgentReferee::Function = v2PrivateGetReferAgentReferee
    v2PrivateGetReferAgentRebateRecord::Function = v2PrivateGetReferAgentRebateRecord
    v2PrivateGetReferAgentRebateDetail::Function = v2PrivateGetReferAgentRebateDetail
    v2PrivatePostAccountSubs::Function = v2PrivatePostAccountSubs
    v2PrivatePostAccountSubsFrozen::Function = v2PrivatePostAccountSubsFrozen
    v2PrivatePostAccountSubsUnfrozen::Function = v2PrivatePostAccountSubsUnfrozen
    v2PrivatePostAccountSubsApi::Function = v2PrivatePostAccountSubsApi
    v2PrivatePostAccountSubsEditApi::Function = v2PrivatePostAccountSubsEditApi
    v2PrivatePostAccountSubsDeleteApi::Function = v2PrivatePostAccountSubsDeleteApi
    v2PrivatePostAccountSubsTransfer::Function = v2PrivatePostAccountSubsTransfer
    v2PrivatePostAccountSettings::Function = v2PrivatePostAccountSettings
    v2PrivatePostAccountFuturesMarketSettings::Function = v2PrivatePostAccountFuturesMarketSettings
    v2PrivatePostAssetsMarginBorrow::Function = v2PrivatePostAssetsMarginBorrow
    v2PrivatePostAssetsMarginRepay::Function = v2PrivatePostAssetsMarginRepay
    v2PrivatePostAssetsRenewalDepositAddress::Function = v2PrivatePostAssetsRenewalDepositAddress
    v2PrivatePostAssetsWithdraw::Function = v2PrivatePostAssetsWithdraw
    v2PrivatePostAssetsCancelWithdraw::Function = v2PrivatePostAssetsCancelWithdraw
    v2PrivatePostAssetsTransfer::Function = v2PrivatePostAssetsTransfer
    v2PrivatePostAssetsAmmAddLiquidity::Function = v2PrivatePostAssetsAmmAddLiquidity
    v2PrivatePostAssetsAmmRemoveLiquidity::Function = v2PrivatePostAssetsAmmRemoveLiquidity
    v2PrivatePostSpotOrder::Function = v2PrivatePostSpotOrder
    v2PrivatePostSpotStopOrder::Function = v2PrivatePostSpotStopOrder
    v2PrivatePostSpotBatchOrder::Function = v2PrivatePostSpotBatchOrder
    v2PrivatePostSpotBatchStopOrder::Function = v2PrivatePostSpotBatchStopOrder
    v2PrivatePostSpotModifyOrder::Function = v2PrivatePostSpotModifyOrder
    v2PrivatePostSpotModifyStopOrder::Function = v2PrivatePostSpotModifyStopOrder
    v2PrivatePostSpotBatchModifyOrder::Function = v2PrivatePostSpotBatchModifyOrder
    v2PrivatePostSpotCancelAllOrder::Function = v2PrivatePostSpotCancelAllOrder
    v2PrivatePostSpotCancelOrder::Function = v2PrivatePostSpotCancelOrder
    v2PrivatePostSpotCancelStopOrder::Function = v2PrivatePostSpotCancelStopOrder
    v2PrivatePostSpotCancelBatchOrder::Function = v2PrivatePostSpotCancelBatchOrder
    v2PrivatePostSpotCancelBatchStopOrder::Function = v2PrivatePostSpotCancelBatchStopOrder
    v2PrivatePostSpotCancelOrderByClientId::Function = v2PrivatePostSpotCancelOrderByClientId
    v2PrivatePostSpotCancelStopOrderByClientId::Function = v2PrivatePostSpotCancelStopOrderByClientId
    v2PrivatePostFuturesOrder::Function = v2PrivatePostFuturesOrder
    v2PrivatePostFuturesStopOrder::Function = v2PrivatePostFuturesStopOrder
    v2PrivatePostFuturesBatchOrder::Function = v2PrivatePostFuturesBatchOrder
    v2PrivatePostFuturesBatchStopOrder::Function = v2PrivatePostFuturesBatchStopOrder
    v2PrivatePostFuturesCancelPositionStopLoss::Function = v2PrivatePostFuturesCancelPositionStopLoss
    v2PrivatePostFuturesCancelPositionTakeProfit::Function = v2PrivatePostFuturesCancelPositionTakeProfit
    v2PrivatePostFuturesModifyOrder::Function = v2PrivatePostFuturesModifyOrder
    v2PrivatePostFuturesModifyStopOrder::Function = v2PrivatePostFuturesModifyStopOrder
    v2PrivatePostFuturesBatchModifyOrder::Function = v2PrivatePostFuturesBatchModifyOrder
    v2PrivatePostFuturesCancelAllOrder::Function = v2PrivatePostFuturesCancelAllOrder
    v2PrivatePostFuturesCancelOrder::Function = v2PrivatePostFuturesCancelOrder
    v2PrivatePostFuturesCancelStopOrder::Function = v2PrivatePostFuturesCancelStopOrder
    v2PrivatePostFuturesCancelBatchOrder::Function = v2PrivatePostFuturesCancelBatchOrder
    v2PrivatePostFuturesCancelBatchStopOrder::Function = v2PrivatePostFuturesCancelBatchStopOrder
    v2PrivatePostFuturesCancelOrderByClientId::Function = v2PrivatePostFuturesCancelOrderByClientId
    v2PrivatePostFuturesCancelStopOrderByClientId::Function = v2PrivatePostFuturesCancelStopOrderByClientId
    v2PrivatePostFuturesClosePosition::Function = v2PrivatePostFuturesClosePosition
    v2PrivatePostFuturesAdjustPositionMargin::Function = v2PrivatePostFuturesAdjustPositionMargin
    v2PrivatePostFuturesAdjustPositionLeverage::Function = v2PrivatePostFuturesAdjustPositionLeverage
    v2PrivatePostFuturesSetPositionStopLoss::Function = v2PrivatePostFuturesSetPositionStopLoss
    v2PrivatePostFuturesSetPositionTakeProfit::Function = v2PrivatePostFuturesSetPositionTakeProfit

end
function describe(self::Coinex, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "coinex",
    Symbol("name") => "CoinEx",
    Symbol("version") => "v2",
    Symbol("countries") => ["CN"],
    Symbol("rateLimit") => 2.5,
    Symbol("pro") => true,
    Symbol("certified") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => true,
        Symbol("createDepositAddress") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("editOrders") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => true,
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingInterval") => true,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => true,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverages") => false,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchMarginAdjustmentHistory") => true,
        Symbol("fetchMarketLeverageTiers") => "emulated",
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1min",
        Symbol("3m") => "3min",
        Symbol("5m") => "5min",
        Symbol("15m") => "15min",
        Symbol("30m") => "30min",
        Symbol("1h") => "1hour",
        Symbol("2h") => "2hour",
        Symbol("4h") => "4hour",
        Symbol("6h") => "6hour",
        Symbol("12h") => "12hour",
        Symbol("1d") => "1day",
        Symbol("3d") => "3day",
        Symbol("1w") => "1week"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.coinex.com",
            Symbol("private") => "https://api.coinex.com",
            Symbol("perpetualPublic") => "https://api.coinex.com/perpetual",
            Symbol("perpetualPrivate") => "https://api.coinex.com/perpetual"
        ),
        Symbol("www") => "https://www.coinex.com",
        Symbol("doc") => "https://docs.coinex.com/api/v2",
        Symbol("fees") => "https://www.coinex.com/fees",
        Symbol("referral") => "https://www.coinex.com/register?refer_code=yw5fz"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("v1") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("amm/market") => 1,
                    Symbol("common/currency/rate") => 1,
                    Symbol("common/asset/config") => 1,
                    Symbol("common/maintain/info") => 1,
                    Symbol("common/temp-maintain/info") => 1,
                    Symbol("margin/market") => 1,
                    Symbol("market/info") => 1,
                    Symbol("market/list") => 1,
                    Symbol("market/ticker") => 1,
                    Symbol("market/ticker/all") => 1,
                    Symbol("market/depth") => 1,
                    Symbol("market/deals") => 1,
                    Symbol("market/kline") => 1,
                    Symbol("market/detail") => 1
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("account/amm/balance") => 40,
                    Symbol("account/investment/balance") => 40,
                    Symbol("account/balance/history") => 40,
                    Symbol("account/market/fee") => 40,
                    Symbol("balance/coin/deposit") => 40,
                    Symbol("balance/coin/withdraw") => 40,
                    Symbol("balance/info") => 40,
                    Symbol("balance/deposit/address/{coin_type}") => 40,
                    Symbol("contract/transfer/history") => 40,
                    Symbol("credit/info") => 40,
                    Symbol("credit/balance") => 40,
                    Symbol("investment/transfer/history") => 40,
                    Symbol("margin/account") => 1,
                    Symbol("margin/config") => 1,
                    Symbol("margin/loan/history") => 40,
                    Symbol("margin/transfer/history") => 40,
                    Symbol("order/deals") => 40,
                    Symbol("order/finished") => 40,
                    Symbol("order/pending") => 8,
                    Symbol("order/status") => 8,
                    Symbol("order/status/batch") => 8,
                    Symbol("order/user/deals") => 40,
                    Symbol("order/stop/finished") => 40,
                    Symbol("order/stop/pending") => 8,
                    Symbol("order/user/trade/fee") => 1,
                    Symbol("order/market/trade/info") => 1,
                    Symbol("sub_account/balance") => 1,
                    Symbol("sub_account/transfer/history") => 40,
                    Symbol("sub_account/auth/api") => 40,
                    Symbol("sub_account/auth/api/{user_auth_id}") => 40
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("balance/coin/withdraw") => 40,
                    Symbol("contract/balance/transfer") => 40,
                    Symbol("margin/flat") => 40,
                    Symbol("margin/loan") => 40,
                    Symbol("margin/transfer") => 40,
                    Symbol("order/limit/batch") => 40,
                    Symbol("order/ioc") => 13.334,
                    Symbol("order/limit") => 13.334,
                    Symbol("order/market") => 13.334,
                    Symbol("order/modify") => 13.334,
                    Symbol("order/stop/limit") => 13.334,
                    Symbol("order/stop/market") => 13.334,
                    Symbol("order/stop/modify") => 13.334,
                    Symbol("sub_account/transfer") => 40,
                    Symbol("sub_account/register") => 1,
                    Symbol("sub_account/unfrozen") => 40,
                    Symbol("sub_account/frozen") => 40,
                    Symbol("sub_account/auth/api") => 40
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("balance/deposit/address/{coin_type}") => 40,
                    Symbol("sub_account/unfrozen") => 40,
                    Symbol("sub_account/frozen") => 40,
                    Symbol("sub_account/auth/api/{user_auth_id}") => 40,
                    Symbol("v1/account/settings") => 40
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("balance/coin/withdraw") => 40,
                    Symbol("order/pending/batch") => 40,
                    Symbol("order/pending") => 13.334,
                    Symbol("order/stop/pending") => 40,
                    Symbol("order/stop/pending/{id}") => 13.334,
                    Symbol("order/pending/by_client_id") => 40,
                    Symbol("order/stop/pending/by_client_id") => 40,
                    Symbol("sub_account/auth/api/{user_auth_id}") => 40,
                    Symbol("sub_account/authorize/{id}") => 40
                )
            ),
            Symbol("perpetualPublic") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("ping") => 1,
                    Symbol("time") => 1,
                    Symbol("market/list") => 1,
                    Symbol("market/limit_config") => 1,
                    Symbol("market/ticker") => 1,
                    Symbol("market/ticker/all") => 1,
                    Symbol("market/depth") => 1,
                    Symbol("market/deals") => 1,
                    Symbol("market/funding_history") => 1,
                    Symbol("market/kline") => 1
                )
            ),
            Symbol("perpetualPrivate") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("market/user_deals") => 1,
                    Symbol("asset/query") => 40,
                    Symbol("order/pending") => 8,
                    Symbol("order/finished") => 40,
                    Symbol("order/stop_finished") => 40,
                    Symbol("order/stop_pending") => 8,
                    Symbol("order/status") => 8,
                    Symbol("order/stop_status") => 8,
                    Symbol("position/finished") => 40,
                    Symbol("position/pending") => 40,
                    Symbol("position/funding") => 40,
                    Symbol("position/adl_history") => 40,
                    Symbol("market/preference") => 40,
                    Symbol("position/margin_history") => 40,
                    Symbol("position/settle_history") => 40
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("market/adjust_leverage") => 1,
                    Symbol("market/position_expect") => 1,
                    Symbol("order/put_limit") => 20,
                    Symbol("order/put_market") => 20,
                    Symbol("order/put_stop_limit") => 20,
                    Symbol("order/put_stop_market") => 20,
                    Symbol("order/modify") => 20,
                    Symbol("order/modify_stop") => 20,
                    Symbol("order/cancel") => 20,
                    Symbol("order/cancel_all") => 40,
                    Symbol("order/cancel_batch") => 40,
                    Symbol("order/cancel_stop") => 20,
                    Symbol("order/cancel_stop_all") => 40,
                    Symbol("order/close_limit") => 20,
                    Symbol("order/close_market") => 20,
                    Symbol("position/adjust_margin") => 20,
                    Symbol("position/stop_loss") => 20,
                    Symbol("position/take_profit") => 20,
                    Symbol("position/market_close") => 20,
                    Symbol("order/cancel/by_client_id") => 20,
                    Symbol("order/cancel_stop/by_client_id") => 20,
                    Symbol("market/preference") => 20
                )
            )
        ),
        Symbol("v2") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("maintain/info") => 1,
                    Symbol("ping") => 1,
                    Symbol("time") => 1,
                    Symbol("spot/market") => 1,
                    Symbol("spot/ticker") => 1,
                    Symbol("spot/depth") => 1,
                    Symbol("spot/deals") => 1,
                    Symbol("spot/kline") => 1,
                    Symbol("spot/index") => 1,
                    Symbol("futures/market") => 1,
                    Symbol("futures/ticker") => 1,
                    Symbol("futures/depth") => 1,
                    Symbol("futures/deals") => 1,
                    Symbol("futures/kline") => 1,
                    Symbol("futures/index") => 1,
                    Symbol("futures/funding-rate") => 1,
                    Symbol("futures/funding-rate-history") => 1,
                    Symbol("futures/premium-index-history") => 1,
                    Symbol("futures/position-level") => 1,
                    Symbol("futures/liquidation-history") => 1,
                    Symbol("futures/basis-history") => 1,
                    Symbol("assets/deposit-withdraw-config") => 1,
                    Symbol("assets/all-deposit-withdraw-config") => 1
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("account/subs") => 1,
                    Symbol("account/subs/api-detail") => 40,
                    Symbol("account/subs/info") => 1,
                    Symbol("account/subs/api") => 40,
                    Symbol("account/subs/transfer-history") => 40,
                    Symbol("account/subs/balance") => 1,
                    Symbol("account/subs/spot-balance") => 1,
                    Symbol("account/trade-fee-rate") => 40,
                    Symbol("account/futures-market-settings") => 1,
                    Symbol("account/info") => 1,
                    Symbol("assets/spot/balance") => 40,
                    Symbol("assets/futures/balance") => 40,
                    Symbol("assets/margin/balance") => 1,
                    Symbol("assets/financial/balance") => 40,
                    Symbol("assets/amm/liquidity") => 40,
                    Symbol("assets/credit/info") => 40,
                    Symbol("assets/spot/transcation-history") => 1,
                    Symbol("assets/margin/borrow-history") => 40,
                    Symbol("assets/margin/interest-limit") => 1,
                    Symbol("assets/deposit-address") => 40,
                    Symbol("assets/deposit-history") => 40,
                    Symbol("assets/withdraw") => 40,
                    Symbol("assets/transfer-history") => 40,
                    Symbol("assets/amm/liquidity-pool") => 40,
                    Symbol("assets/amm/income-history") => 40,
                    Symbol("spot/order-status") => 8,
                    Symbol("spot/batch-order-status") => 8,
                    Symbol("spot/pending-order") => 8,
                    Symbol("spot/finished-order") => 40,
                    Symbol("spot/pending-stop-order") => 8,
                    Symbol("spot/finished-stop-order") => 40,
                    Symbol("spot/user-deals") => 40,
                    Symbol("spot/order-deals") => 40,
                    Symbol("futures/order-status") => 8,
                    Symbol("futures/batch-order-status") => 1,
                    Symbol("futures/pending-order") => 8,
                    Symbol("futures/finished-order") => 40,
                    Symbol("futures/pending-stop-order") => 8,
                    Symbol("futures/finished-stop-order") => 40,
                    Symbol("futures/user-deals") => 1,
                    Symbol("futures/order-deals") => 1,
                    Symbol("futures/pending-position") => 40,
                    Symbol("futures/finished-position") => 1,
                    Symbol("futures/position-margin-history") => 1,
                    Symbol("futures/position-funding-history") => 40,
                    Symbol("futures/position-adl-history") => 1,
                    Symbol("futures/position-settle-history") => 1,
                    Symbol("refer/referee") => 1,
                    Symbol("refer/referee-rebate/record") => 1,
                    Symbol("refer/referee-rebate/detail") => 1,
                    Symbol("refer/agent-referee") => 1,
                    Symbol("refer/agent-rebate/record") => 1,
                    Symbol("refer/agent-rebate/detail") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("account/subs") => 40,
                    Symbol("account/subs/frozen") => 40,
                    Symbol("account/subs/unfrozen") => 40,
                    Symbol("account/subs/api") => 40,
                    Symbol("account/subs/edit-api") => 40,
                    Symbol("account/subs/delete-api") => 40,
                    Symbol("account/subs/transfer") => 40,
                    Symbol("account/settings") => 40,
                    Symbol("account/futures-market-settings") => 40,
                    Symbol("assets/margin/borrow") => 40,
                    Symbol("assets/margin/repay") => 40,
                    Symbol("assets/renewal-deposit-address") => 40,
                    Symbol("assets/withdraw") => 40,
                    Symbol("assets/cancel-withdraw") => 40,
                    Symbol("assets/transfer") => 40,
                    Symbol("assets/amm/add-liquidity") => 1,
                    Symbol("assets/amm/remove-liquidity") => 1,
                    Symbol("spot/order") => 13.334,
                    Symbol("spot/stop-order") => 13.334,
                    Symbol("spot/batch-order") => 40,
                    Symbol("spot/batch-stop-order") => 1,
                    Symbol("spot/modify-order") => 13.334,
                    Symbol("spot/modify-stop-order") => 13.334,
                    Symbol("spot/batch-modify-order") => 13.334,
                    Symbol("spot/cancel-all-order") => 1,
                    Symbol("spot/cancel-order") => 6.667,
                    Symbol("spot/cancel-stop-order") => 6.667,
                    Symbol("spot/cancel-batch-order") => 10,
                    Symbol("spot/cancel-batch-stop-order") => 10,
                    Symbol("spot/cancel-order-by-client-id") => 1,
                    Symbol("spot/cancel-stop-order-by-client-id") => 1,
                    Symbol("futures/order") => 20,
                    Symbol("futures/stop-order") => 20,
                    Symbol("futures/batch-order") => 1,
                    Symbol("futures/batch-stop-order") => 1,
                    Symbol("futures/cancel-position-stop-loss") => 20,
                    Symbol("futures/cancel-position-take-profit") => 20,
                    Symbol("futures/modify-order") => 20,
                    Symbol("futures/modify-stop-order") => 20,
                    Symbol("futures/batch-modify-order") => 20,
                    Symbol("futures/cancel-all-order") => 1,
                    Symbol("futures/cancel-order") => 10,
                    Symbol("futures/cancel-stop-order") => 10,
                    Symbol("futures/cancel-batch-order") => 20,
                    Symbol("futures/cancel-batch-stop-order") => 20,
                    Symbol("futures/cancel-order-by-client-id") => 1,
                    Symbol("futures/cancel-stop-order-by-client-id") => 1,
                    Symbol("futures/close-position") => 20,
                    Symbol("futures/adjust-position-margin") => 20,
                    Symbol("futures/adjust-position-leverage") => 20,
                    Symbol("futures/set-position-stop-loss") => 20,
                    Symbol("futures/set-position-take-profit") => 20
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("maker") => 0.001,
            Symbol("taker") => 0.001
        ),
        Symbol("funding") => Dict{Symbol, Any}(
            Symbol("withdraw") => Dict{Symbol, Any}(
                Symbol("BCH") => 0,
                Symbol("BTC") => 0.001,
                Symbol("LTC") => 0.001,
                Symbol("ETH") => 0.001,
                Symbol("ZEC") => 0.0001,
                Symbol("DASH") => 0.0001
            )
        )
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => 0.001,
            Symbol("max") => nothing
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("brokerId") => "x-167673045",
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("defaultType") => "spot",
        Symbol("defaultSubType") => "linear",
        Symbol("fetchDepositAddress") => Dict{Symbol, Any}(
            Symbol("fillResponseFromRequest") => true
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "SPOT",
            Symbol("margin") => "MARGIN",
            Symbol("swap") => "FUTURES"
        ),
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("SPOT") => "spot",
            Symbol("MARGIN") => "margin",
            Symbol("FUTURES") => "swap"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "BTC",
            Symbol("BEP20") => "BSC",
            Symbol("TRC20") => "TRC20",
            Symbol("ERC20") => "ERC20",
            Symbol("BRC20") => "BRC20",
            Symbol("SOL") => "SOL",
            Symbol("TON") => "TON",
            Symbol("BSV") => "BSV",
            Symbol("AVAXC") => "AVA_C",
            Symbol("AVAXX") => "AVA",
            Symbol("SUI") => "SUI",
            Symbol("ACA") => "ACA",
            Symbol("CHZ") => "CHILIZ",
            Symbol("ADA") => "ADA",
            Symbol("ARB") => "ARBITRUM",
            Symbol("ARBNOVA") => "ARBITRUM_NOVA",
            Symbol("OP") => "OPTIMISM",
            Symbol("APT") => "APTOS",
            Symbol("ATOM") => "ATOM",
            Symbol("FTM") => "FTM",
            Symbol("BCH") => "BCH",
            Symbol("ASTR") => "ASTR",
            Symbol("LTC") => "LTC",
            Symbol("MATIC") => "MATIC",
            Symbol("CRONOS") => "CRONOS",
            Symbol("DASH") => "DASH",
            Symbol("DOT") => "DOT",
            Symbol("ETC") => "ETC",
            Symbol("ETHW") => "ETHPOW",
            Symbol("FIL") => "FIL",
            Symbol("ZIL") => "ZIL",
            Symbol("DOGE") => "DOGE",
            Symbol("TIA") => "CELESTIA",
            Symbol("SEI") => "SEI",
            Symbol("XRP") => "XRP",
            Symbol("XMR") => "XMR"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => false,
                Symbol("takeProfitPrice") => false,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("selfTradePrevention") => true,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 5
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "spot",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("ACM") => "Actinium"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("23") => PermissionDenied,
            Symbol("24") => AuthenticationError,
            Symbol("25") => AuthenticationError,
            Symbol("34") => AuthenticationError,
            Symbol("35") => ExchangeNotAvailable,
            Symbol("36") => RequestTimeout,
            Symbol("213") => RateLimitExceeded,
            Symbol("107") => InsufficientFunds,
            Symbol("158") => PermissionDenied,
            Symbol("600") => OrderNotFound,
            Symbol("601") => InvalidOrder,
            Symbol("602") => InvalidOrder,
            Symbol("606") => InvalidOrder,
            Symbol("3008") => RequestTimeout,
            Symbol("3109") => InsufficientFunds,
            Symbol("3127") => InvalidOrder,
            Symbol("3600") => OrderNotFound,
            Symbol("3606") => InvalidOrder,
            Symbol("3610") => ExchangeError,
            Symbol("3612") => InvalidOrder,
            Symbol("3613") => InvalidOrder,
            Symbol("3614") => InvalidOrder,
            Symbol("3615") => InvalidOrder,
            Symbol("3616") => InvalidOrder,
            Symbol("3617") => InvalidOrder,
            Symbol("3618") => InvalidOrder,
            Symbol("3619") => InvalidOrder,
            Symbol("3620") => InvalidOrder,
            Symbol("3621") => InvalidOrder,
            Symbol("3622") => InvalidOrder,
            Symbol("3627") => InvalidOrder,
            Symbol("3628") => InvalidOrder,
            Symbol("3629") => InvalidOrder,
            Symbol("3632") => InvalidOrder,
            Symbol("3633") => InvalidOrder,
            Symbol("3634") => InvalidOrder,
            Symbol("3635") => InvalidOrder,
            Symbol("4001") => ExchangeNotAvailable,
            Symbol("4002") => RequestTimeout,
            Symbol("4003") => ExchangeError,
            Symbol("4004") => BadRequest,
            Symbol("4005") => AuthenticationError,
            Symbol("4006") => AuthenticationError,
            Symbol("4007") => PermissionDenied,
            Symbol("4008") => AuthenticationError,
            Symbol("4009") => ExchangeError,
            Symbol("4010") => ExchangeError,
            Symbol("4011") => PermissionDenied,
            Symbol("4017") => ExchangeError,
            Symbol("4115") => AccountSuspended,
            Symbol("4117") => BadSymbol,
            Symbol("4123") => RateLimitExceeded,
            Symbol("4130") => ExchangeError,
            Symbol("4158") => ExchangeError,
            Symbol("4213") => RateLimitExceeded,
            Symbol("4512") => PermissionDenied
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("ip not allow visit") => PermissionDenied,
            Symbol("service too busy") => ExchangeNotAvailable,
            Symbol("Service is not available during funding fee settlement") => OperationFailed
        )
    ),
    Symbol("rollingWindowSize") => 1000
))

end
function fetchCurrencies(self::Coinex, params=Dict())
    response = Base.fetch(self.v2PublicGetAssetsAllDepositWithdrawConfig(params));
    data = self.safeList(response, "data", []);
    return self.parseCurrencies(data)

end
function parseCurrency(self::Coinex, coin)
    asset = self.safeDict(coin, "asset", Dict{Symbol, Any}());
    currencyId = safeString(asset, "ccy");
    chains = self.safeList(coin, "chains", []);
    code = self.safeCurrencyCode(currencyId);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "chain");
        networkCode = self.networkIdToCode(networkId, code);
        if functions.ccxtruthy(networkId == nothing)
            j += 1; continue
        end
        network = Dict{Symbol, Any}(
            Symbol("id") => networkId,
            Symbol("network") => networkCode,
            Symbol("name") => nothing,
            Symbol("active") => nothing,
            Symbol("deposit") => self.safeBool(chain, "deposit_enabled"),
            Symbol("withdraw") => self.safeBool(chain, "withdraw_enabled"),
            Symbol("fee") => self.safeNumber(chain, "withdrawal_fee"),
            Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(chain, "withdrawal_precision"))),
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("amount") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                ),
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(chain, "min_deposit_amount"),
                    Symbol("max") => nothing
                ),
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(chain, "min_withdraw_amount"),
                    Symbol("max") => nothing
                )
            ),
            Symbol("info") => chain
        );
        networks[Symbol(networkCode)] = network;
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("name") => nothing,
    Symbol("active") => nothing,
    Symbol("deposit") => self.safeBool(asset, "deposit_enabled"),
    Symbol("withdraw") => self.safeBool(asset, "withdraw_enabled"),
    Symbol("fee") => nothing,
    Symbol("precision") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => networks,
    Symbol("type") => "crypto",
    Symbol("info") => coin
))

end
function fetchMarkets(self::Coinex, params=Dict())
    promisesUnresolved = [self.fetchSpotMarkets(params), self.fetchContractMarkets(params)];
    promises = Base.fetch(asyncmap(Base.fetch, promisesUnresolved));
    spotMarkets = get(promises, 1, nothing);
    swapMarkets = get(promises, 2, nothing);
    return arrayConcat(spotMarkets, swapMarkets)

end
function fetchSpotMarkets(self::Coinex, params)
    response = Base.fetch(self.v2PublicGetSpotMarket(params));
    markets = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "market");
        baseId = safeString(market, "base_ccy");
        quoteId = safeString(market, "quote_ccy");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        symbol = string(base, "/", quote_var);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => self.safeBool(market, "is_margin_available"),
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => self.safeBool(market, "is_api_trading_available"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => self.safeNumber(market, "taker_fee_rate"),
    Symbol("maker") => self.safeNumber(market, "maker_fee_rate"),
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(market, "base_ccy_precision"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "quote_ccy_precision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "min_amount"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function fetchContractMarkets(self::Coinex, params)
    response = Base.fetch(self.v2PublicGetFuturesMarket(params));
    markets = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        entry = get(markets, i + 1, nothing);
        fees = self.fees;
        leverages = self.safeList(entry, "leverage", []);
        subType = safeString(entry, "contract_type");
        linear = (subType == "linear");
        inverse = (subType == "inverse");
        id = safeString(entry, "market");
        baseId = safeString(entry, "base_ccy");
        quoteId = safeString(entry, "quote_ccy");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settleId = functions.ccxtruthy((subType == "linear")) ? "USDT" : baseId;
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var, ":", settle);
        leveragesLength = length(leverages);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => "swap",
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => true,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => nothing,
    Symbol("contract") => true,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => get(get(fees, Symbol("trading"), nothing), Symbol("taker"), nothing),
    Symbol("maker") => get(get(fees, Symbol("trading"), nothing), Symbol("maker"), nothing),
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(self.parsePrecision(safeString(entry, "base_ccy_precision"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(entry, "quote_ccy_precision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(leverages, 0),
            Symbol("max") => self.safeNumber(leverages, leveragesLength - 1)
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(entry, "min_amount"),
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => entry
));
        i += 1
    end
    return result

end
function parseTicker(self::Coinex, ticker, market=nothing)
    marketType = functions.ccxtruthy((ccxt_in("mark_price", ticker))) ? "swap" : "spot";
    marketId = safeString(ticker, "market");
    symbol = self.safeSymbol(marketId, market, nothing, marketType);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => nothing,
    Symbol("bidVolume") => safeString(ticker, "volume_buy"),
    Symbol("ask") => nothing,
    Symbol("askVolume") => safeString(ticker, "volume_sell"),
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => safeString(ticker, "close"),
    Symbol("last") => safeString(ticker, "last"),
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "volume"),
    Symbol("quoteVolume") => nothing,
    Symbol("markPrice") => safeString(ticker, "mark_price"),
    Symbol("indexPrice") => safeString(ticker, "index_price"),
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Coinex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.v2PublicGetFuturesTicker(extend(request, params)));
    else
        response = Base.fetch(self.v2PublicGetSpotTicker(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    result = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTicker(result, market)

end
function fetchTickers(self::Coinex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbol = safeValue(symbols, 0);
        market = self.market(symbol);
    end
    (marketType, query) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    response = nothing;
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.v2PublicGetFuturesTicker(query));
    else
        response = Base.fetch(self.v2PublicGetSpotTicker(query));
    end
    data = self.safeList(response, "data", []);
    return self.parseTickers(data, symbols)

end
function fetchTime(self::Coinex, params=Dict())
    response = Base.fetch(self.v2PublicGetTime(params));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return safeInteger(data, "timestamp")

end
function fetchOrderBook(self::Coinex, symbol, limit=20, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(limit == nothing)
        limit = 20;
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("limit") => limit,
        Symbol("interval") => "0"
    );
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.v2PublicGetFuturesDepth(extend(request, params)));
    else
        response = Base.fetch(self.v2PublicGetSpotDepth(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    depth = self.safeDict(data, "depth", Dict{Symbol, Any}());
    timestamp = safeInteger(depth, "updated_at");
    return self.parseOrderBook(depth, symbol, timestamp)

end
function parseTrade(self::Coinex, trade, market=nothing)
    timestamp = safeInteger(trade, "created_at");
    defaultType = safeString(self.options, "defaultType");
    if functions.ccxtruthy(market != nothing)
        defaultType = get(market, Symbol("type"), nothing);
    end
    marketId = safeString(trade, "market");
    market = self.safeMarket(marketId, market, nothing, defaultType);
    feeCostString = safeString(trade, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyId = safeString(trade, "fee_ccy");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrencyCode
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("id") => safeString(trade, "deal_id"),
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("type") => nothing,
    Symbol("side") => safeString(trade, "side"),
    Symbol("takerOrMaker") => safeString(trade, "role"),
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString(trade, "amount"),
    Symbol("cost") => safeString(trade, "deal_money"),
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Coinex, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, 1000);
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.v2PublicGetFuturesDeals(extend(request, params)));
    else
        response = Base.fetch(self.v2PublicGetSpotDeals(extend(request, params)));
    end
    return self.parseTrades(get(response, Symbol("data"), nothing), market, since, limit)

end
function fetchTradingFee(self::Coinex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.v2PublicGetSpotMarket(extend(request, params)));
    else
        response = Base.fetch(self.v2PublicGetFuturesMarket(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    result = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTradingFee(result, market)

end
function fetchTradingFees(self::Coinex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTradingFees", nothing, params);
    if functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.v2PublicGetFuturesMarket(params));
    else
        response = Base.fetch(self.v2PublicGetSpotMarket(params));
    end
    data = self.safeList(response, "data", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        marketId = safeString(entry, "market");
        market = self.safeMarket(marketId, nothing, nothing, type_var);
        symbol = get(market, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = self.parseTradingFee(entry, market);
        i += 1
    end
    return result

end
function parseTradingFee(self::Coinex, fee, market=nothing)
    marketId = safeValue(fee, "market");
    symbol = self.safeSymbol(marketId, market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "maker_fee_rate"),
    Symbol("taker") => self.safeNumber(fee, "taker_fee_rate"),
    Symbol("percentage") => true,
    Symbol("tierBased") => true
)

end
function parseOHLCV(self::Coinex, ohlcv, market=nothing)
    return [safeInteger(ohlcv, "created_at"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "value")]

end
function fetchOHLCV(self::Coinex, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("period") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.v2PublicGetFuturesKline(extend(request, params)));
    else
        response = Base.fetch(self.v2PublicGetSpotKline(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    return self.parseOHLCVs(data, market, timeframe, since, limit)

end
function fetchMarginBalance(self::Coinex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PrivateGetAssetsMarginBalance(params));
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeList(response, "data", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        entry = get(balances, i + 1, nothing);
        free = self.safeDict(entry, "available", Dict{Symbol, Any}());
        used = self.safeDict(entry, "frozen", Dict{Symbol, Any}());
        loan = self.safeDict(entry, "repaid", Dict{Symbol, Any}());
        interest = self.safeDict(entry, "interest", Dict{Symbol, Any}());
        baseAccount = self.account();
        baseCurrencyId = safeString(entry, "base_ccy");
        baseCurrencyCode = self.safeCurrencyCode(baseCurrencyId);
        baseAccount[Symbol("free")] = safeString(free, "base_ccy");
        baseAccount[Symbol("used")] = safeString(used, "base_ccy");
        baseDebt = safeString(loan, "base_ccy");
        baseInterest = safeString(interest, "base_ccy");
        baseAccount[Symbol("debt")] = stringAdd(baseDebt, baseInterest);
        result[Symbol(baseCurrencyCode)] = baseAccount;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchSpotBalance(self::Coinex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PrivateGetAssetsSpotBalance(params));
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeList(response, "data", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        entry = get(balances, i + 1, nothing);
        currencyId = safeString(entry, "ccy");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(entry, "available");
        account[Symbol("used")] = safeString(entry, "frozen");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchSwapBalance(self::Coinex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PrivateGetAssetsFuturesBalance(params));
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeList(response, "data", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        entry = get(balances, i + 1, nothing);
        currencyId = safeString(entry, "ccy");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(entry, "available");
        account[Symbol("used")] = safeString(entry, "frozen");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchFinancialBalance(self::Coinex, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PrivateGetAssetsFinancialBalance(params));
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeList(response, "data", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        entry = get(balances, i + 1, nothing);
        currencyId = safeString(entry, "ccy");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(entry, "available");
        account[Symbol("used")] = safeString(entry, "frozen");
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Coinex, params=Dict())
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBalance", params);
    isMargin = @functions.ccxt_or((marginMode != nothing), (marketType == "margin"));
    if functions.ccxtruthy(marketType == "swap")
            return Base.fetch(self.fetchSwapBalance(params))
    elseif functions.ccxtruthy(marketType == "financial")
        return Base.fetch(self.fetchFinancialBalance(params))
    else
        if functions.ccxtruthy(isMargin)
                return Base.fetch(self.fetchMarginBalance(params))
        else
            return Base.fetch(self.fetchSpotBalance(params))
        end

    end

end
function parseOrderStatus(self::Coinex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("rejected") => "rejected",
        Symbol("open") => "open",
        Symbol("not_deal") => "open",
        Symbol("part_deal") => "open",
        Symbol("done") => "closed",
        Symbol("cancel") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Coinex, order, market=nothing)
    rawStatus = safeString(order, "status");
    timestamp = safeInteger(order, "created_at");
    updatedTimestamp = safeInteger(order, "updated_at");
    if functions.ccxtruthy(updatedTimestamp == 0)
        updatedTimestamp = timestamp;
    end
    marketId = safeString(order, "market");
    defaultType = safeString(self.options, "defaultType");
    orderType = safeStringLower(order, "market_type", defaultType);
    if functions.ccxtruthy(orderType == "futures")
        orderType = "swap";
    end
    marketType = functions.ccxtruthy((orderType == "swap")) ? "swap" : "spot";
    market = self.safeMarket(marketId, market, nothing, marketType);
    feeCurrencyId = safeString(order, "fee_ccy");
    feeCurrency = self.safeCurrencyCode(feeCurrencyId);
    if functions.ccxtruthy(feeCurrency == nothing)
        feeCurrency = get(market, Symbol("quote"), nothing);
    end
    side = safeString(order, "side");
    if functions.ccxtruthy(side == "long")
        side = "buy";
    elseif functions.ccxtruthy(side == "short")
        side = "sell";
    end
    clientOrderId = safeString(order, "client_id");
    if functions.ccxtruthy(clientOrderId == "")
        clientOrderId = nothing;
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeStringN(order, ["position_id", "order_id", "stop_id"]),
    Symbol("clientOrderId") => clientOrderId,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("lastTradeTimestamp") => updatedTimestamp,
    Symbol("status") => self.parseOrderStatus(rawStatus),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => safeString(order, "type"),
    Symbol("timeInForce") => nothing,
    Symbol("postOnly") => nothing,
    Symbol("reduceOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => safeString(order, "trigger_price"),
    Symbol("takeProfitPrice") => self.safeNumber(order, "take_profit_price"),
    Symbol("stopLossPrice") => self.safeNumber(order, "stop_loss_price"),
    Symbol("cost") => safeString(order, "filled_value"),
    Symbol("average") => safeString(order, "avg_entry_price"),
    Symbol("amount") => safeString(order, "amount"),
    Symbol("filled") => safeString(order, "filled_amount"),
    Symbol("remaining") => safeString(order, "unfilled_amount"),
    Symbol("trades") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => feeCurrency,
        Symbol("cost") => safeString2(order, "quote_fee", "fee")
    ),
    Symbol("info") => order
), market)

end
function createMarketBuyOrderWithCost(self::Coinex, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    params[Symbol("createMarketBuyOrderRequiresPrice")] = false;
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, nothing, params))

end
function createOrderRequest(self::Coinex, symbol, type_var, side, amount, price=nothing, params=Dict())
    market = self.market(symbol);
    swap = get(market, Symbol("swap"), nothing);
    clientOrderId = safeString2(params, "client_id", "clientOrderId");
    triggerPrice = safeString2(params, "stopPrice", "triggerPrice");
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    option = safeString(params, "option");
    isMarketOrder = type_var == "market";
    postOnly = self.isPostOnly(isMarketOrder, option == "maker_only", params);
    timeInForceRaw = safeStringUpper(params, "timeInForce");
    reduceOnly = self.safeBool(params, "reduceOnly");
    if functions.ccxtruthy(reduceOnly)
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
            throw(InvalidOrder(string(self.id, " createOrder() does not support reduceOnly for ", get(market, Symbol("type"), nothing), " orders, reduceOnly orders are supported for swap markets only")));
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(clientOrderId == nothing)
        defaultId = "x-167673045";
        brokerId = safeString(self.options, "brokerId", defaultId);
        request[Symbol("client_id")] = string(brokerId, "-", uuid16());
    else
        request[Symbol("client_id")] = clientOrderId;
    end
    if functions.ccxtruthy(@functions.ccxt_and((stopLossPrice == nothing), (takeProfitPrice == nothing)))
        if functions.ccxtruthy(!functions.ccxtruthy(reduceOnly))
            request[Symbol("side")] = side;
        end
        requestType = type_var;
        if functions.ccxtruthy(postOnly)
            requestType = "maker_only";
        elseif functions.ccxtruthy(timeInForceRaw != nothing)
            if functions.ccxtruthy(timeInForceRaw == "IOC")
                requestType = "ioc";
            elseif functions.ccxtruthy(timeInForceRaw == "FOK")
                requestType = "fok";
            end
        end
        if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        end
        request[Symbol("type")] = requestType;
    end
    if functions.ccxtruthy(swap)
        request[Symbol("market_type")] = "FUTURES";
        if functions.ccxtruthy(@functions.ccxt_or(stopLossPrice, takeProfitPrice))
            if functions.ccxtruthy(stopLossPrice)
                request[Symbol("stop_loss_price")] = self.priceToPrecision(symbol, stopLossPrice);
                request[Symbol("stop_loss_type")] = safeString(params, "stop_type", "latest_price");
            elseif functions.ccxtruthy(takeProfitPrice)
                request[Symbol("take_profit_price")] = self.priceToPrecision(symbol, takeProfitPrice);
                request[Symbol("take_profit_type")] = safeString(params, "stop_type", "latest_price");
            end
        else
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
            if functions.ccxtruthy(triggerPrice != nothing)
                request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
                request[Symbol("trigger_price_type")] = safeString(params, "stop_type", "latest_price");
            end
        end
    else
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("createOrder", params);
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("market_type")] = "MARGIN";
        else
            request[Symbol("market_type")] = "SPOT";
        end
        if functions.ccxtruthy(@functions.ccxt_and((type_var == "market"), (side == "buy")))
            createMarketBuyOrderRequiresPrice = true;
            (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", true);
            cost = self.safeNumber(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(@functions.ccxt_and((price == nothing), (cost == nothing)))
                    throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    quoteAmount = self.parseToNumeric(stringMul(amountString, priceString));
                    costRequest = functions.ccxtruthy((cost != nothing)) ? cost : quoteAmount;
                    request[Symbol("amount")] = self.costToPrecision(symbol, costRequest);
                end
            else
                request[Symbol("amount")] = self.costToPrecision(symbol, amount);
            end
        else
            request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
        end
        if functions.ccxtruthy(triggerPrice != nothing)
            request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
        end
    end
    params = omit(params, ["reduceOnly", "timeInForce", "postOnly", "stopPrice", "triggerPrice", "stopLossPrice", "takeProfitPrice"]);
    return extend(request, params)

end
function createOrder(self::Coinex, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    reduceOnly = self.safeBool(params, "reduceOnly");
    triggerPrice = safeString2(params, "stopPrice", "triggerPrice");
    stopLossTriggerPrice = safeString(params, "stopLossPrice");
    takeProfitTriggerPrice = safeString(params, "takeProfitPrice");
    isTriggerOrder = triggerPrice != nothing;
    isStopLossTriggerOrder = stopLossTriggerPrice != nothing;
    isTakeProfitTriggerOrder = takeProfitTriggerPrice != nothing;
    isStopLossOrTakeProfitTrigger = @functions.ccxt_or(isStopLossTriggerOrder, isTakeProfitTriggerOrder);
    request = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(isTriggerOrder)
            response = Base.fetch(self.v2PrivatePostSpotStopOrder(request));
        else
            response = Base.fetch(self.v2PrivatePostSpotOrder(request));
        end
    else
        if functions.ccxtruthy(isTriggerOrder)
            response = Base.fetch(self.v2PrivatePostFuturesStopOrder(request));
        elseif functions.ccxtruthy(isStopLossOrTakeProfitTrigger)
            if functions.ccxtruthy(isStopLossTriggerOrder)
                response = Base.fetch(self.v2PrivatePostFuturesSetPositionStopLoss(request));
            elseif functions.ccxtruthy(isTakeProfitTriggerOrder)
                response = Base.fetch(self.v2PrivatePostFuturesSetPositionTakeProfit(request));
            end
        else
            if functions.ccxtruthy(reduceOnly)
                response = Base.fetch(self.v2PrivatePostFuturesClosePosition(request));
            else
                response = Base.fetch(self.v2PrivatePostFuturesOrder(request));
            end
        end
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function createOrders(self::Coinex, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    symbol = nothing;
    reduceOnly = false;
    isTriggerOrder = false;
    isStopLossOrTakeProfitTrigger = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        if functions.ccxtruthy(symbol == nothing)
            symbol = marketId;
        else
            if functions.ccxtruthy(symbol != marketId)
                throw(BadRequest(string(self.id, " createOrders() requires all orders to have the same symbol")));
            end
        end
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = safeValue(rawOrder, "params", Dict{Symbol, Any}());
        if functions.ccxtruthy(type_var != "limit")
            throw(NotSupported(string(self.id, " createOrders() does not support ", type_var, " orders, only limit orders are accepted")));
        end
        reduceOnly = safeValue(orderParams, "reduceOnly");
        triggerPrice = self.safeNumber2(orderParams, "stopPrice", "triggerPrice");
        stopLossTriggerPrice = self.safeNumber(orderParams, "stopLossPrice");
        takeProfitTriggerPrice = self.safeNumber(orderParams, "takeProfitPrice");
        isTriggerOrder = triggerPrice != nothing;
        isStopLossTriggerOrder = stopLossTriggerPrice != nothing;
        isTakeProfitTriggerOrder = takeProfitTriggerPrice != nothing;
        isStopLossOrTakeProfitTrigger = @functions.ccxt_or(isStopLossTriggerOrder, isTakeProfitTriggerOrder);
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price, orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("orders") => ordersRequests
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(isTriggerOrder)
            response = Base.fetch(self.v2PrivatePostSpotBatchStopOrder(request));
        else
            response = Base.fetch(self.v2PrivatePostSpotBatchOrder(request));
        end
    else
        if functions.ccxtruthy(isTriggerOrder)
            response = Base.fetch(self.v2PrivatePostFuturesBatchStopOrder(request));
        elseif functions.ccxtruthy(isStopLossOrTakeProfitTrigger)
            throw(NotSupported(string(self.id, " createOrders() does not support stopLossPrice or takeProfitPrice orders")));
        else
            if functions.ccxtruthy(reduceOnly)
                throw(NotSupported(string(self.id, " createOrders() does not support reduceOnly orders")));
            else
                response = Base.fetch(self.v2PrivatePostFuturesBatchOrder(request));
            end
        end
    end
    data = self.safeList(response, "data", []);
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        status = nothing;
        code = safeInteger(entry, "code");
        if functions.ccxtruthy(code != nothing)
            if functions.ccxtruthy(code != 0)
                status = "rejected";
            else
                status = "open";
            end
        end
        innerData = self.safeDict(entry, "data", Dict{Symbol, Any}());
        if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), !functions.ccxtruthy(isTriggerOrder)))
            entry[Symbol("status")] = status;
            order = self.parseOrder(entry, market);
        else
            innerData[Symbol("status")] = status;
            order = self.parseOrder(innerData, market);
        end
        push!(results, order);
        i += 1
    end
    return results

end
function cancelOrders(self::Coinex, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    response = nothing;
    requestIds = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        push!(requestIds, ccxt_parseInt(get(ids, i + 1, nothing)));
        i += 1
    end
    if functions.ccxtruthy(trigger)
        request[Symbol("stop_ids")] = requestIds;
    else
        request[Symbol("order_ids")] = requestIds;
    end
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.v2PrivatePostSpotCancelBatchStopOrder(extend(request, params)));
        else
            response = Base.fetch(self.v2PrivatePostSpotCancelBatchOrder(extend(request, params)));
        end
    else
        request[Symbol("market_type")] = "FUTURES";
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.v2PrivatePostFuturesCancelBatchStopOrder(extend(request, params)));
        else
            response = Base.fetch(self.v2PrivatePostFuturesCancelBatchOrder(extend(request, params)));
        end
    end
    data = self.safeList(response, "data", []);
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        item = self.safeDict(entry, "data", Dict{Symbol, Any}());
        order = self.parseOrder(item, market);
        push!(results, order);
        i += 1
    end
    return results

end
function editOrder(self::Coinex, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    response = nothing;
    triggerPrice = safeStringN(params, ["stopPrice", "triggerPrice", "trigger_price"]);
    params = omit(params, ["stopPrice", "triggerPrice"]);
    isTriggerOrder = triggerPrice != nothing;
    if functions.ccxtruthy(isTriggerOrder)
        request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("stop_id")] = self.parseToNumeric(id);
    else
        request[Symbol("order_id")] = self.parseToNumeric(id);
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("editOrder", params);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("market_type")] = "MARGIN";
        else
            request[Symbol("market_type")] = "SPOT";
        end
        if functions.ccxtruthy(isTriggerOrder)
            response = Base.fetch(self.v2PrivatePostSpotModifyStopOrder(extend(request, params)));
        else
            response = Base.fetch(self.v2PrivatePostSpotModifyOrder(extend(request, params)));
        end
    else
        request[Symbol("market_type")] = "FUTURES";
        if functions.ccxtruthy(isTriggerOrder)
            response = Base.fetch(self.v2PrivatePostFuturesModifyStopOrder(extend(request, params)));
        else
            response = Base.fetch(self.v2PrivatePostFuturesModifyOrder(extend(request, params)));
        end
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function editOrders(self::Coinex, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    orderSymbols = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        market = self.market(marketId);
        push!(orderSymbols, marketId);
        id = safeString(rawOrder, "id");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        marginMode = nothing;
        (marginMode, orderParams) = self.handleMarginModeAndParams("editOrders", orderParams);
        market_type = "SPOT";
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            market_type = "FUTURES";
        elseif functions.ccxtruthy(marginMode != nothing)
            market_type = "MARGIN";
        end
        orderRequest = Dict{Symbol, Any}(
            Symbol("order_id") => self.parseToNumeric(id),
            Symbol("market") => get(market, Symbol("id"), nothing),
            Symbol("market_type") => market_type
        );
        if functions.ccxtruthy(amount != nothing)
            orderRequest[Symbol("amount")] = self.amountToPrecision(marketId, amount);
        end
        if functions.ccxtruthy(price != nothing)
            orderRequest[Symbol("price")] = self.priceToPrecision(marketId, price);
        end
        push!(ordersRequests, extend(orderRequest, orderParams));
        i += 1
    end
    orderSymbols = self.marketSymbols(orderSymbols, nothing, false, true, true);
    firstSymbol = safeString(orderSymbols, 0);
    firstMarket = self.market(firstSymbol);
    request = Dict{Symbol, Any}(
        Symbol("orders") => ordersRequests
    );
    response = nothing;
    if functions.ccxtruthy(get(firstMarket, Symbol("spot"), nothing))
        response = Base.fetch(self.v2PrivatePostSpotBatchModifyOrder(extend(request, params)));
    else
        response = Base.fetch(self.v2PrivatePostFuturesBatchModifyOrder(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        code = safeString(entry, "code");
        message = safeString(entry, "message", "");
        if functions.ccxtruthy(@functions.ccxt_or((code != "0"), (@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((message != "Success"), (message != "Succeeded")), (lowercase(message) != "ok")), !functions.ccxtruthy(data)))))
            feedback = string(self.id, " ", message);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
            throw(ExchangeError(feedback));
        end
        item = self.safeDict(entry, "data", Dict{Symbol, Any}());
        order = self.parseOrder(item);
        push!(result, order);
        i += 1
    end
    return result

end
function cancelOrder(self::Coinex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isTriggerOrder = self.safeBool2(params, "stop", "trigger");
    swap = get(market, Symbol("swap"), nothing);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("cancelOrder", params);
    if functions.ccxtruthy(swap)
        request[Symbol("market_type")] = "FUTURES";
    else
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("market_type")] = "MARGIN";
        else
            request[Symbol("market_type")] = "SPOT";
        end
    end
    clientOrderId = safeString2(params, "client_id", "clientOrderId");
    params = omit(params, ["stop", "trigger", "clientOrderId"]);
    response = nothing;
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_id")] = clientOrderId;
        if functions.ccxtruthy(isTriggerOrder)
            if functions.ccxtruthy(swap)
                response = Base.fetch(self.v2PrivatePostFuturesCancelStopOrderByClientId(extend(request, params)));
            else
                response = Base.fetch(self.v2PrivatePostSpotCancelStopOrderByClientId(extend(request, params)));
            end
        else
            if functions.ccxtruthy(swap)
                response = Base.fetch(self.v2PrivatePostFuturesCancelOrderByClientId(extend(request, params)));
            else
                response = Base.fetch(self.v2PrivatePostSpotCancelOrderByClientId(extend(request, params)));
            end
        end
    else
        if functions.ccxtruthy(isTriggerOrder)
            request[Symbol("stop_id")] = self.parseToNumeric(id);
            if functions.ccxtruthy(swap)
                response = Base.fetch(self.v2PrivatePostFuturesCancelStopOrder(extend(request, params)));
            else
                response = Base.fetch(self.v2PrivatePostSpotCancelStopOrder(extend(request, params)));
            end
        else
            request[Symbol("order_id")] = self.parseToNumeric(id);
            if functions.ccxtruthy(swap)
                response = Base.fetch(self.v2PrivatePostFuturesCancelOrder(extend(request, params)));
            else
                response = Base.fetch(self.v2PrivatePostSpotCancelOrder(extend(request, params)));
            end
        end
    end
    data = nothing;
    if functions.ccxtruthy(clientOrderId != nothing)
        rows = self.safeList(response, "data", []);
        data = self.safeDict(get(rows, 1, nothing), "data", Dict{Symbol, Any}());
    else
        data = self.safeDict(response, "data", Dict{Symbol, Any}());
    end
    return self.parseOrder(data, market)

end
function cancelAllOrders(self::Coinex, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("market_type")] = "FUTURES";
        response = Base.fetch(self.v2PrivatePostFuturesCancelAllOrder(extend(request, params)));
    else
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("cancelAllOrders", params);
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("market_type")] = "MARGIN";
        else
            request[Symbol("market_type")] = "SPOT";
        end
        response = Base.fetch(self.v2PrivatePostSpotCancelAllOrder(extend(request, params)));
    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function fetchOrder(self::Coinex, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("order_id") => self.parseToNumeric(id)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.v2PrivateGetFuturesOrderStatus(extend(request, params)));
    else
        response = Base.fetch(self.v2PrivateGetSpotOrderStatus(extend(request, params)));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function fetchOrdersByStatus(self::Coinex, status, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrdersByStatus", market, params);
    response = nothing;
    isClosed = @functions.ccxt_or((status == "finished"), (status == "closed"));
    isOpen = @functions.ccxt_or((status == "pending"), (status == "open"));
    if functions.ccxtruthy(marketType == "swap")
        request[Symbol("market_type")] = "FUTURES";
        if functions.ccxtruthy(isClosed)
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.v2PrivateGetFuturesFinishedStopOrder(extend(request, params)));
            else
                response = Base.fetch(self.v2PrivateGetFuturesFinishedOrder(extend(request, params)));
            end
        elseif functions.ccxtruthy(isOpen)
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.v2PrivateGetFuturesPendingStopOrder(extend(request, params)));
            else
                response = Base.fetch(self.v2PrivateGetFuturesPendingOrder(extend(request, params)));
            end
        end
    else
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("fetchOrdersByStatus", params);
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("market_type")] = "MARGIN";
        else
            request[Symbol("market_type")] = "SPOT";
        end
        if functions.ccxtruthy(isClosed)
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.v2PrivateGetSpotFinishedStopOrder(extend(request, params)));
            else
                response = Base.fetch(self.v2PrivateGetSpotFinishedOrder(extend(request, params)));
            end
        elseif functions.ccxtruthy(status == "pending")
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.v2PrivateGetSpotPendingStopOrder(extend(request, params)));
            else
                response = Base.fetch(self.v2PrivateGetSpotPendingOrder(extend(request, params)));
            end
        end
    end
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function fetchOpenOrders(self::Coinex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    openOrders = Base.fetch(self.fetchOrdersByStatus("pending", symbol, since, limit, params));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(openOrders)))
        openOrders[i + 1][Symbol("status")] = "open";
        i += 1
    end
    return openOrders

end
function fetchClosedOrders(self::Coinex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("finished", symbol, since, limit, params))

end
function createDepositAddress(self::Coinex, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    network = safeString2(params, "chain", "network");
    if functions.ccxtruthy(network == nothing)
        throw(ArgumentsRequired(string(self.id, " createDepositAddress() requires a network parameter")));
    end
    params = omit(params, "network");
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing),
        Symbol("chain") => self.networkCodeToId(network, get(currency, Symbol("code"), nothing))
    );
    response = Base.fetch(self.v2PrivatePostAssetsRenewalDepositAddress(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency)

end
function fetchDepositAddress(self::Coinex, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing)
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() requires a \"network\" parameter")));
    end
    request[Symbol("chain")] = self.networkCodeToId(networkCode, get(currency, Symbol("code"), nothing));
    response = Base.fetch(self.v2PrivateGetAssetsDepositAddress(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency)

end
function parseDepositAddress(self::Coinex, depositAddress, currency=nothing)
    coinAddress = safeString(depositAddress, "address", "");
    parts = split(coinAddress, ":");
    address = nothing;
    tag = nothing;
    partsLength = length(parts);
    if functions.ccxtruthy(@functions.ccxt_and(functions.ccxt_gt(partsLength, 1), get(parts, 1, nothing) != "cfx"))
        address = get(parts, 1, nothing);
        tag = get(parts, 2, nothing);
    else
        address = coinAddress;
    end
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => self.safeCurrencyCode(nothing, currency),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => safeString(depositAddress, "memo", tag)
)

end
function fetchMyTrades(self::Coinex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("market_type")] = "FUTURES";
        response = Base.fetch(self.v2PrivateGetFuturesUserDeals(extend(request, params)));
    else
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params);
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("market_type")] = "MARGIN";
        else
            request[Symbol("market_type")] = "SPOT";
        end
        response = Base.fetch(self.v2PrivateGetSpotUserDeals(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function fetchPositions(self::Coinex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    defaultMethod = nothing;
    (defaultMethod, params) = self.handleOptionAndParams(params, "fetchPositions", "method", "v2PrivateGetFuturesPendingPosition");
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}(
        Symbol("market_type") => "FUTURES"
    );
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbol = nothing;
        if functions.ccxtruthy(functions.ccxt_isArray(symbols))
            symbolsLength = length(symbols);
            if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 1))
                throw(BadRequest(string(self.id, " fetchPositions() symbols argument cannot contain more than 1 symbol")));
            end
            symbol = get(symbols, 1, nothing);
        else
            symbol = symbols;
        end
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(defaultMethod == "v2PrivateGetFuturesPendingPosition")
        response = Base.fetch(self.v2PrivateGetFuturesPendingPosition(extend(request, params)));
    else
        response = Base.fetch(self.v2PrivateGetFuturesFinishedPosition(extend(request, params)));
    end
    position = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(position)))
        push!(result, self.parsePosition(get(position, i + 1, nothing), market));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", symbols, false)

end
function fetchPosition(self::Coinex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market_type") => "FUTURES",
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v2PrivateGetFuturesPendingPosition(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parsePosition(get(data, 1, nothing), market)

end
function parsePosition(self::Coinex, position, market=nothing)
    marketId = safeString(position, "market");
    market = self.safeMarket(marketId, market, nothing, "swap");
    timestamp = safeInteger(position, "created_at");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeInteger(position, "position_id"),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("notional") => self.safeNumber(position, "settle_value"),
    Symbol("marginMode") => safeString(position, "margin_mode"),
    Symbol("liquidationPrice") => self.safeNumber(position, "liq_price"),
    Symbol("entryPrice") => self.safeNumber(position, "avg_entry_price"),
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealized_pnl"),
    Symbol("realizedPnl") => self.safeNumber(position, "realized_pnl"),
    Symbol("percentage") => nothing,
    Symbol("contracts") => self.safeNumber(position, "close_avbl"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => nothing,
    Symbol("side") => safeString(position, "side"),
    Symbol("hedged") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeInteger(position, "updated_at"),
    Symbol("maintenanceMargin") => self.safeNumber(position, "maintenance_margin_value"),
    Symbol("maintenanceMarginPercentage") => self.safeNumber(position, "maintenance_margin_rate"),
    Symbol("collateral") => self.safeNumber(position, "margin_avbl"),
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("marginRatio") => self.safeNumber(position, "position_margin_rate"),
    Symbol("stopLossPrice") => omitZero(safeString(position, "stop_loss_price")),
    Symbol("takeProfitPrice") => omitZero(safeString(position, "take_profit_price"))
))

end
function setMarginMode(self::Coinex, marginMode, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    marginMode = lowercase(marginMode);
    if functions.ccxtruthy(@functions.ccxt_and(marginMode != "isolated", marginMode != "cross"))
        throw(BadRequest(string(self.id, " setMarginMode() marginMode argument should be isolated or cross")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("type"), nothing) != "swap")
        throw(BadSymbol(string(self.id, " setMarginMode() supports swap contracts only")));
    end
    leverage = safeInteger(params, "leverage");
    maxLeverage = safeInteger(get(get(market, Symbol("limits"), nothing), Symbol("leverage"), nothing), "max", 100);
    if functions.ccxtruthy(leverage == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a leverage parameter")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, maxLeverage))))
        throw(BadRequest(string(self.id, " setMarginMode() leverage should be between 1 and ", maxLeverage, " for ", symbol)));
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("market_type") => "FUTURES",
        Symbol("margin_mode") => marginMode,
        Symbol("leverage") => leverage
    );
    return Base.fetch(self.v2PrivatePostFuturesAdjustPositionLeverage(extend(request, params)))

end
function setLeverage(self::Coinex, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " setLeverage() supports swap contracts only")));
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params, "cross");
    minLeverage = safeInteger(get(get(market, Symbol("limits"), nothing), Symbol("leverage"), nothing), "min", 1);
    maxLeverage = safeInteger(get(get(market, Symbol("limits"), nothing), Symbol("leverage"), nothing), "max", 100);
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, minLeverage)), (functions.ccxt_gt(leverage, maxLeverage))))
        throw(BadRequest(string(self.id, " setLeverage() leverage should be between ", minLeverage, " and ", maxLeverage, " for ", symbol)));
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("market_type") => "FUTURES",
        Symbol("margin_mode") => marginMode,
        Symbol("leverage") => leverage
    );
    return Base.fetch(self.v2PrivatePostFuturesAdjustPositionLeverage(extend(request, params)))

end
function fetchLeverageTiers(self::Coinex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        marketIds = self.marketIds(symbols);
        request[Symbol("market")] =         join(marketIds, ",");
    end
    response = Base.fetch(self.v2PublicGetFuturesPositionLevel(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseLeverageTiers(data, symbols, "market")

end
function parseMarketLeverageTiers(self::Coinex, info, market=nothing)
    tiers = [];
    brackets = self.safeList(info, "level", []);
    minNotional = 0;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(brackets)))
        tier = get(brackets, i + 1, nothing);
        marketId = safeString(info, "market");
        market = self.safeMarket(marketId, market, nothing, "swap");
        maxNotional = self.safeNumber(tier, "amount");
        curr = functions.ccxtruthy(get(market, Symbol("linear"), nothing)) ? get(market, Symbol("base"), nothing) : get(market, Symbol("quote"), nothing);
        notional = minNotional;
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.sum(i, 1),
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "swap"),
    Symbol("currency") => curr,
    Symbol("minNotional") => notional,
    Symbol("maxNotional") => maxNotional,
    Symbol("maintenanceMarginRate") => self.safeNumber(tier, "maintenance_margin_rate"),
    Symbol("maxLeverage") => safeInteger(tier, "leverage"),
    Symbol("info") => tier
));
        minNotional = maxNotional;
        i += 1
    end
    return tiers

end
function modifyMarginHelper(self::Coinex, symbol, amount, addOrReduce, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    rawAmount = self.amountToPrecision(symbol, amount);
    requestAmount = rawAmount;
    if functions.ccxtruthy(addOrReduce == "reduce")
        requestAmount = stringNeg(rawAmount);
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("market_type") => "FUTURES",
        Symbol("amount") => requestAmount
    );
    response = Base.fetch(self.v2PrivatePostFuturesAdjustPositionMargin(extend(request, params)));
    data = self.safeDict(response, "data");
    status = safeStringLower(response, "message");
    type_var = functions.ccxtruthy((addOrReduce == "reduce")) ? "reduce" : "add";
    return extend(self.parseMarginModification(data, market), Dict{Symbol, Any}(
    Symbol("type") => type_var,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("status") => status
))

end
function parseMarginModification(self::Coinex, data, market=nothing)
    marketId = safeString(data, "market");
    timestamp = safeInteger2(data, "updated_at", "created_at");
    change = safeString(data, "margin_change");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "swap"),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => self.parseNumber(stringAbs(change)),
    Symbol("total") => self.safeNumber(data, "margin_avbl"),
    Symbol("code") => safeString(market, "quote"),
    Symbol("status") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function addMargin(self::Coinex, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params))

end
function reduceMargin(self::Coinex, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "reduce", params))

end
function fetchFundingHistory(self::Coinex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("market_type") => "FUTURES"
    );
    (request, params) = self.handleUntilOption("end_time", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v2PrivateGetFuturesPositionFundingHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        timestamp = safeInteger(entry, "created_at");
        currencyId = safeString(entry, "ccy");
        code = self.safeCurrencyCode(currencyId);
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbol,
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => self.safeNumber(entry, "position_id"),
    Symbol("amount") => self.safeNumber(entry, "funding_value")
));
        i += 1
    end
    return result

end
function fetchFundingRate(self::Coinex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v2PublicGetFuturesFundingRate(extend(request, params)));
    data = self.safeList(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseFundingRate(first_var, market)

end
function fetchFundingInterval(self::Coinex, symbol, params=Dict())
    return Base.fetch(self.fetchFundingRate(symbol, params))

end
function parseFundingRate(self::Coinex, contract, market=nothing)
    currentFundingTimestamp = safeInteger(contract, "latest_funding_time");
    futureFundingTimestamp = safeInteger(contract, "next_funding_time");
    fundingTimeString = safeString(contract, "latest_funding_time");
    nextFundingTimeString = safeString(contract, "next_funding_time");
    millisecondsInterval = stringSub(nextFundingTimeString, fundingTimeString);
    marketId = safeString(contract, "market");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "swap"),
    Symbol("markPrice") => self.safeNumber(contract, "mark_price"),
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "latest_funding_rate"),
    Symbol("fundingTimestamp") => currentFundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(currentFundingTimestamp),
    Symbol("nextFundingRate") => self.safeNumber(contract, "next_funding_rate"),
    Symbol("nextFundingTimestamp") => futureFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(futureFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => self.parseFundingInterval(millisecondsInterval)
)

end
function parseFundingInterval(self::Coinex, interval)
    intervals = Dict{Symbol, Any}(
        Symbol("3600000") => "1h",
        Symbol("14400000") => "4h",
        Symbol("28800000") => "8h",
        Symbol("57600000") => "16h",
        Symbol("86400000") => "24h"
    );
    return safeString(intervals, interval, interval)

end
function fetchFundingRates(self::Coinex, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbol = safeValue(symbols, 0);
        market = self.market(symbol);
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
            throw(BadSymbol(string(self.id, " fetchFundingRates() supports swap contracts only")));
        end
        marketIds = self.marketIds(symbols);
        request[Symbol("market")] =         join(marketIds, ",");
    end
    response = Base.fetch(self.v2PublicGetFuturesFundingRate(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseFundingRates(data, symbols)

end
function withdraw(self::Coinex, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing),
        Symbol("to_address") => address,
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("memo")] = tag;
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("chain")] = self.networkCodeToId(networkCode, get(currency, Symbol("code"), nothing));
    end
    response = Base.fetch(self.v2PrivatePostAssetsWithdraw(extend(request, params)));
    transaction = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseTransaction(transaction, currency)

end
function parseTransactionStatus(self::Coinex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("audit") => "pending",
        Symbol("pass") => "pending",
        Symbol("audit_required") => "pending",
        Symbol("processing") => "pending",
        Symbol("confirming") => "pending",
        Symbol("not_pass") => "failed",
        Symbol("cancel") => "canceled",
        Symbol("finish") => "ok",
        Symbol("finished") => "ok",
        Symbol("fail") => "failed"
    );
    return safeString(statuses, status, status)

end
function fetchFundingRateHistory(self::Coinex, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol, since, limit, "8h", params, 1000))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    response = Base.fetch(self.v2PublicGetFuturesFundingRateHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        marketId = safeString(entry, "market");
        symbolInner = self.safeSymbol(marketId, market, nothing, "swap");
        timestamp = safeInteger(entry, "funding_time");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbolInner,
    Symbol("fundingRate") => self.safeNumber(entry, "actual_funding_rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, get(market, Symbol("symbol"), nothing), since, limit)

end
function parseTransaction(self::Coinex, transaction, currency=nothing)
    address = safeString(transaction, "to_address");
    tag = safeString(transaction, "memo");
    if functions.ccxtruthy(tag != nothing)
        if functions.ccxtruthy(functions.ccxt_lt(length(tag), 1))
            tag = nothing;
        end
    end
    remark = safeString(transaction, "remark");
    if functions.ccxtruthy(remark != nothing)
        if functions.ccxtruthy(functions.ccxt_lt(length(remark), 1))
            remark = nothing;
        end
    end
    txid = safeString(transaction, "tx_id");
    if functions.ccxtruthy(txid != nothing)
        if functions.ccxtruthy(functions.ccxt_lt(length(txid), 1))
            txid = nothing;
        end
    end
    currencyId = safeString(transaction, "ccy");
    code = self.safeCurrencyCode(currencyId, currency);
    timestamp = safeInteger(transaction, "created_at");
    type_var = functions.ccxtruthy((ccxt_in("withdraw_id", transaction))) ? "withdrawal" : "deposit";
    networkId = safeString(transaction, "chain");
    feeCost = safeString(transaction, "tx_fee");
    transferMethod = safeStringLower2(transaction, "withdraw_method", "deposit_method");
    internal = transferMethod == "local";
    amount = self.safeNumber(transaction, "actual_amount");
    if functions.ccxtruthy(amount == nothing)
        amount = self.safeNumber(transaction, "amount");
    end
    if functions.ccxtruthy(type_var == "deposit")
        feeCost = "0";
    end
    feeCurrencyId = safeString(transaction, "fee_asset");
    fee = Dict{Symbol, Any}(
        Symbol("cost") => self.parseNumber(feeCost),
        Symbol("currency") => self.safeCurrencyCode(feeCurrencyId)
    );
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString2(transaction, "withdraw_id", "deposit_id"),
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => self.networkIdToCode(networkId, code),
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("updated") => nothing,
    Symbol("fee") => fee,
    Symbol("comment") => remark,
    Symbol("internal") => internal
)

end
function transfer(self::Coinex, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    amountToPrecision = self.currencyToPrecision(code, amount);
    accountsByType = self.safeDict(self.options, "accountsByType", Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amountToPrecision,
        Symbol("from_account_type") => fromId,
        Symbol("to_account_type") => toId
    );
    if functions.ccxtruthy(@functions.ccxt_or((fromAccount == "margin"), (toAccount == "margin")))
        symbol = safeString(params, "symbol");
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " transfer() the symbol parameter must be defined for a margin account")));
        end
        params = omit(params, "symbol");
        request[Symbol("market")] = self.marketId(symbol);
    end
    if functions.ccxtruthy(@functions.ccxt_and((fromAccount != "spot"), (toAccount != "spot")))
        throw(BadRequest(string(self.id, " transfer() can only be between spot and swap, or spot and margin, either the fromAccount or toAccount must be spot")));
    end
    response = Base.fetch(self.v2PrivatePostAssetsTransfer(extend(request, params)));
    return extend(self.parseTransfer(response, currency), Dict{Symbol, Any}(
    Symbol("amount") => self.parseNumber(amountToPrecision),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount
))

end
function parseTransferStatus(self::Coinex, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "ok",
        Symbol("SUCCESS") => "ok",
        Symbol("OK") => "ok",
        Symbol("finished") => "ok",
        Symbol("FINISHED") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransfer(self::Coinex, transfer, currency=nothing)
    timestamp = safeInteger(transfer, "created_at");
    currencyId = safeString(transfer, "ccy");
    fromId = safeString(transfer, "from_account_type");
    toId = safeString(transfer, "to_account_type");
    accountsById = safeValue(self.options, "accountsById", Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("id") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => safeString(accountsById, fromId, fromId),
    Symbol("toAccount") => safeString(accountsById, toId, toId),
    Symbol("status") => self.parseTransferStatus(safeString2(transfer, "code", "status"))
)

end
function fetchTransfers(self::Coinex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTransfers() requires a code argument")));
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing)
    );
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchTransfers", params);
    if functions.ccxtruthy(marginMode != nothing)
        request[Symbol("transfer_type")] = "MARGIN";
    else
        request[Symbol("transfer_type")] = "FUTURES";
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    response = Base.fetch(self.v2PrivateGetAssetsTransferHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransfers(data, currency, since, limit)

end
function fetchWithdrawals(self::Coinex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v2PrivateGetAssetsWithdraw(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function fetchDeposits(self::Coinex, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v2PrivateGetAssetsDepositHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit)

end
function parseIsolatedBorrowRate(self::Coinex, info, market=nothing)
    marketId = safeString(info, "market");
    market = self.safeMarket(marketId, market, nothing, "spot");
    currency = safeString(info, "ccy");
    rate = self.safeNumber(info, "daily_interest_rate");
    baseRate = nothing;
    quoteRate = nothing;
    if functions.ccxtruthy(currency == get(market, Symbol("baseId"), nothing))
        baseRate = rate;
    elseif functions.ccxtruthy(currency == get(market, Symbol("quoteId"), nothing))
        quoteRate = rate;
    end
    return Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("base") => get(market, Symbol("base"), nothing),
    Symbol("baseRate") => baseRate,
    Symbol("quote") => get(market, Symbol("quote"), nothing),
    Symbol("quoteRate") => quoteRate,
    Symbol("period") => 86400000,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => info
)

end
function fetchIsolatedBorrowRate(self::Coinex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    code = safeString(params, "code");
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchIsolatedBorrowRate() requires a code parameter")));
    end
    params = omit(params, "code");
    currency = self.currency(code);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("ccy") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v2PrivateGetAssetsMarginInterestLimit(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseIsolatedBorrowRate(data, market)

end
function fetchBorrowInterest(self::Coinex, code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("market")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v2PrivateGetAssetsMarginBorrowHistory(extend(request, params)));
    rows = safeValue(response, "data", []);
    interest = self.parseBorrowInterests(rows, market);
    return self.filterByCurrencySinceLimit(interest, code, since, limit)

end
function parseBorrowInterest(self::Coinex, info, market=nothing)
    marketId = safeString(info, "market");
    market = self.safeMarket(marketId, market, nothing, "spot");
    timestamp = safeInteger(info, "expired_at");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("currency") => self.safeCurrencyCode(safeString(info, "ccy")),
    Symbol("interest") => self.safeNumber(info, "to_repaied_amount"),
    Symbol("interestRate") => self.safeNumber(info, "daily_interest_rate"),
    Symbol("amountBorrowed") => self.safeNumber(info, "borrow_amount"),
    Symbol("marginMode") => "isolated",
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function borrowIsolatedMargin(self::Coinex, symbol, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    currency = self.currency(code);
    isAutoRenew = self.safeBool2(params, "isAutoRenew", "is_auto_renew", false);
    params = omit(params, "isAutoRenew");
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("ccy") => get(currency, Symbol("id"), nothing),
        Symbol("borrow_amount") => self.currencyToPrecision(code, amount),
        Symbol("is_auto_renew") => isAutoRenew
    );
    response = Base.fetch(self.v2PrivatePostAssetsMarginBorrow(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    transaction = self.parseMarginLoan(data, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("symbol") => symbol
))

end
function repayIsolatedMargin(self::Coinex, symbol, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("ccy") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.v2PrivatePostAssetsMarginRepay(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    transaction = self.parseMarginLoan(data, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("symbol") => symbol
))

end
function parseMarginLoan(self::Coinex, info, currency=nothing)
    currencyId = safeString(info, "ccy");
    marketId = safeString(info, "market");
    timestamp = safeInteger(info, "expired_at");
    return Dict{Symbol, Any}(
    Symbol("id") => safeInteger(info, "borrow_id"),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => safeString(info, "borrow_amount"),
    Symbol("symbol") => self.safeSymbol(marketId, nothing, nothing, "spot"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
function fetchDepositWithdrawFee(self::Coinex, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v2PublicGetAssetsDepositWithdrawConfig(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseDepositWithdrawFee(data, currency)

end
function fetchDepositWithdrawFees(self::Coinex, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PublicGetAssetsAllDepositWithdrawConfig(params));
    data = self.safeList(response, "data", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        item = get(data, i + 1, nothing);
        asset = self.safeDict(item, "asset", Dict{Symbol, Any}());
        currencyId = safeString(asset, "ccy");
        if functions.ccxtruthy(currencyId == nothing)
            i += 1; continue
        end
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_or(codes == nothing, inArray(code, codes)))
            result[Symbol(code)] = self.parseDepositWithdrawFee(item);
        end
        i += 1
    end
    return result

end
function parseDepositWithdrawFee(self::Coinex, fee, currency=nothing)
    result = Dict{Symbol, Any}(
        Symbol("info") => fee,
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
    chains = self.safeList(fee, "chains", []);
    asset = self.safeDict(fee, "asset", Dict{Symbol, Any}());
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(chains)))
        entry = get(chains, i + 1, nothing);
        isWithdrawEnabled = self.safeBool(entry, "withdraw_enabled");
        if functions.ccxtruthy(isWithdrawEnabled)
            result[Symbol("withdraw")][Symbol("fee")] = self.safeNumber(entry, "withdrawal_fee");
            result[Symbol("withdraw")][Symbol("percentage")] = false;
            networkId = safeString(entry, "chain");
            if functions.ccxtruthy(networkId)
                currencyId = safeString(asset, "ccy");
                feeCode = self.safeCurrencyCode(currencyId, currency);
                networkCode = self.networkIdToCode(networkId, feeCode);
                result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("fee") => self.safeNumber(entry, "withdrawal_fee"),
                        Symbol("percentage") => false
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("fee") => nothing,
                        Symbol("percentage") => nothing
                    )
                );
            end
        end
        i += 1
    end
    return result

end
function fetchLeverage(self::Coinex, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    code = safeString(params, "code");
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchLeverage() requires a code parameter")));
    end
    params = omit(params, "code");
    currency = self.currency(code);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("ccy") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v2PrivateGetAssetsMarginInterestLimit(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseLeverage(data, market)

end
function parseLeverage(self::Coinex, leverage, market=nothing)
    marketId = safeString(leverage, "market");
    leverageValue = safeInteger(leverage, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "spot"),
    Symbol("marginMode") => "isolated",
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
function fetchPositionHistory(self::Coinex, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market_type") => "FUTURES",
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    response = Base.fetch(self.v2PrivateGetFuturesFinishedPosition(extend(request, params)));
    records = self.safeList(response, "data", []);
    positions = self.parsePositions(records);
    return self.filterBySymbolSinceLimit(positions, symbol, since, limit)

end
function closePosition(self::Coinex, symbol, side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    type_var = safeString(params, "type", "market");
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("market_type") => "FUTURES",
        Symbol("type") => type_var
    );
    clientOrderId = safeString2(params, "client_id", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_id")] = clientOrderId;
    end
    params = omit(params, "clientOrderId");
    response = Base.fetch(self.v2PrivatePostFuturesClosePosition(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseOrder(data, market)

end
function handleMarginModeAndParams(self::Coinex, methodName, params=Dict(), defaultValue=nothing)
    defaultType = safeString(self.options, "defaultType");
    isMargin = self.safeBool(params, "margin", false);
    marginMode = nothing;
    (marginMode, params) = handleMarginModeAndParams(self.parent, methodName, params, defaultValue);
    if functions.ccxtruthy(marginMode == nothing)
        if functions.ccxtruthy(@functions.ccxt_or((defaultType == "margin"), (isMargin)))
            marginMode = "isolated";
        end
    end
    return [marginMode, params]

end
function nonce(self::Coinex, )
    return milliseconds()

end
function sign(self::Coinex, path, api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
    path = self.implodeParams(path, params);
    version = get(api, 1, nothing);
    requestUrl = get(api, 2, nothing);
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(requestUrl), nothing), "/", version, "/", path);
    query = omit(params, self.extractParams(path));
    nonce = string(self.nonce());
    if functions.ccxtruthy(method == "POST")
        parts = split(path, "/");
        firstPart = safeString(parts, 0, "");
        numParts = length(parts);
        lastPart = safeString(parts, numParts - 1, "");
        lastWords = split(lastPart, "_");
        numWords = length(lastWords);
        lastWord = safeString(lastWords, numWords - 1, "");
        if functions.ccxtruthy(@functions.ccxt_and((firstPart == "order"), (@functions.ccxt_or(lastWord == "limit", lastWord == "market"))))
            clientOrderId = safeString(params, "client_id");
            if functions.ccxtruthy(clientOrderId == nothing)
                defaultId = "x-167673045";
                brokerId = safeValue(self.options, "brokerId", defaultId);
                query[Symbol("client_id")] = string(brokerId, "_", uuid16());
            end
        end
    end
    if functions.ccxtruthy(requestUrl == "perpetualPrivate")
        self.checkRequiredCredentials();
        query = extend(Dict{Symbol, Any}(
    Symbol("access_id") => self.apiKey,
    Symbol("timestamp") => nonce
), query);
        query = keysort(query);
        urlencoded = self.rawencode(query);
        signature = hash(self.encode(string(urlencoded, "&secret_key=", self.secret)), sha256);
        headers = Dict{Symbol, Any}(
            Symbol("Authorization") => lowercase(signature),
            Symbol("AccessId") => self.apiKey
        );
        if functions.ccxtruthy(@functions.ccxt_or((method == "GET"), (method == "PUT")))
            url += string("?", urlencoded);
        else
            headers[Symbol("Content-Type")] = "application/x-www-form-urlencoded";
            body = urlencoded;
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(requestUrl == "public", requestUrl == "perpetualPublic"))
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    else
        if functions.ccxtruthy(version == "v1")
            self.checkRequiredCredentials();
            query = extend(Dict{Symbol, Any}(
    Symbol("access_id") => self.apiKey,
    Symbol("tonce") => nonce
), query);
            query = keysort(query);
            urlencoded = self.rawencode(query);
            signature = hash(self.encode(string(urlencoded, "&secret_key=", self.secret)), md5);
            headers = Dict{Symbol, Any}(
                Symbol("Authorization") => uppercase(signature),
                Symbol("Content-Type") => "application/json"
            );
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((method == "GET"), (method == "DELETE")), (method == "PUT")))
                url += string("?", urlencoded);
            else
                body = json(query);
            end
        elseif functions.ccxtruthy(version == "v2")
            self.checkRequiredCredentials();
            query = keysort(query);
            urlencoded = self.rawencode(query);
            preparedString = string(method, "/", version, "/", path);
            if functions.ccxtruthy(method == "POST")
                body = json(query);
                preparedString += body;
            elseif functions.ccxtruthy(urlencoded)
                preparedString += string("?", urlencoded);
            end
            preparedString += string(nonce, self.secret);
            signature = hash(self.encode(preparedString), sha256);
            headers = Dict{Symbol, Any}(
                Symbol("Content-Type") => "application/json",
                Symbol("Accept") => "application/json",
                Symbol("X-COINEX-KEY") => self.apiKey,
                Symbol("X-COINEX-SIGN") => signature,
                Symbol("X-COINEX-TIMESTAMP") => nonce
            );
            if functions.ccxtruthy(method != "POST")
                if functions.ccxtruthy(urlencoded)
                    url += string("?", urlencoded);
                end
            end
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Coinex, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    code = safeString(response, "code");
    data = safeValue(response, "data");
    message = safeString(response, "message", "");
    if functions.ccxtruthy(@functions.ccxt_or((code != "0"), (@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((message != "Success"), (message != "Succeeded")), (lowercase(message) != "ok")), !functions.ccxtruthy(data)))))
        feedback = string(self.id, " ", message);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end
function fetchMarginAdjustmentHistory(self::Coinex, symbol=nothing, type_var=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMarginAdjustmentHistory() requires a symbol argument")));
    end
    positionId = safeInteger2(params, "positionId", "position_id");
    params = omit(params, "positionId");
    if functions.ccxtruthy(positionId == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMarginAdjustmentHistory() requires a positionId parameter")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("market_type") => "FUTURES",
        Symbol("position_id") => positionId
    );
    (request, params) = self.handleUntilOption("end_time", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.v2PrivateGetFuturesPositionMarginHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    modifications = self.parseMarginModifications(data, nothing, "market", "swap");
    return self.filterBySymbolSinceLimit(modifications, symbol, since, limit)

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coinex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v1PublicGetAmmMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "amm/market", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetCommonCurrencyRate(self::Coinex, params=Dict(), context=Dict())
    return request(self, "common/currency/rate", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetCommonAssetConfig(self::Coinex, params=Dict(), context=Dict())
    return request(self, "common/asset/config", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetCommonMaintainInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "common/maintain/info", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetCommonTempMaintainInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "common/temp-maintain/info", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetMarginMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/market", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetMarketInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/info", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetMarketList(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/list", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetMarketTicker(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/ticker", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetMarketTickerAll(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/ticker/all", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetMarketDepth(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/depth", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetMarketDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/deals", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetMarketKline(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/kline", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PublicGetMarketDetail(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/detail", ["v1", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetAccountAmmBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/amm/balance", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetAccountInvestmentBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/investment/balance", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetAccountBalanceHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/balance/history", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetAccountMarketFee(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/market/fee", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetBalanceCoinDeposit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/coin/deposit", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetBalanceCoinWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/coin/withdraw", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetBalanceInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/info", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetBalanceDepositAddressCoinType(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/deposit/address/{coin_type}", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetContractTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "contract/transfer/history", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetCreditInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "credit/info", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetCreditBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "credit/balance", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetInvestmentTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "investment/transfer/history", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetMarginAccount(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/account", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetMarginConfig(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/config", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetMarginLoanHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/loan/history", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetMarginTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/transfer/history", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetOrderDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/deals", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetOrderFinished(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/finished", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetOrderPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/pending", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v1PrivateGetOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/status", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v1PrivateGetOrderStatusBatch(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/status/batch", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v1PrivateGetOrderUserDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/user/deals", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetOrderStopFinished(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/finished", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetOrderStopPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/pending", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v1PrivateGetOrderUserTradeFee(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/user/trade/fee", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetOrderMarketTradeInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/market/trade/info", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetSubAccountBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/balance", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivateGetSubAccountTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/transfer/history", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetSubAccountAuthApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/auth/api", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateGetSubAccountAuthApiUserAuthId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/auth/api/{user_auth_id}", ["v1", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePostBalanceCoinWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/coin/withdraw", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePostContractBalanceTransfer(self::Coinex, params=Dict(), context=Dict())
    return request(self, "contract/balance/transfer", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePostMarginFlat(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/flat", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePostMarginLoan(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/loan", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePostMarginTransfer(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/transfer", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePostOrderLimitBatch(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/limit/batch", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePostOrderIoc(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/ioc", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v1PrivatePostOrderLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/limit", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v1PrivatePostOrderMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/market", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v1PrivatePostOrderModify(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/modify", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v1PrivatePostOrderStopLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/limit", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v1PrivatePostOrderStopMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/market", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v1PrivatePostOrderStopModify(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/modify", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v1PrivatePostSubAccountTransfer(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/transfer", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePostSubAccountRegister(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/register", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PrivatePostSubAccountUnfrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/unfrozen", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePostSubAccountFrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/frozen", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePostSubAccountAuthApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/auth/api", ["v1", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePutBalanceDepositAddressCoinType(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/deposit/address/{coin_type}", ["v1", "private"], "PUT", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePutSubAccountUnfrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/unfrozen", ["v1", "private"], "PUT", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePutSubAccountFrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/frozen", ["v1", "private"], "PUT", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePutSubAccountAuthApiUserAuthId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/auth/api/{user_auth_id}", ["v1", "private"], "PUT", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivatePutV1AccountSettings(self::Coinex, params=Dict(), context=Dict())
    return request(self, "v1/account/settings", ["v1", "private"], "PUT", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateDeleteBalanceCoinWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/coin/withdraw", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateDeleteOrderPendingBatch(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/pending/batch", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateDeleteOrderPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/pending", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v1PrivateDeleteOrderStopPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/pending", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateDeleteOrderStopPendingId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/pending/{id}", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v1PrivateDeleteOrderPendingByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/pending/by_client_id", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateDeleteOrderStopPendingByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/pending/by_client_id", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateDeleteSubAccountAuthApiUserAuthId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/auth/api/{user_auth_id}", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PrivateDeleteSubAccountAuthorizeId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/authorize/{id}", ["v1", "private"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPublicGetPing(self::Coinex, params=Dict(), context=Dict())
    return request(self, "ping", ["v1", "perpetualPublic"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPublicGetTime(self::Coinex, params=Dict(), context=Dict())
    return request(self, "time", ["v1", "perpetualPublic"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPublicGetMarketList(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/list", ["v1", "perpetualPublic"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPublicGetMarketLimitConfig(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/limit_config", ["v1", "perpetualPublic"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPublicGetMarketTicker(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/ticker", ["v1", "perpetualPublic"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPublicGetMarketTickerAll(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/ticker/all", ["v1", "perpetualPublic"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPublicGetMarketDepth(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/depth", ["v1", "perpetualPublic"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPublicGetMarketDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/deals", ["v1", "perpetualPublic"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPublicGetMarketFundingHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/funding_history", ["v1", "perpetualPublic"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPublicGetMarketKline(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/kline", ["v1", "perpetualPublic"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPrivateGetMarketUserDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/user_deals", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPrivateGetAssetQuery(self::Coinex, params=Dict(), context=Dict())
    return request(self, "asset/query", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivateGetOrderPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/pending", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v1PerpetualPrivateGetOrderFinished(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/finished", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivateGetOrderStopFinished(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop_finished", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivateGetOrderStopPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop_pending", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v1PerpetualPrivateGetOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/status", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v1PerpetualPrivateGetOrderStopStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop_status", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v1PerpetualPrivateGetPositionFinished(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/finished", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivateGetPositionPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/pending", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivateGetPositionFunding(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/funding", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivateGetPositionAdlHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/adl_history", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivateGetMarketPreference(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/preference", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivateGetPositionMarginHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/margin_history", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivateGetPositionSettleHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/settle_history", ["v1", "perpetualPrivate"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivatePostMarketAdjustLeverage(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/adjust_leverage", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPrivatePostMarketPositionExpect(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/position_expect", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v1PerpetualPrivatePostOrderPutLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/put_limit", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderPutMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/put_market", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderPutStopLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/put_stop_limit", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderPutStopMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/put_stop_market", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderModify(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/modify", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderModifyStop(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/modify_stop", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderCancel(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderCancelAll(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel_all", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivatePostOrderCancelBatch(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel_batch", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivatePostOrderCancelStop(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel_stop", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderCancelStopAll(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel_stop_all", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v1PerpetualPrivatePostOrderCloseLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/close_limit", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderCloseMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/close_market", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostPositionAdjustMargin(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/adjust_margin", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostPositionStopLoss(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/stop_loss", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostPositionTakeProfit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/take_profit", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostPositionMarketClose(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/market_close", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderCancelByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel/by_client_id", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostOrderCancelStopByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel_stop/by_client_id", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v1PerpetualPrivatePostMarketPreference(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/preference", ["v1", "perpetualPrivate"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PublicGetMaintainInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "maintain/info", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetPing(self::Coinex, params=Dict(), context=Dict())
    return request(self, "ping", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetTime(self::Coinex, params=Dict(), context=Dict())
    return request(self, "time", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetSpotMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/market", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetSpotTicker(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/ticker", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetSpotDepth(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/depth", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetSpotDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/deals", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetSpotKline(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/kline", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetSpotIndex(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/index", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/market", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesTicker(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/ticker", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesDepth(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/depth", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/deals", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesKline(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/kline", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesIndex(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/index", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesFundingRate(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/funding-rate", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesFundingRateHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/funding-rate-history", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesPremiumIndexHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/premium-index-history", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesPositionLevel(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/position-level", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesLiquidationHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/liquidation-history", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetFuturesBasisHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/basis-history", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetAssetsDepositWithdrawConfig(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/deposit-withdraw-config", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetAssetsAllDepositWithdrawConfig(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/all-deposit-withdraw-config", ["v2", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountSubs(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountSubsApiDetail(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/api-detail", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAccountSubsInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/info", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountSubsApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/api", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAccountSubsTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/transfer-history", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAccountSubsBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/balance", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountSubsSpotBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/spot-balance", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountTradeFeeRate(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/trade-fee-rate", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAccountFuturesMarketSettings(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/futures-market-settings", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/info", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAssetsSpotBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/spot/balance", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsFuturesBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/futures/balance", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsMarginBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/margin/balance", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAssetsFinancialBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/financial/balance", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsAmmLiquidity(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/amm/liquidity", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsCreditInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/credit/info", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsSpotTranscationHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/spot/transcation-history", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAssetsMarginBorrowHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/margin/borrow-history", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsMarginInterestLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/margin/interest-limit", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAssetsDepositAddress(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/deposit-address", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsDepositHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/deposit-history", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/withdraw", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/transfer-history", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsAmmLiquidityPool(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/amm/liquidity-pool", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetAssetsAmmIncomeHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/amm/income-history", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetSpotOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/order-status", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v2PrivateGetSpotBatchOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/batch-order-status", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v2PrivateGetSpotPendingOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/pending-order", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v2PrivateGetSpotFinishedOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/finished-order", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetSpotPendingStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/pending-stop-order", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v2PrivateGetSpotFinishedStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/finished-stop-order", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetSpotUserDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/user-deals", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetSpotOrderDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/order-deals", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetFuturesOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/order-status", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v2PrivateGetFuturesBatchOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/batch-order-status", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetFuturesPendingOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/pending-order", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v2PrivateGetFuturesFinishedOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/finished-order", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetFuturesPendingStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/pending-stop-order", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 8))
end

function v2PrivateGetFuturesFinishedStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/finished-stop-order", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetFuturesUserDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/user-deals", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetFuturesOrderDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/order-deals", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetFuturesPendingPosition(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/pending-position", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetFuturesFinishedPosition(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/finished-position", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetFuturesPositionMarginHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/position-margin-history", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetFuturesPositionFundingHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/position-funding-history", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivateGetFuturesPositionAdlHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/position-adl-history", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetFuturesPositionSettleHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/position-settle-history", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetReferReferee(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/referee", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetReferRefereeRebateRecord(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/referee-rebate/record", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetReferRefereeRebateDetail(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/referee-rebate/detail", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetReferAgentReferee(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/agent-referee", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetReferAgentRebateRecord(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/agent-rebate/record", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetReferAgentRebateDetail(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/agent-rebate/detail", ["v2", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostAccountSubs(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAccountSubsFrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/frozen", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAccountSubsUnfrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/unfrozen", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAccountSubsApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/api", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAccountSubsEditApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/edit-api", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAccountSubsDeleteApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/delete-api", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAccountSubsTransfer(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/transfer", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAccountSettings(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/settings", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAccountFuturesMarketSettings(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/futures-market-settings", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAssetsMarginBorrow(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/margin/borrow", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAssetsMarginRepay(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/margin/repay", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAssetsRenewalDepositAddress(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/renewal-deposit-address", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAssetsWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/withdraw", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAssetsCancelWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/cancel-withdraw", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAssetsTransfer(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/transfer", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostAssetsAmmAddLiquidity(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/amm/add-liquidity", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostAssetsAmmRemoveLiquidity(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/amm/remove-liquidity", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSpotOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v2PrivatePostSpotStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/stop-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v2PrivatePostSpotBatchOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/batch-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function v2PrivatePostSpotBatchStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/batch-stop-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSpotModifyOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/modify-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v2PrivatePostSpotModifyStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/modify-stop-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v2PrivatePostSpotBatchModifyOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/batch-modify-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 13.334))
end

function v2PrivatePostSpotCancelAllOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-all-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSpotCancelOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 6.667))
end

function v2PrivatePostSpotCancelStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-stop-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 6.667))
end

function v2PrivatePostSpotCancelBatchOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-batch-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v2PrivatePostSpotCancelBatchStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-batch-stop-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v2PrivatePostSpotCancelOrderByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-order-by-client-id", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSpotCancelStopOrderByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-stop-order-by-client-id", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostFuturesOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/stop-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesBatchOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/batch-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostFuturesBatchStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/batch-stop-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostFuturesCancelPositionStopLoss(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-position-stop-loss", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesCancelPositionTakeProfit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-position-take-profit", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesModifyOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/modify-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesModifyStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/modify-stop-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesBatchModifyOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/batch-modify-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesCancelAllOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-all-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostFuturesCancelOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v2PrivatePostFuturesCancelStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-stop-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v2PrivatePostFuturesCancelBatchOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-batch-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesCancelBatchStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-batch-stop-order", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesCancelOrderByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-order-by-client-id", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostFuturesCancelStopOrderByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-stop-order-by-client-id", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostFuturesClosePosition(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/close-position", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesAdjustPositionMargin(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/adjust-position-margin", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesAdjustPositionLeverage(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/adjust-position-leverage", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesSetPositionStopLoss(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/set-position-stop-loss", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function v2PrivatePostFuturesSetPositionTakeProfit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/set-position-take-profit", ["v2", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 20))
end

function Coinex(; kwargs...)
    inst = Coinex(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, fetchSpotMarkets, fetchContractMarkets, parseTicker, fetchTicker, fetchTickers, fetchTime, fetchOrderBook, parseTrade, fetchTrades, fetchTradingFee, fetchTradingFees, parseTradingFee, parseOHLCV, fetchOHLCV, fetchMarginBalance, fetchSpotBalance, fetchSwapBalance, fetchFinancialBalance, fetchBalance, parseOrderStatus, parseOrder, createMarketBuyOrderWithCost, createOrderRequest, createOrder, createOrders, cancelOrders, editOrder, editOrders, cancelOrder, cancelAllOrders, fetchOrder, fetchOrdersByStatus, fetchOpenOrders, fetchClosedOrders, createDepositAddress, fetchDepositAddress, parseDepositAddress, fetchMyTrades, fetchPositions, fetchPosition, parsePosition, setMarginMode, setLeverage, fetchLeverageTiers, parseMarketLeverageTiers, modifyMarginHelper, parseMarginModification, addMargin, reduceMargin, fetchFundingHistory, fetchFundingRate, fetchFundingInterval, parseFundingRate, parseFundingInterval, fetchFundingRates, withdraw, parseTransactionStatus, fetchFundingRateHistory, parseTransaction, transfer, parseTransferStatus, parseTransfer, fetchTransfers, fetchWithdrawals, fetchDeposits, parseIsolatedBorrowRate, fetchIsolatedBorrowRate, fetchBorrowInterest, parseBorrowInterest, borrowIsolatedMargin, repayIsolatedMargin, parseMarginLoan, fetchDepositWithdrawFee, fetchDepositWithdrawFees, parseDepositWithdrawFee, fetchLeverage, parseLeverage, fetchPositionHistory, closePosition, handleMarginModeAndParams, nonce, sign, handleErrors, fetchMarginAdjustmentHistory, v1PublicGetAmmMarket, v1PublicGetCommonCurrencyRate, v1PublicGetCommonAssetConfig, v1PublicGetCommonMaintainInfo, v1PublicGetCommonTempMaintainInfo, v1PublicGetMarginMarket, v1PublicGetMarketInfo, v1PublicGetMarketList, v1PublicGetMarketTicker, v1PublicGetMarketTickerAll, v1PublicGetMarketDepth, v1PublicGetMarketDeals, v1PublicGetMarketKline, v1PublicGetMarketDetail, v1PrivateGetAccountAmmBalance, v1PrivateGetAccountInvestmentBalance, v1PrivateGetAccountBalanceHistory, v1PrivateGetAccountMarketFee, v1PrivateGetBalanceCoinDeposit, v1PrivateGetBalanceCoinWithdraw, v1PrivateGetBalanceInfo, v1PrivateGetBalanceDepositAddressCoinType, v1PrivateGetContractTransferHistory, v1PrivateGetCreditInfo, v1PrivateGetCreditBalance, v1PrivateGetInvestmentTransferHistory, v1PrivateGetMarginAccount, v1PrivateGetMarginConfig, v1PrivateGetMarginLoanHistory, v1PrivateGetMarginTransferHistory, v1PrivateGetOrderDeals, v1PrivateGetOrderFinished, v1PrivateGetOrderPending, v1PrivateGetOrderStatus, v1PrivateGetOrderStatusBatch, v1PrivateGetOrderUserDeals, v1PrivateGetOrderStopFinished, v1PrivateGetOrderStopPending, v1PrivateGetOrderUserTradeFee, v1PrivateGetOrderMarketTradeInfo, v1PrivateGetSubAccountBalance, v1PrivateGetSubAccountTransferHistory, v1PrivateGetSubAccountAuthApi, v1PrivateGetSubAccountAuthApiUserAuthId, v1PrivatePostBalanceCoinWithdraw, v1PrivatePostContractBalanceTransfer, v1PrivatePostMarginFlat, v1PrivatePostMarginLoan, v1PrivatePostMarginTransfer, v1PrivatePostOrderLimitBatch, v1PrivatePostOrderIoc, v1PrivatePostOrderLimit, v1PrivatePostOrderMarket, v1PrivatePostOrderModify, v1PrivatePostOrderStopLimit, v1PrivatePostOrderStopMarket, v1PrivatePostOrderStopModify, v1PrivatePostSubAccountTransfer, v1PrivatePostSubAccountRegister, v1PrivatePostSubAccountUnfrozen, v1PrivatePostSubAccountFrozen, v1PrivatePostSubAccountAuthApi, v1PrivatePutBalanceDepositAddressCoinType, v1PrivatePutSubAccountUnfrozen, v1PrivatePutSubAccountFrozen, v1PrivatePutSubAccountAuthApiUserAuthId, v1PrivatePutV1AccountSettings, v1PrivateDeleteBalanceCoinWithdraw, v1PrivateDeleteOrderPendingBatch, v1PrivateDeleteOrderPending, v1PrivateDeleteOrderStopPending, v1PrivateDeleteOrderStopPendingId, v1PrivateDeleteOrderPendingByClientId, v1PrivateDeleteOrderStopPendingByClientId, v1PrivateDeleteSubAccountAuthApiUserAuthId, v1PrivateDeleteSubAccountAuthorizeId, v1PerpetualPublicGetPing, v1PerpetualPublicGetTime, v1PerpetualPublicGetMarketList, v1PerpetualPublicGetMarketLimitConfig, v1PerpetualPublicGetMarketTicker, v1PerpetualPublicGetMarketTickerAll, v1PerpetualPublicGetMarketDepth, v1PerpetualPublicGetMarketDeals, v1PerpetualPublicGetMarketFundingHistory, v1PerpetualPublicGetMarketKline, v1PerpetualPrivateGetMarketUserDeals, v1PerpetualPrivateGetAssetQuery, v1PerpetualPrivateGetOrderPending, v1PerpetualPrivateGetOrderFinished, v1PerpetualPrivateGetOrderStopFinished, v1PerpetualPrivateGetOrderStopPending, v1PerpetualPrivateGetOrderStatus, v1PerpetualPrivateGetOrderStopStatus, v1PerpetualPrivateGetPositionFinished, v1PerpetualPrivateGetPositionPending, v1PerpetualPrivateGetPositionFunding, v1PerpetualPrivateGetPositionAdlHistory, v1PerpetualPrivateGetMarketPreference, v1PerpetualPrivateGetPositionMarginHistory, v1PerpetualPrivateGetPositionSettleHistory, v1PerpetualPrivatePostMarketAdjustLeverage, v1PerpetualPrivatePostMarketPositionExpect, v1PerpetualPrivatePostOrderPutLimit, v1PerpetualPrivatePostOrderPutMarket, v1PerpetualPrivatePostOrderPutStopLimit, v1PerpetualPrivatePostOrderPutStopMarket, v1PerpetualPrivatePostOrderModify, v1PerpetualPrivatePostOrderModifyStop, v1PerpetualPrivatePostOrderCancel, v1PerpetualPrivatePostOrderCancelAll, v1PerpetualPrivatePostOrderCancelBatch, v1PerpetualPrivatePostOrderCancelStop, v1PerpetualPrivatePostOrderCancelStopAll, v1PerpetualPrivatePostOrderCloseLimit, v1PerpetualPrivatePostOrderCloseMarket, v1PerpetualPrivatePostPositionAdjustMargin, v1PerpetualPrivatePostPositionStopLoss, v1PerpetualPrivatePostPositionTakeProfit, v1PerpetualPrivatePostPositionMarketClose, v1PerpetualPrivatePostOrderCancelByClientId, v1PerpetualPrivatePostOrderCancelStopByClientId, v1PerpetualPrivatePostMarketPreference, v2PublicGetMaintainInfo, v2PublicGetPing, v2PublicGetTime, v2PublicGetSpotMarket, v2PublicGetSpotTicker, v2PublicGetSpotDepth, v2PublicGetSpotDeals, v2PublicGetSpotKline, v2PublicGetSpotIndex, v2PublicGetFuturesMarket, v2PublicGetFuturesTicker, v2PublicGetFuturesDepth, v2PublicGetFuturesDeals, v2PublicGetFuturesKline, v2PublicGetFuturesIndex, v2PublicGetFuturesFundingRate, v2PublicGetFuturesFundingRateHistory, v2PublicGetFuturesPremiumIndexHistory, v2PublicGetFuturesPositionLevel, v2PublicGetFuturesLiquidationHistory, v2PublicGetFuturesBasisHistory, v2PublicGetAssetsDepositWithdrawConfig, v2PublicGetAssetsAllDepositWithdrawConfig, v2PrivateGetAccountSubs, v2PrivateGetAccountSubsApiDetail, v2PrivateGetAccountSubsInfo, v2PrivateGetAccountSubsApi, v2PrivateGetAccountSubsTransferHistory, v2PrivateGetAccountSubsBalance, v2PrivateGetAccountSubsSpotBalance, v2PrivateGetAccountTradeFeeRate, v2PrivateGetAccountFuturesMarketSettings, v2PrivateGetAccountInfo, v2PrivateGetAssetsSpotBalance, v2PrivateGetAssetsFuturesBalance, v2PrivateGetAssetsMarginBalance, v2PrivateGetAssetsFinancialBalance, v2PrivateGetAssetsAmmLiquidity, v2PrivateGetAssetsCreditInfo, v2PrivateGetAssetsSpotTranscationHistory, v2PrivateGetAssetsMarginBorrowHistory, v2PrivateGetAssetsMarginInterestLimit, v2PrivateGetAssetsDepositAddress, v2PrivateGetAssetsDepositHistory, v2PrivateGetAssetsWithdraw, v2PrivateGetAssetsTransferHistory, v2PrivateGetAssetsAmmLiquidityPool, v2PrivateGetAssetsAmmIncomeHistory, v2PrivateGetSpotOrderStatus, v2PrivateGetSpotBatchOrderStatus, v2PrivateGetSpotPendingOrder, v2PrivateGetSpotFinishedOrder, v2PrivateGetSpotPendingStopOrder, v2PrivateGetSpotFinishedStopOrder, v2PrivateGetSpotUserDeals, v2PrivateGetSpotOrderDeals, v2PrivateGetFuturesOrderStatus, v2PrivateGetFuturesBatchOrderStatus, v2PrivateGetFuturesPendingOrder, v2PrivateGetFuturesFinishedOrder, v2PrivateGetFuturesPendingStopOrder, v2PrivateGetFuturesFinishedStopOrder, v2PrivateGetFuturesUserDeals, v2PrivateGetFuturesOrderDeals, v2PrivateGetFuturesPendingPosition, v2PrivateGetFuturesFinishedPosition, v2PrivateGetFuturesPositionMarginHistory, v2PrivateGetFuturesPositionFundingHistory, v2PrivateGetFuturesPositionAdlHistory, v2PrivateGetFuturesPositionSettleHistory, v2PrivateGetReferReferee, v2PrivateGetReferRefereeRebateRecord, v2PrivateGetReferRefereeRebateDetail, v2PrivateGetReferAgentReferee, v2PrivateGetReferAgentRebateRecord, v2PrivateGetReferAgentRebateDetail, v2PrivatePostAccountSubs, v2PrivatePostAccountSubsFrozen, v2PrivatePostAccountSubsUnfrozen, v2PrivatePostAccountSubsApi, v2PrivatePostAccountSubsEditApi, v2PrivatePostAccountSubsDeleteApi, v2PrivatePostAccountSubsTransfer, v2PrivatePostAccountSettings, v2PrivatePostAccountFuturesMarketSettings, v2PrivatePostAssetsMarginBorrow, v2PrivatePostAssetsMarginRepay, v2PrivatePostAssetsRenewalDepositAddress, v2PrivatePostAssetsWithdraw, v2PrivatePostAssetsCancelWithdraw, v2PrivatePostAssetsTransfer, v2PrivatePostAssetsAmmAddLiquidity, v2PrivatePostAssetsAmmRemoveLiquidity, v2PrivatePostSpotOrder, v2PrivatePostSpotStopOrder, v2PrivatePostSpotBatchOrder, v2PrivatePostSpotBatchStopOrder, v2PrivatePostSpotModifyOrder, v2PrivatePostSpotModifyStopOrder, v2PrivatePostSpotBatchModifyOrder, v2PrivatePostSpotCancelAllOrder, v2PrivatePostSpotCancelOrder, v2PrivatePostSpotCancelStopOrder, v2PrivatePostSpotCancelBatchOrder, v2PrivatePostSpotCancelBatchStopOrder, v2PrivatePostSpotCancelOrderByClientId, v2PrivatePostSpotCancelStopOrderByClientId, v2PrivatePostFuturesOrder, v2PrivatePostFuturesStopOrder, v2PrivatePostFuturesBatchOrder, v2PrivatePostFuturesBatchStopOrder, v2PrivatePostFuturesCancelPositionStopLoss, v2PrivatePostFuturesCancelPositionTakeProfit, v2PrivatePostFuturesModifyOrder, v2PrivatePostFuturesModifyStopOrder, v2PrivatePostFuturesBatchModifyOrder, v2PrivatePostFuturesCancelAllOrder, v2PrivatePostFuturesCancelOrder, v2PrivatePostFuturesCancelStopOrder, v2PrivatePostFuturesCancelBatchOrder, v2PrivatePostFuturesCancelBatchStopOrder, v2PrivatePostFuturesCancelOrderByClientId, v2PrivatePostFuturesCancelStopOrderByClientId, v2PrivatePostFuturesClosePosition, v2PrivatePostFuturesAdjustPositionMargin, v2PrivatePostFuturesAdjustPositionLeverage, v2PrivatePostFuturesSetPositionStopLoss, v2PrivatePostFuturesSetPositionTakeProfit)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
