@kwdef mutable struct Bybit <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    enableDemoTrading::Function = enableDemoTrading
    nonce::Function = nonce
    addPaginationCursorToResult::Function = addPaginationCursorToResult
    isUnifiedEnabled::Function = isUnifiedEnabled
    upgradeUnifiedTradeAccount::Function = upgradeUnifiedTradeAccount
    createExpiredOptionMarket::Function = createExpiredOptionMarket
    safeMarket::Function = safeMarket
    getBybitType::Function = getBybitType
    getAmount::Function = getAmount
    getPrice::Function = getPrice
    getCost::Function = getCost
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchFutureMarkets::Function = fetchFutureMarkets
    fetchOptionMarkets::Function = fetchOptionMarkets
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchBidsAsks::Function = fetchBidsAsks
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    parseFundingRate::Function = parseFundingRate
    fetchFundingRates::Function = fetchFundingRates
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseTrade::Function = parseTrade
    fetchTrades::Function = fetchTrades
    fetchOrderBook::Function = fetchOrderBook
    parseBalance::Function = parseBalance
    fetchBalance::Function = fetchBalance
    parseOrderStatus::Function = parseOrderStatus
    parseTimeInForce::Function = parseTimeInForce
    parseOrder::Function = parseOrder
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createMarketSellOrderWithCost::Function = createMarketSellOrderWithCost
    createOrder::Function = createOrder
    createOrderRequest::Function = createOrderRequest
    createOrders::Function = createOrders
    editOrderRequest::Function = editOrderRequest
    editOrder::Function = editOrder
    editOrders::Function = editOrders
    cancelOrderRequest::Function = cancelOrderRequest
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    cancelOrdersForSymbols::Function = cancelOrdersForSymbols
    cancelAllOrders::Function = cancelAllOrders
    fetchOrderClassic::Function = fetchOrderClassic
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOrdersClassic::Function = fetchOrdersClassic
    fetchClosedOrder::Function = fetchClosedOrder
    fetchOpenOrder::Function = fetchOpenOrder
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    parseDepositAddress::Function = parseDepositAddress
    fetchDepositAddressesByNetwork::Function = fetchDepositAddressesByNetwork
    fetchDepositAddress::Function = fetchDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    withdraw::Function = withdraw
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    setMarginMode::Function = setMarginMode
    setLeverage::Function = setLeverage
    setPositionMode::Function = setPositionMode
    fetchDerivativesOpenInterestHistory::Function = fetchDerivativesOpenInterestHistory
    fetchOpenInterest::Function = fetchOpenInterest
    fetchOpenInterestHistory::Function = fetchOpenInterestHistory
    parseOpenInterest::Function = parseOpenInterest
    fetchCrossBorrowRate::Function = fetchCrossBorrowRate
    parseBorrowRate::Function = parseBorrowRate
    fetchBorrowInterest::Function = fetchBorrowInterest
    fetchBorrowRateHistory::Function = fetchBorrowRateHistory
    parseBorrowInterest::Function = parseBorrowInterest
    transfer::Function = transfer
    fetchTransfers::Function = fetchTransfers
    borrowCrossMargin::Function = borrowCrossMargin
    repayCrossMargin::Function = repayCrossMargin
    parseMarginLoan::Function = parseMarginLoan
    parseTransferStatus::Function = parseTransferStatus
    parseTransfer::Function = parseTransfer
    fetchDerivativesMarketLeverageTiers::Function = fetchDerivativesMarketLeverageTiers
    fetchMarketLeverageTiers::Function = fetchMarketLeverageTiers
    parseTradingFee::Function = parseTradingFee
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    fetchSettlementHistory::Function = fetchSettlementHistory
    fetchMySettlementHistory::Function = fetchMySettlementHistory
    parseSettlement::Function = parseSettlement
    parseSettlements::Function = parseSettlements
    fetchVolatilityHistory::Function = fetchVolatilityHistory
    parseVolatilityHistory::Function = parseVolatilityHistory
    fetchGreeks::Function = fetchGreeks
    fetchAllGreeks::Function = fetchAllGreeks
    parseGreeks::Function = parseGreeks
    fetchMyLiquidations::Function = fetchMyLiquidations
    parseLiquidation::Function = parseLiquidation
    getLeverageTiersPaginated::Function = getLeverageTiersPaginated
    fetchLeverageTiers::Function = fetchLeverageTiers
    parseLeverageTiers::Function = parseLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    fetchOption::Function = fetchOption
    fetchOptionChain::Function = fetchOptionChain
    parseOption::Function = parseOption
    fetchPositionsHistory::Function = fetchPositionsHistory
    fetchConvertCurrencies::Function = fetchConvertCurrencies
    fetchConvertQuote::Function = fetchConvertQuote
    createConvertTrade::Function = createConvertTrade
    fetchConvertTrade::Function = fetchConvertTrade
    fetchConvertTradeHistory::Function = fetchConvertTradeHistory
    parseConversion::Function = parseConversion
    fetchLongShortRatioHistory::Function = fetchLongShortRatioHistory
    parseLongShortRatio::Function = parseLongShortRatio
    fetchPositionsADLRank::Function = fetchPositionsADLRank
    parseADLRank::Function = parseADLRank
    fetchMarginMode::Function = fetchMarginMode
    parseMarginMode::Function = parseMarginMode
    parseMarginModeType::Function = parseMarginModeType
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetSpotV3PublicSymbols::Function = publicGetSpotV3PublicSymbols
    publicGetSpotV3PublicQuoteDepth::Function = publicGetSpotV3PublicQuoteDepth
    publicGetSpotV3PublicQuoteDepthMerged::Function = publicGetSpotV3PublicQuoteDepthMerged
    publicGetSpotV3PublicQuoteTrades::Function = publicGetSpotV3PublicQuoteTrades
    publicGetSpotV3PublicQuoteKline::Function = publicGetSpotV3PublicQuoteKline
    publicGetSpotV3PublicQuoteTicker24hr::Function = publicGetSpotV3PublicQuoteTicker24hr
    publicGetSpotV3PublicQuoteTickerPrice::Function = publicGetSpotV3PublicQuoteTickerPrice
    publicGetSpotV3PublicQuoteTickerBookTicker::Function = publicGetSpotV3PublicQuoteTickerBookTicker
    publicGetSpotV3PublicServerTime::Function = publicGetSpotV3PublicServerTime
    publicGetSpotV3PublicInfos::Function = publicGetSpotV3PublicInfos
    publicGetSpotV3PublicMarginProductInfos::Function = publicGetSpotV3PublicMarginProductInfos
    publicGetSpotV3PublicMarginEnsureTokens::Function = publicGetSpotV3PublicMarginEnsureTokens
    publicGetV3PublicTime::Function = publicGetV3PublicTime
    publicGetContractV3PublicCopytradingSymbolList::Function = publicGetContractV3PublicCopytradingSymbolList
    publicGetDerivativesV3PublicOrderBookL2::Function = publicGetDerivativesV3PublicOrderBookL2
    publicGetDerivativesV3PublicKline::Function = publicGetDerivativesV3PublicKline
    publicGetDerivativesV3PublicTickers::Function = publicGetDerivativesV3PublicTickers
    publicGetDerivativesV3PublicInstrumentsInfo::Function = publicGetDerivativesV3PublicInstrumentsInfo
    publicGetDerivativesV3PublicMarkPriceKline::Function = publicGetDerivativesV3PublicMarkPriceKline
    publicGetDerivativesV3PublicIndexPriceKline::Function = publicGetDerivativesV3PublicIndexPriceKline
    publicGetDerivativesV3PublicFundingHistoryFundingRate::Function = publicGetDerivativesV3PublicFundingHistoryFundingRate
    publicGetDerivativesV3PublicRiskLimitList::Function = publicGetDerivativesV3PublicRiskLimitList
    publicGetDerivativesV3PublicDeliveryPrice::Function = publicGetDerivativesV3PublicDeliveryPrice
    publicGetDerivativesV3PublicRecentTrade::Function = publicGetDerivativesV3PublicRecentTrade
    publicGetDerivativesV3PublicOpenInterest::Function = publicGetDerivativesV3PublicOpenInterest
    publicGetDerivativesV3PublicInsurance::Function = publicGetDerivativesV3PublicInsurance
    publicGetV5AnnouncementsIndex::Function = publicGetV5AnnouncementsIndex
    publicGetV5SystemStatus::Function = publicGetV5SystemStatus
    publicGetV5MarketTime::Function = publicGetV5MarketTime
    publicGetV5MarketKline::Function = publicGetV5MarketKline
    publicGetV5MarketMarkPriceKline::Function = publicGetV5MarketMarkPriceKline
    publicGetV5MarketIndexPriceKline::Function = publicGetV5MarketIndexPriceKline
    publicGetV5MarketPremiumIndexPriceKline::Function = publicGetV5MarketPremiumIndexPriceKline
    publicGetV5MarketInstrumentsInfo::Function = publicGetV5MarketInstrumentsInfo
    publicGetV5MarketOrderbook::Function = publicGetV5MarketOrderbook
    publicGetV5MarketRpiOrderbook::Function = publicGetV5MarketRpiOrderbook
    publicGetV5MarketFullOrderbook::Function = publicGetV5MarketFullOrderbook
    publicGetV5MarketTickers::Function = publicGetV5MarketTickers
    publicGetV5MarketFundingHistory::Function = publicGetV5MarketFundingHistory
    publicGetV5MarketRecentTrade::Function = publicGetV5MarketRecentTrade
    publicGetV5MarketOpenInterest::Function = publicGetV5MarketOpenInterest
    publicGetV5MarketHistoricalVolatility::Function = publicGetV5MarketHistoricalVolatility
    publicGetV5MarketInsurance::Function = publicGetV5MarketInsurance
    publicGetV5MarketRiskLimit::Function = publicGetV5MarketRiskLimit
    publicGetV5MarketDeliveryPrice::Function = publicGetV5MarketDeliveryPrice
    publicGetV5MarketNewDeliveryPrice::Function = publicGetV5MarketNewDeliveryPrice
    publicGetV5MarketAccountRatio::Function = publicGetV5MarketAccountRatio
    publicGetV5MarketIndexPriceComponents::Function = publicGetV5MarketIndexPriceComponents
    publicGetV5MarketPriceLimit::Function = publicGetV5MarketPriceLimit
    publicGetV5MarketAdlAlert::Function = publicGetV5MarketAdlAlert
    publicGetV5MarketFeeGroupInfo::Function = publicGetV5MarketFeeGroupInfo
    publicGetV5SpotLeverTokenInfo::Function = publicGetV5SpotLeverTokenInfo
    publicGetV5SpotLeverTokenReference::Function = publicGetV5SpotLeverTokenReference
    publicGetV5SpotMarginTradeData::Function = publicGetV5SpotMarginTradeData
    publicGetV5SpotMarginTradeCollateral::Function = publicGetV5SpotMarginTradeCollateral
    publicGetV5SpotCrossMarginTradeData::Function = publicGetV5SpotCrossMarginTradeData
    publicGetV5SpotCrossMarginTradePledgeToken::Function = publicGetV5SpotCrossMarginTradePledgeToken
    publicGetV5SpotCrossMarginTradeBorrowToken::Function = publicGetV5SpotCrossMarginTradeBorrowToken
    publicGetV5CryptoLoanCollateralData::Function = publicGetV5CryptoLoanCollateralData
    publicGetV5CryptoLoanLoanableData::Function = publicGetV5CryptoLoanLoanableData
    publicGetV5CryptoLoanCommonLoanableData::Function = publicGetV5CryptoLoanCommonLoanableData
    publicGetV5CryptoLoanCommonCollateralData::Function = publicGetV5CryptoLoanCommonCollateralData
    publicGetV5CryptoLoanFixedSupplyOrderQuote::Function = publicGetV5CryptoLoanFixedSupplyOrderQuote
    publicGetV5CryptoLoanFixedBorrowOrderQuote::Function = publicGetV5CryptoLoanFixedBorrowOrderQuote
    publicGetV5InsLoanProductInfos::Function = publicGetV5InsLoanProductInfos
    publicGetV5InsLoanEnsureTokensConvert::Function = publicGetV5InsLoanEnsureTokensConvert
    publicGetV5EarnProduct::Function = publicGetV5EarnProduct
    privateGetV5MarketInstrumentsInfo::Function = privateGetV5MarketInstrumentsInfo
    privateGetV2PrivateWalletFundRecords::Function = privateGetV2PrivateWalletFundRecords
    privateGetSpotV3PrivateOrder::Function = privateGetSpotV3PrivateOrder
    privateGetSpotV3PrivateOpenOrders::Function = privateGetSpotV3PrivateOpenOrders
    privateGetSpotV3PrivateHistoryOrders::Function = privateGetSpotV3PrivateHistoryOrders
    privateGetSpotV3PrivateMyTrades::Function = privateGetSpotV3PrivateMyTrades
    privateGetSpotV3PrivateAccount::Function = privateGetSpotV3PrivateAccount
    privateGetSpotV3PrivateReference::Function = privateGetSpotV3PrivateReference
    privateGetSpotV3PrivateRecord::Function = privateGetSpotV3PrivateRecord
    privateGetSpotV3PrivateCrossMarginOrders::Function = privateGetSpotV3PrivateCrossMarginOrders
    privateGetSpotV3PrivateCrossMarginAccount::Function = privateGetSpotV3PrivateCrossMarginAccount
    privateGetSpotV3PrivateCrossMarginLoanInfo::Function = privateGetSpotV3PrivateCrossMarginLoanInfo
    privateGetSpotV3PrivateCrossMarginRepayHistory::Function = privateGetSpotV3PrivateCrossMarginRepayHistory
    privateGetSpotV3PrivateMarginLoanInfos::Function = privateGetSpotV3PrivateMarginLoanInfos
    privateGetSpotV3PrivateMarginRepaidInfos::Function = privateGetSpotV3PrivateMarginRepaidInfos
    privateGetSpotV3PrivateMarginLtv::Function = privateGetSpotV3PrivateMarginLtv
    privateGetAssetV3PrivateTransferInterTransferListQuery::Function = privateGetAssetV3PrivateTransferInterTransferListQuery
    privateGetAssetV3PrivateTransferSubMemberListQuery::Function = privateGetAssetV3PrivateTransferSubMemberListQuery
    privateGetAssetV3PrivateTransferSubMemberTransferListQuery::Function = privateGetAssetV3PrivateTransferSubMemberTransferListQuery
    privateGetAssetV3PrivateTransferUniversalTransferListQuery::Function = privateGetAssetV3PrivateTransferUniversalTransferListQuery
    privateGetAssetV3PrivateCoinInfoQuery::Function = privateGetAssetV3PrivateCoinInfoQuery
    privateGetAssetV3PrivateDepositAddressQuery::Function = privateGetAssetV3PrivateDepositAddressQuery
    privateGetContractV3PrivateCopytradingOrderList::Function = privateGetContractV3PrivateCopytradingOrderList
    privateGetContractV3PrivateCopytradingPositionList::Function = privateGetContractV3PrivateCopytradingPositionList
    privateGetContractV3PrivateCopytradingWalletBalance::Function = privateGetContractV3PrivateCopytradingWalletBalance
    privateGetContractV3PrivatePositionLimitInfo::Function = privateGetContractV3PrivatePositionLimitInfo
    privateGetContractV3PrivateOrderUnfilledOrders::Function = privateGetContractV3PrivateOrderUnfilledOrders
    privateGetContractV3PrivateOrderList::Function = privateGetContractV3PrivateOrderList
    privateGetContractV3PrivatePositionList::Function = privateGetContractV3PrivatePositionList
    privateGetContractV3PrivateExecutionList::Function = privateGetContractV3PrivateExecutionList
    privateGetContractV3PrivatePositionClosedPnl::Function = privateGetContractV3PrivatePositionClosedPnl
    privateGetContractV3PrivateAccountWalletBalance::Function = privateGetContractV3PrivateAccountWalletBalance
    privateGetContractV3PrivateAccountFeeRate::Function = privateGetContractV3PrivateAccountFeeRate
    privateGetContractV3PrivateAccountWalletFundRecords::Function = privateGetContractV3PrivateAccountWalletFundRecords
    privateGetUnifiedV3PrivateOrderUnfilledOrders::Function = privateGetUnifiedV3PrivateOrderUnfilledOrders
    privateGetUnifiedV3PrivateOrderList::Function = privateGetUnifiedV3PrivateOrderList
    privateGetUnifiedV3PrivatePositionList::Function = privateGetUnifiedV3PrivatePositionList
    privateGetUnifiedV3PrivateExecutionList::Function = privateGetUnifiedV3PrivateExecutionList
    privateGetUnifiedV3PrivateDeliveryRecord::Function = privateGetUnifiedV3PrivateDeliveryRecord
    privateGetUnifiedV3PrivateSettlementRecord::Function = privateGetUnifiedV3PrivateSettlementRecord
    privateGetUnifiedV3PrivateAccountWalletBalance::Function = privateGetUnifiedV3PrivateAccountWalletBalance
    privateGetUnifiedV3PrivateAccountTransactionLog::Function = privateGetUnifiedV3PrivateAccountTransactionLog
    privateGetUnifiedV3PrivateAccountBorrowHistory::Function = privateGetUnifiedV3PrivateAccountBorrowHistory
    privateGetUnifiedV3PrivateAccountBorrowRate::Function = privateGetUnifiedV3PrivateAccountBorrowRate
    privateGetUnifiedV3PrivateAccountInfo::Function = privateGetUnifiedV3PrivateAccountInfo
    privateGetUserV3PrivateFrozenSubMember::Function = privateGetUserV3PrivateFrozenSubMember
    privateGetUserV3PrivateQuerySubMembers::Function = privateGetUserV3PrivateQuerySubMembers
    privateGetUserV3PrivateQueryApi::Function = privateGetUserV3PrivateQueryApi
    privateGetUserV3PrivateGetMemberType::Function = privateGetUserV3PrivateGetMemberType
    privateGetAssetV3PrivateTransferTransferCoinListQuery::Function = privateGetAssetV3PrivateTransferTransferCoinListQuery
    privateGetAssetV3PrivateTransferAccountCoinBalanceQuery::Function = privateGetAssetV3PrivateTransferAccountCoinBalanceQuery
    privateGetAssetV3PrivateTransferAccountCoinsBalanceQuery::Function = privateGetAssetV3PrivateTransferAccountCoinsBalanceQuery
    privateGetAssetV3PrivateTransferAssetInfoQuery::Function = privateGetAssetV3PrivateTransferAssetInfoQuery
    privateGetAssetV3PublicDepositAllowedDepositListQuery::Function = privateGetAssetV3PublicDepositAllowedDepositListQuery
    privateGetAssetV3PrivateDepositRecordQuery::Function = privateGetAssetV3PrivateDepositRecordQuery
    privateGetAssetV3PrivateWithdrawRecordQuery::Function = privateGetAssetV3PrivateWithdrawRecordQuery
    privateGetV5OrderRealtime::Function = privateGetV5OrderRealtime
    privateGetV5OrderHistory::Function = privateGetV5OrderHistory
    privateGetV5OrderSpotBorrowCheck::Function = privateGetV5OrderSpotBorrowCheck
    privateGetV5PositionList::Function = privateGetV5PositionList
    privateGetV5ExecutionList::Function = privateGetV5ExecutionList
    privateGetV5PositionClosedPnl::Function = privateGetV5PositionClosedPnl
    privateGetV5PositionGetClosedPositions::Function = privateGetV5PositionGetClosedPositions
    privateGetV5PositionMoveHistory::Function = privateGetV5PositionMoveHistory
    privateGetV5PositionSymbolInfo::Function = privateGetV5PositionSymbolInfo
    privateGetV5PreUpgradeOrderHistory::Function = privateGetV5PreUpgradeOrderHistory
    privateGetV5PreUpgradeExecutionList::Function = privateGetV5PreUpgradeExecutionList
    privateGetV5PreUpgradePositionClosedPnl::Function = privateGetV5PreUpgradePositionClosedPnl
    privateGetV5PreUpgradeAccountTransactionLog::Function = privateGetV5PreUpgradeAccountTransactionLog
    privateGetV5PreUpgradeAssetDeliveryRecord::Function = privateGetV5PreUpgradeAssetDeliveryRecord
    privateGetV5PreUpgradeAssetSettlementRecord::Function = privateGetV5PreUpgradeAssetSettlementRecord
    privateGetV5AccountWalletBalance::Function = privateGetV5AccountWalletBalance
    privateGetV5AccountBorrowHistory::Function = privateGetV5AccountBorrowHistory
    privateGetV5AccountInstrumentsInfo::Function = privateGetV5AccountInstrumentsInfo
    privateGetV5AccountCollateralInfo::Function = privateGetV5AccountCollateralInfo
    privateGetV5AccountOptionAssetInfo::Function = privateGetV5AccountOptionAssetInfo
    privateGetV5AssetCoinGreeks::Function = privateGetV5AssetCoinGreeks
    privateGetV5AccountFeeRate::Function = privateGetV5AccountFeeRate
    privateGetV5AccountInfo::Function = privateGetV5AccountInfo
    privateGetV5AccountTransactionLog::Function = privateGetV5AccountTransactionLog
    privateGetV5AccountContractTransactionLog::Function = privateGetV5AccountContractTransactionLog
    privateGetV5AccountQueryDcpInfo::Function = privateGetV5AccountQueryDcpInfo
    privateGetV5AccountUserSettingConfig::Function = privateGetV5AccountUserSettingConfig
    privateGetV5AccountPayInfo::Function = privateGetV5AccountPayInfo
    privateGetV5AccountTradeInfoForAnalysis::Function = privateGetV5AccountTradeInfoForAnalysis
    privateGetV5AccountSmpGroup::Function = privateGetV5AccountSmpGroup
    privateGetV5AccountMmpState::Function = privateGetV5AccountMmpState
    privateGetV5AccountWithdrawal::Function = privateGetV5AccountWithdrawal
    privateGetV5AssetAssetOverview::Function = privateGetV5AssetAssetOverview
    privateGetV5AssetExchangeQueryCoinList::Function = privateGetV5AssetExchangeQueryCoinList
    privateGetV5AssetExchangeConvertResultQuery::Function = privateGetV5AssetExchangeConvertResultQuery
    privateGetV5AssetExchangeQueryConvertHistory::Function = privateGetV5AssetExchangeQueryConvertHistory
    privateGetV5AssetExchangeOrderRecord::Function = privateGetV5AssetExchangeOrderRecord
    privateGetV5AssetFundinghistory::Function = privateGetV5AssetFundinghistory
    privateGetV5AssetPortfolioMargin::Function = privateGetV5AssetPortfolioMargin
    privateGetV5AssetTotalMembersAssets::Function = privateGetV5AssetTotalMembersAssets
    privateGetV5AssetDeliveryRecord::Function = privateGetV5AssetDeliveryRecord
    privateGetV5AssetSettlementRecord::Function = privateGetV5AssetSettlementRecord
    privateGetV5AssetTransferQueryAssetInfo::Function = privateGetV5AssetTransferQueryAssetInfo
    privateGetV5AssetTransferQueryAccountCoinsBalance::Function = privateGetV5AssetTransferQueryAccountCoinsBalance
    privateGetV5AssetTransferQueryAccountCoinBalance::Function = privateGetV5AssetTransferQueryAccountCoinBalance
    privateGetV5AssetTransferQueryTransferCoinList::Function = privateGetV5AssetTransferQueryTransferCoinList
    privateGetV5AssetTransferQueryInterTransferList::Function = privateGetV5AssetTransferQueryInterTransferList
    privateGetV5AssetTransferQuerySubMemberList::Function = privateGetV5AssetTransferQuerySubMemberList
    privateGetV5AssetTransferQueryUniversalTransferList::Function = privateGetV5AssetTransferQueryUniversalTransferList
    privateGetV5AssetDepositQueryAllowedList::Function = privateGetV5AssetDepositQueryAllowedList
    privateGetV5AssetDepositQueryRecord::Function = privateGetV5AssetDepositQueryRecord
    privateGetV5AssetDepositQuerySubMemberRecord::Function = privateGetV5AssetDepositQuerySubMemberRecord
    privateGetV5AssetDepositQueryInternalRecord::Function = privateGetV5AssetDepositQueryInternalRecord
    privateGetV5AssetDepositQueryAddress::Function = privateGetV5AssetDepositQueryAddress
    privateGetV5AssetDepositQuerySubMemberAddress::Function = privateGetV5AssetDepositQuerySubMemberAddress
    privateGetV5AssetCoinQueryInfo::Function = privateGetV5AssetCoinQueryInfo
    privateGetV5AssetWithdrawQueryAddress::Function = privateGetV5AssetWithdrawQueryAddress
    privateGetV5AssetWithdrawQueryRecord::Function = privateGetV5AssetWithdrawQueryRecord
    privateGetV5AssetWithdrawWithdrawableAmount::Function = privateGetV5AssetWithdrawWithdrawableAmount
    privateGetV5AssetWithdrawVaspList::Function = privateGetV5AssetWithdrawVaspList
    privateGetV5AssetCovertSmallBalanceList::Function = privateGetV5AssetCovertSmallBalanceList
    privateGetV5AssetCovertSmallBalanceHistory::Function = privateGetV5AssetCovertSmallBalanceHistory
    privateGetV5AssetConvertSmallBalanceList::Function = privateGetV5AssetConvertSmallBalanceList
    privateGetV5AssetConvertSmallBalanceHistory::Function = privateGetV5AssetConvertSmallBalanceHistory
    privateGetV5FiatQueryCoinList::Function = privateGetV5FiatQueryCoinList
    privateGetV5FiatReferencePrice::Function = privateGetV5FiatReferencePrice
    privateGetV5FiatTradeQuery::Function = privateGetV5FiatTradeQuery
    privateGetV5FiatQueryTradeHistory::Function = privateGetV5FiatQueryTradeHistory
    privateGetV5FiatBalanceQuery::Function = privateGetV5FiatBalanceQuery
    privateGetV5UserQuerySubMembers::Function = privateGetV5UserQuerySubMembers
    privateGetV5UserQueryApi::Function = privateGetV5UserQueryApi
    privateGetV5UserSubApikeys::Function = privateGetV5UserSubApikeys
    privateGetV5UserGetMemberType::Function = privateGetV5UserGetMemberType
    privateGetV5UserAffCustomerInfo::Function = privateGetV5UserAffCustomerInfo
    privateGetV5UserDelSubmember::Function = privateGetV5UserDelSubmember
    privateGetV5UserSubmembers::Function = privateGetV5UserSubmembers
    privateGetV5UserEscrowSubMembers::Function = privateGetV5UserEscrowSubMembers
    privateGetV5UserInvitationReferrals::Function = privateGetV5UserInvitationReferrals
    privateGetV5AffiliateAffUserList::Function = privateGetV5AffiliateAffUserList
    privateGetV5AffiliateAffiliateSubList::Function = privateGetV5AffiliateAffiliateSubList
    privateGetV5SpotLeverTokenOrderRecord::Function = privateGetV5SpotLeverTokenOrderRecord
    privateGetV5SpotMarginTradeFlexibleAvailableInventory::Function = privateGetV5SpotMarginTradeFlexibleAvailableInventory
    privateGetV5SpotMarginTradeInterestRateHistory::Function = privateGetV5SpotMarginTradeInterestRateHistory
    privateGetV5SpotMarginTradeState::Function = privateGetV5SpotMarginTradeState
    privateGetV5SpotMarginTradeMaxBorrowable::Function = privateGetV5SpotMarginTradeMaxBorrowable
    privateGetV5SpotMarginTradePositionTiers::Function = privateGetV5SpotMarginTradePositionTiers
    privateGetV5SpotMarginTradeCoinstate::Function = privateGetV5SpotMarginTradeCoinstate
    privateGetV5SpotMarginTradeCurrencyData::Function = privateGetV5SpotMarginTradeCurrencyData
    privateGetV5SpotMarginTradeFixedborrowContractInfo::Function = privateGetV5SpotMarginTradeFixedborrowContractInfo
    privateGetV5SpotMarginTradeFixedborrowOrderInfo::Function = privateGetV5SpotMarginTradeFixedborrowOrderInfo
    privateGetV5SpotMarginTradeFixedborrowOrderQuote::Function = privateGetV5SpotMarginTradeFixedborrowOrderQuote
    privateGetV5SpotMarginTradeLiability::Function = privateGetV5SpotMarginTradeLiability
    privateGetV5SpotMarginTradeRepaymentAvailableAmount::Function = privateGetV5SpotMarginTradeRepaymentAvailableAmount
    privateGetV5SpotMarginTradeGetAutoRepayMode::Function = privateGetV5SpotMarginTradeGetAutoRepayMode
    privateGetV5SpotCrossMarginTradeLoanInfo::Function = privateGetV5SpotCrossMarginTradeLoanInfo
    privateGetV5SpotCrossMarginTradeAccount::Function = privateGetV5SpotCrossMarginTradeAccount
    privateGetV5SpotCrossMarginTradeOrders::Function = privateGetV5SpotCrossMarginTradeOrders
    privateGetV5SpotCrossMarginTradeRepayHistory::Function = privateGetV5SpotCrossMarginTradeRepayHistory
    privateGetV5CryptoLoanBorrowableCollateralisableNumber::Function = privateGetV5CryptoLoanBorrowableCollateralisableNumber
    privateGetV5CryptoLoanOngoingOrders::Function = privateGetV5CryptoLoanOngoingOrders
    privateGetV5CryptoLoanRepaymentHistory::Function = privateGetV5CryptoLoanRepaymentHistory
    privateGetV5CryptoLoanBorrowHistory::Function = privateGetV5CryptoLoanBorrowHistory
    privateGetV5CryptoLoanMaxCollateralAmount::Function = privateGetV5CryptoLoanMaxCollateralAmount
    privateGetV5CryptoLoanAdjustmentHistory::Function = privateGetV5CryptoLoanAdjustmentHistory
    privateGetV5CryptoLoanCommonMaxCollateralAmount::Function = privateGetV5CryptoLoanCommonMaxCollateralAmount
    privateGetV5CryptoLoanCommonAdjustmentHistory::Function = privateGetV5CryptoLoanCommonAdjustmentHistory
    privateGetV5CryptoLoanCommonPosition::Function = privateGetV5CryptoLoanCommonPosition
    privateGetV5CryptoLoanFlexibleOngoingCoin::Function = privateGetV5CryptoLoanFlexibleOngoingCoin
    privateGetV5CryptoLoanFlexibleBorrowHistory::Function = privateGetV5CryptoLoanFlexibleBorrowHistory
    privateGetV5CryptoLoanFlexibleRepaymentHistory::Function = privateGetV5CryptoLoanFlexibleRepaymentHistory
    privateGetV5CryptoLoanFixedBorrowContractInfo::Function = privateGetV5CryptoLoanFixedBorrowContractInfo
    privateGetV5CryptoLoanFixedSupplyContractInfo::Function = privateGetV5CryptoLoanFixedSupplyContractInfo
    privateGetV5CryptoLoanFixedBorrowOrderInfo::Function = privateGetV5CryptoLoanFixedBorrowOrderInfo
    privateGetV5CryptoLoanFixedRenewInfo::Function = privateGetV5CryptoLoanFixedRenewInfo
    privateGetV5CryptoLoanFixedSupplyOrderInfo::Function = privateGetV5CryptoLoanFixedSupplyOrderInfo
    privateGetV5CryptoLoanFixedRepaymentHistory::Function = privateGetV5CryptoLoanFixedRepaymentHistory
    privateGetV5InsLoanProductInfos::Function = privateGetV5InsLoanProductInfos
    privateGetV5InsLoanEnsureTokens::Function = privateGetV5InsLoanEnsureTokens
    privateGetV5InsLoanEnsureTokensConvert::Function = privateGetV5InsLoanEnsureTokensConvert
    privateGetV5InsLoanLoanOrder::Function = privateGetV5InsLoanLoanOrder
    privateGetV5InsLoanRepaidHistory::Function = privateGetV5InsLoanRepaidHistory
    privateGetV5InsLoanLtv::Function = privateGetV5InsLoanLtv
    privateGetV5InsLoanLtvConvert::Function = privateGetV5InsLoanLtvConvert
    privateGetV5InsLoanCoinDeltaAmount::Function = privateGetV5InsLoanCoinDeltaAmount
    privateGetV5LendingInfo::Function = privateGetV5LendingInfo
    privateGetV5LendingHistoryOrder::Function = privateGetV5LendingHistoryOrder
    privateGetV5LendingAccount::Function = privateGetV5LendingAccount
    privateGetV5BrokerEarningRecord::Function = privateGetV5BrokerEarningRecord
    privateGetV5BrokerEarningsInfo::Function = privateGetV5BrokerEarningsInfo
    privateGetV5BrokerAccountInfo::Function = privateGetV5BrokerAccountInfo
    privateGetV5BrokerAssetQuerySubMemberDepositRecord::Function = privateGetV5BrokerAssetQuerySubMemberDepositRecord
    privateGetV5EarnProduct::Function = privateGetV5EarnProduct
    privateGetV5EarnOrder::Function = privateGetV5EarnOrder
    privateGetV5EarnPosition::Function = privateGetV5EarnPosition
    privateGetV5EarnYield::Function = privateGetV5EarnYield
    privateGetV5EarnHourlyYield::Function = privateGetV5EarnHourlyYield
    privatePostSpotV3PrivateOrder::Function = privatePostSpotV3PrivateOrder
    privatePostSpotV3PrivateCancelOrder::Function = privatePostSpotV3PrivateCancelOrder
    privatePostSpotV3PrivateCancelOrders::Function = privatePostSpotV3PrivateCancelOrders
    privatePostSpotV3PrivateCancelOrdersByIds::Function = privatePostSpotV3PrivateCancelOrdersByIds
    privatePostSpotV3PrivatePurchase::Function = privatePostSpotV3PrivatePurchase
    privatePostSpotV3PrivateRedeem::Function = privatePostSpotV3PrivateRedeem
    privatePostSpotV3PrivateCrossMarginLoan::Function = privatePostSpotV3PrivateCrossMarginLoan
    privatePostSpotV3PrivateCrossMarginRepay::Function = privatePostSpotV3PrivateCrossMarginRepay
    privatePostAssetV3PrivateTransferInterTransfer::Function = privatePostAssetV3PrivateTransferInterTransfer
    privatePostAssetV3PrivateWithdrawCreate::Function = privatePostAssetV3PrivateWithdrawCreate
    privatePostAssetV3PrivateWithdrawCancel::Function = privatePostAssetV3PrivateWithdrawCancel
    privatePostAssetV3PrivateTransferSubMemberTransfer::Function = privatePostAssetV3PrivateTransferSubMemberTransfer
    privatePostAssetV3PrivateTransferTransferSubMemberSave::Function = privatePostAssetV3PrivateTransferTransferSubMemberSave
    privatePostAssetV3PrivateTransferUniversalTransfer::Function = privatePostAssetV3PrivateTransferUniversalTransfer
    privatePostUserV3PrivateCreateSubMember::Function = privatePostUserV3PrivateCreateSubMember
    privatePostUserV3PrivateCreateSubApi::Function = privatePostUserV3PrivateCreateSubApi
    privatePostUserV3PrivateUpdateApi::Function = privatePostUserV3PrivateUpdateApi
    privatePostUserV3PrivateDeleteApi::Function = privatePostUserV3PrivateDeleteApi
    privatePostUserV3PrivateUpdateSubApi::Function = privatePostUserV3PrivateUpdateSubApi
    privatePostUserV3PrivateDeleteSubApi::Function = privatePostUserV3PrivateDeleteSubApi
    privatePostContractV3PrivateCopytradingOrderCreate::Function = privatePostContractV3PrivateCopytradingOrderCreate
    privatePostContractV3PrivateCopytradingOrderCancel::Function = privatePostContractV3PrivateCopytradingOrderCancel
    privatePostContractV3PrivateCopytradingOrderClose::Function = privatePostContractV3PrivateCopytradingOrderClose
    privatePostContractV3PrivateCopytradingPositionClose::Function = privatePostContractV3PrivateCopytradingPositionClose
    privatePostContractV3PrivateCopytradingPositionSetLeverage::Function = privatePostContractV3PrivateCopytradingPositionSetLeverage
    privatePostContractV3PrivateCopytradingWalletTransfer::Function = privatePostContractV3PrivateCopytradingWalletTransfer
    privatePostContractV3PrivateCopytradingOrderTradingStop::Function = privatePostContractV3PrivateCopytradingOrderTradingStop
    privatePostContractV3PrivateOrderCreate::Function = privatePostContractV3PrivateOrderCreate
    privatePostContractV3PrivateOrderCancel::Function = privatePostContractV3PrivateOrderCancel
    privatePostContractV3PrivateOrderCancelAll::Function = privatePostContractV3PrivateOrderCancelAll
    privatePostContractV3PrivateOrderReplace::Function = privatePostContractV3PrivateOrderReplace
    privatePostContractV3PrivatePositionSetAutoAddMargin::Function = privatePostContractV3PrivatePositionSetAutoAddMargin
    privatePostContractV3PrivatePositionSwitchIsolated::Function = privatePostContractV3PrivatePositionSwitchIsolated
    privatePostContractV3PrivatePositionSwitchMode::Function = privatePostContractV3PrivatePositionSwitchMode
    privatePostContractV3PrivatePositionSwitchTpslMode::Function = privatePostContractV3PrivatePositionSwitchTpslMode
    privatePostContractV3PrivatePositionSetLeverage::Function = privatePostContractV3PrivatePositionSetLeverage
    privatePostContractV3PrivatePositionTradingStop::Function = privatePostContractV3PrivatePositionTradingStop
    privatePostContractV3PrivatePositionSetRiskLimit::Function = privatePostContractV3PrivatePositionSetRiskLimit
    privatePostContractV3PrivateAccountSetMarginMode::Function = privatePostContractV3PrivateAccountSetMarginMode
    privatePostUnifiedV3PrivateOrderCreate::Function = privatePostUnifiedV3PrivateOrderCreate
    privatePostUnifiedV3PrivateOrderReplace::Function = privatePostUnifiedV3PrivateOrderReplace
    privatePostUnifiedV3PrivateOrderCancel::Function = privatePostUnifiedV3PrivateOrderCancel
    privatePostUnifiedV3PrivateOrderCreateBatch::Function = privatePostUnifiedV3PrivateOrderCreateBatch
    privatePostUnifiedV3PrivateOrderReplaceBatch::Function = privatePostUnifiedV3PrivateOrderReplaceBatch
    privatePostUnifiedV3PrivateOrderCancelBatch::Function = privatePostUnifiedV3PrivateOrderCancelBatch
    privatePostUnifiedV3PrivateOrderCancelAll::Function = privatePostUnifiedV3PrivateOrderCancelAll
    privatePostUnifiedV3PrivatePositionSetLeverage::Function = privatePostUnifiedV3PrivatePositionSetLeverage
    privatePostUnifiedV3PrivatePositionTpslSwitchMode::Function = privatePostUnifiedV3PrivatePositionTpslSwitchMode
    privatePostUnifiedV3PrivatePositionSetRiskLimit::Function = privatePostUnifiedV3PrivatePositionSetRiskLimit
    privatePostUnifiedV3PrivatePositionTradingStop::Function = privatePostUnifiedV3PrivatePositionTradingStop
    privatePostUnifiedV3PrivateAccountUpgradeUnifiedAccount::Function = privatePostUnifiedV3PrivateAccountUpgradeUnifiedAccount
    privatePostUnifiedV3PrivateAccountSetMarginMode::Function = privatePostUnifiedV3PrivateAccountSetMarginMode
    privatePostFhtComplianceTaxV3PrivateRegistertime::Function = privatePostFhtComplianceTaxV3PrivateRegistertime
    privatePostFhtComplianceTaxV3PrivateCreate::Function = privatePostFhtComplianceTaxV3PrivateCreate
    privatePostFhtComplianceTaxV3PrivateStatus::Function = privatePostFhtComplianceTaxV3PrivateStatus
    privatePostFhtComplianceTaxV3PrivateUrl::Function = privatePostFhtComplianceTaxV3PrivateUrl
    privatePostV5OrderCreate::Function = privatePostV5OrderCreate
    privatePostV5OrderAmend::Function = privatePostV5OrderAmend
    privatePostV5OrderCancel::Function = privatePostV5OrderCancel
    privatePostV5OrderCancelAll::Function = privatePostV5OrderCancelAll
    privatePostV5OrderCreateBatch::Function = privatePostV5OrderCreateBatch
    privatePostV5OrderAmendBatch::Function = privatePostV5OrderAmendBatch
    privatePostV5OrderCancelBatch::Function = privatePostV5OrderCancelBatch
    privatePostV5OrderDisconnectedCancelAll::Function = privatePostV5OrderDisconnectedCancelAll
    privatePostV5OrderPreCheck::Function = privatePostV5OrderPreCheck
    privatePostV5PositionSetLeverage::Function = privatePostV5PositionSetLeverage
    privatePostV5PositionSwitchIsolated::Function = privatePostV5PositionSwitchIsolated
    privatePostV5PositionSetTpslMode::Function = privatePostV5PositionSetTpslMode
    privatePostV5PositionSwitchMode::Function = privatePostV5PositionSwitchMode
    privatePostV5PositionSetRiskLimit::Function = privatePostV5PositionSetRiskLimit
    privatePostV5PositionTradingStop::Function = privatePostV5PositionTradingStop
    privatePostV5PositionSetAutoAddMargin::Function = privatePostV5PositionSetAutoAddMargin
    privatePostV5PositionAddMargin::Function = privatePostV5PositionAddMargin
    privatePostV5PositionMovePositions::Function = privatePostV5PositionMovePositions
    privatePostV5PositionConfirmPendingMmr::Function = privatePostV5PositionConfirmPendingMmr
    privatePostV5AccountUpgradeToUta::Function = privatePostV5AccountUpgradeToUta
    privatePostV5AccountQuickRepayment::Function = privatePostV5AccountQuickRepayment
    privatePostV5AccountSetMarginMode::Function = privatePostV5AccountSetMarginMode
    privatePostV5AccountSetHedgingMode::Function = privatePostV5AccountSetHedgingMode
    privatePostV5AccountMmpModify::Function = privatePostV5AccountMmpModify
    privatePostV5AccountMmpReset::Function = privatePostV5AccountMmpReset
    privatePostV5AccountBorrow::Function = privatePostV5AccountBorrow
    privatePostV5AccountRepay::Function = privatePostV5AccountRepay
    privatePostV5AccountNoConvertRepay::Function = privatePostV5AccountNoConvertRepay
    privatePostV5AccountSetLimitPxAction::Function = privatePostV5AccountSetLimitPxAction
    privatePostV5AccountSetDeltaMode::Function = privatePostV5AccountSetDeltaMode
    privatePostV5AssetExchangeQuoteApply::Function = privatePostV5AssetExchangeQuoteApply
    privatePostV5AssetExchangeConvertExecute::Function = privatePostV5AssetExchangeConvertExecute
    privatePostV5AssetTransferInterTransfer::Function = privatePostV5AssetTransferInterTransfer
    privatePostV5AssetTransferSaveTransferSubMember::Function = privatePostV5AssetTransferSaveTransferSubMember
    privatePostV5AssetTransferUniversalTransfer::Function = privatePostV5AssetTransferUniversalTransfer
    privatePostV5AssetDepositDepositToAccount::Function = privatePostV5AssetDepositDepositToAccount
    privatePostV5AssetTravelRuleDepositSubmit::Function = privatePostV5AssetTravelRuleDepositSubmit
    privatePostV5AssetWithdrawCreate::Function = privatePostV5AssetWithdrawCreate
    privatePostV5AssetWithdrawCancel::Function = privatePostV5AssetWithdrawCancel
    privatePostV5AssetCovertGetQuote::Function = privatePostV5AssetCovertGetQuote
    privatePostV5AssetCovertSmallBalanceExecute::Function = privatePostV5AssetCovertSmallBalanceExecute
    privatePostV5FiatQuoteApply::Function = privatePostV5FiatQuoteApply
    privatePostV5FiatTradeExecute::Function = privatePostV5FiatTradeExecute
    privatePostV5UserCreateSubMember::Function = privatePostV5UserCreateSubMember
    privatePostV5UserCreateSubApi::Function = privatePostV5UserCreateSubApi
    privatePostV5UserFrozenSubMember::Function = privatePostV5UserFrozenSubMember
    privatePostV5UserUpdateApi::Function = privatePostV5UserUpdateApi
    privatePostV5UserUpdateSubApi::Function = privatePostV5UserUpdateSubApi
    privatePostV5UserDeleteApi::Function = privatePostV5UserDeleteApi
    privatePostV5UserDeleteSubApi::Function = privatePostV5UserDeleteSubApi
    privatePostV5UserAgreement::Function = privatePostV5UserAgreement
    privatePostV5UserCreateDemoMember::Function = privatePostV5UserCreateDemoMember
    privatePostV5SpotLeverTokenPurchase::Function = privatePostV5SpotLeverTokenPurchase
    privatePostV5SpotLeverTokenRedeem::Function = privatePostV5SpotLeverTokenRedeem
    privatePostV5SpotMarginTradeSwitchMode::Function = privatePostV5SpotMarginTradeSwitchMode
    privatePostV5SpotMarginTradeSetLeverage::Function = privatePostV5SpotMarginTradeSetLeverage
    privatePostV5SpotMarginTradeSetAutoRepayMode::Function = privatePostV5SpotMarginTradeSetAutoRepayMode
    privatePostV5SpotMarginTradeFixedborrow::Function = privatePostV5SpotMarginTradeFixedborrow
    privatePostV5SpotMarginTradeFixedborrowRenew::Function = privatePostV5SpotMarginTradeFixedborrowRenew
    privatePostV5SpotCrossMarginTradeLoan::Function = privatePostV5SpotCrossMarginTradeLoan
    privatePostV5SpotCrossMarginTradeRepay::Function = privatePostV5SpotCrossMarginTradeRepay
    privatePostV5SpotCrossMarginTradeSwitch::Function = privatePostV5SpotCrossMarginTradeSwitch
    privatePostV5CryptoLoanBorrow::Function = privatePostV5CryptoLoanBorrow
    privatePostV5CryptoLoanRepay::Function = privatePostV5CryptoLoanRepay
    privatePostV5CryptoLoanAdjustLtv::Function = privatePostV5CryptoLoanAdjustLtv
    privatePostV5CryptoLoanCommonAdjustLtv::Function = privatePostV5CryptoLoanCommonAdjustLtv
    privatePostV5CryptoLoanCommonMaxLoan::Function = privatePostV5CryptoLoanCommonMaxLoan
    privatePostV5CryptoLoanFlexibleBorrow::Function = privatePostV5CryptoLoanFlexibleBorrow
    privatePostV5CryptoLoanFlexibleRepay::Function = privatePostV5CryptoLoanFlexibleRepay
    privatePostV5CryptoLoanFlexibleRepayCollateral::Function = privatePostV5CryptoLoanFlexibleRepayCollateral
    privatePostV5CryptoLoanFixedBorrow::Function = privatePostV5CryptoLoanFixedBorrow
    privatePostV5CryptoLoanFixedRenew::Function = privatePostV5CryptoLoanFixedRenew
    privatePostV5CryptoLoanFixedSupply::Function = privatePostV5CryptoLoanFixedSupply
    privatePostV5CryptoLoanFixedBorrowOrderCancel::Function = privatePostV5CryptoLoanFixedBorrowOrderCancel
    privatePostV5CryptoLoanFixedSupplyOrderCancel::Function = privatePostV5CryptoLoanFixedSupplyOrderCancel
    privatePostV5CryptoLoanFixedFullyRepay::Function = privatePostV5CryptoLoanFixedFullyRepay
    privatePostV5CryptoLoanFixedRepayCollateral::Function = privatePostV5CryptoLoanFixedRepayCollateral
    privatePostV5InsLoanAssociationUid::Function = privatePostV5InsLoanAssociationUid
    privatePostV5InsLoanRepayLoan::Function = privatePostV5InsLoanRepayLoan
    privatePostV5LendingPurchase::Function = privatePostV5LendingPurchase
    privatePostV5LendingRedeem::Function = privatePostV5LendingRedeem
    privatePostV5LendingRedeemCancel::Function = privatePostV5LendingRedeemCancel
    privatePostV5AccountSetCollateralSwitch::Function = privatePostV5AccountSetCollateralSwitch
    privatePostV5AccountSetCollateralSwitchBatch::Function = privatePostV5AccountSetCollateralSwitchBatch
    privatePostV5AccountDemoApplyMoney::Function = privatePostV5AccountDemoApplyMoney
    privatePostV5BrokerAwardInfo::Function = privatePostV5BrokerAwardInfo
    privatePostV5BrokerAwardDistributeAward::Function = privatePostV5BrokerAwardDistributeAward
    privatePostV5BrokerAwardDistributionRecord::Function = privatePostV5BrokerAwardDistributionRecord
    privatePostV5EarnPlaceOrder::Function = privatePostV5EarnPlaceOrder

