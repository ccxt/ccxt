@kwdef mutable struct Hashkey <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    fetchTime::Function = fetchTime
    fetchStatus::Function = fetchStatus
    fetchMarkets::Function = fetchMarkets
    parseMarket::Function = parseMarket
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchOrderBook::Function = fetchOrderBook
    fetchTrades::Function = fetchTrades
    fetchMyTrades::Function = fetchMyTrades
    parseTrade::Function = parseTrade
    fetchOHLCV::Function = fetchOHLCV
    parseOHLCV::Function = parseOHLCV
    fetchTicker::Function = fetchTicker
    fetchTickers::Function = fetchTickers
    parseTicker::Function = parseTicker
    fetchLastPrices::Function = fetchLastPrices
    parseLastPrice::Function = parseLastPrice
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    parseSwapBalance::Function = parseSwapBalance
    fetchDepositAddress::Function = fetchDepositAddress
    parseDepositAddress::Function = parseDepositAddress
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    withdraw::Function = withdraw
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    transfer::Function = transfer
    parseTransfer::Function = parseTransfer
    fetchAccounts::Function = fetchAccounts
    parseAccount::Function = parseAccount
    parseAccountType::Function = parseAccountType
    encodeAccountType::Function = encodeAccountType
    encodeFlowType::Function = encodeFlowType
    fetchLedger::Function = fetchLedger
    parseLedgerEntryType::Function = parseLedgerEntryType
    parseLedgerEntry::Function = parseLedgerEntry
    createOrder::Function = createOrder
    createMarketBuyOrderWithCost::Function = createMarketBuyOrderWithCost
    createSpotOrder::Function = createSpotOrder
    createOrderRequest::Function = createOrderRequest
    createSpotOrderRequest::Function = createSpotOrderRequest
    createSwapOrderRequest::Function = createSwapOrderRequest
    createSwapOrder::Function = createSwapOrder
    createOrders::Function = createOrders
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    cancelOrders::Function = cancelOrders
    fetchOrder::Function = fetchOrder
    fetchOpenOrders::Function = fetchOpenOrders
    fetchOpenSpotOrders::Function = fetchOpenSpotOrders
    fetchOpenSwapOrders::Function = fetchOpenSwapOrders
    fetchCanceledAndClosedOrders::Function = fetchCanceledAndClosedOrders
    checkTypeParam::Function = checkTypeParam
    handleTriggerOptionAndParams::Function = handleTriggerOptionAndParams
    parseOrder::Function = parseOrder
    parseOrderSideAndReduceOnly::Function = parseOrderSideAndReduceOnly
    parseOrderStatus::Function = parseOrderStatus
    parseOrderTypeTimeInForceAndPostOnly::Function = parseOrderTypeTimeInForceAndPostOnly
    parseOrderType::Function = parseOrderType
    fetchFundingRate::Function = fetchFundingRate
    fetchFundingRates::Function = fetchFundingRates
    parseFundingRate::Function = parseFundingRate
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchPositions::Function = fetchPositions
    fetchPositionsForSymbol::Function = fetchPositionsForSymbol
    parsePosition::Function = parsePosition
    fetchLeverage::Function = fetchLeverage
    parseLeverage::Function = parseLeverage
    setLeverage::Function = setLeverage
    setMarginMode::Function = setMarginMode
    addMargin::Function = addMargin
    reduceMargin::Function = reduceMargin
    modifyMarginHelper::Function = modifyMarginHelper
    parseMarginModification::Function = parseMarginModification
    fetchLeverageTiers::Function = fetchLeverageTiers
    parseMarketLeverageTiers::Function = parseMarketLeverageTiers
    fetchTradingFee::Function = fetchTradingFee
    fetchTradingFees::Function = fetchTradingFees
    parseTradingFee::Function = parseTradingFee
    sign::Function = sign
    customUrlencode::Function = customUrlencode
    handleErrors::Function = handleErrors

# Generated REST endpoint fields
    publicGetApiV1ExchangeInfo::Function = publicGetApiV1ExchangeInfo
    publicGetQuoteV1Depth::Function = publicGetQuoteV1Depth
    publicGetQuoteV1Trades::Function = publicGetQuoteV1Trades
    publicGetQuoteV1Klines::Function = publicGetQuoteV1Klines
    publicGetQuoteV1Ticker24hr::Function = publicGetQuoteV1Ticker24hr
    publicGetQuoteV1TickerPrice::Function = publicGetQuoteV1TickerPrice
    publicGetQuoteV1TickerBookTicker::Function = publicGetQuoteV1TickerBookTicker
    publicGetQuoteV1DepthMerged::Function = publicGetQuoteV1DepthMerged
    publicGetQuoteV1MarkPrice::Function = publicGetQuoteV1MarkPrice
    publicGetQuoteV1Index::Function = publicGetQuoteV1Index
    publicGetApiV1FuturesFundingRate::Function = publicGetApiV1FuturesFundingRate
    publicGetApiV1FuturesHistoryFundingRate::Function = publicGetApiV1FuturesHistoryFundingRate
    publicGetApiV1Ping::Function = publicGetApiV1Ping
    publicGetApiV1Time::Function = publicGetApiV1Time
    privateGetApiV1SpotOrder::Function = privateGetApiV1SpotOrder
    privateGetApiV1SpotOpenOrders::Function = privateGetApiV1SpotOpenOrders
    privateGetApiV1SpotTradeOrders::Function = privateGetApiV1SpotTradeOrders
    privateGetApiV1FuturesLeverage::Function = privateGetApiV1FuturesLeverage
    privateGetApiV1FuturesOrder::Function = privateGetApiV1FuturesOrder
    privateGetApiV1FuturesOpenOrders::Function = privateGetApiV1FuturesOpenOrders
    privateGetApiV1FuturesUserTrades::Function = privateGetApiV1FuturesUserTrades
    privateGetApiV1FuturesPositions::Function = privateGetApiV1FuturesPositions
    privateGetApiV1FuturesHistoryOrders::Function = privateGetApiV1FuturesHistoryOrders
    privateGetApiV1FuturesBalance::Function = privateGetApiV1FuturesBalance
    privateGetApiV1FuturesLiquidationAssignStatus::Function = privateGetApiV1FuturesLiquidationAssignStatus
    privateGetApiV1FuturesRiskLimit::Function = privateGetApiV1FuturesRiskLimit
    privateGetApiV1FuturesCommissionRate::Function = privateGetApiV1FuturesCommissionRate
    privateGetApiV1FuturesGetBestOrder::Function = privateGetApiV1FuturesGetBestOrder
    privateGetApiV1CoinInfo::Function = privateGetApiV1CoinInfo
    privateGetApiV1AccountVipInfo::Function = privateGetApiV1AccountVipInfo
    privateGetApiV1Account::Function = privateGetApiV1Account
    privateGetApiV1AccountTrades::Function = privateGetApiV1AccountTrades
    privateGetApiV1AccountType::Function = privateGetApiV1AccountType
    privateGetApiV1AccountChainType::Function = privateGetApiV1AccountChainType
    privateGetApiV1AccountCheckApiKey::Function = privateGetApiV1AccountCheckApiKey
    privateGetApiV1AccountBalanceFlow::Function = privateGetApiV1AccountBalanceFlow
    privateGetApiV1SpotSubAccountOpenOrders::Function = privateGetApiV1SpotSubAccountOpenOrders
    privateGetApiV1SpotSubAccountTradeOrders::Function = privateGetApiV1SpotSubAccountTradeOrders
    privateGetApiV1SubAccountTrades::Function = privateGetApiV1SubAccountTrades
    privateGetApiV1FuturesSubAccountOpenOrders::Function = privateGetApiV1FuturesSubAccountOpenOrders
    privateGetApiV1FuturesSubAccountHistoryOrders::Function = privateGetApiV1FuturesSubAccountHistoryOrders
    privateGetApiV1FuturesSubAccountUserTrades::Function = privateGetApiV1FuturesSubAccountUserTrades
    privateGetApiV1AccountDepositAddress::Function = privateGetApiV1AccountDepositAddress
    privateGetApiV1AccountDepositOrders::Function = privateGetApiV1AccountDepositOrders
    privateGetApiV1AccountWithdrawOrders::Function = privateGetApiV1AccountWithdrawOrders
    privatePostApiV1UserDataStream::Function = privatePostApiV1UserDataStream
    privatePostApiV1SpotOrderTest::Function = privatePostApiV1SpotOrderTest
    privatePostApiV1SpotOrder::Function = privatePostApiV1SpotOrder
    privatePostApiV11SpotOrder::Function = privatePostApiV11SpotOrder
    privatePostApiV1SpotBatchOrders::Function = privatePostApiV1SpotBatchOrders
    privatePostApiV1FuturesLeverage::Function = privatePostApiV1FuturesLeverage
    privatePostApiV1FuturesOrder::Function = privatePostApiV1FuturesOrder
    privatePostApiV1FuturesMarginType::Function = privatePostApiV1FuturesMarginType
    privatePostApiV1FuturesPositionMargin::Function = privatePostApiV1FuturesPositionMargin
    privatePostApiV1FuturesPositionTradingStop::Function = privatePostApiV1FuturesPositionTradingStop
    privatePostApiV1FuturesBatchOrders::Function = privatePostApiV1FuturesBatchOrders
    privatePostApiV1AccountAssetTransfer::Function = privatePostApiV1AccountAssetTransfer
    privatePostApiV1AccountAuthAddress::Function = privatePostApiV1AccountAuthAddress
    privatePostApiV1AccountWithdraw::Function = privatePostApiV1AccountWithdraw
    privatePutApiV1UserDataStream::Function = privatePutApiV1UserDataStream
    privateDeleteApiV1SpotOrder::Function = privateDeleteApiV1SpotOrder
    privateDeleteApiV1SpotOpenOrders::Function = privateDeleteApiV1SpotOpenOrders
    privateDeleteApiV1SpotCancelOrderByIds::Function = privateDeleteApiV1SpotCancelOrderByIds
    privateDeleteApiV1FuturesOrder::Function = privateDeleteApiV1FuturesOrder
    privateDeleteApiV1FuturesBatchOrders::Function = privateDeleteApiV1FuturesBatchOrders
    privateDeleteApiV1FuturesCancelOrderByIds::Function = privateDeleteApiV1FuturesCancelOrderByIds
    privateDeleteApiV1UserDataStream::Function = privateDeleteApiV1UserDataStream

