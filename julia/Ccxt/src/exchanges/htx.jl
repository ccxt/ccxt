@kwdef mutable struct Htx <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    parseTradingFee::Function = parseTradingFee
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingLimits::Function = fetchTradingLimits
    fetchTradingLimitsById::Function = fetchTradingLimitsById
    parseTradingLimits::Function = parseTradingLimits
    costToPrecision::Function = costToPrecision
    fetchMarkets::Function = fetchMarkets
    fetchMarketsByTypeAndSubType::Function = fetchMarketsByTypeAndSubType
    tryGetSymbolFromFutureMarkets::Function = tryGetSymbolFromFutureMarkets
    parseTicker::Function = parseTicker
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchLastPrices::Function = fetchLastPrices
    parseLastPrice::Function = parseLastPrice
    fetchOrderBook::Function = fetchOrderBook
    parseTrade::Function = parseTrade
    fetchOrderTrades::Function = fetchOrderTrades
    fetchSpotOrderTrades::Function = fetchSpotOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchTrades::Function = fetchTrades
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    fetchAccountIdByType::Function = fetchAccountIdByType
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    networkIdToCode::Function = networkIdToCode
    networkCodeToId::Function = networkCodeToId
    fetchBalance::Function = fetchBalance
    fetchOrder::Function = fetchOrder
    parseMarginBalanceHelper::Function = parseMarginBalanceHelper
    fetchSpotOrdersByStates::Function = fetchSpotOrdersByStates
    fetchSpotOrders::Function = fetchSpotOrders
    fetchClosedSpotOrders::Function = fetchClosedSpotOrders
    fetchContractOrders::Function = fetchContractOrders
    fetchClosedContractOrders::Function = fetchClosedContractOrders
    fetchOrders::Function = fetchOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOpenOrders::Function = fetchOpenOrders
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createTrailingPercentOrder::Function = createTrailingPercentOrder
    createSpotOrderRequest::Function = createSpotOrderRequest
    createContractOrderRequest::Function = createContractOrderRequest
    createOrder::Function = createOrder
    createOrders::Function = createOrders
    cancelOrder::Function = cancelOrder
    cancelOrders::Function = cancelOrders
    parseCancelOrders::Function = parseCancelOrders
    cancelAllOrders::Function = cancelAllOrders
    cancelAllOrdersAfter::Function = cancelAllOrdersAfter
    parseDepositAddress::Function = parseDepositAddress
    fetchDepositAddressesByNetwork::Function = fetchDepositAddressesByNetwork
    fetchDepositAddress::Function = fetchDepositAddress
    fetchWithdrawAddresses::Function = fetchWithdrawAddresses
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    withdraw::Function = withdraw
    parseTransfer::Function = parseTransfer
    transfer::Function = transfer
    fetchTransfers::Function = fetchTransfers
    fetchIsolatedBorrowRates::Function = fetchIsolatedBorrowRates
    parseIsolatedBorrowRate::Function = parseIsolatedBorrowRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRate::Function = parseFundingRate
    parseFundingInterval::Function = parseFundingInterval
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    nonce::Function = nonce
    sign::Function = sign
    handleErrors::Function = handleErrors
    fetchFundingHistory::Function = fetchFundingHistory
    setLeverage::Function = setLeverage
    parseIncome::Function = parseIncome
    parsePosition::Function = parsePosition
    fetchPositions::Function = fetchPositions
    fetchPosition::Function = fetchPosition
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    fetchLedger::Function = fetchLedger
    fetchLeverageTiers::Function = fetchLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    fetchOpenInterestHistory::Function = fetchOpenInterestHistory
    fetchOpenInterests::Function = fetchOpenInterests
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    borrowIsolatedMargin::Function = borrowIsolatedMargin
    borrowCrossMargin::Function = borrowCrossMargin
    repayIsolatedMargin::Function = repayIsolatedMargin
    repayCrossMargin::Function = repayCrossMargin
    parseMarginLoan::Function = parseMarginLoan
    fetchSettlementHistory::Function = fetchSettlementHistory
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    parseSettlements::Function = parseSettlements
    parseSettlement::Function = parseSettlement
    fetchLiquidations::Function = fetchLiquidations
    parseLiquidation::Function = parseLiquidation
    closePosition::Function = closePosition
    setPositionMode::Function = setPositionMode
    fetchPositionsADLRank::Function = fetchPositionsADLRank
    parseADLRank::Function = parseADLRank

# Generated REST endpoint fields
    v2PublicGetReferenceCurrencies::Function = v2PublicGetReferenceCurrencies
    v2PublicGetMarketStatus::Function = v2PublicGetMarketStatus
    v2PrivateGetAccountLedger::Function = v2PrivateGetAccountLedger
    v2PrivateGetAccountWithdrawQuota::Function = v2PrivateGetAccountWithdrawQuota
    v2PrivateGetAccountWithdrawAddress::Function = v2PrivateGetAccountWithdrawAddress
    v2PrivateGetAccountDepositAddress::Function = v2PrivateGetAccountDepositAddress
    v2PrivateGetAccountRepayment::Function = v2PrivateGetAccountRepayment
    v2PrivateGetReferenceTransactFeeRate::Function = v2PrivateGetReferenceTransactFeeRate
    v2PrivateGetAccountAssetValuation::Function = v2PrivateGetAccountAssetValuation
    v2PrivateGetPointAccount::Function = v2PrivateGetPointAccount
    v2PrivateGetSubUserUserList::Function = v2PrivateGetSubUserUserList
    v2PrivateGetSubUserUserState::Function = v2PrivateGetSubUserUserState
    v2PrivateGetSubUserAccountList::Function = v2PrivateGetSubUserAccountList
    v2PrivateGetSubUserDepositAddress::Function = v2PrivateGetSubUserDepositAddress
    v2PrivateGetSubUserQueryDeposit::Function = v2PrivateGetSubUserQueryDeposit
    v2PrivateGetUserApiKey::Function = v2PrivateGetUserApiKey
    v2PrivateGetUserUid::Function = v2PrivateGetUserUid
    v2PrivateGetAlgoOrdersOpening::Function = v2PrivateGetAlgoOrdersOpening
    v2PrivateGetAlgoOrdersHistory::Function = v2PrivateGetAlgoOrdersHistory
    v2PrivateGetAlgoOrdersSpecific::Function = v2PrivateGetAlgoOrdersSpecific
    v2PrivateGetC2cOffers::Function = v2PrivateGetC2cOffers
    v2PrivateGetC2cOffer::Function = v2PrivateGetC2cOffer
    v2PrivateGetC2cTransactions::Function = v2PrivateGetC2cTransactions
    v2PrivateGetC2cRepayment::Function = v2PrivateGetC2cRepayment
    v2PrivateGetC2cAccount::Function = v2PrivateGetC2cAccount
    v2PrivateGetEtpReference::Function = v2PrivateGetEtpReference
    v2PrivateGetEtpTransactions::Function = v2PrivateGetEtpTransactions
    v2PrivateGetEtpTransaction::Function = v2PrivateGetEtpTransaction
    v2PrivateGetEtpRebalance::Function = v2PrivateGetEtpRebalance
    v2PrivateGetEtpLimit::Function = v2PrivateGetEtpLimit
    v2PrivatePostAccountTransfer::Function = v2PrivatePostAccountTransfer
    v2PrivatePostAccountRepayment::Function = v2PrivatePostAccountRepayment
    v2PrivatePostPointTransfer::Function = v2PrivatePostPointTransfer
    v2PrivatePostSubUserManagement::Function = v2PrivatePostSubUserManagement
    v2PrivatePostSubUserCreation::Function = v2PrivatePostSubUserCreation
    v2PrivatePostSubUserTradableMarket::Function = v2PrivatePostSubUserTradableMarket
    v2PrivatePostSubUserTransferability::Function = v2PrivatePostSubUserTransferability
    v2PrivatePostSubUserApiKeyGeneration::Function = v2PrivatePostSubUserApiKeyGeneration
    v2PrivatePostSubUserApiKeyModification::Function = v2PrivatePostSubUserApiKeyModification
    v2PrivatePostSubUserApiKeyDeletion::Function = v2PrivatePostSubUserApiKeyDeletion
    v2PrivatePostSubUserDeductMode::Function = v2PrivatePostSubUserDeductMode
    v2PrivatePostAlgoOrders::Function = v2PrivatePostAlgoOrders
    v2PrivatePostAlgoOrdersCancelAllAfter::Function = v2PrivatePostAlgoOrdersCancelAllAfter
    v2PrivatePostAlgoOrdersCancellation::Function = v2PrivatePostAlgoOrdersCancellation
    v2PrivatePostC2cOffer::Function = v2PrivatePostC2cOffer
    v2PrivatePostC2cCancellation::Function = v2PrivatePostC2cCancellation
    v2PrivatePostC2cCancelAll::Function = v2PrivatePostC2cCancelAll
    v2PrivatePostC2cRepayment::Function = v2PrivatePostC2cRepayment
    v2PrivatePostC2cTransfer::Function = v2PrivatePostC2cTransfer
    v2PrivatePostEtpCreation::Function = v2PrivatePostEtpCreation
    v2PrivatePostEtpRedemption::Function = v2PrivatePostEtpRedemption
    v2PrivatePostEtpTransactIdCancel::Function = v2PrivatePostEtpTransactIdCancel
    v2PrivatePostEtpBatchCancel::Function = v2PrivatePostEtpBatchCancel
    publicGetCommonSymbols::Function = publicGetCommonSymbols
    publicGetCommonCurrencys::Function = publicGetCommonCurrencys
    publicGetCommonTimestamp::Function = publicGetCommonTimestamp
    publicGetCommonExchange::Function = publicGetCommonExchange
    publicGetSettingsCurrencys::Function = publicGetSettingsCurrencys
    privateGetAccountAccounts::Function = privateGetAccountAccounts
    privateGetAccountAccountsIdBalance::Function = privateGetAccountAccountsIdBalance
    privateGetAccountAccountsSubUid::Function = privateGetAccountAccountsSubUid
    privateGetAccountHistory::Function = privateGetAccountHistory
    privateGetCrossMarginLoanInfo::Function = privateGetCrossMarginLoanInfo
    privateGetMarginLoanInfo::Function = privateGetMarginLoanInfo
    privateGetFeeFeeRateGet::Function = privateGetFeeFeeRateGet
    privateGetOrderOpenOrders::Function = privateGetOrderOpenOrders
    privateGetOrderOrders::Function = privateGetOrderOrders
    privateGetOrderOrdersId::Function = privateGetOrderOrdersId
    privateGetOrderOrdersIdMatchresults::Function = privateGetOrderOrdersIdMatchresults
    privateGetOrderOrdersGetClientOrder::Function = privateGetOrderOrdersGetClientOrder
    privateGetOrderHistory::Function = privateGetOrderHistory
    privateGetOrderMatchresults::Function = privateGetOrderMatchresults
    privateGetQueryDepositWithdraw::Function = privateGetQueryDepositWithdraw
    privateGetMarginLoanOrders::Function = privateGetMarginLoanOrders
    privateGetMarginAccountsBalance::Function = privateGetMarginAccountsBalance
    privateGetCrossMarginLoanOrders::Function = privateGetCrossMarginLoanOrders
    privateGetCrossMarginAccountsBalance::Function = privateGetCrossMarginAccountsBalance
    privateGetPointsActions::Function = privateGetPointsActions
    privateGetPointsOrders::Function = privateGetPointsOrders
    privateGetSubuserAggregateBalance::Function = privateGetSubuserAggregateBalance
    privateGetStableCoinExchangeRate::Function = privateGetStableCoinExchangeRate
    privateGetStableCoinQuote::Function = privateGetStableCoinQuote
    privatePostAccountTransfer::Function = privatePostAccountTransfer
    privatePostFuturesTransfer::Function = privatePostFuturesTransfer
    privatePostOrderBatchOrders::Function = privatePostOrderBatchOrders
    privatePostOrderOrdersPlace::Function = privatePostOrderOrdersPlace
    privatePostOrderOrdersSubmitCancelClientOrder::Function = privatePostOrderOrdersSubmitCancelClientOrder
    privatePostOrderOrdersBatchCancelOpenOrders::Function = privatePostOrderOrdersBatchCancelOpenOrders
    privatePostOrderOrdersIdSubmitcancel::Function = privatePostOrderOrdersIdSubmitcancel
    privatePostOrderOrdersBatchcancel::Function = privatePostOrderOrdersBatchcancel
    privatePostDwWithdrawApiCreate::Function = privatePostDwWithdrawApiCreate
    privatePostDwWithdrawVirtualIdCancel::Function = privatePostDwWithdrawVirtualIdCancel
    privatePostDwTransferInMargin::Function = privatePostDwTransferInMargin
    privatePostDwTransferOutMargin::Function = privatePostDwTransferOutMargin
    privatePostMarginOrders::Function = privatePostMarginOrders
    privatePostMarginOrdersIdRepay::Function = privatePostMarginOrdersIdRepay
    privatePostCrossMarginTransferIn::Function = privatePostCrossMarginTransferIn
    privatePostCrossMarginTransferOut::Function = privatePostCrossMarginTransferOut
    privatePostCrossMarginOrders::Function = privatePostCrossMarginOrders
    privatePostCrossMarginOrdersIdRepay::Function = privatePostCrossMarginOrdersIdRepay
    privatePostStableCoinExchange::Function = privatePostStableCoinExchange
    privatePostSubuserTransfer::Function = privatePostSubuserTransfer
    statusPublicSpotGetApiV2SummaryJson::Function = statusPublicSpotGetApiV2SummaryJson
    statusPublicFutureInverseGetApiV2SummaryJson::Function = statusPublicFutureInverseGetApiV2SummaryJson
    statusPublicFutureLinearGetApiV2SummaryJson::Function = statusPublicFutureLinearGetApiV2SummaryJson
    statusPublicSwapInverseGetApiV2SummaryJson::Function = statusPublicSwapInverseGetApiV2SummaryJson
    statusPublicSwapLinearGetApiV2SummaryJson::Function = statusPublicSwapLinearGetApiV2SummaryJson
    spotPublicGetV2MarketStatus::Function = spotPublicGetV2MarketStatus
    spotPublicGetV1CommonSymbols::Function = spotPublicGetV1CommonSymbols
    spotPublicGetV1CommonCurrencys::Function = spotPublicGetV1CommonCurrencys
    spotPublicGetV2SettingsCommonCurrencies::Function = spotPublicGetV2SettingsCommonCurrencies
    spotPublicGetV2ReferenceCurrencies::Function = spotPublicGetV2ReferenceCurrencies
    spotPublicGetV1CommonTimestamp::Function = spotPublicGetV1CommonTimestamp
    spotPublicGetV1CommonExchange::Function = spotPublicGetV1CommonExchange
    spotPublicGetV1SettingsCommonChains::Function = spotPublicGetV1SettingsCommonChains
    spotPublicGetV1SettingsCommonCurrencys::Function = spotPublicGetV1SettingsCommonCurrencys
    spotPublicGetV1SettingsCommonSymbols::Function = spotPublicGetV1SettingsCommonSymbols
    spotPublicGetV2SettingsCommonSymbols::Function = spotPublicGetV2SettingsCommonSymbols
    spotPublicGetV1SettingsCommonMarketSymbols::Function = spotPublicGetV1SettingsCommonMarketSymbols
    spotPublicGetMarketHistoryCandles::Function = spotPublicGetMarketHistoryCandles
    spotPublicGetMarketHistoryKline::Function = spotPublicGetMarketHistoryKline
    spotPublicGetMarketDetailMerged::Function = spotPublicGetMarketDetailMerged
    spotPublicGetMarketTickers::Function = spotPublicGetMarketTickers
    spotPublicGetMarketDetail::Function = spotPublicGetMarketDetail
    spotPublicGetMarketDepth::Function = spotPublicGetMarketDepth
    spotPublicGetMarketTrade::Function = spotPublicGetMarketTrade
    spotPublicGetMarketHistoryTrade::Function = spotPublicGetMarketHistoryTrade
    spotPublicGetMarketEtp::Function = spotPublicGetMarketEtp
    spotPublicGetV2EtpReference::Function = spotPublicGetV2EtpReference
    spotPublicGetV2EtpRebalance::Function = spotPublicGetV2EtpRebalance
    spotPrivateGetV1AccountAccounts::Function = spotPrivateGetV1AccountAccounts
    spotPrivateGetV1AccountAccountsAccountIdBalance::Function = spotPrivateGetV1AccountAccountsAccountIdBalance
    spotPrivateGetV2AccountValuation::Function = spotPrivateGetV2AccountValuation
    spotPrivateGetV2AccountAssetValuation::Function = spotPrivateGetV2AccountAssetValuation
    spotPrivateGetV1AccountHistory::Function = spotPrivateGetV1AccountHistory
    spotPrivateGetV2AccountLedger::Function = spotPrivateGetV2AccountLedger
    spotPrivateGetV2PointAccount::Function = spotPrivateGetV2PointAccount
    spotPrivateGetV2AccountDepositAddress::Function = spotPrivateGetV2AccountDepositAddress
    spotPrivateGetV2AccountWithdrawQuota::Function = spotPrivateGetV2AccountWithdrawQuota
    spotPrivateGetV2AccountWithdrawAddress::Function = spotPrivateGetV2AccountWithdrawAddress
    spotPrivateGetV2ReferenceCurrencies::Function = spotPrivateGetV2ReferenceCurrencies
    spotPrivateGetV1QueryDepositWithdraw::Function = spotPrivateGetV1QueryDepositWithdraw
    spotPrivateGetV1QueryWithdrawClientOrderId::Function = spotPrivateGetV1QueryWithdrawClientOrderId
    spotPrivateGetV2UserApiKey::Function = spotPrivateGetV2UserApiKey
    spotPrivateGetV2UserUid::Function = spotPrivateGetV2UserUid
    spotPrivateGetV2SubUserUserList::Function = spotPrivateGetV2SubUserUserList
    spotPrivateGetV2SubUserUserState::Function = spotPrivateGetV2SubUserUserState
    spotPrivateGetV2SubUserAccountList::Function = spotPrivateGetV2SubUserAccountList
    spotPrivateGetV2SubUserDepositAddress::Function = spotPrivateGetV2SubUserDepositAddress
    spotPrivateGetV2SubUserQueryDeposit::Function = spotPrivateGetV2SubUserQueryDeposit
    spotPrivateGetV1SubuserAggregateBalance::Function = spotPrivateGetV1SubuserAggregateBalance
    spotPrivateGetV1AccountAccountsSubUid::Function = spotPrivateGetV1AccountAccountsSubUid
    spotPrivateGetV1OrderOpenOrders::Function = spotPrivateGetV1OrderOpenOrders
    spotPrivateGetV1OrderOrdersOrderId::Function = spotPrivateGetV1OrderOrdersOrderId
    spotPrivateGetV1OrderOrdersGetClientOrder::Function = spotPrivateGetV1OrderOrdersGetClientOrder
    spotPrivateGetV1OrderOrdersOrderIdMatchresult::Function = spotPrivateGetV1OrderOrdersOrderIdMatchresult
    spotPrivateGetV1OrderOrdersOrderIdMatchresults::Function = spotPrivateGetV1OrderOrdersOrderIdMatchresults
    spotPrivateGetV1OrderOrders::Function = spotPrivateGetV1OrderOrders
    spotPrivateGetV1OrderHistory::Function = spotPrivateGetV1OrderHistory
    spotPrivateGetV1OrderMatchresults::Function = spotPrivateGetV1OrderMatchresults
    spotPrivateGetV2ReferenceTransactFeeRate::Function = spotPrivateGetV2ReferenceTransactFeeRate
    spotPrivateGetV2AlgoOrdersOpening::Function = spotPrivateGetV2AlgoOrdersOpening
    spotPrivateGetV2AlgoOrdersHistory::Function = spotPrivateGetV2AlgoOrdersHistory
    spotPrivateGetV2AlgoOrdersSpecific::Function = spotPrivateGetV2AlgoOrdersSpecific
    spotPrivateGetV1MarginLoanInfo::Function = spotPrivateGetV1MarginLoanInfo
    spotPrivateGetV1MarginLoanOrders::Function = spotPrivateGetV1MarginLoanOrders
    spotPrivateGetV1MarginAccountsBalance::Function = spotPrivateGetV1MarginAccountsBalance
    spotPrivateGetV1CrossMarginLoanInfo::Function = spotPrivateGetV1CrossMarginLoanInfo
    spotPrivateGetV1CrossMarginLoanOrders::Function = spotPrivateGetV1CrossMarginLoanOrders
    spotPrivateGetV1CrossMarginAccountsBalance::Function = spotPrivateGetV1CrossMarginAccountsBalance
    spotPrivateGetV2AccountRepayment::Function = spotPrivateGetV2AccountRepayment
    spotPrivateGetV5AccountUniversalTransferRecords::Function = spotPrivateGetV5AccountUniversalTransferRecords
    spotPrivateGetV1StableCoinQuote::Function = spotPrivateGetV1StableCoinQuote
    spotPrivateGetV1StableCoinExchangeRate::Function = spotPrivateGetV1StableCoinExchangeRate
    spotPrivateGetV2EtpTransactions::Function = spotPrivateGetV2EtpTransactions
    spotPrivateGetV2EtpTransaction::Function = spotPrivateGetV2EtpTransaction
    spotPrivateGetV2EtpLimit::Function = spotPrivateGetV2EtpLimit
    spotPrivatePostV1AccountTransfer::Function = spotPrivatePostV1AccountTransfer
    spotPrivatePostV1FuturesTransfer::Function = spotPrivatePostV1FuturesTransfer
    spotPrivatePostV2PointTransfer::Function = spotPrivatePostV2PointTransfer
    spotPrivatePostV2AccountTransfer::Function = spotPrivatePostV2AccountTransfer
    spotPrivatePostV1DwWithdrawApiCreate::Function = spotPrivatePostV1DwWithdrawApiCreate
    spotPrivatePostV1DwWithdrawVirtualWithdrawIdCancel::Function = spotPrivatePostV1DwWithdrawVirtualWithdrawIdCancel
    spotPrivatePostV2SubUserDeductMode::Function = spotPrivatePostV2SubUserDeductMode
    spotPrivatePostV2SubUserCreation::Function = spotPrivatePostV2SubUserCreation
    spotPrivatePostV2SubUserManagement::Function = spotPrivatePostV2SubUserManagement
    spotPrivatePostV2SubUserTradableMarket::Function = spotPrivatePostV2SubUserTradableMarket
    spotPrivatePostV2SubUserTransferability::Function = spotPrivatePostV2SubUserTransferability
    spotPrivatePostV2SubUserApiKeyGeneration::Function = spotPrivatePostV2SubUserApiKeyGeneration
    spotPrivatePostV2SubUserApiKeyModification::Function = spotPrivatePostV2SubUserApiKeyModification
    spotPrivatePostV2SubUserApiKeyDeletion::Function = spotPrivatePostV2SubUserApiKeyDeletion
    spotPrivatePostV1SubuserTransfer::Function = spotPrivatePostV1SubuserTransfer
    spotPrivatePostV1TrustUserActiveCredit::Function = spotPrivatePostV1TrustUserActiveCredit
    spotPrivatePostV1OrderOrdersPlace::Function = spotPrivatePostV1OrderOrdersPlace
    spotPrivatePostV1OrderBatchOrders::Function = spotPrivatePostV1OrderBatchOrders
    spotPrivatePostV1OrderAutoPlace::Function = spotPrivatePostV1OrderAutoPlace
    spotPrivatePostV1OrderOrdersOrderIdSubmitcancel::Function = spotPrivatePostV1OrderOrdersOrderIdSubmitcancel
    spotPrivatePostV1OrderOrdersSubmitCancelClientOrder::Function = spotPrivatePostV1OrderOrdersSubmitCancelClientOrder
    spotPrivatePostV1OrderOrdersBatchCancelOpenOrders::Function = spotPrivatePostV1OrderOrdersBatchCancelOpenOrders
    spotPrivatePostV1OrderOrdersBatchcancel::Function = spotPrivatePostV1OrderOrdersBatchcancel
    spotPrivatePostV2AlgoOrdersCancelAllAfter::Function = spotPrivatePostV2AlgoOrdersCancelAllAfter
    spotPrivatePostV2AlgoOrders::Function = spotPrivatePostV2AlgoOrders
    spotPrivatePostV2AlgoOrdersCancellation::Function = spotPrivatePostV2AlgoOrdersCancellation
    spotPrivatePostV2AccountRepayment::Function = spotPrivatePostV2AccountRepayment
    spotPrivatePostV1DwTransferInMargin::Function = spotPrivatePostV1DwTransferInMargin
    spotPrivatePostV1DwTransferOutMargin::Function = spotPrivatePostV1DwTransferOutMargin
    spotPrivatePostV1MarginOrders::Function = spotPrivatePostV1MarginOrders
    spotPrivatePostV1MarginOrdersOrderIdRepay::Function = spotPrivatePostV1MarginOrdersOrderIdRepay
    spotPrivatePostV1CrossMarginTransferIn::Function = spotPrivatePostV1CrossMarginTransferIn
    spotPrivatePostV1CrossMarginTransferOut::Function = spotPrivatePostV1CrossMarginTransferOut
    spotPrivatePostV1CrossMarginOrders::Function = spotPrivatePostV1CrossMarginOrders
    spotPrivatePostV1CrossMarginOrdersOrderIdRepay::Function = spotPrivatePostV1CrossMarginOrdersOrderIdRepay
    spotPrivatePostV1StableCoinExchange::Function = spotPrivatePostV1StableCoinExchange
    spotPrivatePostV2EtpCreation::Function = spotPrivatePostV2EtpCreation
    spotPrivatePostV2EtpRedemption::Function = spotPrivatePostV2EtpRedemption
    spotPrivatePostV2EtpTransactIdCancel::Function = spotPrivatePostV2EtpTransactIdCancel
    spotPrivatePostV2EtpBatchCancel::Function = spotPrivatePostV2EtpBatchCancel
    contractPublicGetApiV1Timestamp::Function = contractPublicGetApiV1Timestamp
    contractPublicGetHeartbeat::Function = contractPublicGetHeartbeat
    contractPublicGetApiV1ContractContractInfo::Function = contractPublicGetApiV1ContractContractInfo
    contractPublicGetApiV1ContractIndex::Function = contractPublicGetApiV1ContractIndex
    contractPublicGetApiV1ContractQueryElements::Function = contractPublicGetApiV1ContractQueryElements
    contractPublicGetApiV1ContractPriceLimit::Function = contractPublicGetApiV1ContractPriceLimit
    contractPublicGetApiV1ContractOpenInterest::Function = contractPublicGetApiV1ContractOpenInterest
    contractPublicGetApiV1ContractDeliveryPrice::Function = contractPublicGetApiV1ContractDeliveryPrice
    contractPublicGetMarketDepth::Function = contractPublicGetMarketDepth
    contractPublicGetMarketBbo::Function = contractPublicGetMarketBbo
    contractPublicGetMarketHistoryKline::Function = contractPublicGetMarketHistoryKline
    contractPublicGetIndexMarketHistoryMarkPriceKline::Function = contractPublicGetIndexMarketHistoryMarkPriceKline
    contractPublicGetMarketDetailMerged::Function = contractPublicGetMarketDetailMerged
    contractPublicGetMarketDetailBatchMerged::Function = contractPublicGetMarketDetailBatchMerged
    contractPublicGetV2MarketDetailBatchMerged::Function = contractPublicGetV2MarketDetailBatchMerged
    contractPublicGetMarketTrade::Function = contractPublicGetMarketTrade
    contractPublicGetMarketHistoryTrade::Function = contractPublicGetMarketHistoryTrade
    contractPublicGetApiV1ContractRiskInfo::Function = contractPublicGetApiV1ContractRiskInfo
    contractPublicGetApiV1ContractInsuranceFund::Function = contractPublicGetApiV1ContractInsuranceFund
    contractPublicGetApiV1ContractAdjustfactor::Function = contractPublicGetApiV1ContractAdjustfactor
    contractPublicGetApiV1ContractHisOpenInterest::Function = contractPublicGetApiV1ContractHisOpenInterest
    contractPublicGetApiV1ContractLadderMargin::Function = contractPublicGetApiV1ContractLadderMargin
    contractPublicGetApiV1ContractApiState::Function = contractPublicGetApiV1ContractApiState
    contractPublicGetApiV1ContractEliteAccountRatio::Function = contractPublicGetApiV1ContractEliteAccountRatio
    contractPublicGetApiV1ContractElitePositionRatio::Function = contractPublicGetApiV1ContractElitePositionRatio
    contractPublicGetApiV1ContractLiquidationOrders::Function = contractPublicGetApiV1ContractLiquidationOrders
    contractPublicGetApiV1ContractSettlementRecords::Function = contractPublicGetApiV1ContractSettlementRecords
    contractPublicGetIndexMarketHistoryIndex::Function = contractPublicGetIndexMarketHistoryIndex
    contractPublicGetIndexMarketHistoryBasis::Function = contractPublicGetIndexMarketHistoryBasis
    contractPublicGetApiV1ContractEstimatedSettlementPrice::Function = contractPublicGetApiV1ContractEstimatedSettlementPrice
    contractPublicGetApiV3ContractLiquidationOrders::Function = contractPublicGetApiV3ContractLiquidationOrders
    contractPublicGetSwapApiV1SwapContractInfo::Function = contractPublicGetSwapApiV1SwapContractInfo
    contractPublicGetSwapApiV1SwapIndex::Function = contractPublicGetSwapApiV1SwapIndex
    contractPublicGetSwapApiV1SwapQueryElements::Function = contractPublicGetSwapApiV1SwapQueryElements
    contractPublicGetSwapApiV1SwapPriceLimit::Function = contractPublicGetSwapApiV1SwapPriceLimit
    contractPublicGetSwapApiV1SwapOpenInterest::Function = contractPublicGetSwapApiV1SwapOpenInterest
    contractPublicGetSwapExMarketDepth::Function = contractPublicGetSwapExMarketDepth
    contractPublicGetSwapExMarketBbo::Function = contractPublicGetSwapExMarketBbo
    contractPublicGetSwapExMarketHistoryKline::Function = contractPublicGetSwapExMarketHistoryKline
    contractPublicGetIndexMarketHistorySwapMarkPriceKline::Function = contractPublicGetIndexMarketHistorySwapMarkPriceKline
    contractPublicGetSwapExMarketDetailMerged::Function = contractPublicGetSwapExMarketDetailMerged
    contractPublicGetV2SwapExMarketDetailBatchMerged::Function = contractPublicGetV2SwapExMarketDetailBatchMerged
    contractPublicGetIndexMarketHistorySwapPremiumIndexKline::Function = contractPublicGetIndexMarketHistorySwapPremiumIndexKline
    contractPublicGetSwapExMarketDetailBatchMerged::Function = contractPublicGetSwapExMarketDetailBatchMerged
    contractPublicGetSwapExMarketTrade::Function = contractPublicGetSwapExMarketTrade
    contractPublicGetSwapExMarketHistoryTrade::Function = contractPublicGetSwapExMarketHistoryTrade
    contractPublicGetSwapApiV1SwapRiskInfo::Function = contractPublicGetSwapApiV1SwapRiskInfo
    contractPublicGetSwapApiV1SwapInsuranceFund::Function = contractPublicGetSwapApiV1SwapInsuranceFund
    contractPublicGetSwapApiV1SwapAdjustfactor::Function = contractPublicGetSwapApiV1SwapAdjustfactor
    contractPublicGetSwapApiV1SwapHisOpenInterest::Function = contractPublicGetSwapApiV1SwapHisOpenInterest
    contractPublicGetSwapApiV1SwapLadderMargin::Function = contractPublicGetSwapApiV1SwapLadderMargin
    contractPublicGetSwapApiV1SwapApiState::Function = contractPublicGetSwapApiV1SwapApiState
    contractPublicGetSwapApiV1SwapEliteAccountRatio::Function = contractPublicGetSwapApiV1SwapEliteAccountRatio
    contractPublicGetSwapApiV1SwapElitePositionRatio::Function = contractPublicGetSwapApiV1SwapElitePositionRatio
    contractPublicGetSwapApiV1SwapEstimatedSettlementPrice::Function = contractPublicGetSwapApiV1SwapEstimatedSettlementPrice
    contractPublicGetSwapApiV1SwapLiquidationOrders::Function = contractPublicGetSwapApiV1SwapLiquidationOrders
    contractPublicGetSwapApiV1SwapSettlementRecords::Function = contractPublicGetSwapApiV1SwapSettlementRecords
    contractPublicGetSwapApiV1SwapFundingRate::Function = contractPublicGetSwapApiV1SwapFundingRate
    contractPublicGetSwapApiV1SwapBatchFundingRate::Function = contractPublicGetSwapApiV1SwapBatchFundingRate
    contractPublicGetSwapApiV1SwapHistoricalFundingRate::Function = contractPublicGetSwapApiV1SwapHistoricalFundingRate
    contractPublicGetSwapApiV3SwapLiquidationOrders::Function = contractPublicGetSwapApiV3SwapLiquidationOrders
    contractPublicGetIndexMarketHistorySwapEstimatedRateKline::Function = contractPublicGetIndexMarketHistorySwapEstimatedRateKline
    contractPublicGetIndexMarketHistorySwapBasis::Function = contractPublicGetIndexMarketHistorySwapBasis
    contractPublicGetLinearSwapApiV1SwapContractInfo::Function = contractPublicGetLinearSwapApiV1SwapContractInfo
    contractPublicGetLinearSwapApiV1SwapIndex::Function = contractPublicGetLinearSwapApiV1SwapIndex
    contractPublicGetLinearSwapApiV1SwapQueryElements::Function = contractPublicGetLinearSwapApiV1SwapQueryElements
    contractPublicGetLinearSwapApiV1SwapPriceLimit::Function = contractPublicGetLinearSwapApiV1SwapPriceLimit
    contractPublicGetLinearSwapExMarketDepth::Function = contractPublicGetLinearSwapExMarketDepth
    contractPublicGetLinearSwapExMarketBbo::Function = contractPublicGetLinearSwapExMarketBbo
    contractPublicGetLinearSwapExMarketHistoryKline::Function = contractPublicGetLinearSwapExMarketHistoryKline
    contractPublicGetIndexMarketHistoryLinearSwapMarkPriceKline::Function = contractPublicGetIndexMarketHistoryLinearSwapMarkPriceKline
    contractPublicGetLinearSwapExMarketDetailMerged::Function = contractPublicGetLinearSwapExMarketDetailMerged
    contractPublicGetLinearSwapExMarketDetailBatchMerged::Function = contractPublicGetLinearSwapExMarketDetailBatchMerged
    contractPublicGetV2LinearSwapExMarketDetailBatchMerged::Function = contractPublicGetV2LinearSwapExMarketDetailBatchMerged
    contractPublicGetLinearSwapExMarketTrade::Function = contractPublicGetLinearSwapExMarketTrade
    contractPublicGetLinearSwapExMarketHistoryTrade::Function = contractPublicGetLinearSwapExMarketHistoryTrade
    contractPublicGetSwapApiV1LinearSwapApiV1SwapInsuranceFund::Function = contractPublicGetSwapApiV1LinearSwapApiV1SwapInsuranceFund
    contractPublicGetLinearSwapApiV1SwapAdjustfactor::Function = contractPublicGetLinearSwapApiV1SwapAdjustfactor
    contractPublicGetLinearSwapApiV1SwapCrossAdjustfactor::Function = contractPublicGetLinearSwapApiV1SwapCrossAdjustfactor
    contractPublicGetLinearSwapApiV1SwapHisOpenInterest::Function = contractPublicGetLinearSwapApiV1SwapHisOpenInterest
    contractPublicGetLinearSwapApiV1SwapLadderMargin::Function = contractPublicGetLinearSwapApiV1SwapLadderMargin
    contractPublicGetLinearSwapApiV1SwapCrossLadderMargin::Function = contractPublicGetLinearSwapApiV1SwapCrossLadderMargin
    contractPublicGetLinearSwapApiV1SwapApiState::Function = contractPublicGetLinearSwapApiV1SwapApiState
    contractPublicGetLinearSwapApiV1SwapEliteAccountRatio::Function = contractPublicGetLinearSwapApiV1SwapEliteAccountRatio
    contractPublicGetLinearSwapApiV1SwapElitePositionRatio::Function = contractPublicGetLinearSwapApiV1SwapElitePositionRatio
    contractPublicGetLinearSwapApiV1SwapSettlementRecords::Function = contractPublicGetLinearSwapApiV1SwapSettlementRecords
    contractPublicGetLinearSwapApiV3SwapLiquidationOrders::Function = contractPublicGetLinearSwapApiV3SwapLiquidationOrders
    contractPublicGetIndexMarketHistoryLinearSwapPremiumIndexKline::Function = contractPublicGetIndexMarketHistoryLinearSwapPremiumIndexKline
    contractPublicGetIndexMarketHistoryLinearSwapEstimatedRateKline::Function = contractPublicGetIndexMarketHistoryLinearSwapEstimatedRateKline
    contractPublicGetIndexMarketHistoryLinearSwapBasis::Function = contractPublicGetIndexMarketHistoryLinearSwapBasis
    contractPublicGetLinearSwapApiV1SwapEstimatedSettlementPrice::Function = contractPublicGetLinearSwapApiV1SwapEstimatedSettlementPrice
    contractPublicGetV5MarketFundingRate::Function = contractPublicGetV5MarketFundingRate
    contractPublicGetV5MarketFundingRateHistory::Function = contractPublicGetV5MarketFundingRateHistory
    contractPublicGetV5MarketOpenInterest::Function = contractPublicGetV5MarketOpenInterest
    contractPublicGetV5MarketLiquidationOrders::Function = contractPublicGetV5MarketLiquidationOrders
    contractPublicGetV5MarketSettlementHistory::Function = contractPublicGetV5MarketSettlementHistory
    contractPublicGetV5MarketEliteAccountRatio::Function = contractPublicGetV5MarketEliteAccountRatio
    contractPublicGetV5MarketElitePositionRatio::Function = contractPublicGetV5MarketElitePositionRatio
    contractPublicGetV5MarketEstimatedSettlementPrice::Function = contractPublicGetV5MarketEstimatedSettlementPrice
    contractPublicGetV5MarketPriceLimit::Function = contractPublicGetV5MarketPriceLimit
    contractPrivateGetApiV1ContractSubAuthList::Function = contractPrivateGetApiV1ContractSubAuthList
    contractPrivateGetApiV1ContractApiTradingStatus::Function = contractPrivateGetApiV1ContractApiTradingStatus
    contractPrivateGetSwapApiV1SwapSubAuthList::Function = contractPrivateGetSwapApiV1SwapSubAuthList
    contractPrivateGetSwapApiV1SwapApiTradingStatus::Function = contractPrivateGetSwapApiV1SwapApiTradingStatus
    contractPrivateGetV5AccountAssetMode::Function = contractPrivateGetV5AccountAssetMode
    contractPrivateGetV5AccountBalance::Function = contractPrivateGetV5AccountBalance
    contractPrivateGetV5AccountBills::Function = contractPrivateGetV5AccountBills
    contractPrivateGetV5AccountFeeDeductionCurrency::Function = contractPrivateGetV5AccountFeeDeductionCurrency
    contractPrivateGetV5TradePositionOpens::Function = contractPrivateGetV5TradePositionOpens
    contractPrivateGetV5TradeOrderOpens::Function = contractPrivateGetV5TradeOrderOpens
    contractPrivateGetV5TradeOrderDetails::Function = contractPrivateGetV5TradeOrderDetails
    contractPrivateGetV5TradeOrderHistory::Function = contractPrivateGetV5TradeOrderHistory
    contractPrivateGetV5TradeOrder::Function = contractPrivateGetV5TradeOrder
    contractPrivateGetV5PositionLever::Function = contractPrivateGetV5PositionLever
    contractPrivateGetV5PositionMode::Function = contractPrivateGetV5PositionMode
    contractPrivateGetV5PositionRiskLimit::Function = contractPrivateGetV5PositionRiskLimit
    contractPrivateGetV5PositionRiskLimitTier::Function = contractPrivateGetV5PositionRiskLimitTier
    contractPrivateGetV5MarketRiskLimit::Function = contractPrivateGetV5MarketRiskLimit
    contractPrivateGetV5MarketAssetsDeductionCurrency::Function = contractPrivateGetV5MarketAssetsDeductionCurrency
    contractPrivateGetV5MarketMultiAssetsMargin::Function = contractPrivateGetV5MarketMultiAssetsMargin
    contractPrivateGetV5AlgoOrderOpens::Function = contractPrivateGetV5AlgoOrderOpens
    contractPrivateGetV5AlgoOrder::Function = contractPrivateGetV5AlgoOrder
    contractPrivateGetV5AlgoOrderHistory::Function = contractPrivateGetV5AlgoOrderHistory
    contractPrivatePostApiV1ContractBalanceValuation::Function = contractPrivatePostApiV1ContractBalanceValuation
    contractPrivatePostApiV1ContractAccountInfo::Function = contractPrivatePostApiV1ContractAccountInfo
    contractPrivatePostApiV1ContractPositionInfo::Function = contractPrivatePostApiV1ContractPositionInfo
    contractPrivatePostApiV1ContractSubAuth::Function = contractPrivatePostApiV1ContractSubAuth
    contractPrivatePostApiV1ContractSubAccountList::Function = contractPrivatePostApiV1ContractSubAccountList
    contractPrivatePostApiV1ContractSubAccountInfoList::Function = contractPrivatePostApiV1ContractSubAccountInfoList
    contractPrivatePostApiV1ContractSubAccountInfo::Function = contractPrivatePostApiV1ContractSubAccountInfo
    contractPrivatePostApiV1ContractSubPositionInfo::Function = contractPrivatePostApiV1ContractSubPositionInfo
    contractPrivatePostApiV1ContractFinancialRecord::Function = contractPrivatePostApiV1ContractFinancialRecord
    contractPrivatePostApiV1ContractFinancialRecordExact::Function = contractPrivatePostApiV1ContractFinancialRecordExact
    contractPrivatePostApiV1ContractUserSettlementRecords::Function = contractPrivatePostApiV1ContractUserSettlementRecords
    contractPrivatePostApiV1ContractOrderLimit::Function = contractPrivatePostApiV1ContractOrderLimit
    contractPrivatePostApiV1ContractFee::Function = contractPrivatePostApiV1ContractFee
    contractPrivatePostApiV1ContractTransferLimit::Function = contractPrivatePostApiV1ContractTransferLimit
    contractPrivatePostApiV1ContractPositionLimit::Function = contractPrivatePostApiV1ContractPositionLimit
    contractPrivatePostApiV1ContractAccountPositionInfo::Function = contractPrivatePostApiV1ContractAccountPositionInfo
    contractPrivatePostApiV1ContractMasterSubTransfer::Function = contractPrivatePostApiV1ContractMasterSubTransfer
    contractPrivatePostApiV1ContractMasterSubTransferRecord::Function = contractPrivatePostApiV1ContractMasterSubTransferRecord
    contractPrivatePostApiV1ContractAvailableLevelRate::Function = contractPrivatePostApiV1ContractAvailableLevelRate
    contractPrivatePostApiV3ContractFinancialRecord::Function = contractPrivatePostApiV3ContractFinancialRecord
    contractPrivatePostApiV3ContractFinancialRecordExact::Function = contractPrivatePostApiV3ContractFinancialRecordExact
    contractPrivatePostApiV1ContractCancelAfter::Function = contractPrivatePostApiV1ContractCancelAfter
    contractPrivatePostApiV1ContractOrder::Function = contractPrivatePostApiV1ContractOrder
    contractPrivatePostApiV1ContractBatchorder::Function = contractPrivatePostApiV1ContractBatchorder
    contractPrivatePostApiV1ContractCancel::Function = contractPrivatePostApiV1ContractCancel
    contractPrivatePostApiV1ContractCancelall::Function = contractPrivatePostApiV1ContractCancelall
    contractPrivatePostApiV1ContractSwitchLeverRate::Function = contractPrivatePostApiV1ContractSwitchLeverRate
    contractPrivatePostApiV1LightningClosePosition::Function = contractPrivatePostApiV1LightningClosePosition
    contractPrivatePostApiV1ContractOrderInfo::Function = contractPrivatePostApiV1ContractOrderInfo
    contractPrivatePostApiV1ContractOrderDetail::Function = contractPrivatePostApiV1ContractOrderDetail
    contractPrivatePostApiV1ContractOpenorders::Function = contractPrivatePostApiV1ContractOpenorders
    contractPrivatePostApiV1ContractHisorders::Function = contractPrivatePostApiV1ContractHisorders
    contractPrivatePostApiV1ContractHisordersExact::Function = contractPrivatePostApiV1ContractHisordersExact
    contractPrivatePostApiV1ContractMatchresults::Function = contractPrivatePostApiV1ContractMatchresults
    contractPrivatePostApiV1ContractMatchresultsExact::Function = contractPrivatePostApiV1ContractMatchresultsExact
    contractPrivatePostApiV3ContractHisorders::Function = contractPrivatePostApiV3ContractHisorders
    contractPrivatePostApiV3ContractHisordersExact::Function = contractPrivatePostApiV3ContractHisordersExact
    contractPrivatePostApiV3ContractMatchresults::Function = contractPrivatePostApiV3ContractMatchresults
    contractPrivatePostApiV3ContractMatchresultsExact::Function = contractPrivatePostApiV3ContractMatchresultsExact
    contractPrivatePostApiV1ContractTriggerOrder::Function = contractPrivatePostApiV1ContractTriggerOrder
    contractPrivatePostApiV1ContractTriggerCancel::Function = contractPrivatePostApiV1ContractTriggerCancel
    contractPrivatePostApiV1ContractTriggerCancelall::Function = contractPrivatePostApiV1ContractTriggerCancelall
    contractPrivatePostApiV1ContractTriggerOpenorders::Function = contractPrivatePostApiV1ContractTriggerOpenorders
    contractPrivatePostApiV1ContractTriggerHisorders::Function = contractPrivatePostApiV1ContractTriggerHisorders
    contractPrivatePostApiV1ContractTpslOrder::Function = contractPrivatePostApiV1ContractTpslOrder
    contractPrivatePostApiV1ContractTpslCancel::Function = contractPrivatePostApiV1ContractTpslCancel
    contractPrivatePostApiV1ContractTpslCancelall::Function = contractPrivatePostApiV1ContractTpslCancelall
    contractPrivatePostApiV1ContractTpslOpenorders::Function = contractPrivatePostApiV1ContractTpslOpenorders
    contractPrivatePostApiV1ContractTpslHisorders::Function = contractPrivatePostApiV1ContractTpslHisorders
    contractPrivatePostApiV1ContractRelationTpslOrder::Function = contractPrivatePostApiV1ContractRelationTpslOrder
    contractPrivatePostApiV1ContractTrackOrder::Function = contractPrivatePostApiV1ContractTrackOrder
    contractPrivatePostApiV1ContractTrackCancel::Function = contractPrivatePostApiV1ContractTrackCancel
    contractPrivatePostApiV1ContractTrackCancelall::Function = contractPrivatePostApiV1ContractTrackCancelall
    contractPrivatePostApiV1ContractTrackOpenorders::Function = contractPrivatePostApiV1ContractTrackOpenorders
    contractPrivatePostApiV1ContractTrackHisorders::Function = contractPrivatePostApiV1ContractTrackHisorders
    contractPrivatePostSwapApiV1SwapBalanceValuation::Function = contractPrivatePostSwapApiV1SwapBalanceValuation
    contractPrivatePostSwapApiV1SwapAccountInfo::Function = contractPrivatePostSwapApiV1SwapAccountInfo
    contractPrivatePostSwapApiV1SwapPositionInfo::Function = contractPrivatePostSwapApiV1SwapPositionInfo
    contractPrivatePostSwapApiV1SwapAccountPositionInfo::Function = contractPrivatePostSwapApiV1SwapAccountPositionInfo
    contractPrivatePostSwapApiV1SwapSubAuth::Function = contractPrivatePostSwapApiV1SwapSubAuth
    contractPrivatePostSwapApiV1SwapSubAccountList::Function = contractPrivatePostSwapApiV1SwapSubAccountList
    contractPrivatePostSwapApiV1SwapSubAccountInfoList::Function = contractPrivatePostSwapApiV1SwapSubAccountInfoList
    contractPrivatePostSwapApiV1SwapSubAccountInfo::Function = contractPrivatePostSwapApiV1SwapSubAccountInfo
    contractPrivatePostSwapApiV1SwapSubPositionInfo::Function = contractPrivatePostSwapApiV1SwapSubPositionInfo
    contractPrivatePostSwapApiV1SwapFinancialRecord::Function = contractPrivatePostSwapApiV1SwapFinancialRecord
    contractPrivatePostSwapApiV1SwapFinancialRecordExact::Function = contractPrivatePostSwapApiV1SwapFinancialRecordExact
    contractPrivatePostSwapApiV1SwapUserSettlementRecords::Function = contractPrivatePostSwapApiV1SwapUserSettlementRecords
    contractPrivatePostSwapApiV1SwapAvailableLevelRate::Function = contractPrivatePostSwapApiV1SwapAvailableLevelRate
    contractPrivatePostSwapApiV1SwapOrderLimit::Function = contractPrivatePostSwapApiV1SwapOrderLimit
    contractPrivatePostSwapApiV1SwapFee::Function = contractPrivatePostSwapApiV1SwapFee
    contractPrivatePostSwapApiV1SwapTransferLimit::Function = contractPrivatePostSwapApiV1SwapTransferLimit
    contractPrivatePostSwapApiV1SwapPositionLimit::Function = contractPrivatePostSwapApiV1SwapPositionLimit
    contractPrivatePostSwapApiV1SwapMasterSubTransfer::Function = contractPrivatePostSwapApiV1SwapMasterSubTransfer
    contractPrivatePostSwapApiV1SwapMasterSubTransferRecord::Function = contractPrivatePostSwapApiV1SwapMasterSubTransferRecord
    contractPrivatePostSwapApiV3SwapFinancialRecord::Function = contractPrivatePostSwapApiV3SwapFinancialRecord
    contractPrivatePostSwapApiV3SwapFinancialRecordExact::Function = contractPrivatePostSwapApiV3SwapFinancialRecordExact
    contractPrivatePostSwapApiV1SwapCancelAfter::Function = contractPrivatePostSwapApiV1SwapCancelAfter
    contractPrivatePostSwapApiV1SwapOrder::Function = contractPrivatePostSwapApiV1SwapOrder
    contractPrivatePostSwapApiV1SwapBatchorder::Function = contractPrivatePostSwapApiV1SwapBatchorder
    contractPrivatePostSwapApiV1SwapCancel::Function = contractPrivatePostSwapApiV1SwapCancel
    contractPrivatePostSwapApiV1SwapCancelall::Function = contractPrivatePostSwapApiV1SwapCancelall
    contractPrivatePostSwapApiV1SwapLightningClosePosition::Function = contractPrivatePostSwapApiV1SwapLightningClosePosition
    contractPrivatePostSwapApiV1SwapSwitchLeverRate::Function = contractPrivatePostSwapApiV1SwapSwitchLeverRate
    contractPrivatePostSwapApiV1SwapOrderInfo::Function = contractPrivatePostSwapApiV1SwapOrderInfo
    contractPrivatePostSwapApiV1SwapOrderDetail::Function = contractPrivatePostSwapApiV1SwapOrderDetail
    contractPrivatePostSwapApiV1SwapOpenorders::Function = contractPrivatePostSwapApiV1SwapOpenorders
    contractPrivatePostSwapApiV1SwapHisorders::Function = contractPrivatePostSwapApiV1SwapHisorders
    contractPrivatePostSwapApiV1SwapHisordersExact::Function = contractPrivatePostSwapApiV1SwapHisordersExact
    contractPrivatePostSwapApiV1SwapMatchresults::Function = contractPrivatePostSwapApiV1SwapMatchresults
    contractPrivatePostSwapApiV1SwapMatchresultsExact::Function = contractPrivatePostSwapApiV1SwapMatchresultsExact
    contractPrivatePostSwapApiV3SwapMatchresults::Function = contractPrivatePostSwapApiV3SwapMatchresults
    contractPrivatePostSwapApiV3SwapMatchresultsExact::Function = contractPrivatePostSwapApiV3SwapMatchresultsExact
    contractPrivatePostSwapApiV3SwapHisorders::Function = contractPrivatePostSwapApiV3SwapHisorders
    contractPrivatePostSwapApiV3SwapHisordersExact::Function = contractPrivatePostSwapApiV3SwapHisordersExact
    contractPrivatePostSwapApiV1SwapTriggerOrder::Function = contractPrivatePostSwapApiV1SwapTriggerOrder
    contractPrivatePostSwapApiV1SwapTriggerCancel::Function = contractPrivatePostSwapApiV1SwapTriggerCancel
    contractPrivatePostSwapApiV1SwapTriggerCancelall::Function = contractPrivatePostSwapApiV1SwapTriggerCancelall
    contractPrivatePostSwapApiV1SwapTriggerOpenorders::Function = contractPrivatePostSwapApiV1SwapTriggerOpenorders
    contractPrivatePostSwapApiV1SwapTriggerHisorders::Function = contractPrivatePostSwapApiV1SwapTriggerHisorders
    contractPrivatePostSwapApiV1SwapTpslOrder::Function = contractPrivatePostSwapApiV1SwapTpslOrder
    contractPrivatePostSwapApiV1SwapTpslCancel::Function = contractPrivatePostSwapApiV1SwapTpslCancel
    contractPrivatePostSwapApiV1SwapTpslCancelall::Function = contractPrivatePostSwapApiV1SwapTpslCancelall
    contractPrivatePostSwapApiV1SwapTpslOpenorders::Function = contractPrivatePostSwapApiV1SwapTpslOpenorders
    contractPrivatePostSwapApiV1SwapTpslHisorders::Function = contractPrivatePostSwapApiV1SwapTpslHisorders
    contractPrivatePostSwapApiV1SwapRelationTpslOrder::Function = contractPrivatePostSwapApiV1SwapRelationTpslOrder
    contractPrivatePostSwapApiV1SwapTrackOrder::Function = contractPrivatePostSwapApiV1SwapTrackOrder
    contractPrivatePostSwapApiV1SwapTrackCancel::Function = contractPrivatePostSwapApiV1SwapTrackCancel
    contractPrivatePostSwapApiV1SwapTrackCancelall::Function = contractPrivatePostSwapApiV1SwapTrackCancelall
    contractPrivatePostSwapApiV1SwapTrackOpenorders::Function = contractPrivatePostSwapApiV1SwapTrackOpenorders
    contractPrivatePostSwapApiV1SwapTrackHisorders::Function = contractPrivatePostSwapApiV1SwapTrackHisorders
    contractPrivatePostV5AccountAssetMode::Function = contractPrivatePostV5AccountAssetMode
    contractPrivatePostV5TradeOrder::Function = contractPrivatePostV5TradeOrder
    contractPrivatePostV5TradeBatchOrders::Function = contractPrivatePostV5TradeBatchOrders
    contractPrivatePostV5TradeCancelOrder::Function = contractPrivatePostV5TradeCancelOrder
    contractPrivatePostV5TradeCancelBatchOrders::Function = contractPrivatePostV5TradeCancelBatchOrders
    contractPrivatePostV5TradeCancelAllOrders::Function = contractPrivatePostV5TradeCancelAllOrders
    contractPrivatePostV5TradeCancelAfter::Function = contractPrivatePostV5TradeCancelAfter
    contractPrivatePostV5TradePosition::Function = contractPrivatePostV5TradePosition
    contractPrivatePostV5TradePositionAll::Function = contractPrivatePostV5TradePositionAll
    contractPrivatePostV5PositionLever::Function = contractPrivatePostV5PositionLever
    contractPrivatePostV5PositionMode::Function = contractPrivatePostV5PositionMode
    contractPrivatePostV5PositionMargin::Function = contractPrivatePostV5PositionMargin
    contractPrivatePostV5AccountFeeDeductionCurrency::Function = contractPrivatePostV5AccountFeeDeductionCurrency
    contractPrivatePostV5AlgoOrder::Function = contractPrivatePostV5AlgoOrder
    contractPrivatePostV5AlgoCancelOrders::Function = contractPrivatePostV5AlgoCancelOrders

