@kwdef mutable struct Bitget <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    setSandboxMode::Function = setSandboxMode
    enableDemoTrading::Function = enableDemoTrading
    handleProductTypeAndParams::Function = handleProductTypeAndParams
    handleUTAAndParams::Function = handleUTAAndParams
    fetchTime::Function = fetchTime
    fetchMarkets::Function = fetchMarkets
    fetchDefaultMarkets::Function = fetchDefaultMarkets
    fetchUtaMarkets::Function = fetchUtaMarkets
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarketLeverageTiers::Function = fetchMarketLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    fetchDeposits::Function = fetchDeposits
    withdraw::Function = withdraw
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchMarkPrice::Function = fetchMarkPrice
    fetchTickers::Function = fetchTickers
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    parseTradingFee::Function = parseTradingFee
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchBalance::Function = fetchBalance
    parseUtaBalance::Function = parseUtaBalance
    parseBalance::Function = parseBalance
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    createUtaOrderRequest::Function = createUtaOrderRequest
    createOrderRequest::Function = createOrderRequest
    createUtaOrders::Function = createUtaOrders
    createOrders::Function = createOrders
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelUtaOrders::Function = cancelUtaOrders
    cancelOrders::Function = cancelOrders
    cancelAllOrders::Function = cancelAllOrders
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    fetchUtaCanceledAndClosedOrders::Function = fetchUtaCanceledAndClosedOrders
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerType::Function = parseLedgerType
    fetchMyTrades::Function = fetchMyTrades
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    fetchFundingIntervals::Function = fetchFundingIntervals
    parseFundingRate::Function = parseFundingRate
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingHistory::Function = parseFundingHistory
    parseFundingHistories::Function = parseFundingHistories
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    reduceMargin::Function = reduceMargin
    addMargin::Function = addMargin
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    setLeverage::Function = setLeverage
    setMarginMode::Function = setMarginMode
    setPositionMode::Function = setPositionMode
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchTransfers::Function = fetchTransfers
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    borrowCrossMargin::Function = borrowCrossMargin
    borrowIsolatedMargin::Function = borrowIsolatedMargin
    repayIsolatedMargin::Function = repayIsolatedMargin
    repayCrossMargin::Function = repayCrossMargin
    parseMarginLoan::Function = parseMarginLoan
    fetchMyLiquidations::Function = fetchMyLiquidations
    parseLiquidation::Function = parseLiquidation
    fetchIsolatedBorrowRate::Function = fetchIsolatedBorrowRate
    parseIsolatedBorrowRate::Function = parseIsolatedBorrowRate
    fetchCrossBorrowRate::Function = fetchCrossBorrowRate
    parseBorrowRate::Function = parseBorrowRate
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    closePosition::Function = closePosition
    closeAllPositions::Function = closeAllPositions
    fetchMarginMode::Function = fetchMarginMode
    parseMarginMode::Function = parseMarginMode
    fetchPositionsHistory::Function = fetchPositionsHistory
    fetchConvertQuote::Function = fetchConvertQuote
    createConvertTrade::Function = createConvertTrade
    fetchConvertTradeHistory::Function = fetchConvertTradeHistory
    parseConversion::Function = parseConversion
    fetchConvertCurrencies::Function = fetchConvertCurrencies
    fetchFundingInterval::Function = fetchFundingInterval
    fetchLongShortRatioHistory::Function = fetchLongShortRatioHistory
    parseLongShortRatio::Function = parseLongShortRatio
    handleErrors::Function = handleErrors
    nonce::Function = nonce
    sign::Function = sign

# Generated REST endpoint fields
    publicCommonGetV2PublicAnnoucements::Function = publicCommonGetV2PublicAnnoucements
    publicCommonGetV2PublicTime::Function = publicCommonGetV2PublicTime
    publicSpotGetSpotV1NoticeQueryAllNotices::Function = publicSpotGetSpotV1NoticeQueryAllNotices
    publicSpotGetSpotV1PublicTime::Function = publicSpotGetSpotV1PublicTime
    publicSpotGetSpotV1PublicCurrencies::Function = publicSpotGetSpotV1PublicCurrencies
    publicSpotGetSpotV1PublicProducts::Function = publicSpotGetSpotV1PublicProducts
    publicSpotGetSpotV1PublicProduct::Function = publicSpotGetSpotV1PublicProduct
    publicSpotGetSpotV1MarketTicker::Function = publicSpotGetSpotV1MarketTicker
    publicSpotGetSpotV1MarketTickers::Function = publicSpotGetSpotV1MarketTickers
    publicSpotGetSpotV1MarketFills::Function = publicSpotGetSpotV1MarketFills
    publicSpotGetSpotV1MarketFillsHistory::Function = publicSpotGetSpotV1MarketFillsHistory
    publicSpotGetSpotV1MarketCandles::Function = publicSpotGetSpotV1MarketCandles
    publicSpotGetSpotV1MarketDepth::Function = publicSpotGetSpotV1MarketDepth
    publicSpotGetSpotV1MarketSpotVipLevel::Function = publicSpotGetSpotV1MarketSpotVipLevel
    publicSpotGetSpotV1MarketMergeDepth::Function = publicSpotGetSpotV1MarketMergeDepth
    publicSpotGetSpotV1MarketHistoryCandles::Function = publicSpotGetSpotV1MarketHistoryCandles
    publicSpotGetSpotV1PublicLoanCoinInfos::Function = publicSpotGetSpotV1PublicLoanCoinInfos
    publicSpotGetSpotV1PublicLoanHourInterest::Function = publicSpotGetSpotV1PublicLoanHourInterest
    publicSpotGetV2SpotPublicCoins::Function = publicSpotGetV2SpotPublicCoins
    publicSpotGetV2SpotPublicSymbols::Function = publicSpotGetV2SpotPublicSymbols
    publicSpotGetV2SpotMarketVipFeeRate::Function = publicSpotGetV2SpotMarketVipFeeRate
    publicSpotGetV2SpotMarketTickers::Function = publicSpotGetV2SpotMarketTickers
    publicSpotGetV2SpotMarketMergeDepth::Function = publicSpotGetV2SpotMarketMergeDepth
    publicSpotGetV2SpotMarketOrderbook::Function = publicSpotGetV2SpotMarketOrderbook
    publicSpotGetV2SpotMarketCandles::Function = publicSpotGetV2SpotMarketCandles
    publicSpotGetV2SpotMarketHistoryCandles::Function = publicSpotGetV2SpotMarketHistoryCandles
    publicSpotGetV2SpotMarketFills::Function = publicSpotGetV2SpotMarketFills
    publicSpotGetV2SpotMarketFillsHistory::Function = publicSpotGetV2SpotMarketFillsHistory
    publicMixGetMixV1MarketContracts::Function = publicMixGetMixV1MarketContracts
    publicMixGetMixV1MarketDepth::Function = publicMixGetMixV1MarketDepth
    publicMixGetMixV1MarketTicker::Function = publicMixGetMixV1MarketTicker
    publicMixGetMixV1MarketTickers::Function = publicMixGetMixV1MarketTickers
    publicMixGetMixV1MarketContractVipLevel::Function = publicMixGetMixV1MarketContractVipLevel
    publicMixGetMixV1MarketFills::Function = publicMixGetMixV1MarketFills
    publicMixGetMixV1MarketFillsHistory::Function = publicMixGetMixV1MarketFillsHistory
    publicMixGetMixV1MarketCandles::Function = publicMixGetMixV1MarketCandles
    publicMixGetMixV1MarketIndex::Function = publicMixGetMixV1MarketIndex
    publicMixGetMixV1MarketFundingTime::Function = publicMixGetMixV1MarketFundingTime
    publicMixGetMixV1MarketHistoryFundRate::Function = publicMixGetMixV1MarketHistoryFundRate
    publicMixGetMixV1MarketCurrentFundRate::Function = publicMixGetMixV1MarketCurrentFundRate
    publicMixGetMixV1MarketOpenInterest::Function = publicMixGetMixV1MarketOpenInterest
    publicMixGetMixV1MarketMarkPrice::Function = publicMixGetMixV1MarketMarkPrice
    publicMixGetMixV1MarketSymbolLeverage::Function = publicMixGetMixV1MarketSymbolLeverage
    publicMixGetMixV1MarketQueryPositionLever::Function = publicMixGetMixV1MarketQueryPositionLever
    publicMixGetMixV1MarketOpenLimit::Function = publicMixGetMixV1MarketOpenLimit
    publicMixGetMixV1MarketHistoryCandles::Function = publicMixGetMixV1MarketHistoryCandles
    publicMixGetMixV1MarketHistoryIndexCandles::Function = publicMixGetMixV1MarketHistoryIndexCandles
    publicMixGetMixV1MarketHistoryMarkCandles::Function = publicMixGetMixV1MarketHistoryMarkCandles
    publicMixGetMixV1MarketMergeDepth::Function = publicMixGetMixV1MarketMergeDepth
    publicMixGetV2MixMarketVipFeeRate::Function = publicMixGetV2MixMarketVipFeeRate
    publicMixGetV2MixMarketUnionInterestRateHistory::Function = publicMixGetV2MixMarketUnionInterestRateHistory
    publicMixGetV2MixMarketExchangeRate::Function = publicMixGetV2MixMarketExchangeRate
    publicMixGetV2MixMarketDiscountRate::Function = publicMixGetV2MixMarketDiscountRate
    publicMixGetV2MixMarketMergeDepth::Function = publicMixGetV2MixMarketMergeDepth
    publicMixGetV2MixMarketTicker::Function = publicMixGetV2MixMarketTicker
    publicMixGetV2MixMarketTickers::Function = publicMixGetV2MixMarketTickers
    publicMixGetV2MixMarketFills::Function = publicMixGetV2MixMarketFills
    publicMixGetV2MixMarketFillsHistory::Function = publicMixGetV2MixMarketFillsHistory
    publicMixGetV2MixMarketCandles::Function = publicMixGetV2MixMarketCandles
    publicMixGetV2MixMarketHistoryCandles::Function = publicMixGetV2MixMarketHistoryCandles
    publicMixGetV2MixMarketHistoryIndexCandles::Function = publicMixGetV2MixMarketHistoryIndexCandles
    publicMixGetV2MixMarketHistoryMarkCandles::Function = publicMixGetV2MixMarketHistoryMarkCandles
    publicMixGetV2MixMarketOpenInterest::Function = publicMixGetV2MixMarketOpenInterest
    publicMixGetV2MixMarketFundingTime::Function = publicMixGetV2MixMarketFundingTime
    publicMixGetV2MixMarketSymbolPrice::Function = publicMixGetV2MixMarketSymbolPrice
    publicMixGetV2MixMarketHistoryFundRate::Function = publicMixGetV2MixMarketHistoryFundRate
    publicMixGetV2MixMarketCurrentFundRate::Function = publicMixGetV2MixMarketCurrentFundRate
    publicMixGetV2MixMarketOiLimit::Function = publicMixGetV2MixMarketOiLimit
    publicMixGetV2MixMarketContracts::Function = publicMixGetV2MixMarketContracts
    publicMixGetV2MixMarketQueryPositionLever::Function = publicMixGetV2MixMarketQueryPositionLever
    publicMixGetV2MixMarketAccountLongShort::Function = publicMixGetV2MixMarketAccountLongShort
    publicMarginGetMarginV1CrossPublicInterestRateAndLimit::Function = publicMarginGetMarginV1CrossPublicInterestRateAndLimit
    publicMarginGetMarginV1IsolatedPublicInterestRateAndLimit::Function = publicMarginGetMarginV1IsolatedPublicInterestRateAndLimit
    publicMarginGetMarginV1CrossPublicTierData::Function = publicMarginGetMarginV1CrossPublicTierData
    publicMarginGetMarginV1IsolatedPublicTierData::Function = publicMarginGetMarginV1IsolatedPublicTierData
    publicMarginGetMarginV1PublicCurrencies::Function = publicMarginGetMarginV1PublicCurrencies
    publicMarginGetV2MarginCurrencies::Function = publicMarginGetV2MarginCurrencies
    publicMarginGetV2MarginMarketLongShortRatio::Function = publicMarginGetV2MarginMarketLongShortRatio
    publicEarnGetV2EarnLoanPublicCoinInfos::Function = publicEarnGetV2EarnLoanPublicCoinInfos
    publicEarnGetV2EarnLoanPublicHourInterest::Function = publicEarnGetV2EarnLoanPublicHourInterest
    publicUtaGetV3MarketInstruments::Function = publicUtaGetV3MarketInstruments
    publicUtaGetV3MarketTickers::Function = publicUtaGetV3MarketTickers
    publicUtaGetV3MarketOrderbook::Function = publicUtaGetV3MarketOrderbook
    publicUtaGetV3MarketFills::Function = publicUtaGetV3MarketFills
    publicUtaGetV3MarketProofOfReserves::Function = publicUtaGetV3MarketProofOfReserves
    publicUtaGetV3MarketOpenInterest::Function = publicUtaGetV3MarketOpenInterest
    publicUtaGetV3MarketCandles::Function = publicUtaGetV3MarketCandles
    publicUtaGetV3MarketHistoryCandles::Function = publicUtaGetV3MarketHistoryCandles
    publicUtaGetV3MarketCurrentFundRate::Function = publicUtaGetV3MarketCurrentFundRate
    publicUtaGetV3MarketHistoryFundRate::Function = publicUtaGetV3MarketHistoryFundRate
    publicUtaGetV3MarketRiskReserve::Function = publicUtaGetV3MarketRiskReserve
    publicUtaGetV3MarketDiscountRate::Function = publicUtaGetV3MarketDiscountRate
    publicUtaGetV3MarketMarginLoans::Function = publicUtaGetV3MarketMarginLoans
    publicUtaGetV3MarketPositionTier::Function = publicUtaGetV3MarketPositionTier
    publicUtaGetV3MarketOiLimit::Function = publicUtaGetV3MarketOiLimit
    publicUtaGetV3MarketIndexComponents::Function = publicUtaGetV3MarketIndexComponents
    privateSpotGetSpotV1WalletDepositAddress::Function = privateSpotGetSpotV1WalletDepositAddress
    privateSpotGetSpotV1WalletWithdrawalList::Function = privateSpotGetSpotV1WalletWithdrawalList
    privateSpotGetSpotV1WalletDepositList::Function = privateSpotGetSpotV1WalletDepositList
    privateSpotGetSpotV1AccountGetInfo::Function = privateSpotGetSpotV1AccountGetInfo
    privateSpotGetSpotV1AccountAssets::Function = privateSpotGetSpotV1AccountAssets
    privateSpotGetSpotV1AccountAssetsLite::Function = privateSpotGetSpotV1AccountAssetsLite
    privateSpotGetSpotV1AccountTransferRecords::Function = privateSpotGetSpotV1AccountTransferRecords
    privateSpotGetSpotV1ConvertCurrencies::Function = privateSpotGetSpotV1ConvertCurrencies
    privateSpotGetSpotV1ConvertConvertRecord::Function = privateSpotGetSpotV1ConvertConvertRecord
    privateSpotGetSpotV1LoanOngoingOrders::Function = privateSpotGetSpotV1LoanOngoingOrders
    privateSpotGetSpotV1LoanRepayHistory::Function = privateSpotGetSpotV1LoanRepayHistory
    privateSpotGetSpotV1LoanReviseHistory::Function = privateSpotGetSpotV1LoanReviseHistory
    privateSpotGetSpotV1LoanBorrowHistory::Function = privateSpotGetSpotV1LoanBorrowHistory
    privateSpotGetSpotV1LoanDebts::Function = privateSpotGetSpotV1LoanDebts
    privateSpotGetV2SpotTradeOrderInfo::Function = privateSpotGetV2SpotTradeOrderInfo
    privateSpotGetV2SpotTradeUnfilledOrders::Function = privateSpotGetV2SpotTradeUnfilledOrders
    privateSpotGetV2SpotTradeHistoryOrders::Function = privateSpotGetV2SpotTradeHistoryOrders
    privateSpotGetV2SpotTradeFills::Function = privateSpotGetV2SpotTradeFills
    privateSpotGetV2SpotTradeCurrentPlanOrder::Function = privateSpotGetV2SpotTradeCurrentPlanOrder
    privateSpotGetV2SpotTradeHistoryPlanOrder::Function = privateSpotGetV2SpotTradeHistoryPlanOrder
    privateSpotGetV2SpotAccountInfo::Function = privateSpotGetV2SpotAccountInfo
    privateSpotGetV2SpotAccountAssets::Function = privateSpotGetV2SpotAccountAssets
    privateSpotGetV2SpotAccountSubaccountAssets::Function = privateSpotGetV2SpotAccountSubaccountAssets
    privateSpotGetV2SpotAccountBills::Function = privateSpotGetV2SpotAccountBills
    privateSpotGetV2SpotAccountTransferRecords::Function = privateSpotGetV2SpotAccountTransferRecords
    privateSpotGetV2AccountFundingAssets::Function = privateSpotGetV2AccountFundingAssets
    privateSpotGetV2AccountBotAssets::Function = privateSpotGetV2AccountBotAssets
    privateSpotGetV2AccountAllAccountBalance::Function = privateSpotGetV2AccountAllAccountBalance
    privateSpotGetV2SpotWalletDepositAddress::Function = privateSpotGetV2SpotWalletDepositAddress
    privateSpotGetV2SpotWalletDepositRecords::Function = privateSpotGetV2SpotWalletDepositRecords
    privateSpotGetV2SpotWalletWithdrawalRecords::Function = privateSpotGetV2SpotWalletWithdrawalRecords
    privateSpotGetV2SpotAccountUpgradeStatus::Function = privateSpotGetV2SpotAccountUpgradeStatus
    privateSpotPostSpotV1WalletTransfer::Function = privateSpotPostSpotV1WalletTransfer
    privateSpotPostSpotV1WalletTransferV2::Function = privateSpotPostSpotV1WalletTransferV2
    privateSpotPostSpotV1WalletSubTransfer::Function = privateSpotPostSpotV1WalletSubTransfer
    privateSpotPostSpotV1WalletWithdrawal::Function = privateSpotPostSpotV1WalletWithdrawal
    privateSpotPostSpotV1WalletWithdrawalV2::Function = privateSpotPostSpotV1WalletWithdrawalV2
    privateSpotPostSpotV1WalletWithdrawalInner::Function = privateSpotPostSpotV1WalletWithdrawalInner
    privateSpotPostSpotV1WalletWithdrawalInnerV2::Function = privateSpotPostSpotV1WalletWithdrawalInnerV2
    privateSpotPostSpotV1AccountSubAccountSpotAssets::Function = privateSpotPostSpotV1AccountSubAccountSpotAssets
    privateSpotPostSpotV1AccountBills::Function = privateSpotPostSpotV1AccountBills
    privateSpotPostSpotV1TradeOrders::Function = privateSpotPostSpotV1TradeOrders
    privateSpotPostSpotV1TradeBatchOrders::Function = privateSpotPostSpotV1TradeBatchOrders
    privateSpotPostSpotV1TradeCancelOrder::Function = privateSpotPostSpotV1TradeCancelOrder
    privateSpotPostSpotV1TradeCancelOrderV2::Function = privateSpotPostSpotV1TradeCancelOrderV2
    privateSpotPostSpotV1TradeCancelSymbolOrder::Function = privateSpotPostSpotV1TradeCancelSymbolOrder
    privateSpotPostSpotV1TradeCancelBatchOrders::Function = privateSpotPostSpotV1TradeCancelBatchOrders
    privateSpotPostSpotV1TradeCancelBatchOrdersV2::Function = privateSpotPostSpotV1TradeCancelBatchOrdersV2
    privateSpotPostSpotV1TradeOrderInfo::Function = privateSpotPostSpotV1TradeOrderInfo
    privateSpotPostSpotV1TradeOpenOrders::Function = privateSpotPostSpotV1TradeOpenOrders
    privateSpotPostSpotV1TradeHistory::Function = privateSpotPostSpotV1TradeHistory
    privateSpotPostSpotV1TradeFills::Function = privateSpotPostSpotV1TradeFills
    privateSpotPostSpotV1PlanPlacePlan::Function = privateSpotPostSpotV1PlanPlacePlan
    privateSpotPostSpotV1PlanModifyPlan::Function = privateSpotPostSpotV1PlanModifyPlan
    privateSpotPostSpotV1PlanCancelPlan::Function = privateSpotPostSpotV1PlanCancelPlan
    privateSpotPostSpotV1PlanCurrentPlan::Function = privateSpotPostSpotV1PlanCurrentPlan
    privateSpotPostSpotV1PlanHistoryPlan::Function = privateSpotPostSpotV1PlanHistoryPlan
    privateSpotPostSpotV1PlanBatchCancelPlan::Function = privateSpotPostSpotV1PlanBatchCancelPlan
    privateSpotPostSpotV1ConvertQuotedPrice::Function = privateSpotPostSpotV1ConvertQuotedPrice
    privateSpotPostSpotV1ConvertTrade::Function = privateSpotPostSpotV1ConvertTrade
    privateSpotPostSpotV1LoanBorrow::Function = privateSpotPostSpotV1LoanBorrow
    privateSpotPostSpotV1LoanRepay::Function = privateSpotPostSpotV1LoanRepay
    privateSpotPostSpotV1LoanRevisePledge::Function = privateSpotPostSpotV1LoanRevisePledge
    privateSpotPostSpotV1TraceOrderOrderCurrentList::Function = privateSpotPostSpotV1TraceOrderOrderCurrentList
    privateSpotPostSpotV1TraceOrderOrderHistoryList::Function = privateSpotPostSpotV1TraceOrderOrderHistoryList
    privateSpotPostSpotV1TraceOrderCloseTrackingOrder::Function = privateSpotPostSpotV1TraceOrderCloseTrackingOrder
    privateSpotPostSpotV1TraceOrderUpdateTpsl::Function = privateSpotPostSpotV1TraceOrderUpdateTpsl
    privateSpotPostSpotV1TraceOrderFollowerEndOrder::Function = privateSpotPostSpotV1TraceOrderFollowerEndOrder
    privateSpotPostSpotV1TraceOrderSpotInfoList::Function = privateSpotPostSpotV1TraceOrderSpotInfoList
    privateSpotPostSpotV1TraceConfigGetTraderSettings::Function = privateSpotPostSpotV1TraceConfigGetTraderSettings
    privateSpotPostSpotV1TraceConfigGetFollowerSettings::Function = privateSpotPostSpotV1TraceConfigGetFollowerSettings
    privateSpotPostSpotV1TraceUserMyTraders::Function = privateSpotPostSpotV1TraceUserMyTraders
    privateSpotPostSpotV1TraceConfigSetFollowerConfig::Function = privateSpotPostSpotV1TraceConfigSetFollowerConfig
    privateSpotPostSpotV1TraceUserMyFollowers::Function = privateSpotPostSpotV1TraceUserMyFollowers
    privateSpotPostSpotV1TraceConfigSetProductCode::Function = privateSpotPostSpotV1TraceConfigSetProductCode
    privateSpotPostSpotV1TraceUserRemoveTrader::Function = privateSpotPostSpotV1TraceUserRemoveTrader
    privateSpotPostSpotV1TraceGetRemovableFollower::Function = privateSpotPostSpotV1TraceGetRemovableFollower
    privateSpotPostSpotV1TraceUserRemoveFollower::Function = privateSpotPostSpotV1TraceUserRemoveFollower
    privateSpotPostSpotV1TraceProfitTotalProfitInfo::Function = privateSpotPostSpotV1TraceProfitTotalProfitInfo
    privateSpotPostSpotV1TraceProfitTotalProfitList::Function = privateSpotPostSpotV1TraceProfitTotalProfitList
    privateSpotPostSpotV1TraceProfitProfitHisList::Function = privateSpotPostSpotV1TraceProfitProfitHisList
    privateSpotPostSpotV1TraceProfitProfitHisDetailList::Function = privateSpotPostSpotV1TraceProfitProfitHisDetailList
    privateSpotPostSpotV1TraceProfitWaitProfitDetailList::Function = privateSpotPostSpotV1TraceProfitWaitProfitDetailList
    privateSpotPostSpotV1TraceUserGetTraderInfo::Function = privateSpotPostSpotV1TraceUserGetTraderInfo
    privateSpotPostV2SpotTradePlaceOrder::Function = privateSpotPostV2SpotTradePlaceOrder
    privateSpotPostV2SpotTradeCancelOrder::Function = privateSpotPostV2SpotTradeCancelOrder
    privateSpotPostV2SpotTradeBatchOrders::Function = privateSpotPostV2SpotTradeBatchOrders
    privateSpotPostV2SpotTradeBatchCancelOrder::Function = privateSpotPostV2SpotTradeBatchCancelOrder
    privateSpotPostV2SpotTradeCancelSymbolOrder::Function = privateSpotPostV2SpotTradeCancelSymbolOrder
    privateSpotPostV2SpotTradePlacePlanOrder::Function = privateSpotPostV2SpotTradePlacePlanOrder
    privateSpotPostV2SpotTradeModifyPlanOrder::Function = privateSpotPostV2SpotTradeModifyPlanOrder
    privateSpotPostV2SpotTradeCancelPlanOrder::Function = privateSpotPostV2SpotTradeCancelPlanOrder
    privateSpotPostV2SpotTradeCancelReplaceOrder::Function = privateSpotPostV2SpotTradeCancelReplaceOrder
    privateSpotPostV2SpotTradeBatchCancelPlanOrder::Function = privateSpotPostV2SpotTradeBatchCancelPlanOrder
    privateSpotPostV2SpotWalletTransfer::Function = privateSpotPostV2SpotWalletTransfer
    privateSpotPostV2SpotWalletSubaccountTransfer::Function = privateSpotPostV2SpotWalletSubaccountTransfer
    privateSpotPostV2SpotWalletWithdrawal::Function = privateSpotPostV2SpotWalletWithdrawal
    privateSpotPostV2SpotWalletCancelWithdrawal::Function = privateSpotPostV2SpotWalletCancelWithdrawal
    privateSpotPostV2SpotWalletModifyDepositAccount::Function = privateSpotPostV2SpotWalletModifyDepositAccount
    privateSpotPostV2SpotAccountUpgrade::Function = privateSpotPostV2SpotAccountUpgrade
    privateMixGetMixV1AccountAccount::Function = privateMixGetMixV1AccountAccount
    privateMixGetMixV1AccountAccounts::Function = privateMixGetMixV1AccountAccounts
    privateMixGetMixV1PositionSinglePosition::Function = privateMixGetMixV1PositionSinglePosition
    privateMixGetMixV1PositionSinglePositionV2::Function = privateMixGetMixV1PositionSinglePositionV2
    privateMixGetMixV1PositionAllPosition::Function = privateMixGetMixV1PositionAllPosition
    privateMixGetMixV1PositionAllPositionV2::Function = privateMixGetMixV1PositionAllPositionV2
    privateMixGetMixV1PositionHistoryPosition::Function = privateMixGetMixV1PositionHistoryPosition
    privateMixGetMixV1AccountAccountBill::Function = privateMixGetMixV1AccountAccountBill
    privateMixGetMixV1AccountAccountBusinessBill::Function = privateMixGetMixV1AccountAccountBusinessBill
    privateMixGetMixV1OrderCurrent::Function = privateMixGetMixV1OrderCurrent
    privateMixGetMixV1OrderMarginCoinCurrent::Function = privateMixGetMixV1OrderMarginCoinCurrent
    privateMixGetMixV1OrderHistory::Function = privateMixGetMixV1OrderHistory
    privateMixGetMixV1OrderHistoryProductType::Function = privateMixGetMixV1OrderHistoryProductType
    privateMixGetMixV1OrderDetail::Function = privateMixGetMixV1OrderDetail
    privateMixGetMixV1OrderFills::Function = privateMixGetMixV1OrderFills
    privateMixGetMixV1OrderAllFills::Function = privateMixGetMixV1OrderAllFills
    privateMixGetMixV1PlanCurrentPlan::Function = privateMixGetMixV1PlanCurrentPlan
    privateMixGetMixV1PlanHistoryPlan::Function = privateMixGetMixV1PlanHistoryPlan
    privateMixGetMixV1TraceCurrentTrack::Function = privateMixGetMixV1TraceCurrentTrack
    privateMixGetMixV1TraceFollowerOrder::Function = privateMixGetMixV1TraceFollowerOrder
    privateMixGetMixV1TraceFollowerHistoryOrders::Function = privateMixGetMixV1TraceFollowerHistoryOrders
    privateMixGetMixV1TraceHistoryTrack::Function = privateMixGetMixV1TraceHistoryTrack
    privateMixGetMixV1TraceSummary::Function = privateMixGetMixV1TraceSummary
    privateMixGetMixV1TraceProfitSettleTokenIdGroup::Function = privateMixGetMixV1TraceProfitSettleTokenIdGroup
    privateMixGetMixV1TraceProfitDateGroupList::Function = privateMixGetMixV1TraceProfitDateGroupList
    privateMixGetMixV1TradeProfitDateList::Function = privateMixGetMixV1TradeProfitDateList
    privateMixGetMixV1TraceWaitProfitDateList::Function = privateMixGetMixV1TraceWaitProfitDateList
    privateMixGetMixV1TraceTraderSymbols::Function = privateMixGetMixV1TraceTraderSymbols
    privateMixGetMixV1TraceTraderList::Function = privateMixGetMixV1TraceTraderList
    privateMixGetMixV1TraceTraderDetail::Function = privateMixGetMixV1TraceTraderDetail
    privateMixGetMixV1TraceQueryTraceConfig::Function = privateMixGetMixV1TraceQueryTraceConfig
    privateMixGetV2MixAccountAccount::Function = privateMixGetV2MixAccountAccount
    privateMixGetV2MixAccountAccounts::Function = privateMixGetV2MixAccountAccounts
    privateMixGetV2MixAccountSubAccountAssets::Function = privateMixGetV2MixAccountSubAccountAssets
    privateMixGetV2MixAccountInterestHistory::Function = privateMixGetV2MixAccountInterestHistory
    privateMixGetV2MixAccountMaxOpen::Function = privateMixGetV2MixAccountMaxOpen
    privateMixGetV2MixAccountLiqPrice::Function = privateMixGetV2MixAccountLiqPrice
    privateMixGetV2MixAccountOpenCount::Function = privateMixGetV2MixAccountOpenCount
    privateMixGetV2MixAccountBill::Function = privateMixGetV2MixAccountBill
    privateMixGetV2MixAccountTransferLimits::Function = privateMixGetV2MixAccountTransferLimits
    privateMixGetV2MixAccountUnionConfig::Function = privateMixGetV2MixAccountUnionConfig
    privateMixGetV2MixAccountSwitchUnionUsdt::Function = privateMixGetV2MixAccountSwitchUnionUsdt
    privateMixGetV2MixAccountIsolatedSymbols::Function = privateMixGetV2MixAccountIsolatedSymbols
    privateMixGetV2MixMarketQueryPositionLever::Function = privateMixGetV2MixMarketQueryPositionLever
    privateMixGetV2MixPositionSinglePosition::Function = privateMixGetV2MixPositionSinglePosition
    privateMixGetV2MixPositionAllPosition::Function = privateMixGetV2MixPositionAllPosition
    privateMixGetV2MixPositionAdlRank::Function = privateMixGetV2MixPositionAdlRank
    privateMixGetV2MixPositionHistoryPosition::Function = privateMixGetV2MixPositionHistoryPosition
    privateMixGetV2MixOrderDetail::Function = privateMixGetV2MixOrderDetail
    privateMixGetV2MixOrderFills::Function = privateMixGetV2MixOrderFills
    privateMixGetV2MixOrderFillHistory::Function = privateMixGetV2MixOrderFillHistory
    privateMixGetV2MixOrderOrdersPending::Function = privateMixGetV2MixOrderOrdersPending
    privateMixGetV2MixOrderOrdersHistory::Function = privateMixGetV2MixOrderOrdersHistory
    privateMixGetV2MixOrderPlanSubOrder::Function = privateMixGetV2MixOrderPlanSubOrder
    privateMixGetV2MixOrderOrdersPlanPending::Function = privateMixGetV2MixOrderOrdersPlanPending
    privateMixGetV2MixOrderOrdersPlanHistory::Function = privateMixGetV2MixOrderOrdersPlanHistory
    privateMixGetV2MixMarketPositionLongShort::Function = privateMixGetV2MixMarketPositionLongShort
    privateMixPostMixV1AccountSubAccountContractAssets::Function = privateMixPostMixV1AccountSubAccountContractAssets
    privateMixPostMixV1AccountOpenCount::Function = privateMixPostMixV1AccountOpenCount
    privateMixPostMixV1AccountSetLeverage::Function = privateMixPostMixV1AccountSetLeverage
    privateMixPostMixV1AccountSetMargin::Function = privateMixPostMixV1AccountSetMargin
    privateMixPostMixV1AccountSetMarginMode::Function = privateMixPostMixV1AccountSetMarginMode
    privateMixPostMixV1AccountSetPositionMode::Function = privateMixPostMixV1AccountSetPositionMode
    privateMixPostMixV1OrderPlaceOrder::Function = privateMixPostMixV1OrderPlaceOrder
    privateMixPostMixV1OrderBatchOrders::Function = privateMixPostMixV1OrderBatchOrders
    privateMixPostMixV1OrderCancelOrder::Function = privateMixPostMixV1OrderCancelOrder
    privateMixPostMixV1OrderCancelBatchOrders::Function = privateMixPostMixV1OrderCancelBatchOrders
    privateMixPostMixV1OrderModifyOrder::Function = privateMixPostMixV1OrderModifyOrder
    privateMixPostMixV1OrderCancelSymbolOrders::Function = privateMixPostMixV1OrderCancelSymbolOrders
    privateMixPostMixV1OrderCancelAllOrders::Function = privateMixPostMixV1OrderCancelAllOrders
    privateMixPostMixV1OrderCloseAllPositions::Function = privateMixPostMixV1OrderCloseAllPositions
    privateMixPostMixV1PlanPlacePlan::Function = privateMixPostMixV1PlanPlacePlan
    privateMixPostMixV1PlanModifyPlan::Function = privateMixPostMixV1PlanModifyPlan
    privateMixPostMixV1PlanModifyPlanPreset::Function = privateMixPostMixV1PlanModifyPlanPreset
    privateMixPostMixV1PlanPlaceTPSL::Function = privateMixPostMixV1PlanPlaceTPSL
    privateMixPostMixV1PlanPlaceTrailStop::Function = privateMixPostMixV1PlanPlaceTrailStop
    privateMixPostMixV1PlanPlacePositionsTPSL::Function = privateMixPostMixV1PlanPlacePositionsTPSL
    privateMixPostMixV1PlanModifyTPSLPlan::Function = privateMixPostMixV1PlanModifyTPSLPlan
    privateMixPostMixV1PlanCancelPlan::Function = privateMixPostMixV1PlanCancelPlan
    privateMixPostMixV1PlanCancelSymbolPlan::Function = privateMixPostMixV1PlanCancelSymbolPlan
    privateMixPostMixV1PlanCancelAllPlan::Function = privateMixPostMixV1PlanCancelAllPlan
    privateMixPostMixV1TraceCloseTrackOrder::Function = privateMixPostMixV1TraceCloseTrackOrder
    privateMixPostMixV1TraceModifyTPSL::Function = privateMixPostMixV1TraceModifyTPSL
    privateMixPostMixV1TraceCloseTrackOrderBySymbol::Function = privateMixPostMixV1TraceCloseTrackOrderBySymbol
    privateMixPostMixV1TraceSetUpCopySymbols::Function = privateMixPostMixV1TraceSetUpCopySymbols
    privateMixPostMixV1TraceFollowerSetBatchTraceConfig::Function = privateMixPostMixV1TraceFollowerSetBatchTraceConfig
    privateMixPostMixV1TraceFollowerCloseByTrackingNo::Function = privateMixPostMixV1TraceFollowerCloseByTrackingNo
    privateMixPostMixV1TraceFollowerCloseByAll::Function = privateMixPostMixV1TraceFollowerCloseByAll
    privateMixPostMixV1TraceFollowerSetTpsl::Function = privateMixPostMixV1TraceFollowerSetTpsl
    privateMixPostMixV1TraceCancelCopyTrader::Function = privateMixPostMixV1TraceCancelCopyTrader
    privateMixPostMixV1TraceTraderUpdateConfig::Function = privateMixPostMixV1TraceTraderUpdateConfig
    privateMixPostMixV1TraceMyTraderList::Function = privateMixPostMixV1TraceMyTraderList
    privateMixPostMixV1TraceMyFollowerList::Function = privateMixPostMixV1TraceMyFollowerList
    privateMixPostMixV1TraceRemoveFollower::Function = privateMixPostMixV1TraceRemoveFollower
    privateMixPostMixV1TracePublicGetFollowerConfig::Function = privateMixPostMixV1TracePublicGetFollowerConfig
    privateMixPostMixV1TraceReportOrderHistoryList::Function = privateMixPostMixV1TraceReportOrderHistoryList
    privateMixPostMixV1TraceReportOrderCurrentList::Function = privateMixPostMixV1TraceReportOrderCurrentList
    privateMixPostMixV1TraceQueryTraderTpslRatioConfig::Function = privateMixPostMixV1TraceQueryTraderTpslRatioConfig
    privateMixPostMixV1TraceTraderUpdateTpslRatioConfig::Function = privateMixPostMixV1TraceTraderUpdateTpslRatioConfig
    privateMixPostV2MixAccountSetAutoMargin::Function = privateMixPostV2MixAccountSetAutoMargin
    privateMixPostV2MixAccountSetLeverage::Function = privateMixPostV2MixAccountSetLeverage
    privateMixPostV2MixAccountSetAllLeverage::Function = privateMixPostV2MixAccountSetAllLeverage
    privateMixPostV2MixAccountSetMargin::Function = privateMixPostV2MixAccountSetMargin
    privateMixPostV2MixAccountSetAssetMode::Function = privateMixPostV2MixAccountSetAssetMode
    privateMixPostV2MixAccountSetMarginMode::Function = privateMixPostV2MixAccountSetMarginMode
    privateMixPostV2MixAccountUnionConvert::Function = privateMixPostV2MixAccountUnionConvert
    privateMixPostV2MixAccountSetPositionMode::Function = privateMixPostV2MixAccountSetPositionMode
    privateMixPostV2MixOrderPlaceOrder::Function = privateMixPostV2MixOrderPlaceOrder
    privateMixPostV2MixOrderClickBackhand::Function = privateMixPostV2MixOrderClickBackhand
    privateMixPostV2MixOrderBatchPlaceOrder::Function = privateMixPostV2MixOrderBatchPlaceOrder
    privateMixPostV2MixOrderModifyOrder::Function = privateMixPostV2MixOrderModifyOrder
    privateMixPostV2MixOrderCancelOrder::Function = privateMixPostV2MixOrderCancelOrder
    privateMixPostV2MixOrderBatchCancelOrders::Function = privateMixPostV2MixOrderBatchCancelOrders
    privateMixPostV2MixOrderClosePositions::Function = privateMixPostV2MixOrderClosePositions
    privateMixPostV2MixOrderCancelAllOrders::Function = privateMixPostV2MixOrderCancelAllOrders
    privateMixPostV2MixOrderPlaceTpslOrder::Function = privateMixPostV2MixOrderPlaceTpslOrder
    privateMixPostV2MixOrderPlacePosTpsl::Function = privateMixPostV2MixOrderPlacePosTpsl
    privateMixPostV2MixOrderPlacePlanOrder::Function = privateMixPostV2MixOrderPlacePlanOrder
    privateMixPostV2MixOrderModifyTpslOrder::Function = privateMixPostV2MixOrderModifyTpslOrder
    privateMixPostV2MixOrderModifyPlanOrder::Function = privateMixPostV2MixOrderModifyPlanOrder
    privateMixPostV2MixOrderCancelPlanOrder::Function = privateMixPostV2MixOrderCancelPlanOrder
    privateUserGetUserV1FeeQuery::Function = privateUserGetUserV1FeeQuery
    privateUserGetUserV1SubVirtualList::Function = privateUserGetUserV1SubVirtualList
    privateUserGetUserV1SubVirtualApiList::Function = privateUserGetUserV1SubVirtualApiList
    privateUserGetUserV1TaxSpotRecord::Function = privateUserGetUserV1TaxSpotRecord
    privateUserGetUserV1TaxFutureRecord::Function = privateUserGetUserV1TaxFutureRecord
    privateUserGetUserV1TaxMarginRecord::Function = privateUserGetUserV1TaxMarginRecord
    privateUserGetUserV1TaxP2pRecord::Function = privateUserGetUserV1TaxP2pRecord
    privateUserGetV2UserVirtualSubaccountList::Function = privateUserGetV2UserVirtualSubaccountList
    privateUserGetV2UserVirtualSubaccountApikeyList::Function = privateUserGetV2UserVirtualSubaccountApikeyList
    privateUserPostUserV1SubVirtualCreate::Function = privateUserPostUserV1SubVirtualCreate
    privateUserPostUserV1SubVirtualModify::Function = privateUserPostUserV1SubVirtualModify
    privateUserPostUserV1SubVirtualApiBatchCreate::Function = privateUserPostUserV1SubVirtualApiBatchCreate
    privateUserPostUserV1SubVirtualApiCreate::Function = privateUserPostUserV1SubVirtualApiCreate
    privateUserPostUserV1SubVirtualApiModify::Function = privateUserPostUserV1SubVirtualApiModify
    privateUserPostV2UserCreateVirtualSubaccount::Function = privateUserPostV2UserCreateVirtualSubaccount
    privateUserPostV2UserModifyVirtualSubaccount::Function = privateUserPostV2UserModifyVirtualSubaccount
    privateUserPostV2UserBatchCreateSubaccountAndApikey::Function = privateUserPostV2UserBatchCreateSubaccountAndApikey
    privateUserPostV2UserCreateVirtualSubaccountApikey::Function = privateUserPostV2UserCreateVirtualSubaccountApikey
    privateUserPostV2UserModifyVirtualSubaccountApikey::Function = privateUserPostV2UserModifyVirtualSubaccountApikey
    privateP2pGetP2pV1MerchantMerchantList::Function = privateP2pGetP2pV1MerchantMerchantList
    privateP2pGetP2pV1MerchantMerchantInfo::Function = privateP2pGetP2pV1MerchantMerchantInfo
    privateP2pGetP2pV1MerchantAdvList::Function = privateP2pGetP2pV1MerchantAdvList
    privateP2pGetP2pV1MerchantOrderList::Function = privateP2pGetP2pV1MerchantOrderList
    privateP2pGetV2P2pMerchantList::Function = privateP2pGetV2P2pMerchantList
    privateP2pGetV2P2pMerchantInfo::Function = privateP2pGetV2P2pMerchantInfo
    privateP2pGetV2P2pOrderList::Function = privateP2pGetV2P2pOrderList
    privateP2pGetV2P2pAdvList::Function = privateP2pGetV2P2pAdvList
    privateBrokerGetBrokerV1AccountInfo::Function = privateBrokerGetBrokerV1AccountInfo
    privateBrokerGetBrokerV1AccountSubList::Function = privateBrokerGetBrokerV1AccountSubList
    privateBrokerGetBrokerV1AccountSubEmail::Function = privateBrokerGetBrokerV1AccountSubEmail
    privateBrokerGetBrokerV1AccountSubSpotAssets::Function = privateBrokerGetBrokerV1AccountSubSpotAssets
    privateBrokerGetBrokerV1AccountSubFutureAssets::Function = privateBrokerGetBrokerV1AccountSubFutureAssets
    privateBrokerGetBrokerV1AccountSubaccountTransfer::Function = privateBrokerGetBrokerV1AccountSubaccountTransfer
    privateBrokerGetBrokerV1AccountSubaccountDeposit::Function = privateBrokerGetBrokerV1AccountSubaccountDeposit
    privateBrokerGetBrokerV1AccountSubaccountWithdrawal::Function = privateBrokerGetBrokerV1AccountSubaccountWithdrawal
    privateBrokerGetBrokerV1AccountSubApiList::Function = privateBrokerGetBrokerV1AccountSubApiList
    privateBrokerGetV2BrokerAccountInfo::Function = privateBrokerGetV2BrokerAccountInfo
    privateBrokerGetV2BrokerAccountSubaccountList::Function = privateBrokerGetV2BrokerAccountSubaccountList
    privateBrokerGetV2BrokerAccountSubaccountEmail::Function = privateBrokerGetV2BrokerAccountSubaccountEmail
    privateBrokerGetV2BrokerAccountSubaccountSpotAssets::Function = privateBrokerGetV2BrokerAccountSubaccountSpotAssets
    privateBrokerGetV2BrokerAccountSubaccountFutureAssets::Function = privateBrokerGetV2BrokerAccountSubaccountFutureAssets
    privateBrokerGetV2BrokerManageSubaccountApikeyList::Function = privateBrokerGetV2BrokerManageSubaccountApikeyList
    privateBrokerPostBrokerV1AccountSubCreate::Function = privateBrokerPostBrokerV1AccountSubCreate
    privateBrokerPostBrokerV1AccountSubModify::Function = privateBrokerPostBrokerV1AccountSubModify
    privateBrokerPostBrokerV1AccountSubModifyEmail::Function = privateBrokerPostBrokerV1AccountSubModifyEmail
    privateBrokerPostBrokerV1AccountSubAddress::Function = privateBrokerPostBrokerV1AccountSubAddress
    privateBrokerPostBrokerV1AccountSubWithdrawal::Function = privateBrokerPostBrokerV1AccountSubWithdrawal
    privateBrokerPostBrokerV1AccountSubAutoTransfer::Function = privateBrokerPostBrokerV1AccountSubAutoTransfer
    privateBrokerPostBrokerV1AccountSubApiCreate::Function = privateBrokerPostBrokerV1AccountSubApiCreate
    privateBrokerPostBrokerV1AccountSubApiModify::Function = privateBrokerPostBrokerV1AccountSubApiModify
    privateBrokerPostV2BrokerAccountModifySubaccountEmail::Function = privateBrokerPostV2BrokerAccountModifySubaccountEmail
    privateBrokerPostV2BrokerAccountCreateSubaccount::Function = privateBrokerPostV2BrokerAccountCreateSubaccount
    privateBrokerPostV2BrokerAccountModifySubaccount::Function = privateBrokerPostV2BrokerAccountModifySubaccount
    privateBrokerPostV2BrokerAccountSubaccountAddress::Function = privateBrokerPostV2BrokerAccountSubaccountAddress
    privateBrokerPostV2BrokerAccountSubaccountWithdrawal::Function = privateBrokerPostV2BrokerAccountSubaccountWithdrawal
    privateBrokerPostV2BrokerAccountSetSubaccountAutotransfer::Function = privateBrokerPostV2BrokerAccountSetSubaccountAutotransfer
    privateBrokerPostV2BrokerManageCreateSubaccountApikey::Function = privateBrokerPostV2BrokerManageCreateSubaccountApikey
    privateBrokerPostV2BrokerManageModifySubaccountApikey::Function = privateBrokerPostV2BrokerManageModifySubaccountApikey
    privateMarginGetMarginV1CrossAccountRiskRate::Function = privateMarginGetMarginV1CrossAccountRiskRate
    privateMarginGetMarginV1CrossAccountMaxTransferOutAmount::Function = privateMarginGetMarginV1CrossAccountMaxTransferOutAmount
    privateMarginGetMarginV1IsolatedAccountMaxTransferOutAmount::Function = privateMarginGetMarginV1IsolatedAccountMaxTransferOutAmount
    privateMarginGetMarginV1IsolatedOrderOpenOrders::Function = privateMarginGetMarginV1IsolatedOrderOpenOrders
    privateMarginGetMarginV1IsolatedOrderHistory::Function = privateMarginGetMarginV1IsolatedOrderHistory
    privateMarginGetMarginV1IsolatedOrderFills::Function = privateMarginGetMarginV1IsolatedOrderFills
    privateMarginGetMarginV1IsolatedLoanList::Function = privateMarginGetMarginV1IsolatedLoanList
    privateMarginGetMarginV1IsolatedRepayList::Function = privateMarginGetMarginV1IsolatedRepayList
    privateMarginGetMarginV1IsolatedInterestList::Function = privateMarginGetMarginV1IsolatedInterestList
    privateMarginGetMarginV1IsolatedLiquidationList::Function = privateMarginGetMarginV1IsolatedLiquidationList
    privateMarginGetMarginV1IsolatedFinList::Function = privateMarginGetMarginV1IsolatedFinList
    privateMarginGetMarginV1CrossOrderOpenOrders::Function = privateMarginGetMarginV1CrossOrderOpenOrders
    privateMarginGetMarginV1CrossOrderHistory::Function = privateMarginGetMarginV1CrossOrderHistory
    privateMarginGetMarginV1CrossOrderFills::Function = privateMarginGetMarginV1CrossOrderFills
    privateMarginGetMarginV1CrossLoanList::Function = privateMarginGetMarginV1CrossLoanList
    privateMarginGetMarginV1CrossRepayList::Function = privateMarginGetMarginV1CrossRepayList
    privateMarginGetMarginV1CrossInterestList::Function = privateMarginGetMarginV1CrossInterestList
    privateMarginGetMarginV1CrossLiquidationList::Function = privateMarginGetMarginV1CrossLiquidationList
    privateMarginGetMarginV1CrossFinList::Function = privateMarginGetMarginV1CrossFinList
    privateMarginGetMarginV1CrossAccountAssets::Function = privateMarginGetMarginV1CrossAccountAssets
    privateMarginGetMarginV1IsolatedAccountAssets::Function = privateMarginGetMarginV1IsolatedAccountAssets
    privateMarginGetV2MarginCrossedBorrowHistory::Function = privateMarginGetV2MarginCrossedBorrowHistory
    privateMarginGetV2MarginCrossedRepayHistory::Function = privateMarginGetV2MarginCrossedRepayHistory
    privateMarginGetV2MarginCrossedInterestHistory::Function = privateMarginGetV2MarginCrossedInterestHistory
    privateMarginGetV2MarginCrossedLiquidationHistory::Function = privateMarginGetV2MarginCrossedLiquidationHistory
    privateMarginGetV2MarginCrossedFinancialRecords::Function = privateMarginGetV2MarginCrossedFinancialRecords
    privateMarginGetV2MarginCrossedAccountAssets::Function = privateMarginGetV2MarginCrossedAccountAssets
    privateMarginGetV2MarginCrossedAccountRiskRate::Function = privateMarginGetV2MarginCrossedAccountRiskRate
    privateMarginGetV2MarginCrossedAccountMaxBorrowableAmount::Function = privateMarginGetV2MarginCrossedAccountMaxBorrowableAmount
    privateMarginGetV2MarginCrossedAccountMaxTransferOutAmount::Function = privateMarginGetV2MarginCrossedAccountMaxTransferOutAmount
    privateMarginGetV2MarginCrossedInterestRateAndLimit::Function = privateMarginGetV2MarginCrossedInterestRateAndLimit
    privateMarginGetV2MarginCrossedTierData::Function = privateMarginGetV2MarginCrossedTierData
    privateMarginGetV2MarginCrossedOpenOrders::Function = privateMarginGetV2MarginCrossedOpenOrders
    privateMarginGetV2MarginCrossedHistoryOrders::Function = privateMarginGetV2MarginCrossedHistoryOrders
    privateMarginGetV2MarginCrossedFills::Function = privateMarginGetV2MarginCrossedFills
    privateMarginGetV2MarginIsolatedBorrowHistory::Function = privateMarginGetV2MarginIsolatedBorrowHistory
    privateMarginGetV2MarginIsolatedRepayHistory::Function = privateMarginGetV2MarginIsolatedRepayHistory
    privateMarginGetV2MarginIsolatedInterestHistory::Function = privateMarginGetV2MarginIsolatedInterestHistory
    privateMarginGetV2MarginIsolatedLiquidationHistory::Function = privateMarginGetV2MarginIsolatedLiquidationHistory
    privateMarginGetV2MarginIsolatedFinancialRecords::Function = privateMarginGetV2MarginIsolatedFinancialRecords
    privateMarginGetV2MarginIsolatedAccountAssets::Function = privateMarginGetV2MarginIsolatedAccountAssets
    privateMarginGetV2MarginIsolatedAccountRiskRate::Function = privateMarginGetV2MarginIsolatedAccountRiskRate
    privateMarginGetV2MarginIsolatedAccountMaxBorrowableAmount::Function = privateMarginGetV2MarginIsolatedAccountMaxBorrowableAmount
    privateMarginGetV2MarginIsolatedAccountMaxTransferOutAmount::Function = privateMarginGetV2MarginIsolatedAccountMaxTransferOutAmount
    privateMarginGetV2MarginIsolatedInterestRateAndLimit::Function = privateMarginGetV2MarginIsolatedInterestRateAndLimit
    privateMarginGetV2MarginIsolatedTierData::Function = privateMarginGetV2MarginIsolatedTierData
    privateMarginGetV2MarginIsolatedOpenOrders::Function = privateMarginGetV2MarginIsolatedOpenOrders
    privateMarginGetV2MarginIsolatedHistoryOrders::Function = privateMarginGetV2MarginIsolatedHistoryOrders
    privateMarginGetV2MarginIsolatedFills::Function = privateMarginGetV2MarginIsolatedFills
    privateMarginPostMarginV1CrossAccountBorrow::Function = privateMarginPostMarginV1CrossAccountBorrow
    privateMarginPostMarginV1IsolatedAccountBorrow::Function = privateMarginPostMarginV1IsolatedAccountBorrow
    privateMarginPostMarginV1CrossAccountRepay::Function = privateMarginPostMarginV1CrossAccountRepay
    privateMarginPostMarginV1IsolatedAccountRepay::Function = privateMarginPostMarginV1IsolatedAccountRepay
    privateMarginPostMarginV1IsolatedAccountRiskRate::Function = privateMarginPostMarginV1IsolatedAccountRiskRate
    privateMarginPostMarginV1CrossAccountMaxBorrowableAmount::Function = privateMarginPostMarginV1CrossAccountMaxBorrowableAmount
    privateMarginPostMarginV1IsolatedAccountMaxBorrowableAmount::Function = privateMarginPostMarginV1IsolatedAccountMaxBorrowableAmount
    privateMarginPostMarginV1IsolatedAccountFlashRepay::Function = privateMarginPostMarginV1IsolatedAccountFlashRepay
    privateMarginPostMarginV1IsolatedAccountQueryFlashRepayStatus::Function = privateMarginPostMarginV1IsolatedAccountQueryFlashRepayStatus
    privateMarginPostMarginV1CrossAccountFlashRepay::Function = privateMarginPostMarginV1CrossAccountFlashRepay
    privateMarginPostMarginV1CrossAccountQueryFlashRepayStatus::Function = privateMarginPostMarginV1CrossAccountQueryFlashRepayStatus
    privateMarginPostMarginV1IsolatedOrderPlaceOrder::Function = privateMarginPostMarginV1IsolatedOrderPlaceOrder
    privateMarginPostMarginV1IsolatedOrderBatchPlaceOrder::Function = privateMarginPostMarginV1IsolatedOrderBatchPlaceOrder
    privateMarginPostMarginV1IsolatedOrderCancelOrder::Function = privateMarginPostMarginV1IsolatedOrderCancelOrder
    privateMarginPostMarginV1IsolatedOrderBatchCancelOrder::Function = privateMarginPostMarginV1IsolatedOrderBatchCancelOrder
    privateMarginPostMarginV1CrossOrderPlaceOrder::Function = privateMarginPostMarginV1CrossOrderPlaceOrder
    privateMarginPostMarginV1CrossOrderBatchPlaceOrder::Function = privateMarginPostMarginV1CrossOrderBatchPlaceOrder
    privateMarginPostMarginV1CrossOrderCancelOrder::Function = privateMarginPostMarginV1CrossOrderCancelOrder
    privateMarginPostMarginV1CrossOrderBatchCancelOrder::Function = privateMarginPostMarginV1CrossOrderBatchCancelOrder
    privateMarginPostV2MarginCrossedAccountBorrow::Function = privateMarginPostV2MarginCrossedAccountBorrow
    privateMarginPostV2MarginCrossedAccountRepay::Function = privateMarginPostV2MarginCrossedAccountRepay
    privateMarginPostV2MarginCrossedAccountFlashRepay::Function = privateMarginPostV2MarginCrossedAccountFlashRepay
    privateMarginPostV2MarginCrossedAccountQueryFlashRepayStatus::Function = privateMarginPostV2MarginCrossedAccountQueryFlashRepayStatus
    privateMarginPostV2MarginCrossedPlaceOrder::Function = privateMarginPostV2MarginCrossedPlaceOrder
    privateMarginPostV2MarginCrossedBatchPlaceOrder::Function = privateMarginPostV2MarginCrossedBatchPlaceOrder
    privateMarginPostV2MarginCrossedCancelOrder::Function = privateMarginPostV2MarginCrossedCancelOrder
    privateMarginPostV2MarginCrossedBatchCancelOrder::Function = privateMarginPostV2MarginCrossedBatchCancelOrder
    privateMarginPostV2MarginIsolatedAccountBorrow::Function = privateMarginPostV2MarginIsolatedAccountBorrow
    privateMarginPostV2MarginIsolatedAccountRepay::Function = privateMarginPostV2MarginIsolatedAccountRepay
    privateMarginPostV2MarginIsolatedAccountFlashRepay::Function = privateMarginPostV2MarginIsolatedAccountFlashRepay
    privateMarginPostV2MarginIsolatedAccountQueryFlashRepayStatus::Function = privateMarginPostV2MarginIsolatedAccountQueryFlashRepayStatus
    privateMarginPostV2MarginIsolatedPlaceOrder::Function = privateMarginPostV2MarginIsolatedPlaceOrder
    privateMarginPostV2MarginIsolatedBatchPlaceOrder::Function = privateMarginPostV2MarginIsolatedBatchPlaceOrder
    privateMarginPostV2MarginIsolatedCancelOrder::Function = privateMarginPostV2MarginIsolatedCancelOrder
    privateMarginPostV2MarginIsolatedBatchCancelOrder::Function = privateMarginPostV2MarginIsolatedBatchCancelOrder
    privateCopyGetV2CopyMixTraderOrderCurrentTrack::Function = privateCopyGetV2CopyMixTraderOrderCurrentTrack
    privateCopyGetV2CopyMixTraderOrderHistoryTrack::Function = privateCopyGetV2CopyMixTraderOrderHistoryTrack
    privateCopyGetV2CopyMixTraderOrderTotalDetail::Function = privateCopyGetV2CopyMixTraderOrderTotalDetail
    privateCopyGetV2CopyMixTraderProfitHistorySummarys::Function = privateCopyGetV2CopyMixTraderProfitHistorySummarys
    privateCopyGetV2CopyMixTraderProfitHistoryDetails::Function = privateCopyGetV2CopyMixTraderProfitHistoryDetails
    privateCopyGetV2CopyMixTraderProfitDetails::Function = privateCopyGetV2CopyMixTraderProfitDetails
    privateCopyGetV2CopyMixTraderProfitsGroupCoinDate::Function = privateCopyGetV2CopyMixTraderProfitsGroupCoinDate
    privateCopyGetV2CopyMixTraderConfigQuerySymbols::Function = privateCopyGetV2CopyMixTraderConfigQuerySymbols
    privateCopyGetV2CopyMixTraderConfigQueryFollowers::Function = privateCopyGetV2CopyMixTraderConfigQueryFollowers
    privateCopyGetV2CopyMixFollowerQueryCurrentOrders::Function = privateCopyGetV2CopyMixFollowerQueryCurrentOrders
    privateCopyGetV2CopyMixFollowerQueryHistoryOrders::Function = privateCopyGetV2CopyMixFollowerQueryHistoryOrders
    privateCopyGetV2CopyMixFollowerQuerySettings::Function = privateCopyGetV2CopyMixFollowerQuerySettings
    privateCopyGetV2CopyMixFollowerQueryTraders::Function = privateCopyGetV2CopyMixFollowerQueryTraders
    privateCopyGetV2CopyMixFollowerQueryQuantityLimit::Function = privateCopyGetV2CopyMixFollowerQueryQuantityLimit
    privateCopyGetV2CopyMixBrokerQueryTraders::Function = privateCopyGetV2CopyMixBrokerQueryTraders
    privateCopyGetV2CopyMixBrokerQueryHistoryTraces::Function = privateCopyGetV2CopyMixBrokerQueryHistoryTraces
    privateCopyGetV2CopyMixBrokerQueryCurrentTraces::Function = privateCopyGetV2CopyMixBrokerQueryCurrentTraces
    privateCopyGetV2CopySpotTraderProfitSummarys::Function = privateCopyGetV2CopySpotTraderProfitSummarys
    privateCopyGetV2CopySpotTraderProfitHistoryDetails::Function = privateCopyGetV2CopySpotTraderProfitHistoryDetails
    privateCopyGetV2CopySpotTraderProfitDetails::Function = privateCopyGetV2CopySpotTraderProfitDetails
    privateCopyGetV2CopySpotTraderOrderTotalDetail::Function = privateCopyGetV2CopySpotTraderOrderTotalDetail
    privateCopyGetV2CopySpotTraderOrderHistoryTrack::Function = privateCopyGetV2CopySpotTraderOrderHistoryTrack
    privateCopyGetV2CopySpotTraderOrderCurrentTrack::Function = privateCopyGetV2CopySpotTraderOrderCurrentTrack
    privateCopyGetV2CopySpotTraderConfigQuerySettings::Function = privateCopyGetV2CopySpotTraderConfigQuerySettings
    privateCopyGetV2CopySpotTraderConfigQueryFollowers::Function = privateCopyGetV2CopySpotTraderConfigQueryFollowers
    privateCopyGetV2CopySpotFollowerQueryTraders::Function = privateCopyGetV2CopySpotFollowerQueryTraders
    privateCopyGetV2CopySpotFollowerQueryTraderSymbols::Function = privateCopyGetV2CopySpotFollowerQueryTraderSymbols
    privateCopyGetV2CopySpotFollowerQuerySettings::Function = privateCopyGetV2CopySpotFollowerQuerySettings
    privateCopyGetV2CopySpotFollowerQueryHistoryOrders::Function = privateCopyGetV2CopySpotFollowerQueryHistoryOrders
    privateCopyGetV2CopySpotFollowerQueryCurrentOrders::Function = privateCopyGetV2CopySpotFollowerQueryCurrentOrders
    privateCopyPostV2CopyMixTraderOrderModifyTpsl::Function = privateCopyPostV2CopyMixTraderOrderModifyTpsl
    privateCopyPostV2CopyMixTraderOrderClosePositions::Function = privateCopyPostV2CopyMixTraderOrderClosePositions
    privateCopyPostV2CopyMixTraderConfigSettingSymbols::Function = privateCopyPostV2CopyMixTraderConfigSettingSymbols
    privateCopyPostV2CopyMixTraderConfigSettingBase::Function = privateCopyPostV2CopyMixTraderConfigSettingBase
    privateCopyPostV2CopyMixTraderConfigRemoveFollower::Function = privateCopyPostV2CopyMixTraderConfigRemoveFollower
    privateCopyPostV2CopyMixFollowerSettingTpsl::Function = privateCopyPostV2CopyMixFollowerSettingTpsl
    privateCopyPostV2CopyMixFollowerSettings::Function = privateCopyPostV2CopyMixFollowerSettings
    privateCopyPostV2CopyMixFollowerClosePositions::Function = privateCopyPostV2CopyMixFollowerClosePositions
    privateCopyPostV2CopyMixFollowerCancelTrader::Function = privateCopyPostV2CopyMixFollowerCancelTrader
    privateCopyPostV2CopySpotTraderOrderModifyTpsl::Function = privateCopyPostV2CopySpotTraderOrderModifyTpsl
    privateCopyPostV2CopySpotTraderOrderCloseTracking::Function = privateCopyPostV2CopySpotTraderOrderCloseTracking
    privateCopyPostV2CopySpotTraderConfigSettingSymbols::Function = privateCopyPostV2CopySpotTraderConfigSettingSymbols
    privateCopyPostV2CopySpotTraderConfigRemoveFollower::Function = privateCopyPostV2CopySpotTraderConfigRemoveFollower
    privateCopyPostV2CopySpotFollowerStopOrder::Function = privateCopyPostV2CopySpotFollowerStopOrder
    privateCopyPostV2CopySpotFollowerSettings::Function = privateCopyPostV2CopySpotFollowerSettings
    privateCopyPostV2CopySpotFollowerSettingTpsl::Function = privateCopyPostV2CopySpotFollowerSettingTpsl
    privateCopyPostV2CopySpotFollowerOrderCloseTracking::Function = privateCopyPostV2CopySpotFollowerOrderCloseTracking
    privateCopyPostV2CopySpotFollowerCancelTrader::Function = privateCopyPostV2CopySpotFollowerCancelTrader
    privateTaxGetV2TaxSpotRecord::Function = privateTaxGetV2TaxSpotRecord
    privateTaxGetV2TaxFutureRecord::Function = privateTaxGetV2TaxFutureRecord
    privateTaxGetV2TaxMarginRecord::Function = privateTaxGetV2TaxMarginRecord
    privateTaxGetV2TaxP2pRecord::Function = privateTaxGetV2TaxP2pRecord
    privateConvertGetV2ConvertCurrencies::Function = privateConvertGetV2ConvertCurrencies
    privateConvertGetV2ConvertQuotedPrice::Function = privateConvertGetV2ConvertQuotedPrice
    privateConvertGetV2ConvertConvertRecord::Function = privateConvertGetV2ConvertConvertRecord
    privateConvertGetV2ConvertBgbConvertCoinList::Function = privateConvertGetV2ConvertBgbConvertCoinList
    privateConvertGetV2ConvertBgbConvertRecords::Function = privateConvertGetV2ConvertBgbConvertRecords
    privateConvertPostV2ConvertTrade::Function = privateConvertPostV2ConvertTrade
    privateConvertPostV2ConvertBgbConvert::Function = privateConvertPostV2ConvertBgbConvert
    privateEarnGetV2EarnSavingsProduct::Function = privateEarnGetV2EarnSavingsProduct
    privateEarnGetV2EarnSavingsAccount::Function = privateEarnGetV2EarnSavingsAccount
    privateEarnGetV2EarnSavingsAssets::Function = privateEarnGetV2EarnSavingsAssets
    privateEarnGetV2EarnSavingsRecords::Function = privateEarnGetV2EarnSavingsRecords
    privateEarnGetV2EarnSavingsSubscribeInfo::Function = privateEarnGetV2EarnSavingsSubscribeInfo
    privateEarnGetV2EarnSavingsSubscribeResult::Function = privateEarnGetV2EarnSavingsSubscribeResult
    privateEarnGetV2EarnSavingsRedeemResult::Function = privateEarnGetV2EarnSavingsRedeemResult
    privateEarnGetV2EarnSharkfinProduct::Function = privateEarnGetV2EarnSharkfinProduct
    privateEarnGetV2EarnSharkfinAccount::Function = privateEarnGetV2EarnSharkfinAccount
    privateEarnGetV2EarnSharkfinAssets::Function = privateEarnGetV2EarnSharkfinAssets
    privateEarnGetV2EarnSharkfinRecords::Function = privateEarnGetV2EarnSharkfinRecords
    privateEarnGetV2EarnSharkfinSubscribeInfo::Function = privateEarnGetV2EarnSharkfinSubscribeInfo
    privateEarnGetV2EarnSharkfinSubscribeResult::Function = privateEarnGetV2EarnSharkfinSubscribeResult
    privateEarnGetV2EarnLoanOngoingOrders::Function = privateEarnGetV2EarnLoanOngoingOrders
    privateEarnGetV2EarnLoanRepayHistory::Function = privateEarnGetV2EarnLoanRepayHistory
    privateEarnGetV2EarnLoanReviseHistory::Function = privateEarnGetV2EarnLoanReviseHistory
    privateEarnGetV2EarnLoanBorrowHistory::Function = privateEarnGetV2EarnLoanBorrowHistory
    privateEarnGetV2EarnLoanDebts::Function = privateEarnGetV2EarnLoanDebts
    privateEarnGetV2EarnLoanReduces::Function = privateEarnGetV2EarnLoanReduces
    privateEarnGetV2EarnAccountAssets::Function = privateEarnGetV2EarnAccountAssets
    privateEarnPostV2EarnSavingsSubscribe::Function = privateEarnPostV2EarnSavingsSubscribe
    privateEarnPostV2EarnSavingsRedeem::Function = privateEarnPostV2EarnSavingsRedeem
    privateEarnPostV2EarnSharkfinSubscribe::Function = privateEarnPostV2EarnSharkfinSubscribe
    privateEarnPostV2EarnLoanBorrow::Function = privateEarnPostV2EarnLoanBorrow
    privateEarnPostV2EarnLoanRepay::Function = privateEarnPostV2EarnLoanRepay
    privateEarnPostV2EarnLoanRevisePledge::Function = privateEarnPostV2EarnLoanRevisePledge
    privateCommonGetV2CommonTradeRate::Function = privateCommonGetV2CommonTradeRate
    privateUtaGetV3AccountAssets::Function = privateUtaGetV3AccountAssets
    privateUtaGetV3AccountFundingAssets::Function = privateUtaGetV3AccountFundingAssets
    privateUtaGetV3AccountSettings::Function = privateUtaGetV3AccountSettings
    privateUtaGetV3AccountFinancialRecords::Function = privateUtaGetV3AccountFinancialRecords
    privateUtaGetV3AccountRepayableCoins::Function = privateUtaGetV3AccountRepayableCoins
    privateUtaGetV3AccountPaymentCoins::Function = privateUtaGetV3AccountPaymentCoins
    privateUtaGetV3AccountConvertRecords::Function = privateUtaGetV3AccountConvertRecords
    privateUtaGetV3AccountDeductInfo::Function = privateUtaGetV3AccountDeductInfo
    privateUtaGetV3AccountFeeRate::Function = privateUtaGetV3AccountFeeRate
    privateUtaGetV3AccountSwitchStatus::Function = privateUtaGetV3AccountSwitchStatus
    privateUtaGetV3AccountMaxTransferable::Function = privateUtaGetV3AccountMaxTransferable
    privateUtaGetV3AccountOpenInterestLimit::Function = privateUtaGetV3AccountOpenInterestLimit
    privateUtaGetV3AccountSubUnifiedAssets::Function = privateUtaGetV3AccountSubUnifiedAssets
    privateUtaGetV3AccountTransferableCoins::Function = privateUtaGetV3AccountTransferableCoins
    privateUtaGetV3AccountSubTransferRecord::Function = privateUtaGetV3AccountSubTransferRecord
    privateUtaGetV3AccountDepositAddress::Function = privateUtaGetV3AccountDepositAddress
    privateUtaGetV3AccountSubDepositAddress::Function = privateUtaGetV3AccountSubDepositAddress
    privateUtaGetV3AccountDepositRecords::Function = privateUtaGetV3AccountDepositRecords
    privateUtaGetV3AccountSubDepositRecords::Function = privateUtaGetV3AccountSubDepositRecords
    privateUtaGetV3AccountWithdrawalRecords::Function = privateUtaGetV3AccountWithdrawalRecords
    privateUtaGetV3BrokerSubList::Function = privateUtaGetV3BrokerSubList
    privateUtaGetV3BrokerAllSubDepositWithdrawal::Function = privateUtaGetV3BrokerAllSubDepositWithdrawal
    privateUtaGetV3BrokerCommission::Function = privateUtaGetV3BrokerCommission
    privateUtaGetV3BrokerQuerySubApikey::Function = privateUtaGetV3BrokerQuerySubApikey
    privateUtaGetV3InsLoanTransfered::Function = privateUtaGetV3InsLoanTransfered
    privateUtaGetV3InsLoanSymbols::Function = privateUtaGetV3InsLoanSymbols
    privateUtaGetV3InsLoanRiskUnit::Function = privateUtaGetV3InsLoanRiskUnit
    privateUtaGetV3InsLoanRepaidHistory::Function = privateUtaGetV3InsLoanRepaidHistory
    privateUtaGetV3InsLoanProductInfos::Function = privateUtaGetV3InsLoanProductInfos
    privateUtaGetV3InsLoanLoanOrder::Function = privateUtaGetV3InsLoanLoanOrder
    privateUtaGetV3InsLoanLtvConvert::Function = privateUtaGetV3InsLoanLtvConvert
    privateUtaGetV3InsLoanEnsureCoinsConvert::Function = privateUtaGetV3InsLoanEnsureCoinsConvert
    privateUtaGetV3LoanCoins::Function = privateUtaGetV3LoanCoins
    privateUtaGetV3LoanInterest::Function = privateUtaGetV3LoanInterest
    privateUtaGetV3LoanBorrowOngoing::Function = privateUtaGetV3LoanBorrowOngoing
    privateUtaGetV3LoanBorrowHistory::Function = privateUtaGetV3LoanBorrowHistory
    privateUtaGetV3LoanRepayHistory::Function = privateUtaGetV3LoanRepayHistory
    privateUtaGetV3LoanPledgeRateHistory::Function = privateUtaGetV3LoanPledgeRateHistory
    privateUtaGetV3LoanDebts::Function = privateUtaGetV3LoanDebts
    privateUtaGetV3LoanReduces::Function = privateUtaGetV3LoanReduces
    privateUtaGetV3PositionCurrentPosition::Function = privateUtaGetV3PositionCurrentPosition
    privateUtaGetV3PositionHistoryPosition::Function = privateUtaGetV3PositionHistoryPosition
    privateUtaGetV3PositionAdlRank::Function = privateUtaGetV3PositionAdlRank
    privateUtaGetV3TaxRecords::Function = privateUtaGetV3TaxRecords
    privateUtaGetV3TradeOrderInfo::Function = privateUtaGetV3TradeOrderInfo
    privateUtaGetV3TradeUnfilledOrders::Function = privateUtaGetV3TradeUnfilledOrders
    privateUtaGetV3TradeUnfilledStrategyOrders::Function = privateUtaGetV3TradeUnfilledStrategyOrders
    privateUtaGetV3TradeHistoryOrders::Function = privateUtaGetV3TradeHistoryOrders
    privateUtaGetV3TradeHistoryStrategyOrders::Function = privateUtaGetV3TradeHistoryStrategyOrders
    privateUtaGetV3TradeFills::Function = privateUtaGetV3TradeFills
    privateUtaGetV3UserSubList::Function = privateUtaGetV3UserSubList
    privateUtaGetV3UserSubApiList::Function = privateUtaGetV3UserSubApiList
    privateUtaPostV3AccountSetLeverage::Function = privateUtaPostV3AccountSetLeverage
    privateUtaPostV3AccountSetHoldMode::Function = privateUtaPostV3AccountSetHoldMode
    privateUtaPostV3AccountRepay::Function = privateUtaPostV3AccountRepay
    privateUtaPostV3AccountSwitchDeduct::Function = privateUtaPostV3AccountSwitchDeduct
    privateUtaPostV3AccountDepositAccount::Function = privateUtaPostV3AccountDepositAccount
    privateUtaPostV3AccountSwitch::Function = privateUtaPostV3AccountSwitch
    privateUtaPostV3AccountAdjustAccountMode::Function = privateUtaPostV3AccountAdjustAccountMode
    privateUtaPostV3AccountTransfer::Function = privateUtaPostV3AccountTransfer
    privateUtaPostV3AccountSubTransfer::Function = privateUtaPostV3AccountSubTransfer
    privateUtaPostV3AccountSubMasterTransfer::Function = privateUtaPostV3AccountSubMasterTransfer
    privateUtaPostV3AccountMaxOpenAvailable::Function = privateUtaPostV3AccountMaxOpenAvailable
    privateUtaPostV3AccountWithdrawal::Function = privateUtaPostV3AccountWithdrawal
    privateUtaPostV3BrokerCreateSub::Function = privateUtaPostV3BrokerCreateSub
    privateUtaPostV3BrokerModifySub::Function = privateUtaPostV3BrokerModifySub
    privateUtaPostV3BrokerSubWithdrawal::Function = privateUtaPostV3BrokerSubWithdrawal
    privateUtaPostV3BrokerSubDepositAddress::Function = privateUtaPostV3BrokerSubDepositAddress
    privateUtaPostV3BrokerCreateSubApikey::Function = privateUtaPostV3BrokerCreateSubApikey
    privateUtaPostV3BrokerModifySubApikey::Function = privateUtaPostV3BrokerModifySubApikey
    privateUtaPostV3BrokerDeleteSubApikey::Function = privateUtaPostV3BrokerDeleteSubApikey
    privateUtaPostV3InsLoanBindUid::Function = privateUtaPostV3InsLoanBindUid
    privateUtaPostV3LoanBorrow::Function = privateUtaPostV3LoanBorrow
    privateUtaPostV3LoanRepay::Function = privateUtaPostV3LoanRepay
    privateUtaPostV3LoanRevisePledge::Function = privateUtaPostV3LoanRevisePledge
    privateUtaPostV3TradePlaceOrder::Function = privateUtaPostV3TradePlaceOrder
    privateUtaPostV3TradePlaceStrategyOrder::Function = privateUtaPostV3TradePlaceStrategyOrder
    privateUtaPostV3TradeModifyOrder::Function = privateUtaPostV3TradeModifyOrder
    privateUtaPostV3TradeModifyStrategyOrder::Function = privateUtaPostV3TradeModifyStrategyOrder
    privateUtaPostV3TradeCancelOrder::Function = privateUtaPostV3TradeCancelOrder
    privateUtaPostV3TradeCancelStrategyOrder::Function = privateUtaPostV3TradeCancelStrategyOrder
    privateUtaPostV3TradePlaceBatch::Function = privateUtaPostV3TradePlaceBatch
    privateUtaPostV3TradeBatchModifyOrder::Function = privateUtaPostV3TradeBatchModifyOrder
    privateUtaPostV3TradeCancelBatch::Function = privateUtaPostV3TradeCancelBatch
    privateUtaPostV3TradeCancelSymbolOrder::Function = privateUtaPostV3TradeCancelSymbolOrder
    privateUtaPostV3TradeClosePositions::Function = privateUtaPostV3TradeClosePositions
    privateUtaPostV3TradeCountdownCancelAll::Function = privateUtaPostV3TradeCountdownCancelAll
    privateUtaPostV3UserCreateSub::Function = privateUtaPostV3UserCreateSub
    privateUtaPostV3UserFreezeSub::Function = privateUtaPostV3UserFreezeSub
    privateUtaPostV3UserCreateSubApi::Function = privateUtaPostV3UserCreateSubApi
    privateUtaPostV3UserUpdateSubApi::Function = privateUtaPostV3UserUpdateSubApi
    privateUtaPostV3UserDeleteSubApi::Function = privateUtaPostV3UserDeleteSubApi

end
function describe(self::Bitget, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bitget",
    Symbol("name") => "Bitget",
    Symbol("countries") => ["SG"],
    Symbol("version") => "v2",
    Symbol("rateLimit") => 50,
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => true,
        Symbol("borrowIsolatedMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => true,
        Symbol("closePosition") => true,
        Symbol("createConvertTrade") => true,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertCurrencies") => true,
        Symbol("fetchConvertQuote") => true,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => true,
        Symbol("fetchCrossBorrowRate") => true,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingInterval") => true,
        Symbol("fetchFundingIntervals") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => true,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => true,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => true,
        Symbol("fetchMarketLeverageTiers") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMarkPrice") => true,
        Symbol("fetchMyLiquidations") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => "emulated",
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawAddresses") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => true,
        Symbol("repayIsolatedMargin") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("signIn") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
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
        Symbol("1M") => "1m"
    ),
    Symbol("hostname") => "bitget.com",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/b54bb4c2-416d-4231-8968-85a77748ba45",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("spot") => "https://api.{hostname}",
            Symbol("mix") => "https://api.{hostname}",
            Symbol("user") => "https://api.{hostname}",
            Symbol("p2p") => "https://api.{hostname}",
            Symbol("broker") => "https://api.{hostname}",
            Symbol("margin") => "https://api.{hostname}",
            Symbol("common") => "https://api.{hostname}",
            Symbol("tax") => "https://api.{hostname}",
            Symbol("convert") => "https://api.{hostname}",
            Symbol("copy") => "https://api.{hostname}",
            Symbol("earn") => "https://api.{hostname}",
            Symbol("uta") => "https://api.{hostname}"
        ),
        Symbol("www") => "https://www.bitget.com",
        Symbol("doc") => ["https://www.bitget.com/api-doc/common/intro", "https://www.bitget.com/api-doc/spot/intro", "https://www.bitget.com/api-doc/contract/intro", "https://www.bitget.com/api-doc/broker/intro", "https://www.bitget.com/api-doc/margin/intro", "https://www.bitget.com/api-doc/copytrading/intro", "https://www.bitget.com/api-doc/earn/intro", "https://bitgetlimited.github.io/apidoc/en/mix", "https://bitgetlimited.github.io/apidoc/en/spot", "https://bitgetlimited.github.io/apidoc/en/broker", "https://bitgetlimited.github.io/apidoc/en/margin"],
        Symbol("fees") => "https://www.bitget.cc/zh-CN/rate?tab=1",
        Symbol("referral") => "https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("common") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v2/public/annoucements") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/public/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("spot/v1/notice/queryAllNotices") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/public/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/public/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("spot/v1/public/products") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/public/product") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/market/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/market/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/market/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/market/fills-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/market/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/market/spot-vip-level") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/market/merge-depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/market/history-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/public/loan/coinInfos") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/public/loan/hour-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/public/coins") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v2/spot/public/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/market/vip-fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/market/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/market/merge-depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/market/orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/market/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/market/history-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/market/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/market/fills-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("mix") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("mix/v1/market/contracts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/contract-vip-level") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/market/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/fills-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/market/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/index") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/funding-time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/history-fundRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/current-fundRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/open-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/mark-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/symbol-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/queryPositionLever") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/open-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/history-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/history-index-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/history-mark-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/market/merge-depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/vip-fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/market/union-interest-rate-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/market/exchange-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/market/discount-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/market/merge-depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/fills-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/market/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/history-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/history-index-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/history-mark-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/open-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/funding-time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/symbol-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/history-fund-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/current-fund-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/oi-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/market/contracts") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/market/query-position-lever") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/market/account-long-short") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
                )
            ),
            Symbol("margin") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("margin/v1/cross/public/interestRateAndLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/public/interestRateAndLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/public/tierData") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/public/tierData") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/public/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/margin/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/market/long-short-ratio") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
                )
            ),
            Symbol("earn") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v2/earn/loan/public/coinInfos") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/loan/public/hour-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("uta") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v3/market/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/proof-of-reserves") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/open-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/history-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/current-fund-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/history-fund-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/risk-reserve") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/discount-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/margin-loans") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/position-tier") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/market/oi-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/market/index-components") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("spot/v1/wallet/deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/wallet/withdrawal-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/wallet/deposit-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/account/getInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("spot/v1/account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/account/assets-lite") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/account/transferRecords") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/convert/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/convert/convert-record") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/loan/ongoing-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/loan/repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/loan/revise-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/loan/borrow-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/loan/debts") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/trade/orderInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/trade/unfilled-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/trade/history-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/trade/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/trade/current-plan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/trade/history-plan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/spot/account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/account/subaccount-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/account/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/account/transferRecords") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/account/funding-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/account/bot-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/account/all-account-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/spot/wallet/deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/wallet/deposit-records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/wallet/withdrawal-records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/account/upgrade-status") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("spot/v1/wallet/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/wallet/transfer-v2") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/wallet/subTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("spot/v1/wallet/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/wallet/withdrawal-v2") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/wallet/withdrawal-inner") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/wallet/withdrawal-inner-v2") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/account/sub-account-spot-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 200
),
                    Symbol("spot/v1/account/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trade/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trade/batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/trade/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trade/cancel-order-v2") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trade/cancel-symbol-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trade/cancel-batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/trade/cancel-batch-orders-v2") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/trade/orderInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/trade/open-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/trade/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/trade/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/plan/placePlan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/plan/modifyPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/plan/cancelPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/plan/currentPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/plan/historyPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("spot/v1/plan/batchCancelPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/convert/quoted-price") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/convert/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("spot/v1/loan/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/loan/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/loan/revise-pledge") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/order/orderCurrentList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/order/orderHistoryList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/order/closeTrackingOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/order/updateTpsl") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/order/followerEndOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/order/spotInfoList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/config/getTraderSettings") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/config/getFollowerSettings") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/user/myTraders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/config/setFollowerConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/user/myFollowers") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/config/setProductCode") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/user/removeTrader") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/getRemovableFollower") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/user/removeFollower") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/profit/totalProfitInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/profit/totalProfitList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/profit/profitHisList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/profit/profitHisDetailList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/profit/waitProfitDetailList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("spot/v1/trace/user/getTraderInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/trade/place-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/trade/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/trade/batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/spot/trade/batch-cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/trade/cancel-symbol-order") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/spot/trade/place-plan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/trade/modify-plan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/trade/cancel-plan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/spot/trade/cancel-replace-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/trade/batch-cancel-plan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/wallet/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/wallet/subaccount-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/wallet/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/wallet/cancel-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/wallet/modify-deposit-account") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/spot/account/upgrade") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
                )
            ),
            Symbol("mix") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("mix/v1/account/account") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/account/accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/position/singlePosition") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/position/singlePosition-v2") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/position/allPosition") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("mix/v1/position/allPosition-v2") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("mix/v1/position/history-position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/account/accountBill") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/account/accountBusinessBill") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("mix/v1/order/current") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/order/marginCoinCurrent") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/order/historyProductType") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("mix/v1/order/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/order/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/order/allFills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/plan/currentPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/plan/historyPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/currentTrack") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/followerOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/followerHistoryOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/historyTrack") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/trace/profitSettleTokenIdGroup") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/trace/profitDateGroupList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/trade/profitDateList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/waitProfitDateList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/trace/traderSymbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/trace/traderList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/traderDetail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/queryTraceConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/account/account") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/account/accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/account/sub-account-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 200
),
                    Symbol("v2/mix/account/interest-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/account/max-open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/account/liq-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/account/open-count") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/account/bill") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/account/transfer-limits") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/mix/account/union-config") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/mix/account/switch-union-usdt") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/mix/account/isolated-symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/market/query-position-lever") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/position/single-position") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/position/all-position") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/position/adlRank") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/position/history-position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/mix/order/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/fill-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/orders-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/orders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/plan-sub-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/orders-plan-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/orders-plan-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/market/position-long-short") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("mix/v1/account/sub-account-contract-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 200
),
                    Symbol("mix/v1/account/open-count") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("mix/v1/account/setLeverage") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("mix/v1/account/setMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("mix/v1/account/setMarginMode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("mix/v1/account/setPositionMode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("mix/v1/order/placeOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/order/batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/order/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/order/cancel-batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/order/modifyOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/order/cancel-symbol-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/order/cancel-all-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/order/close-all-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("mix/v1/plan/placePlan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/plan/modifyPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/plan/modifyPlanPreset") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/plan/placeTPSL") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/plan/placeTrailStop") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/plan/placePositionsTPSL") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/plan/modifyTPSLPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/plan/cancelPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/plan/cancelSymbolPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/plan/cancelAllPlan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/closeTrackOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/modifyTPSL") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/closeTrackOrderBySymbol") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/setUpCopySymbols") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/followerSetBatchTraceConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/followerCloseByTrackingNo") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/followerCloseByAll") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/followerSetTpsl") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/cancelCopyTrader") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("mix/v1/trace/traderUpdateConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/myTraderList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/myFollowerList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/removeFollower") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/public/getFollowerConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/report/order/historyList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/report/order/currentList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/queryTraderTpslRatioConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("mix/v1/trace/traderUpdateTpslRatioConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/account/set-auto-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/account/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/account/set-all-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/account/set-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/account/set-asset-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("v2/mix/account/set-margin-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/account/union-convert") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/mix/account/set-position-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/mix/order/place-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/click-backhand") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/mix/order/batch-place-order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/mix/order/modify-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/batch-cancel-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/close-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/mix/order/cancel-all-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/mix/order/place-tpsl-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/place-pos-tpsl") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/place-plan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/modify-tpsl-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/modify-plan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/mix/order/cancel-plan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("user") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("user/v1/fee/query") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("user/v1/sub/virtual-list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("user/v1/sub/virtual-api-list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("user/v1/tax/spot-record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/v1/tax/future-record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/v1/tax/margin-record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/v1/tax/p2p-record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/user/virtual-subaccount-list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/user/virtual-subaccount-apikey-list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("user/v1/sub/virtual-create") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("user/v1/sub/virtual-modify") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("user/v1/sub/virtual-api-batch-create") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("user/v1/sub/virtual-api-create") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("user/v1/sub/virtual-api-modify") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/user/create-virtual-subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/user/modify-virtual-subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/user/batch-create-subaccount-and-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/user/create-virtual-subaccount-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/user/modify-virtual-subaccount-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 4
)
                )
            ),
            Symbol("p2p") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("p2p/v1/merchant/merchantList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("p2p/v1/merchant/merchantInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("p2p/v1/merchant/advList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("p2p/v1/merchant/orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/p2p/merchantList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/p2p/merchantInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/p2p/orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/p2p/advList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("broker") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("broker/v1/account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("broker/v1/account/sub-list") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("broker/v1/account/sub-email") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("broker/v1/account/sub-spot-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("broker/v1/account/sub-future-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("broker/v1/account/subaccount-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("broker/v1/account/subaccount-deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("broker/v1/account/subaccount-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("broker/v1/account/sub-api-list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/account/subaccount-list") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/broker/account/subaccount-email") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/account/subaccount-spot-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/account/subaccount-future-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/manage/subaccount-apikey-list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("broker/v1/account/sub-create") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("broker/v1/account/sub-modify") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("broker/v1/account/sub-modify-email") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("broker/v1/account/sub-address") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("broker/v1/account/sub-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("broker/v1/account/sub-auto-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("broker/v1/account/sub-api-create") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("broker/v1/account/sub-api-modify") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/account/modify-subaccount-email") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/account/create-subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/broker/account/modify-subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/broker/account/subaccount-address") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/account/subaccount-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/account/set-subaccount-autotransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/manage/create-subaccount-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/broker/manage/modify-subaccount-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("margin") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("margin/v1/cross/account/riskRate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/account/maxTransferOutAmount") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/account/maxTransferOutAmount") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/order/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/order/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/loan/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/repay/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/interest/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/liquidation/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/fin/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/order/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/order/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/loan/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/repay/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/interest/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/liquidation/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/fin/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/borrow-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/interest-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/liquidation-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/financial-records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/account/risk-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/account/max-borrowable-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/account/max-transfer-out-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/interest-rate-and-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/tier-data") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/open-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/history-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/borrow-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/interest-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/liquidation-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/financial-records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/account/risk-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/account/max-borrowable-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/account/max-transfer-out-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/interest-rate-and-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/tier-data") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/open-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/history-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("margin/v1/cross/account/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/account/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/account/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/account/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/account/riskRate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/account/maxBorrowableAmount") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/account/maxBorrowableAmount") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/account/flashRepay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/account/queryFlashRepayStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/account/flashRepay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/account/queryFlashRepayStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/order/placeOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("margin/v1/isolated/order/batchPlaceOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("margin/v1/isolated/order/cancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/isolated/order/batchCancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/order/placeOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/order/batchPlaceOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/order/cancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("margin/v1/cross/order/batchCancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/account/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/account/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/account/flash-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/account/query-flash-repay-status") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/place-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/batch-place-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/crossed/batch-cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/account/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/account/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/account/flash-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/account/query-flash-repay-status") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/place-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/batch-place-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/margin/isolated/batch-cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("copy") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v2/copy/mix-trader/order-current-track") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-trader/order-history-track") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-trader/order-total-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-trader/profit-history-summarys") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/copy/mix-trader/profit-history-details") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/copy/mix-trader/profit-details") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/copy/mix-trader/profits-group-coin-date") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/copy/mix-trader/config-query-symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/copy/mix-trader/config-query-followers") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-follower/query-current-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-follower/query-history-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/copy/mix-follower/query-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-follower/query-traders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-follower/query-quantity-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-broker/query-traders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-broker/query-history-traces") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-broker/query-current-traces") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/profit-summarys") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/profit-history-details") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/profit-details") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/order-total-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/order-history-track") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/order-current-track") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/config-query-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/config-query-followers") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-follower/query-traders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-follower/query-trader-symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-follower/query-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-follower/query-history-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-follower/query-current-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("v2/copy/mix-trader/order-modify-tpsl") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-trader/order-close-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-trader/config-setting-symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-trader/config-setting-base") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-trader/config-remove-follower") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-follower/setting-tpsl") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v2/copy/mix-follower/settings") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-follower/close-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/mix-follower/cancel-trader") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/copy/spot-trader/order-modify-tpsl") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/order-close-tracking") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/config-setting-symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-trader/config-remove-follower") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-follower/stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-follower/settings") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-follower/setting-tpsl") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-follower/order-close-tracking") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/copy/spot-follower/cancel-trader") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("tax") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v2/tax/spot-record") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/tax/future-record") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/tax/margin-record") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v2/tax/p2p-record") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
                )
            ),
            Symbol("convert") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v2/convert/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/convert/quoted-price") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/convert/convert-record") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/convert/bgb-convert-coin-list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/convert/bgb-convert-records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("v2/convert/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/convert/bgb-convert") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("earn") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v2/earn/savings/product") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/savings/account") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/savings/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/savings/records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/savings/subscribe-info") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/savings/subscribe-result") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/savings/redeem-result") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/sharkfin/product") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/sharkfin/account") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/sharkfin/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/sharkfin/records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/sharkfin/subscribe-info") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/sharkfin/subscribe-result") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v2/earn/loan/ongoing-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/loan/repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/loan/revise-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/loan/borrow-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/loan/debts") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/loan/reduces") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("v2/earn/savings/subscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/savings/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/sharkfin/subscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/loan/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/loan/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v2/earn/loan/revise-pledge") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("common") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v2/common/trade-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            ),
            Symbol("uta") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v3/account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/account/funding-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/account/settings") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/account/financial-records") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/account/repayable-coins") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/account/payment-coins") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/account/convert-records") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/account/deduct-info") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v3/account/fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/account/switch-status") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/account/max-transferable") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/account/open-interest-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/account/sub-unified-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v3/account/transferable-coins") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/account/sub-transfer-record") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/account/deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/account/sub-deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/account/deposit-records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/account/sub-deposit-records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/account/withdrawal-records") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/broker/sub-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/broker/all-sub-deposit-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/broker/commission") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/broker/query-sub-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/ins-loan/transfered") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/ins-loan/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/ins-loan/risk-unit") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/ins-loan/repaid-history") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/ins-loan/product-infos") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/ins-loan/loan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/ins-loan/ltv-convert") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/ins-loan/ensure-coins-convert") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/loan/coins") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/loan/interest") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/loan/borrow-ongoing") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/loan/borrow-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/loan/repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/loan/pledge-rate-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/loan/debts") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/loan/reduces") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/position/current-position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/position/history-position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/position/adlRank") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v3/tax/records") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v3/trade/order-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/trade/unfilled-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/trade/unfilled-strategy-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/trade/history-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/trade/history-strategy-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/trade/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/user/sub-list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/user/sub-api-list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("v3/account/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/account/set-hold-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/account/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/account/switch-deduct") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v3/account/deposit-account") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v3/account/switch") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v3/account/adjust-account-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v3/account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/account/sub-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/account/sub-master-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/account/max-open-available") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/account/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v3/broker/create-sub") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/broker/modify-sub") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/broker/sub-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/broker/sub-deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/broker/create-sub-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/broker/modify-sub-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/broker/delete-sub-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("v3/ins-loan/bind-uid") => Dict{Symbol, Any}(
    Symbol("cost") => 6.6667
),
                    Symbol("v3/loan/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/loan/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/loan/revise-pledge") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/trade/place-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/trade/place-strategy-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/trade/modify-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/trade/modify-strategy-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/trade/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/trade/cancel-strategy-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/trade/place-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/trade/batch-modify-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/trade/cancel-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/trade/cancel-symbol-order") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/trade/close-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                    Symbol("v3/trade/countdown-cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                    Symbol("v3/user/create-sub") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/user/freeze-sub") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/user/create-sub-api") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/user/update-sub-api") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                    Symbol("v3/user/delete-sub-api") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.002"),
            Symbol("maker") => self.parseNumber("0.002")
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0006"),
            Symbol("maker") => self.parseNumber("0.0004")
        )
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("password") => true
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("1") => ExchangeError,
            Symbol("failure to get a peer from the ring-balancer") => ExchangeNotAvailable,
            Symbol("4010") => PermissionDenied,
            Symbol("4001") => ExchangeError,
            Symbol("4002") => ExchangeError,
            Symbol("40020") => BadRequest,
            Symbol("30001") => AuthenticationError,
            Symbol("30002") => AuthenticationError,
            Symbol("30003") => AuthenticationError,
            Symbol("30004") => AuthenticationError,
            Symbol("30005") => InvalidNonce,
            Symbol("30006") => AuthenticationError,
            Symbol("30007") => BadRequest,
            Symbol("30008") => RequestTimeout,
            Symbol("30009") => ExchangeError,
            Symbol("30010") => AuthenticationError,
            Symbol("30011") => PermissionDenied,
            Symbol("30012") => AuthenticationError,
            Symbol("30013") => AuthenticationError,
            Symbol("30014") => DDoSProtection,
            Symbol("30015") => AuthenticationError,
            Symbol("30016") => ExchangeError,
            Symbol("30017") => ExchangeError,
            Symbol("30018") => ExchangeError,
            Symbol("30019") => ExchangeNotAvailable,
            Symbol("30020") => BadRequest,
            Symbol("30021") => BadRequest,
            Symbol("30022") => PermissionDenied,
            Symbol("30023") => BadRequest,
            Symbol("30024") => BadSymbol,
            Symbol("30025") => BadRequest,
            Symbol("30026") => DDoSProtection,
            Symbol("30027") => AuthenticationError,
            Symbol("30028") => PermissionDenied,
            Symbol("30029") => AccountSuspended,
            Symbol("30030") => ExchangeError,
            Symbol("30031") => BadRequest,
            Symbol("30032") => BadSymbol,
            Symbol("30033") => BadRequest,
            Symbol("30034") => ExchangeError,
            Symbol("30035") => ExchangeError,
            Symbol("30036") => ExchangeError,
            Symbol("30037") => ExchangeNotAvailable,
            Symbol("30038") => OnMaintenance,
            Symbol("32001") => AccountSuspended,
            Symbol("32002") => PermissionDenied,
            Symbol("32003") => CancelPending,
            Symbol("32004") => ExchangeError,
            Symbol("32005") => InvalidOrder,
            Symbol("32006") => InvalidOrder,
            Symbol("32007") => InvalidOrder,
            Symbol("32008") => InvalidOrder,
            Symbol("32009") => InvalidOrder,
            Symbol("32010") => ExchangeError,
            Symbol("32011") => ExchangeError,
            Symbol("32012") => ExchangeError,
            Symbol("32013") => ExchangeError,
            Symbol("32014") => ExchangeError,
            Symbol("32015") => ExchangeError,
            Symbol("32016") => ExchangeError,
            Symbol("32017") => ExchangeError,
            Symbol("32018") => ExchangeError,
            Symbol("32019") => ExchangeError,
            Symbol("32020") => ExchangeError,
            Symbol("32021") => ExchangeError,
            Symbol("32022") => ExchangeError,
            Symbol("32023") => ExchangeError,
            Symbol("32024") => ExchangeError,
            Symbol("32025") => ExchangeError,
            Symbol("32026") => ExchangeError,
            Symbol("32027") => ExchangeError,
            Symbol("32028") => AccountSuspended,
            Symbol("32029") => ExchangeError,
            Symbol("32030") => InvalidOrder,
            Symbol("32031") => ArgumentsRequired,
            Symbol("32038") => AuthenticationError,
            Symbol("32040") => ExchangeError,
            Symbol("32044") => ExchangeError,
            Symbol("32045") => ExchangeError,
            Symbol("32046") => ExchangeError,
            Symbol("32047") => ExchangeError,
            Symbol("32048") => InvalidOrder,
            Symbol("32049") => ExchangeError,
            Symbol("32050") => InvalidOrder,
            Symbol("32051") => InvalidOrder,
            Symbol("32052") => ExchangeError,
            Symbol("32053") => ExchangeError,
            Symbol("32057") => ExchangeError,
            Symbol("32054") => ExchangeError,
            Symbol("32055") => InvalidOrder,
            Symbol("32056") => ExchangeError,
            Symbol("32058") => ExchangeError,
            Symbol("32059") => InvalidOrder,
            Symbol("32060") => InvalidOrder,
            Symbol("32061") => InvalidOrder,
            Symbol("32062") => InvalidOrder,
            Symbol("32063") => InvalidOrder,
            Symbol("32064") => ExchangeError,
            Symbol("32065") => ExchangeError,
            Symbol("32066") => ExchangeError,
            Symbol("32067") => ExchangeError,
            Symbol("32068") => ExchangeError,
            Symbol("32069") => ExchangeError,
            Symbol("32070") => ExchangeError,
            Symbol("32071") => ExchangeError,
            Symbol("32072") => ExchangeError,
            Symbol("32073") => ExchangeError,
            Symbol("32074") => ExchangeError,
            Symbol("32075") => ExchangeError,
            Symbol("32076") => ExchangeError,
            Symbol("32077") => ExchangeError,
            Symbol("32078") => ExchangeError,
            Symbol("32079") => ExchangeError,
            Symbol("32080") => ExchangeError,
            Symbol("32083") => ExchangeError,
            Symbol("33001") => PermissionDenied,
            Symbol("33002") => AccountSuspended,
            Symbol("33003") => InsufficientFunds,
            Symbol("33004") => ExchangeError,
            Symbol("33005") => ExchangeError,
            Symbol("33006") => ExchangeError,
            Symbol("33007") => ExchangeError,
            Symbol("33008") => InsufficientFunds,
            Symbol("33009") => ExchangeError,
            Symbol("33010") => ExchangeError,
            Symbol("33011") => ExchangeError,
            Symbol("33012") => ExchangeError,
            Symbol("33013") => InvalidOrder,
            Symbol("33014") => OrderNotFound,
            Symbol("33015") => InvalidOrder,
            Symbol("33016") => ExchangeError,
            Symbol("33017") => InsufficientFunds,
            Symbol("33018") => ExchangeError,
            Symbol("33020") => ExchangeError,
            Symbol("33021") => BadRequest,
            Symbol("33022") => InvalidOrder,
            Symbol("33023") => ExchangeError,
            Symbol("33024") => InvalidOrder,
            Symbol("33025") => InvalidOrder,
            Symbol("33026") => ExchangeError,
            Symbol("33027") => InvalidOrder,
            Symbol("33028") => InvalidOrder,
            Symbol("33029") => InvalidOrder,
            Symbol("33034") => ExchangeError,
            Symbol("33035") => ExchangeError,
            Symbol("33036") => ExchangeError,
            Symbol("33037") => ExchangeError,
            Symbol("33038") => ExchangeError,
            Symbol("33039") => ExchangeError,
            Symbol("33040") => ExchangeError,
            Symbol("33041") => ExchangeError,
            Symbol("33042") => ExchangeError,
            Symbol("33043") => ExchangeError,
            Symbol("33044") => ExchangeError,
            Symbol("33045") => ExchangeError,
            Symbol("33046") => ExchangeError,
            Symbol("33047") => ExchangeError,
            Symbol("33048") => ExchangeError,
            Symbol("33049") => ExchangeError,
            Symbol("33050") => ExchangeError,
            Symbol("33051") => ExchangeError,
            Symbol("33059") => BadRequest,
            Symbol("33060") => BadRequest,
            Symbol("33061") => ExchangeError,
            Symbol("33062") => ExchangeError,
            Symbol("33063") => ExchangeError,
            Symbol("33064") => ExchangeError,
            Symbol("33065") => ExchangeError,
            Symbol("21009") => ExchangeError,
            Symbol("34001") => PermissionDenied,
            Symbol("34002") => InvalidAddress,
            Symbol("34003") => ExchangeError,
            Symbol("34004") => ExchangeError,
            Symbol("34005") => ExchangeError,
            Symbol("34006") => ExchangeError,
            Symbol("34007") => ExchangeError,
            Symbol("34008") => InsufficientFunds,
            Symbol("34009") => ExchangeError,
            Symbol("34010") => ExchangeError,
            Symbol("34011") => ExchangeError,
            Symbol("34012") => ExchangeError,
            Symbol("34013") => ExchangeError,
            Symbol("34014") => ExchangeError,
            Symbol("34015") => ExchangeError,
            Symbol("34016") => PermissionDenied,
            Symbol("34017") => AccountSuspended,
            Symbol("34018") => AuthenticationError,
            Symbol("34019") => PermissionDenied,
            Symbol("34020") => PermissionDenied,
            Symbol("34021") => InvalidAddress,
            Symbol("34022") => ExchangeError,
            Symbol("34023") => PermissionDenied,
            Symbol("34026") => ExchangeError,
            Symbol("34036") => ExchangeError,
            Symbol("34037") => ExchangeError,
            Symbol("34038") => ExchangeError,
            Symbol("34039") => ExchangeError,
            Symbol("35001") => ExchangeError,
            Symbol("35002") => ExchangeError,
            Symbol("35003") => ExchangeError,
            Symbol("35004") => ExchangeError,
            Symbol("35005") => AuthenticationError,
            Symbol("35008") => InvalidOrder,
            Symbol("35010") => InvalidOrder,
            Symbol("35012") => InvalidOrder,
            Symbol("35014") => InvalidOrder,
            Symbol("35015") => InvalidOrder,
            Symbol("35017") => ExchangeError,
            Symbol("35019") => InvalidOrder,
            Symbol("35020") => InvalidOrder,
            Symbol("35021") => InvalidOrder,
            Symbol("35022") => ExchangeError,
            Symbol("35024") => ExchangeError,
            Symbol("35025") => InsufficientFunds,
            Symbol("35026") => ExchangeError,
            Symbol("35029") => OrderNotFound,
            Symbol("35030") => InvalidOrder,
            Symbol("35031") => InvalidOrder,
            Symbol("35032") => ExchangeError,
            Symbol("35037") => ExchangeError,
            Symbol("35039") => ExchangeError,
            Symbol("35040") => InvalidOrder,
            Symbol("35044") => ExchangeError,
            Symbol("35046") => InsufficientFunds,
            Symbol("35047") => InsufficientFunds,
            Symbol("35048") => ExchangeError,
            Symbol("35049") => InvalidOrder,
            Symbol("35050") => InvalidOrder,
            Symbol("35052") => InsufficientFunds,
            Symbol("35053") => ExchangeError,
            Symbol("35055") => InsufficientFunds,
            Symbol("35057") => ExchangeError,
            Symbol("35058") => ExchangeError,
            Symbol("35059") => BadRequest,
            Symbol("35060") => BadRequest,
            Symbol("35061") => BadRequest,
            Symbol("35062") => InvalidOrder,
            Symbol("35063") => InvalidOrder,
            Symbol("35064") => InvalidOrder,
            Symbol("35066") => InvalidOrder,
            Symbol("35067") => InvalidOrder,
            Symbol("35068") => InvalidOrder,
            Symbol("35069") => InvalidOrder,
            Symbol("35070") => InvalidOrder,
            Symbol("35071") => InvalidOrder,
            Symbol("35072") => InvalidOrder,
            Symbol("35073") => InvalidOrder,
            Symbol("35074") => InvalidOrder,
            Symbol("35075") => InvalidOrder,
            Symbol("35076") => InvalidOrder,
            Symbol("35077") => InvalidOrder,
            Symbol("35078") => InvalidOrder,
            Symbol("35079") => InvalidOrder,
            Symbol("35080") => InvalidOrder,
            Symbol("35081") => InvalidOrder,
            Symbol("35082") => InvalidOrder,
            Symbol("35083") => InvalidOrder,
            Symbol("35084") => InvalidOrder,
            Symbol("35085") => InvalidOrder,
            Symbol("35086") => InvalidOrder,
            Symbol("35087") => InvalidOrder,
            Symbol("35088") => InvalidOrder,
            Symbol("35089") => InvalidOrder,
            Symbol("35090") => ExchangeError,
            Symbol("35091") => ExchangeError,
            Symbol("35092") => ExchangeError,
            Symbol("35093") => ExchangeError,
            Symbol("35094") => ExchangeError,
            Symbol("35095") => BadRequest,
            Symbol("35096") => ExchangeError,
            Symbol("35097") => ExchangeError,
            Symbol("35098") => ExchangeError,
            Symbol("35099") => ExchangeError,
            Symbol("36001") => BadRequest,
            Symbol("36002") => BadRequest,
            Symbol("36005") => ExchangeError,
            Symbol("36101") => AuthenticationError,
            Symbol("36102") => PermissionDenied,
            Symbol("36103") => AccountSuspended,
            Symbol("36104") => PermissionDenied,
            Symbol("36105") => PermissionDenied,
            Symbol("36106") => AccountSuspended,
            Symbol("36107") => PermissionDenied,
            Symbol("36108") => InsufficientFunds,
            Symbol("36109") => PermissionDenied,
            Symbol("36201") => PermissionDenied,
            Symbol("36202") => PermissionDenied,
            Symbol("36203") => InvalidOrder,
            Symbol("36204") => ExchangeError,
            Symbol("36205") => BadRequest,
            Symbol("36206") => BadRequest,
            Symbol("36207") => InvalidOrder,
            Symbol("36208") => InvalidOrder,
            Symbol("36209") => InvalidOrder,
            Symbol("36210") => InvalidOrder,
            Symbol("36211") => InvalidOrder,
            Symbol("36212") => InvalidOrder,
            Symbol("36213") => InvalidOrder,
            Symbol("36214") => ExchangeError,
            Symbol("36216") => OrderNotFound,
            Symbol("36217") => InvalidOrder,
            Symbol("36218") => InvalidOrder,
            Symbol("36219") => InvalidOrder,
            Symbol("36220") => InvalidOrder,
            Symbol("36221") => InvalidOrder,
            Symbol("36222") => InvalidOrder,
            Symbol("36223") => InvalidOrder,
            Symbol("36224") => InvalidOrder,
            Symbol("36225") => InvalidOrder,
            Symbol("36226") => InvalidOrder,
            Symbol("36227") => InvalidOrder,
            Symbol("36228") => InvalidOrder,
            Symbol("36229") => InvalidOrder,
            Symbol("36230") => InvalidOrder,
            Symbol("400") => BadRequest,
            Symbol("401") => AuthenticationError,
            Symbol("403") => PermissionDenied,
            Symbol("404") => BadRequest,
            Symbol("405") => BadRequest,
            Symbol("415") => BadRequest,
            Symbol("429") => DDoSProtection,
            Symbol("500") => ExchangeNotAvailable,
            Symbol("1001") => RateLimitExceeded,
            Symbol("1002") => ExchangeError,
            Symbol("1003") => ExchangeError,
            Symbol("40001") => AuthenticationError,
            Symbol("40002") => AuthenticationError,
            Symbol("40003") => AuthenticationError,
            Symbol("40004") => InvalidNonce,
            Symbol("40005") => InvalidNonce,
            Symbol("40006") => AuthenticationError,
            Symbol("40007") => BadRequest,
            Symbol("40008") => InvalidNonce,
            Symbol("40009") => AuthenticationError,
            Symbol("40010") => AuthenticationError,
            Symbol("40011") => AuthenticationError,
            Symbol("40012") => AuthenticationError,
            Symbol("40013") => ExchangeError,
            Symbol("40014") => PermissionDenied,
            Symbol("40015") => ExchangeError,
            Symbol("40016") => PermissionDenied,
            Symbol("40017") => ExchangeError,
            Symbol("40018") => PermissionDenied,
            Symbol("40019") => BadRequest,
            Symbol("40031") => AccountSuspended,
            Symbol("40037") => AuthenticationError,
            Symbol("40102") => BadRequest,
            Symbol("40103") => BadRequest,
            Symbol("40104") => ExchangeError,
            Symbol("40105") => ExchangeError,
            Symbol("40106") => ExchangeError,
            Symbol("40107") => ExchangeError,
            Symbol("40108") => InvalidOrder,
            Symbol("40109") => OrderNotFound,
            Symbol("40200") => OnMaintenance,
            Symbol("40201") => InvalidOrder,
            Symbol("40202") => ExchangeError,
            Symbol("40203") => BadRequest,
            Symbol("40204") => BadRequest,
            Symbol("40205") => BadRequest,
            Symbol("40206") => BadRequest,
            Symbol("40207") => BadRequest,
            Symbol("40208") => BadRequest,
            Symbol("40209") => BadRequest,
            Symbol("40300") => ExchangeError,
            Symbol("40301") => PermissionDenied,
            Symbol("40302") => BadRequest,
            Symbol("40303") => BadRequest,
            Symbol("40304") => BadRequest,
            Symbol("40305") => BadRequest,
            Symbol("40306") => ExchangeError,
            Symbol("40308") => OnMaintenance,
            Symbol("40309") => BadSymbol,
            Symbol("40400") => ExchangeError,
            Symbol("40401") => ExchangeError,
            Symbol("40402") => BadRequest,
            Symbol("40403") => BadRequest,
            Symbol("40404") => BadRequest,
            Symbol("40405") => BadRequest,
            Symbol("40406") => BadRequest,
            Symbol("40407") => ExchangeError,
            Symbol("40408") => ExchangeError,
            Symbol("40409") => ExchangeError,
            Symbol("40500") => InvalidOrder,
            Symbol("40501") => ExchangeError,
            Symbol("40502") => ExchangeError,
            Symbol("40503") => ExchangeError,
            Symbol("40504") => ExchangeError,
            Symbol("40505") => ExchangeError,
            Symbol("40506") => AuthenticationError,
            Symbol("40507") => AuthenticationError,
            Symbol("40508") => ExchangeError,
            Symbol("40509") => ExchangeError,
            Symbol("40600") => ExchangeError,
            Symbol("40601") => ExchangeError,
            Symbol("40602") => ExchangeError,
            Symbol("40603") => ExchangeError,
            Symbol("40604") => ExchangeNotAvailable,
            Symbol("40605") => ExchangeError,
            Symbol("40606") => ExchangeError,
            Symbol("40607") => ExchangeError,
            Symbol("40608") => ExchangeError,
            Symbol("40609") => ExchangeError,
            Symbol("40700") => BadRequest,
            Symbol("40701") => ExchangeError,
            Symbol("40702") => ExchangeError,
            Symbol("40703") => ExchangeError,
            Symbol("40704") => ExchangeError,
            Symbol("40705") => BadRequest,
            Symbol("40706") => InvalidOrder,
            Symbol("40707") => BadRequest,
            Symbol("40708") => BadRequest,
            Symbol("40709") => ExchangeError,
            Symbol("40710") => ExchangeError,
            Symbol("40711") => InsufficientFunds,
            Symbol("40712") => InsufficientFunds,
            Symbol("40713") => ExchangeError,
            Symbol("40714") => ExchangeError,
            Symbol("40762") => InsufficientFunds,
            Symbol("40768") => OrderNotFound,
            Symbol("40808") => InvalidOrder,
            Symbol("41103") => InvalidOrder,
            Symbol("41114") => OnMaintenance,
            Symbol("43011") => InvalidOrder,
            Symbol("43001") => OrderNotFound,
            Symbol("43012") => InsufficientFunds,
            Symbol("43025") => InvalidOrder,
            Symbol("43115") => OnMaintenance,
            Symbol("45110") => InvalidOrder,
            Symbol("40774") => InvalidOrder,
            Symbol("40917") => InvalidOrder,
            Symbol("45122") => InvalidOrder,
            Symbol("invalid sign") => AuthenticationError,
            Symbol("invalid currency") => BadSymbol,
            Symbol("invalid symbol") => BadSymbol,
            Symbol("invalid period") => BadRequest,
            Symbol("invalid user") => ExchangeError,
            Symbol("invalid amount") => InvalidOrder,
            Symbol("invalid type") => InvalidOrder,
            Symbol("invalid orderId") => InvalidOrder,
            Symbol("invalid record") => ExchangeError,
            Symbol("invalid accountId") => BadRequest,
            Symbol("invalid address") => BadRequest,
            Symbol("accesskey not null") => AuthenticationError,
            Symbol("illegal accesskey") => AuthenticationError,
            Symbol("sign not null") => AuthenticationError,
            Symbol("req_time is too much difference from server time") => InvalidNonce,
            Symbol("permissions not right") => PermissionDenied,
            Symbol("illegal sign invalid") => AuthenticationError,
            Symbol("user locked") => AccountSuspended,
            Symbol("Request Frequency Is Too High") => RateLimitExceeded,
            Symbol("more than a daily rate of cash") => BadRequest,
            Symbol("more than the maximum daily withdrawal amount") => BadRequest,
            Symbol("need to bind email or mobile") => ExchangeError,
            Symbol("user forbid") => PermissionDenied,
            Symbol("User Prohibited Cash Withdrawal") => PermissionDenied,
            Symbol("Cash Withdrawal Is Less Than The Minimum Value") => BadRequest,
            Symbol("Cash Withdrawal Is More Than The Maximum Value") => BadRequest,
            Symbol("the account with in 24 hours ban coin") => PermissionDenied,
            Symbol("order cancel fail") => BadRequest,
            Symbol("base symbol error") => BadSymbol,
            Symbol("base date error") => ExchangeError,
            Symbol("api signature not valid") => AuthenticationError,
            Symbol("gateway internal error") => ExchangeError,
            Symbol("audit failed") => ExchangeError,
            Symbol("order queryorder invalid") => BadRequest,
            Symbol("market no need price") => InvalidOrder,
            Symbol("limit need price") => InvalidOrder,
            Symbol("userid not equal to account_id") => ExchangeError,
            Symbol("your balance is low") => InsufficientFunds,
            Symbol("address invalid cointype") => ExchangeError,
            Symbol("system exception") => ExchangeError,
            Symbol("50003") => ExchangeError,
            Symbol("50004") => BadSymbol,
            Symbol("50006") => PermissionDenied,
            Symbol("50007") => PermissionDenied,
            Symbol("50008") => RequestTimeout,
            Symbol("50009") => RateLimitExceeded,
            Symbol("50010") => ExchangeError,
            Symbol("50014") => InvalidOrder,
            Symbol("50015") => InvalidOrder,
            Symbol("50016") => InvalidOrder,
            Symbol("50017") => InvalidOrder,
            Symbol("50018") => InvalidOrder,
            Symbol("50019") => InvalidOrder,
            Symbol("50020") => InsufficientFunds,
            Symbol("50021") => InvalidOrder,
            Symbol("50026") => InvalidOrder,
            Symbol("invalid order query time") => ExchangeError,
            Symbol("invalid start time") => BadRequest,
            Symbol("invalid end time") => BadRequest,
            Symbol("20003") => ExchangeError,
            Symbol("01001") => ExchangeError,
            Symbol("40024") => RestrictedLocation,
            Symbol("41117") => InvalidOrder,
            Symbol("43111") => PermissionDenied,
            Symbol("45113") => InvalidOrder
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("invalid size, valid range") => ExchangeError
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("APX") => "AstroPepeX",
        Symbol("DEGEN") => "DegenReborn",
        Symbol("EVA") => "Evadore",
        Symbol("JADE") => "Jade Protocol",
        Symbol("OMNI") => "omni",
        Symbol("TONCOIN") => "TON"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("uta") => nothing,
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot", "swap"]
        ),
        Symbol("defaultType") => "spot",
        Symbol("defaultSubType") => "linear",
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("createMarketBuyOrderRequiresPrice") => true,
            Symbol("timeInForce") => "GTC"
        ),
        Symbol("broker") => "p4sve",
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("fillResponseFromRequest") => true
        ),
        Symbol("fetchOHLCV") => Dict{Symbol, Any}(
            Symbol("timeframes") => Dict{Symbol, Any}(
                Symbol("spot") => Dict{Symbol, Any}(
                    Symbol("1m") => "1min",
                    Symbol("5m") => "5min",
                    Symbol("3m") => "3min",
                    Symbol("15m") => "15min",
                    Symbol("30m") => "30min",
                    Symbol("1h") => "1h",
                    Symbol("4h") => "4h",
                    Symbol("6h") => "6Hutc",
                    Symbol("12h") => "12Hutc",
                    Symbol("1d") => "1Dutc",
                    Symbol("3d") => "3Dutc",
                    Symbol("1w") => "1Wutc",
                    Symbol("1M") => "1Mutc"
                ),
                Symbol("swap") => Dict{Symbol, Any}(
                    Symbol("1m") => "1m",
                    Symbol("3m") => "3m",
                    Symbol("5m") => "5m",
                    Symbol("15m") => "15m",
                    Symbol("30m") => "30m",
                    Symbol("1h") => "1H",
                    Symbol("2h") => "2H",
                    Symbol("4h") => "4H",
                    Symbol("6h") => "6Hutc",
                    Symbol("12h") => "12Hutc",
                    Symbol("1d") => "1Dutc",
                    Symbol("3d") => "3Dutc",
                    Symbol("1w") => "1Wutc",
                    Symbol("1M") => "1Mutc"
                ),
                Symbol("uta") => Dict{Symbol, Any}(
                    Symbol("1m") => "1m",
                    Symbol("3m") => "3m",
                    Symbol("5m") => "5m",
                    Symbol("15m") => "15m",
                    Symbol("30m") => "30m",
                    Symbol("1h") => "1H",
                    Symbol("2h") => "2H",
                    Symbol("4h") => "4H",
                    Symbol("6h") => "6H",
                    Symbol("12h") => "12H",
                    Symbol("1d") => "1D"
                )
            ),
            Symbol("maxRecentDaysPerTimeframe") => Dict{Symbol, Any}(
                Symbol("1m") => 30,
                Symbol("3m") => 30,
                Symbol("5m") => 30,
                Symbol("15m") => 30,
                Symbol("30m") => 30,
                Symbol("1h") => 60,
                Symbol("2h") => 120,
                Symbol("4h") => 240,
                Symbol("6h") => 360,
                Symbol("12h") => 720,
                Symbol("1d") => 1440,
                Symbol("3d") => 1440 * 3,
                Symbol("1w") => 1440 * 7,
                Symbol("1M") => 1440 * 30
            ),
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("maxLimitPerTimeframe") => Dict{Symbol, Any}(
                    Symbol("1d") => 300,
                    Symbol("3d") => 100,
                    Symbol("1w") => 100,
                    Symbol("1M") => 100
                ),
                Symbol("method") => "publicSpotGetV2SpotMarketCandles"
            ),
            Symbol("swap") => Dict{Symbol, Any}(
                Symbol("maxLimitPerTimeframe") => Dict{Symbol, Any}(
                    Symbol("4h") => 540,
                    Symbol("6h") => 360,
                    Symbol("12h") => 180,
                    Symbol("1d") => 90,
                    Symbol("3d") => 30,
                    Symbol("1w") => 13,
                    Symbol("1M") => 4
                ),
                Symbol("method") => "publicMixGetV2MixMarketCandles"
            )
        ),
        Symbol("fetchTrades") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("method") => "publicSpotGetV2SpotMarketFillsHistory"
            ),
            Symbol("swap") => Dict{Symbol, Any}(
                Symbol("method") => "publicMixGetV2MixMarketFillsHistory"
            )
        ),
        Symbol("fetchFundingRate") => Dict{Symbol, Any}(
            Symbol("method") => "publicMixGetV2MixMarketCurrentFundRate"
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("funding") => "spot",
            Symbol("spot") => "spot",
            Symbol("cross") => "crossed_margin",
            Symbol("isolated") => "isolated_margin",
            Symbol("swap") => "usdt_futures",
            Symbol("usdc_swap") => "usdc_futures",
            Symbol("future") => "coin_futures",
            Symbol("p2p") => "p2p",
            Symbol("uta") => "uta",
            Symbol("unified") => "uta"
        ),
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("spot") => "spot",
            Symbol("crossed_margin") => "cross",
            Symbol("isolated_margin") => "isolated",
            Symbol("usdt_futures") => "swap",
            Symbol("usdc_futures") => "usdc_swap",
            Symbol("coin_futures") => "future",
            Symbol("p2p") => "p2p",
            Symbol("uta") => "uta"
        ),
        Symbol("sandboxMode") => false,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("TRC20") => "TRC20",
            Symbol("ERC20") => "ERC20",
            Symbol("BEP20") => "BSC",
            Symbol("ATOM") => "ATOM",
            Symbol("ACA") => "AcalaToken",
            Symbol("APT") => "Aptos",
            Symbol("ARBITRUM") => "ArbitrumOne",
            Symbol("ARBITRUM_NOVA") => "ArbitrumNova",
            Symbol("AVAXC") => "C-Chain",
            Symbol("AVAXX") => "X-Chain",
            Symbol("AR") => "Arweave",
            Symbol("BCH") => "BCH",
            Symbol("BCHA") => "BCHA",
            Symbol("BITCI") => "BITCI",
            Symbol("BTC") => "BTC",
            Symbol("CELO") => "CELO",
            Symbol("CSPR") => "CSPR",
            Symbol("ADA") => "Cardano",
            Symbol("CHZ") => "ChilizChain",
            Symbol("CRC20") => "CronosChain",
            Symbol("DOGE") => "DOGE",
            Symbol("DOT") => "DOT",
            Symbol("EOS") => "EOS",
            Symbol("ETHF") => "ETHFAIR",
            Symbol("ETHW") => "ETHW",
            Symbol("ETC") => "ETC",
            Symbol("EGLD") => "Elrond",
            Symbol("FIL") => "FIL",
            Symbol("FIO") => "FIO",
            Symbol("FTM") => "Fantom",
            Symbol("HRC20") => "HECO",
            Symbol("ONE") => "Harmony",
            Symbol("HNT") => "Helium",
            Symbol("ICP") => "ICP",
            Symbol("IOTX") => "IoTeX",
            Symbol("KARDIA") => "KAI",
            Symbol("KAVA") => "KAVA",
            Symbol("KDA") => "KDA",
            Symbol("KLAY") => "Klaytn",
            Symbol("KSM") => "Kusama",
            Symbol("LAT") => "LAT",
            Symbol("LTC") => "LTC",
            Symbol("MINA") => "MINA",
            Symbol("MOVR") => "MOVR",
            Symbol("METIS") => "MetisToken",
            Symbol("GLMR") => "Moonbeam",
            Symbol("NEAR") => "NEARProtocol",
            Symbol("NULS") => "NULS",
            Symbol("OASYS") => "OASYS",
            Symbol("OASIS") => "ROSE",
            Symbol("OMNI") => "OMNI",
            Symbol("ONT") => "Ontology",
            Symbol("OPTIMISM") => "Optimism",
            Symbol("OSMO") => "Osmosis",
            Symbol("POKT") => "PocketNetwork",
            Symbol("MATIC") => "Polygon",
            Symbol("QTUM") => "QTUM",
            Symbol("REEF") => "REEF",
            Symbol("SOL") => "SOL",
            Symbol("SYS") => "SYS",
            Symbol("SXP") => "Solar",
            Symbol("XYM") => "Symbol",
            Symbol("TON") => "TON",
            Symbol("TT") => "TT",
            Symbol("TLOS") => "Telos",
            Symbol("THETA") => "ThetaToken",
            Symbol("VITE") => "VITE",
            Symbol("WAVES") => "WAVES",
            Symbol("WAX") => "WAXP",
            Symbol("WEMIX") => "WEMIXMainnet",
            Symbol("XDC") => "XDCNetworkXDC",
            Symbol("XRP") => "XRP",
            Symbol("FET") => "FETCH",
            Symbol("NEM") => "NEM",
            Symbol("REI") => "REINetwork",
            Symbol("ZIL") => "ZIL",
            Symbol("ABBC") => "ABBCCoin",
            Symbol("RSK") => "RSK",
            Symbol("AZERO") => "AZERO",
            Symbol("TRC10") => "TRC10",
            Symbol("JUNO") => "JUNO",
            Symbol("CANTO") => "CANTO-EVM",
            Symbol("ZKSYNC") => "zkSyncEra",
            Symbol("STARKNET") => "Starknet",
            Symbol("VIC") => "VICTION"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(),
        Symbol("fetchPositions") => Dict{Symbol, Any}(
            Symbol("method") => "privateMixGetV2MixPositionAllPosition"
        ),
        Symbol("fetchCurrencies") => Dict{Symbol, Any}(
            Symbol("fiatCurrencies") => ["EUR", "VND", "PLN", "CZK", "HUF", "DKK", "AUD", "CAD", "NOK", "SEK", "CHF", "MXN", "COP", "ARS", "GBP", "BRL", "UAH", "ZAR"]
        )
    ),
    Symbol("rollingWindowSize") => 1000,
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => false
                ),
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => Dict{Symbol, Any}(
                        Symbol("last") => false,
                        Symbol("mark") => false,
                        Symbol("index") => false
                    ),
                    Symbol("price") => true
                ),
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("marketBuyByCost") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 50
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 90,
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
                Symbol("limit") => 100,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 90,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 200
            )
        ),
        Symbol("forPerps") => Dict{Symbol, Any}(
            Symbol("extends") => "spot",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => false
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
                    Symbol("price") => false
                ),
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => true,
                Symbol("trailing") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("untilDays") => 7
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("trailing") => true
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forPerps"
            )
        )
    )
))

end
"""
enables or disables demo trading mode, if enabled will send PAPTRADING=1 in headers
"""
function setSandboxMode(self::Bitget, enabled)
    self.options[Symbol("sandboxMode")] = enabled;

end
"""
enables or disables demo trading mode, if enabled will send PAPTRADING=1 in headers
"""
function enableDemoTrading(self::Bitget, enabled)
    self.setSandboxMode(enabled);

end
function handleProductTypeAndParams(self::Bitget; market=nothing, params=Dict())
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("handleProductTypeAndParams", market = nothing, params = params);
    defaultProductType = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((subType != nothing), (market == nothing)))
        defaultProductType = functions.ccxtruthy((subType == "linear")) ? "USDT-FUTURES" : "COIN-FUTURES";
    end
    productType = safeString2(params, "productType", "category", defaultProductType);
    if functions.ccxtruthy(@functions.ccxt_and((productType == nothing), (market != nothing)))
        settle = get(market, Symbol("settle"), nothing);
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            marginMode = nothing;
            (marginMode, params) = self.handleMarginModeAndParams("handleProductTypeAndParams", params = params);
            if functions.ccxtruthy(marginMode != nothing)
                productType = "MARGIN";
            else
                productType = "SPOT";
            end
        elseif functions.ccxtruthy(settle == "USDT")
            productType = "USDT-FUTURES";
        else
            if functions.ccxtruthy(settle == "USDC")
                productType = "USDC-FUTURES";
            elseif functions.ccxtruthy(settle == "SUSDT")
                productType = "SUSDT-FUTURES";
            else
                if functions.ccxtruthy(settle == "SUSDC")
                    productType = "SUSDC-FUTURES";
                elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((settle == "SBTC"), (settle == "SETH")), (settle == "SEOS")))
                    productType = "SCOIN-FUTURES";
                else
                    productType = "COIN-FUTURES";
                end

            end

        end
    end
    if functions.ccxtruthy(productType == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a productType param, one of \"USDT-FUTURES\", \"USDC-FUTURES\", \"COIN-FUTURES\", \"SUSDT-FUTURES\", \"SUSDC-FUTURES\", \"SCOIN-FUTURES\" or for uta only \"SPOT\"")));
    end
    params = omit(params, ["productType", "category"]);
    return [productType, params]

end
function handleUTAAndParams(self::Bitget, params, methodName; defaultValue=false)
    uta = nothing;
    (uta, params) = self.handleOptionAndParams(params, methodName, "uta");
    if functions.ccxtruthy(uta != nothing)
            return [uta, params]
    end
    if functions.ccxtruthy(self.checkRequiredCredentials(error = false))
        accountIsUTa = false;
        try
            Base.fetch(self.privateUtaGetV3AccountSettings(params));
            accountIsUTa = true;
        catch e
            accountIsUTa = false;

        end
        self.options[Symbol("uta")] = accountIsUTa;
            return [accountIsUTa, params]
    end
    return [defaultValue, params]

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://www.bitget.com/api-doc/common/public/Get-Server-Time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Bitget; params=Dict())
    response = Base.fetch(self.publicCommonGetV2PublicTime(params));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    return safeInteger(data, "serverTime")

end
"""
retrieves data on all markets for bitget
see: https://www.bitget.com/api-doc/spot/market/Get-Symbols
see: https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
see: https://www.bitget.com/api-doc/margin/common/support-currencies
see: https://www.bitget.com/api-doc/uta/public/Instruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bitget; params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchMarkets", defaultValue = false));
    if functions.ccxtruthy(uta)
            return Base.fetch(self.fetchUtaMarkets(params))
    end
    return Base.fetch(self.fetchDefaultMarkets(params))

end
function fetchDefaultMarkets(self::Bitget, params)
    types = nothing;
    fetchMarketsOptions = self.safeDict(self.options, "fetchMarkets");
    defaultMarkets = ["spot", "swap"];
    if functions.ccxtruthy(fetchMarketsOptions != nothing)
        types = self.safeList(fetchMarketsOptions, "types", defaultValue = defaultMarkets);
    else
        types = self.safeList(self.options, "fetchMarkets", defaultValue = defaultMarkets);
    end
    promises = [];
    fetchMargins = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(types)))
        type_var = get(types, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_or((type_var == "swap"), (type_var == "future")))
            subTypes = ["USDT-FUTURES", "COIN-FUTURES", "USDC-FUTURES", "SUSDT-FUTURES", "SCOIN-FUTURES", "SUSDC-FUTURES"];
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(subTypes)))
                push!(promises, self.publicMixGetV2MixMarketContracts(extend(params, Dict{Symbol, Any}(
    Symbol("productType") => get(subTypes, j + 1, nothing)
))));
                j += 1
            end

        elseif functions.ccxtruthy(type_var == "spot")
            push!(promises, self.publicSpotGetV2SpotPublicSymbols(params));
            fetchMargins = true;
            push!(promises, self.publicMarginGetV2MarginCurrencies(params));
        else
            throw(NotSupported(string(self.id, " does not support ", type_var, " market")));
        end
        i += 1
    end
    results = Base.fetch(asyncmap(Base.fetch, promises));
    markets = [];
    self.options[Symbol("crossMarginPairsData")] = [];
    self.options[Symbol("isolatedMarginPairsData")] = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(results)))
        res = self.safeDict(results, i);
        data = self.safeList(res, "data", defaultValue = []);
        firstData = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
        isBorrowable = self.safeBool(firstData, "isBorrowable");
        if functions.ccxtruthy(@functions.ccxt_and(fetchMargins, isBorrowable != nothing))
            crossKeys = [];
            isolatedKeys = [];
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(data)))
                entry = self.safeDict(data, j, defaultValue = Dict{Symbol, Any}());
                entrySymbol = safeString(entry, "symbol");
                entryBorrowable = self.safeBool(entry, "isBorrowable", defaultValue = true);
                if functions.ccxtruthy(@functions.ccxt_and(entryBorrowable, self.safeBool(entry, "isCrossBorrowable", defaultValue = true)))
                                        push!(crossKeys, entrySymbol);
                end
                isolatedBase = self.safeBool(entry, "isIsolatedBaseBorrowable", defaultValue = true);
                isolatedQuote = self.safeBool2(entry, "isIsolatedQuotedBorrowable", "isIsolatedQuoteBorrowable", defaultValue = true);
                if functions.ccxtruthy(@functions.ccxt_and(entryBorrowable, (@functions.ccxt_or(isolatedBase, isolatedQuote))))
                                        push!(isolatedKeys, entrySymbol);
                end
                j += 1
            end

            self.options[Symbol("crossMarginPairsData")] = crossKeys;
            self.options[Symbol("isolatedMarginPairsData")] = isolatedKeys;
        else
            markets = arrayConcat(markets, data);
        end
        i += 1
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        marketId = safeString(market, "symbol");
        quoteId = safeString(market, "quoteCoin");
        baseId = safeString(market, "baseCoin");
        quote_var = self.safeCurrencyCode(quoteId);
        base = self.safeCurrencyCode(baseId);
        supportMarginCoins = safeValue(market, "supportMarginCoins", []);
        settleId = nothing;
        if functions.ccxtruthy(inArray(baseId, supportMarginCoins))
            settleId = baseId;
        elseif functions.ccxtruthy(inArray(quoteId, supportMarginCoins))
            settleId = quoteId;
        else
            settleId = safeString(supportMarginCoins, 0);
        end
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var);
        type_var = nothing;
        swap = false;
        spot = false;
        future = false;
        contract = false;
        pricePrecision = nothing;
        amountPrecision = nothing;
        linear = nothing;
        inverse = nothing;
        expiry = nothing;
        expiryDatetime = nothing;
        symbolType = safeString(market, "symbolType");
        marginModes = nothing;
        isMarginTradingAllowed = false;
        if functions.ccxtruthy(symbolType == nothing)
            type_var = "spot";
            spot = true;
            pricePrecision = self.parseNumber(self.parsePrecision(precision = safeString(market, "pricePrecision")));
            amountPrecision = self.parseNumber(self.parsePrecision(precision = safeString(market, "quantityPrecision")));
            hasCrossMargin = inArray(marketId, get(self.options, Symbol("crossMarginPairsData"), nothing));
            hasIsolatedMargin = inArray(marketId, get(self.options, Symbol("isolatedMarginPairsData"), nothing));
            marginModes = Dict{Symbol, Any}(
                Symbol("cross") => hasCrossMargin,
                Symbol("isolated") => hasIsolatedMargin
            );
            isMarginTradingAllowed = @functions.ccxt_or(hasCrossMargin, hasIsolatedMargin);
        else
            if functions.ccxtruthy(symbolType == "perpetual")
                type_var = "swap";
                swap = true;
                symbol = string(symbol, ":", settle);
            elseif functions.ccxtruthy(symbolType == "delivery")
                expiry = safeInteger(market, "deliveryTime");
                expiryDatetime = self.iso8601(expiry);
                expiryParts = split(expiryDatetime, "-");
                yearPart = safeString(expiryParts, 0, "");
                dayPart = safeString(expiryParts, 2, "");
                year = functions.ccxt_slice(yearPart, 2, 4);
                month = safeString(expiryParts, 1);
                day = functions.ccxt_slice(dayPart, 0, 2);
                expiryString = string(year, month, day);
                type_var = "future";
                future = true;
                symbol = string(symbol, ":", settle, "-", expiryString);
            end
            contract = true;
            inverse = (base == settle);
            linear = !functions.ccxtruthy(inverse);
            priceDecimals = safeInteger(market, "pricePlace");
            amountDecimals = safeInteger(market, "volumePlace");
            priceStep = safeString(market, "priceEndStep");
            amountStep = safeString(market, "sizeMultiplier");
            precise = Precise(priceStep);
            precise.decimals = max(get(precise, Symbol("decimals"), nothing), priceDecimals);
            reduce(precise);
            priceString = string(precise);
            pricePrecision = self.parseNumber(priceString);
            preciseAmount = Precise(amountStep);
            preciseAmount.decimals = max(get(preciseAmount, Symbol("decimals"), nothing), amountDecimals);
            reduce(preciseAmount);
            amountString = string(preciseAmount);
            amountPrecision = self.parseNumber(amountString);
            marginModes = Dict{Symbol, Any}(
                Symbol("cross") => true,
                Symbol("isolated") => true
            );
        end
        status = safeString2(market, "status", "symbolStatus");
        active = nothing;
        if functions.ccxtruthy(status != nothing)
            active = (@functions.ccxt_or((status == "online"), (status == "normal")));
        end
        minCost = nothing;
        if functions.ccxtruthy(quote_var == "USDT")
            minCost = self.safeNumber(market, "minTradeUSDT");
        end
        contractSize = functions.ccxtruthy(contract) ? 1 : nothing;
        push!(result, self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => @functions.ccxt_and(spot, isMarginTradingAllowed),
    Symbol("marginModes") => marginModes,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => self.safeNumber(market, "takerFeeRate"),
    Symbol("maker") => self.safeNumber(market, "makerFeeRate"),
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => expiryDatetime,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => pricePrecision
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minLever"),
            Symbol("max") => self.safeNumber(market, "maxLever")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber2(market, "minTradeNum", "minTradeAmount"),
            Symbol("max") => self.safeNumber(market, "maxTradeAmount")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => minCost,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => safeInteger(market, "launchTime"),
    Symbol("info") => market
)));
        i += 1
    end
    return result

end
function fetchUtaMarkets(self::Bitget, params)
    subTypes = ["SPOT", "USDT-FUTURES", "COIN-FUTURES", "USDC-FUTURES"];
    promises = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(subTypes)))
        req = extend(params, Dict{Symbol, Any}(
            Symbol("category") => get(subTypes, i + 1, nothing)
        ));
        push!(promises, self.publicUtaGetV3MarketInstruments(req));
        i += 1
    end
    results = Base.fetch(asyncmap(Base.fetch, promises));
    markets = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(results)))
        res = self.safeDict(results, i);
        data = self.safeList(res, "data", defaultValue = []);
        markets = arrayConcat(markets, data);
        i += 1
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        category = safeString(market, "category");
        marketId = safeString(market, "symbol");
        quoteId = safeString(market, "quoteCoin");
        baseId = safeString(market, "baseCoin");
        quote_var = self.safeCurrencyCode(quoteId);
        base = self.safeCurrencyCode(baseId);
        settleId = nothing;
        settle = nothing;
        if functions.ccxtruthy(category == "USDT-FUTURES")
            settleId = "USDT";
        elseif functions.ccxtruthy(category == "USDC-FUTURES")
            settleId = "USDC";
        else
            if functions.ccxtruthy(category == "COIN-FUTURES")
                settleId = base;
            end

        end
        if functions.ccxtruthy(settleId != nothing)
            settle = self.safeCurrencyCode(settleId);
        end
        symbol = string(base, "/", quote_var);
        type_var = nothing;
        swap = false;
        spot = false;
        future = false;
        contract = false;
        pricePrecision = nothing;
        amountPrecision = nothing;
        linear = nothing;
        inverse = nothing;
        expiry = nothing;
        expiryDatetime = nothing;
        symbolType = safeString(market, "type");
        marginModes = nothing;
        isMarginTradingAllowed = false;
        isUtaMargin = (category == "MARGIN");
        if functions.ccxtruthy(@functions.ccxt_or(isUtaMargin, (category == "SPOT")))
            type_var = "spot";
            spot = true;
            if functions.ccxtruthy(isUtaMargin)
                isolatedBase = safeString(market, "isIsolatedBaseBorrowable");
                isolatedQuote = safeString(market, "isIsolatedQuotedBorrowable");
                isolated = @functions.ccxt_or((isolatedBase == "YES"), (isolatedQuote == "YES"));
                maxCrossLeverage = safeString(market, "maxCrossedLeverage");
                cross = (maxCrossLeverage != "0");
                marginModes = Dict{Symbol, Any}(
                    Symbol("cross") => cross,
                    Symbol("isolated") => isolated
                );
                isMarginTradingAllowed = true;
            end
        else
            if functions.ccxtruthy(symbolType == "perpetual")
                type_var = "swap";
                swap = true;
                symbol = string(symbol, ":", settle);
            elseif functions.ccxtruthy(symbolType == "delivery")
                expiry = safeInteger(market, "deliveryTime");
                expiryDatetime = self.iso8601(expiry);
                expiryParts = split(expiryDatetime, "-");
                yearPart = safeString(expiryParts, 0, "");
                dayPart = safeString(expiryParts, 2, "");
                year = functions.ccxt_slice(yearPart, 2, 4);
                month = safeString(expiryParts, 1);
                day = functions.ccxt_slice(dayPart, 0, 2);
                expiryString = string(year, month, day);
                type_var = "future";
                future = true;
                symbol = string(symbol, ":", settle, "-", expiryString);
            end
            contract = true;
            inverse = (base == settle);
            linear = !functions.ccxtruthy(inverse);
            marginModes = Dict{Symbol, Any}(
                Symbol("cross") => true,
                Symbol("isolated") => true
            );
        end
        pricePrecision = self.parseNumber(self.parsePrecision(precision = safeString(market, "pricePrecision")));
        amountPrecision = self.parseNumber(self.parsePrecision(precision = safeString(market, "quantityPrecision")));
        status = safeString(market, "status");
        active = nothing;
        if functions.ccxtruthy(status != nothing)
            active = (@functions.ccxt_or((status == "online"), (status == "normal")));
        end
        contractSize = functions.ccxtruthy(contract) ? 1 : nothing;
        push!(result, self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => @functions.ccxt_and(spot, isMarginTradingAllowed),
    Symbol("marginModes") => marginModes,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => self.safeNumber(market, "takerFeeRate"),
    Symbol("maker") => self.safeNumber(market, "makerFeeRate"),
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => expiryDatetime,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => pricePrecision
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minLeverage"),
            Symbol("max") => self.safeNumber(market, "maxLeverage")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minOrderQty"),
            Symbol("max") => self.safeNumber(market, "maxOrderQty")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minOrderAmount"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => safeInteger(market, "launchTime"),
    Symbol("info") => market
)));
        i += 1
    end
    return result

end
"""
fetches all available currencies on an exchange
see: https://www.bitget.com/api-doc/spot/market/Get-Coin-List

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bitget; params=Dict())
    response = Base.fetch(self.publicSpotGetV2SpotPublicCoins(params));
    data = safeValue(response, "data", []);
    return self.parseCurrencies(data)

end
function parseCurrency(self::Bitget, rawCurrency)
    fiatCurrencies = self.handleOption("fetchCurrencies", "fiatCurrencies", defaultValue = []);
    entry = rawCurrency;
    id = safeString(entry, "coin");
    code = self.safeCurrencyCode(id);
    chains = self.safeList(entry, "chains", defaultValue = []);
    networks = Dict{Symbol, Any}();
    withdraw = nothing;
    deposit = nothing;
    chainsLength = length(chains);
    if functions.ccxtruthy(chainsLength == 0)
        withdraw = false;
        deposit = false;
    end
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, chainsLength))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "chain");
        network = self.networkIdToCode(networkId = networkId, currencyCode = code);
        if functions.ccxtruthy(network == nothing)
            throw(ArgumentsRequired(string(self.id, " requires a network argument")));
        end
        network = uppercase(network);
        withdrawable = (safeString(chain, "withdrawable") == "true");
        rechargeable = (safeString(chain, "rechargeable") == "true");
        withdraw = functions.ccxtruthy((withdraw == nothing)) ? withdrawable : (@functions.ccxt_or(withdraw, withdrawable));
        deposit = functions.ccxtruthy((deposit == nothing)) ? rechargeable : (@functions.ccxt_or(deposit, rechargeable));
        networks[Symbol(network)] = Dict{Symbol, Any}(
            Symbol("info") => chain,
            Symbol("id") => networkId,
            Symbol("network") => network,
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(chain, "minWithdrawAmount"),
                    Symbol("max") => nothing
                ),
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(chain, "minDepositAmount"),
                    Symbol("max") => nothing
                )
            ),
            Symbol("active") => nothing,
            Symbol("withdraw") => withdrawable,
            Symbol("deposit") => rechargeable,
            Symbol("fee") => self.safeNumber(chain, "withdrawFee"),
            Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(chain, "withdrawMinScale")))
        );
        j += 1
    end
    active = @functions.ccxt_and(withdraw, deposit);
    isFiat = inArray(code, fiatCurrencies);
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("networks") => networks,
    Symbol("type") => functions.ccxtruthy(isFiat) ? "fiat" : "crypto",
    Symbol("name") => nothing,
    Symbol("active") => active,
    Symbol("deposit") => deposit,
    Symbol("withdraw") => withdraw,
    Symbol("fee") => nothing,
    Symbol("precision") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing
))

end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
see: https://www.bitget.com/api-doc/contract/position/Get-Query-Position-Lever
see: https://www.bitget.com/api-doc/margin/cross/account/Cross-Tier-Data
see: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Tier-Data
see: https://www.bitget.com/api-doc/uta/public/Get-Position-Tier-Data

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: for spot margin 'cross' or 'isolated', default is 'isolated'
- `params.code`::string, optional: required for cross spot margin
- `params.productType`::string, optional: *contract and uta only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
function fetchMarketLeverageTiers(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    response = nothing;
    marginMode = nothing;
    productType = nothing;
    uta = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchMarketLeverageTiers", params = params, defaultValue = "isolated");
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchMarketLeverageTiers", defaultValue = false));
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(productType == "SPOT")
            if functions.ccxtruthy(marginMode != nothing)
                productType = "MARGIN";
            end
        end
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        request[Symbol("category")] = productType;
        response = Base.fetch(self.publicUtaGetV3MarketPositionTier(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or((get(market, Symbol("swap"), nothing)), (get(market, Symbol("future"), nothing))))
        request[Symbol("productType")] = productType;
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.publicMixGetV2MixMarketQueryPositionLever(extend(request, params)));
    else
        if functions.ccxtruthy(marginMode == "isolated")
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
            response = Base.fetch(self.privateMarginGetV2MarginIsolatedTierData(extend(request, params)));
        elseif functions.ccxtruthy(marginMode == "cross")
            code = safeString(params, "code");
            if functions.ccxtruthy(code == nothing)
                throw(ArgumentsRequired(string(self.id, " fetchMarketLeverageTiers() requires a code argument")));
            end
            params = omit(params, "code");
            currency = self.currency(code);
            request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
            response = Base.fetch(self.privateMarginGetV2MarginCrossedTierData(extend(request, params)));
        else
            throw(BadRequest(string(self.id, " fetchMarketLeverageTiers() symbol does not support market ", get(market, Symbol("symbol"), nothing))));
        end

    end
    result = safeValue(response, "data", []);
    return self.parseMarketLeverageTiers(result, market = market)

end
function parseMarketLeverageTiers(self::Bitget, info; market=nothing)
    tiers = [];
    minNotional = 0;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(info)))
        item = get(info, i + 1, nothing);
        minimumNotional = self.safeNumber2(item, "startUnit", "minTierValue");
        if functions.ccxtruthy(minimumNotional != nothing)
            minNotional = minimumNotional;
        end
        maxNotional = self.safeNumberN(item, ["endUnit", "maxBorrowableAmount", "baseMaxBorrowableAmount", "maxTierValue"]);
        marginCurrency = safeString2(item, "coin", "baseCoin");
        currencyId = functions.ccxtruthy((marginCurrency != nothing)) ? marginCurrency : safeString(market, "base");
        marketId = safeString(item, "symbol");
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => safeInteger2(item, "level", "tier"),
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("currency") => self.safeCurrencyCode(currencyId),
    Symbol("minNotional") => minNotional,
    Symbol("maxNotional") => maxNotional,
    Symbol("maintenanceMarginRate") => self.safeNumberN(item, ["keepMarginRate", "maintainMarginRate", "mmr"]),
    Symbol("maxLeverage") => self.safeNumber(item, "leverage"),
    Symbol("info") => item
));
        minNotional = maxNotional;
        i += 1
    end
    return tiers

end
"""
fetch all deposits made to an account
see: https://www.bitget.com/api-doc/spot/account/Get-Deposit-Record

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in milliseconds
- `params.idLessThan`::string, optional: return records with id less than the provided value
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Bitget; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDeposits", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchDeposits", symbol = nothing, since = since, limit = limit, params = params, cursorReceived = "idLessThan", cursorSent = "idLessThan", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    if functions.ccxtruthy(since == nothing)
        since = milliseconds() - 7776000000;
    end
    request = Dict{Symbol, Any}(
        Symbol("startTime") => since,
        Symbol("endTime") => milliseconds()
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.privateSpotGetV2SpotWalletDepositRecords(extend(request, params)));
    rawTransactions = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(rawTransactions, currency = nothing, since = since, limit = limit)

end
"""
make a withdrawal
see: https://www.bitget.com/api-doc/spot/account/Wallet-Withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.chain`::string, optional: the blockchain network the withdrawal is taking place on

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Bitget, code, amount, address; tag=nothing, params=Dict())
    self.checkAddress(address = address);
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " withdraw() requires a \"network\" parameter")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    networkId = self.networkCodeToId(networkCode, currencyCode = code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("chain") => networkId,
        Symbol("size") => self.currencyToPrecision(code, amount, networkCode = networkCode),
        Symbol("transferType") => "on_chain"
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("tag")] = tag;
    end
    response = Base.fetch(self.privateSpotPostV2SpotWalletWithdrawal(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    result = self.parseTransaction(data, currency = currency);
    result[Symbol("type")] = "withdrawal";
    withdrawOptions = safeValue(self.options, "withdraw", Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(withdrawOptions, "fillResponseFromRequest", defaultValue = true);
    if functions.ccxtruthy(fillResponseFromRequest)
        result[Symbol("currency")] = code;
        result[Symbol("amount")] = amount;
        result[Symbol("tag")] = tag;
        result[Symbol("address")] = address;
        result[Symbol("addressTo")] = address;
        result[Symbol("network")] = networkCode;
    end
    return result

end
"""
fetch all withdrawals made from an account
see: https://www.bitget.com/api-doc/spot/account/Get-Withdraw-Record

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in milliseconds
- `params.idLessThan`::string, optional: return records with id less than the provided value
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Bitget; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchWithdrawals", symbol = nothing, since = since, limit = limit, params = params, cursorReceived = "idLessThan", cursorSent = "idLessThan", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(since == nothing)
        since = milliseconds() - 7776000000;
    end
    request = Dict{Symbol, Any}(
        Symbol("startTime") => since,
        Symbol("endTime") => milliseconds()
    );
    if functions.ccxtruthy(currency != nothing)
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateSpotGetV2SpotWalletWithdrawalRecords(extend(request, params)));
    rawTransactions = self.safeList(response, "data", defaultValue = []);
    return self.parseTransactions(rawTransactions, currency = currency, since = since, limit = limit)

end
function parseTransaction(self::Bitget, transaction; currency=nothing)
    currencyId = safeString(transaction, "coin");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = safeInteger(transaction, "cTime");
    networkId = safeString(transaction, "chain");
    status = safeString(transaction, "status");
    tag = safeString(transaction, "tag");
    feeCostString = safeString(transaction, "fee");
    feeCostAbsString = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCostAbsString = stringAbs(feeCostString);
    end
    fee = nothing;
    amountString = safeString(transaction, "size");
    if functions.ccxtruthy(feeCostAbsString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => self.parseNumber(feeCostAbsString)
        );
        amountString = stringSub(amountString, feeCostAbsString);
    end
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transaction, "orderId"),
    Symbol("info") => transaction,
    Symbol("txid") => safeString(transaction, "tradeId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => self.networkIdToCode(networkId = networkId, currencyCode = code),
    Symbol("addressFrom") => safeString(transaction, "fromAddress"),
    Symbol("address") => safeString(transaction, "toAddress"),
    Symbol("addressTo") => safeString(transaction, "toAddress"),
    Symbol("amount") => self.parseNumber(amountString),
    Symbol("type") => safeString(transaction, "type"),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(status),
    Symbol("updated") => safeInteger(transaction, "uTime"),
    Symbol("tagFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => tag,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => fee
)

end
function parseTransactionStatus(self::Bitget, status)
    statuses = Dict{Symbol, Any}(
        Symbol("success") => "ok",
        Symbol("Pending") => "pending",
        Symbol("pending_review") => "pending",
        Symbol("pending_review_fail") => "failed",
        Symbol("reject") => "failed"
    );
    return safeString(statuses, status, status)

end
"""
fetch the deposit address for a currency associated with this account
see: https://www.bitget.com/api-doc/spot/account/Get-Deposit-Address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Bitget, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("chain")] = self.networkCodeToId(networkCode, currencyCode = code);
    end
    response = Base.fetch(self.privateSpotGetV2SpotWalletDepositAddress(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency = currency)

end
function parseDepositAddress(self::Bitget, depositAddress; currency=nothing)
    currencyId = safeString(depositAddress, "coin");
    networkId = safeString(depositAddress, "chain");
    parsedCurrency = self.safeCurrencyCode(currencyId, currency = currency);
    network = nothing;
    if functions.ccxtruthy(networkId != nothing)
        network = self.networkIdToCode(networkId = networkId, currencyCode = parsedCurrency);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => parsedCurrency,
    Symbol("network") => network,
    Symbol("address") => safeString(depositAddress, "address"),
    Symbol("tag") => safeString(depositAddress, "tag")
)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.bitget.com/api-doc/spot/market/Get-Orderbook
see: https://www.bitget.com/api-doc/contract/market/Get-Merge-Depth
see: https://www.bitget.com/api-doc/uta/public/OrderBook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bitget, symbol; limit=nothing, params=Dict())
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
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    response = nothing;
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchOrderBook", defaultValue = false));
    if functions.ccxtruthy(uta)
        request[Symbol("category")] = productType;
        response = Base.fetch(self.publicUtaGetV3MarketOrderbook(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.publicSpotGetV2SpotMarketOrderbook(extend(request, params)));
    else
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.publicMixGetV2MixMarketMergeDepth(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    bidsKey = functions.ccxtruthy(uta) ? "b" : "bids";
    asksKey = functions.ccxtruthy(uta) ? "a" : "asks";
    timestamp = safeInteger(data, "ts");
    return self.parseOrderBook(data, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = bidsKey, asksKey = asksKey)

end
function parseTicker(self::Bitget, ticker; market=nothing)
    marketId = safeString(ticker, "symbol");
    close = safeString2(ticker, "lastPr", "lastPrice");
    timestamp = self.safeIntegerOmitZero(ticker, "ts");
    category = safeString(ticker, "category");
    markPrice = safeString(ticker, "markPrice");
    if functions.ccxtruthy(@functions.ccxt_and((markPrice != nothing), (category != "SPOT")))
        marketType = "contract";
    else
        marketType = "spot";
    end
    percentage = safeString(ticker, "price24hPcnt");
    if functions.ccxtruthy(percentage == nothing)
        change24h = safeString(ticker, "change24h");
        percentage = stringMul(change24h, "100");
    end
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = marketType),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString2(ticker, "high24h", "highPrice24h"),
    Symbol("low") => safeString2(ticker, "low24h", "lowPrice24h"),
    Symbol("bid") => safeString2(ticker, "bidPr", "bid1Price"),
    Symbol("bidVolume") => safeString2(ticker, "bidSz", "bid1Size"),
    Symbol("ask") => safeString2(ticker, "askPr", "ask1Price"),
    Symbol("askVolume") => safeString2(ticker, "askSz", "ask1Size"),
    Symbol("vwap") => nothing,
    Symbol("open") => safeStringN(ticker, ["open", "open24h", "openPrice24h"]),
    Symbol("close") => close,
    Symbol("last") => close,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => percentage,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString2(ticker, "baseVolume", "volume24h"),
    Symbol("quoteVolume") => safeString2(ticker, "quoteVolume", "turnover24h"),
    Symbol("indexPrice") => safeString(ticker, "indexPrice"),
    Symbol("markPrice") => markPrice,
    Symbol("info") => ticker
), market = market)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.bitget.com/api-doc/spot/market/Get-Tickers
see: https://www.bitget.com/api-doc/contract/market/Get-Ticker
see: https://www.bitget.com/api-doc/uta/public/Tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    response = nothing;
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchTicker", defaultValue = false));
    if functions.ccxtruthy(uta)
        request[Symbol("category")] = productType;
        response = Base.fetch(self.publicUtaGetV3MarketTickers(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.publicSpotGetV2SpotMarketTickers(extend(request, params)));
    else
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.publicMixGetV2MixMarketTicker(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTicker(get(data, 1, nothing), market = market)

end
"""
fetches the mark price for a specific market
see: https://www.bitget.com/api-doc/contract/market/Get-Symbol-Price

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchMarkPrice(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(NotSupported(string(self.id, " fetchMarkPrice() is not supported for spot markets")));
    else
        productType = nothing;
        (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.publicMixGetV2MixMarketSymbolPrice(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTicker(get(data, 1, nothing), market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.bitget.com/api-doc/spot/market/Get-Tickers
see: https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker
see: https://www.bitget.com/api-doc/uta/public/Tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.subType`::string, optional: *contract only* 'linear', 'inverse'
- `params.productType`::string, optional: *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Bitget; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbol = safeValue(symbols, 0);
        market = self.market(symbol);
    end
    response = nothing;
    request = Dict{Symbol, Any}();
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market = market, params = params);
    passedSubType = safeString(params, "subType");
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchTickers", defaultValue = false));
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(symbols != nothing)
            symbolsLength = length(symbols);
            if functions.ccxtruthy(symbolsLength == 1)
                request[Symbol("symbol")] = safeString(market, "id");
            end
        end
        request[Symbol("category")] = productType;
        response = Base.fetch(self.publicUtaGetV3MarketTickers(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_and(type_var == "spot", passedSubType == nothing))
        response = Base.fetch(self.publicSpotGetV2SpotMarketTickers(extend(request, params)));
    else
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.publicMixGetV2MixMarketTickers(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTickers(data, symbols = symbols)

end
function parseTrade(self::Bitget, trade; market=nothing)
    marketId = safeString(trade, "symbol");
    symbol = self.safeSymbol(marketId, market = market);
    timestamp = safeIntegerN(trade, ["cTime", "ts", "createdTime"]);
    fee = nothing;
    feeDetail = safeValue(trade, "feeDetail");
    posMode = safeString(trade, "posMode");
    category = safeString(trade, "category");
    isFeeStructure = @functions.ccxt_or((posMode != nothing), (category != nothing));
    feeStructure = functions.ccxtruthy(isFeeStructure) ? get(feeDetail, 1, nothing) : feeDetail;
    if functions.ccxtruthy(feeStructure != nothing)
        currencyCode = self.safeCurrencyCode(safeString(feeStructure, "feeCoin"));
        fee = Dict{Symbol, Any}(
            Symbol("currency") => currencyCode
        );
        feeCostString = safeString2(feeStructure, "totalFee", "fee");
        deduction = functions.ccxtruthy(safeString(feeStructure, "deduction") == "yes") ? true : false;
        if functions.ccxtruthy(deduction)
            fee[Symbol("cost")] = feeCostString;
        else
            fee[Symbol("cost")] = stringNeg(feeCostString);
        end
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString2(trade, "tradeId", "execId"),
    Symbol("order") => safeString(trade, "orderId"),
    Symbol("symbol") => symbol,
    Symbol("side") => safeStringLower(trade, "side"),
    Symbol("type") => safeString(trade, "orderType"),
    Symbol("takerOrMaker") => safeString(trade, "tradeScope"),
    Symbol("price") => safeStringN(trade, ["priceAvg", "price", "execPrice"]),
    Symbol("amount") => safeStringN(trade, ["baseVolume", "size", "execQty"]),
    Symbol("cost") => safeStringN(trade, ["quoteVolume", "amount", "execValue"]),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://www.bitget.com/api-doc/spot/market/Get-Recent-Trades
see: https://www.bitget.com/api-doc/spot/market/Get-Market-Trades
see: https://www.bitget.com/api-doc/contract/market/Get-Recent-Fills
see: https://www.bitget.com/api-doc/contract/market/Get-Fills-History
see: https://www.bitget.com/api-doc/uta/public/Fills

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.until`::int, optional: *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* default false, when true will automatically paginate by calling this endpoint multiple times

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bitget, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchTrades", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "idLessThan", cursorSent = "idLessThan"))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchTrades", defaultValue = false));
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(uta)
            request[Symbol("limit")] = min(limit, 100);
        elseif functions.ccxtruthy(get(market, Symbol("contract"), nothing))
            request[Symbol("limit")] = min(limit, 1000);
        else
            request[Symbol("limit")] = limit;
        end
    end
    options = safeValue(self.options, "fetchTrades", Dict{Symbol, Any}());
    response = nothing;
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(productType == "SPOT")
            marginMode = nothing;
            (marginMode, params) = self.handleMarginModeAndParams("fetchTrades", params = params);
            if functions.ccxtruthy(marginMode != nothing)
                productType = "MARGIN";
            end
        end
        request[Symbol("category")] = productType;
        response = Base.fetch(self.publicUtaGetV3MarketFills(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        spotOptions = safeValue(options, "spot", Dict{Symbol, Any}());
        defaultSpotMethod = safeString(spotOptions, "method", "publicSpotGetV2SpotMarketFillsHistory");
        spotMethod = safeString(params, "method", defaultSpotMethod);
        params = omit(params, "method");
        if functions.ccxtruthy(spotMethod == "publicSpotGetV2SpotMarketFillsHistory")
            (request, params) = self.handleUntilOption("endTime", request, params);
            if functions.ccxtruthy(since != nothing)
                request[Symbol("startTime")] = since;
            end
            response = Base.fetch(self.publicSpotGetV2SpotMarketFillsHistory(extend(request, params)));
        elseif functions.ccxtruthy(spotMethod == "publicSpotGetV2SpotMarketFills")
            response = Base.fetch(self.publicSpotGetV2SpotMarketFills(extend(request, params)));
        end
    else
        swapOptions = safeValue(options, "swap", Dict{Symbol, Any}());
        defaultSwapMethod = safeString(swapOptions, "method", "publicMixGetV2MixMarketFillsHistory");
        swapMethod = safeString(params, "method", defaultSwapMethod);
        params = omit(params, "method");
        request[Symbol("productType")] = productType;
        if functions.ccxtruthy(swapMethod == "publicMixGetV2MixMarketFillsHistory")
            (request, params) = self.handleUntilOption("endTime", request, params);
            if functions.ccxtruthy(since != nothing)
                request[Symbol("startTime")] = since;
            end
            response = Base.fetch(self.publicMixGetV2MixMarketFillsHistory(extend(request, params)));
        elseif functions.ccxtruthy(swapMethod == "publicMixGetV2MixMarketFills")
            response = Base.fetch(self.publicMixGetV2MixMarketFills(extend(request, params)));
        end
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
"""
fetch the trading fees for a market
see: https://www.bitget.com/api-doc/common/public/Get-Trade-Rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'isolated' or 'cross', for finding the fee rate of spot margin trading pairs

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchTradingFee", params = params);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("businessType")] = "margin";
        else
            request[Symbol("businessType")] = "spot";
        end
    else
        request[Symbol("businessType")] = "mix";
    end
    response = Base.fetch(self.privateCommonGetV2CommonTradeRate(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    return self.parseTradingFee(data, market = market)

end
"""
fetch the trading fees for multiple markets
see: https://www.bitget.com/api-doc/spot/market/Get-Symbols
see: https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
see: https://www.bitget.com/api-doc/margin/common/support-currencies

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.productType`::string, optional: *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.margin`::bool, optional: set to true for spot margin

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Bitget; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = nothing;
    marginMode = nothing;
    marketType = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchTradingFees", params = params);
    (marketType, params) = self.handleMarketTypeAndParams("fetchTradingFees", market = nothing, params = params);
    if functions.ccxtruthy(marketType == "spot")
        margin = self.safeBool(params, "margin", defaultValue = false);
        params = omit(params, "margin");
        if functions.ccxtruthy(@functions.ccxt_or((marginMode != nothing), margin))
            response = Base.fetch(self.publicMarginGetV2MarginCurrencies(params));
        else
            response = Base.fetch(self.publicSpotGetV2SpotPublicSymbols(params));
        end
    elseif functions.ccxtruthy(@functions.ccxt_or((marketType == "swap"), (marketType == "future")))
        productType = nothing;
        (productType, params) = self.handleProductTypeAndParams(market = nothing, params = params);
        params[Symbol("productType")] = productType;
        response = Base.fetch(self.publicMixGetV2MixMarketContracts(params));
    else
        throw(NotSupported(string(self.id, " does not support ", marketType, " market")));
    end
    data = safeValue(response, "data", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        symbol = self.safeSymbol(marketId, market = nothing, delimiter = nothing, marketType = marketType);
        market = self.market(symbol);
        fee = self.parseTradingFee(entry, market = market);
        result[Symbol(symbol)] = fee;
        i += 1
    end
    return result

end
function parseTradingFee(self::Bitget, data; market=nothing)
    marketId = safeString(data, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("maker") => self.safeNumber(data, "makerFeeRate"),
    Symbol("taker") => self.safeNumber(data, "takerFeeRate"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function parseOHLCV(self::Bitget, ohlcv; market=nothing)
    inverse = self.safeBool(market, "inverse");
    volumeIndex = functions.ccxtruthy(inverse) ? 6 : 5;
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, volumeIndex)]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.bitget.com/api-doc/spot/market/Get-Candle-Data
see: https://www.bitget.com/api-doc/spot/market/Get-History-Candle-Data
see: https://www.bitget.com/api-doc/contract/market/Get-Candle-Data
see: https://www.bitget.com/api-doc/contract/market/Get-History-Candle-Data
see: https://www.bitget.com/api-doc/contract/market/Get-History-Index-Candle-Data
see: https://www.bitget.com/api-doc/contract/market/Get-History-Mark-Candle-Data
see: https://www.bitget.com/api-doc/uta/public/Get-Candle-Data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.useHistoryEndpoint`::bool, optional: whether to force to use historical endpoint (it has max limit of 200)
- `params.useHistoryEndpointForPagination`::bool, optional: whether to force to use historical endpoint for pagination (default true)
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.price`::string, optional: *swap only* "mark" (to fetch mark price candles) or "index" (to fetch index price candles)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bitget, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    defaultLimit = 100;
    maxLimitForRecentEndpoint = 1000;
    maxLimitForHistoryEndpoint = 200;
    useHistoryEndpoint = self.safeBool(params, "useHistoryEndpoint", defaultValue = false);
    useHistoryEndpointForPagination = self.safeBool(params, "useHistoryEndpointForPagination", defaultValue = true);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
        limitForPagination = functions.ccxtruthy(useHistoryEndpointForPagination) ? maxLimitForHistoryEndpoint : maxLimitForRecentEndpoint;
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = limitForPagination))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    marketType = nothing;
    timeframes = nothing;
    timeframesOption = self.handleOption("fetchOHLCV", "timeframes");
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchOHLCV", defaultValue = false));
    if functions.ccxtruthy(uta)
        timeframes = get(timeframesOption, Symbol("uta"), nothing);
        request[Symbol("interval")] = safeString(timeframes, timeframe, timeframe);
    else
        marketType = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "spot" : "swap";
        timeframes = get(timeframesOption, Symbol(marketType), nothing);
        request[Symbol("granularity")] = safeString(timeframes, timeframe, timeframe);
    end
    msInDay = 86400000;
    now = milliseconds();
    duration = self.parseTimeframe(timeframe) * 1000;
    until = safeInteger(params, "until");
    limitDefined = limit != nothing;
    sinceDefined = since != nothing;
    untilDefined = until != nothing;
    params = omit(params, ["until"]);
    key = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "spot" : "swap";
    ohlcOptions = self.safeDict(get(self.options, Symbol("fetchOHLCV"), nothing), key, defaultValue = Dict{Symbol, Any}());
    maxLimitPerTimeframe = self.safeDict(ohlcOptions, "maxLimitPerTimeframe", defaultValue = Dict{Symbol, Any}());
    maxLimitForThisTimeframe = safeInteger(maxLimitPerTimeframe, timeframe, limit);
    recentEndpointDaysMap = self.safeDict(get(self.options, Symbol("fetchOHLCV"), nothing), "maxRecentDaysPerTimeframe", defaultValue = Dict{Symbol, Any}());
    recentEndpointAvailableDays = safeInteger(recentEndpointDaysMap, timeframe);
    recentEndpointBoundaryTs = now - (recentEndpointAvailableDays - 1) * msInDay;
    if functions.ccxtruthy(limitDefined)
        limit = min(limit, maxLimitForRecentEndpoint);
        limit = min(limit, maxLimitForThisTimeframe);
    else
        limit = defaultLimit;
    end
    limitMultipliedDuration = limit * duration;
    calculatedStartTime = nothing;
    calculatedEndTime = nothing;
    if functions.ccxtruthy(sinceDefined)
        calculatedStartTime = since;
        request[Symbol("startTime")] = since;
        if functions.ccxtruthy(!functions.ccxtruthy(untilDefined))
            calculatedEndTime = self.sum(calculatedStartTime, limitMultipliedDuration);
            if functions.ccxtruthy(functions.ccxt_gt(calculatedEndTime, now))
                calculatedEndTime = now;
            end
            request[Symbol("endTime")] = calculatedEndTime;
        end
    end
    if functions.ccxtruthy(untilDefined)
        calculatedEndTime = until;
        if functions.ccxtruthy(functions.ccxt_gt(calculatedEndTime, now))
            calculatedEndTime = now;
        end
        request[Symbol("endTime")] = calculatedEndTime;
        if functions.ccxtruthy(!functions.ccxtruthy(sinceDefined))
            calculatedStartTime = calculatedEndTime - limitMultipliedDuration;
        end
    end
    historicalEndpointNeeded = false;
    if functions.ccxtruthy(@functions.ccxt_or((@functions.ccxt_and(calculatedStartTime != nothing, functions.ccxt_le(calculatedStartTime, recentEndpointBoundaryTs))), useHistoryEndpoint))
        historicalEndpointNeeded = true;
        limit = min(limit, maxLimitForHistoryEndpoint);
        limitMultipliedDuration = limit * duration;
        calculatedStartTime = calculatedEndTime - limitMultipliedDuration;
        request[Symbol("startTime")] = calculatedStartTime;
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
            maxDistanceDaysForContracts = 90;
            if functions.ccxtruthy(functions.ccxt_gt(calculatedEndTime - calculatedStartTime, maxDistanceDaysForContracts * msInDay))
                calculatedEndTime = self.sum(calculatedStartTime, maxDistanceDaysForContracts * msInDay);
                request[Symbol("endTime")] = calculatedEndTime;
            end
        end
    end
    request[Symbol("limit")] = limit;
    response = nothing;
    productType = nothing;
    priceType = nothing;
    (priceType, params) = self.handleParamString(params, "price");
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(priceType != nothing)
            if functions.ccxtruthy(priceType == "mark")
                request[Symbol("type")] = "MARK";
            elseif functions.ccxtruthy(priceType == "index")
                request[Symbol("type")] = "INDEX";
            end
        end
        request[Symbol("category")] = productType;
        response = Base.fetch(self.publicUtaGetV3MarketCandles(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(historicalEndpointNeeded)
            response = Base.fetch(self.publicSpotGetV2SpotMarketHistoryCandles(extend(request, params)));
        else
            if functions.ccxtruthy(!functions.ccxtruthy(limitDefined))
                request[Symbol("limit")] = 1000;
                limit = 1000;
            end
            response = Base.fetch(self.publicSpotGetV2SpotMarketCandles(extend(request, params)));
        end
    else
        request[Symbol("productType")] = productType;
        extended = extend(request, params);
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(historicalEndpointNeeded), (@functions.ccxt_or(priceType == "mark", priceType == "index"))))
            if functions.ccxtruthy(!functions.ccxtruthy(limitDefined))
                extended[Symbol("limit")] = 1000;
                limit = 1000;
            end
            response = Base.fetch(self.publicMixGetV2MixMarketCandles(extend(Dict{Symbol, Any}(
    Symbol("kLineType") => priceType
), extended)));
        elseif functions.ccxtruthy(priceType == "mark")
            response = Base.fetch(self.publicMixGetV2MixMarketHistoryMarkCandles(extended));
        else
            if functions.ccxtruthy(priceType == "index")
                response = Base.fetch(self.publicMixGetV2MixMarketHistoryIndexCandles(extended));
            else
                if functions.ccxtruthy(historicalEndpointNeeded)
                    response = Base.fetch(self.publicMixGetV2MixMarketHistoryCandles(extended));
                else
                    if functions.ccxtruthy(!functions.ccxtruthy(limitDefined))
                        extended[Symbol("limit")] = 1000;
                        limit = 1000;
                    end
                    response = Base.fetch(self.publicMixGetV2MixMarketCandles(extended));
                end
            end

        end
    end
    if functions.ccxtruthy(response == "")
            return []
    end
    candles = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        candles = response;
    else
        candles = self.safeList(response, "data", defaultValue = []);
    end
    return self.parseOHLCVs(candles, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.bitget.com/api-doc/spot/account/Get-Account-Assets
see: https://www.bitget.com/api-doc/contract/account/Get-Account-List
see: https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Assets
see: https://www.bitget.com/api-doc/margin/isolated/account/Get-Isolated-Assets
see: https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-assets
see: https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-assets
see: https://www.bitget.com/api-doc/uta/account/Get-Account
see: https://www.bitget.com/api-doc/uta/account/Get-Account-Funding-Assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.productType`::string, optional: *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.uta`::string, optional: set to true for the unified trading account (uta), defaults to false
- `params.type`::string, optional: 'funding' to fetch the uta funding-account assets (uta only, classic accounts route funding through 'spot')

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bitget; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    marketType = nothing;
    marginMode = nothing;
    response = nothing;
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchBalance", defaultValue = false));
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    (marginMode, params) = self.handleMarginModeAndParams("fetchBalance", params = params);
    if functions.ccxtruthy(uta)
        assets = nothing;
        if functions.ccxtruthy(marketType == "funding")
            response = Base.fetch(self.privateUtaGetV3AccountFundingAssets(extend(request, params)));
            assets = self.safeList(response, "data", defaultValue = []);
        else
            response = Base.fetch(self.privateUtaGetV3AccountAssets(extend(request, params)));
            results = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
            assets = self.safeList(results, "assets", defaultValue = []);
        end
            return self.parseUtaBalance(assets)
    elseif functions.ccxtruthy(@functions.ccxt_or((marketType == "swap"), (marketType == "future")))
        productType = nothing;
        (productType, params) = self.handleProductTypeAndParams(market = nothing, params = params);
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixGetV2MixAccountAccounts(extend(request, params)));
    else
        if functions.ccxtruthy(marginMode == "isolated")
            response = Base.fetch(self.privateMarginGetV2MarginIsolatedAccountAssets(extend(request, params)));
        elseif functions.ccxtruthy(marginMode == "cross")
            response = Base.fetch(self.privateMarginGetV2MarginCrossedAccountAssets(extend(request, params)));
        else
            if functions.ccxtruthy(marketType == "spot")
                response = Base.fetch(self.privateSpotGetV2SpotAccountAssets(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchBalance() does not support ", marketType, " accounts")));
            end

        end

    end
    data = safeValue(response, "data", []);
    return self.parseBalance(data)

end
function parseUtaBalance(self::Bitget, balance)
    result = Dict{Symbol, Any}(
        Symbol("info") => balance
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balance)))
        entry = get(balance, i + 1, nothing);
        account = self.account();
        currencyId = safeString(entry, "coin");
        code = self.safeCurrencyCode(currencyId);
        account[Symbol("debt")] = safeString(entry, "debt");
        account[Symbol("used")] = safeString2(entry, "locked", "frozen");
        account[Symbol("free")] = safeString(entry, "available");
        account[Symbol("total")] = safeString(entry, "balance");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function parseBalance(self::Bitget, balance)
    result = Dict{Symbol, Any}(
        Symbol("info") => balance
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balance)))
        entry = get(balance, i + 1, nothing);
        account = self.account();
        currencyId = safeString2(entry, "marginCoin", "coin");
        code = self.safeCurrencyCode(currencyId);
        borrow = safeString(entry, "borrow");
        if functions.ccxtruthy(borrow != nothing)
            interest = safeString(entry, "interest");
            account[Symbol("free")] = safeString(entry, "transferable");
            account[Symbol("total")] = safeString(entry, "totalAmount");
            account[Symbol("debt")] = stringAdd(borrow, interest);
        else
            spotAccountFree = safeString(entry, "available");
            contractAccountFree = safeString(entry, "maxTransferOut");
            if functions.ccxtruthy(contractAccountFree != nothing)
                account[Symbol("free")] = contractAccountFree;
                account[Symbol("total")] = safeString(entry, "accountEquity");
            else
                account[Symbol("free")] = spotAccountFree;
                frozen = safeString(entry, "frozen");
                locked = safeString(entry, "locked");
                account[Symbol("used")] = stringAdd(frozen, locked);
            end
        end
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function parseOrderStatus(self::Bitget, status)
    statuses = Dict{Symbol, Any}(
        Symbol("new") => "open",
        Symbol("init") => "open",
        Symbol("not_trigger") => "open",
        Symbol("partial_fill") => "open",
        Symbol("partially_fill") => "open",
        Symbol("partially_filled") => "open",
        Symbol("triggered") => "closed",
        Symbol("full_fill") => "closed",
        Symbol("filled") => "closed",
        Symbol("fail_trigger") => "rejected",
        Symbol("cancel") => "canceled",
        Symbol("cancelled") => "canceled",
        Symbol("canceled") => "canceled",
        Symbol("live") => "open",
        Symbol("fail_execute") => "rejected",
        Symbol("executed") => "closed"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Bitget, order; market=nothing)
    errorMessage = safeString(order, "errorMsg");
    if functions.ccxtruthy(errorMessage != nothing)
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "orderId"),
    Symbol("clientOrderId") => safeString2(order, "clientOrderId", "clientOid"),
    Symbol("status") => "rejected"
), market = market)
    end
    posSide = safeString(order, "posSide");
    isContractOrder = (posSide != nothing);
    marketType = functions.ccxtruthy(isContractOrder) ? "contract" : "spot";
    if functions.ccxtruthy(market != nothing)
        marketType = get(market, Symbol("type"), nothing);
    end
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = marketType);
    timestamp = safeIntegerN(order, ["cTime", "ctime", "createdTime"]);
    updateTimestamp = safeInteger2(order, "uTime", "updatedTime");
    rawStatus = safeStringN(order, ["status", "state", "orderStatus", "planStatus"]);
    fee = nothing;
    feeCostString = safeString(order, "fee");
    if functions.ccxtruthy(feeCostString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(stringNeg(feeCostString)),
            Symbol("currency") => get(market, Symbol("settle"), nothing)
        );
    end
    feeDetail = safeValue(order, "feeDetail");
    uta = safeString(order, "category") != nothing;
    if functions.ccxtruthy(uta)
        feeResult = self.safeDict(feeDetail, 0, defaultValue = Dict{Symbol, Any}());
        utaFee = safeString(feeResult, "fee");
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(stringNeg(utaFee)),
            Symbol("currency") => get(market, Symbol("settle"), nothing)
        );
    else
        if functions.ccxtruthy(feeDetail != nothing)
            parsedFeeDetail = functions.ccxt_json_parse(feeDetail);
            feeValues = objectValues(parsedFeeDetail);
            feeObject = nothing;
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(feeValues)))
                feeValue = get(feeValues, i + 1, nothing);
                if functions.ccxtruthy(safeValue(feeValue, "feeCoinCode") != nothing)
                    feeObject = feeValue;
                    break
                end
                i += 1
            end

            fee = Dict{Symbol, Any}(
                Symbol("cost") => self.parseNumber(stringNeg(safeString(feeObject, "totalFee"))),
                Symbol("currency") => self.safeCurrencyCode(safeString(feeObject, "feeCoinCode"))
            );
        end
    end
    postOnly = nothing;
    timeInForce = safeStringUpper2(order, "force", "timeInForce");
    if functions.ccxtruthy(timeInForce == "POST_ONLY")
        postOnly = true;
        timeInForce = "PO";
    end
    reduceOnly = nothing;
    reduceOnlyRaw = safeString(order, "reduceOnly");
    if functions.ccxtruthy(reduceOnlyRaw != nothing)
        reduceOnly = functions.ccxtruthy((reduceOnlyRaw == "NO")) ? false : true;
    end
    price = nothing;
    average = nothing;
    basePrice = safeString(order, "basePrice");
    if functions.ccxtruthy(basePrice != nothing)
        price = safeString(order, "priceAvg");
        average = safeString(order, "basePrice");
    else
        price = safeStringN(order, ["price", "executePrice", "slLimitPrice", "tpLimitPrice"]);
        average = safeString(order, "priceAvg");
    end
    size_var = nothing;
    filled = nothing;
    baseSize = safeString(order, "baseSize");
    if functions.ccxtruthy(baseSize != nothing)
        size_var = baseSize;
        filled = safeString(order, "size");
    else
        size_var = safeString2(order, "size", "qty");
        filled = safeString2(order, "baseVolume", "cumExecQty");
    end
    side = safeString(order, "side");
    posMode = safeString(order, "posMode");
    if functions.ccxtruthy(@functions.ccxt_and(posMode == "hedge_mode", reduceOnly))
        side = functions.ccxtruthy((side == "buy")) ? "sell" : "buy";
    end
    orderType = safeString(order, "orderType");
    isBuyMarket = @functions.ccxt_and((side == "buy"), (orderType == "market"));
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), isBuyMarket))
        size_var = safeString(order, "baseVolume");
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString2(order, "orderId", "data"),
    Symbol("clientOrderId") => safeString2(order, "clientOrderId", "clientOid"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => updateTimestamp,
    Symbol("lastUpdateTimestamp") => updateTimestamp,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => orderType,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => size_var,
    Symbol("cost") => safeString2(order, "quoteVolume", "quoteSize"),
    Symbol("average") => average,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => reduceOnly,
    Symbol("triggerPrice") => self.safeNumber(order, "triggerPrice"),
    Symbol("takeProfitPrice") => self.safeNumberN(order, ["presetStopSurplusPrice", "stopSurplusTriggerPrice", "takeProfit"]),
    Symbol("stopLossPrice") => self.safeNumberN(order, ["presetStopLossPrice", "stopLossTriggerPrice", "stopLoss"]),
    Symbol("status") => self.parseOrderStatus(rawStatus),
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market = market)

end
"""
create a market buy order by providing the symbol and cost
see: https://www.bitget.com/api-doc/spot/trade/Place-Order
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Bitget, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    req = Dict{Symbol, Any}(
        Symbol("createMarketBuyOrderRequiresPrice") => false
    );
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, price = nothing, params = extend(req, params)))

end
"""
create a trade order
see: https://www.bitget.com/api-doc/spot/trade/Place-Order
see: https://www.bitget.com/api-doc/spot/plan/Place-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Place-Order
see: https://www.bitget.com/api-doc/contract/plan/Place-Tpsl-Order
see: https://www.bitget.com/api-doc/contract/plan/Place-Plan-Order
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order
see: https://www.bitget.com/api-doc/uta/trade/Place-Order
see: https://www.bitget.com/api-doc/uta/strategy/Place-Strategy-Order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders, and used as the execution price for contract stop-loss / take-profit orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cost`::float, optional: *spot only* how much you want to trade in units of the quote currency, for market buy orders only
- `params.triggerPrice`::float, optional: *swap only* The price at which a trigger order is triggered at
- `params.stopLossPrice`::float, optional: *swap only* The price at which a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: *swap only* The price at which a take profit order is triggered at
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
- `params.takeProfit.triggerPrice`::float, optional: *swap only* take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
- `params.stopLoss.triggerPrice`::float, optional: *swap only* stop loss trigger price
- `params.timeInForce`::string, optional: "GTC", "IOC", "FOK", or "PO"
- `params.marginMode`::string, optional: 'isolated' or 'cross' for spot margin trading
- `params.loanType`::string, optional: *spot margin only* 'normal', 'autoLoan', 'autoRepay', or 'autoLoanAndRepay' default is 'normal'
- `params.holdSide`::string, optional: *contract stopLossPrice, takeProfitPrice only* Two-way position: ('long' or 'short'), one-way position: ('buy' or 'sell')
- `params.stopLoss.price`::float, optional: *swap only* the execution price for a stop loss attached to a trigger order
- `params.takeProfit.price`::float, optional: *swap only* the execution price for a take profit attached to a trigger order
- `params.stopLoss.type`::string, optional: *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
- `params.takeProfit.type`::string, optional: *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
- `params.trailingPercent`::string, optional: *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10
- `params.trailingTriggerPrice`::string, optional: *swap and future only* the price to trigger a trailing stop order, default uses the price argument
- `params.triggerType`::string, optional: *swap and future only* 'fill_price', 'mark_price' or 'index_price'
- `params.oneWayMode`::bool, optional: *swap and future only* required to set this to true in one_way_mode and you can leave this as undefined in hedge_mode, can adjust the mode using the setPositionMode() method
- `params.hedged`::bool, optional: *swap and future only* true for hedged mode, false for one way mode, default is false
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce-only
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.posSide`::string, optional: *uta only* hedged two-way position side, long or short

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Bitget, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginParams = self.handleMarginModeAndParams("createOrder", params = params);
    marginMode = get(marginParams, 1, nothing);
    triggerPrice = safeValue2(params, "stopPrice", "triggerPrice");
    stopLossTriggerPrice = safeValue(params, "stopLossPrice");
    takeProfitTriggerPrice = safeValue(params, "takeProfitPrice");
    trailingPercent = safeString2(params, "trailingPercent", "callbackRatio");
    isTrailingPercentOrder = trailingPercent != nothing;
    isTriggerOrder = triggerPrice != nothing;
    isStopLossTriggerOrder = stopLossTriggerPrice != nothing;
    isTakeProfitTriggerOrder = takeProfitTriggerPrice != nothing;
    isStopLossOrTakeProfitTrigger = @functions.ccxt_or(isStopLossTriggerOrder, isTakeProfitTriggerOrder);
    response = nothing;
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "createOrder", defaultValue = false));
    if functions.ccxtruthy(uta)
        request = self.createUtaOrderRequest(symbol, type_var, side, amount, price = price, params = params);
        if functions.ccxtruthy(isStopLossOrTakeProfitTrigger)
            response = Base.fetch(self.privateUtaPostV3TradePlaceStrategyOrder(request));
        else
            response = Base.fetch(self.privateUtaPostV3TradePlaceOrder(request));
        end
    else
        request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            if functions.ccxtruthy(isTriggerOrder)
                response = Base.fetch(self.privateSpotPostV2SpotTradePlacePlanOrder(request));
            elseif functions.ccxtruthy(marginMode == "isolated")
                response = Base.fetch(self.privateMarginPostV2MarginIsolatedPlaceOrder(request));
            else
                if functions.ccxtruthy(marginMode == "cross")
                    response = Base.fetch(self.privateMarginPostV2MarginCrossedPlaceOrder(request));
                else
                    response = Base.fetch(self.privateSpotPostV2SpotTradePlaceOrder(request));
                end

            end
        else
            if functions.ccxtruthy(@functions.ccxt_or(isTriggerOrder, isTrailingPercentOrder))
                response = Base.fetch(self.privateMixPostV2MixOrderPlacePlanOrder(request));
            elseif functions.ccxtruthy(isStopLossOrTakeProfitTrigger)
                response = Base.fetch(self.privateMixPostV2MixOrderPlaceTpslOrder(request));
            else
                response = Base.fetch(self.privateMixPostV2MixOrderPlaceOrder(request));
            end
        end
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function createUtaOrderRequest(self::Bitget, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    if functions.ccxtruthy(productType == "SPOT")
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params);
        if functions.ccxtruthy(marginMode != nothing)
            productType = "MARGIN";
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("category") => productType,
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("qty") => self.amountToPrecision(symbol, amount),
        Symbol("side") => side
    );
    clientOrderId = safeString2(params, "clientOid", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOid")] = clientOrderId;
        params = omit(params, "clientOrderId");
    end
    stopLossTriggerPrice = self.safeNumber(params, "stopLossPrice");
    takeProfitTriggerPrice = self.safeNumber(params, "takeProfitPrice");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    hasStopLoss = stopLoss != nothing;
    hasTakeProfit = takeProfit != nothing;
    isStopLossTrigger = stopLossTriggerPrice != nothing;
    isTakeProfitTrigger = takeProfitTriggerPrice != nothing;
    isStopLossOrTakeProfitTrigger = @functions.ccxt_or(isStopLossTrigger, isTakeProfitTrigger);
    if functions.ccxtruthy(isStopLossOrTakeProfitTrigger)
        if functions.ccxtruthy(isStopLossTrigger)
            slType = safeString(params, "slTriggerBy", "mark");
            request[Symbol("slTriggerBy")] = slType;
            request[Symbol("stopLoss")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
            if functions.ccxtruthy(price != nothing)
                request[Symbol("slLimitPrice")] = self.priceToPrecision(symbol, price);
                request[Symbol("slOrderType")] = safeString(params, "slOrderType", "limit");
            else
                request[Symbol("slOrderType")] = safeString(params, "slOrderType", "market");
            end
        elseif functions.ccxtruthy(isTakeProfitTrigger)
            tpType = safeString(params, "tpTriggerBy", "mark");
            request[Symbol("tpTriggerBy")] = tpType;
            request[Symbol("takeProfit")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
            if functions.ccxtruthy(price != nothing)
                request[Symbol("tpLimitPrice")] = self.priceToPrecision(symbol, price);
                request[Symbol("tpOrderType")] = safeString(params, "tpOrderType", "limit");
            else
                request[Symbol("tpOrderType")] = safeString(params, "tpOrderType", "market");
            end
        end
        params = omit(params, ["stopLossPrice", "takeProfitPrice"]);
    else
        if functions.ccxtruthy(hasStopLoss)
            slTriggerPrice = self.safeNumber2(stopLoss, "triggerPrice", "stopPrice");
            slLimitPrice = self.safeNumber(stopLoss, "price");
            request[Symbol("stopLoss")] = self.priceToPrecision(symbol, slTriggerPrice);
            if functions.ccxtruthy(slLimitPrice != nothing)
                request[Symbol("slLimitPrice")] = self.priceToPrecision(symbol, slLimitPrice);
                request[Symbol("slOrderType")] = safeString(params, "slOrderType", "limit");
            else
                request[Symbol("slOrderType")] = safeString(params, "slOrderType", "market");
            end
        end
        if functions.ccxtruthy(hasTakeProfit)
            tpTriggerPrice = self.safeNumber2(takeProfit, "triggerPrice", "stopPrice");
            tpLimitPrice = self.safeNumber(takeProfit, "price");
            request[Symbol("takeProfit")] = self.priceToPrecision(symbol, tpTriggerPrice);
            if functions.ccxtruthy(tpLimitPrice != nothing)
                request[Symbol("tpLimitPrice")] = self.priceToPrecision(symbol, tpLimitPrice);
                request[Symbol("tpOrderType")] = safeString(params, "tpOrderType", "limit");
            else
                request[Symbol("tpOrderType")] = safeString(params, "tpOrderType", "market");
            end
        end
        isMarketOrder = type_var == "market";
        if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        end
        request[Symbol("orderType")] = type_var;
        exchangeSpecificTifParam = safeString(params, "timeInForce");
        postOnly = nothing;
        (postOnly, params) = self.handlePostOnly(isMarketOrder, exchangeSpecificTifParam == "post_only", params = params);
        timeInForce = nothing;
        (timeInForce, params) = self.handleOptionAndParams(params, "createOrder", "timeInForce");
        if functions.ccxtruthy(timeInForce != nothing)
            timeInForce = uppercase(timeInForce);
        end
        if functions.ccxtruthy(postOnly)
            request[Symbol("timeInForce")] = "post_only";
        elseif functions.ccxtruthy(timeInForce == "GTC")
            request[Symbol("timeInForce")] = "gtc";
        else
            if functions.ccxtruthy(timeInForce == "FOK")
                request[Symbol("timeInForce")] = "fok";
            elseif functions.ccxtruthy(timeInForce == "IOC")
                request[Symbol("timeInForce")] = "ioc";
            end

        end
    end
    reduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
    hedged = nothing;
    (hedged, params) = self.handleParamBool(params, "hedged", defaultValue = false);
    if functions.ccxtruthy(reduceOnly)
        if functions.ccxtruthy(@functions.ccxt_or(hedged, isStopLossOrTakeProfitTrigger))
            reduceOnlyPosSide = functions.ccxtruthy((side == "sell")) ? "long" : "short";
            request[Symbol("posSide")] = reduceOnlyPosSide;
        elseif functions.ccxtruthy(!functions.ccxtruthy(isStopLossOrTakeProfitTrigger))
            request[Symbol("reduceOnly")] = "yes";
        end
    else
        if functions.ccxtruthy(hedged)
            posSide = functions.ccxtruthy((side == "buy")) ? "long" : "short";
            request[Symbol("posSide")] = posSide;
        end
    end
    params = omit(params, ["stopLoss", "takeProfit", "postOnly", "reduceOnly", "hedged"]);
    return extend(request, params)

end
function createOrderRequest(self::Bitget, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    marketType = nothing;
    marginMode = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("createOrder", market = market, params = params);
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("orderType") => type_var
    );
    hedged = nothing;
    (hedged, params) = self.handleParamBool(params, "hedged", defaultValue = false);
    oneWayMode = nothing;
    (oneWayMode, params) = self.handleParamBool(params, "oneWayMode");
    if functions.ccxtruthy(oneWayMode != nothing)
        hedged = !functions.ccxtruthy(oneWayMode);
    end
    isMarketOrder = type_var == "market";
    triggerPrice = safeValue2(params, "stopPrice", "triggerPrice");
    stopLossTriggerPrice = safeValue(params, "stopLossPrice");
    takeProfitTriggerPrice = safeValue(params, "takeProfitPrice");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    isTriggerOrder = triggerPrice != nothing;
    isStopLossTriggerOrder = stopLossTriggerPrice != nothing;
    isTakeProfitTriggerOrder = takeProfitTriggerPrice != nothing;
    hasStopLoss = stopLoss != nothing;
    hasTakeProfit = takeProfit != nothing;
    isStopLossOrTakeProfitTrigger = @functions.ccxt_or(isStopLossTriggerOrder, isTakeProfitTriggerOrder);
    isStopLossOrTakeProfit = @functions.ccxt_or(hasStopLoss, hasTakeProfit);
    trailingTriggerPrice = safeString(params, "trailingTriggerPrice", numberToString(price));
    trailingPercent = safeString2(params, "trailingPercent", "callbackRatio");
    isTrailingPercentOrder = trailingPercent != nothing;
    if functions.ccxtruthy(functions.ccxt_gt(self.sum(isTriggerOrder, isStopLossTriggerOrder, isTakeProfitTriggerOrder, isTrailingPercentOrder), 1))
        throw(ExchangeError(string(self.id, " createOrder() params can only contain one of triggerPrice, stopLossPrice, takeProfitPrice, trailingPercent")));
    end
    if functions.ccxtruthy(type_var == "limit")
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    triggerPriceType = safeString2(params, "triggerPriceType", "triggerType", "mark_price");
    reduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
    clientOrderId = safeString2(params, "clientOid", "clientOrderId");
    exchangeSpecificTifParam = safeString2(params, "force", "timeInForce");
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(isMarketOrder, exchangeSpecificTifParam == "post_only", params = params);
    timeInForce = nothing;
    (timeInForce, params) = self.handleOptionAndParams(params, "createOrder", "timeInForce");
    if functions.ccxtruthy(timeInForce != nothing)
        timeInForce = uppercase(timeInForce);
    end
    if functions.ccxtruthy(postOnly)
        request[Symbol("force")] = "post_only";
    elseif functions.ccxtruthy(timeInForce == "GTC")
        request[Symbol("force")] = "GTC";
    else
        if functions.ccxtruthy(timeInForce == "FOK")
            request[Symbol("force")] = "FOK";
        elseif functions.ccxtruthy(timeInForce == "IOC")
            request[Symbol("force")] = "IOC";
        end

    end
    params = omit(params, ["stopPrice", "triggerType", "stopLossPrice", "takeProfitPrice", "stopLoss", "takeProfit", "postOnly", "reduceOnly", "clientOrderId", "trailingPercent", "trailingTriggerPrice"]);
    if functions.ccxtruthy(@functions.ccxt_or((marketType == "swap"), (marketType == "future")))
        request[Symbol("marginCoin")] = get(market, Symbol("settleId"), nothing);
        request[Symbol("size")] = self.amountToPrecision(symbol, amount);
        productType = nothing;
        (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
        request[Symbol("productType")] = productType;
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("clientOid")] = clientOrderId;
        end
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isTriggerOrder, isStopLossOrTakeProfitTrigger), isTrailingPercentOrder))
            request[Symbol("triggerType")] = triggerPriceType;
        end
        if functions.ccxtruthy(isTrailingPercentOrder)
            if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
                throw(BadRequest(string(self.id, " createOrder() bitget trailing orders must be market orders")));
            end
            if functions.ccxtruthy(trailingTriggerPrice == nothing)
                throw(ArgumentsRequired(string(self.id, " createOrder() bitget trailing orders must have a trailingTriggerPrice param")));
            end
            request[Symbol("planType")] = "track_plan";
            request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, trailingTriggerPrice);
            request[Symbol("callbackRatio")] = trailingPercent;
        elseif functions.ccxtruthy(isTriggerOrder)
            request[Symbol("planType")] = "normal_plan";
            request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
            if functions.ccxtruthy(price != nothing)
                request[Symbol("executePrice")] = self.priceToPrecision(symbol, price);
            end
            if functions.ccxtruthy(hasStopLoss)
                slTriggerPrice = safeString2(stopLoss, "triggerPrice", "stopPrice");
                request[Symbol("stopLossTriggerPrice")] = self.priceToPrecision(symbol, slTriggerPrice);
                slPrice = safeString(stopLoss, "price");
                request[Symbol("stopLossExecutePrice")] = self.priceToPrecision(symbol, slPrice);
                slType = safeString(stopLoss, "type", "mark_price");
                request[Symbol("stopLossTriggerType")] = slType;
            end
            if functions.ccxtruthy(hasTakeProfit)
                tpTriggerPrice = safeString2(takeProfit, "triggerPrice", "stopPrice");
                request[Symbol("stopSurplusTriggerPrice")] = self.priceToPrecision(symbol, tpTriggerPrice);
                tpPrice = safeString(takeProfit, "price");
                request[Symbol("stopSurplusExecutePrice")] = self.priceToPrecision(symbol, tpPrice);
                tpType = safeString(takeProfit, "type", "mark_price");
                request[Symbol("stopSurplusTriggerType")] = tpType;
            end
        else
            if functions.ccxtruthy(isStopLossOrTakeProfitTrigger)
                if functions.ccxtruthy(price != nothing)
                    request[Symbol("executePrice")] = self.priceToPrecision(symbol, price);
                    if functions.ccxtruthy(ccxt_in("price", request))
                                                delete!(request, :price);
                    end
                end
                if functions.ccxtruthy(hedged)
                    request[Symbol("holdSide")] = functions.ccxtruthy((side == "sell")) ? "long" : "short";
                else
                    request[Symbol("holdSide")] = functions.ccxtruthy((side == "sell")) ? "buy" : "sell";
                end
                if functions.ccxtruthy(isStopLossTriggerOrder)
                    request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
                    request[Symbol("planType")] = "pos_loss";
                elseif functions.ccxtruthy(isTakeProfitTriggerOrder)
                    request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
                    request[Symbol("planType")] = "pos_profit";
                end
            else
                if functions.ccxtruthy(hasStopLoss)
                    slTriggerPrice = safeValue2(stopLoss, "triggerPrice", "stopPrice");
                    if functions.ccxtruthy(slTriggerPrice == nothing)
                        throw(ArgumentsRequired(string(self.id, " createOrder() requires a triggerPrice or a stopPrice inside the stopLoss parameter")));
                    end
                    request[Symbol("presetStopLossPrice")] = self.priceToPrecision(symbol, slTriggerPrice);
                    slLimitPrice = safeValue(stopLoss, "price");
                    if functions.ccxtruthy(slLimitPrice != nothing)
                        request[Symbol("presetStopLossExecutePrice")] = self.priceToPrecision(symbol, slLimitPrice);
                    end
                end
                if functions.ccxtruthy(hasTakeProfit)
                    tpTriggerPrice = safeValue2(takeProfit, "triggerPrice", "stopPrice");
                    if functions.ccxtruthy(tpTriggerPrice == nothing)
                        throw(ArgumentsRequired(string(self.id, " createOrder() requires a triggerPrice or a stopPrice inside the takeProfit parameter")));
                    end
                    request[Symbol("presetStopSurplusPrice")] = self.priceToPrecision(symbol, tpTriggerPrice);
                    tpLimitPrice = safeValue(takeProfit, "price");
                    if functions.ccxtruthy(tpLimitPrice != nothing)
                        request[Symbol("presetStopSurplusExecutePrice")] = self.priceToPrecision(symbol, tpLimitPrice);
                    end
                end
            end

        end
        if functions.ccxtruthy(!functions.ccxtruthy(isStopLossOrTakeProfitTrigger))
            if functions.ccxtruthy(marginMode == nothing)
                marginMode = "cross";
            end
            marginModeRequest = functions.ccxtruthy((marginMode == "cross")) ? "crossed" : "isolated";
            request[Symbol("marginMode")] = marginModeRequest;
            requestSide = side;
            if functions.ccxtruthy(reduceOnly)
                if functions.ccxtruthy(!functions.ccxtruthy(hedged))
                    request[Symbol("reduceOnly")] = "YES";
                else
                    requestSide = functions.ccxtruthy((side == "buy")) ? "sell" : "buy";
                    request[Symbol("tradeSide")] = "Close";
                end
            else
                if functions.ccxtruthy(hedged)
                    request[Symbol("tradeSide")] = "Open";
                end
            end
            request[Symbol("side")] = requestSide;
        end
    elseif functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(@functions.ccxt_or(isStopLossOrTakeProfitTrigger, isStopLossOrTakeProfit))
            throw(InvalidOrder(string(self.id, " createOrder() does not support stop loss/take profit orders on spot markets, only swap markets")));
        end
        request[Symbol("side")] = side;
        quantity = nothing;
        planType = nothing;
        createMarketBuyOrderRequiresPrice = true;
        (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", defaultValue = true);
        if functions.ccxtruthy(@functions.ccxt_and(isMarketOrder, (side == "buy")))
            planType = "total";
            cost = self.safeNumber(params, "cost");
            params = omit(params, "cost");
            if functions.ccxtruthy(cost != nothing)
                quantity = self.costToPrecision(symbol, cost);
            elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(price == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice in options[\"createOrder\"] or params to false and pass the cost to spend in the amount argument")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    quoteAmount = stringMul(amountString, priceString);
                    quantity = self.costToPrecision(symbol, quoteAmount);
                end
            else
                quantity = self.costToPrecision(symbol, amount);
            end
        else
            planType = "amount";
            quantity = self.amountToPrecision(symbol, amount);
        end
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("clientOid")] = clientOrderId;
        end
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("loanType")] = "normal";
            if functions.ccxtruthy(@functions.ccxt_and(isMarketOrder, (side == "buy")))
                request[Symbol("quoteSize")] = quantity;
            else
                request[Symbol("baseSize")] = quantity;
            end
        else
            if functions.ccxtruthy(quantity != nothing)
                request[Symbol("size")] = quantity;
            end
            if functions.ccxtruthy(triggerPrice != nothing)
                request[Symbol("planType")] = planType;
                request[Symbol("triggerType")] = triggerPriceType;
                request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
                if functions.ccxtruthy(price != nothing)
                    request[Symbol("executePrice")] = self.priceToPrecision(symbol, price);
                end
            end
        end
    else
        throw(NotSupported(string(self.id, " createOrder() does not support ", marketType, " orders")));
    end
    return extend(request, params)

end
function createUtaOrders(self::Bitget, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    symbol = nothing;
    marginMode = nothing;
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
        marginResult = self.handleMarginModeAndParams("createOrders", params = orderParams);
        currentMarginMode = get(marginResult, 1, nothing);
        if functions.ccxtruthy(currentMarginMode != nothing)
            if functions.ccxtruthy(marginMode == nothing)
                marginMode = currentMarginMode;
            else
                if functions.ccxtruthy(marginMode != currentMarginMode)
                    throw(BadRequest(string(self.id, " createOrders() requires all orders to have the same margin mode (isolated or cross)")));
                end
            end
        end
        orderRequest = self.createUtaOrderRequest(marketId, type_var, side, amount, price = price, params = orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    market = self.market(symbol);
    response = Base.fetch(self.privateUtaPostV3TradePlaceBatch(ordersRequests));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market)

end
"""
create a list of trade orders (all orders should be of the same symbol)
see: https://www.bitget.com/api-doc/spot/trade/Batch-Place-Orders
see: https://www.bitget.com/api-doc/contract/trade/Batch-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Order
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Order
see: https://www.bitget.com/api-doc/uta/trade/Place-Batch

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the api endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Bitget, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "createOrders", defaultValue = false));
    if functions.ccxtruthy(uta)
            return Base.fetch(self.createUtaOrders(orders, params = params))
    end
    ordersRequests = [];
    symbol = nothing;
    marginMode = nothing;
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
        marginResult = self.handleMarginModeAndParams("createOrders", params = orderParams);
        currentMarginMode = get(marginResult, 1, nothing);
        if functions.ccxtruthy(currentMarginMode != nothing)
            if functions.ccxtruthy(marginMode == nothing)
                marginMode = currentMarginMode;
            else
                if functions.ccxtruthy(marginMode != currentMarginMode)
                    throw(BadRequest(string(self.id, " createOrders() requires all orders to have the same margin mode (isolated or cross)")));
                end
            end
        end
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price = price, params = orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("orderList") => ordersRequests
    );
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((get(market, Symbol("swap"), nothing)), (get(market, Symbol("future"), nothing))))
        if functions.ccxtruthy(marginMode == nothing)
            marginMode = "cross";
        end
        marginModeRequest = functions.ccxtruthy((marginMode == "cross")) ? "crossed" : "isolated";
        request[Symbol("marginMode")] = marginModeRequest;
        request[Symbol("marginCoin")] = get(market, Symbol("settleId"), nothing);
        productType = nothing;
        (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixPostV2MixOrderBatchPlaceOrder(request));
    elseif functions.ccxtruthy(marginMode == "isolated")
        response = Base.fetch(self.privateMarginPostV2MarginIsolatedBatchPlaceOrder(request));
    else
        if functions.ccxtruthy(marginMode == "cross")
            response = Base.fetch(self.privateMarginPostV2MarginCrossedBatchPlaceOrder(request));
        else
            response = Base.fetch(self.privateSpotPostV2SpotTradeBatchOrders(request));
        end

    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    failure = safeValue(data, "failureList", []);
    orderInfo = safeValue(data, "successList", []);
    both = arrayConcat(orderInfo, failure);
    return self.parseOrders(both, market = market)

end
"""
edit a trade order
see: https://www.bitget.com/api-doc/spot/plan/Modify-Plan-Order
see: https://www.bitget.com/api-doc/spot/trade/Cancel-Replace-Order
see: https://www.bitget.com/api-doc/contract/trade/Modify-Order
see: https://www.bitget.com/api-doc/contract/plan/Modify-Tpsl-Order
see: https://www.bitget.com/api-doc/contract/plan/Modify-Plan-Order
see: https://www.bitget.com/api-doc/uta/trade/Modify-Order
see: https://www.bitget.com/api-doc/uta/strategy/Modify-Strategy-Order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price that a trigger order is triggered at
- `params.stopLossPrice`::float, optional: *swap only* The price at which a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: *swap only* The price at which a take profit order is triggered at
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
- `params.takeProfit.triggerPrice`::float, optional: *swap only* take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
- `params.stopLoss.triggerPrice`::float, optional: *swap only* stop loss trigger price
- `params.stopLoss.price`::float, optional: *swap only* the execution price for a stop loss attached to a trigger order
- `params.takeProfit.price`::float, optional: *swap only* the execution price for a take profit attached to a trigger order
- `params.stopLoss.type`::string, optional: *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
- `params.takeProfit.type`::string, optional: *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
- `params.trailingPercent`::string, optional: *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10
- `params.trailingTriggerPrice`::string, optional: *swap and future only* the price to trigger a trailing stop order, default uses the price argument
- `params.newTriggerType`::string, optional: *swap and future only* 'fill_price', 'mark_price' or 'index_price'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Bitget, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOrderId", "clientOid");
    if functions.ccxtruthy(clientOrderId != nothing)
        params = omit(params, ["clientOrderId"]);
        request[Symbol("clientOid")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    isMarketOrder = type_var == "market";
    triggerPrice = safeValue2(params, "stopPrice", "triggerPrice");
    isTriggerOrder = triggerPrice != nothing;
    stopLossPrice = safeValue(params, "stopLossPrice");
    isStopLossOrder = stopLossPrice != nothing;
    takeProfitPrice = safeValue(params, "takeProfitPrice");
    isTakeProfitOrder = takeProfitPrice != nothing;
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    hasStopLoss = stopLoss != nothing;
    hasTakeProfit = takeProfit != nothing;
    trailingTriggerPrice = safeString(params, "trailingTriggerPrice", numberToString(price));
    trailingPercent = safeString2(params, "trailingPercent", "newCallbackRatio");
    isTrailingPercentOrder = trailingPercent != nothing;
    if functions.ccxtruthy(functions.ccxt_gt(self.sum(isTriggerOrder, isStopLossOrder, isTakeProfitOrder, isTrailingPercentOrder), 1))
        throw(ExchangeError(string(self.id, " editOrder() params can only contain one of triggerPrice, stopLossPrice, takeProfitPrice, trailingPercent")));
    end
    params = omit(params, ["stopPrice", "triggerType", "stopLossPrice", "takeProfitPrice", "stopLoss", "takeProfit", "clientOrderId", "trailingTriggerPrice", "trailingPercent"]);
    response = nothing;
    productType = nothing;
    uta = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "editOrder", defaultValue = false));
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(amount != nothing)
            request[Symbol("qty")] = self.amountToPrecision(symbol, amount);
        end
        if functions.ccxtruthy(@functions.ccxt_or(isStopLossOrder, isTakeProfitOrder))
            if functions.ccxtruthy(isStopLossOrder)
                slType = safeString(params, "slTriggerBy", "mark");
                request[Symbol("slTriggerBy")] = slType;
                request[Symbol("stopLoss")] = self.priceToPrecision(symbol, stopLossPrice);
                if functions.ccxtruthy(price != nothing)
                    request[Symbol("slLimitPrice")] = self.priceToPrecision(symbol, price);
                    request[Symbol("slOrderType")] = safeString(params, "slOrderType", "limit");
                else
                    request[Symbol("slOrderType")] = safeString(params, "slOrderType", "market");
                end
            elseif functions.ccxtruthy(isTakeProfitOrder)
                tpType = safeString(params, "tpTriggerBy", "mark");
                request[Symbol("tpTriggerBy")] = tpType;
                request[Symbol("takeProfit")] = self.priceToPrecision(symbol, takeProfitPrice);
                if functions.ccxtruthy(price != nothing)
                    request[Symbol("tpLimitPrice")] = self.priceToPrecision(symbol, price);
                    request[Symbol("tpOrderType")] = safeString(params, "tpOrderType", "limit");
                else
                    request[Symbol("tpOrderType")] = safeString(params, "tpOrderType", "market");
                end
            end
            params = omit(params, ["stopLossPrice", "takeProfitPrice"]);
            response = Base.fetch(self.privateUtaPostV3TradeModifyStrategyOrder(extend(request, params)));
        else
            if functions.ccxtruthy(price != nothing)
                request[Symbol("price")] = self.priceToPrecision(symbol, price);
            end
            response = Base.fetch(self.privateUtaPostV3TradeModifyOrder(extend(request, params)));
        end
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        cost = safeString(params, "cost");
        params = omit(params, "cost");
        editMarketBuyOrderRequiresPrice = self.safeBool(self.options, "editMarketBuyOrderRequiresPrice", defaultValue = true);
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((@functions.ccxt_or(editMarketBuyOrderRequiresPrice, (cost != nothing))), isMarketOrder), (side == "buy")))
            if functions.ccxtruthy(@functions.ccxt_and(price == nothing, cost == nothing))
                throw(InvalidOrder(string(self.id, " editOrder() requires price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively provide `cost` in the params")));
            else
                amountString = numberToString(amount);
                priceString = numberToString(price);
                finalCost = functions.ccxtruthy((cost == nothing)) ? (stringMul(amountString, priceString)) : cost;
                request[Symbol("size")] = self.priceToPrecision(symbol, finalCost);
            end
        else
            request[Symbol("size")] = self.amountToPrecision(symbol, amount);
        end
        request[Symbol("orderType")] = type_var;
        if functions.ccxtruthy(triggerPrice != nothing)
            request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
            if functions.ccxtruthy(price != nothing)
                request[Symbol("executePrice")] = self.priceToPrecision(symbol, price);
            end
        else
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        end
        if functions.ccxtruthy(triggerPrice != nothing)
            response = Base.fetch(self.privateSpotPostV2SpotTradeModifyPlanOrder(extend(request, params)));
        else
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
            response = Base.fetch(self.privateSpotPostV2SpotTradeCancelReplaceOrder(extend(request, params)));
        end
    else
        if functions.ccxtruthy(@functions.ccxt_and((!functions.ccxtruthy(get(market, Symbol("swap"), nothing))), (!functions.ccxtruthy(get(market, Symbol("future"), nothing)))))
            throw(NotSupported(string(self.id, " editOrder() does not support ", get(market, Symbol("type"), nothing), " orders")));
        end
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        request[Symbol("productType")] = productType;
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isTakeProfitOrder), !functions.ccxtruthy(isStopLossOrder)))
            if functions.ccxtruthy(amount != nothing)
                request[Symbol("newSize")] = self.amountToPrecision(symbol, amount);
            end
            if functions.ccxtruthy(@functions.ccxt_and((price != nothing), !functions.ccxtruthy(isTrailingPercentOrder)))
                request[Symbol("newPrice")] = self.priceToPrecision(symbol, price);
            end
        end
        if functions.ccxtruthy(isTrailingPercentOrder)
            if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
                throw(BadRequest(string(self.id, " editOrder() bitget trailing orders must be market orders")));
            end
            if functions.ccxtruthy(trailingTriggerPrice != nothing)
                request[Symbol("newTriggerPrice")] = self.priceToPrecision(symbol, trailingTriggerPrice);
            end
            request[Symbol("newCallbackRatio")] = trailingPercent;
            response = Base.fetch(self.privateMixPostV2MixOrderModifyPlanOrder(extend(request, params)));
        elseif functions.ccxtruthy(@functions.ccxt_or(isTakeProfitOrder, isStopLossOrder))
            request[Symbol("marginCoin")] = get(market, Symbol("settleId"), nothing);
            request[Symbol("size")] = self.amountToPrecision(symbol, amount);
            if functions.ccxtruthy(price != nothing)
                request[Symbol("executePrice")] = self.priceToPrecision(symbol, price);
            end
            if functions.ccxtruthy(isStopLossOrder)
                request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, stopLossPrice);
            elseif functions.ccxtruthy(isTakeProfitOrder)
                request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, takeProfitPrice);
            end
            response = Base.fetch(self.privateMixPostV2MixOrderModifyTpslOrder(extend(request, params)));
        else
            if functions.ccxtruthy(isTriggerOrder)
                request[Symbol("newTriggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
                if functions.ccxtruthy(hasStopLoss)
                    slTriggerPrice = self.safeNumber2(stopLoss, "triggerPrice", "stopPrice");
                    request[Symbol("newStopLossTriggerPrice")] = self.priceToPrecision(symbol, slTriggerPrice);
                    slPrice = self.safeNumber(stopLoss, "price");
                    request[Symbol("newStopLossExecutePrice")] = self.priceToPrecision(symbol, slPrice);
                    slType = safeString(stopLoss, "type", "mark_price");
                    request[Symbol("newStopLossTriggerType")] = slType;
                end
                if functions.ccxtruthy(hasTakeProfit)
                    tpTriggerPrice = self.safeNumber2(takeProfit, "triggerPrice", "stopPrice");
                    request[Symbol("newSurplusTriggerPrice")] = self.priceToPrecision(symbol, tpTriggerPrice);
                    tpPrice = self.safeNumber(takeProfit, "price");
                    request[Symbol("newStopSurplusExecutePrice")] = self.priceToPrecision(symbol, tpPrice);
                    tpType = safeString(takeProfit, "type", "mark_price");
                    request[Symbol("newStopSurplusTriggerType")] = tpType;
                end
                response = Base.fetch(self.privateMixPostV2MixOrderModifyPlanOrder(extend(request, params)));
            else
                defaultNewClientOrderId = uuid();
                newClientOrderId = safeString2(params, "newClientOid", "newClientOrderId", defaultNewClientOrderId);
                params = omit(params, "newClientOrderId");
                request[Symbol("newClientOid")] = newClientOrderId;
                if functions.ccxtruthy(hasStopLoss)
                    slTriggerPrice = safeValue2(stopLoss, "triggerPrice", "stopPrice");
                    request[Symbol("newPresetStopLossPrice")] = self.priceToPrecision(symbol, slTriggerPrice);
                end
                if functions.ccxtruthy(hasTakeProfit)
                    tpTriggerPrice = safeValue2(takeProfit, "triggerPrice", "stopPrice");
                    request[Symbol("newPresetStopSurplusPrice")] = self.priceToPrecision(symbol, tpTriggerPrice);
                end
                response = Base.fetch(self.privateMixPostV2MixOrderModifyOrder(extend(request, params)));
            end

        end
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
cancels an open order
see: https://www.bitget.com/api-doc/spot/trade/Cancel-Order
see: https://www.bitget.com/api-doc/spot/plan/Cancel-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Cancel-Order
see: https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Cancel-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Cancel-Order
see: https://www.bitget.com/api-doc/uta/trade/Cancel-Order
see: https://www.bitget.com/api-doc/uta/strategy/Cancel-Strategy-Order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'isolated' or 'cross' for spot margin trading
- `params.trigger`::bool, optional: set to true for canceling trigger orders
- `params.planType`::string, optional: *swap only* either profit_plan, loss_plan, normal_plan, pos_profit, pos_loss, moving_plan or track_plan
- `params.trailing`::bool, optional: set to true if you want to cancel a trailing order
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.clientOrderId`::string, optional: the clientOrderId of the order, id does not need to be provided if clientOrderId is provided

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bitget, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = nothing;
    response = Dict{Symbol, Any}();
    (marginMode, params) = self.handleMarginModeAndParams("cancelOrder", params = params);
    request = Dict{Symbol, Any}();
    trailing = safeValue(params, "trailing");
    trigger = safeValue2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger", "trailing"]);
    if functions.ccxtruthy(!functions.ccxtruthy((@functions.ccxt_and(get(market, Symbol("spot"), nothing), trigger))))
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "cancelOrder", defaultValue = false));
    isPlanOrder = @functions.ccxt_or(trigger, trailing);
    isContract = @functions.ccxt_or(get(market, Symbol("swap"), nothing), get(market, Symbol("future"), nothing));
    isContractTriggerEndpoint = @functions.ccxt_and(@functions.ccxt_and(isContract, isPlanOrder), !functions.ccxtruthy(uta));
    clientOrderId = safeString2(params, "clientOrderId", "clientOid");
    if functions.ccxtruthy(isContractTriggerEndpoint)
        orderIdList = [];
        orderId = Dict{Symbol, Any}();
        if functions.ccxtruthy(clientOrderId != nothing)
            params = omit(params, "clientOrderId");
            orderId[Symbol("clientOid")] = clientOrderId;
        else
            orderId[Symbol("orderId")] = id;
        end
                push!(orderIdList, orderId);
        request[Symbol("orderIdList")] = orderIdList;
    else
        if functions.ccxtruthy(clientOrderId != nothing)
            params = omit(params, "clientOrderId");
            request[Symbol("clientOid")] = clientOrderId;
        else
            request[Symbol("orderId")] = id;
        end
    end
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateUtaPostV3TradeCancelStrategyOrder(extend(request, params)));
        else
            response = Base.fetch(self.privateUtaPostV3TradeCancelOrder(extend(request, params)));
        end
    elseif functions.ccxtruthy(@functions.ccxt_or((get(market, Symbol("swap"), nothing)), (get(market, Symbol("future"), nothing))))
        productType = nothing;
        (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
        request[Symbol("productType")] = productType;
        if functions.ccxtruthy(trailing)
            planType = safeString(params, "planType", "track_plan");
            request[Symbol("planType")] = planType;
            response = Base.fetch(self.privateMixPostV2MixOrderCancelPlanOrder(extend(request, params)));
        elseif functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateMixPostV2MixOrderCancelPlanOrder(extend(request, params)));
        else
            response = Base.fetch(self.privateMixPostV2MixOrderCancelOrder(extend(request, params)));
        end
    else
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            if functions.ccxtruthy(marginMode != nothing)
                if functions.ccxtruthy(marginMode == "isolated")
                    response = Base.fetch(self.privateMarginPostV2MarginIsolatedCancelOrder(extend(request, params)));
                elseif functions.ccxtruthy(marginMode == "cross")
                    response = Base.fetch(self.privateMarginPostV2MarginCrossedCancelOrder(extend(request, params)));
                end
            else
                if functions.ccxtruthy(trigger)
                    response = Base.fetch(self.privateSpotPostV2SpotTradeCancelPlanOrder(extend(request, params)));
                else
                    response = Base.fetch(self.privateSpotPostV2SpotTradeCancelOrder(extend(request, params)));
                end
            end
        else
            throw(NotSupported(string(self.id, " cancelOrder() does not support ", get(market, Symbol("type"), nothing), " orders")));
        end

    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    order = Dict{Symbol, Any}();
    if functions.ccxtruthy(isContractTriggerEndpoint)
        orderInfo = safeValue(data, "successList", []);
        order = self.safeDict(orderInfo, 0, defaultValue = Dict{Symbol, Any}());
    else
        if functions.ccxtruthy(@functions.ccxt_and(uta, trigger))
            order = response;
        else
            order = data;
        end
    end
    return self.parseOrder(order, market = market)

end
function cancelUtaOrders(self::Bitget, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    requestList = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        individualId = get(ids, i + 1, nothing);
        order = Dict{Symbol, Any}(
            Symbol("orderId") => individualId,
            Symbol("symbol") => get(market, Symbol("id"), nothing),
            Symbol("category") => productType
        );
        push!(requestList, order);
        i += 1
    end
    response = Base.fetch(self.privateUtaPostV3TradeCancelBatch(requestList));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data, market = market)

end
"""
cancel multiple orders
see: https://www.bitget.com/api-doc/spot/trade/Batch-Cancel-Orders
see: https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
see: https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Cancel-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Cancel-Orders
see: https://www.bitget.com/api-doc/uta/trade/Cancel-Batch

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'isolated' or 'cross' for spot margin trading
- `params.trigger`::bool, optional: *contract only* set to true for canceling trigger orders
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an array of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Bitget, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "cancelOrders", defaultValue = false));
    if functions.ccxtruthy(uta)
            return Base.fetch(self.cancelUtaOrders(ids, symbol = symbol, params = params))
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("cancelOrders", params = params);
    trigger = safeValue2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    orderIdList = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        individualId = get(ids, i + 1, nothing);
        orderId = Dict{Symbol, Any}(
            Symbol("orderId") => individualId
        );
        push!(orderIdList, orderId);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), (marginMode == nothing)))
        request[Symbol("orderList")] = orderIdList;
    else
        request[Symbol("orderIdList")] = orderIdList;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(marginMode != nothing)
            if functions.ccxtruthy(marginMode == "cross")
                response = Base.fetch(self.privateMarginPostV2MarginCrossedBatchCancelOrder(extend(request, params)));
            else
                response = Base.fetch(self.privateMarginPostV2MarginIsolatedBatchCancelOrder(extend(request, params)));
            end
        else
            response = Base.fetch(self.privateSpotPostV2SpotTradeBatchCancelOrder(extend(request, params)));
        end
    else
        productType = nothing;
        (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
        request[Symbol("productType")] = productType;
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateMixPostV2MixOrderCancelPlanOrder(extend(request, params)));
        else
            response = Base.fetch(self.privateMixPostV2MixOrderBatchCancelOrders(extend(request, params)));
        end
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    orders = self.safeList(data, "successList", defaultValue = []);
    return self.parseOrders(orders, market = market)

end
"""
cancel all open orders
see: https://www.bitget.com/api-doc/spot/trade/Cancel-Symbol-Orders
see: https://www.bitget.com/api-doc/spot/plan/Batch-Cancel-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Cancel-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Cancel-Orders

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'isolated' or 'cross' for spot margin trading
- `params.trigger`::bool, optional: *contract only* set to true for canceling trigger orders
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Bitget; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("cancelAllOrders", params = params);
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    response = nothing;
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "cancelAllOrders", defaultValue = false));
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(productType == "SPOT")
            if functions.ccxtruthy(marginMode != nothing)
                productType = "MARGIN";
            end
        end
        request[Symbol("category")] = productType;
        response = Base.fetch(self.privateUtaPostV3TradeCancelSymbolOrder(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(marginMode != nothing)
            throw(NotSupported(string(self.id, " cancelAllOrders() does not support margin markets, you can use cancelOrders() instead")));
        else
            if functions.ccxtruthy(trigger)
                stopRequest = Dict{Symbol, Any}(
                    Symbol("symbolList") => [get(market, Symbol("id"), nothing)]
                );
                response = Base.fetch(self.privateSpotPostV2SpotTradeBatchCancelPlanOrder(extend(stopRequest, params)));
            else
                response = Base.fetch(self.privateSpotPostV2SpotTradeCancelSymbolOrder(extend(request, params)));
            end
            timestamp = safeInteger(response, "requestTime");
            responseData = self.safeDict(response, "data");
            marketId = safeString(responseData, "symbol");
            return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => self.safeSymbol(marketId, market = nothing, delimiter = nothing, marketType = "spot"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))]
        end
    else
        request[Symbol("productType")] = productType;
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateMixPostV2MixOrderCancelPlanOrder(extend(request, params)));
        else
            response = Base.fetch(self.privateMixPostV2MixOrderBatchCancelOrders(extend(request, params)));
        end
    end
    data = self.safeDict(response, "data");
    resultList = self.safeListN(data, ["resultList", "successList", "list"]);
    failureList = self.safeList2(data, "failure", "failureList");
    responseList = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((resultList != nothing), (failureList != nothing)))
        responseList = arrayConcat(resultList, failureList);
    else
        responseList = resultList;
    end
    return self.parseOrders(responseList)

end
"""
fetches information on an order made by the user
see: https://www.bitget.com/api-doc/spot/trade/Get-Order-Info
see: https://www.bitget.com/api-doc/contract/trade/Get-Order-Details
see: https://www.bitget.com/api-doc/uta/trade/Get-Order-Details

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.clientOrderId`::string, optional: the clientOrderId of the order, id does not need to be provided if clientOrderId is provided

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bitget, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOrderId", "clientOid");
    if functions.ccxtruthy(clientOrderId != nothing)
        params = omit(params, ["clientOrderId"]);
        request[Symbol("clientOid")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    response = nothing;
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchOrder", defaultValue = false));
    if functions.ccxtruthy(uta)
        response = Base.fetch(self.privateUtaGetV3TradeOrderInfo(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.privateSpotGetV2SpotTradeOrderInfo(extend(request, params)));
    else
        if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("swap"), nothing), get(market, Symbol("future"), nothing)))
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
            productType = nothing;
            (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
            request[Symbol("productType")] = productType;
            response = Base.fetch(self.privateMixGetV2MixOrderDetail(extend(request, params)));
        else
            throw(NotSupported(string(self.id, " fetchOrder() does not support ", get(market, Symbol("type"), nothing), " orders")));
        end

    end
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(uta), (isa(response, AbstractString))))
        response = functions.ccxt_json_parse(response);
    end
    data = self.safeDict(response, "data");
    if functions.ccxtruthy((data != nothing))
        if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(data)))
                return self.parseOrder(data, market = market)
        end
    end
    dataList = self.safeList(response, "data", defaultValue = []);
    dataListLength = length(dataList);
    if functions.ccxtruthy(dataListLength == 0)
        throw(OrderNotFound(string(self.id, " fetchOrder() could not find order id ", id, " in ", json(response))));
    end
    first_var = self.safeDict(dataList, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(first_var, market = market)

end
"""
fetch all unfilled currently open orders
see: https://www.bitget.com/api-doc/spot/trade/Get-Unfilled-Orders
see: https://www.bitget.com/api-doc/spot/plan/Get-Current-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Get-Orders-Pending
see: https://www.bitget.com/api-doc/contract/plan/get-orders-plan-pending
see: https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Open-Orders
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Open-Orders
see: https://www.bitget.com/api-doc/uta/strategy/Get-Unfilled-Strategy-Orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.planType`::string, optional: *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.isPlan`::string, optional: *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
- `params.trailing`::bool, optional: set to true if you want to fetch trailing orders
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bitget; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    type_var = nothing;
    request = Dict{Symbol, Any}();
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOpenOrders", params = params);
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchOpenOrders", defaultValue = false));
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        defaultType = safeString2(self.options, "fetchOpenOrders", "defaultType", "spot");
        marketType = functions.ccxtruthy((ccxt_in("type", market))) ? get(market, Symbol("type"), nothing) : defaultType;
        type_var = safeString(params, "type", marketType);
    else
        defaultType = safeString2(self.options, "fetchOpenOrders", "defaultType", "spot");
        type_var = safeString(params, "type", defaultType);
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate");
    if functions.ccxtruthy(paginate)
        cursorReceived = nothing;
        cursorSent = nothing;
        if functions.ccxtruthy(uta)
            cursorReceived = "cursor";
            cursorSent = "cursor";
        elseif functions.ccxtruthy(type_var == "spot")
            if functions.ccxtruthy(marginMode != nothing)
                cursorReceived = "minId";
                cursorSent = "idLessThan";
            end
        else
            cursorReceived = "endId";
            cursorSent = "idLessThan";
        end
            return Base.fetch(self.fetchPaginatedCallCursor("fetchOpenOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = cursorReceived, cursorSent = cursorSent))
    end
    response = nothing;
    trailing = self.safeBool(params, "trailing");
    trigger = self.safeBool2(params, "stop", "trigger");
    planTypeDefined = safeString(params, "planType") != nothing;
    isTrigger = (@functions.ccxt_or(trigger, planTypeDefined));
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(uta), (@functions.ccxt_or(@functions.ccxt_or((type_var == "swap"), (type_var == "future")), (marginMode != nothing)))))
        clientOrderId = safeString2(params, "clientOid", "clientOrderId");
        params = omit(params, "clientOrderId");
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("clientOid")] = clientOrderId;
        end
    end
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    params = omit(params, ["type", "stop", "trigger", "trailing"]);
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(type_var == "spot")
            if functions.ccxtruthy(marginMode != nothing)
                productType = "MARGIN";
            end
        end
        request[Symbol("category")] = productType;
        if functions.ccxtruthy(trigger)
            response = Base.fetch(self.privateUtaGetV3TradeUnfilledStrategyOrders(extend(request, params)));
        else
            response = Base.fetch(self.privateUtaGetV3TradeUnfilledOrders(extend(request, params)));
        end
    elseif functions.ccxtruthy(type_var == "spot")
        if functions.ccxtruthy(marginMode != nothing)
            if functions.ccxtruthy(since == nothing)
                since = milliseconds() - 7776000000;
                request[Symbol("startTime")] = since;
            end
            if functions.ccxtruthy(marginMode == "isolated")
                response = Base.fetch(self.privateMarginGetV2MarginIsolatedOpenOrders(extend(request, params)));
            elseif functions.ccxtruthy(marginMode == "cross")
                response = Base.fetch(self.privateMarginGetV2MarginCrossedOpenOrders(extend(request, params)));
            end
        else
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.privateSpotGetV2SpotTradeCurrentPlanOrder(extend(request, params)));
            else
                response = Base.fetch(self.privateSpotGetV2SpotTradeUnfilledOrders(extend(request, params)));
            end
        end
    else
        request[Symbol("productType")] = productType;
        if functions.ccxtruthy(trailing)
            planType = safeString(params, "planType", "track_plan");
            request[Symbol("planType")] = planType;
            response = Base.fetch(self.privateMixGetV2MixOrderOrdersPlanPending(extend(request, params)));
        elseif functions.ccxtruthy(isTrigger)
            planType = safeString(params, "planType", "normal_plan");
            request[Symbol("planType")] = planType;
            response = Base.fetch(self.privateMixGetV2MixOrderOrdersPlanPending(extend(request, params)));
        else
            response = Base.fetch(self.privateMixGetV2MixOrderOrdersPending(extend(request, params)));
        end
    end
    data = safeValue(response, "data");
    if functions.ccxtruthy(uta)
        result = nothing;
        if functions.ccxtruthy(trigger)
            result = self.safeList(response, "data", defaultValue = []);
        else
            result = self.safeList(data, "list", defaultValue = []);
        end
            return self.parseOrders(result, market = market, since = since, limit = limit)
    elseif functions.ccxtruthy(type_var == "spot")
        if functions.ccxtruthy(@functions.ccxt_or((marginMode != nothing), trigger))
            resultList = self.safeList(data, "orderList", defaultValue = []);
                return self.parseOrders(resultList, market = market, since = since, limit = limit)
        end
    else
        result = self.safeList(data, "entrustedList", defaultValue = []);
        return self.parseOrders(result, market = market, since = since, limit = limit)
    end
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user
see: https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
see: https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
see: https://www.bitget.com/api-doc/contract/plan/orders-plan-history
see: https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
see: https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
see: https://www.bitget.com/api-doc/uta/trade/Get-Order-History

# Arguments
- `symbol`::string: unified market symbol of the closed orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of closed orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.planType`::string, optional: *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.isPlan`::string, optional: *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
- `params.trailing`::bool, optional: set to true if you want to fetch trailing orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Bitget; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.fetchCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = params));
    return filterBy(orders, "status", "closed")

end
"""
fetches information on multiple canceled orders made by the user
see: https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
see: https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
see: https://www.bitget.com/api-doc/contract/plan/orders-plan-history
see: https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
see: https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
see: https://www.bitget.com/api-doc/uta/trade/Get-Order-History

# Arguments
- `symbol`::string: unified market symbol of the canceled orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of canceled orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.planType`::string, optional: *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.isPlan`::string, optional: *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
- `params.trailing`::bool, optional: set to true if you want to fetch trailing orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Bitget; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    orders = Base.fetch(self.fetchCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = params));
    return filterBy(orders, "status", "canceled")

end
"""
fetches information on multiple canceled and closed orders made by the user
see: https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
see: https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
see: https://www.bitget.com/api-doc/contract/plan/orders-plan-history
see: https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
see: https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
see: https://www.bitget.com/api-doc/uta/trade/Get-Order-History
see: https://www.bitget.com/api-doc/uta/strategy/Get-History-Strategy-Orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.planType`::string, optional: *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.isPlan`::string, optional: *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
- `params.trailing`::bool, optional: set to true if you want to fetch trailing orders
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledAndClosedOrders(self::Bitget; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchCanceledAndClosedOrders", defaultValue = false));
    if functions.ccxtruthy(uta)
            return Base.fetch(self.fetchUtaCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = params))
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchCanceledAndClosedOrders", market = market, params = params);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchCanceledAndClosedOrders", params = params);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchCanceledAndClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
        cursorReceived = nothing;
        if functions.ccxtruthy(marketType == "spot")
            if functions.ccxtruthy(marginMode != nothing)
                cursorReceived = "minId";
            end
        else
            cursorReceived = "endId";
        end
            return Base.fetch(self.fetchPaginatedCallCursor("fetchCanceledAndClosedOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = cursorReceived, cursorSent = "idLessThan"))
    end
    response = nothing;
    trailing = self.safeBool(params, "trailing");
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger", "trailing"]);
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((marketType == "swap"), (marketType == "future")), (marginMode != nothing)))
        clientOrderId = safeString2(params, "clientOid", "clientOrderId");
        params = omit(params, "clientOrderId");
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("clientOid")] = clientOrderId;
        end
    end
    now = milliseconds();
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(marginMode != nothing)
            if functions.ccxtruthy(since == nothing)
                since = now - 7776000000;
                request[Symbol("startTime")] = since;
            end
            if functions.ccxtruthy(marginMode == "isolated")
                response = Base.fetch(self.privateMarginGetV2MarginIsolatedHistoryOrders(extend(request, params)));
            elseif functions.ccxtruthy(marginMode == "cross")
                response = Base.fetch(self.privateMarginGetV2MarginCrossedHistoryOrders(extend(request, params)));
            end
        elseif functions.ccxtruthy(trigger)
            if functions.ccxtruthy(symbol == nothing)
                throw(ArgumentsRequired(string(self.id, " fetchCanceledAndClosedOrders() requires a symbol argument")));
            end
            endTime = safeInteger2(params, "endTime", "until");
            params = omit(params, ["until"]);
            if functions.ccxtruthy(since == nothing)
                since = now - 7776000000;
                request[Symbol("startTime")] = since;
            end
            if functions.ccxtruthy(endTime == nothing)
                request[Symbol("endTime")] = now;
            end
            response = Base.fetch(self.privateSpotGetV2SpotTradeHistoryPlanOrder(extend(request, params)));
        else
            response = Base.fetch(self.privateSpotGetV2SpotTradeHistoryOrders(extend(request, params)));
        end
    else
        productType = nothing;
        (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
        request[Symbol("productType")] = productType;
        planTypeDefined = safeString(params, "planType") != nothing;
        if functions.ccxtruthy(trailing)
            planType = safeString(params, "planType", "track_plan");
            request[Symbol("planType")] = planType;
            response = Base.fetch(self.privateMixGetV2MixOrderOrdersPlanHistory(extend(request, params)));
        elseif functions.ccxtruthy(@functions.ccxt_or(trigger, planTypeDefined))
            planType = safeString(params, "planType", "normal_plan");
            request[Symbol("planType")] = planType;
            response = Base.fetch(self.privateMixGetV2MixOrderOrdersPlanHistory(extend(request, params)));
        else
            response = Base.fetch(self.privateMixGetV2MixOrderOrdersHistory(extend(request, params)));
        end
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(@functions.ccxt_or((marginMode != nothing), trigger))
                return self.parseOrders(safeValue(data, "orderList", []), market = market, since = since, limit = limit)
        end
    else
        return self.parseOrders(safeValue(data, "entrustedList", []), market = market, since = since, limit = limit)
    end
    if functions.ccxtruthy(isa(response, AbstractString))
        response = functions.ccxt_json_parse(response);
    end
    orders = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
function fetchUtaCanceledAndClosedOrders(self::Bitget; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    if functions.ccxtruthy(productType == "SPOT")
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("fetchCanceledAndClosedOrders", params = params);
        if functions.ccxtruthy(marginMode != nothing)
            productType = "MARGIN";
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("category") => productType
    );
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchCanceledAndClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchCanceledAndClosedOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor"))
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    trigger = self.safeBool2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(trigger)
        response = Base.fetch(self.privateUtaGetV3TradeHistoryStrategyOrders(extend(request, params)));
    else
        response = Base.fetch(self.privateUtaGetV3TradeHistoryOrders(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(data, "list", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.bitget.com/api-doc/spot/account/Get-Account-Bills
see: https://www.bitget.com/api-doc/contract/account/Get-Account-Bill

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in ms
- `params.symbol`::string, optional: *contract only* unified market symbol
- `params.productType`::string, optional: *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Bitget; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbol = safeString(params, "symbol");
    params = omit(params, "symbol");
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchLedger", market = market, params = params);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
        cursorReceived = nothing;
        if functions.ccxtruthy(marketType != "spot")
            cursorReceived = "endId";
        end
            return Base.fetch(self.fetchPaginatedCallCursor("fetchLedger", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = cursorReceived, cursorSent = "idLessThan"))
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateSpotGetV2SpotAccountBills(extend(request, params)));
    else
        if functions.ccxtruthy(symbol != nothing)
            request[Symbol("symbol")] = safeString(market, "id");
        end
        productType = nothing;
        (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixGetV2MixAccountBill(extend(request, params)));
    end
    data = safeValue(response, "data");
    if functions.ccxtruthy(@functions.ccxt_or((marketType == "swap"), (marketType == "future")))
        bills = safeValue(data, "bills", []);
            return self.parseLedger(bills, currency = currency, since = since, limit = limit)
    end
    return self.parseLedger(data, currency = currency, since = since, limit = limit)

end
function parseLedgerEntry(self::Bitget, item; currency=nothing)
    currencyId = safeString(item, "coin");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    timestamp = safeInteger(item, "cTime");
    after = self.safeNumber(item, "balance");
    fee = self.safeNumber2(item, "fees", "fee");
    amountRaw = safeString2(item, "size", "amount", "");
    amount = self.parseNumber(stringAbs(amountRaw));
    direction = "in";
    if functions.ccxtruthy(findfirst("-", amountRaw) !== nothing)
        direction = "out";
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "billId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => self.parseLedgerType(safeString(item, "businessType")),
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("before") => nothing,
    Symbol("after") => after,
    Symbol("status") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => fee
    )
), currency = currency)

end
function parseLedgerType(self::Bitget, type_var)
    types = Dict{Symbol, Any}(
        Symbol("trans_to_cross") => "transfer",
        Symbol("trans_from_cross") => "transfer",
        Symbol("trans_to_exchange") => "transfer",
        Symbol("trans_from_exchange") => "transfer",
        Symbol("trans_to_isolated") => "transfer",
        Symbol("trans_from_isolated") => "transfer",
        Symbol("trans_to_contract") => "transfer",
        Symbol("trans_from_contract") => "transfer",
        Symbol("trans_to_otc") => "transfer",
        Symbol("trans_from_otc") => "transfer",
        Symbol("open_long") => "trade",
        Symbol("close_long") => "trade",
        Symbol("open_short") => "trade",
        Symbol("close_short") => "trade",
        Symbol("force_close_long") => "trade",
        Symbol("force_close_short") => "trade",
        Symbol("burst_long_loss_query") => "trade",
        Symbol("burst_short_loss_query") => "trade",
        Symbol("force_buy") => "trade",
        Symbol("force_sell") => "trade",
        Symbol("burst_buy") => "trade",
        Symbol("burst_sell") => "trade",
        Symbol("delivery_long") => "settlement",
        Symbol("delivery_short") => "settlement",
        Symbol("contract_settle_fee") => "fee",
        Symbol("append_margin") => "transaction",
        Symbol("adjust_down_lever_append_margin") => "transaction",
        Symbol("reduce_margin") => "transaction",
        Symbol("auto_append_margin") => "transaction",
        Symbol("cash_gift_issue") => "cashback",
        Symbol("cash_gift_recycle") => "cashback",
        Symbol("bonus_issue") => "rebate",
        Symbol("bonus_recycle") => "rebate",
        Symbol("bonus_expired") => "rebate",
        Symbol("transfer_in") => "transfer",
        Symbol("transfer_out") => "transfer",
        Symbol("deposit") => "deposit",
        Symbol("withdraw") => "withdrawal",
        Symbol("buy") => "trade",
        Symbol("sell") => "trade"
    );
    return safeString(types, type_var, type_var)

end
"""
fetch all trades made by the user
see: https://www.bitget.com/api-doc/spot/trade/Get-Fills
see: https://www.bitget.com/api-doc/contract/trade/Get-Order-Fills
see: https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-Fills
see: https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Transaction-Details
see: https://www.bitget.com/api-doc/uta/trade/Get-Order-Fills

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bitget; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchMyTrades", defaultValue = false));
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(uta), (symbol == nothing)))
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    paginate = false;
    marginMode = nothing;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params = params);
    if functions.ccxtruthy(paginate)
        cursorReceived = nothing;
        cursorSent = nothing;
        if functions.ccxtruthy(uta)
            cursorReceived = "cursor";
            cursorSent = "cursor";
        elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            if functions.ccxtruthy(marginMode != nothing)
                cursorReceived = "minId";
                cursorSent = "idLessThan";
            end
        else
            cursorReceived = "endId";
            cursorSent = "idLessThan";
        end
            return Base.fetch(self.fetchPaginatedCallCursor("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = cursorReceived, cursorSent = cursorSent))
    end
    response = nothing;
    if functions.ccxtruthy(uta)
        response = Base.fetch(self.privateUtaGetV3TradeFills(extend(request, params)));
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            if functions.ccxtruthy(marginMode != nothing)
                if functions.ccxtruthy(since == nothing)
                    request[Symbol("startTime")] = milliseconds() - 7776000000;
                end
                if functions.ccxtruthy(marginMode == "isolated")
                    response = Base.fetch(self.privateMarginGetV2MarginIsolatedFills(extend(request, params)));
                elseif functions.ccxtruthy(marginMode == "cross")
                    response = Base.fetch(self.privateMarginGetV2MarginCrossedFills(extend(request, params)));
                end
            else
                response = Base.fetch(self.privateSpotGetV2SpotTradeFills(extend(request, params)));
            end
        else
            productType = nothing;
            (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
            request[Symbol("productType")] = productType;
            response = Base.fetch(self.privateMixGetV2MixOrderFills(extend(request, params)));
        end
    end
    data = safeValue(response, "data");
    if functions.ccxtruthy(uta)
        fills = self.safeList(data, "list", defaultValue = []);
            return self.parseTrades(fills, market = market, since = since, limit = limit)
    elseif functions.ccxtruthy((@functions.ccxt_or(get(market, Symbol("swap"), nothing), (get(market, Symbol("future"), nothing)))))
        fills = self.safeList(data, "fillList", defaultValue = []);
        return self.parseTrades(fills, market = market, since = since, limit = limit)
    else
        if functions.ccxtruthy(marginMode != nothing)
            fills = self.safeList(data, "fills", defaultValue = []);
                return self.parseTrades(fills, market = market, since = since, limit = limit)
        end

    end
    return self.parseTrades(data, market = market, since = since, limit = limit)

end
"""
fetch data on a single open contract trade position
see: https://www.bitget.com/api-doc/contract/position/get-single-position
see: https://www.bitget.com/api-doc/uta/trade/Get-Position

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    uta = nothing;
    result = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchPosition", defaultValue = false));
    if functions.ccxtruthy(uta)
        request[Symbol("category")] = productType;
        response = Base.fetch(self.privateUtaGetV3PositionCurrentPosition(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        result = self.safeList(data, "list", defaultValue = []);
    else
        request[Symbol("marginCoin")] = get(market, Symbol("settleId"), nothing);
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixGetV2MixPositionSinglePosition(extend(request, params)));
        result = self.safeList(response, "data", defaultValue = []);
    end
    first_var = self.safeDict(result, 0, defaultValue = Dict{Symbol, Any}());
    return self.parsePosition(first_var, market = market)

end
"""
fetch all open positions
see: https://www.bitget.com/api-doc/contract/position/get-all-position
see: https://www.bitget.com/api-doc/contract/position/Get-History-Position
see: https://www.bitget.com/api-doc/uta/trade/Get-Position

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginCoin`::string, optional: the settle currency of the positions, needs to match the productType
- `params.productType`::string, optional: 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.useHistoryEndpoint`::bool, optional: default false, when true  will use the historic endpoint to fetch positions
- `params.method`::string, optional: either (default) 'privateMixGetV2MixPositionAllPosition', 'privateMixGetV2MixPositionHistoryPosition', or 'privateUtaGetV3PositionCurrentPosition'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Bitget; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchPositions", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchPositions", symbol = nothing, since = nothing, limit = nothing, params = params, cursorReceived = "endId", cursorSent = "idLessThan"))
    end
    method = nothing;
    useHistoryEndpoint = self.safeBool(params, "useHistoryEndpoint", defaultValue = false);
    if functions.ccxtruthy(useHistoryEndpoint)
        method = "privateMixGetV2MixPositionHistoryPosition";
    else
        (method, params) = self.handleOptionAndParams(params, "fetchPositions", "method", defaultValue = "privateMixGetV2MixPositionAllPosition");
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        first_var = safeString(symbols, 0);
        if functions.ccxtruthy(first_var != nothing)
            market = self.market(first_var);
        end
    end
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}();
    response = nothing;
    isHistory = false;
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchPositions", defaultValue = false));
    if functions.ccxtruthy(uta)
        request[Symbol("category")] = productType;
        response = Base.fetch(self.privateUtaGetV3PositionCurrentPosition(extend(request, params)));
    elseif functions.ccxtruthy(method == "privateMixGetV2MixPositionAllPosition")
        marginCoin = safeString(params, "marginCoin", "USDT");
        if functions.ccxtruthy(market != nothing)
            marginCoin = get(market, Symbol("settleId"), nothing);
        elseif functions.ccxtruthy(productType == "USDT-FUTURES")
            marginCoin = "USDT";
        else
            if functions.ccxtruthy(productType == "USDC-FUTURES")
                marginCoin = "USDC";
            elseif functions.ccxtruthy(productType == "SUSDT-FUTURES")
                marginCoin = "SUSDT";
            else
                if functions.ccxtruthy(productType == "SUSDC-FUTURES")
                    marginCoin = "SUSDC";
                elseif functions.ccxtruthy(@functions.ccxt_or((productType == "SCOIN-FUTURES"), (productType == "COIN-FUTURES")))
                    if functions.ccxtruthy(marginCoin == nothing)
                        throw(ArgumentsRequired(string(self.id, " fetchPositions() requires a marginCoin parameter that matches the productType")));
                    end
                end

            end

        end
        request[Symbol("marginCoin")] = marginCoin;
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixGetV2MixPositionAllPosition(extend(request, params)));
    else
        isHistory = true;
        if functions.ccxtruthy(market != nothing)
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixGetV2MixPositionHistoryPosition(extend(request, params)));
    end
    position = [];
    if functions.ccxtruthy(@functions.ccxt_or(uta, isHistory))
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        position = self.safeList(data, "list", defaultValue = []);
    else
        position = self.safeList(response, "data", defaultValue = []);
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(position)))
        push!(result, self.parsePosition(get(position, i + 1, nothing), market = market));
        i += 1
    end
    symbols = self.marketSymbols(symbols = symbols);
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
function parsePosition(self::Bitget, position; market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeIntegerN(position, ["cTime", "ctime", "createdTime"]);
    marginMode = safeString(position, "marginMode");
    collateral = nothing;
    initialMargin = nothing;
    unrealizedPnl = safeString2(position, "unrealizedPL", "unrealisedPnl");
    rawCollateral = safeString2(position, "marginSize", "positionBalance");
    if functions.ccxtruthy(marginMode == "isolated")
        collateral = stringAdd(rawCollateral, unrealizedPnl);
    elseif functions.ccxtruthy(marginMode == "crossed")
        marginMode = "cross";
        initialMargin = rawCollateral;
    end
    holdMode = safeString2(position, "posMode", "holdMode");
    hedged = nothing;
    if functions.ccxtruthy(holdMode == "hedge_mode")
        hedged = true;
    elseif functions.ccxtruthy(holdMode == "one_way_mode")
        hedged = false;
    end
    side = safeString2(position, "holdSide", "posSide");
    leverage = safeString(position, "leverage");
    contractSizeNumber = safeValue(market, "contractSize");
    contractSize = numberToString(contractSizeNumber);
    baseAmount = safeString2(position, "total", "openTotalPos");
    entryPrice = safeStringN(position, ["openPriceAvg", "openAvgPrice", "avgPrice"]);
    maintenanceMarginPercentage = safeString(position, "keepMarginRate");
    openNotional = stringMul(entryPrice, baseAmount);
    if functions.ccxtruthy(initialMargin == nothing)
        initialMargin = stringDiv(openNotional, leverage);
    end
    contracts = self.parseNumber(stringDiv(baseAmount, contractSize));
    if functions.ccxtruthy(contracts == nothing)
        contracts = self.safeNumber(position, "closeTotalPos");
    end
    markPrice = safeString(position, "markPrice");
    notional = stringMul(baseAmount, markPrice);
    initialMarginPercentage = stringDiv(initialMargin, notional);
    liquidationPrice = self.parseNumber(omitZero(safeString(position, "liquidationPrice")));
    calcTakerFeeRate = "0.0006";
    calcTakerFeeMult = "0.9994";
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((liquidationPrice == nothing), (marginMode == "isolated")), stringGt(baseAmount, "0")))
        signedMargin = stringDiv(rawCollateral, baseAmount);
        signedMmp = maintenanceMarginPercentage;
        if functions.ccxtruthy(side == "short")
            signedMargin = stringNeg(signedMargin);
            signedMmp = stringNeg(signedMmp);
        end
        mmrMinusOne = stringSub("1", signedMmp);
        numerator = stringSub(entryPrice, signedMargin);
        if functions.ccxtruthy(side == "long")
            mmrMinusOne = stringMul(mmrMinusOne, calcTakerFeeMult);
        else
            numerator = stringMul(numerator, calcTakerFeeMult);
        end
        liquidationPrice = self.parseNumber(stringDiv(numerator, mmrMinusOne));
    end
    feeToClose = stringMul(notional, calcTakerFeeRate);
    maintenanceMargin = stringAdd(stringMul(maintenanceMarginPercentage, notional), feeToClose);
    percentage = stringMul(stringDiv(unrealizedPnl, initialMargin, 4), "100");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString2(position, "orderId", "positionId"),
    Symbol("symbol") => symbol,
    Symbol("notional") => self.parseNumber(notional),
    Symbol("marginMode") => marginMode,
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("entryPrice") => self.parseNumber(entryPrice),
    Symbol("unrealizedPnl") => self.parseNumber(unrealizedPnl),
    Symbol("realizedPnl") => self.safeNumberN(position, ["pnl", "curRealisedPnl", "cumRealisedPnl"]),
    Symbol("percentage") => self.parseNumber(percentage),
    Symbol("contracts") => contracts,
    Symbol("contractSize") => contractSizeNumber,
    Symbol("markPrice") => self.parseNumber(markPrice),
    Symbol("lastPrice") => self.safeNumber2(position, "closeAvgPrice", "closePriceAvg"),
    Symbol("side") => side,
    Symbol("hedged") => hedged,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeInteger2(position, "utime", "updatedTime"),
    Symbol("maintenanceMargin") => self.parseNumber(maintenanceMargin),
    Symbol("maintenanceMarginPercentage") => self.parseNumber(maintenanceMarginPercentage),
    Symbol("collateral") => self.parseNumber(collateral),
    Symbol("initialMargin") => self.parseNumber(initialMargin),
    Symbol("initialMarginPercentage") => self.parseNumber(initialMarginPercentage),
    Symbol("leverage") => self.parseNumber(leverage),
    Symbol("marginRatio") => self.safeNumber2(position, "marginRatio", "mmr"),
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
"""
fetches historical funding rate prices
see: https://www.bitget.com/api-doc/contract/market/Get-History-Funding-Rate
see: https://www.bitget.com/api-doc/uta/public/Get-History-Funding-Rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of funding rate structures to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Bitget; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    productType = nothing;
    uta = nothing;
    response = nothing;
    result = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchFundingRateHistory", defaultValue = false));
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        request[Symbol("category")] = productType;
        response = Base.fetch(self.publicUtaGetV3MarketHistoryFundRate(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        result = self.safeList(data, "resultList", defaultValue = []);
    else
        paginate = false;
        (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
        if functions.ccxtruthy(paginate)
                return Base.fetch(self.fetchPaginatedCallIncremental("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, params = params, pageKey = "pageNo", maxEntriesPerRequest = 100))
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("pageSize")] = limit;
        end
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.publicMixGetV2MixMarketHistoryFundRate(extend(request, params)));
        result = self.safeList(response, "data", defaultValue = []);
    end
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        entry = get(result, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        symbolInner = self.safeSymbol(marketId, market = market);
        timestamp = safeInteger2(entry, "fundingTime", "fundingRateTimestamp");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbolInner,
    Symbol("fundingRate") => self.safeNumber(entry, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = get(market, Symbol("symbol"), nothing), since = since, limit = limit)

end
"""
fetch the current funding rate
see: https://www.bitget.com/api-doc/contract/market/Get-Current-Funding-Rate
see: https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
see: https://www.bitget.com/api-doc/uta/public/Get-Current-Funding-Rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.method`::string, optional: either (default) 'publicMixGetV2MixMarketCurrentFundRate' or 'publicMixGetV2MixMarketFundingTime'

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    uta = nothing;
    response = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchFundingRate", defaultValue = false));
    if functions.ccxtruthy(uta)
        response = Base.fetch(self.publicUtaGetV3MarketCurrentFundRate(extend(request, params)));
    else
        request[Symbol("productType")] = productType;
        method = nothing;
        (method, params) = self.handleOptionAndParams(params, "fetchFundingRate", "method", defaultValue = "publicMixGetV2MixMarketCurrentFundRate");
        if functions.ccxtruthy(method == "publicMixGetV2MixMarketCurrentFundRate")
            response = Base.fetch(self.publicMixGetV2MixMarketCurrentFundRate(extend(request, params)));
        elseif functions.ccxtruthy(method == "publicMixGetV2MixMarketFundingTime")
            response = Base.fetch(self.publicMixGetV2MixMarketFundingTime(extend(request, params)));
        end
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseFundingRate(get(data, 1, nothing), market = market)

end
"""
fetch the current funding rates for all markets
see: https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: *contract only* 'linear', 'inverse'
- `params.productType`::string, optional: *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.method`::string, optional: either (default) 'publicMixGetV2MixMarketTickers' or 'publicMixGetV2MixMarketCurrentFundRate'

# Returns
- a dictionary of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
function fetchFundingRates(self::Bitget; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbol = safeValue(symbols, 0);
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    method = "publicMixGetV2MixMarketTickers";
    (method, params) = self.handleOptionAndParams(params, "fetchFundingRates", "method", defaultValue = method);
    response = nothing;
    request[Symbol("productType")] = productType;
    if functions.ccxtruthy(method == "publicMixGetV2MixMarketTickers")
        response = Base.fetch(self.publicMixGetV2MixMarketTickers(extend(request, params)));
    elseif functions.ccxtruthy(method == "publicMixGetV2MixMarketCurrentFundRate")
        response = Base.fetch(self.publicMixGetV2MixMarketCurrentFundRate(extend(request, params)));
    end
    symbols = self.marketSymbols(symbols = symbols);
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseFundingRates(data, symbols = symbols)

end
"""
fetch the funding rate interval for multiple markets
see: https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.productType`::string, optional: 'USDT-FUTURES' (default), 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingIntervals(self::Bitget; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    params = extend(Dict{Symbol, Any}(
    Symbol("method") => "publicMixGetV2MixMarketCurrentFundRate"
), params);
    return Base.fetch(self.fetchFundingRates(symbols = symbols, params = params))

end
function parseFundingRate(self::Bitget, contract; market=nothing)
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap");
    fundingTimestamp = safeInteger2(contract, "nextFundingTime", "nextUpdate");
    interval = safeString2(contract, "ratePeriod", "fundingRateInterval");
    timestamp = safeInteger(contract, "ts");
    markPrice = self.safeNumber(contract, "markPrice");
    indexPrice = self.safeNumber(contract, "indexPrice");
    intervalString = nothing;
    if functions.ccxtruthy(interval != nothing)
        intervalString = string(interval, "h");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => markPrice,
    Symbol("indexPrice") => indexPrice,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("fundingTimestamp") => fundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(fundingTimestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => intervalString
)

end
"""
fetch the funding history
see: https://www.bitget.com/api-doc/contract/account/Get-Account-Bill

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the starting timestamp in milliseconds
- `limit`::int, optional: the number of entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch funding history for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Bitget; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingHistory() requires a symbol argument")));
    end
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchFundingHistory", defaultValue = false));
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate");
    if functions.ccxtruthy(paginate)
        if functions.ccxtruthy(uta)
                return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingHistory", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "cursor", cursorSent = "cursor"))
        end
            return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingHistory", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "endId", cursorSent = "idLessThan"))
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingHistory() supports swap contracts only")));
    end
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(uta)
        request[Symbol("coin")] = get(market, Symbol("settleId"), nothing);
        request[Symbol("category")] = productType;
        response = Base.fetch(self.privateUtaGetV3AccountFinancialRecords(extend(request, params)));
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        request[Symbol("marginCoin")] = get(market, Symbol("settleId"), nothing);
        request[Symbol("businessType")] = "contract_settle_fee";
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixGetV2MixAccountBill(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    bills = self.safeList2(data, "bills", "list", defaultValue = []);
    if functions.ccxtruthy(uta)
        bills = self.filterByArray(bills, "type", values = ["CONTRACT_MAIN_SETTLE_FEE_USER_IN", "CONTRACT_MAIN_SETTLE_FEE_USER_OUT"], indexed = false);
    end
    return self.parseFundingHistories(bills, market = market, since = since, limit = limit)

end
function parseFundingHistory(self::Bitget, contract; market=nothing)
    marketId = safeString(contract, "symbol");
    currencyId = safeString(contract, "coin");
    timestamp = safeInteger2(contract, "cTime", "ts");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("amount") => self.safeNumber(contract, "amount"),
    Symbol("id") => safeString2(contract, "billId", "id")
)

end
function parseFundingHistories(self::Bitget, contracts; market=nothing, since=nothing, limit=nothing)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(contracts)))
        contract = get(contracts, i + 1, nothing);
        push!(result, self.parseFundingHistory(contract, market = market));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    symbol = nothing;
    if functions.ccxtruthy(market != nothing)
        symbol = get(market, Symbol("symbol"), nothing);
    end
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function modifyMarginHelper(self::Bitget, symbol, amount, type_var; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    holdSide = safeString(params, "holdSide");
    market = self.market(symbol);
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginCoin") => get(market, Symbol("settleId"), nothing),
        Symbol("amount") => self.amountToPrecision(symbol, amount),
        Symbol("holdSide") => holdSide,
        Symbol("productType") => productType
    );
    params = omit(params, "holdSide");
    response = Base.fetch(self.privateMixPostV2MixAccountSetMargin(extend(request, params)));
    return extend(self.parseMarginModification(response, market = market), Dict{Symbol, Any}(
    Symbol("amount") => self.parseNumber(amount),
    Symbol("type") => type_var
))

end
function parseMarginModification(self::Bitget, data; market=nothing)
    errorCode = safeString(data, "code");
    status = functions.ccxtruthy((errorCode == "00000")) ? "ok" : "failed";
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => nothing,
    Symbol("code") => safeString(market, "settle"),
    Symbol("status") => status,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
remove margin from a position
see: https://www.bitget.com/api-doc/contract/account/Change-Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Bitget, symbol, amount; params=Dict())
    if functions.ccxtruthy(functions.ccxt_gt(amount, 0))
        throw(BadRequest(string(self.id, " reduceMargin() amount parameter must be a negative value")));
    end
    holdSide = safeString(params, "holdSide");
    if functions.ccxtruthy(holdSide == nothing)
        throw(ArgumentsRequired(string(self.id, " reduceMargin() requires a holdSide parameter, either long or short")));
    end
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "reduce", params = params))

end
"""
add margin
see: https://www.bitget.com/api-doc/contract/account/Change-Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Bitget, symbol, amount; params=Dict())
    holdSide = safeString(params, "holdSide");
    if functions.ccxtruthy(holdSide == nothing)
        throw(ArgumentsRequired(string(self.id, " addMargin() requires a holdSide parameter, either long or short")));
    end
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params = params))

end
"""
fetch the set leverage for a market
see: https://www.bitget.com/api-doc/contract/account/Get-Single-Account

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginCoin") => get(market, Symbol("settleId"), nothing),
        Symbol("productType") => productType
    );
    response = Base.fetch(self.privateMixGetV2MixAccountAccount(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseLeverage(data, market = market)

end
function parseLeverage(self::Bitget, leverage; market=nothing)
    isCrossMarginMode = safeString(leverage, "marginMode") == "crossed";
    longLevKey = functions.ccxtruthy(isCrossMarginMode) ? "crossedMarginLeverage" : "isolatedLongLever";
    shortLevKey = functions.ccxtruthy(isCrossMarginMode) ? "crossedMarginLeverage" : "isolatedShortLever";
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => functions.ccxtruthy(isCrossMarginMode) ? "cross" : "isolated",
    Symbol("longLeverage") => safeInteger(leverage, longLevKey),
    Symbol("shortLeverage") => safeInteger(leverage, shortLevKey)
)

end
"""
set the level of leverage for a market
see: https://www.bitget.com/api-doc/contract/account/Change-Leverage
see: https://www.bitget.com/api-doc/uta/account/Change-Leverage

# Arguments
- `leverage`::int: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.holdSide`::string, optional: *isolated only* position direction, 'long' or 'short'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.posSide`::bool, optional: required for uta isolated margin, long or short

# Returns
- response from the exchange
"""
function setLeverage(self::Bitget, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => numberToString(leverage)
    );
    uta = nothing;
    response = Dict{Symbol, Any}();
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "setLeverage", defaultValue = false));
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(productType == "SPOT")
            marginMode = nothing;
            (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params = params);
            if functions.ccxtruthy(marginMode != nothing)
                productType = "MARGIN";
            end
        end
        request[Symbol("coin")] = get(market, Symbol("settleId"), nothing);
        request[Symbol("category")] = productType;
        response = Base.fetch(self.privateUtaPostV3AccountSetLeverage(extend(request, params)));
    else
        request[Symbol("marginCoin")] = get(market, Symbol("settleId"), nothing);
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixPostV2MixAccountSetLeverage(extend(request, params)));
    end
    return response

end
"""
set margin mode to 'cross' or 'isolated'
see: https://www.bitget.com/api-doc/contract/account/Change-Margin-Mode

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setMarginMode(self::Bitget, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    marginMode = lowercase(marginMode);
    if functions.ccxtruthy(marginMode == "cross")
        marginMode = "crossed";
    end
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "isolated"), (marginMode != "crossed")))
        throw(ArgumentsRequired(string(self.id, " setMarginMode() marginMode must be either isolated or crossed (cross)")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginCoin") => get(market, Symbol("settleId"), nothing),
        Symbol("marginMode") => marginMode,
        Symbol("productType") => productType
    );
    response = Base.fetch(self.privateMixPostV2MixAccountSetMarginMode(extend(request, params)));
    return response

end
"""
set hedged to true or false for a market
see: https://www.bitget.com/api-doc/contract/account/Change-Hold-Mode
see: https://www.bitget.com/api-doc/uta/account/Change-Position-Mode

# Arguments
- `hedged`::bool: set to true to use dualSidePosition
- `symbol`::string: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.productType`::string, optional: required if not uta and symbol is undefined: 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- response from the exchange
"""
function setPositionMode(self::Bitget, hedged; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    posMode = functions.ccxtruthy(hedged) ? "hedge_mode" : "one_way_mode";
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    productType = nothing;
    uta = nothing;
    response = Dict{Symbol, Any}();
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "setPositionMode", defaultValue = false));
    if functions.ccxtruthy(uta)
        request[Symbol("holdMode")] = posMode;
        response = Base.fetch(self.privateUtaPostV3AccountSetHoldMode(extend(request, params)));
    else
        request[Symbol("posMode")] = posMode;
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixPostV2MixAccountSetPositionMode(extend(request, params)));
    end
    return response

end
"""
retrieves the open interest of a contract trading pair
see: https://www.bitget.com/api-doc/contract/market/Get-Open-Interest
see: https://www.bitget.com/api-doc/uta/public/Get-Open-Interest

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterest() supports contract markets only")));
    end
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    uta = nothing;
    response = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchOpenInterest", defaultValue = false));
    if functions.ccxtruthy(uta)
        request[Symbol("category")] = productType;
        response = Base.fetch(self.publicUtaGetV3MarketOpenInterest(extend(request, params)));
    else
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.publicMixGetV2MixMarketOpenInterest(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOpenInterest(data, market = market)

end
function parseOpenInterest(self::Bitget, interest; market=nothing)
    data = self.safeList2(interest, "openInterestList", "list", defaultValue = []);
    timestamp = safeInteger(interest, "ts");
    marketId = safeString(get(data, 1, nothing), "symbol");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("openInterestAmount") => self.safeNumber2(get(data, 1, nothing), "size", "openInterest"),
    Symbol("openInterestValue") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
"""
fetch a history of internal transfers made on an account
see: https://www.bitget.com/api-doc/spot/account/Get-Account-TransferRecords

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Bitget; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTransfers() requires a code argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTransfers", market = nothing, params = params);
    fromAccount = safeString(params, "fromAccount", type_var);
    params = omit(params, "fromAccount");
    accountsByType = safeValue(self.options, "accountsByType", Dict{Symbol, Any}());
    type_var = safeString(accountsByType, fromAccount);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("fromType") => type_var
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.privateSpotGetV2SpotAccountTransferRecords(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTransfers(data, currency = currency, since = since, limit = limit)

end
"""
transfer currency internally between wallets on the same account
see: https://www.bitget.com/api-doc/spot/account/Wallet-Transfer
see: https://www.bitget.com/api-doc/uta/account/transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true to transfer via the unified trading account v3 endpoint
- `params.symbol`::string, optional: unified CCXT market symbol, required when transferring to or from an account type that is a leveraged position-by-position account
- `params.clientOid`::string, optional: custom id

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Bitget, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "transfer", defaultValue = false));
    currency = self.currency(code);
    accountsByType = safeValue(self.options, "accountsByType", Dict{Symbol, Any}());
    fromType = safeString(accountsByType, fromAccount);
    toType = safeString(accountsByType, toAccount);
    request = Dict{Symbol, Any}(
        Symbol("fromType") => fromType,
        Symbol("toType") => toType,
        Symbol("amount") => amount,
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    symbol = safeString(params, "symbol");
    params = omit(params, "symbol");
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = nothing;
    if functions.ccxtruthy(uta)
        response = Base.fetch(self.privateUtaPostV3AccountTransfer(extend(request, params)));
    else
        response = Base.fetch(self.privateSpotPostV2SpotWalletTransfer(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    data[Symbol("ts")] = safeInteger(response, "requestTime");
    return self.parseTransfer(data, currency = currency)

end
function parseTransfer(self::Bitget, transfer; currency=nothing)
    timestamp = safeInteger(transfer, "ts");
    status = safeStringLower(transfer, "status");
    currencyId = safeString(transfer, "coin");
    fromAccountRaw = safeString(transfer, "fromType");
    accountsById = safeValue(self.options, "accountsById", Dict{Symbol, Any}());
    fromAccount = safeString(accountsById, fromAccountRaw, fromAccountRaw);
    toAccountRaw = safeString(transfer, "toType");
    toAccount = safeString(accountsById, toAccountRaw, toAccountRaw);
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "transferId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber(transfer, "size"),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => self.parseTransferStatus(status)
)

end
function parseTransferStatus(self::Bitget, status)
    statuses = Dict{Symbol, Any}(
        Symbol("successful") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseDepositWithdrawFee(self::Bitget, fee; currency=nothing)
    chains = safeValue(fee, "chains", []);
    chainsLength = length(chains);
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
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, chainsLength))
        chain = get(chains, i + 1, nothing);
        networkId = safeString(chain, "chain");
        currencyCode = safeString(currency, "code");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = currencyCode);
        if functions.ccxtruthy(networkCode != nothing)
            result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("fee") => nothing,
                    Symbol("percentage") => nothing
                ),
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("fee") => self.safeNumber(chain, "withdrawFee"),
                    Symbol("percentage") => false
                )
            );
        end
        if functions.ccxtruthy(chainsLength == 1)
            result[Symbol("withdraw")][Symbol("fee")] = self.safeNumber(chain, "withdrawFee");
            result[Symbol("withdraw")][Symbol("percentage")] = false;
        end
        i += 1
    end
    return result

end
"""
fetch deposit and withdraw fees
see: https://www.bitget.com/api-doc/spot/market/Get-Coin-List

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Bitget; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicSpotGetV2SpotPublicCoins(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseDepositWithdrawFees(data, codes = codes, currencyIdKey = "coin")

end
"""
create a loan to borrow margin
see: https://www.bitget.com/api-doc/margin/cross/account/Cross-Borrow

# Arguments
- `code`::string: unified currency code of the currency to borrow
- `amount`::string: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function borrowCrossMargin(self::Bitget, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("borrowAmount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.privateMarginPostV2MarginCrossedAccountBorrow(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    return self.parseMarginLoan(data, currency = currency)

end
"""
create a loan to borrow margin
see: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Borrow

# Arguments
- `symbol`::string: unified market symbol
- `code`::string: unified currency code of the currency to borrow
- `amount`::string: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function borrowIsolatedMargin(self::Bitget, symbol, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("borrowAmount") => self.currencyToPrecision(code, amount),
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateMarginPostV2MarginIsolatedAccountBorrow(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    return self.parseMarginLoan(data, currency = currency, market = market)

end
"""
repay borrowed margin and interest
see: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Repay

# Arguments
- `symbol`::string: unified market symbol
- `code`::string: unified currency code of the currency to repay
- `amount`::string: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function repayIsolatedMargin(self::Bitget, symbol, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("repayAmount") => self.currencyToPrecision(code, amount),
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateMarginPostV2MarginIsolatedAccountRepay(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    return self.parseMarginLoan(data, currency = currency, market = market)

end
"""
repay borrowed margin and interest
see: https://www.bitget.com/api-doc/margin/cross/account/Cross-Repay

# Arguments
- `code`::string: unified currency code of the currency to repay
- `amount`::string: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function repayCrossMargin(self::Bitget, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("repayAmount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.privateMarginPostV2MarginCrossedAccountRepay(extend(request, params)));
    data = safeValue(response, "data", Dict{Symbol, Any}());
    return self.parseMarginLoan(data, currency = currency)

end
function parseMarginLoan(self::Bitget, info; currency=nothing, market=nothing)
    currencyId = safeString(info, "coin");
    marketId = safeString(info, "symbol");
    symbol = nothing;
    if functions.ccxtruthy(marketId != nothing)
        symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "spot");
    end
    return Dict{Symbol, Any}(
    Symbol("id") => safeString2(info, "loanId", "repayId"),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber2(info, "borrowAmount", "repayAmount"),
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => info
)

end
"""
retrieves the users liquidated positions
see: https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Liquidation-Records
see: https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Liquidation-Records

# Arguments
- `symbol`::string, optional: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the bitget api endpoint
- `params.until`::int, optional: timestamp in ms of the latest liquidation
- `params.marginMode`::string, optional: 'cross' or 'isolated' default value is 'cross'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
function fetchMyLiquidations(self::Bitget; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyLiquidations", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchMyLiquidations", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "minId", cursorSent = "idLessThan"))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchMyLiquidations", market = market, params = params);
    if functions.ccxtruthy(type_var != "spot")
        throw(NotSupported(string(self.id, " fetchMyLiquidations() supports spot margin markets only")));
    end
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    else
        request[Symbol("startTime")] = milliseconds() - 7776000000;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchMyLiquidations", params = params, defaultValue = "cross");
    if functions.ccxtruthy(marginMode == "isolated")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchMyLiquidations() requires a symbol argument")));
        end
        request[Symbol("symbol")] = safeString(market, "id");
        response = Base.fetch(self.privateMarginGetV2MarginIsolatedLiquidationHistory(extend(request, params)));
    elseif functions.ccxtruthy(marginMode == "cross")
        response = Base.fetch(self.privateMarginGetV2MarginCrossedLiquidationHistory(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    liquidations = self.safeList(data, "resultList", defaultValue = []);
    return self.parseLiquidations(liquidations, market = market, since = since, limit = limit)

end
function parseLiquidation(self::Bitget, liquidation; market=nothing)
    marketId = safeString(liquidation, "symbol");
    timestamp = safeInteger(liquidation, "liqEndTime");
    liquidationFee = safeString2(liquidation, "LiqFee", "liqFee");
    totalDebt = safeString(liquidation, "totalDebt");
    quoteValueString = stringAdd(liquidationFee, totalDebt);
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("contracts") => nothing,
    Symbol("contractSize") => nothing,
    Symbol("price") => nothing,
    Symbol("baseValue") => nothing,
    Symbol("quoteValue") => self.parseNumber(quoteValueString),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Margin-Interest-Rate-And-Max-Borrowable-Amount

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [isolated borrow rate structure]{@link https://docs.ccxt.com/?id=isolated-borrow-rate-structure}
"""
function fetchIsolatedBorrowRate(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateMarginGetV2MarginIsolatedInterestRateAndLimit(extend(request, params)));
    timestamp = safeInteger(response, "requestTime");
    data = safeValue(response, "data", []);
    first_var = safeValue(data, 0, Dict{Symbol, Any}());
    first_var[Symbol("timestamp")] = timestamp;
    return self.parseIsolatedBorrowRate(first_var, market = market)

end
function parseIsolatedBorrowRate(self::Bitget, info; market=nothing)
    marketId = safeString(info, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "spot");
    baseId = safeString(info, "baseCoin");
    quoteId = safeString(info, "quoteCoin");
    timestamp = safeInteger(info, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("base") => self.safeCurrencyCode(baseId),
    Symbol("baseRate") => self.safeNumber(info, "baseDailyInterestRate"),
    Symbol("quote") => self.safeCurrencyCode(quoteId),
    Symbol("quoteRate") => self.safeNumber(info, "quoteDailyInterestRate"),
    Symbol("period") => 86400000,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Margin-Interest-Rate-And-Borrowable
see: https://www.bitget.com/api-doc/uta/public/Get-Margin-Loans

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [borrow rate structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#borrow-rate-structure}
"""
function fetchCrossBorrowRate(self::Bitget, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    uta = nothing;
    response = nothing;
    result = Dict{Symbol, Any}();
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchCrossBorrowRate", defaultValue = false));
    if functions.ccxtruthy(uta)
        response = Base.fetch(self.publicUtaGetV3MarketMarginLoans(extend(request, params)));
        result = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    else
        response = Base.fetch(self.privateMarginGetV2MarginCrossedInterestRateAndLimit(extend(request, params)));
        data = safeValue(response, "data", []);
        result = safeValue(data, 0, Dict{Symbol, Any}());
    end
    timestamp = safeInteger(response, "requestTime");
    result[Symbol("timestamp")] = timestamp;
    return self.parseBorrowRate(result, currency = currency)

end
function parseBorrowRate(self::Bitget, info; currency=nothing)
    currencyId = safeString(info, "coin");
    timestamp = safeInteger(info, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("rate") => self.safeNumber2(info, "dailyInterestRate", "dailyInterest"),
    Symbol("period") => 86400000,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Interest-Records
see: https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Interest-Records

# Arguments
- `code`::string, optional: unified currency code
- `symbol`::string, optional: unified market symbol when fetching interest in isolated markets
- `since`::int, optional: the earliest time in ms to fetch borrow interest for
- `limit`::int, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
function fetchBorrowInterest(self::Bitget; code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchBorrowInterest", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchBorrowInterest", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "minId", cursorSent = "idLessThan"))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    else
        request[Symbol("startTime")] = milliseconds() - 7776000000;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBorrowInterest", params = params, defaultValue = "cross");
    if functions.ccxtruthy(marginMode == "isolated")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchBorrowInterest() requires a symbol argument")));
        end
        request[Symbol("symbol")] = safeString(market, "id");
        response = Base.fetch(self.privateMarginGetV2MarginIsolatedInterestHistory(extend(request, params)));
    elseif functions.ccxtruthy(marginMode == "cross")
        response = Base.fetch(self.privateMarginGetV2MarginCrossedInterestHistory(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    rows = safeValue(data, "resultList", []);
    interest = self.parseBorrowInterests(rows, market = market);
    return self.filterByCurrencySinceLimit(interest, code = code, since = since, limit = limit)

end
function parseBorrowInterest(self::Bitget, info; market=nothing)
    marketId = safeString(info, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    marginMode = functions.ccxtruthy((marketId != nothing)) ? "isolated" : "cross";
    timestamp = safeInteger(info, "cTime");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("currency") => self.safeCurrencyCode(safeString(info, "interestCoin")),
    Symbol("interest") => self.safeNumber(info, "interestAmount"),
    Symbol("interestRate") => self.safeNumber(info, "dailyInterestRate"),
    Symbol("amountBorrowed") => nothing,
    Symbol("marginMode") => marginMode,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
closes an open position for a market
see: https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
see: https://www.bitget.com/api-doc/uta/trade/Close-All-Positions

# Arguments
- `symbol`::string: unified CCXT market symbol
- `side`::string, optional: one-way mode: 'buy' or 'sell', hedge-mode: 'long' or 'short'
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function closePosition(self::Bitget, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    productType = nothing;
    uta = nothing;
    response = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "closePosition", defaultValue = false));
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(side != nothing)
            request[Symbol("posSide")] = side;
        end
        request[Symbol("category")] = productType;
        response = Base.fetch(self.privateUtaPostV3TradeClosePositions(extend(request, params)));
    else
        if functions.ccxtruthy(side != nothing)
            request[Symbol("holdSide")] = side;
        end
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixPostV2MixOrderClosePositions(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    order = self.safeList2(data, "successList", "list", defaultValue = []);
    return self.parseOrder(get(order, 1, nothing), market = market)

end
"""
closes all open positions for a market type
see: https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
see: https://www.bitget.com/api-doc/uta/trade/Close-All-Positions

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.productType`::string, optional: 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- A list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function closeAllPositions(self::Bitget; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    productType = nothing;
    uta = nothing;
    response = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = nothing, params = params);
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "closeAllPositions", defaultValue = false));
    if functions.ccxtruthy(uta)
        request[Symbol("category")] = productType;
        response = Base.fetch(self.privateUtaPostV3TradeClosePositions(extend(request, params)));
    else
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.privateMixPostV2MixOrderClosePositions(extend(request, params)));
    end
    data = safeValue(response, "data", Dict{Symbol, Any}());
    orderInfo = self.safeList2(data, "successList", "list", defaultValue = []);
    return self.parsePositions(orderInfo, symbols = nothing, params = params)

end
"""
fetches the margin mode of a trading pair
see: https://www.bitget.com/api-doc/contract/account/Get-Single-Account

# Arguments
- `symbol`::string: unified symbol of the market to fetch the margin mode for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginMode(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginCoin") => get(market, Symbol("settleId"), nothing),
        Symbol("productType") => productType
    );
    response = Base.fetch(self.privateMixGetV2MixAccountAccount(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginMode(data, market = market)

end
function parseMarginMode(self::Bitget, marginMode; market=nothing)
    marginType = safeString(marginMode, "marginMode");
    marginType = functions.ccxtruthy((marginType == "crossed")) ? "cross" : marginType;
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => marginType
)

end
"""
fetches historical positions
see: https://www.bitget.com/api-doc/contract/position/Get-History-Position
see: https://www.bitget.com/api-doc/uta/trade/Get-Position-History

# Arguments
- `symbols`::array, optional: unified contract symbols
- `since`::int, optional: timestamp in ms of the earliest position to fetch, default=3 months ago, max range for params["until"] - since is 3 months
- `limit`::int, optional: the maximum amount of records to fetch, default=20, max=100
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest position to fetch, max range for params["until"] - since is 3 months
- `params.productType`::string, optional: USDT-FUTURES (default), COIN-FUTURES, USDC-FUTURES, SUSDT-FUTURES, SCOIN-FUTURES, or SUSDC-FUTURES
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionsHistory(self::Bitget; symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    productType = nothing;
    uta = nothing;
    response = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 0))
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchPositionsHistory", defaultValue = false));
    if functions.ccxtruthy(uta)
        request[Symbol("category")] = productType;
        response = Base.fetch(self.privateUtaGetV3PositionHistoryPosition(extend(request, params)));
    else
        response = Base.fetch(self.privateMixGetV2MixPositionHistoryPosition(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    responseList = self.safeList(data, "list", defaultValue = []);
    positions = self.parsePositions(responseList, symbols = symbols, params = params);
    return self.filterBySinceLimit(positions, since = since, limit = limit)

end
"""
fetch a quote for converting from one currency to another
see: https://www.bitget.com/api-doc/common/convert/Get-Quoted-Price

# Arguments
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertQuote(self::Bitget, fromCode, toCode; amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("fromCoin") => fromCode,
        Symbol("toCoin") => toCode,
        Symbol("fromCoinSize") => numberToString(amount)
    );
    response = Base.fetch(self.privateConvertGetV2ConvertQuotedPrice(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    fromCurrencyId = safeString(data, "fromCoin", fromCode);
    fromCurrency = self.currency(fromCurrencyId);
    toCurrencyId = safeString(data, "toCoin", toCode);
    toCurrency = self.currency(toCurrencyId);
    return self.parseConversion(data, fromCurrency = fromCurrency, toCurrency = toCurrency)

end
"""
convert from one currency to another
see: https://www.bitget.com/api-doc/common/convert/Trade

# Arguments
- `id`::string: the id of the trade that you want to make
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.price`::string: the price of the conversion, obtained from fetchConvertQuote()
- `params.toAmount`::string: the amount you want to trade in units of the toCurrency, obtained from fetchConvertQuote()

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function createConvertTrade(self::Bitget, id, fromCode, toCode; amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    price = safeString2(params, "price", "cnvtPrice");
    if functions.ccxtruthy(price == nothing)
        throw(ArgumentsRequired(string(self.id, " createConvertTrade() requires a price parameter")));
    end
    toAmount = safeString2(params, "toAmount", "toCoinSize");
    if functions.ccxtruthy(toAmount == nothing)
        throw(ArgumentsRequired(string(self.id, " createConvertTrade() requires a toAmount parameter")));
    end
    params = omit(params, ["price", "toAmount"]);
    request = Dict{Symbol, Any}(
        Symbol("traceId") => id,
        Symbol("fromCoin") => fromCode,
        Symbol("toCoin") => toCode,
        Symbol("fromCoinSize") => numberToString(amount),
        Symbol("toCoinSize") => toAmount,
        Symbol("cnvtPrice") => price
    );
    response = Base.fetch(self.privateConvertPostV2ConvertTrade(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    toCurrencyId = safeString(data, "toCoin", toCode);
    toCurrency = self.currency(toCurrencyId);
    return self.parseConversion(data, fromCurrency = nothing, toCurrency = toCurrency)

end
"""
fetch the users history of conversion trades
see: https://www.bitget.com/api-doc/common/convert/Get-Convert-Record

# Arguments
- `code`::string, optional: the unified currency code
- `since`::int, optional: the earliest time in ms to fetch conversions for
- `limit`::int, optional: the maximum number of conversion structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [conversion structures]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertTradeHistory(self::Bitget; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    msInDay = 86400000;
    now = milliseconds();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    else
        request[Symbol("startTime")] = now - msInDay;
    end
    endTime = safeString2(params, "endTime", "until");
    if functions.ccxtruthy(endTime != nothing)
        request[Symbol("endTime")] = endTime;
    else
        request[Symbol("endTime")] = now;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    params = omit(params, "until");
    response = Base.fetch(self.privateConvertGetV2ConvertConvertRecord(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    dataList = self.safeList(data, "dataList", defaultValue = []);
    return self.parseConversions(dataList, code = code, fromCurrencyKey = "fromCoin", toCurrencyKey = "toCoin", since = since, limit = limit)

end
function parseConversion(self::Bitget, conversion; fromCurrency=nothing, toCurrency=nothing)
    timestamp = safeInteger(conversion, "ts");
    fromCoin = safeString(conversion, "fromCoin");
    fromCode = self.safeCurrencyCode(fromCoin, currency = fromCurrency);
    to = safeString(conversion, "toCoin");
    toCode = self.safeCurrencyCode(to, currency = toCurrency);
    return Dict{Symbol, Any}(
    Symbol("info") => conversion,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString2(conversion, "id", "traceId"),
    Symbol("fromCurrency") => fromCode,
    Symbol("fromAmount") => self.safeNumber(conversion, "fromCoinSize"),
    Symbol("toCurrency") => toCode,
    Symbol("toAmount") => self.safeNumber(conversion, "toCoinSize"),
    Symbol("price") => self.safeNumber(conversion, "cnvtPrice"),
    Symbol("fee") => self.safeNumber(conversion, "fee")
)

end
"""
fetches all available currencies that can be converted
see: https://www.bitget.com/api-doc/common/convert/Get-Convert-Currencies

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchConvertCurrencies(self::Bitget; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateConvertGetV2ConvertCurrencies(params));
    result = Dict{Symbol, Any}();
    data = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        id = safeString(entry, "coin");
        code = self.safeCurrencyCode(id);
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = Dict{Symbol, Any}(
                Symbol("info") => entry,
                Symbol("id") => id,
                Symbol("code") => code,
                Symbol("networks") => nothing,
                Symbol("type") => nothing,
                Symbol("name") => nothing,
                Symbol("active") => nothing,
                Symbol("deposit") => nothing,
                Symbol("withdraw") => self.safeNumber(entry, "available"),
                Symbol("fee") => nothing,
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("amount") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(entry, "minAmount"),
                        Symbol("max") => self.safeNumber(entry, "maxAmount")
                    ),
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => nothing,
                        Symbol("max") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => nothing,
                        Symbol("max") => nothing
                    )
                ),
                Symbol("created") => nothing
            );
        end
        i += 1
    end
    return result

end
"""
fetch the current funding rate interval
see: https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
see: https://www.bitget.com/api-doc/uta/public/Get-Current-Funding-Rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingInterval(self::Bitget, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    productType = nothing;
    (productType, params) = self.handleProductTypeAndParams(market = market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    uta = nothing;
    (uta, params) = Base.fetch(self.handleUTAAndParams(params, "fetchFundingInterval", defaultValue = false));
    if functions.ccxtruthy(uta)
        response = Base.fetch(self.publicUtaGetV3MarketCurrentFundRate(extend(request, params)));
    else
        request[Symbol("productType")] = productType;
        response = Base.fetch(self.publicMixGetV2MixMarketFundingTime(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    first_var = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseFundingRate(first_var, market = market)

end
"""
fetches the long short ratio history for a unified market symbol
see: https://www.bitget.com/api-doc/common/apidata/Margin-Ls-Ratio
see: https://www.bitget.com/api-doc/common/apidata/Account-Long-Short

# Arguments
- `symbol`::string: unified symbol of the market to fetch the long short ratio for
- `timeframe`::string, optional: the period for the ratio
- `since`::int, optional: the earliest time in ms to fetch ratios for
- `limit`::int, optional: the maximum number of long short ratio structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [long short ratio structures]{@link https://docs.ccxt.com/?id=long-short-ratio-structure}
"""
function fetchLongShortRatioHistory(self::Bitget; symbol=nothing, timeframe=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(timeframe != nothing)
        request[Symbol("period")] = timeframe;
    end
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("swap"), nothing), get(market, Symbol("future"), nothing)))
        response = Base.fetch(self.publicMixGetV2MixMarketAccountLongShort(extend(request, params)));
    else
        response = Base.fetch(self.publicMarginGetV2MarginMarketLongShortRatio(extend(request, params)));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseLongShortRatioHistory(data, market = market)

end
function parseLongShortRatio(self::Bitget, info; market=nothing)
    marketId = safeString(info, "symbol");
    timestamp = self.safeIntegerOmitZero(info, "ts");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timeframe") => nothing,
    Symbol("longShortRatio") => self.safeNumber2(info, "longShortRatio", "longShortAccountRatio")
)

end
function handleErrors(self::Bitget, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    message = safeString2(response, "err_msg", "msg");
    feedback = string(self.id, " ", body);
    nonEmptyMessage = (@functions.ccxt_and(@functions.ccxt_and((message != nothing), (message != "")), (message != "success")));
    if functions.ccxtruthy(nonEmptyMessage)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
    end
    errorCode = safeString2(response, "code", "err_code");
    nonZeroErrorCode = @functions.ccxt_and((errorCode != nothing), (errorCode != "00000"));
    if functions.ccxtruthy(nonZeroErrorCode)
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
    end
    if functions.ccxtruthy(@functions.ccxt_or(nonZeroErrorCode, nonEmptyMessage))
        throw(ExchangeError(feedback));
    end
    return nothing

end
function nonce(self::Bitget, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function sign(self::Bitget, path; api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
    signed = get(api, 1, nothing) == "private";
    endpoint = get(api, 2, nothing);
    pathPart = "/api";
    request = string("/", self.implodeParams(path, params));
    payload = string(pathPart, request);
    url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(endpoint), nothing)), payload);
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(signed), (method == "GET")))
        keys_var = objectKeys(query);
        keysLength = length(keys_var);
        if functions.ccxtruthy(functions.ccxt_gt(keysLength, 0))
            url = string(url, "?", self.urlencode(query));
        end
    end
    if functions.ccxtruthy(signed)
        self.checkRequiredCredentials();
        timestamp = string(self.nonce());
        auth = string(timestamp, method, payload);
        if functions.ccxtruthy(method == "POST")
            body = json(params);
            auth += body;
        else
            if functions.ccxtruthy(length(objectKeys(params)))
                sortedParams = keysort(params);
                queryInner = string("?", self.urlencode(sortedParams, true));
                if functions.ccxtruthy(findfirst("%24", queryInner) !== nothing)
                    queryInner = replace(queryInner, "%24" => "\$");
                end
                url += queryInner;
                auth += string("?", self.rawencode(sortedParams, true));
            end
        end
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256, "base64");
        broker = safeString(self.options, "broker");
        headers = Dict{Symbol, Any}(
            Symbol("ACCESS-KEY") => self.apiKey,
            Symbol("ACCESS-SIGN") => signature,
            Symbol("ACCESS-TIMESTAMP") => timestamp,
            Symbol("ACCESS-PASSPHRASE") => self.password,
            Symbol("X-CHANNEL-API-CODE") => broker
        );
        if functions.ccxtruthy(method == "POST")
            headers[Symbol("Content-Type")] = "application/json";
        end
    end
    sandboxMode = self.safeBool2(self.options, "sandboxMode", "sandbox", defaultValue = false);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(sandboxMode, (path != "v2/public/time")), (path != "v3/market/current-fund-rate")))
        if functions.ccxtruthy(headers == nothing)
            headers = Dict{Symbol, Any}();
        end
        productType = safeString(params, "productType");
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((productType != "SCOIN-FUTURES"), (productType != "SUSDT-FUTURES")), (productType != "SUSDC-FUTURES")))
            headers[Symbol("PAPTRADING")] = "1";
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bitget, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicCommonGetV2PublicAnnoucements(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/public/annoucements"; api=["public", "common"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicCommonGetV2PublicTime(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/public/time"; api=["public", "common"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1NoticeQueryAllNotices(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/notice/queryAllNotices"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1PublicTime(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/public/time"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1PublicCurrencies(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/public/currencies"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1PublicProducts(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/public/products"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1PublicProduct(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/public/product"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1MarketTicker(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/market/ticker"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1MarketTickers(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/market/tickers"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1MarketFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/market/fills"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1MarketFillsHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/market/fills-history"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1MarketCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/market/candles"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1MarketDepth(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/market/depth"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1MarketSpotVipLevel(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/market/spot-vip-level"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1MarketMergeDepth(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/market/merge-depth"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1MarketHistoryCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/market/history-candles"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1PublicLoanCoinInfos(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/public/loan/coinInfos"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSpotV1PublicLoanHourInterest(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/public/loan/hour-interest"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SpotPublicCoins(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/public/coins"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SpotPublicSymbols(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/public/symbols"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SpotMarketVipFeeRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/market/vip-fee-rate"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SpotMarketTickers(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/market/tickers"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SpotMarketMergeDepth(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/market/merge-depth"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SpotMarketOrderbook(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/market/orderbook"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SpotMarketCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/market/candles"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SpotMarketHistoryCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/market/history-candles"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SpotMarketFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/market/fills"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetV2SpotMarketFillsHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/market/fills-history"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketContracts(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/contracts"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketDepth(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/depth"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketTicker(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/ticker"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketTickers(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/tickers"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketContractVipLevel(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/contract-vip-level"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/fills"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketFillsHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/fills-history"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/candles"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketIndex(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/index"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketFundingTime(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/funding-time"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketHistoryFundRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/history-fundRate"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketCurrentFundRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/current-fundRate"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketOpenInterest(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/open-interest"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketMarkPrice(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/mark-price"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketSymbolLeverage(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/symbol-leverage"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketQueryPositionLever(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/queryPositionLever"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketOpenLimit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/open-limit"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketHistoryCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/history-candles"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketHistoryIndexCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/history-index-candles"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketHistoryMarkCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/history-mark-candles"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetMixV1MarketMergeDepth(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/market/merge-depth"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketVipFeeRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/vip-fee-rate"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketUnionInterestRateHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/union-interest-rate-history"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketExchangeRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/exchange-rate"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketDiscountRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/discount-rate"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketMergeDepth(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/merge-depth"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketTicker(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/ticker"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketTickers(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/tickers"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/fills"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketFillsHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/fills-history"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/candles"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketHistoryCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/history-candles"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketHistoryIndexCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/history-index-candles"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketHistoryMarkCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/history-mark-candles"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketOpenInterest(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/open-interest"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketFundingTime(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/funding-time"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketSymbolPrice(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/symbol-price"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketHistoryFundRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/history-fund-rate"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketCurrentFundRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/current-fund-rate"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketOiLimit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/oi-limit"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketContracts(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/contracts"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketQueryPositionLever(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/query-position-lever"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMixGetV2MixMarketAccountLongShort(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/account-long-short"; api=["public", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarginGetMarginV1CrossPublicInterestRateAndLimit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/public/interestRateAndLimit"; api=["public", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarginGetMarginV1IsolatedPublicInterestRateAndLimit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/public/interestRateAndLimit"; api=["public", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarginGetMarginV1CrossPublicTierData(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/public/tierData"; api=["public", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarginGetMarginV1IsolatedPublicTierData(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/public/tierData"; api=["public", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarginGetMarginV1PublicCurrencies(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/public/currencies"; api=["public", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarginGetV2MarginCurrencies(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/currencies"; api=["public", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicMarginGetV2MarginMarketLongShortRatio(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/market/long-short-ratio"; api=["public", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicEarnGetV2EarnLoanPublicCoinInfos(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/public/coinInfos"; api=["public", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicEarnGetV2EarnLoanPublicHourInterest(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/public/hour-interest"; api=["public", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketInstruments(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/instruments"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketTickers(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/tickers"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketOrderbook(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/orderbook"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/fills"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketProofOfReserves(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/proof-of-reserves"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketOpenInterest(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/open-interest"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/candles"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketHistoryCandles(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/history-candles"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketCurrentFundRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/current-fund-rate"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketHistoryFundRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/history-fund-rate"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketRiskReserve(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/risk-reserve"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketDiscountRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/discount-rate"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketMarginLoans(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/margin-loans"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketPositionTier(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/position-tier"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketOiLimit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/oi-limit"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicUtaGetV3MarketIndexComponents(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/market/index-components"; api=["public", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1WalletDepositAddress(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet/deposit-address"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1WalletWithdrawalList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet/withdrawal-list"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1WalletDepositList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet/deposit-list"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1AccountGetInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/account/getInfo"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1AccountAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/account/assets"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1AccountAssetsLite(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/account/assets-lite"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1AccountTransferRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/account/transferRecords"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1ConvertCurrencies(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/convert/currencies"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1ConvertConvertRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/convert/convert-record"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1LoanOngoingOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/loan/ongoing-orders"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1LoanRepayHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/loan/repay-history"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1LoanReviseHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/loan/revise-history"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1LoanBorrowHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/loan/borrow-history"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetSpotV1LoanDebts(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/loan/debts"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotTradeOrderInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/orderInfo"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotTradeUnfilledOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/unfilled-orders"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotTradeHistoryOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/history-orders"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotTradeFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/fills"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotTradeCurrentPlanOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/current-plan-order"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotTradeHistoryPlanOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/history-plan-order"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotAccountInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/account/info"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotAccountAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/account/assets"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotAccountSubaccountAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/account/subaccount-assets"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotAccountBills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/account/bills"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotAccountTransferRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/account/transferRecords"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2AccountFundingAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/account/funding-assets"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2AccountBotAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/account/bot-assets"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2AccountAllAccountBalance(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/account/all-account-balance"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotWalletDepositAddress(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/wallet/deposit-address"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotWalletDepositRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/wallet/deposit-records"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotWalletWithdrawalRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/wallet/withdrawal-records"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetV2SpotAccountUpgradeStatus(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/account/upgrade-status"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1WalletTransfer(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet/transfer"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1WalletTransferV2(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet/transfer-v2"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1WalletSubTransfer(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet/subTransfer"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1WalletWithdrawal(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet/withdrawal"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1WalletWithdrawalV2(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet/withdrawal-v2"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1WalletWithdrawalInner(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet/withdrawal-inner"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1WalletWithdrawalInnerV2(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/wallet/withdrawal-inner-v2"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1AccountSubAccountSpotAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/account/sub-account-spot-assets"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1AccountBills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/account/bills"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/orders"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeBatchOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/batch-orders"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/cancel-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeCancelOrderV2(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/cancel-order-v2"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeCancelSymbolOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/cancel-symbol-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeCancelBatchOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/cancel-batch-orders"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeCancelBatchOrdersV2(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/cancel-batch-orders-v2"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeOrderInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/orderInfo"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeOpenOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/open-orders"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/history"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TradeFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trade/fills"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1PlanPlacePlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/plan/placePlan"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1PlanModifyPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/plan/modifyPlan"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1PlanCancelPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/plan/cancelPlan"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1PlanCurrentPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/plan/currentPlan"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1PlanHistoryPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/plan/historyPlan"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1PlanBatchCancelPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/plan/batchCancelPlan"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1ConvertQuotedPrice(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/convert/quoted-price"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1ConvertTrade(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/convert/trade"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1LoanBorrow(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/loan/borrow"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1LoanRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/loan/repay"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1LoanRevisePledge(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/loan/revise-pledge"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceOrderOrderCurrentList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/order/orderCurrentList"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceOrderOrderHistoryList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/order/orderHistoryList"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceOrderCloseTrackingOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/order/closeTrackingOrder"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceOrderUpdateTpsl(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/order/updateTpsl"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceOrderFollowerEndOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/order/followerEndOrder"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceOrderSpotInfoList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/order/spotInfoList"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceConfigGetTraderSettings(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/config/getTraderSettings"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceConfigGetFollowerSettings(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/config/getFollowerSettings"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceUserMyTraders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/user/myTraders"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceConfigSetFollowerConfig(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/config/setFollowerConfig"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceUserMyFollowers(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/user/myFollowers"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceConfigSetProductCode(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/config/setProductCode"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceUserRemoveTrader(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/user/removeTrader"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceGetRemovableFollower(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/getRemovableFollower"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceUserRemoveFollower(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/user/removeFollower"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceProfitTotalProfitInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/profit/totalProfitInfo"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceProfitTotalProfitList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/profit/totalProfitList"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceProfitProfitHisList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/profit/profitHisList"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceProfitProfitHisDetailList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/profit/profitHisDetailList"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceProfitWaitProfitDetailList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/profit/waitProfitDetailList"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostSpotV1TraceUserGetTraderInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "spot/v1/trace/user/getTraderInfo"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotTradePlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/place-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotTradeCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/cancel-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotTradeBatchOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/batch-orders"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotTradeBatchCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/batch-cancel-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotTradeCancelSymbolOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/cancel-symbol-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotTradePlacePlanOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/place-plan-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotTradeModifyPlanOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/modify-plan-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotTradeCancelPlanOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/cancel-plan-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotTradeCancelReplaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/cancel-replace-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotTradeBatchCancelPlanOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/trade/batch-cancel-plan-order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotWalletTransfer(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/wallet/transfer"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotWalletSubaccountTransfer(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/wallet/subaccount-transfer"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotWalletWithdrawal(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/wallet/withdrawal"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotWalletCancelWithdrawal(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/wallet/cancel-withdrawal"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotWalletModifyDepositAccount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/wallet/modify-deposit-account"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostV2SpotAccountUpgrade(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/spot/account/upgrade"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1AccountAccount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/account/account"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1AccountAccounts(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/account/accounts"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1PositionSinglePosition(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/position/singlePosition"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1PositionSinglePositionV2(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/position/singlePosition-v2"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1PositionAllPosition(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/position/allPosition"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1PositionAllPositionV2(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/position/allPosition-v2"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1PositionHistoryPosition(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/position/history-position"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1AccountAccountBill(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/account/accountBill"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1AccountAccountBusinessBill(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/account/accountBusinessBill"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1OrderCurrent(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/current"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1OrderMarginCoinCurrent(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/marginCoinCurrent"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1OrderHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/history"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1OrderHistoryProductType(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/historyProductType"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1OrderDetail(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/detail"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1OrderFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/fills"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1OrderAllFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/allFills"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1PlanCurrentPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/currentPlan"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1PlanHistoryPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/historyPlan"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceCurrentTrack(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/currentTrack"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceFollowerOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/followerOrder"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceFollowerHistoryOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/followerHistoryOrders"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceHistoryTrack(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/historyTrack"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceSummary(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/summary"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceProfitSettleTokenIdGroup(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/profitSettleTokenIdGroup"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceProfitDateGroupList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/profitDateGroupList"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TradeProfitDateList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trade/profitDateList"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceWaitProfitDateList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/waitProfitDateList"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceTraderSymbols(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/traderSymbols"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceTraderList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/traderList"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceTraderDetail(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/traderDetail"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetMixV1TraceQueryTraceConfig(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/queryTraceConfig"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountAccount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/account"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountAccounts(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/accounts"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountSubAccountAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/sub-account-assets"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountInterestHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/interest-history"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountMaxOpen(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/max-open"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountLiqPrice(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/liq-price"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountOpenCount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/open-count"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountBill(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/bill"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountTransferLimits(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/transfer-limits"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountUnionConfig(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/union-config"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountSwitchUnionUsdt(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/switch-union-usdt"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixAccountIsolatedSymbols(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/isolated-symbols"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixMarketQueryPositionLever(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/query-position-lever"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixPositionSinglePosition(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/position/single-position"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixPositionAllPosition(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/position/all-position"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixPositionAdlRank(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/position/adlRank"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixPositionHistoryPosition(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/position/history-position"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixOrderDetail(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/detail"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixOrderFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/fills"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixOrderFillHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/fill-history"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixOrderOrdersPending(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/orders-pending"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixOrderOrdersHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/orders-history"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixOrderPlanSubOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/plan-sub-order"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixOrderOrdersPlanPending(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/orders-plan-pending"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixOrderOrdersPlanHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/orders-plan-history"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixGetV2MixMarketPositionLongShort(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/market/position-long-short"; api=["private", "mix"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1AccountSubAccountContractAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/account/sub-account-contract-assets"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1AccountOpenCount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/account/open-count"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1AccountSetLeverage(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/account/setLeverage"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1AccountSetMargin(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/account/setMargin"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1AccountSetMarginMode(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/account/setMarginMode"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1AccountSetPositionMode(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/account/setPositionMode"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1OrderPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/placeOrder"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1OrderBatchOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/batch-orders"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1OrderCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/cancel-order"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1OrderCancelBatchOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/cancel-batch-orders"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1OrderModifyOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/modifyOrder"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1OrderCancelSymbolOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/cancel-symbol-orders"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1OrderCancelAllOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/cancel-all-orders"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1OrderCloseAllPositions(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/order/close-all-positions"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1PlanPlacePlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/placePlan"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1PlanModifyPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/modifyPlan"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1PlanModifyPlanPreset(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/modifyPlanPreset"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1PlanPlaceTPSL(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/placeTPSL"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1PlanPlaceTrailStop(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/placeTrailStop"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1PlanPlacePositionsTPSL(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/placePositionsTPSL"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1PlanModifyTPSLPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/modifyTPSLPlan"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1PlanCancelPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/cancelPlan"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1PlanCancelSymbolPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/cancelSymbolPlan"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1PlanCancelAllPlan(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/plan/cancelAllPlan"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceCloseTrackOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/closeTrackOrder"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceModifyTPSL(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/modifyTPSL"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceCloseTrackOrderBySymbol(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/closeTrackOrderBySymbol"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceSetUpCopySymbols(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/setUpCopySymbols"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceFollowerSetBatchTraceConfig(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/followerSetBatchTraceConfig"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceFollowerCloseByTrackingNo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/followerCloseByTrackingNo"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceFollowerCloseByAll(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/followerCloseByAll"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceFollowerSetTpsl(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/followerSetTpsl"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceCancelCopyTrader(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/cancelCopyTrader"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceTraderUpdateConfig(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/traderUpdateConfig"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceMyTraderList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/myTraderList"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceMyFollowerList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/myFollowerList"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceRemoveFollower(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/removeFollower"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TracePublicGetFollowerConfig(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/public/getFollowerConfig"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceReportOrderHistoryList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/report/order/historyList"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceReportOrderCurrentList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/report/order/currentList"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceQueryTraderTpslRatioConfig(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/queryTraderTpslRatioConfig"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostMixV1TraceTraderUpdateTpslRatioConfig(self::Bitget, params=Dict(), context=Dict())
    return request(self, "mix/v1/trace/traderUpdateTpslRatioConfig"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixAccountSetAutoMargin(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/set-auto-margin"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixAccountSetLeverage(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/set-leverage"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixAccountSetAllLeverage(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/set-all-leverage"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixAccountSetMargin(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/set-margin"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixAccountSetAssetMode(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/set-asset-mode"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixAccountSetMarginMode(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/set-margin-mode"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixAccountUnionConvert(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/union-convert"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixAccountSetPositionMode(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/account/set-position-mode"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/place-order"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderClickBackhand(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/click-backhand"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderBatchPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/batch-place-order"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderModifyOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/modify-order"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/cancel-order"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderBatchCancelOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/batch-cancel-orders"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderClosePositions(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/close-positions"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderCancelAllOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/cancel-all-orders"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderPlaceTpslOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/place-tpsl-order"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderPlacePosTpsl(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/place-pos-tpsl"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderPlacePlanOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/place-plan-order"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderModifyTpslOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/modify-tpsl-order"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderModifyPlanOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/modify-plan-order"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMixPostV2MixOrderCancelPlanOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/mix/order/cancel-plan-order"; api=["private", "mix"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetUserV1FeeQuery(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/fee/query"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetUserV1SubVirtualList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/sub/virtual-list"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetUserV1SubVirtualApiList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/sub/virtual-api-list"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetUserV1TaxSpotRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/tax/spot-record"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetUserV1TaxFutureRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/tax/future-record"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetUserV1TaxMarginRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/tax/margin-record"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetUserV1TaxP2pRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/tax/p2p-record"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetV2UserVirtualSubaccountList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/user/virtual-subaccount-list"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetV2UserVirtualSubaccountApikeyList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/user/virtual-subaccount-apikey-list"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostUserV1SubVirtualCreate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/sub/virtual-create"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostUserV1SubVirtualModify(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/sub/virtual-modify"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostUserV1SubVirtualApiBatchCreate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/sub/virtual-api-batch-create"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostUserV1SubVirtualApiCreate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/sub/virtual-api-create"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostUserV1SubVirtualApiModify(self::Bitget, params=Dict(), context=Dict())
    return request(self, "user/v1/sub/virtual-api-modify"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostV2UserCreateVirtualSubaccount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/user/create-virtual-subaccount"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostV2UserModifyVirtualSubaccount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/user/modify-virtual-subaccount"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostV2UserBatchCreateSubaccountAndApikey(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/user/batch-create-subaccount-and-apikey"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostV2UserCreateVirtualSubaccountApikey(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/user/create-virtual-subaccount-apikey"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostV2UserModifyVirtualSubaccountApikey(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/user/modify-virtual-subaccount-apikey"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateP2pGetP2pV1MerchantMerchantList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "p2p/v1/merchant/merchantList"; api=["private", "p2p"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateP2pGetP2pV1MerchantMerchantInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "p2p/v1/merchant/merchantInfo"; api=["private", "p2p"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateP2pGetP2pV1MerchantAdvList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "p2p/v1/merchant/advList"; api=["private", "p2p"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateP2pGetP2pV1MerchantOrderList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "p2p/v1/merchant/orderList"; api=["private", "p2p"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateP2pGetV2P2pMerchantList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/p2p/merchantList"; api=["private", "p2p"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateP2pGetV2P2pMerchantInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/p2p/merchantInfo"; api=["private", "p2p"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateP2pGetV2P2pOrderList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/p2p/orderList"; api=["private", "p2p"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateP2pGetV2P2pAdvList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/p2p/advList"; api=["private", "p2p"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetBrokerV1AccountInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/info"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetBrokerV1AccountSubList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-list"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetBrokerV1AccountSubEmail(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-email"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetBrokerV1AccountSubSpotAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-spot-assets"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetBrokerV1AccountSubFutureAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-future-assets"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetBrokerV1AccountSubaccountTransfer(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/subaccount-transfer"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetBrokerV1AccountSubaccountDeposit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/subaccount-deposit"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetBrokerV1AccountSubaccountWithdrawal(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/subaccount-withdrawal"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetBrokerV1AccountSubApiList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-api-list"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetV2BrokerAccountInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/info"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetV2BrokerAccountSubaccountList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/subaccount-list"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetV2BrokerAccountSubaccountEmail(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/subaccount-email"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetV2BrokerAccountSubaccountSpotAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/subaccount-spot-assets"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetV2BrokerAccountSubaccountFutureAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/subaccount-future-assets"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerGetV2BrokerManageSubaccountApikeyList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/manage/subaccount-apikey-list"; api=["private", "broker"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostBrokerV1AccountSubCreate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-create"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostBrokerV1AccountSubModify(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-modify"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostBrokerV1AccountSubModifyEmail(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-modify-email"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostBrokerV1AccountSubAddress(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-address"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostBrokerV1AccountSubWithdrawal(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-withdrawal"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostBrokerV1AccountSubAutoTransfer(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-auto-transfer"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostBrokerV1AccountSubApiCreate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-api-create"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostBrokerV1AccountSubApiModify(self::Bitget, params=Dict(), context=Dict())
    return request(self, "broker/v1/account/sub-api-modify"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostV2BrokerAccountModifySubaccountEmail(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/modify-subaccount-email"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostV2BrokerAccountCreateSubaccount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/create-subaccount"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostV2BrokerAccountModifySubaccount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/modify-subaccount"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostV2BrokerAccountSubaccountAddress(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/subaccount-address"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostV2BrokerAccountSubaccountWithdrawal(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/subaccount-withdrawal"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostV2BrokerAccountSetSubaccountAutotransfer(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/account/set-subaccount-autotransfer"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostV2BrokerManageCreateSubaccountApikey(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/manage/create-subaccount-apikey"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateBrokerPostV2BrokerManageModifySubaccountApikey(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/broker/manage/modify-subaccount-apikey"; api=["private", "broker"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossAccountRiskRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/account/riskRate"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossAccountMaxTransferOutAmount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/account/maxTransferOutAmount"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1IsolatedAccountMaxTransferOutAmount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/account/maxTransferOutAmount"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1IsolatedOrderOpenOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/order/openOrders"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1IsolatedOrderHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/order/history"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1IsolatedOrderFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/order/fills"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1IsolatedLoanList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/loan/list"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1IsolatedRepayList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/repay/list"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1IsolatedInterestList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/interest/list"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1IsolatedLiquidationList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/liquidation/list"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1IsolatedFinList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/fin/list"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossOrderOpenOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/order/openOrders"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossOrderHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/order/history"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossOrderFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/order/fills"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossLoanList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/loan/list"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossRepayList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/repay/list"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossInterestList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/interest/list"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossLiquidationList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/liquidation/list"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossFinList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/fin/list"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1CrossAccountAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/account/assets"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetMarginV1IsolatedAccountAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/account/assets"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedBorrowHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/borrow-history"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedRepayHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/repay-history"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedInterestHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/interest-history"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedLiquidationHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/liquidation-history"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedFinancialRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/financial-records"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedAccountAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/account/assets"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedAccountRiskRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/account/risk-rate"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedAccountMaxBorrowableAmount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/account/max-borrowable-amount"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedAccountMaxTransferOutAmount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/account/max-transfer-out-amount"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedInterestRateAndLimit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/interest-rate-and-limit"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedTierData(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/tier-data"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedOpenOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/open-orders"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedHistoryOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/history-orders"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginCrossedFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/fills"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedBorrowHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/borrow-history"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedRepayHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/repay-history"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedInterestHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/interest-history"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedLiquidationHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/liquidation-history"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedFinancialRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/financial-records"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedAccountAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/account/assets"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedAccountRiskRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/account/risk-rate"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedAccountMaxBorrowableAmount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/account/max-borrowable-amount"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedAccountMaxTransferOutAmount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/account/max-transfer-out-amount"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedInterestRateAndLimit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/interest-rate-and-limit"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedTierData(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/tier-data"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedOpenOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/open-orders"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedHistoryOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/history-orders"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginGetV2MarginIsolatedFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/fills"; api=["private", "margin"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1CrossAccountBorrow(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/account/borrow"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1IsolatedAccountBorrow(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/account/borrow"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1CrossAccountRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/account/repay"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1IsolatedAccountRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/account/repay"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1IsolatedAccountRiskRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/account/riskRate"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1CrossAccountMaxBorrowableAmount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/account/maxBorrowableAmount"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1IsolatedAccountMaxBorrowableAmount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/account/maxBorrowableAmount"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1IsolatedAccountFlashRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/account/flashRepay"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1IsolatedAccountQueryFlashRepayStatus(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/account/queryFlashRepayStatus"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1CrossAccountFlashRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/account/flashRepay"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1CrossAccountQueryFlashRepayStatus(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/account/queryFlashRepayStatus"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1IsolatedOrderPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/order/placeOrder"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1IsolatedOrderBatchPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/order/batchPlaceOrder"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1IsolatedOrderCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/order/cancelOrder"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1IsolatedOrderBatchCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/isolated/order/batchCancelOrder"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1CrossOrderPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/order/placeOrder"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1CrossOrderBatchPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/order/batchPlaceOrder"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1CrossOrderCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/order/cancelOrder"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostMarginV1CrossOrderBatchCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "margin/v1/cross/order/batchCancelOrder"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginCrossedAccountBorrow(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/account/borrow"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginCrossedAccountRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/account/repay"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginCrossedAccountFlashRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/account/flash-repay"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginCrossedAccountQueryFlashRepayStatus(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/account/query-flash-repay-status"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginCrossedPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/place-order"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginCrossedBatchPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/batch-place-order"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginCrossedCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/cancel-order"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginCrossedBatchCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/crossed/batch-cancel-order"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginIsolatedAccountBorrow(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/account/borrow"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginIsolatedAccountRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/account/repay"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginIsolatedAccountFlashRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/account/flash-repay"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginIsolatedAccountQueryFlashRepayStatus(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/account/query-flash-repay-status"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginIsolatedPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/place-order"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginIsolatedBatchPlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/batch-place-order"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginIsolatedCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/cancel-order"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateMarginPostV2MarginIsolatedBatchCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/margin/isolated/batch-cancel-order"; api=["private", "margin"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixTraderOrderCurrentTrack(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/order-current-track"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixTraderOrderHistoryTrack(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/order-history-track"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixTraderOrderTotalDetail(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/order-total-detail"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixTraderProfitHistorySummarys(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/profit-history-summarys"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixTraderProfitHistoryDetails(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/profit-history-details"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixTraderProfitDetails(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/profit-details"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixTraderProfitsGroupCoinDate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/profits-group-coin-date"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixTraderConfigQuerySymbols(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/config-query-symbols"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixTraderConfigQueryFollowers(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/config-query-followers"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixFollowerQueryCurrentOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-follower/query-current-orders"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixFollowerQueryHistoryOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-follower/query-history-orders"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixFollowerQuerySettings(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-follower/query-settings"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixFollowerQueryTraders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-follower/query-traders"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixFollowerQueryQuantityLimit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-follower/query-quantity-limit"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixBrokerQueryTraders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-broker/query-traders"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixBrokerQueryHistoryTraces(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-broker/query-history-traces"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopyMixBrokerQueryCurrentTraces(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-broker/query-current-traces"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotTraderProfitSummarys(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/profit-summarys"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotTraderProfitHistoryDetails(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/profit-history-details"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotTraderProfitDetails(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/profit-details"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotTraderOrderTotalDetail(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/order-total-detail"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotTraderOrderHistoryTrack(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/order-history-track"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotTraderOrderCurrentTrack(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/order-current-track"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotTraderConfigQuerySettings(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/config-query-settings"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotTraderConfigQueryFollowers(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/config-query-followers"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotFollowerQueryTraders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-follower/query-traders"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotFollowerQueryTraderSymbols(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-follower/query-trader-symbols"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotFollowerQuerySettings(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-follower/query-settings"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotFollowerQueryHistoryOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-follower/query-history-orders"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyGetV2CopySpotFollowerQueryCurrentOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-follower/query-current-orders"; api=["private", "copy"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopyMixTraderOrderModifyTpsl(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/order-modify-tpsl"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopyMixTraderOrderClosePositions(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/order-close-positions"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopyMixTraderConfigSettingSymbols(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/config-setting-symbols"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopyMixTraderConfigSettingBase(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/config-setting-base"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopyMixTraderConfigRemoveFollower(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-trader/config-remove-follower"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopyMixFollowerSettingTpsl(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-follower/setting-tpsl"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopyMixFollowerSettings(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-follower/settings"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopyMixFollowerClosePositions(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-follower/close-positions"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopyMixFollowerCancelTrader(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/mix-follower/cancel-trader"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopySpotTraderOrderModifyTpsl(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/order-modify-tpsl"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopySpotTraderOrderCloseTracking(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/order-close-tracking"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopySpotTraderConfigSettingSymbols(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/config-setting-symbols"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopySpotTraderConfigRemoveFollower(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-trader/config-remove-follower"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopySpotFollowerStopOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-follower/stop-order"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopySpotFollowerSettings(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-follower/settings"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopySpotFollowerSettingTpsl(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-follower/setting-tpsl"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopySpotFollowerOrderCloseTracking(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-follower/order-close-tracking"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCopyPostV2CopySpotFollowerCancelTrader(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/copy/spot-follower/cancel-trader"; api=["private", "copy"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTaxGetV2TaxSpotRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/tax/spot-record"; api=["private", "tax"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTaxGetV2TaxFutureRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/tax/future-record"; api=["private", "tax"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTaxGetV2TaxMarginRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/tax/margin-record"; api=["private", "tax"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateTaxGetV2TaxP2pRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/tax/p2p-record"; api=["private", "tax"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateConvertGetV2ConvertCurrencies(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/convert/currencies"; api=["private", "convert"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateConvertGetV2ConvertQuotedPrice(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/convert/quoted-price"; api=["private", "convert"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateConvertGetV2ConvertConvertRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/convert/convert-record"; api=["private", "convert"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateConvertGetV2ConvertBgbConvertCoinList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/convert/bgb-convert-coin-list"; api=["private", "convert"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateConvertGetV2ConvertBgbConvertRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/convert/bgb-convert-records"; api=["private", "convert"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateConvertPostV2ConvertTrade(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/convert/trade"; api=["private", "convert"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateConvertPostV2ConvertBgbConvert(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/convert/bgb-convert"; api=["private", "convert"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSavingsProduct(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/savings/product"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSavingsAccount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/savings/account"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSavingsAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/savings/assets"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSavingsRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/savings/records"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSavingsSubscribeInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/savings/subscribe-info"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSavingsSubscribeResult(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/savings/subscribe-result"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSavingsRedeemResult(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/savings/redeem-result"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSharkfinProduct(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/sharkfin/product"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSharkfinAccount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/sharkfin/account"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSharkfinAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/sharkfin/assets"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSharkfinRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/sharkfin/records"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSharkfinSubscribeInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/sharkfin/subscribe-info"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnSharkfinSubscribeResult(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/sharkfin/subscribe-result"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnLoanOngoingOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/ongoing-orders"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnLoanRepayHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/repay-history"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnLoanReviseHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/revise-history"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnLoanBorrowHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/borrow-history"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnLoanDebts(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/debts"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnLoanReduces(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/reduces"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnGetV2EarnAccountAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/account/assets"; api=["private", "earn"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnPostV2EarnSavingsSubscribe(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/savings/subscribe"; api=["private", "earn"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnPostV2EarnSavingsRedeem(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/savings/redeem"; api=["private", "earn"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnPostV2EarnSharkfinSubscribe(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/sharkfin/subscribe"; api=["private", "earn"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnPostV2EarnLoanBorrow(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/borrow"; api=["private", "earn"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnPostV2EarnLoanRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/repay"; api=["private", "earn"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateEarnPostV2EarnLoanRevisePledge(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/earn/loan/revise-pledge"; api=["private", "earn"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateCommonGetV2CommonTradeRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v2/common/trade-rate"; api=["private", "common"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/assets"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountFundingAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/funding-assets"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountSettings(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/settings"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountFinancialRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/financial-records"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountRepayableCoins(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/repayable-coins"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountPaymentCoins(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/payment-coins"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountConvertRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/convert-records"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountDeductInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/deduct-info"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountFeeRate(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/fee-rate"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountSwitchStatus(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/switch-status"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountMaxTransferable(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/max-transferable"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountOpenInterestLimit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/open-interest-limit"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountSubUnifiedAssets(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/sub-unified-assets"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountTransferableCoins(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/transferable-coins"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountSubTransferRecord(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/sub-transfer-record"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountDepositAddress(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/deposit-address"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountSubDepositAddress(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/sub-deposit-address"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountDepositRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/deposit-records"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountSubDepositRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/sub-deposit-records"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3AccountWithdrawalRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/withdrawal-records"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3BrokerSubList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/sub-list"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3BrokerAllSubDepositWithdrawal(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/all-sub-deposit-withdrawal"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3BrokerCommission(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/commission"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3BrokerQuerySubApikey(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/query-sub-apikey"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3InsLoanTransfered(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/ins-loan/transfered"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3InsLoanSymbols(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/ins-loan/symbols"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3InsLoanRiskUnit(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/ins-loan/risk-unit"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3InsLoanRepaidHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/ins-loan/repaid-history"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3InsLoanProductInfos(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/ins-loan/product-infos"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3InsLoanLoanOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/ins-loan/loan-order"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3InsLoanLtvConvert(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/ins-loan/ltv-convert"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3InsLoanEnsureCoinsConvert(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/ins-loan/ensure-coins-convert"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3LoanCoins(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/coins"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3LoanInterest(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/interest"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3LoanBorrowOngoing(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/borrow-ongoing"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3LoanBorrowHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/borrow-history"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3LoanRepayHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/repay-history"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3LoanPledgeRateHistory(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/pledge-rate-history"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3LoanDebts(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/debts"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3LoanReduces(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/reduces"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3PositionCurrentPosition(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/position/current-position"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3PositionHistoryPosition(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/position/history-position"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3PositionAdlRank(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/position/adlRank"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3TaxRecords(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/tax/records"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3TradeOrderInfo(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/order-info"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3TradeUnfilledOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/unfilled-orders"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3TradeUnfilledStrategyOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/unfilled-strategy-orders"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3TradeHistoryOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/history-orders"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3TradeHistoryStrategyOrders(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/history-strategy-orders"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3TradeFills(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/fills"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3UserSubList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/user/sub-list"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaGetV3UserSubApiList(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/user/sub-api-list"; api=["private", "uta"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountSetLeverage(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/set-leverage"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountSetHoldMode(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/set-hold-mode"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/repay"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountSwitchDeduct(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/switch-deduct"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountDepositAccount(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/deposit-account"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountSwitch(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/switch"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountAdjustAccountMode(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/adjust-account-mode"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountTransfer(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/transfer"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountSubTransfer(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/sub-transfer"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountSubMasterTransfer(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/sub-master-transfer"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountMaxOpenAvailable(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/max-open-available"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3AccountWithdrawal(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/account/withdrawal"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3BrokerCreateSub(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/create-sub"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3BrokerModifySub(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/modify-sub"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3BrokerSubWithdrawal(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/sub-withdrawal"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3BrokerSubDepositAddress(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/sub-deposit-address"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3BrokerCreateSubApikey(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/create-sub-apikey"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3BrokerModifySubApikey(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/modify-sub-apikey"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3BrokerDeleteSubApikey(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/broker/delete-sub-apikey"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3InsLoanBindUid(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/ins-loan/bind-uid"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3LoanBorrow(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/borrow"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3LoanRepay(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/repay"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3LoanRevisePledge(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/loan/revise-pledge"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradePlaceOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/place-order"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradePlaceStrategyOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/place-strategy-order"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradeModifyOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/modify-order"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradeModifyStrategyOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/modify-strategy-order"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradeCancelOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/cancel-order"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradeCancelStrategyOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/cancel-strategy-order"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradePlaceBatch(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/place-batch"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradeBatchModifyOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/batch-modify-order"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradeCancelBatch(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/cancel-batch"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradeCancelSymbolOrder(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/cancel-symbol-order"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradeClosePositions(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/close-positions"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3TradeCountdownCancelAll(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/trade/countdown-cancel-all"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3UserCreateSub(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/user/create-sub"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3UserFreezeSub(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/user/freeze-sub"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3UserCreateSubApi(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/user/create-sub-api"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3UserUpdateSubApi(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/user/update-sub-api"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUtaPostV3UserDeleteSubApi(self::Bitget, params=Dict(), context=Dict())
    return request(self, "v3/user/delete-sub-api"; api=["private", "uta"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bitget(; kwargs...)
    inst = Bitget(Exchange(), describe, setSandboxMode, enableDemoTrading, handleProductTypeAndParams, handleUTAAndParams, fetchTime, fetchMarkets, fetchDefaultMarkets, fetchUtaMarkets, fetchCurrencies, parseCurrency, fetchMarketLeverageTiers, parseMarketLeverageTiers, fetchDeposits, withdraw, fetchWithdrawals, parseTransaction, parseTransactionStatus, fetchDepositAddress, parseDepositAddress, fetchOrderBook, parseTicker, fetchTicker, fetchMarkPrice, fetchTickers, parseTrade, fetchTrades, fetchTradingFee, fetchTradingFees, parseTradingFee, parseOHLCV, fetchOHLCV, fetchBalance, parseUtaBalance, parseBalance, parseOrderStatus, parseOrder, createMarketBuyOrderWithCost, createOrder, createUtaOrderRequest, createOrderRequest, createUtaOrders, createOrders, editOrder, cancelOrder, cancelUtaOrders, cancelOrders, cancelAllOrders, fetchOrder, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchCanceledAndClosedOrders, fetchUtaCanceledAndClosedOrders, fetchLedger, parseLedgerEntry, parseLedgerType, fetchMyTrades, fetchPosition, fetchPositions, parsePosition, fetchFundingRateHistory, fetchFundingRate, fetchFundingRates, fetchFundingIntervals, parseFundingRate, fetchFundingHistory, parseFundingHistory, parseFundingHistories, modifyMarginHelper, parseMarginModification, reduceMargin, addMargin, fetchLeverage, parseLeverage, setLeverage, setMarginMode, setPositionMode, fetchOpenInterest, parseOpenInterest, fetchTransfers, transfer, parseTransfer, parseTransferStatus, parseDepositWithdrawFee, fetchDepositWithdrawFees, borrowCrossMargin, borrowIsolatedMargin, repayIsolatedMargin, repayCrossMargin, parseMarginLoan, fetchMyLiquidations, parseLiquidation, fetchIsolatedBorrowRate, parseIsolatedBorrowRate, fetchCrossBorrowRate, parseBorrowRate, fetchBorrowInterest, parseBorrowInterest, closePosition, closeAllPositions, fetchMarginMode, parseMarginMode, fetchPositionsHistory, fetchConvertQuote, createConvertTrade, fetchConvertTradeHistory, parseConversion, fetchConvertCurrencies, fetchFundingInterval, fetchLongShortRatioHistory, parseLongShortRatio, handleErrors, nonce, sign, publicCommonGetV2PublicAnnoucements, publicCommonGetV2PublicTime, publicSpotGetSpotV1NoticeQueryAllNotices, publicSpotGetSpotV1PublicTime, publicSpotGetSpotV1PublicCurrencies, publicSpotGetSpotV1PublicProducts, publicSpotGetSpotV1PublicProduct, publicSpotGetSpotV1MarketTicker, publicSpotGetSpotV1MarketTickers, publicSpotGetSpotV1MarketFills, publicSpotGetSpotV1MarketFillsHistory, publicSpotGetSpotV1MarketCandles, publicSpotGetSpotV1MarketDepth, publicSpotGetSpotV1MarketSpotVipLevel, publicSpotGetSpotV1MarketMergeDepth, publicSpotGetSpotV1MarketHistoryCandles, publicSpotGetSpotV1PublicLoanCoinInfos, publicSpotGetSpotV1PublicLoanHourInterest, publicSpotGetV2SpotPublicCoins, publicSpotGetV2SpotPublicSymbols, publicSpotGetV2SpotMarketVipFeeRate, publicSpotGetV2SpotMarketTickers, publicSpotGetV2SpotMarketMergeDepth, publicSpotGetV2SpotMarketOrderbook, publicSpotGetV2SpotMarketCandles, publicSpotGetV2SpotMarketHistoryCandles, publicSpotGetV2SpotMarketFills, publicSpotGetV2SpotMarketFillsHistory, publicMixGetMixV1MarketContracts, publicMixGetMixV1MarketDepth, publicMixGetMixV1MarketTicker, publicMixGetMixV1MarketTickers, publicMixGetMixV1MarketContractVipLevel, publicMixGetMixV1MarketFills, publicMixGetMixV1MarketFillsHistory, publicMixGetMixV1MarketCandles, publicMixGetMixV1MarketIndex, publicMixGetMixV1MarketFundingTime, publicMixGetMixV1MarketHistoryFundRate, publicMixGetMixV1MarketCurrentFundRate, publicMixGetMixV1MarketOpenInterest, publicMixGetMixV1MarketMarkPrice, publicMixGetMixV1MarketSymbolLeverage, publicMixGetMixV1MarketQueryPositionLever, publicMixGetMixV1MarketOpenLimit, publicMixGetMixV1MarketHistoryCandles, publicMixGetMixV1MarketHistoryIndexCandles, publicMixGetMixV1MarketHistoryMarkCandles, publicMixGetMixV1MarketMergeDepth, publicMixGetV2MixMarketVipFeeRate, publicMixGetV2MixMarketUnionInterestRateHistory, publicMixGetV2MixMarketExchangeRate, publicMixGetV2MixMarketDiscountRate, publicMixGetV2MixMarketMergeDepth, publicMixGetV2MixMarketTicker, publicMixGetV2MixMarketTickers, publicMixGetV2MixMarketFills, publicMixGetV2MixMarketFillsHistory, publicMixGetV2MixMarketCandles, publicMixGetV2MixMarketHistoryCandles, publicMixGetV2MixMarketHistoryIndexCandles, publicMixGetV2MixMarketHistoryMarkCandles, publicMixGetV2MixMarketOpenInterest, publicMixGetV2MixMarketFundingTime, publicMixGetV2MixMarketSymbolPrice, publicMixGetV2MixMarketHistoryFundRate, publicMixGetV2MixMarketCurrentFundRate, publicMixGetV2MixMarketOiLimit, publicMixGetV2MixMarketContracts, publicMixGetV2MixMarketQueryPositionLever, publicMixGetV2MixMarketAccountLongShort, publicMarginGetMarginV1CrossPublicInterestRateAndLimit, publicMarginGetMarginV1IsolatedPublicInterestRateAndLimit, publicMarginGetMarginV1CrossPublicTierData, publicMarginGetMarginV1IsolatedPublicTierData, publicMarginGetMarginV1PublicCurrencies, publicMarginGetV2MarginCurrencies, publicMarginGetV2MarginMarketLongShortRatio, publicEarnGetV2EarnLoanPublicCoinInfos, publicEarnGetV2EarnLoanPublicHourInterest, publicUtaGetV3MarketInstruments, publicUtaGetV3MarketTickers, publicUtaGetV3MarketOrderbook, publicUtaGetV3MarketFills, publicUtaGetV3MarketProofOfReserves, publicUtaGetV3MarketOpenInterest, publicUtaGetV3MarketCandles, publicUtaGetV3MarketHistoryCandles, publicUtaGetV3MarketCurrentFundRate, publicUtaGetV3MarketHistoryFundRate, publicUtaGetV3MarketRiskReserve, publicUtaGetV3MarketDiscountRate, publicUtaGetV3MarketMarginLoans, publicUtaGetV3MarketPositionTier, publicUtaGetV3MarketOiLimit, publicUtaGetV3MarketIndexComponents, privateSpotGetSpotV1WalletDepositAddress, privateSpotGetSpotV1WalletWithdrawalList, privateSpotGetSpotV1WalletDepositList, privateSpotGetSpotV1AccountGetInfo, privateSpotGetSpotV1AccountAssets, privateSpotGetSpotV1AccountAssetsLite, privateSpotGetSpotV1AccountTransferRecords, privateSpotGetSpotV1ConvertCurrencies, privateSpotGetSpotV1ConvertConvertRecord, privateSpotGetSpotV1LoanOngoingOrders, privateSpotGetSpotV1LoanRepayHistory, privateSpotGetSpotV1LoanReviseHistory, privateSpotGetSpotV1LoanBorrowHistory, privateSpotGetSpotV1LoanDebts, privateSpotGetV2SpotTradeOrderInfo, privateSpotGetV2SpotTradeUnfilledOrders, privateSpotGetV2SpotTradeHistoryOrders, privateSpotGetV2SpotTradeFills, privateSpotGetV2SpotTradeCurrentPlanOrder, privateSpotGetV2SpotTradeHistoryPlanOrder, privateSpotGetV2SpotAccountInfo, privateSpotGetV2SpotAccountAssets, privateSpotGetV2SpotAccountSubaccountAssets, privateSpotGetV2SpotAccountBills, privateSpotGetV2SpotAccountTransferRecords, privateSpotGetV2AccountFundingAssets, privateSpotGetV2AccountBotAssets, privateSpotGetV2AccountAllAccountBalance, privateSpotGetV2SpotWalletDepositAddress, privateSpotGetV2SpotWalletDepositRecords, privateSpotGetV2SpotWalletWithdrawalRecords, privateSpotGetV2SpotAccountUpgradeStatus, privateSpotPostSpotV1WalletTransfer, privateSpotPostSpotV1WalletTransferV2, privateSpotPostSpotV1WalletSubTransfer, privateSpotPostSpotV1WalletWithdrawal, privateSpotPostSpotV1WalletWithdrawalV2, privateSpotPostSpotV1WalletWithdrawalInner, privateSpotPostSpotV1WalletWithdrawalInnerV2, privateSpotPostSpotV1AccountSubAccountSpotAssets, privateSpotPostSpotV1AccountBills, privateSpotPostSpotV1TradeOrders, privateSpotPostSpotV1TradeBatchOrders, privateSpotPostSpotV1TradeCancelOrder, privateSpotPostSpotV1TradeCancelOrderV2, privateSpotPostSpotV1TradeCancelSymbolOrder, privateSpotPostSpotV1TradeCancelBatchOrders, privateSpotPostSpotV1TradeCancelBatchOrdersV2, privateSpotPostSpotV1TradeOrderInfo, privateSpotPostSpotV1TradeOpenOrders, privateSpotPostSpotV1TradeHistory, privateSpotPostSpotV1TradeFills, privateSpotPostSpotV1PlanPlacePlan, privateSpotPostSpotV1PlanModifyPlan, privateSpotPostSpotV1PlanCancelPlan, privateSpotPostSpotV1PlanCurrentPlan, privateSpotPostSpotV1PlanHistoryPlan, privateSpotPostSpotV1PlanBatchCancelPlan, privateSpotPostSpotV1ConvertQuotedPrice, privateSpotPostSpotV1ConvertTrade, privateSpotPostSpotV1LoanBorrow, privateSpotPostSpotV1LoanRepay, privateSpotPostSpotV1LoanRevisePledge, privateSpotPostSpotV1TraceOrderOrderCurrentList, privateSpotPostSpotV1TraceOrderOrderHistoryList, privateSpotPostSpotV1TraceOrderCloseTrackingOrder, privateSpotPostSpotV1TraceOrderUpdateTpsl, privateSpotPostSpotV1TraceOrderFollowerEndOrder, privateSpotPostSpotV1TraceOrderSpotInfoList, privateSpotPostSpotV1TraceConfigGetTraderSettings, privateSpotPostSpotV1TraceConfigGetFollowerSettings, privateSpotPostSpotV1TraceUserMyTraders, privateSpotPostSpotV1TraceConfigSetFollowerConfig, privateSpotPostSpotV1TraceUserMyFollowers, privateSpotPostSpotV1TraceConfigSetProductCode, privateSpotPostSpotV1TraceUserRemoveTrader, privateSpotPostSpotV1TraceGetRemovableFollower, privateSpotPostSpotV1TraceUserRemoveFollower, privateSpotPostSpotV1TraceProfitTotalProfitInfo, privateSpotPostSpotV1TraceProfitTotalProfitList, privateSpotPostSpotV1TraceProfitProfitHisList, privateSpotPostSpotV1TraceProfitProfitHisDetailList, privateSpotPostSpotV1TraceProfitWaitProfitDetailList, privateSpotPostSpotV1TraceUserGetTraderInfo, privateSpotPostV2SpotTradePlaceOrder, privateSpotPostV2SpotTradeCancelOrder, privateSpotPostV2SpotTradeBatchOrders, privateSpotPostV2SpotTradeBatchCancelOrder, privateSpotPostV2SpotTradeCancelSymbolOrder, privateSpotPostV2SpotTradePlacePlanOrder, privateSpotPostV2SpotTradeModifyPlanOrder, privateSpotPostV2SpotTradeCancelPlanOrder, privateSpotPostV2SpotTradeCancelReplaceOrder, privateSpotPostV2SpotTradeBatchCancelPlanOrder, privateSpotPostV2SpotWalletTransfer, privateSpotPostV2SpotWalletSubaccountTransfer, privateSpotPostV2SpotWalletWithdrawal, privateSpotPostV2SpotWalletCancelWithdrawal, privateSpotPostV2SpotWalletModifyDepositAccount, privateSpotPostV2SpotAccountUpgrade, privateMixGetMixV1AccountAccount, privateMixGetMixV1AccountAccounts, privateMixGetMixV1PositionSinglePosition, privateMixGetMixV1PositionSinglePositionV2, privateMixGetMixV1PositionAllPosition, privateMixGetMixV1PositionAllPositionV2, privateMixGetMixV1PositionHistoryPosition, privateMixGetMixV1AccountAccountBill, privateMixGetMixV1AccountAccountBusinessBill, privateMixGetMixV1OrderCurrent, privateMixGetMixV1OrderMarginCoinCurrent, privateMixGetMixV1OrderHistory, privateMixGetMixV1OrderHistoryProductType, privateMixGetMixV1OrderDetail, privateMixGetMixV1OrderFills, privateMixGetMixV1OrderAllFills, privateMixGetMixV1PlanCurrentPlan, privateMixGetMixV1PlanHistoryPlan, privateMixGetMixV1TraceCurrentTrack, privateMixGetMixV1TraceFollowerOrder, privateMixGetMixV1TraceFollowerHistoryOrders, privateMixGetMixV1TraceHistoryTrack, privateMixGetMixV1TraceSummary, privateMixGetMixV1TraceProfitSettleTokenIdGroup, privateMixGetMixV1TraceProfitDateGroupList, privateMixGetMixV1TradeProfitDateList, privateMixGetMixV1TraceWaitProfitDateList, privateMixGetMixV1TraceTraderSymbols, privateMixGetMixV1TraceTraderList, privateMixGetMixV1TraceTraderDetail, privateMixGetMixV1TraceQueryTraceConfig, privateMixGetV2MixAccountAccount, privateMixGetV2MixAccountAccounts, privateMixGetV2MixAccountSubAccountAssets, privateMixGetV2MixAccountInterestHistory, privateMixGetV2MixAccountMaxOpen, privateMixGetV2MixAccountLiqPrice, privateMixGetV2MixAccountOpenCount, privateMixGetV2MixAccountBill, privateMixGetV2MixAccountTransferLimits, privateMixGetV2MixAccountUnionConfig, privateMixGetV2MixAccountSwitchUnionUsdt, privateMixGetV2MixAccountIsolatedSymbols, privateMixGetV2MixMarketQueryPositionLever, privateMixGetV2MixPositionSinglePosition, privateMixGetV2MixPositionAllPosition, privateMixGetV2MixPositionAdlRank, privateMixGetV2MixPositionHistoryPosition, privateMixGetV2MixOrderDetail, privateMixGetV2MixOrderFills, privateMixGetV2MixOrderFillHistory, privateMixGetV2MixOrderOrdersPending, privateMixGetV2MixOrderOrdersHistory, privateMixGetV2MixOrderPlanSubOrder, privateMixGetV2MixOrderOrdersPlanPending, privateMixGetV2MixOrderOrdersPlanHistory, privateMixGetV2MixMarketPositionLongShort, privateMixPostMixV1AccountSubAccountContractAssets, privateMixPostMixV1AccountOpenCount, privateMixPostMixV1AccountSetLeverage, privateMixPostMixV1AccountSetMargin, privateMixPostMixV1AccountSetMarginMode, privateMixPostMixV1AccountSetPositionMode, privateMixPostMixV1OrderPlaceOrder, privateMixPostMixV1OrderBatchOrders, privateMixPostMixV1OrderCancelOrder, privateMixPostMixV1OrderCancelBatchOrders, privateMixPostMixV1OrderModifyOrder, privateMixPostMixV1OrderCancelSymbolOrders, privateMixPostMixV1OrderCancelAllOrders, privateMixPostMixV1OrderCloseAllPositions, privateMixPostMixV1PlanPlacePlan, privateMixPostMixV1PlanModifyPlan, privateMixPostMixV1PlanModifyPlanPreset, privateMixPostMixV1PlanPlaceTPSL, privateMixPostMixV1PlanPlaceTrailStop, privateMixPostMixV1PlanPlacePositionsTPSL, privateMixPostMixV1PlanModifyTPSLPlan, privateMixPostMixV1PlanCancelPlan, privateMixPostMixV1PlanCancelSymbolPlan, privateMixPostMixV1PlanCancelAllPlan, privateMixPostMixV1TraceCloseTrackOrder, privateMixPostMixV1TraceModifyTPSL, privateMixPostMixV1TraceCloseTrackOrderBySymbol, privateMixPostMixV1TraceSetUpCopySymbols, privateMixPostMixV1TraceFollowerSetBatchTraceConfig, privateMixPostMixV1TraceFollowerCloseByTrackingNo, privateMixPostMixV1TraceFollowerCloseByAll, privateMixPostMixV1TraceFollowerSetTpsl, privateMixPostMixV1TraceCancelCopyTrader, privateMixPostMixV1TraceTraderUpdateConfig, privateMixPostMixV1TraceMyTraderList, privateMixPostMixV1TraceMyFollowerList, privateMixPostMixV1TraceRemoveFollower, privateMixPostMixV1TracePublicGetFollowerConfig, privateMixPostMixV1TraceReportOrderHistoryList, privateMixPostMixV1TraceReportOrderCurrentList, privateMixPostMixV1TraceQueryTraderTpslRatioConfig, privateMixPostMixV1TraceTraderUpdateTpslRatioConfig, privateMixPostV2MixAccountSetAutoMargin, privateMixPostV2MixAccountSetLeverage, privateMixPostV2MixAccountSetAllLeverage, privateMixPostV2MixAccountSetMargin, privateMixPostV2MixAccountSetAssetMode, privateMixPostV2MixAccountSetMarginMode, privateMixPostV2MixAccountUnionConvert, privateMixPostV2MixAccountSetPositionMode, privateMixPostV2MixOrderPlaceOrder, privateMixPostV2MixOrderClickBackhand, privateMixPostV2MixOrderBatchPlaceOrder, privateMixPostV2MixOrderModifyOrder, privateMixPostV2MixOrderCancelOrder, privateMixPostV2MixOrderBatchCancelOrders, privateMixPostV2MixOrderClosePositions, privateMixPostV2MixOrderCancelAllOrders, privateMixPostV2MixOrderPlaceTpslOrder, privateMixPostV2MixOrderPlacePosTpsl, privateMixPostV2MixOrderPlacePlanOrder, privateMixPostV2MixOrderModifyTpslOrder, privateMixPostV2MixOrderModifyPlanOrder, privateMixPostV2MixOrderCancelPlanOrder, privateUserGetUserV1FeeQuery, privateUserGetUserV1SubVirtualList, privateUserGetUserV1SubVirtualApiList, privateUserGetUserV1TaxSpotRecord, privateUserGetUserV1TaxFutureRecord, privateUserGetUserV1TaxMarginRecord, privateUserGetUserV1TaxP2pRecord, privateUserGetV2UserVirtualSubaccountList, privateUserGetV2UserVirtualSubaccountApikeyList, privateUserPostUserV1SubVirtualCreate, privateUserPostUserV1SubVirtualModify, privateUserPostUserV1SubVirtualApiBatchCreate, privateUserPostUserV1SubVirtualApiCreate, privateUserPostUserV1SubVirtualApiModify, privateUserPostV2UserCreateVirtualSubaccount, privateUserPostV2UserModifyVirtualSubaccount, privateUserPostV2UserBatchCreateSubaccountAndApikey, privateUserPostV2UserCreateVirtualSubaccountApikey, privateUserPostV2UserModifyVirtualSubaccountApikey, privateP2pGetP2pV1MerchantMerchantList, privateP2pGetP2pV1MerchantMerchantInfo, privateP2pGetP2pV1MerchantAdvList, privateP2pGetP2pV1MerchantOrderList, privateP2pGetV2P2pMerchantList, privateP2pGetV2P2pMerchantInfo, privateP2pGetV2P2pOrderList, privateP2pGetV2P2pAdvList, privateBrokerGetBrokerV1AccountInfo, privateBrokerGetBrokerV1AccountSubList, privateBrokerGetBrokerV1AccountSubEmail, privateBrokerGetBrokerV1AccountSubSpotAssets, privateBrokerGetBrokerV1AccountSubFutureAssets, privateBrokerGetBrokerV1AccountSubaccountTransfer, privateBrokerGetBrokerV1AccountSubaccountDeposit, privateBrokerGetBrokerV1AccountSubaccountWithdrawal, privateBrokerGetBrokerV1AccountSubApiList, privateBrokerGetV2BrokerAccountInfo, privateBrokerGetV2BrokerAccountSubaccountList, privateBrokerGetV2BrokerAccountSubaccountEmail, privateBrokerGetV2BrokerAccountSubaccountSpotAssets, privateBrokerGetV2BrokerAccountSubaccountFutureAssets, privateBrokerGetV2BrokerManageSubaccountApikeyList, privateBrokerPostBrokerV1AccountSubCreate, privateBrokerPostBrokerV1AccountSubModify, privateBrokerPostBrokerV1AccountSubModifyEmail, privateBrokerPostBrokerV1AccountSubAddress, privateBrokerPostBrokerV1AccountSubWithdrawal, privateBrokerPostBrokerV1AccountSubAutoTransfer, privateBrokerPostBrokerV1AccountSubApiCreate, privateBrokerPostBrokerV1AccountSubApiModify, privateBrokerPostV2BrokerAccountModifySubaccountEmail, privateBrokerPostV2BrokerAccountCreateSubaccount, privateBrokerPostV2BrokerAccountModifySubaccount, privateBrokerPostV2BrokerAccountSubaccountAddress, privateBrokerPostV2BrokerAccountSubaccountWithdrawal, privateBrokerPostV2BrokerAccountSetSubaccountAutotransfer, privateBrokerPostV2BrokerManageCreateSubaccountApikey, privateBrokerPostV2BrokerManageModifySubaccountApikey, privateMarginGetMarginV1CrossAccountRiskRate, privateMarginGetMarginV1CrossAccountMaxTransferOutAmount, privateMarginGetMarginV1IsolatedAccountMaxTransferOutAmount, privateMarginGetMarginV1IsolatedOrderOpenOrders, privateMarginGetMarginV1IsolatedOrderHistory, privateMarginGetMarginV1IsolatedOrderFills, privateMarginGetMarginV1IsolatedLoanList, privateMarginGetMarginV1IsolatedRepayList, privateMarginGetMarginV1IsolatedInterestList, privateMarginGetMarginV1IsolatedLiquidationList, privateMarginGetMarginV1IsolatedFinList, privateMarginGetMarginV1CrossOrderOpenOrders, privateMarginGetMarginV1CrossOrderHistory, privateMarginGetMarginV1CrossOrderFills, privateMarginGetMarginV1CrossLoanList, privateMarginGetMarginV1CrossRepayList, privateMarginGetMarginV1CrossInterestList, privateMarginGetMarginV1CrossLiquidationList, privateMarginGetMarginV1CrossFinList, privateMarginGetMarginV1CrossAccountAssets, privateMarginGetMarginV1IsolatedAccountAssets, privateMarginGetV2MarginCrossedBorrowHistory, privateMarginGetV2MarginCrossedRepayHistory, privateMarginGetV2MarginCrossedInterestHistory, privateMarginGetV2MarginCrossedLiquidationHistory, privateMarginGetV2MarginCrossedFinancialRecords, privateMarginGetV2MarginCrossedAccountAssets, privateMarginGetV2MarginCrossedAccountRiskRate, privateMarginGetV2MarginCrossedAccountMaxBorrowableAmount, privateMarginGetV2MarginCrossedAccountMaxTransferOutAmount, privateMarginGetV2MarginCrossedInterestRateAndLimit, privateMarginGetV2MarginCrossedTierData, privateMarginGetV2MarginCrossedOpenOrders, privateMarginGetV2MarginCrossedHistoryOrders, privateMarginGetV2MarginCrossedFills, privateMarginGetV2MarginIsolatedBorrowHistory, privateMarginGetV2MarginIsolatedRepayHistory, privateMarginGetV2MarginIsolatedInterestHistory, privateMarginGetV2MarginIsolatedLiquidationHistory, privateMarginGetV2MarginIsolatedFinancialRecords, privateMarginGetV2MarginIsolatedAccountAssets, privateMarginGetV2MarginIsolatedAccountRiskRate, privateMarginGetV2MarginIsolatedAccountMaxBorrowableAmount, privateMarginGetV2MarginIsolatedAccountMaxTransferOutAmount, privateMarginGetV2MarginIsolatedInterestRateAndLimit, privateMarginGetV2MarginIsolatedTierData, privateMarginGetV2MarginIsolatedOpenOrders, privateMarginGetV2MarginIsolatedHistoryOrders, privateMarginGetV2MarginIsolatedFills, privateMarginPostMarginV1CrossAccountBorrow, privateMarginPostMarginV1IsolatedAccountBorrow, privateMarginPostMarginV1CrossAccountRepay, privateMarginPostMarginV1IsolatedAccountRepay, privateMarginPostMarginV1IsolatedAccountRiskRate, privateMarginPostMarginV1CrossAccountMaxBorrowableAmount, privateMarginPostMarginV1IsolatedAccountMaxBorrowableAmount, privateMarginPostMarginV1IsolatedAccountFlashRepay, privateMarginPostMarginV1IsolatedAccountQueryFlashRepayStatus, privateMarginPostMarginV1CrossAccountFlashRepay, privateMarginPostMarginV1CrossAccountQueryFlashRepayStatus, privateMarginPostMarginV1IsolatedOrderPlaceOrder, privateMarginPostMarginV1IsolatedOrderBatchPlaceOrder, privateMarginPostMarginV1IsolatedOrderCancelOrder, privateMarginPostMarginV1IsolatedOrderBatchCancelOrder, privateMarginPostMarginV1CrossOrderPlaceOrder, privateMarginPostMarginV1CrossOrderBatchPlaceOrder, privateMarginPostMarginV1CrossOrderCancelOrder, privateMarginPostMarginV1CrossOrderBatchCancelOrder, privateMarginPostV2MarginCrossedAccountBorrow, privateMarginPostV2MarginCrossedAccountRepay, privateMarginPostV2MarginCrossedAccountFlashRepay, privateMarginPostV2MarginCrossedAccountQueryFlashRepayStatus, privateMarginPostV2MarginCrossedPlaceOrder, privateMarginPostV2MarginCrossedBatchPlaceOrder, privateMarginPostV2MarginCrossedCancelOrder, privateMarginPostV2MarginCrossedBatchCancelOrder, privateMarginPostV2MarginIsolatedAccountBorrow, privateMarginPostV2MarginIsolatedAccountRepay, privateMarginPostV2MarginIsolatedAccountFlashRepay, privateMarginPostV2MarginIsolatedAccountQueryFlashRepayStatus, privateMarginPostV2MarginIsolatedPlaceOrder, privateMarginPostV2MarginIsolatedBatchPlaceOrder, privateMarginPostV2MarginIsolatedCancelOrder, privateMarginPostV2MarginIsolatedBatchCancelOrder, privateCopyGetV2CopyMixTraderOrderCurrentTrack, privateCopyGetV2CopyMixTraderOrderHistoryTrack, privateCopyGetV2CopyMixTraderOrderTotalDetail, privateCopyGetV2CopyMixTraderProfitHistorySummarys, privateCopyGetV2CopyMixTraderProfitHistoryDetails, privateCopyGetV2CopyMixTraderProfitDetails, privateCopyGetV2CopyMixTraderProfitsGroupCoinDate, privateCopyGetV2CopyMixTraderConfigQuerySymbols, privateCopyGetV2CopyMixTraderConfigQueryFollowers, privateCopyGetV2CopyMixFollowerQueryCurrentOrders, privateCopyGetV2CopyMixFollowerQueryHistoryOrders, privateCopyGetV2CopyMixFollowerQuerySettings, privateCopyGetV2CopyMixFollowerQueryTraders, privateCopyGetV2CopyMixFollowerQueryQuantityLimit, privateCopyGetV2CopyMixBrokerQueryTraders, privateCopyGetV2CopyMixBrokerQueryHistoryTraces, privateCopyGetV2CopyMixBrokerQueryCurrentTraces, privateCopyGetV2CopySpotTraderProfitSummarys, privateCopyGetV2CopySpotTraderProfitHistoryDetails, privateCopyGetV2CopySpotTraderProfitDetails, privateCopyGetV2CopySpotTraderOrderTotalDetail, privateCopyGetV2CopySpotTraderOrderHistoryTrack, privateCopyGetV2CopySpotTraderOrderCurrentTrack, privateCopyGetV2CopySpotTraderConfigQuerySettings, privateCopyGetV2CopySpotTraderConfigQueryFollowers, privateCopyGetV2CopySpotFollowerQueryTraders, privateCopyGetV2CopySpotFollowerQueryTraderSymbols, privateCopyGetV2CopySpotFollowerQuerySettings, privateCopyGetV2CopySpotFollowerQueryHistoryOrders, privateCopyGetV2CopySpotFollowerQueryCurrentOrders, privateCopyPostV2CopyMixTraderOrderModifyTpsl, privateCopyPostV2CopyMixTraderOrderClosePositions, privateCopyPostV2CopyMixTraderConfigSettingSymbols, privateCopyPostV2CopyMixTraderConfigSettingBase, privateCopyPostV2CopyMixTraderConfigRemoveFollower, privateCopyPostV2CopyMixFollowerSettingTpsl, privateCopyPostV2CopyMixFollowerSettings, privateCopyPostV2CopyMixFollowerClosePositions, privateCopyPostV2CopyMixFollowerCancelTrader, privateCopyPostV2CopySpotTraderOrderModifyTpsl, privateCopyPostV2CopySpotTraderOrderCloseTracking, privateCopyPostV2CopySpotTraderConfigSettingSymbols, privateCopyPostV2CopySpotTraderConfigRemoveFollower, privateCopyPostV2CopySpotFollowerStopOrder, privateCopyPostV2CopySpotFollowerSettings, privateCopyPostV2CopySpotFollowerSettingTpsl, privateCopyPostV2CopySpotFollowerOrderCloseTracking, privateCopyPostV2CopySpotFollowerCancelTrader, privateTaxGetV2TaxSpotRecord, privateTaxGetV2TaxFutureRecord, privateTaxGetV2TaxMarginRecord, privateTaxGetV2TaxP2pRecord, privateConvertGetV2ConvertCurrencies, privateConvertGetV2ConvertQuotedPrice, privateConvertGetV2ConvertConvertRecord, privateConvertGetV2ConvertBgbConvertCoinList, privateConvertGetV2ConvertBgbConvertRecords, privateConvertPostV2ConvertTrade, privateConvertPostV2ConvertBgbConvert, privateEarnGetV2EarnSavingsProduct, privateEarnGetV2EarnSavingsAccount, privateEarnGetV2EarnSavingsAssets, privateEarnGetV2EarnSavingsRecords, privateEarnGetV2EarnSavingsSubscribeInfo, privateEarnGetV2EarnSavingsSubscribeResult, privateEarnGetV2EarnSavingsRedeemResult, privateEarnGetV2EarnSharkfinProduct, privateEarnGetV2EarnSharkfinAccount, privateEarnGetV2EarnSharkfinAssets, privateEarnGetV2EarnSharkfinRecords, privateEarnGetV2EarnSharkfinSubscribeInfo, privateEarnGetV2EarnSharkfinSubscribeResult, privateEarnGetV2EarnLoanOngoingOrders, privateEarnGetV2EarnLoanRepayHistory, privateEarnGetV2EarnLoanReviseHistory, privateEarnGetV2EarnLoanBorrowHistory, privateEarnGetV2EarnLoanDebts, privateEarnGetV2EarnLoanReduces, privateEarnGetV2EarnAccountAssets, privateEarnPostV2EarnSavingsSubscribe, privateEarnPostV2EarnSavingsRedeem, privateEarnPostV2EarnSharkfinSubscribe, privateEarnPostV2EarnLoanBorrow, privateEarnPostV2EarnLoanRepay, privateEarnPostV2EarnLoanRevisePledge, privateCommonGetV2CommonTradeRate, privateUtaGetV3AccountAssets, privateUtaGetV3AccountFundingAssets, privateUtaGetV3AccountSettings, privateUtaGetV3AccountFinancialRecords, privateUtaGetV3AccountRepayableCoins, privateUtaGetV3AccountPaymentCoins, privateUtaGetV3AccountConvertRecords, privateUtaGetV3AccountDeductInfo, privateUtaGetV3AccountFeeRate, privateUtaGetV3AccountSwitchStatus, privateUtaGetV3AccountMaxTransferable, privateUtaGetV3AccountOpenInterestLimit, privateUtaGetV3AccountSubUnifiedAssets, privateUtaGetV3AccountTransferableCoins, privateUtaGetV3AccountSubTransferRecord, privateUtaGetV3AccountDepositAddress, privateUtaGetV3AccountSubDepositAddress, privateUtaGetV3AccountDepositRecords, privateUtaGetV3AccountSubDepositRecords, privateUtaGetV3AccountWithdrawalRecords, privateUtaGetV3BrokerSubList, privateUtaGetV3BrokerAllSubDepositWithdrawal, privateUtaGetV3BrokerCommission, privateUtaGetV3BrokerQuerySubApikey, privateUtaGetV3InsLoanTransfered, privateUtaGetV3InsLoanSymbols, privateUtaGetV3InsLoanRiskUnit, privateUtaGetV3InsLoanRepaidHistory, privateUtaGetV3InsLoanProductInfos, privateUtaGetV3InsLoanLoanOrder, privateUtaGetV3InsLoanLtvConvert, privateUtaGetV3InsLoanEnsureCoinsConvert, privateUtaGetV3LoanCoins, privateUtaGetV3LoanInterest, privateUtaGetV3LoanBorrowOngoing, privateUtaGetV3LoanBorrowHistory, privateUtaGetV3LoanRepayHistory, privateUtaGetV3LoanPledgeRateHistory, privateUtaGetV3LoanDebts, privateUtaGetV3LoanReduces, privateUtaGetV3PositionCurrentPosition, privateUtaGetV3PositionHistoryPosition, privateUtaGetV3PositionAdlRank, privateUtaGetV3TaxRecords, privateUtaGetV3TradeOrderInfo, privateUtaGetV3TradeUnfilledOrders, privateUtaGetV3TradeUnfilledStrategyOrders, privateUtaGetV3TradeHistoryOrders, privateUtaGetV3TradeHistoryStrategyOrders, privateUtaGetV3TradeFills, privateUtaGetV3UserSubList, privateUtaGetV3UserSubApiList, privateUtaPostV3AccountSetLeverage, privateUtaPostV3AccountSetHoldMode, privateUtaPostV3AccountRepay, privateUtaPostV3AccountSwitchDeduct, privateUtaPostV3AccountDepositAccount, privateUtaPostV3AccountSwitch, privateUtaPostV3AccountAdjustAccountMode, privateUtaPostV3AccountTransfer, privateUtaPostV3AccountSubTransfer, privateUtaPostV3AccountSubMasterTransfer, privateUtaPostV3AccountMaxOpenAvailable, privateUtaPostV3AccountWithdrawal, privateUtaPostV3BrokerCreateSub, privateUtaPostV3BrokerModifySub, privateUtaPostV3BrokerSubWithdrawal, privateUtaPostV3BrokerSubDepositAddress, privateUtaPostV3BrokerCreateSubApikey, privateUtaPostV3BrokerModifySubApikey, privateUtaPostV3BrokerDeleteSubApikey, privateUtaPostV3InsLoanBindUid, privateUtaPostV3LoanBorrow, privateUtaPostV3LoanRepay, privateUtaPostV3LoanRevisePledge, privateUtaPostV3TradePlaceOrder, privateUtaPostV3TradePlaceStrategyOrder, privateUtaPostV3TradeModifyOrder, privateUtaPostV3TradeModifyStrategyOrder, privateUtaPostV3TradeCancelOrder, privateUtaPostV3TradeCancelStrategyOrder, privateUtaPostV3TradePlaceBatch, privateUtaPostV3TradeBatchModifyOrder, privateUtaPostV3TradeCancelBatch, privateUtaPostV3TradeCancelSymbolOrder, privateUtaPostV3TradeClosePositions, privateUtaPostV3TradeCountdownCancelAll, privateUtaPostV3UserCreateSub, privateUtaPostV3UserFreezeSub, privateUtaPostV3UserCreateSubApi, privateUtaPostV3UserUpdateSubApi, privateUtaPostV3UserDeleteSubApi)
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
function __ccxt_doc_Bitget_setSandboxMode() end
"""
enables or disables demo trading mode, if enabled will send PAPTRADING=1 in headers
"""
__ccxt_doc_Bitget_setSandboxMode

function __ccxt_doc_Bitget_enableDemoTrading() end
"""
enables or disables demo trading mode, if enabled will send PAPTRADING=1 in headers
"""
__ccxt_doc_Bitget_enableDemoTrading

function __ccxt_doc_Bitget_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://www.bitget.com/api-doc/common/public/Get-Server-Time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Bitget_fetchTime

function __ccxt_doc_Bitget_fetchMarkets() end
"""
retrieves data on all markets for bitget
see: https://www.bitget.com/api-doc/spot/market/Get-Symbols
see: https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
see: https://www.bitget.com/api-doc/margin/common/support-currencies
see: https://www.bitget.com/api-doc/uta/public/Instruments

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bitget_fetchMarkets

function __ccxt_doc_Bitget_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://www.bitget.com/api-doc/spot/market/Get-Coin-List

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bitget_fetchCurrencies

function __ccxt_doc_Bitget_fetchMarketLeverageTiers() end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
see: https://www.bitget.com/api-doc/contract/position/Get-Query-Position-Lever
see: https://www.bitget.com/api-doc/margin/cross/account/Cross-Tier-Data
see: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Tier-Data
see: https://www.bitget.com/api-doc/uta/public/Get-Position-Tier-Data

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: for spot margin 'cross' or 'isolated', default is 'isolated'
- `params.code`::string, optional: required for cross spot margin
- `params.productType`::string, optional: *contract and uta only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
__ccxt_doc_Bitget_fetchMarketLeverageTiers

function __ccxt_doc_Bitget_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://www.bitget.com/api-doc/spot/account/Get-Deposit-Record

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in milliseconds
- `params.idLessThan`::string, optional: return records with id less than the provided value
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitget_fetchDeposits

function __ccxt_doc_Bitget_withdraw() end
"""
make a withdrawal
see: https://www.bitget.com/api-doc/spot/account/Wallet-Withdrawal

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.chain`::string, optional: the blockchain network the withdrawal is taking place on

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitget_withdraw

function __ccxt_doc_Bitget_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://www.bitget.com/api-doc/spot/account/Get-Withdraw-Record

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in milliseconds
- `params.idLessThan`::string, optional: return records with id less than the provided value
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bitget_fetchWithdrawals

function __ccxt_doc_Bitget_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://www.bitget.com/api-doc/spot/account/Get-Deposit-Address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Bitget_fetchDepositAddress

function __ccxt_doc_Bitget_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.bitget.com/api-doc/spot/market/Get-Orderbook
see: https://www.bitget.com/api-doc/contract/market/Get-Merge-Depth
see: https://www.bitget.com/api-doc/uta/public/OrderBook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bitget_fetchOrderBook

function __ccxt_doc_Bitget_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.bitget.com/api-doc/spot/market/Get-Tickers
see: https://www.bitget.com/api-doc/contract/market/Get-Ticker
see: https://www.bitget.com/api-doc/uta/public/Tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bitget_fetchTicker

function __ccxt_doc_Bitget_fetchMarkPrice() end
"""
fetches the mark price for a specific market
see: https://www.bitget.com/api-doc/contract/market/Get-Symbol-Price

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bitget_fetchMarkPrice

function __ccxt_doc_Bitget_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.bitget.com/api-doc/spot/market/Get-Tickers
see: https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker
see: https://www.bitget.com/api-doc/uta/public/Tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.subType`::string, optional: *contract only* 'linear', 'inverse'
- `params.productType`::string, optional: *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bitget_fetchTickers

function __ccxt_doc_Bitget_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://www.bitget.com/api-doc/spot/market/Get-Recent-Trades
see: https://www.bitget.com/api-doc/spot/market/Get-Market-Trades
see: https://www.bitget.com/api-doc/contract/market/Get-Recent-Fills
see: https://www.bitget.com/api-doc/contract/market/Get-Fills-History
see: https://www.bitget.com/api-doc/uta/public/Fills

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.until`::int, optional: *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* the latest time in ms to fetch trades for
- `params.paginate`::bool, optional: *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* default false, when true will automatically paginate by calling this endpoint multiple times

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bitget_fetchTrades

function __ccxt_doc_Bitget_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://www.bitget.com/api-doc/common/public/Get-Trade-Rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'isolated' or 'cross', for finding the fee rate of spot margin trading pairs

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bitget_fetchTradingFee

function __ccxt_doc_Bitget_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://www.bitget.com/api-doc/spot/market/Get-Symbols
see: https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
see: https://www.bitget.com/api-doc/margin/common/support-currencies

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.productType`::string, optional: *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.margin`::bool, optional: set to true for spot margin

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Bitget_fetchTradingFees

function __ccxt_doc_Bitget_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.bitget.com/api-doc/spot/market/Get-Candle-Data
see: https://www.bitget.com/api-doc/spot/market/Get-History-Candle-Data
see: https://www.bitget.com/api-doc/contract/market/Get-Candle-Data
see: https://www.bitget.com/api-doc/contract/market/Get-History-Candle-Data
see: https://www.bitget.com/api-doc/contract/market/Get-History-Index-Candle-Data
see: https://www.bitget.com/api-doc/contract/market/Get-History-Mark-Candle-Data
see: https://www.bitget.com/api-doc/uta/public/Get-Candle-Data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.useHistoryEndpoint`::bool, optional: whether to force to use historical endpoint (it has max limit of 200)
- `params.useHistoryEndpointForPagination`::bool, optional: whether to force to use historical endpoint for pagination (default true)
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.price`::string, optional: *swap only* "mark" (to fetch mark price candles) or "index" (to fetch index price candles)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bitget_fetchOHLCV

function __ccxt_doc_Bitget_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.bitget.com/api-doc/spot/account/Get-Account-Assets
see: https://www.bitget.com/api-doc/contract/account/Get-Account-List
see: https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Assets
see: https://www.bitget.com/api-doc/margin/isolated/account/Get-Isolated-Assets
see: https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-assets
see: https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-assets
see: https://www.bitget.com/api-doc/uta/account/Get-Account
see: https://www.bitget.com/api-doc/uta/account/Get-Account-Funding-Assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.productType`::string, optional: *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.uta`::string, optional: set to true for the unified trading account (uta), defaults to false
- `params.type`::string, optional: 'funding' to fetch the uta funding-account assets (uta only, classic accounts route funding through 'spot')

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bitget_fetchBalance

function __ccxt_doc_Bitget_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost
see: https://www.bitget.com/api-doc/spot/trade/Place-Order
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_createMarketBuyOrderWithCost

function __ccxt_doc_Bitget_createOrder() end
"""
create a trade order
see: https://www.bitget.com/api-doc/spot/trade/Place-Order
see: https://www.bitget.com/api-doc/spot/plan/Place-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Place-Order
see: https://www.bitget.com/api-doc/contract/plan/Place-Tpsl-Order
see: https://www.bitget.com/api-doc/contract/plan/Place-Plan-Order
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order
see: https://www.bitget.com/api-doc/uta/trade/Place-Order
see: https://www.bitget.com/api-doc/uta/strategy/Place-Strategy-Order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders, and used as the execution price for contract stop-loss / take-profit orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cost`::float, optional: *spot only* how much you want to trade in units of the quote currency, for market buy orders only
- `params.triggerPrice`::float, optional: *swap only* The price at which a trigger order is triggered at
- `params.stopLossPrice`::float, optional: *swap only* The price at which a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: *swap only* The price at which a take profit order is triggered at
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
- `params.takeProfit.triggerPrice`::float, optional: *swap only* take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
- `params.stopLoss.triggerPrice`::float, optional: *swap only* stop loss trigger price
- `params.timeInForce`::string, optional: "GTC", "IOC", "FOK", or "PO"
- `params.marginMode`::string, optional: 'isolated' or 'cross' for spot margin trading
- `params.loanType`::string, optional: *spot margin only* 'normal', 'autoLoan', 'autoRepay', or 'autoLoanAndRepay' default is 'normal'
- `params.holdSide`::string, optional: *contract stopLossPrice, takeProfitPrice only* Two-way position: ('long' or 'short'), one-way position: ('buy' or 'sell')
- `params.stopLoss.price`::float, optional: *swap only* the execution price for a stop loss attached to a trigger order
- `params.takeProfit.price`::float, optional: *swap only* the execution price for a take profit attached to a trigger order
- `params.stopLoss.type`::string, optional: *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
- `params.takeProfit.type`::string, optional: *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
- `params.trailingPercent`::string, optional: *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10
- `params.trailingTriggerPrice`::string, optional: *swap and future only* the price to trigger a trailing stop order, default uses the price argument
- `params.triggerType`::string, optional: *swap and future only* 'fill_price', 'mark_price' or 'index_price'
- `params.oneWayMode`::bool, optional: *swap and future only* required to set this to true in one_way_mode and you can leave this as undefined in hedge_mode, can adjust the mode using the setPositionMode() method
- `params.hedged`::bool, optional: *swap and future only* true for hedged mode, false for one way mode, default is false
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce-only
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.posSide`::string, optional: *uta only* hedged two-way position side, long or short

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_createOrder

function __ccxt_doc_Bitget_createOrders() end
"""
create a list of trade orders (all orders should be of the same symbol)
see: https://www.bitget.com/api-doc/spot/trade/Batch-Place-Orders
see: https://www.bitget.com/api-doc/contract/trade/Batch-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Order
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Order
see: https://www.bitget.com/api-doc/uta/trade/Place-Batch

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the api endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_createOrders

function __ccxt_doc_Bitget_editOrder() end
"""
edit a trade order
see: https://www.bitget.com/api-doc/spot/plan/Modify-Plan-Order
see: https://www.bitget.com/api-doc/spot/trade/Cancel-Replace-Order
see: https://www.bitget.com/api-doc/contract/trade/Modify-Order
see: https://www.bitget.com/api-doc/contract/plan/Modify-Tpsl-Order
see: https://www.bitget.com/api-doc/contract/plan/Modify-Plan-Order
see: https://www.bitget.com/api-doc/uta/trade/Modify-Order
see: https://www.bitget.com/api-doc/uta/strategy/Modify-Strategy-Order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: the price that a trigger order is triggered at
- `params.stopLossPrice`::float, optional: *swap only* The price at which a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: *swap only* The price at which a take profit order is triggered at
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
- `params.takeProfit.triggerPrice`::float, optional: *swap only* take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
- `params.stopLoss.triggerPrice`::float, optional: *swap only* stop loss trigger price
- `params.stopLoss.price`::float, optional: *swap only* the execution price for a stop loss attached to a trigger order
- `params.takeProfit.price`::float, optional: *swap only* the execution price for a take profit attached to a trigger order
- `params.stopLoss.type`::string, optional: *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
- `params.takeProfit.type`::string, optional: *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
- `params.trailingPercent`::string, optional: *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10
- `params.trailingTriggerPrice`::string, optional: *swap and future only* the price to trigger a trailing stop order, default uses the price argument
- `params.newTriggerType`::string, optional: *swap and future only* 'fill_price', 'mark_price' or 'index_price'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_editOrder

function __ccxt_doc_Bitget_cancelOrder() end
"""
cancels an open order
see: https://www.bitget.com/api-doc/spot/trade/Cancel-Order
see: https://www.bitget.com/api-doc/spot/plan/Cancel-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Cancel-Order
see: https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Cancel-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Cancel-Order
see: https://www.bitget.com/api-doc/uta/trade/Cancel-Order
see: https://www.bitget.com/api-doc/uta/strategy/Cancel-Strategy-Order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'isolated' or 'cross' for spot margin trading
- `params.trigger`::bool, optional: set to true for canceling trigger orders
- `params.planType`::string, optional: *swap only* either profit_plan, loss_plan, normal_plan, pos_profit, pos_loss, moving_plan or track_plan
- `params.trailing`::bool, optional: set to true if you want to cancel a trailing order
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.clientOrderId`::string, optional: the clientOrderId of the order, id does not need to be provided if clientOrderId is provided

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_cancelOrder

function __ccxt_doc_Bitget_cancelOrders() end
"""
cancel multiple orders
see: https://www.bitget.com/api-doc/spot/trade/Batch-Cancel-Orders
see: https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
see: https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Cancel-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Cancel-Orders
see: https://www.bitget.com/api-doc/uta/trade/Cancel-Batch

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified market symbol, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'isolated' or 'cross' for spot margin trading
- `params.trigger`::bool, optional: *contract only* set to true for canceling trigger orders
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an array of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_cancelOrders

function __ccxt_doc_Bitget_cancelAllOrders() end
"""
cancel all open orders
see: https://www.bitget.com/api-doc/spot/trade/Cancel-Symbol-Orders
see: https://www.bitget.com/api-doc/spot/plan/Batch-Cancel-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
see: https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Cancel-Order
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Cancel-Orders

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'isolated' or 'cross' for spot margin trading
- `params.trigger`::bool, optional: *contract only* set to true for canceling trigger orders
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_cancelAllOrders

function __ccxt_doc_Bitget_fetchOrder() end
"""
fetches information on an order made by the user
see: https://www.bitget.com/api-doc/spot/trade/Get-Order-Info
see: https://www.bitget.com/api-doc/contract/trade/Get-Order-Details
see: https://www.bitget.com/api-doc/uta/trade/Get-Order-Details

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.clientOrderId`::string, optional: the clientOrderId of the order, id does not need to be provided if clientOrderId is provided

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_fetchOrder

function __ccxt_doc_Bitget_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://www.bitget.com/api-doc/spot/trade/Get-Unfilled-Orders
see: https://www.bitget.com/api-doc/spot/plan/Get-Current-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Get-Orders-Pending
see: https://www.bitget.com/api-doc/contract/plan/get-orders-plan-pending
see: https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Open-Orders
see: https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Open-Orders
see: https://www.bitget.com/api-doc/uta/strategy/Get-Unfilled-Strategy-Orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.planType`::string, optional: *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.isPlan`::string, optional: *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
- `params.trailing`::bool, optional: set to true if you want to fetch trailing orders
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_fetchOpenOrders

function __ccxt_doc_Bitget_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
see: https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
see: https://www.bitget.com/api-doc/contract/plan/orders-plan-history
see: https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
see: https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
see: https://www.bitget.com/api-doc/uta/trade/Get-Order-History

# Arguments
- `symbol`::string: unified market symbol of the closed orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of closed orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.planType`::string, optional: *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.isPlan`::string, optional: *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
- `params.trailing`::bool, optional: set to true if you want to fetch trailing orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_fetchClosedOrders

function __ccxt_doc_Bitget_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
see: https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
see: https://www.bitget.com/api-doc/contract/plan/orders-plan-history
see: https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
see: https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
see: https://www.bitget.com/api-doc/uta/trade/Get-Order-History

# Arguments
- `symbol`::string: unified market symbol of the canceled orders
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the max number of canceled orders to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.planType`::string, optional: *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.isPlan`::string, optional: *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
- `params.trailing`::bool, optional: set to true if you want to fetch trailing orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_fetchCanceledOrders

function __ccxt_doc_Bitget_fetchCanceledAndClosedOrders() end
"""
fetches information on multiple canceled and closed orders made by the user
see: https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
see: https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
see: https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
see: https://www.bitget.com/api-doc/contract/plan/orders-plan-history
see: https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
see: https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
see: https://www.bitget.com/api-doc/uta/trade/Get-Order-History
see: https://www.bitget.com/api-doc/uta/strategy/Get-History-Strategy-Orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.planType`::string, optional: *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.isPlan`::string, optional: *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
- `params.trailing`::bool, optional: set to true if you want to fetch trailing orders
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_fetchCanceledAndClosedOrders

function __ccxt_doc_Bitget_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.bitget.com/api-doc/spot/account/Get-Account-Bills
see: https://www.bitget.com/api-doc/contract/account/Get-Account-Bill

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in ms
- `params.symbol`::string, optional: *contract only* unified market symbol
- `params.productType`::string, optional: *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Bitget_fetchLedger

function __ccxt_doc_Bitget_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://www.bitget.com/api-doc/spot/trade/Get-Fills
see: https://www.bitget.com/api-doc/contract/trade/Get-Order-Fills
see: https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-Fills
see: https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Transaction-Details
see: https://www.bitget.com/api-doc/uta/trade/Get-Order-Fills

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch trades for
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bitget_fetchMyTrades

function __ccxt_doc_Bitget_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://www.bitget.com/api-doc/contract/position/get-single-position
see: https://www.bitget.com/api-doc/uta/trade/Get-Position

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bitget_fetchPosition

function __ccxt_doc_Bitget_fetchPositions() end
"""
fetch all open positions
see: https://www.bitget.com/api-doc/contract/position/get-all-position
see: https://www.bitget.com/api-doc/contract/position/Get-History-Position
see: https://www.bitget.com/api-doc/uta/trade/Get-Position

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginCoin`::string, optional: the settle currency of the positions, needs to match the productType
- `params.productType`::string, optional: 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.useHistoryEndpoint`::bool, optional: default false, when true  will use the historic endpoint to fetch positions
- `params.method`::string, optional: either (default) 'privateMixGetV2MixPositionAllPosition', 'privateMixGetV2MixPositionHistoryPosition', or 'privateUtaGetV3PositionCurrentPosition'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bitget_fetchPositions

function __ccxt_doc_Bitget_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://www.bitget.com/api-doc/contract/market/Get-History-Funding-Rate
see: https://www.bitget.com/api-doc/uta/public/Get-History-Funding-Rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of funding rate structures to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Bitget_fetchFundingRateHistory

function __ccxt_doc_Bitget_fetchFundingRate() end
"""
fetch the current funding rate
see: https://www.bitget.com/api-doc/contract/market/Get-Current-Funding-Rate
see: https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
see: https://www.bitget.com/api-doc/uta/public/Get-Current-Funding-Rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.method`::string, optional: either (default) 'publicMixGetV2MixMarketCurrentFundRate' or 'publicMixGetV2MixMarketFundingTime'

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Bitget_fetchFundingRate

function __ccxt_doc_Bitget_fetchFundingRates() end
"""
fetch the current funding rates for all markets
see: https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: *contract only* 'linear', 'inverse'
- `params.productType`::string, optional: *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.method`::string, optional: either (default) 'publicMixGetV2MixMarketTickers' or 'publicMixGetV2MixMarketCurrentFundRate'

# Returns
- a dictionary of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
__ccxt_doc_Bitget_fetchFundingRates

function __ccxt_doc_Bitget_fetchFundingIntervals() end
"""
fetch the funding rate interval for multiple markets
see: https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.productType`::string, optional: 'USDT-FUTURES' (default), 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Bitget_fetchFundingIntervals

function __ccxt_doc_Bitget_fetchFundingHistory() end
"""
fetch the funding history
see: https://www.bitget.com/api-doc/contract/account/Get-Account-Bill

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the starting timestamp in milliseconds
- `limit`::int, optional: the number of entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch funding history for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Bitget_fetchFundingHistory

function __ccxt_doc_Bitget_reduceMargin() end
"""
remove margin from a position
see: https://www.bitget.com/api-doc/contract/account/Change-Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Bitget_reduceMargin

function __ccxt_doc_Bitget_addMargin() end
"""
add margin
see: https://www.bitget.com/api-doc/contract/account/Change-Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Bitget_addMargin

function __ccxt_doc_Bitget_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://www.bitget.com/api-doc/contract/account/Get-Single-Account

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Bitget_fetchLeverage

function __ccxt_doc_Bitget_setLeverage() end
"""
set the level of leverage for a market
see: https://www.bitget.com/api-doc/contract/account/Change-Leverage
see: https://www.bitget.com/api-doc/uta/account/Change-Leverage

# Arguments
- `leverage`::int: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.holdSide`::string, optional: *isolated only* position direction, 'long' or 'short'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.posSide`::bool, optional: required for uta isolated margin, long or short

# Returns
- response from the exchange
"""
__ccxt_doc_Bitget_setLeverage

function __ccxt_doc_Bitget_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://www.bitget.com/api-doc/contract/account/Change-Margin-Mode

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Bitget_setMarginMode

function __ccxt_doc_Bitget_setPositionMode() end
"""
set hedged to true or false for a market
see: https://www.bitget.com/api-doc/contract/account/Change-Hold-Mode
see: https://www.bitget.com/api-doc/uta/account/Change-Position-Mode

# Arguments
- `hedged`::bool: set to true to use dualSidePosition
- `symbol`::string: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.productType`::string, optional: required if not uta and symbol is undefined: 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- response from the exchange
"""
__ccxt_doc_Bitget_setPositionMode

function __ccxt_doc_Bitget_fetchOpenInterest() end
"""
retrieves the open interest of a contract trading pair
see: https://www.bitget.com/api-doc/contract/market/Get-Open-Interest
see: https://www.bitget.com/api-doc/uta/public/Get-Open-Interest

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Bitget_fetchOpenInterest

function __ccxt_doc_Bitget_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://www.bitget.com/api-doc/spot/account/Get-Account-TransferRecords

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Bitget_fetchTransfers

function __ccxt_doc_Bitget_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://www.bitget.com/api-doc/spot/account/Wallet-Transfer
see: https://www.bitget.com/api-doc/uta/account/transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true to transfer via the unified trading account v3 endpoint
- `params.symbol`::string, optional: unified CCXT market symbol, required when transferring to or from an account type that is a leveraged position-by-position account
- `params.clientOid`::string, optional: custom id

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Bitget_transfer

function __ccxt_doc_Bitget_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://www.bitget.com/api-doc/spot/market/Get-Coin-List

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bitget_fetchDepositWithdrawFees

function __ccxt_doc_Bitget_borrowCrossMargin() end
"""
create a loan to borrow margin
see: https://www.bitget.com/api-doc/margin/cross/account/Cross-Borrow

# Arguments
- `code`::string: unified currency code of the currency to borrow
- `amount`::string: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Bitget_borrowCrossMargin

function __ccxt_doc_Bitget_borrowIsolatedMargin() end
"""
create a loan to borrow margin
see: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Borrow

# Arguments
- `symbol`::string: unified market symbol
- `code`::string: unified currency code of the currency to borrow
- `amount`::string: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Bitget_borrowIsolatedMargin

function __ccxt_doc_Bitget_repayIsolatedMargin() end
"""
repay borrowed margin and interest
see: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Repay

# Arguments
- `symbol`::string: unified market symbol
- `code`::string: unified currency code of the currency to repay
- `amount`::string: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Bitget_repayIsolatedMargin

function __ccxt_doc_Bitget_repayCrossMargin() end
"""
repay borrowed margin and interest
see: https://www.bitget.com/api-doc/margin/cross/account/Cross-Repay

# Arguments
- `code`::string: unified currency code of the currency to repay
- `amount`::string: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Bitget_repayCrossMargin

function __ccxt_doc_Bitget_fetchMyLiquidations() end
"""
retrieves the users liquidated positions
see: https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Liquidation-Records
see: https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Liquidation-Records

# Arguments
- `symbol`::string, optional: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the bitget api endpoint
- `params.until`::int, optional: timestamp in ms of the latest liquidation
- `params.marginMode`::string, optional: 'cross' or 'isolated' default value is 'cross'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
__ccxt_doc_Bitget_fetchMyLiquidations

function __ccxt_doc_Bitget_fetchIsolatedBorrowRate() end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Margin-Interest-Rate-And-Max-Borrowable-Amount

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [isolated borrow rate structure]{@link https://docs.ccxt.com/?id=isolated-borrow-rate-structure}
"""
__ccxt_doc_Bitget_fetchIsolatedBorrowRate

function __ccxt_doc_Bitget_fetchCrossBorrowRate() end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Margin-Interest-Rate-And-Borrowable
see: https://www.bitget.com/api-doc/uta/public/Get-Margin-Loans

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [borrow rate structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#borrow-rate-structure}
"""
__ccxt_doc_Bitget_fetchCrossBorrowRate

function __ccxt_doc_Bitget_fetchBorrowInterest() end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Interest-Records
see: https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Interest-Records

# Arguments
- `code`::string, optional: unified currency code
- `symbol`::string, optional: unified market symbol when fetching interest in isolated markets
- `since`::int, optional: the earliest time in ms to fetch borrow interest for
- `limit`::int, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
__ccxt_doc_Bitget_fetchBorrowInterest

function __ccxt_doc_Bitget_closePosition() end
"""
closes an open position for a market
see: https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
see: https://www.bitget.com/api-doc/uta/trade/Close-All-Positions

# Arguments
- `symbol`::string: unified CCXT market symbol
- `side`::string, optional: one-way mode: 'buy' or 'sell', hedge-mode: 'long' or 'short'
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bitget_closePosition

function __ccxt_doc_Bitget_closeAllPositions() end
"""
closes all open positions for a market type
see: https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
see: https://www.bitget.com/api-doc/uta/trade/Close-All-Positions

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.productType`::string, optional: 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- A list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bitget_closeAllPositions

function __ccxt_doc_Bitget_fetchMarginMode() end
"""
fetches the margin mode of a trading pair
see: https://www.bitget.com/api-doc/contract/account/Get-Single-Account

# Arguments
- `symbol`::string: unified symbol of the market to fetch the margin mode for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Bitget_fetchMarginMode

function __ccxt_doc_Bitget_fetchPositionsHistory() end
"""
fetches historical positions
see: https://www.bitget.com/api-doc/contract/position/Get-History-Position
see: https://www.bitget.com/api-doc/uta/trade/Get-Position-History

# Arguments
- `symbols`::array, optional: unified contract symbols
- `since`::int, optional: timestamp in ms of the earliest position to fetch, default=3 months ago, max range for params["until"] - since is 3 months
- `limit`::int, optional: the maximum amount of records to fetch, default=20, max=100
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest position to fetch, max range for params["until"] - since is 3 months
- `params.productType`::string, optional: USDT-FUTURES (default), COIN-FUTURES, USDC-FUTURES, SUSDT-FUTURES, SCOIN-FUTURES, or SUSDC-FUTURES
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bitget_fetchPositionsHistory

function __ccxt_doc_Bitget_fetchConvertQuote() end
"""
fetch a quote for converting from one currency to another
see: https://www.bitget.com/api-doc/common/convert/Get-Quoted-Price

# Arguments
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Bitget_fetchConvertQuote

function __ccxt_doc_Bitget_createConvertTrade() end
"""
convert from one currency to another
see: https://www.bitget.com/api-doc/common/convert/Trade

# Arguments
- `id`::string: the id of the trade that you want to make
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.price`::string: the price of the conversion, obtained from fetchConvertQuote()
- `params.toAmount`::string: the amount you want to trade in units of the toCurrency, obtained from fetchConvertQuote()

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Bitget_createConvertTrade

function __ccxt_doc_Bitget_fetchConvertTradeHistory() end
"""
fetch the users history of conversion trades
see: https://www.bitget.com/api-doc/common/convert/Get-Convert-Record

# Arguments
- `code`::string, optional: the unified currency code
- `since`::int, optional: the earliest time in ms to fetch conversions for
- `limit`::int, optional: the maximum number of conversion structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [conversion structures]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Bitget_fetchConvertTradeHistory

function __ccxt_doc_Bitget_fetchConvertCurrencies() end
"""
fetches all available currencies that can be converted
see: https://www.bitget.com/api-doc/common/convert/Get-Convert-Currencies

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bitget_fetchConvertCurrencies

function __ccxt_doc_Bitget_fetchFundingInterval() end
"""
fetch the current funding rate interval
see: https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
see: https://www.bitget.com/api-doc/uta/public/Get-Current-Funding-Rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Bitget_fetchFundingInterval

function __ccxt_doc_Bitget_fetchLongShortRatioHistory() end
"""
fetches the long short ratio history for a unified market symbol
see: https://www.bitget.com/api-doc/common/apidata/Margin-Ls-Ratio
see: https://www.bitget.com/api-doc/common/apidata/Account-Long-Short

# Arguments
- `symbol`::string: unified symbol of the market to fetch the long short ratio for
- `timeframe`::string, optional: the period for the ratio
- `since`::int, optional: the earliest time in ms to fetch ratios for
- `limit`::int, optional: the maximum number of long short ratio structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [long short ratio structures]{@link https://docs.ccxt.com/?id=long-short-ratio-structure}
"""
__ccxt_doc_Bitget_fetchLongShortRatioHistory
