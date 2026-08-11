@kwdef mutable struct Okx <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    handleMarketTypeAndParams::Function = handleMarketTypeAndParams
    convertToInstrumentType::Function = convertToInstrumentType
    createExpiredOptionMarket::Function = createExpiredOptionMarket
    safeMarket::Function = safeMarket
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchAccounts::Function = fetchAccounts
    nonce::Function = nonce
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchMarketsByType::Function = fetchMarketsByType
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchOrderBook::Function = fetchOrderBook
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchMarkPrice::Function = fetchMarkPrice
    fetchMarkPrices::Function = fetchMarkPrices
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseBalanceByType::Function = parseBalanceByType
    parseTradingBalance::Function = parseTradingBalance
    parseFundingBalance::Function = parseFundingBalance
    parseTradingFee::Function = parseTradingFee
    fetchTradingFee::Function = fetchTradingFee
    fetchBalance::Function = fetchBalance
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createMarketSellOrderWithCost::Function = createMarketSellOrderWithCost
    createOrderRequest::Function = createOrderRequest
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    editOrderRequest::Function = editOrderRequest
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    parseIds::Function = parseIds
    cancelOrders::Function = cancelOrders
    cancelOrdersForSymbols::Function = cancelOrdersForSymbols
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchMyTrades::Function = fetchMyTrades
    fetchOrderTrades::Function = fetchOrderTrades
    fetchLedger::Function = fetchLedger
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    parseDepositAddress::Function = parseDepositAddress
    fetchDepositAddressesByNetwork::Function = fetchDepositAddressesByNetwork
    fetchDepositAddress::Function = fetchDepositAddress
    withdraw::Function = withdraw
    fetchDeposits::Function = fetchDeposits
    fetchDeposit::Function = fetchDeposit
    fetchWithdrawals::Function = fetchWithdrawals
    fetchWithdrawal::Function = fetchWithdrawal
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    fetchPositionsForSymbol::Function = fetchPositionsForSymbol
    parsePosition::Function = parsePosition
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    fetchTransfer::Function = fetchTransfer
    fetchTransfers::Function = fetchTransfers
    sign::Function = sign
    parseFundingRate::Function = parseFundingRate
    parseFundingInterval::Function = parseFundingInterval
    fetchFundingInterval::Function = fetchFundingInterval
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    fetchFundingHistory::Function = fetchFundingHistory
    setLeverage::Function = setLeverage
    fetchPositionMode::Function = fetchPositionMode
    setPositionMode::Function = setPositionMode
    setMarginMode::Function = setMarginMode
    fetchCrossBorrowRates::Function = fetchCrossBorrowRates
    fetchCrossBorrowRate::Function = fetchCrossBorrowRate
    parseBorrowRate::Function = parseBorrowRate
    parseBorrowRateHistories::Function = parseBorrowRateHistories
    fetchBorrowRateHistories::Function = fetchBorrowRateHistories
    fetchBorrowRateHistory::Function = fetchBorrowRateHistory
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    reduceMargin::Function = reduceMargin
    addMargin::Function = addMargin
    fetchMarketLeverageTiers::Function = fetchMarketLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    borrowCrossMargin::Function = borrowCrossMargin
    repayCrossMargin::Function = repayCrossMargin
    parseMarginLoan::Function = parseMarginLoan
    fetchOpenInterest::Function = fetchOpenInterest
    fetchOpenInterests::Function = fetchOpenInterests
    fetchOpenInterestHistory::Function = fetchOpenInterestHistory
    parseOpenInterest::Function = parseOpenInterest
    setSandboxMode::Function = setSandboxMode
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFees::Function = parseDepositWithdrawFees
    fetchSettlementHistory::Function = fetchSettlementHistory
    parseSettlement::Function = parseSettlement
    parseSettlements::Function = parseSettlements
    fetchUnderlyingAssets::Function = fetchUnderlyingAssets
    fetchGreeks::Function = fetchGreeks
    fetchAllGreeks::Function = fetchAllGreeks
    parseGreeks::Function = parseGreeks
    closePosition::Function = closePosition
    fetchOption::Function = fetchOption
    fetchOptionChain::Function = fetchOptionChain
    parseOption::Function = parseOption
    fetchConvertQuote::Function = fetchConvertQuote
    createConvertTrade::Function = createConvertTrade
    fetchConvertTrade::Function = fetchConvertTrade
    fetchConvertTradeHistory::Function = fetchConvertTradeHistory
    parseConversion::Function = parseConversion
    fetchConvertCurrencies::Function = fetchConvertCurrencies
    handleErrors::Function = handleErrors
    fetchMarginAdjustmentHistory::Function = fetchMarginAdjustmentHistory
    fetchPositionsHistory::Function = fetchPositionsHistory
    fetchLongShortRatioHistory::Function = fetchLongShortRatioHistory
    parseLongShortRatio::Function = parseLongShortRatio

# Generated REST endpoint fields
    publicGetMarketTickers::Function = publicGetMarketTickers
    publicGetMarketTicker::Function = publicGetMarketTicker
    publicGetMarketBooks::Function = publicGetMarketBooks
    publicGetMarketBooksFull::Function = publicGetMarketBooksFull
    publicGetMarketCandles::Function = publicGetMarketCandles
    publicGetMarketHistoryCandles::Function = publicGetMarketHistoryCandles
    publicGetMarketTrades::Function = publicGetMarketTrades
    publicGetMarketHistoryTrades::Function = publicGetMarketHistoryTrades
    publicGetMarketOptionInstrumentFamilyTrades::Function = publicGetMarketOptionInstrumentFamilyTrades
    publicGetMarketPlatform24Volume::Function = publicGetMarketPlatform24Volume
    publicGetMarketCallAuctionDetail::Function = publicGetMarketCallAuctionDetail
    publicGetMarketCallAuctionDetails::Function = publicGetMarketCallAuctionDetails
    publicGetMarketBooksSbe::Function = publicGetMarketBooksSbe
    publicGetMarketBlockTickers::Function = publicGetMarketBlockTickers
    publicGetMarketBlockTicker::Function = publicGetMarketBlockTicker
    publicGetMarketSprdTicker::Function = publicGetMarketSprdTicker
    publicGetMarketSprdCandles::Function = publicGetMarketSprdCandles
    publicGetMarketSprdHistoryCandles::Function = publicGetMarketSprdHistoryCandles
    publicGetMarketIndexTickers::Function = publicGetMarketIndexTickers
    publicGetMarketIndexCandles::Function = publicGetMarketIndexCandles
    publicGetMarketHistoryIndexCandles::Function = publicGetMarketHistoryIndexCandles
    publicGetMarketMarkPriceCandles::Function = publicGetMarketMarkPriceCandles
    publicGetMarketHistoryMarkPriceCandles::Function = publicGetMarketHistoryMarkPriceCandles
    publicGetMarketExchangeRate::Function = publicGetMarketExchangeRate
    publicGetMarketIndexComponents::Function = publicGetMarketIndexComponents
    publicGetMarketOpenOracle::Function = publicGetMarketOpenOracle
    publicGetMarketBooksLite::Function = publicGetMarketBooksLite
    publicGetPublicOptionTrades::Function = publicGetPublicOptionTrades
    publicGetPublicBlockTrades::Function = publicGetPublicBlockTrades
    publicGetPublicInstruments::Function = publicGetPublicInstruments
    publicGetPublicEstimatedPrice::Function = publicGetPublicEstimatedPrice
    publicGetPublicDeliveryExerciseHistory::Function = publicGetPublicDeliveryExerciseHistory
    publicGetPublicEstimatedSettlementInfo::Function = publicGetPublicEstimatedSettlementInfo
    publicGetPublicSettlementHistory::Function = publicGetPublicSettlementHistory
    publicGetPublicFundingRate::Function = publicGetPublicFundingRate
    publicGetPublicFundingRateHistory::Function = publicGetPublicFundingRateHistory
    publicGetPublicOpenInterest::Function = publicGetPublicOpenInterest
    publicGetPublicPriceLimit::Function = publicGetPublicPriceLimit
    publicGetPublicOptSummary::Function = publicGetPublicOptSummary
    publicGetPublicDiscountRateInterestFreeQuota::Function = publicGetPublicDiscountRateInterestFreeQuota
    publicGetPublicTime::Function = publicGetPublicTime
    publicGetPublicMarkPrice::Function = publicGetPublicMarkPrice
    publicGetPublicPositionTiers::Function = publicGetPublicPositionTiers
    publicGetPublicInterestRateLoanQuota::Function = publicGetPublicInterestRateLoanQuota
    publicGetPublicUnderlying::Function = publicGetPublicUnderlying
    publicGetPublicInsuranceFund::Function = publicGetPublicInsuranceFund
    publicGetPublicConvertContractCoin::Function = publicGetPublicConvertContractCoin
    publicGetPublicInstrumentTickBands::Function = publicGetPublicInstrumentTickBands
    publicGetPublicPremiumHistory::Function = publicGetPublicPremiumHistory
    publicGetPublicEconomicCalendar::Function = publicGetPublicEconomicCalendar
    publicGetPublicMarketDataHistory::Function = publicGetPublicMarketDataHistory
    publicGetPublicEventContractEvents::Function = publicGetPublicEventContractEvents
    publicGetPublicEventContractMarkets::Function = publicGetPublicEventContractMarkets
    publicGetPublicEventContractSeries::Function = publicGetPublicEventContractSeries
    publicGetPublicVipInterestRateLoanQuota::Function = publicGetPublicVipInterestRateLoanQuota
    publicGetRubikStatTradingDataSupportCoin::Function = publicGetRubikStatTradingDataSupportCoin
    publicGetRubikStatContractsOpenInterestHistory::Function = publicGetRubikStatContractsOpenInterestHistory
    publicGetRubikStatTakerVolume::Function = publicGetRubikStatTakerVolume
    publicGetRubikStatTakerVolumeContract::Function = publicGetRubikStatTakerVolumeContract
    publicGetRubikStatMarginLoanRatio::Function = publicGetRubikStatMarginLoanRatio
    publicGetRubikStatContractsLongShortAccountRatioContractTopTrader::Function = publicGetRubikStatContractsLongShortAccountRatioContractTopTrader
    publicGetRubikStatContractsLongShortPositionRatioContractTopTrader::Function = publicGetRubikStatContractsLongShortPositionRatioContractTopTrader
    publicGetRubikStatContractsLongShortAccountRatioContract::Function = publicGetRubikStatContractsLongShortAccountRatioContract
    publicGetRubikStatContractsLongShortAccountRatio::Function = publicGetRubikStatContractsLongShortAccountRatio
    publicGetRubikStatContractsOpenInterestVolume::Function = publicGetRubikStatContractsOpenInterestVolume
    publicGetRubikStatOptionOpenInterestVolume::Function = publicGetRubikStatOptionOpenInterestVolume
    publicGetRubikStatOptionOpenInterestVolumeRatio::Function = publicGetRubikStatOptionOpenInterestVolumeRatio
    publicGetRubikStatOptionOpenInterestVolumeExpiry::Function = publicGetRubikStatOptionOpenInterestVolumeExpiry
    publicGetRubikStatOptionOpenInterestVolumeStrike::Function = publicGetRubikStatOptionOpenInterestVolumeStrike
    publicGetRubikStatOptionTakerBlockVolume::Function = publicGetRubikStatOptionTakerBlockVolume
    publicGetSystemStatus::Function = publicGetSystemStatus
    publicGetSprdSpreads::Function = publicGetSprdSpreads
    publicGetSprdBooks::Function = publicGetSprdBooks
    publicGetSprdPublicTrades::Function = publicGetSprdPublicTrades
    publicGetSprdTicker::Function = publicGetSprdTicker
    publicGetTradingBotGridAiParam::Function = publicGetTradingBotGridAiParam
    publicGetTradingBotGridMinInvestment::Function = publicGetTradingBotGridMinInvestment
    publicGetTradingBotPublicRsiBackTesting::Function = publicGetTradingBotPublicRsiBackTesting
    publicGetTradingBotGridGridQuantity::Function = publicGetTradingBotGridGridQuantity
    publicGetAssetExchangeList::Function = publicGetAssetExchangeList
    publicGetFinanceStakingDefiEthApyHistory::Function = publicGetFinanceStakingDefiEthApyHistory
    publicGetFinanceStakingDefiSolApyHistory::Function = publicGetFinanceStakingDefiSolApyHistory
    publicGetFinanceSavingsLendingRateSummary::Function = publicGetFinanceSavingsLendingRateSummary
    publicGetFinanceSavingsLendingRateHistory::Function = publicGetFinanceSavingsLendingRateHistory
    publicGetFinanceFixedLoanLendingOffers::Function = publicGetFinanceFixedLoanLendingOffers
    publicGetFinanceFixedLoanLendingApyHistory::Function = publicGetFinanceFixedLoanLendingApyHistory
    publicGetFinanceFixedLoanPendingLendingVolume::Function = publicGetFinanceFixedLoanPendingLendingVolume
    publicGetFinanceSfpDcdProducts::Function = publicGetFinanceSfpDcdProducts
    publicGetCopytradingPublicConfig::Function = publicGetCopytradingPublicConfig
    publicGetCopytradingPublicLeadTraders::Function = publicGetCopytradingPublicLeadTraders
    publicGetCopytradingPublicWeeklyPnl::Function = publicGetCopytradingPublicWeeklyPnl
    publicGetCopytradingPublicPnl::Function = publicGetCopytradingPublicPnl
    publicGetCopytradingPublicStats::Function = publicGetCopytradingPublicStats
    publicGetCopytradingPublicPreferenceCurrency::Function = publicGetCopytradingPublicPreferenceCurrency
    publicGetCopytradingPublicCurrentSubpositions::Function = publicGetCopytradingPublicCurrentSubpositions
    publicGetCopytradingPublicSubpositionsHistory::Function = publicGetCopytradingPublicSubpositionsHistory
    publicGetCopytradingPublicCopyTraders::Function = publicGetCopytradingPublicCopyTraders
    publicGetSupportAnnouncements::Function = publicGetSupportAnnouncements
    publicGetSupportAnnouncementsTypes::Function = publicGetSupportAnnouncementsTypes
    publicGetSupportAnnouncementTypes::Function = publicGetSupportAnnouncementTypes
    publicPostTradingBotGridMinInvestment::Function = publicPostTradingBotGridMinInvestment
    privateGetRfqCounterparties::Function = privateGetRfqCounterparties
    privateGetRfqMakerInstrumentSettings::Function = privateGetRfqMakerInstrumentSettings
    privateGetRfqMmpConfig::Function = privateGetRfqMmpConfig
    privateGetRfqRfqs::Function = privateGetRfqRfqs
    privateGetRfqQuotes::Function = privateGetRfqQuotes
    privateGetRfqTrades::Function = privateGetRfqTrades
    privateGetRfqPublicTrades::Function = privateGetRfqPublicTrades
    privateGetSprdOrder::Function = privateGetSprdOrder
    privateGetSprdOrdersPending::Function = privateGetSprdOrdersPending
    privateGetSprdOrdersHistory::Function = privateGetSprdOrdersHistory
    privateGetSprdOrdersHistoryArchive::Function = privateGetSprdOrdersHistoryArchive
    privateGetSprdTrades::Function = privateGetSprdTrades
    privateGetTradeOrder::Function = privateGetTradeOrder
    privateGetTradeOrdersPending::Function = privateGetTradeOrdersPending
    privateGetTradeOrdersHistory::Function = privateGetTradeOrdersHistory
    privateGetTradeOrdersHistoryArchive::Function = privateGetTradeOrdersHistoryArchive
    privateGetTradeFills::Function = privateGetTradeFills
    privateGetTradeFillsHistory::Function = privateGetTradeFillsHistory
    privateGetTradeFillsArchive::Function = privateGetTradeFillsArchive
    privateGetTradeOrderAlgo::Function = privateGetTradeOrderAlgo
    privateGetTradeOrdersAlgoPending::Function = privateGetTradeOrdersAlgoPending
    privateGetTradeOrdersAlgoHistory::Function = privateGetTradeOrdersAlgoHistory
    privateGetTradeEasyConvertCurrencyList::Function = privateGetTradeEasyConvertCurrencyList
    privateGetTradeEasyConvertHistory::Function = privateGetTradeEasyConvertHistory
    privateGetTradeOneClickRepayCurrencyList::Function = privateGetTradeOneClickRepayCurrencyList
    privateGetTradeOneClickRepayCurrencyListV2::Function = privateGetTradeOneClickRepayCurrencyListV2
    privateGetTradeOneClickRepayHistory::Function = privateGetTradeOneClickRepayHistory
    privateGetTradeOneClickRepayHistoryV2::Function = privateGetTradeOneClickRepayHistoryV2
    privateGetTradeAccountRateLimit::Function = privateGetTradeAccountRateLimit
    privateGetAssetCurrencies::Function = privateGetAssetCurrencies
    privateGetAssetBalances::Function = privateGetAssetBalances
    privateGetAssetNonTradableAssets::Function = privateGetAssetNonTradableAssets
    privateGetAssetAssetValuation::Function = privateGetAssetAssetValuation
    privateGetAssetTransferState::Function = privateGetAssetTransferState
    privateGetAssetBills::Function = privateGetAssetBills
    privateGetAssetBillsHistory::Function = privateGetAssetBillsHistory
    privateGetAssetDepositLightning::Function = privateGetAssetDepositLightning
    privateGetAssetDepositAddress::Function = privateGetAssetDepositAddress
    privateGetAssetDepositHistory::Function = privateGetAssetDepositHistory
    privateGetAssetWithdrawalHistory::Function = privateGetAssetWithdrawalHistory
    privateGetAssetDepositWithdrawStatus::Function = privateGetAssetDepositWithdrawStatus
    privateGetAssetMonthlyStatement::Function = privateGetAssetMonthlyStatement
    privateGetAssetConvertCurrencies::Function = privateGetAssetConvertCurrencies
    privateGetAssetConvertCurrencyPair::Function = privateGetAssetConvertCurrencyPair
    privateGetAssetConvertHistory::Function = privateGetAssetConvertHistory
    privateGetAccountInstruments::Function = privateGetAccountInstruments
    privateGetAccountBalance::Function = privateGetAccountBalance
    privateGetAccountPositions::Function = privateGetAccountPositions
    privateGetAccountPositionsHistory::Function = privateGetAccountPositionsHistory
    privateGetAccountAccountPositionRisk::Function = privateGetAccountAccountPositionRisk
    privateGetAccountBills::Function = privateGetAccountBills
    privateGetAccountBillsArchive::Function = privateGetAccountBillsArchive
    privateGetAccountBillsHistoryArchive::Function = privateGetAccountBillsHistoryArchive
    privateGetAccountConfig::Function = privateGetAccountConfig
    privateGetAccountSubtypes::Function = privateGetAccountSubtypes
    privateGetAccountMaxSize::Function = privateGetAccountMaxSize
    privateGetAccountMaxAvailSize::Function = privateGetAccountMaxAvailSize
    privateGetAccountLeverageInfo::Function = privateGetAccountLeverageInfo
    privateGetAccountAdjustLeverageInfo::Function = privateGetAccountAdjustLeverageInfo
    privateGetAccountMaxLoan::Function = privateGetAccountMaxLoan
    privateGetAccountTradeFee::Function = privateGetAccountTradeFee
    privateGetAccountInterestAccrued::Function = privateGetAccountInterestAccrued
    privateGetAccountInterestRate::Function = privateGetAccountInterestRate
    privateGetAccountMaxWithdrawal::Function = privateGetAccountMaxWithdrawal
    privateGetAccountRiskState::Function = privateGetAccountRiskState
    privateGetAccountInterestLimits::Function = privateGetAccountInterestLimits
    privateGetAccountSpotBorrowRepayHistory::Function = privateGetAccountSpotBorrowRepayHistory
    privateGetAccountGreeks::Function = privateGetAccountGreeks
    privateGetAccountPositionTiers::Function = privateGetAccountPositionTiers
    privateGetAccountSetAccountSwitchPrecheck::Function = privateGetAccountSetAccountSwitchPrecheck
    privateGetAccountCollateralAssets::Function = privateGetAccountCollateralAssets
    privateGetAccountMmpConfig::Function = privateGetAccountMmpConfig
    privateGetAccountMovePositionsHistory::Function = privateGetAccountMovePositionsHistory
    privateGetAccountPrecheckSetDeltaNeutral::Function = privateGetAccountPrecheckSetDeltaNeutral
    privateGetAccountQuickMarginBorrowRepayHistory::Function = privateGetAccountQuickMarginBorrowRepayHistory
    privateGetAccountBorrowRepayHistory::Function = privateGetAccountBorrowRepayHistory
    privateGetAccountVipInterestAccrued::Function = privateGetAccountVipInterestAccrued
    privateGetAccountVipInterestDeducted::Function = privateGetAccountVipInterestDeducted
    privateGetAccountVipLoanOrderList::Function = privateGetAccountVipLoanOrderList
    privateGetAccountVipLoanOrderDetail::Function = privateGetAccountVipLoanOrderDetail
    privateGetAccountFixedLoanBorrowingLimit::Function = privateGetAccountFixedLoanBorrowingLimit
    privateGetAccountFixedLoanBorrowingQuote::Function = privateGetAccountFixedLoanBorrowingQuote
    privateGetAccountFixedLoanBorrowingOrdersList::Function = privateGetAccountFixedLoanBorrowingOrdersList
    privateGetAccountSpotManualBorrowRepay::Function = privateGetAccountSpotManualBorrowRepay
    privateGetAccountSetAutoRepay::Function = privateGetAccountSetAutoRepay
    privateGetUsersSubaccountList::Function = privateGetUsersSubaccountList
    privateGetAccountSubaccountBalances::Function = privateGetAccountSubaccountBalances
    privateGetAssetSubaccountBalances::Function = privateGetAssetSubaccountBalances
    privateGetAccountSubaccountMaxWithdrawal::Function = privateGetAccountSubaccountMaxWithdrawal
    privateGetAssetSubaccountBills::Function = privateGetAssetSubaccountBills
    privateGetAssetSubaccountManagedSubaccountBills::Function = privateGetAssetSubaccountManagedSubaccountBills
    privateGetUsersEntrustSubaccountList::Function = privateGetUsersEntrustSubaccountList
    privateGetAccountSubaccountInterestLimits::Function = privateGetAccountSubaccountInterestLimits
    privateGetUsersSubaccountApikey::Function = privateGetUsersSubaccountApikey
    privateGetTradingBotGridOrdersAlgoPending::Function = privateGetTradingBotGridOrdersAlgoPending
    privateGetTradingBotGridOrdersAlgoHistory::Function = privateGetTradingBotGridOrdersAlgoHistory
    privateGetTradingBotGridOrdersAlgoDetails::Function = privateGetTradingBotGridOrdersAlgoDetails
    privateGetTradingBotGridSubOrders::Function = privateGetTradingBotGridSubOrders
    privateGetTradingBotGridPositions::Function = privateGetTradingBotGridPositions
    privateGetTradingBotGridAiParam::Function = privateGetTradingBotGridAiParam
    privateGetTradingBotSignalSignals::Function = privateGetTradingBotSignalSignals
    privateGetTradingBotSignalOrdersAlgoDetails::Function = privateGetTradingBotSignalOrdersAlgoDetails
    privateGetTradingBotSignalOrdersAlgoPending::Function = privateGetTradingBotSignalOrdersAlgoPending
    privateGetTradingBotSignalOrdersAlgoHistory::Function = privateGetTradingBotSignalOrdersAlgoHistory
    privateGetTradingBotSignalPositions::Function = privateGetTradingBotSignalPositions
    privateGetTradingBotSignalPositionsHistory::Function = privateGetTradingBotSignalPositionsHistory
    privateGetTradingBotSignalSubOrders::Function = privateGetTradingBotSignalSubOrders
    privateGetTradingBotSignalEventHistory::Function = privateGetTradingBotSignalEventHistory
    privateGetTradingBotRecurringOrdersAlgoPending::Function = privateGetTradingBotRecurringOrdersAlgoPending
    privateGetTradingBotRecurringOrdersAlgoHistory::Function = privateGetTradingBotRecurringOrdersAlgoHistory
    privateGetTradingBotRecurringOrdersAlgoDetails::Function = privateGetTradingBotRecurringOrdersAlgoDetails
    privateGetTradingBotRecurringSubOrders::Function = privateGetTradingBotRecurringSubOrders
    privateGetTradingBotDcaOngoingList::Function = privateGetTradingBotDcaOngoingList
    privateGetTradingBotDcaHistoryList::Function = privateGetTradingBotDcaHistoryList
    privateGetTradingBotDcaOrders::Function = privateGetTradingBotDcaOrders
    privateGetTradingBotDcaPositionDetails::Function = privateGetTradingBotDcaPositionDetails
    privateGetTradingBotDcaCycleList::Function = privateGetTradingBotDcaCycleList
    privateGetFinanceSavingsBalance::Function = privateGetFinanceSavingsBalance
    privateGetFinanceSavingsLendingHistory::Function = privateGetFinanceSavingsLendingHistory
    privateGetFinanceStakingDefiOffers::Function = privateGetFinanceStakingDefiOffers
    privateGetFinanceStakingDefiOrdersActive::Function = privateGetFinanceStakingDefiOrdersActive
    privateGetFinanceStakingDefiOrdersHistory::Function = privateGetFinanceStakingDefiOrdersHistory
    privateGetFinanceStakingDefiEthProductInfo::Function = privateGetFinanceStakingDefiEthProductInfo
    privateGetFinanceStakingDefiEthBalance::Function = privateGetFinanceStakingDefiEthBalance
    privateGetFinanceStakingDefiEthPurchaseRedeemHistory::Function = privateGetFinanceStakingDefiEthPurchaseRedeemHistory
    privateGetFinanceStakingDefiSolProductInfo::Function = privateGetFinanceStakingDefiSolProductInfo
    privateGetFinanceStakingDefiSolBalance::Function = privateGetFinanceStakingDefiSolBalance
    privateGetFinanceStakingDefiSolPurchaseRedeemHistory::Function = privateGetFinanceStakingDefiSolPurchaseRedeemHistory
    privateGetFinanceFlexibleLoanBorrowCurrencies::Function = privateGetFinanceFlexibleLoanBorrowCurrencies
    privateGetFinanceFlexibleLoanCollateralAssets::Function = privateGetFinanceFlexibleLoanCollateralAssets
    privateGetFinanceFlexibleLoanMaxCollateralRedeemAmount::Function = privateGetFinanceFlexibleLoanMaxCollateralRedeemAmount
    privateGetFinanceFlexibleLoanLoanInfo::Function = privateGetFinanceFlexibleLoanLoanInfo
    privateGetFinanceFlexibleLoanLoanHistory::Function = privateGetFinanceFlexibleLoanLoanHistory
    privateGetFinanceFlexibleLoanInterestAccrued::Function = privateGetFinanceFlexibleLoanInterestAccrued
    privateGetCopytradingCurrentSubpositions::Function = privateGetCopytradingCurrentSubpositions
    privateGetCopytradingSubpositionsHistory::Function = privateGetCopytradingSubpositionsHistory
    privateGetCopytradingInstruments::Function = privateGetCopytradingInstruments
    privateGetCopytradingProfitSharingDetails::Function = privateGetCopytradingProfitSharingDetails
    privateGetCopytradingTotalProfitSharing::Function = privateGetCopytradingTotalProfitSharing
    privateGetCopytradingUnrealizedProfitSharingDetails::Function = privateGetCopytradingUnrealizedProfitSharingDetails
    privateGetCopytradingTotalUnrealizedProfitSharing::Function = privateGetCopytradingTotalUnrealizedProfitSharing
    privateGetCopytradingConfig::Function = privateGetCopytradingConfig
    privateGetCopytradingCopySettings::Function = privateGetCopytradingCopySettings
    privateGetCopytradingCurrentLeadTraders::Function = privateGetCopytradingCurrentLeadTraders
    privateGetCopytradingBatchLeverageInfo::Function = privateGetCopytradingBatchLeverageInfo
    privateGetCopytradingLeadTradersHistory::Function = privateGetCopytradingLeadTradersHistory
    privateGetBrokerDmaSubaccountInfo::Function = privateGetBrokerDmaSubaccountInfo
    privateGetBrokerDmaSubaccountTradeFee::Function = privateGetBrokerDmaSubaccountTradeFee
    privateGetBrokerDmaSubaccountApikey::Function = privateGetBrokerDmaSubaccountApikey
    privateGetBrokerDmaRebatePerOrders::Function = privateGetBrokerDmaRebatePerOrders
    privateGetBrokerFdRebatePerOrders::Function = privateGetBrokerFdRebatePerOrders
    privateGetBrokerFdIfRebate::Function = privateGetBrokerFdIfRebate
    privateGetBrokerNdInfo::Function = privateGetBrokerNdInfo
    privateGetBrokerNdSubaccountInfo::Function = privateGetBrokerNdSubaccountInfo
    privateGetBrokerNdSubaccountApikey::Function = privateGetBrokerNdSubaccountApikey
    privateGetAssetBrokerNdSubaccountDepositAddress::Function = privateGetAssetBrokerNdSubaccountDepositAddress
    privateGetAssetBrokerNdSubaccountDepositHistory::Function = privateGetAssetBrokerNdSubaccountDepositHistory
    privateGetAssetBrokerNdSubaccountWithdrawalHistory::Function = privateGetAssetBrokerNdSubaccountWithdrawalHistory
    privateGetBrokerNdRebateDaily::Function = privateGetBrokerNdRebateDaily
    privateGetBrokerNdRebatePerOrders::Function = privateGetBrokerNdRebatePerOrders
    privateGetFinanceSfpDcdOrder::Function = privateGetFinanceSfpDcdOrder
    privateGetFinanceSfpDcdOrders::Function = privateGetFinanceSfpDcdOrders
    privateGetFinanceSfpDcdCurrencyPair::Function = privateGetFinanceSfpDcdCurrencyPair
    privateGetFinanceSfpDcdOrderStatus::Function = privateGetFinanceSfpDcdOrderStatus
    privateGetFinanceSfpDcdOrderHistory::Function = privateGetFinanceSfpDcdOrderHistory
    privateGetAffiliateInviteeDetail::Function = privateGetAffiliateInviteeDetail
    privateGetUsersPartnerIfRebate::Function = privateGetUsersPartnerIfRebate
    privateGetSupportAnnouncements::Function = privateGetSupportAnnouncements
    privatePostRfqCreateRfq::Function = privatePostRfqCreateRfq
    privatePostRfqCancelRfq::Function = privatePostRfqCancelRfq
    privatePostRfqCancelBatchRfqs::Function = privatePostRfqCancelBatchRfqs
    privatePostRfqCancelAllRfqs::Function = privatePostRfqCancelAllRfqs
    privatePostRfqExecuteQuote::Function = privatePostRfqExecuteQuote
    privatePostRfqMakerInstrumentSettings::Function = privatePostRfqMakerInstrumentSettings
    privatePostRfqMmpReset::Function = privatePostRfqMmpReset
    privatePostRfqMmpConfig::Function = privatePostRfqMmpConfig
    privatePostRfqCreateQuote::Function = privatePostRfqCreateQuote
    privatePostRfqCancelQuote::Function = privatePostRfqCancelQuote
    privatePostRfqCancelBatchQuotes::Function = privatePostRfqCancelBatchQuotes
    privatePostRfqCancelAllQuotes::Function = privatePostRfqCancelAllQuotes
    privatePostRfqCancelAllAfter::Function = privatePostRfqCancelAllAfter
    privatePostSprdOrder::Function = privatePostSprdOrder
    privatePostSprdCancelOrder::Function = privatePostSprdCancelOrder
    privatePostSprdMassCancel::Function = privatePostSprdMassCancel
    privatePostSprdAmendOrder::Function = privatePostSprdAmendOrder
    privatePostSprdCancelAllAfter::Function = privatePostSprdCancelAllAfter
    privatePostTradeOrder::Function = privatePostTradeOrder
    privatePostTradeBatchOrders::Function = privatePostTradeBatchOrders
    privatePostTradeCancelOrder::Function = privatePostTradeCancelOrder
    privatePostTradeCancelBatchOrders::Function = privatePostTradeCancelBatchOrders
    privatePostTradeAmendOrder::Function = privatePostTradeAmendOrder
    privatePostTradeAmendBatchOrders::Function = privatePostTradeAmendBatchOrders
    privatePostTradeClosePosition::Function = privatePostTradeClosePosition
    privatePostTradeFillsArchive::Function = privatePostTradeFillsArchive
    privatePostTradeCancelAdvanceAlgos::Function = privatePostTradeCancelAdvanceAlgos
    privatePostTradeEasyConvert::Function = privatePostTradeEasyConvert
    privatePostTradeOneClickRepay::Function = privatePostTradeOneClickRepay
    privatePostTradeOneClickRepayV2::Function = privatePostTradeOneClickRepayV2
    privatePostTradeMassCancel::Function = privatePostTradeMassCancel
    privatePostTradeCancelAllAfter::Function = privatePostTradeCancelAllAfter
    privatePostTradeOrderPrecheck::Function = privatePostTradeOrderPrecheck
    privatePostTradeOrderAlgo::Function = privatePostTradeOrderAlgo
    privatePostTradeCancelAlgos::Function = privatePostTradeCancelAlgos
    privatePostTradeAmendAlgos::Function = privatePostTradeAmendAlgos
    privatePostAssetTransfer::Function = privatePostAssetTransfer
    privatePostAssetWithdrawal::Function = privatePostAssetWithdrawal
    privatePostAssetWithdrawalLightning::Function = privatePostAssetWithdrawalLightning
    privatePostAssetCancelWithdrawal::Function = privatePostAssetCancelWithdrawal
    privatePostAssetConvertDustAssets::Function = privatePostAssetConvertDustAssets
    privatePostAssetMonthlyStatement::Function = privatePostAssetMonthlyStatement
    privatePostAssetConvertEstimateQuote::Function = privatePostAssetConvertEstimateQuote
    privatePostAssetConvertTrade::Function = privatePostAssetConvertTrade
    privatePostAccountBillsHistoryArchive::Function = privatePostAccountBillsHistoryArchive
    privatePostAccountSetPositionMode::Function = privatePostAccountSetPositionMode
    privatePostAccountSetLeverage::Function = privatePostAccountSetLeverage
    privatePostAccountPositionMarginBalance::Function = privatePostAccountPositionMarginBalance
    privatePostAccountSetFeeType::Function = privatePostAccountSetFeeType
    privatePostAccountSetGreeks::Function = privatePostAccountSetGreeks
    privatePostAccountSetIsolatedMode::Function = privatePostAccountSetIsolatedMode
    privatePostAccountSpotManualBorrowRepay::Function = privatePostAccountSpotManualBorrowRepay
    privatePostAccountSetAutoRepay::Function = privatePostAccountSetAutoRepay
    privatePostAccountQuickMarginBorrowRepay::Function = privatePostAccountQuickMarginBorrowRepay
    privatePostAccountBorrowRepay::Function = privatePostAccountBorrowRepay
    privatePostAccountSimulatedMargin::Function = privatePostAccountSimulatedMargin
    privatePostAccountPositionBuilder::Function = privatePostAccountPositionBuilder
    privatePostAccountPositionBuilderGraph::Function = privatePostAccountPositionBuilderGraph
    privatePostAccountSetRiskOffsetType::Function = privatePostAccountSetRiskOffsetType
    privatePostAccountSetRiskOffsetAmt::Function = privatePostAccountSetRiskOffsetAmt
    privatePostAccountActivateOption::Function = privatePostAccountActivateOption
    privatePostAccountSetAutoLoan::Function = privatePostAccountSetAutoLoan
    privatePostAccountAccountLevelSwitchPreset::Function = privatePostAccountAccountLevelSwitchPreset
    privatePostAccountSetAccountLevel::Function = privatePostAccountSetAccountLevel
    privatePostAccountSetCollateralAssets::Function = privatePostAccountSetCollateralAssets
    privatePostAccountMmpReset::Function = privatePostAccountMmpReset
    privatePostAccountMmpConfig::Function = privatePostAccountMmpConfig
    privatePostAccountFixedLoanBorrowingOrder::Function = privatePostAccountFixedLoanBorrowingOrder
    privatePostAccountFixedLoanAmendBorrowingOrder::Function = privatePostAccountFixedLoanAmendBorrowingOrder
    privatePostAccountFixedLoanManualReborrow::Function = privatePostAccountFixedLoanManualReborrow
    privatePostAccountFixedLoanRepayBorrowingOrder::Function = privatePostAccountFixedLoanRepayBorrowingOrder
    privatePostAccountMovePositions::Function = privatePostAccountMovePositions
    privatePostAccountSetAutoEarn::Function = privatePostAccountSetAutoEarn
    privatePostAccountSetSettleCurrency::Function = privatePostAccountSetSettleCurrency
    privatePostAccountSetTradingConfig::Function = privatePostAccountSetTradingConfig
    privatePostAccountDemoAdjustBalance::Function = privatePostAccountDemoAdjustBalance
    privatePostAssetSubaccountTransfer::Function = privatePostAssetSubaccountTransfer
    privatePostAccountSubaccountSetLoanAllocation::Function = privatePostAccountSubaccountSetLoanAllocation
    privatePostUsersSubaccountCreateSubaccount::Function = privatePostUsersSubaccountCreateSubaccount
    privatePostUsersSubaccountApikey::Function = privatePostUsersSubaccountApikey
    privatePostUsersSubaccountModifyApikey::Function = privatePostUsersSubaccountModifyApikey
    privatePostUsersSubaccountSubaccountApikey::Function = privatePostUsersSubaccountSubaccountApikey
    privatePostUsersSubaccountDeleteApikey::Function = privatePostUsersSubaccountDeleteApikey
    privatePostUsersSubaccountSetTransferOut::Function = privatePostUsersSubaccountSetTransferOut
    privatePostTradingBotGridOrderAlgo::Function = privatePostTradingBotGridOrderAlgo
    privatePostTradingBotGridCopyOrderAlgo::Function = privatePostTradingBotGridCopyOrderAlgo
    privatePostTradingBotGridAmendAlgoBasicParam::Function = privatePostTradingBotGridAmendAlgoBasicParam
    privatePostTradingBotGridAmendOrderAlgo::Function = privatePostTradingBotGridAmendOrderAlgo
    privatePostTradingBotGridStopOrderAlgo::Function = privatePostTradingBotGridStopOrderAlgo
    privatePostTradingBotGridClosePosition::Function = privatePostTradingBotGridClosePosition
    privatePostTradingBotGridCancelCloseOrder::Function = privatePostTradingBotGridCancelCloseOrder
    privatePostTradingBotGridOrderInstantTrigger::Function = privatePostTradingBotGridOrderInstantTrigger
    privatePostTradingBotGridWithdrawIncome::Function = privatePostTradingBotGridWithdrawIncome
    privatePostTradingBotGridComputeMarginBalance::Function = privatePostTradingBotGridComputeMarginBalance
    privatePostTradingBotGridMarginBalance::Function = privatePostTradingBotGridMarginBalance
    privatePostTradingBotGridMinInvestment::Function = privatePostTradingBotGridMinInvestment
    privatePostTradingBotGridAdjustInvestment::Function = privatePostTradingBotGridAdjustInvestment
    privatePostTradingBotSignalCreateSignal::Function = privatePostTradingBotSignalCreateSignal
    privatePostTradingBotSignalOrderAlgo::Function = privatePostTradingBotSignalOrderAlgo
    privatePostTradingBotSignalStopOrderAlgo::Function = privatePostTradingBotSignalStopOrderAlgo
    privatePostTradingBotSignalMarginBalance::Function = privatePostTradingBotSignalMarginBalance
    privatePostTradingBotSignalAmendTPSL::Function = privatePostTradingBotSignalAmendTPSL
    privatePostTradingBotSignalSetInstruments::Function = privatePostTradingBotSignalSetInstruments
    privatePostTradingBotSignalClosePosition::Function = privatePostTradingBotSignalClosePosition
    privatePostTradingBotSignalSubOrder::Function = privatePostTradingBotSignalSubOrder
    privatePostTradingBotSignalCancelSubOrder::Function = privatePostTradingBotSignalCancelSubOrder
    privatePostTradingBotRecurringOrderAlgo::Function = privatePostTradingBotRecurringOrderAlgo
    privatePostTradingBotRecurringAmendOrderAlgo::Function = privatePostTradingBotRecurringAmendOrderAlgo
    privatePostTradingBotRecurringStopOrderAlgo::Function = privatePostTradingBotRecurringStopOrderAlgo
    privatePostTradingBotDcaCreate::Function = privatePostTradingBotDcaCreate
    privatePostTradingBotDcaAmendOrderAlgo::Function = privatePostTradingBotDcaAmendOrderAlgo
    privatePostTradingBotDcaStop::Function = privatePostTradingBotDcaStop
    privatePostTradingBotDcaOrdersManualBuy::Function = privatePostTradingBotDcaOrdersManualBuy
    privatePostTradingBotDcaSettingsReinvestment::Function = privatePostTradingBotDcaSettingsReinvestment
    privatePostTradingBotDcaSettingsTakeProfit::Function = privatePostTradingBotDcaSettingsTakeProfit
    privatePostTradingBotDcaMarginAdd::Function = privatePostTradingBotDcaMarginAdd
    privatePostTradingBotDcaMarginReduce::Function = privatePostTradingBotDcaMarginReduce
    privatePostTradingBotRecurringAddInvestment::Function = privatePostTradingBotRecurringAddInvestment
    privatePostTradingBotRecurringAmendPriceRange::Function = privatePostTradingBotRecurringAmendPriceRange
    privatePostTradingBotRecurringAmendRecurringAmount::Function = privatePostTradingBotRecurringAmendRecurringAmount
    privatePostTradingBotRecurringAmendRecurringTime::Function = privatePostTradingBotRecurringAmendRecurringTime
    privatePostTradingBotRecurringPause::Function = privatePostTradingBotRecurringPause
    privatePostTradingBotRecurringRestart::Function = privatePostTradingBotRecurringRestart
    privatePostFinanceSavingsPurchaseRedempt::Function = privatePostFinanceSavingsPurchaseRedempt
    privatePostFinanceSavingsSetLendingRate::Function = privatePostFinanceSavingsSetLendingRate
    privatePostFinanceStakingDefiPurchase::Function = privatePostFinanceStakingDefiPurchase
    privatePostFinanceStakingDefiRedeem::Function = privatePostFinanceStakingDefiRedeem
    privatePostFinanceStakingDefiCancel::Function = privatePostFinanceStakingDefiCancel
    privatePostFinanceStakingDefiEthPurchase::Function = privatePostFinanceStakingDefiEthPurchase
    privatePostFinanceStakingDefiEthRedeem::Function = privatePostFinanceStakingDefiEthRedeem
    privatePostFinanceStakingDefiEthCancelRedeem::Function = privatePostFinanceStakingDefiEthCancelRedeem
    privatePostFinanceStakingDefiSolPurchase::Function = privatePostFinanceStakingDefiSolPurchase
    privatePostFinanceStakingDefiSolRedeem::Function = privatePostFinanceStakingDefiSolRedeem
    privatePostFinanceStakingDefiSolCancelRedeem::Function = privatePostFinanceStakingDefiSolCancelRedeem
    privatePostFinanceFlexibleLoanMaxLoan::Function = privatePostFinanceFlexibleLoanMaxLoan
    privatePostFinanceFlexibleLoanAdjustCollateral::Function = privatePostFinanceFlexibleLoanAdjustCollateral
    privatePostCopytradingAlgoOrder::Function = privatePostCopytradingAlgoOrder
    privatePostCopytradingCloseSubposition::Function = privatePostCopytradingCloseSubposition
    privatePostCopytradingSetInstruments::Function = privatePostCopytradingSetInstruments
    privatePostCopytradingAmendProfitSharingRatio::Function = privatePostCopytradingAmendProfitSharingRatio
    privatePostCopytradingFirstCopySettings::Function = privatePostCopytradingFirstCopySettings
    privatePostCopytradingAmendCopySettings::Function = privatePostCopytradingAmendCopySettings
    privatePostCopytradingStopCopyTrading::Function = privatePostCopytradingStopCopyTrading
    privatePostCopytradingBatchSetLeverage::Function = privatePostCopytradingBatchSetLeverage
    privatePostBrokerNdCreateSubaccount::Function = privatePostBrokerNdCreateSubaccount
    privatePostBrokerNdDeleteSubaccount::Function = privatePostBrokerNdDeleteSubaccount
    privatePostBrokerNdSubaccountApikey::Function = privatePostBrokerNdSubaccountApikey
    privatePostBrokerNdSubaccountModifyApikey::Function = privatePostBrokerNdSubaccountModifyApikey
    privatePostBrokerNdSubaccountDeleteApikey::Function = privatePostBrokerNdSubaccountDeleteApikey
    privatePostBrokerNdSetSubaccountLevel::Function = privatePostBrokerNdSetSubaccountLevel
    privatePostBrokerNdSetSubaccountFeeRate::Function = privatePostBrokerNdSetSubaccountFeeRate
    privatePostBrokerNdSetSubaccountAssets::Function = privatePostBrokerNdSetSubaccountAssets
    privatePostAssetBrokerNdSubaccountDepositAddress::Function = privatePostAssetBrokerNdSubaccountDepositAddress
    privatePostAssetBrokerNdModifySubaccountDepositAddress::Function = privatePostAssetBrokerNdModifySubaccountDepositAddress
    privatePostBrokerNdRebatePerOrders::Function = privatePostBrokerNdRebatePerOrders
    privatePostFinanceSfpDcdQuote::Function = privatePostFinanceSfpDcdQuote
    privatePostFinanceSfpDcdOrder::Function = privatePostFinanceSfpDcdOrder
    privatePostFinanceSfpDcdTrade::Function = privatePostFinanceSfpDcdTrade
    privatePostFinanceSfpDcdRedeemQuote::Function = privatePostFinanceSfpDcdRedeemQuote
    privatePostFinanceSfpDcdRedeem::Function = privatePostFinanceSfpDcdRedeem
    privatePostBrokerNdReportSubaccountIp::Function = privatePostBrokerNdReportSubaccountIp
    privatePostBrokerDmaSubaccountApikey::Function = privatePostBrokerDmaSubaccountApikey
    privatePostBrokerDmaTrades::Function = privatePostBrokerDmaTrades
    privatePostBrokerFdRebatePerOrders::Function = privatePostBrokerFdRebatePerOrders