end
function describe(self::Htx, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "htx",
    Symbol("name") => "HTX",
    Symbol("countries") => ["CN"],
    Symbol("rateLimit") => 100,
    Symbol("userAgent") => get(self.userAgents, Symbol("chrome100"), nothing),
    Symbol("certified") => true,
    Symbol("version") => "v1",
    Symbol("hostname") => "api.huobi.pro",
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => nothing,
        Symbol("addMargin") => nothing,
        Symbol("borrowCrossMargin") => true,
        Symbol("borrowIsolatedMargin") => true,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => true,
        Symbol("createDepositAddress") => nothing,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTrailingPercentOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => nothing,
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => nothing,
        Symbol("fetchBorrowRateHistory") => nothing,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrder") => nothing,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => nothing,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => nothing,
        Symbol("fetchDepositAddressesByNetwork") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => true,
        Symbol("fetchL3OrderBook") => nothing,
        Symbol("fetchLastPrices") => true,
        Symbol("fetchLedger") => true,
        Symbol("fetchLedgerEntry") => nothing,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchLiquidations") => true,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarketLeverageTiers") => "emulated",
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => true,
        Symbol("fetchOpenInterests") => true,
        Symbol("fetchOpenOrder") => nothing,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => nothing,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionADLRank") => true,
        Symbol("fetchPositionHistory") => "emulated",
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsADLRank") => true,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => true,
        Symbol("fetchSettlementHistory") => true,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTradingLimits") => true,
        Symbol("fetchTransactionFee") => nothing,
        Symbol("fetchTransactionFees") => nothing,
        Symbol("fetchTransactions") => nothing,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawAddresses") => true,
        Symbol("fetchWithdrawal") => nothing,
        Symbol("fetchWithdrawals") => true,
        Symbol("fetchWithdrawalWhitelist") => nothing,
        Symbol("reduceMargin") => nothing,
        Symbol("repayCrossMargin") => true,
        Symbol("repayIsolatedMargin") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => true,
        Symbol("signIn") => nothing,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1min",
        Symbol("5m") => "5min",
        Symbol("15m") => "15min",
        Symbol("30m") => "30min",
        Symbol("1h") => "60min",
        Symbol("4h") => "4hour",
        Symbol("1d") => "1day",
        Symbol("1w") => "1week",
        Symbol("1M") => "1mon",
        Symbol("1y") => "1year"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg",
        Symbol("hostnames") => Dict{Symbol, Any}(
            Symbol("contract") => "api.hbdm.vn",
            Symbol("spot") => "api.huobi.pro",
            Symbol("status") => Dict{Symbol, Any}(
                Symbol("spot") => "status.huobigroup.com",
                Symbol("future") => Dict{Symbol, Any}(
                    Symbol("inverse") => "status-dm.huobigroup.com",
                    Symbol("linear") => "status-linear-swap.huobigroup.com"
                ),
                Symbol("swap") => Dict{Symbol, Any}(
                    Symbol("inverse") => "status-swap.huobigroup.com",
                    Symbol("linear") => "status-linear-swap.huobigroup.com"
                )
            )
        ),
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("status") => "https://{hostname}",
            Symbol("contract") => "https://{hostname}",
            Symbol("spot") => "https://{hostname}",
            Symbol("public") => "https://{hostname}",
            Symbol("private") => "https://{hostname}",
            Symbol("v2Public") => "https://{hostname}",
            Symbol("v2Private") => "https://{hostname}"
        ),
        Symbol("www") => "https://www.huobi.com",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://www.htx.com/invite/en-us/1h?invite_code=6rmm2223",
            Symbol("discount") => 0.15
        ),
        Symbol("doc") => ["https://huobiapi.github.io/docs/spot/v1/en/", "https://huobiapi.github.io/docs/dm/v1/en/", "https://huobiapi.github.io/docs/coin_margined_swap/v1/en/", "https://huobiapi.github.io/docs/usdt_swap/v1/en/", "https://www.huobi.com/en-us/opend/newApiPages/"],
        Symbol("fees") => "https://www.huobi.com/about/fee/"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("v2Public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("reference/currencies") => 1,
                Symbol("market-status") => 1
            )
        ),
        Symbol("v2Private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account/ledger") => 1,
                Symbol("account/withdraw/quota") => 1,
                Symbol("account/withdraw/address") => 1,
                Symbol("account/deposit/address") => 1,
                Symbol("account/repayment") => 5,
                Symbol("reference/transact-fee-rate") => 1,
                Symbol("account/asset-valuation") => 0.2,
                Symbol("point/account") => 5,
                Symbol("sub-user/user-list") => 1,
                Symbol("sub-user/user-state") => 1,
                Symbol("sub-user/account-list") => 1,
                Symbol("sub-user/deposit-address") => 1,
                Symbol("sub-user/query-deposit") => 1,
                Symbol("user/api-key") => 1,
                Symbol("user/uid") => 1,
                Symbol("algo-orders/opening") => 1,
                Symbol("algo-orders/history") => 1,
                Symbol("algo-orders/specific") => 1,
                Symbol("c2c/offers") => 1,
                Symbol("c2c/offer") => 1,
                Symbol("c2c/transactions") => 1,
                Symbol("c2c/repayment") => 1,
                Symbol("c2c/account") => 1,
                Symbol("etp/reference") => 1,
                Symbol("etp/transactions") => 5,
                Symbol("etp/transaction") => 5,
                Symbol("etp/rebalance") => 1,
                Symbol("etp/limit") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/transfer") => 1,
                Symbol("account/repayment") => 5,
                Symbol("point/transfer") => 5,
                Symbol("sub-user/management") => 1,
                Symbol("sub-user/creation") => 1,
                Symbol("sub-user/tradable-market") => 1,
                Symbol("sub-user/transferability") => 1,
                Symbol("sub-user/api-key-generation") => 1,
                Symbol("sub-user/api-key-modification") => 1,
                Symbol("sub-user/api-key-deletion") => 1,
                Symbol("sub-user/deduct-mode") => 1,
                Symbol("algo-orders") => 1,
                Symbol("algo-orders/cancel-all-after") => 1,
                Symbol("algo-orders/cancellation") => 1,
                Symbol("c2c/offer") => 1,
                Symbol("c2c/cancellation") => 1,
                Symbol("c2c/cancel-all") => 1,
                Symbol("c2c/repayment") => 1,
                Symbol("c2c/transfer") => 1,
                Symbol("etp/creation") => 5,
                Symbol("etp/redemption") => 5,
                Symbol("etp/{transactId}/cancel") => 10,
                Symbol("etp/batch-cancel") => 50
            )
        ),
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("common/symbols") => 1,
                Symbol("common/currencys") => 1,
                Symbol("common/timestamp") => 1,
                Symbol("common/exchange") => 1,
                Symbol("settings/currencys") => 1
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("account/accounts") => 0.2,
                Symbol("account/accounts/{id}/balance") => 0.2,
                Symbol("account/accounts/{sub-uid}") => 1,
                Symbol("account/history") => 4,
                Symbol("cross-margin/loan-info") => 1,
                Symbol("margin/loan-info") => 1,
                Symbol("fee/fee-rate/get") => 1,
                Symbol("order/openOrders") => 0.4,
                Symbol("order/orders") => 0.4,
                Symbol("order/orders/{id}") => 0.4,
                Symbol("order/orders/{id}/matchresults") => 0.4,
                Symbol("order/orders/getClientOrder") => 0.4,
                Symbol("order/history") => 1,
                Symbol("order/matchresults") => 1,
                Symbol("query/deposit-withdraw") => 1,
                Symbol("margin/loan-orders") => 0.2,
                Symbol("margin/accounts/balance") => 0.2,
                Symbol("cross-margin/loan-orders") => 1,
                Symbol("cross-margin/accounts/balance") => 1,
                Symbol("points/actions") => 1,
                Symbol("points/orders") => 1,
                Symbol("subuser/aggregate-balance") => 10,
                Symbol("stable-coin/exchange_rate") => 1,
                Symbol("stable-coin/quote") => 1
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/transfer") => 1,
                Symbol("futures/transfer") => 1,
                Symbol("order/batch-orders") => 0.4,
                Symbol("order/orders/place") => 0.2,
                Symbol("order/orders/submitCancelClientOrder") => 0.2,
                Symbol("order/orders/batchCancelOpenOrders") => 0.4,
                Symbol("order/orders/{id}/submitcancel") => 0.2,
                Symbol("order/orders/batchcancel") => 0.4,
                Symbol("dw/withdraw/api/create") => 1,
                Symbol("dw/withdraw-virtual/{id}/cancel") => 1,
                Symbol("dw/transfer-in/margin") => 10,
                Symbol("dw/transfer-out/margin") => 10,
                Symbol("margin/orders") => 10,
                Symbol("margin/orders/{id}/repay") => 10,
                Symbol("cross-margin/transfer-in") => 1,
                Symbol("cross-margin/transfer-out") => 1,
                Symbol("cross-margin/orders") => 1,
                Symbol("cross-margin/orders/{id}/repay") => 1,
                Symbol("stable-coin/exchange") => 1,
                Symbol("subuser/transfer") => 10
            )
        ),
        Symbol("status") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("spot") => Dict{Symbol, Any}(
                    Symbol("get") => Dict{Symbol, Any}(
                        Symbol("api/v2/summary.json") => 1
                    )
                ),
                Symbol("future") => Dict{Symbol, Any}(
                    Symbol("inverse") => Dict{Symbol, Any}(
                        Symbol("get") => Dict{Symbol, Any}(
                            Symbol("api/v2/summary.json") => 1
                        )
                    ),
                    Symbol("linear") => Dict{Symbol, Any}(
                        Symbol("get") => Dict{Symbol, Any}(
                            Symbol("api/v2/summary.json") => 1
                        )
                    )
                ),
                Symbol("swap") => Dict{Symbol, Any}(
                    Symbol("inverse") => Dict{Symbol, Any}(
                        Symbol("get") => Dict{Symbol, Any}(
                            Symbol("api/v2/summary.json") => 1
                        )
                    ),
                    Symbol("linear") => Dict{Symbol, Any}(
                        Symbol("get") => Dict{Symbol, Any}(
                            Symbol("api/v2/summary.json") => 1
                        )
                    )
                )
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v2/market-status") => 1,
                    Symbol("v1/common/symbols") => 1,
                    Symbol("v1/common/currencys") => 1,
                    Symbol("v2/settings/common/currencies") => 1,
                    Symbol("v2/reference/currencies") => 1,
                    Symbol("v1/common/timestamp") => 1,
                    Symbol("v1/common/exchange") => 1,
                    Symbol("v1/settings/common/chains") => 1,
                    Symbol("v1/settings/common/currencys") => 1,
                    Symbol("v1/settings/common/symbols") => 1,
                    Symbol("v2/settings/common/symbols") => 1,
                    Symbol("v1/settings/common/market-symbols") => 1,
                    Symbol("market/history/candles") => 1,
                    Symbol("market/history/kline") => 1,
                    Symbol("market/detail/merged") => 1,
                    Symbol("market/tickers") => 1,
                    Symbol("market/detail") => 1,
                    Symbol("market/depth") => 1,
                    Symbol("market/trade") => 1,
                    Symbol("market/history/trade") => 1,
                    Symbol("market/etp") => 1,
                    Symbol("v2/etp/reference") => 1,
                    Symbol("v2/etp/rebalance") => 1
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("v1/account/accounts") => 0.2,
                    Symbol("v1/account/accounts/{account-id}/balance") => 0.2,
                    Symbol("v2/account/valuation") => 1,
                    Symbol("v2/account/asset-valuation") => 0.2,
                    Symbol("v1/account/history") => 4,
                    Symbol("v2/account/ledger") => 1,
                    Symbol("v2/point/account") => 5,
                    Symbol("v2/account/deposit/address") => 1,
                    Symbol("v2/account/withdraw/quota") => 1,
                    Symbol("v2/account/withdraw/address") => 1,
                    Symbol("v2/reference/currencies") => 1,
                    Symbol("v1/query/deposit-withdraw") => 1,
                    Symbol("v1/query/withdraw/client-order-id") => 1,
                    Symbol("v2/user/api-key") => 1,
                    Symbol("v2/user/uid") => 1,
                    Symbol("v2/sub-user/user-list") => 1,
                    Symbol("v2/sub-user/user-state") => 1,
                    Symbol("v2/sub-user/account-list") => 1,
                    Symbol("v2/sub-user/deposit-address") => 1,
                    Symbol("v2/sub-user/query-deposit") => 1,
                    Symbol("v1/subuser/aggregate-balance") => 10,
                    Symbol("v1/account/accounts/{sub-uid}") => 1,
                    Symbol("v1/order/openOrders") => 0.4,
                    Symbol("v1/order/orders/{order-id}") => 0.4,
                    Symbol("v1/order/orders/getClientOrder") => 0.4,
                    Symbol("v1/order/orders/{order-id}/matchresult") => 0.4,
                    Symbol("v1/order/orders/{order-id}/matchresults") => 0.4,
                    Symbol("v1/order/orders") => 0.4,
                    Symbol("v1/order/history") => 1,
                    Symbol("v1/order/matchresults") => 1,
                    Symbol("v2/reference/transact-fee-rate") => 1,
                    Symbol("v2/algo-orders/opening") => 1,
                    Symbol("v2/algo-orders/history") => 1,
                    Symbol("v2/algo-orders/specific") => 1,
                    Symbol("v1/margin/loan-info") => 1,
                    Symbol("v1/margin/loan-orders") => 0.2,
                    Symbol("v1/margin/accounts/balance") => 0.2,
                    Symbol("v1/cross-margin/loan-info") => 1,
                    Symbol("v1/cross-margin/loan-orders") => 1,
                    Symbol("v1/cross-margin/accounts/balance") => 1,
                    Symbol("v2/account/repayment") => 5,
                    Symbol("v5/account/universal_transfer_records") => 4,
                    Symbol("v1/stable-coin/quote") => 1,
                    Symbol("v1/stable_coin/exchange_rate") => 1,
                    Symbol("v2/etp/transactions") => 5,
                    Symbol("v2/etp/transaction") => 5,
                    Symbol("v2/etp/limit") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("v1/account/transfer") => 1,
                    Symbol("v1/futures/transfer") => 1,
                    Symbol("v2/point/transfer") => 5,
                    Symbol("v2/account/transfer") => 1,
                    Symbol("v1/dw/withdraw/api/create") => 1,
                    Symbol("v1/dw/withdraw-virtual/{withdraw-id}/cancel") => 1,
                    Symbol("v2/sub-user/deduct-mode") => 1,
                    Symbol("v2/sub-user/creation") => 1,
                    Symbol("v2/sub-user/management") => 1,
                    Symbol("v2/sub-user/tradable-market") => 1,
                    Symbol("v2/sub-user/transferability") => 1,
                    Symbol("v2/sub-user/api-key-generation") => 1,
                    Symbol("v2/sub-user/api-key-modification") => 1,
                    Symbol("v2/sub-user/api-key-deletion") => 1,
                    Symbol("v1/subuser/transfer") => 10,
                    Symbol("v1/trust/user/active/credit") => 10,
                    Symbol("v1/order/orders/place") => 0.2,
                    Symbol("v1/order/batch-orders") => 0.4,
                    Symbol("v1/order/auto/place") => 0.2,
                    Symbol("v1/order/orders/{order-id}/submitcancel") => 0.2,
                    Symbol("v1/order/orders/submitCancelClientOrder") => 0.2,
                    Symbol("v1/order/orders/batchCancelOpenOrders") => 0.4,
                    Symbol("v1/order/orders/batchcancel") => 0.4,
                    Symbol("v2/algo-orders/cancel-all-after") => 1,
                    Symbol("v2/algo-orders") => 1,
                    Symbol("v2/algo-orders/cancellation") => 1,
                    Symbol("v2/account/repayment") => 5,
                    Symbol("v1/dw/transfer-in/margin") => 10,
                    Symbol("v1/dw/transfer-out/margin") => 10,
                    Symbol("v1/margin/orders") => 10,
                    Symbol("v1/margin/orders/{order-id}/repay") => 10,
                    Symbol("v1/cross-margin/transfer-in") => 1,
                    Symbol("v1/cross-margin/transfer-out") => 1,
                    Symbol("v1/cross-margin/orders") => 1,
                    Symbol("v1/cross-margin/orders/{order-id}/repay") => 1,
                    Symbol("v1/stable-coin/exchange") => 1,
                    Symbol("v2/etp/creation") => 5,
                    Symbol("v2/etp/redemption") => 5,
                    Symbol("v2/etp/{transactId}/cancel") => 10,
                    Symbol("v2/etp/batch-cancel") => 50
                )
            )
        ),
        Symbol("contract") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("api/v1/timestamp") => 1,
                    Symbol("heartbeat/") => 1,
                    Symbol("api/v1/contract_contract_info") => 1,
                    Symbol("api/v1/contract_index") => 1,
                    Symbol("api/v1/contract_query_elements") => 1,
                    Symbol("api/v1/contract_price_limit") => 1,
                    Symbol("api/v1/contract_open_interest") => 1,
                    Symbol("api/v1/contract_delivery_price") => 1,
                    Symbol("market/depth") => 1,
                    Symbol("market/bbo") => 1,
                    Symbol("market/history/kline") => 1,
                    Symbol("index/market/history/mark_price_kline") => 1,
                    Symbol("market/detail/merged") => 1,
                    Symbol("market/detail/batch_merged") => 1,
                    Symbol("v2/market/detail/batch_merged") => 1,
                    Symbol("market/trade") => 1,
                    Symbol("market/history/trade") => 1,
                    Symbol("api/v1/contract_risk_info") => 1,
                    Symbol("api/v1/contract_insurance_fund") => 1,
                    Symbol("api/v1/contract_adjustfactor") => 1,
                    Symbol("api/v1/contract_his_open_interest") => 1,
                    Symbol("api/v1/contract_ladder_margin") => 1,
                    Symbol("api/v1/contract_api_state") => 1,
                    Symbol("api/v1/contract_elite_account_ratio") => 1,
                    Symbol("api/v1/contract_elite_position_ratio") => 1,
                    Symbol("api/v1/contract_liquidation_orders") => 1,
                    Symbol("api/v1/contract_settlement_records") => 1,
                    Symbol("index/market/history/index") => 1,
                    Symbol("index/market/history/basis") => 1,
                    Symbol("api/v1/contract_estimated_settlement_price") => 1,
                    Symbol("api/v3/contract_liquidation_orders") => 1,
                    Symbol("swap-api/v1/swap_contract_info") => 1,
                    Symbol("swap-api/v1/swap_index") => 1,
                    Symbol("swap-api/v1/swap_query_elements") => 1,
                    Symbol("swap-api/v1/swap_price_limit") => 1,
                    Symbol("swap-api/v1/swap_open_interest") => 1,
                    Symbol("swap-ex/market/depth") => 1,
                    Symbol("swap-ex/market/bbo") => 1,
                    Symbol("swap-ex/market/history/kline") => 1,
                    Symbol("index/market/history/swap_mark_price_kline") => 1,
                    Symbol("swap-ex/market/detail/merged") => 1,
                    Symbol("v2/swap-ex/market/detail/batch_merged") => 1,
                    Symbol("index/market/history/swap_premium_index_kline") => 1,
                    Symbol("swap-ex/market/detail/batch_merged") => 1,
                    Symbol("swap-ex/market/trade") => 1,
                    Symbol("swap-ex/market/history/trade") => 1,
                    Symbol("swap-api/v1/swap_risk_info") => 1,
                    Symbol("swap-api/v1/swap_insurance_fund") => 1,
                    Symbol("swap-api/v1/swap_adjustfactor") => 1,
                    Symbol("swap-api/v1/swap_his_open_interest") => 1,
                    Symbol("swap-api/v1/swap_ladder_margin") => 1,
                    Symbol("swap-api/v1/swap_api_state") => 1,
                    Symbol("swap-api/v1/swap_elite_account_ratio") => 1,
                    Symbol("swap-api/v1/swap_elite_position_ratio") => 1,
                    Symbol("swap-api/v1/swap_estimated_settlement_price") => 1,
                    Symbol("swap-api/v1/swap_liquidation_orders") => 1,
                    Symbol("swap-api/v1/swap_settlement_records") => 1,
                    Symbol("swap-api/v1/swap_funding_rate") => 1,
                    Symbol("swap-api/v1/swap_batch_funding_rate") => 1,
                    Symbol("swap-api/v1/swap_historical_funding_rate") => 1,
                    Symbol("swap-api/v3/swap_liquidation_orders") => 1,
                    Symbol("index/market/history/swap_estimated_rate_kline") => 1,
                    Symbol("index/market/history/swap_basis") => 1,
                    Symbol("linear-swap-api/v1/swap_contract_info") => 1,
                    Symbol("linear-swap-api/v1/swap_index") => 1,
                    Symbol("linear-swap-api/v1/swap_query_elements") => 1,
                    Symbol("linear-swap-api/v1/swap_price_limit") => 1,
                    Symbol("linear-swap-ex/market/depth") => 1,
                    Symbol("linear-swap-ex/market/bbo") => 1,
                    Symbol("linear-swap-ex/market/history/kline") => 1,
                    Symbol("index/market/history/linear_swap_mark_price_kline") => 1,
                    Symbol("linear-swap-ex/market/detail/merged") => 1,
                    Symbol("linear-swap-ex/market/detail/batch_merged") => 1,
                    Symbol("v2/linear-swap-ex/market/detail/batch_merged") => 1,
                    Symbol("linear-swap-ex/market/trade") => 1,
                    Symbol("linear-swap-ex/market/history/trade") => 1,
                    Symbol("swap-api/v1/linear-swap-api/v1/swap_insurance_fund") => 1,
                    Symbol("linear-swap-api/v1/swap_adjustfactor") => 1,
                    Symbol("linear-swap-api/v1/swap_cross_adjustfactor") => 1,
                    Symbol("linear-swap-api/v1/swap_his_open_interest") => 1,
                    Symbol("linear-swap-api/v1/swap_ladder_margin") => 1,
                    Symbol("linear-swap-api/v1/swap_cross_ladder_margin") => 1,
                    Symbol("linear-swap-api/v1/swap_api_state") => 1,
                    Symbol("linear-swap-api/v1/swap_elite_account_ratio") => 1,
                    Symbol("linear-swap-api/v1/swap_elite_position_ratio") => 1,
                    Symbol("linear-swap-api/v1/swap_settlement_records") => 1,
                    Symbol("linear-swap-api/v3/swap_liquidation_orders") => 1,
                    Symbol("index/market/history/linear_swap_premium_index_kline") => 1,
                    Symbol("index/market/history/linear_swap_estimated_rate_kline") => 1,
                    Symbol("index/market/history/linear_swap_basis") => 1,
                    Symbol("linear-swap-api/v1/swap_estimated_settlement_price") => 1,
                    Symbol("v5/market/funding_rate") => 0.125,
                    Symbol("v5/market/funding_rate_history") => 0.125,
                    Symbol("v5/market/open_interest") => 0.125,
                    Symbol("v5/market/liquidation_orders") => 0.125,
                    Symbol("v5/market/settlement_history") => 0.125,
                    Symbol("v5/market/elite_account_ratio") => 0.125,
                    Symbol("v5/market/elite_position_ratio") => 0.125,
                    Symbol("v5/market/estimated_settlement_price") => 0.125,
                    Symbol("v5/market/price_limit") => 0.125
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("api/v1/contract_sub_auth_list") => 1,
                    Symbol("api/v1/contract_api_trading_status") => 1,
                    Symbol("swap-api/v1/swap_sub_auth_list") => 1,
                    Symbol("swap-api/v1/swap_api_trading_status") => 1,
                    Symbol("v5/account/asset_mode") => 0.20834,
                    Symbol("v5/account/balance") => 0.20834,
                    Symbol("v5/account/bills") => 0.20834,
                    Symbol("v5/account/fee_deduction_currency") => 0.20834,
                    Symbol("v5/trade/position/opens") => 0.41679,
                    Symbol("v5/trade/order/opens") => 0.41679,
                    Symbol("v5/trade/order/details") => 0.41679,
                    Symbol("v5/trade/order/history") => 0.41679,
                    Symbol("v5/trade/order") => 0.41679,
                    Symbol("v5/position/lever") => 0.20834,
                    Symbol("v5/position/mode") => 0.20834,
                    Symbol("v5/position/risk/limit") => 0.20834,
                    Symbol("v5/position/risk/limit_tier") => 0.20834,
                    Symbol("v5/market/risk/limit") => 0.125,
                    Symbol("v5/market/assets_deduction_currency") => 0.125,
                    Symbol("v5/market/multi_assets_margin") => 0.125,
                    Symbol("v5/algo/order/opens") => 0.41679,
                    Symbol("v5/algo/order") => 0.41679,
                    Symbol("v5/algo/order/history") => 0.41679
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("api/v1/contract_balance_valuation") => 1,
                    Symbol("api/v1/contract_account_info") => 1,
                    Symbol("api/v1/contract_position_info") => 1,
                    Symbol("api/v1/contract_sub_auth") => 1,
                    Symbol("api/v1/contract_sub_account_list") => 1,
                    Symbol("api/v1/contract_sub_account_info_list") => 1,
                    Symbol("api/v1/contract_sub_account_info") => 1,
                    Symbol("api/v1/contract_sub_position_info") => 1,
                    Symbol("api/v1/contract_financial_record") => 1,
                    Symbol("api/v1/contract_financial_record_exact") => 1,
                    Symbol("api/v1/contract_user_settlement_records") => 1,
                    Symbol("api/v1/contract_order_limit") => 1,
                    Symbol("api/v1/contract_fee") => 1,
                    Symbol("api/v1/contract_transfer_limit") => 1,
                    Symbol("api/v1/contract_position_limit") => 1,
                    Symbol("api/v1/contract_account_position_info") => 1,
                    Symbol("api/v1/contract_master_sub_transfer") => 1,
                    Symbol("api/v1/contract_master_sub_transfer_record") => 1,
                    Symbol("api/v1/contract_available_level_rate") => 1,
                    Symbol("api/v3/contract_financial_record") => 1,
                    Symbol("api/v3/contract_financial_record_exact") => 1,
                    Symbol("api/v1/contract-cancel-after") => 1,
                    Symbol("api/v1/contract_order") => 1,
                    Symbol("api/v1/contract_batchorder") => 1,
                    Symbol("api/v1/contract_cancel") => 1,
                    Symbol("api/v1/contract_cancelall") => 1,
                    Symbol("api/v1/contract_switch_lever_rate") => 30,
                    Symbol("api/v1/lightning_close_position") => 1,
                    Symbol("api/v1/contract_order_info") => 1,
                    Symbol("api/v1/contract_order_detail") => 1,
                    Symbol("api/v1/contract_openorders") => 1,
                    Symbol("api/v1/contract_hisorders") => 1,
                    Symbol("api/v1/contract_hisorders_exact") => 1,
                    Symbol("api/v1/contract_matchresults") => 1,
                    Symbol("api/v1/contract_matchresults_exact") => 1,
                    Symbol("api/v3/contract_hisorders") => 1,
                    Symbol("api/v3/contract_hisorders_exact") => 1,
                    Symbol("api/v3/contract_matchresults") => 1,
                    Symbol("api/v3/contract_matchresults_exact") => 1,
                    Symbol("api/v1/contract_trigger_order") => 1,
                    Symbol("api/v1/contract_trigger_cancel") => 1,
                    Symbol("api/v1/contract_trigger_cancelall") => 1,
                    Symbol("api/v1/contract_trigger_openorders") => 1,
                    Symbol("api/v1/contract_trigger_hisorders") => 1,
                    Symbol("api/v1/contract_tpsl_order") => 1,
                    Symbol("api/v1/contract_tpsl_cancel") => 1,
                    Symbol("api/v1/contract_tpsl_cancelall") => 1,
                    Symbol("api/v1/contract_tpsl_openorders") => 1,
                    Symbol("api/v1/contract_tpsl_hisorders") => 1,
                    Symbol("api/v1/contract_relation_tpsl_order") => 1,
                    Symbol("api/v1/contract_track_order") => 1,
                    Symbol("api/v1/contract_track_cancel") => 1,
                    Symbol("api/v1/contract_track_cancelall") => 1,
                    Symbol("api/v1/contract_track_openorders") => 1,
                    Symbol("api/v1/contract_track_hisorders") => 1,
                    Symbol("swap-api/v1/swap_balance_valuation") => 1,
                    Symbol("swap-api/v1/swap_account_info") => 1,
                    Symbol("swap-api/v1/swap_position_info") => 1,
                    Symbol("swap-api/v1/swap_account_position_info") => 1,
                    Symbol("swap-api/v1/swap_sub_auth") => 1,
                    Symbol("swap-api/v1/swap_sub_account_list") => 1,
                    Symbol("swap-api/v1/swap_sub_account_info_list") => 1,
                    Symbol("swap-api/v1/swap_sub_account_info") => 1,
                    Symbol("swap-api/v1/swap_sub_position_info") => 1,
                    Symbol("swap-api/v1/swap_financial_record") => 1,
                    Symbol("swap-api/v1/swap_financial_record_exact") => 1,
                    Symbol("swap-api/v1/swap_user_settlement_records") => 1,
                    Symbol("swap-api/v1/swap_available_level_rate") => 1,
                    Symbol("swap-api/v1/swap_order_limit") => 1,
                    Symbol("swap-api/v1/swap_fee") => 1,
                    Symbol("swap-api/v1/swap_transfer_limit") => 1,
                    Symbol("swap-api/v1/swap_position_limit") => 1,
                    Symbol("swap-api/v1/swap_master_sub_transfer") => 1,
                    Symbol("swap-api/v1/swap_master_sub_transfer_record") => 1,
                    Symbol("swap-api/v3/swap_financial_record") => 1,
                    Symbol("swap-api/v3/swap_financial_record_exact") => 1,
                    Symbol("swap-api/v1/swap-cancel-after") => 1,
                    Symbol("swap-api/v1/swap_order") => 1,
                    Symbol("swap-api/v1/swap_batchorder") => 1,
                    Symbol("swap-api/v1/swap_cancel") => 1,
                    Symbol("swap-api/v1/swap_cancelall") => 1,
                    Symbol("swap-api/v1/swap_lightning_close_position") => 1,
                    Symbol("swap-api/v1/swap_switch_lever_rate") => 30,
                    Symbol("swap-api/v1/swap_order_info") => 1,
                    Symbol("swap-api/v1/swap_order_detail") => 1,
                    Symbol("swap-api/v1/swap_openorders") => 1,
                    Symbol("swap-api/v1/swap_hisorders") => 1,
                    Symbol("swap-api/v1/swap_hisorders_exact") => 1,
                    Symbol("swap-api/v1/swap_matchresults") => 1,
                    Symbol("swap-api/v1/swap_matchresults_exact") => 1,
                    Symbol("swap-api/v3/swap_matchresults") => 1,
                    Symbol("swap-api/v3/swap_matchresults_exact") => 1,
                    Symbol("swap-api/v3/swap_hisorders") => 1,
                    Symbol("swap-api/v3/swap_hisorders_exact") => 1,
                    Symbol("swap-api/v1/swap_trigger_order") => 1,
                    Symbol("swap-api/v1/swap_trigger_cancel") => 1,
                    Symbol("swap-api/v1/swap_trigger_cancelall") => 1,
                    Symbol("swap-api/v1/swap_trigger_openorders") => 1,
                    Symbol("swap-api/v1/swap_trigger_hisorders") => 1,
                    Symbol("swap-api/v1/swap_tpsl_order") => 1,
                    Symbol("swap-api/v1/swap_tpsl_cancel") => 1,
                    Symbol("swap-api/v1/swap_tpsl_cancelall") => 1,
                    Symbol("swap-api/v1/swap_tpsl_openorders") => 1,
                    Symbol("swap-api/v1/swap_tpsl_hisorders") => 1,
                    Symbol("swap-api/v1/swap_relation_tpsl_order") => 1,
                    Symbol("swap-api/v1/swap_track_order") => 1,
                    Symbol("swap-api/v1/swap_track_cancel") => 1,
                    Symbol("swap-api/v1/swap_track_cancelall") => 1,
                    Symbol("swap-api/v1/swap_track_openorders") => 1,
                    Symbol("swap-api/v1/swap_track_hisorders") => 1,
                    Symbol("v5/account/asset_mode") => 100,
                    Symbol("v5/trade/order") => 0.41679,
                    Symbol("v5/trade/batch_orders") => 0.41679,
                    Symbol("v5/trade/cancel_order") => 0.41679,
                    Symbol("v5/trade/cancel_batch_orders") => 0.41679,
                    Symbol("v5/trade/cancel_all_orders") => 0.41679,
                    Symbol("v5/trade/cancel-after") => 0.41679,
                    Symbol("v5/trade/position") => 0.41679,
                    Symbol("v5/trade/position_all") => 0.41679,
                    Symbol("v5/position/lever") => 0.20834,
                    Symbol("v5/position/mode") => 0.20834,
                    Symbol("v5/position/margin") => 0.20834,
                    Symbol("v5/account/fee_deduction_currency") => 0.20834,
                    Symbol("v5/algo/order") => 0.41679,
                    Symbol("v5/algo/cancel_orders") => 0.41679
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("feeSide") => "get",
            Symbol("tierBased") => false,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.002"),
            Symbol("taker") => self.parseNumber("0.002")
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("contract is restricted of closing positions on API.  Please contact customer service") => OnMaintenance,
            Symbol("maintain") => OnMaintenance,
            Symbol("API key has no permission") => PermissionDenied
        ),
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("403") => AuthenticationError,
            Symbol("1010") => AccountNotEnabled,
            Symbol("1003") => AuthenticationError,
            Symbol("1013") => BadSymbol,
            Symbol("1017") => OrderNotFound,
            Symbol("1034") => InvalidOrder,
            Symbol("1036") => InvalidOrder,
            Symbol("1039") => InvalidOrder,
            Symbol("1041") => InvalidOrder,
            Symbol("1047") => InsufficientFunds,
            Symbol("1048") => InsufficientFunds,
            Symbol("1061") => OrderNotFound,
            Symbol("1051") => InvalidOrder,
            Symbol("1066") => BadSymbol,
            Symbol("1067") => InvalidOrder,
            Symbol("1094") => InvalidOrder,
            Symbol("1220") => AccountNotEnabled,
            Symbol("1303") => BadRequest,
            Symbol("1461") => InvalidOrder,
            Symbol("4007") => BadRequest,
            Symbol("bad-request") => BadRequest,
            Symbol("validation-format-error") => BadRequest,
            Symbol("validation-constraints-required") => BadRequest,
            Symbol("base-date-limit-error") => BadRequest,
            Symbol("api-not-support-temp-addr") => PermissionDenied,
            Symbol("timeout") => RequestTimeout,
            Symbol("gateway-internal-error") => ExchangeNotAvailable,
            Symbol("account-frozen-balance-insufficient-error") => InsufficientFunds,
            Symbol("invalid-amount") => InvalidOrder,
            Symbol("order-limitorder-amount-min-error") => InvalidOrder,
            Symbol("order-limitorder-amount-max-error") => InvalidOrder,
            Symbol("order-marketorder-amount-min-error") => InvalidOrder,
            Symbol("order-limitorder-price-min-error") => InvalidOrder,
            Symbol("order-limitorder-price-max-error") => InvalidOrder,
            Symbol("order-limitorder-price-buy-min-error") => InvalidOrder,
            Symbol("order-limitorder-price-buy-max-error") => InvalidOrder,
            Symbol("order-limitorder-price-sell-min-error") => InvalidOrder,
            Symbol("order-limitorder-price-sell-max-error") => InvalidOrder,
            Symbol("order-stop-order-hit-trigger") => InvalidOrder,
            Symbol("order-value-min-error") => InvalidOrder,
            Symbol("order-invalid-price") => InvalidOrder,
            Symbol("order-holding-limit-failed") => InvalidOrder,
            Symbol("order-orderprice-precision-error") => InvalidOrder,
            Symbol("order-etp-nav-price-max-error") => InvalidOrder,
            Symbol("order-orderstate-error") => OrderNotFound,
            Symbol("order-queryorder-invalid") => OrderNotFound,
            Symbol("order-update-error") => ExchangeNotAvailable,
            Symbol("api-signature-check-failed") => AuthenticationError,
            Symbol("api-signature-not-valid") => AuthenticationError,
            Symbol("base-record-invalid") => OrderNotFound,
            Symbol("base-symbol-trade-disabled") => BadSymbol,
            Symbol("base-symbol-error") => BadSymbol,
            Symbol("system-maintenance") => OnMaintenance,
            Symbol("base-request-exceed-frequency-limit") => RateLimitExceeded,
            Symbol("rate-too-many-requests") => RateLimitExceeded,
            Symbol("invalid symbol") => BadSymbol,
            Symbol("symbol trade not open now") => BadSymbol,
            Symbol("require-symbol") => BadSymbol,
            Symbol("invalid-address") => BadRequest,
            Symbol("base-currency-chain-error") => BadRequest,
            Symbol("dw-insufficient-balance") => InsufficientFunds,
            Symbol("base-withdraw-fee-error") => BadRequest,
            Symbol("dw-withdraw-min-limit") => BadRequest,
            Symbol("request limit") => RateLimitExceeded
        )
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("include_OS_certificates") => false,
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => Dict{Symbol, Any}(
                Symbol("spot") => true,
                Symbol("linear") => true,
                Symbol("inverse") => true
            )
        ),
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("fetchOHLCV") => Dict{Symbol, Any}(
            Symbol("useHistoricalEndpointForSpot") => true
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("includeFee") => false
        ),
        Symbol("defaultType") => "spot",
        Symbol("defaultSubType") => "linear",
        Symbol("defaultNetwork") => "ERC20",
        Symbol("defaultNetworks") => Dict{Symbol, Any}(
            Symbol("ETH") => "ERC20",
            Symbol("BTC") => "BTC",
            Symbol("USDT") => "TRC20"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("TRC20") => "TRX",
            Symbol("BTC") => "BTC",
            Symbol("ERC20") => "ETH",
            Symbol("SOL") => "SOLANA",
            Symbol("HRC20") => "HECO",
            Symbol("BEP20") => "BSC",
            Symbol("XMR") => "XMR",
            Symbol("LTC") => "LTC",
            Symbol("XRP") => "XRP",
            Symbol("XLM") => "XLM",
            Symbol("CRONOS") => "CRO",
            Symbol("CRO") => "CRO",
            Symbol("GLMR") => "GLMR",
            Symbol("POLYGON") => "MATIC",
            Symbol("MATIC") => "MATIC",
            Symbol("BTT") => "BTT",
            Symbol("CUBE") => "CUBE",
            Symbol("IOST") => "IOST",
            Symbol("NEO") => "NEO",
            Symbol("KLAY") => "KLAY",
            Symbol("EOS") => "EOS",
            Symbol("THETA") => "THETA",
            Symbol("NAS") => "NAS",
            Symbol("NULS") => "NULS",
            Symbol("QTUM") => "QTUM",
            Symbol("FTM") => "FTM",
            Symbol("CELO") => "CELO",
            Symbol("DOGE") => "DOGE",
            Symbol("DOGECHAIN") => "DOGECHAIN",
            Symbol("NEAR") => "NEAR",
            Symbol("STEP") => "STEP",
            Symbol("BITCI") => "BITCI",
            Symbol("CARDANO") => "ADA",
            Symbol("ADA") => "ADA",
            Symbol("ETC") => "ETC",
            Symbol("LUK") => "LUK",
            Symbol("MINEPLEX") => "MINEPLEX",
            Symbol("DASH") => "DASH",
            Symbol("ZEC") => "ZEC",
            Symbol("IOTA") => "IOTA",
            Symbol("NEON3") => "NEON3",
            Symbol("XEM") => "XEM",
            Symbol("HC") => "HC",
            Symbol("LSK") => "LSK",
            Symbol("DCR") => "DCR",
            Symbol("BTG") => "BTG",
            Symbol("STEEM") => "STEEM",
            Symbol("BTS") => "BTS",
            Symbol("ICX") => "ICX",
            Symbol("WAVES") => "WAVES",
            Symbol("CMT") => "CMT",
            Symbol("BTM") => "BTM",
            Symbol("VET") => "VET",
            Symbol("XZC") => "XZC",
            Symbol("ACT") => "ACT",
            Symbol("SMT") => "SMT",
            Symbol("BCD") => "BCD",
            Symbol("WAX") => "WAX1",
            Symbol("WICC") => "WICC",
            Symbol("ELF") => "ELF",
            Symbol("ZIL") => "ZIL",
            Symbol("ELA") => "ELA",
            Symbol("BCX") => "BCX",
            Symbol("SBTC") => "SBTC",
            Symbol("BIFI") => "BIFI",
            Symbol("CTXC") => "CTXC",
            Symbol("WAN") => "WAN",
            Symbol("POLYX") => "POLYX",
            Symbol("PAI") => "PAI",
            Symbol("WTC") => "WTC",
            Symbol("DGB") => "DGB",
            Symbol("XVG") => "XVG",
            Symbol("AAC") => "AAC",
            Symbol("AE") => "AE",
            Symbol("SEELE") => "SEELE",
            Symbol("BCV") => "BCV",
            Symbol("GRS") => "GRS",
            Symbol("ARDR") => "ARDR",
            Symbol("NANO") => "NANO",
            Symbol("ZEN") => "ZEN",
            Symbol("RBTC") => "RBTC",
            Symbol("BSV") => "BSV",
            Symbol("GAS") => "GAS",
            Symbol("XTZ") => "XTZ",
            Symbol("LAMB") => "LAMB",
            Symbol("CVNT1") => "CVNT1",
            Symbol("DOCK") => "DOCK",
            Symbol("SC") => "SC",
            Symbol("KMD") => "KMD",
            Symbol("ETN") => "ETN",
            Symbol("TOP") => "TOP",
            Symbol("IRIS") => "IRIS",
            Symbol("UGAS") => "UGAS",
            Symbol("TT") => "TT",
            Symbol("NEWTON") => "NEWTON",
            Symbol("VSYS") => "VSYS",
            Symbol("FSN") => "FSN",
            Symbol("BHD") => "BHD",
            Symbol("ONE") => "ONE",
            Symbol("EM") => "EM",
            Symbol("CKB") => "CKB",
            Symbol("EOSS") => "EOSS",
            Symbol("HIVE") => "HIVE",
            Symbol("RVN") => "RVN",
            Symbol("DOT") => "DOT",
            Symbol("KSM") => "KSM",
            Symbol("BAND") => "BAND",
            Symbol("OEP4") => "OEP4",
            Symbol("NBS") => "NBS",
            Symbol("FIS") => "FIS",
            Symbol("AR") => "AR",
            Symbol("HBAR") => "HBAR",
            Symbol("FIL") => "FIL",
            Symbol("MASS") => "MASS",
            Symbol("KAVA") => "KAVA",
            Symbol("XYM") => "XYM",
            Symbol("ENJ") => "ENJ",
            Symbol("CRUST") => "CRUST",
            Symbol("ICP") => "ICP",
            Symbol("CSPR") => "CSPR",
            Symbol("FLOW") => "FLOW",
            Symbol("IOTX") => "IOTX",
            Symbol("LAT") => "LAT",
            Symbol("APT") => "APT",
            Symbol("XCH") => "XCH",
            Symbol("MINA") => "MINA",
            Symbol("XEC") => "ECASH",
            Symbol("XPRT") => "XPRT",
            Symbol("CCA") => "ACA",
            Symbol("AOTI") => "COTI",
            Symbol("AKT") => "AKT",
            Symbol("ARS") => "ARS",
            Symbol("ASTR") => "ASTR",
            Symbol("AZERO") => "AZERO",
            Symbol("BLD") => "BLD",
            Symbol("BRISE") => "BRISE",
            Symbol("CORE") => "CORE",
            Symbol("DESO") => "DESO",
            Symbol("DFI") => "DFI",
            Symbol("EGLD") => "EGLD",
            Symbol("ERG") => "ERG",
            Symbol("ETHF") => "ETHFAIR",
            Symbol("ETHW") => "ETHW",
            Symbol("EVMOS") => "EVMOS",
            Symbol("FIO") => "FIO",
            Symbol("FLR") => "FLR",
            Symbol("FINSCHIA") => "FINSCHIA",
            Symbol("KMA") => "KMA",
            Symbol("KYVE") => "KYVE",
            Symbol("MEV") => "MEV",
            Symbol("MOVR") => "MOVR",
            Symbol("NODL") => "NODL",
            Symbol("OAS") => "OAS",
            Symbol("OSMO") => "OSMO",
            Symbol("PAYCOIN") => "PAYCOIN",
            Symbol("POKT") => "POKT",
            Symbol("PYG") => "PYG",
            Symbol("REI") => "REI",
            Symbol("SCRT") => "SCRT",
            Symbol("SDN") => "SDN",
            Symbol("SEI") => "SEI",
            Symbol("SGB") => "SGB",
            Symbol("SUI") => "SUI",
            Symbol("SXP") => "SOLAR",
            Symbol("SYS") => "SYS",
            Symbol("TENET") => "TENET",
            Symbol("TON") => "TON",
            Symbol("UNQ") => "UNQ",
            Symbol("UYU") => "UYU",
            Symbol("WEMIX") => "WEMIX",
            Symbol("XDC") => "XDC",
            Symbol("XPLA") => "XPLA"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("MATIC") => "MATIC"
        ),
        Symbol("fetchOrdersByStatesMethod") => "spot_private_get_v1_order_orders",
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("language") => "en-US",
        Symbol("broker") => Dict{Symbol, Any}(
            Symbol("id") => "AA03022abc"
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "pro",
            Symbol("funding") => "pro",
            Symbol("future") => "futures"
        ),
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("spot") => "spot",
            Symbol("margin") => "margin",
            Symbol("otc") => "otc",
            Symbol("point") => "point",
            Symbol("super-margin") => "super-margin",
            Symbol("investment") => "investment",
            Symbol("borrow") => "borrow",
            Symbol("grid-trading") => "grid-trading",
            Symbol("deposit-earning") => "deposit-earning",
            Symbol("otc-options") => "otc-options",
            Symbol("linear-swap") => "swap",
            Symbol("swap") => "swap",
            Symbol("futures") => "future"
        ),
        Symbol("typesByAccount") => Dict{Symbol, Any}(
            Symbol("pro") => "spot",
            Symbol("futures") => "future"
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("stopOrderTypes") => Dict{Symbol, Any}(
                Symbol("stop-limit") => true,
                Symbol("buy-stop-limit") => true,
                Symbol("sell-stop-limit") => true,
                Symbol("stop-limit-fok") => true,
                Symbol("buy-stop-limit-fok") => true,
                Symbol("sell-stop-limit-fok") => true
            ),
            Symbol("limitOrderTypes") => Dict{Symbol, Any}(
                Symbol("limit") => true,
                Symbol("buy-limit") => true,
                Symbol("sell-limit") => true,
                Symbol("ioc") => true,
                Symbol("buy-ioc") => true,
                Symbol("sell-ioc") => true,
                Symbol("limit-maker") => true,
                Symbol("buy-limit-maker") => true,
                Symbol("sell-limit-maker") => true,
                Symbol("stop-limit") => true,
                Symbol("buy-stop-limit") => true,
                Symbol("sell-stop-limit") => true,
                Symbol("limit-fok") => true,
                Symbol("buy-limit-fok") => true,
                Symbol("sell-limit-fok") => true,
                Symbol("stop-limit-fok") => true,
                Symbol("buy-stop-limit-fok") => true,
                Symbol("sell-stop-limit-fok") => true
            )
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("NGL") => "GFNGL",
        Symbol("GET") => "THEMIS",
        Symbol("GTC") => "GAMECOM",
        Symbol("HIT") => "HITCHAIN",
        Symbol("PNT") => "PENTA",
        Symbol("SBTC") => "SUPERBITCOIN",
        Symbol("SOUL") => "SOULSAVER",
        Symbol("BIFI") => "BITCOINFILE",
        Symbol("FUD") => "FTX Users Debt"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => true,
                Symbol("triggerDirection") => true,
                Symbol("triggerPriceType") => nothing,
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
                Symbol("iceberg") => false,
                Symbol("selfTradePrevention") => true,
                Symbol("leverage") => true,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 10
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => 120,
                Symbol("untilDays") => 2,
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
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("limit") => 500,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("limit") => 500,
                Symbol("untilDays") => 2,
                Symbol("daysBack") => 180,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("untilDays") => 2,
                Symbol("limit") => 500,
                Symbol("daysBack") => 180,
                Symbol("daysBackCanceled") => 1 / 12,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "spot",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
                Symbol("trailing") => true,
                Symbol("hedged") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 25
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("limit") => 50
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("limit") => 50,
                Symbol("daysBack") => 90
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("trigger") => true,
                Symbol("trailing") => true,
                Symbol("untilDays") => 2,
                Symbol("limit") => 50,
                Symbol("daysBack") => 90,
                Symbol("daysBackCanceled") => 1 / 12
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 2000
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
    Symbol("rollingWindowSize") => 2000
))

