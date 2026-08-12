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
        Symbol("fetchOrdersByStatus") => true,
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
                    Symbol("amm/market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("common/currency/rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("common/asset/config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("common/maintain/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("common/temp-maintain/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/ticker/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/deals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("account/amm/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/investment/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/balance/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/market/fee") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("balance/coin/deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("balance/coin/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("balance/info") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("balance/deposit/address/{coin_type}") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("contract/transfer/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("credit/info") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("credit/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("investment/transfer/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("margin/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("margin/loan/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("margin/transfer/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/deals") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/finished") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/pending") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("order/status") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("order/status/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("order/user/deals") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/stop/finished") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/stop/pending") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("order/user/trade/fee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/market/trade/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub_account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub_account/transfer/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("sub_account/auth/api") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("sub_account/auth/api/{user_auth_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 40
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("balance/coin/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("contract/balance/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("margin/flat") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("margin/loan") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("margin/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/limit/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/ioc") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("order/limit") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("order/market") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("order/modify") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("order/stop/limit") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("order/stop/market") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("order/stop/modify") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("sub_account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("sub_account/register") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("sub_account/unfrozen") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("sub_account/frozen") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("sub_account/auth/api") => Dict{Symbol, Any}(
    Symbol("cost") => 40
)
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("balance/deposit/address/{coin_type}") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("sub_account/unfrozen") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("sub_account/frozen") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("sub_account/auth/api/{user_auth_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("v1/account/settings") => Dict{Symbol, Any}(
    Symbol("cost") => 40
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("balance/coin/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/pending/batch") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/pending") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("order/stop/pending") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/stop/pending/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("order/pending/by_client_id") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/stop/pending/by_client_id") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("sub_account/auth/api/{user_auth_id}") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("sub_account/authorize/{id}") => Dict{Symbol, Any}(
    Symbol("cost") => 40
)
                )
            ),
            Symbol("perpetualPublic") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/limit_config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/ticker/all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/deals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/funding_history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("perpetualPrivate") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("market/user_deals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("asset/query") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/pending") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("order/finished") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/stop_finished") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/stop_pending") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("order/status") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("order/stop_status") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("position/finished") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("position/pending") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("position/funding") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("position/adl_history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("market/preference") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("position/margin_history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("position/settle_history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("market/adjust_leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("market/position_expect") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/put_limit") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/put_market") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/put_stop_limit") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/put_stop_market") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/modify") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/modify_stop") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/cancel_all") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/cancel_batch") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/cancel_stop") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/cancel_stop_all") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("order/close_limit") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/close_market") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("position/adjust_margin") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("position/stop_loss") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("position/take_profit") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("position/market_close") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/cancel/by_client_id") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("order/cancel_stop/by_client_id") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("market/preference") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
                )
            )
        ),
        Symbol("v2") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("maintain/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/deals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/index") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/market") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/deals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/index") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/funding-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/funding-rate-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/premium-index-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/position-level") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/liquidation-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/basis-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("assets/deposit-withdraw-config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("assets/all-deposit-withdraw-config") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("account/subs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/subs/api-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/subs/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/subs/api") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/subs/transfer-history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/subs/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/subs/spot-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/trade-fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/futures-market-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("assets/spot/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/futures/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/margin/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("assets/financial/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/amm/liquidity") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/credit/info") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/spot/transcation-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("assets/margin/borrow-history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/margin/interest-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("assets/deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/deposit-history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/transfer-history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/amm/liquidity-pool") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/amm/income-history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("spot/order-status") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("spot/batch-order-status") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("spot/pending-order") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("spot/finished-order") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("spot/pending-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("spot/finished-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("spot/user-deals") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("spot/order-deals") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("futures/order-status") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("futures/batch-order-status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/pending-order") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("futures/finished-order") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("futures/pending-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                    Symbol("futures/finished-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("futures/user-deals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/order-deals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/pending-position") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("futures/finished-position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/position-margin-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/position-funding-history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("futures/position-adl-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/position-settle-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("refer/referee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("refer/referee-rebate/record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("refer/referee-rebate/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("refer/agent-referee") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("refer/agent-rebate/record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("refer/agent-rebate/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("account/subs") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/subs/frozen") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/subs/unfrozen") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/subs/api") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/subs/edit-api") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/subs/delete-api") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/subs/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/settings") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("account/futures-market-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/margin/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/margin/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/renewal-deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/cancel-withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("assets/amm/add-liquidity") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("assets/amm/remove-liquidity") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("spot/stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("spot/batch-order") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                    Symbol("spot/batch-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/modify-order") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("spot/modify-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("spot/batch-modify-order") => Dict{Symbol, Any}(
    Symbol("cost") => 13.334
),
                    Symbol("spot/cancel-all-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 6.667
),
                    Symbol("spot/cancel-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 6.667
),
                    Symbol("spot/cancel-batch-order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("spot/cancel-batch-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("spot/cancel-order-by-client-id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/cancel-stop-order-by-client-id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/batch-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/batch-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/cancel-position-stop-loss") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/cancel-position-take-profit") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/modify-order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/modify-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/batch-modify-order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/cancel-all-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("futures/cancel-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("futures/cancel-batch-order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/cancel-batch-stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/cancel-order-by-client-id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/cancel-stop-order-by-client-id") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("futures/close-position") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/adjust-position-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/adjust-position-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/set-position-stop-loss") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("futures/set-position-take-profit") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
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
            Symbol("ARBITRUM") => "ARBITRUM",
            Symbol("ARBITRUM_NOVA") => "ARBITRUM_NOVA",
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
"""
fetches all available currencies on an exchange
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-all-deposit-withdrawal-config

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Coinex; params=Dict())
    response = Base.fetch(self.v2PublicGetAssetsAllDepositWithdrawConfig(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseCurrencies(data)

end
function parseCurrency(self::Coinex, coin)
    asset = self.safeDict(coin, "asset", defaultValue = Dict{Symbol, Any}());
    currencyId = safeString(asset, "ccy");
    chains = self.safeList(coin, "chains", defaultValue = []);
    code = self.safeCurrencyCode(currencyId);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "chain");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
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
            Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(chain, "withdrawal_precision"))),
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
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = network;
        end
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
"""
retrieves data on all markets for coinex
see: https://docs.coinex.com/api/v2/spot/market/http/list-market
see: https://docs.coinex.com/api/v2/futures/market/http/list-market

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Coinex; params=Dict())
    promisesUnresolved = [self.fetchSpotMarkets(params), self.fetchContractMarkets(params)];
    promises = Base.fetch(asyncmap(Base.fetch, promisesUnresolved));
    spotMarkets = get(promises, 1, nothing);
    swapMarkets = get(promises, 2, nothing);
    return arrayConcat(spotMarkets, swapMarkets)

end
function fetchSpotMarkets(self::Coinex, params)
    response = Base.fetch(self.v2PublicGetSpotMarket(params));
    markets = self.safeList(response, "data", defaultValue = []);
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
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(market, "base_ccy_precision"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "quote_ccy_precision")))
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
    markets = self.safeList(response, "data", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        entry = get(markets, i + 1, nothing);
        fees = self.fees;
        leverages = self.safeList(entry, "leverage", defaultValue = []);
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
        Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString(entry, "base_ccy_precision"))),
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(entry, "quote_ccy_precision")))
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
function parseTicker(self::Coinex, ticker; market=nothing)
    marketType = functions.ccxtruthy((ccxt_in("mark_price", ticker))) ? "swap" : "spot";
    marketId = safeString(ticker, "market");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = marketType);
    symbol = get(market, Symbol("symbol"), nothing);
    quoteVolume = functions.ccxtruthy(get(market, Symbol("inverse"), nothing)) ? nothing : safeString(ticker, "value");
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
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => safeString(ticker, "mark_price"),
    Symbol("indexPrice") => safeString(ticker, "index_price"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.coinex.com/api/v2/spot/market/http/list-market-ticker
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Coinex, symbol; params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    result = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(result, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.coinex.com/api/v2/spot/market/http/list-market-ticker
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-ticker

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Coinex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbol = safeValue(symbols, 0);
        market = self.market(symbol);
    end
    (marketType, query) = self.handleMarketTypeAndParams("fetchTickers", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.v2PublicGetFuturesTicker(query));
    else
        response = Base.fetch(self.v2PublicGetSpotTicker(query));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTickers(data, symbols = symbols)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.coinex.com/api/v2/common/http/time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Coinex; params=Dict())
    response = Base.fetch(self.v2PublicGetTime(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return safeInteger(data, "timestamp")

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.coinex.com/api/v2/spot/market/http/list-market-depth
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-depth

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Coinex, symbol; limit=20, params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    depth = self.safeDict(data, "depth", defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(depth, "updated_at");
    return self.parseOrderBook(depth, symbol, timestamp = timestamp)

end
function parseTrade(self::Coinex, trade; market=nothing)
    timestamp = safeInteger(trade, "created_at");
    defaultType = safeString(self.options, "defaultType");
    if functions.ccxtruthy(market != nothing)
        defaultType = get(market, Symbol("type"), nothing);
    end
    marketId = safeString(trade, "market");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = defaultType);
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
), market = market)

end
"""
get the list of the most recent trades for a particular symbol
see: https://docs.coinex.com/api/v2/spot/market/http/list-market-deals
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-deals

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Coinex, symbol; since=nothing, limit=nothing, params=Dict())
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
    return self.parseTrades(get(response, Symbol("data"), nothing), market = market, since = since, limit = limit)

end
"""
fetch the trading fees for a market
see: https://docs.coinex.com/api/v2/spot/market/http/list-market
see: https://docs.coinex.com/api/v2/futures/market/http/list-market

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Coinex, symbol; params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    result = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTradingFee(result, market = market)

end
"""
fetch the trading fees for multiple markets
see: https://docs.coinex.com/api/v2/spot/market/http/list-market
see: https://docs.coinex.com/api/v2/futures/market/http/list-market

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Coinex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTradingFees", market = nothing, params = params);
    if functions.ccxtruthy(type_var == "swap")
        response = Base.fetch(self.v2PublicGetFuturesMarket(params));
    else
        response = Base.fetch(self.v2PublicGetSpotMarket(params));
    end
    data = self.safeList(response, "data", defaultValue = []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        marketId = safeString(entry, "market");
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = type_var);
        symbol = get(market, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = self.parseTradingFee(entry, market = market);
        i += 1
    end
    return result

end
function parseTradingFee(self::Coinex, fee; market=nothing)
    marketId = safeValue(fee, "market");
    symbol = self.safeSymbol(marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "maker_fee_rate"),
    Symbol("taker") => self.safeNumber(fee, "taker_fee_rate"),
    Symbol("percentage") => true,
    Symbol("tierBased") => true
)

end
function parseOHLCV(self::Coinex, ohlcv; market=nothing)
    return [safeInteger(ohlcv, "created_at"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "value")]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.coinex.com/api/v2/spot/market/http/list-market-kline
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Coinex, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
function fetchMarginBalance(self::Coinex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PrivateGetAssetsMarginBalance(params));
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        entry = get(balances, i + 1, nothing);
        free = self.safeDict(entry, "available", defaultValue = Dict{Symbol, Any}());
        used = self.safeDict(entry, "frozen", defaultValue = Dict{Symbol, Any}());
        loan = self.safeDict(entry, "repaid", defaultValue = Dict{Symbol, Any}());
        interest = self.safeDict(entry, "interest", defaultValue = Dict{Symbol, Any}());
        baseAccount = self.account();
        baseCurrencyId = safeString(entry, "base_ccy");
        baseCurrencyCode = self.safeCurrencyCode(baseCurrencyId);
        baseAccount[Symbol("free")] = safeString(free, "base_ccy");
        baseAccount[Symbol("used")] = safeString(used, "base_ccy");
        baseDebt = safeString(loan, "base_ccy");
        baseInterest = safeString(interest, "base_ccy");
        baseAccount[Symbol("debt")] = stringAdd(baseDebt, baseInterest);
        if functions.ccxtruthy(baseCurrencyCode != nothing)
            result[Symbol(baseCurrencyCode)] = baseAccount;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchSpotBalance(self::Coinex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PrivateGetAssetsSpotBalance(params));
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        entry = get(balances, i + 1, nothing);
        currencyId = safeString(entry, "ccy");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(entry, "available");
        account[Symbol("used")] = safeString(entry, "frozen");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchSwapBalance(self::Coinex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PrivateGetAssetsFuturesBalance(params));
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        entry = get(balances, i + 1, nothing);
        currencyId = safeString(entry, "ccy");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(entry, "available");
        account[Symbol("used")] = safeString(entry, "frozen");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchFinancialBalance(self::Coinex; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PrivateGetAssetsFinancialBalance(params));
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    balances = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        entry = get(balances, i + 1, nothing);
        currencyId = safeString(entry, "ccy");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("free")] = safeString(entry, "available");
        account[Symbol("used")] = safeString(entry, "frozen");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.coinex.com/api/v2/assets/balance/http/get-spot-balance         // spot
see: https://docs.coinex.com/api/v2/assets/balance/http/get-futures-balance      // swap
see: https://docs.coinex.com/api/v2/assets/balance/http/get-marigin-balance      // margin
see: https://docs.coinex.com/api/v2/assets/balance/http/get-financial-balance    // financial

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'margin', 'swap', 'financial', or 'spot'

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Coinex; params=Dict())
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBalance", params = params);
    isMargin = @functions.ccxt_or((marginMode != nothing), (marketType == "margin"));
    if functions.ccxtruthy(marketType == "swap")
            return Base.fetch(self.fetchSwapBalance(params = params))
    elseif functions.ccxtruthy(marketType == "financial")
        return Base.fetch(self.fetchFinancialBalance(params = params))
    else
        if functions.ccxtruthy(isMargin)
                return Base.fetch(self.fetchMarginBalance(params = params))
        else
            return Base.fetch(self.fetchSpotBalance(params = params))
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
function parseOrder(self::Coinex, order; market=nothing)
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
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = marketType);
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
), market = market)

end
"""
create a market buy order by providing the symbol and cost
see: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade003_market_order
see: https://docs.coinex.com/api/v2/spot/order/http/put-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Coinex, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    params[Symbol("createMarketBuyOrderRequiresPrice")] = false;
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, price = nothing, params = params))

