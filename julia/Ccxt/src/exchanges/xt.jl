@kwdef mutable struct Xt <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    nonce::Function = nonce
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    fetchMarkets::Function = fetchMarkets
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchSwapAndFutureMarkets::Function = fetchSwapAndFutureMarkets
    parseMarkets::Function = parseMarkets
    parseMarket::Function = parseMarket
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchOrderBook::Function = fetchOrderBook
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    fetchBidsAsks::Function = fetchBidsAsks
    parseTicker::Function = parseTicker
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createOrder::Function = createOrder
    createSpotOrder::Function = createSpotOrder
    createContractOrder::Function = createContractOrder
    fetchOrder::Function = fetchOrder
    fetchOrders::Function = fetchOrders
    fetchOrdersByStatus::Function = fetchOrdersByStatus
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelOrders::Function = cancelOrders
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerEntryType::Function = parseLedgerEntryType
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    setLeverage::Function = setLeverage
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    fetchLeverageTiers::Function = fetchLeverageTiers
    parseLeverageTiers::Function = parseLeverageTiers
    fetchMarketLeverageTiers::Function = fetchMarketLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchFundingInterval::Function = fetchFundingInterval
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    fetchOpenInterest::Function = fetchOpenInterest
    parseOpenInterest::Function = parseOpenInterest
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingHistory::Function = parseFundingHistory
    indexPositionBreakList::Function = indexPositionBreakList
    mergePositionBreakInfo::Function = mergePositionBreakInfo
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
    fetchPositionsHistory::Function = fetchPositionsHistory
    parsePosition::Function = parsePosition
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    setMarginMode::Function = setMarginMode
    editOrder::Function = editOrder
    handleErrors::Function = handleErrors
    sign::Function = sign

# Generated REST endpoint fields
    publicSpotGetCurrencies::Function = publicSpotGetCurrencies
    publicSpotGetDepth::Function = publicSpotGetDepth
    publicSpotGetKline::Function = publicSpotGetKline
    publicSpotGetSymbol::Function = publicSpotGetSymbol
    publicSpotGetTicker::Function = publicSpotGetTicker
    publicSpotGetTickerBook::Function = publicSpotGetTickerBook
    publicSpotGetTickerPrice::Function = publicSpotGetTickerPrice
    publicSpotGetTicker24h::Function = publicSpotGetTicker24h
    publicSpotGetTime::Function = publicSpotGetTime
    publicSpotGetTradeHistory::Function = publicSpotGetTradeHistory
    publicSpotGetTradeRecent::Function = publicSpotGetTradeRecent
    publicSpotGetWalletSupportCurrency::Function = publicSpotGetWalletSupportCurrency
    publicLinearGetFutureMarketV1PublicContractRiskBalance::Function = publicLinearGetFutureMarketV1PublicContractRiskBalance
    publicLinearGetFutureMarketV1PublicContractOpenInterest::Function = publicLinearGetFutureMarketV1PublicContractOpenInterest
    publicLinearGetFutureMarketV1PublicLeverageBracketDetail::Function = publicLinearGetFutureMarketV1PublicLeverageBracketDetail
    publicLinearGetFutureMarketV1PublicLeverageBracketList::Function = publicLinearGetFutureMarketV1PublicLeverageBracketList
    publicLinearGetFutureMarketV1PublicQAggTicker::Function = publicLinearGetFutureMarketV1PublicQAggTicker
    publicLinearGetFutureMarketV1PublicQAggTickers::Function = publicLinearGetFutureMarketV1PublicQAggTickers
    publicLinearGetFutureMarketV1PublicQDeal::Function = publicLinearGetFutureMarketV1PublicQDeal
    publicLinearGetFutureMarketV1PublicQDepth::Function = publicLinearGetFutureMarketV1PublicQDepth
    publicLinearGetFutureMarketV1PublicQFundingRate::Function = publicLinearGetFutureMarketV1PublicQFundingRate
    publicLinearGetFutureMarketV1PublicQFundingRateRecord::Function = publicLinearGetFutureMarketV1PublicQFundingRateRecord
    publicLinearGetFutureMarketV1PublicQIndexPrice::Function = publicLinearGetFutureMarketV1PublicQIndexPrice
    publicLinearGetFutureMarketV1PublicQKline::Function = publicLinearGetFutureMarketV1PublicQKline
    publicLinearGetFutureMarketV1PublicQMarkPrice::Function = publicLinearGetFutureMarketV1PublicQMarkPrice
    publicLinearGetFutureMarketV1PublicQSymbolIndexPrice::Function = publicLinearGetFutureMarketV1PublicQSymbolIndexPrice
    publicLinearGetFutureMarketV1PublicQSymbolMarkPrice::Function = publicLinearGetFutureMarketV1PublicQSymbolMarkPrice
    publicLinearGetFutureMarketV1PublicQTicker::Function = publicLinearGetFutureMarketV1PublicQTicker
    publicLinearGetFutureMarketV1PublicQTickerBooks::Function = publicLinearGetFutureMarketV1PublicQTickerBooks
    publicLinearGetFutureMarketV1PublicQTickers::Function = publicLinearGetFutureMarketV1PublicQTickers
    publicLinearGetFutureMarketV1PublicSymbolCoins::Function = publicLinearGetFutureMarketV1PublicSymbolCoins
    publicLinearGetFutureMarketV1PublicSymbolDetail::Function = publicLinearGetFutureMarketV1PublicSymbolDetail
    publicLinearGetFutureMarketV1PublicSymbolList::Function = publicLinearGetFutureMarketV1PublicSymbolList
    publicInverseGetFutureMarketV1PublicContractRiskBalance::Function = publicInverseGetFutureMarketV1PublicContractRiskBalance
    publicInverseGetFutureMarketV1PublicContractOpenInterest::Function = publicInverseGetFutureMarketV1PublicContractOpenInterest
    publicInverseGetFutureMarketV1PublicLeverageBracketDetail::Function = publicInverseGetFutureMarketV1PublicLeverageBracketDetail
    publicInverseGetFutureMarketV1PublicLeverageBracketList::Function = publicInverseGetFutureMarketV1PublicLeverageBracketList
    publicInverseGetFutureMarketV1PublicQAggTicker::Function = publicInverseGetFutureMarketV1PublicQAggTicker
    publicInverseGetFutureMarketV1PublicQAggTickers::Function = publicInverseGetFutureMarketV1PublicQAggTickers
    publicInverseGetFutureMarketV1PublicQDeal::Function = publicInverseGetFutureMarketV1PublicQDeal
    publicInverseGetFutureMarketV1PublicQDepth::Function = publicInverseGetFutureMarketV1PublicQDepth
    publicInverseGetFutureMarketV1PublicQFundingRate::Function = publicInverseGetFutureMarketV1PublicQFundingRate
    publicInverseGetFutureMarketV1PublicQFundingRateRecord::Function = publicInverseGetFutureMarketV1PublicQFundingRateRecord
    publicInverseGetFutureMarketV1PublicQIndexPrice::Function = publicInverseGetFutureMarketV1PublicQIndexPrice
    publicInverseGetFutureMarketV1PublicQKline::Function = publicInverseGetFutureMarketV1PublicQKline
    publicInverseGetFutureMarketV1PublicQMarkPrice::Function = publicInverseGetFutureMarketV1PublicQMarkPrice
    publicInverseGetFutureMarketV1PublicQSymbolIndexPrice::Function = publicInverseGetFutureMarketV1PublicQSymbolIndexPrice
    publicInverseGetFutureMarketV1PublicQSymbolMarkPrice::Function = publicInverseGetFutureMarketV1PublicQSymbolMarkPrice
    publicInverseGetFutureMarketV1PublicQTicker::Function = publicInverseGetFutureMarketV1PublicQTicker
    publicInverseGetFutureMarketV1PublicQTickerBooks::Function = publicInverseGetFutureMarketV1PublicQTickerBooks
    publicInverseGetFutureMarketV1PublicQTickers::Function = publicInverseGetFutureMarketV1PublicQTickers
    publicInverseGetFutureMarketV1PublicSymbolCoins::Function = publicInverseGetFutureMarketV1PublicSymbolCoins
    publicInverseGetFutureMarketV1PublicSymbolDetail::Function = publicInverseGetFutureMarketV1PublicSymbolDetail
    publicInverseGetFutureMarketV1PublicSymbolList::Function = publicInverseGetFutureMarketV1PublicSymbolList
    privateSpotGetBalance::Function = privateSpotGetBalance
    privateSpotGetBalances::Function = privateSpotGetBalances
    privateSpotGetBatchOrder::Function = privateSpotGetBatchOrder
    privateSpotGetDepositAddress::Function = privateSpotGetDepositAddress
    privateSpotGetDepositHistory::Function = privateSpotGetDepositHistory
    privateSpotGetHistoryOrder::Function = privateSpotGetHistoryOrder
    privateSpotGetOpenOrder::Function = privateSpotGetOpenOrder
    privateSpotGetOrder::Function = privateSpotGetOrder
    privateSpotGetOrderOrderId::Function = privateSpotGetOrderOrderId
    privateSpotGetTrade::Function = privateSpotGetTrade
    privateSpotGetWithdrawHistory::Function = privateSpotGetWithdrawHistory
    privateSpotPostOrder::Function = privateSpotPostOrder
    privateSpotPostWithdraw::Function = privateSpotPostWithdraw
    privateSpotPostBalanceTransfer::Function = privateSpotPostBalanceTransfer
    privateSpotPostBalanceAccountTransfer::Function = privateSpotPostBalanceAccountTransfer
    privateSpotPostWsToken::Function = privateSpotPostWsToken
    privateSpotDeleteBatchOrder::Function = privateSpotDeleteBatchOrder
    privateSpotDeleteOpenOrder::Function = privateSpotDeleteOpenOrder
    privateSpotDeleteOrderOrderId::Function = privateSpotDeleteOrderOrderId
    privateSpotPutOrderOrderId::Function = privateSpotPutOrderOrderId
    privateLinearGetFutureTradeV1EntrustPlanDetail::Function = privateLinearGetFutureTradeV1EntrustPlanDetail
    privateLinearGetFutureTradeV1EntrustPlanList::Function = privateLinearGetFutureTradeV1EntrustPlanList
    privateLinearGetFutureTradeV1EntrustPlanListHistory::Function = privateLinearGetFutureTradeV1EntrustPlanListHistory
    privateLinearGetFutureTradeV1EntrustProfitDetail::Function = privateLinearGetFutureTradeV1EntrustProfitDetail
    privateLinearGetFutureTradeV1EntrustProfitList::Function = privateLinearGetFutureTradeV1EntrustProfitList
    privateLinearGetFutureTradeV1OrderDetail::Function = privateLinearGetFutureTradeV1OrderDetail
    privateLinearGetFutureTradeV1OrderList::Function = privateLinearGetFutureTradeV1OrderList
    privateLinearGetFutureTradeV1OrderListHistory::Function = privateLinearGetFutureTradeV1OrderListHistory
    privateLinearGetFutureTradeV1PositionListHistory::Function = privateLinearGetFutureTradeV1PositionListHistory
    privateLinearGetFutureTradeV1OrderTradeList::Function = privateLinearGetFutureTradeV1OrderTradeList
    privateLinearGetFutureUserV1AccountInfo::Function = privateLinearGetFutureUserV1AccountInfo
    privateLinearGetFutureUserV1BalanceBills::Function = privateLinearGetFutureUserV1BalanceBills
    privateLinearGetFutureUserV1BalanceDetail::Function = privateLinearGetFutureUserV1BalanceDetail
    privateLinearGetFutureUserV1BalanceFundingRateList::Function = privateLinearGetFutureUserV1BalanceFundingRateList
    privateLinearGetFutureUserV1BalanceList::Function = privateLinearGetFutureUserV1BalanceList
    privateLinearGetFutureUserV1PositionAdl::Function = privateLinearGetFutureUserV1PositionAdl
    privateLinearGetFutureUserV1PositionBreakList::Function = privateLinearGetFutureUserV1PositionBreakList
    privateLinearGetFutureUserV1PositionList::Function = privateLinearGetFutureUserV1PositionList
    privateLinearGetFutureUserV1UserCollectionList::Function = privateLinearGetFutureUserV1UserCollectionList
    privateLinearGetFutureUserV1UserListenKey::Function = privateLinearGetFutureUserV1UserListenKey
    privateLinearPostFutureTradeV1EntrustCancelAllPlan::Function = privateLinearPostFutureTradeV1EntrustCancelAllPlan
    privateLinearPostFutureTradeV1EntrustCancelAllProfitStop::Function = privateLinearPostFutureTradeV1EntrustCancelAllProfitStop
    privateLinearPostFutureTradeV1EntrustCancelPlan::Function = privateLinearPostFutureTradeV1EntrustCancelPlan
    privateLinearPostFutureTradeV1EntrustCancelProfitStop::Function = privateLinearPostFutureTradeV1EntrustCancelProfitStop
    privateLinearPostFutureTradeV1EntrustCreatePlan::Function = privateLinearPostFutureTradeV1EntrustCreatePlan
    privateLinearPostFutureTradeV1EntrustCreateProfit::Function = privateLinearPostFutureTradeV1EntrustCreateProfit
    privateLinearPostFutureTradeV1EntrustUpdateProfitStop::Function = privateLinearPostFutureTradeV1EntrustUpdateProfitStop
    privateLinearPostFutureTradeV1OrderCancel::Function = privateLinearPostFutureTradeV1OrderCancel
    privateLinearPostFutureTradeV1OrderCancelAll::Function = privateLinearPostFutureTradeV1OrderCancelAll
    privateLinearPostFutureTradeV1OrderCreate::Function = privateLinearPostFutureTradeV1OrderCreate
    privateLinearPostFutureTradeV1OrderCreateBatch::Function = privateLinearPostFutureTradeV1OrderCreateBatch
    privateLinearPostFutureTradeV1OrderUpdate::Function = privateLinearPostFutureTradeV1OrderUpdate
    privateLinearPostFutureUserV1AccountOpen::Function = privateLinearPostFutureUserV1AccountOpen
    privateLinearPostFutureUserV1PositionAdjustLeverage::Function = privateLinearPostFutureUserV1PositionAdjustLeverage
    privateLinearPostFutureUserV1PositionAutoMargin::Function = privateLinearPostFutureUserV1PositionAutoMargin
    privateLinearPostFutureUserV1PositionCloseAll::Function = privateLinearPostFutureUserV1PositionCloseAll
    privateLinearPostFutureUserV1PositionMargin::Function = privateLinearPostFutureUserV1PositionMargin
    privateLinearPostFutureUserV1UserCollectionAdd::Function = privateLinearPostFutureUserV1UserCollectionAdd
    privateLinearPostFutureUserV1UserCollectionCancel::Function = privateLinearPostFutureUserV1UserCollectionCancel
    privateLinearPostFutureUserV1PositionChangeType::Function = privateLinearPostFutureUserV1PositionChangeType
    privateInverseGetFutureTradeV1EntrustPlanDetail::Function = privateInverseGetFutureTradeV1EntrustPlanDetail
    privateInverseGetFutureTradeV1EntrustPlanList::Function = privateInverseGetFutureTradeV1EntrustPlanList
    privateInverseGetFutureTradeV1EntrustPlanListHistory::Function = privateInverseGetFutureTradeV1EntrustPlanListHistory
    privateInverseGetFutureTradeV1EntrustProfitDetail::Function = privateInverseGetFutureTradeV1EntrustProfitDetail
    privateInverseGetFutureTradeV1EntrustProfitList::Function = privateInverseGetFutureTradeV1EntrustProfitList
    privateInverseGetFutureTradeV1OrderDetail::Function = privateInverseGetFutureTradeV1OrderDetail
    privateInverseGetFutureTradeV1OrderList::Function = privateInverseGetFutureTradeV1OrderList
    privateInverseGetFutureTradeV1OrderListHistory::Function = privateInverseGetFutureTradeV1OrderListHistory
    privateInverseGetFutureTradeV1PositionListHistory::Function = privateInverseGetFutureTradeV1PositionListHistory
    privateInverseGetFutureTradeV1OrderTradeList::Function = privateInverseGetFutureTradeV1OrderTradeList
    privateInverseGetFutureUserV1AccountInfo::Function = privateInverseGetFutureUserV1AccountInfo
    privateInverseGetFutureUserV1BalanceBills::Function = privateInverseGetFutureUserV1BalanceBills
    privateInverseGetFutureUserV1BalanceDetail::Function = privateInverseGetFutureUserV1BalanceDetail
    privateInverseGetFutureUserV1BalanceFundingRateList::Function = privateInverseGetFutureUserV1BalanceFundingRateList
    privateInverseGetFutureUserV1BalanceList::Function = privateInverseGetFutureUserV1BalanceList
    privateInverseGetFutureUserV1PositionAdl::Function = privateInverseGetFutureUserV1PositionAdl
    privateInverseGetFutureUserV1PositionBreakList::Function = privateInverseGetFutureUserV1PositionBreakList
    privateInverseGetFutureUserV1PositionList::Function = privateInverseGetFutureUserV1PositionList
    privateInverseGetFutureUserV1UserCollectionList::Function = privateInverseGetFutureUserV1UserCollectionList
    privateInverseGetFutureUserV1UserListenKey::Function = privateInverseGetFutureUserV1UserListenKey
    privateInversePostFutureTradeV1EntrustCancelAllPlan::Function = privateInversePostFutureTradeV1EntrustCancelAllPlan
    privateInversePostFutureTradeV1EntrustCancelAllProfitStop::Function = privateInversePostFutureTradeV1EntrustCancelAllProfitStop
    privateInversePostFutureTradeV1EntrustCancelPlan::Function = privateInversePostFutureTradeV1EntrustCancelPlan
    privateInversePostFutureTradeV1EntrustCancelProfitStop::Function = privateInversePostFutureTradeV1EntrustCancelProfitStop
    privateInversePostFutureTradeV1EntrustCreatePlan::Function = privateInversePostFutureTradeV1EntrustCreatePlan
    privateInversePostFutureTradeV1EntrustCreateProfit::Function = privateInversePostFutureTradeV1EntrustCreateProfit
    privateInversePostFutureTradeV1EntrustUpdateProfitStop::Function = privateInversePostFutureTradeV1EntrustUpdateProfitStop
    privateInversePostFutureTradeV1OrderCancel::Function = privateInversePostFutureTradeV1OrderCancel
    privateInversePostFutureTradeV1OrderCancelAll::Function = privateInversePostFutureTradeV1OrderCancelAll
    privateInversePostFutureTradeV1OrderCreate::Function = privateInversePostFutureTradeV1OrderCreate
    privateInversePostFutureTradeV1OrderCreateBatch::Function = privateInversePostFutureTradeV1OrderCreateBatch
    privateInversePostFutureTradeV1OrderUpdate::Function = privateInversePostFutureTradeV1OrderUpdate
    privateInversePostFutureUserV1AccountOpen::Function = privateInversePostFutureUserV1AccountOpen
    privateInversePostFutureUserV1PositionAdjustLeverage::Function = privateInversePostFutureUserV1PositionAdjustLeverage
    privateInversePostFutureUserV1PositionAutoMargin::Function = privateInversePostFutureUserV1PositionAutoMargin
    privateInversePostFutureUserV1PositionCloseAll::Function = privateInversePostFutureUserV1PositionCloseAll
    privateInversePostFutureUserV1PositionMargin::Function = privateInversePostFutureUserV1PositionMargin
    privateInversePostFutureUserV1UserCollectionAdd::Function = privateInversePostFutureUserV1UserCollectionAdd
    privateInversePostFutureUserV1UserCollectionCancel::Function = privateInversePostFutureUserV1UserCollectionCancel
    privateInversePostFutureUserV1PositionChangeType::Function = privateInversePostFutureUserV1PositionChangeType
    privateUserGetUserAccount::Function = privateUserGetUserAccount
    privateUserGetUserAccountApiKey::Function = privateUserGetUserAccountApiKey
    privateUserPostUserAccount::Function = privateUserPostUserAccount
    privateUserPostUserAccountApiKey::Function = privateUserPostUserAccountApiKey
    privateUserPutUserAccountApiKey::Function = privateUserPutUserAccountApiKey
    privateUserDeleteUserAccountApiKeyId::Function = privateUserDeleteUserAccountApiKeyId

