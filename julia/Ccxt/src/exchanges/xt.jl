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
    fetchFundingHistory::Function = fetchFundingHistory
    parseFundingHistory::Function = parseFundingHistory
    fetchPosition::Function = fetchPosition
    fetchPositions::Function = fetchPositions
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
    privateLinearGetFutureTradeV1OrderTradeList::Function = privateLinearGetFutureTradeV1OrderTradeList
    privateLinearGetFutureUserV1AccountInfo::Function = privateLinearGetFutureUserV1AccountInfo
    privateLinearGetFutureUserV1BalanceBills::Function = privateLinearGetFutureUserV1BalanceBills
    privateLinearGetFutureUserV1BalanceDetail::Function = privateLinearGetFutureUserV1BalanceDetail
    privateLinearGetFutureUserV1BalanceFundingRateList::Function = privateLinearGetFutureUserV1BalanceFundingRateList
    privateLinearGetFutureUserV1BalanceList::Function = privateLinearGetFutureUserV1BalanceList
    privateLinearGetFutureUserV1PositionAdl::Function = privateLinearGetFutureUserV1PositionAdl
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
    privateInverseGetFutureTradeV1OrderTradeList::Function = privateInverseGetFutureTradeV1OrderTradeList
    privateInverseGetFutureUserV1AccountInfo::Function = privateInverseGetFutureUserV1AccountInfo
    privateInverseGetFutureUserV1BalanceBills::Function = privateInverseGetFutureUserV1BalanceBills
    privateInverseGetFutureUserV1BalanceDetail::Function = privateInverseGetFutureUserV1BalanceDetail
    privateInverseGetFutureUserV1BalanceFundingRateList::Function = privateInverseGetFutureUserV1BalanceFundingRateList
    privateInverseGetFutureUserV1BalanceList::Function = privateInverseGetFutureUserV1BalanceList
    privateInverseGetFutureUserV1PositionAdl::Function = privateInverseGetFutureUserV1PositionAdl
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
        Symbol("fetchOpenInterest") => false,
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
                    Symbol("currencies") => 1,
                    Symbol("depth") => 10,
                    Symbol("kline") => 1,
                    Symbol("symbol") => 1,
                    Symbol("ticker") => 1,
                    Symbol("ticker/book") => 1,
                    Symbol("ticker/price") => 1,
                    Symbol("ticker/24h") => 1,
                    Symbol("time") => 1,
                    Symbol("trade/history") => 1,
                    Symbol("trade/recent") => 1,
                    Symbol("wallet/support/currency") => 1
                )
            ),
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("future/market/v1/public/contract/risk-balance") => 1,
                    Symbol("future/market/v1/public/contract/open-interest") => 1,
                    Symbol("future/market/v1/public/leverage/bracket/detail") => 1,
                    Symbol("future/market/v1/public/leverage/bracket/list") => 1,
                    Symbol("future/market/v1/public/q/agg-ticker") => 1,
                    Symbol("future/market/v1/public/q/agg-tickers") => 1,
                    Symbol("future/market/v1/public/q/deal") => 1,
                    Symbol("future/market/v1/public/q/depth") => 1,
                    Symbol("future/market/v1/public/q/funding-rate") => 1,
                    Symbol("future/market/v1/public/q/funding-rate-record") => 1,
                    Symbol("future/market/v1/public/q/index-price") => 1,
                    Symbol("future/market/v1/public/q/kline") => 1,
                    Symbol("future/market/v1/public/q/mark-price") => 1,
                    Symbol("future/market/v1/public/q/symbol-index-price") => 1,
                    Symbol("future/market/v1/public/q/symbol-mark-price") => 1,
                    Symbol("future/market/v1/public/q/ticker") => 1,
                    Symbol("future/market/v1/public/q/tickers") => 1,
                    Symbol("future/market/v1/public/symbol/coins") => 3.33,
                    Symbol("future/market/v1/public/symbol/detail") => 3.33,
                    Symbol("future/market/v1/public/symbol/list") => 1
                )
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("future/market/v1/public/contract/risk-balance") => 1,
                    Symbol("future/market/v1/public/contract/open-interest") => 1,
                    Symbol("future/market/v1/public/leverage/bracket/detail") => 1,
                    Symbol("future/market/v1/public/leverage/bracket/list") => 1,
                    Symbol("future/market/v1/public/q/agg-ticker") => 1,
                    Symbol("future/market/v1/public/q/agg-tickers") => 1,
                    Symbol("future/market/v1/public/q/deal") => 1,
                    Symbol("future/market/v1/public/q/depth") => 1,
                    Symbol("future/market/v1/public/q/funding-rate") => 1,
                    Symbol("future/market/v1/public/q/funding-rate-record") => 1,
                    Symbol("future/market/v1/public/q/index-price") => 1,
                    Symbol("future/market/v1/public/q/kline") => 1,
                    Symbol("future/market/v1/public/q/mark-price") => 1,
                    Symbol("future/market/v1/public/q/symbol-index-price") => 1,
                    Symbol("future/market/v1/public/q/symbol-mark-price") => 1,
                    Symbol("future/market/v1/public/q/ticker") => 1,
                    Symbol("future/market/v1/public/q/tickers") => 1,
                    Symbol("future/market/v1/public/symbol/coins") => 3.33,
                    Symbol("future/market/v1/public/symbol/detail") => 3.33,
                    Symbol("future/market/v1/public/symbol/list") => 1
                )
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("balance") => 1,
                    Symbol("balances") => 1,
                    Symbol("batch-order") => 1,
                    Symbol("deposit/address") => 1,
                    Symbol("deposit/history") => 1,
                    Symbol("history-order") => 1,
                    Symbol("open-order") => 1,
                    Symbol("order") => 1,
                    Symbol("order/{orderId}") => 1,
                    Symbol("trade") => 1,
                    Symbol("withdraw/history") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("order") => 0.2,
                    Symbol("withdraw") => 10,
                    Symbol("balance/transfer") => 1,
                    Symbol("balance/account/transfer") => 1,
                    Symbol("ws-token") => 1
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("batch-order") => 1,
                    Symbol("open-order") => 1,
                    Symbol("order/{orderId}") => 1
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("order/{orderId}") => 1
                )
            ),
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("future/trade/v1/entrust/plan-detail") => 1,
                    Symbol("future/trade/v1/entrust/plan-list") => 1,
                    Symbol("future/trade/v1/entrust/plan-list-history") => 1,
                    Symbol("future/trade/v1/entrust/profit-detail") => 1,
                    Symbol("future/trade/v1/entrust/profit-list") => 1,
                    Symbol("future/trade/v1/order/detail") => 1,
                    Symbol("future/trade/v1/order/list") => 1,
                    Symbol("future/trade/v1/order/list-history") => 1,
                    Symbol("future/trade/v1/order/trade-list") => 1,
                    Symbol("future/user/v1/account/info") => 1,
                    Symbol("future/user/v1/balance/bills") => 1,
                    Symbol("future/user/v1/balance/detail") => 1,
                    Symbol("future/user/v1/balance/funding-rate-list") => 1,
                    Symbol("future/user/v1/balance/list") => 1,
                    Symbol("future/user/v1/position/adl") => 1,
                    Symbol("future/user/v1/position/list") => 1,
                    Symbol("future/user/v1/user/collection/list") => 1,
                    Symbol("future/user/v1/user/listen-key") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("future/trade/v1/entrust/cancel-all-plan") => 1,
                    Symbol("future/trade/v1/entrust/cancel-all-profit-stop") => 1,
                    Symbol("future/trade/v1/entrust/cancel-plan") => 1,
                    Symbol("future/trade/v1/entrust/cancel-profit-stop") => 1,
                    Symbol("future/trade/v1/entrust/create-plan") => 1,
                    Symbol("future/trade/v1/entrust/create-profit") => 1,
                    Symbol("future/trade/v1/entrust/update-profit-stop") => 1,
                    Symbol("future/trade/v1/order/cancel") => 1,
                    Symbol("future/trade/v1/order/cancel-all") => 1,
                    Symbol("future/trade/v1/order/create") => 1,
                    Symbol("future/trade/v1/order/create-batch") => 1,
                    Symbol("future/trade/v1/order/update") => 1,
                    Symbol("future/user/v1/account/open") => 1,
                    Symbol("future/user/v1/position/adjust-leverage") => 1,
                    Symbol("future/user/v1/position/auto-margin") => 1,
                    Symbol("future/user/v1/position/close-all") => 1,
                    Symbol("future/user/v1/position/margin") => 1,
                    Symbol("future/user/v1/user/collection/add") => 1,
                    Symbol("future/user/v1/user/collection/cancel") => 1,
                    Symbol("future/user/v1/position/change-type") => 1
                )
            ),
            Symbol("inverse") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("future/trade/v1/entrust/plan-detail") => 1,
                    Symbol("future/trade/v1/entrust/plan-list") => 1,
                    Symbol("future/trade/v1/entrust/plan-list-history") => 1,
                    Symbol("future/trade/v1/entrust/profit-detail") => 1,
                    Symbol("future/trade/v1/entrust/profit-list") => 1,
                    Symbol("future/trade/v1/order/detail") => 1,
                    Symbol("future/trade/v1/order/list") => 1,
                    Symbol("future/trade/v1/order/list-history") => 1,
                    Symbol("future/trade/v1/order/trade-list") => 1,
                    Symbol("future/user/v1/account/info") => 1,
                    Symbol("future/user/v1/balance/bills") => 1,
                    Symbol("future/user/v1/balance/detail") => 1,
                    Symbol("future/user/v1/balance/funding-rate-list") => 1,
                    Symbol("future/user/v1/balance/list") => 1,
                    Symbol("future/user/v1/position/adl") => 1,
                    Symbol("future/user/v1/position/list") => 1,
                    Symbol("future/user/v1/user/collection/list") => 1,
                    Symbol("future/user/v1/user/listen-key") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("future/trade/v1/entrust/cancel-all-plan") => 1,
                    Symbol("future/trade/v1/entrust/cancel-all-profit-stop") => 1,
                    Symbol("future/trade/v1/entrust/cancel-plan") => 1,
                    Symbol("future/trade/v1/entrust/cancel-profit-stop") => 1,
                    Symbol("future/trade/v1/entrust/create-plan") => 1,
                    Symbol("future/trade/v1/entrust/create-profit") => 1,
                    Symbol("future/trade/v1/entrust/update-profit-stop") => 1,
                    Symbol("future/trade/v1/order/cancel") => 1,
                    Symbol("future/trade/v1/order/cancel-all") => 1,
                    Symbol("future/trade/v1/order/create") => 1,
                    Symbol("future/trade/v1/order/create-batch") => 1,
                    Symbol("future/trade/v1/order/update") => 1,
                    Symbol("future/user/v1/account/open") => 1,
                    Symbol("future/user/v1/position/adjust-leverage") => 1,
                    Symbol("future/user/v1/position/auto-margin") => 1,
                    Symbol("future/user/v1/position/close-all") => 1,
                    Symbol("future/user/v1/position/margin") => 1,
                    Symbol("future/user/v1/user/collection/add") => 1,
                    Symbol("future/user/v1/user/collection/cancel") => 1
                )
            ),
            Symbol("user") => Dict{Symbol, Any}(
                Symbol("get") => Dict{Symbol, Any}(
                    Symbol("user/account") => 1,
                    Symbol("user/account/api-key") => 1
                ),
                Symbol("post") => Dict{Symbol, Any}(
                    Symbol("user/account") => 1,
                    Symbol("user/account/api-key") => 1
                ),
                Symbol("put") => Dict{Symbol, Any}(
                    Symbol("user/account/api-key") => 1
                ),
                Symbol("delete") => Dict{Symbol, Any}(
                    Symbol("user/account/{apiKeyId}") => 1
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
                Symbol("marginMode") => false,
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
function fetchTime(self::Xt, params=Dict())
    response = Base.fetch(self.publicSpotGetTime(params));
    data = safeValue(response, "result");
    return safeInteger(data, "serverTime")

end
function fetchCurrencies(self::Xt, params=Dict())
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
            networkCode = self.networkIdToCode(networkId, code);
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
            j += 1
        end
        typeRaw = safeString(entry, "type");
        type_var = nothing;
        if functions.ccxtruthy(typeRaw == "FT")
            type_var = "crypto";
        else
            type_var = "other";
        end
        result[Symbol(code)] = self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("name") => safeString(entry, "fullName"),
    Symbol("active") => nothing,
    Symbol("fee") => nothing,
    Symbol("precision") => self.parseNumber(self.parsePrecision(safeString(entry, "maxPrecision"))),
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
        i += 1
    end
    return result

end
function fetchMarkets(self::Xt, params=Dict())
    if functions.ccxtruthy(get(self.options, Symbol("adjustForTimeDifference"), nothing))
        Base.fetch(self.loadTimeDifference());
    end
    promisesUnresolved = [self.fetchSpotMarkets(params), self.fetchSwapAndFutureMarkets(params)];
    promises = Base.fetch(asyncmap(Base.fetch, promisesUnresolved));
    spotMarkets = get(promises, 1, nothing);
    swapAndFutureMarkets = get(promises, 2, nothing);
    return arrayConcat(spotMarkets, swapAndFutureMarkets)

end
function fetchSpotMarkets(self::Xt, params=Dict())
    response = Base.fetch(self.publicSpotGetSymbol(params));
    data = safeValue(response, "result", Dict{Symbol, Any}());
    symbols = safeValue(data, "symbols", []);
    return self.parseMarkets(symbols)

end
function fetchSwapAndFutureMarkets(self::Xt, params=Dict())
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
        amountPrecision = self.parseNumber(self.parsePrecision(safeString(market, "quantityPrecision")));
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
    return self.safeMarketStructure(Dict{Symbol, Any}(
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
    Symbol("taker") => self.safeNumber(market, "takerFee"),
    Symbol("maker") => self.safeNumber(market, "makerFee"),
    Symbol("contractSize") => self.safeNumber(market, "contractSize"),
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("price") => self.parseNumber(self.parsePrecision(safeString(market, "pricePrecision"))),
        Symbol("amount") => amountPrecision,
        Symbol("base") => self.parseNumber(self.parsePrecision(safeString(market, "baseCoinPrecision"))),
        Symbol("quote") => self.parseNumber(self.parsePrecision(safeString(market, "quoteCoinPrecision")))
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
function fetchOHLCV(self::Xt, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOHLCV", "paginate", false);
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol, since, limit, timeframe, params, 1000))
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
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
    return self.parseOHLCVs(ohlcvs, market, timeframe, since, limit)

end
function parseOHLCV(self::Xt, ohlcv, market=nothing)
    isInverse = self.safeBool(market, "inverse");
    volumeIndex = functions.ccxtruthy((isInverse)) ? "v" : "a";
    return [safeInteger(ohlcv, "t"), self.safeNumber(ohlcv, "o"), self.safeNumber(ohlcv, "h"), self.safeNumber(ohlcv, "l"), self.safeNumber(ohlcv, "c"), self.safeNumber2(ohlcv, "q", volumeIndex)]

end
function fetchOrderBook(self::Xt, symbol, limit=nothing, params=Dict())
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
        ob = self.parseOrderBook(orderBook, symbol, timestamp);
        ob[Symbol("nonce")] = safeInteger(orderBook, "lastUpdateId");
            return ob
    end
    swapOb = self.parseOrderBook(orderBook, symbol, timestamp, "b", "a");
    swapOb[Symbol("nonce")] = safeInteger2(orderBook, "u", "lastUpdateId");
    return swapOb

end
function fetchTicker(self::Xt, symbol, params=Dict())
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
            return self.parseTicker(get(ticker, 1, nothing), market)
    end
    return self.parseTicker(ticker, market)

end
function fetchTickers(self::Xt, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        symbols = self.marketSymbols(symbols);
        market = self.market(get(symbols, 1, nothing));
    end
    request = Dict{Symbol, Any}();
    type_var = nothing;
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    (subType, params) = self.handleSubTypeAndParams("fetchTickers", market, params);
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
        ticker = self.parseTicker(get(tickers, i + 1, nothing), market);
        symbol = get(ticker, Symbol("symbol"), nothing);
        result[Symbol(symbol)] = ticker;
        i += 1
    end
    return self.filterByArray(result, "symbol", symbols)

end
function fetchBidsAsks(self::Xt, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        market = self.market(get(symbols, 1, nothing));
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchBidsAsks", market, params);
    if functions.ccxtruthy(subType != nothing)
        throw(NotSupported(string(self.id, " fetchBidsAsks() is not available for swap and future markets, only spot markets are supported")));
    end
    response = Base.fetch(self.publicSpotGetTickerBook(extend(request, params)));
    tickers = safeValue(response, "result", []);
    return self.parseTickers(tickers, symbols)

end
function parseTicker(self::Xt, ticker, market=nothing)
    marketId = safeString(ticker, "s");
    marketType = functions.ccxtruthy((market != nothing)) ? get(market, Symbol("type"), nothing) : nothing;
    hasSpotKeys = @functions.ccxt_or((ccxt_in("cv", ticker)), (ccxt_in("aq", ticker)));
    if functions.ccxtruthy(marketType == nothing)
        marketType = functions.ccxtruthy(hasSpotKeys) ? "spot" : "contract";
    end
    market = self.safeMarket(marketId, market, "_", marketType);
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
    Symbol("baseVolume") => self.safeNumber(ticker, "a"),
    Symbol("quoteVolume") => self.safeNumber(ticker, "v"),
    Symbol("info") => ticker
), market)

end
function fetchTrades(self::Xt, symbol, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTrades(trades, market)

end
function fetchMyTrades(self::Xt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    (type_var, params) = self.handleMarketTypeAndParams("fetchMyTrades", market, params);
    (subType, params) = self.handleSubTypeAndParams("fetchMyTrades", market, params);
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
        (marginMode, params) = self.handleMarginModeAndParams("fetchMyTrades", params);
        marginOrSpotRequest = functions.ccxtruthy((marginMode != nothing)) ? "LEVER" : "SPOT";
        request[Symbol("bizType")] = marginOrSpotRequest;
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.privateSpotGetTrade(extend(request, params)));
    end
    data = safeValue(response, "result", Dict{Symbol, Any}());
    trades = safeValue(data, "items", []);
    return self.parseTrades(trades, market, since, limit)

end
function parseTrade(self::Xt, trade, market=nothing)
    marketId = safeString2(trade, "s", "symbol");
    marketType = functions.ccxtruthy((market != nothing)) ? get(market, Symbol("type"), nothing) : nothing;
    hasSpotKeys = @functions.ccxt_or(@functions.ccxt_or((ccxt_in("b", trade)), (ccxt_in("bizType", trade))), (ccxt_in("oi", trade)));
    if functions.ccxtruthy(marketType == nothing)
        marketType = functions.ccxtruthy(hasSpotKeys) ? "spot" : "contract";
    end
    market = self.safeMarket(marketId, market, "_", marketType);
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
), market)

end
function fetchBalance(self::Xt, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    type_var = nothing;
    subType = nothing;
    response = nothing;
    (type_var, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    (subType, params) = self.handleSubTypeAndParams("fetchBalance", nothing, params);
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
        result[Symbol(code)] = account;
        i += 1
    end
    return self.safeBalance(result)

end
function createMarketBuyOrderWithCost(self::Xt, symbol, cost, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() supports spot orders only")));
    end
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, 1, params))

end
function createOrder(self::Xt, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    symbol = get(market, Symbol("symbol"), nothing);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            return Base.fetch(self.createSpotOrder(symbol, type_var, side, amount, price, params))
    else
        return Base.fetch(self.createContractOrder(symbol, type_var, side, amount, price, params))
    end

end
function createSpotOrder(self::Xt, symbol, type_var, side, amount, price=nothing, params=Dict())
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
    (marginMode, params) = self.handleMarginModeAndParams("createOrder", params);
    marginOrSpotRequest = functions.ccxtruthy((marginMode != nothing)) ? "LEVER" : "SPOT";
    request[Symbol("bizType")] = marginOrSpotRequest;
    if functions.ccxtruthy(type_var == "market")
        timeInForce = safeStringUpper(params, "timeInForce", "FOK");
        if functions.ccxtruthy(side == "buy")
            cost = safeString(params, "cost");
            params = omit(params, "cost");
            createMarketBuyOrderRequiresPrice = self.safeBool(self.options, "createMarketBuyOrderRequiresPrice", true);
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
    return self.parseOrder(order, market)

end
function createContractOrder(self::Xt, symbol, type_var, side, amount, price=nothing, params=Dict())
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
    response = nothing;
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
    return self.parseOrder(response, market)

end
function fetchOrder(self::Xt, id, symbol=nothing, params=Dict())
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
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrder", market, params);
    (subType, params) = self.handleSubTypeAndParams("fetchOrder", market, params);
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
    return self.parseOrder(order, market)

end
function fetchOrders(self::Xt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrders", market, params);
    (subType, params) = self.handleSubTypeAndParams("fetchOrders", market, params);
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
            (marginMode, params) = self.handleMarginModeAndParams("fetchOrders", params);
            marginOrSpotRequest = functions.ccxtruthy((marginMode != nothing)) ? "LEVER" : "SPOT";
            request[Symbol("bizType")] = marginOrSpotRequest;
            response = Base.fetch(self.privateSpotGetHistoryOrder(extend(request, params)));
        end

    end
    data = safeValue(response, "result", Dict{Symbol, Any}());
    orders = safeValue(data, "items", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOrdersByStatus(self::Xt, status, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    (type_var, params) = self.handleMarketTypeAndParams("fetchOrdersByStatus", market, params);
    (subType, params) = self.handleSubTypeAndParams("fetchOrdersByStatus", market, params);
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
            (marginMode, params) = self.handleMarginModeAndParams("fetchOrdersByStatus", params);
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
        orders = self.safeList(resultDict, "items", []);
    else
        orders = self.safeList(response, "result");
    end
    return self.parseOrders(orders, market, since, limit)

end
function fetchOpenOrders(self::Xt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("open", symbol, since, limit, params))

end
function fetchClosedOrders(self::Xt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("closed", symbol, since, limit, params))

end
function fetchCanceledOrders(self::Xt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchOrdersByStatus("canceled", symbol, since, limit, params))

end
function cancelOrder(self::Xt, id, symbol=nothing, params=Dict())
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
    (type_var, params) = self.handleMarketTypeAndParams("cancelOrder", market, params);
    (subType, params) = self.handleSubTypeAndParams("cancelOrder", market, params);
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
    return self.parseOrder(order, market)

end
function cancelAllOrders(self::Xt, symbol=nothing, params=Dict())
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
    (type_var, params) = self.handleMarketTypeAndParams("cancelAllOrders", market, params);
    (subType, params) = self.handleSubTypeAndParams("cancelAllOrders", market, params);
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
            (marginMode, params) = self.handleMarginModeAndParams("cancelAllOrders", params);
            marginOrSpotRequest = functions.ccxtruthy((marginMode != nothing)) ? "LEVER" : "SPOT";
            request[Symbol("bizType")] = marginOrSpotRequest;
            response = Base.fetch(self.privateSpotDeleteOpenOrder(extend(request, params)));
        end

    end
    return [self.safeOrder(response)]

end
function cancelOrders(self::Xt, ids, symbol=nothing, params=Dict())
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
    (subType, params) = self.handleSubTypeAndParams("cancelOrders", market, params);
    if functions.ccxtruthy(subType != nothing)
        throw(NotSupported(string(self.id, " cancelOrders() does not support swap and future orders, only spot orders are accepted")));
    end
    response = Base.fetch(self.privateSpotDeleteBatchOrder(extend(request, params)));
    return [self.safeOrder(response)]

end
function parseOrder(self::Xt, order, market=nothing)
    marketId = safeString(order, "symbol");
    marketType = functions.ccxtruthy(@functions.ccxt_or((ccxt_in("result", order)), (ccxt_in("positionSide", order)))) ? "contract" : "spot";
    market = self.safeMarket(marketId, market, nothing, marketType);
    symbol = self.safeSymbol(marketId, market, nothing, marketType);
    timestamp = safeInteger2(order, "time", "createdTime");
    quantity = self.safeNumber(order, "origQty");
    amount = functions.ccxtruthy((marketType == "spot")) ? quantity : stringMul(numberToString(quantity), numberToString(get(market, Symbol("contractSize"), nothing)));
    filledQuantity = self.safeNumber(order, "executedQty");
    filled = functions.ccxtruthy((marketType == "spot")) ? filledQuantity : stringMul(numberToString(filledQuantity), numberToString(get(market, Symbol("contractSize"), nothing)));
    lastUpdatedTimestamp = safeInteger(order, "updatedTime");
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
    Symbol("side") => safeStringLower2(order, "side", "orderSide"),
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
), market)

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
function fetchLedger(self::Xt, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    (type_var, params) = self.handleMarketTypeAndParams("fetchLedger", nothing, params);
    (subType, params) = self.handleSubTypeAndParams("fetchLedger", nothing, params);
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInverseGetFutureUserV1BalanceBills(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or((subType == "linear"), (type_var == "swap")), (type_var == "future")))
        response = Base.fetch(self.privateLinearGetFutureUserV1BalanceBills(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " fetchLedger() does not support spot transactions, only swap and future wallet transactions are supported")));
    end
    data = safeValue(response, "result", Dict{Symbol, Any}());
    ledger = safeValue(data, "items", []);
    return self.parseLedger(ledger, currency, since, limit)

end
function parseLedgerEntry(self::Xt, item, currency=nothing)
    side = safeString(item, "side");
    direction = functions.ccxtruthy((side == "ADD")) ? "in" : "out";
    currencyId = safeString(item, "coin");
    currency = self.safeCurrency(currencyId, currency);
    timestamp = safeInteger(item, "createdTime");
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "id"),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => self.parseLedgerEntryType(safeString(item, "type")),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency),
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
), currency)

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
function fetchDepositAddress(self::Xt, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    currency = self.currency(code);
    networkId = self.networkCodeToId(networkCode, code);
    self.checkRequiredArgument("fetchDepositAddress", networkId, "network");
    request = Dict{Symbol, Any}(
        Symbol("currency") => get(currency, Symbol("id"), nothing),
        Symbol("chain") => networkId
    );
    response = Base.fetch(self.privateSpotGetDepositAddress(extend(request, params)));
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseDepositAddress(result, currency)

end
function parseDepositAddress(self::Xt, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => self.safeCurrencyCode(nothing, currency),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => safeString(depositAddress, "memo")
)

end
function fetchDeposits(self::Xt, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTransactions(deposits, currency, since, limit, params)

end
function fetchWithdrawals(self::Xt, code=nothing, since=nothing, limit=nothing, params=Dict())
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
    return self.parseTransactions(withdrawals, currency, since, limit, params)

end
function withdraw(self::Xt, code, amount, address, tag=nothing, params=Dict())
    self.checkAddress(address);
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
    return self.parseTransaction(result, currency)

end
function parseTransaction(self::Xt, transaction, currency=nothing)
    type_var = functions.ccxtruthy((ccxt_in("fromAddr", transaction))) ? "deposit" : "withdraw";
    timestamp = safeInteger(transaction, "createdTime");
    address = safeString(transaction, "address");
    memo = safeString(transaction, "memo");
    currencyCode = self.safeCurrencyCode(safeString(transaction, "currency"), currency);
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
    Symbol("network") => self.networkIdToCode(networkId, currencyCode),
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
function setLeverage(self::Xt, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    positionSide = safeString(params, "positionSide");
    self.checkRequiredArgument("setLeverage", positionSide, "positionSide", ["LONG", "SHORT"]);
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
    (subType, params) = self.handleSubTypeAndParams("setLeverage", market, params);
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInversePostFutureUserV1PositionAdjustLeverage(extend(request, params)));
    else
        response = Base.fetch(self.privateLinearPostFutureUserV1PositionAdjustLeverage(extend(request, params)));
    end
    return response

end
function addMargin(self::Xt, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "ADD", params))

end
function reduceMargin(self::Xt, symbol, amount, params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "SUB", params))