end
function describe(self::Hashkey, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "hashkey",
    Symbol("name") => "HashKey Global",
    Symbol("countries") => ["BM"],
    Symbol("rateLimit") => 100,
    Symbol("version") => "v1",
    Symbol("certified") => true,
    Symbol("pro") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => true,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("borrowMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => true,
        Symbol("cancelWithdraw") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createConvertTrade") => false,
        Symbol("createDepositAddress") => false,
        Symbol("createMarketBuyOrderWithCost") => true,
        Symbol("createMarketOrder") => true,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => true,
        Symbol("createOrderWithTakeProfitAndStopLoss") => false,
        Symbol("createReduceOnlyOrder") => true,
        Symbol("createStopLimitOrder") => true,
        Symbol("createStopLossOrder") => false,
        Symbol("createStopMarketOrder") => true,
        Symbol("createStopOrder") => true,
        Symbol("createTakeProfitOrder") => false,
        Symbol("createTrailingAmountOrder") => false,
        Symbol("createTrailingPercentOrder") => false,
        Symbol("createTriggerOrder") => true,
        Symbol("fetchAccounts") => true,
        Symbol("fetchAllGreeks") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRate") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchBorrowRates") => false,
        Symbol("fetchBorrowRatesPerSymbol") => false,
        Symbol("fetchCanceledAndClosedOrders") => true,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrder") => true,
        Symbol("fetchClosedOrders") => false,
        Symbol("fetchConvertCurrencies") => false,
        Symbol("fetchConvertQuote") => false,
        Symbol("fetchConvertTrade") => false,
        Symbol("fetchConvertTradeHistory") => false,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => true,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDepositAddressesByNetwork") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositsWithdrawals") => false,
        Symbol("fetchFundingHistory") => false,
        Symbol("fetchFundingInterval") => false,
        Symbol("fetchFundingIntervals") => false,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => true,
        Symbol("fetchGreeks") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchIsolatedPositions") => false,
        Symbol("fetchLastPrices") => true,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => true,
        Symbol("fetchLeverages") => false,
        Symbol("fetchLeverageTiers") => true,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchLongShortRatio") => false,
        Symbol("fetchLongShortRatioHistory") => false,
        Symbol("fetchMarginAdjustmentHistory") => false,
        Symbol("fetchMarginMode") => false,
        Symbol("fetchMarginModes") => false,
        Symbol("fetchMarketLeverageTiers") => "emulated",
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMarkPrice") => false,
        Symbol("fetchMarkPrices") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMySettlementHistory") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => true,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrder") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOption") => false,
        Symbol("fetchOptionChain") => false,
        Symbol("fetchOrder") => true,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrders") => false,
        Symbol("fetchOrderTrades") => false,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionHistory") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsForSymbol") => true,
        Symbol("fetchPositionsHistory") => false,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchSettlementHistory") => false,
        Symbol("fetchStatus") => true,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => true,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => true,
        Symbol("fetchTradingFees") => true,
        Symbol("fetchTransactions") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchUnderlyingAssets") => false,
        Symbol("fetchVolatilityHistory") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => true,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => false,
        Symbol("setLeverage") => true,
        Symbol("setMargin") => false,
        Symbol("setMarginMode") => true,
        Symbol("setPositionMode") => false,
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
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/3dd65db2-5da9-4ecc-93ac-6d420f36261c",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api-glb.hashkey.com",
            Symbol("private") => "https://api-glb.hashkey.com"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://api-glb.sim.hashkeydev.com",
            Symbol("private") => "https://api-glb.sim.hashkeydev.com"
        ),
        Symbol("www") => "https://global.hashkey.com/",
        Symbol("doc") => "https://hashkeyglobal-apidoc.readme.io/",
        Symbol("fees") => "https://support.global.hashkey.com/hc/en-us/articles/13199900083612-HashKey-Global-Fee-Structure",
        Symbol("referral") => "https://global.hashkey.com/en-US/register/invite?invite_code=82FQUN"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("api/v1/exchangeInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("quote/v1/depth") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/klines") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/ticker/24hr") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/ticker/price") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/ticker/bookTicker") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/depth/merged") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/markPrice") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("quote/v1/index") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/fundingRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/historyFundingRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/ping") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/time") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("get") => Dict{Symbol, Any}(
                Symbol("api/v1/spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/spot/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/spot/tradeOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/futures/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/userTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/positions") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/historyOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/balance") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/liquidationAssignStatus") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/riskLimit") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/commissionRate") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/getBestOrder") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/coinInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/vipInfo") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/account/type") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/account/chainType") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/checkApiKey") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/balanceFlow") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/spot/subAccount/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/spot/subAccount/tradeOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/subAccount/trades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/subAccount/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/subAccount/historyOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/subAccount/userTrades") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/deposit/address") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/depositOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/withdrawOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("post") => Dict{Symbol, Any}(
                Symbol("api/v1/userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/spot/orderTest") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1.1/spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/spot/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/futures/leverage") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/marginType") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/positionMargin") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/position/trading-stop") => Dict{Symbol, Any}(
    Symbol("cost") => 3
),
                Symbol("api/v1/futures/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/account/assetTransfer") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/authAddress") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/account/withdraw") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("put") => Dict{Symbol, Any}(
                Symbol("api/v1/userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            ),
            Symbol("delete") => Dict{Symbol, Any}(
                Symbol("api/v1/spot/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/spot/openOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/spot/cancelOrderByIds") => Dict{Symbol, Any}(
    Symbol("cost") => 5
),
                Symbol("api/v1/futures/order") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/batchOrders") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/futures/cancelOrderByIds") => Dict{Symbol, Any}(
    Symbol("cost") => 1
),
                Symbol("api/v1/userDataStream") => Dict{Symbol, Any}(
    Symbol("cost") => 1
)
            )
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("spot") => Dict{Symbol, Any}(
                Symbol("tierBased") => true,
                Symbol("percentage") => true,
                Symbol("feeSide") => "get",
                Symbol("maker") => self.parseNumber("0.0012"),
                Symbol("taker") => self.parseNumber("0.0012"),
                Symbol("tiers") => Dict{Symbol, Any}(
                    Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.0012")], [self.parseNumber("1000000"), self.parseNumber("0.00080")], [self.parseNumber("5000000"), self.parseNumber("0.00070")], [self.parseNumber("10000000"), self.parseNumber("0.00060")], [self.parseNumber("50000000"), self.parseNumber("0.00040")], [self.parseNumber("200000000"), self.parseNumber("0.00030")], [self.parseNumber("400000000"), self.parseNumber("0.00010")], [self.parseNumber("800000000"), self.parseNumber("0.00")]],
                    Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.0012")], [self.parseNumber("1000000"), self.parseNumber("0.00090")], [self.parseNumber("5000000"), self.parseNumber("0.00085")], [self.parseNumber("10000000"), self.parseNumber("0.00075")], [self.parseNumber("50000000"), self.parseNumber("0.00065")], [self.parseNumber("200000000"), self.parseNumber("0.00045")], [self.parseNumber("400000000"), self.parseNumber("0.00040")], [self.parseNumber("800000000"), self.parseNumber("0.00035")]]
                )
            ),
            Symbol("swap") => Dict{Symbol, Any}(
                Symbol("tierBased") => true,
                Symbol("percentage") => true,
                Symbol("feeSide") => "get",
                Symbol("maker") => self.parseNumber("0.00025"),
                Symbol("taker") => self.parseNumber("0.00060"),
                Symbol("tiers") => Dict{Symbol, Any}(
                    Symbol("maker") => [[self.parseNumber("0"), self.parseNumber("0.00025")], [self.parseNumber("1000000"), self.parseNumber("0.00016")], [self.parseNumber("5000000"), self.parseNumber("0.00014")], [self.parseNumber("10000000"), self.parseNumber("0.00012")], [self.parseNumber("50000000"), self.parseNumber("0.000080")], [self.parseNumber("200000000"), self.parseNumber("0.000060")], [self.parseNumber("400000000"), self.parseNumber("0.000020")], [self.parseNumber("800000000"), self.parseNumber("0.00")]],
                    Symbol("taker") => [[self.parseNumber("0"), self.parseNumber("0.00060")], [self.parseNumber("1000000"), self.parseNumber("0.00050")], [self.parseNumber("5000000"), self.parseNumber("0.00045")], [self.parseNumber("10000000"), self.parseNumber("0.00040")], [self.parseNumber("50000000"), self.parseNumber("0.00035")], [self.parseNumber("200000000"), self.parseNumber("0.00030")], [self.parseNumber("400000000"), self.parseNumber("0.00025")], [self.parseNumber("800000000"), self.parseNumber("0.00020")]]
                )
            )
        )
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("broker") => "10000700011",
        Symbol("recvWindow") => nothing,
        Symbol("sandboxMode") => false,
        Symbol("networks") => Dict{Symbol, Any}(
            Symbol("BTC") => "BTC",
            Symbol("ERC20") => "ETH",
            Symbol("AVAX") => "AvalancheC",
            Symbol("SOL") => "Solana",
            Symbol("MATIC") => "Polygon",
            Symbol("ATOM") => "Cosmos",
            Symbol("DOT") => "Polkadot",
            Symbol("LTC") => "LTC",
            Symbol("OPTIMISM") => "Optimism",
            Symbol("ARBITRUM") => "Arbitrum",
            Symbol("DOGE") => "Dogecoin",
            Symbol("TRC20") => "Tron",
            Symbol("ZKSYNC") => "zkSync",
            Symbol("TON") => "TON",
            Symbol("KLAYTN") => "Klaytn",
            Symbol("MERLINCHAIN") => "Merlin Chain"
        ),
        Symbol("networksById") => Dict{Symbol, Any}(
            Symbol("BTC") => "BTC",
            Symbol("Bitcoin") => "BTC",
            Symbol("ETH") => "ERC20",
            Symbol("ERC20") => "ERC20",
            Symbol("AvalancheC") => "AVAX",
            Symbol("AVAX C-Chain") => "AVAX",
            Symbol("Solana") => "SOL",
            Symbol("Cosmos") => "ATOM",
            Symbol("Arbitrum") => "ARBITRUM",
            Symbol("Polygon") => "MATIC",
            Symbol("Optimism") => "OPTIMISM",
            Symbol("Polkadot") => "DOT",
            Symbol("LTC") => "LTC",
            Symbol("Litecoin") => "LTC",
            Symbol("Dogecoin") => "DOGE",
            Symbol("Merlin Chain") => "MERLINCHAIN",
            Symbol("zkSync") => "ZKSYNC",
            Symbol("TRC20") => "TRC20",
            Symbol("Tron") => "TRC20",
            Symbol("TON") => "TON",
            Symbol("BSC(BEP20)") => "BSC",
            Symbol("Klaytn") => "KLAYTN"
        ),
        Symbol("defaultNetwork") => "ERC20"
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("default") => Dict{Symbol, Any}(
            Symbol("sandbox") => true,
            Symbol("createOrder") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("triggerPrice") => false,
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
                Symbol("marketBuyByCost") => true,
                Symbol("marketBuyRequiresPrice") => true,
                Symbol("selfTradePrevention") => true,
                Symbol("iceberg") => false
            ),
            Symbol("createOrders") => Dict{Symbol, Any}(
                Symbol("max") => 20
            ),
            Symbol("fetchMyTrades") => Dict{Symbol, Any}(
                Symbol("marginMode") => false,
                Symbol("limit") => 1000,
                Symbol("daysBack") => 30,
                Symbol("untilDays") => 30,
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
                Symbol("trigger") => false,
                Symbol("trailing") => false,
                Symbol("symbolRequired") => false
            ),
            Symbol("fetchOrders") => nothing,
            Symbol("fetchClosedOrders") => nothing,
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
                Symbol("selfTradePrevention") => true
            ),
            Symbol("fetchOpenOrders") => Dict{Symbol, Any}(
                Symbol("trigger") => true,
                Symbol("limit") => 500
            )
        ),
        Symbol("swap") => Dict{Symbol, Any}(
            Symbol("linear") => Dict{Symbol, Any}(
                Symbol("extends") => "forDerivatives"
            ),
            Symbol("inverse") => nothing
        ),
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("0001") => BadRequest,
            Symbol("0002") => AuthenticationError,
            Symbol("0003") => RateLimitExceeded,
            Symbol("0102") => AuthenticationError,
            Symbol("0103") => AuthenticationError,
            Symbol("0104") => PermissionDenied,
            Symbol("0201") => ExchangeError,
            Symbol("0202") => PermissionDenied,
            Symbol("0206") => BadRequest,
            Symbol("0207") => BadRequest,
            Symbol("0209") => BadRequest,
            Symbol("0210") => BadRequest,
            Symbol("0211") => OrderNotFound,
            Symbol("0401") => InsufficientFunds,
            Symbol("0402") => BadRequest,
            Symbol("-1000") => ExchangeError,
            Symbol("-1001") => ExchangeError,
            Symbol("-100010") => BadSymbol,
            Symbol("-100012") => BadSymbol,
            Symbol("-1002") => AuthenticationError,
            Symbol("-1004") => BadRequest,
            Symbol("-1005") => PermissionDenied,
            Symbol("-1006") => ExchangeError,
            Symbol("-1007") => RequestTimeout,
            Symbol("-1014") => InvalidOrder,
            Symbol("-1015") => InvalidOrder,
            Symbol("-1020") => OperationRejected,
            Symbol("-1021") => InvalidNonce,
            Symbol("-1024") => BadRequest,
            Symbol("-1101") => ExchangeNotAvailable,
            Symbol("-1115") => InvalidOrder,
            Symbol("-1117") => InvalidOrder,
            Symbol("-1123") => InvalidOrder,
            Symbol("-1124") => InvalidOrder,
            Symbol("-1126") => InvalidOrder,
            Symbol("-1129") => BadRequest,
            Symbol("-1130") => BadRequest,
            Symbol("-1132") => BadRequest,
            Symbol("-1133") => BadRequest,
            Symbol("-1135") => BadRequest,
            Symbol("-1136") => BadRequest,
            Symbol("-1138") => InvalidOrder,
            Symbol("-1137") => InvalidOrder,
            Symbol("-1139") => OrderImmediatelyFillable,
            Symbol("-1140") => InvalidOrder,
            Symbol("-1141") => DuplicateOrderId,
            Symbol("-1142") => OrderNotFillable,
            Symbol("-1143") => OrderNotFound,
            Symbol("-1144") => OperationRejected,
            Symbol("-1145") => NotSupported,
            Symbol("-1146") => RequestTimeout,
            Symbol("-1147") => RequestTimeout,
            Symbol("-1148") => InvalidOrder,
            Symbol("-1149") => OperationRejected,
            Symbol("-1150") => OperationFailed,
            Symbol("-1151") => OperationRejected,
            Symbol("-1152") => AccountNotEnabled,
            Symbol("-1153") => InvalidOrder,
            Symbol("-1154") => InvalidOrder,
            Symbol("-1155") => OperationRejected,
            Symbol("-1156") => OperationFailed,
            Symbol("-1157") => OperationFailed,
            Symbol("-1158") => OperationFailed,
            Symbol("-1159") => AccountNotEnabled,
            Symbol("-1160") => AccountNotEnabled,
            Symbol("-1161") => OperationFailed,
            Symbol("-1162") => ContractUnavailable,
            Symbol("-1163") => InvalidAddress,
            Symbol("-1164") => OperationFailed,
            Symbol("-1165") => ArgumentsRequired,
            Symbol("-1166") => OperationRejected,
            Symbol("-1167") => BadRequest,
            Symbol("-1168") => BadRequest,
            Symbol("-1169") => PermissionDenied,
            Symbol("-1170") => PermissionDenied,
            Symbol("-1171") => PermissionDenied,
            Symbol("-1172") => BadRequest,
            Symbol("-1173") => BadRequest,
            Symbol("-1174") => PermissionDenied,
            Symbol("-1175") => BadRequest,
            Symbol("-1176") => BadRequest,
            Symbol("-1177") => InvalidOrder,
            Symbol("-1178") => AccountNotEnabled,
            Symbol("-1179") => AccountSuspended,
            Symbol("-1181") => ExchangeError,
            Symbol("-1193") => OperationRejected,
            Symbol("-1194") => OperationRejected,
            Symbol("-1195") => BadRequest,
            Symbol("-1196") => BadRequest,
            Symbol("-1200") => BadRequest,
            Symbol("-1201") => BadRequest,
            Symbol("-1202") => BadRequest,
            Symbol("-1203") => BadRequest,
            Symbol("-1204") => BadRequest,
            Symbol("-1205") => AccountNotEnabled,
            Symbol("-1206") => BadRequest,
            Symbol("-1207") => BadRequest,
            Symbol("-1208") => BadRequest,
            Symbol("-1209") => BadRequest,
            Symbol("-2001") => ExchangeNotAvailable,
            Symbol("-2002") => OperationFailed,
            Symbol("-2003") => OperationFailed,
            Symbol("-2004") => OperationFailed,
            Symbol("-2005") => RequestTimeout,
            Symbol("-2010") => OperationRejected,
            Symbol("-2011") => OperationRejected,
            Symbol("-2016") => OperationRejected,
            Symbol("-2017") => OperationRejected,
            Symbol("-2018") => OperationRejected,
            Symbol("-2019") => PermissionDenied,
            Symbol("-2020") => PermissionDenied,
            Symbol("-2021") => PermissionDenied,
            Symbol("-2022") => OperationRejected,
            Symbol("-2023") => AuthenticationError,
            Symbol("-2024") => AccountNotEnabled,
            Symbol("-2025") => AccountNotEnabled,
            Symbol("-2026") => BadRequest,
            Symbol("-2027") => OperationRejected,
            Symbol("-2028") => OperationRejected,
            Symbol("-2029") => OperationRejected,
            Symbol("-2030") => InsufficientFunds,
            Symbol("-2031") => NotSupported,
            Symbol("-2032") => OperationRejected,
            Symbol("-2033") => OperationFailed,
            Symbol("-2034") => InsufficientFunds,
            Symbol("-2035") => OperationRejected,
            Symbol("-2036") => NotSupported,
            Symbol("-2037") => ExchangeError,
            Symbol("-2038") => InsufficientFunds,
            Symbol("-2039") => NotSupported,
            Symbol("-2040") => ExchangeNotAvailable,
            Symbol("-2041") => BadRequest,
            Symbol("-2042") => OperationRejected,
            Symbol("-2043") => OperationRejected,
            Symbol("-2044") => BadRequest,
            Symbol("-2045") => BadRequest,
            Symbol("-2046") => BadRequest,
            Symbol("-2048") => BadRequest,
            Symbol("-2049") => BadRequest,
            Symbol("-2050") => BadRequest,
            Symbol("-2051") => OperationRejected,
            Symbol("-2052") => OperationRejected,
            Symbol("-2053") => OperationRejected,
            Symbol("-2054") => BadRequest,
            Symbol("-2055") => BadRequest,
            Symbol("-2056") => BadRequest,
            Symbol("-2057") => BadRequest,
            Symbol("-3117") => PermissionDenied,
            Symbol("-3143") => PermissionDenied,
            Symbol("-3144") => PermissionDenied,
            Symbol("-3145") => DDoSProtection,
            Symbol("-4001") => BadRequest,
            Symbol("-4002") => BadRequest,
            Symbol("-4003") => InsufficientFunds,
            Symbol("-4004") => BadRequest,
            Symbol("-4005") => BadRequest,
            Symbol("-4006") => AccountNotEnabled,
            Symbol("-4007") => NotSupported,
            Symbol("-4008") => AccountNotEnabled,
            Symbol("-4009") => PermissionDenied,
            Symbol("-4010") => PermissionDenied,
            Symbol("-4011") => ExchangeError,
            Symbol("-4012") => ExchangeError,
            Symbol("-4013") => OperationFailed
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("precisionMode") => TICK_SIZE
))

end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://hashkeyglobal-apidoc.readme.io/reference/check-server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
function fetchTime(self::Hashkey; params=Dict())
    response = Base.fetch(self.publicGetApiV1Time(params));
    return safeInteger(response, "serverTime")