end
function fetchStatus(self::Htx, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchStatus", nothing, params);
    enabledForContracts = self.handleOption("fetchStatus", "enableForContracts", false);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(marketType != "spot", enabledForContracts))
        subType = safeString(params, "subType", get(self.options, Symbol("defaultSubType"), nothing));
        if functions.ccxtruthy(marketType == "swap")
            if functions.ccxtruthy(subType == "linear")
                response = Base.fetch(self.statusPublicSwapLinearGetApiV2SummaryJson());
            elseif functions.ccxtruthy(subType == "inverse")
                response = Base.fetch(self.statusPublicSwapInverseGetApiV2SummaryJson());
            end
        elseif functions.ccxtruthy(marketType == "future")
            if functions.ccxtruthy(subType == "linear")
                response = Base.fetch(self.statusPublicFutureLinearGetApiV2SummaryJson());
            elseif functions.ccxtruthy(subType == "inverse")
                response = Base.fetch(self.statusPublicFutureInverseGetApiV2SummaryJson());
            end
        else
            if functions.ccxtruthy(marketType == "contract")
                response = Base.fetch(self.contractPublicGetHeartbeat());
            end

        end
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.statusPublicSpotGetApiV2SummaryJson());
    end
    status = nothing;
    updated = nothing;
    url = nothing;
    if functions.ccxtruthy(marketType == "contract")
        statusRaw = safeString(response, "status");
        if functions.ccxtruthy(statusRaw == nothing)
            status = nothing;
        else
            status = functions.ccxtruthy((statusRaw == "ok")) ? "ok" : "maintenance";
        end
        updated = safeString(response, "ts");
    else
        statusData = safeValue(response, "status", Dict{Symbol, Any}());
        statusRaw = safeString(statusData, "indicator");
        status = functions.ccxtruthy((statusRaw == "none")) ? "ok" : "maintenance";
        pageData = safeValue(response, "page", Dict{Symbol, Any}());
        datetime = safeString(pageData, "updated_at");
        updated = self.parse8601(datetime);
        url = safeString(pageData, "url");
    end
    return Dict{Symbol, Any}(
    Symbol("status") => status,
    Symbol("updated") => updated,
    Symbol("eta") => nothing,
    Symbol("url") => url,
    Symbol("info") => response
)

end
function fetchTime(self::Htx, params=Dict())
    options = safeValue(self.options, "fetchTime", Dict{Symbol, Any}());
    defaultType = safeString(self.options, "defaultType", "spot");
    type_var = safeString(options, "type", defaultType);
    type_var = safeString(params, "type", type_var);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((type_var == "future"), (type_var == "swap")))
        response = Base.fetch(self.contractPublicGetApiV1Timestamp(params));
    else
        response = Base.fetch(self.spotPublicGetV1CommonTimestamp(params));
    end
    return safeInteger2(response, "data", "ts")

end
function parseTradingFee(self::Htx, fee, market=nothing)
    marketId = safeString(fee, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("maker") => self.safeNumber(fee, "actualMakerRate"),
    Symbol("taker") => self.safeNumber(fee, "actualTakerRate"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchTradingFee(self::Htx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbols") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.spotPrivateGetV2ReferenceTransactFeeRate(extend(request, params)));
    data = safeValue(response, "data", []);
    first_var = safeValue(data, 0, Dict{Symbol, Any}());
    return self.parseTradingFee(first_var, market)

end
function fetchTradingLimits(self::Htx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbols == nothing)
        symbols = self.symbols;
    end
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        result[Symbol(symbol)] = Base.fetch(self.fetchTradingLimitsById(self.marketId(symbol), params));
        i += 1
    end
    return result

end
function fetchTradingLimitsById(self::Htx, id, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("symbol") => id
    );
    response = Base.fetch(self.spotPublicGetV1CommonExchange(extend(request, params)));
    return self.parseTradingLimits(safeValue(response, "data", Dict{Symbol, Any}()))

end
function parseTradingLimits(self::Htx, limits, symbol=nothing, params=Dict())
    return Dict{Symbol, Any}(
    Symbol("info") => limits,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(limits, "limit-order-must-greater-than"),
            Symbol("max") => self.safeNumber(limits, "limit-order-must-less-than")
        )
    )
)

end
function costToPrecision(self::Htx, symbol, cost)
    return decimalToPrecision(cost, TRUNCATE, get(get(get(self.markets, Symbol(symbol), nothing), Symbol("precision"), nothing), Symbol("cost"), nothing), self.precisionMode)

end
function fetchMarkets(self::Htx, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    types = nothing;
    (types, params) = self.handleOptionAndParams(params, "fetchMarkets", "types", Dict{Symbol, Any}());
    allMarkets = [];
    promises = [];
    keys_var = objectKeys(types);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        if functions.ccxtruthy(self.safeBool(types, key))
            if functions.ccxtruthy(key == "spot")
                                push!(promises, self.fetchMarketsByTypeAndSubType("spot", nothing, params));
            elseif functions.ccxtruthy(key == "linear")
                push!(promises, self.fetchMarketsByTypeAndSubType(nothing, "linear", params));
            else
                if functions.ccxtruthy(key == "inverse")
                                        push!(promises, self.fetchMarketsByTypeAndSubType("swap", "inverse", params));
                                        push!(promises, self.fetchMarketsByTypeAndSubType("future", "inverse", params));
                end

            end
        end
        i += 1
    end
    promises = Base.fetch(asyncmap(Base.fetch, promises));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(promises)))
        allMarkets = arrayConcat(allMarkets, get(promises, i + 1, nothing));
        i += 1
    end
    return allMarkets

