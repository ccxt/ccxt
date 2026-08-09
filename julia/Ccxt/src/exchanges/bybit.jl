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
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
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
        Symbol("fetchOrders") => false,
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
                Symbol("spot/v3/public/symbols") => 1,
                Symbol("spot/v3/public/quote/depth") => 1,
                Symbol("spot/v3/public/quote/depth/merged") => 1,
                Symbol("spot/v3/public/quote/trades") => 1,
                Symbol("spot/v3/public/quote/kline") => 1,
                Symbol("spot/v3/public/quote/ticker/24hr") => 1,
                Symbol("spot/v3/public/quote/ticker/price") => 1,
                Symbol("spot/v3/public/quote/ticker/bookTicker") => 1,
                Symbol("spot/v3/public/server-time") => 1,
                Symbol("spot/v3/public/infos") => 1,
                Symbol("spot/v3/public/margin-product-infos") => 1,
                Symbol("spot/v3/public/margin-ensure-tokens") => 1,
                Symbol("v3/public/time") => 1,
                Symbol("contract/v3/public/copytrading/symbol/list") => 1,
                Symbol("derivatives/v3/public/order-book/L2") => 1,
                Symbol("derivatives/v3/public/kline") => 1,
                Symbol("derivatives/v3/public/tickers") => 1,
                Symbol("derivatives/v3/public/instruments-info") => 1,
                Symbol("derivatives/v3/public/mark-price-kline") => 1,
                Symbol("derivatives/v3/public/index-price-kline") => 1,
                Symbol("derivatives/v3/public/funding/history-funding-rate") => 1,
                Symbol("derivatives/v3/public/risk-limit/list") => 1,
                Symbol("derivatives/v3/public/delivery-price") => 1,
                Symbol("derivatives/v3/public/recent-trade") => 1,
                Symbol("derivatives/v3/public/open-interest") => 1,
                Symbol("derivatives/v3/public/insurance") => 1,
                Symbol("v5/announcements/index") => 5,
                Symbol("v5/system/status") => 5,
                Symbol("v5/market/time") => 5,
                Symbol("v5/market/kline") => 5,
                Symbol("v5/market/mark-price-kline") => 5,
                Symbol("v5/market/index-price-kline") => 5,
                Symbol("v5/market/premium-index-price-kline") => 5,
                Symbol("v5/market/instruments-info") => 5,
                Symbol("v5/market/orderbook") => 5,
                Symbol("v5/market/rpi_orderbook") => 5,
                Symbol("v5/market/full_orderbook") => 5,
                Symbol("v5/market/tickers") => 5,
                Symbol("v5/market/funding/history") => 5,
                Symbol("v5/market/recent-trade") => 5,
                Symbol("v5/market/open-interest") => 5,
                Symbol("v5/market/historical-volatility") => 5,
                Symbol("v5/market/insurance") => 5,
                Symbol("v5/market/risk-limit") => 5,
                Symbol("v5/market/delivery-price") => 5,
                Symbol("v5/market/new-delivery-price") => 5,
                Symbol("v5/market/account-ratio") => 5,
                Symbol("v5/market/index-price-components") => 5,
                Symbol("v5/market/price-limit") => 5,
                Symbol("v5/market/adlAlert") => 5,
                Symbol("v5/market/fee-group-info") => 5,
                Symbol("v5/spot-lever-token/info") => 5,
                Symbol("v5/spot-lever-token/reference") => 5,
                Symbol("v5/spot-margin-trade/data") => 5,
                Symbol("v5/spot-margin-trade/collateral") => 5,
                Symbol("v5/spot-cross-margin-trade/data") => 5,
                Symbol("v5/spot-cross-margin-trade/pledge-token") => 5,
                Symbol("v5/spot-cross-margin-trade/borrow-token") => 5,
                Symbol("v5/crypto-loan/collateral-data") => 5,
                Symbol("v5/crypto-loan/loanable-data") => 5,
                Symbol("v5/crypto-loan-common/loanable-data") => 5,
                Symbol("v5/crypto-loan-common/collateral-data") => 5,
                Symbol("v5/crypto-loan-fixed/supply-order-quote") => 5,
                Symbol("v5/crypto-loan-fixed/borrow-order-quote") => 5,
                Symbol("v5/ins-loan/product-infos") => 5,
                Symbol("v5/ins-loan/ensure-tokens-convert") => 5,
                Symbol("v5/earn/product") => 5
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("v5/market/instruments-info") => 5,
                Symbol("v2/private/wallet/fund/records") => 25,
                Symbol("spot/v3/private/order") => 2.5,
                Symbol("spot/v3/private/open-orders") => 2.5,
                Symbol("spot/v3/private/history-orders") => 2.5,
                Symbol("spot/v3/private/my-trades") => 2.5,
                Symbol("spot/v3/private/account") => 2.5,
                Symbol("spot/v3/private/reference") => 2.5,
                Symbol("spot/v3/private/record") => 2.5,
                Symbol("spot/v3/private/cross-margin-orders") => 10,
                Symbol("spot/v3/private/cross-margin-account") => 10,
                Symbol("spot/v3/private/cross-margin-loan-info") => 10,
                Symbol("spot/v3/private/cross-margin-repay-history") => 10,
                Symbol("spot/v3/private/margin-loan-infos") => 10,
                Symbol("spot/v3/private/margin-repaid-infos") => 10,
                Symbol("spot/v3/private/margin-ltv") => 10,
                Symbol("asset/v3/private/transfer/inter-transfer/list/query") => 50,
                Symbol("asset/v3/private/transfer/sub-member/list/query") => 50,
                Symbol("asset/v3/private/transfer/sub-member-transfer/list/query") => 50,
                Symbol("asset/v3/private/transfer/universal-transfer/list/query") => 25,
                Symbol("asset/v3/private/coin-info/query") => 25,
                Symbol("asset/v3/private/deposit/address/query") => 10,
                Symbol("contract/v3/private/copytrading/order/list") => 30,
                Symbol("contract/v3/private/copytrading/position/list") => 40,
                Symbol("contract/v3/private/copytrading/wallet/balance") => 25,
                Symbol("contract/v3/private/position/limit-info") => 25,
                Symbol("contract/v3/private/order/unfilled-orders") => 1,
                Symbol("contract/v3/private/order/list") => 1,
                Symbol("contract/v3/private/position/list") => 1,
                Symbol("contract/v3/private/execution/list") => 1,
                Symbol("contract/v3/private/position/closed-pnl") => 1,
                Symbol("contract/v3/private/account/wallet/balance") => 1,
                Symbol("contract/v3/private/account/fee-rate") => 1,
                Symbol("contract/v3/private/account/wallet/fund-records") => 1,
                Symbol("unified/v3/private/order/unfilled-orders") => 1,
                Symbol("unified/v3/private/order/list") => 1,
                Symbol("unified/v3/private/position/list") => 1,
                Symbol("unified/v3/private/execution/list") => 1,
                Symbol("unified/v3/private/delivery-record") => 1,
                Symbol("unified/v3/private/settlement-record") => 1,
                Symbol("unified/v3/private/account/wallet/balance") => 1,
                Symbol("unified/v3/private/account/transaction-log") => 1,
                Symbol("unified/v3/private/account/borrow-history") => 1,
                Symbol("unified/v3/private/account/borrow-rate") => 1,
                Symbol("unified/v3/private/account/info") => 1,
                Symbol("user/v3/private/frozen-sub-member") => 10,
                Symbol("user/v3/private/query-sub-members") => 5,
                Symbol("user/v3/private/query-api") => 5,
                Symbol("user/v3/private/get-member-type") => 1,
                Symbol("asset/v3/private/transfer/transfer-coin/list/query") => 50,
                Symbol("asset/v3/private/transfer/account-coin/balance/query") => 50,
                Symbol("asset/v3/private/transfer/account-coins/balance/query") => 25,
                Symbol("asset/v3/private/transfer/asset-info/query") => 50,
                Symbol("asset/v3/public/deposit/allowed-deposit-list/query") => 0.17,
                Symbol("asset/v3/private/deposit/record/query") => 10,
                Symbol("asset/v3/private/withdraw/record/query") => 10,
                Symbol("v5/order/realtime") => 5,
                Symbol("v5/order/history") => 5,
                Symbol("v5/order/spot-borrow-check") => 1,
                Symbol("v5/position/list") => 5,
                Symbol("v5/execution/list") => 5,
                Symbol("v5/position/closed-pnl") => 5,
                Symbol("v5/position/get-closed-positions") => 5,
                Symbol("v5/position/move-history") => 5,
                Symbol("v5/position/symbol-info") => 5,
                Symbol("v5/pre-upgrade/order/history") => 5,
                Symbol("v5/pre-upgrade/execution/list") => 5,
                Symbol("v5/pre-upgrade/position/closed-pnl") => 5,
                Symbol("v5/pre-upgrade/account/transaction-log") => 5,
                Symbol("v5/pre-upgrade/asset/delivery-record") => 5,
                Symbol("v5/pre-upgrade/asset/settlement-record") => 5,
                Symbol("v5/account/wallet-balance") => 1,
                Symbol("v5/account/borrow-history") => 1,
                Symbol("v5/account/instruments-info") => 1,
                Symbol("v5/account/collateral-info") => 1,
                Symbol("v5/account/option-asset-info") => 1,
                Symbol("v5/asset/coin-greeks") => 1,
                Symbol("v5/account/fee-rate") => 10,
                Symbol("v5/account/info") => 5,
                Symbol("v5/account/transaction-log") => 1.66,
                Symbol("v5/account/contract-transaction-log") => 1,
                Symbol("v5/account/query-dcp-info") => 5,
                Symbol("v5/account/user-setting-config") => 5,
                Symbol("v5/account/pay-info") => 5,
                Symbol("v5/account/trade-info-for-analysis") => 5,
                Symbol("v5/account/smp-group") => 1,
                Symbol("v5/account/mmp-state") => 5,
                Symbol("v5/account/withdrawal") => 5,
                Symbol("v5/asset/asset-overview") => 5,
                Symbol("v5/asset/exchange/query-coin-list") => 0.5,
                Symbol("v5/asset/exchange/convert-result-query") => 0.5,
                Symbol("v5/asset/exchange/query-convert-history") => 0.5,
                Symbol("v5/asset/exchange/order-record") => 5,
                Symbol("v5/asset/fundinghistory") => 5,
                Symbol("v5/asset/portfolio-margin") => 5,
                Symbol("v5/asset/total-members-assets") => 5,
                Symbol("v5/asset/delivery-record") => 5,
                Symbol("v5/asset/settlement-record") => 5,
                Symbol("v5/asset/transfer/query-asset-info") => 50,
                Symbol("v5/asset/transfer/query-account-coins-balance") => 25,
                Symbol("v5/asset/transfer/query-account-coin-balance") => 50,
                Symbol("v5/asset/transfer/query-transfer-coin-list") => 50,
                Symbol("v5/asset/transfer/query-inter-transfer-list") => 50,
                Symbol("v5/asset/transfer/query-sub-member-list") => 50,
                Symbol("v5/asset/transfer/query-universal-transfer-list") => 25,
                Symbol("v5/asset/deposit/query-allowed-list") => 5,
                Symbol("v5/asset/deposit/query-record") => 10,
                Symbol("v5/asset/deposit/query-sub-member-record") => 10,
                Symbol("v5/asset/deposit/query-internal-record") => 5,
                Symbol("v5/asset/deposit/query-address") => 10,
                Symbol("v5/asset/deposit/query-sub-member-address") => 10,
                Symbol("v5/asset/coin/query-info") => 28,
                Symbol("v5/asset/withdraw/query-address") => 10,
                Symbol("v5/asset/withdraw/query-record") => 10,
                Symbol("v5/asset/withdraw/withdrawable-amount") => 5,
                Symbol("v5/asset/withdraw/vasp/list") => 5,
                Symbol("v5/asset/covert/small-balance-list") => 5,
                Symbol("v5/asset/covert/small-balance-history") => 5,
                Symbol("v5/asset/convert/small-balance-list") => 5,
                Symbol("v5/asset/convert/small-balance-history") => 5,
                Symbol("v5/fiat/query-coin-list") => 5,
                Symbol("v5/fiat/reference-price") => 5,
                Symbol("v5/fiat/trade-query") => 5,
                Symbol("v5/fiat/query-trade-history") => 5,
                Symbol("v5/fiat/balance-query") => 5,
                Symbol("v5/user/query-sub-members") => 5,
                Symbol("v5/user/query-api") => 5,
                Symbol("v5/user/sub-apikeys") => 5,
                Symbol("v5/user/get-member-type") => 5,
                Symbol("v5/user/aff-customer-info") => 5,
                Symbol("v5/user/del-submember") => 5,
                Symbol("v5/user/submembers") => 5,
                Symbol("v5/user/escrow_sub_members") => 5,
                Symbol("v5/user/invitation/referrals") => 5,
                Symbol("v5/affiliate/aff-user-list") => 5,
                Symbol("v5/affiliate/affiliate-sub-list") => 5,
                Symbol("v5/spot-lever-token/order-record") => 1,
                Symbol("v5/spot-margin-trade/interest-rate-history") => 5,
                Symbol("v5/spot-margin-trade/state") => 5,
                Symbol("v5/spot-margin-trade/max-borrowable") => 5,
                Symbol("v5/spot-margin-trade/position-tiers") => 5,
                Symbol("v5/spot-margin-trade/coinstate") => 5,
                Symbol("v5/spot-margin-trade/currency-data") => 5,
                Symbol("v5/spot-margin-trade/fixedborrow-contract-info") => 5,
                Symbol("v5/spot-margin-trade/fixedborrow-order-info") => 5,
                Symbol("v5/spot-margin-trade/fixedborrow-order-quote") => 5,
                Symbol("v5/spot-margin-trade/liability") => 5,
                Symbol("v5/spot-margin-trade/repayment-available-amount") => 5,
                Symbol("v5/spot-margin-trade/get-auto-repay-mode") => 5,
                Symbol("v5/spot-cross-margin-trade/loan-info") => 1,
                Symbol("v5/spot-cross-margin-trade/account") => 1,
                Symbol("v5/spot-cross-margin-trade/orders") => 1,
                Symbol("v5/spot-cross-margin-trade/repay-history") => 1,
                Symbol("v5/crypto-loan/borrowable-collateralisable-number") => 5,
                Symbol("v5/crypto-loan/ongoing-orders") => 5,
                Symbol("v5/crypto-loan/repayment-history") => 5,
                Symbol("v5/crypto-loan/borrow-history") => 5,
                Symbol("v5/crypto-loan/max-collateral-amount") => 5,
                Symbol("v5/crypto-loan/adjustment-history") => 5,
                Symbol("v5/crypto-loan-common/max-collateral-amount") => 10,
                Symbol("v5/crypto-loan-common/adjustment-history") => 10,
                Symbol("v5/crypto-loan-common/position") => 10,
                Symbol("v5/crypto-loan-flexible/ongoing-coin") => 10,
                Symbol("v5/crypto-loan-flexible/borrow-history") => 10,
                Symbol("v5/crypto-loan-flexible/repayment-history") => 10,
                Symbol("v5/crypto-loan-fixed/borrow-contract-info") => 10,
                Symbol("v5/crypto-loan-fixed/supply-contract-info") => 10,
                Symbol("v5/crypto-loan-fixed/borrow-order-info") => 10,
                Symbol("v5/crypto-loan-fixed/renew-info") => 10,
                Symbol("v5/crypto-loan-fixed/supply-order-info") => 10,
                Symbol("v5/crypto-loan-fixed/repayment-history") => 10,
                Symbol("v5/ins-loan/product-infos") => 5,
                Symbol("v5/ins-loan/ensure-tokens") => 5,
                Symbol("v5/ins-loan/ensure-tokens-convert") => 5,
                Symbol("v5/ins-loan/loan-order") => 5,
                Symbol("v5/ins-loan/repaid-history") => 5,
                Symbol("v5/ins-loan/ltv") => 5,
                Symbol("v5/ins-loan/ltv-convert") => 5,
                Symbol("v5/ins-loan/coin-delta-amount") => 5,
                Symbol("v5/lending/info") => 5,
                Symbol("v5/lending/history-order") => 5,
                Symbol("v5/lending/account") => 5,
                Symbol("v5/broker/earning-record") => 5,
                Symbol("v5/broker/earnings-info") => 5,
                Symbol("v5/broker/account-info") => 5,
                Symbol("v5/broker/asset/query-sub-member-deposit-record") => 10,
                Symbol("v5/earn/product") => 5,
                Symbol("v5/earn/order") => 5,
                Symbol("v5/earn/position") => 5,
                Symbol("v5/earn/yield") => 5,
                Symbol("v5/earn/hourly-yield") => 5
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("spot/v3/private/order") => 2.5,
                Symbol("spot/v3/private/cancel-order") => 2.5,
                Symbol("spot/v3/private/cancel-orders") => 2.5,
                Symbol("spot/v3/private/cancel-orders-by-ids") => 2.5,
                Symbol("spot/v3/private/purchase") => 2.5,
                Symbol("spot/v3/private/redeem") => 2.5,
                Symbol("spot/v3/private/cross-margin-loan") => 10,
                Symbol("spot/v3/private/cross-margin-repay") => 10,
                Symbol("asset/v3/private/transfer/inter-transfer") => 150,
                Symbol("asset/v3/private/withdraw/create") => 300,
                Symbol("asset/v3/private/withdraw/cancel") => 50,
                Symbol("asset/v3/private/transfer/sub-member-transfer") => 150,
                Symbol("asset/v3/private/transfer/transfer-sub-member-save") => 150,
                Symbol("asset/v3/private/transfer/universal-transfer") => 10,
                Symbol("user/v3/private/create-sub-member") => 10,
                Symbol("user/v3/private/create-sub-api") => 10,
                Symbol("user/v3/private/update-api") => 10,
                Symbol("user/v3/private/delete-api") => 10,
                Symbol("user/v3/private/update-sub-api") => 10,
                Symbol("user/v3/private/delete-sub-api") => 10,
                Symbol("contract/v3/private/copytrading/order/create") => 30,
                Symbol("contract/v3/private/copytrading/order/cancel") => 30,
                Symbol("contract/v3/private/copytrading/order/close") => 30,
                Symbol("contract/v3/private/copytrading/position/close") => 40,
                Symbol("contract/v3/private/copytrading/position/set-leverage") => 40,
                Symbol("contract/v3/private/copytrading/wallet/transfer") => 25,
                Symbol("contract/v3/private/copytrading/order/trading-stop") => 2.5,
                Symbol("contract/v3/private/order/create") => 1,
                Symbol("contract/v3/private/order/cancel") => 1,
                Symbol("contract/v3/private/order/cancel-all") => 1,
                Symbol("contract/v3/private/order/replace") => 1,
                Symbol("contract/v3/private/position/set-auto-add-margin") => 1,
                Symbol("contract/v3/private/position/switch-isolated") => 1,
                Symbol("contract/v3/private/position/switch-mode") => 1,
                Symbol("contract/v3/private/position/switch-tpsl-mode") => 1,
                Symbol("contract/v3/private/position/set-leverage") => 1,
                Symbol("contract/v3/private/position/trading-stop") => 1,
                Symbol("contract/v3/private/position/set-risk-limit") => 1,
                Symbol("contract/v3/private/account/setMarginMode") => 1,
                Symbol("unified/v3/private/order/create") => 30,
                Symbol("unified/v3/private/order/replace") => 30,
                Symbol("unified/v3/private/order/cancel") => 30,
                Symbol("unified/v3/private/order/create-batch") => 30,
                Symbol("unified/v3/private/order/replace-batch") => 30,
                Symbol("unified/v3/private/order/cancel-batch") => 30,
                Symbol("unified/v3/private/order/cancel-all") => 30,
                Symbol("unified/v3/private/position/set-leverage") => 2.5,
                Symbol("unified/v3/private/position/tpsl/switch-mode") => 2.5,
                Symbol("unified/v3/private/position/set-risk-limit") => 2.5,
                Symbol("unified/v3/private/position/trading-stop") => 2.5,
                Symbol("unified/v3/private/account/upgrade-unified-account") => 2.5,
                Symbol("unified/v3/private/account/setMarginMode") => 2.5,
                Symbol("fht/compliance/tax/v3/private/registertime") => 50,
                Symbol("fht/compliance/tax/v3/private/create") => 50,
                Symbol("fht/compliance/tax/v3/private/status") => 50,
                Symbol("fht/compliance/tax/v3/private/url") => 50,
                Symbol("v5/order/create") => 2.5,
                Symbol("v5/order/amend") => 5,
                Symbol("v5/order/cancel") => 2.5,
                Symbol("v5/order/cancel-all") => 50,
                Symbol("v5/order/create-batch") => 5,
                Symbol("v5/order/amend-batch") => 5,
                Symbol("v5/order/cancel-batch") => 5,
                Symbol("v5/order/disconnected-cancel-all") => 5,
                Symbol("v5/order/pre-check") => 5,
                Symbol("v5/position/set-leverage") => 5,
                Symbol("v5/position/switch-isolated") => 5,
                Symbol("v5/position/set-tpsl-mode") => 5,
                Symbol("v5/position/switch-mode") => 5,
                Symbol("v5/position/set-risk-limit") => 5,
                Symbol("v5/position/trading-stop") => 5,
                Symbol("v5/position/set-auto-add-margin") => 5,
                Symbol("v5/position/add-margin") => 5,
                Symbol("v5/position/move-positions") => 5,
                Symbol("v5/position/confirm-pending-mmr") => 5,
                Symbol("v5/account/upgrade-to-uta") => 5,
                Symbol("v5/account/quick-repayment") => 5,
                Symbol("v5/account/set-margin-mode") => 5,
                Symbol("v5/account/set-hedging-mode") => 5,
                Symbol("v5/account/mmp-modify") => 5,
                Symbol("v5/account/mmp-reset") => 5,
                Symbol("v5/account/borrow") => 5,
                Symbol("v5/account/repay") => 5,
                Symbol("v5/account/no-convert-repay") => 5,
                Symbol("v5/account/set-limit-px-action") => 5,
                Symbol("v5/account/set-delta-mode") => 5,
                Symbol("v5/asset/exchange/quote-apply") => 1,
                Symbol("v5/asset/exchange/convert-execute") => 1,
                Symbol("v5/asset/transfer/inter-transfer") => 50,
                Symbol("v5/asset/transfer/save-transfer-sub-member") => 150,
                Symbol("v5/asset/transfer/universal-transfer") => 10,
                Symbol("v5/asset/deposit/deposit-to-account") => 5,
                Symbol("v5/asset/travel-rule/deposit/submit") => 5,
                Symbol("v5/asset/withdraw/create") => 50,
                Symbol("v5/asset/withdraw/cancel") => 50,
                Symbol("v5/asset/covert/get-quote") => 10,
                Symbol("v5/asset/covert/small-balance-execute") => 10,
                Symbol("v5/fiat/quote-apply") => 10,
                Symbol("v5/fiat/trade-execute") => 10,
                Symbol("v5/user/create-sub-member") => 10,
                Symbol("v5/user/create-sub-api") => 10,
                Symbol("v5/user/frozen-sub-member") => 10,
                Symbol("v5/user/update-api") => 10,
                Symbol("v5/user/update-sub-api") => 10,
                Symbol("v5/user/delete-api") => 10,
                Symbol("v5/user/delete-sub-api") => 10,
                Symbol("v5/user/agreement") => 10,
                Symbol("v5/user/create-demo-member") => 10,
                Symbol("v5/spot-lever-token/purchase") => 2.5,
                Symbol("v5/spot-lever-token/redeem") => 2.5,
                Symbol("v5/spot-margin-trade/switch-mode") => 5,
                Symbol("v5/spot-margin-trade/set-leverage") => 5,
                Symbol("v5/spot-margin-trade/set-auto-repay-mode") => 5,
                Symbol("v5/spot-margin-trade/fixedborrow") => 5,
                Symbol("v5/spot-margin-trade/fixedborrow-renew") => 5,
                Symbol("v5/spot-cross-margin-trade/loan") => 2.5,
                Symbol("v5/spot-cross-margin-trade/repay") => 2.5,
                Symbol("v5/spot-cross-margin-trade/switch") => 2.5,
                Symbol("v5/crypto-loan/borrow") => 5,
                Symbol("v5/crypto-loan/repay") => 5,
                Symbol("v5/crypto-loan/adjust-ltv") => 5,
                Symbol("v5/crypto-loan-common/adjust-ltv") => 50,
                Symbol("v5/crypto-loan-common/max-loan") => 10,
                Symbol("v5/crypto-loan-flexible/borrow") => 50,
                Symbol("v5/crypto-loan-flexible/repay") => 50,
                Symbol("v5/crypto-loan-flexible/repay-collateral") => 50,
                Symbol("v5/crypto-loan-fixed/borrow") => 50,
                Symbol("v5/crypto-loan-fixed/renew") => 50,
                Symbol("v5/crypto-loan-fixed/supply") => 50,
                Symbol("v5/crypto-loan-fixed/borrow-order-cancel") => 50,
                Symbol("v5/crypto-loan-fixed/supply-order-cancel") => 50,
                Symbol("v5/crypto-loan-fixed/fully-repay") => 50,
                Symbol("v5/crypto-loan-fixed/repay-collateral") => 50,
                Symbol("v5/ins-loan/association-uid") => 5,
                Symbol("v5/ins-loan/repay-loan") => 5,
                Symbol("v5/lending/purchase") => 5,
                Symbol("v5/lending/redeem") => 5,
                Symbol("v5/lending/redeem-cancel") => 5,
                Symbol("v5/account/set-collateral-switch") => 5,
                Symbol("v5/account/set-collateral-switch-batch") => 5,
                Symbol("v5/account/demo-apply-money") => 5,
                Symbol("v5/broker/award/info") => 5,
                Symbol("v5/broker/award/distribute-award") => 5,
                Symbol("v5/broker/award/distribution-record") => 5,
                Symbol("v5/earn/place-order") => 5
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
            Symbol("ARBONE") => "ARBI",
            Symbol("ARBNOVA") => "ARBINOVA",
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
            Symbol("MATIC") => "MATIC"
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
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeListN(result, ["list", "rows", "data", "dataList"], []);
    paginationCursor = safeString2(result, "nextPageCursor", "cursor");
    dataLength = length(data);
    if functions.ccxtruthy(@functions.ccxt_and((paginationCursor != nothing), (functions.ccxt_gt(dataLength, 0))))
        first_var = get(data, 1, nothing);
        first_var[Symbol("nextPageCursor")] = paginationCursor;
        data[1] = first_var;
    end
    return data