end
function describe(self::Okx, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "okx",
    Symbol("name") => "OKX",
    Symbol("countries") => ["CN", "US"],
    Symbol("version") => "v5",
    Symbol("rateLimit") => 100 * 1.1,
    Symbol("pro") => true,
    Symbol("certified") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => true,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => true,
        Symbol("cancelAllOrders") => false,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelOrdersForSymbols") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => true,
        Symbol("createConvertTrade") => true,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketSellOrderWithCost") => true,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTrailingPercentOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchAllGreeks") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => nothing,
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => true,
        Symbol("fetchBorrowRateHistory") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrder") => nothing,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchConvertCurrencies") => true,
        Symbol("fetchConvertQuote") => true,
        Symbol("fetchConvertTrade") => true,
        Symbol("fetchConvertTradeHistory") => true,
        Symbol("fetchCrossBorrowRate") => true,
        Symbol("fetchCrossBorrowRates") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingInterval") => true,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => true,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLedgerEntry") => nothing,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => true,
        Symbol("fetchMarginAdjustmentHistory") => true,
        Symbol("fetchMarketLeverageTiers") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMarkPrice") => true,
        Symbol("fetchMarkPrices") => true,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => true,
        Symbol("fetchOpenInterests") => true,
        Symbol("fetchOpenOrder") => nothing,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => true,
        Symbol("fetchOptionChain") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionHistory") => "emulated",
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsForSymbol") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => true,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTradingLimits") => false,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => true,
        Symbol("fetchTransfers") => true,
        Symbol("fetchUnderlyingAssets") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => true,
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
        Symbol("1d") => "1D",
        Symbol("1w") => "1W",
        Symbol("1M") => "1M",
        Symbol("3M") => "3M"
    ),
    Symbol("hostname") => "www.okx.com",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://{hostname}"
        ),
        Symbol("www") => "https://www.okx.com",
        Symbol("doc") => "https://www.okx.com/docs-v5/en/",
        Symbol("fees") => "https://www.okx.com/pages/products/fees.html",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://www.okx.com/join/CCXTCOM",
            Symbol("discount") => 0.2
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("rest") => "https://{hostname}"
        )
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("market/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/books") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 2
),
                Symbol("market/books-full") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("market/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 2
),
                Symbol("market/history-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 5
),
                Symbol("market/history-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("market/option/instrument-family-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/platform-24-volume") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("market/call-auction-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/call-auction-details") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/books-sbe") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("market/block-tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/block-ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/sprd-ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/sprd-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 2
),
                Symbol("market/sprd-history-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/index-tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/index-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/history-index-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("market/mark-price-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/history-mark-price-candles") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/exchange-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("market/index-components") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("market/open-oracle") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("market/books-lite") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("public/option-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/block-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/estimated-price") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("public/delivery-exercise-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 2
),
                Symbol("public/estimated-settlement-info") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("public/settlement-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 2
),
                Symbol("public/funding-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("public/funding-rate-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("public/open-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/price-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/opt-summary") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/discount-rate-interest-free-quota") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/time") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("public/mark-price") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("public/position-tiers") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("public/interest-rate-loan-quota") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("public/underlying") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/insurance-fund") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("public/convert-contract-coin") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("public/instrument-tick-bands") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("public/premium-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/economic-calendar") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("public/market-data-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("public/event-contract/events") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/event-contract/markets") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/event-contract/series") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("public/vip-interest-rate-loan-quota") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("rubik/stat/trading-data/support-coin") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/contracts/open-interest-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("rubik/stat/taker-volume") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/taker-volume-contract") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/margin/loan-ratio") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/contracts/long-short-account-ratio-contract-top-trader") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/contracts/long-short-position-ratio-contract-top-trader") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/contracts/long-short-account-ratio-contract") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/contracts/long-short-account-ratio") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/contracts/open-interest-volume") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/option/open-interest-volume") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/option/open-interest-volume-ratio") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/option/open-interest-volume-expiry") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/option/open-interest-volume-strike") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rubik/stat/option/taker-block-volume") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("system/status") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("sprd/spreads") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sprd/books") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sprd/public-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sprd/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/ai-param") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/min-investment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/public/rsi-back-testing") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/grid-quantity") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("asset/exchange-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/staking-defi/eth/apy-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/staking-defi/sol/apy-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/savings/lending-rate-summary") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/savings/lending-rate-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/fixed-loan/lending-offers") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                Symbol("finance/fixed-loan/lending-apy-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                Symbol("finance/fixed-loan/pending-lending-volume") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                Symbol("finance/sfp/dcd/products") => Dict{Symbol, Any}(
    Symbol("cost") => 2 / 3
),
                Symbol("copytrading/public-config") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/public-lead-traders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/public-weekly-pnl") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/public-pnl") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/public-stats") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/public-preference-currency") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/public-current-subpositions") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/public-subpositions-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/public-copy-traders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("support/announcements") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("support/announcements-types") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("support/announcement-types") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("tradingBot/grid/min-investment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("rfq/counterparties") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rfq/maker-instrument-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rfq/mmp-config") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rfq/rfqs") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("rfq/quotes") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("rfq/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rfq/public-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("sprd/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sprd/orders-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("sprd/orders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sprd/orders-history-archive") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sprd/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 3
),
                Symbol("trade/orders-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 3
),
                Symbol("trade/orders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 2
),
                Symbol("trade/orders-history-archive") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 3
),
                Symbol("trade/fills-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("trade/fills-archive") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("trade/order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders-algo-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/orders-algo-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/easy-convert-currency-list") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trade/easy-convert-history") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trade/one-click-repay-currency-list") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trade/one-click-repay-currency-list-v2") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trade/one-click-repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trade/one-click-repay-history-v2") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trade/account-rate-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/non-tradable-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/asset-valuation") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("asset/transfer-state") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/bills-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("asset/deposit-lightning") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("asset/deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/deposit-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/withdrawal-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/deposit-withdraw-status") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("asset/monthly-statement") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("asset/convert/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/convert/currency-pair") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/convert/history") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("account/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/positions-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/account-position-risk") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/bills-archive") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/bills-history-archive") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/config") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/subtypes") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/max-size") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/max-avail-size") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/leverage-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/adjust-leverage-info") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/max-loan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/trade-fee") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/interest-accrued") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/interest-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/max-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/risk-state") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/interest-limits") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/spot-borrow-repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/greeks") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/position-tiers") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/set-account-switch-precheck") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/collateral-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/mmp-config") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/move-positions-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account/precheck-set-delta-neutral") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("account/quick-margin-borrow-repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/borrow-repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/vip-interest-accrued") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/vip-interest-deducted") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/vip-loan-order-list") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/vip-loan-order-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/fixed-loan/borrowing-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/fixed-loan/borrowing-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("account/fixed-loan/borrowing-orders-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("account/spot-manual-borrow-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("account/set-auto-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("users/subaccount/list") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account/subaccount/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                Symbol("asset/subaccount/balances") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                Symbol("account/subaccount/max-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/subaccount/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/subaccount/managed-subaccount-bills") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("users/entrust-subaccount-list") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account/subaccount/interest-limits") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("users/subaccount/apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("tradingBot/grid/orders-algo-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/orders-algo-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/orders-algo-details") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/sub-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/ai-param") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/signals") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/orders-algo-details") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/orders-algo-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/orders-algo-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/positions-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("tradingBot/signal/sub-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/event-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/orders-algo-pending") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/orders-algo-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/orders-algo-details") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/sub-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/ongoing-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/history-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/position-details") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/cycle-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("finance/savings/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/savings/lending-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/staking-defi/offers") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                Symbol("finance/staking-defi/orders-active") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                Symbol("finance/staking-defi/orders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                Symbol("finance/staking-defi/eth/product-info") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                Symbol("finance/staking-defi/eth/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/staking-defi/eth/purchase-redeem-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/staking-defi/sol/product-info") => Dict{Symbol, Any}(
    Symbol("cost") => 10 / 3
),
                Symbol("finance/staking-defi/sol/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/staking-defi/sol/purchase-redeem-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/flexible-loan/borrow-currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("finance/flexible-loan/collateral-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("finance/flexible-loan/max-collateral-redeem-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("finance/flexible-loan/loan-info") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("finance/flexible-loan/loan-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("finance/flexible-loan/interest-accrued") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/current-subpositions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/subpositions-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/profit-sharing-details") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/total-profit-sharing") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/unrealized-profit-sharing-details") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/total-unrealized-profit-sharing") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/config") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/copy-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/current-lead-traders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/batch-leverage-info") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/lead-traders-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("broker/dma/subaccount-info") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("broker/dma/subaccount-trade-fee") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("broker/dma/subaccount/apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("broker/dma/rebate-per-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 300
),
                Symbol("broker/fd/rebate-per-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 300
),
                Symbol("broker/fd/if-rebate") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("broker/nd/info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("broker/nd/subaccount-info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("broker/nd/subaccount/apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("asset/broker/nd/subaccount-deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/broker/nd/subaccount-deposit-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("asset/broker/nd/subaccount-withdrawal-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("broker/nd/rebate-daily") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("broker/nd/rebate-per-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 300
),
                Symbol("finance/sfp/dcd/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("finance/sfp/dcd/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("finance/sfp/dcd/currency-pair") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("finance/sfp/dcd/order-status") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("finance/sfp/dcd/order-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("affiliate/invitee/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("users/partner/if-rebate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("support/announcements") => Dict{Symbol, Any}(
    Symbol("cost") => 4
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("rfq/create-rfq") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rfq/cancel-rfq") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rfq/cancel-batch-rfqs") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("rfq/cancel-all-rfqs") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("rfq/execute-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("rfq/maker-instrument-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rfq/mmp-reset") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("rfq/mmp-config") => Dict{Symbol, Any}(
    Symbol("cost") => 100
),
                Symbol("rfq/create-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("rfq/cancel-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 0.4
),
                Symbol("rfq/cancel-batch-quotes") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("rfq/cancel-all-quotes") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("rfq/cancel-all-after") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("sprd/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sprd/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sprd/mass-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sprd/amend-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("sprd/cancel-all-after") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("trade/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 3
),
                Symbol("trade/batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 15
),
                Symbol("trade/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 3
),
                Symbol("trade/cancel-batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 15
),
                Symbol("trade/amend-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 3
),
                Symbol("trade/amend-batch-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 150
),
                Symbol("trade/close-position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/fills-archive") => Dict{Symbol, Any}(
    Symbol("cost") => 172800
),
                Symbol("trade/cancel-advance-algos") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/easy-convert") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trade/one-click-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trade/one-click-repay-v2") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trade/mass-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("trade/cancel-all-after") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("trade/order-precheck") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("trade/order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/cancel-algos") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("trade/amend-algos") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("asset/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/withdrawal-lightning") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("asset/cancel-withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("asset/convert-dust-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("asset/monthly-statement") => Dict{Symbol, Any}(
    Symbol("cost") => 1296000
),
                Symbol("asset/convert/estimate-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("asset/convert/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/bills-history-archive") => Dict{Symbol, Any}(
    Symbol("cost") => 72000
),
                Symbol("account/set-position-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/position/margin-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/set-fee-type") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/set-greeks") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/set-isolated-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/spot-manual-borrow-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("account/set-auto-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/quick-margin-borrow-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/borrow-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("account/simulated_margin") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account/position-builder") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account/position-builder-graph") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("account/set-riskOffset-type") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/set-riskOffset-amt") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("account/activate-option") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/set-auto-loan") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/account-level-switch-preset") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/set-account-level") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/set-collateral-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/mmp-reset") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/mmp-config") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("account/fixed-loan/borrowing-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("account/fixed-loan/amend-borrowing-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("account/fixed-loan/manual-reborrow") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("account/fixed-loan/repay-borrowing-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("account/move-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account/set-auto-earn") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account/set-settle-currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("account/set-trading-config") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("account/demo-adjust-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("asset/subaccount/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account/subaccount/set-loan-allocation") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("users/subaccount/create-subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("users/subaccount/apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("users/subaccount/modify-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("users/subaccount/subaccount-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("users/subaccount/delete-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("users/subaccount/set-transfer-out") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("tradingBot/grid/order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/copy-order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/amend-algo-basic-param") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/amend-order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/stop-order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/close-position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/cancel-close-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/order-instant-trigger") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/withdraw-income") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/compute-margin-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/margin-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/min-investment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/grid/adjust-investment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/create-signal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/stop-order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/margin-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/amendTPSL") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/set-instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/close-position") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/sub-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/signal/cancel-sub-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/amend-order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/stop-order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/amend-order-algo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/stop") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/orders/manual-buy") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/settings/reinvestment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/settings/take-profit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/margin/add") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/dca/margin/reduce") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/add-investment") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/amend-price-range") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/amend-recurring-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/amend-recurring-time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/pause") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("tradingBot/recurring/restart") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("finance/savings/purchase-redempt") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/savings/set-lending-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("finance/staking-defi/purchase") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("finance/staking-defi/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("finance/staking-defi/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("finance/staking-defi/eth/purchase") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("finance/staking-defi/eth/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("finance/staking-defi/eth/cancel-redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("finance/staking-defi/sol/purchase") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("finance/staking-defi/sol/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("finance/staking-defi/sol/cancel-redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("finance/flexible-loan/max-loan") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("finance/flexible-loan/adjust-collateral") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/algo-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/close-subposition") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("copytrading/set-instruments") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/amend-profit-sharing-ratio") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/first-copy-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/amend-copy-settings") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/stop-copy-trading") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copytrading/batch-set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("broker/nd/create-subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 0.25
),
                Symbol("broker/nd/delete-subaccount") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/nd/subaccount/apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 0.25
),
                Symbol("broker/nd/subaccount/modify-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/nd/subaccount/delete-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("broker/nd/set-subaccount-level") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("broker/nd/set-subaccount-fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("broker/nd/set-subaccount-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 0.25
),
                Symbol("asset/broker/nd/subaccount-deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/broker/nd/modify-subaccount-deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 5 / 3
),
                Symbol("broker/nd/rebate-per-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 36000
),
                Symbol("finance/sfp/dcd/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("finance/sfp/dcd/order") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("finance/sfp/dcd/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("finance/sfp/dcd/redeem-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("finance/sfp/dcd/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("broker/nd/report-subaccount-ip") => Dict{Symbol, Any}(
    Symbol("cost") => 0.25
),
                Symbol("broker/dma/subaccount/apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 1 / 4
),
                Symbol("broker/dma/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 36000
),
                Symbol("broker/fd/rebate-per-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 36000
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0015"),
            Symbol("maker") => self.parseNumber("0.0010")
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0015"),
            Symbol("maker") => self.parseNumber("0.0010")
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.0005"),
            Symbol("maker") => self.parseNumber("0.0002")
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("taker") => self.parseNumber("0.00050"),
            Symbol("maker") => self.parseNumber("0.00020")
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
            Symbol("2") => ExchangeError,
            Symbol("4088") => ManualInteractionNeeded,
            Symbol("50000") => BadRequest,
            Symbol("50001") => OnMaintenance,
            Symbol("50002") => BadRequest,
            Symbol("50004") => RequestTimeout,
            Symbol("50005") => ExchangeNotAvailable,
            Symbol("50006") => BadRequest,
            Symbol("50007") => AccountSuspended,
            Symbol("50008") => AuthenticationError,
            Symbol("50009") => AccountSuspended,
            Symbol("50010") => ExchangeError,
            Symbol("50011") => RateLimitExceeded,
            Symbol("50012") => ExchangeError,
            Symbol("50013") => ExchangeNotAvailable,
            Symbol("50014") => BadRequest,
            Symbol("50015") => ExchangeError,
            Symbol("50016") => ExchangeError,
            Symbol("50017") => ExchangeError,
            Symbol("50018") => ExchangeError,
            Symbol("50019") => ExchangeError,
            Symbol("50020") => ExchangeError,
            Symbol("50021") => ExchangeError,
            Symbol("50022") => ExchangeError,
            Symbol("50023") => ExchangeError,
            Symbol("50024") => BadRequest,
            Symbol("50025") => ExchangeError,
            Symbol("50026") => ExchangeNotAvailable,
            Symbol("50027") => PermissionDenied,
            Symbol("50028") => ExchangeError,
            Symbol("50044") => BadRequest,
            Symbol("50061") => ExchangeError,
            Symbol("50062") => ExchangeError,
            Symbol("50100") => ExchangeError,
            Symbol("50101") => AuthenticationError,
            Symbol("50102") => InvalidNonce,
            Symbol("50103") => AuthenticationError,
            Symbol("50104") => AuthenticationError,
            Symbol("50105") => AuthenticationError,
            Symbol("50106") => AuthenticationError,
            Symbol("50107") => AuthenticationError,
            Symbol("50108") => ExchangeError,
            Symbol("50109") => ExchangeError,
            Symbol("50110") => PermissionDenied,
            Symbol("50111") => AuthenticationError,
            Symbol("50112") => AuthenticationError,
            Symbol("50113") => AuthenticationError,
            Symbol("50114") => AuthenticationError,
            Symbol("50115") => BadRequest,
            Symbol("51000") => BadRequest,
            Symbol("51001") => BadSymbol,
            Symbol("51002") => BadSymbol,
            Symbol("51003") => BadRequest,
            Symbol("51004") => InvalidOrder,
            Symbol("51005") => InvalidOrder,
            Symbol("51006") => InvalidOrder,
            Symbol("51007") => InvalidOrder,
            Symbol("51008") => InsufficientFunds,
            Symbol("51009") => AccountSuspended,
            Symbol("51010") => AccountNotEnabled,
            Symbol("51011") => InvalidOrder,
            Symbol("51012") => BadSymbol,
            Symbol("51014") => BadSymbol,
            Symbol("51015") => BadSymbol,
            Symbol("51016") => InvalidOrder,
            Symbol("51017") => ExchangeError,
            Symbol("51018") => ExchangeError,
            Symbol("51019") => ExchangeError,
            Symbol("51020") => InvalidOrder,
            Symbol("51021") => ContractUnavailable,
            Symbol("51022") => ContractUnavailable,
            Symbol("51023") => ExchangeError,
            Symbol("51024") => AccountSuspended,
            Symbol("51025") => ExchangeError,
            Symbol("51026") => BadSymbol,
            Symbol("51027") => ContractUnavailable,
            Symbol("51028") => ContractUnavailable,
            Symbol("51029") => ContractUnavailable,
            Symbol("51030") => ContractUnavailable,
            Symbol("51031") => InvalidOrder,
            Symbol("51046") => InvalidOrder,
            Symbol("51047") => InvalidOrder,
            Symbol("51051") => InvalidOrder,
            Symbol("51072") => InvalidOrder,
            Symbol("51073") => InvalidOrder,
            Symbol("51074") => InvalidOrder,
            Symbol("51090") => InvalidOrder,
            Symbol("51091") => InvalidOrder,
            Symbol("51092") => InvalidOrder,
            Symbol("51093") => InvalidOrder,
            Symbol("51094") => InvalidOrder,
            Symbol("51095") => InvalidOrder,
            Symbol("51096") => InvalidOrder,
            Symbol("51098") => InvalidOrder,
            Symbol("51099") => InvalidOrder,
            Symbol("51100") => InvalidOrder,
            Symbol("51101") => InvalidOrder,
            Symbol("51102") => InvalidOrder,
            Symbol("51103") => InvalidOrder,
            Symbol("51104") => InvalidOrder,
            Symbol("51105") => InvalidOrder,
            Symbol("51106") => InvalidOrder,
            Symbol("51107") => InvalidOrder,
            Symbol("51108") => InvalidOrder,
            Symbol("51109") => InvalidOrder,
            Symbol("51110") => InvalidOrder,
            Symbol("51111") => BadRequest,
            Symbol("51112") => InvalidOrder,
            Symbol("51113") => RateLimitExceeded,
            Symbol("51115") => InvalidOrder,
            Symbol("51116") => InvalidOrder,
            Symbol("51117") => InvalidOrder,
            Symbol("51118") => InvalidOrder,
            Symbol("51119") => InsufficientFunds,
            Symbol("51120") => InvalidOrder,
            Symbol("51121") => InvalidOrder,
            Symbol("51122") => InvalidOrder,
            Symbol("51124") => InvalidOrder,
            Symbol("51125") => InvalidOrder,
            Symbol("51126") => InvalidOrder,
            Symbol("51127") => InsufficientFunds,
            Symbol("51128") => InvalidOrder,
            Symbol("51129") => InvalidOrder,
            Symbol("51130") => BadSymbol,
            Symbol("51131") => InsufficientFunds,
            Symbol("51132") => InvalidOrder,
            Symbol("51133") => InvalidOrder,
            Symbol("51134") => InvalidOrder,
            Symbol("51135") => InvalidOrder,
            Symbol("51136") => InvalidOrder,
            Symbol("51137") => InvalidOrder,
            Symbol("51138") => InvalidOrder,
            Symbol("51139") => InvalidOrder,
            Symbol("51155") => RestrictedLocation,
            Symbol("51156") => BadRequest,
            Symbol("51159") => BadRequest,
            Symbol("51162") => InvalidOrder,
            Symbol("51163") => InvalidOrder,
            Symbol("51166") => InvalidOrder,
            Symbol("51174") => InvalidOrder,
            Symbol("51185") => InvalidOrder,
            Symbol("51201") => InvalidOrder,
            Symbol("51202") => InvalidOrder,
            Symbol("51203") => InvalidOrder,
            Symbol("51204") => InvalidOrder,
            Symbol("51205") => InvalidOrder,
            Symbol("51250") => InvalidOrder,
            Symbol("51251") => InvalidOrder,
            Symbol("51252") => InvalidOrder,
            Symbol("51253") => InvalidOrder,
            Symbol("51254") => InvalidOrder,
            Symbol("51255") => InvalidOrder,
            Symbol("51256") => InvalidOrder,
            Symbol("51257") => InvalidOrder,
            Symbol("51258") => InvalidOrder,
            Symbol("51259") => InvalidOrder,
            Symbol("51260") => InvalidOrder,
            Symbol("51261") => InvalidOrder,
            Symbol("51262") => InvalidOrder,
            Symbol("51263") => InvalidOrder,
            Symbol("51264") => InvalidOrder,
            Symbol("51265") => InvalidOrder,
            Symbol("51267") => InvalidOrder,
            Symbol("51268") => InvalidOrder,
            Symbol("51269") => InvalidOrder,
            Symbol("51270") => InvalidOrder,
            Symbol("51271") => InvalidOrder,
            Symbol("51272") => InvalidOrder,
            Symbol("51273") => InvalidOrder,
            Symbol("51274") => InvalidOrder,
            Symbol("51275") => InvalidOrder,
            Symbol("51276") => InvalidOrder,
            Symbol("51277") => InvalidOrder,
            Symbol("51278") => InvalidOrder,
            Symbol("51279") => InvalidOrder,
            Symbol("51280") => InvalidOrder,
            Symbol("51321") => InvalidOrder,
            Symbol("51322") => InvalidOrder,
            Symbol("51323") => BadRequest,
            Symbol("51324") => BadRequest,
            Symbol("51325") => InvalidOrder,
            Symbol("51327") => InvalidOrder,
            Symbol("51328") => InvalidOrder,
            Symbol("51329") => InvalidOrder,
            Symbol("51330") => InvalidOrder,
            Symbol("51400") => OrderNotFound,
            Symbol("51401") => OrderNotFound,
            Symbol("51402") => OrderNotFound,
            Symbol("51403") => InvalidOrder,
            Symbol("51404") => InvalidOrder,
            Symbol("51405") => ExchangeError,
            Symbol("51406") => ExchangeError,
            Symbol("51407") => BadRequest,
            Symbol("51408") => ExchangeError,
            Symbol("51409") => ExchangeError,
            Symbol("51410") => CancelPending,
            Symbol("51500") => ExchangeError,
            Symbol("51501") => ExchangeError,
            Symbol("51502") => InsufficientFunds,
            Symbol("51503") => ExchangeError,
            Symbol("51506") => ExchangeError,
            Symbol("51508") => ExchangeError,
            Symbol("51509") => ExchangeError,
            Symbol("51510") => ExchangeError,
            Symbol("51511") => ExchangeError,
            Symbol("51600") => ExchangeError,
            Symbol("51601") => ExchangeError,
            Symbol("51602") => ExchangeError,
            Symbol("51603") => OrderNotFound,
            Symbol("51732") => AuthenticationError,
            Symbol("51733") => AuthenticationError,
            Symbol("51734") => AuthenticationError,
            Symbol("51735") => ExchangeError,
            Symbol("51736") => InsufficientFunds,
            Symbol("51763") => AccountNotEnabled,
            Symbol("51764") => InsufficientFunds,
            Symbol("51765") => BadRequest,
            Symbol("51766") => ExchangeError,
            Symbol("51767") => OnMaintenance,
            Symbol("51768") => BadRequest,
            Symbol("51769") => ExchangeError,
            Symbol("51770") => BadRequest,
            Symbol("51771") => ExchangeError,
            Symbol("51772") => InsufficientFunds,
            Symbol("51773") => PermissionDenied,
            Symbol("51774") => OnMaintenance,
            Symbol("52000") => ExchangeError,
            Symbol("54000") => ExchangeError,
            Symbol("54001") => ExchangeError,
            Symbol("54008") => InvalidOrder,
            Symbol("54009") => InvalidOrder,
            Symbol("54011") => InvalidOrder,
            Symbol("54072") => ExchangeError,
            Symbol("54073") => BadRequest,
            Symbol("54074") => ExchangeError,
            Symbol("54094") => InvalidOrder,
            Symbol("55100") => InvalidOrder,
            Symbol("55101") => InvalidOrder,
            Symbol("55102") => InvalidOrder,
            Symbol("55103") => InvalidOrder,
            Symbol("55104") => InvalidOrder,
            Symbol("55111") => InvalidOrder,
            Symbol("55112") => InvalidOrder,
            Symbol("55113") => InvalidOrder,
            Symbol("58000") => ExchangeError,
            Symbol("58001") => AuthenticationError,
            Symbol("58002") => PermissionDenied,
            Symbol("58003") => ExchangeError,
            Symbol("58004") => AccountSuspended,
            Symbol("58005") => ExchangeError,
            Symbol("58006") => ExchangeError,
            Symbol("58007") => ExchangeError,
            Symbol("58100") => ExchangeError,
            Symbol("58101") => AccountSuspended,
            Symbol("58102") => RateLimitExceeded,
            Symbol("58103") => ExchangeError,
            Symbol("58104") => ExchangeError,
            Symbol("58105") => ExchangeError,
            Symbol("58106") => ExchangeError,
            Symbol("58107") => ExchangeError,
            Symbol("58108") => ExchangeError,
            Symbol("58109") => ExchangeError,
            Symbol("58110") => ExchangeError,
            Symbol("58111") => ExchangeError,
            Symbol("58112") => ExchangeError,
            Symbol("58114") => ExchangeError,
            Symbol("58115") => ExchangeError,
            Symbol("58116") => ExchangeError,
            Symbol("58117") => ExchangeError,
            Symbol("58125") => BadRequest,
            Symbol("58126") => BadRequest,
            Symbol("58127") => BadRequest,
            Symbol("58128") => BadRequest,
            Symbol("58200") => ExchangeError,
            Symbol("58201") => ExchangeError,
            Symbol("58202") => ExchangeError,
            Symbol("58203") => InvalidAddress,
            Symbol("58204") => AccountSuspended,
            Symbol("58205") => ExchangeError,
            Symbol("58206") => ExchangeError,
            Symbol("58207") => InvalidAddress,
            Symbol("58208") => ExchangeError,
            Symbol("58209") => ExchangeError,
            Symbol("58210") => ExchangeError,
            Symbol("58211") => ExchangeError,
            Symbol("58212") => ExchangeError,
            Symbol("58213") => AuthenticationError,
            Symbol("58221") => BadRequest,
            Symbol("58222") => BadRequest,
            Symbol("58224") => BadRequest,
            Symbol("58227") => BadRequest,
            Symbol("58228") => BadRequest,
            Symbol("58229") => InsufficientFunds,
            Symbol("58300") => ExchangeError,
            Symbol("58350") => InsufficientFunds,
            Symbol("59000") => ExchangeError,
            Symbol("59001") => ExchangeError,
            Symbol("59100") => ExchangeError,
            Symbol("59101") => ExchangeError,
            Symbol("59102") => ExchangeError,
            Symbol("59103") => InsufficientFunds,
            Symbol("59104") => ExchangeError,
            Symbol("59105") => ExchangeError,
            Symbol("59106") => ExchangeError,
            Symbol("59107") => ExchangeError,
            Symbol("59108") => InsufficientFunds,
            Symbol("59109") => ExchangeError,
            Symbol("59113") => AuthenticationError,
            Symbol("59128") => InvalidOrder,
            Symbol("59200") => InsufficientFunds,
            Symbol("59201") => InsufficientFunds,
            Symbol("59216") => BadRequest,
            Symbol("59260") => PermissionDenied,
            Symbol("59262") => PermissionDenied,
            Symbol("59300") => ExchangeError,
            Symbol("59301") => ExchangeError,
            Symbol("59313") => ExchangeError,
            Symbol("59401") => ExchangeError,
            Symbol("59410") => OperationRejected,
            Symbol("59411") => InsufficientFunds,
            Symbol("59412") => OperationRejected,
            Symbol("59413") => OperationRejected,
            Symbol("59414") => BadRequest,
            Symbol("59500") => ExchangeError,
            Symbol("59501") => ExchangeError,
            Symbol("59502") => ExchangeError,
            Symbol("59503") => ExchangeError,
            Symbol("59504") => ExchangeError,
            Symbol("59505") => ExchangeError,
            Symbol("59506") => ExchangeError,
            Symbol("59507") => ExchangeError,
            Symbol("59508") => AccountSuspended,
            Symbol("59515") => ExchangeError,
            Symbol("59516") => ExchangeError,
            Symbol("59517") => ExchangeError,
            Symbol("59518") => ExchangeError,
            Symbol("59519") => ExchangeError,
            Symbol("59642") => BadRequest,
            Symbol("59643") => ExchangeError,
            Symbol("59683") => ExchangeError,
            Symbol("59684") => BadRequest,
            Symbol("59686") => BadRequest,
            Symbol("60001") => AuthenticationError,
            Symbol("60002") => AuthenticationError,
            Symbol("60003") => AuthenticationError,
            Symbol("60004") => AuthenticationError,
            Symbol("60005") => AuthenticationError,
            Symbol("60006") => InvalidNonce,
            Symbol("60007") => AuthenticationError,
            Symbol("60008") => AuthenticationError,
            Symbol("60009") => AuthenticationError,
            Symbol("60010") => AuthenticationError,
            Symbol("60011") => AuthenticationError,
            Symbol("60012") => BadRequest,
            Symbol("60013") => BadRequest,
            Symbol("60014") => RateLimitExceeded,
            Symbol("60015") => NetworkError,
            Symbol("60016") => ExchangeNotAvailable,
            Symbol("60017") => BadRequest,
            Symbol("60018") => BadRequest,
            Symbol("60019") => BadRequest,
            Symbol("60020") => ExchangeError,
            Symbol("60021") => AccountNotEnabled,
            Symbol("60022") => AuthenticationError,
            Symbol("60023") => DDoSProtection,
            Symbol("60024") => AuthenticationError,
            Symbol("60025") => ExchangeError,
            Symbol("60026") => AuthenticationError,
            Symbol("60027") => ArgumentsRequired,
            Symbol("60028") => NotSupported,
            Symbol("60029") => AccountNotEnabled,
            Symbol("60030") => AccountNotEnabled,
            Symbol("60031") => AuthenticationError,
            Symbol("60032") => AuthenticationError,
            Symbol("63999") => ExchangeError,
            Symbol("64000") => BadRequest,
            Symbol("64001") => BadRequest,
            Symbol("64002") => BadRequest,
            Symbol("64003") => AccountNotEnabled,
            Symbol("64004") => BadRequest,
            Symbol("64008") => NetworkError,
            Symbol("70010") => BadRequest,
            Symbol("70013") => BadRequest,
            Symbol("70016") => BadRequest,
            Symbol("70060") => BadRequest,
            Symbol("70061") => BadRequest,
            Symbol("70062") => BadRequest,
            Symbol("70064") => BadRequest,
            Symbol("70065") => BadRequest,
            Symbol("70066") => BadRequest,
            Symbol("70067") => BadRequest,
            Symbol("1009") => BadRequest,
            Symbol("4001") => AuthenticationError,
            Symbol("4002") => BadRequest,
            Symbol("4003") => RateLimitExceeded,
            Symbol("4004") => NetworkError,
            Symbol("4005") => ExchangeNotAvailable,
            Symbol("4006") => BadRequest,
            Symbol("4007") => AuthenticationError,
            Symbol("4008") => RateLimitExceeded
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Internal Server Error") => ExchangeNotAvailable,
            Symbol("server error") => ExchangeNotAvailable
        )
    ),
    Symbol("httpExceptions") => Dict{Symbol, Any}(
        Symbol("429") => ExchangeNotAvailable
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("sandboxMode") => false,
        Symbol("defaultNetwork") => "ERC20",
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("ETH") => "ERC20",
            Symbol("BTC") => "BTC",
            Symbol("USDT") => "TRC20"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "Bitcoin",
            Symbol("BTCLIGHTNING") => "Lightning",
            Symbol("BSC") => "BSC",
            Symbol("BEP20") => "BSC",
            Symbol("BRC20") => "BRC20",
            Symbol("ETH") => "ERC20",
            Symbol("ERC20") => "ERC20",
            Symbol("TRX") => "TRC20",
            Symbol("TRC20") => "TRC20",
            Symbol("CRC20") => "Crypto",
            Symbol("CRONOS") => "Crypto",
            Symbol("ACA") => "Acala",
            Symbol("ALGO") => "Algorand",
            Symbol("APT") => "Aptos",
            Symbol("SONIC") => "Sonic",
            Symbol("SCROLL") => "Scroll",
            Symbol("ARBITRUM") => "Arbitrum One",
            Symbol("AVAXC") => "Avalanche C-Chain",
            Symbol("AVAXX") => "Avalanche X-Chain",
            Symbol("BASE") => "Base",
            Symbol("SUI") => "SUI",
            Symbol("ZKSYNCERA") => "zkSync Era",
            Symbol("LINEA") => "Linea",
            Symbol("VAULTA") => "Vaulta",
            Symbol("AR") => "Arweave",
            Symbol("ASTR") => "Astar",
            Symbol("BCH") => "BitcoinCash",
            Symbol("BSV") => "Bitcoin SV",
            Symbol("ADA") => "Cardano",
            Symbol("CSPR") => "Casper",
            Symbol("CANTON") => "Canton Network",
            Symbol("CELO") => "CELO",
            Symbol("XCH") => "Chia",
            Symbol("BABY") => "Babylon",
            Symbol("ATOM") => "Cosmos",
            Symbol("DGB") => "Digibyte",
            Symbol("DOGE") => "Dogecoin",
            Symbol("EGLD") => "Elrond",
            Symbol("CFX") => "Conflux",
            Symbol("EOS") => "EOS",
            Symbol("CORE") => "CORE",
            Symbol("ETC") => "Ethereum Classic",
            Symbol("ETHW") => "EthereumPow",
            Symbol("FIL") => "Filecoin",
            Symbol("HBAR") => "Hedera",
            Symbol("HYPER") => "HyperEVM",
            Symbol("ICP") => "Dfinity",
            Symbol("PI") => "PI",
            Symbol("IOTA") => "MIOTA",
            Symbol("KLAY") => "Klaytn",
            Symbol("KSM") => "Kusama",
            Symbol("LSK") => "Lisk",
            Symbol("LTC") => "Litecoin",
            Symbol("METIS") => "Metis",
            Symbol("MINA") => "Mina",
            Symbol("GLRM") => "Moonbeam",
            Symbol("MOVR") => "Moonriver",
            Symbol("NANO") => "Nano",
            Symbol("NEAR") => "NEAR",
            Symbol("NULS") => "NULS",
            Symbol("OASYS") => "OASYS",
            Symbol("ONT") => "Ontology",
            Symbol("OP") => "Optimism",
            Symbol("DOT") => "Polkadot",
            Symbol("MATIC") => "Polygon",
            Symbol("RVN") => "Ravencoin",
            Symbol("XRP") => "Ripple",
            Symbol("SC") => "Siacoin",
            Symbol("SOL") => "Solana",
            Symbol("STX") => "l-Stacks",
            Symbol("XLM") => "Stellar Lumens",
            Symbol("XTZ") => "Tezos",
            Symbol("TON") => "TON",
            Symbol("THETA") => "Theta",
            Symbol("WAX") => "Wax",
            Symbol("ZIL") => "Zilliqa",
            Symbol("ZEC") => "Zcash",
            Symbol("ZETA") => "ZetaChain",
            Symbol("TIA") => "Celestia",
            Symbol("SEI") => "SEI",
            Symbol("QUANTUM") => "Quantum",
            Symbol("PHAROS") => "Pharos",
            Symbol("RONIN") => "Ronin",
            Symbol("MEGAETH") => "MegaETH",
            Symbol("INJ") => "INJ",
            Symbol("FOGO") => "Fogo",
            Symbol("FLR") => "Flare",
            Symbol("FLOW") => "FLOW",
            Symbol("DYDX") => "DYDX",
            Symbol("AELF") => "AELF",
            Symbol("BERA") => "Berachain",
            Symbol("TEMPO") => "Tempo",
            Symbol("MONAD") => "Monad",
            Symbol("PLASMA") => "Plasma"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("ERC20") => "ERC20",
            Symbol("TRC20") => "TRC20",
            Symbol("BEP20") => "BEP20"
        ),
        Symbol("fetchOpenInterestHistory") => Dict{Symbol, Any}(
            Symbol("timeframes") => Dict{Symbol, Any}(
                Symbol("5m") => "5m",
                Symbol("1h") => "1H",
                Symbol("8h") => "8H",
                Symbol("1d") => "1D",
                Symbol("5M") => "5m",
                Symbol("1H") => "1H",
                Symbol("8H") => "8H",
                Symbol("1D") => "1D"
            )
        ),
        Symbol("fetchOHLCV") => Dict{Symbol, Any}(
            Symbol("timezone") => "UTC"
        ),
        Symbol("fetchPositions") => Dict{Symbol, Any}(
            Symbol("method") => "privateGetAccountPositions"
        ),
        Symbol("createOrder") => "privatePostTradeBatchOrders",
        Symbol("createMarketBuyOrderRequiresPrice") => false,
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot", "future", "swap", "option"]
        ),
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("defaultType") => "spot",
        Symbol("fetchLedger") => Dict{Symbol, Any}(
            Symbol("method") => "privateGetAccountBills"
        ),
        Symbol("fetchOrder") => Dict{Symbol, Any}(
            Symbol("method") => "privateGetTradeOrder"
        ),
        Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
            Symbol("method") => "privateGetTradeOrdersPending"
        ),
        Symbol("cancelOrders") => Dict{Symbol, Any}(
            Symbol("method") => "privatePostTradeCancelBatchOrders"
        ),
        Symbol("fetchCanceledOrders") => Dict{Symbol, Any}(
            Symbol("method") => "privateGetTradeOrdersHistory",
            Symbol("paginationDirection") => "forward"
        ),
        Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
            Symbol("method") => "privateGetTradeOrdersHistory",
            Symbol("paginationDirection") => "forward"
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("password") => nothing,
            Symbol("pwd") => nothing
        ),
        Symbol("algoOrderTypes") => Dict{Symbol, Any}(
            Symbol("conditional") => true,
            Symbol("trigger") => true,
            Symbol("oco") => true,
            Symbol("move_order_stop") => true,
            Symbol("iceberg") => true,
            Symbol("twap") => true
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("funding") => "6",
            Symbol("trading") => "18",
            Symbol("spot") => "18",
            Symbol("future") => "18",
            Symbol("futures") => "18",
            Symbol("margin") => "18",
            Symbol("swap") => "18",
            Symbol("option") => "18"
        ),
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("6") => "funding",
            Symbol("18") => "trading"
        ),
        Symbol("exchangeType") => Dict{Symbol, Any}(
            Symbol("spot") => "SPOT",
            Symbol("margin") => "MARGIN",
            Symbol("swap") => "SWAP",
            Symbol("future") => "FUTURES",
            Symbol("futures") => "FUTURES",
            Symbol("option") => "OPTION",
            Symbol("SPOT") => "SPOT",
            Symbol("MARGIN") => "MARGIN",
            Symbol("SWAP") => "SWAP",
            Symbol("FUTURES") => "FUTURES",
            Symbol("OPTION") => "OPTION"
        ),
        Symbol("brokerId") => "6b9ad766b55dBCDE"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
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
                Symbol("iceberg") => true,
                Symbol("leverage") => false,
                Symbol("selfTradePrevention") => true,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 20
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("daysBack") => 90,
                Symbol("limit") => 100,
                Symbol("untilDays") => 10000,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 90,
                Symbol("daysBackCanceled") => 1 / 12,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 300,
                Symbol("mark") => 100,
                Symbol("index") => 100
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("fetchCurrencies") => Dict{Symbol, Any}(
                Symbol("private") => true
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "default"
            )
        )
    ),
    Symbol("currencies") => Dict{Symbol, Any}(
        Symbol("USD") => self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => "USD",
    Symbol("code") => "USD",
    Symbol("precision") => self.parseNumber("0.0001")
)),
        Symbol("EUR") => self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => "EUR",
    Symbol("code") => "EUR",
    Symbol("precision") => self.parseNumber("0.0001")
)),
        Symbol("AED") => self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => "AED",
    Symbol("code") => "AED",
    Symbol("precision") => self.parseNumber("0.0001")
)),
        Symbol("GBP") => self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => "GBP",
    Symbol("code") => "GBP",
    Symbol("precision") => self.parseNumber("0.0001")
)),
        Symbol("AUD") => self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => "AUD",
    Symbol("code") => "AUD",
    Symbol("precision") => self.parseNumber("0.0001")
))
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("AE") => "AET"
    ),
    Symbol("rollingWindowSize") => 0
))

