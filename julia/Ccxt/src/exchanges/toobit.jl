@kwdef mutable struct Toobit <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchStatus::Function = fetchStatus
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchLastPrices::Function = fetchLastPrices
    parseLastPrice::Function = parseLastPrice
    fetchBidsAsks::Function = fetchBidsAsks
    parseBidsAsksCustom::Function = parseBidsAsksCustom
    parseBidAskCustom::Function = parseBidAskCustom
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    parseFundingRateHistory::Function = parseFundingRateHistory
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    createOrder::Function = createOrder
    createOrderRequest::Function = createOrderRequest
    createContractOrderRequest::Function = createContractOrderRequest
    parseOrder::Function = parseOrder
    parseOrderStatus::Function = parseOrderStatus
    parseOrderType::Function = parseOrderType
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelOrders::Function = cancelOrders
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOrders::Function = fetchOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchMyTrades::Function = fetchMyTrades
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    fetchLedger::Function = fetchLedger
    parseLedgerEntry::Function = parseLedgerEntry
    parseLedgerType::Function = parseLedgerType
    fetchTradingFees::Function = fetchTradingFees
    parseTradingFee::Function = parseTradingFee
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    fetchDepositsOrWithdrawalsHelper::Function = fetchDepositsOrWithdrawalsHelper
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    withdraw::Function = withdraw
    setMarginMode::Function = setMarginMode
    setLeverage::Function = setLeverage
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    sign::Function = sign
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    commonGetApiV1Time::Function = commonGetApiV1Time
    commonGetApiV1Ping::Function = commonGetApiV1Ping
    commonGetApiV1ExchangeInfo::Function = commonGetApiV1ExchangeInfo
    commonGetQuoteV1Depth::Function = commonGetQuoteV1Depth
    commonGetQuoteV1DepthMerged::Function = commonGetQuoteV1DepthMerged
    commonGetQuoteV1Trades::Function = commonGetQuoteV1Trades
    commonGetQuoteV1Klines::Function = commonGetQuoteV1Klines
    commonGetQuoteV1IndexKlines::Function = commonGetQuoteV1IndexKlines
    commonGetQuoteV1IndexPriceComponents::Function = commonGetQuoteV1IndexPriceComponents
    commonGetQuoteV1MarkPriceKlines::Function = commonGetQuoteV1MarkPriceKlines
    commonGetQuoteV1MarkPrice::Function = commonGetQuoteV1MarkPrice
    commonGetQuoteV1Index::Function = commonGetQuoteV1Index
    commonGetQuoteV1Ticker24hr::Function = commonGetQuoteV1Ticker24hr
    commonGetQuoteV1ContractTicker24hr::Function = commonGetQuoteV1ContractTicker24hr
    commonGetQuoteV1TickerPrice::Function = commonGetQuoteV1TickerPrice
    commonGetQuoteV1ContractTickerPrice::Function = commonGetQuoteV1ContractTickerPrice
    commonGetQuoteV1TickerBookTicker::Function = commonGetQuoteV1TickerBookTicker
    commonGetQuoteV1ContractTickerBookTicker::Function = commonGetQuoteV1ContractTickerBookTicker
    commonGetApiV1FuturesFundingRate::Function = commonGetApiV1FuturesFundingRate
    commonGetApiV1FuturesHistoryFundingRate::Function = commonGetApiV1FuturesHistoryFundingRate
    commonGetApiV1FuturesRiskLimits::Function = commonGetApiV1FuturesRiskLimits
    privateGetApiV1Account::Function = privateGetApiV1Account
    privateGetApiV1AccountCheckApiKey::Function = privateGetApiV1AccountCheckApiKey
    privateGetApiV1SpotOrder::Function = privateGetApiV1SpotOrder
    privateGetApiV1SpotOpenOrders::Function = privateGetApiV1SpotOpenOrders
    privateGetApiV1FuturesOpenOrders::Function = privateGetApiV1FuturesOpenOrders
    privateGetApiV1SpotTradeOrders::Function = privateGetApiV1SpotTradeOrders
    privateGetApiV1FuturesHistoryOrders::Function = privateGetApiV1FuturesHistoryOrders
    privateGetApiV1AccountTrades::Function = privateGetApiV1AccountTrades
    privateGetApiV1AccountBalanceFlow::Function = privateGetApiV1AccountBalanceFlow
    privateGetApiV1AccountDepositOrders::Function = privateGetApiV1AccountDepositOrders
    privateGetApiV1AccountWithdrawOrders::Function = privateGetApiV1AccountWithdrawOrders
    privateGetApiV1AccountDepositAddress::Function = privateGetApiV1AccountDepositAddress
    privateGetApiV1SubAccount::Function = privateGetApiV1SubAccount
    privateGetApiV1AccountSubAccount::Function = privateGetApiV1AccountSubAccount
    privateGetApiV1SubAccountList::Function = privateGetApiV1SubAccountList
    privateGetApiV1FuturesAccountLeverage::Function = privateGetApiV1FuturesAccountLeverage
    privateGetApiV1FuturesOrder::Function = privateGetApiV1FuturesOrder
    privateGetApiV1FuturesPositions::Function = privateGetApiV1FuturesPositions
    privateGetApiV1FuturesHistoryPositions::Function = privateGetApiV1FuturesHistoryPositions
    privateGetApiV1FuturesBalance::Function = privateGetApiV1FuturesBalance
    privateGetApiV1FuturesUserTrades::Function = privateGetApiV1FuturesUserTrades
    privateGetApiV1FuturesBalanceFlow::Function = privateGetApiV1FuturesBalanceFlow
    privateGetApiV1FuturesCommissionRate::Function = privateGetApiV1FuturesCommissionRate
    privateGetApiV1FuturesTodayPnl::Function = privateGetApiV1FuturesTodayPnl
    privateGetApiV1AccountDownloadDetail::Function = privateGetApiV1AccountDownloadDetail
    privateGetApiV1AgentInviteUserList::Function = privateGetApiV1AgentInviteUserList
    privateGetApiV1AgentCommissionDataList::Function = privateGetApiV1AgentCommissionDataList
    privateGetApiV1AgentCommissionDataInfo::Function = privateGetApiV1AgentCommissionDataInfo
    privateGetApiV1AgentInviteRelationCheck::Function = privateGetApiV1AgentInviteRelationCheck
    privateGetApiV1AgentDepositDetailList::Function = privateGetApiV1AgentDepositDetailList
    privateGetApiV1AgentQuerySubAgentData::Function = privateGetApiV1AgentQuerySubAgentData
    privateGetApiV1AgentSpotOrdersList::Function = privateGetApiV1AgentSpotOrdersList
    privateGetApiV1AgentFuturesOrdersList::Function = privateGetApiV1AgentFuturesOrdersList
    privateGetApiV1AgentFuturesPositionsList::Function = privateGetApiV1AgentFuturesPositionsList
    privateGetApiV1AgentInviteCommissionDetail::Function = privateGetApiV1AgentInviteCommissionDetail
    privateGetApiV1AgentUserExport::Function = privateGetApiV1AgentUserExport
    privateGetApiV1AgentExportList::Function = privateGetApiV1AgentExportList
    privateGetApiV1AgentExportUrl::Function = privateGetApiV1AgentExportUrl
    privatePostApiV1SpotOrderTest::Function = privatePostApiV1SpotOrderTest
    privatePostApiV1SpotOrder::Function = privatePostApiV1SpotOrder
    privatePostApiV1FuturesOrder::Function = privatePostApiV1FuturesOrder
    privatePostApiV1SpotBatchOrders::Function = privatePostApiV1SpotBatchOrders
    privatePostApiV1SubAccountTransfer::Function = privatePostApiV1SubAccountTransfer
    privatePostApiV1AccountWithdraw::Function = privatePostApiV1AccountWithdraw
    privatePostApiV1FuturesMarginType::Function = privatePostApiV1FuturesMarginType
    privatePostApiV1FuturesLeverage::Function = privatePostApiV1FuturesLeverage
    privatePostApiV1FuturesBatchOrders::Function = privatePostApiV1FuturesBatchOrders
    privatePostApiV1FuturesPositionTradingStop::Function = privatePostApiV1FuturesPositionTradingStop
    privatePostApiV1FuturesPositionMargin::Function = privatePostApiV1FuturesPositionMargin
    privatePostApiV1FuturesOrderUpdate::Function = privatePostApiV1FuturesOrderUpdate
    privatePostApiV1FuturesAutoAddMargin::Function = privatePostApiV1FuturesAutoAddMargin
    privatePostApiV1FuturesFlashClose::Function = privatePostApiV1FuturesFlashClose
    privatePostApiV1FuturesReversePosition::Function = privatePostApiV1FuturesReversePosition
    privatePostApiV1AccountDownloadApply::Function = privatePostApiV1AccountDownloadApply
    privatePostApiV1UserDataStream::Function = privatePostApiV1UserDataStream
    privatePostApiV1ListenKey::Function = privatePostApiV1ListenKey
    privateDeleteApiV1SpotOrder::Function = privateDeleteApiV1SpotOrder
    privateDeleteApiV1FuturesOrder::Function = privateDeleteApiV1FuturesOrder
    privateDeleteApiV1SpotOpenOrders::Function = privateDeleteApiV1SpotOpenOrders
    privateDeleteApiV1FuturesBatchOrders::Function = privateDeleteApiV1FuturesBatchOrders
    privateDeleteApiV1SpotCancelOrderByIds::Function = privateDeleteApiV1SpotCancelOrderByIds
    privateDeleteApiV1FuturesCancelOrderByIds::Function = privateDeleteApiV1FuturesCancelOrderByIds
    privateDeleteApiV1UserDataStream::Function = privateDeleteApiV1UserDataStream
    privateDeleteApiV1ListenKey::Function = privateDeleteApiV1ListenKey
    privatePutApiV1UserDataStream::Function = privatePutApiV1UserDataStream
    privatePutApiV1ListenKey::Function = privatePutApiV1ListenKey