end
"""
the latest known information on the availability of the exchange API
see: https://hashkeyglobal-apidoc.readme.io/reference/test-connectivity

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
function fetchStatus(self::Hashkey; params=Dict())
    response = Base.fetch(self.publicGetApiV1Ping(params));
    return Dict{Symbol, Any}(
    Symbol("status") => "ok",
    Symbol("updated") => nothing,
    Symbol("eta") => nothing,
    Symbol("url") => nothing,
    Symbol("info") => response
)

end
"""
retrieves data on all markets for the exchange
see: https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.symbol`::string, optional: the id of the market to fetch

# Returns
- an array of objects representing market data
"""
function fetchMarkets(self::Hashkey; params=Dict())
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.publicGetApiV1ExchangeInfo(extend(request, params)));
    spotMarkets = self.safeList(response, "symbols", defaultValue = []);
    swapMarkets = self.safeList(response, "contracts", defaultValue = []);
    markets = arrayConcat(spotMarkets, swapMarkets);
    if functions.ccxtruthy(isEmpty(markets))
        markets = [response];
    end
    return self.parseMarkets(markets)

end
function parseMarket(self::Hashkey, market)
    marketId = safeString(market, "symbol");
    quoteId = safeString(market, "quoteAsset");
    quote_var = self.safeCurrencyCode(quoteId);
    settleId = safeString(market, "marginToken");
    settle = self.safeCurrencyCode(settleId);
    baseId = safeString(market, "baseAsset");
    marketType = "spot";
    isSpot = true;
    isSwap = false;
    suffix = "";
    parts = split(marketId, "-");
    secondPart = safeString(parts, 1);
    if functions.ccxtruthy(secondPart == "PERPETUAL")
        marketType = "swap";
        isSpot = false;
        isSwap = true;
        baseId = safeString(market, "underlying");
        suffix += string(":", settleId);
    end
    base = self.safeCurrencyCode(baseId);
    symbol = string(base, "/", quote_var, suffix);
    status = safeString(market, "status");
    active = status == "TRADING";
    isLinear = nothing;
    subType = nothing;
    isInverse = self.safeBool(market, "inverse");
    if functions.ccxtruthy(isInverse != nothing)
        if functions.ccxtruthy(isInverse)
            isLinear = false;
            subType = "inverse";
        else
            isLinear = true;
            subType = "linear";
        end
    end
    filtersList = self.safeList(market, "filters", defaultValue = []);
    filters = indexBy(filtersList, "filterType");
    priceFilter = self.safeDict(filters, "PRICE_FILTER", defaultValue = Dict{Symbol, Any}());
    amountFilter = self.safeDict(filters, "LOT_SIZE", defaultValue = Dict{Symbol, Any}());
    costFilter = self.safeDict(filters, "MIN_NOTIONAL", defaultValue = Dict{Symbol, Any}());
    minCostString = omitZero(safeString(costFilter, "min_notional"));
    contractSizeString = safeString(market, "contractMultiplier");
    amountPrecisionString = safeString(amountFilter, "stepSize");
    amountMinLimitString = safeString(amountFilter, "minQty");
    amountMaxLimitString = safeString(amountFilter, "maxQty");
    minLeverage = nothing;
    maxLeverage = nothing;
    if functions.ccxtruthy(isSwap)
        amountPrecisionString = stringDiv(amountPrecisionString, contractSizeString);
        amountMinLimitString = stringDiv(amountMinLimitString, contractSizeString);
        amountMaxLimitString = stringDiv(amountMaxLimitString, contractSizeString);
        riskLimits = self.safeList(market, "riskLimits");
        if functions.ccxtruthy(riskLimits != nothing)
            first_var = self.safeDict(riskLimits, 0);
            arrayLength = length(riskLimits);
            last_var = self.safeDict(riskLimits, arrayLength - 1);
            minInitialMargin = safeString(first_var, "initialMargin");
            maxInitialMargin = safeString(last_var, "initialMargin");
            if functions.ccxtruthy(stringGt(minInitialMargin, maxInitialMargin))
                (minInitialMargin, maxInitialMargin) = [maxInitialMargin, minInitialMargin];
            end
            minLeverage = self.parseToInt(stringDiv("1", maxInitialMargin));
            maxLeverage = self.parseToInt(stringDiv("1", minInitialMargin));
        end
    end
    tradingFees = self.safeDict(self.fees, "trading");
    fees = functions.ccxtruthy(isSpot) ? self.safeDict(tradingFees, "spot") : self.safeDict(tradingFees, "swap");
    return self.safeMarketStructure(market = Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("active") => active,
    Symbol("type") => marketType,
    Symbol("subType") => subType,
    Symbol("spot") => isSpot,
    Symbol("margin") => self.safeBool(market, "allowMargin"),
    Symbol("swap") => isSwap,
    Symbol("future") => false,
    Symbol("option") => false,
    Symbol("contract") => isSwap,
    Symbol("settle") => settle,
    Symbol("settleId") => settleId,
    Symbol("contractSize") => self.parseNumber(contractSizeString),
    Symbol("linear") => isLinear,
    Symbol("inverse") => isInverse,
    Symbol("taker") => self.safeNumber(fees, "taker"),
    Symbol("maker") => self.safeNumber(fees, "maker"),
    Symbol("percentage") => self.safeBool(fees, "percentage"),
    Symbol("tierBased") => self.safeBool(fees, "tierBased"),
    Symbol("feeSide") => safeString(fees, "feeSide"),
    Symbol("expiry") => nothing,
    Symbol("expiryDatetime") => nothing,
    Symbol("strike") => nothing,
    Symbol("optionType") => nothing,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.parseNumber(amountPrecisionString),
        Symbol("price") => self.safeNumber(priceFilter, "tickSize")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(amountMinLimitString),
            Symbol("max") => self.parseNumber(amountMaxLimitString)
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(priceFilter, "minPrice"),
            Symbol("max") => self.safeNumber(priceFilter, "maxPrice")
        ),
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => minLeverage,
            Symbol("max") => maxLeverage
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => self.parseNumber(minCostString),
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
"""
fetches all available currencies on an exchange
see: https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
function fetchCurrencies(self::Hashkey; params=Dict())
    response = Base.fetch(self.publicGetApiV1ExchangeInfo(params));
    coins = self.safeList(response, "coins");
    return self.parseCurrencies(coins)

end
function parseCurrency(self::Hashkey, rawCurrency)
    currencyId = safeString(rawCurrency, "coinId");
    code = self.safeCurrencyCode(currencyId);
    networks = self.safeList(rawCurrency, "chainTypes");
    parsedNetworks = Dict{Symbol, Any}();
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(networks)))
        network = get(networks, j + 1, nothing);
        networkId = safeString(network, "chainType");
        networkCode = self.networkCodeToId(networkId, currencyCode = code);
        if functions.ccxtruthy(networkCode != nothing)
            parsedNetworks[Symbol(networkCode)] = Dict{Symbol, Any}(
                Symbol("id") => networkId,
                Symbol("network") => networkCode,
                Symbol("limits") => Dict{Symbol, Any}(
                    Symbol("withdraw") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(network, "minWithdrawQuantity"),
                        Symbol("max") => self.parseNumber(omitZero(safeString(network, "maxWithdrawQuantity")))
                    ),
                    Symbol("deposit") => Dict{Symbol, Any}(
                        Symbol("min") => self.safeNumber(network, "minDepositQuantity"),
                        Symbol("max") => nothing
                    )
                ),
                Symbol("active") => nothing,
                Symbol("deposit") => self.safeBool(network, "allowDeposit"),
                Symbol("withdraw") => self.safeBool(network, "allowWithdraw"),
                Symbol("fee") => self.safeNumber(network, "withdrawFee"),
                Symbol("precision") => nothing,
                Symbol("info") => network
            );
        end
        j += 1
    end
    rawType = safeString(rawCurrency, "tokenType");
    type_var = functions.ccxtruthy((rawType == "REAL_MONEY")) ? "fiat" : "crypto";
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("precision") => nothing,
    Symbol("type") => type_var,
    Symbol("name") => safeString(rawCurrency, "coinFullName"),
    Symbol("active") => nothing,
    Symbol("deposit") => self.safeBool(rawCurrency, "allowDeposit"),
    Symbol("withdraw") => self.safeBool(rawCurrency, "allowWithdraw"),
    Symbol("fee") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("networks") => parsedNetworks,
    Symbol("info") => rawCurrency
))

end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://hashkeyglobal-apidoc.readme.io/reference/get-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return (maximum value is 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
function fetchOrderBook(self::Hashkey, symbol; limit=nothing, params=Dict())
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
    response = Base.fetch(self.publicGetQuoteV1Depth(extend(request, params)));
    timestamp = safeInteger(response, "t");
    return self.parseOrderBook(response, symbol, timestamp = timestamp, bidsKey = "b", asksKey = "a")

end
"""
get the list of most recent trades for a particular symbol
see: https://hashkeyglobal-apidoc.readme.io/reference/get-recent-trade-list

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch (maximum value is 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
function fetchTrades(self::Hashkey, symbol; since=nothing, limit=nothing, params=Dict())
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
    response = Base.fetch(self.publicGetQuoteV1Trades(extend(request, params)));
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
"""
fetch all trades made by the user
see: https://hashkeyglobal-apidoc.readme.io/reference/get-account-trade-list
see: https://hashkeyglobal-apidoc.readme.io/reference/query-futures-trades
see: https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-user

# Arguments
- `symbol`::string: *is mandatory for swap markets* unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum amount of trades to fetch (default 200, max 500)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch trades for (default 'spot')
- `params.until`::int, optional: the latest time in ms to fetch trades for, only supports the last 30 days timeframe
- `params.fromId`::string, optional: srarting trade id
- `params.toId`::string, optional: ending trade id
- `params.clientOrderId`::string, optional: *spot markets only* filter trades by orderId
- `params.accountId`::string, optional: account id to fetch the orders from

# Returns
- a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
"""
function fetchMyTrades(self::Hashkey; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    methodName = "fetchMyTrades";
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = "spot";
    (marketType, params) = self.handleMarketTypeAndParams(methodName, market = market, params = params);
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, methodName, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    accountId = nothing;
    (accountId, params) = self.handleOptionAndParams(params, methodName, "accountId");
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(market != nothing)
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
        if functions.ccxtruthy(accountId != nothing)
            request[Symbol("accountId")] = accountId;
        end
        response = Base.fetch(self.privateGetApiV1AccountTrades(extend(request, params)));
    elseif functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a symbol argument for swap markets")));
        end
        request[Symbol("symbol")] = safeString(market, "id");
        if functions.ccxtruthy(accountId != nothing)
            request[Symbol("subAccountId")] = accountId;
            response = Base.fetch(self.privateGetApiV1FuturesSubAccountUserTrades(extend(request, params)));
        else
            response = Base.fetch(self.privateGetApiV1FuturesUserTrades(extend(request, params)));
        end
    else
        throw(NotSupported(string(self.id, " ", methodName, "() is not supported for ", marketType, " type of markets")));
    end
    return self.parseTrades(response, market = market, since = since, limit = limit)

end
function parseTrade(self::Hashkey, trade; market=nothing)
    timestamp = safeInteger2(trade, "t", "time");
    marketId = safeString(trade, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    side = safeStringLower(trade, "side");
    if functions.ccxtruthy(side != nothing)
        side = safeString(split(side, "_"), 0);
    end
    isBuyer = self.safeBool(trade, "isBuyer");
    if functions.ccxtruthy(isBuyer != nothing)
        side = functions.ccxtruthy(isBuyer) ? "buy" : "sell";
    end
    takerOrMaker = nothing;
    isMaker = self.safeBool2(trade, "isMaker", "isMarker");
    if functions.ccxtruthy(isMaker != nothing)
        takerOrMaker = functions.ccxtruthy(isMaker) ? "maker" : "taker";
    end
    isBuyerMaker = self.safeBool(trade, "ibm");
    if functions.ccxtruthy(isBuyerMaker != nothing)
        takerOrMaker = "taker";
        side = functions.ccxtruthy(isBuyerMaker) ? "sell" : "buy";
    end
    feeCost = safeString(trade, "commission");
    feeCurrncyId = safeString(trade, "commissionAsset");
    feeInfo = self.safeDict(trade, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeInfo != nothing)
        feeCost = safeString(feeInfo, "fee");
        feeCurrncyId = safeString(feeInfo, "feeCoinId");
    end
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => self.parseNumber(feeCost),
            Symbol("currency") => self.safeCurrencyCode(feeCurrncyId)
        );
    end
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("id") => safeString2(trade, "id", "tradeId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("side") => side,
    Symbol("price") => safeString2(trade, "p", "price"),
    Symbol("amount") => safeStringN(trade, ["q", "qty", "quantity"]),
    Symbol("cost") => nothing,
    Symbol("takerOrMaker") => takerOrMaker,
    Symbol("type") => nothing,
    Symbol("order") => safeString(trade, "orderId"),
    Symbol("fee") => fee,
    Symbol("info") => trade
), market = market)

end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://hashkeyglobal-apidoc.readme.io/reference/get-kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
function fetchOHLCV(self::Hashkey, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    methodName = "fetchOHLCV";
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, methodName, "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallDeterministic("fetchOHLCV", symbol = symbol, since = since, limit = limit, timeframe = timeframe, params = params, maxEntriesPerRequest = 1000))
    end
    market = self.market(symbol);
    timeframe = safeString(self.timeframes, timeframe, timeframe);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("interval") => timeframe
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("startTime")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, methodName, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.publicGetQuoteV1Klines(extend(request, params)));
    ohlcvs = toArray(response);
    return self.parseOHLCVs(ohlcvs, market = market, timeframe = timeframe, since = since, limit = limit)

end
function parseOHLCV(self::Hashkey, ohlcv; market=nothing)
    return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]

end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://hashkeyglobal-apidoc.readme.io/reference/get-24hr-ticker-price-change

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTicker(self::Hashkey, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicGetQuoteV1Ticker24hr(extend(request, params)));
    ticker = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseTicker(ticker, market = market)

end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://hashkeyglobal-apidoc.readme.io/reference/get-24hr-ticker-price-change

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchTickers(self::Hashkey; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    response = Base.fetch(self.publicGetQuoteV1Ticker24hr(params));
    return self.parseTickers(response, symbols = symbols)

end
function parseTicker(self::Hashkey, ticker; market=nothing)
    timestamp = safeInteger(ticker, "t");
    marketId = safeString(ticker, "s");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    last_var = safeString(ticker, "c");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(ticker, "h"),
    Symbol("low") => safeString(ticker, "l"),
    Symbol("bid") => safeString(ticker, "b"),
    Symbol("bidVolume") => nothing,
    Symbol("ask") => safeString(ticker, "a"),
    Symbol("askVolume") => nothing,
    Symbol("vwap") => nothing,
    Symbol("open") => safeString(ticker, "o"),
    Symbol("close") => last_var,
    Symbol("last") => last_var,
    Symbol("previousClose") => nothing,
    Symbol("change") => nothing,
    Symbol("percentage") => nothing,
    Symbol("average") => nothing,
    Symbol("baseVolume") => safeString(ticker, "v"),
    Symbol("quoteVolume") => safeString(ticker, "qv"),
    Symbol("info") => ticker
), market = market)

end
"""
fetches the last price for multiple markets
see: https://hashkeyglobal-apidoc.readme.io/reference/get-symbol-price-ticker

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the last prices
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.symbol`::string, optional: the id of the market to fetch last price for

# Returns
- a dictionary of lastprices structures
"""
function fetchLastPrices(self::Hashkey; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}();
    response = Base.fetch(self.publicGetQuoteV1TickerPrice(extend(request, params)));
    return self.parseLastPrices(response, symbols = symbols)

end
function parseLastPrice(self::Hashkey, entry; market=nothing)
    marketId = safeString(entry, "s");
    market = self.safeMarket(marketId = marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("price") => self.safeNumber(entry, "p"),
    Symbol("side") => nothing,
    Symbol("info") => entry
)

end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://hashkeyglobal-apidoc.readme.io/reference/get-account-information

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: account ID, for Master Key only
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch balance for (default 'spot')

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
function fetchBalance(self::Hashkey; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    methodName = "fetchBalance";
    marketType = "spot";
    (marketType, params) = self.handleMarketTypeAndParams(methodName, market = nothing, params = params, defaultValue = marketType);
    if functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.privateGetApiV1FuturesBalance(params));
        balance = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
            return self.parseSwapBalance(balance)
    elseif functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateGetApiV1Account(extend(request, params)));
        return self.parseBalance(response)
    else
        throw(NotSupported(string(self.id, " ", methodName, "() is not supported for ", marketType, " type of markets")));
    end

end
function parseBalance(self::Hashkey, balance)
    result = Dict{Symbol, Any}(
        Symbol("info") => balance
    );
    balances = self.safeList(balance, "balances", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(balances)))
        balanceEntry = get(balances, i + 1, nothing);
        currencyId = safeString(balanceEntry, "asset");
        code = self.safeCurrencyCode(currencyId);
        account = self.account();
        account[Symbol("total")] = safeString(balanceEntry, "total");
        account[Symbol("free")] = safeString(balanceEntry, "free");
        account[Symbol("used")] = safeString(balanceEntry, "locked");
        if functions.ccxtruthy(code != nothing)
            result[Symbol(code)] = account;
        end
        i += 1
    end
    return self.safeBalance(result)

end
function parseSwapBalance(self::Hashkey, balance)
    currencyId = safeString(balance, "asset");
    code = self.safeCurrencyCode(currencyId);
    account = self.account();
    account[Symbol("total")] = safeString(balance, "balance");
    positionMargin = safeString(balance, "positionMargin");
    orderMargin = safeString(balance, "orderMargin");
    account[Symbol("used")] = stringAdd(positionMargin, orderMargin);
    result = Dict{Symbol, Any}(
        Symbol("info") => balance
    );
    if functions.ccxtruthy(code != nothing)
        result[Symbol(code)] = account;
    end
    return self.safeBalance(result)

end
"""
fetch the deposit address for a currency associated with this account
see: https://hashkeyglobal-apidoc.readme.io/reference/get-deposit-address