end
function describe(self::Xt, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "xt",
    Symbol("name") => "XT",
    Symbol("countries") => ["SC"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v4",
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => false,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createPostOnlyOrder") => false,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDeposit") => false,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawals") => false,
        Symbol("fetchDepositWithdrawFee") => false,
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingInterval") => true,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchL3OrderBook") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLedgerEntry") => false,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchMarketLeverageTiers") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => true,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => false,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrdersByStatus") => true,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsHistory") => true,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchStatus") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTradingLimits") => false,
        Symbol("fetchTransactionFee") => false,
        Symbol("fetchTransactionFees") => false,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("fetchWithdrawalWhitelist") => false,
        Symbol("reduceMargin") => true,
        Symbol("repayMargin") => false,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => false,
        Symbol("signIn") => false,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/1f916564-6507-4549-af96-22837bb0a0c7",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("spot") => "https://sapi.xt.com",
            Symbol("linear") => "https://fapi.xt.com",
            Symbol("inverse") => "https://dapi.xt.com",
            Symbol("user") => "https://api.xt.com"
        ),
        Symbol("www") => "https://xt.com",
        Symbol("referral") => "https://www.xt.com/en/accounts/register?ref=9PTM9VW",
        Symbol("doc") => ["https://doc.xt.com/", "https://github.com/xtpub/api-doc"],
        Symbol("fees") => "https://www.xt.com/en/rate"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("currencies") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("depth") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("symbol") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ticker/book") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ticker/24h") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade/recent") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("wallet/support/currency") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("future/market/v1/public/contract/risk-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/contract/open-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/leverage/bracket/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/leverage/bracket/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/agg-ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/agg-tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/deal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/funding-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/funding-rate-record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/index-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/mark-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/symbol-index-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/symbol-mark-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/ticker/books") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/symbol/coins") => Dict{Symbol, Any}(
    Symbol("cost") => 3.33
),
                    Symbol("future/market/v1/public/symbol/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 3.33
),
                    Symbol("future/market/v1/public/symbol/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("future/market/v1/public/contract/risk-balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/contract/open-interest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/leverage/bracket/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/leverage/bracket/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/agg-ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/agg-tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/deal") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/funding-rate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/funding-rate-record") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/index-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/kline") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/mark-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/symbol-index-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/symbol-mark-price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/ticker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/ticker/books") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/q/tickers") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/market/v1/public/symbol/coins") => Dict{Symbol, Any}(
    Symbol("cost") => 3.33
),
                    Symbol("future/market/v1/public/symbol/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 3.33
),
                    Symbol("future/market/v1/public/symbol/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("balances") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("batch-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("deposit/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("history-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("open-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("trade") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("withdraw/history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("order") => Dict{Symbol, Any}(
    Symbol("cost") => 0.2
),
                    Symbol("withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                    Symbol("balance/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("balance/account/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("ws-token") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("batch-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("open-order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("order/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("order/{orderId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("future/trade/v1/entrust/plan-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/plan-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/plan-list-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/profit-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/profit-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/list-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/position/list-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/trade-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/balance/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/balance/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/balance/funding-rate-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/balance/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/adl") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/break-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/user/collection/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/user/listen-key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("future/trade/v1/entrust/cancel-all-plan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/cancel-all-profit-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/cancel-plan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/cancel-profit-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/create-plan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/create-profit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/update-profit-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/create-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/update") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/account/open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/adjust-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/auto-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/close-all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/user/collection/add") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/user/collection/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/change-type") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("future/trade/v1/entrust/plan-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/plan-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/plan-list-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/profit-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/profit-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/list-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/position/list-history") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/trade-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/account/info") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/balance/bills") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/balance/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/balance/funding-rate-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/balance/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/adl") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/break-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/user/collection/list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/user/listen-key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("future/trade/v1/entrust/cancel-all-plan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/cancel-all-profit-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/cancel-plan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/cancel-profit-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/create-plan") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/create-profit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/entrust/update-profit-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/cancel-all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/create") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/create-batch") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/trade/v1/order/update") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/account/open") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/adjust-leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/auto-margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/close-all") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/margin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/user/collection/add") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/user/collection/cancel") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("future/user/v1/position/change-type") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            ),
            Symbol("user") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("user/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/account/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("user/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                    Symbol("user/account/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("user/account/api-key") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("user/account/{apiKeyId}") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
                )
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.002"),
            Symbol("taker") => self.parseNumber("0.002"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.002")], [self.parseNumber("5000"), self.parseNumber("0.0018")], [self.parseNumber("10000"), self.parseNumber("0.0016")], [self.parseNumber("20000"), self.parseNumber("0.0014")], [self.parseNumber("50000"), self.parseNumber("0.0012")], [self.parseNumber("150000"), self.parseNumber("0.0010")], [self.parseNumber("300000"), self.parseNumber("0.0008")], [self.parseNumber("600000"), self.parseNumber("0.0007")], [self.parseNumber("1200000"), self.parseNumber("0.0006")], [self.parseNumber("2500000"), self.parseNumber("0.0005")], [self.parseNumber("6000000"), self.parseNumber("0.0004")], [self.parseNumber("15000000"), self.parseNumber("0.0003")], [self.parseNumber("30000000"), self.parseNumber("0.0002")]],
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.002")], [self.parseNumber("5000"), self.parseNumber("0.0018")], [self.parseNumber("10000"), self.parseNumber("0.0016")], [self.parseNumber("20000"), self.parseNumber("0.0014")], [self.parseNumber("50000"), self.parseNumber("0.0012")], [self.parseNumber("150000"), self.parseNumber("0.0010")], [self.parseNumber("300000"), self.parseNumber("0.0008")], [self.parseNumber("600000"), self.parseNumber("0.0007")], [self.parseNumber("1200000"), self.parseNumber("0.0006")], [self.parseNumber("2500000"), self.parseNumber("0.0005")], [self.parseNumber("6000000"), self.parseNumber("0.0004")], [self.parseNumber("15000000"), self.parseNumber("0.0003")], [self.parseNumber("30000000"), self.parseNumber("0.0002")]]
            )
        ),
        Symbol("contract") => Dict{Symbol, Any}(
            Symbol("tierBased") => true,
            Symbol("percentage") => true,
            Symbol("maker") => self.parseNumber("0.0004"),
            Symbol("taker") => self.parseNumber("0.0006"),
            Symbol("tiers") => Dict{Symbol, Any}(
                Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.0004")], [self.parseNumber("200000"), self.parseNumber("0.00038")], [self.parseNumber("1000000"), self.parseNumber("0.00036")], [self.parseNumber("5000000"), self.parseNumber("0.00034")], [self.parseNumber("10000000"), self.parseNumber("0.00032")], [self.parseNumber("15000000"), self.parseNumber("0.00028")], [self.parseNumber("30000000"), self.parseNumber("0.00024")], [self.parseNumber("50000000"), self.parseNumber("0.0002")], [self.parseNumber("100000000"), self.parseNumber("0.00016")], [self.parseNumber("300000000"), self.parseNumber("0.00012")], [self.parseNumber("500000000"), self.parseNumber("0.00008")]],
                Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0006")], [self.parseNumber("200000"), self.parseNumber("0.000588")], [self.parseNumber("1000000"), self.parseNumber("0.00057")], [self.parseNumber("5000000"), self.parseNumber("0.00054")], [self.parseNumber("10000000"), self.parseNumber("0.00051")], [self.parseNumber("15000000"), self.parseNumber("0.00048")], [self.parseNumber("30000000"), self.parseNumber("0.00045")], [self.parseNumber("50000000"), self.parseNumber("0.00045")], [self.parseNumber("100000000"), self.parseNumber("0.00036")], [self.parseNumber("300000000"), self.parseNumber("0.00033")], [self.parseNumber("500000000"), self.parseNumber("0.0003")]]
            )
        )
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("400") => NetworkError,
            Symbol("404") => ExchangeError,
            Symbol("429") => RateLimitExceeded,
            Symbol("500") => ExchangeError,
            Symbol("502") => ExchangeError,
            Symbol("503") => OnMaintenance,
            Symbol("AUTH_001") => AuthenticationError,
            Symbol("AUTH_002") => AuthenticationError,
            Symbol("AUTH_003") => AuthenticationError,
            Symbol("AUTH_004") => AuthenticationError,
            Symbol("AUTH_005") => AuthenticationError,
            Symbol("AUTH_006") => AuthenticationError,
            Symbol("AUTH_007") => AuthenticationError,
            Symbol("AUTH_101") => AuthenticationError,
            Symbol("AUTH_102") => AuthenticationError,
            Symbol("AUTH_103") => AuthenticationError,
            Symbol("AUTH_104") => AuthenticationError,
            Symbol("AUTH_105") => AuthenticationError,
            Symbol("AUTH_106") => PermissionDenied,
            Symbol("SYMBOL_001") => BadSymbol,
            Symbol("SYMBOL_002") => BadSymbol,
            Symbol("SYMBOL_003") => BadSymbol,
            Symbol("SYMBOL_004") => BadSymbol,
            Symbol("SYMBOL_005") => BadSymbol,
            Symbol("ORDER_001") => InvalidOrder,
            Symbol("ORDER_002") => InsufficientFunds,
            Symbol("ORDER_003") => InvalidOrder,
            Symbol("ORDER_004") => InvalidOrder,
            Symbol("ORDER_005") => InvalidOrder,
            Symbol("ORDER_006") => InvalidOrder,
            Symbol("ORDER_007") => PermissionDenied,
            Symbol("ORDER_F0101") => InvalidOrder,
            Symbol("ORDER_F0102") => InvalidOrder,
            Symbol("ORDER_F0103") => InvalidOrder,
            Symbol("ORDER_F0201") => InvalidOrder,
            Symbol("ORDER_F0202") => InvalidOrder,
            Symbol("ORDER_F0203") => InvalidOrder,
            Symbol("ORDER_F0301") => InvalidOrder,
            Symbol("ORDER_F0401") => InvalidOrder,
            Symbol("ORDER_F0501") => InvalidOrder,
            Symbol("ORDER_F0502") => InvalidOrder,
            Symbol("ORDER_F0601") => InvalidOrder,
            Symbol("COMMON_001") => ExchangeError,
            Symbol("COMMON_002") => ExchangeError,
            Symbol("COMMON_003") => BadRequest,
            Symbol("CURRENCY_001") => BadRequest,
            Symbol("DEPOSIT_001") => BadRequest,
            Symbol("DEPOSIT_002") => PermissionDenied,
            Symbol("DEPOSIT_003") => BadRequest,
            Symbol("DEPOSIT_004") => BadRequest,
            Symbol("DEPOSIT_005") => BadRequest,
            Symbol("DEPOSIT_006") => BadRequest,
            Symbol("DEPOSIT_007") => BadRequest,
            Symbol("DEPOSIT_008") => BadRequest,
            Symbol("WITHDRAW_001") => BadRequest,
            Symbol("WITHDRAW_002") => BadRequest,
            Symbol("WITHDRAW_003") => PermissionDenied,
            Symbol("WITHDRAW_004") => BadRequest,
            Symbol("WITHDRAW_005") => BadRequest,
            Symbol("WITHDRAW_006") => BadRequest,
            Symbol("WITHDRAW_008") => PermissionDenied,
            Symbol("WITHDRAW_009") => PermissionDenied,
            Symbol("WITHDRAW_010") => BadRequest,
            Symbol("WITHDRAW_011") => InsufficientFunds,
            Symbol("WITHDRAW_012") => PermissionDenied,
            Symbol("WITHDRAW_013") => PermissionDenied,
            Symbol("WITHDRAW_014") => BadRequest,
            Symbol("WITHDRAW_015") => BadRequest,
            Symbol("WITHDRAW_016") => BadRequest,
            Symbol("WITHDRAW_017") => BadRequest,
            Symbol("WITHDRAW_018") => BadRequest,
            Symbol("WITHDRAW_019") => BadRequest,
            Symbol("WITHDRAW_020") => PermissionDenied,
            Symbol("WITHDRAW_021") => PermissionDenied,
            Symbol("WITHDRAW_022") => BadRequest,
            Symbol("WITHDRAW_023") => BadRequest,
            Symbol("WITHDRAW_024") => BadRequest,
            Symbol("WITHDRAW_025") => BadRequest,
            Symbol("FUND_001") => BadRequest,
            Symbol("FUND_002") => InsufficientFunds,
            Symbol("FUND_003") => BadRequest,
            Symbol("FUND_004") => ExchangeError,
            Symbol("FUND_005") => PermissionDenied,
            Symbol("FUND_014") => BadRequest,
            Symbol("FUND_015") => BadRequest,
            Symbol("FUND_016") => BadRequest,
            Symbol("FUND_017") => BadRequest,
            Symbol("FUND_018") => BadRequest,
            Symbol("FUND_019") => BadRequest,
            Symbol("FUND_020") => BadRequest,
            Symbol("FUND_021") => BadRequest,
            Symbol("FUND_022") => BadRequest,
            Symbol("FUND_044") => BadRequest,
            Symbol("TRANSFER_001") => BadRequest,
            Symbol("TRANSFER_002") => InsufficientFunds,
            Symbol("TRANSFER_003") => BadRequest,
            Symbol("TRANSFER_004") => PermissionDenied,
            Symbol("TRANSFER_005") => PermissionDenied,
            Symbol("TRANSFER_006") => PermissionDenied,
            Symbol("TRANSFER_007") => RequestTimeout,
            Symbol("TRANSFER_008") => BadRequest,
            Symbol("TRANSFER_009") => BadRequest,
            Symbol("TRANSFER_010") => PermissionDenied,
            Symbol("TRANSFER_011") => PermissionDenied,
            Symbol("TRANSFER_012") => PermissionDenied,
            Symbol("symbol_not_support_trading_via_api") => BadSymbol,
            Symbol("open_order_min_nominal_value_limit") => InvalidOrder,
            Symbol("insufficient_balance") => InsufficientFunds
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("The symbol does not support trading via API") => BadSymbol,
            Symbol("Exceeds the minimum notional value of a single order") => InvalidOrder,
            Symbol("insufficient balance") => InsufficientFunds
        )
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("6h") => "6h",
        Symbol("8h") => "8h",
        Symbol("1d") => "1d",
        Symbol("3d") => "3d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("adjustForTimeDifference") => false,
        Symbol("timeDifference") => 0,
        Symbol("accountsById") => Dict{Symbol, Any}(
            Symbol("spot") => "SPOT",
            Symbol("leverage") => "LEVER",
            Symbol("finance") => "FINANCE",
            Symbol("swap") => "FUTURES_U",
            Symbol("future") => "FUTURES_U",
            Symbol("linear") => "FUTURES_U",
            Symbol("inverse") => "FUTURES_C"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("ERC20") => "Ethereum",
            Symbol("TRC20") => "Tron",
            Symbol("TRX") => "Tron",
            Symbol("BEP20") => "BNB Smart Chain",
            Symbol("BEP2") => "BNB-BEP2",
            Symbol("ETH") => "Ethereum",
            Symbol("AVAX") => "AVAX C-Chain",
            Symbol("GAL") => "GAL(FT)",
            Symbol("ALEO") => "ALEO(IOU)",
            Symbol("BTC") => "Bitcoin",
            Symbol("XT") => "XT Smart Chain",
            Symbol("ETC") => "Ethereum Classic",
            Symbol("MATIC") => "Polygon",
            Symbol("LTC") => "Litecoin",
            Symbol("BTS") => "BitShares",
            Symbol("XRP") => "Ripple",
            Symbol("XLM") => "Stellar Network",
            Symbol("ADA") => "Cardano",
            Symbol("XWC") => "XWC-XWC",
            Symbol("DOGE") => "dogecoin",
            Symbol("DCR") => "Decred",
            Symbol("SC") => "Siacoin",
            Symbol("XTZ") => "Tezos",
            Symbol("ZEC") => "Zcash",
            Symbol("XMR") => "Monero",
            Symbol("LSK") => "Lisk",
            Symbol("ATOM") => "Cosmos",
            Symbol("ONT") => "Ontology",
            Symbol("ALGO") => "Algorand",
            Symbol("SOL") => "SOL-SOL",
            Symbol("DOT") => "Polkadot",
            Symbol("ZEN") => "Horizen",
            Symbol("FIL") => "Filecoin",
            Symbol("CHZ") => "chz",
            Symbol("ICP") => "Internet Computer",
            Symbol("KSM") => "Kusama",
            Symbol("LUNA") => "Terra",
            Symbol("THETA") => "Theta Token",
            Symbol("FTM") => "Fantom",
            Symbol("VET") => "VeChain",
            Symbol("NEAR") => "NEAR Protocol",
            Symbol("ONE") => "Harmony",
            Symbol("KLAY") => "Klaytn",
            Symbol("AR") => "Arweave",
            Symbol("CELT") => "OKT",
            Symbol("EGLD") => "Elrond eGold",
            Symbol("CRO") => "CRO-CRONOS",
            Symbol("BCH") => "Bitcoin Cash",
            Symbol("GLMR") => "Moonbeam",
            Symbol("LOOP") => "LOOP-LRC",
            Symbol("REI") => "REI Network",
            Symbol("ASTR") => "Astar Network",
            Symbol("OP") => "OPT",
            Symbol("MMT") => "MMT-MMT",
            Symbol("TBC") => "TBC-TBC",
            Symbol("OMAX") => "OMAX-OMAX CHAIN",
            Symbol("GMMT") => "GMMT chain",
            Symbol("ZIL") => "Zilliqa"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("Ethereum") => "ERC20",
            Symbol("Tron") => "TRC20",
            Symbol("BNB Smart Chain") => "BEP20",
            Symbol("BNB-BEP2") => "BEP2",
            Symbol("Bitcoin") => "BTC",
            Symbol("XT Smart Chain") => "XT",
            Symbol("Ethereum Classic") => "ETC",
            Symbol("Polygon") => "MATIC",
            Symbol("Litecoin") => "LTC",
            Symbol("BitShares") => "BTS",
            Symbol("Ripple") => "XRP",
            Symbol("Stellar Network") => "XLM",
            Symbol("Cardano") => "ADA",
            Symbol("XWC-XWC") => "XWC",
            Symbol("dogecoin") => "DOGE",
            Symbol("Decred") => "DCR",
            Symbol("Siacoin") => "SC",
            Symbol("Tezos") => "XTZ",
            Symbol("Zcash") => "ZEC",
            Symbol("Monero") => "XMR",
            Symbol("Lisk") => "LSK",
            Symbol("Cosmos") => "ATOM",
            Symbol("Ontology") => "ONT",
            Symbol("Algorand") => "ALGO",
            Symbol("SOL-SOL") => "SOL",
            Symbol("Polkadot") => "DOT",
            Symbol("Horizen") => "ZEN",
            Symbol("Filecoin") => "FIL",
            Symbol("chz") => "CHZ",
            Symbol("Internet Computer") => "ICP",
            Symbol("Kusama") => "KSM",
            Symbol("Terra") => "LUNA",
            Symbol("Theta Token") => "THETA",
            Symbol("Fantom") => "FTM",
            Symbol("VeChain") => "VET",
            Symbol("AVAX C-Chain") => "AVAX",
            Symbol("NEAR Protocol") => "NEAR",
            Symbol("Harmony") => "ONE",
            Symbol("Klaytn") => "KLAY",
            Symbol("Arweave") => "AR",
            Symbol("OKT") => "CELT",
            Symbol("Elrond eGold") => "EGLD",
            Symbol("CRO-CRONOS") => "CRO",
            Symbol("Bitcoin Cash") => "BCH",
            Symbol("Moonbeam") => "GLMR",
            Symbol("LOOP-LRC") => "LOOP",
            Symbol("REI Network") => "REI",
            Symbol("Astar Network") => "ASTR",
            Symbol("GAL(FT)") => "GAL",
            Symbol("ALEO(IOU)") => "ALEO",
            Symbol("OPT") => "OP",
            Symbol("MMT-MMT") => "MMT",
            Symbol("TBC-TBC") => "TBC",
            Symbol("OMAX-OMAX CHAIN") => "OMAX",
            Symbol("GMMT chain") => "GMMT",
            Symbol("Zilliqa") => "ZIL"
        ),
        Symbol("createMarketBuyOrderRequiresPrice") => true,
        Symbol("recvWindow") => "5000"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("triggerPrice") => false,
                Symbol("triggerDirection") => false,
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
                Symbol("leverage") => false,
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("marketType") => true,
                Symbol("subType") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("marketType") => true,
                Symbol("subType") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("marketType") => true,
                Symbol("subType") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("marketType") => true,
                Symbol("subType") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => true,
                Symbol("limit") => 100,
                Symbol("daysBack") => 100000,
                Symbol("daysBackCanceled") => 1,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => true,
                Symbol("trailing") => false,
                Symbol("marketType") => true,
                Symbol("subType") => true,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            )
        ),
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("extends") => "default"
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("extends") => "default",
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => true,
                Symbol("triggerPriceType") => Dict{Symbol, Any}(
                    Symbol("last") => true,
                    Symbol("mark") => true,
                    Symbol("index") => true
                ),
                Symbol("stopLossPrice") => true,
                Symbol("takeProfitPrice") => true
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("daysBack") => nothing,
                Symbol("untilDays") => nothing
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
    )
))