end
function createOrderRequest(self::Coinex, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    swap = get(market, Symbol("swap"), nothing);
    clientOrderId = safeString2(params, "client_id", "clientOrderId");
    triggerPrice = safeString2(params, "stopPrice", "triggerPrice");
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    option = safeString(params, "option");
    isMarketOrder = type_var == "market";
    postOnly = self.isPostOnly(isMarketOrder, option == "maker_only", params = params);
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
        (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params);
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("market_type")] = "MARGIN";
        else
            request[Symbol("market_type")] = "SPOT";
        end
        if functions.ccxtruthy(@functions.ccxt_and((type_var == "market"), (side == "buy")))
            createMarketBuyOrderRequiresPrice = true;
            (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", defaultValue = true);
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
"""
create a trade order
see: https://docs.coinex.com/api/v2/spot/order/http/put-order
see: https://docs.coinex.com/api/v2/spot/order/http/put-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/put-order
see: https://docs.coinex.com/api/v2/futures/order/http/put-stop-order
see: https://docs.coinex.com/api/v2/futures/position/http/close-position
see: https://docs.coinex.com/api/v2/futures/position/http/set-position-stop-loss
see: https://docs.coinex.com/api/v2/futures/position/http/set-position-take-profit

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: price to trigger stop orders
- `params.stopLossPrice`::float, optional: price to trigger stop loss orders
- `params.takeProfitPrice`::float, optional: price to trigger take profit orders
- `params.timeInForce`::string, optional: 'GTC', 'IOC', 'FOK', 'PO'
- `params.postOnly`::bool, optional: set to true if you wish to make a post only order
- `params.reduceOnly`::bool, optional: *contract only* indicates if this order is to reduce the size of a position

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Coinex, symbol, type_var, side, amount; price=nothing, params=Dict())
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
    request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
create a list of trade orders (all orders should be of the same symbol)
see: https://docs.coinex.com/api/v2/spot/order/http/put-multi-order
see: https://docs.coinex.com/api/v2/spot/order/http/put-multi-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/put-multi-order
see: https://docs.coinex.com/api/v2/futures/order/http/put-multi-stop-order

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the api endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Coinex, orders; params=Dict())
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
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price = price, params = orderParams);
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
    data = self.safeList(response, "data", defaultValue = []);
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
        innerData = self.safeDict(entry, "data", defaultValue = Dict{Symbol, Any}());
        if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), !functions.ccxtruthy(isTriggerOrder)))
            entry[Symbol("status")] = status;
            order = self.parseOrder(entry, market = market);
        else
            innerData[Symbol("status")] = status;
            order = self.parseOrder(innerData, market = market);
        end
        push!(results, order);
        i += 1
    end
    return results

end
"""
cancel multiple orders
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-batch-order
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-batch-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-batch-order
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-batch-stop-order

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for canceling stop orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Coinex, ids; symbol=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        item = self.safeDict(entry, "data", defaultValue = Dict{Symbol, Any}());
        order = self.parseOrder(item, market = market);
        push!(results, order);
        i += 1
    end
    return results

end
"""
edit a trade order
see: https://docs.coinex.com/api/v2/spot/order/http/edit-order
see: https://docs.coinex.com/api/v2/spot/order/http/edit-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/edit-order
see: https://docs.coinex.com/api/v2/futures/order/http/edit-stop-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price to trigger stop orders

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Coinex, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
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
    (marginMode, params) = self.handleMarginModeAndParams("editOrder", params = params);
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
edit a list of trade orders
see: https://docs.coinex.com/api/v2/spot/order/http/edit-multi-order
see: https://docs.coinex.com/api/v2/futures/order/http/edit-multi-order

# Arguments
- `orders`::array: list of orders to edit, each object should contain the parameters required by editOrder, namely id, symbol, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrders(self::Coinex, orders; params=Dict())
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
        if functions.ccxtruthy(marketId != nothing)
                        push!(orderSymbols, marketId);
        end
        id = safeString(rawOrder, "id");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        marginMode = nothing;
        (marginMode, orderParams) = self.handleMarginModeAndParams("editOrders", params = orderParams);
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
    orderSymbols = self.marketSymbols(symbols = orderSymbols, type_var = nothing, allowEmpty = false, sameTypeOnly = true, sameSubTypeOnly = true);
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
    data = self.safeList(response, "data", defaultValue = []);
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
        item = self.safeDict(entry, "data", defaultValue = Dict{Symbol, Any}());
        order = self.parseOrder(item);
        push!(result, order);
        i += 1
    end
    return result

end
"""
cancels an open order
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-order
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-stop-order
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-order-by-client-id
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-stop-order-by-client-id
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-order
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-order-by-client-id
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-stop-order-by-client-id

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, defaults to id if not passed
- `params.trigger`::bool, optional: set to true for canceling a trigger order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Coinex, id; symbol=nothing, params=Dict())
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
    (marginMode, params) = self.handleMarginModeAndParams("cancelOrder", params = params);
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
        rows = self.safeList(response, "data", defaultValue = []);
        data = self.safeDict(get(rows, 1, nothing), "data", defaultValue = Dict{Symbol, Any}());
    else
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    end
    return self.parseOrder(data, market = market)