end
function fetchMarketsByTypeAndSubType(self::Htx, type_var, subType, params=Dict())
    isSpot = (type_var == "spot");
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(!functions.ccxtruthy(isSpot))
        if functions.ccxtruthy(subType == "linear")
            request[Symbol("business_type")] = "all";
            response = Base.fetch(self.contractPublicGetLinearSwapApiV1SwapContractInfo(extend(request, params)));
        elseif functions.ccxtruthy(subType == "inverse")
            if functions.ccxtruthy(type_var == "future")
                response = Base.fetch(self.contractPublicGetApiV1ContractContractInfo(extend(request, params)));
            elseif functions.ccxtruthy(type_var == "swap")
                response = Base.fetch(self.contractPublicGetSwapApiV1SwapContractInfo(extend(request, params)));
            end
        end
    else
        response = Base.fetch(self.spotPublicGetV1CommonSymbols(extend(request, params)));
    end
    markets = self.safeList(response, "data", []);
    numMarkets = length(markets);
    if functions.ccxtruthy(functions.ccxt_lt(numMarkets, 1))
        throw(OperationFailed(string(self.id, " fetchMarkets() returned an empty response: ", json(response))));
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        market = get(markets, i + 1, nothing);
        baseId = nothing;
        quoteId = nothing;
        settleId = nothing;
        id = nothing;
        lowercaseId = nothing;
        contract = (ccxt_in("contract_code", market));
        spot = !functions.ccxtruthy(contract);
        swap = false;
        future = false;
        linear = nothing;
        inverse = nothing;
        if functions.ccxtruthy(contract)
            id = safeString(market, "contract_code");
            lowercaseId = lowercase(id);
            delivery_date = safeString(market, "delivery_date");
            business_type = safeString(market, "business_type");
            future = delivery_date != nothing;
            swap = !functions.ccxtruthy(future);
            linear = business_type != nothing;
            inverse = !functions.ccxtruthy(linear);
            if functions.ccxtruthy(swap)
                type_var = "swap";
                parts = split(id, "-");
                baseId = safeStringLower(market, "symbol");
                quoteId = safeStringLower(parts, 1);
                settleId = functions.ccxtruthy(inverse) ? baseId : quoteId;
            elseif functions.ccxtruthy(future)
                type_var = "future";
                baseId = safeStringLower(market, "symbol");
                if functions.ccxtruthy(inverse)
                    quoteId = "USD";
                    settleId = baseId;
                else
                    pair = safeString(market, "pair");
                    parts = split(pair, "-");
                    quoteId = safeStringLower(parts, 1);
                    settleId = quoteId;
                end
            end
        else
            type_var = "spot";
            baseId = safeString(market, "base-currency");
            quoteId = safeString(market, "quote-currency");
            id = string(baseId, quoteId);
            lowercaseId = lowercase(id);
        end
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var);
        expiry = nothing;
        if functions.ccxtruthy(contract)
            if functions.ccxtruthy(inverse)
                symbol += string(":", base);
            elseif functions.ccxtruthy(linear)
                symbol += string(":", quote_var);
            end
            if functions.ccxtruthy(future)
                expiry = safeInteger(market, "delivery_time");
                symbol += string("-", self.yymmdd(expiry));
            end
        end
        contractSize = self.safeNumber(market, "contract_size");
        minCost = self.safeNumber(market, "min-order-value");
        maxAmount = self.safeNumber(market, "max-order-amt");
        minAmount = self.safeNumber(market, "min-order-amt");
        if functions.ccxtruthy(contract)
            if functions.ccxtruthy(linear)
                minAmount = contractSize;
            elseif functions.ccxtruthy(inverse)
                minCost = contractSize;
            end
        end
        pricePrecision = nothing;
        amountPrecision = nothing;
        costPrecision = nothing;
        maker = nothing;
        taker = nothing;
        active = nothing;
        if functions.ccxtruthy(spot)
            pricePrecision = self.parseNumber(self.parsePrecision(safeString(market, "price-precision")));
            amountPrecision = self.parseNumber(self.parsePrecision(safeString(market, "amount-precision")));
            costPrecision = self.parseNumber(self.parsePrecision(safeString(market, "value-precision")));
            maker = self.parseNumber("0.002");
            taker = self.parseNumber("0.002");
            state = safeString(market, "state");
            active = (state == "online");
        else
            pricePrecision = self.safeNumber(market, "price_tick");
            amountPrecision = self.parseNumber("1");
            maker = self.parseNumber("0.0002");
            taker = self.parseNumber("0.0005");
            contractStatus = safeInteger(market, "contract_status");
            active = (contractStatus == 1);
        end
        leverageRatio = safeString(market, "leverage-ratio", "1");
        superLeverageRatio = safeString(market, "super-margin-leverage-ratio", "1");
        hasLeverage = @functions.ccxt_or(stringGt(leverageRatio, "1"), stringGt(superLeverageRatio, "1"));
        created = nothing;
        createdDate = safeString(market, "create_date");
        if functions.ccxtruthy(createdDate != nothing)
            createdArray = self.stringToCharsArray(createdDate);
            createdDate = string(get(createdArray, 1, nothing), get(createdArray, 2, nothing), get(createdArray, 3, nothing), get(createdArray, 4, nothing), "-", get(createdArray, 5, nothing), get(createdArray, 6, nothing), "-", get(createdArray, 7, nothing), get(createdArray, 8, nothing), " 00:00:00");
            created = self.parse8601(createdDate);
        end
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("lowercaseId") => lowercaseId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => (@functions.ccxt_and(spot, hasLeverage)),
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => taker,
    Symbol("maker") => maker,
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => amountPrecision,
        Symbol("price") => pricePrecision,
        Symbol("cost") => costPrecision
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.parseNumber(leverageRatio),
            Symbol("superMax") => self.parseNumber(superLeverageRatio)
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minAmount,
            Symbol("max") => maxAmount
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
    Symbol("created") => created,
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function tryGetSymbolFromFutureMarkets(self::Htx, symbolOrMarketId)
    if functions.ccxtruthy(ccxt_in(symbolOrMarketId, self.markets))
            return symbolOrMarketId
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("futureMarketIdsForSymbols", self.options))))
        self.options[Symbol("futureMarketIdsForSymbols")] = Dict{Symbol, Any}();
    end
    futureMarketIdsForSymbols = self.safeDict(self.options, "futureMarketIdsForSymbols", Dict{Symbol, Any}());
    if functions.ccxtruthy(ccxt_in(symbolOrMarketId, futureMarketIdsForSymbols))
            return get(futureMarketIdsForSymbols, Symbol(symbolOrMarketId), nothing)
    end
    futureMarkets = filterBy(self.markets, "future", true);
    futuresCharsMaps = Dict{Symbol, Any}(
        Symbol("this_week") => "CW",
        Symbol("next_week") => "NW",
        Symbol("quarter") => "CQ",
        Symbol("next_quarter") => "NQ"
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(futureMarkets)))
        market = get(futureMarkets, i + 1, nothing);
        info = safeValue(market, "info", Dict{Symbol, Any}());
        contractType = safeString(info, "contract_type");
        contractSuffix = get(futuresCharsMaps, Symbol(contractType), nothing);
        constructedId = functions.ccxtruthy(get(market, Symbol("linear"), nothing)) ? string(get(market, Symbol("base"), nothing), "-", get(market, Symbol("quote"), nothing), "-", contractSuffix) : string(get(market, Symbol("base"), nothing), "_", contractSuffix);
        if functions.ccxtruthy(constructedId == symbolOrMarketId)
            symbol = get(market, Symbol("symbol"), nothing);
            self.options[Symbol("futureMarketIdsForSymbols")][Symbol(symbolOrMarketId)] = symbol;
                return symbol
        end
        i += 1
    end
    self.options[Symbol("futureMarketIdsForSymbols")][Symbol(symbolOrMarketId)] = symbolOrMarketId;
    return symbolOrMarketId

end
function parseTicker(self::Htx, ticker, market=nothing)
    marketId = safeString2(ticker, "symbol", "contract_code");
    symbol = self.safeSymbol(marketId, market);
    symbol = self.tryGetSymbolFromFutureMarkets(symbol);
    timestamp = safeInteger2(ticker, "ts", "quoteTime");
    bid = nothing;
    bidVolume = nothing;
    ask = nothing;
    askVolume = nothing;
    if functions.ccxtruthy(ccxt_in("bid", ticker))
        if functions.ccxtruthy(@functions.ccxt_and(get(ticker, Symbol("bid"), nothing) != nothing, functions.ccxt_isArray(get(ticker, Symbol("bid"), nothing))))
            bid = safeString(get(ticker, Symbol("bid"), nothing), 0);
            bidVolume = safeString(get(ticker, Symbol("bid"), nothing), 1);
        else
            bid = safeString(ticker, "bid");
            bidVolume = safeString(ticker, "bidSize");
        end
    end
    if functions.ccxtruthy(ccxt_in("ask", ticker))
        if functions.ccxtruthy(@functions.ccxt_and(get(ticker, Symbol("ask"), nothing) != nothing, functions.ccxt_isArray(get(ticker, Symbol("ask"), nothing))))
            ask = safeString(get(ticker, Symbol("ask"), nothing), 0);
            askVolume = safeString(get(ticker, Symbol("ask"), nothing), 1);
        else
            ask = safeString(ticker, "ask");
            askVolume = safeString(ticker, "askSize");
        end
    end
    open = safeString(ticker, "open");
    close = safeString(ticker, "close");
    baseVolume = safeString(ticker, "amount");
    quoteVolume = safeString(ticker, "vol");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => bid,
    Symbol("bidVolume") => bidVolume,
    Symbol("ask") => ask,
    Symbol("askVolume") => askVolume,
    Symbol("vwap") => nothing,
    Symbol("open") => open,
    Symbol("close") => close,
    Symbol("last") => close,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("info") => ticker
), market)

end
function fetchTicker(self::Htx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.contractPublicGetLinearSwapExMarketDetailMerged(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        if functions.ccxtruthy(get(market, Symbol("future"), nothing))
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
            response = Base.fetch(self.contractPublicGetMarketDetailMerged(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
            response = Base.fetch(self.contractPublicGetSwapExMarketDetailMerged(extend(request, params)));
        end
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.spotPublicGetMarketDetailMerged(extend(request, params)));
    end
    tick = safeValue(response, "tick", Dict{Symbol, Any}());
    ticker = self.parseTicker(tick, market);
    timestamp = safeInteger(response, "ts");
    ticker[Symbol("timestamp")] = timestamp;
    ticker[Symbol("datetime")] = self.iso8601(timestamp);
    return ticker

end
function fetchTickers(self::Htx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    first_var = safeString(symbols, 0);
    market = nothing;
    if functions.ccxtruthy(first_var != nothing)
        market = self.market(first_var);
    end
    isSubTypeRequested = @functions.ccxt_or((ccxt_in("subType", params)), (ccxt_in("business_type", params)));
    type_var = nothing;
    subType = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    (subType, params) = self.handleSubTypeAndParams("fetchTickers", market, params);
    request = Dict{Symbol, Any}();
    isSpot = (type_var == "spot");
    future = (type_var == "future");
    swap = (type_var == "swap");
    linear = (subType == "linear");
    inverse = (subType == "inverse");
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(isSpot), isSubTypeRequested))
        if functions.ccxtruthy(linear)
            if functions.ccxtruthy(future)
                request[Symbol("business_type")] = "futures";
            elseif functions.ccxtruthy(swap)
                request[Symbol("business_type")] = "swap";
            else
                request[Symbol("business_type")] = "all";
            end
            response = Base.fetch(self.contractPublicGetLinearSwapExMarketDetailBatchMerged(extend(request, params)));
        elseif functions.ccxtruthy(inverse)
            if functions.ccxtruthy(future)
                response = Base.fetch(self.contractPublicGetMarketDetailBatchMerged(extend(request, params)));
            elseif functions.ccxtruthy(swap)
                response = Base.fetch(self.contractPublicGetSwapExMarketDetailBatchMerged(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchTickers() you have to set params[\"type\"] to either \"swap\" or \"future\" for inverse contracts")));
            end
        else
            throw(NotSupported(string(self.id, " fetchTickers() you have to set params[\"subType\"] to either \"linear\" or \"inverse\" for contracts")));
        end
    else
        response = Base.fetch(self.spotPublicGetMarketTickers(extend(request, params)));
    end
    rawTickers = self.safeList2(response, "data", "ticks", []);
    tickers = self.parseTickers(rawTickers, symbols, params);
    return self.filterByArrayTickers(tickers, "symbol", symbols)

end
function fetchLastPrices(self::Htx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    market = self.getMarketFromSymbols(symbols);
    type_var = nothing;
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchLastPrices", market, params);
    (type_var, params) = self.handleMarketTypeAndParams("fetchLastPrices", market, params);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or((type_var == "swap"), (type_var == "future"))), (subType == "linear")))
        response = Base.fetch(self.contractPublicGetLinearSwapExMarketTrade(params));
    elseif functions.ccxtruthy(@functions.ccxt_and((type_var == "swap"), (subType == "inverse")))
        response = Base.fetch(self.contractPublicGetSwapExMarketTrade(params));
    else
        if functions.ccxtruthy(@functions.ccxt_and((type_var == "future"), (subType == "inverse")))
            response = Base.fetch(self.contractPublicGetMarketTrade(params));
        else
            throw(NotSupported(string(self.id, " fetchLastPrices() does not support ", type_var, " markets yet")));
        end

    end
    tick = safeValue(response, "tick", Dict{Symbol, Any}());
    data = self.safeList(tick, "data", []);
    return self.parseLastPrices(data, symbols)

end
function parseLastPrice(self::Htx, entry, market=nothing)
    marketId = safeString2(entry, "symbol", "contract_code");
    market = self.safeMarket(marketId, market);
    price = self.safeNumber(entry, "price");
    direction = safeString(entry, "direction");
    return Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("price") => price,
    Symbol("side") => direction,
    Symbol("info") => entry
)

end
function fetchOrderBook(self::Htx, symbol, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("type") => "step0"
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.contractPublicGetLinearSwapExMarketDepth(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        if functions.ccxtruthy(get(market, Symbol("future"), nothing))
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
            response = Base.fetch(self.contractPublicGetMarketDepth(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
            response = Base.fetch(self.contractPublicGetSwapExMarketDepth(extend(request, params)));
        end
    else
        if functions.ccxtruthy(limit != nothing)
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((limit != 5), (limit != 10)), (limit != 20)), (limit != 150)))
                throw(BadRequest(string(self.id, " fetchOrderBook() limit argument must be undefined, 5, 10, 20, or 150, default is 150")));
            end
            if functions.ccxtruthy(limit != 150)
                request[Symbol("depth")] = limit;
            end
        end
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.spotPublicGetMarketDepth(extend(request, params)));
    end
    if functions.ccxtruthy(ccxt_in("tick", response))
        if functions.ccxtruthy(!functions.ccxtruthy(get(response, Symbol("tick"), nothing)))
            throw(BadSymbol(string(self.id, " fetchOrderBook() returned empty response: ", json(response))));
        end
        tick = safeValue(response, "tick");
        timestamp = safeInteger(tick, "ts", safeInteger(response, "ts"));
        result = self.parseOrderBook(tick, symbol, timestamp);
        result[Symbol("nonce")] = safeInteger(tick, "version");
            return result
    end
    throw(ExchangeError(string(self.id, " fetchOrderBook() returned unrecognized response: ", json(response))));

end
function parseTrade(self::Htx, trade, market=nothing)
    marketId = safeString2(trade, "contract_code", "symbol");
    market = self.safeMarket(marketId, market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeIntegerN(trade, ["ts", "created-at", "created_at", "create_date", "created_time"]);
    order = safeString2(trade, "order-id", "order_id");
    side = safeString2(trade, "direction", "side");
    type_var = safeString(trade, "type");
    if functions.ccxtruthy(@functions.ccxt_and((type_var != nothing), (findfirst("-", type_var) !== nothing)))
        typeParts = split(type_var, "-");
        side = get(typeParts, 1, nothing);
        type_var = get(typeParts, 2, nothing);
    end
    takerOrMaker = safeStringLower(trade, "role");
    priceString = safeString2(trade, "price", "trade_price");
    amountString = safeString2(trade, "filled-amount", "amount");
    amountString = safeString(trade, "trade_volume", amountString);
    costString = safeString(trade, "trade_turnover");
    fee = nothing;
    feeCost = safeString(trade, "filled-fees");
    if functions.ccxtruthy(feeCost == nothing)
        feeCost = stringNeg(safeString(trade, "trade_fee"));
    end
    feeCurrencyId = safeStringN(trade, ["fee-currency", "fee_asset", "fee_currency"]);
    feeCurrency = self.safeCurrencyCode(feeCurrencyId);
    filledPoints = safeString(trade, "filled-points");
    if functions.ccxtruthy(filledPoints != nothing)
        if functions.ccxtruthy(@functions.ccxt_or((feeCost == nothing), stringEquals(feeCost, "0")))
            feeDeductCurrency = safeString(trade, "fee-deduct-currency");
            if functions.ccxtruthy(feeDeductCurrency != nothing)
                feeCost = filledPoints;
                feeCurrency = self.safeCurrencyCode(feeDeductCurrency);
            end
        end
    end
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrency
        );
    end
    id = nothing;
    safeId = safeString(trade, "id");
    if functions.ccxtruthy(@functions.ccxt_and(safeId != nothing, findfirst("-", safeId) !== nothing))
        id = safeId;
    else
        id = safeStringN(trade, ["trade_id", "trade-id", "id"]);
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("info") => trade,
    Symbol("order") => order,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market)

end
function fetchOrderTrades(self::Htx, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrderTrades", market, params);
    if functions.ccxtruthy(marketType != "spot")
        throw(NotSupported(string(self.id, " fetchOrderTrades() is only supported for spot markets")));
    end
    return Base.fetch(self.fetchSpotOrderTrades(id, symbol, since, limit, params))

end
function fetchSpotOrderTrades(self::Htx, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("order-id") => id
    );
    response = Base.fetch(self.spotPrivateGetV1OrderOrdersOrderIdMatchresults(extend(request, params)));
    return self.parseTrades(get(response, Symbol("data"), nothing), nothing, since, limit)

end
function fetchMyTrades(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol, since, limit, params))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchMyTrades", market, params);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol != nothing)
            market = self.market(symbol);
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("size")] = limit;
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start-time")] = since;
        end
        (request, params) = self.handleUntilOption("end-time", request, params);
        response = Base.fetch(self.spotPrivateGetV1OrderMatchresults(extend(request, params)));
    else
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_time")] = since;
        end
        (request, params) = self.handleUntilOption("end_time", request, params);
        if functions.ccxtruthy(self.safeBool(market, "linear"))
            request[Symbol("contract_code")] = safeString(market, "id");
            if functions.ccxtruthy(limit != nothing)
                request[Symbol("limit")] = limit;
            end
            response = Base.fetch(self.contractPrivateGetV5TradeOrderDetails(extend(request, params)));
        elseif functions.ccxtruthy(self.safeBool(market, "inverse"))
            if functions.ccxtruthy(limit != nothing)
                request[Symbol("page_size")] = limit;
            end
            request[Symbol("contract")] = safeString(market, "id");
            request[Symbol("trade_type")] = 0;
            if functions.ccxtruthy(marketType == "future")
                request[Symbol("symbol")] = safeString(market, "settleId");
                response = Base.fetch(self.contractPrivatePostApiV3ContractMatchresultsExact(extend(request, params)));
            elseif functions.ccxtruthy(marketType == "swap")
                response = Base.fetch(self.contractPrivatePostSwapApiV3SwapMatchresultsExact(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchMyTrades() does not support ", marketType, " markets")));
            end
        end
    end
    trades = safeValue(response, "data");
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(trades)))
        trades = safeValue(trades, "trades");
    end
    return self.parseTrades(trades, market, since, limit)

end
function fetchTrades(self::Htx, symbol, since=nothing, limit=1000, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = min(limit, 2000);
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("future"), nothing))
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
            response = Base.fetch(self.contractPublicGetMarketHistoryTrade(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
            response = Base.fetch(self.contractPublicGetLinearSwapExMarketHistoryTrade(extend(request, params)));
        end
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.contractPublicGetSwapExMarketHistoryTrade(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.contractPublicGetLinearSwapExMarketHistoryTrade(extend(request, params)));
        end
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.spotPublicGetMarketHistoryTrade(extend(request, params)));
    end
    data = safeValue(response, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        trades = safeValue(get(data, i + 1, nothing), "data", []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(trades)))
            trade = self.parseTrade(get(trades, j + 1, nothing), market);
            push!(result, trade);
            j += 1
        end
        i += 1
    end
    result = sortBy(result, "timestamp");
    return self.filterBySymbolSinceLimit(result, get(market, Symbol("symbol"), nothing), since, limit)

end
function parseOHLCV(self::Htx, ohlcv, market=nothing)
    return [safeTimestamp(ohlcv, "id"), self.safeNumber(ohlcv, "open"), self.safeNumber(ohlcv, "high"), self.safeNumber(ohlcv, "low"), self.safeNumber(ohlcv, "close"), self.safeNumber(ohlcv, "amount")]

end
function fetchOHLCV(self::Htx, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 1000))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("period") => safeString(self.timeframes, timeframe, timeframe)
    );
    priceType = safeStringN(params, ["priceType", "price"]);
    params = omit(params, ["priceType", "price"]);
    until = nothing;
    (until, params) = self.handleParamInteger(params, "until");
    untilSeconds = functions.ccxtruthy((until != nothing)) ? self.parseToInt(until / 1000) : nothing;
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("size")] = min(limit, 2000);
        else
            limit = 2000;
        end
        if functions.ccxtruthy(priceType == nothing)
            duration = self.parseTimeframe(timeframe);
            calcualtedEnd = nothing;
            if functions.ccxtruthy(since == nothing)
                now = seconds();
                request[Symbol("from")] = now - duration * (limit - 1);
                calcualtedEnd = now;
            else
                start = self.parseToInt(since / 1000);
                request[Symbol("from")] = start;
                calcualtedEnd = self.sum(start, duration * (limit - 1));
            end
            request[Symbol("to")] = functions.ccxtruthy((untilSeconds != nothing)) ? untilSeconds : calcualtedEnd;
        end
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("future"), nothing))
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
            if functions.ccxtruthy(priceType == "mark")
                response = Base.fetch(self.contractPublicGetIndexMarketHistoryMarkPriceKline(extend(request, params)));
            elseif functions.ccxtruthy(priceType == "index")
                response = Base.fetch(self.contractPublicGetIndexMarketHistoryIndex(extend(request, params)));
            else
                if functions.ccxtruthy(priceType == "premiumIndex")
                    throw(BadRequest(string(self.id, " ", get(market, Symbol("type"), nothing), " has no api endpoint for ", priceType, " kline data")));
                else
                    response = Base.fetch(self.contractPublicGetMarketHistoryKline(extend(request, params)));
                end

            end
        elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
            if functions.ccxtruthy(priceType == "mark")
                response = Base.fetch(self.contractPublicGetIndexMarketHistoryLinearSwapMarkPriceKline(extend(request, params)));
            elseif functions.ccxtruthy(priceType == "index")
                throw(BadRequest(string(self.id, " ", get(market, Symbol("type"), nothing), " has no api endpoint for ", priceType, " kline data")));
            else
                if functions.ccxtruthy(priceType == "premiumIndex")
                    response = Base.fetch(self.contractPublicGetIndexMarketHistoryLinearSwapPremiumIndexKline(extend(request, params)));
                else
                    response = Base.fetch(self.contractPublicGetLinearSwapExMarketHistoryKline(extend(request, params)));
                end

            end
        end
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            if functions.ccxtruthy(priceType == "mark")
                response = Base.fetch(self.contractPublicGetIndexMarketHistorySwapMarkPriceKline(extend(request, params)));
            elseif functions.ccxtruthy(priceType == "index")
                throw(BadRequest(string(self.id, " ", get(market, Symbol("type"), nothing), " has no api endpoint for ", priceType, " kline data")));
            else
                if functions.ccxtruthy(priceType == "premiumIndex")
                    response = Base.fetch(self.contractPublicGetIndexMarketHistorySwapPremiumIndexKline(extend(request, params)));
                else
                    response = Base.fetch(self.contractPublicGetSwapExMarketHistoryKline(extend(request, params)));
                end

            end
        elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            if functions.ccxtruthy(priceType == "mark")
                response = Base.fetch(self.contractPublicGetIndexMarketHistoryLinearSwapMarkPriceKline(extend(request, params)));
            elseif functions.ccxtruthy(priceType == "index")
                throw(BadRequest(string(self.id, " ", get(market, Symbol("type"), nothing), " has no api endpoint for ", priceType, " kline data")));
            else
                if functions.ccxtruthy(priceType == "premiumIndex")
                    response = Base.fetch(self.contractPublicGetIndexMarketHistoryLinearSwapPremiumIndexKline(extend(request, params)));
                else
                    response = Base.fetch(self.contractPublicGetLinearSwapExMarketHistoryKline(extend(request, params)));
                end

            end
        end
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        useHistorical = nothing;
        (useHistorical, params) = self.handleOptionAndParams(params, "fetchOHLCV", "useHistoricalEndpointForSpot", true);
        if functions.ccxtruthy(!functions.ccxtruthy(useHistorical))
            if functions.ccxtruthy(limit != nothing)
                request[Symbol("size")] = min(limit, 2000);
            end
            response = Base.fetch(self.spotPublicGetMarketHistoryKline(extend(request, params)));
        else
            if functions.ccxtruthy(since != nothing)
                request[Symbol("from")] = self.parseToInt(since / 1000);
            end
            if functions.ccxtruthy(untilSeconds != nothing)
                request[Symbol("to")] = untilSeconds;
            end
            if functions.ccxtruthy(limit != nothing)
                request[Symbol("size")] = min(1000, limit);
            end
            response = Base.fetch(self.spotPublicGetMarketHistoryCandles(extend(request, params)));
        end
    end
    data = self.safeList(response, "data", []);
    return self.parseOHLCVs(data, market, timeframe, since, limit)

end
function fetchAccounts(self::Htx, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.spotPrivateGetV1AccountAccounts(params));
    data = safeValue(response, "data");
    return self.parseAccounts(data)

end
function parseAccount(self::Htx, account)
    typeId = safeString(account, "type");
    accountsById = safeValue(self.options, "accountsById", Dict{Symbol, Any}());
    type_var = safeValue(accountsById, typeId, typeId);
    return Dict{Symbol, Any}(
    Symbol("info") => account,
    Symbol("id") => safeString(account, "id"),
    Symbol("type") => type_var,
    Symbol("code") => nothing
)

end
function fetchAccountIdByType(self::Htx, type_var, marginMode=nothing, symbol=nothing, params=Dict())
    accounts = Base.fetch(self.loadAccounts());
    accountId = safeValue2(params, "accountId", "account-id");
    if functions.ccxtruthy(accountId != nothing)
            return accountId
    end
    if functions.ccxtruthy(type_var == "spot")
        if functions.ccxtruthy(marginMode == "cross")
            type_var = "super-margin";
        elseif functions.ccxtruthy(marginMode == "isolated")
            type_var = "margin";
        end
    end
    marketId = nothing;
    if functions.ccxtruthy(symbol != nothing)
        marketId = self.marketId(symbol);
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(accounts)))
        account = get(accounts, i + 1, nothing);
        info = safeValue(account, "info");
        subtype = safeString(info, "subtype");
        typeFromAccount = safeString(account, "type");
        if functions.ccxtruthy(type_var == "margin")
            if functions.ccxtruthy(subtype == marketId)
                    return safeString(account, "id")
            end
        elseif functions.ccxtruthy(type_var == typeFromAccount)
            return safeString(account, "id")
        end
        i += 1
    end
    defaultAccount = safeValue(accounts, 0, Dict{Symbol, Any}());
    return safeString(defaultAccount, "id")

end
function fetchCurrencies(self::Htx, params=Dict())
    response = Base.fetch(self.spotPublicGetV2ReferenceCurrencies(params));
    data = self.safeList(response, "data", []);
    self.options[Symbol("networkNamesByChainIds")] = Dict{Symbol, Any}();
    self.options[Symbol("networkChainIdsByNames")] = Dict{Symbol, Any}();
    return self.parseCurrencies(data)

end
function parseCurrency(self::Htx, rawCurrency)
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("networkNamesByChainIds", self.options))))
        self.options[Symbol("networkNamesByChainIds")] = Dict{Symbol, Any}();
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("networkChainIdsByNames", self.options))))
        self.options[Symbol("networkChainIdsByNames")] = Dict{Symbol, Any}();
    end
    currencyId = safeString(rawCurrency, "currency");
    code = self.safeCurrencyCode(currencyId);
    assetType = safeString(rawCurrency, "assetType");
    type_var = functions.ccxtruthy((assetType == "1")) ? "crypto" : "fiat";
    self.options[Symbol("networkChainIdsByNames")][Symbol(code)] = Dict{Symbol, Any}();
    chains = self.safeList(rawCurrency, "chains", []);
    networks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chainEntry = get(chains, j + 1, nothing);
        uniqueChainId = safeString(chainEntry, "chain");
        title = safeString2(chainEntry, "baseChain", "displayName");
        self.options[Symbol("networkChainIdsByNames")][Symbol(code)][Symbol(title)] = uniqueChainId;
        self.options[Symbol("networkNamesByChainIds")][Symbol(uniqueChainId)] = title;
        networkCode = self.networkIdToCode(uniqueChainId, code);
        networks[Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("info") => chainEntry,
            Symbol("id") => uniqueChainId,
            Symbol("network") => networkCode,
            Symbol("limits") => Dict{Symbol, Any}(
                Symbol("deposit") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(chainEntry, "minDepositAmt"),
                    Symbol("max") => nothing
                ),
                Symbol("withdraw") => Dict{Symbol, Any}(
                    Symbol("min") => self.safeNumber(chainEntry, "minWithdrawAmt"),
                    Symbol("max") => self.safeNumber(chainEntry, "maxWithdrawAmt")
                )
            ),
            Symbol("active") => nothing,
            Symbol("deposit") => safeString(chainEntry, "depositStatus") == "allowed",
            Symbol("withdraw") => safeString(chainEntry, "withdrawStatus") == "allowed",
            Symbol("fee") => self.safeNumber(chainEntry, "transactFeeWithdraw"),
            Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(chainEntry, "withdrawPrecision")))
        );
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => rawCurrency,
    Symbol("code") => code,
    Symbol("id") => currencyId,
    Symbol("active") => safeString(rawCurrency, "instStatus") == "normal",
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("name") => nothing,
    Symbol("type") => type_var,
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
    Symbol("precision") => nothing,
    Symbol("networks") => networks
))

end
function networkIdToCode(self::Htx, networkId=nothing, currencyCode=nothing)
    keys_var = objectKeys(get(self.options, Symbol("networkNamesByChainIds"), nothing));
    keysLength = length(keys_var);
    if functions.ccxtruthy(keysLength == 0)
        throw(ExchangeError(string(self.id, " networkIdToCode() - markets need to be loaded at first")));
    end
    networkTitle = safeValue(get(self.options, Symbol("networkNamesByChainIds"), nothing), networkId, networkId);
    return networkIdToCode(self.parent, networkTitle, currencyCode)

end
function networkCodeToId(self::Htx, networkCode, currencyCode=nothing)
    if functions.ccxtruthy(networkCode == nothing)
            return nothing
    end
    if functions.ccxtruthy(currencyCode == nothing)
            return networkCodeToId(self.parent, networkCode)
    end
    keys_var = objectKeys(get(self.options, Symbol("networkChainIdsByNames"), nothing));
    keysLength = length(keys_var);
    if functions.ccxtruthy(keysLength == 0)
        throw(ExchangeError(string(self.id, " networkCodeToId() - markets need to be loaded at first")));
    end
    uniqueNetworkIds = safeValue(get(self.options, Symbol("networkChainIdsByNames"), nothing), currencyCode, Dict{Symbol, Any}());
    if functions.ccxtruthy(ccxt_in(networkCode, uniqueNetworkIds))
            return get(uniqueNetworkIds, Symbol(networkCode), nothing)
    else
        networkTitle = networkCodeToId(self.parent, networkCode, currencyCode);
        return safeValue(uniqueNetworkIds, networkTitle, networkTitle)
    end

end
function fetchBalance(self::Htx, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isUnifiedAccount = nothing;
    (isUnifiedAccount, params) = self.handleOptionAndParams2(params, "fetchBalance", "unified", "uta", false);
    if functions.ccxtruthy(isUnifiedAccount)
        throw(NotSupported(string(self.id, " fetchBalance() unified account has been deprecated on htx")));
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    subType = nothing;
    isMultiAssetMode = nothing;
    (subType, params) = self.handleOptionAndParams2(params, "fetchBalance", "defaultSubType", "subType", "linear");
    (isMultiAssetMode, params) = self.handleOptionAndParams(params, "fetchBalance", "multiAssetMode", false);
    request = Dict{Symbol, Any}();
    spot = (type_var == "spot");
    future = (type_var == "future");
    swap = (type_var == "swap");
    inverse = (subType == "inverse");
    linear = (subType == "linear");
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBalance", params);
    isolated = (marginMode == "isolated");
    cross = (marginMode == "cross");
    margin = @functions.ccxt_or((type_var == "margin"), (@functions.ccxt_and(spot, (@functions.ccxt_or(cross, isolated)))));
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(isMultiAssetMode, (@functions.ccxt_and(linear, (@functions.ccxt_or(swap, future))))))
        response = Base.fetch(self.contractPrivateGetV5AccountBalance(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or(spot, margin))
        if functions.ccxtruthy(margin)
            if functions.ccxtruthy(isolated)
                response = Base.fetch(self.spotPrivateGetV1MarginAccountsBalance(extend(request, params)));
            else
                response = Base.fetch(self.spotPrivateGetV1CrossMarginAccountsBalance(extend(request, params)));
            end
        else
            Base.fetch(self.loadAccounts());
            accountId = Base.fetch(self.fetchAccountIdByType(type_var, nothing, nothing, params));
            request[Symbol("account-id")] = accountId;
            response = Base.fetch(self.spotPrivateGetV1AccountAccountsAccountIdBalance(extend(request, params)));
        end
    else
        if functions.ccxtruthy(inverse)
            if functions.ccxtruthy(future)
                response = Base.fetch(self.contractPrivatePostApiV1ContractAccountInfo(extend(request, params)));
            else
                response = Base.fetch(self.contractPrivatePostSwapApiV1SwapAccountInfo(extend(request, params)));
            end
        end

    end
    finalResponse = response;
    result = Dict{Symbol, Any}(
        Symbol("info") => finalResponse
    );
    data = safeValue(response, "data");
    if functions.ccxtruthy(@functions.ccxt_or(isMultiAssetMode, (@functions.ccxt_and(linear, (@functions.ccxt_or(swap, future))))))
        details = self.safeList(data, "details", []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(details)))
            balance = get(details, i + 1, nothing);
            currencyId = safeString(balance, "currency");
            code = self.safeCurrencyCode(currencyId);
            account = self.account();
            account[Symbol("free")] = safeString(balance, "available_margin");
            account[Symbol("total")] = safeString(balance, "equity");
            result[Symbol(code)] = account;
            i += 1
        end

        result = self.safeBalance(result);
    elseif functions.ccxtruthy(@functions.ccxt_or(spot, margin))
        if functions.ccxtruthy(isolated)
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
                entry = get(data, i + 1, nothing);
                symbol = self.safeSymbol(safeString(entry, "symbol"));
                balances = safeValue(entry, "list");
                subResult = Dict{Symbol, Any}();
                j = 0
                while functions.ccxtruthy(functions.ccxt_lt(j, length(balances)))
                    balance = get(balances, j + 1, nothing);
                    currencyId = safeString(balance, "currency");
                    code = self.safeCurrencyCode(currencyId);
                    subResult[Symbol(code)] = self.parseMarginBalanceHelper(balance, code, subResult);
                    j += 1
                end
                result[Symbol(symbol)] = self.safeBalance(subResult);
                i += 1
            end

        else
            balances = safeValue(data, "list", []);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
                balance = get(balances, i + 1, nothing);
                currencyId = safeString(balance, "currency");
                code = self.safeCurrencyCode(currencyId);
                result[Symbol(code)] = self.parseMarginBalanceHelper(balance, code, result);
                i += 1
            end
            result = self.safeBalance(result);
        end
    else
        if functions.ccxtruthy(inverse)
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
                balance = get(data, i + 1, nothing);
                currencyId = safeString(balance, "symbol");
                code = self.safeCurrencyCode(currencyId);
                account = self.account();
                account[Symbol("free")] = safeString(balance, "margin_available");
                account[Symbol("used")] = safeString(balance, "margin_frozen");
                result[Symbol(code)] = account;
                i += 1
            end

            result = self.safeBalance(result);
        end

    end
    return result

end
function fetchOrder(self::Htx, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrder", market, params);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        clientOrderId = safeString(params, "clientOrderId");
        if functions.ccxtruthy(clientOrderId != nothing)
            response = Base.fetch(self.spotPrivateGetV1OrderOrdersGetClientOrder(extend(request, params)));
        else
            request[Symbol("order-id")] = id;
            response = Base.fetch(self.spotPrivateGetV1OrderOrdersOrderId(extend(request, params)));
        end
    else
        trigger = self.safeBool2(params, "stop", "trigger");
        stopLossTakeProfit = self.safeBool(params, "stopLossTakeProfit");
        stopLoss = self.safeBool(params, "stopLoss");
        takeProfit = self.safeBool(params, "takeProfit");
        trailing = self.safeBool(params, "trailing");
        isAlgo = (@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(trigger, stopLoss), takeProfit), stopLossTakeProfit), trailing));
        params = omit(params, ["stop", "stopLossTakeProfit", "trailing", "trigger", "stopLoss", "takeProfit"]);
        clientOrderId = safeStringN(params, ["client_order_id", "clientOrderId", "algo_client_order_id"]);
        if functions.ccxtruthy(clientOrderId == nothing)
            if functions.ccxtruthy(isAlgo)
                request[Symbol("algo_id")] = id;
            else
                request[Symbol("order_id")] = id;
            end
        else
            if functions.ccxtruthy(isAlgo)
                request[Symbol("algo_client_order_id")] = clientOrderId;
            else
                request[Symbol("client_order_id")] = clientOrderId;
            end
            params = omit(params, ["client_order_id", "clientOrderId", "algo_client_order_id"]);
        end
        if functions.ccxtruthy(self.safeBool(market, "linear"))
            if functions.ccxtruthy(isAlgo)
                if functions.ccxtruthy(trigger)
                    request[Symbol("type")] = "trigger";
                elseif functions.ccxtruthy(trailing)
                    request[Symbol("type")] = "trailing_stop";
                else
                    if functions.ccxtruthy(stopLossTakeProfit)
                        request[Symbol("type")] = "tpsl";
                    elseif functions.ccxtruthy(stopLoss)
                        request[Symbol("type")] = "sl";
                    else
                        if functions.ccxtruthy(takeProfit)
                            request[Symbol("type")] = "tp";
                        end

                    end

                end
                response = Base.fetch(self.contractPrivateGetV5AlgoOrder(extend(request, params)));
            else
                if functions.ccxtruthy(symbol == nothing)
                    throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
                end
                request[Symbol("contract_code")] = safeString(market, "id");
                marginMode = nothing;
                (marginMode, params) = self.handleMarginModeAndParams("fetchOrder", params);
                marginMode = functions.ccxtruthy((marginMode == nothing)) ? "cross" : marginMode;
                request[Symbol("margin_mode")] = marginMode;
                response = Base.fetch(self.contractPrivateGetV5TradeOrder(extend(request, params)));
            end
        elseif functions.ccxtruthy(self.safeBool(market, "inverse"))
            if functions.ccxtruthy(marketType == "future")
                request[Symbol("symbol")] = safeString(market, "settleId");
                response = Base.fetch(self.contractPrivatePostApiV1ContractOrderInfo(extend(request, params)));
            elseif functions.ccxtruthy(marketType == "swap")
                request[Symbol("contract_code")] = safeString(market, "id");
                response = Base.fetch(self.contractPrivatePostSwapApiV1SwapOrderInfo(extend(request, params)));
            else
                throw(NotSupported(string(self.id, " fetchOrder() does not support ", marketType, " markets")));
            end
        end
    end
    order = safeValue(response, "data");
    if functions.ccxtruthy(functions.ccxt_isArray(order))
        order = safeValue(order, 0);
    end
    return self.parseOrder(order, market)

end
function parseMarginBalanceHelper(self::Htx, balance, code, result)
    account = nothing;
    if functions.ccxtruthy(ccxt_in(code, result))
        account = get(result, Symbol(code), nothing);
    else
        account = self.account();
    end
    if functions.ccxtruthy(get(balance, Symbol("type"), nothing) == "trade")
        account[Symbol("free")] = safeString(balance, "balance");
    end
    if functions.ccxtruthy(get(balance, Symbol("type"), nothing) == "frozen")
        account[Symbol("used")] = safeString(balance, "balance");
    end
    return account