end
function describe(self::Toobit, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "toobit",
    Symbol("name") => "Toobit",
    Symbol("countries") => ["KY"],
    Symbol("version") => "v1",
    Symbol("rateLimit") => 20,
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("createOrder") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBidsAsks") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDeposits") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => true,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLastPrices") => true,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => true,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => true,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => true,
        Symbol("fetchPositions") => true,
        Symbol("fetchStatus") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("setLeverage") => true,
        Symbol("setMarginMode") => true,
        Symbol("transfer") => true,
        Symbol("withdraw") => true
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/58e1b718-c6fd-49e2-8a49-797da6b9c008",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("common") => "https://api.toobit.com",
            Symbol("private") => "https://api.toobit.com"
        ),
        Symbol("www") => "https://www.toobit.com/",
        Symbol("doc") => ["https://api-docs.toobit.com/"],
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://www.toobit.com/en-US/r?i=IFFPy0",
            Symbol("discount") => 0.1
        ),
        Symbol("fees") => "https://www.toobit.com/fee"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("common") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("api/v1/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/depth/merged") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/index/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/indexPriceComponents") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/markPrice/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/markPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("quote/v1/index") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("quote/v1/contract/ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 40
),
                Symbol("quote/v1/ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/contract/ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/contract/ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/fundingRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/historyFundingRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/riskLimits") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("api/v1/account") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/account/checkApiKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 * 1.67
),
                Symbol("api/v1/spot/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1 * 1.67
),
                Symbol("api/v1/futures/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1 * 1.67
),
                Symbol("api/v1/spot/tradeOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5 * 1.67
),
                Symbol("api/v1/futures/historyOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5 * 1.67
),
                Symbol("api/v1/account/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5 * 1.67
),
                Symbol("api/v1/account/balanceFlow") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/account/depositOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/account/withdrawOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/account/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/subAccount") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/account/subAccount") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/subAccount/list") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/futures/accountLeverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 * 1.67
),
                Symbol("api/v1/futures/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 5 * 1.67
),
                Symbol("api/v1/futures/historyPositions") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/futures/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/futures/userTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 5 * 1.67
),
                Symbol("api/v1/futures/balanceFlow") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/futures/commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/futures/todayPnl") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/account/download/detail") => Dict{Symbol, Any}(
    Symbol("cost") => 10
),
                Symbol("api/v1/agent/inviteUserList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/commissionDataList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/commissionDataInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/inviteRelationCheck") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/depositDetailList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/querySubAgentData") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/spotOrdersList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/futuresOrdersList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/futuresPositionsList") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/invite-commission-detail") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/user/export") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/export-list") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/agent/export-url") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("api/v1/spot/orderTest") => Dict{Symbol, Any}(
    Symbol("cost") => 1 * 1.67
),
                Symbol("api/v1/spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 * 1.67
),
                Symbol("api/v1/futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 * 1.67
),
                Symbol("api/v1/spot/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2 * 1.67
),
                Symbol("api/v1/subAccount/transfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/marginType") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 2 * 1.67
),
                Symbol("api/v1/futures/position/trading-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 3 * 1.67
),
                Symbol("api/v1/futures/positionMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/order/update") => Dict{Symbol, Any}(
    Symbol("cost") => 2 * 1.67
),
                Symbol("api/v1/futures/autoAddMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/flashClose") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/reversePosition") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/account/download/apply") => Dict{Symbol, Any}(
    Symbol("cost") => 1000
),
                Symbol("api/v1/userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("api/v1/spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 * 1.67
),
                Symbol("api/v1/futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1 * 1.67
),
                Symbol("api/v1/spot/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5 * 1.67
),
                Symbol("api/v1/futures/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 3 * 1.67
),
                Symbol("api/v1/spot/cancelOrderByIds") => Dict{Symbol, Any}(
    Symbol("cost") => 5 * 1.67
),
                Symbol("api/v1/futures/cancelOrderByIds") => Dict{Symbol, Any}(
    Symbol("cost") => 3 * 1.67
),
                Symbol("api/v1/userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("api/v1/userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/listenKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
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
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-1000") => OperationFailed,
            Symbol("-1001") => OperationFailed,
            Symbol("-1002") => PermissionDenied,
            Symbol("-1003") => RateLimitExceeded,
            Symbol("-1004") => BadRequest,
            Symbol("-1005") => PermissionDenied,
            Symbol("-1006") => OperationFailed,
            Symbol("-1007") => OperationFailed,
            Symbol("-1014") => OperationFailed,
            Symbol("-1015") => RateLimitExceeded,
            Symbol("-1016") => OperationRejected,
            Symbol("-1020") => OperationRejected,
            Symbol("-1021") => OperationRejected,
            Symbol("-1022") => OperationRejected,
            Symbol("-1023") => PermissionDenied,
            Symbol("-1031") => OperationRejected,
            Symbol("-1100") => BadRequest,
            Symbol("-1101") => BadRequest,
            Symbol("-1102") => BadRequest,
            Symbol("-1103") => BadRequest,
            Symbol("-1104") => BadRequest,
            Symbol("-1105") => BadRequest,
            Symbol("-1106") => BadRequest,
            Symbol("-1107") => PermissionDenied,
            Symbol("-1111") => BadRequest,
            Symbol("-1112") => OperationRejected,
            Symbol("-1114") => BadRequest,
            Symbol("-1115") => BadRequest,
            Symbol("-1116") => BadRequest,
            Symbol("-1117") => BadRequest,
            Symbol("-1118") => InvalidOrder,
            Symbol("-1119") => InvalidOrder,
            Symbol("-1120") => BadRequest,
            Symbol("-1121") => BadSymbol,
            Symbol("-1125") => OperationRejected,
            Symbol("-1127") => OperationRejected,
            Symbol("-1128") => BadRequest,
            Symbol("-1129") => BadRequest,
            Symbol("-1130") => BadRequest,
            Symbol("-1131") => InsufficientFunds,
            Symbol("-1132") => OperationRejected,
            Symbol("-1133") => OperationRejected,
            Symbol("-1134") => OperationRejected,
            Symbol("-1135") => OperationRejected,
            Symbol("-1136") => OperationRejected,
            Symbol("-1137") => OperationRejected,
            Symbol("-1138") => OperationRejected,
            Symbol("-1139") => OperationRejected,
            Symbol("-1140") => OperationRejected,
            Symbol("-1141") => InvalidOrder,
            Symbol("-1142") => InvalidOrder,
            Symbol("-1143") => OrderNotFound,
            Symbol("-1144") => OperationRejected,
            Symbol("-1145") => OperationRejected,
            Symbol("-1146") => OperationFailed,
            Symbol("-1147") => OperationFailed,
            Symbol("-1148") => InvalidOrder,
            Symbol("-1149") => OperationFailed,
            Symbol("-1150") => OperationFailed,
            Symbol("-1151") => OperationRejected,
            Symbol("-1153") => PermissionDenied,
            Symbol("-1156") => InvalidOrder,
            Symbol("-1157") => OperationRejected,
            Symbol("-1158") => InvalidOrder,
            Symbol("-1161") => OperationRejected,
            Symbol("-1164") => OperationRejected,
            Symbol("-1165") => BadRequest,
            Symbol("-1166") => BadRequest,
            Symbol("-1170") => OperationRejected,
            Symbol("-1171") => ExchangeError,
            Symbol("-1172") => OperationFailed,
            Symbol("-1181") => PermissionDenied,
            Symbol("-1182") => PermissionDenied,
            Symbol("-1193") => OperationRejected,
            Symbol("-1194") => OperationRejected,
            Symbol("-1195") => OperationRejected,
            Symbol("-1196") => OperationRejected,
            Symbol("-1197") => OperationRejected,
            Symbol("-1198") => OperationRejected,
            Symbol("-1199") => OperationRejected,
            Symbol("-1200") => OperationRejected,
            Symbol("-1201") => OperationRejected,
            Symbol("-1202") => OperationRejected,
            Symbol("-1203") => OperationRejected,
            Symbol("-1204") => PermissionDenied,
            Symbol("-1205") => BadRequest,
            Symbol("-1206") => OperationRejected,
            Symbol("-1207") => InvalidOrder,
            Symbol("-1208") => InvalidOrder,
            Symbol("-1209") => InvalidOrder,
            Symbol("-1210") => InvalidOrder,
            Symbol("-1211") => InvalidOrder,
            Symbol("-1212") => InvalidOrder,
            Symbol("-1213") => BadSymbol,
            Symbol("-1214") => PermissionDenied,
            Symbol("-1215") => PermissionDenied,
            Symbol("-1216") => OperationRejected,
            Symbol("-1217") => InvalidOrder,
            Symbol("-1300") => BadRequest,
            Symbol("-1400") => BadRequest,
            Symbol("-1401") => PermissionDenied,
            Symbol("-1402") => OperationFailed,
            Symbol("-1403") => OperationFailed,
            Symbol("-1404") => ExchangeError,
            Symbol("-1405") => ExchangeError,
            Symbol("-1406") => OperationRejected,
            Symbol("-1407") => OperationRejected,
            Symbol("-1408") => InsufficientFunds,
            Symbol("-1409") => OperationRejected,
            Symbol("-1410") => InsufficientFunds,
            Symbol("-1411") => OperationRejected,
            Symbol("-1412") => OperationRejected,
            Symbol("-1413") => BadRequest,
            Symbol("-1414") => BadRequest,
            Symbol("-1415") => BadRequest,
            Symbol("-1416") => InsufficientFunds,
            Symbol("-1417") => OperationRejected,
            Symbol("-2010") => OperationFailed,
            Symbol("-2011") => OperationFailed,
            Symbol("-2013") => OrderNotFound,
            Symbol("-2014") => PermissionDenied,
            Symbol("-2015") => PermissionDenied,
            Symbol("-2016") => BadRequest,
            Symbol("-2017") => PermissionDenied,
            Symbol("-2018") => PermissionDenied,
            Symbol("-3000") => BadRequest,
            Symbol("-3001") => OperationRejected,
            Symbol("-3002") => InvalidOrder,
            Symbol("-3050") => ExchangeError,
            Symbol("-3051") => OperationRejected,
            Symbol("-3052") => BadRequest,
            Symbol("-3101") => OperationRejected,
            Symbol("-3102") => OperationRejected,
            Symbol("-3103") => BadRequest,
            Symbol("-3105") => OperationRejected,
            Symbol("-3107") => OperationRejected,
            Symbol("-3108") => OperationRejected,
            Symbol("-3109") => OperationRejected,
            Symbol("-3110") => InsufficientFunds,
            Symbol("-3116") => OperationRejected,
            Symbol("-3117") => OperationRejected,
            Symbol("-3120") => OperationRejected,
            Symbol("-3124") => OperationRejected,
            Symbol("-3125") => OperationRejected,
            Symbol("-3126") => OperationRejected,
            Symbol("-3127") => OperationFailed,
            Symbol("-3128") => OperationRejected,
            Symbol("-3129") => BadRequest,
            Symbol("-3130") => OperationRejected,
            Symbol("-3131") => NotSupported,
            Symbol("-3132") => InvalidOrder,
            Symbol("-3133") => InvalidOrder,
            Symbol("-3136") => OperationRejected,
            Symbol("-3137") => OperationRejected,
            Symbol("-3138") => OperationRejected,
            Symbol("-3139") => OperationRejected,
            Symbol("-3140") => OperationRejected,
            Symbol("-3141") => InvalidOrder,
            Symbol("-3142") => InvalidOrder,
            Symbol("-3143") => InvalidOrder,
            Symbol("-3144") => InvalidOrder,
            Symbol("-3145") => InvalidOrder,
            Symbol("-3147") => OperationRejected,
            Symbol("-3148") => InvalidOrder,
            Symbol("-3149") => InvalidOrder,
            Symbol("-3150") => NotSupported,
            Symbol("-3151") => NotSupported,
            Symbol("-3152") => BadRequest,
            Symbol("-3153") => BadRequest,
            Symbol("-32045") => ExchangeError,
            Symbol("-32090") => OperationRejected,
            Symbol("-32093") => OperationRejected,
            Symbol("-120041") => PermissionDenied,
            Symbol("-120047") => ExchangeError,
            Symbol("-120055") => OperationRejected,
            Symbol("-120067") => ExchangeError,
            Symbol("-120072") => BadRequest,
            Symbol("-120073") => OperationRejected,
            Symbol("-120078") => BadRequest,
            Symbol("-120510") => BadRequest,
            Symbol("-120511") => BadRequest,
            Symbol("-120512") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}(
            Symbol("Unknown order sent") => OrderNotFound,
            Symbol("Duplicate order sent") => InvalidOrder,
            Symbol("Market is closed") => OperationRejected,
            Symbol("Account has insufficient balance for requested action") => InsufficientFunds,
            Symbol("Market orders are not supported for this symbol") => OperationRejected,
            Symbol("Iceberg orders are not supported for this symbol") => OperationRejected,
            Symbol("Stop loss orders are not supported for this symbol") => OperationRejected,
            Symbol("Stop loss limit orders are not supported for this symbol") => OperationRejected,
            Symbol("Take profit orders are not supported for this symbol") => OperationRejected,
            Symbol("Take profit limit orders are not supported for this symbol") => OperationRejected,
            Symbol("QTY is zero or less") => BadRequest,
            Symbol("IcebergQty exceeds QTY") => OperationRejected,
            Symbol("This action disabled is on this account") => PermissionDenied,
            Symbol("Unsupported order combination") => BadRequest,
            Symbol("Order would trigger immediately") => OperationRejected,
            Symbol("Cancel order is invalid. Check origClOrdId and orderId") => OperationRejected,
            Symbol("Order would immediately match and take") => OperationRejected
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("defaultType") => "spot",
        Symbol("accountsByType") => Dict{Symbol, Any}(
            Symbol("spot") => "MAIN",
            Symbol("swap") => "FUTURES"
        ),
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "BTC",
            Symbol("ERC20") => "ETH",
            Symbol("ETH") => "ETH",
            Symbol("BEP20") => "BSC",
            Symbol("TRC20") => "TRX",
            Symbol("SOL") => "SOL",
            Symbol("MATIC") => "MATIC",
            Symbol("ARBITRUM") => "ARBITRUM",
            Symbol("BASE") => "BASE",
            Symbol("TON") => "TON",
            Symbol("AVAXC") => "AVAXC",
            Symbol("DOGE") => "DOGE",
            Symbol("XRP") => "XRP",
            Symbol("DOT") => "DOT",
            Symbol("ADA") => "ADA",
            Symbol("LTC") => "LTC",
            Symbol("APT") => "APT",
            Symbol("ATOM") => "ATOM",
            Symbol("ALGO") => "ALGO",
            Symbol("NEAR") => "NEAR",
            Symbol("XLM") => "XLM",
            Symbol("SUI") => "SUI",
            Symbol("ETC") => "ETC",
            Symbol("EOS") => "EOS",
            Symbol("WAVES") => "WAVES",
            Symbol("ICP") => "ICP",
            Symbol("ONE") => "ONE"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("ETH") => "ERC20",
            Symbol("ERC20") => "ERC20"
        )
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("spot") => Dict{Symbol, Any}(
            Symbol("sandbox") => false,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
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
                Symbol("marketBuyRequiresPrice") => false,
                Symbol("marketBuyByCost") => false,
                Symbol("selfTradePrevention") => false,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => nothing,
            Symbol("fetchOHLCV") => Dict{Symbol, Any}(
                Symbol("limit") => 1000
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("symbolRequired") => true
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
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 500,
                Symbol("daysBack") => 100000,
                Symbol("untilDays") => 100000,
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchClosedOrders") => nothing
        ),
        Symbol("forDerivatives") => Dict{Symbol, Any}(
            Symbol("createOrders") => nothing
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    )
))