end
function describe(self::Bybit, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bybit",
    Symbol("name") => "Bybit",
    Symbol("countries") => ["VG"],
    Symbol("version") => "v5",
    Symbol("userAgent") => nothing,
    Symbol("rateLimit") => 20,
    Symbol("hostname") => "bybit.com",
    Symbol("pro") => true,
    Symbol("certified") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => true,
        Symbol("borrowCrossMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelOrdersForSymbols") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => true,
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
        Symbol("createTrailingAmountOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("editOrders") => true,
        Symbol("fetchAllGreeks") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => "emulated",
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => true,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrder") => true,
        Symbol("fetchClosedOrders") => true,
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
        Symbol("fetchDepositAddressesByNetwork") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => "emulated",
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => true,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => true,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => true,
        Symbol("fetchMarketLeverageTiers") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyLiquidations") => true,
        Symbol("fetchMySettlementHistory") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => true,
        Symbol("fetchOpenOrder") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => true,
        Symbol("fetchOptionChain") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionADLRank") => true,
        Symbol("fetchPositionHistory") => "emulated",
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsADLRank") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchPremiumIndexOHLCV") => true,
        Symbol("fetchSettlementHistory") => true,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => true,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("repayCrossMargin") => true,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1",
        Symbol("3m") => "3",
        Symbol("5m") => "5",
        Symbol("15m") => "15",
        Symbol("30m") => "30",
        Symbol("1h") => "60",
        Symbol("2h") => "120",
        Symbol("4h") => "240",
        Symbol("6h") => "360",
        Symbol("12h") => "720",
        Symbol("1d") => "D",
        Symbol("1w") => "W",
        Symbol("1M") => "M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("spot") => "https://api-testnet.{hostname}",
            Symbol("futures") => "https://api-testnet.{hostname}",
            Symbol("v2") => "https://api-testnet.{hostname}",
            Symbol("public") => "https://api-testnet.{hostname}",
            Symbol("private") => "https://api-testnet.{hostname}"
        ),
        Symbol("logo") => "https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("spot") => "https://api.{hostname}",
            Symbol("futures") => "https://api.{hostname}",
            Symbol("v2") => "https://api.{hostname}",
            Symbol("public") => "https://api.{hostname}",
            Symbol("private") => "https://api.{hostname}"
        ),
        Symbol("demotrading") => Dict{Symbol, Any}(
            Symbol("spot") => "https://api-demo.{hostname}",
            Symbol("futures") => "https://api-demo.{hostname}",
            Symbol("v2") => "https://api-demo.{hostname}",
            Symbol("public") => "https://api-demo.{hostname}",
            Symbol("private") => "https://api-demo.{hostname}"
        ),
        Symbol("www") => "https://www.bybit.com",
        Symbol("doc") => ["https://bybit-exchange.github.io/docs/inverse/", "https://bybit-exchange.github.io/docs/linear/", "https://github.com/bybit-exchange"],
        Symbol("fees") => "https://help.bybit.com/hc/en-us/articles/360039261154",
        Symbol("referral") => "https://www.bybit.com/invite?ref=XDK12WP"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("spot/v3/public/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/quote/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/quote/depth/merged") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/quote/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/quote/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/quote/ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/quote/ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/quote/ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/server-time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/infos") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/margin-product-infos") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("spot/v3/public/margin-ensure-tokens") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v3/public/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/public/copytrading/symbol/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/order-book/L2") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/instruments-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/mark-price-kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/index-price-kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/funding/history-funding-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/risk-limit/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/delivery-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/recent-trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/open-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("derivatives/v3/public/insurance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/announcements/index") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/system/status") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/time") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/mark-price-kline") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/index-price-kline") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/premium-index-price-kline") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/instruments-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/rpi_orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/full_orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/funding/history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/recent-trade") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/open-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/historical-volatility") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/insurance") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/risk-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/delivery-price") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/new-delivery-price") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/account-ratio") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/index-price-components") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/price-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/adlAlert") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/market/fee-group-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-lever-token/info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-lever-token/reference") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/data") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/collateral") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-cross-margin-trade/data") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-cross-margin-trade/pledge-token") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-cross-margin-trade/borrow-token") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan/collateral-data") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan/loanable-data") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan-common/loanable-data") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan-common/collateral-data") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan-fixed/supply-order-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan-fixed/borrow-order-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/ins-loan/product-infos") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/ins-loan/ensure-tokens-convert") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/earn/product") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v5/market/instruments-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v2/private/wallet/fund/records") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("spot/v3/private/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/open-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/history-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/my-trades") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/account") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/reference") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/record") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/cross-margin-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("spot/v3/private/cross-margin-account") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("spot/v3/private/cross-margin-loan-info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("spot/v3/private/cross-margin-repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("spot/v3/private/margin-loan-infos") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("spot/v3/private/margin-repaid-infos") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("spot/v3/private/margin-ltv") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("asset/v3/private/transfer/inter-transfer/list/query") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("asset/v3/private/transfer/sub-member/list/query") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("asset/v3/private/transfer/sub-member-transfer/list/query") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("asset/v3/private/transfer/universal-transfer/list/query") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("asset/v3/private/coin-info/query") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("asset/v3/private/deposit/address/query") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("contract/v3/private/copytrading/order/list") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("contract/v3/private/copytrading/position/list") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("contract/v3/private/copytrading/wallet/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("contract/v3/private/position/limit-info") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("contract/v3/private/order/unfilled-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/order/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/position/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/execution/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/position/closed-pnl") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/account/wallet/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/account/fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/account/wallet/fund-records") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/order/unfilled-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/order/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/position/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/execution/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/delivery-record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/settlement-record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/account/wallet/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/account/transaction-log") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/account/borrow-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/account/borrow-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("user/v3/private/frozen-sub-member") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("user/v3/private/query-sub-members") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/v3/private/query-api") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("user/v3/private/get-member-type") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("asset/v3/private/transfer/transfer-coin/list/query") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("asset/v3/private/transfer/account-coin/balance/query") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("asset/v3/private/transfer/account-coins/balance/query") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("asset/v3/private/transfer/asset-info/query") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("asset/v3/public/deposit/allowed-deposit-list/query") => Dict{Symbol, Any}(
    Symbol("cost") => 0.17
),
                Symbol("asset/v3/private/deposit/record/query") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("asset/v3/private/withdraw/record/query") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/order/realtime") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/order/spot-borrow-check") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/position/list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/execution/list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/closed-pnl") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/get-closed-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/move-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/symbol-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/pre-upgrade/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/pre-upgrade/execution/list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/pre-upgrade/position/closed-pnl") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/pre-upgrade/account/transaction-log") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/pre-upgrade/asset/delivery-record") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/pre-upgrade/asset/settlement-record") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/wallet-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/account/borrow-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/account/instruments-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/account/collateral-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/account/option-asset-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/asset/coin-greeks") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/account/fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/transaction-log") => Dict{Symbol, Any}(
    Symbol("cost") => 1.66
),
                Symbol("v5/account/contract-transaction-log") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/account/query-dcp-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/user-setting-config") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/pay-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/trade-info-for-analysis") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/smp-group") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/account/mmp-state") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/withdrawal") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/asset-overview") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/exchange/query-coin-list") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("v5/asset/exchange/convert-result-query") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("v5/asset/exchange/query-convert-history") => Dict{Symbol, Any}(
    Symbol("cost") => 0.5
),
                Symbol("v5/asset/exchange/order-record") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/fundinghistory") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/portfolio-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/total-members-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/delivery-record") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/settlement-record") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/transfer/query-asset-info") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/asset/transfer/query-account-coins-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("v5/asset/transfer/query-account-coin-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/asset/transfer/query-transfer-coin-list") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/asset/transfer/query-inter-transfer-list") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/asset/transfer/query-sub-member-list") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/asset/transfer/query-universal-transfer-list") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("v5/asset/deposit/query-allowed-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/deposit/query-record") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/asset/deposit/query-sub-member-record") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/asset/deposit/query-internal-record") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/deposit/query-address") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/asset/deposit/query-sub-member-address") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/asset/coin/query-info") => Dict{Symbol, Any}(
    Symbol("cost") => 28
),
                Symbol("v5/asset/withdraw/query-address") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/asset/withdraw/query-record") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/asset/withdraw/withdrawable-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/withdraw/vasp/list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/covert/small-balance-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/covert/small-balance-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/convert/small-balance-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/convert/small-balance-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/fiat/query-coin-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/fiat/reference-price") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/fiat/trade-query") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/fiat/query-trade-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/fiat/balance-query") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/user/query-sub-members") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/user/query-api") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/user/sub-apikeys") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/user/get-member-type") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/user/aff-customer-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/user/del-submember") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/user/submembers") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/user/escrow_sub_members") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/user/invitation/referrals") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/affiliate/aff-user-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/affiliate/affiliate-sub-list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-lever-token/order-record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/spot-margin-trade/flexible-available-inventory") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/interest-rate-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/state") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/max-borrowable") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/position-tiers") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/coinstate") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/currency-data") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/fixedborrow-contract-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/fixedborrow-order-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/fixedborrow-order-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/liability") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/repayment-available-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/get-auto-repay-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-cross-margin-trade/loan-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/spot-cross-margin-trade/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/spot-cross-margin-trade/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/spot-cross-margin-trade/repay-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/crypto-loan/borrowable-collateralisable-number") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan/ongoing-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan/repayment-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan/borrow-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan/max-collateral-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan/adjustment-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan-common/max-collateral-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-common/adjustment-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-common/position") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-flexible/ongoing-coin") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-flexible/borrow-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-flexible/repayment-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-fixed/borrow-contract-info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-fixed/supply-contract-info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-fixed/borrow-order-info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-fixed/renew-info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-fixed/supply-order-info") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-fixed/repayment-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/ins-loan/product-infos") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/ins-loan/ensure-tokens") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/ins-loan/ensure-tokens-convert") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/ins-loan/loan-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/ins-loan/repaid-history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/ins-loan/ltv") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/ins-loan/ltv-convert") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/ins-loan/coin-delta-amount") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/lending/info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/lending/history-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/lending/account") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/broker/earning-record") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/broker/earnings-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/broker/account-info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/broker/asset/query-sub-member-deposit-record") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/earn/product") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/earn/order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/earn/position") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/earn/yield") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/earn/hourly-yield") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("spot/v3/private/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/cancel-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/cancel-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/cancel-orders-by-ids") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/purchase") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("spot/v3/private/cross-margin-loan") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("spot/v3/private/cross-margin-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("asset/v3/private/transfer/inter-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("asset/v3/private/withdraw/create") => Dict{Symbol, Any}(
    Symbol("cost") => 300
),
                Symbol("asset/v3/private/withdraw/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("asset/v3/private/transfer/sub-member-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("asset/v3/private/transfer/transfer-sub-member-save") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("asset/v3/private/transfer/universal-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("user/v3/private/create-sub-member") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("user/v3/private/create-sub-api") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("user/v3/private/update-api") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("user/v3/private/delete-api") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("user/v3/private/update-sub-api") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("user/v3/private/delete-sub-api") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("contract/v3/private/copytrading/order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("contract/v3/private/copytrading/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("contract/v3/private/copytrading/order/close") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("contract/v3/private/copytrading/position/close") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("contract/v3/private/copytrading/position/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("contract/v3/private/copytrading/wallet/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("contract/v3/private/copytrading/order/trading-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("contract/v3/private/order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/order/cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/order/replace") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/position/set-auto-add-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/position/switch-isolated") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/position/switch-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/position/switch-tpsl-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/position/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/position/trading-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/position/set-risk-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/v3/private/account/setMarginMode") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("unified/v3/private/order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("unified/v3/private/order/replace") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("unified/v3/private/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("unified/v3/private/order/create-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("unified/v3/private/order/replace-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("unified/v3/private/order/cancel-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("unified/v3/private/order/cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("unified/v3/private/position/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("unified/v3/private/position/tpsl/switch-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("unified/v3/private/position/set-risk-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("unified/v3/private/position/trading-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("unified/v3/private/account/upgrade-unified-account") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("unified/v3/private/account/setMarginMode") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("fht/compliance/tax/v3/private/registertime") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("fht/compliance/tax/v3/private/create") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("fht/compliance/tax/v3/private/status") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("fht/compliance/tax/v3/private/url") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("v5/order/amend") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("v5/order/cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/order/create-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/order/amend-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/order/cancel-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/order/disconnected-cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/order/pre-check") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/switch-isolated") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/set-tpsl-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/switch-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/set-risk-limit") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/trading-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/set-auto-add-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/add-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/move-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/position/confirm-pending-mmr") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/upgrade-to-uta") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/quick-repayment") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/set-margin-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/set-hedging-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/mmp-modify") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/mmp-reset") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/no-convert-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/set-limit-px-action") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/set-delta-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/exchange/quote-apply") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/asset/exchange/convert-execute") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("v5/asset/transfer/inter-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/asset/transfer/save-transfer-sub-member") => Dict{Symbol, Any}(
    Symbol("cost") => 150
),
                Symbol("v5/asset/transfer/universal-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/asset/deposit/deposit-to-account") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/travel-rule/deposit/submit") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/asset/withdraw/create") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/asset/withdraw/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/asset/covert/get-quote") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/asset/covert/small-balance-execute") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/fiat/quote-apply") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/fiat/trade-execute") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/user/create-sub-member") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/user/create-sub-api") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/user/frozen-sub-member") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/user/update-api") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/user/update-sub-api") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/user/delete-api") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/user/delete-sub-api") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/user/agreement") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/user/create-demo-member") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/spot-lever-token/purchase") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("v5/spot-lever-token/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("v5/spot-margin-trade/switch-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/set-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/set-auto-repay-mode") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/fixedborrow") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-margin-trade/fixedborrow-renew") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/spot-cross-margin-trade/loan") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("v5/spot-cross-margin-trade/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("v5/spot-cross-margin-trade/switch") => Dict{Symbol, Any}(
    Symbol("cost") => 2.5
),
                Symbol("v5/crypto-loan/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan/adjust-ltv") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/crypto-loan-common/adjust-ltv") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/crypto-loan-common/max-loan") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("v5/crypto-loan-flexible/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/crypto-loan-flexible/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/crypto-loan-flexible/repay-collateral") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/crypto-loan-fixed/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/crypto-loan-fixed/renew") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/crypto-loan-fixed/supply") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/crypto-loan-fixed/borrow-order-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/crypto-loan-fixed/supply-order-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/crypto-loan-fixed/fully-repay") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/crypto-loan-fixed/repay-collateral") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("v5/ins-loan/association-uid") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/ins-loan/repay-loan") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/lending/purchase") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/lending/redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/lending/redeem-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/set-collateral-switch") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/set-collateral-switch-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/account/demo-apply-money") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/broker/award/info") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/broker/award/distribute-award") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/broker/award/distribution-record") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("v5/earn/place-order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        )
    ),
    Symbol("httpExceptions") => Dict{Symbol, Any}(
        Symbol("403") => RateLimitExceeded
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-10009") => BadRequest,
            Symbol("-1004") => BadRequest,
            Symbol("-1021") => BadRequest,
            Symbol("-1103") => BadRequest,
            Symbol("-1140") => InvalidOrder,
            Symbol("-1197") => InvalidOrder,
            Symbol("-2013") => InvalidOrder,
            Symbol("-2015") => AuthenticationError,
            Symbol("-6017") => BadRequest,
            Symbol("-6025") => BadRequest,
            Symbol("-6029") => BadRequest,
            Symbol("5004") => ExchangeError,
            Symbol("7001") => BadRequest,
            Symbol("10001") => BadRequest,
            Symbol("10002") => InvalidNonce,
            Symbol("10003") => AuthenticationError,
            Symbol("10004") => AuthenticationError,
            Symbol("10005") => PermissionDenied,
            Symbol("10006") => RateLimitExceeded,
            Symbol("10007") => AuthenticationError,
            Symbol("10008") => AccountSuspended,
            Symbol("10009") => AuthenticationError,
            Symbol("10010") => PermissionDenied,
            Symbol("10014") => BadRequest,
            Symbol("10016") => ExchangeError,
            Symbol("10017") => BadRequest,
            Symbol("10018") => RateLimitExceeded,
            Symbol("10020") => PermissionDenied,
            Symbol("10024") => PermissionDenied,
            Symbol("10027") => PermissionDenied,
            Symbol("10028") => PermissionDenied,
            Symbol("10029") => PermissionDenied,
            Symbol("12137") => InvalidOrder,
            Symbol("12201") => BadRequest,
            Symbol("12141") => BadRequest,
            Symbol("100028") => PermissionDenied,
            Symbol("110001") => OrderNotFound,
            Symbol("110003") => InvalidOrder,
            Symbol("110004") => InsufficientFunds,
            Symbol("110005") => InvalidOrder,
            Symbol("110006") => InsufficientFunds,
            Symbol("110007") => InsufficientFunds,
            Symbol("110008") => InvalidOrder,
            Symbol("110009") => InvalidOrder,
            Symbol("110010") => InvalidOrder,
            Symbol("110011") => InvalidOrder,
            Symbol("110012") => InsufficientFunds,
            Symbol("110013") => BadRequest,
            Symbol("110014") => InsufficientFunds,
            Symbol("110015") => BadRequest,
            Symbol("110016") => InvalidOrder,
            Symbol("110017") => InvalidOrder,
            Symbol("110018") => BadRequest,
            Symbol("110019") => InvalidOrder,
            Symbol("110020") => InvalidOrder,
            Symbol("110021") => InvalidOrder,
            Symbol("110022") => InvalidOrder,
            Symbol("110023") => InvalidOrder,
            Symbol("110024") => BadRequest,
            Symbol("110025") => NoChange,
            Symbol("110026") => MarginModeAlreadySet,
            Symbol("110027") => NoChange,
            Symbol("110028") => BadRequest,
            Symbol("110029") => BadRequest,
            Symbol("110030") => InvalidOrder,
            Symbol("110031") => InvalidOrder,
            Symbol("110032") => InvalidOrder,
            Symbol("110033") => InvalidOrder,
            Symbol("110034") => InvalidOrder,
            Symbol("110035") => InvalidOrder,
            Symbol("110036") => InvalidOrder,
            Symbol("110037") => InvalidOrder,
            Symbol("110038") => InvalidOrder,
            Symbol("110039") => InvalidOrder,
            Symbol("110040") => InvalidOrder,
            Symbol("110041") => InvalidOrder,
            Symbol("110042") => InvalidOrder,
            Symbol("110043") => BadRequest,
            Symbol("110044") => InsufficientFunds,
            Symbol("110045") => InsufficientFunds,
            Symbol("110046") => BadRequest,
            Symbol("110047") => BadRequest,
            Symbol("110048") => BadRequest,
            Symbol("110049") => BadRequest,
            Symbol("110050") => BadRequest,
            Symbol("110051") => InsufficientFunds,
            Symbol("110052") => InsufficientFunds,
            Symbol("110053") => InsufficientFunds,
            Symbol("110054") => InvalidOrder,
            Symbol("110055") => InvalidOrder,
            Symbol("110056") => InvalidOrder,
            Symbol("110057") => InvalidOrder,
            Symbol("110058") => InvalidOrder,
            Symbol("110059") => InvalidOrder,
            Symbol("110060") => BadRequest,
            Symbol("110061") => BadRequest,
            Symbol("110062") => BadRequest,
            Symbol("110063") => ExchangeError,
            Symbol("110064") => InvalidOrder,
            Symbol("110065") => PermissionDenied,
            Symbol("110066") => ExchangeError,
            Symbol("110067") => PermissionDenied,
            Symbol("110068") => PermissionDenied,
            Symbol("110069") => PermissionDenied,
            Symbol("110070") => InvalidOrder,
            Symbol("110071") => ExchangeError,
            Symbol("110072") => InvalidOrder,
            Symbol("110073") => ExchangeError,
            Symbol("110092") => InvalidOrder,
            Symbol("110093") => InvalidOrder,
            Symbol("110094") => InvalidOrder,
            Symbol("130006") => InvalidOrder,
            Symbol("130021") => InsufficientFunds,
            Symbol("130074") => InvalidOrder,
            Symbol("131001") => InsufficientFunds,
            Symbol("131084") => ExchangeError,
            Symbol("131200") => ExchangeError,
            Symbol("131201") => ExchangeError,
            Symbol("131202") => BadRequest,
            Symbol("131203") => BadRequest,
            Symbol("131204") => BadRequest,
            Symbol("131205") => BadRequest,
            Symbol("131206") => ExchangeError,
            Symbol("131207") => BadRequest,
            Symbol("131208") => ExchangeError,
            Symbol("131209") => BadRequest,
            Symbol("131210") => BadRequest,
            Symbol("131211") => BadRequest,
            Symbol("131212") => InsufficientFunds,
            Symbol("131213") => BadRequest,
            Symbol("131214") => BadRequest,
            Symbol("131215") => BadRequest,
            Symbol("131216") => ExchangeError,
            Symbol("131217") => ExchangeError,
            Symbol("131231") => NotSupported,
            Symbol("131232") => NotSupported,
            Symbol("131002") => BadRequest,
            Symbol("131003") => ExchangeError,
            Symbol("131004") => AuthenticationError,
            Symbol("131085") => InsufficientFunds,
            Symbol("131086") => BadRequest,
            Symbol("131088") => BadRequest,
            Symbol("131089") => BadRequest,
            Symbol("131090") => ExchangeError,
            Symbol("131091") => ExchangeError,
            Symbol("131092") => ExchangeError,
            Symbol("131093") => ExchangeError,
            Symbol("131094") => BadRequest,
            Symbol("131095") => BadRequest,
            Symbol("131096") => BadRequest,
            Symbol("131097") => ExchangeError,
            Symbol("131098") => ExchangeError,
            Symbol("131099") => ExchangeError,
            Symbol("140001") => OrderNotFound,
            Symbol("140003") => InvalidOrder,
            Symbol("140004") => InsufficientFunds,
            Symbol("140005") => InvalidOrder,
            Symbol("140006") => InsufficientFunds,
            Symbol("140007") => InsufficientFunds,
            Symbol("140008") => InvalidOrder,
            Symbol("140009") => InvalidOrder,
            Symbol("140010") => InvalidOrder,
            Symbol("140011") => InvalidOrder,
            Symbol("140012") => InsufficientFunds,
            Symbol("140013") => BadRequest,
            Symbol("140014") => InsufficientFunds,
            Symbol("140015") => InvalidOrder,
            Symbol("140016") => InvalidOrder,
            Symbol("140017") => InvalidOrder,
            Symbol("140018") => BadRequest,
            Symbol("140019") => InvalidOrder,
            Symbol("140020") => InvalidOrder,
            Symbol("140021") => InvalidOrder,
            Symbol("140022") => InvalidOrder,
            Symbol("140023") => InvalidOrder,
            Symbol("140024") => BadRequest,
            Symbol("140025") => BadRequest,
            Symbol("140026") => BadRequest,
            Symbol("140027") => BadRequest,
            Symbol("140028") => InvalidOrder,
            Symbol("140029") => BadRequest,
            Symbol("140030") => InvalidOrder,
            Symbol("140031") => BadRequest,
            Symbol("140032") => InvalidOrder,
            Symbol("140033") => InvalidOrder,
            Symbol("140034") => InvalidOrder,
            Symbol("140035") => InvalidOrder,
            Symbol("140036") => BadRequest,
            Symbol("140037") => InvalidOrder,
            Symbol("140038") => BadRequest,
            Symbol("140039") => BadRequest,
            Symbol("140040") => InvalidOrder,
            Symbol("140041") => InvalidOrder,
            Symbol("140042") => InvalidOrder,
            Symbol("140043") => BadRequest,
            Symbol("140044") => InsufficientFunds,
            Symbol("140045") => InsufficientFunds,
            Symbol("140046") => BadRequest,
            Symbol("140047") => BadRequest,
            Symbol("140048") => BadRequest,
            Symbol("140049") => BadRequest,
            Symbol("140050") => InvalidOrder,
            Symbol("140051") => InsufficientFunds,
            Symbol("140052") => InsufficientFunds,
            Symbol("140053") => InsufficientFunds,
            Symbol("140054") => InvalidOrder,
            Symbol("140055") => InvalidOrder,
            Symbol("140056") => InvalidOrder,
            Symbol("140057") => InvalidOrder,
            Symbol("140058") => InvalidOrder,
            Symbol("140059") => InvalidOrder,
            Symbol("140060") => BadRequest,
            Symbol("140061") => BadRequest,
            Symbol("140062") => BadRequest,
            Symbol("140063") => ExchangeError,
            Symbol("140064") => InvalidOrder,
            Symbol("140065") => PermissionDenied,
            Symbol("140066") => ExchangeError,
            Symbol("140067") => PermissionDenied,
            Symbol("140068") => PermissionDenied,
            Symbol("140069") => PermissionDenied,
            Symbol("140070") => InvalidOrder,
            Symbol("170001") => ExchangeError,
            Symbol("170005") => InvalidOrder,
            Symbol("170007") => RequestTimeout,
            Symbol("170010") => InvalidOrder,
            Symbol("170011") => InvalidOrder,
            Symbol("170019") => InvalidOrder,
            Symbol("170031") => ExchangeError,
            Symbol("170032") => ExchangeError,
            Symbol("170033") => InsufficientFunds,
            Symbol("170034") => InsufficientFunds,
            Symbol("170035") => BadRequest,
            Symbol("170036") => BadRequest,
            Symbol("170037") => BadRequest,
            Symbol("170105") => BadRequest,
            Symbol("170115") => InvalidOrder,
            Symbol("170116") => InvalidOrder,
            Symbol("170117") => InvalidOrder,
            Symbol("170121") => InvalidOrder,
            Symbol("170124") => InvalidOrder,
            Symbol("170130") => BadRequest,
            Symbol("170131") => InsufficientFunds,
            Symbol("170132") => InvalidOrder,
            Symbol("170133") => InvalidOrder,
            Symbol("170134") => InvalidOrder,
            Symbol("170135") => InvalidOrder,
            Symbol("170136") => InvalidOrder,
            Symbol("170137") => InvalidOrder,
            Symbol("170139") => InvalidOrder,
            Symbol("170140") => InvalidOrder,
            Symbol("170141") => InvalidOrder,
            Symbol("170142") => InvalidOrder,
            Symbol("170143") => InvalidOrder,
            Symbol("170144") => InvalidOrder,
            Symbol("170145") => InvalidOrder,
            Symbol("170146") => InvalidOrder,
            Symbol("170147") => InvalidOrder,
            Symbol("170148") => InvalidOrder,
            Symbol("170149") => ExchangeError,
            Symbol("170150") => ExchangeError,
            Symbol("170151") => InvalidOrder,
            Symbol("170157") => InvalidOrder,
            Symbol("170159") => InvalidOrder,
            Symbol("170190") => InvalidOrder,
            Symbol("170191") => InvalidOrder,
            Symbol("170192") => InvalidOrder,
            Symbol("170193") => InvalidOrder,
            Symbol("170194") => InvalidOrder,
            Symbol("170195") => InvalidOrder,
            Symbol("170196") => InvalidOrder,
            Symbol("170197") => InvalidOrder,
            Symbol("170198") => InvalidOrder,
            Symbol("170199") => InvalidOrder,
            Symbol("170200") => InvalidOrder,
            Symbol("170201") => PermissionDenied,
            Symbol("170202") => InvalidOrder,
            Symbol("170203") => InvalidOrder,
            Symbol("170204") => InvalidOrder,
            Symbol("170206") => InvalidOrder,
            Symbol("170209") => RestrictedLocation,
            Symbol("170210") => InvalidOrder,
            Symbol("170213") => OrderNotFound,
            Symbol("170217") => InvalidOrder,
            Symbol("170218") => InvalidOrder,
            Symbol("170221") => BadRequest,
            Symbol("170222") => RateLimitExceeded,
            Symbol("170223") => InsufficientFunds,
            Symbol("170224") => PermissionDenied,
            Symbol("170226") => InsufficientFunds,
            Symbol("170227") => ExchangeError,
            Symbol("170228") => InvalidOrder,
            Symbol("170229") => InvalidOrder,
            Symbol("170234") => ExchangeError,
            Symbol("170241") => ManualInteractionNeeded,
            Symbol("170371") => InvalidOrder,
            Symbol("170372") => InvalidOrder,
            Symbol("175000") => InvalidOrder,
            Symbol("175001") => InvalidOrder,
            Symbol("175002") => InvalidOrder,
            Symbol("175003") => InsufficientFunds,
            Symbol("175004") => InvalidOrder,
            Symbol("175005") => InvalidOrder,
            Symbol("175006") => InsufficientFunds,
            Symbol("175007") => InvalidOrder,
            Symbol("175008") => InvalidOrder,
            Symbol("175009") => InvalidOrder,
            Symbol("175010") => PermissionDenied,
            Symbol("175012") => InvalidOrder,
            Symbol("175013") => InvalidOrder,
            Symbol("175014") => InvalidOrder,
            Symbol("175015") => InvalidOrder,
            Symbol("175016") => InvalidOrder,
            Symbol("175017") => InvalidOrder,
            Symbol("175027") => ExchangeError,
            Symbol("176002") => BadRequest,
            Symbol("176004") => BadRequest,
            Symbol("176003") => BadRequest,
            Symbol("176006") => BadRequest,
            Symbol("176005") => BadRequest,
            Symbol("176008") => BadRequest,
            Symbol("176007") => BadRequest,
            Symbol("176010") => BadRequest,
            Symbol("176009") => BadRequest,
            Symbol("176012") => BadRequest,
            Symbol("176011") => BadRequest,
            Symbol("176014") => BadRequest,
            Symbol("176013") => BadRequest,
            Symbol("176015") => InsufficientFunds,
            Symbol("176016") => BadRequest,
            Symbol("176017") => BadRequest,
            Symbol("176018") => BadRequest,
            Symbol("176019") => BadRequest,
            Symbol("176020") => BadRequest,
            Symbol("176021") => BadRequest,
            Symbol("176022") => BadRequest,
            Symbol("176023") => BadRequest,
            Symbol("176024") => BadRequest,
            Symbol("176025") => BadRequest,
            Symbol("176026") => BadRequest,
            Symbol("176027") => BadRequest,
            Symbol("176028") => BadRequest,
            Symbol("176029") => BadRequest,
            Symbol("176030") => BadRequest,
            Symbol("176031") => BadRequest,
            Symbol("176034") => BadRequest,
            Symbol("176035") => PermissionDenied,
            Symbol("176036") => PermissionDenied,
            Symbol("176037") => PermissionDenied,
            Symbol("176038") => BadRequest,
            Symbol("176039") => BadRequest,
            Symbol("176040") => BadRequest,
            Symbol("181000") => BadRequest,
            Symbol("181001") => BadRequest,
            Symbol("181002") => InvalidOrder,
            Symbol("181003") => InvalidOrder,
            Symbol("181004") => InvalidOrder,
            Symbol("182000") => InvalidOrder,
            Symbol("181017") => BadRequest,
            Symbol("20001") => OrderNotFound,
            Symbol("20003") => InvalidOrder,
            Symbol("20004") => InvalidOrder,
            Symbol("20005") => InvalidOrder,
            Symbol("20006") => InvalidOrder,
            Symbol("20007") => InvalidOrder,
            Symbol("20008") => InvalidOrder,
            Symbol("20009") => InvalidOrder,
            Symbol("20010") => InvalidOrder,
            Symbol("20011") => InvalidOrder,
            Symbol("20012") => InvalidOrder,
            Symbol("20013") => InvalidOrder,
            Symbol("20014") => InvalidOrder,
            Symbol("20015") => InvalidOrder,
            Symbol("20016") => InvalidOrder,
            Symbol("20017") => InvalidOrder,
            Symbol("20018") => InvalidOrder,
            Symbol("20019") => InvalidOrder,
            Symbol("20020") => InvalidOrder,
            Symbol("20021") => InvalidOrder,
            Symbol("20022") => BadRequest,
            Symbol("20023") => BadRequest,
            Symbol("20031") => BadRequest,
            Symbol("20070") => BadRequest,
            Symbol("20071") => BadRequest,
            Symbol("20084") => BadRequest,
            Symbol("30001") => BadRequest,
            Symbol("30003") => InvalidOrder,
            Symbol("30004") => InvalidOrder,
            Symbol("30005") => InvalidOrder,
            Symbol("30007") => InvalidOrder,
            Symbol("30008") => InvalidOrder,
            Symbol("30009") => ExchangeError,
            Symbol("30010") => InsufficientFunds,
            Symbol("30011") => PermissionDenied,
            Symbol("30012") => PermissionDenied,
            Symbol("30013") => PermissionDenied,
            Symbol("30014") => InvalidOrder,
            Symbol("30015") => InvalidOrder,
            Symbol("30016") => ExchangeError,
            Symbol("30017") => InvalidOrder,
            Symbol("30018") => InvalidOrder,
            Symbol("30019") => InvalidOrder,
            Symbol("30020") => InvalidOrder,
            Symbol("30021") => InvalidOrder,
            Symbol("30022") => InvalidOrder,
            Symbol("30023") => InvalidOrder,
            Symbol("30024") => InvalidOrder,
            Symbol("30025") => InvalidOrder,
            Symbol("30026") => InvalidOrder,
            Symbol("30027") => InvalidOrder,
            Symbol("30028") => InvalidOrder,
            Symbol("30029") => InvalidOrder,
            Symbol("30030") => InvalidOrder,
            Symbol("30031") => InsufficientFunds,
            Symbol("30032") => InvalidOrder,
            Symbol("30033") => RateLimitExceeded,
            Symbol("30034") => OrderNotFound,
            Symbol("30035") => RateLimitExceeded,
            Symbol("30036") => ExchangeError,
            Symbol("30037") => InvalidOrder,
            Symbol("30041") => ExchangeError,
            Symbol("30042") => InsufficientFunds,
            Symbol("30043") => InvalidOrder,
            Symbol("30044") => InvalidOrder,
            Symbol("30045") => InvalidOrder,
            Symbol("30049") => InsufficientFunds,
            Symbol("30050") => ExchangeError,
            Symbol("30051") => ExchangeError,
            Symbol("30052") => ExchangeError,
            Symbol("30054") => ExchangeError,
            Symbol("30057") => ExchangeError,
            Symbol("30063") => ExchangeError,
            Symbol("30067") => InsufficientFunds,
            Symbol("30068") => ExchangeError,
            Symbol("30074") => InvalidOrder,
            Symbol("30075") => InvalidOrder,
            Symbol("30078") => ExchangeError,
            Symbol("33004") => AuthenticationError,
            Symbol("34026") => ExchangeError,
            Symbol("34036") => BadRequest,
            Symbol("35015") => BadRequest,
            Symbol("340099") => ExchangeError,
            Symbol("3400045") => ExchangeError,
            Symbol("3100116") => BadRequest,
            Symbol("3100198") => BadRequest,
            Symbol("3200300") => InsufficientFunds
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Not supported symbols") => BadSymbol,
            Symbol("Request timeout") => RequestTimeout,
            Symbol("unknown orderInfo") => OrderNotFound,
            Symbol("invalid api_key") => AuthenticationError,
            Symbol("oc_diff") => InsufficientFunds,
            Symbol("new_oc") => InsufficientFunds,
            Symbol("openapi sign params error!") => AuthenticationError
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("enableDemoTrading") => false,
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("usePrivateInstrumentsInfo") => false,
            Symbol("types") => ["spot", "linear", "inverse", "option"],
            Symbol("options") => ["BTC", "ETH", "SOL", "XRP", "MNT", "DOGE"],
            Symbol("loadAllOptions") => false,
            Symbol("loadExpiredOptions") => false
        ),
        Symbol("enableUnifiedMargin") => nothing,
        Symbol("enableUnifiedAccount") => nothing,
        Symbol("unifiedMarginStatus") => nothing,
        Symbol("createOrder") => Dict{Symbol, Any}(
            Symbol("createMarketBuyOrderRequiresPrice") => false
        ),
        Symbol("createUnifiedMarginAccount") => false,
        Symbol("defaultType") => "swap",
        Symbol("defaultSubType") => "linear",
        Symbol("defaultSettle") => "USDT",
        Symbol("code") => "BTC",
        Symbol("recvWindow") => 5 * 1000,
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("brokerId") => "CCXT",
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "SPOT",
            Symbol("margin") => "SPOT",
            Symbol("future") => "CONTRACT",
            Symbol("swap") => "CONTRACT",
            Symbol("option") => "OPTION",
            Symbol("investment") => "INVESTMENT",
            Symbol("unified") => "UNIFIED",
            Symbol("funding") => "FUND",
            Symbol("fund") => "FUND",
            Symbol("contract") => "CONTRACT"
        ),
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("SPOT") => "spot",
            Symbol("MARGIN") => "spot",
            Symbol("CONTRACT") => "contract",
            Symbol("OPTION") => "option",
            Symbol("INVESTMENT") => "investment",
            Symbol("UNIFIED") => "unified",
            Symbol("FUND") => "fund"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "BTC",
            Symbol("BRC20") => "BTC",
            Symbol("ETH") => "ETH",
            Symbol("ERC20") => "ETH",
            Symbol("TRX") => "TRX",
            Symbol("TRC20") => "TRX",
            Symbol("BSC") => "BSC",
            Symbol("BEP20") => "BSC",
            Symbol("SOL") => "SOL",
            Symbol("ACA") => "ACA",
            Symbol("ADA") => "ADA",
            Symbol("ALGO") => "ALGO",
            Symbol("APT") => "APTOS",
            Symbol("ARBITRUM") => "ARBI",
            Symbol("ARBITRUM_NOVA") => "ARBINOVA",
            Symbol("AVAXC") => "CAVAX",
            Symbol("AVAXX") => "XAVAX",
            Symbol("COSMOS") => "ATOM",
            Symbol("ATOM") => "ATOM",
            Symbol("BCH") => "BCH",
            Symbol("BEP2") => "BNB",
            Symbol("DOGE") => "DOGE",
            Symbol("DOT") => "DOT",
            Symbol("EGLD") => "EGLD",
            Symbol("EOS") => "EOS",
            Symbol("ETC") => "ETC",
            Symbol("ETHW") => "ETHW",
            Symbol("FIL") => "FIL",
            Symbol("STEP") => "FITFI",
            Symbol("SONIC") => "SONIC",
            Symbol("GLMR") => "GLMR",
            Symbol("HBAR") => "HBAR",
            Symbol("ICP") => "ICP",
            Symbol("KLAY") => "KLAY",
            Symbol("LTC") => "LTC",
            Symbol("POLYGON") => "MATIC",
            Symbol("MATIC") => "MATIC",
            Symbol("NEAR") => "NEAR",
            Symbol("OASYS") => "OAS",
            Symbol("OASIS") => "ROSE",
            Symbol("ONE") => "ONE",
            Symbol("OP") => "OP",
            Symbol("SCRT") => "SCRT",
            Symbol("STX") => "STX",
            Symbol("TON") => "TON",
            Symbol("WAX") => "WAXP",
            Symbol("XEC") => "XEC",
            Symbol("XLM") => "XLM",
            Symbol("XRP") => "XRP",
            Symbol("XTZ") => "XTZ",
            Symbol("ZIL") => "ZIL",
            Symbol("ZKSYNCLITE") => "ZKSYNC",
            Symbol("ZKSYNCERA") => "ZKV2",
            Symbol("0G") => "ZEROGRAVITY",
            Symbol("MANTLE") => "MANTLE",
            Symbol("CHZ") => "CHILIZ",
            Symbol("BASE") => "BASE",
            Symbol("CELO") => "CELO",
            Symbol("SCROLL") => "SCROLL",
            Symbol("SUI") => "SUI",
            Symbol("DYDX") => "DYDX",
            Symbol("HUMANITY") => "HUMANITY",
            Symbol("HYPER") => "HYPEREVM",
            Symbol("MONAD") => "MONAD",
            Symbol("MOVE") => "MOVE"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("ETH") => "ERC20",
            Symbol("TRX") => "TRC20",
            Symbol("BSC") => "BEP20",
            Symbol("OP") => "OP",
            Symbol("MATIC") => "MATIC",
            Symbol("SPL") => "SOL"
        ),
        Symbol("defaultNetwork") => "ERC20",
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("USDT") => "TRC20"
        ),
        Symbol("intervals") => Dict{Symbol, Any}(
            Symbol("5m") => "5min",
            Symbol("15m") => "15min",
            Symbol("30m") => "30min",
            Symbol("1h") => "1h",
            Symbol("4h") => "4h",
            Symbol("1d") => "1d"
        ),
        Symbol("useMarkPriceForPositionCollateral") => false
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => true
                ),
                Symbol("triggerDirection") => true,
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
                Symbol("selfTradePrevention") => true,
                Symbol("trailing") => true,
                Symbol("iceberg") => false,
                Symbol("leverage") => false,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 100,
                Symbol("daysBack") => 365 * 2,
                Symbol("untilDays") => 7,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 50,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 50,
                Symbol("daysBack") => 365 * 2,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 7,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            ),
            Symbol("editOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("fetchCurrencies") => Dict{Symbol, Any}(
                Symbol("private") => true
            ),
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("triggerPriceType") => nothing,
                Symbol("triggerDirection") => false,
                Symbol("attachedStopLossTakeProfit") => Dict{Symbol, Any}(
                    Symbol("triggerPriceType") => nothing,
                    Symbol("price") => true
                ),
                Symbol("marketBuyRequiresPrice") => true
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
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => 0.00075,
            Symbol("maker") => 0.0001
        ),
        Symbol("funding") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => false,
            Symbol("withdraw") => Dict{Symbol, Any}(),
            Symbol("deposit") => Dict{Symbol, Any}()
        )
    ),
    Symbol("rollingWindowSize") => 5000
))