end
function fetchSpotOrdersByStates(self::Htx, states, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    method = safeString(self.options, "fetchOrdersByStatesMethod", "spot_private_get_v1_order_orders");
    if functions.ccxtruthy(method == "spot_private_get_v1_order_orders")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument")));
        end
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    request = Dict{Symbol, Any}(
        Symbol("states") => states
    );
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start-time")] = since;
        request[Symbol("end-time")] = self.sum(since, 48 * 60 * 60 * 1000);
    end
    (request, params) = self.handleUntilOption("end-time", request, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(method == "spot_private_get_v1_order_orders")
        response = Base.fetch(self.spotPrivateGetV1OrderOrders(extend(request, params)));
    else
        response = Base.fetch(self.spotPrivateGetV1OrderHistory(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    return self.parseOrders(data, market, since, limit)

end
function fetchSpotOrders(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchSpotOrdersByStates("pre-submitted,submitted,partial-filled,filled,partial-canceled,canceled", symbol, since, limit, params))

end
function fetchClosedSpotOrders(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchSpotOrdersByStates("filled", symbol, since, limit, params))

end
function fetchContractOrders(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchContractOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    response = nothing;
    trigger = self.safeBool2(params, "stop", "trigger");
    stopLossTakeProfit = safeValue(params, "stopLossTakeProfit");
    stopLoss = self.safeBool(params, "stopLoss");
    takeProfit = self.safeBool(params, "takeProfit");
    trailing = self.safeBool(params, "trailing", false);
    isAlgo = (@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(trigger, stopLoss), takeProfit), stopLossTakeProfit), trailing));
    params = omit(params, ["stop", "stopLossTakeProfit", "trailing", "trigger", "stopLoss", "takeProfit"]);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("fetchContractOrders", params);
        marginMode = functions.ccxtruthy((marginMode == nothing)) ? "cross" : marginMode;
        request[Symbol("margin_mode")] = marginMode;
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(isAlgo)
            if functions.ccxtruthy(trigger)
                request[Symbol("type")] = "trigger";
            elseif functions.ccxtruthy(trailing)
                request[Symbol("type")] = "trailing_stop";
            else
                if functions.ccxtruthy(stopLossTakeProfit)
                    request[Symbol("type")] = "tpsl";
                elseif functions.ccxtruthy(stopLoss)
                    request[Symbol("type")] = "sl";
                else
                    if functions.ccxtruthy(takeProfit)
                        request[Symbol("type")] = "tp";
                    end

                end

            end
            response = Base.fetch(self.contractPrivateGetV5AlgoOrderHistory(extend(request, params)));
        else
            response = Base.fetch(self.contractPrivateGetV5TradeOrderHistory(extend(request, params)));
        end
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        request[Symbol("contract")] = get(market, Symbol("id"), nothing);
        request[Symbol("type")] = 1;
        request[Symbol("trade_type")] = 0;
        request[Symbol("status")] = "0";
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTriggerHisorders(extend(request, params)));
            elseif functions.ccxtruthy(stopLossTakeProfit)
                response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTpslHisorders(extend(request, params)));
            else
                if functions.ccxtruthy(trailing)
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTrackHisorders(extend(request, params)));
                else
                    response = Base.fetch(self.contractPrivatePostSwapApiV3SwapHisorders(extend(request, params)));
                end

            end
        elseif functions.ccxtruthy(get(market, Symbol("future"), nothing))
            request[Symbol("symbol")] = get(market, Symbol("settleId"), nothing);
            if functions.ccxtruthy(trigger)
                response = Base.fetch(self.contractPrivatePostApiV1ContractTriggerHisorders(extend(request, params)));
            elseif functions.ccxtruthy(stopLossTakeProfit)
                response = Base.fetch(self.contractPrivatePostApiV1ContractTpslHisorders(extend(request, params)));
            else
                if functions.ccxtruthy(trailing)
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTrackHisorders(extend(request, params)));
                else
                    response = Base.fetch(self.contractPrivatePostApiV3ContractHisorders(extend(request, params)));
                end

            end
        end
    end
    orders = safeValue(response, "data");
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(orders)))
        orders = safeValue(orders, "orders", []);
    end
    return self.parseOrders(orders, market, since, limit)

end
function fetchClosedContractOrders(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchClosedContractOrders() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        trigger = self.safeBool2(params, "stop", "trigger");
        stopLossTakeProfit = safeValue(params, "stopLossTakeProfit");
        stopLoss = self.safeBool(params, "stopLoss");
        takeProfit = self.safeBool(params, "takeProfit");
        trailing = self.safeBool(params, "trailing", false);
        isAlgo = (@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(trigger, stopLoss), takeProfit), stopLossTakeProfit), trailing));
        if functions.ccxtruthy(isAlgo)
            request[Symbol("states")] = "effective";
        else
            request[Symbol("states")] = "filled";
        end
    else
        request[Symbol("status")] = "6";
    end
    return Base.fetch(self.fetchContractOrders(symbol, since, limit, extend(request, params)))

end
function fetchOrders(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrders", market, params);
    contract = @functions.ccxt_or((marketType == "swap"), (marketType == "future"));
    if functions.ccxtruthy(@functions.ccxt_and(contract, (symbol == nothing)))
        throw(ArgumentsRequired(string(self.id, " fetchOrders() requires a symbol argument for ", marketType, " orders")));
    end
    if functions.ccxtruthy(contract)
            return Base.fetch(self.fetchContractOrders(symbol, since, limit, params))
    else
        return Base.fetch(self.fetchSpotOrders(symbol, since, limit, params))
    end

end
function fetchCanceledOrders(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchCanceledOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchCanceledOrders", symbol, since, limit, params, 100))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchCanceledOrders", market, params);
    if functions.ccxtruthy(marketType == "spot")
            return Base.fetch(self.fetchSpotOrdersByStates("partial-canceled,canceled", symbol, since, limit, params))
    else
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchCanceledOrders() requires a symbol argument for ", marketType, " orders")));
        end
        request = Dict{Symbol, Any}();
        if functions.ccxtruthy(self.safeBool(market, "linear"))
            trigger = self.safeBool2(params, "stop", "trigger");
            stopLossTakeProfit = safeValue(params, "stopLossTakeProfit");
            stopLoss = self.safeBool(params, "stopLoss");
            takeProfit = self.safeBool(params, "takeProfit");
            trailing = self.safeBool(params, "trailing", false);
            isAlgo = (@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(trigger, stopLoss), takeProfit), stopLossTakeProfit), trailing));
            if functions.ccxtruthy(isAlgo)
                request[Symbol("states")] = "canceled";
            else
                request[Symbol("states")] = "partially_canceled,canceled";
            end
        else
            request[Symbol("status")] = "5,7";
        end
        return Base.fetch(self.fetchContractOrders(symbol, since, limit, extend(request, params)))
    end

end
function fetchClosedOrders(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchClosedOrders", symbol, since, limit, params, 100))
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchClosedOrders", market, params);
    if functions.ccxtruthy(marketType == "spot")
            return Base.fetch(self.fetchClosedSpotOrders(symbol, since, limit, params))
    else
        return Base.fetch(self.fetchClosedContractOrders(symbol, since, limit, params))
    end

end
function fetchOpenOrders(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOpenOrders", market, params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchOpenOrders", market, params, "linear");
    isLinear = (subType == "linear");
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol != nothing)
            request[Symbol("symbol")] = safeString(market, "id");
        end
        accountId = safeString(params, "account-id");
        if functions.ccxtruthy(accountId == nothing)
            Base.fetch(self.loadAccounts());
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(self.accounts)))
                account = get(self.accounts, i + 1, nothing);
                if functions.ccxtruthy(safeString(account, "type") == "spot")
                    accountId = safeString(account, "id");
                    if functions.ccxtruthy(accountId != nothing)
                        break
                    end
                end
                i += 1
            end

        end
        request[Symbol("account-id")] = accountId;
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("size")] = limit;
        end
        params = omit(params, "account-id");
        response = Base.fetch(self.spotPrivateGetV1OrderOpenOrders(extend(request, params)));
    else
        if functions.ccxtruthy(symbol != nothing)
            request[Symbol("contract_code")] = safeString(market, "id");
        end
        if functions.ccxtruthy(limit != nothing)
            if functions.ccxtruthy(isLinear)
                request[Symbol("limit")] = limit;
            else
                request[Symbol("page_size")] = limit;
            end
        end
        trigger = self.safeBool2(params, "stop", "trigger");
        stopLossTakeProfit = self.safeBool(params, "stopLossTakeProfit");
        stopLoss = self.safeBool(params, "stopLoss");
        takeProfit = self.safeBool(params, "takeProfit");
        trailing = self.safeBool(params, "trailing", false);
        params = omit(params, ["stop", "stopLossTakeProfit", "trailing", "trigger", "stopLoss", "takeProfit"]);
        if functions.ccxtruthy(isLinear)
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(trigger, trailing), stopLossTakeProfit), stopLoss), takeProfit))
                if functions.ccxtruthy(trigger)
                    request[Symbol("type")] = "trigger";
                elseif functions.ccxtruthy(trailing)
                    request[Symbol("type")] = "trailing_stop";
                else
                    if functions.ccxtruthy(stopLossTakeProfit)
                        request[Symbol("type")] = "tpsl";
                    elseif functions.ccxtruthy(stopLoss)
                        request[Symbol("type")] = "sl";
                    else
                        if functions.ccxtruthy(takeProfit)
                            request[Symbol("type")] = "tp";
                        end

                    end

                end
                response = Base.fetch(self.contractPrivateGetV5AlgoOrderOpens(extend(request, params)));
            else
                response = Base.fetch(self.contractPrivateGetV5TradeOrderOpens(extend(request, params)));
            end
        elseif functions.ccxtruthy(subType == "inverse")
            if functions.ccxtruthy(marketType == "swap")
                if functions.ccxtruthy(trigger)
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTriggerOpenorders(extend(request, params)));
                elseif functions.ccxtruthy(stopLossTakeProfit)
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTpslOpenorders(extend(request, params)));
                else
                    if functions.ccxtruthy(trailing)
                        response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTrackOpenorders(extend(request, params)));
                    else
                        response = Base.fetch(self.contractPrivatePostSwapApiV1SwapOpenorders(extend(request, params)));
                    end

                end
            elseif functions.ccxtruthy(marketType == "future")
                request[Symbol("symbol")] = safeString(market, "settleId", "usdt");
                if functions.ccxtruthy(trigger)
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTriggerOpenorders(extend(request, params)));
                elseif functions.ccxtruthy(stopLossTakeProfit)
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTpslOpenorders(extend(request, params)));
                else
                    if functions.ccxtruthy(trailing)
                        response = Base.fetch(self.contractPrivatePostApiV1ContractTrackOpenorders(extend(request, params)));
                    else
                        response = Base.fetch(self.contractPrivatePostApiV1ContractOpenorders(extend(request, params)));
                    end

                end
            end
        end
    end
    orders = safeValue(response, "data");
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(orders)))
        orders = safeValue(orders, "orders", []);
    end
    return self.parseOrders(orders, market, since, limit)

end
function parseOrderStatus(self::Htx, status)
    statuses = Dict{Symbol, Any}(
        Symbol("partial-filled") => "open",
        Symbol("partial-canceled") => "canceled",
        Symbol("filled") => "closed",
        Symbol("canceled") => "canceled",
        Symbol("submitted") => "open",
        Symbol("created") => "open",
        Symbol("1") => "open",
        Symbol("2") => "open",
        Symbol("3") => "open",
        Symbol("4") => "open",
        Symbol("5") => "canceled",
        Symbol("6") => "closed",
        Symbol("7") => "canceled",
        Symbol("11") => "canceling",
        Symbol("active") => "open",
        Symbol("new") => "open",
        Symbol("partially_filled") => "open",
        Symbol("partially_canceled") => "canceled"
    );
    return safeString(statuses, status, status)

end
function parseOrder(self::Htx, order, market=nothing)
    marketId = safeString2(order, "contract_code", "symbol");
    market = self.safeMarket(marketId, market);
    rejectedCreateOrders = safeString2(order, "err_code", "err-code");
    status = self.parseOrderStatus(safeString2(order, "state", "status"));
    if functions.ccxtruthy(rejectedCreateOrders != nothing)
        status = "rejected";
    end
    id = safeStringN(order, ["algo_id", "id", "order_id_str", "order-id", "order_id"]);
    side = safeString2(order, "direction", "side");
    contractCode = safeString(order, "contract_code");
    isLinearOrder = @functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((contractCode != nothing), (market != nothing)), get(market, Symbol("linear"), nothing)), !functions.ccxtruthy(get(market, Symbol("spot"), nothing)));
    type_var = nothing;
    if functions.ccxtruthy(isLinearOrder)
        type_var = safeString(order, "type");
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((type_var == nothing), (type_var == "tp")), (type_var == "sl")), (type_var == "tpsl")))
            type_var = safeStringN(order, ["tp_type", "sl_type"]);
        end
        if functions.ccxtruthy(type_var == "0")
            type_var = nothing;
        end
    else
        type_var = safeString(order, "order_price_type");
        rawType = safeString(order, "type");
        if functions.ccxtruthy(rawType != nothing)
            if functions.ccxtruthy(findfirst("-", rawType) !== nothing)
                orderType = split(rawType, "-");
                side = get(orderType, 1, nothing);
                type_var = get(orderType, 2, nothing);
            elseif functions.ccxtruthy(type_var == nothing)
                type_var = rawType;
            end
        end
    end
    timestamp = safeIntegerN(order, ["created_at", "created-at", "create_date", "created_time"]);
    clientOrderId = safeStringN(order, ["client_order_id", string("client-or", "der-id"), "algo_client_order_id"]);
    cost = nothing;
    amount = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((type_var != nothing), (findfirst("market", type_var) !== nothing)), (!functions.ccxtruthy(isLinearOrder))))
        cost = safeString(order, "field-cash-amount");
    else
        amount = safeString2(order, "volume", "amount");
        cost = safeStringN(order, ["filled-cash-amount", "field-cash-amount", "trade_turnover"]);
    end
    filled = safeStringN(order, ["filled-amount", "field-amount", "trade_volume"]);
    price = safeString2(order, "price", "order_price");
    feeCost = safeString2(order, "filled-fees", "field-fees");
    feeCost = safeString(order, "fee", feeCost);
    fee = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((feeCost != nothing), (feeCost != "0")), (feeCost != "0.0")))
        feeCurrency = nothing;
        feeCurrencyId = safeString2(order, "fee_asset", "fee_currency");
        if functions.ccxtruthy(feeCurrencyId != nothing)
            feeCurrency = self.safeCurrencyCode(feeCurrencyId);
        else
            feeCurrency = functions.ccxtruthy((side == "sell")) ? get(market, Symbol("quote"), nothing) : get(market, Symbol("base"), nothing);
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => feeCurrency
        );
    end
    average = safeString(order, "trade_avg_price");
    trades = safeValue(order, "trades");
    reduceOnly = nothing;
    if functions.ccxtruthy(isLinearOrder)
        reduceOnly = self.safeBool(order, "reduce_only");
    else
        reduceOnlyInteger = safeInteger(order, "reduce_only");
        if functions.ccxtruthy(reduceOnlyInteger != nothing)
            reduceOnly = functions.ccxtruthy((reduceOnlyInteger == 0)) ? false : true;
        end
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => id,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => safeStringUpper(order, "time_in_force"),
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => safeString2(order, "stop-price", "trigger_price"),
    Symbol("stopLossPrice") => safeString2(order, "sl_trigger_price", "sl_order_price"),
    Symbol("takeProfitPrice") => safeString2(order, "tp_trigger_price", "tp_order_price"),
    Symbol("average") => average,
    Symbol("cost") => cost,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("status") => status,
    Symbol("reduceOnly") => reduceOnly,
    Symbol("fee") => fee,
    Symbol("trades") => trades
), market)

end
function createMarketBuyOrderWithCost(self::Htx, symbol, cost, params=Dict())
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
function createTrailingPercentOrder(self::Htx, symbol, type_var, side, amount, price=nothing, trailingPercent=nothing, trailingTriggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(trailingPercent == nothing)
        throw(ArgumentsRequired(string(self.id, " createTrailingPercentOrder() requires a trailingPercent argument")));
    end
    if functions.ccxtruthy(trailingTriggerPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " createTrailingPercentOrder() requires a trailingTriggerPrice argument")));
    end
    params[Symbol("trailingPercent")] = trailingPercent;
    params[Symbol("trailingTriggerPrice")] = trailingTriggerPrice;
    return Base.fetch(self.createOrder(symbol, type_var, side, amount, price, params))

end
function createSpotOrderRequest(self::Htx, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    market = self.market(symbol);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params);
    accountId = Base.fetch(self.fetchAccountIdByType(get(market, Symbol("type"), nothing), marginMode, symbol));
    request = Dict{Symbol, Any}(
        Symbol("account-id") => accountId,
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    orderType = replace(type_var, "buy-" => "");
    orderType = replace(orderType, "sell-" => "");
    options = safeValue(self.options, get(market, Symbol("type"), nothing), Dict{Symbol, Any}());
    triggerPrice = safeStringN(params, ["triggerPrice", "stopPrice", "stop-price"]);
    if functions.ccxtruthy(triggerPrice == nothing)
        stopOrderTypes = safeValue(options, "stopOrderTypes", Dict{Symbol, Any}());
        if functions.ccxtruthy(ccxt_in(orderType, stopOrderTypes))
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a triggerPrice for a trigger order")));
        end
    else
        defaultOperator = functions.ccxtruthy((side == "sell")) ? "lte" : "gte";
        stopOperator = safeString(params, "operator", defaultOperator);
        request[Symbol("stop-price")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("operator")] = stopOperator;
        if functions.ccxtruthy(@functions.ccxt_or((orderType == "limit"), (orderType == "limit-fok")))
            orderType = string("stop-", orderType);
        elseif functions.ccxtruthy(@functions.ccxt_and((orderType != "stop-limit"), (orderType != "stop-limit-fok")))
            throw(NotSupported(string(self.id, " createOrder() does not support ", type_var, " orders")));
        end
    end
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(orderType == "market", orderType == "limit-maker", params);
    if functions.ccxtruthy(postOnly)
        orderType = "limit-maker";
    end
    timeInForce = safeString(params, "timeInForce", "GTC");
    if functions.ccxtruthy(timeInForce == "FOK")
        orderType = string(orderType, "-fok");
    elseif functions.ccxtruthy(timeInForce == "IOC")
        orderType = "ioc";
    end
    request[Symbol("type")] = string(side, "-", orderType);
    clientOrderId = safeString2(params, "clientOrderId", "client-order-id");
    if functions.ccxtruthy(clientOrderId == nothing)
        broker = safeValue(self.options, "broker", Dict{Symbol, Any}());
        brokerId = safeString(broker, "id");
        request[Symbol("client-order-id")] = string(brokerId, uuid());
    else
        request[Symbol("client-order-id")] = clientOrderId;
    end
    if functions.ccxtruthy(marginMode == "cross")
        request[Symbol("source")] = "super-margin-api";
    elseif functions.ccxtruthy(marginMode == "isolated")
        request[Symbol("source")] = "margin-api";
    else
        if functions.ccxtruthy(marginMode == "c2c")
            request[Symbol("source")] = "c2c-margin-api";
        end

    end
    if functions.ccxtruthy(@functions.ccxt_and((orderType == "market"), (side == "buy")))
        quoteAmount = nothing;
        createMarketBuyOrderRequiresPrice = true;
        (createMarketBuyOrderRequiresPrice, params) = self.handleOptionAndParams(params, "createOrder", "createMarketBuyOrderRequiresPrice", true);
        cost = self.safeNumber(params, "cost");
        params = omit(params, "cost");
        if functions.ccxtruthy(cost != nothing)
            quoteAmount = self.amountToPrecision(symbol, cost);
        elseif functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
            if functions.ccxtruthy(price == nothing)
                throw(InvalidOrder(string(self.id, " createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument")));
            else
                amountString = numberToString(amount);
                priceString = numberToString(price);
                quoteAmount = self.amountToPrecision(symbol, stringMul(amountString, priceString));
            end
        else
            quoteAmount = self.amountToPrecision(symbol, amount);
        end
        request[Symbol("amount")] = quoteAmount;
    else
        request[Symbol("amount")] = self.amountToPrecision(symbol, amount);
    end
    limitOrderTypes = safeValue(options, "limitOrderTypes", Dict{Symbol, Any}());
    if functions.ccxtruthy(ccxt_in(orderType, limitOrderTypes))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    params = omit(params, ["triggerPrice", "stopPrice", "stop-price", "clientOrderId", "client-order-id", "operator", "timeInForce"]);
    return extend(request, params)

end
function createContractOrderRequest(self::Htx, symbol, type_var, side, amount, price=nothing, params=Dict())
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("contract_code") => get(market, Symbol("id"), nothing),
        Symbol("volume") => self.amountToPrecision(symbol, amount)
    );
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(type_var == "market", type_var == "post_only", params);
    if functions.ccxtruthy(postOnly)
        type_var = "post_only";
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("createOrder", market, params);
    isLinear = (subType == "linear");
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only", false);
    hedged = self.safeBool(params, "hedged", false);
    timeInForce = safeStringLower2(params, "timeInForce", "time_in_force", "gtc");
    if functions.ccxtruthy(isLinear)
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("createOrder", params, "cross");
        request[Symbol("margin_mode")] = marginMode;
        request[Symbol("side")] = side;
        if functions.ccxtruthy(timeInForce != nothing)
            request[Symbol("time_in_force")] =             lowercase(timeInForce);
        end
        stopLoss = self.safeDict(params, "stopLoss");
        takeProfit = self.safeDict(params, "takeProfit");
        stopLossTriggerPriceAttached = self.safeNumber(stopLoss, "triggerPrice");
        stopLossOrderPrice = self.safeNumber(stopLoss, "price");
        stopLossType = safeString(stopLoss, "type");
        takeProfitTriggerPriceAttached = self.safeNumber(takeProfit, "triggerPrice");
        takeProfitOrderPrice = self.safeNumber(takeProfit, "price");
        takeProfitType = safeString(takeProfit, "type");
        if functions.ccxtruthy(stopLoss != nothing)
            if functions.ccxtruthy(stopLossTriggerPriceAttached != nothing)
                request[Symbol("sl_trigger_price")] = self.priceToPrecision(symbol, stopLossTriggerPriceAttached);
            end
            if functions.ccxtruthy(stopLossOrderPrice != nothing)
                request[Symbol("sl_order_price")] = self.priceToPrecision(symbol, stopLossOrderPrice);
            end
            if functions.ccxtruthy(stopLossType != nothing)
                request[Symbol("sl_type")] = stopLossType;
            end
            params = omit(params, "stopLoss");
        end
        if functions.ccxtruthy(takeProfit != nothing)
            if functions.ccxtruthy(takeProfitTriggerPriceAttached != nothing)
                request[Symbol("tp_trigger_price")] = self.priceToPrecision(symbol, takeProfitTriggerPriceAttached);
            end
            if functions.ccxtruthy(takeProfitOrderPrice != nothing)
                request[Symbol("tp_order_price")] = self.priceToPrecision(symbol, takeProfitOrderPrice);
            end
            if functions.ccxtruthy(takeProfitType != nothing)
                request[Symbol("tp_type")] = takeProfitType;
            end
            params = omit(params, "takeProfit");
        end
    else
        if functions.ccxtruthy(hedged)
            if functions.ccxtruthy(reduceOnly)
                request[Symbol("offset")] = "close";
            else
                request[Symbol("offset")] = "open";
            end
        end
        if functions.ccxtruthy(timeInForce == "fok")
            type_var = "fok";
        elseif functions.ccxtruthy(timeInForce == "ioc")
            type_var = "ioc";
        end
        request[Symbol("direction")] = side;
    end
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "trigger_price"]);
    stopLossTriggerPrice = self.safeNumber2(params, "stopLossPrice", "sl_trigger_price");
    takeProfitTriggerPrice = self.safeNumber2(params, "takeProfitPrice", "tp_trigger_price");
    trailingPercent = safeString2(params, "trailingPercent", "callback_rate");
    trailingTriggerPrice = self.safeNumber(params, "trailingTriggerPrice", price);
    isTrailingPercentOrder = trailingPercent != nothing;
    isTrigger = triggerPrice != nothing;
    isStopLossTriggerOrder = stopLossTriggerPrice != nothing;
    isTakeProfitTriggerOrder = takeProfitTriggerPrice != nothing;
    clientOrderId = safeIntegerN(params, ["client_order_id", "clientOrderId", "algo_client_order_id"]);
    if functions.ccxtruthy(@functions.ccxt_and(isLinear, (@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(isTrailingPercentOrder, isTrigger), isStopLossTriggerOrder), isTakeProfitTriggerOrder))))
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("algo_client_order_id")] = clientOrderId;
            params = omit(params, ["clientOrderId", "client_order_id"]);
        end
    end
    if functions.ccxtruthy(isTrigger)
        request[Symbol("trigger_price")] = self.priceToPrecision(symbol, triggerPrice);
        if functions.ccxtruthy(isLinear)
            request[Symbol("type")] = "trigger";
            if functions.ccxtruthy(price != nothing)
                request[Symbol("price")] = self.priceToPrecision(symbol, price);
            end
        else
            triggerType = safeString2(params, "triggerType", "trigger_type", "le");
            request[Symbol("trigger_type")] = triggerType;
            if functions.ccxtruthy(price != nothing)
                request[Symbol("order_price")] = self.priceToPrecision(symbol, price);
            end
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(isStopLossTriggerOrder, isTakeProfitTriggerOrder))
        if functions.ccxtruthy(isStopLossTriggerOrder)
            if functions.ccxtruthy(!functions.ccxtruthy(isLinear))
                request[Symbol("sl_order_price_type")] = type_var;
            else
                request[Symbol("type")] = "sl";
            end
            request[Symbol("sl_trigger_price")] = self.priceToPrecision(symbol, stopLossTriggerPrice);
            if functions.ccxtruthy(price != nothing)
                request[Symbol("sl_order_price")] = self.priceToPrecision(symbol, price);
            end
        else
            if functions.ccxtruthy(!functions.ccxtruthy(isLinear))
                request[Symbol("tp_order_price_type")] = type_var;
            else
                request[Symbol("type")] = "tp";
            end
            request[Symbol("tp_trigger_price")] = self.priceToPrecision(symbol, takeProfitTriggerPrice);
            if functions.ccxtruthy(price != nothing)
                request[Symbol("tp_order_price")] = self.priceToPrecision(symbol, price);
            end
        end
    else
        if functions.ccxtruthy(isTrailingPercentOrder)
            trailingPercentString = stringDiv(trailingPercent, "100");
            request[Symbol("callback_rate")] = self.parseToNumeric(trailingPercentString);
            request[Symbol("order_price_type")] = safeString(params, "order_price_type", "formula_price");
            request[Symbol("active_price")] = trailingTriggerPrice;
            if functions.ccxtruthy(isLinear)
                request[Symbol("type")] = "trailing_stop";
            end
        else
            if functions.ccxtruthy(clientOrderId != nothing)
                request[Symbol("client_order_id")] = clientOrderId;
                params = omit(params, ["clientOrderId"]);
            end
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(type_var == "limit", type_var == "ioc"), type_var == "fok"), type_var == "post_only"))
                if functions.ccxtruthy(price != nothing)
                    request[Symbol("price")] = self.priceToPrecision(symbol, price);
                end
            end
        end

    end
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isStopLossTriggerOrder), !functions.ccxtruthy(isTakeProfitTriggerOrder)))
        if functions.ccxtruthy(reduceOnly)
            request[Symbol("reduce_only")] = 1;
        end
        if functions.ccxtruthy(isLinear)
            if functions.ccxtruthy(!functions.ccxtruthy(isTrailingPercentOrder))
                request[Symbol("type")] = type_var;
            end
        else
            if functions.ccxtruthy(!functions.ccxtruthy(isTrailingPercentOrder))
                request[Symbol("order_price_type")] = type_var;
            end
            request[Symbol("lever_rate")] = safeIntegerN(params, ["leverRate", "lever_rate", "leverage"], 1);
        end
    end
    broker = safeValue(self.options, "broker", Dict{Symbol, Any}());
    brokerId = safeString(broker, "id");
    request[Symbol("channel_code")] = brokerId;
    params = omit(params, ["reduceOnly", "triggerPrice", "stopPrice", "stopLossPrice", "takeProfitPrice", "triggerType", "leverRate", "timeInForce", "leverage", "trailingPercent", "trailingTriggerPrice", "hedged"]);
    return extend(request, params)

end
function createOrder(self::Htx, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    triggerPrice = self.safeNumberN(params, ["triggerPrice", "stopPrice", "trigger_price"]);
    stopLossTriggerPrice = self.safeNumber2(params, "stopLossPrice", "sl_trigger_price");
    takeProfitTriggerPrice = self.safeNumber2(params, "takeProfitPrice", "tp_trigger_price");
    trailingPercent = self.safeNumber(params, "trailingPercent");
    isTrailingPercentOrder = trailingPercent != nothing;
    isTrigger = triggerPrice != nothing;
    isStopLossTriggerOrder = stopLossTriggerPrice != nothing;
    isTakeProfitTriggerOrder = takeProfitTriggerPrice != nothing;
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(isTrailingPercentOrder)
            throw(NotSupported(string(self.id, " createOrder() does not support trailing orders for spot markets")));
        end
        spotRequest = Base.fetch(self.createSpotOrderRequest(symbol, type_var, side, amount, price, params));
        response = Base.fetch(self.spotPrivatePostV1OrderOrdersPlace(spotRequest));
    else
        contractRequest = self.createContractOrderRequest(symbol, type_var, side, amount, price, params);
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(isTrigger, isStopLossTriggerOrder), isTakeProfitTriggerOrder), isTrailingPercentOrder))
                response = Base.fetch(self.contractPrivatePostV5AlgoOrder(contractRequest));
            else
                response = Base.fetch(self.contractPrivatePostV5TradeOrder(contractRequest));
            end
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            offset = safeString(params, "offset");
            if functions.ccxtruthy(offset == nothing)
                throw(ArgumentsRequired(string(self.id, " createOrder () requires an extra parameter params[\"offset\"] to be set to \"open\" or \"close\" when placing orders in inverse markets")));
            end
            if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
                if functions.ccxtruthy(isTrigger)
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTriggerOrder(contractRequest));
                elseif functions.ccxtruthy(@functions.ccxt_or(isStopLossTriggerOrder, isTakeProfitTriggerOrder))
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTpslOrder(contractRequest));
                else
                    if functions.ccxtruthy(isTrailingPercentOrder)
                        response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTrackOrder(contractRequest));
                    else
                        response = Base.fetch(self.contractPrivatePostSwapApiV1SwapOrder(contractRequest));
                    end

                end
            elseif functions.ccxtruthy(get(market, Symbol("future"), nothing))
                if functions.ccxtruthy(isTrigger)
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTriggerOrder(contractRequest));
                elseif functions.ccxtruthy(@functions.ccxt_or(isStopLossTriggerOrder, isTakeProfitTriggerOrder))
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTpslOrder(contractRequest));
                else
                    if functions.ccxtruthy(isTrailingPercentOrder)
                        response = Base.fetch(self.contractPrivatePostApiV1ContractTrackOrder(contractRequest));
                    else
                        response = Base.fetch(self.contractPrivatePostApiV1ContractOrder(contractRequest));
                    end

                end
            end
        end
    end
    data = nothing;
    result = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("id") => safeString(response, "data"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("status") => nothing,
    Symbol("symbol") => nothing,
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount,
    Symbol("filled") => nothing,
    Symbol("remaining") => nothing,
    Symbol("cost") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => nothing,
    Symbol("clientOrderId") => nothing,
    Symbol("average") => nothing
), market)
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(isTrigger, isTrailingPercentOrder), isStopLossTriggerOrder), isTakeProfitTriggerOrder))
            data = self.safeList(response, "data", []);
            result = self.safeDict(data, 0, Dict{Symbol, Any}());
        else
            result = self.safeDict(response, "data", Dict{Symbol, Any}());
        end
        return extend(self.parseOrder(result, market), Dict{Symbol, Any}(
    Symbol("type") => type_var,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("amount") => amount
))
    else
        if functions.ccxtruthy(isStopLossTriggerOrder)
            data = safeValue(response, "data", Dict{Symbol, Any}());
            result = safeValue(data, "sl_order", Dict{Symbol, Any}());
        elseif functions.ccxtruthy(isTakeProfitTriggerOrder)
            data = safeValue(response, "data", Dict{Symbol, Any}());
            result = safeValue(data, "tp_order", Dict{Symbol, Any}());
        else
            result = safeValue(response, "data", Dict{Symbol, Any}());
        end

    end
    return self.parseOrder(result, market)

end
function createOrders(self::Htx, orders, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    symbol = nothing;
    market = nothing;
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
        marginResult = self.handleMarginModeAndParams("createOrders", orderParams);
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
        market = self.market(symbol);
        orderRequest = nothing;
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            orderRequest = Base.fetch(self.createSpotOrderRequest(marketId, type_var, side, amount, price, orderParams));
        else
            orderRequest = self.createContractOrderRequest(marketId, type_var, side, amount, price, orderParams);
        end
        orderRequest = omit(orderRequest, "marginMode");
        push!(ordersRequests, orderRequest);
        i += 1
    end
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(self.safeBool(market, "spot"))
        response = Base.fetch(self.privatePostOrderBatchOrders(ordersRequests));
    else
        if functions.ccxtruthy(self.safeBool(market, "linear"))
            response = Base.fetch(self.contractPrivatePostV5TradeBatchOrders(ordersRequests));
        elseif functions.ccxtruthy(self.safeBool(market, "inverse"))
            request[Symbol("orders_data")] = ordersRequests;
            if functions.ccxtruthy(self.safeBool(market, "swap"))
                response = Base.fetch(self.contractPrivatePostSwapApiV1SwapBatchorder(request));
            elseif functions.ccxtruthy(self.safeBool(market, "future"))
                response = Base.fetch(self.contractPrivatePostApiV1ContractBatchorder(request));
            end
        end
    end
    result = nothing;
    if functions.ccxtruthy(self.safeBool(market, "spot"))
        result = safeValue(response, "data", []);
    else
        data = safeValue(response, "data");
        if functions.ccxtruthy(functions.ccxt_isArray(data))
            result = data;
        else
            batchData = safeValue(response, "data", Dict{Symbol, Any}());
            success = safeValue(batchData, "success", []);
            errors = safeValue(batchData, "errors", []);
            result = arrayConcat(success, errors);
        end
    end
    return self.parseOrders(result, market)

end
function cancelOrder(self::Htx, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelOrder", market, params);
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("cancelOrder", market, params);
    isLinear = (subType == "linear");
    request = Dict{Symbol, Any}();
    trigger = self.safeBool2(params, "stop", "trigger");
    stopLossTakeProfit = self.safeBoolN(params, ["stopLossTakeProfit", "stopLoss", "takeProfit"]);
    trailing = self.safeBool(params, "trailing", false);
    params = omit(params, ["stop", "stopLossTakeProfit", "trailing", "trigger", "stopLoss", "takeProfit"]);
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        clientOrderId = safeString2(params, "client-order-id", "clientOrderId");
        if functions.ccxtruthy(clientOrderId == nothing)
            request[Symbol("order-id")] = id;
            response = Base.fetch(self.spotPrivatePostV1OrderOrdersOrderIdSubmitcancel(extend(request, params)));
        else
            request[Symbol("client-order-id")] = clientOrderId;
            params = omit(params, ["client-order-id", "clientOrderId"]);
            response = Base.fetch(self.spotPrivatePostV1OrderOrdersSubmitCancelClientOrder(extend(request, params)));
        end
    else
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
        end
        clientOrderId = safeStringN(params, ["client_order_id", "clientOrderId", "algo_client_order_id"]);
        if functions.ccxtruthy(!functions.ccxtruthy((@functions.ccxt_and(isLinear, (@functions.ccxt_or(@functions.ccxt_or(trigger, stopLossTakeProfit), trailing))))))
            if functions.ccxtruthy(clientOrderId == nothing)
                request[Symbol("order_id")] = id;
            else
                request[Symbol("client_order_id")] = clientOrderId;
                params = omit(params, ["client_order_id", "clientOrderId"]);
            end
        end
        if functions.ccxtruthy(self.safeBool(market, "future"))
            request[Symbol("symbol")] = safeString(market, "settleId");
        else
            request[Symbol("contract_code")] = safeString(market, "id");
        end
        if functions.ccxtruthy(isLinear)
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(trigger, stopLossTakeProfit), trailing))
                requestItem = Dict{Symbol, Any}(
                    Symbol("contract_code") => safeString(market, "id")
                );
                if functions.ccxtruthy(clientOrderId == nothing)
                    requestItem[Symbol("algo_id")] = id;
                    params = omit(params, "algo_id");
                else
                    requestItem[Symbol("algo_client_order_id")] = clientOrderId;
                    params = omit(params, ["client_order_id", "clientOrderId", "algo_client_order_id"]);
                end
                requestBody = [extend(requestItem, params)];
                response = Base.fetch(self.contractPrivatePostV5AlgoCancelOrders(requestBody));
            else
                response = Base.fetch(self.contractPrivatePostV5TradeCancelOrder(extend(request, params)));
            end
        elseif functions.ccxtruthy(self.safeBool(market, "inverse"))
            if functions.ccxtruthy(self.safeBool(market, "swap"))
                if functions.ccxtruthy(trigger)
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTriggerCancel(extend(request, params)));
                elseif functions.ccxtruthy(stopLossTakeProfit)
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTpslCancel(extend(request, params)));
                else
                    if functions.ccxtruthy(trailing)
                        response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTrackCancel(extend(request, params)));
                    else
                        response = Base.fetch(self.contractPrivatePostSwapApiV1SwapCancel(extend(request, params)));
                    end

                end
            elseif functions.ccxtruthy(self.safeBool(market, "future"))
                if functions.ccxtruthy(trigger)
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTriggerCancel(extend(request, params)));
                elseif functions.ccxtruthy(stopLossTakeProfit)
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTpslCancel(extend(request, params)));
                else
                    if functions.ccxtruthy(trailing)
                        response = Base.fetch(self.contractPrivatePostApiV1ContractTrackCancel(extend(request, params)));
                    else
                        response = Base.fetch(self.contractPrivatePostApiV1ContractCancel(extend(request, params)));
                    end

                end
            end
        else
            throw(NotSupported(string(self.id, " cancelOrder() does not support ", marketType, " markets")));
        end
    end
    result = nothing;
    if functions.ccxtruthy(isLinear)
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(trigger, stopLossTakeProfit), trailing))
            data = self.safeList(response, "data", []);
            result = self.safeDict(data, 0, Dict{Symbol, Any}());
        else
            result = self.safeDict(response, "data", Dict{Symbol, Any}());
        end
    else
        result = response;
    end
    return extend(self.parseOrder(result, market), Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("status") => "canceled"
))