# Arguments
- `code`::string: unified currency code (default is 'USDT')
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: network for fetch deposit address (default is 'ETH')

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
function fetchDepositAddress(self::Hashkey, code; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing)
    );
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode == nothing)
        networkCode = self.defaultNetworkCode(code);
    end
    request[Symbol("chainType")] = self.networkCodeToId(networkCode, currencyCode = code);
    response = Base.fetch(self.privateGetApiV1AccountDepositAddress(extend(request, params)));
    depositAddress = self.parseDepositAddress(response, currency = currency);
    depositAddress[Symbol("network")] = networkCode;
    return depositAddress

end
function parseDepositAddress(self::Hashkey, depositAddress; currency=nothing)
    address = safeString(depositAddress, "address");
    self.checkAddress(address = address);
    tag = safeString(depositAddress, "addressExt");
    if functions.ccxtruthy(tag == "")
        tag = nothing;
    end
    return Dict{Symbol, Any}(
    Symbol("info") => depositAddress,
    Symbol("currency") => safeString(currency, "code"),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("tag") => tag
)

end
"""
fetch all deposits made to an account
see: https://hashkeyglobal-apidoc.readme.io/reference/get-deposit-history

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for (default 24 hours ago)
- `limit`::int, optional: the maximum number of transfer structures to retrieve (default 50, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch transfers for (default time now)
- `params.fromId`::int, optional: starting ID (To be released)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function fetchDeposits(self::Hashkey; code=nothing, since=nothing, limit=nothing, params=Dict())
    methodName = "fetchDeposits";
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
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
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, methodName, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.privateGetApiV1AccountDepositOrders(extend(request, params)));
    return self.parseTransactions(response, currency = currency, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("type") => "deposit"
))

end
"""
fetch all withdrawals made from an account
see: https://hashkeyglobal-apidoc.readme.io/reference/withdrawal-records

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for (default 24 hours ago)
- `limit`::int, optional: the maximum number of transfer structures to retrieve (default 50, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch transfers for (default time now)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function fetchWithdrawals(self::Hashkey; code=nothing, since=nothing, limit=nothing, params=Dict())
    methodName = "fetchWithdrawals";
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
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
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, methodName, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    response = Base.fetch(self.privateGetApiV1AccountWithdrawOrders(extend(request, params)));
    return self.parseTransactions(response, currency = currency, since = since, limit = limit, params = Dict{Symbol, Any}(
    Symbol("type") => "withdrawal"
))

end
"""
make a withdrawal
see: https://hashkeyglobal-apidoc.readme.io/reference/withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: network for withdraw
- `params.clientOrderId`::string, optional: client order id
- `params.platform`::string, optional: the platform to withdraw to (hashkey, HashKey HK)

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
function withdraw(self::Hashkey, code, amount, address; tag=nothing, params=Dict())
    (tag, params) = self.handleWithdrawTagAndParams(tag, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("address") => address,
        Symbol("quantity") => amount
    );
    if functions.ccxtruthy(tag != nothing)
        request[Symbol("addressExt")] = tag;
    end
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol("chainType")] = self.networkCodeToId(networkCode, currencyCode = get(currency, Symbol("code"), nothing));
    end
    response = Base.fetch(self.privatePostApiV1AccountWithdraw(extend(request, params)));
    return self.parseTransaction(response, currency = currency)

end
function parseTransaction(self::Hashkey, transaction; currency=nothing)
    id = safeString2(transaction, "id", "orderId");
    address = safeString(transaction, "address");
    status = safeString(transaction, "status");
    if functions.ccxtruthy(status == nothing)
        success = self.safeBool(transaction, "success", defaultValue = false);
        if functions.ccxtruthy(success)
            status = "ok";
        else
            addressUrl = safeString(transaction, "addressUrl");
            if functions.ccxtruthy(addressUrl != nothing)
                status = "ok";
            end
        end
    end
    txid = safeString(transaction, "txId");
    coin = safeString(transaction, "coin");
    code = self.safeCurrencyCode(coin, currency = currency);
    timestamp = safeInteger(transaction, "time");
    amount = self.safeNumber(transaction, "quantity");
    feeCost = self.safeNumber(transaction, "fee");
    fee = nothing;
    if functions.ccxtruthy(feeCost != nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => feeCost,
            Symbol("currency") => code
        );
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => id,
    Symbol("txid") => txid,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("network") => nothing,
    Symbol("address") => address,
    Symbol("addressTo") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("type") => nothing,
    Symbol("amount") => amount,
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(status),
    Symbol("updated") => nothing,
    Symbol("internal") => nothing,
    Symbol("comment") => nothing,
    Symbol("fee") => fee
)

end
function parseTransactionStatus(self::Hashkey, status)
    statuses = Dict{Symbol, Any}(
        Symbol("1") => "pending",
        Symbol("2") => "pending",
        Symbol("3") => "failed",
        Symbol("4") => "ok",
        Symbol("5") => "pending",
        Symbol("6") => "ok",
        Symbol("7") => "failed",
        Symbol("8") => "cancelled",
        Symbol("9") => "failed",
        Symbol("10") => "failed",
        Symbol("successful") => "ok",
        Symbol("success") => "ok"
    );
    return safeString(statuses, status, status)

end
"""
transfer currency internally between wallets on the same account
see: https://hashkeyglobal-apidoc.readme.io/reference/new-account-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account id to transfer from
- `toAccount`::string: account id to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the transfer
- `params.remark`::string, optional: a note for the transfer

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Hashkey, code, amount, fromAccount, toAccount; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}(
        Symbol("coin") => get(currency, Symbol("id"), nothing),
        Symbol("quantity") => self.currencyToPrecision(code, amount),
        Symbol("fromAccountId") => fromAccount,
        Symbol("toAccountId") => toAccount
    );
    response = Base.fetch(self.privatePostApiV1AccountAssetTransfer(extend(request, params)));
    return self.parseTransfer(response, currency = currency)

end
function parseTransfer(self::Hashkey, transfer; currency=nothing)
    timestamp = safeInteger(transfer, "timestamp");
    currencyId = safeString(currency, "id");
    status = nothing;
    success = self.safeBool(transfer, "success", defaultValue = false);
    if functions.ccxtruthy(success)
        status = "ok";
    end
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(transfer, "orderId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("currency") => self.safeCurrencyCode(currencyId, currency = currency),
    Symbol("amount") => nothing,
    Symbol("fromAccount") => nothing,
    Symbol("toAccount") => nothing,
    Symbol("status") => status,
    Symbol("info") => transfer
)

end
"""
fetch all the accounts associated with a profile
see: https://hashkeyglobal-apidoc.readme.io/reference/query-sub-account

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
function fetchAccounts(self::Hashkey; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetApiV1AccountType(params));
    return self.parseAccounts(response, params = params)

end
function parseAccount(self::Hashkey, account)
    accountLabel = safeString(account, "accountLabel");
    label = "";
    if functions.ccxtruthy(@functions.ccxt_or(accountLabel == "Main Trading Account", accountLabel == "Main Future Account"))
        label = "main";
    elseif functions.ccxtruthy(@functions.ccxt_or(accountLabel == "Sub Main Trading Account", accountLabel == "Sub Main Future Account"))
        label = "sub";
    end
    accountType = self.parseAccountType(safeString(account, "accountType"));
    type_var = string(label, " ", accountType);
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(account, "accountId"),
    Symbol("type") => type_var,
    Symbol("code") => nothing,
    Symbol("info") => account
)

end
function parseAccountType(self::Hashkey, type_var)
    types = Dict{Symbol, Any}(
        Symbol("1") => "spot account",
        Symbol("3") => "swap account",
        Symbol("5") => "custody account",
        Symbol("6") => "fiat account"
    );
    return safeString(types, type_var, type_var)

end
function encodeAccountType(self::Hashkey, type_var)
    types = Dict{Symbol, Any}(
        Symbol("spot") => "1",
        Symbol("swap") => "3",
        Symbol("custody") => "5"
    );
    return safeInteger(types, type_var, type_var)

end
function encodeFlowType(self::Hashkey, type_var)
    types = Dict{Symbol, Any}(
        Symbol("trade") => "1",
        Symbol("fee") => "3",
        Symbol("transfer") => "51",
        Symbol("deposit") => "900",
        Symbol("withdraw") => "904"
    );
    return safeInteger(types, type_var, type_var)

end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://hashkeyglobal-apidoc.readme.io/reference/get-account-transaction-list

# Arguments
- `code`::string, optional: unified currency code, default is undefined (not used)
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.flowType`::int, optional: trade, fee, transfer, deposit, withdrawal
- `params.accountType`::int, optional: spot, swap, custody

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
function fetchLedger(self::Hashkey; code=nothing, since=nothing, limit=nothing, params=Dict())
    methodName = "fetchLedger";
    if functions.ccxtruthy(since == nothing)
        throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a since argument")));
    end
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, methodName, "until");
    if functions.ccxtruthy(until == nothing)
        throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires an until argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    request = Dict{Symbol, Any}();
    request[Symbol("startTime")] = since;
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    request[Symbol("endTime")] = until;
    flowType = nothing;
    (flowType, params) = self.handleOptionAndParams(params, methodName, "flowType");
    if functions.ccxtruthy(flowType != nothing)
        request[Symbol("flowType")] = self.encodeFlowType(flowType);
    end
    accountType = nothing;
    (accountType, params) = self.handleOptionAndParams(params, methodName, "accountType");
    if functions.ccxtruthy(accountType != nothing)
        request[Symbol("accountType")] = self.encodeAccountType(accountType);
    end
    response = Base.fetch(self.privateGetApiV1AccountBalanceFlow(extend(request, params)));
    return self.parseLedger(response, currency = currency, since = since, limit = limit)

end
function parseLedgerEntryType(self::Hashkey, type_var)
    types = Dict{Symbol, Any}(
        Symbol("1") => "trade",
        Symbol("2") => "fee",
        Symbol("51") => "transfer",
        Symbol("900") => "deposit",
        Symbol("904") => "withdraw"
    );
    return safeString(types, type_var, type_var)

end
function parseLedgerEntry(self::Hashkey, item; currency=nothing)
    id = safeString(item, "id");
    account = safeString(item, "accountId");
    timestamp = safeInteger(item, "created");
    type_var = self.parseLedgerEntryType(safeString(item, "flowTypeValue"));
    currencyId = safeString(item, "coin");
    code = self.safeCurrencyCode(currencyId, currency = currency);
    currency = self.safeCurrency(currencyId, currency = currency);
    amountString = safeString(item, "change");
    amount = self.parseNumber(amountString);
    direction = "in";
    if functions.ccxtruthy(findfirst("-", amountString) !== nothing)
        direction = "out";
    end
    afterString = safeString(item, "total");
    after = self.parseNumber(afterString);
    status = "ok";
    return self.safeLedgerEntry(Dict{Symbol, Any}(
    Symbol("info") => item,
    Symbol("id") => id,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("account") => account,
    Symbol("direction") => direction,
    Symbol("referenceId") => nothing,
    Symbol("referenceAccount") => nothing,
    Symbol("type") => type_var,
    Symbol("currency") => code,
    Symbol("symbol") => nothing,
    Symbol("amount") => amount,
    Symbol("before") => nothing,
    Symbol("after") => after,
    Symbol("status") => status,
    Symbol("fee") => nothing
), currency = currency)

end
"""
create a trade order
see: https://hashkeyglobal-apidoc.readme.io/reference/test-new-order
see: https://hashkeyglobal-apidoc.readme.io/reference/create-order
see: https://hashkeyglobal-apidoc.readme.io/reference/create-new-futures-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'LIMIT_MAKER' for spot, 'market' or 'limit' or 'STOP' for swap
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of you want to trade in units of the base currency
- `price`::float, optional: the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cost`::float, optional: *spot market buy only* the quote quantity that can be used as an alternative for the amount
- `params.test`::bool, optional: *spot markets only* whether to use the test endpoint or not, default is false
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately
- `params.timeInForce`::string, optional: "GTC" or "IOC" or "PO" for spot, 'GTC' or 'FOK' or 'IOC' or 'LIMIT_MAKER' or 'PO' for swap
- `params.clientOrderId`::string, optional: a unique id for the order - is mandatory for swap
- `params.triggerPrice`::float, optional: *swap markets only* The price at which a trigger order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrder(self::Hashkey, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            return Base.fetch(self.createSpotOrder(symbol, type_var, side, amount, price = price, params = params))
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        return Base.fetch(self.createSwapOrder(symbol, type_var, side, amount, price = price, params = params))
    else
        throw(NotSupported(string(self.id, " createOrder() is not supported for ", get(market, Symbol("type"), nothing), " type of markets")));
    end

end
"""
create a market buy order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createMarketBuyOrderWithCost(self::Hashkey, symbol, cost; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() is supported for spot markets only")));
    end
    req = Dict{Symbol, Any}(
        Symbol("cost") => cost
    );
    return Base.fetch(self.createOrder(symbol, "market", "buy", cost, price = nothing, params = extend(req, params)))

end
"""
create a trade order on spot market
see: https://hashkeyglobal-apidoc.readme.io/reference/test-new-order
see: https://hashkeyglobal-apidoc.readme.io/reference/create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'LIMIT_MAKER'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of you want to trade in units of the base currency
- `price`::float, optional: the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cost`::float, optional: *market buy only* the quote quantity that can be used as an alternative for the amount
- `params.test`::bool, optional: whether to use the test endpoint or not, default is false
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately
- `params.timeInForce`::string, optional: 'GTC', 'IOC', or 'PO'
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createSpotOrder(self::Hashkey, symbol, type_var, side, amount; price=nothing, params=Dict())
    triggerPrice = safeString2(params, "stopPrice", "triggerPrice");
    if functions.ccxtruthy(triggerPrice != nothing)
        throw(NotSupported(string(self.id, " trigger orders are not supported for spot markets")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isMarketBuy = @functions.ccxt_and((type_var == "market"), (side == "buy"));
    cost = safeString(params, "cost");
    if functions.ccxtruthy(@functions.ccxt_and((!functions.ccxtruthy(isMarketBuy)), (cost != nothing)))
        throw(NotSupported(string(self.id, " createOrder() supports cost parameter for spot market buy orders only")));
    end
    request = self.createSpotOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    response = Dict{Symbol, Any}();
    test = self.safeBool(params, "test");
    if functions.ccxtruthy(test)
        params = omit(params, "test");
        response = Base.fetch(self.privatePostApiV1SpotOrderTest(request));
    elseif functions.ccxtruthy(@functions.ccxt_and(isMarketBuy, (cost == nothing)))
        response = Base.fetch(self.privatePostApiV11SpotOrder(request));
    else
        response = Base.fetch(self.privatePostApiV1SpotOrder(request));
    end
    return self.parseOrder(response, market = market)

end
function createOrderRequest(self::Hashkey, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
            return self.createSpotOrderRequest(symbol, type_var, side, amount, price = price, params = params)
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        return self.createSwapOrderRequest(symbol, type_var, side, amount, price = price, params = params)
    else
        throw(NotSupported(string(self.id, " ", "createOrderRequest() is not supported for ", get(market, Symbol("type"), nothing), " type of markets")));
    end

end
function createSpotOrderRequest(self::Hashkey, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(type_var == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a type argument")));
    end
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " requires a side argument")));
    end
    market = self.market(symbol);
    type_var = uppercase(type_var);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => uppercase(side),
        Symbol("type") => type_var
    );
    if functions.ccxtruthy(amount != nothing)
        request[Symbol("quantity")] = self.amountToPrecision(symbol, amount);
    end
    cost = nothing;
    (cost, params) = self.handleParamString(params, "cost");
    if functions.ccxtruthy(cost != nothing)
        request[Symbol("quantity")] = self.costToPrecision(symbol, cost);
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
    end
    isMarketOrder = type_var == "MARKET";
    postOnly = false;
    (postOnly, params) = self.handlePostOnly(isMarketOrder, type_var == "LIMIT_MAKER", params = params);
    if functions.ccxtruthy(@functions.ccxt_and(postOnly, (type_var == "LIMIT")))
        request[Symbol("type")] = "LIMIT_MAKER";
    end
    clientOrderId = nothing;
    (clientOrderId, params) = self.handleParamString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        params[Symbol("newClientOrderId")] = clientOrderId;
    end
    return extend(request, params)

end
function createSwapOrderRequest(self::Hashkey, symbol, type_var, side, amount; price=nothing, params=Dict())
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("type") => "LIMIT",
        Symbol("quantity") => self.amountToPrecision(symbol, amount)
    );
    isMarketOrder = type_var == "market";
    if functions.ccxtruthy(isMarketOrder)
        request[Symbol("priceType")] = "MARKET";
    end
    if functions.ccxtruthy(price != nothing)
        request[Symbol("price")] = self.priceToPrecision(symbol, price);
        request[Symbol("priceType")] = "INPUT";
    end
    reduceOnly = false;
    (reduceOnly, params) = self.handleParamBool(params, "reduceOnly", defaultValue = reduceOnly);
    suffix = "_OPEN";
    if functions.ccxtruthy(reduceOnly)
        suffix = "_CLOSE";
    end
    request[Symbol("side")] = string(uppercase(side), suffix);
    timeInForce = nothing;
    (timeInForce, params) = self.handleParamString(params, "timeInForce");
    postOnly = false;
    (postOnly, params) = self.handlePostOnly(isMarketOrder, timeInForce == "LIMIT_MAKER", params = params);
    if functions.ccxtruthy(postOnly)
        timeInForce = "LIMIT_MAKER";
    end
    if functions.ccxtruthy(timeInForce != nothing)
        request[Symbol("timeInForce")] = timeInForce;
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        request[Symbol("clientOrderId")] = uuid();
    end
    triggerPrice = safeString(params, "triggerPrice");
    if functions.ccxtruthy(triggerPrice != nothing)
        request[Symbol("stopPrice")] = self.priceToPrecision(symbol, triggerPrice);
        request[Symbol("type")] = "STOP";
        params = omit(params, "triggerPrice");
    end
    return extend(request, params)