end
function nonce(self::Xt, )
    return milliseconds() - get(self.options, Symbol("timeDifference"), nothing)

end
"""
fetches the current integer timestamp in milliseconds from the xt server
see: https://doc.xt.com/docs/spot/Market/GetServerTime

# Arguments
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the xt server
"""
function fetchTime(self::Xt; params=Dict())
    response = Base.fetch(self.publicSpotGetTime(params));
    data = safeValue(response, "result");
    return safeInteger(data, "serverTime")

end
"""
fetches all available currencies on an exchange
see: https://doc.xt.com/docs/spot/Deposit&Withdrawal/GetSupportedCurrencies

# Arguments
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Xt; params=Dict())
    promisesRaw = [self.publicSpotGetWalletSupportCurrency(params), self.publicSpotGetCurrencies(params)];
    (chainsResponse, currenciesResponse) = (Base.fetch(asyncmap(Base.fetch, promisesRaw)));
    chainsData = safeValue(chainsResponse, "result", []);
    currenciesResult = safeValue(currenciesResponse, "result", []);
    currenciesData = safeValue(currenciesResult, "currencies", []);
    chainsDataIndexed = indexBy(chainsData, "currency");
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currenciesData)))
        entry = get(currenciesData, i + 1, nothing);
        currencyId = safeString(entry, "currency");
        code = self.safeCurrencyCode(currencyId);
        networkEntry = safeValue(chainsDataIndexed, currencyId, Dict{Symbol, Any}());
        rawNetworks = safeValue(networkEntry, "supportChains", []);
        networks = Dict{Symbol, Any}();
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(rawNetworks)))
            rawNetwork = get(rawNetworks, j + 1, nothing);
            networkId = safeString(rawNetwork, "chain");
            networkCode = self.networkIdToCode(networkId = networkId, currencyCode = code);
            if functions.ccxtruthy(networkCode != nothing)
                networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                    Symbol("info") => rawNetwork,
                    Symbol("id") => networkId,
                    Symbol("network") => networkCode,
                    Symbol("name") => nothing,
                    Symbol("active") => nothing,
                    Symbol("fee") => self.safeNumber(rawNetwork, "withdrawFeeAmount"),
                    Symbol("precision") => nothing,
                    Symbol("deposit") => self.safeBool(rawNetwork, "depositEnabled"),
                    Symbol("withdraw") => self.safeBool(rawNetwork, "withdrawEnabled"),
                    Symbol("limits") => Dict{Symbol, Any}(
                        Symbol("amount") => Dict{Symbol, Any}(
                            Symbol("min") => nothing,
                            Symbol("max") => nothing
                        ),
                        Symbol("withdraw") => Dict{Symbol, Any}(
                            Symbol("min") => self.safeNumber(rawNetwork, "withdrawMinAmount"),
                            Symbol("max") => nothing
                        ),
                        Symbol("deposit") => Dict{Symbol, Any}(
                            Symbol("min") => nothing,
                            Symbol("max") => nothing
                        )
                    )
                );
            end
            j += 1
        end
        typeRaw = safeString(entry, "type");
        type_var = nothing;
        if functions.ccxtruthy(typeRaw == "FT")
            type_var = "crypto";
        else
            type_var = "other";
        end
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("name") => safeString(entry, "fullName"),
    Symbol("active") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => self.parseNumber(self.parsePrecision(precision = safeString(entry, "maxPrecision"))),
    Symbol("deposit") => safeString(entry, "depositStatus") == "1",
    Symbol("withdraw") => safeString(entry, "withdrawStatus") == "1",
    Symbol("networks") => networks,
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
    )
));
        end
        i += 1
    end
    return result

end
"""
retrieves data on all markets for xt
see: https://doc.xt.com/docs/spot/Market/GetSymbolInformation
see: https://doc.xt.com/docs/futures/MarketData/get-configuration-information-for-listed-and-tradeable-symbols

# Arguments
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Xt; params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    promisesUnresolved = [self.fetchSpotMarkets(params = params), self.fetchSwapAndFutureMarkets(params = params)];
    promises = Base.fetch(asyncmap(Base.fetch, promisesUnresolved));
    spotMarkets = get(promises, 1, nothing);
    swapAndFutureMarkets = get(promises, 2, nothing);
    return arrayConcat(spotMarkets, swapAndFutureMarkets)

end
function fetchSpotMarkets(self::Xt; params=Dict())
    response = Base.fetch(self.publicSpotGetSymbol(params));
    data = safeValue(response, "result", Dict{Symbol, Any}());
    symbols = safeValue(data, "symbols", []);
    return self.parseMarkets(symbols)

end
function fetchSwapAndFutureMarkets(self::Xt; params=Dict())
    markets = Base.fetch(asyncmap(Base.fetch, [self.publicLinearGetFutureMarketV1PublicSymbolList(params), self.publicInverseGetFutureMarketV1PublicSymbolList(params)]));
    swapAndFutureMarkets = arrayConcat(safeValue(get(markets, 1, nothing), "result", []), safeValue(get(markets, 2, nothing), "result", []));
    return self.parseMarkets(swapAndFutureMarkets)

end
function parseMarkets(self::Xt, markets)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        push!(result, self.parseMarket(get(markets, i + 1, nothing)));
        i += 1
    end
    return result

end
function parseMarket(self::Xt, market)
    id = safeString(market, "symbol");
    baseId = safeString2(market, "baseCurrency", "baseCoin");
    quoteId = safeString2(market, "quoteCurrency", "quoteCoin");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    state = safeString(market, "state");
    symbol = string(base, "/", quote_var);
    filters = safeValue(market, "filters", []);
    minAmount = nothing;
    maxAmount = nothing;
    minCost = nothing;
    maxCost = nothing;
    minPrice = nothing;
    maxPrice = nothing;
    amountPrecision = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(filters)))
        entry = get(filters, i + 1, nothing);
        filter_var = safeString(entry, "filter");
        if functions.ccxtruthy(filter_var == "QUANTITY")
            minAmount = self.safeNumber(entry, "min");
            maxAmount = self.safeNumber(entry, "max");
            amountPrecision = self.safeNumber(entry, "tickSize");
        end
        if functions.ccxtruthy(filter_var == "QUOTE_QTY")
            minCost = self.safeNumber(entry, "min");
        end
        if functions.ccxtruthy(filter_var == "PRICE")
            minPrice = self.safeNumber(entry, "min");
            maxPrice = self.safeNumber(entry, "max");
        end
        i += 1
    end
    if functions.ccxtruthy(amountPrecision == nothing)
        amountPrecision = self.parseNumber(self.parsePrecision(precision = safeString(market, "quantityPrecision")));
    end
    underlyingType = safeString(market, "underlyingType");
    linear = nothing;
    inverse = nothing;
    settleId = nothing;
    settle = nothing;
    expiry = nothing;
    future = false;
    swap = false;
    contract = false;
    spot = true;
    type_var = "spot";
    if functions.ccxtruthy(underlyingType == "U_BASED")
        symbol = string(symbol, ":", quote_var);
        settleId = baseId;
        settle = quote_var;
        linear = true;
        inverse = false;
    elseif functions.ccxtruthy(underlyingType == "COIN_BASED")
        symbol = string(symbol, ":", base);
        settleId = baseId;
        settle = base;
        linear = false;
        inverse = true;
    end
    if functions.ccxtruthy(underlyingType != nothing)
        expiry = safeInteger(market, "deliveryDate");
        productType = safeString(market, "productType");
        if functions.ccxtruthy(productType != "perpetual")
            symbol = string(symbol, "-", self.yymmdd(expiry));
            type_var = "future";
            future = true;
        else
            type_var = "swap";
            swap = true;
        end
        minAmount = self.safeNumber(market, "minQty");
        minCost = self.safeNumber(market, "minNotional");
        maxCost = self.safeNumber(market, "maxNotional");
        minPrice = self.safeNumber(market, "minPrice");
        maxPrice = self.safeNumber(market, "maxPrice");
        contract = true;
        spot = false;
    end
    isActive = false;
    if functions.ccxtruthy(contract)
        isActive = safeValue(market, "isOpenApi", false);
    else
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((state == "ONLINE"), (safeValue(market, "tradingEnabled"))), (safeValue(market, "openapiEnabled"))))
            isActive = true;
        end
    end
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
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
    Symbol("margin") => nothing,
    Symbol("swap") => swap,
    Symbol("future") => future,
    Symbol("option") => false,
    Symbol("active") => isActive,
    Symbol("contract") => contract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("taker") => self.safeNumber2(market, "takerFee", "takerFeeRate"),
    Symbol("maker") => self.safeNumber2(market, "makerFee", "makerFeeRate"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => self.parseNumber(self.parsePrecision(precision = safeString(market, "pricePrecision"))),
        Symbol("amount") => amountPrecision,
        Symbol("base") => self.parseNumber(self.parsePrecision(precision = safeString(market, "baseCoinPrecision"))),
        Symbol("quote") => self.parseNumber(self.parsePrecision(precision = safeString(market, "quoteCoinPrecision")))
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber("1"),
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => minAmount,
            Symbol("max") => maxAmount
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => minPrice,
            Symbol("max") => maxPrice
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => minCost,
            Symbol("max") => maxCost
        )
    ),
    Symbol("info") => market
))

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://doc.xt.com/docs/spot/Market/GetKlineData
see: https://doc.xt.com/docs/futures/MarketData/get-trading-pair-information-of-kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Xt, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", defaultValue = false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 1000))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(since != nothing)
        duration = self.parseTimeframe(timeframe) * 1000;
        request[Symbol("startTime")] = ceil(since / duration) * duration;
    end
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            limit = min(limit, 1000);
        else
            limit = min(limit, 1500);
        end
        request[Symbol("limit")] = limit;
    else
        request[Symbol("limit")] = 1000;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicQKline(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicQKline(extend(request, params)));
    else
        response = Base.fetch(self.publicSpotGetKline(extend(request, params)));
    end
    ohlcvs = safeValue(response, "result", []);
    return self.parseOHLCVs(ohlcvs, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Xt, ohlcv; market=nothing)
    isInverse = self.safeBool(market, "inverse");
    volumeIndex = functions.ccxtruthy((isInverse)) ? "v" : "a";
    return [safeInteger(ohlcv, "t"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber2(ohlcv, "q", volumeIndex)]

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://doc.xt.com/docs/spot/Market/GetDepthData
see: https://doc.xt.com/docs/futures/MarketData/get-depth-data-of-trading-pairs

# Arguments
- `symbol`::string: unified market symbol to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure}
"""
function fetchOrderBook(self::Xt, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = min(limit, 500);
        end
        response = Base.fetch(self.publicSpotGetDepth(extend(request, params)));
    else
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("level")] = min(limit, 50);
        else
            request[Symbol("level")] = 50;
        end
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.publicLinearGetFutureMarketV1PublicQDepth(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.publicInverseGetFutureMarketV1PublicQDepth(extend(request, params)));
        end
    end
    orderBook = safeValue(response, "result", Dict{Symbol, Any}());
    timestamp = safeInteger2(orderBook, "timestamp", "t");
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        ob = self.parseOrderBook(orderBook, symbol, timestamp = timestamp);
        ob[Symbol("nonce")] = safeInteger(orderBook, "lastUpdateId");
            return ob
    end
    swapOb = self.parseOrderBook(orderBook, symbol, timestamp = timestamp, bidsKey = "b", asksKey = "a");
    swapOb[Symbol("nonce")] = safeInteger2(orderBook, "u", "lastUpdateId");
    return swapOb

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://doc.xt.com/docs/spot/Market/Get24hStatisticsTicker
see: https://doc.xt.com/docs/futures/MarketData/get-aggregated-market-information-for-specific-trading-pair

# Arguments
- `symbol`::string: unified market symbol to fetch the ticker for
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
"""
function fetchTicker(self::Xt, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicQAggTicker(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicQAggTicker(extend(request, params)));
    else
        response = Base.fetch(self.publicSpotGetTicker24h(extend(request, params)));
    end
    ticker = safeValue(response, "result");
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            return self.parseTicker(get(ticker, 1, nothing), market = market)
    end
    return self.parseTicker(ticker, market = market)

end
"""
fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
see: https://doc.xt.com/docs/spot/Market/Get24hStatisticsTicker
see: https://doc.xt.com/docs/futures/MarketData/get_aggregated_market_information_for_all_trading_pairs

# Arguments
- `symbols`::string, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
"""
function fetchTickers(self::Xt; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols = symbols);
        market = self.market(get(symbols, 1, nothing));
    end
    request = Dict{Symbol, Any}();
    type_var = nothing;
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchTickers", market = market, params = params);
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicQAggTickers(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((subType == "linear"), (type_var == "swap")), (type_var == "future")))
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicQAggTickers(extend(request, params)));
    else
        response = Base.fetch(self.publicSpotGetTicker24h(extend(request, params)));
    end
    tickers = safeValue(response, "result", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        ticker = self.parseTicker(get(tickers, i + 1, nothing), market = market);
        symbol = get(ticker, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = ticker;
        end
        i += 1
    end
    return self.filterByArray(result, "symbol", values = symbols)

end
"""
fetches the bid and ask price and volume for multiple markets
see: https://doc.xt.com/docs/spot/Market/GetBestPendingOrderTicker
see: https://doc.xt.com/docs/futures/MarketData/get-ask-bid-market-information-for-all-trading-pairs

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
"""
function fetchBidsAsks(self::Xt; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        market = self.market(get(symbols, 1, nothing));
    end
    type_var = nothing;
    subType = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBidsAsks", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchBidsAsks", market = market, params = params);
    isInverse = (subType == "inverse");
    isLinear = @functions.ccxt_or(@functions.ccxt_or((subType == "linear"), (type_var == "swap")), (type_var == "future"));
    isContract = @functions.ccxt_or(isInverse, isLinear);
    response = nothing;
    if functions.ccxtruthy(isInverse)
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicQTickerBooks(extend(request, params)));
    elseif functions.ccxtruthy(isLinear)
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicQTickerBooks(extend(request, params)));
    else
        response = Base.fetch(self.publicSpotGetTickerBook(extend(request, params)));
    end
    tickers = self.safeList(response, "result", defaultValue = []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        rawTicker = get(tickers, i + 1, nothing);
        marketId = safeString(rawTicker, "s");
        marketType = functions.ccxtruthy(isContract) ? "contract" : "spot";
        marketInner = self.safeMarket(marketId = marketId, market = market, delimiter = "_", marketType = marketType);
        ticker = self.parseTicker(rawTicker, market = marketInner);
        symbol = get(ticker, Symbol("symbol"), nothing);
        if functions.ccxtruthy(symbol != nothing)
            result[Symbol(symbol)] = ticker;
        end
        i += 1
    end
    return self.filterByArray(result, "symbol", values = symbols)

end
function parseTicker(self::Xt, ticker; market=nothing)
    marketId = safeString(ticker, "s");
    marketType = functions.ccxtruthy((market != nothing)) ? get(market, Symbol("type"), nothing) : nothing;
    hasSpotKeys = @functions.ccxt_or((ccxt_in("cv", ticker)), (ccxt_in("aq", ticker)));
    if functions.ccxtruthy(marketType == nothing)
        marketType = functions.ccxtruthy(hasSpotKeys) ? "spot" : "contract";
    end
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_", marketType = marketType);
    symbol = get(market, Symbol("symbol"), nothing);
    timestamp = safeInteger(ticker, "t");
    percentage = safeString2(ticker, "cr", "r");
    if functions.ccxtruthy(percentage != nothing)
        percentage = stringMul(percentage, "100");
    end
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => self.safeNumber(ticker, "h"),
    Symbol("low") => self.safeNumber(ticker, "l"),
    Symbol("bid") => self.safeNumber(ticker, "bp"),
    Symbol("bidVolume") => self.safeNumber(ticker, "bq"),
    Symbol("ask") => self.safeNumber(ticker, "ap"),
    Symbol("askVolume") => self.safeNumber(ticker, "aq"),
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "o"),
    Symbol("close") => safeString(ticker, "c"),
    Symbol("last") => safeString(ticker, "c"),
    Symbol("previousClose") => nothing,
    Symbol("change") => self.safeNumber(ticker, "cv"),
    Symbol("percentage") => self.parseNumber(percentage),
    Symbol("average") => nothing,
    Symbol("baseVolume") => self.safeNumber2(ticker, "a", "q"),
    Symbol("quoteVolume") => self.safeNumber(ticker, "v"),
    Symbol("info") => ticker
), market = market)

