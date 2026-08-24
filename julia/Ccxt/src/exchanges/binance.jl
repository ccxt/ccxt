@kwdef mutable struct Binance <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    isInverse::Function = isInverse
    isLinear::Function = isLinear
    setSandboxMode::Function = setSandboxMode
    createExpiredOptionMarket::Function = createExpiredOptionMarket
    market::Function = market
    safeMarket::Function = safeMarket
    nonce::Function = nonce
    enableDemoTrading::Function = enableDemoTrading
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrenciesCustom::Function = parseCurrenciesCustom
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    parseBalanceHelper::Function = parseBalanceHelper
    parseBalanceCustom::Function = parseBalanceCustom
    fetchBalance::Function = fetchBalance
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchStatus::Function = fetchStatus
    fetchTicker::Function = fetchTicker
    fetchBidsAsks::Function = fetchBidsAsks
    fetchLastPrices::Function = fetchLastPrices
    parseLastPrice::Function = parseLastPrice
    fetchTickers::Function = fetchTickers
    parseTickersForRolling::Function = parseTickersForRolling
    fetchMarkPrice::Function = fetchMarkPrice
    fetchMarkPrices::Function = fetchMarkPrices
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    editSpotOrder::Function = editSpotOrder
    editSpotOrderRequest::Function = editSpotOrderRequest
    editContractOrderRequest::Function = editContractOrderRequest
    editContractOrder::Function = editContractOrder
    editOrder::Function = editOrder
    editOrders::Function = editOrders
    parseOrderStatus::Function = parseOrderStatus
    parseOrderTypeByMarket::Function = parseOrderTypeByMarket
    parseOrder::Function = parseOrder
    createOrders::Function = createOrders
    createOrder::Function = createOrder
    createOrderRequest::Function = createOrderRequest
    createMarketOrderWithCost::Function = createMarketOrderWithCost
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createMarketSellOrderWithCost::Function = createMarketSellOrderWithCost
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOpenOrder::Function = fetchOpenOrder
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelOrders::Function = cancelOrders
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchMyDustTrades::Function = fetchMyDustTrades
    parseDustTrade::Function = parseDustTrade
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatusByType::Function = parseTransactionStatusByType
    parseTransaction::Function = parseTransaction
    parseTransferStatus::Function = parseTransferStatus
    parseTransfer::Function = parseTransfer
    parseIncome::Function = parseIncome
    transfer::Function = transfer
    fetchTransfers::Function = fetchTransfers
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchTransactionFees::Function = fetchTransactionFees
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    withdraw::Function = withdraw
    parseTradingFee::Function = parseTradingFee
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    futuresTransfer::Function = futuresTransfer
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    parseAccountPositions::Function = parseAccountPositions
    parseAccountPosition::Function = parseAccountPosition
    parsePositionRisk::Function = parsePositionRisk
    loadLeverageBrackets::Function = loadLeverageBrackets
    fetchLeverageTiers::Function = fetchLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    fetchPosition::Function = fetchPosition
    fetchOptionPositions::Function = fetchOptionPositions
    parseOptionPosition::Function = parseOptionPosition
    fetchPositions::Function = fetchPositions
    fetchAccountPositions::Function = fetchAccountPositions
    fetchPositionsRisk::Function = fetchPositionsRisk
    fetchFundingHistory::Function = fetchFundingHistory
    setLeverage::Function = setLeverage
    setMarginMode::Function = setMarginMode
    setPositionMode::Function = setPositionMode
    fetchLeverages::Function = fetchLeverages
    parseLeverage::Function = parseLeverage
    fetchSettlementHistory::Function = fetchSettlementHistory
    fetchMySettlementHistory::Function = fetchMySettlementHistory
    parseSettlement::Function = parseSettlement
    parseSettlements::Function = parseSettlements
    fetchLedgerEntry::Function = fetchLedgerEntry
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    getNetworkCodeByNetworkUrl::Function = getNetworkCodeByNetworkUrl
    getBaseDomainFromUrl::Function = getBaseDomainFromUrl
    sign::Function = sign
    getExceptionsByUrl::Function = getExceptionsByUrl
    handleErrors::Function = handleErrors
    calculateRateLimiterCost::Function = calculateRateLimiterCost
    request::Function = request
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    reduceMargin::Function = reduceMargin
    addMargin::Function = addMargin
    fetchCrossBorrowRate::Function = fetchCrossBorrowRate
    fetchIsolatedBorrowRate::Function = fetchIsolatedBorrowRate
    fetchIsolatedBorrowRates::Function = fetchIsolatedBorrowRates
    fetchBorrowRateHistory::Function = fetchBorrowRateHistory
    parseBorrowRate::Function = parseBorrowRate
    parseIsolatedBorrowRate::Function = parseIsolatedBorrowRate
    createGiftCode::Function = createGiftCode
    redeemGiftCode::Function = redeemGiftCode
    verifyGiftCode::Function = verifyGiftCode
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    repayCrossMargin::Function = repayCrossMargin
    repayIsolatedMargin::Function = repayIsolatedMargin
    borrowCrossMargin::Function = borrowCrossMargin
    borrowIsolatedMargin::Function = borrowIsolatedMargin
    parseMarginLoan::Function = parseMarginLoan
    fetchOpenInterestHistory::Function = fetchOpenInterestHistory
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchMyLiquidations::Function = fetchMyLiquidations
    parseLiquidation::Function = parseLiquidation
    fetchGreeks::Function = fetchGreeks
    fetchAllGreeks::Function = fetchAllGreeks
    parseGreeks::Function = parseGreeks
    fetchTradingLimits::Function = fetchTradingLimits
    fetchPositionMode::Function = fetchPositionMode
    fetchMarginModes::Function = fetchMarginModes
    fetchMarginMode::Function = fetchMarginMode
    parseMarginMode::Function = parseMarginMode
    fetchOption::Function = fetchOption
    parseOption::Function = parseOption
    fetchMarginAdjustmentHistory::Function = fetchMarginAdjustmentHistory
    fetchConvertCurrencies::Function = fetchConvertCurrencies
    fetchConvertQuote::Function = fetchConvertQuote
    createConvertTrade::Function = createConvertTrade
    fetchConvertTrade::Function = fetchConvertTrade
    fetchConvertTradeHistory::Function = fetchConvertTradeHistory
    parseConversion::Function = parseConversion
    fetchFundingIntervals::Function = fetchFundingIntervals
    fetchLongShortRatioHistory::Function = fetchLongShortRatioHistory
    parseLongShortRatio::Function = parseLongShortRatio
    fetchADLRank::Function = fetchADLRank
    fetchPositionsADLRank::Function = fetchPositionsADLRank
    parseADLRank::Function = parseADLRank

# Generated REST endpoint fields
    sapiGetCopyTradingFuturesUserStatus::Function = sapiGetCopyTradingFuturesUserStatus
    sapiGetCopyTradingFuturesLeadSymbol::Function = sapiGetCopyTradingFuturesLeadSymbol
    sapiGetSystemStatus::Function = sapiGetSystemStatus
    sapiGetAccountSnapshot::Function = sapiGetAccountSnapshot
    sapiGetAccountInfo::Function = sapiGetAccountInfo
    sapiGetMarginAsset::Function = sapiGetMarginAsset
    sapiGetMarginPair::Function = sapiGetMarginPair
    sapiGetMarginAllAssets::Function = sapiGetMarginAllAssets
    sapiGetMarginAllPairs::Function = sapiGetMarginAllPairs
    sapiGetMarginPriceIndex::Function = sapiGetMarginPriceIndex
    sapiGetSpotDelistSchedule::Function = sapiGetSpotDelistSchedule
    sapiGetAssetAssetDividend::Function = sapiGetAssetAssetDividend
    sapiGetAssetDribblet::Function = sapiGetAssetDribblet
    sapiGetAssetTransfer::Function = sapiGetAssetTransfer
    sapiGetAssetAssetDetail::Function = sapiGetAssetAssetDetail
    sapiGetAssetTradeFee::Function = sapiGetAssetTradeFee
    sapiGetAssetLedgerTransferCloudMiningQueryByPage::Function = sapiGetAssetLedgerTransferCloudMiningQueryByPage
    sapiGetAssetConvertTransferQueryByPage::Function = sapiGetAssetConvertTransferQueryByPage
    sapiGetAssetWalletBalance::Function = sapiGetAssetWalletBalance
    sapiGetAssetCustodyTransferHistory::Function = sapiGetAssetCustodyTransferHistory
    sapiGetMarginBorrowRepay::Function = sapiGetMarginBorrowRepay
    sapiGetMarginLoan::Function = sapiGetMarginLoan
    sapiGetMarginRepay::Function = sapiGetMarginRepay
    sapiGetMarginAccount::Function = sapiGetMarginAccount
    sapiGetMarginTransfer::Function = sapiGetMarginTransfer
    sapiGetMarginInterestHistory::Function = sapiGetMarginInterestHistory
    sapiGetMarginForceLiquidationRec::Function = sapiGetMarginForceLiquidationRec
    sapiGetMarginOrder::Function = sapiGetMarginOrder
    sapiGetMarginOpenOrders::Function = sapiGetMarginOpenOrders
    sapiGetMarginAllOrders::Function = sapiGetMarginAllOrders
    sapiGetMarginMyTrades::Function = sapiGetMarginMyTrades
    sapiGetMarginMaxBorrowable::Function = sapiGetMarginMaxBorrowable
    sapiGetMarginMaxTransferable::Function = sapiGetMarginMaxTransferable
    sapiGetMarginTradeCoeff::Function = sapiGetMarginTradeCoeff
    sapiGetMarginIsolatedTransfer::Function = sapiGetMarginIsolatedTransfer
    sapiGetMarginIsolatedAccount::Function = sapiGetMarginIsolatedAccount
    sapiGetMarginIsolatedPair::Function = sapiGetMarginIsolatedPair
    sapiGetMarginIsolatedAllPairs::Function = sapiGetMarginIsolatedAllPairs
    sapiGetMarginIsolatedAccountLimit::Function = sapiGetMarginIsolatedAccountLimit
    sapiGetMarginInterestRateHistory::Function = sapiGetMarginInterestRateHistory
    sapiGetMarginOrderList::Function = sapiGetMarginOrderList
    sapiGetMarginAllOrderList::Function = sapiGetMarginAllOrderList
    sapiGetMarginOpenOrderList::Function = sapiGetMarginOpenOrderList
    sapiGetMarginCrossMarginData::Function = sapiGetMarginCrossMarginData
    sapiGetMarginIsolatedMarginData::Function = sapiGetMarginIsolatedMarginData
    sapiGetMarginIsolatedMarginTier::Function = sapiGetMarginIsolatedMarginTier
    sapiGetMarginRateLimitOrder::Function = sapiGetMarginRateLimitOrder
    sapiGetMarginDribblet::Function = sapiGetMarginDribblet
    sapiGetMarginDust::Function = sapiGetMarginDust
    sapiGetMarginCrossMarginCollateralRatio::Function = sapiGetMarginCrossMarginCollateralRatio
    sapiGetMarginExchangeSmallLiability::Function = sapiGetMarginExchangeSmallLiability
    sapiGetMarginExchangeSmallLiabilityHistory::Function = sapiGetMarginExchangeSmallLiabilityHistory
    sapiGetMarginNextHourlyInterestRate::Function = sapiGetMarginNextHourlyInterestRate
    sapiGetMarginCapitalFlow::Function = sapiGetMarginCapitalFlow
    sapiGetMarginDelistSchedule::Function = sapiGetMarginDelistSchedule
    sapiGetMarginAvailableInventory::Function = sapiGetMarginAvailableInventory
    sapiGetMarginLeverageBracket::Function = sapiGetMarginLeverageBracket
    sapiGetLoanVipLoanableData::Function = sapiGetLoanVipLoanableData
    sapiGetLoanVipCollateralData::Function = sapiGetLoanVipCollateralData
    sapiGetLoanVipRequestData::Function = sapiGetLoanVipRequestData
    sapiGetLoanVipRequestInterestRate::Function = sapiGetLoanVipRequestInterestRate
    sapiGetLoanIncome::Function = sapiGetLoanIncome
    sapiGetLoanOngoingOrders::Function = sapiGetLoanOngoingOrders
    sapiGetLoanLtvAdjustmentHistory::Function = sapiGetLoanLtvAdjustmentHistory
    sapiGetLoanBorrowHistory::Function = sapiGetLoanBorrowHistory
    sapiGetLoanRepayHistory::Function = sapiGetLoanRepayHistory
    sapiGetLoanLoanableData::Function = sapiGetLoanLoanableData
    sapiGetLoanCollateralData::Function = sapiGetLoanCollateralData
    sapiGetLoanRepayCollateralRate::Function = sapiGetLoanRepayCollateralRate
    sapiGetLoanFlexibleOngoingOrders::Function = sapiGetLoanFlexibleOngoingOrders
    sapiGetLoanFlexibleBorrowHistory::Function = sapiGetLoanFlexibleBorrowHistory
    sapiGetLoanFlexibleRepayHistory::Function = sapiGetLoanFlexibleRepayHistory
    sapiGetLoanFlexibleLtvAdjustmentHistory::Function = sapiGetLoanFlexibleLtvAdjustmentHistory
    sapiGetLoanVipOngoingOrders::Function = sapiGetLoanVipOngoingOrders
    sapiGetLoanVipRepayHistory::Function = sapiGetLoanVipRepayHistory
    sapiGetLoanVipCollateralAccount::Function = sapiGetLoanVipCollateralAccount
    sapiGetFiatOrders::Function = sapiGetFiatOrders
    sapiGetFiatPayments::Function = sapiGetFiatPayments
    sapiGetFuturesTransfer::Function = sapiGetFuturesTransfer
    sapiGetFuturesHistDataLink::Function = sapiGetFuturesHistDataLink
    sapiGetRebateTaxQuery::Function = sapiGetRebateTaxQuery
    sapiGetCapitalConfigGetall::Function = sapiGetCapitalConfigGetall
    sapiGetCapitalDepositAddress::Function = sapiGetCapitalDepositAddress
    sapiGetCapitalDepositAddressList::Function = sapiGetCapitalDepositAddressList
    sapiGetCapitalDepositHisrec::Function = sapiGetCapitalDepositHisrec
    sapiGetCapitalDepositSubAddress::Function = sapiGetCapitalDepositSubAddress
    sapiGetCapitalDepositSubHisrec::Function = sapiGetCapitalDepositSubHisrec
    sapiGetCapitalWithdrawHistory::Function = sapiGetCapitalWithdrawHistory
    sapiGetCapitalWithdrawAddressList::Function = sapiGetCapitalWithdrawAddressList
    sapiGetCapitalContractConvertibleCoins::Function = sapiGetCapitalContractConvertibleCoins
    sapiGetConvertTradeFlow::Function = sapiGetConvertTradeFlow
    sapiGetConvertExchangeInfo::Function = sapiGetConvertExchangeInfo
    sapiGetConvertAssetInfo::Function = sapiGetConvertAssetInfo
    sapiGetConvertOrderStatus::Function = sapiGetConvertOrderStatus
    sapiGetConvertLimitQueryOpenOrders::Function = sapiGetConvertLimitQueryOpenOrders
    sapiGetAccountStatus::Function = sapiGetAccountStatus
    sapiGetAccountApiTradingStatus::Function = sapiGetAccountApiTradingStatus
    sapiGetAccountApiRestrictionsIpRestriction::Function = sapiGetAccountApiRestrictionsIpRestriction
    sapiGetBnbBurn::Function = sapiGetBnbBurn
    sapiGetSubAccountFuturesAccount::Function = sapiGetSubAccountFuturesAccount
    sapiGetSubAccountFuturesAccountSummary::Function = sapiGetSubAccountFuturesAccountSummary
    sapiGetSubAccountFuturesPositionRisk::Function = sapiGetSubAccountFuturesPositionRisk
    sapiGetSubAccountFuturesInternalTransfer::Function = sapiGetSubAccountFuturesInternalTransfer
    sapiGetSubAccountList::Function = sapiGetSubAccountList
    sapiGetSubAccountMarginAccount::Function = sapiGetSubAccountMarginAccount
    sapiGetSubAccountMarginAccountSummary::Function = sapiGetSubAccountMarginAccountSummary
    sapiGetSubAccountSpotSummary::Function = sapiGetSubAccountSpotSummary
    sapiGetSubAccountStatus::Function = sapiGetSubAccountStatus
    sapiGetSubAccountSubTransferHistory::Function = sapiGetSubAccountSubTransferHistory
    sapiGetSubAccountTransferSubUserHistory::Function = sapiGetSubAccountTransferSubUserHistory
    sapiGetSubAccountUniversalTransfer::Function = sapiGetSubAccountUniversalTransfer
    sapiGetSubAccountApiRestrictionsIpRestrictionThirdPartyList::Function = sapiGetSubAccountApiRestrictionsIpRestrictionThirdPartyList
    sapiGetSubAccountTransactionStatistics::Function = sapiGetSubAccountTransactionStatistics
    sapiGetSubAccountSubAccountApiIpRestriction::Function = sapiGetSubAccountSubAccountApiIpRestriction
    sapiGetManagedSubaccountAsset::Function = sapiGetManagedSubaccountAsset
    sapiGetManagedSubaccountAccountSnapshot::Function = sapiGetManagedSubaccountAccountSnapshot
    sapiGetManagedSubaccountQueryTransLogForInvestor::Function = sapiGetManagedSubaccountQueryTransLogForInvestor
    sapiGetManagedSubaccountQueryTransLogForTradeParent::Function = sapiGetManagedSubaccountQueryTransLogForTradeParent
    sapiGetManagedSubaccountFetchFutureAsset::Function = sapiGetManagedSubaccountFetchFutureAsset
    sapiGetManagedSubaccountMarginAsset::Function = sapiGetManagedSubaccountMarginAsset
    sapiGetManagedSubaccountInfo::Function = sapiGetManagedSubaccountInfo
    sapiGetManagedSubaccountDepositAddress::Function = sapiGetManagedSubaccountDepositAddress
    sapiGetManagedSubaccountQueryTransLog::Function = sapiGetManagedSubaccountQueryTransLog
    sapiGetLendingDailyProductList::Function = sapiGetLendingDailyProductList
    sapiGetLendingDailyUserLeftQuota::Function = sapiGetLendingDailyUserLeftQuota
    sapiGetLendingDailyUserRedemptionQuota::Function = sapiGetLendingDailyUserRedemptionQuota
    sapiGetLendingDailyTokenPosition::Function = sapiGetLendingDailyTokenPosition
    sapiGetLendingUnionAccount::Function = sapiGetLendingUnionAccount
    sapiGetLendingUnionPurchaseRecord::Function = sapiGetLendingUnionPurchaseRecord
    sapiGetLendingUnionRedemptionRecord::Function = sapiGetLendingUnionRedemptionRecord
    sapiGetLendingUnionInterestHistory::Function = sapiGetLendingUnionInterestHistory
    sapiGetLendingProjectList::Function = sapiGetLendingProjectList
    sapiGetLendingProjectPositionList::Function = sapiGetLendingProjectPositionList
    sapiGetEthStakingEthHistoryStakingHistory::Function = sapiGetEthStakingEthHistoryStakingHistory
    sapiGetEthStakingEthHistoryRedemptionHistory::Function = sapiGetEthStakingEthHistoryRedemptionHistory
    sapiGetEthStakingEthHistoryRewardsHistory::Function = sapiGetEthStakingEthHistoryRewardsHistory
    sapiGetEthStakingEthQuota::Function = sapiGetEthStakingEthQuota
    sapiGetEthStakingEthHistoryRateHistory::Function = sapiGetEthStakingEthHistoryRateHistory
    sapiGetEthStakingAccount::Function = sapiGetEthStakingAccount
    sapiGetEthStakingWbethHistoryWrapHistory::Function = sapiGetEthStakingWbethHistoryWrapHistory
    sapiGetEthStakingWbethHistoryUnwrapHistory::Function = sapiGetEthStakingWbethHistoryUnwrapHistory
    sapiGetEthStakingEthHistoryWbethRewardsHistory::Function = sapiGetEthStakingEthHistoryWbethRewardsHistory
    sapiGetSolStakingSolHistoryStakingHistory::Function = sapiGetSolStakingSolHistoryStakingHistory
    sapiGetSolStakingSolHistoryRedemptionHistory::Function = sapiGetSolStakingSolHistoryRedemptionHistory
    sapiGetSolStakingSolHistoryBnsolRewardsHistory::Function = sapiGetSolStakingSolHistoryBnsolRewardsHistory
    sapiGetSolStakingSolHistoryRateHistory::Function = sapiGetSolStakingSolHistoryRateHistory
    sapiGetSolStakingAccount::Function = sapiGetSolStakingAccount
    sapiGetSolStakingSolQuota::Function = sapiGetSolStakingSolQuota
    sapiGetMiningPubAlgoList::Function = sapiGetMiningPubAlgoList
    sapiGetMiningPubCoinList::Function = sapiGetMiningPubCoinList
    sapiGetMiningWorkerDetail::Function = sapiGetMiningWorkerDetail
    sapiGetMiningWorkerList::Function = sapiGetMiningWorkerList
    sapiGetMiningPaymentList::Function = sapiGetMiningPaymentList
    sapiGetMiningStatisticsUserStatus::Function = sapiGetMiningStatisticsUserStatus
    sapiGetMiningStatisticsUserList::Function = sapiGetMiningStatisticsUserList
    sapiGetMiningPaymentUid::Function = sapiGetMiningPaymentUid
    sapiGetBswapPools::Function = sapiGetBswapPools
    sapiGetBswapLiquidity::Function = sapiGetBswapLiquidity
    sapiGetBswapLiquidityOps::Function = sapiGetBswapLiquidityOps
    sapiGetBswapQuote::Function = sapiGetBswapQuote
    sapiGetBswapSwap::Function = sapiGetBswapSwap
    sapiGetBswapPoolConfigure::Function = sapiGetBswapPoolConfigure
    sapiGetBswapAddLiquidityPreview::Function = sapiGetBswapAddLiquidityPreview
    sapiGetBswapRemoveLiquidityPreview::Function = sapiGetBswapRemoveLiquidityPreview
    sapiGetBswapUnclaimedRewards::Function = sapiGetBswapUnclaimedRewards
    sapiGetBswapClaimedHistory::Function = sapiGetBswapClaimedHistory
    sapiGetBlvtTokenInfo::Function = sapiGetBlvtTokenInfo
    sapiGetBlvtSubscribeRecord::Function = sapiGetBlvtSubscribeRecord
    sapiGetBlvtRedeemRecord::Function = sapiGetBlvtRedeemRecord
    sapiGetBlvtUserLimit::Function = sapiGetBlvtUserLimit
    sapiGetApiReferralIfNewUser::Function = sapiGetApiReferralIfNewUser
    sapiGetApiReferralCustomization::Function = sapiGetApiReferralCustomization
    sapiGetApiReferralUserCustomization::Function = sapiGetApiReferralUserCustomization
    sapiGetApiReferralRebateRecentRecord::Function = sapiGetApiReferralRebateRecentRecord
    sapiGetApiReferralRebateHistoricalRecord::Function = sapiGetApiReferralRebateHistoricalRecord
    sapiGetApiReferralKickbackRecentRecord::Function = sapiGetApiReferralKickbackRecentRecord
    sapiGetApiReferralKickbackHistoricalRecord::Function = sapiGetApiReferralKickbackHistoricalRecord
    sapiGetBrokerSubAccountApi::Function = sapiGetBrokerSubAccountApi
    sapiGetBrokerSubAccount::Function = sapiGetBrokerSubAccount
    sapiGetBrokerSubAccountApiCommissionFutures::Function = sapiGetBrokerSubAccountApiCommissionFutures
    sapiGetBrokerSubAccountApiCommissionCoinFutures::Function = sapiGetBrokerSubAccountApiCommissionCoinFutures
    sapiGetBrokerInfo::Function = sapiGetBrokerInfo
    sapiGetBrokerTransfer::Function = sapiGetBrokerTransfer
    sapiGetBrokerTransferFutures::Function = sapiGetBrokerTransferFutures
    sapiGetBrokerRebateRecentRecord::Function = sapiGetBrokerRebateRecentRecord
    sapiGetBrokerRebateHistoricalRecord::Function = sapiGetBrokerRebateHistoricalRecord
    sapiGetBrokerSubAccountBnbBurnStatus::Function = sapiGetBrokerSubAccountBnbBurnStatus
    sapiGetBrokerSubAccountDepositHist::Function = sapiGetBrokerSubAccountDepositHist
    sapiGetBrokerSubAccountSpotSummary::Function = sapiGetBrokerSubAccountSpotSummary
    sapiGetBrokerSubAccountMarginSummary::Function = sapiGetBrokerSubAccountMarginSummary
    sapiGetBrokerSubAccountFuturesSummary::Function = sapiGetBrokerSubAccountFuturesSummary
    sapiGetBrokerRebateFuturesRecentRecord::Function = sapiGetBrokerRebateFuturesRecentRecord
    sapiGetBrokerSubAccountApiIpRestriction::Function = sapiGetBrokerSubAccountApiIpRestriction
    sapiGetBrokerUniversalTransfer::Function = sapiGetBrokerUniversalTransfer
    sapiGetAccountApiRestrictions::Function = sapiGetAccountApiRestrictions
    sapiGetC2cOrderMatchListUserOrderHistory::Function = sapiGetC2cOrderMatchListUserOrderHistory
    sapiGetNftHistoryTransactions::Function = sapiGetNftHistoryTransactions
    sapiGetNftHistoryDeposit::Function = sapiGetNftHistoryDeposit
    sapiGetNftHistoryWithdraw::Function = sapiGetNftHistoryWithdraw
    sapiGetNftUserGetAsset::Function = sapiGetNftUserGetAsset
    sapiGetPayTransactions::Function = sapiGetPayTransactions
    sapiGetGiftcardVerify::Function = sapiGetGiftcardVerify
    sapiGetGiftcardCryptographyRsaPublicKey::Function = sapiGetGiftcardCryptographyRsaPublicKey
    sapiGetGiftcardBuyCodeTokenLimit::Function = sapiGetGiftcardBuyCodeTokenLimit
    sapiGetAlgoSpotOpenOrders::Function = sapiGetAlgoSpotOpenOrders
    sapiGetAlgoSpotHistoricalOrders::Function = sapiGetAlgoSpotHistoricalOrders
    sapiGetAlgoSpotSubOrders::Function = sapiGetAlgoSpotSubOrders
    sapiGetAlgoFuturesOpenOrders::Function = sapiGetAlgoFuturesOpenOrders
    sapiGetAlgoFuturesHistoricalOrders::Function = sapiGetAlgoFuturesHistoricalOrders
    sapiGetAlgoFuturesSubOrders::Function = sapiGetAlgoFuturesSubOrders
    sapiGetPortfolioAccount::Function = sapiGetPortfolioAccount
    sapiGetPortfolioCollateralRate::Function = sapiGetPortfolioCollateralRate
    sapiGetPortfolioPmLoan::Function = sapiGetPortfolioPmLoan
    sapiGetPortfolioInterestHistory::Function = sapiGetPortfolioInterestHistory
    sapiGetPortfolioAssetIndexPrice::Function = sapiGetPortfolioAssetIndexPrice
    sapiGetPortfolioRepayFuturesSwitch::Function = sapiGetPortfolioRepayFuturesSwitch
    sapiGetPortfolioMarginAssetLeverage::Function = sapiGetPortfolioMarginAssetLeverage
    sapiGetPortfolioBalance::Function = sapiGetPortfolioBalance
    sapiGetPortfolioNegativeBalanceExchangeRecord::Function = sapiGetPortfolioNegativeBalanceExchangeRecord
    sapiGetPortfolioPmloanHistory::Function = sapiGetPortfolioPmloanHistory
    sapiGetPortfolioEarnAssetBalance::Function = sapiGetPortfolioEarnAssetBalance
    sapiGetPortfolioDeltaMode::Function = sapiGetPortfolioDeltaMode
    sapiGetStakingProductList::Function = sapiGetStakingProductList
    sapiGetStakingPosition::Function = sapiGetStakingPosition
    sapiGetStakingStakingRecord::Function = sapiGetStakingStakingRecord
    sapiGetStakingPersonalLeftQuota::Function = sapiGetStakingPersonalLeftQuota
    sapiGetLendingAutoInvestTargetAssetList::Function = sapiGetLendingAutoInvestTargetAssetList
    sapiGetLendingAutoInvestTargetAssetRoiList::Function = sapiGetLendingAutoInvestTargetAssetRoiList
    sapiGetLendingAutoInvestAllAsset::Function = sapiGetLendingAutoInvestAllAsset
    sapiGetLendingAutoInvestSourceAssetList::Function = sapiGetLendingAutoInvestSourceAssetList
    sapiGetLendingAutoInvestPlanList::Function = sapiGetLendingAutoInvestPlanList
    sapiGetLendingAutoInvestPlanId::Function = sapiGetLendingAutoInvestPlanId
    sapiGetLendingAutoInvestHistoryList::Function = sapiGetLendingAutoInvestHistoryList
    sapiGetLendingAutoInvestIndexInfo::Function = sapiGetLendingAutoInvestIndexInfo
    sapiGetLendingAutoInvestIndexUserSummary::Function = sapiGetLendingAutoInvestIndexUserSummary
    sapiGetLendingAutoInvestOneOffStatus::Function = sapiGetLendingAutoInvestOneOffStatus
    sapiGetLendingAutoInvestRedeemHistory::Function = sapiGetLendingAutoInvestRedeemHistory
    sapiGetLendingAutoInvestRebalanceHistory::Function = sapiGetLendingAutoInvestRebalanceHistory
    sapiGetSimpleEarnFlexibleList::Function = sapiGetSimpleEarnFlexibleList
    sapiGetSimpleEarnLockedList::Function = sapiGetSimpleEarnLockedList
    sapiGetSimpleEarnFlexiblePersonalLeftQuota::Function = sapiGetSimpleEarnFlexiblePersonalLeftQuota
    sapiGetSimpleEarnLockedPersonalLeftQuota::Function = sapiGetSimpleEarnLockedPersonalLeftQuota
    sapiGetSimpleEarnFlexibleSubscriptionPreview::Function = sapiGetSimpleEarnFlexibleSubscriptionPreview
    sapiGetSimpleEarnLockedSubscriptionPreview::Function = sapiGetSimpleEarnLockedSubscriptionPreview
    sapiGetSimpleEarnFlexibleHistoryRateHistory::Function = sapiGetSimpleEarnFlexibleHistoryRateHistory
    sapiGetSimpleEarnFlexiblePosition::Function = sapiGetSimpleEarnFlexiblePosition
    sapiGetSimpleEarnLockedPosition::Function = sapiGetSimpleEarnLockedPosition
    sapiGetSimpleEarnAccount::Function = sapiGetSimpleEarnAccount
    sapiGetSimpleEarnFlexibleHistorySubscriptionRecord::Function = sapiGetSimpleEarnFlexibleHistorySubscriptionRecord
    sapiGetSimpleEarnLockedHistorySubscriptionRecord::Function = sapiGetSimpleEarnLockedHistorySubscriptionRecord
    sapiGetSimpleEarnFlexibleHistoryRedemptionRecord::Function = sapiGetSimpleEarnFlexibleHistoryRedemptionRecord
    sapiGetSimpleEarnLockedHistoryRedemptionRecord::Function = sapiGetSimpleEarnLockedHistoryRedemptionRecord
    sapiGetSimpleEarnFlexibleHistoryRewardsRecord::Function = sapiGetSimpleEarnFlexibleHistoryRewardsRecord
    sapiGetSimpleEarnLockedHistoryRewardsRecord::Function = sapiGetSimpleEarnLockedHistoryRewardsRecord
    sapiGetSimpleEarnFlexibleHistoryCollateralRecord::Function = sapiGetSimpleEarnFlexibleHistoryCollateralRecord
    sapiGetDciProductList::Function = sapiGetDciProductList
    sapiGetDciProductPositions::Function = sapiGetDciProductPositions
    sapiGetDciProductAccounts::Function = sapiGetDciProductAccounts
    sapiGetAccumulatorProductList::Function = sapiGetAccumulatorProductList
    sapiGetAccumulatorProductPositionList::Function = sapiGetAccumulatorProductPositionList
    sapiGetAccumulatorProductSumHolding::Function = sapiGetAccumulatorProductSumHolding
    sapiPostAssetDust::Function = sapiPostAssetDust
    sapiPostAssetDustBtc::Function = sapiPostAssetDustBtc
    sapiPostAssetTransfer::Function = sapiPostAssetTransfer
    sapiPostAssetGetFundingAsset::Function = sapiPostAssetGetFundingAsset
    sapiPostAssetConvertTransfer::Function = sapiPostAssetConvertTransfer
    sapiPostAccountDisableFastWithdrawSwitch::Function = sapiPostAccountDisableFastWithdrawSwitch
    sapiPostAccountEnableFastWithdrawSwitch::Function = sapiPostAccountEnableFastWithdrawSwitch
    sapiPostCapitalWithdrawApply::Function = sapiPostCapitalWithdrawApply
    sapiPostCapitalContractConvertibleCoins::Function = sapiPostCapitalContractConvertibleCoins
    sapiPostCapitalDepositCreditApply::Function = sapiPostCapitalDepositCreditApply
    sapiPostMarginBorrowRepay::Function = sapiPostMarginBorrowRepay
    sapiPostMarginTransfer::Function = sapiPostMarginTransfer
    sapiPostMarginLoan::Function = sapiPostMarginLoan
    sapiPostMarginRepay::Function = sapiPostMarginRepay
    sapiPostMarginOrder::Function = sapiPostMarginOrder
    sapiPostMarginOrderOco::Function = sapiPostMarginOrderOco
    sapiPostMarginDust::Function = sapiPostMarginDust
    sapiPostMarginExchangeSmallLiability::Function = sapiPostMarginExchangeSmallLiability
    sapiPostMarginIsolatedTransfer::Function = sapiPostMarginIsolatedTransfer
    sapiPostMarginIsolatedAccount::Function = sapiPostMarginIsolatedAccount
    sapiPostMarginMaxLeverage::Function = sapiPostMarginMaxLeverage
    sapiPostBnbBurn::Function = sapiPostBnbBurn
    sapiPostSubAccountVirtualSubAccount::Function = sapiPostSubAccountVirtualSubAccount
    sapiPostSubAccountMarginTransfer::Function = sapiPostSubAccountMarginTransfer
    sapiPostSubAccountMarginEnable::Function = sapiPostSubAccountMarginEnable
    sapiPostSubAccountFuturesEnable::Function = sapiPostSubAccountFuturesEnable
    sapiPostSubAccountFuturesTransfer::Function = sapiPostSubAccountFuturesTransfer
    sapiPostSubAccountFuturesInternalTransfer::Function = sapiPostSubAccountFuturesInternalTransfer
    sapiPostSubAccountTransferSubToSub::Function = sapiPostSubAccountTransferSubToSub
    sapiPostSubAccountTransferSubToMaster::Function = sapiPostSubAccountTransferSubToMaster
    sapiPostSubAccountUniversalTransfer::Function = sapiPostSubAccountUniversalTransfer
    sapiPostSubAccountOptionsEnable::Function = sapiPostSubAccountOptionsEnable
    sapiPostManagedSubaccountDeposit::Function = sapiPostManagedSubaccountDeposit
    sapiPostManagedSubaccountWithdraw::Function = sapiPostManagedSubaccountWithdraw
    sapiPostUserDataStream::Function = sapiPostUserDataStream
    sapiPostUserDataStreamIsolated::Function = sapiPostUserDataStreamIsolated
    sapiPostUserListenToken::Function = sapiPostUserListenToken
    sapiPostFuturesTransfer::Function = sapiPostFuturesTransfer
    sapiPostLendingCustomizedFixedPurchase::Function = sapiPostLendingCustomizedFixedPurchase
    sapiPostLendingDailyPurchase::Function = sapiPostLendingDailyPurchase
    sapiPostLendingDailyRedeem::Function = sapiPostLendingDailyRedeem
    sapiPostBswapLiquidityAdd::Function = sapiPostBswapLiquidityAdd
    sapiPostBswapLiquidityRemove::Function = sapiPostBswapLiquidityRemove
    sapiPostBswapSwap::Function = sapiPostBswapSwap
    sapiPostBswapClaimRewards::Function = sapiPostBswapClaimRewards
    sapiPostBlvtSubscribe::Function = sapiPostBlvtSubscribe
    sapiPostBlvtRedeem::Function = sapiPostBlvtRedeem
    sapiPostApiReferralCustomization::Function = sapiPostApiReferralCustomization
    sapiPostApiReferralUserCustomization::Function = sapiPostApiReferralUserCustomization
    sapiPostApiReferralRebateHistoricalRecord::Function = sapiPostApiReferralRebateHistoricalRecord
    sapiPostApiReferralKickbackHistoricalRecord::Function = sapiPostApiReferralKickbackHistoricalRecord
    sapiPostBrokerSubAccount::Function = sapiPostBrokerSubAccount
    sapiPostBrokerSubAccountMargin::Function = sapiPostBrokerSubAccountMargin
    sapiPostBrokerSubAccountFutures::Function = sapiPostBrokerSubAccountFutures
    sapiPostBrokerSubAccountApi::Function = sapiPostBrokerSubAccountApi
    sapiPostBrokerSubAccountApiPermission::Function = sapiPostBrokerSubAccountApiPermission
    sapiPostBrokerSubAccountApiCommission::Function = sapiPostBrokerSubAccountApiCommission
    sapiPostBrokerSubAccountApiCommissionFutures::Function = sapiPostBrokerSubAccountApiCommissionFutures
    sapiPostBrokerSubAccountApiCommissionCoinFutures::Function = sapiPostBrokerSubAccountApiCommissionCoinFutures
    sapiPostBrokerTransfer::Function = sapiPostBrokerTransfer
    sapiPostBrokerTransferFutures::Function = sapiPostBrokerTransferFutures
    sapiPostBrokerRebateHistoricalRecord::Function = sapiPostBrokerRebateHistoricalRecord
    sapiPostBrokerSubAccountBnbBurnSpot::Function = sapiPostBrokerSubAccountBnbBurnSpot
    sapiPostBrokerSubAccountBnbBurnMarginInterest::Function = sapiPostBrokerSubAccountBnbBurnMarginInterest
    sapiPostBrokerSubAccountBlvt::Function = sapiPostBrokerSubAccountBlvt
    sapiPostBrokerSubAccountApiIpRestriction::Function = sapiPostBrokerSubAccountApiIpRestriction
    sapiPostBrokerSubAccountApiIpRestrictionIpList::Function = sapiPostBrokerSubAccountApiIpRestrictionIpList
    sapiPostBrokerUniversalTransfer::Function = sapiPostBrokerUniversalTransfer
    sapiPostBrokerSubAccountApiPermissionUniversalTransfer::Function = sapiPostBrokerSubAccountApiPermissionUniversalTransfer
    sapiPostBrokerSubAccountApiPermissionVanillaOptions::Function = sapiPostBrokerSubAccountApiPermissionVanillaOptions
    sapiPostGiftcardCreateCode::Function = sapiPostGiftcardCreateCode
    sapiPostGiftcardRedeemCode::Function = sapiPostGiftcardRedeemCode
    sapiPostGiftcardBuyCode::Function = sapiPostGiftcardBuyCode
    sapiPostAlgoSpotNewOrderTwap::Function = sapiPostAlgoSpotNewOrderTwap
    sapiPostAlgoFuturesNewOrderVp::Function = sapiPostAlgoFuturesNewOrderVp
    sapiPostAlgoFuturesNewOrderTwap::Function = sapiPostAlgoFuturesNewOrderTwap
    sapiPostStakingPurchase::Function = sapiPostStakingPurchase
    sapiPostStakingRedeem::Function = sapiPostStakingRedeem
    sapiPostStakingSetAutoStaking::Function = sapiPostStakingSetAutoStaking
    sapiPostEthStakingEthStake::Function = sapiPostEthStakingEthStake
    sapiPostEthStakingEthRedeem::Function = sapiPostEthStakingEthRedeem
    sapiPostEthStakingWbethWrap::Function = sapiPostEthStakingWbethWrap
    sapiPostSolStakingSolStake::Function = sapiPostSolStakingSolStake
    sapiPostSolStakingSolRedeem::Function = sapiPostSolStakingSolRedeem
    sapiPostMiningHashTransferConfig::Function = sapiPostMiningHashTransferConfig
    sapiPostMiningHashTransferConfigCancel::Function = sapiPostMiningHashTransferConfigCancel
    sapiPostPortfolioRepay::Function = sapiPostPortfolioRepay
    sapiPostLoanVipRenew::Function = sapiPostLoanVipRenew
    sapiPostLoanVipBorrow::Function = sapiPostLoanVipBorrow
    sapiPostLoanBorrow::Function = sapiPostLoanBorrow
    sapiPostLoanRepay::Function = sapiPostLoanRepay
    sapiPostLoanAdjustLtv::Function = sapiPostLoanAdjustLtv
    sapiPostLoanCustomizeMarginCall::Function = sapiPostLoanCustomizeMarginCall
    sapiPostLoanFlexibleRepay::Function = sapiPostLoanFlexibleRepay
    sapiPostLoanFlexibleAdjustLtv::Function = sapiPostLoanFlexibleAdjustLtv
    sapiPostLoanVipRepay::Function = sapiPostLoanVipRepay
    sapiPostConvertGetQuote::Function = sapiPostConvertGetQuote
    sapiPostConvertAcceptQuote::Function = sapiPostConvertAcceptQuote
    sapiPostConvertLimitPlaceOrder::Function = sapiPostConvertLimitPlaceOrder
    sapiPostConvertLimitCancelOrder::Function = sapiPostConvertLimitCancelOrder
    sapiPostPortfolioAutoCollection::Function = sapiPostPortfolioAutoCollection
    sapiPostPortfolioAssetCollection::Function = sapiPostPortfolioAssetCollection
    sapiPostPortfolioBnbTransfer::Function = sapiPostPortfolioBnbTransfer
    sapiPostPortfolioRepayFuturesSwitch::Function = sapiPostPortfolioRepayFuturesSwitch
    sapiPostPortfolioRepayFuturesNegativeBalance::Function = sapiPostPortfolioRepayFuturesNegativeBalance
    sapiPostPortfolioMint::Function = sapiPostPortfolioMint
    sapiPostPortfolioRedeem::Function = sapiPostPortfolioRedeem
    sapiPostPortfolioEarnAssetTransfer::Function = sapiPostPortfolioEarnAssetTransfer
    sapiPostPortfolioDeltaMode::Function = sapiPostPortfolioDeltaMode
    sapiPostLendingAutoInvestPlanAdd::Function = sapiPostLendingAutoInvestPlanAdd
    sapiPostLendingAutoInvestPlanEdit::Function = sapiPostLendingAutoInvestPlanEdit
    sapiPostLendingAutoInvestPlanEditStatus::Function = sapiPostLendingAutoInvestPlanEditStatus
    sapiPostLendingAutoInvestOneOff::Function = sapiPostLendingAutoInvestOneOff
    sapiPostLendingAutoInvestRedeem::Function = sapiPostLendingAutoInvestRedeem
    sapiPostSimpleEarnFlexibleSubscribe::Function = sapiPostSimpleEarnFlexibleSubscribe
    sapiPostSimpleEarnLockedSubscribe::Function = sapiPostSimpleEarnLockedSubscribe
    sapiPostSimpleEarnFlexibleRedeem::Function = sapiPostSimpleEarnFlexibleRedeem
    sapiPostSimpleEarnLockedRedeem::Function = sapiPostSimpleEarnLockedRedeem
    sapiPostSimpleEarnFlexibleSetAutoSubscribe::Function = sapiPostSimpleEarnFlexibleSetAutoSubscribe
    sapiPostSimpleEarnLockedSetAutoSubscribe::Function = sapiPostSimpleEarnLockedSetAutoSubscribe
    sapiPostSimpleEarnLockedSetRedeemOption::Function = sapiPostSimpleEarnLockedSetRedeemOption
    sapiPostDciProductSubscribe::Function = sapiPostDciProductSubscribe
    sapiPostDciProductAutoCompoundEdit::Function = sapiPostDciProductAutoCompoundEdit
    sapiPostAccumulatorProductSubscribe::Function = sapiPostAccumulatorProductSubscribe
    sapiPutUserDataStream::Function = sapiPutUserDataStream
    sapiPutUserDataStreamIsolated::Function = sapiPutUserDataStreamIsolated
    sapiDeleteMarginOpenOrders::Function = sapiDeleteMarginOpenOrders
    sapiDeleteMarginOrder::Function = sapiDeleteMarginOrder
    sapiDeleteMarginOrderList::Function = sapiDeleteMarginOrderList
    sapiDeleteMarginIsolatedAccount::Function = sapiDeleteMarginIsolatedAccount
    sapiDeleteUserDataStream::Function = sapiDeleteUserDataStream
    sapiDeleteUserDataStreamIsolated::Function = sapiDeleteUserDataStreamIsolated
    sapiDeleteBrokerSubAccountApi::Function = sapiDeleteBrokerSubAccountApi
    sapiDeleteBrokerSubAccountApiIpRestrictionIpList::Function = sapiDeleteBrokerSubAccountApiIpRestrictionIpList
    sapiDeleteAlgoSpotOrder::Function = sapiDeleteAlgoSpotOrder
    sapiDeleteAlgoFuturesOrder::Function = sapiDeleteAlgoFuturesOrder
    sapiDeleteSubAccountSubAccountApiIpRestrictionIpList::Function = sapiDeleteSubAccountSubAccountApiIpRestrictionIpList
    sapiV2GetEthStakingAccount::Function = sapiV2GetEthStakingAccount
    sapiV2GetSubAccountFuturesAccount::Function = sapiV2GetSubAccountFuturesAccount
    sapiV2GetSubAccountFuturesAccountSummary::Function = sapiV2GetSubAccountFuturesAccountSummary
    sapiV2GetSubAccountFuturesPositionRisk::Function = sapiV2GetSubAccountFuturesPositionRisk
    sapiV2GetLoanFlexibleOngoingOrders::Function = sapiV2GetLoanFlexibleOngoingOrders
    sapiV2GetLoanFlexibleBorrowHistory::Function = sapiV2GetLoanFlexibleBorrowHistory
    sapiV2GetLoanFlexibleRepayHistory::Function = sapiV2GetLoanFlexibleRepayHistory
    sapiV2GetLoanFlexibleLtvAdjustmentHistory::Function = sapiV2GetLoanFlexibleLtvAdjustmentHistory
    sapiV2GetLoanFlexibleLoanableData::Function = sapiV2GetLoanFlexibleLoanableData
    sapiV2GetLoanFlexibleCollateralData::Function = sapiV2GetLoanFlexibleCollateralData
    sapiV2GetPortfolioAccount::Function = sapiV2GetPortfolioAccount
    sapiV2PostEthStakingEthStake::Function = sapiV2PostEthStakingEthStake
    sapiV2PostSubAccountSubAccountApiIpRestriction::Function = sapiV2PostSubAccountSubAccountApiIpRestriction
    sapiV2PostLoanFlexibleBorrow::Function = sapiV2PostLoanFlexibleBorrow
    sapiV2PostLoanFlexibleRepay::Function = sapiV2PostLoanFlexibleRepay
    sapiV2PostLoanFlexibleAdjustLtv::Function = sapiV2PostLoanFlexibleAdjustLtv
    sapiV3GetSubAccountAssets::Function = sapiV3GetSubAccountAssets
    sapiV3PostAssetGetUserAsset::Function = sapiV3PostAssetGetUserAsset
    sapiV4GetSubAccountAssets::Function = sapiV4GetSubAccountAssets
    dapiPublicGetPing::Function = dapiPublicGetPing
    dapiPublicGetTime::Function = dapiPublicGetTime
    dapiPublicGetExchangeInfo::Function = dapiPublicGetExchangeInfo
    dapiPublicGetDepth::Function = dapiPublicGetDepth
    dapiPublicGetTrades::Function = dapiPublicGetTrades
    dapiPublicGetHistoricalTrades::Function = dapiPublicGetHistoricalTrades
    dapiPublicGetAggTrades::Function = dapiPublicGetAggTrades
    dapiPublicGetPremiumIndex::Function = dapiPublicGetPremiumIndex
    dapiPublicGetFundingRate::Function = dapiPublicGetFundingRate
    dapiPublicGetKlines::Function = dapiPublicGetKlines
    dapiPublicGetContinuousKlines::Function = dapiPublicGetContinuousKlines
    dapiPublicGetIndexPriceKlines::Function = dapiPublicGetIndexPriceKlines
    dapiPublicGetMarkPriceKlines::Function = dapiPublicGetMarkPriceKlines
    dapiPublicGetPremiumIndexKlines::Function = dapiPublicGetPremiumIndexKlines
    dapiPublicGetTicker24hr::Function = dapiPublicGetTicker24hr
    dapiPublicGetTickerPrice::Function = dapiPublicGetTickerPrice
    dapiPublicGetTickerBookTicker::Function = dapiPublicGetTickerBookTicker
    dapiPublicGetConstituents::Function = dapiPublicGetConstituents
    dapiPublicGetOpenInterest::Function = dapiPublicGetOpenInterest
    dapiPublicGetFundingInfo::Function = dapiPublicGetFundingInfo
    dapiDataGetDeliveryPrice::Function = dapiDataGetDeliveryPrice
    dapiDataGetOpenInterestHist::Function = dapiDataGetOpenInterestHist
    dapiDataGetTopLongShortAccountRatio::Function = dapiDataGetTopLongShortAccountRatio
    dapiDataGetTopLongShortPositionRatio::Function = dapiDataGetTopLongShortPositionRatio
    dapiDataGetGlobalLongShortAccountRatio::Function = dapiDataGetGlobalLongShortAccountRatio
    dapiDataGetTakerBuySellVol::Function = dapiDataGetTakerBuySellVol
    dapiDataGetBasis::Function = dapiDataGetBasis
    dapiPrivateGetPositionSideDual::Function = dapiPrivateGetPositionSideDual
    dapiPrivateGetOrderAmendment::Function = dapiPrivateGetOrderAmendment
    dapiPrivateGetOrder::Function = dapiPrivateGetOrder
    dapiPrivateGetOpenOrder::Function = dapiPrivateGetOpenOrder
    dapiPrivateGetOpenOrders::Function = dapiPrivateGetOpenOrders
    dapiPrivateGetOpenAlgoOrders::Function = dapiPrivateGetOpenAlgoOrders
    dapiPrivateGetAllOrders::Function = dapiPrivateGetAllOrders
    dapiPrivateGetBalance::Function = dapiPrivateGetBalance
    dapiPrivateGetAccount::Function = dapiPrivateGetAccount
    dapiPrivateGetPositionMarginHistory::Function = dapiPrivateGetPositionMarginHistory
    dapiPrivateGetPositionRisk::Function = dapiPrivateGetPositionRisk
    dapiPrivateGetUserTrades::Function = dapiPrivateGetUserTrades
    dapiPrivateGetIncome::Function = dapiPrivateGetIncome
    dapiPrivateGetLeverageBracket::Function = dapiPrivateGetLeverageBracket
    dapiPrivateGetForceOrders::Function = dapiPrivateGetForceOrders
    dapiPrivateGetAdlQuantile::Function = dapiPrivateGetAdlQuantile
    dapiPrivateGetCommissionRate::Function = dapiPrivateGetCommissionRate
    dapiPrivateGetIncomeAsyn::Function = dapiPrivateGetIncomeAsyn
    dapiPrivateGetIncomeAsynId::Function = dapiPrivateGetIncomeAsynId
    dapiPrivateGetTradeAsyn::Function = dapiPrivateGetTradeAsyn
    dapiPrivateGetTradeAsynId::Function = dapiPrivateGetTradeAsynId
    dapiPrivateGetOrderAsyn::Function = dapiPrivateGetOrderAsyn
    dapiPrivateGetOrderAsynId::Function = dapiPrivateGetOrderAsynId
    dapiPrivateGetPmExchangeInfo::Function = dapiPrivateGetPmExchangeInfo
    dapiPrivateGetPmAccountInfo::Function = dapiPrivateGetPmAccountInfo
    dapiPrivatePostPositionSideDual::Function = dapiPrivatePostPositionSideDual
    dapiPrivatePostOrder::Function = dapiPrivatePostOrder
    dapiPrivatePostAlgoOrder::Function = dapiPrivatePostAlgoOrder
    dapiPrivatePostBatchOrders::Function = dapiPrivatePostBatchOrders
    dapiPrivatePostCountdownCancelAll::Function = dapiPrivatePostCountdownCancelAll
    dapiPrivatePostLeverage::Function = dapiPrivatePostLeverage
    dapiPrivatePostMarginType::Function = dapiPrivatePostMarginType
    dapiPrivatePostPositionMargin::Function = dapiPrivatePostPositionMargin
    dapiPrivatePostListenKey::Function = dapiPrivatePostListenKey
    dapiPrivatePutListenKey::Function = dapiPrivatePutListenKey
    dapiPrivatePutOrder::Function = dapiPrivatePutOrder
    dapiPrivatePutBatchOrders::Function = dapiPrivatePutBatchOrders
    dapiPrivateDeleteOrder::Function = dapiPrivateDeleteOrder
    dapiPrivateDeleteAlgoOrder::Function = dapiPrivateDeleteAlgoOrder
    dapiPrivateDeleteAllOpenOrders::Function = dapiPrivateDeleteAllOpenOrders
    dapiPrivateDeleteBatchOrders::Function = dapiPrivateDeleteBatchOrders
    dapiPrivateDeleteListenKey::Function = dapiPrivateDeleteListenKey
    dapiPrivateV2GetLeverageBracket::Function = dapiPrivateV2GetLeverageBracket
    fapiPublicGetPing::Function = fapiPublicGetPing
    fapiPublicGetTime::Function = fapiPublicGetTime
    fapiPublicGetExchangeInfo::Function = fapiPublicGetExchangeInfo
    fapiPublicGetDepth::Function = fapiPublicGetDepth
    fapiPublicGetRpiDepth::Function = fapiPublicGetRpiDepth
    fapiPublicGetTrades::Function = fapiPublicGetTrades
    fapiPublicGetHistoricalTrades::Function = fapiPublicGetHistoricalTrades
    fapiPublicGetAggTrades::Function = fapiPublicGetAggTrades
    fapiPublicGetKlines::Function = fapiPublicGetKlines
    fapiPublicGetContinuousKlines::Function = fapiPublicGetContinuousKlines
    fapiPublicGetMarkPriceKlines::Function = fapiPublicGetMarkPriceKlines
    fapiPublicGetIndexPriceKlines::Function = fapiPublicGetIndexPriceKlines
    fapiPublicGetPremiumIndexKlines::Function = fapiPublicGetPremiumIndexKlines
    fapiPublicGetFundingRate::Function = fapiPublicGetFundingRate
    fapiPublicGetFundingInfo::Function = fapiPublicGetFundingInfo
    fapiPublicGetPremiumIndex::Function = fapiPublicGetPremiumIndex
    fapiPublicGetTicker24hr::Function = fapiPublicGetTicker24hr
    fapiPublicGetTickerPrice::Function = fapiPublicGetTickerPrice
    fapiPublicGetTickerBookTicker::Function = fapiPublicGetTickerBookTicker
    fapiPublicGetOpenInterest::Function = fapiPublicGetOpenInterest
    fapiPublicGetIndexInfo::Function = fapiPublicGetIndexInfo
    fapiPublicGetAssetIndex::Function = fapiPublicGetAssetIndex
    fapiPublicGetConstituents::Function = fapiPublicGetConstituents
    fapiPublicGetApiTradingStatus::Function = fapiPublicGetApiTradingStatus
    fapiPublicGetLvtKlines::Function = fapiPublicGetLvtKlines
    fapiPublicGetConvertExchangeInfo::Function = fapiPublicGetConvertExchangeInfo
    fapiPublicGetInsuranceBalance::Function = fapiPublicGetInsuranceBalance
    fapiPublicGetSymbolAdlRisk::Function = fapiPublicGetSymbolAdlRisk
    fapiPublicGetTradingSchedule::Function = fapiPublicGetTradingSchedule
    fapiDataGetDeliveryPrice::Function = fapiDataGetDeliveryPrice
    fapiDataGetOpenInterestHist::Function = fapiDataGetOpenInterestHist
    fapiDataGetTopLongShortAccountRatio::Function = fapiDataGetTopLongShortAccountRatio
    fapiDataGetTopLongShortPositionRatio::Function = fapiDataGetTopLongShortPositionRatio
    fapiDataGetGlobalLongShortAccountRatio::Function = fapiDataGetGlobalLongShortAccountRatio
    fapiDataGetTakerlongshortRatio::Function = fapiDataGetTakerlongshortRatio
    fapiDataGetBasis::Function = fapiDataGetBasis
    fapiPrivateGetForceOrders::Function = fapiPrivateGetForceOrders
    fapiPrivateGetAllOrders::Function = fapiPrivateGetAllOrders
    fapiPrivateGetOpenOrder::Function = fapiPrivateGetOpenOrder
    fapiPrivateGetOpenOrders::Function = fapiPrivateGetOpenOrders
    fapiPrivateGetOrder::Function = fapiPrivateGetOrder
    fapiPrivateGetAccount::Function = fapiPrivateGetAccount
    fapiPrivateGetBalance::Function = fapiPrivateGetBalance
    fapiPrivateGetLeverageBracket::Function = fapiPrivateGetLeverageBracket
    fapiPrivateGetPositionMarginHistory::Function = fapiPrivateGetPositionMarginHistory
    fapiPrivateGetPositionRisk::Function = fapiPrivateGetPositionRisk
    fapiPrivateGetPositionSideDual::Function = fapiPrivateGetPositionSideDual
    fapiPrivateGetUserTrades::Function = fapiPrivateGetUserTrades
    fapiPrivateGetIncome::Function = fapiPrivateGetIncome
    fapiPrivateGetCommissionRate::Function = fapiPrivateGetCommissionRate
    fapiPrivateGetRateLimitOrder::Function = fapiPrivateGetRateLimitOrder
    fapiPrivateGetApiTradingStatus::Function = fapiPrivateGetApiTradingStatus
    fapiPrivateGetMultiAssetsMargin::Function = fapiPrivateGetMultiAssetsMargin
    fapiPrivateGetApiReferralIfNewUser::Function = fapiPrivateGetApiReferralIfNewUser
    fapiPrivateGetApiReferralCustomization::Function = fapiPrivateGetApiReferralCustomization
    fapiPrivateGetApiReferralUserCustomization::Function = fapiPrivateGetApiReferralUserCustomization
    fapiPrivateGetApiReferralTraderNum::Function = fapiPrivateGetApiReferralTraderNum
    fapiPrivateGetApiReferralOverview::Function = fapiPrivateGetApiReferralOverview
    fapiPrivateGetApiReferralTradeVol::Function = fapiPrivateGetApiReferralTradeVol
    fapiPrivateGetApiReferralRebateVol::Function = fapiPrivateGetApiReferralRebateVol
    fapiPrivateGetApiReferralTraderSummary::Function = fapiPrivateGetApiReferralTraderSummary
    fapiPrivateGetAdlQuantile::Function = fapiPrivateGetAdlQuantile
    fapiPrivateGetPmAccountInfo::Function = fapiPrivateGetPmAccountInfo
    fapiPrivateGetOrderAmendment::Function = fapiPrivateGetOrderAmendment
    fapiPrivateGetIncomeAsyn::Function = fapiPrivateGetIncomeAsyn
    fapiPrivateGetIncomeAsynId::Function = fapiPrivateGetIncomeAsynId
    fapiPrivateGetOrderAsyn::Function = fapiPrivateGetOrderAsyn
    fapiPrivateGetOrderAsynId::Function = fapiPrivateGetOrderAsynId
    fapiPrivateGetTradeAsyn::Function = fapiPrivateGetTradeAsyn
    fapiPrivateGetTradeAsynId::Function = fapiPrivateGetTradeAsynId
    fapiPrivateGetFeeBurn::Function = fapiPrivateGetFeeBurn
    fapiPrivateGetSymbolConfig::Function = fapiPrivateGetSymbolConfig
    fapiPrivateGetAccountConfig::Function = fapiPrivateGetAccountConfig
    fapiPrivateGetConvertOrderStatus::Function = fapiPrivateGetConvertOrderStatus
    fapiPrivateGetAlgoOrder::Function = fapiPrivateGetAlgoOrder
    fapiPrivateGetOpenAlgoOrders::Function = fapiPrivateGetOpenAlgoOrders
    fapiPrivateGetAllAlgoOrders::Function = fapiPrivateGetAllAlgoOrders
    fapiPrivateGetStockContract::Function = fapiPrivateGetStockContract
    fapiPrivatePostBatchOrders::Function = fapiPrivatePostBatchOrders
    fapiPrivatePostPositionSideDual::Function = fapiPrivatePostPositionSideDual
    fapiPrivatePostPositionMargin::Function = fapiPrivatePostPositionMargin
    fapiPrivatePostMarginType::Function = fapiPrivatePostMarginType
    fapiPrivatePostOrder::Function = fapiPrivatePostOrder
    fapiPrivatePostOrderTest::Function = fapiPrivatePostOrderTest
    fapiPrivatePostLeverage::Function = fapiPrivatePostLeverage
    fapiPrivatePostListenKey::Function = fapiPrivatePostListenKey
    fapiPrivatePostCountdownCancelAll::Function = fapiPrivatePostCountdownCancelAll
    fapiPrivatePostMultiAssetsMargin::Function = fapiPrivatePostMultiAssetsMargin
    fapiPrivatePostApiReferralCustomization::Function = fapiPrivatePostApiReferralCustomization
    fapiPrivatePostApiReferralUserCustomization::Function = fapiPrivatePostApiReferralUserCustomization
    fapiPrivatePostFeeBurn::Function = fapiPrivatePostFeeBurn
    fapiPrivatePostConvertGetQuote::Function = fapiPrivatePostConvertGetQuote
    fapiPrivatePostConvertAcceptQuote::Function = fapiPrivatePostConvertAcceptQuote
    fapiPrivatePostAlgoOrder::Function = fapiPrivatePostAlgoOrder
    fapiPrivatePutListenKey::Function = fapiPrivatePutListenKey
    fapiPrivatePutOrder::Function = fapiPrivatePutOrder
    fapiPrivatePutBatchOrders::Function = fapiPrivatePutBatchOrders
    fapiPrivateDeleteBatchOrders::Function = fapiPrivateDeleteBatchOrders
    fapiPrivateDeleteOrder::Function = fapiPrivateDeleteOrder
    fapiPrivateDeleteAllOpenOrders::Function = fapiPrivateDeleteAllOpenOrders
    fapiPrivateDeleteListenKey::Function = fapiPrivateDeleteListenKey
    fapiPrivateDeleteAlgoOrder::Function = fapiPrivateDeleteAlgoOrder
    fapiPrivateDeleteAlgoOpenOrders::Function = fapiPrivateDeleteAlgoOpenOrders
    fapiPublicV2GetTickerPrice::Function = fapiPublicV2GetTickerPrice
    fapiPrivateV2GetAccount::Function = fapiPrivateV2GetAccount
    fapiPrivateV2GetBalance::Function = fapiPrivateV2GetBalance
    fapiPrivateV2GetPositionRisk::Function = fapiPrivateV2GetPositionRisk
    fapiPrivateV3GetAccount::Function = fapiPrivateV3GetAccount
    fapiPrivateV3GetBalance::Function = fapiPrivateV3GetBalance
    fapiPrivateV3GetPositionRisk::Function = fapiPrivateV3GetPositionRisk
    eapiPublicGetPing::Function = eapiPublicGetPing
    eapiPublicGetTime::Function = eapiPublicGetTime
    eapiPublicGetExchangeInfo::Function = eapiPublicGetExchangeInfo
    eapiPublicGetIndex::Function = eapiPublicGetIndex
    eapiPublicGetTicker::Function = eapiPublicGetTicker
    eapiPublicGetMark::Function = eapiPublicGetMark
    eapiPublicGetDepth::Function = eapiPublicGetDepth
    eapiPublicGetKlines::Function = eapiPublicGetKlines
    eapiPublicGetTrades::Function = eapiPublicGetTrades
    eapiPublicGetHistoricalTrades::Function = eapiPublicGetHistoricalTrades
    eapiPublicGetExerciseHistory::Function = eapiPublicGetExerciseHistory
    eapiPublicGetOpenInterest::Function = eapiPublicGetOpenInterest
    eapiPrivateGetAccount::Function = eapiPrivateGetAccount
    eapiPrivateGetPosition::Function = eapiPrivateGetPosition
    eapiPrivateGetOpenOrders::Function = eapiPrivateGetOpenOrders
    eapiPrivateGetHistoryOrders::Function = eapiPrivateGetHistoryOrders
    eapiPrivateGetUserTrades::Function = eapiPrivateGetUserTrades
    eapiPrivateGetExerciseRecord::Function = eapiPrivateGetExerciseRecord
    eapiPrivateGetBill::Function = eapiPrivateGetBill
    eapiPrivateGetIncomeAsyn::Function = eapiPrivateGetIncomeAsyn
    eapiPrivateGetIncomeAsynId::Function = eapiPrivateGetIncomeAsynId
    eapiPrivateGetMarginAccount::Function = eapiPrivateGetMarginAccount
    eapiPrivateGetMmp::Function = eapiPrivateGetMmp
    eapiPrivateGetCountdownCancelAll::Function = eapiPrivateGetCountdownCancelAll
    eapiPrivateGetOrder::Function = eapiPrivateGetOrder
    eapiPrivateGetBlockOrderOrders::Function = eapiPrivateGetBlockOrderOrders
    eapiPrivateGetBlockOrderExecute::Function = eapiPrivateGetBlockOrderExecute
    eapiPrivateGetBlockUserTrades::Function = eapiPrivateGetBlockUserTrades
    eapiPrivateGetBlockTrades::Function = eapiPrivateGetBlockTrades
    eapiPrivateGetComission::Function = eapiPrivateGetComission
    eapiPrivatePostOrder::Function = eapiPrivatePostOrder
    eapiPrivatePostBatchOrders::Function = eapiPrivatePostBatchOrders
    eapiPrivatePostListenKey::Function = eapiPrivatePostListenKey
    eapiPrivatePostMmpSet::Function = eapiPrivatePostMmpSet
    eapiPrivatePostMmpReset::Function = eapiPrivatePostMmpReset
    eapiPrivatePostCountdownCancelAll::Function = eapiPrivatePostCountdownCancelAll
    eapiPrivatePostCountdownCancelAllHeartBeat::Function = eapiPrivatePostCountdownCancelAllHeartBeat
    eapiPrivatePostBlockOrderCreate::Function = eapiPrivatePostBlockOrderCreate
    eapiPrivatePostBlockOrderExecute::Function = eapiPrivatePostBlockOrderExecute
    eapiPrivatePutListenKey::Function = eapiPrivatePutListenKey
    eapiPrivatePutBlockOrderCreate::Function = eapiPrivatePutBlockOrderCreate
    eapiPrivateDeleteOrder::Function = eapiPrivateDeleteOrder
    eapiPrivateDeleteBatchOrders::Function = eapiPrivateDeleteBatchOrders
    eapiPrivateDeleteAllOpenOrders::Function = eapiPrivateDeleteAllOpenOrders
    eapiPrivateDeleteAllOpenOrdersByUnderlying::Function = eapiPrivateDeleteAllOpenOrdersByUnderlying
    eapiPrivateDeleteListenKey::Function = eapiPrivateDeleteListenKey
    eapiPrivateDeleteBlockOrderCreate::Function = eapiPrivateDeleteBlockOrderCreate
    publicGetPing::Function = publicGetPing
    publicGetTime::Function = publicGetTime
    publicGetDepth::Function = publicGetDepth
    publicGetTrades::Function = publicGetTrades
    publicGetAggTrades::Function = publicGetAggTrades
    publicGetHistoricalTrades::Function = publicGetHistoricalTrades
    publicGetKlines::Function = publicGetKlines
    publicGetUiKlines::Function = publicGetUiKlines
    publicGetTicker24hr::Function = publicGetTicker24hr
    publicGetTicker::Function = publicGetTicker
    publicGetTickerTradingDay::Function = publicGetTickerTradingDay
    publicGetTickerPrice::Function = publicGetTickerPrice
    publicGetTickerBookTicker::Function = publicGetTickerBookTicker
    publicGetExchangeInfo::Function = publicGetExchangeInfo
    publicGetAvgPrice::Function = publicGetAvgPrice
    publicPutUserDataStream::Function = publicPutUserDataStream
    publicPostUserDataStream::Function = publicPostUserDataStream
    publicDeleteUserDataStream::Function = publicDeleteUserDataStream
    privateGetAllOrderList::Function = privateGetAllOrderList
    privateGetOpenOrderList::Function = privateGetOpenOrderList
    privateGetOrderList::Function = privateGetOrderList
    privateGetOrder::Function = privateGetOrder
    privateGetOpenOrders::Function = privateGetOpenOrders
    privateGetAllOrders::Function = privateGetAllOrders
    privateGetAccount::Function = privateGetAccount
    privateGetMyTrades::Function = privateGetMyTrades
    privateGetRateLimitOrder::Function = privateGetRateLimitOrder
    privateGetMyPreventedMatches::Function = privateGetMyPreventedMatches
    privateGetMyAllocations::Function = privateGetMyAllocations
    privateGetAccountCommission::Function = privateGetAccountCommission
    privatePostOrderOco::Function = privatePostOrderOco
    privatePostOrderListOco::Function = privatePostOrderListOco
    privatePostOrderListOto::Function = privatePostOrderListOto
    privatePostOrderListOtoco::Function = privatePostOrderListOtoco
    privatePostOrderListOpo::Function = privatePostOrderListOpo
    privatePostOrderListOpoco::Function = privatePostOrderListOpoco
    privatePostSorOrder::Function = privatePostSorOrder
    privatePostSorOrderTest::Function = privatePostSorOrderTest
    privatePostOrder::Function = privatePostOrder
    privatePostOrderCancelReplace::Function = privatePostOrderCancelReplace
    privatePostOrderTest::Function = privatePostOrderTest
    privateDeleteOpenOrders::Function = privateDeleteOpenOrders
    privateDeleteOrderList::Function = privateDeleteOrderList
    privateDeleteOrder::Function = privateDeleteOrder
    papiGetPing::Function = papiGetPing
    papiGetUmOrder::Function = papiGetUmOrder
    papiGetUmOpenOrder::Function = papiGetUmOpenOrder
    papiGetUmOpenOrders::Function = papiGetUmOpenOrders
    papiGetUmAllOrders::Function = papiGetUmAllOrders
    papiGetCmOrder::Function = papiGetCmOrder
    papiGetCmOpenOrder::Function = papiGetCmOpenOrder
    papiGetCmOpenOrders::Function = papiGetCmOpenOrders
    papiGetCmAllOrders::Function = papiGetCmAllOrders
    papiGetUmConditionalOpenOrder::Function = papiGetUmConditionalOpenOrder
    papiGetUmConditionalOpenOrders::Function = papiGetUmConditionalOpenOrders
    papiGetUmConditionalOrderHistory::Function = papiGetUmConditionalOrderHistory
    papiGetUmConditionalAllOrders::Function = papiGetUmConditionalAllOrders
    papiGetCmConditionalOpenOrder::Function = papiGetCmConditionalOpenOrder
    papiGetCmConditionalOpenOrders::Function = papiGetCmConditionalOpenOrders
    papiGetCmConditionalOrderHistory::Function = papiGetCmConditionalOrderHistory
    papiGetCmConditionalAllOrders::Function = papiGetCmConditionalAllOrders
    papiGetMarginOrder::Function = papiGetMarginOrder
    papiGetMarginOpenOrders::Function = papiGetMarginOpenOrders
    papiGetMarginAllOrders::Function = papiGetMarginAllOrders
    papiGetMarginOrderList::Function = papiGetMarginOrderList
    papiGetMarginAllOrderList::Function = papiGetMarginAllOrderList
    papiGetMarginOpenOrderList::Function = papiGetMarginOpenOrderList
    papiGetMarginMyTrades::Function = papiGetMarginMyTrades
    papiGetBalance::Function = papiGetBalance
    papiGetAccount::Function = papiGetAccount
    papiGetMarginMaxBorrowable::Function = papiGetMarginMaxBorrowable
    papiGetMarginMaxWithdraw::Function = papiGetMarginMaxWithdraw
    papiGetUmPositionRisk::Function = papiGetUmPositionRisk
    papiGetCmPositionRisk::Function = papiGetCmPositionRisk
    papiGetUmPositionSideDual::Function = papiGetUmPositionSideDual
    papiGetCmPositionSideDual::Function = papiGetCmPositionSideDual
    papiGetUmUserTrades::Function = papiGetUmUserTrades
    papiGetCmUserTrades::Function = papiGetCmUserTrades
    papiGetUmLeverageBracket::Function = papiGetUmLeverageBracket
    papiGetCmLeverageBracket::Function = papiGetCmLeverageBracket
    papiGetMarginForceOrders::Function = papiGetMarginForceOrders
    papiGetUmForceOrders::Function = papiGetUmForceOrders
    papiGetCmForceOrders::Function = papiGetCmForceOrders
    papiGetUmApiTradingStatus::Function = papiGetUmApiTradingStatus
    papiGetUmCommissionRate::Function = papiGetUmCommissionRate
    papiGetCmCommissionRate::Function = papiGetCmCommissionRate
    papiGetMarginMarginLoan::Function = papiGetMarginMarginLoan
    papiGetMarginRepayLoan::Function = papiGetMarginRepayLoan
    papiGetMarginMarginInterestHistory::Function = papiGetMarginMarginInterestHistory
    papiGetPortfolioInterestHistory::Function = papiGetPortfolioInterestHistory
    papiGetUmIncome::Function = papiGetUmIncome
    papiGetCmIncome::Function = papiGetCmIncome
    papiGetUmAccount::Function = papiGetUmAccount
    papiGetCmAccount::Function = papiGetCmAccount
    papiGetRepayFuturesSwitch::Function = papiGetRepayFuturesSwitch
    papiGetUmAdlQuantile::Function = papiGetUmAdlQuantile
    papiGetCmAdlQuantile::Function = papiGetCmAdlQuantile
    papiGetUmTradeAsyn::Function = papiGetUmTradeAsyn
    papiGetUmTradeAsynId::Function = papiGetUmTradeAsynId
    papiGetUmOrderAsyn::Function = papiGetUmOrderAsyn
    papiGetUmOrderAsynId::Function = papiGetUmOrderAsynId
    papiGetUmIncomeAsyn::Function = papiGetUmIncomeAsyn
    papiGetUmIncomeAsynId::Function = papiGetUmIncomeAsynId
    papiGetUmOrderAmendment::Function = papiGetUmOrderAmendment
    papiGetCmOrderAmendment::Function = papiGetCmOrderAmendment
    papiGetUmFeeBurn::Function = papiGetUmFeeBurn
    papiGetUmAccountConfig::Function = papiGetUmAccountConfig
    papiGetUmSymbolConfig::Function = papiGetUmSymbolConfig
    papiGetCmAccountConfig::Function = papiGetCmAccountConfig
    papiGetCmSymbolConfig::Function = papiGetCmSymbolConfig
    papiGetRateLimitOrder::Function = papiGetRateLimitOrder
    papiPostUmOrder::Function = papiPostUmOrder
    papiPostUmConditionalOrder::Function = papiPostUmConditionalOrder
    papiPostCmOrder::Function = papiPostCmOrder
    papiPostCmConditionalOrder::Function = papiPostCmConditionalOrder
    papiPostMarginOrder::Function = papiPostMarginOrder
    papiPostMarginLoan::Function = papiPostMarginLoan
    papiPostRepayLoan::Function = papiPostRepayLoan
    papiPostMarginOrderOco::Function = papiPostMarginOrderOco
    papiPostUmLeverage::Function = papiPostUmLeverage
    papiPostCmLeverage::Function = papiPostCmLeverage
    papiPostUmPositionSideDual::Function = papiPostUmPositionSideDual
    papiPostCmPositionSideDual::Function = papiPostCmPositionSideDual
    papiPostAutoCollection::Function = papiPostAutoCollection
    papiPostBnbTransfer::Function = papiPostBnbTransfer
    papiPostRepayFuturesSwitch::Function = papiPostRepayFuturesSwitch
    papiPostRepayFuturesNegativeBalance::Function = papiPostRepayFuturesNegativeBalance
    papiPostListenKey::Function = papiPostListenKey
    papiPostAssetCollection::Function = papiPostAssetCollection
    papiPostMarginRepayDebt::Function = papiPostMarginRepayDebt
    papiPostUmFeeBurn::Function = papiPostUmFeeBurn
    papiPostUmStockContract::Function = papiPostUmStockContract
    papiPutListenKey::Function = papiPutListenKey
    papiPutUmOrder::Function = papiPutUmOrder
    papiPutCmOrder::Function = papiPutCmOrder
    papiDeleteUmOrder::Function = papiDeleteUmOrder
    papiDeleteUmConditionalOrder::Function = papiDeleteUmConditionalOrder
    papiDeleteUmAllOpenOrders::Function = papiDeleteUmAllOpenOrders
    papiDeleteUmConditionalAllOpenOrders::Function = papiDeleteUmConditionalAllOpenOrders
    papiDeleteCmOrder::Function = papiDeleteCmOrder
    papiDeleteCmConditionalOrder::Function = papiDeleteCmConditionalOrder
    papiDeleteCmAllOpenOrders::Function = papiDeleteCmAllOpenOrders
    papiDeleteCmConditionalAllOpenOrders::Function = papiDeleteCmConditionalAllOpenOrders
    papiDeleteMarginOrder::Function = papiDeleteMarginOrder
    papiDeleteMarginAllOpenOrders::Function = papiDeleteMarginAllOpenOrders
    papiDeleteMarginOrderList::Function = papiDeleteMarginOrderList
    papiDeleteListenKey::Function = papiDeleteListenKey
    papiV2GetUmAccount::Function = papiV2GetUmAccount

end
function describe(self::Binance, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "binance",
    Symbol("name") => "Binance",
    Symbol("countries") => [],
    Symbol("rateLimit") => 50,
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => true,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => true,
        Symbol("borrowIsolatedMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => true,
        Symbol("createDepositAddress") => false,
        Symbol("createLimitBuyOrder") => true,
        Symbol("createLimitSellOrder") => true,
        Symbol("createMarketBuyOrder") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => true,
        Symbol("createMarketSellOrder") => true,
        Symbol("createMarketSellOrderWithCost") => true,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopMarketOrder") => false,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTrailingPercentOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("editOrders") => true,
        Symbol("fetchAccounts") => nothing,
        Symbol("fetchADLRank") => true,
        Symbol("fetchAllGreeks") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => true,
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => true,
        Symbol("fetchCanceledAndClosedOrders") => "emulated",
        Symbol("fetchCanceledOrders") => "emulated",
        Symbol("fetchClosedOrder") => false,
        Symbol("fetchClosedOrders") => "emulated",
        Symbol("fetchConvertCurrencies") => true,
        Symbol("fetchConvertQuote") => true,
        Symbol("fetchConvertTrade") => true,
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
        Symbol("fetchFundingInterval") => "emulated",
        Symbol("fetchFundingIntervals") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => true,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => "emulated",
        Symbol("fetchIsolatedBorrowRates") => true,
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLastPrices") => true,
        Symbol("fetchLedger") => true,
        Symbol("fetchLedgerEntry") => true,
        Symbol("fetchLeverage") => "emulated",
        Symbol("fetchLeverages") => true,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => true,
        Symbol("fetchMarginAdjustmentHistory") => true,
        Symbol("fetchMarginMode") => true,
        Symbol("fetchMarginModes") => true,
        Symbol("fetchMarketLeverageTiers") => "emulated",
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMarkPrice") => true,
        Symbol("fetchMarkPrices") => true,
        Symbol("fetchMyLiquidations") => true,
        Symbol("fetchMySettlementHistory") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => true,
        Symbol("fetchOpenOrder") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => true,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionADLRank") => true,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsADLRank") => true,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => true,
        Symbol("fetchPremiumIndexOHLCV") => true,
        Symbol("fetchSettlementHistory") => true,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTradingLimits") => "emulated",
        Symbol("fetchTransactionFee") => "emulated",
        Symbol("fetchTransactionFees") => true,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawAddresses") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => true,
        Symbol("repayIsolatedMargin") => true,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("signIn") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1s") => "1s",
        Symbol("1m") => "1m",
        Symbol("3m") => "3m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("3d") => "3d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/e9419b93-ccb0-46aa-9bff-c883f096274b",
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("dapiPublic") => "https://testnet.binancefuture.com/dapi/v1",
            Symbol("dapiPrivate") => "https://testnet.binancefuture.com/dapi/v1",
            Symbol("dapiPrivateV2") => "https://testnet.binancefuture.com/dapi/v2",
            Symbol("fapiPublic") => "https://testnet.binancefuture.com/fapi/v1",
            Symbol("fapiPublicV2") => "https://testnet.binancefuture.com/fapi/v2",
            Symbol("fapiPublicV3") => "https://testnet.binancefuture.com/fapi/v3",
            Symbol("fapiPrivate") => "https://testnet.binancefuture.com/fapi/v1",
            Symbol("fapiPrivateV2") => "https://testnet.binancefuture.com/fapi/v2",
            Symbol("fapiPrivateV3") => "https://testnet.binancefuture.com/fapi/v3",
            Symbol("public") => "https://testnet.binance.vision/api/v3",
            Symbol("private") => "https://testnet.binance.vision/api/v3",
            Symbol("v1") => "https://testnet.binance.vision/api/v1"
        ),
        Symbol("demo") => Dict{Symbol, Any}(
            Symbol("dapiPublic") => "https://demo-dapi.binance.com/dapi/v1",
            Symbol("dapiPrivate") => "https://demo-dapi.binance.com/dapi/v1",
            Symbol("dapiPrivateV2") => "https://demo-dapi.binance.com/dapi/v2",
            Symbol("fapiPublic") => "https://demo-fapi.binance.com/fapi/v1",
            Symbol("fapiPublicV2") => "https://demo-fapi.binance.com/fapi/v2",
            Symbol("fapiPublicV3") => "https://demo-fapi.binance.com/fapi/v3",
            Symbol("fapiPrivate") => "https://demo-fapi.binance.com/fapi/v1",
            Symbol("fapiPrivateV2") => "https://demo-fapi.binance.com/fapi/v2",
            Symbol("fapiPrivateV3") => "https://demo-fapi.binance.com/fapi/v3",
            Symbol("public") => "https://demo-api.binance.com/api/v3",
            Symbol("private") => "https://demo-api.binance.com/api/v3",
            Symbol("v1") => "https://demo-api.binance.com/api/v1"
        ),
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("sapi") => "https://api.binance.com/sapi/v1",
            Symbol("sapiV2") => "https://api.binance.com/sapi/v2",
            Symbol("sapiV3") => "https://api.binance.com/sapi/v3",
            Symbol("sapiV4") => "https://api.binance.com/sapi/v4",
            Symbol("dapiPublic") => "https://dapi.binance.com/dapi/v1",
            Symbol("dapiPrivate") => "https://dapi.binance.com/dapi/v1",
            Symbol("eapiPublic") => "https://eapi.binance.com/eapi/v1",
            Symbol("eapiPrivate") => "https://eapi.binance.com/eapi/v1",
            Symbol("dapiPrivateV2") => "https://dapi.binance.com/dapi/v2",
            Symbol("dapiData") => "https://dapi.binance.com/futures/data",
            Symbol("fapiPublic") => "https://fapi.binance.com/fapi/v1",
            Symbol("fapiPublicV2") => "https://fapi.binance.com/fapi/v2",
            Symbol("fapiPublicV3") => "https://fapi.binance.com/fapi/v3",
            Symbol("fapiPrivate") => "https://fapi.binance.com/fapi/v1",
            Symbol("fapiPrivateV2") => "https://fapi.binance.com/fapi/v2",
            Symbol("fapiPrivateV3") => "https://fapi.binance.com/fapi/v3",
            Symbol("fapiData") => "https://fapi.binance.com/futures/data",
            Symbol("public") => "https://api.binance.com/api/v3",
            Symbol("private") => "https://api.binance.com/api/v3",
            Symbol("v1") => "https://api.binance.com/api/v1",
            Symbol("papi") => "https://papi.binance.com/papi/v1",
            Symbol("papiV2") => "https://papi.binance.com/papi/v2"
        ),
        Symbol("www") => "https://www.binance.com",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://accounts.binance.com/register?ref=CCXTCOM",
            Symbol("discount") => 0.1
        ),
        Symbol("doc") => ["https://developers.binance.com/en"],
        Symbol("api_management") => "https://www.binance.com/en/usercenter/settings/api-management",
        Symbol("fees") => "https://www.binance.com/en/fee/schedule"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("sapi") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("copyTrading/futures/userStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("copyTrading/futures/leadSymbol") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("system/status") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("accountSnapshot") => Dict{Symbol, Any}(
    Symbol("cost") => 240
),
                Symbol("account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/asset") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/pair") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/allAssets") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/allPairs") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/priceIndex") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/delist-schedule") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("asset/assetDividend") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/dribblet") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("asset/assetDetail") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("asset/tradeFee") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("asset/ledger-transfer/cloud-mining/queryByPage") => Dict{Symbol, Any}(
    Symbol("cost") => 4.0002
),
                Symbol("asset/convert-transfer/queryByPage") => Dict{Symbol, Any}(
    Symbol("cost") => 0.033335
),
                Symbol("asset/wallet/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("asset/custody/transfer-history") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("margin/borrow-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/loan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/interestHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/forceLiquidationRec") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("margin/myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/maxBorrowable") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("margin/maxTransferable") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("margin/tradeCoeff") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/isolated/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/isolated/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/isolated/pair") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/isolated/allPairs") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/isolated/accountLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/interestRateHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/allOrderList") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("margin/openOrderList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/crossMarginData") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1,
    Symbol("noCoin") => 0.5
),
                Symbol("margin/isolatedMarginData") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1,
    Symbol("noCoin") => 1
),
                Symbol("margin/isolatedMarginTier") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/rateLimit/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("margin/dribblet") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/dust") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("margin/crossMarginCollateralRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("margin/exchange-small-liability") => Dict{Symbol, Any}(
    Symbol("cost") => 0.6667
),
                Symbol("margin/exchange-small-liability-history") => Dict{Symbol, Any}(
    Symbol("cost") => 0.6667
),
                Symbol("margin/next-hourly-interest-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 0.6667
),
                Symbol("margin/capital-flow") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("margin/delist-schedule") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("margin/available-inventory") => Dict{Symbol, Any}(
    Symbol("cost") => 0.3334
),
                Symbol("margin/leverageBracket") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("loan/vip/loanable/data") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/vip/collateral/data") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/vip/request/data") => Dict{Symbol, Any}(
    Symbol("cost") => 2.6668
),
                Symbol("loan/vip/request/interestRate") => Dict{Symbol, Any}(
    Symbol("cost") => 2.6668
),
                Symbol("loan/income") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/ongoing/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/ltv/adjustment/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/borrow/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/repay/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/loanable/data") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/collateral/data") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/repay/collateral/rate") => Dict{Symbol, Any}(
    Symbol("cost") => 600
),
                Symbol("loan/flexible/ongoing/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("loan/flexible/borrow/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/flexible/repay/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/flexible/ltv/adjustment/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/vip/ongoing/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/vip/repay/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/vip/collateral/account") => Dict{Symbol, Any}(
    Symbol("cost") => 600
),
                Symbol("fiat/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 600.03
),
                Symbol("fiat/payments") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("futures/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("futures/histDataLink") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("rebate/taxQuery") => Dict{Symbol, Any}(
    Symbol("cost") => 80.004
),
                Symbol("capital/config/getall") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/deposit/address/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("capital/deposit/hisrec") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("capital/deposit/subAddress") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("capital/deposit/subHisrec") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("capital/withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("capital/withdraw/address/list") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("capital/contract/convertible-coins") => Dict{Symbol, Any}(
    Symbol("cost") => 4.0002
),
                Symbol("convert/tradeFlow") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("convert/exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("convert/assetInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("convert/orderStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 0.6667
),
                Symbol("convert/limit/queryOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("account/status") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("account/apiTradingStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("account/apiRestrictions/ipRestriction") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("bnbBurn") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/futures/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/futures/accountSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/futures/positionRisk") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/futures/internalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/margin/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/margin/accountSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/spotSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/sub/transfer/history") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/transfer/subUserHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/universalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/apiRestrictions/ipRestriction/thirdPartyList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/transaction-statistics") => Dict{Symbol, Any}(
    Symbol("cost") => 0.40002
),
                Symbol("sub-account/subAccountApi/ipRestriction") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("managed-subaccount/asset") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("managed-subaccount/accountSnapshot") => Dict{Symbol, Any}(
    Symbol("cost") => 240
),
                Symbol("managed-subaccount/queryTransLogForInvestor") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("managed-subaccount/queryTransLogForTradeParent") => Dict{Symbol, Any}(
    Symbol("cost") => 0.40002
),
                Symbol("managed-subaccount/fetch-future-asset") => Dict{Symbol, Any}(
    Symbol("cost") => 0.40002
),
                Symbol("managed-subaccount/marginAsset") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("managed-subaccount/info") => Dict{Symbol, Any}(
    Symbol("cost") => 0.40002
),
                Symbol("managed-subaccount/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 0.006667
),
                Symbol("managed-subaccount/query-trans-log") => Dict{Symbol, Any}(
    Symbol("cost") => 0.40002
),
                Symbol("lending/daily/product/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/daily/userLeftQuota") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/daily/userRedemptionQuota") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/daily/token/position") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/union/account") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/union/purchaseRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/union/redemptionRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/union/interestHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/project/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/project/position/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("eth-staking/eth/history/stakingHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("eth-staking/eth/history/redemptionHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("eth-staking/eth/history/rewardsHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("eth-staking/eth/quota") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("eth-staking/eth/history/rateHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("eth-staking/account") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("eth-staking/wbeth/history/wrapHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("eth-staking/wbeth/history/unwrapHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("eth-staking/eth/history/wbethRewardsHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sol-staking/sol/history/stakingHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sol-staking/sol/history/redemptionHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sol-staking/sol/history/bnsolRewardsHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sol-staking/sol/history/rateHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sol-staking/account") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sol-staking/sol/quota") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("mining/pub/algoList") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("mining/pub/coinList") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("mining/worker/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("mining/worker/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("mining/payment/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("mining/statistics/user/status") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("mining/statistics/user/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("mining/payment/uid") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("bswap/pools") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("bswap/liquidity") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1,
    Symbol("noPoolId") => 1
),
                Symbol("bswap/liquidityOps") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("bswap/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 1.00005
),
                Symbol("bswap/swap") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("bswap/poolConfigure") => Dict{Symbol, Any}(
    Symbol("cost") => 1.00005
),
                Symbol("bswap/addLiquidityPreview") => Dict{Symbol, Any}(
    Symbol("cost") => 1.00005
),
                Symbol("bswap/removeLiquidityPreview") => Dict{Symbol, Any}(
    Symbol("cost") => 1.00005
),
                Symbol("bswap/unclaimedRewards") => Dict{Symbol, Any}(
    Symbol("cost") => 6.667
),
                Symbol("bswap/claimedHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 6.667
),
                Symbol("blvt/tokenInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("blvt/subscribe/record") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("blvt/redeem/record") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("blvt/userLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("apiReferral/ifNewUser") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/customization") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/userCustomization") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/rebate/recentRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/rebate/historicalRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/kickback/recentRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/kickback/historicalRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/commission/futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/commission/coinFutures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/transfer/futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/rebate/recentRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/rebate/historicalRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount/bnbBurn/status") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount/depositHist") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount/spotSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount/marginSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount/futuresSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/rebate/futures/recentRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/ipRestriction") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/universalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/apiRestrictions") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("c2c/orderMatch/listUserOrderHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("nft/history/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("nft/history/deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("nft/history/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("nft/user/getAsset") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("pay/transactions") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("giftcard/verify") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("giftcard/cryptography/rsa-public-key") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("giftcard/buyCode/token-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("algo/spot/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("algo/spot/historicalOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("algo/spot/subOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("algo/futures/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("algo/futures/historicalOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("algo/futures/subOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("portfolio/account") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("portfolio/collateralRate") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("portfolio/pmLoan") => Dict{Symbol, Any}(
    Symbol("cost") => 3.3335
),
                Symbol("portfolio/interest-history") => Dict{Symbol, Any}(
    Symbol("cost") => 0.6667
),
                Symbol("portfolio/asset-index-price") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("portfolio/repay-futures-switch") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("portfolio/margin-asset-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("portfolio/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("portfolio/negative-balance-exchange-record") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("portfolio/pmloan-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("portfolio/earn-asset-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("portfolio/delta-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("staking/productList") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("staking/position") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("staking/stakingRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("staking/personalLeftQuota") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/target-asset/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/target-asset/roi/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/all/asset") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/source-asset/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/plan/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/plan/id") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/history/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/index/info") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/index/user-summary") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/one-off/status") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/redeem/history") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/rebalance/history") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("simple-earn/flexible/list") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/locked/list") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/flexible/personalLeftQuota") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/locked/personalLeftQuota") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/flexible/subscriptionPreview") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/locked/subscriptionPreview") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/flexible/history/rateHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/flexible/position") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/locked/position") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/account") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/flexible/history/subscriptionRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/locked/history/subscriptionRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/flexible/history/redemptionRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/locked/history/redemptionRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/flexible/history/rewardsRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/locked/history/rewardsRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/flexible/history/collateralRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("dci/product/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("dci/product/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("dci/product/accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("accumulator/product/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("accumulator/product/position/list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("accumulator/product/sum-holding") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("asset/dust") => Dict{Symbol, Any}(
    Symbol("cost") => 0.06667
),
                Symbol("asset/dust-btc") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 6.0003
),
                Symbol("asset/get-funding-asset") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("asset/convert-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 0.033335
),
                Symbol("account/disableFastWithdrawSwitch") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("account/enableFastWithdrawSwitch") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("capital/withdraw/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 4.0002
),
                Symbol("capital/contract/convertible-coins") => Dict{Symbol, Any}(
    Symbol("cost") => 4.0002
),
                Symbol("capital/deposit/credit-apply") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/borrow-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("margin/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 4.0002
),
                Symbol("margin/loan") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("margin/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.040002
),
                Symbol("margin/order/oco") => Dict{Symbol, Any}(
    Symbol("cost") => 0.040002
),
                Symbol("margin/dust") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("margin/exchange-small-liability") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("margin/isolated/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 4.0002
),
                Symbol("margin/isolated/account") => Dict{Symbol, Any}(
    Symbol("cost") => 2.0001
),
                Symbol("margin/max-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 300
),
                Symbol("bnbBurn") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/virtualSubAccount") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/margin/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 4.0002
),
                Symbol("sub-account/margin/enable") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/futures/enable") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/futures/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/futures/internalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/transfer/subToSub") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/transfer/subToMaster") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/universalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/options/enable") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("managed-subaccount/deposit") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("managed-subaccount/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("userDataStream/isolated") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("userListenToken") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("futures/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/customizedFixed/purchase") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/daily/purchase") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/daily/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("bswap/liquidityAdd") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                Symbol("bswap/liquidityRemove") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                Symbol("bswap/swap") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                Symbol("bswap/claimRewards") => Dict{Symbol, Any}(
    Symbol("cost") => 6.667
),
                Symbol("blvt/subscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("blvt/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("apiReferral/customization") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/userCustomization") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/rebate/historicalRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/kickback/historicalRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount/futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/permission") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/commission") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/commission/futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/commission/coinFutures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/transfer/futures") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/rebate/historicalRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount/bnbBurn/spot") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount/bnbBurn/marginInterest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccount/blvt") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/ipRestriction") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/ipRestriction/ipList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/universalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/permission/universalTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/permission/vanillaOptions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("giftcard/createCode") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("giftcard/redeemCode") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("giftcard/buyCode") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("algo/spot/newOrderTwap") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("algo/futures/newOrderVp") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("algo/futures/newOrderTwap") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("staking/purchase") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("staking/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("staking/setAutoStaking") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("eth-staking/eth/stake") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("eth-staking/eth/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("eth-staking/wbeth/wrap") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sol-staking/sol/stake") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sol-staking/sol/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("mining/hash-transfer/config") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("mining/hash-transfer/config/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("portfolio/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("loan/vip/renew") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/vip/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/adjust/ltv") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/customize/margin_call") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/flexible/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/flexible/adjust/ltv") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/vip/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("convert/getQuote") => Dict{Symbol, Any}(
    Symbol("cost") => 1.3334
),
                Symbol("convert/acceptQuote") => Dict{Symbol, Any}(
    Symbol("cost") => 3.3335
),
                Symbol("convert/limit/placeOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 3.3335
),
                Symbol("convert/limit/cancelOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1.3334
),
                Symbol("portfolio/auto-collection") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("portfolio/asset-collection") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("portfolio/bnb-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("portfolio/repay-futures-switch") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("portfolio/repay-futures-negative-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("portfolio/mint") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("portfolio/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("portfolio/earn-asset-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("portfolio/delta-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("lending/auto-invest/plan/add") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/plan/edit") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/plan/edit-status") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/one-off") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("lending/auto-invest/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("simple-earn/flexible/subscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("simple-earn/locked/subscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("simple-earn/flexible/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("simple-earn/locked/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("simple-earn/flexible/setAutoSubscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/locked/setAutoSubscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("simple-earn/locked/setRedeemOption") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("dci/product/subscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("dci/product/auto_compound/edit") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("accumulator/product/subscribe") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("userDataStream/isolated") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("margin/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.006667
),
                Symbol("margin/orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 0.006667
),
                Symbol("margin/isolated/account") => Dict{Symbol, Any}(
    Symbol("cost") => 2.0001
),
                Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("userDataStream/isolated") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("broker/subAccountApi") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/subAccountApi/ipRestriction/ipList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algo/spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("algo/futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/subAccountApi/ipRestriction/ipList") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
)
            )
        ),
        Symbol("sapiV2") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("eth-staking/account") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sub-account/futures/account") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("sub-account/futures/accountSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sub-account/futures/positionRisk") => Dict{Symbol, Any}(
    Symbol("cost") => 0.1
),
                Symbol("loan/flexible/ongoing/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("loan/flexible/borrow/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/flexible/repay/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/flexible/ltv/adjustment/history") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/flexible/loanable/data") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("loan/flexible/collateral/data") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("portfolio/account") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("eth-staking/eth/stake") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sub-account/subAccountApi/ipRestriction") => Dict{Symbol, Any}(
    Symbol("cost") => 20.001
),
                Symbol("loan/flexible/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/flexible/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
),
                Symbol("loan/flexible/adjust/ltv") => Dict{Symbol, Any}(
    Symbol("cost") => 40.002
)
            )
        ),
        Symbol("sapiV3") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("sub-account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 0.40002
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("asset/getUserAsset") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
)
            )
        ),
        Symbol("sapiV4") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("sub-account/assets") => Dict{Symbol, Any}(
    Symbol("cost") => 0.40002
)
            )
        ),
        Symbol("dapiPublic") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 2,
    Symbol("byLimit") => [[50, 2], [100, 5], [500, 10], [1000, 20]]
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("historicalTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("aggTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("premiumIndex") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("fundingRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
),
                Symbol("continuousKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
),
                Symbol("indexPriceKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
),
                Symbol("markPriceKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
),
                Symbol("premiumIndexKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
),
                Symbol("ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 2
),
                Symbol("ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 2,
    Symbol("noSymbol") => 5
),
                Symbol("constituents") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("openInterest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fundingInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("dapiData") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("delivery-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openInterestHist") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("topLongShortAccountRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("topLongShortPositionRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("globalLongShortAccountRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("takerBuySellVol") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("basis") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("dapiPrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("positionSide/dual") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("orderAmendment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 5
),
                Symbol("openAlgoOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("positionMargin/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positionRisk") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("userTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("income") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("leverageBracket") => Dict{Symbol, Any}(
    Symbol("cost") => 2,
    Symbol("noSymbol") => 2
),
                Symbol("forceOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 20,
    Symbol("noSymbol") => 50
),
                Symbol("adlQuantile") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("income/asyn") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("income/asyn/id") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("trade/asyn") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("trade/asyn/id") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("order/asyn") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("order/asyn/id") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("pmExchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("pmAccountInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("positionSide/dual") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("countdownCancelAll") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("marginType") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positionMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("dapiPrivateV2") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("leverageBracket") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("fapiPublic") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 2,
    Symbol("byLimit") => [[50, 2], [100, 5], [500, 10], [1000, 20]]
),
                Symbol("rpiDepth") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("historicalTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("aggTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
),
                Symbol("continuousKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
),
                Symbol("markPriceKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
),
                Symbol("indexPriceKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
),
                Symbol("premiumIndexKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[99, 1], [499, 2], [1000, 5], [10000, 10]]
),
                Symbol("fundingRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("fundingInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("premiumIndex") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 2
),
                Symbol("ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 2
),
                Symbol("openInterest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("indexInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("assetIndex") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 10
),
                Symbol("constituents") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("apiTradingStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 10
),
                Symbol("lvtKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("convert/exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("insuranceBalance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("symbolAdlRisk") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingSchedule") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        ),
        Symbol("fapiData") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("delivery-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openInterestHist") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("topLongShortAccountRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("topLongShortPositionRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("globalLongShortAccountRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("takerlongshortRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("basis") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("fapiPrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("forceOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 20,
    Symbol("noSymbol") => 50
),
                Symbol("allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("openOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("leverageBracket") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positionMargin/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positionRisk") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("positionSide/dual") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("userTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("income") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("rateLimit/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiTradingStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("multiAssetsMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("apiReferral/ifNewUser") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/customization") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/userCustomization") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/traderNum") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/overview") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/tradeVol") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/rebateVol") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/traderSummary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("adlQuantile") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("pmAccountInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("orderAmendment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("income/asyn") => Dict{Symbol, Any}(
    Symbol("cost") => 1000
),
                Symbol("income/asyn/id") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("order/asyn") => Dict{Symbol, Any}(
    Symbol("cost") => 1000
),
                Symbol("order/asyn/id") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("trade/asyn") => Dict{Symbol, Any}(
    Symbol("cost") => 1000
),
                Symbol("trade/asyn/id") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("feeBurn") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("symbolConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("accountConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("convert/orderStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("openAlgoOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("allAlgoOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("stock/contract") => Dict{Symbol, Any}(
    Symbol("cost") => 50
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("positionSide/dual") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positionMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("marginType") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("order/test") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("countdownCancelAll") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("multiAssetsMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/customization") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("apiReferral/userCustomization") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("feeBurn") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("convert/getQuote") => Dict{Symbol, Any}(
    Symbol("cost") => 200
),
                Symbol("convert/acceptQuote") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algoOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("algoOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("fapiPublicV2") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 0
)
            )
        ),
        Symbol("fapiPrivateV2") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positionRisk") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("fapiPublicV3") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}()
        ),
        Symbol("fapiPrivateV3") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("positionRisk") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("eapiPublic") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("index") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("mark") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("historicalTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("exerciseHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("openInterest") => Dict{Symbol, Any}(
    Symbol("cost") => 3
)
            )
        ),
        Symbol("eapiPrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("position") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("historyOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("userTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("exerciseRecord") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("bill") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("income/asyn") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("income/asyn/id") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("marginAccount") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("mmp") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("countdownCancelAll") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block/order/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("block/order/execute") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("block/user-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("blockTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("comission") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("mmpSet") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("mmpReset") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("countdownCancelAll") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("countdownCancelAllHeartBeat") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("block/order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("block/order/execute") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block/order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("allOpenOrdersByUnderlying") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("block/order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("byLimit") => [[100, 1], [500, 5], [1000, 10], [5000, 50]]
),
                Symbol("trades") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("aggTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("historicalTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("klines") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("uiKlines") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4,
    Symbol("noSymbol") => 16
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4,
    Symbol("noSymbol") => 16
),
                Symbol("ticker/tradingDay") => Dict{Symbol, Any}(
    Symbol("cost") => 0.8
),
                Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4,
    Symbol("noSymbol") => 0.8
),
                Symbol("ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4,
    Symbol("noSymbol") => 0.8
),
                Symbol("exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("avgPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("allOrderList") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("openOrderList") => Dict{Symbol, Any}(
    Symbol("cost") => 1.2
),
                Symbol("orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 0.8
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.8
),
                Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1.2,
    Symbol("noSymbol") => 16
),
                Symbol("allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rateLimit/order") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("myPreventedMatches") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("myAllocations") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/commission") => Dict{Symbol, Any}(
    Symbol("cost") => 4
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("order/oco") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("orderList/oco") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("orderList/oto") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("orderList/otoco") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("orderList/opo") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("orderList/opoco") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("sor/order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("sor/order/test") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("order/cancelReplace") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("order/test") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
)
            )
        ),
        Symbol("papi") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("ping") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("um/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/openOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("um/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("cm/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/openOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("cm/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("um/conditional/openOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/conditional/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("um/conditional/orderHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/conditional/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("cm/conditional/openOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/conditional/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1,
    Symbol("noSymbol") => 40
),
                Symbol("cm/conditional/orderHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/conditional/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("margin/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("margin/allOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("margin/orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("margin/allOrderList") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("margin/openOrderList") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("margin/myTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("margin/maxBorrowable") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/maxWithdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/positionRisk") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/positionRisk") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("um/positionSide/dual") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("cm/positionSide/dual") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("um/userTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("cm/userTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("um/leverageBracket") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("cm/leverageBracket") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("margin/forceOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/forceOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 20,
    Symbol("noSymbol") => 50
),
                Symbol("cm/forceOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 20,
    Symbol("noSymbol") => 50
),
                Symbol("um/apiTradingStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2,
    Symbol("noSymbol") => 2
),
                Symbol("um/commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("cm/commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("margin/marginLoan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("margin/repayLoan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("margin/marginInterestHistory") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("portfolio/interest-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("um/income") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("cm/income") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("um/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("repay-futures-switch") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("um/adlQuantile") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("cm/adlQuantile") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("um/trade/asyn") => Dict{Symbol, Any}(
    Symbol("cost") => 300
),
                Symbol("um/trade/asyn/id") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("um/order/asyn") => Dict{Symbol, Any}(
    Symbol("cost") => 300
),
                Symbol("um/order/asyn/id") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("um/income/asyn") => Dict{Symbol, Any}(
    Symbol("cost") => 300
),
                Symbol("um/income/asyn/id") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("um/orderAmendment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/orderAmendment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/feeBurn") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("um/accountConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/symbolConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/accountConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/symbolConfig") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("rateLimit/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("um/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/conditional/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/conditional/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("marginLoan") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("repayLoan") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("margin/order/oco") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("cm/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("um/positionSide/dual") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("cm/positionSide/dual") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("auto-collection") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("bnb-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("repay-futures-switch") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("repay-futures-negative-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("asset-collection") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("margin/repay-debt") => Dict{Symbol, Any}(
    Symbol("cost") => 3000
),
                Symbol("um/feeBurn") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/stock/contract") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                Symbol("um/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("um/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/conditional/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("um/conditional/allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/conditional/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("cm/conditional/allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("margin/allOpenOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("margin/orderList") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
)
            )
        ),
        Symbol("papiV2") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("um/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.001"),
            Symbol("maker") => self.parseNumber("0.001")
        ),
        Symbol("linear") => Dict{Symbol, Any}(
            Symbol("trading") => Dict{Symbol, Any}(
                Symbol("feeSide") => "quote",
                Symbol("tierBased") => true,
                Symbol("percentage") => true,
                Symbol("taker") => self.parseNumber("0.000500"),
                Symbol("maker") => self.parseNumber("0.000200"),
                Symbol("tiers") => Dict{Symbol, Any}(
                    Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.000400")], [self.parseNumber("250"), self.parseNumber("0.000400")], [self.parseNumber("2500"), self.parseNumber("0.000350")], [self.parseNumber("7500"), self.parseNumber("0.000320")], [self.parseNumber("22500"), self.parseNumber("0.000300")], [self.parseNumber("50000"), self.parseNumber("0.000270")], [self.parseNumber("100000"), self.parseNumber("0.000250")], [self.parseNumber("200000"), self.parseNumber("0.000220")], [self.parseNumber("400000"), self.parseNumber("0.000200")], [self.parseNumber("750000"), self.parseNumber("0.000170")]],
                    Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.000200")], [self.parseNumber("250"), self.parseNumber("0.000160")], [self.parseNumber("2500"), self.parseNumber("0.000140")], [self.parseNumber("7500"), self.parseNumber("0.000120")], [self.parseNumber("22500"), self.parseNumber("0.000100")], [self.parseNumber("50000"), self.parseNumber("0.000080")], [self.parseNumber("100000"), self.parseNumber("0.000060")], [self.parseNumber("200000"), self.parseNumber("0.000040")], [self.parseNumber("400000"), self.parseNumber("0.000020")], [self.parseNumber("750000"), self.parseNumber("0")]]
                )
            )
        ),
        Symbol("inverse") => Dict{Symbol, Any}(
            Symbol("trading") => Dict{Symbol, Any}(
                Symbol("feeSide") => "base",
                Symbol("tierBased") => true,
                Symbol("percentage") => true,
                Symbol("taker") => self.parseNumber("0.000500"),
                Symbol("maker") => self.parseNumber("0.000100"),
                Symbol("tiers") => Dict{Symbol, Any}(
                    Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.000500")], [self.parseNumber("250"), self.parseNumber("0.000450")], [self.parseNumber("2500"), self.parseNumber("0.000400")], [self.parseNumber("7500"), self.parseNumber("0.000300")], [self.parseNumber("22500"), self.parseNumber("0.000250")], [self.parseNumber("50000"), self.parseNumber("0.000240")], [self.parseNumber("100000"), self.parseNumber("0.000240")], [self.parseNumber("200000"), self.parseNumber("0.000240")], [self.parseNumber("400000"), self.parseNumber("0.000240")], [self.parseNumber("750000"), self.parseNumber("0.000240")]],
                    Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.000100")], [self.parseNumber("250"), self.parseNumber("0.000080")], [self.parseNumber("2500"), self.parseNumber("0.000050")], [self.parseNumber("7500"), self.parseNumber("0.0000030")], [self.parseNumber("22500"), self.parseNumber("0")], [self.parseNumber("50000"), self.parseNumber("-0.000050")], [self.parseNumber("100000"), self.parseNumber("-0.000060")], [self.parseNumber("200000"), self.parseNumber("-0.000070")], [self.parseNumber("400000"), self.parseNumber("-0.000080")], [self.parseNumber("750000"), self.parseNumber("-0.000090")]]
                )
            )
        ),
        Symbol("option") => Dict{Symbol, Any}()
    ),
    Symbol("currencies") => Dict{Symbol, Any}(
        Symbol("BNFCR") => self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => "BNFCR",
    Symbol("code") => "BNFCR",
    Symbol("precision") => self.parseNumber("0.001")
))
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("BCC") => "BCC",
        Symbol("YOYO") => "YOYOW"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("sandboxMode") => false,
        Symbol("fetchMargins") => true,
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot", "linear", "inverse"],
            Symbol("loadAllOptions") => false
        ),
        Symbol("fetchCurrencies") => true,
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("timeInForce") => "GTC",
            Symbol("warnOnSTPForInverse") => true,
            Symbol("quoteOrderQty") => true
        ),
        Symbol("defaultType") => "spot",
        Symbol("defaultSubType") => nothing,
        Symbol("hasAlreadyAuthenticatedSuccessfully") => false,
        Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
            Symbol("warnWithoutSymbol") => true
        ),
        Symbol("currencyToPrecisionRoundingMode") => TRUNCATE,
        Symbol("setMarginMode") => Dict{Symbol, Any}(
            Symbol("throwMarginModeAlreadySet") => true
        ),
        Symbol("fetchPositions") => Dict{Symbol, Any}(
            Symbol("method") => "positionRisk"
        ),
        Symbol("recvWindow") => 10 * 1000,
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("newOrderRespType") => Dict{Symbol, Any}(
            Symbol("market") => "FULL",
            Symbol("limit") => "FULL"
        ),
        Symbol("broker") => Dict{Symbol, Any}(
            Symbol("spot") => "x-TKT5PX2F",
            Symbol("margin") => "x-TKT5PX2F",
            Symbol("future") => "x-cvBPrNm9",
            Symbol("delivery") => "x-xcKtGhcu",
            Symbol("swap") => "x-cvBPrNm9",
            Symbol("option") => "x-xcKtGhcu",
            Symbol("inverse") => "x-xcKtGhcu"
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("main") => "MAIN",
            Symbol("spot") => "MAIN",
            Symbol("funding") => "FUNDING",
            Symbol("margin") => "MARGIN",
            Symbol("cross") => "MARGIN",
            Symbol("future") => "UMFUTURE",
            Symbol("delivery") => "CMFUTURE",
            Symbol("linear") => "UMFUTURE",
            Symbol("swap") => "UMFUTURE",
            Symbol("inverse") => "CMFUTURE",
            Symbol("option") => "OPTION"
        ),
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("MAIN") => "spot",
            Symbol("FUNDING") => "funding",
            Symbol("MARGIN") => "margin",
            Symbol("UMFUTURE") => "linear",
            Symbol("CMFUTURE") => "inverse",
            Symbol("OPTION") => "option"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "BTC",
            Symbol("BTCSEGWIT") => "SEGWITBTC",
            Symbol("BTCLIGHTNING") => "LIGHTNING",
            Symbol("ERC20") => "ETH",
            Symbol("ETH") => "ETH",
            Symbol("TRC20") => "TRX",
            Symbol("TRX") => "TRX",
            Symbol("BEP2") => "BNB",
            Symbol("BSC") => "BSC",
            Symbol("BEP20") => "BSC",
            Symbol("CHZ2") => "CHZ2",
            Symbol("XRP") => "XRP",
            Symbol("EOS") => "EOS",
            Symbol("DOGE") => "DOGE",
            Symbol("SOL") => "SOL",
            Symbol("SONIC") => "SONIC",
            Symbol("ARBITRUM") => "ARBITRUM",
            Symbol("AVAXC") => "AVAXC",
            Symbol("MATIC") => "MATIC",
            Symbol("BASE") => "BASE",
            Symbol("SUI") => "SUI",
            Symbol("OP") => "OPTIMISM",
            Symbol("OPTIMISM") => "OPTIMISM",
            Symbol("NEAR") => "NEAR",
            Symbol("APT") => "APT",
            Symbol("SCROLL") => "SCROLL",
            Symbol("KAVA") => "KAVA",
            Symbol("XLM") => "XLM",
            Symbol("RSK") => "RSK",
            Symbol("SEI") => "SEI",
            Symbol("TON") => "TON",
            Symbol("ADA") => "ADA",
            Symbol("ALGO") => "ALGO",
            Symbol("RUNE") => "RUNE",
            Symbol("OSMO") => "OSMO",
            Symbol("CELO") => "CELO",
            Symbol("HBAR") => "HBAR",
            Symbol("ZKSYNCERA") => "ZKSYNCERA",
            Symbol("KLAY") => "KLAY",
            Symbol("ACA") => "ACA",
            Symbol("STX") => "STX",
            Symbol("XTZ") => "XTZ",
            Symbol("METIS") => "METIS",
            Symbol("EGLD") => "EGLD",
            Symbol("ASTR") => "ASTR",
            Symbol("CFX") => "CFX",
            Symbol("SCRT") => "SCRT",
            Symbol("ONT") => "ONT",
            Symbol("ZEC") => "ZEC",
            Symbol("XMR") => "XMR",
            Symbol("BCH") => "BCH",
            Symbol("LTC") => "LTC",
            Symbol("TAO") => "TAO",
            Symbol("WLD") => "WLD",
            Symbol("ICP") => "ICP",
            Symbol("FLR") => "FLR",
            Symbol("COSMOS") => "ATOM",
            Symbol("ATOM") => "ATOM",
            Symbol("FIL") => "FIL",
            Symbol("INJ") => "INJ",
            Symbol("DASH") => "DASH",
            Symbol("VET") => "VET",
            Symbol("FET") => "FET",
            Symbol("TIA") => "TIA",
            Symbol("KAIA") => "KAIA",
            Symbol("DCR") => "DCR",
            Symbol("IOTA") => "IOTA",
            Symbol("THETA") => "THETA",
            Symbol("AR") => "AR",
            Symbol("DYDX") => "DYDX",
            Symbol("XEC") => "XEC",
            Symbol("QTUM") => "QTUM",
            Symbol("ENJ") => "ENJ",
            Symbol("RVN") => "RVN",
            Symbol("ZIL") => "ZIL",
            Symbol("BERA") => "BERA",
            Symbol("0G") => "0G",
            Symbol("MINA") => "MINA",
            Symbol("AXL") => "AXL",
            Symbol("ROSE") => "ROSE",
            Symbol("CKB") => "CKB",
            Symbol("DGB") => "DGB",
            Symbol("MOVE") => "MOVE",
            Symbol("XVG") => "XVG",
            Symbol("SC") => "SC",
            Symbol("LINEA") => "LINEA",
            Symbol("WAVES") => "WAVES",
            Symbol("MANTA") => "MANTA"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("TRX") => "TRC20",
            Symbol("BSC") => "BEP20",
            Symbol("ETH") => "ERC20",
            Symbol("SOL") => "SOL",
            Symbol("OPTIMISM") => "OP"
        ),
        Symbol("impliedNetworks") => Dict{Symbol, Any}(
            Symbol("ETH") => Dict{Symbol, Any}(
                Symbol("ERC20") => "ETH"
            ),
            Symbol("TRX") => Dict{Symbol, Any}(
                Symbol("TRC20") => "TRX"
            )
        ),
        Symbol("legalMoney") => Dict{Symbol, Any}(
            Symbol("MXN") => true,
            Symbol("UGX") => true,
            Symbol("SEK") => true,
            Symbol("CHF") => true,
            Symbol("VND") => true,
            Symbol("AED") => true,
            Symbol("DKK") => true,
            Symbol("KZT") => true,
            Symbol("HUF") => true,
            Symbol("PEN") => true,
            Symbol("PHP") => true,
            Symbol("USD") => true,
            Symbol("TRY") => true,
            Symbol("EUR") => true,
            Symbol("NGN") => true,
            Symbol("PLN") => true,
            Symbol("BRL") => true,
            Symbol("ZAR") => true,
            Symbol("KES") => true,
            Symbol("ARS") => true,
            Symbol("RUB") => true,
            Symbol("AUD") => true,
            Symbol("NOK") => true,
            Symbol("CZK") => true,
            Symbol("GBP") => true,
            Symbol("UAH") => true,
            Symbol("GHS") => true,
            Symbol("HKD") => true,
            Symbol("CAD") => true,
            Symbol("INR") => true,
            Symbol("JPY") => true,
            Symbol("NZD") => true
        ),
        Symbol("legalMoneyCurrenciesById") => Dict{Symbol, Any}(
            Symbol("BUSD") => "USD"
        ),
        Symbol("defaultWithdrawPrecision") => 1e-8,
        Symbol("defaultFiatWithdrawPrecision") => 0.01
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("fetchCurrencies") => Dict{Symbol, Any}(
                Symbol("private") => true
            ),
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => true,
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => Dict{Symbol, Any}(
                    Symbol("EXPIRE_MAKER") => true,
                    Symbol("EXPIRE_TAKER") => true,
                    Symbol("EXPIRE_BOTH") => true,
                    Symbol("NONE") => true
                ),
                Symbol("trailing") => false,
                Symbol("icebergAmount") => true
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 1,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => nothing,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 10000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 10000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("mark") => true,
                    Symbol("last") => true,
                    Symbol("index") => false
                ),
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("attachedStopLossTakeProfit") => nothing,
                Symbol("timeInForce") => Dict{Symbol, Any}(
                    Symbol("IOC") => true,
                    Symbol("FOK") => true,
                    Symbol("PO") => true,
                    Symbol("GTD") => true
                ),
                Symbol("hedged") => true,
                Symbol("selfTradePrevention") => true,
                Symbol("trailing") => true,
                Symbol("iceberg") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 5
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("daysBack") => nothing,
                Symbol("limit") => 1000,
                Symbol("untilDays") => 7,
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
                Symbol("limit") => 500,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 90,
                Symbol("untilDays") => 7,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 90,
                Symbol("daysBackCanceled") => 3,
                Symbol("untilDays") => 7,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 500
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
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            )
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("exact") => Dict{Symbol, Any}(
                Symbol("-1004") => OperationFailed,
                Symbol("-1008") => OperationFailed,
                Symbol("-1099") => AuthenticationError,
                Symbol("-1108") => BadRequest,
                Symbol("-1131") => BadRequest,
                Symbol("-1134") => BadRequest,
                Symbol("-1135") => BadRequest,
                Symbol("-1145") => BadRequest,
                Symbol("-1151") => BadSymbol,
                Symbol("-2008") => AuthenticationError,
                Symbol("-2016") => OperationRejected,
                Symbol("-2021") => BadResponse,
                Symbol("-2022") => BadResponse,
                Symbol("-2026") => InvalidOrder,
                Symbol("-3000") => OperationFailed,
                Symbol("-3001") => AuthenticationError,
                Symbol("-3002") => BadSymbol,
                Symbol("-3003") => BadRequest,
                Symbol("-3004") => OperationRejected,
                Symbol("-3005") => BadRequest,
                Symbol("-3006") => BadRequest,
                Symbol("-3007") => OperationFailed,
                Symbol("-3008") => BadRequest,
                Symbol("-3009") => OperationRejected,
                Symbol("-3010") => BadRequest,
                Symbol("-3011") => BadRequest,
                Symbol("-3012") => OperationRejected,
                Symbol("-3013") => BadRequest,
                Symbol("-3014") => AccountSuspended,
                Symbol("-3015") => BadRequest,
                Symbol("-3016") => BadRequest,
                Symbol("-3017") => OperationRejected,
                Symbol("-3018") => AccountSuspended,
                Symbol("-3019") => AccountSuspended,
                Symbol("-3020") => BadRequest,
                Symbol("-3021") => BadRequest,
                Symbol("-3022") => AccountSuspended,
                Symbol("-3023") => OperationRejected,
                Symbol("-3024") => OperationRejected,
                Symbol("-3025") => BadRequest,
                Symbol("-3026") => BadRequest,
                Symbol("-3027") => BadSymbol,
                Symbol("-3028") => BadSymbol,
                Symbol("-3029") => OperationFailed,
                Symbol("-3036") => AccountSuspended,
                Symbol("-3037") => OperationFailed,
                Symbol("-3038") => BadRequest,
                Symbol("-3041") => InsufficientFunds,
                Symbol("-3042") => BadRequest,
                Symbol("-3043") => PermissionDenied,
                Symbol("-3044") => OperationFailed,
                Symbol("-3045") => OperationRejected,
                Symbol("-3999") => PermissionDenied,
                Symbol("-4000") => ExchangeError,
                Symbol("-4001") => BadRequest,
                Symbol("-4002") => BadRequest,
                Symbol("-4003") => BadRequest,
                Symbol("-4004") => AuthenticationError,
                Symbol("-4005") => RateLimitExceeded,
                Symbol("-4006") => BadRequest,
                Symbol("-4007") => PermissionDenied,
                Symbol("-4008") => PermissionDenied,
                Symbol("-4009") => ExchangeError,
                Symbol("-4010") => PermissionDenied,
                Symbol("-4011") => BadRequest,
                Symbol("-4012") => PermissionDenied,
                Symbol("-4013") => AuthenticationError,
                Symbol("-4014") => OperationRejected,
                Symbol("-4015") => PermissionDenied,
                Symbol("-4016") => PermissionDenied,
                Symbol("-4017") => PermissionDenied,
                Symbol("-4018") => BadSymbol,
                Symbol("-4019") => BadRequest,
                Symbol("-4020") => ExchangeError,
                Symbol("-4021") => BadRequest,
                Symbol("-4022") => BadRequest,
                Symbol("-4023") => OperationRejected,
                Symbol("-4024") => InsufficientFunds,
                Symbol("-4025") => InsufficientFunds,
                Symbol("-4026") => InsufficientFunds,
                Symbol("-4027") => OperationFailed,
                Symbol("-4028") => BadRequest,
                Symbol("-4029") => BadRequest,
                Symbol("-4030") => BadResponse,
                Symbol("-4031") => OperationFailed,
                Symbol("-4032") => OperationRejected,
                Symbol("-4033") => BadRequest,
                Symbol("-4034") => OperationRejected,
                Symbol("-4035") => PermissionDenied,
                Symbol("-4036") => PermissionDenied,
                Symbol("-4037") => OperationFailed,
                Symbol("-4038") => OperationFailed,
                Symbol("-4039") => PermissionDenied,
                Symbol("-4040") => OperationRejected,
                Symbol("-4041") => OperationFailed,
                Symbol("-4042") => OperationRejected,
                Symbol("-4043") => OperationRejected,
                Symbol("-4044") => PermissionDenied,
                Symbol("-4045") => OperationFailed,
                Symbol("-4046") => AuthenticationError,
                Symbol("-4047") => BadRequest,
                Symbol("-4048") => ExchangeError,
                Symbol("-4049") => ExchangeError,
                Symbol("-4050") => ExchangeError,
                Symbol("-4051") => ExchangeError,
                Symbol("-4052") => ExchangeError,
                Symbol("-4053") => ExchangeError,
                Symbol("-4054") => ExchangeError,
                Symbol("-4055") => ExchangeError,
                Symbol("-4056") => ExchangeError,
                Symbol("-4057") => ExchangeError,
                Symbol("-4058") => ExchangeError,
                Symbol("-4059") => ExchangeError,
                Symbol("-4060") => OperationFailed,
                Symbol("-4061") => ExchangeError,
                Symbol("-4062") => ExchangeError,
                Symbol("-4063") => ExchangeError,
                Symbol("-4064") => ExchangeError,
                Symbol("-4065") => ExchangeError,
                Symbol("-4066") => ExchangeError,
                Symbol("-4067") => ExchangeError,
                Symbol("-4068") => ExchangeError,
                Symbol("-4069") => ExchangeError,
                Symbol("-4070") => ExchangeError,
                Symbol("-4071") => ExchangeError,
                Symbol("-4072") => ExchangeError,
                Symbol("-4073") => ExchangeError,
                Symbol("-4074") => ExchangeError,
                Symbol("-4075") => ExchangeError,
                Symbol("-4076") => ExchangeError,
                Symbol("-4077") => ExchangeError,
                Symbol("-4078") => ExchangeError,
                Symbol("-4079") => ExchangeError,
                Symbol("-4080") => ExchangeError,
                Symbol("-4081") => ExchangeError,
                Symbol("-4082") => ExchangeError,
                Symbol("-4083") => ExchangeError,
                Symbol("-4084") => ExchangeError,
                Symbol("-4085") => ExchangeError,
                Symbol("-4086") => ExchangeError,
                Symbol("-4087") => ExchangeError,
                Symbol("-4088") => ExchangeError,
                Symbol("-4089") => ExchangeError,
                Symbol("-4091") => ExchangeError,
                Symbol("-4092") => ExchangeError,
                Symbol("-4093") => ExchangeError,
                Symbol("-4094") => ExchangeError,
                Symbol("-4095") => ExchangeError,
                Symbol("-4096") => ExchangeError,
                Symbol("-4097") => ExchangeError,
                Symbol("-4098") => ExchangeError,
                Symbol("-4099") => ExchangeError,
                Symbol("-4101") => ExchangeError,
                Symbol("-4102") => ExchangeError,
                Symbol("-4103") => ExchangeError,
                Symbol("-4104") => ExchangeError,
                Symbol("-4105") => ExchangeError,
                Symbol("-4106") => ExchangeError,
                Symbol("-4107") => ExchangeError,
                Symbol("-4108") => ExchangeError,
                Symbol("-4109") => ExchangeError,
                Symbol("-4110") => ExchangeError,
                Symbol("-4112") => ExchangeError,
                Symbol("-4113") => ExchangeError,
                Symbol("-4114") => ExchangeError,
                Symbol("-4115") => ExchangeError,
                Symbol("-4116") => ExchangeError,
                Symbol("-4117") => ExchangeError,
                Symbol("-4118") => ExchangeError,
                Symbol("-4119") => ExchangeError,
                Symbol("-4120") => ExchangeError,
                Symbol("-4121") => ExchangeError,
                Symbol("-4122") => ExchangeError,
                Symbol("-4123") => ExchangeError,
                Symbol("-4124") => ExchangeError,
                Symbol("-4125") => ExchangeError,
                Symbol("-4126") => ExchangeError,
                Symbol("-4127") => ExchangeError,
                Symbol("-4128") => ExchangeError,
                Symbol("-4129") => ExchangeError,
                Symbol("-4130") => ExchangeError,
                Symbol("-4131") => ExchangeError,
                Symbol("-4132") => ExchangeError,
                Symbol("-4133") => ExchangeError,
                Symbol("-4134") => ExchangeError,
                Symbol("-4135") => ExchangeError,
                Symbol("-4136") => ExchangeError,
                Symbol("-4137") => ExchangeError,
                Symbol("-4138") => ExchangeError,
                Symbol("-4139") => ExchangeError,
                Symbol("-4141") => ExchangeError,
                Symbol("-4142") => ExchangeError,
                Symbol("-4143") => ExchangeError,
                Symbol("-4144") => ExchangeError,
                Symbol("-4145") => ExchangeError,
                Symbol("-4146") => ExchangeError,
                Symbol("-4147") => ExchangeError,
                Symbol("-4148") => ExchangeError,
                Symbol("-4149") => ExchangeError,
                Symbol("-4150") => ExchangeError,
                Symbol("-5001") => BadRequest,
                Symbol("-5002") => InsufficientFunds,
                Symbol("-5003") => InsufficientFunds,
                Symbol("-5004") => OperationRejected,
                Symbol("-5005") => OperationRejected,
                Symbol("-5006") => OperationRejected,
                Symbol("-5007") => BadRequest,
                Symbol("-5008") => OperationRejected,
                Symbol("-5009") => BadSymbol,
                Symbol("-5010") => OperationFailed,
                Symbol("-5011") => BadRequest,
                Symbol("-5012") => OperationFailed,
                Symbol("-5013") => InsufficientFunds,
                Symbol("-5021") => BadRequest,
                Symbol("-5022") => BadRequest,
                Symbol("-6001") => BadSymbol,
                Symbol("-6003") => PermissionDenied,
                Symbol("-6004") => BadRequest,
                Symbol("-6005") => BadRequest,
                Symbol("-6006") => BadRequest,
                Symbol("-6007") => OperationRejected,
                Symbol("-6008") => OperationRejected,
                Symbol("-6009") => RateLimitExceeded,
                Symbol("-6011") => OperationRejected,
                Symbol("-6012") => InsufficientFunds,
                Symbol("-6013") => BadResponse,
                Symbol("-6014") => OperationRejected,
                Symbol("-6015") => BadRequest,
                Symbol("-6016") => BadRequest,
                Symbol("-6017") => PermissionDenied,
                Symbol("-6018") => InsufficientFunds,
                Symbol("-6019") => OperationRejected,
                Symbol("-6020") => BadRequest,
                Symbol("-7001") => BadRequest,
                Symbol("-7002") => BadRequest,
                Symbol("-10001") => OperationFailed,
                Symbol("-10002") => BadRequest,
                Symbol("-10005") => BadResponse,
                Symbol("-10007") => BadRequest,
                Symbol("-10008") => BadRequest,
                Symbol("-10009") => BadRequest,
                Symbol("-10010") => BadRequest,
                Symbol("-10011") => InsufficientFunds,
                Symbol("-10012") => BadRequest,
                Symbol("-10013") => InsufficientFunds,
                Symbol("-10015") => OperationFailed,
                Symbol("-10016") => OperationFailed,
                Symbol("-10017") => OperationRejected,
                Symbol("-10018") => BadRequest,
                Symbol("-10019") => BadRequest,
                Symbol("-10020") => BadRequest,
                Symbol("-10021") => InvalidOrder,
                Symbol("-10022") => BadRequest,
                Symbol("-10023") => OperationFailed,
                Symbol("-10024") => BadRequest,
                Symbol("-10025") => OperationFailed,
                Symbol("-10026") => BadRequest,
                Symbol("-10028") => BadRequest,
                Symbol("-10029") => OperationRejected,
                Symbol("-10030") => OperationRejected,
                Symbol("-10031") => OperationRejected,
                Symbol("-10032") => OperationFailed,
                Symbol("-10034") => OperationRejected,
                Symbol("-10039") => OperationRejected,
                Symbol("-10040") => OperationRejected,
                Symbol("-10041") => OperationFailed,
                Symbol("-10042") => BadSymbol,
                Symbol("-10043") => OperationRejected,
                Symbol("-10044") => OperationRejected,
                Symbol("-10045") => OperationRejected,
                Symbol("-10046") => OperationRejected,
                Symbol("-10047") => PermissionDenied,
                Symbol("-11008") => OperationRejected,
                Symbol("-12014") => RateLimitExceeded,
                Symbol("-13000") => OperationRejected,
                Symbol("-13001") => OperationRejected,
                Symbol("-13002") => OperationRejected,
                Symbol("-13003") => PermissionDenied,
                Symbol("-13004") => OperationRejected,
                Symbol("-13005") => OperationRejected,
                Symbol("-13006") => OperationRejected,
                Symbol("-13007") => PermissionDenied,
                Symbol("-18002") => OperationRejected,
                Symbol("-18003") => OperationRejected,
                Symbol("-18004") => OperationRejected,
                Symbol("-18005") => PermissionDenied,
                Symbol("-18006") => OperationRejected,
                Symbol("-18007") => OperationRejected,
                Symbol("-21001") => BadRequest,
                Symbol("-21002") => BadRequest,
                Symbol("-21003") => BadResponse,
                Symbol("-21004") => OperationRejected,
                Symbol("-21005") => InsufficientFunds,
                Symbol("-21006") => OperationFailed,
                Symbol("-21007") => OperationFailed,
                Symbol("-32603") => BadRequest,
                Symbol("400002") => BadRequest,
                Symbol("100001003") => AuthenticationError,
                Symbol("200003903") => AuthenticationError
            )
        ),
        Symbol("linear") => Dict{Symbol, Any}(
            Symbol("exact") => Dict{Symbol, Any}(
                Symbol("-1005") => PermissionDenied,
                Symbol("-1008") => OperationFailed,
                Symbol("-1011") => PermissionDenied,
                Symbol("-1023") => BadRequest,
                Symbol("-1099") => AuthenticationError,
                Symbol("-1109") => PermissionDenied,
                Symbol("-1110") => BadRequest,
                Symbol("-1113") => BadRequest,
                Symbol("-1122") => BadRequest,
                Symbol("-1126") => BadSymbol,
                Symbol("-1136") => BadRequest,
                Symbol("-2012") => OperationFailed,
                Symbol("-2016") => OperationRejected,
                Symbol("-2017") => PermissionDenied,
                Symbol("-2018") => InsufficientFunds,
                Symbol("-2019") => InsufficientFunds,
                Symbol("-2020") => OperationFailed,
                Symbol("-2021") => OrderImmediatelyFillable,
                Symbol("-2022") => InvalidOrder,
                Symbol("-2023") => OperationFailed,
                Symbol("-2024") => InsufficientFunds,
                Symbol("-2025") => OperationRejected,
                Symbol("-2026") => InvalidOrder,
                Symbol("-2027") => OperationRejected,
                Symbol("-2028") => OperationRejected,
                Symbol("-4063") => BadRequest,
                Symbol("-4064") => BadRequest,
                Symbol("-4065") => BadRequest,
                Symbol("-4066") => BadRequest,
                Symbol("-4069") => BadRequest,
                Symbol("-4070") => BadRequest,
                Symbol("-4071") => BadRequest,
                Symbol("-4072") => OperationRejected,
                Symbol("-4073") => BadRequest,
                Symbol("-4074") => OperationRejected,
                Symbol("-4075") => BadRequest,
                Symbol("-4076") => OperationRejected,
                Symbol("-4077") => OperationRejected,
                Symbol("-4078") => OperationFailed,
                Symbol("-4079") => BadRequest,
                Symbol("-4080") => PermissionDenied,
                Symbol("-4081") => BadRequest,
                Symbol("-4085") => BadRequest,
                Symbol("-4087") => PermissionDenied,
                Symbol("-4088") => PermissionDenied,
                Symbol("-4114") => BadRequest,
                Symbol("-4115") => BadRequest,
                Symbol("-4116") => InvalidOrder,
                Symbol("-4117") => OperationRejected,
                Symbol("-4118") => OperationRejected,
                Symbol("-4131") => OperationRejected,
                Symbol("-4140") => BadRequest,
                Symbol("-4141") => OperationRejected,
                Symbol("-4144") => BadSymbol,
                Symbol("-4164") => InvalidOrder,
                Symbol("-4136") => InvalidOrder,
                Symbol("-4165") => BadRequest,
                Symbol("-4167") => BadRequest,
                Symbol("-4168") => BadRequest,
                Symbol("-4169") => OperationRejected,
                Symbol("-4170") => OperationRejected,
                Symbol("-4171") => OperationRejected,
                Symbol("-4172") => OperationRejected,
                Symbol("-4183") => BadRequest,
                Symbol("-4184") => BadRequest,
                Symbol("-4192") => PermissionDenied,
                Symbol("-4202") => PermissionDenied,
                Symbol("-4203") => PermissionDenied,
                Symbol("-4205") => PermissionDenied,
                Symbol("-4206") => PermissionDenied,
                Symbol("-4208") => OperationRejected,
                Symbol("-4209") => OperationRejected,
                Symbol("-4210") => BadRequest,
                Symbol("-4211") => BadRequest,
                Symbol("-4400") => PermissionDenied,
                Symbol("-4401") => PermissionDenied,
                Symbol("-4402") => PermissionDenied,
                Symbol("-4403") => PermissionDenied,
                Symbol("-5021") => OrderNotFillable,
                Symbol("-5022") => OrderNotFillable,
                Symbol("-5024") => OperationRejected,
                Symbol("-5025") => OperationRejected,
                Symbol("-5026") => OperationRejected,
                Symbol("-5027") => OperationRejected,
                Symbol("-5028") => BadRequest,
                Symbol("-5037") => BadRequest,
                Symbol("-5038") => BadRequest,
                Symbol("-5039") => BadRequest,
                Symbol("-5040") => BadRequest,
                Symbol("-5041") => OperationFailed
            )
        ),
        Symbol("inverse") => Dict{Symbol, Any}(
            Symbol("exact") => Dict{Symbol, Any}(
                Symbol("-1005") => PermissionDenied,
                Symbol("-1011") => PermissionDenied,
                Symbol("-1023") => BadRequest,
                Symbol("-1109") => AuthenticationError,
                Symbol("-1110") => BadSymbol,
                Symbol("-1113") => BadRequest,
                Symbol("-1128") => BadRequest,
                Symbol("-1136") => BadRequest,
                Symbol("-2016") => OperationRejected,
                Symbol("-2018") => InsufficientFunds,
                Symbol("-2019") => InsufficientFunds,
                Symbol("-2020") => OperationFailed,
                Symbol("-2021") => OrderImmediatelyFillable,
                Symbol("-2022") => InvalidOrder,
                Symbol("-2023") => OperationFailed,
                Symbol("-2024") => BadRequest,
                Symbol("-2025") => OperationRejected,
                Symbol("-2026") => InvalidOrder,
                Symbol("-2027") => OperationRejected,
                Symbol("-2028") => OperationRejected,
                Symbol("-4086") => BadRequest,
                Symbol("-4087") => BadSymbol,
                Symbol("-4088") => BadRequest,
                Symbol("-4089") => PermissionDenied,
                Symbol("-4090") => PermissionDenied,
                Symbol("-4110") => BadRequest,
                Symbol("-4111") => BadRequest,
                Symbol("-4112") => OperationRejected,
                Symbol("-4113") => OperationRejected,
                Symbol("-4150") => OperationRejected,
                Symbol("-4151") => BadRequest,
                Symbol("-4152") => BadRequest,
                Symbol("-4154") => BadRequest,
                Symbol("-4155") => BadRequest,
                Symbol("-4178") => BadRequest,
                Symbol("-4188") => BadRequest,
                Symbol("-4192") => PermissionDenied,
                Symbol("-4194") => PermissionDenied,
                Symbol("-4195") => PermissionDenied,
                Symbol("-4196") => BadRequest,
                Symbol("-4197") => OperationRejected,
                Symbol("-4198") => OperationRejected,
                Symbol("-4199") => BadRequest,
                Symbol("-4200") => PermissionDenied,
                Symbol("-4201") => PermissionDenied,
                Symbol("-4202") => OperationRejected
            )
        ),
        Symbol("option") => Dict{Symbol, Any}(
            Symbol("exact") => Dict{Symbol, Any}(
                Symbol("-1003") => ExchangeError,
                Symbol("-1004") => ExchangeError,
                Symbol("-1006") => ExchangeError,
                Symbol("-1007") => ExchangeError,
                Symbol("-1008") => RateLimitExceeded,
                Symbol("-1010") => ExchangeError,
                Symbol("-1013") => ExchangeError,
                Symbol("-1108") => ExchangeError,
                Symbol("-1112") => ExchangeError,
                Symbol("-1114") => ExchangeError,
                Symbol("-1128") => BadSymbol,
                Symbol("-1129") => BadSymbol,
                Symbol("-1131") => BadRequest,
                Symbol("-2011") => ExchangeError,
                Symbol("-2018") => InsufficientFunds,
                Symbol("-2027") => InsufficientFunds,
                Symbol("-3029") => OperationFailed,
                Symbol("-4006") => ExchangeError,
                Symbol("-4007") => ExchangeError,
                Symbol("-4008") => ExchangeError,
                Symbol("-4009") => ExchangeError,
                Symbol("-4010") => ExchangeError,
                Symbol("-4011") => ExchangeError,
                Symbol("-4012") => ExchangeError,
                Symbol("-4014") => ExchangeError,
                Symbol("-4015") => ExchangeError,
                Symbol("-4016") => ExchangeError,
                Symbol("-4017") => ExchangeError,
                Symbol("-4018") => ExchangeError,
                Symbol("-4019") => ExchangeError,
                Symbol("-4020") => ExchangeError,
                Symbol("-4021") => ExchangeError,
                Symbol("-4022") => ExchangeError,
                Symbol("-4023") => ExchangeError,
                Symbol("-4024") => ExchangeError,
                Symbol("-4025") => ExchangeError,
                Symbol("-4026") => ExchangeError,
                Symbol("-4027") => ExchangeError,
                Symbol("-4028") => ExchangeError,
                Symbol("-4031") => ExchangeError,
                Symbol("-4032") => ExchangeError,
                Symbol("-4033") => ExchangeError,
                Symbol("-4034") => ExchangeError,
                Symbol("-4035") => ExchangeError,
                Symbol("-4036") => ExchangeError,
                Symbol("-4037") => ExchangeError,
                Symbol("-4038") => ExchangeError,
                Symbol("-4039") => ExchangeError,
                Symbol("-4040") => ExchangeError,
                Symbol("-4041") => ExchangeError,
                Symbol("-4042") => ExchangeError,
                Symbol("-4043") => ExchangeError,
                Symbol("-4044") => ExchangeError,
                Symbol("-4045") => ExchangeError,
                Symbol("-4046") => ExchangeError,
                Symbol("-4047") => ExchangeError,
                Symbol("-4048") => ExchangeError,
                Symbol("-4049") => ExchangeError,
                Symbol("-4050") => ExchangeError,
                Symbol("-4051") => ExchangeError,
                Symbol("-4052") => ExchangeError,
                Symbol("-4053") => ExchangeError,
                Symbol("-4054") => ExchangeError,
                Symbol("-4056") => ExchangeError,
                Symbol("-4057") => ExchangeError,
                Symbol("-4058") => ExchangeError,
                Symbol("-4059") => ExchangeError,
                Symbol("-4060") => ExchangeError,
                Symbol("-4061") => ExchangeError,
                Symbol("-4062") => ExchangeError,
                Symbol("-4063") => ExchangeError,
                Symbol("-4064") => ExchangeError,
                Symbol("-4065") => ExchangeError,
                Symbol("-4066") => ExchangeError,
                Symbol("-4067") => ExchangeError,
                Symbol("-4068") => ExchangeError,
                Symbol("-4069") => ExchangeError,
                Symbol("-4070") => ExchangeError,
                Symbol("-4071") => ExchangeError,
                Symbol("-4072") => ExchangeError,
                Symbol("-4073") => ExchangeError,
                Symbol("-4074") => ExchangeError,
                Symbol("-4075") => ExchangeError,
                Symbol("-4076") => ExchangeError,
                Symbol("-4077") => ExchangeError,
                Symbol("-4078") => ExchangeError,
                Symbol("-4079") => ExchangeError,
                Symbol("-4080") => ExchangeError,
                Symbol("-4081") => ExchangeError,
                Symbol("-4082") => ExchangeError,
                Symbol("-4083") => ExchangeError,
                Symbol("-4084") => ExchangeError,
                Symbol("-4085") => ExchangeError,
                Symbol("-4086") => ExchangeError,
                Symbol("-4087") => ExchangeError,
                Symbol("-4088") => ExchangeError,
                Symbol("-4089") => ExchangeError,
                Symbol("-4091") => ExchangeError,
                Symbol("-4092") => ExchangeError,
                Symbol("-4093") => ExchangeError,
                Symbol("-4094") => ExchangeError,
                Symbol("-4095") => ExchangeError,
                Symbol("-4096") => ExchangeError,
                Symbol("-4097") => ExchangeError,
                Symbol("-4098") => ExchangeError,
                Symbol("-4099") => ExchangeError,
                Symbol("-4101") => ExchangeError,
                Symbol("-4102") => ExchangeError,
                Symbol("-4103") => ExchangeError,
                Symbol("-4104") => ExchangeError,
                Symbol("-4105") => ExchangeError,
                Symbol("-4106") => ExchangeError,
                Symbol("-4107") => ExchangeError,
                Symbol("-4108") => ExchangeError,
                Symbol("-4109") => ExchangeError,
                Symbol("-4110") => ExchangeError,
                Symbol("-4112") => ExchangeError,
                Symbol("-4113") => ExchangeError,
                Symbol("-4114") => ExchangeError,
                Symbol("-4115") => ExchangeError,
                Symbol("-4116") => ExchangeError,
                Symbol("-4117") => ExchangeError,
                Symbol("-4118") => ExchangeError,
                Symbol("-4119") => ExchangeError,
                Symbol("-4120") => ExchangeError,
                Symbol("-4121") => ExchangeError,
                Symbol("-4122") => ExchangeError,
                Symbol("-4123") => ExchangeError,
                Symbol("-4124") => ExchangeError,
                Symbol("-4125") => ExchangeError,
                Symbol("-4126") => ExchangeError,
                Symbol("-4127") => ExchangeError,
                Symbol("-4128") => ExchangeError,
                Symbol("-4129") => ExchangeError,
                Symbol("-4130") => ExchangeError,
                Symbol("-4131") => ExchangeError,
                Symbol("-4132") => ExchangeError,
                Symbol("-4133") => ExchangeError,
                Symbol("-4134") => ExchangeError,
                Symbol("-4135") => ExchangeError,
                Symbol("-4136") => ExchangeError,
                Symbol("-4137") => ExchangeError,
                Symbol("-4138") => ExchangeError,
                Symbol("-4139") => ExchangeError,
                Symbol("-4141") => ExchangeError,
                Symbol("-4142") => ExchangeError,
                Symbol("-4143") => ExchangeError,
                Symbol("-4144") => ExchangeError,
                Symbol("-4145") => ExchangeError,
                Symbol("-4146") => ExchangeError,
                Symbol("-4147") => ExchangeError,
                Symbol("-4148") => ExchangeError,
                Symbol("-4149") => ExchangeError,
                Symbol("-4150") => ExchangeError,
                Symbol("-20121") => ExchangeError,
                Symbol("-20124") => ExchangeError,
                Symbol("-20130") => ExchangeError,
                Symbol("-20132") => ExchangeError,
                Symbol("-20194") => ExchangeError,
                Symbol("-20195") => ExchangeError,
                Symbol("-20196") => ExchangeError,
                Symbol("-20198") => ExchangeError,
                Symbol("-20204") => ExchangeError
            )
        ),
        Symbol("portfolioMargin") => Dict{Symbol, Any}(
            Symbol("exact") => Dict{Symbol, Any}(
                Symbol("-1000") => OperationFailed,
                Symbol("-1001") => ExchangeError,
                Symbol("-1002") => PermissionDenied,
                Symbol("-1003") => RateLimitExceeded,
                Symbol("-1004") => BadRequest,
                Symbol("-1005") => PermissionDenied,
                Symbol("-1006") => BadResponse,
                Symbol("-1007") => BadResponse,
                Symbol("-1008") => OperationFailed,
                Symbol("-1010") => ExchangeError,
                Symbol("-1011") => PermissionDenied,
                Symbol("-1013") => ExchangeError,
                Symbol("-1014") => InvalidOrder,
                Symbol("-1015") => InvalidOrder,
                Symbol("-1016") => NotSupported,
                Symbol("-1020") => NotSupported,
                Symbol("-1021") => BadRequest,
                Symbol("-1022") => BadRequest,
                Symbol("-1023") => BadRequest,
                Symbol("-1099") => OperationFailed,
                Symbol("-1100") => BadRequest,
                Symbol("-1101") => BadRequest,
                Symbol("-1102") => BadRequest,
                Symbol("-1103") => BadRequest,
                Symbol("-1104") => BadRequest,
                Symbol("-1105") => BadRequest,
                Symbol("-1106") => BadRequest,
                Symbol("-1108") => BadRequest,
                Symbol("-1109") => BadRequest,
                Symbol("-1110") => BadSymbol,
                Symbol("-1111") => BadRequest,
                Symbol("-1112") => BadRequest,
                Symbol("-1113") => BadRequest,
                Symbol("-1114") => BadRequest,
                Symbol("-1115") => BadRequest,
                Symbol("-1116") => BadRequest,
                Symbol("-1117") => BadRequest,
                Symbol("-1118") => BadRequest,
                Symbol("-1119") => BadRequest,
                Symbol("-1120") => BadRequest,
                Symbol("-1121") => BadSymbol,
                Symbol("-1125") => BadRequest,
                Symbol("-1127") => BadRequest,
                Symbol("-1128") => BadRequest,
                Symbol("-1130") => BadRequest,
                Symbol("-1131") => BadRequest,
                Symbol("-1134") => BadRequest,
                Symbol("-1136") => BadRequest,
                Symbol("-1145") => BadRequest,
                Symbol("-1151") => BadRequest,
                Symbol("-2010") => InvalidOrder,
                Symbol("-2011") => OperationRejected,
                Symbol("-2013") => OrderNotFound,
                Symbol("-2014") => OperationRejected,
                Symbol("-2015") => OperationRejected,
                Symbol("-2016") => OperationFailed,
                Symbol("-2018") => OperationFailed,
                Symbol("-2019") => OperationFailed,
                Symbol("-2020") => OrderNotFillable,
                Symbol("-2021") => OrderImmediatelyFillable,
                Symbol("-2022") => InvalidOrder,
                Symbol("-2023") => OperationFailed,
                Symbol("-2024") => OperationRejected,
                Symbol("-2025") => OperationRejected,
                Symbol("-2026") => InvalidOrder,
                Symbol("-2027") => OperationRejected,
                Symbol("-2028") => OperationRejected,
                Symbol("-4000") => BadRequest,
                Symbol("-4001") => BadRequest,
                Symbol("-4002") => BadRequest,
                Symbol("-4003") => BadRequest,
                Symbol("-4004") => BadRequest,
                Symbol("-4005") => BadRequest,
                Symbol("-4006") => BadRequest,
                Symbol("-4007") => BadRequest,
                Symbol("-4008") => BadRequest,
                Symbol("-4009") => BadRequest,
                Symbol("-4010") => BadRequest,
                Symbol("-4011") => BadRequest,
                Symbol("-4012") => BadRequest,
                Symbol("-4013") => BadRequest,
                Symbol("-4014") => BadRequest,
                Symbol("-4015") => BadRequest,
                Symbol("-4016") => BadRequest,
                Symbol("-4017") => BadRequest,
                Symbol("-4018") => BadRequest,
                Symbol("-4019") => BadRequest,
                Symbol("-4020") => BadRequest,
                Symbol("-4021") => BadRequest,
                Symbol("-4022") => BadRequest,
                Symbol("-4023") => BadRequest,
                Symbol("-4024") => BadRequest,
                Symbol("-4025") => BadRequest,
                Symbol("-4026") => BadRequest,
                Symbol("-4027") => BadRequest,
                Symbol("-4028") => BadRequest,
                Symbol("-4029") => BadRequest,
                Symbol("-4030") => BadRequest,
                Symbol("-4031") => BadRequest,
                Symbol("-4032") => BadRequest,
                Symbol("-4033") => BadRequest,
                Symbol("-4044") => BadRequest,
                Symbol("-4045") => BadRequest,
                Symbol("-4046") => BadRequest,
                Symbol("-4047") => BadRequest,
                Symbol("-4048") => BadRequest,
                Symbol("-4049") => BadRequest,
                Symbol("-4050") => BadRequest,
                Symbol("-4051") => BadRequest,
                Symbol("-4052") => BadRequest,
                Symbol("-4053") => BadRequest,
                Symbol("-4054") => BadRequest,
                Symbol("-4055") => BadRequest,
                Symbol("-4056") => PermissionDenied,
                Symbol("-4057") => PermissionDenied,
                Symbol("-4058") => BadRequest,
                Symbol("-4059") => BadRequest,
                Symbol("-4060") => BadRequest,
                Symbol("-4061") => InvalidOrder,
                Symbol("-4062") => BadRequest,
                Symbol("-4063") => BadRequest,
                Symbol("-4064") => BadRequest,
                Symbol("-4065") => BadRequest,
                Symbol("-4066") => BadRequest,
                Symbol("-4067") => BadRequest,
                Symbol("-4068") => BadRequest,
                Symbol("-4069") => BadRequest,
                Symbol("-4070") => BadRequest,
                Symbol("-4071") => BadRequest,
                Symbol("-4072") => OperationRejected,
                Symbol("-4073") => BadRequest,
                Symbol("-4074") => BadRequest,
                Symbol("-4075") => BadRequest,
                Symbol("-4076") => OperationRejected,
                Symbol("-4077") => OperationRejected,
                Symbol("-4078") => OperationFailed,
                Symbol("-4079") => BadRequest,
                Symbol("-4080") => PermissionDenied,
                Symbol("-4081") => BadRequest,
                Symbol("-4082") => BadRequest,
                Symbol("-4083") => BadRequest,
                Symbol("-4084") => NotSupported,
                Symbol("-4085") => BadRequest,
                Symbol("-4086") => BadRequest,
                Symbol("-4087") => PermissionDenied,
                Symbol("-4088") => PermissionDenied,
                Symbol("-4104") => BadRequest,
                Symbol("-4114") => BadRequest,
                Symbol("-4115") => BadRequest,
                Symbol("-4118") => OperationRejected,
                Symbol("-4131") => OperationRejected,
                Symbol("-4135") => BadRequest,
                Symbol("-4137") => BadRequest,
                Symbol("-4138") => BadRequest,
                Symbol("-4139") => BadRequest,
                Symbol("-4140") => OrderImmediatelyFillable,
                Symbol("-4141") => BadRequest,
                Symbol("-4142") => OrderImmediatelyFillable,
                Symbol("-4144") => BadSymbol,
                Symbol("-4161") => OperationRejected,
                Symbol("-4164") => InvalidOrder,
                Symbol("-4165") => BadRequest,
                Symbol("-4183") => InvalidOrder,
                Symbol("-4184") => InvalidOrder,
                Symbol("-4408") => InvalidOrder,
                Symbol("-5021") => OrderNotFillable,
                Symbol("-5022") => OrderNotFillable,
                Symbol("-5028") => OperationFailed,
                Symbol("-5041") => RateLimitExceeded
            )
        ),
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-1000") => OperationFailed,
            Symbol("-1001") => OperationFailed,
            Symbol("-1002") => AuthenticationError,
            Symbol("-1003") => RateLimitExceeded,
            Symbol("-1004") => OperationRejected,
            Symbol("-1006") => OperationFailed,
            Symbol("-1007") => RequestTimeout,
            Symbol("-1010") => OperationFailed,
            Symbol("-1013") => BadRequest,
            Symbol("-1014") => InvalidOrder,
            Symbol("-1015") => RateLimitExceeded,
            Symbol("-1016") => BadRequest,
            Symbol("-1020") => BadRequest,
            Symbol("-1021") => InvalidNonce,
            Symbol("-1022") => AuthenticationError,
            Symbol("-1100") => BadRequest,
            Symbol("-1101") => BadRequest,
            Symbol("-1102") => BadRequest,
            Symbol("-1103") => BadRequest,
            Symbol("-1104") => BadRequest,
            Symbol("-1105") => BadRequest,
            Symbol("-1106") => BadRequest,
            Symbol("-1108") => BadSymbol,
            Symbol("-1111") => BadRequest,
            Symbol("-1112") => OperationFailed,
            Symbol("-1114") => BadRequest,
            Symbol("-1115") => BadRequest,
            Symbol("-1116") => BadRequest,
            Symbol("-1117") => BadRequest,
            Symbol("-1118") => BadRequest,
            Symbol("-1119") => BadRequest,
            Symbol("-1120") => BadRequest,
            Symbol("-1121") => BadSymbol,
            Symbol("-1125") => AuthenticationError,
            Symbol("-1127") => BadRequest,
            Symbol("-1128") => BadRequest,
            Symbol("-1130") => BadRequest,
            Symbol("-2010") => InvalidOrder,
            Symbol("-2011") => OrderNotFound,
            Symbol("-2013") => OrderNotFound,
            Symbol("-2014") => AuthenticationError,
            Symbol("-2015") => AuthenticationError,
            Symbol("-4000") => InvalidOrder,
            Symbol("-4001") => BadRequest,
            Symbol("-4002") => BadRequest,
            Symbol("-4003") => BadRequest,
            Symbol("-4004") => BadRequest,
            Symbol("-4005") => BadRequest,
            Symbol("-4006") => BadRequest,
            Symbol("-4007") => BadRequest,
            Symbol("-4008") => BadRequest,
            Symbol("-4009") => BadRequest,
            Symbol("-4010") => BadRequest,
            Symbol("-4011") => BadRequest,
            Symbol("-4012") => BadRequest,
            Symbol("-4013") => BadRequest,
            Symbol("-4014") => BadRequest,
            Symbol("-4015") => BadRequest,
            Symbol("-4016") => BadRequest,
            Symbol("-4017") => BadRequest,
            Symbol("-4018") => BadRequest,
            Symbol("-4019") => OperationRejected,
            Symbol("-4020") => BadRequest,
            Symbol("-4021") => BadRequest,
            Symbol("-4022") => BadRequest,
            Symbol("-4023") => BadRequest,
            Symbol("-4024") => BadRequest,
            Symbol("-4025") => BadRequest,
            Symbol("-4026") => BadRequest,
            Symbol("-4027") => BadRequest,
            Symbol("-4028") => BadRequest,
            Symbol("-4029") => BadRequest,
            Symbol("-4030") => BadRequest,
            Symbol("-4031") => BadRequest,
            Symbol("-4032") => OperationRejected,
            Symbol("-4033") => BadRequest,
            Symbol("-4044") => BadRequest,
            Symbol("-4045") => OperationRejected,
            Symbol("-4046") => OperationRejected,
            Symbol("-4047") => OperationRejected,
            Symbol("-4048") => OperationRejected,
            Symbol("-4049") => BadRequest,
            Symbol("-4050") => InsufficientFunds,
            Symbol("-4051") => InsufficientFunds,
            Symbol("-4052") => OperationRejected,
            Symbol("-4053") => BadRequest,
            Symbol("-4054") => OperationRejected,
            Symbol("-4055") => BadRequest,
            Symbol("-4056") => AuthenticationError,
            Symbol("-4057") => AuthenticationError,
            Symbol("-4058") => BadRequest,
            Symbol("-4059") => OperationRejected,
            Symbol("-4060") => BadRequest,
            Symbol("-4061") => OperationRejected,
            Symbol("-4062") => BadRequest,
            Symbol("-4067") => OperationRejected,
            Symbol("-4068") => OperationRejected,
            Symbol("-4082") => BadRequest,
            Symbol("-4083") => OperationRejected,
            Symbol("-4084") => BadRequest,
            Symbol("-4086") => BadRequest,
            Symbol("-4104") => BadRequest,
            Symbol("-4135") => BadRequest,
            Symbol("-4137") => BadRequest,
            Symbol("-4138") => BadRequest,
            Symbol("-4139") => BadRequest,
            Symbol("-4142") => OrderImmediatelyFillable,
            Symbol("-20121") => BadSymbol,
            Symbol("-20124") => BadRequest,
            Symbol("-20130") => BadRequest,
            Symbol("-20132") => BadRequest,
            Symbol("-20194") => BadRequest,
            Symbol("-20195") => BadRequest,
            Symbol("-20196") => BadRequest,
            Symbol("-20198") => OperationRejected,
            Symbol("-20204") => BadRequest,
            Symbol("System is under maintenance.") => OnMaintenance,
            Symbol("System abnormality") => OperationFailed,
            Symbol("You are not authorized to execute this request.") => PermissionDenied,
            Symbol("API key does not exist") => AuthenticationError,
            Symbol("Order would trigger immediately.") => OrderImmediatelyFillable,
            Symbol("Stop price would trigger immediately.") => OrderImmediatelyFillable,
            Symbol("Order would immediately match and take.") => OrderImmediatelyFillable,
            Symbol("Account has insufficient balance for requested action.") => InsufficientFunds,
            Symbol("Rest API trading is not enabled.") => PermissionDenied,
            Symbol("This account may not place or cancel orders.") => PermissionDenied,
            Symbol("You don't have permission.") => PermissionDenied,
            Symbol("Market is closed.") => MarketClosed,
            Symbol("Too many requests. Please try again later.") => RateLimitExceeded,
            Symbol("This action is disabled on this account.") => AccountSuspended,
            Symbol("Limit orders require GTC for this phase.") => BadRequest,
            Symbol("This order type is not possible in this trading phase.") => BadRequest,
            Symbol("This type of sub-account exceeds the maximum number limit") => OperationRejected,
            Symbol("This symbol is restricted for this account.") => PermissionDenied,
            Symbol("This symbol is not permitted for this account.") => PermissionDenied
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("has no operation privilege") => PermissionDenied,
            Symbol("MAX_POSITION") => BadRequest,
            Symbol("PERCENT_PRICE_BY_SIDE") => InvalidOrder
        )
    ),
    Symbol("rollingWindowSize") => 60000
))

end
function isInverse(self::Binance, type_var; subType=nothing)
    if functions.ccxtruthy(subType == nothing)
            return (type_var == "delivery")
    else
        return subType == "inverse"
    end

end
function isLinear(self::Binance, type_var; subType=nothing)
    if functions.ccxtruthy(subType == nothing)
            return @functions.ccxt_or((type_var == "future"), (type_var == "swap"))
    else
        return subType == "linear"
    end

end
function setSandboxMode(self::Binance, enable)
    setSandboxMode(self.parent, enable);
    self.options[Symbol("sandboxMode")] = enable;

end
function createExpiredOptionMarket(self::Binance, symbol)
    settle = "USDT";
    optionParts = split(symbol, "-");
    symbolBase = split(symbol, "/");
    base = nothing;
    if functions.ccxtruthy(findfirst("/", symbol) !== nothing)
        base = safeString(symbolBase, 0);
    else
        base = safeString(optionParts, 0);
    end
    expiry = safeString(optionParts, 1);
    strike = safeInteger(optionParts, 2);
    strikeAsString = safeString(optionParts, 2);
    optionType = safeString(optionParts, 3);
    datetime = self.convertExpireDate(expiry);
    timestamp = self.parse8601(datetime);
    return Dict{Symbol, Any}(
    Symbol("id") => string(base, "-", expiry, "-", strikeAsString, "-", optionType),
    Symbol("symbol") => string(base, "/", settle, ":", settle, "-", expiry, "-", strikeAsString, "-", optionType),
    Symbol("base") => base,
    Symbol("quote") => settle,
    Symbol("baseId") => base,
    Symbol("quoteId") => settle,
    Symbol("active") => nothing,
    Symbol("type") => "option",
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("spot") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => true,
    Symbol("margin") => false,
    Symbol("contract") => true,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => timestamp,
    Symbol("expiryDatetime") => datetime,
    Symbol("optionType") => functions.ccxtruthy((optionType == "C")) ? "call" : "put",
    Symbol("strike") => strike,
    Symbol("settle") => settle,
    Symbol("settleId") => settle,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => nothing,
        Symbol("price") => nothing
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
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
    Symbol("info") => nothing
)

end
function market(self::Binance, symbol)
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " Ccxt.market() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        throw(ExchangeError(string(self.id, " markets not loaded")));
    end
    defaultType = safeString(self.options, "defaultType");
    defaultSubType = safeString(self.options, "defaultSubType");
    isLegacyLinear = defaultType == "future";
    isLegacyInverse = defaultType == "delivery";
    isLegacy = @functions.ccxt_or(isLegacyLinear, isLegacyInverse);
    if functions.ccxtruthy(isa(symbol, AbstractString))
        if functions.ccxtruthy(@functions.ccxt_and((self.markets != nothing), (ccxt_in(symbol, self.markets))))
            market = get(self.markets, Symbol(symbol), nothing);
            if functions.ccxtruthy(@functions.ccxt_and(isLegacy, get(market, Symbol("spot"), nothing)))
                settle = functions.ccxtruthy(isLegacyLinear) ? get(market, Symbol("quote"), nothing) : get(market, Symbol("base"), nothing);
                futuresSymbol = string(symbol, ":", settle);
                if functions.ccxtruthy(@functions.ccxt_and((self.markets != nothing), (ccxt_in(futuresSymbol, self.markets))))
                        return get(self.markets, Symbol(futuresSymbol), nothing)
                end
            else
                return market
            end
        elseif functions.ccxtruthy(@functions.ccxt_and((self.markets_by_id != nothing), (ccxt_in(symbol, self.markets_by_id))))
            markets = get(self.markets_by_id, Symbol(symbol), nothing);
            if functions.ccxtruthy(isLegacyLinear)
                defaultType = "linear";
            elseif functions.ccxtruthy(isLegacyInverse)
                defaultType = "inverse";
            else
                if functions.ccxtruthy(defaultType == nothing)
                    defaultType = defaultSubType;
                end

            end
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
                market = get(markets, i + 1, nothing);
                if functions.ccxtruthy(safeValue(market, defaultType))
                        return market
                end
                i += 1
            end
            return get(markets, 1, nothing)
        else
            if functions.ccxtruthy(@functions.ccxt_and((findfirst("/", symbol) !== nothing), (findfirst(":", symbol) === nothing)))
                if functions.ccxtruthy(@functions.ccxt_and((defaultType != nothing), (defaultType != "spot")))
                    (base, quote_var) = split(symbol, "/");
                    settle = functions.ccxtruthy((quote_var == "USD")) ? base : quote_var;
                    futuresSymbol = string(symbol, ":", settle);
                    if functions.ccxtruthy(@functions.ccxt_and((self.markets != nothing), (ccxt_in(futuresSymbol, self.markets))))
                            return get(self.markets, Symbol(futuresSymbol), nothing)
                    end
                end
            elseif functions.ccxtruthy(@functions.ccxt_or((findfirst("-C", symbol) !== nothing), (findfirst("-P", symbol) !== nothing)))
                return self.createExpiredOptionMarket(symbol)
            end

        end
    end
    throw(BadSymbol(string(self.id, " does not have market symbol ", symbol)));

end
function safeMarket(self::Binance; marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    isOption = @functions.ccxt_and((marketId != nothing), (@functions.ccxt_or((findfirst("-C", marketId) !== nothing), (findfirst("-P", marketId) !== nothing))));
    if functions.ccxtruthy(@functions.ccxt_and(isOption, (@functions.ccxt_or((self.markets_by_id == nothing), !functions.ccxtruthy((ccxt_in(marketId, self.markets_by_id)))))))
            return self.createExpiredOptionMarket(marketId)
    end
    return safeMarket(self.parent, marketId = marketId, market = market, delimiter = delimiter, marketType = marketType)

end
function nonce(self::Binance, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
"""
enables or disables demo trading mode
see: https://www.binance.com/en/support/faq/detail/9be58f73e5e14338809e3b705b9687dd
see: https://demo.binance.com/en/my/settings/api-management

# Arguments
- `enable`::bool, optional: true if demo trading should be enabled, false otherwise
"""
function enableDemoTrading(self::Binance, enable)
    if functions.ccxtruthy(self.isSandboxModeEnabled)
        throw(NotSupported(string(self.id, " demo trading is not supported in the sandbox environment. Please check https://www.binance.com/en/support/faq/detail/9be58f73e5e14338809e3b705b9687dd to see the differences")));
    end
    if functions.ccxtruthy(enable)
        self.urls[Symbol("apiBackupDemoTrading")] = get(self.urls, Symbol("api"), nothing);
        self.urls[Symbol("api")] = get(self.urls, Symbol("demo"), nothing);
    elseif functions.ccxtruthy(ccxt_in("apiBackupDemoTrading", self.urls))
        self.urls[Symbol("api")] = get(self.urls, Symbol("apiBackupDemoTrading"), nothing);
        newUrls = omit(self.urls, "apiBackupDemoTrading");
        self.urls = newUrls;
    end
    self.options[Symbol("enableDemoTrading")] = enable;

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/general-endpoints#check-server-time          // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Check-Server-Time    // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Check-Server-time    // future

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Binance; params=Dict())
    defaultType = safeString2(self.options, "fetchTime", "defaultType", "spot");
    type_var = safeString(params, "type", defaultType);
    query = omit(params, "type");
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchTime", market = nothing, params = params);
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        response = Base.fetch(self.fapiPublicGetTime(query));
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        response = Base.fetch(self.dapiPublicGetTime(query));
    else
        response = Base.fetch(self.publicGetTime(query));
    end
    return safeInteger(response, "serverTime")

end
"""
fetches all available currencies on an exchange
see: https://developers.binance.com/docs/wallet/capital/all-coins-info
see: https://developers.binance.com/docs/margin_trading/market-data/Get-All-Margin-Assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Binance; params=Dict())
    fetchCurrenciesEnabled = self.safeBool(self.options, "fetchCurrencies");
    if functions.ccxtruthy(!functions.ccxtruthy(fetchCurrenciesEnabled))
            return Dict{Symbol, Any}()
    end
    if functions.ccxtruthy(!functions.ccxtruthy(self.checkRequiredCredentials(error = false)))
            return Dict{Symbol, Any}()
    end
    apiBackup = safeValue(self.urls, "apiBackup");
    if functions.ccxtruthy(apiBackup != nothing)
            return Dict{Symbol, Any}()
    end
    if functions.ccxtruthy(self.safeBool(self.options, "enableDemoTrading", defaultValue = false))
            return Dict{Symbol, Any}()
    end
    promises = [self.sapiGetCapitalConfigGetall(params)];
    fetchMargins = self.safeBool(self.options, "fetchMargins", defaultValue = false);
    if functions.ccxtruthy(fetchMargins)
                push!(promises, self.sapiGetMarginAllPairs(params));
    end
    results = Base.fetch(asyncmap(Base.fetch, promises));
    responseCurrencies = get(results, 1, nothing);
    marginablesById = nothing;
    if functions.ccxtruthy(fetchMargins)
        responseMarginables = get(results, 2, nothing);
        marginablesById = indexBy(responseMarginables, "assetName");
    end
    return self.parseCurrenciesCustom(responseCurrencies, marginablesById)

end
function parseCurrenciesCustom(self::Binance, responseCurrencies, marginablesById)
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(responseCurrencies)))
        parsed = self.parseCurrency(get(responseCurrencies, i + 1, nothing));
        if functions.ccxtruthy(parsed == nothing)
            throw(ExchangeError(string(self.id, " parseCurrenciesCustom() could not resolve parsed")));
        end
        code = get(parsed, Symbol("code"), nothing);
        if functions.ccxtruthy(parsed == nothing)
            throw(ExchangeError(string(self.id, " parseCurrenciesCustom() could not resolve parsed")));
        end
        marginEntry = self.safeDict(marginablesById, get(parsed, Symbol("id"), nothing));
        if functions.ccxtruthy(parsed == nothing)
            throw(ExchangeError(string(self.id, " parseCurrenciesCustom() could not resolve parsed")));
        end
        parsed[Symbol("margin")] = self.safeBool(marginEntry, "isBorrowable");
        result[Symbol(code)] = parsed;
        i += 1
    end
    return result

end
function parseCurrency(self::Binance, rawCurrency)
    entry = rawCurrency;
    id = safeString(entry, "coin");
    name = safeString(entry, "name");
    code = self.safeCurrencyCode(id);
    isFiat = self.safeBool(entry, "isLegalMoney");
    networkList = self.safeList(entry, "networkList", defaultValue = []);
    fees = Dict{Symbol, Any}();
    fee = nothing;
    networks = Dict{Symbol, Any}();
    isETF = false;
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkList)))
        networkItem = get(networkList, j + 1, nothing);
        network = safeString(networkItem, "network");
        networkCode = self.networkIdToCode(networkId = network, currencyCode = code);
        isETF = (network == "ETF");
        withdrawFee = self.safeNumber(networkItem, "withdrawFee");
        depositEnable = self.safeBool(networkItem, "depositEnable");
        withdrawEnable = self.safeBool(networkItem, "withdrawEnable");
        if functions.ccxtruthy(networkCode != nothing)
            fees[Symbol(networkCode)] = withdrawFee;
        end
        isDefault = self.safeBool(networkItem, "isDefault");
        if functions.ccxtruthy(@functions.ccxt_or(isDefault, (fee == nothing)))
            fee = withdrawFee;
        end
        withdrawPrecision = omitZero(safeString2(networkItem, "withdrawIntegerMultiple", "withdrawInternalMin"));
        if functions.ccxtruthy(@functions.ccxt_and(withdrawPrecision == nothing, isFiat))
            withdrawPrecision = safeString(self.options, "defaultFiatWithdrawPrecision");
        end
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("info") => networkItem,
                Symbol("id") => network,
                Symbol("network") => networkCode,
                Symbol("active") => nothing,
                Symbol("deposit") => depositEnable,
                Symbol("withdraw") => withdrawEnable,
                Symbol("fee") => withdrawFee,
                Symbol("precision") => self.parseNumber(withdrawPrecision),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(networkItem, "withdrawMin"),
                        Symbol("max") => self.safeNumber(networkItem, "withdrawMax")
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(networkItem, "depositDust"),
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    type_var = nothing;
    if functions.ccxtruthy(isETF)
        type_var = "other";
    elseif functions.ccxtruthy(isFiat)
        type_var = "fiat";
    else
        type_var = "crypto";
    end
    trading = self.safeBool(entry, "trading");
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("name") => name,
    Symbol("code") => code,
    Symbol("type") => type_var,
    Symbol("precision") => nothing,
    Symbol("info") => entry,
    Symbol("active") => trading,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("networks") => networks,
    Symbol("fee") => nothing,
    Symbol("fees") => fees,
    Symbol("limits") => nothing
))

end
"""
retrieves data on all markets for binance
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/general-endpoints#exchange-information           // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Exchange-Information     // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Exchange-Information     // future
see: https://developers.binance.com/docs/derivatives/option/market-data/Exchange-Information                             // option
see: https://developers.binance.com/docs/margin_trading/market-data/Get-All-Cross-Margin-Pairs                           // cross margin
see: https://developers.binance.com/docs/margin_trading/market-data/Get-All-Isolated-Margin-Symbol                       // isolated margin

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Binance; params=Dict())
    promisesRaw = [];
    rawFetchMarkets = nothing;
    defaultTypes = ["spot", "linear", "inverse"];
    fetchMarketsOptions = self.safeDict(self.options, "fetchMarkets");
    if functions.ccxtruthy(fetchMarketsOptions != nothing)
        rawFetchMarkets = self.safeList(fetchMarketsOptions, "types", defaultValue = defaultTypes);
    else
        rawFetchMarkets = self.safeList(self.options, "fetchMarkets", defaultValue = defaultTypes);
    end
    loadAllOptions = self.handleOption("fetchMarkets", "loadAllOptions", defaultValue = false);
    if functions.ccxtruthy(loadAllOptions)
        if functions.ccxtruthy(!functions.ccxtruthy(inArray("option", rawFetchMarkets)))
                        push!(rawFetchMarkets, "option");
        end
    end
    sandboxMode = self.safeBool(self.options, "sandboxMode", defaultValue = false);
    demoMode = self.safeBool(self.options, "enableDemoTrading", defaultValue = false);
    isDemoEnv = @functions.ccxt_or(demoMode, sandboxMode);
    fetchMarkets = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rawFetchMarkets)))
        type_var = get(rawFetchMarkets, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and(type_var == "option", isDemoEnv))
            i += 1; continue
        end
        push!(fetchMarkets, type_var);
        i += 1
    end
    fetchMargins = self.safeBool(self.options, "fetchMargins", defaultValue = false);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fetchMarkets)))
        marketType = get(fetchMarkets, i + 1, nothing);
        if functions.ccxtruthy(marketType == "spot")
                        push!(promisesRaw, self.publicGetExchangeInfo(params));
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(fetchMargins, self.checkRequiredCredentials(error = false)), !functions.ccxtruthy(isDemoEnv)))
                                push!(promisesRaw, self.sapiGetMarginAllPairs(params));
                                push!(promisesRaw, self.sapiGetMarginIsolatedAllPairs(params));
            end
        elseif functions.ccxtruthy(marketType == "linear")
            push!(promisesRaw, self.fapiPublicGetExchangeInfo(params));
        else
            if functions.ccxtruthy(marketType == "inverse")
                                push!(promisesRaw, self.dapiPublicGetExchangeInfo(params));
            elseif functions.ccxtruthy(marketType == "option")
                push!(promisesRaw, self.eapiPublicGetExchangeInfo(params));
            else
                throw(ExchangeError(string(self.id, " fetchMarkets() this.options fetchMarkets \"", marketType, "\" is not a supported market type")));
            end

        end
        i += 1
    end
    results = Base.fetch(asyncmap(Base.fetch, promisesRaw));
    markets = [];
    self.options[Symbol("crossMarginPairsData")] = [];
    self.options[Symbol("isolatedMarginPairsData")] = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(results)))
        res = safeValue(results, i);
        if functions.ccxtruthy(@functions.ccxt_and(fetchMargins, functions.ccxt_isArray(res)))
            keysList = objectKeys(indexBy(res, "symbol"));
            len = length(get(self.options, Symbol("crossMarginPairsData"), nothing));
            if functions.ccxtruthy(len == 0)
                self.options[Symbol("crossMarginPairsData")] = keysList;
            else
                self.options[Symbol("isolatedMarginPairsData")] = keysList;
            end
        else
            resultMarkets = self.safeList2(res, "symbols", "optionSymbols", defaultValue = []);
            markets = arrayConcat(markets, resultMarkets);
        end
        i += 1
    end
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        push!(result, self.parseMarket(get(markets, i + 1, nothing)));
        i += 1
    end
    return result

end
function parseMarket(self::Binance, market)
    swap = false;
    future = false;
    option = false;
    underlying = safeString(market, "underlying");
    id = safeString(market, "symbol");
    if functions.ccxtruthy(id == nothing)
        throw(ExchangeError(string(self.id, " parseMarket() missing id")));
    end
    optionParts = split(id, "-");
    optionBase = safeString(optionParts, 0);
    lowercaseId = safeStringLower(market, "symbol");
    baseId = safeString(market, "baseAsset", optionBase);
    quoteId = safeString(market, "quoteAsset");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    contractType = safeString(market, "contractType");
    contract = (ccxt_in("contractType", market));
    expiry = safeInteger2(market, "deliveryDate", "expiryDate");
    settleId = safeString(market, "marginAsset");
    if functions.ccxtruthy(@functions.ccxt_or((contractType == "PERPETUAL"), (expiry == 4133404800000)))
        expiry = nothing;
        swap = true;
    elseif functions.ccxtruthy(underlying != nothing)
        contract = true;
        option = true;
        settleId = functions.ccxtruthy((settleId == nothing)) ? "USDT" : settleId;
    else
        if functions.ccxtruthy(expiry != nothing)
            future = true;
        end

    end
    settle = self.safeCurrencyCode(settleId);
    spot = !functions.ccxtruthy(contract);
    filters = self.safeList(market, "filters", defaultValue = []);
    filtersByType = indexBy(filters, "filterType");
    status = safeString2(market, "status", "contractStatus");
    contractSize = nothing;
    fees = self.fees;
    linear = nothing;
    inverse = nothing;
    symbol = string(base, "/", quote_var);
    strike = nothing;
    if functions.ccxtruthy(contract)
        if functions.ccxtruthy(swap)
            symbol = string(symbol, ":", settle);
        elseif functions.ccxtruthy(future)
            symbol = string(symbol, ":", settle, "-", self.yymmdd(expiry));
        else
            if functions.ccxtruthy(option)
                strike = numberToString(self.parseToNumeric(safeString(market, "strikePrice")));
                symbol = string(symbol, ":", settle, "-", self.yymmdd(expiry), "-", strike, "-", safeString(optionParts, 3));
            end

        end
        contractSize = self.safeNumber2(market, "contractSize", "unit", d = self.parseNumber("1"));
        linear = settle == quote_var;
        inverse = settle == base;
        feesType = functions.ccxtruthy(linear) ? "linear" : "inverse";
        fees = self.safeDict(self.fees, feesType, defaultValue = Dict{Symbol, Any}());
    end
    active = (status == "TRADING");
    if functions.ccxtruthy(spot)
        permissions = self.safeList(market, "permissions", defaultValue = []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(permissions)))
            if functions.ccxtruthy(get(permissions, j + 1, nothing) == "TRD_GRP_003")
                active = false;
                break
            end
            j += 1
        end

    end
    isMarginTradingAllowed = self.safeBool(market, "isMarginTradingAllowed", defaultValue = false);
    marginModes = nothing;
    if functions.ccxtruthy(spot)
        hasCrossMargin = inArray(id, get(self.options, Symbol("crossMarginPairsData"), nothing));
        hasIsolatedMargin = inArray(id, get(self.options, Symbol("isolatedMarginPairsData"), nothing));
        marginModes = Dict{Symbol, Any}(
            Symbol("cross") => hasCrossMargin,
            Symbol("isolated") => hasIsolatedMargin
        );
    elseif functions.ccxtruthy(@functions.ccxt_or(linear, inverse))
        marginModes = Dict{Symbol, Any}(
            Symbol("cross") => true,
            Symbol("isolated") => true
        );
    end
    unifiedType = nothing;
    if functions.ccxtruthy(spot)
        unifiedType = "spot";
    elseif functions.ccxtruthy(swap)
        unifiedType = "swap";
    else
        if functions.ccxtruthy(future)
            unifiedType = "future";
        elseif functions.ccxtruthy(option)
            unifiedType = "option";
            active = nothing;
        end

    end
    parsedStrike = nothing;
    if functions.ccxtruthy(strike != nothing)
        parsedStrike = self.parseToNumeric(strike);
    end
    entry = Dict{Symbol, Any}(
        Symbol("id") => id,
        Symbol("lowercaseId") => lowercaseId,
        Symbol("symbol") => symbol,
        Symbol("base") => base,
        Symbol("quote") => quote_var,
        Symbol("settle") => settle,
        Symbol("baseId") => baseId,
        Symbol("quoteId") => quoteId,
        Symbol("settleId") => settleId,
        Symbol("type") => unifiedType,
        Symbol("spot") => spot,
        Symbol("margin") => @functions.ccxt_and(spot, isMarginTradingAllowed),
        Symbol("marginModes") => marginModes,
        Symbol("swap") => swap,
        Symbol("future") => future,
        Symbol("option") => option,
        Symbol("active") => active,
        Symbol("contract") => contract,
        Symbol("linear") => linear,
        Symbol("inverse") => inverse,
        Symbol("taker") => get(get(fees, Symbol("trading"), nothing), Symbol("taker"), nothing),
        Symbol("maker") => get(get(fees, Symbol("trading"), nothing), Symbol("maker"), nothing),
        Symbol("contractSize") => contractSize,
        Symbol("expiry") => expiry,
        Symbol("expiryDatetime") => self.iso8601(expiry),
        Symbol("strike") => parsedStrike,
        Symbol("optionType") => safeStringLower(market, "side"),
        Symbol("precision") => Dict{Symbol, Any}(
            Symbol("amount") => self.parseNumber(self.parsePrecision(precision = safeString2(market, "quantityPrecision", "quantityScale"))),
            Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString2(market, "pricePrecision", "priceScale"))),
            Symbol("base") => self.parseNumber(self.parsePrecision(precision = safeString(market, "baseAssetPrecision"))),
            Symbol("quote") => self.parseNumber(self.parsePrecision(precision = safeString(market, "quotePrecision")))
        ),
        Symbol("limits") => Dict{Symbol, Any}(
            Symbol("leverage") => Dict{Symbol, Any}(
                Symbol("min") => nothing,
                Symbol("max") => nothing
            ),
            Symbol("amount") => Dict{Symbol, Any}(
                Symbol("min") => self.safeNumber(market, "minQty"),
                Symbol("max") => self.safeNumber(market, "maxQty")
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
        Symbol("info") => market,
        Symbol("created") => safeInteger(market, "onboardDate")
    );
    if functions.ccxtruthy(ccxt_in("PRICE_FILTER", filtersByType))
        filter_var = self.safeDict(filtersByType, "PRICE_FILTER", defaultValue = Dict{Symbol, Any}());
        entry[Symbol("limits")][Symbol("price")] = Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(filter_var, "minPrice"),
            Symbol("max") => self.safeNumber(filter_var, "maxPrice")
        );
        entry[Symbol("precision")][Symbol("price")] = self.safeNumber(filter_var, "tickSize");
    end
    if functions.ccxtruthy(ccxt_in("LOT_SIZE", filtersByType))
        filter_var = self.safeDict(filtersByType, "LOT_SIZE", defaultValue = Dict{Symbol, Any}());
        entry[Symbol("precision")][Symbol("amount")] = self.safeNumber(filter_var, "stepSize");
        entry[Symbol("limits")][Symbol("amount")] = Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(filter_var, "minQty"),
            Symbol("max") => self.safeNumber(filter_var, "maxQty")
        );
    end
    if functions.ccxtruthy(ccxt_in("MARKET_LOT_SIZE", filtersByType))
        filter_var = self.safeDict(filtersByType, "MARKET_LOT_SIZE", defaultValue = Dict{Symbol, Any}());
        entry[Symbol("limits")][Symbol("market")] = Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(filter_var, "minQty"),
            Symbol("max") => self.safeNumber(filter_var, "maxQty")
        );
    end
    if functions.ccxtruthy(@functions.ccxt_or((ccxt_in("MIN_NOTIONAL", filtersByType)), (ccxt_in("NOTIONAL", filtersByType))))
        filter_var = self.safeDict2(filtersByType, "MIN_NOTIONAL", "NOTIONAL", defaultValue = Dict{Symbol, Any}());
        entry[Symbol("limits")][Symbol("cost")][Symbol("min")] = self.safeNumber2(filter_var, "minNotional", "notional");
        entry[Symbol("limits")][Symbol("cost")][Symbol("max")] = self.safeNumber(filter_var, "maxNotional");
    end
    return self.safeMarketStructure(market = entry)

end
function parseBalanceHelper(self::Binance, entry)
    account = self.account();
    account[Symbol("used")] = safeString(entry, "locked");
    account[Symbol("free")] = safeString(entry, "free");
    interest = safeString(entry, "interest");
    debt = safeString(entry, "borrowed");
    account[Symbol("debt")] = stringAdd(debt, interest);
    return account

end
function parseBalanceCustom(self::Binance, response; type_var=nothing, marginMode=nothing, isPortfolioMargin=false)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    timestamp = nothing;
    isolated = marginMode == "isolated";
    cross = @functions.ccxt_or((type_var == "margin"), (marginMode == "cross"));
    if functions.ccxtruthy(isPortfolioMargin)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
            entry = get(response, i + 1, nothing);
            account = self.account();
            currencyId = safeString(entry, "asset");
            code = self.safeCurrencyCode(currencyId);
            if functions.ccxtruthy(type_var == "linear")
                account[Symbol("free")] = safeString(entry, "umWalletBalance");
                account[Symbol("used")] = safeString(entry, "umUnrealizedPNL");
            elseif functions.ccxtruthy(type_var == "inverse")
                account[Symbol("free")] = safeString(entry, "cmWalletBalance");
                account[Symbol("used")] = safeString(entry, "cmUnrealizedPNL");
            else
                if functions.ccxtruthy(cross)
                    borrowed = safeString(entry, "crossMarginBorrowed");
                    interest = safeString(entry, "crossMarginInterest");
                    account[Symbol("debt")] = stringAdd(borrowed, interest);
                    account[Symbol("free")] = safeString(entry, "crossMarginFree");
                    account[Symbol("used")] = safeString(entry, "crossMarginLocked");
                    account[Symbol("total")] = safeString(entry, "crossMarginAsset");
                else
                    usedLinear = safeString(entry, "umUnrealizedPNL");
                    usedInverse = safeString(entry, "cmUnrealizedPNL");
                    totalUsed = stringAdd(usedLinear, usedInverse);
                    totalWalletBalance = safeString(entry, "totalWalletBalance");
                    account[Symbol("total")] = stringAdd(totalUsed, totalWalletBalance);
                end

            end
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
            i += 1
        end

    elseif functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isolated), (@functions.ccxt_or((type_var == "spot"), cross))))
        timestamp = safeInteger(response, "updateTime");
        balances = self.safeList2(response, "balances", "userAssets", defaultValue = []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
            balance = get(balances, i + 1, nothing);
            currencyId = safeString(balance, "asset");
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("free")] = safeString(balance, "free");
            account[Symbol("used")] = safeString(balance, "locked");
            if functions.ccxtruthy(cross)
                debt = safeString(balance, "borrowed");
                interest = safeString(balance, "interest");
                account[Symbol("debt")] = stringAdd(debt, interest);
            end
            if functions.ccxtruthy(code != nothing)
                result[Symbol(code)] = account;
            end
            i += 1
        end
    else
        if functions.ccxtruthy(isolated)
            assets = self.safeList(response, "assets", defaultValue = []);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(assets)))
                asset = get(assets, i + 1, nothing);
                marketId = safeString(asset, "symbol");
                symbol = self.safeSymbol(marketId, market = nothing, delimiter = nothing, marketType = "spot");
                base = self.safeDict(asset, "baseAsset", defaultValue = Dict{Symbol, Any}());
                quote_var = self.safeDict(asset, "quoteAsset", defaultValue = Dict{Symbol, Any}());
                baseCode = self.safeCurrencyCode(safeString(base, "asset"));
                quoteCode = self.safeCurrencyCode(safeString(quote_var, "asset"));
                subResult = Dict{Symbol, Any}();
                if functions.ccxtruthy(baseCode != nothing)
                    subResult[Symbol(baseCode)] = self.parseBalanceHelper(base);
                end
                if functions.ccxtruthy(quoteCode != nothing)
                    subResult[Symbol(quoteCode)] = self.parseBalanceHelper(quote_var);
                end
                result[Symbol(symbol)] = self.safeBalance(subResult);
                i += 1
            end

        elseif functions.ccxtruthy(type_var == "savings")
            positionAmountVos = self.safeList(response, "positionAmountVos", defaultValue = []);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(positionAmountVos)))
                entry = get(positionAmountVos, i + 1, nothing);
                currencyId = safeString(entry, "asset");
                code = self.safeCurrencyCode(currencyId);
                account = self.account();
                usedAndTotal = safeString(entry, "amount");
                account[Symbol("total")] = usedAndTotal;
                account[Symbol("used")] = usedAndTotal;
                if functions.ccxtruthy(code != nothing)
                    result[Symbol(code)] = account;
                end
                i += 1
            end
        else
            if functions.ccxtruthy(type_var == "funding")
                i = 0
                while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
                    entry = get(response, i + 1, nothing);
                    account = self.account();
                    currencyId = safeString(entry, "asset");
                    code = self.safeCurrencyCode(currencyId);
                    account[Symbol("free")] = safeString(entry, "free");
                    frozen = safeString(entry, "freeze");
                    withdrawing = safeString(entry, "withdrawing");
                    locked = safeString(entry, "locked");
                    account[Symbol("used")] = stringAdd(frozen, stringAdd(locked, withdrawing));
                    if functions.ccxtruthy(code != nothing)
                        result[Symbol(code)] = account;
                    end
                    i += 1
                end

            else
                balances = response;
                if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(response)))
                    balances = self.safeList(response, "assets", defaultValue = []);
                end
                i = 0
                while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
                    balance = get(balances, i + 1, nothing);
                    updateTime = safeInteger(balance, "updateTime");
                    if functions.ccxtruthy(updateTime == 0)
                        i += 1; continue
                    end
                    currencyId = safeString(balance, "asset");
                    code = self.safeCurrencyCode(currencyId);
                    account = self.account();
                    account[Symbol("free")] = safeString(balance, "availableBalance");
                    account[Symbol("used")] = safeString(balance, "initialMargin");
                    account[Symbol("total")] = safeString2(balance, "marginBalance", "balance");
                    if functions.ccxtruthy(code != nothing)
                        result[Symbol(code)] = account;
                    end
                    i += 1
                end
            end

        end

    end
    result[Symbol("timestamp")] = timestamp;
    result[Symbol("datetime")] = self.iso8601(timestamp);
    return functions.ccxtruthy(isolated) ? result : self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/account-endpoints#account-information-user_data  // spot
see: https://developers.binance.com/docs/margin_trading/account/Query-Cross-Margin-Account-Details                       // cross margin
see: https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Account-Info                       // isolated margin
see: https://developers.binance.com/docs/wallet/asset/funding-wallet                                                     // funding
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Futures-Account-Balance-V2   // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Futures-Account-Balance      // future
see: https://developers.binance.com/docs/derivatives/option/account/Option-Account-Information                           // option
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Account-Balance                            // portfolio margin

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'future', 'delivery', 'savings', 'funding', or 'spot' or 'papi'
- `params.marginMode`::string, optional: 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
- `params.symbols`::any, optional: unified market symbols, only used in isolated margin mode
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch the balance for a portfolio margin account
- `params.subType`::string, optional: 'linear' or 'inverse'

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Binance; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    defaultType = safeString2(self.options, "fetchBalance", "defaultType", "spot");
    type_var = safeString(params, "type", defaultType);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchBalance", market = nothing, params = params);
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchBalance", "papi", "portfolioMargin", defaultValue = false);
    marginMode = nothing;
    query = nothing;
    (marginMode, query) = self.handleMarginModeAndParams("fetchBalance", params = params);
    query = omit(query, "type");
    response = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(@functions.ccxt_or(isPortfolioMargin, (type_var == "papi")))
        if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
            type_var = "linear";
        elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
            type_var = "inverse";
        end
        isPortfolioMargin = true;
        response = Base.fetch(self.papiGetBalance(extend(request, query)));
    elseif functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        type_var = "linear";
        useV2 = nothing;
        (useV2, params) = self.handleOptionAndParams(params, "fetchBalance", "useV2", defaultValue = false);
        params = extend(request, query);
        if functions.ccxtruthy(!functions.ccxtruthy(useV2))
            response = Base.fetch(self.fapiPrivateV3GetAccount(params));
        else
            response = Base.fetch(self.fapiPrivateV2GetAccount(params));
        end
    else
        if functions.ccxtruthy(self.isInverse(type_var, subType = subType))
            type_var = "inverse";
            response = Base.fetch(self.dapiPrivateGetAccount(extend(request, query)));
        elseif functions.ccxtruthy(marginMode == "isolated")
            paramSymbols = self.safeList(params, "symbols");
            query = omit(query, "symbols");
            if functions.ccxtruthy(paramSymbols != nothing)
                symbols = "";
                if functions.ccxtruthy(functions.ccxt_isArray(paramSymbols))
                    mid = self.marketId(get(paramSymbols, 1, nothing));
                    if functions.ccxtruthy(mid != nothing)
                        symbols = mid;
                    end
                    i = 1
                    while functions.ccxtruthy(functions.ccxt_lt(i, length(paramSymbols)))
                        symbol = get(paramSymbols, i + 1, nothing);
                        id = self.marketId(symbol);
                        if functions.ccxtruthy(id != nothing)
                            symbols += string(",", id);
                        end
                        i += 1
                    end

                else
                    symbols = paramSymbols;
                end
                request[Symbol("symbols")] = symbols;
            end
            response = Base.fetch(self.sapiGetMarginIsolatedAccount(extend(request, query)));
        else
            if functions.ccxtruthy(@functions.ccxt_or((type_var == "margin"), (marginMode == "cross")))
                response = Base.fetch(self.sapiGetMarginAccount(extend(request, query)));
            elseif functions.ccxtruthy(type_var == "savings")
                response = Base.fetch(self.sapiGetLendingUnionAccount(extend(request, query)));
            else
                if functions.ccxtruthy(type_var == "funding")
                    response = Base.fetch(self.sapiPostAssetGetFundingAsset(extend(request, query)));
                else
                    response = Base.fetch(self.privateGetAccount(extend(request, query)));
                end

            end

        end

    end
    return self.parseBalanceCustom(response, type_var = type_var, marginMode = marginMode, isPortfolioMargin = isPortfolioMargin)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#order-book       // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book     // swap
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book-RPI // swap rpi
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Order-Book     // future
see: https://developers.binance.com/docs/derivatives/option/market-data/Order-Book                             // option

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.rpi`::bool, optional: *future only* set to true to use the RPI endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Binance, symbol; limit=nothing, params=Dict())
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
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPublicGetDepth(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        rpi = safeValue(params, "rpi", false);
        params = omit(params, "rpi");
        if functions.ccxtruthy(rpi)
            request[Symbol("limit")] = 1000;
            response = Base.fetch(self.fapiPublicGetRpiDepth(extend(request, params)));
        else
            response = Base.fetch(self.fapiPublicGetDepth(extend(request, params)));
        end
    else
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiPublicGetDepth(extend(request, params)));
        else
            response = Base.fetch(self.publicGetDepth(extend(request, params)));
        end

    end
    timestamp = safeInteger(response, "T");
    orderbook = self.parseOrderBook(response, symbol, timestamp = timestamp);
    orderbook[Symbol("nonce")] = safeInteger2(response, "lastUpdateId", "u");
    return orderbook

end
function parseTicker(self::Binance, ticker; market=nothing)
    timestamp = safeInteger2(ticker, "closeTime", "time");
    marketType = nothing;
    if functions.ccxtruthy((ccxt_in("time", ticker)))
        marketType = "contract";
    end
    if functions.ccxtruthy(marketType == nothing)
        marketType = functions.ccxtruthy((ccxt_in("bidQty", ticker))) ? "spot" : "contract";
    end
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = marketType);
    last_var = safeString(ticker, "lastPrice");
    wAvg = safeString(ticker, "weightedAvgPrice");
    isCoinm = (ccxt_in("baseVolume", ticker));
    baseVolume = nothing;
    quoteVolume = nothing;
    if functions.ccxtruthy(isCoinm)
        baseVolume = safeString(ticker, "baseVolume");
        quoteVolume = stringMul(baseVolume, wAvg);
    else
        baseVolume = safeString(ticker, "volume");
        quoteVolume = safeString2(ticker, "quoteVolume", "amount");
    end
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString2(ticker, "highPrice", "high"),
    Symbol("low") => safeString2(ticker, "lowPrice", "low"),
    Symbol("bid") => safeString(ticker, "bidPrice"),
    Symbol("bidVolume") => safeString(ticker, "bidQty"),
    Symbol("ask") => safeString(ticker, "askPrice"),
    Symbol("askVolume") => safeString(ticker, "askQty"),
    Symbol("vwap") => wAvg,
    Symbol("open") => safeString2(ticker, "openPrice", "open"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => safeString(ticker, "prevClosePrice"),
    Symbol("change") => safeString(ticker, "priceChange"),
    Symbol("percentage") => safeString(ticker, "priceChangePercent"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => safeString(ticker, "markPrice"),
    Symbol("indexPrice") => safeString(ticker, "indexPrice"),
    Symbol("info") => ticker
), market = market)

end
"""
the latest known information on the availability of the exchange API
see: https://developers.binance.com/docs/wallet/others/system-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Binance; params=Dict())
    response = Base.fetch(self.sapiGetSystemStatus(params));
    statusRaw = safeString(response, "status");
    return Dict{Symbol, Any}(
    Symbol("status") => safeString(Dict{Symbol, Any}(
    Symbol("0") => "ok",
    Symbol("1") => "maintenance"
), statusRaw, statusRaw),
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#24hr-ticker-price-change-statistics     // spot
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#rolling-window-price-change-statistics  // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics   // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics   // future
see: https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics                           // option

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.rolling`::bool, optional: (spot only) default false, if true, uses the rolling 24 hour ticker endpoint /api/v3/ticker

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Binance, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPublicGetTicker(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.fapiPublicGetTicker24hr(extend(request, params)));
    else
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiPublicGetTicker24hr(extend(request, params)));
        else
            rolling = self.safeBool(params, "rolling", defaultValue = false);
            params = omit(params, "rolling");
            if functions.ccxtruthy(rolling)
                response = Base.fetch(self.publicGetTicker(extend(request, params)));
            else
                response = Base.fetch(self.publicGetTicker24hr(extend(request, params)));
            end
        end

    end
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        firstTicker = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
            return self.parseTicker(firstTicker, market = market)
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " fetchTicker() returned empty response")));
    end
    return self.parseTicker(response, market = market)

end
"""
fetches the bid and ask price and volume for multiple markets
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#symbol-order-book-ticker   // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Order-Book-Ticker // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Symbol-Order-Book-Ticker // future
see: https://developers.binance.com/docs/derivatives/options-trading/market-data/24hr-Ticker-Price-Change-Statistics      // option

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchBidsAsks(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    market = self.getMarketFromSymbols(symbols = symbols);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBidsAsks", market = market, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchBidsAsks", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(type_var == "option")
        response = Base.fetch(self.eapiPublicGetTicker(params));
    elseif functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        response = Base.fetch(self.fapiPublicGetTickerBookTicker(params));
    else
        if functions.ccxtruthy(self.isInverse(type_var, subType = subType))
            response = Base.fetch(self.dapiPublicGetTickerBookTicker(params));
        elseif functions.ccxtruthy(type_var == "spot")
            request = Dict{Symbol, Any}();
            if functions.ccxtruthy(symbols != nothing)
                request[Symbol("symbols")] = json(self.marketIds(symbols = symbols));
            end
            response = Base.fetch(self.publicGetTickerBookTicker(extend(request, params)));
        else
            throw(NotSupported(string(self.id, " fetchBidsAsks() does not support ", type_var, " markets yet")));
        end

    end
    return self.parseTickers(response, symbols = symbols)

end
"""
fetches the last price for multiple markets
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#symbol-price-ticker    // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Price-Ticker  // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Symbol-Price-Ticker  // future

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the last prices
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of lastprices structures
"""
function fetchLastPrices(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    market = self.getMarketFromSymbols(symbols = symbols);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchLastPrices", market = market, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchLastPrices", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        response = Base.fetch(self.fapiPublicV2GetTickerPrice(params));
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        response = Base.fetch(self.dapiPublicGetTickerPrice(params));
    else
        if functions.ccxtruthy(type_var == "spot")
            response = Base.fetch(self.publicGetTickerPrice(params));
        else
            throw(NotSupported(string(self.id, " fetchLastPrices() does not support ", type_var, " markets yet")));
        end

    end
    return self.parseLastPrices(response, symbols = symbols)

end
function parseLastPrice(self::Binance, entry; market=nothing)
    timestamp = safeInteger(entry, "time");
    type_var = functions.ccxtruthy((timestamp == nothing)) ? "spot" : "swap";
    marketId = safeString(entry, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = type_var);
    return Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("price") => self.safeNumberOmitZero(entry, "price"),
    Symbol("side") => nothing,
    Symbol("info") => entry
)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#24hr-ticker-price-change-statistics    // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics  // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics  // future
see: https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics                          // option

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"
- `params.type`::string, optional: 'spot', 'option', use params["subType"] for swap and future markets

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    market = self.getMarketFromSymbols(symbols = symbols);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market = market, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchTickers", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        response = Base.fetch(self.fapiPublicGetTicker24hr(params));
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        response = Base.fetch(self.dapiPublicGetTicker24hr(params));
    else
        if functions.ccxtruthy(type_var == "spot")
            rolling = self.safeBool(params, "rolling", defaultValue = false);
            params = omit(params, "rolling");
            if functions.ccxtruthy(rolling)
                symbols = self.marketSymbols(symbols = symbols);
                request = Dict{Symbol, Any}(
                    Symbol("symbols") => json(self.marketIds(symbols = symbols))
                );
                response = Base.fetch(self.publicGetTicker(extend(request, params)));
                    return self.parseTickersForRolling(response, symbols)
            else
                request = Dict{Symbol, Any}();
                if functions.ccxtruthy(symbols != nothing)
                    request[Symbol("symbols")] = json(self.marketIds(symbols = symbols));
                end
                response = Base.fetch(self.publicGetTicker24hr(extend(request, params)));
            end
        elseif functions.ccxtruthy(type_var == "option")
            response = Base.fetch(self.eapiPublicGetTicker(params));
        else
            throw(NotSupported(string(self.id, " fetchTickers() does not support ", type_var, " markets yet")));
        end

    end
    return self.parseTickers(response, symbols = symbols)

end
function parseTickersForRolling(self::Binance, response, symbols)
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        marketId = safeString(get(response, i + 1, nothing), "symbol");
        tickerMarket = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = "spot");
        parsedTicker = self.parseTicker(get(response, i + 1, nothing));
        parsedTicker[Symbol("symbol")] = get(tickerMarket, Symbol("symbol"), nothing);
        push!(results, parsedTicker);
        i += 1
    end
    return self.filterByArray(results, "symbol", values = symbols)

end
"""
fetches mark price for the market
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
see: https://developers.binance.com/docs/derivatives/options-trading/market-data/Option-Mark-Price

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchMarkPrice(self::Binance, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchMarkPrice", market = market, params = params, defaultValue = "swap");
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMarkPrice", market = market, params = params, defaultValue = "linear");
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPublicGetMark(extend(request, params)));
    elseif functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        response = Base.fetch(self.fapiPublicGetPremiumIndex(extend(request, params)));
    else
        if functions.ccxtruthy(self.isInverse(type_var, subType = subType))
            response = Base.fetch(self.dapiPublicGetPremiumIndex(extend(request, params)));
        else
            throw(NotSupported(string(self.id, " fetchMarkPrice() does not support ", type_var, " markets yet")));
        end

    end
    if functions.ccxtruthy(functions.ccxt_isArray(response))
            return self.parseTicker(self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}()), market = market)
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " fetchMarkPrice() returned empty response")));
    end
    return self.parseTicker(response, market = market)

end
"""
fetches mark prices for multiple markets
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
see: https://developers.binance.com/docs/derivatives/options-trading/market-data/Option-Mark-Price

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchMarkPrices(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    market = self.getMarketFromSymbols(symbols = symbols);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchMarkPrices", market = market, params = params, defaultValue = "swap");
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMarkPrices", market = market, params = params, defaultValue = "linear");
    response = nothing;
    if functions.ccxtruthy(type_var == "option")
        response = Base.fetch(self.eapiPublicGetMark(params));
    elseif functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        response = Base.fetch(self.fapiPublicGetPremiumIndex(params));
    else
        if functions.ccxtruthy(self.isInverse(type_var, subType = subType))
            response = Base.fetch(self.dapiPublicGetPremiumIndex(params));
        else
            throw(NotSupported(string(self.id, " fetchMarkPrices() does not support ", type_var, " markets yet")));
        end

    end
    return self.parseTickers(response, symbols = symbols)

end
function parseOHLCV(self::Binance, ohlcv; market=nothing)
    inverse = self.safeBool(market, "inverse");
    volumeIndex = functions.ccxtruthy(inverse) ? 7 : 5;
    return [safeInteger2(ohlcv, 0, "openTime"), self.safeNumber2(ohlcv, 1, "open"), self.safeNumber2(ohlcv, 2, "high"), self.safeNumber2(ohlcv, 3, "low"), self.safeNumber2(ohlcv, 4, "close"), self.safeNumber2(ohlcv, volumeIndex, "volume")]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#klinecandlestick-data
see: https://developers.binance.com/docs/derivatives/option/market-data/Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Premium-Index-Kline-Data
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Premium-Index-Kline-Data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.price`::string, optional: "mark" or "index" for mark price and index price candles
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Binance, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 1000))
    end
    market = self.market(symbol);
    defaultLimit = 500;
    maxLimit = 1000;
    price = safeString(params, "price");
    until = safeInteger(params, "until");
    params = omit(params, ["price", "until"]);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(since != nothing, until != nothing), limit == nothing))
        limit = maxLimit;
    end
    limit = functions.ccxtruthy((limit == nothing)) ? defaultLimit : min(limit, maxLimit);
    request = Dict{Symbol, Any}(
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe),
        Symbol("limit") => limit
    );
    marketId = get(market, Symbol("id"), nothing);
    if functions.ccxtruthy(marketId == nothing)
        throw(ExchangeError(string(self.id, " fetchOHLCV() missing marketId")));
    end
    if functions.ccxtruthy(price == "index")
        parts = split(marketId, "_");
        pair = safeString(parts, 0);
        request[Symbol("pair")] = pair;
    else
        request[Symbol("symbol")] = marketId;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            if functions.ccxtruthy(functions.ccxt_gt(since, 0))
                duration = self.parseTimeframe(timeframe);
                endTime = self.sum(since, limit * duration * 1000 - 1);
                now = milliseconds();
                request[Symbol("endTime")] = min(now, endTime);
            end
        end
    end
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPublicGetKlines(extend(request, params)));
    elseif functions.ccxtruthy(price == "mark")
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiPublicGetMarkPriceKlines(extend(request, params)));
        else
            response = Base.fetch(self.fapiPublicGetMarkPriceKlines(extend(request, params)));
        end
    else
        if functions.ccxtruthy(price == "index")
            if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
                response = Base.fetch(self.dapiPublicGetIndexPriceKlines(extend(request, params)));
            else
                response = Base.fetch(self.fapiPublicGetIndexPriceKlines(extend(request, params)));
            end
        elseif functions.ccxtruthy(price == "premiumIndex")
            if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
                response = Base.fetch(self.dapiPublicGetPremiumIndexKlines(extend(request, params)));
            else
                response = Base.fetch(self.fapiPublicGetPremiumIndexKlines(extend(request, params)));
            end
        else
            if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
                response = Base.fetch(self.fapiPublicGetKlines(extend(request, params)));
            elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
                response = Base.fetch(self.dapiPublicGetKlines(extend(request, params)));
            else
                response = Base.fetch(self.publicGetKlines(extend(request, params)));
            end

        end

    end
    candles = self.parseOHLCVs(toArray(response), market = market, timeframe = timeframe, since = since, limit = limit);
    return candles

end
function parseTrade(self::Binance, trade; market=nothing)
    if functions.ccxtruthy(ccxt_in("isDustTrade", trade))
            return self.parseDustTrade(trade, market = market)
    end
    timestamp = safeInteger2(trade, "T", "time");
    amount = safeString2(trade, "q", "qty");
    amount = safeString(trade, "quantity", amount);
    marketId = safeString(trade, "symbol");
    isSpotTrade = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((ccxt_in("isIsolated", trade)), (ccxt_in("M", trade))), (ccxt_in("orderListId", trade))), (ccxt_in("isMaker", trade)));
    marketType = functions.ccxtruthy(isSpotTrade) ? "spot" : "contract";
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = marketType);
    symbol = get(market, Symbol("symbol"), nothing);
    side = nothing;
    buyerMaker = self.safeBool2(trade, "m", "isBuyerMaker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(buyerMaker != nothing)
        side = functions.ccxtruthy(buyerMaker) ? "sell" : "buy";
    elseif functions.ccxtruthy(ccxt_in("side", trade))
        side = safeStringLower(trade, "side");
    else
        if functions.ccxtruthy(ccxt_in("isBuyer", trade))
            side = functions.ccxtruthy(get(trade, Symbol("isBuyer"), nothing)) ? "buy" : "sell";
        end
    end
    fee = nothing;
    if functions.ccxtruthy(ccxt_in("commission", trade))
        fee = Dict{Symbol, Any}(
            Symbol("cost") => safeString(trade, "commission"),
            Symbol("currency") => self.safeCurrencyCode(safeString(trade, "commissionAsset"))
        );
    end
    if functions.ccxtruthy(ccxt_in("isMaker", trade))
        takerOrMaker = functions.ccxtruthy(get(trade, Symbol("isMaker"), nothing)) ? "maker" : "taker";
    end
    if functions.ccxtruthy(ccxt_in("maker", trade))
        takerOrMaker = functions.ccxtruthy(get(trade, Symbol("maker"), nothing)) ? "maker" : "taker";
    end
    if functions.ccxtruthy(@functions.ccxt_or((ccxt_in("optionSide", trade)), get(market, Symbol("option"), nothing)))
        settle = self.safeCurrencyCode(safeString(trade, "quoteAsset", "USDT"));
        takerOrMaker = safeStringLower(trade, "liquidity");
        if functions.ccxtruthy(ccxt_in("fee", trade))
            fee = Dict{Symbol, Any}(
                Symbol("cost") => safeString(trade, "fee"),
                Symbol("currency") => settle
            );
        end
        if functions.ccxtruthy(@functions.ccxt_and((side != "buy"), (side != "sell")))
            side = functions.ccxtruthy((side == "1")) ? "buy" : "sell";
        end
        if functions.ccxtruthy(ccxt_in("optionSide", trade))
            if functions.ccxtruthy(side != "buy")
                amount = stringMul("-1", amount);
            end
        end
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => safeStringN(trade, ["t", "a", "tradeId", "id"]),
    Symbol("order") => safeString(trade, "orderId"),
    Symbol("type") => safeStringLower(trade, "type"),
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => safeString2(trade, "p", "price"),
    Symbol("amount") => amount,
    Symbol("cost") => safeString2(trade, "quoteQty", "baseQty"),
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol Default fetchTradesMethod Other fetchTradesMethod
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#compressedaggregate-trades-list    // publicGetAggTrades (spot)
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Compressed-Aggregate-Trades-List // fapiPublicGetAggTrades (swap)
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Compressed-Aggregate-Trades-List // dapiPublicGetAggTrades (future)
see: https://developers.binance.com/docs/derivatives/option/market-data/Recent-Trades-List                                       // eapiPublicGetTrades (option)
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#recent-trades-list                 // publicGetTrades (spot)
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Recent-Trades-List               // fapiPublicGetTrades (swap)
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Recent-Trades-List               // dapiPublicGetTrades (future)
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#old-trade-lookup                   // publicGetHistoricalTrades (spot)
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Old-Trades-Lookup                // fapiPublicGetHistoricalTrades (swap)
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Old-Trades-Lookup                // dapiPublicGetHistoricalTrades (future)
see: https://developers.binance.com/docs/derivatives/option/market-data/Old-Trades-Lookup                                        // eapiPublicGetHistoricalTrades (option)

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: only used when fetchTradesMethod is 'publicGetAggTrades', 'fapiPublicGetAggTrades', or 'dapiPublicGetAggTrades'
- `limit`::int, optional: default 500, max 1000
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: only used when fetchTradesMethod is 'publicGetAggTrades', 'fapiPublicGetAggTrades', or 'dapiPublicGetAggTrades'
- `params.fetchTradesMethod`::int, optional: 'publicGetAggTrades' (spot default), 'fapiPublicGetAggTrades' (swap default), 'dapiPublicGetAggTrades' (future default), 'eapiPublicGetTrades' (option default), 'publicGetTrades', 'fapiPublicGetTrades', 'dapiPublicGetTrades', 'publicGetHistoricalTrades', 'fapiPublicGetHistoricalTrades', 'dapiPublicGetHistoricalTrades', 'eapiPublicGetHistoricalTrades'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) EXCHANGE SPECIFIC PARAMETERS
- `params.fromId`::int, optional: trade id to fetch from, default gets most recent trades, not used when fetchTradesMethod is 'publicGetTrades', 'fapiPublicGetTrades', 'dapiPublicGetTrades', or 'eapiPublicGetTrades'

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Binance, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTrades", symbol = symbol, since = since, limit = limit, params = params))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("option"), nothing)))
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
            request[Symbol("endTime")] = self.sum(since, 3600000);
        end
        until = safeInteger(params, "until");
        if functions.ccxtruthy(until != nothing)
            request[Symbol("endTime")] = until;
        end
    end
    method = safeString(self.options, "fetchTradesMethod");
    method = safeString2(params, "fetchTradesMethod", "method", method);
    if functions.ccxtruthy(limit != nothing)
        isFutureOrSwap = (@functions.ccxt_or(get(market, Symbol("swap"), nothing), get(market, Symbol("future"), nothing)));
        isHistoricalEndpoint = @functions.ccxt_and((method != nothing), (findfirst("GetHistoricalTrades", method) !== nothing));
        maxLimitForContractHistorical = functions.ccxtruthy(isHistoricalEndpoint) ? 500 : 1000;
        request[Symbol("limit")] = functions.ccxtruthy(isFutureOrSwap) ? min(limit, maxLimitForContractHistorical) : limit;
    end
    params = omit(params, ["until", "fetchTradesMethod"]);
    if functions.ccxtruthy(method == nothing)
        if functions.ccxtruthy(get(market, Symbol("option"), nothing))
            method = "eapiPublicGetTrades";
        elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            method = "fapiPublicGetAggTrades";
        else
            if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
                method = "dapiPublicGetAggTrades";
            else
                method = "publicGetAggTrades";
            end

        end
    end
    response = nothing;
    if functions.ccxtruthy(method == "publicGetAggTrades")
        response = Base.fetch(self.publicGetAggTrades(extend(request, params)));
    elseif functions.ccxtruthy(method == "publicGetTrades")
        response = Base.fetch(self.publicGetTrades(extend(request, params)));
    else
        if functions.ccxtruthy(method == "publicGetHistoricalTrades")
            response = Base.fetch(self.publicGetHistoricalTrades(extend(request, params)));
        elseif functions.ccxtruthy(method == "fapiPublicGetAggTrades")
            response = Base.fetch(self.fapiPublicGetAggTrades(extend(request, params)));
        else
            if functions.ccxtruthy(method == "fapiPublicGetTrades")
                response = Base.fetch(self.fapiPublicGetTrades(extend(request, params)));
            elseif functions.ccxtruthy(method == "fapiPublicGetHistoricalTrades")
                response = Base.fetch(self.fapiPublicGetHistoricalTrades(extend(request, params)));
            else
                if functions.ccxtruthy(method == "dapiPublicGetAggTrades")
                    response = Base.fetch(self.dapiPublicGetAggTrades(extend(request, params)));
                elseif functions.ccxtruthy(method == "dapiPublicGetTrades")
                    response = Base.fetch(self.dapiPublicGetTrades(extend(request, params)));
                else
                    if functions.ccxtruthy(method == "dapiPublicGetHistoricalTrades")
                        response = Base.fetch(self.dapiPublicGetHistoricalTrades(extend(request, params)));
                    elseif functions.ccxtruthy(method == "eapiPublicGetTrades")
                        response = Base.fetch(self.eapiPublicGetTrades(extend(request, params)));
                    else
                        if functions.ccxtruthy(method == "eapiPublicGetHistoricalTrades")
                            response = Base.fetch(self.eapiPublicGetHistoricalTrades(extend(request, params)));
                        else
                            throw(NotSupported(string(self.id, " fetchTrades() does not support this method")));
                        end

                    end

                end

            end

        end

    end
    responseList = [];
    if functions.ccxtruthy(response != nothing)
        responseList = toArray(response);
    end
    return self.parseTrades(responseList, market = market, since = since, limit = limit)

end
"""
edit a trade order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-an-existing-order-and-send-a-new-order-trade

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editSpotOrder(self::Binance, id, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " editSpotOrder() does not support ", get(market, Symbol("type"), nothing), " orders")));
    end
    payload = self.editSpotOrderRequest(id, symbol, type_var, side, amount, price = price, params = params);
    response = Base.fetch(self.privatePostOrderCancelReplace(payload));
    data = self.safeDict(response, "newOrderResponse", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function editSpotOrderRequest(self::Binance, id, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    clientOrderId = safeStringN(params, ["newClientOrderId", "clientOrderId", "origClientOrderId"]);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " editSpotOrderRequest() requires a side argument")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side)
    );
    initialUppercaseType = uppercase(type_var);
    uppercaseType = initialUppercaseType;
    postOnly = self.isPostOnly(initialUppercaseType == "MARKET", initialUppercaseType == "LIMIT_MAKER", params = params);
    if functions.ccxtruthy(postOnly)
        uppercaseType = "LIMIT_MAKER";
    end
    triggerPrice = self.safeNumber2(params, "stopPrice", "triggerPrice");
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(uppercaseType == "MARKET")
            uppercaseType = "STOP_LOSS";
        elseif functions.ccxtruthy(uppercaseType == "LIMIT")
            uppercaseType = "STOP_LOSS_LIMIT";
        end
    end
    request[Symbol("type")] = uppercaseType;
    validOrderTypes = self.safeList(get(market, Symbol("info"), nothing), "orderTypes", defaultValue = []);
    if functions.ccxtruthy(!functions.ccxtruthy(inArray(uppercaseType, validOrderTypes)))
        if functions.ccxtruthy(initialUppercaseType != uppercaseType)
            throw(InvalidOrder(string(self.id, " triggerPrice parameter is not allowed for ", symbol, " ", type_var, " orders")));
        else
            throw(InvalidOrder(string(self.id, " ", type_var, " is not a valid order type for the ", symbol, " market")));
        end
    end
    if functions.ccxtruthy(clientOrderId == nothing)
        broker = self.safeDict(self.options, "broker");
        if functions.ccxtruthy(broker != nothing)
            brokerId = safeString(broker, "spot");
            if functions.ccxtruthy(brokerId != nothing)
                request[Symbol("newClientOrderId")] = string(brokerId, uuid22());
            end
        end
    else
        request[Symbol("newClientOrderId")] = clientOrderId;
    end
    request[Symbol("newOrderRespType")] = safeValue(get(self.options, Symbol("newOrderRespType"), nothing), type_var, "RESULT");
    timeInForceIsRequired = false;
    priceIsRequired = false;
    triggerPriceIsRequired = false;
    quantityIsRequired = false;
    if functions.ccxtruthy(uppercaseType == "MARKET")
        quoteOrderQty = self.handleOption("createOrder", "quoteOrderQty", defaultValue = true);
        if functions.ccxtruthy(quoteOrderQty)
            quoteOrderQtyNew = safeValue2(params, "quoteOrderQty", "cost");
            precision = get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing);
            if functions.ccxtruthy(quoteOrderQtyNew != nothing)
                request[Symbol("quoteOrderQty")] = decimalToPrecision(quoteOrderQtyNew, TRUNCATE, precision, self.precisionMode);
            elseif functions.ccxtruthy(price != nothing)
                amountString = numberToString(amount);
                priceString = numberToString(price);
                quoteOrderQuantity = stringMul(amountString, priceString);
                request[Symbol("quoteOrderQty")] = decimalToPrecision(quoteOrderQuantity, TRUNCATE, precision, self.precisionMode);
            else
                quantityIsRequired = true;
            end
        else
            quantityIsRequired = true;
        end
    elseif functions.ccxtruthy(uppercaseType == "LIMIT")
        priceIsRequired = true;
        timeInForceIsRequired = true;
        quantityIsRequired = true;
    else
        if functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "STOP_LOSS"), (uppercaseType == "TAKE_PROFIT")))
            triggerPriceIsRequired = true;
            quantityIsRequired = true;
        elseif functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "STOP_LOSS_LIMIT"), (uppercaseType == "TAKE_PROFIT_LIMIT")))
            quantityIsRequired = true;
            triggerPriceIsRequired = true;
            priceIsRequired = true;
            timeInForceIsRequired = true;
        else
            if functions.ccxtruthy(uppercaseType == "LIMIT_MAKER")
                priceIsRequired = true;
                quantityIsRequired = true;
            end

        end

    end
    if functions.ccxtruthy(quantityIsRequired)
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(priceIsRequired)
        if functions.ccxtruthy(price == nothing)
            throw(InvalidOrder(string(self.id, " editOrder() requires a price argument for a ", type_var, " order")));
        end
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(@functions.ccxt_and(timeInForceIsRequired, (safeString(params, "timeInForce") == nothing)))
        request[Symbol("timeInForce")] = self.handleOption("createOrder", "timeInForce");
    end
    if functions.ccxtruthy(triggerPriceIsRequired)
        if functions.ccxtruthy(triggerPrice == nothing)
            throw(InvalidOrder(string(self.id, " editOrder() requires a triggerPrice extra param for a ", type_var, " order")));
        else
            request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
        end
    end
    request[Symbol("cancelReplaceMode")] = "STOP_ON_FAILURE";
    cancelId = safeString2(params, "cancelNewClientOrderId", "cancelOrigClientOrderId");
    if functions.ccxtruthy(cancelId == nothing)
        request[Symbol("cancelOrderId")] = id;
    end
    if functions.ccxtruthy(safeString(params, "timeInForce") == "PO")
        params = omit(params, ["timeInForce"]);
    end
    params = omit(params, ["quoteOrderQty", "cost", "stopPrice", "newClientOrderId", "clientOrderId", "postOnly"]);
    return extend(request, params)

end
function editContractOrderRequest(self::Binance, id, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    if functions.ccxtruthy(@functions.ccxt_and((price == nothing), !functions.ccxtruthy((ccxt_in("priceMatch", params)))))
        throw(ArgumentsRequired(string(self.id, " editOrder() and editOrderWs() require a price argument for swap orders")));
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(NotSupported(string(self.id, " editContractOrder() does not support ", get(market, Symbol("type"), nothing), " orders")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " editContractOrder() requires a side argument")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side),
        Symbol("orderId") => id,
        Symbol("quantity") => self.amountToPrecision(symbol, amount)
    );
    clientOrderId = safeStringN(params, ["newClientOrderId", "clientOrderId", "origClientOrderId"]);
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("origClientOrderId")] = clientOrderId;
    end
    params = omit(params, ["clientOrderId", "newClientOrderId"]);
    return request

end
"""
edit a trade order
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Modify-UM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Modify-CM-Order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to edit an order in a portfolio margin account

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editContractOrder(self::Binance, id, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "editContractOrder", "papi", "portfolioMargin", defaultValue = false);
    request = self.editContractOrderRequest(id, symbol, type_var, side, amount, price = price, params = params);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiPutUmOrder(extend(request, params)));
        else
            response = Base.fetch(self.fapiPrivatePutOrder(extend(request, params)));
        end
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiPutCmOrder(extend(request, params)));
        else
            response = Base.fetch(self.dapiPrivatePutOrder(extend(request, params)));
        end
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseOrder() returned empty response")));
    end
    return self.parseOrder(response, market = market)

end
"""
edit a trade order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-an-existing-order-and-send-a-new-order-trade
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Binance, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        throw(NotSupported(string(self.id, " editOrder() does not support ", get(market, Symbol("type"), nothing), " orders")));
    end
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            return Base.fetch(self.editSpotOrder(id, symbol, type_var, side, amount, price = price, params = params))
    else
        return Base.fetch(self.editContractOrder(id, symbol, type_var, side, amount, price = price, params = params))
    end

end
"""
edit a list of trade orders
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Multiple-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Multiple-Orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrders(self::Binance, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    orderSymbols = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        push!(orderSymbols, marketId);
        id = safeString(rawOrder, "id");
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        isPortfolioMargin = nothing;
        (isPortfolioMargin, orderParams) = self.handleOptionAndParams2(orderParams, "editOrders", "papi", "portfolioMargin", defaultValue = false);
        if functions.ccxtruthy(isPortfolioMargin)
            throw(NotSupported(string(self.id, " editOrders() does not support portfolio margin orders")));
        end
        orderRequest = self.editContractOrderRequest(id, marketId, type_var, side, amount, price = price, params = orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    orderSymbols = self.marketSymbols(symbols = orderSymbols, type_var = nothing, allowEmpty = false, sameTypeOnly = true, sameSubTypeOnly = true);
    market = self.market(get(orderSymbols, 1, nothing));
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("spot"), nothing), get(market, Symbol("option"), nothing)))
        throw(NotSupported(string(self.id, " editOrders() does not support ", get(market, Symbol("type"), nothing), " orders")));
    end
    response = nothing;
    request = Dict{Symbol, Any}(
        Symbol("batchOrders") => ordersRequests
    );
    request = extend(request, params);
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.fapiPrivatePutBatchOrders(request));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.dapiPrivatePutBatchOrders(request));
    end
    return self.parseOrders(response)

end
function parseOrderStatus(self::Binance, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("ACCEPTED") => "open",
        Symbol("TRIGGERING") => "open",
        Symbol("FILLED") => "closed",
        Symbol("TRIGGERED") => "closed",
        Symbol("FINISHED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("CANCELLED") => "canceled",
        Symbol("PENDING_CANCEL") => "canceling",
        Symbol("REJECTED") => "rejected",
        Symbol("EXPIRED") => "expired",
        Symbol("EXPIRED_IN_MATCH") => "expired"
    );
    return safeString(statuses, status, status)

end
function parseOrderTypeByMarket(self::Binance, type_var, marketType)
    types = Dict{Symbol, Any}();
    if functions.ccxtruthy(@functions.ccxt_and((marketType != nothing), marketType == "spot"))
        types = Dict{Symbol, Any}(
            Symbol("limit_maker") => "limit",
            Symbol("stop_loss_limit") => "limit",
            Symbol("stop_loss") => "market",
            Symbol("take_profit_limit") => "limit",
            Symbol("take_profit") => "market"
        );
    else
        types = Dict{Symbol, Any}(
            Symbol("limit_maker") => "limit",
            Symbol("stop") => "limit",
            Symbol("stop_market") => "market",
            Symbol("take_profit") => "limit",
            Symbol("take_profit_market") => "market",
            Symbol("trailing_stop_market") => "market"
        );
    end
    return safeString(types, type_var, type_var)

end
function parseOrder(self::Binance, order; market=nothing)
    code = safeString(order, "code");
    if functions.ccxtruthy(code != nothing)
        msg = safeString(order, "msg");
        if functions.ccxtruthy(@functions.ccxt_and((code != "200"), !functions.ccxtruthy((@functions.ccxt_or((msg == "success"), (msg == "The operation of cancel all open order is done."))))))
                return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("status") => "rejected"
), market = market)
        end
    end
    status = self.parseOrderStatus(safeStringN(order, ["status", "strategyStatus", "algoStatus"]));
    marketId = safeString(order, "symbol");
    isContract = @functions.ccxt_or((ccxt_in("positionSide", order)), (ccxt_in("cumQuote", order)));
    marketType = functions.ccxtruthy(isContract) ? "contract" : "spot";
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = marketType);
    filled = safeString(order, "executedQty", "0");
    timestamp = safeIntegerN(order, ["time", "createTime", "workingTime", "transactTime", "updateTime"]);
    lastTradeTimestamp = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((ccxt_in("transactTime", order)), (ccxt_in("updateTime", order))))
        timestampValue = safeInteger2(order, "updateTime", "transactTime");
        if functions.ccxtruthy(status == "open")
            if functions.ccxtruthy(stringGt(filled, "0"))
                lastTradeTimestamp = timestampValue;
            end
        elseif functions.ccxtruthy(status == "closed")
            lastTradeTimestamp = timestampValue;
        end
    end
    lastUpdateTimestamp = safeInteger2(order, "transactTime", "updateTime");
    average = safeString(order, "avgPrice");
    price = safeString(order, "price");
    amount = safeString2(order, "origQty", "quantity");
    cost = safeString2(order, "cummulativeQuoteQty", "cumQuote");
    cost = safeString(order, "cumBase", cost);
    type_var = safeStringLower2(order, "type", "orderType");
    side = safeStringLower(order, "side");
    fills = self.safeList(order, "fills", defaultValue = []);
    timeInForce = safeString(order, "timeInForce");
    if functions.ccxtruthy(timeInForce == "GTX")
        timeInForce = "PO";
    end
    postOnly = @functions.ccxt_or((type_var == "limit_maker"), (timeInForce == "PO"));
    stopPriceString = safeString2(order, "stopPrice", "triggerPrice");
    triggerPrice = self.parseNumber(omitZero(stopPriceString));
    feeCost = self.safeNumber(order, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => safeString(order, "quoteAsset"),
            Symbol("cost") => feeCost,
            Symbol("rate") => nothing
        );
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeStringN(order, ["strategyId", "orderId", "algoId"]),
    Symbol("clientOrderId") => safeStringN(order, ["clientOrderId", "newClientStrategyId", "clientAlgoId"]),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => self.parseOrderTypeByMarket(type_var, marketType),
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => self.safeBool(order, "reduceOnly"),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => average,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => fills
), market = market)

end
"""
*contract only* create a list of trade orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Place-Multiple-Orders
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Place-Multiple-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Place-Multiple-Orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Binance, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    orderSymbols = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        push!(orderSymbols, marketId);
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price = price, params = orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    orderSymbols = self.marketSymbols(symbols = orderSymbols, type_var = nothing, allowEmpty = false, sameTypeOnly = true, sameSubTypeOnly = true);
    market = self.market(get(orderSymbols, 1, nothing));
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(NotSupported(string(self.id, " createOrders() does not support ", get(market, Symbol("type"), nothing), " orders")));
    end
    response = nothing;
    request = Dict{Symbol, Any}(
        Symbol("batchOrders") => ordersRequests
    );
    request = extend(request, params);
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.fapiPrivatePostBatchOrders(request));
    elseif functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPrivatePostBatchOrders(request));
    else
        response = Base.fetch(self.dapiPrivatePostBatchOrders(request));
    end
    return self.parseOrders(response)

end
"""
create a trade order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade
see: https://developers.binance.com/docs/binance-spot-api-docs/testnet/rest-api/trading-endpoints#test-new-order-trade
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api
see: https://developers.binance.com/docs/derivatives/option/trade/New-Order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#sor
see: https://developers.binance.com/docs/binance-spot-api-docs/testnet/rest-api/trading-endpoints#sor
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-UM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-CM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-Margin-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-UM-Conditional-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-CM-Conditional-Order
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Algo-Order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of you want to trade in units of the base currency
- `price`::float, optional: the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.reduceOnly`::string, optional: for swap and future reduceOnly is a string 'true' or 'false' that cant be sent with close position set to true or in hedge mode. For spot margin and option reduceOnly is a boolean.
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.sor`::bool, optional: *spot only* whether to use SOR (Smart Order Routing) or not, default is false
- `params.test`::bool, optional: *spot only* whether to use the test endpoint or not, default is false
- `params.trailingPercent`::float, optional: the percent to trail away from the current market price
- `params.trailingTriggerPrice`::float, optional: the price to trigger a trailing order, default uses the price argument
- `params.triggerPrice`::float, optional: the price that a trigger order is triggered at
- `params.stopLossPrice`::float, optional: the price that a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: the price that a take profit order is triggered at
- `params.portfolioMargin`::bool, optional: set to true if you would like to create an order in a portfolio margin account
- `params.selfTradePrevention`::string, optional: set unified value for stp, one of NONE, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH
- `params.icebergAmount`::float, optional: set iceberg amount for limit orders
- `params.stopLossOrTakeProfit`::string, optional: 'stopLoss' or 'takeProfit', required for spot trailing orders
- `params.positionSide`::string, optional: *swap and portfolio margin only* "BOTH" for one-way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode
- `params.hedged`::bool, optional: *swap and portfolio margin only* true for hedged mode, false for one way mode, default is false
- `params.clientOrderId`::string, optional: the clientOrderId of the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Binance, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marketType = safeString(params, "type", get(market, Symbol("type"), nothing));
    marginMode = safeString(params, "marginMode");
    porfolioOptionsValue = self.safeBool2(self.options, "papi", "portfolioMargin", defaultValue = false);
    isPortfolioMargin = self.safeBool2(params, "papi", "portfolioMargin", defaultValue = porfolioOptionsValue);
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLossPrice = safeString(params, "stopLossPrice");
    takeProfitPrice = safeString(params, "takeProfitPrice");
    trailingPercent = safeString2(params, "trailingPercent", "callbackRate");
    isTrailingPercentOrder = trailingPercent != nothing;
    isStopLoss = stopLossPrice != nothing;
    isTakeProfit = takeProfitPrice != nothing;
    isConditional = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((triggerPrice != nothing), isTrailingPercentOrder), isStopLoss), isTakeProfit);
    sor = self.safeBool2(params, "sor", "SOR", defaultValue = false);
    test = self.safeBool(params, "test", defaultValue = false);
    params = omit(params, ["sor", "SOR", "test"]);
    request = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPrivatePostOrder(request));
    elseif functions.ccxtruthy(sor)
        if functions.ccxtruthy(test)
            response = Base.fetch(self.privatePostSorOrderTest(request));
        else
            response = Base.fetch(self.privatePostSorOrder(request));
        end
    else
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            if functions.ccxtruthy(isPortfolioMargin)
                if functions.ccxtruthy(isConditional)
                    response = Base.fetch(self.papiPostUmConditionalOrder(request));
                else
                    response = Base.fetch(self.papiPostUmOrder(request));
                end
            else
                if functions.ccxtruthy(isConditional)
                    request[Symbol("algoType")] = "CONDITIONAL";
                    response = Base.fetch(self.fapiPrivatePostAlgoOrder(request));
                else
                    response = Base.fetch(self.fapiPrivatePostOrder(request));
                end
            end
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            if functions.ccxtruthy(isPortfolioMargin)
                if functions.ccxtruthy(isConditional)
                    response = Base.fetch(self.papiPostCmConditionalOrder(request));
                else
                    response = Base.fetch(self.papiPostCmOrder(request));
                end
            else
                if functions.ccxtruthy(isConditional)
                    request[Symbol("algoType")] = "CONDITIONAL";
                    response = Base.fetch(self.dapiPrivatePostAlgoOrder(request));
                else
                    response = Base.fetch(self.dapiPrivatePostOrder(request));
                end
            end
        else
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(marketType == "margin", marginMode != nothing), isPortfolioMargin))
                if functions.ccxtruthy(isPortfolioMargin)
                    response = Base.fetch(self.papiPostMarginOrder(request));
                else
                    response = Base.fetch(self.sapiPostMarginOrder(request));
                end
            else
                if functions.ccxtruthy(test)
                    response = Base.fetch(self.privatePostOrderTest(request));
                else
                    response = Base.fetch(self.privatePostOrder(request));
                end
            end

        end

    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseOrder() returned empty response")));
    end
    return self.parseOrder(response, market = market)

end
function createOrderRequest(self::Binance, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrderRequest() requires a side argument")));
    end
    market = self.market(symbol);
    marketType = safeString(params, "type", get(market, Symbol("type"), nothing));
    clientOrderId = safeStringN(params, ["clientAlgoId", "newClientOrderId", "clientOrderId"]);
    initialUppercaseType = uppercase(type_var);
    isMarketOrder = initialUppercaseType == "MARKET";
    isLimitOrder = initialUppercaseType == "LIMIT";
    upperCaseSide = uppercase(side);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => upperCaseSide
    );
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "createOrder", "papi", "portfolioMargin", defaultValue = false);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params);
    reduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
    if functions.ccxtruthy(reduceOnly)
        if functions.ccxtruthy(@functions.ccxt_or(marketType == "margin", (@functions.ccxt_and(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)), (marginMode != nothing)))))
            params = omit(params, "reduceOnly");
            request[Symbol("sideEffectType")] = "AUTO_REPAY";
        end
    end
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLossPrice = safeString(params, "stopLossPrice", triggerPrice);
    takeProfitPrice = safeString(params, "takeProfitPrice");
    trailingDelta = safeString(params, "trailingDelta");
    trailingTriggerPrice = safeString2(params, "trailingTriggerPrice", "activationPrice");
    trailingPercent = safeStringN(params, ["trailingPercent", "callbackRate", "trailingDelta"]);
    priceMatch = safeString(params, "priceMatch");
    isTrailingPercentOrder = trailingPercent != nothing;
    isStopLoss = @functions.ccxt_or(stopLossPrice != nothing, trailingDelta != nothing);
    isTakeProfit = takeProfitPrice != nothing;
    isTriggerOrder = triggerPrice != nothing;
    isConditional = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(isTriggerOrder, isTrailingPercentOrder), isStopLoss), isTakeProfit);
    isPortfolioMarginConditional = (@functions.ccxt_and(isPortfolioMargin, isConditional));
    isPriceMatch = priceMatch != nothing;
    priceRequiredForTrailing = true;
    uppercaseType = uppercase(type_var);
    stopPrice = nothing;
    if functions.ccxtruthy(isTrailingPercentOrder)
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            uppercaseType = "TRAILING_STOP_MARKET";
            request[Symbol("callbackRate")] = trailingPercent;
            if functions.ccxtruthy(trailingTriggerPrice != nothing)
                request[Symbol("activationPrice")] = self.priceToPrecision(symbol, trailingTriggerPrice);
            end
        else
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((uppercaseType != "STOP_LOSS"), (uppercaseType != "TAKE_PROFIT")), (uppercaseType != "STOP_LOSS_LIMIT")), (uppercaseType != "TAKE_PROFIT_LIMIT")))
                stopLossOrTakeProfit = safeString(params, "stopLossOrTakeProfit");
                params = omit(params, "stopLossOrTakeProfit");
                if functions.ccxtruthy(@functions.ccxt_and((stopLossOrTakeProfit != "stopLoss"), (stopLossOrTakeProfit != "takeProfit")))
                    throw(InvalidOrder(string(self.id, symbol, " trailingPercent orders require a stopLossOrTakeProfit parameter of either stopLoss or takeProfit")));
                end
                if functions.ccxtruthy(isMarketOrder)
                    if functions.ccxtruthy(stopLossOrTakeProfit == "stopLoss")
                        uppercaseType = "STOP_LOSS";
                    elseif functions.ccxtruthy(stopLossOrTakeProfit == "takeProfit")
                        uppercaseType = "TAKE_PROFIT";
                    end
                else
                    if functions.ccxtruthy(stopLossOrTakeProfit == "stopLoss")
                        uppercaseType = "STOP_LOSS_LIMIT";
                    elseif functions.ccxtruthy(stopLossOrTakeProfit == "takeProfit")
                        uppercaseType = "TAKE_PROFIT_LIMIT";
                    end
                end
            end
            if functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "STOP_LOSS"), (uppercaseType == "TAKE_PROFIT")))
                priceRequiredForTrailing = false;
            end
            if functions.ccxtruthy(trailingTriggerPrice != nothing)
                stopPrice = self.priceToPrecision(symbol, trailingTriggerPrice);
            end
            trailingPercentConverted = stringMul(trailingPercent, "100");
            request[Symbol("trailingDelta")] = trailingPercentConverted;
        end
    elseif functions.ccxtruthy(isStopLoss)
        stopPrice = stopLossPrice;
        if functions.ccxtruthy(isMarketOrder)
            uppercaseType = functions.ccxtruthy(get(market, Symbol("contract"), nothing)) ? "STOP_MARKET" : "STOP_LOSS";
        elseif functions.ccxtruthy(isLimitOrder)
            uppercaseType = functions.ccxtruthy(get(market, Symbol("contract"), nothing)) ? "STOP" : "STOP_LOSS_LIMIT";
        end
    else
        if functions.ccxtruthy(isTakeProfit)
            stopPrice = takeProfitPrice;
            if functions.ccxtruthy(isMarketOrder)
                uppercaseType = functions.ccxtruthy(get(market, Symbol("contract"), nothing)) ? "TAKE_PROFIT_MARKET" : "TAKE_PROFIT";
            elseif functions.ccxtruthy(isLimitOrder)
                uppercaseType = functions.ccxtruthy(get(market, Symbol("contract"), nothing)) ? "TAKE_PROFIT" : "TAKE_PROFIT_LIMIT";
            end
        end

    end
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        if functions.ccxtruthy(type_var == "market")
            throw(InvalidOrder(string(self.id, " ", type_var, " is not a valid order type for the ", symbol, " market")));
        end
    else
        validOrderTypes = self.safeList(get(market, Symbol("info"), nothing), "orderTypes", defaultValue = []);
        if functions.ccxtruthy(!functions.ccxtruthy(inArray(uppercaseType, validOrderTypes)))
            if functions.ccxtruthy(initialUppercaseType != uppercaseType)
                throw(InvalidOrder(string(self.id, " triggerPrice parameter is not allowed for ", symbol, " ", type_var, " orders")));
            else
                throw(InvalidOrder(string(self.id, " ", type_var, " is not a valid order type for the ", symbol, " market")));
            end
        end
    end
    clientOrderIdRequest = functions.ccxtruthy(isPortfolioMarginConditional) ? "newClientStrategyId" : "newClientOrderId";
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(get(market, Symbol("linear"), nothing), get(market, Symbol("swap"), nothing)), isConditional), !functions.ccxtruthy(isPortfolioMargin)))
        clientOrderIdRequest = "clientAlgoId";
    end
    if functions.ccxtruthy(clientOrderId == nothing)
        broker = self.safeDict(self.options, "broker", defaultValue = Dict{Symbol, Any}());
        defaultId = functions.ccxtruthy((get(market, Symbol("contract"), nothing))) ? "x-xcKtGhcu" : "x-TKT5PX2F";
        idMarketType = "spot";
        if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
            idMarketType = functions.ccxtruthy((@functions.ccxt_and(get(market, Symbol("swap"), nothing), get(market, Symbol("linear"), nothing)))) ? "swap" : "inverse";
        end
        brokerId = safeString(broker, idMarketType, defaultId);
        request[Symbol(clientOrderIdRequest)] = string(brokerId, uuid22());
    else
        request[Symbol(clientOrderIdRequest)] = clientOrderId;
    end
    postOnly = nothing;
    if functions.ccxtruthy(!functions.ccxtruthy(isPortfolioMargin))
        postOnly = self.isPostOnly(isMarketOrder, initialUppercaseType == "LIMIT_MAKER", params = params);
        if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("spot"), nothing), marketType == "margin"))
            if functions.ccxtruthy(postOnly)
                uppercaseType = "LIMIT_MAKER";
            end
            if functions.ccxtruthy(marginMode == "isolated")
                request[Symbol("isIsolated")] = true;
            end
        end
    else
        postOnly = self.isPostOnly(isMarketOrder, initialUppercaseType == "LIMIT_MAKER", params = params);
        if functions.ccxtruthy(postOnly)
            if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
                uppercaseType = "LIMIT_MAKER";
            else
                request[Symbol("timeInForce")] = "GTX";
            end
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or((marketType == "spot"), (marketType == "margin"))), !functions.ccxtruthy(isPortfolioMargin)))
        request[Symbol("newOrderRespType")] = safeString(get(self.options, Symbol("newOrderRespType"), nothing), type_var, "FULL");
    else
        request[Symbol("newOrderRespType")] = "RESULT";
    end
    typeRequest = functions.ccxtruthy(isPortfolioMarginConditional) ? "strategyType" : "type";
    request[Symbol(typeRequest)] = uppercaseType;
    closePosition = self.safeBool(params, "closePosition", defaultValue = false);
    timeInForceIsRequired = false;
    priceIsRequired = false;
    triggerPriceIsRequired = false;
    quantityIsRequired = false;
    if functions.ccxtruthy(uppercaseType == "MARKET")
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            quoteOrderQty = self.handleOption("createOrder", "quoteOrderQty", defaultValue = true);
            if functions.ccxtruthy(quoteOrderQty)
                quoteOrderQtyNew = safeString2(params, "quoteOrderQty", "cost");
                precision = get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing);
                if functions.ccxtruthy(quoteOrderQtyNew != nothing)
                    request[Symbol("quoteOrderQty")] = decimalToPrecision(quoteOrderQtyNew, TRUNCATE, precision, self.precisionMode);
                elseif functions.ccxtruthy(price != nothing)
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    quoteOrderQuantity = stringMul(amountString, priceString);
                    request[Symbol("quoteOrderQty")] = decimalToPrecision(quoteOrderQuantity, TRUNCATE, precision, self.precisionMode);
                else
                    quantityIsRequired = true;
                end
            else
                quantityIsRequired = true;
            end
        else
            quantityIsRequired = true;
        end
    elseif functions.ccxtruthy(uppercaseType == "LIMIT")
        priceIsRequired = true;
        timeInForceIsRequired = true;
        quantityIsRequired = true;
    else
        if functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "STOP_LOSS"), (uppercaseType == "TAKE_PROFIT")))
            triggerPriceIsRequired = true;
            quantityIsRequired = true;
            if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(get(market, Symbol("linear"), nothing), get(market, Symbol("inverse"), nothing))), priceRequiredForTrailing))
                priceIsRequired = true;
            end
        elseif functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "STOP_LOSS_LIMIT"), (uppercaseType == "TAKE_PROFIT_LIMIT")))
            quantityIsRequired = true;
            triggerPriceIsRequired = true;
            priceIsRequired = true;
            timeInForceIsRequired = true;
        else
            if functions.ccxtruthy(uppercaseType == "LIMIT_MAKER")
                priceIsRequired = true;
                quantityIsRequired = true;
            elseif functions.ccxtruthy(uppercaseType == "STOP")
                quantityIsRequired = true;
                triggerPriceIsRequired = true;
                priceIsRequired = true;
            else
                if functions.ccxtruthy(@functions.ccxt_or((uppercaseType == "STOP_MARKET"), (uppercaseType == "TAKE_PROFIT_MARKET")))
                    if functions.ccxtruthy(!functions.ccxtruthy(closePosition))
                        quantityIsRequired = true;
                    end
                    triggerPriceIsRequired = true;
                elseif functions.ccxtruthy(uppercaseType == "TRAILING_STOP_MARKET")
                    if functions.ccxtruthy(!functions.ccxtruthy(closePosition))
                        quantityIsRequired = true;
                    end
                    if functions.ccxtruthy(trailingPercent == nothing)
                        throw(InvalidOrder(string(self.id, " createOrder() requires a trailingPercent param for a ", type_var, " order")));
                    end
                end

            end

        end

    end
    if functions.ccxtruthy(quantityIsRequired)
        marketAmountPrecision = safeString(get(market, Symbol("precision"), nothing), "amount");
        isPrecisionAvailable = (marketAmountPrecision != nothing);
        if functions.ccxtruthy(isPrecisionAvailable)
            request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
        else
            request[Symbol("quantity")] = self.parseToNumeric(amount);
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(priceIsRequired, !functions.ccxtruthy(isPriceMatch)))
        if functions.ccxtruthy(price == nothing)
            throw(InvalidOrder(string(self.id, " createOrder() requires a price argument for a ", type_var, " order")));
        end
        pricePrecision = safeString(get(market, Symbol("precision"), nothing), "price");
        isPricePrecisionAvailable = (pricePrecision != nothing);
        if functions.ccxtruthy(isPricePrecisionAvailable)
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        else
            request[Symbol("price")] = self.parseToNumeric(price);
        end
    end
    if functions.ccxtruthy(triggerPriceIsRequired)
        if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
            if functions.ccxtruthy(stopPrice == nothing)
                throw(InvalidOrder(string(self.id, " createOrder() requires a triggerPrice extra param for a ", type_var, " order")));
            end
        else
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(trailingDelta == nothing, stopPrice == nothing), trailingPercent == nothing))
                throw(InvalidOrder(string(self.id, " createOrder() requires a triggerPrice, trailingDelta or trailingPercent param for a ", type_var, " order")));
            end
        end
        if functions.ccxtruthy(stopPrice != nothing)
            if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("swap"), nothing), !functions.ccxtruthy(isPortfolioMargin)))
                request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, stopPrice);
            else
                request[Symbol("stopPrice")] = self.priceToPrecision(symbol, stopPrice);
            end
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(timeInForceIsRequired, (safeString(params, "timeInForce") == nothing)), (safeString(request, "timeInForce") == nothing)))
        request[Symbol("timeInForce")] = self.handleOption("createOrder", "timeInForce");
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(!functions.ccxtruthy(isPortfolioMargin), get(market, Symbol("contract"), nothing)), postOnly))
        request[Symbol("timeInForce")] = "GTX";
    end
    if functions.ccxtruthy(safeString(params, "timeInForce") == "PO")
        params = omit(params, "timeInForce");
    end
    hedged = self.safeBool(params, "hedged", defaultValue = false);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)), !functions.ccxtruthy(get(market, Symbol("option"), nothing))), hedged))
        if functions.ccxtruthy(reduceOnly)
            params = omit(params, "reduceOnly");
            side = functions.ccxtruthy((side == "buy")) ? "sell" : "buy";
        end
        request[Symbol("positionSide")] = functions.ccxtruthy((side == "buy")) ? "LONG" : "SHORT";
    end
    selfTradePrevention = nothing;
    (selfTradePrevention, params) = self.handleOptionAndParams(params, "createOrder", "selfTradePrevention");
    if functions.ccxtruthy(selfTradePrevention != nothing)
        warnOnStpForInverse = self.handleOption("createOrder", "warnOnSTPForInverse");
        if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("inverse"), nothing), warnOnStpForInverse))
            throw(NotSupported(string(self.id, " createOrder() selfTradePrevention is not supported for inverse markets. selfTradePrevention for inverse markets is taken from linear market. To disable this warning set the .options[\"createOrder\"][\"warnOnSTPForInverse\"] to false.")));
        end
        request[Symbol("selfTradePreventionMode")] =         uppercase(selfTradePrevention);
    end
    icebergAmount = self.safeNumber(params, "icebergAmount");
    if functions.ccxtruthy(icebergAmount != nothing)
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            request[Symbol("icebergQty")] = self.amountToPrecision(symbol, icebergAmount);
        end
    end
    requestParams = omit(params, ["type", "newClientOrderId", "clientOrderId", "postOnly", "stopLossPrice", "takeProfitPrice", "stopPrice", "triggerPrice", "trailingTriggerPrice", "trailingPercent", "quoteOrderQty", "cost", "test", "hedged", "icebergAmount"]);
    return extend(request, requestParams)

end
"""
create a market order by providing the symbol, side and cost
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketOrderWithCost(self::Binance, symbol, side, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketOrderWithCost() supports spot orders only")));
    end
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return Base.fetch(self.createOrder(symbol, "market", side, cost, price = nothing, params = extend(req, params)))

end
"""
create a market buy order by providing the symbol and cost
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Binance, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, price = nothing, params = extend(req, params)))

end
"""
create a market sell order by providing the symbol and cost
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketSellOrderWithCost(self::Binance, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketSellOrderWithCost() supports spot orders only")));
    end
    params[Symbol("quoteOrderQty")] = cost;
    return Base.fetch(self.createOrder(symbol, "market", "sell", cost, price = nothing, params = params))

end
"""
fetches information on an order made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#query-order-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Query-Order
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Single-Order
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-UM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-CM-Order
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-Algo-Order

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch an order in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch a trigger or conditional order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Binance, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    defaultType = safeString2(self.options, "fetchOrder", "defaultType", "spot");
    type_var = safeString(params, "type", defaultType);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOrder", params = params);
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchOrder", "papi", "portfolioMargin", defaultValue = false);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    isConditional = self.safeBoolN(params, ["stop", "trigger", "conditional"]);
    clientOrderId = safeStringN(params, ["origClientOrderId", "clientOrderId", "clientAlgoId"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        if functions.ccxtruthy(get(market, Symbol("option"), nothing))
            request[Symbol("clientOrderId")] = clientOrderId;
        elseif functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(get(market, Symbol("linear"), nothing), get(market, Symbol("swap"), nothing)), isConditional), !functions.ccxtruthy(isPortfolioMargin)))
            request[Symbol("clientAlgoId")] = clientOrderId;
        else
            request[Symbol("origClientOrderId")] = clientOrderId;
        end
    elseif functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(get(market, Symbol("linear"), nothing), get(market, Symbol("swap"), nothing)), isConditional), !functions.ccxtruthy(isPortfolioMargin)))
        request[Symbol("algoId")] = id;
    else
        request[Symbol("orderId")] = id;
    end
    params = omit(params, ["type", "clientOrderId", "origClientOrderId", "stop", "trigger", "conditional", "clientAlgoId"]);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPrivateGetOrder(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetUmOrder(extend(request, params)));
        else
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.fapiPrivateGetAlgoOrder(extend(request, params)));
            else
                response = Base.fetch(self.fapiPrivateGetOrder(extend(request, params)));
            end
        end
    else
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiGetCmOrder(extend(request, params)));
            else
                response = Base.fetch(self.dapiPrivateGetOrder(extend(request, params)));
            end
        elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((type_var == "margin"), (marginMode != nothing)), isPortfolioMargin))
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiGetMarginOrder(extend(request, params)));
            else
                if functions.ccxtruthy(marginMode == "isolated")
                    request[Symbol("isIsolated")] = true;
                end
                response = Base.fetch(self.sapiGetMarginOrder(extend(request, params)));
            end
        else
            response = Base.fetch(self.privateGetOrder(extend(request, params)));
        end

    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseOrder() returned empty response")));
    end
    return self.parseOrder(response, market = market)

end
"""
fetches information on multiple orders made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-All-Algo-Orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch orders in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch portfolio margin account trigger or conditional orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrders(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOrders", symbol = symbol, since = since, limit = limit, params = params))
    end
    market = self.market(symbol);
    defaultType = safeString2(self.options, "fetchOrders", "defaultType", get(market, Symbol("type"), nothing));
    type_var = safeString(params, "type", defaultType);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOrders", params = params);
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchOrders", "papi", "portfolioMargin", defaultValue = false);
    isConditional = self.safeBoolN(params, ["stop", "trigger", "conditional"]);
    params = omit(params, ["stop", "trigger", "conditional", "type"]);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPrivateGetHistoryOrders(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(isPortfolioMargin)
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.papiGetUmConditionalAllOrders(extend(request, params)));
            else
                response = Base.fetch(self.papiGetUmAllOrders(extend(request, params)));
            end
        else
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.fapiPrivateGetAllAlgoOrders(extend(request, params)));
            else
                response = Base.fetch(self.fapiPrivateGetAllOrders(extend(request, params)));
            end
        end
    else
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            if functions.ccxtruthy(isPortfolioMargin)
                if functions.ccxtruthy(isConditional)
                    response = Base.fetch(self.papiGetCmConditionalAllOrders(extend(request, params)));
                else
                    response = Base.fetch(self.papiGetCmAllOrders(extend(request, params)));
                end
            else
                response = Base.fetch(self.dapiPrivateGetAllOrders(extend(request, params)));
            end
        else
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiGetMarginAllOrders(extend(request, params)));
            elseif functions.ccxtruthy(@functions.ccxt_or(type_var == "margin", marginMode != nothing))
                if functions.ccxtruthy(marginMode == "isolated")
                    request[Symbol("isIsolated")] = true;
                end
                response = Base.fetch(self.sapiGetMarginAllOrders(extend(request, params)));
            else
                response = Base.fetch(self.privateGetAllOrders(extend(request, params)));
            end
        end

    end
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently open orders
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#current-open-orders-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Current-All-Open-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Current-All-Open-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Current-Open-Option-Orders
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Current-All-Algo-Open-Orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch open orders in the portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch portfolio margin account conditional orders
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    type_var = nothing;
    request = Dict{Symbol, Any}();
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOpenOrders", params = params);
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchOpenOrders", "papi", "portfolioMargin", defaultValue = false);
    isConditional = self.safeBoolN(params, ["stop", "trigger", "conditional"]);
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        defaultType = safeString2(self.options, "fetchOpenOrders", "defaultType", "spot");
        marketType = functions.ccxtruthy((ccxt_in("type", market))) ? get(market, Symbol("type"), nothing) : defaultType;
        type_var = safeString(params, "type", marketType);
    else
        warnWithoutSymbol = self.safeBool(get(self.options, Symbol("fetchOpenOrders"), nothing), "warnWithoutSymbol");
        optValue = self.safeBool(self.options, "warnOnFetchOpenOrdersWithoutSymbol");
        if functions.ccxtruthy(@functions.ccxt_or(optValue, (@functions.ccxt_and(optValue == nothing, warnWithoutSymbol))))
            throw(ExchangeError(string(self.id, " fetchOpenOrders() WARNING: fetching open orders without specifying a symbol has stricter rate limits (10 times more for spot, 40 times more for other markets) compared to requesting with symbol argument. To acknowledge this warning, set ", self.id, ".options[\"fetchOpenOrders\"][\"warnWithoutSymbol\"] = false to suppress this warning message.")));
        else
            defaultType = safeString2(self.options, "fetchOpenOrders", "defaultType", "spot");
            type_var = safeString(params, "type", defaultType);
        end
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchOpenOrders", market = market, params = params);
    params = omit(params, ["type", "stop", "trigger", "conditional"]);
    response = nothing;
    if functions.ccxtruthy(type_var == "option")
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.eapiPrivateGetOpenOrders(extend(request, params)));
    elseif functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.papiGetUmConditionalOpenOrders(extend(request, params)));
            else
                response = Base.fetch(self.papiGetUmOpenOrders(extend(request, params)));
            end
        else
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.fapiPrivateGetOpenAlgoOrders(extend(request, params)));
            else
                response = Base.fetch(self.fapiPrivateGetOpenOrders(extend(request, params)));
            end
        end
    else
        if functions.ccxtruthy(self.isInverse(type_var, subType = subType))
            if functions.ccxtruthy(isPortfolioMargin)
                if functions.ccxtruthy(isConditional)
                    response = Base.fetch(self.papiGetCmConditionalOpenOrders(extend(request, params)));
                else
                    response = Base.fetch(self.papiGetCmOpenOrders(extend(request, params)));
                end
            else
                if functions.ccxtruthy(isConditional)
                    response = Base.fetch(self.dapiPrivateGetOpenAlgoOrders(extend(request, params)));
                else
                    response = Base.fetch(self.dapiPrivateGetOpenOrders(extend(request, params)));
                end
            end
        elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(type_var == "margin", marginMode != nothing), isPortfolioMargin))
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiGetMarginOpenOrders(extend(request, params)));
            else
                if functions.ccxtruthy(marginMode == "isolated")
                    request[Symbol("isIsolated")] = true;
                    if functions.ccxtruthy(symbol == nothing)
                        throw(ArgumentsRequired(string(self.id, " fetchOpenOrders() requires a symbol argument for isolated markets")));
                    end
                end
                response = Base.fetch(self.sapiGetMarginOpenOrders(extend(request, params)));
            end
        else
            response = Base.fetch(self.privateGetOpenOrders(extend(request, params)));
        end

    end
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetch an open order by the id
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-Current-Open-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Query-Current-Open-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-UM-Open-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-UM-Open-Conditional-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-CM-Open-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-CM-Open-Conditional-Order

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::string, optional: set to true if you would like to fetch portfolio margin account stop or conditional orders
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch for a portfolio margin account

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrder(self::Binance, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOpenOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchOpenOrder", "papi", "portfolioMargin", defaultValue = false);
    isConditional = self.safeBoolN(params, ["stop", "trigger", "conditional"]);
    params = omit(params, ["stop", "trigger", "conditional"]);
    isPortfolioMarginConditional = (@functions.ccxt_and(isPortfolioMargin, isConditional));
    orderIdRequest = functions.ccxtruthy(isPortfolioMarginConditional) ? "strategyId" : "orderId";
    request[Symbol(orderIdRequest)] = id;
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(isPortfolioMargin)
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.papiGetUmConditionalOpenOrder(extend(request, params)));
            else
                response = Base.fetch(self.papiGetUmOpenOrder(extend(request, params)));
            end
        else
            response = Base.fetch(self.fapiPrivateGetOpenOrder(extend(request, params)));
        end
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        if functions.ccxtruthy(isPortfolioMargin)
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.papiGetCmConditionalOpenOrder(extend(request, params)));
            else
                response = Base.fetch(self.papiGetCmOpenOrder(extend(request, params)));
            end
        else
            response = Base.fetch(self.dapiPrivateGetOpenOrder(extend(request, params)));
        end
    else
        if functions.ccxtruthy(get(market, Symbol("option"), nothing))
            throw(NotSupported(string(self.id, " fetchOpenOrder() does not support option markets")));
        elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            throw(NotSupported(string(self.id, " fetchOpenOrder() does not support spot markets")));
        end
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseOrder() returned empty response")));
    end
    return self.parseOrder(response, market = market)

end
"""
fetches information on multiple closed orders made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch orders in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch portfolio margin account trigger or conditional orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchClosedOrders() requires a symbol argument")));
    end
    orders = Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = nothing, params = params));
    filteredOrders = filterBy(orders, "status", "closed");
    return self.filterBySinceLimit(filteredOrders, since = since, limit = limit)

end
"""
fetches information on multiple canceled orders made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders

# Arguments
- `symbol`::string: unified market symbol of the market the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch orders in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch portfolio margin account trigger or conditional orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchCanceledOrders() requires a symbol argument")));
    end
    orders = Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = nothing, params = params));
    filteredOrders = filterBy(orders, "status", "canceled");
    return self.filterBySinceLimit(filteredOrders, since = since, limit = limit)

end
"""
fetches information on multiple canceled orders made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders

# Arguments
- `symbol`::string: unified market symbol of the market the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch orders in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch portfolio margin account trigger or conditional orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledAndClosedOrders(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchCanceledAndClosedOrders() requires a symbol argument")));
    end
    orders = Base.fetch(self.fetchOrders(symbol = symbol, since = since, limit = nothing, params = params));
    canceledOrders = filterBy(orders, "status", "canceled");
    closedOrders = filterBy(orders, "status", "closed");
    filteredOrders = arrayConcat(canceledOrders, closedOrders);
    sortedOrders = sortBy(filteredOrders, "timestamp");
    return self.filterBySinceLimit(sortedOrders, since = since, limit = limit)

end
"""
cancels an open order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-order-trade
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Cancel-Order
see: https://developers.binance.com/docs/derivatives/option/trade/Cancel-Option-Order
see: https://developers.binance.com/docs/margin_trading/trade/Margin-Account-Cancel-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-UM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-CM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-UM-Conditional-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-CM-Conditional-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-Margin-Account-Order
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-Algo-Order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to cancel an order in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to cancel a portfolio margin account conditional order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Binance, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    defaultType = safeString2(self.options, "cancelOrder", "defaultType", "spot");
    type_var = safeString(params, "type", defaultType);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("cancelOrder", params = params);
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "cancelOrder", "papi", "portfolioMargin", defaultValue = false);
    isConditional = self.safeBoolN(params, ["stop", "trigger", "conditional"]);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeStringN(params, ["origClientOrderId", "clientOrderId", "newClientStrategyId", "clientAlgoId"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        if functions.ccxtruthy(get(market, Symbol("option"), nothing))
            request[Symbol("clientOrderId")] = clientOrderId;
        elseif functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(get(market, Symbol("swap"), nothing), isConditional), !functions.ccxtruthy(isPortfolioMargin)))
            request[Symbol("clientAlgoId")] = clientOrderId;
        else
            if functions.ccxtruthy(@functions.ccxt_and(isPortfolioMargin, isConditional))
                request[Symbol("newClientStrategyId")] = clientOrderId;
            else
                request[Symbol("origClientOrderId")] = clientOrderId;
            end
        end
    else
        if functions.ccxtruthy(@functions.ccxt_and(isPortfolioMargin, isConditional))
            request[Symbol("strategyId")] = id;
        elseif functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(get(market, Symbol("swap"), nothing), isConditional), !functions.ccxtruthy(isPortfolioMargin)))
            request[Symbol("algoId")] = id;
        else
            request[Symbol("orderId")] = id;
        end
    end
    params = omit(params, ["type", "origClientOrderId", "clientOrderId", "newClientStrategyId", "stop", "trigger", "conditional", "clientAlgoId"]);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPrivateDeleteOrder(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(isPortfolioMargin)
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.papiDeleteUmConditionalOrder(extend(request, params)));
            else
                response = Base.fetch(self.papiDeleteUmOrder(extend(request, params)));
            end
        else
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.fapiPrivateDeleteAlgoOrder(extend(request, params)));
            else
                response = Base.fetch(self.fapiPrivateDeleteOrder(extend(request, params)));
            end
        end
    else
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            if functions.ccxtruthy(isPortfolioMargin)
                if functions.ccxtruthy(isConditional)
                    response = Base.fetch(self.papiDeleteCmConditionalOrder(extend(request, params)));
                else
                    response = Base.fetch(self.papiDeleteCmOrder(extend(request, params)));
                end
            else
                if functions.ccxtruthy(isConditional)
                    response = Base.fetch(self.dapiPrivateDeleteAlgoOrder(extend(request, params)));
                else
                    response = Base.fetch(self.dapiPrivateDeleteOrder(extend(request, params)));
                end
            end
        elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((type_var == "margin"), (marginMode != nothing)), isPortfolioMargin))
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiDeleteMarginOrder(extend(request, params)));
            else
                if functions.ccxtruthy(marginMode == "isolated")
                    request[Symbol("isIsolated")] = true;
                end
                response = Base.fetch(self.sapiDeleteMarginOrder(extend(request, params)));
            end
        else
            response = Base.fetch(self.privateDeleteOrder(extend(request, params)));
        end

    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseOrder() returned empty response")));
    end
    return self.parseOrder(response, market = market)

end
"""
cancel all open orders in a market
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-all-open-orders-on-a-symbol-trade
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-All-Open-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Cancel-All-Open-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Cancel-all-Option-orders-on-specific-symbol
see: https://developers.binance.com/docs/margin_trading/trade/Margin-Account-Cancel-All-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-UM-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-UM-Open-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-CM-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-CM-Open-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-Margin-Account-All-Open-Orders-on-a-Symbol
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-All-Algo-Open-Orders

# Arguments
- `symbol`::string: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.portfolioMargin`::bool, optional: set to true if you would like to cancel orders in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to cancel portfolio margin account conditional orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Binance; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "cancelAllOrders", "papi", "portfolioMargin", defaultValue = false);
    isConditional = self.safeBoolN(params, ["stop", "trigger", "conditional"]);
    type_var = safeString(params, "type", get(market, Symbol("type"), nothing));
    params = omit(params, ["type", "stop", "trigger", "conditional"]);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("cancelAllOrders", params = params);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPrivateDeleteAllOpenOrders(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(isPortfolioMargin)
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.papiDeleteUmConditionalAllOpenOrders(extend(request, params)));
            else
                response = Base.fetch(self.papiDeleteUmAllOpenOrders(extend(request, params)));
            end
        else
            if functions.ccxtruthy(isConditional)
                response = Base.fetch(self.fapiPrivateDeleteAlgoOpenOrders(extend(request, params)));
            else
                response = Base.fetch(self.fapiPrivateDeleteAllOpenOrders(extend(request, params)));
            end
        end
    else
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            if functions.ccxtruthy(isPortfolioMargin)
                if functions.ccxtruthy(isConditional)
                    response = Base.fetch(self.papiDeleteCmConditionalAllOpenOrders(extend(request, params)));
                else
                    response = Base.fetch(self.papiDeleteCmAllOpenOrders(extend(request, params)));
                end
            else
                response = Base.fetch(self.dapiPrivateDeleteAllOpenOrders(extend(request, params)));
            end
        elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((type_var == "margin"), (marginMode != nothing)), isPortfolioMargin))
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiDeleteMarginAllOpenOrders(extend(request, params)));
            else
                if functions.ccxtruthy(marginMode == "isolated")
                    request[Symbol("isIsolated")] = true;
                end
                response = Base.fetch(self.sapiDeleteMarginOpenOrders(extend(request, params)));
            end
        else
            response = Base.fetch(self.privateDeleteOpenOrders(extend(request, params)));
        end

    end
    if functions.ccxtruthy(functions.ccxt_isArray(response))
            return self.parseOrders(response, market = market)
    else
        order = self.safeOrder(Dict{Symbol, Any}(
            Symbol("info") => response
        ));
        return [order]
    end

end
"""
cancel multiple orders
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-Multiple-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Cancel-Multiple-Orders

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: alternative to ids, array of client order ids EXCHANGE SPECIFIC PARAMETERS
- `params.origClientOrderIdList`::array, optional: max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
- `params.recvWindow`::array, optional:

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Binance, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " cancelOrders is only supported for swap markets.")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    origClientOrderIdList = self.safeList2(params, "origClientOrderIdList", "clientOrderIds");
    if functions.ccxtruthy(origClientOrderIdList != nothing)
        params = omit(params, ["clientOrderIds"]);
        request[Symbol("origClientOrderIdList")] = origClientOrderIdList;
    else
        request[Symbol("orderidlist")] = ids;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.fapiPrivateDeleteBatchOrders(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.dapiPrivateDeleteBatchOrders(extend(request, params)));
    end
    return self.parseOrders(response, market = market)

end
"""
fetch all the trades made from a single order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/account-endpoints#account-trade-list-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Account-Trade-List
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Account-Trade-List
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Trade-List

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Binance, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrderTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    type_var = safeString(params, "type", get(market, Symbol("type"), nothing));
    params = omit(params, "type");
    if functions.ccxtruthy(type_var != "spot")
        throw(NotSupported(string(self.id, " fetchOrderTrades() supports spot markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    return Base.fetch(self.fetchMyTrades(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetch all trades made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/account-endpoints#account-trade-list-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Account-Trade-List
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Account-Trade-List
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Trade-List
see: https://developers.binance.com/docs/derivatives/option/trade/Account-Trade-List
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/UM-Account-Trade-List
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/CM-Account-Trade-List

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch trades for a portfolio margin account

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    type_var = nothing;
    marginMode = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    (type_var, params) = self.handleMarketTypeAndParams("fetchMyTrades", market = market, params = params);
    endTime = safeInteger2(params, "until", "endTime");
    if functions.ccxtruthy(since != nothing)
        startTime = since;
        request[Symbol("startTime")] = startTime;
        currentTimestamp = milliseconds();
        oneWeek = 7 * 24 * 60 * 60 * 1000;
        if functions.ccxtruthy(functions.ccxt_ge((currentTimestamp - startTime), oneWeek))
            if functions.ccxtruthy(@functions.ccxt_and((endTime == nothing), self.safeBool(market, "linear")))
                endTime = self.sum(startTime, oneWeek);
                endTimeValue = functions.ccxtruthy((endTime == nothing)) ? 0 : endTime;
                endTime = min(endTimeValue, currentTimestamp);
            end
        end
    end
    if functions.ccxtruthy(endTime != nothing)
        request[Symbol("endTime")] = endTime;
        params = omit(params, ["endTime", "until"]);
    end
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(@functions.ccxt_or((type_var == "option"), self.safeBool(market, "contract")))
            limit = min(limit, 1000);
        end
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(type_var == "option")
        response = Base.fetch(self.eapiPrivateGetUserTrades(extend(request, params)));
    else
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
        end
        (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params = params);
        isPortfolioMargin = nothing;
        (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchMyTrades", "papi", "portfolioMargin", defaultValue = false);
        if functions.ccxtruthy(@functions.ccxt_or(type_var == "spot", type_var == "margin"))
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiGetMarginMyTrades(extend(request, params)));
            elseif functions.ccxtruthy(@functions.ccxt_or((type_var == "margin"), (marginMode != nothing)))
                if functions.ccxtruthy(marginMode == "isolated")
                    request[Symbol("isIsolated")] = true;
                end
                response = Base.fetch(self.sapiGetMarginMyTrades(extend(request, params)));
            else
                response = Base.fetch(self.privateGetMyTrades(extend(request, params)));
            end
        elseif functions.ccxtruthy(self.safeBool(market, "linear"))
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiGetUmUserTrades(extend(request, params)));
            else
                response = Base.fetch(self.fapiPrivateGetUserTrades(extend(request, params)));
            end
        else
            if functions.ccxtruthy(self.safeBool(market, "inverse"))
                if functions.ccxtruthy(isPortfolioMargin)
                    response = Base.fetch(self.papiGetCmUserTrades(extend(request, params)));
                else
                    response = Base.fetch(self.dapiPrivateGetUserTrades(extend(request, params)));
                end
            end

        end
    end
    responseList = [];
    if functions.ccxtruthy(response != nothing)
        responseList = toArray(response);
    end
    return self.parseTrades(responseList, market = market, since = since, limit = limit)

end
"""
fetch all dust trades made by the user
see: https://developers.binance.com/docs/wallet/asset/dust-log

# Arguments
- `symbol`::string: not used by fetchMyDustTrades ()
- `since`::int, optional: the earliest time in ms to fetch my dust trades for
- `limit`::int, optional: the maximum number of dust trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'margin', default spot

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyDustTrades(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
        request[Symbol("endTime")] = self.sum(since, 7776000000);
    end
    accountType = safeStringUpper(params, "type");
    params = omit(params, "type");
    if functions.ccxtruthy(accountType != nothing)
        request[Symbol("accountType")] = accountType;
    end
    response = Base.fetch(self.sapiGetAssetDribblet(extend(request, params)));
    results = self.safeList(response, "userAssetDribblets", defaultValue = []);
    rows = safeInteger(response, "total", 0);
    data = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, rows))
        logs = self.safeList(get(results, i + 1, nothing), "userAssetDribbletDetails", defaultValue = []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(logs)))
            logs[j + 1][Symbol("isDustTrade")] = true;
            push!(data, get(logs, j + 1, nothing));
            j += 1
        end
        i += 1
    end
    trades = self.parseTrades(data, market = nothing, since = since, limit = limit);
    return self.filterBySinceLimit(trades, since = since, limit = limit)

end
function parseDustTrade(self::Binance, trade; market=nothing)
    orderId = safeString(trade, "transId");
    timestamp = safeInteger(trade, "operateTime");
    currencyId = safeString(trade, "fromAsset");
    tradedCurrency = self.safeCurrencyCode(currencyId);
    bnb = self.currency("BNB");
    earnedCurrency = get(bnb, Symbol("code"), nothing);
    applicantSymbol = string(earnedCurrency, "/", tradedCurrency);
    tradedCurrencyIsQuote = false;
    if functions.ccxtruthy(@functions.ccxt_and((self.markets != nothing), (ccxt_in(applicantSymbol, self.markets))))
        tradedCurrencyIsQuote = true;
    end
    feeCostString = safeString(trade, "serviceChargeAmount");
    fee = Dict{Symbol, Any}(
        Symbol("currency") => earnedCurrency,
        Symbol("cost") => self.parseNumber(feeCostString)
    );
    symbol = nothing;
    amountString = nothing;
    costString = nothing;
    side = nothing;
    if functions.ccxtruthy(tradedCurrencyIsQuote)
        symbol = applicantSymbol;
        amountString = safeString(trade, "transferedAmount");
        costString = safeString(trade, "amount");
        side = "buy";
    else
        symbol = string(tradedCurrency, "/", earnedCurrency);
        amountString = safeString(trade, "amount");
        costString = safeString(trade, "transferedAmount");
        side = "sell";
    end
    priceString = nothing;
    if functions.ccxtruthy(costString != nothing)
        if functions.ccxtruthy(amountString)
            priceString = stringDiv(costString, amountString);
        end
    end
    id = nothing;
    amount = self.parseNumber(amountString);
    price = self.parseNumber(priceString);
    cost = self.parseNumber(costString);
    type_var = nothing;
    takerOrMaker = nothing;
    return Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => orderId,
    Symbol("type") => type_var,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("amount") => amount,
    Symbol("price") => price,
    Symbol("cost") => cost,
    Symbol("fee") => fee,
    Symbol("info") => trade
)

end
"""
fetch all deposits made to an account
see: https://developers.binance.com/docs/wallet/capital/deposite-history
see: https://developers.binance.com/docs/fiat/rest-api/Get-Fiat-Deposit-Withdraw-History

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fiat`::bool, optional: if true, only fiat deposits will be returned
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Binance; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDeposits", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchDeposits", symbol = code, since = since, limit = limit, params = params))
    end
    currency = nothing;
    response = nothing;
    request = Dict{Symbol, Any}();
    legalMoney = self.safeDict(self.options, "legalMoney", defaultValue = Dict{Symbol, Any}());
    fiatOnly = self.safeBool(params, "fiat", defaultValue = false);
    params = omit(params, "fiatOnly");
    until = safeInteger(params, "until");
    params = omit(params, "until");
    if functions.ccxtruthy(@functions.ccxt_or(fiatOnly, (@functions.ccxt_and((code != nothing), (ccxt_in(code, legalMoney))))))
        if functions.ccxtruthy(code != nothing)
            currency = self.currency(code);
        end
        request[Symbol("transactionType")] = 0;
        if functions.ccxtruthy(since != nothing)
            request[Symbol("beginTime")] = since;
        end
        if functions.ccxtruthy(until != nothing)
            request[Symbol("endTime")] = until;
        end
        raw = Base.fetch(self.sapiGetFiatOrders(extend(request, params)));
        response = self.safeList(raw, "data", defaultValue = []);
    else
        if functions.ccxtruthy(code != nothing)
            currency = self.currency(code);
            request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
            endTime = self.sum(since, 7776000000);
            if functions.ccxtruthy(until != nothing)
                endTime = min(endTime, until);
            end
            request[Symbol("endTime")] = endTime;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.sapiGetCapitalDepositHisrec(extend(request, params)));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " method() returned empty response")));
    end
    responseList = [];
    if functions.ccxtruthy(response != nothing)
        responseList = toArray(response);
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(responseList)))
        responseList[i + 1][Symbol("type")] = "deposit";
        i += 1
    end
    return self.parseTransactions(responseList, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://developers.binance.com/docs/wallet/capital/withdraw-history
see: https://developers.binance.com/docs/fiat/rest-api/Get-Fiat-Deposit-Withdraw-History

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fiat`::bool, optional: if true, only fiat withdrawals will be returned
- `params.until`::int, optional: the latest time in ms to fetch withdrawals for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Binance; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchWithdrawals", symbol = code, since = since, limit = limit, params = params))
    end
    legalMoney = self.safeDict(self.options, "legalMoney", defaultValue = Dict{Symbol, Any}());
    fiatOnly = self.safeBool(params, "fiat", defaultValue = false);
    params = omit(params, "fiatOnly");
    request = Dict{Symbol, Any}();
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("endTime")] = until;
    end
    response = nothing;
    currency = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(fiatOnly, (@functions.ccxt_and((code != nothing), (ccxt_in(code, legalMoney))))))
        if functions.ccxtruthy(code != nothing)
            currency = self.currency(code);
        end
        request[Symbol("transactionType")] = 1;
        if functions.ccxtruthy(since != nothing)
            request[Symbol("beginTime")] = since;
        end
        raw = Base.fetch(self.sapiGetFiatOrders(extend(request, params)));
        response = self.safeList(raw, "data", defaultValue = []);
    else
        if functions.ccxtruthy(code != nothing)
            currency = self.currency(code);
            request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
            request[Symbol("endTime")] = self.sum(since, 7776000000);
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.sapiGetCapitalWithdrawHistory(extend(request, params)));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " method() returned empty response")));
    end
    if functions.ccxtruthy(isa(response, AbstractString))
        response = self.parseJson(response);
    end
    responseList = [];
    if functions.ccxtruthy(response != nothing)
        responseList = toArray(response);
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(responseList)))
        responseList[i + 1][Symbol("type")] = "withdrawal";
        i += 1
    end
    return self.parseTransactions(responseList, currency = currency, since = since, limit = limit)

end
function parseTransactionStatusByType(self::Binance, status; type_var=nothing)
    if functions.ccxtruthy(type_var == nothing)
            return status
    end
    statusesByType = Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("0") => "pending",
            Symbol("1") => "ok",
            Symbol("6") => "ok",
            Symbol("Processing") => "pending",
            Symbol("Failed") => "failed",
            Symbol("Successful") => "ok",
            Symbol("Refunding") => "canceled",
            Symbol("Refunded") => "canceled",
            Symbol("Refund Failed") => "failed"
        ),
        Symbol("withdrawal") => Dict{Symbol, Any}(
            Symbol("0") => "pending",
            Symbol("1") => "canceled",
            Symbol("2") => "pending",
            Symbol("3") => "failed",
            Symbol("4") => "pending",
            Symbol("5") => "failed",
            Symbol("6") => "ok",
            Symbol("Processing") => "pending",
            Symbol("Failed") => "failed",
            Symbol("Successful") => "ok",
            Symbol("Refunding") => "canceled",
            Symbol("Refunded") => "canceled",
            Symbol("Refund Failed") => "failed"
        )
    );
    statuses = self.safeDict(statusesByType, type_var, defaultValue = Dict{Symbol, Any}());
    return safeString(statuses, status, status)

end
function parseTransaction(self::Binance, transaction; currency=nothing)
    id = safeString2(transaction, "id", "orderNo");
    address = safeString(transaction, "address");
    tag = safeString(transaction, "addressTag");
    if functions.ccxtruthy(tag != nothing)
        if functions.ccxtruthy(functions.ccxt_lt(length(tag), 1))
            tag = nothing;
        end
    end
    txid = safeString(transaction, "txId");
    if functions.ccxtruthy(@functions.ccxt_and((txid != nothing), (findfirst("Internal transfer ", txid) !== nothing)))
        txid = functions.ccxt_slice(txid, 18);
    end
    currencyId = safeString2(transaction, "coin", "fiatCurrency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = nothing;
    timestamp = safeInteger2(transaction, "insertTime", "createTime");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = self.parse8601(safeString(transaction, "applyTime"));
    end
    updated = safeInteger2(transaction, "successTime", "updateTime");
    type_var = safeString(transaction, "type");
    if functions.ccxtruthy(type_var == nothing)
        txType = safeString(transaction, "transactionType");
        if functions.ccxtruthy(txType != nothing)
            type_var = functions.ccxtruthy((txType == "0")) ? "deposit" : "withdrawal";
        end
        legalMoneyCurrenciesById = self.safeDict(self.options, "legalMoneyCurrenciesById");
        code = safeString(legalMoneyCurrenciesById, code, code);
    end
    status = self.parseTransactionStatusByType(safeString(transaction, "status"), type_var = type_var);
    amount = self.safeNumber(transaction, "amount");
    feeCost = self.safeNumber2(transaction, "transactionFee", "totalFee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => code,
            Symbol("cost") => feeCost
        );
    end
    internalInteger = safeInteger(transaction, "transferType");
    internal = nothing;
    if functions.ccxtruthy(internalInteger != nothing)
        internal = functions.ccxtruthy((internalInteger != 0)) ? true : false;
    end
    networkId = safeString(transaction, "network");
    network = self.networkIdToCode(networkId = networkId, currencyCode = code);
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => network,
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("internal") => internal,
    Symbol("comment") => nothing,
    Symbol("fee") => fee
)

end
function parseTransferStatus(self::Binance, status)
    statuses = Dict{Symbol, Any}(
        Symbol("CONFIRMED") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransfer(self::Binance, transfer; currency=nothing)
    id = safeString2(transfer, "tranId", "transactionId");
    currencyId = safeString2(transfer, "asset", "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    amount = self.safeNumber(transfer, "amount");
    type_var = safeString(transfer, "type");
    fromAccount = nothing;
    toAccount = nothing;
    accountsById = self.safeDict(self.options, "accountsById", defaultValue = Dict{Symbol, Any}());
    if functions.ccxtruthy(type_var != nothing)
        parts = split(type_var, "_");
        fromAccount = safeValue(parts, 0);
        toAccount = safeValue(parts, 1);
        fromAccount = safeString(accountsById, fromAccount, fromAccount);
        toAccount = safeString(accountsById, toAccount, toAccount);
    end
    walletType = safeInteger(transfer, "walletType");
    if functions.ccxtruthy(walletType != nothing)
        payer = self.safeDict(transfer, "payerInfo", defaultValue = Dict{Symbol, Any}());
        receiver = self.safeDict(transfer, "receiverInfo", defaultValue = Dict{Symbol, Any}());
        fromAccount = safeString(payer, "accountId");
        toAccount = safeString(receiver, "accountId");
    end
    timestamp = safeInteger2(transfer, "timestamp", "transactionTime");
    status = self.parseTransferStatus(safeString(transfer, "status"));
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => status
)

end
function parseIncome(self::Binance, income; market=nothing)
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
    Symbol("amount") => self.safeNumber(income, "income")
)

end
"""
transfer currency internally between wallets on the same account
see: https://developers.binance.com/docs/wallet/asset/user-universal-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: exchange specific transfer type
- `params.symbol`::string, optional: the unified symbol, required for isolated margin transfers

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Binance, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    request[Symbol("type")] = safeString(params, "type");
    params = omit(params, "type");
    if functions.ccxtruthy(get(request, Symbol("type"), nothing) == nothing)
        symbol = safeString(params, "symbol");
        market = nothing;
        if functions.ccxtruthy(symbol != nothing)
            market = self.market(symbol);
            params = omit(params, "symbol");
        end
        fromId = uppercase(self.convertTypeToAccount(fromAccount));
        toId = uppercase(self.convertTypeToAccount(toAccount));
        isolatedSymbol = nothing;
        if functions.ccxtruthy(market != nothing)
            isolatedSymbol = get(market, Symbol("id"), nothing);
        end
        if functions.ccxtruthy(fromId == "ISOLATED")
            if functions.ccxtruthy(symbol == nothing)
                throw(ArgumentsRequired(string(self.id, " transfer () requires params[\"symbol\"] when fromAccount is ", fromAccount)));
            end
        end
        if functions.ccxtruthy(toId == "ISOLATED")
            if functions.ccxtruthy(symbol == nothing)
                throw(ArgumentsRequired(string(self.id, " transfer () requires params[\"symbol\"] when toAccount is ", toAccount)));
            end
        end
        accountsById = self.safeDict(self.options, "accountsById", defaultValue = Dict{Symbol, Any}());
        fromIsolated = !functions.ccxtruthy((ccxt_in(fromId, accountsById)));
        toIsolated = !functions.ccxtruthy((ccxt_in(toId, accountsById)));
        if functions.ccxtruthy(@functions.ccxt_and(fromIsolated, (market == nothing)))
            isolatedSymbol = fromId;
        end
        if functions.ccxtruthy(@functions.ccxt_and(toIsolated, (market == nothing)))
            isolatedSymbol = toId;
        end
        if functions.ccxtruthy(@functions.ccxt_or(fromIsolated, toIsolated))
            fromFuture = @functions.ccxt_or(fromId == "UMFUTURE", fromId == "CMFUTURE");
            toFuture = @functions.ccxt_or(toId == "UMFUTURE", toId == "CMFUTURE");
            fromSpot = fromId == "MAIN";
            toSpot = toId == "MAIN";
            funding = @functions.ccxt_or(fromId == "FUNDING", toId == "FUNDING");
            option = @functions.ccxt_or(fromId == "OPTION", toId == "OPTION");
            prohibitedWithIsolated = @functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(fromFuture, toFuture), funding), option);
            if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(fromIsolated, toIsolated)), prohibitedWithIsolated))
                throw(BadRequest(string(self.id, " transfer () does not allow transfers between ", fromAccount, " and ", toAccount)));
            elseif functions.ccxtruthy(@functions.ccxt_and(toSpot, fromIsolated))
                fromId = "ISOLATED_MARGIN";
                request[Symbol("fromSymbol")] = isolatedSymbol;
            else
                if functions.ccxtruthy(@functions.ccxt_and(fromSpot, toIsolated))
                    toId = "ISOLATED_MARGIN";
                    request[Symbol("toSymbol")] = isolatedSymbol;
                else
                    if functions.ccxtruthy(@functions.ccxt_and(fromIsolated, toIsolated))
                        request[Symbol("fromSymbol")] = fromId;
                        request[Symbol("toSymbol")] = toId;
                        fromId = "ISOLATEDMARGIN";
                        toId = "ISOLATEDMARGIN";
                    else
                        if functions.ccxtruthy(fromIsolated)
                            request[Symbol("fromSymbol")] = isolatedSymbol;
                            fromId = "ISOLATEDMARGIN";
                        end
                        if functions.ccxtruthy(toIsolated)
                            request[Symbol("toSymbol")] = isolatedSymbol;
                            toId = "ISOLATEDMARGIN";
                        end
                    end
                end

            end
            request[Symbol("type")] = string(fromId, "_", toId);
        else
            request[Symbol("type")] = string(fromId, "_", toId);
        end
    end
    response = Base.fetch(self.sapiPostAssetTransfer(extend(request, params)));
    return self.parseTransfer(response, currency = currency)

end
"""
fetch a history of internal transfers made on an account
see: https://developers.binance.com/docs/wallet/asset/query-user-universal-transfer

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch transfers for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.internal`::bool, optional: default false, when true will fetch pay trade history

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Binance; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    internal = self.safeBool(params, "internal");
    params = omit(params, "internal");
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate");
    if functions.ccxtruthy(@functions.ccxt_and(paginate, !functions.ccxtruthy(internal)))
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTransfers", symbol = code, since = since, limit = limit, params = params))
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}();
    limitKey = "limit";
    if functions.ccxtruthy(!functions.ccxtruthy(internal))
        defaultType = safeString2(self.options, "fetchTransfers", "defaultType", "spot");
        fromAccount = safeString(params, "fromAccount", defaultType);
        defaultTo = functions.ccxtruthy((fromAccount == "future")) ? "spot" : "future";
        toAccount = safeString(params, "toAccount", defaultTo);
        type_var = safeString(params, "type");
        accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
        fromId = safeString(accountsByType, fromAccount);
        toId = safeString(accountsByType, toAccount);
        if functions.ccxtruthy(type_var == nothing)
            if functions.ccxtruthy(fromId == nothing)
                keys_var = objectKeys(accountsByType);
                throw(ExchangeError(string(self.id, " fromAccount parameter must be one of ", join(keys_var, ", "))));
            end
            if functions.ccxtruthy(toId == nothing)
                keys_var = objectKeys(accountsByType);
                throw(ExchangeError(string(self.id, " toAccount parameter must be one of ", join(keys_var, ", "))));
            end
            type_var = string(fromId, "_", toId);
        end
        request[Symbol("type")] = type_var;
        limitKey = "size";
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol(limitKey)] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("endTime")] = until;
    end
    response = nothing;
    if functions.ccxtruthy(internal)
        response = Base.fetch(self.sapiGetPayTransactions(extend(request, params)));
    else
        response = Base.fetch(self.sapiGetAssetTransfer(extend(request, params)));
    end
    rows = self.safeList2(response, "rows", "data", defaultValue = []);
    return self.parseTransfers(rows, currency = currency, since = since, limit = limit)

end
"""
fetch the deposit address for a currency associated with this account
see: https://developers.binance.com/docs/wallet/capital/deposite-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: network for fetch deposit address

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Binance, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("network")] = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
    end
    response = Base.fetch(self.sapiGetCapitalDepositAddress(extend(request, params)));
    return self.parseDepositAddress(response, currency = currency)

end
function parseDepositAddress(self::Binance, response; currency=nothing)
    url = safeString(response, "url");
    address = safeString(response, "address");
    currencyId = safeString(response, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    networkCode = self.getNetworkCodeByNetworkUrl(code, depositUrl = url);
    tag = safeString(response, "tag", "");
    if functions.ccxtruthy(length(tag) == 0)
        tag = nothing;
    end
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => code,
    Symbol("network") => networkCode,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
please use fetchDepositWithdrawFees instead
see: https://developers.binance.com/docs/wallet/capital/all-coins-info

# Arguments
- `codes`::any: not used by fetchTransactionFees ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTransactionFees(self::Binance; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.sapiGetCapitalConfigGetall(params));
    withdrawFees = Dict{Symbol, Any}();
    coins = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(coins)))
        entry = get(coins, i + 1, nothing);
        currencyId = safeString(entry, "coin");
        code = self.safeCurrencyCode(currencyId);
        networkList = self.safeList(entry, "networkList", defaultValue = []);
        if functions.ccxtruthy(code != nothing)
            withdrawFees[Symbol(code)] = Dict{Symbol, Any}();
        end
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(networkList)))
            networkEntry = get(networkList, j + 1, nothing);
            networkId = safeString(networkEntry, "network");
            networkCode = self.safeCurrencyCode(networkId);
            fee = self.safeNumber(networkEntry, "withdrawFee");
            if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (networkCode != nothing)))
                withdrawFees[Symbol(code)][Symbol(networkCode)] = fee;
            end
            j += 1
        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("withdraw") => withdrawFees,
    Symbol("deposit") => Dict{Symbol, Any}(),
    Symbol("info") => response
)

end
"""
fetch deposit and withdraw fees
see: https://developers.binance.com/docs/wallet/capital/all-coins-info

# Arguments
- `codes`::any: not used by fetchDepositWithdrawFees ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Binance; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.sapiGetCapitalConfigGetall(params));
    return self.parseDepositWithdrawFees(response, codes = codes, currencyIdKey = "coin")

end
function parseDepositWithdrawFee(self::Binance, fee; currency=nothing)
    code = safeString(currency, "code");
    networkList = self.safeList(fee, "networkList", defaultValue = []);
    result = self.depositWithdrawFee(fee);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networkList)))
        networkEntry = get(networkList, j + 1, nothing);
        networkId = safeString(networkEntry, "network");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        withdrawFee = self.safeNumber(networkEntry, "withdrawFee");
        isDefault = self.safeBool(networkEntry, "isDefault");
        if functions.ccxtruthy(isDefault)
            result[Symbol("withdraw")] = Dict{Symbol, Any}(
                Symbol("fee") => withdrawFee,
                Symbol("percentage") => nothing
            );
        end
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
make a withdrawal
see: https://developers.binance.com/docs/wallet/capital/withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Binance, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("addressTag")] = tag;
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("network")] = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
    end
    request[Symbol("amount")] = self.currencyToPrecision(get(currency, Symbol("code"), nothing), amount, networkCode = networkCode);
    response = Base.fetch(self.sapiPostCapitalWithdrawApply(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function parseTradingFee(self::Binance, fee; market=nothing)
    marketId = safeString(fee, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "spot");
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber2(fee, "makerCommission", "makerCommissionRate"),
    Symbol("taker") => self.safeNumber2(fee, "takerCommission", "takerCommissionRate"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
"""
fetch the trading fees for a market
see: https://developers.binance.com/docs/wallet/asset/trade-fee
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/User-Commission-Rate
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/User-Commission-Rate
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-User-Commission-Rate-for-UM
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-User-Commission-Rate-for-CM

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch trading fees in a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Binance, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    type_var = get(market, Symbol("type"), nothing);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchTradingFee", market = market, params = params);
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchTradingFee", "papi", "portfolioMargin", defaultValue = false);
    isLinear = self.isLinear(type_var, subType = subType);
    isInverse = self.isInverse(type_var, subType = subType);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(isLinear)
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetUmCommissionRate(extend(request, params)));
        else
            response = Base.fetch(self.fapiPrivateGetCommissionRate(extend(request, params)));
        end
    elseif functions.ccxtruthy(isInverse)
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetCmCommissionRate(extend(request, params)));
        else
            response = Base.fetch(self.dapiPrivateGetCommissionRate(extend(request, params)));
        end
    else
        response = Base.fetch(self.sapiGetAssetTradeFee(extend(request, params)));
    end
    data = response;
    if functions.ccxtruthy(functions.ccxt_isArray(data))
        data = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    end
    if functions.ccxtruthy(data == nothing)
        throw(NullResponse(string(self.id, " parseTradingFee() returned empty response")));
    end
    return self.parseTradingFee(data, market = market)

end
"""
fetch the trading fees for multiple markets
see: https://developers.binance.com/docs/wallet/asset/trade-fee
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Config

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Binance; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTradingFees", market = nothing, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchTradingFees", market = nothing, params = params, defaultValue = "linear");
    isSpotOrMargin = @functions.ccxt_or((type_var == "spot"), (type_var == "margin"));
    isLinear = self.isLinear(type_var, subType = subType);
    isInverse = self.isInverse(type_var, subType = subType);
    response = nothing;
    if functions.ccxtruthy(isSpotOrMargin)
        response = Base.fetch(self.sapiGetAssetTradeFee(params));
    elseif functions.ccxtruthy(isLinear)
        response = Base.fetch(self.fapiPrivateGetAccountConfig(params));
    else
        if functions.ccxtruthy(isInverse)
            response = Base.fetch(self.dapiPrivateGetAccount(params));
        end

    end
    if functions.ccxtruthy(isSpotOrMargin)
        result = Dict{Symbol, Any}();
        if functions.ccxtruthy(response == nothing)
            throw(NullResponse(string(self.id, " method() returned empty response")));
        end
        fees = toArray(response);
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
    elseif functions.ccxtruthy(isLinear)
        markets = self.markets;
        if functions.ccxtruthy(markets == nothing)
            throw(ExchangeError(string(self.id, " markets not loaded")));
        end
        symbols = objectKeys(markets);
        result = Dict{Symbol, Any}();
        feeTier = safeInteger(response, "feeTier");
        feeTiers = get(get(get(self.fees, Symbol("linear"), nothing), Symbol("trading"), nothing), Symbol("tiers"), nothing);
        maker = get(get(get(feeTiers, Symbol("maker"), nothing), feeTier + 1, nothing), 2, nothing);
        taker = get(get(get(feeTiers, Symbol("taker"), nothing), feeTier + 1, nothing), 2, nothing);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            symbol = get(symbols, i + 1, nothing);
            market = get(markets, Symbol(symbol), nothing);
            if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
                result[Symbol(symbol)] = Dict{Symbol, Any}(
                    Symbol("info") => Dict{Symbol, Any}(
                        Symbol("feeTier") => feeTier
                    ),
                    Symbol("symbol") => symbol,
                    Symbol("maker") => maker,
                    Symbol("taker") => taker
                );
            end
            i += 1
        end
        return result
    else
        if functions.ccxtruthy(isInverse)
            markets = self.markets;
            if functions.ccxtruthy(markets == nothing)
                throw(ExchangeError(string(self.id, " markets not loaded")));
            end
            symbols = objectKeys(markets);
            result = Dict{Symbol, Any}();
            feeTier = safeInteger(response, "feeTier");
            feeTiers = get(get(get(self.fees, Symbol("inverse"), nothing), Symbol("trading"), nothing), Symbol("tiers"), nothing);
            maker = get(get(get(feeTiers, Symbol("maker"), nothing), feeTier + 1, nothing), 2, nothing);
            taker = get(get(get(feeTiers, Symbol("taker"), nothing), feeTier + 1, nothing), 2, nothing);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
                symbol = get(symbols, i + 1, nothing);
                market = get(markets, Symbol(symbol), nothing);
                if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
                    result[Symbol(symbol)] = Dict{Symbol, Any}(
                        Symbol("info") => Dict{Symbol, Any}(
                            Symbol("feeTier") => feeTier
                        ),
                        Symbol("symbol") => symbol,
                        Symbol("maker") => maker,
                        Symbol("taker") => taker
                    );
                end
                i += 1
            end

                return result
        end

    end
    throw(NotSupported(string(self.id, " fetchTradingFees() is not supported for ", type_var, " markets")));

end
"""
transfer between futures account
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/New-Future-Account-Transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to transfer
- `type`::string: 1 - transfer from spot account to USDT-Ⓜ futures account, 2 - transfer from USDT-Ⓜ futures account to spot account, 3 - transfer from spot account to COIN-Ⓜ futures account, 4 - transfer from COIN-Ⓜ futures account to spot account
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.recvWindow`::float:

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=futures-transfer-structure}
"""
function futuresTransfer(self::Binance, code, amount, type_var; params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(type_var, 1)), (functions.ccxt_gt(type_var, 4))))
        throw(ArgumentsRequired(string(self.id, " type must be between 1 and 4")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount,
        Symbol("type") => type_var
    );
    response = Base.fetch(self.sapiPostFuturesTransfer(extend(request, params)));
    return self.parseTransfer(response, currency = currency)

end
"""
fetch the current funding rate
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Binance, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.fapiPublicGetPremiumIndex(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.dapiPublicGetPremiumIndex(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchFundingRate() supports linear and inverse contracts only")));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " fetchFundingRate() returned empty response")));
    end
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = get(response, 1, nothing);
    end
    return self.parseFundingRate(response, market = market)

end
"""
fetches historical funding rate prices
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-History
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Get-Funding-Rate-History-of-Perpetual-Futures

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
function fetchFundingRateHistory(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, timeframe = "8h", params = params))
    end
    defaultType = safeString2(self.options, "fetchFundingRateHistory", "defaultType", "future");
    type_var = safeString(params, "type", defaultType);
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchFundingRateHistory", market = market, params = params, defaultValue = "linear");
    params = omit(params, "type");
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    endTime = safeInteger(params, "endTime", until);
    params = omit(params, ["endTime", "until"]);
    if functions.ccxtruthy(endTime != nothing)
        request[Symbol("endTime")] = endTime;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        response = Base.fetch(self.fapiPublicGetFundingRate(extend(request, params)));
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        response = Base.fetch(self.dapiPublicGetFundingRate(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchFundingRateHistory() is not supported for ", type_var, " markets")));
    end
    return self.parseFundingRateHistories(response, market = market, since = since, limit = limit)

end
function parseFundingRateHistory(self::Binance, contract; market=nothing)
    timestamp = safeInteger(contract, "fundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(safeString(contract, "symbol"), market = nothing, delimiter = nothing, marketType = "swap"),
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
fetch the funding rate for multiple markets
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
function fetchFundingRates(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    defaultType = safeString2(self.options, "fetchFundingRates", "defaultType", "future");
    type_var = safeString(params, "type", defaultType);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchFundingRates", market = nothing, params = params, defaultValue = "linear");
    query = omit(params, "type");
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        response = Base.fetch(self.fapiPublicGetPremiumIndex(query));
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        response = Base.fetch(self.dapiPublicGetPremiumIndex(query));
    else
        throw(NotSupported(string(self.id, " fetchFundingRates() supports linear and inverse contracts only")));
    end
    return self.parseFundingRates(response, symbols = symbols)

end
function parseFundingRate(self::Binance, contract; market=nothing)
    timestamp = safeInteger(contract, "time");
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract");
    markPrice = self.safeNumber(contract, "markPrice");
    indexPrice = self.safeNumber(contract, "indexPrice");
    interestRate = self.safeNumber(contract, "interestRate");
    estimatedSettlePrice = self.safeNumber(contract, "estimatedSettlePrice");
    fundingRate = self.safeNumber(contract, "lastFundingRate");
    fundingTime = safeInteger(contract, "nextFundingTime");
    interval = safeString(contract, "fundingIntervalHours");
    intervalString = nothing;
    if functions.ccxtruthy(interval != nothing)
        intervalString = string(interval, "h");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => markPrice,
    Symbol("indexPrice") => indexPrice,
    Symbol("interestRate") => interestRate,
    Symbol("estimatedSettlePrice") => estimatedSettlePrice,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => fundingRate,
    Symbol("fundingTimestamp") => fundingTime,
    Symbol("fundingDatetime") => self.iso8601(fundingTime),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => intervalString
)

end
function parseAccountPositions(self::Binance, account; filterClosed=false)
    positions = self.safeList(account, "positions", defaultValue = []);
    assets = self.safeList(account, "assets", defaultValue = []);
    balances = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(assets)))
        entry = get(assets, i + 1, nothing);
        currencyId = safeString(entry, "asset");
        code = self.safeCurrencyCode(currencyId);
        crossWalletBalance = safeString(entry, "crossWalletBalance");
        crossUnPnl = safeString(entry, "crossUnPnl");
        if functions.ccxtruthy(code != nothing)
            balances[Symbol(code)] = Dict{Symbol, Any}(
                Symbol("crossMargin") => stringAdd(crossWalletBalance, crossUnPnl),
                Symbol("crossWalletBalance") => crossWalletBalance
            );
        end
        i += 1
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        position = get(positions, i + 1, nothing);
        marketId = safeString(position, "symbol");
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = "contract");
        code = functions.ccxtruthy(get(market, Symbol("linear"), nothing)) ? get(market, Symbol("quote"), nothing) : get(market, Symbol("base"), nothing);
        maintenanceMargin = safeString(position, "maintMargin");
        isPositionOpen = @functions.ccxt_and((maintenanceMargin != "0"), (maintenanceMargin != "0.00000000"));
        if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(filterClosed), isPositionOpen))
            if functions.ccxtruthy(ccxt_in(code, balances))
                parsed = self.parseAccountPosition(extend(position, Dict{Symbol, Any}(
                    Symbol("crossMargin") => get(get(balances, Symbol(code), nothing), Symbol("crossMargin"), nothing),
                    Symbol("crossWalletBalance") => get(get(balances, Symbol(code), nothing), Symbol("crossWalletBalance"), nothing)
                )), market = market);
                                push!(result, parsed);
            end
        end
        i += 1
    end
    return result

end
function parseAccountPosition(self::Binance, position; market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    symbol = safeString(market, "symbol");
    leverageString = omitZero(safeString(position, "leverage"));
    leverage = functions.ccxtruthy((leverageString != nothing)) ? ccxt_parseInt(leverageString) : nothing;
    initialMarginString = safeString(position, "initialMargin");
    initialMargin = self.parseNumber(initialMarginString);
    initialMarginPercentageString = nothing;
    if functions.ccxtruthy(leverageString != nothing)
        initialMarginPercentageString = stringDiv("1", leverageString, 8);
        if functions.ccxtruthy(leverage == nothing)
            throw(ExchangeError(string(self.id, " method() missing leverage")));
        end
        rational = self.isRoundNumber(1000 % leverage);
        if functions.ccxtruthy(!functions.ccxtruthy(rational))
            initialMarginPercentageString = stringDiv(stringAdd(initialMarginPercentageString, "1e-8"), "1", 8);
        end
    end
    usdm = (ccxt_in("notional", position));
    maintenanceMarginString = safeString(position, "maintMargin");
    maintenanceMargin = self.parseNumber(maintenanceMarginString);
    entryPriceString = safeString(position, "entryPrice");
    entryPrice = self.parseNumber(entryPriceString);
    notionalString = safeString2(position, "notional", "notionalValue");
    notionalStringAbs = stringAbs(notionalString);
    notional = self.parseNumber(notionalStringAbs);
    contractsString = safeString(position, "positionAmt");
    contractsStringAbs = stringAbs(contractsString);
    if functions.ccxtruthy(contractsString == nothing)
        entryNotional = stringMul(stringMul(leverageString, initialMarginString), entryPriceString);
        contractSizeNew = safeString(market, "contractSize");
        contractsString = stringDiv(entryNotional, contractSizeNew);
        contractsStringAbs = stringDiv(stringAdd(contractsString, "0.5"), "1", 0);
    end
    contracts = self.parseNumber(contractsStringAbs);
    leverageBrackets = self.safeDict(self.options, "leverageBrackets", defaultValue = Dict{Symbol, Any}());
    leverageBracket = self.safeList(leverageBrackets, symbol, defaultValue = []);
    maintenanceMarginPercentageString = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(leverageBracket)))
        bracket = get(leverageBracket, i + 1, nothing);
        if functions.ccxtruthy(stringLt(notionalStringAbs, get(bracket, 1, nothing)))
            break
        end
        maintenanceMarginPercentageString = get(bracket, 2, nothing);
        i += 1
    end
    maintenanceMarginPercentage = self.parseNumber(maintenanceMarginPercentageString);
    unrealizedPnlString = safeString(position, "unrealizedProfit");
    unrealizedPnl = self.parseNumber(unrealizedPnlString);
    timestamp = safeInteger(position, "updateTime");
    if functions.ccxtruthy(timestamp == 0)
        timestamp = nothing;
    end
    isolated = self.safeBool(position, "isolated");
    if functions.ccxtruthy(isolated == nothing)
        isolatedMarginRaw = safeString(position, "isolatedMargin");
        isolated = !functions.ccxtruthy(stringEq(isolatedMarginRaw, "0"));
    end
    marginMode = nothing;
    collateralString = nothing;
    walletBalance = nothing;
    if functions.ccxtruthy(isolated)
        marginMode = "isolated";
        walletBalance = safeString(position, "isolatedWallet");
        collateralString = stringAdd(walletBalance, unrealizedPnlString);
    else
        marginMode = "cross";
        walletBalance = safeString(position, "crossWalletBalance");
        collateralString = safeString(position, "crossMargin");
    end
    collateral = self.parseNumber(collateralString);
    marginRatio = nothing;
    side = nothing;
    percentage = nothing;
    liquidationPriceStringRaw = nothing;
    liquidationPrice = nothing;
    contractSize = safeValue(market, "contractSize");
    contractSizeString = numberToString(contractSize);
    if functions.ccxtruthy(stringEquals(notionalString, "0"))
        entryPrice = nothing;
    else
        side = functions.ccxtruthy(stringLt(notionalString, "0")) ? "short" : "long";
        marginRatio = self.parseNumber(stringDiv(stringAdd(stringDiv(maintenanceMarginString, collateralString), "5e-5"), "1", 4));
        percentage = self.parseNumber(stringMul(stringDiv(unrealizedPnlString, initialMarginString, 4), "100"));
        if functions.ccxtruthy(usdm)
            onePlusMaintenanceMarginPercentageString = nothing;
            entryPriceSignString = entryPriceString;
            if functions.ccxtruthy(side == "short")
                onePlusMaintenanceMarginPercentageString = stringAdd("1", maintenanceMarginPercentageString);
            else
                onePlusMaintenanceMarginPercentageString = stringAdd("-1", maintenanceMarginPercentageString);
                entryPriceSignString = stringMul("-1", entryPriceSignString);
            end
            leftSide = stringDiv(walletBalance, stringMul(contractsStringAbs, onePlusMaintenanceMarginPercentageString));
            rightSide = stringDiv(entryPriceSignString, onePlusMaintenanceMarginPercentageString);
            liquidationPriceStringRaw = stringAdd(leftSide, rightSide);
        else
            onePlusMaintenanceMarginPercentageString = nothing;
            entryPriceSignString = entryPriceString;
            if functions.ccxtruthy(side == "short")
                onePlusMaintenanceMarginPercentageString = stringSub("1", maintenanceMarginPercentageString);
            else
                onePlusMaintenanceMarginPercentageString = stringSub("-1", maintenanceMarginPercentageString);
                entryPriceSignString = stringMul("-1", entryPriceSignString);
            end
            size_var = stringMul(contractsStringAbs, contractSizeString);
            leftSide = stringMul(size_var, onePlusMaintenanceMarginPercentageString);
            rightSide = stringSub(stringMul(stringDiv("1", entryPriceSignString), size_var), walletBalance);
            liquidationPriceStringRaw = stringDiv(leftSide, rightSide);
        end
        pricePrecision = precisionFromString(safeString(get(market, Symbol("precision"), nothing), "price"));
        pricePrecisionPlusOne = pricePrecision + 1;
        pricePrecisionPlusOneString = string(pricePrecisionPlusOne);
        rounder = Precise(string("5e-", pricePrecisionPlusOneString));
        rounderString = string(rounder);
        liquidationPriceRoundedString = stringAdd(rounderString, liquidationPriceStringRaw);
        truncatedLiquidationPrice = stringDiv(liquidationPriceRoundedString, "1", pricePrecision);
        if functions.ccxtruthy(@functions.ccxt_and(truncatedLiquidationPrice != nothing, get(truncatedLiquidationPrice, 1, nothing) == "-"))
            truncatedLiquidationPrice = nothing;
        end
        liquidationPrice = self.parseNumber(truncatedLiquidationPrice);
    end
    positionSide = safeString(position, "positionSide");
    hedged = positionSide != "BOTH";
    return Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("initialMargin") => initialMargin,
    Symbol("initialMarginPercentage") => self.parseNumber(initialMarginPercentageString),
    Symbol("maintenanceMargin") => maintenanceMargin,
    Symbol("maintenanceMarginPercentage") => maintenanceMarginPercentage,
    Symbol("entryPrice") => entryPrice,
    Symbol("notional") => notional,
    Symbol("leverage") => self.parseNumber(leverageString),
    Symbol("unrealizedPnl") => unrealizedPnl,
    Symbol("contracts") => contracts,
    Symbol("contractSize") => contractSize,
    Symbol("marginRatio") => marginRatio,
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("markPrice") => nothing,
    Symbol("collateral") => collateral,
    Symbol("marginMode") => marginMode,
    Symbol("side") => side,
    Symbol("hedged") => hedged,
    Symbol("percentage") => percentage
)

end
function parsePositionRisk(self::Binance, position; market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    symbol = safeString(market, "symbol");
    isolatedMarginString = safeString(position, "isolatedMargin");
    leverageBrackets = self.safeDict(self.options, "leverageBrackets", defaultValue = Dict{Symbol, Any}());
    leverageBracket = self.safeList(leverageBrackets, symbol, defaultValue = []);
    notionalString = safeString2(position, "notional", "notionalValue");
    notionalStringAbs = stringAbs(notionalString);
    maintenanceMarginPercentageString = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(leverageBracket)))
        bracket = get(leverageBracket, i + 1, nothing);
        if functions.ccxtruthy(stringLt(notionalStringAbs, get(bracket, 1, nothing)))
            break
        end
        maintenanceMarginPercentageString = get(bracket, 2, nothing);
        i += 1
    end
    notional = self.parseNumber(notionalStringAbs);
    contractsAbs = stringAbs(safeString(position, "positionAmt"));
    contracts = self.parseNumber(contractsAbs);
    unrealizedPnlString = safeString(position, "unRealizedProfit");
    unrealizedPnl = self.parseNumber(unrealizedPnlString);
    liquidationPriceString = omitZero(safeString(position, "liquidationPrice"));
    liquidationPrice = self.parseNumber(liquidationPriceString);
    collateralString = nothing;
    marginMode = safeString(position, "marginType");
    if functions.ccxtruthy(@functions.ccxt_and(marginMode == nothing, isolatedMarginString != nothing))
        marginMode = functions.ccxtruthy(stringEq(isolatedMarginString, "0")) ? "cross" : "isolated";
    end
    side = nothing;
    if functions.ccxtruthy(stringGt(notionalString, "0"))
        side = "long";
    elseif functions.ccxtruthy(stringLt(notionalString, "0"))
        side = "short";
    end
    entryPriceString = safeString(position, "entryPrice");
    entryPrice = self.parseNumber(entryPriceString);
    contractSize = safeValue(market, "contractSize");
    contractSizeString = numberToString(contractSize);
    linear = (ccxt_in("notional", position));
    if functions.ccxtruthy(marginMode == "cross")
        precision = self.safeDict(market, "precision", defaultValue = Dict{Symbol, Any}());
        basePrecisionValue = safeString(precision, "base");
        quotePrecisionValue = safeString2(precision, "quote", "price");
        precisionIsUndefined = @functions.ccxt_and((basePrecisionValue == nothing), (quotePrecisionValue == nothing));
        if functions.ccxtruthy(!functions.ccxtruthy(precisionIsUndefined))
            if functions.ccxtruthy(linear)
                onePlusMaintenanceMarginPercentageString = nothing;
                entryPriceSignString = entryPriceString;
                if functions.ccxtruthy(side == "short")
                    onePlusMaintenanceMarginPercentageString = stringAdd("1", maintenanceMarginPercentageString);
                    entryPriceSignString = stringMul("-1", entryPriceSignString);
                else
                    onePlusMaintenanceMarginPercentageString = stringAdd("-1", maintenanceMarginPercentageString);
                end
                inner = stringMul(liquidationPriceString, onePlusMaintenanceMarginPercentageString);
                leftSide = stringAdd(inner, entryPriceSignString);
                quotePrecision = precisionFromString(safeString2(precision, "quote", "price"));
                if functions.ccxtruthy(quotePrecision != nothing)
                    collateralString = stringDiv(stringMul(leftSide, contractsAbs), "1", quotePrecision);
                end
            else
                onePlusMaintenanceMarginPercentageString = nothing;
                entryPriceSignString = entryPriceString;
                if functions.ccxtruthy(side == "short")
                    onePlusMaintenanceMarginPercentageString = stringSub("1", maintenanceMarginPercentageString);
                else
                    onePlusMaintenanceMarginPercentageString = stringSub("-1", maintenanceMarginPercentageString);
                    entryPriceSignString = stringMul("-1", entryPriceSignString);
                end
                leftSide = stringMul(contractsAbs, contractSizeString);
                rightSide = stringSub(stringDiv("1", entryPriceSignString), stringDiv(onePlusMaintenanceMarginPercentageString, liquidationPriceString));
                basePrecision = precisionFromString(safeString(precision, "base"));
                if functions.ccxtruthy(basePrecision != nothing)
                    collateralString = stringDiv(stringMul(leftSide, rightSide), "1", basePrecision);
                end
            end
        end
    else
        collateralString = safeString(position, "isolatedMargin");
    end
    collateralString = functions.ccxtruthy((collateralString == nothing)) ? "0" : collateralString;
    collateral = self.parseNumber(collateralString);
    markPrice = self.parseNumber(omitZero(safeString(position, "markPrice")));
    timestamp = safeInteger(position, "updateTime");
    if functions.ccxtruthy(timestamp == 0)
        timestamp = nothing;
    end
    maintenanceMarginPercentage = self.parseNumber(maintenanceMarginPercentageString);
    maintenanceMarginString = stringMul(maintenanceMarginPercentageString, notionalStringAbs);
    if functions.ccxtruthy(maintenanceMarginString == nothing)
        maintenanceMarginString = safeString(position, "maintMargin");
    end
    maintenanceMargin = self.parseNumber(maintenanceMarginString);
    initialMarginString = nothing;
    initialMarginPercentageString = nothing;
    leverageString = omitZero(safeString(position, "leverage"));
    if functions.ccxtruthy(leverageString != nothing)
        leverage = ccxt_parseInt(leverageString);
        rational = self.isRoundNumber(1000 % leverage);
        initialMarginPercentageString = stringDiv("1", leverageString, 8);
        if functions.ccxtruthy(!functions.ccxtruthy(rational))
            initialMarginPercentageString = stringAdd(initialMarginPercentageString, "1e-8");
        end
        unrounded = stringMul(notionalStringAbs, initialMarginPercentageString);
        initialMarginString = stringDiv(unrounded, "1", 8);
    else
        initialMarginString = safeString(position, "initialMargin");
        unrounded = stringMul(initialMarginString, "1");
        initialMarginPercentageString = stringDiv(unrounded, notionalStringAbs, 8);
    end
    marginRatio = nothing;
    percentage = nothing;
    if functions.ccxtruthy(!functions.ccxtruthy(stringEquals(collateralString, "0")))
        marginRatio = self.parseNumber(stringDiv(stringAdd(stringDiv(maintenanceMarginString, collateralString), "5e-5"), "1", 4));
        percentage = self.parseNumber(stringMul(stringDiv(unrealizedPnlString, initialMarginString, 4), "100"));
    end
    positionSide = safeString(position, "positionSide");
    hedged = positionSide != "BOTH";
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("contracts") => contracts,
    Symbol("contractSize") => contractSize,
    Symbol("unrealizedPnl") => unrealizedPnl,
    Symbol("leverage") => self.parseNumber(leverageString),
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("collateral") => collateral,
    Symbol("notional") => notional,
    Symbol("markPrice") => markPrice,
    Symbol("entryPrice") => entryPrice,
    Symbol("timestamp") => timestamp,
    Symbol("initialMargin") => self.parseNumber(initialMarginString),
    Symbol("initialMarginPercentage") => self.parseNumber(initialMarginPercentageString),
    Symbol("maintenanceMargin") => maintenanceMargin,
    Symbol("maintenanceMarginPercentage") => maintenanceMarginPercentage,
    Symbol("marginRatio") => marginRatio,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("marginMode") => marginMode,
    Symbol("marginType") => marginMode,
    Symbol("side") => side,
    Symbol("hedged") => hedged,
    Symbol("percentage") => percentage,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function loadLeverageBrackets(self::Binance; reload=false, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    leverageBrackets = self.safeDict(self.options, "leverageBrackets");
    if functions.ccxtruthy(@functions.ccxt_or((leverageBrackets == nothing), (reload)))
        defaultType = safeString(self.options, "defaultType", "future");
        type_var = safeString(params, "type", defaultType);
        query = omit(params, "type");
        subType = nothing;
        (subType, params) = self.handleSubTypeAndParams("loadLeverageBrackets", market = nothing, params = params, defaultValue = "linear");
        isPortfolioMargin = nothing;
        (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "loadLeverageBrackets", "papi", "portfolioMargin", defaultValue = false);
        response = nothing;
        if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiGetUmLeverageBracket(query));
            else
                response = Base.fetch(self.fapiPrivateGetLeverageBracket(query));
            end
        elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiGetCmLeverageBracket(query));
            else
                response = Base.fetch(self.dapiPrivateV2GetLeverageBracket(query));
            end
        else
            throw(NotSupported(string(self.id, " loadLeverageBrackets() supports linear and inverse contracts only")));
        end
        self.options[Symbol("leverageBrackets")] = self.createSafeDictionary();
        if functions.ccxtruthy(response == nothing)
            throw(NullResponse(string(self.id, " loadLeverageBrackets() returned empty response")));
        end
        entries = toArray(response);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(entries)))
            entry = get(entries, i + 1, nothing);
            marketId = safeString(entry, "symbol");
            symbol = self.safeSymbol(marketId, market = nothing, delimiter = nothing, marketType = "contract");
            brackets = self.safeList(entry, "brackets", defaultValue = []);
            result = [];
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(brackets)))
                bracket = get(brackets, j + 1, nothing);
                floorValue = safeString2(bracket, "notionalFloor", "qtyFloor");
                maintenanceMarginPercentage = safeString(bracket, "maintMarginRatio");
                push!(result, [floorValue, maintenanceMarginPercentage]);
                j += 1
            end
            self.options[Symbol("leverageBrackets")][Symbol(symbol)] = result;
            i += 1
        end

    end
    return get(self.options, Symbol("leverageBrackets"), nothing)

end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Notional-and-Leverage-Brackets
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Notional-Bracket-for-Pair
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/UM-Notional-and-Leverage-Brackets
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/CM-Notional-and-Leverage-Brackets

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch the leverage tiers for a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
function fetchLeverageTiers(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchLeverageTiers", market = nothing, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchLeverageTiers", market = nothing, params = params, defaultValue = "linear");
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchLeverageTiers", "papi", "portfolioMargin", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetUmLeverageBracket(params));
        else
            response = Base.fetch(self.fapiPrivateGetLeverageBracket(params));
        end
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetCmLeverageBracket(params));
        else
            response = Base.fetch(self.dapiPrivateV2GetLeverageBracket(params));
        end
    else
        throw(NotSupported(string(self.id, " fetchLeverageTiers() supports linear and inverse contracts only")));
    end
    return self.parseLeverageTiers(response, symbols = symbols, marketIdKey = "symbol")

end
function parseMarketLeverageTiers(self::Binance, info; market=nothing)
    marketId = safeString(info, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    brackets = self.safeList(info, "brackets", defaultValue = []);
    tiers = [];
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(brackets)))
        bracket = get(brackets, j + 1, nothing);
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.safeNumber(bracket, "bracket"),
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("currency") => get(market, Symbol("quote"), nothing),
    Symbol("minNotional") => self.safeNumber2(bracket, "notionalFloor", "qtyFloor"),
    Symbol("maxNotional") => self.safeNumber2(bracket, "notionalCap", "qtyCap"),
    Symbol("maintenanceMarginRate") => self.safeNumber(bracket, "maintMarginRatio"),
    Symbol("maxLeverage") => self.safeNumber(bracket, "initialLeverage"),
    Symbol("info") => bracket
));
        j += 1
    end
    return tiers

end
"""
fetch data on an open position
see: https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Binance, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("option"), nothing)))
        throw(NotSupported(string(self.id, " fetchPosition() supports option markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.eapiPrivateGetPosition(extend(request, params)));
    return self.parseOptionPosition(self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}()), market = market)

end
"""
fetch data on open options positions
see: https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchOptionPositions(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
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
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.eapiPrivateGetPosition(extend(request, params)));
    result = [];
    positions = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        push!(result, self.parseOptionPosition(get(positions, i + 1, nothing), market = market));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
function parseOptionPosition(self::Binance, position; market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "swap");
    symbol = get(market, Symbol("symbol"), nothing);
    side = safeStringLower(position, "side");
    quantity = safeString(position, "quantity");
    if functions.ccxtruthy(side != "long")
        quantity = stringMul("-1", quantity);
    end
    timestamp = safeInteger(position, "time");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("entryPrice") => self.safeNumber(position, "entryPrice"),
    Symbol("markPrice") => self.safeNumber(position, "markPrice"),
    Symbol("notional") => self.safeNumber(position, "markValue"),
    Symbol("collateral") => self.safeNumber(position, "positionCost"),
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealizedPNL"),
    Symbol("side") => side,
    Symbol("contracts") => self.parseNumber(quantity),
    Symbol("contractSize") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("hedged") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("percentage") => nothing
))

end
"""
fetch all open positions
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-Information
see: https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.method`::string, optional: method name to call, "positionRisk", "account" or "option", default is "positionRisk"
- `params.useV2`::bool, optional: set to true if you want to use the obsolete endpoint, where some more additional fields were provided

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Binance; symbols=nothing, params=Dict())
    defaultMethod = nothing;
    (defaultMethod, params) = self.handleOptionAndParams(params, "fetchPositions", "method");
    if functions.ccxtruthy(defaultMethod == nothing)
        options = self.safeDict(self.options, "fetchPositions");
        if functions.ccxtruthy(options == nothing)
            defaultMethod = safeString(self.options, "fetchPositions", "positionRisk");
        else
            defaultMethod = "positionRisk";
        end
    end
    if functions.ccxtruthy(defaultMethod == "positionRisk")
            return Base.fetch(self.fetchPositionsRisk(symbols = symbols, params = params))
    elseif functions.ccxtruthy(defaultMethod == "account")
        return Base.fetch(self.fetchAccountPositions(symbols = symbols, params = params))
    else
        if functions.ccxtruthy(defaultMethod == "option")
                return Base.fetch(self.fetchOptionPositions(symbols = symbols, params = params))
        else
            throw(NotSupported(string(self.id, ".options[\"fetchPositions\"][\"method\"] or params[\"method\"] = \"", defaultMethod, "\" is invalid, please choose between \"account\", \"positionRisk\" and \"option\"")));
        end

    end

end
"""
fetch account positions
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V3

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch positions in a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"
- `params.filterClosed`::bool, optional: set to true if you would like to filter out closed positions, default is false
- `params.useV2`::bool, optional: set to true if you want to use obsolete endpoint, where some more additional fields were provided

# Returns
- data on account positions
"""
function fetchAccountPositions(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(symbols != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(symbols)))
            throw(ArgumentsRequired(string(self.id, " fetchPositions() requires an array argument for symbols")));
        end
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadLeverageBrackets(reload = false, params = params));
    defaultType = safeString(self.options, "defaultType", "future");
    type_var = safeString(params, "type", defaultType);
    params = omit(params, "type");
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchAccountPositions", market = nothing, params = params, defaultValue = "linear");
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchAccountPositions", "papi", "portfolioMargin", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiV2GetUmAccount(params));
        else
            useV2 = nothing;
            (useV2, params) = self.handleOptionAndParams(params, "fetchAccountPositions", "useV2", defaultValue = false);
            if functions.ccxtruthy(!functions.ccxtruthy(useV2))
                response = Base.fetch(self.fapiPrivateV3GetAccount(params));
            else
                response = Base.fetch(self.fapiPrivateV2GetAccount(params));
            end
        end
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetCmAccount(params));
        else
            response = Base.fetch(self.dapiPrivateGetAccount(params));
        end
    else
        throw(NotSupported(string(self.id, " fetchPositions() supports linear and inverse contracts only")));
    end
    filterClosed = nothing;
    (filterClosed, params) = self.handleOptionAndParams(params, "fetchAccountPositions", "filterClosed", defaultValue = false);
    result = self.parseAccountPositions(response, filterClosed = filterClosed);
    symbols = self.marketSymbols(symbols = symbols);
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
"""
fetch positions risk
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-Information
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Query-UM-Position-Information
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Query-CM-Position-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V3

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch positions for a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"
- `params.useV2`::bool, optional: set to true if you want to use the obsolete endpoint, where some more additional fields were provided

# Returns
- data on the positions risk
"""
function fetchPositionsRisk(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(symbols != nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(symbols)))
            throw(ArgumentsRequired(string(self.id, " fetchPositionsRisk() requires an array argument for symbols")));
        end
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadLeverageBrackets(reload = false, params = params));
    request = Dict{Symbol, Any}();
    defaultType = "future";
    defaultType = safeString(self.options, "defaultType", defaultType);
    type_var = safeString(params, "type", defaultType);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchPositionsRisk", market = nothing, params = params, defaultValue = "linear");
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchPositionsRisk", "papi", "portfolioMargin", defaultValue = false);
    params = omit(params, "type");
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetUmPositionRisk(extend(request, params)));
        else
            useV2 = nothing;
            (useV2, params) = self.handleOptionAndParams(params, "fetchPositionsRisk", "useV2", defaultValue = false);
            params = extend(request, params);
            if functions.ccxtruthy(!functions.ccxtruthy(useV2))
                response = Base.fetch(self.fapiPrivateV3GetPositionRisk(params));
            else
                response = Base.fetch(self.fapiPrivateV2GetPositionRisk(params));
            end
        end
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetCmPositionRisk(extend(request, params)));
        else
            response = Base.fetch(self.dapiPrivateGetPositionRisk(extend(request, params)));
        end
    else
        throw(NotSupported(string(self.id, " fetchPositionsRisk() supports linear and inverse contracts only")));
    end
    result = [];
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " method() returned empty response")));
    end
    positions = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        rawPosition = get(positions, i + 1, nothing);
        entryPriceString = safeString(rawPosition, "entryPrice");
        if functions.ccxtruthy(stringGt(entryPriceString, "0"))
                        push!(result, self.parsePositionRisk(rawPosition));
        end
        i += 1
    end
    symbols = self.marketSymbols(symbols = symbols);
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
"""
fetch the history of funding payments paid and received on this account
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Income-History
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Get-Income-History
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Income-History
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Income-History

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding history entry
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch the funding history for a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("incomeType") => "FUNDING_FEE"
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
            throw(NotSupported(string(self.id, " fetchFundingHistory() supports swap contracts only")));
        end
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchFundingHistory", market = market, params = params, defaultValue = "linear");
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchFundingHistory", "papi", "portfolioMargin", defaultValue = false);
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    defaultType = safeString2(self.options, "fetchFundingHistory", "defaultType", "future");
    type_var = safeString(params, "type", defaultType);
    params = omit(params, "type");
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetUmIncome(extend(request, params)));
        else
            response = Base.fetch(self.fapiPrivateGetIncome(extend(request, params)));
        end
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetCmIncome(extend(request, params)));
        else
            response = Base.fetch(self.dapiPrivateGetIncome(extend(request, params)));
        end
    else
        throw(NotSupported(string(self.id, " fetchFundingHistory() supports linear and inverse contracts only")));
    end
    return self.parseIncomes(response, market = market, since = since, limit = limit)

end
"""
set the level of leverage for a market
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Initial-Leverage
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Change-Initial-Leverage
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Change-UM-Initial-Leverage
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Change-CM-Initial-Leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to set the leverage for a trading pair in a portfolio margin account

# Returns
- response from the exchange
"""
function setLeverage(self::Binance, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, 125))))
        throw(BadRequest(string(self.id, " leverage should be between 1 and 125")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => leverage
    );
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "setLeverage", "papi", "portfolioMargin", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiPostUmLeverage(extend(request, params)));
        else
            response = Base.fetch(self.fapiPrivatePostLeverage(extend(request, params)));
        end
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiPostCmLeverage(extend(request, params)));
        else
            response = Base.fetch(self.dapiPrivatePostLeverage(extend(request, params)));
        end
    else
        throw(NotSupported(string(self.id, " setLeverage() supports linear and inverse contracts only")));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " setLeverage() returned empty response")));
    end
    return response

end
"""
set margin mode to 'cross' or 'isolated'
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Margin-Type
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Change-Margin-Type

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setMarginMode(self::Binance, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    marginMode = uppercase(marginMode);
    if functions.ccxtruthy(marginMode == "CROSS")
        marginMode = "CROSSED";
    end
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "ISOLATED"), (marginMode != "CROSSED")))
        throw(BadRequest(string(self.id, " marginMode must be either isolated or cross")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginType") => marginMode
    );
    response = nothing;
    try
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.fapiPrivatePostMarginType(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.dapiPrivatePostMarginType(extend(request, params)));
        else
            throw(NotSupported(string(self.id, " setMarginMode() supports linear and inverse contracts only")));
        end
    catch e
        if functions.ccxtruthy(isa(e, MarginModeAlreadySet))
            throwMarginModeAlreadySet = self.handleOption("setMarginMode", "throwMarginModeAlreadySet", defaultValue = false);
            if functions.ccxtruthy(throwMarginModeAlreadySet)
                throw(e);
            else
                response = Dict{Symbol, Any}(
                    Symbol("code") => -4046,
                    Symbol("msg") => "No need to change margin type."
                );
            end
        else
            throw(e);
        end

    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " setMarginMode() returned empty response")));
    end
    return response

end
"""
set hedged to true or false for a market
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Position-Mode
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Change-Position-Mode
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Current-Position-Mode
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Current-Position-Mode

# Arguments
- `hedged`::bool: set to true to use dualSidePosition
- `symbol`::string: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to set the position mode for a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- response from the exchange
"""
function setPositionMode(self::Binance, hedged; symbol=nothing, params=Dict())
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("setPositionMode", market = market, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("setPositionMode", market = market, params = params);
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "setPositionMode", "papi", "portfolioMargin", defaultValue = false);
    dualSidePosition = nothing;
    if functions.ccxtruthy(hedged)
        dualSidePosition = "true";
    else
        dualSidePosition = "false";
    end
    request = Dict{Symbol, Any}(
        Symbol("dualSidePosition") => dualSidePosition
    );
    response = nothing;
    if functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiPostCmPositionSideDual(extend(request, params)));
        else
            response = Base.fetch(self.dapiPrivatePostPositionSideDual(extend(request, params)));
        end
    elseif functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiPostUmPositionSideDual(extend(request, params)));
        else
            response = Base.fetch(self.fapiPrivatePostPositionSideDual(extend(request, params)));
        end
    else
        throw(BadRequest(string(self.id, " setPositionMode() supports linear and inverse contracts only")));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " setPositionMode() returned empty response")));
    end
    return response

end
"""
fetch the set leverage for all markets
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Account-Detail
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Account-Detail
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverages(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadLeverageBrackets(reload = false, params = params));
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchLeverages", market = nothing, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchLeverages", market = nothing, params = params, defaultValue = "linear");
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchLeverages", "papi", "portfolioMargin", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetUmAccount(params));
        else
            response = Base.fetch(self.fapiPrivateGetSymbolConfig(params));
        end
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetCmAccount(params));
        else
            response = Base.fetch(self.dapiPrivateGetAccount(params));
        end
    else
        throw(NotSupported(string(self.id, " fetchLeverages() supports linear and inverse contracts only")));
    end
    leverages = self.safeList(response, "positions", defaultValue = []);
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        leverages = response;
    end
    return self.parseLeverages(leverages, symbols = symbols, symbolKey = "symbol")

end
function parseLeverage(self::Binance, leverage; market=nothing)
    marketId = safeString(leverage, "symbol");
    marginModeRaw = self.safeBool(leverage, "isolated");
    marginMode = nothing;
    if functions.ccxtruthy(marginModeRaw != nothing)
        marginMode = functions.ccxtruthy(marginModeRaw) ? "isolated" : "cross";
    end
    marginTypeRaw = safeStringLower(leverage, "marginType");
    if functions.ccxtruthy(marginTypeRaw != nothing)
        marginMode = functions.ccxtruthy((marginTypeRaw == "crossed")) ? "cross" : "isolated";
    end
    side = safeStringLower(leverage, "positionSide");
    longLeverage = nothing;
    shortLeverage = nothing;
    leverageValue = safeInteger(leverage, "leverage");
    if functions.ccxtruthy(@functions.ccxt_or((side == nothing), (side == "both")))
        longLeverage = leverageValue;
        shortLeverage = leverageValue;
    elseif functions.ccxtruthy(side == "long")
        longLeverage = leverageValue;
    else
        if functions.ccxtruthy(side == "short")
            shortLeverage = leverageValue;
        end

    end
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => longLeverage,
    Symbol("shortLeverage") => shortLeverage
)

end
"""
fetches historical settlement records
see: https://developers.binance.com/docs/derivatives/option/market-data/Historical-Exercise-Records

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records, default 100, max 100
- `params`::object, optional: exchange specific params

# Returns
- a list of [settlement history objects]{@link https://docs.ccxt.com/?id=settlement-history-structure}
"""
function fetchSettlementHistory(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = functions.ccxtruthy((symbol == nothing)) ? nothing : self.market(symbol);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchSettlementHistory", market = market, params = params);
    if functions.ccxtruthy(type_var != "option")
        throw(NotSupported(string(self.id, " fetchSettlementHistory() supports option markets only")));
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        symbol = safeString(market, "symbol");
        request[Symbol("underlying")] = string(safeString(market, "baseId", ""), safeString(market, "quoteId", ""));
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.eapiPublicGetExerciseHistory(extend(request, params)));
    settlements = self.parseSettlements(response, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
"""
fetches historical settlement records of the user
see: https://developers.binance.com/docs/derivatives/option/trade/User-Exercise-Record

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records
- `params`::object, optional: exchange specific params

# Returns
- a list of [settlement history objects]
"""
function fetchMySettlementHistory(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = functions.ccxtruthy((symbol == nothing)) ? nothing : self.market(symbol);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchMySettlementHistory", market = market, params = params);
    if functions.ccxtruthy(type_var != "option")
        throw(NotSupported(string(self.id, " fetchMySettlementHistory() supports option markets only")));
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = safeString(market, "id");
        symbol = safeString(market, "symbol");
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.eapiPrivateGetExerciseRecord(extend(request, params)));
    settlements = self.parseSettlements(response, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function parseSettlement(self::Binance, settlement, market)
    timestamp = safeInteger2(settlement, "expiryDate", "createDate");
    marketId = safeString(settlement, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => settlement,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("price") => self.safeNumber2(settlement, "realStrikePrice", "exercisePrice"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function parseSettlements(self::Binance, settlements, market)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settlements)))
        push!(result, self.parseSettlement(get(settlements, i + 1, nothing), market));
        i += 1
    end
    return result

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://developers.binance.com/docs/derivatives/option/account/Account-Funding-Flow

# Arguments
- `id`::string: the identification number of the ledger entry
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedgerEntry(self::Binance, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchLedgerEntry", market = nothing, params = params);
    if functions.ccxtruthy(type_var != "option")
        throw(BadRequest(string(self.id, " fetchLedgerEntry() can only be used for type option")));
    end
    self.checkRequiredArgument("fetchLedgerEntry", code, "code");
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("recordId") => id,
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.eapiPrivateGetBill(extend(request, params)));
    first_var = self.safeDict(response, 0, defaultValue = response);
    return self.parseLedgerEntry(first_var, currency = currency)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://developers.binance.com/docs/derivatives/option/account/Account-Funding-Flow
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Income-History
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Get-Income-History
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Income-History
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Income-History

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ledger entry
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch the ledger for a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Binance; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchLedger", symbol = code, since = since, limit = limit, params = params, maxEntriesPerRequest = nothing, removeRepeated = false))
    end
    type_var = nothing;
    subType = nothing;
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}();
    (type_var, params) = self.handleMarketTypeAndParams("fetchLedger", market = nothing, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchLedger", market = nothing, params = params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("endTime")] = until;
    end
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchLedger", "papi", "portfolioMargin", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(type_var == "option")
        self.checkRequiredArgument("fetchLedger", code, "code");
        if functions.ccxtruthy(currency == nothing)
            throw(ExchangeError(string(self.id, " fetchLedger() could not resolve currency")));
        end
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        response = Base.fetch(self.eapiPrivateGetBill(extend(request, params)));
    elseif functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetUmIncome(extend(request, params)));
        else
            response = Base.fetch(self.fapiPrivateGetIncome(extend(request, params)));
        end
    else
        if functions.ccxtruthy(self.isInverse(type_var, subType = subType))
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiGetCmIncome(extend(request, params)));
            else
                response = Base.fetch(self.dapiPrivateGetIncome(extend(request, params)));
            end
        else
            throw(NotSupported(string(self.id, " fetchLedger() supports contract wallets only")));
        end

    end
    return self.parseLedger(response, currency = currency, since = since, limit = limit)

end
function parseLedgerEntry(self::Binance, item; currency=nothing)
    amount = safeString2(item, "amount", "income");
    direction = nothing;
    if functions.ccxtruthy(stringLe(amount, "0"))
        direction = "out";
        amount = stringMul("-1", amount);
    else
        direction = "in";
    end
    currencyId = safeString(item, "asset");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    timestamp = safeInteger2(item, "createDate", "time");
    type_var = safeString2(item, "type", "incomeType");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString2(item, "id", "tranId"),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("referenceId") => safeString(item, "tradeId"),
    Symbol("type") => self.parseLedgerEntryType(type_var),
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency = currency)

end
function parseLedgerEntryType(self::Binance, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("FEE") => "fee",
        Symbol("FUNDING_FEE") => "fee",
        Symbol("OPTIONS_PREMIUM_FEE") => "fee",
        Symbol("POSITION_LIMIT_INCREASE_FEE") => "fee",
        Symbol("CONTRACT") => "trade",
        Symbol("REALIZED_PNL") => "trade",
        Symbol("TRANSFER") => "transfer",
        Symbol("CROSS_COLLATERAL_TRANSFER") => "transfer",
        Symbol("INTERNAL_TRANSFER") => "transfer",
        Symbol("COIN_SWAP_DEPOSIT") => "deposit",
        Symbol("COIN_SWAP_WITHDRAW") => "withdrawal",
        Symbol("OPTIONS_SETTLE_PROFIT") => "settlement",
        Symbol("DELIVERED_SETTELMENT") => "settlement",
        Symbol("WELCOME_BONUS") => "cashback",
        Symbol("CONTEST_REWARD") => "cashback",
        Symbol("COMMISSION_REBATE") => "rebate",
        Symbol("API_REBATE") => "rebate",
        Symbol("REFERRAL_KICKBACK") => "referral",
        Symbol("COMMISSION") => "commission"
    );
    return safeString(ledgerType, type_var, type_var)

end
function getNetworkCodeByNetworkUrl(self::Binance, currencyCode; depositUrl=nothing)
    if functions.ccxtruthy(depositUrl == nothing)
            return nothing
    end
    networkCode = nothing;
    currency = self.currency(currencyCode);
    networks = self.safeDict(currency, "networks", defaultValue = Dict{Symbol, Any}());
    networkCodes = objectKeys(networks);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(networkCodes)))
        currentNetworkCode = get(networkCodes, i + 1, nothing);
        info = self.safeDict(get(networks, Symbol(currentNetworkCode), nothing), "info", defaultValue = Dict{Symbol, Any}());
        siteUrl = safeString(info, "contractAddressUrl");
        baseDomain = self.getBaseDomainFromUrl(siteUrl);
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(siteUrl != nothing, baseDomain != nothing), startswith(depositUrl, baseDomain)))
            networkCode = currentNetworkCode;
        end
        i += 1
    end
    return networkCode

end
function getBaseDomainFromUrl(self::Binance, url)
    if functions.ccxtruthy(url == nothing)
            return nothing
    end
    urlParts = split(url, "/");
    scheme = safeString(urlParts, 0);
    if functions.ccxtruthy(scheme == nothing)
            return nothing
    end
    domain = safeString(urlParts, 2);
    if functions.ccxtruthy(domain == nothing)
            return nothing
    end
    return string(scheme, "//", domain, "/")

end
function sign(self::Binance, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    urls = self.urls;
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(api, get(urls, Symbol("api"), nothing)))))
        throw(NotSupported(string(self.id, " does not have a testnet/sandbox URL for ", api, " endpoints")));
    end
    url = get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing);
    url += string("/", path);
    if functions.ccxtruthy(path == "historicalTrades")
        if functions.ccxtruthy(self.apiKey)
            headers = Dict{Symbol, Any}(
                Symbol("X-MBX-APIKEY") => self.apiKey
            );
        else
            throw(AuthenticationError(string(self.id, " historicalTrades endpoint requires `apiKey` credential")));
        end
    end
    userDataStream = @functions.ccxt_or(@functions.ccxt_or((path == "userDataStream"), (path == "listenKey")), (path == "userListenToken"));
    if functions.ccxtruthy(userDataStream)
        if functions.ccxtruthy(self.apiKey)
            headers = Dict{Symbol, Any}(
                Symbol("X-MBX-APIKEY") => self.apiKey,
                Symbol("Content-Type") => "application/x-www-form-urlencoded"
            );
            if functions.ccxtruthy(method != "GET")
                body = self.urlencode(params);
            end
        else
            throw(AuthenticationError(string(self.id, " userDataStream endpoint requires `apiKey` credential")));
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((api == "private"), (api == "eapiPrivate")), (@functions.ccxt_and(api == "sapi", path != "system/status"))), (api == "sapiV2")), (api == "sapiV3")), (api == "sapiV4")), (api == "dapiPrivate")), (api == "dapiPrivateV2")), (api == "fapiPrivate")), (api == "fapiPrivateV2")), (api == "fapiPrivateV3")), (@functions.ccxt_or(api == "papiV2", @functions.ccxt_and(api == "papi", path != "ping")))))
        self.checkRequiredCredentials();
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((findfirst("testnet.binancefuture.com", url) !== nothing), self.isSandboxModeEnabled), (!functions.ccxtruthy(self.safeBool(self.options, "disableFuturesSandboxWarning")))))
            throw(NotSupported(string(self.id, " testnet/sandbox mode is not supported for futures anymore, please check the deprecation announcement https://t.me/ccxt_announcements/92 and consider using the demo trading instead.")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(method == "POST", (@functions.ccxt_or((path == "order"), (path == "sor/order")))))
            newClientOrderId = safeString(params, "newClientOrderId");
            if functions.ccxtruthy(newClientOrderId == nothing)
                isSpotOrMargin = (@functions.ccxt_or(findfirst("sapi", api) !== nothing, api == "private"));
                marketType = functions.ccxtruthy(isSpotOrMargin) ? "spot" : "future";
                defaultId = functions.ccxtruthy((!functions.ccxtruthy(isSpotOrMargin))) ? "x-xcKtGhcu" : "x-TKT5PX2F";
                broker = self.safeDict(self.options, "broker", defaultValue = Dict{Symbol, Any}());
                brokerId = safeString(broker, marketType, defaultId);
                params[Symbol("newClientOrderId")] = string(brokerId, uuid22());
            end
        end
        query = nothing;
        if functions.ccxtruthy(@functions.ccxt_and((path == "batchOrders"), (@functions.ccxt_or((method == "POST"), (method == "PUT")))))
            batchOrders = self.safeList(params, "batchOrders", defaultValue = []);
            checkedBatchOrders = batchOrders;
            if functions.ccxtruthy(@functions.ccxt_and(method == "POST", api == "fapiPrivate"))
                checkedBatchOrders = [];
                i = 0
                while functions.ccxtruthy(functions.ccxt_lt(i, length(batchOrders)))
                    batchOrder = get(batchOrders, i + 1, nothing);
                    newClientOrderId = safeString(batchOrder, "newClientOrderId");
                    if functions.ccxtruthy(newClientOrderId == nothing)
                        defaultId = "x-xcKtGhcu";
                        broker = self.safeDict(self.options, "broker", defaultValue = Dict{Symbol, Any}());
                        brokerId = safeString(broker, "future", defaultId);
                        newClientOrderId = string(brokerId, uuid22());
                        batchOrder[Symbol("newClientOrderId")] = newClientOrderId;
                    end
                    push!(checkedBatchOrders, batchOrder);
                    i += 1
                end

            end
            queryBatch = (json(checkedBatchOrders));
            params[Symbol("batchOrders")] = queryBatch;
        end
        defaultRecvWindow = safeInteger(self.options, "recvWindow");
        extendedParams = extend(Dict{Symbol, Any}(
            Symbol("timestamp") => self.nonce()
        ), params);
        if functions.ccxtruthy(defaultRecvWindow != nothing)
            extendedParams[Symbol("recvWindow")] = defaultRecvWindow;
        end
        recvWindow = safeInteger(params, "recvWindow");
        if functions.ccxtruthy(recvWindow != nothing)
            extendedParams[Symbol("recvWindow")] = recvWindow;
        end
        if functions.ccxtruthy(@functions.ccxt_and((api == "sapi"), (path == "asset/dust")))
            query = self.urlencodeWithArrayRepeat(extendedParams);
        elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((path == "batchOrders"), (findfirst("sub-account", path) !== nothing)), (path == "capital/withdraw/apply")), (findfirst("staking", path) !== nothing)), (findfirst("simple-earn", path) !== nothing)))
            if functions.ccxtruthy(@functions.ccxt_and((method == "DELETE"), (path == "batchOrders")))
                orderidlist = self.safeList(extendedParams, "orderidlist", defaultValue = []);
                origclientorderidlist = self.safeList2(extendedParams, "origclientorderidlist", "origClientOrderIdList", defaultValue = []);
                extendedParams = omit(extendedParams, ["orderidlist", "origclientorderidlist", "origClientOrderIdList"]);
                if functions.ccxtruthy(ccxt_in("symbol", extendedParams))
                    extendedParams[Symbol("symbol")] = self.encodeURIComponent(get(extendedParams, Symbol("symbol"), nothing));
                end
                query = self.rawencode(extendedParams);
                orderidlistLength = length(orderidlist);
                origclientorderidlistLength = length(origclientorderidlist);
                if functions.ccxtruthy(functions.ccxt_gt(orderidlistLength, 0))
                    query = string(query, "&", "orderidlist=%5B", join(orderidlist, "%2C"), "%5D");
                end
                if functions.ccxtruthy(functions.ccxt_gt(origclientorderidlistLength, 0))
                    newClientOrderIds = [];
                    i = 0
                    while functions.ccxtruthy(functions.ccxt_lt(i, origclientorderidlistLength))
                        push!(newClientOrderIds, string("%22", get(origclientorderidlist, i + 1, nothing), "%22"));
                        i += 1
                    end

                    query = string(query, "&", "origclientorderidlist=%5B", join(newClientOrderIds, "%2C"), "%5D");
                end
            else
                query = self.rawencode(extendedParams);
            end
        else
            query = self.urlencode(extendedParams);
        end
        signature = nothing;
        if functions.ccxtruthy(findfirst("PRIVATE KEY", self.secret) !== nothing)
            if functions.ccxtruthy(functions.ccxt_gt(length(self.secret), 120))
                signature = self.encodeURIComponent(rsa(query, self.secret, sha256));
            else
                signature = self.encodeURIComponent(eddsa(self.encode(query), self.secret, ed25519));
            end
        else
            signature = self.hmac(self.encode(query), self.encode(self.secret), sha256);
        end
        query += string("&", "signature=", signature);
        headers = Dict{Symbol, Any}(
            Symbol("X-MBX-APIKEY") => self.apiKey
        );
        if functions.ccxtruthy(@functions.ccxt_or((method == "GET"), (method == "DELETE")))
            url += string("?", query);
        else
            body = query;
            headers[Symbol("Content-Type")] = "application/x-www-form-urlencoded";
        end
    else
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.urlencode(params));
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function getExceptionsByUrl(self::Binance, url, exactOrBroad)
    if functions.ccxtruthy(url == nothing)
            return Dict{Symbol, Any}()
    end
    marketType = nothing;
    hostname = functions.ccxtruthy((self.hostname != nothing)) ? self.hostname : "binance.com";
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(startswith(url, string("https://api.", hostname, "/")), startswith(url, "https://demo-api")), startswith(url, "https://testnet.binance.vision")))
        marketType = "spot";
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(startswith(url, string("https://dapi.", hostname, "/")), startswith(url, "https://demo-dapi")), startswith(url, "https://testnet.binancefuture.com/dapi")))
        marketType = "inverse";
    else
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(startswith(url, string("https://fapi.", hostname, "/")), startswith(url, "https://demo-fapi")), startswith(url, "https://testnet.binancefuture.com/fapi")))
            marketType = "linear";
        elseif functions.ccxtruthy(startswith(url, string("https://eapi.", hostname, "/")))
            marketType = "option";
        else
            if functions.ccxtruthy(startswith(url, string("https://papi.", hostname, "/")))
                marketType = "portfolioMargin";
            end

        end

    end
    if functions.ccxtruthy(marketType != nothing)
        exceptionsForMarketType = self.safeDict(self.exceptions, marketType, defaultValue = Dict{Symbol, Any}());
            return self.safeDict(exceptionsForMarketType, exactOrBroad, defaultValue = Dict{Symbol, Any}())
    end
    return Dict{Symbol, Any}()

end
function handleErrors(self::Binance, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(@functions.ccxt_or((code == 418), (code == 429)))
        throw(DDoSProtection(string(self.id, " ", code, " ", reason, " ", body)));
    end
    if functions.ccxtruthy(@functions.ccxt_and((functions.ccxt_ge(code, 400)), (body != nothing)))
        if functions.ccxtruthy(findfirst("Price * QTY is zero or less", body) !== nothing)
            throw(InvalidOrder(string(self.id, " order cost = amount * price is zero or less ", body)));
        end
        if functions.ccxtruthy(findfirst("LOT_SIZE", body) !== nothing)
            throw(InvalidOrder(string(self.id, " order amount should be evenly divisible by lot size ", body)));
        end
        if functions.ccxtruthy(findfirst("PRICE_FILTER", body) !== nothing)
            throw(InvalidOrder(string(self.id, " order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid value in general, use this.priceToPrecision (symbol, amount) ", body)));
        end
    end
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    success = self.safeBool(response, "success", defaultValue = true);
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        messageNew = safeString(response, "msg");
        parsedMessage = nothing;
        if functions.ccxtruthy(messageNew != nothing)
            try
                parsedMessage = functions.ccxt_json_parse(messageNew);
            catch e
                parsedMessage = nothing;

            end
            if functions.ccxtruthy(parsedMessage != nothing)
                response = parsedMessage;
            end
        end
    end
    message = safeString(response, "msg");
    if functions.ccxtruthy(message != nothing)
        self.throwExactlyMatchedException(self.getExceptionsByUrl(url, "exact"), message, string(self.id, " ", message));
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, string(self.id, " ", message));
        self.throwBroadlyMatchedException(self.getExceptionsByUrl(url, "broad"), message, string(self.id, " ", message));
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, string(self.id, " ", message));
    end
    error = safeString(response, "code");
    if functions.ccxtruthy(error != nothing)
        if functions.ccxtruthy(@functions.ccxt_or((error == "200"), stringEquals(error, "0")))
                return nothing
        end
        if functions.ccxtruthy(@functions.ccxt_and((error == "-2015"), get(self.options, Symbol("hasAlreadyAuthenticatedSuccessfully"), nothing)))
            throw(DDoSProtection(string(self.id, " ", body)));
        end
        feedback = string(self.id, " ", body);
        if functions.ccxtruthy(message == "No need to change margin type.")
            throw(MarginModeAlreadySet(feedback));
        end
        self.throwExactlyMatchedException(self.getExceptionsByUrl(url, "exact"), error, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), error, feedback);
        throw(ExchangeError(feedback));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(success))
        throw(ExchangeError(string(self.id, " ", body)));
    end
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        arrayLength = length(response);
        if functions.ccxtruthy(arrayLength == 1)
            element = get(response, 1, nothing);
            errorCode = safeString(element, "code");
            if functions.ccxtruthy(errorCode != nothing)
                self.throwExactlyMatchedException(self.getExceptionsByUrl(url, "exact"), errorCode, string(self.id, " ", body));
                self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, string(self.id, " ", body));
            end
        end
    end
    return nothing

end
function calculateRateLimiterCost(self::Binance, api, method, path, params; config=Dict())
    if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("noCoin", config)), !functions.ccxtruthy((ccxt_in("coin", params)))))
            return get(config, Symbol("noCoin"), nothing)
    elseif functions.ccxtruthy(@functions.ccxt_and((ccxt_in("noSymbol", config)), !functions.ccxtruthy((ccxt_in("symbol", params)))))
        return get(config, Symbol("noSymbol"), nothing)
    else
        if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("noPoolId", config)), !functions.ccxtruthy((ccxt_in("poolId", params)))))
                return get(config, Symbol("noPoolId"), nothing)
        elseif functions.ccxtruthy(@functions.ccxt_and((ccxt_in("byLimit", config)), (ccxt_in("limit", params))))
            limit = get(params, Symbol("limit"), nothing);
            byLimit = safeValue(config, "byLimit");
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(byLimit)))
                entry = get(byLimit, i + 1, nothing);
                if functions.ccxtruthy(functions.ccxt_le(limit, get(entry, 1, nothing)))
                        return get(entry, 2, nothing)
                end
                i += 1
            end
        end

    end
    return safeValue(config, "cost", 1)

end
function request(self::Binance, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing, config=Dict())
    response = Base.fetch(self.fetch2(path, api = api, method = method, params = params, headers = headers, body = body, config = config));
    if functions.ccxtruthy(api == "private")
        self.options[Symbol("hasAlreadyAuthenticatedSuccessfully")] = true;
    end
    return response

end
function modifyMarginHelper(self::Binance, symbol, amount, addOrReduce; params=Dict())
    defaultType = safeString(self.options, "defaultType", "future");
    if functions.ccxtruthy(defaultType == "spot")
        defaultType = "future";
    end
    type_var = safeString(params, "type", defaultType);
    if functions.ccxtruthy(@functions.ccxt_or((type_var == "margin"), (type_var == "spot")))
        throw(NotSupported(string(self.id, " add / reduce margin only supported with type future or delivery")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    amount = self.amountToPrecision(symbol, amount);
    request = Dict{Symbol, Any}(
        Symbol("type") => addOrReduce,
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("amount") => amount
    );
    response = nothing;
    code = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        code = get(market, Symbol("quote"), nothing);
        response = Base.fetch(self.fapiPrivatePostPositionMargin(extend(request, params)));
    else
        code = get(market, Symbol("base"), nothing);
        response = Base.fetch(self.dapiPrivatePostPositionMargin(extend(request, params)));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseMarginModification() returned empty response")));
    end
    return extend(self.parseMarginModification(response, market = market), Dict{Symbol, Any}(
    Symbol("code") => code
))

end
function parseMarginModification(self::Binance, data; market=nothing)
    rawType = safeInteger(data, "type");
    errorCode = safeString(data, "code");
    marketId = safeString(data, "symbol");
    timestamp = safeInteger(data, "time");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "swap");
    noErrorCode = errorCode == nothing;
    success = errorCode == "200";
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => functions.ccxtruthy((rawType == 1)) ? "add" : "reduce",
    Symbol("marginMode") => "isolated",
    Symbol("amount") => self.safeNumber(data, "amount"),
    Symbol("code") => safeString(data, "asset"),
    Symbol("total") => nothing,
    Symbol("status") => functions.ccxtruthy((@functions.ccxt_or(success, noErrorCode))) ? "ok" : "failed",
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
remove margin from a position
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Binance, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, 2, params = params))

end
"""
add margin
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Binance, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, 1, params = params))

end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Margin-Interest-Rate-History

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [borrow rate structure]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
function fetchCrossBorrowRate(self::Binance, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.sapiGetMarginInterestRateHistory(extend(request, params)));
    rate = self.safeDict(response, 0);
    return self.parseBorrowRate(rate)

end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.vipLevel`::object, optional: user's current specific margin data will be returned if viplevel is omitted

# Returns
- an [isolated borrow rate structure]{@link https://docs.ccxt.com/?id=isolated-borrow-rate-structure}
"""
function fetchIsolatedBorrowRate(self::Binance, symbol; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("symbol") => symbol
    );
    borrowRates = Base.fetch(self.fetchIsolatedBorrowRates(params = extend(request, params)));
    return self.safeDict(borrowRates, symbol)

end
"""
fetch the borrow interest rates of all currencies
see: https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.symbol`::object, optional: unified market symbol EXCHANGE SPECIFIC PARAMETERS
- `params.vipLevel`::object, optional: user's current specific margin data will be returned if viplevel is omitted

# Returns
- a [borrow rate structure]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
function fetchIsolatedBorrowRates(self::Binance; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    symbol = safeString(params, "symbol");
    params = omit(params, "symbol");
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.sapiGetMarginIsolatedMarginData(extend(request, params)));
    return self.parseIsolatedBorrowRates(response)

end
"""
retrieves a history of a currencies borrow interest rate at specific time slots
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Margin-Interest-Rate-History

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: timestamp for the earliest borrow rate
- `limit`::int, optional: the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
function fetchBorrowRateHistory(self::Binance, code; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 93;
    elseif functions.ccxtruthy(functions.ccxt_gt(limit, 93))
        throw(BadRequest(string(self.id, " fetchBorrowRateHistory() limit parameter cannot exceed 92")));
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("limit") => limit
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
        endTime = self.sum(since, limit * 86400000) - 1;
        now = milliseconds();
        request[Symbol("endTime")] = min(endTime, now);
    end
    response = Base.fetch(self.sapiGetMarginInterestRateHistory(extend(request, params)));
    return self.parseBorrowRateHistory(response, code, since, limit)

end
function parseBorrowRate(self::Binance, info; currency=nothing)
    timestamp = safeInteger(info, "timestamp");
    currencyId = safeString(info, "asset");
    return Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("rate") => self.safeNumber(info, "dailyInterestRate"),
    Symbol("period") => 86400000,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
function parseIsolatedBorrowRate(self::Binance, info; market=nothing)
    marketId = safeString(info, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "spot");
    data = self.safeList(info, "data");
    baseInfo = self.safeDict(data, 0);
    quoteInfo = self.safeDict(data, 1);
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("base") => safeString(baseInfo, "coin"),
    Symbol("baseRate") => self.safeNumber(baseInfo, "dailyInterest"),
    Symbol("quote") => safeString(quoteInfo, "coin"),
    Symbol("quoteRate") => self.safeNumber(quoteInfo, "dailyInterest"),
    Symbol("period") => 86400000,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
create gift code
see: https://developers.binance.com/docs/gift_card/market-data/Create-a-single-token-gift-card

# Arguments
- `code`::string: gift code
- `amount`::float: amount of currency for the gift
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- The gift code id, code, currency and amount
"""
function createGiftCode(self::Binance, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("token") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amount
    );
    response = Base.fetch(self.sapiPostGiftcardCreateCode(extend(request, params)));
    data = self.safeDict(response, "data");
    giftcardCode = safeString(data, "code");
    id = safeString(data, "referenceNo");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => id,
    Symbol("code") => giftcardCode,
    Symbol("currency") => code,
    Symbol("amount") => amount
)

end
"""
redeem gift code
see: https://developers.binance.com/docs/gift_card/market-data/Redeem-a-Binance-Gift-Card

# Arguments
- `giftcardCode`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function redeemGiftCode(self::Binance, giftcardCode; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("code") => giftcardCode
    );
    response = Base.fetch(self.sapiPostGiftcardRedeemCode(extend(request, params)));
    return response

end
"""
verify gift code
see: https://developers.binance.com/docs/gift_card/market-data/Verify-Binance-Gift-Card-by-Gift-Card-Number

# Arguments
- `id`::string: reference number id
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function verifyGiftCode(self::Binance, id; params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("referenceNo") => id
    );
    response = Base.fetch(self.sapiGetGiftcardVerify(extend(request, params)));
    return response

end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Get-Interest-History
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-Margin-BorrowLoan-Interest-History

# Arguments
- `code`::string, optional: unified currency code
- `symbol`::string, optional: unified market symbol when fetch interest in isolated markets
- `since`::int, optional: the earliest time in ms to fetch borrrow interest for
- `limit`::int, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch the borrow interest in a portfolio margin account

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
function fetchBorrowInterest(self::Binance; code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchBorrowInterest", "papi", "portfolioMargin", defaultValue = false);
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("asset")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = nothing;
    if functions.ccxtruthy(isPortfolioMargin)
        response = Base.fetch(self.papiGetMarginMarginInterestHistory(extend(request, params)));
    else
        if functions.ccxtruthy(symbol != nothing)
            market = self.market(symbol);
            request[Symbol("isolatedSymbol")] = get(market, Symbol("id"), nothing);
        end
        response = Base.fetch(self.sapiGetMarginInterestHistory(extend(request, params)));
    end
    rows = self.safeList(response, "rows");
    interest = self.parseBorrowInterests(rows, market = market);
    return self.filterByCurrencySinceLimit(interest, code = code, since = since, limit = limit)

end
function parseBorrowInterest(self::Binance, info; market=nothing)
    symbol = safeString(info, "isolatedSymbol");
    timestamp = safeInteger(info, "interestAccuredTime");
    marginMode = functions.ccxtruthy((symbol == nothing)) ? "cross" : "isolated";
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => symbol,
    Symbol("currency") => self.safeCurrencyCode(safeString(info, "asset")),
    Symbol("interest") => self.safeNumber(info, "interest"),
    Symbol("interestRate") => self.safeNumber(info, "interestRate"),
    Symbol("amountBorrowed") => self.safeNumber(info, "principal"),
    Symbol("marginMode") => marginMode,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
repay borrowed margin and interest
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Repay
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Repay-Debt

# Arguments
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to repay margin in a portfolio margin account
- `params.repayCrossMarginMethod`::string, optional: *portfolio margin only* 'papiPostRepayLoan' (default), 'papiPostMarginRepayDebt' (alternative)
- `params.specifyRepayAssets`::string, optional: *portfolio margin papiPostMarginRepayDebt only* specific asset list to repay debt

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function repayCrossMargin(self::Binance, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = nothing;
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "repayCrossMargin", "papi", "portfolioMargin", defaultValue = false);
    if functions.ccxtruthy(isPortfolioMargin)
        method = nothing;
        (method, params) = self.handleOptionAndParams2(params, "repayCrossMargin", "repayCrossMarginMethod", "method");
        if functions.ccxtruthy(method == "papiPostMarginRepayDebt")
            response = Base.fetch(self.papiPostMarginRepayDebt(extend(request, params)));
        else
            response = Base.fetch(self.papiPostRepayLoan(extend(request, params)));
        end
    else
        request[Symbol("isIsolated")] = "FALSE";
        request[Symbol("type")] = "REPAY";
        response = Base.fetch(self.sapiPostMarginBorrowRepay(extend(request, params)));
    end
    return self.parseMarginLoan(response, currency = currency)

end
"""
repay borrowed margin and interest
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay

# Arguments
- `symbol`::string: unified market symbol, required for isolated margin
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function repayIsolatedMargin(self::Binance, symbol, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("isIsolated") => "TRUE",
        Symbol("type") => "REPAY"
    );
    response = Base.fetch(self.sapiPostMarginBorrowRepay(extend(request, params)));
    return self.parseMarginLoan(response, currency = currency)

end
"""
create a loan to borrow margin
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Borrow

# Arguments
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to borrow margin in a portfolio margin account

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function borrowCrossMargin(self::Binance, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = nothing;
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "borrowCrossMargin", "papi", "portfolioMargin", defaultValue = false);
    if functions.ccxtruthy(isPortfolioMargin)
        response = Base.fetch(self.papiPostMarginLoan(extend(request, params)));
    else
        request[Symbol("isIsolated")] = "FALSE";
        request[Symbol("type")] = "BORROW";
        response = Base.fetch(self.sapiPostMarginBorrowRepay(extend(request, params)));
    end
    return self.parseMarginLoan(response, currency = currency)

end
"""
create a loan to borrow margin
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay

# Arguments
- `symbol`::string: unified market symbol, required for isolated margin
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function borrowIsolatedMargin(self::Binance, symbol, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("isIsolated") => "TRUE",
        Symbol("type") => "BORROW"
    );
    response = Base.fetch(self.sapiPostMarginBorrowRepay(extend(request, params)));
    return self.parseMarginLoan(response, currency = currency)

end
function parseMarginLoan(self::Binance, info; currency=nothing)
    currencyId = safeString(info, "asset");
    timestamp = safeInteger(info, "updateTime");
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(info, "tranId"),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber(info, "amount"),
    Symbol("symbol") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
"""
Retrieves the open interest history of a currency
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Open-Interest-Statistics
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Open-Interest-Statistics

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `timeframe`::string: "5m","15m","30m","1h","2h","4h","6h","12h", or "1d"
- `since`::int, optional: the time(ms) of the earliest record to retrieve as a unix timestamp
- `limit`::int, optional: default 30, max 500
- `params`::object, optional: exchange specific parameters
- `params.until`::int, optional: the time(ms) of the latest record to retrieve as a unix timestamp
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterestHistory(self::Binance, symbol; timeframe="5m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(timeframe == "1m")
        throw(BadRequest(string(self.id, " fetchOpenInterestHistory cannot use the 1m timeframe")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenInterestHistory", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOpenInterestHistory", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 500))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("period") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    symbolKey = functions.ccxtruthy(get(market, Symbol("linear"), nothing)) ? "symbol" : "pair";
    request[Symbol(symbolKey)] = get(market, Symbol("id"), nothing);
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        request[Symbol("contractType")] = safeString(params, "contractType", "CURRENT_QUARTER");
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    endTime = safeInteger(params, "endTime", until);
    params = omit(params, ["endTime", "until"]);
    if functions.ccxtruthy(endTime)
        request[Symbol("endTime")] = endTime;
    elseif functions.ccxtruthy(since)
        if functions.ccxtruthy(limit == nothing)
            limit = 30;
        end
        duration = self.parseTimeframe(timeframe);
        request[Symbol("endTime")] = self.sum(since, duration * limit * 1000);
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.dapiDataGetOpenInterestHist(extend(request, params)));
    else
        response = Base.fetch(self.fapiDataGetOpenInterestHist(extend(request, params)));
    end
    return self.parseOpenInterestsHistory(response, market = market, since = since, limit = limit)

end
"""
retrieves the open interest of a contract trading pair
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Open-Interest
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Open-Interest
see: https://developers.binance.com/docs/derivatives/option/market-data/Open-Interest

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Binance, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        request[Symbol("underlyingAsset")] = get(market, Symbol("baseId"), nothing);
        if functions.ccxtruthy(get(market, Symbol("expiry"), nothing) == nothing)
            throw(NotSupported(string(self.id, " fetchOpenInterest does not support ", symbol)));
        end
        request[Symbol("expiration")] = self.yymmdd(get(market, Symbol("expiry"), nothing));
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.eapiPublicGetOpenInterest(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.dapiPublicGetOpenInterest(extend(request, params)));
    else
        response = Base.fetch(self.fapiPublicGetOpenInterest(extend(request, params)));
    end
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        symbol = get(market, Symbol("symbol"), nothing);
        result = self.parseOpenInterestsHistory(response, market = market);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
            item = get(result, i + 1, nothing);
            if functions.ccxtruthy(get(item, Symbol("symbol"), nothing) == symbol)
                    return item
            end
            i += 1
        end

        throw(NullResponse(string(self.id, " fetchOpenInterest() could not find open interest for ", symbol)));
    else
        return self.parseOpenInterest(response, market = market)
    end

end
function parseOpenInterest(self::Binance, interest; market=nothing)
    timestamp = safeInteger2(interest, "timestamp", "time");
    id = safeString(interest, "symbol");
    amount = self.safeNumber2(interest, "sumOpenInterest", "openInterest");
    value = self.safeNumber2(interest, "sumOpenInterestValue", "sumOpenInterestUsd");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(id, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("baseVolume") => functions.ccxtruthy(self.safeBool(market, "inverse")) ? nothing : amount,
    Symbol("quoteVolume") => value,
    Symbol("openInterestAmount") => amount,
    Symbol("openInterestValue") => value,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
"""
retrieves the users liquidated positions
see: https://developers.binance.com/docs/margin_trading/trade/Get-Force-Liquidation-Record
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Users-Force-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Users-Force-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-UM-Force-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-CM-Force-Orders

# Arguments
- `symbol`::string, optional: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the binance api endpoint
- `params.until`::int, optional: timestamp in ms of the latest liquidation
- `params.paginate`::bool, optional: *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch liquidations in a portfolio margin account
- `params.type`::string, optional: "spot"
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
function fetchMyLiquidations(self::Binance; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyLiquidations", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchMyLiquidations", symbol = symbol, since = since, limit = limit, params = params, pageKey = "current", maxEntriesPerRequest = 100))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchMyLiquidations", market = market, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMyLiquidations", market = market, params = params, defaultValue = "linear");
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchMyLiquidations", "papi", "portfolioMargin", defaultValue = false);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(type_var != "spot")
        request[Symbol("autoCloseType")] = "LIQUIDATION";
    end
    if functions.ccxtruthy(market != nothing)
        symbolKey = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "isolatedSymbol" : "symbol";
        if functions.ccxtruthy(!functions.ccxtruthy(isPortfolioMargin))
            request[Symbol(symbolKey)] = get(market, Symbol("id"), nothing);
        end
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(type_var == "spot")
            request[Symbol("size")] = limit;
        else
            request[Symbol("limit")] = limit;
        end
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = nothing;
    if functions.ccxtruthy(type_var == "spot")
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetMarginForceOrders(extend(request, params)));
        else
            response = Base.fetch(self.sapiGetMarginForceLiquidationRec(extend(request, params)));
        end
    elseif functions.ccxtruthy(subType == "linear")
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetUmForceOrders(extend(request, params)));
        else
            response = Base.fetch(self.fapiPrivateGetForceOrders(extend(request, params)));
        end
    else
        if functions.ccxtruthy(subType == "inverse")
            if functions.ccxtruthy(isPortfolioMargin)
                response = Base.fetch(self.papiGetCmForceOrders(extend(request, params)));
            else
                response = Base.fetch(self.dapiPrivateGetForceOrders(extend(request, params)));
            end
        else
            throw(NotSupported(string(self.id, " fetchMyLiquidations() does not support ", safeString(market, "type"), " markets")));
        end

    end
    liquidationsList = [];
    rows = self.safeList(response, "rows");
    if functions.ccxtruthy(rows != nothing)
        liquidationsList = rows;
    elseif functions.ccxtruthy(functions.ccxt_isArray(response))
        liquidationsList = response;
    end
    return self.parseLiquidations(liquidationsList, market = market, since = since, limit = limit)

end
function parseLiquidation(self::Binance, liquidation; market=nothing)
    marketId = safeString(liquidation, "symbol");
    timestamp = safeInteger2(liquidation, "updatedTime", "updateTime");
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("contracts") => self.safeNumber(liquidation, "executedQty"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("price") => self.safeNumber(liquidation, "avgPrice"),
    Symbol("side") => safeStringLower(liquidation, "side"),
    Symbol("baseValue") => self.safeNumber(liquidation, "cumBase"),
    Symbol("quoteValue") => self.safeNumber(liquidation, "cumQuote"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
"""
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://developers.binance.com/docs/derivatives/option/market-data/Option-Mark-Price

# Arguments
- `symbol`::string: unified symbol of the market to fetch greeks for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
function fetchGreeks(self::Binance, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.eapiPublicGetMark(extend(request, params)));
    return self.parseGreeks(self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}()), market = market)

end
"""
fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://developers.binance.com/docs/derivatives/option/market-data/Option-Mark-Price

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch greeks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
function fetchAllGreeks(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 1)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    response = Base.fetch(self.eapiPublicGetMark(extend(request, params)));
    return self.parseAllGreeks(response, symbols = symbols)

end
function parseGreeks(self::Binance, greeks; market=nothing)
    marketId = safeString(greeks, "symbol");
    symbol = self.safeSymbol(marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("delta") => self.safeNumber(greeks, "delta"),
    Symbol("gamma") => self.safeNumber(greeks, "gamma"),
    Symbol("theta") => self.safeNumber(greeks, "theta"),
    Symbol("vega") => self.safeNumber(greeks, "vega"),
    Symbol("rho") => nothing,
    Symbol("bidSize") => nothing,
    Symbol("askSize") => nothing,
    Symbol("bidImpliedVolatility") => self.safeNumber(greeks, "bidIV"),
    Symbol("askImpliedVolatility") => self.safeNumber(greeks, "askIV"),
    Symbol("markImpliedVolatility") => self.safeNumber(greeks, "markIV"),
    Symbol("bidPrice") => nothing,
    Symbol("askPrice") => nothing,
    Symbol("markPrice") => self.safeNumber(greeks, "markPrice"),
    Symbol("lastPrice") => nothing,
    Symbol("underlyingPrice") => nothing,
    Symbol("info") => greeks
)

end
function fetchTradingLimits(self::Binance; symbols=nothing, params=Dict())
    markets = Base.fetch(self.fetchMarkets());
    tradingLimits = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        symbol = safeString(market, "symbol");
        if functions.ccxtruthy(market == nothing)
            throw(ExchangeError(string(self.id, " fetchTradingLimits() could not resolve market")));
        end
        if functions.ccxtruthy(@functions.ccxt_or((symbols == nothing), (inArray(symbol, symbols))))
            if functions.ccxtruthy(symbol != nothing)
                tradingLimits[Symbol(symbol)] = get(get(market, Symbol("limits"), nothing), Symbol("amount"), nothing);
            end
        end
        i += 1
    end
    return tradingLimits

end
"""
fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Current-Position-Mode
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Get-Current-Position-Mode

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
function fetchPositionMode(self::Binance; symbol=nothing, params=Dict())
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchPositionMode", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.dapiPrivateGetPositionSideDual(params));
    else
        response = Base.fetch(self.fapiPrivateGetPositionSideDual(params));
    end
    dualSidePosition = self.safeBool(response, "dualSidePosition");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("hedged") => dualSidePosition
)

end
"""
fetches margin modes ("isolated" or "cross") that the market for the symbol in in, with symbol=undefined all markets for a subType (linear/inverse) are returned
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config

# Arguments
- `symbols`::array: unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginModes(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols = symbols);
        market = self.market(get(symbols, 1, nothing));
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMarginMode", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "linear")
        response = Base.fetch(self.fapiPrivateGetSymbolConfig(params));
    elseif functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.dapiPrivateGetAccount(params));
    else
        throw(BadRequest(string(self.id, " fetchMarginModes () supports linear and inverse subTypes only")));
    end
    assets = self.safeList(response, "positions", defaultValue = []);
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        assets = response;
    end
    return self.parseMarginModes(assets, symbols = symbols, symbolKey = "symbol", marketType = "swap")

end
"""
fetches the margin mode of a specific symbol
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information

# Arguments
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginMode(self::Binance, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMarginMode", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "linear")
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing)
        );
        response = Base.fetch(self.fapiPrivateGetSymbolConfig(extend(request, params)));
    elseif functions.ccxtruthy(subType == "inverse")
        fetchMarginModesResponse = Base.fetch(self.fetchMarginModes(symbols = [symbol], params = params));
        return get(fetchMarginModesResponse, Symbol(symbol), nothing)
    else
        throw(BadRequest(string(self.id, " fetchMarginMode () supports linear and inverse subTypes only")));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " fetchMarginMode() returned empty response")));
    end
    return self.parseMarginMode(get(response, 1, nothing), market = market)

end
function parseMarginMode(self::Binance, marginMode; market=nothing)
    marketId = safeString(marginMode, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    marginModeRaw = self.safeBool(marginMode, "isolated");
    reMarginMode = nothing;
    if functions.ccxtruthy(marginModeRaw != nothing)
        reMarginMode = functions.ccxtruthy(marginModeRaw) ? "isolated" : "cross";
    end
    marginTypeRaw = safeStringLower(marginMode, "marginType");
    if functions.ccxtruthy(marginTypeRaw != nothing)
        reMarginMode = functions.ccxtruthy((marginTypeRaw == "crossed")) ? "cross" : "isolated";
    end
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => reMarginMode
)

end
"""
fetches option data that is commonly found in an option chain
see: https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [option chain structure]{@link https://docs.ccxt.com/?id=option-chain-structure}
"""
function fetchOption(self::Binance, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.eapiPublicGetTicker(extend(request, params)));
    chain = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseOption(chain, currency = nothing, market = market)

end
function parseOption(self::Binance, chain; currency=nothing, market=nothing)
    marketId = safeString(chain, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => chain,
    Symbol("currency") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("impliedVolatility") => nothing,
    Symbol("openInterest") => nothing,
    Symbol("bidPrice") => self.safeNumber(chain, "bidPrice"),
    Symbol("askPrice") => self.safeNumber(chain, "askPrice"),
    Symbol("midPrice") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => self.safeNumber(chain, "lastPrice"),
    Symbol("underlyingPrice") => self.safeNumber(chain, "exercisePrice"),
    Symbol("change") => self.safeNumber(chain, "priceChange"),
    Symbol("percentage") => self.safeNumber(chain, "priceChangePercent"),
    Symbol("baseVolume") => self.safeNumber(chain, "volume"),
    Symbol("quoteVolume") => nothing
)

end
"""
fetches the history of margin added or reduced from contract isolated positions
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Get-Position-Margin-Change-History
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Get-Position-Margin-Change-History

# Arguments
- `symbol`::string: unified market symbol
- `type`::string, optional: "add" or "reduce"
- `since`::int, optional: timestamp in ms of the earliest change to fetch
- `limit`::int, optional: the maximum amount of changes to fetch
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest change to fetch

# Returns
- a list of [margin structures]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function fetchMarginAdjustmentHistory(self::Binance; symbol=nothing, type_var=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMarginAdjustmentHistory () requires a symbol argument")));
    end
    market = self.market(symbol);
    until = safeInteger(params, "until");
    params = omit(params, "until");
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(type_var != nothing)
        request[Symbol("type")] = functions.ccxtruthy((type_var == "add")) ? 1 : 2;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.fapiPrivateGetPositionMarginHistory(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.dapiPrivateGetPositionMarginHistory(extend(request, params)));
    else
        throw(BadRequest(string(self.id, " fetchMarginAdjustmentHistory () is not supported for markets of type ", get(market, Symbol("type"), nothing))));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseMarginModifications() returned empty response")));
    end
    modifications = self.parseMarginModifications(toArray(response));
    return self.filterBySymbolSinceLimit(modifications, symbol = symbol, since = since, limit = limit)

end
"""
fetches all available currencies that can be converted
see: https://developers.binance.com/docs/convert/market-data/Query-order-quantity-precision-per-asset

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchConvertCurrencies(self::Binance; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.sapiGetConvertAssetInfo(params));
    result = Dict{Symbol, Any}();
    assets = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(assets)))
        entry = get(assets, i + 1, nothing);
        id = safeString(entry, "asset");
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
                Symbol("withdraw") => nothing,
                Symbol("fee") => nothing,
                Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(entry, "fraction"))),
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
            );
        end
        i += 1
    end
    return result

end
"""
fetch a quote for converting from one currency to another
see: https://developers.binance.com/docs/convert/trade/Send-quote-request

# Arguments
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.walletType`::string, optional: either 'SPOT' or 'FUNDING', the default is 'SPOT'

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertQuote(self::Binance, fromCode, toCode; amount=nothing, params=Dict())
    if functions.ccxtruthy(amount == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchConvertQuote() requires an amount argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("fromAsset") => fromCode,
        Symbol("toAsset") => toCode,
        Symbol("fromAmount") => amount
    );
    response = Base.fetch(self.sapiPostConvertGetQuote(extend(request, params)));
    fromCurrency = self.currency(fromCode);
    toCurrency = self.currency(toCode);
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseConversion() returned empty response")));
    end
    return self.parseConversion(response, fromCurrency = fromCurrency, toCurrency = toCurrency)

end
"""
convert from one currency to another
see: https://developers.binance.com/docs/convert/trade/Accept-Quote

# Arguments
- `id`::string: the id of the trade that you want to make
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function createConvertTrade(self::Binance, id, fromCode, toCode; amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((fromCode == "BUSD"), (toCode == "BUSD")))
        if functions.ccxtruthy(amount == nothing)
            throw(ArgumentsRequired(string(self.id, " createConvertTrade() requires an amount argument")));
        end
        request[Symbol("clientTranId")] = id;
        request[Symbol("asset")] = fromCode;
        request[Symbol("targetAsset")] = toCode;
        request[Symbol("amount")] = amount;
        response = Base.fetch(self.sapiPostAssetConvertTransfer(extend(request, params)));
    else
        request[Symbol("quoteId")] = id;
        response = Base.fetch(self.sapiPostConvertAcceptQuote(extend(request, params)));
    end
    fromCurrency = self.currency(fromCode);
    toCurrency = self.currency(toCode);
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseConversion() returned empty response")));
    end
    return self.parseConversion(response, fromCurrency = fromCurrency, toCurrency = toCurrency)

end
"""
fetch the data for a conversion trade
see: https://developers.binance.com/docs/convert/trade/Order-Status

# Arguments
- `id`::string: the id of the trade that you want to fetch
- `code`::string, optional: the unified currency code of the conversion trade
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertTrade(self::Binance, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(code == "BUSD")
        msInDay = 86400000;
        now = milliseconds();
        if functions.ccxtruthy(code != nothing)
            currency = self.currency(code);
            request[Symbol("asset")] = get(currency, Symbol("id"), nothing);
        end
        request[Symbol("tranId")] = id;
        request[Symbol("startTime")] = now - msInDay;
        request[Symbol("endTime")] = now;
        response = Base.fetch(self.sapiGetAssetConvertTransferQueryByPage(extend(request, params)));
    else
        request[Symbol("orderId")] = id;
        response = Base.fetch(self.sapiGetConvertOrderStatus(extend(request, params)));
    end
    data = response;
    if functions.ccxtruthy(code == "BUSD")
        rows = self.safeList(response, "rows", defaultValue = []);
        data = self.safeDict(rows, 0, defaultValue = Dict{Symbol, Any}());
    end
    fromCurrencyId = safeString2(data, "deductedAsset", "fromAsset");
    toCurrencyId = safeString2(data, "targetAsset", "toAsset");
    fromCurrency = nothing;
    toCurrency = nothing;
    if functions.ccxtruthy(fromCurrencyId != nothing)
        fromCurrency = self.currency(fromCurrencyId);
    end
    if functions.ccxtruthy(toCurrencyId != nothing)
        toCurrency = self.currency(toCurrencyId);
    end
    if functions.ccxtruthy(data == nothing)
        throw(NullResponse(string(self.id, " parseConversion() returned empty response")));
    end
    return self.parseConversion(data, fromCurrency = fromCurrency, toCurrency = toCurrency)

end
"""
fetch the users history of conversion trades
see: https://developers.binance.com/docs/convert/trade/Get-Convert-Trade-History

# Arguments
- `code`::string, optional: the unified currency code
- `since`::int, optional: the earliest time in ms to fetch conversions for
- `limit`::int, optional: the maximum number of conversion structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest conversion to fetch

# Returns
- a list of [conversion structures]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertTradeHistory(self::Binance; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    msInThirtyDays = 2592000000;
    now = milliseconds();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    else
        request[Symbol("startTime")] = now - msInThirtyDays;
    end
    endTime = safeInteger2(params, "endTime", "until");
    if functions.ccxtruthy(endTime != nothing)
        request[Symbol("endTime")] = endTime;
    else
        request[Symbol("endTime")] = now;
    end
    params = omit(params, "until");
    response = nothing;
    responseQuery = nothing;
    fromCurrencyKey = nothing;
    toCurrencyKey = nothing;
    if functions.ccxtruthy(code == "BUSD")
        currency = self.currency(code);
        request[Symbol("asset")] = get(currency, Symbol("id"), nothing);
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("size")] = limit;
        end
        fromCurrencyKey = "deductedAsset";
        toCurrencyKey = "targetAsset";
        responseQuery = "rows";
        response = Base.fetch(self.sapiGetAssetConvertTransferQueryByPage(extend(request, params)));
    else
        if functions.ccxtruthy(functions.ccxt_gt((get(request, Symbol("endTime"), nothing) - get(request, Symbol("startTime"), nothing)), msInThirtyDays))
            throw(BadRequest(string(self.id, " fetchConvertTradeHistory () the max interval between startTime and endTime is 30 days.")));
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        fromCurrencyKey = "fromAsset";
        toCurrencyKey = "toAsset";
        responseQuery = "list";
        response = Base.fetch(self.sapiGetConvertTradeFlow(extend(request, params)));
    end
    rows = self.safeList(response, responseQuery, defaultValue = []);
    return self.parseConversions(rows, code = code, fromCurrencyKey = fromCurrencyKey, toCurrencyKey = toCurrencyKey, since = since, limit = limit)

end
function parseConversion(self::Binance, conversion; fromCurrency=nothing, toCurrency=nothing)
    timestamp = safeIntegerN(conversion, ["time", "validTimestamp", "createTime"]);
    fromCur = safeString2(conversion, "deductedAsset", "fromAsset");
    fromCode = self.safeCurrencyCode(fromCur, currency = fromCurrency);
    to = safeString2(conversion, "targetAsset", "toAsset");
    toCode = self.safeCurrencyCode(to, currency = toCurrency);
    return Dict{Symbol, Any}(
    Symbol("info") => conversion,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeStringN(conversion, ["tranId", "orderId", "quoteId"]),
    Symbol("fromCurrency") => fromCode,
    Symbol("fromAmount") => self.safeNumber2(conversion, "deductedAmount", "fromAmount"),
    Symbol("toCurrency") => toCode,
    Symbol("toAmount") => self.safeNumber2(conversion, "targetAmount", "toAmount"),
    Symbol("price") => nothing,
    Symbol("fee") => nothing
)

end
"""
fetch the funding rate interval for multiple markets
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-Info
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Get-Funding-Info

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingIntervals(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols = symbols);
        market = self.market(get(symbols, 1, nothing));
    end
    type_var = "swap";
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchFundingIntervals", market = market, params = params, defaultValue = "linear");
    response = nothing;
    if functions.ccxtruthy(self.isLinear(type_var, subType = subType))
        response = Base.fetch(self.fapiPublicGetFundingInfo(params));
    elseif functions.ccxtruthy(self.isInverse(type_var, subType = subType))
        response = Base.fetch(self.dapiPublicGetFundingInfo(params));
    else
        throw(NotSupported(string(self.id, " fetchFundingIntervals() supports linear and inverse swap contracts only")));
    end
    return self.parseFundingRates(response, symbols = symbols)

end
"""
fetches the long short ratio history for a unified market symbol
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Long-Short-Ratio
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Long-Short-Ratio

# Arguments
- `symbol`::string: unified symbol of the market to fetch the long short ratio for
- `timeframe`::string, optional: the period for the ratio, default is 24 hours
- `since`::int, optional: the earliest time in ms to fetch ratios for
- `limit`::int, optional: the maximum number of long short ratio structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ratio to fetch

# Returns
- an array of [long short ratio structures]{@link https://docs.ccxt.com/?id=long-short-ratio-structure}
"""
function fetchLongShortRatioHistory(self::Binance; symbol=nothing, timeframe=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(timeframe == nothing)
        timeframe = "1d";
    end
    request = Dict{Symbol, Any}(
        Symbol("period") => timeframe
    );
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchLongShortRatioHistory", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "linear")
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.fapiDataGetGlobalLongShortAccountRatio(extend(request, params)));
    elseif functions.ccxtruthy(subType == "inverse")
        request[Symbol("pair")] = get(get(market, Symbol("info"), nothing), Symbol("pair"), nothing);
        response = Base.fetch(self.dapiDataGetGlobalLongShortAccountRatio(extend(request, params)));
    else
        throw(BadRequest(string(self.id, " fetchLongShortRatioHistory() supports linear and inverse subTypes only")));
    end
    return self.parseLongShortRatioHistory(response, market = market)

end
function parseLongShortRatio(self::Binance, info; market=nothing)
    marketId = safeString(info, "symbol");
    timestamp = self.safeIntegerOmitZero(info, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timeframe") => nothing,
    Symbol("longShortRatio") => self.safeNumber(info, "longShortRatio")
)

end
"""
fetches the auto deleveraging rank and risk percentage for a symbol
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/ADL-Risk

# Arguments
- `symbol`::string: unified symbol of the market to fetch the auto deleveraging rank for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [auto de leverage structure]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
function fetchADLRank(self::Binance, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchADLRank", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "linear")
        response = Base.fetch(self.fapiPublicGetSymbolAdlRisk(extend(request, params)));
    else
        throw(BadRequest(string(self.id, " fetchADLRank() supports linear subTypes only")));
    end
    if functions.ccxtruthy(response == nothing)
        throw(NullResponse(string(self.id, " parseADLRank() returned empty response")));
    end
    return self.parseADLRank(response, market = market)

end
"""
fetches the auto deleveraging rank and risk percentage for a list of symbols that have open positions
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-ADL-Quantile-Estimation
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-ADL-Quantile-Estimation
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/UM-Position-ADL-Quantile-Estimation
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/CM-Position-ADL-Quantile-Estimation

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true for the portfolio margin account

# Returns
- an array of [auto de leverage structure]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
function fetchPositionsADLRank(self::Binance; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    market = self.getMarketFromSymbols(symbols = symbols);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchPositionsADLRank", market = market, params = params);
    isPortfolioMargin = nothing;
    (isPortfolioMargin, params) = self.handleOptionAndParams2(params, "fetchPositionsADLRank", "papi", "portfolioMargin", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(subType == "linear")
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetUmAdlQuantile(params));
        else
            response = Base.fetch(self.fapiPrivateGetAdlQuantile(params));
        end
    elseif functions.ccxtruthy(subType == "inverse")
        if functions.ccxtruthy(isPortfolioMargin)
            response = Base.fetch(self.papiGetCmAdlQuantile(params));
        else
            response = Base.fetch(self.dapiPrivateGetAdlQuantile(params));
        end
    else
        throw(BadRequest(string(self.id, " fetchPositionsADLRank() supports linear and inverse subTypes only")));
    end
    responseList = [];
    if functions.ccxtruthy(response != nothing)
        responseList = toArray(response);
    end
    return self.parseADLRanks(responseList, symbols = symbols)

end
function parseADLRank(self::Binance, info; market=nothing)
    adlQuantile = self.safeDict(info, "adlQuantile", defaultValue = Dict{Symbol, Any}());
    longNum = self.safeNumber(adlQuantile, "LONG");
    shortNum = self.safeNumber(adlQuantile, "SHORT");
    both = self.safeNumber(adlQuantile, "BOTH");
    rank = nothing;
    if functions.ccxtruthy(both != nothing)
        rank = both;
    else
        if functions.ccxtruthy(@functions.ccxt_and(longNum != nothing, shortNum != nothing))
            if functions.ccxtruthy(functions.ccxt_gt(longNum, shortNum))
                rank = longNum;
            else
                rank = shortNum;
            end
        end
    end
    marketId = safeString(info, "symbol");
    timestamp = safeInteger2(info, "timestamp", "updateTime");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("rank") => rank,
    Symbol("rating") => safeStringLower(info, "adlRisk"),
    Symbol("percentage") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Binance, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function sapiGetCopyTradingFuturesUserStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "copyTrading/futures/userStatus"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetCopyTradingFuturesLeadSymbol(self::Binance, params=Dict(), context=Dict())
    return request(self, "copyTrading/futures/leadSymbol"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSystemStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "system/status"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAccountSnapshot(self::Binance, params=Dict(), context=Dict())
    return request(self, "accountSnapshot"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAccountInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "account/info"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginAsset(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/asset"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginPair(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/pair"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginAllAssets(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/allAssets"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginAllPairs(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/allPairs"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginPriceIndex(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/priceIndex"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSpotDelistSchedule(self::Binance, params=Dict(), context=Dict())
    return request(self, "spot/delist-schedule"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAssetAssetDividend(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/assetDividend"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAssetDribblet(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/dribblet"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAssetTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/transfer"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAssetAssetDetail(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/assetDetail"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAssetTradeFee(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/tradeFee"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAssetLedgerTransferCloudMiningQueryByPage(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/ledger-transfer/cloud-mining/queryByPage"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAssetConvertTransferQueryByPage(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/convert-transfer/queryByPage"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAssetWalletBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/wallet/balance"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAssetCustodyTransferHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/custody/transfer-history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginBorrowRepay(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/borrow-repay"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginLoan(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/loan"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginRepay(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/repay"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/account"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/transfer"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginInterestHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/interestHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginForceLiquidationRec(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/forceLiquidationRec"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/order"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/openOrders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginAllOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/allOrders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginMyTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/myTrades"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginMaxBorrowable(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/maxBorrowable"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginMaxTransferable(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/maxTransferable"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginTradeCoeff(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/tradeCoeff"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginIsolatedTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/isolated/transfer"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginIsolatedAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/isolated/account"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginIsolatedPair(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/isolated/pair"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginIsolatedAllPairs(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/isolated/allPairs"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginIsolatedAccountLimit(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/isolated/accountLimit"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginInterestRateHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/interestRateHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/orderList"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginAllOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/allOrderList"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginOpenOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/openOrderList"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginCrossMarginData(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/crossMarginData"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginIsolatedMarginData(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/isolatedMarginData"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginIsolatedMarginTier(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/isolatedMarginTier"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginRateLimitOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/rateLimit/order"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginDribblet(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/dribblet"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginDust(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/dust"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginCrossMarginCollateralRatio(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/crossMarginCollateralRatio"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginExchangeSmallLiability(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/exchange-small-liability"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginExchangeSmallLiabilityHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/exchange-small-liability-history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginNextHourlyInterestRate(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/next-hourly-interest-rate"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginCapitalFlow(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/capital-flow"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginDelistSchedule(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/delist-schedule"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginAvailableInventory(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/available-inventory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMarginLeverageBracket(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/leverageBracket"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanVipLoanableData(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/vip/loanable/data"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanVipCollateralData(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/vip/collateral/data"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanVipRequestData(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/vip/request/data"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanVipRequestInterestRate(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/vip/request/interestRate"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanIncome(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/income"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanOngoingOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/ongoing/orders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanLtvAdjustmentHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/ltv/adjustment/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanBorrowHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/borrow/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanRepayHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/repay/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanLoanableData(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/loanable/data"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanCollateralData(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/collateral/data"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanRepayCollateralRate(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/repay/collateral/rate"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanFlexibleOngoingOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/ongoing/orders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanFlexibleBorrowHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/borrow/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanFlexibleRepayHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/repay/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanFlexibleLtvAdjustmentHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/ltv/adjustment/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanVipOngoingOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/vip/ongoing/orders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanVipRepayHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/vip/repay/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLoanVipCollateralAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/vip/collateral/account"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetFiatOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "fiat/orders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetFiatPayments(self::Binance, params=Dict(), context=Dict())
    return request(self, "fiat/payments"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetFuturesTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "futures/transfer"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetFuturesHistDataLink(self::Binance, params=Dict(), context=Dict())
    return request(self, "futures/histDataLink"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetRebateTaxQuery(self::Binance, params=Dict(), context=Dict())
    return request(self, "rebate/taxQuery"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetCapitalConfigGetall(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/config/getall"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetCapitalDepositAddress(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/deposit/address"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetCapitalDepositAddressList(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/deposit/address/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetCapitalDepositHisrec(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/deposit/hisrec"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetCapitalDepositSubAddress(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/deposit/subAddress"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetCapitalDepositSubHisrec(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/deposit/subHisrec"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetCapitalWithdrawHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/withdraw/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetCapitalWithdrawAddressList(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/withdraw/address/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetCapitalContractConvertibleCoins(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/contract/convertible-coins"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetConvertTradeFlow(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/tradeFlow"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetConvertExchangeInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/exchangeInfo"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetConvertAssetInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/assetInfo"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetConvertOrderStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/orderStatus"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetConvertLimitQueryOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/limit/queryOpenOrders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAccountStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "account/status"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAccountApiTradingStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "account/apiTradingStatus"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAccountApiRestrictionsIpRestriction(self::Binance, params=Dict(), context=Dict())
    return request(self, "account/apiRestrictions/ipRestriction"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBnbBurn(self::Binance, params=Dict(), context=Dict())
    return request(self, "bnbBurn"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountFuturesAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/futures/account"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountFuturesAccountSummary(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/futures/accountSummary"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountFuturesPositionRisk(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/futures/positionRisk"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountFuturesInternalTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/futures/internalTransfer"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountList(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountMarginAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/margin/account"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountMarginAccountSummary(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/margin/accountSummary"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountSpotSummary(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/spotSummary"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/status"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountSubTransferHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/sub/transfer/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountTransferSubUserHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/transfer/subUserHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountUniversalTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/universalTransfer"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountApiRestrictionsIpRestrictionThirdPartyList(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/apiRestrictions/ipRestriction/thirdPartyList"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountTransactionStatistics(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/transaction-statistics"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSubAccountSubAccountApiIpRestriction(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/subAccountApi/ipRestriction"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetManagedSubaccountAsset(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/asset"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetManagedSubaccountAccountSnapshot(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/accountSnapshot"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetManagedSubaccountQueryTransLogForInvestor(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/queryTransLogForInvestor"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetManagedSubaccountQueryTransLogForTradeParent(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/queryTransLogForTradeParent"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetManagedSubaccountFetchFutureAsset(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/fetch-future-asset"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetManagedSubaccountMarginAsset(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/marginAsset"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetManagedSubaccountInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/info"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetManagedSubaccountDepositAddress(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/deposit/address"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetManagedSubaccountQueryTransLog(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/query-trans-log"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingDailyProductList(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/daily/product/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingDailyUserLeftQuota(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/daily/userLeftQuota"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingDailyUserRedemptionQuota(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/daily/userRedemptionQuota"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingDailyTokenPosition(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/daily/token/position"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingUnionAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/union/account"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingUnionPurchaseRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/union/purchaseRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingUnionRedemptionRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/union/redemptionRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingUnionInterestHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/union/interestHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingProjectList(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/project/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingProjectPositionList(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/project/position/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetEthStakingEthHistoryStakingHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/eth/history/stakingHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetEthStakingEthHistoryRedemptionHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/eth/history/redemptionHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetEthStakingEthHistoryRewardsHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/eth/history/rewardsHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetEthStakingEthQuota(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/eth/quota"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetEthStakingEthHistoryRateHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/eth/history/rateHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetEthStakingAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/account"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetEthStakingWbethHistoryWrapHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/wbeth/history/wrapHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetEthStakingWbethHistoryUnwrapHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/wbeth/history/unwrapHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetEthStakingEthHistoryWbethRewardsHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/eth/history/wbethRewardsHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSolStakingSolHistoryStakingHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "sol-staking/sol/history/stakingHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSolStakingSolHistoryRedemptionHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "sol-staking/sol/history/redemptionHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSolStakingSolHistoryBnsolRewardsHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "sol-staking/sol/history/bnsolRewardsHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSolStakingSolHistoryRateHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "sol-staking/sol/history/rateHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSolStakingAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "sol-staking/account"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSolStakingSolQuota(self::Binance, params=Dict(), context=Dict())
    return request(self, "sol-staking/sol/quota"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMiningPubAlgoList(self::Binance, params=Dict(), context=Dict())
    return request(self, "mining/pub/algoList"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMiningPubCoinList(self::Binance, params=Dict(), context=Dict())
    return request(self, "mining/pub/coinList"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMiningWorkerDetail(self::Binance, params=Dict(), context=Dict())
    return request(self, "mining/worker/detail"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMiningWorkerList(self::Binance, params=Dict(), context=Dict())
    return request(self, "mining/worker/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMiningPaymentList(self::Binance, params=Dict(), context=Dict())
    return request(self, "mining/payment/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMiningStatisticsUserStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "mining/statistics/user/status"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMiningStatisticsUserList(self::Binance, params=Dict(), context=Dict())
    return request(self, "mining/statistics/user/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetMiningPaymentUid(self::Binance, params=Dict(), context=Dict())
    return request(self, "mining/payment/uid"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBswapPools(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/pools"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBswapLiquidity(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/liquidity"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBswapLiquidityOps(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/liquidityOps"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBswapQuote(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/quote"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBswapSwap(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/swap"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBswapPoolConfigure(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/poolConfigure"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBswapAddLiquidityPreview(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/addLiquidityPreview"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBswapRemoveLiquidityPreview(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/removeLiquidityPreview"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBswapUnclaimedRewards(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/unclaimedRewards"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBswapClaimedHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/claimedHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBlvtTokenInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "blvt/tokenInfo"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBlvtSubscribeRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "blvt/subscribe/record"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBlvtRedeemRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "blvt/redeem/record"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBlvtUserLimit(self::Binance, params=Dict(), context=Dict())
    return request(self, "blvt/userLimit"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetApiReferralIfNewUser(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/ifNewUser"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetApiReferralCustomization(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/customization"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetApiReferralUserCustomization(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/userCustomization"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetApiReferralRebateRecentRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/rebate/recentRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetApiReferralRebateHistoricalRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/rebate/historicalRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetApiReferralKickbackRecentRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/kickback/recentRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetApiReferralKickbackHistoricalRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/kickback/historicalRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerSubAccountApi(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerSubAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerSubAccountApiCommissionFutures(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/commission/futures"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerSubAccountApiCommissionCoinFutures(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/commission/coinFutures"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/info"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/transfer"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerTransferFutures(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/transfer/futures"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerRebateRecentRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/rebate/recentRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerRebateHistoricalRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/rebate/historicalRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerSubAccountBnbBurnStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount/bnbBurn/status"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerSubAccountDepositHist(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount/depositHist"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerSubAccountSpotSummary(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount/spotSummary"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerSubAccountMarginSummary(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount/marginSummary"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerSubAccountFuturesSummary(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount/futuresSummary"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerRebateFuturesRecentRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/rebate/futures/recentRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerSubAccountApiIpRestriction(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/ipRestriction"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetBrokerUniversalTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/universalTransfer"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAccountApiRestrictions(self::Binance, params=Dict(), context=Dict())
    return request(self, "account/apiRestrictions"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetC2cOrderMatchListUserOrderHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "c2c/orderMatch/listUserOrderHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetNftHistoryTransactions(self::Binance, params=Dict(), context=Dict())
    return request(self, "nft/history/transactions"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetNftHistoryDeposit(self::Binance, params=Dict(), context=Dict())
    return request(self, "nft/history/deposit"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetNftHistoryWithdraw(self::Binance, params=Dict(), context=Dict())
    return request(self, "nft/history/withdraw"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetNftUserGetAsset(self::Binance, params=Dict(), context=Dict())
    return request(self, "nft/user/getAsset"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPayTransactions(self::Binance, params=Dict(), context=Dict())
    return request(self, "pay/transactions"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetGiftcardVerify(self::Binance, params=Dict(), context=Dict())
    return request(self, "giftcard/verify"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetGiftcardCryptographyRsaPublicKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "giftcard/cryptography/rsa-public-key"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetGiftcardBuyCodeTokenLimit(self::Binance, params=Dict(), context=Dict())
    return request(self, "giftcard/buyCode/token-limit"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAlgoSpotOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/spot/openOrders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAlgoSpotHistoricalOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/spot/historicalOrders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAlgoSpotSubOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/spot/subOrders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAlgoFuturesOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/futures/openOrders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAlgoFuturesHistoricalOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/futures/historicalOrders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAlgoFuturesSubOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/futures/subOrders"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/account"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioCollateralRate(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/collateralRate"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioPmLoan(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/pmLoan"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioInterestHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/interest-history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioAssetIndexPrice(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/asset-index-price"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioRepayFuturesSwitch(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/repay-futures-switch"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioMarginAssetLeverage(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/margin-asset-leverage"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/balance"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioNegativeBalanceExchangeRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/negative-balance-exchange-record"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioPmloanHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/pmloan-history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioEarnAssetBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/earn-asset-balance"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetPortfolioDeltaMode(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/delta-mode"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetStakingProductList(self::Binance, params=Dict(), context=Dict())
    return request(self, "staking/productList"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetStakingPosition(self::Binance, params=Dict(), context=Dict())
    return request(self, "staking/position"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetStakingStakingRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "staking/stakingRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetStakingPersonalLeftQuota(self::Binance, params=Dict(), context=Dict())
    return request(self, "staking/personalLeftQuota"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestTargetAssetList(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/target-asset/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestTargetAssetRoiList(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/target-asset/roi/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestAllAsset(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/all/asset"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestSourceAssetList(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/source-asset/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestPlanList(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/plan/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestPlanId(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/plan/id"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestHistoryList(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/history/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestIndexInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/index/info"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestIndexUserSummary(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/index/user-summary"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestOneOffStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/one-off/status"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestRedeemHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/redeem/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetLendingAutoInvestRebalanceHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/rebalance/history"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnFlexibleList(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnLockedList(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnFlexiblePersonalLeftQuota(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/personalLeftQuota"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnLockedPersonalLeftQuota(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/personalLeftQuota"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnFlexibleSubscriptionPreview(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/subscriptionPreview"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnLockedSubscriptionPreview(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/subscriptionPreview"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnFlexibleHistoryRateHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/history/rateHistory"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnFlexiblePosition(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/position"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnLockedPosition(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/position"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/account"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnFlexibleHistorySubscriptionRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/history/subscriptionRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnLockedHistorySubscriptionRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/history/subscriptionRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnFlexibleHistoryRedemptionRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/history/redemptionRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnLockedHistoryRedemptionRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/history/redemptionRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnFlexibleHistoryRewardsRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/history/rewardsRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnLockedHistoryRewardsRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/history/rewardsRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetSimpleEarnFlexibleHistoryCollateralRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/history/collateralRecord"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetDciProductList(self::Binance, params=Dict(), context=Dict())
    return request(self, "dci/product/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetDciProductPositions(self::Binance, params=Dict(), context=Dict())
    return request(self, "dci/product/positions"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetDciProductAccounts(self::Binance, params=Dict(), context=Dict())
    return request(self, "dci/product/accounts"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAccumulatorProductList(self::Binance, params=Dict(), context=Dict())
    return request(self, "accumulator/product/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAccumulatorProductPositionList(self::Binance, params=Dict(), context=Dict())
    return request(self, "accumulator/product/position/list"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiGetAccumulatorProductSumHolding(self::Binance, params=Dict(), context=Dict())
    return request(self, "accumulator/product/sum-holding"; api="sapi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAssetDust(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/dust"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAssetDustBtc(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/dust-btc"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAssetTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/transfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAssetGetFundingAsset(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/get-funding-asset"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAssetConvertTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/convert-transfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAccountDisableFastWithdrawSwitch(self::Binance, params=Dict(), context=Dict())
    return request(self, "account/disableFastWithdrawSwitch"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAccountEnableFastWithdrawSwitch(self::Binance, params=Dict(), context=Dict())
    return request(self, "account/enableFastWithdrawSwitch"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostCapitalWithdrawApply(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/withdraw/apply"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostCapitalContractConvertibleCoins(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/contract/convertible-coins"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostCapitalDepositCreditApply(self::Binance, params=Dict(), context=Dict())
    return request(self, "capital/deposit/credit-apply"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginBorrowRepay(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/borrow-repay"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/transfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginLoan(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/loan"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginRepay(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/repay"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/order"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginOrderOco(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/order/oco"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginDust(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/dust"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginExchangeSmallLiability(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/exchange-small-liability"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginIsolatedTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/isolated/transfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginIsolatedAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/isolated/account"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMarginMaxLeverage(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/max-leverage"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBnbBurn(self::Binance, params=Dict(), context=Dict())
    return request(self, "bnbBurn"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSubAccountVirtualSubAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/virtualSubAccount"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSubAccountMarginTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/margin/transfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSubAccountMarginEnable(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/margin/enable"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSubAccountFuturesEnable(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/futures/enable"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSubAccountFuturesTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/futures/transfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSubAccountFuturesInternalTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/futures/internalTransfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSubAccountTransferSubToSub(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/transfer/subToSub"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSubAccountTransferSubToMaster(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/transfer/subToMaster"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSubAccountUniversalTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/universalTransfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSubAccountOptionsEnable(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/options/enable"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostManagedSubaccountDeposit(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/deposit"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostManagedSubaccountWithdraw(self::Binance, params=Dict(), context=Dict())
    return request(self, "managed-subaccount/withdraw"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostUserDataStream(self::Binance, params=Dict(), context=Dict())
    return request(self, "userDataStream"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostUserDataStreamIsolated(self::Binance, params=Dict(), context=Dict())
    return request(self, "userDataStream/isolated"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostUserListenToken(self::Binance, params=Dict(), context=Dict())
    return request(self, "userListenToken"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostFuturesTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "futures/transfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLendingCustomizedFixedPurchase(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/customizedFixed/purchase"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLendingDailyPurchase(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/daily/purchase"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLendingDailyRedeem(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/daily/redeem"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBswapLiquidityAdd(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/liquidityAdd"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBswapLiquidityRemove(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/liquidityRemove"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBswapSwap(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/swap"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBswapClaimRewards(self::Binance, params=Dict(), context=Dict())
    return request(self, "bswap/claimRewards"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBlvtSubscribe(self::Binance, params=Dict(), context=Dict())
    return request(self, "blvt/subscribe"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBlvtRedeem(self::Binance, params=Dict(), context=Dict())
    return request(self, "blvt/redeem"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostApiReferralCustomization(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/customization"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostApiReferralUserCustomization(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/userCustomization"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostApiReferralRebateHistoricalRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/rebate/historicalRecord"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostApiReferralKickbackHistoricalRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/kickback/historicalRecord"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountMargin(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount/margin"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountFutures(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount/futures"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountApi(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountApiPermission(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/permission"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountApiCommission(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/commission"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountApiCommissionFutures(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/commission/futures"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountApiCommissionCoinFutures(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/commission/coinFutures"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/transfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerTransferFutures(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/transfer/futures"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerRebateHistoricalRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/rebate/historicalRecord"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountBnbBurnSpot(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount/bnbBurn/spot"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountBnbBurnMarginInterest(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount/bnbBurn/marginInterest"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountBlvt(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccount/blvt"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountApiIpRestriction(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/ipRestriction"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountApiIpRestrictionIpList(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/ipRestriction/ipList"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerUniversalTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/universalTransfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountApiPermissionUniversalTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/permission/universalTransfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostBrokerSubAccountApiPermissionVanillaOptions(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/permission/vanillaOptions"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostGiftcardCreateCode(self::Binance, params=Dict(), context=Dict())
    return request(self, "giftcard/createCode"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostGiftcardRedeemCode(self::Binance, params=Dict(), context=Dict())
    return request(self, "giftcard/redeemCode"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostGiftcardBuyCode(self::Binance, params=Dict(), context=Dict())
    return request(self, "giftcard/buyCode"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAlgoSpotNewOrderTwap(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/spot/newOrderTwap"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAlgoFuturesNewOrderVp(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/futures/newOrderVp"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAlgoFuturesNewOrderTwap(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/futures/newOrderTwap"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostStakingPurchase(self::Binance, params=Dict(), context=Dict())
    return request(self, "staking/purchase"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostStakingRedeem(self::Binance, params=Dict(), context=Dict())
    return request(self, "staking/redeem"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostStakingSetAutoStaking(self::Binance, params=Dict(), context=Dict())
    return request(self, "staking/setAutoStaking"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostEthStakingEthStake(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/eth/stake"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostEthStakingEthRedeem(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/eth/redeem"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostEthStakingWbethWrap(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/wbeth/wrap"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSolStakingSolStake(self::Binance, params=Dict(), context=Dict())
    return request(self, "sol-staking/sol/stake"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSolStakingSolRedeem(self::Binance, params=Dict(), context=Dict())
    return request(self, "sol-staking/sol/redeem"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMiningHashTransferConfig(self::Binance, params=Dict(), context=Dict())
    return request(self, "mining/hash-transfer/config"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostMiningHashTransferConfigCancel(self::Binance, params=Dict(), context=Dict())
    return request(self, "mining/hash-transfer/config/cancel"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostPortfolioRepay(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/repay"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLoanVipRenew(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/vip/renew"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLoanVipBorrow(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/vip/borrow"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLoanBorrow(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/borrow"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLoanRepay(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/repay"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLoanAdjustLtv(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/adjust/ltv"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLoanCustomizeMarginCall(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/customize/margin_call"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLoanFlexibleRepay(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/repay"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLoanFlexibleAdjustLtv(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/adjust/ltv"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLoanVipRepay(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/vip/repay"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostConvertGetQuote(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/getQuote"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostConvertAcceptQuote(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/acceptQuote"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostConvertLimitPlaceOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/limit/placeOrder"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostConvertLimitCancelOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/limit/cancelOrder"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostPortfolioAutoCollection(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/auto-collection"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostPortfolioAssetCollection(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/asset-collection"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostPortfolioBnbTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/bnb-transfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostPortfolioRepayFuturesSwitch(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/repay-futures-switch"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostPortfolioRepayFuturesNegativeBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/repay-futures-negative-balance"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostPortfolioMint(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/mint"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostPortfolioRedeem(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/redeem"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostPortfolioEarnAssetTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/earn-asset-transfer"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostPortfolioDeltaMode(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/delta-mode"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLendingAutoInvestPlanAdd(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/plan/add"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLendingAutoInvestPlanEdit(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/plan/edit"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLendingAutoInvestPlanEditStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/plan/edit-status"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLendingAutoInvestOneOff(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/one-off"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostLendingAutoInvestRedeem(self::Binance, params=Dict(), context=Dict())
    return request(self, "lending/auto-invest/redeem"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSimpleEarnFlexibleSubscribe(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/subscribe"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSimpleEarnLockedSubscribe(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/subscribe"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSimpleEarnFlexibleRedeem(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/redeem"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSimpleEarnLockedRedeem(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/redeem"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSimpleEarnFlexibleSetAutoSubscribe(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/flexible/setAutoSubscribe"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSimpleEarnLockedSetAutoSubscribe(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/setAutoSubscribe"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostSimpleEarnLockedSetRedeemOption(self::Binance, params=Dict(), context=Dict())
    return request(self, "simple-earn/locked/setRedeemOption"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostDciProductSubscribe(self::Binance, params=Dict(), context=Dict())
    return request(self, "dci/product/subscribe"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostDciProductAutoCompoundEdit(self::Binance, params=Dict(), context=Dict())
    return request(self, "dci/product/auto_compound/edit"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPostAccumulatorProductSubscribe(self::Binance, params=Dict(), context=Dict())
    return request(self, "accumulator/product/subscribe"; api="sapi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPutUserDataStream(self::Binance, params=Dict(), context=Dict())
    return request(self, "userDataStream"; api="sapi", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiPutUserDataStreamIsolated(self::Binance, params=Dict(), context=Dict())
    return request(self, "userDataStream/isolated"; api="sapi", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteMarginOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/openOrders"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteMarginOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/order"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteMarginOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/orderList"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteMarginIsolatedAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/isolated/account"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteUserDataStream(self::Binance, params=Dict(), context=Dict())
    return request(self, "userDataStream"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteUserDataStreamIsolated(self::Binance, params=Dict(), context=Dict())
    return request(self, "userDataStream/isolated"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteBrokerSubAccountApi(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteBrokerSubAccountApiIpRestrictionIpList(self::Binance, params=Dict(), context=Dict())
    return request(self, "broker/subAccountApi/ipRestriction/ipList"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteAlgoSpotOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/spot/order"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteAlgoFuturesOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "algo/futures/order"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiDeleteSubAccountSubAccountApiIpRestrictionIpList(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/subAccountApi/ipRestriction/ipList"; api="sapi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetEthStakingAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/account"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetSubAccountFuturesAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/futures/account"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetSubAccountFuturesAccountSummary(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/futures/accountSummary"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetSubAccountFuturesPositionRisk(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/futures/positionRisk"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetLoanFlexibleOngoingOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/ongoing/orders"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetLoanFlexibleBorrowHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/borrow/history"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetLoanFlexibleRepayHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/repay/history"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetLoanFlexibleLtvAdjustmentHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/ltv/adjustment/history"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetLoanFlexibleLoanableData(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/loanable/data"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetLoanFlexibleCollateralData(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/collateral/data"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2GetPortfolioAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/account"; api="sapiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2PostEthStakingEthStake(self::Binance, params=Dict(), context=Dict())
    return request(self, "eth-staking/eth/stake"; api="sapiV2", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2PostSubAccountSubAccountApiIpRestriction(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/subAccountApi/ipRestriction"; api="sapiV2", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2PostLoanFlexibleBorrow(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/borrow"; api="sapiV2", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2PostLoanFlexibleRepay(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/repay"; api="sapiV2", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV2PostLoanFlexibleAdjustLtv(self::Binance, params=Dict(), context=Dict())
    return request(self, "loan/flexible/adjust/ltv"; api="sapiV2", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV3GetSubAccountAssets(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/assets"; api="sapiV3", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV3PostAssetGetUserAsset(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset/getUserAsset"; api="sapiV3", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function sapiV4GetSubAccountAssets(self::Binance, params=Dict(), context=Dict())
    return request(self, "sub-account/assets"; api="sapiV4", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetPing(self::Binance, params=Dict(), context=Dict())
    return request(self, "ping"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetTime(self::Binance, params=Dict(), context=Dict())
    return request(self, "time"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetExchangeInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "exchangeInfo"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetDepth(self::Binance, params=Dict(), context=Dict())
    return request(self, "depth"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "trades"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetHistoricalTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "historicalTrades"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetAggTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "aggTrades"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetPremiumIndex(self::Binance, params=Dict(), context=Dict())
    return request(self, "premiumIndex"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetFundingRate(self::Binance, params=Dict(), context=Dict())
    return request(self, "fundingRate"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "klines"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetContinuousKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "continuousKlines"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetIndexPriceKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "indexPriceKlines"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetMarkPriceKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "markPriceKlines"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetPremiumIndexKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "premiumIndexKlines"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetTicker24hr(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/24hr"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetTickerPrice(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/price"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetTickerBookTicker(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/bookTicker"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetConstituents(self::Binance, params=Dict(), context=Dict())
    return request(self, "constituents"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetOpenInterest(self::Binance, params=Dict(), context=Dict())
    return request(self, "openInterest"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPublicGetFundingInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "fundingInfo"; api="dapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiDataGetDeliveryPrice(self::Binance, params=Dict(), context=Dict())
    return request(self, "delivery-price"; api="dapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiDataGetOpenInterestHist(self::Binance, params=Dict(), context=Dict())
    return request(self, "openInterestHist"; api="dapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiDataGetTopLongShortAccountRatio(self::Binance, params=Dict(), context=Dict())
    return request(self, "topLongShortAccountRatio"; api="dapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiDataGetTopLongShortPositionRatio(self::Binance, params=Dict(), context=Dict())
    return request(self, "topLongShortPositionRatio"; api="dapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiDataGetGlobalLongShortAccountRatio(self::Binance, params=Dict(), context=Dict())
    return request(self, "globalLongShortAccountRatio"; api="dapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiDataGetTakerBuySellVol(self::Binance, params=Dict(), context=Dict())
    return request(self, "takerBuySellVol"; api="dapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiDataGetBasis(self::Binance, params=Dict(), context=Dict())
    return request(self, "basis"; api="dapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetPositionSideDual(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionSide/dual"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetOrderAmendment(self::Binance, params=Dict(), context=Dict())
    return request(self, "orderAmendment"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetOpenOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "openOrder"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "openOrders"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetOpenAlgoOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "openAlgoOrders"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetAllOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "allOrders"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "balance"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "account"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetPositionMarginHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionMargin/history"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetPositionRisk(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionRisk"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetUserTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "userTrades"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetIncome(self::Binance, params=Dict(), context=Dict())
    return request(self, "income"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetLeverageBracket(self::Binance, params=Dict(), context=Dict())
    return request(self, "leverageBracket"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetForceOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "forceOrders"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetAdlQuantile(self::Binance, params=Dict(), context=Dict())
    return request(self, "adlQuantile"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetCommissionRate(self::Binance, params=Dict(), context=Dict())
    return request(self, "commissionRate"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetIncomeAsyn(self::Binance, params=Dict(), context=Dict())
    return request(self, "income/asyn"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetIncomeAsynId(self::Binance, params=Dict(), context=Dict())
    return request(self, "income/asyn/id"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetTradeAsyn(self::Binance, params=Dict(), context=Dict())
    return request(self, "trade/asyn"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetTradeAsynId(self::Binance, params=Dict(), context=Dict())
    return request(self, "trade/asyn/id"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetOrderAsyn(self::Binance, params=Dict(), context=Dict())
    return request(self, "order/asyn"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetOrderAsynId(self::Binance, params=Dict(), context=Dict())
    return request(self, "order/asyn/id"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetPmExchangeInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "pmExchangeInfo"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateGetPmAccountInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "pmAccountInfo"; api="dapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePostPositionSideDual(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionSide/dual"; api="dapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePostOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="dapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePostAlgoOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "algoOrder"; api="dapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePostBatchOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "batchOrders"; api="dapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePostCountdownCancelAll(self::Binance, params=Dict(), context=Dict())
    return request(self, "countdownCancelAll"; api="dapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePostLeverage(self::Binance, params=Dict(), context=Dict())
    return request(self, "leverage"; api="dapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePostMarginType(self::Binance, params=Dict(), context=Dict())
    return request(self, "marginType"; api="dapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePostPositionMargin(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionMargin"; api="dapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePostListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="dapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePutListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="dapiPrivate", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePutOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="dapiPrivate", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivatePutBatchOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "batchOrders"; api="dapiPrivate", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateDeleteOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="dapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateDeleteAlgoOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "algoOrder"; api="dapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateDeleteAllOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "allOpenOrders"; api="dapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateDeleteBatchOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "batchOrders"; api="dapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateDeleteListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="dapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function dapiPrivateV2GetLeverageBracket(self::Binance, params=Dict(), context=Dict())
    return request(self, "leverageBracket"; api="dapiPrivateV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetPing(self::Binance, params=Dict(), context=Dict())
    return request(self, "ping"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetTime(self::Binance, params=Dict(), context=Dict())
    return request(self, "time"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetExchangeInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "exchangeInfo"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetDepth(self::Binance, params=Dict(), context=Dict())
    return request(self, "depth"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetRpiDepth(self::Binance, params=Dict(), context=Dict())
    return request(self, "rpiDepth"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "trades"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetHistoricalTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "historicalTrades"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetAggTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "aggTrades"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "klines"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetContinuousKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "continuousKlines"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetMarkPriceKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "markPriceKlines"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetIndexPriceKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "indexPriceKlines"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetPremiumIndexKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "premiumIndexKlines"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetFundingRate(self::Binance, params=Dict(), context=Dict())
    return request(self, "fundingRate"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetFundingInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "fundingInfo"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetPremiumIndex(self::Binance, params=Dict(), context=Dict())
    return request(self, "premiumIndex"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetTicker24hr(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/24hr"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetTickerPrice(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/price"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetTickerBookTicker(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/bookTicker"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetOpenInterest(self::Binance, params=Dict(), context=Dict())
    return request(self, "openInterest"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetIndexInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "indexInfo"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetAssetIndex(self::Binance, params=Dict(), context=Dict())
    return request(self, "assetIndex"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetConstituents(self::Binance, params=Dict(), context=Dict())
    return request(self, "constituents"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetApiTradingStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiTradingStatus"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetLvtKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "lvtKlines"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetConvertExchangeInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/exchangeInfo"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetInsuranceBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "insuranceBalance"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetSymbolAdlRisk(self::Binance, params=Dict(), context=Dict())
    return request(self, "symbolAdlRisk"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicGetTradingSchedule(self::Binance, params=Dict(), context=Dict())
    return request(self, "tradingSchedule"; api="fapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiDataGetDeliveryPrice(self::Binance, params=Dict(), context=Dict())
    return request(self, "delivery-price"; api="fapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiDataGetOpenInterestHist(self::Binance, params=Dict(), context=Dict())
    return request(self, "openInterestHist"; api="fapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiDataGetTopLongShortAccountRatio(self::Binance, params=Dict(), context=Dict())
    return request(self, "topLongShortAccountRatio"; api="fapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiDataGetTopLongShortPositionRatio(self::Binance, params=Dict(), context=Dict())
    return request(self, "topLongShortPositionRatio"; api="fapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiDataGetGlobalLongShortAccountRatio(self::Binance, params=Dict(), context=Dict())
    return request(self, "globalLongShortAccountRatio"; api="fapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiDataGetTakerlongshortRatio(self::Binance, params=Dict(), context=Dict())
    return request(self, "takerlongshortRatio"; api="fapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiDataGetBasis(self::Binance, params=Dict(), context=Dict())
    return request(self, "basis"; api="fapiData", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetForceOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "forceOrders"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetAllOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "allOrders"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetOpenOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "openOrder"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "openOrders"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "account"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "balance"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetLeverageBracket(self::Binance, params=Dict(), context=Dict())
    return request(self, "leverageBracket"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetPositionMarginHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionMargin/history"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetPositionRisk(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionRisk"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetPositionSideDual(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionSide/dual"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetUserTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "userTrades"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetIncome(self::Binance, params=Dict(), context=Dict())
    return request(self, "income"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetCommissionRate(self::Binance, params=Dict(), context=Dict())
    return request(self, "commissionRate"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetRateLimitOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "rateLimit/order"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetApiTradingStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiTradingStatus"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetMultiAssetsMargin(self::Binance, params=Dict(), context=Dict())
    return request(self, "multiAssetsMargin"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetApiReferralIfNewUser(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/ifNewUser"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetApiReferralCustomization(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/customization"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetApiReferralUserCustomization(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/userCustomization"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetApiReferralTraderNum(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/traderNum"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetApiReferralOverview(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/overview"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetApiReferralTradeVol(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/tradeVol"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetApiReferralRebateVol(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/rebateVol"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetApiReferralTraderSummary(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/traderSummary"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetAdlQuantile(self::Binance, params=Dict(), context=Dict())
    return request(self, "adlQuantile"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetPmAccountInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "pmAccountInfo"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetOrderAmendment(self::Binance, params=Dict(), context=Dict())
    return request(self, "orderAmendment"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetIncomeAsyn(self::Binance, params=Dict(), context=Dict())
    return request(self, "income/asyn"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetIncomeAsynId(self::Binance, params=Dict(), context=Dict())
    return request(self, "income/asyn/id"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetOrderAsyn(self::Binance, params=Dict(), context=Dict())
    return request(self, "order/asyn"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetOrderAsynId(self::Binance, params=Dict(), context=Dict())
    return request(self, "order/asyn/id"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetTradeAsyn(self::Binance, params=Dict(), context=Dict())
    return request(self, "trade/asyn"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetTradeAsynId(self::Binance, params=Dict(), context=Dict())
    return request(self, "trade/asyn/id"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetFeeBurn(self::Binance, params=Dict(), context=Dict())
    return request(self, "feeBurn"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetSymbolConfig(self::Binance, params=Dict(), context=Dict())
    return request(self, "symbolConfig"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetAccountConfig(self::Binance, params=Dict(), context=Dict())
    return request(self, "accountConfig"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetConvertOrderStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/orderStatus"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetAlgoOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "algoOrder"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetOpenAlgoOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "openAlgoOrders"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetAllAlgoOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "allAlgoOrders"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateGetStockContract(self::Binance, params=Dict(), context=Dict())
    return request(self, "stock/contract"; api="fapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostBatchOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "batchOrders"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostPositionSideDual(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionSide/dual"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostPositionMargin(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionMargin"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostMarginType(self::Binance, params=Dict(), context=Dict())
    return request(self, "marginType"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostOrderTest(self::Binance, params=Dict(), context=Dict())
    return request(self, "order/test"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostLeverage(self::Binance, params=Dict(), context=Dict())
    return request(self, "leverage"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostCountdownCancelAll(self::Binance, params=Dict(), context=Dict())
    return request(self, "countdownCancelAll"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostMultiAssetsMargin(self::Binance, params=Dict(), context=Dict())
    return request(self, "multiAssetsMargin"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostApiReferralCustomization(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/customization"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostApiReferralUserCustomization(self::Binance, params=Dict(), context=Dict())
    return request(self, "apiReferral/userCustomization"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostFeeBurn(self::Binance, params=Dict(), context=Dict())
    return request(self, "feeBurn"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostConvertGetQuote(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/getQuote"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostConvertAcceptQuote(self::Binance, params=Dict(), context=Dict())
    return request(self, "convert/acceptQuote"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePostAlgoOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "algoOrder"; api="fapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePutListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="fapiPrivate", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePutOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="fapiPrivate", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivatePutBatchOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "batchOrders"; api="fapiPrivate", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateDeleteBatchOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "batchOrders"; api="fapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateDeleteOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="fapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateDeleteAllOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "allOpenOrders"; api="fapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateDeleteListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="fapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateDeleteAlgoOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "algoOrder"; api="fapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateDeleteAlgoOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "algoOpenOrders"; api="fapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPublicV2GetTickerPrice(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/price"; api="fapiPublicV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateV2GetAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "account"; api="fapiPrivateV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateV2GetBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "balance"; api="fapiPrivateV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateV2GetPositionRisk(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionRisk"; api="fapiPrivateV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateV3GetAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "account"; api="fapiPrivateV3", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateV3GetBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "balance"; api="fapiPrivateV3", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function fapiPrivateV3GetPositionRisk(self::Binance, params=Dict(), context=Dict())
    return request(self, "positionRisk"; api="fapiPrivateV3", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetPing(self::Binance, params=Dict(), context=Dict())
    return request(self, "ping"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetTime(self::Binance, params=Dict(), context=Dict())
    return request(self, "time"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetExchangeInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "exchangeInfo"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetIndex(self::Binance, params=Dict(), context=Dict())
    return request(self, "index"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetTicker(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetMark(self::Binance, params=Dict(), context=Dict())
    return request(self, "mark"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetDepth(self::Binance, params=Dict(), context=Dict())
    return request(self, "depth"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "klines"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "trades"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetHistoricalTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "historicalTrades"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetExerciseHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "exerciseHistory"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPublicGetOpenInterest(self::Binance, params=Dict(), context=Dict())
    return request(self, "openInterest"; api="eapiPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "account"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetPosition(self::Binance, params=Dict(), context=Dict())
    return request(self, "position"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "openOrders"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetHistoryOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "historyOrders"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetUserTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "userTrades"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetExerciseRecord(self::Binance, params=Dict(), context=Dict())
    return request(self, "exerciseRecord"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetBill(self::Binance, params=Dict(), context=Dict())
    return request(self, "bill"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetIncomeAsyn(self::Binance, params=Dict(), context=Dict())
    return request(self, "income/asyn"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetIncomeAsynId(self::Binance, params=Dict(), context=Dict())
    return request(self, "income/asyn/id"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetMarginAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "marginAccount"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetMmp(self::Binance, params=Dict(), context=Dict())
    return request(self, "mmp"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetCountdownCancelAll(self::Binance, params=Dict(), context=Dict())
    return request(self, "countdownCancelAll"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetBlockOrderOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "block/order/orders"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetBlockOrderExecute(self::Binance, params=Dict(), context=Dict())
    return request(self, "block/order/execute"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetBlockUserTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "block/user-trades"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetBlockTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "blockTrades"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateGetComission(self::Binance, params=Dict(), context=Dict())
    return request(self, "comission"; api="eapiPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePostOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="eapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePostBatchOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "batchOrders"; api="eapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePostListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="eapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePostMmpSet(self::Binance, params=Dict(), context=Dict())
    return request(self, "mmpSet"; api="eapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePostMmpReset(self::Binance, params=Dict(), context=Dict())
    return request(self, "mmpReset"; api="eapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePostCountdownCancelAll(self::Binance, params=Dict(), context=Dict())
    return request(self, "countdownCancelAll"; api="eapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePostCountdownCancelAllHeartBeat(self::Binance, params=Dict(), context=Dict())
    return request(self, "countdownCancelAllHeartBeat"; api="eapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePostBlockOrderCreate(self::Binance, params=Dict(), context=Dict())
    return request(self, "block/order/create"; api="eapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePostBlockOrderExecute(self::Binance, params=Dict(), context=Dict())
    return request(self, "block/order/execute"; api="eapiPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePutListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="eapiPrivate", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivatePutBlockOrderCreate(self::Binance, params=Dict(), context=Dict())
    return request(self, "block/order/create"; api="eapiPrivate", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateDeleteOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="eapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateDeleteBatchOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "batchOrders"; api="eapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateDeleteAllOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "allOpenOrders"; api="eapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateDeleteAllOpenOrdersByUnderlying(self::Binance, params=Dict(), context=Dict())
    return request(self, "allOpenOrdersByUnderlying"; api="eapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateDeleteListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="eapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function eapiPrivateDeleteBlockOrderCreate(self::Binance, params=Dict(), context=Dict())
    return request(self, "block/order/create"; api="eapiPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetPing(self::Binance, params=Dict(), context=Dict())
    return request(self, "ping"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTime(self::Binance, params=Dict(), context=Dict())
    return request(self, "time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDepth(self::Binance, params=Dict(), context=Dict())
    return request(self, "depth"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAggTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "aggTrades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetHistoricalTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "historicalTrades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "klines"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetUiKlines(self::Binance, params=Dict(), context=Dict())
    return request(self, "uiKlines"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker24hr(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/24hr"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTicker(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickerTradingDay(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/tradingDay"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickerPrice(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTickerBookTicker(self::Binance, params=Dict(), context=Dict())
    return request(self, "ticker/bookTicker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetExchangeInfo(self::Binance, params=Dict(), context=Dict())
    return request(self, "exchangeInfo"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAvgPrice(self::Binance, params=Dict(), context=Dict())
    return request(self, "avgPrice"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPutUserDataStream(self::Binance, params=Dict(), context=Dict())
    return request(self, "userDataStream"; api="public", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostUserDataStream(self::Binance, params=Dict(), context=Dict())
    return request(self, "userDataStream"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicDeleteUserDataStream(self::Binance, params=Dict(), context=Dict())
    return request(self, "userDataStream"; api="public", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAllOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "allOrderList"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOpenOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "openOrderList"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "orderList"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "openOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAllOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "allOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "account"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMyTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "myTrades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetRateLimitOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "rateLimit/order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMyPreventedMatches(self::Binance, params=Dict(), context=Dict())
    return request(self, "myPreventedMatches"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMyAllocations(self::Binance, params=Dict(), context=Dict())
    return request(self, "myAllocations"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountCommission(self::Binance, params=Dict(), context=Dict())
    return request(self, "account/commission"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderOco(self::Binance, params=Dict(), context=Dict())
    return request(self, "order/oco"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderListOco(self::Binance, params=Dict(), context=Dict())
    return request(self, "orderList/oco"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderListOto(self::Binance, params=Dict(), context=Dict())
    return request(self, "orderList/oto"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderListOtoco(self::Binance, params=Dict(), context=Dict())
    return request(self, "orderList/otoco"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderListOpo(self::Binance, params=Dict(), context=Dict())
    return request(self, "orderList/opo"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderListOpoco(self::Binance, params=Dict(), context=Dict())
    return request(self, "orderList/opoco"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSorOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "sor/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSorOrderTest(self::Binance, params=Dict(), context=Dict())
    return request(self, "sor/order/test"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderCancelReplace(self::Binance, params=Dict(), context=Dict())
    return request(self, "order/cancelReplace"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrderTest(self::Binance, params=Dict(), context=Dict())
    return request(self, "order/test"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "openOrders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "orderList"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "order"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetPing(self::Binance, params=Dict(), context=Dict())
    return request(self, "ping"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/order"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmOpenOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/openOrder"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/openOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmAllOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/allOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/order"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmOpenOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/openOrder"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/openOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmAllOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/allOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmConditionalOpenOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/conditional/openOrder"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmConditionalOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/conditional/openOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmConditionalOrderHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/conditional/orderHistory"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmConditionalAllOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/conditional/allOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmConditionalOpenOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/conditional/openOrder"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmConditionalOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/conditional/openOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmConditionalOrderHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/conditional/orderHistory"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmConditionalAllOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/conditional/allOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/order"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/openOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginAllOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/allOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/orderList"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginAllOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/allOrderList"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginOpenOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/openOrderList"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginMyTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/myTrades"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "balance"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "account"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginMaxBorrowable(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/maxBorrowable"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginMaxWithdraw(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/maxWithdraw"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmPositionRisk(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/positionRisk"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmPositionRisk(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/positionRisk"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmPositionSideDual(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/positionSide/dual"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmPositionSideDual(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/positionSide/dual"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmUserTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/userTrades"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmUserTrades(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/userTrades"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmLeverageBracket(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/leverageBracket"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmLeverageBracket(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/leverageBracket"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginForceOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/forceOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmForceOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/forceOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmForceOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/forceOrders"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmApiTradingStatus(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/apiTradingStatus"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmCommissionRate(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/commissionRate"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmCommissionRate(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/commissionRate"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginMarginLoan(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/marginLoan"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginRepayLoan(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/repayLoan"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetMarginMarginInterestHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/marginInterestHistory"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetPortfolioInterestHistory(self::Binance, params=Dict(), context=Dict())
    return request(self, "portfolio/interest-history"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmIncome(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/income"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmIncome(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/income"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/account"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/account"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetRepayFuturesSwitch(self::Binance, params=Dict(), context=Dict())
    return request(self, "repay-futures-switch"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmAdlQuantile(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/adlQuantile"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmAdlQuantile(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/adlQuantile"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmTradeAsyn(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/trade/asyn"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmTradeAsynId(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/trade/asyn/id"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmOrderAsyn(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/order/asyn"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmOrderAsynId(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/order/asyn/id"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmIncomeAsyn(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/income/asyn"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmIncomeAsynId(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/income/asyn/id"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmOrderAmendment(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/orderAmendment"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmOrderAmendment(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/orderAmendment"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmFeeBurn(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/feeBurn"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmAccountConfig(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/accountConfig"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetUmSymbolConfig(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/symbolConfig"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmAccountConfig(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/accountConfig"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetCmSymbolConfig(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/symbolConfig"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiGetRateLimitOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "rateLimit/order"; api="papi", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostUmOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/order"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostUmConditionalOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/conditional/order"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostCmOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/order"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostCmConditionalOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/conditional/order"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostMarginOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/order"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostMarginLoan(self::Binance, params=Dict(), context=Dict())
    return request(self, "marginLoan"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostRepayLoan(self::Binance, params=Dict(), context=Dict())
    return request(self, "repayLoan"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostMarginOrderOco(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/order/oco"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostUmLeverage(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/leverage"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostCmLeverage(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/leverage"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostUmPositionSideDual(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/positionSide/dual"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostCmPositionSideDual(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/positionSide/dual"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostAutoCollection(self::Binance, params=Dict(), context=Dict())
    return request(self, "auto-collection"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostBnbTransfer(self::Binance, params=Dict(), context=Dict())
    return request(self, "bnb-transfer"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostRepayFuturesSwitch(self::Binance, params=Dict(), context=Dict())
    return request(self, "repay-futures-switch"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostRepayFuturesNegativeBalance(self::Binance, params=Dict(), context=Dict())
    return request(self, "repay-futures-negative-balance"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostAssetCollection(self::Binance, params=Dict(), context=Dict())
    return request(self, "asset-collection"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostMarginRepayDebt(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/repay-debt"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostUmFeeBurn(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/feeBurn"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPostUmStockContract(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/stock/contract"; api="papi", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPutListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="papi", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPutUmOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/order"; api="papi", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiPutCmOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/order"; api="papi", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteUmOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/order"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteUmConditionalOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/conditional/order"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteUmAllOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/allOpenOrders"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteUmConditionalAllOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/conditional/allOpenOrders"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteCmOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/order"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteCmConditionalOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/conditional/order"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteCmAllOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/allOpenOrders"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteCmConditionalAllOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "cm/conditional/allOpenOrders"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteMarginOrder(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/order"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteMarginAllOpenOrders(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/allOpenOrders"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteMarginOrderList(self::Binance, params=Dict(), context=Dict())
    return request(self, "margin/orderList"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiDeleteListenKey(self::Binance, params=Dict(), context=Dict())
    return request(self, "listenKey"; api="papi", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function papiV2GetUmAccount(self::Binance, params=Dict(), context=Dict())
    return request(self, "um/account"; api="papiV2", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function Binance(; kwargs...)
    inst = Binance(Exchange(), describe, isInverse, isLinear, setSandboxMode, createExpiredOptionMarket, market, safeMarket, nonce, enableDemoTrading, fetchTime, fetchCurrencies, parseCurrenciesCustom, parseCurrency, fetchMarkets, parseMarket, parseBalanceHelper, parseBalanceCustom, fetchBalance, fetchOrderBook, parseTicker, fetchStatus, fetchTicker, fetchBidsAsks, fetchLastPrices, parseLastPrice, fetchTickers, parseTickersForRolling, fetchMarkPrice, fetchMarkPrices, parseOHLCV, fetchOHLCV, parseTrade, fetchTrades, editSpotOrder, editSpotOrderRequest, editContractOrderRequest, editContractOrder, editOrder, editOrders, parseOrderStatus, parseOrderTypeByMarket, parseOrder, createOrders, createOrder, createOrderRequest, createMarketOrderWithCost, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, fetchOrder, fetchOrders, fetchOpenOrders, fetchOpenOrder, fetchClosedOrders, fetchCanceledOrders, fetchCanceledAndClosedOrders, cancelOrder, cancelAllOrders, cancelOrders, fetchOrderTrades, fetchMyTrades, fetchMyDustTrades, parseDustTrade, fetchDeposits, fetchWithdrawals, parseTransactionStatusByType, parseTransaction, parseTransferStatus, parseTransfer, parseIncome, transfer, fetchTransfers, fetchDepositAddress, parseDepositAddress, fetchTransactionFees, fetchDepositWithdrawFees, parseDepositWithdrawFee, withdraw, parseTradingFee, fetchTradingFee, fetchTradingFees, futuresTransfer, fetchFundingRate, fetchFundingRateHistory, parseFundingRateHistory, fetchFundingRates, parseFundingRate, parseAccountPositions, parseAccountPosition, parsePositionRisk, loadLeverageBrackets, fetchLeverageTiers, parseMarketLeverageTiers, fetchPosition, fetchOptionPositions, parseOptionPosition, fetchPositions, fetchAccountPositions, fetchPositionsRisk, fetchFundingHistory, setLeverage, setMarginMode, setPositionMode, fetchLeverages, parseLeverage, fetchSettlementHistory, fetchMySettlementHistory, parseSettlement, parseSettlements, fetchLedgerEntry, fetchLedger, parseLedgerEntry, parseLedgerEntryType, getNetworkCodeByNetworkUrl, getBaseDomainFromUrl, sign, getExceptionsByUrl, handleErrors, calculateRateLimiterCost, request, modifyMarginHelper, parseMarginModification, reduceMargin, addMargin, fetchCrossBorrowRate, fetchIsolatedBorrowRate, fetchIsolatedBorrowRates, fetchBorrowRateHistory, parseBorrowRate, parseIsolatedBorrowRate, createGiftCode, redeemGiftCode, verifyGiftCode, fetchBorrowInterest, parseBorrowInterest, repayCrossMargin, repayIsolatedMargin, borrowCrossMargin, borrowIsolatedMargin, parseMarginLoan, fetchOpenInterestHistory, fetchOpenInterest, parseOpenInterest, fetchMyLiquidations, parseLiquidation, fetchGreeks, fetchAllGreeks, parseGreeks, fetchTradingLimits, fetchPositionMode, fetchMarginModes, fetchMarginMode, parseMarginMode, fetchOption, parseOption, fetchMarginAdjustmentHistory, fetchConvertCurrencies, fetchConvertQuote, createConvertTrade, fetchConvertTrade, fetchConvertTradeHistory, parseConversion, fetchFundingIntervals, fetchLongShortRatioHistory, parseLongShortRatio, fetchADLRank, fetchPositionsADLRank, parseADLRank, sapiGetCopyTradingFuturesUserStatus, sapiGetCopyTradingFuturesLeadSymbol, sapiGetSystemStatus, sapiGetAccountSnapshot, sapiGetAccountInfo, sapiGetMarginAsset, sapiGetMarginPair, sapiGetMarginAllAssets, sapiGetMarginAllPairs, sapiGetMarginPriceIndex, sapiGetSpotDelistSchedule, sapiGetAssetAssetDividend, sapiGetAssetDribblet, sapiGetAssetTransfer, sapiGetAssetAssetDetail, sapiGetAssetTradeFee, sapiGetAssetLedgerTransferCloudMiningQueryByPage, sapiGetAssetConvertTransferQueryByPage, sapiGetAssetWalletBalance, sapiGetAssetCustodyTransferHistory, sapiGetMarginBorrowRepay, sapiGetMarginLoan, sapiGetMarginRepay, sapiGetMarginAccount, sapiGetMarginTransfer, sapiGetMarginInterestHistory, sapiGetMarginForceLiquidationRec, sapiGetMarginOrder, sapiGetMarginOpenOrders, sapiGetMarginAllOrders, sapiGetMarginMyTrades, sapiGetMarginMaxBorrowable, sapiGetMarginMaxTransferable, sapiGetMarginTradeCoeff, sapiGetMarginIsolatedTransfer, sapiGetMarginIsolatedAccount, sapiGetMarginIsolatedPair, sapiGetMarginIsolatedAllPairs, sapiGetMarginIsolatedAccountLimit, sapiGetMarginInterestRateHistory, sapiGetMarginOrderList, sapiGetMarginAllOrderList, sapiGetMarginOpenOrderList, sapiGetMarginCrossMarginData, sapiGetMarginIsolatedMarginData, sapiGetMarginIsolatedMarginTier, sapiGetMarginRateLimitOrder, sapiGetMarginDribblet, sapiGetMarginDust, sapiGetMarginCrossMarginCollateralRatio, sapiGetMarginExchangeSmallLiability, sapiGetMarginExchangeSmallLiabilityHistory, sapiGetMarginNextHourlyInterestRate, sapiGetMarginCapitalFlow, sapiGetMarginDelistSchedule, sapiGetMarginAvailableInventory, sapiGetMarginLeverageBracket, sapiGetLoanVipLoanableData, sapiGetLoanVipCollateralData, sapiGetLoanVipRequestData, sapiGetLoanVipRequestInterestRate, sapiGetLoanIncome, sapiGetLoanOngoingOrders, sapiGetLoanLtvAdjustmentHistory, sapiGetLoanBorrowHistory, sapiGetLoanRepayHistory, sapiGetLoanLoanableData, sapiGetLoanCollateralData, sapiGetLoanRepayCollateralRate, sapiGetLoanFlexibleOngoingOrders, sapiGetLoanFlexibleBorrowHistory, sapiGetLoanFlexibleRepayHistory, sapiGetLoanFlexibleLtvAdjustmentHistory, sapiGetLoanVipOngoingOrders, sapiGetLoanVipRepayHistory, sapiGetLoanVipCollateralAccount, sapiGetFiatOrders, sapiGetFiatPayments, sapiGetFuturesTransfer, sapiGetFuturesHistDataLink, sapiGetRebateTaxQuery, sapiGetCapitalConfigGetall, sapiGetCapitalDepositAddress, sapiGetCapitalDepositAddressList, sapiGetCapitalDepositHisrec, sapiGetCapitalDepositSubAddress, sapiGetCapitalDepositSubHisrec, sapiGetCapitalWithdrawHistory, sapiGetCapitalWithdrawAddressList, sapiGetCapitalContractConvertibleCoins, sapiGetConvertTradeFlow, sapiGetConvertExchangeInfo, sapiGetConvertAssetInfo, sapiGetConvertOrderStatus, sapiGetConvertLimitQueryOpenOrders, sapiGetAccountStatus, sapiGetAccountApiTradingStatus, sapiGetAccountApiRestrictionsIpRestriction, sapiGetBnbBurn, sapiGetSubAccountFuturesAccount, sapiGetSubAccountFuturesAccountSummary, sapiGetSubAccountFuturesPositionRisk, sapiGetSubAccountFuturesInternalTransfer, sapiGetSubAccountList, sapiGetSubAccountMarginAccount, sapiGetSubAccountMarginAccountSummary, sapiGetSubAccountSpotSummary, sapiGetSubAccountStatus, sapiGetSubAccountSubTransferHistory, sapiGetSubAccountTransferSubUserHistory, sapiGetSubAccountUniversalTransfer, sapiGetSubAccountApiRestrictionsIpRestrictionThirdPartyList, sapiGetSubAccountTransactionStatistics, sapiGetSubAccountSubAccountApiIpRestriction, sapiGetManagedSubaccountAsset, sapiGetManagedSubaccountAccountSnapshot, sapiGetManagedSubaccountQueryTransLogForInvestor, sapiGetManagedSubaccountQueryTransLogForTradeParent, sapiGetManagedSubaccountFetchFutureAsset, sapiGetManagedSubaccountMarginAsset, sapiGetManagedSubaccountInfo, sapiGetManagedSubaccountDepositAddress, sapiGetManagedSubaccountQueryTransLog, sapiGetLendingDailyProductList, sapiGetLendingDailyUserLeftQuota, sapiGetLendingDailyUserRedemptionQuota, sapiGetLendingDailyTokenPosition, sapiGetLendingUnionAccount, sapiGetLendingUnionPurchaseRecord, sapiGetLendingUnionRedemptionRecord, sapiGetLendingUnionInterestHistory, sapiGetLendingProjectList, sapiGetLendingProjectPositionList, sapiGetEthStakingEthHistoryStakingHistory, sapiGetEthStakingEthHistoryRedemptionHistory, sapiGetEthStakingEthHistoryRewardsHistory, sapiGetEthStakingEthQuota, sapiGetEthStakingEthHistoryRateHistory, sapiGetEthStakingAccount, sapiGetEthStakingWbethHistoryWrapHistory, sapiGetEthStakingWbethHistoryUnwrapHistory, sapiGetEthStakingEthHistoryWbethRewardsHistory, sapiGetSolStakingSolHistoryStakingHistory, sapiGetSolStakingSolHistoryRedemptionHistory, sapiGetSolStakingSolHistoryBnsolRewardsHistory, sapiGetSolStakingSolHistoryRateHistory, sapiGetSolStakingAccount, sapiGetSolStakingSolQuota, sapiGetMiningPubAlgoList, sapiGetMiningPubCoinList, sapiGetMiningWorkerDetail, sapiGetMiningWorkerList, sapiGetMiningPaymentList, sapiGetMiningStatisticsUserStatus, sapiGetMiningStatisticsUserList, sapiGetMiningPaymentUid, sapiGetBswapPools, sapiGetBswapLiquidity, sapiGetBswapLiquidityOps, sapiGetBswapQuote, sapiGetBswapSwap, sapiGetBswapPoolConfigure, sapiGetBswapAddLiquidityPreview, sapiGetBswapRemoveLiquidityPreview, sapiGetBswapUnclaimedRewards, sapiGetBswapClaimedHistory, sapiGetBlvtTokenInfo, sapiGetBlvtSubscribeRecord, sapiGetBlvtRedeemRecord, sapiGetBlvtUserLimit, sapiGetApiReferralIfNewUser, sapiGetApiReferralCustomization, sapiGetApiReferralUserCustomization, sapiGetApiReferralRebateRecentRecord, sapiGetApiReferralRebateHistoricalRecord, sapiGetApiReferralKickbackRecentRecord, sapiGetApiReferralKickbackHistoricalRecord, sapiGetBrokerSubAccountApi, sapiGetBrokerSubAccount, sapiGetBrokerSubAccountApiCommissionFutures, sapiGetBrokerSubAccountApiCommissionCoinFutures, sapiGetBrokerInfo, sapiGetBrokerTransfer, sapiGetBrokerTransferFutures, sapiGetBrokerRebateRecentRecord, sapiGetBrokerRebateHistoricalRecord, sapiGetBrokerSubAccountBnbBurnStatus, sapiGetBrokerSubAccountDepositHist, sapiGetBrokerSubAccountSpotSummary, sapiGetBrokerSubAccountMarginSummary, sapiGetBrokerSubAccountFuturesSummary, sapiGetBrokerRebateFuturesRecentRecord, sapiGetBrokerSubAccountApiIpRestriction, sapiGetBrokerUniversalTransfer, sapiGetAccountApiRestrictions, sapiGetC2cOrderMatchListUserOrderHistory, sapiGetNftHistoryTransactions, sapiGetNftHistoryDeposit, sapiGetNftHistoryWithdraw, sapiGetNftUserGetAsset, sapiGetPayTransactions, sapiGetGiftcardVerify, sapiGetGiftcardCryptographyRsaPublicKey, sapiGetGiftcardBuyCodeTokenLimit, sapiGetAlgoSpotOpenOrders, sapiGetAlgoSpotHistoricalOrders, sapiGetAlgoSpotSubOrders, sapiGetAlgoFuturesOpenOrders, sapiGetAlgoFuturesHistoricalOrders, sapiGetAlgoFuturesSubOrders, sapiGetPortfolioAccount, sapiGetPortfolioCollateralRate, sapiGetPortfolioPmLoan, sapiGetPortfolioInterestHistory, sapiGetPortfolioAssetIndexPrice, sapiGetPortfolioRepayFuturesSwitch, sapiGetPortfolioMarginAssetLeverage, sapiGetPortfolioBalance, sapiGetPortfolioNegativeBalanceExchangeRecord, sapiGetPortfolioPmloanHistory, sapiGetPortfolioEarnAssetBalance, sapiGetPortfolioDeltaMode, sapiGetStakingProductList, sapiGetStakingPosition, sapiGetStakingStakingRecord, sapiGetStakingPersonalLeftQuota, sapiGetLendingAutoInvestTargetAssetList, sapiGetLendingAutoInvestTargetAssetRoiList, sapiGetLendingAutoInvestAllAsset, sapiGetLendingAutoInvestSourceAssetList, sapiGetLendingAutoInvestPlanList, sapiGetLendingAutoInvestPlanId, sapiGetLendingAutoInvestHistoryList, sapiGetLendingAutoInvestIndexInfo, sapiGetLendingAutoInvestIndexUserSummary, sapiGetLendingAutoInvestOneOffStatus, sapiGetLendingAutoInvestRedeemHistory, sapiGetLendingAutoInvestRebalanceHistory, sapiGetSimpleEarnFlexibleList, sapiGetSimpleEarnLockedList, sapiGetSimpleEarnFlexiblePersonalLeftQuota, sapiGetSimpleEarnLockedPersonalLeftQuota, sapiGetSimpleEarnFlexibleSubscriptionPreview, sapiGetSimpleEarnLockedSubscriptionPreview, sapiGetSimpleEarnFlexibleHistoryRateHistory, sapiGetSimpleEarnFlexiblePosition, sapiGetSimpleEarnLockedPosition, sapiGetSimpleEarnAccount, sapiGetSimpleEarnFlexibleHistorySubscriptionRecord, sapiGetSimpleEarnLockedHistorySubscriptionRecord, sapiGetSimpleEarnFlexibleHistoryRedemptionRecord, sapiGetSimpleEarnLockedHistoryRedemptionRecord, sapiGetSimpleEarnFlexibleHistoryRewardsRecord, sapiGetSimpleEarnLockedHistoryRewardsRecord, sapiGetSimpleEarnFlexibleHistoryCollateralRecord, sapiGetDciProductList, sapiGetDciProductPositions, sapiGetDciProductAccounts, sapiGetAccumulatorProductList, sapiGetAccumulatorProductPositionList, sapiGetAccumulatorProductSumHolding, sapiPostAssetDust, sapiPostAssetDustBtc, sapiPostAssetTransfer, sapiPostAssetGetFundingAsset, sapiPostAssetConvertTransfer, sapiPostAccountDisableFastWithdrawSwitch, sapiPostAccountEnableFastWithdrawSwitch, sapiPostCapitalWithdrawApply, sapiPostCapitalContractConvertibleCoins, sapiPostCapitalDepositCreditApply, sapiPostMarginBorrowRepay, sapiPostMarginTransfer, sapiPostMarginLoan, sapiPostMarginRepay, sapiPostMarginOrder, sapiPostMarginOrderOco, sapiPostMarginDust, sapiPostMarginExchangeSmallLiability, sapiPostMarginIsolatedTransfer, sapiPostMarginIsolatedAccount, sapiPostMarginMaxLeverage, sapiPostBnbBurn, sapiPostSubAccountVirtualSubAccount, sapiPostSubAccountMarginTransfer, sapiPostSubAccountMarginEnable, sapiPostSubAccountFuturesEnable, sapiPostSubAccountFuturesTransfer, sapiPostSubAccountFuturesInternalTransfer, sapiPostSubAccountTransferSubToSub, sapiPostSubAccountTransferSubToMaster, sapiPostSubAccountUniversalTransfer, sapiPostSubAccountOptionsEnable, sapiPostManagedSubaccountDeposit, sapiPostManagedSubaccountWithdraw, sapiPostUserDataStream, sapiPostUserDataStreamIsolated, sapiPostUserListenToken, sapiPostFuturesTransfer, sapiPostLendingCustomizedFixedPurchase, sapiPostLendingDailyPurchase, sapiPostLendingDailyRedeem, sapiPostBswapLiquidityAdd, sapiPostBswapLiquidityRemove, sapiPostBswapSwap, sapiPostBswapClaimRewards, sapiPostBlvtSubscribe, sapiPostBlvtRedeem, sapiPostApiReferralCustomization, sapiPostApiReferralUserCustomization, sapiPostApiReferralRebateHistoricalRecord, sapiPostApiReferralKickbackHistoricalRecord, sapiPostBrokerSubAccount, sapiPostBrokerSubAccountMargin, sapiPostBrokerSubAccountFutures, sapiPostBrokerSubAccountApi, sapiPostBrokerSubAccountApiPermission, sapiPostBrokerSubAccountApiCommission, sapiPostBrokerSubAccountApiCommissionFutures, sapiPostBrokerSubAccountApiCommissionCoinFutures, sapiPostBrokerTransfer, sapiPostBrokerTransferFutures, sapiPostBrokerRebateHistoricalRecord, sapiPostBrokerSubAccountBnbBurnSpot, sapiPostBrokerSubAccountBnbBurnMarginInterest, sapiPostBrokerSubAccountBlvt, sapiPostBrokerSubAccountApiIpRestriction, sapiPostBrokerSubAccountApiIpRestrictionIpList, sapiPostBrokerUniversalTransfer, sapiPostBrokerSubAccountApiPermissionUniversalTransfer, sapiPostBrokerSubAccountApiPermissionVanillaOptions, sapiPostGiftcardCreateCode, sapiPostGiftcardRedeemCode, sapiPostGiftcardBuyCode, sapiPostAlgoSpotNewOrderTwap, sapiPostAlgoFuturesNewOrderVp, sapiPostAlgoFuturesNewOrderTwap, sapiPostStakingPurchase, sapiPostStakingRedeem, sapiPostStakingSetAutoStaking, sapiPostEthStakingEthStake, sapiPostEthStakingEthRedeem, sapiPostEthStakingWbethWrap, sapiPostSolStakingSolStake, sapiPostSolStakingSolRedeem, sapiPostMiningHashTransferConfig, sapiPostMiningHashTransferConfigCancel, sapiPostPortfolioRepay, sapiPostLoanVipRenew, sapiPostLoanVipBorrow, sapiPostLoanBorrow, sapiPostLoanRepay, sapiPostLoanAdjustLtv, sapiPostLoanCustomizeMarginCall, sapiPostLoanFlexibleRepay, sapiPostLoanFlexibleAdjustLtv, sapiPostLoanVipRepay, sapiPostConvertGetQuote, sapiPostConvertAcceptQuote, sapiPostConvertLimitPlaceOrder, sapiPostConvertLimitCancelOrder, sapiPostPortfolioAutoCollection, sapiPostPortfolioAssetCollection, sapiPostPortfolioBnbTransfer, sapiPostPortfolioRepayFuturesSwitch, sapiPostPortfolioRepayFuturesNegativeBalance, sapiPostPortfolioMint, sapiPostPortfolioRedeem, sapiPostPortfolioEarnAssetTransfer, sapiPostPortfolioDeltaMode, sapiPostLendingAutoInvestPlanAdd, sapiPostLendingAutoInvestPlanEdit, sapiPostLendingAutoInvestPlanEditStatus, sapiPostLendingAutoInvestOneOff, sapiPostLendingAutoInvestRedeem, sapiPostSimpleEarnFlexibleSubscribe, sapiPostSimpleEarnLockedSubscribe, sapiPostSimpleEarnFlexibleRedeem, sapiPostSimpleEarnLockedRedeem, sapiPostSimpleEarnFlexibleSetAutoSubscribe, sapiPostSimpleEarnLockedSetAutoSubscribe, sapiPostSimpleEarnLockedSetRedeemOption, sapiPostDciProductSubscribe, sapiPostDciProductAutoCompoundEdit, sapiPostAccumulatorProductSubscribe, sapiPutUserDataStream, sapiPutUserDataStreamIsolated, sapiDeleteMarginOpenOrders, sapiDeleteMarginOrder, sapiDeleteMarginOrderList, sapiDeleteMarginIsolatedAccount, sapiDeleteUserDataStream, sapiDeleteUserDataStreamIsolated, sapiDeleteBrokerSubAccountApi, sapiDeleteBrokerSubAccountApiIpRestrictionIpList, sapiDeleteAlgoSpotOrder, sapiDeleteAlgoFuturesOrder, sapiDeleteSubAccountSubAccountApiIpRestrictionIpList, sapiV2GetEthStakingAccount, sapiV2GetSubAccountFuturesAccount, sapiV2GetSubAccountFuturesAccountSummary, sapiV2GetSubAccountFuturesPositionRisk, sapiV2GetLoanFlexibleOngoingOrders, sapiV2GetLoanFlexibleBorrowHistory, sapiV2GetLoanFlexibleRepayHistory, sapiV2GetLoanFlexibleLtvAdjustmentHistory, sapiV2GetLoanFlexibleLoanableData, sapiV2GetLoanFlexibleCollateralData, sapiV2GetPortfolioAccount, sapiV2PostEthStakingEthStake, sapiV2PostSubAccountSubAccountApiIpRestriction, sapiV2PostLoanFlexibleBorrow, sapiV2PostLoanFlexibleRepay, sapiV2PostLoanFlexibleAdjustLtv, sapiV3GetSubAccountAssets, sapiV3PostAssetGetUserAsset, sapiV4GetSubAccountAssets, dapiPublicGetPing, dapiPublicGetTime, dapiPublicGetExchangeInfo, dapiPublicGetDepth, dapiPublicGetTrades, dapiPublicGetHistoricalTrades, dapiPublicGetAggTrades, dapiPublicGetPremiumIndex, dapiPublicGetFundingRate, dapiPublicGetKlines, dapiPublicGetContinuousKlines, dapiPublicGetIndexPriceKlines, dapiPublicGetMarkPriceKlines, dapiPublicGetPremiumIndexKlines, dapiPublicGetTicker24hr, dapiPublicGetTickerPrice, dapiPublicGetTickerBookTicker, dapiPublicGetConstituents, dapiPublicGetOpenInterest, dapiPublicGetFundingInfo, dapiDataGetDeliveryPrice, dapiDataGetOpenInterestHist, dapiDataGetTopLongShortAccountRatio, dapiDataGetTopLongShortPositionRatio, dapiDataGetGlobalLongShortAccountRatio, dapiDataGetTakerBuySellVol, dapiDataGetBasis, dapiPrivateGetPositionSideDual, dapiPrivateGetOrderAmendment, dapiPrivateGetOrder, dapiPrivateGetOpenOrder, dapiPrivateGetOpenOrders, dapiPrivateGetOpenAlgoOrders, dapiPrivateGetAllOrders, dapiPrivateGetBalance, dapiPrivateGetAccount, dapiPrivateGetPositionMarginHistory, dapiPrivateGetPositionRisk, dapiPrivateGetUserTrades, dapiPrivateGetIncome, dapiPrivateGetLeverageBracket, dapiPrivateGetForceOrders, dapiPrivateGetAdlQuantile, dapiPrivateGetCommissionRate, dapiPrivateGetIncomeAsyn, dapiPrivateGetIncomeAsynId, dapiPrivateGetTradeAsyn, dapiPrivateGetTradeAsynId, dapiPrivateGetOrderAsyn, dapiPrivateGetOrderAsynId, dapiPrivateGetPmExchangeInfo, dapiPrivateGetPmAccountInfo, dapiPrivatePostPositionSideDual, dapiPrivatePostOrder, dapiPrivatePostAlgoOrder, dapiPrivatePostBatchOrders, dapiPrivatePostCountdownCancelAll, dapiPrivatePostLeverage, dapiPrivatePostMarginType, dapiPrivatePostPositionMargin, dapiPrivatePostListenKey, dapiPrivatePutListenKey, dapiPrivatePutOrder, dapiPrivatePutBatchOrders, dapiPrivateDeleteOrder, dapiPrivateDeleteAlgoOrder, dapiPrivateDeleteAllOpenOrders, dapiPrivateDeleteBatchOrders, dapiPrivateDeleteListenKey, dapiPrivateV2GetLeverageBracket, fapiPublicGetPing, fapiPublicGetTime, fapiPublicGetExchangeInfo, fapiPublicGetDepth, fapiPublicGetRpiDepth, fapiPublicGetTrades, fapiPublicGetHistoricalTrades, fapiPublicGetAggTrades, fapiPublicGetKlines, fapiPublicGetContinuousKlines, fapiPublicGetMarkPriceKlines, fapiPublicGetIndexPriceKlines, fapiPublicGetPremiumIndexKlines, fapiPublicGetFundingRate, fapiPublicGetFundingInfo, fapiPublicGetPremiumIndex, fapiPublicGetTicker24hr, fapiPublicGetTickerPrice, fapiPublicGetTickerBookTicker, fapiPublicGetOpenInterest, fapiPublicGetIndexInfo, fapiPublicGetAssetIndex, fapiPublicGetConstituents, fapiPublicGetApiTradingStatus, fapiPublicGetLvtKlines, fapiPublicGetConvertExchangeInfo, fapiPublicGetInsuranceBalance, fapiPublicGetSymbolAdlRisk, fapiPublicGetTradingSchedule, fapiDataGetDeliveryPrice, fapiDataGetOpenInterestHist, fapiDataGetTopLongShortAccountRatio, fapiDataGetTopLongShortPositionRatio, fapiDataGetGlobalLongShortAccountRatio, fapiDataGetTakerlongshortRatio, fapiDataGetBasis, fapiPrivateGetForceOrders, fapiPrivateGetAllOrders, fapiPrivateGetOpenOrder, fapiPrivateGetOpenOrders, fapiPrivateGetOrder, fapiPrivateGetAccount, fapiPrivateGetBalance, fapiPrivateGetLeverageBracket, fapiPrivateGetPositionMarginHistory, fapiPrivateGetPositionRisk, fapiPrivateGetPositionSideDual, fapiPrivateGetUserTrades, fapiPrivateGetIncome, fapiPrivateGetCommissionRate, fapiPrivateGetRateLimitOrder, fapiPrivateGetApiTradingStatus, fapiPrivateGetMultiAssetsMargin, fapiPrivateGetApiReferralIfNewUser, fapiPrivateGetApiReferralCustomization, fapiPrivateGetApiReferralUserCustomization, fapiPrivateGetApiReferralTraderNum, fapiPrivateGetApiReferralOverview, fapiPrivateGetApiReferralTradeVol, fapiPrivateGetApiReferralRebateVol, fapiPrivateGetApiReferralTraderSummary, fapiPrivateGetAdlQuantile, fapiPrivateGetPmAccountInfo, fapiPrivateGetOrderAmendment, fapiPrivateGetIncomeAsyn, fapiPrivateGetIncomeAsynId, fapiPrivateGetOrderAsyn, fapiPrivateGetOrderAsynId, fapiPrivateGetTradeAsyn, fapiPrivateGetTradeAsynId, fapiPrivateGetFeeBurn, fapiPrivateGetSymbolConfig, fapiPrivateGetAccountConfig, fapiPrivateGetConvertOrderStatus, fapiPrivateGetAlgoOrder, fapiPrivateGetOpenAlgoOrders, fapiPrivateGetAllAlgoOrders, fapiPrivateGetStockContract, fapiPrivatePostBatchOrders, fapiPrivatePostPositionSideDual, fapiPrivatePostPositionMargin, fapiPrivatePostMarginType, fapiPrivatePostOrder, fapiPrivatePostOrderTest, fapiPrivatePostLeverage, fapiPrivatePostListenKey, fapiPrivatePostCountdownCancelAll, fapiPrivatePostMultiAssetsMargin, fapiPrivatePostApiReferralCustomization, fapiPrivatePostApiReferralUserCustomization, fapiPrivatePostFeeBurn, fapiPrivatePostConvertGetQuote, fapiPrivatePostConvertAcceptQuote, fapiPrivatePostAlgoOrder, fapiPrivatePutListenKey, fapiPrivatePutOrder, fapiPrivatePutBatchOrders, fapiPrivateDeleteBatchOrders, fapiPrivateDeleteOrder, fapiPrivateDeleteAllOpenOrders, fapiPrivateDeleteListenKey, fapiPrivateDeleteAlgoOrder, fapiPrivateDeleteAlgoOpenOrders, fapiPublicV2GetTickerPrice, fapiPrivateV2GetAccount, fapiPrivateV2GetBalance, fapiPrivateV2GetPositionRisk, fapiPrivateV3GetAccount, fapiPrivateV3GetBalance, fapiPrivateV3GetPositionRisk, eapiPublicGetPing, eapiPublicGetTime, eapiPublicGetExchangeInfo, eapiPublicGetIndex, eapiPublicGetTicker, eapiPublicGetMark, eapiPublicGetDepth, eapiPublicGetKlines, eapiPublicGetTrades, eapiPublicGetHistoricalTrades, eapiPublicGetExerciseHistory, eapiPublicGetOpenInterest, eapiPrivateGetAccount, eapiPrivateGetPosition, eapiPrivateGetOpenOrders, eapiPrivateGetHistoryOrders, eapiPrivateGetUserTrades, eapiPrivateGetExerciseRecord, eapiPrivateGetBill, eapiPrivateGetIncomeAsyn, eapiPrivateGetIncomeAsynId, eapiPrivateGetMarginAccount, eapiPrivateGetMmp, eapiPrivateGetCountdownCancelAll, eapiPrivateGetOrder, eapiPrivateGetBlockOrderOrders, eapiPrivateGetBlockOrderExecute, eapiPrivateGetBlockUserTrades, eapiPrivateGetBlockTrades, eapiPrivateGetComission, eapiPrivatePostOrder, eapiPrivatePostBatchOrders, eapiPrivatePostListenKey, eapiPrivatePostMmpSet, eapiPrivatePostMmpReset, eapiPrivatePostCountdownCancelAll, eapiPrivatePostCountdownCancelAllHeartBeat, eapiPrivatePostBlockOrderCreate, eapiPrivatePostBlockOrderExecute, eapiPrivatePutListenKey, eapiPrivatePutBlockOrderCreate, eapiPrivateDeleteOrder, eapiPrivateDeleteBatchOrders, eapiPrivateDeleteAllOpenOrders, eapiPrivateDeleteAllOpenOrdersByUnderlying, eapiPrivateDeleteListenKey, eapiPrivateDeleteBlockOrderCreate, publicGetPing, publicGetTime, publicGetDepth, publicGetTrades, publicGetAggTrades, publicGetHistoricalTrades, publicGetKlines, publicGetUiKlines, publicGetTicker24hr, publicGetTicker, publicGetTickerTradingDay, publicGetTickerPrice, publicGetTickerBookTicker, publicGetExchangeInfo, publicGetAvgPrice, publicPutUserDataStream, publicPostUserDataStream, publicDeleteUserDataStream, privateGetAllOrderList, privateGetOpenOrderList, privateGetOrderList, privateGetOrder, privateGetOpenOrders, privateGetAllOrders, privateGetAccount, privateGetMyTrades, privateGetRateLimitOrder, privateGetMyPreventedMatches, privateGetMyAllocations, privateGetAccountCommission, privatePostOrderOco, privatePostOrderListOco, privatePostOrderListOto, privatePostOrderListOtoco, privatePostOrderListOpo, privatePostOrderListOpoco, privatePostSorOrder, privatePostSorOrderTest, privatePostOrder, privatePostOrderCancelReplace, privatePostOrderTest, privateDeleteOpenOrders, privateDeleteOrderList, privateDeleteOrder, papiGetPing, papiGetUmOrder, papiGetUmOpenOrder, papiGetUmOpenOrders, papiGetUmAllOrders, papiGetCmOrder, papiGetCmOpenOrder, papiGetCmOpenOrders, papiGetCmAllOrders, papiGetUmConditionalOpenOrder, papiGetUmConditionalOpenOrders, papiGetUmConditionalOrderHistory, papiGetUmConditionalAllOrders, papiGetCmConditionalOpenOrder, papiGetCmConditionalOpenOrders, papiGetCmConditionalOrderHistory, papiGetCmConditionalAllOrders, papiGetMarginOrder, papiGetMarginOpenOrders, papiGetMarginAllOrders, papiGetMarginOrderList, papiGetMarginAllOrderList, papiGetMarginOpenOrderList, papiGetMarginMyTrades, papiGetBalance, papiGetAccount, papiGetMarginMaxBorrowable, papiGetMarginMaxWithdraw, papiGetUmPositionRisk, papiGetCmPositionRisk, papiGetUmPositionSideDual, papiGetCmPositionSideDual, papiGetUmUserTrades, papiGetCmUserTrades, papiGetUmLeverageBracket, papiGetCmLeverageBracket, papiGetMarginForceOrders, papiGetUmForceOrders, papiGetCmForceOrders, papiGetUmApiTradingStatus, papiGetUmCommissionRate, papiGetCmCommissionRate, papiGetMarginMarginLoan, papiGetMarginRepayLoan, papiGetMarginMarginInterestHistory, papiGetPortfolioInterestHistory, papiGetUmIncome, papiGetCmIncome, papiGetUmAccount, papiGetCmAccount, papiGetRepayFuturesSwitch, papiGetUmAdlQuantile, papiGetCmAdlQuantile, papiGetUmTradeAsyn, papiGetUmTradeAsynId, papiGetUmOrderAsyn, papiGetUmOrderAsynId, papiGetUmIncomeAsyn, papiGetUmIncomeAsynId, papiGetUmOrderAmendment, papiGetCmOrderAmendment, papiGetUmFeeBurn, papiGetUmAccountConfig, papiGetUmSymbolConfig, papiGetCmAccountConfig, papiGetCmSymbolConfig, papiGetRateLimitOrder, papiPostUmOrder, papiPostUmConditionalOrder, papiPostCmOrder, papiPostCmConditionalOrder, papiPostMarginOrder, papiPostMarginLoan, papiPostRepayLoan, papiPostMarginOrderOco, papiPostUmLeverage, papiPostCmLeverage, papiPostUmPositionSideDual, papiPostCmPositionSideDual, papiPostAutoCollection, papiPostBnbTransfer, papiPostRepayFuturesSwitch, papiPostRepayFuturesNegativeBalance, papiPostListenKey, papiPostAssetCollection, papiPostMarginRepayDebt, papiPostUmFeeBurn, papiPostUmStockContract, papiPutListenKey, papiPutUmOrder, papiPutCmOrder, papiDeleteUmOrder, papiDeleteUmConditionalOrder, papiDeleteUmAllOpenOrders, papiDeleteUmConditionalAllOpenOrders, papiDeleteCmOrder, papiDeleteCmConditionalOrder, papiDeleteCmAllOpenOrders, papiDeleteCmConditionalAllOpenOrders, papiDeleteMarginOrder, papiDeleteMarginAllOpenOrders, papiDeleteMarginOrderList, papiDeleteListenKey, papiV2GetUmAccount)
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
function __ccxt_doc_Binance_enableDemoTrading() end
"""
enables or disables demo trading mode
see: https://www.binance.com/en/support/faq/detail/9be58f73e5e14338809e3b705b9687dd
see: https://demo.binance.com/en/my/settings/api-management

# Arguments
- `enable`::bool, optional: true if demo trading should be enabled, false otherwise
"""
__ccxt_doc_Binance_enableDemoTrading

function __ccxt_doc_Binance_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/general-endpoints#check-server-time          // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Check-Server-Time    // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Check-Server-time    // future

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Binance_fetchTime

function __ccxt_doc_Binance_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://developers.binance.com/docs/wallet/capital/all-coins-info
see: https://developers.binance.com/docs/margin_trading/market-data/Get-All-Margin-Assets

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Binance_fetchCurrencies

function __ccxt_doc_Binance_fetchMarkets() end
"""
retrieves data on all markets for binance
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/general-endpoints#exchange-information           // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Exchange-Information     // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Exchange-Information     // future
see: https://developers.binance.com/docs/derivatives/option/market-data/Exchange-Information                             // option
see: https://developers.binance.com/docs/margin_trading/market-data/Get-All-Cross-Margin-Pairs                           // cross margin
see: https://developers.binance.com/docs/margin_trading/market-data/Get-All-Isolated-Margin-Symbol                       // isolated margin

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Binance_fetchMarkets

function __ccxt_doc_Binance_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/account-endpoints#account-information-user_data  // spot
see: https://developers.binance.com/docs/margin_trading/account/Query-Cross-Margin-Account-Details                       // cross margin
see: https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Account-Info                       // isolated margin
see: https://developers.binance.com/docs/wallet/asset/funding-wallet                                                     // funding
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Futures-Account-Balance-V2   // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Futures-Account-Balance      // future
see: https://developers.binance.com/docs/derivatives/option/account/Option-Account-Information                           // option
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Account-Balance                            // portfolio margin

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'future', 'delivery', 'savings', 'funding', or 'spot' or 'papi'
- `params.marginMode`::string, optional: 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
- `params.symbols`::any, optional: unified market symbols, only used in isolated margin mode
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch the balance for a portfolio margin account
- `params.subType`::string, optional: 'linear' or 'inverse'

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Binance_fetchBalance

function __ccxt_doc_Binance_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#order-book       // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book     // swap
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book-RPI // swap rpi
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Order-Book     // future
see: https://developers.binance.com/docs/derivatives/option/market-data/Order-Book                             // option

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.rpi`::bool, optional: *future only* set to true to use the RPI endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Binance_fetchOrderBook

function __ccxt_doc_Binance_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://developers.binance.com/docs/wallet/others/system-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Binance_fetchStatus

function __ccxt_doc_Binance_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#24hr-ticker-price-change-statistics     // spot
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#rolling-window-price-change-statistics  // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics   // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics   // future
see: https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics                           // option

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.rolling`::bool, optional: (spot only) default false, if true, uses the rolling 24 hour ticker endpoint /api/v3/ticker

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Binance_fetchTicker

function __ccxt_doc_Binance_fetchBidsAsks() end
"""
fetches the bid and ask price and volume for multiple markets
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#symbol-order-book-ticker   // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Order-Book-Ticker // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Symbol-Order-Book-Ticker // future
see: https://developers.binance.com/docs/derivatives/options-trading/market-data/24hr-Ticker-Price-Change-Statistics      // option

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Binance_fetchBidsAsks

function __ccxt_doc_Binance_fetchLastPrices() end
"""
fetches the last price for multiple markets
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#symbol-price-ticker    // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Price-Ticker  // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Symbol-Price-Ticker  // future

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the last prices
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of lastprices structures
"""
__ccxt_doc_Binance_fetchLastPrices

function __ccxt_doc_Binance_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#24hr-ticker-price-change-statistics    // spot
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics  // swap
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics  // future
see: https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics                          // option

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"
- `params.type`::string, optional: 'spot', 'option', use params["subType"] for swap and future markets

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Binance_fetchTickers

function __ccxt_doc_Binance_fetchMarkPrice() end
"""
fetches mark price for the market
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
see: https://developers.binance.com/docs/derivatives/options-trading/market-data/Option-Mark-Price

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Binance_fetchMarkPrice

function __ccxt_doc_Binance_fetchMarkPrices() end
"""
fetches mark prices for multiple markets
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
see: https://developers.binance.com/docs/derivatives/options-trading/market-data/Option-Mark-Price

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Binance_fetchMarkPrices

function __ccxt_doc_Binance_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#klinecandlestick-data
see: https://developers.binance.com/docs/derivatives/option/market-data/Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Premium-Index-Kline-Data
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Premium-Index-Kline-Data

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.price`::string, optional: "mark" or "index" for mark price and index price candles
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Binance_fetchOHLCV

function __ccxt_doc_Binance_fetchTrades() end
"""
get the list of most recent trades for a particular symbol Default fetchTradesMethod Other fetchTradesMethod
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#compressedaggregate-trades-list    // publicGetAggTrades (spot)
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Compressed-Aggregate-Trades-List // fapiPublicGetAggTrades (swap)
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Compressed-Aggregate-Trades-List // dapiPublicGetAggTrades (future)
see: https://developers.binance.com/docs/derivatives/option/market-data/Recent-Trades-List                                       // eapiPublicGetTrades (option)
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#recent-trades-list                 // publicGetTrades (spot)
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Recent-Trades-List               // fapiPublicGetTrades (swap)
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Recent-Trades-List               // dapiPublicGetTrades (future)
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#old-trade-lookup                   // publicGetHistoricalTrades (spot)
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Old-Trades-Lookup                // fapiPublicGetHistoricalTrades (swap)
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Old-Trades-Lookup                // dapiPublicGetHistoricalTrades (future)
see: https://developers.binance.com/docs/derivatives/option/market-data/Old-Trades-Lookup                                        // eapiPublicGetHistoricalTrades (option)

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: only used when fetchTradesMethod is 'publicGetAggTrades', 'fapiPublicGetAggTrades', or 'dapiPublicGetAggTrades'
- `limit`::int, optional: default 500, max 1000
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: only used when fetchTradesMethod is 'publicGetAggTrades', 'fapiPublicGetAggTrades', or 'dapiPublicGetAggTrades'
- `params.fetchTradesMethod`::int, optional: 'publicGetAggTrades' (spot default), 'fapiPublicGetAggTrades' (swap default), 'dapiPublicGetAggTrades' (future default), 'eapiPublicGetTrades' (option default), 'publicGetTrades', 'fapiPublicGetTrades', 'dapiPublicGetTrades', 'publicGetHistoricalTrades', 'fapiPublicGetHistoricalTrades', 'dapiPublicGetHistoricalTrades', 'eapiPublicGetHistoricalTrades'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) EXCHANGE SPECIFIC PARAMETERS
- `params.fromId`::int, optional: trade id to fetch from, default gets most recent trades, not used when fetchTradesMethod is 'publicGetTrades', 'fapiPublicGetTrades', 'dapiPublicGetTrades', or 'eapiPublicGetTrades'

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Binance_fetchTrades

function __ccxt_doc_Binance_editSpotOrder() end
"""
edit a trade order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-an-existing-order-and-send-a-new-order-trade

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_editSpotOrder

function __ccxt_doc_Binance_editContractOrder() end
"""
edit a trade order
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Modify-UM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Modify-CM-Order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to edit an order in a portfolio margin account

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_editContractOrder

function __ccxt_doc_Binance_editOrder() end
"""
edit a trade order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-an-existing-order-and-send-a-new-order-trade
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_editOrder

function __ccxt_doc_Binance_editOrders() end
"""
edit a list of trade orders
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Multiple-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Multiple-Orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_editOrders

function __ccxt_doc_Binance_createOrders() end
"""
*contract only* create a list of trade orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Place-Multiple-Orders
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Place-Multiple-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Place-Multiple-Orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_createOrders

function __ccxt_doc_Binance_createOrder() end
"""
create a trade order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade
see: https://developers.binance.com/docs/binance-spot-api-docs/testnet/rest-api/trading-endpoints#test-new-order-trade
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api
see: https://developers.binance.com/docs/derivatives/option/trade/New-Order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#sor
see: https://developers.binance.com/docs/binance-spot-api-docs/testnet/rest-api/trading-endpoints#sor
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-UM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-CM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-Margin-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-UM-Conditional-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-CM-Conditional-Order
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Algo-Order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of you want to trade in units of the base currency
- `price`::float, optional: the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.reduceOnly`::string, optional: for swap and future reduceOnly is a string 'true' or 'false' that cant be sent with close position set to true or in hedge mode. For spot margin and option reduceOnly is a boolean.
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.sor`::bool, optional: *spot only* whether to use SOR (Smart Order Routing) or not, default is false
- `params.test`::bool, optional: *spot only* whether to use the test endpoint or not, default is false
- `params.trailingPercent`::float, optional: the percent to trail away from the current market price
- `params.trailingTriggerPrice`::float, optional: the price to trigger a trailing order, default uses the price argument
- `params.triggerPrice`::float, optional: the price that a trigger order is triggered at
- `params.stopLossPrice`::float, optional: the price that a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: the price that a take profit order is triggered at
- `params.portfolioMargin`::bool, optional: set to true if you would like to create an order in a portfolio margin account
- `params.selfTradePrevention`::string, optional: set unified value for stp, one of NONE, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH
- `params.icebergAmount`::float, optional: set iceberg amount for limit orders
- `params.stopLossOrTakeProfit`::string, optional: 'stopLoss' or 'takeProfit', required for spot trailing orders
- `params.positionSide`::string, optional: *swap and portfolio margin only* "BOTH" for one-way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode
- `params.hedged`::bool, optional: *swap and portfolio margin only* true for hedged mode, false for one way mode, default is false
- `params.clientOrderId`::string, optional: the clientOrderId of the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_createOrder

function __ccxt_doc_Binance_createMarketOrderWithCost() end
"""
create a market order by providing the symbol, side and cost
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_createMarketOrderWithCost

function __ccxt_doc_Binance_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_createMarketBuyOrderWithCost

function __ccxt_doc_Binance_createMarketSellOrderWithCost() end
"""
create a market sell order by providing the symbol and cost
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_createMarketSellOrderWithCost

function __ccxt_doc_Binance_fetchOrder() end
"""
fetches information on an order made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#query-order-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Query-Order
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Single-Order
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-UM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-CM-Order
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-Algo-Order

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch an order in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch a trigger or conditional order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_fetchOrder

function __ccxt_doc_Binance_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-All-Algo-Orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch orders in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch portfolio margin account trigger or conditional orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_fetchOrders

function __ccxt_doc_Binance_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#current-open-orders-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Current-All-Open-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Current-All-Open-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Current-Open-Option-Orders
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Current-All-Algo-Open-Orders

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch open orders in the portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch portfolio margin account conditional orders
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_fetchOpenOrders

function __ccxt_doc_Binance_fetchOpenOrder() end
"""
fetch an open order by the id
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-Current-Open-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Query-Current-Open-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-UM-Open-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-UM-Open-Conditional-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-CM-Open-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-CM-Open-Conditional-Order

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::string, optional: set to true if you would like to fetch portfolio margin account stop or conditional orders
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch for a portfolio margin account

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_fetchOpenOrder

function __ccxt_doc_Binance_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch orders in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch portfolio margin account trigger or conditional orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_fetchClosedOrders

function __ccxt_doc_Binance_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders

# Arguments
- `symbol`::string: unified market symbol of the market the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch orders in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch portfolio margin account trigger or conditional orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_fetchCanceledOrders

function __ccxt_doc_Binance_fetchCanceledAndClosedOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders

# Arguments
- `symbol`::string: unified market symbol of the market the orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch orders in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to fetch portfolio margin account trigger or conditional orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_fetchCanceledAndClosedOrders

function __ccxt_doc_Binance_cancelOrder() end
"""
cancels an open order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-order-trade
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-Order
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Cancel-Order
see: https://developers.binance.com/docs/derivatives/option/trade/Cancel-Option-Order
see: https://developers.binance.com/docs/margin_trading/trade/Margin-Account-Cancel-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-UM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-CM-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-UM-Conditional-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-CM-Conditional-Order
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-Margin-Account-Order
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-Algo-Order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to cancel an order in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to cancel a portfolio margin account conditional order

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_cancelOrder

function __ccxt_doc_Binance_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-all-open-orders-on-a-symbol-trade
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-All-Open-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Cancel-All-Open-Orders
see: https://developers.binance.com/docs/derivatives/option/trade/Cancel-all-Option-orders-on-specific-symbol
see: https://developers.binance.com/docs/margin_trading/trade/Margin-Account-Cancel-All-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-UM-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-UM-Open-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-CM-Open-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-CM-Open-Conditional-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-Margin-Account-All-Open-Orders-on-a-Symbol
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-All-Algo-Open-Orders

# Arguments
- `symbol`::string: unified market symbol of the market to cancel orders in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated', for spot margin trading
- `params.portfolioMargin`::bool, optional: set to true if you would like to cancel orders in a portfolio margin account
- `params.trigger`::bool, optional: set to true if you would like to cancel portfolio margin account conditional orders

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_cancelAllOrders

function __ccxt_doc_Binance_cancelOrders() end
"""
cancel multiple orders
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-Multiple-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Cancel-Multiple-Orders

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: alternative to ids, array of client order ids EXCHANGE SPECIFIC PARAMETERS
- `params.origClientOrderIdList`::array, optional: max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
- `params.recvWindow`::array, optional:

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Binance_cancelOrders

function __ccxt_doc_Binance_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/account-endpoints#account-trade-list-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Account-Trade-List
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Account-Trade-List
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Trade-List

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Binance_fetchOrderTrades

function __ccxt_doc_Binance_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/account-endpoints#account-trade-list-user_data
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Account-Trade-List
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Account-Trade-List
see: https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Trade-List
see: https://developers.binance.com/docs/derivatives/option/trade/Account-Trade-List
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/UM-Account-Trade-List
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/CM-Account-Trade-List

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch trades for a portfolio margin account

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Binance_fetchMyTrades

function __ccxt_doc_Binance_fetchMyDustTrades() end
"""
fetch all dust trades made by the user
see: https://developers.binance.com/docs/wallet/asset/dust-log

# Arguments
- `symbol`::string: not used by fetchMyDustTrades ()
- `since`::int, optional: the earliest time in ms to fetch my dust trades for
- `limit`::int, optional: the maximum number of dust trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'margin', default spot

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Binance_fetchMyDustTrades

function __ccxt_doc_Binance_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://developers.binance.com/docs/wallet/capital/deposite-history
see: https://developers.binance.com/docs/fiat/rest-api/Get-Fiat-Deposit-Withdraw-History

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fiat`::bool, optional: if true, only fiat deposits will be returned
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Binance_fetchDeposits

function __ccxt_doc_Binance_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://developers.binance.com/docs/wallet/capital/withdraw-history
see: https://developers.binance.com/docs/fiat/rest-api/Get-Fiat-Deposit-Withdraw-History

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fiat`::bool, optional: if true, only fiat withdrawals will be returned
- `params.until`::int, optional: the latest time in ms to fetch withdrawals for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Binance_fetchWithdrawals

function __ccxt_doc_Binance_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://developers.binance.com/docs/wallet/asset/user-universal-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: exchange specific transfer type
- `params.symbol`::string, optional: the unified symbol, required for isolated margin transfers

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Binance_transfer

function __ccxt_doc_Binance_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://developers.binance.com/docs/wallet/asset/query-user-universal-transfer

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfers structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch transfers for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.internal`::bool, optional: default false, when true will fetch pay trade history

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Binance_fetchTransfers

function __ccxt_doc_Binance_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://developers.binance.com/docs/wallet/capital/deposite-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: network for fetch deposit address

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Binance_fetchDepositAddress

function __ccxt_doc_Binance_fetchTransactionFees() end
"""
please use fetchDepositWithdrawFees instead
see: https://developers.binance.com/docs/wallet/capital/all-coins-info

# Arguments
- `codes`::any: not used by fetchTransactionFees ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Binance_fetchTransactionFees

function __ccxt_doc_Binance_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://developers.binance.com/docs/wallet/capital/all-coins-info

# Arguments
- `codes`::any: not used by fetchDepositWithdrawFees ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Binance_fetchDepositWithdrawFees

function __ccxt_doc_Binance_withdraw() end
"""
make a withdrawal
see: https://developers.binance.com/docs/wallet/capital/withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Binance_withdraw

function __ccxt_doc_Binance_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://developers.binance.com/docs/wallet/asset/trade-fee
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/User-Commission-Rate
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/User-Commission-Rate
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-User-Commission-Rate-for-UM
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-User-Commission-Rate-for-CM

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch trading fees in a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Binance_fetchTradingFee

function __ccxt_doc_Binance_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://developers.binance.com/docs/wallet/asset/trade-fee
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Config

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Binance_fetchTradingFees

function __ccxt_doc_Binance_futuresTransfer() end
"""
transfer between futures account
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/New-Future-Account-Transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to transfer
- `type`::string: 1 - transfer from spot account to USDT-Ⓜ futures account, 2 - transfer from USDT-Ⓜ futures account to spot account, 3 - transfer from spot account to COIN-Ⓜ futures account, 4 - transfer from COIN-Ⓜ futures account to spot account
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.recvWindow`::float:

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=futures-transfer-structure}
"""
__ccxt_doc_Binance_futuresTransfer

function __ccxt_doc_Binance_fetchFundingRate() end
"""
fetch the current funding rate
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Binance_fetchFundingRate

function __ccxt_doc_Binance_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-History
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Get-Funding-Rate-History-of-Perpetual-Futures

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
__ccxt_doc_Binance_fetchFundingRateHistory

function __ccxt_doc_Binance_fetchFundingRates() end
"""
fetch the funding rate for multiple markets
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
__ccxt_doc_Binance_fetchFundingRates

function __ccxt_doc_Binance_fetchLeverageTiers() end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Notional-and-Leverage-Brackets
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Notional-Bracket-for-Pair
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/UM-Notional-and-Leverage-Brackets
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/CM-Notional-and-Leverage-Brackets

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch the leverage tiers for a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
__ccxt_doc_Binance_fetchLeverageTiers

function __ccxt_doc_Binance_fetchPosition() end
"""
fetch data on an open position
see: https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Binance_fetchPosition

function __ccxt_doc_Binance_fetchOptionPositions() end
"""
fetch data on open options positions
see: https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Binance_fetchOptionPositions

function __ccxt_doc_Binance_fetchPositions() end
"""
fetch all open positions
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-Information
see: https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.method`::string, optional: method name to call, "positionRisk", "account" or "option", default is "positionRisk"
- `params.useV2`::bool, optional: set to true if you want to use the obsolete endpoint, where some more additional fields were provided

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Binance_fetchPositions

function __ccxt_doc_Binance_fetchAccountPositions() end
"""
fetch account positions
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V3

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch positions in a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"
- `params.filterClosed`::bool, optional: set to true if you would like to filter out closed positions, default is false
- `params.useV2`::bool, optional: set to true if you want to use obsolete endpoint, where some more additional fields were provided

# Returns
- data on account positions
"""
__ccxt_doc_Binance_fetchAccountPositions

function __ccxt_doc_Binance_fetchPositionsRisk() end
"""
fetch positions risk
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-Information
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Query-UM-Position-Information
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Query-CM-Position-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V3

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch positions for a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"
- `params.useV2`::bool, optional: set to true if you want to use the obsolete endpoint, where some more additional fields were provided

# Returns
- data on the positions risk
"""
__ccxt_doc_Binance_fetchPositionsRisk

function __ccxt_doc_Binance_fetchFundingHistory() end
"""
fetch the history of funding payments paid and received on this account
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Income-History
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Get-Income-History
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Income-History
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Income-History

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding history entry
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch the funding history for a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Binance_fetchFundingHistory

function __ccxt_doc_Binance_setLeverage() end
"""
set the level of leverage for a market
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Initial-Leverage
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Change-Initial-Leverage
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Change-UM-Initial-Leverage
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Change-CM-Initial-Leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to set the leverage for a trading pair in a portfolio margin account

# Returns
- response from the exchange
"""
__ccxt_doc_Binance_setLeverage

function __ccxt_doc_Binance_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Margin-Type
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Change-Margin-Type

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Binance_setMarginMode

function __ccxt_doc_Binance_setPositionMode() end
"""
set hedged to true or false for a market
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Position-Mode
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Change-Position-Mode
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Current-Position-Mode
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Current-Position-Mode

# Arguments
- `hedged`::bool: set to true to use dualSidePosition
- `symbol`::string: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to set the position mode for a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- response from the exchange
"""
__ccxt_doc_Binance_setPositionMode

function __ccxt_doc_Binance_fetchLeverages() end
"""
fetch the set leverage for all markets
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Account-Detail
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Account-Detail
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Binance_fetchLeverages

function __ccxt_doc_Binance_fetchSettlementHistory() end
"""
fetches historical settlement records
see: https://developers.binance.com/docs/derivatives/option/market-data/Historical-Exercise-Records

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records, default 100, max 100
- `params`::object, optional: exchange specific params

# Returns
- a list of [settlement history objects]{@link https://docs.ccxt.com/?id=settlement-history-structure}
"""
__ccxt_doc_Binance_fetchSettlementHistory

function __ccxt_doc_Binance_fetchMySettlementHistory() end
"""
fetches historical settlement records of the user
see: https://developers.binance.com/docs/derivatives/option/trade/User-Exercise-Record

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records
- `params`::object, optional: exchange specific params

# Returns
- a list of [settlement history objects]
"""
__ccxt_doc_Binance_fetchMySettlementHistory

function __ccxt_doc_Binance_fetchLedgerEntry() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://developers.binance.com/docs/derivatives/option/account/Account-Funding-Flow

# Arguments
- `id`::string: the identification number of the ledger entry
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Binance_fetchLedgerEntry

function __ccxt_doc_Binance_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://developers.binance.com/docs/derivatives/option/account/Account-Funding-Flow
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Income-History
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Get-Income-History
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Income-History
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Income-History

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ledger entry
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch the ledger for a portfolio margin account
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Binance_fetchLedger

function __ccxt_doc_Binance_reduceMargin() end
"""
remove margin from a position
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Binance_reduceMargin

function __ccxt_doc_Binance_addMargin() end
"""
add margin
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Binance_addMargin

function __ccxt_doc_Binance_fetchCrossBorrowRate() end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Margin-Interest-Rate-History

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [borrow rate structure]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
__ccxt_doc_Binance_fetchCrossBorrowRate

function __ccxt_doc_Binance_fetchIsolatedBorrowRate() end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS
- `params.vipLevel`::object, optional: user's current specific margin data will be returned if viplevel is omitted

# Returns
- an [isolated borrow rate structure]{@link https://docs.ccxt.com/?id=isolated-borrow-rate-structure}
"""
__ccxt_doc_Binance_fetchIsolatedBorrowRate

function __ccxt_doc_Binance_fetchIsolatedBorrowRates() end
"""
fetch the borrow interest rates of all currencies
see: https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.symbol`::object, optional: unified market symbol EXCHANGE SPECIFIC PARAMETERS
- `params.vipLevel`::object, optional: user's current specific margin data will be returned if viplevel is omitted

# Returns
- a [borrow rate structure]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
__ccxt_doc_Binance_fetchIsolatedBorrowRates

function __ccxt_doc_Binance_fetchBorrowRateHistory() end
"""
retrieves a history of a currencies borrow interest rate at specific time slots
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Margin-Interest-Rate-History

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: timestamp for the earliest borrow rate
- `limit`::int, optional: the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
__ccxt_doc_Binance_fetchBorrowRateHistory

function __ccxt_doc_Binance_createGiftCode() end
"""
create gift code
see: https://developers.binance.com/docs/gift_card/market-data/Create-a-single-token-gift-card

# Arguments
- `code`::string: gift code
- `amount`::float: amount of currency for the gift
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- The gift code id, code, currency and amount
"""
__ccxt_doc_Binance_createGiftCode

function __ccxt_doc_Binance_redeemGiftCode() end
"""
redeem gift code
see: https://developers.binance.com/docs/gift_card/market-data/Redeem-a-Binance-Gift-Card

# Arguments
- `giftcardCode`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Binance_redeemGiftCode

function __ccxt_doc_Binance_verifyGiftCode() end
"""
verify gift code
see: https://developers.binance.com/docs/gift_card/market-data/Verify-Binance-Gift-Card-by-Gift-Card-Number

# Arguments
- `id`::string: reference number id
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Binance_verifyGiftCode

function __ccxt_doc_Binance_fetchBorrowInterest() end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Get-Interest-History
see: https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-Margin-BorrowLoan-Interest-History

# Arguments
- `code`::string, optional: unified currency code
- `symbol`::string, optional: unified market symbol when fetch interest in isolated markets
- `since`::int, optional: the earliest time in ms to fetch borrrow interest for
- `limit`::int, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch the borrow interest in a portfolio margin account

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
__ccxt_doc_Binance_fetchBorrowInterest

function __ccxt_doc_Binance_repayCrossMargin() end
"""
repay borrowed margin and interest
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Repay
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Repay-Debt

# Arguments
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to repay margin in a portfolio margin account
- `params.repayCrossMarginMethod`::string, optional: *portfolio margin only* 'papiPostRepayLoan' (default), 'papiPostMarginRepayDebt' (alternative)
- `params.specifyRepayAssets`::string, optional: *portfolio margin papiPostMarginRepayDebt only* specific asset list to repay debt

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Binance_repayCrossMargin

function __ccxt_doc_Binance_repayIsolatedMargin() end
"""
repay borrowed margin and interest
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay

# Arguments
- `symbol`::string: unified market symbol, required for isolated margin
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Binance_repayIsolatedMargin

function __ccxt_doc_Binance_borrowCrossMargin() end
"""
create a loan to borrow margin
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Borrow

# Arguments
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true if you would like to borrow margin in a portfolio margin account

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Binance_borrowCrossMargin

function __ccxt_doc_Binance_borrowIsolatedMargin() end
"""
create a loan to borrow margin
see: https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay

# Arguments
- `symbol`::string: unified market symbol, required for isolated margin
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Binance_borrowIsolatedMargin

function __ccxt_doc_Binance_fetchOpenInterestHistory() end
"""
Retrieves the open interest history of a currency
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Open-Interest-Statistics
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Open-Interest-Statistics

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `timeframe`::string: "5m","15m","30m","1h","2h","4h","6h","12h", or "1d"
- `since`::int, optional: the time(ms) of the earliest record to retrieve as a unix timestamp
- `limit`::int, optional: default 30, max 500
- `params`::object, optional: exchange specific parameters
- `params.until`::int, optional: the time(ms) of the latest record to retrieve as a unix timestamp
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Binance_fetchOpenInterestHistory

function __ccxt_doc_Binance_fetchOpenInterest() end
"""
retrieves the open interest of a contract trading pair
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Open-Interest
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Open-Interest
see: https://developers.binance.com/docs/derivatives/option/market-data/Open-Interest

# Arguments
- `symbol`::string: unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Binance_fetchOpenInterest

function __ccxt_doc_Binance_fetchMyLiquidations() end
"""
retrieves the users liquidated positions
see: https://developers.binance.com/docs/margin_trading/trade/Get-Force-Liquidation-Record
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Users-Force-Orders
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Users-Force-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-UM-Force-Orders
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-CM-Force-Orders

# Arguments
- `symbol`::string, optional: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the binance api endpoint
- `params.until`::int, optional: timestamp in ms of the latest liquidation
- `params.paginate`::bool, optional: *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.portfolioMargin`::bool, optional: set to true if you would like to fetch liquidations in a portfolio margin account
- `params.type`::string, optional: "spot"
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
__ccxt_doc_Binance_fetchMyLiquidations

function __ccxt_doc_Binance_fetchGreeks() end
"""
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://developers.binance.com/docs/derivatives/option/market-data/Option-Mark-Price

# Arguments
- `symbol`::string: unified symbol of the market to fetch greeks for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
__ccxt_doc_Binance_fetchGreeks

function __ccxt_doc_Binance_fetchAllGreeks() end
"""
fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://developers.binance.com/docs/derivatives/option/market-data/Option-Mark-Price

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch greeks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
__ccxt_doc_Binance_fetchAllGreeks

function __ccxt_doc_Binance_fetchPositionMode() end
"""
fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Current-Position-Mode
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Get-Current-Position-Mode

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
__ccxt_doc_Binance_fetchPositionMode

function __ccxt_doc_Binance_fetchMarginModes() end
"""
fetches margin modes ("isolated" or "cross") that the market for the symbol in in, with symbol=undefined all markets for a subType (linear/inverse) are returned
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config

# Arguments
- `symbols`::array: unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Binance_fetchMarginModes

function __ccxt_doc_Binance_fetchMarginMode() end
"""
fetches the margin mode of a specific symbol
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information

# Arguments
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Binance_fetchMarginMode

function __ccxt_doc_Binance_fetchOption() end
"""
fetches option data that is commonly found in an option chain
see: https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [option chain structure]{@link https://docs.ccxt.com/?id=option-chain-structure}
"""
__ccxt_doc_Binance_fetchOption

function __ccxt_doc_Binance_fetchMarginAdjustmentHistory() end
"""
fetches the history of margin added or reduced from contract isolated positions
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Get-Position-Margin-Change-History
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Get-Position-Margin-Change-History

# Arguments
- `symbol`::string: unified market symbol
- `type`::string, optional: "add" or "reduce"
- `since`::int, optional: timestamp in ms of the earliest change to fetch
- `limit`::int, optional: the maximum amount of changes to fetch
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest change to fetch

# Returns
- a list of [margin structures]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Binance_fetchMarginAdjustmentHistory

function __ccxt_doc_Binance_fetchConvertCurrencies() end
"""
fetches all available currencies that can be converted
see: https://developers.binance.com/docs/convert/market-data/Query-order-quantity-precision-per-asset

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Binance_fetchConvertCurrencies

function __ccxt_doc_Binance_fetchConvertQuote() end
"""
fetch a quote for converting from one currency to another
see: https://developers.binance.com/docs/convert/trade/Send-quote-request

# Arguments
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.walletType`::string, optional: either 'SPOT' or 'FUNDING', the default is 'SPOT'

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Binance_fetchConvertQuote

function __ccxt_doc_Binance_createConvertTrade() end
"""
convert from one currency to another
see: https://developers.binance.com/docs/convert/trade/Accept-Quote

# Arguments
- `id`::string: the id of the trade that you want to make
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Binance_createConvertTrade

function __ccxt_doc_Binance_fetchConvertTrade() end
"""
fetch the data for a conversion trade
see: https://developers.binance.com/docs/convert/trade/Order-Status

# Arguments
- `id`::string: the id of the trade that you want to fetch
- `code`::string, optional: the unified currency code of the conversion trade
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Binance_fetchConvertTrade

function __ccxt_doc_Binance_fetchConvertTradeHistory() end
"""
fetch the users history of conversion trades
see: https://developers.binance.com/docs/convert/trade/Get-Convert-Trade-History

# Arguments
- `code`::string, optional: the unified currency code
- `since`::int, optional: the earliest time in ms to fetch conversions for
- `limit`::int, optional: the maximum number of conversion structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest conversion to fetch

# Returns
- a list of [conversion structures]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Binance_fetchConvertTradeHistory

function __ccxt_doc_Binance_fetchFundingIntervals() end
"""
fetch the funding rate interval for multiple markets
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-Info
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Get-Funding-Info

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: "linear" or "inverse"

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Binance_fetchFundingIntervals

function __ccxt_doc_Binance_fetchLongShortRatioHistory() end
"""
fetches the long short ratio history for a unified market symbol
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Long-Short-Ratio
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Long-Short-Ratio

# Arguments
- `symbol`::string: unified symbol of the market to fetch the long short ratio for
- `timeframe`::string, optional: the period for the ratio, default is 24 hours
- `since`::int, optional: the earliest time in ms to fetch ratios for
- `limit`::int, optional: the maximum number of long short ratio structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest ratio to fetch

# Returns
- an array of [long short ratio structures]{@link https://docs.ccxt.com/?id=long-short-ratio-structure}
"""
__ccxt_doc_Binance_fetchLongShortRatioHistory

function __ccxt_doc_Binance_fetchADLRank() end
"""
fetches the auto deleveraging rank and risk percentage for a symbol
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/ADL-Risk

# Arguments
- `symbol`::string: unified symbol of the market to fetch the auto deleveraging rank for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [auto de leverage structure]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
__ccxt_doc_Binance_fetchADLRank

function __ccxt_doc_Binance_fetchPositionsADLRank() end
"""
fetches the auto deleveraging rank and risk percentage for a list of symbols that have open positions
see: https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-ADL-Quantile-Estimation
see: https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-ADL-Quantile-Estimation
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/UM-Position-ADL-Quantile-Estimation
see: https://developers.binance.com/docs/derivatives/portfolio-margin/trade/CM-Position-ADL-Quantile-Estimation

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.portfolioMargin`::bool, optional: set to true for the portfolio margin account

# Returns
- an array of [auto de leverage structure]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
__ccxt_doc_Binance_fetchPositionsADLRank