end
"""
create a trade order on swap market
see: https://hashkeyglobal-apidoc.readme.io/reference/create-new-futures-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'STOP'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of you want to trade in units of the base currency
- `price`::float, optional: the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce only
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.timeInForce`::string, optional: 'GTC', 'FOK', 'IOC', 'LIMIT_MAKER' or 'PO'
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createSwapOrder(self::Hashkey, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = self.createSwapOrderRequest(symbol, type_var, side, amount, price = price, params = params);
    response = Base.fetch(self.privatePostApiV1FuturesOrder(extend(request, params)));
    return self.parseOrder(response, market = market)

end
"""
create a list of trade orders (all orders should be of the same symbol)
see: https://hashkeyglobal-apidoc.readme.io/reference/create-multiple-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/batch-create-new-futures-order

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the api endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function createOrders(self::Hashkey, orders; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    ordersRequests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        rawOrder = get(orders, i + 1, nothing);
        symbol = safeString(rawOrder, "symbol");
        type_var = safeString(rawOrder, "type");
        side = safeString(rawOrder, "side");
        amount = self.safeNumber(rawOrder, "amount");
        price = self.safeNumber(rawOrder, "price");
        orderParams = self.safeDict(rawOrder, "params", defaultValue = Dict{Symbol, Any}());
        orderRequest = self.createOrderRequest(symbol, type_var, side, amount, price = price, params = orderParams);
        clientOrderId = safeString(orderRequest, "clientOrderId");
        if functions.ccxtruthy(clientOrderId == nothing)
            orderRequest[Symbol("clientOrderId")] = uuid();
        end
        push!(ordersRequests, orderRequest);
        i += 1
    end
    firstOrder = get(ordersRequests, 1, nothing);
    firstSymbol = safeString(firstOrder, "symbol");
    market = self.market(firstSymbol);
    request = Dict{Symbol, Any}(
        Symbol("orders") => ordersRequests
    );
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.privatePostApiV1SpotBatchOrders(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privatePostApiV1FuturesBatchOrders(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " ", "createOrderRequest() is not supported for ", get(market, Symbol("type"), nothing), " type of markets")));
    end
    result = self.safeList(response, "result", defaultValue = []);
    responseOrders = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
        responseEntry = self.safeDict(result, i, defaultValue = Dict{Symbol, Any}());
        responseOrder = self.safeDict(responseEntry, "order", defaultValue = Dict{Symbol, Any}());
        push!(responseOrders, responseOrder);
        i += 1
    end
    return self.parseOrders(responseOrders)

end
"""
cancels an open order
see: https://hashkeyglobal-apidoc.readme.io/reference/cancel-order
see: https://hashkeyglobal-apidoc.readme.io/reference/cancel-futures-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
- `params.clientOrderId`::string, optional: a unique id for the order that can be used as an alternative for the id
- `params.trigger`::bool, optional: *swap markets only* true for canceling a trigger order (default false)
- `params.stop`::bool, optional: *swap markets only* an alternative for trigger param

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrder(self::Hashkey, id; symbol=nothing, params=Dict())
    methodName = "cancelOrder";
    self.checkTypeParam(methodName, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        request[Symbol("orderId")] = id;
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = "spot";
    (marketType, params) = self.handleMarketTypeAndParams(methodName, market = market, params = params, defaultValue = marketType);
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateDeleteApiV1SpotOrder(extend(request, params)));
    elseif functions.ccxtruthy(marketType == "swap")
        isTrigger = false;
        (isTrigger, params) = self.handleTriggerOptionAndParams(params, methodName, defaultValue = isTrigger);
        if functions.ccxtruthy(isTrigger)
            request[Symbol("type")] = "STOP";
        else
            request[Symbol("type")] = "LIMIT";
        end
        if functions.ccxtruthy(market != nothing)
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
        response = Base.fetch(self.privateDeleteApiV1FuturesOrder(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " ", methodName, "() is not supported for ", marketType, " type of markets")));
    end
    return self.parseOrder(response)

end
"""
cancel all open orders
see: https://hashkeyglobal-apidoc.readme.io/reference/cancel-all-open-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/batch-cancel-futures-order

# Arguments
- `symbol`::string: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string, optional: 'buy' or 'sell'

# Returns
- response from exchange
"""
function cancelAllOrders(self::Hashkey; symbol=nothing, params=Dict())
    methodName = "cancelAllOrders";
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    side = safeString(params, "side");
    if functions.ccxtruthy(side != nothing)
        request[Symbol("side")] = side;
    end
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.privateDeleteApiV1SpotOpenOrders(extend(request, params)));
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateDeleteApiV1FuturesBatchOrders(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " ", methodName, "() is not supported for ", get(market, Symbol("type"), nothing), " type of markets")));
    end
    order = self.safeOrder(response);
    order[Symbol("info")] = response;
    return [order]

end
"""
cancel multiple orders
see: https://hashkeyglobal-apidoc.readme.io/reference/cancel-multiple-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/batch-cancel-futures-order-by-order-id

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol (not used by hashkey)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrders(self::Hashkey, ids; symbol=nothing, params=Dict())
    methodName = "cancelOrders";
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    orderIds = join(ids, ",");
    request[Symbol("ids")] = orderIds;
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = "spot";
    (marketType, params) = self.handleMarketTypeAndParams(methodName, market = market, params = params, defaultValue = marketType);
    if functions.ccxtruthy(marketType == "spot")
        response = Base.fetch(self.privateDeleteApiV1SpotCancelOrderByIds(request));
    elseif functions.ccxtruthy(marketType == "swap")
        response = Base.fetch(self.privateDeleteApiV1FuturesCancelOrderByIds(request));
    else
        throw(NotSupported(string(self.id, " ", methodName, "() is not supported for ", marketType, " type of markets")));
    end
    order = self.safeOrder(response);
    order[Symbol("info")] = response;
    return [order]

end
"""
fetches information on an order made by the user
see: https://hashkeyglobal-apidoc.readme.io/reference/query-order
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-order

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
- `params.clientOrderId`::string, optional: a unique id for the order that can be used as an alternative for the id
- `params.accountId`::string, optional: *spot markets only* account id to fetch the order from
- `params.trigger`::bool, optional: *swap markets only* true for fetching a trigger order (default false)
- `params.stop`::bool, optional: *swap markets only* an alternative for trigger param

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrder(self::Hashkey, id; symbol=nothing, params=Dict())
    methodName = "fetchOrder";
    self.checkTypeParam(methodName, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    clientOrderId = nothing;
    (clientOrderId, params) = self.handleParamString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId == nothing)
        request[Symbol("orderId")] = id;
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = "spot";
    (marketType, params) = self.handleMarketTypeAndParams(methodName, market = market, params = params, defaultValue = marketType);
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(clientOrderId != nothing)
            request[Symbol("origClientOrderId")] = clientOrderId;
        end
        response = Base.fetch(self.privateGetApiV1SpotOrder(extend(request, params)));
    elseif functions.ccxtruthy(marketType == "swap")
        isTrigger = false;
        (isTrigger, params) = self.handleTriggerOptionAndParams(params, methodName, defaultValue = isTrigger);
        if functions.ccxtruthy(isTrigger)
            request[Symbol("type")] = "STOP";
        end
        response = Base.fetch(self.privateGetApiV1FuturesOrder(extend(request, params)));
    else
        throw(NotSupported(string(self.id, " ", methodName, "() is not supported for ", marketType, " type of markets")));
    end
    return self.parseOrder(response)

end
"""
fetch all unfilled currently open orders
see: https://hashkeyglobal-apidoc.readme.io/reference/get-current-open-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-open-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/sub
see: https://hashkeyglobal-apidoc.readme.io/reference/query-open-futures-orders

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in - is mandatory for swap markets
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve - default 500, maximum 1000
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot')
- `params.orderId`::string, optional: *spot markets only* the id of the order to fetch
- `params.side`::string, optional: *spot markets only* 'buy' or 'sell' - the side of the orders to fetch
- `params.fromOrderId`::string, optional: *swap markets only* the id of the order to start from
- `params.trigger`::bool, optional: *swap markets only* true for fetching trigger orders (default false)
- `params.stop`::bool, optional: *swap markets only* an alternative for trigger param
- `params.accountId`::string, optional: account id to fetch the orders from

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenOrders(self::Hashkey; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    methodName = "fetchOpenOrders";
    self.checkTypeParam(methodName, params);
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = "spot";
    (marketType, params) = self.handleMarketTypeAndParams(methodName, market = market, params = params, defaultValue = marketType);
    params = extend(Dict{Symbol, Any}(
    Symbol("methodName") => methodName
), params);
    if functions.ccxtruthy(marketType == "spot")
            return Base.fetch(self.fetchOpenSpotOrders(symbol = symbol, since = since, limit = limit, params = params))
    elseif functions.ccxtruthy(marketType == "swap")
        return Base.fetch(self.fetchOpenSwapOrders(symbol = symbol, since = since, limit = limit, params = params))
    else
        throw(NotSupported(string(self.id, " ", methodName, "() is not supported for ", marketType, " type of markets")));
    end

end
"""
fetch all unfilled currently open orders for spot markets
see: https://hashkeyglobal-apidoc.readme.io/reference/get-current-open-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/sub

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve - default 500, maximum 1000
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.orderId`::string, optional: the id of the order to fetch
- `params.side`::string, optional: 'buy' or 'sell' - the side of the orders to fetch
- `params.accountId`::string, optional: account id to fetch the orders from

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenSpotOrders(self::Hashkey; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    methodName = "fetchOpenSpotOrders";
    (methodName, params) = self.handleParamString(params, "methodName", defaultValue = methodName);
    market = nothing;
    request = Dict{Symbol, Any}();
    response = nothing;
    accountId = nothing;
    (accountId, params) = self.handleOptionAndParams(params, methodName, "accountId");
    if functions.ccxtruthy(accountId != nothing)
        request[Symbol("subAccountId")] = accountId;
        response = Base.fetch(self.privateGetApiV1SpotSubAccountOpenOrders(extend(request, params)));
    else
        if functions.ccxtruthy(symbol != nothing)
            market = self.market(symbol);
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
        if functions.ccxtruthy(limit != nothing)
            request[Symbol("limit")] = limit;
        end
        response = Base.fetch(self.privateGetApiV1SpotOpenOrders(extend(request, params)));
    end
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetch all unfilled currently open orders for swap markets
see: https://hashkeyglobal-apidoc.readme.io/reference/query-open-futures-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-open-orders

# Arguments
- `symbol`::string: *is mandatory* unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve - maximum 500
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fromOrderId`::string, optional: the id of the order to start from
- `params.trigger`::bool, optional: true for fetching trigger orders (default false)
- `params.stop`::bool, optional: an alternative for trigger param
- `params.accountId`::string, optional: account id to fetch the orders from

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOpenSwapOrders(self::Hashkey; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    methodName = "fetchOpenSwapOrders";
    (methodName, params) = self.handleParamString(params, "methodName", defaultValue = methodName);
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a symbol argument for swap market orders")));
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    isTrigger = false;
    (isTrigger, params) = self.handleTriggerOptionAndParams(params, methodName, defaultValue = isTrigger);
    if functions.ccxtruthy(isTrigger)
        request[Symbol("type")] = "STOP";
    else
        request[Symbol("type")] = "LIMIT";
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("limit")] = limit;
    end
    response = nothing;
    accountId = nothing;
    (accountId, params) = self.handleOptionAndParams(params, methodName, "accountId");
    if functions.ccxtruthy(accountId != nothing)
        request[Symbol("subAccountId")] = accountId;
        response = Base.fetch(self.privateGetApiV1FuturesSubAccountOpenOrders(extend(request, params)));
    else
        response = Base.fetch(self.privateGetApiV1FuturesOpenOrders(extend(request, params)));
    end
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
"""
fetches information on multiple canceled and closed orders made by the user
see: https://hashkeyglobal-apidoc.readme.io/reference/get-all-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/query-futures-history-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-history-orders

# Arguments
- `symbol`::string: *is mandatory for swap markets* unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve - default 500, maximum 1000
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for - only supports the last 90 days timeframe
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot')
- `params.orderId`::string, optional: *spot markets only* the id of the order to fetch
- `params.side`::string, optional: *spot markets only* 'buy' or 'sell' - the side of the orders to fetch
- `params.fromOrderId`::string, optional: *swap markets only* the id of the order to start from
- `params.trigger`::bool, optional: *swap markets only* the id of the order to start from true for fetching trigger orders (default false)
- `params.stop`::bool, optional: *swap markets only* the id of the order to start from an alternative for trigger param
- `params.accountId`::string, optional: account id to fetch the orders from

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchCanceledAndClosedOrders(self::Hashkey; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    methodName = "fetchCanceledAndClosedOrders";
    self.checkTypeParam(methodName, params);
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
    until = nothing;
    (until, params) = self.handleOptionAndParams(params, methodName, "until");
    if functions.ccxtruthy(until != nothing)
        request[Symbol("endTime")] = until;
    end
    accountId = nothing;
    (accountId, params) = self.handleOptionAndParams(params, methodName, "accountId");
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    marketType = "spot";
    (marketType, params) = self.handleMarketTypeAndParams(methodName, market = market, params = params, defaultValue = marketType);
    response = nothing;
    if functions.ccxtruthy(marketType == "spot")
        if functions.ccxtruthy(market != nothing)
            request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
        end
        if functions.ccxtruthy(accountId != nothing)
            request[Symbol("accountId")] = accountId;
        end
        response = Base.fetch(self.privateGetApiV1SpotTradeOrders(extend(request, params)));
    elseif functions.ccxtruthy(marketType == "swap")
        if functions.ccxtruthy(symbol == nothing)
            throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a symbol argument for swap markets")));
        end
        request[Symbol("symbol")] = safeString(market, "id");
        isTrigger = false;
        (isTrigger, params) = self.handleTriggerOptionAndParams(params, methodName, defaultValue = isTrigger);
        if functions.ccxtruthy(isTrigger)
            request[Symbol("type")] = "STOP";
        else
            request[Symbol("type")] = "LIMIT";
        end
        if functions.ccxtruthy(accountId != nothing)
            request[Symbol("subAccountId")] = accountId;
            response = Base.fetch(self.privateGetApiV1FuturesSubAccountHistoryOrders(extend(request, params)));
        else
            response = Base.fetch(self.privateGetApiV1FuturesHistoryOrders(extend(request, params)));
        end
    else
        throw(NotSupported(string(self.id, " ", methodName, "() is not supported for ", marketType, " type of markets")));
    end
    return self.parseOrders(response, market = market, since = since, limit = limit)

end
function checkTypeParam(self::Hashkey, methodName, params)
    paramsType = safeString(params, "type");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((paramsType != nothing), (paramsType != "spot")), (paramsType != "swap")))
        throw(BadRequest(string(self.id, " ", methodName, " () type parameter can not be \"", paramsType, "\". It should define the type of the market (\"spot\" or \"swap\"). To define the type of an order use the trigger parameter (true for trigger orders)")));
    end

