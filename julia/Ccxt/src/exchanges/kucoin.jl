@kwdef mutable struct Kucoin <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    nonce::Function = nonce
    fetchTime::Function = fetchTime
    fetchStatus::Function = fetchStatus
    fetchMarkets::Function = fetchMarkets
    fetchContractMarkets::Function = fetchContractMarkets
    fetchUTAMarkets::Function = fetchUTAMarkets
    loadMigrationStatus::Function = loadMigrationStatus
    handleHfAndParams::Function = handleHfAndParams
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchAccounts::Function = fetchAccounts
    fetchTransactionFee::Function = fetchTransactionFee
    fetchDepositWithdrawFee::Function = fetchDepositWithdrawFee
    parseDepositWithdrawFee::Function = parseDepositWithdrawFee
    isFuturesMethod::Function = isFuturesMethod
    parseSpotOrUtaTicker::Function = parseSpotOrUtaTicker
    parseTicker::Function = parseTicker
    parseContractTicker::Function = parseContractTicker
    typeToTradeType::Function = typeToTradeType
    fetchTickers::Function = fetchTickers
    fetchContractTickers::Function = fetchContractTickers
    fetchMarkPrices::Function = fetchMarkPrices
    fetchTicker::Function = fetchTicker
    fetchMarkPrice::Function = fetchMarkPrice
    parseOHLCV::Function = parseOHLCV
    fetchOHLCV::Function = fetchOHLCV
    fetchUTAOHLCV::Function = fetchUTAOHLCV
    fetchSpotOHLCV::Function = fetchSpotOHLCV
    fetchContractOHLCV::Function = fetchContractOHLCV
    createDepositAddress::Function = createDepositAddress
    fetchDepositAddress::Function = fetchDepositAddress
    fetchContractDepositAddress::Function = fetchContractDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchDepositAddressesByNetwork::Function = fetchDepositAddressesByNetwork
    fetchOrderBook::Function = fetchOrderBook
    handleTriggerPrices::Function = handleTriggerPrices
    createOrder::Function = createOrder
    createSpotOrder::Function = createSpotOrder
    createSpotOrderRequest::Function = createSpotOrderRequest
    marketOrderAmountToPrecision::Function = marketOrderAmountToPrecision
    createContractOrder::Function = createContractOrder
    createContractOrderRequest::Function = createContractOrderRequest
    createUtaOrder::Function = createUtaOrder
    createUtaOrderRequest::Function = createUtaOrderRequest
    createMarketOrderWithCost::Function = createMarketOrderWithCost
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createMarketSellOrderWithCost::Function = createMarketSellOrderWithCost
    createOrders::Function = createOrders
    createSpotOrders::Function = createSpotOrders
    createContractOrders::Function = createContractOrders
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelSpotOrder::Function = cancelSpotOrder
    cancelContractOrder::Function = cancelContractOrder
    cancelUtaOrder::Function = cancelUtaOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelAllSpotOrders::Function = cancelAllSpotOrders
    cancelAllContractOrders::Function = cancelAllContractOrders
    cancelAllUtaOrders::Function = cancelAllUtaOrders
    fetchOrdersByStatus::Function = fetchOrdersByStatus
    fetchSpotOrdersByStatus::Function = fetchSpotOrdersByStatus
    fetchContractOrdersByStatus::Function = fetchContractOrdersByStatus
    fetchUtaOrdersByStatus::Function = fetchUtaOrdersByStatus
    fetchClosedOrders::Function = fetchClosedOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrder::Function = fetchOrder
    fetchSpotOrder::Function = fetchSpotOrder
    fetchContractOrder::Function = fetchContractOrder
    fetchUtaOrder::Function = fetchUtaOrder
    handleTradeType::Function = handleTradeType
    parseOrder::Function = parseOrder
    parseContractOrder::Function = parseContractOrder
    parseSpotOrder::Function = parseSpotOrder
    parseUtaOrder::Function = parseUtaOrder
    parseOrderTimeInForce::Function = parseOrderTimeInForce
    parseOrderStatus::Function = parseOrderStatus
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchMySpotTrades::Function = fetchMySpotTrades
    fetchMyContractTrades::Function = fetchMyContractTrades
    fetchMyUtaTrades::Function = fetchMyUtaTrades
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    parseSpotOrUtaTrade::Function = parseSpotOrUtaTrade
    parseContractTrade::Function = parseContractTrade
    parseMyUtaTrade::Function = parseMyUtaTrade
    fetchTradingFee::Function = fetchTradingFee
    withdraw::Function = withdraw
    parseTransactionStatus::Function = parseTransactionStatus
    parseTransaction::Function = parseTransaction
    fetchDeposits::Function = fetchDeposits
    fetchContractDeposits::Function = fetchContractDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchContractWithdrawals::Function = fetchContractWithdrawals
    parseBalanceHelper::Function = parseBalanceHelper
    fetchBalance::Function = fetchBalance
    fetchContractBalance::Function = fetchContractBalance
    fetchUtaBalance::Function = fetchUtaBalance
    transfer::Function = transfer
    transferUta::Function = transferUta
    transferClassic::Function = transferClassic
    isHfOrMining::Function = isHfOrMining
    parseTransfer::Function = parseTransfer
    parseTransferStatus::Function = parseTransferStatus
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerDirection::Function = parseLedgerDirection
    parseLedgerStatus::Function = parseLedgerStatus
    parseLedgerEntry::Function = parseLedgerEntry
    fetchLedger::Function = fetchLedger
    calculateRateLimiterCost::Function = calculateRateLimiterCost
    parseBorrowRate::Function = parseBorrowRate
    fetchBorrowInterest::Function = fetchBorrowInterest
    parseBorrowInterest::Function = parseBorrowInterest
    fetchBorrowRateHistories::Function = fetchBorrowRateHistories
    fetchBorrowRateHistory::Function = fetchBorrowRateHistory
    parseBorrowRateHistories::Function = parseBorrowRateHistories
    fetchCrossBorrowRate::Function = fetchCrossBorrowRate
    borrowCrossMargin::Function = borrowCrossMargin
    borrowIsolatedMargin::Function = borrowIsolatedMargin
    repayCrossMargin::Function = repayCrossMargin
    repayIsolatedMargin::Function = repayIsolatedMargin
    parseMarginLoan::Function = parseMarginLoan
    fetchDepositWithdrawFees::Function = fetchDepositWithdrawFees
    fetchLeverage::Function = fetchLeverage
    setLeverage::Function = setLeverage
    setContractLeverage::Function = setContractLeverage
    fetchFundingInterval::Function = fetchFundingInterval
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    parseFundingInterval::Function = parseFundingInterval
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    fetchFundingHistory::Function = fetchFundingHistory
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    fetchPositionsHistory::Function = fetchPositionsHistory
    parsePosition::Function = parsePosition
    cancelOrders::Function = cancelOrders
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    parseMarginModification::Function = parseMarginModification
    fetchMarginMode::Function = fetchMarginMode
    parseMarginMode::Function = parseMarginMode
    setMarginMode::Function = setMarginMode
    setPositionMode::Function = setPositionMode
    fetchPositionMode::Function = fetchPositionMode
    closePosition::Function = closePosition
    fetchMarketLeverageTiers::Function = fetchMarketLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    fetchLeverageTiers::Function = fetchLeverageTiers
    fetchOpenInterests::Function = fetchOpenInterests
    parseOpenInterest::Function = parseOpenInterest
    fetchOpenInterestHistory::Function = fetchOpenInterestHistory
    isUTAEnabled::Function = isUTAEnabled
    sign::Function = sign
    handleErrors::Function = handleErrors
    fetchTransfers::Function = fetchTransfers
    fetchPositionsADLRank::Function = fetchPositionsADLRank
    parseADLRank::Function = parseADLRank

# Generated REST endpoint fields
    publicGetCurrencies::Function = publicGetCurrencies
    publicGetCurrenciesCurrency::Function = publicGetCurrenciesCurrency
    publicGetSymbols::Function = publicGetSymbols
    publicGetMarketOrderbookLevel1::Function = publicGetMarketOrderbookLevel1
    publicGetMarketAllTickers::Function = publicGetMarketAllTickers
    publicGetMarketStats::Function = publicGetMarketStats
    publicGetMarkets::Function = publicGetMarkets
    publicGetMarketOrderbookLevelLevelLimit::Function = publicGetMarketOrderbookLevelLevelLimit
    publicGetMarketOrderbookLevel220::Function = publicGetMarketOrderbookLevel220
    publicGetMarketOrderbookLevel2100::Function = publicGetMarketOrderbookLevel2100
    publicGetMarketHistories::Function = publicGetMarketHistories
    publicGetMarketCandles::Function = publicGetMarketCandles
    publicGetPrices::Function = publicGetPrices
    publicGetTimestamp::Function = publicGetTimestamp
    publicGetStatus::Function = publicGetStatus
    publicGetMarkPriceSymbolCurrent::Function = publicGetMarkPriceSymbolCurrent
    publicGetMarkPriceAllSymbols::Function = publicGetMarkPriceAllSymbols
    publicGetMarginConfig::Function = publicGetMarginConfig
    publicGetAnnouncements::Function = publicGetAnnouncements
    publicGetMarginCollateralRatio::Function = publicGetMarginCollateralRatio
    publicGetConvertSymbol::Function = publicGetConvertSymbol
    publicGetConvertCurrencies::Function = publicGetConvertCurrencies
    publicPostBulletPublic::Function = publicPostBulletPublic
    privateGetUserInfo::Function = privateGetUserInfo
    privateGetUserApiKey::Function = privateGetUserApiKey
    privateGetAccounts::Function = privateGetAccounts
    privateGetAccountsAccountId::Function = privateGetAccountsAccountId
    privateGetAccountsLedgers::Function = privateGetAccountsLedgers
    privateGetHfAccountsLedgers::Function = privateGetHfAccountsLedgers
    privateGetHfMarginAccountLedgers::Function = privateGetHfMarginAccountLedgers
    privateGetTransactionHistory::Function = privateGetTransactionHistory
    privateGetSubUser::Function = privateGetSubUser
    privateGetSubAccountsSubUserId::Function = privateGetSubAccountsSubUserId
    privateGetSubAccounts::Function = privateGetSubAccounts
    privateGetSubApiKey::Function = privateGetSubApiKey
    privateGetMarginAccount::Function = privateGetMarginAccount
    privateGetMarginAccounts::Function = privateGetMarginAccounts
    privateGetIsolatedAccounts::Function = privateGetIsolatedAccounts
    privateGetDepositAddresses::Function = privateGetDepositAddresses
    privateGetDeposits::Function = privateGetDeposits
    privateGetHistDeposits::Function = privateGetHistDeposits
    privateGetWithdrawals::Function = privateGetWithdrawals
    privateGetHistWithdrawals::Function = privateGetHistWithdrawals
    privateGetWithdrawalsQuotas::Function = privateGetWithdrawalsQuotas
    privateGetAccountsTransferable::Function = privateGetAccountsTransferable
    privateGetTransferList::Function = privateGetTransferList
    privateGetBaseFee::Function = privateGetBaseFee
    privateGetTradeFees::Function = privateGetTradeFees
    privateGetMarketOrderbookLevelLevel::Function = privateGetMarketOrderbookLevelLevel
    privateGetMarketOrderbookLevel2::Function = privateGetMarketOrderbookLevel2
    privateGetMarketOrderbookLevel3::Function = privateGetMarketOrderbookLevel3
    privateGetHfAccountsOpened::Function = privateGetHfAccountsOpened
    privateGetHfOrdersActive::Function = privateGetHfOrdersActive
    privateGetHfOrdersActiveSymbols::Function = privateGetHfOrdersActiveSymbols
    privateGetHfMarginOrderActiveSymbols::Function = privateGetHfMarginOrderActiveSymbols
    privateGetHfOrdersDone::Function = privateGetHfOrdersDone
    privateGetHfOrdersOrderId::Function = privateGetHfOrdersOrderId
    privateGetHfOrdersClientOrderClientOid::Function = privateGetHfOrdersClientOrderClientOid
    privateGetHfOrdersDeadCancelAllQuery::Function = privateGetHfOrdersDeadCancelAllQuery
    privateGetHfFills::Function = privateGetHfFills
    privateGetOrders::Function = privateGetOrders
    privateGetLimitOrders::Function = privateGetLimitOrders
    privateGetOrdersOrderId::Function = privateGetOrdersOrderId
    privateGetOrderClientOrderClientOid::Function = privateGetOrderClientOrderClientOid
    privateGetFills::Function = privateGetFills
    privateGetLimitFills::Function = privateGetLimitFills
    privateGetStopOrder::Function = privateGetStopOrder
    privateGetStopOrderOrderId::Function = privateGetStopOrderOrderId
    privateGetStopOrderQueryOrderByClientOid::Function = privateGetStopOrderQueryOrderByClientOid
    privateGetOcoOrderOrderId::Function = privateGetOcoOrderOrderId
    privateGetOcoOrderDetailsOrderId::Function = privateGetOcoOrderDetailsOrderId
    privateGetOcoClientOrderClientOid::Function = privateGetOcoClientOrderClientOid
    privateGetOcoOrders::Function = privateGetOcoOrders
    privateGetHfMarginOrdersActive::Function = privateGetHfMarginOrdersActive
    privateGetHfMarginOrdersDone::Function = privateGetHfMarginOrdersDone
    privateGetHfMarginOrdersOrderId::Function = privateGetHfMarginOrdersOrderId
    privateGetHfMarginOrdersClientOrderClientOid::Function = privateGetHfMarginOrdersClientOrderClientOid
    privateGetHfMarginFills::Function = privateGetHfMarginFills
    privateGetHfMarginStopOrders::Function = privateGetHfMarginStopOrders
    privateGetHfMarginStopOrderOrderId::Function = privateGetHfMarginStopOrderOrderId
    privateGetHfMarginStopOrderClientOid::Function = privateGetHfMarginStopOrderClientOid
    privateGetHfMarginOcoOrderOrderId::Function = privateGetHfMarginOcoOrderOrderId
    privateGetHfMarginOcoOrderClientOid::Function = privateGetHfMarginOcoOrderClientOid
    privateGetHfMarginOcoOrderDetailOrderId::Function = privateGetHfMarginOcoOrderDetailOrderId
    privateGetHfMarginOcoOrders::Function = privateGetHfMarginOcoOrders
    privateGetEtfInfo::Function = privateGetEtfInfo
    privateGetMarginCurrencies::Function = privateGetMarginCurrencies
    privateGetRiskLimitStrategy::Function = privateGetRiskLimitStrategy
    privateGetIsolatedSymbols::Function = privateGetIsolatedSymbols
    privateGetMarginSymbols::Function = privateGetMarginSymbols
    privateGetIsolatedAccountSymbol::Function = privateGetIsolatedAccountSymbol
    privateGetMarginBorrow::Function = privateGetMarginBorrow
    privateGetMarginRepay::Function = privateGetMarginRepay
    privateGetMarginInterest::Function = privateGetMarginInterest
    privateGetProjectList::Function = privateGetProjectList
    privateGetProjectMarketInterestRate::Function = privateGetProjectMarketInterestRate
    privateGetRedeemOrders::Function = privateGetRedeemOrders
    privateGetPurchaseOrders::Function = privateGetPurchaseOrders
    privateGetBrokerApiRebaseDownload::Function = privateGetBrokerApiRebaseDownload
    privateGetBrokerQueryMyCommission::Function = privateGetBrokerQueryMyCommission
    privateGetBrokerQueryUser::Function = privateGetBrokerQueryUser
    privateGetBrokerQueryDetailByUid::Function = privateGetBrokerQueryDetailByUid
    privateGetMigrateUserAccountStatus::Function = privateGetMigrateUserAccountStatus
    privateGetConvertQuote::Function = privateGetConvertQuote
    privateGetConvertOrderDetail::Function = privateGetConvertOrderDetail
    privateGetConvertOrderHistory::Function = privateGetConvertOrderHistory
    privateGetConvertLimitQuote::Function = privateGetConvertLimitQuote
    privateGetConvertLimitOrderDetail::Function = privateGetConvertLimitOrderDetail
    privateGetConvertLimitOrders::Function = privateGetConvertLimitOrders
    privateGetAffiliateInviterStatistics::Function = privateGetAffiliateInviterStatistics
    privatePostSubUserCreated::Function = privatePostSubUserCreated
    privatePostSubApiKey::Function = privatePostSubApiKey
    privatePostSubApiKeyUpdate::Function = privatePostSubApiKeyUpdate
    privatePostDepositAddresses::Function = privatePostDepositAddresses
    privatePostWithdrawals::Function = privatePostWithdrawals
    privatePostAccountsUniversalTransfer::Function = privatePostAccountsUniversalTransfer
    privatePostAccountsSubTransfer::Function = privatePostAccountsSubTransfer
    privatePostAccountsInnerTransfer::Function = privatePostAccountsInnerTransfer
    privatePostTransferOut::Function = privatePostTransferOut
    privatePostTransferIn::Function = privatePostTransferIn
    privatePostHfOrders::Function = privatePostHfOrders
    privatePostHfOrdersTest::Function = privatePostHfOrdersTest
    privatePostHfOrdersSync::Function = privatePostHfOrdersSync
    privatePostHfOrdersMulti::Function = privatePostHfOrdersMulti
    privatePostHfOrdersMultiSync::Function = privatePostHfOrdersMultiSync
    privatePostHfOrdersAlter::Function = privatePostHfOrdersAlter
    privatePostHfOrdersDeadCancelAll::Function = privatePostHfOrdersDeadCancelAll
    privatePostOrders::Function = privatePostOrders
    privatePostOrdersTest::Function = privatePostOrdersTest
    privatePostOrdersMulti::Function = privatePostOrdersMulti
    privatePostStopOrder::Function = privatePostStopOrder
    privatePostOcoOrder::Function = privatePostOcoOrder
    privatePostHfMarginOrder::Function = privatePostHfMarginOrder
    privatePostHfMarginOrderTest::Function = privatePostHfMarginOrderTest
    privatePostHfMarginStopOrder::Function = privatePostHfMarginStopOrder
    privatePostMarginOrder::Function = privatePostMarginOrder
    privatePostMarginOrderTest::Function = privatePostMarginOrderTest
    privatePostHfMarginOcoOrder::Function = privatePostHfMarginOcoOrder
    privatePostMarginBorrow::Function = privatePostMarginBorrow
    privatePostMarginRepay::Function = privatePostMarginRepay
    privatePostPurchase::Function = privatePostPurchase
    privatePostRedeem::Function = privatePostRedeem
    privatePostLendPurchaseUpdate::Function = privatePostLendPurchaseUpdate
    privatePostConvertOrder::Function = privatePostConvertOrder
    privatePostConvertLimitOrder::Function = privatePostConvertLimitOrder
    privatePostBulletPrivate::Function = privatePostBulletPrivate
    privatePostPositionUpdateUserLeverage::Function = privatePostPositionUpdateUserLeverage
    privatePostDepositAddressCreate::Function = privatePostDepositAddressCreate
    privateDeleteSubApiKey::Function = privateDeleteSubApiKey
    privateDeleteWithdrawalsWithdrawalId::Function = privateDeleteWithdrawalsWithdrawalId
    privateDeleteHfOrdersOrderId::Function = privateDeleteHfOrdersOrderId
    privateDeleteHfOrdersSyncOrderId::Function = privateDeleteHfOrdersSyncOrderId
    privateDeleteHfOrdersClientOrderClientOid::Function = privateDeleteHfOrdersClientOrderClientOid
    privateDeleteHfOrdersSyncClientOrderClientOid::Function = privateDeleteHfOrdersSyncClientOrderClientOid
    privateDeleteHfOrdersCancelOrderId::Function = privateDeleteHfOrdersCancelOrderId
    privateDeleteHfOrders::Function = privateDeleteHfOrders
    privateDeleteHfOrdersCancelAll::Function = privateDeleteHfOrdersCancelAll
    privateDeleteOrdersOrderId::Function = privateDeleteOrdersOrderId
    privateDeleteOrderClientOrderClientOid::Function = privateDeleteOrderClientOrderClientOid
    privateDeleteOrders::Function = privateDeleteOrders
    privateDeleteStopOrderOrderId::Function = privateDeleteStopOrderOrderId
    privateDeleteStopOrderCancelOrderByClientOid::Function = privateDeleteStopOrderCancelOrderByClientOid
    privateDeleteStopOrderCancel::Function = privateDeleteStopOrderCancel
    privateDeleteOcoOrderOrderId::Function = privateDeleteOcoOrderOrderId
    privateDeleteOcoClientOrderClientOid::Function = privateDeleteOcoClientOrderClientOid
    privateDeleteOcoOrders::Function = privateDeleteOcoOrders
    privateDeleteHfMarginOrdersOrderId::Function = privateDeleteHfMarginOrdersOrderId
    privateDeleteHfMarginOrdersClientOrderClientOid::Function = privateDeleteHfMarginOrdersClientOrderClientOid
    privateDeleteHfMarginOrders::Function = privateDeleteHfMarginOrders
    privateDeleteHfMarginStopOrderCancelById::Function = privateDeleteHfMarginStopOrderCancelById
    privateDeleteHfMarginStopOrderCancelByClientOid::Function = privateDeleteHfMarginStopOrderCancelByClientOid
    privateDeleteHfMarginStopOrderCancel::Function = privateDeleteHfMarginStopOrderCancel
    privateDeleteHfMarginOcoOrderCancelById::Function = privateDeleteHfMarginOcoOrderCancelById
    privateDeleteHfMarginOcoOrderCancelByClientOid::Function = privateDeleteHfMarginOcoOrderCancelByClientOid
    privateDeleteHfMarginOcoOrderCancel::Function = privateDeleteHfMarginOcoOrderCancel
    privateDeleteConvertLimitOrderCancel::Function = privateDeleteConvertLimitOrderCancel
    futuresPublicGetContractsActive::Function = futuresPublicGetContractsActive
    futuresPublicGetContractsSymbol::Function = futuresPublicGetContractsSymbol
    futuresPublicGetTicker::Function = futuresPublicGetTicker
    futuresPublicGetAllTickers::Function = futuresPublicGetAllTickers
    futuresPublicGetLevel2Snapshot::Function = futuresPublicGetLevel2Snapshot
    futuresPublicGetLevel2Depth20::Function = futuresPublicGetLevel2Depth20
    futuresPublicGetLevel2Depth100::Function = futuresPublicGetLevel2Depth100
    futuresPublicGetTradeHistory::Function = futuresPublicGetTradeHistory
    futuresPublicGetKlineQuery::Function = futuresPublicGetKlineQuery
    futuresPublicGetInterestQuery::Function = futuresPublicGetInterestQuery
    futuresPublicGetIndexQuery::Function = futuresPublicGetIndexQuery
    futuresPublicGetMarkPriceSymbolCurrent::Function = futuresPublicGetMarkPriceSymbolCurrent
    futuresPublicGetPremiumQuery::Function = futuresPublicGetPremiumQuery
    futuresPublicGetTradeStatistics::Function = futuresPublicGetTradeStatistics
    futuresPublicGetFundingRateSymbolCurrent::Function = futuresPublicGetFundingRateSymbolCurrent
    futuresPublicGetContractFundingRates::Function = futuresPublicGetContractFundingRates
    futuresPublicGetTimestamp::Function = futuresPublicGetTimestamp
    futuresPublicGetStatus::Function = futuresPublicGetStatus
    futuresPublicGetLevel2MessageQuery::Function = futuresPublicGetLevel2MessageQuery
    futuresPublicGetContractsRiskLimitSymbol::Function = futuresPublicGetContractsRiskLimitSymbol
    futuresPublicGetLevel3MessageQuery::Function = futuresPublicGetLevel3MessageQuery
    futuresPublicGetLevel3Snapshot::Function = futuresPublicGetLevel3Snapshot
    futuresPublicPostBulletPublic::Function = futuresPublicPostBulletPublic
    futuresPrivateGetTransactionHistory::Function = futuresPrivateGetTransactionHistory
    futuresPrivateGetAccountOverview::Function = futuresPrivateGetAccountOverview
    futuresPrivateGetAccountOverviewAll::Function = futuresPrivateGetAccountOverviewAll
    futuresPrivateGetTransferList::Function = futuresPrivateGetTransferList
    futuresPrivateGetOrders::Function = futuresPrivateGetOrders
    futuresPrivateGetStopOrders::Function = futuresPrivateGetStopOrders
    futuresPrivateGetRecentDoneOrders::Function = futuresPrivateGetRecentDoneOrders
    futuresPrivateGetOrdersOrderId::Function = futuresPrivateGetOrdersOrderId
    futuresPrivateGetOrdersByClientOid::Function = futuresPrivateGetOrdersByClientOid
    futuresPrivateGetFills::Function = futuresPrivateGetFills
    futuresPrivateGetRecentFills::Function = futuresPrivateGetRecentFills
    futuresPrivateGetTradeFees::Function = futuresPrivateGetTradeFees
    futuresPrivateGetOpenOrderStatistics::Function = futuresPrivateGetOpenOrderStatistics
    futuresPrivateGetPosition::Function = futuresPrivateGetPosition
    futuresPrivateGetPositions::Function = futuresPrivateGetPositions
    futuresPrivateGetMarginMaxWithdrawMargin::Function = futuresPrivateGetMarginMaxWithdrawMargin
    futuresPrivateGetContractsRiskLimitSymbol::Function = futuresPrivateGetContractsRiskLimitSymbol
    futuresPrivateGetFundingHistory::Function = futuresPrivateGetFundingHistory
    futuresPrivateGetCopyTradeFuturesGetMaxOpenSize::Function = futuresPrivateGetCopyTradeFuturesGetMaxOpenSize
    futuresPrivateGetCopyTradeFuturesPositionMarginMaxWithdrawMargin::Function = futuresPrivateGetCopyTradeFuturesPositionMarginMaxWithdrawMargin
    futuresPrivateGetHistoryPositions::Function = futuresPrivateGetHistoryPositions
    futuresPrivateGetPositionGetMarginMode::Function = futuresPrivateGetPositionGetMarginMode
    futuresPrivateGetPositionGetPositionMode::Function = futuresPrivateGetPositionGetPositionMode
    futuresPrivateGetDepositAddress::Function = futuresPrivateGetDepositAddress
    futuresPrivateGetDepositList::Function = futuresPrivateGetDepositList
    futuresPrivateGetWithdrawalsQuotas::Function = futuresPrivateGetWithdrawalsQuotas
    futuresPrivateGetWithdrawalList::Function = futuresPrivateGetWithdrawalList
    futuresPrivateGetSubApiKey::Function = futuresPrivateGetSubApiKey
    futuresPrivateGetTradeStatistics::Function = futuresPrivateGetTradeStatistics
    futuresPrivateGetGetMaxOpenSize::Function = futuresPrivateGetGetMaxOpenSize
    futuresPrivateGetGetCrossUserLeverage::Function = futuresPrivateGetGetCrossUserLeverage
    futuresPrivatePostTransferOut::Function = futuresPrivatePostTransferOut
    futuresPrivatePostTransferIn::Function = futuresPrivatePostTransferIn
    futuresPrivatePostOrders::Function = futuresPrivatePostOrders
    futuresPrivatePostStOrders::Function = futuresPrivatePostStOrders
    futuresPrivatePostOrdersTest::Function = futuresPrivatePostOrdersTest
    futuresPrivatePostOrdersMulti::Function = futuresPrivatePostOrdersMulti
    futuresPrivatePostPositionMarginAutoDepositStatus::Function = futuresPrivatePostPositionMarginAutoDepositStatus
    futuresPrivatePostMarginWithdrawMargin::Function = futuresPrivatePostMarginWithdrawMargin
    futuresPrivatePostPositionMarginDepositMargin::Function = futuresPrivatePostPositionMarginDepositMargin
    futuresPrivatePostPositionRiskLimitLevelChange::Function = futuresPrivatePostPositionRiskLimitLevelChange
    futuresPrivatePostCopyTradeFuturesOrders::Function = futuresPrivatePostCopyTradeFuturesOrders
    futuresPrivatePostCopyTradeFuturesOrdersTest::Function = futuresPrivatePostCopyTradeFuturesOrdersTest
    futuresPrivatePostCopyTradeFuturesStOrders::Function = futuresPrivatePostCopyTradeFuturesStOrders
    futuresPrivatePostCopyTradeFuturesPositionMarginDepositMargin::Function = futuresPrivatePostCopyTradeFuturesPositionMarginDepositMargin
    futuresPrivatePostCopyTradeFuturesPositionMarginWithdrawMargin::Function = futuresPrivatePostCopyTradeFuturesPositionMarginWithdrawMargin
    futuresPrivatePostCopyTradeFuturesPositionRiskLimitLevelChange::Function = futuresPrivatePostCopyTradeFuturesPositionRiskLimitLevelChange
    futuresPrivatePostCopyTradeFuturesPositionMarginAutoDepositStatus::Function = futuresPrivatePostCopyTradeFuturesPositionMarginAutoDepositStatus
    futuresPrivatePostCopyTradeFuturesPositionChangeMarginMode::Function = futuresPrivatePostCopyTradeFuturesPositionChangeMarginMode
    futuresPrivatePostCopyTradeFuturesPositionChangeCrossUserLeverage::Function = futuresPrivatePostCopyTradeFuturesPositionChangeCrossUserLeverage
    futuresPrivatePostCopyTradeGetCrossModeMarginRequirement::Function = futuresPrivatePostCopyTradeGetCrossModeMarginRequirement
    futuresPrivatePostCopyTradePositionSwitchPositionMode::Function = futuresPrivatePostCopyTradePositionSwitchPositionMode
    futuresPrivatePostChangeCrossUserLeverage::Function = futuresPrivatePostChangeCrossUserLeverage
    futuresPrivatePostWithdrawals::Function = futuresPrivatePostWithdrawals
    futuresPrivatePostSubApiKey::Function = futuresPrivatePostSubApiKey
    futuresPrivatePostSubApiKeyUpdate::Function = futuresPrivatePostSubApiKeyUpdate
    futuresPrivatePostPositionChangeMarginMode::Function = futuresPrivatePostPositionChangeMarginMode
    futuresPrivatePostPositionSwitchPositionMode::Function = futuresPrivatePostPositionSwitchPositionMode
    futuresPrivatePostBulletPrivate::Function = futuresPrivatePostBulletPrivate
    futuresPrivateDeleteOrdersOrderId::Function = futuresPrivateDeleteOrdersOrderId
    futuresPrivateDeleteOrdersClientOrderClientOid::Function = futuresPrivateDeleteOrdersClientOrderClientOid
    futuresPrivateDeleteOrders::Function = futuresPrivateDeleteOrders
    futuresPrivateDeleteStopOrders::Function = futuresPrivateDeleteStopOrders
    futuresPrivateDeleteCopyTradeFuturesOrders::Function = futuresPrivateDeleteCopyTradeFuturesOrders
    futuresPrivateDeleteCopyTradeFuturesOrdersClientOrder::Function = futuresPrivateDeleteCopyTradeFuturesOrdersClientOrder
    futuresPrivateDeleteOrdersMultiCancel::Function = futuresPrivateDeleteOrdersMultiCancel
    futuresPrivateDeleteWithdrawalsWithdrawalId::Function = futuresPrivateDeleteWithdrawalsWithdrawalId
    futuresPrivateDeleteCancelTransferOut::Function = futuresPrivateDeleteCancelTransferOut
    futuresPrivateDeleteSubApiKey::Function = futuresPrivateDeleteSubApiKey
    webExchangeGetCurrencyCurrencyChainInfo::Function = webExchangeGetCurrencyCurrencyChainInfo
    webExchangeGetContractSymbolFundingRates::Function = webExchangeGetContractSymbolFundingRates
    brokerGetBrokerNdInfo::Function = brokerGetBrokerNdInfo
    brokerGetBrokerNdAccount::Function = brokerGetBrokerNdAccount
    brokerGetBrokerNdAccountApikey::Function = brokerGetBrokerNdAccountApikey
    brokerGetBrokerNdRebaseDownload::Function = brokerGetBrokerNdRebaseDownload
    brokerGetAssetNdbrokerDepositList::Function = brokerGetAssetNdbrokerDepositList
    brokerGetBrokerNdTransferDetail::Function = brokerGetBrokerNdTransferDetail
    brokerGetBrokerNdDepositDetail::Function = brokerGetBrokerNdDepositDetail
    brokerGetBrokerNdWithdrawDetail::Function = brokerGetBrokerNdWithdrawDetail
    brokerPostBrokerNdTransfer::Function = brokerPostBrokerNdTransfer
    brokerPostBrokerNdAccount::Function = brokerPostBrokerNdAccount
    brokerPostBrokerNdAccountApikey::Function = brokerPostBrokerNdAccountApikey
    brokerPostBrokerNdAccountUpdateApikey::Function = brokerPostBrokerNdAccountUpdateApikey
    brokerDeleteBrokerNdAccountApikey::Function = brokerDeleteBrokerNdAccountApikey
    earnGetOtcLoanDiscountRateConfigs::Function = earnGetOtcLoanDiscountRateConfigs
    earnGetOtcLoanLoan::Function = earnGetOtcLoanLoan
    earnGetOtcLoanAccounts::Function = earnGetOtcLoanAccounts
    earnGetEarnRedeemPreview::Function = earnGetEarnRedeemPreview
    earnGetEarnSavingProducts::Function = earnGetEarnSavingProducts
    earnGetEarnHoldAssets::Function = earnGetEarnHoldAssets
    earnGetEarnPromotionProducts::Function = earnGetEarnPromotionProducts
    earnGetEarnKcsStakingProducts::Function = earnGetEarnKcsStakingProducts
    earnGetEarnStakingProducts::Function = earnGetEarnStakingProducts
    earnGetEarnEthStakingProducts::Function = earnGetEarnEthStakingProducts
    earnGetStructEarnDualProducts::Function = earnGetStructEarnDualProducts
    earnGetStructEarnOrders::Function = earnGetStructEarnOrders
    earnPostEarnOrders::Function = earnPostEarnOrders
    earnPostStructEarnOrders::Function = earnPostStructEarnOrders
    earnDeleteEarnOrders::Function = earnDeleteEarnOrders
    utaGetMarketAnnouncement::Function = utaGetMarketAnnouncement
    utaGetMarketCurrency::Function = utaGetMarketCurrency
    utaGetAssetCurrencies::Function = utaGetAssetCurrencies
    utaGetMarketInstrument::Function = utaGetMarketInstrument
    utaGetMarketTicker::Function = utaGetMarketTicker
    utaGetMarketTrade::Function = utaGetMarketTrade
    utaGetMarketKline::Function = utaGetMarketKline
    utaGetMarketFundingRate::Function = utaGetMarketFundingRate
    utaGetMarketFundingRateHistory::Function = utaGetMarketFundingRateHistory
    utaGetMarketCrossConfig::Function = utaGetMarketCrossConfig
    utaGetMarketCollateralDiscountRatio::Function = utaGetMarketCollateralDiscountRatio
    utaGetMarketIndexPrice::Function = utaGetMarketIndexPrice
    utaGetMarketPositionTiers::Function = utaGetMarketPositionTiers
    utaGetMarketOpenInterest::Function = utaGetMarketOpenInterest
    utaGetServerStatus::Function = utaGetServerStatus
    utaGetMarketBorrowableCurrency::Function = utaGetMarketBorrowableCurrency
    utaGetUserMyIp::Function = utaGetUserMyIp
    utaGetMarketFiatPrice::Function = utaGetMarketFiatPrice
    utaPrivateGetMarketOrderbook::Function = utaPrivateGetMarketOrderbook
    utaPrivateGetAccountBalance::Function = utaPrivateGetAccountBalance
    utaPrivateGetAccountTransferQuota::Function = utaPrivateGetAccountTransferQuota
    utaPrivateGetAccountMode::Function = utaPrivateGetAccountMode
    utaPrivateGetAccountLedger::Function = utaPrivateGetAccountLedger
    utaPrivateGetAccountInterestHistory::Function = utaPrivateGetAccountInterestHistory
    utaPrivateGetAssetDepositAddress::Function = utaPrivateGetAssetDepositAddress
    utaPrivateGetAccountDepositAddress::Function = utaPrivateGetAccountDepositAddress
    utaPrivateGetAccountModeAccountBalance::Function = utaPrivateGetAccountModeAccountBalance
    utaPrivateGetAccountModeAccountOverview::Function = utaPrivateGetAccountModeAccountOverview
    utaPrivateGetAccountModeOrderDetail::Function = utaPrivateGetAccountModeOrderDetail
    utaPrivateGetAccountModeOrderOpenList::Function = utaPrivateGetAccountModeOrderOpenList
    utaPrivateGetAccountModeOrderHistory::Function = utaPrivateGetAccountModeOrderHistory
    utaPrivateGetAccountModeOrderExecution::Function = utaPrivateGetAccountModeOrderExecution
    utaPrivateGetAccountModePositionOpenList::Function = utaPrivateGetAccountModePositionOpenList
    utaPrivateGetAccountModePositionHistory::Function = utaPrivateGetAccountModePositionHistory
    utaPrivateGetPositionHistory::Function = utaPrivateGetPositionHistory
    utaPrivateGetAccountModePositionTiers::Function = utaPrivateGetAccountModePositionTiers
    utaPrivateGetSubAccountBalance::Function = utaPrivateGetSubAccountBalance
    utaPrivateGetUserFeeRate::Function = utaPrivateGetUserFeeRate
    utaPrivateGetDcpQuery::Function = utaPrivateGetDcpQuery
    utaPrivateGetUnifiedAccountLeverage::Function = utaPrivateGetUnifiedAccountLeverage
    utaPrivateGetPositionFundingHistory::Function = utaPrivateGetPositionFundingHistory
    utaPrivateGetAccountInterestLimits::Function = utaPrivateGetAccountInterestLimits
    utaPrivatePostAccountTransfer::Function = utaPrivatePostAccountTransfer
    utaPrivatePostAccountMode::Function = utaPrivatePostAccountMode
    utaPrivatePostAccountModeAccountModifyLeverage::Function = utaPrivatePostAccountModeAccountModifyLeverage
    utaPrivatePostAccountModeOrderPlace::Function = utaPrivatePostAccountModeOrderPlace
    utaPrivatePostAccountModeOrderPlaceBatch::Function = utaPrivatePostAccountModeOrderPlaceBatch
    utaPrivatePostAccountModeOrderCancel::Function = utaPrivatePostAccountModeOrderCancel
    utaPrivatePostAccountModeOrderCancelBatch::Function = utaPrivatePostAccountModeOrderCancelBatch
    utaPrivatePostAccountModeOrderCancelAll::Function = utaPrivatePostAccountModeOrderCancelAll
    utaPrivatePostSubAccountCanTransferOut::Function = utaPrivatePostSubAccountCanTransferOut
    utaPrivatePostDcpSet::Function = utaPrivatePostDcpSet
    utaPrivatePostAccountModeAccountModifyLeverageMarginCross::Function = utaPrivatePostAccountModeAccountModifyLeverageMarginCross

end
function describe(self::Kucoin, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "kucoin",
    Symbol("name") => "KuCoin",
    Symbol("countries") => ["SC"],
    Symbol("rateLimit") => 7.5,
    Symbol("version") => "v2",
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("comment") => "Platform 2.0",
    Symbol("quoteJsonNumbers") => false,
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
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => true,
        Symbol("createDepositAddress") => true,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrderWithCost") => true,
        Symbol("createMarketSellOrderWithCost") => true,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => true,
        Symbol("createPostOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopLossOrder") => true,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => true,
        Symbol("createTriggerOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => true,
        Symbol("fetchBorrowRateHistories") => true,
        Symbol("fetchBorrowRateHistory") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => true,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => true,
        Symbol("fetchDepositWithdrawFees") => true,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingInterval") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchL3OrderBook") => true,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => true,
        Symbol("fetchMarketLeverageTiers") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMarkPrice") => true,
        Symbol("fetchMarkPrices") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => true,
        Symbol("fetchOpenInterests") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrdersByStatus") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositionADLRank") => true,
        Symbol("fetchPositionHistory") => true,
        Symbol("fetchPositionMode") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsADLRank") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchPremiumIndexOHLCV") => true,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransactionFee") => true,
        Symbol("fetchTransfers") => true,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => true,
        Symbol("repayIsolatedMargin") => true,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => true,
        Symbol("signIn") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg",
        Symbol("referral") => "https://www.kucoin.com/ucenter/signup?rcode=E5wkqe",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.kucoin.com",
            Symbol("private") => "https://api.kucoin.com",
            Symbol("futuresPrivate") => "https://api-futures.kucoin.com",
            Symbol("futuresPublic") => "https://api-futures.kucoin.com",
            Symbol("webExchange") => "https://kucoin.com/_api",
            Symbol("broker") => "https://api-broker.kucoin.com",
            Symbol("earn") => "https://api.kucoin.com",
            Symbol("uta") => "https://api.kucoin.com",
            Symbol("utaPrivate") => "https://api.kucoin.com"
        ),
        Symbol("www") => "https://www.kucoin.com",
        Symbol("doc") => ["https://docs.kucoin.com"]
    ),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("password") => true
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("currencies/{currency}") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("market/orderbook/level1") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("market/allTickers") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("market/stats") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("markets") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("market/orderbook/level{level}_{limit}") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("market/orderbook/level2_20") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("market/orderbook/level2_100") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("market/histories") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("market/candles") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("prices") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("timestamp") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("status") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("mark-price/{symbol}/current") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("mark-price/all-symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("margin/config") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("announcements") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("margin/collateralRatio") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("convert/symbol") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("convert/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("bullet-public") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("user-info") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("user/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("accounts/{accountId}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("accounts/ledgers") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/accounts/ledgers") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/account/ledgers") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("transaction-history") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("sub/user") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("sub-accounts/{subUserId}") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sub-accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("sub/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("margin/account") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("margin/accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("isolated/accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("deposit-addresses") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("hist-deposits") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("hist-withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("withdrawals/quotas") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("accounts/transferable") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("transfer-list") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("base-fee") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("trade-fees") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("market/orderbook/level{level}") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("market/orderbook/level2") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("market/orderbook/level3") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("hf/accounts/opened") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/orders/active") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/orders/active/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/order/active/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/orders/done") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/orders/client-order/{clientOid}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/orders/dead-cancel-all/query") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("limit/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("order/client-order/{clientOid}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("fills") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("limit/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("stop-order/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("stop-order/queryOrderByClientOid") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("oco/order/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("oco/order/details/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("oco/client-order/{clientOid}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("oco/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/orders/active") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("hf/margin/orders/done") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("hf/margin/orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("hf/margin/orders/client-order/{clientOid}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("hf/margin/fills") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("hf/margin/stop-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("hf/margin/stop-order/orderId") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("hf/margin/stop-order/clientOid") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("hf/margin/oco-order/orderId") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/oco-order/clientOid") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/oco-order/detail/orderId") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/oco-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("etf/info") => Dict{Symbol, Any}(
    Symbol("cost") => 25
),
                Symbol("margin/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("risk/limit/strategy") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("isolated/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("margin/symbols") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("isolated/account/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("margin/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("margin/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("margin/interest") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("project/list") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("project/marketInterestRate") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("redeem/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("purchase/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("broker/api/rebase/download") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("broker/queryMyCommission") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("broker/queryUser") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("broker/queryDetailByUid") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("migrate/user/account/status") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("convert/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("convert/order/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("convert/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("convert/limit/quote") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("convert/limit/order/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("convert/limit/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("affiliate/inviter/statistics") => Dict{Symbol, Any}(
    Symbol("cost") => 30
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("sub/user/created") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("sub/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("sub/api-key/update") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("deposit-addresses") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("accounts/universal-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("accounts/sub-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("accounts/inner-transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("transfer-out") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("transfer-in") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("hf/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders/test") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders/sync") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders/multi") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders/multi/sync") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders/alter") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders/dead-cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("orders/test") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("orders/multi") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("oco/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/order/test") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/stop-order") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("margin/order") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("margin/order/test") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("hf/margin/oco-order") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("margin/borrow") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("margin/repay") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("purchase") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("redeem") => Dict{Symbol, Any}(
    Symbol("cost") => 15
),
                Symbol("lend/purchase/update") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("convert/order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("convert/limit/order") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("bullet-private") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("position/update-user-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("deposit-address/create") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("sub/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("withdrawals/{withdrawalId}") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("hf/orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders/sync/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders/client-order/{clientOid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders/sync/client-order/{clientOid}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders/cancel/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("hf/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/orders/cancelAll") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("order/client-order/{clientOid}") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("stop-order/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("stop-order/cancelOrderByClientOid") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("stop-order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("oco/order/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("oco/client-order/{clientOid}") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("oco/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("hf/margin/orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/orders/client-order/{clientOid}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("hf/margin/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("hf/margin/stop-order/cancel-by-id") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("hf/margin/stop-order/cancel-by-clientOid") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("hf/margin/stop-order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("hf/margin/oco-order/cancel-by-id") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("hf/margin/oco-order/cancel-by-clientOid") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("hf/margin/oco-order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("convert/limit/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 5
)
            )
        ),
        Symbol("futuresPublic") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("contracts/active") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("contracts/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("allTickers") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("level2/snapshot") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("level2/depth20") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("level2/depth100") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("trade/history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("kline/query") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("interest/query") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("index/query") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("mark-price/{symbol}/current") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("premium/query") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("trade-statistics") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("funding-rate/{symbol}/current") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("contract/funding-rates") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("timestamp") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("status") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("level2/message/query") => Dict{Symbol, Any}(
    Symbol("cost") => 1.3953
),
                Symbol("contracts/risk-limit/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("level3/message/query") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("level3/snapshot") => Dict{Symbol, Any}(
    Symbol("cost") => 3
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("bullet-public") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            )
        ),
        Symbol("futuresPrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("transaction-history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account-overview") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account-overview-all") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("transfer-list") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("stopOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 12
),
                Symbol("recentDoneOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("orders/byClientOid") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("fills") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("recentFills") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("trade-fees") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("openOrderStatistics") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("position") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("positions") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("margin/maxWithdrawMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("contracts/risk-limit/{symbol}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("funding-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("copy-trade/futures/get-max-open-size") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("copy-trade/futures/position/margin/max-withdraw-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("history-positions") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("position/getMarginMode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("position/getPositionMode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("deposit-address") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("deposit-list") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("withdrawals/quotas") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("withdrawal-list") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("sub/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("trade-statistics") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("getMaxOpenSize") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("getCrossUserLeverage") => Dict{Symbol, Any}(
    Symbol("cost") => 4
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("transfer-out") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("transfer-in") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("st-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("orders/test") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("orders/multi") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("position/margin/auto-deposit-status") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("margin/withdrawMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("position/margin/deposit-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("position/risk-limit-level/change") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("copy-trade/futures/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copy-trade/futures/orders/test") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copy-trade/futures/st-orders") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copy-trade/futures/position/margin/deposit-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("copy-trade/futures/position/margin/withdraw-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("copy-trade/futures/position/risk-limit-level/change") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copy-trade/futures/position/margin/auto-deposit-status") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("copy-trade/futures/position/changeMarginMode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copy-trade/futures/position/changeCrossUserLeverage") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("copy-trade/getCrossModeMarginRequirement") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("copy-trade/position/switchPositionMode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("changeCrossUserLeverage") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("withdrawals") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("sub/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("sub/api-key/update") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("position/changeMarginMode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("position/switchPositionMode") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("bullet-private") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("orders/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("orders/client-order/{clientOid}") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("orders") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("stopOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("copy-trade/futures/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 1.5
),
                Symbol("copy-trade/futures/orders/client-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1.5
),
                Symbol("orders/multi-cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("withdrawals/{withdrawalId}") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("cancel/transfer-out") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("sub/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            )
        ),
        Symbol("webExchange") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("currency/currency/chain-info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("contract/{symbol}/funding-rates") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
            )
        ),
        Symbol("broker") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("broker/nd/info") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("broker/nd/account") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("broker/nd/account/apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("broker/nd/rebase/download") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("asset/ndbroker/deposit/list") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("broker/nd/transfer/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("broker/nd/deposit/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("broker/nd/withdraw/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 2
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("broker/nd/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("broker/nd/account") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("broker/nd/account/apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("broker/nd/account/update-apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 6
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("broker/nd/account/apikey") => Dict{Symbol, Any}(
    Symbol("cost") => 6
)
            )
        ),
        Symbol("earn") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("otc-loan/discount-rate-configs") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("otc-loan/loan") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("otc-loan/accounts") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("earn/redeem-preview") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("earn/saving/products") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("earn/hold-assets") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("earn/promotion/products") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("earn/kcs-staking/products") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("earn/staking/products") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("earn/eth-staking/products") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("struct-earn/dual/products") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("struct-earn/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("earn/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("struct-earn/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("earn/orders") => Dict{Symbol, Any}(
    Symbol("cost") => 10
)
            )
        ),
        Symbol("uta") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("market/announcement") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("market/currency") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("asset/currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("market/instrument") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("market/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("market/trade") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("market/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("market/funding-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("market/funding-rate-history") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("market/cross-config") => Dict{Symbol, Any}(
    Symbol("cost") => 50
),
                Symbol("market/collateral-discount-ratio") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("market/index-price") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("market/position-tiers") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("market/open-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("server/status") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("market/borrowable-currency") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("user/my-ip") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("market/fiat-price") => Dict{Symbol, Any}(
    Symbol("cost") => 6
)
            )
        ),
        Symbol("utaPrivate") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("market/orderbook") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account/transfer-quota") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("account/mode") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                Symbol("account/ledger") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("account/interest-history") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("asset/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("account/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("{accountMode}/account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("{accountMode}/account/overview") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("{accountMode}/order/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("{accountMode}/order/open-list") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("{accountMode}/order/history") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("{accountMode}/order/execution") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("{accountMode}/position/open-list") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("{accountMode}/position/history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("position/history") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("{accountMode}/position/tiers") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("sub-account/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("user/fee-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 6
),
                Symbol("dcp/query") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("unified/account/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 20
),
                Symbol("position/funding-history") => Dict{Symbol, Any}(
    Symbol("cost") => 30
),
                Symbol("account/interest-limits") => Dict{Symbol, Any}(
    Symbol("cost") => 20
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("account/mode") => Dict{Symbol, Any}(
    Symbol("cost") => 60
),
                Symbol("{accountMode}/account/modify-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("{accountMode}/order/place") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("{accountMode}/order/place-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("{accountMode}/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 2
),
                Symbol("{accountMode}/order/cancel-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 8
),
                Symbol("{accountMode}/order/cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("sub-account/canTransferOut") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("dcp/set") => Dict{Symbol, Any}(
    Symbol("cost") => 4
),
                Symbol("{accountMode}/account/modify-leverage-margin-cross") => Dict{Symbol, Any}(
    Symbol("cost") => 40
)
            )
        )
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
        Symbol("8h") => "8hour",
        Symbol("12h") => "12hour",
        Symbol("1d") => "1day",
        Symbol("1w") => "1week",
        Symbol("1M") => "1month"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("Order not exist or not allow to be cancelled") => OrderNotFound,
            Symbol("The order does not exist.") => OrderNotFound,
            Symbol("order not exist") => OrderNotFound,
            Symbol("order not exist.") => OrderNotFound,
            Symbol("order_not_exist") => OrderNotFound,
            Symbol("order_not_exist_or_not_allow_to_cancel") => OrderNotFound,
            Symbol("Order size below the minimum requirement.") => InvalidOrder,
            Symbol("Order size increment invalid.") => InvalidOrder,
            Symbol("The withdrawal amount is below the minimum requirement.") => ExchangeError,
            Symbol("Unsuccessful! Exceeded the max. funds out-transfer limit") => InsufficientFunds,
            Symbol("The amount increment is invalid.") => BadRequest,
            Symbol("The quantity is below the minimum requirement.") => InvalidOrder,
            Symbol("not in the given range!") => BadRequest,
            Symbol("recAccountType not in the given range") => BadRequest,
            Symbol("Unsupported trading pair.") => BadSymbol,
            Symbol("400") => BadRequest,
            Symbol("401") => AuthenticationError,
            Symbol("403") => NotSupported,
            Symbol("404") => NotSupported,
            Symbol("405") => NotSupported,
            Symbol("415") => NotSupported,
            Symbol("429") => RateLimitExceeded,
            Symbol("500") => ExchangeNotAvailable,
            Symbol("503") => ExchangeNotAvailable,
            Symbol("101030") => PermissionDenied,
            Symbol("103000") => InvalidOrder,
            Symbol("112010") => PermissionDenied,
            Symbol("130101") => BadRequest,
            Symbol("130102") => ExchangeError,
            Symbol("130103") => OrderNotFound,
            Symbol("130104") => ExchangeError,
            Symbol("130105") => InsufficientFunds,
            Symbol("130106") => NotSupported,
            Symbol("130107") => ExchangeError,
            Symbol("130108") => OrderNotFound,
            Symbol("130201") => PermissionDenied,
            Symbol("130202") => ExchangeError,
            Symbol("130203") => InsufficientFunds,
            Symbol("130204") => BadRequest,
            Symbol("130301") => InsufficientFunds,
            Symbol("130302") => PermissionDenied,
            Symbol("130303") => NotSupported,
            Symbol("130304") => NotSupported,
            Symbol("130305") => NotSupported,
            Symbol("130306") => NotSupported,
            Symbol("130307") => NotSupported,
            Symbol("130308") => InvalidOrder,
            Symbol("130309") => InvalidOrder,
            Symbol("130310") => ExchangeError,
            Symbol("130311") => InvalidOrder,
            Symbol("130312") => InvalidOrder,
            Symbol("130313") => InvalidOrder,
            Symbol("130314") => InvalidOrder,
            Symbol("130315") => NotSupported,
            Symbol("126000") => ExchangeError,
            Symbol("126001") => NotSupported,
            Symbol("126002") => ExchangeError,
            Symbol("126003") => InvalidOrder,
            Symbol("126004") => ExchangeError,
            Symbol("126005") => PermissionDenied,
            Symbol("126006") => ExchangeError,
            Symbol("126007") => ExchangeError,
            Symbol("126009") => ExchangeError,
            Symbol("126010") => ExchangeError,
            Symbol("126011") => ExchangeError,
            Symbol("126013") => InsufficientFunds,
            Symbol("126015") => ExchangeError,
            Symbol("126021") => NotSupported,
            Symbol("126022") => InvalidOrder,
            Symbol("126027") => InvalidOrder,
            Symbol("126028") => InvalidOrder,
            Symbol("126029") => InvalidOrder,
            Symbol("126030") => InvalidOrder,
            Symbol("126033") => InvalidOrder,
            Symbol("126034") => InvalidOrder,
            Symbol("126036") => InvalidOrder,
            Symbol("126037") => ExchangeError,
            Symbol("126038") => ExchangeError,
            Symbol("126039") => ExchangeError,
            Symbol("126041") => ExchangeError,
            Symbol("126042") => ExchangeError,
            Symbol("126043") => OrderNotFound,
            Symbol("126044") => InvalidOrder,
            Symbol("126045") => NotSupported,
            Symbol("126046") => NotSupported,
            Symbol("126047") => PermissionDenied,
            Symbol("126048") => PermissionDenied,
            Symbol("135005") => ExchangeError,
            Symbol("135018") => ExchangeError,
            Symbol("200004") => InsufficientFunds,
            Symbol("210014") => InvalidOrder,
            Symbol("210021") => InsufficientFunds,
            Symbol("230003") => InsufficientFunds,
            Symbol("260000") => InvalidAddress,
            Symbol("260100") => InsufficientFunds,
            Symbol("300000") => InvalidOrder,
            Symbol("400000") => BadSymbol,
            Symbol("400001") => AuthenticationError,
            Symbol("400002") => InvalidNonce,
            Symbol("400003") => AuthenticationError,
            Symbol("400004") => AuthenticationError,
            Symbol("400005") => AuthenticationError,
            Symbol("400006") => AuthenticationError,
            Symbol("400007") => AuthenticationError,
            Symbol("400008") => NotSupported,
            Symbol("400100") => BadRequest,
            Symbol("400200") => InvalidOrder,
            Symbol("400330") => InvalidOrder,
            Symbol("400350") => InvalidOrder,
            Symbol("400370") => InvalidOrder,
            Symbol("400400") => BadRequest,
            Symbol("400401") => AuthenticationError,
            Symbol("400500") => RestrictedLocation,
            Symbol("400600") => BadSymbol,
            Symbol("400760") => InvalidOrder,
            Symbol("401000") => BadRequest,
            Symbol("408000") => BadRequest,
            Symbol("411100") => AccountSuspended,
            Symbol("415000") => BadRequest,
            Symbol("400303") => PermissionDenied,
            Symbol("500000") => ExchangeNotAvailable,
            Symbol("260220") => InvalidAddress,
            Symbol("600100") => InsufficientFunds,
            Symbol("600101") => InvalidOrder,
            Symbol("900014") => BadRequest,
            Symbol("330012") => InvalidOrder,
            Symbol("330005") => InvalidOrder,
            Symbol("100001") => OrderNotFound,
            Symbol("100004") => BadRequest,
            Symbol("300003") => InsufficientFunds,
            Symbol("300012") => InvalidOrder,
            Symbol("404000") => NotSupported,
            Symbol("300009") => InvalidOrder,
            Symbol("330008") => InsufficientFunds
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("pageSize should not greater than 500") => BadRequest,
            Symbol("Exceeded the access frequency") => RateLimitExceeded,
            Symbol("require more permission") => PermissionDenied,
            Symbol("Position does not exist") => OrderNotFound
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.001"),
            Symbol("maker") => self.parseNumber("0.001"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.001")], [self.parseNumber("50"), self.parseNumber("0.001")], [self.parseNumber("200"), self.parseNumber("0.0009")], [self.parseNumber("500"), self.parseNumber("0.0008")], [self.parseNumber("1000"), self.parseNumber("0.0007")], [self.parseNumber("2000"), self.parseNumber("0.0007")], [self.parseNumber("4000"), self.parseNumber("0.0006")], [self.parseNumber("8000"), self.parseNumber("0.0005")], [self.parseNumber("15000"), self.parseNumber("0.00045")], [self.parseNumber("25000"), self.parseNumber("0.0004")], [self.parseNumber("40000"), self.parseNumber("0.00035")], [self.parseNumber("60000"), self.parseNumber("0.0003")], [self.parseNumber("80000"), self.parseNumber("0.00025")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.001")], [self.parseNumber("50"), self.parseNumber("0.0009")], [self.parseNumber("200"), self.parseNumber("0.0007")], [self.parseNumber("500"), self.parseNumber("0.0005")], [self.parseNumber("1000"), self.parseNumber("0.0003")], [self.parseNumber("2000"), self.parseNumber("0")], [self.parseNumber("4000"), self.parseNumber("0")], [self.parseNumber("8000"), self.parseNumber("0")], [self.parseNumber("15000"), self.parseNumber("-0.00005")], [self.parseNumber("25000"), self.parseNumber("-0.00005")], [self.parseNumber("40000"), self.parseNumber("-0.00005")], [self.parseNumber("60000"), self.parseNumber("-0.00005")], [self.parseNumber("80000"), self.parseNumber("-0.00005")]]
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.001"),
            Symbol("maker") => self.parseNumber("0.001"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.001")], [self.parseNumber("50"), self.parseNumber("0.001")], [self.parseNumber("200"), self.parseNumber("0.0009")], [self.parseNumber("500"), self.parseNumber("0.0008")], [self.parseNumber("1000"), self.parseNumber("0.0007")], [self.parseNumber("2000"), self.parseNumber("0.0007")], [self.parseNumber("4000"), self.parseNumber("0.0006")], [self.parseNumber("8000"), self.parseNumber("0.0005")], [self.parseNumber("15000"), self.parseNumber("0.00045")], [self.parseNumber("25000"), self.parseNumber("0.0004")], [self.parseNumber("40000"), self.parseNumber("0.00035")], [self.parseNumber("60000"), self.parseNumber("0.0003")], [self.parseNumber("80000"), self.parseNumber("0.00025")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.001")], [self.parseNumber("50"), self.parseNumber("0.0009")], [self.parseNumber("200"), self.parseNumber("0.0007")], [self.parseNumber("500"), self.parseNumber("0.0005")], [self.parseNumber("1000"), self.parseNumber("0.0003")], [self.parseNumber("2000"), self.parseNumber("0")], [self.parseNumber("4000"), self.parseNumber("0")], [self.parseNumber("8000"), self.parseNumber("0")], [self.parseNumber("15000"), self.parseNumber("-0.00005")], [self.parseNumber("25000"), self.parseNumber("-0.00005")], [self.parseNumber("40000"), self.parseNumber("-0.00005")], [self.parseNumber("60000"), self.parseNumber("-0.00005")], [self.parseNumber("80000"), self.parseNumber("-0.00005")]]
            )
        ),
        Symbol("contract") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("taker") => self.parseNumber("0.0006"),
            Symbol("maker") => self.parseNumber("0.0002"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0006")], [self.parseNumber("50"), self.parseNumber("0.0006")], [self.parseNumber("200"), self.parseNumber("0.0006")], [self.parseNumber("500"), self.parseNumber("0.0005")], [self.parseNumber("1000"), self.parseNumber("0.0004")], [self.parseNumber("2000"), self.parseNumber("0.0004")], [self.parseNumber("4000"), self.parseNumber("0.00038")], [self.parseNumber("8000"), self.parseNumber("0.00035")], [self.parseNumber("15000"), self.parseNumber("0.00032")], [self.parseNumber("25000"), self.parseNumber("0.0003")], [self.parseNumber("40000"), self.parseNumber("0.0003")], [self.parseNumber("60000"), self.parseNumber("0.0003")], [self.parseNumber("80000"), self.parseNumber("0.0003")]],
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.02")], [self.parseNumber("50"), self.parseNumber("0.015")], [self.parseNumber("200"), self.parseNumber("0.01")], [self.parseNumber("500"), self.parseNumber("0.01")], [self.parseNumber("1000"), self.parseNumber("0.01")], [self.parseNumber("2000"), self.parseNumber("0")], [self.parseNumber("4000"), self.parseNumber("0")], [self.parseNumber("8000"), self.parseNumber("0")], [self.parseNumber("15000"), self.parseNumber("-0.003")], [self.parseNumber("25000"), self.parseNumber("-0.006")], [self.parseNumber("40000"), self.parseNumber("-0.009")], [self.parseNumber("60000"), self.parseNumber("-0.012")], [self.parseNumber("80000"), self.parseNumber("-0.015")]]
            )
        ),
        Symbol("funding") => Dict{Symbol, Any}(
            Symbol("tierBased") => false,
            Symbol("percentage") => false,
            Symbol("withdraw") => Dict{Symbol, Any}(),
            Symbol("deposit") => Dict{Symbol, Any}()
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("BIFI") => "BIFIF",
        Symbol("VAI") => "VAIOT",
        Symbol("WAX") => "WAXP",
        Symbol("ALT") => "APTOSLAUNCHTOKEN",
        Symbol("KALT") => "ALT",
        Symbol("FUD") => "FTX Users\' Debt"
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("hf") => nothing,
        Symbol("uta") => nothing,
        Symbol("version") => "v1",
        Symbol("symbolSeparator") => "-",
        Symbol("fetchMyTradesMethod") => "private_get_fills",
        Symbol("timeDifference") => 0,
        Symbol("adjustForTimeDifference") => false,
        Symbol("fetchCurrencies") => Dict{Symbol, Any}(
            Symbol("brokenCurrencies") => ["00", "OPEN_ERROR", "HUF", "BDT"]
        ),
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot", "swap", "future", "contract"],
            Symbol("fetchTickersFees") => true
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("includeFee") => false
        ),
        Symbol("transfer") => Dict{Symbol, Any}(
            Symbol("fillResponseFromRequest") => true
        ),
        Symbol("fetchBalance") => Dict{Symbol, Any}(
            Symbol("code") => "USDT"
        ),
        Symbol("setLeverage") => Dict{Symbol, Any}(
            Symbol("code") => "USDT"
        ),
        Symbol("timeInForce") => Dict{Symbol, Any}(
            Symbol("IOC") => "IOC",
            Symbol("FOK") => "FOK",
            Symbol("PO") => "PO",
            Symbol("GTD") => "GTT",
            Symbol("RPI") => "RPI"
        ),
        Symbol("timeframes") => Dict{Symbol, Any}(
            Symbol("swap") => Dict{Symbol, Any}(
                Symbol("1m") => 1,
                Symbol("3m") => nothing,
                Symbol("5m") => 5,
                Symbol("15m") => 15,
                Symbol("30m") => 30,
                Symbol("1h") => 60,
                Symbol("2h") => 120,
                Symbol("4h") => 240,
                Symbol("6h") => nothing,
                Symbol("8h") => 480,
                Symbol("12h") => 720,
                Symbol("1d") => 1440,
                Symbol("1w") => 10080
            )
        ),
        Symbol("versions") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("GET") => Dict{Symbol, Any}(
                    Symbol("currencies") => "v3",
                    Symbol("currencies/{currency}") => "v3",
                    Symbol("symbols") => "v2",
                    Symbol("mark-price/all-symbols") => "v3",
                    Symbol("announcements") => "v3"
                )
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("GET") => Dict{Symbol, Any}(
                    Symbol("user-info") => "v2",
                    Symbol("hf/margin/account/ledgers") => "v3",
                    Symbol("sub/user") => "v2",
                    Symbol("sub-accounts") => "v2",
                    Symbol("margin/accounts") => "v3",
                    Symbol("isolated/accounts") => "v3",
                    Symbol("deposit-addresses") => "v1",
                    Symbol("market/orderbook/level2") => "v3",
                    Symbol("market/orderbook/level3") => "v3",
                    Symbol("market/orderbook/level{level}") => "v3",
                    Symbol("oco/order/{orderId}") => "v3",
                    Symbol("oco/order/details/{orderId}") => "v3",
                    Symbol("oco/client-order/{clientOid}") => "v3",
                    Symbol("oco/orders") => "v3",
                    Symbol("hf/margin/orders/active") => "v3",
                    Symbol("hf/margin/order/active/symbols") => "v3",
                    Symbol("hf/margin/orders/done") => "v3",
                    Symbol("hf/margin/orders/{orderId}") => "v3",
                    Symbol("hf/margin/orders/client-order/{clientOid}") => "v3",
                    Symbol("hf/margin/fills") => "v3",
                    Symbol("hf/margin/stop-orders") => "v3",
                    Symbol("hf/margin/stop-order/orderId") => "v3",
                    Symbol("hf/margin/stop-order/clientOid") => "v3",
                    Symbol("hf/margin/oco-order/orderId") => "v3",
                    Symbol("hf/margin/oco-order/clientOid") => "v3",
                    Symbol("hf/margin/oco-order/detail/orderId") => "v3",
                    Symbol("hf/margin/oco-orders") => "v3",
                    Symbol("etf/info") => "v3",
                    Symbol("margin/currencies") => "v3",
                    Symbol("margin/borrow") => "v3",
                    Symbol("margin/repay") => "v3",
                    Symbol("margin/interest") => "v3",
                    Symbol("project/list") => "v3",
                    Symbol("project/marketInterestRate") => "v3",
                    Symbol("redeem/orders") => "v3",
                    Symbol("purchase/orders") => "v3",
                    Symbol("migrate/user/account/status") => "v3",
                    Symbol("margin/symbols") => "v3",
                    Symbol("affiliate/inviter/statistics") => "v2",
                    Symbol("asset/ndbroker/deposit/list") => "v1"
                ),
                Symbol("POST") => Dict{Symbol, Any}(
                    Symbol("sub/user/created") => "v2",
                    Symbol("accounts/universal-transfer") => "v3",
                    Symbol("accounts/sub-transfer") => "v2",
                    Symbol("accounts/inner-transfer") => "v2",
                    Symbol("transfer-out") => "v3",
                    Symbol("deposit-address/create") => "v3",
                    Symbol("oco/order") => "v3",
                    Symbol("hf/margin/order") => "v3",
                    Symbol("hf/margin/order/test") => "v3",
                    Symbol("hf/margin/stop-order") => "v3",
                    Symbol("margin/borrow") => "v3",
                    Symbol("margin/repay") => "v3",
                    Symbol("hf/margin/oco-order") => "v3",
                    Symbol("purchase") => "v3",
                    Symbol("redeem") => "v3",
                    Symbol("lend/purchase/update") => "v3",
                    Symbol("position/update-user-leverage") => "v3",
                    Symbol("withdrawals") => "v3"
                ),
                Symbol("DELETE") => Dict{Symbol, Any}(
                    Symbol("hf/margin/orders/{orderId}") => "v3",
                    Symbol("hf/margin/orders/client-order/{clientOid}") => "v3",
                    Symbol("hf/margin/orders") => "v3",
                    Symbol("hf/margin/stop-order/cancel-by-id") => "v3",
                    Symbol("hf/margin/stop-order/cancel-by-clientOid") => "v3",
                    Symbol("hf/margin/stop-order/cancel") => "v3",
                    Symbol("oco/order/{orderId}") => "v3",
                    Symbol("oco/client-order/{clientOid}") => "v3",
                    Symbol("oco/orders") => "v3",
                    Symbol("hf/margin/oco-order/cancel-by-id") => "v3",
                    Symbol("hf/margin/oco-order/cancel-by-clientOid") => "v3",
                    Symbol("hf/margin/oco-order/cancel") => "v3"
                )
            ),
            Symbol("futuresPrivate") => Dict{Symbol, Any}(
                Symbol("GET") => Dict{Symbol, Any}(
                    Symbol("getMaxOpenSize") => "v2",
                    Symbol("getCrossUserLeverage") => "v2",
                    Symbol("position/getMarginMode") => "v2",
                    Symbol("position/getPositionMode") => "v2"
                ),
                Symbol("POST") => Dict{Symbol, Any}(
                    Symbol("transfer-out") => "v2",
                    Symbol("changeCrossUserLeverage") => "v2",
                    Symbol("position/changeMarginMode") => "v2",
                    Symbol("position/switchPositionMode") => "v2"
                )
            ),
            Symbol("futuresPublic") => Dict{Symbol, Any}(
                Symbol("GET") => Dict{Symbol, Any}(
                    Symbol("level3/snapshot") => "v2"
                )
            )
        ),
        Symbol("partner") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("id") => "ccxt",
                Symbol("key") => "9e58cc35-5b5e-4133-92ec-166e3f077cb8"
            ),
            Symbol("future") => Dict{Symbol, Any}(
                Symbol("id") => "ccxtfutures",
                Symbol("key") => "1b327198-f30c-4f14-a0ac-918871282f15"
            )
        ),
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "trade",
            Symbol("margin") => "margin",
            Symbol("cross") => "margin",
            Symbol("marginV2") => "margin",
            Symbol("isolated") => "isolated",
            Symbol("main") => "main",
            Symbol("funding") => "main",
            Symbol("future") => "contract",
            Symbol("swap") => "contract",
            Symbol("mining") => "pool",
            Symbol("hf") => "trade_hf",
            Symbol("contract") => "contract",
            Symbol("uta") => "unified",
            Symbol("unified") => "unified"
        ),
        Symbol("utaAccountsByType") => Dict{Symbol, Any}(
            Symbol("trade") => "SPOT",
            Symbol("spot") => "SPOT",
            Symbol("margin") => "CROSS",
            Symbol("cross") => "CROSS",
            Symbol("isolated") => "ISOLATED",
            Symbol("main") => "FUNDING",
            Symbol("funding") => "FUNDING",
            Symbol("future") => "FUTURES",
            Symbol("swap") => "FUTURES",
            Symbol("contract") => "FUTURES",
            Symbol("uta") => "unified",
            Symbol("unified") => "unified"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "btc",
            Symbol("BRC20") => "btc",
            Symbol("BTCNATIVESEGWIT") => "bech32",
            Symbol("ETH") => "eth",
            Symbol("ERC20") => "eth",
            Symbol("TRX") => "trx",
            Symbol("TRC20") => "trx",
            Symbol("HECO") => "heco",
            Symbol("HRC20") => "heco",
            Symbol("MATIC") => "matic",
            Symbol("KCC") => "kcc",
            Symbol("SOL") => "sol",
            Symbol("ALGO") => "algo",
            Symbol("EOS") => "eos",
            Symbol("BEP20") => "bsc",
            Symbol("BEP2") => "bnb",
            Symbol("ARBITRUM") => "arbitrum",
            Symbol("AVAXX") => "avax",
            Symbol("AVAXC") => "avaxc",
            Symbol("TLOS") => "tlos",
            Symbol("CFX") => "cfx",
            Symbol("ACA") => "aca",
            Symbol("OP") => "optimism",
            Symbol("OPTIMISM") => "optimism",
            Symbol("ONT") => "ont",
            Symbol("GLMR") => "glmr",
            Symbol("CSPR") => "cspr",
            Symbol("KLAY") => "klay",
            Symbol("XRD") => "xrd",
            Symbol("RVN") => "rvn",
            Symbol("NEAR") => "near",
            Symbol("APT") => "aptos",
            Symbol("ETHW") => "ethw",
            Symbol("TON") => "ton",
            Symbol("BCH") => "bch",
            Symbol("BSV") => "bchsv",
            Symbol("BCHA") => "bchabc",
            Symbol("OSMO") => "osmo",
            Symbol("NANO") => "nano",
            Symbol("XLM") => "xlm",
            Symbol("VET") => "vet",
            Symbol("IOST") => "iost",
            Symbol("ZIL") => "zil",
            Symbol("XRP") => "xrp",
            Symbol("TOMO") => "tomo",
            Symbol("XMR") => "xmr",
            Symbol("COTI") => "coti",
            Symbol("XTZ") => "xtz",
            Symbol("ADA") => "ada",
            Symbol("WAX") => "waxp",
            Symbol("THETA") => "theta",
            Symbol("ONE") => "one",
            Symbol("IOTEX") => "iotx",
            Symbol("NULS") => "nuls",
            Symbol("KSM") => "ksm",
            Symbol("LTC") => "ltc",
            Symbol("WAVES") => "waves",
            Symbol("DOT") => "dot",
            Symbol("STEEM") => "steem",
            Symbol("QTUM") => "qtum",
            Symbol("DOGE") => "doge",
            Symbol("FIL") => "fil",
            Symbol("XYM") => "xym",
            Symbol("FLUX") => "flux",
            Symbol("ATOM") => "atom",
            Symbol("XDC") => "xdc",
            Symbol("KDA") => "kda",
            Symbol("ICP") => "icp",
            Symbol("CELO") => "celo",
            Symbol("LSK") => "lsk",
            Symbol("VSYS") => "vsys",
            Symbol("KAR") => "kar",
            Symbol("XCH") => "xch",
            Symbol("FLOW") => "flow",
            Symbol("BAND") => "band",
            Symbol("EGLD") => "egld",
            Symbol("HBAR") => "hbar",
            Symbol("XPR") => "xpr",
            Symbol("AR") => "ar",
            Symbol("FTM") => "ftm",
            Symbol("KAVA") => "kava",
            Symbol("KMA") => "kma",
            Symbol("XEC") => "xec",
            Symbol("IOTA") => "iota",
            Symbol("HNT") => "hnt",
            Symbol("ASTR") => "astr",
            Symbol("PDEX") => "pdex",
            Symbol("METIS") => "metis",
            Symbol("ZEC") => "zec",
            Symbol("POKT") => "pokt",
            Symbol("OASYS") => "oas",
            Symbol("OASIS") => "oasis",
            Symbol("ETC") => "etc",
            Symbol("AKT") => "akt",
            Symbol("FSN") => "fsn",
            Symbol("SCRT") => "scrt",
            Symbol("CFG") => "cfg",
            Symbol("ICX") => "icx",
            Symbol("KMD") => "kmd",
            Symbol("NEM") => "NEM",
            Symbol("STX") => "stx",
            Symbol("DGB") => "dgb",
            Symbol("DCR") => "dcr",
            Symbol("CKB") => "ckb",
            Symbol("ELA") => "ela",
            Symbol("HYDRA") => "hydra",
            Symbol("BTM") => "btm",
            Symbol("KARDIA") => "kai",
            Symbol("SXP") => "sxp",
            Symbol("NEBL") => "nebl",
            Symbol("ZEN") => "zen",
            Symbol("SDN") => "sdn",
            Symbol("LTO") => "lto",
            Symbol("WEMIX") => "wemix",
            Symbol("EVER") => "ever",
            Symbol("BNC") => "bnc",
            Symbol("BNCDOT") => "bncdot",
            Symbol("AION") => "aion",
            Symbol("GRIN") => "grin",
            Symbol("LOKI") => "loki",
            Symbol("QKC") => "qkc",
            Symbol("TT") => "TT",
            Symbol("PIVX") => "pivx",
            Symbol("SERO") => "sero",
            Symbol("METER") => "meter",
            Symbol("STATEMINE") => "statemine",
            Symbol("DVPN") => "dvpn",
            Symbol("XPRT") => "xprt",
            Symbol("MOVR") => "movr",
            Symbol("ERGO") => "ergo",
            Symbol("ABBC") => "abbc",
            Symbol("DIVI") => "divi",
            Symbol("PURA") => "pura",
            Symbol("DFI") => "dfi",
            Symbol("NEON3") => "neon3",
            Symbol("DOCK") => "dock",
            Symbol("TRUE") => "true",
            Symbol("CS") => "cs",
            Symbol("ORAI") => "orai",
            Symbol("BASE") => "base",
            Symbol("TARA") => "tara"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("btc") => "BTC",
            Symbol("trx") => "TRC20",
            Symbol("eth") => "ERC20",
            Symbol("heco") => "HRC20",
            Symbol("optimism") => "OP",
            Symbol("op") => "OP"
        ),
        Symbol("marginModes") => Dict{Symbol, Any}(
            Symbol("cross") => "MARGIN_TRADE",
            Symbol("isolated") => "MARGIN_ISOLATED_TRADE",
            Symbol("spot") => "TRADE"
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
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true,
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
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => true,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 5
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => nothing,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 7,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 500,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 500,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => 7,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => true
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1500
            )
        ),
        Symbol("forDerivs") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
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
                    Symbol("FOK") => false,
                    Symbol("PO") => true,
                    Symbol("GTD") => false
                ),
                Symbol("hedged") => false,
                Symbol("trailing") => false,
                Symbol("leverage") => true,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => true,
                Symbol("iceberg") => true
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 20
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => 7,
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
                Symbol("limit") => 1000,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => nothing,
                Symbol("daysBackCanceled") => nothing,
                Symbol("untilDays") => nothing,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 500
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivs"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivs"
            )
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivs"
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivs"
            )
        )
    ),
    Symbol("rollingWindowSize") => 30000
))

end
function nonce(self::Kucoin, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-server-time
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Kucoin; params=Dict())
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTime", market = nothing, params = params);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_and((type_var != "spot"), (type_var != "margin")))
        response = Base.fetch(self.futuresPublicGetTimestamp(params));
    else
        response = Base.fetch(self.publicGetTimestamp(params));
    end
    return safeInteger(response, "data")

end
"""
the latest known information on the availability of the exchange API
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-service-status
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-service-status
see: https://www.kucoin.com/docs-new/rest/ua/get-service-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: spot or swap
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.tradeType`::string, optional: *uta only* set to SPOT or FUTURES

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Kucoin; params=Dict())
    uta = false;
    (uta, params) = self.handleOptionAndParams(params, "fetchStatus", "uta", defaultValue = uta);
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchStatus", market = nothing, params = params);
    response = nothing;
    if functions.ccxtruthy(uta)
        defaultType = safeString(self.options, "defaultType", "spot");
        defaultTradeType = functions.ccxtruthy((defaultType == "spot")) ? "SPOT" : "FUTURES";
        tradeType = safeStringUpper(params, "tradeType", defaultTradeType);
        request = Dict{Symbol, Any}(
            Symbol("tradeType") => tradeType
        );
        response = Base.fetch(self.utaGetServerStatus(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_and((type_var != "spot"), (type_var != "margin")))
        response = Base.fetch(self.futuresPublicGetStatus(params));
    else
        response = Base.fetch(self.publicGetStatus(params));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    status = safeString2(data, "status", "serverStatus");
    return Dict{Symbol, Any}(
    Symbol("status") => functions.ccxtruthy((status == "open")) ? "ok" : "maintenance",
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
retrieves data on all markets for kucoin
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-symbols
see: https://www.kucoin.com/docs-new/rest/ua/get-symbol
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-symbols

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Kucoin; params=Dict())
    fetchTickersFees = nothing;
    (fetchTickersFees, params) = self.handleOptionAndParams(params, "fetchMarkets", "fetchTickersFees", defaultValue = true);
    uta = false;
    (uta, params) = self.handleOptionAndParams(params, "fetchMarkets", "uta", defaultValue = uta);
    if functions.ccxtruthy(uta)
            return Base.fetch(self.fetchUTAMarkets(params = params))
    end
    defaultTypes = ["spot", "swap", "future", "contract"];
    fetchMarketsOptions = self.safeDict(self.options, "fetchMarkets");
    types = self.safeList(fetchMarketsOptions, "types", defaultValue = defaultTypes);
    credentialsSet = self.checkRequiredCredentials(error = false);
    requestMarginables = @functions.ccxt_and(credentialsSet, self.safeBool(params, "marginables", defaultValue = true));
    params = omit(params, "marginables");
    fetchContractMarkets = false;
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(inArray("swap", types), inArray("future", types)), inArray("contract", types)))
        fetchContractMarkets = true;
    end
    fetchSpotMarkets = inArray("spot", types);
    fetchTickersFees = @functions.ccxt_and(fetchTickersFees, fetchSpotMarkets);
    promises = [];
    if functions.ccxtruthy(fetchSpotMarkets)
                push!(promises, self.publicGetSymbols(params));
    end
    if functions.ccxtruthy(requestMarginables)
                push!(promises, self.privateGetMarginSymbols(params));
                push!(promises, self.privateGetIsolatedSymbols(params));
    end
    if functions.ccxtruthy(fetchTickersFees)
                push!(promises, self.publicGetMarketAllTickers(params));
    end
    if functions.ccxtruthy(fetchContractMarkets)
                push!(promises, self.fetchContractMarkets(params = params));
    end
    if functions.ccxtruthy(credentialsSet)
                push!(promises, self.loadMigrationStatus());
    end
    responses = Base.fetch(asyncmap(Base.fetch, promises));
    symbolsData = functions.ccxtruthy(fetchSpotMarkets) ? self.safeList(get(responses, 1, nothing), "data", defaultValue = []) : [];
    crossIndex = 0;
    isolatedIndex = 0;
    tickersIndex = 0;
    contractIndex = 0;
    nextIndex = 0;
    if functions.ccxtruthy(fetchSpotMarkets)
        nextIndex = 1;
    end
    if functions.ccxtruthy(requestMarginables)
        crossIndex = nextIndex;
        nextIndex = self.sum(nextIndex, 2);
        isolatedIndex = self.sum(crossIndex, 1);
    end
    if functions.ccxtruthy(fetchTickersFees)
        tickersIndex = nextIndex;
        nextIndex = self.sum(nextIndex, 1);
    end
    if functions.ccxtruthy(fetchContractMarkets)
        contractIndex = nextIndex;
    end
    crossData = functions.ccxtruthy(requestMarginables) ? self.safeDict(get(responses, crossIndex + 1, nothing), "data", defaultValue = Dict{Symbol, Any}()) : Dict{Symbol, Any}();
    crossItems = self.safeList(crossData, "items", defaultValue = []);
    crossById = indexBy(crossItems, "symbol");
    isolatedData = functions.ccxtruthy(requestMarginables) ? get(responses, isolatedIndex + 1, nothing) : Dict{Symbol, Any}();
    isolatedItems = self.safeList(isolatedData, "data", defaultValue = []);
    isolatedById = indexBy(isolatedItems, "symbol");
    tickersResponse = functions.ccxtruthy(fetchTickersFees) ? self.safeDict(responses, tickersIndex, defaultValue = Dict{Symbol, Any}()) : Dict{Symbol, Any}();
    tickerItems = self.safeList(self.safeDict(tickersResponse, "data", defaultValue = Dict{Symbol, Any}()), "ticker", defaultValue = []);
    tickersById = indexBy(tickerItems, "symbol");
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbolsData)))
        market = get(symbolsData, i + 1, nothing);
        id = safeString(market, "symbol");
        if functions.ccxtruthy(id == nothing)
            i += 1; continue
        end
        (baseId, quoteId) = split(id, "-");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        ticker = self.safeDict(tickersById, id, defaultValue = Dict{Symbol, Any}());
        makerFeeRate = safeString(ticker, "makerFeeRate");
        takerFeeRate = safeString(ticker, "takerFeeRate");
        makerCoefficient = safeString(ticker, "makerCoefficient");
        takerCoefficient = safeString(ticker, "takerCoefficient");
        hasCrossMargin = (ccxt_in(id, crossById));
        hasIsolatedMargin = (ccxt_in(id, isolatedById));
        isMarginable = @functions.ccxt_or(@functions.ccxt_or(self.safeBool(market, "isMarginEnabled", defaultValue = false), hasCrossMargin), hasIsolatedMargin);
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => string(base, "/", quote_var),
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => nothing,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => nothing,
    Symbol("type") => "spot",
    Symbol("spot") => true,
    Symbol("margin") => isMarginable,
    Symbol("marginModes") => Dict{Symbol, Any}(
        Symbol("cross") => hasCrossMargin,
        Symbol("isolated") => hasIsolatedMargin
    ),
    Symbol("swap") => false,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => self.safeBool(market, "enableTrading"),
    Symbol("contract") => false,
    Symbol("linear") => nothing,
    Symbol("inverse") => nothing,
    Symbol("taker") => self.parseNumber(stringMul(takerFeeRate, takerCoefficient)),
    Symbol("maker") => self.parseNumber(stringMul(makerFeeRate, makerCoefficient)),
    Symbol("contractSize") => nothing,
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "baseIncrement"),
        Symbol("price") => self.safeNumber(market, "priceIncrement")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "baseMinSize"),
            Symbol("max") => self.safeNumber(market, "baseMaxSize")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "quoteMinSize"),
            Symbol("max") => self.safeNumber(market, "quoteMaxSize")
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
));
        i += 1
    end
    if functions.ccxtruthy(fetchContractMarkets)
        contractMarkets = self.safeList(responses, contractIndex, defaultValue = []);
        result = arrayConcat(result, contractMarkets);
    end
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    return result

end
function fetchContractMarkets(self::Kucoin; params=Dict())
    response = Base.fetch(self.futuresPublicGetContractsActive(params));
    result = [];
    data = self.safeList(response, "data", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        market = get(data, i + 1, nothing);
        id = safeString(market, "symbol");
        expiry = safeInteger(market, "expireDate");
        future = safeString(market, "nextFundingRateTime") == nothing;
        swap = !functions.ccxtruthy(future);
        baseId = safeString(market, "baseCurrency");
        quoteId = safeString(market, "quoteCurrency");
        settleId = safeString(market, "settleCurrency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var, ":", settle);
        type_var = "swap";
        if functions.ccxtruthy(future)
            symbol = string(symbol, "-", self.yymmdd(expiry, ""));
            type_var = "future";
        end
        inverse = safeValue(market, "isInverse");
        status = safeString(market, "status");
        multiplier = safeString(market, "multiplier");
        tickSize = self.safeNumber(market, "tickSize");
        lotSize = self.safeNumber(market, "lotSize");
        limitAmountMin = lotSize;
        if functions.ccxtruthy(limitAmountMin == nothing)
            limitAmountMin = self.safeNumber(market, "baseMinSize");
        end
        limitAmountMax = self.safeNumber(market, "maxOrderQty");
        if functions.ccxtruthy(limitAmountMax == nothing)
            limitAmountMax = self.safeNumber(market, "baseMaxSize");
        end
        limitPriceMax = self.safeNumber(market, "maxPrice");
        if functions.ccxtruthy(limitPriceMax == nothing)
            baseMinSizeString = safeString(market, "baseMinSize");
            quoteMaxSizeString = safeString(market, "quoteMaxSize");
            limitPriceMax = self.parseNumber(stringDiv(quoteMaxSizeString, baseMinSizeString));
        end
        push!(result, Dict{Symbol, Any}(
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
    Symbol("margin") => false,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => false,
    Symbol("active") => (status == "Open"),
    Symbol("contract") => true,
    Symbol("linear") => !functions.ccxtruthy(inverse),
    Symbol("inverse") => inverse,
    Symbol("taker") => self.safeNumber(market, "takerFeeRate"),
    Symbol("maker") => self.safeNumber(market, "makerFeeRate"),
    Symbol("contractSize") => self.parseNumber(stringAbs(multiplier)),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => lotSize,
        Symbol("price") => tickSize
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => self.safeNumber(market, "maxLeverage")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => limitAmountMin,
            Symbol("max") => limitAmountMax
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => tickSize,
            Symbol("max") => limitPriceMax
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "quoteMinSize"),
            Symbol("max") => self.safeNumber(market, "quoteMaxSize")
        )
    ),
    Symbol("created") => safeInteger(market, "firstOpenDate"),
    Symbol("info") => market
));
        i += 1
    end
    return result

end
function fetchUTAMarkets(self::Kucoin; params=Dict())
    promises = [];
    push!(promises, self.utaGetMarketInstrument(extend(params, Dict{Symbol, Any}(
    Symbol("tradeType") => "SPOT"
))));
    push!(promises, self.utaGetMarketInstrument(extend(params, Dict{Symbol, Any}(
    Symbol("tradeType") => "FUTURES"
))));
    responses = Base.fetch(asyncmap(Base.fetch, promises));
    data = self.safeDict(get(responses, 1, nothing), "data", defaultValue = Dict{Symbol, Any}());
    contractData = self.safeDict(get(responses, 2, nothing), "data", defaultValue = Dict{Symbol, Any}());
    spotData = self.safeList(data, "list", defaultValue = []);
    contractSymbolsData = self.safeList(contractData, "list", defaultValue = []);
    symbolsData = arrayConcat(spotData, contractSymbolsData);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbolsData)))
        market = get(symbolsData, i + 1, nothing);
        id = safeString(market, "symbol");
        baseId = safeString(market, "baseCurrency");
        quoteId = safeString(market, "quoteCurrency");
        settleId = safeString(market, "settlementCurrency");
        base = self.safeCurrencyCode(baseId);
        quote_var = self.safeCurrencyCode(quoteId);
        settle = self.safeCurrencyCode(settleId);
        hasMargin = safeString(market, "marginMode");
        isMarginable = functions.ccxtruthy((hasMargin == "1")) ? true : false;
        symbol = string(base, "/", quote_var);
        if functions.ccxtruthy(settle != nothing)
            symbol += string(":", settle);
        end
        contractType = safeString(market, "contractType");
        expiry = safeInteger(market, "expiryTime");
        active = safeString(market, "tradingStatus");
        type_var = nothing;
        spot = false;
        swap = false;
        future = false;
        contract = false;
        linear = false;
        inverse = false;
        if functions.ccxtruthy(contractType != nothing)
            contract = true;
            if functions.ccxtruthy(quote_var == settle)
                linear = true;
            else
                inverse = true;
            end
            if functions.ccxtruthy(contractType == "0")
                type_var = "swap";
                swap = true;
            else
                type_var = "future";
                future = true;
            end
        else
            type_var = "spot";
            spot = true;
        end
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => type_var,
    Symbol("spot") => spot,
    Symbol("margin") => isMarginable,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => false,
    Symbol("active") => (active == "1"),
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => self.safeNumber(market, "makerFeeRate"),
    Symbol("maker") => self.safeNumber(market, "takerFeeRate"),
    Symbol("contractSize") => self.safeNumber(market, "unitSize"),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber2(market, "lotSize", "baseOrderStep"),
        Symbol("price") => self.safeNumber(market, "tickSize")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => safeInteger(market, "maxLeverage")
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minBaseOrderSize"),
            Symbol("max") => self.safeNumber(market, "maxBaseOrderSize")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => self.safeNumber(market, "maxPrice")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minQuoteOrderSize"),
            Symbol("max") => self.safeNumber(market, "maxQuoteOrderSize")
        )
    ),
    Symbol("created") => safeInteger(market, "launchTime"),
    Symbol("info") => market
));
        i += 1
    end
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    return result

end
"""
loads the migration status for the account (hf or not)
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-type-spot

# Arguments
- `force`::bool: load account state for non hf

# Returns
- ignore
"""
function loadMigrationStatus(self::Kucoin; force=false)
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(!functions.ccxtruthy((ccxt_in("hf", self.options))), (get(self.options, Symbol("hf"), nothing) == nothing)), force))
        result = Base.fetch(self.privateGetHfAccountsOpened());
        self.options[Symbol("hf")] = self.safeBool(result, "data");
    end
    return true

end
function handleHfAndParams(self::Kucoin; params=Dict())
    migrated = self.safeBool(self.options, "hf", defaultValue = false);
    loadedHf = nothing;
    if functions.ccxtruthy(migrated != nothing)
        if functions.ccxtruthy(migrated)
            loadedHf = true;
        else
            loadedHf = false;
        end
    end
    hf = self.safeBool(params, "hf", defaultValue = loadedHf);
    params = omit(params, "hf");
    return [hf, params]

end
"""
fetches all available currencies on an exchange
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-currencies
see: https://www.kucoin.com/docs-new/rest/ua/get-currencies

# Arguments
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Kucoin; params=Dict())
    uta = false;
    if functions.ccxtruthy(self.checkRequiredCredentials(error = false))
        uta = Base.fetch(self.isUTAEnabled());
    end
    (uta, params) = self.handleOptionAndParams(params, "fetchCurrencies", "uta", defaultValue = uta);
    response = nothing;
    if functions.ccxtruthy(uta)
        response = Base.fetch(self.utaGetAssetCurrencies(params));
    else
        response = Base.fetch(self.publicGetCurrencies(params));
    end
    currenciesData = self.safeList(response, "data", defaultValue = []);
    brokenCurrencies = self.handleOption("fetchCurrencies", "brokenCurrencies", defaultValue = []);
    filteredCurrencies = self.filterOutByArray(currenciesData, "currency", values = brokenCurrencies);
    return self.parseCurrencies(filteredCurrencies)

end
function parseCurrency(self::Kucoin, currency)
    entry = currency;
    id = safeString(entry, "currency");
    code = self.safeCurrencyCode(id);
    networks = Dict{Symbol, Any}();
    chains = self.safeList2(entry, "chains", "items", defaultValue = []);
    chainsLength = length(chains);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, chainsLength))
        chain = get(chains, j + 1, nothing);
        chainId = safeString(chain, "chainId");
        networkCode = self.networkIdToCode(networkId = chainId, currencyCode = code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("info") => chain,
                Symbol("id") => chainId,
                Symbol("name") => safeString(chain, "chainName"),
                Symbol("code") => networkCode,
                Symbol("active") => nothing,
                Symbol("fee") => self.safeNumber2(chain, "withdrawalMinFee", "minWithdrawFee"),
                Symbol("deposit") => self.safeBool(chain, "isDepositEnabled"),
                Symbol("withdraw") => self.safeBool(chain, "isWithdrawEnabled"),
                Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(chain, "withdrawPrecision"))),
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber2(chain, "withdrawalMinSize", "minWithdrawSize"),
                        Symbol("max") => self.safeNumber2(chain, "maxWithdraw", "maxWithdrawSize")
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber2(chain, "depositMinSize", "minDepositSize"),
                        Symbol("max") => self.safeNumber2(chain, "maxDeposit", "maxDepositSize")
                    )
                )
            );
        end
        j += 1
    end
    rawPrecision = safeString(entry, "precision");
    precision = self.parseNumber(self.parsePrecision(precision = rawPrecision));
    isFiat = chainsLength == 0;
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("name") => safeString(entry, "fullName"),
    Symbol("code") => code,
    Symbol("type") => functions.ccxtruthy(isFiat) ? "fiat" : "crypto",
    Symbol("precision") => precision,
    Symbol("info") => entry,
    Symbol("networks") => networks,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("active") => nothing,
    Symbol("fee") => nothing,
    Symbol("limits") => nothing
))

end
"""
fetch all the accounts associated with a profile
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-list-spot

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchAccounts(self::Kucoin; params=Dict())
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchAccounts", "uta", defaultValue = uta);
    response = nothing;
    data = [];
    if functions.ccxtruthy(uta)
        response = Base.fetch(self.utaPrivateGetAccountModeAccountOverview(extend(params, Dict{Symbol, Any}(
    Symbol("accountMode") => "unified"
))));
        dataDict = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        data = [dataDict];
    else
        response = Base.fetch(self.privateGetAccounts(params));
        data = self.safeList(response, "data", defaultValue = []);
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        account = get(data, i + 1, nothing);
        accountId = safeString(account, "id");
        currencyId = safeString(account, "currency");
        code = self.safeCurrencyCode(currencyId);
        type_var = safeStringLower2(account, "type", "accountType");
        push!(result, Dict{Symbol, Any}(
    Symbol("id") => accountId,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("code") => code,
    Symbol("info") => account
));
        i += 1
    end
    return result

end
"""
*DEPRECATED* please use fetchDepositWithdrawFee instead
see: https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-quotas

# Arguments
- `code`::string: unified currency code
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTransactionFee(self::Kucoin, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        _netIdTmp = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
        if functions.ccxtruthy(_netIdTmp != nothing)
            request[Symbol("chain")] =             lowercase(_netIdTmp);
        end
    end
    response = Base.fetch(self.privateGetWithdrawalsQuotas(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    withdrawFees = Dict{Symbol, Any}();
    withdrawFees[Symbol(code)] = self.safeNumber(data, "withdrawMinFee");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("withdraw") => withdrawFees,
    Symbol("deposit") => Dict{Symbol, Any}()
)

end
"""
fetch the fee for deposits and withdrawals
see: https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-quotas

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: The chain of currency. This only apply for multi-chain currency, and there is no need for single chain currency; you can query the chain through the response of the GET /api/v2/currencies/{currency} interface

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFee(self::Kucoin, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        _netIdTmp = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
        if functions.ccxtruthy(_netIdTmp != nothing)
            request[Symbol("chain")] =             lowercase(_netIdTmp);
        end
    end
    response = Base.fetch(self.privateGetWithdrawalsQuotas(extend(request, params)));
    data = self.safeDict(response, "data");
    return self.parseDepositWithdrawFee(data, currency = currency)

end
function parseDepositWithdrawFee(self::Kucoin, fee; currency=nothing)
    if functions.ccxtruthy(ccxt_in("chains", fee))
        resultNew = Dict{Symbol, Any}(
            Symbol("info") => fee,
            Symbol("withdraw") => Dict{Symbol, Any}(
                Symbol("fee") => nothing,
                Symbol("percentage") => false
            ),
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("fee") => nothing,
                Symbol("percentage") => nothing
            ),
            Symbol("networks") => Dict{Symbol, Any}()
        );
        chains = self.safeList(fee, "chains", defaultValue = []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(chains)))
            chain = get(chains, i + 1, nothing);
            chainId = safeString(chain, "chainId");
            networkCodeNew = self.networkIdToCode(networkId = chainId, currencyCode = safeString(currency, "code"));
            if functions.ccxtruthy(networkCodeNew != nothing)
                resultNew[Symbol("networks")][Symbol(networkCodeNew)] = Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("fee") => self.safeNumber2(chain, "withdrawalMinFee", "withdrawMinFee"),
                        Symbol("percentage") => false
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("fee") => nothing,
                        Symbol("percentage") => nothing
                    )
                );
            end
            i += 1
        end

            return resultNew
    end
    minWithdrawFee = self.safeNumber(fee, "withdrawMinFee");
    result = Dict{Symbol, Any}(
        Symbol("info") => fee,
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("fee") => minWithdrawFee,
            Symbol("percentage") => false
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("fee") => nothing,
            Symbol("percentage") => nothing
        ),
        Symbol("networks") => Dict{Symbol, Any}()
    );
    networkId = safeString(fee, "chain");
    currencyId = safeString(fee, "currency");
    currency = self.safeCurrency(currencyId, currency = currency);
    networkCode = self.networkIdToCode(networkId = networkId, currencyCode = get(currency, Symbol("code"), nothing));
    if functions.ccxtruthy(networkCode != nothing)
        result[Symbol("networks")][Symbol(networkCode)] = Dict{Symbol, Any}(
            Symbol("withdraw") => minWithdrawFee,
            Symbol("deposit") => Dict{Symbol, Any}(
                Symbol("fee") => nothing,
                Symbol("percentage") => nothing
            )
        );
    end
    return result

end
function isFuturesMethod(self::Kucoin, methodName, params)
    defaultType = safeString2(self.options, methodName, "defaultType", "trade");
    requestedType = safeString(params, "type", defaultType);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    type_var = safeString(accountsByType, requestedType);
    if functions.ccxtruthy(type_var == nothing)
        keys_var = objectKeys(accountsByType);
        throw(ExchangeError(string(self.id, " isFuturesMethod() type must be one of ", join(keys_var, ", "))));
    end
    params = omit(params, "type");
    return @functions.ccxt_or(@functions.ccxt_or((type_var == "contract"), (type_var == "future")), (type_var == "futures"))

end
function parseSpotOrUtaTicker(self::Kucoin, ticker; market=nothing)
    percentage = safeString(ticker, "changeRate");
    if functions.ccxtruthy(percentage != nothing)
        percentage = stringMul(percentage, "100");
    else
        percentage = safeString(ticker, "priceChangePercent");
    end
    last_var = safeStringN(ticker, ["last", "lastTradedPrice", "lastPrice"]);
    last_var = safeString(ticker, "price", last_var);
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    symbol = get(market, Symbol("symbol"), nothing);
    baseVolume = safeString2(ticker, "vol", "baseVolume");
    quoteVolume = safeString2(ticker, "volValue", "quoteVolume");
    timestamp = safeIntegerN(ticker, ["time", "datetime", "timePoint"]);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "high"),
    Symbol("low") => safeString(ticker, "low"),
    Symbol("bid") => safeStringN(ticker, ["buy", "bestBid", "bestBidPrice"]),
    Symbol("bidVolume") => safeString(ticker, "bestBidSize"),
    Symbol("ask") => safeStringN(ticker, ["sell", "bestAsk", "bestAskPrice"]),
    Symbol("askVolume") => safeString(ticker, "bestAskSize"),
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "open"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => safeString2(ticker, "changePrice", "priceChange"),
    Symbol("percentage") => percentage,
    Symbol("average") => safeString(ticker, "averagePrice"),
    Symbol("baseVolume") => baseVolume,
    Symbol("quoteVolume") => quoteVolume,
    Symbol("markPrice") => safeString2(ticker, "markPrice", "value"),
    Symbol("indexPrice") => safeString(ticker, "indexPrice"),
    Symbol("info") => ticker
), market = market)

end
function parseTicker(self::Kucoin, ticker; market=nothing)
    return self.parseContractTicker(ticker, market = market)

end
function parseContractTicker(self::Kucoin, ticker; market=nothing)
    marketId = safeString(ticker, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    last_var = safeString2(ticker, "price", "lastTradePrice");
    timestamp = safeIntegerProduct(ticker, "ts", 0.000001);
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "highPrice"),
    Symbol("low") => safeString(ticker, "lowPrice"),
    Symbol("bid") => safeString(ticker, "bestBidPrice"),
    Symbol("bidVolume") => safeString(ticker, "bestBidSize"),
    Symbol("ask") => safeString(ticker, "bestAskPrice"),
    Symbol("askVolume") => safeString(ticker, "bestAskSize"),
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => safeString(ticker, "priceChg"),
    Symbol("percentage") => safeString(ticker, "priceChgPct"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "volumeOf24h"),
    Symbol("quoteVolume") => safeString(ticker, "turnoverOf24h"),
    Symbol("markPrice") => safeString2(ticker, "markPrice", "value"),
    Symbol("indexPrice") => safeString(ticker, "indexPrice"),
    Symbol("info") => ticker
), market = market)

end
function typeToTradeType(self::Kucoin, type_var)
    tradeTypes = Dict{Symbol, Any}(
        Symbol("spot") => "SPOT",
        Symbol("margin") => "MARGIN",
        Symbol("swap") => "FUTURES"
    );
    if functions.ccxtruthy(type_var == nothing)
            return nothing
    end
    return safeString(tradeTypes, type_var, type_var)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-tickers
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-tickers
see: https://www.kucoin.com/docs-new/rest/ua/get-ticker

# Arguments
- `symbols`::any, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.type`::string, optional: spot or swap (default is spot)
- `params.method`::string, optional: *swap only* the method to use, futuresPublicGetContractsActive or futuresPublicGetAllTickers (default is futuresPublicGetContractsActive)

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Kucoin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true);
    uta = false;
    (uta, params) = self.handleOptionAndParams(params, "fetchTickers", "uta", defaultValue = uta);
    tradeType = safeString(params, "tradeType");
    firstMarket = nothing;
    if functions.ccxtruthy(symbols != nothing)
        firstSymbol = safeString(symbols, 0);
        if functions.ccxtruthy(firstSymbol != nothing)
            firstMarket = self.market(firstSymbol);
        end
    end
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market = firstMarket, params = params);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((tradeType != nothing), uta))
        if functions.ccxtruthy(tradeType == nothing)
            request[Symbol("tradeType")] = self.typeToTradeType(type_var);
        end
        response = Base.fetch(self.utaGetMarketTicker(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_and((type_var != "spot"), (type_var != "margin")))
        return Base.fetch(self.fetchContractTickers(symbols = symbols, params = params))
    else
        response = Base.fetch(self.publicGetMarketAllTickers(params));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    tickers = self.safeList2(data, "ticker", "list", defaultValue = []);
    time = safeInteger2(data, "time", "ts");
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        tickers[i + 1][Symbol("time")] = time;
        ticker = self.parseSpotOrUtaTicker(get(tickers, i + 1, nothing));
        symbol = safeString(ticker, "symbol");
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = ticker;
        end
        i += 1
    end
    return self.filterByArrayTickers(result, "symbol", values = symbols)

end
function fetchContractTickers(self::Kucoin; symbols=nothing, params=Dict())
    method = nothing;
    (method, params) = self.handleOptionAndParams(params, "fetchTickers", "method", defaultValue = "futuresPublicGetContractsActive");
    response = nothing;
    if functions.ccxtruthy(method == "futuresPublicGetAllTickers")
        response = Base.fetch(self.futuresPublicGetAllTickers(params));
    else
        response = Base.fetch(self.futuresPublicGetContractsActive(params));
    end
    data = self.safeList(response, "data");
    tickers = self.parseTickers(data, symbols = symbols);
    return self.filterByArrayTickers(tickers, "symbol", values = symbols)

end
"""
fetches the mark price for multiple markets
see: https://www.kucoin.com/docs-new/rest/margin-trading/market-data/get-mark-price-list

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchMarkPrices(self::Kucoin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.publicGetMarkPriceAllSymbols(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseTickers(data)

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-24hr-stats
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-ticker
see: https://www.kucoin.com/docs-new/rest/ua/get-ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Kucoin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    uta = false;
    (uta, params) = self.handleOptionAndParams(params, "fetchTicker", "uta", defaultValue = uta);
    response = nothing;
    result = nothing;
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTicker", market = market, params = params);
    if functions.ccxtruthy(uta)
        request[Symbol("tradeType")] = self.typeToTradeType(type_var);
        response = Base.fetch(self.utaGetMarketTicker(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        resultList = self.safeList(data, "list", defaultValue = []);
        result = self.safeDict(resultList, 0, defaultValue = Dict{Symbol, Any}());
    elseif functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        response = Base.fetch(self.futuresPublicGetTicker(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        return self.parseTicker(data, market = market)
    else
        response = Base.fetch(self.publicGetMarketStats(extend(request, params)));
        result = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    end
    return self.parseSpotOrUtaTicker(result, market = market)

end
"""
fetches the mark price for a specific market
see: https://www.kucoin.com/docs-new/rest/margin-trading/market-data/get-mark-price-detail
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-mark-price

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchMarkPrice(self::Kucoin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        response = Base.fetch(self.futuresPublicGetMarkPriceSymbolCurrent(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
            return self.parseTicker(data, market = market)
    else
        response = Base.fetch(self.publicGetMarkPriceSymbolCurrent(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        return self.parseSpotOrUtaTicker(data, market = market)
    end

end
function parseOHLCV(self::Kucoin, ohlcv; market=nothing)
    timestampString = safeString(ohlcv, 0);
    if functions.ccxtruthy(@functions.ccxt_and(timestampString != nothing, functions.ccxt_le(length(timestampString), 10)))
            return [safeTimestamp(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 5)]
    else
        return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]
    end

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-klines
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-klines
see: https://www.kucoin.com/docs-new/rest/ua/get-klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Kucoin, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    uta = false;
    (uta, params) = self.handleOptionAndParams(params, "fetchOHLCV", "uta", defaultValue = uta);
    priceType = safeString(params, "price");
    if functions.ccxtruthy(@functions.ccxt_and((priceType != nothing), (!functions.ccxtruthy(uta))))
        uta = true;
    end
    if functions.ccxtruthy(uta)
            return Base.fetch(self.fetchUTAOHLCV(symbol, timeframe = timeframe, since = since, limit = limit, params = params))
    elseif functions.ccxtruthy(get(market, Symbol("contract"), nothing))
        return Base.fetch(self.fetchContractOHLCV(symbol, timeframe = timeframe, since = since, limit = limit, params = params))
    else
        return Base.fetch(self.fetchSpotOHLCV(symbol, timeframe = timeframe, since = since, limit = limit, params = params))
    end

end
"""
helper method for fetchOHLCV
see: https://www.kucoin.com/docs-new/rest/ua/get-klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchUTAOHLCV(self::Kucoin, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxLimit = 1500;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchUTAOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = maxLimit))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    duration = self.parseTimeframe(timeframe) * 1000;
    endAt = milliseconds();
    denominator = 1000;
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = self.parseToInt(floor(since / denominator));
        if functions.ccxtruthy(limit == nothing)
            limit = safeInteger(self.options, "fetchOHLCVLimit", maxLimit);
        end
        endAt = self.sum(since, limit * duration);
    elseif functions.ccxtruthy(limit != nothing)
        since = endAt - limit * duration;
        request[Symbol("startAt")] = self.parseToInt(floor(since / denominator));
    end
    request[Symbol("endAt")] = self.parseToInt(floor(endAt / denominator));
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOHLCV", market = market, params = params);
    if functions.ccxtruthy(@functions.ccxt_or((type_var == "spot"), (type_var == "margin")))
        request[Symbol("tradeType")] = "SPOT";
    else
        request[Symbol("tradeType")] = "FUTURES";
    end
    priceType = nothing;
    (priceType, params) = self.handleOptionAndParams(params, "fetchOHLCV", "price", defaultValue = priceType);
    if functions.ccxtruthy(priceType != nothing)
        priceTypes = Dict{Symbol, Any}(
            Symbol("mark") => "mark-price",
            Symbol("index") => "index-price",
            Symbol("premiumIndex") => "premium-index"
        );
        suffix = safeString(priceTypes, priceType);
        if functions.ccxtruthy(suffix == nothing)
            throw(NotSupported(string(self.id, " fetchOHLCV() price parameter must be one of \"mark\", \"index\", or \"premiumIndex\"")));
        end
        request[Symbol("symbol")] = string(get(market, Symbol("id"), nothing), "-", suffix);
    end
    response = Base.fetch(self.utaGetMarketKline(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    result = self.safeList(data, "list", defaultValue = []);
    return self.parseOHLCVs(result, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
helper method for fetchOHLCV
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchSpotOHLCV(self::Kucoin, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxLimit = 1500;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchSpotOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = maxLimit))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("type") => safeString(self.timeframes, timeframe, timeframe)
    );
    duration = self.parseTimeframe(timeframe) * 1000;
    endAt = milliseconds();
    denominator = 1000;
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = self.parseToInt(floor(since / denominator));
        if functions.ccxtruthy(limit == nothing)
            limit = safeInteger(self.options, "fetchOHLCVLimit", maxLimit);
        end
        endAt = self.sum(since, limit * duration);
    elseif functions.ccxtruthy(limit != nothing)
        since = endAt - limit * duration;
        request[Symbol("startAt")] = self.parseToInt(floor(since / denominator));
    end
    request[Symbol("endAt")] = self.parseToInt(floor(endAt / denominator));
    response = Base.fetch(self.publicGetMarketCandles(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
helper method for fetchOHLCV
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchContractOHLCV(self::Kucoin, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    maxLimit = 200;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchContractOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = maxLimit))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    timeframeOptions = self.safeDict(self.options, "timeframes", defaultValue = Dict{Symbol, Any}());
    swapTimeframes = self.safeDict(timeframeOptions, "swap", defaultValue = Dict{Symbol, Any}());
    parsedTimeframe = safeInteger(swapTimeframes, timeframe);
    if functions.ccxtruthy(parsedTimeframe != nothing)
        request[Symbol("granularity")] = parsedTimeframe;
    else
        request[Symbol("granularity")] = timeframe;
    end
    duration = self.parseTimeframe(timeframe) * 1000;
    endAt = milliseconds();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from")] = since;
        if functions.ccxtruthy(limit == nothing)
            limit = safeInteger(self.options, "fetchOHLCVLimit", maxLimit);
        end
        endAt = self.sum(since, limit * duration);
    elseif functions.ccxtruthy(limit != nothing)
        since = endAt - limit * duration;
        request[Symbol("from")] = since;
    end
    request[Symbol("to")] = endAt;
    response = Base.fetch(self.futuresPublicGetKlineQuery(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOHLCVs(data, market = market, timeframe = timeframe, since = since, limit = limit)

end
"""
create a currency deposit address
see: https://www.kucoin.com/docs-new/rest/account-info/deposit/add-deposit-address-v3

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the blockchain network name

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function createDepositAddress(self::Kucoin, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("chain")] = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
    end
    response = Base.fetch(self.privatePostDepositAddressCreate(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseDepositAddress(data, currency = currency)

end
"""
fetch the deposit address for a currency associated with this account
see: https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-address-v3/en
see: https://www.kucoin.com/docs-new/rest/ua/get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the blockchain network name
- `params.accountType`::string, optional: 'main', 'contract' or 'uta' (default is 'main')
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Kucoin, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountType = "main";
    (accountType, params) = self.handleOptionAndParams(params, "fetchDepositAddress", "accountType", defaultValue = accountType);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    accountType = safeString(accountsByType, accountType, accountType);
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchDepositAddress", "uta", defaultValue = uta);
    if functions.ccxtruthy(accountType == "contract")
            return Base.fetch(self.fetchContractDepositAddress(code, params = params))
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(uta, (accountType == "uta")), (accountType == "unified")))
        return Base.fetch(fetchDepositAddress(self.parent, code, params = extend(params, Dict{Symbol, Any}(
    Symbol("uta") => true
))))
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        _netIdTmp = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
        if functions.ccxtruthy(_netIdTmp != nothing)
            request[Symbol("chain")] =             lowercase(_netIdTmp);
        end
    end
    version = get(get(get(get(self.options, Symbol("versions"), nothing), Symbol("private"), nothing), Symbol("GET"), nothing), Symbol("deposit-addresses"), nothing);
    self.options[Symbol("versions")][Symbol("private")][Symbol("GET")][Symbol("deposit-addresses")] = "v1";
    response = Base.fetch(self.privateGetDepositAddresses(extend(request, params)));
    self.options[Symbol("versions")][Symbol("private")][Symbol("GET")][Symbol("deposit-addresses")] = version;
    data = safeValue(response, "data");
    if functions.ccxtruthy(data == nothing)
        throw(ExchangeError(string(self.id, " fetchDepositAddress() returned an empty response, you might try to run createDepositAddress() first and try again")));
    end
    return self.parseDepositAddress(data, currency = currency)

end
"""
fetch the deposit address for a currency associated with this account
see: https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchContractDepositAddress(self::Kucoin, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    currencyId = get(currency, Symbol("id"), nothing);
    request = Dict{Symbol, Any}(
        Symbol("currency") => currencyId
    );
    response = Base.fetch(self.futuresPrivateGetDepositAddress(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    address = safeString(data, "address");
    if functions.ccxtruthy(currencyId != "NIM")
        self.checkAddress(address = address);
    end
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("currency") => currencyId,
    Symbol("network") => safeString(data, "chain"),
    Symbol("address") => address,
    Symbol("tag") => safeString(data, "memo")
)

end
function parseDepositAddress(self::Kucoin, depositAddress; currency=nothing)
    address = safeString(depositAddress, "address");
    if functions.ccxtruthy(address != nothing)
        address = replace(address, "bitcoincash:" => "");
    end
    code = nothing;
    if functions.ccxtruthy(currency != nothing)
        code = self.safeCurrencyCode(get(currency, Symbol("id"), nothing));
        if functions.ccxtruthy(code != "NIM")
            self.checkAddress(address = address);
        end
    end
    chainId = safeString(depositAddress, "chainId");
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => code,
    Symbol("network") => self.networkIdToCode(networkId = chainId, currencyCode = code),
    Symbol("address") => address,
    Symbol("tag") => safeString(depositAddress, "memo")
)

end
"""
fetch the deposit address for a currency associated with this account
see: https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-address-v3/en
see: https://www.kucoin.com/docs-new/rest/ua/get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false

# Returns
- an array of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddressesByNetwork(self::Kucoin, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchDepositAddressesByNetwork", "uta", defaultValue = uta);
    response = nothing;
    if functions.ccxtruthy(uta)
        networkCode = nothing;
        (networkCode, params) = self.handleNetworkCodeAndParams(params);
        if functions.ccxtruthy(networkCode != nothing)
            _netIdTmp = self.networkCodeToId(networkCode, currencyCode = code);
            if functions.ccxtruthy(_netIdTmp != nothing)
                request[Symbol("chain")] =                 lowercase(_netIdTmp);
            end
        end
        response = Base.fetch(self.utaPrivateGetAssetDepositAddress(extend(request, params)));
    else
        version = get(get(get(get(self.options, Symbol("versions"), nothing), Symbol("private"), nothing), Symbol("GET"), nothing), Symbol("deposit-addresses"), nothing);
        self.options[Symbol("versions")][Symbol("private")][Symbol("GET")][Symbol("deposit-addresses")] = "v2";
        response = Base.fetch(self.privateGetDepositAddresses(extend(request, params)));
        self.options[Symbol("versions")][Symbol("private")][Symbol("GET")][Symbol("deposit-addresses")] = version;
    end
    chains = self.safeList(response, "data", defaultValue = []);
    parsed = self.parseDepositAddresses(chains, codes = [get(currency, Symbol("code"), nothing)], indexed = false, params = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("code"), nothing)
    ));
    return indexBy(parsed, "network")

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-part-orderbook
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-full-orderbook
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-part-orderbook
see: https://www.kucoin.com/docs-new/rest/ua/get-orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Kucoin, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    level = safeInteger(params, "level", 2);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    isAuthenticated = self.checkRequiredCredentials(error = false);
    uta = false;
    (uta, params) = self.handleOptionAndParams(params, "fetchOrderBook", "uta", defaultValue = uta);
    response = nothing;
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrderBook", market = market, params = params);
    if functions.ccxtruthy(uta)
        limitString = "20";
        if functions.ccxtruthy(@functions.ccxt_or((limit == nothing), (functions.ccxt_ge(limit, 100))))
            limitString = "FULL";
        elseif functions.ccxtruthy(functions.ccxt_gt(limit, 20))
            limitString = "100";
        end
        request[Symbol("limit")] = limitString;
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        if functions.ccxtruthy(@functions.ccxt_or((type_var == "spot"), (type_var == "margin")))
            request[Symbol("tradeType")] = "SPOT";
        else
            request[Symbol("tradeType")] = "FUTURES";
        end
        response = Base.fetch(self.utaPrivateGetMarketOrderbook(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_and((type_var != "spot"), (type_var != "margin")))
        if functions.ccxtruthy(@functions.ccxt_and(level != 2, level != nothing))
            throw(BadRequest(string(self.id, " fetchOrderBook() can only return level 2")));
        end
        if functions.ccxtruthy(limit == nothing)
            response = Base.fetch(self.futuresPublicGetLevel2Snapshot(extend(request, params)));
        elseif functions.ccxtruthy(limit == 20)
            response = Base.fetch(self.futuresPublicGetLevel2Depth20(extend(request, params)));
        else
            if functions.ccxtruthy(limit == 100)
                response = Base.fetch(self.futuresPublicGetLevel2Depth100(extend(request, params)));
            else
                throw(BadRequest(string(self.id, " fetchOrderBook() limit argument must be 20 or 100")));
            end

        end
    else
        if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(isAuthenticated), limit != nothing))
            if functions.ccxtruthy(level == 2)
                request[Symbol("level")] = level;
                if functions.ccxtruthy(limit != nothing)
                    if functions.ccxtruthy(@functions.ccxt_or((limit == 20), (limit == 100)))
                        request[Symbol("limit")] = limit;
                    else
                        throw(ExchangeError(string(self.id, " fetchOrderBook() limit argument must be 20 or 100")));
                    end
                end
                request[Symbol("limit")] = functions.ccxtruthy(limit) ? limit : 100;
            end
            response = Base.fetch(self.publicGetMarketOrderbookLevelLevelLimit(extend(request, params)));
        else
            response = Base.fetch(self.privateGetMarketOrderbookLevel2(extend(request, params)));
        end

    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(data, "time");
    if functions.ccxtruthy(timestamp == nothing)
        nanoseconds = safeInteger(data, "ts");
        if functions.ccxtruthy(nanoseconds != nothing)
            timestamp = self.parseToInt(nanoseconds / 1000000);
        end
    end
    orderbook = self.parseOrderBook(data, get(market, Symbol("symbol"), nothing), timestamp = timestamp, bidsKey = "bids", asksKey = "asks", priceKey = level - 2, amountKey = level - 1);
    orderbook[Symbol("nonce")] = safeInteger(data, "sequence");
    return orderbook

end
function handleTriggerPrices(self::Kucoin, params)
    triggerPrice = safeValue2(params, "triggerPrice", "stopPrice");
    stopLossPrice = safeValue(params, "stopLossPrice");
    takeProfitPrice = safeValue(params, "takeProfitPrice");
    isStopLoss = stopLossPrice != nothing;
    isTakeProfit = takeProfitPrice != nothing;
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((@functions.ccxt_and(isStopLoss, isTakeProfit)), (@functions.ccxt_and(triggerPrice, stopLossPrice))), (@functions.ccxt_and(triggerPrice, isTakeProfit))))
        throw(ExchangeError(string(self.id, " createOrder() - you should use either triggerPrice or stopLossPrice or takeProfitPrice")));
    end
    return [triggerPrice, stopLossPrice, takeProfitPrice]

end
"""
Create an order on the exchange
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-stop-order
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-stop-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-take-profit-and-stop-loss-order
see: https://www.kucoin.com/docs-new/rest/ua/place-order

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false Check createSpotOrder(), createContractOrder() and createUtaOrder () for more details on the extra parameters that can be used in params

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Kucoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "createOrder", "uta", defaultValue = uta);
    if functions.ccxtruthy(uta)
            return Base.fetch(self.createUtaOrder(symbol, type_var, side, amount, price = price, params = params))
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        return Base.fetch(self.createSpotOrder(symbol, type_var, side, amount, price = price, params = params))
    else
        if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
                return Base.fetch(self.createContractOrder(symbol, type_var, side, amount, price = price, params = params))
        else
            throw(NotSupported(string(self.id, " createOrder() does not support market ", get(market, Symbol("type"), nothing))));
        end

    end

end
"""
helper method for creating spot orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-stop-order
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-stop-order

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.marginMode`::string, optional: 'cross', // cross (cross mode) and isolated (isolated mode), set to cross by default, the isolated mode will be released soon, stay tuned
- `params.timeInForce`::string, optional: GTC, GTT, IOC, or FOK, default is GTC, limit orders only
- `params.postOnly`::bool, optional: Post only flag, invalid when timeInForce is IOC or FOK EXCHANGE SPECIFIC PARAMETERS
- `params.clientOid`::string, optional: client order id, defaults to uuid if not passed
- `params.remark`::string, optional: remark for the order, length cannot exceed 100 utf8 characters
- `params.tradeType`::string, optional: 'TRADE', // TRADE, MARGIN_TRADE // not used with margin orders limit orders ---------------------------------------------------
- `params.cancelAfter`::float, optional: long, // cancel after n seconds, requires timeInForce to be GTT
- `params.hidden`::bool, optional: false, // Order will not be displayed in the order book
- `params.iceberg`::bool, optional: false, // Only a portion of the order is displayed in the order book
- `params.visibleSize`::string, optional: this.amountToPrecision (symbol, visibleSize), // The maximum visible size of an iceberg order market orders --------------------------------------------------
- `params.funds`::string, optional: // Amount of quote currency to use stop orders ----------------------------------------------------
- `params.stop`::string, optional: Either loss or entry, the default is loss. Requires triggerPrice to be defined margin orders --------------------------------------------------
- `params.leverage`::float, optional: Leverage size of the order
- `params.stp`::string, optional: '', // self trade prevention, CN, CO, CB or DC
- `params.autoBorrow`::bool, optional: false, // The system will first borrow you funds at the optimal interest rate and then place an order for you
- `params.hf`::bool, optional: false, // true for hf order
- `params.test`::bool, optional: set to true to test an order, no order will be created but the request will be validated
- `params.sync`::bool, optional: set to true to use the hf sync call

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createSpotOrder(self::Kucoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    testOrder = self.safeBool(params, "test", defaultValue = false);
    params = omit(params, "test");
    hf = nothing;
    (hf, params) = self.handleHfAndParams(params = params);
    useSync = false;
    (useSync, params) = self.handleOptionAndParams(params, "createOrder", "sync", defaultValue = false);
    (triggerPrice, stopLossPrice, takeProfitPrice) = self.handleTriggerPrices(params);
    tradeType = safeString(params, "tradeType");
    isTriggerOrder = (@functions.ccxt_or(@functions.ccxt_or(triggerPrice, stopLossPrice), takeProfitPrice));
    marginResult = self.handleMarginModeAndParams("createOrder", params = params);
    marginMode = safeString(marginResult, 0);
    isMarginOrder = @functions.ccxt_or(tradeType == "MARGIN_TRADE", marginMode != nothing);
    orderRequest = self.createSpotOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    response = nothing;
    if functions.ccxtruthy(testOrder)
        if functions.ccxtruthy(isMarginOrder)
            if functions.ccxtruthy(hf)
                response = Base.fetch(self.privatePostHfMarginOrderTest(orderRequest));
            else
                response = Base.fetch(self.privatePostMarginOrderTest(orderRequest));
            end
        elseif functions.ccxtruthy(hf)
            response = Base.fetch(self.privatePostHfOrdersTest(orderRequest));
        else
            response = Base.fetch(self.privatePostOrdersTest(orderRequest));
        end
    elseif functions.ccxtruthy(isTriggerOrder)
        if functions.ccxtruthy(isMarginOrder)
            response = Base.fetch(self.privatePostHfMarginStopOrder(orderRequest));
        else
            response = Base.fetch(self.privatePostStopOrder(orderRequest));
        end
    else
        if functions.ccxtruthy(isMarginOrder)
            if functions.ccxtruthy(hf)
                response = Base.fetch(self.privatePostHfMarginOrder(orderRequest));
            else
                response = Base.fetch(self.privatePostMarginOrder(orderRequest));
            end
        elseif functions.ccxtruthy(useSync)
            response = Base.fetch(self.privatePostHfOrdersSync(orderRequest));
        else
            if functions.ccxtruthy(hf)
                response = Base.fetch(self.privatePostHfOrders(orderRequest));
            else
                response = Base.fetch(self.privatePostOrders(orderRequest));
            end

        end

    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function createSpotOrderRequest(self::Kucoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    clientOrderId = safeString2(params, "clientOid", "clientOrderId", uuid());
    params = omit(params, ["clientOid", "clientOrderId"]);
    request = Dict{Symbol, Any}(
        Symbol("clientOid") => clientOrderId,
        Symbol("side") => side,
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("type") => type_var
    );
    quoteAmount = self.safeNumber2(params, "cost", "funds");
    amountString = nothing;
    costString = nothing;
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params);
    if functions.ccxtruthy(type_var == "market")
        if functions.ccxtruthy(quoteAmount != nothing)
            params = omit(params, ["cost", "funds"]);
            costString = self.marketOrderAmountToPrecision(symbol, quoteAmount);
            request[Symbol("funds")] = costString;
        else
            amountString = self.amountToPrecision(symbol, amount);
            request[Symbol("size")] = self.amountToPrecision(symbol, amount);
        end
    else
        amountString = self.amountToPrecision(symbol, amount);
        request[Symbol("size")] = amountString;
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    tradeType = safeString(params, "tradeType");
    (triggerPrice, stopLossPrice, takeProfitPrice) = self.handleTriggerPrices(params);
    isTriggerOrder = (@functions.ccxt_or(@functions.ccxt_or(triggerPrice, stopLossPrice), takeProfitPrice));
    isMarginOrder = @functions.ccxt_or(tradeType == "MARGIN_TRADE", marginMode != nothing);
    params = omit(params, ["stopLossPrice", "takeProfitPrice", "triggerPrice", "stopPrice"]);
    if functions.ccxtruthy(isTriggerOrder)
        if functions.ccxtruthy(triggerPrice)
            request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
        elseif functions.ccxtruthy(@functions.ccxt_or(stopLossPrice, takeProfitPrice))
            if functions.ccxtruthy(stopLossPrice)
                request[Symbol("stop")] = functions.ccxtruthy((side == "buy")) ? "entry" : "loss";
                request[Symbol("stopPrice")] = self.priceToPrecision(symbol, stopLossPrice);
            else
                request[Symbol("stop")] = functions.ccxtruthy((side == "buy")) ? "loss" : "entry";
                request[Symbol("stopPrice")] = self.priceToPrecision(symbol, takeProfitPrice);
            end
        end
        if functions.ccxtruthy(marginMode == "isolated")
            throw(BadRequest(string(self.id, " createOrder does not support isolated margin for stop orders")));
        elseif functions.ccxtruthy(marginMode == "cross")
            request[Symbol("tradeType")] = get(get(self.options, Symbol("marginModes"), nothing), Symbol(marginMode), nothing);
        end
    elseif functions.ccxtruthy(isMarginOrder)
        if functions.ccxtruthy(marginMode == "isolated")
            request[Symbol("marginModel")] = "isolated";
        end
    end
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(type_var == "market", false, params = params);
    if functions.ccxtruthy(postOnly)
        request[Symbol("postOnly")] = true;
    end
    return extend(request, params)

end
function marketOrderAmountToPrecision(self::Kucoin, symbol, amount)
    market = self.market(symbol);
    result = decimalToPrecision(amount, TRUNCATE, get(get(market, Symbol("info"), nothing), Symbol("quoteIncrement"), nothing), self.precisionMode, self.paddingMode);
    if functions.ccxtruthy(result == "0")
        throw(InvalidOrder(string(self.id, " amount of ", get(market, Symbol("symbol"), nothing), " must be greater than minimum amount precision of ", numberToString(get(get(market, Symbol("precision"), nothing), Symbol("amount"), nothing)))));
    end
    return result

end
"""
helper method for creating contract orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-take-profit-and-stop-loss-order

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at
- `params.stopLossPrice`::float, optional: price to trigger stop-loss orders
- `params.takeProfitPrice`::float, optional: price to trigger take-profit orders
- `params.reduceOnly`::bool, optional: A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
- `params.timeInForce`::string, optional: GTC, GTT, IOC, or FOK, default is GTC, limit orders only
- `params.postOnly`::bool, optional: Post only flag, invalid when timeInForce is IOC or FOK
- `params.cost`::float, optional: the cost of the order in units of USDT
- `params.marginMode`::string, optional: 'cross' or 'isolated', default is 'isolated'
- `params.hedged`::bool, optional: *swap and future only* true for hedged mode, false for one way mode, default is false ----------------- Exchange Specific Parameters -----------------
- `params.leverage`::float, optional: Leverage size of the order (mandatory param in request, default is 1)
- `params.clientOid`::string, optional: client order id, defaults to uuid if not passed
- `params.remark`::string, optional: remark for the order, length cannot exceed 100 utf8 characters
- `params.stop`::string, optional: 'up' or 'down', the direction the triggerPrice is triggered from, requires triggerPrice. down: Triggers when the price reaches or goes below the triggerPrice. up: Triggers when the price reaches or goes above the triggerPrice.
- `params.triggerPriceType`::string, optional: "last", "mark", "index" - defaults to "mark"
- `params.stopPriceType`::string, optional: exchange-specific alternative for triggerPriceType: TP, IP or MP
- `params.closeOrder`::bool, optional: set to true to close position
- `params.test`::bool, optional: set to true to use the test order endpoint (does not submit order, use to validate params)
- `params.forceHold`::bool, optional: A mark to forcely hold the funds for an order, even though it's an order to reduce the position size. This helps the order stay on the order book and not get canceled when the position size changes. Set to false by default.\
- `params.positionSide`::string, optional: *swap and future only* hedged two-way position side, LONG or SHORT

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createContractOrder(self::Kucoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    testOrder = self.safeBool(params, "test", defaultValue = false);
    params = omit(params, "test");
    hasTpOrSlOrder = @functions.ccxt_or((safeValue(params, "stopLoss") != nothing), (safeValue(params, "takeProfit") != nothing));
    orderRequest = self.createContractOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    response = nothing;
    if functions.ccxtruthy(testOrder)
        response = Base.fetch(self.futuresPrivatePostOrdersTest(orderRequest));
    else
        if functions.ccxtruthy(hasTpOrSlOrder)
            response = Base.fetch(self.futuresPrivatePostStOrders(orderRequest));
        else
            response = Base.fetch(self.futuresPrivatePostOrders(orderRequest));
        end
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function createContractOrderRequest(self::Kucoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    clientOrderId = safeString2(params, "clientOid", "clientOrderId", uuid());
    params = omit(params, ["clientOid", "clientOrderId"]);
    request = Dict{Symbol, Any}(
        Symbol("clientOid") => clientOrderId,
        Symbol("side") => side,
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("type") => type_var,
        Symbol("leverage") => 1
    );
    marginModeUpper = safeStringUpper(params, "marginMode");
    if functions.ccxtruthy(marginModeUpper != nothing)
        params = omit(params, "marginMode");
        request[Symbol("marginMode")] = marginModeUpper;
    end
    cost = safeString(params, "cost");
    params = omit(params, "cost");
    if functions.ccxtruthy(cost != nothing)
        request[Symbol("valueQty")] = self.costToPrecision(symbol, cost);
    else
        if functions.ccxtruthy(amount == nothing)
            throw(ArgumentsRequired(string(self.id, " requires an amount argument")));
        end
        if functions.ccxtruthy(functions.ccxt_lt(amount, 1))
            throw(InvalidOrder(string(self.id, " createOrder() minimum contract order amount is 1")));
        end
        sizeString = self.amountToPrecision(symbol, amount);
        if functions.ccxtruthy(sizeString != nothing)
            request[Symbol("size")] = ccxt_parseInt(sizeString);
        end
    end
    (triggerPrice, stopLossPrice, takeProfitPrice) = self.handleTriggerPrices(params);
    stopLoss = self.safeDict(params, "stopLoss");
    takeProfit = self.safeDict(params, "takeProfit");
    hasStopLoss = stopLoss != nothing;
    hasTakeProfit = takeProfit != nothing;
    triggerPriceTypes = Dict{Symbol, Any}(
        Symbol("mark") => "MP",
        Symbol("last") => "TP",
        Symbol("index") => "IP"
    );
    triggerPriceType = safeString(params, "triggerPriceType", "mark");
    triggerPriceTypeValue = safeString(triggerPriceTypes, triggerPriceType, triggerPriceType);
    params = omit(params, ["stopLossPrice", "takeProfitPrice", "triggerPrice", "stopPrice", "takeProfit", "stopLoss"]);
    if functions.ccxtruthy(triggerPrice)
        request[Symbol("stop")] = functions.ccxtruthy((side == "buy")) ? "up" : "down";
        request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("stopPriceType")] = triggerPriceTypeValue;
    elseif functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
        priceType = triggerPriceTypeValue;
        if functions.ccxtruthy(hasStopLoss)
            slPrice = safeString2(stopLoss, "triggerPrice", "stopPrice");
            request[Symbol("triggerStopDownPrice")] = self.priceToPrecision(symbol, slPrice);
            priceType = safeString(stopLoss, "triggerPriceType", "mark");
            priceType = safeString(triggerPriceTypes, priceType, priceType);
        end
        if functions.ccxtruthy(hasTakeProfit)
            tpPrice = safeString2(takeProfit, "triggerPrice", "takeProfitPrice");
            request[Symbol("triggerStopUpPrice")] = self.priceToPrecision(symbol, tpPrice);
            priceType = safeString(takeProfit, "triggerPriceType", "mark");
            priceType = safeString(triggerPriceTypes, priceType, priceType);
        end
        request[Symbol("stopPriceType")] = priceType;
    else
        if functions.ccxtruthy(@functions.ccxt_or(stopLossPrice, takeProfitPrice))
            if functions.ccxtruthy(stopLossPrice)
                request[Symbol("stop")] = functions.ccxtruthy((side == "buy")) ? "up" : "down";
                request[Symbol("stopPrice")] = self.priceToPrecision(symbol, stopLossPrice);
            else
                request[Symbol("stop")] = functions.ccxtruthy((side == "buy")) ? "down" : "up";
                request[Symbol("stopPrice")] = self.priceToPrecision(symbol, takeProfitPrice);
            end
            request[Symbol("reduceOnly")] = true;
            request[Symbol("stopPriceType")] = triggerPriceTypeValue;
        end

    end
    uppercaseType = uppercase(type_var);
    timeInForce = safeStringUpper(params, "timeInForce");
    if functions.ccxtruthy(uppercaseType == "LIMIT")
        if functions.ccxtruthy(price == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for limit orders")));
        else
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        end
        if functions.ccxtruthy(timeInForce != nothing)
            request[Symbol("timeInForce")] = timeInForce;
        end
    end
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(type_var == "market", false, params = params);
    if functions.ccxtruthy(postOnly)
        request[Symbol("postOnly")] = true;
    end
    hidden = safeValue(params, "hidden");
    if functions.ccxtruthy(@functions.ccxt_and(postOnly, (hidden != nothing)))
        throw(BadRequest(string(self.id, " createOrder() does not support the postOnly parameter together with a hidden parameter")));
    end
    iceberg = safeValue(params, "iceberg");
    if functions.ccxtruthy(iceberg)
        visibleSize = safeValue(params, "visibleSize");
        if functions.ccxtruthy(visibleSize == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a visibleSize parameter for iceberg orders")));
        end
    end
    reduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
    hedged = nothing;
    (hedged, params) = self.handleParamBool(params, "hedged", defaultValue = false);
    if functions.ccxtruthy(reduceOnly)
        request[Symbol("reduceOnly")] = reduceOnly;
        if functions.ccxtruthy(hedged)
            reduceOnlyPosSide = functions.ccxtruthy((side == "sell")) ? "LONG" : "SHORT";
            request[Symbol("positionSide")] = reduceOnlyPosSide;
        end
    else
        if functions.ccxtruthy(hedged)
            posSide = functions.ccxtruthy((side == "buy")) ? "LONG" : "SHORT";
            request[Symbol("positionSide")] = posSide;
        end
    end
    params = omit(params, ["timeInForce", "stopPrice", "triggerPrice", "stopLossPrice", "takeProfitPrice", "reduceOnly", "hedged"]);
    return extend(request, params)

end
"""
helper method for creating uta orders
see: https://www.kucoin.com/docs-new/rest/ua/place-order

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, defaults to uuid if not passed
- `params.cost`::float, optional: the cost of the order in units of quote currency
- `params.timeInForce`::string, optional: GTC, GTD, IOC, FOK or PO
- `params.postOnly`::bool, optional: Post only flag, invalid when timeInForce is IOC or FOK (default is false)
- `params.reduceOnly`::bool, optional: *contract markets only* A mark to reduce the position size only. Set to false by default
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at
- `params.triggerDirection`::string, optional: 'ascending' or 'descending', the direction the triggerPrice is triggered from, requires triggerPrice
- `params.triggerPriceType`::string, optional: *contract markets only* "last", "mark", "index" - defaults to "mark"
- `params.stopLossPrice`::float, optional: price to trigger stop-loss orders
- `params.takeProfitPrice`::float, optional: price to trigger take-profit orders
- `params.marginMode`::string, optional: 'cross' or 'isolated', (default is 'cross' for margin orders, default is 'isolated' for contract orders) Exchange-specific parameters -------------------------------------------------
- `params.accountMode`::string, optional: 'unified' or 'classic', default is 'unified'
- `params.stp`::string, optional: '', // self trade prevention, CN, CO, CB or DC
- `params.cancelAfter`::int, optional: - Cancel After N Seconds (Calculated from the time of entering the matching engine), only effective when timeInForce is GTD
- `params.sizeUnit`::string, optional: *contracts only* 'BASECCY' (amount of base currency) or 'UNIT' (number of contracts), default is 'UNIT' Classic account parameters
- `params.autoBorrow`::bool, optional: *classic margin orders only*
- `params.autoRepay`::bool, optional: *classic margin orders only*
- `params.hedged`::string, optional: *classic contract orders only* true for hedged mode, false for one way mode, default is false
- `params.leverage`::int, optional: *classic contract orders with isolated marginMode only* Leverage size of the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createUtaOrder(self::Kucoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createUtaOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    response = Base.fetch(self.utaPrivatePostAccountModeOrderPlace(request));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function createUtaOrderRequest(self::Kucoin, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    market = self.market(symbol);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    isSpot = get(market, Symbol("spot"), nothing);
    isContract = get(market, Symbol("contract"), nothing);
    accountMode = "unified";
    (accountMode, params) = self.handleOptionAndParams(params, "createOrder", "accountMode", defaultValue = accountMode);
    isUnified = (accountMode == "unified");
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params);
    tradeType = self.handleTradeType(isContractMarket = isContract, marginMode = marginMode, isUnified = isUnified, params = params);
    clientOrderId = safeString2(params, "clientOid", "clientOrderId", uuid());
    params = omit(params, ["clientOid", "clientOrderId"]);
    request = Dict{Symbol, Any}(
        Symbol("accountMode") => accountMode,
        Symbol("tradeType") => tradeType,
        Symbol("clientOid") => clientOrderId,
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side),
        Symbol("orderType") => uppercase(type_var)
    );
    if functions.ccxtruthy(tradeType != nothing)
        request[Symbol("tradeType")] = tradeType;
    end
    request[Symbol("clientOid")] = clientOrderId;
    isMarketOrder = (type_var == "market");
    cost = safeString(params, "cost");
    if functions.ccxtruthy(cost != nothing)
        params = omit(params, "cost");
        if functions.ccxtruthy(@functions.ccxt_and(isSpot, isMarketOrder))
            request[Symbol("sizeUnit")] = "QUOTECCY";
            request[Symbol("size")] = self.marketOrderAmountToPrecision(symbol, cost);
        else
            throw(NotSupported(string(self.id, " createOrder() with cost is supported for spot market orders only")));
        end
    else
        sizeUnit = "BASECCY";
        if functions.ccxtruthy(isContract)
            (sizeUnit, params) = self.handleOptionAndParams(params, "createOrder", "sizeUnit", defaultValue = "UNIT");
        end
        request[Symbol("sizeUnit")] = sizeUnit;
        request[Symbol("size")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(!functions.ccxtruthy(isMarketOrder))
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    postOnly = nothing;
    (postOnly, params) = self.handlePostOnly(isMarketOrder, false, params = params);
    timeInForce = self.handleTimeInForce(params = params);
    if functions.ccxtruthy((timeInForce != nothing))
        params = omit(params, "timeInForce");
        request[Symbol("timeInForce")] = timeInForce;
    end
    if functions.ccxtruthy(postOnly)
        request[Symbol("postOnly")] = true;
    end
    if functions.ccxtruthy(isContract)
        if functions.ccxtruthy(!functions.ccxtruthy(isUnified))
            if functions.ccxtruthy(marginMode != nothing)
                request[Symbol("marginMode")] =                 uppercase(marginMode);
                if functions.ccxtruthy(marginMode == "isolated")
                    leverage = safeInteger(params, "leverage");
                    if functions.ccxtruthy(leverage == nothing)
                        request[Symbol("leverage")] = 1;
                    end
                end
            end
            reduceOnly = self.safeBool(params, "reduceOnly", defaultValue = false);
            hedged = false;
            (hedged, params) = self.handleParamBool(params, "hedged", defaultValue = hedged);
            if functions.ccxtruthy(hedged)
                positionSide = functions.ccxtruthy((side == "buy")) ? "LONG" : "SHORT";
                if functions.ccxtruthy(reduceOnly)
                    positionSide = functions.ccxtruthy((positionSide == "LONG")) ? "SHORT" : "LONG";
                end
                request[Symbol("positionSide")] = positionSide;
            end
        end
    end
    (triggerPrice, stopLossPrice, takeProfitPrice) = self.handleTriggerPrices(params);
    stopLoss = self.safeDict(params, "stopLoss");
    takeProfit = self.safeDict(params, "takeProfit");
    hasStopLoss = stopLoss != nothing;
    hasTakeProfit = takeProfit != nothing;
    triggerPriceTypes = Dict{Symbol, Any}(
        Symbol("mark") => "MP",
        Symbol("last") => "TP",
        Symbol("index") => "IP"
    );
    if functions.ccxtruthy(triggerPrice)
        triggerDirection = safeString(params, "triggerDirection");
        if functions.ccxtruthy(triggerDirection == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a triggerDirection parameter for trigger orders. Provide params.tringgerDirection or use params.stopLossPrice or params.takeProfitPrice instead of params.triggerPrice")));
        end
        request[Symbol("triggerDirection")] = functions.ccxtruthy((triggerDirection == "ascending")) ? "UP" : "DOWN";
        request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, triggerPrice);
    elseif functions.ccxtruthy(@functions.ccxt_or(hasStopLoss, hasTakeProfit))
        if functions.ccxtruthy(!functions.ccxtruthy(isContract))
            throw(NotSupported(string(self.id, " createOrder() stopLoss and takeProfit parameters are only supported for contract orders")));
        end
        if functions.ccxtruthy(hasStopLoss)
            slTriggerPrice = safeString2(stopLoss, "triggerPrice", "stopPrice");
            slTriggerPriceType = safeString(stopLoss, "triggerPriceType", "mark");
            request[Symbol("slTriggerPrice")] = self.priceToPrecision(symbol, slTriggerPrice);
            request[Symbol("slTriggerPriceType")] = safeString(triggerPriceTypes, slTriggerPriceType, slTriggerPriceType);
        end
        if functions.ccxtruthy(hasTakeProfit)
            tpTriggerPrice = safeString2(takeProfit, "triggerPrice", "takeProfitPrice");
            tpTriggerPriceType = safeString(takeProfit, "triggerPriceType", "mark");
            request[Symbol("tpTriggerPrice")] = self.priceToPrecision(symbol, tpTriggerPrice);
            request[Symbol("tpTriggerPriceType")] = safeString(triggerPriceTypes, tpTriggerPriceType, tpTriggerPriceType);
        end
    else
        if functions.ccxtruthy(@functions.ccxt_or(stopLossPrice, takeProfitPrice))
            if functions.ccxtruthy(stopLossPrice)
                request[Symbol("triggerDirection")] = functions.ccxtruthy((side == "buy")) ? "UP" : "DOWN";
                request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, stopLossPrice);
                if functions.ccxtruthy(isContract)
                    stopLossPriceType = safeString2(params, "stopLossPriceType", "triggerPriceType", "mark");
                    request[Symbol("triggerPriceType")] = safeString(triggerPriceTypes, stopLossPriceType, stopLossPriceType);
                end
            else
                request[Symbol("triggerDirection")] = functions.ccxtruthy((side == "buy")) ? "DOWN" : "UP";
                request[Symbol("triggerPrice")] = self.priceToPrecision(symbol, takeProfitPrice);
                if functions.ccxtruthy(isContract)
                    takeProfitPriceType = safeString2(params, "takeProfitPriceType", "triggerPriceType", "mark");
                    request[Symbol("triggerPriceType")] = safeString(triggerPriceTypes, takeProfitPriceType, takeProfitPriceType);
                end
            end
        end

    end
    params = omit(params, ["triggerPrice", "stopLossPrice", "takeProfitPrice", "stopPriceType", "stopLossPriceType", "takeProfitPriceType", "triggerPriceType", "triggerDirection", "stopLoss", "takeProfit", "hedged"]);
    return extend(request, params)

end
"""
create a market order by providing the symbol, side and cost
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketOrderWithCost(self::Kucoin, symbol, side, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return Base.fetch(self.createOrder(symbol, "market", side, cost, price = nothing, params = extend(req, params)))

end
"""
create a market buy order by providing the symbol and cost
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Kucoin, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    return Base.fetch(self.createMarketOrderWithCost(symbol, "buy", cost, params = params))

end
"""
create a market sell order by providing the symbol and cost
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketSellOrderWithCost(self::Kucoin, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    return Base.fetch(self.createMarketOrderWithCost(symbol, "sell", cost, params = params))

end
"""
create a list of trade orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders-sync

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint Check createSpotOrders() and createContractOrders() for more details on the extra parameters that can be used in params

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Kucoin, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    isSpot = false;
    isContract = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = self.safeDict(orders, i);
        symbol = safeString(order, "symbol");
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrders() requires a symbol for each order")));
        end
        market = self.market(symbol);
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            isSpot = true;
        elseif functions.ccxtruthy(get(market, Symbol("contract"), nothing))
            isContract = true;
        end
        i += 1
    end
    if functions.ccxtruthy(@functions.ccxt_and(isSpot, isContract))
        throw(BadRequest(string(self.id, " createOrders() requires all orders to be either spot or contract")));
    elseif functions.ccxtruthy(isSpot)
        return Base.fetch(self.createSpotOrders(orders, params = params))
    else
        if functions.ccxtruthy(isContract)
                return Base.fetch(self.createContractOrders(orders, params = params))
        else
            throw(NotSupported(string(self.id, " createOrders() does not support the markets of the orders provided")));
        end

    end

end
"""
helper method for creating spot orders in batch
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders-sync
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/batch-add-orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.hf`::bool, optional: false, // true for hf orders
- `params.sync`::bool, optional: false, // true to use the hf sync call

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createSpotOrders(self::Kucoin, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    symbol = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        marketId = safeString(rawOrder, "symbol");
        if functions.ccxtruthy(marketId == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrders() requires a symbol for each order")));
        end
        if functions.ccxtruthy(symbol == nothing)
            symbol = marketId;
        else
            if functions.ccxtruthy(symbol != marketId)
                throw(BadRequest(string(self.id, " createOrders() requires all orders to have the same symbol")));
            end
        end
        type_var = safeString(rawOrder, "type");
        if functions.ccxtruthy(type_var != "limit")
            throw(BadRequest(string(self.id, " createOrders() only supports limit orders")));
        end
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = safeValue(rawOrder, "params", Dict{Symbol, Any}());
        orderRequest = self.createSpotOrderRequest(marketId, type_var, side, amount, price = price, params = orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrders() requires at least one order with a symbol")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("orderList") => ordersRequests
    );
    hf = nothing;
    (hf, params) = self.handleHfAndParams(params = params);
    useSync = false;
    (useSync, params) = self.handleOptionAndParams(params, "createOrders", "sync", defaultValue = false);
    response = nothing;
    if functions.ccxtruthy(useSync)
        response = Base.fetch(self.privatePostHfOrdersMultiSync(extend(request, params)));
    elseif functions.ccxtruthy(hf)
        response = Base.fetch(self.privatePostHfOrdersMulti(extend(request, params)));
    else
        response = Base.fetch(self.privatePostOrdersMulti(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    data = self.safeList(data, "data", defaultValue = []);
    return self.parseOrders(data)

end
"""
helper method for creating contract orders in batch
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/batch-add-orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createContractOrders(self::Kucoin, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        symbol = safeString(rawOrder, "symbol");
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " createOrders() requires a symbol for each order")));
        end
        type_var = safeString(rawOrder, "type", "");
        side = safeString(rawOrder, "side");
        amount = safeValue(rawOrder, "amount");
        price = safeValue(rawOrder, "price");
        orderParams = safeValue(rawOrder, "params", Dict{Symbol, Any}());
        orderRequest = self.createContractOrderRequest(symbol, type_var, side, amount, price = price, params = orderParams);
        push!(ordersRequests, orderRequest);
        i += 1
    end
    response = Base.fetch(self.futuresPrivatePostOrdersMulti(ordersRequests));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOrders(data)

end
"""
edit an order, kucoin currently only supports the modification of HF orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/modify-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: not used
- `side`::string: not used
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, defaults to id if not passed

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Kucoin, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    clientOrderId = safeString2(params, "clientOid", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOid")] = clientOrderId;
    else
        request[Symbol("orderId")] = id;
    end
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("newSize")] = self.amountToPrecision(symbol, amount);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("newPrice")] = self.priceToPrecision(symbol, price);
    end
    response = Base.fetch(self.privatePostHfOrdersAlter(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
cancels an open order
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/ua/cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.marginMode`::string, optional: *spot only* 'cross' or 'isolated'
- `params.uta`::bool, optional: true for cancelling order with unified account endpoint (default is false) Check cancelSpotOrder() and cancelContractOrder() for more details on the extra parameters that can be used in params

# Returns
- Response from the exchange
"""
function cancelOrder(self::Kucoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "cancelOrder", "uta", defaultValue = uta);
    if functions.ccxtruthy(uta)
            return Base.fetch(self.cancelUtaOrder(id, symbol = symbol, params = params))
    end
    marketType = nothing;
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    (marketType, params) = self.handleMarketTypeAndParams("cancelOrder", market = market, params = params);
    if functions.ccxtruthy(@functions.ccxt_or((marketType == "spot"), (marketType == "margin")))
            return Base.fetch(self.cancelSpotOrder(id, symbol = symbol, params = params))
    else
        return Base.fetch(self.cancelContractOrder(id, symbol = symbol, params = params))
    end

end
"""
helper method for cancelling spot orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-clientoid

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: True if cancelling a stop order
- `params.hf`::bool, optional: false, // true for hf order
- `params.sync`::bool, optional: false, // true to use the hf sync call
- `params.marginMode`::string, optional: 'cross' or 'isolated'

# Returns
- Response from the exchange
"""
function cancelSpotOrder(self::Kucoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOid", "clientOrderId");
    trigger = self.safeBool2(params, "stop", "trigger", defaultValue = false);
    hf = nothing;
    (hf, params) = self.handleHfAndParams(params = params);
    useSync = false;
    (useSync, params) = self.handleOptionAndParams(params, "cancelOrder", "sync", defaultValue = false);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("cancelOrder", params = params);
    tradeType = safeString(params, "tradeType");
    isMarginOrder = @functions.ccxt_or(tradeType == "MARGIN_TRADE", marginMode != nothing);
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(hf, useSync), isMarginOrder))
        if functions.ccxtruthy(!functions.ccxtruthy(trigger))
            if functions.ccxtruthy(symbol == nothing)
                throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol parameter for hf orders")));
            end
            market = self.market(symbol);
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    response = nothing;
    params = omit(params, ["clientOid", "clientOrderId", "stop", "trigger", "tradeType"]);
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOid")] = clientOrderId;
        if functions.ccxtruthy(trigger)
            if functions.ccxtruthy(isMarginOrder)
                response = Base.fetch(self.privateDeleteHfMarginStopOrderCancelByClientOid(extend(request, params)));
                data = self.safeDict(response, "data");
                orderIds = self.safeList(data, "cancelledOrderIds", defaultValue = []);
                orderId = safeString(orderIds, 0);
                    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("id") => orderId
))
            else
                response = Base.fetch(self.privateDeleteStopOrderCancelOrderByClientOid(extend(request, params)));
            end
        elseif functions.ccxtruthy(isMarginOrder)
            response = Base.fetch(self.privateDeleteHfMarginOrdersClientOrderClientOid(extend(request, params)));
        else
            if functions.ccxtruthy(useSync)
                response = Base.fetch(self.privateDeleteHfOrdersSyncClientOrderClientOid(extend(request, params)));
            elseif functions.ccxtruthy(hf)
                response = Base.fetch(self.privateDeleteHfOrdersClientOrderClientOid(extend(request, params)));
            else
                response = Base.fetch(self.privateDeleteOrderClientOrderClientOid(extend(request, params)));
            end

        end
        response = self.safeDict(response, "data");
            return self.parseOrder(response)
    else
        request[Symbol("orderId")] = id;
        if functions.ccxtruthy(trigger)
            if functions.ccxtruthy(isMarginOrder)
                response = Base.fetch(self.privateDeleteHfMarginStopOrderCancelById(extend(request, params)));
            else
                response = Base.fetch(self.privateDeleteStopOrderOrderId(extend(request, params)));
            end
        elseif functions.ccxtruthy(isMarginOrder)
            response = Base.fetch(self.privateDeleteHfMarginOrdersOrderId(extend(request, params)));
        else
            if functions.ccxtruthy(useSync)
                response = Base.fetch(self.privateDeleteHfOrdersSyncOrderId(extend(request, params)));
            elseif functions.ccxtruthy(hf)
                response = Base.fetch(self.privateDeleteHfOrdersOrderId(extend(request, params)));
                response = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
                return self.parseOrder(response)
            else
                response = Base.fetch(self.privateDeleteOrdersOrderId(extend(request, params)));
            end

        end
        data = self.safeDict(response, "data");
        orderId = safeString(data, "orderId");
        orderIds = self.safeList(data, "cancelledOrderIds", defaultValue = []);
        orderId = safeString(orderIds, 0, orderId);
        return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("id") => orderId
))
    end

end
"""
helper method for cancelling contract orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-clientoid

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: cancel order by client order id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelContractOrder(self::Kucoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    clientOrderId = safeString2(params, "clientOid", "clientOrderId");
    params = omit(params, ["clientOrderId"]);
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(clientOrderId != nothing)
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument when cancelling by clientOrderId")));
        end
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        request[Symbol("clientOid")] = clientOrderId;
        response = Base.fetch(self.futuresPrivateDeleteOrdersClientOrderClientOid(extend(request, params)));
    else
        request[Symbol("orderId")] = id;
        response = Base.fetch(self.futuresPrivateDeleteOrdersOrderId(extend(request, params)));
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))

end
"""
helper method for cancelling uta orders
see: https://www.kucoin.com/docs-new/rest/ua/cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountMode`::string, optional: 'unified' or 'classic' (default is 'unified')
- `params.clientOrderId`::string, optional: client order id, required if id is not provided
- `params.marginMode`::string, optional: 'cross' or 'isolated', required if fetching a margin order (unified accountMode supports only cross margin)

# Returns
- Response from the exchange
"""
function cancelUtaOrder(self::Kucoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument for uta endpoint")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOid", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOid")] = clientOrderId;
        params = omit(params, ["clientOid", "clientOrderId"]);
    else
        if functions.ccxtruthy(id == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchOrder() requires an id argument or clientOrderId parameter")));
        end
        request[Symbol("orderId")] = id;
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    accountMode = "unified";
    (accountMode, params) = self.handleOptionAndParams(params, "cancelOrder", "accountMode", defaultValue = accountMode);
    request[Symbol("accountMode")] = accountMode;
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("cancelOrder", params = params);
    isUnified = (accountMode == "unified");
    tradeType = self.handleTradeType(isContractMarket = get(market, Symbol("contract"), nothing), marginMode = marginMode, isUnified = isUnified, params = params);
    request[Symbol("tradeType")] = tradeType;
    response = Base.fetch(self.utaPrivatePostAccountModeOrderCancel(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
"""
cancel all open orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders-by-symbol
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-cancel-stop-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-all-orders-by-symbol
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/batch-cancel-stop-orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-stop-orders
see: https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-symbol

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.marginMode`::string, optional: *spot only* 'cross' or 'isolated'
- `params.uta`::bool, optional: true for cancelling orders with unified account endpoint (default is false) Check cancelAllSpotOrders(), cancelAllContractOrders() and cancelAllUtaOrders() for more details on the extra parameters that can be used in params

# Returns
- Response from the exchange
"""
function cancelAllOrders(self::Kucoin; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "cancelAllOrders", "uta", defaultValue = uta);
    if functions.ccxtruthy(uta)
            return Base.fetch(self.cancelAllUtaOrders(symbol = symbol, params = params))
    end
    marketType = nothing;
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    (marketType, params) = self.handleMarketTypeAndParams("cancelAllOrders", market = market, params = params);
    if functions.ccxtruthy(@functions.ccxt_or((marketType == "spot"), (marketType == "margin")))
            return Base.fetch(self.cancelAllSpotOrders(symbol = symbol, params = params))
    else
        return Base.fetch(self.cancelAllContractOrders(symbol = symbol, params = params))
    end

end
"""
helper method for cancelling all spot orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders-by-symbol
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-cancel-stop-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-all-orders-by-symbol
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/batch-cancel-stop-orders

# Arguments
- `symbol`::string: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: *invalid for isolated margin* true if cancelling all stop orders
- `params.marginMode`::string, optional: 'cross' or 'isolated'
- `params.orderIds`::string, optional: *stop orders only* Comma separated order IDs
- `params.hf`::bool, optional: false, // true for hf order

# Returns
- Response from the exchange
"""
function cancelAllSpotOrders(self::Kucoin; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    trigger = self.safeBool2(params, "trigger", "stop", defaultValue = false);
    hf = nothing;
    (hf, params) = self.handleHfAndParams(params = params);
    params = omit(params, ["stop", "trigger"]);
    (marginMode, query) = self.handleMarginModeAndParams("cancelAllOrders", params = params);
    isMarginOrders = marginMode != nothing;
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = self.marketId(symbol);
    elseif functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(trigger), isMarginOrders))
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument for margin non-trigger orders")));
    end
    if functions.ccxtruthy(isMarginOrders)
        request[Symbol("tradeType")] = get(get(self.options, Symbol("marginModes"), nothing), Symbol(marginMode), nothing);
        if functions.ccxtruthy(@functions.ccxt_and(marginMode == "isolated", trigger))
            throw(BadRequest(string(self.id, " cancelAllOrders does not support isolated margin for stop orders")));
        end
    end
    response = nothing;
    if functions.ccxtruthy(trigger)
        if functions.ccxtruthy(isMarginOrders)
            response = Base.fetch(self.privateDeleteHfMarginStopOrderCancel(extend(request, query)));
        else
            response = Base.fetch(self.privateDeleteStopOrderCancel(extend(request, query)));
        end
    elseif functions.ccxtruthy(isMarginOrders)
        response = Base.fetch(self.privateDeleteHfMarginOrders(extend(request, query)));
    else
        if functions.ccxtruthy(hf)
            if functions.ccxtruthy(symbol == nothing)
                response = Base.fetch(self.privateDeleteHfOrdersCancelAll(extend(request, query)));
            else
                response = Base.fetch(self.privateDeleteHfOrders(extend(request, query)));
            end
        else
            response = Base.fetch(self.privateDeleteOrders(extend(request, query)));
        end

    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
"""
helper method for cancelling all contract orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-stop-orders

# Arguments
- `symbol`::string: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::object, optional: When true, all the trigger orders will be cancelled

# Returns
- Response from the exchange
"""
function cancelAllContractOrders(self::Kucoin; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbol != nothing)
        request[Symbol("symbol")] = self.marketId(symbol);
    end
    trigger = safeValue2(params, "stop", "trigger");
    params = omit(params, ["stop", "trigger"]);
    response = nothing;
    if functions.ccxtruthy(trigger)
        response = Base.fetch(self.futuresPrivateDeleteStopOrders(extend(request, params)));
    else
        response = Base.fetch(self.futuresPrivateDeleteOrders(extend(request, params)));
    end
    data = self.safeDict(response, "data");
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => data
))]

end
"""
helper method for cancelling all uta orders
see: https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-symbol

# Arguments
- `symbol`::string: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if cancelling all stop orders
- `params.marginMode`::string, optional: 'CROSS' or 'ISOLATED'

# Returns
- Response from the exchange
"""
function cancelAllUtaOrders(self::Kucoin; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument for uta endpoint")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isContract = get(market, Symbol("contract"), nothing);
    tradeType = functions.ccxtruthy(isContract) ? "FUTURES" : "SPOT";
    trigger = false;
    (trigger, params) = self.handleParamBool(params, "trigger", defaultValue = trigger);
    orderFilter = functions.ccxtruthy(trigger) ? "ADVANCED" : "NORMAL";
    request = Dict{Symbol, Any}(
        Symbol("accountMode") => "unified",
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("tradeType") => tradeType,
        Symbol("orderFilter") => orderFilter
    );
    response = Base.fetch(self.utaPrivatePostAccountModeOrderCancelAll(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(data, "items", defaultValue = []);
    return self.parseOrders(orders, market = market, since = nothing, limit = nothing, params = Dict{Symbol, Any}(
    Symbol("status") => "canceled"
))

end
"""
fetches a list of orders placed on the exchange
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
see: https://www.kucoin.com/docs-new/rest/ua/get-open-order-list
see: https://www.kucoin.com/docs-new/rest/ua/get-order-history

# Arguments
- `status`::string: 'active' or 'closed', only 'active' is valid for stop orders
- `symbol`::string: unified symbol for the market to retrieve orders from
- `since`::int, optional: timestamp in ms of the earliest order to retrieve
- `limit`::int, optional: The maximum number of orders to retrieve
- `params`::object, optional: exchange specific parameters
- `params.uta`::bool, optional: true for fetch orders with uta endpoint (default is false) Check fetchSpotOrdersByStatus(), fetchContractOrdersByStatus() and fetchUtaOrdersByStatus() for more details on the extra parameters that can be used in params

# Returns
- An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrdersByStatus(self::Kucoin, status; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchOrdersByStatus", "uta", defaultValue = uta);
    marketType = nothing;
    if functions.ccxtruthy(symbol == nothing)
        type_var = safeString(params, "type");
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(type_var == "spot", type_var == "margin"), type_var == "swap"), type_var == "future"), type_var == "contract"))
            marketType = type_var;
            params = omit(params, "type");
        else
            methodOptions = self.safeDict(self.options, "fetchOrdersByStatus", defaultValue = Dict{Symbol, Any}());
            methodDefaultType = safeString2(methodOptions, "defaultType", "type");
            if functions.ccxtruthy(methodDefaultType == nothing)
                marketType = safeString2(self.options, "defaultType", "type", "spot");
            else
                marketType = methodDefaultType;
            end
        end
    else
        market = self.market(symbol);
        marketType = get(market, Symbol("type"), nothing);
    end
    if functions.ccxtruthy(uta)
        params = omit(params, "uta");
        params = extend(params, Dict{Symbol, Any}(
    Symbol("marketType") => marketType
));
            return Base.fetch(self.fetchUtaOrdersByStatus(status, symbol = symbol, since = since, limit = limit, params = params))
    elseif functions.ccxtruthy(@functions.ccxt_or((marketType == "spot"), (marketType == "margin")))
        return Base.fetch(self.fetchSpotOrdersByStatus(status, symbol = symbol, since = since, limit = limit, params = params))
    else
        return Base.fetch(self.fetchContractOrdersByStatus(status, symbol = symbol, since = since, limit = limit, params = params))
    end

end
"""
fetch a list of spot orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list

# Arguments
- `status`::string: *not used for stop orders* 'open' or 'closed'
- `symbol`::string: unified market symbol
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: max number of orders to return
- `params`::object, optional: exchange specific params
- `params.until`::int, optional: end time in ms
- `params.side`::string, optional: buy or sell
- `params.type`::string, optional: limit, market, limit_stop or market_stop
- `params.tradeType`::string, optional: TRADE for spot trading, MARGIN_TRADE or MARGIN_ISOLATED_TRADE for Margin Trading
- `params.currentPage`::int, optional: *trigger orders only* current page
- `params.orderIds`::string, optional: *trigger orders only* comma separated order ID list
- `params.trigger`::bool, optional: True if fetching a trigger order
- `params.hf`::bool, optional: false, // true for hf order
- `params.marginMode`::string, optional: 'cross' or 'isolated', only for margin orders

# Returns
- An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchSpotOrdersByStatus(self::Kucoin, status; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    lowercaseStatus = lowercase(status);
    until = safeInteger(params, "until");
    trigger = self.safeBool2(params, "stop", "trigger", defaultValue = false);
    hf = nothing;
    (hf, params) = self.handleHfAndParams(params = params);
    if functions.ccxtruthy(@functions.ccxt_and(hf, (symbol == nothing)))
        throw(ArgumentsRequired(string(self.id, " fetchOrdersByStatus() requires a symbol parameter for hf orders")));
    end
    params = omit(params, ["stop", "trigger", "till", "until"]);
    (marginMode, query) = self.handleMarginModeAndParams("fetchOrdersByStatus", params = params);
    isMarginOrder = marginMode != nothing;
    if functions.ccxtruthy(lowercaseStatus == "open")
        lowercaseStatus = "active";
    elseif functions.ccxtruthy(lowercaseStatus == "closed")
        lowercaseStatus = "done";
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    request[Symbol("tradeType")] = safeString(get(self.options, Symbol("marginModes"), nothing), marginMode, "TRADE");
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(isMarginOrder, lowercaseStatus == "active"), (!functions.ccxtruthy(trigger))))
        response = Base.fetch(self.privateGetHfMarginOrdersActive(extend(request, query)));
    else
        if functions.ccxtruthy(!functions.ccxtruthy(isMarginOrder))
            request[Symbol("status")] = lowercaseStatus;
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startAt")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("pageSize")] = limit;
        end
        if functions.ccxtruthy(until)
            request[Symbol("endAt")] = until;
        end
        if functions.ccxtruthy(trigger)
            if functions.ccxtruthy(isMarginOrder)
                response = Base.fetch(self.privateGetHfMarginStopOrders(extend(request, query)));
            else
                response = Base.fetch(self.privateGetStopOrder(extend(request, query)));
            end
        elseif functions.ccxtruthy(isMarginOrder)
            response = Base.fetch(self.privateGetHfMarginOrdersDone(extend(request, query)));
        else
            if functions.ccxtruthy(hf)
                if functions.ccxtruthy(lowercaseStatus == "active")
                    response = Base.fetch(self.privateGetHfOrdersActive(extend(request, query)));
                elseif functions.ccxtruthy(lowercaseStatus == "done")
                    response = Base.fetch(self.privateGetHfOrdersDone(extend(request, query)));
                end
            else
                response = Base.fetch(self.privateGetOrders(extend(request, query)));
            end

        end
    end
    listData = self.safeList(response, "data");
    if functions.ccxtruthy(listData != nothing)
            return self.parseOrders(listData, market = market, since = since, limit = limit)
    end
    responseData = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(responseData, "items", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetches a list of contract orders placed on the exchange
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list

# Arguments
- `status`::string: 'active' or 'closed', only 'active' is valid for stop orders
- `symbol`::string: unified symbol for the market to retrieve orders from
- `since`::int, optional: timestamp in ms of the earliest order to retrieve
- `limit`::int, optional: The maximum number of orders to retrieve
- `params`::object, optional: exchange specific parameters
- `params.trigger`::bool, optional: set to true to retrieve untriggered stop orders
- `params.until`::int, optional: End time in ms
- `params.side`::string, optional: buy or sell
- `params.type`::string, optional: limit or market
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchContractOrdersByStatus(self::Kucoin, status; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrdersByStatus", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOrdersByStatus", symbol = symbol, since = since, limit = limit, params = params))
    end
    trigger = self.safeBool2(params, "stop", "trigger");
    until = safeInteger(params, "until");
    params = omit(params, ["stop", "until", "trigger"]);
    if functions.ccxtruthy(status == "closed")
        status = "done";
    elseif functions.ccxtruthy(status == "open")
        status = "active";
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(!functions.ccxtruthy(trigger))
        request[Symbol("status")] = status;
    elseif functions.ccxtruthy(status != "active")
        throw(BadRequest(string(self.id, " fetchOrdersByStatus() can only fetch untriggered stop orders")));
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = since;
    end
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endAt")] = until;
    end
    response = nothing;
    if functions.ccxtruthy(trigger)
        response = Base.fetch(self.futuresPrivateGetStopOrders(extend(request, params)));
    else
        response = Base.fetch(self.futuresPrivateGetOrders(extend(request, params)));
    end
    responseData = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(responseData, "items", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
helper method for fetching orders by status with uta endpoint
see: https://www.kucoin.com/docs-new/rest/ua/get-open-order-list
see: https://www.kucoin.com/docs-new/rest/ua/get-order-history

# Arguments
- `status`::string: 'active' or 'closed', only 'active' is valid for stop orders
- `symbol`::string: unified symbol for the market to retrieve orders from
- `since`::int, optional: timestamp in ms of the earliest order to retrieve
- `limit`::int, optional: The maximum number of orders to retrieve
- `params`::object, optional: exchange specific parameters
- `params.until`::int, optional: End time in ms
- `params.side`::string, optional: *closed orders only* 'BUY' or 'SELL'
- `params.accountMode`::string, optional: 'unified' or 'classic' (default is unified)
- `params.marginMode`::string, optional: 'cross' or 'isolated', only for margin orders (unified accountMode supports only cross margin)
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchUtaOrdersByStatus(self::Kucoin, status; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    maxLimit = 200;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrdersByStatus", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOrdersByStatus", symbol = symbol, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    accountMode = "unified";
    (accountMode, params) = self.handleOptionAndParams(params, "fetchUtaOrdersByStatus", "accountMode", defaultValue = accountMode);
    request = Dict{Symbol, Any}(
        Symbol("accountMode") => accountMode
    );
    marketType = nothing;
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        marketType = get(market, Symbol("type"), nothing);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    else
        marketType = safeString(params, "marketType");
    end
    params = omit(params, "marketType");
    isContract = @functions.ccxt_and((marketType != "spot"), (marketType != "margin"));
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isContract), (symbol == nothing)))
        throw(ArgumentsRequired(string(self.id, " fetchOrdersByStatus() requires a symbol argument for spot and margin markets when using uta endpoint")));
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOrdersByStatus", params = params);
    isUnified = (accountMode == "unified");
    tradeType = self.handleTradeType(isContractMarket = isContract, marginMode = marginMode, isUnified = isUnified, params = params);
    params[Symbol("tradeType")] = tradeType;
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = since;
    end
    (request, params) = self.handleUntilOption("endAt", request, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    lowercaseStatus = lowercase(status);
    if functions.ccxtruthy(lowercaseStatus == "open")
        lowercaseStatus = "active";
    elseif functions.ccxtruthy(lowercaseStatus == "closed")
        lowercaseStatus = "done";
    end
    response = nothing;
    if functions.ccxtruthy(lowercaseStatus == "active")
        response = Base.fetch(self.utaPrivateGetAccountModeOrderOpenList(extend(request, params)));
    else
        response = Base.fetch(self.utaPrivateGetAccountModeOrderHistory(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    orders = self.safeList(data, "items", defaultValue = []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetches information on multiple closed orders made by the user
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/ua/get-order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in ms
- `params.side`::string, optional: buy or sell
- `params.type`::string, optional: limit, market, limit_stop or market_stop
- `params.tradeType`::string, optional: TRADE for spot trading, MARGIN_TRADE for Margin Trading
- `params.trigger`::bool, optional: True if fetching a trigger order
- `params.hf`::bool, optional: false, // true for hf order
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchClosedOrders(self::Kucoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchClosedOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchClosedOrders", symbol = symbol, since = since, limit = limit, params = params))
    end
    return Base.fetch(self.fetchOrdersByStatus("done", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetch all unfilled currently open orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
see: https://www.kucoin.com/docs-new/rest/ua/get-open-order-list

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in ms
- `params.trigger`::bool, optional: true if fetching trigger orders
- `params.side`::string, optional: buy or sell
- `params.type`::string, optional: limit, market, limit_stop or market_stop
- `params.tradeType`::string, optional: TRADE for spot trading, MARGIN_TRADE for Margin Trading
- `params.currentPage`::int, optional: *trigger orders only* current page
- `params.orderIds`::string, optional: *trigger orders only* comma separated order ID list
- `params.hf`::bool, optional: false, // true for hf order
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Kucoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchOpenOrders", symbol = symbol, since = since, limit = limit, params = params))
    end
    return Base.fetch(self.fetchOrdersByStatus("active", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on an order made by the user
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/get-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/futures-trading/get-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/ua/get-order-details

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.uta`::bool, optional: true if fetching an order with uta endpoint (default is false) Check fetchSpotOrder(), fetchContractOrder() and fetchUtaOrder() for more details on the extra parameters that can be used in params

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Kucoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(id == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires an id argument")));
    end
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchOrder", "uta", defaultValue = uta);
    if functions.ccxtruthy(uta)
        params = omit(params, "uta");
            return Base.fetch(self.fetchUtaOrder(id, symbol = symbol, params = params))
    end
    marketType = nothing;
    if functions.ccxtruthy(symbol == nothing)
        (marketType, params) = self.handleMarketTypeAndParams("fetchOrder", market = nothing, params = params);
    else
        market = self.market(symbol);
        marketType = get(market, Symbol("type"), nothing);
    end
    if functions.ccxtruthy(@functions.ccxt_or((marketType == "spot"), (marketType == "margin")))
            return Base.fetch(self.fetchSpotOrder(id, symbol = symbol, params = params))
    else
        return Base.fetch(self.fetchContractOrder(id, symbol = symbol, params = params))
    end

end
"""
fetch a spot order
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/get-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-clientoid

# Arguments
- `id`::string: Order id
- `symbol`::string: not sent to exchange except for trigger orders with clientOid, but used internally by CCXT to filter
- `params`::object, optional: exchange specific parameters
- `params.trigger`::bool, optional: true if fetching a trigger order
- `params.hf`::bool, optional: false, // true for hf order
- `params.clientOid`::bool, optional: unique order id created by users to identify their orders
- `params.marginMode`::object, optional: 'cross' or 'isolated'

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchSpotOrder(self::Kucoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOid", "clientOrderId");
    trigger = self.safeBool2(params, "stop", "trigger", defaultValue = false);
    hf = nothing;
    (hf, params) = self.handleHfAndParams(params = params);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOrder", params = params);
    isMarginOrder = marginMode != nothing;
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    if functions.ccxtruthy(@functions.ccxt_or(hf, isMarginOrder))
        if functions.ccxtruthy(!functions.ccxtruthy(trigger))
            if functions.ccxtruthy(symbol == nothing)
                throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol parameter for hf and margin orders")));
            end
            request[Symbol("symbol")] = safeString(market, "id");
        end
    end
    params = omit(params, ["stop", "clientOid", "clientOrderId", "trigger"]);
    response = nothing;
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOid")] = clientOrderId;
        if functions.ccxtruthy(trigger)
            if functions.ccxtruthy(isMarginOrder)
                response = Base.fetch(self.privateGetHfMarginStopOrderClientOid(extend(request, params)));
            else
                if functions.ccxtruthy(symbol != nothing)
                    request[Symbol("symbol")] = safeString(market, "id");
                end
                response = Base.fetch(self.privateGetStopOrderQueryOrderByClientOid(extend(request, params)));
            end
        elseif functions.ccxtruthy(isMarginOrder)
            response = Base.fetch(self.privateGetHfMarginOrdersClientOrderClientOid(extend(request, params)));
        else
            if functions.ccxtruthy(hf)
                response = Base.fetch(self.privateGetHfOrdersClientOrderClientOid(extend(request, params)));
            else
                response = Base.fetch(self.privateGetOrderClientOrderClientOid(extend(request, params)));
            end

        end
    else
        if functions.ccxtruthy(id == nothing)
            throw(InvalidOrder(string(self.id, " fetchOrder() requires an order id")));
        end
        request[Symbol("orderId")] = id;
        if functions.ccxtruthy(trigger)
            if functions.ccxtruthy(isMarginOrder)
                response = Base.fetch(self.privateGetHfMarginStopOrderOrderId(extend(request, params)));
            else
                response = Base.fetch(self.privateGetStopOrderOrderId(extend(request, params)));
            end
        elseif functions.ccxtruthy(isMarginOrder)
            response = Base.fetch(self.privateGetHfMarginOrdersOrderId(extend(request, params)));
        else
            if functions.ccxtruthy(hf)
                response = Base.fetch(self.privateGetHfOrdersOrderId(extend(request, params)));
            else
                response = Base.fetch(self.privateGetOrdersOrderId(extend(request, params)));
            end

        end
    end
    responseData = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    if functions.ccxtruthy(functions.ccxt_isArray(responseData))
        responseData = safeValue(responseData, 0);
    end
    return self.parseOrder(responseData, market = market)

end
"""
fetc contract order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/futures-trading/get-stop-order-by-clientoid

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchContractOrder(self::Kucoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    response = nothing;
    clientOrderId = safeString2(params, "clientOid", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOid")] = clientOrderId;
        params = omit(params, ["clientOid", "clientOrderId"]);
        response = Base.fetch(self.futuresPrivateGetOrdersByClientOid(extend(request, params)));
    else
        if functions.ccxtruthy(id == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchOrder() requires an order id argument or clientOrderId in params")));
        end
        request[Symbol("orderId")] = id;
        response = Base.fetch(self.futuresPrivateGetOrdersOrderId(extend(request, params)));
    end
    market = functions.ccxtruthy((symbol != nothing)) ? self.market(symbol) : nothing;
    responseData = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(responseData, market = market)

end
"""
fetch uta order
see: https://www.kucoin.com/docs-new/rest/ua/get-order-details

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountMode`::string, optional: 'unified' or 'classic' (default is 'unified')
- `params.clientOrderId`::string, optional: client order id, required if id is not provided
- `params.marginMode`::string, optional: 'cross' or 'isolated', required if fetching a margin order (unified accountMode supports only cross margin)

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchUtaOrder(self::Kucoin, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument for uta orders")));
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeString2(params, "clientOid", "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("clientOid")] = clientOrderId;
        params = omit(params, ["clientOid", "clientOrderId"]);
    else
        if functions.ccxtruthy(id == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchOrder() requires an id argument or clientOrderId parameter")));
        end
        request[Symbol("orderId")] = id;
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    accountMode = "unified";
    (accountMode, params) = self.handleOptionAndParams(params, "fetchOrder", "accountMode", defaultValue = accountMode);
    request[Symbol("accountMode")] = accountMode;
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchOrder", params = params);
    isUnified = (accountMode == "unified");
    tradeType = self.handleTradeType(isContractMarket = get(market, Symbol("contract"), nothing), marginMode = marginMode, isUnified = isUnified, params = params);
    request[Symbol("tradeType")] = tradeType;
    response = Base.fetch(self.utaPrivateGetAccountModeOrderDetail(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(data, market = market)

end
function handleTradeType(self::Kucoin; isContractMarket=false, marginMode=nothing, isUnified=false, params=Dict())
    tradeType = safeString(params, "tradeType");
    if functions.ccxtruthy(tradeType == nothing)
        if functions.ccxtruthy(isContractMarket)
            tradeType = "FUTURES";
        elseif functions.ccxtruthy(marginMode != nothing)
            tradeType = uppercase(marginMode);
            if functions.ccxtruthy(isUnified)
                if functions.ccxtruthy(tradeType == "ISOLATED")
                    throw(NotSupported(string(self.id, " spot isolated margin is not supported for unified accountMode")));
                else
                    tradeType = "MARGIN";
                end
            end
        else
            tradeType = "SPOT";
        end
    end
    return tradeType

end
function parseOrder(self::Kucoin, order; market=nothing)
    tradeType = safeString(order, "tradeType");
    utaTradeTypes = ["SPOT", "CROSS", "ISOLATED", "FUTURES"];
    isUtaOrder = inArray(tradeType, utaTradeTypes);
    if functions.ccxtruthy(ccxt_in("sizeUnit", order))
        isUtaOrder = true;
    end
    if functions.ccxtruthy(isUtaOrder)
            return self.parseUtaOrder(order, market = market)
    end
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    if functions.ccxtruthy(@functions.ccxt_and((market != nothing), (get(market, Symbol("contract"), nothing))))
            return self.parseContractOrder(order, market = market)
    else
        return self.parseSpotOrder(order, market = market)
    end

end
function parseContractOrder(self::Kucoin, order; market=nothing)
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    orderId = safeString2(order, "id", "orderId");
    type_var = safeString(order, "type");
    timestamp = safeInteger(order, "createdAt");
    datetime = self.iso8601(timestamp);
    price = safeString(order, "price");
    side = safeString(order, "side");
    feeCurrencyId = safeString(order, "feeCurrency");
    feeCurrency = self.safeCurrencyCode(feeCurrencyId);
    feeCost = self.safeNumber(order, "fee");
    amount = safeString(order, "size");
    filled = safeString(order, "filledSize");
    cost = safeString(order, "filledValue");
    average = safeString(order, "avgDealPrice");
    if functions.ccxtruthy(@functions.ccxt_and((average == nothing), stringGt(filled, "0")))
        contractSize = safeString(market, "contractSize");
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            average = stringDiv(cost, stringMul(contractSize, filled));
        else
            average = stringDiv(stringMul(contractSize, filled), cost);
        end
    end
    isActive = safeValue(order, "isActive");
    cancelExist = self.safeBool(order, "cancelExist", defaultValue = false);
    status = nothing;
    if functions.ccxtruthy(isActive != nothing)
        status = functions.ccxtruthy(isActive) ? "open" : "closed";
    end
    status = functions.ccxtruthy(cancelExist) ? "canceled" : status;
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => feeCurrency,
            Symbol("cost") => feeCost
        );
    end
    clientOrderId = safeString(order, "clientOid");
    timeInForce = safeString(order, "timeInForce");
    postOnly = safeValue(order, "postOnly");
    reduceOnly = safeValue(order, "reduceOnly");
    lastUpdateTimestamp = safeInteger(order, "updatedAt");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => orderId,
    Symbol("clientOrderId") => clientOrderId,
    Symbol("symbol") => symbol,
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("reduceOnly") => reduceOnly,
    Symbol("side") => side,
    Symbol("amount") => amount,
    Symbol("price") => price,
    Symbol("triggerPrice") => self.safeNumber(order, "stopPrice"),
    Symbol("cost") => cost,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("fee") => fee,
    Symbol("status") => status,
    Symbol("info") => order,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("average") => average,
    Symbol("trades") => nothing
), market = market)

end
function parseSpotOrder(self::Kucoin, order; market=nothing)
    marketId = safeString(order, "symbol");
    timestamp = safeInteger(order, "createdAt");
    feeCurrencyId = safeString(order, "feeCurrency");
    cancelExist = self.safeBool(order, "cancelExist", defaultValue = false);
    responseStop = safeString(order, "stop");
    trigger = responseStop != nothing;
    stopTriggered = self.safeBool(order, "stopTriggered", defaultValue = false);
    isActive = self.safeBool2(order, "isActive", "active");
    responseStatus = safeString(order, "status");
    status = nothing;
    if functions.ccxtruthy(isActive != nothing)
        if functions.ccxtruthy(isActive)
            status = "open";
        else
            status = "closed";
        end
    end
    if functions.ccxtruthy(trigger)
        if functions.ccxtruthy(responseStatus == "NEW")
            status = "open";
        elseif functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isActive), !functions.ccxtruthy(stopTriggered)))
            status = "cancelled";
        end
    end
    if functions.ccxtruthy(cancelExist)
        status = "canceled";
    end
    if functions.ccxtruthy(responseStatus == "fail")
        status = "rejected";
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeStringN(order, ["id", "orderId", "newOrderId", "cancelledOrderId"]),
    Symbol("clientOrderId") => safeString(order, "clientOid"),
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = "-"),
    Symbol("type") => safeString(order, "type"),
    Symbol("timeInForce") => safeString(order, "timeInForce"),
    Symbol("postOnly") => self.safeBool(order, "postOnly"),
    Symbol("side") => safeString(order, "side"),
    Symbol("amount") => safeString(order, "size"),
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => self.safeNumber(order, "stopPrice"),
    Symbol("cost") => safeString(order, "dealFunds"),
    Symbol("filled") => safeString(order, "dealSize"),
    Symbol("remaining") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => self.safeCurrencyCode(feeCurrencyId),
        Symbol("cost") => self.safeNumber(order, "fee")
    ),
    Symbol("status") => status,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("average") => safeString(order, "avgDealPrice"),
    Symbol("trades") => nothing
), market = market)

end
function parseUtaOrder(self::Kucoin, order; market=nothing)
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeIntegerProduct2(order, "orderTime", "ts", 0.000001);
    lastUpdateTimestamp = safeIntegerProduct(order, "updatedTime", 0.000001);
    rawTimeInForce = safeString(order, "timeInForce");
    amount = nothing;
    cost = nothing;
    sizeUnit = safeString(order, "sizeUnit");
    size_var = safeString(order, "size");
    rawStatus = safeString(order, "status");
    average = safeString(order, "avgPrice");
    filled = safeString(order, "filledSize");
    if functions.ccxtruthy(@functions.ccxt_or((sizeUnit == "BASECCY"), (sizeUnit == "UNIT")))
        amount = size_var;
    else
        cost = filled;
        filled = stringDiv(filled, average);
        filled = self.amountToPrecision(symbol, filled);
    end
    fee = Dict{Symbol, Any}(
        Symbol("currency") => self.safeCurrencyCode(safeString(order, "feeCurrency")),
        Symbol("cost") => safeString(order, "fee")
    );
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(order, "orderId"),
    Symbol("clientOrderId") => safeString(order, "clientOid"),
    Symbol("symbol") => symbol,
    Symbol("type") => safeStringLower(order, "orderType"),
    Symbol("timeInForce") => self.parseOrderTimeInForce(rawTimeInForce),
    Symbol("postOnly") => self.safeBool(order, "postOnly"),
    Symbol("reduceOnly") => self.safeBool(order, "reduceOnly"),
    Symbol("side") => safeStringLower(order, "side"),
    Symbol("amount") => amount,
    Symbol("price") => safeString(order, "price"),
    Symbol("triggerPrice") => safeString2(order, "stopPrice", "triggerPrice"),
    Symbol("cost") => cost,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fee") => fee,
    Symbol("status") => self.parseOrderStatus(rawStatus),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("average") => average,
    Symbol("trades") => nothing,
    Symbol("stopLossPrice") => safeString(order, "slTriggerPrice"),
    Symbol("takeProfitPrice") => safeString(order, "tpTriggerPrice"),
    Symbol("info") => order
), market = market)

end
function parseOrderTimeInForce(self::Kucoin, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("GTC") => "GTC",
        Symbol("IOC") => "IOC",
        Symbol("FOK") => "FOK",
        Symbol("GTT") => "GTD"
    );
    if functions.ccxtruthy(timeInForce == nothing)
            return nothing
    end
    return safeString(timeInForces, timeInForce, timeInForce)

end
function parseOrderStatus(self::Kucoin, status)
    statuses = Dict{Symbol, Any}(
        Symbol("0") => "open",
        Symbol("1") => "open",
        Symbol("2") => "open",
        Symbol("3") => "closed",
        Symbol("4") => "open",
        Symbol("5") => "canceled",
        Symbol("6") => "closed"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
"""
fetch all the trades made from a single order
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/ua/get-trade-history

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.uta`::bool, optional: set to true if fetching trades from uta endpoint, default is false.

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchOrderTrades(self::Kucoin, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    return Base.fetch(self.fetchMyTrades(symbol = symbol, since = since, limit = limit, params = extend(request, params)))

end
"""
fetch all trades made by the user
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/ua/get-trade-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot') Check fetchMySpotTrades() and fetchMyContractTrades() for more details on the extra parameters that can be used in params

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyTrades(self::Kucoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marketType = nothing;
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    (marketType, params) = self.handleMarketTypeAndParams("fetchMyTrades", market = market, params = params);
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchMyTrades", "uta", defaultValue = uta);
    if functions.ccxtruthy(uta)
        params = extend(params, Dict{Symbol, Any}(
    Symbol("marketType") => marketType
));
            return Base.fetch(self.fetchMyUtaTrades(symbol = symbol, since = since, limit = limit, params = params))
    end
    if functions.ccxtruthy(@functions.ccxt_or((marketType == "spot"), (marketType == "margin")))
            return Base.fetch(self.fetchMySpotTrades(symbol = symbol, since = since, limit = limit, params = params))
    else
        return Base.fetch(self.fetchMyContractTrades(symbol = symbol, since = since, limit = limit, params = params))
    end

end
"""
fetch all spot trades made by the user
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.hf`::bool, optional: false, // true for hf order
- `params.marginMode`::string, optional: 'cross' or 'isolated', only for margin trades
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMySpotTrades(self::Kucoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params))
    end
    request = Dict{Symbol, Any}();
    hf = nothing;
    (hf, params) = self.handleHfAndParams(params = params);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params = params);
    isMargin = marginMode != nothing;
    if functions.ccxtruthy(isMargin)
        hf = true;
        request[Symbol("tradeType")] = functions.ccxtruthy((marginMode == nothing)) ? nothing : safeString(get(self.options, Symbol("marginModes"), nothing), marginMode, marginMode);
    end
    if functions.ccxtruthy(@functions.ccxt_and(hf, symbol == nothing))
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol parameter for hf or margin orders")));
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    method = get(self.options, Symbol("fetchMyTradesMethod"), nothing);
    parseResponseData = false;
    response = nothing;
    (request, params) = self.handleUntilOption("endAt", request, params);
    if functions.ccxtruthy(hf)
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startAt")] = since;
        end
        if functions.ccxtruthy(isMargin)
            response = Base.fetch(self.privateGetHfMarginFills(extend(request, params)));
        else
            response = Base.fetch(self.privateGetHfFills(extend(request, params)));
        end
    elseif functions.ccxtruthy(method == "private_get_fills")
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startAt")] = since;
        end
        response = Base.fetch(self.privateGetFills(extend(request, params)));
    else
        if functions.ccxtruthy(method == "private_get_limit_fills")
            parseResponseData = true;
            response = Base.fetch(self.privateGetLimitFills(extend(request, params)));
        else
            throw(ExchangeError(string(self.id, " fetchMyTradesMethod() invalid method")));
        end

    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    trades = nothing;
    if functions.ccxtruthy(parseResponseData)
        trades = data;
    else
        trades = self.safeList(data, "items", defaultValue = []);
    end
    tradesList = [];
    if functions.ccxtruthy(trades != nothing)
        tradesList = toArray(trades);
    end
    return self.parseTrades(tradesList, market = market, since = since, limit = limit)

end
"""
fetch all contract trades made by the user
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-trade-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: End time in ms
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyContractTrades(self::Kucoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = min(1000, limit);
    end
    (request, params) = self.handleUntilOption("endAt", request, params);
    response = Base.fetch(self.futuresPrivateGetFills(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    trades = self.safeList(data, "items", defaultValue = []);
    tradesList = [];
    if functions.ccxtruthy(trades != nothing)
        tradesList = trades;
    end
    return self.parseTrades(tradesList, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://www.kucoin.com/docs-new/rest/ua/get-trade-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve (default is 50, max is 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.accountMode`::string, optional: 'unified' or 'classic', defaults to 'unified'
- `params.marginMode`::string, optional: 'cross' or 'isolated', only for margin trades (unified accountMode support only cross margin)
- `params.side`::string, optional: 'BUY' or 'SELL' (both if not provided)
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
function fetchMyUtaTrades(self::Kucoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchMyTrades", symbol = symbol, since = since, limit = limit, params = params))
    end
    marketType = safeString(params, "marketType");
    if functions.ccxtruthy(marketType != nothing)
        params = omit(params, "marketType");
    end
    request = Dict{Symbol, Any}();
    isContract = false;
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        isContract = get(market, Symbol("contract"), nothing);
    elseif functions.ccxtruthy(@functions.ccxt_or((marketType == "spot"), (marketType == "margin")))
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol parameter for uta spot or margin trades")));
    else
        isContract = true;
    end
    accountMode = "unified";
    (accountMode, params) = self.handleOptionAndParams(params, "fetchMyTrades", "accountMode", defaultValue = accountMode);
    request[Symbol("accountMode")] = accountMode;
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params = params);
    isUnified = (accountMode == "unified");
    tradeType = self.handleTradeType(isContractMarket = isContract, marginMode = marginMode, isUnified = isUnified, params = params);
    request[Symbol("tradeType")] = tradeType;
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    (request, params) = self.handleUntilOption("endAt", request, params);
    response = Base.fetch(self.utaPrivateGetAccountModeOrderExecution(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    trades = self.safeList(data, "items", defaultValue = []);
    tradesList = [];
    if functions.ccxtruthy(trades != nothing)
        tradesList = trades;
    end
    return self.parseTrades(tradesList, market = market, since = since, limit = limit)

end
"""
get the list of most recent trades for a particular symbol
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-trade-history
see: https://www.kucoin.com/docs-new/rest/ua/get-trades
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-trade-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Kucoin, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    uta = false;
    (uta, params) = self.handleOptionAndParams(params, "fetchTrades", "uta", defaultValue = uta);
    response = nothing;
    trades = nothing;
    type_var = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTrades", market = market, params = params);
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(@functions.ccxt_or((type_var == "spot"), (type_var == "margin")))
            request[Symbol("tradeType")] = "SPOT";
        else
            request[Symbol("tradeType")] = "FUTURES";
        end
        response = Base.fetch(self.utaGetMarketTrade(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        trades = self.safeList(data, "list", defaultValue = []);
    elseif functions.ccxtruthy(@functions.ccxt_or((type_var == "spot"), (type_var == "margin")))
        response = Base.fetch(self.publicGetMarketHistories(extend(request, params)));
        trades = self.safeList(response, "data", defaultValue = []);
    else
        response = Base.fetch(self.futuresPublicGetTradeHistory(extend(request, params)));
        trades = self.safeList(response, "data", defaultValue = []);
    end
    tradesList = [];
    if functions.ccxtruthy(trades != nothing)
        tradesList = trades;
    end
    return self.parseTrades(tradesList, market = market, since = since, limit = limit)

end
function parseTrade(self::Kucoin, trade; market=nothing)
    if functions.ccxtruthy(ccxt_in("liquidityRole", trade))
            return self.parseMyUtaTrade(trade, market = market)
    end
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    if functions.ccxtruthy(@functions.ccxt_or((market == nothing), (get(market, Symbol("spot"), nothing))))
            return self.parseSpotOrUtaTrade(trade, market = market)
    else
        return self.parseContractTrade(trade, market = market)
    end

end
function parseSpotOrUtaTrade(self::Kucoin, trade; market=nothing)
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    id = safeString2(trade, "tradeId", "id");
    orderId = safeString(trade, "orderId");
    takerOrMaker = safeString(trade, "liquidity");
    timestamp = safeInteger2(trade, "time", "ts");
    if functions.ccxtruthy(timestamp != nothing)
        timestamp = self.parseToInt(timestamp / 1000000);
    else
        timestamp = safeInteger(trade, "createdAt");
        if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("dealValue", trade)), (timestamp != nothing)))
            timestamp = timestamp * 1000;
        end
    end
    priceString = safeString2(trade, "price", "dealPrice");
    amountString = safeString2(trade, "size", "amount");
    side = safeString(trade, "side");
    fee = nothing;
    feeCostString = safeString(trade, "fee");
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyId = safeString(trade, "feeCurrency");
        feeCurrency = self.safeCurrencyCode(feeCurrencyId);
        if functions.ccxtruthy(feeCurrency == nothing)
            feeCurrency = functions.ccxtruthy((side == "sell")) ? get(market, Symbol("quote"), nothing) : get(market, Symbol("base"), nothing);
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrency,
            Symbol("rate") => safeString(trade, "feeRate")
        );
    end
    type_var = safeString(trade, "type");
    if functions.ccxtruthy(type_var == "match")
        type_var = nothing;
    end
    costString = safeString2(trade, "funds", "dealValue");
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market = market)

end
function parseContractTrade(self::Kucoin, trade; market=nothing)
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "-");
    id = safeString2(trade, "tradeId", "id");
    orderId = safeString(trade, "orderId");
    takerOrMaker = safeString(trade, "liquidity");
    timestamp = safeInteger(trade, "ts");
    if functions.ccxtruthy(timestamp != nothing)
        timestamp = self.parseToInt(timestamp / 1000000);
    else
        timestamp = safeInteger(trade, "createdAt");
        if functions.ccxtruthy(@functions.ccxt_and((ccxt_in("dealValue", trade)), (timestamp != nothing)))
            timestamp = timestamp * 1000;
        end
    end
    priceString = safeString2(trade, "price", "dealPrice");
    amountString = safeString2(trade, "size", "amount");
    side = safeString(trade, "side");
    fee = nothing;
    feeCostString = safeString(trade, "fee");
    if functions.ccxtruthy(feeCostString != nothing)
        feeCurrencyId = safeString(trade, "feeCurrency");
        feeCurrency = self.safeCurrencyCode(feeCurrencyId);
        if functions.ccxtruthy(feeCurrency == nothing)
            feeCurrency = functions.ccxtruthy((side == "sell")) ? get(market, Symbol("quote"), nothing) : get(market, Symbol("base"), nothing);
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCostString,
            Symbol("currency") => feeCurrency,
            Symbol("rate") => safeString(trade, "feeRate")
        );
    end
    type_var = safeString2(trade, "type", "orderType");
    if functions.ccxtruthy(type_var == "match")
        type_var = nothing;
    end
    costString = safeString2(trade, "funds", "value");
    if functions.ccxtruthy(costString == nothing)
        contractSize = safeString(market, "contractSize");
        contractCost = stringMul(priceString, amountString);
        costString = stringMul(contractCost, contractSize);
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => id,
    Symbol("order") => orderId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("side") => side,
    Symbol("price") => priceString,
    Symbol("amount") => amountString,
    Symbol("cost") => costString,
    Symbol("fee") => fee
), market = market)

end
function parseMyUtaTrade(self::Kucoin, trade; market=nothing)
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeIntegerProduct(trade, "executionTime", 0.000001);
    fee = Dict{Symbol, Any}(
        Symbol("cost") => safeString(trade, "fee"),
        Symbol("currency") => self.safeCurrencyCode(safeString(trade, "feeCurrency"))
    );
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString(trade, "tradeId"),
    Symbol("order") => safeString(trade, "orderId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => safeStringLower(trade, "orderType"),
    Symbol("takerOrMaker") => safeStringLower(trade, "liquidityRole"),
    Symbol("side") => safeStringLower(trade, "side"),
    Symbol("price") => safeString(trade, "price"),
    Symbol("amount") => safeString(trade, "size"),
    Symbol("cost") => safeString(trade, "value"),
    Symbol("fee") => fee
), market = market)

end
"""
fetch the trading fees for a market
see: https://www.kucoin.com/docs-new/rest/account-info/trade-fee/get-actual-fee-spot-margin
see: https://www.kucoin.com/docs-new/rest/account-info/trade-fee/get-actual-fee-futures
see: https://www.kucoin.com/docs-new/rest/ua/get-actual-fee

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Kucoin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchTradingFee", "uta", defaultValue = uta);
    request = Dict{Symbol, Any}();
    response = nothing;
    entry = nothing;
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            request[Symbol("tradeType")] = "SPOT";
        else
            request[Symbol("tradeType")] = "FUTURES";
        end
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.utaPrivateGetUserFeeRate(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        dataList = self.safeList(data, "list", defaultValue = []);
        entry = self.safeDict(dataList, 0);
    elseif functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        request[Symbol("symbols")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privateGetTradeFees(extend(request, params)));
        data = self.safeList(response, "data", defaultValue = []);
        entry = self.safeDict(data, 0);
    else
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.futuresPrivateGetTradeFees(extend(request, params)));
        entry = self.safeDict(response, "data");
    end
    marketId = safeString(entry, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("maker") => self.safeNumber(entry, "makerFeeRate"),
    Symbol("taker") => self.safeNumber(entry, "takerFeeRate"),
    Symbol("percentage") => true,
    Symbol("tierBased") => true
)

end
"""
make a withdrawal
see: https://www.kucoin.com/docs-new/rest/account-info/withdrawals/withdraw-v3

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Kucoin, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    self.checkAddress(address = address);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("toAddress") => address,
        Symbol("withdrawType") => "ADDRESS"
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("memo")] = tag;
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        _netIdTmp = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
        if functions.ccxtruthy(_netIdTmp != nothing)
            request[Symbol("chain")] =             lowercase(_netIdTmp);
        end
    end
    amountString = self.currencyToPrecision(code, amount, networkCode = networkCode);
    if functions.ccxtruthy(amountString != nothing)
        request[Symbol("amount")] = ccxt_toNumber(amountString);
    end
    includeFee = nothing;
    (includeFee, params) = self.handleOptionAndParams(params, "withdraw", "includeFee", defaultValue = false);
    if functions.ccxtruthy(includeFee)
        request[Symbol("feeDeductType")] = "INTERNAL";
    end
    response = Base.fetch(self.privatePostWithdrawals(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseTransaction(data, currency = currency)

end
function parseTransactionStatus(self::Kucoin, status)
    statuses = Dict{Symbol, Any}(
        Symbol("SUCCESS") => "ok",
        Symbol("PROCESSING") => "pending",
        Symbol("WALLET_PROCESSING") => "pending",
        Symbol("FAILURE") => "failed"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseTransaction(self::Kucoin, transaction; currency=nothing)
    currencyId = safeString(transaction, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    address = safeString(transaction, "address");
    amount = safeString(transaction, "amount");
    txid = safeString(transaction, "walletTxId");
    if functions.ccxtruthy(txid != nothing)
        txidParts = split(txid, "@");
        numTxidParts = length(txidParts);
        if functions.ccxtruthy(functions.ccxt_gt(numTxidParts, 1))
            if functions.ccxtruthy(address == nothing)
                if functions.ccxtruthy(functions.ccxt_gt(length(get(txidParts, 2, nothing)), 1))
                    address = get(txidParts, 2, nothing);
                end
            end
        end
        txid = get(txidParts, 1, nothing);
    end
    type_var = functions.ccxtruthy((txid == nothing)) ? "withdrawal" : "deposit";
    rawStatus = safeString(transaction, "status");
    fee = nothing;
    feeCost = safeString(transaction, "fee");
    if functions.ccxtruthy(feeCost != nothing)
        rate = nothing;
        if functions.ccxtruthy(amount != nothing)
            rate = stringDiv(feeCost, amount);
        end
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeCost),
            Symbol("rate") => self.parseNumber(rate),
            Symbol("currency") => code
        );
    end
    timestamp = safeInteger2(transaction, "createdAt", "createAt");
    updated = safeInteger(transaction, "updatedAt");
    isV1 = !functions.ccxtruthy((ccxt_in("createdAt", transaction)));
    if functions.ccxtruthy(isV1)
        type_var = functions.ccxtruthy((ccxt_in("address", transaction))) ? "withdrawal" : "deposit";
        if functions.ccxtruthy(timestamp != nothing)
            timestamp = timestamp * 1000;
        end
        if functions.ccxtruthy(updated != nothing)
            updated = updated * 1000;
        end
    end
    internal = self.safeBool(transaction, "isInner");
    tag = safeString(transaction, "memo");
    chainId = safeString(transaction, "chain");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString2(transaction, "id", "withdrawalId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => self.networkIdToCode(networkId = chainId, currencyCode = code),
    Symbol("address") => address,
    Symbol("addressTo") => address,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => tag,
    Symbol("tagTo") => tag,
    Symbol("tagFrom") => nothing,
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(amount),
    Symbol("txid") => txid,
    Symbol("type") => type_var,
    Symbol("status") => self.parseTransactionStatus(rawStatus),
    Symbol("comment") => safeString(transaction, "remark"),
    Symbol("internal") => internal,
    Symbol("fee") => fee,
    Symbol("updated") => updated
)

end
"""
fetch all deposits made to an account
see: https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-history
see: https://www.kucoin.com/docs-new/abandoned-endpoints/account-funding/get-deposit-history-old

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: *main account only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.accountType`::string, optional: 'main' or 'contract' (default is 'main')

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchDeposits(self::Kucoin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountType = "main";
    (accountType, params) = self.handleOptionAndParams(params, "fetchDeposits", "accountType", defaultValue = accountType);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    accountType = safeString(accountsByType, accountType, accountType);
    if functions.ccxtruthy(accountType == "contract")
            return Base.fetch(self.fetchContractDeposits(code = code, since = since, limit = limit, params = params))
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchDeposits", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchDeposits", symbol = code, since = since, limit = limit, params = params))
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    (request, params) = self.handleUntilOption("endAt", request, params);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(since != nothing, functions.ccxt_lt(since, 1550448000000)))
        request[Symbol("startAt")] = self.parseToInt(since / 1000);
        response = Base.fetch(self.privateGetHistDeposits(extend(request, params)));
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startAt")] = since;
        end
        response = Base.fetch(self.privateGetDeposits(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    items = self.safeList(data, "items", defaultValue = []);
    return self.parseTransactions(items, currency = currency, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("type") => "deposit"
))

end
"""
helper method for fetching deposits for futures accounts

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchContractDeposits(self::Kucoin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = since;
    end
    response = Base.fetch(self.futuresPrivateGetDepositList(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    responseData = self.safeList(data, "items", defaultValue = []);
    return self.parseTransactions(responseData, currency = currency, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("type") => "deposit"
))

end
"""
fetch all withdrawals made from an account
see: https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-history
see: https://www.kucoin.com/docs-new/abandoned-endpoints/account-funding/get-withdrawal-history-old

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: *main account only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.accountType`::string, optional: 'main' or 'contract' (default is 'main')

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Kucoin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    accountType = "main";
    (accountType, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "accountType", defaultValue = accountType);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    accountType = safeString(accountsByType, accountType, accountType);
    if functions.ccxtruthy(accountType == "contract")
            return Base.fetch(self.fetchContractWithdrawals(code = code, since = since, limit = limit, params = params))
    end
    maxLimit = 500;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchWithdrawals", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchWithdrawals", symbol = code, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    (request, params) = self.handleUntilOption("endAt", request, params);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(since != nothing, functions.ccxt_lt(since, 1550448000000)))
        request[Symbol("startAt")] = self.parseToInt(since / 1000);
        response = Base.fetch(self.privateGetHistWithdrawals(extend(request, params)));
    else
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startAt")] = since;
        end
        response = Base.fetch(self.privateGetWithdrawals(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    items = self.safeList(data, "items", defaultValue = []);
    return self.parseTransactions(items, currency = currency, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("type") => "withdrawal"
))

end
"""
helper method for fetching withdrawals for futures accounts

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchContractWithdrawals(self::Kucoin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = since;
    end
    response = Base.fetch(self.futuresPrivateGetWithdrawalList(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    responseData = self.safeList(data, "items", defaultValue = []);
    return self.parseTransactions(responseData, currency = currency, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("type") => "withdrawal"
))

end
function parseBalanceHelper(self::Kucoin, entry)
    account = self.account();
    account[Symbol("used")] = safeString2(entry, "holdBalance", "hold");
    account[Symbol("free")] = safeString2(entry, "availableBalance", "available");
    account[Symbol("total")] = safeString2(entry, "totalBalance", "total");
    debt = safeString(entry, "liability");
    interest = safeString(entry, "interest");
    account[Symbol("debt")] = stringAdd(debt, interest);
    return account

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-detail-spot
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-cross-margin
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-isolated-margin
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-futures
see: https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-uta
see: https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-classic

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::object, optional: 'cross' or 'isolated', margin type for fetching margin balance
- `params.type`::object, optional: extra parameters specific to the exchange API endpoint
- `params.hf`::object, optional: *default if false* if true, the result includes the balance of the high frequency account
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Kucoin; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchBalance", "uta", defaultValue = uta);
    if functions.ccxtruthy(uta)
            return Base.fetch(self.fetchUtaBalance(params = params))
    end
    response = nothing;
    request = Dict{Symbol, Any}();
    code = safeString(params, "code");
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    requestedType = "spot";
    (requestedType, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    type_var = safeString(accountsByType, requestedType, requestedType);
    params = omit(params, "type");
    if functions.ccxtruthy(type_var == "contract")
            return Base.fetch(self.fetchContractBalance(params = params))
    end
    hf = nothing;
    (hf, params) = self.handleHfAndParams(params = params);
    if functions.ccxtruthy(@functions.ccxt_and(hf, (type_var != "main")))
        type_var = "trade_hf";
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBalance", params = params);
    isolated = @functions.ccxt_or((marginMode == "isolated"), (type_var == "isolated"));
    cross = @functions.ccxt_or((marginMode == "cross"), (type_var == "margin"));
    if functions.ccxtruthy(isolated)
        if functions.ccxtruthy(currency != nothing)
            request[Symbol("balanceCurrency")] = get(currency, Symbol("id"), nothing);
        end
        response = Base.fetch(self.privateGetIsolatedAccounts(extend(request, params)));
    elseif functions.ccxtruthy(cross)
        response = Base.fetch(self.privateGetMarginAccount(extend(request, params)));
    else
        if functions.ccxtruthy(currency != nothing)
            request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
        end
        request[Symbol("type")] = type_var;
        response = Base.fetch(self.privateGetAccounts(extend(request, params)));
    end
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    if functions.ccxtruthy(isolated)
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        assets = safeValue(data, "assets", data);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(assets)))
            entry = get(assets, i + 1, nothing);
            marketId = safeString(entry, "symbol");
            symbol = self.safeSymbol(marketId, market = nothing, delimiter = "_");
            base = self.safeDict(entry, "baseAsset", defaultValue = Dict{Symbol, Any}());
            quote_var = self.safeDict(entry, "quoteAsset", defaultValue = Dict{Symbol, Any}());
            baseCode = self.safeCurrencyCode(safeString(base, "currency"));
            quoteCode = self.safeCurrencyCode(safeString(quote_var, "currency"));
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

    elseif functions.ccxtruthy(cross)
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        accounts = self.safeList(data, "accounts", defaultValue = []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(accounts)))
            balance = get(accounts, i + 1, nothing);
            currencyId = safeString(balance, "currency");
            codeInner = self.safeCurrencyCode(currencyId);
            if functions.ccxtruthy(codeInner != nothing)
                result[Symbol(codeInner)] = self.parseBalanceHelper(balance);
            end
            i += 1
        end
    else
        data = self.safeList(response, "data", defaultValue = []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
            balance = get(data, i + 1, nothing);
            balanceType = safeString(balance, "type");
            if functions.ccxtruthy(balanceType == type_var)
                currencyId = safeString(balance, "currency");
                codeInner2 = self.safeCurrencyCode(currencyId);
                account = self.account();
                account[Symbol("total")] = safeString(balance, "balance");
                account[Symbol("free")] = safeString(balance, "available");
                account[Symbol("used")] = safeString(balance, "holds");
                if functions.ccxtruthy(codeInner2 != nothing)
                    result[Symbol(codeInner2)] = account;
                end
            end
            i += 1
        end
    end
    returnType = result;
    if functions.ccxtruthy(!functions.ccxtruthy(isolated))
        returnType = self.safeBalance(result);
    end
    return returnType

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-futures

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.code`::object, optional: the unified currency code to fetch the balance for, if not provided, the default .options['fetchBalance']['code'] will be used

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchContractBalance(self::Kucoin; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    defaultCode = safeString(self.options, "code");
    fetchBalanceOptions = safeValue(self.options, "fetchBalance", Dict{Symbol, Any}());
    defaultCode = safeString(fetchBalanceOptions, "code", defaultCode);
    code = safeString(params, "code", defaultCode);
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchContractBalance() requires a code parameter")));
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.futuresPrivateGetAccountOverview(extend(request, params)));
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    data = safeValue(response, "data");
    currencyId = safeString(data, "currency");
    currencyCode = self.safeCurrencyCode(currencyId, currency = currency);
    account = self.account();
    account[Symbol("free")] = safeString(data, "availableBalance");
    account[Symbol("total")] = safeString(data, "accountEquity");
    if functions.ccxtruthy(currencyCode != nothing)
        result[Symbol(currencyCode)] = account;
    end
    return self.safeBalance(result)

end
"""
helper method for fetching balance with unified trading account (uta) endpoint
see: https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-uta
see: https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-classic

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'unified', 'spot', 'funding', 'cross', 'isolated' or 'swap' (default is 'unified')
- `params.marginMode`::string, optional: 'cross' or 'isolated', margin type for fetching margin balance, only applicable if type is margin (default is cross)

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchUtaBalance(self::Kucoin; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    requestedType = "unified";
    (requestedType, params) = self.handleMarketTypeAndParams("fetchUtaBalance", market = nothing, params = params, defaultValue = requestedType);
    if functions.ccxtruthy(requestedType == "margin")
        marginMode = "cross";
        (marginMode, params) = self.handleMarginModeAndParams("fetchUtaBalance", params = params, defaultValue = marginMode);
        requestedType = marginMode;
    end
    utaAccountsByType = self.safeDict(self.options, "utaAccountsByType", defaultValue = Dict{Symbol, Any}());
    type_var = nothing;
    type_var = safeString(utaAccountsByType, requestedType, requestedType);
    isIsolated = (type_var == "ISOLATED");
    request = Dict{Symbol, Any}();
    response = nothing;
    if functions.ccxtruthy(type_var == "unified")
        request[Symbol("accountMode")] = type_var;
        response = Base.fetch(self.utaPrivateGetAccountModeAccountBalance(extend(request, params)));
    else
        request[Symbol("accountType")] = type_var;
        response = Base.fetch(self.utaPrivateGetAccountBalance(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    timestamp = safeInteger(data, "ts");
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => timestamp,
        Symbol("datetime") => self.iso8601(timestamp)
    );
    accounts = self.safeList(data, "accounts", defaultValue = []);
    if functions.ccxtruthy(isIsolated)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(accounts)))
            entry = get(accounts, i + 1, nothing);
            marketId = safeString(entry, "accountSubtype");
            symbol = self.safeSymbol(marketId, market = nothing, delimiter = "-");
            subResult = Dict{Symbol, Any}();
            currencies = self.safeList(entry, "currencies", defaultValue = []);
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(currencies)))
                currencyEntry = self.safeDict(currencies, j, defaultValue = Dict{Symbol, Any}());
                currencyId = safeString(currencyEntry, "currency");
                currencyCode = self.safeCurrencyCode(currencyId);
                if functions.ccxtruthy(currencyCode != nothing)
                    subResult[Symbol(currencyCode)] = self.parseBalanceHelper(currencyEntry);
                end
                j += 1
            end
            result[Symbol(symbol)] = self.safeBalance(subResult);
            i += 1
        end

    else
        firstAccount = self.safeDict(accounts, 0, defaultValue = Dict{Symbol, Any}());
        currencies = self.safeList(firstAccount, "currencies", defaultValue = []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(currencies)))
            currencyEntry = self.safeDict(currencies, i, defaultValue = Dict{Symbol, Any}());
            currencyId = safeString(currencyEntry, "currency");
            currencyCode = self.safeCurrencyCode(currencyId);
            if functions.ccxtruthy(currencyCode != nothing)
                result[Symbol(currencyCode)] = self.parseBalanceHelper(currencyEntry);
            end
            i += 1
        end
    end
    returnType = result;
    if functions.ccxtruthy(!functions.ccxtruthy(isIsolated))
        returnType = self.safeBalance(result);
    end
    return returnType

end
"""
transfer currency internally between wallets on the same account
see: https://www.kucoin.com/docs-new/rest/account-info/transfer/flex-transfer?lang=en_US&
see: https://www.kucoin.com/docs-new/rest/ua/flex-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false Check transferClassic() and transferUta() for more details on params

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Kucoin, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "transfer", "uta", defaultValue = uta);
    if functions.ccxtruthy(uta)
            return Base.fetch(self.transferUta(code, amount, fromAccount, toAccount, params = params))
    end
    return Base.fetch(self.transferClassic(code, amount, fromAccount, toAccount, params = params))

end
"""
transfer currency internally between wallets on the same account with uta endpoint
see: https://www.kucoin.com/docs-new/rest/ua/flex-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transferType`::string, optional: INTERNAL, PARENT_TO_SUB, SUB_TO_PARENT, SUB_TO_SUB (default is INTERNAL)
- `params.fromUserId`::string, optional: required if transferType is SUB_TO_PARENT or SUB_TO_SUB
- `params.toUserId`::string, optional: required if transferType is PARENT_TO_SUB or SUB_TO_SUB

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transferUta(self::Kucoin, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    requestedAmount = self.currencyToPrecision(code, amount);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => requestedAmount
    );
    transferType = "INTERNAL";
    (transferType, params) = self.handleParamString2(params, "transferType", "type", defaultValue = transferType);
    fromUserId = nothing;
    (fromUserId, params) = self.handleParamString2(params, "fromUserId", "fromUid", defaultValue = fromUserId);
    toUserId = nothing;
    (toUserId, params) = self.handleParamString2(params, "toUserId", "toUid", defaultValue = toUserId);
    if functions.ccxtruthy(@functions.ccxt_or(transferType == "PARENT_TO_SUB", transferType == "SUB_TO_SUB"))
        if functions.ccxtruthy(toUserId == nothing)
            throw(ExchangeError(string(self.id, " Ccxt.transfer() requires a toUserId param for PARENT_TO_SUB or SUB_TO_SUB transfers")));
        else
            request[Symbol("toUid")] = toUserId;
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(transferType == "SUB_TO_PARENT", transferType == "SUB_TO_SUB"))
        if functions.ccxtruthy(fromUserId == nothing)
            throw(ExchangeError(string(self.id, " Ccxt.transfer() requires a fromUserId param for SUB_TO_PARENT or SUB_TO_SUB transfers")));
        else
            request[Symbol("fromUid")] = fromUserId;
        end
    end
    clientOid = uuid();
    (clientOid, params) = self.handleParamString2(params, "clientOid", "clientOrderId", defaultValue = clientOid);
    request[Symbol("clientOid")] = clientOid;
    fromId = self.convertTypeToAccount(fromAccount);
    toId = self.convertTypeToAccount(toAccount);
    exchangeIds = functions.ccxtruthy((self.ids == nothing)) ? [] : self.ids;
    fromIsolated = inArray(fromId, exchangeIds);
    toIsolated = inArray(toId, exchangeIds);
    if functions.ccxtruthy(fromIsolated)
        request[Symbol("fromAccountSymbol")] = fromId;
        fromId = "ISOLATED";
    end
    if functions.ccxtruthy(toIsolated)
        request[Symbol("toAccountSymbol")] = toId;
        toId = "ISOLATED";
    end
    utaAccountsByType = self.safeDict(self.options, "utaAccountsByType", defaultValue = Dict{Symbol, Any}());
    fromId = safeString(utaAccountsByType, fromId, fromId);
    toId = safeString(utaAccountsByType, toId, toId);
    request[Symbol("fromAccountType")] =     uppercase(fromId);
    request[Symbol("toAccountType")] =     uppercase(toId);
    types = Dict{Symbol, Any}(
        Symbol("INTERNAL") => "0",
        Symbol("PARENT_TO_SUB") => "1",
        Symbol("SUB_TO_PARENT") => "2",
        Symbol("SUB_TO_SUB") => "3"
    );
    request[Symbol("type")] = safeString(types, transferType, transferType);
    response = Base.fetch(self.utaPrivatePostAccountTransfer(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    transfer = self.parseTransfer(data, currency = currency);
    transferOptions = self.safeDict(self.options, "transfer", defaultValue = Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(transferOptions, "fillResponseFromRequest", defaultValue = true);
    if functions.ccxtruthy(fillResponseFromRequest)
        transfer[Symbol("amount")] = amount;
        transfer[Symbol("fromAccount")] = fromAccount;
        transfer[Symbol("toAccount")] = toAccount;
        transfer[Symbol("status")] = "ok";
    end
    return transfer

end
"""
transfer currency internally between wallets on the same account with classic endpoints
see: https://www.kucoin.com/docs-new/rest/account-info/transfer/flex-transfer?lang=en_US&

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transferType`::string, optional: INTERNAL, PARENT_TO_SUB, SUB_TO_PARENT (default is INTERNAL)
- `params.fromUserId`::string, optional: required if transferType is SUB_TO_PARENT
- `params.toUserId`::string, optional: required if transferType is PARENT_TO_SUB

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transferClassic(self::Kucoin, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    requestedAmount = self.currencyToPrecision(code, amount);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => requestedAmount
    );
    transferType = "INTERNAL";
    (transferType, params) = self.handleParamString2(params, "transferType", "type", defaultValue = transferType);
    if functions.ccxtruthy(transferType == "PARENT_TO_SUB")
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("toUserId", params))))
            throw(ExchangeError(string(self.id, " Ccxt.transfer() requires a toUserId param for PARENT_TO_SUB transfers")));
        end
    elseif functions.ccxtruthy(transferType == "SUB_TO_PARENT")
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("fromUserId", params))))
            throw(ExchangeError(string(self.id, " Ccxt.transfer() requires a fromUserId param for SUB_TO_PARENT transfers")));
        end
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("clientOid", params))))
        request[Symbol("clientOid")] = uuid();
    end
    fromId = self.convertTypeToAccount(fromAccount);
    toId = self.convertTypeToAccount(toAccount);
    exchangeIds = functions.ccxtruthy((self.ids == nothing)) ? [] : self.ids;
    fromIsolated = inArray(fromId, exchangeIds);
    toIsolated = inArray(toId, exchangeIds);
    if functions.ccxtruthy(fromIsolated)
        request[Symbol("fromAccountTag")] = fromId;
        fromId = "isolated";
    end
    if functions.ccxtruthy(toIsolated)
        request[Symbol("toAccountTag")] = toId;
        toId = "isolated";
    end
    hfOrMining = self.isHfOrMining(fromId, toId);
    response = nothing;
    if functions.ccxtruthy(hfOrMining)
        request[Symbol("from")] = fromId;
        request[Symbol("to")] = toId;
        response = Base.fetch(self.privatePostAccountsInnerTransfer(extend(request, params)));
    else
        request[Symbol("type")] = transferType;
        request[Symbol("fromAccountType")] =         uppercase(fromId);
        request[Symbol("toAccountType")] =         uppercase(toId);
        response = Base.fetch(self.privatePostAccountsUniversalTransfer(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    transfer = self.parseTransfer(data, currency = currency);
    transferOptions = self.safeDict(self.options, "transfer", defaultValue = Dict{Symbol, Any}());
    fillResponseFromRequest = self.safeBool(transferOptions, "fillResponseFromRequest", defaultValue = true);
    if functions.ccxtruthy(fillResponseFromRequest)
        transfer[Symbol("amount")] = amount;
        transfer[Symbol("fromAccount")] = fromAccount;
        transfer[Symbol("toAccount")] = toAccount;
        transfer[Symbol("status")] = "ok";
    end
    return transfer

end
function isHfOrMining(self::Kucoin, fromId, toId)
    return (@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(fromId == "trade_hf", toId == "trade_hf"), fromId == "pool"), toId == "pool"))

end
function parseTransfer(self::Kucoin, transfer; currency=nothing)
    timestamp = safeInteger2(transfer, "createdAt", "time");
    currencyId = safeString(transfer, "currency");
    rawStatus = safeString(transfer, "status");
    bizType = safeString(transfer, "bizType");
    isLedgerEntry = (bizType != nothing);
    accountFromRaw = nothing;
    accountToRaw = nothing;
    if functions.ccxtruthy(isLedgerEntry)
        accountType = safeStringLower(transfer, "accountType");
        direction = safeString(transfer, "direction");
        if functions.ccxtruthy(direction == "out")
            accountFromRaw = accountType;
        elseif functions.ccxtruthy(direction == "in")
            accountToRaw = accountType;
        end
    else
        accountFromRaw = safeStringLower(transfer, "payAccountType");
        accountToRaw = safeStringLower(transfer, "recAccountType");
    end
    accountsByType = self.safeDict(self.options, "accountsByType");
    accountFrom = functions.ccxtruthy((accountFromRaw == nothing)) ? nothing : safeString(accountsByType, accountFromRaw, accountFromRaw);
    accountTo = functions.ccxtruthy((accountToRaw == nothing)) ? nothing : safeString(accountsByType, accountToRaw, accountToRaw);
    return Dict{Symbol, Any}(
    Symbol("id") => safeStringN(transfer, ["id", "applyId", "orderId"]),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("amount") => self.safeNumber(transfer, "amount"),
    Symbol("fromAccount") => accountFrom,
    Symbol("toAccount") => accountTo,
    Symbol("status") => self.parseTransferStatus(rawStatus),
    Symbol("info") => transfer
)

end
function parseTransferStatus(self::Kucoin, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PROCESSING") => "pending"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseLedgerEntryType(self::Kucoin, type_var)
    types = Dict{Symbol, Any}(
        Symbol("Assets Transferred in After Upgrading") => "transfer",
        Symbol("Deposit") => "transaction",
        Symbol("Withdrawal") => "transaction",
        Symbol("Transfer") => "transfer",
        Symbol("Trade_Exchange") => "trade",
        Symbol("KuCoin Bonus") => "bonus",
        Symbol("Referral Bonus") => "referral",
        Symbol("Rewards") => "bonus",
        Symbol("Airdrop/Fork") => "airdrop",
        Symbol("Other rewards") => "bonus",
        Symbol("Fee Rebate") => "rebate",
        Symbol("Buy Crypto") => "trade",
        Symbol("Sell Crypto") => "sell",
        Symbol("Public Offering Purchase") => "trade",
        Symbol("Refunded Fees") => "fee",
        Symbol("KCS Pay Fees") => "fee",
        Symbol("Margin Trade") => "trade",
        Symbol("Loans") => "Loans",
        Symbol("Instant Exchange") => "trade",
        Symbol("Sub-account transfer") => "transfer",
        Symbol("Liquidation Fees") => "fee",
        Symbol("RealisedPNL") => "trade",
        Symbol("TransferIn") => "transfer",
        Symbol("TransferOut") => "transfer",
        Symbol("TRADE_EXCHANGE") => "trade",
        Symbol("TRANSFER") => "transfer",
        Symbol("SUB_TRANSFER") => "transfer",
        Symbol("RETURNED_FEES") => "fee",
        Symbol("DEDUCTION_FEES") => "fee",
        Symbol("OTHER") => "other",
        Symbol("SUB_TO_SUB_TRANSFER") => "transfer",
        Symbol("SPOT_EXCHANGE") => "trade",
        Symbol("SPOT_EXCHANGE_REBATE") => "rebate",
        Symbol("FUTURES_EXCHANGE_OPEN") => "trade",
        Symbol("FUTURES_EXCHANGE_CLOSE") => "trade",
        Symbol("FUTURES_EXCHANGE_REBATE") => "rebate",
        Symbol("FUNDING_FEE") => "fee",
        Symbol("LIABILITY_INTEREST") => "fee",
        Symbol("KCS_DEDUCTION_FEES") => "fee",
        Symbol("KCS_RETURNED_FEES") => "fee",
        Symbol("AUTO_EXCHANGE_USER") => "trade"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerDirection(self::Kucoin, direction)
    directions = Dict{Symbol, Any}(
        Symbol("in") => "in",
        Symbol("out") => "out",
        Symbol("TransferIn") => "in",
        Symbol("TransferOut") => "out",
        Symbol("IN") => "in",
        Symbol("OUT") => "out"
    );
    return safeString(directions, direction, direction)

end
function parseLedgerStatus(self::Kucoin, status)
    statuses = Dict{Symbol, Any}(
        Symbol("Completed") => "ok",
        Symbol("Pending") => "pending"
    );
    return safeString(statuses, status, status)

end
function parseLedgerEntry(self::Kucoin, item; currency=nothing)
    id = safeString(item, "id");
    currencyId = safeString(item, "currency");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    amount = safeString(item, "amount");
    balanceAfter = self.safeNumberOmitZero(item, "balance");
    bizType = safeStringN(item, ["bizType", "businessType", "type"]);
    type_var = self.parseLedgerEntryType(bizType);
    direction = safeString2(item, "direction", "type");
    account = safeString(item, "accountType");
    timestamp = safeInteger(item, "createdAt");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeInteger(item, "time");
        if functions.ccxtruthy(timestamp != nothing)
            account = "CONTRACT";
        else
            timestamp = safeIntegerProduct(item, "ts", 0.000001);
        end
    end
    datetime = self.iso8601(timestamp);
    context = safeString(item, "context");
    referenceId = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(context != nothing, context != ""))
        try
            parsed = functions.ccxt_json_parse(context);
            orderId = safeString(parsed, "orderId");
            tradeId = safeString(parsed, "tradeId");
            if functions.ccxtruthy(tradeId != nothing)
                referenceId = tradeId;
            else
                referenceId = orderId;
            end
        catch e
            referenceId = context;

        end
    end
    fee = nothing;
    feeCostString = safeString(item, "fee");
    feeCost = functions.ccxtruthy((feeCostString == nothing)) ? nothing : omitZero(feeCostString);
    feeCurrency = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        feeCurrency = code;
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeCost),
            Symbol("currency") => feeCurrency
        );
    end
    status = safeString(item, "status");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => id,
    Symbol("direction") => self.parseLedgerDirection(direction),
    Symbol("account") => account,
    Symbol("referenceId") => referenceId,
    Symbol("referenceAccount") => account,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("amount") => self.parseNumber(stringAbs(amount)),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("before") => nothing,
    Symbol("after") => balanceAfter,
    Symbol("status") => self.parseLedgerStatus(status),
    Symbol("fee") => fee
), currency = currency)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-spot-margin
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-tradehf
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-marginhf
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-futures
see: https://www.kucoin.com/docs-new/rest/ua/get-account-ledger

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::object, optional: extra parameters specific to the exchange API endpoint
- `params.hf`::bool, optional: default false, when true will fetch ledger entries for the high frequency trading account
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.uta`::bool, optional: default false, when true will fetch ledger entries for the unified trading account (UTA) instead of the regular accounts endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Kucoin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    Base.fetch(self.loadAccounts());
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchLedger", "uta", defaultValue = uta);
    hf = nothing;
    (hf, params) = self.handleHfAndParams(params = params);
    requestedType = nothing;
    if functions.ccxtruthy(uta)
        requestedType = "UNIFIED";
    end
    (requestedType, params) = self.handleMarketTypeAndParams("fetchLedger", market = nothing, params = params, defaultValue = requestedType);
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchLedger", params = params);
    if functions.ccxtruthy(@functions.ccxt_and(uta, (requestedType == "margin")))
        marginMode = functions.ccxtruthy((marginMode == nothing)) ? "cross" : marginMode;
        requestedType = marginMode;
    end
    accountsByType = self.safeDict(self.options, "accountsByType");
    if functions.ccxtruthy(uta)
        accountsByType = self.safeDict(self.options, "utaAccountsByType");
    end
    type_var = nothing;
    type_var = safeString(accountsByType, requestedType, requestedType);
    maxLimit = 500;
    if functions.ccxtruthy(hf)
        maxLimit = 200;
    elseif functions.ccxtruthy(type_var == "contract")
        maxLimit = 50;
    else
        if functions.ccxtruthy(uta)
            if functions.ccxtruthy(@functions.ccxt_or((type_var == "UNIFIED"), (type_var == "SPOT")))
                maxLimit = 200;
            elseif functions.ccxtruthy(type_var == "FUTURES")
                maxLimit = 100;
            end
        end

    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchLedger", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchLedger", symbol = code, since = since, limit = limit, params = params, maxEntriesPerRequest = maxLimit))
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = since;
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    (request, params) = self.handleUntilOption("endAt", request, params);
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(type_var == "contract")
            request[Symbol("maxCount")] = limit;
        elseif functions.ccxtruthy(hf)
            request[Symbol("limit")] = limit;
        else
            request[Symbol("pageSize")] = limit;
        end
    end
    response = nothing;
    if functions.ccxtruthy(uta)
        request[Symbol("accountType")] = type_var;
        response = Base.fetch(self.utaPrivateGetAccountLedger(extend(request, params)));
    elseif functions.ccxtruthy(hf)
        if functions.ccxtruthy(marginMode != nothing)
            response = Base.fetch(self.privateGetHfMarginAccountLedgers(extend(request, params)));
        else
            response = Base.fetch(self.privateGetHfAccountsLedgers(extend(request, params)));
        end
    else
        if functions.ccxtruthy(type_var == "contract")
            response = Base.fetch(self.futuresPrivateGetTransactionHistory(extend(request, params)));
        else
            response = Base.fetch(self.privateGetAccountsLedgers(extend(request, params)));
        end

    end
    dataList = self.safeList(response, "data");
    if functions.ccxtruthy(dataList != nothing)
            return self.parseLedger(dataList, currency = currency, since = since, limit = limit)
    end
    data = self.safeDict(response, "data");
    items = self.safeList2(data, "items", "dataList", defaultValue = []);
    return self.parseLedger(items, currency = currency, since = since, limit = limit)

end
function calculateRateLimiterCost(self::Kucoin, api, method, path, params; config=Dict())
    versions = self.safeDict(self.options, "versions", defaultValue = Dict{Symbol, Any}());
    apiVersions = self.safeDict(versions, api, defaultValue = Dict{Symbol, Any}());
    methodVersions = self.safeDict(apiVersions, method, defaultValue = Dict{Symbol, Any}());
    defaultVersion = safeString(methodVersions, path, get(self.options, Symbol("version"), nothing));
    version = safeString(params, "version", defaultVersion);
    if functions.ccxtruthy(@functions.ccxt_and(version == "v3", (ccxt_in("v3", config))))
            return get(config, Symbol("v3"), nothing)
    elseif functions.ccxtruthy(@functions.ccxt_and(version == "v2", (ccxt_in("v2", config))))
        return get(config, Symbol("v2"), nothing)
    else
        if functions.ccxtruthy(@functions.ccxt_and(version == "v1", (ccxt_in("v1", config))))
                return get(config, Symbol("v1"), nothing)
        end

    end
    return safeValue(config, "cost", 1)

end
function parseBorrowRate(self::Kucoin, info; currency=nothing)
    timestampId = safeString2(info, "createdAt", "timestamp");
    timestamp = milliseconds();
    if functions.ccxtruthy(timestampId != nothing)
        timestamp = self.parseToInt(functions.ccxt_slice(timestampId, 0, 13));
    end
    currencyId = safeString(info, "currency");
    return Dict{Symbol, Any}(
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("rate") => self.safeNumberN(info, ["dailyIntRate", "dayRatio", "currentRateDaily"]),
    Symbol("period") => 86400000,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-cross-margin
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-isolated-margin

# Arguments
- `code`::string, optional: unified currency code
- `symbol`::string, optional: unified market symbol, required for isolated margin
- `since`::int, optional: the earliest time in ms to fetch borrrow interest for
- `limit`::int, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' default is 'cross'

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
function fetchBorrowInterest(self::Kucoin; code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("fetchBorrowInterest", params = params, defaultValue = "cross");
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        if functions.ccxtruthy(marginMode == "isolated")
            request[Symbol("balanceCurrency")] = get(currency, Symbol("id"), nothing);
        else
            request[Symbol("quoteCurrency")] = get(currency, Symbol("id"), nothing);
        end
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    response = nothing;
    if functions.ccxtruthy(marginMode == "isolated")
        response = Base.fetch(self.privateGetIsolatedAccounts(extend(request, params)));
    else
        response = Base.fetch(self.privateGetMarginAccounts(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    assets = functions.ccxtruthy((marginMode == "isolated")) ? self.safeList(data, "assets", defaultValue = []) : self.safeList(data, "accounts", defaultValue = []);
    interest = self.parseBorrowInterests(assets, market = market);
    filteredByCurrency = self.filterByCurrencySinceLimit(interest, code = code, since = since, limit = limit);
    return self.filterBySymbolSinceLimit(filteredByCurrency, symbol = symbol, since = since, limit = limit)

end
function parseBorrowInterest(self::Kucoin, info; market=nothing)
    marketId = safeString(info, "symbol");
    marginMode = functions.ccxtruthy((marketId == nothing)) ? "cross" : "isolated";
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = safeString(market, "symbol");
    isolatedBase = self.safeDict(info, "baseAsset", defaultValue = Dict{Symbol, Any}());
    amountBorrowed = nothing;
    interest = nothing;
    currencyId = nothing;
    if functions.ccxtruthy(marginMode == "isolated")
        amountBorrowed = self.safeNumber(isolatedBase, "liabilityPrincipal");
        interest = self.safeNumber(isolatedBase, "liabilityInterest");
        currencyId = safeString(isolatedBase, "currency");
    else
        amountBorrowed = self.safeNumber(info, "liabilityPrincipal");
        interest = self.safeNumber(info, "liabilityInterest");
        currencyId = safeString(info, "currency");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => symbol,
    Symbol("currency") => self.safeCurrencyCode(currencyId),
    Symbol("interest") => interest,
    Symbol("interestRate") => self.safeNumber(info, "dailyIntRate"),
    Symbol("amountBorrowed") => amountBorrowed,
    Symbol("marginMode") => marginMode,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/get-interest-history

# Arguments
- `codes`::any: list of unified currency codes, default is undefined
- `since`::int, optional: timestamp in ms of the earliest borrowRate, default is undefined
- `limit`::int, optional: max number of borrow rate prices to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' default is 'cross'
- `params.until`::int, optional: the latest time in ms to fetch entries for

# Returns
- a dictionary of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} indexed by the market symbol
"""
function fetchBorrowRateHistories(self::Kucoin; codes=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginResult = self.handleMarginModeAndParams("fetchBorrowRateHistories", params = params);
    marginMode = safeString(marginResult, 0, "cross");
    isIsolated = (marginMode == "isolated");
    request = Dict{Symbol, Any}(
        Symbol("isIsolated") => isIsolated
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    response = Base.fetch(self.privateGetMarginInterest(extend(request, params)));
    data = self.safeDict(response, "data");
    rows = self.safeList(data, "items", defaultValue = []);
    return self.parseBorrowRateHistories(rows, codes, since, limit)

end
"""
retrieves a history of a currencies borrow interest rate at specific time slots
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/get-interest-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: timestamp for the earliest borrow rate
- `limit`::int, optional: the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' default is 'cross'
- `params.until`::int, optional: the latest time in ms to fetch entries for

# Returns
- an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
function fetchBorrowRateHistory(self::Kucoin, code; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginResult = self.handleMarginModeAndParams("fetchBorrowRateHistories", params = params);
    marginMode = safeString(marginResult, 0, "cross");
    isIsolated = (marginMode == "isolated");
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("isIsolated") => isIsolated,
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    response = Base.fetch(self.privateGetMarginInterest(extend(request, params)));
    data = self.safeDict(response, "data");
    rows = self.safeList(data, "items", defaultValue = []);
    return self.parseBorrowRateHistory(rows, code, since, limit)

end
function parseBorrowRateHistories(self::Kucoin, response, codes, since, limit)
    borrowRateHistories = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        item = get(response, i + 1, nothing);
        code = self.safeCurrencyCode(safeString(item, "currency"));
        if functions.ccxtruthy(@functions.ccxt_and((code != nothing), (@functions.ccxt_or(codes == nothing, inArray(code, codes)))))
            if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(code, borrowRateHistories))))
                borrowRateHistories[Symbol(code)] = [];
            end
            borrowRateStructure = self.parseBorrowRate(item);
            borrowRateHistoriesCode = get(borrowRateHistories, Symbol(code), nothing);
                        push!(borrowRateHistoriesCode, borrowRateStructure);
        end
        i += 1
    end
    keys_var = objectKeys(borrowRateHistories);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        code = get(keys_var, i + 1, nothing);
        borrowRateHistories[Symbol(code)] = self.filterByCurrencySinceLimit(get(borrowRateHistories, Symbol(code), nothing), code = code, since = since, limit = limit);
        i += 1
    end
    return borrowRateHistories

end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://www.kucoin.com/docs-new/rest/ua/get-borrowing-rates-and-limits

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [borrow rate structure]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
function fetchCrossBorrowRate(self::Kucoin, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing)
    );
    response = Base.fetch(self.utaPrivateGetAccountInterestLimits(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseBorrowRate(data, currency = currency)

end
"""
create a loan to borrow margin
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/borrow

# Arguments
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoints
- `params.timeInForce`::string, optional: either IOC or FOK

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function borrowCrossMargin(self::Kucoin, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("size") => self.currencyToPrecision(code, amount),
        Symbol("timeInForce") => "FOK"
    );
    response = Base.fetch(self.privatePostMarginBorrow(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginLoan(data, currency = currency)

end
"""
create a loan to borrow margin
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/borrow

# Arguments
- `symbol`::string: unified market symbol, required for isolated margin
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoints
- `params.timeInForce`::string, optional: either IOC or FOK

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function borrowIsolatedMargin(self::Kucoin, symbol, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("size") => self.currencyToPrecision(code, amount),
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("timeInForce") => "FOK",
        Symbol("isIsolated") => true
    );
    response = Base.fetch(self.privatePostMarginBorrow(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginLoan(data, currency = currency)

end
"""
repay borrowed margin and interest
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/repay

# Arguments
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoints

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function repayCrossMargin(self::Kucoin, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("size") => self.currencyToPrecision(code, amount)
    );
    response = Base.fetch(self.privatePostMarginRepay(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginLoan(data, currency = currency)

end
"""
repay borrowed margin and interest
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/repay

# Arguments
- `symbol`::string: unified market symbol
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoints

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
function repayIsolatedMargin(self::Kucoin, symbol, code, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("size") => self.currencyToPrecision(code, amount),
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("isIsolated") => true
    );
    response = Base.fetch(self.privatePostMarginRepay(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginLoan(data, currency = currency)

end
function parseMarginLoan(self::Kucoin, info; currency=nothing)
    timestamp = milliseconds();
    currencyId = safeString(info, "currency");
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(info, "orderNo"),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber(info, "actualSize"),
    Symbol("symbol") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => info
)

end
"""
fetch deposit and withdraw fees - *IMPORTANT* use fetchDepositWithdrawFee to get more in-depth info
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-currencies

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchDepositWithdrawFees(self::Kucoin; codes=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetCurrencies(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseDepositWithdrawFees(data, codes = codes, currencyIdKey = "currency")

end
"""
fetch the set leverage for a market
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-cross-margin-leverage

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Kucoin, symbol; params=Dict())
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams(symbol, params = params);
    if functions.ccxtruthy(marginMode != "cross")
        throw(NotSupported(string(self.id, " fetchLeverage() currently supports only params[\"marginMode\"] = \"cross\"")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(NotSupported(string(self.id, " fetchLeverage() supports contract markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.futuresPrivateGetGetCrossUserLeverage(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    parsed = self.parseLeverage(data, market = market);
    return extend(parsed, Dict{Symbol, Any}(
    Symbol("marginMode") => marginMode
))

end
"""
set the level of leverage for a market
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/modify-leverage // margin
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/modify-cross-margin-leverage // contract
see: https://www.kucoin.com/docs-new/rest/ua/modify-cross-margin-leverage-uta // margin uta
see: https://www.kucoin.com/docs-new/rest/ua/modify-leverage-uta // contract uta

# Arguments
- `leverage`::int, optional: New leverage multiplier. Must be greater than 1 and up to two decimal places, and cannot be less than the user's current debt leverage or greater than the system's maximum leverage
- `symbol`::string, optional: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta)
- `params.marginMode`::string, optional: *spot non-uta only* 'cross' or 'isolated' default is 'cross'
- `params.code`::string, optional: *uta margin only* the unified currency code for the margin to set the leverage for

# Returns
- response from the exchange
"""
function setLeverage(self::Kucoin, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("setLeverage", market = nothing, params = params);
    if functions.ccxtruthy(@functions.ccxt_or((symbol != nothing), (@functions.ccxt_and((marketType != "spot"), (marketType != "margin")))))
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " setLeverage requires a symbol argument for contract markets")));
        end
        market = self.market(symbol);
        if functions.ccxtruthy(get(market, Symbol("contract"), nothing))
                return Base.fetch(self.setContractLeverage(leverage, symbol = symbol, params = params))
        end
    end
    request = Dict{Symbol, Any}(
        Symbol("leverage") => numberToString(leverage)
    );
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("setLeverage", params = params);
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "setLeverage", "uta", defaultValue = uta);
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(marginMode == "isolated")
            throw(NotSupported(string(self.id, " unified trading account does not support isolated margin")));
        end
        request[Symbol("accountMode")] = "unified";
        code = nothing;
        (code, params) = self.handleOptionAndParams2(params, "setLeverage", "currency", "code");
        if functions.ccxtruthy(code == nothing)
            throw(ArgumentsRequired(string(self.id, " setLeverage requires a currency code in the params[\"code\"] for unified trading account")));
        end
        request[Symbol("currency")] = self.currencyId(code);
        response = Base.fetch(self.utaPrivatePostAccountModeAccountModifyLeverageMarginCross(extend(request, params)));
    else
        if functions.ccxtruthy(marginMode == nothing)
            throw(ArgumentsRequired(string(self.id, " setLeverage requires a marginMode parameter")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(marginMode == "isolated", symbol == nothing))
            throw(ArgumentsRequired(string(self.id, " setLeverage requires a symbol parameter for isolated margin")));
        end
        if functions.ccxtruthy(symbol != nothing)
            request[Symbol("symbol")] = safeString(market, "id");
        end
        request[Symbol("isIsolated")] =         (marginMode == "isolated");
        response = Base.fetch(self.privatePostPositionUpdateUserLeverage(extend(request, params)));
    end
    return response

end
"""
set the level of leverage for a market
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/modify-cross-margin-leverage
see: https://www.kucoin.com/docs-new/rest/ua/modify-leverage-uta

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta)

# Returns
- response from the exchange
"""
function setContractLeverage(self::Kucoin, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams(symbol, params = params);
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != nothing), (marginMode != "cross")))
        throw(NotSupported(string(self.id, " setLeverage() currently supports only params[\"marginMode\"] = \"cross\" for contracts")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => string(leverage)
    );
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "setLeverage", "uta", defaultValue = uta);
    response = nothing;
    if functions.ccxtruthy(uta)
        request[Symbol("accountMode")] = "unified";
        response = Base.fetch(self.utaPrivatePostAccountModeAccountModifyLeverage(extend(request, params)));
    else
        response = Base.fetch(self.futuresPrivatePostChangeCrossUserLeverage(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    leverageNum = self.safeNumber(data, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("marginMode") => nothing,
    Symbol("longLeverage") => leverageNum,
    Symbol("shortLeverage") => leverageNum
)

end
"""
fetch the current funding rate interval
see: https://www.kucoin.com/docs-new/rest/ua/get-current-funding-rate
see: https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-current-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingInterval(self::Kucoin, symbol; params=Dict())
    return Base.fetch(self.fetchFundingRate(symbol, params = params))

end
"""
fetch the current funding rate
see: https://www.kucoin.com/docs-new/rest/ua/get-current-funding-rate
see: https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-current-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta)

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Kucoin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    uta = false;
    (uta, params) = self.handleOptionAndParams(params, "fetchFundingRate", "uta", defaultValue = uta);
    response = nothing;
    if functions.ccxtruthy(uta)
        response = Base.fetch(self.utaGetMarketFundingRate(extend(request, params)));
    else
        response = Base.fetch(self.futuresPublicGetFundingRateSymbolCurrent(extend(request, params)));
    end
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseFundingRate(data, market = market)

end
function parseFundingRate(self::Kucoin, data; market=nothing)
    fundingTimestamp = safeInteger(data, "fundingTime");
    previousFundingTimestamp = safeInteger(data, "timePoint");
    nextFundingTimestamp = safeInteger(data, "newGranularityStartTime");
    marketId = safeString(data, "symbol");
    granularity = safeString2(data, "granularity", "currentGranularity");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => self.safeNumber(data, "dailyInterestRate"),
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber2(data, "nextFundingRate", "value"),
    Symbol("fundingTimestamp") => fundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(fundingTimestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nextFundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(nextFundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => previousFundingTimestamp,
    Symbol("previousFundingDatetime") => self.iso8601(previousFundingTimestamp),
    Symbol("interval") => self.parseFundingInterval(granularity)
)

end
function parseFundingInterval(self::Kucoin, interval)
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
fetches historical funding rate prices
see: https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-public-funding-history
see: https://www.kucoin.com/docs-new/rest/ua/get-history-funding-rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: not used by kucuoinfutures
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in ms
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to true

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Kucoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    until = safeInteger(params, "until");
    uta = false;
    (uta, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "uta", defaultValue = uta);
    params = omit(params, "until");
    start = since;
    end_var = until;
    if functions.ccxtruthy(since == nothing)
        start = 0;
    end
    if functions.ccxtruthy(until == nothing)
        end_var = milliseconds();
    end
    response = nothing;
    resultKey = "data";
    if functions.ccxtruthy(uta)
        request[Symbol("startAt")] = start;
        request[Symbol("endAt")] = end_var;
        utaResponse = Base.fetch(self.utaGetMarketFundingRateHistory(extend(request, params)));
        response = self.safeDict(utaResponse, "data", defaultValue = Dict{Symbol, Any}());
        resultKey = "list";
    else
        request[Symbol("from")] = start;
        request[Symbol("to")] = end_var;
        response = Base.fetch(self.futuresPublicGetContractFundingRates(extend(request, params)));
    end
    result = self.safeList(response, resultKey, defaultValue = []);
    return self.parseFundingRateHistories(result, market = market, since = since, limit = limit)

end
function parseFundingRateHistory(self::Kucoin, info; market=nothing)
    marketId = safeString(info, "symbol");
    timestamp = safeInteger2(info, "ts", "timepoint");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("fundingRate") => self.safeNumber(info, "fundingRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
fetch the history of funding payments paid and received on this account
see: https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-private-funding-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Kucoin; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "uta", defaultValue = uta);
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    elseif functions.ccxtruthy(!functions.ccxtruthy(uta))
        throw(ArgumentsRequired(string(self.id, " fetchFundingHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = since;
    end
    dataList = [];
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("pageSize")] = limit;
        end
        (request, params) = self.handleUntilOption("endAt", request, params);
        response = Base.fetch(self.utaPrivateGetPositionFundingHistory(extend(request, params)));
        data = self.safeDict(response, "data");
        dataList = self.safeList(data, "items", defaultValue = []);
    else
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("maxCount")] = limit;
        end
        response = Base.fetch(self.futuresPrivateGetFundingHistory(extend(request, params)));
        data = safeValue(response, "data");
        dataList = self.safeList(data, "dataList", defaultValue = []);
    end
    fees = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(dataList)))
        listItem = get(dataList, i + 1, nothing);
        timestamp = safeInteger2(listItem, "timePoint", "settlementTime");
        marketId = safeString(listItem, "symbol");
        push!(fees, Dict{Symbol, Any}(
    Symbol("info") => listItem,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("code") => self.safeCurrencyCode(safeString(listItem, "settleCurrency")),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => self.safeNumber(listItem, "id"),
    Symbol("amount") => self.safeNumber2(listItem, "funding", "fundingFee"),
    Symbol("fundingRate") => self.safeNumber(listItem, "fundingRate"),
    Symbol("markPrice") => self.safeNumber(listItem, "markPrice"),
    Symbol("positionQty") => self.safeNumber2(listItem, "positionQty", "size"),
    Symbol("positionCost") => self.safeNumber2(listItem, "positionCost", "positionValue")
));
        i += 1
    end
    return fees

end
"""
fetch data on an open position
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-details
see: https://www.kucoin.com/docs-new/rest/ua/get-position-list-uta

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.pageSize`::integer, optional: *uta only* page size for the uta endpoint (default 50, max 200)
- `params.pageNumber`::integer, optional: *uta only* page number for the uta endpoint (default 1)

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Kucoin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchPosition", "uta", defaultValue = uta);
    response = nothing;
    position = nothing;
    if functions.ccxtruthy(uta)
        request[Symbol("accountMode")] = "unified";
        response = Base.fetch(self.utaPrivateGetAccountModePositionOpenList(extend(request, params)));
        data = self.safeList(response, "data", defaultValue = []);
        position = self.safeDict(data, 0, defaultValue = Dict{Symbol, Any}());
    else
        response = Base.fetch(self.futuresPrivateGetPosition(extend(request, params)));
        position = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    end
    return self.parsePosition(position, market = market)

end
"""
fetch all open positions
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-list
see: https://www.kucoin.com/docs-new/rest/ua/get-position-list-uta

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.pageSize`::integer, optional: *uta only* page size for the uta endpoint (default 50, max 200)
- `params.pageNumber`::integer, optional: *uta only* page number for the uta endpoint (default 1)

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Kucoin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchPositions", "uta", defaultValue = uta);
    response = nothing;
    if functions.ccxtruthy(uta)
        response = Base.fetch(self.utaPrivateGetAccountModePositionOpenList(extend(Dict{Symbol, Any}(
    Symbol("accountMode") => "unified",
    Symbol("limit") => 200
), params)));
    else
        response = Base.fetch(self.futuresPrivateGetPositions(params));
    end
    data = self.safeList(response, "data", defaultValue = []);
    return self.parsePositions(data, symbols = symbols)

end
"""
fetches historical positions
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-positions-history
see: https://www.kucoin.com/docs-new/rest/ua/get-position-history-uta

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `since`::int, optional: the earliest time in ms to fetch position history for
- `limit`::int, optional: the maximum number of entries to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: closing end time
- `params.pageId`::int, optional: page id
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionsHistory(self::Kucoin; symbols=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "fetchPositionsHistory", "uta", defaultValue = uta);
    response = nothing;
    request = Dict{Symbol, Any}();
    symbols = self.marketSymbols(symbols = symbols);
    if functions.ccxtruthy(symbols != nothing)
        len = length(symbols);
        if functions.ccxtruthy(len == 1)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    if functions.ccxtruthy(uta)
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startAt")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("pageSize")] = limit;
        end
        (request, params) = self.handleUntilOption("endAt", request, params);
        response = Base.fetch(self.utaPrivateGetPositionHistory(extend(request, params)));
    else
        if functions.ccxtruthy(limit == nothing)
            limit = 200;
        end
        request[Symbol("limit")] = limit;
        if functions.ccxtruthy(since != nothing)
            request[Symbol("from")] = since;
        end
        until = safeInteger(params, "until");
        if functions.ccxtruthy(until != nothing)
            params = omit(params, "until");
            request[Symbol("to")] = until;
        end
        response = Base.fetch(self.futuresPrivateGetHistoryPositions(extend(request, params)));
    end
    data = self.safeDict(response, "data");
    items = self.safeList(data, "items", defaultValue = []);
    return self.parsePositions(items, symbols = symbols)

end
function parsePosition(self::Kucoin, position; market=nothing)
    symbol = safeString(position, "symbol");
    market = self.safeMarket(marketId = symbol, market = market);
    timestamp = safeInteger(position, "currentTimestamp");
    if functions.ccxtruthy(timestamp == nothing)
        timestamp = safeIntegerProduct(position, "creationTime", 0.000001);
    end
    size_var = safeStringN(position, ["currentQty", "size", "maxSize", "closeSize"]);
    side = safeStringLower(position, "side");
    type_var = safeStringLower(position, "type");
    if functions.ccxtruthy(side == nothing)
        if functions.ccxtruthy(size_var != nothing)
            if functions.ccxtruthy(stringGt(size_var, "0"))
                side = "long";
            elseif functions.ccxtruthy(stringLt(size_var, "0"))
                side = "short";
            end
        elseif functions.ccxtruthy(type_var != nothing)
            if functions.ccxtruthy(findfirst("long", type_var) !== nothing)
                side = "long";
            else
                side = "short";
            end
        end
    end
    notional = stringAbs(safeString2(position, "posCost", "positionValue"));
    initialMargin = safeString2(position, "posInit", "initialMargin");
    initialMarginPercentage = stringDiv(initialMargin, notional);
    unrealisedPnl = safeString2(position, "unrealisedPnl", "unrealizedPnL");
    crossMode = safeValue(position, "crossMode");
    marginMode = safeStringLower(position, "marginMode");
    if functions.ccxtruthy(crossMode != nothing)
        marginMode = functions.ccxtruthy(crossMode) ? "cross" : "isolated";
    end
    lastUpdateTimestamp = safeInteger(position, "closeTime");
    if functions.ccxtruthy(lastUpdateTimestamp == nothing)
        lastUpdateTimestamp = safeIntegerProduct(position, "closingTime", 0.000001);
    end
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeStringN(position, ["id", "positionId", "closeId"]),
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("initialMargin") => self.parseNumber(initialMargin),
    Symbol("initialMarginPercentage") => self.parseNumber(initialMarginPercentage),
    Symbol("maintenanceMargin") => self.safeNumber2(position, "posMaint", "maintenanceMargin"),
    Symbol("maintenanceMarginPercentage") => self.safeNumber2(position, "maintMarginReq", "mmr"),
    Symbol("entryPrice") => self.safeNumberN(position, ["avgEntryPrice", "openPrice", "entryPrice"]),
    Symbol("notional") => self.parseNumber(notional),
    Symbol("leverage") => self.safeNumber2(position, "realLeverage", "leverage"),
    Symbol("unrealizedPnl") => self.parseNumber(unrealisedPnl),
    Symbol("contracts") => self.parseNumber(stringAbs(size_var)),
    Symbol("contractSize") => safeValue(market, "contractSize"),
    Symbol("realizedPnl") => self.safeNumberN(position, ["realisedPnl", "pnl", "realizedPnL"]),
    Symbol("marginRatio") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidationPrice"),
    Symbol("markPrice") => self.safeNumber(position, "markPrice"),
    Symbol("lastPrice") => self.safeNumber(position, "closePrice"),
    Symbol("collateral") => self.safeNumber(position, "maintMargin"),
    Symbol("marginMode") => marginMode,
    Symbol("side") => side,
    Symbol("percentage") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
"""
cancel multiple orders for contract markets
see: https://www.kucoin.com/docs-new/3470241e0
see: https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-id

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids
- `params.uta`::bool, optional: set to true to use the unified trading account (uta) endpoint, defaults to false for the contract orders
- `params.accountMode`::string, optional: *for uta endpoint only* 'unified' or 'classic' (default is 'unified')
- `params.marginMode`::string, optional: *for margin orders only* 'cross' or 'isolated' (unified accountMode supports cross margin only)

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Kucoin, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    uta = Base.fetch(self.isUTAEnabled());
    (uta, params) = self.handleOptionAndParams(params, "cancelOrders", "uta", defaultValue = uta);
    market = nothing;
    isContractMarket = true;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        isContractMarket = get(market, Symbol("contract"), nothing);
        if functions.ccxtruthy(!functions.ccxtruthy(isContractMarket))
            uta = true;
        end
    elseif functions.ccxtruthy(uta)
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument for uta endpoint")));
    end
    ordersRequests = [];
    clientOrderIds = self.safeList2(params, "clientOrderIds", "clientOids", defaultValue = []);
    params = omit(params, ["clientOrderIds", "clientOids"]);
    useClientorderId = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(clientOrderIds)))
        useClientorderId = true;
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument when cancelling by clientOrderIds")));
        end
        push!(ordersRequests, Dict{Symbol, Any}(
    Symbol("symbol") => safeString(market, "id"),
    Symbol("clientOid") => safeString(clientOrderIds, i)
));
        i += 1
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
        orderId = get(ids, i + 1, nothing);
        if functions.ccxtruthy(uta)
                        push!(ordersRequests, Dict{Symbol, Any}(
    Symbol("orderId") => orderId,
    Symbol("symbol") => safeString(market, "id")
));
        else
            push!(ordersRequests, get(ids, i + 1, nothing));
        end
        i += 1
    end
    request = Dict{Symbol, Any}();
    response = nothing;
    orders = [];
    if functions.ccxtruthy(uta)
        accountMode = "unified";
        (accountMode, params) = self.handleOptionAndParams(params, "cancelOrders", "accountMode", defaultValue = accountMode);
        request[Symbol("accountMode")] = accountMode;
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("cancelOrders", params = params);
        isUnified = (accountMode == "unified");
        tradeType = self.handleTradeType(isContractMarket = isContractMarket, marginMode = marginMode, isUnified = isUnified, params = params);
        request[Symbol("tradeType")] = tradeType;
        request[Symbol("cancelOrderList")] = ordersRequests;
        response = Base.fetch(self.utaPrivatePostAccountModeOrderCancelBatch(extend(request, params)));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        orders = self.safeList(data, "items", defaultValue = []);
    else
        requestKey = functions.ccxtruthy(useClientorderId) ? "clientOidsList" : "orderIdsList";
        request[Symbol(requestKey)] = ordersRequests;
        response = Base.fetch(self.futuresPrivateDeleteOrdersMultiCancel(extend(request, params)));
        orders = self.safeList(response, "data", defaultValue = []);
    end
    return self.parseOrders(orders, market = market)

end
"""
add margin
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/add-isolated-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string, optional: *required for hedged position* 'BOTH', 'LONG' or 'SHORT' (default is 'BOTH')

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Kucoin, symbol, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    uuid = Ccxt.uuid();
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("margin") => self.amountToPrecision(symbol, amount),
        Symbol("bizNo") => uuid
    );
    response = Base.fetch(self.futuresPrivatePostPositionMarginDepositMargin(extend(request, params)));
    data = safeValue(response, "data");
    return extend(self.parseMarginModification(data, market = market), Dict{Symbol, Any}(
    Symbol("amount") => self.amountToPrecision(symbol, amount),
    Symbol("direction") => "in"
))

end
"""
remove margin from a position
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/remove-isolated-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string, optional: *required for hedged position* 'BOTH', 'LONG' or 'SHORT' (default is 'BOTH')

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Kucoin, symbol, amount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    amountString = self.amountToPrecision(symbol, amount);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("withdrawAmount") => amountString
    );
    response = Base.fetch(self.futuresPrivatePostMarginWithdrawMargin(extend(request, params)));
    currencyId = safeString(market, "settle");
    responseCode = safeString(response, "code");
    return Dict{Symbol, Any}(
    Symbol("info") => response,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => "reduce",
    Symbol("marginMode") => "isolated",
    Symbol("amount") => self.parseNumber(amountString),
    Symbol("total") => nothing,
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("status") => functions.ccxtruthy((responseCode == "200000")) ? "ok" : nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
function parseMarginModification(self::Kucoin, info; market=nothing)
    id = safeString(info, "id");
    market = self.safeMarket(marketId = id, market = market);
    currencyId = safeString(info, "settleCurrency");
    crossMode = safeValue(info, "crossMode");
    mode = functions.ccxtruthy(crossMode) ? "cross" : "isolated";
    marketId = safeString(market, "symbol");
    timestamp = safeInteger(info, "currentTimestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("type") => nothing,
    Symbol("marginMode") => mode,
    Symbol("amount") => nothing,
    Symbol("total") => nothing,
    Symbol("code") => self.safeCurrencyCode(currencyId),
    Symbol("status") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
fetches the margin mode of a trading pair
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-margin-mode

# Arguments
- `symbol`::string: unified symbol of the market to fetch the margin mode for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
function fetchMarginMode(self::Kucoin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.futuresPrivateGetPositionGetMarginMode(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginMode(data, market = market)

end
function parseMarginMode(self::Kucoin, marginMode; market=nothing)
    marginType = safeString(marginMode, "marginMode");
    marginType = functions.ccxtruthy((marginType == "ISOLATED")) ? "isolated" : "cross";
    return Dict{Symbol, Any}(
    Symbol("info") => marginMode,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => marginType
)

end
"""
set margin mode to 'cross' or 'isolated'
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/switch-margin-mode

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setMarginMode(self::Kucoin, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    self.checkRequiredArgument("setMarginMode", marginMode, "marginMode", options = ["cross", "isolated"]);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(NotSupported(string(self.id, " setMarginMode() supports contract markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginMode") => uppercase(marginMode)
    );
    response = Base.fetch(self.futuresPrivatePostPositionChangeMarginMode(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return self.parseMarginMode(data, market = market)

end
"""
set hedged to true or false for a market
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/switch-position-mode

# Arguments
- `hedged`::bool: set to true to use two way position
- `symbol`::string, optional: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a response from the exchange
"""
function setPositionMode(self::Kucoin, hedged; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    posMode = functions.ccxtruthy(hedged) ? "1" : "0";
    request = Dict{Symbol, Any}(
        Symbol("positionMode") => posMode
    );
    response = Base.fetch(self.futuresPrivatePostPositionSwitchPositionMode(extend(request, params)));
    return response

end
"""
fetchs the position mode, hedged or one way
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-mode

# Arguments
- `symbol`::string, optional: unified symbol of the market to fetch the position mode for (not used in blofin fetchPositionMode)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
function fetchPositionMode(self::Kucoin; symbol=nothing, params=Dict())
    response = Base.fetch(self.futuresPrivateGetPositionGetPositionMode(params));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    positionMode = safeInteger(data, "positionMode");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("hedged") => positionMode == 1
)

end
"""
closes open positions for a market
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string: not used by kucoin closePositions
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id of the order

# Returns
- [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function closePosition(self::Kucoin, symbol; side=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    clientOrderId = safeString(params, "clientOrderId");
    testOrder = self.safeBool(params, "test", defaultValue = false);
    params = omit(params, ["test", "clientOrderId"]);
    if functions.ccxtruthy(clientOrderId == nothing)
        clientOrderId = numberToString(self.nonce());
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("closeOrder") => true,
        Symbol("clientOid") => clientOrderId,
        Symbol("type") => "market"
    );
    response = nothing;
    if functions.ccxtruthy(testOrder)
        response = Base.fetch(self.futuresPrivatePostOrdersTest(extend(request, params)));
    else
        response = Base.fetch(self.futuresPrivatePostOrders(extend(request, params)));
    end
    return self.parseOrder(response, market = market)

end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-isolated-margin-risk-limit

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true to fetch leverage tiers for unified trading account instead of futures account (default is false)

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
function fetchMarketLeverageTiers(self::Kucoin, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
        throw(BadRequest(string(self.id, " fetchMarketLeverageTiers() supports contract markets only")));
    end
    uta = false;
    (uta, params) = self.handleOptionAndParams(params, "fetchMarketLeverageTiers", "uta", defaultValue = uta);
    if functions.ccxtruthy(uta)
        result = Base.fetch(self.fetchLeverageTiers(symbols = [symbol], params = params));
            return self.safeList(result, symbol, defaultValue = [])
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.futuresPublicGetContractsRiskLimitSymbol(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseMarketLeverageTiers(data, market = market)

end
function parseMarketLeverageTiers(self::Kucoin, info; market=nothing)
    tiers = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(info)))
        tier = self.safeDict(info, i, defaultValue = Dict{Symbol, Any}());
        marketId = safeString(tier, "symbol");
        market = self.safeMarket(marketId = marketId, market = market);
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.safeNumber2(tier, "level", "tier"),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("currency") => get(market, Symbol("base"), nothing),
    Symbol("minNotional") => self.safeNumber2(tier, "minRiskLimit", "minSize"),
    Symbol("maxNotional") => self.safeNumber2(tier, "maxRiskLimit", "maxSize"),
    Symbol("maintenanceMarginRate") => self.safeNumber2(tier, "maintainMargin", "maintainMarginRate"),
    Symbol("maxLeverage") => self.safeNumber(tier, "maxLeverage"),
    Symbol("info") => tier
));
        i += 1
    end
    return tiers

end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
see: https://www.kucoin.com/docs-new/rest/ua/get-position-tiers

# Arguments
- `symbols`::array: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
function fetchLeverageTiers(self::Kucoin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    if functions.ccxtruthy(symbols == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchLeverageTiers() requires a symbols argument")));
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = "swap", allowEmpty = false, sameTypeOnly = true);
    marginMode = "cross";
    (marginMode, params) = self.handleMarginModeAndParams("fetchLeverageTiers", params = params, defaultValue = marginMode);
    marginMode = uppercase(marginMode);
    if functions.ccxtruthy(marginMode != "CROSS")
        throw(BadRequest(string(self.id, " fetchLeverageTiers() supports cross margin only")));
    end
    marketIds = self.marketIds(symbols = symbols);
    request = Dict{Symbol, Any}(
        Symbol("tradeType") => "FUTURES",
        Symbol("marginMode") => marginMode,
        Symbol("data") => "RISK_LIMIT",
        Symbol("accountType") => "UNIFIED",
        Symbol("symbol") => join(marketIds, ",")
    );
    response = Base.fetch(self.utaGetMarketPositionTiers(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    result = Dict{Symbol, Any}();
    tiers = self.parseMarketLeverageTiers(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tiers)))
        tier = self.safeDict(tiers, i);
        symbol = safeString(tier, "symbol");
        if functions.ccxtruthy(symbol != nothing)
            if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(symbol, result))))
                result[Symbol(symbol)] = [];
            end
                        push!(get(result, Symbol(symbol), nothing), tier);
        end
        i += 1
    end
    return result

end
"""
Retrieves the open interest for a list of symbols
see: https://www.kucoin.com/docs-new/rest/ua/get-futures-open-interset

# Arguments
- `symbols`::array, optional: Unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterests(self::Kucoin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        len = length(symbols);
        if functions.ccxtruthy(functions.ccxt_lt(len, 11))
            marketIds = self.marketIds(symbols = symbols);
            request[Symbol("symbol")] =             join(marketIds, ",");
        end
    end
    response = Base.fetch(self.utaGetMarketOpenInterest(extend(request, params)));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseOpenInterests(data, symbols = symbols)

end
function parseOpenInterest(self::Kucoin, interest; market=nothing)
    marketId = safeString(interest, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger(interest, "ts");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => self.safeSymbol(marketId),
    Symbol("openInterestAmount") => self.safeNumber(interest, "openInterest"),
    Symbol("openInterestValue") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
"""
Retrieves the open interest history of a currency
see: https://www.kucoin.com/docs-new/rest/ua/get-futures-open-interset

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `timeframe`::string: '5m', '15m', '30m', '1h', '4h' or '1d'
- `since`::int, optional: the time(ms) of the earliest record to retrieve as a unix timestamp
- `limit`::int, optional: default 30，max 200
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterestHistory(self::Kucoin, symbol; timeframe="5m", since=nothing, limit=nothing, params=Dict())
    timeframes = Dict{Symbol, Any}(
        Symbol("5m") => "5min",
        Symbol("15m") => "15min",
        Symbol("30m") => "30min",
        Symbol("1h") => "1hour",
        Symbol("4h") => "4hour",
        Symbol("1d") => "1day",
        Symbol("5min") => "5min",
        Symbol("15min") => "15min",
        Symbol("30min") => "30min",
        Symbol("1hour") => "1hour",
        Symbol("4hour") => "4hour",
        Symbol("1day") => "1day"
    );
    interval = safeString(timeframes, timeframe);
    if functions.ccxtruthy(interval == nothing)
        throw(BadRequest(string(self.id, " fetchOpenInterestHistory() invalid timeframe, supported are 5m, 15m, 30m, 1h, 4h, 1d")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    maxLimit = 200;
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOpenInterestHistory", "paginate", defaultValue = paginate);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOpenInterestHistory", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = maxLimit))
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => interval
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    end
    (request, params) = self.handleUntilOption("endAt", request, params);
    response = Base.fetch(self.utaGetMarketOpenInterest(extend(request, params)));
    data = self.safeList(response, "data");
    return self.parseOpenInterestsHistory(data, market = market, since = since, limit = limit)

end
"""
returns true or false so the user can check if unified account is enabled
see: https://www.kucoin.com/docs-new/rest/ua/get-account-mode

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- true if unified account is enabled, false otherwise
"""
function isUTAEnabled(self::Kucoin; params=Dict())
    uta = self.safeBool(self.options, "uta");
    if functions.ccxtruthy(uta == nothing)
        response = Base.fetch(self.utaPrivateGetAccountMode(params));
        data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
        accountMode = safeString(data, "selfAccountMode");
        uta = (accountMode == "UNIFIED");
        self.options[Symbol("uta")] = uta;
    end
    return uta

end
function sign(self::Kucoin, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    versions = self.safeDict(self.options, "versions", defaultValue = Dict{Symbol, Any}());
    apiVersions = self.safeDict(versions, api, defaultValue = Dict{Symbol, Any}());
    methodVersions = self.safeDict(apiVersions, method, defaultValue = Dict{Symbol, Any}());
    defaultVersion = safeString(methodVersions, path, get(self.options, Symbol("version"), nothing));
    version = safeString(params, "version", defaultVersion);
    params = omit(params, "version");
    endpoint = string("/api/", version, "/", self.implodeParams(path, params));
    if functions.ccxtruthy(api == "webExchange")
        endpoint = string("/", self.implodeParams(path, params));
    end
    if functions.ccxtruthy(api == "earn")
        endpoint = string("/api/v1/", self.implodeParams(path, params));
    end
    isUtaPrivate = false;
    if functions.ccxtruthy(@functions.ccxt_or((api == "uta"), (api == "utaPrivate")))
        endpoint = string("/api/ua/v1/", self.implodeParams(path, params));
        if functions.ccxtruthy(api == "utaPrivate")
            isUtaPrivate = true;
        end
    end
    query = omit(params, self.extractParams(path));
    endpart = "";
    headers = functions.ccxtruthy((headers != nothing)) ? headers : Dict{Symbol, Any}();
    url = get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing);
    tradeType = safeString(query, "tradeType");
    if functions.ccxtruthy(!functions.ccxtruthy(isEmpty(query)))
        if functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or((method == "GET"), (method == "DELETE"))), (path != "orders/multi-cancel")))
            endpoint += string("?", self.rawencode(query));
        else
            if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((endpoint == "/api/ua/v1/classic/order/place"), (endpoint == "/api/ua/v1/classic/order/place/batch")), (endpoint == "/api/ua/v1/classic/order/cancel")), (endpoint == "/api/ua/v1/classic/order/cancel/batch")))
                endpoint += string("?tradeType=", tradeType);
            end
            body = json(query);
            endpart = body;
            headers[Symbol("Content-Type")] = "application/json";
        end
    end
    url = string(url, endpoint);
    isFuturePrivate = (api == "futuresPrivate");
    isPrivate = (api == "private");
    isBroker = (api == "broker");
    isEarn = (api == "earn");
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(isPrivate, isFuturePrivate), isBroker), isEarn), isUtaPrivate))
        self.checkRequiredCredentials();
        timestamp = string(self.nonce());
        headers = extend(Dict{Symbol, Any}(
    Symbol("KC-API-KEY-VERSION") => "2",
    Symbol("KC-API-KEY") => self.apiKey,
    Symbol("KC-API-TIMESTAMP") => timestamp
), headers);
        headers = functions.ccxtruthy((headers == nothing)) ? Dict{Symbol, Any}() : headers;
        apiKeyVersion = safeString(headers, "KC-API-KEY-VERSION");
        if functions.ccxtruthy(apiKeyVersion == "2")
            passphrase = self.hmac(self.encode(self.password), self.encode(self.secret), sha256, "base64");
            headers[Symbol("KC-API-PASSPHRASE")] = passphrase;
        else
            headers[Symbol("KC-API-PASSPHRASE")] = self.password;
        end
        payload = string(timestamp, method, endpoint, endpart);
        signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "base64");
        headers[Symbol("KC-API-SIGN")] = signature;
        partner = self.safeDict(self.options, "partner", defaultValue = Dict{Symbol, Any}());
        isUtaFuturePrivate = @functions.ccxt_and(isUtaPrivate, (tradeType == "FUTURES"));
        isFuturePartner = @functions.ccxt_or(isFuturePrivate, isUtaFuturePrivate);
        partner = functions.ccxtruthy(isFuturePartner) ? safeValue(partner, "future", partner) : safeValue(partner, "spot", partner);
        partnerId = safeString(partner, "id");
        partnerSecret = safeString2(partner, "secret", "key");
        if functions.ccxtruthy(@functions.ccxt_and((partnerId != nothing), (partnerSecret != nothing)))
            partnerPayload = string(timestamp, partnerId, self.apiKey);
            partnerSignature = self.hmac(self.encode(partnerPayload), self.encode(partnerSecret), sha256, "base64");
            headers[Symbol("KC-API-PARTNER-SIGN")] = partnerSignature;
            headers[Symbol("KC-API-PARTNER")] = partnerId;
            headers[Symbol("KC-API-PARTNER-VERIFY")] = "true";
        end
        if functions.ccxtruthy(isBroker)
            brokerName = safeString(partner, "name");
            if functions.ccxtruthy(brokerName != nothing)
                headers[Symbol("KC-BROKER-NAME")] = brokerName;
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
function handleErrors(self::Kucoin, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, body);
            return nothing
    end
    errorCode = safeString(response, "code");
    message = safeString2(response, "msg", "data", "");
    feedback = string(self.id, " ", body);
    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), message, feedback);
    self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
    self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
    if functions.ccxtruthy(@functions.ccxt_and(errorCode != "200000", errorCode != "200"))
        throw(ExchangeError(feedback));
    end
    return nothing

end
"""
fetch a history of internal transfers made on an account
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-spot-margin

# Arguments
- `code`::string, optional: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch transfers for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchTransfers(self::Kucoin; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchTransfers", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDynamic("fetchTransfers", symbol = code, since = since, limit = limit, params = params))
    end
    request = Dict{Symbol, Any}(
        Symbol("bizType") => "TRANSFER"
    );
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("endAt")] = until;
    end
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("currency")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startAt")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("pageSize")] = limit;
    else
        request[Symbol("pageSize")] = 500;
    end
    (request, params) = self.handleUntilOption("endAt", request, params);
    response = Base.fetch(self.privateGetAccountsLedgers(extend(request, params)));
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    items = self.safeList(data, "items", defaultValue = []);
    return self.parseTransfers(items, currency = currency, since = since, limit = limit)

end
"""
fetches the auto deleveraging rank and risk percentage for a list of symbols
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-list

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [auto de leverage structures]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
function fetchPositionsADLRank(self::Kucoin; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols, type_var = nothing, allowEmpty = true, sameTypeOnly = true, sameSubTypeOnly = true);
    response = Base.fetch(self.futuresPrivateGetPositions(params));
    data = self.safeList(response, "data", defaultValue = []);
    return self.parseADLRanks(data, symbols = symbols)

end
function parseADLRank(self::Kucoin, info; market=nothing)
    marketId = safeString(info, "symbol");
    timestamp = safeInteger(info, "openingTimestamp");
    percentage = safeString(info, "delevPercentage");
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract"),
    Symbol("rank") => nothing,
    Symbol("rating") => nothing,
    Symbol("percentage") => self.parseNumber(stringMul(percentage, "100")),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Kucoin, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetCurrencies(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "currencies"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetCurrenciesCurrency(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "currencies/{currency}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetSymbols(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "symbols"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketOrderbookLevel1(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/orderbook/level1"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketAllTickers(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/allTickers"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketStats(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/stats"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarkets(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "markets"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketOrderbookLevelLevelLimit(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/orderbook/level{level}_{limit}"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketOrderbookLevel220(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/orderbook/level2_20"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketOrderbookLevel2100(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/orderbook/level2_100"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketHistories(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/histories"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarketCandles(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/candles"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetPrices(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "prices"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetTimestamp(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "timestamp"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetStatus(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "status"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarkPriceSymbolCurrent(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "mark-price/{symbol}/current"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarkPriceAllSymbols(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "mark-price/all-symbols"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarginConfig(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/config"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetAnnouncements(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "announcements"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetMarginCollateralRatio(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/collateralRatio"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetConvertSymbol(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/symbol"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetConvertCurrencies(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/currencies"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicPostBulletPublic(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "bullet-public"; api="public", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserInfo(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "user-info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetUserApiKey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "user/api-key"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccounts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsAccountId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "accounts/{accountId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsLedgers(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "accounts/ledgers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfAccountsLedgers(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/accounts/ledgers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginAccountLedgers(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/account/ledgers"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTransactionHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "transaction-history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubUser(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub/user"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubAccountsSubUserId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub-accounts/{subUserId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubAccounts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub-accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetSubApiKey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub/api-key"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginAccount(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/account"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginAccounts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetIsolatedAccounts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "isolated/accounts"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDepositAddresses(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "deposit-addresses"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetDeposits(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "deposits"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHistDeposits(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hist-deposits"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawals(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "withdrawals"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHistWithdrawals(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hist-withdrawals"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetWithdrawalsQuotas(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "withdrawals/quotas"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAccountsTransferable(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "accounts/transferable"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTransferList(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "transfer-list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBaseFee(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "base-fee"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetTradeFees(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "trade-fees"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarketOrderbookLevelLevel(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/orderbook/level{level}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarketOrderbookLevel2(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/orderbook/level2"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarketOrderbookLevel3(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/orderbook/level3"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfAccountsOpened(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/accounts/opened"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfOrdersActive(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/active"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfOrdersActiveSymbols(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/active/symbols"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginOrderActiveSymbols(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/order/active/symbols"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfOrdersDone(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/done"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfOrdersOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/{orderId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfOrdersClientOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/client-order/{clientOid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfOrdersDeadCancelAllQuery(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/dead-cancel-all/query"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfFills(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/fills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLimitOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "limit/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrdersOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/{orderId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOrderClientOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "order/client-order/{clientOid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetFills(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "fills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetLimitFills(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "limit/fills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetStopOrder(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "stop-order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetStopOrderOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "stop-order/{orderId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetStopOrderQueryOrderByClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "stop-order/queryOrderByClientOid"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOcoOrderOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "oco/order/{orderId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOcoOrderDetailsOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "oco/order/details/{orderId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOcoClientOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "oco/client-order/{clientOid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetOcoOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "oco/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginOrdersActive(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/orders/active"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginOrdersDone(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/orders/done"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginOrdersOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/orders/{orderId}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginOrdersClientOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/orders/client-order/{clientOid}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginFills(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/fills"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginStopOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/stop-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginStopOrderOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/stop-order/orderId"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginStopOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/stop-order/clientOid"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginOcoOrderOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/oco-order/orderId"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginOcoOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/oco-order/clientOid"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginOcoOrderDetailOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/oco-order/detail/orderId"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetHfMarginOcoOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/oco-orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetEtfInfo(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "etf/info"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginCurrencies(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/currencies"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetRiskLimitStrategy(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "risk/limit/strategy"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetIsolatedSymbols(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "isolated/symbols"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginSymbols(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/symbols"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetIsolatedAccountSymbol(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "isolated/account/{symbol}"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginBorrow(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/borrow"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginRepay(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/repay"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMarginInterest(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/interest"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetProjectList(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "project/list"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetProjectMarketInterestRate(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "project/marketInterestRate"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetRedeemOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "redeem/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetPurchaseOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "purchase/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBrokerApiRebaseDownload(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/api/rebase/download"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBrokerQueryMyCommission(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/queryMyCommission"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBrokerQueryUser(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/queryUser"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetBrokerQueryDetailByUid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/queryDetailByUid"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetMigrateUserAccountStatus(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "migrate/user/account/status"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetConvertQuote(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/quote"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetConvertOrderDetail(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/order/detail"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetConvertOrderHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/order/history"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetConvertLimitQuote(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/limit/quote"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetConvertLimitOrderDetail(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/limit/order/detail"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetConvertLimitOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/limit/orders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetAffiliateInviterStatistics(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "affiliate/inviter/statistics"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSubUserCreated(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub/user/created"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSubApiKey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub/api-key"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostSubApiKeyUpdate(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub/api-key/update"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDepositAddresses(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "deposit-addresses"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostWithdrawals(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "withdrawals"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountsUniversalTransfer(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "accounts/universal-transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountsSubTransfer(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "accounts/sub-transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostAccountsInnerTransfer(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "accounts/inner-transfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTransferOut(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "transfer-out"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostTransferIn(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "transfer-in"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfOrdersTest(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/test"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfOrdersSync(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/sync"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfOrdersMulti(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/multi"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfOrdersMultiSync(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/multi/sync"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfOrdersAlter(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/alter"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfOrdersDeadCancelAll(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/dead-cancel-all"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersTest(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/test"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOrdersMulti(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/multi"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostStopOrder(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "stop-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostOcoOrder(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "oco/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfMarginOrder(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfMarginOrderTest(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/order/test"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfMarginStopOrder(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/stop-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginOrder(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginOrderTest(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/order/test"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostHfMarginOcoOrder(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/oco-order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginBorrow(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/borrow"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostMarginRepay(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/repay"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPurchase(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "purchase"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostRedeem(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "redeem"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostLendPurchaseUpdate(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "lend/purchase/update"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostConvertOrder(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostConvertLimitOrder(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/limit/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostBulletPrivate(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "bullet-private"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostPositionUpdateUserLeverage(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position/update-user-leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostDepositAddressCreate(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "deposit-address/create"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteSubApiKey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub/api-key"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteWithdrawalsWithdrawalId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "withdrawals/{withdrawalId}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfOrdersOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/{orderId}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfOrdersSyncOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/sync/{orderId}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfOrdersClientOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/client-order/{clientOid}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfOrdersSyncClientOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/sync/client-order/{clientOid}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfOrdersCancelOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/cancel/{orderId}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfOrdersCancelAll(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/orders/cancelAll"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrdersOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/{orderId}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrderClientOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "order/client-order/{clientOid}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteStopOrderOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "stop-order/{orderId}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteStopOrderCancelOrderByClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "stop-order/cancelOrderByClientOid"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteStopOrderCancel(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "stop-order/cancel"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOcoOrderOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "oco/order/{orderId}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOcoClientOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "oco/client-order/{clientOid}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteOcoOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "oco/orders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfMarginOrdersOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/orders/{orderId}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfMarginOrdersClientOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/orders/client-order/{clientOid}"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfMarginOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/orders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfMarginStopOrderCancelById(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/stop-order/cancel-by-id"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfMarginStopOrderCancelByClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/stop-order/cancel-by-clientOid"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfMarginStopOrderCancel(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/stop-order/cancel"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfMarginOcoOrderCancelById(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/oco-order/cancel-by-id"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfMarginOcoOrderCancelByClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/oco-order/cancel-by-clientOid"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteHfMarginOcoOrderCancel(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "hf/margin/oco-order/cancel"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteConvertLimitOrderCancel(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "convert/limit/order/cancel"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetContractsActive(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "contracts/active"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetContractsSymbol(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "contracts/{symbol}"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetTicker(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "ticker"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetAllTickers(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "allTickers"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetLevel2Snapshot(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "level2/snapshot"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetLevel2Depth20(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "level2/depth20"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetLevel2Depth100(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "level2/depth100"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetTradeHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "trade/history"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetKlineQuery(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "kline/query"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetInterestQuery(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "interest/query"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetIndexQuery(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "index/query"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetMarkPriceSymbolCurrent(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "mark-price/{symbol}/current"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetPremiumQuery(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "premium/query"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetTradeStatistics(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "trade-statistics"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetFundingRateSymbolCurrent(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "funding-rate/{symbol}/current"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetContractFundingRates(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "contract/funding-rates"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetTimestamp(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "timestamp"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetStatus(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "status"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetLevel2MessageQuery(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "level2/message/query"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetContractsRiskLimitSymbol(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "contracts/risk-limit/{symbol}"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetLevel3MessageQuery(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "level3/message/query"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicGetLevel3Snapshot(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "level3/snapshot"; api="futuresPublic", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPublicPostBulletPublic(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "bullet-public"; api="futuresPublic", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetTransactionHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "transaction-history"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetAccountOverview(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account-overview"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetAccountOverviewAll(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account-overview-all"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetTransferList(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "transfer-list"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetStopOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "stopOrders"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetRecentDoneOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "recentDoneOrders"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetOrdersOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/{orderId}"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetOrdersByClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/byClientOid"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetFills(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "fills"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetRecentFills(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "recentFills"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetTradeFees(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "trade-fees"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetOpenOrderStatistics(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "openOrderStatistics"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetPosition(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetPositions(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "positions"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetMarginMaxWithdrawMargin(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/maxWithdrawMargin"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetContractsRiskLimitSymbol(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "contracts/risk-limit/{symbol}"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetFundingHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "funding-history"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetCopyTradeFuturesGetMaxOpenSize(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/get-max-open-size"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetCopyTradeFuturesPositionMarginMaxWithdrawMargin(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/position/margin/max-withdraw-margin"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetHistoryPositions(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "history-positions"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetPositionGetMarginMode(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position/getMarginMode"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetPositionGetPositionMode(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position/getPositionMode"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetDepositAddress(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "deposit-address"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetDepositList(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "deposit-list"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetWithdrawalsQuotas(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "withdrawals/quotas"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetWithdrawalList(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "withdrawal-list"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetSubApiKey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub/api-key"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetTradeStatistics(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "trade-statistics"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetGetMaxOpenSize(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "getMaxOpenSize"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateGetGetCrossUserLeverage(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "getCrossUserLeverage"; api="futuresPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostTransferOut(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "transfer-out"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostTransferIn(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "transfer-in"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostStOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "st-orders"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostOrdersTest(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/test"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostOrdersMulti(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/multi"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostPositionMarginAutoDepositStatus(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position/margin/auto-deposit-status"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostMarginWithdrawMargin(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "margin/withdrawMargin"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostPositionMarginDepositMargin(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position/margin/deposit-margin"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostPositionRiskLimitLevelChange(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position/risk-limit-level/change"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradeFuturesOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/orders"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradeFuturesOrdersTest(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/orders/test"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradeFuturesStOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/st-orders"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradeFuturesPositionMarginDepositMargin(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/position/margin/deposit-margin"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradeFuturesPositionMarginWithdrawMargin(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/position/margin/withdraw-margin"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradeFuturesPositionRiskLimitLevelChange(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/position/risk-limit-level/change"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradeFuturesPositionMarginAutoDepositStatus(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/position/margin/auto-deposit-status"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradeFuturesPositionChangeMarginMode(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/position/changeMarginMode"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradeFuturesPositionChangeCrossUserLeverage(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/position/changeCrossUserLeverage"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradeGetCrossModeMarginRequirement(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/getCrossModeMarginRequirement"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostCopyTradePositionSwitchPositionMode(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/position/switchPositionMode"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostChangeCrossUserLeverage(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "changeCrossUserLeverage"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostWithdrawals(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "withdrawals"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostSubApiKey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub/api-key"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostSubApiKeyUpdate(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub/api-key/update"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostPositionChangeMarginMode(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position/changeMarginMode"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostPositionSwitchPositionMode(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position/switchPositionMode"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivatePostBulletPrivate(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "bullet-private"; api="futuresPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateDeleteOrdersOrderId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/{orderId}"; api="futuresPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateDeleteOrdersClientOrderClientOid(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/client-order/{clientOid}"; api="futuresPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateDeleteOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders"; api="futuresPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateDeleteStopOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "stopOrders"; api="futuresPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateDeleteCopyTradeFuturesOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/orders"; api="futuresPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateDeleteCopyTradeFuturesOrdersClientOrder(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "copy-trade/futures/orders/client-order"; api="futuresPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateDeleteOrdersMultiCancel(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "orders/multi-cancel"; api="futuresPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateDeleteWithdrawalsWithdrawalId(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "withdrawals/{withdrawalId}"; api="futuresPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateDeleteCancelTransferOut(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "cancel/transfer-out"; api="futuresPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function futuresPrivateDeleteSubApiKey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub/api-key"; api="futuresPrivate", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function webExchangeGetCurrencyCurrencyChainInfo(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "currency/currency/chain-info"; api="webExchange", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function webExchangeGetContractSymbolFundingRates(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "contract/{symbol}/funding-rates"; api="webExchange", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerGetBrokerNdInfo(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/info"; api="broker", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerGetBrokerNdAccount(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/account"; api="broker", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerGetBrokerNdAccountApikey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/account/apikey"; api="broker", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerGetBrokerNdRebaseDownload(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/rebase/download"; api="broker", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerGetAssetNdbrokerDepositList(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "asset/ndbroker/deposit/list"; api="broker", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerGetBrokerNdTransferDetail(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/transfer/detail"; api="broker", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerGetBrokerNdDepositDetail(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/deposit/detail"; api="broker", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerGetBrokerNdWithdrawDetail(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/withdraw/detail"; api="broker", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerPostBrokerNdTransfer(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/transfer"; api="broker", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerPostBrokerNdAccount(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/account"; api="broker", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerPostBrokerNdAccountApikey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/account/apikey"; api="broker", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerPostBrokerNdAccountUpdateApikey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/account/update-apikey"; api="broker", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function brokerDeleteBrokerNdAccountApikey(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "broker/nd/account/apikey"; api="broker", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetOtcLoanDiscountRateConfigs(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "otc-loan/discount-rate-configs"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetOtcLoanLoan(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "otc-loan/loan"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetOtcLoanAccounts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "otc-loan/accounts"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetEarnRedeemPreview(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "earn/redeem-preview"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetEarnSavingProducts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "earn/saving/products"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetEarnHoldAssets(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "earn/hold-assets"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetEarnPromotionProducts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "earn/promotion/products"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetEarnKcsStakingProducts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "earn/kcs-staking/products"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetEarnStakingProducts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "earn/staking/products"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetEarnEthStakingProducts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "earn/eth-staking/products"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetStructEarnDualProducts(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "struct-earn/dual/products"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnGetStructEarnOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "struct-earn/orders"; api="earn", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnPostEarnOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "earn/orders"; api="earn", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnPostStructEarnOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "struct-earn/orders"; api="earn", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function earnDeleteEarnOrders(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "earn/orders"; api="earn", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketAnnouncement(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/announcement"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketCurrency(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/currency"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetAssetCurrencies(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "asset/currencies"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketInstrument(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/instrument"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketTicker(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/ticker"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketTrade(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/trade"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketKline(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/kline"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketFundingRate(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/funding-rate"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketFundingRateHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/funding-rate-history"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketCrossConfig(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/cross-config"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketCollateralDiscountRatio(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/collateral-discount-ratio"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketIndexPrice(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/index-price"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketPositionTiers(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/position-tiers"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketOpenInterest(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/open-interest"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetServerStatus(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "server/status"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketBorrowableCurrency(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/borrowable-currency"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetUserMyIp(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "user/my-ip"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaGetMarketFiatPrice(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/fiat-price"; api="uta", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetMarketOrderbook(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "market/orderbook"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountBalance(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account/balance"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountTransferQuota(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account/transfer-quota"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountMode(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account/mode"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountLedger(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account/ledger"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountInterestHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account/interest-history"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAssetDepositAddress(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "asset/deposit/address"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountDepositAddress(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account/deposit/address"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountModeAccountBalance(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/account/balance"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountModeAccountOverview(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/account/overview"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountModeOrderDetail(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/order/detail"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountModeOrderOpenList(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/order/open-list"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountModeOrderHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/order/history"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountModeOrderExecution(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/order/execution"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountModePositionOpenList(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/position/open-list"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountModePositionHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/position/history"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetPositionHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position/history"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountModePositionTiers(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/position/tiers"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetSubAccountBalance(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub-account/balance"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetUserFeeRate(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "user/fee-rate"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetDcpQuery(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "dcp/query"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetUnifiedAccountLeverage(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "unified/account/leverage"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetPositionFundingHistory(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "position/funding-history"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivateGetAccountInterestLimits(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account/interest-limits"; api="utaPrivate", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostAccountTransfer(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account/transfer"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostAccountMode(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "account/mode"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostAccountModeAccountModifyLeverage(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/account/modify-leverage"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostAccountModeOrderPlace(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/order/place"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostAccountModeOrderPlaceBatch(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/order/place-batch"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostAccountModeOrderCancel(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/order/cancel"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostAccountModeOrderCancelBatch(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/order/cancel-batch"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostAccountModeOrderCancelAll(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/order/cancel-all"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostSubAccountCanTransferOut(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "sub-account/canTransferOut"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostDcpSet(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "dcp/set"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function utaPrivatePostAccountModeAccountModifyLeverageMarginCross(self::Kucoin, params=Dict(), context=Dict())
    return request(self, "{accountMode}/account/modify-leverage-margin-cross"; api="utaPrivate", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function Kucoin(; kwargs...)
    inst = Kucoin(Exchange(), describe, nonce, fetchTime, fetchStatus, fetchMarkets, fetchContractMarkets, fetchUTAMarkets, loadMigrationStatus, handleHfAndParams, fetchCurrencies, parseCurrency, fetchAccounts, fetchTransactionFee, fetchDepositWithdrawFee, parseDepositWithdrawFee, isFuturesMethod, parseSpotOrUtaTicker, parseTicker, parseContractTicker, typeToTradeType, fetchTickers, fetchContractTickers, fetchMarkPrices, fetchTicker, fetchMarkPrice, parseOHLCV, fetchOHLCV, fetchUTAOHLCV, fetchSpotOHLCV, fetchContractOHLCV, createDepositAddress, fetchDepositAddress, fetchContractDepositAddress, parseDepositAddress, fetchDepositAddressesByNetwork, fetchOrderBook, handleTriggerPrices, createOrder, createSpotOrder, createSpotOrderRequest, marketOrderAmountToPrecision, createContractOrder, createContractOrderRequest, createUtaOrder, createUtaOrderRequest, createMarketOrderWithCost, createMarketBuyOrderWithCost, createMarketSellOrderWithCost, createOrders, createSpotOrders, createContractOrders, editOrder, cancelOrder, cancelSpotOrder, cancelContractOrder, cancelUtaOrder, cancelAllOrders, cancelAllSpotOrders, cancelAllContractOrders, cancelAllUtaOrders, fetchOrdersByStatus, fetchSpotOrdersByStatus, fetchContractOrdersByStatus, fetchUtaOrdersByStatus, fetchClosedOrders, fetchOpenOrders, fetchOrder, fetchSpotOrder, fetchContractOrder, fetchUtaOrder, handleTradeType, parseOrder, parseContractOrder, parseSpotOrder, parseUtaOrder, parseOrderTimeInForce, parseOrderStatus, fetchOrderTrades, fetchMyTrades, fetchMySpotTrades, fetchMyContractTrades, fetchMyUtaTrades, fetchTrades, parseTrade, parseSpotOrUtaTrade, parseContractTrade, parseMyUtaTrade, fetchTradingFee, withdraw, parseTransactionStatus, parseTransaction, fetchDeposits, fetchContractDeposits, fetchWithdrawals, fetchContractWithdrawals, parseBalanceHelper, fetchBalance, fetchContractBalance, fetchUtaBalance, transfer, transferUta, transferClassic, isHfOrMining, parseTransfer, parseTransferStatus, parseLedgerEntryType, parseLedgerDirection, parseLedgerStatus, parseLedgerEntry, fetchLedger, calculateRateLimiterCost, parseBorrowRate, fetchBorrowInterest, parseBorrowInterest, fetchBorrowRateHistories, fetchBorrowRateHistory, parseBorrowRateHistories, fetchCrossBorrowRate, borrowCrossMargin, borrowIsolatedMargin, repayCrossMargin, repayIsolatedMargin, parseMarginLoan, fetchDepositWithdrawFees, fetchLeverage, setLeverage, setContractLeverage, fetchFundingInterval, fetchFundingRate, parseFundingRate, parseFundingInterval, fetchFundingRateHistory, parseFundingRateHistory, fetchFundingHistory, fetchPosition, fetchPositions, fetchPositionsHistory, parsePosition, cancelOrders, addMargin, reduceMargin, parseMarginModification, fetchMarginMode, parseMarginMode, setMarginMode, setPositionMode, fetchPositionMode, closePosition, fetchMarketLeverageTiers, parseMarketLeverageTiers, fetchLeverageTiers, fetchOpenInterests, parseOpenInterest, fetchOpenInterestHistory, isUTAEnabled, sign, handleErrors, fetchTransfers, fetchPositionsADLRank, parseADLRank, publicGetCurrencies, publicGetCurrenciesCurrency, publicGetSymbols, publicGetMarketOrderbookLevel1, publicGetMarketAllTickers, publicGetMarketStats, publicGetMarkets, publicGetMarketOrderbookLevelLevelLimit, publicGetMarketOrderbookLevel220, publicGetMarketOrderbookLevel2100, publicGetMarketHistories, publicGetMarketCandles, publicGetPrices, publicGetTimestamp, publicGetStatus, publicGetMarkPriceSymbolCurrent, publicGetMarkPriceAllSymbols, publicGetMarginConfig, publicGetAnnouncements, publicGetMarginCollateralRatio, publicGetConvertSymbol, publicGetConvertCurrencies, publicPostBulletPublic, privateGetUserInfo, privateGetUserApiKey, privateGetAccounts, privateGetAccountsAccountId, privateGetAccountsLedgers, privateGetHfAccountsLedgers, privateGetHfMarginAccountLedgers, privateGetTransactionHistory, privateGetSubUser, privateGetSubAccountsSubUserId, privateGetSubAccounts, privateGetSubApiKey, privateGetMarginAccount, privateGetMarginAccounts, privateGetIsolatedAccounts, privateGetDepositAddresses, privateGetDeposits, privateGetHistDeposits, privateGetWithdrawals, privateGetHistWithdrawals, privateGetWithdrawalsQuotas, privateGetAccountsTransferable, privateGetTransferList, privateGetBaseFee, privateGetTradeFees, privateGetMarketOrderbookLevelLevel, privateGetMarketOrderbookLevel2, privateGetMarketOrderbookLevel3, privateGetHfAccountsOpened, privateGetHfOrdersActive, privateGetHfOrdersActiveSymbols, privateGetHfMarginOrderActiveSymbols, privateGetHfOrdersDone, privateGetHfOrdersOrderId, privateGetHfOrdersClientOrderClientOid, privateGetHfOrdersDeadCancelAllQuery, privateGetHfFills, privateGetOrders, privateGetLimitOrders, privateGetOrdersOrderId, privateGetOrderClientOrderClientOid, privateGetFills, privateGetLimitFills, privateGetStopOrder, privateGetStopOrderOrderId, privateGetStopOrderQueryOrderByClientOid, privateGetOcoOrderOrderId, privateGetOcoOrderDetailsOrderId, privateGetOcoClientOrderClientOid, privateGetOcoOrders, privateGetHfMarginOrdersActive, privateGetHfMarginOrdersDone, privateGetHfMarginOrdersOrderId, privateGetHfMarginOrdersClientOrderClientOid, privateGetHfMarginFills, privateGetHfMarginStopOrders, privateGetHfMarginStopOrderOrderId, privateGetHfMarginStopOrderClientOid, privateGetHfMarginOcoOrderOrderId, privateGetHfMarginOcoOrderClientOid, privateGetHfMarginOcoOrderDetailOrderId, privateGetHfMarginOcoOrders, privateGetEtfInfo, privateGetMarginCurrencies, privateGetRiskLimitStrategy, privateGetIsolatedSymbols, privateGetMarginSymbols, privateGetIsolatedAccountSymbol, privateGetMarginBorrow, privateGetMarginRepay, privateGetMarginInterest, privateGetProjectList, privateGetProjectMarketInterestRate, privateGetRedeemOrders, privateGetPurchaseOrders, privateGetBrokerApiRebaseDownload, privateGetBrokerQueryMyCommission, privateGetBrokerQueryUser, privateGetBrokerQueryDetailByUid, privateGetMigrateUserAccountStatus, privateGetConvertQuote, privateGetConvertOrderDetail, privateGetConvertOrderHistory, privateGetConvertLimitQuote, privateGetConvertLimitOrderDetail, privateGetConvertLimitOrders, privateGetAffiliateInviterStatistics, privatePostSubUserCreated, privatePostSubApiKey, privatePostSubApiKeyUpdate, privatePostDepositAddresses, privatePostWithdrawals, privatePostAccountsUniversalTransfer, privatePostAccountsSubTransfer, privatePostAccountsInnerTransfer, privatePostTransferOut, privatePostTransferIn, privatePostHfOrders, privatePostHfOrdersTest, privatePostHfOrdersSync, privatePostHfOrdersMulti, privatePostHfOrdersMultiSync, privatePostHfOrdersAlter, privatePostHfOrdersDeadCancelAll, privatePostOrders, privatePostOrdersTest, privatePostOrdersMulti, privatePostStopOrder, privatePostOcoOrder, privatePostHfMarginOrder, privatePostHfMarginOrderTest, privatePostHfMarginStopOrder, privatePostMarginOrder, privatePostMarginOrderTest, privatePostHfMarginOcoOrder, privatePostMarginBorrow, privatePostMarginRepay, privatePostPurchase, privatePostRedeem, privatePostLendPurchaseUpdate, privatePostConvertOrder, privatePostConvertLimitOrder, privatePostBulletPrivate, privatePostPositionUpdateUserLeverage, privatePostDepositAddressCreate, privateDeleteSubApiKey, privateDeleteWithdrawalsWithdrawalId, privateDeleteHfOrdersOrderId, privateDeleteHfOrdersSyncOrderId, privateDeleteHfOrdersClientOrderClientOid, privateDeleteHfOrdersSyncClientOrderClientOid, privateDeleteHfOrdersCancelOrderId, privateDeleteHfOrders, privateDeleteHfOrdersCancelAll, privateDeleteOrdersOrderId, privateDeleteOrderClientOrderClientOid, privateDeleteOrders, privateDeleteStopOrderOrderId, privateDeleteStopOrderCancelOrderByClientOid, privateDeleteStopOrderCancel, privateDeleteOcoOrderOrderId, privateDeleteOcoClientOrderClientOid, privateDeleteOcoOrders, privateDeleteHfMarginOrdersOrderId, privateDeleteHfMarginOrdersClientOrderClientOid, privateDeleteHfMarginOrders, privateDeleteHfMarginStopOrderCancelById, privateDeleteHfMarginStopOrderCancelByClientOid, privateDeleteHfMarginStopOrderCancel, privateDeleteHfMarginOcoOrderCancelById, privateDeleteHfMarginOcoOrderCancelByClientOid, privateDeleteHfMarginOcoOrderCancel, privateDeleteConvertLimitOrderCancel, futuresPublicGetContractsActive, futuresPublicGetContractsSymbol, futuresPublicGetTicker, futuresPublicGetAllTickers, futuresPublicGetLevel2Snapshot, futuresPublicGetLevel2Depth20, futuresPublicGetLevel2Depth100, futuresPublicGetTradeHistory, futuresPublicGetKlineQuery, futuresPublicGetInterestQuery, futuresPublicGetIndexQuery, futuresPublicGetMarkPriceSymbolCurrent, futuresPublicGetPremiumQuery, futuresPublicGetTradeStatistics, futuresPublicGetFundingRateSymbolCurrent, futuresPublicGetContractFundingRates, futuresPublicGetTimestamp, futuresPublicGetStatus, futuresPublicGetLevel2MessageQuery, futuresPublicGetContractsRiskLimitSymbol, futuresPublicGetLevel3MessageQuery, futuresPublicGetLevel3Snapshot, futuresPublicPostBulletPublic, futuresPrivateGetTransactionHistory, futuresPrivateGetAccountOverview, futuresPrivateGetAccountOverviewAll, futuresPrivateGetTransferList, futuresPrivateGetOrders, futuresPrivateGetStopOrders, futuresPrivateGetRecentDoneOrders, futuresPrivateGetOrdersOrderId, futuresPrivateGetOrdersByClientOid, futuresPrivateGetFills, futuresPrivateGetRecentFills, futuresPrivateGetTradeFees, futuresPrivateGetOpenOrderStatistics, futuresPrivateGetPosition, futuresPrivateGetPositions, futuresPrivateGetMarginMaxWithdrawMargin, futuresPrivateGetContractsRiskLimitSymbol, futuresPrivateGetFundingHistory, futuresPrivateGetCopyTradeFuturesGetMaxOpenSize, futuresPrivateGetCopyTradeFuturesPositionMarginMaxWithdrawMargin, futuresPrivateGetHistoryPositions, futuresPrivateGetPositionGetMarginMode, futuresPrivateGetPositionGetPositionMode, futuresPrivateGetDepositAddress, futuresPrivateGetDepositList, futuresPrivateGetWithdrawalsQuotas, futuresPrivateGetWithdrawalList, futuresPrivateGetSubApiKey, futuresPrivateGetTradeStatistics, futuresPrivateGetGetMaxOpenSize, futuresPrivateGetGetCrossUserLeverage, futuresPrivatePostTransferOut, futuresPrivatePostTransferIn, futuresPrivatePostOrders, futuresPrivatePostStOrders, futuresPrivatePostOrdersTest, futuresPrivatePostOrdersMulti, futuresPrivatePostPositionMarginAutoDepositStatus, futuresPrivatePostMarginWithdrawMargin, futuresPrivatePostPositionMarginDepositMargin, futuresPrivatePostPositionRiskLimitLevelChange, futuresPrivatePostCopyTradeFuturesOrders, futuresPrivatePostCopyTradeFuturesOrdersTest, futuresPrivatePostCopyTradeFuturesStOrders, futuresPrivatePostCopyTradeFuturesPositionMarginDepositMargin, futuresPrivatePostCopyTradeFuturesPositionMarginWithdrawMargin, futuresPrivatePostCopyTradeFuturesPositionRiskLimitLevelChange, futuresPrivatePostCopyTradeFuturesPositionMarginAutoDepositStatus, futuresPrivatePostCopyTradeFuturesPositionChangeMarginMode, futuresPrivatePostCopyTradeFuturesPositionChangeCrossUserLeverage, futuresPrivatePostCopyTradeGetCrossModeMarginRequirement, futuresPrivatePostCopyTradePositionSwitchPositionMode, futuresPrivatePostChangeCrossUserLeverage, futuresPrivatePostWithdrawals, futuresPrivatePostSubApiKey, futuresPrivatePostSubApiKeyUpdate, futuresPrivatePostPositionChangeMarginMode, futuresPrivatePostPositionSwitchPositionMode, futuresPrivatePostBulletPrivate, futuresPrivateDeleteOrdersOrderId, futuresPrivateDeleteOrdersClientOrderClientOid, futuresPrivateDeleteOrders, futuresPrivateDeleteStopOrders, futuresPrivateDeleteCopyTradeFuturesOrders, futuresPrivateDeleteCopyTradeFuturesOrdersClientOrder, futuresPrivateDeleteOrdersMultiCancel, futuresPrivateDeleteWithdrawalsWithdrawalId, futuresPrivateDeleteCancelTransferOut, futuresPrivateDeleteSubApiKey, webExchangeGetCurrencyCurrencyChainInfo, webExchangeGetContractSymbolFundingRates, brokerGetBrokerNdInfo, brokerGetBrokerNdAccount, brokerGetBrokerNdAccountApikey, brokerGetBrokerNdRebaseDownload, brokerGetAssetNdbrokerDepositList, brokerGetBrokerNdTransferDetail, brokerGetBrokerNdDepositDetail, brokerGetBrokerNdWithdrawDetail, brokerPostBrokerNdTransfer, brokerPostBrokerNdAccount, brokerPostBrokerNdAccountApikey, brokerPostBrokerNdAccountUpdateApikey, brokerDeleteBrokerNdAccountApikey, earnGetOtcLoanDiscountRateConfigs, earnGetOtcLoanLoan, earnGetOtcLoanAccounts, earnGetEarnRedeemPreview, earnGetEarnSavingProducts, earnGetEarnHoldAssets, earnGetEarnPromotionProducts, earnGetEarnKcsStakingProducts, earnGetEarnStakingProducts, earnGetEarnEthStakingProducts, earnGetStructEarnDualProducts, earnGetStructEarnOrders, earnPostEarnOrders, earnPostStructEarnOrders, earnDeleteEarnOrders, utaGetMarketAnnouncement, utaGetMarketCurrency, utaGetAssetCurrencies, utaGetMarketInstrument, utaGetMarketTicker, utaGetMarketTrade, utaGetMarketKline, utaGetMarketFundingRate, utaGetMarketFundingRateHistory, utaGetMarketCrossConfig, utaGetMarketCollateralDiscountRatio, utaGetMarketIndexPrice, utaGetMarketPositionTiers, utaGetMarketOpenInterest, utaGetServerStatus, utaGetMarketBorrowableCurrency, utaGetUserMyIp, utaGetMarketFiatPrice, utaPrivateGetMarketOrderbook, utaPrivateGetAccountBalance, utaPrivateGetAccountTransferQuota, utaPrivateGetAccountMode, utaPrivateGetAccountLedger, utaPrivateGetAccountInterestHistory, utaPrivateGetAssetDepositAddress, utaPrivateGetAccountDepositAddress, utaPrivateGetAccountModeAccountBalance, utaPrivateGetAccountModeAccountOverview, utaPrivateGetAccountModeOrderDetail, utaPrivateGetAccountModeOrderOpenList, utaPrivateGetAccountModeOrderHistory, utaPrivateGetAccountModeOrderExecution, utaPrivateGetAccountModePositionOpenList, utaPrivateGetAccountModePositionHistory, utaPrivateGetPositionHistory, utaPrivateGetAccountModePositionTiers, utaPrivateGetSubAccountBalance, utaPrivateGetUserFeeRate, utaPrivateGetDcpQuery, utaPrivateGetUnifiedAccountLeverage, utaPrivateGetPositionFundingHistory, utaPrivateGetAccountInterestLimits, utaPrivatePostAccountTransfer, utaPrivatePostAccountMode, utaPrivatePostAccountModeAccountModifyLeverage, utaPrivatePostAccountModeOrderPlace, utaPrivatePostAccountModeOrderPlaceBatch, utaPrivatePostAccountModeOrderCancel, utaPrivatePostAccountModeOrderCancelBatch, utaPrivatePostAccountModeOrderCancelAll, utaPrivatePostSubAccountCanTransferOut, utaPrivatePostDcpSet, utaPrivatePostAccountModeAccountModifyLeverageMarginCross)
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
function __ccxt_doc_Kucoin_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-server-time
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Kucoin_fetchTime

function __ccxt_doc_Kucoin_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-service-status
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-service-status
see: https://www.kucoin.com/docs-new/rest/ua/get-service-status

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: spot or swap
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.tradeType`::string, optional: *uta only* set to SPOT or FUTURES

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Kucoin_fetchStatus

function __ccxt_doc_Kucoin_fetchMarkets() end
"""
retrieves data on all markets for kucoin
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-symbols
see: https://www.kucoin.com/docs-new/rest/ua/get-symbol
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-symbols

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Kucoin_fetchMarkets

function __ccxt_doc_Kucoin_loadMigrationStatus() end
"""
loads the migration status for the account (hf or not)
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-type-spot

# Arguments
- `force`::bool: load account state for non hf

# Returns
- ignore
"""
__ccxt_doc_Kucoin_loadMigrationStatus

function __ccxt_doc_Kucoin_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-currencies
see: https://www.kucoin.com/docs-new/rest/ua/get-currencies

# Arguments
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Kucoin_fetchCurrencies

function __ccxt_doc_Kucoin_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-list-spot

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Kucoin_fetchAccounts

function __ccxt_doc_Kucoin_fetchTransactionFee() end
"""
*DEPRECATED* please use fetchDepositWithdrawFee instead
see: https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-quotas

# Arguments
- `code`::string: unified currency code
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Kucoin_fetchTransactionFee

function __ccxt_doc_Kucoin_fetchDepositWithdrawFee() end
"""
fetch the fee for deposits and withdrawals
see: https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-quotas

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: The chain of currency. This only apply for multi-chain currency, and there is no need for single chain currency; you can query the chain through the response of the GET /api/v2/currencies/{currency} interface

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Kucoin_fetchDepositWithdrawFee

function __ccxt_doc_Kucoin_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-tickers
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-tickers
see: https://www.kucoin.com/docs-new/rest/ua/get-ticker

# Arguments
- `symbols`::any, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.type`::string, optional: spot or swap (default is spot)
- `params.method`::string, optional: *swap only* the method to use, futuresPublicGetContractsActive or futuresPublicGetAllTickers (default is futuresPublicGetContractsActive)

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Kucoin_fetchTickers

function __ccxt_doc_Kucoin_fetchMarkPrices() end
"""
fetches the mark price for multiple markets
see: https://www.kucoin.com/docs-new/rest/margin-trading/market-data/get-mark-price-list

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Kucoin_fetchMarkPrices

function __ccxt_doc_Kucoin_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-24hr-stats
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-ticker
see: https://www.kucoin.com/docs-new/rest/ua/get-ticker

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Kucoin_fetchTicker

function __ccxt_doc_Kucoin_fetchMarkPrice() end
"""
fetches the mark price for a specific market
see: https://www.kucoin.com/docs-new/rest/margin-trading/market-data/get-mark-price-detail
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-mark-price

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Kucoin_fetchMarkPrice

function __ccxt_doc_Kucoin_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-klines
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-klines
see: https://www.kucoin.com/docs-new/rest/ua/get-klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Kucoin_fetchOHLCV

function __ccxt_doc_Kucoin_fetchUTAOHLCV() end
"""
helper method for fetchOHLCV
see: https://www.kucoin.com/docs-new/rest/ua/get-klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Kucoin_fetchUTAOHLCV

function __ccxt_doc_Kucoin_fetchSpotOHLCV() end
"""
helper method for fetchOHLCV
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Kucoin_fetchSpotOHLCV

function __ccxt_doc_Kucoin_fetchContractOHLCV() end
"""
helper method for fetchOHLCV
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-klines

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Kucoin_fetchContractOHLCV

function __ccxt_doc_Kucoin_createDepositAddress() end
"""
create a currency deposit address
see: https://www.kucoin.com/docs-new/rest/account-info/deposit/add-deposit-address-v3

# Arguments
- `code`::string: unified currency code of the currency for the deposit address
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the blockchain network name

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Kucoin_createDepositAddress

function __ccxt_doc_Kucoin_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-address-v3/en
see: https://www.kucoin.com/docs-new/rest/ua/get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: the blockchain network name
- `params.accountType`::string, optional: 'main', 'contract' or 'uta' (default is 'main')
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Kucoin_fetchDepositAddress

function __ccxt_doc_Kucoin_fetchContractDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Kucoin_fetchContractDepositAddress

function __ccxt_doc_Kucoin_fetchDepositAddressesByNetwork() end
"""
fetch the deposit address for a currency associated with this account
see: https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-address-v3/en
see: https://www.kucoin.com/docs-new/rest/ua/get-deposit-address

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false

# Returns
- an array of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Kucoin_fetchDepositAddressesByNetwork

function __ccxt_doc_Kucoin_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-part-orderbook
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-full-orderbook
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-part-orderbook
see: https://www.kucoin.com/docs-new/rest/ua/get-orderbook

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Kucoin_fetchOrderBook

function __ccxt_doc_Kucoin_createOrder() end
"""
Create an order on the exchange
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-stop-order
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-stop-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-take-profit-and-stop-loss-order
see: https://www.kucoin.com/docs-new/rest/ua/place-order

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false Check createSpotOrder(), createContractOrder() and createUtaOrder () for more details on the extra parameters that can be used in params

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_createOrder

function __ccxt_doc_Kucoin_createSpotOrder() end
"""
helper method for creating spot orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-stop-order
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-stop-order

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.marginMode`::string, optional: 'cross', // cross (cross mode) and isolated (isolated mode), set to cross by default, the isolated mode will be released soon, stay tuned
- `params.timeInForce`::string, optional: GTC, GTT, IOC, or FOK, default is GTC, limit orders only
- `params.postOnly`::bool, optional: Post only flag, invalid when timeInForce is IOC or FOK EXCHANGE SPECIFIC PARAMETERS
- `params.clientOid`::string, optional: client order id, defaults to uuid if not passed
- `params.remark`::string, optional: remark for the order, length cannot exceed 100 utf8 characters
- `params.tradeType`::string, optional: 'TRADE', // TRADE, MARGIN_TRADE // not used with margin orders limit orders ---------------------------------------------------
- `params.cancelAfter`::float, optional: long, // cancel after n seconds, requires timeInForce to be GTT
- `params.hidden`::bool, optional: false, // Order will not be displayed in the order book
- `params.iceberg`::bool, optional: false, // Only a portion of the order is displayed in the order book
- `params.visibleSize`::string, optional: this.amountToPrecision (symbol, visibleSize), // The maximum visible size of an iceberg order market orders --------------------------------------------------
- `params.funds`::string, optional: // Amount of quote currency to use stop orders ----------------------------------------------------
- `params.stop`::string, optional: Either loss or entry, the default is loss. Requires triggerPrice to be defined margin orders --------------------------------------------------
- `params.leverage`::float, optional: Leverage size of the order
- `params.stp`::string, optional: '', // self trade prevention, CN, CO, CB or DC
- `params.autoBorrow`::bool, optional: false, // The system will first borrow you funds at the optimal interest rate and then place an order for you
- `params.hf`::bool, optional: false, // true for hf order
- `params.test`::bool, optional: set to true to test an order, no order will be created but the request will be validated
- `params.sync`::bool, optional: set to true to use the hf sync call

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_createSpotOrder

function __ccxt_doc_Kucoin_createContractOrder() end
"""
helper method for creating contract orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-take-profit-and-stop-loss-order

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.takeProfit`::object, optional: *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType
- `params.stopLoss`::object, optional: *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at
- `params.stopLossPrice`::float, optional: price to trigger stop-loss orders
- `params.takeProfitPrice`::float, optional: price to trigger take-profit orders
- `params.reduceOnly`::bool, optional: A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
- `params.timeInForce`::string, optional: GTC, GTT, IOC, or FOK, default is GTC, limit orders only
- `params.postOnly`::bool, optional: Post only flag, invalid when timeInForce is IOC or FOK
- `params.cost`::float, optional: the cost of the order in units of USDT
- `params.marginMode`::string, optional: 'cross' or 'isolated', default is 'isolated'
- `params.hedged`::bool, optional: *swap and future only* true for hedged mode, false for one way mode, default is false ----------------- Exchange Specific Parameters -----------------
- `params.leverage`::float, optional: Leverage size of the order (mandatory param in request, default is 1)
- `params.clientOid`::string, optional: client order id, defaults to uuid if not passed
- `params.remark`::string, optional: remark for the order, length cannot exceed 100 utf8 characters
- `params.stop`::string, optional: 'up' or 'down', the direction the triggerPrice is triggered from, requires triggerPrice. down: Triggers when the price reaches or goes below the triggerPrice. up: Triggers when the price reaches or goes above the triggerPrice.
- `params.triggerPriceType`::string, optional: "last", "mark", "index" - defaults to "mark"
- `params.stopPriceType`::string, optional: exchange-specific alternative for triggerPriceType: TP, IP or MP
- `params.closeOrder`::bool, optional: set to true to close position
- `params.test`::bool, optional: set to true to use the test order endpoint (does not submit order, use to validate params)
- `params.forceHold`::bool, optional: A mark to forcely hold the funds for an order, even though it's an order to reduce the position size. This helps the order stay on the order book and not get canceled when the position size changes. Set to false by default.\
- `params.positionSide`::string, optional: *swap and future only* hedged two-way position side, LONG or SHORT

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_createContractOrder

function __ccxt_doc_Kucoin_createUtaOrder() end
"""
helper method for creating uta orders
see: https://www.kucoin.com/docs-new/rest/ua/place-order

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `type`::string: 'limit' or 'market'
- `side`::string: 'buy' or 'sell'
- `amount`::float: the amount of currency to trade
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, defaults to uuid if not passed
- `params.cost`::float, optional: the cost of the order in units of quote currency
- `params.timeInForce`::string, optional: GTC, GTD, IOC, FOK or PO
- `params.postOnly`::bool, optional: Post only flag, invalid when timeInForce is IOC or FOK (default is false)
- `params.reduceOnly`::bool, optional: *contract markets only* A mark to reduce the position size only. Set to false by default
- `params.triggerPrice`::float, optional: The price a trigger order is triggered at
- `params.triggerDirection`::string, optional: 'ascending' or 'descending', the direction the triggerPrice is triggered from, requires triggerPrice
- `params.triggerPriceType`::string, optional: *contract markets only* "last", "mark", "index" - defaults to "mark"
- `params.stopLossPrice`::float, optional: price to trigger stop-loss orders
- `params.takeProfitPrice`::float, optional: price to trigger take-profit orders
- `params.marginMode`::string, optional: 'cross' or 'isolated', (default is 'cross' for margin orders, default is 'isolated' for contract orders) Exchange-specific parameters -------------------------------------------------
- `params.accountMode`::string, optional: 'unified' or 'classic', default is 'unified'
- `params.stp`::string, optional: '', // self trade prevention, CN, CO, CB or DC
- `params.cancelAfter`::int, optional: - Cancel After N Seconds (Calculated from the time of entering the matching engine), only effective when timeInForce is GTD
- `params.sizeUnit`::string, optional: *contracts only* 'BASECCY' (amount of base currency) or 'UNIT' (number of contracts), default is 'UNIT' Classic account parameters
- `params.autoBorrow`::bool, optional: *classic margin orders only*
- `params.autoRepay`::bool, optional: *classic margin orders only*
- `params.hedged`::string, optional: *classic contract orders only* true for hedged mode, false for one way mode, default is false
- `params.leverage`::int, optional: *classic contract orders with isolated marginMode only* Leverage size of the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_createUtaOrder

function __ccxt_doc_Kucoin_createMarketOrderWithCost() end
"""
create a market order by providing the symbol, side and cost
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `side`::string: 'buy' or 'sell'
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_createMarketOrderWithCost

function __ccxt_doc_Kucoin_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_createMarketBuyOrderWithCost

function __ccxt_doc_Kucoin_createMarketSellOrderWithCost() end
"""
create a market sell order by providing the symbol and cost
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_createMarketSellOrderWithCost

function __ccxt_doc_Kucoin_createOrders() end
"""
create a list of trade orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders-sync

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint Check createSpotOrders() and createContractOrders() for more details on the extra parameters that can be used in params

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_createOrders

function __ccxt_doc_Kucoin_createSpotOrders() end
"""
helper method for creating spot orders in batch
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders-sync
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/batch-add-orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.hf`::bool, optional: false, // true for hf orders
- `params.sync`::bool, optional: false, // true to use the hf sync call

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_createSpotOrders

function __ccxt_doc_Kucoin_createContractOrders() end
"""
helper method for creating contract orders in batch
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/batch-add-orders

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_createContractOrders

function __ccxt_doc_Kucoin_editOrder() end
"""
edit an order, kucoin currently only supports the modification of HF orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/modify-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: not used
- `side`::string: not used
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id, defaults to id if not passed

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_editOrder

function __ccxt_doc_Kucoin_cancelOrder() end
"""
cancels an open order
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/ua/cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.marginMode`::string, optional: *spot only* 'cross' or 'isolated'
- `params.uta`::bool, optional: true for cancelling order with unified account endpoint (default is false) Check cancelSpotOrder() and cancelContractOrder() for more details on the extra parameters that can be used in params

# Returns
- Response from the exchange
"""
__ccxt_doc_Kucoin_cancelOrder

function __ccxt_doc_Kucoin_cancelSpotOrder() end
"""
helper method for cancelling spot orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid-sync
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-clientoid

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: True if cancelling a stop order
- `params.hf`::bool, optional: false, // true for hf order
- `params.sync`::bool, optional: false, // true to use the hf sync call
- `params.marginMode`::string, optional: 'cross' or 'isolated'

# Returns
- Response from the exchange
"""
__ccxt_doc_Kucoin_cancelSpotOrder

function __ccxt_doc_Kucoin_cancelContractOrder() end
"""
helper method for cancelling contract orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-clientoid

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: cancel order by client order id

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_cancelContractOrder

function __ccxt_doc_Kucoin_cancelUtaOrder() end
"""
helper method for cancelling uta orders
see: https://www.kucoin.com/docs-new/rest/ua/cancel-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountMode`::string, optional: 'unified' or 'classic' (default is 'unified')
- `params.clientOrderId`::string, optional: client order id, required if id is not provided
- `params.marginMode`::string, optional: 'cross' or 'isolated', required if fetching a margin order (unified accountMode supports only cross margin)

# Returns
- Response from the exchange
"""
__ccxt_doc_Kucoin_cancelUtaOrder

function __ccxt_doc_Kucoin_cancelAllOrders() end
"""
cancel all open orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders-by-symbol
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-cancel-stop-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-all-orders-by-symbol
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/batch-cancel-stop-orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-stop-orders
see: https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-symbol

# Arguments
- `symbol`::string, optional: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.marginMode`::string, optional: *spot only* 'cross' or 'isolated'
- `params.uta`::bool, optional: true for cancelling orders with unified account endpoint (default is false) Check cancelAllSpotOrders(), cancelAllContractOrders() and cancelAllUtaOrders() for more details on the extra parameters that can be used in params

# Returns
- Response from the exchange
"""
__ccxt_doc_Kucoin_cancelAllOrders

function __ccxt_doc_Kucoin_cancelAllSpotOrders() end
"""
helper method for cancelling all spot orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders-by-symbol
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-cancel-stop-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-all-orders-by-symbol
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/batch-cancel-stop-orders

# Arguments
- `symbol`::string: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: *invalid for isolated margin* true if cancelling all stop orders
- `params.marginMode`::string, optional: 'cross' or 'isolated'
- `params.orderIds`::string, optional: *stop orders only* Comma separated order IDs
- `params.hf`::bool, optional: false, // true for hf order

# Returns
- Response from the exchange
"""
__ccxt_doc_Kucoin_cancelAllSpotOrders

function __ccxt_doc_Kucoin_cancelAllContractOrders() end
"""
helper method for cancelling all contract orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-orders
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-stop-orders

# Arguments
- `symbol`::string: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::object, optional: When true, all the trigger orders will be cancelled

# Returns
- Response from the exchange
"""
__ccxt_doc_Kucoin_cancelAllContractOrders

function __ccxt_doc_Kucoin_cancelAllUtaOrders() end
"""
helper method for cancelling all uta orders
see: https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-symbol

# Arguments
- `symbol`::string: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: true if cancelling all stop orders
- `params.marginMode`::string, optional: 'CROSS' or 'ISOLATED'

# Returns
- Response from the exchange
"""
__ccxt_doc_Kucoin_cancelAllUtaOrders

function __ccxt_doc_Kucoin_fetchOrdersByStatus() end
"""
fetches a list of orders placed on the exchange
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
see: https://www.kucoin.com/docs-new/rest/ua/get-open-order-list
see: https://www.kucoin.com/docs-new/rest/ua/get-order-history

# Arguments
- `status`::string: 'active' or 'closed', only 'active' is valid for stop orders
- `symbol`::string: unified symbol for the market to retrieve orders from
- `since`::int, optional: timestamp in ms of the earliest order to retrieve
- `limit`::int, optional: The maximum number of orders to retrieve
- `params`::object, optional: exchange specific parameters
- `params.uta`::bool, optional: true for fetch orders with uta endpoint (default is false) Check fetchSpotOrdersByStatus(), fetchContractOrdersByStatus() and fetchUtaOrdersByStatus() for more details on the extra parameters that can be used in params

# Returns
- An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_fetchOrdersByStatus

function __ccxt_doc_Kucoin_fetchSpotOrdersByStatus() end
"""
fetch a list of spot orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list

# Arguments
- `status`::string: *not used for stop orders* 'open' or 'closed'
- `symbol`::string: unified market symbol
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: max number of orders to return
- `params`::object, optional: exchange specific params
- `params.until`::int, optional: end time in ms
- `params.side`::string, optional: buy or sell
- `params.type`::string, optional: limit, market, limit_stop or market_stop
- `params.tradeType`::string, optional: TRADE for spot trading, MARGIN_TRADE or MARGIN_ISOLATED_TRADE for Margin Trading
- `params.currentPage`::int, optional: *trigger orders only* current page
- `params.orderIds`::string, optional: *trigger orders only* comma separated order ID list
- `params.trigger`::bool, optional: True if fetching a trigger order
- `params.hf`::bool, optional: false, // true for hf order
- `params.marginMode`::string, optional: 'cross' or 'isolated', only for margin orders

# Returns
- An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_fetchSpotOrdersByStatus

function __ccxt_doc_Kucoin_fetchContractOrdersByStatus() end
"""
fetches a list of contract orders placed on the exchange
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list

# Arguments
- `status`::string: 'active' or 'closed', only 'active' is valid for stop orders
- `symbol`::string: unified symbol for the market to retrieve orders from
- `since`::int, optional: timestamp in ms of the earliest order to retrieve
- `limit`::int, optional: The maximum number of orders to retrieve
- `params`::object, optional: exchange specific parameters
- `params.trigger`::bool, optional: set to true to retrieve untriggered stop orders
- `params.until`::int, optional: End time in ms
- `params.side`::string, optional: buy or sell
- `params.type`::string, optional: limit or market
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_fetchContractOrdersByStatus

function __ccxt_doc_Kucoin_fetchUtaOrdersByStatus() end
"""
helper method for fetching orders by status with uta endpoint
see: https://www.kucoin.com/docs-new/rest/ua/get-open-order-list
see: https://www.kucoin.com/docs-new/rest/ua/get-order-history

# Arguments
- `status`::string: 'active' or 'closed', only 'active' is valid for stop orders
- `symbol`::string: unified symbol for the market to retrieve orders from
- `since`::int, optional: timestamp in ms of the earliest order to retrieve
- `limit`::int, optional: The maximum number of orders to retrieve
- `params`::object, optional: exchange specific parameters
- `params.until`::int, optional: End time in ms
- `params.side`::string, optional: *closed orders only* 'BUY' or 'SELL'
- `params.accountMode`::string, optional: 'unified' or 'classic' (default is unified)
- `params.marginMode`::string, optional: 'cross' or 'isolated', only for margin orders (unified accountMode supports only cross margin)
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_fetchUtaOrdersByStatus

function __ccxt_doc_Kucoin_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/ua/get-order-history

# Arguments
- `symbol`::string: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in ms
- `params.side`::string, optional: buy or sell
- `params.type`::string, optional: limit, market, limit_stop or market_stop
- `params.tradeType`::string, optional: TRADE for spot trading, MARGIN_TRADE for Margin Trading
- `params.trigger`::bool, optional: True if fetching a trigger order
- `params.hf`::bool, optional: false, // true for hf order
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_fetchClosedOrders

function __ccxt_doc_Kucoin_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
see: https://www.kucoin.com/docs-new/rest/ua/get-open-order-list

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch open orders for
- `limit`::int, optional: the maximum number of  open orders structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in ms
- `params.trigger`::bool, optional: true if fetching trigger orders
- `params.side`::string, optional: buy or sell
- `params.type`::string, optional: limit, market, limit_stop or market_stop
- `params.tradeType`::string, optional: TRADE for spot trading, MARGIN_TRADE for Margin Trading
- `params.currentPage`::int, optional: *trigger orders only* current page
- `params.orderIds`::string, optional: *trigger orders only* comma separated order ID list
- `params.hf`::bool, optional: false, // true for hf order
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_fetchOpenOrders

function __ccxt_doc_Kucoin_fetchOrder() end
"""
fetches information on an order made by the user
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/get-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/futures-trading/get-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/ua/get-order-details

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.uta`::bool, optional: true if fetching an order with uta endpoint (default is false) Check fetchSpotOrder(), fetchContractOrder() and fetchUtaOrder() for more details on the extra parameters that can be used in params

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_fetchOrder

function __ccxt_doc_Kucoin_fetchSpotOrder() end
"""
fetch a spot order
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/spot-trading/get-stop-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-clientoid
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-clientoid

# Arguments
- `id`::string: Order id
- `symbol`::string: not sent to exchange except for trigger orders with clientOid, but used internally by CCXT to filter
- `params`::object, optional: exchange specific parameters
- `params.trigger`::bool, optional: true if fetching a trigger order
- `params.hf`::bool, optional: false, // true for hf order
- `params.clientOid`::bool, optional: unique order id created by users to identify their orders
- `params.marginMode`::object, optional: 'cross' or 'isolated'

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_fetchSpotOrder

function __ccxt_doc_Kucoin_fetchContractOrder() end
"""
fetc contract order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-by-orderld
see: https://www.kucoin.com/docs-new/rest/futures-trading/get-stop-order-by-clientoid

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_fetchContractOrder

function __ccxt_doc_Kucoin_fetchUtaOrder() end
"""
fetch uta order
see: https://www.kucoin.com/docs-new/rest/ua/get-order-details

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountMode`::string, optional: 'unified' or 'classic' (default is 'unified')
- `params.clientOrderId`::string, optional: client order id, required if id is not provided
- `params.marginMode`::string, optional: 'cross' or 'isolated', required if fetching a margin order (unified accountMode supports only cross margin)

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_fetchUtaOrder

function __ccxt_doc_Kucoin_fetchOrderTrades() end
"""
fetch all the trades made from a single order
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/ua/get-trade-history

# Arguments
- `id`::string: order id
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot')
- `params.uta`::bool, optional: set to true if fetching trades from uta endpoint, default is false.

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Kucoin_fetchOrderTrades

function __ccxt_doc_Kucoin_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/ua/get-trade-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.type`::string, optional: 'spot' or 'swap', used if symbol is not provided (default is 'spot') Check fetchMySpotTrades() and fetchMyContractTrades() for more details on the extra parameters that can be used in params

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Kucoin_fetchMyTrades

function __ccxt_doc_Kucoin_fetchMySpotTrades() end
"""
fetch all spot trades made by the user
see: https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
see: https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.hf`::bool, optional: false, // true for hf order
- `params.marginMode`::string, optional: 'cross' or 'isolated', only for margin trades
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Kucoin_fetchMySpotTrades

function __ccxt_doc_Kucoin_fetchMyContractTrades() end
"""
fetch all contract trades made by the user
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-trade-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: End time in ms
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Kucoin_fetchMyContractTrades

function __ccxt_doc_Kucoin_fetchMyUtaTrades() end
"""
fetch all trades made by the user
see: https://www.kucoin.com/docs-new/rest/ua/get-trade-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum number of trades structures to retrieve (default is 50, max is 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.accountMode`::string, optional: 'unified' or 'classic', defaults to 'unified'
- `params.marginMode`::string, optional: 'cross' or 'isolated', only for margin trades (unified accountMode support only cross margin)
- `params.side`::string, optional: 'BUY' or 'SELL' (both if not provided)
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
"""
__ccxt_doc_Kucoin_fetchMyUtaTrades

function __ccxt_doc_Kucoin_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-trade-history
see: https://www.kucoin.com/docs-new/rest/ua/get-trades
see: https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-trade-history

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Kucoin_fetchTrades

function __ccxt_doc_Kucoin_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://www.kucoin.com/docs-new/rest/account-info/trade-fee/get-actual-fee-spot-margin
see: https://www.kucoin.com/docs-new/rest/account-info/trade-fee/get-actual-fee-futures
see: https://www.kucoin.com/docs-new/rest/ua/get-actual-fee

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Kucoin_fetchTradingFee

function __ccxt_doc_Kucoin_withdraw() end
"""
make a withdrawal
see: https://www.kucoin.com/docs-new/rest/account-info/withdrawals/withdraw-v3

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Kucoin_withdraw

function __ccxt_doc_Kucoin_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-history
see: https://www.kucoin.com/docs-new/abandoned-endpoints/account-funding/get-deposit-history-old

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: *main account only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.accountType`::string, optional: 'main' or 'contract' (default is 'main')

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Kucoin_fetchDeposits

function __ccxt_doc_Kucoin_fetchContractDeposits() end
"""
helper method for fetching deposits for futures accounts

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of deposits structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Kucoin_fetchContractDeposits

function __ccxt_doc_Kucoin_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-history
see: https://www.kucoin.com/docs-new/abandoned-endpoints/account-funding/get-withdrawal-history-old

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: *main account only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
- `params.accountType`::string, optional: 'main' or 'contract' (default is 'main')

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Kucoin_fetchWithdrawals

function __ccxt_doc_Kucoin_fetchContractWithdrawals() end
"""
helper method for fetching withdrawals for futures accounts

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of withdrawals structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Kucoin_fetchContractWithdrawals

function __ccxt_doc_Kucoin_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-detail-spot
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-cross-margin
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-isolated-margin
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-futures
see: https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-uta
see: https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-classic

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::object, optional: 'cross' or 'isolated', margin type for fetching margin balance
- `params.type`::object, optional: extra parameters specific to the exchange API endpoint
- `params.hf`::object, optional: *default if false* if true, the result includes the balance of the high frequency account
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Kucoin_fetchBalance

function __ccxt_doc_Kucoin_fetchContractBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-futures

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.code`::object, optional: the unified currency code to fetch the balance for, if not provided, the default .options['fetchBalance']['code'] will be used

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Kucoin_fetchContractBalance

function __ccxt_doc_Kucoin_fetchUtaBalance() end
"""
helper method for fetching balance with unified trading account (uta) endpoint
see: https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-uta
see: https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-classic

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'unified', 'spot', 'funding', 'cross', 'isolated' or 'swap' (default is 'unified')
- `params.marginMode`::string, optional: 'cross' or 'isolated', margin type for fetching margin balance, only applicable if type is margin (default is cross)

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Kucoin_fetchUtaBalance

function __ccxt_doc_Kucoin_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://www.kucoin.com/docs-new/rest/account-info/transfer/flex-transfer?lang=en_US&
see: https://www.kucoin.com/docs-new/rest/ua/flex-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta) endpoint, defaults to false Check transferClassic() and transferUta() for more details on params

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Kucoin_transfer

function __ccxt_doc_Kucoin_transferUta() end
"""
transfer currency internally between wallets on the same account with uta endpoint
see: https://www.kucoin.com/docs-new/rest/ua/flex-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transferType`::string, optional: INTERNAL, PARENT_TO_SUB, SUB_TO_PARENT, SUB_TO_SUB (default is INTERNAL)
- `params.fromUserId`::string, optional: required if transferType is SUB_TO_PARENT or SUB_TO_SUB
- `params.toUserId`::string, optional: required if transferType is PARENT_TO_SUB or SUB_TO_SUB

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Kucoin_transferUta

function __ccxt_doc_Kucoin_transferClassic() end
"""
transfer currency internally between wallets on the same account with classic endpoints
see: https://www.kucoin.com/docs-new/rest/account-info/transfer/flex-transfer?lang=en_US&

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.transferType`::string, optional: INTERNAL, PARENT_TO_SUB, SUB_TO_PARENT (default is INTERNAL)
- `params.fromUserId`::string, optional: required if transferType is SUB_TO_PARENT
- `params.toUserId`::string, optional: required if transferType is PARENT_TO_SUB

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Kucoin_transferClassic

function __ccxt_doc_Kucoin_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-spot-margin
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-tradehf
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-marginhf
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-futures
see: https://www.kucoin.com/docs-new/rest/ua/get-account-ledger

# Arguments
- `code`::string, optional: unified currency code, default is undefined
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::object, optional: extra parameters specific to the exchange API endpoint
- `params.hf`::bool, optional: default false, when true will fetch ledger entries for the high frequency trading account
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.uta`::bool, optional: default false, when true will fetch ledger entries for the unified trading account (UTA) instead of the regular accounts endpoint
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Kucoin_fetchLedger

function __ccxt_doc_Kucoin_fetchBorrowInterest() end
"""
fetch the interest owed by the user for borrowing currency for margin trading
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-cross-margin
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-isolated-margin

# Arguments
- `code`::string, optional: unified currency code
- `symbol`::string, optional: unified market symbol, required for isolated margin
- `since`::int, optional: the earliest time in ms to fetch borrrow interest for
- `limit`::int, optional: the maximum number of structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' default is 'cross'

# Returns
- a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
"""
__ccxt_doc_Kucoin_fetchBorrowInterest

function __ccxt_doc_Kucoin_fetchBorrowRateHistories() end
"""
retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/get-interest-history

# Arguments
- `codes`::any: list of unified currency codes, default is undefined
- `since`::int, optional: timestamp in ms of the earliest borrowRate, default is undefined
- `limit`::int, optional: max number of borrow rate prices to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' default is 'cross'
- `params.until`::int, optional: the latest time in ms to fetch entries for

# Returns
- a dictionary of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} indexed by the market symbol
"""
__ccxt_doc_Kucoin_fetchBorrowRateHistories

function __ccxt_doc_Kucoin_fetchBorrowRateHistory() end
"""
retrieves a history of a currencies borrow interest rate at specific time slots
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/get-interest-history

# Arguments
- `code`::string: unified currency code
- `since`::int, optional: timestamp for the earliest borrow rate
- `limit`::int, optional: the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.marginMode`::string, optional: 'cross' or 'isolated' default is 'cross'
- `params.until`::int, optional: the latest time in ms to fetch entries for

# Returns
- an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
__ccxt_doc_Kucoin_fetchBorrowRateHistory

function __ccxt_doc_Kucoin_fetchCrossBorrowRate() end
"""
fetch the rate of interest to borrow a currency for margin trading
see: https://www.kucoin.com/docs-new/rest/ua/get-borrowing-rates-and-limits

# Arguments
- `code`::string: unified currency code
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [borrow rate structure]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
"""
__ccxt_doc_Kucoin_fetchCrossBorrowRate

function __ccxt_doc_Kucoin_borrowCrossMargin() end
"""
create a loan to borrow margin
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/borrow

# Arguments
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoints
- `params.timeInForce`::string, optional: either IOC or FOK

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Kucoin_borrowCrossMargin

function __ccxt_doc_Kucoin_borrowIsolatedMargin() end
"""
create a loan to borrow margin
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/borrow

# Arguments
- `symbol`::string: unified market symbol, required for isolated margin
- `code`::string: unified currency code of the currency to borrow
- `amount`::float: the amount to borrow
- `params`::object, optional: extra parameters specific to the exchange API endpoints
- `params.timeInForce`::string, optional: either IOC or FOK

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Kucoin_borrowIsolatedMargin

function __ccxt_doc_Kucoin_repayCrossMargin() end
"""
repay borrowed margin and interest
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/repay

# Arguments
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoints

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Kucoin_repayCrossMargin

function __ccxt_doc_Kucoin_repayIsolatedMargin() end
"""
repay borrowed margin and interest
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/repay

# Arguments
- `symbol`::string: unified market symbol
- `code`::string: unified currency code of the currency to repay
- `amount`::float: the amount to repay
- `params`::object, optional: extra parameters specific to the exchange API endpoints

# Returns
- a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
"""
__ccxt_doc_Kucoin_repayIsolatedMargin

function __ccxt_doc_Kucoin_fetchDepositWithdrawFees() end
"""
fetch deposit and withdraw fees - *IMPORTANT* use fetchDepositWithdrawFee to get more in-depth info
see: https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-currencies

# Arguments
- `codes`::any: list of unified currency codes
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Kucoin_fetchDepositWithdrawFees

function __ccxt_doc_Kucoin_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-cross-margin-leverage

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Kucoin_fetchLeverage

function __ccxt_doc_Kucoin_setLeverage() end
"""
set the level of leverage for a market
see: https://www.kucoin.com/docs-new/rest/margin-trading/debit/modify-leverage // margin
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/modify-cross-margin-leverage // contract
see: https://www.kucoin.com/docs-new/rest/ua/modify-cross-margin-leverage-uta // margin uta
see: https://www.kucoin.com/docs-new/rest/ua/modify-leverage-uta // contract uta

# Arguments
- `leverage`::int, optional: New leverage multiplier. Must be greater than 1 and up to two decimal places, and cannot be less than the user's current debt leverage or greater than the system's maximum leverage
- `symbol`::string, optional: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta)
- `params.marginMode`::string, optional: *spot non-uta only* 'cross' or 'isolated' default is 'cross'
- `params.code`::string, optional: *uta margin only* the unified currency code for the margin to set the leverage for

# Returns
- response from the exchange
"""
__ccxt_doc_Kucoin_setLeverage

function __ccxt_doc_Kucoin_setContractLeverage() end
"""
set the level of leverage for a market
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/modify-cross-margin-leverage
see: https://www.kucoin.com/docs-new/rest/ua/modify-leverage-uta

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta)

# Returns
- response from the exchange
"""
__ccxt_doc_Kucoin_setContractLeverage

function __ccxt_doc_Kucoin_fetchFundingInterval() end
"""
fetch the current funding rate interval
see: https://www.kucoin.com/docs-new/rest/ua/get-current-funding-rate
see: https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-current-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Kucoin_fetchFundingInterval

function __ccxt_doc_Kucoin_fetchFundingRate() end
"""
fetch the current funding rate
see: https://www.kucoin.com/docs-new/rest/ua/get-current-funding-rate
see: https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-current-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta)

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Kucoin_fetchFundingRate

function __ccxt_doc_Kucoin_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-public-funding-history
see: https://www.kucoin.com/docs-new/rest/ua/get-history-funding-rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: not used by kucuoinfutures
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: end time in ms
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to true

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Kucoin_fetchFundingRateHistory

function __ccxt_doc_Kucoin_fetchFundingHistory() end
"""
fetch the history of funding payments paid and received on this account
see: https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-private-funding-history

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the earliest time in ms to fetch funding history for
- `limit`::int, optional: the maximum number of funding history structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Kucoin_fetchFundingHistory

function __ccxt_doc_Kucoin_fetchPosition() end
"""
fetch data on an open position
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-details
see: https://www.kucoin.com/docs-new/rest/ua/get-position-list-uta

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.pageSize`::integer, optional: *uta only* page size for the uta endpoint (default 50, max 200)
- `params.pageNumber`::integer, optional: *uta only* page number for the uta endpoint (default 1)

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Kucoin_fetchPosition

function __ccxt_doc_Kucoin_fetchPositions() end
"""
fetch all open positions
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-list
see: https://www.kucoin.com/docs-new/rest/ua/get-position-list-uta

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false
- `params.pageSize`::integer, optional: *uta only* page size for the uta endpoint (default 50, max 200)
- `params.pageNumber`::integer, optional: *uta only* page number for the uta endpoint (default 1)

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Kucoin_fetchPositions

function __ccxt_doc_Kucoin_fetchPositionsHistory() end
"""
fetches historical positions
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-positions-history
see: https://www.kucoin.com/docs-new/rest/ua/get-position-history-uta

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `since`::int, optional: the earliest time in ms to fetch position history for
- `limit`::int, optional: the maximum number of entries to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: closing end time
- `params.pageId`::int, optional: page id
- `params.uta`::bool, optional: set to true for the unified trading account (uta), defaults to false

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Kucoin_fetchPositionsHistory

function __ccxt_doc_Kucoin_cancelOrders() end
"""
cancel multiple orders for contract markets
see: https://www.kucoin.com/docs-new/3470241e0
see: https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-id

# Arguments
- `ids`::array: order ids
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderIds`::array, optional: client order ids
- `params.uta`::bool, optional: set to true to use the unified trading account (uta) endpoint, defaults to false for the contract orders
- `params.accountMode`::string, optional: *for uta endpoint only* 'unified' or 'classic' (default is 'unified')
- `params.marginMode`::string, optional: *for margin orders only* 'cross' or 'isolated' (unified accountMode supports cross margin only)

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Kucoin_cancelOrders

function __ccxt_doc_Kucoin_addMargin() end
"""
add margin
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/add-isolated-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string, optional: *required for hedged position* 'BOTH', 'LONG' or 'SHORT' (default is 'BOTH')

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Kucoin_addMargin

function __ccxt_doc_Kucoin_reduceMargin() end
"""
remove margin from a position
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/remove-isolated-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string, optional: *required for hedged position* 'BOTH', 'LONG' or 'SHORT' (default is 'BOTH')

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Kucoin_reduceMargin

function __ccxt_doc_Kucoin_fetchMarginMode() end
"""
fetches the margin mode of a trading pair
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-margin-mode

# Arguments
- `symbol`::string: unified symbol of the market to fetch the margin mode for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
"""
__ccxt_doc_Kucoin_fetchMarginMode

function __ccxt_doc_Kucoin_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/switch-margin-mode

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Kucoin_setMarginMode

function __ccxt_doc_Kucoin_setPositionMode() end
"""
set hedged to true or false for a market
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/switch-position-mode

# Arguments
- `hedged`::bool: set to true to use two way position
- `symbol`::string, optional: not used by setPositionMode ()
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a response from the exchange
"""
__ccxt_doc_Kucoin_setPositionMode

function __ccxt_doc_Kucoin_fetchPositionMode() end
"""
fetchs the position mode, hedged or one way
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-mode

# Arguments
- `symbol`::string, optional: unified symbol of the market to fetch the position mode for (not used in blofin fetchPositionMode)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an object detailing whether the market is in hedged or one-way mode
"""
__ccxt_doc_Kucoin_fetchPositionMode

function __ccxt_doc_Kucoin_closePosition() end
"""
closes open positions for a market
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
see: https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `side`::string: not used by kucoin closePositions
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: client order id of the order

# Returns
- [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Kucoin_closePosition

function __ccxt_doc_Kucoin_fetchMarketLeverageTiers() end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-isolated-margin-risk-limit

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.uta`::bool, optional: set to true to fetch leverage tiers for unified trading account instead of futures account (default is false)

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
__ccxt_doc_Kucoin_fetchMarketLeverageTiers

function __ccxt_doc_Kucoin_fetchLeverageTiers() end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
see: https://www.kucoin.com/docs-new/rest/ua/get-position-tiers

# Arguments
- `symbols`::array: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
__ccxt_doc_Kucoin_fetchLeverageTiers

function __ccxt_doc_Kucoin_fetchOpenInterests() end
"""
Retrieves the open interest for a list of symbols
see: https://www.kucoin.com/docs-new/rest/ua/get-futures-open-interset

# Arguments
- `symbols`::array, optional: Unified CCXT market symbol
- `params`::object, optional: exchange specific parameters

# Returns
- an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Kucoin_fetchOpenInterests

function __ccxt_doc_Kucoin_fetchOpenInterestHistory() end
"""
Retrieves the open interest history of a currency
see: https://www.kucoin.com/docs-new/rest/ua/get-futures-open-interset

# Arguments
- `symbol`::string: Unified CCXT market symbol
- `timeframe`::string: '5m', '15m', '30m', '1h', '4h' or '1d'
- `since`::int, optional: the time(ms) of the earliest record to retrieve as a unix timestamp
- `limit`::int, optional: default 30，max 200
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- an array of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Kucoin_fetchOpenInterestHistory

function __ccxt_doc_Kucoin_isUTAEnabled() end
"""
returns true or false so the user can check if unified account is enabled
see: https://www.kucoin.com/docs-new/rest/ua/get-account-mode

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- true if unified account is enabled, false otherwise
"""
__ccxt_doc_Kucoin_isUTAEnabled

function __ccxt_doc_Kucoin_fetchTransfers() end
"""
fetch a history of internal transfers made on an account
see: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-spot-margin

# Arguments
- `code`::string, optional: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for
- `limit`::int, optional: the maximum number of transfer structures to retrieve
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch transfers for
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Kucoin_fetchTransfers

function __ccxt_doc_Kucoin_fetchPositionsADLRank() end
"""
fetches the auto deleveraging rank and risk percentage for a list of symbols
see: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-list

# Arguments
- `symbols`::array, optional: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an array of [auto de leverage structures]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
"""
__ccxt_doc_Kucoin_fetchPositionsADLRank