end
"""
enables or disables demo trading mode
see: https://bybit-exchange.github.io/docs/v5/demo

# Arguments
- `enable`::bool, optional: true if demo trading should be enabled, false otherwise
"""
function enableDemoTrading(self::Bybit, enable)
    if functions.ccxtruthy(self.isSandboxModeEnabled)
        throw(NotSupported(string(self.id, " demo trading does not support in sandbox environment")));
    end
    if functions.ccxtruthy(enable)
        self.urls[Symbol("apiBackupDemoTrading")] = get(self.urls, Symbol("api"), nothing);
        self.urls[Symbol("api")] = get(self.urls, Symbol("demotrading"), nothing);
    elseif functions.ccxtruthy(ccxt_in("apiBackupDemoTrading", self.urls))
        self.urls[Symbol("api")] = get(self.urls, Symbol("apiBackupDemoTrading"), nothing);
        newUrls = omit(self.urls, "apiBackupDemoTrading");
        self.urls = newUrls;
    end
    self.options[Symbol("enableDemoTrading")] = enable;

end
function nonce(self::Bybit, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function addPaginationCursorToResult(self::Bybit, response)
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeListN(result, ["list", "rows", "data", "dataList"], defaultValue = []);
    paginationCursor = safeString2(result, "nextPageCursor", "cursor");
    dataLength = length(data);
    if functions.ccxtruthy(@functions.ccxt_and((paginationCursor != nothing), (functions.ccxt_gt(dataLength, 0))))
        first_var = get(data, 1, nothing);
        first_var[Symbol("nextPageCursor")] = paginationCursor;
        data[1] = first_var;
    end
    return data

end
"""
returns [enableUnifiedMargin, enableUnifiedAccount] so the user can check if unified account is enabled
see: https://bybit-exchange.github.io/docs/v5/user/apikey-info#http-request
see: https://bybit-exchange.github.io/docs/v5/account/account-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- [enableUnifiedMargin, enableUnifiedAccount]
"""
function isUnifiedEnabled(self::Bybit; params=Dict())
    enableUnifiedMargin = self.safeBool(self.options, "enableUnifiedMargin");
    enableUnifiedAccount = self.safeBool(self.options, "enableUnifiedAccount");
    if functions.ccxtruthy(@functions.ccxt_or(enableUnifiedMargin == nothing, enableUnifiedAccount == nothing))
        if functions.ccxtruthy(get(self.options, Symbol("enableDemoTrading"), nothing))
            self.options[Symbol("enableUnifiedMargin")] = false;
            self.options[Symbol("enableUnifiedAccount")] = true;
            self.options[Symbol("unifiedMarginStatus")] = 6;
                return [get(self.options, Symbol("enableUnifiedMargin"), nothing), get(self.options, Symbol("enableUnifiedAccount"), nothing)]
        end
        rawPromises = [self.privateGetV5UserQueryApi(params), self.privateGetV5AccountInfo(params)];
        promises = Base.fetch(asyncmap(Base.fetch, rawPromises));
        response = get(promises, 1, nothing);
        accountInfo = get(promises, 2, nothing);
        result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
        accountResult = self.safeDict(accountInfo, "result", defaultValue = Dict{Symbol, Any}());
        self.options[Symbol("enableUnifiedMargin")] = safeInteger(result, "unified") == 1;
        self.options[Symbol("enableUnifiedAccount")] = safeInteger(result, "uta") == 1;
        self.options[Symbol("unifiedMarginStatus")] = safeInteger(accountResult, "unifiedMarginStatus", 6);
    end
    return [get(self.options, Symbol("enableUnifiedMargin"), nothing), get(self.options, Symbol("enableUnifiedAccount"), nothing)]

end
"""
upgrades the account to unified trade account *warning* this is irreversible
see: https://bybit-exchange.github.io/docs/v5/account/upgrade-unified-account

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- nothing
"""
function upgradeUnifiedTradeAccount(self::Bybit; params=Dict())
    return Base.fetch(self.privatePostV5AccountUpgradeToUta(params))

end
function createExpiredOptionMarket(self::Bybit, symbol)
    quote_var = nothing;
    settle = nothing;
    optionParts = split(symbol, "-");
    symbolBase = split(symbol, "/");
    base = nothing;
    expiry = nothing;
    if functions.ccxtruthy(findfirst("/", symbol) !== nothing)
        base = safeString(symbolBase, 0);
        expiry = safeString(optionParts, 1);
        symbolQuoteAndSettle = safeString(symbolBase, 1);
        if functions.ccxtruthy(symbolQuoteAndSettle == nothing)
            throw(ExchangeError(string(self.id, " createExpiredOptionMarket() missing symbolQuoteAndSettle")));
        end
        splitQuote = split(symbolQuoteAndSettle, ":");
        quoteAndSettle = safeString(splitQuote, 0);
        quote_var = quoteAndSettle;
        settle = quoteAndSettle;
    else
        base = safeString(optionParts, 0);
        expiry = self.convertMarketIdExpireDate(safeString(optionParts, 1));
        if functions.ccxtruthy(endswith(symbol, "-USDT"))
            quote_var = "USDT";
            settle = "USDT";
        else
            quote_var = "USDC";
            settle = "USDC";
        end
    end
    strike = safeString(optionParts, 2);
    optionType = safeString(optionParts, 3);
    datetime = self.convertExpireDate(expiry);
    timestamp = self.parse8601(datetime);
    amountPrecision = nothing;
    pricePrecision = nothing;
    if functions.ccxtruthy(base == "BTC")
        amountPrecision = self.parseNumber("0.01");
        pricePrecision = self.parseNumber("5");
    elseif functions.ccxtruthy(base == "ETH")
        amountPrecision = self.parseNumber("0.1");
        pricePrecision = self.parseNumber("0.1");
    else
        if functions.ccxtruthy(base == "SOL")
            amountPrecision = self.parseNumber("1");
            pricePrecision = self.parseNumber("0.01");
        end

    end
    convertedExpireDate = self.convertExpireDateToMarketIdDate(expiry);
    return Dict{Symbol, Any}(
    Symbol("id") => string(base, "-", convertedExpireDate, "-", strike, "-", optionType),
    Symbol("symbol") => string(base, "/", quote_var, ":", settle, "-", expiry, "-", strike, "-", optionType),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => base,
    Symbol("quoteId") => quote_var,
    Symbol("settleId") => settle,
    Symbol("active") => false,
    Symbol("type") => "option",
    Symbol("subType") => functions.ccxtruthy((base == settle)) ? "inverse" : "linear",
    Symbol("linear") => (base != settle),
    Symbol("inverse") => (base == settle),
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
        Symbol("amount") => amountPrecision,
        Symbol("price") => pricePrecision
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
function safeMarket(self::Bybit; marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    isOption = @functions.ccxt_and((marketId != nothing), (@functions.ccxt_or((findfirst("-C", marketId) !== nothing), (findfirst("-P", marketId) !== nothing))));
    if functions.ccxtruthy(@functions.ccxt_and(isOption, (@functions.ccxt_or((self.markets_by_id == nothing), !functions.ccxtruthy((ccxt_in(marketId, self.markets_by_id)))))))
            return self.createExpiredOptionMarket(marketId)
    end
    return safeMarket(self.parent, marketId = marketId, market = market, delimiter = delimiter, marketType = marketType)

end
function getBybitType(self::Bybit, method, market; params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams(method, market = market, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams(method, market = market, params = params);
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "option", type_var == "spot"))
            return [type_var, params]
    end
    return [subType, params]

end
function getAmount(self::Bybit, symbol, amount)
    market = self.market(symbol);
    emptyPrecisionAmount = (get(get(market, Symbol("precision"), nothing), Symbol("amount"), nothing) == nothing);
    amountString = numberToString(amount);
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(emptyPrecisionAmount), (amountString != "0")))
            return self.amountToPrecision(symbol, amount)
    end
    return amountString

end
function getPrice(self::Bybit, symbol, price)
    if functions.ccxtruthy(price == nothing)
            return price
    end
    market = self.market(symbol);
    emptyPrecisionPrice = (get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing) == nothing);
    if functions.ccxtruthy(!functions.ccxtruthy(emptyPrecisionPrice))
            return self.priceToPrecision(symbol, price)
    end
    return price

end
function getCost(self::Bybit, symbol, cost)
    market = self.market(symbol);
    emptyPrecisionPrice = (get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing) == nothing);
    if functions.ccxtruthy(!functions.ccxtruthy(emptyPrecisionPrice))
            return self.costToPrecision(symbol, cost)
    end
    return cost

end
"""
the latest known information on the availability of the exchange API
see: https://bybit-exchange.github.io/docs/v5/system-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)
"""
function fetchStatus(self::Bybit; params=Dict())
    response = Base.fetch(self.publicGetV5SystemStatus(params));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    list = self.safeList(result, "list", defaultValue = []);
    status = "ok";
    eta = nothing;
    url = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(list)))
        event = get(list, i + 1, nothing);
        state = safeString(event, "state");
        if functions.ccxtruthy(state == "ongoing")
            status = "maintenance";
            eta = safeInteger(event, "end");
            url = safeString(event, "href");
            break
        elseif functions.ccxtruthy(state == "scheduled")
            eta = safeInteger(event, "begin");
            url = safeString(event, "href");
        end
        i += 1
    end
    return Dict{Symbol, Any}(
    Symbol("status") => status,
    Symbol("updated") => nothing,
    Symbol("eta") => eta,
    Symbol("url") => url,
    Symbol("info") => response
)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://bybit-exchange.github.io/docs/v5/market/time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Bybit; params=Dict())
    response = Base.fetch(self.publicGetV5MarketTime(params));
    return safeInteger(response, "time")

end
"""
fetches all available currencies on an exchange
see: https://bybit-exchange.github.io/docs/v5/asset/coin-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Bybit; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(self.checkRequiredCredentials(error = false)))
            return Dict{Symbol, Any}()
    end
    if functions.ccxtruthy(get(self.options, Symbol("enableDemoTrading"), nothing))
            return Dict{Symbol, Any}()
    end
    response = Base.fetch(self.privateGetV5AssetCoinQueryInfo(params));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", defaultValue = []);
    return self.parseCurrencies(rows)

end
function parseCurrency(self::Bybit, currency)
    currencyId = safeString(currency, "coin");
    code = self.safeCurrencyCode(currencyId);
    name = safeString(currency, "name");
    chains = self.safeList(currency, "chains", defaultValue = []);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "chain");
        networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("info") => chain,
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("active") => nothing,
                Symbol("deposit") => safeInteger(chain, "chainDeposit") == 1,
                Symbol("withdraw") => safeInteger(chain, "chainWithdraw") == 1,
                Symbol("fee") => self.safeNumber(chain, "withdrawFee"),
                Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(chain, "minAccuracy"))),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(chain, "withdrawMin"),
                        Symbol("max") => nothing
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(chain, "depositMin"),
                        Symbol("max") => nothing
                    )
                )
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => currency,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("name") => name,
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
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
    Symbol("networks") => networks,
    Symbol("type") => "crypto"
))

end
"""
retrieves data on all markets for bybit
see: https://bybit-exchange.github.io/docs/v5/market/instrument

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Bybit; params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    promisesUnresolved = [];
    types = nothing;
    defaultTypes = ["spot", "linear", "inverse", "option"];
    fetchMarketsOptions = self.safeDict(self.options, "fetchMarkets");
    if functions.ccxtruthy(fetchMarketsOptions != nothing)
        types = self.safeList(fetchMarketsOptions, "types", defaultValue = defaultTypes);
    else
        types = self.safeList(self.options, "fetchMarkets", defaultValue = defaultTypes);
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(types)))
        marketType = get(types, i + 1, nothing);
        if functions.ccxtruthy(marketType == "spot")
                        push!(promisesUnresolved, self.fetchSpotMarkets(params));
        elseif functions.ccxtruthy(marketType == "linear")
            push!(promisesUnresolved, self.fetchFutureMarkets(params = Dict{Symbol, Any}(
    Symbol("category") => "linear"
)));
        else
            if functions.ccxtruthy(marketType == "inverse")
                                push!(promisesUnresolved, self.fetchFutureMarkets(params = Dict{Symbol, Any}(
    Symbol("category") => "inverse"
)));
            elseif functions.ccxtruthy(marketType == "option")
                optionsCurrencies = self.safeList(fetchMarketsOptions, "options", defaultValue = ["BTC", "ETH", "SOL"]);
                j = 0
                while functions.ccxtruthy(functions.ccxt_lt(j, length(optionsCurrencies)))
                    currency = get(optionsCurrencies, j + 1, nothing);
                    push!(promisesUnresolved, self.fetchOptionMarkets(Dict{Symbol, Any}(
    Symbol("baseCoin") => currency
)));
                    j += 1
                end
            else
                throw(ExchangeError(string(self.id, " fetchMarkets() this.options fetchMarkets \"", marketType, "\" is not a supported market type")));
            end

        end
        i += 1
    end
    promises = Base.fetch(asyncmap(Base.fetch, promisesUnresolved));
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(promises)))
        parsedMarket = get(promises, i + 1, nothing);
        result = arrayConcat(result, parsedMarket);
        i += 1
    end
    return result

end
function fetchSpotMarkets(self::Bybit, params)
    request = Dict{Symbol, Any}(
        Symbol("category") => "spot"
    );
    usePrivateInstrumentsInfo = self.handleOption("fetchMarkets", "usePrivateInstrumentsInfo", defaultValue = false);
    if functions.ccxtruthy(usePrivateInstrumentsInfo)
        response = Base.fetch(self.privateGetV5MarketInstrumentsInfo(extend(request, params)));
    else
        response = Base.fetch(self.publicGetV5MarketInstrumentsInfo(extend(request, params)));
    end
    responseResult = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    markets = self.safeList(responseResult, "list", defaultValue = []);
    result = [];
    takerFee = self.parseNumber("0.001");
    makerFee = self.parseNumber("0.001");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "symbol");
        baseId = safeString(market, "baseCoin");
        quoteId = safeString(market, "quoteCoin");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        symbol = string(base, "/", quote_var);
        status = safeString(market, "status");
        active = (status == "Trading");
        lotSizeFilter = self.safeDict(market, "lotSizeFilter");
        priceFilter = self.safeDict(market, "priceFilter");
        quotePrecision = self.safeNumber(lotSizeFilter, "quotePrecision");
        marginTrading = safeString(market, "marginTrading", "none");
        allowsMargin = marginTrading != "none";
        push!(result, self.safeMarketStructure(market = Dict{Symbol, Any}(
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
    Symbol("margin") => allowsMargin,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => takerFee,
    Symbol("maker") => makerFee,
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(lotSizeFilter, "basePrecision"),
        Symbol("price") => self.safeNumber(priceFilter, "tickSize", defaultNumber = quotePrecision)
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(lotSizeFilter, "minOrderQty"),
            Symbol("max") => self.safeNumber(lotSizeFilter, "maxOrderQty")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(lotSizeFilter, "minOrderAmt"),
            Symbol("max") => self.safeNumber(lotSizeFilter, "maxOrderAmt")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
)));
        i += 1
    end
    return result

end
function fetchFutureMarkets(self::Bybit; params=Dict())
    params = extend(params, Dict{Symbol, Any}());
    params[Symbol("limit")] = 1000;
    preLaunchMarkets = [];
    usePrivateInstrumentsInfo = self.handleOption("fetchMarkets", "usePrivateInstrumentsInfo", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(usePrivateInstrumentsInfo)
        response = Base.fetch(self.privateGetV5MarketInstrumentsInfo(params));
    else
        linearPromises = [self.publicGetV5MarketInstrumentsInfo(params), self.publicGetV5MarketInstrumentsInfo(extend(params, Dict{Symbol, Any}(
            Symbol("status") => "PreLaunch"
        )))];
        promises = Base.fetch(asyncmap(Base.fetch, linearPromises));
        response = self.safeDict(promises, 0, defaultValue = Dict{Symbol, Any}());
        preLaunchMarkets = self.safeDict(promises, 1, defaultValue = Dict{Symbol, Any}());
    end
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    markets = self.safeList(data, "list", defaultValue = []);
    paginationCursor = safeString(data, "nextPageCursor");
    if functions.ccxtruthy(paginationCursor != nothing)
        while functions.ccxtruthy(paginationCursor != nothing)
            params[Symbol("cursor")] = paginationCursor;
            
            if functions.ccxtruthy(usePrivateInstrumentsInfo)
                responseInner = Base.fetch(self.privateGetV5MarketInstrumentsInfo(params));
            else
                responseInner = Base.fetch(self.publicGetV5MarketInstrumentsInfo(params));
            end
            dataNew = self.safeDict(responseInner, "result", defaultValue = Dict{Symbol, Any}());
            rawMarkets = self.safeList(dataNew, "list", defaultValue = []);
            rawMarketsLength = length(rawMarkets);
            if functions.ccxtruthy(rawMarketsLength == 0)
                break
            end
            markets = arrayConcat(rawMarkets, markets);
            paginationCursor = safeString(dataNew, "nextPageCursor");
        end

    end
    preLaunchData = self.safeDict(preLaunchMarkets, "result", defaultValue = Dict{Symbol, Any}());
    preLaunchMarketsList = self.safeList(preLaunchData, "list", defaultValue = []);
    markets = arrayConcat(markets, preLaunchMarketsList);
    result = [];
    category = safeString(data, "category");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        if functions.ccxtruthy(category == nothing)
            category = safeString(market, "category");
        end
        linear = (category == "linear");
        inverse = (category == "inverse");
        contractType = safeString(market, "contractType");
        inverseFutures = (contractType == "InverseFutures");
        linearFutures = (contractType == "LinearFutures");
        linearPerpetual = (contractType == "LinearPerpetual");
        inversePerpetual = (contractType == "InversePerpetual");
        id = safeString(market, "symbol");
        baseId = safeString(market, "baseCoin");
        quoteId = safeString(market, "quoteCoin");
        defaultSettledId = functions.ccxtruthy(linear) ? quoteId : baseId;
        settleId = safeString(market, "settleCoin", defaultSettledId);
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = nothing;
        if functions.ccxtruthy(@functions.ccxt_and(linearPerpetual, (settleId == "USD")))
            settle = "USDC";
        else
            settle = self.safeCurrencyCode(settleId);
        end
        symbol = string(base, "/", quote_var);
        lotSizeFilter = self.safeDict(market, "lotSizeFilter", defaultValue = Dict{Symbol, Any}());
        priceFilter = self.safeDict(market, "priceFilter", defaultValue = Dict{Symbol, Any}());
        leverage = self.safeDict(market, "leverageFilter", defaultValue = Dict{Symbol, Any}());
        status = safeString(market, "status");
        swap = @functions.ccxt_or(linearPerpetual, inversePerpetual);
        future = @functions.ccxt_or(inverseFutures, linearFutures);
        type_var = nothing;
        if functions.ccxtruthy(swap)
            type_var = "swap";
        elseif functions.ccxtruthy(future)
            type_var = "future";
        end
        expiry = nothing;
        if functions.ccxtruthy(!functions.ccxtruthy(swap))
            expiry = omitZero(safeString(market, "deliveryTime"));
            if functions.ccxtruthy(expiry != nothing)
                expiry = ccxt_parseInt(expiry);
            end
        end
        expiryDatetime = self.iso8601(expiry);
        symbol = string(symbol, ":", settle);
        if functions.ccxtruthy(expiry != nothing)
            symbol = string(symbol, "-", self.yymmdd(expiry));
        end
        contractSize = functions.ccxtruthy(inverse) ? self.safeNumber2(lotSizeFilter, "minTradingQty", "minOrderQty") : self.parseNumber("1");
        parsedMarket = self.safeMarketStructure(market = Dict{Symbol, Any}(
            Symbol("id") => id,
            Symbol("symbol") => symbol,
            Symbol("base") => base,
            Symbol("quote") => quote_var,
            Symbol("settle") => settle,
            Symbol("baseId") => baseId,
            Symbol("quoteId") => quoteId,
            Symbol("settleId") => settleId,
            Symbol("type") => type_var,
            Symbol("spot") => false,
            Symbol("margin") => nothing,
            Symbol("swap") => swap,
            Symbol("future") => future,
            Symbol("option") => false,
            Symbol("active") => (status == "Trading"),
            Symbol("contract") => true,
            Symbol("linear") => linear,
            Symbol("inverse") => inverse,
            Symbol("taker") => self.safeNumber(market, "takerFee", defaultNumber = self.parseNumber("0.0006")),
            Symbol("maker") => self.safeNumber(market, "makerFee", defaultNumber = self.parseNumber("0.0001")),
            Symbol("contractSize") => contractSize,
            Symbol("expiry") => expiry,
            Symbol("expiryDatetime") => expiryDatetime,
            Symbol("strike") => nothing,
            Symbol("optionType") => nothing,
            Symbol("precision") => Dict{Symbol, Any}(
                Symbol("amount") => self.safeNumber(lotSizeFilter, "qtyStep"),
                Symbol("price") => self.safeNumber(priceFilter, "tickSize")
            ),
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("leverage") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(leverage, "minLeverage"),
                    Symbol("max") => self.safeNumber(leverage, "maxLeverage")
                ),
                Symbol("amount") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber2(lotSizeFilter, "minTradingQty", "minOrderQty"),
                    Symbol("max") => self.safeNumber2(lotSizeFilter, "maxTradingQty", "maxOrderQty")
                ),
                Symbol("price") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(priceFilter, "minPrice"),
                    Symbol("max") => self.safeNumber(priceFilter, "maxPrice")
                ),
                Symbol("cost") => Dict{Symbol, Any}(
                    Symbol("min") => nothing,
                    Symbol("max") => nothing
                )
            ),
            Symbol("created") => safeInteger(market, "launchTime"),
            Symbol("info") => market
        ));
        push!(result, parsedMarket);
        i += 1
    end
    return result

end
function fetchOptionMarkets(self::Bybit, params)
    request = Dict{Symbol, Any}(
        Symbol("category") => "option"
    );
    usePrivateInstrumentsInfo = self.handleOption("fetchMarkets", "usePrivateInstrumentsInfo", defaultValue = false);
    if functions.ccxtruthy(usePrivateInstrumentsInfo)
        response = Base.fetch(self.privateGetV5MarketInstrumentsInfo(extend(request, params)));
    else
        response = Base.fetch(self.publicGetV5MarketInstrumentsInfo(extend(request, params)));
    end
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    markets = self.safeList(data, "list", defaultValue = []);
    loadAllOptions = self.handleOption("fetchMarkets", "loadAllOptions");
    if functions.ccxtruthy(loadAllOptions)
        request[Symbol("limit")] = 1000;
        paginationCursor = safeString(data, "nextPageCursor");
        if functions.ccxtruthy(paginationCursor != nothing)
            while functions.ccxtruthy(paginationCursor != nothing)
                request[Symbol("cursor")] = paginationCursor;
                
                if functions.ccxtruthy(usePrivateInstrumentsInfo)
                    responseInner = Base.fetch(self.privateGetV5MarketInstrumentsInfo(extend(request, params)));
                else
                    responseInner = Base.fetch(self.publicGetV5MarketInstrumentsInfo(extend(request, params)));
                end
                dataNew = self.safeDict(responseInner, "result", defaultValue = Dict{Symbol, Any}());
                rawMarkets = self.safeList(dataNew, "list", defaultValue = []);
                rawMarketsLength = length(rawMarkets);
                if functions.ccxtruthy(rawMarketsLength == 0)
                    break
                end
                markets = arrayConcat(rawMarkets, markets);
                paginationCursor = safeString(dataNew, "nextPageCursor");
            end

        end
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        id = safeString(market, "symbol");
        baseId = safeString(market, "baseCoin");
        quoteId = safeString(market, "quoteCoin");
        settleId = safeString(market, "settleCoin");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        lotSizeFilter = self.safeDict(market, "lotSizeFilter", defaultValue = Dict{Symbol, Any}());
        priceFilter = self.safeDict(market, "priceFilter", defaultValue = Dict{Symbol, Any}());
        status = safeString(market, "status");
        expiry = safeInteger(market, "deliveryTime");
        if functions.ccxtruthy(id == nothing)
            throw(ExchangeError(string(self.id, " method() missing id")));
        end
        splitId = split(id, "-");
        strike = safeString(splitId, 2);
        optionLetter = safeString(splitId, 3);
        isActive = (status == "Trading");
        isInverse = base == settle;
        loadExpiredOptions = self.handleOption("fetchMarkets", "loadExpiredOptions");
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isActive, loadAllOptions), loadExpiredOptions))
                        push!(result, self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => string(base, "/", quote_var, ":", settle, "-", self.yymmdd(expiry), "-", strike, "-", optionLetter),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => "option",
    Symbol("subType") => nothing,
    Symbol("spot") => false,
    Symbol("margin") => false,
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => true,
    Symbol("active") => isActive,
    Symbol("contract") => true,
    Symbol("linear") => !functions.ccxtruthy(isInverse),
    Symbol("inverse") => isInverse,
    Symbol("taker") => self.safeNumber(market, "takerFee", defaultNumber = self.parseNumber("0.0006")),
    Symbol("maker") => self.safeNumber(market, "makerFee", defaultNumber = self.parseNumber("0.0001")),
    Symbol("contractSize") => self.parseNumber("1"),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => self.parseNumber(strike),
    Symbol("optionType") => safeStringLower(market, "optionsType"),
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(lotSizeFilter, "qtyStep"),
        Symbol("price") => self.safeNumber(priceFilter, "tickSize")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(lotSizeFilter, "minOrderQty"),
            Symbol("max") => self.safeNumber(lotSizeFilter, "maxOrderQty")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(priceFilter, "minPrice"),
            Symbol("max") => self.safeNumber(priceFilter, "maxPrice")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => safeInteger(market, "launchTime"),
    Symbol("info") => market
)));
        end
        i += 1
    end
    return result