end
function handleTriggerOptionAndParams(self::Hashkey, params, methodName; defaultValue=nothing)
    isTrigger = defaultValue;
    (isTrigger, params) = self.handleOptionAndParams2(params, methodName, "stop", "trigger", defaultValue = isTrigger);
    return [isTrigger, params]

end
function parseOrder(self::Hashkey, order; market=nothing)
    marketId = safeString(order, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    timestamp = safeInteger2(order, "transactTime", "time");
    status = safeString(order, "status");
    type_var = safeString(order, "type");
    priceType = safeString(order, "priceType");
    if functions.ccxtruthy(priceType == "MARKET")
        type_var = "market";
    end
    price = omitZero(safeString(order, "price"));
    if functions.ccxtruthy(type_var == "STOP")
        if functions.ccxtruthy(price == nothing)
            type_var = "market";
        else
            type_var = "limit";
        end
    end
    timeInForce = safeString(order, "timeInForce");
    postOnly = nothing;
    (type_var, timeInForce, postOnly) = self.parseOrderTypeTimeInForceAndPostOnly(type_var, timeInForce);
    average = omitZero(safeString(order, "avgPrice"));
    if functions.ccxtruthy(price == nothing)
        price = average;
    end
    side = safeStringLower(order, "side");
    reduceOnly = nothing;
    (side, reduceOnly) = self.parseOrderSideAndReduceOnly(side);
    feeCurrncyId = safeString(order, "feeCoin");
    if functions.ccxtruthy(feeCurrncyId == "")
        feeCurrncyId = nothing;
    end
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => safeString(order, "orderId"),
    Symbol("clientOrderId") => safeString(order, "clientOrderId"),
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("timestamp") => timestamp,
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => safeInteger(order, "updateTime"),
    Symbol("status") => self.parseOrderStatus(status),
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => type_var,
    Symbol("timeInForce") => timeInForce,
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("average") => average,
    Symbol("amount") => omitZero(safeString(order, "origQty")),
    Symbol("filled") => safeString(order, "executedQty"),
    Symbol("remaining") => nothing,
    Symbol("triggerPrice") => omitZero(safeString(order, "stopPrice")),
    Symbol("takeProfitPrice") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("cost") => omitZero(safeString2(order, "cumulativeQuoteQty", "cummulativeQuoteQty")),
    Symbol("trades") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("currency") => self.safeCurrencyCode(feeCurrncyId),
        Symbol("amount") => omitZero(safeString(order, "feeAmount"))
    ),
    Symbol("reduceOnly") => reduceOnly,
    Symbol("postOnly") => postOnly,
    Symbol("info") => order
), market = market)

end
function parseOrderSideAndReduceOnly(self::Hashkey, unparsed)
    parts = split(unparsed, "_");
    side = get(parts, 1, nothing);
    reduceOnly = nothing;
    secondPart = safeString(parts, 1);
    if functions.ccxtruthy(secondPart != nothing)
        if functions.ccxtruthy(secondPart == "open")
            reduceOnly = false;
        elseif functions.ccxtruthy((secondPart == "close"))
            reduceOnly = true;
        end
    end
    return [side, reduceOnly]

end
function parseOrderStatus(self::Hashkey, status)
    statuses = Dict{Symbol, Any}(
        Symbol("NEW") => "open",
        Symbol("PARTIALLY_FILLED") => "open",
        Symbol("PARTIALLY_CANCELED") => "canceled",
        Symbol("FILLED") => "closed",
        Symbol("CANCELED") => "canceled",
        Symbol("ORDER_CANCELED") => "canceled",
        Symbol("PENDING_CANCEL") => "canceled",
        Symbol("REJECTED") => "rejected",
        Symbol("ORDER_NEW") => "open"
    );
    return safeString(statuses, status, status)

end
function parseOrderTypeTimeInForceAndPostOnly(self::Hashkey, type_var, timeInForce)
    postOnly = nothing;
    if functions.ccxtruthy(type_var == "LIMIT_MAKER")
        postOnly = true;
    elseif functions.ccxtruthy(@functions.ccxt_or((timeInForce == "LIMIT_MAKER"), (timeInForce == "MAKER")))
        postOnly = true;
        timeInForce = "PO";
    end
    type_var = self.parseOrderType(type_var);
    return [type_var, timeInForce, postOnly]

end
function parseOrderType(self::Hashkey, type_var)
    types = Dict{Symbol, Any}(
        Symbol("MARKET") => "market",
        Symbol("LIMIT") => "limit",
        Symbol("LIMIT_MAKER") => "limit",
        Symbol("MARKET_OF_BASE") => "market"
    );
    return safeString(types, type_var, type_var)

end
"""
fetch the current funding rate
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
function fetchFundingRate(self::Hashkey, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("timestamp") => milliseconds()
    );
    response = Base.fetch(self.publicGetApiV1FuturesFundingRate(extend(request, params)));
    rate = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseFundingRate(rate, market = market)

end
"""
fetch the funding rate for multiple markets
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-funding-rate

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
function fetchFundingRates(self::Hashkey; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    symbols = self.marketSymbols(symbols = symbols);
    request = Dict{Symbol, Any}(
        Symbol("timestamp") => milliseconds()
    );
    response = Base.fetch(self.publicGetApiV1FuturesFundingRate(extend(request, params)));
    return self.parseFundingRates(response, symbols = symbols)

end
function parseFundingRate(self::Hashkey, contract; market=nothing)
    marketId = safeString(contract, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "swap");
    fundingRate = self.safeNumber(contract, "rate");
    fundingTimestamp = safeInteger(contract, "nextSettleTime");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => fundingRate,
    Symbol("fundingTimestamp") => nothing,
    Symbol("fundingDatetime") => nothing,
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => fundingTimestamp,
    Symbol("nextFundingDatetime") => self.iso8601(fundingTimestamp),
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
"""
fetches historical funding rate prices
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-history-funding-rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fromId`::int, optional: the id of the entry to start from
- `params.endId`::int, optional: the id of the entry to end with

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
function fetchFundingRateHistory(self::Hashkey; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
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
    response = Base.fetch(self.publicGetApiV1FuturesHistoryFundingRate(extend(request, params)));
    rates = [];
    rows = toArray(response);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(rows)))
        entry = get(rows, i + 1, nothing);
        timestamp = safeInteger(entry, "settleTime");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => self.safeSymbol(safeString(entry, "symbol"), market = market, delimiter = nothing, marketType = "swap"),
    Symbol("fundingRate") => self.safeNumber(entry, "settleRate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySinceLimit(sorted, since = since, limit = limit)

end
"""
fetch open positions for a market fetch all open positions
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string, optional: 'LONG' or 'SHORT' - the direction of the position (if not provided, positions for both sides will be returned)

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositions(self::Hashkey; symbols=nothing, params=Dict())
    methodName = "fetchPositions";
    if functions.ccxtruthy((symbols == nothing))
        throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a symbol argument with one single market symbol")));
    else
        symbolsLength = length(symbols);
        if functions.ccxtruthy(symbolsLength != 1)
            throw(NotSupported(string(self.id, " ", methodName, "() is supported for a symbol argument with one single market symbol only")));
        end
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    return Base.fetch(self.fetchPositionsForSymbol(get(symbols, 1, nothing), params = extend(Dict{Symbol, Any}(
    Symbol("methodName") => "fetchPositions"
), params)))

end
"""
fetch open positions for a single market fetch all open positions for specific symbol
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-positions

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string, optional: 'LONG' or 'SHORT' - the direction of the position (if not provided, positions for both sides will be returned)

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
function fetchPositionsForSymbol(self::Hashkey, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    methodName = "fetchPosition";
    (methodName, params) = self.handleParamString(params, "methodName", defaultValue = methodName);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(NotSupported(string(self.id, " ", methodName, "() supports swap markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetApiV1FuturesPositions(extend(request, params)));
    return self.parsePositions(response, symbols = [symbol])

end
function parsePosition(self::Hashkey, position; market=nothing)
    marketId = safeString(position, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    symbol = get(market, Symbol("symbol"), nothing);
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("id") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("contracts") => self.safeNumber(position, "position"),
    Symbol("contractSize") => nothing,
    Symbol("side") => safeStringLower(position, "side"),
    Symbol("notional") => self.safeNumber(position, "positionValue"),
    Symbol("leverage") => safeInteger(position, "leverage"),
    Symbol("unrealizedPnl") => self.safeNumber(position, "unrealizedPnL"),
    Symbol("realizedPnl") => self.safeNumber(position, "realizedPnL"),
    Symbol("collateral") => nothing,
    Symbol("entryPrice") => self.safeNumber(position, "avgPrice"),
    Symbol("markPrice") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidationPrice"),
    Symbol("marginMode") => "cross",
    Symbol("hedged") => true,
    Symbol("maintenanceMargin") => self.safeNumber(position, "minMargin"),
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("initialMargin") => self.safeNumber(position, "margin"),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("marginRatio") => nothing,
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("lastPrice") => self.safeNumber(position, "lastPrice"),
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing,
    Symbol("percentage") => nothing,
    Symbol("info") => position
))

end
"""
fetch the set leverage for a market
see: https://hashkeyglobal-apidoc.readme.io/reference/query-futures-leverage-trade

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
function fetchLeverage(self::Hashkey, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.privateGetApiV1FuturesLeverage(extend(request, params)));
    leverage = self.safeDict(response, 0, defaultValue = Dict{Symbol, Any}());
    return self.parseLeverage(leverage, market = market)

end
function parseLeverage(self::Hashkey, leverage; market=nothing)
    marginMode = safeStringLower(leverage, "marginType");
    leverageValue = self.safeNumber(leverage, "leverage");
    return Dict{Symbol, Any}(
    Symbol("info") => leverage,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("marginMode") => marginMode,
    Symbol("longLeverage") => leverageValue,
    Symbol("shortLeverage") => leverageValue
)

end
"""
set the level of leverage for a market
see: https://hashkeyglobal-apidoc.readme.io/reference/change-futures-leverage-trade

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setLeverage(self::Hashkey, leverage; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setLeverage() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}(
        Symbol("leverage") => leverage
    );
    market = self.market(symbol);
    request[Symbol("symbol")] = get(market, Symbol("id"), nothing);
    response = Base.fetch(self.privatePostApiV1FuturesLeverage(extend(request, params)));
    return self.parseLeverage(response, market = market)

end
"""
set margin mode to 'cross' or 'isolated'
see: https://hashkeyglobal-apidoc.readme.io/reference/change-margin-type

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
function setMarginMode(self::Hashkey, marginMode; symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " setMarginMode() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    marginMode = uppercase(marginMode);
    if functions.ccxtruthy(marginMode == "CROSSED")
        marginMode = "CROSS";
    end
    if functions.ccxtruthy(@functions.ccxt_and((marginMode != "CROSS"), (marginMode != "ISOLATED")))
        throw(ArgumentsRequired(string(self.id, " setMarginMode() marginMode must be either cross or isolated")));
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " setMarginMode() supports swap markets only")));
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("marginType") => marginMode
    );
    return Base.fetch(self.privatePostApiV1FuturesMarginType(extend(request, params)))

end
"""
add margin
see: https://hashkeyglobal-apidoc.readme.io/reference/modify-isolated-position-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string: position side, either 'long' or 'short'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function addMargin(self::Hashkey, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "add", params = params))

end
"""
remove margin from a position
see: https://hashkeyglobal-apidoc.readme.io/reference/modify-isolated-position-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string: position side, either 'long' or 'short'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
function reduceMargin(self::Hashkey, symbol, amount; params=Dict())
    return Base.fetch(self.modifyMarginHelper(symbol, amount, "reduce", params = params))

end
function modifyMarginHelper(self::Hashkey, symbol, amount, type_var; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("swap"), nothing)))
        throw(BadSymbol(string(self.id, " modifyMarginHelper() supports swap markets only")));
    end
    side = nothing;
    (side, params) = self.handleParamString(params, "side");
    if functions.ccxtruthy(side == nothing)
        throw(ArgumentsRequired(string(self.id, " ", type_var, "Margin() requires a params[\"side\"] argument, either \"long\" or \"short\"")));
    end
    side = uppercase(side);
    if functions.ccxtruthy(@functions.ccxt_and((side != "LONG"), (side != "SHORT")))
        throw(ArgumentsRequired(string(self.id, " ", type_var, "Margin() params[\"side\"] must be either long or short")));
    end
    amountString = numberToString(amount);
    if functions.ccxtruthy(type_var == "reduce")
        amountString = stringMul(amountString, "-1");
    end
    request = Dict{Symbol, Any}(
        Symbol("symbol") => get(market, Symbol("id"), nothing),
        Symbol("side") => side,
        Symbol("amount") => amountString
    );
    response = Base.fetch(self.privatePostApiV1FuturesPositionMargin(extend(request, params)));
    return extend(self.parseMarginModification(response, market = market), Dict{Symbol, Any}(
    Symbol("type") => type_var,
    Symbol("amount") => amount
))

end
function parseMarginModification(self::Hashkey, data; market=nothing)
    marketId = safeString(data, "symbol");
    market = self.safeMarket(marketId = marketId, market = market, delimiter = nothing, marketType = "swap");
    timestamp = safeInteger(data, "timestamp");
    errorCode = safeString(data, "code");
    success = errorCode == "0000";
    return Dict{Symbol, Any}(
    Symbol("info") => data,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("type") => nothing,
    Symbol("marginMode") => "isolated",
    Symbol("amount") => nothing,
    Symbol("total") => self.safeNumber(data, "margin"),
    Symbol("code") => get(market, Symbol("settle"), nothing),
    Symbol("status") => functions.ccxtruthy((success)) ? "ok" : "failed",
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
)

end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
see: https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
function fetchLeverageTiers(self::Hashkey; symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.publicGetApiV1ExchangeInfo(params));
    data = self.safeList(response, "contracts", defaultValue = []);
    symbols = self.marketSymbols(symbols = symbols);
    return self.parseLeverageTiers(data, symbols = symbols, marketIdKey = "symbol")

end
function parseMarketLeverageTiers(self::Hashkey, info; market=nothing)
    riskLimits = self.safeList(info, "riskLimits", defaultValue = []);
    marketId = safeString(info, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    tiers = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(riskLimits)))
        tier = get(riskLimits, i + 1, nothing);
        initialMarginRate = safeString(tier, "initialMargin");
        push!(tiers, Dict{Symbol, Any}(
    Symbol("tier") => self.sum(i, 1),
    Symbol("symbol") => self.safeSymbol(marketId, market = market),
    Symbol("currency") => get(market, Symbol("settle"), nothing),
    Symbol("minNotional") => nothing,
    Symbol("maxNotional") => self.safeNumber(tier, "quantity"),
    Symbol("maintenanceMarginRate") => self.safeNumber(tier, "maintMargin"),
    Symbol("maxLeverage") => self.parseNumber(stringDiv("1", initialMarginRate)),
    Symbol("info") => tier
));
        i += 1
    end
    return tiers