end
function handleMarketTypeAndParams(self::Okx, methodName, market=nothing, params=Dict(), defaultValue=nothing)
    instType = safeString(params, "instType");
    params = omit(params, "instType");
    type_var = safeString(params, "type");
    if functions.ccxtruthy(@functions.ccxt_and((type_var == nothing), (instType != nothing)))
        params[Symbol("type")] = instType;
    end
    return handleMarketTypeAndParams(self.parent, methodName, market, params, defaultValue)

end
function convertToInstrumentType(self::Okx, type_var)
    exchangeTypes = self.safeDict(self.options, "exchangeType", Dict{Symbol, Any}());
    return safeString(exchangeTypes, type_var, type_var)

end
function createExpiredOptionMarket(self::Okx, symbol)
    quote_var = "USD";
    optionParts = split(symbol, "-");
    symbolBase = split(symbol, "/");
    base = nothing;
    if functions.ccxtruthy(findfirst("/", symbol) !== nothing)
        base = safeString(symbolBase, 0);
    else
        base = safeString(optionParts, 0);
    end
    settle = base;
    expiry = safeString(optionParts, 2);
    strike = safeString(optionParts, 3);
    optionType = safeString(optionParts, 4);
    datetime = functions.ccxtruthy((expiry == nothing)) ? nothing : self.convertExpireDate(expiry);
    timestamp = self.parse8601(datetime);
    return Dict{Symbol, Any}(
    Symbol("id") => string(base, "-", quote_var, "-", expiry, "-", strike, "-", optionType),
    Symbol("symbol") => string(base, "/", quote_var, ":", settle, "-", expiry, "-", strike, "-", optionType),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => base,
    Symbol("quoteId") => quote_var,
    Symbol("settleId") => settle,
    Symbol("active") => false,
    Symbol("type") => "option",
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("spot") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => true,
    Symbol("margin") => false,
    Symbol("contract") => true,
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => timestamp,
    Symbol("expiryDatetime") => datetime,
    Symbol("optionType") => functions.ccxtruthy((optionType == "C")) ? "call" : "put",
    Symbol("strike") => self.parseNumber(strike),
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
function safeMarket(self::Okx, marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    isOption = false;
    if functions.ccxtruthy(marketId != nothing)
        parts = split(marketId, "-");
        partsLength = length(parts);
        isOption = @functions.ccxt_and((functions.ccxt_gt(partsLength, 3)),         (@functions.ccxt_or(endswith(marketId, "-C"), endswith(marketId, "-P"))));
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(isOption, (marketId != nothing)), (@functions.ccxt_or((self.markets_by_id == nothing), !functions.ccxtruthy((ccxt_in(marketId, self.markets_by_id)))))))
            return self.createExpiredOptionMarket(marketId)
    end
    return safeMarket(self.parent, marketId, market, delimiter, marketType)

end
function fetchStatus(self::Okx, params=Dict())
    response = Base.fetch(self.publicGetSystemStatus(params));
    data = self.safeList(response, "data", []);
    dataLength = length(data);
    update = Dict{Symbol, Any}(
        Symbol("updated") => nothing,
        Symbol("status") => functions.ccxtruthy((dataLength == 0)) ? "ok" : "maintenance",
        Symbol("eta") => nothing,
        Symbol("url") => nothing,
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        event = get(data, i + 1, nothing);
        state = safeString(event, "state");
        update[Symbol("eta")] = safeInteger(event, "end");
        update[Symbol("url")] = safeString(event, "href");
        if functions.ccxtruthy(state == "ongoing")
            update[Symbol("status")] = "maintenance";
        elseif functions.ccxtruthy(state == "scheduled")
            update[Symbol("status")] = "ok";
        else
            if functions.ccxtruthy(state == "completed")
                update[Symbol("status")] = "ok";
            elseif functions.ccxtruthy(state == "canceled")
                update[Symbol("status")] = "ok";
            end

        end
        i += 1
    end
    return update

end
function fetchTime(self::Okx, params=Dict())
    response = Base.fetch(self.publicGetPublicTime(params));
    data = self.safeList(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    return safeInteger(first_var, "ts")

end
function fetchAccounts(self::Okx, params=Dict())
    response = Base.fetch(self.privateGetAccountConfig(params));
    data = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        account = get(data, i + 1, nothing);
        accountId = safeString(account, "uid");
        type_var = safeString(account, "acctLv");
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => accountId,
    Symbol("type") => type_var,
    Symbol("currency") => nothing,
    Symbol("info") => account,
    Symbol("code") => nothing
));
        i += 1
    end
    return result

end
function nonce(self::Okx, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function fetchMarkets(self::Okx, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    types = ["spot", "future", "swap", "option"];
    fetchMarketsOption = self.safeDict(self.options, "fetchMarkets");
    if functions.ccxtruthy(fetchMarketsOption != nothing)
        types = self.safeList(fetchMarketsOption, "types", types);
    else
        types = self.safeList(self.options, "fetchMarkets", types);
    end
    promises = [];
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(types)))
        push!(promises, self.fetchMarketsByType(get(types, i + 1, nothing), params));
        i += 1
    end
    promises = Base.fetch(asyncmap(Base.fetch, promises));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(promises)))
        result = arrayConcat(result, get(promises, i + 1, nothing));
        i += 1
    end
    return result

end
function parseMarket(self::Okx, market)
    id = safeString(market, "instId", "");
    type_var = safeStringLower(market, "instType");
    if functions.ccxtruthy(type_var == "futures")
        type_var = "future";
    end
    spot = (type_var == "spot");
    future = (type_var == "future");
    swap = (type_var == "swap");
    option = (type_var == "option");
    contract = @functions.ccxt_or(@functions.ccxt_or(swap, future), option);
    baseId = safeString(market, "baseCcy", "");
    quoteId = safeString(market, "quoteCcy", "");
    settleId = safeString(market, "settleCcy");
    settle = self.safeCurrencyCode(settleId);
    underlying = safeString(market, "uly");
    if functions.ccxtruthy(@functions.ccxt_and((underlying != nothing), !functions.ccxtruthy(spot)))
        parts = split(underlying, "-");
        baseId = safeString(parts, 0, "");
        quoteId = safeString(parts, 1, "");
    end
    if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or((baseId == ""), (quoteId == ""))), spot))
        instId = safeString(market, "instId", "");
        parts = split(instId, "-");
        baseId = safeString(parts, 0, "");
        quoteId = safeString(parts, 1, "");
    end
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    symbol = string(base, "/", quote_var);
    if functions.ccxtruthy(@functions.ccxt_or(base == "", quote_var == ""))
        symbol = id;
    end
    expiry = nothing;
    strikePrice = nothing;
    optionType = nothing;
    if functions.ccxtruthy(contract)
        if functions.ccxtruthy(settle != nothing)
            symbol = string(symbol, ":", settle);
        end
        if functions.ccxtruthy(future)
            expiry = safeInteger(market, "expTime");
            if functions.ccxtruthy(expiry != nothing)
                ymd = self.yymmdd(expiry);
                symbol = string(symbol, "-", ymd);
            end
        elseif functions.ccxtruthy(option)
            expiry = safeInteger(market, "expTime");
            strikePrice = safeString(market, "stk");
            optionType = safeString(market, "optType");
            if functions.ccxtruthy(expiry != nothing)
                ymd = self.yymmdd(expiry);
                symbol = string(symbol, "-", ymd, "-", strikePrice, "-", optionType);
                optionType = functions.ccxtruthy((optionType == "P")) ? "put" : "call";
            end
        end
    end
    feesType = functions.ccxtruthy((type_var == nothing)) ? "" : type_var;
    fees = self.safeDict2(self.fees, feesType, "trading", Dict{Symbol, Any}());
    maxLeverage = safeString(market, "lever", "1");
    maxLeverage = stringMax(maxLeverage, "1");
    maxSpotCost = self.safeNumber(market, "maxMktSz");
    leverageAboveOne = stringGt(maxLeverage, "1");
    quoteEqualSettle = (quoteId == settleId);
    baseEqualSettle = (baseId == settleId);
    status = safeString(market, "state");
    instIdCode = safeInteger(market, "instIdCode");
    return extend(fees, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("instIdCode") => instIdCode,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => @functions.ccxt_and(spot, leverageAboveOne),
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => option,
    Symbol("active") => status == "live",
    Symbol("contract") => contract,
    Symbol("linear") => functions.ccxtruthy(contract) ? quoteEqualSettle : nothing,
    Symbol("inverse") => functions.ccxtruthy(contract) ? baseEqualSettle : nothing,
    Symbol("contractSize") => functions.ccxtruthy(contract) ? self.safeNumber(market, "ctVal") : nothing,
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => self.parseNumber(strikePrice),
    Symbol("optionType") => optionType,
    Symbol("created") => safeInteger2(market, "contTdSwTime", "listTime"),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "lotSz"),
        Symbol("price") => self.safeNumber(market, "tickSz")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.parseNumber(maxLeverage)
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minSz"),
            Symbol("max") => self.safeNumber(market, "maxLmtSz")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => functions.ccxtruthy(contract) ? nothing : maxSpotCost
        )
    ),
    Symbol("info") => market
))