end
function parseTicker(self::Bybit, ticker; market=nothing)
    isSpot = safeString(ticker, "openInterestValue") == nothing;
    timestamp = safeInteger(ticker, "time");
    marketId = safeString(ticker, "symbol");
    type_var = functions.ccxtruthy(isSpot) ? "spot" : "contract";
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = type_var);
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = type_var);
    last_var = safeString(ticker, "lastPrice");
    open = safeString(ticker, "prevPrice24h");
    percentage = safeString(ticker, "price24hPcnt");
    percentage = stringMul(percentage, "100");
    quoteVolume = safeString(ticker, "turnover24h");
    baseVolume = safeString(ticker, "volume24h");
    bid = safeString(ticker, "bid1Price");
    ask = safeString(ticker, "ask1Price");
    high = safeString(ticker, "highPrice24h");
    low = safeString(ticker, "lowPrice24h");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => high,
    Symbol("low") => low,
    Symbol("bid") => bid,
    Symbol("bidVolume") => safeString2(ticker, "bidSize", "bid1Size"),
    Symbol("ask") => ask,
    Symbol("askVolume") => safeString2(ticker, "askSize", "ask1Size"),
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
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
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Bybit, symbol; params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTicker() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    category = nothing;
    (category, params) = self.getBybitType("fetchTicker", market, params = params);
    request[Symbol("category")] = category;
    response = Base.fetch(self.publicGetV5MarketTickers(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    tickers = self.safeList(result, "list", defaultValue = []);
    rawTicker = self.safeDict(tickers, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(rawTicker, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `symbols`::array: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: *contract only* 'linear', 'inverse'
- `params.baseCoin`::string, optional: *option only* base coin, default is 'BTC'

# Returns
- an array of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Bybit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    code = safeStringN(params, ["code", "currency", "baseCoin"]);
    market = nothing;
    parsedSymbols = nothing;
    if functions.ccxtruthy(symbols != nothing)
        parsedSymbols = [];
        marketTypeInfo = self.handleMarketTypeAndParams("fetchTickers", market = nothing, params = params);
        defaultType = get(marketTypeInfo, 1, nothing);
        currentType = nothing;
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            symbol = get(symbols, i + 1, nothing);
            isExchangeSpecificSymbol = (findfirst("/", symbol) === nothing);
            if functions.ccxtruthy(isExchangeSpecificSymbol)
                market = self.safeMarket(marketId = symbol, market = nothing, delimiter = nothing, marketType = defaultType);
            else
                market = self.market(symbol);
            end
            if functions.ccxtruthy(currentType == nothing)
                currentType = get(market, Symbol("type"), nothing);
            elseif functions.ccxtruthy(get(market, Symbol("type"), nothing) != currentType)
                throw(BadRequest(string(self.id, " fetchTickers can only accept a list of symbols of the same type")));
            end
            if functions.ccxtruthy(get(market, Symbol("option"), nothing))
                if functions.ccxtruthy(@functions.ccxt_and(code != nothing, code != get(market, Symbol("base"), nothing)))
                    throw(BadRequest(string(self.id, " fetchTickers the base currency must be the same for all symbols, this endpoint only supports one base currency at a time. Read more about it here: https://bybit-exchange.github.io/docs/v5/market/tickers")));
                end
                if functions.ccxtruthy(code == nothing)
                    code = get(market, Symbol("base"), nothing);
                end
                params = omit(params, ["code", "currency"]);
            end
            push!(parsedSymbols, get(market, Symbol("symbol"), nothing));
            i += 1
        end

    end
    request = Dict{Symbol, Any}();
    category = nothing;
    (category, params) = self.getBybitType("fetchTickers", market, params = params);
    request[Symbol("category")] = category;
    if functions.ccxtruthy(category == "option")
        request[Symbol("category")] = "option";
        if functions.ccxtruthy(code == nothing)
            code = "BTC";
        end
        request[Symbol("baseCoin")] = code;
    end
    response = Base.fetch(self.publicGetV5MarketTickers(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    tickerList = self.safeList(result, "list", defaultValue = []);
    return self.parseTickers(tickerList, symbols = parsedSymbols)

end
"""
fetches the bid and ask price and volume for multiple markets
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: *contract only* 'linear', 'inverse'
- `params.baseCoin`::string, optional: *option only* base coin, default is 'BTC'

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchBidsAsks(self::Bybit; symbols=nothing, params=Dict())
    return Base.fetch(self.fetchTickers(symbols = symbols, params = params))

end
function parseOHLCV(self::Bybit, ohlcv; market=nothing)
    isInverse = self.safeBool(market, "inverse");
    volumeIndex = functions.ccxtruthy((isInverse)) ? 6 : 5;
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, volumeIndex)]

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://bybit-exchange.github.io/docs/v5/market/kline
see: https://bybit-exchange.github.io/docs/v5/market/mark-kline
see: https://bybit-exchange.github.io/docs/v5/market/index-kline
see: https://bybit-exchange.github.io/docs/v5/market/preimum-index-kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Bybit, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOHLCV() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 1000))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit == nothing)
        limit = 200;
    end
    if functions.ccxtruthy(since != nothing)
        duration = self.parseTimeframe(timeframe) * 1000;
        rounded = self.parseToInt(since / duration) * duration;
        request[Symbol("start")] = functions.ccxtruthy((rounded == since)) ? since : self.sum(rounded, duration);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    request[Symbol("interval")] = safeString(self.timeframes, timeframe, timeframe);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("category")] = "spot";
        response = Base.fetch(self.publicGetV5MarketKline(extend(request, params)));
    else
        price = safeString(params, "price");
        params = omit(params, "price");
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            request[Symbol("category")] = "linear";
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            request[Symbol("category")] = "inverse";
        else
            throw(NotSupported(string(self.id, " fetchOHLCV() is not supported for option markets")));
        end
        if functions.ccxtruthy(price == "mark")
            response = Base.fetch(self.publicGetV5MarketMarkPriceKline(extend(request, params)));
        elseif functions.ccxtruthy(price == "index")
            response = Base.fetch(self.publicGetV5MarketIndexPriceKline(extend(request, params)));
        else
            if functions.ccxtruthy(price == "premiumIndex")
                response = Base.fetch(self.publicGetV5MarketPremiumIndexPriceKline(extend(request, params)));
            else
                response = Base.fetch(self.publicGetV5MarketKline(extend(request, params)));
            end

        end
    end
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    ohlcvs = self.safeList(result, "list", defaultValue = []);
    return self.parseOHLCVs(ohlcvs, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseFundingRate(self::Bybit, ticker; market=nothing)
    timestamp = safeInteger(ticker, "timestamp");
    ticker = omit(ticker, "timestamp");
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "swap");
    fundingRate = self.safeNumber(ticker, "fundingRate");
    fundingTimestamp = safeInteger(ticker, "nextFundingTime");
    markPrice = self.safeNumber(ticker, "markPrice");
    indexPrice = self.safeNumber(ticker, "indexPrice");
    info = self.safeDict(self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "swap"), "info");
    fundingInterval = safeInteger(info, "fundingInterval");
    intervalString = nothing;
    if functions.ccxtruthy(fundingInterval != nothing)
        interval = self.parseToInt(fundingInterval / 60);
        intervalString = string(interval, "h");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => ticker,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => markPrice,
    Symbol("indexPrice") => indexPrice,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fundingRate") => fundingRate,
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
fetches funding rates for multiple markets
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `symbols`::array: unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRates(self::Bybit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols = symbols);
        market = self.market(get(symbols, 1, nothing));
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 1)
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchFundingRates", market = market, params = params);
    if functions.ccxtruthy(type_var != "swap")
        throw(NotSupported(string(self.id, " fetchFundingRates() does not support ", type_var, " markets")));
    else
        subType = nothing;
        (subType, params) = self.handleSubTypeAndParams("fetchFundingRates", market = market, params = params, defaultValue = "linear");
        request[Symbol("category")] = subType;
    end
    response = Base.fetch(self.publicGetV5MarketTickers(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    tickerList = self.safeList(data, "list", defaultValue = []);
    timestamp = safeInteger(response, "time");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickerList)))
        tickerList[i + 1][Symbol("timestamp")] = timestamp;
        i += 1
    end
    return self.parseFundingRates(tickerList, symbols = symbols)

end
"""
fetches historical funding rate prices
see: https://bybit-exchange.github.io/docs/v5/market/history-fund-rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = 200))
    end
    if functions.ccxtruthy(limit == nothing)
        limit = 200;
    end
    request = Dict{Symbol, Any}(
        Symbol("limit") => limit
    );
    market = self.market(symbol);
    fundingTimeFrameMins = safeInteger(get(market, Symbol("info"), nothing), "fundingInterval");
    symbol = get(market, Symbol("symbol"), nothing);
    request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchFundingRateHistory", market, params = params);
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "spot", type_var == "option"))
        throw(NotSupported(string(self.id, " fetchFundingRateHistory() only support linear and inverse market")));
    end
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    endTime = safeInteger(params, "endTime", until);
    params = omit(params, ["endTime", "until"]);
    if functions.ccxtruthy(endTime != nothing)
        request[Symbol("endTime")] = endTime;
    else
        if functions.ccxtruthy(since != nothing)
            fundingInterval = 60 * 60 * 8 * 1000;
            if functions.ccxtruthy(fundingTimeFrameMins != nothing)
                fundingInterval = fundingTimeFrameMins * 60 * 1000;
            end
            request[Symbol("endTime")] = self.sum(since, limit * fundingInterval);
        end
    end
    response = Base.fetch(self.publicGetV5MarketFundingHistory(extend(request, params)));
    rates = [];
    result = self.safeDict(response, "result");
    resultList = self.safeList(result, "list", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(resultList)))
        entry = get(resultList, i + 1, nothing);
        timestamp = safeInteger(entry, "fundingRateTimestamp");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => self.safeSymbol(safeString(entry, "symbol"), market = nothing, delimiter = nothing, marketType = "swap"),
    Symbol("fundingRate") => self.safeNumber(entry, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function parseTrade(self::Bybit, trade; market=nothing)
    id = safeStringN(trade, ["execId", "id", "tradeId"]);
    marketId = safeString(trade, "symbol");
    marketType = functions.ccxtruthy((ccxt_in("createType", trade))) ? "contract" : "spot";
    category = safeString(trade, "category");
    if functions.ccxtruthy(category != nothing)
        marketType = functions.ccxtruthy((category == "spot")) ? "spot" : "contract";
    end
    if functions.ccxtruthy(market != nothing)
        marketType = get(market, Symbol("type"), nothing);
    end
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = marketType);
    symbol = get(market, Symbol("symbol"), nothing);
    amountString = safeStringN(trade, ["execQty", "orderQty", "size"]);
    priceString = safeStringN(trade, ["execPrice", "orderPrice", "price"]);
    costString = safeString(trade, "execValue");
    timestamp = safeIntegerN(trade, ["time", "execTime", "tradeTime"]);
    side = safeStringLower(trade, "side");
    if functions.ccxtruthy(side == nothing)
        isBuyer = safeInteger(trade, "isBuyer");
        if functions.ccxtruthy(isBuyer != nothing)
            side = functions.ccxtruthy(isBuyer) ? "buy" : "sell";
        end
    end
    isMaker = self.safeBool(trade, "isMaker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(isMaker != nothing)
        takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    else
        lastLiquidityInd = safeString(trade, "lastLiquidityInd");
        if functions.ccxtruthy(lastLiquidityInd == "UNKNOWN")
            lastLiquidityInd = nothing;
        end
        if functions.ccxtruthy(lastLiquidityInd != nothing)
            if functions.ccxtruthy(@functions.ccxt_or((lastLiquidityInd == "TAKER"), (lastLiquidityInd == "MAKER")))
                takerOrMaker = lowercase(lastLiquidityInd);
            else
                takerOrMaker = functions.ccxtruthy((lastLiquidityInd == "AddedLiquidity")) ? "maker" : "taker";
            end
        end
    end
    orderType = safeStringLower(trade, "orderType");
    if functions.ccxtruthy(orderType == "unknown")
        orderType = nothing;
    end
    feeCostString = safeString(trade, "execFee");
    fee = nothing;
    if functions.ccxtruthy(feeCostString != nothing)
        feeRateString = safeString(trade, "feeRate");
        feeCurrencyCode = nothing;
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            if functions.ccxtruthy(stringGt(feeCostString, "0"))
                if functions.ccxtruthy(side == "buy")
                    feeCurrencyCode = get(market, Symbol("base"), nothing);
                else
                    feeCurrencyCode = get(market, Symbol("quote"), nothing);
                end
            else
                if functions.ccxtruthy(side == "buy")
                    feeCurrencyCode = get(market, Symbol("quote"), nothing);
                else
                    feeCurrencyCode = get(market, Symbol("base"), nothing);
                end
            end
        else
            feeCurrencyCode = functions.ccxtruthy(get(market, Symbol("inverse"), nothing)) ? get(market, Symbol("base"), nothing) : get(market, Symbol("settle"), nothing);
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => safeString(trade, "feeCoin", feeCurrencyCode),
            Symbol("rate") => feeRateString
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("order") => safeString(trade, "orderId"),
    Symbol("type") => orderType,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://bybit-exchange.github.io/docs/v5/market/recent-trade

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Bybit, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTrades() requires a symbol argument")));
    end
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
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchTrades", market, params = params);
    request[Symbol("category")] = type_var;
    response = Base.fetch(self.publicGetV5MarketRecentTrade(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    trades = self.safeList(result, "list", defaultValue = []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://bybit-exchange.github.io/docs/v5/market/orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Bybit, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrderBook() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    defaultLimit = 25;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        defaultLimit = 50;
        request[Symbol("category")] = "spot";
    else
        if functions.ccxtruthy(get(market, Symbol("option"), nothing))
            request[Symbol("category")] = "option";
        elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            request[Symbol("category")] = "linear";
        else
            if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
                request[Symbol("category")] = "inverse";
            end

        end
    end
    request[Symbol("limit")] = functions.ccxtruthy((limit != nothing)) ? limit : defaultLimit;
    response = Base.fetch(self.publicGetV5MarketOrderbook(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(result, "ts");
    return self.parseOrderBook(result, symbol, timestamp = timestamp, bidsKey = "b", asksKey = "a")

end
function parseBalance(self::Bybit, response)
    timestamp = safeInteger(response, "time");
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    responseResult = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    currencyList = self.safeListN(responseResult, ["loanAccountList", "list", "balance"]);
    if functions.ccxtruthy(currencyList == nothing)
        code = "USDC";
        account = self.account();
        account[Symbol("free")] = safeString(responseResult, "availableBalance");
        account[Symbol("total")] = safeString(responseResult, "walletBalance");
        result[Symbol(code)] = account;
    else
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(currencyList)))
            entry = get(currencyList, i + 1, nothing);
            accountType = safeString(entry, "accountType");
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(accountType == "UNIFIED", accountType == "CONTRACT"), accountType == "SPOT"))
                coins = self.safeList(entry, "coin", defaultValue = []);
                j = 0
                while functions.ccxtruthy(functions.ccxt_lt(j, length(coins)))
                    account = self.account();
                    coinEntry = get(coins, j + 1, nothing);
                    loan = safeString(coinEntry, "borrowAmount");
                    interest = safeString(coinEntry, "accruedInterest");
                    if functions.ccxtruthy(@functions.ccxt_and((loan != nothing), (interest != nothing)))
                        account[Symbol("debt")] = stringAdd(loan, interest);
                    end
                    account[Symbol("total")] = safeString(coinEntry, "walletBalance");
                    free = safeString2(coinEntry, "availableToWithdraw", "free");
                    if functions.ccxtruthy(free != nothing)
                        account[Symbol("free")] = free;
                    else
                        locked = safeString(coinEntry, "locked", "0");
                        totalPositionIm = safeString(coinEntry, "totalPositionIM", "0");
                        totalOrderIm = safeString(coinEntry, "totalOrderIM", "0");
                        totalUsed = stringAdd(locked, totalPositionIm);
                        totalUsed = stringAdd(totalUsed, totalOrderIm);
                        account[Symbol("used")] = totalUsed;
                    end
                    currencyId = safeString(coinEntry, "coin");
                    code = self.safeCurrencyCode(currencyId);
                    if functions.ccxtruthy(code != nothing)
                        result[Symbol(code)] = account;
                    end
                    j += 1
                end

            else
                account = self.account();
                loan = safeString(entry, "loan");
                interest = safeString(entry, "interest");
                if functions.ccxtruthy(@functions.ccxt_and((loan != nothing), (interest != nothing)))
                    account[Symbol("debt")] = stringAdd(loan, interest);
                end
                account[Symbol("total")] = safeString2(entry, "total", "walletBalance");
                account[Symbol("free")] = safeStringN(entry, ["free", "availableBalanceWithoutConvert", "availableBalance", "transferBalance"]);
                account[Symbol("used")] = safeString(entry, "locked");
                currencyId = safeStringN(entry, ["tokenId", "coin", "currencyCoin"]);
                code = self.safeCurrencyCode(currencyId);
                if functions.ccxtruthy(code != nothing)
                    result[Symbol(code)] = account;
                end
            end
            i += 1
        end
    end
    return self.safeBalance(result)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://bybit-exchange.github.io/docs/v5/spot-margin-normal/account-info
see: https://bybit-exchange.github.io/docs/v5/asset/all-balance
see: https://bybit-exchange.github.io/docs/v5/account/wallet-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: wallet type, ['spot', 'swap', 'funding']

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Bybit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    (enableUnifiedMargin, enableUnifiedAccount) = (Base.fetch(self.isUnifiedEnabled()));
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchBalance", market = nothing, params = params);
    if functions.ccxtruthy(@functions.ccxt_or((type_var == "swap"), (type_var == "future")))
        type_var = subType;
    end
    lowercaseRawType = functions.ccxtruthy((type_var != nothing)) ? lowercase(type_var) : nothing;
    isSpot = (type_var == "spot");
    isLinear = (type_var == "linear");
    isInverse = (type_var == "inverse");
    isFunding = @functions.ccxt_or((lowercaseRawType == "fund"), (lowercaseRawType == "funding"));
    if functions.ccxtruthy(isUnifiedAccount)
        unifiedMarginStatus = safeInteger(self.options, "unifiedMarginStatus", 6);
        if functions.ccxtruthy(functions.ccxt_lt(unifiedMarginStatus, 5))
            if functions.ccxtruthy(isInverse)
                type_var = "contract";
            else
                type_var = "unified";
            end
        else
            type_var = "unified";
        end
    else
        if functions.ccxtruthy(@functions.ccxt_or(isLinear, isInverse))
            type_var = "contract";
        end
    end
    accountTypes = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    unifiedType = safeStringUpper(accountTypes, type_var, type_var);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBalance", params = params);
    if functions.ccxtruthy(@functions.ccxt_and(isSpot, (marginMode != nothing)))
        response = Base.fetch(self.privateGetV5SpotCrossMarginTradeAccount(extend(request, params)));
    elseif functions.ccxtruthy(isFunding)
        request[Symbol("accountType")] = "FUND";
        response = Base.fetch(self.privateGetV5AssetTransferQueryAccountCoinsBalance(extend(request, params)));
    else
        request[Symbol("accountType")] = unifiedType;
        response = Base.fetch(self.privateGetV5AccountWalletBalance(extend(request, params)));
    end
    return self.parseBalance(response)

end
function parseOrderStatus(self::Bybit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("PENDING_CANCEL") => "open",
        Symbol("PENDING_NEW") => "open",
        Symbol("REJECTED") => "rejected",
        Symbol("PARTIALLY_FILLED_CANCELLED") => "closed",
        Symbol("Created") => "open",
        Symbol("New") => "open",
        Symbol("Rejected") => "rejected",
        Symbol("PartiallyFilled") => "open",
        Symbol("PartiallyFilledCanceled") => "closed",
        Symbol("Filled") => "closed",
        Symbol("PendingCancel") => "open",
        Symbol("Cancelled") => "canceled",
        Symbol("Untriggered") => "open",
        Symbol("Deactivated") => "canceled",
        Symbol("Triggered") => "open",
        Symbol("Active") => "open"
    );
    return safeString(statuses, status, status)

end
function parseTimeInForce(self::Bybit, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("GoodTillCancel") => "GTC",
        Symbol("ImmediateOrCancel") => "IOC",
        Symbol("FillOrKill") => "FOK",
        Symbol("PostOnly") => "PO"
    );
    return safeString(timeInForces, timeInForce, timeInForce)

end
function parseOrder(self::Bybit, order; market=nothing)
    code = safeString(order, "code");
    if functions.ccxtruthy(code != nothing)
        if functions.ccxtruthy(code != "0")
            category = safeString(order, "category");
            inferredMarketType = functions.ccxtruthy((category == "spot")) ? "spot" : "contract";
                return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("status") => "rejected",
    Symbol("id") => safeString(order, "orderId"),
    Symbol("clientOrderId") => safeString(order, "orderLinkId"),
    Symbol("symbol") => self.safeSymbol(safeString(order, "symbol"), market = nothing, delimiter = nothing, marketType = inferredMarketType)
))
        end
    end
    marketId = safeString(order, "symbol");
    isContract = (ccxt_in("tpslMode", order));
    marketType = nothing;
    if functions.ccxtruthy(market != nothing)
        marketType = get(market, Symbol("type"), nothing);
    else
        marketType = functions.ccxtruthy(isContract) ? "contract" : "spot";
    end
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = marketType);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger2(order, "createdTime", "createdAt");
    marketUnit = safeString(order, "marketUnit");
    id = safeString(order, "orderId");
    type_var = safeStringLower(order, "orderType");
    price = safeString(order, "price");
    side = safeStringLower(order, "side");
    amount = nothing;
    cost = nothing;
    qtyIsQuote = @functions.ccxt_and(@functions.ccxt_and(get(market, Symbol("spot"), nothing), (type_var == "market")), (@functions.ccxt_or((marketUnit == "quoteCoin"), (@functions.ccxt_and((marketUnit == nothing), (side == "buy"))))));
    if functions.ccxtruthy(qtyIsQuote)
        cost = safeString(order, "cumExecValue");
    else
        amount = safeString(order, "qty");
        cost = safeString(order, "cumExecValue");
    end
    filled = safeString(order, "cumExecQty");
    remaining = safeString(order, "leavesQty");
    lastTradeTimestamp = safeInteger2(order, "updatedTime", "updatedAt");
    rawStatus = safeString(order, "orderStatus");
    status = self.parseOrderStatus(rawStatus);
    fee = nothing;
    cumFeeDetail = self.safeDict(order, "cumFeeDetail", defaultValue = Dict{Symbol, Any}());
    feeCoins = objectKeys(cumFeeDetail);
    feeCoinId = safeString(feeCoins, 0);
    if functions.ccxtruthy(feeCoinId != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.safeNumber(cumFeeDetail, feeCoinId),
            Symbol("currency") => feeCoinId
        );
    end
    clientOrderId = safeString(order, "orderLinkId");
    if functions.ccxtruthy(@functions.ccxt_and((clientOrderId != nothing), (functions.ccxt_lt(length(clientOrderId), 1))))
        clientOrderId = nothing;
    end
    avgPrice = omitZero(safeString(order, "avgPrice"));
    rawTimeInForce = safeString(order, "timeInForce");
    timeInForce = self.parseTimeInForce(rawTimeInForce);
    triggerPrice = omitZero(safeString(order, "triggerPrice"));
    reduceOnly = self.safeBool(order, "reduceOnly");
    takeProfitPrice = omitZero(safeString(order, "takeProfit"));
    stopLossPrice = omitZero(safeString(order, "stopLoss"));
    triggerDirection = safeString(order, "triggerDirection");
    isAscending = (triggerDirection == "1");
    isStopOrderType2 = @functions.ccxt_and((triggerPrice != nothing), reduceOnly);
    if functions.ccxtruthy(@functions.ccxt_and((stopLossPrice == nothing), isStopOrderType2))
        if functions.ccxtruthy(@functions.ccxt_and(isAscending, (side == "buy")))
            stopLossPrice = triggerPrice;
        end
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isAscending), (side == "sell")))
            stopLossPrice = triggerPrice;
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and((takeProfitPrice == nothing), isStopOrderType2))
        if functions.ccxtruthy(@functions.ccxt_and(isAscending, (side == "sell")))
            takeProfitPrice = triggerPrice;
        end
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isAscending), (side == "buy")))
            takeProfitPrice = triggerPrice;
        end
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastTradeTimestamp,
    Symbol("lastUpdateTimestamp") => lastTradeTimestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => nothing,
    Symbol("reduceOnly") => self.safeBool(order, "reduceOnly"),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("amount") => amount,
    Symbol("cost") => cost,
    Symbol("average") => avgPrice,
    Symbol("filled") => filled,
    Symbol("remaining") => remaining,
    Symbol("status") => status,
    Symbol("fee") => fee,
    Symbol("trades") => nothing
), market = market)

end
"""
create a market buy order by providing the symbol and cost
see: https://bybit-exchange.github.io/docs/v5/order/create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Bybit, symbol, cost; params=Dict())
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
    return Base.fetch(self.createOrder(symbol, "market", "buy", -1, price = nothing, params = extend(req, params)))

end
"""
create a market sell order by providing the symbol and cost
see: https://bybit-exchange.github.io/docs/v5/order/create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketSellOrderWithCost(self::Bybit, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    types = Base.fetch(self.isUnifiedEnabled());
    enableUnifiedAccount = get(types, 2, nothing);
    if functions.ccxtruthy(!functions.ccxtruthy(enableUnifiedAccount))
        throw(NotSupported(string(self.id, " createMarketSellOrderWithCost() supports UTA accounts only")));
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketSellOrderWithCost() supports spot orders only")));
    end
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return Base.fetch(self.createOrder(symbol, "market", "sell", -1, price = nothing, params = extend(req, params)))

end
"""
create a trade order
see: https://bybit-exchange.github.io/docs/v5/order/create-order
see: https://bybit-exchange.github.io/docs/v5/position/trading-stop

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: "GTC", "IOC", "FOK"
- `params.postOnly`::bool, optional: true or false whether the order is post-only
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce-only
- `params.positionIdx`::string, optional: *contracts only* 0 for one-way mode, 1 buy side of hedged mode, 2 sell side of hedged mode
- `params.hedged`::bool, optional: *contracts only* true for hedged mode, false for one way mode, default is false
- `params.isLeverage`::int, optional: *unified spot only* false then spot trading true then margin trading
- `params.tpslMode`::string, optional: *contract only* 'Full' or 'Partial'
- `params.mmp`::string, optional: *option only* market maker protection
- `params.triggerDirection`::string, optional: *contract only* the direction for trigger orders, 'ascending' or 'descending'
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.stopLossPrice`::float, optional: The price at which a stop loss order is triggered at
- `params.stopLossLimitPrice`::float, optional: The limit price for a stoploss order (only when used in OCO with takeProfitPrice)
- `params.takeProfitPrice`::float, optional: The price at which a take profit order is triggered at
- `params.takeProfitLimitPrice`::float, optional: The limit price for a takeprofit order (only when used in OCO combination with stopLossPrice)
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price
- `params.trailingAmount`::string, optional: the quote amount to trail away from the current market price
- `params.trailingTriggerPrice`::string, optional: the price to trigger a trailing order, default uses the price argument
- `params.tradingStopEndpoint`::bool, optional: whether to enforce using the tradingStop (https://bybit-exchange.github.io/docs/v5/position/trading-stop) endpoint, makes difference when submitting single tp/sl order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Bybit, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    parts = Base.fetch(self.isUnifiedEnabled());
    enableUnifiedAccount = get(parts, 2, nothing);
    isTrailingOrder = safeString2(params, "trailingAmount", "trailingStop") != nothing;
    isStopLossOrder = safeString(params, "stopLossPrice") != nothing;
    isTakeProfitOrder = safeString(params, "takeProfitPrice") != nothing;
    orderRequest = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = params, isUTA = enableUnifiedAccount);
    switchToOco = @functions.ccxt_or((@functions.ccxt_and(isStopLossOrder, isTakeProfitOrder)), self.safeBool(params, "tradingStopEndpoint", defaultValue = false));
    defaultMethod = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(isTrailingOrder, switchToOco)), !functions.ccxtruthy(get(market, Symbol("spot"), nothing))))
        defaultMethod = "privatePostV5PositionTradingStop";
    else
        defaultMethod = "privatePostV5OrderCreate";
    end
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "createOrder", "method", defaultValue = defaultMethod);
    if functions.ccxtruthy(method == "privatePostV5PositionTradingStop")
        response = Base.fetch(self.privatePostV5PositionTradingStop(orderRequest));
    else
        response = Base.fetch(self.privatePostV5OrderCreate(orderRequest));
    end
    order = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(order, market = market)

end
function createOrderRequest(self::Bybit, symbol, type_var, side, amount; price=nothing, params=Dict(), isUTA=true)
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    symbol = get(market, Symbol("symbol"), nothing);
    lowerCaseType = lowercase(type_var);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    hedged = self.safeBool(params, "hedged", defaultValue = false);
    reduceOnly = self.safeBool(params, "reduceOnly");
    triggerPrice = safeValue2(params, "triggerPrice", "stopPrice");
    stopLossTriggerPrice = safeValue(params, "stopLossPrice");
    takeProfitTriggerPrice = safeValue(params, "takeProfitPrice");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    trailingTriggerPrice = safeString2(params, "trailingTriggerPrice", "activePrice", numberToString(price));
    trailingAmount = safeString2(params, "trailingAmount", "trailingStop");
    isTrailingOrder = trailingAmount != nothing;
    isTriggerOrder = triggerPrice != nothing;
    isStopLossOrder = stopLossTriggerPrice != nothing;
    isTakeProfitOrder = takeProfitTriggerPrice != nothing;
    hasStopLoss = stopLoss != nothing;
    hasTakeProfit = takeProfit != nothing;
    isMarket = lowerCaseType == "market";
    isLimit = lowerCaseType == "limit";
    isBuy = side == "buy";
    switchToOco = @functions.ccxt_or((@functions.ccxt_and(isStopLossOrder, isTakeProfitOrder)), self.safeBool(params, "tradingStopEndpoint", defaultValue = false));
    defaultMethod = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(isTrailingOrder, switchToOco))
        defaultMethod = "privatePostV5PositionTradingStop";
    else
        defaultMethod = "privatePostV5OrderCreate";
    end
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "createOrder", "method", defaultValue = defaultMethod);
    endpointIsTradingStop = method == "privatePostV5PositionTradingStop";
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((price == nothing), (lowerCaseType == "limit")), !functions.ccxtruthy(endpointIsTradingStop)))
        throw(ArgumentsRequired(string(self.id, " createOrder requires a price argument for limit orders")));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(stringGt(numberToString(amount), "0")))
        amount = nothing;
    end
    amountString = functions.ccxtruthy((amount != nothing)) ? self.getAmount(symbol, amount) : nothing;
    priceString = functions.ccxtruthy((price != nothing)) ? self.getPrice(symbol, numberToString(price)) : nothing;
    if functions.ccxtruthy(endpointIsTradingStop)
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(hasStopLoss, hasTakeProfit), isTriggerOrder), get(market, Symbol("spot"), nothing)))
            throw(InvalidOrder(string(self.id, " the API endpoint used only supports contract trailingAmount, stopLossPrice and takeProfitPrice orders")));
        end
        if functions.ccxtruthy(@functions.ccxt_or(isStopLossOrder, isTakeProfitOrder))
            tpslModeSl = nothing;
            tpslModeTp = nothing;
            if functions.ccxtruthy(isStopLossOrder)
                request[Symbol("stopLoss")] = self.getPrice(symbol, stopLossTriggerPrice);
                stopLossLimitPrice = safeString2(params, "stopLossLimitPrice", "slLimitPrice");
                if functions.ccxtruthy(stopLossLimitPrice != nothing)
                    tpslModeSl = "Partial";
                    request[Symbol("slOrderType")] = "Limit";
                    request[Symbol("slLimitPrice")] = stopLossLimitPrice;
                    request[Symbol("slSize")] = amountString;
                else
                    request[Symbol("slOrderType")] = "Market";
                    if functions.ccxtruthy(amountString != nothing)
                        request[Symbol("slSize")] = amountString;
                        tpslModeSl = "Partial";
                    else
                        tpslModeSl = "Full";
                    end
                end
            end
            if functions.ccxtruthy(isTakeProfitOrder)
                request[Symbol("takeProfit")] = self.getPrice(symbol, takeProfitTriggerPrice);
                takeProfitLimitPrice = safeString2(params, "takeProfitLimitPrice", "tpLimitPrice");
                if functions.ccxtruthy(takeProfitLimitPrice != nothing)
                    tpslModeTp = "Partial";
                    request[Symbol("tpOrderType")] = "Limit";
                    request[Symbol("tpLimitPrice")] = takeProfitLimitPrice;
                    request[Symbol("tpSize")] = amountString;
                else
                    request[Symbol("tpOrderType")] = "Market";
                    if functions.ccxtruthy(amountString != nothing)
                        request[Symbol("tpSize")] = amountString;
                        tpslModeTp = "Partial";
                    else
                        tpslModeTp = "Full";
                    end
                end
            end
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(isTakeProfitOrder, isStopLossOrder), tpslModeSl != tpslModeTp))
                throw(InvalidOrder(string(self.id, " createOrder() requires both stopLoss and takeProfit to be full or partial when using as OCO combination")));
            end
            if functions.ccxtruthy(tpslModeSl != nothing)
                request[Symbol("tpslMode")] = tpslModeSl;
            else
                request[Symbol("tpslMode")] = tpslModeTp;
            end
            params = omit(params, ["stopLossLimitPrice", "takeProfitLimitPrice", "tradingStopEndpoint"]);
        end
    else
        request[Symbol("side")] = capitalize(side);
        request[Symbol("orderType")] = capitalize(lowerCaseType);
        timeInForce = safeStringLower(params, "timeInForce");
        postOnly = nothing;
        (postOnly, params) = self.handlePostOnly(isMarket, timeInForce == "postonly", params = params);
        if functions.ccxtruthy(postOnly)
            request[Symbol("timeInForce")] = "PostOnly";
        elseif functions.ccxtruthy(timeInForce == "gtc")
            request[Symbol("timeInForce")] = "GTC";
        else
            if functions.ccxtruthy(timeInForce == "fok")
                request[Symbol("timeInForce")] = "FOK";
            elseif functions.ccxtruthy(timeInForce == "ioc")
                request[Symbol("timeInForce")] = "IOC";
            end

        end
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            if functions.ccxtruthy(triggerPrice != nothing)
                request[Symbol("orderFilter")] = "StopOrder";
            elseif functions.ccxtruthy(@functions.ccxt_or(isStopLossOrder, isTakeProfitOrder))
                request[Symbol("orderFilter")] = "tpslOrder";
            end
        end
        clientOrderId = safeString(params, "clientOrderId");
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("orderLinkId")] = clientOrderId;
        elseif functions.ccxtruthy(get(market, Symbol("option"), nothing))
            request[Symbol("orderLinkId")] = uuid16();
        end
        if functions.ccxtruthy(isLimit)
            request[Symbol("price")] = priceString;
        end
    end
    category = nothing;
    (category, params) = self.getBybitType("createOrderRequest", market, params = params);
    request[Symbol("category")] = category;
    cost = safeString(params, "cost");
    params = omit(params, "cost");
    isMarketBuyAndCostInferable = @functions.ccxt_and(@functions.ccxt_and((lowerCaseType == "market"), (side == "buy")), (@functions.ccxt_or((price != nothing), (cost != nothing))));
    isMarketOrder = lowerCaseType == "market";
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(get(market, Symbol("spot"), nothing), isMarketOrder), isUTA), !functions.ccxtruthy(isMarketBuyAndCostInferable)))
        if functions.ccxtruthy(@functions.ccxt_or((cost != nothing), (price != nothing)))
            request[Symbol("marketUnit")] = "quoteCoin";
            orderCost = nothing;
            if functions.ccxtruthy(cost != nothing)
                orderCost = cost;
            else
                quoteAmount = stringMul(amountString, priceString);
                orderCost = quoteAmount;
            end
            request[Symbol("qty")] = self.getCost(symbol, orderCost);
        else
            request[Symbol("marketUnit")] = "baseCoin";
            request[Symbol("qty")] = amountString;
        end
    elseif functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(get(market, Symbol("spot"), nothing), isMarketOrder), (side == "buy")))
        createMarketBuyOrderRequiresPrice = true;
        (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice");
        if functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
            if functions.ccxtruthy(@functions.ccxt_and((price == nothing), (cost == nothing)))
                throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument")));
            else
                quoteAmount = stringMul(numberToString(amount), priceString);
                costRequest = functions.ccxtruthy((cost != nothing)) ? cost : quoteAmount;
                request[Symbol("qty")] = self.getCost(symbol, costRequest);
            end
        else
            if functions.ccxtruthy(cost != nothing)
                request[Symbol("qty")] = self.getCost(symbol, numberToString(cost));
            elseif functions.ccxtruthy(price != nothing)
                request[Symbol("qty")] = self.getCost(symbol, stringMul(amountString, priceString));
            else
                request[Symbol("qty")] = amountString;
            end
        end
    else
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isTrailingOrder), !functions.ccxtruthy(endpointIsTradingStop)))
            request[Symbol("qty")] = amountString;
        end
    end
    if functions.ccxtruthy(isTrailingOrder)
        if functions.ccxtruthy(trailingTriggerPrice != nothing)
            request[Symbol("activePrice")] = self.getPrice(symbol, trailingTriggerPrice);
        end
        request[Symbol("trailingStop")] = trailingAmount;
    elseif functions.ccxtruthy(@functions.ccxt_and(isTriggerOrder, !functions.ccxtruthy(endpointIsTradingStop)))
        triggerDirection = safeString(params, "triggerDirection");
        params = omit(params, ["triggerPrice", "stopPrice", "triggerDirection"]);
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            if functions.ccxtruthy(triggerDirection != nothing)
                throw(NotSupported(string(self.id, " createOrder() : trigger order does not support triggerDirection for spot markets yet")));
            end
        else
            if functions.ccxtruthy(triggerDirection == nothing)
                throw(ArgumentsRequired(string(self.id, " stop/trigger orders require a triggerDirection parameter, either \"ascending\" or \"descending\" to determine the direction of the trigger.")));
            end
            isAsending = (@functions.ccxt_or(@functions.ccxt_or((triggerDirection == "ascending"), (triggerDirection == "above")), (triggerDirection == "1")));
            request[Symbol("triggerDirection")] = functions.ccxtruthy(isAsending) ? 1 : 2;
        end
        request[Symbol("triggerPrice")] = self.getPrice(symbol, triggerPrice);
    else
        if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(isStopLossOrder, isTakeProfitOrder)), !functions.ccxtruthy(endpointIsTradingStop)))
            if functions.ccxtruthy(isBuy)
                request[Symbol("triggerDirection")] = functions.ccxtruthy(isStopLossOrder) ? 1 : 2;
            else
                request[Symbol("triggerDirection")] = functions.ccxtruthy(isStopLossOrder) ? 2 : 1;
            end
            triggerPrice = functions.ccxtruthy(isStopLossOrder) ? stopLossTriggerPrice : takeProfitTriggerPrice;
            request[Symbol("triggerPrice")] = self.getPrice(symbol, triggerPrice);
            request[Symbol("reduceOnly")] = true;
        end

    end
    if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(hasStopLoss, hasTakeProfit)), !functions.ccxtruthy(endpointIsTradingStop)))
        if functions.ccxtruthy(hasStopLoss)
            slTriggerPrice = safeValue2(stopLoss, "triggerPrice", "stopPrice", stopLoss);
            request[Symbol("stopLoss")] = self.getPrice(symbol, slTriggerPrice);
            slLimitPrice = safeValue(stopLoss, "price");
            if functions.ccxtruthy(slLimitPrice != nothing)
                request[Symbol("tpslMode")] = "Partial";
                request[Symbol("slOrderType")] = "Limit";
                request[Symbol("slLimitPrice")] = self.getPrice(symbol, slLimitPrice);
            else
                if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
                    request[Symbol("slOrderType")] = "Market";
                end
            end
            if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), isMarketOrder))
                throw(InvalidOrder(string(self.id, " createOrder(): attached stopLoss is not supported for spot market orders")));
            end
        end
        if functions.ccxtruthy(hasTakeProfit)
            tpTriggerPrice = safeValue2(takeProfit, "triggerPrice", "stopPrice", takeProfit);
            request[Symbol("takeProfit")] = self.getPrice(symbol, tpTriggerPrice);
            tpLimitPrice = safeValue(takeProfit, "price");
            if functions.ccxtruthy(tpLimitPrice != nothing)
                request[Symbol("tpslMode")] = "Partial";
                request[Symbol("tpOrderType")] = "Limit";
                request[Symbol("tpLimitPrice")] = self.getPrice(symbol, tpLimitPrice);
            else
                if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
                    request[Symbol("tpOrderType")] = "Market";
                end
            end
            if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("spot"), nothing), isMarketOrder))
                throw(InvalidOrder(string(self.id, " createOrder(): attached takeProfit is not supported for spot market orders")));
            end
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)), hedged))
        if functions.ccxtruthy(reduceOnly)
            params = omit(params, "reduceOnly");
            side = functions.ccxtruthy((side == "buy")) ? "sell" : "buy";
        end
        request[Symbol("positionIdx")] = functions.ccxtruthy((side == "buy")) ? 1 : 2;
    end
    params = omit(params, ["stopPrice", "timeInForce", "stopLossPrice", "takeProfitPrice", "postOnly", "clientOrderId", "triggerPrice", "stopLoss", "takeProfit", "trailingAmount", "trailingTriggerPrice", "hedged"]);
    return extend(request, params)

end
"""
create a list of trade orders
see: https://bybit-exchange.github.io/docs/v5/order/batch-place

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Bybit, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accounts = Base.fetch(self.isUnifiedEnabled());
    isUta = get(accounts, 2, nothing);
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
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price = price, params = orderParams, isUTA = isUta);
        delete!(orderRequest, :category);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    symbols = self.marketSymbols(symbols = orderSymbols, type_var = nothing, allowEmpty = false, sameTypeOnly = true, sameSubTypeOnly = true);
    market = self.market(get(symbols, 1, nothing));
    unifiedMarginStatus = safeInteger(self.options, "unifiedMarginStatus", 6);
    category = nothing;
    (category, params) = self.getBybitType("createOrders", market, params = params);
    if functions.ccxtruthy(@functions.ccxt_and((category == "inverse"), (functions.ccxt_lt(unifiedMarginStatus, 5))))
        throw(NotSupported(string(self.id, " createOrders does not allow inverse orders for non UTA2.0 account")));
    end
    request = Dict{Symbol, Any}(
        Symbol("category") => category,
        Symbol("request") => ordersRequests
    );
    response = Base.fetch(self.privatePostV5OrderCreateBatch(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "list", defaultValue = []);
    retInfo = self.safeDict(response, "retExtInfo", defaultValue = Dict{Symbol, Any}());
    codes = self.safeList(retInfo, "list", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(codes)))
        code = get(codes, i + 1, nothing);
        retCode = safeInteger(code, "code");
        if functions.ccxtruthy(retCode != 0)
            data[i + 1] = extend(get(data, i + 1, nothing), code);
        end
        i += 1
    end
    return self.parseOrders(data)