end
"""
get the list of most recent trades for a particular symbol
see: https://doc.xt.com/docs/spot/Market/QueryRecentTransactions
see: https://doc.xt.com/docs/futures/MarketData/get-latest-transaction-information-of-trading-pairs

# Arguments
- `symbol`::string: unified market symbol to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
"""
function fetchTrades(self::Xt, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = min(limit, 1000);
        end
        response = Base.fetch(self.publicSpotGetTradeRecent(extend(request, params)));
    else
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("num")] = min(limit, 1000);
        end
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.publicLinearGetFutureMarketV1PublicQDeal(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.publicInverseGetFutureMarketV1PublicQDeal(extend(request, params)));
        end
    end
    trades = safeValue(response, "result", []);
    return self.parseTrades(trades, market = market)

end
"""
fetch all trades made by the user
see: https://doc.xt.com/docs/spot/Trade/QueryTrade
see: https://doc.xt.com/docs/futures/Order/see-transaction-details

# Arguments
- `symbol`::string, optional: unified market symbol to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
"""
function fetchMyTrades(self::Xt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    type_var = nothing;
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchMyTrades", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchMyTrades", market = market, params = params);
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((subType != nothing), (type_var == "swap")), (type_var == "future")))
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("size")] = limit;
        end
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInverseGetFutureTradeV1OrderTradeList(extend(request, params)));
        else
            response = Base.fetch(self.privateLinearGetFutureTradeV1OrderTradeList(extend(request, params)));
        end
    else
        marginMode = nothing;
        (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params = params);
        marginOrSpotRequest = functions.ccxtruthy((marginMode != nothing)) ? "LEVER" : "SPOT";
        request[Symbol("bizType")] = marginOrSpotRequest;
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.privateSpotGetTrade(extend(request, params)));
    end
    data = safeValue(response, "result", Dict{Symbol, Any}());
    trades = safeValue(data, "items", []);
    return self.parseTrades(trades, market = market, since = since, limit = limit)

end
function parseTrade(self::Xt, trade; market=nothing)
    marketId = safeString2(trade, "s", "symbol");
    marketType = functions.ccxtruthy((market != nothing)) ? get(market, Symbol("type"), nothing) : nothing;
    hasSpotKeys = @functions.ccxt_or(@functions.ccxt_or((ccxt_in("b", trade)), (ccxt_in("bizType", trade))), (ccxt_in("oi", trade)));
    if functions.ccxtruthy(marketType == nothing)
        marketType = functions.ccxtruthy(hasSpotKeys) ? "spot" : "contract";
    end
    market = self.safeMarket(marketId = marketId, market = market, delimiter = "_", marketType = marketType);
    side = nothing;
    takerOrMaker = nothing;
    isBuyerMaker = self.safeBool(trade, "b");
    if functions.ccxtruthy(isBuyerMaker != nothing)
        side = functions.ccxtruthy(isBuyerMaker) ? "sell" : "buy";
        takerOrMaker = "taker";
    else
        takerMaker = safeStringLower(trade, "takerMaker");
        if functions.ccxtruthy(takerMaker != nothing)
            takerOrMaker = takerMaker;
        else
            isMaker = self.safeBool(trade, "isMaker");
            if functions.ccxtruthy(isMaker != nothing)
                takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
            end
        end
        orderSide = safeStringLower(trade, "orderSide");
        if functions.ccxtruthy(orderSide != nothing)
            side = orderSide;
        else
            bidOrAsk = safeString(trade, "m");
            if functions.ccxtruthy(bidOrAsk != nothing)
                side = functions.ccxtruthy((bidOrAsk == "BID")) ? "buy" : "sell";
            end
        end
    end
    timestamp = safeIntegerN(trade, ["t", "time", "timestamp"]);
    quantity = safeString2(trade, "q", "quantity");
    amount = nothing;
    if functions.ccxtruthy(marketType == "spot")
        amount = quantity;
    else
        if functions.ccxtruthy(quantity == nothing)
            amount = stringMul(safeString(trade, "a"), numberToString(get(market, Symbol("contractSize"), nothing)));
        else
            amount = stringMul(quantity, numberToString(get(market, Symbol("contractSize"), nothing)));
        end
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeStringN(trade, ["i", "tradeId", "execId"]),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("order") => safeString2(trade, "orderId", "oi"),
    Symbol("type") => safeStringLower(trade, "orderType"),
    Symbol("side") => side,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("price") => safeString2(trade, "p", "price"),
    Symbol("amount") => amount,
    Symbol("cost") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => self.safeCurrencyCode(safeString2(trade, "feeCurrency", "feeCoin")),
        Symbol("cost") => safeString(trade, "fee")
    )
), market = market)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://doc.xt.com/docs/spot/Balance/GetBalances
see: https://doc.xt.com/docs/futures/User/GetUserFunds

# Arguments
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
"""
function fetchBalance(self::Xt; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", market = nothing, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchBalance", market = nothing, params = params);
    isContractWallet = (@functions.ccxt_or((type_var == "swap"), (type_var == "future")));
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInverseGetFutureUserV1BalanceList(params));
    elseif functions.ccxtruthy(@functions.ccxt_or((subType == "linear"), isContractWallet))
        response = Base.fetch(self.privateLinearGetFutureUserV1BalanceList(params));
    else
        response = Base.fetch(self.privateSpotGetBalances(params));
    end
    balances = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((subType != nothing), isContractWallet))
        balances = safeValue(response, "result", []);
    else
        data = safeValue(response, "result", Dict{Symbol, Any}());
        balances = safeValue(data, "assets", []);
    end
    return self.parseBalance(balances)

end
function parseBalance(self::Xt, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        balance = get(response, i + 1, nothing);
        currencyId = safeString2(balance, "currency", "coin");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        free = safeString2(balance, "availableAmount", "availableBalance");
        used = safeString(balance, "frozenAmount");
        total = safeString2(balance, "totalAmount", "walletBalance");
        if functions.ccxtruthy(used == nothing)
            crossedAndIsolatedMargin = stringAdd(safeString(balance, "crossedMargin"), safeString(balance, "isolatedMargin"));
            used = stringAdd(safeString(balance, "openOrderMarginFrozen"), crossedAndIsolatedMargin);
        end
        account[Symbol("free")] = free;
        account[Symbol("used")] = used;
        account[Symbol("total")] = total;
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
"""
create a market buy order by providing the symbol and cost
see: https://doc.xt.com/docs/spot/Order/SubmitOrder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Xt, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, price = 1, params = params))

end
"""
create a trade order
see: https://doc.xt.com/docs/spot/Order/SubmitOrder
see: https://doc.xt.com/docs/futures/Order/Create%20Orders
see: https://doc.xt.com/docs/futures/Entrust/CreateTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/CreateStopLimit

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price to fulfill the order, in units of the quote currency, can be ignored in market orders
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: 'GTC', 'IOC', 'FOK' or 'GTX'
- `params.entrustType`::string, optional: 'TAKE_PROFIT', 'STOP', 'TAKE_PROFIT_MARKET', 'STOP_MARKET', 'TRAILING_STOP_MARKET', required if stopPrice is defined, currently isn't functioning on xt's side
- `params.triggerPriceType`::string, optional: 'INDEX_PRICE', 'MARK_PRICE', 'LATEST_PRICE', required if stopPrice is defined
- `params.triggerPrice`::float, optional: price to trigger a stop order
- `params.stopPrice`::float, optional: alias for triggerPrice
- `params.stopLoss`::float, optional: price to set a stop-loss on an open position
- `params.takeProfit`::float, optional: price to set a take-profit on an open position

# Returns
- an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
function createOrder(self::Xt, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    symbol = get(market, Symbol("symbol"), nothing);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            return Base.fetch(self.createSpotOrder(symbol, type_var, side, amount, price = price, params = params))
    else
        return Base.fetch(self.createContractOrder(symbol, type_var, side, amount, price = price, params = params))
    end

end
function createSpotOrder(self::Xt, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side),
        Symbol("type") => uppercase(type_var)
    );
    timeInForce = nothing;
    marginMode = nothing;
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params = params);
    marginOrSpotRequest = functions.ccxtruthy((marginMode != nothing)) ? "LEVER" : "SPOT";
    request[Symbol("bizType")] = marginOrSpotRequest;
    if functions.ccxtruthy(type_var == "market")
        timeInForce = safeStringUpper(params, "timeInForce", "FOK");
        if functions.ccxtruthy(side == "buy")
            cost = safeString(params, "cost");
            params = omit(params, "cost");
            createMarketBuyOrderRequiresPrice = self.safeBool(self.options, "createMarketBuyOrderRequiresPrice", defaultValue = true);
            if functions.ccxtruthy(createMarketBuyOrderRequiresPrice)
                if functions.ccxtruthy(@functions.ccxt_and(price == nothing, (cost == nothing)))
                    throw(InvalidOrder(string(self.id, " createOrder() requires a price argument or cost in params for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option to false and pass in the cost to spend into the amount parameter")));
                else
                    amountString = numberToString(amount);
                    priceString = numberToString(price);
                    costCalculated = nothing;
                    if functions.ccxtruthy(price != nothing)
                        costCalculated = stringMul(amountString, priceString);
                    else
                        costCalculated = cost;
                    end
                    request[Symbol("quoteQty")] = self.costToPrecision(symbol, costCalculated);
                end
            else
                amountCost = functions.ccxtruthy((cost != nothing)) ? cost : amount;
                request[Symbol("quoteQty")] = self.costToPrecision(symbol, amountCost);
            end
        end
    else
        timeInForce = safeStringUpper(params, "timeInForce", "GTC");
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(@functions.ccxt_or((side == "sell"), (type_var == "limit")))
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    request[Symbol("timeInForce")] = timeInForce;
    response = Base.fetch(self.privateSpotPostOrder(extend(request, params)));
    order = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(order, market = market)

end
function createContractOrder(self::Xt, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("origQty") => self.amountToPrecision(symbol, amount)
    );
    timeInForce = safeStringUpper(params, "timeInForce");
    if functions.ccxtruthy(timeInForce != nothing)
        request[Symbol("timeInForce")] = timeInForce;
    end
    reduceOnly = safeValue(params, "reduceOnly", false);
    if functions.ccxtruthy(side == "buy")
        requestType = functions.ccxtruthy((reduceOnly)) ? "SHORT" : "LONG";
        request[Symbol("positionSide")] = requestType;
    else
        requestType = functions.ccxtruthy((reduceOnly)) ? "LONG" : "SHORT";
        request[Symbol("positionSide")] = requestType;
    end
    response = Dict{Symbol, Any}();
    triggerPrice = self.safeNumber2(params, "triggerPrice", "stopPrice");
    stopLoss = self.safeNumber2(params, "stopLoss", "triggerStopPrice");
    takeProfit = self.safeNumber2(params, "takeProfit", "triggerProfitPrice");
    isTrigger = (triggerPrice != nothing);
    isStopLoss = (stopLoss != nothing);
    isTakeProfit = (takeProfit != nothing);
    if functions.ccxtruthy(price != nothing)
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy((isStopLoss)), !functions.ccxtruthy((isTakeProfit))))
            request[Symbol("price")] = self.priceToPrecision(symbol, price);
        end
    end
    if functions.ccxtruthy(isTrigger)
        request[Symbol("timeInForce")] = safeStringUpper(params, "timeInForce", "GTC");
        request[Symbol("triggerPriceType")] = safeString(params, "triggerPriceType", "LATEST_PRICE");
        request[Symbol("orderSide")] =         uppercase(side);
        request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
        entrustType = functions.ccxtruthy((type_var == "market")) ? "STOP_MARKET" : "STOP";
        request[Symbol("entrustType")] = entrustType;
        params = omit(params, "triggerPrice");
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.privateLinearPostFutureTradeV1EntrustCreatePlan(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.privateInversePostFutureTradeV1EntrustCreatePlan(extend(request, params)));
        end
    elseif functions.ccxtruthy(@functions.ccxt_or(isStopLoss, isTakeProfit))
        if functions.ccxtruthy(isStopLoss)
            request[Symbol("triggerStopPrice")] = self.priceToPrecision(symbol, stopLoss);
        else
            request[Symbol("triggerProfitPrice")] = self.priceToPrecision(symbol, takeProfit);
        end
        params = omit(params, ["stopLoss", "takeProfit"]);
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.privateLinearPostFutureTradeV1EntrustCreateProfit(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.privateInversePostFutureTradeV1EntrustCreateProfit(extend(request, params)));
        end
    else
        request[Symbol("orderSide")] =         uppercase(side);
        request[Symbol("orderType")] =         uppercase(type_var);
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            response = Base.fetch(self.privateLinearPostFutureTradeV1OrderCreate(extend(request, params)));
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            response = Base.fetch(self.privateInversePostFutureTradeV1OrderCreate(extend(request, params)));
        end
    end
    return self.parseOrder(response, market = market)

end
"""
fetches information on an order made by the user
see: https://doc.xt.com/docs/spot/Order/GetSingleOrder
see: https://doc.xt.com/docs/futures/Order/see-orders-by-id
see: https://doc.xt.com/docs/futures/Entrust/SeeTriggerOrdersByEntrustId
see: https://doc.xt.com/docs/futures/Entrust/SeeStopLimitByProfitId

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
function fetchOrder(self::Xt, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    type_var = nothing;
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrder", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchOrder", market = market, params = params);
    trigger = safeValue(params, "stop");
    stopLossTakeProfit = safeValue(params, "stopLossTakeProfit");
    if functions.ccxtruthy(trigger)
        request[Symbol("entrustId")] = id;
    elseif functions.ccxtruthy(stopLossTakeProfit)
        request[Symbol("profitId")] = id;
    else
        request[Symbol("orderId")] = id;
    end
    if functions.ccxtruthy(trigger)
        params = omit(params, "stop");
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInverseGetFutureTradeV1EntrustPlanDetail(extend(request, params)));
        else
            response = Base.fetch(self.privateLinearGetFutureTradeV1EntrustPlanDetail(extend(request, params)));
        end
    elseif functions.ccxtruthy(stopLossTakeProfit)
        params = omit(params, "stopLossTakeProfit");
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInverseGetFutureTradeV1EntrustProfitDetail(extend(request, params)));
        else
            response = Base.fetch(self.privateLinearGetFutureTradeV1EntrustProfitDetail(extend(request, params)));
        end
    else
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInverseGetFutureTradeV1OrderDetail(extend(request, params)));
        elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((subType == "linear"), (type_var == "swap")), (type_var == "future")))
            response = Base.fetch(self.privateLinearGetFutureTradeV1OrderDetail(extend(request, params)));
        else
            response = Base.fetch(self.privateSpotGetOrderOrderId(extend(request, params)));
        end

    end
    order = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(order, market = market)

end
"""
fetches information on multiple orders made by the user
see: https://doc.xt.com/docs/spot/Order/QueryHistoricalOrders
see: https://doc.xt.com/docs/futures/Order/see-order-history
see: https://doc.xt.com/docs/futures/Entrust/SeeTriggerOrdersHistory

# Arguments
- `symbol`::string, optional: unified market symbol of the market the orders were made in
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
function fetchOrders(self::Xt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
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
    type_var = nothing;
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrders", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchOrders", market = market, params = params);
    trigger = safeValue2(params, "trigger", "stop");
    if functions.ccxtruthy(trigger)
        params = omit(params, ["trigger", "stop"]);
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInverseGetFutureTradeV1EntrustPlanListHistory(extend(request, params)));
        else
            response = Base.fetch(self.privateLinearGetFutureTradeV1EntrustPlanListHistory(extend(request, params)));
        end
    elseif functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInverseGetFutureTradeV1OrderListHistory(extend(request, params)));
    else
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((subType == "linear"), (type_var == "swap")), (type_var == "future")))
            response = Base.fetch(self.privateLinearGetFutureTradeV1OrderListHistory(extend(request, params)));
        else
            marginMode = nothing;
            (marginMode, params) = self.handleMarginModeAndParams("fetchOrders", params = params);
            marginOrSpotRequest = functions.ccxtruthy((marginMode != nothing)) ? "LEVER" : "SPOT";
            request[Symbol("bizType")] = marginOrSpotRequest;
            response = Base.fetch(self.privateSpotGetHistoryOrder(extend(request, params)));
        end

    end
    data = safeValue(response, "result", Dict{Symbol, Any}());
    orders = safeValue(data, "items", []);
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
function fetchOrdersByStatus(self::Xt, status; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    type_var = nothing;
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrdersByStatus", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchOrdersByStatus", market = market, params = params);
    trigger = self.safeBool2(params, "stop", "trigger");
    stopLossTakeProfit = safeValue(params, "stopLossTakeProfit");
    if functions.ccxtruthy(status == "open")
        if functions.ccxtruthy(@functions.ccxt_or(trigger, stopLossTakeProfit))
            request[Symbol("state")] = "NOT_TRIGGERED";
        elseif functions.ccxtruthy(type_var == "swap")
            request[Symbol("state")] = "UNFINISHED";
        end
    elseif functions.ccxtruthy(status == "closed")
        if functions.ccxtruthy(@functions.ccxt_or(trigger, stopLossTakeProfit))
            request[Symbol("state")] = "TRIGGERED";
        else
            request[Symbol("state")] = "FILLED";
        end
    else
        if functions.ccxtruthy(status == "canceled")
            if functions.ccxtruthy(@functions.ccxt_or(trigger, stopLossTakeProfit))
                request[Symbol("state")] = "USER_REVOCATION";
            else
                request[Symbol("state")] = "CANCELED";
            end
        else
            request[Symbol("state")] = status;
        end

    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(trigger, stopLossTakeProfit), (subType != nothing)), (type_var == "swap")), (type_var == "future")))
        if functions.ccxtruthy(since != nothing)
            request[Symbol("startTime")] = since;
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("size")] = limit;
        end
    end
    if functions.ccxtruthy(trigger)
        params = omit(params, ["stop", "trigger"]);
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInverseGetFutureTradeV1EntrustPlanList(extend(request, params)));
        else
            response = Base.fetch(self.privateLinearGetFutureTradeV1EntrustPlanList(extend(request, params)));
        end
    elseif functions.ccxtruthy(stopLossTakeProfit)
        params = omit(params, "stopLossTakeProfit");
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInverseGetFutureTradeV1EntrustProfitList(extend(request, params)));
        else
            response = Base.fetch(self.privateLinearGetFutureTradeV1EntrustProfitList(extend(request, params)));
        end
    else
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((subType != nothing), (type_var == "swap")), (type_var == "future")))
            if functions.ccxtruthy(subType == "inverse")
                response = Base.fetch(self.privateInverseGetFutureTradeV1OrderList(extend(request, params)));
            else
                response = Base.fetch(self.privateLinearGetFutureTradeV1OrderList(extend(request, params)));
            end
        else
            marginMode = nothing;
            (marginMode, params) = self.handleMarginModeAndParams("fetchOrdersByStatus", params = params);
            marginOrSpotRequest = functions.ccxtruthy((marginMode != nothing)) ? "LEVER" : "SPOT";
            request[Symbol("bizType")] = marginOrSpotRequest;
            if functions.ccxtruthy(status != "open")
                if functions.ccxtruthy(since != nothing)
                    request[Symbol("startTime")] = since;
                end
                if functions.ccxtruthy(limit != nothing)
                    request = omit(request, "size");
                    request[Symbol("limit")] = limit;
                end
                response = Base.fetch(self.privateSpotGetHistoryOrder(extend(request, params)));
            else
                response = Base.fetch(self.privateSpotGetOpenOrder(extend(request, params)));
            end
        end

    end
    orders = [];
    resultDict = self.safeDict(response, "result");
    if functions.ccxtruthy(resultDict != nothing)
        orders = self.safeList(resultDict, "items", defaultValue = []);
    else
        orders = self.safeList(response, "result", defaultValue = []);
    end
    return self.parseOrders(orders, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently open orders
see: https://doc.xt.com/docs/spot/Order/QueryOpenOrders
see: https://doc.xt.com/docs/futures/Order/see-orders
see: https://doc.xt.com/docs/futures/Entrust/SeeTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/SeeStopLimit

# Arguments
- `symbol`::string, optional: unified market symbol of the market the orders were made in
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
function fetchOpenOrders(self::Xt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("open", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on multiple closed orders made by the user
see: https://doc.xt.com/docs/spot/Order/QueryHistoricalOrders
see: https://doc.xt.com/docs/futures/Order/see-orders
see: https://doc.xt.com/docs/futures/Entrust/SeeTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/SeeStopLimit

# Arguments
- `symbol`::string, optional: unified market symbol of the market the orders were made in
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
function fetchClosedOrders(self::Xt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("closed", symbol = symbol, since = since, limit = limit, params = params))

end
"""
fetches information on multiple canceled orders made by the user
see: https://doc.xt.com/docs/spot/Order/QueryHistoricalOrders
see: https://doc.xt.com/docs/futures/Order/see-orders
see: https://doc.xt.com/docs/futures/Entrust/SeeTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/SeeStopLimit