end
function fetchMarketsByType(self::Okx, type_var, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(type_var)
    );
    if functions.ccxtruthy(type_var == "option")
        optionsUnderlying = self.safeList(self.options, "defaultUnderlying", ["BTC-USD", "ETH-USD"]);
        promises = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(optionsUnderlying)))
            underlying = get(optionsUnderlying, i + 1, nothing);
            request[Symbol("uly")] = underlying;
            push!(promises, self.publicGetPublicInstruments(extend(request, params)));
            i += 1
        end

        promisesResult = Base.fetch(asyncmap(Base.fetch, promises));
        markets = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(promisesResult)))
            res = self.safeDict(promisesResult, i, Dict{Symbol, Any}());
            options = self.safeList(res, "data", []);
            markets = arrayConcat(markets, options);
            i += 1
        end

            return self.parseMarkets(markets)
    end
    response = Base.fetch(self.publicGetPublicInstruments(extend(request, params)));
    dataResponse = self.safeList(response, "data", []);
    marketsWithoutTest = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(dataResponse)))
        data = get(dataResponse, i + 1, nothing);
        instId = safeString(data, "instId", "");
        if functions.ccxtruthy(instId == "")
            i += 1; continue
        end
        if functions.ccxtruthy(self.isSandboxModeEnabled)
            instFamily = safeString(data, "instFamily", "");
            if functions.ccxtruthy(startswith(instFamily, "TEST"))
                i += 1; continue
            end
        end
        push!(marketsWithoutTest, data);
        i += 1
    end
    return self.parseMarkets(marketsWithoutTest)

end
function fetchCurrencies(self::Okx, params=Dict())
    isSandboxMode = self.safeBool(self.options, "sandboxMode", false);
    if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(self.checkRequiredCredentials(false)), isSandboxMode))
            return Dict{Symbol, Any}()
    end
    response = Base.fetch(self.privateGetAssetCurrencies(params));
    data = self.safeList(response, "data", []);
    dataByCurrencyId = groupBy(data, "ccy");
    currencies = objectValues(dataByCurrencyId);
    return self.parseCurrencies(currencies)

end
function parseCurrency(self::Okx, currency)
    chains = currency;
    firstChain = self.safeDict(chains, 0, Dict{Symbol, Any}());
    currencyId = safeString(firstChain, "ccy");
    code = self.safeCurrencyCode(currencyId);
    networks = Dict{Symbol, Any}();
    type_var = "crypto";
    chainsLength = length(chains);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, chainsLength))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "chain", "");
        if functions.ccxtruthy(networkId == "")
            type_var = "fiat";
        end
        idParts = split(networkId, "-");
        parts = self.arraySlice(idParts, 1);
        chainPart = join(parts, "-");
        networkCode = self.networkIdToCode(chainPart, code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("active") => nothing,
                Symbol("deposit") => self.safeBool(chain, "canDep"),
                Symbol("withdraw") => self.safeBool(chain, "canWd"),
                Symbol("fee") => self.safeNumber(chain, "fee"),
                Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(chain, "wdTickSz"))),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(chain, "minWd"),
                        Symbol("max") => self.safeNumber(chain, "maxWd")
                    )
                ),
                Symbol("info") => chain
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => chains,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("name") => safeString(firstChain, "name"),
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("type") => type_var,
    Symbol("networks") => networks
))

end
function fetchOrderBook(self::Okx, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "fetchOrderBook", "method", "publicGetMarketBooks");
    if functions.ccxtruthy(@functions.ccxt_and(method == "publicGetMarketBooksFull", limit == nothing))
        limit = 5000;
    end
    limit = functions.ccxtruthy((limit == nothing)) ? 100 : limit;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("sz")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((method == "publicGetMarketBooksFull"), (functions.ccxt_gt(limit, 400))))
        response = Base.fetch(self.publicGetMarketBooksFull(extend(request, params)));
    else
        response = Base.fetch(self.publicGetMarketBooks(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    timestamp = safeInteger(first_var, "ts");
    return self.parseOrderBook(first_var, symbol, timestamp)

end
function parseTicker(self::Okx, ticker, market=nothing)
    instType = safeString(ticker, "instType");
    marketType = nothing;
    if functions.ccxtruthy(instType != nothing)
        marketType = functions.ccxtruthy((instType == "SPOT")) ? "spot" : "swap";
    end
    timestamp = safeInteger(ticker, "ts");
    marketId = safeString(ticker, "instId");
    market = self.safeMarket(marketId, market, "-", marketType);
    symbol = get(market, Symbol("symbol"), nothing);
    last_var = safeString(ticker, "last");
    open = safeString(ticker, "open24h");
    spot = self.safeBool(market, "spot", false);
    quoteVolume = functions.ccxtruthy(spot) ? safeString(ticker, "volCcy24h") : nothing;
    baseVolume = safeString(ticker, "vol24h");
    high = safeString(ticker, "high24h");
    low = safeString(ticker, "low24h");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bid") => safeString(ticker, "bidPx"),
    Symbol("bidVolume") => safeString(ticker, "bidSz"),
    Symbol("ask") => safeString(ticker, "askPx"),
    Symbol("askVolume") => safeString(ticker, "askSz"),
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => safeString(ticker, "markPx"),
    Symbol("indexPrice") => safeString(ticker, "idxPx"),
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Okx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketTicker(extend(request, params)));
    data = self.safeList(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTicker(first_var, market)

end
function fetchTickers(self::Okx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    market = self.getMarketFromSymbols(symbols);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(marketType)
    );
    if functions.ccxtruthy(marketType == "option")
        defaultUnderlying = safeString(self.options, "defaultUnderlying", "BTC-USD");
        currencyId = safeString2(params, "uly", "marketId", defaultUnderlying);
        if functions.ccxtruthy(currencyId == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchTickers() requires an underlying uly or marketId parameter for options markets")));
        else
            request[Symbol("uly")] = currencyId;
        end
    end
    response = Base.fetch(self.publicGetMarketTickers(extend(request, params)));
    tickers = self.safeList(response, "data", []);
    return self.parseTickers(tickers, symbols)

end
function fetchMarkPrice(self::Okx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetPublicMarkPrice(extend(request, params)));
    data = self.safeList(response, "data");
    return self.parseTicker(self.safeDict(data, 0), market)

end
function fetchMarkPrices(self::Okx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    market = self.getMarketFromSymbols(symbols);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchMarkPrices", market, params, "swap");
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(marketType)
    );
    if functions.ccxtruthy(marketType == "option")
        defaultUnderlying = safeString(self.options, "defaultUnderlying", "BTC-USD");
        currencyId = safeString2(params, "uly", "marketId", defaultUnderlying);
        if functions.ccxtruthy(currencyId == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchMarkPrices() requires an underlying uly or marketId parameter for options markets")));
        else
            request[Symbol("uly")] = currencyId;
        end
    end
    response = Base.fetch(self.publicGetPublicMarkPrice(extend(request, params)));
    tickers = self.safeList(response, "data", []);
    return self.parseTickers(tickers, symbols)

end
function parseTrade(self::Okx, trade, market=nothing)
    id = safeString(trade, "tradeId");
    marketId = safeString(trade, "instId");
    market = self.safeMarket(marketId, market, "-");
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(trade, "ts");
    price = safeString2(trade, "fillPx", "px");
    amount = safeString2(trade, "fillSz", "sz");
    side = safeString(trade, "side");
    orderId = safeString(trade, "ordId");
    feeCostString = safeString(trade, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCostSigned = stringNeg(feeCostString);
        feeCurrencyId = safeString(trade, "feeCcy");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostSigned,
            Symbol("currency") => feeCurrencyCode
        );
    end
    takerOrMaker = safeString(trade, "execType");
    if functions.ccxtruthy(takerOrMaker == "T")
        takerOrMaker = "taker";
    elseif functions.ccxtruthy(takerOrMaker == "M")
        takerOrMaker = "maker";
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => fee
), market)

end
function fetchTrades(self::Okx, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchTrades", symbol, since, limit, params, "tradeId", "after", nothing, 100))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        response = Base.fetch(self.publicGetPublicOptionTrades(extend(request, params)));
    else
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        method = nothing;
        (method, params) = self.handleOptionAndParams(params, "fetchTrades", "method", "publicGetMarketTrades");
        if functions.ccxtruthy(method == "publicGetMarketTrades")
            response = Base.fetch(self.publicGetMarketTrades(extend(request, params)));
        elseif functions.ccxtruthy(method == "publicGetMarketHistoryTrades")
            response = Base.fetch(self.publicGetMarketHistoryTrades(extend(request, params)));
        end
    end
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit)

end
function parseOHLCV(self::Okx, ohlcv, market=nothing)
    res = self.handleMarketTypeAndParams("fetchOHLCV", market, nothing);
    type_var = get(res, 1, nothing);
    volumeIndex = functions.ccxtruthy((type_var == "spot")) ? 5 : 6;
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, volumeIndex)]

end
function fetchOHLCV(self::Okx, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 200))
    end
    priceType = safeString(params, "price");
    isMarkOrIndex = inArray(priceType, ["mark", "index"]);
    params = omit(params, "price");
    options = self.safeDict(self.options, "fetchOHLCV", Dict{Symbol, Any}());
    timezone = safeString(options, "timezone", "UTC");
    limitIsUndefined = (limit == nothing);
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    else
        maxLimit = functions.ccxtruthy(isMarkOrIndex) ? 100 : 300;
        limit = min(limit, maxLimit);
    end
    duration = self.parseTimeframe(timeframe);
    bar = safeString(self.timeframes, timeframe, timeframe);
    if functions.ccxtruthy(@functions.ccxt_and((timezone == "UTC"), (functions.ccxt_ge(duration, 21600))))
        bar += lowercase(timezone);
    end
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("bar") => bar,
        Symbol("limit") => limit
    );
    defaultType = "Candles";
    if functions.ccxtruthy(since != nothing)
        now = milliseconds();
        durationInMilliseconds = duration * 1000;
        historyBorder = now - ((1440 - 1) * durationInMilliseconds);
        if functions.ccxtruthy(functions.ccxt_lt(since, historyBorder))
            defaultType = "HistoryCandles";
            maxLimit = functions.ccxtruthy(isMarkOrIndex) ? 100 : 300;
            limit = min(limit, maxLimit);
        end
        startTime = max(since - 1, 0);
        request[Symbol("before")] = startTime;
        request[Symbol("after")] = self.sum(since, durationInMilliseconds * limit);
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("after")] = until;
        params = omit(params, "until");
    end
    defaultType = safeString(options, "type", defaultType);
    type_var = safeString(params, "type", defaultType);
    params = omit(params, "type");
    isHistoryCandles = (type_var == "HistoryCandles");
    response = nothing;
    if functions.ccxtruthy(priceType == "mark")
        if functions.ccxtruthy(isHistoryCandles)
            response = Base.fetch(self.publicGetMarketHistoryMarkPriceCandles(extend(request, params)));
        else
            response = Base.fetch(self.publicGetMarketMarkPriceCandles(extend(request, params)));
        end
    elseif functions.ccxtruthy(priceType == "index")
        request[Symbol("instId")] = get(get(market, Symbol("info"), nothing), Symbol("instFamily"), nothing);
        if functions.ccxtruthy(isHistoryCandles)
            response = Base.fetch(self.publicGetMarketHistoryIndexCandles(extend(request, params)));
        else
            response = Base.fetch(self.publicGetMarketIndexCandles(extend(request, params)));
        end
    else
        if functions.ccxtruthy(isHistoryCandles)
            if functions.ccxtruthy(@functions.ccxt_and(limitIsUndefined, (limit == 100)))
                limit = 300;
                request[Symbol("limit")] = 300;
            end
            response = Base.fetch(self.publicGetMarketHistoryCandles(extend(request, params)));
        else
            response = Base.fetch(self.publicGetMarketCandles(extend(request, params)));
        end
    end
    data = self.safeList(response, "data", []);
    return self.parseOHLCVs(data, market, timeframe, since, limit)

end
function fetchFundingRateHistory(self::Okx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol, since, limit, "8h", params, 100))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = max(since - 1, 0);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetPublicFundingRateHistory(extend(request, params)));
    rates = [];
    data = self.safeList(response, "data", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        rate = get(data, i + 1, nothing);
        timestamp = safeInteger(rate, "fundingTime");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => rate,
    Symbol("symbol") => self.safeSymbol(safeString(rate, "instId")),
    Symbol("fundingRate") => self.safeNumber(rate, "realizedRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, get(market, Symbol("symbol"), nothing), since, limit)

end
function parseBalanceByType(self::Okx, type_var, response)
    if functions.ccxtruthy(type_var == "funding")
            return self.parseFundingBalance(response)
    else
        return self.parseTradingBalance(response)
    end

end
function parseTradingBalance(self::Okx, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    data = self.safeList(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    timestamp = safeInteger(first_var, "uTime");
    details = self.safeList(first_var, "details", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(details)))
        balance = get(details, i + 1, nothing);
        currencyId = safeString(balance, "ccy");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        eq = safeString(balance, "eq");
        availEq = safeString(balance, "availEq");
        account[Symbol("total")] = eq;
        if functions.ccxtruthy(availEq == nothing)
            account[Symbol("free")] = safeString(balance, "availBal");
            account[Symbol("used")] = safeString(balance, "frozenBal");
        else
            account[Symbol("free")] = availEq;
        end
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    result[Symbol("timestamp")] = timestamp;
    result[Symbol("datetime")] = self.iso8601(timestamp);
    return self.safeBalance(result)

end
function parseFundingBalance(self::Okx, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    data = self.safeList(response, "data", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        balance = get(data, i + 1, nothing);
        currencyId = safeString(balance, "ccy");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("total")] = safeString(balance, "bal");
        account[Symbol("free")] = safeString(balance, "availBal");
        account[Symbol("used")] = safeString(balance, "frozenBal");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function parseTradingFee(self::Okx, fee, market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => self.safeSymbol(nothing, market),
    Symbol("maker") => self.parseNumber(stringNeg(safeString2(fee, "maker", "makerU"))),
    Symbol("taker") => self.parseNumber(stringNeg(safeString2(fee, "taker", "takerU"))),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchTradingFee(self::Okx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(get(market, Symbol("type"), nothing))
    );
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(get(market, Symbol("swap"), nothing), get(market, Symbol("future"), nothing)), get(market, Symbol("option"), nothing)))
        request[Symbol("uly")] = string(get(market, Symbol("baseId"), nothing), "-", get(market, Symbol("quoteId"), nothing));
    else
        throw(NotSupported(string(self.id, " fetchTradingFee() supports spot, swap, future or option markets only")));
    end
    response = Base.fetch(self.privateGetAccountTradeFee(extend(request, params)));
    data = self.safeList(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTradingFee(first_var, market)

end
function fetchBalance(self::Okx, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (marketType, query) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(marketType == "funding")
        response = Base.fetch(self.privateGetAssetBalances(extend(request, query)));
    else
        response = Base.fetch(self.privateGetAccountBalance(extend(request, query)));
    end
    return self.parseBalanceByType(marketType, response)

end
function createMarketBuyOrderWithCost(self::Okx, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot markets only")));
    end
    req = Dict{Symbol, Any}(
        Symbol("createMarketBuyOrderRequiresPrice") => false,
        Symbol("tgtCcy") => "quote_ccy"
    );
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, nothing, extend(req, params)))

end
function createMarketSellOrderWithCost(self::Okx, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketSellOrderWithCost() supports spot markets only")));
    end
    req = Dict{Symbol, Any}(
        Symbol("createMarketBuyOrderRequiresPrice") => false,
        Symbol("tgtCcy") => "quote_ccy"
    );
    return Base.fetch(self.createOrder(symbol, "market", "sell", cost, nothing, extend(req, params)))

end
function createOrderRequest(self::Okx, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    takeProfitPrice = safeValue2(params, "takeProfitPrice", "tpTriggerPx");
    stopLossPrice = safeValue2(params, "stopLossPrice", "slTriggerPx");
    conditional = @functions.ccxt_or(@functions.ccxt_or((stopLossPrice != nothing), (takeProfitPrice != nothing)), (type_var == "conditional"));
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("ordType") => type_var
    );
    isConditionalOrOCO = @functions.ccxt_or(conditional, (type_var == "oco"));
    closeFraction = safeString(params, "closeFraction");
    shouldOmitSize = @functions.ccxt_and(isConditionalOrOCO, closeFraction != nothing);
    if functions.ccxtruthy(!functions.ccxtruthy(shouldOmitSize))
        request[Symbol("sz")] = self.amountToPrecision(symbol, amount);
    end
    spot = get(market, Symbol("spot"), nothing);
    contract = get(market, Symbol("contract"), nothing);
    triggerPrice = safeValueN(params, ["triggerPrice", "stopPrice", "triggerPx"]);
    timeInForce = safeString(params, "timeInForce", "GTC");
    tpOrdPx = safeValue(params, "tpOrdPx", price);
    tpTriggerPxType = safeString(params, "tpTriggerPxType", "last");
    slOrdPx = safeValue(params, "slOrdPx", price);
    slTriggerPxType = safeString(params, "slTriggerPxType", "last");
    clientOrderId = safeString2(params, "clOrdId", "clientOrderId");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    hasStopLoss = (stopLoss != nothing);
    hasTakeProfit = (takeProfit != nothing);
    trailingPercent = safeString2(params, "trailingPercent", "callbackRatio");
    isTrailingPercentOrder = trailingPercent != nothing;
    trailingPrice = safeString2(params, "trailingPrice", "callbackSpread");
    isTrailingPriceOrder = trailingPrice != nothing;
    trigger = @functions.ccxt_or((triggerPrice != nothing), (type_var == "trigger"));
    isReduceOnly = @functions.ccxt_or(safeValue(params, "reduceOnly", false), (closeFraction != nothing));
    defaultMarginMode = safeString2(self.options, "defaultMarginMode", "marginMode", "cross");
    marginMode = safeString2(params, "marginMode", "tdMode");
    margin = false;
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != nothing), (marginMode != "cash")))
        margin = true;
    else
        marginMode = defaultMarginMode;
        margin = self.safeBool(params, "margin", false);
    end
    if functions.ccxtruthy(spot)
        if functions.ccxtruthy(margin)
            defaultCurrency = functions.ccxtruthy((side == "buy")) ? get(market, Symbol("quote"), nothing) : get(market, Symbol("base"), nothing);
            currency = safeString(params, "ccy", defaultCurrency);
            request[Symbol("ccy")] = self.safeCurrencyCode(currency);
        end
        tradeMode = functions.ccxtruthy(margin) ? marginMode : "cash";
        request[Symbol("tdMode")] = tradeMode;
    elseif functions.ccxtruthy(contract)
        if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("swap"), nothing), get(market, Symbol("future"), nothing)))
            positionSide = nothing;
            (positionSide, params) = self.handleOptionAndParams(params, "createOrder", "positionSide");
            if functions.ccxtruthy(positionSide != nothing)
                request[Symbol("posSide")] = positionSide;
            else
                hedged = nothing;
                (hedged, params) = self.handleOptionAndParams(params, "createOrder", "hedged");
                if functions.ccxtruthy(hedged)
                    isBuy = (side == "buy");
                    isProtective = @functions.ccxt_or(@functions.ccxt_or((takeProfitPrice != nothing), (stopLossPrice != nothing)), isReduceOnly);
                    if functions.ccxtruthy(isProtective)
                        request[Symbol("posSide")] = functions.ccxtruthy(isBuy) ? "short" : "long";
                        if functions.ccxtruthy(isReduceOnly)
                            params = omit(params, "reduceOnly");
                        end
                    else
                        request[Symbol("posSide")] = functions.ccxtruthy(isBuy) ? "long" : "short";
                    end
                end
            end
        end
        request[Symbol("tdMode")] = marginMode;
    end
    isMarketOrder = type_var == "market";
    postOnly = false;
    (postOnly, params) = self.handlePostOnly(isMarketOrder, type_var == "post_only", params);
    params = omit(params, ["currency", "ccy", "marginMode", "timeInForce", "stopPrice", "triggerPrice", "clientOrderId", "stopLossPrice", "takeProfitPrice", "slOrdPx", "tpOrdPx", "margin", "stopLoss", "takeProfit", "trailingPercent"]);
    ioc = @functions.ccxt_or((timeInForce == "IOC"), (type_var == "ioc"));
    fok = @functions.ccxt_or((timeInForce == "FOK"), (type_var == "fok"));
    marketIOC = @functions.ccxt_or((@functions.ccxt_and(isMarketOrder, ioc)), (type_var == "optimal_limit_ioc"));
    defaultTgtCcy = safeString(self.options, "tgtCcy", "base_ccy");
    tgtCcy = safeString(params, "tgtCcy", defaultTgtCcy);
    if functions.ccxtruthy(@functions.ccxt_and((!functions.ccxtruthy(contract)), (!functions.ccxtruthy(margin))))
        request[Symbol("tgtCcy")] = tgtCcy;
    end
    if functions.ccxtruthy(@functions.ccxt_or(isMarketOrder, marketIOC))
        request[Symbol("ordType")] = "market";
        if functions.ccxtruthy(@functions.ccxt_and(spot, (side == "buy")))
            if functions.ccxtruthy(tgtCcy == "quote_ccy")
                createMarketBuyOrderRequiresPrice = true;
                (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", true);
                notional = self.safeNumber2(params, "cost", "sz");
                params = omit(params, ["cost", "sz"]);
                if functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                    if functions.ccxtruthy(price != nothing)
                        if functions.ccxtruthy(notional == nothing)
                            amountString = numberToString(amount);
                            priceString = numberToString(price);
                            quoteAmount = stringMul(amountString, priceString);
                            notional = self.parseNumber(quoteAmount);
                        end
                    elseif functions.ccxtruthy(notional == nothing)
                        throw(InvalidOrder(string(self.id, " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'cost' unified extra parameter or in exchange-specific 'sz' extra parameter (the exchange-specific behaviour)")));
                    end
                else
                    notional = functions.ccxtruthy((notional == nothing)) ? amount : notional;
                end
                request[Symbol("sz")] = self.costToPrecision(symbol, notional);
            end
        end
        if functions.ccxtruthy(@functions.ccxt_and(marketIOC, contract))
            request[Symbol("ordType")] = "optimal_limit_ioc";
        end
    else
        if functions.ccxtruthy(@functions.ccxt_and((!functions.ccxtruthy(trigger)), (!functions.ccxtruthy(conditional))))
            request[Symbol("px")] = self.priceToPrecision(symbol, price);
        end
    end
    if functions.ccxtruthy(postOnly)
        request[Symbol("ordType")] = "post_only";
    elseif functions.ccxtruthy(@functions.ccxt_and(ioc, !functions.ccxtruthy(marketIOC)))
        request[Symbol("ordType")] = "ioc";
    else
        if functions.ccxtruthy(fok)
            request[Symbol("ordType")] = "fok";
        end

    end
    if functions.ccxtruthy(isTrailingPercentOrder)
        convertedTrailingPercent = stringDiv(trailingPercent, "100");
        request[Symbol("callbackRatio")] = convertedTrailingPercent;
        request[Symbol("ordType")] = "move_order_stop";
    elseif functions.ccxtruthy(isTrailingPriceOrder)
        request[Symbol("callbackSpread")] = trailingPrice;
        request[Symbol("ordType")] = "move_order_stop";
    else
        if functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
            attachAlgoOrd = Dict{Symbol, Any}();
            if functions.ccxtruthy(hasStopLoss)
                stopLossTriggerPrice = safeValueN(stopLoss, ["triggerPrice", "stopPrice", "slTriggerPx"]);
                if functions.ccxtruthy(stopLossTriggerPrice == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires a trigger price in params[\"stopLoss\"][\"triggerPrice\"], or params[\"stopLoss\"][\"stopPrice\"], or params[\"stopLoss\"][\"slTriggerPx\"] for a stop loss order")));
                end
                slTriggerPx = self.priceToPrecision(symbol, stopLossTriggerPrice);
                slOrder = Dict{Symbol, Any}();
                slOrder[Symbol("slTriggerPx")] = slTriggerPx;
                stopLossLimitPrice = safeValueN(stopLoss, ["price", "stopLossPrice", "slOrdPx"]);
                stopLossOrderType = safeString(stopLoss, "type");
                if functions.ccxtruthy(stopLossOrderType != nothing)
                    stopLossLimitOrderType = (stopLossOrderType == "limit");
                    stopLossMarketOrderType = (stopLossOrderType == "market");
                    if functions.ccxtruthy(@functions.ccxt_and((!functions.ccxtruthy(stopLossLimitOrderType)), (!functions.ccxtruthy(stopLossMarketOrderType))))
                        throw(InvalidOrder(string(self.id, " createOrder() params[\"stopLoss\"][\"type\"] must be either \"limit\" or \"market\"")));
                    elseif functions.ccxtruthy(stopLossLimitOrderType)
                        if functions.ccxtruthy(stopLossLimitPrice == nothing)
                            throw(InvalidOrder(string(self.id, " createOrder() requires a limit price in params[\"stopLoss\"][\"price\"] or params[\"stopLoss\"][\"slOrdPx\"] for a stop loss limit order")));
                        else
                            slOrder[Symbol("slOrdPx")] = self.priceToPrecision(symbol, stopLossLimitPrice);
                        end
                    else
                        if functions.ccxtruthy(stopLossOrderType == "market")
                            slOrder[Symbol("slOrdPx")] = "-1";
                        end

                    end
                elseif functions.ccxtruthy(stopLossLimitPrice != nothing)
                    slOrder[Symbol("slOrdPx")] = self.priceToPrecision(symbol, stopLossLimitPrice);
                else
                    slOrder[Symbol("slOrdPx")] = "-1";
                end
                stopLossTriggerPriceType = safeString2(stopLoss, "triggerPriceType", "slTriggerPxType", "last");
                if functions.ccxtruthy(stopLossTriggerPriceType != nothing)
                    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((stopLossTriggerPriceType != "last"), (stopLossTriggerPriceType != "index")), (stopLossTriggerPriceType != "mark")))
                        throw(InvalidOrder(string(self.id, " createOrder() stop loss trigger price type must be one of \"last\", \"index\" or \"mark\"")));
                    end
                    slOrder[Symbol("slTriggerPxType")] = stopLossTriggerPriceType;
                end
                attachAlgoOrd = extend(attachAlgoOrd, slOrder);
            end
            if functions.ccxtruthy(hasTakeProfit)
                takeProfitTriggerPrice = safeValueN(takeProfit, ["triggerPrice", "stopPrice", "tpTriggerPx"]);
                if functions.ccxtruthy(takeProfitTriggerPrice == nothing)
                    throw(InvalidOrder(string(self.id, " createOrder() requires a trigger price in params[\"takeProfit\"][\"triggerPrice\"], or params[\"takeProfit\"][\"stopPrice\"], or params[\"takeProfit\"][\"tpTriggerPx\"] for a take profit order")));
                end
                tpOrder = Dict{Symbol, Any}();
                tpOrder[Symbol("tpTriggerPx")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
                takeProfitLimitPrice = safeValueN(takeProfit, ["price", "takeProfitPrice", "tpOrdPx"]);
                takeProfitOrderType = safeString2(takeProfit, "type", "tpOrdKind");
                if functions.ccxtruthy(takeProfitOrderType != nothing)
                    takeProfitLimitOrderType = (takeProfitOrderType == "limit");
                    takeProfitMarketOrderType = (takeProfitOrderType == "market");
                    if functions.ccxtruthy(@functions.ccxt_and((!functions.ccxtruthy(takeProfitLimitOrderType)), (!functions.ccxtruthy(takeProfitMarketOrderType))))
                        throw(InvalidOrder(string(self.id, " createOrder() params[\"takeProfit\"][\"type\"] must be either \"limit\" or \"market\"")));
                    elseif functions.ccxtruthy(takeProfitLimitOrderType)
                        if functions.ccxtruthy(takeProfitLimitPrice == nothing)
                            throw(InvalidOrder(string(self.id, " createOrder() requires a limit price in params[\"takeProfit\"][\"price\"] or params[\"takeProfit\"][\"tpOrdPx\"] for a take profit limit order")));
                        else
                            tpOrder[Symbol("tpOrdKind")] = takeProfitOrderType;
                            tpOrder[Symbol("tpOrdPx")] = self.priceToPrecision(symbol, takeProfitLimitPrice);
                        end
                    else
                        if functions.ccxtruthy(takeProfitOrderType == "market")
                            tpOrder[Symbol("tpOrdPx")] = "-1";
                        end

                    end
                elseif functions.ccxtruthy(takeProfitLimitPrice != nothing)
                    tpOrder[Symbol("tpOrdKind")] = "limit";
                    tpOrder[Symbol("tpOrdPx")] = self.priceToPrecision(symbol, takeProfitLimitPrice);
                else
                    tpOrder[Symbol("tpOrdPx")] = "-1";
                end
                takeProfitTriggerPriceType = safeString2(takeProfit, "triggerPriceType", "tpTriggerPxType", "last");
                if functions.ccxtruthy(takeProfitTriggerPriceType != nothing)
                    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((takeProfitTriggerPriceType != "last"), (takeProfitTriggerPriceType != "index")), (takeProfitTriggerPriceType != "mark")))
                        throw(InvalidOrder(string(self.id, " createOrder() take profit trigger price type must be one of \"last\", \"index\" or \"mark\"")));
                    end
                    tpOrder[Symbol("tpTriggerPxType")] = takeProfitTriggerPriceType;
                end
                attachAlgoOrd = extend(attachAlgoOrd, tpOrder);
            end
            attachOrdKeys = objectKeys(attachAlgoOrd);
            attachOrdLen = length(attachOrdKeys);
            if functions.ccxtruthy(functions.ccxt_gt(attachOrdLen, 0))
                request[Symbol("attachAlgoOrds")] = [attachAlgoOrd];
            end
        end

    end
    if functions.ccxtruthy(trigger)
        request[Symbol("ordType")] = "trigger";
        request[Symbol("triggerPx")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("orderPx")] = functions.ccxtruthy(isMarketOrder) ? "-1" : self.priceToPrecision(symbol, price);
    elseif functions.ccxtruthy(conditional)
        request[Symbol("ordType")] = "conditional";
        twoWayCondition = (@functions.ccxt_and((takeProfitPrice != nothing), (stopLossPrice != nothing)));
        if functions.ccxtruthy(twoWayCondition)
            request[Symbol("ordType")] = "oco";
        end
        if functions.ccxtruthy(side == "sell")
            request = omit(request, "tgtCcy");
        end
        if functions.ccxtruthy(safeString(request, "tdMode") == "cash")
            request[Symbol("tdMode")] = marginMode;
        end
        if functions.ccxtruthy(takeProfitPrice != nothing)
            request[Symbol("tpTriggerPx")] = self.priceToPrecision(symbol, takeProfitPrice);
            tpOrdPxReq = "-1";
            if functions.ccxtruthy(tpOrdPx != nothing)
                tpOrdPxReq = self.priceToPrecision(symbol, tpOrdPx);
            end
            request[Symbol("tpOrdPx")] = tpOrdPxReq;
            request[Symbol("tpTriggerPxType")] = tpTriggerPxType;
        end
        if functions.ccxtruthy(stopLossPrice != nothing)
            request[Symbol("slTriggerPx")] = self.priceToPrecision(symbol, stopLossPrice);
            slOrdPxReq = "-1";
            if functions.ccxtruthy(slOrdPx != nothing)
                slOrdPxReq = self.priceToPrecision(symbol, slOrdPx);
            end
            request[Symbol("slOrdPx")] = slOrdPxReq;
            request[Symbol("slTriggerPxType")] = slTriggerPxType;
        end
    end
    if functions.ccxtruthy(clientOrderId == nothing)
        brokerId = safeString(self.options, "brokerId");
        if functions.ccxtruthy(brokerId != nothing)
            request[Symbol("clOrdId")] = string(brokerId, uuid16());
            request[Symbol("tag")] = brokerId;
        end
    else
        request[Symbol("clOrdId")] = clientOrderId;
        params = omit(params, ["clOrdId", "clientOrderId"]);
    end
    return extend(request, params)