end
function fetchStatus(self::Toobit, params=Dict())
    response = Base.fetch(self.commonGetApiV1Ping(params));
    return Dict{Symbol, Any}(
    Symbol("status") => "ok",
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
function fetchTime(self::Toobit, params=Dict())
    response = Base.fetch(self.commonGetApiV1Time(params));
    return safeInteger(response, "serverTime")

end
function fetchCurrencies(self::Toobit, params=Dict())
    response = Base.fetch(self.commonGetApiV1ExchangeInfo(params));
    self.options[Symbol("exchangeInfo")] = response;
    coins = self.safeList(response, "coins", []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(coins)))
        coin = get(coins, i + 1, nothing);
        parsed = self.parseCurrency(coin);
        if functions.ccxtruthy(parsed != nothing)
            code = get(parsed, Symbol("code"), nothing);
            result[Symbol(code)] = parsed;
        end
        i += 1
    end
    return result

end
function parseCurrency(self::Toobit, rawCurrency)
    id = safeString(rawCurrency, "coinId");
    code = self.safeCurrencyCode(id);
    networks = Dict{Symbol, Any}();
    rawNetworks = self.safeList(rawCurrency, "chainTypes", []);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(rawNetworks)))
        rawNetwork = get(rawNetworks, j + 1, nothing);
        networkId = safeString(rawNetwork, "chainType");
        networkCode = self.networkIdToCode(networkId, code);
        if functions.ccxtruthy(networkCode != nothing)
            networks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("margin") => nothing,
                Symbol("deposit") => self.safeBool(rawNetwork, "allowDeposit"),
                Symbol("withdraw") => self.safeBool(rawNetwork, "allowWithdraw"),
                Symbol("active") => nothing,
                Symbol("fee") => self.safeNumber(rawNetwork, "withdrawFee"),
                Symbol("precision") => nothing,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(rawNetwork, "minDepositQuantity"),
                        Symbol("max") => nothing
                    ),
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(rawNetwork, "minWithdrawQuantity"),
                        Symbol("max") => self.safeNumber(rawNetwork, "maxWithdrawQuantity")
                    )
                ),
                Symbol("info") => rawNetwork
            );
        end
        j += 1
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => id,
    Symbol("code") => code,
    Symbol("name") => safeString(rawCurrency, "coinFullName"),
    Symbol("type") => nothing,
    Symbol("active") => nothing,
    Symbol("deposit") => self.safeBool(rawCurrency, "allowDeposit"),
    Symbol("withdraw") => self.safeBool(rawCurrency, "allowWithdraw"),
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
        )
    ),
    Symbol("networks") => networks,
    Symbol("info") => rawCurrency
))