# Arguments
- `symbol`::string, optional: unified market symbol of the market the orders were made in
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
function fetchCanceledOrders(self::Xt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("canceled", symbol = symbol, since = since, limit = limit, params = params))

end
"""
cancels an open order
see: https://doc.xt.com/docs/spot/Order/CancelOrder
see: https://doc.xt.com/docs/futures/Order/cancel-orders
see: https://doc.xt.com/docs/futures/Entrust/CancelTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/CancelStopLimit

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
function cancelOrder(self::Xt, id; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    request = Dict{Symbol, Any}();
    type_var = nothing;
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("cancelOrder", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("cancelOrder", market = market, params = params);
    trigger = safeValue2(params, "trigger", "stop");
    stopLossTakeProfit = safeValue(params, "stopLossTakeProfit");
    if functions.ccxtruthy(trigger)
        request[Symbol("entrustId")] = id;
    elseif functions.ccxtruthy(stopLossTakeProfit)
        request[Symbol("profitId")] = id;
    else
        request[Symbol("orderId")] = id;
    end
    if functions.ccxtruthy(trigger)
        params = omit(params, ["trigger", "stop"]);
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInversePostFutureTradeV1EntrustCancelPlan(extend(request, params)));
        else
            response = Base.fetch(self.privateLinearPostFutureTradeV1EntrustCancelPlan(extend(request, params)));
        end
    elseif functions.ccxtruthy(stopLossTakeProfit)
        params = omit(params, "stopLossTakeProfit");
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInversePostFutureTradeV1EntrustCancelProfitStop(extend(request, params)));
        else
            response = Base.fetch(self.privateLinearPostFutureTradeV1EntrustCancelProfitStop(extend(request, params)));
        end
    else
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInversePostFutureTradeV1OrderCancel(extend(request, params)));
        elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((subType == "linear"), (type_var == "swap")), (type_var == "future")))
            response = Base.fetch(self.privateLinearPostFutureTradeV1OrderCancel(extend(request, params)));
        else
            response = Base.fetch(self.privateSpotDeleteOrderOrderId(extend(request, params)));
        end

    end
    isContractResponse = (@functions.ccxt_or(@functions.ccxt_or((subType != nothing), (type_var == "swap")), (type_var == "future")));
    order = functions.ccxtruthy(isContractResponse) ? response : safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(order, market = market)

end
"""
cancel all open orders in a market
see: https://doc.xt.com/docs/spot/Order/CancelCurrentPendingOrder
see: https://doc.xt.com/docs/futures/Order/cancel-all-orders
see: https://doc.xt.com/docs/futures/Entrust/CancelAllTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/CancelAllStopLimit

# Arguments
- `symbol`::string, optional: unified market symbol of the market to cancel orders in
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
function cancelAllOrders(self::Xt; symbol=nothing, params=Dict())
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
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("cancelAllOrders", market = market, params = params);
    (subType, params) = self.handleSubTypeAndParams("cancelAllOrders", market = market, params = params);
    trigger = safeValue2(params, "trigger", "stop");
    stopLossTakeProfit = safeValue(params, "stopLossTakeProfit");
    if functions.ccxtruthy(trigger)
        params = omit(params, ["trigger", "stop"]);
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInversePostFutureTradeV1EntrustCancelAllPlan(extend(request, params)));
        else
            response = Base.fetch(self.privateLinearPostFutureTradeV1EntrustCancelAllPlan(extend(request, params)));
        end
    elseif functions.ccxtruthy(stopLossTakeProfit)
        params = omit(params, "stopLossTakeProfit");
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInversePostFutureTradeV1EntrustCancelAllProfitStop(extend(request, params)));
        else
            response = Base.fetch(self.privateLinearPostFutureTradeV1EntrustCancelAllProfitStop(extend(request, params)));
        end
    else
        if functions.ccxtruthy(subType == "inverse")
            response = Base.fetch(self.privateInversePostFutureTradeV1OrderCancelAll(extend(request, params)));
        elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((subType == "linear"), (type_var == "swap")), (type_var == "future")))
            response = Base.fetch(self.privateLinearPostFutureTradeV1OrderCancelAll(extend(request, params)));
        else
            marginMode = nothing;
            (marginMode, params) = self.handleMarginModeAndParams("cancelAllOrders", params = params);
            marginOrSpotRequest = functions.ccxtruthy((marginMode != nothing)) ? "LEVER" : "SPOT";
            request[Symbol("bizType")] = marginOrSpotRequest;
            response = Base.fetch(self.privateSpotDeleteOpenOrder(extend(request, params)));
        end

    end
    return [self.safeOrder(response)]

end
"""
cancel multiple orders
see: https://doc.xt.com/docs/spot/Order/CancelBatchOrder

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol of the market to cancel orders in
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
function cancelOrders(self::Xt, ids; symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderIds") => ids
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("cancelOrders", market = market, params = params);
    if functions.ccxtruthy(subType != nothing)
        throw(NotSupported(string(self.id, " cancelOrders() does not support swap and future orders, only spot orders are accepted")));
    end
    response = Base.fetch(self.privateSpotDeleteBatchOrder(extend(request, params)));
    return [self.safeOrder(response)]

end
function parseOrder(self::Xt, order; market=nothing)
    marketId = safeString(order, "symbol");
    marketType = functions.ccxtruthy(@functions.ccxt_or((ccxt_in("result", order)), (ccxt_in("positionSide", order)))) ? "contract" : "spot";
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = marketType);
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = marketType);
    timestamp = safeInteger2(order, "time", "createdTime");
    quantity = self.safeNumber(order, "origQty");
    amount = functions.ccxtruthy((marketType == "spot")) ? quantity : stringMul(numberToString(quantity), numberToString(get(market, Symbol("contractSize"), nothing)));
    filledQuantity = self.safeNumber(order, "executedQty");
    filled = functions.ccxtruthy((marketType == "spot")) ? filledQuantity : stringMul(numberToString(filledQuantity), numberToString(get(market, Symbol("contractSize"), nothing)));
    lastUpdatedTimestamp = safeInteger(order, "updatedTime");
    side = safeStringLower2(order, "side", "orderSide");
    if functions.ccxtruthy(side == nothing)
        positionSide = safeString(order, "positionSide");
        if functions.ccxtruthy(positionSide != nothing)
            if functions.ccxtruthy(positionSide == "LONG")
                side = "sell";
            else
                side = "buy";
            end
        end
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeStringN(order, ["orderId", "result", "cancelId", "entrustId", "profitId"]),
    Symbol("clientOrderId") => safeString2(order, "clientOrderId", "clientModifyId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => lastUpdatedTimestamp,
    Symbol("lastUpdateTimestamp") => lastUpdatedTimestamp,
    Symbol("symbol") => symbol,
    Symbol("type") => safeStringLower2(order, "type", "orderType"),
    Symbol("timeInForce") => safeString(order, "timeInForce"),
    Symbol("postOnly") => nothing,
    Symbol("side") => side,
    Symbol("price") => self.safeNumber(order, "price"),
    Symbol("triggerPrice") => self.safeNumber(order, "stopPrice"),
    Symbol("stopLoss") => self.safeNumber(order, "triggerStopPrice"),
    Symbol("takeProfit") => self.safeNumber(order, "triggerProfitPrice"),
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => self.safeNumber(order, "leavingQty"),
    Symbol("cost") => nothing,
    Symbol("average") => self.safeNumber(order, "avgPrice"),
    Symbol("status") => self.parseOrderStatus(safeString(order, "state")),
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => self.safeCurrencyCode(safeString(order, "feeCurrency")),
        Symbol("cost") => self.safeNumber(order, "fee")
    ),
    Symbol("trades") => nothing
), market = market)

end
function parseOrderStatus(self::Xt, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("REJECTED") => "rejected",
        Symbol("EXPIRED") => "expired",
        Symbol("UNFINISHED") => "open",
        Symbol("NOT_TRIGGERED") => "open",
        Symbol("TRIGGERING") => "open",
        Symbol("TRIGGERED") => "closed",
        Symbol("USER_REVOCATION") => "canceled",
        Symbol("PLATFORM_REVOCATION") => "rejected",
        Symbol("HISTORY") => "expired"
    );
    return safeString(statuses, status, status)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://doc.xt.com/docs/futures/User/Get%20User's%20Account%20Flow%20Information

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
"""
function fetchLedger(self::Xt; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    type_var = nothing;
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchLedger", market = nothing, params = params);
    (subType, params) = self.handleSubTypeAndParams("fetchLedger", market = nothing, params = params);
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInverseGetFutureUserV1BalanceBills(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((subType == "linear"), (type_var == "swap")), (type_var == "future")))
        response = Base.fetch(self.privateLinearGetFutureUserV1BalanceBills(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchLedger() does not support spot transactions, only swap and future wallet transactions are supported")));
    end
    data = safeValue(response, "result", Dict{Symbol, Any}());
    ledger = safeValue(data, "items", []);
    return self.parseLedger(ledger, currency = currency, since = since, limit = limit)

end
function parseLedgerEntry(self::Xt, item; currency=nothing)
    side = safeString(item, "side");
    direction = functions.ccxtruthy((side == "ADD")) ? "in" : "out";
    currencyId = safeString(item, "coin");
    currency = self.safeCurrency(currencyId, currency = currency);
    timestamp = safeInteger(item, "createdTime");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "id"),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => self.parseLedgerEntryType(safeString(item, "type")),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => self.safeNumber(item, "amount"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("before") => nothing,
    Symbol("after") => self.safeNumber(item, "afterAmount"),
    Symbol("status") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => nothing,
        Symbol("cost") => nothing
    )
), currency = currency)

end
function parseLedgerEntryType(self::Xt, type_var)
    ledgerType = Dict{Symbol, Any}(
        Symbol("EXCHANGE") => "transfer",
        Symbol("CLOSE_POSITION") => "trade",
        Symbol("TAKE_OVER") => "trade",
        Symbol("MERGE") => "trade",
        Symbol("QIANG_PING_MANAGER") => "fee",
        Symbol("FUND") => "fee",
        Symbol("FEE") => "fee",
        Symbol("ADL") => "auto-deleveraging"
    );
    return safeString(ledgerType, type_var, type_var)