end
function createOrder(self::Okx, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createOrderRequest(symbol, type_var, side, amount, price, params);
    method = safeString(self.options, "createOrder", "privatePostTradeBatchOrders");
    requestOrdType = safeString(request, "ordType");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((requestOrdType == "trigger"), (requestOrdType == "conditional")), (requestOrdType == "move_order_stop")), (type_var == "move_order_stop")), (type_var == "oco")), (type_var == "iceberg")), (type_var == "twap")))
        method = "privatePostTradeOrderAlgo";
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((method != "privatePostTradeOrder"), (method != "privatePostTradeOrderAlgo")), (method != "privatePostTradeBatchOrders")))
        throw(ExchangeError(string(self.id, " createOrder() this.options[\"createOrder\"] must be either privatePostTradeBatchOrders or privatePostTradeOrder or privatePostTradeOrderAlgo")));
    end
    if functions.ccxtruthy(method == "privatePostTradeBatchOrders")
        request = [request];
    end
    response = nothing;
    if functions.ccxtruthy(method == "privatePostTradeOrder")
        response = Base.fetch(self.privatePostTradeOrder(request));
    elseif functions.ccxtruthy(method == "privatePostTradeOrderAlgo")
        response = Base.fetch(self.privatePostTradeOrderAlgo(request));
    else
        response = Base.fetch(self.privatePostTradeBatchOrders(request));
    end
    data = self.safeList(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    order = self.parseOrder(first_var, market);
    order[Symbol("type")] = type_var;
    order[Symbol("side")] = side;
    return order

end
function createOrders(self::Okx, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        if functions.ccxtruthy(marketId == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrders() requires a symbol for each order")));
        end
        type_var = safeString(rawOrder, "type", "");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        extendedParams = extend(orderParams, params);
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price, extendedParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    response = Base.fetch(self.privatePostTradeBatchOrders(ordersRequests));
    data = self.safeList(response, "data", []);
    return self.parseOrders(data)

end
function editOrderRequest(self::Okx, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    isAlgoOrder = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((type_var == "trigger"), (type_var == "conditional")), (type_var == "move_order_stop")), (type_var == "oco")), (type_var == "iceberg")), (type_var == "twap")))
        isAlgoOrder = true;
    end
    clientOrderId = safeString2(params, "clOrdId", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        if functions.ccxtruthy(isAlgoOrder)
            request[Symbol("algoClOrdId")] = clientOrderId;
        else
            request[Symbol("clOrdId")] = clientOrderId;
        end
    else
        if functions.ccxtruthy(isAlgoOrder)
            request[Symbol("algoId")] = id;
        else
            request[Symbol("ordId")] = id;
        end
    end
    stopLossTriggerPrice = safeValue2(params, "stopLossPrice", "newSlTriggerPx");
    stopLossPrice = safeValue(params, "newSlOrdPx");
    stopLossTriggerPriceType = safeString(params, "newSlTriggerPxType", "last");
    takeProfitTriggerPrice = safeValue2(params, "takeProfitPrice", "newTpTriggerPx");
    takeProfitPrice = safeValue(params, "newTpOrdPx");
    takeProfitTriggerPriceType = safeString(params, "newTpTriggerPxType", "last");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    hasStopLoss = (stopLoss != nothing);
    hasTakeProfit = (takeProfit != nothing);
    if functions.ccxtruthy(isAlgoOrder)
        if functions.ccxtruthy(@functions.ccxt_and((stopLossTriggerPrice == nothing), (takeProfitTriggerPrice == nothing)))
            throw(BadRequest(string(self.id, " editOrder() requires a stopLossPrice or takeProfitPrice parameter for editing an algo order")));
        end
        if functions.ccxtruthy(stopLossTriggerPrice != nothing)
            if functions.ccxtruthy(stopLossPrice == nothing)
                throw(BadRequest(string(self.id, " editOrder() requires a newSlOrdPx parameter for editing an algo order")));
            end
            request[Symbol("newSlTriggerPx")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
            request[Symbol("newSlOrdPx")] = functions.ccxtruthy((type_var == "market")) ? "-1" : self.priceToPrecision(symbol, stopLossPrice);
            request[Symbol("newSlTriggerPxType")] = stopLossTriggerPriceType;
        end
        if functions.ccxtruthy(takeProfitTriggerPrice != nothing)
            if functions.ccxtruthy(takeProfitPrice == nothing)
                throw(BadRequest(string(self.id, " editOrder() requires a newTpOrdPx parameter for editing an algo order")));
            end
            request[Symbol("newTpTriggerPx")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
            request[Symbol("newTpOrdPx")] = functions.ccxtruthy((type_var == "market")) ? "-1" : self.priceToPrecision(symbol, takeProfitPrice);
            request[Symbol("newTpTriggerPxType")] = takeProfitTriggerPriceType;
        end
    else
        if functions.ccxtruthy(stopLossTriggerPrice != nothing)
            request[Symbol("newSlTriggerPx")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
            request[Symbol("newSlOrdPx")] = functions.ccxtruthy((type_var == "market")) ? "-1" : self.priceToPrecision(symbol, stopLossPrice);
            request[Symbol("newSlTriggerPxType")] = stopLossTriggerPriceType;
        end
        if functions.ccxtruthy(takeProfitTriggerPrice != nothing)
            request[Symbol("newTpTriggerPx")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
            request[Symbol("newTpOrdPx")] = functions.ccxtruthy((type_var == "market")) ? "-1" : self.priceToPrecision(symbol, takeProfitPrice);
            request[Symbol("newTpTriggerPxType")] = takeProfitTriggerPriceType;
        end
        if functions.ccxtruthy(hasStopLoss)
            stopLossTriggerPrice = safeValue(stopLoss, "triggerPrice");
            stopLossPrice = safeValue(stopLoss, "price");
            stopLossType = safeString(stopLoss, "type");
            request[Symbol("newSlTriggerPx")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
            request[Symbol("newSlOrdPx")] = functions.ccxtruthy((stopLossType == "market")) ? "-1" : self.priceToPrecision(symbol, stopLossPrice);
            request[Symbol("newSlTriggerPxType")] = stopLossTriggerPriceType;
        end
        if functions.ccxtruthy(hasTakeProfit)
            takeProfitTriggerPrice = safeValue(takeProfit, "triggerPrice");
            takeProfitPrice = safeValue(takeProfit, "price");
            takeProfitType = safeString(takeProfit, "type");
            request[Symbol("newTpOrdKind")] = functions.ccxtruthy((takeProfitType == "limit")) ? takeProfitType : "condition";
            request[Symbol("newTpTriggerPx")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
            request[Symbol("newTpOrdPx")] = functions.ccxtruthy((takeProfitType == "market")) ? "-1" : self.priceToPrecision(symbol, takeProfitPrice);
            request[Symbol("newTpTriggerPxType")] = takeProfitTriggerPriceType;
        end
    end
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("newSz")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(!functions.ccxtruthy(isAlgoOrder))
        if functions.ccxtruthy(price != nothing)
            request[Symbol("newPx")] = self.priceToPrecision(symbol, price);
        end
    end
    params = omit(params, ["clOrdId", "clientOrderId", "takeProfitPrice", "stopLossPrice", "stopLoss", "takeProfit", "postOnly"]);
    return extend(request, params)

end
function editOrder(self::Okx, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.editOrderRequest(id, symbol, type_var, side, amount, price, params);
    isAlgoOrder = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((type_var == "trigger"), (type_var == "conditional")), (type_var == "move_order_stop")), (type_var == "oco")), (type_var == "iceberg")), (type_var == "twap")))
        isAlgoOrder = true;
    end
    response = nothing;
    if functions.ccxtruthy(isAlgoOrder)
        response = Base.fetch(self.privatePostTradeAmendAlgos(extend(request, params)));
    else
        response = Base.fetch(self.privatePostTradeAmendOrder(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    first_var = self.safeDict(data, 0, Dict{Symbol, Any}());
    order = self.parseOrder(first_var, market);
    order[Symbol("type")] = type_var;
    order[Symbol("side")] = side;
    return order

end
function cancelOrder(self::Okx, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    trigger = safeValue2(params, "stop", "trigger");
    trailing = self.safeBool(params, "trailing", false);
    if functions.ccxtruthy(@functions.ccxt_or(trigger, trailing))
        orderInner = Base.fetch(self.cancelOrders([id], symbol, params));
            return self.safeDict(orderInner, 0)
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "clOrdId", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clOrdId")] = clientOrderId;
    else
        request[Symbol("ordId")] = id;
    end
    query = omit(params, ["clOrdId", "clientOrderId"]);
    response = Base.fetch(self.privatePostTradeCancelOrder(extend(request, query)));
    data = safeValue(response, "data", []);
    order = self.safeDict(data, 0);
    return self.parseOrder(order, market)

end
function parseIds(self::Okx, ids)
    if functions.ccxtruthy(@functions.ccxt_and((ids != nothing), isa(ids, AbstractString)))
            return split(ids, ",")
    else
        return ids
    end

end
function cancelOrders(self::Okx, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = [];
    options = safeValue(self.options, "cancelOrders", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "privatePostTradeCancelBatchOrders");
    method = safeString(params, "method", defaultMethod);
    clientOrderIds = self.parseIds(safeValue2(params, "clOrdId", "clientOrderId"));
    algoIds = self.parseIds(safeValue(params, "algoId"));
    trigger = safeValue2(params, "stop", "trigger");
    trailing = self.safeBool(params, "trailing", false);
    if functions.ccxtruthy(@functions.ccxt_or(trigger, trailing))
        method = "privatePostTradeCancelAlgos";
    end
    if functions.ccxtruthy(clientOrderIds == nothing)
        ids = self.parseIds(ids);
        if functions.ccxtruthy(algoIds != nothing)
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(algoIds)))
                push!(request, Dict{Symbol, Any}(
    Symbol("algoId") => get(algoIds, i + 1, nothing),
    Symbol("instId") => get(market, Symbol("id"), nothing)
));
                i += 1
            end

        end
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
            if functions.ccxtruthy(@functions.ccxt_or(trailing, trigger))
                                push!(request, Dict{Symbol, Any}(
    Symbol("algoId") => get(ids, i + 1, nothing),
    Symbol("instId") => get(market, Symbol("id"), nothing)
));
            else
                push!(request, Dict{Symbol, Any}(
    Symbol("ordId") => get(ids, i + 1, nothing),
    Symbol("instId") => get(market, Symbol("id"), nothing)
));
            end
            i += 1
        end

    else
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(clientOrderIds)))
            if functions.ccxtruthy(@functions.ccxt_or(trailing, trigger))
                                push!(request, Dict{Symbol, Any}(
    Symbol("instId") => get(market, Symbol("id"), nothing),
    Symbol("algoClOrdId") => get(clientOrderIds, i + 1, nothing)
));
            else
                push!(request, Dict{Symbol, Any}(
    Symbol("instId") => get(market, Symbol("id"), nothing),
    Symbol("clOrdId") => get(clientOrderIds, i + 1, nothing)
));
            end
            i += 1
        end
    end
    response = nothing;
    if functions.ccxtruthy(method == "privatePostTradeCancelAlgos")
        response = Base.fetch(self.privatePostTradeCancelAlgos(request));
    else
        response = Base.fetch(self.privatePostTradeCancelBatchOrders(request));
    end
    ordersData = self.safeList(response, "data", []);
    return self.parseOrders(ordersData, market, nothing, nothing, params)

end
function cancelOrdersForSymbols(self::Okx, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = [];
    options = self.safeDict(self.options, "cancelOrders", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "privatePostTradeCancelBatchOrders");
    method = safeString(params, "method", defaultMethod);
    trigger = self.safeBool2(params, "stop", "trigger");
    trailing = self.safeBool(params, "trailing", false);
    isStopOrTrailing = @functions.ccxt_or(trigger, trailing);
    if functions.ccxtruthy(isStopOrTrailing)
        method = "privatePostTradeCancelAlgos";
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        id = safeString(order, "id");
        clientOrderId = safeString2(order, "clOrdId", "clientOrderId");
        symbol = safeString(order, "symbol");
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol for each order")));
        end
        market = self.market(symbol);
        idKey = "ordId";
        if functions.ccxtruthy(isStopOrTrailing)
            idKey = "algoId";
        elseif functions.ccxtruthy(clientOrderId != nothing)
            if functions.ccxtruthy(isStopOrTrailing)
                idKey = "algoClOrdId";
            else
                idKey = "clOrdId";
            end
        end
        requestItem = Dict{Symbol, Any}(
            Symbol("instId") => get(market, Symbol("id"), nothing)
        );
        requestItem[Symbol(idKey)] = functions.ccxtruthy((clientOrderId != nothing)) ? clientOrderId : id;
        push!(request, requestItem);
        i += 1
    end
    response = nothing;
    if functions.ccxtruthy(method == "privatePostTradeCancelAlgos")
        response = Base.fetch(self.privatePostTradeCancelAlgos(request));
    else
        response = Base.fetch(self.privatePostTradeCancelBatchOrders(request));
    end
    ordersData = self.safeList(response, "data", []);
    return self.parseOrders(ordersData, nothing, nothing, nothing, params)

end
function cancelAllOrdersAfter(self::Okx, timeout, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    timeOut = 0;
    if functions.ccxtruthy(@functions.ccxt_and((timeout != nothing), (functions.ccxt_gt(timeout, 0))))
        timeOut = self.parseToInt(timeout / 1000);
    end
    request = Dict{Symbol, Any}(
        Symbol("timeOut") => timeOut
    );
    response = Base.fetch(self.privatePostTradeCancelAllAfter(extend(request, params)));
    return response

end
function parseOrderStatus(self::Okx, status)
    statuses = Dict{Symbol, Any}(
        Symbol("canceled") => "canceled",
        Symbol("order_failed") => "canceled",
        Symbol("live") => "open",
        Symbol("partially_filled") => "open",
        Symbol("filled") => "closed",
        Symbol("effective") => "closed"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseOrder(self::Okx, order, market=nothing)
    scode = safeString(order, "sCode");
    if functions.ccxtruthy(@functions.ccxt_and((scode != nothing), (scode != "0")))
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(order, "ordId"),
    Symbol("clientOrderId") => safeString(order, "clOrdId"),
    Symbol("status") => "rejected",
    Symbol("info") => order
))
    end
    id = safeString2(order, "algoId", "ordId");
    timestamp = safeInteger(order, "cTime");
    lastUpdateTimestamp = safeInteger(order, "uTime");
    lastTradeTimestamp = safeInteger(order, "fillTime");
    side = safeString(order, "side");
    type_var = safeString(order, "ordType");
    postOnly = nothing;
    timeInForce = nothing;
    if functions.ccxtruthy(type_var == "post_only")
        postOnly = true;
        type_var = "limit";
    elseif functions.ccxtruthy(type_var == "fok")
        timeInForce = "FOK";
        type_var = "limit";
    else
        if functions.ccxtruthy(type_var == "ioc")
            timeInForce = "IOC";
            type_var = "limit";
        end

    end
    marketId = safeString(order, "instId");
    market = self.safeMarket(marketId, market);
    symbol = self.safeSymbol(marketId, market, "-");
    filled = safeString(order, "accFillSz");
    price = safeString2(order, "px", "ordPx");
    average = safeString(order, "avgPx");
    status = self.parseOrderStatus(safeString(order, "state"));
    feeCostString = safeString(order, "fee");
    amount = nothing;
    cost = nothing;
    defaultTgtCcy = safeString(self.options, "tgtCcy", "base_ccy");
    tgtCcy = safeString(order, "tgtCcy", defaultTgtCcy);
    instType = safeString(order, "instType");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((side == "buy"), (type_var == "market")), (instType == "SPOT")), (tgtCcy == "quote_ccy")))
        cost = safeString(order, "sz");
    else
        amount = safeString(order, "sz");
    end
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeCostSigned = stringNeg(feeCostString);
        feeCurrencyId = safeString(order, "feeCcy");
        feeCurrencyCode = self.safeCurrencyCode(feeCurrencyId);
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeCostSigned),
            Symbol("currency") => feeCurrencyCode
        );
    end
    clientOrderId = safeString(order, "clOrdId");
    if functions.ccxtruthy(@functions.ccxt_and((clientOrderId != nothing), (functions.ccxt_lt(length(clientOrderId), 1))))
        clientOrderId = nothing;
    end
    stopLossPrice = self.safeNumber2(order, "slTriggerPx", "slOrdPx");
    takeProfitPrice = self.safeNumber2(order, "tpTriggerPx", "tpOrdPx");
    reduceOnlyRaw = safeString(order, "reduceOnly");
    reduceOnly = false;
    if functions.ccxtruthy(reduceOnly != nothing)
        reduceOnly = (reduceOnlyRaw == "true");
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("triggerPrice") => self.safeNumberN(order, ["triggerPx", "moveTriggerPx"]),
    Symbol("average") => average,
    Symbol("cost") => cost,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing,
    Symbol("reduceOnly") => reduceOnly
), market)

end
function fetchOrder(self::Okx, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "clOrdId", "clientOrderId");
    options = safeValue(self.options, "fetchOrder", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "privateGetTradeOrder");
    method = safeString(params, "method", defaultMethod);
    trigger = safeValue2(params, "stop", "trigger");
    if functions.ccxtruthy(trigger)
        method = "privateGetTradeOrderAlgo";
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("algoClOrdId")] = clientOrderId;
        else
            request[Symbol("algoId")] = id;
        end
    else
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("clOrdId")] = clientOrderId;
        else
            request[Symbol("ordId")] = id;
        end
    end
    query = omit(params, ["method", "clOrdId", "clientOrderId", "stop", "trigger"]);
    response = nothing;
    if functions.ccxtruthy(method == "privateGetTradeOrderAlgo")
        response = Base.fetch(self.privateGetTradeOrderAlgo(extend(request, query)));
    else
        response = Base.fetch(self.privateGetTradeOrder(extend(request, query)));
    end
    data = safeValue(response, "data", []);
    order = self.safeDict(data, 0);
    return self.parseOrder(order, market)

end
function fetchOpenOrders(self::Okx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOpenOrders", symbol, since, limit, params, maxLimit))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, maxLimit);
    end
    options = safeValue(self.options, "fetchOpenOrders", Dict{Symbol, Any}());
    algoOrderTypes = safeValue(self.options, "algoOrderTypes", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "privateGetTradeOrdersPending");
    method = safeString(params, "method", defaultMethod);
    ordType = safeString(params, "ordType");
    trigger = safeValue2(params, "stop", "trigger");
    trailing = self.safeBool(params, "trailing", false);
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(trailing, trigger), (@functions.ccxt_and((ordType != nothing), (ccxt_in(ordType, algoOrderTypes))))))
        method = "privateGetTradeOrdersAlgoPending";
    end
    if functions.ccxtruthy(trailing)
        request[Symbol("ordType")] = "move_order_stop";
    elseif functions.ccxtruthy(@functions.ccxt_and(trigger, (ordType == nothing)))
        request[Symbol("ordType")] = "trigger";
    end
    query = omit(params, ["method", "stop", "trigger", "trailing"]);
    response = nothing;
    if functions.ccxtruthy(method == "privateGetTradeOrdersAlgoPending")
        response = Base.fetch(self.privateGetTradeOrdersAlgoPending(extend(request, query)));
    else
        response = Base.fetch(self.privateGetTradeOrdersPending(extend(request, query)));
    end
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function fetchCanceledOrders(self::Okx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, query) = self.handleMarketTypeAndParams("fetchCanceledOrders", market, params);
    request[Symbol("instType")] = self.convertToInstrumentType(type_var);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    request[Symbol("state")] = "canceled";
    options = safeValue(self.options, "fetchCanceledOrders", Dict{Symbol, Any}());
    algoOrderTypes = safeValue(self.options, "algoOrderTypes", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "privateGetTradeOrdersHistory");
    method = safeString(params, "method", defaultMethod);
    ordType = safeString(params, "ordType");
    trigger = safeValue2(params, "stop", "trigger");
    trailing = self.safeBool(params, "trailing", false);
    if functions.ccxtruthy(trailing)
        method = "privateGetTradeOrdersAlgoHistory";
        request[Symbol("ordType")] = "move_order_stop";
    elseif functions.ccxtruthy(@functions.ccxt_or(trigger, (@functions.ccxt_and((ordType != nothing), (ccxt_in(ordType, algoOrderTypes))))))
        method = "privateGetTradeOrdersAlgoHistory";
        algoId = safeString(params, "algoId");
        if functions.ccxtruthy(algoId != nothing)
            request[Symbol("algoId")] = algoId;
            params = omit(params, "algoId");
        end
        if functions.ccxtruthy(trigger)
            if functions.ccxtruthy(ordType == nothing)
                throw(ArgumentsRequired(string(self.id, " fetchCanceledOrders() requires an \"ordType\" string parameter, \"conditional\", \"oco\", \"trigger\", \"move_order_stop\", \"iceberg\", or \"twap\"")));
            end
        end
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("begin")] = since;
        end
        until = safeInteger(query, "until");
        if functions.ccxtruthy(until != nothing)
            request[Symbol("end")] = until;
            query = omit(query, ["until"]);
        end
    end
    send = omit(query, ["method", "stop", "trigger", "trailing"]);
    response = nothing;
    if functions.ccxtruthy(method == "privateGetTradeOrdersAlgoHistory")
        response = Base.fetch(self.privateGetTradeOrdersAlgoHistory(extend(request, send)));
    else
        response = Base.fetch(self.privateGetTradeOrdersHistory(extend(request, send)));
    end
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function fetchClosedOrders(self::Okx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxLimit = 100;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchClosedOrders", symbol, since, limit, params, maxLimit))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, query) = self.handleMarketTypeAndParams("fetchClosedOrders", market, params);
    request[Symbol("instType")] = self.convertToInstrumentType(type_var);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = min(limit, maxLimit);
    end
    options = self.safeDict(self.options, "fetchClosedOrders", Dict{Symbol, Any}());
    algoOrderTypes = self.safeDict(self.options, "algoOrderTypes", Dict{Symbol, Any}());
    defaultMethod = safeString(options, "method", "privateGetTradeOrdersHistory");
    method = safeString(params, "method", defaultMethod);
    ordType = safeString(params, "ordType");
    trigger = self.safeBool2(params, "stop", "trigger");
    trailing = self.safeBool(params, "trailing", false);
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(trailing, trigger), (@functions.ccxt_and((ordType != nothing), (ccxt_in(ordType, algoOrderTypes))))))
        method = "privateGetTradeOrdersAlgoHistory";
        request[Symbol("state")] = "effective";
    end
    if functions.ccxtruthy(trailing)
        request[Symbol("ordType")] = "move_order_stop";
    elseif functions.ccxtruthy(trigger)
        if functions.ccxtruthy(ordType == nothing)
            request[Symbol("ordType")] = "trigger";
        end
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("begin")] = since;
        end
        until = safeInteger(query, "until");
        if functions.ccxtruthy(until != nothing)
            request[Symbol("end")] = until;
            query = omit(query, ["until"]);
        end
        request[Symbol("state")] = "filled";
    end
    send = omit(query, ["method", "stop", "trigger", "trailing"]);
    response = nothing;
    if functions.ccxtruthy(method == "privateGetTradeOrdersAlgoHistory")
        response = Base.fetch(self.privateGetTradeOrdersAlgoHistory(extend(request, send)));
    elseif functions.ccxtruthy(method == "privateGetTradeOrdersHistoryArchive")
        response = Base.fetch(self.privateGetTradeOrdersHistoryArchive(extend(request, send)));
    else
        response = Base.fetch(self.privateGetTradeOrdersHistory(extend(request, send)));
    end
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function fetchMyTrades(self::Okx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol, since, limit, params))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("begin")] = since;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    (type_var, query) = self.handleMarketTypeAndParams("fetchMyTrades", market, params);
    request[Symbol("instType")] = self.convertToInstrumentType(type_var);
    if functions.ccxtruthy(@functions.ccxt_and((limit != nothing), (since == nothing)))
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetTradeFillsHistory(extend(request, query)));
    data = self.safeList(response, "data", []);
    return self.parseTrades(data, market, since, limit, query)

end
function fetchOrderTrades(self::Okx, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("ordId") => id
    );
    return Base.fetch(self.fetchMyTrades(symbol, since, limit, extend(request, params)))

end
function fetchLedger(self::Okx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchLedger", code, since, limit, params))
    end
    options = self.safeDict(self.options, "fetchLedger", Dict{Symbol, Any}());
    method = safeString(options, "method");
    method = safeString(params, "method", method);
    params = omit(params, "method");
    request = Dict{Symbol, Any}();
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchLedger", params);
    if functions.ccxtruthy(marginMode == nothing)
        marginMode = safeString(params, "mgnMode");
    end
    if functions.ccxtruthy(method != "privateGetAssetBills")
        if functions.ccxtruthy(marginMode != nothing)
            request[Symbol("mgnMode")] = marginMode;
        end
    end
    (type_var, query) = self.handleMarketTypeAndParams("fetchLedger", nothing, params);
    if functions.ccxtruthy(type_var != nothing)
        request[Symbol("instType")] = self.convertToInstrumentType(type_var);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    (request, params) = self.handleUntilOption("end", request, params);
    response = nothing;
    if functions.ccxtruthy(method == "privateGetAccountBillsArchive")
        response = Base.fetch(self.privateGetAccountBillsArchive(extend(request, query)));
    elseif functions.ccxtruthy(method == "privateGetAssetBills")
        response = Base.fetch(self.privateGetAssetBills(extend(request, query)));
    else
        response = Base.fetch(self.privateGetAccountBills(extend(request, query)));
    end
    data = self.safeList(response, "data", []);
    return self.parseLedger(data, currency, since, limit)

end
function parseLedgerEntryType(self::Okx, type_var)
    types = Dict{Symbol, Any}(
        Symbol("1") => "transfer",
        Symbol("2") => "trade",
        Symbol("3") => "trade",
        Symbol("4") => "rebate",
        Symbol("5") => "trade",
        Symbol("6") => "transfer",
        Symbol("7") => "trade",
        Symbol("8") => "fee",
        Symbol("9") => "trade",
        Symbol("10") => "trade",
        Symbol("11") => "trade"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Okx, item, currency=nothing)
    currencyId = safeString(item, "ccy");
    code = self.safeCurrencyCode(currencyId, currency);
    currency = self.safeCurrency(currencyId, currency);
    timestamp = safeInteger(item, "ts");
    feeCostString = safeString(item, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(stringNeg(feeCostString)),
            Symbol("currency") => code
        );
    end
    marketId = safeString(item, "instId");
    symbol = self.safeSymbol(marketId, nothing, "-");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "billId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("account") => nothing,
    Symbol("referenceId") => safeString(item, "ordId"),
    Symbol("referenceAccount") => nothing,
    Symbol("type") => self.parseLedgerEntryType(safeString(item, "type")),
    Symbol("currency") => code,
    Symbol("symbol") => symbol,
    Symbol("amount") => self.safeNumber(item, "balChg"),
    Symbol("before") => nothing,
    Symbol("after") => self.safeNumber(item, "bal"),
    Symbol("status") => "ok",
    Symbol("fee") => fee
), currency)

end
function parseDepositAddress(self::Okx, depositAddress, currency=nothing)
    address = safeString(depositAddress, "addr");
    tag = safeStringN(depositAddress, ["tag", "pmtId", "memo"]);
    if functions.ccxtruthy(tag == nothing)
        addrEx = safeValue(depositAddress, "addrEx", Dict{Symbol, Any}());
        tag = safeString(addrEx, "comment");
    end
    currencyId = safeString(depositAddress, "ccy");
    currency = self.safeCurrency(currencyId, currency);
    code = get(currency, Symbol("code"), nothing);
    chain = safeString(depositAddress, "chain");
    networks = safeValue(currency, "networks", Dict{Symbol, Any}());
    networksById = indexBy(networks, "id");
    networkData = functions.ccxtruthy((chain == nothing)) ? nothing : safeValue(networksById, chain);
    if functions.ccxtruthy(chain == "USDT-Polygon")
        networkData = safeValue2(networksById, "USDT-Polygon-Bridge", "USDT-Polygon");
    end
    network = safeString(networkData, "network");
    networkCode = self.networkIdToCode(network, code);
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => networkCode,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function fetchDepositAddressesByNetwork(self::Okx, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetAssetDepositAddress(extend(request, params)));
    data = self.safeList(response, "data", []);
    filtered = filterBy(data, "selected", true);
    parsed = self.parseDepositAddresses(filtered, [get(currency, Symbol("code"), nothing)], false);
    return indexBy(parsed, "network")

end
function fetchDepositAddress(self::Okx, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    rawNetwork = safeString(params, "network");
    params = omit(params, "network");
    code = self.safeCurrencyCode(code);
    network = self.networkIdToCode(rawNetwork, code);
    responseRaw = Base.fetch(self.fetchDepositAddressesByNetwork(code, params));
    response = responseRaw;
    if functions.ccxtruthy(network != nothing)
        result = self.safeDict(response, network);
        if functions.ccxtruthy(result == nothing)
            throw(InvalidAddress(string(self.id, " fetchDepositAddress() cannot find ", network, " deposit address for ", code)));
        end
            return result
    end
    codeNetwork = self.networkIdToCode(code, code);
    if functions.ccxtruthy(@functions.ccxt_and((codeNetwork != nothing), (ccxt_in(codeNetwork, response))))
            return get(response, Symbol(codeNetwork), nothing)
    end
    keys_var = objectKeys(response);
    first_var = safeString(keys_var, 0, "");
    return self.safeDict(response, first_var)

end
function withdraw(self::Okx, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    self.checkAddress(address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    if functions.ccxtruthy(@functions.ccxt_and((tag != nothing), (functions.ccxt_gt(length(tag), 0))))
        address = string(address, ":", tag);
    end
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing),
        Symbol("toAddr") => address,
        Symbol("dest") => "4",
        Symbol("amt") => numberToString(amount)
    );
    network = safeString(params, "network");
    if functions.ccxtruthy(network != nothing)
        networks = self.safeDict(self.options, "networks", Dict{Symbol, Any}());
        network = safeString(networks, uppercase(network), network);
        request[Symbol("chain")] = string(get(currency, Symbol("id"), nothing), "-", network);
        params = omit(params, "network");
    end
    fee = safeString(params, "fee");
    if functions.ccxtruthy(fee == nothing)
        currencies = Base.fetch(self.fetchCurrencies());
        self.currencies = self.mapToSafeMap(deepExtend(self.currencies, currencies));
        networkCodeResolved = self.networkIdToCode(network, get(currency, Symbol("code"), nothing));
        targetNetwork = functions.ccxtruthy((networkCodeResolved == nothing)) ? Dict{Symbol, Any}() : self.safeDict(get(currency, Symbol("networks"), nothing), networkCodeResolved, Dict{Symbol, Any}());
        fee = safeString(targetNetwork, "fee");
        if functions.ccxtruthy(fee == nothing)
            throw(ArgumentsRequired(string(self.id, " withdraw() requires a \"fee\" string parameter, network transaction fee must be ≥ 0. Withdrawals to OKCoin or OKX are fee-free, please set \"0\". Withdrawing to external digital asset address requires network transaction fee.")));
        end
    end
    request[Symbol("fee")] = numberToString(fee);
    query = omit(params, ["fee"]);
    response = Base.fetch(self.privatePostAssetWithdrawal(extend(request, query)));
    data = self.safeList(response, "data", []);
    transaction = self.safeDict(data, 0);
    return self.parseTransaction(transaction, currency)

end
function fetchDeposits(self::Okx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDeposits", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchDeposits", code, since, limit, params))
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = max(since - 1, 0);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("after", request, params);
    response = Base.fetch(self.privateGetAssetDepositHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit, params)

end
function fetchDeposit(self::Okx, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("depId") => id
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetAssetDepositHistory(extend(request, params)));
    data = safeValue(response, "data");
    deposit = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTransaction(deposit, currency)