end
function modifyMarginHelper(self::Xt, symbol, amount, addOrReduce, params=Dict())
    positionSide = safeString(params, "positionSide");
    self.checkRequiredArgument("setLeverage", positionSide, "positionSide", ["LONG", "SHORT"]);
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
    (subType, params) = self.handleSubTypeAndParams("modifyMarginHelper", market, params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInversePostFutureUserV1PositionMargin(extend(request, params)));
    else
        response = Base.fetch(self.privateLinearPostFutureUserV1PositionMargin(extend(request, params)));
    end
    return self.parseMarginModification(response, market)

end
function parseMarginModification(self::Xt, data, market=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("type") => nothing,
    Symbol("amount") => nothing,
    Symbol("code") => nothing,
    Symbol("symbol") => self.safeSymbol(nothing, market),
    Symbol("status") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("total") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing
)

end
function fetchLeverageTiers(self::Xt, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchLeverageTiers", nothing, params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicLeverageBracketList(params));
    else
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicLeverageBracketList(params));
    end
    data = safeValue(response, "result", []);
    symbols = self.marketSymbols(symbols);
    return self.parseLeverageTiers(data, symbols, "symbol")

end
function parseLeverageTiers(self::Xt, response, symbols=nothing, marketIdKey=nothing)
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        market = self.safeMarket(marketId, nothing, "_", "contract");
        symbol = self.safeSymbol(marketId, market);
        if functions.ccxtruthy(symbols != nothing)
            if functions.ccxtruthy(inArray(symbol, symbols))
                result[Symbol(symbol)] = self.parseMarketLeverageTiers(entry, market);
            end
        else
            result[Symbol(symbol)] = self.parseMarketLeverageTiers(get(response, i + 1, nothing), market);
        end
        i += 1
    end
    return result