end
function isUnifiedEnabled(self::Bybit, params=Dict())
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
        promises = asyncmap(Base.fetch, rawPromises);
        response = get(promises, 1, nothing);
        accountInfo = get(promises, 2, nothing);
        result = self.safeDict(response, "result", Dict{Symbol, Any}());
        accountResult = self.safeDict(accountInfo, "result", Dict{Symbol, Any}());
        self.options[Symbol("enableUnifiedMargin")] = safeInteger(result, "unified") == 1;
        self.options[Symbol("enableUnifiedAccount")] = safeInteger(result, "uta") == 1;
        self.options[Symbol("unifiedMarginStatus")] = safeInteger(accountResult, "unifiedMarginStatus", 6);
    end
    return [get(self.options, Symbol("enableUnifiedMargin"), nothing), get(self.options, Symbol("enableUnifiedAccount"), nothing)]

end
function upgradeUnifiedTradeAccount(self::Bybit, params=Dict())
    return self.privatePostV5AccountUpgradeToUta(params)

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
function safeMarket(self::Bybit, marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    isOption = @functions.ccxt_and((marketId != nothing), (@functions.ccxt_or((findfirst("-C", marketId) !== nothing), (findfirst("-P", marketId) !== nothing))));
    if functions.ccxtruthy(@functions.ccxt_and(isOption, !functions.ccxtruthy((ccxt_in(marketId, self.markets_by_id)))))
            return self.createExpiredOptionMarket(marketId)
    end
    return safeMarket(self.parent, marketId, market, delimiter, marketType)

end
function getBybitType(self::Bybit, method, market, params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams(method, market, params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams(method, market, params);
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
function fetchStatus(self::Bybit, params=Dict())
    response = self.publicGetV5SystemStatus(params);
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    list = self.safeList(result, "list", []);
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
function fetchTime(self::Bybit, params=Dict())
    response = self.publicGetV5MarketTime(params);
    return safeInteger(response, "time")

end
function fetchCurrencies(self::Bybit, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(self.checkRequiredCredentials(false)))
            return Dict{Symbol, Any}()
    end
    if functions.ccxtruthy(get(self.options, Symbol("enableDemoTrading"), nothing))
            return Dict{Symbol, Any}()
    end
    response = self.privateGetV5AssetCoinQueryInfo(params);
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseCurrencies(rows)

end
function parseCurrency(self::Bybit, currency)
    currencyId = safeString(currency, "coin");
    code = self.safeCurrencyCode(currencyId);
    name = safeString(currency, "name");
    chains = self.safeList(currency, "chains", []);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chain = get(chains, j + 1, nothing);
        networkId = safeString(chain, "chain");
        networkCode = self.networkIdToCode(networkId, code);
        networks[Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("info") => chain,
            Symbol("id") => networkId,
            Symbol("network") => networkCode,
            Symbol("active") => nothing,
            Symbol("deposit") => safeInteger(chain, "chainDeposit") == 1,
            Symbol("withdraw") => safeInteger(chain, "chainWithdraw") == 1,
            Symbol("fee") => self.safeNumber(chain, "withdrawFee"),
            Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(chain, "minAccuracy"))),
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
function fetchMarkets(self::Bybit, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        self.loadTimeDifference();
    end
    promisesUnresolved = [];
    types = nothing;
    defaultTypes = ["spot", "linear", "inverse", "option"];
    fetchMarketsOptions = self.safeDict(self.options, "fetchMarkets");
    if functions.ccxtruthy(fetchMarketsOptions != nothing)
        types = self.safeList(fetchMarketsOptions, "types", defaultTypes);
    else
        types = self.safeList(self.options, "fetchMarkets", defaultTypes);
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(types)))
        marketType = get(types, i + 1, nothing);
        if functions.ccxtruthy(marketType == "spot")
                        push!(promisesUnresolved, self.fetchSpotMarkets(params));
        elseif functions.ccxtruthy(marketType == "linear")
            push!(promisesUnresolved, self.fetchFutureMarkets(Dict{Symbol, Any}(
    Symbol("category") => "linear"
)));
        else
            if functions.ccxtruthy(marketType == "inverse")
                                push!(promisesUnresolved, self.fetchFutureMarkets(Dict{Symbol, Any}(
    Symbol("category") => "inverse"
)));
            elseif functions.ccxtruthy(marketType == "option")
                optionsCurrencies = self.safeList(fetchMarketsOptions, "options", ["BTC", "ETH", "SOL"]);
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
    promises = asyncmap(Base.fetch, promisesUnresolved);
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
    usePrivateInstrumentsInfo = self.handleOption("fetchMarkets", "usePrivateInstrumentsInfo", false);
    if functions.ccxtruthy(usePrivateInstrumentsInfo)
        response = self.privateGetV5MarketInstrumentsInfo(extend(request, params));
    else
        response = self.publicGetV5MarketInstrumentsInfo(extend(request, params));
    end
    responseResult = self.safeDict(response, "result", Dict{Symbol, Any}());
    markets = self.safeList(responseResult, "list", []);
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
        push!(result, self.safeMarketStructure(Dict{Symbol, Any}(
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
        Symbol("price") => self.safeNumber(priceFilter, "tickSize", quotePrecision)
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
function fetchFutureMarkets(self::Bybit, params=Dict())
    params = extend(params, Dict{Symbol, Any}());
    params[Symbol("limit")] = 1000;
    preLaunchMarkets = [];
    usePrivateInstrumentsInfo = self.handleOption("fetchMarkets", "usePrivateInstrumentsInfo", false);
    response = nothing;
    if functions.ccxtruthy(usePrivateInstrumentsInfo)
        response = self.privateGetV5MarketInstrumentsInfo(params);
    else
        linearPromises = [self.publicGetV5MarketInstrumentsInfo(params), self.publicGetV5MarketInstrumentsInfo(extend(params, Dict{Symbol, Any}(
            Symbol("status") => "PreLaunch"
        )))];
        promises = asyncmap(Base.fetch, linearPromises);
        response = self.safeDict(promises, 0, Dict{Symbol, Any}());
        preLaunchMarkets = self.safeDict(promises, 1, Dict{Symbol, Any}());
    end
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    markets = self.safeList(data, "list", []);
    paginationCursor = safeString(data, "nextPageCursor");
    if functions.ccxtruthy(paginationCursor != nothing)
        while functions.ccxtruthy(paginationCursor != nothing)
            params[Symbol("cursor")] = paginationCursor;
            
            if functions.ccxtruthy(usePrivateInstrumentsInfo)
                responseInner = self.privateGetV5MarketInstrumentsInfo(params);
            else
                responseInner = self.publicGetV5MarketInstrumentsInfo(params);
            end
            dataNew = self.safeDict(responseInner, "result", Dict{Symbol, Any}());
            rawMarkets = self.safeList(dataNew, "list", []);
            rawMarketsLength = length(rawMarkets);
            if functions.ccxtruthy(rawMarketsLength == 0)
                break
            end
            markets = arrayConcat(rawMarkets, markets);
            paginationCursor = safeString(dataNew, "nextPageCursor");
        end

    end
    preLaunchData = self.safeDict(preLaunchMarkets, "result", Dict{Symbol, Any}());
    preLaunchMarketsList = self.safeList(preLaunchData, "list", []);
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
        lotSizeFilter = self.safeDict(market, "lotSizeFilter", Dict{Symbol, Any}());
        priceFilter = self.safeDict(market, "priceFilter", Dict{Symbol, Any}());
        leverage = self.safeDict(market, "leverageFilter", Dict{Symbol, Any}());
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
        parsedMarket = self.safeMarketStructure(Dict{Symbol, Any}(
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
            Symbol("taker") => self.safeNumber(market, "takerFee", self.parseNumber("0.0006")),
            Symbol("maker") => self.safeNumber(market, "makerFee", self.parseNumber("0.0001")),
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
    usePrivateInstrumentsInfo = self.handleOption("fetchMarkets", "usePrivateInstrumentsInfo", false);
    if functions.ccxtruthy(usePrivateInstrumentsInfo)
        response = self.privateGetV5MarketInstrumentsInfo(extend(request, params));
    else
        response = self.publicGetV5MarketInstrumentsInfo(extend(request, params));
    end
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    markets = self.safeList(data, "list", []);
    loadAllOptions = self.handleOption("fetchMarkets", "loadAllOptions");
    if functions.ccxtruthy(loadAllOptions)
        request[Symbol("limit")] = 1000;
        paginationCursor = safeString(data, "nextPageCursor");
        if functions.ccxtruthy(paginationCursor != nothing)
            while functions.ccxtruthy(paginationCursor != nothing)
                request[Symbol("cursor")] = paginationCursor;
                
                if functions.ccxtruthy(usePrivateInstrumentsInfo)
                    responseInner = self.privateGetV5MarketInstrumentsInfo(extend(request, params));
                else
                    responseInner = self.publicGetV5MarketInstrumentsInfo(extend(request, params));
                end
                dataNew = self.safeDict(responseInner, "result", Dict{Symbol, Any}());
                rawMarkets = self.safeList(dataNew, "list", []);
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
        lotSizeFilter = self.safeDict(market, "lotSizeFilter", Dict{Symbol, Any}());
        priceFilter = self.safeDict(market, "priceFilter", Dict{Symbol, Any}());
        status = safeString(market, "status");
        expiry = safeInteger(market, "deliveryTime");
        splitId = split(id, "-");
        strike = safeString(splitId, 2);
        optionLetter = safeString(splitId, 3);
        isActive = (status == "Trading");
        isInverse = base == settle;
        loadExpiredOptions = self.handleOption("fetchMarkets", "loadExpiredOptions");
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(isActive, loadAllOptions), loadExpiredOptions))
                        push!(result, self.safeMarketStructure(Dict{Symbol, Any}(
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
    Symbol("taker") => self.safeNumber(market, "takerFee", self.parseNumber("0.0006")),
    Symbol("maker") => self.safeNumber(market, "makerFee", self.parseNumber("0.0001")),
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
function parseTicker(self::Bybit, ticker, market=nothing)
    isSpot = safeString(ticker, "openInterestValue") == nothing;
    timestamp = safeInteger(ticker, "time");
    marketId = safeString(ticker, "symbol");
    type_var = functions.ccxtruthy(isSpot) ? "spot" : "contract";
    market = self.safeMarket(marketId, market, nothing, type_var);
    symbol = self.safeSymbol(marketId, market, nothing, type_var);
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
), market)

end
function fetchTicker(self::Bybit, symbol, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTicker() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    category = nothing;
    (category, params) = self.getBybitType("fetchTicker", market, params);
    request[Symbol("category")] = category;
    response = self.publicGetV5MarketTickers(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    tickers = self.safeList(result, "list", []);
    rawTicker = self.safeDict(tickers, 0);
    return self.parseTicker(rawTicker, market)

end
function fetchTickers(self::Bybit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    code = safeStringN(params, ["code", "currency", "baseCoin"]);
    market = nothing;
    parsedSymbols = nothing;
    if functions.ccxtruthy(symbols != nothing)
        parsedSymbols = [];
        marketTypeInfo = self.handleMarketTypeAndParams("fetchTickers", nothing, params);
        defaultType = get(marketTypeInfo, 1, nothing);
        currentType = nothing;
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            symbol = get(symbols, i + 1, nothing);
            isExchangeSpecificSymbol = (findfirst("/", symbol) === nothing);
            if functions.ccxtruthy(isExchangeSpecificSymbol)
                market = self.safeMarket(symbol, nothing, nothing, defaultType);
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
    (category, params) = self.getBybitType("fetchTickers", market, params);
    request[Symbol("category")] = category;
    if functions.ccxtruthy(category == "option")
        request[Symbol("category")] = "option";
        if functions.ccxtruthy(code == nothing)
            code = "BTC";
        end
        request[Symbol("baseCoin")] = code;
    end
    response = self.publicGetV5MarketTickers(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    tickerList = self.safeList(result, "list", []);
    return self.parseTickers(tickerList, parsedSymbols)

end
function fetchBidsAsks(self::Bybit, symbols=nothing, params=Dict())
    return self.fetchTickers(symbols, params)

end
function parseOHLCV(self::Bybit, ohlcv, market=nothing)
    isInverse = self.safeBool(market, "inverse");
    volumeIndex = functions.ccxtruthy((isInverse)) ? 6 : 5;
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, volumeIndex)]

end
function fetchOHLCV(self::Bybit, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOHLCV() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 1000)
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit == nothing)
        limit = 200;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("end", request, params);
    request[Symbol("interval")] = safeString(self.timeframes, timeframe, timeframe);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("category")] = "spot";
        response = self.publicGetV5MarketKline(extend(request, params));
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
            response = self.publicGetV5MarketMarkPriceKline(extend(request, params));
        elseif functions.ccxtruthy(price == "index")
            response = self.publicGetV5MarketIndexPriceKline(extend(request, params));
        else
            if functions.ccxtruthy(price == "premiumIndex")
                response = self.publicGetV5MarketPremiumIndexPriceKline(extend(request, params));
            else
                response = self.publicGetV5MarketKline(extend(request, params));
            end

        end
    end
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    ohlcvs = self.safeList(result, "list", []);
    return self.parseOHLCVs(ohlcvs, market, timeframe, since, limit)

end
function parseFundingRate(self::Bybit, ticker, market=nothing)
    timestamp = safeInteger(ticker, "timestamp");
    ticker = omit(ticker, "timestamp");
    marketId = safeString(ticker, "symbol");
    symbol = self.safeSymbol(marketId, market, nothing, "swap");
    fundingRate = self.safeNumber(ticker, "fundingRate");
    fundingTimestamp = safeInteger(ticker, "nextFundingTime");
    markPrice = self.safeNumber(ticker, "markPrice");
    indexPrice = self.safeNumber(ticker, "indexPrice");
    info = self.safeDict(self.safeMarket(marketId, market, nothing, "swap"), "info");
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
function fetchFundingRates(self::Bybit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols);
        market = self.market(get(symbols, 1, nothing));
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 1)
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchFundingRates", market, params);
    if functions.ccxtruthy(type_var != "swap")
        throw(NotSupported(string(self.id, " fetchFundingRates() does not support ", type_var, " markets")));
    else
        subType = nothing;
        (subType, params) = self.handleSubTypeAndParams("fetchFundingRates", market, params, "linear");
        request[Symbol("category")] = subType;
    end
    response = self.publicGetV5MarketTickers(extend(request, params));
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    tickerList = self.safeList(data, "list", []);
    timestamp = safeInteger(response, "time");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickerList)))
        tickerList[i + 1][Symbol("timestamp")] = timestamp;
        i += 1
    end
    return self.parseFundingRates(tickerList, symbols)

end
function fetchFundingRateHistory(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallDynamic("fetchFundingRateHistory", symbol, since, limit, params, 200)
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
    (type_var, params) = self.getBybitType("fetchFundingRateHistory", market, params);
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
    response = self.publicGetV5MarketFundingHistory(extend(request, params));
    rates = [];
    result = self.safeDict(response, "result");
    resultList = self.safeList(result, "list", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(resultList)))
        entry = get(resultList, i + 1, nothing);
        timestamp = safeInteger(entry, "fundingRateTimestamp");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => self.safeSymbol(safeString(entry, "symbol"), nothing, nothing, "swap"),
    Symbol("fundingRate") => self.safeNumber(entry, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, symbol, since, limit)

end
function parseTrade(self::Bybit, trade, market=nothing)
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
    market = self.safeMarket(marketId, market, nothing, marketType);
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
), market)