end
function fetchMarkets(self::Toobit, params=Dict())
    response = self.safeDict(self.options, "exchangeInfo");
    if functions.ccxtruthy(response != nothing)
        self.options[Symbol("exchangeInfo")] = nothing;
    else
        response = Base.fetch(self.commonGetApiV1ExchangeInfo(params));
    end
    symbols = self.safeList(response, "symbols", []);
    contracts = self.safeList(response, "contracts", []);
    all_var = arrayConcat(symbols, contracts);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(all_var)))
        market = get(all_var, i + 1, nothing);
        parsed = self.parseMarket(market);
        if functions.ccxtruthy(parsed != nothing)
                        push!(result, parsed);
        end
        i += 1
    end
    return result

end
function parseMarket(self::Toobit, market)
    id = safeString(market, "symbol");
    baseId = safeString(market, "baseAsset", "");
    quoteId = safeString(market, "quoteAsset");
    baseParts = split(baseId, "-");
    baseIdClean = get(baseParts, 1, nothing);
    base = self.safeCurrencyCode(baseIdClean);
    quote_var = self.safeCurrencyCode(quoteId);
    settleId = safeString(market, "marginToken");
    settle = self.safeCurrencyCode(settleId);
    status = safeString(market, "status");
    active = (status == "TRADING");
    filters = self.safeList(market, "filters", []);
    filtersByType = indexBy(filters, "filterType");
    priceFilter = self.safeDict(filtersByType, "PRICE_FILTER", Dict{Symbol, Any}());
    lotSizeFilter = self.safeDict(filtersByType, "LOT_SIZE", Dict{Symbol, Any}());
    minNotionalFilter = self.safeDict(filtersByType, "MIN_NOTIONAL", Dict{Symbol, Any}());
    symbol = string(base, "/", quote_var);
    isContract = (ccxt_in("contractMultiplier", market));
    inverse = self.safeBool2(market, "isInverse", "inverse");
    if functions.ccxtruthy(isContract)
        symbol += string(":", settle);
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
    Symbol("type") => functions.ccxtruthy(isContract) ? "swap" : "spot",
    Symbol("spot") => !functions.ccxtruthy(isContract),
    Symbol("margin") => false,
    Symbol("swap") => isContract,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("active") => active,
    Symbol("contract") => isContract,
    Symbol("linear") => functions.ccxtruthy(isContract) ? !functions.ccxtruthy(inverse) : nothing,
    Symbol("inverse") => functions.ccxtruthy(isContract) ? inverse : nothing,
    Symbol("contractSize") => self.safeNumber(market, "contractMultiplier"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(lotSizeFilter, "stepSize"),
        Symbol("price") => self.safeNumber(priceFilter, "tickSize")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(lotSizeFilter, "minQty"),
            Symbol("max") => self.safeNumber(lotSizeFilter, "maxQty")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(priceFilter, "minPrice"),
            Symbol("max") => self.safeNumber(priceFilter, "maxPrice")
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(minNotionalFilter, "minNotional"),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function fetchOrderBook(self::Toobit, symbol, limit=nothing, params=Dict())
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
    response = Base.fetch(self.commonGetQuoteV1Depth(extend(request, params)));
    timestamp = safeInteger(response, "t");
    return self.parseOrderBook(response, get(market, Symbol("symbol"), nothing), timestamp, "b", "a")

end
function fetchTrades(self::Toobit, symbol, since=nothing, limit=nothing, params=Dict())
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
    response = Base.fetch(self.commonGetQuoteV1Trades(extend(request, params)));
    return self.parseTrades(response, market, since, limit)

end
function parseTrade(self::Toobit, trade, market=nothing)
    timestamp = safeInteger2(trade, "t", "time");
    priceString = safeString2(trade, "p", "price");
    amountString = safeString2(trade, "q", "qty");
    isBuyer = self.safeBool(trade, "isBuyer");
    side = nothing;
    isBuyerMaker = self.safeBool(trade, "ibm");
    if functions.ccxtruthy(isBuyerMaker == nothing)
        isBuyerTaker = self.safeBool(trade, "m");
        if functions.ccxtruthy(isBuyerTaker != nothing)
            isBuyerMaker = !functions.ccxtruthy(isBuyerTaker);
        end
    end
    if functions.ccxtruthy(isBuyerMaker != nothing)
        if functions.ccxtruthy(isBuyerMaker)
            side = "sell";
        else
            side = "buy";
        end
    else
        if functions.ccxtruthy(isBuyer)
            side = "buy";
        else
            side = "sell";
        end
    end
    feeCurrencyId = safeString(trade, "feeCoinId");
    feeAmount = safeString(trade, "feeAmount");
    fee = nothing;
    if functions.ccxtruthy(feeAmount != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("currency") => self.safeCurrencyCode(feeCurrencyId),
            Symbol("cost") => feeAmount
        );
    end
    isMaker = self.safeBool(trade, "isMaker");
    takerOrMaker = nothing;
    if functions.ccxtruthy(isMaker != nothing)
        takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    end
    market = self.safeMarket(nothing, market);
    symbol = get(market, Symbol("symbol"), nothing);
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => symbol,
    Symbol("id") => safeString2(trade, "id", "v"),
    Symbol("order") => safeString(trade, "orderId"),
    Symbol("type") => nothing,
    Symbol("side") => side,
    Symbol("amount") => amountString,
    Symbol("price") => priceString,
    Symbol("cost") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("fee") => fee
), market)

end
function fetchOHLCV(self::Toobit, symbol, timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => safeString(self.timeframes, timeframe, timeframe)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    until = safeInteger(params, "until");
    if functions.ccxtruthy(until != nothing)
        params = omit(params, "until");
        request[Symbol("endTime")] = until;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = [];
    endpoint = nothing;
    (endpoint, params) = self.handleOptionAndParams(params, "fetchOHLCV", "price");
    if functions.ccxtruthy(endpoint == "index")
        response = Base.fetch(self.commonGetQuoteV1IndexKlines(extend(request, params)));
    elseif functions.ccxtruthy(endpoint == "mark")
        response = Base.fetch(self.commonGetQuoteV1MarkPriceKlines(extend(request, params)));
    else
        response = Base.fetch(self.commonGetQuoteV1Klines(extend(request, params)));
    end
    candles = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        candles = response;
    end
    return self.parseOHLCVs(candles, market, timeframe, since, limit)

end
function parseOHLCV(self::Toobit, ohlcv, market=nothing)
    return [safeIntegerN(ohlcv, [0, "time", "t"]), self.safeNumberN(ohlcv, [1, "open", "o"]), self.safeNumberN(ohlcv, [2, "high", "h"]), self.safeNumberN(ohlcv, [3, "low", "l"]), self.safeNumberN(ohlcv, [4, "close", "c"]), self.safeNumberN(ohlcv, [5, "volume", "v"])]

end
function fetchTickers(self::Toobit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    type_var = nothing;
    market = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        symbol = safeString(symbols, 0);
        if functions.ccxtruthy(symbol != nothing)
            market = self.market(symbol);
        end
        len = length(symbols);
        if functions.ccxtruthy(@functions.ccxt_and((len == 1), (market != nothing)))
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    (type_var, params) = self.handleMarketTypeAndParams("fetchTickers", market, params);
    response = nothing;
    if functions.ccxtruthy(type_var == "spot")
        response = Base.fetch(self.commonGetQuoteV1Ticker24hr(extend(request, params)));
    else
        response = Base.fetch(self.commonGetQuoteV1ContractTicker24hr(extend(request, params)));
    end
    return self.parseTickers(response, symbols, params)

end
function parseTicker(self::Toobit, ticker, market=nothing)
    marketId = safeString(ticker, "s");
    market = self.safeMarket(marketId, market);
    timestamp = safeInteger(ticker, "t");
    last_var = safeString(ticker, "c");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "h"),
    Symbol("low") => safeString(ticker, "l"),
    Symbol("bid") => nothing,
    Symbol("bidVolume") => nothing,
    Symbol("ask") => nothing,
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "o"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => safeString(ticker, "pc"),
    Symbol("percentage") => safeString(ticker, "pcp"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "v"),
    Symbol("quoteVolume") => safeString(ticker, "qv"),
    Symbol("info") => ticker
), market)

end
function fetchLastPrices(self::Toobit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        len = length(symbols);
        if functions.ccxtruthy(len == 1)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    response = Base.fetch(self.commonGetQuoteV1TickerPrice(extend(request, params)));
    return self.parseLastPrices(response, symbols)

end
function parseLastPrice(self::Toobit, entry, market=nothing)
    marketId = safeString(entry, "s");
    market = self.safeMarket(marketId, market);
    return Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("price") => self.safeNumberOmitZero(entry, "price"),
    Symbol("side") => nothing,
    Symbol("info") => entry
)