end
function fetchMarketLeverageTiers(self::Xt, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchMarketLeverageTiers", market, params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicLeverageBracketDetail(extend(request, params)));
    else
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicLeverageBracketDetail(extend(request, params)));
    end
    data = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseMarketLeverageTiers(data, market)

end
function parseMarketLeverageTiers(self::Xt, info, market=nothing)
    tiers = [];
    brackets = safeValue(info, "leverageBrackets", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(brackets)))
        tier = get(brackets, i + 1, nothing);
        marketId = safeString(info, "symbol");
        market = self.safeMarket(marketId, market, "_", "contract");
        minNotional = self.safeNumber(get(brackets, i - 1 + 1, nothing), "maxNominalValue", 0);
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => safeInteger(tier, "bracket"),
    Symbol("symbol") => self.safeSymbol(marketId, market, "_", "contract"),
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
function fetchFundingRateHistory(self::Xt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallCursor("fetchFundingRateHistory", symbol, since, limit, params, "id", "id", 1, 200))
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
    (subType, params) = self.handleSubTypeAndParams("fetchFundingRateHistory", market, params);
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
        symbolInner = self.safeSymbol(marketId, market);
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
    return self.filterBySymbolSinceLimit(sorted, get(market, Symbol("symbol"), nothing), since, limit)