end
"""
fetch the trading fees for a market
see: https://hashkeyglobal-apidoc.readme.io/reference/get-vip-information // spot
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-commission-rate-request-weight // swap

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
function fetchTradingFee(self::Hashkey, symbol; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    methodName = "fetchTradingFee";
    response = nothing;
    if functions.ccxtruthy(get(market, Symbol("spot"), nothing))
        response = Base.fetch(self.fetchTradingFees(params = params));
            return self.safeDict(response, symbol)
    elseif functions.ccxtruthy(get(market, Symbol("swap"), nothing))
        response = Base.fetch(self.privateGetApiV1FuturesCommissionRate(extend(Dict{Symbol, Any}(
    Symbol("symbol") => get(market, Symbol("id"), nothing)
), params)));
        return self.parseTradingFee(response, market = market)
    else
        throw(NotSupported(string(self.id, " ", methodName, "() is not supported for ", get(market, Symbol("type"), nothing), " type of markets")));
    end

end
"""
*for spot markets only* fetch the trading fees for multiple markets
see: https://hashkeyglobal-apidoc.readme.io/reference/get-vip-information

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
function fetchTradingFees(self::Hashkey; params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    response = Base.fetch(self.privateGetApiV1AccountVipInfo(params));
    data = self.safeList(response, "data", defaultValue = []);
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        fee = self.safeDict(data, i, defaultValue = Dict{Symbol, Any}());
        parsedFee = self.parseTradingFee(fee);
        result[Symbol(parsedFee[Symbol("symbol")])] = parsedFee;
        i += 1
    end
    return result

end
function parseTradingFee(self::Hashkey, fee; market=nothing)
    marketId = safeString(fee, "symbol");
    market = self.safeMarket(marketId = marketId, market = market);
    return Dict{Symbol, Any}(
    Symbol("info") => fee,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("maker") => self.safeNumber2(fee, "openMakerFee", "actualMakerRate"),
    Symbol("taker") => self.safeNumber2(fee, "openTakerFee", "actualTakerRate"),
    Symbol("percentage") => true,
    Symbol("tierBased") => true
)

end
function sign(self::Hashkey, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", path);
    query = nothing;
    if functions.ccxtruthy(api == "private")
        self.checkRequiredCredentials();
        timestamp = milliseconds();
        additionalParams = Dict{Symbol, Any}(
            Symbol("timestamp") => timestamp
        );
        recvWindow = safeInteger(self.options, "recvWindow");
        if functions.ccxtruthy(recvWindow != nothing)
            additionalParams[Symbol("recvWindow")] = recvWindow;
        end
        headers = Dict{Symbol, Any}(
            Symbol("X-HK-APIKEY") => self.apiKey,
            Symbol("Content-Type") => "application/x-www-form-urlencoded"
        );
        signature = nothing;
        if functions.ccxtruthy(@functions.ccxt_and((method == "POST"), (@functions.ccxt_or((path == "api/v1/spot/batchOrders"), (path == "api/v1/futures/batchOrders")))))
            headers[Symbol("Content-Type")] = "application/json";
            body = json(self.safeList(params, "orders"));
            signature = self.hmac(self.encode(self.customUrlencode(params = additionalParams)), self.encode(self.secret), sha256);
            query = self.customUrlencode(params = extend(additionalParams, Dict{Symbol, Any}(
    Symbol("signature") => signature
)));
            url += string("?", query);
        else
            totalParams = extend(additionalParams, params);
            signature = self.hmac(self.encode(self.customUrlencode(params = totalParams)), self.encode(self.secret), sha256);
            totalParams[Symbol("signature")] = signature;
            query = self.customUrlencode(params = totalParams);
            if functions.ccxtruthy(method == "GET")
                url += string("?", query);
            else
                body = query;
            end
        end
        headers[Symbol("INPUT-SOURCE")] = safeString(self.options, "broker", "10000700011");
        headers[Symbol("broker_sign")] = signature;
    else
        query = self.urlencode(params);
        if functions.ccxtruthy(length(query) != 0)
            url += string("?", query);
        end
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end
function customUrlencode(self::Hashkey; params=Dict())
    result = self.urlencode(params);
    result = replace(result, "%2C" => ",");
    return result

end
function handleErrors(self::Hashkey, code, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(response == nothing)
            return nothing
    end
    errorInArray = false;
    responseCodeString = safeString(response, "code");
    responseCodeInteger = safeInteger(response, "code");
    if functions.ccxtruthy(responseCodeInteger == 0)
        result = self.safeList(response, "result", defaultValue = []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(result)))
            entry = self.safeDict(result, i);
            entryCodeInteger = safeInteger(entry, "code");
            if functions.ccxtruthy(entryCodeInteger != 0)
                errorInArray = true;
                responseCodeString = safeString(entry, "code");
            end
            i += 1
        end

    end
    if functions.ccxtruthy(@functions.ccxt_or((code != 200), errorInArray))
        feedback = string(self.id, " ", body);
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), responseCodeString, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), responseCodeString, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Hashkey, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetApiV1ExchangeInfo(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/exchangeInfo"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuoteV1Depth(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "quote/v1/depth"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuoteV1Trades(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "quote/v1/trades"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuoteV1Klines(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "quote/v1/klines"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuoteV1Ticker24hr(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "quote/v1/ticker/24hr"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuoteV1TickerPrice(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "quote/v1/ticker/price"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuoteV1TickerBookTicker(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "quote/v1/ticker/bookTicker"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuoteV1DepthMerged(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "quote/v1/depth/merged"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuoteV1MarkPrice(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "quote/v1/markPrice"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetQuoteV1Index(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "quote/v1/index"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV1FuturesFundingRate(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/fundingRate"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV1FuturesHistoryFundingRate(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/historyFundingRate"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV1Ping(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/ping"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function publicGetApiV1Time(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/time"; api="public", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1SpotOrder(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1SpotOpenOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/openOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1SpotTradeOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/tradeOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesLeverage(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/leverage"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesOrder(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/order"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesOpenOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/openOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesUserTrades(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/userTrades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesPositions(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/positions"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesHistoryOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/historyOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesBalance(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/balance"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesLiquidationAssignStatus(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/liquidationAssignStatus"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesRiskLimit(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/riskLimit"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesCommissionRate(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/commissionRate"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesGetBestOrder(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/getBestOrder"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1CoinInfo(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/coinInfo"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1AccountVipInfo(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/vipInfo"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1Account(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1AccountTrades(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1AccountType(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/type"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1AccountChainType(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/chainType"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1AccountCheckApiKey(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/checkApiKey"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1AccountBalanceFlow(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/balanceFlow"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1SpotSubAccountOpenOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/subAccount/openOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1SpotSubAccountTradeOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/subAccount/tradeOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1SubAccountTrades(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/subAccount/trades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesSubAccountOpenOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/subAccount/openOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesSubAccountHistoryOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/subAccount/historyOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1FuturesSubAccountUserTrades(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/subAccount/userTrades"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1AccountDepositAddress(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/deposit/address"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1AccountDepositOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/depositOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateGetApiV1AccountWithdrawOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/withdrawOrders"; api="private", method="GET", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1UserDataStream(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/userDataStream"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1SpotOrderTest(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/orderTest"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1SpotOrder(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV11SpotOrder(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1.1/spot/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1SpotBatchOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/batchOrders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1FuturesLeverage(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/leverage"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1FuturesOrder(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/order"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1FuturesMarginType(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/marginType"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1FuturesPositionMargin(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/positionMargin"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1FuturesPositionTradingStop(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/position/trading-stop"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1FuturesBatchOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/batchOrders"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1AccountAssetTransfer(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/assetTransfer"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1AccountAuthAddress(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/authAddress"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePostApiV1AccountWithdraw(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/account/withdraw"; api="private", method="POST", params=params, headers=nothing, body=nothing, config=Dict())
end

function privatePutApiV1UserDataStream(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/userDataStream"; api="private", method="PUT", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteApiV1SpotOrder(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/order"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteApiV1SpotOpenOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/openOrders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteApiV1SpotCancelOrderByIds(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/spot/cancelOrderByIds"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteApiV1FuturesOrder(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/order"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteApiV1FuturesBatchOrders(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/batchOrders"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteApiV1FuturesCancelOrderByIds(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/futures/cancelOrderByIds"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function privateDeleteApiV1UserDataStream(self::Hashkey, params=Dict(), context=Dict())
    return request(self, "api/v1/userDataStream"; api="private", method="DELETE", params=params, headers=nothing, body=nothing, config=Dict())
end

function Hashkey(; kwargs...)
    inst = Hashkey(Exchange(), describe, fetchTime, fetchStatus, fetchMarkets, parseMarket, fetchCurrencies, parseCurrency, fetchOrderBook, fetchTrades, fetchMyTrades, parseTrade, fetchOHLCV, parseOHLCV, fetchTicker, fetchTickers, parseTicker, fetchLastPrices, parseLastPrice, fetchBalance, parseBalance, parseSwapBalance, fetchDepositAddress, parseDepositAddress, fetchDeposits, fetchWithdrawals, withdraw, parseTransaction, parseTransactionStatus, transfer, parseTransfer, fetchAccounts, parseAccount, parseAccountType, encodeAccountType, encodeFlowType, fetchLedger, parseLedgerEntryType, parseLedgerEntry, createOrder, createMarketBuyOrderWithCost, createSpotOrder, createOrderRequest, createSpotOrderRequest, createSwapOrderRequest, createSwapOrder, createOrders, cancelOrder, cancelAllOrders, cancelOrders, fetchOrder, fetchOpenOrders, fetchOpenSpotOrders, fetchOpenSwapOrders, fetchCanceledAndClosedOrders, checkTypeParam, handleTriggerOptionAndParams, parseOrder, parseOrderSideAndReduceOnly, parseOrderStatus, parseOrderTypeTimeInForceAndPostOnly, parseOrderType, fetchFundingRate, fetchFundingRates, parseFundingRate, fetchFundingRateHistory, fetchPositions, fetchPositionsForSymbol, parsePosition, fetchLeverage, parseLeverage, setLeverage, setMarginMode, addMargin, reduceMargin, modifyMarginHelper, parseMarginModification, fetchLeverageTiers, parseMarketLeverageTiers, fetchTradingFee, fetchTradingFees, parseTradingFee, sign, customUrlencode, handleErrors, publicGetApiV1ExchangeInfo, publicGetQuoteV1Depth, publicGetQuoteV1Trades, publicGetQuoteV1Klines, publicGetQuoteV1Ticker24hr, publicGetQuoteV1TickerPrice, publicGetQuoteV1TickerBookTicker, publicGetQuoteV1DepthMerged, publicGetQuoteV1MarkPrice, publicGetQuoteV1Index, publicGetApiV1FuturesFundingRate, publicGetApiV1FuturesHistoryFundingRate, publicGetApiV1Ping, publicGetApiV1Time, privateGetApiV1SpotOrder, privateGetApiV1SpotOpenOrders, privateGetApiV1SpotTradeOrders, privateGetApiV1FuturesLeverage, privateGetApiV1FuturesOrder, privateGetApiV1FuturesOpenOrders, privateGetApiV1FuturesUserTrades, privateGetApiV1FuturesPositions, privateGetApiV1FuturesHistoryOrders, privateGetApiV1FuturesBalance, privateGetApiV1FuturesLiquidationAssignStatus, privateGetApiV1FuturesRiskLimit, privateGetApiV1FuturesCommissionRate, privateGetApiV1FuturesGetBestOrder, privateGetApiV1CoinInfo, privateGetApiV1AccountVipInfo, privateGetApiV1Account, privateGetApiV1AccountTrades, privateGetApiV1AccountType, privateGetApiV1AccountChainType, privateGetApiV1AccountCheckApiKey, privateGetApiV1AccountBalanceFlow, privateGetApiV1SpotSubAccountOpenOrders, privateGetApiV1SpotSubAccountTradeOrders, privateGetApiV1SubAccountTrades, privateGetApiV1FuturesSubAccountOpenOrders, privateGetApiV1FuturesSubAccountHistoryOrders, privateGetApiV1FuturesSubAccountUserTrades, privateGetApiV1AccountDepositAddress, privateGetApiV1AccountDepositOrders, privateGetApiV1AccountWithdrawOrders, privatePostApiV1UserDataStream, privatePostApiV1SpotOrderTest, privatePostApiV1SpotOrder, privatePostApiV11SpotOrder, privatePostApiV1SpotBatchOrders, privatePostApiV1FuturesLeverage, privatePostApiV1FuturesOrder, privatePostApiV1FuturesMarginType, privatePostApiV1FuturesPositionMargin, privatePostApiV1FuturesPositionTradingStop, privatePostApiV1FuturesBatchOrders, privatePostApiV1AccountAssetTransfer, privatePostApiV1AccountAuthAddress, privatePostApiV1AccountWithdraw, privatePutApiV1UserDataStream, privateDeleteApiV1SpotOrder, privateDeleteApiV1SpotOpenOrders, privateDeleteApiV1SpotCancelOrderByIds, privateDeleteApiV1FuturesOrder, privateDeleteApiV1FuturesBatchOrders, privateDeleteApiV1FuturesCancelOrderByIds, privateDeleteApiV1UserDataStream)
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
function __ccxt_doc_Hashkey_fetchTime() end
"""
fetches the current integer timestamp in milliseconds from the exchange server
see: https://hashkeyglobal-apidoc.readme.io/reference/check-server-time

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- the current integer timestamp in milliseconds from the exchange server
"""
__ccxt_doc_Hashkey_fetchTime

function __ccxt_doc_Hashkey_fetchStatus() end
"""
the latest known information on the availability of the exchange API
see: https://hashkeyglobal-apidoc.readme.io/reference/test-connectivity

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
"""
__ccxt_doc_Hashkey_fetchStatus

function __ccxt_doc_Hashkey_fetchMarkets() end
"""
retrieves data on all markets for the exchange
see: https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.symbol`::string, optional: the id of the market to fetch

# Returns
- an array of objects representing market data
"""
__ccxt_doc_Hashkey_fetchMarkets

function __ccxt_doc_Hashkey_fetchCurrencies() end
"""
fetches all available currencies on an exchange
see: https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an associative dictionary of currencies
"""
__ccxt_doc_Hashkey_fetchCurrencies

function __ccxt_doc_Hashkey_fetchOrderBook() end
"""
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
see: https://hashkeyglobal-apidoc.readme.io/reference/get-order-book

# Arguments
- `symbol`::string: unified symbol of the market to fetch the order book for
- `limit`::int, optional: the maximum amount of order book entries to return (maximum value is 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
"""
__ccxt_doc_Hashkey_fetchOrderBook

function __ccxt_doc_Hashkey_fetchTrades() end
"""
get the list of most recent trades for a particular symbol
see: https://hashkeyglobal-apidoc.readme.io/reference/get-recent-trade-list

# Arguments
- `symbol`::string: unified symbol of the market to fetch trades for
- `since`::int, optional: timestamp in ms of the earliest trade to fetch
- `limit`::int, optional: the maximum amount of trades to fetch (maximum value is 100)
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
"""
__ccxt_doc_Hashkey_fetchTrades

function __ccxt_doc_Hashkey_fetchMyTrades() end
"""
fetch all trades made by the user
see: https://hashkeyglobal-apidoc.readme.io/reference/get-account-trade-list
see: https://hashkeyglobal-apidoc.readme.io/reference/query-futures-trades
see: https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-user

# Arguments
- `symbol`::string: *is mandatory for swap markets* unified market symbol
- `since`::int, optional: the earliest time in ms to fetch trades for
- `limit`::int, optional: the maximum amount of trades to fetch (default 200, max 500)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch trades for (default 'spot')
- `params.until`::int, optional: the latest time in ms to fetch trades for, only supports the last 30 days timeframe
- `params.fromId`::string, optional: srarting trade id
- `params.toId`::string, optional: ending trade id
- `params.clientOrderId`::string, optional: *spot markets only* filter trades by orderId
- `params.accountId`::string, optional: account id to fetch the orders from

# Returns
- a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
"""
__ccxt_doc_Hashkey_fetchMyTrades

function __ccxt_doc_Hashkey_fetchOHLCV() end
"""
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
see: https://hashkeyglobal-apidoc.readme.io/reference/get-kline

# Arguments
- `symbol`::string: unified symbol of the market to fetch OHLCV data for
- `timeframe`::string: the length of time each candle represents
- `since`::int, optional: timestamp in ms of the earliest candle to fetch
- `limit`::int, optional: the maximum amount of candles to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: timestamp in ms of the latest candle to fetch
- `params.paginate`::bool, optional: default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)

# Returns
- A list of candles ordered as timestamp, open, high, low, close, volume
"""
__ccxt_doc_Hashkey_fetchOHLCV

function __ccxt_doc_Hashkey_fetchTicker() end
"""
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
see: https://hashkeyglobal-apidoc.readme.io/reference/get-24hr-ticker-price-change

# Arguments
- `symbol`::string: unified symbol of the market to fetch the ticker for
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Hashkey_fetchTicker

function __ccxt_doc_Hashkey_fetchTickers() end
"""
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
see: https://hashkeyglobal-apidoc.readme.io/reference/get-24hr-ticker-price-change

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Hashkey_fetchTickers

function __ccxt_doc_Hashkey_fetchLastPrices() end
"""
fetches the last price for multiple markets
see: https://hashkeyglobal-apidoc.readme.io/reference/get-symbol-price-ticker

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the last prices
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.symbol`::string, optional: the id of the market to fetch last price for

# Returns
- a dictionary of lastprices structures
"""
__ccxt_doc_Hashkey_fetchLastPrices

function __ccxt_doc_Hashkey_fetchBalance() end
"""
query for balance and get the amount of funds available for trading or funds locked in orders
see: https://hashkeyglobal-apidoc.readme.io/reference/get-account-information

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.accountId`::string, optional: account ID, for Master Key only
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch balance for (default 'spot')

# Returns
- a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
"""
__ccxt_doc_Hashkey_fetchBalance

function __ccxt_doc_Hashkey_fetchDepositAddress() end
"""
fetch the deposit address for a currency associated with this account
see: https://hashkeyglobal-apidoc.readme.io/reference/get-deposit-address

# Arguments
- `code`::string: unified currency code (default is 'USDT')
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: network for fetch deposit address (default is 'ETH')

# Returns
- an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
"""
__ccxt_doc_Hashkey_fetchDepositAddress

function __ccxt_doc_Hashkey_fetchDeposits() end
"""
fetch all deposits made to an account
see: https://hashkeyglobal-apidoc.readme.io/reference/get-deposit-history

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for (default 24 hours ago)
- `limit`::int, optional: the maximum number of transfer structures to retrieve (default 50, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch transfers for (default time now)
- `params.fromId`::int, optional: starting ID (To be released)

# Returns
- a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Hashkey_fetchDeposits

function __ccxt_doc_Hashkey_fetchWithdrawals() end
"""
fetch all withdrawals made from an account
see: https://hashkeyglobal-apidoc.readme.io/reference/withdrawal-records

# Arguments
- `code`::string: unified currency code of the currency transferred
- `since`::int, optional: the earliest time in ms to fetch transfers for (default 24 hours ago)
- `limit`::int, optional: the maximum number of transfer structures to retrieve (default 50, max 200)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch transfers for (default time now)

# Returns
- a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hashkey_fetchWithdrawals

function __ccxt_doc_Hashkey_withdraw() end
"""
make a withdrawal
see: https://hashkeyglobal-apidoc.readme.io/reference/withdraw

# Arguments
- `code`::string: unified currency code
- `amount`::float: the amount to withdraw
- `address`::string: the address to withdraw to
- `tag`::string:
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.network`::string, optional: network for withdraw
- `params.clientOrderId`::string, optional: client order id
- `params.platform`::string, optional: the platform to withdraw to (hashkey, HashKey HK)

# Returns
- a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
"""
__ccxt_doc_Hashkey_withdraw

function __ccxt_doc_Hashkey_transfer() end
"""
transfer currency internally between wallets on the same account
see: https://hashkeyglobal-apidoc.readme.io/reference/new-account-transfer

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account id to transfer from
- `toAccount`::string: account id to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.clientOrderId`::string, optional: a unique id for the transfer
- `params.remark`::string, optional: a note for the transfer

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Hashkey_transfer

function __ccxt_doc_Hashkey_fetchAccounts() end
"""
fetch all the accounts associated with a profile
see: https://hashkeyglobal-apidoc.readme.io/reference/query-sub-account

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
"""
__ccxt_doc_Hashkey_fetchAccounts

function __ccxt_doc_Hashkey_fetchLedger() end
"""
fetch the history of changes, actions done by the user or operations that altered the balance of the user
see: https://hashkeyglobal-apidoc.readme.io/reference/get-account-transaction-list

# Arguments
- `code`::string, optional: unified currency code, default is undefined (not used)
- `since`::int, optional: timestamp in ms of the earliest ledger entry, default is undefined
- `limit`::int, optional: max number of ledger entries to return, default is undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for
- `params.flowType`::int, optional: trade, fee, transfer, deposit, withdrawal
- `params.accountType`::int, optional: spot, swap, custody

# Returns
- a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
"""
__ccxt_doc_Hashkey_fetchLedger

function __ccxt_doc_Hashkey_createOrder() end
"""
create a trade order
see: https://hashkeyglobal-apidoc.readme.io/reference/test-new-order
see: https://hashkeyglobal-apidoc.readme.io/reference/create-order
see: https://hashkeyglobal-apidoc.readme.io/reference/create-new-futures-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'LIMIT_MAKER' for spot, 'market' or 'limit' or 'STOP' for swap
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of you want to trade in units of the base currency
- `price`::float, optional: the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cost`::float, optional: *spot market buy only* the quote quantity that can be used as an alternative for the amount
- `params.test`::bool, optional: *spot markets only* whether to use the test endpoint or not, default is false
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately
- `params.timeInForce`::string, optional: "GTC" or "IOC" or "PO" for spot, 'GTC' or 'FOK' or 'IOC' or 'LIMIT_MAKER' or 'PO' for swap
- `params.clientOrderId`::string, optional: a unique id for the order - is mandatory for swap
- `params.triggerPrice`::float, optional: *swap markets only* The price at which a trigger order is triggered at

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_createOrder

function __ccxt_doc_Hashkey_createMarketBuyOrderWithCost() end
"""
create a market buy order by providing the symbol and cost

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `cost`::float: how much you want to trade in units of the quote currency
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_createMarketBuyOrderWithCost

function __ccxt_doc_Hashkey_createSpotOrder() end
"""
create a trade order on spot market
see: https://hashkeyglobal-apidoc.readme.io/reference/test-new-order
see: https://hashkeyglobal-apidoc.readme.io/reference/create-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'LIMIT_MAKER'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of you want to trade in units of the base currency
- `price`::float, optional: the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.cost`::float, optional: *market buy only* the quote quantity that can be used as an alternative for the amount
- `params.test`::bool, optional: whether to use the test endpoint or not, default is false
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately
- `params.timeInForce`::string, optional: 'GTC', 'IOC', or 'PO'
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_createSpotOrder

function __ccxt_doc_Hashkey_createSwapOrder() end
"""
create a trade order on swap market
see: https://hashkeyglobal-apidoc.readme.io/reference/create-new-futures-order

# Arguments
- `symbol`::string: unified symbol of the market to create an order in
- `type`::string: 'market' or 'limit' or 'STOP'
- `side`::string: 'buy' or 'sell'
- `amount`::float: how much of you want to trade in units of the base currency
- `price`::float, optional: the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.postOnly`::bool, optional: if true, the order will only be posted to the order book and not executed immediately
- `params.reduceOnly`::bool, optional: true or false whether the order is reduce only
- `params.triggerPrice`::float, optional: The price at which a trigger order is triggered at
- `params.timeInForce`::string, optional: 'GTC', 'FOK', 'IOC', 'LIMIT_MAKER' or 'PO'
- `params.clientOrderId`::string, optional: a unique id for the order

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_createSwapOrder

function __ccxt_doc_Hashkey_createOrders() end
"""
create a list of trade orders (all orders should be of the same symbol)
see: https://hashkeyglobal-apidoc.readme.io/reference/create-multiple-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/batch-create-new-futures-order

# Arguments
- `orders`::array: list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
- `params`::object, optional: extra parameters specific to the api endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_createOrders

function __ccxt_doc_Hashkey_cancelOrder() end
"""
cancels an open order
see: https://hashkeyglobal-apidoc.readme.io/reference/cancel-order
see: https://hashkeyglobal-apidoc.readme.io/reference/cancel-futures-order

# Arguments
- `id`::string: order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
- `params.clientOrderId`::string, optional: a unique id for the order that can be used as an alternative for the id
- `params.trigger`::bool, optional: *swap markets only* true for canceling a trigger order (default false)
- `params.stop`::bool, optional: *swap markets only* an alternative for trigger param

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_cancelOrder

function __ccxt_doc_Hashkey_cancelAllOrders() end
"""
cancel all open orders
see: https://hashkeyglobal-apidoc.readme.io/reference/cancel-all-open-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/batch-cancel-futures-order

# Arguments
- `symbol`::string: unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string, optional: 'buy' or 'sell'

# Returns
- response from exchange
"""
__ccxt_doc_Hashkey_cancelAllOrders

function __ccxt_doc_Hashkey_cancelOrders() end
"""
cancel multiple orders
see: https://hashkeyglobal-apidoc.readme.io/reference/cancel-multiple-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/batch-cancel-futures-order-by-order-id

# Arguments
- `ids`::array: order ids
- `symbol`::string, optional: unified market symbol (not used by hashkey)
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')

# Returns
- an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_cancelOrders

function __ccxt_doc_Hashkey_fetchOrder() end
"""
fetches information on an order made by the user
see: https://hashkeyglobal-apidoc.readme.io/reference/query-order
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-order

# Arguments
- `id`::string: the order id
- `symbol`::string: unified symbol of the market the order was made in
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
- `params.clientOrderId`::string, optional: a unique id for the order that can be used as an alternative for the id
- `params.accountId`::string, optional: *spot markets only* account id to fetch the order from
- `params.trigger`::bool, optional: *swap markets only* true for fetching a trigger order (default false)
- `params.stop`::bool, optional: *swap markets only* an alternative for trigger param

# Returns
- An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_fetchOrder

function __ccxt_doc_Hashkey_fetchOpenOrders() end
"""
fetch all unfilled currently open orders
see: https://hashkeyglobal-apidoc.readme.io/reference/get-current-open-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-open-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/sub
see: https://hashkeyglobal-apidoc.readme.io/reference/query-open-futures-orders

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in - is mandatory for swap markets
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve - default 500, maximum 1000
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot')
- `params.orderId`::string, optional: *spot markets only* the id of the order to fetch
- `params.side`::string, optional: *spot markets only* 'buy' or 'sell' - the side of the orders to fetch
- `params.fromOrderId`::string, optional: *swap markets only* the id of the order to start from
- `params.trigger`::bool, optional: *swap markets only* true for fetching trigger orders (default false)
- `params.stop`::bool, optional: *swap markets only* an alternative for trigger param
- `params.accountId`::string, optional: account id to fetch the orders from

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_fetchOpenOrders

function __ccxt_doc_Hashkey_fetchOpenSpotOrders() end
"""
fetch all unfilled currently open orders for spot markets
see: https://hashkeyglobal-apidoc.readme.io/reference/get-current-open-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/sub

# Arguments
- `symbol`::string, optional: unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve - default 500, maximum 1000
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.orderId`::string, optional: the id of the order to fetch
- `params.side`::string, optional: 'buy' or 'sell' - the side of the orders to fetch
- `params.accountId`::string, optional: account id to fetch the orders from

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_fetchOpenSpotOrders

function __ccxt_doc_Hashkey_fetchOpenSwapOrders() end
"""
fetch all unfilled currently open orders for swap markets
see: https://hashkeyglobal-apidoc.readme.io/reference/query-open-futures-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-open-orders

# Arguments
- `symbol`::string: *is mandatory* unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve - maximum 500
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fromOrderId`::string, optional: the id of the order to start from
- `params.trigger`::bool, optional: true for fetching trigger orders (default false)
- `params.stop`::bool, optional: an alternative for trigger param
- `params.accountId`::string, optional: account id to fetch the orders from

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_fetchOpenSwapOrders

function __ccxt_doc_Hashkey_fetchCanceledAndClosedOrders() end
"""
fetches information on multiple canceled and closed orders made by the user
see: https://hashkeyglobal-apidoc.readme.io/reference/get-all-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/query-futures-history-orders
see: https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-history-orders

# Arguments
- `symbol`::string: *is mandatory for swap markets* unified market symbol of the market orders were made in
- `since`::int, optional: the earliest time in ms to fetch orders for
- `limit`::int, optional: the maximum number of order structures to retrieve - default 500, maximum 1000
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.until`::int, optional: the latest time in ms to fetch entries for - only supports the last 90 days timeframe
- `params.type`::string, optional: 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot')
- `params.orderId`::string, optional: *spot markets only* the id of the order to fetch
- `params.side`::string, optional: *spot markets only* 'buy' or 'sell' - the side of the orders to fetch
- `params.fromOrderId`::string, optional: *swap markets only* the id of the order to start from
- `params.trigger`::bool, optional: *swap markets only* the id of the order to start from true for fetching trigger orders (default false)
- `params.stop`::bool, optional: *swap markets only* the id of the order to start from an alternative for trigger param
- `params.accountId`::string, optional: account id to fetch the orders from

# Returns
- a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
"""
__ccxt_doc_Hashkey_fetchCanceledAndClosedOrders

function __ccxt_doc_Hashkey_fetchFundingRate() end
"""
fetch the current funding rate
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-funding-rate

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
"""
__ccxt_doc_Hashkey_fetchFundingRate

function __ccxt_doc_Hashkey_fetchFundingRates() end
"""
fetch the funding rate for multiple markets
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-funding-rate

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
"""
__ccxt_doc_Hashkey_fetchFundingRates

function __ccxt_doc_Hashkey_fetchFundingRateHistory() end
"""
fetches historical funding rate prices
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-history-funding-rate

# Arguments
- `symbol`::string: unified symbol of the market to fetch the funding rate history for
- `since`::int, optional: timestamp in ms of the earliest funding rate to fetch
- `limit`::int, optional: the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.fromId`::int, optional: the id of the entry to start from
- `params.endId`::int, optional: the id of the entry to end with

# Returns
- a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
"""
__ccxt_doc_Hashkey_fetchFundingRateHistory

function __ccxt_doc_Hashkey_fetchPositions() end
"""
fetch open positions for a market fetch all open positions
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-positions

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string, optional: 'LONG' or 'SHORT' - the direction of the position (if not provided, positions for both sides will be returned)

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Hashkey_fetchPositions

function __ccxt_doc_Hashkey_fetchPositionsForSymbol() end
"""
fetch open positions for a single market fetch all open positions for specific symbol
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-positions

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string, optional: 'LONG' or 'SHORT' - the direction of the position (if not provided, positions for both sides will be returned)

# Returns
- a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
"""
__ccxt_doc_Hashkey_fetchPositionsForSymbol

function __ccxt_doc_Hashkey_fetchLeverage() end
"""
fetch the set leverage for a market
see: https://hashkeyglobal-apidoc.readme.io/reference/query-futures-leverage-trade

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
"""
__ccxt_doc_Hashkey_fetchLeverage

function __ccxt_doc_Hashkey_setLeverage() end
"""
set the level of leverage for a market
see: https://hashkeyglobal-apidoc.readme.io/reference/change-futures-leverage-trade

# Arguments
- `leverage`::float: the rate of leverage
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Hashkey_setLeverage

function __ccxt_doc_Hashkey_setMarginMode() end
"""
set margin mode to 'cross' or 'isolated'
see: https://hashkeyglobal-apidoc.readme.io/reference/change-margin-type

# Arguments
- `marginMode`::string: 'cross' or 'isolated'
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- response from the exchange
"""
__ccxt_doc_Hashkey_setMarginMode

function __ccxt_doc_Hashkey_addMargin() end
"""
add margin
see: https://hashkeyglobal-apidoc.readme.io/reference/modify-isolated-position-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: amount of margin to add
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string: position side, either 'long' or 'short'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Hashkey_addMargin

function __ccxt_doc_Hashkey_reduceMargin() end
"""
remove margin from a position
see: https://hashkeyglobal-apidoc.readme.io/reference/modify-isolated-position-margin

# Arguments
- `symbol`::string: unified market symbol
- `amount`::float: the amount of margin to remove
- `params`::object, optional: extra parameters specific to the exchange API endpoint
- `params.side`::string: position side, either 'long' or 'short'

# Returns
- a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
"""
__ccxt_doc_Hashkey_reduceMargin

function __ccxt_doc_Hashkey_fetchLeverageTiers() end
"""
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
see: https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo

# Arguments
- `symbols`::any: list of unified market symbols
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
"""
__ccxt_doc_Hashkey_fetchLeverageTiers

function __ccxt_doc_Hashkey_fetchTradingFee() end
"""
fetch the trading fees for a market
see: https://hashkeyglobal-apidoc.readme.io/reference/get-vip-information // spot
see: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-commission-rate-request-weight // swap

# Arguments
- `symbol`::string: unified market symbol
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
"""
__ccxt_doc_Hashkey_fetchTradingFee

function __ccxt_doc_Hashkey_fetchTradingFees() end
"""
*for spot markets only* fetch the trading fees for multiple markets
see: https://hashkeyglobal-apidoc.readme.io/reference/get-vip-information

# Arguments
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
"""
__ccxt_doc_Hashkey_fetchTradingFees