end
function fetchWithdrawals(self::Okx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchWithdrawals", code, since, limit, params))
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = max(since - 1, 0);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("after", request, params);
    response = Base.fetch(self.privateGetAssetWithdrawalHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransactions(data, currency, since, limit, params)

end
function fetchWithdrawal(self::Okx, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("wdId") => id
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetAssetWithdrawalHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    withdrawal = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTransaction(withdrawal)

end
function parseTransactionStatus(self::Okx, status)
    statuses = Dict{Symbol, Any}(
        Symbol("-3") => "pending",
        Symbol("-2") => "canceled",
        Symbol("-1") => "failed",
        Symbol("0") => "pending",
        Symbol("1") => "pending",
        Symbol("2") => "ok",
        Symbol("3") => "pending",
        Symbol("4") => "pending",
        Symbol("5") => "pending",
        Symbol("6") => "pending",
        Symbol("7") => "pending",
        Symbol("8") => "pending",
        Symbol("9") => "pending",
        Symbol("10") => "pending",
        Symbol("12") => "pending",
        Symbol("15") => "pending",
        Symbol("16") => "pending"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseTransaction(self::Okx, transaction, currency=nothing)
    type_var = nothing;
    id = nothing;
    withdrawalId = safeString(transaction, "wdId");
    addressFrom = safeString(transaction, "from");
    addressTo = safeString(transaction, "to");
    address = addressTo;
    tagTo = safeString2(transaction, "tag", "memo");
    tagTo = functions.ccxtruthy((tagTo == nothing)) ? safeString(transaction, "pmtId") : safeString2(transaction, "pmtId", tagTo);
    if functions.ccxtruthy(withdrawalId != nothing)
        type_var = "withdrawal";
        id = withdrawalId;
    else
        id = safeString(transaction, "depId");
        type_var = "deposit";
    end
    currencyId = safeString(transaction, "ccy");
    code = self.safeCurrencyCode(currencyId);
    network = nothing;
    chain = safeString(transaction, "chain");
    if functions.ccxtruthy(chain != nothing)
        chainParts = split(chain, "-");
        networkParts = self.arraySlice(chainParts, 1);
        networkId = join(networkParts, "-");
        if functions.ccxtruthy(networkId != nothing)
            network = self.networkIdToCode(networkId, code);
        end
    end
    amount = self.safeNumber(transaction, "amt");
    status = self.parseTransactionStatus(safeString(transaction, "state"));
    txid = safeString(transaction, "txId");
    timestamp = safeInteger(transaction, "ts");
    feeCost = nothing;
    if functions.ccxtruthy(type_var == "deposit")
        feeCost = 0;
    else
        feeCost = self.safeNumber(transaction, "fee");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("network") => network,
    Symbol("addressFrom") => addressFrom,
    Symbol("addressTo") => addressTo,
    Symbol("address") => address,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => tagTo,
    Symbol("tag") => tagTo,
    Symbol("status") => status,
    Symbol("type") => type_var,
    Symbol("updated") => nothing,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => feeCost
    )
)

end
function fetchLeverage(self::Okx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchLeverage", params);
    if functions.ccxtruthy(marginMode == nothing)
        marginMode = safeString(params, "mgnMode", "cross");
    end
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "cross"), (marginMode != "isolated")))
        throw(BadRequest(string(self.id, " fetchLeverage() requires a marginMode parameter that must be either cross or isolated")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("mgnMode") => marginMode
    );
    response = Base.fetch(self.privateGetAccountLeverageInfo(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseLeverage(data, market)

end
function parseLeverage(self::Okx, leverage, market=nothing)
    marketId = nothing;
    marginMode = nothing;
    longLeverage = nothing;
    shortLeverage = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(leverage)))
        entry = get(leverage, i + 1, nothing);
        marginMode = safeStringLower(entry, "mgnMode");
        marketId = safeString(entry, "instId");
        positionSide = safeStringLower(entry, "posSide");
        if functions.ccxtruthy(positionSide == "long")
            longLeverage = safeInteger(entry, "lever");
        elseif functions.ccxtruthy(positionSide == "short")
            shortLeverage = safeInteger(entry, "lever");
        else
            longLeverage = safeInteger(entry, "lever");
            shortLeverage = safeInteger(entry, "lever");
        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => longLeverage,
    Symbol("shortLeverage") => shortLeverage
)

end
function fetchPosition(self::Okx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    (type_var, query) = self.handleMarketTypeAndParams("fetchPosition", market, params);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(type_var != nothing)
        request[Symbol("instType")] = self.convertToInstrumentType(type_var);
    end
    response = Base.fetch(self.privateGetAccountPositions(extend(request, query)));
    data = self.safeList(response, "data", []);
    position = self.safeDict(data, 0);
    if functions.ccxtruthy(position == nothing)
        throw(NullResponse(string(self.id, " fetchPosition() could not find a position for ", symbol)));
    end
    return self.parsePosition(position, market)

end
function fetchPositions(self::Okx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        marketIds = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            entry = get(symbols, i + 1, nothing);
            market = self.market(entry);
            push!(marketIds, get(market, Symbol("id"), nothing));
            i += 1
        end

        marketIdsLength = length(marketIds);
        if functions.ccxtruthy(functions.ccxt_gt(marketIdsLength, 0))
            request[Symbol("instId")] =             join(marketIds, ",");
        end
    end
    fetchPositionsOptions = self.safeDict(self.options, "fetchPositions", Dict{Symbol, Any}());
    method = safeString(fetchPositionsOptions, "method", "privateGetAccountPositions");
    response = nothing;
    if functions.ccxtruthy(method == "privateGetAccountPositionsHistory")
        response = Base.fetch(self.privateGetAccountPositionsHistory(extend(request, params)));
    else
        response = Base.fetch(self.privateGetAccountPositions(extend(request, params)));
    end
    positions = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        push!(result, self.parsePosition(get(positions, i + 1, nothing)));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", self.marketSymbols(symbols), false)

end
function fetchPositionsForSymbol(self::Okx, symbol, params=Dict())
    return Base.fetch(self.fetchPositions([symbol], params))

end
function parsePosition(self::Okx, position, market=nothing)
    marketId = safeString(position, "instId");
    market = self.safeMarket(marketId, market, nothing, "contract");
    symbol = get(market, Symbol("symbol"), nothing);
    pos = safeString(position, "pos");
    contractsAbs = stringAbs(pos);
    side = safeString2(position, "posSide", "direction");
    hedged = side != "net";
    contracts = self.parseNumber(contractsAbs);
    if functions.ccxtruthy(get(market, Symbol("margin"), nothing))
        if functions.ccxtruthy(side == "net")
            posCcy = safeString(position, "posCcy");
            parsedCurrency = self.safeCurrencyCode(posCcy);
            if functions.ccxtruthy(parsedCurrency != nothing)
                side = functions.ccxtruthy((get(market, Symbol("base"), nothing) == parsedCurrency)) ? "long" : "short";
            end
        end
        if functions.ccxtruthy(side == nothing)
            side = safeString(position, "direction");
        end
    else
        if functions.ccxtruthy(pos != nothing)
            if functions.ccxtruthy(side == "net")
                if functions.ccxtruthy(stringGt(pos, "0"))
                    side = "long";
                elseif functions.ccxtruthy(stringLt(pos, "0"))
                    side = "short";
                else
                    side = nothing;
                end
            end
        end
    end
    contractSize = self.safeNumber(market, "contractSize");
    contractSizeString = numberToString(contractSize);
    markPriceString = safeString(position, "markPx");
    notionalString = safeString(position, "notionalUsd");
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        notionalString = stringDiv(stringMul(contractsAbs, contractSizeString), markPriceString);
    end
    notional = self.parseNumber(notionalString);
    marginMode = safeString(position, "mgnMode");
    initialMarginString = nothing;
    entryPriceString = safeString2(position, "avgPx", "openAvgPx");
    unrealizedPnlString = safeString(position, "upl");
    leverageString = safeString(position, "lever");
    initialMarginPercentage = nothing;
    collateralString = nothing;
    if functions.ccxtruthy(marginMode == "cross")
        initialMarginString = safeString(position, "imr");
        collateralString = stringAdd(initialMarginString, unrealizedPnlString);
    elseif functions.ccxtruthy(marginMode == "isolated")
        initialMarginPercentage = stringDiv("1", leverageString);
        collateralString = safeString(position, "margin");
    end
    maintenanceMarginString = safeString(position, "mmr");
    maintenanceMargin = self.parseNumber(maintenanceMarginString);
    maintenanceMarginPercentageString = stringDiv(maintenanceMarginString, notionalString);
    if functions.ccxtruthy(initialMarginPercentage == nothing)
        initialMarginPercentage = self.parseNumber(stringDiv(initialMarginString, notionalString, 4));
    elseif functions.ccxtruthy(initialMarginString == nothing)
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            initialMarginPercentageString = numberToString(initialMarginPercentage);
            initialMarginString = stringMul(initialMarginPercentageString, notionalString);
        else
            initialMarginString = stringDiv(stringDiv(stringMul(contractsAbs, contractSizeString), entryPriceString), leverageString);
        end
    end
    rounder = "0.00005";
    maintenanceMarginPercentage = self.parseNumber(stringDiv(stringAdd(maintenanceMarginPercentageString, rounder), "1", 4));
    liquidationPrice = self.safeNumber(position, "liqPx");
    percentageString = safeString(position, "uplRatio");
    percentage = self.parseNumber(stringMul(percentageString, "100"));
    timestamp = safeInteger(position, "cTime");
    marginRatio = self.parseNumber(stringDiv(maintenanceMarginString, collateralString, 4));
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "posId"),
    Symbol("symbol") => symbol,
    Symbol("notional") => notional,
    Symbol("marginMode") => marginMode,
    Symbol("liquidationPrice") => liquidationPrice,
    Symbol("entryPrice") => self.parseNumber(entryPriceString),
    Symbol("unrealizedPnl") => self.parseNumber(unrealizedPnlString),
    Symbol("realizedPnl") => self.safeNumber(position, "realizedPnl"),
    Symbol("percentage") => percentage,
    Symbol("contracts") => contracts,
    Symbol("contractSize") => contractSize,
    Symbol("markPrice") => self.parseNumber(markPriceString),
    Symbol("lastPrice") => self.safeNumber(position, "closeAvgPx"),
    Symbol("side") => side,
    Symbol("hedged") => hedged,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => safeInteger(position, "uTime"),
    Symbol("maintenanceMargin") => maintenanceMargin,
    Symbol("maintenanceMarginPercentage") => maintenanceMarginPercentage,
    Symbol("collateral") => self.parseNumber(collateralString),
    Symbol("initialMargin") => self.parseNumber(initialMarginString),
    Symbol("initialMarginPercentage") => self.parseNumber(initialMarginPercentage),
    Symbol("leverage") => self.parseNumber(leverageString),
    Symbol("marginRatio") => marginRatio,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function transfer(self::Okx, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = self.safeDict(self.options, "accountsByType", Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing),
        Symbol("amt") => self.currencyToPrecision(code, amount),
        Symbol("type") => "0",
        Symbol("from") => fromId,
        Symbol("to") => toId
    );
    if functions.ccxtruthy(fromId == "master")
        request[Symbol("type")] = "1";
        request[Symbol("subAcct")] = toId;
        request[Symbol("from")] = safeString(params, "from", "6");
        request[Symbol("to")] = safeString(params, "to", "6");
    elseif functions.ccxtruthy(toId == "master")
        request[Symbol("type")] = "2";
        request[Symbol("subAcct")] = fromId;
        request[Symbol("from")] = safeString(params, "from", "6");
        request[Symbol("to")] = safeString(params, "to", "6");
    end
    response = Base.fetch(self.privatePostAssetTransfer(extend(request, params)));
    data = self.safeList(response, "data", []);
    rawTransfer = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseTransfer(rawTransfer, currency)

end
function parseTransfer(self::Okx, transfer, currency=nothing)
    id = safeString2(transfer, "transId", "billId");
    currencyId = safeString(transfer, "ccy");
    code = self.safeCurrencyCode(currencyId, currency);
    amount = self.safeNumber(transfer, "amt");
    fromAccountId = safeString(transfer, "from");
    toAccountId = safeString(transfer, "to");
    accountsById = self.safeDict(self.options, "accountsById", Dict{Symbol, Any}());
    timestamp = safeInteger(transfer, "ts");
    balanceChange = safeString(transfer, "sz");
    if functions.ccxtruthy(balanceChange != nothing)
        amount = self.parseNumber(stringAbs(balanceChange));
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("fromAccount") => functions.ccxtruthy((fromAccountId == nothing)) ? nothing : safeString(accountsById, fromAccountId),
    Symbol("toAccount") => functions.ccxtruthy((toAccountId == nothing)) ? nothing : safeString(accountsById, toAccountId),
    Symbol("status") => self.parseTransferStatus(safeString(transfer, "state"))
)

end
function parseTransferStatus(self::Okx, status)
    statuses = Dict{Symbol, Any}(
        Symbol("success") => "ok"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function fetchTransfer(self::Okx, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("transId") => id
    );
    response = Base.fetch(self.privateGetAssetTransferState(extend(request, params)));
    data = self.safeList(response, "data", []);
    transfer = self.safeDict(data, 0);
    return self.parseTransfer(transfer)

end
function fetchTransfers(self::Okx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}(
        Symbol("type") => "1"
    );
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("begin")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetAccountBillsArchive(extend(request, params)));
    transfers = self.safeList(response, "data", []);
    return self.parseTransfers(transfers, currency, since, limit, params)

end
function sign(self::Okx, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    isArray = functions.ccxt_isArray(params);
    request = string("/api/", self.version, "/", self.implodeParams(path, params));
    query = omit(params, self.extractParams(path));
    url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol("rest"), nothing)), request);
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(query)))
            url += string("?", self.urlencode(query));
        end
    elseif functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        if functions.ccxtruthy(@functions.ccxt_and(method == "POST", (@functions.ccxt_or(@functions.ccxt_or(path == "trade/batch-orders", path == "trade/order-algo"), path == "trade/order"))))
            brokerId = safeString(self.options, "brokerId", "6b9ad766b55dBCDE");
            if functions.ccxtruthy(functions.ccxt_isArray(params))
                i = 0
                while functions.ccxtruthy(functions.ccxt_lt(i, length(params)))
                    entry = get(params, i + 1, nothing);
                    clientOrderId = safeString(entry, "clOrdId");
                    if functions.ccxtruthy(clientOrderId == nothing)
                        entry[Symbol("clOrdId")] = string(brokerId, uuid16());
                        entry[Symbol("tag")] = brokerId;
                        params[i + 1] = entry;
                    end
                    i += 1
                end

            else
                clientOrderId = safeString(params, "clOrdId");
                if functions.ccxtruthy(clientOrderId == nothing)
                    params[Symbol("clOrdId")] = string(brokerId, uuid16());
                    params[Symbol("tag")] = brokerId;
                end
            end
        end
        timestamp = self.iso8601(self.nonce());
        headers = Dict{Symbol, Any}(
            Symbol("OK-ACCESS-KEY") => self.apiKey,
            Symbol("OK-ACCESS-PASSPHRASE") => self.password,
            Symbol("OK-ACCESS-TIMESTAMP") => timestamp
        );
        auth = string(timestamp, method, request);
        if functions.ccxtruthy(method == "GET")
            if functions.ccxtruthy(length(objectKeys(query)))
                urlencodedQuery = string("?", self.urlencode(query));
                url += urlencodedQuery;
                auth += urlencodedQuery;
            end
        else
            if functions.ccxtruthy(@functions.ccxt_or(isArray, length(objectKeys(query))))
                body = json(query);
                auth += body;
            end
            headers[Symbol("Content-Type")] = "application/json";
        end
        signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256, "base64");
        headers[Symbol("OK-ACCESS-SIGN")] = signature;
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function parseFundingRate(self::Okx, contract, market=nothing)
    nextFundingRateTimestamp = safeInteger(contract, "nextFundingTime");
    marketId = safeString(contract, "instId");
    symbol = self.safeSymbol(marketId, market);
    nextFundingRate = self.safeNumber(contract, "nextFundingRate");
    fundingTime = safeInteger(contract, "fundingTime");
    fundingTimeString = safeString(contract, "fundingTime");
    nextFundingTimeString = safeString(contract, "nextFundingTime");
    millisecondsInterval = stringSub(nextFundingTimeString, fundingTimeString);
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => self.parseNumber("0"),
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("fundingTimestamp") => fundingTime,
    Symbol("fundingDatetime") => self.iso8601(fundingTime),
    Symbol("nextFundingRate") => nextFundingRate,
    Symbol("nextFundingTimestamp") => nextFundingRateTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingRateTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => self.parseFundingInterval(millisecondsInterval)
)

end
function parseFundingInterval(self::Okx, interval)
    intervals = Dict{Symbol, Any}(
        Symbol("3600000") => "1h",
        Symbol("7200000") => "2h",
        Symbol("14400000") => "4h",
        Symbol("28800000") => "8h",
        Symbol("57600000") => "16h",
        Symbol("86400000") => "24h"
    );
    return safeString(intervals, interval, interval)

end
function fetchFundingInterval(self::Okx, symbol, params=Dict())
    return Base.fetch(self.fetchFundingRate(symbol, params))

end
function fetchFundingRate(self::Okx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marketInfo = self.safeDict(market, "info", Dict{Symbol, Any}());
    ruleType = safeString(marketInfo, "ruleType");
    isExtendedPerpetual = (ruleType == "xperp");
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)), !functions.ccxtruthy(isExtendedPerpetual)))
        throw(ExchangeError(string(self.id, " fetchFundingRate() is only valid for swap markets or XPERP futures")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetPublicFundingRate(extend(request, params)));
    data = self.safeList(response, "data", []);
    entry = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseFundingRate(entry, market)

end
function fetchFundingRates(self::Okx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols, nothing, true);
    if functions.ccxtruthy(symbols != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            market = self.market(get(symbols, i + 1, nothing));
            marketInfo = self.safeDict(market, "info", Dict{Symbol, Any}());
            ruleType = safeString(marketInfo, "ruleType");
            isExtendedPerpetual = (ruleType == "xperp");
            if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)), !functions.ccxtruthy(isExtendedPerpetual)))
                throw(BadRequest(string(self.id, " fetchFundingRates() symbols must be swap markets or XPERP futures, ", get(symbols, i + 1, nothing), " is not")));
            end
            i += 1
        end

    end
    request = Dict{Symbol, Any}(
        Symbol("instId") => "ANY"
    );
    response = Base.fetch(self.publicGetPublicFundingRate(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseFundingRates(data, symbols)

end
function fetchFundingHistory(self::Okx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "8"
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] =         string(limit);
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
            if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
                request[Symbol("ctType")] = "linear";
                request[Symbol("ccy")] = get(market, Symbol("quoteId"), nothing);
            else
                request[Symbol("ctType")] = "inverse";
                request[Symbol("ccy")] = get(market, Symbol("baseId"), nothing);
            end
        end
    end
    (type_var, query) = self.handleMarketTypeAndParams("fetchFundingHistory", market, params);
    if functions.ccxtruthy(type_var == "swap")
        request[Symbol("instType")] = self.convertToInstrumentType(type_var);
    end
    response = Base.fetch(self.privateGetAccountBillsArchive(extend(request, query)));
    data = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        timestamp = safeInteger(entry, "ts");
        instId = safeString(entry, "instId");
        marketInner = self.safeMarket(instId);
        currencyId = safeString(entry, "ccy");
        code = self.safeCurrencyCode(currencyId);
        balanceChange = safeString(entry, "balChg");
        positionBalanceChange = safeString(entry, "posBalChg");
        amount = nothing;
        if functions.ccxtruthy(@functions.ccxt_and((balanceChange != nothing), (!functions.ccxtruthy(stringEq(balanceChange, "0")))))
            amount = balanceChange;
        else
            amount = positionBalanceChange;
        end
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => get(marketInner, Symbol("symbol"), nothing),
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(entry, "billId"),
    Symbol("amount") => self.parseNumber(amount)
));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function setLeverage(self::Okx, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, 125))))
        throw(BadRequest(string(self.id, " setLeverage() leverage should be between 1 and 125")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params);
    if functions.ccxtruthy(marginMode == nothing)
        marginMode = safeString(params, "mgnMode", "cross");
    end
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "cross"), (marginMode != "isolated")))
        throw(BadRequest(string(self.id, " setLeverage() requires a marginMode parameter that must be either cross or isolated")));
    end
    request = Dict{Symbol, Any}(
        Symbol("lever") => leverage,
        Symbol("mgnMode") => marginMode,
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    posSide = safeString(params, "posSide", "net");
    if functions.ccxtruthy(marginMode == "isolated")
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(posSide != "long", posSide != "short"), posSide != "net"))
            throw(BadRequest(string(self.id, " setLeverage() requires the posSide argument to be either \"long\", \"short\" or \"net\"")));
        end
        request[Symbol("posSide")] = posSide;
    end
    response = Base.fetch(self.privatePostAccountSetLeverage(extend(request, params)));
    return response

end
function fetchPositionMode(self::Okx, symbol=nothing, params=Dict())
    accounts = Base.fetch(self.fetchAccounts());
    len = length(accounts);
    if functions.ccxtruthy(functions.ccxt_gt(len, 1))
        accountId = safeString(params, "accountId");
        if functions.ccxtruthy(accountId == nothing)
            accountIds = self.getListFromObjectValues(accounts, "id");
            throw(ExchangeError(string(self.id, " fetchPositionMode() can not detect position mode, because you have multiple accounts. Set params[\"accountId\"] to desired id from: ", join(accountIds, ", "))));
        else
            accountsById = indexBy(accounts, "id");
            selectedAccount = self.safeDict(accountsById, accountId);
        end
    else
        selectedAccount = get(accounts, 1, nothing);
    end
    mainAccount = get(selectedAccount, Symbol("info"), nothing);
    posMode = safeString(mainAccount, "posMode");
    isHedged = posMode == "long_short_mode";
    return Dict{Symbol, Any}(
    Symbol("info") => mainAccount,
    Symbol("hedged") => isHedged
)

end
function setPositionMode(self::Okx, hedged, symbol=nothing, params=Dict())
    hedgeMode = nothing;
    if functions.ccxtruthy(hedged)
        hedgeMode = "long_short_mode";
    else
        hedgeMode = "net_mode";
    end
    request = Dict{Symbol, Any}(
        Symbol("posMode") => hedgeMode
    );
    response = Base.fetch(self.privatePostAccountSetPositionMode(extend(request, params)));
    return response

end
function setMarginMode(self::Okx, marginMode, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    marginMode = lowercase(marginMode);
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "cross"), (marginMode != "isolated")))
        throw(BadRequest(string(self.id, " setMarginMode() marginMode must be either cross or isolated")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    lever = safeInteger2(params, "lever", "leverage");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((lever == nothing), (functions.ccxt_lt(lever, 1))), (functions.ccxt_gt(lever, 125))))
        throw(BadRequest(string(self.id, " setMarginMode() params[\"lever\"] should be between 1 and 125")));
    end
    params = omit(params, ["leverage"]);
    request = Dict{Symbol, Any}(
        Symbol("lever") => lever,
        Symbol("mgnMode") => marginMode,
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostAccountSetLeverage(extend(request, params)));
    return response

end
function fetchCrossBorrowRates(self::Okx, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAccountInterestRate(params));
    data = self.safeList(response, "data", []);
    rates = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        rate = self.parseBorrowRate(get(data, i + 1, nothing));
        code = safeString(rate, "currency");
        if functions.ccxtruthy(code != nothing)
            rates[Symbol(code)] = rate;
        end
        i += 1
    end
    return rates

end
function fetchCrossBorrowRate(self::Okx, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetAccountInterestRate(extend(request, params)));
    data = self.safeList(response, "data", []);
    rate = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseBorrowRate(rate)

end
function parseBorrowRate(self::Okx, info, currency=nothing)
    ccy = safeString(info, "ccy");
    timestamp = safeInteger(info, "ts");
    return Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(ccy),
    Symbol("rate") => self.safeNumber2(info, "interestRate", "rate"),
    Symbol("period") => 3600000,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
function parseBorrowRateHistories(self::Okx, response, codes, since, limit)
    borrowRateHistories = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        item = get(response, i + 1, nothing);
        code = self.safeCurrencyCode(safeString(item, "ccy"));
        if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (@functions.ccxt_or(codes == nothing, inArray(code, codes)))))
            if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(code, borrowRateHistories))))
                borrowRateHistories[Symbol(code)] = [];
            end
            borrowRateStructure = self.parseBorrowRate(item);
            borrowRateStructure[Symbol("period")] = 31536000000;
            borrrowRateCode = get(borrowRateHistories, Symbol(code), nothing);
                        push!(borrrowRateCode, borrowRateStructure);
        end
        i += 1
    end
    keys_var = objectKeys(borrowRateHistories);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        code = get(keys_var, i + 1, nothing);
        borrowRateHistories[Symbol(code)] = self.filterByCurrencySinceLimit(get(borrowRateHistories, Symbol(code), nothing), code, since, limit);
        i += 1
    end
    return borrowRateHistories

end
function fetchBorrowRateHistories(self::Okx, codes=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetFinanceSavingsLendingRateHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseBorrowRateHistories(data, codes, since, limit)

end
function fetchBorrowRateHistory(self::Okx, code, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetFinanceSavingsLendingRateHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseBorrowRateHistory(data, code, since, limit)

end
function modifyMarginHelper(self::Okx, symbol, amount, type_var, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    posSide = safeString(params, "posSide", "net");
    params = omit(params, ["posSide"]);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("amt") => amount,
        Symbol("type") => type_var,
        Symbol("posSide") => posSide
    );
    response = Base.fetch(self.privatePostAccountPositionMarginBalance(extend(request, params)));
    data = self.safeList(response, "data", []);
    entry = self.safeDict(data, 0, Dict{Symbol, Any}());
    errorCode = safeString(response, "code");
    return extend(self.parseMarginModification(entry, market), Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((errorCode == "0")) ? "ok" : "failed"
))

end
function parseMarginModification(self::Okx, data, market=nothing)
    amountRaw = safeString2(data, "amt", "posBalChg");
    typeRaw = safeString(data, "type");
    type_var = nothing;
    if functions.ccxtruthy(typeRaw == "6")
        type_var = functions.ccxtruthy(stringGt(amountRaw, "0")) ? "add" : "reduce";
    else
        type_var = typeRaw;
    end
    amount = stringAbs(amountRaw);
    marketId = safeString(data, "instId");
    responseMarket = self.safeMarket(marketId, market);
    code = functions.ccxtruthy(get(responseMarket, Symbol("inverse"), nothing)) ? get(responseMarket, Symbol("base"), nothing) : get(responseMarket, Symbol("quote"), nothing);
    timestamp = safeInteger(data, "ts");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => get(responseMarket, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => self.parseNumber(amount),
    Symbol("code") => code,
    Symbol("total") => nothing,
    Symbol("status") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function reduceMargin(self::Okx, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "reduce", params))

end
function addMargin(self::Okx, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params))

end
function fetchMarketLeverageTiers(self::Okx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    type_var = functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? "MARGIN" : self.convertToInstrumentType(get(market, Symbol("type"), nothing));
    uly = safeString(get(market, Symbol("info"), nothing), "uly");
    if functions.ccxtruthy(!functions.ccxtruthy(uly))
        if functions.ccxtruthy(type_var != "MARGIN")
            throw(BadRequest(string(self.id, " fetchMarketLeverageTiers() cannot fetch leverage tiers for ", symbol)));
        end
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchMarketLeverageTiers", params);
    if functions.ccxtruthy(marginMode == nothing)
        marginMode = safeString(params, "tdMode", "cross");
    end
    request = Dict{Symbol, Any}(
        Symbol("instType") => type_var,
        Symbol("tdMode") => marginMode,
        Symbol("uly") => uly
    );
    if functions.ccxtruthy(type_var == "MARGIN")
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.publicGetPublicPositionTiers(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseMarketLeverageTiers(data, market)

end
function parseMarketLeverageTiers(self::Okx, info, market=nothing)
    tiers = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(info)))
        tier = get(info, i + 1, nothing);
        marketId = safeString(tier, "instId");
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => safeInteger(tier, "tier"),
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("currency") => safeString(market, "quote"),
    Symbol("minNotional") => self.safeNumber(tier, "minSz"),
    Symbol("maxNotional") => self.safeNumber(tier, "maxSz"),
    Symbol("maintenanceMarginRate") => self.safeNumber(tier, "mmr"),
    Symbol("maxLeverage") => self.safeNumber(tier, "maxLever"),
    Symbol("info") => tier
));
        i += 1
    end
    return tiers

end
function fetchBorrowInterest(self::Okx, code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBorrowInterest", params);
    if functions.ccxtruthy(marginMode == nothing)
        marginMode = safeString(params, "mgnMode", "cross");
    end
    request = Dict{Symbol, Any}(
        Symbol("mgnMode") => marginMode
    );
    market = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = since - 1;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instId")] = get(market, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privateGetAccountInterestAccrued(extend(request, params)));
    data = self.safeList(response, "data", []);
    interest = self.parseBorrowInterests(data);
    return self.filterByCurrencySinceLimit(interest, code, since, limit)

end
function parseBorrowInterest(self::Okx, info, market=nothing)
    instId = safeString(info, "instId");
    if functions.ccxtruthy(instId != nothing)
        market = self.safeMarket(instId, market);
    end
    timestamp = safeInteger(info, "ts");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("currency") => self.safeCurrencyCode(safeString(info, "ccy")),
    Symbol("interest") => self.safeNumber(info, "interest"),
    Symbol("interestRate") => self.safeNumber(info, "interestRate"),
    Symbol("amountBorrowed") => self.safeNumber(info, "liab"),
    Symbol("marginMode") => safeString(info, "mgnMode"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function borrowCrossMargin(self::Okx, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing),
        Symbol("amt") => self.currencyToPrecision(code, amount),
        Symbol("side") => "borrow"
    );
    response = Base.fetch(self.privatePostAccountBorrowRepay(extend(request, params)));
    data = self.safeList(response, "data", []);
    loan = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseMarginLoan(loan, currency)

end
function repayCrossMargin(self::Okx, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    id = safeString2(params, "id", "ordId");
    params = omit(params, "id");
    if functions.ccxtruthy(id == nothing)
        throw(ArgumentsRequired(string(self.id, " repayCrossMargin() requires an id parameter")));
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("ccy") => get(currency, Symbol("id"), nothing),
        Symbol("amt") => self.currencyToPrecision(code, amount),
        Symbol("side") => "repay",
        Symbol("ordId") => id
    );
    response = Base.fetch(self.privatePostAccountBorrowRepay(extend(request, params)));
    data = self.safeList(response, "data", []);
    loan = self.safeDict(data, 0, Dict{Symbol, Any}());
    return self.parseMarginLoan(loan, currency)

end
function parseMarginLoan(self::Okx, info, currency=nothing)
    currencyId = safeString(info, "ccy");
    return Dict{Symbol, Any}(
    Symbol("id") => nothing,
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => self.safeNumber(info, "amt"),
    Symbol("symbol") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => info
)

end
function fetchOpenInterest(self::Okx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterest() supports contract markets only")));
    end
    type_var = self.convertToInstrumentType(get(market, Symbol("type"), nothing));
    uly = safeString(get(market, Symbol("info"), nothing), "uly");
    request = Dict{Symbol, Any}(
        Symbol("instType") => type_var,
        Symbol("uly") => uly,
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetPublicOpenInterest(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOpenInterest(get(data, 1, nothing), market)

end
function fetchOpenInterests(self::Okx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols, nothing, true, true);
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        market = self.market(get(symbols, 1, nothing));
    end
    marketType = nothing;
    (marketType, params) = self.handleSubTypeAndParams("fetchOpenInterests", market, params, "swap");
    instType = "SWAP";
    if functions.ccxtruthy(marketType == "future")
        instType = "FUTURES";
    elseif functions.ccxtruthy(instType == "option")
        instType = "OPTION";
    end
    request = Dict{Symbol, Any}(
        Symbol("instType") => instType
    );
    uly = safeString(params, "uly");
    if functions.ccxtruthy(uly != nothing)
        request[Symbol("uly")] = uly;
    end
    instFamily = safeString(params, "instFamily");
    if functions.ccxtruthy(instFamily != nothing)
        request[Symbol("instFamily")] = instFamily;
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(instType == "OPTION", uly == nothing), instFamily == nothing))
        throw(BadRequest(string(self.id, " fetchOpenInterests() requires either uly or instFamily parameter for OPTION markets")));
    end
    response = Base.fetch(self.publicGetPublicOpenInterest(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseOpenInterests(data, symbols)

end
function fetchOpenInterestHistory(self::Okx, symbol, timeframe="1d", since=nothing, limit=nothing, params=Dict())
    options = self.safeDict(self.options, "fetchOpenInterestHistory", Dict{Symbol, Any}());
    timeframes = self.safeDict(options, "timeframes", Dict{Symbol, Any}());
    timeframe = safeString(timeframes, timeframe, timeframe);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(timeframe != "5m", timeframe != "1H"), timeframe != "1D"))
        throw(BadRequest(string(self.id, " fetchOpenInterestHistory cannot only use the 5m, 1h, and 1d timeframe")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currencyId = nothing;
    market = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((@functions.ccxt_and((self.markets != nothing), (ccxt_in(symbol, self.markets)))), (@functions.ccxt_and((self.markets_by_id != nothing), (ccxt_in(symbol, self.markets_by_id))))))
        market = self.market(symbol);
        currencyId = get(market, Symbol("baseId"), nothing);
    else
        currency = self.currency(symbol);
        currencyId = get(currency, Symbol("id"), nothing);
    end
    request = Dict{Symbol, Any}(
        Symbol("ccy") => currencyId,
        Symbol("period") => timeframe
    );
    type_var = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOpenInterestHistory", market, params);
    if functions.ccxtruthy(type_var == "option")
        response = Base.fetch(self.publicGetRubikStatOptionOpenInterestVolume(extend(request, params)));
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("begin")] = since;
        end
        until = safeInteger(params, "until");
        if functions.ccxtruthy(until != nothing)
            request[Symbol("end")] = until;
            params = omit(params, ["until"]);
        end
        response = Base.fetch(self.publicGetRubikStatContractsOpenInterestVolume(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    return self.parseOpenInterestsHistory(data, nothing, since, limit)

end
function parseOpenInterest(self::Okx, interest, market=nothing)
    id = safeString(interest, "instId");
    market = self.safeMarket(id, market);
    time = safeInteger(interest, "ts");
    timestamp = safeInteger(interest, 0, time);
    baseVolume = nothing;
    quoteVolume = nothing;
    openInterestAmount = nothing;
    openInterestValue = nothing;
    type_var = safeString(self.options, "defaultType");
    if functions.ccxtruthy(functions.ccxt_isArray(interest))
        if functions.ccxtruthy(type_var == "option")
            openInterestAmount = self.safeNumber(interest, 1);
            baseVolume = self.safeNumber(interest, 2);
        else
            openInterestValue = self.safeNumber(interest, 1);
            quoteVolume = self.safeNumber(interest, 2);
        end
    else
        baseVolume = self.safeNumber(interest, "oiCcy");
        openInterestAmount = self.safeNumber(interest, "oi");
        openInterestValue = self.safeNumber(interest, "oiUsd");
    end
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(id),
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("openInterestAmount") => openInterestAmount,
    Symbol("openInterestValue") => openInterestValue,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market)

end
function setSandboxMode(self::Okx, enable)
    setSandboxMode(self.parent, enable);
    self.options[Symbol("sandboxMode")] = enable;
    if functions.ccxtruthy(enable)
        self.headers[Symbol("x-simulated-trading")] = "1";
    elseif functions.ccxtruthy(ccxt_in("x-simulated-trading", self.headers))
        self.headers = omit(self.headers, "x-simulated-trading");
    end

end
function fetchDepositWithdrawFees(self::Okx, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(codes != nothing)
        ids = self.currencyIds(codes);
        request[Symbol("ccy")] =         join(ids, ",");
    end
    response = Base.fetch(self.privateGetAssetCurrencies(extend(request, params)));
    data = self.safeList(response, "data");
    return self.parseDepositWithdrawFees(data, codes)

end
function parseDepositWithdrawFees(self::Okx, response, codes=nothing, currencyIdKey=nothing)
    depositWithdrawFees = Dict{Symbol, Any}();
    codes = self.marketCodes(codes);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        feeInfo = get(response, i + 1, nothing);
        currencyId = safeString(feeInfo, "ccy");
        code = self.safeCurrencyCode(currencyId);
        if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (@functions.ccxt_or((codes == nothing), (inArray(code, codes))))))
            depositWithdrawFee = safeValue(depositWithdrawFees, code);
            if functions.ccxtruthy(depositWithdrawFee == nothing)
                depositWithdrawFees[Symbol(code)] = self.depositWithdrawFee(Dict{Symbol, Any}());
            end
            if functions.ccxtruthy(currencyId != nothing)
                depositWithdrawFees[Symbol(code)][Symbol("info")][Symbol(currencyId)] = feeInfo;
            end
            chain = safeString(feeInfo, "chain");
            if functions.ccxtruthy(chain == nothing)
                i += 1; continue
            end
            chainSplit = split(chain, "-");
            networkId = safeValue(chainSplit, 1);
            withdrawFee = self.safeNumber(feeInfo, "fee");
            withdrawResult = Dict{Symbol, Any}(
                Symbol("fee") => withdrawFee,
                Symbol("percentage") => functions.ccxtruthy((withdrawFee != nothing)) ? false : nothing
            );
            depositResult = Dict{Symbol, Any}(
                Symbol("fee") => nothing,
                Symbol("percentage") => nothing
            );
            networkCode = self.networkIdToCode(networkId, code);
            if functions.ccxtruthy(networkCode != nothing)
                depositWithdrawFees[Symbol(code)][Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
                    Symbol("withdraw") => withdrawResult,
                    Symbol("deposit") => depositResult
                );
            end
        end
        i += 1
    end
    depositWithdrawCodes = objectKeys(depositWithdrawFees);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(depositWithdrawCodes)))
        code = get(depositWithdrawCodes, i + 1, nothing);
        currency = self.currency(code);
        depositWithdrawFees[Symbol(code)] = self.assignDefaultDepositWithdrawFees(get(depositWithdrawFees, Symbol(code), nothing), currency);
        i += 1
    end
    return depositWithdrawFees