end
function fetchFundingInterval(self::Xt, symbol, params=Dict())
    return Base.fetch(self.fetchFundingRate(symbol, params))

end
function fetchFundingRate(self::Xt, symbol, params=Dict())
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
    (subType, params) = self.handleSubTypeAndParams("fetchFundingRate", market, params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.publicInverseGetFutureMarketV1PublicQFundingRate(extend(request, params)));
    else
        response = Base.fetch(self.publicLinearGetFutureMarketV1PublicQFundingRate(extend(request, params)));
    end
    result = safeValue(response, "result", Dict{Symbol, Any}());
    return self.parseFundingRate(result, market)

end
function parseFundingRate(self::Xt, contract, market=nothing)
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market, "_", "swap");
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
function fetchFundingHistory(self::Xt, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    (subType, params) = self.handleSubTypeAndParams("fetchFundingHistory", market, params);
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
        push!(result, self.parseFundingHistory(entry, market));
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterBySinceLimit(sorted, since, limit)

end
function parseFundingHistory(self::Xt, contract, market=nothing)
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market, "_", "swap");
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
function fetchPosition(self::Xt, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchPosition", market, params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInverseGetFutureUserV1PositionList(extend(request, params)));
    else
        response = Base.fetch(self.privateLinearGetFutureUserV1PositionList(extend(request, params)));
    end
    positions = safeValue(response, "result", []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        entry = get(positions, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        marketInner = self.safeMarket(marketId, nothing, nothing, "contract");
        positionSize = safeString(entry, "positionSize");
        if functions.ccxtruthy(positionSize != "0")
                return self.parsePosition(entry, marketInner)
        end
        i += 1
    end
    return nothing

end
function fetchPositions(self::Xt, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    subType = nothing;
    (subType, params) = self.handleSubTypeAndParams("fetchPositions", nothing, params);
    response = nothing;
    if functions.ccxtruthy(subType == "inverse")
        response = Base.fetch(self.privateInverseGetFutureUserV1PositionList(params));
    else
        response = Base.fetch(self.privateLinearGetFutureUserV1PositionList(params));
    end
    positions = safeValue(response, "result", []);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        entry = get(positions, i + 1, nothing);
        marketId = safeString(entry, "symbol");
        marketInner = self.safeMarket(marketId, nothing, nothing, "contract");
        push!(result, self.parsePosition(entry, marketInner));
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", symbols, false)

end
function parsePosition(self::Xt, position, market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market, nothing, "contract");
    symbol = self.safeSymbol(marketId, market, nothing, "contract");
    positionType = safeString(position, "positionType");
    marginMode = functions.ccxtruthy((positionType == "CROSSED")) ? "cross" : "isolated";
    collateral = self.safeNumber(position, "isolatedMargin");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => symbol,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("hedged") => nothing,
    Symbol("side") => safeStringLower(position, "positionSide"),
    Symbol("contracts") => self.safeNumber(position, "positionSize"),
    Symbol("contractSize") => get(market, Symbol("contractSize"), nothing),
    Symbol("entryPrice") => self.safeNumber(position, "entryPrice"),
    Symbol("markPrice") => nothing,
    Symbol("notional") => nothing,
    Symbol("leverage") => safeInteger(position, "leverage"),
    Symbol("collateral") => collateral,
    Symbol("initialMargin") => collateral,
    Symbol("maintenanceMargin") => nothing,
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("unrealizedPnl") => nothing,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginMode") => marginMode,
    Symbol("percentage") => nothing,
    Symbol("marginRatio") => nothing
))

end
function transfer(self::Xt, code, amount, fromAccount, toAccount, params=Dict())
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
    return self.parseTransfer(response, currency)

end
function parseTransfer(self::Xt, transfer, currency=nothing)
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
function setMarginMode(self::Xt, marginMode, symbol=nothing, params=Dict())
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
    if functions.ccxtruthy(posSide == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a positionSide parameter, either \"LONG\" or \"SHORT\"")));
    end
    request = Dict{Symbol, Any}(
        Symbol("positionType") => marginMode,
        Symbol("positionSide") => posSide,
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateLinearPostFutureUserV1PositionChangeType(extend(request, params)));
    return response