end
"""
fetch the deposit address for a currency associated with this account
see: https://doc.xt.com/docs/spot/Deposit&Withdrawal/GetDepositAddress

# Arguments
- `code`::string: unified currency code
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.network`::string: required network id

# Returns
- an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
"""
function fetchDepositAddress(self::Xt, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    currency = self.currency(code);
    networkId = self.networkCodeToId(networkCode, currencyCode = code);
    self.checkRequiredArgument("fetchDepositAddress", networkId, "network");
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("chain") => networkId
    );
    response = Base.fetch(self.privateSpotGetDepositAddress(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseDepositAddress(result, currency = currency)

end
function parseDepositAddress(self::Xt, depositAddress; currency=nothing)
    address = safeString(depositAddress, "address");
    self.checkAddress(address = address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => self.safeCurrencyCode(nothing, currency = currency),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => safeString(depositAddress, "memo")
)

end
"""
fetch all deposits made to an account
see: https://doc.xt.com/docs/spot/Deposit&Withdrawal/GetDepositHistory

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of transaction structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
"""
function fetchDeposits(self::Xt; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
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
    response = Base.fetch(self.privateSpotGetDepositHistory(extend(request, params)));
    data = safeValue(response, "result", Dict{Symbol, Any}());
    deposits = safeValue(data, "items", []);
    return self.parseTransactions(deposits, currency = currency, since = since, limit = limit, params = params)

end
"""
fetch all withdrawals made from an account
see: https://doc.xt.com/docs/spot/Deposit&Withdrawal/WithdrawHistory

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of transaction structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
"""
function fetchWithdrawals(self::Xt; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
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
    response = Base.fetch(self.privateSpotGetWithdrawHistory(extend(request, params)));
    data = safeValue(response, "result", Dict{Symbol, Any}());
    withdrawals = safeValue(data, "items", []);
    return self.parseTransactions(withdrawals, currency = currency, since = since, limit = limit, params = params)

end
"""
make a withdrawal
see: https://doc.xt.com/docs/spot/Deposit&Withdrawal/Withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional:
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
"""
function withdraw(self::Xt, code, amount, address; tag=nothing, params=Dict())
    self.checkAddress(address = address);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    networkIdsByCodes = safeValue(self.options, "networks", Dict{Symbol, Any}());
    networkId = safeString2(networkIdsByCodes, networkCode, code, code);
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("chain") => networkId,
        Symbol("amount") => self.currencyToPrecision(code, amount),
        Symbol("address") => address
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("memo")] = tag;
    end
    response = Base.fetch(self.privateSpotPostWithdraw(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseTransaction(result, currency = currency)

end
function parseTransaction(self::Xt, transaction; currency=nothing)
    type_var = functions.ccxtruthy((ccxt_in("fromAddr", transaction))) ? "deposit" : "withdraw";
    timestamp = safeInteger(transaction, "createdTime");
    address = safeString(transaction, "address");
    memo = safeString(transaction, "memo");
    currencyCode = self.safeCurrencyCode(safeString(transaction, "currency"), currency = currency);
    fee = self.safeNumber(transaction, "fee");
    feeCurrency = functions.ccxtruthy((fee != nothing)) ? currencyCode : nothing;
    networkId = safeString(transaction, "chain");
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(transaction, "transactionId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("updated") => nothing,
    Symbol("addressFrom") => safeString(transaction, "fromAddr"),
    Symbol("addressTo") => address,
    Symbol("address") => address,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tag") => memo,
    Symbol("type") => type_var,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => currencyCode,
    Symbol("network") => self.networkIdToCode(networkId = networkId, currencyCode = currencyCode),
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("comment") => memo,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => feeCurrency,
        Symbol("cost") => fee,
        Symbol("rate") => nothing
    ),
    Symbol("internal") => nothing
)

end
function parseTransactionStatus(self::Xt, status)
    statuses = Dict{Symbol, Any}(
        Symbol("SUBMIT") => "pending",
        Symbol("REVIEW") => "pending",
        Symbol("AUDITED") => "pending",
        Symbol("PENDING") => "pending",
        Symbol("CANCEL") => "canceled",
        Symbol("FAIL") => "failed",
        Symbol("SUCCESS") => "ok"
    );
    return safeString(statuses, status, status)

end
"""
set the level of leverage for a market
see: https://doc.xt.com/docs/futures/User/Adjust%20Leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string: 'LONG' or 'SHORT'

# Returns
- response from the exchange
"""
function setLeverage(self::Xt, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    positionSide = safeString(params, "positionSide");
    self.checkRequiredArgument("setLeverage", positionSide, "positionSide", options = ["LONG", "SHORT"]);
    if functions.ccxtruthy(@functions.ccxt_or((functions.ccxt_lt(leverage, 1)), (functions.ccxt_gt(leverage, 125))))
        throw(BadRequest(string(self.id, " setLeverage() leverage should be between 1 and 125")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy((get(market, Symbol("contract"), nothing))))
        throw(BadSymbol(string(self.id, " setLeverage() supports contract markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("positionSide") => positionSide,
        Symbol("leverage") => leverage
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("setLeverage", market = market, params = params);
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInversePostFutureUserV1PositionAdjustLeverage(extend(request, params)));
    else
        response = Base.fetch(self.privateLinearPostFutureUserV1PositionAdjustLeverage(extend(request, params)));
    end
    return response

end
"""
add margin to a position
see: https://doc.xt.com/docs/futures/User/Alter%20Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string: 'LONG' or 'SHORT'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Xt, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "ADD", params = params))

end
"""
remove margin from a position
see: https://doc.xt.com/docs/futures/User/Alter%20Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string: 'LONG' or 'SHORT'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Xt, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "SUB", params = params))

end
function modifyMarginHelper(self::Xt, symbol, amount, addOrReduce; params=Dict())
    positionSide = safeString(params, "positionSide");
    methodName = functions.ccxtruthy((addOrReduce == "ADD")) ? "addMargin" : "reduceMargin";
    self.checkRequiredArgument(methodName, positionSide, "positionSide", options = ["LONG", "SHORT"]);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("margin") => amount,
        Symbol("type") => addOrReduce,
        Symbol("positionSide") => positionSide
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("modifyMarginHelper", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInversePostFutureUserV1PositionMargin(extend(request, params)));
    else
        response = Base.fetch(self.privateLinearPostFutureUserV1PositionMargin(extend(request, params)));
    end
    return self.parseMarginModification(response, market = market)

end
function parseMarginModification(self::Xt, data; market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("type") => nothing,
    Symbol("amount") => nothing,
    Symbol("code") => nothing,
    Symbol("symbol") => self.safeSymbol(nothing, market = market),
    Symbol("status") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("total") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
"""
retrieve information on the maximum leverage for different trade sizes
see: https://doc.xt.com/docs/futures/MarketData/see-leverage-stratification-of-single-trading-pair

# Arguments
- `symbols`::string, optional: a list of unified market symbols
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
function fetchLeverageTiers(self::Xt; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchLeverageTiers", market = nothing, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicLeverageBracketList(params));
    else
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicLeverageBracketList(params));
    end
    data = safeValue(response, "result", []);
    symbols = self.marketSymbols(symbols = symbols);
    return self.parseLeverageTiers(data, symbols = symbols, marketIdKey = "symbol")

end
function parseLeverageTiers(self::Xt, response; symbols=nothing, marketIdKey=nothing)
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = "_", marketType = "contract");
        symbol = self.safeSymbol(marketId, market = market);
        if functions.ccxtruthy(symbols != nothing)
            if functions.ccxtruthy(inArray(symbol, symbols))
                result[Symbol(symbol)] = self.parseMarketLeverageTiers(entry, market = market);
            end
        else
            result[Symbol(symbol)] = self.parseMarketLeverageTiers(get(response, i + 1, nothing), market = market);
        end
        i += 1
    end
    return result

end
"""
retrieve information on the maximum leverage for different trade sizes of a single market
see: https://doc.xt.com/docs/futures/MarketData/see-leverage-stratification-of-single-trading-pair

# Arguments
- `symbol`::string: unified market symbol
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
function fetchMarketLeverageTiers(self::Xt, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMarketLeverageTiers", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicLeverageBracketDetail(extend(request, params)));
    else
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicLeverageBracketDetail(extend(request, params)));
    end
    data = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseMarketLeverageTiers(data, market = market)

end
function parseMarketLeverageTiers(self::Xt, info; market=nothing)
    tiers = [];
    brackets = safeValue(info, "leverageBrackets", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(brackets)))
        tier = get(brackets, i + 1, nothing);
        marketId = safeString(info, "symbol");
        market = self.safeMarket(marketId = marketId, market = market, delimiter = "_", marketType = "contract");
        minNotional = self.safeNumber(get(brackets, i - 1 + 1, nothing), "maxNominalValue", defaultNumber = 0);
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => safeInteger(tier, "bracket"),
    Symbol("symbol") => self.safeSymbol(marketId, market = market, delimiter = "_", marketType = "contract"),
    Symbol("currency") => get(market, Symbol("settle"), nothing),
    Symbol("minNotional") => minNotional,
    Symbol("maxNotional") => self.safeNumber(tier, "maxNominalValue"),
    Symbol("maintenanceMarginRate") => self.safeNumber(tier, "maintMarginRate"),
    Symbol("maxLeverage") => self.safeNumber(tier, "maxLeverage"),
    Symbol("info") => tier
));
        i += 1
    end
    return tiers

end
"""
fetches historical funding rates
see: https://doc.xt.com/docs/futures/MarketData/get-funding-rate-records

# Arguments
- `symbol`::string, optional: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures] to fetch
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool: true/false whether to use the pagination helper to aumatically paginate through the results

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Xt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingRateHistory", symbol = symbol, since = since, limit = limit, params = params, cursorReceived = "id", cursorSent = "id", cursorIncrement = 1, maxEntriesPerRequest = 200))
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRateHistory() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    else
        request[Symbol("limit")] = 200;
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchFundingRateHistory", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicQFundingRateRecord(extend(request, params)));
    else
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicQFundingRateRecord(extend(request, params)));
    end
    result = safeValue(response, "result", Dict{Symbol, Any}());
    items = safeValue(result, "items", []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(items)))
        entry = get(items, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        symbolInner = self.safeSymbol(marketId, market = market);
        timestamp = safeInteger(entry, "createdTime");
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
fetch the current funding rate interval
see: https://doc.xt.com/docs/futures/MarketData/get-funding-rate-information

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingInterval(self::Xt, symbol; params=Dict())
    return Base.fetch(self.fetchFundingRate(symbol, params = params))

end
"""
fetch the current funding rate
see: https://doc.xt.com/docs/futures/MarketData/get-funding-rate-information

# Arguments
- `symbol`::string: unified market symbol
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Xt, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingRate() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchFundingRate", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicQFundingRate(extend(request, params)));
    else
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicQFundingRate(extend(request, params)));
    end
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseFundingRate(result, market = market)

end
function parseFundingRate(self::Xt, contract; market=nothing)
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "_", marketType = "swap");
    timestamp = safeInteger(contract, "nextCollectionTime");
    interval = safeString(contract, "collectionInternal");
    if functions.ccxtruthy(interval != nothing)
        interval = string(interval, "h");
    end
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("fundingTimestamp") => timestamp,
    Symbol("fundingDatetime") => self.iso8601(timestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => interval
)

end
"""
retrieves the open interest of a contract trading pair
see: https://doc.xt.com/docs/futures/MarketData/get-the-open-position-of-a-trading-pair

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
function fetchOpenInterest(self::Xt, symbol; params=Dict())
    Base.fetch(self.loadMarkets());
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(NotSupported(string(self.id, " fetchOpenInterest() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchOpenInterest", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicContractOpenInterest(extend(request, params)));
    else
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicContractOpenInterest(extend(request, params)));
    end
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOpenInterest(result, market = market)

end
function parseOpenInterest(self::Xt, interest; market=nothing)
    marketId = safeString(interest, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    timestamp = safeInteger(interest, "time");
    return self.safeOpenInterest(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("openInterestAmount") => self.safeNumber(interest, "openInterest"),
    Symbol("openInterestValue") => self.safeNumber(interest, "openInterestUsd"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("info") => interest
), market = market)

end
"""
fetch the funding history
see: https://doc.xt.com/docs/futures/User/Get%20Fund%20Fee%20Information

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the starting timestamp in milliseconds
- `limit`::int, optional: the number of entries to return
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
function fetchFundingHistory(self::Xt; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " fetchFundingHistory() supports swap contracts only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchFundingHistory", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInverseGetFutureUserV1BalanceFundingRateList(extend(request, params)));
    else
        response = Base.fetch(self.privateLinearGetFutureUserV1BalanceFundingRateList(extend(request, params)));
    end
    data = safeValue(response, "result", Dict{Symbol, Any}());
    items = safeValue(data, "items", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(items)))
        entry = get(items, i + 1, nothing);
        push!(result, self.parseFundingHistory(entry, market = market));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySinceLimit(sorted, since = since, limit = limit)

end
function parseFundingHistory(self::Xt, contract; market=nothing)
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market = market, delimiter = "_", marketType = "swap");
    currencyId = safeString(contract, "coin");
    code = self.safeCurrencyCode(currencyId);
    timestamp = safeInteger(contract, "createdTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => safeString(contract, "id"),
    Symbol("amount") => self.safeNumber(contract, "cast")
)

end
"""

# Arguments
- `breakList`::array: the "result" array of a position/break-list response
"""
function indexPositionBreakList(self::Xt, breakList)
    breakBySymbolSide = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(breakList)))
        breakEntry = get(breakList, i + 1, nothing);
        key = string(safeString(breakEntry, "symbol"), "_", safeString(breakEntry, "positionSide"));
        breakBySymbolSide[Symbol(key)] = breakEntry;
        i += 1
    end
    return breakBySymbolSide

end
"""

# Arguments
- `entry`::object: a single entry from a position/list response
- `breakBySymbolSide`::object: the result of indexPositionBreakList()
"""
function mergePositionBreakInfo(self::Xt, entry, breakBySymbolSide)
    marketId = safeString(entry, "symbol");
    key = string(marketId, "_", safeString(entry, "positionSide"));
    breakEntry = self.safeDict(breakBySymbolSide, key);
    if functions.ccxtruthy(breakEntry == nothing)
            return entry
    end
    return extend(entry, Dict{Symbol, Any}(
    Symbol("breakPrice") => safeString(breakEntry, "breakPrice"),
    Symbol("calMarkPrice") => safeString(breakEntry, "calMarkPrice")
))

end
"""
fetch data on a single open contract trade position
see: https://doc.xt.com/docs/futures/User/Get%20Position%20Information
see: https://doc.xt.com/docs/futures/User/Get%20Margin%20Call%20Information

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPosition(self::Xt, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchPosition", market = market, params = params);
    promisesUnresolved = [];
    if functions.ccxtruthy(subType == "inverse")
                push!(promisesUnresolved, self.privateInverseGetFutureUserV1PositionList(extend(request, params)));
                push!(promisesUnresolved, self.privateInverseGetFutureUserV1PositionBreakList(extend(request, params)));
    else
        push!(promisesUnresolved, self.privateLinearGetFutureUserV1PositionList(extend(request, params)));
        push!(promisesUnresolved, self.privateLinearGetFutureUserV1PositionBreakList(extend(request, params)));
    end
    (response, breakResponse) = (Base.fetch(asyncmap(Base.fetch, promisesUnresolved)));
    positions = self.safeList(response, "result", defaultValue = []);
    breakBySymbolSide = self.indexPositionBreakList(self.safeList(breakResponse, "result", defaultValue = []));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        entry = get(positions, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        marketInner = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = "contract");
        positionSize = safeString(entry, "positionSize");
        if functions.ccxtruthy(positionSize != "0")
            merged = self.mergePositionBreakInfo(entry, breakBySymbolSide);
                return self.parsePosition(merged, market = marketInner)
        end
        i += 1
    end
    throw(NullResponse(string(self.id, " fetchPosition() could not find a position for ", symbol)));

end
"""
fetch all open positions
see: https://doc.xt.com/docs/futures/User/Get%20Position%20Information
see: https://doc.xt.com/docs/futures/User/Get%20Margin%20Call%20Information

# Arguments
- `symbols`::string, optional: list of unified market symbols, not supported with xt
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Xt; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchPositions", market = nothing, params = params);
    promisesUnresolved = [];
    if functions.ccxtruthy(subType == "inverse")
                push!(promisesUnresolved, self.privateInverseGetFutureUserV1PositionList(params));
                push!(promisesUnresolved, self.privateInverseGetFutureUserV1PositionBreakList(params));
    else
        push!(promisesUnresolved, self.privateLinearGetFutureUserV1PositionList(params));
        push!(promisesUnresolved, self.privateLinearGetFutureUserV1PositionBreakList(params));
    end
    (response, breakResponse) = (Base.fetch(asyncmap(Base.fetch, promisesUnresolved)));
    positions = self.safeList(response, "result", defaultValue = []);
    breakBySymbolSide = self.indexPositionBreakList(self.safeList(breakResponse, "result", defaultValue = []));
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        entry = get(positions, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        marketInner = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = "contract");
        merged = self.mergePositionBreakInfo(entry, breakBySymbolSide);
        push!(result, self.parsePosition(merged, market = marketInner));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
"""
fetches historical closed positions
see: https://doc.xt.com/docs/futures/Entrust/GetPositionHistory

# Arguments
- `symbols`::array, optional: unified market symbols, all closed positions are returned if not assigned
- `since`::int, optional: timestamp in ms of the earliest position to fetch
- `limit`::int, optional: the maximum amount of records to fetch, default=10
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest position to fetch

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionsHistory(self::Xt; symbols=nothing, since=nothing, limit=nothing, params=Dict())
    Base.fetch(self.loadMarkets());
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength == 1)
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
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchPositionsHistory", market = market, params = params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInverseGetFutureTradeV1PositionListHistory(extend(request, params)));
    else
        response = Base.fetch(self.privateLinearGetFutureTradeV1PositionListHistory(extend(request, params)));
    end
    result = self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    items = self.safeList(result, "items", defaultValue = []);
    positions = self.parsePositions(items, symbols = symbols);
    return self.filterBySinceLimit(positions, since = since, limit = limit)

end
function parsePosition(self::Xt, position; market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "contract");
    symbol = self.safeSymbol(marketId, market = market, delimiter = nothing, marketType = "contract");
    positionType = safeString(position, "positionType");
    isCross = @functions.ccxt_or((positionType == "CROSSED"), (positionType == "1"));
    marginMode = functions.ccxtruthy((isCross)) ? "cross" : "isolated";
    collateral = self.safeNumber(position, "isolatedMargin");
    liquidationPriceString = omitZero(safeString2(position, "breakPrice", "forceMarkPrice"));
    timestamp = safeInteger(position, "closeTime");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "id"),
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("hedged") => nothing,
    Symbol("side") => safeStringLower(position, "positionSide"),
    Symbol("contracts") => self.safeNumber2(position, "positionSize", "closePositionSize"),
    Symbol("contractSize") => get(market, Symbol("contractSize"), nothing),
    Symbol("entryPrice") => self.safeNumber2(position, "entryPrice", "closeOpenPrice"),
    Symbol("markPrice") => self.safeNumber2(position, "markPrice", "calMarkPrice"),
    Symbol("lastPrice") => self.safeNumber(position, "closePrice"),
    Symbol("notional") => nothing,
    Symbol("leverage") => safeInteger2(position, "leverage", "endLeverage"),
    Symbol("collateral") => collateral,
    Symbol("initialMargin") => collateral,
    Symbol("maintenanceMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("unrealizedPnl") => nothing,
    Symbol("realizedPnl") => self.safeNumber2(position, "realizedProfit", "closeProfit"),
    Symbol("liquidationPrice") => self.parseNumber(liquidationPriceString),
    Symbol("marginMode") => marginMode,
    Symbol("percentage") => nothing,
    Symbol("marginRatio") => nothing
))

end
"""
transfer currency internally between wallets on the same account
see: https://doc.xt.com/docs/spot/Transfer/TransferBetweenUserSystems

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from -  spot, swap, leverage, finance
- `toAccount`::string: account to transfer to - spot, swap, leverage, finance
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Xt, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = safeValue(self.options, "accountsById");
    fromAccountId = safeString(accountsByType, fromAccount, fromAccount);
    toAccountId = safeString(accountsByType, toAccount, toAccount);
    amountString = self.currencyToPrecision(code, amount);
    request = Dict{Symbol, Any}(
        Symbol("bizId") => uuid(),
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("amount") => amountString,
        Symbol("from") => fromAccountId,
        Symbol("to") => toAccountId
    );
    response = Base.fetch(self.privateSpotPostBalanceTransfer(extend(request, params)));
    return self.parseTransfer(response, currency = currency)

end
function parseTransfer(self::Xt, transfer; currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => safeString(transfer, "result"),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => nothing,
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => nothing
)