end
function editOrderRequest(self::Bybit, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "orderLinkId", "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        request[Symbol("orderId")] = id;
    else
        request[Symbol("orderLinkId")] = clientOrderId;
    end
    category = nothing;
    (category, params) = self.getBybitType("editOrderRequest", market, params = params);
    request[Symbol("category")] = category;
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("qty")] = self.getAmount(symbol, amount);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.getPrice(symbol, numberToString(price));
    end
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    stopLossTriggerPrice = safeString(params, "stopLossPrice");
    takeProfitTriggerPrice = safeString(params, "takeProfitPrice");
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    isStopLossOrder = stopLossTriggerPrice != nothing;
    isTakeProfitOrder = takeProfitTriggerPrice != nothing;
    hasStopLoss = stopLoss != nothing;
    hasTakeProfit = takeProfit != nothing;
    if functions.ccxtruthy(@functions.ccxt_or(isStopLossOrder, isTakeProfitOrder))
        triggerPrice = functions.ccxtruthy(isStopLossOrder) ? stopLossTriggerPrice : takeProfitTriggerPrice;
    end
    if functions.ccxtruthy(triggerPrice != nothing)
        triggerPriceRequest = functions.ccxtruthy((triggerPrice == "0")) ? triggerPrice : self.getPrice(symbol, triggerPrice);
        request[Symbol("triggerPrice")] = triggerPriceRequest;
        triggerBy = safeString(params, "triggerBy", "LastPrice");
        request[Symbol("triggerBy")] = triggerBy;
    end
    if functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
        if functions.ccxtruthy(hasStopLoss)
            slTriggerPrice = safeString2(stopLoss, "triggerPrice", "stopPrice", stopLoss);
            stopLossRequest = functions.ccxtruthy((slTriggerPrice == "0")) ? slTriggerPrice : self.getPrice(symbol, slTriggerPrice);
            request[Symbol("stopLoss")] = stopLossRequest;
            slTriggerBy = safeString(params, "slTriggerBy", "LastPrice");
            request[Symbol("slTriggerBy")] = slTriggerBy;
        end
        if functions.ccxtruthy(hasTakeProfit)
            tpTriggerPrice = safeString2(takeProfit, "triggerPrice", "stopPrice", takeProfit);
            takeProfitRequest = functions.ccxtruthy((tpTriggerPrice == "0")) ? tpTriggerPrice : self.getPrice(symbol, tpTriggerPrice);
            request[Symbol("takeProfit")] = takeProfitRequest;
            tpTriggerBy = safeString(params, "tpTriggerBy", "LastPrice");
            request[Symbol("tpTriggerBy")] = tpTriggerBy;
        end
    end
    params = omit(params, ["stopPrice", "stopLossPrice", "takeProfitPrice", "triggerPrice", "clientOrderId", "stopLoss", "takeProfit"]);
    return request