end
"""
cancel all open orders in a market
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-all-order
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-all-order

# Arguments
- `symbol`::string: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' for canceling spot margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Coinex; symbol=nothing, params=Dict())
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
        (marginMode, params) = self.handleMarginModeAndParams("cancelAllOrders", params = params);
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
"""
fetches information on an order made by the user
see: https://docs.coinex.com/api/v2/spot/order/http/get-order-status
see: https://docs.coinex.com/api/v2/futures/order/http/get-order-status

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Coinex, id; symbol=nothing, params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
fetch a list of orders
see: https://docs.coinex.com/api/v2/spot/order/http/list-finished-order
see: https://docs.coinex.com/api/v2/spot/order/http/list-finished-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-finished-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-finished-stop-order

# Arguments
- `status`::string: order status to fetch for
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.marginMode`::string, optional: 'cross' or 'isolated' for fetching spot margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrdersByStatus(self::Coinex, status; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrdersByStatus", market = market, params = params);
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
        (marginMode, params) = self.handleMarginModeAndParams("fetchOrdersByStatus", params = params);
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently open orders
see: https://docs.coinex.com/api/v2/spot/order/http/list-pending-order
see: https://docs.coinex.com/api/v2/spot/order/http/list-pending-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-pending-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-pending-stop-order

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.marginMode`::string, optional: 'cross' or 'isolated' for fetching spot margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Coinex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    openOrders = Base.fetch(self.fetchOrdersByStatus("pending", symbol = symbol, since = since, limit = limit, params = params));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(openOrders)))
        openOrders[i + 1][Symbol("status")] = "open";
        i += 1
    end
    return openOrders

end
"""
fetches information on multiple closed orders made by the user
see: https://docs.coinex.com/api/v2/spot/order/http/list-finished-order
see: https://docs.coinex.com/api/v2/spot/order/http/list-finished-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-finished-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-finished-stop-order

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.marginMode`::string, optional: 'cross' or 'isolated' for fetching spot margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Coinex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("finished", symbol = symbol, since = since, limit = limit, params = params))

end
"""
create a currency deposit address
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/update-deposit-address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the blockchain network to create a deposit address on

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Coinex, code; params=Dict())
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
        Symbol("chain") => self.networkCodeToId(network, currencyCode = get(currency, Symbol("code"), nothing))
    );
    response = Base.fetch(self.v2PrivatePostAssetsRenewalDepositAddress(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency = currency)

end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the blockchain network to create a deposit address on

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Coinex, code; params=Dict())
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
    request[Symbol("chain")] = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
    response = Base.fetch(self.v2PrivateGetAssetsDepositAddress(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency = currency)

end
function parseDepositAddress(self::Coinex, depositAddress; currency=nothing)
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
    Symbol("currency") => self.safeCurrencyCode(nothing, currency = currency),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => safeString(depositAddress, "memo", tag)
)

end
"""
fetch all trades made by the user
see: https://docs.coinex.com/api/v2/spot/deal/http/list-user-deals
see: https://docs.coinex.com/api/v2/futures/deal/http/list-user-deals

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trade structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest trades
- `params.side`::string, optional: the side of the trades, either 'buy' or 'sell', required for swap

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Coinex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
        (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params = params);
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("market_type")] = "MARGIN";
        else
            request[Symbol("market_type")] = "SPOT";
        end
        response = Base.fetch(self.v2PrivateGetSpotUserDeals(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
"""
fetch all open positions
see: https://docs.coinex.com/api/v2/futures/position/http/list-pending-position
see: https://docs.coinex.com/api/v2/futures/position/http/list-finished-position

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.method`::string, optional: the method to use 'v2PrivateGetFuturesPendingPosition' or 'v2PrivateGetFuturesFinishedPosition' default is 'v2PrivateGetFuturesPendingPosition'

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Coinex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    defaultMethod = nothing;
    (defaultMethod, params) = self.handleOptionAndParams(params, "fetchPositions", "method", defaultValue = "v2PrivateGetFuturesPendingPosition");
    symbols = self.marketSymbols(symbols = symbols);
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
    position = self.safeList(response, "data", defaultValue = []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(position)))
        push!(result, self.parsePosition(get(position, i + 1, nothing), market = market));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
"""
fetch data on a single open contract trade position
see: https://docs.coinex.com/api/v2/futures/position/http/list-pending-position

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Coinex, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("market_type") => "FUTURES",
        Symbol("market") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v2PrivateGetFuturesPendingPosition(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parsePosition(get(data, 1, nothing), market = market)

end
function parsePosition(self::Coinex, position; market=nothing)
    marketId = safeString(position, "market");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "swap");
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
"""
set margin mode to 'cross' or 'isolated'
see: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-leverage

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.leverage`::int: the rate of leverage

# Returns
- response from the exchange
"""
function setMarginMode(self::Coinex, marginMode; symbol=nothing, params=Dict())
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
"""
set the level of leverage for a market
see: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' (default is 'cross')

# Returns
- response from the exchange
"""
function setLeverage(self::Coinex, leverage; symbol=nothing, params=Dict())
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
    (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params = params, defaultValue = "cross");
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
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-position-level

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
function fetchLeverageTiers(self::Coinex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        marketIds = self.marketIds(symbols = symbols);
        request[Symbol("market")] =         join(marketIds, ",");
    end
    response = Base.fetch(self.v2PublicGetFuturesPositionLevel(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseLeverageTiers(data, symbols = symbols, marketIdKey = "market")

end
function parseMarketLeverageTiers(self::Coinex, info; market=nothing)
    tiers = [];
    brackets = self.safeList(info, "level", defaultValue = []);
    minNotional = 0;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(brackets)))
        tier = get(brackets, i + 1, nothing);
        marketId = safeString(info, "market");
        market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "swap");
        maxNotional = self.safeNumber(tier, "amount");
        curr = functions.ccxtruthy(get(market, Symbol("linear"), nothing)) ? get(market, Symbol("base"), nothing) : get(market, Symbol("quote"), nothing);
        notional = minNotional;
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.sum(i, 1),
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
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
function modifyMarginHelper(self::Coinex, symbol, amount, addOrReduce; params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    status = safeStringLower(response, "message");
    type_var = functions.ccxtruthy((addOrReduce == "reduce")) ? "reduce" : "add";
    return extend(self.parseMarginModification(data, market = market), Dict{Symbol, Any}(
    Symbol("type") => type_var,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("status") => status
))

end
function parseMarginModification(self::Coinex, data; market=nothing)
    marketId = safeString(data, "market");
    timestamp = safeInteger2(data, "updated_at", "created_at");
    change = safeString(data, "margin_change");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
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
"""
add margin
see: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Coinex, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params = params))

end
"""
remove margin from a position
see: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Coinex, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "reduce", params = params))

end
"""
fetch the history of funding fee payments paid and received on this account
see: https://docs.coinex.com/api/v2/futures/position/http/list-position-funding-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Coinex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
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
"""
fetch the current funding rate
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Coinex, symbol; params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    first_var = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseFundingRate(first_var, market = market)

end
"""
fetch the current funding rate interval
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingInterval(self::Coinex, symbol; params=Dict())
    return Base.fetch(self.fetchFundingRate(symbol, params = params))