end
"""
set margin mode to 'cross' or 'isolated'
see: https://doc.xt.com/docs/futures/User/Change%20Position%20Type

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string, optional: required
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string, optional: *required* "long" or "short"

# Returns
- response from the exchange
"""
function setMarginMode(self::Xt, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        throw(BadSymbol(string(self.id, " setMarginMode() supports contract markets only")));
    end
    marginMode = lowercase(marginMode);
    if functions.ccxtruthy(@functions.ccxt_and(marginMode != "isolated", marginMode != "cross"))
        throw(BadRequest(string(self.id, " setMarginMode() marginMode argument should be isolated or cross")));
    end
    if functions.ccxtruthy(marginMode == "cross")
        marginMode = "CROSSED";
    else
        marginMode = "ISOLATED";
    end
    posSide = safeStringUpper(params, "positionSide");
    self.checkRequiredArgument("setMarginMode", posSide, "positionSide", options = ["LONG", "SHORT"]);
    params = omit(params, "positionSide");
    request = Dict{Symbol, Any}(
        Symbol("positionType") => marginMode,
        Symbol("positionSide") => posSide,
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("setMarginMode", market = market, params = params);
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInversePostFutureUserV1PositionChangeType(extend(request, params)));
    else
        response = Base.fetch(self.privateLinearPostFutureUserV1PositionChangeType(extend(request, params)));
    end
    return response

end
"""
cancels an order and places a new order
see: https://doc.xt.com/docs/spot/Order/UpdateOrderLimit
see: https://doc.xt.com/docs/futures/Order/update-orders
see: https://doc.xt.com/docs/futures/Entrust/AlterStopLimit

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopLoss`::float, optional: price to set a stop-loss on an open position
- `params.takeProfit`::float, optional: price to set a take-profit on an open position

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function editOrder(self::Xt, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(amount == nothing)
        throw(ArgumentsRequired(string(self.id, " editOrder() requires an amount argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    stopLoss = self.safeNumber2(params, "stopLoss", "triggerStopPrice");
    takeProfit = self.safeNumber2(params, "takeProfit", "triggerProfitPrice");
    params = omit(params, ["stopLoss", "takeProfit"]);
    isStopLoss = (stopLoss != nothing);
    isTakeProfit = (takeProfit != nothing);
    if functions.ccxtruthy(@functions.ccxt_or(isStopLoss, isTakeProfit))
        request[Symbol("profitId")] = id;
    else
        request[Symbol("orderId")] = id;
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        if functions.ccxtruthy(isStopLoss)
            request[Symbol("triggerStopPrice")] = self.priceToPrecision(symbol, stopLoss);
        elseif functions.ccxtruthy(takeProfit != nothing)
            request[Symbol("triggerProfitPrice")] = self.priceToPrecision(symbol, takeProfit);
        else
            request[Symbol("origQty")] = self.amountToPrecision(symbol, amount);
        end
        subType = nothing;
        (subType, params) = self.handleSubTypeAndParams("editOrder", market = market, params = params);
        if functions.ccxtruthy(subType == "inverse")
            if functions.ccxtruthy(@functions.ccxt_or(isStopLoss, isTakeProfit))
                response = Base.fetch(self.privateInversePostFutureTradeV1EntrustUpdateProfitStop(extend(request, params)));
            else
                response = Base.fetch(self.privateInversePostFutureTradeV1OrderUpdate(extend(request, params)));
            end
        else
            if functions.ccxtruthy(@functions.ccxt_or(isStopLoss, isTakeProfit))
                response = Base.fetch(self.privateLinearPostFutureTradeV1EntrustUpdateProfitStop(extend(request, params)));
            else
                response = Base.fetch(self.privateLinearPostFutureTradeV1OrderUpdate(extend(request, params)));
            end
        end
    else
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
        response = Base.fetch(self.privateSpotPutOrderOrderId(extend(request, params)));
    end
    result = functions.ccxtruthy((get(market, Symbol("swap"), nothing))) ? response : self.safeDict(response, "result", defaultValue = Dict{Symbol, Any}());
    return self.parseOrder(result, market = market)

end
function handleErrors(self::Xt, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    status = safeStringUpper2(response, "msgInfo", "mc");
    if functions.ccxtruthy(@functions.ccxt_and(status != nothing, status != "SUCCESS"))
        feedback = string(self.id, " ", body);
        error = safeValue(response, "error", Dict{Symbol, Any}());
        spotErrorCode = safeString(response, "mc");
        errorCode = safeString(error, "code", spotErrorCode);
        spotMessage = safeString(response, "msgInfo");
        message = safeString(error, "msg", spotMessage);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end
function sign(self::Xt, path; api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
    signed = get(api, 1, nothing) == "private";
    endpoint = get(api, 2, nothing);
    request = string("/", self.implodeParams(path, params));
    payload = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((endpoint == "spot"), (endpoint == "user")))
        if functions.ccxtruthy(signed)
            payload = string("/", self.version, request);
        else
            payload = string("/", self.version, "/public", request);
        end
    else
        payload = request;
    end
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(endpoint), nothing), payload);
    query = omit(params, self.extractParams(path));
    urlencoded = self.urlencode(keysort(query));
    headers = Dict{Symbol, Any}(
        Symbol("Content-Type") => "application/json"
    );
    if functions.ccxtruthy(signed)
        self.checkRequiredCredentials();
        defaultRecvWindow = safeString(self.options, "recvWindow");
        recvWindow = safeString(query, "recvWindow", defaultRecvWindow);
        timestamp = numberToString(self.nonce());
        body = query;
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((payload == "/v4/order"), (payload == "/future/trade/v1/order/create")), (payload == "/future/trade/v1/entrust/create-plan")), (payload == "/future/trade/v1/entrust/create-profit")), (payload == "/future/trade/v1/order/create-batch")))
            id = "CCXT";
            if functions.ccxtruthy(body == nothing)
                throw(NullResponse(string(self.id, " sign() returned empty body")));
            end
            if functions.ccxtruthy(findfirst("future", payload) !== nothing)
                body[Symbol("clientMedia")] = id;
                if functions.ccxtruthy(body == nothing)
                    throw(NullResponse(string(self.id, " sign() returned empty body")));
                end
            else
                body[Symbol("media")] = id;
            end
        end
        isUndefinedBody = (@functions.ccxt_or(@functions.ccxt_or((method == "GET"), (path == "order/{orderId}")), (path == "ws-token")));
        if functions.ccxtruthy(@functions.ccxt_and((method == "PUT"), (endpoint == "spot")))
            isUndefinedBody = false;
        end
        body = functions.ccxtruthy(isUndefinedBody) ? nothing : json(body);
        payloadString = nothing;
        if functions.ccxtruthy(@functions.ccxt_or((endpoint == "spot"), (endpoint == "user")))
            payloadString = string("xt-validate-algorithms=HmacSHA256&xt-validate-appkey=", self.apiKey, "&xt-validate-recvwindow=", recvWindow, "&xt-validate-t", "imestamp=", timestamp);
            if functions.ccxtruthy(isUndefinedBody)
                if functions.ccxtruthy(urlencoded)
                    url += string("?", urlencoded);
                    payloadString += string("#", method, "#", payload, "#", self.rawencode(keysort(query)));
                else
                    payloadString += string("#", method, "#", payload);
                end
            else
                payloadString += string("#", method, "#", payload, "#", body);
            end
            headers[Symbol("xt-validate-algorithms")] = "HmacSHA256";
            headers[Symbol("xt-validate-recvwindow")] = recvWindow;
        else
            payloadString = string("xt-validate-appkey=", self.apiKey, "&xt-validate-t", "imestamp=", timestamp);
            if functions.ccxtruthy(method == "GET")
                if functions.ccxtruthy(urlencoded)
                    url += string("?", urlencoded);
                    payloadString += string("#", payload, "#", urlencoded);
                else
                    payloadString += string("#", payload);
                end
            else
                payloadString += string("#", payload, "#", body);
            end
        end
        signature = self.hmac(self.encode(payloadString), self.encode(self.secret), sha256);
        headers[Symbol("xt-validate-appkey")] = self.apiKey;
        headers[Symbol("xt-validate-timestamp")] = timestamp;
        headers[Symbol("xt-validate-signature")] = signature;
    else
        if functions.ccxtruthy(urlencoded)
            url += string("?", urlencoded);
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
Base.getproperty(self::Xt, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicSpotGetCurrencies(self::Xt, params=Dict(), context=Dict())
    return request(self, "currencies"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetDepth(self::Xt, params=Dict(), context=Dict())
    return request(self, "depth"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetKline(self::Xt, params=Dict(), context=Dict())
    return request(self, "kline"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetSymbol(self::Xt, params=Dict(), context=Dict())
    return request(self, "symbol"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTicker(self::Xt, params=Dict(), context=Dict())
    return request(self, "ticker"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTickerBook(self::Xt, params=Dict(), context=Dict())
    return request(self, "ticker/book"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTickerPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "ticker/price"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTicker24h(self::Xt, params=Dict(), context=Dict())
    return request(self, "ticker/24h"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTime(self::Xt, params=Dict(), context=Dict())
    return request(self, "time"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTradeHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "trade/history"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetTradeRecent(self::Xt, params=Dict(), context=Dict())
    return request(self, "trade/recent"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicSpotGetWalletSupportCurrency(self::Xt, params=Dict(), context=Dict())
    return request(self, "wallet/support/currency"; api=["public", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicContractRiskBalance(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/contract/risk-balance"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicContractOpenInterest(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/contract/open-interest"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicLeverageBracketDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/leverage/bracket/detail"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicLeverageBracketList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/leverage/bracket/list"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQAggTicker(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/agg-ticker"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQAggTickers(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/agg-tickers"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQDeal(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/deal"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQDepth(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/depth"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQFundingRate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/funding-rate"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQFundingRateRecord(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/funding-rate-record"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQIndexPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/index-price"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQKline(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/kline"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQMarkPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/mark-price"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQSymbolIndexPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/symbol-index-price"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQSymbolMarkPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/symbol-mark-price"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQTicker(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/ticker"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQTickerBooks(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/ticker/books"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicQTickers(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/tickers"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicSymbolCoins(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/coins"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicSymbolDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/detail"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicLinearGetFutureMarketV1PublicSymbolList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/list"; api=["public", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicContractRiskBalance(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/contract/risk-balance"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicContractOpenInterest(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/contract/open-interest"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicLeverageBracketDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/leverage/bracket/detail"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicLeverageBracketList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/leverage/bracket/list"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQAggTicker(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/agg-ticker"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQAggTickers(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/agg-tickers"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQDeal(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/deal"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQDepth(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/depth"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQFundingRate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/funding-rate"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQFundingRateRecord(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/funding-rate-record"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQIndexPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/index-price"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQKline(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/kline"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQMarkPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/mark-price"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQSymbolIndexPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/symbol-index-price"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQSymbolMarkPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/symbol-mark-price"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQTicker(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/ticker"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQTickerBooks(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/ticker/books"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicQTickers(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/tickers"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicSymbolCoins(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/coins"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicSymbolDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/detail"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicInverseGetFutureMarketV1PublicSymbolList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/list"; api=["public", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetBalance(self::Xt, params=Dict(), context=Dict())
    return request(self, "balance"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetBalances(self::Xt, params=Dict(), context=Dict())
    return request(self, "balances"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetBatchOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "batch-order"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetDepositAddress(self::Xt, params=Dict(), context=Dict())
    return request(self, "deposit/address"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetDepositHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "deposit/history"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetHistoryOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "history-order"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetOpenOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "open-order"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "order"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetOrderOrderId(self::Xt, params=Dict(), context=Dict())
    return request(self, "order/{orderId}"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetTrade(self::Xt, params=Dict(), context=Dict())
    return request(self, "trade"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotGetWithdrawHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "withdraw/history"; api=["private", "spot"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "order"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostWithdraw(self::Xt, params=Dict(), context=Dict())
    return request(self, "withdraw"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostBalanceTransfer(self::Xt, params=Dict(), context=Dict())
    return request(self, "balance/transfer"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostBalanceAccountTransfer(self::Xt, params=Dict(), context=Dict())
    return request(self, "balance/account/transfer"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPostWsToken(self::Xt, params=Dict(), context=Dict())
    return request(self, "ws-token"; api=["private", "spot"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotDeleteBatchOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "batch-order"; api=["private", "spot"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotDeleteOpenOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "open-order"; api=["private", "spot"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotDeleteOrderOrderId(self::Xt, params=Dict(), context=Dict())
    return request(self, "order/{orderId}"; api=["private", "spot"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateSpotPutOrderOrderId(self::Xt, params=Dict(), context=Dict())
    return request(self, "order/{orderId}"; api=["private", "spot"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureTradeV1EntrustPlanDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-detail"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureTradeV1EntrustPlanList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-list"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureTradeV1EntrustPlanListHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-list-history"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureTradeV1EntrustProfitDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/profit-detail"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureTradeV1EntrustProfitList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/profit-list"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureTradeV1OrderDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/detail"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureTradeV1OrderList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/list"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureTradeV1OrderListHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/list-history"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureTradeV1PositionListHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/position/list-history"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureTradeV1OrderTradeList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/trade-list"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureUserV1AccountInfo(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/account/info"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureUserV1BalanceBills(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/bills"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureUserV1BalanceDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/detail"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureUserV1BalanceFundingRateList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/funding-rate-list"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureUserV1BalanceList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/list"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureUserV1PositionAdl(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/adl"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureUserV1PositionBreakList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/break-list"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureUserV1PositionList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/list"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureUserV1UserCollectionList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/list"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearGetFutureUserV1UserListenKey(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/listen-key"; api=["private", "linear"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1EntrustCancelAllPlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-all-plan"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1EntrustCancelAllProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-all-profit-stop"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1EntrustCancelPlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-plan"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1EntrustCancelProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-profit-stop"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1EntrustCreatePlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/create-plan"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1EntrustCreateProfit(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/create-profit"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1EntrustUpdateProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/update-profit-stop"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1OrderCancel(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/cancel"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1OrderCancelAll(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/cancel-all"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1OrderCreate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/create"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1OrderCreateBatch(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/create-batch"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureTradeV1OrderUpdate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/update"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureUserV1AccountOpen(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/account/open"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureUserV1PositionAdjustLeverage(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/adjust-leverage"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureUserV1PositionAutoMargin(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/auto-margin"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureUserV1PositionCloseAll(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/close-all"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureUserV1PositionMargin(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/margin"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureUserV1UserCollectionAdd(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/add"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureUserV1UserCollectionCancel(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/cancel"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateLinearPostFutureUserV1PositionChangeType(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/change-type"; api=["private", "linear"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureTradeV1EntrustPlanDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-detail"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureTradeV1EntrustPlanList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-list"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureTradeV1EntrustPlanListHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-list-history"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureTradeV1EntrustProfitDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/profit-detail"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureTradeV1EntrustProfitList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/profit-list"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureTradeV1OrderDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/detail"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureTradeV1OrderList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/list"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureTradeV1OrderListHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/list-history"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureTradeV1PositionListHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/position/list-history"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureTradeV1OrderTradeList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/trade-list"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureUserV1AccountInfo(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/account/info"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureUserV1BalanceBills(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/bills"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureUserV1BalanceDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/detail"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureUserV1BalanceFundingRateList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/funding-rate-list"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureUserV1BalanceList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/list"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureUserV1PositionAdl(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/adl"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureUserV1PositionBreakList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/break-list"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureUserV1PositionList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/list"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureUserV1UserCollectionList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/list"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInverseGetFutureUserV1UserListenKey(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/listen-key"; api=["private", "inverse"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1EntrustCancelAllPlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-all-plan"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1EntrustCancelAllProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-all-profit-stop"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1EntrustCancelPlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-plan"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1EntrustCancelProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-profit-stop"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1EntrustCreatePlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/create-plan"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1EntrustCreateProfit(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/create-profit"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1EntrustUpdateProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/update-profit-stop"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1OrderCancel(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/cancel"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1OrderCancelAll(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/cancel-all"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1OrderCreate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/create"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1OrderCreateBatch(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/create-batch"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureTradeV1OrderUpdate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/update"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureUserV1AccountOpen(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/account/open"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureUserV1PositionAdjustLeverage(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/adjust-leverage"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureUserV1PositionAutoMargin(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/auto-margin"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureUserV1PositionCloseAll(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/close-all"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureUserV1PositionMargin(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/margin"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureUserV1UserCollectionAdd(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/add"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureUserV1UserCollectionCancel(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/cancel"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateInversePostFutureUserV1PositionChangeType(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/change-type"; api=["private", "inverse"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetUserAccount(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserGetUserAccountApiKey(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account/api-key"; api=["private", "user"], method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostUserAccount(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPostUserAccountApiKey(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account/api-key"; api=["private", "user"], method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserPutUserAccountApiKey(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account/api-key"; api=["private", "user"], method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateUserDeleteUserAccountApiKeyId(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account/{apiKeyId}"; api=["private", "user"], method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Xt(; kwargs...)
    inst = Xt(Exchange(), describe, nonce, fetchTime, fetchCurrencies, fetchMarkets, fetchSpotMarkets, fetchSwapAndFutureMarkets, parseMarkets, parseMarket, fetchOHLCV, parseOHLCV, fetchOrderBook, fetchTicker, fetchTickers, fetchBidsAsks, parseTicker, fetchTrades, fetchMyTrades, parseTrade, fetchBalance, parseBalance, createMarketBuyOrderWithCost, createOrder, createSpotOrder, createContractOrder, fetchOrder, fetchOrders, fetchOrdersByStatus, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, cancelOrder, cancelAllOrders, cancelOrders, parseOrder, parseOrderStatus, fetchLedger, parseLedgerEntry, parseLedgerEntryType, fetchDepositAddress, parseDepositAddress, fetchDeposits, fetchWithdrawals, withdraw, parseTransaction, parseTransactionStatus, setLeverage, addMargin, reduceMargin, modifyMarginHelper, parseMarginModification, fetchLeverageTiers, parseLeverageTiers, fetchMarketLeverageTiers, parseMarketLeverageTiers, fetchFundingRateHistory, fetchFundingInterval, fetchFundingRate, parseFundingRate, fetchOpenInterest, parseOpenInterest, fetchFundingHistory, parseFundingHistory, indexPositionBreakList, mergePositionBreakInfo, fetchPosition, fetchPositions, fetchPositionsHistory, parsePosition, transfer, parseTransfer, setMarginMode, editOrder, handleErrors, sign, publicSpotGetCurrencies, publicSpotGetDepth, publicSpotGetKline, publicSpotGetSymbol, publicSpotGetTicker, publicSpotGetTickerBook, publicSpotGetTickerPrice, publicSpotGetTicker24h, publicSpotGetTime, publicSpotGetTradeHistory, publicSpotGetTradeRecent, publicSpotGetWalletSupportCurrency, publicLinearGetFutureMarketV1PublicContractRiskBalance, publicLinearGetFutureMarketV1PublicContractOpenInterest, publicLinearGetFutureMarketV1PublicLeverageBracketDetail, publicLinearGetFutureMarketV1PublicLeverageBracketList, publicLinearGetFutureMarketV1PublicQAggTicker, publicLinearGetFutureMarketV1PublicQAggTickers, publicLinearGetFutureMarketV1PublicQDeal, publicLinearGetFutureMarketV1PublicQDepth, publicLinearGetFutureMarketV1PublicQFundingRate, publicLinearGetFutureMarketV1PublicQFundingRateRecord, publicLinearGetFutureMarketV1PublicQIndexPrice, publicLinearGetFutureMarketV1PublicQKline, publicLinearGetFutureMarketV1PublicQMarkPrice, publicLinearGetFutureMarketV1PublicQSymbolIndexPrice, publicLinearGetFutureMarketV1PublicQSymbolMarkPrice, publicLinearGetFutureMarketV1PublicQTicker, publicLinearGetFutureMarketV1PublicQTickerBooks, publicLinearGetFutureMarketV1PublicQTickers, publicLinearGetFutureMarketV1PublicSymbolCoins, publicLinearGetFutureMarketV1PublicSymbolDetail, publicLinearGetFutureMarketV1PublicSymbolList, publicInverseGetFutureMarketV1PublicContractRiskBalance, publicInverseGetFutureMarketV1PublicContractOpenInterest, publicInverseGetFutureMarketV1PublicLeverageBracketDetail, publicInverseGetFutureMarketV1PublicLeverageBracketList, publicInverseGetFutureMarketV1PublicQAggTicker, publicInverseGetFutureMarketV1PublicQAggTickers, publicInverseGetFutureMarketV1PublicQDeal, publicInverseGetFutureMarketV1PublicQDepth, publicInverseGetFutureMarketV1PublicQFundingRate, publicInverseGetFutureMarketV1PublicQFundingRateRecord, publicInverseGetFutureMarketV1PublicQIndexPrice, publicInverseGetFutureMarketV1PublicQKline, publicInverseGetFutureMarketV1PublicQMarkPrice, publicInverseGetFutureMarketV1PublicQSymbolIndexPrice, publicInverseGetFutureMarketV1PublicQSymbolMarkPrice, publicInverseGetFutureMarketV1PublicQTicker, publicInverseGetFutureMarketV1PublicQTickerBooks, publicInverseGetFutureMarketV1PublicQTickers, publicInverseGetFutureMarketV1PublicSymbolCoins, publicInverseGetFutureMarketV1PublicSymbolDetail, publicInverseGetFutureMarketV1PublicSymbolList, privateSpotGetBalance, privateSpotGetBalances, privateSpotGetBatchOrder, privateSpotGetDepositAddress, privateSpotGetDepositHistory, privateSpotGetHistoryOrder, privateSpotGetOpenOrder, privateSpotGetOrder, privateSpotGetOrderOrderId, privateSpotGetTrade, privateSpotGetWithdrawHistory, privateSpotPostOrder, privateSpotPostWithdraw, privateSpotPostBalanceTransfer, privateSpotPostBalanceAccountTransfer, privateSpotPostWsToken, privateSpotDeleteBatchOrder, privateSpotDeleteOpenOrder, privateSpotDeleteOrderOrderId, privateSpotPutOrderOrderId, privateLinearGetFutureTradeV1EntrustPlanDetail, privateLinearGetFutureTradeV1EntrustPlanList, privateLinearGetFutureTradeV1EntrustPlanListHistory, privateLinearGetFutureTradeV1EntrustProfitDetail, privateLinearGetFutureTradeV1EntrustProfitList, privateLinearGetFutureTradeV1OrderDetail, privateLinearGetFutureTradeV1OrderList, privateLinearGetFutureTradeV1OrderListHistory, privateLinearGetFutureTradeV1PositionListHistory, privateLinearGetFutureTradeV1OrderTradeList, privateLinearGetFutureUserV1AccountInfo, privateLinearGetFutureUserV1BalanceBills, privateLinearGetFutureUserV1BalanceDetail, privateLinearGetFutureUserV1BalanceFundingRateList, privateLinearGetFutureUserV1BalanceList, privateLinearGetFutureUserV1PositionAdl, privateLinearGetFutureUserV1PositionBreakList, privateLinearGetFutureUserV1PositionList, privateLinearGetFutureUserV1UserCollectionList, privateLinearGetFutureUserV1UserListenKey, privateLinearPostFutureTradeV1EntrustCancelAllPlan, privateLinearPostFutureTradeV1EntrustCancelAllProfitStop, privateLinearPostFutureTradeV1EntrustCancelPlan, privateLinearPostFutureTradeV1EntrustCancelProfitStop, privateLinearPostFutureTradeV1EntrustCreatePlan, privateLinearPostFutureTradeV1EntrustCreateProfit, privateLinearPostFutureTradeV1EntrustUpdateProfitStop, privateLinearPostFutureTradeV1OrderCancel, privateLinearPostFutureTradeV1OrderCancelAll, privateLinearPostFutureTradeV1OrderCreate, privateLinearPostFutureTradeV1OrderCreateBatch, privateLinearPostFutureTradeV1OrderUpdate, privateLinearPostFutureUserV1AccountOpen, privateLinearPostFutureUserV1PositionAdjustLeverage, privateLinearPostFutureUserV1PositionAutoMargin, privateLinearPostFutureUserV1PositionCloseAll, privateLinearPostFutureUserV1PositionMargin, privateLinearPostFutureUserV1UserCollectionAdd, privateLinearPostFutureUserV1UserCollectionCancel, privateLinearPostFutureUserV1PositionChangeType, privateInverseGetFutureTradeV1EntrustPlanDetail, privateInverseGetFutureTradeV1EntrustPlanList, privateInverseGetFutureTradeV1EntrustPlanListHistory, privateInverseGetFutureTradeV1EntrustProfitDetail, privateInverseGetFutureTradeV1EntrustProfitList, privateInverseGetFutureTradeV1OrderDetail, privateInverseGetFutureTradeV1OrderList, privateInverseGetFutureTradeV1OrderListHistory, privateInverseGetFutureTradeV1PositionListHistory, privateInverseGetFutureTradeV1OrderTradeList, privateInverseGetFutureUserV1AccountInfo, privateInverseGetFutureUserV1BalanceBills, privateInverseGetFutureUserV1BalanceDetail, privateInverseGetFutureUserV1BalanceFundingRateList, privateInverseGetFutureUserV1BalanceList, privateInverseGetFutureUserV1PositionAdl, privateInverseGetFutureUserV1PositionBreakList, privateInverseGetFutureUserV1PositionList, privateInverseGetFutureUserV1UserCollectionList, privateInverseGetFutureUserV1UserListenKey, privateInversePostFutureTradeV1EntrustCancelAllPlan, privateInversePostFutureTradeV1EntrustCancelAllProfitStop, privateInversePostFutureTradeV1EntrustCancelPlan, privateInversePostFutureTradeV1EntrustCancelProfitStop, privateInversePostFutureTradeV1EntrustCreatePlan, privateInversePostFutureTradeV1EntrustCreateProfit, privateInversePostFutureTradeV1EntrustUpdateProfitStop, privateInversePostFutureTradeV1OrderCancel, privateInversePostFutureTradeV1OrderCancelAll, privateInversePostFutureTradeV1OrderCreate, privateInversePostFutureTradeV1OrderCreateBatch, privateInversePostFutureTradeV1OrderUpdate, privateInversePostFutureUserV1AccountOpen, privateInversePostFutureUserV1PositionAdjustLeverage, privateInversePostFutureUserV1PositionAutoMargin, privateInversePostFutureUserV1PositionCloseAll, privateInversePostFutureUserV1PositionMargin, privateInversePostFutureUserV1UserCollectionAdd, privateInversePostFutureUserV1UserCollectionCancel, privateInversePostFutureUserV1PositionChangeType, privateUserGetUserAccount, privateUserGetUserAccountApiKey, privateUserPostUserAccount, privateUserPostUserAccountApiKey, privateUserPutUserAccountApiKey, privateUserDeleteUserAccountApiKeyId)
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
function __ccxt_doc_Xt_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the xt server
see: https://doc.xt.com/docs/spot/Market/GetServerTime

# Arguments
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the xt server
"""
__ccxt_doc_Xt_fetchTime

function __ccxt_doc_Xt_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://doc.xt.com/docs/spot/Deposit&Withdrawal/GetSupportedCurrencies

# Arguments
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Xt_fetchCurrencies

function __ccxt_doc_Xt_fetchMarkets() end
"""
retrieves data on all markets for xt
see: https://doc.xt.com/docs/spot/Market/GetSymbolInformation
see: https://doc.xt.com/docs/futures/MarketData/get-configuration-information-for-listed-and-tradeable-symbols

# Arguments
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Xt_fetchMarkets

function __ccxt_doc_Xt_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://doc.xt.com/docs/spot/Market/GetKlineData
see: https://doc.xt.com/docs/futures/MarketData/get-trading-pair-information-of-kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Xt_fetchOHLCV

function __ccxt_doc_Xt_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://doc.xt.com/docs/spot/Market/GetDepthData
see: https://doc.xt.com/docs/futures/MarketData/get-depth-data-of-trading-pairs

# Arguments
- `symbol`::string: unified market symbol to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure}
"""
__ccxt_doc_Xt_fetchOrderBook

function __ccxt_doc_Xt_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://doc.xt.com/docs/spot/Market/Get24hStatisticsTicker
see: https://doc.xt.com/docs/futures/MarketData/get-aggregated-market-information-for-specific-trading-pair

# Arguments
- `symbol`::string: unified market symbol to fetch the ticker for
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
"""
__ccxt_doc_Xt_fetchTicker

function __ccxt_doc_Xt_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
see: https://doc.xt.com/docs/spot/Market/Get24hStatisticsTicker
see: https://doc.xt.com/docs/futures/MarketData/get_aggregated_market_information_for_all_trading_pairs

# Arguments
- `symbols`::string, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
"""
__ccxt_doc_Xt_fetchTickers

function __ccxt_doc_Xt_fetchBidsAsks() end
"""
fetches the bid and ask price and volume for multiple markets
see: https://doc.xt.com/docs/spot/Market/GetBestPendingOrderTicker
see: https://doc.xt.com/docs/futures/MarketData/get-ask-bid-market-information-for-all-trading-pairs

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
"""
__ccxt_doc_Xt_fetchBidsAsks

function __ccxt_doc_Xt_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://doc.xt.com/docs/spot/Market/QueryRecentTransactions
see: https://doc.xt.com/docs/futures/MarketData/get-latest-transaction-information-of-trading-pairs

# Arguments
- `symbol`::string: unified market symbol to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
"""
__ccxt_doc_Xt_fetchTrades

function __ccxt_doc_Xt_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://doc.xt.com/docs/spot/Trade/QueryTrade
see: https://doc.xt.com/docs/futures/Order/see-transaction-details

# Arguments
- `symbol`::string, optional: unified market symbol to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
"""
__ccxt_doc_Xt_fetchMyTrades

function __ccxt_doc_Xt_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://doc.xt.com/docs/spot/Balance/GetBalances
see: https://doc.xt.com/docs/futures/User/GetUserFunds

# Arguments
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
"""
__ccxt_doc_Xt_fetchBalance

function __ccxt_doc_Xt_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost
see: https://doc.xt.com/docs/spot/Order/SubmitOrder

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Xt_createMarketBuyOrderWithCost

function __ccxt_doc_Xt_createOrder() end
"""
create a trade order
see: https://doc.xt.com/docs/spot/Order/SubmitOrder
see: https://doc.xt.com/docs/futures/Order/Create%20Orders
see: https://doc.xt.com/docs/futures/Entrust/CreateTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/CreateStopLimit

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much you want to trade in units of the base currency
- `price`::float, optional: the price to fulfill the order, in units of the quote currency, can be ignored in market orders
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.timeInForce`::string, optional: 'GTC', 'IOC', 'FOK' or 'GTX'
- `params.entrustType`::string, optional: 'TAKE_PROFIT', 'STOP', 'TAKE_PROFIT_MARKET', 'STOP_MARKET', 'TRAILING_STOP_MARKET', required if stopPrice is defined, currently isn't functioning on xt's side
- `params.triggerPriceType`::string, optional: 'INDEX_PRICE', 'MARK_PRICE', 'LATEST_PRICE', required if stopPrice is defined
- `params.triggerPrice`::float, optional: price to trigger a stop order
- `params.stopPrice`::float, optional: alias for triggerPrice
- `params.stopLoss`::float, optional: price to set a stop-loss on an open position
- `params.takeProfit`::float, optional: price to set a take-profit on an open position

# Returns
- an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
__ccxt_doc_Xt_createOrder

function __ccxt_doc_Xt_fetchOrder() end
"""
fetches information on an order made by the user
see: https://doc.xt.com/docs/spot/Order/GetSingleOrder
see: https://doc.xt.com/docs/futures/Order/see-orders-by-id
see: https://doc.xt.com/docs/futures/Entrust/SeeTriggerOrdersByEntrustId
see: https://doc.xt.com/docs/futures/Entrust/SeeStopLimitByProfitId

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
__ccxt_doc_Xt_fetchOrder

function __ccxt_doc_Xt_fetchOrders() end
"""
fetches information on multiple orders made by the user
see: https://doc.xt.com/docs/spot/Order/QueryHistoricalOrders
see: https://doc.xt.com/docs/futures/Order/see-order-history
see: https://doc.xt.com/docs/futures/Entrust/SeeTriggerOrdersHistory

# Arguments
- `symbol`::string, optional: unified market symbol of the market the orders were made in
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
__ccxt_doc_Xt_fetchOrders

function __ccxt_doc_Xt_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://doc.xt.com/docs/spot/Order/QueryOpenOrders
see: https://doc.xt.com/docs/futures/Order/see-orders
see: https://doc.xt.com/docs/futures/Entrust/SeeTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/SeeStopLimit

# Arguments
- `symbol`::string, optional: unified market symbol of the market the orders were made in
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of open order structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
__ccxt_doc_Xt_fetchOpenOrders

function __ccxt_doc_Xt_fetchClosedOrders() end
"""
fetches information on multiple closed orders made by the user
see: https://doc.xt.com/docs/spot/Order/QueryHistoricalOrders
see: https://doc.xt.com/docs/futures/Order/see-orders
see: https://doc.xt.com/docs/futures/Entrust/SeeTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/SeeStopLimit

# Arguments
- `symbol`::string, optional: unified market symbol of the market the orders were made in
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
__ccxt_doc_Xt_fetchClosedOrders

function __ccxt_doc_Xt_fetchCanceledOrders() end
"""
fetches information on multiple canceled orders made by the user
see: https://doc.xt.com/docs/spot/Order/QueryHistoricalOrders
see: https://doc.xt.com/docs/futures/Order/see-orders
see: https://doc.xt.com/docs/futures/Entrust/SeeTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/SeeStopLimit

# Arguments
- `symbol`::string, optional: unified market symbol of the market the orders were made in
- `since`::int, optional: timestamp in ms of the earliest order
- `limit`::int, optional: the maximum number of order structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
__ccxt_doc_Xt_fetchCanceledOrders

function __ccxt_doc_Xt_cancelOrder() end
"""
cancels an open order
see: https://doc.xt.com/docs/spot/Order/CancelOrder
see: https://doc.xt.com/docs/futures/Order/cancel-orders
see: https://doc.xt.com/docs/futures/Entrust/CancelTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/CancelStopLimit

# Arguments
- `id`::string: order id
- `symbol`::string, optional: unified symbol of the market the order was made in
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
__ccxt_doc_Xt_cancelOrder

function __ccxt_doc_Xt_cancelAllOrders() end
"""
cancel all open orders in a market
see: https://doc.xt.com/docs/spot/Order/CancelCurrentPendingOrder
see: https://doc.xt.com/docs/futures/Order/cancel-all-orders
see: https://doc.xt.com/docs/futures/Entrust/CancelAllTriggerOrders
see: https://doc.xt.com/docs/futures/Entrust/CancelAllStopLimit

# Arguments
- `symbol`::string, optional: unified market symbol of the market to cancel orders in
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.trigger`::bool, optional: if the order is a trigger order or not
- `params.stopLossTakeProfit`::bool, optional: if the order is a stop-loss or take-profit order

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
__ccxt_doc_Xt_cancelAllOrders

function __ccxt_doc_Xt_cancelOrders() end
"""
cancel multiple orders
see: https://doc.xt.com/docs/spot/Order/CancelBatchOrder

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol of the market to cancel orders in
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
"""
__ccxt_doc_Xt_cancelOrders

function __ccxt_doc_Xt_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://doc.xt.com/docs/futures/User/Get%20User's%20Account%20Flow%20Information

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: timestamp in ms of the earliest ledger entry
- `limit`::int, optional: max number of ledger entries to return
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
"""
__ccxt_doc_Xt_fetchLedger

function __ccxt_doc_Xt_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://doc.xt.com/docs/spot/Deposit&Withdrawal/GetDepositAddress

# Arguments
- `code`::string: unified currency code
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.network`::string: required network id

# Returns
- an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
"""
__ccxt_doc_Xt_fetchDepositAddress

function __ccxt_doc_Xt_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://doc.xt.com/docs/spot/Deposit&Withdrawal/GetDepositHistory

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch deposits for
- `limit`::int, optional: the maximum number of transaction structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
"""
__ccxt_doc_Xt_fetchDeposits

function __ccxt_doc_Xt_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://doc.xt.com/docs/spot/Deposit&Withdrawal/WithdrawHistory

# Arguments
- `code`::string, optional: unified currency code
- `since`::int, optional: the earliest time in ms to fetch withdrawals for
- `limit`::int, optional: the maximum number of transaction structures to retrieve
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
"""
__ccxt_doc_Xt_fetchWithdrawals

function __ccxt_doc_Xt_withdraw() end
"""
make a withdrawal
see: https://doc.xt.com/docs/spot/Deposit&Withdrawal/Withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string, optional:
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
"""
__ccxt_doc_Xt_withdraw

function __ccxt_doc_Xt_setLeverage() end
"""
set the level of leverage for a market
see: https://doc.xt.com/docs/futures/User/Adjust%20Leverage

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string: 'LONG' or 'SHORT'

# Returns
- response from the exchange
"""
__ccxt_doc_Xt_setLeverage

function __ccxt_doc_Xt_addMargin() end
"""
add margin to a position
see: https://doc.xt.com/docs/futures/User/Alter%20Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string: 'LONG' or 'SHORT'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Xt_addMargin

function __ccxt_doc_Xt_reduceMargin() end
"""
remove margin from a position
see: https://doc.xt.com/docs/futures/User/Alter%20Margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string: 'LONG' or 'SHORT'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Xt_reduceMargin

function __ccxt_doc_Xt_fetchLeverageTiers() end
"""
retrieve information on the maximum leverage for different trade sizes
see: https://doc.xt.com/docs/futures/MarketData/see-leverage-stratification-of-single-trading-pair

# Arguments
- `symbols`::string, optional: a list of unified market symbols
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
__ccxt_doc_Xt_fetchLeverageTiers

function __ccxt_doc_Xt_fetchMarketLeverageTiers() end
"""
retrieve information on the maximum leverage for different trade sizes of a single market
see: https://doc.xt.com/docs/futures/MarketData/see-leverage-stratification-of-single-trading-pair

# Arguments
- `symbol`::string: unified market symbol
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
"""
__ccxt_doc_Xt_fetchMarketLeverageTiers

function __ccxt_doc_Xt_fetchFundingRateHistory() end
"""
fetches historical funding rates
see: https://doc.xt.com/docs/futures/MarketData/get-funding-rate-records

# Arguments
- `symbol`::string, optional: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures] to fetch
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.paginate`::bool: true/false whether to use the pagination helper to aumatically paginate through the results

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
"""
__ccxt_doc_Xt_fetchFundingRateHistory

function __ccxt_doc_Xt_fetchFundingInterval() end
"""
fetch the current funding rate interval
see: https://doc.xt.com/docs/futures/MarketData/get-funding-rate-information

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Xt_fetchFundingInterval

function __ccxt_doc_Xt_fetchFundingRate() end
"""
fetch the current funding rate
see: https://doc.xt.com/docs/futures/MarketData/get-funding-rate-information

# Arguments
- `symbol`::string: unified market symbol
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Xt_fetchFundingRate

function __ccxt_doc_Xt_fetchOpenInterest() end
"""
retrieves the open interest of a contract trading pair
see: https://doc.xt.com/docs/futures/MarketData/get-the-open-position-of-a-trading-pair

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
"""
__ccxt_doc_Xt_fetchOpenInterest

function __ccxt_doc_Xt_fetchFundingHistory() end
"""
fetch the funding history
see: https://doc.xt.com/docs/futures/User/Get%20Fund%20Fee%20Information

# Arguments
- `symbol`::string: unified market symbol
- `since`::int, optional: the starting timestamp in milliseconds
- `limit`::int, optional: the number of entries to return
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
"""
__ccxt_doc_Xt_fetchFundingHistory

function __ccxt_doc_Xt_indexPositionBreakList() end
"""

# Arguments
- `breakList`::array: the "result" array of a position/break-list response
"""
__ccxt_doc_Xt_indexPositionBreakList

function __ccxt_doc_Xt_mergePositionBreakInfo() end
"""

# Arguments
- `entry`::object: a single entry from a position/list response
- `breakBySymbolSide`::object: the result of indexPositionBreakList()
"""
__ccxt_doc_Xt_mergePositionBreakInfo

function __ccxt_doc_Xt_fetchPosition() end
"""
fetch data on a single open contract trade position
see: https://doc.xt.com/docs/futures/User/Get%20Position%20Information
see: https://doc.xt.com/docs/futures/User/Get%20Margin%20Call%20Information

# Arguments
- `symbol`::string: unified market symbol of the market the position is held in
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Xt_fetchPosition

function __ccxt_doc_Xt_fetchPositions() end
"""
fetch all open positions
see: https://doc.xt.com/docs/futures/User/Get%20Position%20Information
see: https://doc.xt.com/docs/futures/User/Get%20Margin%20Call%20Information

# Arguments
- `symbols`::string, optional: list of unified market symbols, not supported with xt
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Xt_fetchPositions

function __ccxt_doc_Xt_fetchPositionsHistory() end
"""
fetches historical closed positions
see: https://doc.xt.com/docs/futures/Entrust/GetPositionHistory

# Arguments
- `symbols`::array, optional: unified market symbols, all closed positions are returned if not assigned
- `since`::int, optional: timestamp in ms of the earliest position to fetch
- `limit`::int, optional: the maximum amount of records to fetch, default=10
- `params`::object: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest position to fetch

# Returns
- a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Xt_fetchPositionsHistory

function __ccxt_doc_Xt_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://doc.xt.com/docs/spot/Transfer/TransferBetweenUserSystems

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from -  spot, swap, leverage, finance
- `toAccount`::string: account to transfer to - spot, swap, leverage, finance
- `params`::object: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Xt_transfer

function __ccxt_doc_Xt_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://doc.xt.com/docs/futures/User/Change%20Position%20Type

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string, optional: required
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.positionSide`::string, optional: *required* "long" or "short"

# Returns
- response from the exchange
"""
__ccxt_doc_Xt_setMarginMode

function __ccxt_doc_Xt_editOrder() end
"""
cancels an order and places a new order
see: https://doc.xt.com/docs/spot/Order/UpdateOrderLimit
see: https://doc.xt.com/docs/futures/Order/update-orders
see: https://doc.xt.com/docs/futures/Entrust/AlterStopLimit

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of the currency you want to trade in units of the base currency
- `price`::float, optional: the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.stopLoss`::float, optional: price to set a stop-loss on an open position
- `params.takeProfit`::float, optional: price to set a take-profit on an open position

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Xt_editOrder