end
function cancelOrders(self::Htx, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelOrders", market, params);
    request = Dict{Symbol, Any}();
    trigger = self.safeBool2(params, "stop", "trigger");
    stopLossTakeProfit = safeValue(params, "stopLossTakeProfit");
    params = omit(params, ["stop", "stopLossTakeProfit", "trigger"]);
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        clientOrderIds = safeValue2(params, "client-order-id", "clientOrderId");
        clientOrderIds = safeValue2(params, "client-order-ids", "clientOrderIds", clientOrderIds);
        if functions.ccxtruthy(clientOrderIds == nothing)
            if functions.ccxtruthy(isa(clientOrderIds, AbstractString))
                request[Symbol("order-ids")] = [ids];
            else
                request[Symbol("order-ids")] = ids;
            end
        else
            if functions.ccxtruthy(isa(clientOrderIds, AbstractString))
                request[Symbol("client-order-ids")] = [clientOrderIds];
            else
                request[Symbol("client-order-ids")] = clientOrderIds;
            end
            params = omit(params, ["client-order-id", "client-order-ids", "clientOrderId", "clientOrderIds"]);
        end
        response = Base.fetch(self.spotPrivatePostV1OrderOrdersBatchcancel(extend(request, params)));
    else
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument")));
        end
        clientOrderIds = safeValue2(params, "client_order_id", "clientOrderId");
        clientOrderIds = safeValue2(params, "client_order_ids", "clientOrderIds", clientOrderIds);
        params = omit(params, ["client_order_id", "client_order_ids", "clientOrderId", "clientOrderIds"]);
        if functions.ccxtruthy(!functions.ccxtruthy(self.safeBool(market, "linear")))
            if functions.ccxtruthy(clientOrderIds == nothing)
                request[Symbol("order_id")] =                 join(ids, ",");
            else
                request[Symbol("client_order_id")] = clientOrderIds;
            end
        end
        if functions.ccxtruthy(self.safeBool(market, "future"))
            request[Symbol("symbol")] = safeString(market, "settleId");
        else
            request[Symbol("contract_code")] = safeString(market, "id");
        end
        if functions.ccxtruthy(self.safeBool(market, "linear"))
            if functions.ccxtruthy(clientOrderIds == nothing)
                request[Symbol("order_id")] = ids;
            else
                if functions.ccxtruthy(isa(clientOrderIds, AbstractString))
                    request[Symbol("client_order_id")] =                     split(clientOrderIds, ",");
                else
                    request[Symbol("client_order_id")] = clientOrderIds;
                end
            end
            response = Base.fetch(self.contractPrivatePostV5TradeCancelBatchOrders(extend(request, params)));
        elseif functions.ccxtruthy(self.safeBool(market, "inverse"))
            if functions.ccxtruthy(self.safeBool(market, "swap"))
                if functions.ccxtruthy(trigger)
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTriggerCancel(extend(request, params)));
                elseif functions.ccxtruthy(stopLossTakeProfit)
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTpslCancel(extend(request, params)));
                else
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapCancel(extend(request, params)));
                end
            elseif functions.ccxtruthy(self.safeBool(market, "future"))
                if functions.ccxtruthy(trigger)
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTriggerCancel(extend(request, params)));
                elseif functions.ccxtruthy(stopLossTakeProfit)
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTpslCancel(extend(request, params)));
                else
                    response = Base.fetch(self.contractPrivatePostApiV1ContractCancel(extend(request, params)));
                end
            end
        else
            throw(NotSupported(string(self.id, " cancelOrders() does not support ", marketType, " markets")));
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(self.safeBool(market, "linear"), !functions.ccxtruthy(trigger)), !functions.ccxtruthy(stopLossTakeProfit)))
            return self.parseCancelOrders(response)
    end
    data = self.safeDict(response, "data");
    return self.parseCancelOrders(data)

end
function parseCancelOrders(self::Htx, orders)
    successes = safeString(orders, "successes");
    success = nothing;
    if functions.ccxtruthy(successes != nothing)
        success = split(successes, ",");
    else
        success = self.safeList(orders, "success", []);
    end
    failed = self.safeList2(orders, "errors", "failed", []);
    data = self.safeList(orders, "data", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        order = get(data, i + 1, nothing);
        push!(result, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "order_id"),
    Symbol("status") => "canceled",
    Symbol("clientOrderId") => safeString(order, "client_order_id")
)));
        i += 1
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(success)))
        order = get(success, i + 1, nothing);
        push!(result, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => order,
    Symbol("status") => "canceled"
)));
        i += 1
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(failed)))
        order = get(failed, i + 1, nothing);
        push!(result, self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString2(order, "order-id", "order_id"),
    Symbol("status") => "failed",
    Symbol("clientOrderId") => safeString(order, "client-order-id")
)));
        i += 1
    end
    return result

end
function cancelAllOrders(self::Htx, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelAllOrders", market, params);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(symbol != nothing)
            request[Symbol("symbol")] = safeString(market, "id");
        end
        response = Base.fetch(self.spotPrivatePostV1OrderOrdersBatchCancelOpenOrders(extend(request, params)));
        data = self.safeDict(response, "data");
            return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => data
))]
    else
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument")));
        end
        if functions.ccxtruthy(self.safeBool(market, "future"))
            request[Symbol("symbol")] = safeString(market, "settleId");
        end
        request[Symbol("contract_code")] = safeString(market, "id");
        trigger = self.safeBool2(params, "stop", "trigger");
        stopLossTakeProfit = safeValue(params, "stopLossTakeProfit");
        trailing = self.safeBool(params, "trailing", false);
        params = omit(params, ["stop", "stopLossTakeProfit", "trailing", "trigger"]);
        if functions.ccxtruthy(self.safeBool(market, "linear"))
            response = Base.fetch(self.contractPrivatePostV5TradeCancelAllOrders(extend(request, params)));
        elseif functions.ccxtruthy(self.safeBool(market, "inverse"))
            if functions.ccxtruthy(self.safeBool(market, "swap"))
                if functions.ccxtruthy(trigger)
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTriggerCancelall(extend(request, params)));
                elseif functions.ccxtruthy(stopLossTakeProfit)
                    response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTpslCancelall(extend(request, params)));
                else
                    if functions.ccxtruthy(trailing)
                        response = Base.fetch(self.contractPrivatePostSwapApiV1SwapTrackCancelall(extend(request, params)));
                    else
                        response = Base.fetch(self.contractPrivatePostSwapApiV1SwapCancelall(extend(request, params)));
                    end

                end
            elseif functions.ccxtruthy(self.safeBool(market, "future"))
                if functions.ccxtruthy(trigger)
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTriggerCancelall(extend(request, params)));
                elseif functions.ccxtruthy(stopLossTakeProfit)
                    response = Base.fetch(self.contractPrivatePostApiV1ContractTpslCancelall(extend(request, params)));
                else
                    if functions.ccxtruthy(trailing)
                        response = Base.fetch(self.contractPrivatePostApiV1ContractTrackCancelall(extend(request, params)));
                    else
                        response = Base.fetch(self.contractPrivatePostApiV1ContractCancelall(extend(request, params)));
                    end

                end
            end
        else
            throw(NotSupported(string(self.id, " cancelAllOrders() does not support ", marketType, " markets")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(self.safeBool(market, "linear"), (@functions.ccxt_and(@functions.ccxt_and(!functions.ccxtruthy(trigger), !functions.ccxtruthy(trailing)), !functions.ccxtruthy(stopLossTakeProfit)))))
                return self.parseCancelOrders(response)
        end
        data = self.safeDict(response, "data");
        return self.parseCancelOrders(data)
    end

end
function cancelAllOrdersAfter(self::Htx, timeout, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("timeout") => functions.ccxtruthy((functions.ccxt_gt(timeout, 0))) ? self.parseToInt(timeout / 1000) : 0
    );
    response = Base.fetch(self.v2PrivatePostAlgoOrdersCancelAllAfter(extend(request, params)));
    return response

end
function parseDepositAddress(self::Htx, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    tag = safeString(depositAddress, "addressTag");
    currencyId = safeString(depositAddress, "currency");
    currency = self.safeCurrency(currencyId, currency);
    code = self.safeCurrencyCode(currencyId, currency);
    note = safeString(depositAddress, "note");
    networkId = safeString(depositAddress, "chain");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("currency") => code,
    Symbol("address") => address,
    Symbol("tag") => tag,
    Symbol("network") => self.networkIdToCode(networkId, code),
    Symbol("note") => note,
    Symbol("info") => depositAddress
)

end
function fetchDepositAddressesByNetwork(self::Htx, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.spotPrivateGetV2AccountDepositAddress(extend(request, params)));
    data = safeValue(response, "data", []);
    parsed = self.parseDepositAddresses(data, [get(currency, Symbol("code"), nothing)], false);
    return indexBy(parsed, "network")

end
function fetchDepositAddress(self::Htx, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    (networkCode, paramsOmited) = self.handleNetworkCodeAndParams(params);
    indexedAddresses = Base.fetch(self.fetchDepositAddressesByNetwork(code, paramsOmited));
    selectedNetworkCode = self.selectNetworkCodeFromUnifiedNetworks(get(currency, Symbol("code"), nothing), networkCode, indexedAddresses);
    return get(indexedAddresses, selectedNetworkCode + 1, nothing)

end
function fetchWithdrawAddresses(self::Htx, code, note=nothing, networkCode=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.spotPrivateGetV2AccountWithdrawAddress(extend(request, params)));
    data = safeValue(response, "data", []);
    allAddresses = self.parseDepositAddresses(data, [get(currency, Symbol("code"), nothing)], false);
    addresses = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(allAddresses)))
        address = get(allAddresses, i + 1, nothing);
        noteMatch = @functions.ccxt_or((note == nothing), (get(address, Symbol("note"), nothing) == note));
        networkMatch = @functions.ccxt_or((networkCode == nothing), (get(address, Symbol("network"), nothing) == networkCode));
        if functions.ccxtruthy(@functions.ccxt_and(noteMatch, networkMatch))
                        push!(addresses, address);
        end
        i += 1
    end
    return addresses

end
function fetchDeposits(self::Htx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or(limit == nothing, functions.ccxt_gt(limit, 100)))
        limit = 100;
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "deposit",
        Symbol("direct") => "next",
        Symbol("from") => 0
    );
    if functions.ccxtruthy(currency != nothing)
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    response = Base.fetch(self.spotPrivateGetV1QueryDepositWithdraw(extend(request, params)));
    return self.parseTransactions(get(response, Symbol("data"), nothing), currency, since, limit)

end
function fetchWithdrawals(self::Htx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or(limit == nothing, functions.ccxt_gt(limit, 100)))
        limit = 100;
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    request = Dict{Symbol, Any}(
        Symbol("type") => "withdraw",
        Symbol("direct") => "next",
        Symbol("from") => 0
    );
    if functions.ccxtruthy(currency != nothing)
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    response = Base.fetch(self.spotPrivateGetV1QueryDepositWithdraw(extend(request, params)));
    return self.parseTransactions(get(response, Symbol("data"), nothing), currency, since, limit)

end
function parseTransaction(self::Htx, transaction, currency=nothing)
    timestamp = safeInteger(transaction, "created-at");
    code = self.safeCurrencyCode(safeString(transaction, "currency"));
    type_var = safeString(transaction, "type");
    if functions.ccxtruthy(type_var == "withdraw")
        type_var = "withdrawal";
    end
    feeCost = safeString(transaction, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        feeCost = stringAbs(feeCost);
    end
    networkId = safeString(transaction, "chain");
    txHash = safeString(transaction, "tx-hash");
    if functions.ccxtruthy(@functions.ccxt_and(networkId == "ETH", findfirst("0x", txHash) === nothing))
        txHash = string("0x", txHash);
    end
    subType = safeString(transaction, "sub-type");
    internal = subType == "FAST";
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString2(transaction, "id", "data"),
    Symbol("txid") => txHash,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => self.networkIdToCode(networkId, code),
    Symbol("address") => safeString(transaction, "address"),
    Symbol("addressTo") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => safeString(transaction, "address-tag"),
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => type_var,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "state")),
    Symbol("updated") => safeInteger(transaction, "updated-at"),
    Symbol("comment") => nothing,
    Symbol("internal") => internal,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => code,
        Symbol("cost") => self.parseNumber(feeCost),
        Symbol("rate") => nothing
    )
)

end
function parseTransactionStatus(self::Htx, status)
    statuses = Dict{Symbol, Any}(
        Symbol("unknown") => "failed",
        Symbol("confirming") => "pending",
        Symbol("confirmed") => "ok",
        Symbol("safe") => "ok",
        Symbol("orphan") => "failed",
        Symbol("submitted") => "pending",
        Symbol("canceled") => "canceled",
        Symbol("reexamine") => "pending",
        Symbol("reject") => "failed",
        Symbol("pass") => "pending",
        Symbol("wallet-reject") => "failed",
        Symbol("confirm-error") => "failed",
        Symbol("repealed") => "failed",
        Symbol("wallet-transfer") => "pending",
        Symbol("pre-transfer") => "pending",
        Symbol("verifying") => "pending"
    );
    return safeString(statuses, status, status)

end
function withdraw(self::Htx, code, amount, address, tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("address") => address,
        Symbol("currency") => lowercase(get(currency, Symbol("id"), nothing))
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("addr-tag")] = tag;
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("chain")] = self.networkCodeToId(networkCode, code);
    end
    amount = ccxt_toNumber(self.currencyToPrecision(code, amount, networkCode));
    withdrawOptions = safeValue(self.options, "withdraw", Dict{Symbol, Any}());
    if functions.ccxtruthy(self.safeBool(withdrawOptions, "includeFee", false))
        fee = self.safeNumber(params, "fee");
        if functions.ccxtruthy(fee == nothing)
            currencies = Base.fetch(self.fetchCurrencies());
            self.currencies = self.mapToSafeMap(deepExtend(self.currencies, currencies));
            targetNetwork = safeValue(get(currency, Symbol("networks"), nothing), networkCode, Dict{Symbol, Any}());
            fee = self.safeNumber(targetNetwork, "fee");
            if functions.ccxtruthy(fee == nothing)
                throw(ArgumentsRequired(string(self.id, " withdraw() function can not find withdraw fee for chosen network. You need to re-load markets with \"exchange.loadMarkets(true)\", or provide the \"fee\" parameter")));
            end
        end
        feeString = self.currencyToPrecision(code, fee, networkCode);
        params = omit(params, "fee");
        amountString = numberToString(amount);
        amountSubtractedString = stringSub(amountString, feeString);
        amountSubtracted = ccxt_toNumber(amountSubtractedString);
        request[Symbol("fee")] = ccxt_toNumber(feeString);
        amount = ccxt_toNumber(self.currencyToPrecision(code, amountSubtracted, networkCode));
    end
    request[Symbol("amount")] = amount;
    response = Base.fetch(self.spotPrivatePostV1DwWithdrawApiCreate(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function parseTransfer(self::Htx, transfer, currency=nothing)
    accountsById = self.safeDict(self.options, "accountsById", Dict{Symbol, Any}());
    id = safeString2(transfer, "transfer_id", "data");
    currencyId = safeString(transfer, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    amount = self.safeNumber(transfer, "amount");
    timestamp = safeInteger(transfer, "transfer_time");
    fromAccountRaw = safeString(transfer, "from_account_type");
    toAccountRaw = safeString(transfer, "to_account_type");
    fromAccount = safeString(accountsById, fromAccountRaw, fromAccountRaw);
    toAccount = safeString(accountsById, toAccountRaw, toAccountRaw);
    statusRaw = safeString(transfer, "status");
    status = nothing;
    if functions.ccxtruthy(statusRaw == "success")
        status = "ok";
    elseif functions.ccxtruthy(statusRaw == "pending")
        status = "pending";
    else
        if functions.ccxtruthy(statusRaw == "failed")
            status = "failed";
        end

    end
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
function transfer(self::Htx, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => ccxt_toNumber(self.currencyToPrecision(code, amount))
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("transfer", nothing, params);
    fromAccountId = self.convertTypeToAccount(fromAccount);
    toAccountId = self.convertTypeToAccount(toAccount);
    toCross = toAccountId == "cross";
    fromCross = fromAccountId == "cross";
    toIsolated = inArray(toAccountId, self.ids);
    fromIsolated = inArray(fromAccountId, self.ids);
    fromSpot = fromAccountId == "pro";
    toSpot = toAccountId == "pro";
    if functions.ccxtruthy(@functions.ccxt_and(fromSpot, toSpot))
        throw(BadRequest(string(self.id, " transfer () cannot make a transfer between ", fromAccount, " and ", toAccount)));
    end
    fromOrToFuturesAccount = @functions.ccxt_or((fromAccountId == "futures"), (toAccountId == "futures"));
    response = nothing;
    if functions.ccxtruthy(fromOrToFuturesAccount)
        type_var = string(fromAccountId, "-to-", toAccountId);
        type_var = safeString(params, "type", type_var);
        request[Symbol("type")] = type_var;
        response = Base.fetch(self.spotPrivatePostV1FuturesTransfer(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_and(fromSpot, toCross))
        response = Base.fetch(self.privatePostCrossMarginTransferIn(extend(request, params)));
    else
        if functions.ccxtruthy(@functions.ccxt_and(fromCross, toSpot))
            response = Base.fetch(self.privatePostCrossMarginTransferOut(extend(request, params)));
        elseif functions.ccxtruthy(@functions.ccxt_and(fromSpot, toIsolated))
            request[Symbol("symbol")] = toAccountId;
            response = Base.fetch(self.privatePostDwTransferInMargin(extend(request, params)));
        else
            if functions.ccxtruthy(@functions.ccxt_and(fromIsolated, toSpot))
                request[Symbol("symbol")] = fromAccountId;
                response = Base.fetch(self.privatePostDwTransferOutMargin(extend(request, params)));
            else
                if functions.ccxtruthy(subType == "linear")
                    if functions.ccxtruthy(@functions.ccxt_or((fromAccountId == "swap"), (fromAccount == "linear-swap")))
                        fromAccountId = "linear-swap";
                    else
                        toAccountId = "linear-swap";
                    end
                    symbol = safeString(params, "symbol");
                    params = omit(params, "symbol");
                    if functions.ccxtruthy(symbol != nothing)
                        symbol = self.marketId(symbol);
                        request[Symbol("margin-account")] = symbol;
                    else
                        request[Symbol("margin-account")] = "USDT";
                    end
                end
                request[Symbol("from")] = functions.ccxtruthy(fromSpot) ? "spot" : fromAccountId;
                request[Symbol("to")] = functions.ccxtruthy(toSpot) ? "spot" : toAccountId;
                response = Base.fetch(self.v2PrivatePostAccountTransfer(extend(request, params)));
            end

        end

    end
    return self.parseTransfer(response, currency)

end
function fetchTransfers(self::Htx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("end_time")] = until;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.spotPrivateGetV5AccountUniversalTransferRecords(extend(request, params)));
    data = self.safeList(response, "data", []);
    return self.parseTransfers(data, currency, since, limit)

end
function fetchIsolatedBorrowRates(self::Htx, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.spotPrivateGetV1MarginLoanInfo(params));
    data = safeValue(response, "data", []);
    return self.parseIsolatedBorrowRates(data)

end
function parseIsolatedBorrowRate(self::Htx, info, market=nothing)
    marketId = safeString(info, "symbol");
    symbol = self.safeSymbol(marketId, market);
    currencies = safeValue(info, "currencies", []);
    baseData = safeValue(currencies, 0);
    quoteData = safeValue(currencies, 1);
    baseId = safeString(baseData, "currency");
    quoteId = safeString(quoteData, "currency");
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("base") => self.safeCurrencyCode(baseId),
    Symbol("baseRate") => self.safeNumber(baseData, "actual-rate"),
    Symbol("quote") => self.safeCurrencyCode(quoteId),
    Symbol("quoteRate") => self.safeNumber(quoteData, "actual-rate"),
    Symbol("period") => 86400000,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("info") => info
)

end
function fetchFundingRateHistory(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingRateHistory", symbol, since, limit, params, "current_page", "page_index", 1, 50))
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("contract_code") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("start_time")] = since;
        end
    else
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("page_size")] = limit;
        else
            request[Symbol("page_size")] = 50;
        end
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.contractPublicGetSwapApiV1SwapHistoricalFundingRate(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.contractPublicGetV5MarketFundingRateHistory(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchFundingRateHistory() supports inverse and linear swaps only")));
    end
    data = safeValue(response, "data");
    rates = [];
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
            entry = get(data, i + 1, nothing);
            marketId = safeString(entry, "contract_code");
            symbolInner = self.safeSymbol(marketId, market);
            timestamp = safeInteger(entry, "funding_time");
            push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbolInner,
    Symbol("fundingRate") => self.safeNumber(entry, "funding_rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
            i += 1
        end

    else
        cursor = safeValue(data, "current_page");
        result = safeValue(data, "data", []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
            entry = get(result, i + 1, nothing);
            entry[Symbol("current_page")] = cursor;
            marketId = safeString(entry, "contract_code");
            symbolInner = self.safeSymbol(marketId);
            timestamp = safeInteger(entry, "funding_time");
            push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => symbolInner,
    Symbol("fundingRate") => self.safeNumber(entry, "funding_rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
            i += 1
        end
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, get(market, Symbol("symbol"), nothing), since, limit)

end
function parseFundingRate(self::Htx, contract, market=nothing)
    nextFundingRate = self.safeNumber(contract, "estimated_rate");
    fundingTimestamp = safeInteger(contract, "funding_time");
    nextFundingTimestamp = safeInteger(contract, "next_funding_time");
    fundingTimeString = safeString(contract, "funding_time");
    nextFundingTimeString = safeString(contract, "next_funding_time");
    millisecondsInterval = stringSub(nextFundingTimeString, fundingTimeString);
    marketId = safeString(contract, "contract_code");
    symbol = self.safeSymbol(marketId, market);
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "funding_rate"),
    Symbol("fundingTimestamp") => fundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(fundingTimestamp),
    Symbol("nextFundingRate") => nextFundingRate,
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => self.parseFundingInterval(millisecondsInterval)
)

end
function parseFundingInterval(self::Htx, interval)
    intervals = Dict{Symbol, Any}(
        Symbol("3600000") => "1h",
        Symbol("14400000") => "4h",
        Symbol("28800000") => "8h",
        Symbol("57600000") => "16h",
        Symbol("86400000") => "24h"
    );
    return safeString(intervals, interval, interval)

end
function fetchFundingRate(self::Htx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("contract_code") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.contractPublicGetSwapApiV1SwapFundingRate(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.contractPublicGetV5MarketFundingRate(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchFundingRate() supports inverse and linear swaps only")));
    end
    result = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        data = self.safeList(response, "data", []);
        result = self.safeDict(data, 0, Dict{Symbol, Any}());
    else
        result = safeValue(response, "data", Dict{Symbol, Any}());
    end
    return self.parseFundingRate(result, market)

end
function fetchFundingRates(self::Htx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    defaultSubType = safeString(self.options, "defaultSubType", "linear");
    subType = nothing;
    (subType, params) = self.handleOptionAndParams(params, "fetchFundingRates", "subType", defaultSubType);
    if functions.ccxtruthy(symbols != nothing)
        firstSymbol = safeString(symbols, 0);
        market = self.market(firstSymbol);
        isLinear = get(market, Symbol("linear"), nothing);
        subType = functions.ccxtruthy(isLinear) ? "linear" : "inverse";
    end
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(subType == "linear")
        throw(NotSupported(string(self.id, " fetchFundingRates() not support this market type")));
    elseif functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.contractPublicGetSwapApiV1SwapBatchFundingRate(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchFundingRates() not support this market type")));
    end
    data = safeValue(response, "data", []);
    return self.parseFundingRates(data, symbols)

end
function fetchBorrowInterest(self::Htx, code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBorrowInterest", params);
    marginMode = functions.ccxtruthy((marginMode == nothing)) ? "cross" : marginMode;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start-date")] = self.yyyymmdd(since);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    market = nothing;
    response = nothing;
    if functions.ccxtruthy(marginMode == "isolated")
        if functions.ccxtruthy(symbol != nothing)
            market = self.market(symbol);
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
        response = Base.fetch(self.privateGetMarginLoanOrders(extend(request, params)));
    else
        if functions.ccxtruthy(code != nothing)
            currency = self.currency(code);
            request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        end
        response = Base.fetch(self.privateGetCrossMarginLoanOrders(extend(request, params)));
    end
    data = safeValue(response, "data");
    interest = self.parseBorrowInterests(data, market);
    return self.filterByCurrencySinceLimit(interest, code, since, limit)

end
function parseBorrowInterest(self::Htx, info, market=nothing)
    marketId = safeString(info, "symbol");
    marginMode = functions.ccxtruthy((marketId == nothing)) ? "cross" : "isolated";
    market = self.safeMarket(marketId);
    symbol = safeString(market, "symbol");
    timestamp = safeInteger(info, "accrued-at");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => symbol,
    Symbol("currency") => self.safeCurrencyCode(safeString(info, "currency")),
    Symbol("interest") => self.safeNumber(info, "interest-amount"),
    Symbol("interestRate") => self.safeNumber(info, "interest-rate"),
    Symbol("amountBorrowed") => self.safeNumber(info, "loan-amount"),
    Symbol("marginMode") => marginMode,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function nonce(self::Htx, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
function sign(self::Htx, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = "/";
    isArrayParams = functions.ccxt_isArray(params);
    query = nothing;
    if functions.ccxtruthy(isArrayParams)
        query = Dict{Symbol, Any}();
    else
        query = omit(params, self.extractParams(path));
    end
    if functions.ccxtruthy(isa(api, AbstractString))
        if functions.ccxtruthy(@functions.ccxt_or((api == "public"), (api == "private")))
            url += self.version;
        elseif functions.ccxtruthy(@functions.ccxt_or((api == "v2Public"), (api == "v2Private")))
            url += "v2";
        end
        url += string("/", self.implodeParams(path, params));
        if functions.ccxtruthy(@functions.ccxt_or(api == "private", api == "v2Private"))
            self.checkRequiredCredentials();
            timestamp = self.ymdhms(self.nonce(), "T");
            request = Dict{Symbol, Any}(
                Symbol("SignatureMethod") => "HmacSHA256",
                Symbol("SignatureVersion") => "2",
                Symbol("AccessKeyId") => self.apiKey,
                Symbol("Timestamp") => timestamp
            );
            if functions.ccxtruthy(method != "POST")
                request = extend(request, query);
            end
            sortedRequest = keysort(request);
            auth = self.urlencode(sortedRequest, true);
            content = [method, self.hostname, url, auth];
            payload = join(content, "\n");
            signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "base64");
            auth += string("&", self.urlencode(Dict{Symbol, Any}(
    Symbol("Signature") => signature
)));
            url += string("?", auth);
            if functions.ccxtruthy(method == "POST")
                bodyRequest = nothing;
                if functions.ccxtruthy(isArrayParams)
                    bodyRequest = params;
                else
                    bodyRequest = query;
                end
                body = json(bodyRequest);
                headers = Dict{Symbol, Any}(
                    Symbol("Content-Type") => "application/json"
                );
            else
                headers = Dict{Symbol, Any}(
                    Symbol("Content-Type") => "application/x-www-form-urlencoded"
                );
            end
        else
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(query));
            end
        end
        url = string(self.implodeParams(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), Dict{Symbol, Any}(
    Symbol("hostname") => self.hostname
)), url);
    else
        type_var = safeString(api, 0);
        access = safeString(api, 1);
        levelOneNestedPath = safeString(api, 2);
        levelTwoNestedPath = safeString(api, 3);
        hostname = nothing;
        hostnames = safeValue(get(self.urls, Symbol("hostnames"), nothing), type_var);
        if functions.ccxtruthy(!isa(hostnames, AbstractString))
            hostnames = safeValue(hostnames, levelOneNestedPath);
            if functions.ccxtruthy(@functions.ccxt_and((!isa(hostnames, AbstractString)), (levelTwoNestedPath != nothing)))
                hostnames = safeValue(hostnames, levelTwoNestedPath);
            end
        end
        hostname = hostnames;
        url += self.implodeParams(path, params);
        if functions.ccxtruthy(access == "public")
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(query));
            end
        elseif functions.ccxtruthy(access == "private")
            self.checkRequiredCredentials();
            if functions.ccxtruthy(method == "POST")
                options = safeValue(self.options, "broker", Dict{Symbol, Any}());
                id = safeString(options, "id", "AA03022abc");
                if functions.ccxtruthy(!functions.ccxtruthy(isArrayParams))
                    if functions.ccxtruthy(@functions.ccxt_and(findfirst("cancel", path) === nothing, endswith(path, "order")))
                        channelCode = safeString(params, "channel_code");
                        if functions.ccxtruthy(channelCode == nothing)
                            params[Symbol("channel_code")] = id;
                        end
                    elseif functions.ccxtruthy(endswith(path, "orders/place"))
                        clientOrderId = safeString(params, "client-order-id");
                        if functions.ccxtruthy(clientOrderId == nothing)
                            params[Symbol("client-order-id")] = string(id, uuid());
                        end
                    end
                end
            end
            timestamp = self.ymdhms(self.nonce(), "T");
            request = Dict{Symbol, Any}(
                Symbol("SignatureMethod") => "HmacSHA256",
                Symbol("SignatureVersion") => "2",
                Symbol("AccessKeyId") => self.apiKey,
                Symbol("Timestamp") => timestamp
            );
            request = keysort(request);
            if functions.ccxtruthy(method != "POST")
                sortedQuery = keysort(query);
                request = extend(request, sortedQuery);
            end
            auth = replace(self.urlencode(request, true), "%2c" => "%2C");
            content2 = [method, hostname, url, auth];
            payload = join(content2, "\n");
            signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "base64");
            auth += string("&", self.urlencode(Dict{Symbol, Any}(
    Symbol("Signature") => signature
)));
            url += string("?", auth);
            if functions.ccxtruthy(method == "POST")
                bodyRequest = nothing;
                if functions.ccxtruthy(isArrayParams)
                    bodyRequest = params;
                else
                    bodyRequest = query;
                end
                body = json(bodyRequest);
                if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isArrayParams), (length(body) == 2)))
                    body = "{}";
                end
                headers = Dict{Symbol, Any}(
                    Symbol("Content-Type") => "application/json"
                );
            else
                headers = Dict{Symbol, Any}(
                    Symbol("Content-Type") => "application/x-www-form-urlencoded"
                );
            end
        end
        finalHostname = hostname;
        url = string(self.implodeParams(get(get(self.urls, Symbol("api"), nothing), Symbol(type_var), nothing), Dict{Symbol, Any}(
    Symbol("hostname") => finalHostname
)), url);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Htx, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    if functions.ccxtruthy(ccxt_in("status", response))
        status = safeString(response, "status");
        if functions.ccxtruthy(status == "error")
            code = safeString2(response, "err-code", "err_code");
            feedback = string(self.id, " ", body);
            self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
            message = safeString2(response, "err-msg", "err_msg");
            self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
            throw(ExchangeError(feedback));
        end
    end
    if functions.ccxtruthy(ccxt_in("code", response))
        feedback = string(self.id, " ", body);
        code = safeString(response, "code");
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), code, feedback);
    end
    data = self.safeDict(response, "data");
    errorsList = self.safeList(data, "errors");
    if functions.ccxtruthy(errorsList != nothing)
        first_var = self.safeDict(errorsList, 0);
        errcode = safeString(first_var, "err_code");
        errmessage = safeString(first_var, "err_msg");
        feedBack = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errcode, feedBack);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errmessage, feedBack);
    end
    return nothing

end
function fetchFundingHistory(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchFundingHistory", market, params);
    request = Dict{Symbol, Any}(
        Symbol("type") => "30,31"
    );
    (request, params) = self.handleUntilOption("end_time", request, params);
    if functions.ccxtruthy(since != nothing)
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            request[Symbol("start_time")] = since;
        else
            request[Symbol("start_date")] = since;
        end
    end
    response = nothing;
    if functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            marginMode = nothing;
            (marginMode, params) = self.handleMarginModeAndParams("fetchFundingHistory", params);
            marginMode = functions.ccxtruthy((marginMode == nothing)) ? "cross" : marginMode;
            request[Symbol("margin_mode")] = marginMode;
            request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
            if functions.ccxtruthy(limit != nothing)
                request[Symbol("limit")] = limit;
            end
            response = Base.fetch(self.contractPrivateGetV5AccountBills(extend(request, params)));
        else
            request[Symbol("contract")] = get(market, Symbol("id"), nothing);
            response = Base.fetch(self.contractPrivatePostSwapApiV3SwapFinancialRecordExact(extend(request, params)));
        end
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.contractPrivatePostApiV3ContractFinancialRecordExact(extend(request, params)));
    end
    data = self.safeList(response, "data", []);
    return self.parseIncomes(data, market, since, limit)

end
function setLeverage(self::Htx, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    (marketType, query) = self.handleMarketTypeAndParams("setLeverage", market, params);
    request = Dict{Symbol, Any}(
        Symbol("lever_rate") => leverage
    );
    if functions.ccxtruthy(@functions.ccxt_and(marketType == "future", get(market, Symbol("inverse"), nothing)))
        request[Symbol("symbol")] = get(market, Symbol("settleId"), nothing);
    else
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params);
        marginMode = functions.ccxtruthy((marginMode == nothing)) ? "cross" : marginMode;
        request[Symbol("margin_mode")] = marginMode;
        response = Base.fetch(self.contractPrivatePostV5PositionLever(extend(request, query)));
    else
        if functions.ccxtruthy(marketType == "future")
            response = Base.fetch(self.contractPrivatePostApiV1ContractSwitchLeverRate(extend(request, query)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.contractPrivatePostSwapApiV1SwapSwitchLeverRate(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " setLeverage() not support this market type")));
        end
    end
    return response

end
function parseIncome(self::Htx, income, market=nothing)
    marketId = safeString(income, "contract_code");
    symbol = self.safeSymbol(marketId, market);
    amount = self.safeNumber(income, "amount");
    timestamp = safeInteger2(income, "ts", "created_time");
    id = safeString(income, "id");
    currencyId = safeStringN(income, ["symbol", "asset", "currency"]);
    code = self.safeCurrencyCode(currencyId);
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => symbol,
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => id,
    Symbol("amount") => amount
)