end
function parseFundingRate(self::Coinex, contract; market=nothing)
    currentFundingTimestamp = safeInteger(contract, "latest_funding_time");
    futureFundingTimestamp = safeInteger(contract, "next_funding_time");
    fundingTimeString = safeString(contract, "latest_funding_time");
    nextFundingTimeString = safeString(contract, "next_funding_time");
    millisecondsInterval = stringSub(nextFundingTimeString, fundingTimeString);
    marketId = safeString(contract, "market");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
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
"""
fetch the current funding rates for multiple markets
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate

# Arguments
- `symbols`::array: unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRates(self::Coinex; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbol = safeValue(symbols, 0);
        market = self.market(symbol);
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
            throw(BadSymbol(string(self.id, " fetchFundingRates() supports swap contracts only")));
        end
        marketIds = self.marketIds(symbols = symbols);
        request[Symbol("market")] =         join(marketIds, ",");
    end
    response = Base.fetch(self.v2PublicGetFuturesFundingRate(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseFundingRates(data, symbols = symbols)

end
"""
make a withdrawal
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional: memo
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: unified network code

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Coinex, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
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
        request[Symbol("chain")] = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
    end
    response = Base.fetch(self.v2PrivatePostAssetsWithdraw(extend(request, params)));
    transaction = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(transaction, currency = currency)

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
"""
fetches historical funding rate prices
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: timestamp in ms of the latest funding rate

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Coinex; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, timeframe = "8h", params = params, maxEntriesPerRequest = 1000))
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
    data = self.safeList(response, "data", defaultValue = []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        marketId = safeString(entry, "market");
        symbolInner = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap");
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
    return self.filterBySymbolSinceLimit(sorted, symbol = get(market, Symbol("symbol"), nothing), since = since, limit = limit)

end
function parseTransaction(self::Coinex, transaction; currency=nothing)
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
    code = self.safeCurrencyCode(currencyId, currency = currency);
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
    feeCurrencyId = safeString2(transaction, "fee_asset", "fee_ccy");
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
    Symbol("network") => self.networkIdToCode(networkId = networkId, currencyCode = code),
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
"""
transfer currency internally between wallets on the same account
see: https://docs.coinex.com/api/v2/assets/transfer/http/transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.symbol`::string, optional: unified ccxt symbol, required when either the fromAccount or toAccount is margin

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Coinex, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    amountToPrecision = self.currencyToPrecision(code, amount);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
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
    return extend(self.parseTransfer(response, currency = currency), Dict{Symbol, Any}(
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
function parseTransfer(self::Coinex, transfer; currency=nothing)
    timestamp = safeInteger(transfer, "created_at");
    currencyId = safeString(transfer, "ccy");
    fromId = safeString(transfer, "from_account_type");
    toId = safeString(transfer, "to_account_type");
    accountsById = safeValue(self.options, "accountsById", Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("id") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => safeString(accountsById, fromId, fromId),
    Symbol("toAccount") => safeString(accountsById, toId, toId),
    Symbol("status") => self.parseTransferStatus(safeString2(transfer, "code", "status"))
)

end
"""
fetch a history of internal transfers made on an account
see: https://docs.coinex.com/api/v2/assets/transfer/http/list-transfer-history

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' for fetching transfers to and from your margin account

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Coinex; code=nothing, since=nothing, limit=nothing, params=Dict())
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
    (marginMode, params) = self.handleMarginModeAndParams("fetchTransfers", params = params);
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransfers(data, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-withdrawal-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawal structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Coinex; code=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
"""
fetch all deposits made to an account
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-deposit-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposit structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Coinex; code=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
function parseIsolatedBorrowRate(self::Coinex, info; market=nothing)
    marketId = safeString(info, "market");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "spot");
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
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-interest-limit

# Arguments
- `symbol`::string: unified symbol of the market to fetch the borrow rate for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.code`::string: unified currency code

# Returns
- an [isolated borrow rate structure]{@link https://docs.ccxt.com/?id=isolated-borrow-rate-structure}
"""
function fetchIsolatedBorrowRate(self::Coinex, symbol; params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseIsolatedBorrowRate(data, market = market)

end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-borrow-history

# Arguments
- `code`::string, optional: unified currency code
- `symbol`::string, optional: unified market symbol when fetch interest in isolated markets
- `since`::int, optional: the earliest time in ms to fetch borrrow interest for
- `limit`::int, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
function fetchBorrowInterest(self::Coinex; code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    interest = self.parseBorrowInterests(rows, market = market);
    return self.filterByCurrencySinceLimit(interest, code = code, since = since, limit = limit)

end
function parseBorrowInterest(self::Coinex, info; market=nothing)
    marketId = safeString(info, "market");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "spot");
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
"""
create a loan to borrow margin
see: https://docs.coinex.com/api/v2/assets/loan-flat/http/margin-borrow

# Arguments
- `symbol`::string: unified market symbol, required for coinex
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.isAutoRenew`::bool, optional: whether to renew the margin loan automatically or not, default is false

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function borrowIsolatedMargin(self::Coinex, symbol, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    currency = self.currency(code);
    isAutoRenew = self.safeBool2(params, "isAutoRenew", "is_auto_renew", defaultValue = false);
    params = omit(params, "isAutoRenew");
    request = Dict{Symbol, Any}(
        Symbol("market") => get(market, Symbol("id"), nothing),
        Symbol("ccy") => get(currency, Symbol("id"), nothing),
        Symbol("borrow_amount") => self.currencyToPrecision(code, amount),
        Symbol("is_auto_renew") => isAutoRenew
    );
    response = Base.fetch(self.v2PrivatePostAssetsMarginBorrow(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    transaction = self.parseMarginLoan(data, currency = currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("symbol") => symbol
))

end
"""
repay borrowed margin and interest
see: https://docs.coinex.com/api/v2/assets/loan-flat/http/margin-repay

# Arguments
- `symbol`::string: unified market symbol, required for coinex
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.borrow_id`::string, optional: extra parameter that is not required

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function repayIsolatedMargin(self::Coinex, symbol, code, amount; params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    transaction = self.parseMarginLoan(data, currency = currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("symbol") => symbol
))

end
function parseMarginLoan(self::Coinex, info; currency=nothing)
    currencyId = safeString(info, "ccy");
    marketId = safeString(info, "market");
    timestamp = safeInteger(info, "expired_at");
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(info, "borrow_id"),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber(info, "borrow_amount"),
    Symbol("symbol") => self.safeSymbol(marketId, market = nothing, delimiter = nothing, marketType = "spot"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
"""
fetch the fee for deposits and withdrawals
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/get-deposit-withdrawal-config

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFee(self::Coinex, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.v2PublicGetAssetsDepositWithdrawConfig(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseDepositWithdrawFee(data, currency = currency)

end
"""
fetch the fees for deposits and withdrawals
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-all-deposit-withdrawal-config

# Arguments
- `codes`::array, optional: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Coinex; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.v2PublicGetAssetsAllDepositWithdrawConfig(params));
    data = self.safeList(response, "data", defaultValue = []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        item = get(data, i + 1, nothing);
        asset = self.safeDict(item, "asset", defaultValue = Dict{Symbol, Any}());
        currencyId = safeString(asset, "ccy");
        if functions.ccxtruthy(currencyId == nothing)
            i += 1; continue
        end
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_or(codes == nothing, inArray(code, codes)))
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = self.parseDepositWithdrawFee(item);
            end
        end
        i += 1
    end
    return result

end
function parseDepositWithdrawFee(self::Coinex, fee; currency=nothing)
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
    chains = self.safeList(fee, "chains", defaultValue = []);
    asset = self.safeDict(fee, "asset", defaultValue = Dict{Symbol, Any}());
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
                feeCode = self.safeCurrencyCode(currencyId, currency = currency);
                networkCode = self.networkIdToCode(networkId = networkId, currencyCode = feeCode);
                if functions.ccxtruthy(networkCode != nothing)
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
        end
        i += 1
    end
    return result

end
"""
fetch the set leverage for a market
see: https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-interest-limit

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.code`::string: unified currency code

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Coinex, symbol; params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseLeverage(data, market = market)

end
function parseLeverage(self::Coinex, leverage; market=nothing)
    marketId = safeString(leverage, "market");
    leverageValue = safeInteger(leverage, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "spot"),
    Symbol("marginMode") => "isolated",
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
"""
fetches historical positions
see: https://docs.coinex.com/api/v2/futures/position/http/list-finished-position

# Arguments
- `symbol`::string: unified contract symbol
- `since`::int, optional: the earliest time in ms to fetch positions for
- `limit`::int, optional: the maximum amount of records to fetch, default is 10
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch positions for

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionHistory(self::Coinex, symbol; since=nothing, limit=nothing, params=Dict())
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
    records = self.safeList(response, "data", defaultValue = []);
    positions = self.parsePositions(records);
    return self.filterBySymbolSinceLimit(positions, symbol = symbol, since = since, limit = limit)

end
"""
closes an open position for a market
see: https://docs.coinex.com/api/v2/futures/position/http/close-position

# Arguments
- `symbol`::string: unified CCXT market symbol
- `side`::string, optional: buy or sell, not used by coinex
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string: required by coinex, one of: limit, market, maker_only, ioc or fok, default is *market*
- `params.price`::string, optional: the price to fulfill the order, ignored in market orders
- `params.amount`::string, optional: the amount to trade in units of the base currency
- `params.clientOrderId`::string, optional: the client id of the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function closePosition(self::Coinex, symbol; side=nothing, params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function handleMarginModeAndParams(self::Coinex, methodName; params=Dict(), defaultValue=nothing)
    defaultType = safeString(self.options, "defaultType");
    isMargin = self.safeBool(params, "margin", defaultValue = false);
    marginMode = nothing;
    (marginMode, params) = handleMarginModeAndParams(self.parent, methodName, params = params, defaultValue = defaultValue);
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
function sign(self::Coinex, path; api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
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
"""
fetches the history of margin added or reduced from contract isolated positions
see: https://docs.coinex.com/api/v2/futures/position/http/list-position-margin-history

# Arguments
- `symbol`::string: unified market symbol
- `type`::string, optional: not used by coinex fetchMarginAdjustmentHistory
- `since`::int, optional: timestamp in ms of the earliest change to fetch
- `limit`::int, optional: the maximum amount of changes to fetch, default is 10
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest change to fetch
- `params.positionId`::int, optional: the id of the position that you want to retrieve margin adjustment history for

# Returns
- a list of [margin structures]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function fetchMarginAdjustmentHistory(self::Coinex; symbol=nothing, type_var=nothing, since=nothing, limit=nothing, params=Dict())
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
    data = self.safeList(response, "data", defaultValue = []);
    modifications = self.parseMarginModifications(data, symbols = nothing, symbolKey = "market", marketType = "swap");
    return self.filterBySymbolSinceLimit(modifications, symbol = symbol, since = since, limit = limit)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Coinex, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v1PublicGetAmmMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "amm/market"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetCommonCurrencyRate(self::Coinex, params=Dict(), context=Dict())
    return request(self, "common/currency/rate"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetCommonAssetConfig(self::Coinex, params=Dict(), context=Dict())
    return request(self, "common/asset/config"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetCommonMaintainInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "common/maintain/info"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetCommonTempMaintainInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "common/temp-maintain/info"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetMarginMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/market"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetMarketInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/info"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetMarketList(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/list"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetMarketTicker(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/ticker"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetMarketTickerAll(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/ticker/all"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetMarketDepth(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/depth"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetMarketDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/deals"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetMarketKline(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/kline"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PublicGetMarketDetail(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/detail"; api=["v1", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetAccountAmmBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/amm/balance"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetAccountInvestmentBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/investment/balance"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetAccountBalanceHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/balance/history"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetAccountMarketFee(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/market/fee"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetBalanceCoinDeposit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/coin/deposit"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetBalanceCoinWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/coin/withdraw"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetBalanceInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/info"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetBalanceDepositAddressCoinType(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/deposit/address/{coin_type}"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetContractTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "contract/transfer/history"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetCreditInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "credit/info"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetCreditBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "credit/balance"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetInvestmentTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "investment/transfer/history"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetMarginAccount(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/account"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetMarginConfig(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/config"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetMarginLoanHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/loan/history"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetMarginTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/transfer/history"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrderDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/deals"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrderFinished(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/finished"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrderPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/pending"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/status"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrderStatusBatch(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/status/batch"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrderUserDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/user/deals"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrderStopFinished(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/finished"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrderStopPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/pending"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrderUserTradeFee(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/user/trade/fee"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetOrderMarketTradeInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/market/trade/info"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetSubAccountBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/balance"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetSubAccountTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/transfer/history"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetSubAccountAuthApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/auth/api"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateGetSubAccountAuthApiUserAuthId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/auth/api/{user_auth_id}"; api=["v1", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostBalanceCoinWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/coin/withdraw"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostContractBalanceTransfer(self::Coinex, params=Dict(), context=Dict())
    return request(self, "contract/balance/transfer"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostMarginFlat(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/flat"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostMarginLoan(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/loan"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostMarginTransfer(self::Coinex, params=Dict(), context=Dict())
    return request(self, "margin/transfer"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostOrderLimitBatch(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/limit/batch"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostOrderIoc(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/ioc"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostOrderLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/limit"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostOrderMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/market"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostOrderModify(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/modify"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostOrderStopLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/limit"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostOrderStopMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/market"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostOrderStopModify(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/modify"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostSubAccountTransfer(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/transfer"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostSubAccountRegister(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/register"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostSubAccountUnfrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/unfrozen"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostSubAccountFrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/frozen"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePostSubAccountAuthApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/auth/api"; api=["v1", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePutBalanceDepositAddressCoinType(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/deposit/address/{coin_type}"; api=["v1", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePutSubAccountUnfrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/unfrozen"; api=["v1", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePutSubAccountFrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/frozen"; api=["v1", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePutSubAccountAuthApiUserAuthId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/auth/api/{user_auth_id}"; api=["v1", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivatePutV1AccountSettings(self::Coinex, params=Dict(), context=Dict())
    return request(self, "v1/account/settings"; api=["v1", "private"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteBalanceCoinWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "balance/coin/withdraw"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteOrderPendingBatch(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/pending/batch"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteOrderPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/pending"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteOrderStopPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/pending"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteOrderStopPendingId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/pending/{id}"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteOrderPendingByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/pending/by_client_id"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteOrderStopPendingByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop/pending/by_client_id"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteSubAccountAuthApiUserAuthId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/auth/api/{user_auth_id}"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PrivateDeleteSubAccountAuthorizeId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "sub_account/authorize/{id}"; api=["v1", "private"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPublicGetPing(self::Coinex, params=Dict(), context=Dict())
    return request(self, "ping"; api=["v1", "perpetualPublic"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPublicGetTime(self::Coinex, params=Dict(), context=Dict())
    return request(self, "time"; api=["v1", "perpetualPublic"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPublicGetMarketList(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/list"; api=["v1", "perpetualPublic"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPublicGetMarketLimitConfig(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/limit_config"; api=["v1", "perpetualPublic"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPublicGetMarketTicker(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/ticker"; api=["v1", "perpetualPublic"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPublicGetMarketTickerAll(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/ticker/all"; api=["v1", "perpetualPublic"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPublicGetMarketDepth(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/depth"; api=["v1", "perpetualPublic"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPublicGetMarketDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/deals"; api=["v1", "perpetualPublic"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPublicGetMarketFundingHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/funding_history"; api=["v1", "perpetualPublic"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPublicGetMarketKline(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/kline"; api=["v1", "perpetualPublic"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetMarketUserDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/user_deals"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetAssetQuery(self::Coinex, params=Dict(), context=Dict())
    return request(self, "asset/query"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetOrderPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/pending"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetOrderFinished(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/finished"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetOrderStopFinished(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop_finished"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetOrderStopPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop_pending"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/status"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetOrderStopStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/stop_status"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetPositionFinished(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/finished"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetPositionPending(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/pending"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetPositionFunding(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/funding"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetPositionAdlHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/adl_history"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetMarketPreference(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/preference"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetPositionMarginHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/margin_history"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivateGetPositionSettleHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/settle_history"; api=["v1", "perpetualPrivate"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostMarketAdjustLeverage(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/adjust_leverage"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostMarketPositionExpect(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/position_expect"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderPutLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/put_limit"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderPutMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/put_market"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderPutStopLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/put_stop_limit"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderPutStopMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/put_stop_market"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderModify(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/modify"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderModifyStop(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/modify_stop"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderCancel(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderCancelAll(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel_all"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderCancelBatch(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel_batch"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderCancelStop(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel_stop"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderCancelStopAll(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel_stop_all"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderCloseLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/close_limit"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderCloseMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/close_market"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostPositionAdjustMargin(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/adjust_margin"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostPositionStopLoss(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/stop_loss"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostPositionTakeProfit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/take_profit"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostPositionMarketClose(self::Coinex, params=Dict(), context=Dict())
    return request(self, "position/market_close"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderCancelByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel/by_client_id"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostOrderCancelStopByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "order/cancel_stop/by_client_id"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v1PerpetualPrivatePostMarketPreference(self::Coinex, params=Dict(), context=Dict())
    return request(self, "market/preference"; api=["v1", "perpetualPrivate"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetMaintainInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "maintain/info"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetPing(self::Coinex, params=Dict(), context=Dict())
    return request(self, "ping"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetTime(self::Coinex, params=Dict(), context=Dict())
    return request(self, "time"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetSpotMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/market"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetSpotTicker(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/ticker"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetSpotDepth(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/depth"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetSpotDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/deals"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetSpotKline(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/kline"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetSpotIndex(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/index"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesMarket(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/market"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesTicker(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/ticker"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesDepth(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/depth"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/deals"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesKline(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/kline"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesIndex(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/index"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesFundingRate(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/funding-rate"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesFundingRateHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/funding-rate-history"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesPremiumIndexHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/premium-index-history"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesPositionLevel(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/position-level"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesLiquidationHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/liquidation-history"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetFuturesBasisHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/basis-history"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetAssetsDepositWithdrawConfig(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/deposit-withdraw-config"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PublicGetAssetsAllDepositWithdrawConfig(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/all-deposit-withdraw-config"; api=["v2", "public"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountSubs(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountSubsApiDetail(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/api-detail"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountSubsInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/info"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountSubsApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/api"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountSubsTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/transfer-history"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountSubsBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/balance"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountSubsSpotBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/spot-balance"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountTradeFeeRate(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/trade-fee-rate"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountFuturesMarketSettings(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/futures-market-settings"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAccountInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/info"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsSpotBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/spot/balance"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsFuturesBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/futures/balance"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsMarginBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/margin/balance"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsFinancialBalance(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/financial/balance"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsAmmLiquidity(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/amm/liquidity"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsCreditInfo(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/credit/info"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsSpotTranscationHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/spot/transcation-history"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsMarginBorrowHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/margin/borrow-history"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsMarginInterestLimit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/margin/interest-limit"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsDepositAddress(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/deposit-address"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsDepositHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/deposit-history"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/withdraw"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsTransferHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/transfer-history"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsAmmLiquidityPool(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/amm/liquidity-pool"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetAssetsAmmIncomeHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/amm/income-history"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSpotOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/order-status"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSpotBatchOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/batch-order-status"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSpotPendingOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/pending-order"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSpotFinishedOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/finished-order"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSpotPendingStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/pending-stop-order"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSpotFinishedStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/finished-stop-order"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSpotUserDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/user-deals"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetSpotOrderDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/order-deals"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/order-status"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesBatchOrderStatus(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/batch-order-status"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesPendingOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/pending-order"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesFinishedOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/finished-order"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesPendingStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/pending-stop-order"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesFinishedStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/finished-stop-order"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesUserDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/user-deals"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesOrderDeals(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/order-deals"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesPendingPosition(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/pending-position"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesFinishedPosition(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/finished-position"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesPositionMarginHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/position-margin-history"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesPositionFundingHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/position-funding-history"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesPositionAdlHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/position-adl-history"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetFuturesPositionSettleHistory(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/position-settle-history"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetReferReferee(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/referee"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetReferRefereeRebateRecord(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/referee-rebate/record"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetReferRefereeRebateDetail(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/referee-rebate/detail"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetReferAgentReferee(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/agent-referee"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetReferAgentRebateRecord(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/agent-rebate/record"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivateGetReferAgentRebateDetail(self::Coinex, params=Dict(), context=Dict())
    return request(self, "refer/agent-rebate/detail"; api=["v2", "private"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountSubs(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountSubsFrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/frozen"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountSubsUnfrozen(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/unfrozen"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountSubsApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/api"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountSubsEditApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/edit-api"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountSubsDeleteApi(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/delete-api"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountSubsTransfer(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/subs/transfer"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountSettings(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/settings"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAccountFuturesMarketSettings(self::Coinex, params=Dict(), context=Dict())
    return request(self, "account/futures-market-settings"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAssetsMarginBorrow(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/margin/borrow"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAssetsMarginRepay(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/margin/repay"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAssetsRenewalDepositAddress(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/renewal-deposit-address"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAssetsWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/withdraw"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAssetsCancelWithdraw(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/cancel-withdraw"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAssetsTransfer(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/transfer"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAssetsAmmAddLiquidity(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/amm/add-liquidity"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostAssetsAmmRemoveLiquidity(self::Coinex, params=Dict(), context=Dict())
    return request(self, "assets/amm/remove-liquidity"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/stop-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotBatchOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/batch-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotBatchStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/batch-stop-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotModifyOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/modify-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotModifyStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/modify-stop-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotBatchModifyOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/batch-modify-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotCancelAllOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-all-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotCancelOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotCancelStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-stop-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotCancelBatchOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-batch-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotCancelBatchStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-batch-stop-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotCancelOrderByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-order-by-client-id"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostSpotCancelStopOrderByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "spot/cancel-stop-order-by-client-id"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/stop-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesBatchOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/batch-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesBatchStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/batch-stop-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesCancelPositionStopLoss(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-position-stop-loss"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesCancelPositionTakeProfit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-position-take-profit"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesModifyOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/modify-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesModifyStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/modify-stop-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesBatchModifyOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/batch-modify-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesCancelAllOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-all-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesCancelOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesCancelStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-stop-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesCancelBatchOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-batch-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesCancelBatchStopOrder(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-batch-stop-order"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesCancelOrderByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-order-by-client-id"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesCancelStopOrderByClientId(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/cancel-stop-order-by-client-id"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesClosePosition(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/close-position"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesAdjustPositionMargin(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/adjust-position-margin"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesAdjustPositionLeverage(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/adjust-position-leverage"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesSetPositionStopLoss(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/set-position-stop-loss"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function v2PrivatePostFuturesSetPositionTakeProfit(self::Coinex, params=Dict(), context=Dict())
    return request(self, "futures/set-position-take-profit"; api=["v2", "private"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Coinex(; kwargs...)
    inst = Coinex(Exchange(), describe, fetchCurrencies, parseCurrency, fetchMarkets, fetchSpotMarkets, fetchContractMarkets, parseTicker, fetchTicker, fetchTickers, fetchTime, fetchOrderBook, parseTrade, fetchTrades, fetchTradingFee, fetchTradingFees, parseTradingFee, parseOHLCV, fetchOHLCV, fetchMarginBalance, fetchSpotBalance, fetchSwapBalance, fetchFinancialBalance, fetchBalance, parseOrderStatus, parseOrder, createMarketBuyOrderWithCost, createOrderRequest, createOrder, createOrders, cancelOrders, editOrder, editOrders, cancelOrder, cancelAllOrders, fetchOrder, fetchOrdersByStatus, fetchOpenOrders, fetchClosedOrders, createDepositAddress, fetchDepositAddress, parseDepositAddress, fetchMyTrades, fetchPositions, fetchPosition, parsePosition, setMarginMode, setLeverage, fetchLeverageTiers, parseMarketLeverageTiers, modifyMarginHelper, parseMarginModification, addMargin, reduceMargin, fetchFundingHistory, fetchFundingRate, fetchFundingInterval, parseFundingRate, parseFundingInterval, fetchFundingRates, withdraw, parseTransactionStatus, fetchFundingRateHistory, parseTransaction, transfer, parseTransferStatus, parseTransfer, fetchTransfers, fetchWithdrawals, fetchDeposits, parseIsolatedBorrowRate, fetchIsolatedBorrowRate, fetchBorrowInterest, parseBorrowInterest, borrowIsolatedMargin, repayIsolatedMargin, parseMarginLoan, fetchDepositWithdrawFee, fetchDepositWithdrawFees, parseDepositWithdrawFee, fetchLeverage, parseLeverage, fetchPositionHistory, closePosition, handleMarginModeAndParams, nonce, sign, handleErrors, fetchMarginAdjustmentHistory, v1PublicGetAmmMarket, v1PublicGetCommonCurrencyRate, v1PublicGetCommonAssetConfig, v1PublicGetCommonMaintainInfo, v1PublicGetCommonTempMaintainInfo, v1PublicGetMarginMarket, v1PublicGetMarketInfo, v1PublicGetMarketList, v1PublicGetMarketTicker, v1PublicGetMarketTickerAll, v1PublicGetMarketDepth, v1PublicGetMarketDeals, v1PublicGetMarketKline, v1PublicGetMarketDetail, v1PrivateGetAccountAmmBalance, v1PrivateGetAccountInvestmentBalance, v1PrivateGetAccountBalanceHistory, v1PrivateGetAccountMarketFee, v1PrivateGetBalanceCoinDeposit, v1PrivateGetBalanceCoinWithdraw, v1PrivateGetBalanceInfo, v1PrivateGetBalanceDepositAddressCoinType, v1PrivateGetContractTransferHistory, v1PrivateGetCreditInfo, v1PrivateGetCreditBalance, v1PrivateGetInvestmentTransferHistory, v1PrivateGetMarginAccount, v1PrivateGetMarginConfig, v1PrivateGetMarginLoanHistory, v1PrivateGetMarginTransferHistory, v1PrivateGetOrderDeals, v1PrivateGetOrderFinished, v1PrivateGetOrderPending, v1PrivateGetOrderStatus, v1PrivateGetOrderStatusBatch, v1PrivateGetOrderUserDeals, v1PrivateGetOrderStopFinished, v1PrivateGetOrderStopPending, v1PrivateGetOrderUserTradeFee, v1PrivateGetOrderMarketTradeInfo, v1PrivateGetSubAccountBalance, v1PrivateGetSubAccountTransferHistory, v1PrivateGetSubAccountAuthApi, v1PrivateGetSubAccountAuthApiUserAuthId, v1PrivatePostBalanceCoinWithdraw, v1PrivatePostContractBalanceTransfer, v1PrivatePostMarginFlat, v1PrivatePostMarginLoan, v1PrivatePostMarginTransfer, v1PrivatePostOrderLimitBatch, v1PrivatePostOrderIoc, v1PrivatePostOrderLimit, v1PrivatePostOrderMarket, v1PrivatePostOrderModify, v1PrivatePostOrderStopLimit, v1PrivatePostOrderStopMarket, v1PrivatePostOrderStopModify, v1PrivatePostSubAccountTransfer, v1PrivatePostSubAccountRegister, v1PrivatePostSubAccountUnfrozen, v1PrivatePostSubAccountFrozen, v1PrivatePostSubAccountAuthApi, v1PrivatePutBalanceDepositAddressCoinType, v1PrivatePutSubAccountUnfrozen, v1PrivatePutSubAccountFrozen, v1PrivatePutSubAccountAuthApiUserAuthId, v1PrivatePutV1AccountSettings, v1PrivateDeleteBalanceCoinWithdraw, v1PrivateDeleteOrderPendingBatch, v1PrivateDeleteOrderPending, v1PrivateDeleteOrderStopPending, v1PrivateDeleteOrderStopPendingId, v1PrivateDeleteOrderPendingByClientId, v1PrivateDeleteOrderStopPendingByClientId, v1PrivateDeleteSubAccountAuthApiUserAuthId, v1PrivateDeleteSubAccountAuthorizeId, v1PerpetualPublicGetPing, v1PerpetualPublicGetTime, v1PerpetualPublicGetMarketList, v1PerpetualPublicGetMarketLimitConfig, v1PerpetualPublicGetMarketTicker, v1PerpetualPublicGetMarketTickerAll, v1PerpetualPublicGetMarketDepth, v1PerpetualPublicGetMarketDeals, v1PerpetualPublicGetMarketFundingHistory, v1PerpetualPublicGetMarketKline, v1PerpetualPrivateGetMarketUserDeals, v1PerpetualPrivateGetAssetQuery, v1PerpetualPrivateGetOrderPending, v1PerpetualPrivateGetOrderFinished, v1PerpetualPrivateGetOrderStopFinished, v1PerpetualPrivateGetOrderStopPending, v1PerpetualPrivateGetOrderStatus, v1PerpetualPrivateGetOrderStopStatus, v1PerpetualPrivateGetPositionFinished, v1PerpetualPrivateGetPositionPending, v1PerpetualPrivateGetPositionFunding, v1PerpetualPrivateGetPositionAdlHistory, v1PerpetualPrivateGetMarketPreference, v1PerpetualPrivateGetPositionMarginHistory, v1PerpetualPrivateGetPositionSettleHistory, v1PerpetualPrivatePostMarketAdjustLeverage, v1PerpetualPrivatePostMarketPositionExpect, v1PerpetualPrivatePostOrderPutLimit, v1PerpetualPrivatePostOrderPutMarket, v1PerpetualPrivatePostOrderPutStopLimit, v1PerpetualPrivatePostOrderPutStopMarket, v1PerpetualPrivatePostOrderModify, v1PerpetualPrivatePostOrderModifyStop, v1PerpetualPrivatePostOrderCancel, v1PerpetualPrivatePostOrderCancelAll, v1PerpetualPrivatePostOrderCancelBatch, v1PerpetualPrivatePostOrderCancelStop, v1PerpetualPrivatePostOrderCancelStopAll, v1PerpetualPrivatePostOrderCloseLimit, v1PerpetualPrivatePostOrderCloseMarket, v1PerpetualPrivatePostPositionAdjustMargin, v1PerpetualPrivatePostPositionStopLoss, v1PerpetualPrivatePostPositionTakeProfit, v1PerpetualPrivatePostPositionMarketClose, v1PerpetualPrivatePostOrderCancelByClientId, v1PerpetualPrivatePostOrderCancelStopByClientId, v1PerpetualPrivatePostMarketPreference, v2PublicGetMaintainInfo, v2PublicGetPing, v2PublicGetTime, v2PublicGetSpotMarket, v2PublicGetSpotTicker, v2PublicGetSpotDepth, v2PublicGetSpotDeals, v2PublicGetSpotKline, v2PublicGetSpotIndex, v2PublicGetFuturesMarket, v2PublicGetFuturesTicker, v2PublicGetFuturesDepth, v2PublicGetFuturesDeals, v2PublicGetFuturesKline, v2PublicGetFuturesIndex, v2PublicGetFuturesFundingRate, v2PublicGetFuturesFundingRateHistory, v2PublicGetFuturesPremiumIndexHistory, v2PublicGetFuturesPositionLevel, v2PublicGetFuturesLiquidationHistory, v2PublicGetFuturesBasisHistory, v2PublicGetAssetsDepositWithdrawConfig, v2PublicGetAssetsAllDepositWithdrawConfig, v2PrivateGetAccountSubs, v2PrivateGetAccountSubsApiDetail, v2PrivateGetAccountSubsInfo, v2PrivateGetAccountSubsApi, v2PrivateGetAccountSubsTransferHistory, v2PrivateGetAccountSubsBalance, v2PrivateGetAccountSubsSpotBalance, v2PrivateGetAccountTradeFeeRate, v2PrivateGetAccountFuturesMarketSettings, v2PrivateGetAccountInfo, v2PrivateGetAssetsSpotBalance, v2PrivateGetAssetsFuturesBalance, v2PrivateGetAssetsMarginBalance, v2PrivateGetAssetsFinancialBalance, v2PrivateGetAssetsAmmLiquidity, v2PrivateGetAssetsCreditInfo, v2PrivateGetAssetsSpotTranscationHistory, v2PrivateGetAssetsMarginBorrowHistory, v2PrivateGetAssetsMarginInterestLimit, v2PrivateGetAssetsDepositAddress, v2PrivateGetAssetsDepositHistory, v2PrivateGetAssetsWithdraw, v2PrivateGetAssetsTransferHistory, v2PrivateGetAssetsAmmLiquidityPool, v2PrivateGetAssetsAmmIncomeHistory, v2PrivateGetSpotOrderStatus, v2PrivateGetSpotBatchOrderStatus, v2PrivateGetSpotPendingOrder, v2PrivateGetSpotFinishedOrder, v2PrivateGetSpotPendingStopOrder, v2PrivateGetSpotFinishedStopOrder, v2PrivateGetSpotUserDeals, v2PrivateGetSpotOrderDeals, v2PrivateGetFuturesOrderStatus, v2PrivateGetFuturesBatchOrderStatus, v2PrivateGetFuturesPendingOrder, v2PrivateGetFuturesFinishedOrder, v2PrivateGetFuturesPendingStopOrder, v2PrivateGetFuturesFinishedStopOrder, v2PrivateGetFuturesUserDeals, v2PrivateGetFuturesOrderDeals, v2PrivateGetFuturesPendingPosition, v2PrivateGetFuturesFinishedPosition, v2PrivateGetFuturesPositionMarginHistory, v2PrivateGetFuturesPositionFundingHistory, v2PrivateGetFuturesPositionAdlHistory, v2PrivateGetFuturesPositionSettleHistory, v2PrivateGetReferReferee, v2PrivateGetReferRefereeRebateRecord, v2PrivateGetReferRefereeRebateDetail, v2PrivateGetReferAgentReferee, v2PrivateGetReferAgentRebateRecord, v2PrivateGetReferAgentRebateDetail, v2PrivatePostAccountSubs, v2PrivatePostAccountSubsFrozen, v2PrivatePostAccountSubsUnfrozen, v2PrivatePostAccountSubsApi, v2PrivatePostAccountSubsEditApi, v2PrivatePostAccountSubsDeleteApi, v2PrivatePostAccountSubsTransfer, v2PrivatePostAccountSettings, v2PrivatePostAccountFuturesMarketSettings, v2PrivatePostAssetsMarginBorrow, v2PrivatePostAssetsMarginRepay, v2PrivatePostAssetsRenewalDepositAddress, v2PrivatePostAssetsWithdraw, v2PrivatePostAssetsCancelWithdraw, v2PrivatePostAssetsTransfer, v2PrivatePostAssetsAmmAddLiquidity, v2PrivatePostAssetsAmmRemoveLiquidity, v2PrivatePostSpotOrder, v2PrivatePostSpotStopOrder, v2PrivatePostSpotBatchOrder, v2PrivatePostSpotBatchStopOrder, v2PrivatePostSpotModifyOrder, v2PrivatePostSpotModifyStopOrder, v2PrivatePostSpotBatchModifyOrder, v2PrivatePostSpotCancelAllOrder, v2PrivatePostSpotCancelOrder, v2PrivatePostSpotCancelStopOrder, v2PrivatePostSpotCancelBatchOrder, v2PrivatePostSpotCancelBatchStopOrder, v2PrivatePostSpotCancelOrderByClientId, v2PrivatePostSpotCancelStopOrderByClientId, v2PrivatePostFuturesOrder, v2PrivatePostFuturesStopOrder, v2PrivatePostFuturesBatchOrder, v2PrivatePostFuturesBatchStopOrder, v2PrivatePostFuturesCancelPositionStopLoss, v2PrivatePostFuturesCancelPositionTakeProfit, v2PrivatePostFuturesModifyOrder, v2PrivatePostFuturesModifyStopOrder, v2PrivatePostFuturesBatchModifyOrder, v2PrivatePostFuturesCancelAllOrder, v2PrivatePostFuturesCancelOrder, v2PrivatePostFuturesCancelStopOrder, v2PrivatePostFuturesCancelBatchOrder, v2PrivatePostFuturesCancelBatchStopOrder, v2PrivatePostFuturesCancelOrderByClientId, v2PrivatePostFuturesCancelStopOrderByClientId, v2PrivatePostFuturesClosePosition, v2PrivatePostFuturesAdjustPositionMargin, v2PrivatePostFuturesAdjustPositionLeverage, v2PrivatePostFuturesSetPositionStopLoss, v2PrivatePostFuturesSetPositionTakeProfit)
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
function __ccxt_doc_Coinex_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-all-deposit-withdrawal-config

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Coinex_fetchCurrencies

function __ccxt_doc_Coinex_fetchMarkets() end
"""
retrieves data on all markets for coinex
see: https://docs.coinex.com/api/v2/spot/market/http/list-market
see: https://docs.coinex.com/api/v2/futures/market/http/list-market

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Coinex_fetchMarkets

function __ccxt_doc_Coinex_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://docs.coinex.com/api/v2/spot/market/http/list-market-ticker
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinex_fetchTicker

function __ccxt_doc_Coinex_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://docs.coinex.com/api/v2/spot/market/http/list-market-ticker
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-ticker

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Coinex_fetchTickers

function __ccxt_doc_Coinex_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://docs.coinex.com/api/v2/common/http/time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Coinex_fetchTime

function __ccxt_doc_Coinex_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://docs.coinex.com/api/v2/spot/market/http/list-market-depth
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-depth

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Coinex_fetchOrderBook

function __ccxt_doc_Coinex_fetchTrades() end
"""
get the list of the most recent trades for a particular symbol
see: https://docs.coinex.com/api/v2/spot/market/http/list-market-deals
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-deals

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Coinex_fetchTrades

function __ccxt_doc_Coinex_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://docs.coinex.com/api/v2/spot/market/http/list-market
see: https://docs.coinex.com/api/v2/futures/market/http/list-market

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Coinex_fetchTradingFee

function __ccxt_doc_Coinex_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://docs.coinex.com/api/v2/spot/market/http/list-market
see: https://docs.coinex.com/api/v2/futures/market/http/list-market

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Coinex_fetchTradingFees

function __ccxt_doc_Coinex_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://docs.coinex.com/api/v2/spot/market/http/list-market-kline
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Coinex_fetchOHLCV

function __ccxt_doc_Coinex_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://docs.coinex.com/api/v2/assets/balance/http/get-spot-balance         // spot
see: https://docs.coinex.com/api/v2/assets/balance/http/get-futures-balance      // swap
see: https://docs.coinex.com/api/v2/assets/balance/http/get-marigin-balance      // margin
see: https://docs.coinex.com/api/v2/assets/balance/http/get-financial-balance    // financial

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'margin', 'swap', 'financial', or 'spot'

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Coinex_fetchBalance

function __ccxt_doc_Coinex_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost
see: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade003_market_order
see: https://docs.coinex.com/api/v2/spot/order/http/put-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_createMarketBuyOrderWithCost

function __ccxt_doc_Coinex_createOrder() end
"""
create a trade order
see: https://docs.coinex.com/api/v2/spot/order/http/put-order
see: https://docs.coinex.com/api/v2/spot/order/http/put-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/put-order
see: https://docs.coinex.com/api/v2/futures/order/http/put-stop-order
see: https://docs.coinex.com/api/v2/futures/position/http/close-position
see: https://docs.coinex.com/api/v2/futures/position/http/set-position-stop-loss
see: https://docs.coinex.com/api/v2/futures/position/http/set-position-take-profit

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: price to trigger stop orders
- `params.stopLossPrice`::float, optional: price to trigger stop loss orders
- `params.takeProfitPrice`::float, optional: price to trigger take profit orders
- `params.timeInForce`::string, optional: 'GTC', 'IOC', 'FOK', 'PO'
- `params.postOnly`::bool, optional: set to true if you wish to make a post only order
- `params.reduceOnly`::bool, optional: *contract only* indicates if this order is to reduce the size of a position

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_createOrder

function __ccxt_doc_Coinex_createOrders() end
"""
create a list of trade orders (all orders should be of the same symbol)
see: https://docs.coinex.com/api/v2/spot/order/http/put-multi-order
see: https://docs.coinex.com/api/v2/spot/order/http/put-multi-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/put-multi-order
see: https://docs.coinex.com/api/v2/futures/order/http/put-multi-stop-order

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the api endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_createOrders

function __ccxt_doc_Coinex_cancelOrders() end
"""
cancel multiple orders
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-batch-order
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-batch-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-batch-order
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-batch-stop-order

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for canceling stop orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_cancelOrders

function __ccxt_doc_Coinex_editOrder() end
"""
edit a trade order
see: https://docs.coinex.com/api/v2/spot/order/http/edit-order
see: https://docs.coinex.com/api/v2/spot/order/http/edit-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/edit-order
see: https://docs.coinex.com/api/v2/futures/order/http/edit-stop-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price to trigger stop orders

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_editOrder

function __ccxt_doc_Coinex_editOrders() end
"""
edit a list of trade orders
see: https://docs.coinex.com/api/v2/spot/order/http/edit-multi-order
see: https://docs.coinex.com/api/v2/futures/order/http/edit-multi-order

# Arguments
- `orders`::array: list of orders to edit, each object should contain the parameters required by editOrder, namely id, symbol, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_editOrders

function __ccxt_doc_Coinex_cancelOrder() end
"""
cancels an open order
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-order
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-stop-order
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-order-by-client-id
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-stop-order-by-client-id
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-order
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-order-by-client-id
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-stop-order-by-client-id

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, defaults to id if not passed
- `params.trigger`::bool, optional: set to true for canceling a trigger order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_cancelOrder

function __ccxt_doc_Coinex_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://docs.coinex.com/api/v2/spot/order/http/cancel-all-order
see: https://docs.coinex.com/api/v2/futures/order/http/cancel-all-order

# Arguments
- `symbol`::string: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' for canceling spot margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_cancelAllOrders

function __ccxt_doc_Coinex_fetchOrder() end
"""
fetches information on an order made by the user
see: https://docs.coinex.com/api/v2/spot/order/http/get-order-status
see: https://docs.coinex.com/api/v2/futures/order/http/get-order-status

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_fetchOrder

function __ccxt_doc_Coinex_fetchOrdersByStatus() end
"""
fetch a list of orders
see: https://docs.coinex.com/api/v2/spot/order/http/list-finished-order
see: https://docs.coinex.com/api/v2/spot/order/http/list-finished-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-finished-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-finished-stop-order

# Arguments
- `status`::string: order status to fetch for
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.marginMode`::string, optional: 'cross' or 'isolated' for fetching spot margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_fetchOrdersByStatus

function __ccxt_doc_Coinex_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://docs.coinex.com/api/v2/spot/order/http/list-pending-order
see: https://docs.coinex.com/api/v2/spot/order/http/list-pending-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-pending-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-pending-stop-order

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.marginMode`::string, optional: 'cross' or 'isolated' for fetching spot margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_fetchOpenOrders

function __ccxt_doc_Coinex_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://docs.coinex.com/api/v2/spot/order/http/list-finished-order
see: https://docs.coinex.com/api/v2/spot/order/http/list-finished-stop-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-finished-order
see: https://docs.coinex.com/api/v2/futures/order/http/list-finished-stop-order

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.marginMode`::string, optional: 'cross' or 'isolated' for fetching spot margin orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_fetchClosedOrders

function __ccxt_doc_Coinex_createDepositAddress() end
"""
create a currency deposit address
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/update-deposit-address

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the blockchain network to create a deposit address on

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Coinex_createDepositAddress

function __ccxt_doc_Coinex_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the blockchain network to create a deposit address on

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Coinex_fetchDepositAddress

function __ccxt_doc_Coinex_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://docs.coinex.com/api/v2/spot/deal/http/list-user-deals
see: https://docs.coinex.com/api/v2/futures/deal/http/list-user-deals

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trade structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest trades
- `params.side`::string, optional: the side of the trades, either 'buy' or 'sell', required for swap

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Coinex_fetchMyTrades

function __ccxt_doc_Coinex_fetchPositions() end
"""
fetch all open positions
see: https://docs.coinex.com/api/v2/futures/position/http/list-pending-position
see: https://docs.coinex.com/api/v2/futures/position/http/list-finished-position

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.method`::string, optional: the method to use 'v2PrivateGetFuturesPendingPosition' or 'v2PrivateGetFuturesFinishedPosition' default is 'v2PrivateGetFuturesPendingPosition'

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Coinex_fetchPositions

function __ccxt_doc_Coinex_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://docs.coinex.com/api/v2/futures/position/http/list-pending-position

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Coinex_fetchPosition

function __ccxt_doc_Coinex_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-leverage

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.leverage`::int: the rate of leverage

# Returns
- response from the exchange
"""
__ccxt_doc_Coinex_setMarginMode

function __ccxt_doc_Coinex_setLeverage() end
"""
set the level of leverage for a market
see: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' (default is 'cross')

# Returns
- response from the exchange
"""
__ccxt_doc_Coinex_setLeverage

function __ccxt_doc_Coinex_fetchLeverageTiers() end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-position-level

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
__ccxt_doc_Coinex_fetchLeverageTiers

function __ccxt_doc_Coinex_addMargin() end
"""
add margin
see: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Coinex_addMargin

function __ccxt_doc_Coinex_reduceMargin() end
"""
remove margin from a position
see: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Coinex_reduceMargin

function __ccxt_doc_Coinex_fetchFundingHistory() end
"""
fetch the history of funding fee payments paid and received on this account
see: https://docs.coinex.com/api/v2/futures/position/http/list-position-funding-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Coinex_fetchFundingHistory

function __ccxt_doc_Coinex_fetchFundingRate() end
"""
fetch the current funding rate
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Coinex_fetchFundingRate

function __ccxt_doc_Coinex_fetchFundingInterval() end
"""
fetch the current funding rate interval
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Coinex_fetchFundingInterval

function __ccxt_doc_Coinex_fetchFundingRates() end
"""
fetch the current funding rates for multiple markets
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate

# Arguments
- `symbols`::array: unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Coinex_fetchFundingRates

function __ccxt_doc_Coinex_withdraw() end
"""
make a withdrawal
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional: memo
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: unified network code

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinex_withdraw

function __ccxt_doc_Coinex_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: timestamp in ms of the latest funding rate

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Coinex_fetchFundingRateHistory

function __ccxt_doc_Coinex_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://docs.coinex.com/api/v2/assets/transfer/http/transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.symbol`::string, optional: unified ccxt symbol, required when either the fromAccount or toAccount is margin

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Coinex_transfer

function __ccxt_doc_Coinex_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://docs.coinex.com/api/v2/assets/transfer/http/list-transfer-history

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' for fetching transfers to and from your margin account

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Coinex_fetchTransfers

function __ccxt_doc_Coinex_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-withdrawal-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawal structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinex_fetchWithdrawals

function __ccxt_doc_Coinex_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-deposit-history

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposit structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Coinex_fetchDeposits

function __ccxt_doc_Coinex_fetchIsolatedBorrowRate() end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-interest-limit

# Arguments
- `symbol`::string: unified symbol of the market to fetch the borrow rate for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.code`::string: unified currency code

# Returns
- an [isolated borrow rate structure]{@link https://docs.ccxt.com/?id=isolated-borrow-rate-structure}
"""
__ccxt_doc_Coinex_fetchIsolatedBorrowRate

function __ccxt_doc_Coinex_fetchBorrowInterest() end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-borrow-history

# Arguments
- `code`::string, optional: unified currency code
- `symbol`::string, optional: unified market symbol when fetch interest in isolated markets
- `since`::int, optional: the earliest time in ms to fetch borrrow interest for
- `limit`::int, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
__ccxt_doc_Coinex_fetchBorrowInterest

function __ccxt_doc_Coinex_borrowIsolatedMargin() end
"""
create a loan to borrow margin
see: https://docs.coinex.com/api/v2/assets/loan-flat/http/margin-borrow

# Arguments
- `symbol`::string: unified market symbol, required for coinex
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.isAutoRenew`::bool, optional: whether to renew the margin loan automatically or not, default is false

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Coinex_borrowIsolatedMargin

function __ccxt_doc_Coinex_repayIsolatedMargin() end
"""
repay borrowed margin and interest
see: https://docs.coinex.com/api/v2/assets/loan-flat/http/margin-repay

# Arguments
- `symbol`::string: unified market symbol, required for coinex
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.borrow_id`::string, optional: extra parameter that is not required

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Coinex_repayIsolatedMargin

function __ccxt_doc_Coinex_fetchDepositWithdrawFee() end
"""
fetch the fee for deposits and withdrawals
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/get-deposit-withdrawal-config

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Coinex_fetchDepositWithdrawFee

function __ccxt_doc_Coinex_fetchDepositWithdrawFees() end
"""
fetch the fees for deposits and withdrawals
see: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-all-deposit-withdrawal-config

# Arguments
- `codes`::array, optional: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Coinex_fetchDepositWithdrawFees

function __ccxt_doc_Coinex_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-interest-limit

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.code`::string: unified currency code

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Coinex_fetchLeverage

function __ccxt_doc_Coinex_fetchPositionHistory() end
"""
fetches historical positions
see: https://docs.coinex.com/api/v2/futures/position/http/list-finished-position

# Arguments
- `symbol`::string: unified contract symbol
- `since`::int, optional: the earliest time in ms to fetch positions for
- `limit`::int, optional: the maximum amount of records to fetch, default is 10
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch positions for

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Coinex_fetchPositionHistory

function __ccxt_doc_Coinex_closePosition() end
"""
closes an open position for a market
see: https://docs.coinex.com/api/v2/futures/position/http/close-position

# Arguments
- `symbol`::string: unified CCXT market symbol
- `side`::string, optional: buy or sell, not used by coinex
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string: required by coinex, one of: limit, market, maker_only, ioc or fok, default is *market*
- `params.price`::string, optional: the price to fulfill the order, ignored in market orders
- `params.amount`::string, optional: the amount to trade in units of the base currency
- `params.clientOrderId`::string, optional: the client id of the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Coinex_closePosition

function __ccxt_doc_Coinex_fetchMarginAdjustmentHistory() end
"""
fetches the history of margin added or reduced from contract isolated positions
see: https://docs.coinex.com/api/v2/futures/position/http/list-position-margin-history

# Arguments
- `symbol`::string: unified market symbol
- `type`::string, optional: not used by coinex fetchMarginAdjustmentHistory
- `since`::int, optional: timestamp in ms of the earliest change to fetch
- `limit`::int, optional: the maximum amount of changes to fetch, default is 10
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest change to fetch
- `params.positionId`::int, optional: the id of the position that you want to retrieve margin adjustment history for

# Returns
- a list of [margin structures]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Coinex_fetchMarginAdjustmentHistory