end
function fetchBidsAsks(self::Toobit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        len = length(symbols);
        if functions.ccxtruthy(len == 1)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    response = Base.fetch(self.commonGetQuoteV1TickerBookTicker(extend(request, params)));
    return self.parseBidsAsksCustom(response, symbols)

end
function parseBidsAsksCustom(self::Toobit, tickers, symbols=nothing, params=Dict())
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
        parsedTicker = self.parseBidAskCustom(get(tickers, i + 1, nothing));
        ticker = extend(parsedTicker, params);
        push!(results, ticker);
        i += 1
    end
    symbols = self.marketSymbols(symbols);
    return self.filterByArray(results, "symbol", symbols)

end
function parseBidAskCustom(self::Toobit, ticker)
    return Dict{Symbol, Any}(
    Symbol("timestamp") => safeString(ticker, "t"),
    Symbol("symbol") => safeString(ticker, "s"),
    Symbol("bid") => self.safeNumber(ticker, "b"),
    Symbol("bidVolume") => self.safeNumber(ticker, "bq"),
    Symbol("ask") => self.safeNumber(ticker, "a"),
    Symbol("askVolume") => self.safeNumber(ticker, "aq"),
    Symbol("info") => ticker
)

end
function fetchFundingRates(self::Toobit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols);
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(symbols != nothing)
        len = length(symbols);
        if functions.ccxtruthy(len == 1)
            market = self.market(get(symbols, 1, nothing));
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    response = Base.fetch(self.commonGetApiV1FuturesFundingRate(extend(request, params)));
    return self.parseFundingRates(response, symbols)

end
function parseFundingRate(self::Toobit, contract, market=nothing)
    marketId = safeString(contract, "symbol");
    symbol = self.safeSymbol(marketId, market);
    nextFundingRate = self.safeNumber(contract, "rate");
    nextFundingRateTimestamp = safeInteger(contract, "nextFundingTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("nextFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("fundingRate") => nextFundingRate,
    Symbol("fundingTimestamp") => nextFundingRateTimestamp,
    Symbol("fundingDatetime") => self.iso8601(nextFundingRateTimestamp),
    Symbol("interval") => nothing
)

end
function fetchFundingRateHistory(self::Toobit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingRateHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchFundingRateHistory", symbol, since, limit, "8h", params))
    end
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchFundingRateHistory() requires a symbol argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = Base.fetch(self.commonGetApiV1FuturesHistoryFundingRate(extend(request, params)));
    return self.parseFundingRateHistories(response, market, since, limit)

end
function parseFundingRateHistory(self::Toobit, contract, market=nothing)
    timestamp = safeInteger(contract, "settleTime");
    marketId = safeString(contract, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("fundingRate") => self.safeNumber(contract, "settleRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
function fetchBalance(self::Toobit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = nothing;
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchBalance", nothing, params);
    if functions.ccxtruthy(inArray(marketType, ["swap", "future"]))
        response = Base.fetch(self.privateGetApiV1FuturesBalance());
    else
        response = Base.fetch(self.privateGetApiV1Account());
    end
    return self.parseBalance(response)

end
function parseBalance(self::Toobit, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response,
        Symbol("timestamp") => nothing,
        Symbol("datetime") => nothing
    );
    balances = self.safeList(response, "balances", response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balance = get(balances, i + 1, nothing);
        code = self.safeCurrencyCode(safeString(balance, "asset"));
        account = self.account();
        account[Symbol("free")] = safeString2(balance, "free", "availableBalance");
        account[Symbol("total")] = safeString2(balance, "total", "balance");
        account[Symbol("used")] = safeString(balance, "locked");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function createOrder(self::Toobit, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}();
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        (request, params) = self.createOrderRequest(symbol, type_var, side, amount, price, params);
        response = Base.fetch(self.privatePostApiV1SpotOrder(extend(request, params)));
    else
        (request, params) = self.createContractOrderRequest(symbol, type_var, side, amount, price, params);
        response = Base.fetch(self.privatePostApiV1FuturesOrder(extend(request, params)));
    end
    return self.parseOrder(response, market)

end
function createOrderRequest(self::Toobit, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    market = self.market(symbol);
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a side argument")));
    end
    id = get(market, Symbol("id"), nothing);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => id,
        Symbol("side") => uppercase(side)
    );
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    cost = nothing;
    (cost, params) = self.handleParamString(params, "cost");
    if functions.ccxtruthy(type_var == "market")
        if functions.ccxtruthy(@functions.ccxt_and(cost == nothing, side == "buy"))
            throw(ArgumentsRequired(string(self.id, " createOrder() requires params[\"cost\"] for market buy order")));
        else
            request[Symbol("quantity")] = self.costToPrecision(symbol, cost);
        end
    else
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    isPostOnly = nothing;
    (isPostOnly, params) = self.handlePostOnly(type_var == "market", false, params);
    if functions.ccxtruthy(isPostOnly)
        request[Symbol("type")] = "LIMIT_MAKER";
    else
        request[Symbol("type")] =         uppercase(type_var);
    end
    return [request, params]

end
function createContractOrderRequest(self::Toobit, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("quantity") => self.amountToPrecision(symbol, amount)
    );
    reduceOnly = nothing;
    (reduceOnly, params) = self.handleParamBool(params, "reduceOnly");
    if functions.ccxtruthy(side == "buy")
        side = functions.ccxtruthy(reduceOnly) ? "SELL_CLOSE" : "BUY_OPEN";
    elseif functions.ccxtruthy(side == "sell")
        side = functions.ccxtruthy(reduceOnly) ? "BUY_CLOSE" : "SELL_OPEN";
    end
    request[Symbol("side")] = side;
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    if functions.ccxtruthy(inArray(type_var, ["limit", "LIMIT"]))
        request[Symbol("type")] =         uppercase(type_var);
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    elseif functions.ccxtruthy(type_var == "market")
        request[Symbol("type")] = "LIMIT";
        request[Symbol("priceType")] = "MARKET";
    end
    isPostOnly = nothing;
    (isPostOnly, params) = self.handlePostOnly(type_var == "market", false, params);
    if functions.ccxtruthy(isPostOnly)
        request[Symbol("timeInForce")] = "LIMIT_MAKER";
    end
    values_var = self.handleTriggerPricesAndParams(symbol, params);
    triggerPrice = get(values_var, 1, nothing);
    params = get(values_var, 4, nothing);
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stopPrice")] = triggerPrice;
    end
    stopLoss = self.safeDict(params, "stopLoss");
    takeProfit = self.safeDict(params, "takeProfit");
    hasStopLoss = (stopLoss != nothing);
    hasTakeProfit = (takeProfit != nothing);
    triggerPriceTypes = Dict{Symbol, Any}(
        Symbol("mark") => "MARK_PRICE",
        Symbol("last") => "CONTRACT_PRICE"
    );
    if functions.ccxtruthy(hasStopLoss)
        request[Symbol("stopLoss")] = safeValue(stopLoss, "triggerPrice");
        limitPrice = safeValue(stopLoss, "price");
        if functions.ccxtruthy(limitPrice != nothing)
            request[Symbol("slOrderType")] = "LIMIT";
            request[Symbol("slLimitPrice")] = self.priceToPrecision(symbol, limitPrice);
        end
        triggerPriceType = safeString(stopLoss, "triggerPriceType");
        if functions.ccxtruthy(triggerPriceType != nothing)
            request[Symbol("slTriggerBy")] = safeString(triggerPriceTypes, triggerPriceType, triggerPriceType);
        end
        params = omit(params, "stopLoss");
    end
    if functions.ccxtruthy(hasTakeProfit)
        request[Symbol("takeProfit")] = safeValue(takeProfit, "triggerPrice");
        limitPrice = safeValue(takeProfit, "price");
        if functions.ccxtruthy(limitPrice != nothing)
            request[Symbol("tpOrderType")] = "LIMIT";
            request[Symbol("tpLimitPrice")] = self.priceToPrecision(symbol, limitPrice);
        end
        triggerPriceType = safeString(takeProfit, "triggerPriceType");
        if functions.ccxtruthy(triggerPriceType != nothing)
            request[Symbol("tpTriggerBy")] = safeString(triggerPriceTypes, triggerPriceType, triggerPriceType);
        end
        params = omit(params, "takeProfit");
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("newClientOrderId", params))))
        request[Symbol("newClientOrderId")] = uuid();
    end
    return [request, params]

end
function parseOrder(self::Toobit, order, market=nothing)
    timestamp = safeInteger2(order, "transactTime", "time");
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId, market);
    rawType = safeString(order, "type");
    rawSideLower = safeStringLower(order, "side");
    triggerPrice = omitZero(safeString(order, "stopPrice"));
    if functions.ccxtruthy(triggerPrice == "0.0")
        triggerPrice = nothing;
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => order,
    Symbol("id") => safeString(order, "orderId"),
    Symbol("clientOrderId") => safeString(order, "clientOrderId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(order, "updateTime"),
    Symbol("status") => self.parseOrderStatus(safeString(order, "status")),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => self.parseOrderType(rawType),
    Symbol("timeInForce") => safeString(order, "timeInForce"),
    Symbol("postOnly") => (rawType == "LIMIT_MAKER"),
    Symbol("side") => rawSideLower,
    Symbol("price") => omitZero(safeString(order, "price")),
    Symbol("triggerPrice") => triggerPrice,
    Symbol("cost") => omitZero(safeString(order, "cumulativeQuoteQty")),
    Symbol("average") => safeString(order, "avgPrice"),
    Symbol("amount") => safeString(order, "origQty"),
    Symbol("filled") => safeString(order, "executedQty"),
    Symbol("remaining") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("reduceOnly") => nothing,
    Symbol("leverage") => nothing,
    Symbol("hedged") => nothing
), market)

end
function parseOrderStatus(self::Toobit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("PENDING_NEW") => "open",
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("FILLED") => "closed",
        Symbol("PENDING_CANCEL") => "canceled",
        Symbol("CANCELED") => "canceled",
        Symbol("REJECTED") => "canceled"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function parseOrderType(self::Toobit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("MARKET") => "market",
        Symbol("LIMIT") => "limit",
        Symbol("LIMIT_MAKER") => "limit"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function cancelOrder(self::Toobit, id, symbol=nothing, params=Dict())
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(safeString(params, "clientOrderId") == nothing)
        request[Symbol("orderId")] = id;
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelOrder", market, params, "none");
    if functions.ccxtruthy(marketType == "none")
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument or the \"defaultType\" parameter to be set to \"spot\" or \"swap\"")));
    end
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateDeleteApiV1SpotOrder(extend(request, params)));
    else
        response = Base.fetch(self.privateDeleteApiV1FuturesOrder(extend(request, params)));
    end
    status = self.parseOrderStatus(safeString(response, "status"));
    if functions.ccxtruthy(status != "open")
        throw(OrderNotFound(string(self.id, " order ", id, " can not be canceled, ", json(response))));
    end
    return self.parseOrder(response, market)