end
function parsePosition(self::Htx, position, market=nothing)
    market = self.safeMarket(safeString(position, "contract_code"));
    symbol = get(market, Symbol("symbol"), nothing);
    contracts = safeString(position, "volume");
    contractSize = safeValue(market, "contractSize");
    contractSizeString = numberToString(contractSize);
    entryPrice = self.safeNumber2(position, "cost_open", "open_avg_price");
    initialMargin = safeString2(position, "position_margin", "initial_margin");
    rawSide = safeString(position, "direction");
    rawPositionSide = functions.ccxtruthy((rawSide == "buy")) ? "long" : "short";
    side = safeString(position, "position_side", rawPositionSide);
    unrealizedProfit = self.safeNumber(position, "profit_unreal");
    marginMode = safeString(position, "margin_mode");
    leverage = safeString(position, "lever_rate");
    percentage = stringMul(safeString(position, "profit_rate"), "100");
    lastPrice = safeString(position, "last_price");
    faceValue = stringMul(contracts, contractSizeString);
    notional = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        notional = stringMul(faceValue, lastPrice);
    else
        notional = stringDiv(faceValue, lastPrice);
        marginMode = "cross";
    end
    intialMarginPercentage = stringDiv(initialMargin, notional);
    collateral = safeString2(position, "margin_balance", "margin");
    adjustmentFactor = safeString(position, "adjust_factor");
    maintenanceMarginLinear = safeString(position, "maintenance_margin");
    marginRatioLinear = safeString(position, "margin_rate");
    maintenanceMarginPercentage = nothing;
    maintenanceMargin = nothing;
    marginRatio = nothing;
    maintenanceMarginPercentageResult = nothing;
    if functions.ccxtruthy(maintenanceMarginLinear == nothing)
        maintenanceMarginPercentage = stringDiv(adjustmentFactor, leverage);
        maintenanceMargin = stringMul(maintenanceMarginPercentage, notional);
        maintenanceMarginPercentageResult = self.parseNumber(maintenanceMarginPercentage);
    else
        maintenanceMargin = maintenanceMarginLinear;
    end
    if functions.ccxtruthy(marginRatioLinear == nothing)
        marginRatio = stringDiv(maintenanceMargin, collateral);
    else
        marginRatio = marginRatioLinear;
    end
    timestamp = safeInteger(position, "created_time");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("contracts") => self.parseNumber(contracts),
    Symbol("contractSize") => contractSize,
    Symbol("entryPrice") => entryPrice,
    Symbol("collateral") => self.parseNumber(collateral),
    Symbol("side") => side,
    Symbol("unrealizedPnl") => unrealizedProfit,
    Symbol("leverage") => self.parseNumber(leverage),
    Symbol("percentage") => self.parseNumber(percentage),
    Symbol("marginMode") => marginMode,
    Symbol("notional") => self.parseNumber(notional),
    Symbol("markPrice") => self.safeNumber(position, "mark_price"),
    Symbol("lastPrice") => self.parseNumber(lastPrice),
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidation_price"),
    Symbol("initialMargin") => self.parseNumber(initialMargin),
    Symbol("initialMarginPercentage") => self.parseNumber(intialMarginPercentage),
    Symbol("maintenanceMargin") => self.parseNumber(maintenanceMargin),
    Symbol("maintenanceMarginPercentage") => maintenanceMarginPercentageResult,
    Symbol("marginRatio") => self.parseNumber(marginRatio),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("hedged") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(position, "updated_time"),
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function fetchPositions(self::Htx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 0))
            first_var = safeString(symbols, 0);
            market = self.market(first_var);
        end
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchPositions", market, params, "linear");
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchPositions", market, params);
    if functions.ccxtruthy(marketType == "spot")
        marketType = "future";
    end
    response = nothing;
    if functions.ccxtruthy(subType == "linear")
        response = Base.fetch(self.contractPrivateGetV5TradePositionOpens(params));
    else
        if functions.ccxtruthy(marketType == "future")
            response = Base.fetch(self.contractPrivatePostApiV1ContractPositionInfo(params));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.contractPrivatePostSwapApiV1SwapPositionInfo(params));
        else
            throw(NotSupported(string(self.id, " fetchPositions() not support this market type")));
        end
    end
    data = safeValue(response, "data", []);
    timestamp = safeInteger(response, "ts");
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        position = get(data, i + 1, nothing);
        parsed = self.parsePosition(position);
        push!(result, extend(parsed, Dict{Symbol, Any}(
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", symbols, false)

end
function fetchPosition(self::Htx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchPosition", params);
    marginMode = functions.ccxtruthy((marginMode == nothing)) ? "cross" : marginMode;
    (marketType, query) = self.handleMarketTypeAndParams("fetchPosition", market, params);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("future"), nothing), get(market, Symbol("inverse"), nothing)))
        request[Symbol("symbol")] = get(market, Symbol("settleId"), nothing);
    else
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(get(market, Symbol("linear"), nothing)), (marginMode == "cross")))
            request[Symbol("margin_account")] = "USDT";
        end
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.contractPrivateGetV5TradePositionOpens(extend(request, query)));
    else
        if functions.ccxtruthy(marketType == "future")
            response = Base.fetch(self.contractPrivatePostApiV1ContractAccountPositionInfo(extend(request, query)));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.contractPrivatePostSwapApiV1SwapAccountPositionInfo(extend(request, query)));
        else
            throw(NotSupported(string(self.id, " setLeverage() not support this market type")));
        end
    end
    data = safeValue(response, "data");
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        linearPosition = self.safeDict(data, 0, Dict{Symbol, Any}());
            return self.parsePosition(linearPosition, market)
    end
    account = nothing;
    if functions.ccxtruthy(marginMode == "cross")
        account = data;
    else
        account = safeValue(data, 0);
    end
    omitted = omit(account, ["positions"]);
    positions = safeValue(account, "positions");
    position = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("future"), nothing), get(market, Symbol("inverse"), nothing)))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
            entry = get(positions, i + 1, nothing);
            if functions.ccxtruthy(get(entry, Symbol("contract_code"), nothing) == get(market, Symbol("id"), nothing))
                position = entry;
                break
            end
            i += 1
        end

    else
        position = safeValue(positions, 0);
    end
    timestamp = safeInteger(response, "ts");
    parsed = self.parsePosition(extend(position, omitted), market);
    parsed[Symbol("timestamp")] = timestamp;
    parsed[Symbol("datetime")] = self.iso8601(timestamp);
    return parsed

end
function parseLedgerEntryType(self::Htx, type_var)
    types = Dict{Symbol, Any}(
        Symbol("trade") => "trade",
        Symbol("etf") => "trade",
        Symbol("transact-fee") => "fee",
        Symbol("fee-deduction") => "fee",
        Symbol("transfer") => "transfer",
        Symbol("credit") => "credit",
        Symbol("liquidation") => "trade",
        Symbol("interest") => "credit",
        Symbol("deposit") => "deposit",
        Symbol("withdraw") => "withdrawal",
        Symbol("withdraw-fee") => "fee",
        Symbol("exchange") => "exchange",
        Symbol("other-types") => "transfer",
        Symbol("rebate") => "rebate"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Htx, item, currency=nothing)
    currencyId = safeString(item, "currency");
    code = self.safeCurrencyCode(currencyId, currency);
    currency = self.safeCurrency(currencyId, currency);
    id = safeString(item, "transactId");
    transferType = safeString(item, "transferType");
    timestamp = safeInteger(item, "transactTime");
    account = safeString(item, "accountId");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => id,
    Symbol("direction") => safeString(item, "direction"),
    Symbol("account") => account,
    Symbol("referenceId") => id,
    Symbol("referenceAccount") => account,
    Symbol("type") => self.parseLedgerEntryType(transferType),
    Symbol("currency") => code,
    Symbol("amount") => self.safeNumber(item, "transactAmt"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => nothing,
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency)

end
function fetchLedger(self::Htx, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchLedger", code, since, limit, params, 500))
    end
    accountId = Base.fetch(self.fetchAccountIdByType("spot", nothing, nothing, params));
    request = Dict{Symbol, Any}(
        Symbol("accountId") => accountId
    );
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = Base.fetch(self.spotPrivateGetV2AccountLedger(extend(request, params)));
    data = safeValue(response, "data", []);
    return self.parseLedger(data, currency, since, limit)

end
function fetchLeverageTiers(self::Htx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.contractPublicGetLinearSwapApiV1SwapAdjustfactor(params));
    data = self.safeList(response, "data", []);
    return self.parseLeverageTiers(data, symbols, "contract_code")

end
function parseMarketLeverageTiers(self::Htx, info, market=nothing)
    currencyId = safeString(info, "trade_partition");
    marketId = safeString(info, "contract_code");
    tiers = [];
    brackets = self.safeList(info, "list", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(brackets)))
        item = get(brackets, i + 1, nothing);
        leverage = safeString(item, "lever_rate");
        ladders = self.safeList(item, "ladders", []);
        k = 0
        while functions.ccxtruthy(functions.ccxt_lt(k, length(ladders)))
            bracket = get(ladders, k + 1, nothing);
            adjustFactor = safeString(bracket, "adjust_factor");
            push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => safeInteger(bracket, "ladder"),
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "swap"),
    Symbol("currency") => self.safeCurrencyCode(currencyId),
    Symbol("minNotional") => self.safeNumber(bracket, "min_size"),
    Symbol("maxNotional") => self.safeNumber(bracket, "max_size"),
    Symbol("maintenanceMarginRate") => self.parseNumber(stringDiv(adjustFactor, leverage)),
    Symbol("maxLeverage") => self.parseNumber(leverage),
    Symbol("info") => bracket
));
            k += 1
        end
        i += 1
    end
    return tiers

end
function fetchOpenInterestHistory(self::Htx, symbol, timeframe="1h", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(timeframe != "1h", timeframe != "4h"), timeframe != "12h"), timeframe != "1d"))
        throw(BadRequest(string(self.id, " fetchOpenInterestHistory cannot only use the 1h, 4h, 12h and 1d timeframe")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    timeframes = Dict{Symbol, Any}(
        Symbol("1h") => "60min",
        Symbol("4h") => "4hour",
        Symbol("12h") => "12hour",
        Symbol("1d") => "1day"
    );
    market = self.market(symbol);
    amountType = safeInteger2(params, "amount_type", "amountType", 2);
    request = Dict{Symbol, Any}(
        Symbol("period") => get(timeframes, Symbol(timeframe), nothing),
        Symbol("amount_type") => amountType
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("future"), nothing))
        request[Symbol("contract_type")] = safeString(get(market, Symbol("info"), nothing), "contract_type");
        request[Symbol("symbol")] = get(market, Symbol("baseId"), nothing);
        response = Base.fetch(self.contractPublicGetApiV1ContractHisOpenInterest(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        request[Symbol("contract_type")] = "swap";
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.contractPublicGetLinearSwapApiV1SwapHisOpenInterest(extend(request, params)));
    else
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.contractPublicGetSwapApiV1SwapHisOpenInterest(extend(request, params)));
    end
    data = safeValue(response, "data");
    tick = self.safeList(data, "tick");
    return self.parseOpenInterestsHistory(tick, market, since, limit)

end
function fetchOpenInterests(self::Htx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 0))
            first_var = safeString(symbols, 0);
            market = self.market(first_var);
        end
    end
    request = Dict{Symbol, Any}();
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchOpenInterests", market, params, "linear");
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOpenInterests", market, params);
    response = nothing;
    if functions.ccxtruthy(marketType == "future")
        response = Base.fetch(self.contractPublicGetApiV1ContractOpenInterest(extend(request, params)));
    elseif functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.contractPublicGetSwapApiV1SwapOpenInterest(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchOpenInterests() does not currently support linear markets")));
    end
    data = self.safeList(response, "data", []);
    return self.parseOpenInterests(data, symbols)

end
function fetchOpenInterest(self::Htx, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchOpenInterest() supports contract markets only")));
    end
    if functions.ccxtruthy(get(market, Symbol("option"), nothing))
        throw(NotSupported(string(self.id, " fetchOpenInterest() does not currently support option markets")));
    end
    request = Dict{Symbol, Any}(
        Symbol("contract_code") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("future"), nothing))
        request[Symbol("contract_type")] = safeString(get(market, Symbol("info"), nothing), "contract_type");
        request[Symbol("symbol")] = get(market, Symbol("baseId"), nothing);
        response = Base.fetch(self.contractPublicGetApiV1ContractOpenInterest(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.contractPublicGetV5MarketOpenInterest(extend(request, params)));
    else
        response = Base.fetch(self.contractPublicGetSwapApiV1SwapOpenInterest(extend(request, params)));
    end
    timestamp = safeInteger(response, "ts");
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        result = self.safeDict(response, "data", Dict{Symbol, Any}());
            return extend(self.parseOpenInterest(result, market), Dict{Symbol, Any}(
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))
    end
    data = safeValue(response, "data", []);
    openInterest = self.parseOpenInterest(get(data, 1, nothing), market);
    openInterest[Symbol("timestamp")] = timestamp;
    openInterest[Symbol("datetime")] = self.iso8601(timestamp);
    return openInterest

end
function parseOpenInterest(self::Htx, interest, market=nothing)
    timestamp = safeInteger(interest, "ts");
    amount = self.safeNumber(interest, "volume");
    value = self.safeNumber(interest, "value");
    marketId = safeString(interest, "contract_code");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("baseVolume") => amount,
    Symbol("quoteVolume") => value,
    Symbol("openInterestAmount") => amount,
    Symbol("openInterestValue") => value,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market)

end
function borrowIsolatedMargin(self::Htx, symbol, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privatePostMarginOrders(extend(request, params)));
    transaction = self.parseMarginLoan(response, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("symbol") => symbol
))

end
function borrowCrossMargin(self::Htx, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.privatePostCrossMarginOrders(extend(request, params)));
    transaction = self.parseMarginLoan(response, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount
))

end
function repayIsolatedMargin(self::Htx, symbol, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountId = Base.fetch(self.fetchAccountIdByType("spot", "isolated", symbol, params));
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("accountId") => accountId
    );
    response = Base.fetch(self.v2PrivatePostAccountRepayment(extend(request, params)));
    data = safeValue(response, "Data", []);
    loan = safeValue(data, 0);
    transaction = self.parseMarginLoan(loan, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount,
    Symbol("symbol") => symbol
))

end
function repayCrossMargin(self::Htx, code, amount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountId = Base.fetch(self.fetchAccountIdByType("spot", "cross", nothing, params));
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("accountId") => accountId
    );
    response = Base.fetch(self.v2PrivatePostAccountRepayment(extend(request, params)));
    data = safeValue(response, "Data", []);
    loan = safeValue(data, 0);
    transaction = self.parseMarginLoan(loan, currency);
    return extend(transaction, Dict{Symbol, Any}(
    Symbol("amount") => amount
))

end
function parseMarginLoan(self::Htx, info, currency=nothing)
    timestamp = safeInteger(info, "repayTime");
    return Dict{Symbol, Any}(
    Symbol("id") => safeString2(info, "repayId", "data"),
    Symbol("currency") => self.safeCurrencyCode(nothing, currency),
    Symbol("amount") => nothing,
    Symbol("symbol") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
function fetchSettlementHistory(self::Htx, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchSettlementHistory() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("future"), nothing))
        request[Symbol("symbol")] = get(market, Symbol("baseId"), nothing);
    else
        request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(@functions.ccxt_and(get(market, Symbol("linear"), nothing), get(market, Symbol("swap"), nothing)))
            request[Symbol("limit")] = limit;
        else
            request[Symbol("page_size")] = limit;
        end
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.contractPublicGetV5MarketSettlementHistory(extend(request, params)));
        else
            response = Base.fetch(self.contractPublicGetSwapApiV1SwapSettlementRecords(extend(request, params)));
        end
    else
        response = Base.fetch(self.contractPublicGetApiV1ContractSettlementRecords(extend(request, params)));
    end
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        dataLinear = self.safeList(response, "data", []);
        settlementsLinear = self.parseSettlements(dataLinear, market);
            return sortBy(settlementsLinear, "timestamp")
    end
    data = safeValue(response, "data");
    settlementRecord = safeValue(data, "settlement_record");
    settlements = self.parseSettlements(settlementRecord, market);
    return sortBy(settlements, "timestamp")

end
function fetchDepositWithdrawFees(self::Htx, codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.spotPublicGetV2ReferenceCurrencies(params));
    data = self.safeList(response, "data");
    return self.parseDepositWithdrawFees(data, codes, "currency")

end
function parseDepositWithdrawFee(self::Htx, fee, currency=nothing)
    chains = safeValue(fee, "chains", []);
    code = safeString(currency, "code");
    result = self.depositWithdrawFee(fee);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(chains)))
        chainEntry = get(chains, j + 1, nothing);
        networkId = safeString(chainEntry, "chain");
        withdrawFeeType = safeString(chainEntry, "withdrawFeeType");
        networkCode = self.networkIdToCode(networkId, code);
        withdrawFee = nothing;
        withdrawResult = nothing;
        if functions.ccxtruthy(withdrawFeeType == "fixed")
            withdrawFee = self.safeNumber(chainEntry, "transactFeeWithdraw");
            withdrawResult = Dict{Symbol, Any}(
                Symbol("fee") => withdrawFee,
                Symbol("percentage") => false
            );
        else
            withdrawFee = self.safeNumber(chainEntry, "transactFeeRateWithdraw");
            withdrawResult = Dict{Symbol, Any}(
                Symbol("fee") => withdrawFee,
                Symbol("percentage") => true
            );
        end
        result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("withdraw") => withdrawResult,
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("fee") => nothing,
                Symbol("percentage") => nothing
            )
        );
        result = self.assignDefaultDepositWithdrawFees(result, currency);
        j += 1
    end
    return result

end
function parseSettlements(self::Htx, settlements, market)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(settlements)))
        settlement = get(settlements, i + 1, nothing);
        list = safeValue(settlement, "list");
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            parsedSettlement = self.parseSettlement(settlement, market);
                        push!(result, parsedSettlement);
        elseif functions.ccxtruthy(list != nothing)
            timestamp = safeInteger(settlement, "settlement_time");
            timestampDetails = Dict{Symbol, Any}(
                Symbol("timestamp") => timestamp,
                Symbol("datetime") => self.iso8601(timestamp)
            );
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(list)))
                item = get(list, j + 1, nothing);
                parsedSettlement = self.parseSettlement(item, market);
                push!(result, extend(parsedSettlement, timestampDetails));
                j += 1
            end
        else
            push!(result, self.parseSettlement(get(settlements, i + 1, nothing), market));
        end
        i += 1
    end
    return result