end
function editOrder(self::Xt, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
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
        (subType, params) = self.handleSubTypeAndParams("editOrder", market, params);
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
    result = functions.ccxtruthy((get(market, Symbol("swap"), nothing))) ? response : self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseOrder(result, market)

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
function sign(self::Xt, path, api=[], method="GET", params=Dict(), headers=nothing, body=nothing)
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
            if functions.ccxtruthy(findfirst("future", payload) !== nothing)
                body[Symbol("clientMedia")] = id;
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

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Xt, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicSpotGetCurrencies(self::Xt, params=Dict(), context=Dict())
    return request(self, "currencies", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicSpotGetDepth(self::Xt, params=Dict(), context=Dict())
    return request(self, "depth", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function publicSpotGetKline(self::Xt, params=Dict(), context=Dict())
    return request(self, "kline", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicSpotGetSymbol(self::Xt, params=Dict(), context=Dict())
    return request(self, "symbol", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicSpotGetTicker(self::Xt, params=Dict(), context=Dict())
    return request(self, "ticker", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicSpotGetTickerBook(self::Xt, params=Dict(), context=Dict())
    return request(self, "ticker/book", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicSpotGetTickerPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "ticker/price", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicSpotGetTicker24h(self::Xt, params=Dict(), context=Dict())
    return request(self, "ticker/24h", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicSpotGetTime(self::Xt, params=Dict(), context=Dict())
    return request(self, "time", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicSpotGetTradeHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "trade/history", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicSpotGetTradeRecent(self::Xt, params=Dict(), context=Dict())
    return request(self, "trade/recent", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicSpotGetWalletSupportCurrency(self::Xt, params=Dict(), context=Dict())
    return request(self, "wallet/support/currency", ["public", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicContractRiskBalance(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/contract/risk-balance", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicContractOpenInterest(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/contract/open-interest", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicLeverageBracketDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/leverage/bracket/detail", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicLeverageBracketList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/leverage/bracket/list", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQAggTicker(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/agg-ticker", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQAggTickers(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/agg-tickers", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQDeal(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/deal", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQDepth(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/depth", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQFundingRate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/funding-rate", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQFundingRateRecord(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/funding-rate-record", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQIndexPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/index-price", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQKline(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/kline", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQMarkPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/mark-price", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQSymbolIndexPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/symbol-index-price", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQSymbolMarkPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/symbol-mark-price", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQTicker(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/ticker", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicQTickers(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/tickers", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicLinearGetFutureMarketV1PublicSymbolCoins(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/coins", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 3.33))
end

function publicLinearGetFutureMarketV1PublicSymbolDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/detail", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 3.33))
end

function publicLinearGetFutureMarketV1PublicSymbolList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/list", ["public", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicContractRiskBalance(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/contract/risk-balance", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicContractOpenInterest(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/contract/open-interest", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicLeverageBracketDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/leverage/bracket/detail", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicLeverageBracketList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/leverage/bracket/list", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQAggTicker(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/agg-ticker", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQAggTickers(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/agg-tickers", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQDeal(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/deal", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQDepth(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/depth", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQFundingRate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/funding-rate", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQFundingRateRecord(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/funding-rate-record", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQIndexPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/index-price", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQKline(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/kline", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQMarkPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/mark-price", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQSymbolIndexPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/symbol-index-price", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQSymbolMarkPrice(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/symbol-mark-price", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQTicker(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/ticker", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicQTickers(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/q/tickers", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function publicInverseGetFutureMarketV1PublicSymbolCoins(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/coins", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 3.33))
end

function publicInverseGetFutureMarketV1PublicSymbolDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/detail", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 3.33))
end

function publicInverseGetFutureMarketV1PublicSymbolList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/market/v1/public/symbol/list", ["public", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetBalance(self::Xt, params=Dict(), context=Dict())
    return request(self, "balance", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetBalances(self::Xt, params=Dict(), context=Dict())
    return request(self, "balances", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetBatchOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "batch-order", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetDepositAddress(self::Xt, params=Dict(), context=Dict())
    return request(self, "deposit/address", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetDepositHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "deposit/history", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetHistoryOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "history-order", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetOpenOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "open-order", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "order", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetOrderOrderId(self::Xt, params=Dict(), context=Dict())
    return request(self, "order/{orderId}", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetTrade(self::Xt, params=Dict(), context=Dict())
    return request(self, "trade", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotGetWithdrawHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "withdraw/history", ["private", "spot"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotPostOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "order", ["private", "spot"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 0.2))
end

function privateSpotPostWithdraw(self::Xt, params=Dict(), context=Dict())
    return request(self, "withdraw", ["private", "spot"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 10))
end

function privateSpotPostBalanceTransfer(self::Xt, params=Dict(), context=Dict())
    return request(self, "balance/transfer", ["private", "spot"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotPostBalanceAccountTransfer(self::Xt, params=Dict(), context=Dict())
    return request(self, "balance/account/transfer", ["private", "spot"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotPostWsToken(self::Xt, params=Dict(), context=Dict())
    return request(self, "ws-token", ["private", "spot"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotDeleteBatchOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "batch-order", ["private", "spot"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotDeleteOpenOrder(self::Xt, params=Dict(), context=Dict())
    return request(self, "open-order", ["private", "spot"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotDeleteOrderOrderId(self::Xt, params=Dict(), context=Dict())
    return request(self, "order/{orderId}", ["private", "spot"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateSpotPutOrderOrderId(self::Xt, params=Dict(), context=Dict())
    return request(self, "order/{orderId}", ["private", "spot"], "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureTradeV1EntrustPlanDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-detail", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureTradeV1EntrustPlanList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-list", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureTradeV1EntrustPlanListHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-list-history", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureTradeV1EntrustProfitDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/profit-detail", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureTradeV1EntrustProfitList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/profit-list", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureTradeV1OrderDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/detail", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureTradeV1OrderList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/list", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureTradeV1OrderListHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/list-history", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureTradeV1OrderTradeList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/trade-list", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureUserV1AccountInfo(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/account/info", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureUserV1BalanceBills(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/bills", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureUserV1BalanceDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/detail", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureUserV1BalanceFundingRateList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/funding-rate-list", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureUserV1BalanceList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/list", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureUserV1PositionAdl(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/adl", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureUserV1PositionList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/list", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureUserV1UserCollectionList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/list", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearGetFutureUserV1UserListenKey(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/listen-key", ["private", "linear"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1EntrustCancelAllPlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-all-plan", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1EntrustCancelAllProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-all-profit-stop", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1EntrustCancelPlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-plan", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1EntrustCancelProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-profit-stop", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1EntrustCreatePlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/create-plan", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1EntrustCreateProfit(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/create-profit", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1EntrustUpdateProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/update-profit-stop", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1OrderCancel(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/cancel", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1OrderCancelAll(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/cancel-all", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1OrderCreate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/create", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1OrderCreateBatch(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/create-batch", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureTradeV1OrderUpdate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/update", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureUserV1AccountOpen(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/account/open", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureUserV1PositionAdjustLeverage(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/adjust-leverage", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureUserV1PositionAutoMargin(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/auto-margin", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureUserV1PositionCloseAll(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/close-all", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureUserV1PositionMargin(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/margin", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureUserV1UserCollectionAdd(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/add", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureUserV1UserCollectionCancel(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/cancel", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateLinearPostFutureUserV1PositionChangeType(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/change-type", ["private", "linear"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureTradeV1EntrustPlanDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-detail", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureTradeV1EntrustPlanList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-list", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureTradeV1EntrustPlanListHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/plan-list-history", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureTradeV1EntrustProfitDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/profit-detail", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureTradeV1EntrustProfitList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/profit-list", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureTradeV1OrderDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/detail", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureTradeV1OrderList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/list", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureTradeV1OrderListHistory(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/list-history", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureTradeV1OrderTradeList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/trade-list", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureUserV1AccountInfo(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/account/info", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureUserV1BalanceBills(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/bills", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureUserV1BalanceDetail(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/detail", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureUserV1BalanceFundingRateList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/funding-rate-list", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureUserV1BalanceList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/balance/list", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureUserV1PositionAdl(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/adl", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureUserV1PositionList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/list", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureUserV1UserCollectionList(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/list", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInverseGetFutureUserV1UserListenKey(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/listen-key", ["private", "inverse"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1EntrustCancelAllPlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-all-plan", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1EntrustCancelAllProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-all-profit-stop", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1EntrustCancelPlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-plan", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1EntrustCancelProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/cancel-profit-stop", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1EntrustCreatePlan(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/create-plan", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1EntrustCreateProfit(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/create-profit", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1EntrustUpdateProfitStop(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/entrust/update-profit-stop", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1OrderCancel(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/cancel", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1OrderCancelAll(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/cancel-all", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1OrderCreate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/create", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1OrderCreateBatch(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/create-batch", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureTradeV1OrderUpdate(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/trade/v1/order/update", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureUserV1AccountOpen(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/account/open", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureUserV1PositionAdjustLeverage(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/adjust-leverage", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureUserV1PositionAutoMargin(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/auto-margin", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureUserV1PositionCloseAll(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/close-all", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureUserV1PositionMargin(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/position/margin", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureUserV1UserCollectionAdd(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/add", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateInversePostFutureUserV1UserCollectionCancel(self::Xt, params=Dict(), context=Dict())
    return request(self, "future/user/v1/user/collection/cancel", ["private", "inverse"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateUserGetUserAccount(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account", ["private", "user"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateUserGetUserAccountApiKey(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account/api-key", ["private", "user"], "GET", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateUserPostUserAccount(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account", ["private", "user"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateUserPostUserAccountApiKey(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account/api-key", ["private", "user"], "POST", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateUserPutUserAccountApiKey(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account/api-key", ["private", "user"], "PUT", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function privateUserDeleteUserAccountApiKeyId(self::Xt, params=Dict(), context=Dict())
    return request(self, "user/account/{apiKeyId}", ["private", "user"], "DELETE", params, nothing, nothing, Dict(Symbol("cost") => 1))
end

function Xt(; kwargs...)
    inst = Xt(Exchange(), describe, nonce, fetchTime, fetchCurrencies, fetchMarkets, fetchSpotMarkets, fetchSwapAndFutureMarkets, parseMarkets, parseMarket, fetchOHLCV, parseOHLCV, fetchOrderBook, fetchTicker, fetchTickers, fetchBidsAsks, parseTicker, fetchTrades, fetchMyTrades, parseTrade, fetchBalance, parseBalance, createMarketBuyOrderWithCost, createOrder, createSpotOrder, createContractOrder, fetchOrder, fetchOrders, fetchOrdersByStatus, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, cancelOrder, cancelAllOrders, cancelOrders, parseOrder, parseOrderStatus, fetchLedger, parseLedgerEntry, parseLedgerEntryType, fetchDepositAddress, parseDepositAddress, fetchDeposits, fetchWithdrawals, withdraw, parseTransaction, parseTransactionStatus, setLeverage, addMargin, reduceMargin, modifyMarginHelper, parseMarginModification, fetchLeverageTiers, parseLeverageTiers, fetchMarketLeverageTiers, parseMarketLeverageTiers, fetchFundingRateHistory, fetchFundingInterval, fetchFundingRate, parseFundingRate, fetchFundingHistory, parseFundingHistory, fetchPosition, fetchPositions, parsePosition, transfer, parseTransfer, setMarginMode, editOrder, handleErrors, sign, publicSpotGetCurrencies, publicSpotGetDepth, publicSpotGetKline, publicSpotGetSymbol, publicSpotGetTicker, publicSpotGetTickerBook, publicSpotGetTickerPrice, publicSpotGetTicker24h, publicSpotGetTime, publicSpotGetTradeHistory, publicSpotGetTradeRecent, publicSpotGetWalletSupportCurrency, publicLinearGetFutureMarketV1PublicContractRiskBalance, publicLinearGetFutureMarketV1PublicContractOpenInterest, publicLinearGetFutureMarketV1PublicLeverageBracketDetail, publicLinearGetFutureMarketV1PublicLeverageBracketList, publicLinearGetFutureMarketV1PublicQAggTicker, publicLinearGetFutureMarketV1PublicQAggTickers, publicLinearGetFutureMarketV1PublicQDeal, publicLinearGetFutureMarketV1PublicQDepth, publicLinearGetFutureMarketV1PublicQFundingRate, publicLinearGetFutureMarketV1PublicQFundingRateRecord, publicLinearGetFutureMarketV1PublicQIndexPrice, publicLinearGetFutureMarketV1PublicQKline, publicLinearGetFutureMarketV1PublicQMarkPrice, publicLinearGetFutureMarketV1PublicQSymbolIndexPrice, publicLinearGetFutureMarketV1PublicQSymbolMarkPrice, publicLinearGetFutureMarketV1PublicQTicker, publicLinearGetFutureMarketV1PublicQTickers, publicLinearGetFutureMarketV1PublicSymbolCoins, publicLinearGetFutureMarketV1PublicSymbolDetail, publicLinearGetFutureMarketV1PublicSymbolList, publicInverseGetFutureMarketV1PublicContractRiskBalance, publicInverseGetFutureMarketV1PublicContractOpenInterest, publicInverseGetFutureMarketV1PublicLeverageBracketDetail, publicInverseGetFutureMarketV1PublicLeverageBracketList, publicInverseGetFutureMarketV1PublicQAggTicker, publicInverseGetFutureMarketV1PublicQAggTickers, publicInverseGetFutureMarketV1PublicQDeal, publicInverseGetFutureMarketV1PublicQDepth, publicInverseGetFutureMarketV1PublicQFundingRate, publicInverseGetFutureMarketV1PublicQFundingRateRecord, publicInverseGetFutureMarketV1PublicQIndexPrice, publicInverseGetFutureMarketV1PublicQKline, publicInverseGetFutureMarketV1PublicQMarkPrice, publicInverseGetFutureMarketV1PublicQSymbolIndexPrice, publicInverseGetFutureMarketV1PublicQSymbolMarkPrice, publicInverseGetFutureMarketV1PublicQTicker, publicInverseGetFutureMarketV1PublicQTickers, publicInverseGetFutureMarketV1PublicSymbolCoins, publicInverseGetFutureMarketV1PublicSymbolDetail, publicInverseGetFutureMarketV1PublicSymbolList, privateSpotGetBalance, privateSpotGetBalances, privateSpotGetBatchOrder, privateSpotGetDepositAddress, privateSpotGetDepositHistory, privateSpotGetHistoryOrder, privateSpotGetOpenOrder, privateSpotGetOrder, privateSpotGetOrderOrderId, privateSpotGetTrade, privateSpotGetWithdrawHistory, privateSpotPostOrder, privateSpotPostWithdraw, privateSpotPostBalanceTransfer, privateSpotPostBalanceAccountTransfer, privateSpotPostWsToken, privateSpotDeleteBatchOrder, privateSpotDeleteOpenOrder, privateSpotDeleteOrderOrderId, privateSpotPutOrderOrderId, privateLinearGetFutureTradeV1EntrustPlanDetail, privateLinearGetFutureTradeV1EntrustPlanList, privateLinearGetFutureTradeV1EntrustPlanListHistory, privateLinearGetFutureTradeV1EntrustProfitDetail, privateLinearGetFutureTradeV1EntrustProfitList, privateLinearGetFutureTradeV1OrderDetail, privateLinearGetFutureTradeV1OrderList, privateLinearGetFutureTradeV1OrderListHistory, privateLinearGetFutureTradeV1OrderTradeList, privateLinearGetFutureUserV1AccountInfo, privateLinearGetFutureUserV1BalanceBills, privateLinearGetFutureUserV1BalanceDetail, privateLinearGetFutureUserV1BalanceFundingRateList, privateLinearGetFutureUserV1BalanceList, privateLinearGetFutureUserV1PositionAdl, privateLinearGetFutureUserV1PositionList, privateLinearGetFutureUserV1UserCollectionList, privateLinearGetFutureUserV1UserListenKey, privateLinearPostFutureTradeV1EntrustCancelAllPlan, privateLinearPostFutureTradeV1EntrustCancelAllProfitStop, privateLinearPostFutureTradeV1EntrustCancelPlan, privateLinearPostFutureTradeV1EntrustCancelProfitStop, privateLinearPostFutureTradeV1EntrustCreatePlan, privateLinearPostFutureTradeV1EntrustCreateProfit, privateLinearPostFutureTradeV1EntrustUpdateProfitStop, privateLinearPostFutureTradeV1OrderCancel, privateLinearPostFutureTradeV1OrderCancelAll, privateLinearPostFutureTradeV1OrderCreate, privateLinearPostFutureTradeV1OrderCreateBatch, privateLinearPostFutureTradeV1OrderUpdate, privateLinearPostFutureUserV1AccountOpen, privateLinearPostFutureUserV1PositionAdjustLeverage, privateLinearPostFutureUserV1PositionAutoMargin, privateLinearPostFutureUserV1PositionCloseAll, privateLinearPostFutureUserV1PositionMargin, privateLinearPostFutureUserV1UserCollectionAdd, privateLinearPostFutureUserV1UserCollectionCancel, privateLinearPostFutureUserV1PositionChangeType, privateInverseGetFutureTradeV1EntrustPlanDetail, privateInverseGetFutureTradeV1EntrustPlanList, privateInverseGetFutureTradeV1EntrustPlanListHistory, privateInverseGetFutureTradeV1EntrustProfitDetail, privateInverseGetFutureTradeV1EntrustProfitList, privateInverseGetFutureTradeV1OrderDetail, privateInverseGetFutureTradeV1OrderList, privateInverseGetFutureTradeV1OrderListHistory, privateInverseGetFutureTradeV1OrderTradeList, privateInverseGetFutureUserV1AccountInfo, privateInverseGetFutureUserV1BalanceBills, privateInverseGetFutureUserV1BalanceDetail, privateInverseGetFutureUserV1BalanceFundingRateList, privateInverseGetFutureUserV1BalanceList, privateInverseGetFutureUserV1PositionAdl, privateInverseGetFutureUserV1PositionList, privateInverseGetFutureUserV1UserCollectionList, privateInverseGetFutureUserV1UserListenKey, privateInversePostFutureTradeV1EntrustCancelAllPlan, privateInversePostFutureTradeV1EntrustCancelAllProfitStop, privateInversePostFutureTradeV1EntrustCancelPlan, privateInversePostFutureTradeV1EntrustCancelProfitStop, privateInversePostFutureTradeV1EntrustCreatePlan, privateInversePostFutureTradeV1EntrustCreateProfit, privateInversePostFutureTradeV1EntrustUpdateProfitStop, privateInversePostFutureTradeV1OrderCancel, privateInversePostFutureTradeV1OrderCancelAll, privateInversePostFutureTradeV1OrderCreate, privateInversePostFutureTradeV1OrderCreateBatch, privateInversePostFutureTradeV1OrderUpdate, privateInversePostFutureUserV1AccountOpen, privateInversePostFutureUserV1PositionAdjustLeverage, privateInversePostFutureUserV1PositionAutoMargin, privateInversePostFutureUserV1PositionCloseAll, privateInversePostFutureUserV1PositionMargin, privateInversePostFutureUserV1UserCollectionAdd, privateInversePostFutureUserV1UserCollectionCancel, privateUserGetUserAccount, privateUserGetUserAccountApiKey, privateUserPostUserAccount, privateUserPostUserAccountApiKey, privateUserPutUserAccountApiKey, privateUserDeleteUserAccountApiKeyId)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