end
function fetchTrades(self::Bybit, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchTrades", market, params);
    request[Symbol("category")] = type_var;
    response = self.publicGetV5MarketRecentTrade(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    trades = self.safeList(result, "list", []);
    return self.parseTrades(trades, market, since, limit)

end
function fetchOrderBook(self::Bybit, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrderBook() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
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
    response = self.publicGetV5MarketOrderbook(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    timestamp = safeInteger(result, "ts");
    return self.parseOrderBook(result, symbol, timestamp, "b", "a")

end
function parseBalance(self::Bybit, response)
    timestamp = safeInteger(response, "time");
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    responseResult = self.safeDict(response, "result", Dict{Symbol, Any}());
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
                coins = self.safeList(entry, "coin", []);
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
                    result[Symbol(code)] = account;
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
                result[Symbol(code)] = account;
            end
            i += 1
        end
    end
    return self.safeBalance(result)

end
function fetchBalance(self::Bybit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}();
    (enableUnifiedMargin, enableUnifiedAccount) = (self.isUnifiedEnabled());
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchBalance", nothing, params);
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
    accountTypes = self.safeDict(self.options, "accountsByType", Dict{Symbol, Any}());
    unifiedType = safeStringUpper(accountTypes, type_var, type_var);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBalance", params);
    if functions.ccxtruthy(@functions.ccxt_and(isSpot, (marginMode != nothing)))
        response = self.privateGetV5SpotCrossMarginTradeAccount(extend(request, params));
    elseif functions.ccxtruthy(isFunding)
        request[Symbol("accountType")] = "FUND";
        response = self.privateGetV5AssetTransferQueryAccountCoinsBalance(extend(request, params));
    else
        request[Symbol("accountType")] = unifiedType;
        response = self.privateGetV5AccountWalletBalance(extend(request, params));
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
function parseOrder(self::Bybit, order, market=nothing)
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
    Symbol("symbol") => self.safeSymbol(safeString(order, "symbol"), nothing, nothing, inferredMarketType)
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
    market = self.safeMarket(marketId, market, nothing, marketType);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger2(order, "createdTime", "createdAt");
    marketUnit = safeString(order, "marketUnit", "baseCoin");
    id = safeString(order, "orderId");
    type_var = safeStringLower(order, "orderType");
    price = safeString(order, "price");
    amount = nothing;
    cost = nothing;
    if functions.ccxtruthy(marketUnit == "baseCoin")
        amount = safeString(order, "qty");
        cost = safeString(order, "cumExecValue");
    else
        cost = safeString(order, "cumExecValue");
    end
    filled = safeString(order, "cumExecQty");
    remaining = safeString(order, "leavesQty");
    lastTradeTimestamp = safeInteger2(order, "updatedTime", "updatedAt");
    rawStatus = safeString(order, "orderStatus");
    status = self.parseOrderStatus(rawStatus);
    side = safeStringLower(order, "side");
    fee = nothing;
    cumFeeDetail = self.safeDict(order, "cumFeeDetail", Dict{Symbol, Any}());
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
), market)

end
function createMarketBuyOrderWithCost(self::Bybit, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return self.createOrder(symbol, "market", "buy", -1, nothing, extend(req, params))

end
function createMarketSellOrderWithCost(self::Bybit, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    types = self.isUnifiedEnabled();
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
    return self.createOrder(symbol, "market", "sell", -1, nothing, extend(req, params))

end
function createOrder(self::Bybit, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    parts = self.isUnifiedEnabled();
    enableUnifiedAccount = get(parts, 2, nothing);
    isTrailingOrder = safeString2(params, "trailingAmount", "trailingStop") != nothing;
    isStopLossOrder = safeString(params, "stopLossPrice") != nothing;
    isTakeProfitOrder = safeString(params, "takeProfitPrice") != nothing;
    orderRequest = self.createOrderRequest(symbol, type_var, side, amount, price, params, enableUnifiedAccount);
    switchToOco = @functions.ccxt_or((@functions.ccxt_and(isStopLossOrder, isTakeProfitOrder)), self.safeBool(params, "tradingStopEndpoint", false));
    defaultMethod = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(isTrailingOrder, switchToOco)), !functions.ccxtruthy(get(market, Symbol("spot"), nothing))))
        defaultMethod = "privatePostV5PositionTradingStop";
    else
        defaultMethod = "privatePostV5OrderCreate";
    end
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "createOrder", "method", defaultMethod);
    if functions.ccxtruthy(method == "privatePostV5PositionTradingStop")
        response = self.privatePostV5PositionTradingStop(orderRequest);
    else
        response = self.privatePostV5OrderCreate(orderRequest);
    end
    order = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(order, market)

end
function createOrderRequest(self::Bybit, symbol, type_var, side, amount, price=nothing, params=Dict(), isUTA=true)
    market = self.market(symbol);
    symbol = get(market, Symbol("symbol"), nothing);
    lowerCaseType = lowercase(type_var);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    hedged = self.safeBool(params, "hedged", false);
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
    switchToOco = @functions.ccxt_or((@functions.ccxt_and(isStopLossOrder, isTakeProfitOrder)), self.safeBool(params, "tradingStopEndpoint", false));
    defaultMethod = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(isTrailingOrder, switchToOco))
        defaultMethod = "privatePostV5PositionTradingStop";
    else
        defaultMethod = "privatePostV5OrderCreate";
    end
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "createOrder", "method", defaultMethod);
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
        (postOnly, params) = self.handlePostOnly(isMarket, timeInForce == "postonly", params);
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
    (category, params) = self.getBybitType("createOrderRequest", market, params);
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
function createOrders(self::Bybit, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    accounts = self.isUnifiedEnabled();
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
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        orderRequest = self.createOrderRequest(marketId, type_var, side, amount, price, orderParams, isUta);
        delete!(orderRequest, :category);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    symbols = self.marketSymbols(orderSymbols, nothing, false, true, true);
    market = self.market(get(symbols, 1, nothing));
    unifiedMarginStatus = safeInteger(self.options, "unifiedMarginStatus", 6);
    category = nothing;
    (category, params) = self.getBybitType("createOrders", market, params);
    if functions.ccxtruthy(@functions.ccxt_and((category == "inverse"), (functions.ccxt_lt(unifiedMarginStatus, 5))))
        throw(NotSupported(string(self.id, " createOrders does not allow inverse orders for non UTA2.0 account")));
    end
    request = Dict{Symbol, Any}(
        Symbol("category") => category,
        Symbol("request") => ordersRequests
    );
    response = self.privatePostV5OrderCreateBatch(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "list", []);
    retInfo = self.safeDict(response, "retExtInfo", Dict{Symbol, Any}());
    codes = self.safeList(retInfo, "list", []);
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
function editOrderRequest(self::Bybit, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
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
    (category, params) = self.getBybitType("editOrderRequest", market, params);
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
function editOrder(self::Bybit, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = self.editOrderRequest(id, symbol, type_var, side, amount, price, params);
    response = self.privatePostV5OrderAmend(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => safeString(result, "orderId"),
    Symbol("clientOrderId") => safeString(result, "orderLinkId")
), market)

end
function editOrders(self::Bybit, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
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
        orderParams = self.safeDict(rawOrder, "params", Dict{Symbol, Any}());
        orderRequest = self.editOrderRequest(id, symbol, type_var, side, amount, price, orderParams);
        delete!(orderRequest, :category);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    orderSymbols = self.marketSymbols(orderSymbols, nothing, false, true, true);
    market = self.market(get(orderSymbols, 1, nothing));
    unifiedMarginStatus = safeInteger(self.options, "unifiedMarginStatus", 6);
    category = nothing;
    (category, params) = self.getBybitType("editOrders", market, params);
    if functions.ccxtruthy(@functions.ccxt_and((category == "inverse"), (functions.ccxt_lt(unifiedMarginStatus, 5))))
        throw(NotSupported(string(self.id, " editOrders does not allow inverse orders for non UTA2.0 account")));
    end
    request = Dict{Symbol, Any}(
        Symbol("category") => category,
        Symbol("request") => ordersRequests
    );
    response = self.privatePostV5OrderAmendBatch(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "list", []);
    retInfo = self.safeDict(response, "retExtInfo", Dict{Symbol, Any}());
    codes = self.safeList(retInfo, "list", []);
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
function cancelOrderRequest(self::Bybit, id, symbol=nothing, params=Dict())
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        isTrigger = self.safeBool2(params, "stop", "trigger", false);
        params = omit(params, ["stop", "trigger"]);
        request[Symbol("orderFilter")] = functions.ccxtruthy(isTrigger) ? "StopOrder" : "Order";
    end
    if functions.ccxtruthy(id != nothing)
        request[Symbol("orderId")] = id;
    end
    category = nothing;
    (category, params) = self.getBybitType("cancelOrderRequest", market, params);
    request[Symbol("category")] = category;
    return extend(request, params)

end
function cancelOrder(self::Bybit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    requestExtended = self.cancelOrderRequest(id, symbol, params);
    response = self.privatePostV5OrderCancel(requestExtended);
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(result, market)

end
function cancelOrders(self::Bybit, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    types = self.isUnifiedEnabled();
    enableUnifiedAccount = get(types, 2, nothing);
    if functions.ccxtruthy(!functions.ccxtruthy(enableUnifiedAccount))
        throw(NotSupported(string(self.id, " cancelOrders() supports UTA accounts only")));
    end
    category = nothing;
    (category, params) = self.getBybitType("cancelOrders", market, params);
    if functions.ccxtruthy(category == "inverse")
        throw(NotSupported(string(self.id, " cancelOrders does not allow inverse orders")));
    end
    ordersRequests = [];
    clientOrderIds = self.safeList2(params, "clientOrderIds", "clientOids", []);
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
    response = self.privatePostV5OrderCancelBatch(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    row = self.safeList(result, "list", []);
    return self.parseOrders(row, market)

end
function cancelAllOrdersAfter(self::Bybit, timeout, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}(
        Symbol("timeWindow") => self.parseToInt(timeout / 1000)
    );
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("cancelAllOrdersAfter", nothing, params, "swap");
    productMap = Dict{Symbol, Any}(
        Symbol("spot") => "SPOT",
        Symbol("swap") => "DERIVATIVES",
        Symbol("option") => "OPTIONS"
    );
    product = safeString(productMap, type_var, type_var);
    request[Symbol("product")] = product;
    response = self.privatePostV5OrderDisconnectedCancelAll(extend(request, params));
    return response

end
function cancelOrdersForSymbols(self::Bybit, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    types = self.isUnifiedEnabled();
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
        (currentCategory, params) = self.getBybitType("cancelOrders", market, params);
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
    response = self.privatePostV5OrderCancelBatch(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    row = self.safeList(result, "list", []);
    return self.parseOrders(row)

end
function cancelAllOrders(self::Bybit, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    (enableUnifiedMargin, enableUnifiedAccount) = (self.isUnifiedEnabled());
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("cancelAllOrders", market, params);
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
    isTrigger = self.safeBool2(params, "stop", "trigger", false);
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(isTrigger)
        request[Symbol("orderFilter")] = "StopOrder";
    end
    response = self.privatePostV5OrderCancelAll(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    orders = self.safeList(result, "list");
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(orders)))
            return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]
    end
    return self.parseOrders(orders, market)

end
function fetchOrderClassic(self::Bybit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(NotSupported(string(self.id, " fetchOrder() is not supported for spot markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    result = self.fetchOrders(symbol, nothing, nothing, extend(request, params));
    len = length(result);
    if functions.ccxtruthy(len == 0)
        isTrigger = self.safeBoolN(params, ["trigger", "stop"], false);
        extra = functions.ccxtruthy(isTrigger) ? "" : " If you are trying to fetch SL/TP conditional order, you might try setting params[\"trigger\"] = true";
        throw(OrderNotFound(string("Order ", id, " was not found.", extra)));
    end
    if functions.ccxtruthy(functions.ccxt_gt(len, 1))
        throw(InvalidOrder(string(self.id, " returned more than one order")));
    end
    return safeValue(result, 0)

end
function fetchOrder(self::Bybit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    (enableUnifiedMargin, enableUnifiedAccount) = (self.isUnifiedEnabled());
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    if functions.ccxtruthy(!functions.ccxtruthy(isUnifiedAccount))
            return self.fetchOrderClassic(id, symbol, params)
    end
    acknowledge = false;
    (acknowledge, params) = self.handleOptionAndParams(params, "fetchOrder", "acknowledged");
    if functions.ccxtruthy(!functions.ccxtruthy(acknowledge))
        throw(ArgumentsRequired(string(self.id, " fetchOrder() can only access an order if it is in last 500 orders (of any status) for your account. Set params[\"acknowledged\"] = true to hide this warning. Alternatively, we suggest to use fetchOpenOrder or fetchClosedOrder")));
    end
    market = self.market(symbol);
    marketType = nothing;
    (marketType, params) = self.getBybitType("fetchOrder", market, params);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("orderId") => id,
        Symbol("category") => marketType
    );
    isTrigger = nothing;
    (isTrigger, params) = self.handleParamBool2(params, "trigger", "stop", false);
    if functions.ccxtruthy(isTrigger)
        request[Symbol("orderFilter")] = "StopOrder";
    end
    response = self.privateGetV5OrderRealtime(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    innerList = self.safeList(result, "list", []);
    if functions.ccxtruthy(length(innerList) == 0)
        extra = functions.ccxtruthy(isTrigger) ? "" : " If you are trying to fetch SL/TP conditional order, you might try setting params[\"trigger\"] = true";
        throw(OrderNotFound(string("Order ", id, " was not found.", extra)));
    end
    order = self.safeDict(innerList, 0, Dict{Symbol, Any}());
    return self.parseOrder(order, market)

end
function fetchOrders(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    res = self.isUnifiedEnabled();
    enableUnifiedAccount = self.safeBool(res, 1);
    if functions.ccxtruthy(enableUnifiedAccount)
        throw(NotSupported(string(self.id, " fetchOrders() is not supported after the 5/02 update for UTA accounts, please use fetchOpenOrders, fetchClosedOrders or fetchCanceledOrders")));
    end
    return self.fetchOrdersClassic(symbol, since, limit, params)

end
function fetchOrdersClassic(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchOrders", symbol, since, limit, params, "nextPageCursor", "cursor", nothing, 50)
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchOrders", market, params);
    if functions.ccxtruthy(type_var == "spot")
        throw(NotSupported(string(self.id, " fetchOrders() is not supported for spot markets")));
    end
    request[Symbol("category")] = type_var;
    isTrigger = self.safeBoolN(params, ["trigger", "stop"], false);
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
    response = self.privateGetV5OrderHistory(extend(request, params));
    data = self.addPaginationCursorToResult(response);
    return self.parseOrders(data, market, since, limit)

end
function fetchClosedOrder(self::Bybit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    result = self.fetchClosedOrders(symbol, nothing, nothing, extend(request, params));
    len = length(result);
    if functions.ccxtruthy(len == 0)
        isTrigger = self.safeBoolN(params, ["trigger", "stop"], false);
        extra = functions.ccxtruthy(isTrigger) ? "" : " If you are trying to fetch SL/TP conditional order, you might try setting params[\"trigger\"] = true";
        throw(OrderNotFound(string("Order ", id, " was not found.", extra)));
    end
    if functions.ccxtruthy(functions.ccxt_gt(len, 1))
        throw(InvalidOrder(string(self.id, " returned more than one order")));
    end
    return safeValue(result, 0)

end
function fetchOpenOrder(self::Bybit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    result = self.fetchOpenOrders(symbol, nothing, nothing, extend(request, params));
    len = length(result);
    if functions.ccxtruthy(len == 0)
        isTrigger = self.safeBoolN(params, ["trigger", "stop"], false);
        extra = functions.ccxtruthy(isTrigger) ? "" : " If you are trying to fetch SL/TP conditional order, you might try setting params[\"trigger\"] = true";
        throw(OrderNotFound(string("Order ", id, " was not found.", extra)));
    end
    if functions.ccxtruthy(functions.ccxt_gt(len, 1))
        throw(InvalidOrder(string(self.id, " returned more than one order")));
    end
    return safeValue(result, 0)

end
function fetchCanceledAndClosedOrders(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchCanceledAndClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchCanceledAndClosedOrders", symbol, since, limit, params, "nextPageCursor", "cursor", nothing, 50)
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchCanceledAndClosedOrders", market, params);
    request[Symbol("category")] = type_var;
    isTrigger = self.safeBoolN(params, ["trigger", "stop"], false);
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
    response = self.privateGetV5OrderHistory(extend(request, params));
    data = self.addPaginationCursorToResult(response);
    return self.parseOrders(data, market, since, limit)

end
function fetchClosedOrders(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}(
        Symbol("orderStatus") => "Filled"
    );
    return self.fetchCanceledAndClosedOrders(symbol, since, limit, extend(request, params))

end
function fetchCanceledOrders(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}(
        Symbol("orderStatus") => "Cancelled"
    );
    return self.fetchCanceledAndClosedOrders(symbol, since, limit, extend(request, params))

end
function fetchOpenOrders(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchOpenOrders", symbol, since, limit, params, "nextPageCursor", "cursor", nothing, 50)
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchOpenOrders", market, params);
    if functions.ccxtruthy(@functions.ccxt_or(type_var == "linear", type_var == "inverse"))
        baseCoin = safeString(params, "baseCoin");
        if functions.ccxtruthy(@functions.ccxt_and(symbol == nothing, baseCoin == nothing))
            defaultSettle = safeString(self.options, "defaultSettle", "USDT");
            settleCoin = safeString(params, "settleCoin", defaultSettle);
            request[Symbol("settleCoin")] = settleCoin;
        end
    end
    request[Symbol("category")] = type_var;
    isTrigger = self.safeBool2(params, "stop", "trigger", false);
    params = omit(params, ["stop", "trigger"]);
    if functions.ccxtruthy(isTrigger)
        request[Symbol("orderFilter")] = "StopOrder";
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = self.privateGetV5OrderRealtime(extend(request, params));
    data = self.addPaginationCursorToResult(response);
    return self.parseOrders(data, market, since, limit)

end
function fetchOrderTrades(self::Bybit, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOrderId", "orderLinkId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("orderLinkId")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    params = omit(params, ["clientOrderId", "orderLinkId"]);
    return self.fetchMyTrades(symbol, since, limit, extend(request, params))

end
function fetchMyTrades(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchMyTrades", symbol, since, limit, params, "nextPageCursor", "cursor", nothing, 100)
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
    (type_var, params) = self.getBybitType("fetchMyTrades", market, params);
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = self.privateGetV5ExecutionList(extend(request, params));
    trades = self.addPaginationCursorToResult(response);
    return self.parseTrades(trades, market, since, limit)

end
function parseDepositAddress(self::Bybit, depositAddress, currency=nothing)
    address = safeString(depositAddress, "addressDeposit");
    tag = safeString(depositAddress, "tagDeposit");
    code = safeString(currency, "code");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(safeString(depositAddress, "chain"), code),
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
function fetchDepositAddressesByNetwork(self::Bybit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("chainType")] = self.networkCodeToId(networkCode, code);
    end
    response = self.privateGetV5AssetDepositQueryAddress(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    chains = self.safeList(result, "chains", []);
    coin = safeString(result, "coin");
    currencyFromResponse = self.currency(coin);
    parsed = self.parseDepositAddresses(chains, [get(currencyFromResponse, Symbol("code"), nothing)], false, Dict{Symbol, Any}(
        Symbol("currency") => get(currencyFromResponse, Symbol("code"), nothing)
    ));
    return indexBy(parsed, "network")

end
function fetchDepositAddress(self::Bybit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    currency = self.currency(code);
    (networkCode, paramsOmited) = self.handleNetworkCodeAndParams(params);
    indexedAddresses = self.fetchDepositAddressesByNetwork(code, paramsOmited);
    selectedNetworkCode = self.selectNetworkCodeFromUnifiedNetworks(get(currency, Symbol("code"), nothing), networkCode, indexedAddresses);
    return get(indexedAddresses, selectedNetworkCode + 1, nothing)

end
function fetchDeposits(self::Bybit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDeposits", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchDeposits", code, since, limit, params, "nextPageCursor", "cursor", nothing, 50)
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
    response = self.privateGetV5AssetDepositQueryRecord(extend(request, params));
    data = self.addPaginationCursorToResult(response);
    return self.parseTransactions(data, currency, since, limit)

end
function fetchWithdrawals(self::Bybit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchWithdrawals", code, since, limit, params, "nextPageCursor", "cursor", nothing, 50)
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
    response = self.privateGetV5AssetWithdrawQueryRecord(extend(request, params));
    data = self.addPaginationCursorToResult(response);
    return self.parseTransactions(data, currency, since, limit)

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
function parseTransaction(self::Bybit, transaction, currency=nothing)
    currencyId = safeString(transaction, "coin");
    code = self.safeCurrencyCode(currencyId, currency);
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
    Symbol("network") => self.networkIdToCode(safeString(transaction, "chain"), code),
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
function fetchLedger(self::Bybit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchLedger", code, since, limit, params, "nextPageCursor", "cursor", nothing, 50)
    end
    request = Dict{Symbol, Any}();
    enableUnified = self.isUnifiedEnabled();
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
    (subType, params) = self.handleSubTypeAndParams("fetchLedger", nothing, params);
    if functions.ccxtruthy(get(enableUnified, 2, nothing))
        unifiedMarginStatus = safeInteger(self.options, "unifiedMarginStatus", 5);
        if functions.ccxtruthy(@functions.ccxt_and(subType == "inverse", (functions.ccxt_lt(unifiedMarginStatus, 5))))
            response = self.privateGetV5AccountContractTransactionLog(extend(request, params));
        else
            response = self.privateGetV5AccountTransactionLog(extend(request, params));
        end
    else
        response = self.privateGetV5AccountContractTransactionLog(extend(request, params));
    end
    data = self.addPaginationCursorToResult(response);
    return self.parseLedger(data, currency, since, limit)

end
function parseLedgerEntry(self::Bybit, item, currency=nothing)
    currencyId = safeString2(item, "coin", "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    currency = self.safeCurrency(currencyId, currency);
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
), currency)

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
function withdraw(self::Bybit, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    accountType = nothing;
    accounts = self.isUnifiedEnabled();
    isUta = get(accounts, 2, nothing);
    (accountType, params) = self.handleOptionAndParams(params, "withdraw", "accountType");
    if functions.ccxtruthy(accountType == nothing)
        accountType = functions.ccxtruthy(isUta) ? "UTA" : "SPOT";
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    self.checkAddress(address);
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
    networkId = self.networkCodeToId(networkCode, code);
    if functions.ccxtruthy(networkId != nothing)
        request[Symbol("chain")] =         uppercase(networkId);
    end
    response = self.privatePostV5AssetWithdrawCreate(extend(request, query));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseTransaction(result, currency)

end
function fetchPosition(self::Bybit, symbol, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchPosition() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchPosition", market, params);
    request[Symbol("category")] = type_var;
    response = self.privateGetV5PositionList(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    positions = self.safeList2(result, "list", "dataList", []);
    timestamp = safeInteger(response, "time");
    first_var = self.safeDict(positions, 0, Dict{Symbol, Any}());
    position = self.parsePosition(first_var, market);
    position[Symbol("timestamp")] = timestamp;
    position[Symbol("datetime")] = self.iso8601(timestamp);
    return position

end
function fetchPositions(self::Bybit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchPositions", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchPositions", symbols, nothing, nothing, params, "nextPageCursor", "cursor", nothing, 200)
    end
    symbol = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((symbols != nothing), functions.ccxt_isArray(symbols)))
        symbolsLength = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 1))
            throw(ArgumentsRequired(string(self.id, " fetchPositions() does not accept an array with more than one symbol")));
        elseif functions.ccxtruthy(symbolsLength == 1)
            symbol = get(symbols, 1, nothing);
        end
        symbols = self.marketSymbols(symbols);
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
    (type_var, params) = self.getBybitType("fetchPositions", market, params);
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
    response = self.privateGetV5PositionList(extend(request, params));
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
    return self.filterByArrayPositions(results, "symbol", symbols, false)

end
function parsePosition(self::Bybit, position, market=nothing)
    closedSize = safeString(position, "closedSize");
    isHistory = (closedSize != nothing);
    contract = safeString(position, "symbol");
    market = self.safeMarket(contract, market, nothing, "contract");
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
    timestamp = safeIntegerN(position, ["createdTime", "createdAt"]);
    lastUpdateTimestamp = self.parse8601(safeString(position, "updated_at"));
    if functions.ccxtruthy(lastUpdateTimestamp == nothing)
        lastUpdateTimestamp = safeIntegerN(position, ["updatedTime", "updatedAt", "updatedTime"]);
    end
    collateralString = safeString(position, "positionBalance");
    entryPrice = omitZero(safeStringN(position, ["entryPrice", "avgPrice", "avgEntryPrice"]));
    liquidationPrice = omitZero(safeString(position, "liqPrice"));
    leverage = safeString(position, "leverage");
    if functions.ccxtruthy(liquidationPrice != nothing)
        if functions.ccxtruthy(get(market, Symbol("settle"), nothing) == "USDC")
            price = functions.ccxtruthy(self.safeBool(self.options, "useMarkPriceForPositionCollateral", false)) ? markPrice : entryPrice;
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
function fetchLeverage(self::Bybit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    position = self.fetchPosition(symbol, params);
    return self.parseLeverage(position, market)

end
function parseLeverage(self::Bybit, leverage, market=nothing)
    marketId = safeString(leverage, "symbol");
    leverageValue = safeInteger(leverage, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => safeStringLower(leverage, "marginMode"),
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
function setMarginMode(self::Bybit, marginMode, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    (enableUnifiedMargin, enableUnifiedAccount) = (self.isUnifiedEnabled());
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
        response = self.privatePostV5AccountSetMarginMode(extend(request, params));
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
            response = self.privatePostV5AccountSetMarginMode(extend(request, params));
        else
            type_var = nothing;
            (type_var, params) = self.getBybitType("setPositionMode", market, params);
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
            response = self.privatePostV5PositionSwitchIsolated(extend(request, params));
        end
    end
    return response

end
function setLeverage(self::Bybit, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
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
    response = self.privatePostV5PositionSetLeverage(extend(request, params));
    return response

end
function setPositionMode(self::Bybit, hedged, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
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
        (type_var, params) = self.getBybitType("setPositionMode", market, params);
        request[Symbol("category")] = type_var;
    end
    params = omit(params, "type");
    response = self.privatePostV5PositionSwitchMode(extend(request, params));
    return response

end
function fetchDerivativesOpenInterestHistory(self::Bybit, symbol, timeframe="1h", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
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
    response = self.publicGetV5MarketOpenInterest(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.addPaginationCursorToResult(response);
    id = safeString(result, "symbol");
    safeMarketObj = self.safeMarket(id, market, nothing, "contract");
    return self.parseOpenInterestsHistory(data, safeMarketObj, since, limit)

end
function fetchOpenInterest(self::Bybit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
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
    response = self.publicGetV5MarketOpenInterest(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    id = safeString(result, "symbol");
    safeMarketObj = self.safeMarket(id, market, nothing, "contract");
    data = self.addPaginationCursorToResult(response);
    return self.parseOpenInterest(get(data, 1, nothing), safeMarketObj)

end
function fetchOpenInterestHistory(self::Bybit, symbol, timeframe="1h", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(timeframe == "1m")
        throw(BadRequest(string(self.id, " fetchOpenInterestHistory cannot use the 1m timeframe")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = self.safeBool(params, "paginate");
    if functions.ccxtruthy(paginate)
        params = omit(params, "paginate");
        params[Symbol("timeframe")] = timeframe;
            return self.fetchPaginatedCallCursor("fetchOpenInterestHistory", symbol, since, limit, params, "nextPageCursor", "cursor", nothing, 200)
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
    return self.fetchDerivativesOpenInterestHistory(symbol, timeframe, since, limit, params)

end
function parseOpenInterest(self::Bybit, interest, market=nothing)
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
), market)

end
function fetchCrossBorrowRate(self::Bybit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    response = self.privateGetV5SpotCrossMarginTradeLoanInfo(extend(request, params));
    timestamp = safeInteger(response, "time");
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    data[Symbol("timestamp")] = timestamp;
    return self.parseBorrowRate(data, currency)

end
function parseBorrowRate(self::Bybit, info, currency=nothing)
    timestamp = safeInteger(info, "timestamp");
    currencyId = safeString2(info, "coin", "currency");
    hourlyBorrowRate = self.safeNumber(info, "hourlyBorrowRate");
    period = functions.ccxtruthy((hourlyBorrowRate != nothing)) ? 3600000 : 86400000;
    return Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("rate") => self.safeNumber(info, "interestRate", hourlyBorrowRate),
    Symbol("period") => period,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
function fetchBorrowInterest(self::Bybit, code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}();
    response = self.privateGetV5SpotCrossMarginTradeAccount(extend(request, params));
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    rows = self.safeList(data, "loanAccountList", []);
    interest = self.parseBorrowInterests(rows);
    return self.filterByCurrencySinceLimit(interest, code, since, limit)

end
function fetchBorrowRateHistory(self::Bybit, code, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
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
    response = self.privateGetV5SpotMarginTradeInterestRateHistory(extend(request, params));
    data = self.safeDict(response, "result");
    rows = self.safeList(data, "list", []);
    return self.parseBorrowRateHistory(rows, code, since, limit)

end
function parseBorrowInterest(self::Bybit, info, market=nothing)
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
function transfer(self::Bybit, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    transferId = safeString(params, "transferId", uuid());
    accountTypes = self.safeDict(self.options, "accountsByType", Dict{Symbol, Any}());
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
    response = self.privatePostV5AssetTransferInterTransfer(extend(request, params));
    timestamp = safeInteger(response, "time");
    transfer = self.safeDict(response, "result", Dict{Symbol, Any}());
    statusRaw = safeStringN(response, ["retCode", "retMsg"]);
    status = self.parseTransferStatus(statusRaw);
    return extend(self.parseTransfer(transfer, currency), Dict{Symbol, Any}(
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("amount") => self.parseNumber(amountToPrecision),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => status
))

end
function fetchTransfers(self::Bybit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchTransfers", code, since, limit, params, "nextPageCursor", "cursor", nothing, 50)
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
    response = self.privateGetV5AssetTransferQueryInterTransferList(extend(request, params));
    data = self.addPaginationCursorToResult(response);
    return self.parseTransfers(data, currency, since, limit)

end
function borrowCrossMargin(self::Bybit, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = self.privatePostV5AccountBorrow(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseMarginLoan(result, currency)

end
function repayCrossMargin(self::Bybit, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => numberToString(amount)
    );
    response = self.privatePostV5AccountNoConvertRepay(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    transaction = self.parseMarginLoan(result, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount
))

end
function parseMarginLoan(self::Bybit, info, currency=nothing)
    currencyId = safeString(info, "coin");
    return Dict{Symbol, Any}(
    Symbol("id") => nothing,
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => safeString(info, "amount"),
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
function parseTransfer(self::Bybit, transfer, currency=nothing)
    currencyId = safeString(transfer, "coin");
    timestamp = safeInteger(transfer, "timestamp");
    fromAccountId = safeString(transfer, "fromAccountType");
    toAccountId = safeString(transfer, "toAccountType");
    accountIds = self.safeDict(self.options, "accountsById", Dict{Symbol, Any}());
    fromAccount = safeString(accountIds, fromAccountId, fromAccountId);
    toAccount = safeString(accountIds, toAccountId, toAccountId);
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "transferId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount,
    Symbol("status") => self.parseTransferStatus(safeString(transfer, "status"))
)

end
function fetchDerivativesMarketLeverageTiers(self::Bybit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
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
    response = self.publicGetV5MarketRiskLimit(extend(request, params));
    result = self.safeDict(response, "result");
    tiers = self.safeList(result, "list");
    return self.parseMarketLeverageTiers(tiers, market)

end
function fetchMarketLeverageTiers(self::Bybit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    market = self.market(symbol);
    if functions.ccxtruthy(@functions.ccxt_or(get(market, Symbol("spot"), nothing), get(market, Symbol("option"), nothing)))
        throw(BadRequest(string(self.id, " fetchMarketLeverageTiers() symbol does not support market ", symbol)));
    end
    request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    return self.fetchDerivativesMarketLeverageTiers(symbol, params)

end
function parseTradingFee(self::Bybit, fee, market=nothing)
    marketId = safeString(fee, "symbol");
    defaultType = functions.ccxtruthy((market != nothing)) ? get(market, Symbol("type"), nothing) : "contract";
    symbol = self.safeSymbol(marketId, market, nothing, defaultType);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => symbol,
    Symbol("maker") => self.safeNumber(fee, "makerFeeRate"),
    Symbol("taker") => self.safeNumber(fee, "takerFeeRate"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchTradingFee(self::Bybit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    category = nothing;
    (category, params) = self.getBybitType("fetchTradingFee", market, params);
    request[Symbol("category")] = category;
    response = self.privateGetV5AccountFeeRate(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    fees = self.safeList(result, "list", []);
    first_var = self.safeDict(fees, 0, Dict{Symbol, Any}());
    return self.parseTradingFee(first_var, market)

end
function fetchTradingFees(self::Bybit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    type_var = nothing;
    (type_var, params) = self.handleOptionAndParams(params, "fetchTradingFees", "type", "future");
    if functions.ccxtruthy(type_var == "spot")
        throw(NotSupported(string(self.id, " fetchTradingFees() is not supported for spot market")));
    end
    response = self.privateGetV5AccountFeeRate(params);
    fees = self.safeDict(response, "result", Dict{Symbol, Any}());
    fees = self.safeList(fees, "list", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fees)))
        fee = self.parseTradingFee(get(fees, i + 1, nothing));
        symbol = get(fee, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = fee;
        i += 1
    end
    return result

end
function parseDepositWithdrawFee(self::Bybit, fee, currency=nothing)
    chains = self.safeList(fee, "chains", []);
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
            networkCode = self.networkIdToCode(networkId, currencyCode);
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
            if functions.ccxtruthy(chainsLength == 1)
                result[Symbol("withdraw")][Symbol("fee")] = self.safeNumber(chain, "withdrawFee");
                result[Symbol("withdraw")][Symbol("percentage")] = false;
            end
            i += 1
        end

    end
    return result

end
function fetchDepositWithdrawFees(self::Bybit, codes=nothing, params=Dict())
    self.checkRequiredCredentials();
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    response = self.privateGetV5AssetCoinQueryInfo(params);
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    rows = self.safeList(data, "rows", []);
    return self.parseDepositWithdrawFees(rows, codes, "coin")

end
function fetchSettlementHistory(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchSettlementHistory", market, params);
    if functions.ccxtruthy(type_var == "spot")
        throw(NotSupported(string(self.id, " fetchSettlementHistory() is not supported for spot market")));
    end
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = self.publicGetV5MarketDeliveryPrice(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "list", []);
    settlements = self.parseSettlements(data, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, safeString(market, "symbol"), since, limit)

end
function fetchMySettlementHistory(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchMySettlementHistory", market, params);
    if functions.ccxtruthy(type_var == "spot")
        throw(NotSupported(string(self.id, " fetchMySettlementHistory() is not supported for spot market")));
    end
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = self.privateGetV5AssetDeliveryRecord(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "list", []);
    settlements = self.parseSettlements(data, market);
    sorted = sortBy(settlements, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, safeString(market, "symbol"), since, limit)

end
function parseSettlement(self::Bybit, settlement, market)
    timestamp = safeInteger(settlement, "deliveryTime");
    marketId = safeString(settlement, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => settlement,
    Symbol("symbol") => self.safeSymbol(marketId, market),
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
function fetchVolatilityHistory(self::Bybit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("category") => "option",
        Symbol("baseCoin") => get(currency, Symbol("id"), nothing)
    );
    response = self.publicGetV5MarketHistoricalVolatility(extend(request, params));
    volatility = self.safeList(response, "result", []);
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
function fetchGreeks(self::Bybit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("category") => "option"
    );
    response = self.publicGetV5MarketTickers(extend(request, params));
    timestamp = safeInteger(response, "time");
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "list", []);
    greeks = self.parseGreeks(get(data, 1, nothing), market);
    return extend(greeks, Dict{Symbol, Any}(
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
function fetchAllGreeks(self::Bybit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
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
    response = self.publicGetV5MarketTickers(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "list", []);
    return self.parseAllGreeks(data, symbols)

end
function parseGreeks(self::Bybit, greeks, market=nothing)
    marketId = safeString(greeks, "symbol");
    symbol = self.safeSymbol(marketId, market);
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
function fetchMyLiquidations(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyLiquidations", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchMyLiquidations", symbol, since, limit, params, "nextPageCursor", "cursor", nothing, 100)
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
    (type_var, params) = self.getBybitType("fetchMyLiquidations", market, params);
    request[Symbol("category")] = type_var;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = self.privateGetV5ExecutionList(extend(request, params));
    liquidations = self.addPaginationCursorToResult(response);
    return self.parseLiquidations(liquidations, market, since, limit)

end
function parseLiquidation(self::Bybit, liquidation, market=nothing)
    marketId = safeString(liquidation, "symbol");
    timestamp = safeInteger(liquidation, "execTime");
    contractsString = safeString(liquidation, "execQty");
    contractSizeString = safeString(market, "contractSize");
    priceString = safeString(liquidation, "execPrice");
    baseValueString = stringMul(contractsString, contractSizeString);
    quoteValueString = stringMul(baseValueString, priceString);
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("contracts") => self.parseNumber(contractsString),
    Symbol("contractSize") => self.parseNumber(contractSizeString),
    Symbol("price") => self.parseNumber(priceString),
    Symbol("baseValue") => self.parseNumber(baseValueString),
    Symbol("quoteValue") => self.parseNumber(quoteValueString),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
function getLeverageTiersPaginated(self::Bybit, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "getLeverageTiersPaginated", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("getLeverageTiersPaginated", symbol, nothing, nothing, params, "nextPageCursor", "cursor", nothing, 100)
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("getLeverageTiersPaginated", market, params, "linear");
    request = Dict{Symbol, Any}(
        Symbol("category") => subType
    );
    response = self.publicGetV5MarketRiskLimit(extend(request, params));
    result = self.addPaginationCursorToResult(response);
    first_var = self.safeDict(result, 0);
    total = length(result);
    lastIndex = total - 1;
    last_var = self.safeDict(result, lastIndex, Dict{Symbol, Any}());
    cursorValue = safeString(first_var, "nextPageCursor");
    last_var[Symbol("info")] = Dict{Symbol, Any}(
        Symbol("nextPageCursor") => cursorValue
    );
    result[lastIndex + 1] = last_var;
    return result

end
function fetchLeverageTiers(self::Bybit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
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
    data = self.getLeverageTiersPaginated(symbol, extend(Dict{Symbol, Any}(
        Symbol("paginate") => true,
        Symbol("paginationCalls") => 50
    ), params));
    symbols = self.marketSymbols(symbols);
    return self.parseLeverageTiers(data, symbols, "symbol")

end
function parseLeverageTiers(self::Bybit, response, symbols=nothing, marketIdKey=nothing)
    tiers = Dict{Symbol, Any}();
    marketIds = self.marketIds(symbols);
    filteredResults = self.filterByArray(response, marketIdKey, marketIds, false);
    grouped = groupBy(filteredResults, marketIdKey);
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
        market = self.safeMarket(marketId, nothing, nothing, "contract");
        symbol = get(market, Symbol("symbol"), nothing);
        tiers[Symbol(symbol)] = self.parseMarketLeverageTiers(sortBy(entry, "id"), market);
        i += 1
    end
    return tiers

end
function parseMarketLeverageTiers(self::Bybit, info, market=nothing)
    tiers = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(info)))
        tier = get(info, i + 1, nothing);
        marketId = safeString(info, "symbol");
        market = self.safeMarket(marketId);
        minNotional = self.parseNumber("0");
        if functions.ccxtruthy(i != 0)
            minNotional = self.safeNumber(get(info, i - 1 + 1, nothing), "riskLimitValue");
        end
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => safeInteger(tier, "id"),
    Symbol("symbol") => self.safeSymbol(marketId, market),
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
function fetchFundingHistory(self::Bybit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return self.fetchPaginatedCallCursor("fetchFundingHistory", symbol, since, limit, params, "nextPageCursor", "cursor", nothing, 100)
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
    (type_var, params) = self.getBybitType("fetchFundingHistory", market, params);
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
    response = self.privateGetV5ExecutionList(extend(request, params));
    fundings = self.addPaginationCursorToResult(response);
    return self.parseIncomes(fundings, market, since, limit)

end
function parseIncome(self::Bybit, income, market=nothing)
    marketId = safeString(income, "symbol");
    market = self.safeMarket(marketId, market, nothing, "contract");
    code = "USDT";
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        code = get(market, Symbol("quote"), nothing);
    end
    timestamp = safeInteger(income, "execTime");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => self.safeSymbol(marketId, market, "-", "swap"),
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(income, "execId"),
    Symbol("amount") => self.safeNumber(income, "execFee"),
    Symbol("rate") => self.safeNumber(income, "feeRate")
)

end
function fetchOption(self::Bybit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("category") => "option",
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = self.publicGetV5MarketTickers(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    resultList = self.safeList(result, "list", []);
    chain = self.safeDict(resultList, 0, Dict{Symbol, Any}());
    return self.parseOption(chain, nothing, market)

end
function fetchOptionChain(self::Bybit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("category") => "option",
        Symbol("baseCoin") => get(currency, Symbol("id"), nothing)
    );
    response = self.publicGetV5MarketTickers(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    resultList = self.safeList(result, "list", []);
    return self.parseOptionChain(resultList, nothing, "symbol")

end
function parseOption(self::Bybit, chain, currency=nothing, market=nothing)
    marketId = safeString(chain, "symbol");
    market = self.safeMarket(marketId, market);
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
function fetchPositionsHistory(self::Bybit, symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
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
    (subType, params) = self.handleSubTypeAndParams("fetchPositionsHistory", market, params, "linear");
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
    response = self.privateGetV5PositionClosedPnl(extend(request, params));
    result = self.safeDict(response, "result");
    rawPositions = self.safeList(result, "list");
    positions = self.parsePositions(rawPositions, symbols, params);
    return self.filterBySinceLimit(positions, since, limit)

end
function fetchConvertCurrencies(self::Bybit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    accountType = nothing;
    (enableUnifiedMargin, enableUnifiedAccount) = (self.isUnifiedEnabled());
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    accountTypeDefault = functions.ccxtruthy(isUnifiedAccount) ? "eb_convert_uta" : "eb_convert_spot";
    (accountType, params) = self.handleOptionAndParams(params, "fetchConvertCurrencies", "accountType", accountTypeDefault);
    request = Dict{Symbol, Any}(
        Symbol("accountType") => accountType
    );
    response = self.privateGetV5AssetExchangeQueryCoinList(extend(request, params));
    result = Dict{Symbol, Any}();
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    coins = self.safeList(data, "coins", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(coins)))
        entry = get(coins, i + 1, nothing);
        id = safeString(entry, "coin");
        disableFrom = self.safeBool(entry, "disableFrom");
        disableTo = self.safeBool(entry, "disableTo");
        inactive = (@functions.ccxt_or(disableFrom, disableTo));
        code = self.safeCurrencyCode(id);
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
        i += 1
    end
    return result

end
function fetchConvertQuote(self::Bybit, fromCode, toCode, amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    accountType = nothing;
    (enableUnifiedMargin, enableUnifiedAccount) = (self.isUnifiedEnabled());
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    accountTypeDefault = functions.ccxtruthy(isUnifiedAccount) ? "eb_convert_uta" : "eb_convert_spot";
    (accountType, params) = self.handleOptionAndParams(params, "fetchConvertQuote", "accountType", accountTypeDefault);
    request = Dict{Symbol, Any}(
        Symbol("fromCoin") => fromCode,
        Symbol("toCoin") => toCode,
        Symbol("requestAmount") => numberToString(amount),
        Symbol("requestCoin") => fromCode,
        Symbol("accountType") => accountType
    );
    response = self.privatePostV5AssetExchangeQuoteApply(extend(request, params));
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    fromCurrencyId = safeString(data, "fromCoin", fromCode);
    fromCurrency = self.currency(fromCurrencyId);
    toCurrencyId = safeString(data, "toCoin", toCode);
    toCurrency = self.currency(toCurrencyId);
    return self.parseConversion(data, fromCurrency, toCurrency)

end
function createConvertTrade(self::Bybit, id, fromCode, toCode, amount=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}(
        Symbol("quoteTxId") => id
    );
    response = self.privatePostV5AssetExchangeConvertExecute(extend(request, params));
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseConversion(data)

end
function fetchConvertTrade(self::Bybit, id, code=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    accountType = nothing;
    (enableUnifiedMargin, enableUnifiedAccount) = (self.isUnifiedEnabled());
    isUnifiedAccount = (@functions.ccxt_or(enableUnifiedMargin, enableUnifiedAccount));
    accountTypeDefault = functions.ccxtruthy(isUnifiedAccount) ? "eb_convert_uta" : "eb_convert_spot";
    (accountType, params) = self.handleOptionAndParams(params, "fetchConvertQuote", "accountType", accountTypeDefault);
    request = Dict{Symbol, Any}(
        Symbol("quoteTxId") => id,
        Symbol("accountType") => accountType
    );
    response = self.privateGetV5AssetExchangeConvertResultQuery(extend(request, params));
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    result = self.safeDict(data, "result", Dict{Symbol, Any}());
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
    return self.parseConversion(result, fromCurrency, toCurrency)

end
function fetchConvertTradeHistory(self::Bybit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = self.privateGetV5AssetExchangeQueryConvertHistory(extend(request, params));
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    dataList = self.safeList(data, "list", []);
    return self.parseConversions(dataList, code, "fromCoin", "toCoin", since, limit)

end
function parseConversion(self::Bybit, conversion, fromCurrency=nothing, toCurrency=nothing)
    timestamp = safeInteger2(conversion, "expiredTime", "createdAt");
    fromCoin = safeString(conversion, "fromCoin");
    fromCode = self.safeCurrencyCode(fromCoin, fromCurrency);
    to = safeString(conversion, "toCoin");
    toCode = self.safeCurrencyCode(to, toCurrency);
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
function fetchLongShortRatioHistory(self::Bybit, symbol=nothing, timeframe=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchLongShortRatioHistory", market, params);
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
    response = self.publicGetV5MarketAccountRatio(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "list", []);
    return self.parseLongShortRatioHistory(data, market)

end
function parseLongShortRatio(self::Bybit, info, market=nothing)
    marketId = safeString(info, "symbol");
    timestamp = self.safeIntegerOmitZero(info, "timestamp");
    longString = safeString(info, "buyRatio");
    shortString = safeString(info, "sellRatio");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timeframe") => nothing,
    Symbol("longShortRatio") => self.parseToNumeric(stringDiv(longString, shortString))
)

end
function fetchPositionsADLRank(self::Bybit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(symbols == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchPositionsADLRank() requires a symbols argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
    market = self.getMarketFromSymbols(symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(market != nothing)
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    type_var = nothing;
    (type_var, params) = self.getBybitType("fetchPositionsADLRank", market, params);
    request[Symbol("category")] = type_var;
    response = self.privateGetV5PositionList(extend(request, params));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    ranks = self.safeList(result, "list", []);
    return self.parseADLRanks(ranks, symbols)

end
function parseADLRank(self::Bybit, info, market=nothing)
    marketId = safeString(info, "symbol");
    timestamp = safeInteger(info, "updatedTime");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("rank") => safeInteger(info, "adlRankIndicator"),
    Symbol("rating") => nothing,
    Symbol("percentage") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function fetchMarginMode(self::Bybit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        self.loadMarkets();
    end
    market = self.market(symbol);
    response = self.privateGetV5AccountInfo(params);
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseMarginMode(result, market)

end
function parseMarginMode(self::Bybit, marginMode, market=nothing)
    marginType = safeString(marginMode, "marginMode");
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => self.safeSymbol(nothing, market),
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
function sign(self::Bybit, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
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
    return request(self, "spot/v3/public/symbols", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicQuoteDepth(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/depth", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicQuoteDepthMerged(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/depth/merged", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicQuoteTrades(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/trades", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicQuoteKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicQuoteTicker24hr(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/ticker/24hr", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicQuoteTickerPrice(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/ticker/price", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicQuoteTickerBookTicker(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/quote/ticker/bookTicker", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicServerTime(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/server-time", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/infos", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicMarginProductInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/margin-product-infos", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSpotV3PublicMarginEnsureTokens(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/public/margin-ensure-tokens", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV3PublicTime(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v3/public/time", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetContractV3PublicCopytradingSymbolList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/public/copytrading/symbol/list", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicOrderBookL2(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/order-book/L2", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicTickers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/tickers", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicInstrumentsInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/instruments-info", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicMarkPriceKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/mark-price-kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicIndexPriceKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/index-price-kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicFundingHistoryFundingRate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/funding/history-funding-rate", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicRiskLimitList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/risk-limit/list", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicDeliveryPrice(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/delivery-price", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicRecentTrade(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/recent-trade", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicOpenInterest(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/open-interest", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetDerivativesV3PublicInsurance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "derivatives/v3/public/insurance", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetV5AnnouncementsIndex(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/announcements/index", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5SystemStatus(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/system/status", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketTime(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/time", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketMarkPriceKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/mark-price-kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketIndexPriceKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/index-price-kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketPremiumIndexPriceKline(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/premium-index-price-kline", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketInstrumentsInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/instruments-info", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketOrderbook(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/orderbook", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketRpiOrderbook(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/rpi_orderbook", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketFullOrderbook(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/full_orderbook", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketTickers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/tickers", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketFundingHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/funding/history", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketRecentTrade(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/recent-trade", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketOpenInterest(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/open-interest", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketHistoricalVolatility(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/historical-volatility", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketInsurance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/insurance", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketRiskLimit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/risk-limit", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketDeliveryPrice(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/delivery-price", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketNewDeliveryPrice(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/new-delivery-price", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketAccountRatio(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/account-ratio", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketIndexPriceComponents(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/index-price-components", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketPriceLimit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/price-limit", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketAdlAlert(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/adlAlert", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5MarketFeeGroupInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/fee-group-info", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5SpotLeverTokenInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-lever-token/info", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5SpotLeverTokenReference(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-lever-token/reference", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5SpotMarginTradeData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/data", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5SpotMarginTradeCollateral(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/collateral", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5SpotCrossMarginTradeData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/data", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5SpotCrossMarginTradePledgeToken(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/pledge-token", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5SpotCrossMarginTradeBorrowToken(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/borrow-token", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5CryptoLoanCollateralData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/collateral-data", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5CryptoLoanLoanableData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/loanable-data", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5CryptoLoanCommonLoanableData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/loanable-data", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5CryptoLoanCommonCollateralData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/collateral-data", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5CryptoLoanFixedSupplyOrderQuote(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/supply-order-quote", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5CryptoLoanFixedBorrowOrderQuote(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/borrow-order-quote", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5InsLoanProductInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/product-infos", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5InsLoanEnsureTokensConvert(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/ensure-tokens-convert", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function publicGetV5EarnProduct(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/product", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5MarketInstrumentsInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/market/instruments-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV2PrivateWalletFundRecords(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v2/private/wallet/fund/records", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 25))
end

function privateGetSpotV3PrivateOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privateGetSpotV3PrivateOpenOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/open-orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privateGetSpotV3PrivateHistoryOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/history-orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privateGetSpotV3PrivateMyTrades(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/my-trades", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privateGetSpotV3PrivateAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/account", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privateGetSpotV3PrivateReference(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/reference", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privateGetSpotV3PrivateRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privateGetSpotV3PrivateCrossMarginOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetSpotV3PrivateCrossMarginAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-account", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetSpotV3PrivateCrossMarginLoanInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-loan-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetSpotV3PrivateCrossMarginRepayHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-repay-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetSpotV3PrivateMarginLoanInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/margin-loan-infos", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetSpotV3PrivateMarginRepaidInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/margin-repaid-infos", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetSpotV3PrivateMarginLtv(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/margin-ltv", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetAssetV3PrivateTransferInterTransferListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/inter-transfer/list/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetAssetV3PrivateTransferSubMemberListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/sub-member/list/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetAssetV3PrivateTransferSubMemberTransferListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/sub-member-transfer/list/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetAssetV3PrivateTransferUniversalTransferListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/universal-transfer/list/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 25))
end

function privateGetAssetV3PrivateCoinInfoQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/coin-info/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 25))
end

function privateGetAssetV3PrivateDepositAddressQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/deposit/address/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetContractV3PrivateCopytradingOrderList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/order/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privateGetContractV3PrivateCopytradingPositionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/position/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function privateGetContractV3PrivateCopytradingWalletBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/wallet/balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 25))
end

function privateGetContractV3PrivatePositionLimitInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/limit-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 25))
end

function privateGetContractV3PrivateOrderUnfilledOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/unfilled-orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetContractV3PrivateOrderList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetContractV3PrivatePositionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetContractV3PrivateExecutionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/execution/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetContractV3PrivatePositionClosedPnl(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/closed-pnl", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetContractV3PrivateAccountWalletBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/account/wallet/balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetContractV3PrivateAccountFeeRate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/account/fee-rate", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetContractV3PrivateAccountWalletFundRecords(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/account/wallet/fund-records", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivateOrderUnfilledOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/unfilled-orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivateOrderList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivatePositionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/position/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivateExecutionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/execution/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivateDeliveryRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/delivery-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivateSettlementRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/settlement-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivateAccountWalletBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/wallet/balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivateAccountTransactionLog(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/transaction-log", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivateAccountBorrowHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/borrow-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivateAccountBorrowRate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/borrow-rate", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUnifiedV3PrivateAccountInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetUserV3PrivateFrozenSubMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/frozen-sub-member", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetUserV3PrivateQuerySubMembers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/query-sub-members", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetUserV3PrivateQueryApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/query-api", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetUserV3PrivateGetMemberType(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/get-member-type", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAssetV3PrivateTransferTransferCoinListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/transfer-coin/list/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetAssetV3PrivateTransferAccountCoinBalanceQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/account-coin/balance/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetAssetV3PrivateTransferAccountCoinsBalanceQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/account-coins/balance/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 25))
end

function privateGetAssetV3PrivateTransferAssetInfoQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/asset-info/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetAssetV3PublicDepositAllowedDepositListQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/public/deposit/allowed-deposit-list/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.17))
end

function privateGetAssetV3PrivateDepositRecordQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/deposit/record/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetAssetV3PrivateWithdrawRecordQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/withdraw/record/query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5OrderRealtime(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/realtime", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5OrderHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5OrderSpotBorrowCheck(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/spot-borrow-check", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5PositionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5ExecutionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/execution/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5PositionClosedPnl(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/closed-pnl", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5PositionGetClosedPositions(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/get-closed-positions", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5PositionMoveHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/move-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5PositionSymbolInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/symbol-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5PreUpgradeOrderHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/order/history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5PreUpgradeExecutionList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/execution/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5PreUpgradePositionClosedPnl(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/position/closed-pnl", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5PreUpgradeAccountTransactionLog(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/account/transaction-log", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5PreUpgradeAssetDeliveryRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/asset/delivery-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5PreUpgradeAssetSettlementRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/pre-upgrade/asset/settlement-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AccountWalletBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/wallet-balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5AccountBorrowHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/borrow-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5AccountInstrumentsInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/instruments-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5AccountCollateralInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/collateral-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5AccountOptionAssetInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/option-asset-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5AssetCoinGreeks(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/coin-greeks", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5AccountFeeRate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/fee-rate", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5AccountInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AccountTransactionLog(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/transaction-log", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1.66))
end

function privateGetV5AccountContractTransactionLog(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/contract-transaction-log", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5AccountQueryDcpInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/query-dcp-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AccountUserSettingConfig(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/user-setting-config", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AccountPayInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/pay-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AccountTradeInfoForAnalysis(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/trade-info-for-analysis", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AccountSmpGroup(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/smp-group", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5AccountMmpState(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/mmp-state", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AccountWithdrawal(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/withdrawal", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetAssetOverview(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/asset-overview", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetExchangeQueryCoinList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/query-coin-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.5))
end

function privateGetV5AssetExchangeConvertResultQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/convert-result-query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.5))
end

function privateGetV5AssetExchangeQueryConvertHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/query-convert-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.5))
end

function privateGetV5AssetExchangeOrderRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/order-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetFundinghistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/fundinghistory", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetPortfolioMargin(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/portfolio-margin", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetTotalMembersAssets(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/total-members-assets", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetDeliveryRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/delivery-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetSettlementRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/settlement-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetTransferQueryAssetInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-asset-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetV5AssetTransferQueryAccountCoinsBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-account-coins-balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 25))
end

function privateGetV5AssetTransferQueryAccountCoinBalance(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-account-coin-balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetV5AssetTransferQueryTransferCoinList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-transfer-coin-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetV5AssetTransferQueryInterTransferList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-inter-transfer-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetV5AssetTransferQuerySubMemberList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-sub-member-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privateGetV5AssetTransferQueryUniversalTransferList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/query-universal-transfer-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 25))
end

function privateGetV5AssetDepositQueryAllowedList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-allowed-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetDepositQueryRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5AssetDepositQuerySubMemberRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-sub-member-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5AssetDepositQueryInternalRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-internal-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetDepositQueryAddress(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-address", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5AssetDepositQuerySubMemberAddress(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/query-sub-member-address", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5AssetCoinQueryInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/coin/query-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 28))
end

function privateGetV5AssetWithdrawQueryAddress(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/query-address", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5AssetWithdrawQueryRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/query-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5AssetWithdrawWithdrawableAmount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/withdrawable-amount", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetWithdrawVaspList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/vasp/list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetCovertSmallBalanceList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/covert/small-balance-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetCovertSmallBalanceHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/covert/small-balance-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetConvertSmallBalanceList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/convert/small-balance-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AssetConvertSmallBalanceHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/convert/small-balance-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5FiatQueryCoinList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/query-coin-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5FiatReferencePrice(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/reference-price", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5FiatTradeQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/trade-query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5FiatQueryTradeHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/query-trade-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5FiatBalanceQuery(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/balance-query", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5UserQuerySubMembers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/query-sub-members", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5UserQueryApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/query-api", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5UserSubApikeys(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/sub-apikeys", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5UserGetMemberType(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/get-member-type", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5UserAffCustomerInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/aff-customer-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5UserDelSubmember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/del-submember", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5UserSubmembers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/submembers", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5UserEscrowSubMembers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/escrow_sub_members", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5UserInvitationReferrals(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/invitation/referrals", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AffiliateAffUserList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/affiliate/aff-user-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5AffiliateAffiliateSubList(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/affiliate/affiliate-sub-list", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotLeverTokenOrderRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-lever-token/order-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5SpotMarginTradeInterestRateHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/interest-rate-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradeState(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/state", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradeMaxBorrowable(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/max-borrowable", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradePositionTiers(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/position-tiers", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradeCoinstate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/coinstate", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradeCurrencyData(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/currency-data", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradeFixedborrowContractInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/fixedborrow-contract-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradeFixedborrowOrderInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/fixedborrow-order-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradeFixedborrowOrderQuote(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/fixedborrow-order-quote", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradeLiability(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/liability", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradeRepaymentAvailableAmount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/repayment-available-amount", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotMarginTradeGetAutoRepayMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/get-auto-repay-mode", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5SpotCrossMarginTradeLoanInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/loan-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5SpotCrossMarginTradeAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/account", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5SpotCrossMarginTradeOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5SpotCrossMarginTradeRepayHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/repay-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetV5CryptoLoanBorrowableCollateralisableNumber(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/borrowable-collateralisable-number", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5CryptoLoanOngoingOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/ongoing-orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5CryptoLoanRepaymentHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/repayment-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5CryptoLoanBorrowHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/borrow-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5CryptoLoanMaxCollateralAmount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/max-collateral-amount", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5CryptoLoanAdjustmentHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/adjustment-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5CryptoLoanCommonMaxCollateralAmount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/max-collateral-amount", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanCommonAdjustmentHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/adjustment-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanCommonPosition(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/position", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanFlexibleOngoingCoin(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/ongoing-coin", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanFlexibleBorrowHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/borrow-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanFlexibleRepaymentHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/repayment-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanFixedBorrowContractInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/borrow-contract-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanFixedSupplyContractInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/supply-contract-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanFixedBorrowOrderInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/borrow-order-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanFixedRenewInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/renew-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanFixedSupplyOrderInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/supply-order-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5CryptoLoanFixedRepaymentHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/repayment-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5InsLoanProductInfos(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/product-infos", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5InsLoanEnsureTokens(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/ensure-tokens", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5InsLoanEnsureTokensConvert(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/ensure-tokens-convert", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5InsLoanLoanOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/loan-order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5InsLoanRepaidHistory(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/repaid-history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5InsLoanLtv(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/ltv", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5InsLoanLtvConvert(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/ltv-convert", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5InsLoanCoinDeltaAmount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/coin-delta-amount", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5LendingInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5LendingHistoryOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/history-order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5LendingAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/account", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5BrokerEarningRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/earning-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5BrokerEarningsInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/earnings-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5BrokerAccountInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/account-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5BrokerAssetQuerySubMemberDepositRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/asset/query-sub-member-deposit-record", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetV5EarnProduct(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/product", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5EarnOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/order", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5EarnPosition(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/position", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5EarnYield(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/yield", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privateGetV5EarnHourlyYield(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/hourly-yield", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostSpotV3PrivateOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostSpotV3PrivateCancelOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cancel-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostSpotV3PrivateCancelOrders(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cancel-orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostSpotV3PrivateCancelOrdersByIds(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cancel-orders-by-ids", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostSpotV3PrivatePurchase(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/purchase", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostSpotV3PrivateRedeem(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/redeem", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostSpotV3PrivateCrossMarginLoan(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-loan", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostSpotV3PrivateCrossMarginRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "spot/v3/private/cross-margin-repay", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostAssetV3PrivateTransferInterTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/inter-transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 150))
end

function privatePostAssetV3PrivateWithdrawCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/withdraw/create", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 300))
end

function privatePostAssetV3PrivateWithdrawCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/withdraw/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostAssetV3PrivateTransferSubMemberTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/sub-member-transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 150))
end

function privatePostAssetV3PrivateTransferTransferSubMemberSave(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/transfer-sub-member-save", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 150))
end

function privatePostAssetV3PrivateTransferUniversalTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "asset/v3/private/transfer/universal-transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostUserV3PrivateCreateSubMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/create-sub-member", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostUserV3PrivateCreateSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/create-sub-api", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostUserV3PrivateUpdateApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/update-api", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostUserV3PrivateDeleteApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/delete-api", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostUserV3PrivateUpdateSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/update-sub-api", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostUserV3PrivateDeleteSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "user/v3/private/delete-sub-api", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostContractV3PrivateCopytradingOrderCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/order/create", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostContractV3PrivateCopytradingOrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/order/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostContractV3PrivateCopytradingOrderClose(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/order/close", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostContractV3PrivateCopytradingPositionClose(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/position/close", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function privatePostContractV3PrivateCopytradingPositionSetLeverage(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/position/set-leverage", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 40))
end

function privatePostContractV3PrivateCopytradingWalletTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/wallet/transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 25))
end

function privatePostContractV3PrivateCopytradingOrderTradingStop(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/copytrading/order/trading-stop", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostContractV3PrivateOrderCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/create", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivateOrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivateOrderCancelAll(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/cancel-all", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivateOrderReplace(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/order/replace", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivatePositionSetAutoAddMargin(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/set-auto-add-margin", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivatePositionSwitchIsolated(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/switch-isolated", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivatePositionSwitchMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/switch-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivatePositionSwitchTpslMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/switch-tpsl-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivatePositionSetLeverage(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/set-leverage", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivatePositionTradingStop(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/trading-stop", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivatePositionSetRiskLimit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/position/set-risk-limit", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostContractV3PrivateAccountSetMarginMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "contract/v3/private/account/setMarginMode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostUnifiedV3PrivateOrderCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/create", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostUnifiedV3PrivateOrderReplace(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/replace", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostUnifiedV3PrivateOrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostUnifiedV3PrivateOrderCreateBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/create-batch", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostUnifiedV3PrivateOrderReplaceBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/replace-batch", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostUnifiedV3PrivateOrderCancelBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/cancel-batch", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostUnifiedV3PrivateOrderCancelAll(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/order/cancel-all", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function privatePostUnifiedV3PrivatePositionSetLeverage(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/position/set-leverage", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostUnifiedV3PrivatePositionTpslSwitchMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/position/tpsl/switch-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostUnifiedV3PrivatePositionSetRiskLimit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/position/set-risk-limit", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostUnifiedV3PrivatePositionTradingStop(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/position/trading-stop", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostUnifiedV3PrivateAccountUpgradeUnifiedAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/upgrade-unified-account", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostUnifiedV3PrivateAccountSetMarginMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "unified/v3/private/account/setMarginMode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostFhtComplianceTaxV3PrivateRegistertime(self::Bybit, params=Dict(), context=Dict())
    return request(self, "fht/compliance/tax/v3/private/registertime", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostFhtComplianceTaxV3PrivateCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "fht/compliance/tax/v3/private/create", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostFhtComplianceTaxV3PrivateStatus(self::Bybit, params=Dict(), context=Dict())
    return request(self, "fht/compliance/tax/v3/private/status", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostFhtComplianceTaxV3PrivateUrl(self::Bybit, params=Dict(), context=Dict())
    return request(self, "fht/compliance/tax/v3/private/url", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5OrderCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/create", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostV5OrderAmend(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/amend", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5OrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostV5OrderCancelAll(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/cancel-all", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5OrderCreateBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/create-batch", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5OrderAmendBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/amend-batch", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5OrderCancelBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/cancel-batch", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5OrderDisconnectedCancelAll(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/disconnected-cancel-all", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5OrderPreCheck(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/order/pre-check", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5PositionSetLeverage(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/set-leverage", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5PositionSwitchIsolated(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/switch-isolated", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5PositionSetTpslMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/set-tpsl-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5PositionSwitchMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/switch-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5PositionSetRiskLimit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/set-risk-limit", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5PositionTradingStop(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/trading-stop", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5PositionSetAutoAddMargin(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/set-auto-add-margin", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5PositionAddMargin(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/add-margin", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5PositionMovePositions(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/move-positions", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5PositionConfirmPendingMmr(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/position/confirm-pending-mmr", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountUpgradeToUta(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/upgrade-to-uta", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountQuickRepayment(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/quick-repayment", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountSetMarginMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-margin-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountSetHedgingMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-hedging-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountMmpModify(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/mmp-modify", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountMmpReset(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/mmp-reset", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountBorrow(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/borrow", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/repay", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountNoConvertRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/no-convert-repay", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountSetLimitPxAction(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-limit-px-action", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountSetDeltaMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-delta-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AssetExchangeQuoteApply(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/quote-apply", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV5AssetExchangeConvertExecute(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/exchange/convert-execute", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostV5AssetTransferInterTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/inter-transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5AssetTransferSaveTransferSubMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/save-transfer-sub-member", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 150))
end

function privatePostV5AssetTransferUniversalTransfer(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/transfer/universal-transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5AssetDepositDepositToAccount(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/deposit/deposit-to-account", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AssetTravelRuleDepositSubmit(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/travel-rule/deposit/submit", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AssetWithdrawCreate(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/create", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5AssetWithdrawCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/withdraw/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5AssetCovertGetQuote(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/covert/get-quote", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5AssetCovertSmallBalanceExecute(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/asset/covert/small-balance-execute", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5FiatQuoteApply(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/quote-apply", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5FiatTradeExecute(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/fiat/trade-execute", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5UserCreateSubMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/create-sub-member", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5UserCreateSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/create-sub-api", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5UserFrozenSubMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/frozen-sub-member", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5UserUpdateApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/update-api", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5UserUpdateSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/update-sub-api", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5UserDeleteApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/delete-api", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5UserDeleteSubApi(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/delete-sub-api", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5UserAgreement(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/agreement", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5UserCreateDemoMember(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/user/create-demo-member", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5SpotLeverTokenPurchase(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-lever-token/purchase", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostV5SpotLeverTokenRedeem(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-lever-token/redeem", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostV5SpotMarginTradeSwitchMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/switch-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5SpotMarginTradeSetLeverage(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/set-leverage", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5SpotMarginTradeSetAutoRepayMode(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/set-auto-repay-mode", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5SpotMarginTradeFixedborrow(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/fixedborrow", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5SpotMarginTradeFixedborrowRenew(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-margin-trade/fixedborrow-renew", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5SpotCrossMarginTradeLoan(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/loan", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostV5SpotCrossMarginTradeRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/repay", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostV5SpotCrossMarginTradeSwitch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/spot-cross-margin-trade/switch", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 2.5))
end

function privatePostV5CryptoLoanBorrow(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/borrow", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5CryptoLoanRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/repay", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5CryptoLoanAdjustLtv(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan/adjust-ltv", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5CryptoLoanCommonAdjustLtv(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/adjust-ltv", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5CryptoLoanCommonMaxLoan(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-common/max-loan", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostV5CryptoLoanFlexibleBorrow(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/borrow", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5CryptoLoanFlexibleRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/repay", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5CryptoLoanFlexibleRepayCollateral(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-flexible/repay-collateral", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5CryptoLoanFixedBorrow(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/borrow", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5CryptoLoanFixedRenew(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/renew", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5CryptoLoanFixedSupply(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/supply", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5CryptoLoanFixedBorrowOrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/borrow-order-cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5CryptoLoanFixedSupplyOrderCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/supply-order-cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5CryptoLoanFixedFullyRepay(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/fully-repay", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5CryptoLoanFixedRepayCollateral(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/crypto-loan-fixed/repay-collateral", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function privatePostV5InsLoanAssociationUid(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/association-uid", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5InsLoanRepayLoan(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/ins-loan/repay-loan", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5LendingPurchase(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/purchase", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5LendingRedeem(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/redeem", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5LendingRedeemCancel(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/lending/redeem-cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountSetCollateralSwitch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-collateral-switch", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountSetCollateralSwitchBatch(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/set-collateral-switch-batch", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5AccountDemoApplyMoney(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/account/demo-apply-money", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5BrokerAwardInfo(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/award/info", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5BrokerAwardDistributeAward(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/award/distribute-award", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5BrokerAwardDistributionRecord(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/broker/award/distribution-record", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function privatePostV5EarnPlaceOrder(self::Bybit, params=Dict(), context=Dict())
    return request(self, "v5/earn/place-order", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function Bybit(; kwargs...)
    inst = Bybit(Exchange(), describe, enableDemoTrading, nonce, addPaginationCursorToResult, isUnifiedEnabled, upgradeUnifiedTradeAccount, createExpiredOptionMarket, safeMarket, getBybitType, getAmount, getPrice, getCost, fetchStatus, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, fetchSpotMarkets, fetchFutureMarkets, fetchOptionMarkets, parseTicker, fetchTicker, fetchTickers, fetchBidsAsks, parseOHLCV, fetchOHLCV, parseFundingRate, fetchFundingRates, fetchFundingRateHistory, parseTrade, fetchTrades, fetchOrderBook, parseBalance, fetchBalance, parseOrderStatus, parseTimeInForce, parseOrder, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, createOrder, createOrderRequest, createOrders, editOrderRequest, editOrder, editOrders, cancelOrderRequest, cancelOrder, cancelOrders, cancelAllOrdersAfter, cancelOrdersForSymbols, cancelAllOrders, fetchOrderClassic, fetchOrder, fetchOrders, fetchOrdersClassic, fetchClosedOrder, fetchOpenOrder, fetchCanceledAndClosedOrders, fetchClosedOrders, fetchCanceledOrders, fetchOpenOrders, fetchOrderTrades, fetchMyTrades, parseDepositAddress, fetchDepositAddressesByNetwork, fetchDepositAddress, fetchDeposits, fetchWithdrawals, parseTransactionStatus, parseTransaction, fetchLedger, parseLedgerEntry, parseLedgerEntryType, withdraw, fetchPosition, fetchPositions, parsePosition, fetchLeverage, parseLeverage, setMarginMode, setLeverage, setPositionMode, fetchDerivativesOpenInterestHistory, fetchOpenInterest, fetchOpenInterestHistory, parseOpenInterest, fetchCrossBorrowRate, parseBorrowRate, fetchBorrowInterest, fetchBorrowRateHistory, parseBorrowInterest, transfer, fetchTransfers, borrowCrossMargin, repayCrossMargin, parseMarginLoan, parseTransferStatus, parseTransfer, fetchDerivativesMarketLeverageTiers, fetchMarketLeverageTiers, parseTradingFee, fetchTradingFee, fetchTradingFees, parseDepositWithdrawFee, fetchDepositWithdrawFees, fetchSettlementHistory, fetchMySettlementHistory, parseSettlement, parseSettlements, fetchVolatilityHistory, parseVolatilityHistory, fetchGreeks, fetchAllGreeks, parseGreeks, fetchMyLiquidations, parseLiquidation, getLeverageTiersPaginated, fetchLeverageTiers, parseLeverageTiers, parseMarketLeverageTiers, fetchFundingHistory, parseIncome, fetchOption, fetchOptionChain, parseOption, fetchPositionsHistory, fetchConvertCurrencies, fetchConvertQuote, createConvertTrade, fetchConvertTrade, fetchConvertTradeHistory, parseConversion, fetchLongShortRatioHistory, parseLongShortRatio, fetchPositionsADLRank, parseADLRank, fetchMarginMode, parseMarginMode, parseMarginModeType, sign, handleErrors, publicGetSpotV3PublicSymbols, publicGetSpotV3PublicQuoteDepth, publicGetSpotV3PublicQuoteDepthMerged, publicGetSpotV3PublicQuoteTrades, publicGetSpotV3PublicQuoteKline, publicGetSpotV3PublicQuoteTicker24hr, publicGetSpotV3PublicQuoteTickerPrice, publicGetSpotV3PublicQuoteTickerBookTicker, publicGetSpotV3PublicServerTime, publicGetSpotV3PublicInfos, publicGetSpotV3PublicMarginProductInfos, publicGetSpotV3PublicMarginEnsureTokens, publicGetV3PublicTime, publicGetContractV3PublicCopytradingSymbolList, publicGetDerivativesV3PublicOrderBookL2, publicGetDerivativesV3PublicKline, publicGetDerivativesV3PublicTickers, publicGetDerivativesV3PublicInstrumentsInfo, publicGetDerivativesV3PublicMarkPriceKline, publicGetDerivativesV3PublicIndexPriceKline, publicGetDerivativesV3PublicFundingHistoryFundingRate, publicGetDerivativesV3PublicRiskLimitList, publicGetDerivativesV3PublicDeliveryPrice, publicGetDerivativesV3PublicRecentTrade, publicGetDerivativesV3PublicOpenInterest, publicGetDerivativesV3PublicInsurance, publicGetV5AnnouncementsIndex, publicGetV5SystemStatus, publicGetV5MarketTime, publicGetV5MarketKline, publicGetV5MarketMarkPriceKline, publicGetV5MarketIndexPriceKline, publicGetV5MarketPremiumIndexPriceKline, publicGetV5MarketInstrumentsInfo, publicGetV5MarketOrderbook, publicGetV5MarketRpiOrderbook, publicGetV5MarketFullOrderbook, publicGetV5MarketTickers, publicGetV5MarketFundingHistory, publicGetV5MarketRecentTrade, publicGetV5MarketOpenInterest, publicGetV5MarketHistoricalVolatility, publicGetV5MarketInsurance, publicGetV5MarketRiskLimit, publicGetV5MarketDeliveryPrice, publicGetV5MarketNewDeliveryPrice, publicGetV5MarketAccountRatio, publicGetV5MarketIndexPriceComponents, publicGetV5MarketPriceLimit, publicGetV5MarketAdlAlert, publicGetV5MarketFeeGroupInfo, publicGetV5SpotLeverTokenInfo, publicGetV5SpotLeverTokenReference, publicGetV5SpotMarginTradeData, publicGetV5SpotMarginTradeCollateral, publicGetV5SpotCrossMarginTradeData, publicGetV5SpotCrossMarginTradePledgeToken, publicGetV5SpotCrossMarginTradeBorrowToken, publicGetV5CryptoLoanCollateralData, publicGetV5CryptoLoanLoanableData, publicGetV5CryptoLoanCommonLoanableData, publicGetV5CryptoLoanCommonCollateralData, publicGetV5CryptoLoanFixedSupplyOrderQuote, publicGetV5CryptoLoanFixedBorrowOrderQuote, publicGetV5InsLoanProductInfos, publicGetV5InsLoanEnsureTokensConvert, publicGetV5EarnProduct, privateGetV5MarketInstrumentsInfo, privateGetV2PrivateWalletFundRecords, privateGetSpotV3PrivateOrder, privateGetSpotV3PrivateOpenOrders, privateGetSpotV3PrivateHistoryOrders, privateGetSpotV3PrivateMyTrades, privateGetSpotV3PrivateAccount, privateGetSpotV3PrivateReference, privateGetSpotV3PrivateRecord, privateGetSpotV3PrivateCrossMarginOrders, privateGetSpotV3PrivateCrossMarginAccount, privateGetSpotV3PrivateCrossMarginLoanInfo, privateGetSpotV3PrivateCrossMarginRepayHistory, privateGetSpotV3PrivateMarginLoanInfos, privateGetSpotV3PrivateMarginRepaidInfos, privateGetSpotV3PrivateMarginLtv, privateGetAssetV3PrivateTransferInterTransferListQuery, privateGetAssetV3PrivateTransferSubMemberListQuery, privateGetAssetV3PrivateTransferSubMemberTransferListQuery, privateGetAssetV3PrivateTransferUniversalTransferListQuery, privateGetAssetV3PrivateCoinInfoQuery, privateGetAssetV3PrivateDepositAddressQuery, privateGetContractV3PrivateCopytradingOrderList, privateGetContractV3PrivateCopytradingPositionList, privateGetContractV3PrivateCopytradingWalletBalance, privateGetContractV3PrivatePositionLimitInfo, privateGetContractV3PrivateOrderUnfilledOrders, privateGetContractV3PrivateOrderList, privateGetContractV3PrivatePositionList, privateGetContractV3PrivateExecutionList, privateGetContractV3PrivatePositionClosedPnl, privateGetContractV3PrivateAccountWalletBalance, privateGetContractV3PrivateAccountFeeRate, privateGetContractV3PrivateAccountWalletFundRecords, privateGetUnifiedV3PrivateOrderUnfilledOrders, privateGetUnifiedV3PrivateOrderList, privateGetUnifiedV3PrivatePositionList, privateGetUnifiedV3PrivateExecutionList, privateGetUnifiedV3PrivateDeliveryRecord, privateGetUnifiedV3PrivateSettlementRecord, privateGetUnifiedV3PrivateAccountWalletBalance, privateGetUnifiedV3PrivateAccountTransactionLog, privateGetUnifiedV3PrivateAccountBorrowHistory, privateGetUnifiedV3PrivateAccountBorrowRate, privateGetUnifiedV3PrivateAccountInfo, privateGetUserV3PrivateFrozenSubMember, privateGetUserV3PrivateQuerySubMembers, privateGetUserV3PrivateQueryApi, privateGetUserV3PrivateGetMemberType, privateGetAssetV3PrivateTransferTransferCoinListQuery, privateGetAssetV3PrivateTransferAccountCoinBalanceQuery, privateGetAssetV3PrivateTransferAccountCoinsBalanceQuery, privateGetAssetV3PrivateTransferAssetInfoQuery, privateGetAssetV3PublicDepositAllowedDepositListQuery, privateGetAssetV3PrivateDepositRecordQuery, privateGetAssetV3PrivateWithdrawRecordQuery, privateGetV5OrderRealtime, privateGetV5OrderHistory, privateGetV5OrderSpotBorrowCheck, privateGetV5PositionList, privateGetV5ExecutionList, privateGetV5PositionClosedPnl, privateGetV5PositionGetClosedPositions, privateGetV5PositionMoveHistory, privateGetV5PositionSymbolInfo, privateGetV5PreUpgradeOrderHistory, privateGetV5PreUpgradeExecutionList, privateGetV5PreUpgradePositionClosedPnl, privateGetV5PreUpgradeAccountTransactionLog, privateGetV5PreUpgradeAssetDeliveryRecord, privateGetV5PreUpgradeAssetSettlementRecord, privateGetV5AccountWalletBalance, privateGetV5AccountBorrowHistory, privateGetV5AccountInstrumentsInfo, privateGetV5AccountCollateralInfo, privateGetV5AccountOptionAssetInfo, privateGetV5AssetCoinGreeks, privateGetV5AccountFeeRate, privateGetV5AccountInfo, privateGetV5AccountTransactionLog, privateGetV5AccountContractTransactionLog, privateGetV5AccountQueryDcpInfo, privateGetV5AccountUserSettingConfig, privateGetV5AccountPayInfo, privateGetV5AccountTradeInfoForAnalysis, privateGetV5AccountSmpGroup, privateGetV5AccountMmpState, privateGetV5AccountWithdrawal, privateGetV5AssetAssetOverview, privateGetV5AssetExchangeQueryCoinList, privateGetV5AssetExchangeConvertResultQuery, privateGetV5AssetExchangeQueryConvertHistory, privateGetV5AssetExchangeOrderRecord, privateGetV5AssetFundinghistory, privateGetV5AssetPortfolioMargin, privateGetV5AssetTotalMembersAssets, privateGetV5AssetDeliveryRecord, privateGetV5AssetSettlementRecord, privateGetV5AssetTransferQueryAssetInfo, privateGetV5AssetTransferQueryAccountCoinsBalance, privateGetV5AssetTransferQueryAccountCoinBalance, privateGetV5AssetTransferQueryTransferCoinList, privateGetV5AssetTransferQueryInterTransferList, privateGetV5AssetTransferQuerySubMemberList, privateGetV5AssetTransferQueryUniversalTransferList, privateGetV5AssetDepositQueryAllowedList, privateGetV5AssetDepositQueryRecord, privateGetV5AssetDepositQuerySubMemberRecord, privateGetV5AssetDepositQueryInternalRecord, privateGetV5AssetDepositQueryAddress, privateGetV5AssetDepositQuerySubMemberAddress, privateGetV5AssetCoinQueryInfo, privateGetV5AssetWithdrawQueryAddress, privateGetV5AssetWithdrawQueryRecord, privateGetV5AssetWithdrawWithdrawableAmount, privateGetV5AssetWithdrawVaspList, privateGetV5AssetCovertSmallBalanceList, privateGetV5AssetCovertSmallBalanceHistory, privateGetV5AssetConvertSmallBalanceList, privateGetV5AssetConvertSmallBalanceHistory, privateGetV5FiatQueryCoinList, privateGetV5FiatReferencePrice, privateGetV5FiatTradeQuery, privateGetV5FiatQueryTradeHistory, privateGetV5FiatBalanceQuery, privateGetV5UserQuerySubMembers, privateGetV5UserQueryApi, privateGetV5UserSubApikeys, privateGetV5UserGetMemberType, privateGetV5UserAffCustomerInfo, privateGetV5UserDelSubmember, privateGetV5UserSubmembers, privateGetV5UserEscrowSubMembers, privateGetV5UserInvitationReferrals, privateGetV5AffiliateAffUserList, privateGetV5AffiliateAffiliateSubList, privateGetV5SpotLeverTokenOrderRecord, privateGetV5SpotMarginTradeInterestRateHistory, privateGetV5SpotMarginTradeState, privateGetV5SpotMarginTradeMaxBorrowable, privateGetV5SpotMarginTradePositionTiers, privateGetV5SpotMarginTradeCoinstate, privateGetV5SpotMarginTradeCurrencyData, privateGetV5SpotMarginTradeFixedborrowContractInfo, privateGetV5SpotMarginTradeFixedborrowOrderInfo, privateGetV5SpotMarginTradeFixedborrowOrderQuote, privateGetV5SpotMarginTradeLiability, privateGetV5SpotMarginTradeRepaymentAvailableAmount, privateGetV5SpotMarginTradeGetAutoRepayMode, privateGetV5SpotCrossMarginTradeLoanInfo, privateGetV5SpotCrossMarginTradeAccount, privateGetV5SpotCrossMarginTradeOrders, privateGetV5SpotCrossMarginTradeRepayHistory, privateGetV5CryptoLoanBorrowableCollateralisableNumber, privateGetV5CryptoLoanOngoingOrders, privateGetV5CryptoLoanRepaymentHistory, privateGetV5CryptoLoanBorrowHistory, privateGetV5CryptoLoanMaxCollateralAmount, privateGetV5CryptoLoanAdjustmentHistory, privateGetV5CryptoLoanCommonMaxCollateralAmount, privateGetV5CryptoLoanCommonAdjustmentHistory, privateGetV5CryptoLoanCommonPosition, privateGetV5CryptoLoanFlexibleOngoingCoin, privateGetV5CryptoLoanFlexibleBorrowHistory, privateGetV5CryptoLoanFlexibleRepaymentHistory, privateGetV5CryptoLoanFixedBorrowContractInfo, privateGetV5CryptoLoanFixedSupplyContractInfo, privateGetV5CryptoLoanFixedBorrowOrderInfo, privateGetV5CryptoLoanFixedRenewInfo, privateGetV5CryptoLoanFixedSupplyOrderInfo, privateGetV5CryptoLoanFixedRepaymentHistory, privateGetV5InsLoanProductInfos, privateGetV5InsLoanEnsureTokens, privateGetV5InsLoanEnsureTokensConvert, privateGetV5InsLoanLoanOrder, privateGetV5InsLoanRepaidHistory, privateGetV5InsLoanLtv, privateGetV5InsLoanLtvConvert, privateGetV5InsLoanCoinDeltaAmount, privateGetV5LendingInfo, privateGetV5LendingHistoryOrder, privateGetV5LendingAccount, privateGetV5BrokerEarningRecord, privateGetV5BrokerEarningsInfo, privateGetV5BrokerAccountInfo, privateGetV5BrokerAssetQuerySubMemberDepositRecord, privateGetV5EarnProduct, privateGetV5EarnOrder, privateGetV5EarnPosition, privateGetV5EarnYield, privateGetV5EarnHourlyYield, privatePostSpotV3PrivateOrder, privatePostSpotV3PrivateCancelOrder, privatePostSpotV3PrivateCancelOrders, privatePostSpotV3PrivateCancelOrdersByIds, privatePostSpotV3PrivatePurchase, privatePostSpotV3PrivateRedeem, privatePostSpotV3PrivateCrossMarginLoan, privatePostSpotV3PrivateCrossMarginRepay, privatePostAssetV3PrivateTransferInterTransfer, privatePostAssetV3PrivateWithdrawCreate, privatePostAssetV3PrivateWithdrawCancel, privatePostAssetV3PrivateTransferSubMemberTransfer, privatePostAssetV3PrivateTransferTransferSubMemberSave, privatePostAssetV3PrivateTransferUniversalTransfer, privatePostUserV3PrivateCreateSubMember, privatePostUserV3PrivateCreateSubApi, privatePostUserV3PrivateUpdateApi, privatePostUserV3PrivateDeleteApi, privatePostUserV3PrivateUpdateSubApi, privatePostUserV3PrivateDeleteSubApi, privatePostContractV3PrivateCopytradingOrderCreate, privatePostContractV3PrivateCopytradingOrderCancel, privatePostContractV3PrivateCopytradingOrderClose, privatePostContractV3PrivateCopytradingPositionClose, privatePostContractV3PrivateCopytradingPositionSetLeverage, privatePostContractV3PrivateCopytradingWalletTransfer, privatePostContractV3PrivateCopytradingOrderTradingStop, privatePostContractV3PrivateOrderCreate, privatePostContractV3PrivateOrderCancel, privatePostContractV3PrivateOrderCancelAll, privatePostContractV3PrivateOrderReplace, privatePostContractV3PrivatePositionSetAutoAddMargin, privatePostContractV3PrivatePositionSwitchIsolated, privatePostContractV3PrivatePositionSwitchMode, privatePostContractV3PrivatePositionSwitchTpslMode, privatePostContractV3PrivatePositionSetLeverage, privatePostContractV3PrivatePositionTradingStop, privatePostContractV3PrivatePositionSetRiskLimit, privatePostContractV3PrivateAccountSetMarginMode, privatePostUnifiedV3PrivateOrderCreate, privatePostUnifiedV3PrivateOrderReplace, privatePostUnifiedV3PrivateOrderCancel, privatePostUnifiedV3PrivateOrderCreateBatch, privatePostUnifiedV3PrivateOrderReplaceBatch, privatePostUnifiedV3PrivateOrderCancelBatch, privatePostUnifiedV3PrivateOrderCancelAll, privatePostUnifiedV3PrivatePositionSetLeverage, privatePostUnifiedV3PrivatePositionTpslSwitchMode, privatePostUnifiedV3PrivatePositionSetRiskLimit, privatePostUnifiedV3PrivatePositionTradingStop, privatePostUnifiedV3PrivateAccountUpgradeUnifiedAccount, privatePostUnifiedV3PrivateAccountSetMarginMode, privatePostFhtComplianceTaxV3PrivateRegistertime, privatePostFhtComplianceTaxV3PrivateCreate, privatePostFhtComplianceTaxV3PrivateStatus, privatePostFhtComplianceTaxV3PrivateUrl, privatePostV5OrderCreate, privatePostV5OrderAmend, privatePostV5OrderCancel, privatePostV5OrderCancelAll, privatePostV5OrderCreateBatch, privatePostV5OrderAmendBatch, privatePostV5OrderCancelBatch, privatePostV5OrderDisconnectedCancelAll, privatePostV5OrderPreCheck, privatePostV5PositionSetLeverage, privatePostV5PositionSwitchIsolated, privatePostV5PositionSetTpslMode, privatePostV5PositionSwitchMode, privatePostV5PositionSetRiskLimit, privatePostV5PositionTradingStop, privatePostV5PositionSetAutoAddMargin, privatePostV5PositionAddMargin, privatePostV5PositionMovePositions, privatePostV5PositionConfirmPendingMmr, privatePostV5AccountUpgradeToUta, privatePostV5AccountQuickRepayment, privatePostV5AccountSetMarginMode, privatePostV5AccountSetHedgingMode, privatePostV5AccountMmpModify, privatePostV5AccountMmpReset, privatePostV5AccountBorrow, privatePostV5AccountRepay, privatePostV5AccountNoConvertRepay, privatePostV5AccountSetLimitPxAction, privatePostV5AccountSetDeltaMode, privatePostV5AssetExchangeQuoteApply, privatePostV5AssetExchangeConvertExecute, privatePostV5AssetTransferInterTransfer, privatePostV5AssetTransferSaveTransferSubMember, privatePostV5AssetTransferUniversalTransfer, privatePostV5AssetDepositDepositToAccount, privatePostV5AssetTravelRuleDepositSubmit, privatePostV5AssetWithdrawCreate, privatePostV5AssetWithdrawCancel, privatePostV5AssetCovertGetQuote, privatePostV5AssetCovertSmallBalanceExecute, privatePostV5FiatQuoteApply, privatePostV5FiatTradeExecute, privatePostV5UserCreateSubMember, privatePostV5UserCreateSubApi, privatePostV5UserFrozenSubMember, privatePostV5UserUpdateApi, privatePostV5UserUpdateSubApi, privatePostV5UserDeleteApi, privatePostV5UserDeleteSubApi, privatePostV5UserAgreement, privatePostV5UserCreateDemoMember, privatePostV5SpotLeverTokenPurchase, privatePostV5SpotLeverTokenRedeem, privatePostV5SpotMarginTradeSwitchMode, privatePostV5SpotMarginTradeSetLeverage, privatePostV5SpotMarginTradeSetAutoRepayMode, privatePostV5SpotMarginTradeFixedborrow, privatePostV5SpotMarginTradeFixedborrowRenew, privatePostV5SpotCrossMarginTradeLoan, privatePostV5SpotCrossMarginTradeRepay, privatePostV5SpotCrossMarginTradeSwitch, privatePostV5CryptoLoanBorrow, privatePostV5CryptoLoanRepay, privatePostV5CryptoLoanAdjustLtv, privatePostV5CryptoLoanCommonAdjustLtv, privatePostV5CryptoLoanCommonMaxLoan, privatePostV5CryptoLoanFlexibleBorrow, privatePostV5CryptoLoanFlexibleRepay, privatePostV5CryptoLoanFlexibleRepayCollateral, privatePostV5CryptoLoanFixedBorrow, privatePostV5CryptoLoanFixedRenew, privatePostV5CryptoLoanFixedSupply, privatePostV5CryptoLoanFixedBorrowOrderCancel, privatePostV5CryptoLoanFixedSupplyOrderCancel, privatePostV5CryptoLoanFixedFullyRepay, privatePostV5CryptoLoanFixedRepayCollateral, privatePostV5InsLoanAssociationUid, privatePostV5InsLoanRepayLoan, privatePostV5LendingPurchase, privatePostV5LendingRedeem, privatePostV5LendingRedeemCancel, privatePostV5AccountSetCollateralSwitch, privatePostV5AccountSetCollateralSwitchBatch, privatePostV5AccountDemoApplyMoney, privatePostV5BrokerAwardInfo, privatePostV5BrokerAwardDistributeAward, privatePostV5BrokerAwardDistributionRecord, privatePostV5EarnPlaceOrder)
    # describe() first, then the user config — the same order, and the same
    # merge rule, as the TS base constructor (Exchange.ts, "merge constructor
    # overrides to this instance"): a plain object is deep-merged onto the
    # current value, anything else is assigned. Assigning dictionaries
    # wholesale would drop the base defaults an exchange does not restate —
    # e.g. `options.defaultNetworkCodeReplacements`, which every
    # networkIdToCode lookup needs.
    desc = inst.describe()
    for (k, v) in desc
        key = Symbol(k)
        if v isa AbstractDict
            inst[key] = deepExtend(get(inst, key, nothing), v)
        else
            inst[key] = v
        end
    end
    for (k, v) in kwargs
        if v isa AbstractDict
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
    inst.afterConstruct()
    if ccxtruthy(inst.safeBool2(inst.options, "sandbox", "testnet", false))
        inst.setSandboxMode(true)
    end
    inst.loadExchangeSpecificFiles()
    return inst
end