end
function parseSettlement(self::Htx, settlement, market)
    timestamp = safeInteger(settlement, "settlement_time");
    marketId = safeString(settlement, "contract_code");
    return Dict{Symbol, Any}(
    Symbol("info") => settlement,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("price") => self.safeNumber(settlement, "settlement_price"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function fetchLiquidations(self::Htx, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    tradeType = safeInteger2(params, "trade_type", "tradeType", 0);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("linear"), nothing)))
        request[Symbol("trade_type")] = tradeType;
    end
    params = omit(params, ["trade_type", "tradeType"]);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_time")] = since;
    end
    (request, params) = self.handleUntilOption("end_time", request, params);
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            request[Symbol("contract_code")] = get(market, Symbol("id"), nothing);
            if functions.ccxtruthy(limit != nothing)
                request[Symbol("limit")] = limit;
            end
            response = Base.fetch(self.contractPublicGetV5MarketLiquidationOrders(extend(request, params)));
        else
            request[Symbol("contract")] = get(market, Symbol("id"), nothing);
            response = Base.fetch(self.contractPublicGetSwapApiV3SwapLiquidationOrders(extend(request, params)));
        end
    elseif functions.ccxtruthy(get(market, Symbol("future"), nothing))
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.contractPublicGetApiV3ContractLiquidationOrders(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchLiquidations() does not support ", get(market, Symbol("type"), nothing), " orders")));
    end
    data = self.safeList(response, "data", []);
    return self.parseLiquidations(data, market, since, limit)

end
function parseLiquidation(self::Htx, liquidation, market=nothing)
    marketId = safeString(liquidation, "contract_code");
    timestamp = safeInteger2(liquidation, "created_at", "liquidation_time");
    return self.safeLiquidation(Dict{Symbol, Any}(
    Symbol("info") => liquidation,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("contracts") => self.safeNumber(liquidation, "volume"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("price") => self.safeNumber2(liquidation, "price", "bankrupt_price"),
    Symbol("side") => safeStringLower2(liquidation, "direction", "side"),
    Symbol("baseValue") => self.safeNumber(liquidation, "amount"),
    Symbol("quoteValue") => self.safeNumber(liquidation, "trade_turnover"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
))

end
function closePosition(self::Htx, symbol, side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " closePosition() symbol supports contract markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("contract_code") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("client_order_id")] = clientOrderId;
        params = omit(params, "clientOrderId");
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("closePosition", params, "cross");
        request[Symbol("margin_mode")] = marginMode;
        response = Base.fetch(self.contractPrivatePostV5TradePosition(extend(request, params)));
    else
        self.checkRequiredArgument("closePosition", side, "side");
        amount = safeString2(params, "volume", "amount");
        if functions.ccxtruthy(amount == nothing)
            throw(ArgumentsRequired(string(self.id, " closePosition () requires an extra argument params[\"amount\"] for inverse markets")));
        end
        request[Symbol("volume")] = self.amountToPrecision(symbol, amount);
        request[Symbol("direction")] = side;
        params = omit(params, ["volume", "amount"]);
        if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
            response = Base.fetch(self.contractPrivatePostSwapApiV1SwapLightningClosePosition(extend(request, params)));
        else
            response = Base.fetch(self.contractPrivatePostApiV1LightningClosePosition(extend(request, params)));
        end
    end
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        data = self.safeDict(response, "data", Dict{Symbol, Any}());
            return self.parseOrder(data, market)
    end
    return self.parseOrder(response, market)

end
function setPositionMode(self::Htx, hedged, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    posMode = functions.ccxtruthy(hedged) ? "dual_side" : "single_side";
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}(
        Symbol("position_mode") => posMode
    );
    if functions.ccxtruthy(@functions.ccxt_and((market != nothing), (get(market, Symbol("inverse"), nothing))))
        throw(BadRequest(string(self.id, " setPositionMode can only be used for linear markets")));
    end
    response = Base.fetch(self.contractPrivatePostV5PositionMode(extend(request, params)));
    return response

end
function fetchPositionsADLRank(self::Htx, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols, nothing, true, true, true);
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 0))
            first_var = safeString(symbols, 0);
            market = self.market(first_var);
        end
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchPositionsADLRank", market, params, "linear");
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchPositionsADLRank", market, params);
    if functions.ccxtruthy(marketType == "spot")
        marketType = "future";
    end
    response = nothing;
    if functions.ccxtruthy(subType == "linear")
        response = Base.fetch(self.contractPrivateGetV5TradePositionOpens(params));
    else
        if functions.ccxtruthy(marketType == "future")
            response = Base.fetch(self.contractPrivatePostApiV1ContractPositionInfo(params));
        elseif functions.ccxtruthy(marketType == "swap")
            response = Base.fetch(self.contractPrivatePostSwapApiV1SwapPositionInfo(params));
        else
            throw(NotSupported(string(self.id, " fetchPositionsADLRank() not support this market type")));
        end
    end
    data = self.safeList(response, "data", []);
    return self.parseADLRanks(data, symbols)

end
function parseADLRank(self::Htx, info, market=nothing)
    marketId = safeString(info, "contract_code");
    timestamp = safeInteger(info, "created_time");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market, nothing, "contract"),
    Symbol("rank") => safeInteger(info, "adl_risk_percent"),
    Symbol("rating") => nothing,
    Symbol("percentage") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Htx, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function v2PublicGetReferenceCurrencies(self::Htx, params=Dict(), context=Dict())
    return request(self, "reference/currencies", "v2Public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PublicGetMarketStatus(self::Htx, params=Dict(), context=Dict())
    return request(self, "market-status", "v2Public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountLedger(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/ledger", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountWithdrawQuota(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/withdraw/quota", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountWithdrawAddress(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/withdraw/address", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountDepositAddress(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/deposit/address", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountRepayment(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/repayment", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2PrivateGetReferenceTransactFeeRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "reference/transact-fee-rate", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAccountAssetValuation(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/asset-valuation", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function v2PrivateGetPointAccount(self::Htx, params=Dict(), context=Dict())
    return request(self, "point/account", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2PrivateGetSubUserUserList(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/user-list", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetSubUserUserState(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/user-state", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetSubUserAccountList(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/account-list", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetSubUserDepositAddress(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/deposit-address", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetSubUserQueryDeposit(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/query-deposit", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetUserApiKey(self::Htx, params=Dict(), context=Dict())
    return request(self, "user/api-key", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetUserUid(self::Htx, params=Dict(), context=Dict())
    return request(self, "user/uid", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAlgoOrdersOpening(self::Htx, params=Dict(), context=Dict())
    return request(self, "algo-orders/opening", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAlgoOrdersHistory(self::Htx, params=Dict(), context=Dict())
    return request(self, "algo-orders/history", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetAlgoOrdersSpecific(self::Htx, params=Dict(), context=Dict())
    return request(self, "algo-orders/specific", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetC2cOffers(self::Htx, params=Dict(), context=Dict())
    return request(self, "c2c/offers", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetC2cOffer(self::Htx, params=Dict(), context=Dict())
    return request(self, "c2c/offer", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetC2cTransactions(self::Htx, params=Dict(), context=Dict())
    return request(self, "c2c/transactions", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetC2cRepayment(self::Htx, params=Dict(), context=Dict())
    return request(self, "c2c/repayment", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetC2cAccount(self::Htx, params=Dict(), context=Dict())
    return request(self, "c2c/account", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetEtpReference(self::Htx, params=Dict(), context=Dict())
    return request(self, "etp/reference", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetEtpTransactions(self::Htx, params=Dict(), context=Dict())
    return request(self, "etp/transactions", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2PrivateGetEtpTransaction(self::Htx, params=Dict(), context=Dict())
    return request(self, "etp/transaction", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2PrivateGetEtpRebalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "etp/rebalance", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivateGetEtpLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "etp/limit", "v2Private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostAccountTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/transfer", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostAccountRepayment(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/repayment", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2PrivatePostPointTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "point/transfer", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2PrivatePostSubUserManagement(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/management", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSubUserCreation(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/creation", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSubUserTradableMarket(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/tradable-market", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSubUserTransferability(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/transferability", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSubUserApiKeyGeneration(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/api-key-generation", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSubUserApiKeyModification(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/api-key-modification", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSubUserApiKeyDeletion(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/api-key-deletion", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostSubUserDeductMode(self::Htx, params=Dict(), context=Dict())
    return request(self, "sub-user/deduct-mode", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostAlgoOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "algo-orders", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostAlgoOrdersCancelAllAfter(self::Htx, params=Dict(), context=Dict())
    return request(self, "algo-orders/cancel-all-after", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostAlgoOrdersCancellation(self::Htx, params=Dict(), context=Dict())
    return request(self, "algo-orders/cancellation", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostC2cOffer(self::Htx, params=Dict(), context=Dict())
    return request(self, "c2c/offer", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostC2cCancellation(self::Htx, params=Dict(), context=Dict())
    return request(self, "c2c/cancellation", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostC2cCancelAll(self::Htx, params=Dict(), context=Dict())
    return request(self, "c2c/cancel-all", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostC2cRepayment(self::Htx, params=Dict(), context=Dict())
    return request(self, "c2c/repayment", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostC2cTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "c2c/transfer", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function v2PrivatePostEtpCreation(self::Htx, params=Dict(), context=Dict())
    return request(self, "etp/creation", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2PrivatePostEtpRedemption(self::Htx, params=Dict(), context=Dict())
    return request(self, "etp/redemption", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function v2PrivatePostEtpTransactIdCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "etp/{transactId}/cancel", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function v2PrivatePostEtpBatchCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "etp/batch-cancel", "v2Private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function publicGetCommonSymbols(self::Htx, params=Dict(), context=Dict())
    return request(self, "common/symbols", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetCommonCurrencys(self::Htx, params=Dict(), context=Dict())
    return request(self, "common/currencys", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetCommonTimestamp(self::Htx, params=Dict(), context=Dict())
    return request(self, "common/timestamp", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetCommonExchange(self::Htx, params=Dict(), context=Dict())
    return request(self, "common/exchange", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicGetSettingsCurrencys(self::Htx, params=Dict(), context=Dict())
    return request(self, "settings/currencys", "public", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAccountAccounts(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/accounts", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function privateGetAccountAccountsIdBalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/accounts/{id}/balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function privateGetAccountAccountsSubUid(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/accounts/{sub-uid}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetAccountHistory(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function privateGetCrossMarginLoanInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "cross-margin/loan-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetMarginLoanInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "margin/loan-info", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetFeeFeeRateGet(self::Htx, params=Dict(), context=Dict())
    return request(self, "fee/fee-rate/get", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetOrderOpenOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/openOrders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function privateGetOrderOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function privateGetOrderOrdersId(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/orders/{id}", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function privateGetOrderOrdersIdMatchresults(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/orders/{id}/matchresults", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function privateGetOrderOrdersGetClientOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/orders/getClientOrder", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function privateGetOrderHistory(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/history", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetOrderMatchresults(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/matchresults", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetQueryDepositWithdraw(self::Htx, params=Dict(), context=Dict())
    return request(self, "query/deposit-withdraw", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetMarginLoanOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "margin/loan-orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function privateGetMarginAccountsBalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "margin/accounts/balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function privateGetCrossMarginLoanOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "cross-margin/loan-orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetCrossMarginAccountsBalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "cross-margin/accounts/balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetPointsActions(self::Htx, params=Dict(), context=Dict())
    return request(self, "points/actions", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetPointsOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "points/orders", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetSubuserAggregateBalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "subuser/aggregate-balance", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateGetStableCoinExchangeRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "stable-coin/exchange_rate", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateGetStableCoinQuote(self::Htx, params=Dict(), context=Dict())
    return request(self, "stable-coin/quote", "private", "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostAccountTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "account/transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostFuturesTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "futures/transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostOrderBatchOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/batch-orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function privatePostOrderOrdersPlace(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/orders/place", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function privatePostOrderOrdersSubmitCancelClientOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/orders/submitCancelClientOrder", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function privatePostOrderOrdersBatchCancelOpenOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/orders/batchCancelOpenOrders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function privatePostOrderOrdersIdSubmitcancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/orders/{id}/submitcancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function privatePostOrderOrdersBatchcancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "order/orders/batchcancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function privatePostDwWithdrawApiCreate(self::Htx, params=Dict(), context=Dict())
    return request(self, "dw/withdraw/api/create", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostDwWithdrawVirtualIdCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "dw/withdraw-virtual/{id}/cancel", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostDwTransferInMargin(self::Htx, params=Dict(), context=Dict())
    return request(self, "dw/transfer-in/margin", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostDwTransferOutMargin(self::Htx, params=Dict(), context=Dict())
    return request(self, "dw/transfer-out/margin", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostMarginOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "margin/orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostMarginOrdersIdRepay(self::Htx, params=Dict(), context=Dict())
    return request(self, "margin/orders/{id}/repay", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privatePostCrossMarginTransferIn(self::Htx, params=Dict(), context=Dict())
    return request(self, "cross-margin/transfer-in", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostCrossMarginTransferOut(self::Htx, params=Dict(), context=Dict())
    return request(self, "cross-margin/transfer-out", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostCrossMarginOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "cross-margin/orders", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostCrossMarginOrdersIdRepay(self::Htx, params=Dict(), context=Dict())
    return request(self, "cross-margin/orders/{id}/repay", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostStableCoinExchange(self::Htx, params=Dict(), context=Dict())
    return request(self, "stable-coin/exchange", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privatePostSubuserTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "subuser/transfer", "private", "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function statusPublicSpotGetApiV2SummaryJson(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v2/summary.json", ["status", "public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function statusPublicFutureInverseGetApiV2SummaryJson(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v2/summary.json", ["status", "public", "future", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function statusPublicFutureLinearGetApiV2SummaryJson(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v2/summary.json", ["status", "public", "future", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function statusPublicSwapInverseGetApiV2SummaryJson(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v2/summary.json", ["status", "public", "swap", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function statusPublicSwapLinearGetApiV2SummaryJson(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v2/summary.json", ["status", "public", "swap", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV2MarketStatus(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/market-status", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV1CommonSymbols(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/common/symbols", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV1CommonCurrencys(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/common/currencys", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV2SettingsCommonCurrencies(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/settings/common/currencies", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV2ReferenceCurrencies(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/reference/currencies", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV1CommonTimestamp(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/common/timestamp", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV1CommonExchange(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/common/exchange", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV1SettingsCommonChains(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/settings/common/chains", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV1SettingsCommonCurrencys(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/settings/common/currencys", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV1SettingsCommonSymbols(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/settings/common/symbols", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV2SettingsCommonSymbols(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/settings/common/symbols", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV1SettingsCommonMarketSymbols(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/settings/common/market-symbols", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetMarketHistoryCandles(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/history/candles", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetMarketHistoryKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/history/kline", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetMarketDetailMerged(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/detail/merged", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetMarketTickers(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/tickers", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetMarketDetail(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/detail", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetMarketDepth(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/depth", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetMarketTrade(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/trade", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetMarketHistoryTrade(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/history/trade", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetMarketEtp(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/etp", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV2EtpReference(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/etp/reference", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPublicGetV2EtpRebalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/etp/rebalance", ["spot", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1AccountAccounts(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/account/accounts", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function spotPrivateGetV1AccountAccountsAccountIdBalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/account/accounts/{account-id}/balance", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function spotPrivateGetV2AccountValuation(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/account/valuation", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2AccountAssetValuation(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/account/asset-valuation", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function spotPrivateGetV1AccountHistory(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/account/history", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function spotPrivateGetV2AccountLedger(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/account/ledger", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2PointAccount(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/point/account", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function spotPrivateGetV2AccountDepositAddress(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/account/deposit/address", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2AccountWithdrawQuota(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/account/withdraw/quota", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2AccountWithdrawAddress(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/account/withdraw/address", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2ReferenceCurrencies(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/reference/currencies", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1QueryDepositWithdraw(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/query/deposit-withdraw", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1QueryWithdrawClientOrderId(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/query/withdraw/client-order-id", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2UserApiKey(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/user/api-key", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2UserUid(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/user/uid", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2SubUserUserList(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/user-list", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2SubUserUserState(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/user-state", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2SubUserAccountList(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/account-list", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2SubUserDepositAddress(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/deposit-address", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2SubUserQueryDeposit(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/query-deposit", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1SubuserAggregateBalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/subuser/aggregate-balance", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function spotPrivateGetV1AccountAccountsSubUid(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/account/accounts/{sub-uid}", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1OrderOpenOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/openOrders", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function spotPrivateGetV1OrderOrdersOrderId(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/orders/{order-id}", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function spotPrivateGetV1OrderOrdersGetClientOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/orders/getClientOrder", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function spotPrivateGetV1OrderOrdersOrderIdMatchresult(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/orders/{order-id}/matchresult", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function spotPrivateGetV1OrderOrdersOrderIdMatchresults(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/orders/{order-id}/matchresults", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function spotPrivateGetV1OrderOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/orders", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function spotPrivateGetV1OrderHistory(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/history", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1OrderMatchresults(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/matchresults", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2ReferenceTransactFeeRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/reference/transact-fee-rate", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2AlgoOrdersOpening(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/algo-orders/opening", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2AlgoOrdersHistory(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/algo-orders/history", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2AlgoOrdersSpecific(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/algo-orders/specific", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1MarginLoanInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/margin/loan-info", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1MarginLoanOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/margin/loan-orders", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function spotPrivateGetV1MarginAccountsBalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/margin/accounts/balance", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function spotPrivateGetV1CrossMarginLoanInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/cross-margin/loan-info", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1CrossMarginLoanOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/cross-margin/loan-orders", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1CrossMarginAccountsBalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/cross-margin/accounts/balance", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2AccountRepayment(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/account/repayment", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function spotPrivateGetV5AccountUniversalTransferRecords(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/account/universal_transfer_records", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 4))
end

function spotPrivateGetV1StableCoinQuote(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/stable-coin/quote", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV1StableCoinExchangeRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/stable_coin/exchange_rate", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivateGetV2EtpTransactions(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/etp/transactions", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function spotPrivateGetV2EtpTransaction(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/etp/transaction", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function spotPrivateGetV2EtpLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/etp/limit", ["spot", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV1AccountTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/account/transfer", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV1FuturesTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/futures/transfer", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2PointTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/point/transfer", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function spotPrivatePostV2AccountTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/account/transfer", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV1DwWithdrawApiCreate(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/dw/withdraw/api/create", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV1DwWithdrawVirtualWithdrawIdCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/dw/withdraw-virtual/{withdraw-id}/cancel", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2SubUserDeductMode(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/deduct-mode", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2SubUserCreation(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/creation", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2SubUserManagement(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/management", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2SubUserTradableMarket(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/tradable-market", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2SubUserTransferability(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/transferability", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2SubUserApiKeyGeneration(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/api-key-generation", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2SubUserApiKeyModification(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/api-key-modification", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2SubUserApiKeyDeletion(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/sub-user/api-key-deletion", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV1SubuserTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/subuser/transfer", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function spotPrivatePostV1TrustUserActiveCredit(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/trust/user/active/credit", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function spotPrivatePostV1OrderOrdersPlace(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/orders/place", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function spotPrivatePostV1OrderBatchOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/batch-orders", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function spotPrivatePostV1OrderAutoPlace(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/auto/place", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function spotPrivatePostV1OrderOrdersOrderIdSubmitcancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/orders/{order-id}/submitcancel", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function spotPrivatePostV1OrderOrdersSubmitCancelClientOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/orders/submitCancelClientOrder", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function spotPrivatePostV1OrderOrdersBatchCancelOpenOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/orders/batchCancelOpenOrders", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function spotPrivatePostV1OrderOrdersBatchcancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/order/orders/batchcancel", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.4))
end

function spotPrivatePostV2AlgoOrdersCancelAllAfter(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/algo-orders/cancel-all-after", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2AlgoOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/algo-orders", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2AlgoOrdersCancellation(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/algo-orders/cancellation", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2AccountRepayment(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/account/repayment", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function spotPrivatePostV1DwTransferInMargin(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/dw/transfer-in/margin", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function spotPrivatePostV1DwTransferOutMargin(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/dw/transfer-out/margin", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function spotPrivatePostV1MarginOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/margin/orders", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function spotPrivatePostV1MarginOrdersOrderIdRepay(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/margin/orders/{order-id}/repay", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function spotPrivatePostV1CrossMarginTransferIn(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/cross-margin/transfer-in", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV1CrossMarginTransferOut(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/cross-margin/transfer-out", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV1CrossMarginOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/cross-margin/orders", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV1CrossMarginOrdersOrderIdRepay(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/cross-margin/orders/{order-id}/repay", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV1StableCoinExchange(self::Htx, params=Dict(), context=Dict())
    return request(self, "v1/stable-coin/exchange", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function spotPrivatePostV2EtpCreation(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/etp/creation", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function spotPrivatePostV2EtpRedemption(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/etp/redemption", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 5))
end

function spotPrivatePostV2EtpTransactIdCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/etp/{transactId}/cancel", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function spotPrivatePostV2EtpBatchCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/etp/batch-cancel", ["spot", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 50))
end

function contractPublicGetApiV1Timestamp(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/timestamp", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetHeartbeat(self::Htx, params=Dict(), context=Dict())
    return request(self, "heartbeat/", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractContractInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_contract_info", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractIndex(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_index", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractQueryElements(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_query_elements", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractPriceLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_price_limit", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractOpenInterest(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_open_interest", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractDeliveryPrice(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_delivery_price", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetMarketDepth(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/depth", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetMarketBbo(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/bbo", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetMarketHistoryKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/history/kline", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistoryMarkPriceKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/mark_price_kline", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetMarketDetailMerged(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/detail/merged", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetMarketDetailBatchMerged(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/detail/batch_merged", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetV2MarketDetailBatchMerged(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/market/detail/batch_merged", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetMarketTrade(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/trade", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetMarketHistoryTrade(self::Htx, params=Dict(), context=Dict())
    return request(self, "market/history/trade", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractRiskInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_risk_info", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractInsuranceFund(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_insurance_fund", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractAdjustfactor(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_adjustfactor", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractHisOpenInterest(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_his_open_interest", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractLadderMargin(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_ladder_margin", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractApiState(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_api_state", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractEliteAccountRatio(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_elite_account_ratio", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractElitePositionRatio(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_elite_position_ratio", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractLiquidationOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_liquidation_orders", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractSettlementRecords(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_settlement_records", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistoryIndex(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/index", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistoryBasis(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/basis", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV1ContractEstimatedSettlementPrice(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_estimated_settlement_price", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetApiV3ContractLiquidationOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v3/contract_liquidation_orders", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapContractInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_contract_info", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapIndex(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_index", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapQueryElements(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_query_elements", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapPriceLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_price_limit", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapOpenInterest(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_open_interest", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapExMarketDepth(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-ex/market/depth", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapExMarketBbo(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-ex/market/bbo", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapExMarketHistoryKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-ex/market/history/kline", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistorySwapMarkPriceKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/swap_mark_price_kline", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapExMarketDetailMerged(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-ex/market/detail/merged", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetV2SwapExMarketDetailBatchMerged(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/swap-ex/market/detail/batch_merged", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistorySwapPremiumIndexKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/swap_premium_index_kline", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapExMarketDetailBatchMerged(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-ex/market/detail/batch_merged", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapExMarketTrade(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-ex/market/trade", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapExMarketHistoryTrade(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-ex/market/history/trade", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapRiskInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_risk_info", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapInsuranceFund(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_insurance_fund", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapAdjustfactor(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_adjustfactor", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapHisOpenInterest(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_his_open_interest", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapLadderMargin(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_ladder_margin", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapApiState(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_api_state", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapEliteAccountRatio(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_elite_account_ratio", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapElitePositionRatio(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_elite_position_ratio", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapEstimatedSettlementPrice(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_estimated_settlement_price", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapLiquidationOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_liquidation_orders", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapSettlementRecords(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_settlement_records", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapFundingRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_funding_rate", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapBatchFundingRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_batch_funding_rate", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1SwapHistoricalFundingRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_historical_funding_rate", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV3SwapLiquidationOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v3/swap_liquidation_orders", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistorySwapEstimatedRateKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/swap_estimated_rate_kline", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistorySwapBasis(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/swap_basis", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapContractInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_contract_info", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapIndex(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_index", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapQueryElements(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_query_elements", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapPriceLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_price_limit", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapExMarketDepth(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-ex/market/depth", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapExMarketBbo(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-ex/market/bbo", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapExMarketHistoryKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-ex/market/history/kline", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistoryLinearSwapMarkPriceKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/linear_swap_mark_price_kline", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapExMarketDetailMerged(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-ex/market/detail/merged", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapExMarketDetailBatchMerged(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-ex/market/detail/batch_merged", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetV2LinearSwapExMarketDetailBatchMerged(self::Htx, params=Dict(), context=Dict())
    return request(self, "v2/linear-swap-ex/market/detail/batch_merged", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapExMarketTrade(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-ex/market/trade", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapExMarketHistoryTrade(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-ex/market/history/trade", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetSwapApiV1LinearSwapApiV1SwapInsuranceFund(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/linear-swap-api/v1/swap_insurance_fund", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapAdjustfactor(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_adjustfactor", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapCrossAdjustfactor(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_cross_adjustfactor", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapHisOpenInterest(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_his_open_interest", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapLadderMargin(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_ladder_margin", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapCrossLadderMargin(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_cross_ladder_margin", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapApiState(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_api_state", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapEliteAccountRatio(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_elite_account_ratio", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapElitePositionRatio(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_elite_position_ratio", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapSettlementRecords(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_settlement_records", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV3SwapLiquidationOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v3/swap_liquidation_orders", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistoryLinearSwapPremiumIndexKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/linear_swap_premium_index_kline", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistoryLinearSwapEstimatedRateKline(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/linear_swap_estimated_rate_kline", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetIndexMarketHistoryLinearSwapBasis(self::Htx, params=Dict(), context=Dict())
    return request(self, "index/market/history/linear_swap_basis", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetLinearSwapApiV1SwapEstimatedSettlementPrice(self::Htx, params=Dict(), context=Dict())
    return request(self, "linear-swap-api/v1/swap_estimated_settlement_price", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPublicGetV5MarketFundingRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/funding_rate", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPublicGetV5MarketFundingRateHistory(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/funding_rate_history", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPublicGetV5MarketOpenInterest(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/open_interest", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPublicGetV5MarketLiquidationOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/liquidation_orders", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPublicGetV5MarketSettlementHistory(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/settlement_history", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPublicGetV5MarketEliteAccountRatio(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/elite_account_ratio", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPublicGetV5MarketElitePositionRatio(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/elite_position_ratio", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPublicGetV5MarketEstimatedSettlementPrice(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/estimated_settlement_price", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPublicGetV5MarketPriceLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/price_limit", ["contract", "public"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPrivateGetApiV1ContractSubAuthList(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_sub_auth_list", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivateGetApiV1ContractApiTradingStatus(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_api_trading_status", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivateGetSwapApiV1SwapSubAuthList(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_sub_auth_list", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivateGetSwapApiV1SwapApiTradingStatus(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_api_trading_status", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivateGetV5AccountAssetMode(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/account/asset_mode", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivateGetV5AccountBalance(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/account/balance", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivateGetV5AccountBills(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/account/bills", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivateGetV5AccountFeeDeductionCurrency(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/account/fee_deduction_currency", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivateGetV5TradePositionOpens(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/position/opens", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivateGetV5TradeOrderOpens(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/order/opens", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivateGetV5TradeOrderDetails(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/order/details", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivateGetV5TradeOrderHistory(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/order/history", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivateGetV5TradeOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/order", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivateGetV5PositionLever(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/position/lever", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivateGetV5PositionMode(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/position/mode", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivateGetV5PositionRiskLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/position/risk/limit", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivateGetV5PositionRiskLimitTier(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/position/risk/limit_tier", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivateGetV5MarketRiskLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/risk/limit", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPrivateGetV5MarketAssetsDeductionCurrency(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/assets_deduction_currency", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPrivateGetV5MarketMultiAssetsMargin(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/market/multi_assets_margin", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.125))
end

function contractPrivateGetV5AlgoOrderOpens(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/algo/order/opens", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivateGetV5AlgoOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/algo/order", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivateGetV5AlgoOrderHistory(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/algo/order/history", ["contract", "private"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivatePostApiV1ContractBalanceValuation(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_balance_valuation", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractAccountInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_account_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractPositionInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_position_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractSubAuth(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_sub_auth", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractSubAccountList(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_sub_account_list", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractSubAccountInfoList(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_sub_account_info_list", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractSubAccountInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_sub_account_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractSubPositionInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_sub_position_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractFinancialRecord(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_financial_record", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractFinancialRecordExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_financial_record_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractUserSettlementRecords(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_user_settlement_records", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractOrderLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_order_limit", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractFee(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_fee", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTransferLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_transfer_limit", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractPositionLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_position_limit", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractAccountPositionInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_account_position_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractMasterSubTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_master_sub_transfer", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractMasterSubTransferRecord(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_master_sub_transfer_record", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractAvailableLevelRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_available_level_rate", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV3ContractFinancialRecord(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v3/contract_financial_record", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV3ContractFinancialRecordExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v3/contract_financial_record_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractCancelAfter(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract-cancel-after", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractBatchorder(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_batchorder", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_cancel", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractCancelall(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_cancelall", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractSwitchLeverRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_switch_lever_rate", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function contractPrivatePostApiV1LightningClosePosition(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/lightning_close_position", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractOrderInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_order_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractOrderDetail(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_order_detail", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractOpenorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_openorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractHisorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_hisorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractHisordersExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_hisorders_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractMatchresults(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_matchresults", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractMatchresultsExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_matchresults_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV3ContractHisorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v3/contract_hisorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV3ContractHisordersExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v3/contract_hisorders_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV3ContractMatchresults(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v3/contract_matchresults", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV3ContractMatchresultsExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v3/contract_matchresults_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTriggerOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_trigger_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTriggerCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_trigger_cancel", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTriggerCancelall(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_trigger_cancelall", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTriggerOpenorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_trigger_openorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTriggerHisorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_trigger_hisorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTpslOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_tpsl_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTpslCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_tpsl_cancel", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTpslCancelall(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_tpsl_cancelall", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTpslOpenorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_tpsl_openorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTpslHisorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_tpsl_hisorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractRelationTpslOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_relation_tpsl_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTrackOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_track_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTrackCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_track_cancel", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTrackCancelall(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_track_cancelall", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTrackOpenorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_track_openorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostApiV1ContractTrackHisorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "api/v1/contract_track_hisorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapBalanceValuation(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_balance_valuation", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapAccountInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_account_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapPositionInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_position_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapAccountPositionInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_account_position_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapSubAuth(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_sub_auth", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapSubAccountList(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_sub_account_list", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapSubAccountInfoList(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_sub_account_info_list", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapSubAccountInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_sub_account_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapSubPositionInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_sub_position_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapFinancialRecord(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_financial_record", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapFinancialRecordExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_financial_record_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapUserSettlementRecords(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_user_settlement_records", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapAvailableLevelRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_available_level_rate", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapOrderLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_order_limit", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapFee(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_fee", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTransferLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_transfer_limit", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapPositionLimit(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_position_limit", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapMasterSubTransfer(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_master_sub_transfer", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapMasterSubTransferRecord(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_master_sub_transfer_record", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV3SwapFinancialRecord(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v3/swap_financial_record", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV3SwapFinancialRecordExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v3/swap_financial_record_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapCancelAfter(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap-cancel-after", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapBatchorder(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_batchorder", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_cancel", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapCancelall(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_cancelall", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapLightningClosePosition(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_lightning_close_position", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapSwitchLeverRate(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_switch_lever_rate", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 30))
end

function contractPrivatePostSwapApiV1SwapOrderInfo(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_order_info", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapOrderDetail(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_order_detail", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapOpenorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_openorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapHisorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_hisorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapHisordersExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_hisorders_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapMatchresults(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_matchresults", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapMatchresultsExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_matchresults_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV3SwapMatchresults(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v3/swap_matchresults", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV3SwapMatchresultsExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v3/swap_matchresults_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV3SwapHisorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v3/swap_hisorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV3SwapHisordersExact(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v3/swap_hisorders_exact", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTriggerOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_trigger_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTriggerCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_trigger_cancel", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTriggerCancelall(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_trigger_cancelall", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTriggerOpenorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_trigger_openorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTriggerHisorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_trigger_hisorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTpslOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_tpsl_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTpslCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_tpsl_cancel", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTpslCancelall(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_tpsl_cancelall", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTpslOpenorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_tpsl_openorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTpslHisorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_tpsl_hisorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapRelationTpslOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_relation_tpsl_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTrackOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_track_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTrackCancel(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_track_cancel", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTrackCancelall(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_track_cancelall", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTrackOpenorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_track_openorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostSwapApiV1SwapTrackHisorders(self::Htx, params=Dict(), context=Dict())
    return request(self, "swap-api/v1/swap_track_hisorders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function contractPrivatePostV5AccountAssetMode(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/account/asset_mode", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 100))
end

function contractPrivatePostV5TradeOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivatePostV5TradeBatchOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/batch_orders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivatePostV5TradeCancelOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/cancel_order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivatePostV5TradeCancelBatchOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/cancel_batch_orders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivatePostV5TradeCancelAllOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/cancel_all_orders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivatePostV5TradeCancelAfter(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/cancel-after", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivatePostV5TradePosition(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/position", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivatePostV5TradePositionAll(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/trade/position_all", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivatePostV5PositionLever(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/position/lever", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivatePostV5PositionMode(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/position/mode", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivatePostV5PositionMargin(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/position/margin", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivatePostV5AccountFeeDeductionCurrency(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/account/fee_deduction_currency", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.20834))
end

function contractPrivatePostV5AlgoOrder(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/algo/order", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function contractPrivatePostV5AlgoCancelOrders(self::Htx, params=Dict(), context=Dict())
    return request(self, "v5/algo/cancel_orders", ["contract", "private"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.41679))
end

function Htx(; kwargs...)
    inst = Htx(Exchange(), describe, fetchStatus, fetchTime, parseTradingFee, fetchTradingFee, fetchTradingLimits, fetchTradingLimitsById, parseTradingLimits, costToPrecision, fetchMarkets, fetchMarketsByTypeAndSubType, tryGetSymbolFromFutureMarkets, parseTicker, fetchTicker, fetchTickers, fetchLastPrices, parseLastPrice, fetchOrderBook, parseTrade, fetchOrderTrades, fetchSpotOrderTrades, fetchMyTrades, fetchTrades, parseOHLCV, fetchOHLCV, fetchAccounts, parseAccount, fetchAccountIdByType, fetchCurrencies, parseCurrency, networkIdToCode, networkCodeToId, fetchBalance, fetchOrder, parseMarginBalanceHelper, fetchSpotOrdersByStates, fetchSpotOrders, fetchClosedSpotOrders, fetchContractOrders, fetchClosedContractOrders, fetchOrders, fetchCanceledOrders, fetchClosedOrders, fetchOpenOrders, parseOrderStatus, parseOrder, createMarketBuyOrderWithCost, createTrailingPercentOrder, createSpotOrderRequest, createContractOrderRequest, createOrder, createOrders, cancelOrder, cancelOrders, parseCancelOrders, cancelAllOrders, cancelAllOrdersAfter, parseDepositAddress, fetchDepositAddressesByNetwork, fetchDepositAddress, fetchWithdrawAddresses, fetchDeposits, fetchWithdrawals, parseTransaction, parseTransactionStatus, withdraw, parseTransfer, transfer, fetchTransfers, fetchIsolatedBorrowRates, parseIsolatedBorrowRate, fetchFundingRateHistory, parseFundingRate, parseFundingInterval, fetchFundingRate, fetchFundingRates, fetchBorrowInterest, parseBorrowInterest, nonce, sign, handleErrors, fetchFundingHistory, setLeverage, parseIncome, parsePosition, fetchPositions, fetchPosition, parseLedgerEntryType, parseLedgerEntry, fetchLedger, fetchLeverageTiers, parseMarketLeverageTiers, fetchOpenInterestHistory, fetchOpenInterests, fetchOpenInterest, parseOpenInterest, borrowIsolatedMargin, borrowCrossMargin, repayIsolatedMargin, repayCrossMargin, parseMarginLoan, fetchSettlementHistory, fetchDepositWithdrawFees, parseDepositWithdrawFee, parseSettlements, parseSettlement, fetchLiquidations, parseLiquidation, closePosition, setPositionMode, fetchPositionsADLRank, parseADLRank, v2PublicGetReferenceCurrencies, v2PublicGetMarketStatus, v2PrivateGetAccountLedger, v2PrivateGetAccountWithdrawQuota, v2PrivateGetAccountWithdrawAddress, v2PrivateGetAccountDepositAddress, v2PrivateGetAccountRepayment, v2PrivateGetReferenceTransactFeeRate, v2PrivateGetAccountAssetValuation, v2PrivateGetPointAccount, v2PrivateGetSubUserUserList, v2PrivateGetSubUserUserState, v2PrivateGetSubUserAccountList, v2PrivateGetSubUserDepositAddress, v2PrivateGetSubUserQueryDeposit, v2PrivateGetUserApiKey, v2PrivateGetUserUid, v2PrivateGetAlgoOrdersOpening, v2PrivateGetAlgoOrdersHistory, v2PrivateGetAlgoOrdersSpecific, v2PrivateGetC2cOffers, v2PrivateGetC2cOffer, v2PrivateGetC2cTransactions, v2PrivateGetC2cRepayment, v2PrivateGetC2cAccount, v2PrivateGetEtpReference, v2PrivateGetEtpTransactions, v2PrivateGetEtpTransaction, v2PrivateGetEtpRebalance, v2PrivateGetEtpLimit, v2PrivatePostAccountTransfer, v2PrivatePostAccountRepayment, v2PrivatePostPointTransfer, v2PrivatePostSubUserManagement, v2PrivatePostSubUserCreation, v2PrivatePostSubUserTradableMarket, v2PrivatePostSubUserTransferability, v2PrivatePostSubUserApiKeyGeneration, v2PrivatePostSubUserApiKeyModification, v2PrivatePostSubUserApiKeyDeletion, v2PrivatePostSubUserDeductMode, v2PrivatePostAlgoOrders, v2PrivatePostAlgoOrdersCancelAllAfter, v2PrivatePostAlgoOrdersCancellation, v2PrivatePostC2cOffer, v2PrivatePostC2cCancellation, v2PrivatePostC2cCancelAll, v2PrivatePostC2cRepayment, v2PrivatePostC2cTransfer, v2PrivatePostEtpCreation, v2PrivatePostEtpRedemption, v2PrivatePostEtpTransactIdCancel, v2PrivatePostEtpBatchCancel, publicGetCommonSymbols, publicGetCommonCurrencys, publicGetCommonTimestamp, publicGetCommonExchange, publicGetSettingsCurrencys, privateGetAccountAccounts, privateGetAccountAccountsIdBalance, privateGetAccountAccountsSubUid, privateGetAccountHistory, privateGetCrossMarginLoanInfo, privateGetMarginLoanInfo, privateGetFeeFeeRateGet, privateGetOrderOpenOrders, privateGetOrderOrders, privateGetOrderOrdersId, privateGetOrderOrdersIdMatchresults, privateGetOrderOrdersGetClientOrder, privateGetOrderHistory, privateGetOrderMatchresults, privateGetQueryDepositWithdraw, privateGetMarginLoanOrders, privateGetMarginAccountsBalance, privateGetCrossMarginLoanOrders, privateGetCrossMarginAccountsBalance, privateGetPointsActions, privateGetPointsOrders, privateGetSubuserAggregateBalance, privateGetStableCoinExchangeRate, privateGetStableCoinQuote, privatePostAccountTransfer, privatePostFuturesTransfer, privatePostOrderBatchOrders, privatePostOrderOrdersPlace, privatePostOrderOrdersSubmitCancelClientOrder, privatePostOrderOrdersBatchCancelOpenOrders, privatePostOrderOrdersIdSubmitcancel, privatePostOrderOrdersBatchcancel, privatePostDwWithdrawApiCreate, privatePostDwWithdrawVirtualIdCancel, privatePostDwTransferInMargin, privatePostDwTransferOutMargin, privatePostMarginOrders, privatePostMarginOrdersIdRepay, privatePostCrossMarginTransferIn, privatePostCrossMarginTransferOut, privatePostCrossMarginOrders, privatePostCrossMarginOrdersIdRepay, privatePostStableCoinExchange, privatePostSubuserTransfer, statusPublicSpotGetApiV2SummaryJson, statusPublicFutureInverseGetApiV2SummaryJson, statusPublicFutureLinearGetApiV2SummaryJson, statusPublicSwapInverseGetApiV2SummaryJson, statusPublicSwapLinearGetApiV2SummaryJson, spotPublicGetV2MarketStatus, spotPublicGetV1CommonSymbols, spotPublicGetV1CommonCurrencys, spotPublicGetV2SettingsCommonCurrencies, spotPublicGetV2ReferenceCurrencies, spotPublicGetV1CommonTimestamp, spotPublicGetV1CommonExchange, spotPublicGetV1SettingsCommonChains, spotPublicGetV1SettingsCommonCurrencys, spotPublicGetV1SettingsCommonSymbols, spotPublicGetV2SettingsCommonSymbols, spotPublicGetV1SettingsCommonMarketSymbols, spotPublicGetMarketHistoryCandles, spotPublicGetMarketHistoryKline, spotPublicGetMarketDetailMerged, spotPublicGetMarketTickers, spotPublicGetMarketDetail, spotPublicGetMarketDepth, spotPublicGetMarketTrade, spotPublicGetMarketHistoryTrade, spotPublicGetMarketEtp, spotPublicGetV2EtpReference, spotPublicGetV2EtpRebalance, spotPrivateGetV1AccountAccounts, spotPrivateGetV1AccountAccountsAccountIdBalance, spotPrivateGetV2AccountValuation, spotPrivateGetV2AccountAssetValuation, spotPrivateGetV1AccountHistory, spotPrivateGetV2AccountLedger, spotPrivateGetV2PointAccount, spotPrivateGetV2AccountDepositAddress, spotPrivateGetV2AccountWithdrawQuota, spotPrivateGetV2AccountWithdrawAddress, spotPrivateGetV2ReferenceCurrencies, spotPrivateGetV1QueryDepositWithdraw, spotPrivateGetV1QueryWithdrawClientOrderId, spotPrivateGetV2UserApiKey, spotPrivateGetV2UserUid, spotPrivateGetV2SubUserUserList, spotPrivateGetV2SubUserUserState, spotPrivateGetV2SubUserAccountList, spotPrivateGetV2SubUserDepositAddress, spotPrivateGetV2SubUserQueryDeposit, spotPrivateGetV1SubuserAggregateBalance, spotPrivateGetV1AccountAccountsSubUid, spotPrivateGetV1OrderOpenOrders, spotPrivateGetV1OrderOrdersOrderId, spotPrivateGetV1OrderOrdersGetClientOrder, spotPrivateGetV1OrderOrdersOrderIdMatchresult, spotPrivateGetV1OrderOrdersOrderIdMatchresults, spotPrivateGetV1OrderOrders, spotPrivateGetV1OrderHistory, spotPrivateGetV1OrderMatchresults, spotPrivateGetV2ReferenceTransactFeeRate, spotPrivateGetV2AlgoOrdersOpening, spotPrivateGetV2AlgoOrdersHistory, spotPrivateGetV2AlgoOrdersSpecific, spotPrivateGetV1MarginLoanInfo, spotPrivateGetV1MarginLoanOrders, spotPrivateGetV1MarginAccountsBalance, spotPrivateGetV1CrossMarginLoanInfo, spotPrivateGetV1CrossMarginLoanOrders, spotPrivateGetV1CrossMarginAccountsBalance, spotPrivateGetV2AccountRepayment, spotPrivateGetV5AccountUniversalTransferRecords, spotPrivateGetV1StableCoinQuote, spotPrivateGetV1StableCoinExchangeRate, spotPrivateGetV2EtpTransactions, spotPrivateGetV2EtpTransaction, spotPrivateGetV2EtpLimit, spotPrivatePostV1AccountTransfer, spotPrivatePostV1FuturesTransfer, spotPrivatePostV2PointTransfer, spotPrivatePostV2AccountTransfer, spotPrivatePostV1DwWithdrawApiCreate, spotPrivatePostV1DwWithdrawVirtualWithdrawIdCancel, spotPrivatePostV2SubUserDeductMode, spotPrivatePostV2SubUserCreation, spotPrivatePostV2SubUserManagement, spotPrivatePostV2SubUserTradableMarket, spotPrivatePostV2SubUserTransferability, spotPrivatePostV2SubUserApiKeyGeneration, spotPrivatePostV2SubUserApiKeyModification, spotPrivatePostV2SubUserApiKeyDeletion, spotPrivatePostV1SubuserTransfer, spotPrivatePostV1TrustUserActiveCredit, spotPrivatePostV1OrderOrdersPlace, spotPrivatePostV1OrderBatchOrders, spotPrivatePostV1OrderAutoPlace, spotPrivatePostV1OrderOrdersOrderIdSubmitcancel, spotPrivatePostV1OrderOrdersSubmitCancelClientOrder, spotPrivatePostV1OrderOrdersBatchCancelOpenOrders, spotPrivatePostV1OrderOrdersBatchcancel, spotPrivatePostV2AlgoOrdersCancelAllAfter, spotPrivatePostV2AlgoOrders, spotPrivatePostV2AlgoOrdersCancellation, spotPrivatePostV2AccountRepayment, spotPrivatePostV1DwTransferInMargin, spotPrivatePostV1DwTransferOutMargin, spotPrivatePostV1MarginOrders, spotPrivatePostV1MarginOrdersOrderIdRepay, spotPrivatePostV1CrossMarginTransferIn, spotPrivatePostV1CrossMarginTransferOut, spotPrivatePostV1CrossMarginOrders, spotPrivatePostV1CrossMarginOrdersOrderIdRepay, spotPrivatePostV1StableCoinExchange, spotPrivatePostV2EtpCreation, spotPrivatePostV2EtpRedemption, spotPrivatePostV2EtpTransactIdCancel, spotPrivatePostV2EtpBatchCancel, contractPublicGetApiV1Timestamp, contractPublicGetHeartbeat, contractPublicGetApiV1ContractContractInfo, contractPublicGetApiV1ContractIndex, contractPublicGetApiV1ContractQueryElements, contractPublicGetApiV1ContractPriceLimit, contractPublicGetApiV1ContractOpenInterest, contractPublicGetApiV1ContractDeliveryPrice, contractPublicGetMarketDepth, contractPublicGetMarketBbo, contractPublicGetMarketHistoryKline, contractPublicGetIndexMarketHistoryMarkPriceKline, contractPublicGetMarketDetailMerged, contractPublicGetMarketDetailBatchMerged, contractPublicGetV2MarketDetailBatchMerged, contractPublicGetMarketTrade, contractPublicGetMarketHistoryTrade, contractPublicGetApiV1ContractRiskInfo, contractPublicGetApiV1ContractInsuranceFund, contractPublicGetApiV1ContractAdjustfactor, contractPublicGetApiV1ContractHisOpenInterest, contractPublicGetApiV1ContractLadderMargin, contractPublicGetApiV1ContractApiState, contractPublicGetApiV1ContractEliteAccountRatio, contractPublicGetApiV1ContractElitePositionRatio, contractPublicGetApiV1ContractLiquidationOrders, contractPublicGetApiV1ContractSettlementRecords, contractPublicGetIndexMarketHistoryIndex, contractPublicGetIndexMarketHistoryBasis, contractPublicGetApiV1ContractEstimatedSettlementPrice, contractPublicGetApiV3ContractLiquidationOrders, contractPublicGetSwapApiV1SwapContractInfo, contractPublicGetSwapApiV1SwapIndex, contractPublicGetSwapApiV1SwapQueryElements, contractPublicGetSwapApiV1SwapPriceLimit, contractPublicGetSwapApiV1SwapOpenInterest, contractPublicGetSwapExMarketDepth, contractPublicGetSwapExMarketBbo, contractPublicGetSwapExMarketHistoryKline, contractPublicGetIndexMarketHistorySwapMarkPriceKline, contractPublicGetSwapExMarketDetailMerged, contractPublicGetV2SwapExMarketDetailBatchMerged, contractPublicGetIndexMarketHistorySwapPremiumIndexKline, contractPublicGetSwapExMarketDetailBatchMerged, contractPublicGetSwapExMarketTrade, contractPublicGetSwapExMarketHistoryTrade, contractPublicGetSwapApiV1SwapRiskInfo, contractPublicGetSwapApiV1SwapInsuranceFund, contractPublicGetSwapApiV1SwapAdjustfactor, contractPublicGetSwapApiV1SwapHisOpenInterest, contractPublicGetSwapApiV1SwapLadderMargin, contractPublicGetSwapApiV1SwapApiState, contractPublicGetSwapApiV1SwapEliteAccountRatio, contractPublicGetSwapApiV1SwapElitePositionRatio, contractPublicGetSwapApiV1SwapEstimatedSettlementPrice, contractPublicGetSwapApiV1SwapLiquidationOrders, contractPublicGetSwapApiV1SwapSettlementRecords, contractPublicGetSwapApiV1SwapFundingRate, contractPublicGetSwapApiV1SwapBatchFundingRate, contractPublicGetSwapApiV1SwapHistoricalFundingRate, contractPublicGetSwapApiV3SwapLiquidationOrders, contractPublicGetIndexMarketHistorySwapEstimatedRateKline, contractPublicGetIndexMarketHistorySwapBasis, contractPublicGetLinearSwapApiV1SwapContractInfo, contractPublicGetLinearSwapApiV1SwapIndex, contractPublicGetLinearSwapApiV1SwapQueryElements, contractPublicGetLinearSwapApiV1SwapPriceLimit, contractPublicGetLinearSwapExMarketDepth, contractPublicGetLinearSwapExMarketBbo, contractPublicGetLinearSwapExMarketHistoryKline, contractPublicGetIndexMarketHistoryLinearSwapMarkPriceKline, contractPublicGetLinearSwapExMarketDetailMerged, contractPublicGetLinearSwapExMarketDetailBatchMerged, contractPublicGetV2LinearSwapExMarketDetailBatchMerged, contractPublicGetLinearSwapExMarketTrade, contractPublicGetLinearSwapExMarketHistoryTrade, contractPublicGetSwapApiV1LinearSwapApiV1SwapInsuranceFund, contractPublicGetLinearSwapApiV1SwapAdjustfactor, contractPublicGetLinearSwapApiV1SwapCrossAdjustfactor, contractPublicGetLinearSwapApiV1SwapHisOpenInterest, contractPublicGetLinearSwapApiV1SwapLadderMargin, contractPublicGetLinearSwapApiV1SwapCrossLadderMargin, contractPublicGetLinearSwapApiV1SwapApiState, contractPublicGetLinearSwapApiV1SwapEliteAccountRatio, contractPublicGetLinearSwapApiV1SwapElitePositionRatio, contractPublicGetLinearSwapApiV1SwapSettlementRecords, contractPublicGetLinearSwapApiV3SwapLiquidationOrders, contractPublicGetIndexMarketHistoryLinearSwapPremiumIndexKline, contractPublicGetIndexMarketHistoryLinearSwapEstimatedRateKline, contractPublicGetIndexMarketHistoryLinearSwapBasis, contractPublicGetLinearSwapApiV1SwapEstimatedSettlementPrice, contractPublicGetV5MarketFundingRate, contractPublicGetV5MarketFundingRateHistory, contractPublicGetV5MarketOpenInterest, contractPublicGetV5MarketLiquidationOrders, contractPublicGetV5MarketSettlementHistory, contractPublicGetV5MarketEliteAccountRatio, contractPublicGetV5MarketElitePositionRatio, contractPublicGetV5MarketEstimatedSettlementPrice, contractPublicGetV5MarketPriceLimit, contractPrivateGetApiV1ContractSubAuthList, contractPrivateGetApiV1ContractApiTradingStatus, contractPrivateGetSwapApiV1SwapSubAuthList, contractPrivateGetSwapApiV1SwapApiTradingStatus, contractPrivateGetV5AccountAssetMode, contractPrivateGetV5AccountBalance, contractPrivateGetV5AccountBills, contractPrivateGetV5AccountFeeDeductionCurrency, contractPrivateGetV5TradePositionOpens, contractPrivateGetV5TradeOrderOpens, contractPrivateGetV5TradeOrderDetails, contractPrivateGetV5TradeOrderHistory, contractPrivateGetV5TradeOrder, contractPrivateGetV5PositionLever, contractPrivateGetV5PositionMode, contractPrivateGetV5PositionRiskLimit, contractPrivateGetV5PositionRiskLimitTier, contractPrivateGetV5MarketRiskLimit, contractPrivateGetV5MarketAssetsDeductionCurrency, contractPrivateGetV5MarketMultiAssetsMargin, contractPrivateGetV5AlgoOrderOpens, contractPrivateGetV5AlgoOrder, contractPrivateGetV5AlgoOrderHistory, contractPrivatePostApiV1ContractBalanceValuation, contractPrivatePostApiV1ContractAccountInfo, contractPrivatePostApiV1ContractPositionInfo, contractPrivatePostApiV1ContractSubAuth, contractPrivatePostApiV1ContractSubAccountList, contractPrivatePostApiV1ContractSubAccountInfoList, contractPrivatePostApiV1ContractSubAccountInfo, contractPrivatePostApiV1ContractSubPositionInfo, contractPrivatePostApiV1ContractFinancialRecord, contractPrivatePostApiV1ContractFinancialRecordExact, contractPrivatePostApiV1ContractUserSettlementRecords, contractPrivatePostApiV1ContractOrderLimit, contractPrivatePostApiV1ContractFee, contractPrivatePostApiV1ContractTransferLimit, contractPrivatePostApiV1ContractPositionLimit, contractPrivatePostApiV1ContractAccountPositionInfo, contractPrivatePostApiV1ContractMasterSubTransfer, contractPrivatePostApiV1ContractMasterSubTransferRecord, contractPrivatePostApiV1ContractAvailableLevelRate, contractPrivatePostApiV3ContractFinancialRecord, contractPrivatePostApiV3ContractFinancialRecordExact, contractPrivatePostApiV1ContractCancelAfter, contractPrivatePostApiV1ContractOrder, contractPrivatePostApiV1ContractBatchorder, contractPrivatePostApiV1ContractCancel, contractPrivatePostApiV1ContractCancelall, contractPrivatePostApiV1ContractSwitchLeverRate, contractPrivatePostApiV1LightningClosePosition, contractPrivatePostApiV1ContractOrderInfo, contractPrivatePostApiV1ContractOrderDetail, contractPrivatePostApiV1ContractOpenorders, contractPrivatePostApiV1ContractHisorders, contractPrivatePostApiV1ContractHisordersExact, contractPrivatePostApiV1ContractMatchresults, contractPrivatePostApiV1ContractMatchresultsExact, contractPrivatePostApiV3ContractHisorders, contractPrivatePostApiV3ContractHisordersExact, contractPrivatePostApiV3ContractMatchresults, contractPrivatePostApiV3ContractMatchresultsExact, contractPrivatePostApiV1ContractTriggerOrder, contractPrivatePostApiV1ContractTriggerCancel, contractPrivatePostApiV1ContractTriggerCancelall, contractPrivatePostApiV1ContractTriggerOpenorders, contractPrivatePostApiV1ContractTriggerHisorders, contractPrivatePostApiV1ContractTpslOrder, contractPrivatePostApiV1ContractTpslCancel, contractPrivatePostApiV1ContractTpslCancelall, contractPrivatePostApiV1ContractTpslOpenorders, contractPrivatePostApiV1ContractTpslHisorders, contractPrivatePostApiV1ContractRelationTpslOrder, contractPrivatePostApiV1ContractTrackOrder, contractPrivatePostApiV1ContractTrackCancel, contractPrivatePostApiV1ContractTrackCancelall, contractPrivatePostApiV1ContractTrackOpenorders, contractPrivatePostApiV1ContractTrackHisorders, contractPrivatePostSwapApiV1SwapBalanceValuation, contractPrivatePostSwapApiV1SwapAccountInfo, contractPrivatePostSwapApiV1SwapPositionInfo, contractPrivatePostSwapApiV1SwapAccountPositionInfo, contractPrivatePostSwapApiV1SwapSubAuth, contractPrivatePostSwapApiV1SwapSubAccountList, contractPrivatePostSwapApiV1SwapSubAccountInfoList, contractPrivatePostSwapApiV1SwapSubAccountInfo, contractPrivatePostSwapApiV1SwapSubPositionInfo, contractPrivatePostSwapApiV1SwapFinancialRecord, contractPrivatePostSwapApiV1SwapFinancialRecordExact, contractPrivatePostSwapApiV1SwapUserSettlementRecords, contractPrivatePostSwapApiV1SwapAvailableLevelRate, contractPrivatePostSwapApiV1SwapOrderLimit, contractPrivatePostSwapApiV1SwapFee, contractPrivatePostSwapApiV1SwapTransferLimit, contractPrivatePostSwapApiV1SwapPositionLimit, contractPrivatePostSwapApiV1SwapMasterSubTransfer, contractPrivatePostSwapApiV1SwapMasterSubTransferRecord, contractPrivatePostSwapApiV3SwapFinancialRecord, contractPrivatePostSwapApiV3SwapFinancialRecordExact, contractPrivatePostSwapApiV1SwapCancelAfter, contractPrivatePostSwapApiV1SwapOrder, contractPrivatePostSwapApiV1SwapBatchorder, contractPrivatePostSwapApiV1SwapCancel, contractPrivatePostSwapApiV1SwapCancelall, contractPrivatePostSwapApiV1SwapLightningClosePosition, contractPrivatePostSwapApiV1SwapSwitchLeverRate, contractPrivatePostSwapApiV1SwapOrderInfo, contractPrivatePostSwapApiV1SwapOrderDetail, contractPrivatePostSwapApiV1SwapOpenorders, contractPrivatePostSwapApiV1SwapHisorders, contractPrivatePostSwapApiV1SwapHisordersExact, contractPrivatePostSwapApiV1SwapMatchresults, contractPrivatePostSwapApiV1SwapMatchresultsExact, contractPrivatePostSwapApiV3SwapMatchresults, contractPrivatePostSwapApiV3SwapMatchresultsExact, contractPrivatePostSwapApiV3SwapHisorders, contractPrivatePostSwapApiV3SwapHisordersExact, contractPrivatePostSwapApiV1SwapTriggerOrder, contractPrivatePostSwapApiV1SwapTriggerCancel, contractPrivatePostSwapApiV1SwapTriggerCancelall, contractPrivatePostSwapApiV1SwapTriggerOpenorders, contractPrivatePostSwapApiV1SwapTriggerHisorders, contractPrivatePostSwapApiV1SwapTpslOrder, contractPrivatePostSwapApiV1SwapTpslCancel, contractPrivatePostSwapApiV1SwapTpslCancelall, contractPrivatePostSwapApiV1SwapTpslOpenorders, contractPrivatePostSwapApiV1SwapTpslHisorders, contractPrivatePostSwapApiV1SwapRelationTpslOrder, contractPrivatePostSwapApiV1SwapTrackOrder, contractPrivatePostSwapApiV1SwapTrackCancel, contractPrivatePostSwapApiV1SwapTrackCancelall, contractPrivatePostSwapApiV1SwapTrackOpenorders, contractPrivatePostSwapApiV1SwapTrackHisorders, contractPrivatePostV5AccountAssetMode, contractPrivatePostV5TradeOrder, contractPrivatePostV5TradeBatchOrders, contractPrivatePostV5TradeCancelOrder, contractPrivatePostV5TradeCancelBatchOrders, contractPrivatePostV5TradeCancelAllOrders, contractPrivatePostV5TradeCancelAfter, contractPrivatePostV5TradePosition, contractPrivatePostV5TradePositionAll, contractPrivatePostV5PositionLever, contractPrivatePostV5PositionMode, contractPrivatePostV5PositionMargin, contractPrivatePostV5AccountFeeDeductionCurrency, contractPrivatePostV5AlgoOrder, contractPrivatePostV5AlgoCancelOrders)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