end
function cancelAllOrders(self::Toobit, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelAllOrders", market, params, "none");
    if functions.ccxtruthy(marketType == "none")
        throw(ArgumentsRequired(string(self.id, " cancelAllOrders() requires a symbol argument or the \"defaultType\" parameter to be set to \"spot\" or \"swap\"")));
    end
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateDeleteApiV1SpotOpenOrders(extend(request, params)));
    else
        response = Base.fetch(self.privateDeleteApiV1FuturesBatchOrders(extend(request, params)));
    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function cancelOrders(self::Toobit, ids, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    idsString = join(ids, ",");
    request = Dict{Symbol, Any}(
        Symbol("ids") => idsString
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("cancelOrders", market, params, "none");
    if functions.ccxtruthy(marketType == "none")
        throw(ArgumentsRequired(string(self.id, " cancelOrders() requires a symbol argument or the \"defaultType\" parameter to be set to \"spot\" or \"swap\"")));
    end
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateDeleteApiV1SpotCancelOrderByIds(extend(request, params)));
    else
        response = Base.fetch(self.privateDeleteApiV1FuturesCancelOrderByIds(extend(request, params)));
    end
    result = self.safeList(response, "result", []);
    return self.parseOrders(result, market)

end
function fetchOrder(self::Toobit, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("orderId") => id
    );
    market = self.market(symbol);
    response = Dict{Symbol, Any}();
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.privateGetApiV1SpotOrder(extend(request, params)));
    else
        response = Base.fetch(self.privateGetApiV1FuturesOrder(extend(request, params)));
    end
    return self.parseOrder(response, market)

end
function fetchOpenOrders(self::Toobit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
        request[Symbol("limit")] = limit;
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOpenOrders", market, params);
    response = [];
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateGetApiV1SpotOpenOrders(extend(request, params)));
    else
        response = Base.fetch(self.privateGetApiV1FuturesOpenOrders(extend(request, params)));
    end
    return self.parseOrders(response, market, since, limit)

end
function fetchOrders(self::Toobit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchOrders", market, params);
    response = [];
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateGetApiV1SpotTradeOrders(request));
    else
        throw(NotSupported(string(self.id, " fetchOrders() is not supported for ", marketType, " markets")));
    end
    return self.parseOrders(response, market, since, limit)

end
function fetchClosedOrders(self::Toobit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
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
    (request, params) = self.handleUntilOption("endTime", request, params);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchClosedOrders", market, params);
    response = [];
    if functions.ccxtruthy(marketType == "spot")
        throw(NotSupported(string(self.id, " fetchOrders() is not supported for ", marketType, " markets")));
    else
        response = Base.fetch(self.privateGetApiV1FuturesHistoryOrders(request));
    end
    ordersList = [];
    responseList = [];
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        responseList = response;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(responseList)))
        push!(ordersList, Dict{Symbol, Any}(
    Symbol("result") => get(responseList, i + 1, nothing)
));
        i += 1
    end
    return self.parseOrders(ordersList, market, since, limit)

end
function fetchMyTrades(self::Toobit, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchMyTrades() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    market = self.market(symbol);
    request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchMyTrades", market, params);
    (request, params) = self.handleUntilOption("endTime", request, params);
    response = [];
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateGetApiV1AccountTrades(extend(request, params)));
    else
        response = Base.fetch(self.privateGetApiV1FuturesUserTrades(request));
    end
    return self.parseTrades(response, market, since, limit)

end
function transfer(self::Toobit, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    accountsByType = self.safeDict(self.options, "accountsByType", Dict{Symbol, Any}());
    fromId = safeString(accountsByType, fromAccount, fromAccount);
    toId = safeString(accountsByType, toAccount, toAccount);
    request = Dict{Symbol, Any}(
        Symbol("asset") => get(currency, Symbol("id"), nothing),
        Symbol("quantity") => self.currencyToPrecision(code, amount),
        Symbol("fromAccountType") => fromId,
        Symbol("toAccountType") => toId
    );
    response = Base.fetch(self.privatePostApiV1SubAccountTransfer(extend(request, params)));
    return self.parseTransfer(response, currency)

end
function parseTransfer(self::Toobit, transfer, currency=nothing)
    return Dict{Symbol, Any}(
    Symbol("info") => transfer,
    Symbol("id") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("currency") => nothing,
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => nothing
)

end
function fetchLedger(self::Toobit, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    marketType = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchLedger", nothing, params);
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateGetApiV1AccountBalanceFlow(extend(request, params)));
    else
        response = Base.fetch(self.privateGetApiV1FuturesBalanceFlow(extend(request, params)));
    end
    return self.parseLedger(response, currency, since, limit)

end
function parseLedgerEntry(self::Toobit, item, currency=nothing)
    currencyId = safeString(item, "coinId");
    currency = self.safeCurrency(currencyId, currency);
    timestamp = safeInteger(item, "created");
    after = self.safeNumber(item, "total");
    amountRaw = safeString(item, "change", "");
    amount = self.parseNumber(stringAbs(amountRaw));
    direction = "in";
    if functions.ccxtruthy(startswith(amountRaw, "-"))
        direction = "out";
    end
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => safeString(item, "id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("direction") => direction,
    Symbol("account") => nothing,
    Symbol("referenceId") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => self.parseLedgerType(safeString(item, "flowType")),
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("amount") => amount,
    Symbol("before") => nothing,
    Symbol("after") => after,
    Symbol("status") => nothing,
    Symbol("fee") => nothing
), currency)

end
function parseLedgerType(self::Toobit, type_var)
    types = Dict{Symbol, Any}(
        Symbol("USER_ACCOUNT_TRANSFER") => "transfer",
        Symbol("AIRDROP") => "rebate"
    );
    return safeString(types, type_var, type_var)

end
function fetchTradingFees(self::Toobit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = nothing;
    marketType = nothing;
    market = nothing;
    (marketType, params) = self.handleMarketTypeAndParams("fetchTradingFees", nothing, params);
    if functions.ccxtruthy(marketType == "spot")
        throw(NotSupported(string(self.id, " fetchTradingFees(): does not support ", marketType, " markets")));
    elseif functions.ccxtruthy(inArray(marketType, ["swap", "future"]))
        symbol = nothing;
        (symbol, params) = self.handleParamString(params, "symbol");
        if functions.ccxtruthy(symbol == nothing)
            throw(BadRequest(string(self.id, " fetchTradingFees requires a params[\"symbol\"]")));
        end
        market = self.market(symbol);
        request = Dict{Symbol, Any}(
            Symbol("symbol") => get(market, Symbol("id"), nothing)
        );
        response = Base.fetch(self.privateGetApiV1FuturesCommissionRate(extend(request, params)));
    end
    result = Dict{Symbol, Any}();
    entry = response;
    marketId = safeString(entry, "symbol");
    market = self.safeMarket(marketId, market);
    fee = self.parseTradingFee(entry, market);
    result[Symbol(market[Symbol("symbol")])] = fee;
    return result

end
function parseTradingFee(self::Toobit, data, market=nothing)
    marketId = safeString(data, "symbol");
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("maker") => self.safeNumber(data, "closeMakerFee"),
    Symbol("taker") => self.safeNumber(data, "closeTakerFee"),
    Symbol("percentage") => nothing,
    Symbol("tierBased") => nothing
)

end
function fetchDeposits(self::Toobit, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchDepositsOrWithdrawalsHelper("deposits", code, since, limit, params))