end
"""
edit a trade order
see: https://bybit-exchange.github.io/docs/v5/order/amend-order
see: https://bybit-exchange.github.io/docs/derivatives/unified/replace-order
see: https://bybit-exchange.github.io/docs/api-explorer/derivatives/trade/contract/replace-order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: unique client order id
- `params.triggerPrice`::float, optional: The price that a trigger order is triggered at
- `params.stopLossPrice`::float, optional: The price that a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: The price that a take profit order is triggered at
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice that the attached take profit order will be triggered
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice that the attached stop loss order will be triggered
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price
- `params.triggerBy`::string, optional: 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for triggerPrice
- `params.slTriggerBy`::string, optional: 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for stopLoss
- `params.tpTriggerby`::string, optional: 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for takeProfit

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Bybit, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = self.editOrderRequest(id, symbol, type_var, side, amount = amount, price = price, params = params);
    response = Base.fetch(self.privatePostV5OrderAmend(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => safeString(result, "orderId"),
    Symbol("clientOrderId") => safeString(result, "orderLinkId")
), market = market)

end
"""
edit a list of trade orders
see: https://bybit-exchange.github.io/docs/v5/order/batch-amend

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrders(self::Bybit, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    orderSymbols = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        symbol = safeString(rawOrder, "symbol");
        push!(orderSymbols, symbol);
        id = safeString(rawOrder, "id");
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        orderRequest = self.editOrderRequest(id, symbol, type_var, side, amount = amount, price = price, params = orderParams);
        delete!(orderRequest, :category);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    orderSymbols = self.marketSymbols(symbols = orderSymbols, type_var = nothing, allowEmpty = false, sameTypeOnly = true, sameSubTypeOnly = true);
    market = self.market(get(orderSymbols, 1, nothing));
    unifiedMarginStatus = safeInteger(self.options, "unifiedMarginStatus", 6);
    category = nothing;
    (category, params) = self.getBybitType("editOrders", market, params = params);
    if functions.ccxtruthy(@functions.ccxt_and((category == "inverse"), (functions.ccxt_lt(unifiedMarginStatus, 5))))
        throw(NotSupported(string(self.id, " editOrders does not allow inverse orders for non UTA2.0 account")));
    end
    request = Dict{Symbol, Any}(
        Symbol("category") => category,
        Symbol("request") => ordersRequests
    );
    response = Base.fetch(self.privatePostV5OrderAmendBatch(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "list", defaultValue = []);
    retInfo = self.safeDict(response, "retExtInfo", defaultValue = Dict{Symbol, Any}());
    codes = self.safeList(retInfo, "list", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(codes)))
        code = get(codes, i + 1, nothing);
        retCode = safeInteger(code, "code");
        if functions.ccxtruthy(retCode != 0)
            data[i + 1] = extend(get(data, i + 1, nothing), code);
        end
        i += 1
    end
    return self.parseOrders(data)

end
function cancelOrderRequest(self::Bybit, id; symbol=nothing, params=Dict())
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        isTrigger = self.safeBool2(params, "stop", "trigger", defaultValue = false);
        params = omit(params, ["stop", "trigger"]);
        request[Symbol("orderFilter")] = functions.ccxtruthy(isTrigger) ? "StopOrder" : "Order";
    end
    if functions.ccxtruthy(id != nothing)
        request[Symbol("orderId")] = id;
    end
    category = nothing;
    (category, params) = self.getBybitType("cancelOrderRequest", market, params = params);
    request[Symbol("category")] = category;
    return extend(request, params)

end
"""
cancels an open order
see: https://bybit-exchange.github.io/docs/v5/order/cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: *spot only* whether the order is a trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.orderFilter`::string, optional: *spot only* 'Order' or 'StopOrder' or 'tpslOrder'

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Bybit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    requestExtended = self.cancelOrderRequest(id, symbol = symbol, params = params);
    response = Base.fetch(self.privatePostV5OrderCancel(requestExtended));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result, market = market)

end
"""
cancel multiple orders
see: https://bybit-exchange.github.io/docs/v5/order/batch-cancel

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Bybit, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    types = Base.fetch(self.isUnifiedEnabled());
    enableUnifiedAccount = get(types, 2, nothing);
    if functions.ccxtruthy(!functions.ccxtruthy(enableUnifiedAccount))
        throw(NotSupported(string(self.id, " cancelOrders() supports UTA accounts only")));
    end
    category = nothing;
    (category, params) = self.getBybitType("cancelOrders", market, params = params);
    if functions.ccxtruthy(category == "inverse")
        throw(NotSupported(string(self.id, " cancelOrders does not allow inverse orders")));
    end
    ordersRequests = [];
    clientOrderIds = self.safeList2(params, "clientOrderIds", "clientOids", defaultValue = []);
    params = omit(params, ["clientOrderIds", "clientOids"]);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(clientOrderIds)))
        push!(ordersRequests, Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("id"), nothing),
    Symbol("orderLinkId") => safeString(clientOrderIds, i)
));
        i += 1
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        push!(ordersRequests, Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("id"), nothing),
    Symbol("orderId") => safeString(ids, i)
));
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("category") => category,
        Symbol("request") => ordersRequests
    );
    response = Base.fetch(self.privatePostV5OrderCancelBatch(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    row = self.safeList(result, "list", defaultValue = []);
    return self.parseOrders(row, market = market)

end
"""
dead man's switch, cancel all orders after the given timeout
see: https://bybit-exchange.github.io/docs/v5/order/dcp

# Arguments
- `timeout`::float: time in milliseconds
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.product`::string, optional: OPTIONS, DERIVATIVES, SPOT, default is 'DERIVATIVES'

# Returns
- the api result
"""
function cancelAllOrdersAfter(self::Bybit, timeout; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(timeout == nothing)
        throw(ExchangeError(string(self.id, " cancelAllOrdersAfter() missing timeout")));
    end
    request = Dict{Symbol, Any}(
        Symbol("timeWindow") => self.parseToInt(timeout / 1000)
    );
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("cancelAllOrdersAfter", market = nothing, params = params, defaultValue = "swap");
    productMap = Dict{Symbol, Any}(
        Symbol("spot") => "SPOT",
        Symbol("swap") => "DERIVATIVES",
        Symbol("option") => "OPTIONS"
    );
    product = safeString(productMap, type_var, type_var);
    request[Symbol("product")] = product;
    response = Base.fetch(self.privatePostV5OrderDisconnectedCancelAll(extend(request, params)));
    return response

end
"""
cancel multiple orders for multiple symbols
see: https://bybit-exchange.github.io/docs/v5/order/batch-cancel

# Arguments
- `orders`::array: list of order ids with symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrdersForSymbols(self::Bybit, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    types = Base.fetch(self.isUnifiedEnabled());
    enableUnifiedAccount = get(types, 2, nothing);
    if functions.ccxtruthy(!functions.ccxtruthy(enableUnifiedAccount))
        throw(NotSupported(string(self.id, " cancelOrdersForSymbols() supports UTA accounts only")));
    end
    ordersRequests = [];
    category = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        symbol = safeString(order, "symbol");
        market = self.market(symbol);
        currentCategory = nothing;
        (currentCategory, params) = self.getBybitType("cancelOrders", market, params = params);
        if functions.ccxtruthy(currentCategory == "inverse")
            throw(NotSupported(string(self.id, " cancelOrdersForSymbols does not allow inverse orders")));
        end
        if functions.ccxtruthy(@functions.ccxt_and((category != nothing), (category != currentCategory)))
            throw(ExchangeError(string(self.id, " cancelOrdersForSymbols requires all orders to be of the same category (linear, spot or option))")));
        end
        category = currentCategory;
        id = safeString(order, "id");
        clientOrderId = safeString(order, "clientOrderId");
        idKey = "orderId";
        if functions.ccxtruthy(clientOrderId != nothing)
            idKey = "orderLinkId";
        end
        orderItem = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing)
        );
        orderItem[Symbol(idKey)] = functions.ccxtruthy((idKey == "orderId")) ? id : clientOrderId;
        push!(ordersRequests, orderItem);
        i += 1
    end
    request = Dict{Symbol, Any}(
        Symbol("category") => category,
        Symbol("request") => ordersRequests
    );
    response = Base.fetch(self.privatePostV5OrderCancelBatch(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    row = self.safeList(result, "list", defaultValue = []);
    return self.parseOrders(row)

end
"""
cancel all open orders
see: https://bybit-exchange.github.io/docs/v5/order/cancel-all

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.baseCoin`::string, optional: Base coin. Supports linear, inverse & option
- `params.settleCoin`::string, optional: Settle coin. Supports linear, inverse & option

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelAllOrders(self::Bybit; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (enableUnifiedMargin, enableUnifiedAccount) = (Base.fetch(self.isUnifiedEnabled()));
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("cancelAllOrders", market, params = params);
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(@functions.ccxt_and((type_var == "option"), !functions.ccxtruthy(isUnifiedAccount)))
        throw(NotSupported(string(self.id, " cancelAllOrders() Normal Account not support ", type_var, " market")));
    end
    if functions.ccxtruthy(@functions.ccxt_or((type_var == "linear"), (type_var == "inverse")))
        baseCoin = safeString(params, "baseCoin");
        if functions.ccxtruthy(@functions.ccxt_and(symbol == nothing, baseCoin == nothing))
            defaultSettle = safeString(self.options, "defaultSettle", "USDT");
            request[Symbol("settleCoin")] = safeString(params, "settleCoin", defaultSettle);
        end
    end
    isTrigger = self.safeBool2(params, "stop", "trigger", defaultValue = false);
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(isTrigger)
        request[Symbol("orderFilter")] = "StopOrder";
    end
    response = Base.fetch(self.privatePostV5OrderCancelAll(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(result, "list");
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(orders)))
            return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]
    end
    return self.parseOrders(orders, market = market)

end
"""
fetches information on an order made by the user *classic accounts only*
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrderClassic(self::Bybit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(NotSupported(string(self.id, " fetchOrder() is not supported for spot markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    result = Base.fetch(self.fetchOrders(symbol = symbol, since = nothing, limit = nothing, params = extend(request, params)));
    len = length(result);
    if functions.ccxtruthy(len == 0)
        isTrigger = self.safeBool2(params, "trigger", "stop", defaultValue = false);
        extra = functions.ccxtruthy(isTrigger) ? "" : " If you are trying to fetch SL/TP conditional order, you might try setting params[\"trigger\"] = true";
        throw(OrderNotFound(string("Order ", id, " was not found.", extra)));
    end
    if functions.ccxtruthy(functions.ccxt_gt(len, 1))
        throw(InvalidOrder(string(self.id, " returned more than one order")));
    end
    return safeValue(result, 0)

end
"""
*classic accounts only/ spot not supported*  fetches information on an order made by the user *classic accounts only*
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.acknowledged`::object, optional: to suppress the warning, set to true

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Bybit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (enableUnifiedMargin, enableUnifiedAccount) = (Base.fetch(self.isUnifiedEnabled()));
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    if functions.ccxtruthy(!functions.ccxtruthy(isUnifiedAccount))
            return Base.fetch(self.fetchOrderClassic(id, symbol = symbol, params = params))
    end
    acknowledge = false;
    (acknowledge, params) = self.handleOptionAndParams(params, "fetchOrder", "acknowledged");
    if functions.ccxtruthy(!functions.ccxtruthy(acknowledge))
        throw(ArgumentsRequired(string(self.id, " fetchOrder() can only access an order if it is in last 500 orders (of any status) for your account. Set params[\"acknowledged\"] = true to hide this warning. Alternatively, we suggest to use fetchOpenOrder or fetchClosedOrder")));
    end
    market = self.market(symbol);
    marketType = nothing;
    (marketType, params) = self.getBybitType("fetchOrder", market, params = params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("orderId") => id,
        Symbol("category") => marketType
    );
    isTrigger = nothing;
    (isTrigger, params) = self.handleParamBool2(params, "trigger", "stop", defaultValue = false);
    if functions.ccxtruthy(isTrigger)
        request[Symbol("orderFilter")] = "StopOrder";
    end
    response = Base.fetch(self.privateGetV5OrderRealtime(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    innerList = self.safeList(result, "list", defaultValue = []);
    innerListLength = length(innerList);
    if functions.ccxtruthy(innerListLength == 0)
        extra = functions.ccxtruthy(isTrigger) ? "" : " If you are trying to fetch SL/TP conditional order, you might try setting params[\"trigger\"] = true";
        throw(OrderNotFound(string("Order ", id, " was not found.", extra)));
    end
    order = self.safeDict(innerList, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(order, market = market)

end
function fetchOrders(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    res = Base.fetch(self.isUnifiedEnabled());
    enableUnifiedAccount = self.safeBool(res, 1);
    if functions.ccxtruthy(enableUnifiedAccount)
        throw(NotSupported(string(self.id, " fetchOrders() is not supported after the 5/02 update for UTA accounts, please use fetchOpenOrders, fetchClosedOrders or fetchCanceledOrders")));
    end
    return Base.fetch(self.fetchOrdersClassic(symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on multiple orders made by the user *classic accounts only*
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrdersClassic(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchOrders", market, params = params);
    if functions.ccxtruthy(type_var == "spot")
        throw(NotSupported(string(self.id, " fetchOrders() is not supported for spot markets")));
    end
    request[Symbol("category")] = type_var;
    isTrigger = self.safeBool2(params, "trigger", "stop", defaultValue = false);
    params = omit(params, ["trigger", "stop"]);
    if functions.ccxtruthy(isTrigger)
        request[Symbol("orderFilter")] = "StopOrder";
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    endTime = safeInteger(params, "endTime", until);
    params = omit(params, ["endTime", "until"]);
    if functions.ccxtruthy(endTime != nothing)
        request[Symbol("endTime")] = endTime;
    end
    response = Base.fetch(self.privateGetV5OrderHistory(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetches information on a closed order made by the user
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching a closed trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrder(self::Bybit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    result = Base.fetch(self.fetchClosedOrders(symbol = symbol, since = nothing, limit = nothing, params = extend(request, params)));
    len = length(result);
    if functions.ccxtruthy(len == 0)
        isTrigger = self.safeBool2(params, "trigger", "stop", defaultValue = false);
        extra = functions.ccxtruthy(isTrigger) ? "" : " If you are trying to fetch SL/TP conditional order, you might try setting params[\"trigger\"] = true";
        throw(OrderNotFound(string("Order ", id, " was not found.", extra)));
    end
    if functions.ccxtruthy(functions.ccxt_gt(len, 1))
        throw(InvalidOrder(string(self.id, " returned more than one order")));
    end
    return safeValue(result, 0)

end
"""
fetches information on an open order made by the user
see: https://bybit-exchange.github.io/docs/v5/order/open-order

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching an open trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.baseCoin`::string, optional: Base coin. Supports linear, inverse & option
- `params.settleCoin`::string, optional: Settle coin. Supports linear, inverse & option
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrder(self::Bybit, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    result = Base.fetch(self.fetchOpenOrders(symbol = symbol, since = nothing, limit = nothing, params = extend(request, params)));
    len = length(result);
    if functions.ccxtruthy(len == 0)
        isTrigger = self.safeBool2(params, "trigger", "stop", defaultValue = false);
        extra = functions.ccxtruthy(isTrigger) ? "" : " If you are trying to fetch SL/TP conditional order, you might try setting params[\"trigger\"] = true";
        throw(OrderNotFound(string("Order ", id, " was not found.", extra)));
    end
    if functions.ccxtruthy(functions.ccxt_gt(len, 1))
        throw(InvalidOrder(string(self.id, " returned more than one order")));
    end
    return safeValue(result, 0)

end
"""
fetches information on multiple canceled and closed orders made by the user
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledAndClosedOrders(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchCanceledAndClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchCanceledAndClosedOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchCanceledAndClosedOrders", market, params = params);
    request[Symbol("category")] = type_var;
    isTrigger = self.safeBool2(params, "trigger", "stop", defaultValue = false);
    params = omit(params, ["trigger", "stop"]);
    if functions.ccxtruthy(isTrigger)
        request[Symbol("orderFilter")] = "StopOrder";
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    endTime = safeInteger(params, "endTime", until);
    params = omit(params, ["endTime", "until"]);
    if functions.ccxtruthy(endTime != nothing)
        request[Symbol("endTime")] = endTime;
    end
    response = Base.fetch(self.privateGetV5OrderHistory(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching closed trigger orders
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderStatus") => "Filled"
    );
    return Base.fetch(self.fetchCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetches information on multiple canceled orders made by the user
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledOrders(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderStatus") => "Cancelled"
    );
    return Base.fetch(self.fetchCanceledAndClosedOrders(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetch all unfilled currently open orders
see: https://bybit-exchange.github.io/docs/v5/order/open-order

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching open trigger orders
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.baseCoin`::string, optional: Base coin. Supports linear, inverse & option
- `params.settleCoin`::string, optional: Settle coin. Supports linear, inverse & option
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchOpenOrders", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchOpenOrders", market, params = params);
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "linear", type_var == "inverse"))
        baseCoin = safeString(params, "baseCoin");
        if functions.ccxtruthy(@functions.ccxt_and(symbol == nothing, baseCoin == nothing))
            defaultSettle = safeString(self.options, "defaultSettle", "USDT");
            settleCoin = safeString(params, "settleCoin", defaultSettle);
            request[Symbol("settleCoin")] = settleCoin;
        end
    end
    request[Symbol("category")] = type_var;
    isTrigger = self.safeBool2(params, "stop", "trigger", defaultValue = false);
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(isTrigger)
        request[Symbol("orderFilter")] = "StopOrder";
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetV5OrderRealtime(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    return self.parseOrders(data, market = market, since = since, limit = limit)

end
"""
fetch all the trades made from a single order
see: https://bybit-exchange.github.io/docs/v5/position/execution

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Bybit, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOrderId", "orderLinkId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("orderLinkId")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    params = omit(params, ["clientOrderId", "orderLinkId"]);
    return Base.fetch(self.fetchMyTrades(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetch all trades made by the user
see: https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    request = Dict{Symbol, Any}(
        Symbol("execType") => "Trade"
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchMyTrades", market, params = params);
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.privateGetV5ExecutionList(extend(request, params)));
    trades = self.addPaginationCursorToResult(response);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseDepositAddress(self::Bybit, depositAddress; currency=nothing)
    address = safeString(depositAddress, "addressDeposit");
    tag = safeString(depositAddress, "tagDeposit");
    code = safeString(currency, "code");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId = safeString(depositAddress, "chain"), currencyCode = code),
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
fetch a dictionary of addresses for a currency, indexed by network
see: https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [address structures]{@link https://docs.ccxt.com/?id=address-structure} indexed by the network
"""
function fetchDepositAddressesByNetwork(self::Bybit, code; params=Dict())
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
        request[Symbol("chainType")] = self.networkCodeToId(networkCode, currencyCode = code);
    end
    response = Base.fetch(self.privateGetV5AssetDepositQueryAddress(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    chains = self.safeList(result, "chains", defaultValue = []);
    coin = safeString(result, "coin");
    currencyFromResponse = self.currency(coin);
    parsed = self.parseDepositAddresses(chains, codes = [get(currencyFromResponse, Symbol("code"), nothing)], indexed = false, params = Dict{Symbol, Any}(
        Symbol("currency") => get(currencyFromResponse, Symbol("code"), nothing)
    ));
    return indexBy(parsed, "network")

end
"""
fetch the deposit address for a currency associated with this account
see: https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Bybit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    (networkCode, paramsOmited) = self.handleNetworkCodeAndParams(params);
    indexedAddresses = Base.fetch(self.fetchDepositAddressesByNetwork(code, params = paramsOmited));
    selectedNetworkCode = self.selectNetworkCodeFromUnifiedNetworks(get(currency, Symbol("code"), nothing), networkCode, indexedAddresses);
    return safeValue(indexedAddresses, selectedNetworkCode)

end
"""
fetch all deposits made to an account
see: https://bybit-exchange.github.io/docs/v5/asset/deposit-record

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for, default = 30 days before the current time
- `limit`::int, optional: the maximum number of deposits structures to retrieve, default = 50, max = 50
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch deposits for, default = 30 days after since EXCHANGE SPECIFIC PARAMETERS
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.cursor`::string, optional: used for pagination

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Bybit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDeposits", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchDeposits", symbol = code, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
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
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.privateGetV5AssetDepositQueryRecord(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
"""
fetch all withdrawals made from an account
see: https://bybit-exchange.github.io/docs/v5/asset/withdraw-record

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Bybit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchWithdrawals", symbol = code, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
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
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.privateGetV5AssetWithdrawQueryRecord(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    return self.parseTransactions(data, currency = currency, since = since, limit = limit)

end
function parseTransactionStatus(self::Bybit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "unknown",
        Symbol("1") => "pending",
        Symbol("2") => "processing",
        Symbol("3") => "ok",
        Symbol("4") => "fail",
        Symbol("SecurityCheck") => "pending",
        Symbol("Pending") => "pending",
        Symbol("success") => "ok",
        Symbol("CancelByUser") => "canceled",
        Symbol("Reject") => "rejected",
        Symbol("Fail") => "failed",
        Symbol("BlockchainConfirmed") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransaction(self::Bybit, transaction; currency=nothing)
    currencyId = safeString(transaction, "coin");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    timestamp = safeInteger2(transaction, "createTime", "successAt");
    updated = safeInteger(transaction, "updateTime");
    status = self.parseTransactionStatus(safeString(transaction, "status"));
    feeCost = self.safeNumber2(transaction, "depositFee", "withdrawFee");
    type_var = functions.ccxtruthy((ccxt_in("depositFee", transaction))) ? "deposit" : "withdrawal";
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => code
        );
    end
    toAddress = safeString(transaction, "toAddress");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString2(transaction, "id", "withdrawId"),
    Symbol("txid") => safeString(transaction, "txID"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => self.networkIdToCode(networkId = safeString(transaction, "chain"), currencyCode = code),
    Symbol("address") => nothing,
    Symbol("addressTo") => toAddress,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => safeString(transaction, "tag"),
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => code,
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("fee") => fee,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing
)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://bybit-exchange.github.io/docs/v5/account/transaction-log
see: https://bybit-exchange.github.io/docs/v5/account/contract-transaction-log

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.subType`::string, optional: if inverse will use v5/account/contract-transaction-log

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Bybit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchLedger", symbol = code, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    request = Dict{Symbol, Any}();
    enableUnified = Base.fetch(self.isUnifiedEnabled());
    currency = nothing;
    currencyKey = "coin";
    if functions.ccxtruthy(get(enableUnified, 2, nothing))
        currencyKey = "currency";
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_date")] = self.yyyymmdd(since);
        end
    end
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol(currencyKey)] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchLedger", market = nothing, params = params);
    if functions.ccxtruthy(get(enableUnified, 2, nothing))
        unifiedMarginStatus = safeInteger(self.options, "unifiedMarginStatus", 5);
        if functions.ccxtruthy(@functions.ccxt_and(subType == "inverse", (functions.ccxt_lt(unifiedMarginStatus, 5))))
            response = Base.fetch(self.privateGetV5AccountContractTransactionLog(extend(request, params)));
        else
            response = Base.fetch(self.privateGetV5AccountTransactionLog(extend(request, params)));
        end
    else
        response = Base.fetch(self.privateGetV5AccountContractTransactionLog(extend(request, params)));
    end
    data = self.addPaginationCursorToResult(response);
    return self.parseLedger(data, currency = currency, since = since, limit = limit)

end
function parseLedgerEntry(self::Bybit, item; currency=nothing)
    currencyId = safeString2(item, "coin", "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    amountString = safeString2(item, "amount", "change");
    afterString = safeString2(item, "wallet_balance", "cashBalance");
    direction = functions.ccxtruthy(stringLt(amountString, "0")) ? "out" : "in";
    before = nothing;
    after = nothing;
    amount = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(afterString != nothing, amountString != nothing))
        difference = functions.ccxtruthy((direction == "out")) ? amountString : stringNeg(amountString);
        before = self.parseToNumeric(stringAdd(afterString, difference));
        after = self.parseToNumeric(afterString);
        amount = self.parseToNumeric(stringAbs(amountString));
    end
    timestamp = self.parse8601(safeString(item, "exec_time"));
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeInteger(item, "transactionTime");
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "id"),
    Symbol("direction") => direction,
    Symbol("account") => safeString(item, "wallet_id"),
    Symbol("referenceId") => safeString(item, "tx_id"),
    Symbol("referenceAccount") => nothing,
    Symbol("type") => self.parseLedgerEntryType(safeString(item, "type")),
    Symbol("currency") => code,
    Symbol("amount") => amount,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => before,
    Symbol("after") => after,
    Symbol("status") => "ok",
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.safeNumber(item, "fee")
    )
), currency = currency)

end
function parseLedgerEntryType(self::Bybit, type_var)
    types = Dict{Symbol, Any}(
        Symbol("Deposit") => "transaction",
        Symbol("Withdraw") => "transaction",
        Symbol("RealisedPNL") => "trade",
        Symbol("Commission") => "fee",
        Symbol("Refund") => "cashback",
        Symbol("Prize") => "prize",
        Symbol("ExchangeOrderWithdraw") => "transaction",
        Symbol("ExchangeOrderDeposit") => "transaction",
        Symbol("TRANSFER_IN") => "transaction",
        Symbol("TRANSFER_OUT") => "transaction",
        Symbol("TRADE") => "trade",
        Symbol("SETTLEMENT") => "trade",
        Symbol("DELIVERY") => "trade",
        Symbol("LIQUIDATION") => "trade",
        Symbol("BONUS") => "Prize",
        Symbol("FEE_REFUND") => "cashback",
        Symbol("INTEREST") => "transaction",
        Symbol("CURRENCY_BUY") => "trade",
        Symbol("CURRENCY_SELL") => "trade"
    );
    return safeString(types, type_var, type_var)

end
"""
make a withdrawal
see: https://bybit-exchange.github.io/docs/v5/asset/withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: 'UTA', 'FUND', 'FUND,UTA', and 'SPOT (for classic accounts only)

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Bybit, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    accountType = nothing;
    accounts = Base.fetch(self.isUnifiedEnabled());
    isUta = get(accounts, 2, nothing);
    (accountType, params) = self.handleOptionAndParams(params, "withdraw", "accountType");
    if functions.ccxtruthy(accountType == nothing)
        accountType = functions.ccxtruthy(isUta) ? "UTA" : "SPOT";
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address = address);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => numberToString(amount),
        Symbol("address") => address,
        Symbol("timestamp") => milliseconds(),
        Symbol("accountType") => accountType
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("tag")] = tag;
    end
    (networkCode, query) = self.handleNetworkCodeAndParams(params);
    networkId = self.networkCodeToId(networkCode, currencyCode = code);
    if functions.ccxtruthy(networkId != nothing)
        request[Symbol("chain")] =         uppercase(networkId);
    end
    response = Base.fetch(self.privatePostV5AssetWithdrawCreate(extend(request, query)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(result, currency = currency)

end
"""
fetch data on a single open contract trade position
see: https://bybit-exchange.github.io/docs/v5/position

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Bybit, symbol; params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchPosition() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchPosition", market, params = params);
    request[Symbol("category")] = type_var;
    response = Base.fetch(self.privateGetV5PositionList(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    positions = self.safeList2(result, "list", "dataList", defaultValue = []);
    timestamp = safeInteger(response, "time");
    first_var = self.safeDict(positions, 0, defaultValue = Dict{Symbol, Any}());
    position = self.parsePosition(first_var, market = market);
    position[Symbol("timestamp")] = timestamp;
    position[Symbol("datetime")] = self.iso8601(timestamp);
    return position

end
"""
fetch all open positions
see: https://bybit-exchange.github.io/docs/v5/position

# Arguments
- `symbols`::array: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.baseCoin`::string, optional: Base coin. Supports linear, inverse & option
- `params.settleCoin`::string, optional: Settle coin. Supports linear, inverse & option
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Bybit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchPositions", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchPositions", symbol = symbols, since = nothing, limit = nothing, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 200))
    end
    symbol = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((symbols != nothing), functions.ccxt_isArray(symbols)))
        symbolsLength = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 1))
            throw(ArgumentsRequired(string(self.id, " fetchPositions() does not accept an array with more than one symbol")));
        elseif functions.ccxtruthy(symbolsLength == 1)
            symbol = get(symbols, 1, nothing);
        end
        symbols = self.marketSymbols(symbols = symbols);
    elseif functions.ccxtruthy(symbols != nothing)
        symbol = symbols;
        symbols = [self.symbol(symbol)];
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchPositions", market, params = params);
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "linear", type_var == "inverse"))
        baseCoin = safeString(params, "baseCoin");
        if functions.ccxtruthy(type_var == "linear")
            if functions.ccxtruthy(@functions.ccxt_and(symbol == nothing, baseCoin == nothing))
                defaultSettle = safeString(self.options, "defaultSettle", "USDT");
                settleCoin = safeString(params, "settleCoin", defaultSettle);
                request[Symbol("settleCoin")] = settleCoin;
            end
        else
            if functions.ccxtruthy(@functions.ccxt_and(symbol == nothing, baseCoin == nothing))
                request[Symbol("category")] = "inverse";
            end
        end
    end
    if functions.ccxtruthy(safeInteger(params, "limit") == nothing)
        request[Symbol("limit")] = 200;
    end
    params = omit(params, ["type"]);
    request[Symbol("category")] = type_var;
    response = Base.fetch(self.privateGetV5PositionList(extend(request, params)));
    positions = self.addPaginationCursorToResult(response);
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        rawPosition = get(positions, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("data", rawPosition)), (ccxt_in("is_valid", rawPosition))))
            rawPosition = self.safeDict(rawPosition, "data");
        end
        push!(results, self.parsePosition(rawPosition));
        i += 1
    end
    return self.filterByArrayPositions(results, "symbol", values = symbols, indexed = false)

end
function parsePosition(self::Bybit, position; market=nothing)
    closedSize = safeString(position, "closedSize");
    isHistory = (closedSize != nothing);
    contract = safeString(position, "symbol");
    market = self.safeMarket(marketId = contract, market = market, delimiter = nothing, marketType = "contract");
    size_var = stringAbs(safeString2(position, "size", "qty"));
    side = safeString(position, "side");
    positionIdx = safeString(position, "positionIdx");
    hedged = nothing;
    if functions.ccxtruthy(positionIdx != nothing)
        hedged = (positionIdx != "0");
    end
    if functions.ccxtruthy(@functions.ccxt_and((hedged != nothing), hedged))
        side = functions.ccxtruthy((positionIdx == "1")) ? "long" : "short";
    elseif functions.ccxtruthy(side != nothing)
        if functions.ccxtruthy(side == "Buy")
            side = functions.ccxtruthy(isHistory) ? "short" : "long";
        elseif functions.ccxtruthy(side == "Sell")
            side = functions.ccxtruthy(isHistory) ? "long" : "short";
        else
            side = nothing;
        end
    end
    notional = nothing;
    contractSize = safeString(market, "contractSize");
    markPrice = safeString(position, "markPrice");
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        notional = stringDiv(stringMul(size_var, contractSize), markPrice);
    else
        notional = safeString2(position, "positionValue", "cumExitValue");
    end
    unrealisedPnl = omitZero(safeString(position, "unrealisedPnl"));
    initialMarginString = safeString2(position, "positionIM", "cumEntryValue");
    maintenanceMarginString = safeString(position, "positionMM");
    timestamp = safeInteger2(position, "createdTime", "createdAt");
    lastUpdateTimestamp = self.parse8601(safeString(position, "updated_at"));
    if functions.ccxtruthy(lastUpdateTimestamp == nothing)
        lastUpdateTimestamp = safeInteger2(position, "updatedTime", "updatedAt");
    end
    collateralString = safeString(position, "positionBalance");
    entryPrice = omitZero(safeStringN(position, ["entryPrice", "avgPrice", "avgEntryPrice"]));
    liquidationPrice = omitZero(safeString(position, "liqPrice"));
    leverage = safeString(position, "leverage");
    if functions.ccxtruthy(liquidationPrice != nothing)
        if functions.ccxtruthy(get(market, Symbol("settle"), nothing) == "USDC")
            price = functions.ccxtruthy(self.safeBool(self.options, "useMarkPriceForPositionCollateral", defaultValue = false)) ? markPrice : entryPrice;
            difference = stringAbs(stringSub(price, liquidationPrice));
            collateralString = stringAdd(stringAdd(stringMul(difference, size_var), maintenanceMarginString), unrealisedPnl);
        else
            bustPrice = safeString(position, "bustPrice");
            if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
                maintenanceMarginPriceDifference = stringAbs(stringSub(liquidationPrice, bustPrice));
                maintenanceMarginString = stringMul(maintenanceMarginPriceDifference, size_var);
                if functions.ccxtruthy(@functions.ccxt_and((entryPrice != nothing), (initialMarginString == nothing)))
                    initialMarginString = stringDiv(stringMul(size_var, entryPrice), leverage);
                end
            else
                difference = stringAbs(stringSub(bustPrice, liquidationPrice));
                multiply = stringMul(bustPrice, liquidationPrice);
                maintenanceMarginString = stringDiv(stringMul(size_var, difference), multiply);
                if functions.ccxtruthy(@functions.ccxt_and((entryPrice != nothing), (initialMarginString == nothing)))
                    initialMarginString = stringDiv(size_var, stringMul(entryPrice, leverage));
                end
            end
        end
    end
    maintenanceMarginPercentage = stringDiv(maintenanceMarginString, notional);
    marginRatio = stringDiv(maintenanceMarginString, collateralString, 4);
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("initialMargin") => self.parseNumber(initialMarginString),
    Symbol("initialMarginPercentage") => self.parseNumber(stringDiv(initialMarginString, notional)),
    Symbol("maintenanceMargin") => self.parseNumber(maintenanceMarginString),
    Symbol("maintenanceMarginPercentage") => self.parseNumber(maintenanceMarginPercentage),
    Symbol("entryPrice") => self.parseNumber(entryPrice),
    Symbol("notional") => self.parseNumber(notional),
    Symbol("leverage") => self.parseNumber(leverage),
    Symbol("unrealizedPnl") => self.parseNumber(unrealisedPnl),
    Symbol("realizedPnl") => self.safeNumber2(position, "curRealisedPnl", "closedPnl"),
    Symbol("contracts") => self.parseNumber(size_var),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("marginRatio") => self.parseNumber(marginRatio),
    Symbol("liquidationPrice") => self.parseNumber(liquidationPrice),
    Symbol("markPrice") => self.parseNumber(markPrice),
    Symbol("lastPrice") => self.safeNumber(position, "avgExitPrice"),
    Symbol("collateral") => self.parseNumber(collateralString),
    Symbol("marginMode") => nothing,
    Symbol("side") => side,
    Symbol("percentage") => nothing,
    Symbol("stopLossPrice") => self.safeNumber2(position, "stop_loss", "stopLoss"),
    Symbol("takeProfitPrice") => self.safeNumber2(position, "take_profit", "takeProfit"),
    Symbol("hedged") => hedged
))

end
"""
fetch the set leverage for a market
see: https://bybit-exchange.github.io/docs/v5/position

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Bybit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    position = Base.fetch(self.fetchPosition(symbol, params = params));
    return self.parseLeverage(position, market = market)

end
function parseLeverage(self::Bybit, leverage; market=nothing)
    marketId = safeString(leverage, "symbol");
    leverageValue = safeInteger(leverage, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("marginMode") => safeStringLower(leverage, "marginMode"),
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
"""
set margin mode (account) or trade mode (symbol)
see: https://bybit-exchange.github.io/docs/v5/account/set-margin-mode
see: https://bybit-exchange.github.io/docs/v5/position/cross-isolate

# Arguments
- `marginMode`::string: account mode must be either [isolated, cross, portfolio], trade mode must be either [isolated, cross]
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.leverage`::string, optional: the rate of leverage, is required if setting trade mode (symbol)

# Returns
- response from the exchange
"""
function setMarginMode(self::Bybit, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    (enableUnifiedMargin, enableUnifiedAccount) = (Base.fetch(self.isUnifiedEnabled()));
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    market = nothing;
    if functions.ccxtruthy(isUnifiedAccount)
        if functions.ccxtruthy(marginMode == "isolated")
            marginMode = "ISOLATED_MARGIN";
        elseif functions.ccxtruthy(marginMode == "cross")
            marginMode = "REGULAR_MARGIN";
        else
            if functions.ccxtruthy(marginMode == "portfolio")
                marginMode = "PORTFOLIO_MARGIN";
            else
                throw(NotSupported(string(self.id, " setMarginMode() marginMode must be either [isolated, cross, portfolio]")));
            end

        end
        request = Dict{Symbol, Any}(
            Symbol("setMarginMode") => marginMode
        );
        response = Base.fetch(self.privatePostV5AccountSetMarginMode(extend(request, params)));
    else
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol parameter for non unified account")));
        end
        market = self.market(symbol);
        isUsdcSettled = get(market, Symbol("settle"), nothing) == "USDC";
        if functions.ccxtruthy(isUsdcSettled)
            if functions.ccxtruthy(marginMode == "cross")
                marginMode = "REGULAR_MARGIN";
            elseif functions.ccxtruthy(marginMode == "portfolio")
                marginMode = "PORTFOLIO_MARGIN";
            else
                throw(NotSupported(string(self.id, " setMarginMode() for usdc market marginMode must be either [cross, portfolio]")));
            end
            request = Dict{Symbol, Any}(
                Symbol("setMarginMode") => marginMode
            );
            response = Base.fetch(self.privatePostV5AccountSetMarginMode(extend(request, params)));
        else
            type_var = nothing;
            (type_var, params) = self.getBybitType("setPositionMode", market, params = params);
            tradeMode = nothing;
            if functions.ccxtruthy(marginMode == "cross")
                tradeMode = 0;
            elseif functions.ccxtruthy(marginMode == "isolated")
                tradeMode = 1;
            else
                throw(NotSupported(string(self.id, " setMarginMode() with symbol marginMode must be either [isolated, cross]")));
            end
            sellLeverage = nothing;
            buyLeverage = nothing;
            leverage = safeString(params, "leverage");
            if functions.ccxtruthy(leverage == nothing)
                sellLeverage = safeString2(params, "sell_leverage", "sellLeverage");
                buyLeverage = safeString2(params, "buy_leverage", "buyLeverage");
                if functions.ccxtruthy(@functions.ccxt_and(sellLeverage == nothing, buyLeverage == nothing))
                    throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a leverage parameter or sell_leverage and buy_leverage parameters")));
                end
                if functions.ccxtruthy(buyLeverage == nothing)
                    buyLeverage = sellLeverage;
                end
                if functions.ccxtruthy(sellLeverage == nothing)
                    sellLeverage = buyLeverage;
                end
                params = omit(params, ["buy_leverage", "sell_leverage", "sellLeverage", "buyLeverage"]);
            else
                sellLeverage = leverage;
                buyLeverage = leverage;
                params = omit(params, "leverage");
            end
            request = Dict{Symbol, Any}(
                Symbol("category") => type_var,
                Symbol("symbol") => get(market, Symbol("id"), nothing),
                Symbol("tradeMode") => tradeMode,
                Symbol("buyLeverage") => buyLeverage,
                Symbol("sellLeverage") => sellLeverage
            );
            response = Base.fetch(self.privatePostV5PositionSwitchIsolated(extend(request, params)));
        end
    end
    return response

end
"""
set the level of leverage for a market
see: https://bybit-exchange.github.io/docs/v5/position/leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.buyLeverage`::string, optional: leverage for buy side
- `params.sellLeverage`::string, optional: leverage for sell side

# Returns
- response from the exchange
"""
function setLeverage(self::Bybit, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    leverageString = numberToString(leverage);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("buyLeverage") => leverageString,
        Symbol("sellLeverage") => leverageString
    );
    request[Symbol("buyLeverage")] = leverageString;
    request[Symbol("sellLeverage")] = leverageString;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        request[Symbol("category")] = "linear";
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        request[Symbol("category")] = "inverse";
    else
        throw(NotSupported(string(self.id, " setLeverage() only support linear and inverse market")));
    end
    response = Base.fetch(self.privatePostV5PositionSetLeverage(extend(request, params)));
    return response

end
"""
set hedged to true or false for a market
see: https://bybit-exchange.github.io/docs/v5/position/position-mode

# Arguments
- `hedged`::bool:
- `symbol`::string: used for unified account with inverse market
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setPositionMode(self::Bybit, hedged; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    mode = nothing;
    if functions.ccxtruthy(hedged)
        mode = 3;
    else
        mode = 0;
    end
    request = Dict{Symbol, Any}(
        Symbol("mode") => mode
    );
    if functions.ccxtruthy(symbol == nothing)
        request[Symbol("coin")] = "USDT";
    else
        request[Symbol("symbol")] = safeString(market, "id");
    end
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("category")] = functions.ccxtruthy(self.safeBool(market, "linear")) ? "linear" : "inverse";
    else
        type_var = nothing;
        (type_var, params) = self.getBybitType("setPositionMode", market, params = params);
        request[Symbol("category")] = type_var;
    end
    params = omit(params, "type");
    response = Base.fetch(self.privatePostV5PositionSwitchMode(extend(request, params)));
    return response

end
function fetchDerivativesOpenInterestHistory(self::Bybit, symbol; timeframe="1h", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    subType = functions.ccxtruthy(get(market, Symbol("linear"), nothing)) ? "linear" : "inverse";
    category = safeString(params, "category", subType);
    intervals = self.safeDict(self.options, "intervals");
    interval = safeString(intervals, timeframe);
    if functions.ccxtruthy(interval == nothing)
        throw(BadRequest(string(self.id, " fetchOpenInterestHistory() cannot use the ", timeframe, " timeframe")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("intervalTime") => interval,
        Symbol("category") => category
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetV5MarketOpenInterest(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.addPaginationCursorToResult(response);
    id = safeString(result, "symbol");
    safeMarketObj = self.safeMarket(marketId = id, market = market, delimiter = nothing, marketType = "contract");
    return self.parseOpenInterestsHistory(data, market = safeMarketObj, since = since, limit = limit)

end
"""
Retrieves the open interest of a derivative trading pair
see: https://bybit-exchange.github.io/docs/v5/market/open-interest

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `params`::object, optional: exchange specific parameters
- `params.interval`::string, optional: 5m, 15m, 30m, 1h, 4h, 1d
- `params.category`::string, optional: "linear" or "inverse"

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Bybit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterest() supports contract markets only")));
    end
    timeframe = safeString(params, "interval", "1h");
    intervals = self.safeDict(self.options, "intervals");
    interval = safeString(intervals, timeframe);
    if functions.ccxtruthy(interval == nothing)
        throw(BadRequest(string(self.id, " fetchOpenInterest() cannot use the ", timeframe, " timeframe")));
    end
    subType = functions.ccxtruthy(get(market, Symbol("linear"), nothing)) ? "linear" : "inverse";
    category = safeString(params, "category", subType);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("intervalTime") => interval,
        Symbol("category") => category
    );
    response = Base.fetch(self.publicGetV5MarketOpenInterest(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    id = safeString(result, "symbol");
    safeMarketObj = self.safeMarket(marketId = id, market = market, delimiter = nothing, marketType = "contract");
    data = self.addPaginationCursorToResult(response);
    return self.parseOpenInterest(get(data, 1, nothing), market = safeMarketObj)

end
"""
Gets the total amount of unsettled contracts. In other words, the total number of contracts held in open positions
see: https://bybit-exchange.github.io/docs/v5/market/open-interest

# Arguments
- `symbol`::string: Unified market symbol
- `timeframe`::string: "5m", 15m, 30m, 1h, 4h, 1d
- `since`::int, optional: Not used by Bybit
- `limit`::int, optional: The number of open interest structures to return. Max 200, default 50
- `params`::object, optional: Exchange specific parameters
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- An array of open interest structures
"""
function fetchOpenInterestHistory(self::Bybit, symbol; timeframe="1h", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(timeframe == "1m")
        throw(BadRequest(string(self.id, " fetchOpenInterestHistory cannot use the 1m timeframe")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = self.safeBool(params, "paginate");
    if functions.ccxtruthy(paginate)
        params = omit(params, "paginate");
        params[Symbol("timeframe")] = timeframe;
            return Base.fetch(self.fetchPaginatedCallCursor("fetchOpenInterestHistory", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 200))
    end
    market = self.market(symbol);
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("spot"), nothing), get(market, Symbol("option"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterestHistory() symbol does not support market ", symbol)));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    return Base.fetch(self.fetchDerivativesOpenInterestHistory(symbol, timeframe = timeframe, since = since, limit = limit, params = params))

end
function parseOpenInterest(self::Bybit, interest; market=nothing)
    timestamp = safeInteger(interest, "timestamp");
    openInterest = self.safeNumber2(interest, "open_interest", "openInterest");
    amount = functions.ccxtruthy(self.safeBool(market, "linear")) ? openInterest : nothing;
    value = functions.ccxtruthy(self.safeBool(market, "inverse")) ? openInterest : nothing;
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("openInterestAmount") => amount,
    Symbol("openInterestValue") => value,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://bybit-exchange.github.io/docs/zh-TW/v5/spot-margin-normal/interest-quota

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [borrow rate structure]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
function fetchCrossBorrowRate(self::Bybit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetV5SpotCrossMarginTradeLoanInfo(extend(request, params)));
    timestamp = safeInteger(response, "time");
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data[Symbol("timestamp")] = timestamp;
    return self.parseBorrowRate(data, currency = currency)

end
function parseBorrowRate(self::Bybit, info; currency=nothing)
    timestamp = safeInteger(info, "timestamp");
    currencyId = safeString2(info, "coin", "currency");
    hourlyBorrowRate = self.safeNumber(info, "hourlyBorrowRate");
    period = functions.ccxtruthy((hourlyBorrowRate != nothing)) ? 3600000 : 86400000;
    return Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("rate") => self.safeNumber(info, "interestRate", defaultNumber = hourlyBorrowRate),
    Symbol("period") => period,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://bybit-exchange.github.io/docs/zh-TW/v5/spot-margin-normal/account-info

# Arguments
- `code`::string: unified currency code
- `symbol`::string: unified market symbol when fetch interest in isolated markets
- `since`::float, optional: the earliest time in ms to fetch borrrow interest for
- `limit`::float, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
function fetchBorrowInterest(self::Bybit; code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.privateGetV5SpotCrossMarginTradeAccount(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    rows = self.safeList(data, "loanAccountList", defaultValue = []);
    interest = self.parseBorrowInterests(rows);
    return self.filterByCurrencySinceLimit(interest, code = code, since = since, limit = limit)

end
"""
retrieves a history of a currencies borrow interest rate at specific time slots
see: https://bybit-exchange.github.io/docs/v5/spot-margin-uta/historical-interest

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: timestamp for the earliest borrow rate
- `limit`::int, optional: the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for

# Returns
- an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
function fetchBorrowRateHistory(self::Bybit, code; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since == nothing)
        since = milliseconds() - 86400000 * 30;
    end
    request[Symbol("startTime")] = since;
    endTime = safeInteger2(params, "until", "endTime");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(endTime == nothing)
        endTime = since + 86400000 * 30;
    end
    request[Symbol("endTime")] = endTime;
    response = Base.fetch(self.privateGetV5SpotMarginTradeInterestRateHistory(extend(request, params)));
    data = self.safeDict(response, "result");
    rows = self.safeList(data, "list", defaultValue = []);
    return self.parseBorrowRateHistory(rows, code, since, limit)

end
function parseBorrowInterest(self::Bybit, info; market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => nothing,
    Symbol("currency") => self.safeCurrencyCode(safeString(info, "tokenId")),
    Symbol("interest") => self.safeNumber(info, "interest"),
    Symbol("interestRate") => nothing,
    Symbol("amountBorrowed") => self.safeNumber(info, "loan"),
    Symbol("marginMode") => "cross",
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
transfer currency internally between wallets on the same account
see: https://bybit-exchange.github.io/docs/v5/asset/create-inter-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transferId`::string, optional: UUID, which is unique across the platform

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Bybit, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    transferId = safeString(params, "transferId", uuid());
    accountTypes = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    fromId = safeString(accountTypes, fromAccount, fromAccount);
    toId = safeString(accountTypes, toAccount, toAccount);
    currency = self.currency(code);
    amountToPrecision = self.currencyToPrecision(code, amount);
    request = Dict{Symbol, Any}(
        Symbol("transferId") => transferId,
        Symbol("fromAccountType") => fromId,
        Symbol("toAccountType") => toId,
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amountToPrecision
    );
    response = Base.fetch(self.privatePostV5AssetTransferInterTransfer(extend(request, params)));
    timestamp = safeInteger(response, "time");
    transfer = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    statusRaw = safeString2(response, "retCode", "retMsg");
    status = self.parseTransferStatus(statusRaw);
    return extend(self.parseTransfer(transfer, currency = currency), Dict{Symbol, Any}(
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("amount") => self.parseNumber(amountToPrecision),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => status
))

end
"""
fetch a history of internal transfers made on an account
see: https://bybit-exchange.github.io/docs/v5/asset/inter-transfer-list

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Bybit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchTransfers", symbol = code, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 50))
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.safeCurrency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.privateGetV5AssetTransferQueryInterTransferList(extend(request, params)));
    data = self.addPaginationCursorToResult(response);
    return self.parseTransfers(data, currency = currency, since = since, limit = limit)

end
"""
create a loan to borrow margin
see: https://bybit-exchange.github.io/docs/v5/account/borrow

# Arguments
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function borrowCrossMargin(self::Bybit, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.privatePostV5AccountBorrow(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginLoan(result, currency = currency)

end
"""
repay borrowed margin and interest
see: https://bybit-exchange.github.io/docs/v5/account/no-convert-repay

# Arguments
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function repayCrossMargin(self::Bybit, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => numberToString(amount)
    );
    response = Base.fetch(self.privatePostV5AccountNoConvertRepay(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    transaction = self.parseMarginLoan(result, currency = currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount
))

end
function parseMarginLoan(self::Bybit, info; currency=nothing)
    currencyId = safeString(info, "coin");
    return Dict{Symbol, Any}(
    Symbol("id") => nothing,
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber(info, "amount"),
    Symbol("symbol") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => info
)

end
function parseTransferStatus(self::Bybit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "ok",
        Symbol("OK") => "ok",
        Symbol("SUCCESS") => "ok"
    );
    return safeString(statuses, status, status)

end
function parseTransfer(self::Bybit, transfer; currency=nothing)
    currencyId = safeString(transfer, "coin");
    timestamp = safeInteger(transfer, "timestamp");
    fromAccountId = safeString(transfer, "fromAccountType");
    toAccountId = safeString(transfer, "toAccountType");
    accountIds = self.safeDict(self.options, "accountsById", defaultValue = Dict{Symbol, Any}());
    fromAccount = safeString(accountIds, fromAccountId, fromAccountId);
    toAccount = safeString(accountIds, toAccountId, toAccountId);
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "transferId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => self.parseTransferStatus(safeString(transfer, "status"))
)

end
function fetchDerivativesMarketLeverageTiers(self::Bybit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        request[Symbol("category")] = "linear";
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        request[Symbol("category")] = "inverse";
    end
    response = Base.fetch(self.publicGetV5MarketRiskLimit(extend(request, params)));
    result = self.safeDict(response, "result");
    tiers = self.safeList(result, "list");
    return self.parseMarketLeverageTiers(tiers, market = market)

end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
see: https://bybit-exchange.github.io/docs/v5/market/risk-limit

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
function fetchMarketLeverageTiers(self::Bybit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    market = self.market(symbol);
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("spot"), nothing), get(market, Symbol("option"), nothing)))
        throw(BadRequest(string(self.id, " fetchMarketLeverageTiers() symbol does not support market ", symbol)));
    end
    request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    return Base.fetch(self.fetchDerivativesMarketLeverageTiers(symbol, params = params))

end
function parseTradingFee(self::Bybit, fee; market=nothing)
    marketId = safeString(fee, "symbol");
    defaultType = functions.ccxtruthy((market != nothing)) ? get(market, Symbol("type"), nothing) : "contract";
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = defaultType);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "makerFeeRate"),
    Symbol("taker") => self.safeNumber(fee, "takerFeeRate"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
"""
fetch the trading fees for a market
see: https://bybit-exchange.github.io/docs/v5/account/fee-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Bybit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    category = nothing;
    (category, params) = self.getBybitType("fetchTradingFee", market, params = params);
    request[Symbol("category")] = category;
    response = Base.fetch(self.privateGetV5AccountFeeRate(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    fees = self.safeList(result, "list", defaultValue = []);
    first_var = self.safeDict(fees, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTradingFee(first_var, market = market)

end
"""
fetch the trading fees for multiple markets
see: https://bybit-exchange.github.io/docs/v5/account/fee-rate

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Bybit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    (type_var, params) = self.handleOptionAndParams(params, "fetchTradingFees", "type", defaultValue = "future");
    if functions.ccxtruthy(type_var == "spot")
        throw(NotSupported(string(self.id, " fetchTradingFees() is not supported for spot market")));
    end
    response = Base.fetch(self.privateGetV5AccountFeeRate(params));
    fees = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    fees = self.safeList(fees, "list", defaultValue = []);
    result = Dict{Symbol, Any}();
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
function parseDepositWithdrawFee(self::Bybit, fee; currency=nothing)
    chains = self.safeList(fee, "chains", defaultValue = []);
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
    if functions.ccxtruthy(chainsLength != 0)
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

    end
    return result

end
"""
fetch deposit and withdraw fees
see: https://bybit-exchange.github.io/docs/v5/asset/coin-info

# Arguments
- `codes`::array: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Bybit; codes=nothing, params=Dict())
    self.checkRequiredCredentials();
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetV5AssetCoinQueryInfo(params));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", defaultValue = []);
    return self.parseDepositWithdrawFees(rows, codes = codes, currencyIdKey = "coin")

end
"""
fetches historical settlement records
see: https://bybit-exchange.github.io/docs/v5/market/delivery-price

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records
- `params`::object, optional: exchange specific params
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']

# Returns
- a list of [settlement history objects]
"""
function fetchSettlementHistory(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    (type_var, params) = self.getBybitType("fetchSettlementHistory", market, params = params);
    if functions.ccxtruthy(type_var == "spot")
        throw(NotSupported(string(self.id, " fetchSettlementHistory() is not supported for spot market")));
    end
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetV5MarketDeliveryPrice(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "list", defaultValue = []);
    settlements = self.parseSettlements(data, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = safeString(market, "symbol"), since = since, limit = limit)

end
"""
fetches historical settlement records of the user
see: https://bybit-exchange.github.io/docs/v5/asset/delivery

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records
- `params`::object, optional: exchange specific params
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']

# Returns
- a list of [settlement history objects]
"""
function fetchMySettlementHistory(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    (type_var, params) = self.getBybitType("fetchMySettlementHistory", market, params = params);
    if functions.ccxtruthy(type_var == "spot")
        throw(NotSupported(string(self.id, " fetchMySettlementHistory() is not supported for spot market")));
    end
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetV5AssetDeliveryRecord(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "list", defaultValue = []);
    settlements = self.parseSettlements(data, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol = safeString(market, "symbol"), since = since, limit = limit)

end
function parseSettlement(self::Bybit, settlement, market)
    timestamp = safeInteger(settlement, "deliveryTime");
    marketId = safeString(settlement, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => settlement,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("price") => self.safeNumber(settlement, "deliveryPrice"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function parseSettlements(self::Bybit, settlements, market)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settlements)))
        push!(result, self.parseSettlement(get(settlements, i + 1, nothing), market));
        i += 1
    end
    return result

end
"""
fetch the historical volatility of an option market based on an underlying asset
see: https://bybit-exchange.github.io/docs/v5/market/iv

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.period`::int, optional: the period in days to fetch the volatility for: 7,14,21,30,60,90,180,270

# Returns
- a list of [volatility history objects]{@link https://docs.ccxt.com/?id=volatility-structure}
"""
function fetchVolatilityHistory(self::Bybit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("category") => "option",
        Symbol("baseCoin") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV5MarketHistoricalVolatility(extend(request, params)));
    volatility = self.safeList(response, "result", defaultValue = []);
    return self.parseVolatilityHistory(volatility)

end
function parseVolatilityHistory(self::Bybit, volatility)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(volatility)))
        entry = get(volatility, i + 1, nothing);
        timestamp = safeInteger(entry, "time");
        push!(result, Dict{Symbol, Any}(
    Symbol("info") => volatility,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("volatility") => self.safeNumber(entry, "value")
));
        i += 1
    end
    return result

end
"""
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://bybit-exchange.github.io/docs/api-explorer/v5/market/tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch greeks for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
function fetchGreeks(self::Bybit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("category") => "option"
    );
    response = Base.fetch(self.publicGetV5MarketTickers(extend(request, params)));
    timestamp = safeInteger(response, "time");
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "list", defaultValue = []);
    greeks = self.parseGreeks(get(data, 1, nothing), market = market);
    return extend(greeks, Dict{Symbol, Any}(
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
"""
fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://bybit-exchange.github.io/docs/api-explorer/v5/market/tickers

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch greeks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.baseCoin`::string, optional: the baseCoin of the symbol, default is BTC

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
function fetchAllGreeks(self::Bybit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    baseCoin = safeString(params, "baseCoin", "BTC");
    request = Dict{Symbol, Any}(
        Symbol("category") => "option",
        Symbol("baseCoin") => baseCoin
    );
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 1)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    response = Base.fetch(self.publicGetV5MarketTickers(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "list", defaultValue = []);
    return self.parseAllGreeks(data, symbols = symbols)

end
function parseGreeks(self::Bybit, greeks; market=nothing)
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
    Symbol("bidSize") => self.safeNumber(greeks, "bid1Size"),
    Symbol("askSize") => self.safeNumber(greeks, "ask1Size"),
    Symbol("bidImpliedVolatility") => self.safeNumber(greeks, "bid1Iv"),
    Symbol("askImpliedVolatility") => self.safeNumber(greeks, "ask1Iv"),
    Symbol("markImpliedVolatility") => self.safeNumber(greeks, "markIv"),
    Symbol("bidPrice") => self.safeNumber(greeks, "bid1Price"),
    Symbol("askPrice") => self.safeNumber(greeks, "ask1Price"),
    Symbol("markPrice") => self.safeNumber(greeks, "markPrice"),
    Symbol("lastPrice") => self.safeNumber(greeks, "lastPrice"),
    Symbol("underlyingPrice") => self.safeNumber(greeks, "underlyingPrice"),
    Symbol("info") => greeks
)

end
"""
retrieves the users liquidated positions
see: https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution

# Arguments
- `symbol`::string, optional: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
function fetchMyLiquidations(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyLiquidations", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchMyLiquidations", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    request = Dict{Symbol, Any}(
        Symbol("execType") => "BustTrade"
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchMyLiquidations", market, params = params);
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.privateGetV5ExecutionList(extend(request, params)));
    liquidations = self.addPaginationCursorToResult(response);
    return self.parseLiquidations(liquidations, market = market, since = since, limit = limit)

end
function parseLiquidation(self::Bybit, liquidation; market=nothing)
    marketId = safeString(liquidation, "symbol");
    timestamp = safeInteger(liquidation, "execTime");
    contractsString = safeString(liquidation, "execQty");
    contractSizeString = safeString(market, "contractSize");
    priceString = safeString(liquidation, "execPrice");
    baseValueString = stringMul(contractsString, contractSizeString);
    quoteValueString = stringMul(baseValueString, priceString);
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("contracts") => self.parseNumber(contractsString),
    Symbol("contractSize") => self.parseNumber(contractSizeString),
    Symbol("price") => self.parseNumber(priceString),
    Symbol("baseValue") => self.parseNumber(baseValueString),
    Symbol("quoteValue") => self.parseNumber(quoteValueString),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
function getLeverageTiersPaginated(self::Bybit; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "getLeverageTiersPaginated", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("getLeverageTiersPaginated", symbol = symbol, since = nothing, limit = nothing, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("getLeverageTiersPaginated", market = market, params = params, defaultValue = "linear");
    request = Dict{Symbol, Any}(
        Symbol("category") => subType
    );
    response = Base.fetch(self.publicGetV5MarketRiskLimit(extend(request, params)));
    result = self.addPaginationCursorToResult(response);
    first_var = self.safeDict(result, 0);
    total = length(result);
    lastIndex = total - 1;
    last_var = self.safeDict(result, lastIndex, defaultValue = Dict{Symbol, Any}());
    cursorValue = safeString(first_var, "nextPageCursor");
    last_var[Symbol("info")] = Dict{Symbol, Any}(
        Symbol("nextPageCursor") => cursorValue
    );
    result[lastIndex + 1] = last_var;
    return result

end
"""
retrieve information on the maximum leverage, for different trade sizes
see: https://bybit-exchange.github.io/docs/v5/market/risk-limit

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: market subType, ['linear', 'inverse'], default is 'linear'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
function fetchLeverageTiers(self::Bybit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    symbol = nothing;
    if functions.ccxtruthy(symbols != nothing)
        market = self.market(get(symbols, 1, nothing));
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            throw(NotSupported(string(self.id, " fetchLeverageTiers() is not supported for spot market")));
        end
        symbol = get(market, Symbol("symbol"), nothing);
    end
    data = Base.fetch(self.getLeverageTiersPaginated(symbol = symbol, params = extend(Dict{Symbol, Any}(
        Symbol("paginate") => true,
        Symbol("paginationCalls") => 50
    ), params)));
    symbols = self.marketSymbols(symbols = symbols);
    return self.parseLeverageTiers(data, symbols = symbols, marketIdKey = "symbol")

end
function parseLeverageTiers(self::Bybit, response; symbols=nothing, marketIdKey=nothing)
    tiers = Dict{Symbol, Any}();
    marketIds = self.marketIds(symbols = symbols);
    idKey = functions.ccxtruthy((marketIdKey == nothing)) ? "symbol" : marketIdKey;
    filteredResults = self.filterByArray(response, idKey, values = marketIds, indexed = false);
    grouped = groupBy(filteredResults, idKey);
    keys_var = objectKeys(grouped);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        marketId = get(keys_var, i + 1, nothing);
        entry = get(grouped, Symbol(marketId), nothing);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(entry)))
            id = safeInteger(get(entry, j + 1, nothing), "id");
            entry[j + 1][Symbol("id")] = id;
            j += 1
        end
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = "contract");
        symbol = get(market, Symbol("symbol"), nothing);
        tiers[Symbol(symbol)] = self.parseMarketLeverageTiers(sortBy(entry, "id"), market = market);
        i += 1
    end
    return tiers

end
function parseMarketLeverageTiers(self::Bybit, info; market=nothing)
    tiers = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(info)))
        tier = get(info, i + 1, nothing);
        marketId = safeString(info, "symbol");
        market = self.safeMarket(marketId = marketId);
        minNotional = self.parseNumber("0");
        if functions.ccxtruthy(i != 0)
            minNotional = self.safeNumber(get(info, i - 1 + 1, nothing), "riskLimitValue");
        end
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => safeInteger(tier, "id"),
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("currency") => get(market, Symbol("settle"), nothing),
    Symbol("minNotional") => minNotional,
    Symbol("maxNotional") => self.safeNumber(tier, "riskLimitValue"),
    Symbol("maintenanceMarginRate") => self.safeNumber(tier, "maintenanceMargin"),
    Symbol("maxLeverage") => self.safeNumber(tier, "maxLeverage"),
    Symbol("info") => tier
));
        i += 1
    end
    return tiers

end
"""
fetch the history of funding payments paid and received on this account
see: https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Bybit; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingHistory", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "nextPageCursor", cursorSent = "cursor", cursorIncrement = nothing, maxEntriesPerRequest = 100))
    end
    request = Dict{Symbol, Any}(
        Symbol("execType") => "Funding"
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchFundingHistory", market, params = params);
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = safeString(market, "id");
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    else
        request[Symbol("size")] = 100;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.privateGetV5ExecutionList(extend(request, params)));
    fundings = self.addPaginationCursorToResult(response);
    return self.parseIncomes(fundings, market = market, since = since, limit = limit)

end
function parseIncome(self::Bybit, income; market=nothing)
    marketId = safeString(income, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    code = "USDT";
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        code = get(market, Symbol("quote"), nothing);
    end
    timestamp = safeInteger(income, "execTime");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = "-", marketType = "swap"),
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(income, "execId"),
    Symbol("amount") => self.safeNumber(income, "execFee"),
    Symbol("rate") => self.safeNumber(income, "feeRate")
)

end
"""
fetches option data that is commonly found in an option chain
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [option chain structure]{@link https://docs.ccxt.com/?id=option-chain-structure}
"""
function fetchOption(self::Bybit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("category") => "option",
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV5MarketTickers(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    resultList = self.safeList(result, "list", defaultValue = []);
    chain = self.safeDict(resultList, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseOption(chain, currency = nothing, market = market)

end
"""
fetches data for an underlying asset that is commonly found in an option chain
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `code`::string: base currency to fetch an option chain for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [option chain structures]{@link https://docs.ccxt.com/?id=option-chain-structure}
"""
function fetchOptionChain(self::Bybit, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("category") => "option",
        Symbol("baseCoin") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetV5MarketTickers(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    resultList = self.safeList(result, "list", defaultValue = []);
    return self.parseOptionChain(resultList, currencyKey = nothing, symbolKey = "symbol")

end
function parseOption(self::Bybit, chain; currency=nothing, market=nothing)
    marketId = safeString(chain, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => chain,
    Symbol("currency") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("impliedVolatility") => self.safeNumber(chain, "markIv"),
    Symbol("openInterest") => self.safeNumber(chain, "openInterest"),
    Symbol("bidPrice") => self.safeNumber(chain, "bid1Price"),
    Symbol("askPrice") => self.safeNumber(chain, "ask1Price"),
    Symbol("midPrice") => nothing,
    Symbol("markPrice") => self.safeNumber(chain, "markPrice"),
    Symbol("lastPrice") => self.safeNumber(chain, "lastPrice"),
    Symbol("underlyingPrice") => self.safeNumber(chain, "underlyingPrice"),
    Symbol("change") => self.safeNumber(chain, "change24h"),
    Symbol("percentage") => nothing,
    Symbol("baseVolume") => self.safeNumber(chain, "totalVolume"),
    Symbol("quoteVolume") => nothing
)

end
"""
fetches historical positions
see: https://bybit-exchange.github.io/docs/v5/position/close-pnl

# Arguments
- `symbols`::array: a list of unified market symbols
- `since`::int, optional: timestamp in ms of the earliest position to fetch, params["until"] - since <= 7 days
- `limit`::int, optional: the maximum amount of records to fetch, default=50, max=100
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest position to fetch, params["until"] - since <= 7 days
- `params.subType`::string, optional: 'linear' or 'inverse'

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionsHistory(self::Bybit; symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    subType = nothing;
    symbolsLength = 0;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 0))
            market = self.market(get(symbols, 1, nothing));
        end
    end
    until = safeInteger(params, "until");
    (subType, params) = self.handleSubTypeAndParams("fetchPositionsHistory", market = market, params = params, defaultValue = "linear");
    params = omit(params, "until");
    request = Dict{Symbol, Any}(
        Symbol("category") => subType
    );
    if functions.ccxtruthy(@functions.ccxt_and((symbols != nothing), (symbolsLength == 1)))
        request[Symbol("symbol")] = safeString(market, "id");
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
    response = Base.fetch(self.privateGetV5PositionClosedPnl(extend(request, params)));
    result = self.safeDict(response, "result");
    rawPositions = self.safeList(result, "list");
    rawPositionsList = [];
    if functions.ccxtruthy(rawPositions != nothing)
        rawPositionsList = rawPositions;
    end
    positions = self.parsePositions(rawPositionsList, symbols = symbols, params = params);
    return self.filterBySinceLimit(positions, since = since, limit = limit)

end
"""
fetches all available currencies that can be converted
see: https://bybit-exchange.github.io/docs/v5/asset/convert/convert-coin-list

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract

# Returns
- an associative dictionary of currencies
"""
function fetchConvertCurrencies(self::Bybit; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountType = nothing;
    (enableUnifiedMargin, enableUnifiedAccount) = (Base.fetch(self.isUnifiedEnabled()));
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    accountTypeDefault = functions.ccxtruthy(isUnifiedAccount) ? "eb_convert_uta" : "eb_convert_spot";
    (accountType, params) = self.handleOptionAndParams(params, "fetchConvertCurrencies", "accountType", defaultValue = accountTypeDefault);
    request = Dict{Symbol, Any}(
        Symbol("accountType") => accountType
    );
    response = Base.fetch(self.privateGetV5AssetExchangeQueryCoinList(extend(request, params)));
    result = Dict{Symbol, Any}();
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    coins = self.safeList(data, "coins", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(coins)))
        entry = get(coins, i + 1, nothing);
        id = safeString(entry, "coin");
        disableFrom = self.safeBool(entry, "disableFrom");
        disableTo = self.safeBool(entry, "disableTo");
        inactive = (@functions.ccxt_or(disableFrom, disableTo));
        code = self.safeCurrencyCode(id);
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = Dict{Symbol, Any}(
                Symbol("info") => entry,
                Symbol("id") => id,
                Symbol("code") => code,
                Symbol("networks") => nothing,
                Symbol("type") => safeString(entry, "coinType"),
                Symbol("name") => safeString(entry, "fullName"),
                Symbol("active") => !functions.ccxtruthy(inactive),
                Symbol("deposit") => nothing,
                Symbol("withdraw") => self.safeNumber(entry, "balance"),
                Symbol("fee") => nothing,
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("amount") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(entry, "singleFromMinLimit"),
                        Symbol("max") => self.safeNumber(entry, "singleFromMaxLimit")
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
see: https://bybit-exchange.github.io/docs/v5/asset/convert/apply-quote

# Arguments
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertQuote(self::Bybit, fromCode, toCode; amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountType = nothing;
    (enableUnifiedMargin, enableUnifiedAccount) = (Base.fetch(self.isUnifiedEnabled()));
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    accountTypeDefault = functions.ccxtruthy(isUnifiedAccount) ? "eb_convert_uta" : "eb_convert_spot";
    (accountType, params) = self.handleOptionAndParams(params, "fetchConvertQuote", "accountType", defaultValue = accountTypeDefault);
    request = Dict{Symbol, Any}(
        Symbol("fromCoin") => fromCode,
        Symbol("toCoin") => toCode,
        Symbol("requestAmount") => numberToString(amount),
        Symbol("requestCoin") => fromCode,
        Symbol("accountType") => accountType
    );
    response = Base.fetch(self.privatePostV5AssetExchangeQuoteApply(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    fromCurrencyId = safeString(data, "fromCoin", fromCode);
    fromCurrency = self.currency(fromCurrencyId);
    toCurrencyId = safeString(data, "toCoin", toCode);
    toCurrency = self.currency(toCurrencyId);
    return self.parseConversion(data, fromCurrency = fromCurrency, toCurrency = toCurrency)

end
"""
convert from one currency to another
see: https://bybit-exchange.github.io/docs/v5/asset/convert/confirm-quote

# Arguments
- `id`::string: the id of the trade that you want to make
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function createConvertTrade(self::Bybit, id, fromCode, toCode; amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("quoteTxId") => id
    );
    response = Base.fetch(self.privatePostV5AssetExchangeConvertExecute(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseConversion(data)

end
"""
fetch the data for a conversion trade
see: https://bybit-exchange.github.io/docs/v5/asset/convert/get-convert-result

# Arguments
- `id`::string: the id of the trade that you want to fetch
- `code`::string, optional: the unified currency code of the conversion trade
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertTrade(self::Bybit, id; code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountType = nothing;
    (enableUnifiedMargin, enableUnifiedAccount) = (Base.fetch(self.isUnifiedEnabled()));
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    accountTypeDefault = functions.ccxtruthy(isUnifiedAccount) ? "eb_convert_uta" : "eb_convert_spot";
    (accountType, params) = self.handleOptionAndParams(params, "fetchConvertTrade", "accountType", defaultValue = accountTypeDefault);
    request = Dict{Symbol, Any}(
        Symbol("quoteTxId") => id,
        Symbol("accountType") => accountType
    );
    response = Base.fetch(self.privateGetV5AssetExchangeConvertResultQuery(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    result = self.safeDict(data, "result", defaultValue = Dict{Symbol, Any}());
    fromCurrencyId = safeString(result, "fromCoin");
    toCurrencyId = safeString(result, "toCoin");
    fromCurrency = nothing;
    toCurrency = nothing;
    if functions.ccxtruthy(fromCurrencyId != nothing)
        fromCurrency = self.currency(fromCurrencyId);
    end
    if functions.ccxtruthy(toCurrencyId != nothing)
        toCurrency = self.currency(toCurrencyId);
    end
    return self.parseConversion(result, fromCurrency = fromCurrency, toCurrency = toCurrency)

end
"""
fetch the users history of conversion trades
see: https://bybit-exchange.github.io/docs/v5/asset/convert/get-convert-history

# Arguments
- `code`::string, optional: the unified currency code
- `since`::int, optional: the earliest time in ms to fetch conversions for
- `limit`::int, optional: the maximum number of conversion structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract

# Returns
- a list of [conversion structures]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
function fetchConvertTradeHistory(self::Bybit; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.privateGetV5AssetExchangeQueryConvertHistory(extend(request, params)));
    data = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    dataList = self.safeList(data, "list", defaultValue = []);
    return self.parseConversions(dataList, code = code, fromCurrencyKey = "fromCoin", toCurrencyKey = "toCoin", since = since, limit = limit)

end
function parseConversion(self::Bybit, conversion; fromCurrency=nothing, toCurrency=nothing)
    timestamp = safeInteger2(conversion, "expiredTime", "createdAt");
    fromCoin = safeString(conversion, "fromCoin");
    fromCode = self.safeCurrencyCode(fromCoin, currency = fromCurrency);
    to = safeString(conversion, "toCoin");
    toCode = self.safeCurrencyCode(to, currency = toCurrency);
    return Dict{Symbol, Any}(
    Symbol("info") => conversion,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString2(conversion, "quoteTxId", "exchangeTxId"),
    Symbol("fromCurrency") => fromCode,
    Symbol("fromAmount") => self.safeNumber(conversion, "fromAmount"),
    Symbol("toCurrency") => toCode,
    Symbol("toAmount") => self.safeNumber(conversion, "toAmount"),
    Symbol("price") => nothing,
    Symbol("fee") => nothing
)

end
"""
fetches the long short ratio history for a unified market symbol
see: https://bybit-exchange.github.io/docs/v5/market/long-short-ratio

# Arguments
- `symbol`::string: unified symbol of the market to fetch the long short ratio for
- `timeframe`::string, optional: the period for the ratio, default is 24 hours
- `since`::int, optional: the earliest time in ms to fetch ratios for
- `limit`::int, optional: the maximum number of long short ratio structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [long short ratio structures]{@link https://docs.ccxt.com/?id=long-short-ratio-structure}
"""
function fetchLongShortRatioHistory(self::Bybit; symbol=nothing, timeframe=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchLongShortRatioHistory", market, params = params);
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "spot", type_var == "option"))
        throw(NotSupported(string(self.id, " fetchLongShortRatioHistory() only support linear and inverse markets")));
    end
    if functions.ccxtruthy(timeframe == nothing)
        timeframe = "1d";
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("period") => timeframe,
        Symbol("category") => type_var
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.publicGetV5MarketAccountRatio(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(result, "list", defaultValue = []);
    return self.parseLongShortRatioHistory(data, market = market)

end
function parseLongShortRatio(self::Bybit, info; market=nothing)
    marketId = safeString(info, "symbol");
    timestamp = self.safeIntegerOmitZero(info, "timestamp");
    longString = safeString(info, "buyRatio");
    shortString = safeString(info, "sellRatio");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timeframe") => nothing,
    Symbol("longShortRatio") => self.parseToNumeric(stringDiv(longString, shortString))
)

end
"""
fetches the auto deleveraging rank and risk percentage for a list of symbols
see: https://bybit-exchange.github.io/docs/v5/position#response-parameters

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [auto de leverage structures]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
function fetchPositionsADLRank(self::Bybit; symbols=nothing, params=Dict())
    if functions.ccxtruthy(symbols == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchPositionsADLRank() requires a symbols argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    market = self.getMarketFromSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(market != nothing)
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchPositionsADLRank", market, params = params);
    request[Symbol("category")] = type_var;
    response = Base.fetch(self.privateGetV5PositionList(extend(request, params)));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    ranks = self.safeList(result, "list", defaultValue = []);
    return self.parseADLRanks(ranks, symbols = symbols)

end
function parseADLRank(self::Bybit, info; market=nothing)
    marketId = safeString(info, "symbol");
    timestamp = safeInteger(info, "updatedTime");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("rank") => safeInteger(info, "adlRankIndicator"),
    Symbol("rating") => nothing,
    Symbol("percentage") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
fetches the margin mode of the trading pair
see: https://bybit-exchange.github.io/docs/v5/account/account-info

# Arguments
- `symbol`::string, optional: unified symbol of the market to fetch the margin mode for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginMode(self::Bybit, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    response = Base.fetch(self.privateGetV5AccountInfo(params));
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginMode(result, market = market)

end
function parseMarginMode(self::Bybit, marginMode; market=nothing)
    marginType = safeString(marginMode, "marginMode");
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("marginMode") => self.parseMarginModeType(marginType)
)

end
function parseMarginModeType(self::Bybit, marginMode)
    marginModes = Dict{Symbol, Any}(
        Symbol("ISOLATED_MARGIN") => "isolated",
        Symbol("REGULAR_MARGIN") => "cross",
        Symbol("PORTFOLIO_MARGIN") => "portfolio"
    );
    return safeString(marginModes, marginMode, marginMode)

end
function sign(self::Bybit, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing)), "/", path);
    if functions.ccxtruthy(api == "public")
        if functions.ccxtruthy(length(objectKeys(params)))
            url += string("?", self.rawencode(params));
        end
    elseif functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        isOpenapi = findfirst("openapi", url) !== nothing;
        isV3UnifiedMargin = findfirst("unified/v3", url) !== nothing;
        isV3Contract = findfirst("contract/v3", url) !== nothing;
        isV5UnifiedAccount = findfirst("v5", url) !== nothing;
        timestamp = string(self.nonce());
        if functions.ccxtruthy(isOpenapi)
            if functions.ccxtruthy(length(objectKeys(params)))
                body = json(params);
            else
                body = "{}";
            end
            payload = string(timestamp, self.apiKey, body);
            signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "hex");
            headers = Dict{Symbol, Any}(
                Symbol("Content-Type") => "application/json",
                Symbol("X-BAPI-API-KEY") => self.apiKey,
                Symbol("X-BAPI-TIMESTAMP") => timestamp,
                Symbol("X-BAPI-SIGN") => signature
            );
        elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isV3UnifiedMargin, isV3Contract), isV5UnifiedAccount))
            headers = Dict{Symbol, Any}(
                Symbol("Content-Type") => "application/json",
                Symbol("X-BAPI-API-KEY") => self.apiKey,
                Symbol("X-BAPI-TIMESTAMP") => timestamp,
                Symbol("X-BAPI-RECV-WINDOW") => string(get(self.options, Symbol("recvWindow"), nothing))
            );
            if functions.ccxtruthy(@functions.ccxt_or(isV3UnifiedMargin, isV3Contract))
                headers[Symbol("X-BAPI-SIGN-TYPE")] = "2";
            end
            query = extend(Dict{Symbol, Any}(), params);
            queryEncoded = self.rawencode(query);
            auth_base = string(timestamp, self.apiKey, get(self.options, Symbol("recvWindow"), nothing));
            authFull = nothing;
            if functions.ccxtruthy(method == "POST")
                body = json(query);
                authFull = string(auth_base, body);
            else
                authFull = string(auth_base, queryEncoded);
                url += string("?", queryEncoded);
            end
            signature = nothing;
            if functions.ccxtruthy(findfirst("PRIVATE KEY", self.secret) !== nothing)
                signature = rsa(authFull, self.secret, sha256);
            else
                signature = self.hmac(self.encode(authFull), self.encode(self.secret), sha256);
            end
            headers[Symbol("X-BAPI-SIGN")] = signature;
        else
            query = extend(params, Dict{Symbol, Any}(
                Symbol("api_key") => self.apiKey,
                Symbol("recv_window") => get(self.options, Symbol("recvWindow"), nothing),
                Symbol("timestamp") => timestamp
            ));
            sortedQuery = keysort(query);
            auth = self.rawencode(sortedQuery, true);
            signature = nothing;
            if functions.ccxtruthy(findfirst("PRIVATE KEY", self.secret) !== nothing)
                signature = rsa(auth, self.secret, sha256);
            else
                signature = self.hmac(self.encode(auth), self.encode(self.secret), sha256);
            end
            if functions.ccxtruthy(method == "POST")
                isSpot = findfirst("spot", url) !== nothing;
                extendedQuery = extend(query, Dict{Symbol, Any}(
                    Symbol("sign") => signature
                ));
                if functions.ccxtruthy(isSpot)
                    body = self.urlencode(extendedQuery);
                    headers = Dict{Symbol, Any}(
                        Symbol("Content-Type") => "application/x-www-form-urlencoded"
                    );
                else
                    body = json(extendedQuery);
                    headers = Dict{Symbol, Any}(
                        Symbol("Content-Type") => "application/json"
                    );
                end
            else
                url += string("?", self.rawencode(sortedQuery, true));
                url += string("&sign=", signature);
            end
        end
    end
    if functions.ccxtruthy(method == "POST")
        brokerId = safeString(self.options, "brokerId");
        if functions.ccxtruthy(brokerId != nothing)
            headers = functions.ccxtruthy((headers == nothing)) ? Dict{Symbol, Any}() : headers;
            headers[Symbol("Referer")] = brokerId;
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Bybit, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    errorCode = safeString2(response, "ret_code", "retCode");
    if functions.ccxtruthy(errorCode != "0")
        if functions.ccxtruthy(errorCode == "30084")
                return nothing
        end
        feedback = nothing;
        if functions.ccxtruthy(@functions.ccxt_and(errorCode == "10005", findfirst("order", url) === nothing))
            feedback = string(self.id, " private api uses /user/v3/private/query-api to check if you have a unified account. The API key of user id must own one of permissions: \"Account Transfer\", \"Subaccount Transfer\", \"Withdrawal\" ", body);
        else
            feedback = string(self.id, " ", body);
        end
        if functions.ccxtruthy(findfirst("Withdraw address chain or destination tag are not equal", body) !== nothing)
            feedback = string(feedback, "; You might also need to ensure the address is whitelisted");
        end
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bybit, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetSpotV3PublicSymbols(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/symbols"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicQuoteDepth(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/depth"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicQuoteDepthMerged(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/depth/merged"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicQuoteTrades(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicQuoteKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/kline"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicQuoteTicker24hr(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/ticker/24hr"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicQuoteTickerPrice(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/ticker/price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicQuoteTickerBookTicker(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/ticker/bookTicker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicServerTime(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/server-time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/infos"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicMarginProductInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/margin-product-infos"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSpotV3PublicMarginEnsureTokens(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/margin-ensure-tokens"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV3PublicTime(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v3/public/time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetContractV3PublicCopytradingSymbolList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/public/copytrading/symbol/list"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicOrderBookL2(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/order-book/L2"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/kline"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicTickers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/tickers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicInstrumentsInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/instruments-info"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicMarkPriceKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/mark-price-kline"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicIndexPriceKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/index-price-kline"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicFundingHistoryFundingRate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/funding/history-funding-rate"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicRiskLimitList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/risk-limit/list"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicDeliveryPrice(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/delivery-price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicRecentTrade(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/recent-trade"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicOpenInterest(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/open-interest"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetDerivativesV3PublicInsurance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/insurance"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5AnnouncementsIndex(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/announcements/index"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5SystemStatus(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/system/status"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketTime(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/kline"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketMarkPriceKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/mark-price-kline"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketIndexPriceKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/index-price-kline"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketPremiumIndexPriceKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/premium-index-price-kline"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketInstrumentsInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/instruments-info"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketOrderbook(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/orderbook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketRpiOrderbook(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/rpi_orderbook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketFullOrderbook(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/full_orderbook"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketTickers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/tickers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketFundingHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/funding/history"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketRecentTrade(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/recent-trade"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketOpenInterest(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/open-interest"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketHistoricalVolatility(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/historical-volatility"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketInsurance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/insurance"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketRiskLimit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/risk-limit"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketDeliveryPrice(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/delivery-price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketNewDeliveryPrice(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/new-delivery-price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketAccountRatio(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/account-ratio"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketIndexPriceComponents(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/index-price-components"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketPriceLimit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/price-limit"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketAdlAlert(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/adlAlert"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5MarketFeeGroupInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/fee-group-info"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5SpotLeverTokenInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-lever-token/info"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5SpotLeverTokenReference(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-lever-token/reference"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5SpotMarginTradeData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/data"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5SpotMarginTradeCollateral(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/collateral"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5SpotCrossMarginTradeData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/data"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5SpotCrossMarginTradePledgeToken(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/pledge-token"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5SpotCrossMarginTradeBorrowToken(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/borrow-token"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5CryptoLoanCollateralData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/collateral-data"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5CryptoLoanLoanableData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/loanable-data"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5CryptoLoanCommonLoanableData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/loanable-data"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5CryptoLoanCommonCollateralData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/collateral-data"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5CryptoLoanFixedSupplyOrderQuote(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/supply-order-quote"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5CryptoLoanFixedBorrowOrderQuote(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/borrow-order-quote"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5InsLoanProductInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/product-infos"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5InsLoanEnsureTokensConvert(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/ensure-tokens-convert"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetV5EarnProduct(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/product"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5MarketInstrumentsInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/instruments-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV2PrivateWalletFundRecords(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v2/private/wallet/fund/records"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateOpenOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/open-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateHistoryOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/history-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateMyTrades(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/my-trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/account"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateReference(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/reference"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateCrossMarginOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateCrossMarginAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-account"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateCrossMarginLoanInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-loan-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateCrossMarginRepayHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-repay-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateMarginLoanInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/margin-loan-infos"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateMarginRepaidInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/margin-repaid-infos"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSpotV3PrivateMarginLtv(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/margin-ltv"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateTransferInterTransferListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/inter-transfer/list/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateTransferSubMemberListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/sub-member/list/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateTransferSubMemberTransferListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/sub-member-transfer/list/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateTransferUniversalTransferListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/universal-transfer/list/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateCoinInfoQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/coin-info/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateDepositAddressQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/deposit/address/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivateCopytradingOrderList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/order/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivateCopytradingPositionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/position/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivateCopytradingWalletBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/wallet/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivatePositionLimitInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/limit-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivateOrderUnfilledOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/unfilled-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivateOrderList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivatePositionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivateExecutionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/execution/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivatePositionClosedPnl(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/closed-pnl"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivateAccountWalletBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/account/wallet/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivateAccountFeeRate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/account/fee-rate"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetContractV3PrivateAccountWalletFundRecords(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/account/wallet/fund-records"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivateOrderUnfilledOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/unfilled-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivateOrderList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivatePositionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/position/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivateExecutionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/execution/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivateDeliveryRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/delivery-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivateSettlementRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/settlement-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivateAccountWalletBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/wallet/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivateAccountTransactionLog(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/transaction-log"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivateAccountBorrowHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/borrow-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivateAccountBorrowRate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/borrow-rate"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUnifiedV3PrivateAccountInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserV3PrivateFrozenSubMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/frozen-sub-member"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserV3PrivateQuerySubMembers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/query-sub-members"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserV3PrivateQueryApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/query-api"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserV3PrivateGetMemberType(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/get-member-type"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateTransferTransferCoinListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/transfer-coin/list/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateTransferAccountCoinBalanceQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/account-coin/balance/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateTransferAccountCoinsBalanceQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/account-coins/balance/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateTransferAssetInfoQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/asset-info/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PublicDepositAllowedDepositListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/public/deposit/allowed-deposit-list/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateDepositRecordQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/deposit/record/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAssetV3PrivateWithdrawRecordQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/withdraw/record/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5OrderRealtime(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/realtime"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5OrderHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5OrderSpotBorrowCheck(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/spot-borrow-check"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PositionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5ExecutionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/execution/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PositionClosedPnl(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/closed-pnl"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PositionGetClosedPositions(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/get-closed-positions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PositionMoveHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/move-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PositionSymbolInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/symbol-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PreUpgradeOrderHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/order/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PreUpgradeExecutionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/execution/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PreUpgradePositionClosedPnl(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/position/closed-pnl"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PreUpgradeAccountTransactionLog(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/account/transaction-log"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PreUpgradeAssetDeliveryRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/asset/delivery-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5PreUpgradeAssetSettlementRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/asset/settlement-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountWalletBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/wallet-balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountBorrowHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/borrow-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountInstrumentsInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/instruments-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountCollateralInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/collateral-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountOptionAssetInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/option-asset-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetCoinGreeks(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/coin-greeks"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountFeeRate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/fee-rate"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountTransactionLog(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/transaction-log"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountContractTransactionLog(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/contract-transaction-log"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountQueryDcpInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/query-dcp-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountUserSettingConfig(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/user-setting-config"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountPayInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/pay-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountTradeInfoForAnalysis(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/trade-info-for-analysis"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountSmpGroup(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/smp-group"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountMmpState(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/mmp-state"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AccountWithdrawal(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/withdrawal"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetAssetOverview(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/asset-overview"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetExchangeQueryCoinList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/query-coin-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetExchangeConvertResultQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/convert-result-query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetExchangeQueryConvertHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/query-convert-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetExchangeOrderRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/order-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetFundinghistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/fundinghistory"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetPortfolioMargin(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/portfolio-margin"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetTotalMembersAssets(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/total-members-assets"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetDeliveryRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/delivery-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetSettlementRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/settlement-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetTransferQueryAssetInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-asset-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetTransferQueryAccountCoinsBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-account-coins-balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetTransferQueryAccountCoinBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-account-coin-balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetTransferQueryTransferCoinList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-transfer-coin-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetTransferQueryInterTransferList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-inter-transfer-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetTransferQuerySubMemberList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-sub-member-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetTransferQueryUniversalTransferList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-universal-transfer-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetDepositQueryAllowedList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-allowed-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetDepositQueryRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetDepositQuerySubMemberRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-sub-member-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetDepositQueryInternalRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-internal-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetDepositQueryAddress(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-address"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetDepositQuerySubMemberAddress(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-sub-member-address"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetCoinQueryInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/coin/query-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetWithdrawQueryAddress(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/query-address"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetWithdrawQueryRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/query-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetWithdrawWithdrawableAmount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/withdrawable-amount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetWithdrawVaspList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/vasp/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetCovertSmallBalanceList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/covert/small-balance-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetCovertSmallBalanceHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/covert/small-balance-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetConvertSmallBalanceList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/convert/small-balance-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AssetConvertSmallBalanceHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/convert/small-balance-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5FiatQueryCoinList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/query-coin-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5FiatReferencePrice(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/reference-price"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5FiatTradeQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/trade-query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5FiatQueryTradeHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/query-trade-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5FiatBalanceQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/balance-query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5UserQuerySubMembers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/query-sub-members"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5UserQueryApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/query-api"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5UserSubApikeys(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/sub-apikeys"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5UserGetMemberType(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/get-member-type"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5UserAffCustomerInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/aff-customer-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5UserDelSubmember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/del-submember"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5UserSubmembers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/submembers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5UserEscrowSubMembers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/escrow_sub_members"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5UserInvitationReferrals(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/invitation/referrals"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AffiliateAffUserList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/affiliate/aff-user-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5AffiliateAffiliateSubList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/affiliate/affiliate-sub-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotLeverTokenOrderRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-lever-token/order-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeFlexibleAvailableInventory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/flexible-available-inventory"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeInterestRateHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/interest-rate-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeState(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/state"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeMaxBorrowable(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/max-borrowable"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradePositionTiers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/position-tiers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeCoinstate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/coinstate"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeCurrencyData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/currency-data"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeFixedborrowContractInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/fixedborrow-contract-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeFixedborrowOrderInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/fixedborrow-order-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeFixedborrowOrderQuote(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/fixedborrow-order-quote"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeLiability(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/liability"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeRepaymentAvailableAmount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/repayment-available-amount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotMarginTradeGetAutoRepayMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/get-auto-repay-mode"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotCrossMarginTradeLoanInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/loan-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotCrossMarginTradeAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/account"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotCrossMarginTradeOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5SpotCrossMarginTradeRepayHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/repay-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanBorrowableCollateralisableNumber(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/borrowable-collateralisable-number"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanOngoingOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/ongoing-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanRepaymentHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/repayment-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanBorrowHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/borrow-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanMaxCollateralAmount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/max-collateral-amount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanAdjustmentHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/adjustment-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanCommonMaxCollateralAmount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/max-collateral-amount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanCommonAdjustmentHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/adjustment-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanCommonPosition(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/position"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanFlexibleOngoingCoin(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/ongoing-coin"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanFlexibleBorrowHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/borrow-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanFlexibleRepaymentHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/repayment-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanFixedBorrowContractInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/borrow-contract-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanFixedSupplyContractInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/supply-contract-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanFixedBorrowOrderInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/borrow-order-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanFixedRenewInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/renew-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanFixedSupplyOrderInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/supply-order-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5CryptoLoanFixedRepaymentHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/repayment-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5InsLoanProductInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/product-infos"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5InsLoanEnsureTokens(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/ensure-tokens"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5InsLoanEnsureTokensConvert(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/ensure-tokens-convert"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5InsLoanLoanOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/loan-order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5InsLoanRepaidHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/repaid-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5InsLoanLtv(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/ltv"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5InsLoanLtvConvert(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/ltv-convert"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5InsLoanCoinDeltaAmount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/coin-delta-amount"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5LendingInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5LendingHistoryOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/history-order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5LendingAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/account"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5BrokerEarningRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/earning-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5BrokerEarningsInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/earnings-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5BrokerAccountInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/account-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5BrokerAssetQuerySubMemberDepositRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/asset/query-sub-member-deposit-record"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5EarnProduct(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/product"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5EarnOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5EarnPosition(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/position"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5EarnYield(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/yield"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetV5EarnHourlyYield(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/hourly-yield"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSpotV3PrivateOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSpotV3PrivateCancelOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cancel-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSpotV3PrivateCancelOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cancel-orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSpotV3PrivateCancelOrdersByIds(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cancel-orders-by-ids"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSpotV3PrivatePurchase(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/purchase"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSpotV3PrivateRedeem(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/redeem"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSpotV3PrivateCrossMarginLoan(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-loan"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSpotV3PrivateCrossMarginRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAssetV3PrivateTransferInterTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/inter-transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAssetV3PrivateWithdrawCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/withdraw/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAssetV3PrivateWithdrawCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/withdraw/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAssetV3PrivateTransferSubMemberTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/sub-member-transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAssetV3PrivateTransferTransferSubMemberSave(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/transfer-sub-member-save"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAssetV3PrivateTransferUniversalTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/universal-transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserV3PrivateCreateSubMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/create-sub-member"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserV3PrivateCreateSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/create-sub-api"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserV3PrivateUpdateApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/update-api"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserV3PrivateDeleteApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/delete-api"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserV3PrivateUpdateSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/update-sub-api"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUserV3PrivateDeleteSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/delete-sub-api"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateCopytradingOrderCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/order/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateCopytradingOrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/order/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateCopytradingOrderClose(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/order/close"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateCopytradingPositionClose(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/position/close"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateCopytradingPositionSetLeverage(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/position/set-leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateCopytradingWalletTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/wallet/transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateCopytradingOrderTradingStop(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/order/trading-stop"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateOrderCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateOrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateOrderCancelAll(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/cancel-all"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateOrderReplace(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/replace"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivatePositionSetAutoAddMargin(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/set-auto-add-margin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivatePositionSwitchIsolated(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/switch-isolated"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivatePositionSwitchMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/switch-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivatePositionSwitchTpslMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/switch-tpsl-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivatePositionSetLeverage(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/set-leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivatePositionTradingStop(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/trading-stop"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivatePositionSetRiskLimit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/set-risk-limit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostContractV3PrivateAccountSetMarginMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/account/setMarginMode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivateOrderCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivateOrderReplace(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/replace"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivateOrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivateOrderCreateBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/create-batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivateOrderReplaceBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/replace-batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivateOrderCancelBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/cancel-batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivateOrderCancelAll(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/cancel-all"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivatePositionSetLeverage(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/position/set-leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivatePositionTpslSwitchMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/position/tpsl/switch-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivatePositionSetRiskLimit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/position/set-risk-limit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivatePositionTradingStop(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/position/trading-stop"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivateAccountUpgradeUnifiedAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/upgrade-unified-account"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostUnifiedV3PrivateAccountSetMarginMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/setMarginMode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFhtComplianceTaxV3PrivateRegistertime(self::Bybit, params=Dict(), context=Dict())
    return request(self, "fht/compliance/tax/v3/private/registertime"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFhtComplianceTaxV3PrivateCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "fht/compliance/tax/v3/private/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFhtComplianceTaxV3PrivateStatus(self::Bybit, params=Dict(), context=Dict())
    return request(self, "fht/compliance/tax/v3/private/status"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostFhtComplianceTaxV3PrivateUrl(self::Bybit, params=Dict(), context=Dict())
    return request(self, "fht/compliance/tax/v3/private/url"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5OrderCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5OrderAmend(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/amend"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5OrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5OrderCancelAll(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/cancel-all"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5OrderCreateBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/create-batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5OrderAmendBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/amend-batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5OrderCancelBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/cancel-batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5OrderDisconnectedCancelAll(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/disconnected-cancel-all"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5OrderPreCheck(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/pre-check"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5PositionSetLeverage(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/set-leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5PositionSwitchIsolated(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/switch-isolated"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5PositionSetTpslMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/set-tpsl-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5PositionSwitchMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/switch-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5PositionSetRiskLimit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/set-risk-limit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5PositionTradingStop(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/trading-stop"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5PositionSetAutoAddMargin(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/set-auto-add-margin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5PositionAddMargin(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/add-margin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5PositionMovePositions(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/move-positions"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5PositionConfirmPendingMmr(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/confirm-pending-mmr"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountUpgradeToUta(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/upgrade-to-uta"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountQuickRepayment(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/quick-repayment"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountSetMarginMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-margin-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountSetHedgingMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-hedging-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountMmpModify(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/mmp-modify"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountMmpReset(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/mmp-reset"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountBorrow(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/borrow"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountNoConvertRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/no-convert-repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountSetLimitPxAction(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-limit-px-action"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountSetDeltaMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-delta-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetExchangeQuoteApply(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/quote-apply"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetExchangeConvertExecute(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/convert-execute"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetTransferInterTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/inter-transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetTransferSaveTransferSubMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/save-transfer-sub-member"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetTransferUniversalTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/universal-transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetDepositDepositToAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/deposit-to-account"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetTravelRuleDepositSubmit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/travel-rule/deposit/submit"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetWithdrawCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetWithdrawCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetCovertGetQuote(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/covert/get-quote"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AssetCovertSmallBalanceExecute(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/covert/small-balance-execute"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5FiatQuoteApply(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/quote-apply"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5FiatTradeExecute(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/trade-execute"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5UserCreateSubMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/create-sub-member"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5UserCreateSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/create-sub-api"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5UserFrozenSubMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/frozen-sub-member"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5UserUpdateApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/update-api"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5UserUpdateSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/update-sub-api"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5UserDeleteApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/delete-api"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5UserDeleteSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/delete-sub-api"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5UserAgreement(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/agreement"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5UserCreateDemoMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/create-demo-member"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5SpotLeverTokenPurchase(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-lever-token/purchase"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5SpotLeverTokenRedeem(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-lever-token/redeem"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5SpotMarginTradeSwitchMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/switch-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5SpotMarginTradeSetLeverage(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/set-leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5SpotMarginTradeSetAutoRepayMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/set-auto-repay-mode"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5SpotMarginTradeFixedborrow(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/fixedborrow"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5SpotMarginTradeFixedborrowRenew(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/fixedborrow-renew"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5SpotCrossMarginTradeLoan(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/loan"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5SpotCrossMarginTradeRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5SpotCrossMarginTradeSwitch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/switch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanBorrow(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/borrow"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanAdjustLtv(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/adjust-ltv"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanCommonAdjustLtv(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/adjust-ltv"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanCommonMaxLoan(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/max-loan"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanFlexibleBorrow(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/borrow"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanFlexibleRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanFlexibleRepayCollateral(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/repay-collateral"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanFixedBorrow(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/borrow"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanFixedRenew(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/renew"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanFixedSupply(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/supply"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanFixedBorrowOrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/borrow-order-cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanFixedSupplyOrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/supply-order-cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanFixedFullyRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/fully-repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5CryptoLoanFixedRepayCollateral(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/repay-collateral"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5InsLoanAssociationUid(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/association-uid"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5InsLoanRepayLoan(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/repay-loan"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5LendingPurchase(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/purchase"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5LendingRedeem(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/redeem"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5LendingRedeemCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/redeem-cancel"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountSetCollateralSwitch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-collateral-switch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountSetCollateralSwitchBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-collateral-switch-batch"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5AccountDemoApplyMoney(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/demo-apply-money"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5BrokerAwardInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/award/info"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5BrokerAwardDistributeAward(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/award/distribute-award"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5BrokerAwardDistributionRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/award/distribution-record"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostV5EarnPlaceOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/place-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Bybit(; kwargs...)
    inst = Bybit(Exchange(), describe, enableDemoTrading, nonce, addPaginationCursorToResult, isUnifiedEnabled, upgradeUnifiedTradeAccount, createExpiredOptionMarket, safeMarket, getBybitType, getAmount, getPrice, getCost, fetchStatus, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, fetchSpotMarkets, fetchFutureMarkets, fetchOptionMarkets, parseTicker, fetchTicker, fetchTickers, fetchBidsAsks, parseOHLCV, fetchOHLCV, parseFundingRate, fetchFundingRates, fetchFundingRateHistory, parseTrade, fetchTrades, fetchOrderBook, parseBalance, fetchBalance, parseOrderStatus, parseTimeInForce, parseOrder, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, createOrder, createOrderRequest, createOrders, editOrderRequest, editOrder, editOrders, cancelOrderRequest, cancelOrder, cancelOrders, cancelAllOrdersAfter, cancelOrdersForSymbols, cancelAllOrders, fetchOrderClassic, fetchOrder, fetchOrders, fetchOrdersClassic, fetchClosedOrder, fetchOpenOrder, fetchCanceledAndClosedOrders, fetchClosedOrders, fetchCanceledOrders, fetchOpenOrders, fetchOrderTrades, fetchMyTrades, parseDepositAddress, fetchDepositAddressesByNetwork, fetchDepositAddress, fetchDeposits, fetchWithdrawals, parseTransactionStatus, parseTransaction, fetchLedger, parseLedgerEntry, parseLedgerEntryType, withdraw, fetchPosition, fetchPositions, parsePosition, fetchLeverage, parseLeverage, setMarginMode, setLeverage, setPositionMode, fetchDerivativesOpenInterestHistory, fetchOpenInterest, fetchOpenInterestHistory, parseOpenInterest, fetchCrossBorrowRate, parseBorrowRate, fetchBorrowInterest, fetchBorrowRateHistory, parseBorrowInterest, transfer, fetchTransfers, borrowCrossMargin, repayCrossMargin, parseMarginLoan, parseTransferStatus, parseTransfer, fetchDerivativesMarketLeverageTiers, fetchMarketLeverageTiers, parseTradingFee, fetchTradingFee, fetchTradingFees, parseDepositWithdrawFee, fetchDepositWithdrawFees, fetchSettlementHistory, fetchMySettlementHistory, parseSettlement, parseSettlements, fetchVolatilityHistory, parseVolatilityHistory, fetchGreeks, fetchAllGreeks, parseGreeks, fetchMyLiquidations, parseLiquidation, getLeverageTiersPaginated, fetchLeverageTiers, parseLeverageTiers, parseMarketLeverageTiers, fetchFundingHistory, parseIncome, fetchOption, fetchOptionChain, parseOption, fetchPositionsHistory, fetchConvertCurrencies, fetchConvertQuote, createConvertTrade, fetchConvertTrade, fetchConvertTradeHistory, parseConversion, fetchLongShortRatioHistory, parseLongShortRatio, fetchPositionsADLRank, parseADLRank, fetchMarginMode, parseMarginMode, parseMarginModeType, sign, handleErrors, publicGetSpotV3PublicSymbols, publicGetSpotV3PublicQuoteDepth, publicGetSpotV3PublicQuoteDepthMerged, publicGetSpotV3PublicQuoteTrades, publicGetSpotV3PublicQuoteKline, publicGetSpotV3PublicQuoteTicker24hr, publicGetSpotV3PublicQuoteTickerPrice, publicGetSpotV3PublicQuoteTickerBookTicker, publicGetSpotV3PublicServerTime, publicGetSpotV3PublicInfos, publicGetSpotV3PublicMarginProductInfos, publicGetSpotV3PublicMarginEnsureTokens, publicGetV3PublicTime, publicGetContractV3PublicCopytradingSymbolList, publicGetDerivativesV3PublicOrderBookL2, publicGetDerivativesV3PublicKline, publicGetDerivativesV3PublicTickers, publicGetDerivativesV3PublicInstrumentsInfo, publicGetDerivativesV3PublicMarkPriceKline, publicGetDerivativesV3PublicIndexPriceKline, publicGetDerivativesV3PublicFundingHistoryFundingRate, publicGetDerivativesV3PublicRiskLimitList, publicGetDerivativesV3PublicDeliveryPrice, publicGetDerivativesV3PublicRecentTrade, publicGetDerivativesV3PublicOpenInterest, publicGetDerivativesV3PublicInsurance, publicGetV5AnnouncementsIndex, publicGetV5SystemStatus, publicGetV5MarketTime, publicGetV5MarketKline, publicGetV5MarketMarkPriceKline, publicGetV5MarketIndexPriceKline, publicGetV5MarketPremiumIndexPriceKline, publicGetV5MarketInstrumentsInfo, publicGetV5MarketOrderbook, publicGetV5MarketRpiOrderbook, publicGetV5MarketFullOrderbook, publicGetV5MarketTickers, publicGetV5MarketFundingHistory, publicGetV5MarketRecentTrade, publicGetV5MarketOpenInterest, publicGetV5MarketHistoricalVolatility, publicGetV5MarketInsurance, publicGetV5MarketRiskLimit, publicGetV5MarketDeliveryPrice, publicGetV5MarketNewDeliveryPrice, publicGetV5MarketAccountRatio, publicGetV5MarketIndexPriceComponents, publicGetV5MarketPriceLimit, publicGetV5MarketAdlAlert, publicGetV5MarketFeeGroupInfo, publicGetV5SpotLeverTokenInfo, publicGetV5SpotLeverTokenReference, publicGetV5SpotMarginTradeData, publicGetV5SpotMarginTradeCollateral, publicGetV5SpotCrossMarginTradeData, publicGetV5SpotCrossMarginTradePledgeToken, publicGetV5SpotCrossMarginTradeBorrowToken, publicGetV5CryptoLoanCollateralData, publicGetV5CryptoLoanLoanableData, publicGetV5CryptoLoanCommonLoanableData, publicGetV5CryptoLoanCommonCollateralData, publicGetV5CryptoLoanFixedSupplyOrderQuote, publicGetV5CryptoLoanFixedBorrowOrderQuote, publicGetV5InsLoanProductInfos, publicGetV5InsLoanEnsureTokensConvert, publicGetV5EarnProduct, privateGetV5MarketInstrumentsInfo, privateGetV2PrivateWalletFundRecords, privateGetSpotV3PrivateOrder, privateGetSpotV3PrivateOpenOrders, privateGetSpotV3PrivateHistoryOrders, privateGetSpotV3PrivateMyTrades, privateGetSpotV3PrivateAccount, privateGetSpotV3PrivateReference, privateGetSpotV3PrivateRecord, privateGetSpotV3PrivateCrossMarginOrders, privateGetSpotV3PrivateCrossMarginAccount, privateGetSpotV3PrivateCrossMarginLoanInfo, privateGetSpotV3PrivateCrossMarginRepayHistory, privateGetSpotV3PrivateMarginLoanInfos, privateGetSpotV3PrivateMarginRepaidInfos, privateGetSpotV3PrivateMarginLtv, privateGetAssetV3PrivateTransferInterTransferListQuery, privateGetAssetV3PrivateTransferSubMemberListQuery, privateGetAssetV3PrivateTransferSubMemberTransferListQuery, privateGetAssetV3PrivateTransferUniversalTransferListQuery, privateGetAssetV3PrivateCoinInfoQuery, privateGetAssetV3PrivateDepositAddressQuery, privateGetContractV3PrivateCopytradingOrderList, privateGetContractV3PrivateCopytradingPositionList, privateGetContractV3PrivateCopytradingWalletBalance, privateGetContractV3PrivatePositionLimitInfo, privateGetContractV3PrivateOrderUnfilledOrders, privateGetContractV3PrivateOrderList, privateGetContractV3PrivatePositionList, privateGetContractV3PrivateExecutionList, privateGetContractV3PrivatePositionClosedPnl, privateGetContractV3PrivateAccountWalletBalance, privateGetContractV3PrivateAccountFeeRate, privateGetContractV3PrivateAccountWalletFundRecords, privateGetUnifiedV3PrivateOrderUnfilledOrders, privateGetUnifiedV3PrivateOrderList, privateGetUnifiedV3PrivatePositionList, privateGetUnifiedV3PrivateExecutionList, privateGetUnifiedV3PrivateDeliveryRecord, privateGetUnifiedV3PrivateSettlementRecord, privateGetUnifiedV3PrivateAccountWalletBalance, privateGetUnifiedV3PrivateAccountTransactionLog, privateGetUnifiedV3PrivateAccountBorrowHistory, privateGetUnifiedV3PrivateAccountBorrowRate, privateGetUnifiedV3PrivateAccountInfo, privateGetUserV3PrivateFrozenSubMember, privateGetUserV3PrivateQuerySubMembers, privateGetUserV3PrivateQueryApi, privateGetUserV3PrivateGetMemberType, privateGetAssetV3PrivateTransferTransferCoinListQuery, privateGetAssetV3PrivateTransferAccountCoinBalanceQuery, privateGetAssetV3PrivateTransferAccountCoinsBalanceQuery, privateGetAssetV3PrivateTransferAssetInfoQuery, privateGetAssetV3PublicDepositAllowedDepositListQuery, privateGetAssetV3PrivateDepositRecordQuery, privateGetAssetV3PrivateWithdrawRecordQuery, privateGetV5OrderRealtime, privateGetV5OrderHistory, privateGetV5OrderSpotBorrowCheck, privateGetV5PositionList, privateGetV5ExecutionList, privateGetV5PositionClosedPnl, privateGetV5PositionGetClosedPositions, privateGetV5PositionMoveHistory, privateGetV5PositionSymbolInfo, privateGetV5PreUpgradeOrderHistory, privateGetV5PreUpgradeExecutionList, privateGetV5PreUpgradePositionClosedPnl, privateGetV5PreUpgradeAccountTransactionLog, privateGetV5PreUpgradeAssetDeliveryRecord, privateGetV5PreUpgradeAssetSettlementRecord, privateGetV5AccountWalletBalance, privateGetV5AccountBorrowHistory, privateGetV5AccountInstrumentsInfo, privateGetV5AccountCollateralInfo, privateGetV5AccountOptionAssetInfo, privateGetV5AssetCoinGreeks, privateGetV5AccountFeeRate, privateGetV5AccountInfo, privateGetV5AccountTransactionLog, privateGetV5AccountContractTransactionLog, privateGetV5AccountQueryDcpInfo, privateGetV5AccountUserSettingConfig, privateGetV5AccountPayInfo, privateGetV5AccountTradeInfoForAnalysis, privateGetV5AccountSmpGroup, privateGetV5AccountMmpState, privateGetV5AccountWithdrawal, privateGetV5AssetAssetOverview, privateGetV5AssetExchangeQueryCoinList, privateGetV5AssetExchangeConvertResultQuery, privateGetV5AssetExchangeQueryConvertHistory, privateGetV5AssetExchangeOrderRecord, privateGetV5AssetFundinghistory, privateGetV5AssetPortfolioMargin, privateGetV5AssetTotalMembersAssets, privateGetV5AssetDeliveryRecord, privateGetV5AssetSettlementRecord, privateGetV5AssetTransferQueryAssetInfo, privateGetV5AssetTransferQueryAccountCoinsBalance, privateGetV5AssetTransferQueryAccountCoinBalance, privateGetV5AssetTransferQueryTransferCoinList, privateGetV5AssetTransferQueryInterTransferList, privateGetV5AssetTransferQuerySubMemberList, privateGetV5AssetTransferQueryUniversalTransferList, privateGetV5AssetDepositQueryAllowedList, privateGetV5AssetDepositQueryRecord, privateGetV5AssetDepositQuerySubMemberRecord, privateGetV5AssetDepositQueryInternalRecord, privateGetV5AssetDepositQueryAddress, privateGetV5AssetDepositQuerySubMemberAddress, privateGetV5AssetCoinQueryInfo, privateGetV5AssetWithdrawQueryAddress, privateGetV5AssetWithdrawQueryRecord, privateGetV5AssetWithdrawWithdrawableAmount, privateGetV5AssetWithdrawVaspList, privateGetV5AssetCovertSmallBalanceList, privateGetV5AssetCovertSmallBalanceHistory, privateGetV5AssetConvertSmallBalanceList, privateGetV5AssetConvertSmallBalanceHistory, privateGetV5FiatQueryCoinList, privateGetV5FiatReferencePrice, privateGetV5FiatTradeQuery, privateGetV5FiatQueryTradeHistory, privateGetV5FiatBalanceQuery, privateGetV5UserQuerySubMembers, privateGetV5UserQueryApi, privateGetV5UserSubApikeys, privateGetV5UserGetMemberType, privateGetV5UserAffCustomerInfo, privateGetV5UserDelSubmember, privateGetV5UserSubmembers, privateGetV5UserEscrowSubMembers, privateGetV5UserInvitationReferrals, privateGetV5AffiliateAffUserList, privateGetV5AffiliateAffiliateSubList, privateGetV5SpotLeverTokenOrderRecord, privateGetV5SpotMarginTradeFlexibleAvailableInventory, privateGetV5SpotMarginTradeInterestRateHistory, privateGetV5SpotMarginTradeState, privateGetV5SpotMarginTradeMaxBorrowable, privateGetV5SpotMarginTradePositionTiers, privateGetV5SpotMarginTradeCoinstate, privateGetV5SpotMarginTradeCurrencyData, privateGetV5SpotMarginTradeFixedborrowContractInfo, privateGetV5SpotMarginTradeFixedborrowOrderInfo, privateGetV5SpotMarginTradeFixedborrowOrderQuote, privateGetV5SpotMarginTradeLiability, privateGetV5SpotMarginTradeRepaymentAvailableAmount, privateGetV5SpotMarginTradeGetAutoRepayMode, privateGetV5SpotCrossMarginTradeLoanInfo, privateGetV5SpotCrossMarginTradeAccount, privateGetV5SpotCrossMarginTradeOrders, privateGetV5SpotCrossMarginTradeRepayHistory, privateGetV5CryptoLoanBorrowableCollateralisableNumber, privateGetV5CryptoLoanOngoingOrders, privateGetV5CryptoLoanRepaymentHistory, privateGetV5CryptoLoanBorrowHistory, privateGetV5CryptoLoanMaxCollateralAmount, privateGetV5CryptoLoanAdjustmentHistory, privateGetV5CryptoLoanCommonMaxCollateralAmount, privateGetV5CryptoLoanCommonAdjustmentHistory, privateGetV5CryptoLoanCommonPosition, privateGetV5CryptoLoanFlexibleOngoingCoin, privateGetV5CryptoLoanFlexibleBorrowHistory, privateGetV5CryptoLoanFlexibleRepaymentHistory, privateGetV5CryptoLoanFixedBorrowContractInfo, privateGetV5CryptoLoanFixedSupplyContractInfo, privateGetV5CryptoLoanFixedBorrowOrderInfo, privateGetV5CryptoLoanFixedRenewInfo, privateGetV5CryptoLoanFixedSupplyOrderInfo, privateGetV5CryptoLoanFixedRepaymentHistory, privateGetV5InsLoanProductInfos, privateGetV5InsLoanEnsureTokens, privateGetV5InsLoanEnsureTokensConvert, privateGetV5InsLoanLoanOrder, privateGetV5InsLoanRepaidHistory, privateGetV5InsLoanLtv, privateGetV5InsLoanLtvConvert, privateGetV5InsLoanCoinDeltaAmount, privateGetV5LendingInfo, privateGetV5LendingHistoryOrder, privateGetV5LendingAccount, privateGetV5BrokerEarningRecord, privateGetV5BrokerEarningsInfo, privateGetV5BrokerAccountInfo, privateGetV5BrokerAssetQuerySubMemberDepositRecord, privateGetV5EarnProduct, privateGetV5EarnOrder, privateGetV5EarnPosition, privateGetV5EarnYield, privateGetV5EarnHourlyYield, privatePostSpotV3PrivateOrder, privatePostSpotV3PrivateCancelOrder, privatePostSpotV3PrivateCancelOrders, privatePostSpotV3PrivateCancelOrdersByIds, privatePostSpotV3PrivatePurchase, privatePostSpotV3PrivateRedeem, privatePostSpotV3PrivateCrossMarginLoan, privatePostSpotV3PrivateCrossMarginRepay, privatePostAssetV3PrivateTransferInterTransfer, privatePostAssetV3PrivateWithdrawCreate, privatePostAssetV3PrivateWithdrawCancel, privatePostAssetV3PrivateTransferSubMemberTransfer, privatePostAssetV3PrivateTransferTransferSubMemberSave, privatePostAssetV3PrivateTransferUniversalTransfer, privatePostUserV3PrivateCreateSubMember, privatePostUserV3PrivateCreateSubApi, privatePostUserV3PrivateUpdateApi, privatePostUserV3PrivateDeleteApi, privatePostUserV3PrivateUpdateSubApi, privatePostUserV3PrivateDeleteSubApi, privatePostContractV3PrivateCopytradingOrderCreate, privatePostContractV3PrivateCopytradingOrderCancel, privatePostContractV3PrivateCopytradingOrderClose, privatePostContractV3PrivateCopytradingPositionClose, privatePostContractV3PrivateCopytradingPositionSetLeverage, privatePostContractV3PrivateCopytradingWalletTransfer, privatePostContractV3PrivateCopytradingOrderTradingStop, privatePostContractV3PrivateOrderCreate, privatePostContractV3PrivateOrderCancel, privatePostContractV3PrivateOrderCancelAll, privatePostContractV3PrivateOrderReplace, privatePostContractV3PrivatePositionSetAutoAddMargin, privatePostContractV3PrivatePositionSwitchIsolated, privatePostContractV3PrivatePositionSwitchMode, privatePostContractV3PrivatePositionSwitchTpslMode, privatePostContractV3PrivatePositionSetLeverage, privatePostContractV3PrivatePositionTradingStop, privatePostContractV3PrivatePositionSetRiskLimit, privatePostContractV3PrivateAccountSetMarginMode, privatePostUnifiedV3PrivateOrderCreate, privatePostUnifiedV3PrivateOrderReplace, privatePostUnifiedV3PrivateOrderCancel, privatePostUnifiedV3PrivateOrderCreateBatch, privatePostUnifiedV3PrivateOrderReplaceBatch, privatePostUnifiedV3PrivateOrderCancelBatch, privatePostUnifiedV3PrivateOrderCancelAll, privatePostUnifiedV3PrivatePositionSetLeverage, privatePostUnifiedV3PrivatePositionTpslSwitchMode, privatePostUnifiedV3PrivatePositionSetRiskLimit, privatePostUnifiedV3PrivatePositionTradingStop, privatePostUnifiedV3PrivateAccountUpgradeUnifiedAccount, privatePostUnifiedV3PrivateAccountSetMarginMode, privatePostFhtComplianceTaxV3PrivateRegistertime, privatePostFhtComplianceTaxV3PrivateCreate, privatePostFhtComplianceTaxV3PrivateStatus, privatePostFhtComplianceTaxV3PrivateUrl, privatePostV5OrderCreate, privatePostV5OrderAmend, privatePostV5OrderCancel, privatePostV5OrderCancelAll, privatePostV5OrderCreateBatch, privatePostV5OrderAmendBatch, privatePostV5OrderCancelBatch, privatePostV5OrderDisconnectedCancelAll, privatePostV5OrderPreCheck, privatePostV5PositionSetLeverage, privatePostV5PositionSwitchIsolated, privatePostV5PositionSetTpslMode, privatePostV5PositionSwitchMode, privatePostV5PositionSetRiskLimit, privatePostV5PositionTradingStop, privatePostV5PositionSetAutoAddMargin, privatePostV5PositionAddMargin, privatePostV5PositionMovePositions, privatePostV5PositionConfirmPendingMmr, privatePostV5AccountUpgradeToUta, privatePostV5AccountQuickRepayment, privatePostV5AccountSetMarginMode, privatePostV5AccountSetHedgingMode, privatePostV5AccountMmpModify, privatePostV5AccountMmpReset, privatePostV5AccountBorrow, privatePostV5AccountRepay, privatePostV5AccountNoConvertRepay, privatePostV5AccountSetLimitPxAction, privatePostV5AccountSetDeltaMode, privatePostV5AssetExchangeQuoteApply, privatePostV5AssetExchangeConvertExecute, privatePostV5AssetTransferInterTransfer, privatePostV5AssetTransferSaveTransferSubMember, privatePostV5AssetTransferUniversalTransfer, privatePostV5AssetDepositDepositToAccount, privatePostV5AssetTravelRuleDepositSubmit, privatePostV5AssetWithdrawCreate, privatePostV5AssetWithdrawCancel, privatePostV5AssetCovertGetQuote, privatePostV5AssetCovertSmallBalanceExecute, privatePostV5FiatQuoteApply, privatePostV5FiatTradeExecute, privatePostV5UserCreateSubMember, privatePostV5UserCreateSubApi, privatePostV5UserFrozenSubMember, privatePostV5UserUpdateApi, privatePostV5UserUpdateSubApi, privatePostV5UserDeleteApi, privatePostV5UserDeleteSubApi, privatePostV5UserAgreement, privatePostV5UserCreateDemoMember, privatePostV5SpotLeverTokenPurchase, privatePostV5SpotLeverTokenRedeem, privatePostV5SpotMarginTradeSwitchMode, privatePostV5SpotMarginTradeSetLeverage, privatePostV5SpotMarginTradeSetAutoRepayMode, privatePostV5SpotMarginTradeFixedborrow, privatePostV5SpotMarginTradeFixedborrowRenew, privatePostV5SpotCrossMarginTradeLoan, privatePostV5SpotCrossMarginTradeRepay, privatePostV5SpotCrossMarginTradeSwitch, privatePostV5CryptoLoanBorrow, privatePostV5CryptoLoanRepay, privatePostV5CryptoLoanAdjustLtv, privatePostV5CryptoLoanCommonAdjustLtv, privatePostV5CryptoLoanCommonMaxLoan, privatePostV5CryptoLoanFlexibleBorrow, privatePostV5CryptoLoanFlexibleRepay, privatePostV5CryptoLoanFlexibleRepayCollateral, privatePostV5CryptoLoanFixedBorrow, privatePostV5CryptoLoanFixedRenew, privatePostV5CryptoLoanFixedSupply, privatePostV5CryptoLoanFixedBorrowOrderCancel, privatePostV5CryptoLoanFixedSupplyOrderCancel, privatePostV5CryptoLoanFixedFullyRepay, privatePostV5CryptoLoanFixedRepayCollateral, privatePostV5InsLoanAssociationUid, privatePostV5InsLoanRepayLoan, privatePostV5LendingPurchase, privatePostV5LendingRedeem, privatePostV5LendingRedeemCancel, privatePostV5AccountSetCollateralSwitch, privatePostV5AccountSetCollateralSwitchBatch, privatePostV5AccountDemoApplyMoney, privatePostV5BrokerAwardInfo, privatePostV5BrokerAwardDistributeAward, privatePostV5BrokerAwardDistributionRecord, privatePostV5EarnPlaceOrder)
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
function __ccxt_doc_Bybit_enableDemoTrading() end
"""
enables or disables demo trading mode
see: https://bybit-exchange.github.io/docs/v5/demo

# Arguments
- `enable`::bool, optional: true if demo trading should be enabled, false otherwise
"""
__ccxt_doc_Bybit_enableDemoTrading

function __ccxt_doc_Bybit_isUnifiedEnabled() end
"""
returns [enableUnifiedMargin, enableUnifiedAccount] so the user can check if unified account is enabled
see: https://bybit-exchange.github.io/docs/v5/user/apikey-info#http-request
see: https://bybit-exchange.github.io/docs/v5/account/account-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- [enableUnifiedMargin, enableUnifiedAccount]
"""
__ccxt_doc_Bybit_isUnifiedEnabled

function __ccxt_doc_Bybit_upgradeUnifiedTradeAccount() end
"""
upgrades the account to unified trade account *warning* this is irreversible
see: https://bybit-exchange.github.io/docs/v5/account/upgrade-unified-account

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- nothing
"""
__ccxt_doc_Bybit_upgradeUnifiedTradeAccount

function __ccxt_doc_Bybit_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://bybit-exchange.github.io/docs/v5/system-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)
"""
__ccxt_doc_Bybit_fetchStatus

function __ccxt_doc_Bybit_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://bybit-exchange.github.io/docs/v5/market/time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Bybit_fetchTime

function __ccxt_doc_Bybit_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://bybit-exchange.github.io/docs/v5/asset/coin-info

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bybit_fetchCurrencies

function __ccxt_doc_Bybit_fetchMarkets() end
"""
retrieves data on all markets for bybit
see: https://bybit-exchange.github.io/docs/v5/market/instrument

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Bybit_fetchMarkets

function __ccxt_doc_Bybit_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bybit_fetchTicker

function __ccxt_doc_Bybit_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `symbols`::array: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: *contract only* 'linear', 'inverse'
- `params.baseCoin`::string, optional: *option only* base coin, default is 'BTC'

# Returns
- an array of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bybit_fetchTickers

function __ccxt_doc_Bybit_fetchBidsAsks() end
"""
fetches the bid and ask price and volume for multiple markets
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `symbols`::any: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: *contract only* 'linear', 'inverse'
- `params.baseCoin`::string, optional: *option only* base coin, default is 'BTC'

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Bybit_fetchBidsAsks

function __ccxt_doc_Bybit_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://bybit-exchange.github.io/docs/v5/market/kline
see: https://bybit-exchange.github.io/docs/v5/market/mark-kline
see: https://bybit-exchange.github.io/docs/v5/market/index-kline
see: https://bybit-exchange.github.io/docs/v5/market/preimum-index-kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch orders for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Bybit_fetchOHLCV

function __ccxt_doc_Bybit_fetchFundingRates() end
"""
fetches funding rates for multiple markets
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `symbols`::array: unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Bybit_fetchFundingRates

function __ccxt_doc_Bybit_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://bybit-exchange.github.io/docs/v5/market/history-fund-rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest funding rate
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Bybit_fetchFundingRateHistory

function __ccxt_doc_Bybit_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://bybit-exchange.github.io/docs/v5/market/recent-trade

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Bybit_fetchTrades

function __ccxt_doc_Bybit_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://bybit-exchange.github.io/docs/v5/market/orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Bybit_fetchOrderBook

function __ccxt_doc_Bybit_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://bybit-exchange.github.io/docs/v5/spot-margin-normal/account-info
see: https://bybit-exchange.github.io/docs/v5/asset/all-balance
see: https://bybit-exchange.github.io/docs/v5/account/wallet-balance

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: wallet type, ['spot', 'swap', 'funding']

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Bybit_fetchBalance

function __ccxt_doc_Bybit_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost
see: https://bybit-exchange.github.io/docs/v5/order/create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_createMarketBuyOrderWithCost

function __ccxt_doc_Bybit_createMarketSellOrderWithCost() end
"""
create a market sell order by providing the symbol and cost
see: https://bybit-exchange.github.io/docs/v5/order/create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_createMarketSellOrderWithCost

function __ccxt_doc_Bybit_createOrder() end
"""
create a trade order
see: https://bybit-exchange.github.io/docs/v5/order/create-order
see: https://bybit-exchange.github.io/docs/v5/position/trading-stop

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: "GTC", "IOC", "FOK"
- `params.postOnly`::bool, optional: true or false whether the order is post-only
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce-only
- `params.positionIdx`::string, optional: *contracts only* 0 for one-way mode, 1 buy side of hedged mode, 2 sell side of hedged mode
- `params.hedged`::bool, optional: *contracts only* true for hedged mode, false for one way mode, default is false
- `params.isLeverage`::int, optional: *unified spot only* false then spot trading true then margin trading
- `params.tpslMode`::string, optional: *contract only* 'Full' or 'Partial'
- `params.mmp`::string, optional: *option only* market maker protection
- `params.triggerDirection`::string, optional: *contract only* the direction for trigger orders, 'ascending' or 'descending'
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.stopLossPrice`::float, optional: The price at which a stop loss order is triggered at
- `params.stopLossLimitPrice`::float, optional: The limit price for a stoploss order (only when used in OCO with takeProfitPrice)
- `params.takeProfitPrice`::float, optional: The price at which a take profit order is triggered at
- `params.takeProfitLimitPrice`::float, optional: The limit price for a takeprofit order (only when used in OCO combination with stopLossPrice)
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price
- `params.trailingAmount`::string, optional: the quote amount to trail away from the current market price
- `params.trailingTriggerPrice`::string, optional: the price to trigger a trailing order, default uses the price argument
- `params.tradingStopEndpoint`::bool, optional: whether to enforce using the tradingStop (https://bybit-exchange.github.io/docs/v5/position/trading-stop) endpoint, makes difference when submitting single tp/sl order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_createOrder

function __ccxt_doc_Bybit_createOrders() end
"""
create a list of trade orders
see: https://bybit-exchange.github.io/docs/v5/order/batch-place

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_createOrders

function __ccxt_doc_Bybit_editOrder() end
"""
edit a trade order
see: https://bybit-exchange.github.io/docs/v5/order/amend-order
see: https://bybit-exchange.github.io/docs/derivatives/unified/replace-order
see: https://bybit-exchange.github.io/docs/api-explorer/derivatives/trade/contract/replace-order

# Arguments
- `id`::string: cancel order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of currency you want to trade in units of base currency
- `price`::float: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: unique client order id
- `params.triggerPrice`::float, optional: The price that a trigger order is triggered at
- `params.stopLossPrice`::float, optional: The price that a stop loss order is triggered at
- `params.takeProfitPrice`::float, optional: The price that a take profit order is triggered at
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice that the attached take profit order will be triggered
- `params.takeProfit.triggerPrice`::float, optional: take profit trigger price
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice that the attached stop loss order will be triggered
- `params.stopLoss.triggerPrice`::float, optional: stop loss trigger price
- `params.triggerBy`::string, optional: 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for triggerPrice
- `params.slTriggerBy`::string, optional: 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for stopLoss
- `params.tpTriggerby`::string, optional: 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for takeProfit

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_editOrder

function __ccxt_doc_Bybit_editOrders() end
"""
edit a list of trade orders
see: https://bybit-exchange.github.io/docs/v5/order/batch-amend

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_editOrders

function __ccxt_doc_Bybit_cancelOrder() end
"""
cancels an open order
see: https://bybit-exchange.github.io/docs/v5/order/cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: *spot only* whether the order is a trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.orderFilter`::string, optional: *spot only* 'Order' or 'StopOrder' or 'tpslOrder'

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_cancelOrder

function __ccxt_doc_Bybit_cancelOrders() end
"""
cancel multiple orders
see: https://bybit-exchange.github.io/docs/v5/order/batch-cancel

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_cancelOrders

function __ccxt_doc_Bybit_cancelAllOrdersAfter() end
"""
dead man's switch, cancel all orders after the given timeout
see: https://bybit-exchange.github.io/docs/v5/order/dcp

# Arguments
- `timeout`::float: time in milliseconds
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.product`::string, optional: OPTIONS, DERIVATIVES, SPOT, default is 'DERIVATIVES'

# Returns
- the api result
"""
__ccxt_doc_Bybit_cancelAllOrdersAfter

function __ccxt_doc_Bybit_cancelOrdersForSymbols() end
"""
cancel multiple orders for multiple symbols
see: https://bybit-exchange.github.io/docs/v5/order/batch-cancel

# Arguments
- `orders`::array: list of order ids with symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_cancelOrdersForSymbols

function __ccxt_doc_Bybit_cancelAllOrders() end
"""
cancel all open orders
see: https://bybit-exchange.github.io/docs/v5/order/cancel-all

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.baseCoin`::string, optional: Base coin. Supports linear, inverse & option
- `params.settleCoin`::string, optional: Settle coin. Supports linear, inverse & option

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_cancelAllOrders

function __ccxt_doc_Bybit_fetchOrderClassic() end
"""
fetches information on an order made by the user *classic accounts only*
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_fetchOrderClassic

function __ccxt_doc_Bybit_fetchOrder() end
"""
*classic accounts only/ spot not supported*  fetches information on an order made by the user *classic accounts only*
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.acknowledged`::object, optional: to suppress the warning, set to true

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_fetchOrder

function __ccxt_doc_Bybit_fetchOrdersClassic() end
"""
fetches information on multiple orders made by the user *classic accounts only*
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_fetchOrdersClassic

function __ccxt_doc_Bybit_fetchClosedOrder() end
"""
fetches information on a closed order made by the user
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching a closed trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_fetchClosedOrder

function __ccxt_doc_Bybit_fetchOpenOrder() end
"""
fetches information on an open order made by the user
see: https://bybit-exchange.github.io/docs/v5/order/open-order

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching an open trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.baseCoin`::string, optional: Base coin. Supports linear, inverse & option
- `params.settleCoin`::string, optional: Settle coin. Supports linear, inverse & option
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_fetchOpenOrder

function __ccxt_doc_Bybit_fetchCanceledAndClosedOrders() end
"""
fetches information on multiple canceled and closed orders made by the user
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching trigger orders
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_fetchCanceledAndClosedOrders

function __ccxt_doc_Bybit_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching closed trigger orders
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_fetchClosedOrders

function __ccxt_doc_Bybit_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://bybit-exchange.github.io/docs/v5/order/order-list

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: timestamp in ms of the earliest order, default is undefined
- `limit`::int, optional: max number of orders to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if trigger order
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_fetchCanceledOrders

function __ccxt_doc_Bybit_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://bybit-exchange.github.io/docs/v5/order/open-order

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: set to true for fetching open trigger orders
- `params.stop`::bool, optional: alias for trigger
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.baseCoin`::string, optional: Base coin. Supports linear, inverse & option
- `params.settleCoin`::string, optional: Settle coin. Supports linear, inverse & option
- `params.orderFilter`::string, optional: 'Order' or 'StopOrder' or 'tpslOrder'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Bybit_fetchOpenOrders

function __ccxt_doc_Bybit_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://bybit-exchange.github.io/docs/v5/position/execution

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bybit_fetchOrderTrades

function __ccxt_doc_Bybit_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Bybit_fetchMyTrades

function __ccxt_doc_Bybit_fetchDepositAddressesByNetwork() end
"""
fetch a dictionary of addresses for a currency, indexed by network
see: https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [address structures]{@link https://docs.ccxt.com/?id=address-structure} indexed by the network
"""
__ccxt_doc_Bybit_fetchDepositAddressesByNetwork

function __ccxt_doc_Bybit_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Bybit_fetchDepositAddress

function __ccxt_doc_Bybit_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://bybit-exchange.github.io/docs/v5/asset/deposit-record

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for, default = 30 days before the current time
- `limit`::int, optional: the maximum number of deposits structures to retrieve, default = 50, max = 50
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch deposits for, default = 30 days after since EXCHANGE SPECIFIC PARAMETERS
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.cursor`::string, optional: used for pagination

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bybit_fetchDeposits

function __ccxt_doc_Bybit_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://bybit-exchange.github.io/docs/v5/asset/withdraw-record

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bybit_fetchWithdrawals

function __ccxt_doc_Bybit_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://bybit-exchange.github.io/docs/v5/account/transaction-log
see: https://bybit-exchange.github.io/docs/v5/account/contract-transaction-log

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.subType`::string, optional: if inverse will use v5/account/contract-transaction-log

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Bybit_fetchLedger

function __ccxt_doc_Bybit_withdraw() end
"""
make a withdrawal
see: https://bybit-exchange.github.io/docs/v5/asset/withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: 'UTA', 'FUND', 'FUND,UTA', and 'SPOT (for classic accounts only)

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Bybit_withdraw

function __ccxt_doc_Bybit_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://bybit-exchange.github.io/docs/v5/position

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bybit_fetchPosition

function __ccxt_doc_Bybit_fetchPositions() end
"""
fetch all open positions
see: https://bybit-exchange.github.io/docs/v5/position

# Arguments
- `symbols`::array: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.baseCoin`::string, optional: Base coin. Supports linear, inverse & option
- `params.settleCoin`::string, optional: Settle coin. Supports linear, inverse & option
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bybit_fetchPositions

function __ccxt_doc_Bybit_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://bybit-exchange.github.io/docs/v5/position

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Bybit_fetchLeverage

function __ccxt_doc_Bybit_setMarginMode() end
"""
set margin mode (account) or trade mode (symbol)
see: https://bybit-exchange.github.io/docs/v5/account/set-margin-mode
see: https://bybit-exchange.github.io/docs/v5/position/cross-isolate

# Arguments
- `marginMode`::string: account mode must be either [isolated, cross, portfolio], trade mode must be either [isolated, cross]
- `symbol`::string: unified market symbol of the market the position is held in, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.leverage`::string, optional: the rate of leverage, is required if setting trade mode (symbol)

# Returns
- response from the exchange
"""
__ccxt_doc_Bybit_setMarginMode

function __ccxt_doc_Bybit_setLeverage() end
"""
set the level of leverage for a market
see: https://bybit-exchange.github.io/docs/v5/position/leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.buyLeverage`::string, optional: leverage for buy side
- `params.sellLeverage`::string, optional: leverage for sell side

# Returns
- response from the exchange
"""
__ccxt_doc_Bybit_setLeverage

function __ccxt_doc_Bybit_setPositionMode() end
"""
set hedged to true or false for a market
see: https://bybit-exchange.github.io/docs/v5/position/position-mode

# Arguments
- `hedged`::bool:
- `symbol`::string: used for unified account with inverse market
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Bybit_setPositionMode

function __ccxt_doc_Bybit_fetchOpenInterest() end
"""
Retrieves the open interest of a derivative trading pair
see: https://bybit-exchange.github.io/docs/v5/market/open-interest

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `params`::object, optional: exchange specific parameters
- `params.interval`::string, optional: 5m, 15m, 30m, 1h, 4h, 1d
- `params.category`::string, optional: "linear" or "inverse"

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Bybit_fetchOpenInterest

function __ccxt_doc_Bybit_fetchOpenInterestHistory() end
"""
Gets the total amount of unsettled contracts. In other words, the total number of contracts held in open positions
see: https://bybit-exchange.github.io/docs/v5/market/open-interest

# Arguments
- `symbol`::string: Unified market symbol
- `timeframe`::string: "5m", 15m, 30m, 1h, 4h, 1d
- `since`::int, optional: Not used by Bybit
- `limit`::int, optional: The number of open interest structures to return. Max 200, default 50
- `params`::object, optional: Exchange specific parameters
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- An array of open interest structures
"""
__ccxt_doc_Bybit_fetchOpenInterestHistory

function __ccxt_doc_Bybit_fetchCrossBorrowRate() end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://bybit-exchange.github.io/docs/zh-TW/v5/spot-margin-normal/interest-quota

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [borrow rate structure]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
__ccxt_doc_Bybit_fetchCrossBorrowRate

function __ccxt_doc_Bybit_fetchBorrowInterest() end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://bybit-exchange.github.io/docs/zh-TW/v5/spot-margin-normal/account-info

# Arguments
- `code`::string: unified currency code
- `symbol`::string: unified market symbol when fetch interest in isolated markets
- `since`::float, optional: the earliest time in ms to fetch borrrow interest for
- `limit`::float, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
__ccxt_doc_Bybit_fetchBorrowInterest

function __ccxt_doc_Bybit_fetchBorrowRateHistory() end
"""
retrieves a history of a currencies borrow interest rate at specific time slots
see: https://bybit-exchange.github.io/docs/v5/spot-margin-uta/historical-interest

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: timestamp for the earliest borrow rate
- `limit`::int, optional: the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for

# Returns
- an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
__ccxt_doc_Bybit_fetchBorrowRateHistory

function __ccxt_doc_Bybit_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://bybit-exchange.github.io/docs/v5/asset/create-inter-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transferId`::string, optional: UUID, which is unique across the platform

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Bybit_transfer

function __ccxt_doc_Bybit_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://bybit-exchange.github.io/docs/v5/asset/inter-transfer-list

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Bybit_fetchTransfers

function __ccxt_doc_Bybit_borrowCrossMargin() end
"""
create a loan to borrow margin
see: https://bybit-exchange.github.io/docs/v5/account/borrow

# Arguments
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Bybit_borrowCrossMargin

function __ccxt_doc_Bybit_repayCrossMargin() end
"""
repay borrowed margin and interest
see: https://bybit-exchange.github.io/docs/v5/account/no-convert-repay

# Arguments
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Bybit_repayCrossMargin

function __ccxt_doc_Bybit_fetchMarketLeverageTiers() end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
see: https://bybit-exchange.github.io/docs/v5/market/risk-limit

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
__ccxt_doc_Bybit_fetchMarketLeverageTiers

function __ccxt_doc_Bybit_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://bybit-exchange.github.io/docs/v5/account/fee-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bybit_fetchTradingFee

function __ccxt_doc_Bybit_fetchTradingFees() end
"""
fetch the trading fees for multiple markets
see: https://bybit-exchange.github.io/docs/v5/account/fee-rate

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Bybit_fetchTradingFees

function __ccxt_doc_Bybit_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees
see: https://bybit-exchange.github.io/docs/v5/asset/coin-info

# Arguments
- `codes`::array: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Bybit_fetchDepositWithdrawFees

function __ccxt_doc_Bybit_fetchSettlementHistory() end
"""
fetches historical settlement records
see: https://bybit-exchange.github.io/docs/v5/market/delivery-price

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records
- `params`::object, optional: exchange specific params
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']

# Returns
- a list of [settlement history objects]
"""
__ccxt_doc_Bybit_fetchSettlementHistory

function __ccxt_doc_Bybit_fetchMySettlementHistory() end
"""
fetches historical settlement records of the user
see: https://bybit-exchange.github.io/docs/v5/asset/delivery

# Arguments
- `symbol`::string: unified market symbol of the settlement history
- `since`::int, optional: timestamp in ms
- `limit`::int, optional: number of records
- `params`::object, optional: exchange specific params
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']

# Returns
- a list of [settlement history objects]
"""
__ccxt_doc_Bybit_fetchMySettlementHistory

function __ccxt_doc_Bybit_fetchVolatilityHistory() end
"""
fetch the historical volatility of an option market based on an underlying asset
see: https://bybit-exchange.github.io/docs/v5/market/iv

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.period`::int, optional: the period in days to fetch the volatility for: 7,14,21,30,60,90,180,270

# Returns
- a list of [volatility history objects]{@link https://docs.ccxt.com/?id=volatility-structure}
"""
__ccxt_doc_Bybit_fetchVolatilityHistory

function __ccxt_doc_Bybit_fetchGreeks() end
"""
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://bybit-exchange.github.io/docs/api-explorer/v5/market/tickers

# Arguments
- `symbol`::string: unified symbol of the market to fetch greeks for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
__ccxt_doc_Bybit_fetchGreeks

function __ccxt_doc_Bybit_fetchAllGreeks() end
"""
fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
see: https://bybit-exchange.github.io/docs/api-explorer/v5/market/tickers

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch greeks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.baseCoin`::string, optional: the baseCoin of the symbol, default is BTC

# Returns
- a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
"""
__ccxt_doc_Bybit_fetchAllGreeks

function __ccxt_doc_Bybit_fetchMyLiquidations() end
"""
retrieves the users liquidated positions
see: https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution

# Arguments
- `symbol`::string, optional: unified CCXT market symbol
- `since`::int, optional: the earliest time in ms to fetch liquidations for
- `limit`::int, optional: the maximum number of liquidation structures to retrieve
- `params`::object, optional: exchange specific parameters for the exchange API endpoint
- `params.type`::string, optional: market type, ['swap', 'option', 'spot']
- `params.subType`::string, optional: market subType, ['linear', 'inverse']
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
"""
__ccxt_doc_Bybit_fetchMyLiquidations

function __ccxt_doc_Bybit_fetchLeverageTiers() end
"""
retrieve information on the maximum leverage, for different trade sizes
see: https://bybit-exchange.github.io/docs/v5/market/risk-limit

# Arguments
- `symbols`::array, optional: a list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.subType`::string, optional: market subType, ['linear', 'inverse'], default is 'linear'
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
__ccxt_doc_Bybit_fetchLeverageTiers

function __ccxt_doc_Bybit_fetchFundingHistory() end
"""
fetch the history of funding payments paid and received on this account
see: https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution

# Arguments
- `symbol`::string, optional: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Bybit_fetchFundingHistory

function __ccxt_doc_Bybit_fetchOption() end
"""
fetches option data that is commonly found in an option chain
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [option chain structure]{@link https://docs.ccxt.com/?id=option-chain-structure}
"""
__ccxt_doc_Bybit_fetchOption

function __ccxt_doc_Bybit_fetchOptionChain() end
"""
fetches data for an underlying asset that is commonly found in an option chain
see: https://bybit-exchange.github.io/docs/v5/market/tickers

# Arguments
- `code`::string: base currency to fetch an option chain for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [option chain structures]{@link https://docs.ccxt.com/?id=option-chain-structure}
"""
__ccxt_doc_Bybit_fetchOptionChain

function __ccxt_doc_Bybit_fetchPositionsHistory() end
"""
fetches historical positions
see: https://bybit-exchange.github.io/docs/v5/position/close-pnl

# Arguments
- `symbols`::array: a list of unified market symbols
- `since`::int, optional: timestamp in ms of the earliest position to fetch, params["until"] - since <= 7 days
- `limit`::int, optional: the maximum amount of records to fetch, default=50, max=100
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest position to fetch, params["until"] - since <= 7 days
- `params.subType`::string, optional: 'linear' or 'inverse'

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Bybit_fetchPositionsHistory

function __ccxt_doc_Bybit_fetchConvertCurrencies() end
"""
fetches all available currencies that can be converted
see: https://bybit-exchange.github.io/docs/v5/asset/convert/convert-coin-list

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Bybit_fetchConvertCurrencies

function __ccxt_doc_Bybit_fetchConvertQuote() end
"""
fetch a quote for converting from one currency to another
see: https://bybit-exchange.github.io/docs/v5/asset/convert/apply-quote

# Arguments
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float, optional: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Bybit_fetchConvertQuote

function __ccxt_doc_Bybit_createConvertTrade() end
"""
convert from one currency to another
see: https://bybit-exchange.github.io/docs/v5/asset/convert/confirm-quote

# Arguments
- `id`::string: the id of the trade that you want to make
- `fromCode`::string: the currency that you want to sell and convert from
- `toCode`::string: the currency that you want to buy and convert into
- `amount`::float: how much you want to trade in units of the from currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Bybit_createConvertTrade

function __ccxt_doc_Bybit_fetchConvertTrade() end
"""
fetch the data for a conversion trade
see: https://bybit-exchange.github.io/docs/v5/asset/convert/get-convert-result

# Arguments
- `id`::string: the id of the trade that you want to fetch
- `code`::string, optional: the unified currency code of the conversion trade
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract

# Returns
- a [conversion structure]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Bybit_fetchConvertTrade

function __ccxt_doc_Bybit_fetchConvertTradeHistory() end
"""
fetch the users history of conversion trades
see: https://bybit-exchange.github.io/docs/v5/asset/convert/get-convert-history

# Arguments
- `code`::string, optional: the unified currency code
- `since`::int, optional: the earliest time in ms to fetch conversions for
- `limit`::int, optional: the maximum number of conversion structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountType`::string, optional: eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract

# Returns
- a list of [conversion structures]{@link https://docs.ccxt.com/?id=conversion-structure}
"""
__ccxt_doc_Bybit_fetchConvertTradeHistory

function __ccxt_doc_Bybit_fetchLongShortRatioHistory() end
"""
fetches the long short ratio history for a unified market symbol
see: https://bybit-exchange.github.io/docs/v5/market/long-short-ratio

# Arguments
- `symbol`::string: unified symbol of the market to fetch the long short ratio for
- `timeframe`::string, optional: the period for the ratio, default is 24 hours
- `since`::int, optional: the earliest time in ms to fetch ratios for
- `limit`::int, optional: the maximum number of long short ratio structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [long short ratio structures]{@link https://docs.ccxt.com/?id=long-short-ratio-structure}
"""
__ccxt_doc_Bybit_fetchLongShortRatioHistory

function __ccxt_doc_Bybit_fetchPositionsADLRank() end
"""
fetches the auto deleveraging rank and risk percentage for a list of symbols
see: https://bybit-exchange.github.io/docs/v5/position#response-parameters

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [auto de leverage structures]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
__ccxt_doc_Bybit_fetchPositionsADLRank

function __ccxt_doc_Bybit_fetchMarginMode() end
"""
fetches the margin mode of the trading pair
see: https://bybit-exchange.github.io/docs/v5/account/account-info

# Arguments
- `symbol`::string, optional: unified symbol of the market to fetch the margin mode for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Bybit_fetchMarginMode