end
function fetchSettlementHistory(self::Okx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchSettlementHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchSettlementHistory", market, params);
    if functions.ccxtruthy(@functions.ccxt_and(type_var != "future", type_var != "option"))
        throw(NotSupported(string(self.id, " fetchSettlementHistory() supports futures and options markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(type_var),
        Symbol("uly") => string(get(market, Symbol("baseId"), nothing), "-", get(market, Symbol("quoteId"), nothing))
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = since - 1;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetPublicDeliveryExerciseHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    settlements = self.parseSettlements(data, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, get(market, Symbol("symbol"), nothing), since, limit)

end
function parseSettlement(self::Okx, settlement, market)
    marketId = safeString(settlement, "insId");
    return Dict{Symbol, Any}(
    Symbol("info") => settlement,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("price") => self.safeNumber(settlement, "px"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
function parseSettlements(self::Okx, settlements, market)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settlements)))
        entry = get(settlements, i + 1, nothing);
        timestamp = safeInteger(entry, "ts");
        details = self.safeList(entry, "details", []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(details)))
            settlement = self.parseSettlement(get(details, j + 1, nothing), market);
            push!(result, extend(settlement, Dict{Symbol, Any}(
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)));
            j += 1
        end
        i += 1
    end
    return result

end
function fetchUnderlyingAssets(self::Okx, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchUnderlyingAssets", nothing, params);
    if functions.ccxtruthy(@functions.ccxt_or((marketType == nothing), (marketType == "spot")))
        marketType = "option";
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((marketType != "option"), (marketType != "swap")), (marketType != "future")))
        throw(NotSupported(string(self.id, " fetchUnderlyingAssets() supports contract markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("instType") => self.convertToInstrumentType(marketType)
    );
    response = Base.fetch(self.publicGetPublicUnderlying(extend(request, params)));
    underlyings = self.safeList(response, "data", []);
    return get(underlyings, 1, nothing)

end
function fetchGreeks(self::Okx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marketId = safeString(market, "id", "");
    optionParts = split(marketId, "-");
    request = Dict{Symbol, Any}(
        Symbol("uly") => get(get(market, Symbol("info"), nothing), Symbol("uly"), nothing),
        Symbol("instFamily") => get(get(market, Symbol("info"), nothing), Symbol("instFamily"), nothing),
        Symbol("expTime") => safeString(optionParts, 2)
    );
    response = Base.fetch(self.publicGetPublicOptSummary(extend(request, params)));
    data = self.safeList(response, "data", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        entryMarketId = safeString(entry, "instId");
        if functions.ccxtruthy(entryMarketId == marketId)
                return self.parseGreeks(entry, market)
        end
        i += 1
    end
    throw(NullResponse(string(self.id, " fetchGreeks() could not find greeks for ", symbol)));

end
function fetchAllGreeks(self::Okx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
    symbolsLength = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
    end
    if functions.ccxtruthy(@functions.ccxt_or((symbols == nothing), (symbolsLength != 1)))
        uly = safeString(params, "uly");
        if functions.ccxtruthy(uly != nothing)
            request[Symbol("uly")] = uly;
        end
        instFamily = safeString(params, "instFamily");
        if functions.ccxtruthy(instFamily != nothing)
            request[Symbol("instFamily")] = instFamily;
        end
        if functions.ccxtruthy(@functions.ccxt_and((uly == nothing), (instFamily == nothing)))
            throw(BadRequest(string(self.id, " fetchAllGreeks() requires either a uly or instFamily parameter")));
        end
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        if functions.ccxtruthy(symbolsLength == 1)
            market = self.market(get(symbols, 1, nothing));
            marketId = safeString(market, "id", "");
            optionParts = split(marketId, "-");
            request[Symbol("uly")] = get(get(market, Symbol("info"), nothing), Symbol("uly"), nothing);
            request[Symbol("instFamily")] = get(get(market, Symbol("info"), nothing), Symbol("instFamily"), nothing);
            request[Symbol("expTime")] = safeString(optionParts, 2);
        end
    end
    params = omit(params, ["uly", "instFamily"]);
    response = Base.fetch(self.publicGetPublicOptSummary(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseAllGreeks(data, symbols)

end
function parseGreeks(self::Okx, greeks, market=nothing)
    timestamp = safeInteger(greeks, "ts");
    marketId = safeString(greeks, "instId");
    symbol = self.safeSymbol(marketId, market);
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("delta") => self.safeNumber(greeks, "delta"),
    Symbol("gamma") => self.safeNumber(greeks, "gamma"),
    Symbol("theta") => self.safeNumber(greeks, "theta"),
    Symbol("vega") => self.safeNumber(greeks, "vega"),
    Symbol("rho") => nothing,
    Symbol("bidSize") => nothing,
    Symbol("askSize") => nothing,
    Symbol("bidImpliedVolatility") => self.safeNumber(greeks, "bidVol"),
    Symbol("askImpliedVolatility") => self.safeNumber(greeks, "askVol"),
    Symbol("markImpliedVolatility") => self.safeNumber(greeks, "markVol"),
    Symbol("bidPrice") => nothing,
    Symbol("askPrice") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => nothing,
    Symbol("underlyingPrice") => nothing,
    Symbol("info") => greeks
)

end
function closePosition(self::Okx, symbol, side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderId = safeString(params, "clientOrderId");
    code = safeString(params, "code");
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("closePosition", params, "cross");
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing),
        Symbol("mgnMode") => marginMode
    );
    if functions.ccxtruthy(side != nothing)
        if functions.ccxtruthy((side == "buy"))
            request[Symbol("posSide")] = "long";
        elseif functions.ccxtruthy(side == "sell")
            request[Symbol("posSide")] = "short";
        else
            request[Symbol("posSide")] = side;
        end
    end
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clOrdId")] = clientOrderId;
    end
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("ccy")] = get(currency, Symbol("id"), nothing);
    end
    response = Base.fetch(self.privatePostTradeClosePosition(extend(request, params)));
    data = self.safeList(response, "data", []);
    order = self.safeDict(data, 0);
    return self.parseOrder(order, market)

end
function fetchOption(self::Okx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetMarketTicker(extend(request, params)));
    result = self.safeList(response, "data", []);
    chain = self.safeDict(result, 0, Dict{Symbol, Any}());
    return self.parseOption(chain, nothing, market)

end
function fetchOptionChain(self::Okx, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("uly") => string(get(currency, Symbol("code"), nothing), "-USD"),
        Symbol("instType") => "OPTION"
    );
    response = Base.fetch(self.publicGetMarketTickers(extend(request, params)));
    result = self.safeList(response, "data", []);
    return self.parseOptionChain(result, nothing, "instId")

end
function parseOption(self::Okx, chain, currency=nothing, market=nothing)
    marketId = safeString(chain, "instId");
    market = self.safeMarket(marketId, market);
    timestamp = safeInteger(chain, "ts");
    return Dict{Symbol, Any}(
    Symbol("info") => chain,
    Symbol("currency") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("impliedVolatility") => nothing,
    Symbol("openInterest") => nothing,
    Symbol("bidPrice") => self.safeNumber(chain, "bidPx"),
    Symbol("askPrice") => self.safeNumber(chain, "askPx"),
    Symbol("midPrice") => nothing,
    Symbol("markPrice") => nothing,
    Symbol("lastPrice") => self.safeNumber(chain, "last"),
    Symbol("underlyingPrice") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("baseVolume") => self.safeNumber(chain, "volCcy24h"),
    Symbol("quoteVolume") => nothing
)

end
function fetchConvertQuote(self::Okx, fromCode, toCode, amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("baseCcy") => uppercase(fromCode),
        Symbol("quoteCcy") => uppercase(toCode),
        Symbol("rfqSzCcy") => uppercase(fromCode),
        Symbol("rfqSz") => numberToString(amount),
        Symbol("side") => "sell"
    );
    response = Base.fetch(self.privatePostAssetConvertEstimateQuote(extend(request, params)));
    data = self.safeList(response, "data", []);
    result = self.safeDict(data, 0, Dict{Symbol, Any}());
    fromCurrencyId = safeString(result, "baseCcy", fromCode);
    fromCurrency = self.currency(fromCurrencyId);
    toCurrencyId = safeString(result, "quoteCcy", toCode);
    toCurrency = self.currency(toCurrencyId);
    return self.parseConversion(result, fromCurrency, toCurrency)

end
function createConvertTrade(self::Okx, id, fromCode, toCode, amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("quoteId") => id,
        Symbol("baseCcy") => fromCode,
        Symbol("quoteCcy") => toCode,
        Symbol("szCcy") => fromCode,
        Symbol("sz") => numberToString(amount),
        Symbol("side") => "sell"
    );
    response = Base.fetch(self.privatePostAssetConvertTrade(extend(request, params)));
    data = self.safeList(response, "data", []);
    result = self.safeDict(data, 0, Dict{Symbol, Any}());
    fromCurrencyId = safeString(result, "baseCcy", fromCode);
    fromCurrency = self.currency(fromCurrencyId);
    toCurrencyId = safeString(result, "quoteCcy", toCode);
    toCurrency = self.currency(toCurrencyId);
    return self.parseConversion(result, fromCurrency, toCurrency)

end
function fetchConvertTrade(self::Okx, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("clTReqId") => id
    );
    response = Base.fetch(self.privateGetAssetConvertHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    result = self.safeDict(data, 0, Dict{Symbol, Any}());
    fromCurrencyId = safeString(result, "baseCcy");
    toCurrencyId = safeString(result, "quoteCcy");
    fromCurrency = nothing;
    toCurrency = nothing;
    if functions.ccxtruthy(fromCurrencyId != nothing)
        fromCurrency = self.currency(fromCurrencyId);
    end
    if functions.ccxtruthy(toCurrencyId != nothing)
        toCurrency = self.currency(toCurrencyId);
    end
    return self.parseConversion(result, fromCurrency, toCurrency)

end
function fetchConvertTradeHistory(self::Okx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    (request, params) = self.handleUntilOption("after", request, params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("before")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetAssetConvertHistory(extend(request, params)));
    rows = self.safeList(response, "data", []);
    return self.parseConversions(rows, code, "baseCcy", "quoteCcy", since, limit)

end
function parseConversion(self::Okx, conversion, fromCurrency=nothing, toCurrency=nothing)
    timestamp = safeInteger2(conversion, "quoteTime", "ts");
    fromCoin = safeString(conversion, "baseCcy");
    fromCode = self.safeCurrencyCode(fromCoin, fromCurrency);
    to = safeString(conversion, "quoteCcy");
    toCode = self.safeCurrencyCode(to, toCurrency);
    return Dict{Symbol, Any}(
    Symbol("info") => conversion,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeStringN(conversion, ["clQReqId", "tradeId", "quoteId"]),
    Symbol("fromCurrency") => fromCode,
    Symbol("fromAmount") => self.safeNumber2(conversion, "baseSz", "fillBaseSz"),
    Symbol("toCurrency") => toCode,
    Symbol("toAmount") => self.safeNumber2(conversion, "quoteSz", "fillQuoteSz"),
    Symbol("price") => self.safeNumber2(conversion, "cnvtPx", "fillPx"),
    Symbol("fee") => nothing
)

end
function fetchConvertCurrencies(self::Okx, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetAssetConvertCurrencies(params));
    result = Dict{Symbol, Any}();
    data = self.safeList(response, "data", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        id = safeString(entry, "ccy");
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
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("amount") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(entry, "min"),
                        Symbol("max") => self.safeNumber(entry, "max")
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
function handleErrors(self::Okx, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    code = safeString(response, "code");
    if functions.ccxtruthy(@functions.ccxt_and((code != "0"), (code != "2")))
        feedback = string(self.id, " ", body);
        data = self.safeList(response, "data", []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
            error = get(data, i + 1, nothing);
            errorCode = safeString(error, "sCode");
            message = safeString(error, "sMsg");
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
            i += 1
        end

        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end
function fetchMarginAdjustmentHistory(self::Okx, symbol=nothing, type_var=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    auto = self.safeBool(params, "auto");
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMarginAdjustmentHistory () requires a type argument")));
    end
    isAdd = type_var == "add";
    subType = functions.ccxtruthy(isAdd) ? "160" : "161";
    if functions.ccxtruthy(auto)
        if functions.ccxtruthy(isAdd)
            subType = "162";
        else
            throw(BadRequest(string(self.id, " cannot fetch margin adjustments for type ", type_var)));
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("subType") => subType,
        Symbol("mgnMode") => "isolated"
    );
    until = safeInteger(params, "until");
    params = omit(params, "until");
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
    now = milliseconds();
    oneWeekAgo = now - 604800000;
    threeMonthsAgo = now - 7776000000;
    if functions.ccxtruthy(@functions.ccxt_or((since == nothing), (functions.ccxt_gt(since, oneWeekAgo))))
        response = Base.fetch(self.privateGetAccountBills(extend(request, params)));
    elseif functions.ccxtruthy(functions.ccxt_gt(since, threeMonthsAgo))
        response = Base.fetch(self.privateGetAccountBillsArchive(extend(request, params)));
    else
        throw(BadRequest(string(self.id, " fetchMarginAdjustmentHistory () cannot fetch margin adjustments older than 3 months")));
    end
    data = self.safeList(response, "data", []);
    modifications = self.parseMarginModifications(data);
    return self.filterBySymbolSinceLimit(modifications, symbol, since, limit)

end
function fetchPositionsHistory(self::Okx, symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = safeString(params, "marginMode");
    instType = safeStringUpper(params, "instType");
    params = omit(params, ["until", "marginMode", "instType"]);
    if functions.ccxtruthy(limit == nothing)
        limit = 100;
    end
    request = Dict{Symbol, Any}(
        Symbol("limit") => limit
    );
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 1)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("instId")] = get(market, Symbol("id"), nothing);
        end
    end
    if functions.ccxtruthy(marginMode != nothing)
        request[Symbol("mgnMode")] = marginMode;
    end
    if functions.ccxtruthy(instType != nothing)
        request[Symbol("instType")] = instType;
    end
    response = Base.fetch(self.privateGetAccountPositionsHistory(extend(request, params)));
    data = self.safeList(response, "data", []);
    positions = self.parsePositions(data, symbols, params);
    return self.filterBySinceLimit(positions, since, limit)

end
function fetchLongShortRatioHistory(self::Okx, symbol=nothing, timeframe=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchLongShortRatioHistory() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instId") => get(market, Symbol("id"), nothing)
    );
    until = safeString2(params, "until", "end");
    params = omit(params, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("end")] = until;
    end
    if functions.ccxtruthy(timeframe != nothing)
        request[Symbol("period")] = safeString(self.timeframes, timeframe, timeframe);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("begin")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetRubikStatContractsLongShortAccountRatioContract(extend(request, params)));
    data = self.safeList(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        push!(result, Dict{Symbol, Any}(
    Symbol("timestamp") => safeString(entry, 0),
    Symbol("longShortRatio") => safeString(entry, 1)
));
        i += 1
    end
    return self.parseLongShortRatioHistory(result, market)

end
function parseLongShortRatio(self::Okx, info, market=nothing)
    timestamp = safeInteger(info, "timestamp");
    symbol = nothing;
    if functions.ccxtruthy(market != nothing)
        symbol = get(market, Symbol("symbol"), nothing);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timeframe") => nothing,
    Symbol("longShortRatio") => self.safeNumber(info, "longShortRatio")
)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Okx, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetMarketTickers(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/tickers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketTicker(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketBooks(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/books", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketBooksFull(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/books-full", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketCandles(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketHistoryCandles(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/history-candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketTrades(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketHistoryTrades(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/history-trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketOptionInstrumentFamilyTrades(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/option/instrument-family-trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketPlatform24Volume(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/platform-24-volume", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketCallAuctionDetail(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/call-auction-detail", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketCallAuctionDetails(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/call-auction-details", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketBooksSbe(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/books-sbe", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketBlockTickers(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/block-tickers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketBlockTicker(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/block-ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketSprdTicker(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/sprd-ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketSprdCandles(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/sprd-candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketSprdHistoryCandles(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/sprd-history-candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketIndexTickers(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/index-tickers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketIndexCandles(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/index-candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketHistoryIndexCandles(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/history-index-candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketMarkPriceCandles(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/mark-price-candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketHistoryMarkPriceCandles(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/history-mark-price-candles", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketExchangeRate(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/exchange-rate", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketIndexComponents(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/index-components", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketOpenOracle(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/open-oracle", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetMarketBooksLite(self::Okx, params=Dict(), context=Dict())
    return request(self, "market/books-lite", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicOptionTrades(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/option-trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicBlockTrades(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/block-trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicInstruments(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/instruments", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicEstimatedPrice(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/estimated-price", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicDeliveryExerciseHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/delivery-exercise-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicEstimatedSettlementInfo(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/estimated-settlement-info", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicSettlementHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/settlement-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFundingRate(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/funding-rate", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicFundingRateHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/funding-rate-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicOpenInterest(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/open-interest", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicPriceLimit(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/price-limit", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicOptSummary(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/opt-summary", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicDiscountRateInterestFreeQuota(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/discount-rate-interest-free-quota", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicTime(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/time", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicMarkPrice(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/mark-price", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicPositionTiers(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/position-tiers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicInterestRateLoanQuota(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/interest-rate-loan-quota", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicUnderlying(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/underlying", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicInsuranceFund(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/insurance-fund", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicConvertContractCoin(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/convert-contract-coin", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicInstrumentTickBands(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/instrument-tick-bands", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicPremiumHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/premium-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicEconomicCalendar(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/economic-calendar", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicMarketDataHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/market-data-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicEventContractEvents(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/event-contract/events", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicEventContractMarkets(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/event-contract/markets", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicEventContractSeries(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/event-contract/series", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetPublicVipInterestRateLoanQuota(self::Okx, params=Dict(), context=Dict())
    return request(self, "public/vip-interest-rate-loan-quota", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatTradingDataSupportCoin(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/trading-data/support-coin", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatContractsOpenInterestHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/contracts/open-interest-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatTakerVolume(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/taker-volume", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatTakerVolumeContract(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/taker-volume-contract", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatMarginLoanRatio(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/margin/loan-ratio", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatContractsLongShortAccountRatioContractTopTrader(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/contracts/long-short-account-ratio-contract-top-trader", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatContractsLongShortPositionRatioContractTopTrader(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/contracts/long-short-position-ratio-contract-top-trader", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatContractsLongShortAccountRatioContract(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/contracts/long-short-account-ratio-contract", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatContractsLongShortAccountRatio(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/contracts/long-short-account-ratio", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatContractsOpenInterestVolume(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/contracts/open-interest-volume", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatOptionOpenInterestVolume(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/option/open-interest-volume", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatOptionOpenInterestVolumeRatio(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/option/open-interest-volume-ratio", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatOptionOpenInterestVolumeExpiry(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/option/open-interest-volume-expiry", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatOptionOpenInterestVolumeStrike(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/option/open-interest-volume-strike", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetRubikStatOptionTakerBlockVolume(self::Okx, params=Dict(), context=Dict())
    return request(self, "rubik/stat/option/taker-block-volume", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSystemStatus(self::Okx, params=Dict(), context=Dict())
    return request(self, "system/status", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSprdSpreads(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/spreads", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSprdBooks(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/books", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSprdPublicTrades(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/public-trades", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSprdTicker(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/ticker", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTradingBotGridAiParam(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/ai-param", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTradingBotGridMinInvestment(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/min-investment", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTradingBotPublicRsiBackTesting(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/public/rsi-back-testing", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetTradingBotGridGridQuantity(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/grid-quantity", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetAssetExchangeList(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/exchange-list", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFinanceStakingDefiEthApyHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/eth/apy-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFinanceStakingDefiSolApyHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/sol/apy-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFinanceSavingsLendingRateSummary(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/savings/lending-rate-summary", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFinanceSavingsLendingRateHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/savings/lending-rate-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFinanceFixedLoanLendingOffers(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/fixed-loan/lending-offers", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFinanceFixedLoanLendingApyHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/fixed-loan/lending-apy-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFinanceFixedLoanPendingLendingVolume(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/fixed-loan/pending-lending-volume", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetFinanceSfpDcdProducts(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/products", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCopytradingPublicConfig(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/public-config", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCopytradingPublicLeadTraders(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/public-lead-traders", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCopytradingPublicWeeklyPnl(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/public-weekly-pnl", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCopytradingPublicPnl(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/public-pnl", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCopytradingPublicStats(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/public-stats", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCopytradingPublicPreferenceCurrency(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/public-preference-currency", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCopytradingPublicCurrentSubpositions(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/public-current-subpositions", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCopytradingPublicSubpositionsHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/public-subpositions-history", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetCopytradingPublicCopyTraders(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/public-copy-traders", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSupportAnnouncements(self::Okx, params=Dict(), context=Dict())
    return request(self, "support/announcements", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSupportAnnouncementsTypes(self::Okx, params=Dict(), context=Dict())
    return request(self, "support/announcements-types", "public", "GET", params, nothing, nothing, Dict())
end

function publicGetSupportAnnouncementTypes(self::Okx, params=Dict(), context=Dict())
    return request(self, "support/announcement-types", "public", "GET", params, nothing, nothing, Dict())
end

function publicPostTradingBotGridMinInvestment(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/min-investment", "public", "POST", params, nothing, nothing, Dict())
end

function privateGetRfqCounterparties(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/counterparties", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetRfqMakerInstrumentSettings(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/maker-instrument-settings", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetRfqMmpConfig(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/mmp-config", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetRfqRfqs(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/rfqs", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetRfqQuotes(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/quotes", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetRfqTrades(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/trades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetRfqPublicTrades(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/public-trades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSprdOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSprdOrdersPending(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/orders-pending", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSprdOrdersHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/orders-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSprdOrdersHistoryArchive(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/orders-history-archive", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSprdTrades(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/trades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOrdersPending(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/orders-pending", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOrdersHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/orders-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOrdersHistoryArchive(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/orders-history-archive", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeFills(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/fills", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeFillsHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/fills-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeFillsArchive(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/fills-archive", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/order-algo", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOrdersAlgoPending(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/orders-algo-pending", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOrdersAlgoHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/orders-algo-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeEasyConvertCurrencyList(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/easy-convert-currency-list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeEasyConvertHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/easy-convert-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOneClickRepayCurrencyList(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/one-click-repay-currency-list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOneClickRepayCurrencyListV2(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/one-click-repay-currency-list-v2", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOneClickRepayHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/one-click-repay-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeOneClickRepayHistoryV2(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/one-click-repay-history-v2", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradeAccountRateLimit(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/account-rate-limit", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetCurrencies(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/currencies", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetBalances(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/balances", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetNonTradableAssets(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/non-tradable-assets", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetAssetValuation(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/asset-valuation", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetTransferState(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/transfer-state", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetBills(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/bills", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetBillsHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/bills-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetDepositLightning(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/deposit-lightning", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetDepositAddress(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/deposit-address", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetDepositHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/deposit-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetWithdrawalHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/withdrawal-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetDepositWithdrawStatus(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/deposit-withdraw-status", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetMonthlyStatement(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/monthly-statement", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetConvertCurrencies(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/convert/currencies", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetConvertCurrencyPair(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/convert/currency-pair", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetConvertHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/convert/history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountInstruments(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/instruments", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountBalance(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountPositions(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountPositionsHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/positions-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountAccountPositionRisk(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/account-position-risk", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountBills(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/bills", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountBillsArchive(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/bills-archive", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountBillsHistoryArchive(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/bills-history-archive", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountConfig(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/config", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountSubtypes(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/subtypes", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountMaxSize(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/max-size", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountMaxAvailSize(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/max-avail-size", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountLeverageInfo(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/leverage-info", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountAdjustLeverageInfo(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/adjust-leverage-info", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountMaxLoan(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/max-loan", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountTradeFee(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/trade-fee", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountInterestAccrued(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/interest-accrued", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountInterestRate(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/interest-rate", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountMaxWithdrawal(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/max-withdrawal", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountRiskState(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/risk-state", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountInterestLimits(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/interest-limits", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountSpotBorrowRepayHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/spot-borrow-repay-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountGreeks(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/greeks", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountPositionTiers(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/position-tiers", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountSetAccountSwitchPrecheck(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-account-switch-precheck", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountCollateralAssets(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/collateral-assets", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountMmpConfig(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/mmp-config", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountMovePositionsHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/move-positions-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountPrecheckSetDeltaNeutral(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/precheck-set-delta-neutral", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountQuickMarginBorrowRepayHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/quick-margin-borrow-repay-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountBorrowRepayHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/borrow-repay-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountVipInterestAccrued(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/vip-interest-accrued", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountVipInterestDeducted(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/vip-interest-deducted", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountVipLoanOrderList(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/vip-loan-order-list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountVipLoanOrderDetail(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/vip-loan-order-detail", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountFixedLoanBorrowingLimit(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/fixed-loan/borrowing-limit", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountFixedLoanBorrowingQuote(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/fixed-loan/borrowing-quote", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountFixedLoanBorrowingOrdersList(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/fixed-loan/borrowing-orders-list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountSpotManualBorrowRepay(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/spot-manual-borrow-repay", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountSetAutoRepay(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-auto-repay", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUsersSubaccountList(self::Okx, params=Dict(), context=Dict())
    return request(self, "users/subaccount/list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountSubaccountBalances(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/subaccount/balances", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetSubaccountBalances(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/subaccount/balances", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountSubaccountMaxWithdrawal(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/subaccount/max-withdrawal", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetSubaccountBills(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/subaccount/bills", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetSubaccountManagedSubaccountBills(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/subaccount/managed-subaccount-bills", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUsersEntrustSubaccountList(self::Okx, params=Dict(), context=Dict())
    return request(self, "users/entrust-subaccount-list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAccountSubaccountInterestLimits(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/subaccount/interest-limits", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUsersSubaccountApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "users/subaccount/apikey", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotGridOrdersAlgoPending(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/orders-algo-pending", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotGridOrdersAlgoHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/orders-algo-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotGridOrdersAlgoDetails(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/orders-algo-details", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotGridSubOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/sub-orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotGridPositions(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotGridAiParam(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/ai-param", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotSignalSignals(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/signals", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotSignalOrdersAlgoDetails(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/orders-algo-details", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotSignalOrdersAlgoPending(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/orders-algo-pending", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotSignalOrdersAlgoHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/orders-algo-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotSignalPositions(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotSignalPositionsHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/positions-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotSignalSubOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/sub-orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotSignalEventHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/event-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotRecurringOrdersAlgoPending(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/orders-algo-pending", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotRecurringOrdersAlgoHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/orders-algo-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotRecurringOrdersAlgoDetails(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/orders-algo-details", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotRecurringSubOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/sub-orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotDcaOngoingList(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/ongoing-list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotDcaHistoryList(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/history-list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotDcaOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotDcaPositionDetails(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/position-details", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetTradingBotDcaCycleList(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/cycle-list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceSavingsBalance(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/savings/balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceSavingsLendingHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/savings/lending-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceStakingDefiOffers(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/offers", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceStakingDefiOrdersActive(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/orders-active", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceStakingDefiOrdersHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/orders-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceStakingDefiEthProductInfo(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/eth/product-info", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceStakingDefiEthBalance(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/eth/balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceStakingDefiEthPurchaseRedeemHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/eth/purchase-redeem-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceStakingDefiSolProductInfo(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/sol/product-info", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceStakingDefiSolBalance(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/sol/balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceStakingDefiSolPurchaseRedeemHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/sol/purchase-redeem-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceFlexibleLoanBorrowCurrencies(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/flexible-loan/borrow-currencies", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceFlexibleLoanCollateralAssets(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/flexible-loan/collateral-assets", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceFlexibleLoanMaxCollateralRedeemAmount(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/flexible-loan/max-collateral-redeem-amount", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceFlexibleLoanLoanInfo(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/flexible-loan/loan-info", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceFlexibleLoanLoanHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/flexible-loan/loan-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceFlexibleLoanInterestAccrued(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/flexible-loan/interest-accrued", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingCurrentSubpositions(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/current-subpositions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingSubpositionsHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/subpositions-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingInstruments(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/instruments", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingProfitSharingDetails(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/profit-sharing-details", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingTotalProfitSharing(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/total-profit-sharing", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingUnrealizedProfitSharingDetails(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/unrealized-profit-sharing-details", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingTotalUnrealizedProfitSharing(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/total-unrealized-profit-sharing", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingConfig(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/config", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingCopySettings(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/copy-settings", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingCurrentLeadTraders(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/current-lead-traders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingBatchLeverageInfo(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/batch-leverage-info", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetCopytradingLeadTradersHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/lead-traders-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerDmaSubaccountInfo(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/dma/subaccount-info", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerDmaSubaccountTradeFee(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/dma/subaccount-trade-fee", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerDmaSubaccountApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/dma/subaccount/apikey", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerDmaRebatePerOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/dma/rebate-per-orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerFdRebatePerOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/fd/rebate-per-orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerFdIfRebate(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/fd/if-rebate", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerNdInfo(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/info", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerNdSubaccountInfo(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/subaccount-info", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerNdSubaccountApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/subaccount/apikey", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetBrokerNdSubaccountDepositAddress(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/broker/nd/subaccount-deposit-address", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetBrokerNdSubaccountDepositHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/broker/nd/subaccount-deposit-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAssetBrokerNdSubaccountWithdrawalHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/broker/nd/subaccount-withdrawal-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerNdRebateDaily(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/rebate-daily", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetBrokerNdRebatePerOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/rebate-per-orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceSfpDcdOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceSfpDcdOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/orders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceSfpDcdCurrencyPair(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/currency-pair", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceSfpDcdOrderStatus(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/order-status", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetFinanceSfpDcdOrderHistory(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/order-history", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetAffiliateInviteeDetail(self::Okx, params=Dict(), context=Dict())
    return request(self, "affiliate/invitee/detail", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetUsersPartnerIfRebate(self::Okx, params=Dict(), context=Dict())
    return request(self, "users/partner/if-rebate", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetSupportAnnouncements(self::Okx, params=Dict(), context=Dict())
    return request(self, "support/announcements", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostRfqCreateRfq(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/create-rfq", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqCancelRfq(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/cancel-rfq", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqCancelBatchRfqs(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/cancel-batch-rfqs", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqCancelAllRfqs(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/cancel-all-rfqs", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqExecuteQuote(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/execute-quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqMakerInstrumentSettings(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/maker-instrument-settings", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqMmpReset(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/mmp-reset", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqMmpConfig(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/mmp-config", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqCreateQuote(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/create-quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqCancelQuote(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/cancel-quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqCancelBatchQuotes(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/cancel-batch-quotes", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqCancelAllQuotes(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/cancel-all-quotes", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqCancelAllAfter(self::Okx, params=Dict(), context=Dict())
    return request(self, "rfq/cancel-all-after", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSprdOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSprdCancelOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/cancel-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSprdMassCancel(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/mass-cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSprdAmendOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/amend-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSprdCancelAllAfter(self::Okx, params=Dict(), context=Dict())
    return request(self, "sprd/cancel-all-after", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeBatchOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/batch-orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeCancelOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/cancel-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeCancelBatchOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/cancel-batch-orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeAmendOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/amend-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeAmendBatchOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/amend-batch-orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeClosePosition(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/close-position", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeFillsArchive(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/fills-archive", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeCancelAdvanceAlgos(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/cancel-advance-algos", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeEasyConvert(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/easy-convert", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeOneClickRepay(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/one-click-repay", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeOneClickRepayV2(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/one-click-repay-v2", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeMassCancel(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/mass-cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeCancelAllAfter(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/cancel-all-after", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeOrderPrecheck(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/order-precheck", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeCancelAlgos(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/cancel-algos", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradeAmendAlgos(self::Okx, params=Dict(), context=Dict())
    return request(self, "trade/amend-algos", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetTransfer(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetWithdrawal(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/withdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetWithdrawalLightning(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/withdrawal-lightning", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetCancelWithdrawal(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/cancel-withdrawal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetConvertDustAssets(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/convert-dust-assets", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetMonthlyStatement(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/monthly-statement", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetConvertEstimateQuote(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/convert/estimate-quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetConvertTrade(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/convert/trade", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountBillsHistoryArchive(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/bills-history-archive", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetPositionMode(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-position-mode", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetLeverage(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-leverage", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountPositionMarginBalance(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/position/margin-balance", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetFeeType(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-fee-type", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetGreeks(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-greeks", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetIsolatedMode(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-isolated-mode", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSpotManualBorrowRepay(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/spot-manual-borrow-repay", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetAutoRepay(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-auto-repay", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountQuickMarginBorrowRepay(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/quick-margin-borrow-repay", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountBorrowRepay(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/borrow-repay", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSimulatedMargin(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/simulated_margin", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountPositionBuilder(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/position-builder", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountPositionBuilderGraph(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/position-builder-graph", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetRiskOffsetType(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-riskOffset-type", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetRiskOffsetAmt(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-riskOffset-amt", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountActivateOption(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/activate-option", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetAutoLoan(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-auto-loan", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountAccountLevelSwitchPreset(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/account-level-switch-preset", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetAccountLevel(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-account-level", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetCollateralAssets(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-collateral-assets", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountMmpReset(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/mmp-reset", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountMmpConfig(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/mmp-config", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountFixedLoanBorrowingOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/fixed-loan/borrowing-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountFixedLoanAmendBorrowingOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/fixed-loan/amend-borrowing-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountFixedLoanManualReborrow(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/fixed-loan/manual-reborrow", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountFixedLoanRepayBorrowingOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/fixed-loan/repay-borrowing-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountMovePositions(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/move-positions", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetAutoEarn(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-auto-earn", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetSettleCurrency(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-settle-currency", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSetTradingConfig(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/set-trading-config", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountDemoAdjustBalance(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/demo-adjust-balance", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetSubaccountTransfer(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/subaccount/transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAccountSubaccountSetLoanAllocation(self::Okx, params=Dict(), context=Dict())
    return request(self, "account/subaccount/set-loan-allocation", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUsersSubaccountCreateSubaccount(self::Okx, params=Dict(), context=Dict())
    return request(self, "users/subaccount/create-subaccount", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUsersSubaccountApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "users/subaccount/apikey", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUsersSubaccountModifyApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "users/subaccount/modify-apikey", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUsersSubaccountSubaccountApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "users/subaccount/subaccount-apikey", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUsersSubaccountDeleteApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "users/subaccount/delete-apikey", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUsersSubaccountSetTransferOut(self::Okx, params=Dict(), context=Dict())
    return request(self, "users/subaccount/set-transfer-out", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridCopyOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/copy-order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridAmendAlgoBasicParam(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/amend-algo-basic-param", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridAmendOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/amend-order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridStopOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/stop-order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridClosePosition(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/close-position", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridCancelCloseOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/cancel-close-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridOrderInstantTrigger(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/order-instant-trigger", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridWithdrawIncome(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/withdraw-income", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridComputeMarginBalance(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/compute-margin-balance", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridMarginBalance(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/margin-balance", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridMinInvestment(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/min-investment", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotGridAdjustInvestment(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/grid/adjust-investment", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotSignalCreateSignal(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/create-signal", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotSignalOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotSignalStopOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/stop-order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotSignalMarginBalance(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/margin-balance", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotSignalAmendTPSL(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/amendTPSL", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotSignalSetInstruments(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/set-instruments", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotSignalClosePosition(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/close-position", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotSignalSubOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/sub-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotSignalCancelSubOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/signal/cancel-sub-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotRecurringOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotRecurringAmendOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/amend-order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotRecurringStopOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/stop-order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotDcaCreate(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/create", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotDcaAmendOrderAlgo(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/amend-order-algo", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotDcaStop(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/stop", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotDcaOrdersManualBuy(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/orders/manual-buy", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotDcaSettingsReinvestment(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/settings/reinvestment", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotDcaSettingsTakeProfit(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/settings/take-profit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotDcaMarginAdd(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/margin/add", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotDcaMarginReduce(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/dca/margin/reduce", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotRecurringAddInvestment(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/add-investment", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotRecurringAmendPriceRange(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/amend-price-range", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotRecurringAmendRecurringAmount(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/amend-recurring-amount", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotRecurringAmendRecurringTime(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/amend-recurring-time", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotRecurringPause(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/pause", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTradingBotRecurringRestart(self::Okx, params=Dict(), context=Dict())
    return request(self, "tradingBot/recurring/restart", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceSavingsPurchaseRedempt(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/savings/purchase-redempt", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceSavingsSetLendingRate(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/savings/set-lending-rate", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceStakingDefiPurchase(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/purchase", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceStakingDefiRedeem(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/redeem", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceStakingDefiCancel(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceStakingDefiEthPurchase(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/eth/purchase", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceStakingDefiEthRedeem(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/eth/redeem", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceStakingDefiEthCancelRedeem(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/eth/cancel-redeem", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceStakingDefiSolPurchase(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/sol/purchase", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceStakingDefiSolRedeem(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/sol/redeem", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceStakingDefiSolCancelRedeem(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/staking-defi/sol/cancel-redeem", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceFlexibleLoanMaxLoan(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/flexible-loan/max-loan", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceFlexibleLoanAdjustCollateral(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/flexible-loan/adjust-collateral", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCopytradingAlgoOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/algo-order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCopytradingCloseSubposition(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/close-subposition", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCopytradingSetInstruments(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/set-instruments", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCopytradingAmendProfitSharingRatio(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/amend-profit-sharing-ratio", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCopytradingFirstCopySettings(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/first-copy-settings", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCopytradingAmendCopySettings(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/amend-copy-settings", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCopytradingStopCopyTrading(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/stop-copy-trading", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCopytradingBatchSetLeverage(self::Okx, params=Dict(), context=Dict())
    return request(self, "copytrading/batch-set-leverage", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerNdCreateSubaccount(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/create-subaccount", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerNdDeleteSubaccount(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/delete-subaccount", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerNdSubaccountApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/subaccount/apikey", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerNdSubaccountModifyApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/subaccount/modify-apikey", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerNdSubaccountDeleteApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/subaccount/delete-apikey", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerNdSetSubaccountLevel(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/set-subaccount-level", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerNdSetSubaccountFeeRate(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/set-subaccount-fee-rate", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerNdSetSubaccountAssets(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/set-subaccount-assets", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetBrokerNdSubaccountDepositAddress(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/broker/nd/subaccount-deposit-address", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostAssetBrokerNdModifySubaccountDepositAddress(self::Okx, params=Dict(), context=Dict())
    return request(self, "asset/broker/nd/modify-subaccount-deposit-address", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerNdRebatePerOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/rebate-per-orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceSfpDcdQuote(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceSfpDcdOrder(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceSfpDcdTrade(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/trade", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceSfpDcdRedeemQuote(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/redeem-quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostFinanceSfpDcdRedeem(self::Okx, params=Dict(), context=Dict())
    return request(self, "finance/sfp/dcd/redeem", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerNdReportSubaccountIp(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/nd/report-subaccount-ip", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerDmaSubaccountApikey(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/dma/subaccount/apikey", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerDmaTrades(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/dma/trades", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostBrokerFdRebatePerOrders(self::Okx, params=Dict(), context=Dict())
    return request(self, "broker/fd/rebate-per-orders", "private", "POST", params, nothing, nothing, Dict())
end

function Okx(; kwargs...)
    inst = Okx(Exchange(), describe, handleMarketTypeAndParams, convertToInstrumentType, createExpiredOptionMarket, safeMarket, fetchStatus, fetchTime, fetchAccounts, nonce, fetchMarkets, parseMarket, fetchMarketsByType, fetchCurrencies, parseCurrency, fetchOrderBook, parseTicker, fetchTicker, fetchTickers, fetchMarkPrice, fetchMarkPrices, parseTrade, fetchTrades, parseOHLCV, fetchOHLCV, fetchFundingRateHistory, parseBalanceByType, parseTradingBalance, parseFundingBalance, parseTradingFee, fetchTradingFee, fetchBalance, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, createOrderRequest, createOrder, createOrders, editOrderRequest, editOrder, cancelOrder, parseIds, cancelOrders, cancelOrdersForSymbols, cancelAllOrdersAfter, parseOrderStatus, parseOrder, fetchOrder, fetchOpenOrders, fetchCanceledOrders, fetchClosedOrders, fetchMyTrades, fetchOrderTrades, fetchLedger, parseLedgerEntryType, parseLedgerEntry, parseDepositAddress, fetchDepositAddressesByNetwork, fetchDepositAddress, withdraw, fetchDeposits, fetchDeposit, fetchWithdrawals, fetchWithdrawal, parseTransactionStatus, parseTransaction, fetchLeverage, parseLeverage, fetchPosition, fetchPositions, fetchPositionsForSymbol, parsePosition, transfer, parseTransfer, parseTransferStatus, fetchTransfer, fetchTransfers, sign, parseFundingRate, parseFundingInterval, fetchFundingInterval, fetchFundingRate, fetchFundingRates, fetchFundingHistory, setLeverage, fetchPositionMode, setPositionMode, setMarginMode, fetchCrossBorrowRates, fetchCrossBorrowRate, parseBorrowRate, parseBorrowRateHistories, fetchBorrowRateHistories, fetchBorrowRateHistory, modifyMarginHelper, parseMarginModification, reduceMargin, addMargin, fetchMarketLeverageTiers, parseMarketLeverageTiers, fetchBorrowInterest, parseBorrowInterest, borrowCrossMargin, repayCrossMargin, parseMarginLoan, fetchOpenInterest, fetchOpenInterests, fetchOpenInterestHistory, parseOpenInterest, setSandboxMode, fetchDepositWithdrawFees, parseDepositWithdrawFees, fetchSettlementHistory, parseSettlement, parseSettlements, fetchUnderlyingAssets, fetchGreeks, fetchAllGreeks, parseGreeks, closePosition, fetchOption, fetchOptionChain, parseOption, fetchConvertQuote, createConvertTrade, fetchConvertTrade, fetchConvertTradeHistory, parseConversion, fetchConvertCurrencies, handleErrors, fetchMarginAdjustmentHistory, fetchPositionsHistory, fetchLongShortRatioHistory, parseLongShortRatio, publicGetMarketTickers, publicGetMarketTicker, publicGetMarketBooks, publicGetMarketBooksFull, publicGetMarketCandles, publicGetMarketHistoryCandles, publicGetMarketTrades, publicGetMarketHistoryTrades, publicGetMarketOptionInstrumentFamilyTrades, publicGetMarketPlatform24Volume, publicGetMarketCallAuctionDetail, publicGetMarketCallAuctionDetails, publicGetMarketBooksSbe, publicGetMarketBlockTickers, publicGetMarketBlockTicker, publicGetMarketSprdTicker, publicGetMarketSprdCandles, publicGetMarketSprdHistoryCandles, publicGetMarketIndexTickers, publicGetMarketIndexCandles, publicGetMarketHistoryIndexCandles, publicGetMarketMarkPriceCandles, publicGetMarketHistoryMarkPriceCandles, publicGetMarketExchangeRate, publicGetMarketIndexComponents, publicGetMarketOpenOracle, publicGetMarketBooksLite, publicGetPublicOptionTrades, publicGetPublicBlockTrades, publicGetPublicInstruments, publicGetPublicEstimatedPrice, publicGetPublicDeliveryExerciseHistory, publicGetPublicEstimatedSettlementInfo, publicGetPublicSettlementHistory, publicGetPublicFundingRate, publicGetPublicFundingRateHistory, publicGetPublicOpenInterest, publicGetPublicPriceLimit, publicGetPublicOptSummary, publicGetPublicDiscountRateInterestFreeQuota, publicGetPublicTime, publicGetPublicMarkPrice, publicGetPublicPositionTiers, publicGetPublicInterestRateLoanQuota, publicGetPublicUnderlying, publicGetPublicInsuranceFund, publicGetPublicConvertContractCoin, publicGetPublicInstrumentTickBands, publicGetPublicPremiumHistory, publicGetPublicEconomicCalendar, publicGetPublicMarketDataHistory, publicGetPublicEventContractEvents, publicGetPublicEventContractMarkets, publicGetPublicEventContractSeries, publicGetPublicVipInterestRateLoanQuota, publicGetRubikStatTradingDataSupportCoin, publicGetRubikStatContractsOpenInterestHistory, publicGetRubikStatTakerVolume, publicGetRubikStatTakerVolumeContract, publicGetRubikStatMarginLoanRatio, publicGetRubikStatContractsLongShortAccountRatioContractTopTrader, publicGetRubikStatContractsLongShortPositionRatioContractTopTrader, publicGetRubikStatContractsLongShortAccountRatioContract, publicGetRubikStatContractsLongShortAccountRatio, publicGetRubikStatContractsOpenInterestVolume, publicGetRubikStatOptionOpenInterestVolume, publicGetRubikStatOptionOpenInterestVolumeRatio, publicGetRubikStatOptionOpenInterestVolumeExpiry, publicGetRubikStatOptionOpenInterestVolumeStrike, publicGetRubikStatOptionTakerBlockVolume, publicGetSystemStatus, publicGetSprdSpreads, publicGetSprdBooks, publicGetSprdPublicTrades, publicGetSprdTicker, publicGetTradingBotGridAiParam, publicGetTradingBotGridMinInvestment, publicGetTradingBotPublicRsiBackTesting, publicGetTradingBotGridGridQuantity, publicGetAssetExchangeList, publicGetFinanceStakingDefiEthApyHistory, publicGetFinanceStakingDefiSolApyHistory, publicGetFinanceSavingsLendingRateSummary, publicGetFinanceSavingsLendingRateHistory, publicGetFinanceFixedLoanLendingOffers, publicGetFinanceFixedLoanLendingApyHistory, publicGetFinanceFixedLoanPendingLendingVolume, publicGetFinanceSfpDcdProducts, publicGetCopytradingPublicConfig, publicGetCopytradingPublicLeadTraders, publicGetCopytradingPublicWeeklyPnl, publicGetCopytradingPublicPnl, publicGetCopytradingPublicStats, publicGetCopytradingPublicPreferenceCurrency, publicGetCopytradingPublicCurrentSubpositions, publicGetCopytradingPublicSubpositionsHistory, publicGetCopytradingPublicCopyTraders, publicGetSupportAnnouncements, publicGetSupportAnnouncementsTypes, publicGetSupportAnnouncementTypes, publicPostTradingBotGridMinInvestment, privateGetRfqCounterparties, privateGetRfqMakerInstrumentSettings, privateGetRfqMmpConfig, privateGetRfqRfqs, privateGetRfqQuotes, privateGetRfqTrades, privateGetRfqPublicTrades, privateGetSprdOrder, privateGetSprdOrdersPending, privateGetSprdOrdersHistory, privateGetSprdOrdersHistoryArchive, privateGetSprdTrades, privateGetTradeOrder, privateGetTradeOrdersPending, privateGetTradeOrdersHistory, privateGetTradeOrdersHistoryArchive, privateGetTradeFills, privateGetTradeFillsHistory, privateGetTradeFillsArchive, privateGetTradeOrderAlgo, privateGetTradeOrdersAlgoPending, privateGetTradeOrdersAlgoHistory, privateGetTradeEasyConvertCurrencyList, privateGetTradeEasyConvertHistory, privateGetTradeOneClickRepayCurrencyList, privateGetTradeOneClickRepayCurrencyListV2, privateGetTradeOneClickRepayHistory, privateGetTradeOneClickRepayHistoryV2, privateGetTradeAccountRateLimit, privateGetAssetCurrencies, privateGetAssetBalances, privateGetAssetNonTradableAssets, privateGetAssetAssetValuation, privateGetAssetTransferState, privateGetAssetBills, privateGetAssetBillsHistory, privateGetAssetDepositLightning, privateGetAssetDepositAddress, privateGetAssetDepositHistory, privateGetAssetWithdrawalHistory, privateGetAssetDepositWithdrawStatus, privateGetAssetMonthlyStatement, privateGetAssetConvertCurrencies, privateGetAssetConvertCurrencyPair, privateGetAssetConvertHistory, privateGetAccountInstruments, privateGetAccountBalance, privateGetAccountPositions, privateGetAccountPositionsHistory, privateGetAccountAccountPositionRisk, privateGetAccountBills, privateGetAccountBillsArchive, privateGetAccountBillsHistoryArchive, privateGetAccountConfig, privateGetAccountSubtypes, privateGetAccountMaxSize, privateGetAccountMaxAvailSize, privateGetAccountLeverageInfo, privateGetAccountAdjustLeverageInfo, privateGetAccountMaxLoan, privateGetAccountTradeFee, privateGetAccountInterestAccrued, privateGetAccountInterestRate, privateGetAccountMaxWithdrawal, privateGetAccountRiskState, privateGetAccountInterestLimits, privateGetAccountSpotBorrowRepayHistory, privateGetAccountGreeks, privateGetAccountPositionTiers, privateGetAccountSetAccountSwitchPrecheck, privateGetAccountCollateralAssets, privateGetAccountMmpConfig, privateGetAccountMovePositionsHistory, privateGetAccountPrecheckSetDeltaNeutral, privateGetAccountQuickMarginBorrowRepayHistory, privateGetAccountBorrowRepayHistory, privateGetAccountVipInterestAccrued, privateGetAccountVipInterestDeducted, privateGetAccountVipLoanOrderList, privateGetAccountVipLoanOrderDetail, privateGetAccountFixedLoanBorrowingLimit, privateGetAccountFixedLoanBorrowingQuote, privateGetAccountFixedLoanBorrowingOrdersList, privateGetAccountSpotManualBorrowRepay, privateGetAccountSetAutoRepay, privateGetUsersSubaccountList, privateGetAccountSubaccountBalances, privateGetAssetSubaccountBalances, privateGetAccountSubaccountMaxWithdrawal, privateGetAssetSubaccountBills, privateGetAssetSubaccountManagedSubaccountBills, privateGetUsersEntrustSubaccountList, privateGetAccountSubaccountInterestLimits, privateGetUsersSubaccountApikey, privateGetTradingBotGridOrdersAlgoPending, privateGetTradingBotGridOrdersAlgoHistory, privateGetTradingBotGridOrdersAlgoDetails, privateGetTradingBotGridSubOrders, privateGetTradingBotGridPositions, privateGetTradingBotGridAiParam, privateGetTradingBotSignalSignals, privateGetTradingBotSignalOrdersAlgoDetails, privateGetTradingBotSignalOrdersAlgoPending, privateGetTradingBotSignalOrdersAlgoHistory, privateGetTradingBotSignalPositions, privateGetTradingBotSignalPositionsHistory, privateGetTradingBotSignalSubOrders, privateGetTradingBotSignalEventHistory, privateGetTradingBotRecurringOrdersAlgoPending, privateGetTradingBotRecurringOrdersAlgoHistory, privateGetTradingBotRecurringOrdersAlgoDetails, privateGetTradingBotRecurringSubOrders, privateGetTradingBotDcaOngoingList, privateGetTradingBotDcaHistoryList, privateGetTradingBotDcaOrders, privateGetTradingBotDcaPositionDetails, privateGetTradingBotDcaCycleList, privateGetFinanceSavingsBalance, privateGetFinanceSavingsLendingHistory, privateGetFinanceStakingDefiOffers, privateGetFinanceStakingDefiOrdersActive, privateGetFinanceStakingDefiOrdersHistory, privateGetFinanceStakingDefiEthProductInfo, privateGetFinanceStakingDefiEthBalance, privateGetFinanceStakingDefiEthPurchaseRedeemHistory, privateGetFinanceStakingDefiSolProductInfo, privateGetFinanceStakingDefiSolBalance, privateGetFinanceStakingDefiSolPurchaseRedeemHistory, privateGetFinanceFlexibleLoanBorrowCurrencies, privateGetFinanceFlexibleLoanCollateralAssets, privateGetFinanceFlexibleLoanMaxCollateralRedeemAmount, privateGetFinanceFlexibleLoanLoanInfo, privateGetFinanceFlexibleLoanLoanHistory, privateGetFinanceFlexibleLoanInterestAccrued, privateGetCopytradingCurrentSubpositions, privateGetCopytradingSubpositionsHistory, privateGetCopytradingInstruments, privateGetCopytradingProfitSharingDetails, privateGetCopytradingTotalProfitSharing, privateGetCopytradingUnrealizedProfitSharingDetails, privateGetCopytradingTotalUnrealizedProfitSharing, privateGetCopytradingConfig, privateGetCopytradingCopySettings, privateGetCopytradingCurrentLeadTraders, privateGetCopytradingBatchLeverageInfo, privateGetCopytradingLeadTradersHistory, privateGetBrokerDmaSubaccountInfo, privateGetBrokerDmaSubaccountTradeFee, privateGetBrokerDmaSubaccountApikey, privateGetBrokerDmaRebatePerOrders, privateGetBrokerFdRebatePerOrders, privateGetBrokerFdIfRebate, privateGetBrokerNdInfo, privateGetBrokerNdSubaccountInfo, privateGetBrokerNdSubaccountApikey, privateGetAssetBrokerNdSubaccountDepositAddress, privateGetAssetBrokerNdSubaccountDepositHistory, privateGetAssetBrokerNdSubaccountWithdrawalHistory, privateGetBrokerNdRebateDaily, privateGetBrokerNdRebatePerOrders, privateGetFinanceSfpDcdOrder, privateGetFinanceSfpDcdOrders, privateGetFinanceSfpDcdCurrencyPair, privateGetFinanceSfpDcdOrderStatus, privateGetFinanceSfpDcdOrderHistory, privateGetAffiliateInviteeDetail, privateGetUsersPartnerIfRebate, privateGetSupportAnnouncements, privatePostRfqCreateRfq, privatePostRfqCancelRfq, privatePostRfqCancelBatchRfqs, privatePostRfqCancelAllRfqs, privatePostRfqExecuteQuote, privatePostRfqMakerInstrumentSettings, privatePostRfqMmpReset, privatePostRfqMmpConfig, privatePostRfqCreateQuote, privatePostRfqCancelQuote, privatePostRfqCancelBatchQuotes, privatePostRfqCancelAllQuotes, privatePostRfqCancelAllAfter, privatePostSprdOrder, privatePostSprdCancelOrder, privatePostSprdMassCancel, privatePostSprdAmendOrder, privatePostSprdCancelAllAfter, privatePostTradeOrder, privatePostTradeBatchOrders, privatePostTradeCancelOrder, privatePostTradeCancelBatchOrders, privatePostTradeAmendOrder, privatePostTradeAmendBatchOrders, privatePostTradeClosePosition, privatePostTradeFillsArchive, privatePostTradeCancelAdvanceAlgos, privatePostTradeEasyConvert, privatePostTradeOneClickRepay, privatePostTradeOneClickRepayV2, privatePostTradeMassCancel, privatePostTradeCancelAllAfter, privatePostTradeOrderPrecheck, privatePostTradeOrderAlgo, privatePostTradeCancelAlgos, privatePostTradeAmendAlgos, privatePostAssetTransfer, privatePostAssetWithdrawal, privatePostAssetWithdrawalLightning, privatePostAssetCancelWithdrawal, privatePostAssetConvertDustAssets, privatePostAssetMonthlyStatement, privatePostAssetConvertEstimateQuote, privatePostAssetConvertTrade, privatePostAccountBillsHistoryArchive, privatePostAccountSetPositionMode, privatePostAccountSetLeverage, privatePostAccountPositionMarginBalance, privatePostAccountSetFeeType, privatePostAccountSetGreeks, privatePostAccountSetIsolatedMode, privatePostAccountSpotManualBorrowRepay, privatePostAccountSetAutoRepay, privatePostAccountQuickMarginBorrowRepay, privatePostAccountBorrowRepay, privatePostAccountSimulatedMargin, privatePostAccountPositionBuilder, privatePostAccountPositionBuilderGraph, privatePostAccountSetRiskOffsetType, privatePostAccountSetRiskOffsetAmt, privatePostAccountActivateOption, privatePostAccountSetAutoLoan, privatePostAccountAccountLevelSwitchPreset, privatePostAccountSetAccountLevel, privatePostAccountSetCollateralAssets, privatePostAccountMmpReset, privatePostAccountMmpConfig, privatePostAccountFixedLoanBorrowingOrder, privatePostAccountFixedLoanAmendBorrowingOrder, privatePostAccountFixedLoanManualReborrow, privatePostAccountFixedLoanRepayBorrowingOrder, privatePostAccountMovePositions, privatePostAccountSetAutoEarn, privatePostAccountSetSettleCurrency, privatePostAccountSetTradingConfig, privatePostAccountDemoAdjustBalance, privatePostAssetSubaccountTransfer, privatePostAccountSubaccountSetLoanAllocation, privatePostUsersSubaccountCreateSubaccount, privatePostUsersSubaccountApikey, privatePostUsersSubaccountModifyApikey, privatePostUsersSubaccountSubaccountApikey, privatePostUsersSubaccountDeleteApikey, privatePostUsersSubaccountSetTransferOut, privatePostTradingBotGridOrderAlgo, privatePostTradingBotGridCopyOrderAlgo, privatePostTradingBotGridAmendAlgoBasicParam, privatePostTradingBotGridAmendOrderAlgo, privatePostTradingBotGridStopOrderAlgo, privatePostTradingBotGridClosePosition, privatePostTradingBotGridCancelCloseOrder, privatePostTradingBotGridOrderInstantTrigger, privatePostTradingBotGridWithdrawIncome, privatePostTradingBotGridComputeMarginBalance, privatePostTradingBotGridMarginBalance, privatePostTradingBotGridMinInvestment, privatePostTradingBotGridAdjustInvestment, privatePostTradingBotSignalCreateSignal, privatePostTradingBotSignalOrderAlgo, privatePostTradingBotSignalStopOrderAlgo, privatePostTradingBotSignalMarginBalance, privatePostTradingBotSignalAmendTPSL, privatePostTradingBotSignalSetInstruments, privatePostTradingBotSignalClosePosition, privatePostTradingBotSignalSubOrder, privatePostTradingBotSignalCancelSubOrder, privatePostTradingBotRecurringOrderAlgo, privatePostTradingBotRecurringAmendOrderAlgo, privatePostTradingBotRecurringStopOrderAlgo, privatePostTradingBotDcaCreate, privatePostTradingBotDcaAmendOrderAlgo, privatePostTradingBotDcaStop, privatePostTradingBotDcaOrdersManualBuy, privatePostTradingBotDcaSettingsReinvestment, privatePostTradingBotDcaSettingsTakeProfit, privatePostTradingBotDcaMarginAdd, privatePostTradingBotDcaMarginReduce, privatePostTradingBotRecurringAddInvestment, privatePostTradingBotRecurringAmendPriceRange, privatePostTradingBotRecurringAmendRecurringAmount, privatePostTradingBotRecurringAmendRecurringTime, privatePostTradingBotRecurringPause, privatePostTradingBotRecurringRestart, privatePostFinanceSavingsPurchaseRedempt, privatePostFinanceSavingsSetLendingRate, privatePostFinanceStakingDefiPurchase, privatePostFinanceStakingDefiRedeem, privatePostFinanceStakingDefiCancel, privatePostFinanceStakingDefiEthPurchase, privatePostFinanceStakingDefiEthRedeem, privatePostFinanceStakingDefiEthCancelRedeem, privatePostFinanceStakingDefiSolPurchase, privatePostFinanceStakingDefiSolRedeem, privatePostFinanceStakingDefiSolCancelRedeem, privatePostFinanceFlexibleLoanMaxLoan, privatePostFinanceFlexibleLoanAdjustCollateral, privatePostCopytradingAlgoOrder, privatePostCopytradingCloseSubposition, privatePostCopytradingSetInstruments, privatePostCopytradingAmendProfitSharingRatio, privatePostCopytradingFirstCopySettings, privatePostCopytradingAmendCopySettings, privatePostCopytradingStopCopyTrading, privatePostCopytradingBatchSetLeverage, privatePostBrokerNdCreateSubaccount, privatePostBrokerNdDeleteSubaccount, privatePostBrokerNdSubaccountApikey, privatePostBrokerNdSubaccountModifyApikey, privatePostBrokerNdSubaccountDeleteApikey, privatePostBrokerNdSetSubaccountLevel, privatePostBrokerNdSetSubaccountFeeRate, privatePostBrokerNdSetSubaccountAssets, privatePostAssetBrokerNdSubaccountDepositAddress, privatePostAssetBrokerNdModifySubaccountDepositAddress, privatePostBrokerNdRebatePerOrders, privatePostFinanceSfpDcdQuote, privatePostFinanceSfpDcdOrder, privatePostFinanceSfpDcdTrade, privatePostFinanceSfpDcdRedeemQuote, privatePostFinanceSfpDcdRedeem, privatePostBrokerNdReportSubaccountIp, privatePostBrokerDmaSubaccountApikey, privatePostBrokerDmaTrades, privatePostBrokerFdRebatePerOrders)
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