end
function fetchWithdrawals(self::Toobit, code=nothing, since=nothing, limit=nothing, params=Dict())
    return Base.fetch(self.fetchDepositsOrWithdrawalsHelper("withdrawals", code, since, limit, params))

end
function fetchDepositsOrWithdrawalsHelper(self::Toobit, type_var, code, since, limit, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = nothing;
    request = Dict{Symbol, Any}();
    if functions.ccxtruthy(code != nothing)
        currency = self.currency(code);
        request[Symbol("coin")] = get(currency, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    (request, params) = self.handleUntilOption("endTime", request, params);
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = [];
    if functions.ccxtruthy(type_var == "deposits")
        response = Base.fetch(self.privateGetApiV1AccountDepositOrders(extend(request, params)));
    elseif functions.ccxtruthy(type_var == "withdrawals")
        response = Base.fetch(self.privateGetApiV1AccountWithdrawOrders(extend(request, params)));
    end
    return self.parseTransactions(response, currency, since, limit, params)

end
function parseTransaction(self::Toobit, transaction, currency=nothing)
    timestamp = safeInteger(transaction, "time");
    currencyId = safeString2(transaction, "coin", "coinId");
    code = self.safeCurrencyCode(currencyId, currency);
    feeString = safeString(transaction, "fee");
    feeCoin = safeString(transaction, "feeCoinName");
    fee = nothing;
    if functions.ccxtruthy(feeString != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeString),
            Symbol("currency") => self.safeCurrencyCode(feeCoin)
        );
    end
    tagTo = safeString2(transaction, "addressTag", "addressExt");
    tagFrom = safeString(transaction, "fromAddressTag");
    addressTo = safeString(transaction, "address");
    addressFrom = safeString(transaction, "fromAddress");
    isWithdraw = (ccxt_in("arriveQuantity", transaction));
    type_var = functions.ccxtruthy(isWithdraw) ? "withdrawal" : "deposit";
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => safeString(transaction, "id"),
    Symbol("txid") => safeString(transaction, "txId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => nothing,
    Symbol("addressTo") => addressTo,
    Symbol("addressFrom") => addressFrom,
    Symbol("tag") => nothing,
    Symbol("tagTo") => tagTo,
    Symbol("tagFrom") => tagFrom,
    Symbol("type") => type_var,
    Symbol("amount") => self.safeNumber(transaction, "quantity"),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "status")),
    Symbol("updated") => nothing,
    Symbol("fee") => fee,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing
)

end
function parseTransactionStatus(self::Toobit, status)
    statuses = Dict{Symbol, Any}(
        Symbol("2") => "pending",
        Symbol("12") => "pending",
        Symbol("11") => "failed",
        Symbol("3") => "ok"
    );
    if functions.ccxtruthy(status == nothing)
            return nothing
    end
    return safeString(statuses, status, status)

end
function fetchDepositAddress(self::Toobit, code, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    (networkCode, paramsOmitted) = self.handleNetworkCodeAndParams(extend(request, params));
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " fetchDepositAddress() : param[\"network\"] is required")));
    end
    request[Symbol("chainType")] = self.networkCodeToId(networkCode, code);
    response = Base.fetch(self.privateGetApiV1AccountDepositAddress(extend(request, paramsOmitted)));
    return self.parseDepositAddress(response, currency)

end
function parseDepositAddress(self::Toobit, depositAddress, currency=nothing)
    address = safeString(depositAddress, "address");
    self.checkAddress(address);
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => safeString(currency, "code"),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => safeString(depositAddress, "addressExt")
)

end
function withdraw(self::Toobit, code, amount, address, tag=nothing, params=Dict())
    self.checkAddress(address);
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode == nothing)
        throw(ArgumentsRequired(string(self.id, " withdraw() : param[\"network\"] is required")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("quantity") => self.currencyToPrecision(get(currency, Symbol("code"), nothing), amount),
        Symbol("chainType") => networkCode,
        Symbol("clientOrderId") => milliseconds()
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("addressExt")] = tag;
    end
    response = Base.fetch(self.privatePostApiV1AccountWithdraw(extend(request, params)));
    return self.parseTransaction(response, currency)

end
function setMarginMode(self::Toobit, marginMode, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("type"), nothing) != "swap")
        throw(BadSymbol(string(self.id, " setMarginMode() supports swap contracts only")));
    end
    marginMode = uppercase(marginMode);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginType") => marginMode
    );
    response = Base.fetch(self.privatePostApiV1FuturesMarginType(extend(request, params)));
    return response

end
function setLeverage(self::Toobit, leverage, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("leverage") => leverage
    );
    response = Base.fetch(self.privatePostApiV1FuturesLeverage(extend(request, params)));
    return response

end
function fetchLeverage(self::Toobit, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetApiV1FuturesAccountLeverage(extend(request, params)));
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return self.parseLeverage(data, market)

end
function parseLeverage(self::Toobit, leverage, market=nothing)
    marketId = safeString(leverage, "symbol");
    leverageValue = safeInteger(leverage, "leverage");
    marginType = safeString(leverage, "marginType");
    marginMode = functions.ccxtruthy((marginType == "crossed")) ? "cross" : "isolated";
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => self.safeSymbol(marketId, market),
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
function fetchPositions(self::Toobit, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbols != nothing)
        len = length(symbols);
        if functions.ccxtruthy(functions.ccxt_gt(len, 1))
            throw(BadRequest(string(self.id, " fetchPositions() only accepts an array with a single symbol or without symbols argument")));
        end
        firstSymbol = safeString(symbols, 0);
        if functions.ccxtruthy(firstSymbol != nothing)
            market = self.market(firstSymbol);
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
    end
    response = Base.fetch(self.privateGetApiV1FuturesPositions(extend(request, params)));
    return self.parsePositions(response, symbols)

end
function parsePosition(self::Toobit, position, market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId, market);
    side = safeStringLower(position, "side");
    quantity = safeString(position, "position");
    leverage = safeInteger(position, "leverage");
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => safeString(position, "id"),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("entryPrice") => safeString(position, "avgPrice"),
    Symbol("markPrice") => safeString(position, "markPrice"),
    Symbol("lastPrice") => safeString(position, "lastPrice"),
    Symbol("notional") => safeString(position, "positionValue"),
    Symbol("collateral") => nothing,
    Symbol("unrealizedPnl") => safeString(position, "unrealizedPnL"),
    Symbol("side") => side,
    Symbol("contracts") => self.parseNumber(quantity),
    Symbol("contractSize") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("hedged") => nothing,
    Symbol("maintenanceMargin") => nothing,
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => safeString(position, "margin"),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("leverage") => leverage,
    Symbol("liquidationPrice") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("percentage") => nothing
))

end
function sign(self::Toobit, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", self.implodeParams(path, params));
    isPost = method == "POST";
    isDelete = method == "DELETE";
    extraQuery = Dict{Symbol, Any}();
    query = omit(params, self.extractParams(path));
    if functions.ccxtruthy(api != "private")
        if functions.ccxtruthy(!functions.ccxtruthy(isPost))
            if functions.ccxtruthy(length(objectKeys(query)))
                url += string("?", self.urlencode(query));
            end
        end
    else
        self.checkRequiredCredentials();
        timestamp = milliseconds();
        extraQuery[Symbol("recvWindow")] = safeString(self.options, "recvWindow", "5000");
        extraQuery[Symbol("timestamp")] =         string(timestamp);
        queryExtended = extend(query, extraQuery);
        queryString = "";
        if functions.ccxtruthy(@functions.ccxt_or(isPost, isDelete))
            if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(params)))
                body = self.urlencode(queryExtended);
            else
                queryString = self.urlencode(extraQuery);
                body = json(query);
            end
        else
            queryString = self.urlencode(queryExtended);
        end
        payload = queryString;
        if functions.ccxtruthy(body != nothing)
            payload = string(body, payload);
        end
        signature = self.hmac(self.encode(payload), self.encode(self.secret), sha256, "hex");
        if functions.ccxtruthy(queryString != "")
            queryString += string("&signature=", signature);
            url += string("?", queryString);
        else
            body += string("&signature=", signature);
        end
        headers = Dict{Symbol, Any}(
            Symbol("Referrer") => "CCXT",
            Symbol("X-BB-APIKEY") => self.apiKey,
            Symbol("X-BB-API-PLATFORM") => safeString(self.options, "brokerId", "177321641268789"),
            Symbol("Content-Type") => "application/x-www-form-urlencoded"
        );
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function handleErrors(self::Toobit, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    errorCode = safeString(response, "code");
    message = safeString(response, "msg");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(errorCode, errorCode != "200"), errorCode != "0"))
        feedback = string(self.id, " ", body);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), message, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Toobit, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function commonGetApiV1Time(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/time", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetApiV1Ping(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/ping", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetApiV1ExchangeInfo(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/exchangeInfo", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1Depth(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/depth", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1DepthMerged(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/depth/merged", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1Trades(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/trades", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1Klines(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/klines", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1IndexKlines(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/index/klines", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1IndexPriceComponents(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/indexPriceComponents", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1MarkPriceKlines(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/markPrice/klines", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1MarkPrice(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/markPrice", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1Index(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/index", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1Ticker24hr(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/ticker/24hr", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1ContractTicker24hr(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/contract/ticker/24hr", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1TickerPrice(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/ticker/price", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1ContractTickerPrice(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/contract/ticker/price", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1TickerBookTicker(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/ticker/bookTicker", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetQuoteV1ContractTickerBookTicker(self::Toobit, params=Dict(), context=Dict())
    return request(self, "quote/v1/contract/ticker/bookTicker", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetApiV1FuturesFundingRate(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/fundingRate", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetApiV1FuturesHistoryFundingRate(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/historyFundingRate", "common", "GET", params, nothing, nothing, Dict())
end

function commonGetApiV1FuturesRiskLimits(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/riskLimits", "common", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1Account(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountCheckApiKey(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account/checkApiKey", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1SpotOrder(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1SpotOpenOrders(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/openOrders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesOpenOrders(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/openOrders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1SpotTradeOrders(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/tradeOrders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesHistoryOrders(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/historyOrders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountTrades(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account/trades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountBalanceFlow(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account/balanceFlow", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountDepositOrders(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account/depositOrders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountWithdrawOrders(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account/withdrawOrders", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountDepositAddress(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account/deposit/address", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1SubAccount(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/subAccount", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountSubAccount(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account/subAccount", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1SubAccountList(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/subAccount/list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesAccountLeverage(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/accountLeverage", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesOrder(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/order", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesPositions(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/positions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesHistoryPositions(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/historyPositions", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesBalance(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/balance", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesUserTrades(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/userTrades", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesBalanceFlow(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/balanceFlow", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesCommissionRate(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/commissionRate", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1FuturesTodayPnl(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/todayPnl", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AccountDownloadDetail(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account/download/detail", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentInviteUserList(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/inviteUserList", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentCommissionDataList(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/commissionDataList", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentCommissionDataInfo(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/commissionDataInfo", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentInviteRelationCheck(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/inviteRelationCheck", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentDepositDetailList(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/depositDetailList", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentQuerySubAgentData(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/querySubAgentData", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentSpotOrdersList(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/spotOrdersList", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentFuturesOrdersList(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/futuresOrdersList", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentFuturesPositionsList(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/futuresPositionsList", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentInviteCommissionDetail(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/invite-commission-detail", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentUserExport(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/user/export", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentExportList(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/export-list", "private", "GET", params, nothing, nothing, Dict())
end

function privateGetApiV1AgentExportUrl(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/agent/export-url", "private", "GET", params, nothing, nothing, Dict())
end

function privatePostApiV1SpotOrderTest(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/orderTest", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1SpotOrder(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1FuturesOrder(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1SpotBatchOrders(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/batchOrders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1SubAccountTransfer(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/subAccount/transfer", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1AccountWithdraw(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account/withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1FuturesMarginType(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/marginType", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1FuturesLeverage(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/leverage", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1FuturesBatchOrders(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/batchOrders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1FuturesPositionTradingStop(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/position/trading-stop", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1FuturesPositionMargin(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/positionMargin", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1FuturesOrderUpdate(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/order/update", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1FuturesAutoAddMargin(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/autoAddMargin", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1FuturesFlashClose(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/flashClose", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1FuturesReversePosition(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/reversePosition", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1AccountDownloadApply(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/account/download/apply", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1UserDataStream(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/userDataStream", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostApiV1ListenKey(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/listenKey", "private", "POST", params, nothing, nothing, Dict())
end

function privateDeleteApiV1SpotOrder(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/order", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteApiV1FuturesOrder(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/order", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteApiV1SpotOpenOrders(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/openOrders", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteApiV1FuturesBatchOrders(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/batchOrders", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteApiV1SpotCancelOrderByIds(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/cancelOrderByIds", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteApiV1FuturesCancelOrderByIds(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/cancelOrderByIds", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteApiV1UserDataStream(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/userDataStream", "private", "DELETE", params, nothing, nothing, Dict())
end

function privateDeleteApiV1ListenKey(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/listenKey", "private", "DELETE", params, nothing, nothing, Dict())
end

function privatePutApiV1UserDataStream(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/userDataStream", "private", "PUT", params, nothing, nothing, Dict())
end

function privatePutApiV1ListenKey(self::Toobit, params=Dict(), context=Dict())
    return request(self, "api/v1/listenKey", "private", "PUT", params, nothing, nothing, Dict())
end

function Toobit(; kwargs...)
    inst = Toobit(Exchange(), describe, fetchStatus, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, parseMarket, fetchOrderBook, fetchTrades, parseTrade, fetchOHLCV, parseOHLCV, fetchTickers, parseTicker, fetchLastPrices, parseLastPrice, fetchBidsAsks, parseBidsAsksCustom, parseBidAskCustom, fetchFundingRates, parseFundingRate, fetchFundingRateHistory, parseFundingRateHistory, fetchBalance, parseBalance, createOrder, createOrderRequest, createContractOrderRequest, parseOrder, parseOrderStatus, parseOrderType, cancelOrder, cancelAllOrders, cancelOrders, fetchOrder, fetchOpenOrders, fetchOrders, fetchClosedOrders, fetchMyTrades, transfer, parseTransfer, fetchLedger, parseLedgerEntry, parseLedgerType, fetchTradingFees, parseTradingFee, fetchDeposits, fetchWithdrawals, fetchDepositsOrWithdrawalsHelper, parseTransaction, parseTransactionStatus, fetchDepositAddress, parseDepositAddress, withdraw, setMarginMode, setLeverage, fetchLeverage, parseLeverage, fetchPositions, parsePosition, sign, handleErrors, commonGetApiV1Time, commonGetApiV1Ping, commonGetApiV1ExchangeInfo, commonGetQuoteV1Depth, commonGetQuoteV1DepthMerged, commonGetQuoteV1Trades, commonGetQuoteV1Klines, commonGetQuoteV1IndexKlines, commonGetQuoteV1IndexPriceComponents, commonGetQuoteV1MarkPriceKlines, commonGetQuoteV1MarkPrice, commonGetQuoteV1Index, commonGetQuoteV1Ticker24hr, commonGetQuoteV1ContractTicker24hr, commonGetQuoteV1TickerPrice, commonGetQuoteV1ContractTickerPrice, commonGetQuoteV1TickerBookTicker, commonGetQuoteV1ContractTickerBookTicker, commonGetApiV1FuturesFundingRate, commonGetApiV1FuturesHistoryFundingRate, commonGetApiV1FuturesRiskLimits, privateGetApiV1Account, privateGetApiV1AccountCheckApiKey, privateGetApiV1SpotOrder, privateGetApiV1SpotOpenOrders, privateGetApiV1FuturesOpenOrders, privateGetApiV1SpotTradeOrders, privateGetApiV1FuturesHistoryOrders, privateGetApiV1AccountTrades, privateGetApiV1AccountBalanceFlow, privateGetApiV1AccountDepositOrders, privateGetApiV1AccountWithdrawOrders, privateGetApiV1AccountDepositAddress, privateGetApiV1SubAccount, privateGetApiV1AccountSubAccount, privateGetApiV1SubAccountList, privateGetApiV1FuturesAccountLeverage, privateGetApiV1FuturesOrder, privateGetApiV1FuturesPositions, privateGetApiV1FuturesHistoryPositions, privateGetApiV1FuturesBalance, privateGetApiV1FuturesUserTrades, privateGetApiV1FuturesBalanceFlow, privateGetApiV1FuturesCommissionRate, privateGetApiV1FuturesTodayPnl, privateGetApiV1AccountDownloadDetail, privateGetApiV1AgentInviteUserList, privateGetApiV1AgentCommissionDataList, privateGetApiV1AgentCommissionDataInfo, privateGetApiV1AgentInviteRelationCheck, privateGetApiV1AgentDepositDetailList, privateGetApiV1AgentQuerySubAgentData, privateGetApiV1AgentSpotOrdersList, privateGetApiV1AgentFuturesOrdersList, privateGetApiV1AgentFuturesPositionsList, privateGetApiV1AgentInviteCommissionDetail, privateGetApiV1AgentUserExport, privateGetApiV1AgentExportList, privateGetApiV1AgentExportUrl, privatePostApiV1SpotOrderTest, privatePostApiV1SpotOrder, privatePostApiV1FuturesOrder, privatePostApiV1SpotBatchOrders, privatePostApiV1SubAccountTransfer, privatePostApiV1AccountWithdraw, privatePostApiV1FuturesMarginType, privatePostApiV1FuturesLeverage, privatePostApiV1FuturesBatchOrders, privatePostApiV1FuturesPositionTradingStop, privatePostApiV1FuturesPositionMargin, privatePostApiV1FuturesOrderUpdate, privatePostApiV1FuturesAutoAddMargin, privatePostApiV1FuturesFlashClose, privatePostApiV1FuturesReversePosition, privatePostApiV1AccountDownloadApply, privatePostApiV1UserDataStream, privatePostApiV1ListenKey, privateDeleteApiV1SpotOrder, privateDeleteApiV1FuturesOrder, privateDeleteApiV1SpotOpenOrders, privateDeleteApiV1FuturesBatchOrders, privateDeleteApiV1SpotCancelOrderByIds, privateDeleteApiV1FuturesCancelOrderByIds, privateDeleteApiV1UserDataStream, privateDeleteApiV1ListenKey, privatePutApiV1UserDataStream, privatePutApiV1ListenKey)
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
